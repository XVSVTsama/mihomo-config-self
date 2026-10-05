"""Shared translation boundaries: real comments and Markdown prose only.

JavaScript uses Acorn's full parser, not slash heuristics. YAML uses scanner
scalar spans. Markdown conservatively protects code and link destinations.
"""

from functools import lru_cache
import json
from pathlib import Path
import re
import subprocess


@lru_cache(maxsize=32)
def _parse_js(text):
    helper = Path(__file__).with_name("js_comment_spans.cjs")
    try:
        result = subprocess.run(
            ["node", str(helper)], input=text.encode("utf-8"), capture_output=True,
            timeout=30, check=False,
        )
    except (OSError, subprocess.TimeoutExpired) as exc:
        raise ValueError("JavaScript parser unavailable: %s" % exc) from exc
    if result.returncode:
        raise ValueError(result.stderr.decode("utf-8", errors="replace").strip()[:500] or "JavaScript parser failed")
    parsed = json.loads(result.stdout)
    return (
        tuple(tuple(span) for span in parsed["comments"]),
        tuple(tuple(token) for token in parsed["tokens"]),
    )


def _yaml_tokens(text):
    import yaml

    try:
        return list(yaml.scan(text))
    except yaml.YAMLError as exc:
        raise ValueError("Invalid YAML: %s" % exc) from exc


def _yaml_comments(text):
    import yaml

    protected = [
        (token.start_mark.index, token.end_mark.index)
        for token in _yaml_tokens(text)
        if isinstance(token, yaml.tokens.ScalarToken)
    ]
    comments = []
    span_index = 0
    index = 0
    while index < len(text):
        while span_index < len(protected) and protected[span_index][1] <= index:
            span_index += 1
        if span_index < len(protected) and protected[span_index][0] <= index:
            index = protected[span_index][1]
            continue
        if text[index] == "#" and (index == 0 or text[index - 1].isspace()):
            end = text.find("\n", index)
            end = len(text) if end < 0 else end
            if end > index and text[end - 1] == "\r":
                end -= 1
            comments.append((index, end))
            index = end
        else:
            index += 1
    return comments


def comment_spans(text, kind):
    if kind == "js":
        return _parse_js(text)[0]
    if kind == "yaml":
        return _yaml_comments(text)
    raise ValueError("Unsupported source kind: %s" % kind)


def strip_comments(text, kind):
    pieces = []
    previous = 0
    for start, end in comment_spans(text, kind):
        pieces.append(text[previous:start])
        pieces.append(re.sub(r"[^\r\n\u2028\u2029]", " ", text[start:end]))
        previous = end
    pieces.append(text[previous:])
    return "".join(pieces)


def js_signature(text):
    # Keep newlines between tokens: inserting one after return changes ASI.
    return _parse_js(text)[1]


def yaml_signature(text):
    return [
        (type(token).__name__, tuple(sorted(
            (key, value) for key, value in vars(token).items()
            if key not in {"start_mark", "end_mark"}
        )))
        for token in _yaml_tokens(text)
    ]


def english_readme_switch(text):
    """The only intentional destination change is the README language switch."""
    pattern = re.compile(
        r'(?m)^([ \t]*)中文[ \t]*\|[ \t]*'
        r'(<a href="README_en\.md">English</a>|\[English\]\(README_en\.md\))[ \t]*$'
    )
    protected = markdown_protected_spans(text)
    return pattern.sub(
        lambda match: match[0] if any(start <= match.start() < end for start, end in protected) else match[1] + (
            'English | <a href="README.md">中文</a>'
            if match[2].startswith('<a') else 'English | [中文](README.md)'
        ), text,
    )


def markdown_protected_spans(text):
    """Protect fenced/indented/inline code, HTML tags, and link destinations.

    Deliberately conservative: HTML attributes and link titles are protected too.
    Malformed or unclosed fences protect through EOF instead of exposing code.
    """
    spans = []
    fence = None
    fence_start = 0
    offset = 0
    for line in text.splitlines(keepends=True):
        marker = re.match(r'^[ \t]{0,3}(`{3,}|~{3,})(.*)', line)
        if fence:
            if marker and marker[1][0] == fence[0] and len(marker[1]) >= len(fence) and not marker[2].strip():
                spans.append((fence_start, offset + len(line.rstrip('\r\n'))))
                fence = None
        elif marker:
            fence, fence_start = marker[1], offset
        elif (
            line.startswith(('    ', '\t')) and line.strip()
            and not re.match(r'^\s*(?:[-*+]|\d+[.)])\s', line)
        ):
            spans.append((offset, offset + len(line.rstrip('\r\n'))))
        offset += len(line)
    if fence:
        spans.append((fence_start, len(text)))

    # HTML code containers are executable/example content, not prose.
    for match in re.finditer(r'<(pre|code|script|style|textarea)\b[^>]*>', text, re.IGNORECASE):
        closing = re.search(r'</' + match[1] + r'\s*>', text[match.end():], re.IGNORECASE)
        spans.append((match.start(), match.end() + closing.end() if closing else len(text)))

    def inside(position):
        return any(start <= position < end for start, end in spans)

    for match in re.finditer(r'(?<!\\)(`+)', text):
        if inside(match.start()):
            continue
        closing = re.search(r'(?<!`)' + re.escape(match[0]) + r'(?!`)', text[match.end():])
        if closing:
            spans.append((match.start(), match.end() + closing.end()))

    for match in re.finditer(r'<(?:!--[\s\S]*?--|/?[A-Za-z][^<>]*|(?:https?://|mailto:)[^<>]*)>', text):
        if not inside(match.start()):
            spans.append(match.span())

    # Balanced parentheses allow destinations such as https://host/a_(b).
    for match in re.finditer(r'(?<!\\)\]\(', text):
        if inside(match.start()):
            continue
        depth, index = 1, match.end()
        while index < len(text) and depth:
            if text[index] == '\\':
                index += 2
                continue
            if text[index] == '(':
                depth += 1
            elif text[index] == ')':
                depth -= 1
            index += 1
        if not depth:
            spans.append((match.start(), index))

    patterns = (
        r'(?m)^[ \t]{0,3}\[[^\]\n]+\]:[^\n]*',  # Reference definitions.
        r'\]\[[^\]\n]*\]',  # Reference identifiers, not visible labels.
        r'https?://[^\s<>"`]+',
        r'(?m)^.*English[ \t]*\|[ \t]*(?:<a href="README\.md">中文</a>|\[中文\]\(README\.md\))[ \t]*$',
    )
    for pattern in patterns:
        for match in re.finditer(pattern, text):
            if not inside(match.start()):
                spans.append(match.span())

    # Collapsed and shortcut references bind their visible label to an ID.
    # Translate neither side, otherwise a translated label becomes a dead link.
    def reference_id(label):
        return ' '.join(label.split()).casefold()

    references = {
        reference_id(match[1])
        for match in re.finditer(r'(?m)^[ \t]{0,3}\[([^\]\n]+)\]:', text)
    }
    for match in re.finditer(r'(?<!\\)\[([^\]\n]+)\](?:\[\])?', text):
        if (
            reference_id(match[1]) in references and not inside(match.start())
            and text[match.end():match.end() + 1] not in ('(', '[')
        ):
            spans.append(match.span())

    merged = []
    for start, end in sorted(spans):
        if merged and start < merged[-1][1]:
            merged[-1] = (merged[-1][0], max(end, merged[-1][1]))
        else:
            merged.append((start, end))
    return merged


def prose_spans(text):
    spans, previous = [], 0
    for start, end in markdown_protected_spans(text):
        if previous < start:
            spans.append((previous, start))
        previous = end
    if previous < len(text):
        spans.append((previous, len(text)))
    return spans


def markdown_signature(text):
    return tuple(text[start:end] for start, end in markdown_protected_spans(text))
