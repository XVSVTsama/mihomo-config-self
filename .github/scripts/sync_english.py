#!/usr/bin/env python3
"""Translate Chinese source files to English with Gemini first, DeepSeek second,
public Google Translate as the final fallback.

Pairs:
  mihomo.yaml        -> mihomo_en.yaml
  script_override.js -> script_override_en.js
  README.md          -> README_en.md

Provider rules:
- Start with the first configured provider (Gemini, else DeepSeek).
- If the active provider fails on a file, fall back to the next provider in the
  chain (Gemini -> DeepSeek -> Google Translate) and lock all later files to it.
- Google Translate is the always-available final fallback (no API key needed);
  it translates comment/prose text only so code structure is preserved.
- If the active provider fails and there is no next provider, stop immediately.
- English files are only replaced after local validation passes.
- Uses a manual translation glossary to maintain consistency.
"""

import http.client
import json
import os
import re
import socket
import subprocess
import sys
import tempfile
import time
import urllib.error
import urllib.parse
import urllib.request
from datetime import datetime
from pathlib import Path

from translation_boundaries import (
    comment_spans, english_readme_switch, markdown_signature, prose_spans,
)

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

class ProviderError(Exception):
    def __init__(self, provider, message, truncated=False):
        self.provider = provider
        self.message = message
        # True when the provider stopped because the output hit its token limit.
        self.truncated = truncated


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
- Translate actual comments only. All text outside comments is functional code and must stay unchanged.
- Keep YAML keys and values, JavaScript identifiers and string literals, proxy group names and every reference to them, URLs, regex filters, and template literals unchanged, even when they contain Chinese.
- Comment-like characters inside strings, regular expressions, template literals, or YAML block scalars are functional content, not comments.
{glossary_str}
- Apply the Glossary to comments only; it never authorizes changing functional values.
- Preserve comment delimiters and the position of each comment relative to the code.
- Do not wrap the output in markdown code fences.
- Return only the translated file content.
"""

    if kind == "readme":
        return f"""Translate the following GitHub README from Chinese to English.
Rules:
- Keep all markdown structure, links, code blocks, URLs, and badge URLs unchanged.
- Translate all user-facing text into natural English.
- The language switch has already been prepared; preserve its markup and destination exactly.
{glossary_str}
- If any section matches the Glossary, use the manual translation.
- Do not wrap the output in markdown code fences.
- Return only the translated file content.
"""
    return f"Translate the following file from Chinese to English.\n{base_rules}"


def strip_fences(text, keep_indentation=False):
    """Trim padding (and a wrapping code fence) from a model response.

    keep_indentation is used for retry sub-chunks: their first line may start with
    meaningful indentation, so only newlines are trimmed at the edges.
    """
    def trim(value):
        return value.lstrip("\r\n").rstrip("\r\n") if keep_indentation else value.strip()

    text = trim(text)
    if text.startswith("```") and text.endswith("```"):
        lines = text.splitlines()
        if lines:
            lines = lines[1:]
        if lines and lines[-1].strip().startswith("```"):
            lines = lines[:-1]
        text = trim("\n".join(lines))
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


def slice_spans(spans, offset, length):
    end = offset + length
    return [
        (max(start, offset) - offset, min(stop, end) - offset)
        for start, stop in spans if start < end and stop > offset
    ]


def translation_chunks(content, kind):
    """Decide eligibility using whole-file syntax, never isolated fragments."""
    spans = prose_spans(content) if kind == "readme" else comment_spans(content, kind)
    chunks = []
    offset = 0
    for chunk in split_content(content, kind):
        end = offset + len(chunk)
        eligible = any(
            contains_cjk(content[max(start, offset):min(stop, end)])
            for start, stop in spans if start < end and stop > offset
        )
        chunks.append((chunk, eligible))
        offset = end
    return chunks


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
    return {
        "gemini": "Gemini",
        "deepseek": "DeepSeek",
        "google": "Google Translate",
    }.get(provider, provider)


def provider_key(provider, gemini_key, deepseek_key):
    if provider == "gemini":
        return gemini_key
    if provider == "deepseek":
        return deepseek_key
    return None


def provider_model(provider, gemini_model, deepseek_model):
    if provider == "gemini":
        return gemini_model
    if provider == "deepseek":
        return deepseek_model
    return "public translate.googleapis.com (dict-chrome-ex)"


def next_in_chain(chain, provider):
    """Return the provider after `provider` in the chain, or None if it is last."""
    try:
        index = chain.index(provider)
    except ValueError:
        return None
    return chain[index + 1] if index + 1 < len(chain) else None


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
                truncated=finish_reason == "MAX_TOKENS",
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
                truncated=True,
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
            if not text.strip():
                log("  attempt %d: EMPTY response" % attempt)
                last_error = "empty response"
                if attempt < max_attempts:
                    sleep_before_retry(attempt)
                continue
            log("  attempt %d: OK (%.2fs)" % (attempt, time.time() - started))
            _note_provider(provider, True, time.time() - started)
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
        except (
            socket.timeout,
            urllib.error.URLError,
            http.client.IncompleteRead,
            http.client.HTTPException,
            ConnectionResetError,
            json.JSONDecodeError,
        ) as exc:
            if isinstance(exc, socket.timeout):
                log("  attempt %d: TIMEOUT after %ds" % (attempt, timeout))
                last_error = "TIMEOUT after %ds: %s" % (timeout, exc)
            else:
                log("  attempt %d: %s (%s)" % (attempt, type(exc).__name__, exc))
                last_error = "%s: %s" % (type(exc).__name__, exc)
            if attempt < max_attempts:
                sleep_before_retry(attempt)
    _note_provider(provider, False)
    raise ProviderError(provider, last_error or "unknown failure")


GOOGLE_GLOSSARY_HITS = 0
PROVIDER_STATS = {}
GOOGLE_TRANSLATE_URL = "https://translate.googleapis.com/translate_a/t"


def _note_provider(provider, ok, latency=None):
    stats = PROVIDER_STATS.setdefault(
        provider, {"ok": 0, "fail": 0, "ok_time_sum": 0.0}
    )
    if ok:
        stats["ok"] += 1
        stats["ok_time_sum"] += latency or 0.0
    else:
        stats["fail"] += 1


def _extract_google_text(body):
    """Return translated text from either of the two public-endpoint shapes:

      flat    ["hello"]                 -> body[0] is already a string
      nested  [["hello", "zh-CN"], ...] -> body[0] is a segment list, [0] is text
    """
    if not isinstance(body, list) or not body:
        return ""
    first = body[0]
    if isinstance(first, str):
        return first
    if isinstance(first, list) and first:
        parts = []
        for segment in body:
            if isinstance(segment, list) and segment and isinstance(segment[0], str):
                parts.append(segment[0])
        return "".join(parts)
    return ""


def call_google_fragment(text, target_lang="en", timeout=30):
    """Translate one plain-text fragment via the public (key-less) Google endpoint.

    Uses the `dict-chrome-ex` client on /translate_a/t, which returns
    [[translated, language-code]] JSON and generally works from datacenter/cloud
    IPs where the legacy `client=gtx` endpoint is rate-limited (HTTP 429).
    """
    params = {
        "client": "dict-chrome-ex",
        "sl": "auto",
        "tl": target_lang,
        "q": text,
    }
    url = GOOGLE_TRANSLATE_URL + "?" + urllib.parse.urlencode(params)
    request = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(request, timeout=timeout) as response:
        body = json.loads(response.read().decode("utf-8"))
    return _extract_google_text(body)


def google_translate_fragment(text, glossary, timeout=30):
    """Translate one comment/prose fragment, honoring the glossary first.

    Whitespace wrap is preserved; on any failure the original text is returned so
    this best-effort final fallback never corrupts structure.
    """
    stripped = text.strip()
    if not stripped or not contains_cjk(stripped):
        return text
    global GOOGLE_GLOSSARY_HITS
    if glossary and stripped in glossary:
        translated = glossary[stripped]
        GOOGLE_GLOSSARY_HITS += 1
        log("  google glossary hit: %r -> %r" % (stripped[:40], translated[:40]))
    else:
        try:
            translated = call_google_fragment(stripped, timeout=timeout)
        except Exception as exc:
            log("  google fragment failed (%s): %s" % (type(exc).__name__, exc))
            return text
    lead = text[: len(text) - len(text.lstrip())]
    trail = text[len(text.rstrip()):]
    return lead + translated + trail


def google_translate_chunk(chunk, kind, glossary, timeout=30):
    """Translate comment bodies with Google, preserving delimiters and code."""
    if kind == "readme":
        chunk = english_readme_switch(chunk)
        output, pos = [], 0
        for start, end in prose_spans(chunk):
            output.append(chunk[pos:start])
            output.append(google_translate_lines(chunk[start:end], glossary, timeout, markdown=True))
            pos = end
        output.append(chunk[pos:])
        return "".join(output)
    output = []
    pos = 0
    for start, end in comment_spans(chunk, kind):
        output.append(chunk[pos:start])
        comment = chunk[start:end]
        prefix_size = 1 if kind == "yaml" else 2
        suffix_size = 2 if comment.startswith("/*") else 0
        body_end = len(comment) - suffix_size
        body = comment[prefix_size:body_end]
        output.append(comment[:prefix_size])
        output.append(google_translate_lines(body, glossary, timeout))
        output.append(comment[body_end:])
        pos = end
    output.append(chunk[pos:])
    return "".join(output)


def google_translate_lines(text, glossary, timeout, markdown=False):
    """Keep every line terminator, including those that affect JS ASI."""
    output = []
    for line in text.splitlines(keepends=True):
        body = line.rstrip("\r\n\u2028\u2029")
        if markdown:
            prefix = re.match(r'^[ \t]*(?:(?:>[ \t]*)+)?(?:#{1,6}[ \t]+|[-*+][ \t]+|\d+[.)][ \t]+)?', body)[0]
            pieces = re.split(r'(\*{1,3}|_{1,3}|\||\[|\])', body[len(prefix):])
            translated = prefix + ''.join(
                piece if index % 2 else google_translate_fragment(piece, glossary, timeout)
                for index, piece in enumerate(pieces)
            )
        else:
            translated = google_translate_fragment(body, glossary, timeout)
        output.append(translated + line[len(body):])
    return "".join(output)


def emit_report(report, chain_str, written_count, total):
    """Print a summary and, when available, write GHA step summary + JSON report."""
    text = build_report_text(report, chain_str, written_count, total)
    print("\n%s" % text)

    summary_path = os.environ.get("GITHUB_STEP_SUMMARY")
    if summary_path:
        try:
            with open(summary_path, "a", encoding="utf-8") as fh:
                fh.write(text + "\n")
        except OSError as exc:
            log("Warning: could not write step summary: %s" % exc)

    report_path = os.environ.get("SYNC_REPORT_PATH")
    if report_path:
        try:
            payload = {
                "chain": chain_str,
                "files": report,
                "provider_stats": PROVIDER_STATS,
                "glossary_hits": GOOGLE_GLOSSARY_HITS,
            }
            with open(report_path, "w", encoding="utf-8") as fh:
                json.dump(payload, fh, ensure_ascii=False, indent=2)
            log("report written to %s" % report_path)
        except OSError as exc:
            log("Warning: could not write report to %s: %s" % (report_path, exc))


def build_report_text(report, chain_str, written_count, total):
    lines = [
        "## English Sync Report",
        "",
        "| File | Target | Kind | Chunks | Provider used | Validation |",
        "|---|---|---|---|---|---|",
    ]
    for r in report:
        lines.append(
            "| %s | %s | %s | %d | %s | %s |"
            % (
                r["source"],
                r["target"],
                r["kind"],
                r["chunks"],
                r["provider_used"] or "skipped",
                r["validation"] or "n/a",
            )
        )
    lines += ["", "## Provider stats", ""]
    if PROVIDER_STATS:
        for prov, s in PROVIDER_STATS.items():
            avg = (s["ok_time_sum"] / s["ok"]) if s["ok"] else 0.0
            lines.append(
                "- **%s**: ok=%d fail=%d avg_ok=%.1fs"
                % (provider_label(prov), s["ok"], s["fail"], avg)
            )
    else:
        lines.append("- none")
    lines.append("")
    lines.append("- Chain: **%s**" % chain_str)
    lines.append("- Files updated: **%d/%d**" % (written_count, total))
    if GOOGLE_GLOSSARY_HITS:
        lines.append("- Glossary terms applied in Google fallback: **%d**" % GOOGLE_GLOSSARY_HITS)
    return "\n".join(lines)


TRUNCATION_SPLIT_MIN_CHARS = int(os.environ.get("SYNC_TRUNCATION_MIN_CHARS", "400"))
TRUNCATION_SPLIT_MAX_DEPTH = int(os.environ.get("SYNC_TRUNCATION_MAX_DEPTH", "4"))


def split_chunk_for_retry(chunk, kind):
    """Split a chunk for a truncation retry, never losing or duplicating content.

    Prefers the same boundary rules used for whole files (blank lines, then lines
    outside block comments). Falls back to a plain line split, because a long block
    comment has no blank line and would otherwise stay unsplittable.
    """
    pieces = split_content(chunk, kind, max_chars=max(len(chunk) // 2, 1))
    if len(pieces) >= 2 and "".join(pieces) == chunk:
        return pieces
    lines = chunk.splitlines(keepends=True)
    if len(lines) >= 2:
        target = len(chunk) // 2
        total = 0
        for index in range(1, len(lines)):
            total += len(lines[index - 1])
            if total >= target:
                first = "".join(lines[:index])
                second = "".join(lines[index:])
                if first and second and first + second == chunk:
                    return [first, second]
    return []


def translate_chunk(
    provider,
    kind,
    glossary,
    prompt,
    chunk,
    api_key,
    model,
    timeout,
    max_attempts,
    label="chunk",
    depth=0,
    keep_indentation=False,
    eligible_spans=None,
):
    """Translate one chunk; if the provider truncated its output, retry smaller pieces.

    Some providers cap the response length, so a dense chunk can hit that cap even
    though the file itself is fine. Splitting the chunk the same way whole files are
    split (at blank lines, then by line) keeps the run alive instead of stopping the
    file and, with it, the whole sync.
    """
    if not contains_cjk(chunk) or (
        eligible_spans is not None
        and not any(contains_cjk(chunk[start:end]) for start, end in eligible_spans)
    ):
        return chunk
    if provider == "google":
        return google_translate_chunk(chunk, kind, glossary, timeout=timeout)
    try:
        raw = call_provider(
            provider,
            prompt + "\n\n" + chunk,
            api_key,
            model,
            timeout,
            max_attempts,
        )
        return strip_fences(raw, keep_indentation=keep_indentation)
    except ProviderError as exc:
        pieces = []
        if (
            getattr(exc, "truncated", False)
            and depth < TRUNCATION_SPLIT_MAX_DEPTH
            and len(chunk) > TRUNCATION_SPLIT_MIN_CHARS
        ):
            pieces = split_chunk_for_retry(chunk, kind)
        if not pieces:
            raise
        log(
            "  output truncated at %s (%d chars); splitting into %d pieces and retrying"
            % (label, len(chunk), len(pieces))
        )
        translated, offset = [], 0
        for piece_index, piece in enumerate(pieces):
            translated.append(
                translate_chunk(
                    provider,
                    kind,
                    glossary,
                    prompt,
                    piece,
                    api_key,
                    model,
                    timeout,
                    max_attempts,
                    label="%s.%d" % (label, piece_index + 1),
                    depth=depth + 1,
                    keep_indentation=True,
                    eligible_spans=None if eligible_spans is None else slice_spans(eligible_spans, offset, len(piece)),
                )
            )
            offset += len(piece)
        return join_translated_chunks(translated)


def validate(text, kind):
    if not text.strip():
        return "translated file is empty"
    if kind == "readme":
        source = english_readme_switch((ROOT / "README.md").read_text(encoding="utf-8"))
        if markdown_signature(source) != markdown_signature(text):
            return "translated README changed protected code, HTML, or link destinations"
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
    use_google = os.environ.get("SYNC_USE_GOOGLE_FALLBACK", "1") != "0"

    chain = []
    if gemini_key:
        chain.append("gemini")
    if deepseek_key:
        chain.append("deepseek")
    if use_google:
        chain.append("google")
    if not chain:
        print(
            "::error::No translation provider available (set GEMINI_API_KEY/"
            "DEEPSEEK_API_KEY or enable the Google fallback)"
        )
        sys.exit(1)

    provider = chain[0]
    if provider != "gemini":
        print(
            "::warning::GEMINI_API_KEY is not set; starting with %s"
            % provider_label(provider)
        )

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
    report = []

    for idx, (src_name, dst_name, kind) in enumerate(pairs, start=1):
        src_path = ROOT / src_name
        dst_path = ROOT / dst_name
        log("[%d/%d] %s -> %s" % (idx, total, src_name, dst_name))
        if not src_path.exists():
            stop(idx, total, src_name, dst_name, written, untouched)
            sys.exit(1)

        file_start = time.time()
        content = src_path.read_text(encoding="utf-8")
        if kind == "readme":
            content = english_readme_switch(content)
        chunks = translation_chunks(content, kind)
        spans = prose_spans(content) if kind == "readme" else comment_spans(content, kind)
        file_meta = {
            "source": src_name,
            "target": dst_name,
            "kind": kind,
            "chunks": len(chunks),
            "provider_used": None,
            "validation": None,
        }
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

            if switched:
                label = "%s (fallback)" % provider_label(provider)
            else:
                label = provider_label(provider)
            log(
                "  provider: %s (%s)"
                % (label, provider_model(provider, gemini_model, deepseek_model))
            )

            translated_chunks = []
            failed = False
            # Google needs the complete lexical context: a chunk could start
            # inside a quoted scalar, regexp, or multiline template literal.
            active_chunks = [(content, any(eligible for _, eligible in chunks))] if provider == "google" else chunks
            chunk_offset = 0
            for chunk_index, (chunk, eligible) in enumerate(active_chunks, start=1):
                chunk_spans = slice_spans(spans, chunk_offset, len(chunk))
                chunk_offset += len(chunk)
                log(
                    "  translating chunk %d/%d (%d chars)"
                    % (chunk_index, len(active_chunks), len(chunk))
                )
                if not eligible:
                    translated_chunks.append(chunk)
                    log("  skipped: no translatable CJK comments/prose")
                    continue
                prompt = build_chunk_prompt(
                    kind,
                    glossary,
                    chunk_index,
                    len(active_chunks),
                )
                try:
                    translated_chunks.append(
                        translate_chunk(
                            provider,
                            kind,
                            glossary,
                            prompt,
                            chunk,
                            provider_key(provider, gemini_key, deepseek_key),
                            provider_model(provider, gemini_model, deepseek_model),
                            request_timeout,
                            max_attempts,
                            label="chunk %d/%d" % (chunk_index, len(active_chunks)),
                            eligible_spans=chunk_spans,
                        )
                    )
                    used_provider = provider
                except ProviderError as exc:
                    log("  status: FAIL")
                    log("  error: %s" % exc.message)
                    next_p = next_in_chain(chain, provider)
                    if next_p is not None:
                        log("  action: switching to %s" % provider_label(next_p))
                        print(
                            "::warning::%s failed for %s; switching to %s"
                            % (
                                provider_label(provider),
                                src_name,
                                provider_label(next_p),
                            )
                        )
                        provider = next_p
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
                next_p = next_in_chain(chain, provider)
                if next_p is not None:
                    log("  action: switching to %s" % provider_label(next_p))
                    print(
                        "::warning::%s result invalid for %s; switching to %s"
                        % (
                            provider_label(provider),
                            src_name,
                            provider_label(next_p),
                        )
                    )
                    provider = next_p
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
        file_meta["provider_used"] = (
            provider_label(used_provider) if used_provider else "skipped"
        )
        file_meta["validation"] = "ok"
        report.append(file_meta)
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

    chain_str = " -> ".join(provider_label(p) for p in chain)
    log(
        "Sync finished: %d/%d files updated | chain: %s%s"
        % (
            len(written),
            total,
            chain_str,
            " (fallback triggered)" if switched else "",
        )
    )
    emit_report(report, chain_str, len(written), total)


if __name__ == "__main__":
    main()
