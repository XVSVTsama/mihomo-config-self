#!/usr/bin/env python3
import sys
import re
from pathlib import Path
import difflib

HARDCODED_TRANSLATIONS = {
    # Keep in sync with GROUP_NAME_MAP in .github/scripts/sync_english.py
    "🔄 负载均衡": "🔄 Load Balance",
    "👉 手动切换": "👉 Manual Select",
    "♻️ 自动选择": "♻️ Auto Select",
    "🤖 AI大模型": "🤖 AI",
    "美国|住宅": "US|Residential",
}

def strip_js_comments(text):
    # 1. Multi-line comments: replace non-newline chars with spaces
    def ml_replacer(match):
        return re.sub(r'[^\n]', ' ', match.group(0))
    text = re.sub(r'/\*[\s\S]*?\*/', ml_replacer, text)
    
    lines = text.splitlines()
    new_lines = []
    for line in lines:
        comment_idx = -1
        # Search for // that is not part of a URL (not preceded by :)
        for i in range(len(line) - 1):
            if line[i:i+2] == '//':
                if i > 0 and line[i-1] == ':':
                    continue
                comment_idx = i
                break
        
        if comment_idx != -1:
            line = line[:comment_idx]
        
        # If the line is only whitespace after removing comment, make it empty
        if not line.strip():
            new_lines.append("")
        else:
            # Keep original indentation and code, but strip trailing spaces
            new_lines.append(line.rstrip())
    return "\n".join(new_lines)

def strip_yaml_comments(text):
    lines = text.splitlines()
    new_lines = []
    for line in lines:
        comment_idx = -1
        for i in range(len(line)):
            if line[i] == '#':
                # YAML comment must be at start or preceded by whitespace
                if i == 0 or line[i-1].isspace():
                    comment_idx = i
                    break
        
        if comment_idx != -1:
            line = line[:comment_idx]
        
        if not line.strip():
            new_lines.append("")
        else:
            new_lines.append(line.rstrip())
    return "\n".join(new_lines)

def normalize_hardcoded(line):
    for zh, en in HARDCODED_TRANSLATIONS.items():
        line = line.replace(zh, en)
    return line

def classify_diff(p1, p2, name1, name2):
    n1 = [normalize_hardcoded(line) for line in p1]
    n2 = [normalize_hardcoded(line) for line in p2]
    matcher = difflib.SequenceMatcher(None, n1, n2, autojunk=False)
    reasonable = []
    abnormal = []

    for tag, i1, i2, j1, j2 in matcher.get_opcodes():
        if tag == "equal":
            for offset in range(i2 - i1):
                a = p1[i1 + offset]
                b = p2[j1 + offset]
                if a != b:
                    reasonable.append(
                        "hardcoded translation: %s line %d (%r) -> %s line %d (%r)"
                        % (name1, i1 + offset + 1, a, name2, j1 + offset + 1, b)
                    )
        elif tag == "delete":
            for idx in range(i1, i2):
                a = p1[idx]
                if not a.strip():
                    reasonable.append(
                        "blank line count: extra blank line in %s line %d"
                        % (name1, idx + 1)
                    )
                else:
                    abnormal.append(
                        "content: %s line %d (%r) has no counterpart in %s"
                        % (name1, idx + 1, a, name2)
                    )
        elif tag == "insert":
            for idx in range(j1, j2):
                b = p2[idx]
                if not b.strip():
                    reasonable.append(
                        "blank line count: extra blank line in %s line %d"
                        % (name2, idx + 1)
                    )
                else:
                    abnormal.append(
                        "content: %s line %d (%r) has no counterpart in %s"
                        % (name2, idx + 1, b, name1)
                    )
        elif tag == "replace":
            a_lines = p1[i1:i2]
            b_lines = p2[j1:j2]
            for offset in range(min(len(a_lines), len(b_lines))):
                a = a_lines[offset]
                b = b_lines[offset]
                a_no = i1 + offset + 1
                b_no = j1 + offset + 1
                if not a.strip() and not b.strip():
                    reasonable.append(
                        "blank line count: %s line %d / %s line %d"
                        % (name1, a_no, name2, b_no)
                    )
                    continue
                an = normalize_hardcoded(a)
                bn = normalize_hardcoded(b)
                if an == bn:
                    reasonable.append(
                        "hardcoded translation: %s line %d (%r) -> %s line %d (%r)"
                        % (name1, a_no, a, name2, b_no, b)
                    )
                elif a.lstrip() == b.lstrip():
                    reasonable.append(
                        "indentation: %s line %d (%r) vs %s line %d (%r)"
                        % (name1, a_no, a, name2, b_no, b)
                    )
                elif an.lstrip() == bn.lstrip():
                    reasonable.append(
                        "hardcoded translation + indentation: %s line %d (%r) vs %s line %d (%r)"
                        % (name1, a_no, a, name2, b_no, b)
                    )
                else:
                    abnormal.append(
                        "content: %s line %d (%r) vs %s line %d (%r)"
                        % (name1, a_no, a, name2, b_no, b)
                    )
            for offset in range(len(a_lines), len(b_lines)):
                b = b_lines[offset]
                if not b.strip():
                    reasonable.append(
                        "blank line count: extra blank line in %s line %d"
                        % (name2, j1 + offset + 1)
                    )
                else:
                    abnormal.append(
                        "content: %s line %d (%r) has no counterpart in %s"
                        % (name2, j1 + offset + 1, b, name1)
                    )
            for offset in range(len(b_lines), len(a_lines)):
                a = a_lines[offset]
                if not a.strip():
                    reasonable.append(
                        "blank line count: extra blank line in %s line %d"
                        % (name1, i1 + offset + 1)
                    )
                else:
                    abnormal.append(
                        "content: %s line %d (%r) has no counterpart in %s"
                        % (name1, i1 + offset + 1, a, name2)
                    )
    return reasonable, abnormal

def main():
    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    except (AttributeError, ValueError):
        pass

    if len(sys.argv) != 4:
        print("Usage: check_code_sync.py <type: js|yaml> <file1> <file2>")
        sys.exit(1)
    
    file_type = sys.argv[1].lower()
    f1_path = Path(sys.argv[2])
    f2_path = Path(sys.argv[3])
    
    if not f1_path.exists() or not f2_path.exists():
        print(f"Error: One or both files do not exist: {f1_path}, {f2_path}")
        sys.exit(1)
        
    t1 = f1_path.read_text(encoding='utf-8')
    t2 = f2_path.read_text(encoding='utf-8')
    
    if file_type == 'js':
        p1 = strip_js_comments(t1)
        p2 = strip_js_comments(t2)
    elif file_type == 'yaml':
        p1 = strip_yaml_comments(t1)
        p2 = strip_yaml_comments(t2)
    else:
        print(f"Error: Unknown file type {file_type}")
        sys.exit(1)
    
    p1_lines = p1.splitlines()
    p2_lines = p2.splitlines()

    if p1_lines == p2_lines:
        print(
            "Status: FULLY MATCHED (完全吻合) - %s and %s code content matches perfectly after removing comments."
            % (f1_path.name, f2_path.name)
        )
        sys.exit(0)

    reasonable, abnormal = classify_diff(
        p1_lines, p2_lines, f1_path.name, f2_path.name
    )

    if abnormal:
        print(
            "Status: ABNORMAL DIFFERENCES (异常差异) between %s and %s"
            % (f1_path.name, f2_path.name)
        )
        if reasonable:
            print("Reasonable differences (合理差异):")
            for item in reasonable:
                print("  - %s" % item)
        print("Abnormal differences (异常差异):")
        for item in abnormal:
            print("  - %s" % item)
        sys.exit(1)

    print(
        "Status: REASONABLE DIFFERENCES (合理差异) between %s and %s"
        % (f1_path.name, f2_path.name)
    )
    print("Reasonable differences (合理差异):")
    for item in reasonable:
        print("  - %s" % item)
    print("No abnormal differences found.")
    sys.exit(0)

if __name__ == "__main__":
    main()
