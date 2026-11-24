#!/usr/bin/env node
/* THE READINGS LIST AND CHECK — his D2567 and D2610, [READINGS-LAPSE-FIX] (plan
 * docs/superpowers/plans/2026-11-24-readings-lapse-fix-plan.md §C7; the rule it serves: DECISIONS.md, "A reading").
 *
 * On 22 Nov 26 a builder read what "planned" covers and left that reading in a code comment ("his to change"); it was
 * never put to him, and three bug checks judged the code against it (the bug-check order's lesson 32). A reading now has
 * a form that is read: the ruling's full row carries `**READING, OPEN (<date>, asked | not asked): …**` until he rules,
 * and code built on it carries `READING D<n>` in the comment that says so.
 *
 * `npm run readings [D<n> …] [path …]` lists every open mark in the full rows and every tag under raptor-port/src,
 * narrowed to the named rulings or files, and prints `Readings open: <n> (<m> not asked)`.
 *
 * Inside the document check (docsize.mjs — the Stop hook's --inventory run and GitHub's), two failures:
 *   (a) a `READING D<n>` tag whose ruling's row carries no open mark;
 *   (b) on lines a branch ADDS under raptor-port/src, a comment that speaks of a reading in free words — "his to
 *       change", "agent's / builder's / build's reading", "until he rules", "not put to him" — with no `READING D<n>`
 *       in the same comment. Added lines only, so the old comments block nothing; the audit clears them (§C8).
 * What it is, honestly: a consistency check on readings somebody wrote down. A reading made with no words about it at all
 * passes it; those are the readers' question and the roll-call's row (the bug-check order §4 and §6). */
import { readFileSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { execFileSync } from 'node:child_process'

const SRC = 'raptor-port/src'
const ROWS_DIRS = ['.claude/decisions-full', '.claude/rules/decisions']   // a new row sits in its area file until the mover runs
const CODE = /\.(ts|tsx|js|jsx|mjs|cjs|css)$/
/* the free words of a reading — apostrophe straight or curly, any case */
export const PHRASE = /his to change|(?:agent|builder|build)['’]s reading|until he rules|not put to him/i
const TAG = /\bREADING (D\d+)\b/g
const ROW = /^\|\s*(D\d+)\s*\|/
const MARK = /\*\*READING, OPEN \(([^,)]*),\s*(asked|not asked)\):\s*([\s\S]*?)\*\*/g

/* Every comment in a source file, as { from, to } line numbers (1-based) and its text. A run of `//` lines with nothing
   but white space between them is ONE comment, as a block is. Strings and template literals are skipped, so a phrase
   in words shown on screen is not a comment. */
export function commentsIn(text) {
  const out = []
  const lineAt = []
  for (let i = 0, ln = 1; i <= text.length; i++) { lineAt.push(ln); if (text[i] === '\n') ln++ }
  let i = 0
  while (i < text.length) {
    const c = text[i], n = text[i + 1]
    if (c === '"' || c === '\'' || c === '`') {
      i++
      while (i < text.length && text[i] !== c) { if (text[i] === '\\') i++; else if (c !== '`' && text[i] === '\n') break; i++ }
      i++
    } else if (c === '/' && n === '/') {
      const end = text.indexOf('\n', i), stop = end < 0 ? text.length : end
      const prev = out[out.length - 1]
      if (prev && prev.line && /^\s*$/.test(text.slice(prev.end, i)) && lineAt[i] === prev.to + 1) {
        prev.text += '\n' + text.slice(i, stop); prev.to = lineAt[i]; prev.end = stop
      } else out.push({ from: lineAt[i], to: lineAt[i], text: text.slice(i, stop), end: stop, line: true })
      i = stop
    } else if (c === '/' && n === '*') {
      const end = text.indexOf('*/', i + 2), stop = end < 0 ? text.length : end + 2
      out.push({ from: lineAt[i], to: lineAt[stop - 1], text: text.slice(i, stop), end: stop, line: false })
      i = stop
    } else i++
  }
  return out.map(({ from, to, text: t }) => ({ from, to, text: t }))
}

/* (b): each phrase on an ADDED line inside a comment that carries no tag → { file, line, phrase }. */
export function unmarkedComments(file, text, added) {
  const found = []
  for (const c of commentsIn(text)) {
    if (/\bREADING D\d+\b/.test(c.text)) continue
    c.text.split('\n').forEach((l, k) => {
      const m = PHRASE.exec(l), line = c.from + k
      if (m && added.has(line)) found.push({ file, line, phrase: m[0] })
    })
  }
  return found
}

/* The open marks in a rulings file: { d, date, state, text, file } — one per mark, read only from a ruling's row. */
export function marksIn(file, text) {
  const out = []
  for (const l of text.split('\n')) {
    const r = ROW.exec(l)
    if (!r) continue
    for (const m of l.matchAll(MARK)) out.push({ d: r[1], date: m[1].trim(), state: m[2], text: m[3].trim(), file })
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
    .map(t => `${t.file}:${t.line} carries READING ${t.d}, but ${t.d}'s full row carries no "READING, OPEN" mark — add the mark (DECISIONS.md, "A reading"), or, if he has ruled, rewrite the comment to cite his answer`)
}

export const summary = marks => `Readings open: ${marks.length} (${marks.filter(m => m.state === 'not asked').length} not asked)`

/* ---------- reading the repo ---------- */
const gitIn = (repo, ...a) => { try { return execFileSync('git', a, { cwd: repo, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], maxBuffer: 1 << 28 }) } catch { return null } }
const listed = (repo, ...a) => (gitIn(repo, ...a) || '').split('\n').filter(Boolean)
const read = (repo, f) => existsSync(join(repo, f)) ? readFileSync(join(repo, f), 'utf8').replace(/\r\n/g, '\n') : ''

/* Lines under raptor-port/src added since the base — committed, staged, unstaged and untracked: Map path → Set of
   line numbers in the file as it stands. */
export function addedLines(repo, base) {
  const out = new Map()
  if (!base) return out
  let file = null
  for (const l of (gitIn(repo, '-c', 'core.quotepath=off', 'diff', '-U0', '--no-color', '--no-ext-diff', '--diff-filter=AMR', base, '--', SRC) || '').split('\n')) {
    if (l.startsWith('+++ ')) { file = l.startsWith('+++ b/') ? l.slice(6).replace(/\r$/, '') : null; continue }
    const h = /^@@ -\S+ \+(\d+)(?:,(\d+))? @@/.exec(l)
    if (h && file) {
      const from = +h[1], n = h[2] === undefined ? 1 : +h[2]
      if (!out.has(file)) out.set(file, new Set())
      for (let k = 0; k < n; k++) out.get(file).add(from + k)
    }
  }
  for (const f of listed(repo, '-c', 'core.quotepath=off', 'ls-files', '--others', '--exclude-standard', '--', SRC)) {
    const n = read(repo, f).split('\n').length
    out.set(f, new Set(Array.from({ length: n }, (_, k) => k + 1)))
  }
  return out
}

export function allMarks(repo) {
  const files = ROWS_DIRS.flatMap(d => [...new Set([...listed(repo, 'ls-files', '--', d), ...listed(repo, 'ls-files', '--others', '--exclude-standard', '--', d)])])
    .filter(f => f.endsWith('.md'))
  return files.flatMap(f => marksIn(f, read(repo, f)))
}

/* The tags, found by git's own search (fast — the Stop hook runs this at every turn's end), then read file by file. */
export function allTags(repo) {
  const files = new Set([
    ...listed(repo, '-c', 'core.quotepath=off', 'grep', '-l', '-E', 'READING D[0-9]', '--', SRC),
    ...listed(repo, '-c', 'core.quotepath=off', 'grep', '--untracked', '-l', '-E', 'READING D[0-9]', '--', SRC),
  ])
  return [...files].filter(f => CODE.test(f)).flatMap(f => tagsIn(f, read(repo, f)))
}

/* The document check's part: { fails, marks, tags, line }. */
export function check({ repo, base }) {
  const marks = allMarks(repo), tags = allTags(repo)
  const fails = [...tagsWithoutMark(tags, marks)]
  for (const [f, added] of addedLines(repo, base)) {
    if (!CODE.test(f)) continue
    for (const u of unmarkedComments(f, read(repo, f), added))
      fails.push(`${u.file}:${u.line} — a comment this branch adds speaks of a reading ("${u.phrase}") with no READING D<n> tag: a reading is his to settle (DECISIONS.md, "A reading") — put it to him, mark its ruling's full row "READING, OPEN", and tag the comment`)
  }
  return { fails, marks, tags, line: summary(marks) }
}

/* ---------- npm run readings ---------- */
if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const repo = join(dirname(fileURLToPath(import.meta.url)), '..', '..')
  const args = process.argv.slice(2)
  const ds = new Set(args.filter(a => /^D\d+$/.test(a)))
  const paths = args.filter(a => !/^D\d+$/.test(a)).map(p => p.replace(/\\/g, '/').replace(/^\.\//, ''))
  const inPaths = f => paths.some(p => f === p || f.startsWith(p.endsWith('/') ? p : p + '/') || f.endsWith('/' + p) || f === 'raptor-port/' + p)
  let marks = allMarks(repo), tags = allTags(repo)
  if (paths.length) { tags = tags.filter(t => inPaths(t.file)); const cited = new Set(tags.map(t => t.d)); marks = marks.filter(m => cited.has(m.d) || ds.has(m.d)) }
  if (ds.size) { marks = marks.filter(m => ds.has(m.d)); tags = tags.filter(t => ds.has(t.d)) }
  console.log('Open readings, in the rulings\' full rows:')
  if (!marks.length) console.log('  none')
  for (const m of marks) console.log(`  ${m.d} (${m.date}, ${m.state}) — ${m.text}   [${m.file}]`)
  console.log('\nCode built on a reading (READING D<n>):')
  if (!tags.length) console.log('  none')
  for (const t of tags) console.log(`  ${t.d} — ${t.file}:${t.line}`)
  console.log('\n' + summary(marks))
}
