// Tiny Markdown -> HTML converter, no dependencies. Covers what blog posts need:
// headings (## / ###), paragraphs, **bold**, *italic*, [text](url) links,
// `code`, and - / 1. lists. Not a full CommonMark implementation — if a post
// needs something fancier, write the HTML by hand in the .md file (raw HTML
// lines pass through untouched).

function inline(s) {
  return s
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" loading="lazy" style="max-width:100%;margin:16px 0;">')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, text, href) =>
      /^https?:\/\//.test(href)
        ? `<a href="${href}" target="_blank" rel="noopener">${text}</a>`
        : `<a href="${href}">${text}</a>`);
}

export function mdToHtml(md) {
  const lines = md.replace(/\r\n/g, '\n').split('\n');
  const out = [];
  let i = 0;
  let listType = null; // 'ul' | 'ol' | null

  function closeList() {
    if (listType) { out.push(`</${listType}>`); listType = null; }
  }

  while (i < lines.length) {
    const line = lines[i];

    if (!line.trim()) { closeList(); i++; continue; }

    const h = line.match(/^(#{1,3})\s+(.*)$/);
    if (h) { closeList(); out.push(`<h${h[1].length + 1}>${inline(h[2])}</h${h[1].length + 1}>`); i++; continue; }

    const ul = line.match(/^[-*]\s+(.*)$/);
    const ol = line.match(/^\d+\.\s+(.*)$/);
    if (ul || ol) {
      const tag = ul ? 'ul' : 'ol';
      if (listType !== tag) { closeList(); out.push(`<${tag}>`); listType = tag; }
      out.push(`<li>${inline((ul || ol)[1])}</li>`);
      i++; continue;
    }

    if (/^<\w/.test(line.trim())) { closeList(); out.push(line); i++; continue; } // raw HTML passthrough

    // paragraph: collect contiguous non-blank lines
    closeList();
    const para = [line];
    while (i + 1 < lines.length && lines[i + 1].trim() && !/^(#{1,3}\s|[-*]\s|\d+\.\s|<\w)/.test(lines[i + 1])) {
      i++; para.push(lines[i]);
    }
    out.push(`<p>${inline(para.join(' '))}</p>`);
    i++;
  }
  closeList();
  return out.join('\n');
}

/** Splits a .md file into {meta, body}: leading `---` frontmatter (key: value
 *  lines) + the rest as markdown body. */
export function parseFrontmatter(raw) {
  const m = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!m) return { meta: {}, body: raw };
  const meta = {};
  for (const line of m[1].split('\n')) {
    const kv = line.match(/^(\w+):\s*(.*)$/);
    if (kv) meta[kv[1]] = kv[2].trim();
  }
  return { meta, body: m[2] };
}
