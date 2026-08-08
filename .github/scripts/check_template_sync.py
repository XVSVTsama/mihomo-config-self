#!/usr/bin/env python3
"""Check that script_override.js TEMPLATE matches mihomo.yaml.

The comparison intentionally allows:
1. .templates in mihomo.yaml: it only defines anchors, while TEMPLATE stores
   the expanded rule-provider values.
2. hidden: true on the FCM group in TEMPLATE: the script hides that group in
   the client UI, while the YAML template keeps it visible.
"""

import json
import os
import subprocess
import sys
import tempfile
from pathlib import Path

import yaml

ROOT = Path(__file__).resolve().parents[2]
YAML_PATH = ROOT / "mihomo.yaml"
JS_PATH = ROOT / "script_override.js"

IGNORED_TOP_LEVEL_KEYS = {".templates"}
JS_ONLY_GROUP_FIELDS = {"FCM": {"hidden": True}}

try:
    sys.stdout.reconfigure(encoding="utf-8")
except Exception:
    pass


def load_js_template():
    source = JS_PATH.read_text(encoding="utf-8")
    fd, tmp_path = tempfile.mkstemp(suffix=".js")
    try:
        with os.fdopen(fd, "w", encoding="utf-8") as fh:
            fh.write(source)
            fh.write("\nconsole.log(JSON.stringify(TEMPLATE));\n")
        proc = subprocess.run(
            ["node", tmp_path],
            capture_output=True,
            text=True,
            encoding="utf-8",
            check=False,
        )
    finally:
        os.unlink(tmp_path)
    if proc.returncode != 0:
        sys.exit("Failed to evaluate script_override.js:\n" + proc.stderr)
    return json.loads(proc.stdout)


def normalize_yaml(value):
    normalized = dict(value)
    for key in IGNORED_TOP_LEVEL_KEYS:
        normalized.pop(key, None)
    for group in normalized.get("proxy-groups") or []:
        name = group.get("name")
        if name in JS_ONLY_GROUP_FIELDS:
            for field, expected in JS_ONLY_GROUP_FIELDS[name].items():
                if group.get(field) is None:
                    group[field] = expected
    return normalized


def diff(a, b, path="", result=None):
    if result is None:
        result = []
    if type(a) is not type(b):
        result.append(
            (path, "type mismatch: %s != %s" % (type(a).__name__, type(b).__name__))
        )
        return result
    if isinstance(a, dict):
        for key in sorted(set(a) | set(b), key=str):
            child = "%s.%s" % (path, key) if path else str(key)
            if key not in a:
                result.append(
                    (
                        child,
                        "missing in YAML: %s"
                        % json.dumps(b[key], ensure_ascii=False),
                    )
                )
            elif key not in b:
                result.append(
                    (
                        child,
                        "missing in TEMPLATE: %s"
                        % json.dumps(a[key], ensure_ascii=False),
                    )
                )
            else:
                diff(a[key], b[key], child, result)
    elif isinstance(a, list):
        if len(a) != len(b):
            result.append(
                (path, "length mismatch: %d != %d" % (len(a), len(b)))
            )
        else:
            for index, (x, y) in enumerate(zip(a, b)):
                diff(x, y, "%s[%d]" % (path, index), result)
    elif a != b:
        result.append(
            (
                path,
                "value mismatch: %s != %s"
                % (
                    json.dumps(a, ensure_ascii=False),
                    json.dumps(b, ensure_ascii=False),
                ),
            )
        )
    return result


def main():
    with YAML_PATH.open(encoding="utf-8") as fh:
        yaml_config = yaml.safe_load(fh)
    template = load_js_template()
    differences = diff(normalize_yaml(yaml_config), template)
    if differences:
        print("Template sync failed with %d difference(s):" % len(differences))
        for path, message in differences:
            print("  %s: %s" % (path, message))
        sys.exit(1)
    print("Template sync OK: mihomo.yaml and script_override.js TEMPLATE match.")


if __name__ == "__main__":
    main()
