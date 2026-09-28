#!/usr/bin/env python3
"""Sync mihomo.yaml from the TEMPLATE embedded in script_override.js.

The JS file is authoritative (see README: on any difference, the JS wins).
This script applies a *text-level patch* -- not a regeneration -- so every
byte outside the changed regions (comments, formatting, trailing spaces,
YAML anchors, odd indentation) is preserved exactly.

Pipeline:
  1. Evaluate TEMPLATE from script_override.js via node (same approach as
     check_template_sync.py).
  2. Diff the normalized expanded YAML against TEMPLATE
     (same semantics as check_template_sync.diff) to get structural ops.
  3. Translate each op into (start_line, end_line, new_lines) text edits,
     using ruamel.yaml only for line/col positions (never for dumping).
     ``rule-providers`` entries are anchor-aware: rebuilt lines reuse the
     ``.templates`` anchors whose definition matches the TEMPLATE value.
  4. Apply edits bottom-up, write the file, and self-verify with
     check_template_sync.py's own comparison. Exit non-zero if any
     difference remains.

Exit status: 0 when already in sync or synced successfully, 1 on failure.
"""

import copy
import difflib
import json
import sys
from pathlib import Path

import yaml as pyyaml
from ruamel.yaml import YAML
from ruamel.yaml.comments import CommentedMap, CommentedSeq

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / ".github" / "scripts"))
import check_template_sync as check  # noqa: E402  (reuse node-eval + normalize)

YAML_PATH = ROOT / "mihomo.yaml"

try:
    sys.stdout.reconfigure(encoding="utf-8")
except Exception:
    pass


# ---------------------------------------------------------------------------
# diff -> ops (tuple paths; same semantics as check_template_sync.diff)
# ---------------------------------------------------------------------------
#   ("set", path, value)                replace scalar / whole subtree
#   ("add", parent_path, key, value)    insert mapping key
#   ("del", parent_path, key)           remove mapping key
#   ("list", path, tag, i1, i2, items)  difflib opcode on a sequence

def canon(value):
    return (type(value).__name__, json.dumps(value, sort_keys=True,
                                            ensure_ascii=False, default=str))


def compute_ops(a, b, path=()):
    ops = []
    if type(a) is not type(b):
        return [("set", path, b)]
    if isinstance(a, dict):
        for key in b:
            if key not in a:
                ops.append(("add", path, key, b[key]))
        for key in a:
            if key not in b:
                ops.append(("del", path, key))
        for key in a:
            if key in b:
                ops.extend(compute_ops(a[key], b[key], path + (key,)))
    elif isinstance(a, list):
        matcher = difflib.SequenceMatcher(a=[canon(x) for x in a],
                                          b=[canon(x) for x in b],
                                          autojunk=False)
        for tag, i1, i2, j1, j2 in matcher.get_opcodes():
            if tag != "equal":
                ops.append(("list", path, tag, i1, i2, b[j1:j2]))
    elif a != b:
        ops.append(("set", path, b))
    return ops


# ---------------------------------------------------------------------------
# scalar / key rendering
# ---------------------------------------------------------------------------

_PLAIN_WORDS = {"y", "n", "yes", "no", "true", "false", "on", "off",
                "null", "~", "none"}
_QUOTE_STARTS = set("-?:,[]{}#&*!|>'\"%@`")


def _looks_numeric(text):
    try:
        float(text)
        return True
    except ValueError:
        pass
    try:
        int(text, 0)
        return True
    except ValueError:
        return False


def quote_key(text):
    """Conservative quoting for mapping keys (matches file conventions)."""
    if not isinstance(text, str):
        return str(text)
    if text == "" or text.strip() != text:
        return "'" + text.replace("'", "''") + "'"
    if text[0] in _QUOTE_STARTS:
        return "'" + text.replace("'", "''") + "'"
    if any(c in text for c in ":#{}[],&*?'\""):
        return "'" + text.replace("'", "''") + "'"
    if text.lower() in _PLAIN_WORDS or _looks_numeric(text):
        return "'" + text.replace("'", "''") + "'"
    return text


def quote_val(text):
    """Permissive quoting for scalar values (matches file conventions)."""
    if not isinstance(text, str):
        return text
    if text == "" or text.strip() != text:
        return "'" + text.replace("'", "''") + "'"
    if text[0] in _QUOTE_STARTS:
        return "'" + text.replace("'", "''") + "'"
    if " #" in text or ": " in text or text.endswith(("#", ":")):
        return "'" + text.replace("'", "''") + "'"
    if text.lower() in _PLAIN_WORDS or _looks_numeric(text):
        return "'" + text.replace("'", "''") + "'"
    return text


def render_scalar(value, old_text=""):
    """Render a scalar, preserving the old quoting style when possible."""
    if isinstance(value, bool):
        return "true" if value else "false"
    if value is None:
        return "null"
    if isinstance(value, (int, float)):
        return str(value)
    text = str(value)
    if len(old_text) >= 2 and old_text[0] == old_text[-1] \
            and old_text[0] in ("'", '"'):
        quote = old_text[0]
        if quote == "'":
            return "'" + text.replace("'", "''") + "'"
        return '"' + text.replace('"', '\\"') + '"'
    return quote_val(text)


def split_scalar_comment(line, col):
    """Split line[col:] into (scalar_text, comment) for a single-line scalar."""
    rest = line[col:]
    if rest.startswith("'"):
        end = 1
        while True:
            nxt = rest.find("'", end)
            if nxt == -1:
                break
            if nxt + 1 < len(rest) and rest[nxt + 1] == "'":
                end = nxt + 2
                continue
            end = nxt + 1
            break
        scalar, tail = rest[:end], rest[end:]
    elif rest.startswith('"'):
        end = 1
        while True:
            nxt = rest.find('"', end)
            if nxt == -1:
                break
            # count preceding backslashes
            bs = 0
            i = nxt - 1
            while i >= 0 and rest[i] == "\\":
                bs += 1
                i -= 1
            if bs % 2 == 1:
                end = nxt + 1
                continue
            end = nxt + 1
            break
        scalar, tail = rest[:end], rest[end:]
    else:
        idx = rest.find(" #")
        if idx == -1:
            scalar, tail = rest.rstrip(), ""
        else:
            scalar, tail = rest[:idx].rstrip(), rest[idx:]
    return scalar, tail


# ---------------------------------------------------------------------------
# anchor-aware rule-providers rendering
# ---------------------------------------------------------------------------

def anchor_defs(templates_rt):
    defs = {}
    if templates_rt:
        for name in templates_rt:
            try:
                defs[name] = dict(templates_rt[name])
            except Exception:
                continue
    return defs


def infer_anchor(effective, templates_rt):
    best, best_size = None, -1
    for name, definition in anchor_defs(templates_rt).items():
        if all(k in effective and effective[k] == v
               for k, v in definition.items()):
            if len(definition) > best_size:
                best, best_size = name, len(definition)
    return best


def render_provider_line(indent, name, effective, templates_rt):
    """Render e.g. `  apple: { <<: *domain_yaml, url: '...', path: ... }`."""
    anchor = infer_anchor(effective, templates_rt)
    parts = []
    explicit_keys = list(effective)
    if anchor:
        parts.append("<<: *%s" % anchor)
        definition = anchor_defs(templates_rt)[anchor]
        explicit_keys = [k for k in effective
                         if not (k in definition and definition[k]
                                 == effective[k])]
    for key in explicit_keys:
        val = effective[key]
        if key == "url" and isinstance(val, str):
            rendered = "'" + val.replace("'", "''") + "'"
        else:
            rendered = render_scalar(val)
        parts.append("%s: %s" % (quote_key(key), rendered))
    return " " * indent + "%s: { %s }" % (quote_key(name),
                                          ", ".join(parts))


# ---------------------------------------------------------------------------
# text patcher
# ---------------------------------------------------------------------------

class PatchError(Exception):
    pass


class TextPatcher:
    def __init__(self, text):
        self.lines = text.split("\n")
        yaml = YAML()
        yaml.preserve_quotes = True
        self.rt = yaml.load(text)
        self.expanded = pyyaml.safe_load(text)
        # all lc-documented line numbers, for span computations
        self.doc_lines = sorted(self._collect_lines(self.rt))

    def _collect_lines(self, node):
        found = set()
        try:
            if isinstance(node, dict):
                for key in node:
                    try:
                        found.add(node.lc.key(key)[0])
                    except Exception:
                        pass
                    try:
                        found.add(node.lc.value(key)[0])
                    except Exception:
                        pass
                    found |= self._collect_lines(node[key])
            elif isinstance(node, list):
                for i in range(len(node)):
                    try:
                        found.add(node.lc.item(i)[0])
                    except Exception:
                        pass
                    found |= self._collect_lines(node[i])
        except Exception:
            pass
        return found

    # -- navigation ------------------------------------------------------
    def navigate(self, path):
        node = self.rt
        for part in path:
            node = node[part]
        return node

    def subtree_max_line(self, node):
        lines = self._collect_lines(node)
        return max(lines) if lines else None

    def next_doc_line(self, line):
        """First documented line strictly after `line`, else len(lines)."""
        for documented in self.doc_lines:
            if documented > line:
                return documented
        return len(self.lines)

    def key_indent(self, parent, key):
        return parent.lc.key(key)[1]

    # -- edit application --------------------------------------------------
    def apply_edits(self, edits):
        """edits: list of (start, end_exclusive, new_lines). Bottom-up."""
        for start, end, new_lines in sorted(edits, key=lambda e: -e[0]):
            self.lines[start:end] = new_lines

    def result(self):
        return "\n".join(self.lines)


# ---------------------------------------------------------------------------
# op -> text edits
# ---------------------------------------------------------------------------

def render_block(value, indent, dash_indent=None):
    """Render a plain dict/list value as block YAML lines."""
    lines = []
    if isinstance(value, dict):
        for key, item in value.items():
            prefix = " " * indent + "%s:" % quote_key(key)
            if isinstance(item, dict):
                lines.append(prefix)
                lines.extend(render_block(item, indent + 2))
            elif isinstance(item, list):
                lines.append(prefix)
                di = dash_indent if dash_indent is not None else indent + 2
                lines.extend(render_block(item, indent, di))
            else:
                lines.append("%s %s" % (prefix, render_scalar(item)))
    elif isinstance(value, list):
        di = dash_indent if dash_indent is not None else indent
        for item in value:
            if isinstance(item, dict):
                lines.append(" " * di + "-")
                lines.extend(render_block(item, di + 2))
            elif isinstance(item, list):
                lines.append(" " * di + "-")
                lines.extend(render_block(item, di + 2))
            else:
                lines.append(" " * di + "- %s" % render_scalar(item))
    return lines


def sibling_dash_indent(patcher, seq_node):
    """Infer dash indent from the sequence's own first item line."""
    try:
        line_no, _ = seq_node.lc.item(0)
    except Exception:
        return None
    line = patcher.lines[line_no]
    idx = line.find("-")
    if idx != -1:
        return idx
    return None


def build_edits(patcher, ops, expanded, template):
    edits = []
    templates_rt = patcher.rt.get(".templates")

    # group list-ops per path so they can be applied in reverse index order
    list_ops = {}
    for op in ops:
        if op[0] == "list":
            list_ops.setdefault(op[1], []).append(op)

    for op in ops:
        kind = op[0]
        if kind == "set":
            _, path, value = op
            edits.extend(edit_set(patcher, path, value, expanded,
                                  templates_rt))
        elif kind == "del":
            _, parent_path, key = op
            edits.extend(edit_del(patcher, parent_path, key, expanded,
                                  templates_rt))
        elif kind == "add":
            _, parent_path, key, value = op
            edits.extend(edit_add(patcher, parent_path, key, value,
                                  expanded, template, templates_rt))
        # list ops handled below in reverse index order

    for path, lops in list_ops.items():
        if len(path) >= 2 and path[0] == "rule-providers":
            # anchor-aware: rebuild the provider line from the new effective
            for _, _, tag, i1, i2, items in lops:
                edits.extend(edit_provider_list(patcher, path, tag, i1, i2,
                                                items, expanded, templates_rt))
            continue
        for _, _, tag, i1, i2, items in sorted(lops, key=lambda o: -o[3]):
            edits.extend(edit_list(patcher, path, tag, i1, i2, items))
    return edits


def edit_provider_list(patcher, path, tag, i1, i2, items, expanded,
                       templates_rt):
    name = path[1]
    parent = patcher.navigate(path[:1])
    kline, kcol = parent.lc.key(name)
    new_effective = copy.deepcopy(expanded["rule-providers"][name])
    target = new_effective
    for part in path[2:-1]:
        target = target[part]
    seq = target[path[-1]]
    if tag == "delete":
        del seq[i1:i2]
    elif tag == "insert":
        seq[i1:i1] = list(items)
    else:
        seq[i1:i2] = list(items)
    old_line = patcher.lines[kline]
    _, comment = split_scalar_comment(old_line, parent.lc.value(name)[1])
    new_line = render_provider_line(kcol, name, new_effective, templates_rt)
    return [(kline, kline + 1, [new_line + comment])]


def edit_set(patcher, path, value, expanded, templates_rt):
    parent = patcher.navigate(path[:-1])
    key = path[-1]
    kline, kcol = parent.lc.key(key)

    # anchor-aware: anything under rule-providers/<name> rebuilds the line
    if len(path) >= 2 and path[0] == "rule-providers":
        name = path[1]
        if len(path) == 2:
            new_effective = copy.deepcopy(value)
        else:
            new_effective = copy.deepcopy(expanded["rule-providers"][name])
            _apply_op_to_plain(new_effective, ("set", path, value), path[:2])
        old_line = patcher.lines[kline]
        _, comment = split_scalar_comment(old_line,
                                          parent.lc.value(key)[1])
        new_line = render_provider_line(kcol, name, new_effective,
                                        templates_rt)
        return [(kline, kline + 1, [new_line + comment])]

    vline, vcol = parent.lc.value(key)
    old_value = patcher.navigate(path)
    if isinstance(old_value, (dict, list)) or isinstance(value, (dict, list)):
        # whole-subtree replacement (e.g. type change)
        max_line = patcher.subtree_max_line(old_value)
        end = patcher.next_doc_line(max_line if max_line is not None
                                    else kline)
        new_lines = render_block({key: value}, kcol)
        return [(kline, end, new_lines)]

    line = patcher.lines[vline]
    old_scalar, comment = split_scalar_comment(line, vcol)
    new_line = line[:vcol] + render_scalar(value, old_scalar) + comment
    return [(vline, vline + 1, [new_line])]


def edit_del(patcher, parent_path, key, expanded, templates_rt):
    parent = patcher.navigate(parent_path)
    kline, _ = parent.lc.key(key)
    old_value = parent[key]
    if isinstance(old_value, (dict, list)):
        max_line = patcher.subtree_max_line(old_value)
        end = patcher.next_doc_line(max_line if max_line is not None
                                    else kline)
    else:
        end = kline + 1
    return [(kline, end, [])]


def edit_add(patcher, parent_path, key, value, expanded, template,
             templates_rt):
    parent = patcher.navigate(parent_path)

    if parent_path == ("rule-providers",):
        return edit_add_provider(patcher, parent, key, value, templates_rt)

    # insertion point: TEMPLATE-order-relative
    tmpl_parent = template
    for part in parent_path:
        tmpl_parent = tmpl_parent[part]
    tmpl_keys = list(tmpl_parent)
    yaml_keys = list(parent)
    try:
        pos = tmpl_keys.index(key)
    except ValueError:
        pos = len(tmpl_keys)
    after_keys = [k for k in tmpl_keys[:pos] if k in yaml_keys]
    before_keys = [k for k in tmpl_keys[pos + 1:] if k in yaml_keys]

    if isinstance(value, dict):
        indent = patcher.key_indent(parent, yaml_keys[0])
        new_lines = render_block({key: value}, indent)
    elif isinstance(value, list):
        indent = patcher.key_indent(parent, yaml_keys[0])
        di = None
        for sibling in yaml_keys:
            if isinstance(parent[sibling], list):
                di = sibling_dash_indent(patcher, parent[sibling])
                if di is not None:
                    break
        new_lines = render_block({key: value}, indent, di)
    else:
        indent = patcher.key_indent(parent, yaml_keys[0])
        new_lines = [" " * indent + "%s: %s" % (quote_key(key),
                                                render_scalar(value))]

    if after_keys:
        anchor_key = after_keys[-1]
        anchor_val = parent[anchor_key]
        if isinstance(anchor_val, (dict, list)):
            max_line = patcher.subtree_max_line(anchor_val)
            insert_at = patcher.next_doc_line(max_line)
        else:
            insert_at = patcher.key_line_no(parent, anchor_key) + 1
        return [(insert_at, insert_at, new_lines)]
    if before_keys:
        anchor_key = before_keys[0]
        insert_at = patcher.key_line_no(parent, anchor_key)
        return [(insert_at, insert_at, new_lines)]
    # append at end of mapping
    last_key = yaml_keys[-1]
    last_val = parent[last_key]
    if isinstance(last_val, (dict, list)):
        max_line = patcher.subtree_max_line(last_val)
        insert_at = patcher.next_doc_line(max_line)
    else:
        insert_at = patcher.key_line_no(parent, last_key) + 1
    return [(insert_at, insert_at, new_lines)]


def edit_add_provider(patcher, parent, key, value, templates_rt):
    # byte-sorted insertion among the surviving keys
    indent = patcher.key_indent(parent, list(parent)[0])
    new_line = render_provider_line(indent, key, value, templates_rt)
    for existing in sorted(parent):
        if existing > key:
            insert_at = parent.lc.key(existing)[0]
            return [(insert_at, insert_at, [new_line])]
    last_key = sorted(parent)[-1]
    last_val = parent[last_key]
    if isinstance(last_val, (dict, list)):
        max_line = patcher.subtree_max_line(last_val)
        insert_at = patcher.next_doc_line(max_line)
    else:
        insert_at = parent.lc.key(last_key)[0] + 1
    return [(insert_at, insert_at, [new_line])]


def edit_list(patcher, path, tag, i1, i2, items):
    seq = patcher.navigate(path)
    n = len(seq)
    dash_indent = sibling_dash_indent(patcher, seq)

    def item_span(i):
        start, _ = seq.lc.item(i)
        if i + 1 < n:
            end, _ = seq.lc.item(i + 1)
        else:
            max_line = patcher.subtree_max_line(seq[i])
            end = patcher.next_doc_line(max_line if max_line is not None
                                        else start)
        return start, end

    def render_item(item):
        di = dash_indent if dash_indent is not None else 2
        if isinstance(item, dict):
            sub = render_block(item, di + 2)
            return [" " * di + "-"] + sub if sub else [" " * di + "-"]
        if isinstance(item, list):
            sub = render_block(item, di + 2)
            return [" " * di + "-"] + sub if sub else [" " * di + "-"]
        return [" " * di + "- %s" % render_scalar(item)]

    new_lines = []
    for item in items:
        new_lines.extend(render_item(item))

    if tag == "delete":
        start, _ = item_span(i1)
        _, end = item_span(i2 - 1)
        return [(start, end, [])]
    if tag == "insert":
        if i1 < n:
            at, _ = item_span(i1)
        else:
            _, at = item_span(n - 1)
        return [(at, at, new_lines)]
    # replace
    start, _ = item_span(i1)
    _, end = item_span(i2 - 1)
    return [(start, end, new_lines)]


def _apply_op_to_plain(node, op, base_path):
    """Apply a single ('set', path, value) op to a plain dict (for providers)."""
    kind, path, value = op
    assert kind == "set"
    rel = path[len(base_path):]
    target = node
    for part in rel[:-1]:
        target = target[part]
    target[rel[-1]] = value


# needs TextPatcher.key_line_no used above
def _key_line_no(self, parent, key):
    return parent.lc.key(key)[0]


TextPatcher.key_line_no = _key_line_no


# ---------------------------------------------------------------------------
# main
# ---------------------------------------------------------------------------

def main():
    template = check.load_js_template()
    text = YAML_PATH.read_text(encoding="utf-8")
    expanded = pyyaml.safe_load(text)
    normalized = check.normalize_yaml(copy.deepcopy(expanded))

    ops = compute_ops(normalized, template)
    if not ops:
        print("Already in sync: mihomo.yaml matches script_override.js TEMPLATE.")
        return 0

    print("Applying %d patch op(s) to mihomo.yaml ..." % len(ops))
    patcher = TextPatcher(text)
    try:
        edits = build_edits(patcher, ops, expanded, template)
    except PatchError as exc:
        print("PATCH FAILED: %s" % exc)
        return 1
    patcher.apply_edits(edits)
    new_text = patcher.result()
    YAML_PATH.write_text(new_text, encoding="utf-8")

    # Self-verify with the check's own comparison semantics.
    fresh = pyyaml.safe_load(YAML_PATH.read_text(encoding="utf-8"))
    remaining = check.diff(check.normalize_yaml(copy.deepcopy(fresh)), template)
    if remaining:
        print("SELF-VERIFY FAILED with %d difference(s):" % len(remaining))
        for diff_path, message in remaining:
            print("  %s: %s" % (diff_path, message))
        return 1
    print("Synced %d op(s); self-verify passed: mihomo.yaml now matches TEMPLATE."
          % len(ops))
    return 0


if __name__ == "__main__":
    sys.exit(main())
