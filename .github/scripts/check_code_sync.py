#!/usr/bin/env python3
"""Require English files to preserve Chinese functional code and values."""

import difflib
from pathlib import Path
import sys

from translation_boundaries import js_signature, strip_comments, yaml_signature


def strip_js_comments(text):
    return strip_comments(text, "js")


def strip_yaml_comments(text):
    return strip_comments(text, "yaml")


def classify_diff(p1, p2, name1, name2):
    """Classify line differences without translating any functional values.

    The YAML signature check separately protects scalar whitespace and nesting;
    this comparison provides readable diagnostics for the remaining text.
    """
    matcher = difflib.SequenceMatcher(
        None, [line.rstrip() for line in p1], [line.rstrip() for line in p2],
        autojunk=False,
    )
    reasonable, abnormal = [], []
    for tag, i1, i2, j1, j2 in matcher.get_opcodes():
        if tag == "equal":
            continue
        for offset in range(max(i2 - i1, j2 - j1)):
            a = p1[i1 + offset] if i1 + offset < i2 else None
            b = p2[j1 + offset] if j1 + offset < j2 else None
            a_no, b_no = i1 + offset + 1, j1 + offset + 1
            if (a is None or not a.strip()) and (b is None or not b.strip()):
                reasonable.append(
                    "blank line count: %s line %d / %s line %d"
                    % (name1, a_no, name2, b_no)
                )
            elif a is not None and b is not None and a.strip() == b.strip():
                reasonable.append(
                    "indentation: %s line %d (%r) vs %s line %d (%r)"
                    % (name1, a_no, a, name2, b_no, b)
                )
            elif a is None:
                abnormal.append(
                    "content: %s line %d (%r) has no counterpart in %s"
                    % (name2, b_no, b, name1)
                )
            elif b is None:
                abnormal.append(
                    "content: %s line %d (%r) has no counterpart in %s"
                    % (name1, a_no, a, name2)
                )
            else:
                abnormal.append(
                    "content: %s line %d (%r) vs %s line %d (%r)"
                    % (name1, a_no, a, name2, b_no, b)
                )
    return reasonable, abnormal


def _short(value, limit=100):
    rendered = repr(value)
    return rendered if len(rendered) <= limit else rendered[:limit - 3] + "..."


def _report_signature_diff(a, b, name1, name2, print_limit=10):
    """Print bounded token diagnostics rather than whole source files."""
    matcher = difflib.SequenceMatcher(None, a, b, autojunk=False)
    count, shown = 0, 0
    for tag, i1, i2, j1, j2 in matcher.get_opcodes():
        if tag == "equal":
            continue
        count += max(i2 - i1, j2 - j1)
        for offset in range(max(i2 - i1, j2 - j1)):
            if shown >= print_limit:
                break
            x = a[i1 + offset] if i1 + offset < i2 else None
            y = b[j1 + offset] if j1 + offset < j2 else None
            print(
                "  %s token %d: %s | %s token %d: %s"
                % (name1, i1 + offset + 1, _short(x),
                   name2, j1 + offset + 1, _short(y))
            )
            shown += 1
    if count > shown:
        print("  ... (%d additional token differences omitted)" % (count - shown))
    return count


def run_js_check(text1, text2, name1, name2, print_limit=10):
    """Compare complete JS signatures, including literal text and line breaks."""
    print("JS check (functional tokens): %s vs %s" % (name1, name2))
    try:
        a, b = js_signature(text1), js_signature(text2)
    except ValueError as exc:
        print("Status: INVALID JAVASCRIPT - %s" % exc)
        return 1
    print("  tokens: %s=%d | %s=%d" % (name1, len(a), name2, len(b)))
    if a == b:
        print("Status: MATCHED - functional code is identical; only comments/layout may differ.")
        return 0
    print("Status: CODE MISMATCH - functional code differs.")
    count = _report_signature_diff(a, b, name1, name2, print_limit)
    print("RESULT: %d functional token difference(s)." % count)
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
    f1_path, f2_path = Path(sys.argv[2]), Path(sys.argv[3])
    if file_type not in ("js", "yaml"):
        print("Error: Unknown file type %s" % file_type)
        sys.exit(1)
    if not f1_path.exists() or not f2_path.exists():
        print("Error: One or both files do not exist: %s, %s" % (f1_path, f2_path))
        sys.exit(1)
    t1, t2 = f1_path.read_text(encoding="utf-8"), f2_path.read_text(encoding="utf-8")
    if file_type == "js":
        sys.exit(run_js_check(t1, t2, f1_path.name, f2_path.name))

    try:
        a, b = yaml_signature(t1), yaml_signature(t2)
        p1, p2 = strip_yaml_comments(t1).splitlines(), strip_yaml_comments(t2).splitlines()
    except ImportError as exc:
        print("Error: YAML checking requires PyYAML: %s" % exc)
        sys.exit(1)
    except ValueError as exc:
        print("Status: INVALID YAML - %s" % exc)
        sys.exit(1)
    if a != b:
        print("Status: YAML MISMATCH - functional tokens/scalar values differ.")
        _report_signature_diff(a, b, f1_path.name, f2_path.name)
        sys.exit(1)

    reasonable, abnormal = classify_diff(p1, p2, f1_path.name, f2_path.name)
    if abnormal:
        print("Status: ABNORMAL DIFFERENCES between %s and %s" % (f1_path.name, f2_path.name))
        for item in abnormal[:10]:
            print("  - %s" % item)
        if len(abnormal) > 10:
            print("  ... (%d additional differences omitted)" % (len(abnormal) - 10))
        sys.exit(1)
    print("Status: MATCHED - functional YAML is identical; only comments/layout may differ.")
    if reasonable:
        print("  ignored layout differences: %d" % len(reasonable))
    sys.exit(0)


if __name__ == "__main__":
    main()
