#!/usr/bin/env node
/* SETTLE THE RECORDS AFTER A MERGE STOPS — [MERGE-ONCE-RECORDS] part 2 (his go, D1930, 8 Nov 26; the plan as red-teamed:
 * raptor-port/docs/superpowers/plans/2026-11-08-merge-once-records-plan.md §After the red team).
 *
 *   git merge --no-commit --no-ff origin/main      (stopped on clashes, or not — run this either way)
 *   node raptor-port/scripts/records-merge.mjs [--dry-run]
 *
 * On 8 Nov 26, 74 of 143 merges stopped on clashes, nearly all in the record files every chat writes at the same spot:
 * HANDOFF.md, the skill log, the file map. Each chat settled them by hand, often several times a day. This settles what a
 * rule can settle, the same way every time, and leaves the rest marked for the chat. What it never does, on purpose:
 *   - read a file from disk as its input: it reads git's three staged copies (base :1:, ours :2:, theirs :3:) of each path
 *     git still lists as unmerged, so a chat's edit in the working copy can never be built over;
 *   - touch a file the chat has already edited: a working copy that is no longer git's own conflicted output (git
 *     merge-file of the same three copies) is REFUSED by name. A working copy equal to what this step would write is a
 *     second run, and is left as it is — a second run on the same input changes nothing;
 *   - stage anything (`git add` stays the chat's) or run `git merge --abort`;
 *   - decide by branch name whose block is whose (Astra 1; Opus 1, 2): a chat removes merged blocks, writes into another
 *     chat's block, takes one over, or sits on a detached HEAD. Every record is merged three ways against the base;
 *   - undo good work because something is left (Astra 6; Opus 3, 7): what it settled stays settled, and what is left is
 *     written in git's own conflict marks for that record alone.
 *
 * THE RULE, for every record in every file it settles: compared with the base — the same on both sides, or changed on one
 * side only: that side; added on one side: kept; deleted on one side and untouched on the other: deleted. Changed on both
 * sides: the two changes are merged line by line, as git would merge them, and kept if that is clean — otherwise left,
 * with git's marks for that record. Added on both sides as different text, or deleted on one side and changed on the other:
 * left. Records keep the order of the side that changed the order (both reordered: the whole file is left); new ones go
 * where their side put them — at the same place, this branch's first (the skill log: main's first, see below).
 *
 * THE RECORDS, BY FILE:
 *   HANDOFF.md — the head, the ## Now heading's own lines, each <!-- now:… --> block by its marker (to the next marker or
 *     heading), ## Next, in order, ## Gate baseline, and every later section by its heading; markers inside a code block
 *     are text. The gate baseline changed on both sides is ALWAYS left, even where the lines merge: which count is newer,
 *     and where the other goes, is a judgement (D1733; Astra 7). A block given a new marker is one removed and one added.
 *   The skill log — the head, each `## <day>` heading, each `### Observation N:` entry (to the next heading of either
 *     kind). Two different entries with one number, added on both sides since the base: this branch's is renumbered past
 *     the highest number on this branch, main, the log's archive and every branch, local and remote (the skill notes' short form,
 *     step 1); only the heading changes — a citation is NEVER rewritten (round 3: which note it means cannot be known);
 *     each renumber is printed, old → new, with the note's title, and every line this branch added that cites the old
 *     number, in the log or any other file, is listed "look by hand: <file>:<line> cites Observation N (renumbered here
 *     to M)" (a pushed commit message cannot be changed). Main's new notes are placed before this branch's at the same
 *     spot, so the numbers run upward (the agent's reading of the plan's "where their side put them" — Opus 9).
 *     Day headings (`## `) changed on either side since the base — added, removed, reworded or moved — leave the whole
 *     log (rounds 3 and 4 — which note goes under which day is never guessed).
 *   walk-ledger.md, file-map.md, OUTSTANDING-ARCHIVE.md, DECISIONS-ARCHIVE.md, OUTSTANDING.md — git's own clash regions,
 *     read three ways: a region where BOTH sides only inserted text at the same place (its base is empty) is settled as
 *     this branch's text, then main's (one blank line between where either is paragraph-shaped, not table rows) ONLY
 *     when the two share no line that is not blank, neither holds a line starting with `#` or a table's head, each is
 *     whole rows or no rows, and neither ended without a line end (round 3, the host's guardrails — whyNotJoin). Any
 *     other region, a day heading both opened among them, is left exactly as git marked it.
 *   In the log and HANDOFF.md alike, a new record goes after its predecessor as placed (a heading both sides opened
 *     included), never past the other side's next new heading (Astra 2, Opus 1–3 of the code read); both sides opening
 *     different new `## ` sections at one place keeps both in HANDOFF.md, this branch's first (round 3, Opus re-read 5).
 *   DECISIONS.md and the rulings files — not touched. `backlog-archive.mjs --rulings --merge` merges every ruling three
 *     ways from git's own copies and refuses to start while any other file is unmerged, so: this step first, then the chat
 *     stages what this step settled (`git add`), then that command, which this step prints when a rulings file is left.
 *     That mode starts DECISIONS-ARCHIVE.md again from git's copies too — what this step settled there is redone by it.
 *   Any other unmerged file (app code among them) — not touched, listed.
 *
 * THEN: if nothing is left unmerged (a merge that ended clean included — Astra 2, Opus 4: a clean merge can still hold a
 * doubled skill-note number), `npm run docsize` and `npm run rulecheck`. A failure counts only if it is new — the same
 * check on the commit being merged in (MERGE_HEAD — origin/main in the ordinary step) is run in a throwaway worktree, and
 * a failure line it also prints is not counted (Opus 7). A new failure puts every file this step settled back to git's
 * conflicted state (`git checkout -m -- <file>`, never an abort) and names it. With anything left, the checks are not run:
 * the chat runs them after its part.
 *
 * Exit: 0 — settled, checks green; 2 — work left for the chat (printed by file and record); 1 — a new check failure, a
 * refusal to start, or an error. --dry-run prints what it would do and writes nothing (and runs no check). --no-checks
 * settles and stops before the checks: only the replay (records-merge-replay.mjs) uses it, as it compares the files the
 * step settled with what the chat committed, and a check's put-back would hide them — a chat never passes it. */
import { readFileSync, writeFileSync, existsSync, renameSync, rmSync, mkdtempSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { tmpdir } from 'node:os'
import { fileURLToPath } from 'node:url'
import { execFileSync, spawnSync } from 'node:child_process'
import { closedFencedFlags, unclosedFences, OBS_HEAD, observationHeads } from './docsize-rulings.mjs'

const REPO = join(dirname(fileURLToPath(import.meta.url)), '..', '..')
const args = process.argv.slice(2)
const DRY = args.includes('--dry-run'), NO_CHECKS = args.includes('--no-checks')

const die = msg => { console.error(`records-merge: ${msg}`); process.exit(1) }
const git = (...a) => execFileSync('git', a, { cwd: REPO, encoding: 'utf8', maxBuffer: 256 << 20, stdio: ['ignore', 'pipe', 'ignore'] })
const tryGit = (...a) => { try { return git(...a) } catch { return null } }

const HANDOFF = 'HANDOFF.md', SKILL_LOG = '.claude/skill-observations/log.md', SKILL_ARCHIVE = '.claude/skill-observations/archive'
const INSERT_ONLY = ['raptor-port/docs/walk-ledger.md', 'raptor-port/docs/file-map.md', 'OUTSTANDING-ARCHIVE.md', 'DECISIONS-ARCHIVE.md', 'OUTSTANDING.md']
const isRulings = f => f === 'DECISIONS.md' || f.startsWith('.claude/rules/decisions/') || f.startsWith('.claude/decisions-full/')
const RULINGS_CMD = 'node raptor-port/scripts/backlog-archive.mjs --rulings --merge'
const TMP = '.records-merge-tmp'
/* a skill note's heading is OBS_HEAD, outside a code block — the one definition the document gate and the replay share
   (docsize-rulings.mjs, Astra 5 of the code read) */
const NOW_MARK = /^<!-- now:(\S+) -->\s*$/

/* ---------- git's staged copies, byte for byte ----------
   A blob is read as a Buffer and decoded only if it round-trips: a file this step cannot hold exactly is left to the
   chat, never rewritten (the skill log keeps one line ending in a carriage return — its bytes are kept as git gave them). */
const blob = spec => {
  let buf
  try { buf = execFileSync('git', ['cat-file', 'blob', spec], { cwd: REPO, maxBuffer: 256 << 20, stdio: ['ignore', 'pipe', 'ignore'] }) } catch { return null }
  const s = buf.toString('utf8')
  if (!Buffer.from(s, 'utf8').equals(buf)) throw new Leave(`${spec} is not plain UTF-8 text`)
  return s
}
class Leave extends Error {}

/* the conflict style and the diff git's merge used: ort merges with the histogram diff, and its marks follow
   merge.conflictStyle — so `git merge-file` with both is git's own output for the same three copies */
const CONFIG_STYLE = (tryGit('config', '--get', 'merge.conflictStyle') || 'merge').trim()
let STYLE, STYLE_ARGS
const useStyle = s => { STYLE = s; STYLE_ARGS = s === 'diff3' ? ['--diff3'] : s === 'zdiff3' ? ['--zdiff3'] : [] }
useStyle(CONFIG_STYLE)
/* a merge typed with `git -c merge.conflictStyle=…` used a style the config does not hold: the config's is tried first,
   then git's other two, before a working copy is called edited (Opus 4 of the code read) */
const STYLES = [CONFIG_STYLE, ...['merge', 'diff3', 'zdiff3'].filter(s => s !== CONFIG_STYLE)]
const scratch = mkdtempSync(join(tmpdir(), 'records-merge-'))
process.on('exit', () => rmSync(scratch, { recursive: true, force: true }))
let scratchN = 0
function mergeFile(ours, base, theirs, labels, extra = []) {
  const p = ['o', 'b', 't'].map(x => join(scratch, `${scratchN}-${x}`)); scratchN++
  writeFileSync(p[0], ours); writeFileSync(p[1], base); writeFileSync(p[2], theirs)
  const r = spawnSync('git', ['merge-file', '-p', '--diff-algorithm=histogram', ...extra, '-L', labels[0], '-L', labels[1], '-L', labels[2], p[0], p[1], p[2]], { cwd: REPO, maxBuffer: 256 << 20 })
  if (r.status < 0 || r.status === null || r.status > 127) throw new Error(`git merge-file failed: ${r.stderr}`)
  return { text: r.stdout.toString('utf8'), clean: r.status === 0 }
}

/* the labels git wrote in this file's marks (they depend on how the merge was typed — `origin/main`, a renamed path's
   `HEAD:<path>`), reused for the marks this step writes so the file reads as git's; and the comparison that proves a
   working copy is still git's own output: line for line, a mark line compared by its mark alone, never by its label */
const labelsOf = text => {
  const pick = re => { const m = re.exec(text); return m ? m[1] : null }
  return [pick(/^<{7} (.*)$/m) || 'HEAD', pick(/^\|{7} (.*)$/m) || 'base', pick(/^>{7} (.*)$/m) || 'MERGE_HEAD']
}
const markless = t => t.split('\n').map(l => /^(<{7}|\|{7}|>{7})( |\r?$)/.test(l) ? l.slice(0, 7) : l).join('\n')
const sameConflict = (a, b) => a === b || markless(a) === markless(b)

/* lines with their endings kept, so a record is its exact bytes */
const linesOf = t => t.match(/[^\n]*\n|[^\n]+$/g) || []
const nl = t => (t && !t.endsWith('\n') ? t + '\n' : t)

/* ---------- cutting a file into its records ---------- */
function cut(text, keyOf, fenced) {
  const recs = [], ls = linesOf(text), inF = fenced ? closedFencedFlags(ls) : ls.map(() => false) // a fence open at the end is text (round 3, Opus re-read 3)
  let cur = { key: 'head', text: '' }
  for (const [i, line] of ls.entries()) {
    const bare = line.replace(/\r?\n$/, '')
    const k = !inF[i] ? keyOf(bare) : null
    if (k) { recs.push(cur); cur = { key: k, text: '' } }
    cur.text += line
  }
  recs.push(cur)
  const seen = new Set()
  for (const r of recs) { if (seen.has(r.key)) throw new Leave(`it holds ${describe(r.key)} twice on one side`); seen.add(r.key) }
  return recs
}
const handoffKey = l => { const m = NOW_MARK.exec(l); return m ? `now:${m[1]}` : /^## /.test(l) ? `sec:${l.trim()}` : null }
const notesKey = l => { const m = OBS_HEAD.exec(l); return m ? `obs:${m[1]}` : /^## /.test(l) ? `sec:${l.trim()}` : null }
const describe = k => k === 'head' ? 'the head of the file' : k.startsWith('now:') ? `the ## Now block for ${k.slice(4)}` : k.startsWith('obs:') ? `Observation ${k.slice(4)}` : `the section "${k.slice(4)}"`

/* ---------- the three-way merge of records ---------- */
function orderKeys(B, O, T, first, leaveNewHeadings) {
  const bk = B.map(r => r.key), ok = O.map(r => r.key), tk = T.map(r => r.key)
  const bs = new Set(bk), all = new Set(bk.filter(k => ok.includes(k) && tk.includes(k)))
  const seq = a => a.filter(k => all.has(k)).join('\0')
  const S = seq(ok) === seq(bk) ? tk : (seq(tk) === seq(bk) || seq(tk) === seq(ok)) ? ok : null
  if (!S) throw new Leave('both sides changed the order of its records')
  /* the base's records in the order of the side that changed it, a record that side deleted kept after its base
     predecessor (it may still be live on the other side) */
  const skel = S.filter(k => bs.has(k))
  bk.forEach((k, i) => { if (!skel.includes(k)) { const prev = bk.slice(0, i).reverse().find(p => skel.includes(p)); skel.splice(prev ? skel.indexOf(prev) + 1 : 0, 0, k) } })
  /* the first side's new records after their base predecessor; then each of the other side's new records after ITS
     predecessor as placed so far (a base record, or a new one either side added — a day heading both opened), past the
     first side's own new records there but never past one of their headings, so each entry stays under the heading it
     was written under (Astra 2 of the code read). Both sides opening different new headings at one base spot: in the
     skill log (leaveNewHeadings) which goes first, and which entries go under which, cannot be known — the file is
     left; in HANDOFF.md a section holds no other side's entries, so both are kept, the first side's first (round 3,
     Opus re-read 5 — the leave had left every chat's block). */
  const [A1, A2] = first === 'ours' ? [ok, tk] : [tk, ok]
  const isSec = k => k.startsWith('sec:')
  const baseBefore = (side, i) => side.slice(0, i).reverse().find(p => bs.has(p)) ?? '^'
  const groups = new Map()
  A1.forEach((k, i) => { if (!bs.has(k)) { const a = baseBefore(A1, i); groups.set(a, [...(groups.get(a) || []), k]) } })
  const list = [...(groups.get('^') || []), ...skel.flatMap(k => [k, ...(groups.get(k) || [])])]
  const inList = new Set(list), a2 = new Set(A2)
  const firstSecsAt = new Set(A1.flatMap((k, i) => !bs.has(k) && isSec(k) && !a2.has(k) ? [baseBefore(A1, i)] : []))
  A2.forEach((k, i) => {
    if (inList.has(k)) return
    if (leaveNewHeadings && isSec(k) && firstSecsAt.has(baseBefore(A2, i))) throw new Leave('both sides added new headings at one place — which goes first, and which entries go under which, is yours to judge')
    const anchor = A2.slice(0, i).reverse().find(p => inList.has(p))
    let pos = anchor === undefined ? 0 : list.indexOf(anchor) + 1
    while (pos < list.length && !bs.has(list[pos]) && !a2.has(list[pos]) && (isSec(k) || !isSec(list[pos]))) pos++
    list.splice(pos, 0, k); inList.add(k)
  })
  return list
}
function renderConflict(o, b, t, labels) {
  const mid = STYLE === 'merge' ? '' : `||||||| ${labels[1]}\n${nl(b || '')}`
  return `<<<<<<< ${labels[0]}\n${nl(o || '')}${mid}=======\n${nl(t || '')}>>>>>>> ${labels[2]}\n`
}
function mergeRecords(B, O, T, { labels, first, alwaysLeave = () => false, leaveNewHeadings = false }) {
  const mb = new Map(B.map(r => [r.key, r.text])), mo = new Map(O.map(r => [r.key, r.text])), mt = new Map(T.map(r => [r.key, r.text]))
  const out = [], left = [], settled = []
  for (const k of orderKeys(B, O, T, first, leaveNewHeadings)) {
    const b = mb.get(k), o = mo.get(k), t = mt.get(k)
    if (o === t) { if (o !== undefined) out.push(o); if (o !== b) settled.push(`${describe(k)}: the same change on both sides`); continue }
    if (o === b) { if (t !== undefined) out.push(t); settled.push(`${describe(k)}: ${t === undefined ? 'removed' : b === undefined ? 'added' : 'changed'} on main's side`); continue }
    if (t === b) { if (o !== undefined) out.push(o); settled.push(`${describe(k)}: ${o === undefined ? 'removed' : b === undefined ? 'added' : 'changed'} on this branch`); continue }
    const why = b === undefined ? 'added on both sides, differently' : o === undefined || t === undefined ? `removed on ${o === undefined ? 'this branch' : "main's side"} and changed on the other` : 'changed on both sides'
    if (b !== undefined && o !== undefined && t !== undefined && !alwaysLeave(k)) {
      const m = mergeFile(o, b, t, labels, STYLE_ARGS)
      if (m.clean) { out.push(m.text); settled.push(`${describe(k)}: changed on both sides, the lines merged cleanly`); continue }
      out.push(m.text); left.push(`${describe(k)} — ${why}`); continue
    }
    out.push(renderConflict(o, b, t, labels))
    left.push(`${describe(k)} — ${why}${alwaysLeave(k) ? ' (which count is newer, and where the other goes, is yours to judge — D1733)' : ''}`)
  }
  /* a record that was the LAST of its file on some side often ends with no blank line; set before another record here,
     it would run into the next heading (the replay's first finding, 8 Nov 26) — so it gets the one blank line every
     other record ends with; one that ended with no line ending at all gets its line ending first, or its last line and
     the next heading become one line (Astra 1 of the code read). The file's own last record keeps its ending as it is. */
  const lasts = new Set([B, O, T].map(s => s.length && s[s.length - 1].text))
  for (let i = 0; i < out.length - 1; i++) {
    const wasLast = lasts.has(out[i])
    if (out[i] && !out[i].endsWith('\n')) out[i] += '\n'
    if (wasLast && !/\n[ \t]*\r?\n$/.test(out[i]) && out[i + 1].trim()) out[i] += '\n'
  }
  return { text: out.join(''), left, settled }
}

/* ---------- the skill log's numbers ---------- */
/* read once a run (each conflict style tried settles the log again): the highest number on every branch, and the
   titles each number heads there */
let seen = null
const branchNumbers = refs => (seen ??= readHighest(refs))
const highestNumber = refs => branchNumbers(refs).max
function readHighest(refs) {
  /* the short form's grep finds every copy of the log and its archive that holds a heading, over the two sides of the
     merge and every branch, in batches (a long ref list overflows a Windows command line); each distinct copy is then
     read whole and its headings taken by the shared definition, so a heading inside a code block is not a number
     (Astra 5) */
  const specs = []
  for (let i = 0; i < refs.length; i += 60) {
    const r = spawnSync('git', ['grep', '-l', '-E', '^### Observation [0-9]+', ...refs.slice(i, i + 60), '--', SKILL_LOG, SKILL_ARCHIVE], { cwd: REPO, encoding: 'utf8', maxBuffer: 256 << 20 })
    specs.push(...(r.stdout || '').split('\n').filter(Boolean))
  }
  const titles = new Map()
  if (!specs.length) return { max: 0, titles }
  const ids = spawnSync('git', ['cat-file', '--batch-check=%(objectname)'], { cwd: REPO, input: specs.join('\n') + '\n', encoding: 'utf8', maxBuffer: 256 << 20 })
  const oids = [...new Set((ids.stdout || '').split('\n').filter(l => /^[0-9a-f]{40,64}$/.test(l)))]
  const all = spawnSync('git', ['cat-file', '--batch'], { cwd: REPO, input: oids.join('\n') + '\n', maxBuffer: 1 << 30 })
  const buf = all.stdout
  let max = 0, at = 0
  while (at < buf.length) {
    const eol = buf.indexOf(10, at), head = buf.subarray(at, eol).toString('utf8').split(' ')
    const size = +head[2]; if (!(size >= 0)) break
    for (const { n, title } of observationHeads(buf.subarray(eol + 1, eol + 1 + size).toString('utf8'))) { max = Math.max(max, +n); titles.set(n, (titles.get(n) || new Set()).add(title)) }
    at = eol + 1 + size + 1
  }
  return { max, titles }
}
function renumber(B, O, T, ctx) {
  const bk = new Set(B.map(r => r.key)), mt = new Map(T.map(r => [r.key, r.text]))
  const clash = O.filter(r => r.key.startsWith('obs:') && !bk.has(r.key) && mt.has(r.key) && mt.get(r.key) !== r.text)
  if (!clash.length) return { O, map: new Map() }
  /* a number an earlier run of this step already gave the note — in the working copy, under the note's own title, and
     no number either side holds, nor any branch under another title — is kept, so a run after a fetch that brought a
     higher number writes the same file and is seen as that earlier run, not as a hand edit (Opus 5 of the code read) */
  const used = new Set([...O, ...T, ...B].filter(r => r.key.startsWith('obs:')).map(r => r.key.slice(4)))
  const onDisk = observationHeads(ctx.disk || ''), elsewhere = branchNumbers(ctx.refs).titles
  const map = new Map()
  for (const r of clash) {
    const title = (OBS_HEAD.exec(r.text.split('\n')[0].replace(/\r$/, '')) || [, , ''])[2].trim()
    const kept = onDisk.filter(h => h.title === title && !used.has(h.n) && ![...map.values()].includes(h.n) && [...(elsewhere.get(h.n) || [])].every(x => x === title))
    if (kept.length === 1) map.set(r.key.slice(4), kept[0].n)
  }
  let next = Math.max(highestNumber(ctx.refs), ...[...used].map(Number), ...[...map.values()].map(Number)) + 1
  for (const r of clash) if (!map.has(r.key.slice(4))) map.set(r.key.slice(4), String(next++))
  const baseLines = new Set(linesOf(B.map(r => r.text).join('')))
  const titleOf = text => (OBS_HEAD.exec(text.split('\n')[0].replace(/\r$/, '')) || [, , ''])[2].trim()
  const ourTitle = new Map(clash.map(r => [r.key.slice(4), titleOf(r.text)]))
  const cite = new RegExp(`\\bObservation (${[...map.keys()].join('|')})(?!\\d)`, 'g')
  /* ROUND 3 (the host's guardrail after the narrow re-read — Astra re-read 1, Opus re-read 4): a citation is NEVER
     rewritten. Whether "Observation 11" in this branch's line means its own note or main's cannot be known from where
     the line sits or what it names ("See Observation 11 on main" inside the note itself was rewritten to the note's new
     number), so only the heading is renumbered, and every line of this branch's that cites a renumbered number is
     listed, with its place in the merged file, for the chat to look at (settle() finds the place). */
  const cited = []
  const O2 = O.map(r => {
    const own = r.key.startsWith('obs:') && map.has(r.key.slice(4)) ? r.key.slice(4) : null
    const ls = linesOf(r.text), fenced = closedFencedFlags(ls)
    const text = ls.map((l, i) => {
      if (own && i === 0) return l.replace(/^### Observation \d+:/, `### Observation ${map.get(own)}:`)
      if (baseLines.has(l) || fenced[i]) return l
      for (const n of new Set([...l.matchAll(cite)].map(m => m[1]))) cited.push({ line: l.replace(/\r?\n$/, ''), n, to: map.get(n) })
      return l
    }).join('')
    return { key: own ? `obs:${map.get(own)}` : r.key, text }
  })
  ctx.cited = cited
  for (const r of clash) ctx.renumbers.push({ from: r.key.slice(4), to: map.get(r.key.slice(4)), title: ourTitle.get(r.key.slice(4)) })
  return { O: O2, map }
}

/* ---------- the insertion-only files: git's own clash regions, read three ways ---------- */
const MK = 23 // a marker longer than any line these files hold, so the regions can be read back without doubt
function settleInsertions(o, b, t, labels) {
  const m = mergeFile(o, b, t, ['RM-OURS', 'RM-BASE', 'RM-THEIRS'], ['--diff3', `--marker-size=${MK}`])
  const L = linesOf(m.text), out = [], left = [], settled = []
  const is = (l, ch, lab) => l.replace(/\r?\n$/, '') === ch.repeat(MK) + (lab ? ' ' + lab : '')
  /* a side whose text did not end at a line end: git ends every line of a region, so its last line cannot be told
     apart there — a region at the very end of the file is then left */
  const ragged = (o && !o.endsWith('\n')) || (t && !t.endsWith('\n'))
  for (let i = 0; i < L.length; i++) {
    if (!is(L[i], '<', 'RM-OURS')) { out.push(L[i]); continue }
    const part = { o: [], b: [], t: [] }; let at = 'o'; i++
    for (; i < L.length && !is(L[i], '>', 'RM-THEIRS'); i++) {
      if (at === 'o' && is(L[i], '|', 'RM-BASE')) { at = 'b'; continue }
      if (at === 'b' && is(L[i], '=')) { at = 't'; continue }
      part[at].push(L[i])
    }
    const atEnd = i >= L.length - 1
    if (part.b.length === 0) {
      const why = whyNotJoin(part.o, part.t, ragged && atEnd)
      if (!why) { out.push(...joinInsertions(part.o, part.t)); settled.push(`text both sides inserted at one place (${part.o.length} line(s) of this branch's, then ${part.t.length} of main's)`); continue }
      left.push(`a place where both sides inserted text — ${why}; which goes where is yours to judge; near: ${([...part.o, ...part.t].find(l => l.trim()) || '').trim().slice(0, 80)}`)
      out.push(renderConflict(part.o.join(''), '', part.t.join(''), labels)); continue
    }
    left.push(`a place where ${part.o.length && part.t.length ? 'both sides changed the same lines' : 'one side changed lines the other removed'}, near: ${(part.b.find(l => l.trim()) || '').trim().slice(0, 80)}`)
    out.push(renderConflict(part.o.join(''), part.b.join(''), part.t.join(''), labels))
  }
  return { text: out.join(''), left, settled }
}
/* ROUND 3 (the host's decision after the narrow re-read, 8 Nov 26): the shared-start, shared-end and heading-seam joining
   of the earlier rounds fused two versions of one archived item, moved a last line from one entry to another and doubled
   a table head (Opus re-read 1, 2, 7) — a cascade, so it is gone. A region both sides only inserted into is settled ONLY
   when it cannot be wrong: the two texts share no line that is not blank, neither holds a line starting with `#` nor a
   table's separator line, each is whole table rows or holds no table row at all, and neither ended without a line end.
   Anything else is left exactly as git marked it — fewer settled, never silently wrong. */
const blank = l => !l.trim(), tableRow = l => /^\|/.test(l), tableRule = l => /^\|[\s:|-]*-[\s:|-]*$/.test(l.trim())
function whyNotJoin(o, t, ragged) {
  if (ragged) return 'a side\'s text does not end at a line end'
  const words = new Set(o.filter(l => !blank(l)).map(l => l.trim()))
  if (t.some(l => !blank(l) && words.has(l.trim()))) return 'both hold a same line, so they may be two versions of one entry'
  if ([...o, ...t].some(l => /^#/.test(l))) return 'a heading is among them'
  if ([...o, ...t].some(tableRule)) return 'a table\'s head is among them'
  for (const s of [o, t]) { const filled = s.filter(l => !blank(l)); if (filled.some(tableRow) && !filled.every(tableRow)) return 'table rows and other text are mixed' }
  return null
}
/* this branch's text, then main's; one blank line between them only where either side is paragraph-shaped (not table
   rows) and no blank line already parts them */
function joinInsertions(o, t) {
  if (!o.length || !t.length) return [...o, ...t]
  const rows = s => s.filter(l => !blank(l)).every(tableRow)
  const apart = !(rows(o) && rows(t)) && !blank(o[o.length - 1]) && !blank(t[0])
  return [...o, ...(apart ? ['\n'] : []), ...t]
}

/* ---------- one file ---------- */
function settle(f, st, labels, ctx) {
  const o = st[2], t = st[3], b = st[1] ?? ''
  if (f === HANDOFF) {
    const [B, O, T] = [b, o, t].map(x => cut(x, handoffKey, true))
    return mergeRecords(B, O, T, { labels, first: 'ours', alwaysLeave: k => k === 'sec:## Gate baseline' })
  }
  if (f === SKILL_LOG) {
    /* ROUND 4 (Astra r3-3): a code block that never closes is read as text in each input, but joined, a stray on each
       side closes the other's across real notes and hides them — so any such block, in the base or either side, leaves
       the whole log (the document check names it) */
    for (const [side, x] of [['the base', b], ['this branch', o], ["main's side", t]]) {
      const at = unclosedFences(x.split('\n'))
      if (at.length) throw new Leave(`${side} holds a code block that never closes (its line ${at[0] + 1}) — joined with the other side, it could hide real notes; close it, then settle the log by hand`)
    }
    const [B, O0, T] = [b, o, t].map(x => cut(x, notesKey, true))
    /* ROUND 3, then ROUND 4 (Astra re-read 2; Astra r3-2, Opus r3-1): a note can move under the wrong day whenever a side
       changes the day headings — adds one, removes one (a skill review archiving a whole day), rewords or moves one; the
       count of headings missed a move and a removal. So each side's days, in order, each with the BASE notes under it
       that the side still holds, must be exactly the base's; any difference leaves the whole log */
    const baseObs = new Set(B.filter(r => r.key.startsWith('obs:')).map(r => r.key))
    const layout = (recs, keep) => { const out = [['(the head)', []]]; for (const r of recs) { if (r.key.startsWith('sec:')) out.push([r.key, []]); else if (baseObs.has(r.key) && keep.has(r.key)) out[out.length - 1][1].push(r.key) } return JSON.stringify(out) }
    for (const [side, S] of [['this branch', O0], ["main's side", T]]) {
      const held = new Set(S.map(r => r.key))
      if (layout(S, held) !== layout(B, held)) throw new Leave(`${side} changed the day headings (added, removed, reworded or moved one, or moved a note across one) — which note goes under which day is yours to judge`)
    }
    const { O } = renumber(B, O0, T, ctx)
    const res = mergeRecords(B, O, T, { labels, first: 'theirs', leaveNewHeadings: true })
    /* each citation renumber() found, at its line in the merged file (a line written twice is given its places in turn) */
    const lines = res.text.split('\n').map(l => l.replace(/\r$/, '')), taken = new Set()
    for (const c of ctx.cited || []) {
      const i = lines.findIndex((l, j) => l === c.line && !taken.has(`${j}:${c.n}`)); if (i >= 0) taken.add(`${i}:${c.n}`)
      ctx.unsure.push(`${SKILL_LOG}:${i + 1} cites Observation ${c.n} (renumbered here to ${c.to})`)
    }
    return res
  }
  return settleInsertions(o, b, t, labels)
}

/* ---------- run ---------- */
const sh = (...a) => (tryGit(...a) || '').trim()
const mergeHead = sh('rev-parse', '-q', '--verify', 'MERGE_HEAD'), head = sh('rev-parse', 'HEAD')
if (!mergeHead) die('this runs during a `git merge` that has not been committed (there is no MERGE_HEAD). Start it with: git merge --no-commit --no-ff origin/main')
const mergeBase = sh('merge-base', head, mergeHead)

/* the unmerged paths and their stages — never the files on disk */
const stages = new Map()
for (const e of (tryGit('ls-files', '-u', '-z') || '').split('\0').filter(Boolean)) {
  const m = /^\d+ ([0-9a-f]+) ([123])\t(.*)$/s.exec(e); if (!m) continue
  if (!stages.has(m[3])) stages.set(m[3], {})
  stages.get(m[3])[m[2]] = m[1]
}
const RECORD = f => f === HANDOFF || f === SKILL_LOG || INSERT_ONLY.includes(f)
const stale = [...stages.keys()].filter(f => existsSync(join(REPO, f + TMP)))
if (stale.length) die(`a temporary copy from an interrupted run is still here (${stale.map(f => f + TMP).join(', ')}) — compare it with its file, keep what you need, delete it, then run this again.`)

/* every branch: the remote ones, and the local ones too — the other chats on this PC work in worktrees of this same
   repository, so their notes not yet pushed sit on local branches (Opus 6 of the code read) */
const remotes = (tryGit('for-each-ref', '--format=%(refname)', 'refs/heads', 'refs/remotes') || '').split('\n').filter(r => r && !r.endsWith('/HEAD'))
const ctx = { refs: [head, mergeHead, ...remotes], renumbers: [], unsure: [] }
const written = [], already = [], leftBy = new Map(), settledBy = new Map(), rulingsLeft = [], others = []
const plan = []
for (const [f, ids] of stages) {
  if (!RECORD(f)) { (isRulings(f) ? rulingsLeft : others).push(f); continue }
  if (!ids[2] || !ids[3]) { leftBy.set(f, [`removed on ${ids[2] ? "main's side" : 'this branch'} as a whole file — yours to settle`]); continue }
  try {
    const st = { 1: ids[1] ? blob(ids[1]) : null, 2: blob(ids[2]), 3: blob(ids[3]) }
    const disk = existsSync(join(REPO, f)) ? readFileSync(join(REPO, f), 'utf8') : null
    const labels = labelsOf(disk || '')
    /* this file's own renumbers and citations, reported only once the file is written or found settled by an earlier
       run — a refused or left file reports none (the tidiness notes 2 of the code read) */
    let fctx, res, match = null
    for (const s of STYLES) {
      useStyle(s)
      fctx = { refs: ctx.refs, renumbers: [], unsure: [], disk }
      res = settle(f, st, labels, fctx)
      if (disk === res.text) { match = 'already'; break }
      if (disk !== null && sameConflict(disk, mergeFile(st[2], st[1] ?? '', st[3], labels, STYLE_ARGS).text)) { match = 'gits'; break }
    }
    useStyle(CONFIG_STYLE)
    const report = () => { ctx.renumbers.push(...fctx.renumbers); ctx.unsure.push(...fctx.unsure); if (res.settled.length) settledBy.set(f, res.settled) }
    if (match && res.left.length) leftBy.set(f, res.left)
    if (match === 'already') { if (res.settled.length) { already.push(f); report() } continue }
    if (!match) { leftBy.set(f, [`its working copy is not what git wrote when the merge stopped, in any of git's three conflict styles (merge.conflictStyle here: ${CONFIG_STYLE}) — edited since; left to you, untouched`]); continue }
    if (!res.settled.length) continue // nothing a rule could settle: git's own marks stay exactly as git wrote them
    plan.push({ f, text: res.text, before: disk }); report()
  } catch (e) {
    if (!(e instanceof Leave)) throw e
    leftBy.set(f, [`left whole — ${e.message}`])
  }
}

/* write: each file through a temporary copy and a rename; a failure part-way puts back every file already written */
if (!DRY) {
  try {
    for (const p of plan) { writeFileSync(join(REPO, p.f + TMP), p.text); renameSync(join(REPO, p.f + TMP), join(REPO, p.f)); written.push(p) }
  } catch (e) {
    for (const p of written) writeFileSync(join(REPO, p.f), p.before)
    for (const p of plan) rmSync(join(REPO, p.f + TMP), { force: true })
    die(`writing failed (${e.message}); every file it had written is back as git left it.`)
  }
}

/* ---------- the report ---------- */
const say = s => console.log(s)
say(`records-merge${DRY ? ' (dry run — nothing written)' : ''}: ${stages.size} unmerged path(s)`)
for (const p of plan) say(`  ${DRY ? 'would settle' : 'settled'}: ${p.f}${leftBy.has(p.f) ? ' (in part)' : ''}`)
for (const f of already) say(`  already settled by an earlier run, unchanged: ${f}`)
for (const [f, s] of settledBy) for (const x of s) say(`    ${f} — ${x}`)
for (const r of ctx.renumbers) say(`  renumbered in ${SKILL_LOG}: Observation ${r.from} → ${r.to} "${r.title}" (main has its own ${r.from})`)
for (const u of ctx.unsure) say(`    look by hand: ${u}`)
if (ctx.renumbers.length && mergeBase) {
  /* the citations outside the log are this branch's to look at: its new lines that still name the old number, each at
     its line in the working copy (or, where the merge moved it out of sight, in this branch's own copy) */
  const diff = tryGit('diff', '-U0', '--no-color', mergeBase, head, '--', '.', `:(exclude)${SKILL_LOG}`) || ''
  let file = null, at = 0, lines = [], taken = new Set()
  for (const l of diff.split('\n')) {
    if (l.startsWith('+++ b/')) { file = l.slice(6); taken = new Set(); try { lines = readFileSync(join(REPO, file), 'utf8').split('\n').map(x => x.replace(/\r$/, '')) } catch { lines = [] } continue }
    const h = /^@@ -\d+(?:,\d+)? \+(\d+)/.exec(l); if (h) { at = +h[1]; continue }
    if (!l.startsWith('+') || l.startsWith('+++')) continue
    const text = l.slice(1).replace(/\r$/, '')
    for (const r of ctx.renumbers) if (new RegExp(`\\bObservation ${r.from}(?!\\d)`).test(text)) {
      const i = lines.findIndex((x, j) => x === text && !taken.has(`${j}:${r.from}`)); if (i >= 0) taken.add(`${i}:${r.from}`)
      say(`    look by hand: ${file}:${i >= 0 ? i + 1 : `${at} (this branch's copy)`} cites Observation ${r.from} (renumbered here to ${r.to})`)
    }
    at++
  }
}
const leftCount = [...leftBy.values()].reduce((a, b) => a + b.length, 0)
for (const [f, s] of leftBy) { say(`  LEFT for you in ${f}:`); for (const x of s) say(`    - ${x}`) }
for (const f of others) say(`  not a record file — yours to settle: ${f}`)
if (rulingsLeft.length) {
  say(`  rulings files, not touched here: ${rulingsLeft.join(', ')}`)
  const staged = [...plan.map(p => p.f), ...already].filter(f => !leftBy.has(f))
  say(`\nNext: settle what is left above, stage every settled file${staged.length ? ` (git add ${staged.join(' ')})` : ''}, then run:\n  ${RULINGS_CMD}`)
}

const pending = leftCount + others.length + rulingsLeft.length
if (pending) { say(`\n${pending} thing(s) left for you — the checks are not run until they are settled (run npm run docsize and npm run rulecheck after your part).`); process.exit(2) }
if (DRY || NO_CHECKS) { say(`\n${DRY ? 'dry run' : '--no-checks'} — the checks are not run.`); process.exit(0) }

/* ---------- the checks, and only a NEW failure counts ---------- */
const CHECKS = ['docsize', 'rulecheck']
const runCheck = (dir, name) => { const r = spawnSync('npm', ['run', '--silent', name], { cwd: join(dir, 'raptor-port'), encoding: 'utf8', shell: true, maxBuffer: 256 << 20 }); return { ok: r.status === 0, err: (r.stderr || '').split('\n').map(l => l.trim()).filter(Boolean) } }
const ours = new Map(CHECKS.map(c => [c, runCheck(REPO, c)]))
const red = CHECKS.filter(c => !ours.get(c).ok)
if (!red.length) { say(`\nnpm run docsize and npm run rulecheck: green. Stage the settled files and commit the merge.`); process.exit(0) }
const wt = join(scratch, 'theirs')
let fresh = []
try {
  execFileSync('git', ['worktree', 'add', '--detach', '-f', wt, mergeHead], { cwd: REPO, stdio: 'ignore' })
  for (const c of red) {
    const th = runCheck(wt, c), mine = ours.get(c).err
    const seen = new Set(th.err)
    const newLines = th.ok ? mine : mine.filter(l => !seen.has(l))
    if (newLines.length || th.ok) fresh.push({ c, lines: newLines.length ? newLines : ['(it fails here and passes on the commit being merged in)'] })
    else say(`\nnpm run ${c} is red, and red the same way on the commit being merged in — not counted (fix it on its own).`)
  }
} finally { spawnSync('git', ['worktree', 'remove', '--force', wt], { cwd: REPO }); spawnSync('git', ['worktree', 'prune'], { cwd: REPO }) }
if (!fresh.length) { say('\nNo new failure. Stage the settled files and commit the merge.'); process.exit(0) }
for (const { c, lines } of fresh) { console.error(`\nnpm run ${c} — a NEW failure:`); for (const l of lines) console.error(`  ${l}`) }
const back = [...plan.map(p => p.f), ...already]
for (const f of back) spawnSync('git', ['checkout', '-m', '--', f], { cwd: REPO })
console.error(back.length ? `\nEvery file this step settled is back to git's conflicted state: ${back.join(', ')} — settle them by hand.` : '\nThis step settled nothing; the failure came with the merge.')
process.exit(1)
