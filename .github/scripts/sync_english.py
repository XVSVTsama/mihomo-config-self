#!/usr/bin/env python3
"""Translate Chinese source files to English with Gemini first, DeepSeek fallback.

Pairs:
  mihomo.yaml        -> mihomo_en.yaml
  script_override.js -> script_override_en.js
  README.md          -> README_en.md

Provider rules:
- Start with Gemini.
- If Gemini fails on a file, fall back to DeepSeek for that file and lock all
  later files to DeepSeek.
- If the active provider fails without a fallback, stop immediately.
- English files are only replaced after local validation passes.
- Uses a manual translation glossary to maintain consistency.
"""

import json
import os
import socket
import subprocess
import sys
import tempfile
import time
import urllib.error
import urllib.request
from datetime import datetime
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
GLOSSARY_PATH = ROOT / ".github" / "translation_glossary.json"

PAIRS = [
    ("mihomo.yaml", "mihomo_en.yaml", "yaml"),
    ("script_override.js", "script_override_en.js", "js"),
    ("README.md", "README_en.md", "readme"),
]

# Keep chunks small enough for DeepSeek's final-answer output limit. Splitting at
# blank lines preserves comment/code structure more often than arbitrary cuts.
CHUNK_MAX_CHARS = 2000

GROUP_NAME_MAP = """Proxy group names must be translated as:
- "🔄 负载均衡" -> "🔄 Load Balance"
- "👉 手动切换" -> "👉 Manual Select"
- "♻️ 自动选择" -> "♻️ Auto Select"
- "🤖 AI大模型" -> "🤖 AI"
- "📲 Telegram" -> "📲 Telegram"
- "🎮 Games-Global" -> "🎮 Games-Global"
- "✖️ Twitter" -> "✖️ Twitter"
- "🎵 TikTok" -> "🎵 TikTok"
- "🌍 PROXY" -> "🌍 PROXY"
- "FCM" -> "FCM"
- "美国|住宅" -> "US|Residential"
"""


class ProviderError(Exception):
    def __init__(self, provider, message):
        self.provider = provider
        self.message = message


def log(msg):
    print("[%s] %s" % (datetime.now().strftime("%H:%M:%S"), msg))


def build_prompt(kind, glossary=None):
    glossary_str = ""
    if glossary:
        glossary_str = "\nTranslation Glossary (Priority):\n"
        for cn, en in glossary.items():
            glossary_str += f'- "{cn}" -> "{en}"\n'

    base_rules = f"""
Rules:
- Keep all code, YAML keys, JavaScript identifiers, URLs, regex filters and other functional values unchanged.
- Translate comments and user-facing text into natural English.
{GROUP_NAME_MAP}
{glossary_str}
- If the source text (especially comments) matches or is semantically similar to an entry in the Glossary, you MUST use the provided English translation.
- Keep emojis that are part of proxy group names.
- Do not wrap the output in markdown code fences.
- Return only the translated file content.
"""

    if kind == "readme":
        return f"""Translate the following GitHub README from Chinese to English.
Rules:
- Keep all markdown structure, links, code blocks, URLs, and badge URLs unchanged.
- Translate all user-facing text into natural English.
- The language switch line must become: English | [中文](README.md)
{glossary_str}
- If any section matches the Glossary, use the manual translation.
- Do not wrap the output in markdown code fences.
- Return only the translated file content.
"""
    return f"Translate the following file from Chinese to English.\n{base_rules}"


def strip_fences(text):
    text = text.strip()
    if text.startswith("```") and text.endswith("```"):
        lines = text.splitlines()
        if lines:
            lines = lines[1:]
        if lines and lines[-1].strip().startswith("```"):
            lines = lines[:-1]
        text = "\n".join(lines).strip()
    return text


def join_translated_chunks(chunks):
    """Join line-based translation chunks without merging adjacent lines."""
    if not chunks:
        return ""
    return "\n".join(chunk.rstrip("\r\n") for chunk in chunks) + "\n"


def update_js_block_state(line, in_block):
    """Track JS block comments across lines without parsing strings exactly."""
    index = 0
    while index < len(line):
        if in_block:
            if line[index:index + 2] == "*/":
                in_block = False
                index += 2
            else:
                index += 1
        else:
            if line[index:index + 2] == "//":
                break
            if line[index:index + 2] == "/*":
                in_block = True
                index += 2
            else:
                index += 1
    return in_block


def split_content(content, kind=None, max_chars=CHUNK_MAX_CHARS):
    """Split source content into safely-sized chunks for one-file translation."""
    if len(content) <= max_chars:
        return [content]

    lines = content.splitlines(keepends=True)
    if kind == "yaml":
        chunks = []
        current = ""
        for line in lines:
            is_top_level = line and not line[0].isspace() and not line.lstrip().startswith("#")
            if current and is_top_level and len(current) >= max_chars:
                chunks.append(current)
                current = ""
            current += line
        if current:
            chunks.append(current)
        return chunks

    chunks = []
    current = ""
    in_block = False

    for line in lines:
        if (
            current
            and len(current) + len(line) > max_chars
            and not line.strip()
            and not in_block
        ):
            chunks.append(current)
            current = ""
        current += line
        if kind == "js":
            in_block = update_js_block_state(line, in_block)

    if current:
        chunks.append(current)

    # Very long sections without a blank line still need a hard split.
    final_chunks = []
    for chunk in chunks:
        if len(chunk) <= max_chars:
            final_chunks.append(chunk)
            continue
        piece = ""
        in_block = False
        for line in chunk.splitlines(keepends=True):
            if (
                piece
                and len(piece) + len(line) > max_chars
                and not in_block
            ):
                final_chunks.append(piece)
                piece = ""
            piece += line
            if kind == "js":
                in_block = update_js_block_state(line, in_block)
        if piece:
            final_chunks.append(piece)
    return final_chunks


def contains_cjk(text):
    return any("\u4e00" <= char <= "\u9fff" for char in text)


def build_chunk_prompt(kind, glossary, chunk_index, total):
    prompt = build_prompt(kind, glossary)
    if total > 1:
        prompt += (
            "\n\nThis is chunk %d of %d. Translate only this chunk and return "
            "only the translated chunk, without code fences or explanations."
            % (chunk_index, total)
        )
    return prompt


def provider_label(provider):
    return "Gemini" if provider == "gemini" else "DeepSeek"


def provider_key(provider, gemini_key, deepseek_key):
    return gemini_key if provider == "gemini" else deepseek_key


def provider_model(provider, gemini_model, deepseek_model):
    return gemini_model if provider == "gemini" else deepseek_model


def sleep_before_retry(attempt, retry_after=None):
    if retry_after:
        try:
            wait = min(int(retry_after), 120)
        except ValueError:
            wait = min(2 ** attempt, 30)
    else:
        wait = min(2 ** attempt, 30)
    if wait > 0:
        time.sleep(wait)


def call_gemini(prompt, api_key, model, timeout):
    url = (
        "https://generativelanguage.googleapis.com/v1beta/models/%s"
        ":generateContent?key=%s" % (model, api_key)
    )
    payload = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {
            "temperature": 0.2,
            "maxOutputTokens": 8192,
        },
    }
    request = urllib.request.Request(
        url,
        data=json.dumps(payload).encode("utf-8"),
        headers={"Content-Type": "application/json"},
    )
    with urllib.request.urlopen(request, timeout=timeout) as response:
        body = json.loads(response.read().decode("utf-8"))
    try:
        candidate = body["candidates"][0]
        finish_reason = candidate.get("finishReason", "")
        if finish_reason and finish_reason != "STOP":
            raise ProviderError(
                "gemini",
                "output finished with finishReason=%s" % finish_reason,
            )
        return candidate["content"]["parts"][0]["text"].strip()
    except (KeyError, IndexError, TypeError) as exc:
        raise ProviderError(
            "gemini",
            "unexpected response: %s" % json.dumps(body)[:300],
        ) from exc


def call_deepseek(prompt, api_key, model, timeout):
    url = "https://api.deepseek.com/chat/completions"
    payload = {
        "model": model,
        "messages": [{"role": "user", "content": prompt}],
        "temperature": 0.2,
        "max_tokens": 8192,
    }
    request = urllib.request.Request(
        url,
        data=json.dumps(payload).encode("utf-8"),
        headers={
            "Content-Type": "application/json",
            "Authorization": "Bearer %s" % api_key,
        },
    )
    with urllib.request.urlopen(request, timeout=timeout) as response:
        body = json.loads(response.read().decode("utf-8"))
    try:
        choice = body["choices"][0]
        finish_reason = choice.get("finish_reason", "")
        if finish_reason == "length":
            raise ProviderError(
                "deepseek",
                "output truncated because finish_reason=length",
            )
        return choice["message"]["content"].strip()
    except (KeyError, IndexError, TypeError) as exc:
        raise ProviderError(
            "deepseek",
            "unexpected response: %s" % json.dumps(body)[:300],
        ) from exc


def call_provider(provider, prompt, api_key, model, timeout, max_attempts):
    last_error = None
    for attempt in range(1, max_attempts + 1):
        started = time.time()
        try:
            if provider == "gemini":
                text = call_gemini(prompt, api_key, model, timeout)
            else:
                text = call_deepseek(prompt, api_key, model, timeout)
            log("  attempt %d: OK (%.2fs)" % (attempt, time.time() - started))
            return text
        except urllib.error.HTTPError as exc:
            detail = exc.read().decode("utf-8", errors="replace")[:300]
            retry_after = exc.headers.get("Retry-After") if exc.headers else None
            if exc.code == 429:
                suffix = " retry-after: %ss" % retry_after if retry_after else ""
                log("  attempt %d: HTTP 429 (rate limited)%s" % (attempt, suffix))
                last_error = "HTTP 429: %s" % detail
                if attempt < max_attempts:
                    sleep_before_retry(attempt, retry_after)
                continue
            if exc.code in (500, 502, 503):
                log("  attempt %d: HTTP %d (server error)" % (attempt, exc.code))
                last_error = "HTTP %d: %s" % (exc.code, detail)
                if attempt < max_attempts:
                    sleep_before_retry(attempt)
                continue
            log("  attempt %d: HTTP %d (fatal)" % (attempt, exc.code))
            raise ProviderError(
                provider,
                "HTTP %d: %s" % (exc.code, detail),
            ) from exc
        except (socket.timeout, urllib.error.URLError) as exc:
            log("  attempt %d: TIMEOUT after %ds" % (attempt, timeout))
            last_error = "TIMEOUT after %ds: %s" % (timeout, exc)
            if attempt < max_attempts:
                sleep_before_retry(attempt)
    raise ProviderError(provider, last_error or "unknown failure")


def validate(text, kind):
    if not text.strip():
        return "translated file is empty"
    if kind == "yaml":
        try:
            import yaml

            parsed = yaml.safe_load(text)
            if not isinstance(parsed, dict):
                return "translated YAML is not a mapping"
        except Exception as exc:
            return "translated YAML is invalid: %s" % exc
    elif kind == "js":
        fd, tmp = tempfile.mkstemp(suffix=".js")
        try:
            with os.fdopen(fd, "w", encoding="utf-8") as fh:
                fh.write(text)
            proc = subprocess.run(
                ["node", "--check", tmp],
                capture_output=True,
                text=True,
                encoding="utf-8",
                check=False,
            )
            if proc.returncode != 0:
                return "translated JS failed node --check: %s" % proc.stderr[:500]
        finally:
            os.unlink(tmp)
    if kind in ("yaml", "js"):
        suffix = ".yaml" if kind == "yaml" else ".js"
        fd, tmp = tempfile.mkstemp(suffix=suffix)
        try:
            with os.fdopen(fd, "w", encoding="utf-8") as fh:
                fh.write(text)
            source_name = "mihomo.yaml" if kind == "yaml" else "script_override.js"
            checker = ROOT / ".github" / "scripts" / "check_code_sync.py"
            proc = subprocess.run(
                [sys.executable, str(checker), kind, str(ROOT / source_name), tmp],
                capture_output=True,
                text=True,
                encoding="utf-8",
                check=False,
            )
            if proc.returncode != 0:
                detail = (proc.stdout + proc.stderr).strip().splitlines()
                return "translated %s failed structural sync: %s" % (
                    kind,
                    detail[-1] if detail else "unknown difference",
                )
        finally:
            os.unlink(tmp)
    return None


def write_protected(path, text):
    tmp_path = path.with_name(".%s.tmp" % path.name)
    try:
        with open(tmp_path, "w", encoding="utf-8", newline="\n") as fh:
            fh.write(text)
            fh.flush()
            os.fsync(fh.fileno())
        os.replace(tmp_path, path)
    finally:
        if tmp_path.exists():
            tmp_path.unlink()


def stop(idx, total, src_name, dst_name, written, untouched):
    print(
        "::error::English sync stopped at %d/%d (%s -> %s)"
        % (idx, total, src_name, dst_name)
    )
    if written:
        print("  written so far: %s" % ", ".join(written))
    if untouched:
        print("  untouched: %s" % ", ".join(untouched))


def main():
    gemini_key = os.environ.get("GEMINI_API_KEY", "")
    deepseek_key = os.environ.get("DEEPSEEK_API_KEY", "")
    if not gemini_key and not deepseek_key:
        print("::error::Neither GEMINI_API_KEY nor DEEPSEEK_API_KEY is set")
        sys.exit(1)

    provider = "gemini" if gemini_key else "deepseek"
    if not gemini_key:
        print("::warning::GEMINI_API_KEY is not set; starting with DeepSeek")

    gemini_model = os.environ.get("GEMINI_MODEL", "gemini-2.0-flash")
    deepseek_model = os.environ.get("DEEPSEEK_MODEL", "deepseek-v4-flash").strip()
    if not deepseek_model.startswith("deepseek-"):
        print(
            "::warning::Invalid DEEPSEEK_MODEL=%s; using deepseek-v4-flash"
            % deepseek_model
        )
        deepseek_model = "deepseek-v4-flash"
    request_timeout = int(os.environ.get("SYNC_REQUEST_TIMEOUT", "60"))
    max_attempts = int(os.environ.get("SYNC_MAX_ATTEMPTS", "3"))
    file_timeout = int(os.environ.get("SYNC_FILE_TIMEOUT", "300"))

    # Load Glossary
    glossary = None
    if GLOSSARY_PATH.exists():
        try:
            glossary = json.loads(GLOSSARY_PATH.read_text(encoding="utf-8"))
            log(f"Loaded glossary with {len(glossary)} entries")
        except Exception as e:
            log(f"Warning: Failed to load glossary: {e}")

    written = []
    sync_targets = [
        name.strip()
        for name in os.environ.get("SYNC_TARGETS", "").split(",")
        if name.strip()
    ]
    pairs = PAIRS
    if sync_targets:
        pairs = [
            pair for pair in PAIRS if pair[0] in sync_targets
        ]
    untouched = [dst for _, dst, _ in pairs]
    total = len(pairs)
    switched = False

    for idx, (src_name, dst_name, kind) in enumerate(pairs, start=1):
        src_path = ROOT / src_name
        dst_path = ROOT / dst_name
        log("[%d/%d] %s -> %s" % (idx, total, src_name, dst_name))
        if not src_path.exists():
            stop(idx, total, src_name, dst_name, written, untouched)
            sys.exit(1)

        file_start = time.time()
        content = src_path.read_text(encoding="utf-8")
        chunks = split_content(content, kind)
        text = None
        used_provider = None
        invalid_attempts = 0

        while True:
            if time.time() - file_start > file_timeout:
                print(
                    "::error::File deadline exceeded (%ds > %ds) at %s"
                    % (time.time() - file_start, file_timeout, src_name)
                )
                stop(idx, total, src_name, dst_name, written, untouched)
                sys.exit(1)

            if provider == "deepseek" and switched:
                label = "DeepSeek (locked, Gemini skipped)"
            else:
                label = provider_label(provider)
            log(
                "  provider: %s (%s)"
                % (label, provider_model(provider, gemini_model, deepseek_model))
            )

            translated_chunks = []
            failed = False
            for chunk_index, chunk in enumerate(chunks, start=1):
                log(
                    "  translating chunk %d/%d (%d chars)"
                    % (chunk_index, len(chunks), len(chunk))
                )
                if not contains_cjk(chunk):
                    translated_chunks.append(chunk)
                    log("  skipped: no CJK text")
                    continue
                prompt = build_chunk_prompt(
                    kind,
                    glossary,
                    chunk_index,
                    len(chunks),
                )
                try:
                    raw = call_provider(
                        provider,
                        prompt + "\n\n" + chunk,
                        provider_key(provider, gemini_key, deepseek_key),
                        provider_model(provider, gemini_model, deepseek_model),
                        request_timeout,
                        max_attempts,
                    )
                    translated_chunks.append(strip_fences(raw))
                    used_provider = provider
                except ProviderError as exc:
                    log("  status: FAIL")
                    log("  error: %s" % exc.message)
                    if provider == "gemini" and deepseek_key:
                        log("  action: switching to DeepSeek")
                        print(
                            "::warning::Gemini failed for %s; switching to DeepSeek"
                            % src_name
                        )
                        provider = "deepseek"
                        switched = True
                        failed = True
                        break
                    log("  action: STOP")
                    stop(idx, total, src_name, dst_name, written, untouched)
                    sys.exit(1)

            if failed:
                continue

            text = join_translated_chunks(translated_chunks)

            error = validate(text, kind)
            if error:
                log("  status: INVALID")
                log("  error: %s" % error)
                if provider == "gemini" and deepseek_key:
                    log("  action: switching to DeepSeek")
                    print(
                        "::warning::Gemini result invalid for %s; switching to DeepSeek"
                        % src_name
                    )
                    provider = "deepseek"
                    switched = True
                    continue
                invalid_attempts += 1
                if invalid_attempts < max_attempts:
                    log(
                        "  action: retrying same provider (%d/%d)"
                        % (invalid_attempts, max_attempts)
                    )
                    continue
                log("  action: STOP")
                stop(idx, total, src_name, dst_name, written, untouched)
                sys.exit(1)
            break

        write_protected(dst_path, text)
        written.append(dst_name)
        if dst_name in untouched:
            untouched.remove(dst_name)
        log(
            "  result: %s written (%s)"
            % (dst_name, provider_label(used_provider))
        )

        elapsed = time.time() - file_start
        if elapsed > file_timeout:
            print(
                "::error::File deadline exceeded (%ds > %ds) at %s"
                % (elapsed, file_timeout, src_name)
            )
            stop(idx, total, src_name, dst_name, written, untouched)
            sys.exit(1)

    log("Sync finished: %d/%d files updated" % (len(written), total))
    if switched:
        log("chain: Gemini -> DeepSeek (locked)")
    else:
        log("chain: %s only" % provider_label(provider))


if __name__ == "__main__":
    main()
