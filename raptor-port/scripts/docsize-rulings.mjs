/* THE RULINGS' SHAPE, READ ONE WAY — by the document gate (docsize.mjs) and the converter (backlog-archive.mjs
 * --rulings), so the two can never disagree about what a row is (owner, D390, 28 Sep 26 — the rulings slim-down;
 * plan: raptor-port/docs/superpowers/plans/2026-09-28-rulings-slim-down-plan.md).
 *
 * Every ruling is ONE FULL ROW — `| D<n> | <date> | his words | what it means | where it lives |`, six `|` — kept
 * whole in `.claude/decisions-full/<area>.md` (searched, never loaded by itself), and ONE SHORT LINE —
 * `| D<n> | <date> | the rule[ — changed by D<a>, D<b>] |`, four `|` — in the area file under
 * `.claude/rules/decisions/`, which is what every chat loads. A row is told by its count of unescaped `|`; any other
 * count is refused (Astra's red team: four rows once had five, one had seven). A ruling's IDENTITY is its full row.
 *
 * Named after the gate (docsize-*.mjs) so the deploy workflow's docs-only skip list covers it. */

export const DECISIONS = 'DECISIONS.md'
export const RULINGS_DIR = '.claude/rules/decisions'
export const FULL_DIR = '.claude/decisions-full'
export const RULINGS_ARCHIVE = 'DECISIONS-ARCHIVE.md'
/* the short line's rule text, change tail not counted — "one to two lines" (D390) */
export const SHORT_MAX = 350
export const ROW_ID = /^\|\s*(D\d+)\s*\|/
export const SHORT_HEADER = '| # | Date | The rule |'
export const SHORT_SEP = '|---|---|---|'
export const FULL_HEADER = '| # | Date | His ruling, in his words where short enough | What it means | Where it lives now |'
export const FULL_SEP = '|---|---|---|---|---|'

/* The code-block rule every document tool here shares (docsize.mjs and backlog-archive.mjs carry the same body):
   opens on 3+ backticks or tildes, closes only on the SAME character, at least as long, with nothing after. */
export function fenceStep(fence, line) {
  const f = /^ {0,3}(`{3,}|~{3,})(.*)$/.exec(line)
  if (!f) return fence
  if (fence) return f[1][0] === fence.ch && f[1].length >= fence.len && !f[2].trim() ? null : fence
  return { ch: f[1][0], len: f[1].length }
}
/* for each line, whether it sits inside (or opens / closes) a code block */
export const fencedFlags = lines => { let fence = null; return lines.map(l => { const was = fence; fence = fenceStep(fence, l.replace(/\r?\n$/, '')); return !!(was || fence) }) }

export const pipes = line => { let n = 0; for (let i = 0; i < line.length; i++) if (line[i] === '|' && line[i - 1] !== '\\') n++; return n }
export const kindOf = line => { const n = pipes(line.replace(/\r?\n$/, '').trimEnd()); return n === 4 ? 'short' : n === 6 ? 'full' : 'bad' }
export const cellsOf = line => line.replace(/\r?\n$/, '').trim().replace(/^\|/, '').replace(/\|$/, '').split(/(?<!\\)\|/).map(s => s.trim())
export const isRow = line => ROW_ID.test(line)
export const idOf = line => (ROW_ID.exec(line) || [])[1]
export const stem = f => f.split('/').pop()

/* Bold spans, and the CHANGE MARKS among them: a bold span holding a change word — optionally "IN PART" and a date —
   then BY and a ruling number. It names every D-number from BY to the first colon or the span's end (D305: "BY D310
   (…) and D322 (…)"). Read from the ruling cell AND the meaning cell (D85's mark sits in the ruling cell). */
export const boldSpans = s => [...(s || '').matchAll(/\*\*(.+?)\*\*/g)].map(m => m[1])
const CHANGE = '\\b(?:NARROWED|AMENDED(?:\\s+AGAIN)?|REPLACED|SUPERSEDED|EXTENDED|WIDENED|REFINED|SET\\s+ASIDE|ANSWERED|CORRECTED|REVERSED|SETTLED)\\b(?:\\s+IN\\s+PART)?(?:\\s+(?:the\\s+same\\s+(?:day|hour|evening)|again|\\d{1,2}\\s+[A-Z][a-z]{2}\\s+\\d{2}))?\\s+BY\\s+(?=D\\d)'
export const isMarkSpan = span => new RegExp(CHANGE, 'i').test(span)
export function marksOf(cells) {
  const out = new Set()
  for (const cell of [cells[2], cells[3]]) for (const span of boldSpans(cell)) for (const m of span.matchAll(new RegExp(CHANGE, 'gi'))) {
    const upto = span.slice(m.index + m[0].length).split(':')[0]
    for (const d of upto.match(/D\d+/g) || []) out.add(d)
  }
  out.delete(cells[0])
  return out
}
/* The heading: the meaning cell's first bold span that is not a change mark. A new row's heading becomes its short
   line, so it must state the rule alone (DECISIONS.md step 1). */
export function headingOf(cells) { for (const s of boldSpans(cells[3])) if (!isMarkSpan(s)) return s.trim(); return null }
/* why a heading cannot serve as a short line — null when it can */
export function headingProblem(d, h) {
  if (!h) return `${d}'s meaning cell has no bold heading — open it with one bold sentence that states the rule on its own`
  if (h.includes('|')) return `${d}'s heading holds a "|" — write it without one`
  if ([...h].length > SHORT_MAX) return `${d}'s heading is ${[...h].length} characters — shorten its first bold sentence to at most ${SHORT_MAX}, stating the rule on its own`
  if (/:\s*$/.test(h)) return `${d}'s heading ends in ":" and so does not state the rule on its own — rewrite its first bold sentence`
  return shortTextProblem(d, h)
}

/* THE RETIRE MARK (DECISIONS.md step 2) at the head of a full row's RULING cell: the row leaves for the archive. One
   definition for both scripts (Fable's code read); the dated and dashed forms the change marks teach are accepted too
   ("**— REPLACED 27 Sep 26 BY D300: …**"). */
/* "replaced by D<n>" at the head of the ruling cell, the number it names in group 1 — the gate's "no such ruling" check
   reads this same pattern, so the grammar is written once (Fable's verification) */
export const REPLACED_BY = /^\*\*(?:—\s*)?(?:REPLACED|REVERSED|SUPERSEDED|ENDED)(?:\s+\d{1,2}\s+[A-Z][a-z]{2}\s+\d{2})?\s+BY\s+(D\d+)/
export const MARKED = new RegExp(`(?:${REPLACED_BY.source})|^\\*\\*(?:—\\s*)?SPENT\\b`)
export const isRetired = cells => MARKED.test(cells[2] || '')
/* Is this live row the same ruling as that archived one — equal but for the retire mark at the head of the ruling cell?
   A live row under an archived number with OTHER text is a reused number, never a copy to drop (Fable's code read). Only
   a leading span that IS a retire mark is set aside — never his own bold words (both verifications). */
const unmark = c => (MARKED.test(c || '') ? c.replace(/^\*\*[^*]*\*\*\s*/, '') : (c || ''))
export const sameRuling = (a, b) => { const x = cellsOf(a), y = cellsOf(b); return x.length === y.length && x.every((c, i) => (i === 2 ? unmark(c) === unmark(y[i]) : c === y[i])) }

/* why a short line's rule text cannot stand — null when it can: empty, over the cap, any "|" at all (an escaped one
   too), or the reserved tail syntax inside the text (Astra's code read: "— changed by D999 — changed by D20" passed) */
export function shortTextProblem(d, text) {
  const t = (text || '').trim()
  if (!t) return `${d}'s short line is empty — state the rule`
  if (t.includes('|')) return `${d}'s short line holds a "|" — write it without one (not even "\\|")`
  if (/—\s*changed by\s+D\d/i.test(t)) return `${d}'s short line holds "— changed by D…" inside its text — that is the tail's syntax, written by the converter from the full row's marks`
  if ([...t].length > SHORT_MAX) return `${d}'s short line is ${[...t].length} characters (its change tail not counted) — at most ${SHORT_MAX}: state the rule, the detail stays in its full row`
  return null
}

/* the short line: its rule text, then its change tail — which names exactly the rulings its full row's marks name */
const TAIL = /\s—\schanged by (D\d+(?:, D\d+)*)$/
export const tailOf = ids => ids.size ? ` — changed by ${[...ids].sort((a, b) => +b.slice(1) - +a.slice(1)).join(', ')}` : ''
export function parseShort(line) {
  const [d, date, ...rest] = cellsOf(line)
  const whole = rest.join('|')
  const m = TAIL.exec(whole)
  return { d, date, text: m ? whole.slice(0, m.index) : whole, tail: new Set(m ? m[1].split(', ') : []) }
}
export const shortLine = (d, date, text, marks) => `| ${d} | ${date} | ${text}${tailOf(marks)} |`

/* the dates rows carry ("22 Sep 26"), for keeping a table newest first */
const MON = { Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5, Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11 }
export const dateKey = s => { const m = /^(\d{1,2}) ([A-Z][a-z]{2}) (\d{2})$/.exec((s || '').trim()); return m ? (2000 + +m[3]) * 10000 + (MON[m[2]] ?? 0) * 100 + +m[1] : 0 }

/* Every row of a rulings file, outside code blocks: { d, kind, line (no line end), index } */
export function rowsOf(text) {
  const ls = (text || '').split('\n').map(l => l.replace(/\r$/, ''))
  const inF = fencedFlags(ls)
  return ls.flatMap((line, index) => !inF[index] && isRow(line) ? [{ d: idOf(line), kind: kindOf(line), line, index }] : [])
}

/* Text written in capitals (D970: ordinary letters, capitals only where a name or a short form has them) — two letters
   in five capitals, at least 20 letters to judge by, or three capital words to open it. The short lines' check and the
   pages' read it the same way. */
export const capsText = t => { const s = t || '', l = (s.match(/[A-Za-z]/g) || []).length, u = (s.match(/[A-Z]/g) || []).length; return (l >= 20 && u / l >= 0.4) || /^(?:[A-Z][A-Z'’-]*\s+){3}/.test(s) }

/* THE PAGE SHAPE (owner, D1735, 7 Nov 26 — the rules diet: raptor-port/docs/superpowers/plans/2026-11-07-rules-diet-plan.md
   §2, §5). An area converts from one short line per ruling to a page of how it works now: each rule stated once, the
   rulings behind it cited after it as [D12, D40]; the full rows stay whole in .claude/decisions-full/. The MARKER in a
   file's body says which shape it is in — an HTML comment, not a frontmatter key, so the general file (no frontmatter)
   keeps loading in every chat — and the gate and the recorder treat a marked file the new way and every other the old
   way, so the areas convert one at a time and main stays green between them (Astra's read of the plan, finding 1). */
export const PAGE_MARK = '<!-- shape: page -->'
/* a statement's length, in characters — "one statement a bullet"; the detail stays in the full rows (plan §5) */
export const STATEMENT_MAX = 600
/* a range "D36–D41" cites each ruling in it; a wider span is read as its two ends (a typo must not cite a thousand) */
const RANGE_MAX = 60
const fmEnd = ls => { if (ls[0] !== '---') return 0; const e = ls.indexOf('---', 1); return e < 0 ? 0 : e + 1 }
/* The body's lines, numbered from 1: frontmatter, code blocks and HTML comments blanked (each keeps its place, so a
   line number names the file's own line); `comment` says a blanked line held a comment, for the marker's read. */
function bodyOf(text) {
  const ls = (text || '').split('\n').map(l => l.replace(/\r$/, ''))
  const inF = fencedFlags(ls), fm = fmEnd(ls)
  let inC = false
  return ls.map((l, i) => {
    if (i < fm || inF[i]) return { n: i + 1, t: '' }
    let t = '', s = l, was = false
    while (s) {
      if (inC) { const e = s.indexOf('-->'); was = true; if (e < 0) { s = ''; break } inC = false; s = s.slice(e + 3); continue }
      const o = s.indexOf('<!--'); if (o < 0) { t += s; break }
      t += s.slice(0, o); s = s.slice(o + 4); inC = true; was = true
    }
    return { n: i + 1, t: was && !t.trim() ? '' : t, raw: l }
  })
}
/* is this file a page? — the marker on a line of its own, outside code blocks and frontmatter */
export const isPage = text => { const ls = (text || '').split('\n').map(l => l.replace(/\r$/, '')), inF = fencedFlags(ls), fm = fmEnd(ls); return ls.some((l, i) => i >= fm && !inF[i] && l.trim() === PAGE_MARK) }
/* does the file load only with its area (a `paths:` key in its frontmatter)? */
export const isScoped = text => { const ls = (text || '').split('\n').map(l => l.replace(/\r$/, '')), fm = fmEnd(ls); return fm > 0 && ls.slice(1, fm - 1).some(l => /^paths:/.test(l)) }
/* The rulings a text cites, outside code spans (a number in a code span is an example): every D-number, and every
   ruling inside a range. `named` is only the numbers written out — a range's ends, never what lies between, since
   numbers may skip (D78). */
export function citesIn(text) {
  const s = (text || '').replace(/(`+)[\s\S]*?\1/g, ' ')
  const all = new Set(), named = new Set()
  for (const m of s.matchAll(/\bD(\d+)(?:\s*[–-]\s*D?(\d+))?\b/g)) {
    const lo = +m[1], hi = m[2] ? +m[2] : lo
    named.add('D' + lo); named.add('D' + hi)
    if (hi > lo && hi - lo <= RANGE_MAX) for (let k = lo; k <= hi; k++) all.add('D' + k)
    else { all.add('D' + lo); all.add('D' + hi) }
  }
  return { all, named, words: (s.replace(/\bD\d+(?:\s*[–-]\s*D?\d+)?\b/g, ' ').match(/[\p{L}\p{N}][\p{L}\p{N}'’-]*/gu) || []).length }
}
/* THE STATEMENTS of a page or an always-loaded rules file: a heading or a table row is a unit of one line; a bullet
   runs on through its continuation lines; any other run of lines is a paragraph. A unit STATES the rulings it cites
   only when it has at least four words, and two for each ruling it cites — a list of numbers states nothing (the
   fresh Opus reader of the plan, H1a: the first draft carried a 46-number "stated elsewhere" list). Returns
   [{ line, kind: 'heading'|'table'|'bullet'|'para', text, cites, named, words, states }]. */
export function statementsOf(text) {
  const out = []
  let cur = null
  const close = () => { if (!cur) return; const c = citesIn(cur.text); out.push({ ...cur, cites: c.all, named: c.named, words: c.words, states: cur.kind !== 'heading' && c.words >= 4 && c.words >= 2 * c.all.size }); cur = null }
  for (const { n, t } of bodyOf(text)) {
    if (!t.trim()) { close(); continue }
    if (/^#{1,6}\s/.test(t)) { close(); cur = { line: n, kind: 'heading', text: t.trim() }; close(); continue }
    if (/^\s*\|/.test(t)) { close(); cur = { line: n, kind: 'table', text: t.trim() }; close(); continue }
    if (/^\s*(?:[-*+]|\d+[.)])\s/.test(t)) { close(); cur = { line: n, kind: 'bullet', text: t.trim().replace(/^(?:[-*+]|\d+[.)])\s+/, '') }; continue }
    if (cur) { cur.text += ' ' + t.trim(); continue }
    cur = { line: n, kind: 'para', text: t.trim() }
  }
  close()
  return out
}
/* What is wrong with a page's SHAPE — [] when nothing (plan §2, §5): one title; an area page (one with `paths:`) is
   titled "<Area> — how it works now" and carries a "## Settled" section and a "## From other areas" section, the
   latter last; the general page, which loads in every chat, has no other areas and no screens, so needs neither; no
   table rows (a ruling is a statement now, not a row); each statement in ordinary letters and at most STATEMENT_MAX
   characters. */
export function pageShapeProblems(text) {
  const out = [], sts = statementsOf(text)
  const titles = sts.filter(s => s.kind === 'heading' && /^#\s/.test(s.text))
  if (titles.length !== 1) out.push(`it has ${titles.length} title headings ("# …") — a page has one`)
  if (isScoped(text)) {
    if (titles[0] && !/—\s*how it works now\b/.test(titles[0].text)) out.push(`its title (line ${titles[0].line}) is not "# <Area> — how it works now"`)
    const h2 = sts.filter(s => s.kind === 'heading' && /^##\s/.test(s.text))
    if (!h2.some(s => /^##\s+Settled\b/.test(s.text))) out.push('it has no "## Settled …" section — the settled designs, one bullet a surface, each with its numbers')
    const from = h2.findIndex(s => /^##\s+From other areas\b/.test(s.text))
    if (from < 0) out.push('it has no "## From other areas" section — each ruling of another area that bears on this one, a few words and its number')
    else if (from !== h2.length - 1) out.push(`its "## From other areas" section (line ${h2[from].line}) is not its last section`)
  }
  for (const s of sts) {
    if (s.kind === 'table') { out.push(`line ${s.line} is a table row — a page holds no table rows: state the rule as a bullet, its rulings cited after it`); continue }
    if (s.kind === 'heading') continue
    if ([...s.text].length > STATEMENT_MAX) out.push(`the statement at line ${s.line} is ${[...s.text].length} characters — at most ${STATEMENT_MAX}: one statement a bullet, the detail in its full rows`)
    if (capsText(s.text)) out.push(`the statement at line ${s.line} is written mostly in capitals — ordinary letters, capitals only where a name or a short form has them (D970)`)
  }
  return out
}
/* the "## " section a line of a page sits under, and a page's sections — where the recorder tells an edit to go */
export const sectionsOf = text => statementsOf(text).filter(s => s.kind === 'heading' && /^##\s/.test(s.text))
export const sectionAt = (text, line) => (sectionsOf(text).filter(s => s.line < line).pop() || {}).text || 'its head'

/* WHAT THE PAGES STILL OWE (D1735; plan §3, §5) — read ONE way, so the gate (docsize.mjs, which fails on each) and the
   recorder (backlog-archive.mjs --rulings, which prints each as the edit to make and writes nothing until it is made)
   never disagree. `sources`: each page { f, text, homes: Set of its own area's stem, area } and each always-loaded
   rules file { f, text, homes: the general area's stem once it is a page, else empty — such a file joins only the
   stating, until then }; `live`: Map d -> { line, area } for every live full row; `archived`: Map d -> its cells. A debt:
     { kind: 'mark', f, line, d, missing } — a statement of a ruling of its own area without the rulings whose marks in
       that ruling's full row change it (another area's included);
     { kind: 'stale', f, line, d, by } — a citation of a ruling archived as replaced by `by` (D201);
     { kind: 'none', f, line, d } — a number that is no ruling (a renumbered clash, a typo);
     { kind: 'unstated', d, area, at } — a live ruling of a page's area no statement states (`at`: where it is only listed). */
export function pageDebts(sources, live, archived) {
  const out = [], stated = new Set(), listedOnly = new Map(), pages = new Set(sources.filter(s => s.area).map(s => s.area))
  for (const { f, text, homes } of sources) for (const s of statementsOf(text)) {
    for (const d of s.cites) if (s.states) stated.add(d); else if (!listedOnly.has(d)) listedOnly.set(d, `${f} line ${s.line}`)
    if (!homes.size) continue
    if (s.states) for (const d of s.cites) {
      if (!live.has(d) || !homes.has(live.get(d).area)) continue
      const missing = [...marksOf(cellsOf(live.get(d).line))].filter(m => live.has(m) && !s.cites.has(m))
      if (missing.length) out.push({ kind: 'mark', f, line: s.line, d, missing })
    }
    for (const d of s.cites) { const by = archived.has(d) && REPLACED_BY.exec(archived.get(d)[2] || ''); if (by) out.push({ kind: 'stale', f, line: s.line, d, by: by[1] }) }
    for (const d of s.named) if (!live.has(d) && !archived.has(d)) out.push({ kind: 'none', f, line: s.line, d })
  }
  for (const [d, r] of live) if (pages.has(r.area) && !stated.has(d) && !isRetired(cellsOf(r.line))) out.push({ kind: 'unstated', d, area: r.area, at: listedOnly.get(d) })
  return out
}

/* The back-mark check:a later row that names an older one beside a change verb, where the older row's marks do not
   name the later. Returns [{ later, older }]. */
const VERB = /\b(narrows|narrowed|amends|amended|sets aside|set aside|replaces|supersedes|widens|widened|extends|extended|refines|refined|settles|answers|corrects|reverses|overrides)\s+(?:(?:in part|the agent's reading of|his|the)\s+)?(D\d+)\b/gi
export function backMarks(fullRows /* Map d -> cells */) {
  const out = []
  for (const [later, cells] of fullRows) {
    const named = new Set()
    for (const cell of [cells[2], cells[3]]) for (const m of (cell || '').matchAll(VERB)) named.add(m[2])
    for (const older of named) {
      if (older === later || !fullRows.has(older)) continue
      if (!marksOf(fullRows.get(older)).has(later)) out.push({ later, older })
    }
  }
  return out
}
