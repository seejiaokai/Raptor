#!/usr/bin/env node
/* THE READINGS LIST AND CHECK — his D2567 and D2610, [READINGS-LAPSE-FIX] (plan
 * docs/superpowers/plans/2026-11-24-readings-lapse-fix-plan.md §C7; the rule it serves: DECISIONS.md, "A reading").
 *
 * On 22 Nov 26 a builder read what "planned" covers and left that reading in a code comment ("his to change"); it was
 * never put to him, and three bug checks judged the code against it (the bug-check order's lesson 32). A reading now has
 * a form that is read: the ruling's full row carries `**READING, OPEN (<date>, asked | not asked): …**` until he rules;
 * once he does, the row gains step 2's `**— ANSWERED <date> BY D<n>: …**` (or NARROWED) and the reading leaves the list.
 * Code built on an open reading carries `READING D<n>` in the sentence that speaks of it; a sentence about a reading he
 * has answered cites his answer, `ruled D<n>` — the ruling named by that ANSWERED mark, and no other.
 *
 * `npm run readings [D<n> …] [path …]` lists every open mark and every tag under raptor-port/src, narrowed to the named
 * rulings or files, and prints `Readings open: <n> (<m> not asked)`. It also lists the comments that speak of a reading
 * with no tag and no answer — old lines included — as "unrecorded, treat as not asked" (the audit clears them, plan §C8),
 * and warns of a ruling row the branch adds whose words speak of a reading with no mark. Neither of those fails anything.
 *
 * Inside the document check (docsize.mjs — the Stop hook's --inventory run and GitHub's), these fail:
 *   (a) a `READING D<n>` tag whose ruling's row carries no open mark, or whose reading he has answered (it becomes
 *       `ruled D<that answer>`); a row holding READING and OPEN that cannot be read as a mark (it would drop off the
 *       list unseen); a `ruled D<n>` naming no ruling that answered a recorded reading;
 *   (b) on lines a branch ADDS under raptor-port/src, a comment sentence that speaks of a reading in free words (PHRASE,
 *       below — matched across the comment's line breaks) with neither a tag nor a valid answer in the same sentence.
 *       Added lines only, so the old comments block nothing; a line whose words the same change removes elsewhere —
 *       moved, re-indented, carried into another file — is not new.
 * What it is, honestly: a consistency check on readings somebody wrote down. A reading made with no words about it at all
 * passes it; those are the readers' question and the roll-call's row (the bug-check order §4 and §6). It cannot know
 * that a cited answer truly settles the words beside it — only that it answered a recorded reading. Comments in .html
 * files are not read. */
import { readFileSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { execFileSync } from 'node:child_process'

const SRC = 'raptor-port/src'
const ROWS_DIRS = ['.claude/decisions-full', '.claude/rules/decisions']   // a new row sits in its area file until the mover runs
const CODE = /\.(ts|tsx|js|jsx|mjs|cjs|css)$/
/* The free words of a reading, any case, apostrophe straight or curly, words split by any white space (a comment's line
   break is folded to a space before this runs). Every phrase names a reading. Left out on purpose: "his call" (it
   matches "his callsign") and "his to rule on" (an approval). */
const PHRASE_SRC = [
  'his\\s+to\\s+(?:change|decide|settle|rule(?!\\s+on\\b))',
  'for\\s+him\\s+to\\s+(?:change|decide|rule(?!\\s+on\\b))',
  'pending\\s+his\\s+ruling',
  "(?:agents['’]|(?:agent|builder|build|host|opus|fable|claude)['’]s)(?:\\s+[a-z-]+){0,2}?\\s+(?:readings?|interpretations?)",
  '(?:my|our)\\s+readings?',
  'read\\s+here\\s+as',
  'until\\s+he\\s+(?:rules|decides|answers)',
  'not\\s+(?:yet\\s+)?put\\s+to\\s+him',
].map(s => `\\b${s}\\b`).join('|')
export const PHRASE = new RegExp(PHRASE_SRC, 'i')
const phrases = () => new RegExp(PHRASE_SRC, 'gi')
const TAG = /\bREADING\s+(D\d+)\b/g                 // run on a comment's folded words, so a tag may wrap
const RULED = /\bruled\s+(D\d+)\b/gi
const ROW = /^\|\s*(D\d+)\s*\|/
/* the mark, with small typing variants: bold stars or none, any case, spaces round the comma and colon */
const MARK = /(?:\*\*)?READING,\s*OPEN\s*\(([^,)]*),\s*(asked|not asked)\s*\)\s*:\s*([\s\S]*?)(?:\*\*|\s+\||$)/gi
/* anything that tries to be one — READING then OPEN with only punctuation between — so a mark typed wrong fails */
const MARKISH = /\bREADING\b[\s,*_:.\-–—]*\bOPEN\b/gi
/* step 2's marks: his answer to a row's open point (DECISIONS.md, step 2) */
const STEP2 = /\*\*—\s*(?:ANSWERED|NARROWED)\s+(\d{1,2}\s+[A-Za-z]{3}\s+\d{2,4})\s+BY\s+(D\d+)/gi
const MONTHS = { jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5, jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11 }
const day = s => {
  const m = /^(\d{1,2})\s+([A-Za-z]{3})\s+(\d{2,4})$/.exec((s || '').trim())
  if (!m || !(m[2].toLowerCase() in MONTHS)) return null
  const y = +m[3] < 100 ? 2000 + +m[3] : +m[3]
  return Date.UTC(y, MONTHS[m[2].toLowerCase()], +m[1])
}

/* ---------- the comment reader ---------- */
const REGEX_AFTER = new Set('(,=:[!&|?{};+-*%<>~^'.split(''))
const REGEX_WORDS = new Set(['return', 'typeof', 'case', 'do', 'else', 'in', 'of', 'new', 'delete', 'void', 'throw', 'yield', 'await', 'instanceof'])
const CONTROL = new Set(['if', 'while', 'for', 'with'])

/* Every comment in a source file: { from, to } line numbers (1-based), its text, and `segs` — each line's comment words
   with the markers taken off (`//`, `/*`, a leading `*`, `*\/`), for matching across line breaks. A run of `//` lines
   with nothing but white space between them is ONE comment, as a block is. Quoted text is skipped, but:
   - a quote right after a letter or digit is an apostrophe (`<p>Don't</p>`): a JavaScript string never follows one;
   - a regex literal is read as one — after an operator, a keyword, or the `)` of an if / while / for condition —
     so a quote or backtick inside it opens nothing; never right after `<` (a JSX closing tag);
   - a template literal's ${…} is read as code, comments and all. */
export function commentsIn(text) {
  const starts = [0]
  for (let k = 0; k < text.length; k++) if (text[k] === '\n') starts.push(k + 1)
  const lineOf = idx => { let lo = 0, hi = starts.length - 1; while (lo < hi) { const m = (lo + hi + 1) >> 1; if (starts[m] <= idx) lo = m; else hi = m - 1 } return lo + 1 }
  const out = []
  const n = text.length
  const stack = []           // one brace depth per open ${…}
  const parens = []          // per open (: was it an if / while / for / with condition?
  let depth = 0, prevSig = '', prevWord = '', i = 0
  const template = j => {
    while (j < n) {
      const c = text[j]
      if (c === '\\') { j += 2; continue }
      if (c === '`') return j + 1
      if (c === '$' && text[j + 1] === '{') { stack.push(depth); depth = 0; return j + 2 }
      j++
    }
    return n
  }
  while (i < n) {
    const c = text[i], d = text[i + 1]
    if (c === ' ' || c === '\t' || c === '\r' || c === '\n') { i++; continue }
    if (c === '/' && d === '/') {
      const end = text.indexOf('\n', i), stop = end < 0 ? n : end
      const prev = out[out.length - 1]
      if (prev && prev.line && /^\s*$/.test(text.slice(prev.end, i)) && lineOf(i) === prev.to + 1) {
        prev.text += '\n' + text.slice(i, stop); prev.to = lineOf(i); prev.end = stop
      } else out.push({ from: lineOf(i), to: lineOf(i), text: text.slice(i, stop), end: stop, line: true })
      i = stop; continue
    }
    if (c === '/' && d === '*') {
      const end = text.indexOf('*/', i + 2), stop = end < 0 ? n : end + 2
      out.push({ from: lineOf(i), to: lineOf(stop - 1), text: text.slice(i, stop), end: stop, line: false })
      i = stop; continue
    }
    if (c === '/') {
      const regexHere = text[i - 1] !== '<' && (prevSig === '' || REGEX_AFTER.has(prevSig) || (prevSig === 'w' && REGEX_WORDS.has(prevWord)))
      if (regexHere) {
        let j = i + 1, cls = false
        while (j < n && text[j] !== '\n') {
          if (text[j] === '\\') { j += 2; continue }
          if (text[j] === '[') cls = true
          else if (text[j] === ']') cls = false
          else if (text[j] === '/' && !cls) break
          j++
        }
        if (text[j] === '/') { i = j + 1; while (/[a-z]/i.test(text[i] || '')) i++; prevSig = ')'; continue }
      }
      prevSig = '/'; i++; continue
    }
    if (c === '\'' || c === '"') {
      if (/[A-Za-z0-9_$]/.test(text[i - 1] || '')) { i++; continue }   // an apostrophe in text, not a string
      let j = i + 1
      while (j < n && text[j] !== c && text[j] !== '\n') { if (text[j] === '\\') j++; j++ }
      if (text[j] === c) { i = j + 1; prevSig = ')'; continue }
      i++; continue                                            // no partner on its line: an apostrophe in text
    }
    if (c === '`') { i = template(i + 1); prevSig = ')'; continue }
    if (c === '{') { depth++; prevSig = '{'; i++; continue }
    if (c === '}') {
      if (depth === 0 && stack.length) { depth = stack.pop(); i = template(i + 1); prevSig = ')'; continue }
      depth = Math.max(0, depth - 1); prevSig = '}'; i++; continue
    }
    if (c === '(') { parens.push(prevSig === 'w' && CONTROL.has(prevWord)); prevSig = '('; i++; continue }
    if (c === ')') { prevSig = parens.pop() ? '(' : ')'; i++; continue }   // after a condition, a regex may start
    if (/[A-Za-z0-9_$]/.test(c)) {
      let j = i; while (j < n && /[A-Za-z0-9_$]/.test(text[j])) j++
      prevWord = text.slice(i, j); prevSig = /^[0-9]/.test(prevWord) ? ')' : 'w'; i = j; continue
    }
    prevSig = c === ']' ? ')' : c; i++
  }
  return out.map(({ from, to, text: t }) => {
    const segs = t.split('\n').map((l, k) => ({
      line: from + k,
      words: l.replace(/\*+\/\s*$/, '').replace(/^\s*(?:\/\/+|\/\*+|\*+(?!\/))?/, ''),
    }))
    return { from, to, text: t, segs }
  })
}

/* A comment's words folded across its line breaks, with each line's offset and the sentence breaks: a full stop, ! or
   ? before a space or the end, and a blank comment line. */
function fold(comment) {
  let folded = ''
  const at = [], breaks = [0]
  for (const s of comment.segs) {
    if (folded) folded += ' '
    if (!s.words.trim()) breaks.push(folded.length)
    at.push([folded.length, s.line]); folded += s.words
  }
  for (const m of folded.matchAll(/[.!?](?=\s|$)/g)) breaks.push(m.index + 1)
  breaks.push(folded.length + 1)
  breaks.sort((a, b) => a - b)
  const linesOf = (a, b) => at.filter(([off], k) => { const end = k + 1 < at.length ? at[k + 1][0] - 1 : folded.length; return off < b && end > a }).map(([, l]) => l)
  const sentence = idx => { let s = 0, e = folded.length; for (const b of breaks) { if (b <= idx) s = b; else { e = b; break } } return [s, e] }
  return { folded, linesOf, sentence }
}

/* the tags and answers a comment cites, each with its line */
function citations(comment) {
  const f = fold(comment), tags = [], ruled = []
  for (const m of f.folded.matchAll(TAG)) tags.push({ d: m[1], index: m.index, line: f.linesOf(m.index, m.index + m[0].length)[0] })
  for (const m of f.folded.matchAll(RULED)) ruled.push({ d: m[1].toUpperCase(), index: m.index, line: f.linesOf(m.index, m.index + m[0].length)[0] })
  return { ...f, tags, ruled }
}

/* each phrase whose own sentence holds neither a tag nor a valid answer: { phrase, lines } */
function unsettled(comment, answers) {
  const c = citations(comment), found = []
  for (const m of c.folded.matchAll(phrases())) {
    const [s, e] = c.sentence(m.index)
    const inside = x => x.index >= s && x.index < e
    if (c.tags.some(inside) || c.ruled.some(r => inside(r) && answers.has(r.d))) continue
    found.push({ phrase: m[0].replace(/\s+/g, ' '), lines: c.linesOf(m.index, m.index + m[0].length) })
  }
  return found
}

/* (b): each such phrase touching an ADDED line → { file, line, phrase } (line: the first added line it touches). */
export function unmarkedComments(file, text, added, answers = new Set()) {
  const found = []
  for (const c of commentsIn(text)) for (const p of unsettled(c, answers)) {
    const line = p.lines.find(l => added.has(l))
    if (line !== undefined) found.push({ file, line, phrase: p.phrase })
  }
  return found
}

/* For the listing: every such phrase in the file, old lines included, with the rulings its comment names. */
export function unrecordedIn(file, text, answers = new Set()) {
  const found = []
  for (const c of commentsIn(text)) for (const p of unsettled(c, answers)) found.push({ file, line: p.lines[0], phrase: p.phrase, d: (c.text.match(/\bD\d+\b/g) || []) })
  return found
}

/* A row's open marks, each with whether step 2's mark answers it (an ANSWERED / NARROWED mark dated on or after it). */
function rowMarks(file, text) {
  const out = []
  for (const l of text.split('\n')) {
    const r = ROW.exec(l)
    if (!r) continue
    const step2 = [...l.matchAll(STEP2)].map(m => ({ when: day(m[1]), by: m[2] }))
    for (const m of l.matchAll(MARK)) {
      const when = day(m[1])
      const ans = step2.filter(s => s.when === null || when === null || s.when >= when).pop()
      out.push({ d: r[1], date: m[1].trim(), state: m[2].toLowerCase(), text: m[3].trim(), file, by: ans ? ans.by : null })
    }
  }
  return out
}
/* The open marks in a rulings file — those he has not answered: { d, date, state, text, file }. */
export const marksIn = (file, text) => rowMarks(file, text).filter(m => !m.by).map(({ by, ...m }) => m)
/* The answered ones: { d, by, file } — `by` is his answer, the one ruling `ruled D<n>` may cite for it. */
export const answeredIn = (file, text) => rowMarks(file, text).filter(m => m.by).map(m => ({ d: m.d, by: m.by, file }))
export const answersIn = rows => new Set(rows.flatMap(([f, t]) => answeredIn(f, t).map(a => a.by)))

/* A row holding READING … OPEN more times than it holds a readable mark: the mark would drop off the list unseen. */
export function badMarks(file, text) {
  const out = []
  for (const l of text.split('\n')) {
    const r = ROW.exec(l)
    if (!r) continue
    const tried = [...l.matchAll(MARKISH)].length, read = [...l.matchAll(MARK)].length
    if (tried > read) out.push(`${file}: ${r[1]}'s row holds a "READING, OPEN" mark that cannot be read — write it as \`**READING, OPEN (<date>, asked | not asked): <one way>; the other: <…>.**\` (DECISIONS.md, "A reading")`)
  }
  return out
}

/* The tags in a source file's comments: { d, file, line }. */
export function tagsIn(file, text) {
  return commentsIn(text).flatMap(c => citations(c).tags.map(t => ({ d: t.d, file, line: t.line })))
}

/* (a): a tag whose ruling's row carries no open mark, or whose reading he has answered. */
export function tagsWithoutMark(tags, marks, answered = []) {
  const open = new Set(marks.map(m => m.d)), by = new Map(answered.map(a => [a.d, a.by]))
  return tags.filter(t => !open.has(t.d)).map(t => by.has(t.d)
    ? `${t.file}:${t.line} carries READING ${t.d}, but he has answered that reading — ${by.get(t.d)} (its row's ANSWERED mark): rewrite the comment to say what he ruled and cite it, ruled ${by.get(t.d)}`
    : `${t.file}:${t.line} carries READING ${t.d}, but ${t.d}'s full row carries no "READING, OPEN" mark — add the mark (DECISIONS.md, "A reading"); if the words are not about what his words cover, reword them and drop the tag`)
}

export const summary = marks => `Readings open: ${marks.length} (${marks.filter(m => m.state === 'not asked').length} not asked)`

/* ---------- reading the repo ---------- */
const gitIn = (repo, ...a) => { try { return execFileSync('git', a, { cwd: repo, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], maxBuffer: 1 << 28 }) } catch { return null } }
const listed = (repo, ...a) => (gitIn(repo, ...a) || '').split('\n').filter(Boolean)
const read = (repo, f) => existsSync(join(repo, f)) ? readFileSync(join(repo, f), 'utf8').replace(/\r\n/g, '\n') : ''
const readAt = (repo, base, f) => (gitIn(repo, 'show', `${base}:${f}`) || '').replace(/\r\n/g, '\n')
const squash = l => l.replace(/\s+/g, ' ').trim()

/* Lines under raptor-port/src added since the base — committed, staged, unstaged and untracked: Map path → Set of
   line numbers in the file as it stands. A line whose words (white space aside) the same change removes anywhere under
   src — moved, re-indented, carried into another file — is not counted; a copy of a line that still stands is. */
export function addedLines(repo, base) {
  const out = new Map()
  if (!base) return out
  const removed = new Set()
  let file = null
  for (const l of (gitIn(repo, '-c', 'core.quotepath=off', 'diff', '-M', '-U0', '--no-color', '--no-ext-diff', base, '--', SRC) || '').split('\n')) {
    if (l.startsWith('--- ')) continue
    if (l.startsWith('+++ ')) { file = l.startsWith('+++ b/') ? l.slice(6).replace(/\r$/, '') : null; continue }
    if (l.startsWith('-')) { const s = squash(l.slice(1)); if (s) removed.add(s); continue }
    const h = /^@@ -\S+ \+(\d+)(?:,(\d+))? @@/.exec(l)
    if (h && file) {
      const first = +h[1], cnt = h[2] === undefined ? 1 : +h[2]
      if (!out.has(file)) out.set(file, new Set())
      for (let k = 0; k < cnt; k++) out.get(file).add(first + k)
    }
  }
  for (const f of listed(repo, '-c', 'core.quotepath=off', 'ls-files', '--others', '--exclude-standard', '--', SRC)) {
    const cnt = read(repo, f).split('\n').length
    out.set(f, new Set(Array.from({ length: cnt }, (_, k) => k + 1)))
  }
  if (removed.size) for (const [f, lines] of out) {
    const now = read(repo, f).split('\n')
    for (const ln of [...lines]) { const s = squash(now[ln - 1] || ''); if (s && removed.has(s)) lines.delete(ln) }
  }
  return out
}

/* Each git call costs about half a second in this tree, and the Stop hook runs the check at every turn's end under its
   60-second limit (.claude/settings.json) — so the rows are listed once and the source searched once (`--untracked`
   takes tracked files too). */
const rowFiles = repo => [...new Set(listed(repo, 'ls-files', '--cached', '--others', '--exclude-standard', '--', ...ROWS_DIRS))]
  .filter(f => f.endsWith('.md'))
const rowTexts = repo => rowFiles(repo).map(f => [f, read(repo, f)])
export const allMarks = repo => rowTexts(repo).flatMap(([f, t]) => marksIn(f, t))
const srcFiles = (repo, ...paths) => [...new Set(listed(repo, '-c', 'core.quotepath=off', 'ls-files', '--cached', '--others', '--exclude-standard', '--', ...(paths.length ? paths : [SRC])))]
  .filter(f => CODE.test(f) && existsSync(join(repo, f)))

/* files under src holding a pattern, by git's own search — a citation's word at a line's end counts, as it may wrap */
const grepFiles = (repo, ...pat) =>
  listed(repo, '-c', 'core.quotepath=off', 'grep', '--untracked', '-l', '-i', '-E', ...pat, '--', SRC).filter(f => CODE.test(f))
const citingFiles = repo => grepFiles(repo, '-e', 'READING([[:space:]]+D[0-9]|[[:space:]]*$)', '-e', 'ruled([[:space:]]+D[0-9]|[[:space:]]*$)')
export const allTags = repo => citingFiles(repo).flatMap(f => tagsIn(f, read(repo, f)))

/* A ruling row the branch adds whose words speak of a reading with no mark: a warning for the listing, never a fail. */
export function rowWarnings(repo, base) {
  if (!base) return []
  const out = []
  for (const f of rowFiles(repo)) {
    const had = new Set(readAt(repo, base, f).split('\n').map(l => ROW.exec(l)?.[1]).filter(Boolean))
    for (const l of read(repo, f).split('\n')) {
      const r = ROW.exec(l)
      if (!r || had.has(r[1]) || !PHRASE.test(l) || [...l.matchAll(MARK)].length) continue
      out.push(`${r[1]} (${f}) is new on this branch and speaks of a reading ("${l.match(PHRASE)[0]}") with no "READING, OPEN" mark — each reading it names is told to him, or marked`)
    }
  }
  return out
}

/* The document check's part: { fails, marks, tags, line }. */
export function check({ repo, base }) {
  const rows = rowTexts(repo)
  const marks = rows.flatMap(([f, t]) => marksIn(f, t)), answered = rows.flatMap(([f, t]) => answeredIn(f, t))
  const answers = new Set(answered.map(a => a.by))
  const tags = [], ruled = []
  for (const f of citingFiles(repo)) for (const c of commentsIn(read(repo, f))) {
    const ci = citations(c)
    for (const t of ci.tags) tags.push({ d: t.d, file: f, line: t.line })
    for (const r of ci.ruled) ruled.push({ d: r.d, file: f, line: r.line })
  }
  const fails = [...tagsWithoutMark(tags, marks, answered), ...rows.flatMap(([f, t]) => badMarks(f, t)),
    ...ruled.filter(r => !answers.has(r.d)).map(r => `${r.file}:${r.line} cites "ruled ${r.d}", but no reading's row carries "ANSWERED … BY ${r.d}" — ruled D<n> names only the ruling that answered a recorded reading: if the reading is still open, mark its row READING, OPEN and tag it READING D<n>; if the words are not about what his words cover, reword them`)]
  for (const [f, added] of addedLines(repo, base)) {
    if (!CODE.test(f) || !added.size) continue
    for (const u of unmarkedComments(f, read(repo, f), added, answers))
      fails.push(`${u.file}:${u.line} — a comment this branch adds speaks of a reading ("${u.phrase}") with no READING D<n>, and no answer, in the same sentence. If it is a reading of his words, it is his to settle (DECISIONS.md, "A reading"): put it to him, mark its ruling's full row READING, OPEN and tag the sentence READING D<n> — or, where his answer is already on that row as "ANSWERED … BY D<x>", cite ruled D<x>. If the words are not about what his words cover, reword them`)
  }
  return { fails, marks, tags, line: summary(marks) }
}

/* ---------- npm run readings ---------- */
function findBase(repo) {
  const env = process.env.DOCSGUARD_BASE
  if (env && !/^0+$/.test(env) && gitIn(repo, 'rev-parse', '--verify', '--quiet', `${env}^{commit}`)) return env.trim()
  for (const ref of ['origin/main', 'main']) { const mb = gitIn(repo, 'merge-base', 'HEAD', ref)?.trim(); if (mb) return mb }
  return null
}

export function listing(repo, args) {
  const out = []
  const ds = new Set(args.filter(a => /^D\d+$/i.test(a)).map(a => a.toUpperCase()))
  const paths = args.filter(a => !/^D\d+$/i.test(a)).map(p => p.replace(/\\/g, '/').replace(/^\.\//, '').replace(/\/$/, '')).map(p => p.startsWith('raptor-port/') ? p : 'raptor-port/' + p)
  const inPaths = f => paths.some(p => f === p || f.startsWith(p + '/'))
  const rows = rowTexts(repo)
  let marks = rows.flatMap(([f, t]) => marksIn(f, t))
  const answers = answersIn(rows)
  let tags = allTags(repo)
  if (paths.length) { tags = tags.filter(t => inPaths(t.file)); const cited = new Set(tags.map(t => t.d)); marks = marks.filter(m => cited.has(m.d) || ds.has(m.d)) }
  if (ds.size) { marks = marks.filter(m => ds.has(m.d)); tags = tags.filter(t => ds.has(t.d)) }
  out.push('Open readings, in the rulings\' full rows:')
  if (!marks.length) out.push('  none')
  for (const m of marks) out.push(`  ${m.d} (${m.date}, ${m.state}) — ${m.text}   [${m.file}]`)
  out.push('', 'Code built on a reading (READING D<n>):')
  if (!tags.length) out.push('  none')
  for (const t of tags) out.push(`  ${t.d} — ${t.file}:${t.line}`)

  /* every comment that speaks of a reading with no tag and no answer — old lines included, each file read whole, so a
     phrase wrapped across lines is never dropped by a search of single lines */
  const files = paths.length ? srcFiles(repo, ...paths) : srcFiles(repo)
  let unrec = files.flatMap(f => unrecordedIn(f, read(repo, f), answers))
  const named = paths.length || ds.size
  if (named) {
    unrec = unrec.filter(u => (paths.length && inPaths(u.file)) || (ds.size && u.d.some(d => ds.has(d))))
    out.push('', 'Unrecorded — a comment speaks of a reading with no tag and no answer; treat as not asked:')
    if (!unrec.length) out.push('  none')
    for (const u of unrec) out.push(`  ${u.file}:${u.line} — "${u.phrase}"`)
  }
  /* the warnings follow the names asked for: a named ruling's own row; none for files alone; all with no names */
  const warns = rowWarnings(repo, findBase(repo)).filter(w => ds.size ? ds.has(w.split(' ')[0]) : !paths.length)
  if (warns.length) { out.push('', 'Warnings (rows this branch adds):'); for (const w of warns) out.push('  ' + w) }
  out.push('', summary(marks))
  out.push(`Unrecorded readings${named ? ' in what was named' : ' in src (name files or rulings to list them)'}: ${unrec.length} — treat as not asked`)
  return out
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const repo = join(dirname(fileURLToPath(import.meta.url)), '..', '..')
  for (const l of listing(repo, process.argv.slice(2))) console.log(l)
}
