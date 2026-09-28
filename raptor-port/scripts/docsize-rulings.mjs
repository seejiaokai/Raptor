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

/* The back-mark check: a later row that names an older one beside a change verb, where the older row's marks do not
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
