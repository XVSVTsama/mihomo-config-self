#!/usr/bin/env python3
import sys
import re
from pathlib import Path
import difflib

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

def main():
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
    
    if p1 == p2:
        print(f"Success: {f1_path.name} and {f2_path.name} code content matches perfectly.")
        sys.exit(0)
    else:
        print(f"Error: Code content mismatch between {f1_path.name} and {f2_path.name}")
        diff = difflib.unified_diff(
            p1.splitlines(),
            p2.splitlines(),
            fromfile=f"{f1_path.name} (code only)",
            tofile=f"{f2_path.name} (code only)",
            lineterm=''
        )
        for line in diff:
            print(line)
        sys.exit(1)

if __name__ == "__main__":
    main()
