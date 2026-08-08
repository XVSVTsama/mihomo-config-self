#!/usr/bin/env python3
"""Translate Chinese source files to English with the Gemini API.

Pairs:
  mihomo.yaml        -> mihomo_en.yaml
  script_override.js -> script_override_en.js
  README.md          -> README_en.md

Chinese files are authoritative. English files are only replaced after the
Gemini response passes local validation, so a failed translation never
overwrites the existing English files.
"""

import json
import os
import re
import subprocess
import sys
import tempfile
import time
import urllib.error
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]

PAIRS = [
    ("mihomo.yaml", "mihomo_en.yaml", "yaml"),
    ("script_override.js", "script_override_en.js", "js"),
    ("README.md", "README_en.md", "readme"),
]

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


def build_prompt(kind):
    if kind == "readme":
        return """Translate the following GitHub README from Chinese to English.
Rules:
- Keep all markdown structure, links, code blocks, URLs, and badge URLs unchanged.
- Translate all user-facing text into natural English.
- The language switch line must become: English | [中文](README.md)
- Do not wrap the output in markdown code fences.
- Return only the translated file content.
"""
    return f"""Translate the following file from Chinese to English.
Rules:
- Keep all code, YAML keys, JavaScript identifiers, URLs, regex filters and
  other functional values unchanged unless listed below.
- Translate comments and user-facing text into natural English.
{GROUP_NAME_MAP}
- Keep emojis that are part of proxy group names.
- Do not wrap the output in markdown code fences.
- Return only the translated file content.
"""


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


def call_gemini(prompt, api_key, model):
    url = (
        "https://generativelanguage.googleapis.com/v1beta/models/%s"
        ":generateContent?key=%s" % (model, api_key)
    )
    payload = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {"temperature": 0.2},
    }
    data = json.dumps(payload).encode("utf-8")
    last_error = None
    for attempt in range(3):
        request = urllib.request.Request(
            url,
            data=data,
            headers={"Content-Type": "application/json"},
        )
        try:
            with urllib.request.urlopen(request, timeout=180) as response:
                body = json.loads(response.read().decode("utf-8"))
            try:
                text = body["candidates"][0]["content"]["parts"][0]["text"]
            except (KeyError, IndexError, TypeError) as exc:
                raise RuntimeError(
                    "Unexpected Gemini response: %s"
                    % json.dumps(body)[:500]
                ) from exc
            return text.strip()
        except urllib.error.HTTPError as exc:
            detail = exc.read().decode("utf-8", errors="replace")[:500]
            last_error = "HTTP %s: %s" % (exc.code, detail)
            if exc.code in (429, 500, 502, 503):
                time.sleep(2 * (attempt + 1))
                continue
            raise RuntimeError(last_error) from exc
        except urllib.error.URLError as exc:
            last_error = str(exc)
            time.sleep(2 * (attempt + 1))
    raise RuntimeError(last_error or "Gemini request failed")


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


def main():
    api_key = os.environ.get("GEMINI_API_KEY", "")
    if not api_key:
        print("::error::GEMINI_API_KEY is not set; add it to Actions secrets")
        sys.exit(1)

    model = os.environ.get("GEMINI_MODEL", "gemini-2.0-flash")
    failed = []
    for src_name, dst_name, kind in PAIRS:
        src_path = ROOT / src_name
        dst_path = ROOT / dst_name
        if not src_path.exists():
            print("Skipping %s: file does not exist" % src_name)
            continue

        prompt = build_prompt(kind)
        content = src_path.read_text(encoding="utf-8")
        try:
            translated = call_gemini(prompt + "\n\n" + content, api_key, model)
            translated = strip_fences(translated)
            error = validate(translated, kind)
            if error:
                raise RuntimeError(error)
            write_protected(dst_path, translated)
            print("Synced %s -> %s" % (src_name, dst_name))
        except Exception as exc:
            print("::error::Failed to sync %s -> %s: %s" % (src_name, dst_name, exc))
            failed.append(src_name)

    if failed:
        sys.exit(1)
    print("English sync finished")


if __name__ == "__main__":
    main()
