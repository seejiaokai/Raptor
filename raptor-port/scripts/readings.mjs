#!/usr/bin/env node
/* THE READINGS LIST AND CHECK — his D2567 and D2610, [READINGS-LAPSE-FIX] (plan
 * docs/superpowers/plans/2026-11-24-readings-lapse-fix-plan.md §C7; the rule it serves: DECISIONS.md, "A reading").
 *
 * On 22 Nov 26 a builder read what "planned" covers and left that reading in a code comment ("his to change"); it was
 * never put to him, and three bug checks judged the code against it (the bug-check order's lesson 32). A reading now has
 * a form that is read: the ruling's full row carries `**READING, OPEN (<date>, asked | not asked): …**` until he rules,
 * code built on it carries `READING D<n>` in the comment that says so, and a comment about a reading he has answered
 * cites his answer, `ruled D<n>`.
 *
 * `npm run readings [D<n> …] [path …]` lists every open mark in the full rows and every tag under raptor-port/src,
 * narrowed to the named rulings or files, and prints `Readings open: <n> (<m> not asked)`. For named files or rulings it
 * also lists the comments that speak of a reading with no tag and no answer — old lines included — as "unrecorded,
 * treat as not asked" (the audit clears them, plan §C8); and it warns of a ruling row the branch adds whose words speak
 * of a reading with no mark. Neither of those two fails anything.
 *
 * Inside the document check (docsize.mjs — the Stop hook's --inventory run and GitHub's), these fail:
 *   (a) a `READING D<n>` tag whose ruling's row carries no open mark; a row holding `READING, OPEN (` that cannot be
 *       read as a mark (it would drop off the list silently); a `ruled D<n>` that names no ruling;
 *   (b) on lines a branch ADDS under raptor-port/src, a comment that speaks of a reading in free words (PHRASE, below —
 *       matched across the comment's line breaks) with neither `READING D<n>` nor `ruled D<n>` in the same comment.
 *       Added lines only, so the old comments block nothing; a line whose words already stood in the base version of
 *       that file (moved, re-indented) is not new.
 * What it is, honestly: a consistency check on readings somebody wrote down. A reading made with no words about it at all
 * passes it; those are the readers' question and the roll-call's row (the bug-check order §4 and §6). Comments in
 * .html files are not read. */
import { readFileSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { execFileSync } from 'node:child_process'

const SRC = 'raptor-port/src'
const ROWS_DIRS = ['.claude/decisions-full', '.claude/rules/decisions']   // a new row sits in its area file until the mover runs
const ARCHIVE = 'DECISIONS-ARCHIVE.md'
const CODE = /\.(ts|tsx|js|jsx|mjs|cjs|css)$/
/* The free words of a reading, any case, apostrophe straight or curly, words split by any white space (a comment's line
   break is folded to a space before this runs). Every phrase names a reading; "his call" is left out on purpose — it
   matches "his callsign". */
const PHRASE_SRC = [
  'his\\s+to\\s+(?:change|rule)',
  'for\\s+him\\s+to\\s+change',
  "(?:agent|builder|build|host|opus)['’]s(?:\\s+[a-z-]+){0,2}?\\s+readings?",
  '(?:my|our)\\s+readings?',
  'read\\s+here\\s+as',
  'until\\s+he\\s+rules',
  'not\\s+put\\s+to\\s+him',
].map(s => `\\b${s}\\b`).join('|')
export const PHRASE = new RegExp(PHRASE_SRC, 'i')
const phrases = () => new RegExp(PHRASE_SRC, 'gi')
const TAG = /\bREADING (D\d+)\b/g
const RULED = /\bruled\s+(D\d+)\b/gi
const ROW = /^\|\s*(D\d+)\s*\|/
/* the mark, with small typing variants: bold stars or none, any case, spaces round the comma and colon */
const MARK = /(?:\*\*)?READING,\s*OPEN\s*\(([^,)]*),\s*(asked|not asked)\s*\)\s*:\s*([\s\S]*?)(?:\*\*|\s+\||$)/gi
const MARKISH = /READING,\s*OPEN\s*\(/gi

/* ---------- the comment reader ---------- */
const REGEX_AFTER = new Set('(,=:[!&|?{};+-*%<>~^'.split(''))
const REGEX_WORDS = new Set(['return', 'typeof', 'case', 'do', 'else', 'in', 'of', 'new', 'delete', 'void', 'throw', 'yield', 'await', 'instanceof'])

/* Every comment in a source file, as { from, to } line numbers (1-based), its text, and `segs`: each line's comment words
   with the markers taken off (`//`, `/*`, a leading `*`, `*\/`), for matching a phrase across line breaks. A run of `//`
   lines with nothing but white space between them is ONE comment, as a block is. Quoted text is skipped — but a quote
   with no partner on its line (an apostrophe in JSX text: <p>Don't</p>) is not a quote; a regex literal is read as one
   (so a quote or backtick inside it opens nothing); a template literal's ${…} is read as code, comments and all. */
export function commentsIn(text) {
  const starts = [0]
  for (let k = 0; k < text.length; k++) if (text[k] === '\n') starts.push(k + 1)
  const lineOf = idx => { let lo = 0, hi = starts.length - 1; while (lo < hi) { const m = (lo + hi + 1) >> 1; if (starts[m] <= idx) lo = m; else hi = m - 1 } return lo + 1 }
  const out = []
  const n = text.length
  const stack = []           // one brace depth per open ${…}
  let depth = 0, prevSig = '', prevWord = '', i = 0
  /* reads a template's text from i (just past a backtick or a closing }), returns where code resumes */
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
    if (/[A-Za-z0-9_$]/.test(c)) {
      let j = i; while (j < n && /[A-Za-z0-9_$]/.test(text[j])) j++
      prevWord = text.slice(i, j); prevSig = /^[0-9]/.test(prevWord) ? ')' : 'w'; i = j; continue
    }
    prevSig = c === ')' || c === ']' ? ')' : c; i++
  }
  return out.map(({ from, to, text: t }) => {
    const segs = t.split('\n').map((l, k) => ({
      line: from + k,
      words: l.replace(/\*+\/\s*$/, '').replace(/^\s*(?:\/\/+|\/\*+|\{?\/\*+|\*+(?!\/))?/, ''),
    }))
    return { from, to, text: t, segs }
  })
}

/* each phrase in a comment, folded across its line breaks: { phrase, lines } — the lines the match covers */
function phrasesIn(comment) {
  let folded = ''
  const at = []                                                // [start offset in folded, line]
  for (const s of comment.segs) { if (folded) folded += ' '; at.push([folded.length, s.line]); folded += s.words }
  const found = []
  for (const m of folded.matchAll(phrases())) {
    const a = m.index, b = m.index + m[0].length
    const lines = []
    at.forEach(([off, line], k) => { const end = k + 1 < at.length ? at[k + 1][0] - 1 : folded.length; if (off < b && end > a) lines.push(line) })
    found.push({ phrase: m[0].replace(/\s+/g, ' '), lines })
  }
  return found
}
const settled = c => /\bREADING D\d+\b/.test(c.text) || /\bruled\s+D\d+\b/i.test(c.text)

/* (b): each phrase touching an ADDED line inside a comment that carries no tag and no answer → { file, line, phrase }
   (line: the first added line the phrase touches). */
export function unmarkedComments(file, text, added) {
  const found = []
  for (const c of commentsIn(text)) {
    if (settled(c)) continue
    for (const p of phrasesIn(c)) {
      const line = p.lines.find(l => added.has(l))
      if (line !== undefined) found.push({ file, line, phrase: p.phrase })
    }
  }
  return found
}

/* For the listing: every such phrase in the file, old lines included. */
export function unrecordedIn(file, text) {
  const found = []
  for (const c of commentsIn(text)) if (!settled(c)) for (const p of phrasesIn(c)) found.push({ file, line: p.lines[0], phrase: p.phrase, d: (c.text.match(/\bD\d+\b/g) || []) })
  return found
}

/* The open marks in a rulings file: { d, date, state, text, file } — one per mark, read only from a ruling's row. */
export function marksIn(file, text) {
  const out = []
  for (const l of text.split('\n')) {
    const r = ROW.exec(l)
    if (!r) continue
    for (const m of l.matchAll(MARK)) out.push({ d: r[1], date: m[1].trim(), state: m[2].toLowerCase(), text: m[3].trim(), file })
  }
  return out
}

/* A row holding "READING, OPEN (" more times than it holds a readable mark: the mark would drop off the list unseen. */
export function badMarks(file, text) {
  const out = []
  for (const l of text.split('\n')) {
    const r = ROW.exec(l)
    if (!r) continue
    const tried = [...l.matchAll(MARKISH)].length, read = [...l.matchAll(MARK)].length
    if (tried > read) out.push(`${file}: ${r[1]}'s row holds "READING, OPEN (" that cannot be read as a mark — write it as \`**READING, OPEN (<date>, asked | not asked): <one way>; the other: <…>.**\` (DECISIONS.md, "A reading")`)
  }
  return out
}

/* The tags in a source file: { d, file, line }. */
export function tagsIn(file, text) {
  const out = []
  text.split('\n').forEach((l, k) => { for (const m of l.matchAll(TAG)) out.push({ d: m[1], file, line: k + 1 }) })
  return out
}

/* (a): a tag whose ruling's row carries no open mark. */
export function tagsWithoutMark(tags, marks) {
  const open = new Set(marks.map(m => m.d))
  return tags.filter(t => !open.has(t.d))
    .map(t => `${t.file}:${t.line} carries READING ${t.d}, but ${t.d}'s full row carries no "READING, OPEN" mark — add the mark (DECISIONS.md, "A reading"), or, if he has ruled, rewrite the comment to cite his answer, ruled D<n>`)
}

export const summary = marks => `Readings open: ${marks.length} (${marks.filter(m => m.state === 'not asked').length} not asked)`

/* ---------- reading the repo ---------- */
const gitIn = (repo, ...a) => { try { return execFileSync('git', a, { cwd: repo, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], maxBuffer: 1 << 28 }) } catch { return null } }
const listed = (repo, ...a) => (gitIn(repo, ...a) || '').split('\n').filter(Boolean)
const read = (repo, f) => existsSync(join(repo, f)) ? readFileSync(join(repo, f), 'utf8').replace(/\r\n/g, '\n') : ''
const readAt = (repo, base, f) => (gitIn(repo, 'show', `${base}:${f}`) || '').replace(/\r\n/g, '\n')
const squash = l => l.replace(/\s+/g, ' ').trim()

/* Lines under raptor-port/src added since the base — committed, staged, unstaged and untracked: Map path → Set of
   line numbers in the file as it stands. A line whose words (white space aside) already stood in the base version of
   the file — moved or re-indented — is not counted. */
export function addedLines(repo, base, { only = null } = {}) {
  const out = new Map()
  if (!base) return out
  const was = new Map()                                        // path now → its path at the base
  let from = null, file = null
  for (const l of (gitIn(repo, '-c', 'core.quotepath=off', 'diff', '-M', '-U0', '--no-color', '--no-ext-diff', '--diff-filter=AMR', base, '--', SRC) || '').split('\n')) {
    if (l.startsWith('--- ')) { from = l.startsWith('--- a/') ? l.slice(6).replace(/\r$/, '') : null; continue }
    if (l.startsWith('+++ ')) { file = l.startsWith('+++ b/') ? l.slice(6).replace(/\r$/, '') : null; if (file && from) was.set(file, from); continue }
    const h = /^@@ -\S+ \+(\d+)(?:,(\d+))? @@/.exec(l)
    if (h && file) {
      const first = +h[1], cnt = h[2] === undefined ? 1 : +h[2]
      if (!out.has(file)) out.set(file, new Set())
      for (let k = 0; k < cnt; k++) out.get(file).add(first + k)
    }
  }
  for (const [f, lines] of out) {
    /* `only`: the files worth the base read (each one a git call) — the check names those with a phrase on a new line */
    if (!was.has(f) || (only && !only(f, lines))) continue
    const old = new Set(readAt(repo, base, was.get(f)).split('\n').map(squash).filter(Boolean))
    const now = read(repo, f).split('\n')
    for (const ln of [...lines]) { const s = squash(now[ln - 1] || ''); if (s && old.has(s)) lines.delete(ln) }
  }
  for (const f of listed(repo, '-c', 'core.quotepath=off', 'ls-files', '--others', '--exclude-standard', '--', SRC)) {
    const cnt = read(repo, f).split('\n').length
    out.set(f, new Set(Array.from({ length: cnt }, (_, k) => k + 1)))
  }
  return out
}

/* Each git call costs about half a second in this tree, and the Stop hook runs the check at every turn's end under a
   20-second limit — so the rows are listed once and the source searched once (`--untracked` takes tracked files too). */
const rowFiles = repo => listed(repo, 'ls-files', '--cached', '--others', '--exclude-standard', '--', ...ROWS_DIRS)
  .filter(f => f.endsWith('.md'))
const rowTexts = repo => [...new Set(rowFiles(repo))].map(f => [f, read(repo, f)])
export const allMarks = repo => rowTexts(repo).flatMap(([f, t]) => marksIn(f, t))

/* files under src holding a pattern, by git's own search */
const grepFiles = (repo, ...pat) =>
  listed(repo, '-c', 'core.quotepath=off', 'grep', '--untracked', '-l', '-i', '-E', ...pat, '--', SRC).filter(f => CODE.test(f))
export const allTags = repo => grepFiles(repo, '-e', 'READING D[0-9]').flatMap(f => tagsIn(f, read(repo, f)))

/* ruled D<n> naming no ruling */
function ruledUnknown(found, rows, repo) {
  if (!found.length) return []
  const ids = new Set([...rows, [ARCHIVE, read(repo, ARCHIVE)]].flatMap(([, t]) => t.split('\n').map(l => ROW.exec(l)?.[1]).filter(Boolean)))
  return found.filter(r => !ids.has(r.d))
    .map(r => `${r.file}:${r.line} cites "ruled ${r.d}", but ${r.d} is no ruling in the rulings' rows or their archive — cite the ruling that answered it`)
}

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
  const marks = rows.flatMap(([f, t]) => marksIn(f, t))
  const tags = [], ruled = []
  for (const f of grepFiles(repo, '-e', 'READING D[0-9]', '-e', 'ruled[[:space:]]+D[0-9]')) {
    const t = read(repo, f)
    tags.push(...tagsIn(f, t))
    t.split('\n').forEach((l, k) => { for (const m of l.matchAll(RULED)) ruled.push({ file: f, line: k + 1, d: m[1].toUpperCase() }) })
  }
  const fails = [...tagsWithoutMark(tags, marks), ...rows.flatMap(([f, t]) => badMarks(f, t)), ...ruledUnknown(ruled, rows, repo)]
  const texts = new Map()
  const text = f => { if (!texts.has(f)) texts.set(f, read(repo, f)); return texts.get(f) }
  const hit = (f, added) => CODE.test(f) && unmarkedComments(f, text(f), added).length > 0
  for (const [f, added] of addedLines(repo, base, { only: hit })) {
    if (!CODE.test(f) || !added.size) continue
    for (const u of unmarkedComments(f, text(f), added))
      fails.push(`${u.file}:${u.line} — a comment this branch adds speaks of a reading ("${u.phrase}") with neither READING D<n> nor ruled D<n>: a reading is his to settle (DECISIONS.md, "A reading") — put it to him, mark its ruling's full row "READING, OPEN" and tag the comment READING D<n>; or, if he has answered it, cite his answer, ruled D<n>`)
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

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const repo = join(dirname(fileURLToPath(import.meta.url)), '..', '..')
  const args = process.argv.slice(2)
  const ds = new Set(args.filter(a => /^D\d+$/i.test(a)).map(a => a.toUpperCase()))
  const paths = args.filter(a => !/^D\d+$/i.test(a)).map(p => p.replace(/\\/g, '/').replace(/^\.\//, '').replace(/\/$/, ''))
  const inPaths = f => paths.some(p => f === p || f.startsWith(p + '/') || f === 'raptor-port/' + p || f.startsWith('raptor-port/' + p + '/'))
  let marks = allMarks(repo), tags = allTags(repo)
  if (paths.length) { tags = tags.filter(t => inPaths(t.file)); const cited = new Set(tags.map(t => t.d)); marks = marks.filter(m => cited.has(m.d) || ds.has(m.d)) }
  if (ds.size) { marks = marks.filter(m => ds.has(m.d)); tags = tags.filter(t => ds.has(t.d)) }
  console.log('Open readings, in the rulings\' full rows:')
  if (!marks.length) console.log('  none')
  for (const m of marks) console.log(`  ${m.d} (${m.date}, ${m.state}) — ${m.text}   [${m.file}]`)
  console.log('\nCode built on a reading (READING D<n>):')
  if (!tags.length) console.log('  none')
  for (const t of tags) console.log(`  ${t.d} — ${t.file}:${t.line}`)

  /* the comments that speak of a reading with no tag and no answer — old lines included */
  const candidates = grepFiles(repo, '-e', 'reading|his to|him to|until he|he rules|put to him|read here|here as')
  let unrec = candidates.flatMap(f => unrecordedIn(f, read(repo, f)))
  if (paths.length || ds.size) {
    unrec = unrec.filter(u => (paths.length && inPaths(u.file)) || (ds.size && u.d.some(d => ds.has(d))))
    console.log('\nUnrecorded — a comment speaks of a reading with no tag and no answer; treat as not asked:')
    if (!unrec.length) console.log('  none')
    for (const u of unrec) console.log(`  ${u.file}:${u.line} — "${u.phrase}"`)
  }
  /* the warnings follow the names asked for: a named ruling's own row; none for files alone; all with no names */
  const warns = rowWarnings(repo, findBase(repo)).filter(w => ds.size ? ds.has(w.split(' ')[0]) : !paths.length)
  if (warns.length) { console.log('\nWarnings (rows this branch adds):'); for (const w of warns) console.log('  ' + w) }
  console.log('\n' + summary(marks))
  console.log(`Unrecorded readings${paths.length || ds.size ? ' in what was named' : ' in src (name files or rulings to list them)'}: ${unrec.length} — treat as not asked`)
}
