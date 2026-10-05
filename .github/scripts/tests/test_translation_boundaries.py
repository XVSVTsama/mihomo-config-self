"""Regression tests for changes that used to pass as harmless translations."""

import contextlib
import io
import os
from pathlib import Path
import shutil
import sys
import tempfile
import unittest
from unittest.mock import patch

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
import check_code_sync as check
import sync_english as sync
from translation_boundaries import comment_spans, english_readme_switch, js_signature, markdown_signature, yaml_signature


class CodeSyncTests(unittest.TestCase):
    def assert_js_rejected(self, source, translated):
        with contextlib.redirect_stdout(io.StringIO()):
            self.assertEqual(check.run_js_check(source, translated, "cn", "en"), 1)

    def test_group_definition_and_reference_cannot_use_different_names(self):
        source = ["  - name: 🤖 AI大模型", "  - DOMAIN,api.anthropic.com,🤖 AI大模型"]
        translated = ["  - name: 🤖 AI大模型", "  - DOMAIN,api.anthropic.com,🤖 AI"]
        _, errors = check.classify_diff(source, translated, "cn", "en")
        self.assertTrue(errors)

    def test_filter_is_functional_even_when_it_contains_chinese(self):
        _, errors = check.classify_diff(
            ['filter: "美国|住宅"'], ['filter: "US|Residential"'], "cn", "en"
        )
        self.assertTrue(errors)

    def test_js_chinese_string_values_are_functional(self):
        self.assert_js_rejected('const group = "🤖 AI大模型";', 'const group = "🤖 AI";')

    def test_js_whitespace_inside_strings_is_functional(self):
        self.assert_js_rejected('const x = "a  b";', 'const x = "a b";')

    def test_js_line_terminators_end_comments_before_following_code(self):
        for newline in ("\r", "\r\n", "\u2028", "\u2029"):
            with self.subTest(newline=repr(newline)):
                self.assert_js_rejected(
                    '// 注释' + newline + 'const x = "美国";',
                    '// comment' + newline + 'const x = "日本";',
                )

    def test_js_return_line_break_cannot_be_added_by_translation(self):
        self.assert_js_rejected(
            "function value() { return /* 注释 */ 1; }",
            "function value() { return /* comment\n */ 1; }",
        )

    def test_js_comment_markers_inside_strings_are_functional(self):
        for a, b in [
            ('const x = "a // 美国";', 'const x = "a // 日本";'),
            ('const x = "a /* 美国 */";', 'const x = "a /* 日本 */";'),
            ('const x = `a // 美国 ${1}`;', 'const x = `a // 日本 ${1}`;'),
            ('const x = /[/*]/; /* 美国 */', 'const x = /[/**]/; /* English */'),
        ]:
            with self.subTest(source=a):
                self.assert_js_rejected(a, b)

    def test_js_comments_can_change_without_changing_code(self):
        source = '/* 中文\n * 注释 */\nconst x = "https://a/b"; // 注释\n'
        translated = '/* English comment */\nconst x = "https://a/b"; // comment\n'
        with contextlib.redirect_stdout(io.StringIO()):
            self.assertEqual(check.run_js_check(source, translated, "cn", "en"), 0)

    def test_regexp_after_label_or_case_block_is_not_a_comment(self):
        for source in (
            'label: {} /[/* 美国 */]/.test("x");',
            'switch (x) { case 1: {} /[/* 美国 */]/.test("x"); }',
        ):
            with self.subTest(source=source):
                self.assert_js_rejected(source, source.replace('美国', '日本'))

    def test_yaml_hash_inside_quoted_scalar_is_functional(self):
        self.assertNotEqual(
            check.strip_yaml_comments('name: "美国 # 住宅"'),
            check.strip_yaml_comments('name: "美国 # 机房"'),
        )

    def test_yaml_block_scalar_hash_line_is_functional(self):
        self.assertNotEqual(
            check.strip_yaml_comments("payload: |\n  # 美国\n  value\n"),
            check.strip_yaml_comments("payload: |\n  # 日本\n  value\n"),
        )

    def test_yaml_block_scalar_blank_lines_are_functional(self):
        self.assertNotEqual(
            yaml_signature("payload: |\n  first\n\n  second\n"),
            yaml_signature("payload: |\n  first\n  second\n"),
        )


class GoogleBoundaryTests(unittest.TestCase):
    def test_google_preserves_repository_functional_content(self):
        for name, kind, signature in (
            ('script_override.js', 'js', js_signature),
            ('mihomo.yaml', 'yaml', yaml_signature),
            ('README.md', 'readme', markdown_signature),
        ):
            with self.subTest(name=name):
                source = (sync.ROOT / name).read_text(encoding='utf-8')
                with patch.object(sync, 'call_google_fragment', return_value='English'):
                    result = sync.google_translate_chunk(source, kind, {})
                baseline = english_readme_switch(source) if kind == 'readme' else source
                self.assertEqual(signature(baseline), signature(result))

    def test_block_comment_line_breaks_preserve_return_semantics(self):
        source = 'function f() { return /* 中文\n注释 */ 1; }'
        with patch.object(sync, "call_google_fragment", return_value="English"):
            result = sync.google_translate_chunk(source, "js", {})
        with contextlib.redirect_stdout(io.StringIO()):
            self.assertEqual(check.run_js_check(source, result, "cn", "en"), 0)

    def test_readme_implicit_references_and_html_code_are_protected(self):
        source = (
            '[链接][] 和 [链接]\n\n[链接]: https://example.test/a\n'
            '<pre><code>filter: 美国|住宅</code></pre>\n'
        )
        with patch.object(sync, "call_google_fragment", return_value="English"):
            result = sync.google_translate_chunk(source, "readme", {})
        for protected in ('[链接][]', '[链接]', '<pre><code>filter: 美国|住宅</code></pre>'):
            self.assertIn(protected, result)

    def test_language_switch_inside_code_must_not_be_rewritten(self):
        source = '```html\n中文 | <a href="README_en.md">English</a>\n```\n'
        self.assertEqual(english_readme_switch(source), source)

    def test_readme_nested_bullets_are_prose_not_indented_code(self):
        source = '* 说明\n    * 中文 `filter`\n'
        with patch.object(sync, "call_google_fragment", return_value="English"):
            result = sync.google_translate_chunk(source, "readme", {})
        self.assertNotIn('中文', result)
        self.assertIn('`filter`', result)

    def test_readme_language_switch_is_the_only_allowed_link_change(self):
        source = '中文 | <a href="README_en.md">English</a>\n'
        expected = 'English | <a href="README.md">中文</a>\n'
        with patch.object(sync, "call_google_fragment", side_effect=AssertionError('Do not translate prepared switch')):
            self.assertEqual(sync.google_translate_chunk(source, "readme", {}), expected)

    def test_regexp_and_emoji_offsets_are_protected(self):
        source = 'const x = "🤖"; label: {} /[/* 美国 */]/.test(x); // 注释\n'
        with patch.object(sync, "call_google_fragment", return_value="English"):
            self.assertEqual(
                sync.google_translate_chunk(source, "js", {}),
                source.replace('// 注释', '// English'),
            )

    def test_readme_code_and_link_destinations_are_protected(self):
        source = (
            '中文 `美国|住宅` [说明](https://example.test/美国)\n'
            '<img src="assets/美国.png" alt="中文">\n'
            '```yaml\nfilter: 美国|住宅\n```\n'
            '    name: 🤖 AI大模型\n'
        )
        with patch.object(sync, "call_google_fragment", return_value="English"):
            result = sync.google_translate_chunk(source, "readme", {})
        for protected in (
            '`美国|住宅`', 'https://example.test/美国', 'src="assets/美国.png"',
            '```yaml\nfilter: 美国|住宅\n```', '    name: 🤖 AI大模型',
        ):
            with self.subTest(protected=protected):
                self.assertIn(protected, result)
        self.assertNotIn('>中文<', result)

    def test_comments_after_division_are_translated(self):
        source = 'const a = {} / 2; // 注释\nconst b = object.return / 2; // 注释\n'
        expected = 'const a = {} / 2; // English\nconst b = object.return / 2; // English\n'
        with patch.object(sync, "call_google_fragment", return_value="English"):
            self.assertEqual(sync.google_translate_chunk(source, "js", {}), expected)

    def test_multiline_literals_and_nested_templates_are_protected(self):
        source = 'const x = `第一行\n// 内容 ${`内层 ${1}`}\n第二行`; // 注释\n'
        expected = 'const x = `第一行\n// 内容 ${`内层 ${1}`}\n第二行`; // English\n'
        with patch.object(sync, "call_google_fragment", return_value="English"):
            self.assertEqual(sync.google_translate_chunk(source, "js", {}), expected)

    def test_js_only_actual_comments_are_translated(self):
        source = (
            'const a = "美国 // 住宅"; // 中文注释\n'
            'const b = "美国 /* 住宅 */"; /* 中文注释 */\n'
            'const c = `美国 // 住宅 ${1}`; // 中文注释\n'
            'const r = /[/*]/; // 中文注释\n'
        )
        expected = (
            'const a = "美国 // 住宅"; // English\n'
            'const b = "美国 /* 住宅 */"; /* English */\n'
            'const c = `美国 // 住宅 ${1}`; // English\n'
            'const r = /[/*]/; // English\n'
        )
        with patch.object(sync, "call_google_fragment", return_value="English"):
            self.assertEqual(sync.google_translate_chunk(source, "js", {}), expected)

    def test_yaml_scalars_and_url_fragments_are_not_translated(self):
        source = (
            'name: "美国 # 住宅" # 中文注释\n'
            'url: https://dns.test/query#美国\n'
            'payload: |\n  # 美国\n  value\n'
            '# 中文注释\n'
        )
        expected = (
            'name: "美国 # 住宅" # English\n'
            'url: https://dns.test/query#美国\n'
            'payload: |\n  # 美国\n  value\n'
            '# English\n'
        )
        with patch.object(sync, "call_google_fragment", return_value="English"):
            self.assertEqual(sync.google_translate_chunk(source, "yaml", {}), expected)


class ProviderValidationTests(unittest.TestCase):
    def test_invalid_provider_output_does_not_replace_existing_file(self):
        source = '# 注释\nproxy-groups:\n  - name: 🤖 AI大模型\n    filter: 美国|住宅\n'
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            scripts = root / '.github' / 'scripts'
            scripts.mkdir(parents=True)
            for name in ('check_code_sync.py', 'translation_boundaries.py'):
                shutil.copy2(Path(check.__file__).parent / name, scripts / name)
            (root / 'mihomo.yaml').write_text(source, encoding='utf-8')
            original = '# Existing English file\n'
            (root / 'mihomo_en.yaml').write_text(original, encoding='utf-8')
            with (
                patch.object(sync, 'ROOT', root),
                patch.object(sync, 'GLOSSARY_PATH', root / 'glossary.json'),
                patch.object(sync, 'PAIRS', [('mihomo.yaml', 'mihomo_en.yaml', 'yaml')]),
                patch.dict(os.environ, {
                    'GEMINI_API_KEY': 'fixture-key', 'SYNC_USE_GOOGLE_FALLBACK': '0',
                    'SYNC_MAX_ATTEMPTS': '1', 'PYTHONPATH': os.environ.get('PYTHONPATH', ''),
                }, clear=True),
                patch.object(sync, 'call_provider', return_value=source.replace('美国|住宅', 'US|Residential')),
                contextlib.redirect_stdout(io.StringIO()),
                self.assertRaises(SystemExit) as stopped,
            ):
                sync.main()
            self.assertEqual(stopped.exception.code, 1)
            self.assertEqual((root / 'mihomo_en.yaml').read_text(encoding='utf-8'), original)

    def test_truncation_retry_skips_functional_chinese_piece(self):
        source = 'proxies:\n  - name: ' + ('美国' * 250) + '\n# 中文注释\n'
        with patch.object(sync, 'call_provider', side_effect=[
            sync.ProviderError('gemini', 'truncated', truncated=True), '# English',
        ]) as provider, contextlib.redirect_stdout(io.StringIO()):
            result = sync.translate_chunk(
                'gemini', 'yaml', {}, 'prompt', source, 'fixture-key', 'fixture-model', 30, 1,
                eligible_spans=comment_spans(source, 'yaml'),
            )
        self.assertEqual(provider.call_count, 2)
        self.assertEqual(result, source.replace('# 中文注释', '# English'))

    def test_readme_implicit_reference_and_html_code_mutations_are_rejected(self):
        for source, translated in (
            ('[链接][]\n\n[链接]: https://example.test/a\n', '[Link][]\n\n[链接]: https://example.test/a\n'),
            ('[链接]\n\n[链接]: https://example.test/a\n', '[Link]\n\n[链接]: https://example.test/a\n'),
            ('<pre><code>filter: 美国|住宅</code></pre>\n', '<pre><code>filter: US|Residential</code></pre>\n'),
        ):
            with self.subTest(source=source):
                self.assertNotEqual(markdown_signature(source), markdown_signature(translated))

    def test_readme_provider_cannot_change_code_or_link_destinations(self):
        source = '# 说明\n`美国|住宅`\n[链接](https://example.test/a)\n```yaml\nname: 🤖 AI大模型\n```\n'
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            (root / 'README.md').write_text(source, encoding='utf-8')
            with patch.object(sync, 'ROOT', root):
                self.assertIsNone(sync.validate(source.replace('# 说明', '# Guide'), 'readme'))
                for translated in (
                    source.replace('美国|住宅', 'US|Residential'),
                    source.replace('/a)', '/wrong)'),
                    source.replace('name: 🤖 AI大模型', 'name: 🤖 AI'),
                ):
                    with self.subTest(translated=translated):
                        self.assertIsNotNone(sync.validate(translated, 'readme'))

    def test_functional_chinese_without_comments_does_not_call_a_provider(self):
        source = 'proxy-groups:\n  - name: 🤖 AI大模型\n    filter: 美国|住宅\n'
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            scripts = root / '.github' / 'scripts'
            scripts.mkdir(parents=True)
            for name in ('check_code_sync.py', 'translation_boundaries.py'):
                shutil.copy2(Path(check.__file__).parent / name, scripts / name)
            (root / 'mihomo.yaml').write_text(source, encoding='utf-8')
            environment = {
                'GEMINI_API_KEY': 'fixture-key',
                'SYNC_USE_GOOGLE_FALLBACK': '0',
                'PYTHONPATH': os.environ.get('PYTHONPATH', ''),
            }
            with (
                patch.object(sync, 'ROOT', root),
                patch.object(sync, 'GLOSSARY_PATH', root / 'glossary.json'),
                patch.object(sync, 'PAIRS', [('mihomo.yaml', 'mihomo_en.yaml', 'yaml')]),
                patch.dict(os.environ, environment, clear=True),
                patch.object(sync, 'call_provider', side_effect=AssertionError('Functional values must not be translated')),
                contextlib.redirect_stdout(io.StringIO()),
            ):
                sync.main()
            self.assertEqual((root / 'mihomo_en.yaml').read_text(encoding='utf-8'), source)

    def test_provider_output_cannot_change_group_names_or_filters(self):
        source = (
            '# 中文注释\nproxy-groups:\n'
            '  - name: 🤖 AI大模型\n    type: select\n    filter: 美国|住宅\n'
            'rules:\n  - DOMAIN,api.anthropic.com,🤖 AI大模型\n'
        )
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            scripts = root / '.github' / 'scripts'
            scripts.mkdir(parents=True)
            for name in ('check_code_sync.py', 'translation_boundaries.py'):
                shutil.copy2(Path(check.__file__).parent / name, scripts / name)
            (root / 'mihomo.yaml').write_text(source, encoding='utf-8')
            with patch.object(sync, 'ROOT', root):
                self.assertIsNone(sync.validate(source.replace('# 中文注释', '# English'), 'yaml'))
                for translated in (
                    source.replace('name: 🤖 AI大模型', 'name: 🤖 AI'),
                    source.replace('美国|住宅', 'US|Residential'),
                    source.replace(',🤖 AI大模型', ',🤖 AI'),
                ):
                    with self.subTest(translated=translated):
                        self.assertIsNotNone(sync.validate(translated, 'yaml'))


if __name__ == "__main__":
    unittest.main()
