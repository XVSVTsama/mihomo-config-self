// Full parsing provides the syntax context needed to distinguish regexps from division.
const fs = require('node:fs');

try {
  const acorn = require('acorn');
  const source = fs.readFileSync(0, 'utf8');
  const comments = [];
  const tokens = [];
  acorn.parse(source, {
    ecmaVersion: 'latest',
    sourceType: 'script',
    onComment: (_block, _text, start, end) => comments.push([start, end]),
    onToken: tokens,
  });

  // Acorn offsets count UTF-16 code units; Python slices count Unicode code points.
  const offsets = new Array(source.length + 1);
  let utf16 = 0;
  let codepoints = 0;
  offsets[0] = 0;
  for (const char of source) {
    utf16 += char.length;
    offsets[utf16] = ++codepoints;
  }
  let previousEnd = null;
  const signature = tokens.filter(token => token.type.label !== 'eof').map(token => {
    const newline = previousEnd !== null && /[\r\n\u2028\u2029]/.test(
      source.slice(previousEnd, token.start),
    );
    previousEnd = token.end;
    return [source.slice(token.start, token.end), newline];
  });
  process.stdout.write(JSON.stringify({
    comments: comments.map(([start, end]) => [offsets[start], offsets[end]]),
    tokens: signature,
  }));
} catch (error) {
  process.stderr.write(`JavaScript parsing failed: ${error.message}\n`);
  process.exitCode = 1;
}
