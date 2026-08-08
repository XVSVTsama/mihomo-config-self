#!/usr/bin/env python3
import json
import os
import subprocess
import sys
from pathlib import Path
import urllib.request
from datetime import datetime

ROOT = Path(__file__).resolve().parents[2]
GLOSSARY_PATH = ROOT / ".github" / "translation_glossary.json"
PAIRS = {
    "mihomo_en.yaml": "mihomo.yaml",
    "script_override_en.js": "script_override.js",
    "README_en.md": "README.md"
}

def log(msg):
    print("[%s] %s" % (datetime.now().strftime("%H:%M:%S"), msg))

def get_diff(file_path):
    try:
        # Get diff of the file in the last commit
        cmd = ["git", "diff", "HEAD^", "HEAD", "--", str(file_path)]
        result = subprocess.run(cmd, capture_output=True, text=True, check=True)
        return result.stdout
    except Exception as e:
        log(f"Error getting diff for {file_path}: {e}")
        return ""

def call_ai(prompt, api_key, model):
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={api_key}"
    payload = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {"temperature": 0.1},
    }
    request = urllib.request.Request(
        url,
        data=json.dumps(payload).encode("utf-8"),
        headers={"Content-Type": "application/json"},
    )
    try:
        with urllib.request.urlopen(request, timeout=60) as response:
            body = json.loads(response.read().decode("utf-8"))
            return body["candidates"][0]["content"]["parts"][0]["text"].strip()
    except Exception as e:
        log(f"AI Call failed: {e}")
        return None

def main():
    api_key = os.environ.get("GEMINI_API_KEY")
    model = os.environ.get("GEMINI_MODEL", "gemini-2.0-flash")
    if not api_key:
        log("GEMINI_API_KEY not set, skipping extraction.")
        return

    # 1. Identify changed English files
    changed_files = []
    try:
        cmd = ["git", "diff", "--name-only", "HEAD^", "HEAD"]
        result = subprocess.run(cmd, capture_output=True, text=True, check=True)
        changed_files = result.stdout.splitlines()
    except Exception as e:
        log(f"Error identifying changed files: {e}")
        return

    glossary = {}
    if GLOSSARY_PATH.exists():
        try:
            glossary = json.loads(GLOSSARY_PATH.read_text(encoding="utf-8"))
        except:
            glossary = {}

    updated = False
    for f in changed_files:
        if f in PAIRS:
            src_file = PAIRS[f]
            log(f"Processing manual edits in {f} (source: {src_file})")
            
            diff = get_diff(ROOT / f)
            if not diff:
                continue
                
            src_content = (ROOT / src_file).read_text(encoding="utf-8")
            dst_content = (ROOT / f).read_text(encoding="utf-8")
            
            prompt = f"""
Analyze the following Git diff of an English translation file and its corresponding Chinese source file.
Extract translation pairs where the user has manually improved the translation in comments or user-facing text.

Rules:
1. Ignore functional code changes.
2. Focus on comments and descriptive text.
3. Return a JSON object where keys are the original Chinese snippets and values are the manual English translations.
4. If a translation is similar to an existing one, prefer the most descriptive version.
5. Format: {{"chinese": "english", ...}}

Chinese Source File Content (Truncated if too long):
{src_content[:5000]}

English File Current Content:
{dst_content[:5000]}

Git Diff of English File:
{diff}

Return ONLY the JSON object.
"""
            res = call_ai(prompt, api_key, model)
            if res:
                try:
                    # Clean markdown if AI wrapped it
                    if res.startswith("```json"):
                        res = res.split("```json")[1].split("```")[0].strip()
                    elif res.startswith("```"):
                        res = res.split("```")[1].split("```")[0].strip()
                    
                    new_pairs = json.loads(res)
                    for cn, en in new_pairs.items():
                        if cn and en:
                            glossary[cn] = en
                            updated = True
                            log(f"  Added to glossary: '{cn}' -> '{en}'")
                except Exception as e:
                    log(f"  Failed to parse AI response: {e}")

    if updated:
        GLOSSARY_PATH.parent.mkdir(parents=True, exist_ok=True)
        GLOSSARY_PATH.write_text(json.dumps(glossary, ensure_ascii=False, indent=2), encoding="utf-8")
        log(f"Glossary updated at {GLOSSARY_PATH}")
    else:
        log("No new manual translation pairs identified.")

if __name__ == "__main__":
    main()
