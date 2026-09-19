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

# ---------------------------------------------------------------------------
# JS: positional (order-sensitive) line-by-line comparison.
#
# 目标：英文脚本必须是中文脚本的「逐行镜像」：代码行的数量、顺序、结构一一对应。
# 允许的差异只有三类：
#   1. 注释（译文行数可能不同，比较前整段剔除）
#   2. 缩进、行尾逗号、行内多余空白
#   3. 字符串「值」的翻译——且仅当中文侧该值含中文时（键名与功能性取值一律不允许改）
# 其余任何差异（多行/少行/顺序错位/结构变化/功能性取值变化）都报错并指到第 k 行。
# ---------------------------------------------------------------------------

STRING_LITERAL_RE = re.compile(
    r'"(?:[^"\\]|\\.)*"|\'(?:[^\'\\]|\\.)*\'|`(?:[^`\\]|\\.)*`'
)
CJK_RE = re.compile(r"[\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff]")
VALUE_SLOT = "\x00"


def js_code_lines(text):
    """剥离注释、去掉空行，得到「代码行」序列（保留原次序）。"""
    return [ln for ln in strip_js_comments(text).splitlines() if ln.strip()]


def js_canon(line):
    """去掉缩进 / 行尾逗号 / 多余空白，并归一化已知词条译文。"""
    line = normalize_hardcoded(line).strip()
    line = re.sub(r",\s*$", "", line)
    return re.sub(r"\s+", " ", line)


def js_split(line):
    """返回 (结构骨架, 「值」字面量列表)：键名留在骨架里，「值」被占位。"""
    line = js_canon(line)
    skeleton, values, pos = [], [], 0
    for match in STRING_LITERAL_RE.finditer(line):
        skeleton.append(line[pos:match.start()])
        following = line[match.end():].lstrip()
        if following.startswith(":"):
            skeleton.append(match.group(0))
        else:
            skeleton.append(VALUE_SLOT)
            values.append(match.group(0))
        pos = match.end()
    skeleton.append(line[pos:])
    return "".join(skeleton), values


def js_classify(cn_line, en_line):
    """判定一行：'same' 完全相同 / 'translation' 仅译文不同 / 'error' 其他任何差异。"""
    if js_canon(cn_line) == js_canon(en_line):
        return "same"
    s1, v1 = js_split(cn_line)
    s2, v2 = js_split(en_line)
    if s1 != s2 or len(v1) != len(v2):
        return "error"
    for x, y in zip(v1, v2):
        if x == y:
            continue
        if CJK_RE.search(x) or CJK_RE.search(y):
            continue
        return "error"
    return "translation"


def _contiguous_runs(points):
    runs = []
    for point in sorted(points):
        if runs and point - runs[-1][1] <= 3:
            runs[-1][1] = point
        else:
            runs.append([point, point])
    return runs


def run_js_check(text1, text2, name1, name2, print_limit=10):
    """逐位比较两份 JS 的代码行；返回退出码（0 = 代码行 1:1 同序对应）。"""
    a = js_code_lines(text1)
    b = js_code_lines(text2)
    errors, translations = [], []
    for i in range(min(len(a), len(b))):
        verdict = js_classify(a[i], b[i])
        if verdict == "same":
            continue
        if verdict == "translation":
            translations.append((i + 1, a[i], b[i]))
        else:
            errors.append((i + 1, a[i], b[i]))
    for i in range(len(b), len(a)):
        errors.append((i + 1, a[i], None))
    for i in range(len(a), len(b)):
        errors.append((i + 1, None, b[i]))

    print("JS check (order-sensitive, line-by-line): %s vs %s" % (name1, name2))
    print("  code lines: %s=%d | %s=%d" % (name1, len(a), name2, len(b)))
    if translations:
        print("  allowed (translation-only): %d line(s)" % len(translations))
        for pos, x, y in translations[:3]:
            print("    第 %d 行: %s  <->  %s" % (pos, x.strip()[:56], y.strip()[:56]))

    if not errors:
        print("Status: MATCHED - 代码行 1:1 同序对应，仅有译文/排版差异。")
        return 0

    print("Status: CODE MISMATCH - %d 处代码行不对应（不只是翻译差异）。" % len(errors))
    runs = [r for r in _contiguous_runs([e[0] for e in errors]) if r[1] - r[0] >= 4]
    if runs:
        print("  连续错位区段（疑似整块重排）：")
        for s, e in runs[:6]:
            print("    第 %d-%d 行（%d 行）" % (s, e, e - s + 1))
    for pos, x, y in errors[:print_limit]:
        print(
            "    第 %d 行: CN=%s | EN=%s"
            % (pos, "—" if x is None else x.strip()[:56], "—" if y is None else y.strip()[:56])
        )
    if len(errors) > print_limit:
        print("    ...（其余 %d 处省略）" % (len(errors) - print_limit))
    print("RESULT: %d line position(s) differ beyond translation." % len(errors))
    return 1


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
    
    if file_type == 'js':
        sys.exit(run_js_check(t1, t2, f1_path.name, f2_path.name))

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
