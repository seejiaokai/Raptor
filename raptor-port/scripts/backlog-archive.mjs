#!/usr/bin/env node
/* THE ONE WAY A FINISHED ITEM LEAVES THE BACKLOG — [DOCS-GUARD] step 4, F5 (Fable, 22 Sep 26;
 * owner D30 and D83).
 *
 *   node raptor-port/scripts/backlog-archive.mjs <ITEM-ID> --homes <file>[,<file>...] [--dry-run]
 *
 * On 22 Sep 26 an unbounded span-replace, written on the spot to move finished items, destroyed two
 * filed items — one a ruling's only home. The archive says "never append by hand", which for a live
 * destination means "use a script", and none was committed. This is that script, and it refuses to
 * do anything it cannot do exactly:
 *   - the id must head exactly ONE item in OUTSTANDING.md and none in the archive (a mover keyed by
 *     a duplicate id moves whichever it finds first — Fable found that live for two ids);
 *   - the item runs from its heading to the next heading at EITHER level (`## Done` sits between
 *     items, and "up to the next `### [`" would swallow it), ignoring `#` lines inside code blocks;
 *   - --homes is REQUIRED: the files where the item's still-useful facts now live. Each must exist
 *     and either mention the id or be changed on this branch — "write the pointer, THEN move"
 *     (OUTSTANDING.md §Maintaining, F4). A move with nowhere named is how a fact loses its only home;
 *   - the bytes move unchanged: line endings are never normalised, nothing is reflowed;
 *   - afterwards it runs the document gate's inventory, and if that is not clean it puts BOTH files
 *     back exactly as they were;
 *   - it prints every remaining mention of the id, because pointers to a moved item need a hand
 *     look — a script cannot know which of them should now say "archived". */
import { readFileSync, writeFileSync, existsSync, realpathSync, renameSync, rmSync, mkdirSync } from 'node:fs'
import { join, dirname, relative, isAbsolute } from 'node:path'
import { fileURLToPath } from 'node:url'
import { execFileSync, spawnSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import * as RL from './docsize-rulings.mjs'

const REPO = join(dirname(fileURLToPath(import.meta.url)), '..', '..')
const LIVE = 'OUTSTANDING.md', ARCHIVE = 'OUTSTANDING-ARCHIVE.md'
const GATE = join(REPO, 'raptor-port', 'scripts', 'docsize.mjs')

const die = msg => { console.error(`backlog-archive: ${msg}`); process.exit(1) }
const git = (...a) => { try { return execFileSync('git', a, { cwd: REPO, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }) } catch { return '' } }

const args = process.argv.slice(2)

/* --rulings — THE ONE WAY A RULING IS FILED, MOVED OR RETIRED (owner, D136 + D137, 24 Sep 26; D390, 28 Sep 26), and the
   way the map in DECISIONS.md is kept true. Since D390 every ruling is ONE full row, kept whole in
   `.claude/decisions-full/<area>.md` (searched, never loaded), and ONE short line in its area file under
   `.claude/rules/decisions/` (what a chat loads) — their shape: docsize-rulings.mjs. A run:
     1. converts every full row found in an area file (a new ruling, written there by DECISIONS.md step 1): the row moves,
        byte for byte, to the top of its full-text table, and its short line — the meaning cell's first bold sentence, or a
        line given with --short-text — goes to the top of the short table. A heading that cannot serve is REFUSED, naming
        the row and the edit (Fable's red team: a refusal that says nothing loops the Stop hook blind);
     2. retires every row whose ruling cell opens with a REPLACED / SPENT mark (step 2): the full row to the foot of
        DECISIONS-ARCHIVE.md under the day it moved, its short line deleted;
     3. refreshes each short line's change tail from its full row's marks (never its text);
     4. rewrites the map's last column from what each area file holds.
   Everything is built in memory, then written, then the gate's inventory runs, and EVERY file is put back if it is not
   clean. Options:
     --short-text <file>   lines "D<n><TAB><text>": the short line for a row whose heading cannot serve
     --move-rows D1,D2 --to <area>   the one way a ruling changes area: short line and full row move, bytes unchanged,
                                     each landing in date order (newest first)
     --merge               during a conflicted `git merge` (plan §2.4): starts from the side that has the full-text folder,
                           replays the OTHER side's ruling changes since the merge base, three-way per D-number, stops on
                           a row both sides changed, and prints — never writes — the other side's non-row lines
     --dry-run             say what would happen, write nothing */
if (args.includes('--rulings')) {
  const { DECISIONS: DEC, RULINGS_DIR: DIR, FULL_DIR, RULINGS_ARCHIVE: ARCHR } = RL
  const MARKED = RL.MARKED
  const dryRun = args.includes('--dry-run'), merging = args.includes('--merge')
  const opt = k => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : undefined }
  const listed = dir => [...new Set([...git('ls-files', '--', dir).split('\n'), ...git('ls-files', '--others', '--exclude-standard', '--', dir).split('\n')])].filter(f => f.endsWith('.md') && existsSync(join(REPO, f)))
  const disk = f => (existsSync(join(REPO, f)) ? readFileSync(join(REPO, f), 'utf8') : null)
  const cut = s => (s.length > 140 ? s.slice(0, 137) + '...' : s)

  /* the working set: path -> { eol, ls (lines without their ending), trail (ended in a newline) }. A file that mixes
     CRLF and LF is refused: split on one ending, the other half's rows would be invisible here while the gate still
     sees them (Fable's code read). */
  const files = new Map()
  const setText = (f, t) => {
    if (t == null) return
    if (t.includes('\r\n') && /(^|[^\r])\n/.test(t)) die(`${f} mixes CRLF and LF line endings — fix the endings first (git's LF pin covers the rulings files once [RULINGS-LF-PIN] lands), then run this again.`)
    const eol = t.includes('\r\n') ? '\r\n' : '\n'; const ls = t.split(eol); const trail = ls.length > 1 && ls[ls.length - 1] === ''; if (trail) ls.pop(); files.set(f, { eol, ls, trail })
  }
  const textOf = f => { const x = files.get(f); return x ? x.ls.join(x.eol) + (x.trail ? x.eol : '') : null }
  const before = new Map()
  const toArchive = [], moved = [], converted = []
  const rewriteList = [], unread = [], reapply = [], classify = []
  const given = new Map(), carried = new Set()

  /* ---- --merge: the starting texts come from git, never from the conflicted files on disk (plan §2.4) ---- */
  let mergeIds = null
  const merge = { addNew: [], replaceFull: [], shortTake: [], retire: [], moveArea: [] }
  if (merging) {
    const sh = (...a) => git(...a).trim()
    const mh = sh('rev-parse', '-q', '--verify', 'MERGE_HEAD'), head = sh('rev-parse', 'HEAD')
    if (!mh) die('--merge runs during a `git merge` that stopped before committing (there is no MERGE_HEAD). Start it with: git merge --no-commit --no-ff origin/main')
    const base = sh('merge-base', head, mh)
    const rulingPath = f => f === DEC || f === ARCHR || f.startsWith(DIR + '/') || f.startsWith(FULL_DIR + '/')
    const other = git('diff', '--name-only', '--diff-filter=U').split('\n').filter(f => f && !rulingPath(f))
    if (other.length) die(`resolve the other conflicted files first (the gate reads them too), then run this again: ${other.join(', ')}`)
    if (!base) die('no merge base between HEAD and MERGE_HEAD.')
    const tree = (ref, dir) => git('ls-tree', '-r', '--name-only', ref, '--', dir).split('\n').filter(f => f.endsWith('.md'))
    const show = (ref, f) => { try { return execFileSync('git', ['show', `${ref}:${f}`], { cwd: REPO, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }) } catch { return null } }
    const newRef = tree(head, FULL_DIR).length ? head : tree(mh, FULL_DIR).length ? mh : null
    if (!newRef) die(`neither side of this merge has ${FULL_DIR}/ — it is not a merge across the slim-down; resolve the rulings files by hand as before.`)
    const otherRef = newRef === head ? mh : head
    const otherName = otherRef === head ? 'your branch' : 'the branch being merged in'
    const paths = ref => [DEC, ARCHR, ...tree(ref, DIR), ...tree(ref, FULL_DIR)]
    for (const f of paths(newRef)) setText(f, show(newRef, f))
    /* a rulings file only the other side has (a new area it created) starts from its own text — whole, so its rows and
       its prose are already here, never inserted or reported a second time (Astra and Fable's code reads) */
    const takenWhole = new Set()
    for (const f of paths(otherRef)) if (!files.has(f) && show(base, f) == null) { setText(f, show(otherRef, f)); takenWhole.add(f) }
    const state = ref => {
      const full = new Map(), short = new Map(), arch = new Map(), prose = new Map()
      for (const f of paths(ref)) {
        const t = show(ref, f); if (t == null) continue
        const ls = t.split('\n').map(l => l.replace(/\r$/, '')), inF = RL.fencedFlags(ls), mine = []
        ls.forEach((l, i) => {
          if (!inF[i] && RL.isRow(l)) {
            const d = RL.idOf(l)
            if (f === ARCHR) arch.set(d, l)
            else if (RL.kindOf(l) === 'short') short.set(d, { f, l })
            else if (f !== DEC) full.set(d, { f, l })
          } else if (l.trim() && !/^\|\s*#\s*\|/.test(l) && !/^\|[-|: ]+\|\s*$/.test(l) && !/^## Moved /.test(l) && !(f === DEC && /^\| [^|]+ \| `[^`]+` \|/.test(l))) mine.push(l)
        })
        prose.set(f, { f, mine })
      }
      return { full, short, arch, prose }
    }
    const B = state(base), O = state(otherRef), N = state(newRef)
    /* each ruling's whole state on a side: retired / live / absent, its full row, its area. Three-way per D-number: the
       other side's change is taken only where ours did not change it (or made the same change); a change on BOTH sides
       to different states stops the command (Astra's code read: an archive, a move, a clash were chosen silently). */
    const areaOf = (S, d) => RL.stem((S.short.get(d) || S.full.get(d) || {}).f || '')
    const tuple = (S, d) => ({ where: S.arch.has(d) ? 'retired' : S.full.has(d) ? 'live' : 'absent', line: S.arch.get(d) ?? S.full.get(d)?.l ?? null, area: S.arch.has(d) || !S.full.has(d) ? '' : areaOf(S, d) })
    const same = (x, y) => x.where === y.where && x.line === y.line && x.area === y.area
    const desc = x => x.where === 'absent' ? 'absent' : `${x.where}${x.area ? ` in ${x.area}` : ''}: ${cut(x.line)}`
    const conflicts = []
    mergeIds = new Set([...B.full.keys(), ...B.arch.keys(), ...O.full.keys(), ...O.arch.keys(), ...N.full.keys(), ...N.arch.keys()])
    for (const d of mergeIds) {
      const b = tuple(B, d), o = tuple(O, d), n = tuple(N, d)
      if (same(o, b) || same(n, o)) continue                     // the other side did not touch it, or both did the same
      const clash = why => conflicts.push(`${d} ${why} — resolve it by hand:\n      base:  ${desc(b)}\n      here:  ${desc(n)}\n      there: ${desc(o)}`)
      if (b.where === 'absent') {                                // new on the other side
        if (n.where !== 'absent') { clash('was filed on both sides with different text — a number clash: the later branch renumbers its own row (D78)'); continue }
        const f = `${DIR}/${o.area}`
        if (o.where === 'live' && !(takenWhole.has(f) && (files.get(f)?.ls || []).some(l => RL.idOf(l) === d))) merge.addNew.push({ d, line: o.line, area: o.area })
        if (o.where === 'retired') merge.retire.push({ d, line: o.line })
        if (O.short.has(d)) { given.set(d, RL.parseShort(O.short.get(d).l).text); carried.add(d) }
        if (o.area === 'how-we-work.md') classify.push(d)
        continue
      }
      if (o.where === 'absent') { conflicts.push(`${d} is gone on ${otherName} and not in its archive — restore it there first`); continue }
      if (b.where === 'retired') { clash('was retired at the base and changed since'); continue }
      if (n.where === 'absent') { clash('is gone here and not in the archive'); continue }
      if (o.where === 'retired') {                               // retired on the other side (D182's shape)
        if (n.where === 'live' && n.line === b.line) merge.retire.push({ d, line: o.line })
        else clash(n.where === 'retired' ? 'was retired on both sides with different rows' : 'was retired there but its row changed here')
        continue
      }
      if (n.where === 'retired') { if (o.line !== b.line) clash('was retired here but its row changed there'); continue }
      /* live on all three sides: its text and its area are each taken from the side that changed them (this branch
         moving a row to People & accounts and a parallel branch marking it are two different changes, not a clash) */
      if (o.line !== b.line) { if (n.line === b.line) merge.replaceFull.push({ d, line: o.line, was: n.line }); else if (n.line !== o.line) { clash('had its row changed on both sides'); continue } }
      if (o.area !== b.area) { if (n.area === b.area) merge.moveArea.push({ d, to: o.area }); else if (n.area !== o.area) clash('was moved to different areas on the two sides') }
    }
    /* a short line changed on the other side (both sides in the new layout): three-way too */
    for (const [d, os] of O.short) {
      const b = B.short.get(d)?.l, n = N.short.get(d)?.l
      if (b === undefined || os.l === b || n === os.l) continue
      if (n === b) merge.shortTake.push({ d, line: os.l }); else conflicts.push(`${d}'s short line was changed on both sides — resolve it by hand`)
    }
    if (conflicts.length) die(`--merge stopped, nothing written:\n  - ${conflicts.join('\n  - ')}`)
    /* an area file the other side created carries its map row with it */
    const decO = (show(otherRef, DEC) || '').split('\n').map(l => l.replace(/\r$/, ''))
    for (const f of takenWhole) {
      const row = decO.find(l => l.includes('`' + f + '`')), dec = files.get(DEC)
      if (!row || !dec || dec.ls.some(l => l.includes('`' + f + '`'))) continue
      const at = dec.ls.findIndex(l => l.includes('`' + ARCHR + '`'))
      dec.ls.splice(at < 0 ? dec.ls.length : at, 0, row)
    }
    /* the other side's non-row lines: printed WHOLE, never written (a raw "keep both" left two table headers and stale
       prose behind — both red teams) */
    for (const [f, o] of O.prose) {
      if (takenWhole.has(f)) continue
      const count = ls => ls.reduce((m, l) => m.set(l, (m.get(l) || 0) + 1), new Map())
      const cb = count(B.prose.get(f)?.mine || []), co = count(o.mine)
      const added = [...co].filter(([l, k]) => k > (cb.get(l) || 0)).map(([l]) => l), removed = [...cb].filter(([l, k]) => k > (co.get(l) || 0)).map(([l]) => l)
      if (added.length || removed.length) reapply.push(`${f} (its whole text on that side: git show ${otherRef.slice(0, 12)}:${f}):${removed.map(l => `\n      − ${l}`).join('')}${added.map(l => `\n      + ${l}`).join('')}`)
    }
  }

  /* ---- the working set on an ordinary run: every rulings file on disk ---- */
  if (!files.size) for (const f of [DEC, ARCHR, ...listed(DIR), ...listed(FULL_DIR)]) setText(f, disk(f))
  for (const [f] of files) before.set(f, disk(f))
  /* rows move between these files byte for byte only if they share one line ending (Astra's code read) */
  const eols = new Set([...files.values()].filter(x => x.ls.length > 1).map(x => x.eol))
  if (eols.size > 1) die(`the rulings files do not share one line ending (${[...files].filter(([, x]) => x.ls.length > 1).map(([f, x]) => `${f}: ${x.eol === '\r\n' ? 'CRLF' : 'LF'}`).join(', ')}) — make them all LF first, so a row moves byte for byte.`)
  const EOL = [...eols][0] || '\n'

  function tableOf(f) {
    const x = files.get(f); if (!x) return null
    const inF = RL.fencedFlags(x.ls)
    for (let i = 0; i + 1 < x.ls.length; i++) if (!inF[i] && /^\|\s*#\s*\|\s*Date\s*\|/.test(x.ls[i]) && /^\|[-|: ]+\|\s*$/.test(x.ls[i + 1])) return { x, head: i, sep: i + 1 }
    return null
  }
  function rowsIn(f) { const x = files.get(f); if (!x) return []; const inF = RL.fencedFlags(x.ls); return x.ls.flatMap((l, i) => (!inF[i] && RL.isRow(l) ? [{ f, i, d: RL.idOf(l), kind: RL.kindOf(l), line: l }] : [])) }
  function allFiles() { return [...files.keys()].filter(f => f.startsWith(DIR + '/') || f.startsWith(FULL_DIR + '/')) }
  function findRow(d, kind) { for (const f of allFiles()) for (const r of rowsIn(f)) if (r.d === d && (kind === 'short' ? r.kind === 'short' : r.kind !== 'short') && (kind !== 'full' || f.startsWith(FULL_DIR + '/'))) return r; return null }
  function replaceRow(d, kind, line) { const r = findRow(d, kind); if (!r) die(`internal: no ${kind} row for ${d}`); files.get(r.f).ls[r.i] = line }
  function dropRow(d, kind) { const r = findRow(d, kind); if (r) files.get(r.f).ls.splice(r.i, 1) }
  function ensureFull(area) {
    const f = `${FULL_DIR}/${area}`
    if (files.has(f)) return f
    const title = ((files.get(`${DIR}/${area}`)?.ls || []).find(l => /^# /.test(l)) || `# Rulings — ${area.replace(/\.md$/, '')}`).replace(/\s*\(.*\)\s*$/, '').replace(/^# /, '')
    setText(f, [`# ${title}: the full rows`, '',
      `**Never loaded by itself — searched** (D390). Each row's one-line short form is in \`${DIR}/${area}\`, which is what a`,
      `chat loads. Open a ruling's full row before acting on its detail or asking him about it:`,
      `\`grep -h '^| D149 |' ${FULL_DIR}/*.md\` (the shell — the Grep tool hides a long row). A mark on an older ruling`,
      `(DECISIONS.md step 2) is written HERE, in its full row; \`backlog-archive.mjs --rulings\` then refreshes its short line's`,
      `change tail. Newest first; each row keeps the date it was recorded.`, '', RL.FULL_HEADER, RL.FULL_SEP, ''].join(EOL))
    return f
  }
  function topInsert(f, line) { const t = tableOf(f); if (!t) die(`${f} has no rulings table ("| # | Date | …" and its divider line) to put ${RL.idOf(line)} in.`); t.x.ls.splice(t.sep + 1, 0, line) }
  function dateInsert(f, line) {
    const t = tableOf(f); if (!t) die(`${f} has no rulings table to put ${RL.idOf(line)} in.`)
    const k = RL.dateKey(RL.cellsOf(line)[1]); let i = t.sep + 1
    while (i < t.x.ls.length && RL.isRow(t.x.ls[i]) && RL.dateKey(RL.cellsOf(t.x.ls[i])[1]) >= k) i++
    t.x.ls.splice(i, 0, line)
  }
  function moveRows(ds, to) {
    const area = to.endsWith('.md') ? to : to + '.md', target = `${DIR}/${area}`
    if (!files.has(target)) die(`--to ${to}: ${target} does not exist — create it first (its paths: header, its title and a short table "${RL.SHORT_HEADER}"), and add its row to the map in ${DEC}.`)
    const fullT = ensureFull(area)
    /* in their SOURCE order, top of each file first, so rows of one date keep the order they had (newest first) */
    const at = d => { const s = findRow(d, 'short'); return s ? [allFiles().indexOf(s.f), s.i] : [1e9, 0] }
    ds = [...ds].sort((a, b) => { const x = at(a), y = at(b); return x[0] - y[0] || x[1] - y[1] })
    for (const d of ds) {
      const s = findRow(d, 'short'), fl = findRow(d, 'full')
      if (!s || !fl) die(`--move-rows ${d}: it needs its short line and its full row in the full-text folder (run --rulings first); found ${s ? 'the short line' : 'no short line'} and ${fl ? 'the full row' : 'no full row'}.`)
      if (s.f === target && fl.f === fullT) continue
      dropRow(d, 'short'); dropRow(d, 'full')
      dateInsert(target, s.line); dateInsert(fullT, fl.line)
      moved.push(`${d}: ${RL.stem(s.f)} → ${area}`)
    }
  }
  const archivedLine = d => rowsIn(ARCHR).find(r => r.d === d)?.line ?? null

  /* --merge, applied: the other side's new rows at the top of their area's table (converted below, in their own order,
     with the other side's own short line where it had one); its one-sided edits, retirements and moves */
  for (const a of merge.addNew.slice().reverse()) {
    const f = `${DIR}/${a.area}`
    if (!files.has(f)) die(`${a.d} was filed on the other side in ${f}, which this side does not have — create the area file first, then run again.`)
    topInsert(f, a.line)
  }
  for (const r of merge.replaceFull) {
    replaceRow(r.d, 'full', r.line)
    const sh0 = findRow(r.d, 'short')
    const hb = RL.headingOf(RL.cellsOf(r.was)), ho = RL.headingOf(RL.cellsOf(r.line))
    if (sh0 && RL.parseShort(sh0.line).text === hb && ho !== hb && !RL.headingProblem(r.d, ho)) { const p = RL.parseShort(sh0.line); replaceRow(r.d, 'short', RL.shortLine(r.d, p.date, ho, p.tail)); unread.push(r.d) }
    else rewriteList.push(`${r.d} — its full row changed on the other side; read its short line against it and rewrite the line if it no longer states the rule in force`)
  }
  for (const m of merge.moveArea) moveRows([m.d], m.to.replace(/\.md$/, ''))
  for (const s of merge.shortTake) replaceRow(s.d, 'short', s.line)
  for (const r of merge.retire) { dropRow(r.d, 'full'); dropRow(r.d, 'short'); toArchive.push({ d: r.d, line: r.line, from: 'the other side' }) }

  /* --short-text: the short line for a row whose heading cannot serve */
  if (opt('--short-text') !== undefined) {
    const src = opt('--short-text'); if (!src || !existsSync(src)) die(`--short-text ${src}: no such file.`)
    for (const l of readFileSync(src, 'utf8').split(/\r?\n/)) {
      if (!l.trim()) continue
      const m = /^(D\d+)\t(.*)$/.exec(l); if (!m) die(`--short-text: "${cut(l)}" is not "D<n><TAB><text>".`)
      const why = RL.shortTextProblem(m[1], m[2]); if (why) die(`--short-text: ${why}.`)
      given.set(m[1], m[2].trim()); carried.delete(m[1])
    }
  }

  /* 1. every full row in an area file: convert it (or drop an identical copy, or refuse) */
  const refusals = [], used = new Set()
  const fullAt = d => { for (const f of allFiles()) if (f.startsWith(FULL_DIR + '/')) for (const r of rowsIn(f)) if (r.d === d && r.kind !== 'short') return r; return null }
  const reused = (d, line) => `${d} is retired in ${ARCHR} and a live row with DIFFERENT text carries the same number — a number is never reused (D78): renumber the new row (${cut(line)})`
  for (const f of allFiles().filter(f => f.startsWith(DIR + '/'))) {
    const news = []
    for (const r of rowsIn(f).reverse()) {
      if (r.kind === 'short') continue
      if (r.kind === 'bad') { refusals.push(`${f}: ${r.d}'s row has ${RL.pipes(r.line)} column dividers — a full row has 6 ("| D<n> | date | his words | meaning | home |"), a short line 4`); continue }
      const cells = RL.cellsOf(r.line)
      if (MARKED.test(cells[2])) continue                        // retired below, whole
      const gone = archivedLine(r.d)
      if (gone != null) {
        if (RL.sameRuling(r.line, gone)) { files.get(f).ls.splice(r.i, 1); converted.push(`${r.d}: already retired in ${ARCHR} — the live copy in ${RL.stem(f)} dropped`) }
        else refusals.push(reused(r.d, r.line))
        continue
      }
      const there = fullAt(r.d)
      if (there) {
        if (there.line === r.line) { files.get(f).ls.splice(r.i, 1); continue }
        refusals.push(`${r.d}'s full row is in ${f} AND, with different text, in ${there.f} — edit the full row in ${there.f} only${merging ? '' : ' (during a merge: --merge)'}`); continue
      }
      const text = given.get(r.d) ?? RL.headingOf(cells)
      const why = given.has(r.d) ? RL.shortTextProblem(r.d, text) : RL.headingProblem(r.d, text)
      if (why) { refusals.push(`${why} (${f}; ${merging ? 'during --merge the row is read from git, not from the file on disk: give its short line with --short-text' : 'or give its short line with --short-text'})`); continue }
      if (given.has(r.d)) used.add(r.d)
      news.unshift({ r, line: RL.shortLine(r.d, cells[1], text, RL.marksOf(cells)) })
      files.get(f).ls.splice(r.i, 1)
    }
    if (!news.length) continue
    const area = RL.stem(f), fullT = ensureFull(area)
    for (const n of news.slice().reverse()) { topInsert(fullT, n.r.line); topInsert(f, n.line); converted.push(`${n.r.d}: converted — full row to ${fullT}, short line to the top of ${f}${carried.has(n.r.d) ? ' (the other side\'s own short line)' : ''}`); if (!carried.has(n.r.d)) unread.push(n.r.d) }
  }
  if (refusals.length) die(`nothing written — ${refusals.length} row(s) refused:\n  - ${refusals.join('\n  - ')}`)
  const unused = [...given.keys()].filter(d => !used.has(d) && !carried.has(d))
  if (unused.length) console.log(`note: --short-text gave a line for ${unused.join(', ')}, but no row of that number was converted — check the number.`)

  if (args.includes('--move-rows')) {
    const ds = (opt('--move-rows') || '').split(',').map(s => s.trim()).filter(Boolean), to = opt('--to')
    if (!ds.length || !ds.every(d => /^D\d+$/.test(d)) || !to) die('usage: --rulings --move-rows D1,D2 --to <area>')
    moveRows(ds, to)
  }

  /* 2. marked rows, wherever they sit, retire whole to the archive; their short lines go. A marked row whose number the
     archive already holds is the same ruling (dropped) or a reused number (refused) — never archived twice. */
  for (const f of allFiles()) for (const r of rowsIn(f).reverse()) {
    if (r.kind === 'short' || !MARKED.test(RL.cellsOf(r.line)[2] || '')) continue
    const gone = archivedLine(r.d)
    if (gone != null) { if (RL.sameRuling(r.line, gone)) { files.get(f).ls.splice(r.i, 1); converted.push(`${r.d}: already retired in ${ARCHR} — its live copy dropped`) } else refusals.push(reused(r.d, r.line)); continue }
    files.get(f).ls.splice(r.i, 1); toArchive.push({ d: r.d, line: r.line, from: f })
  }
  for (const a of toArchive) dropRow(a.d, 'short')
  /* a number already retired in the archive and still live elsewhere: the same ruling goes; other text is refused */
  for (const d of new Set(rowsIn(ARCHR).map(r => r.d))) {
    const fl = findRow(d, 'full')
    if (fl && !RL.sameRuling(fl.line, archivedLine(d))) { refusals.push(reused(d, fl.line)); continue }
    if (fl || findRow(d, 'short')) { dropRow(d, 'full'); dropRow(d, 'short'); converted.push(`${d}: retired in ${ARCHR} — its live copies dropped`) }
  }
  if (refusals.length) die(`nothing written — ${refusals.length} row(s) refused:\n  - ${refusals.join('\n  - ')}`)
  /* an area table still headed the old way, all its full rows gone: give it the short table's header — after the
     retirements, so a marked row in an old-layout file does not leave the header for a second run (Fable's code read) */
  for (const f of allFiles().filter(f => f.startsWith(DIR + '/'))) {
    const t = tableOf(f); if (!t) continue
    if (RL.pipes(t.x.ls[t.head]) === 6 && !rowsIn(f).some(r => r.kind !== 'short')) { t.x.ls[t.head] = RL.SHORT_HEADER; t.x.ls[t.sep] = RL.SHORT_SEP }
  }

  /* 3. change tails refreshed from the marks; a full row that follows its short line's area */
  const tails = []
  for (const f of allFiles().filter(f => f.startsWith(DIR + '/'))) for (const r of rowsIn(f)) {
    if (r.kind !== 'short') continue
    const fl = fullAt(r.d); if (!fl) continue
    if (RL.stem(fl.f) !== RL.stem(f)) { files.get(fl.f).ls.splice(fl.i, 1); dateInsert(ensureFull(RL.stem(f)), fl.line); moved.push(`${r.d}: its full row follows its short line to ${RL.stem(f)}`) }
    const p = RL.parseShort(r.line), marks = RL.marksOf(RL.cellsOf(fl.line))
    if ([...marks].sort().join() !== [...p.tail].sort().join()) { files.get(f).ls[r.i] = RL.shortLine(r.d, p.date, p.text, marks); tails.push(r.d) }
  }

  /* the archive: the retired rows land at its foot, under the day they moved, byte for byte */
  if (toArchive.length) {
    if (!files.has(ARCHR)) die(`${ARCHR} does not exist — it must, before a ruling can move there.`)
    const a = files.get(ARCHR)
    const now = new Date(), day = `${now.getDate()} ${['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][now.getMonth()]} ${String(now.getFullYear()).slice(2)}`
    const heads = a.ls.filter(l => /^## Moved /.test(l))
    if (!heads.length || heads[heads.length - 1] !== `## Moved ${day}`) a.ls.push('', `## Moved ${day}`, '', RL.FULL_HEADER, RL.FULL_SEP)
    a.ls.push(...toArchive.map(t => t.line)); a.trail = true
  }

  /* 4. the map: each row's last column = the D-numbers its file now holds, in the file's own order */
  let mapChanged = 0
  const dec = files.get(DEC), MAP_ROW = /^(\| [^|]+? \| `([^`]+)` \| [^|]*? \| )([^|]*?)( \|\s*)$/
  if (dec) {
    const inF = RL.fencedFlags(dec.ls)
    dec.ls = dec.ls.map((l, i) => {
      const m = !inF[i] && MAP_ROW.exec(l)
      if (!m || !(m[2] === ARCHR || m[2].startsWith(DIR + '/')) || !files.has(m[2])) return l
      const list = [...new Set(rowsIn(m[2]).map(r => r.d))].join(', ') || '—'
      if (list === m[3]) return l
      mapChanged++
      return m[1] + list + m[4]
    })
  }
  const unmapped = allFiles().filter(f => f.startsWith(DIR + '/')).concat(ARCHR).filter(f => files.has(f) && dec && !dec.ls.some(l => l.includes('`' + f + '`')))

  /* every area file needs a byte tripwire in the gate (D390) — said here, before writing, not as an inventory failure */
  const gateSrc = readFileSync(GATE, 'utf8')
  const untripped = allFiles().filter(f => f.startsWith(DIR + '/') && !gateSrc.includes(`'${f}'`))
  if (untripped.length) die(`${untripped.join(', ')} has no byte tripwire in raptor-port/scripts/docsize.mjs's RULING_BYTES — add its row (file, tier, bytes), with its reason, in a docs-only commit; then run this again. Nothing written.`)

  /* a merge's own safety net (Fable's code read): every number either side or the base held is still here — live or
     retired — before anything is written; the gate's inventory measures from the fork point, which may not see them */
  if (mergeIds) {
    const now = new Set(allFiles().concat(ARCHR).flatMap(f => rowsIn(f).filter(r => r.kind !== 'short').map(r => r.d)))
    const lost = [...mergeIds].filter(d => !now.has(d))
    if (lost.length) die(`internal: the merge would lose ${lost.join(', ')} — nothing written. Resolve these by hand and report this.`)
  }

  console.log([...converted, ...moved, ...toArchive.map(t => `${t.d}: ${t.from} → ${ARCHR}`)].join('\n') || 'Nothing to convert, move or retire.')
  if (tails.length) console.log(`Change tails refreshed: ${tails.join(', ')}`)
  console.log(mapChanged ? `The map in ${DEC}: ${mapChanged} row(s) rewritten from the files.` : `The map in ${DEC} already matches the files.`)
  if (unmapped.length) console.log(`NOT in the map — add a row for each by hand (area, file, when it loads), then run this again: ${unmapped.join(', ')}`)
  if (unread.length) console.log(`\nUNREAD — short lines made from a heading here; have one reviewer read each against its full row (D138):\n${unread.map(d => '  ' + (findRow(d, 'short')?.line || d)).join('\n')}`)
  if (rewriteList.length) console.log(`\nREWRITE — short lines to read against a changed full row:\n  - ${rewriteList.join('\n  - ')}`)
  if (classify.length) console.log(`\nCLASSIFY — new in How we work from the other side; does any belong in another area (then --move-rows)? ${classify.join(', ')}`)
  if (reapply.length) console.log(`\nRE-APPLY BY HAND — lines the other side changed that are not ruling rows (never written by this command; keep every number range):\n  - ${reapply.join('\n  - ')}`)
  if (dryRun) { console.log('--dry-run: nothing written.'); process.exit(0) }

  /* written as one step (Astra's code read): every result to a temporary copy, read back, then renamed into place; any
     failure — a write, a rename, or the inventory afterwards — puts EVERY file back, removing any this run created */
  const changed = [...files.keys()].filter(f => textOf(f) !== before.get(f))
  const tmp = f => join(REPO, f) + '.docmove-tmp'
  const putBack = why => {
    const stuck = []
    for (const f of changed) {
      try { const b = before.get(f); if (b == null) rmSync(join(REPO, f), { force: true }); else if (!existsSync(join(REPO, f)) || readFileSync(join(REPO, f), 'utf8') !== b) writeFileSync(join(REPO, f), b) } catch { stuck.push(f) }
      try { rmSync(tmp(f), { force: true }) } catch { /* a leftover temporary copy is harmless */ }
    }
    die(stuck.length ? `${why} — AND ${stuck.join(', ')} could not be put back: restore from git (git checkout -- <file>) before anything else.` : `${why} — EVERY file was put back exactly as it was.`)
  }
  try {
    for (const f of changed) { mkdirSync(dirname(join(REPO, f)), { recursive: true }); writeFileSync(tmp(f), textOf(f)); if (readFileSync(tmp(f), 'utf8') !== textOf(f)) throw new Error(`the temporary copy of ${f} did not read back as written`) }
    for (const f of changed) renameSync(tmp(f), join(REPO, f))
  } catch (err) { putBack(`writing failed (${err.code || err.message})`) }
  const r = spawnSync(process.execPath, [GATE, '--inventory'], { cwd: REPO, encoding: 'utf8' })
  if (r.status !== 0) { console.error(r.stdout + r.stderr); putBack('the inventory was not clean afterwards') }
  console.log(`done; the inventory is clean.${merging ? ` Review, then \`git add\` these files: ${changed.join(', ')}` : ''}`)
  process.exit(0)
}

/* --move — THE ONE WAY A BLOCK OF TEXT MOVES BETWEEN DOCUMENTS (owner, D138 + D140 + D141, 24 Sep 26).
 *
 *   node raptor-port/scripts/backlog-archive.mjs --move <file> --from "<exact first line>"
 *        (--to-line "<exact last line>" | --section) --dest <file>
 *        [--under "<exact heading line>" [--create-under]] (--pointer "<one line left in its place>" | --no-pointer)
 *        [--dry-run]
 *
 * A block that is no longer needed where it sits goes, WHOLE, to where it is read less often — an area's
 * file, a reference doc, an archive (`.claude/rules/doc-structure.md`). "A summary never changes the
 * meaning" (D138) is only as good as the move, and a move by hand is how two backlog items were destroyed on
 * 22 Sep 26. So this refuses anything it cannot do exactly (hardened on Astra's red team, 24 Sep 26):
 *   - both paths must stay inside the repo once links are resolved, and must be two different files;
 *   - the first line must occur EXACTLY ONCE in the source, OUTSIDE any code block (a line that repeats, or
 *     an example inside a fence, is the wrong anchor);
 *   - the block ends at --to-line (exactly one occurrence at or after the start, outside a code block), or
 *     with --section at the next heading of the same or a higher level outside code blocks, or at the end;
 *   - the bytes move unchanged: source and destination must share one line ending and end in a newline;
 *   - with --under, the block lands at the END of that heading's section; a heading that is not there is
 *     refused unless --create-under says to add it at the end of the file; without --under, at the end;
 *   - a pointer is a deliberate choice: --pointer (ONE line, naming the destination file, unique in the source
 *     afterwards) or --no-pointer (when an index elsewhere already points to it) — one of the two, always;
 *   - a block holding a backlog item (`### [ID]`) or a ruling row (`| D<n> |`) is refused: those have their
 *     own movers, which check homes and the map (a plain move would pass the inventory and skip both);
 *   - both results are built and checked in memory, written to temporary copies, read back, and only then
 *     put in place; any failure puts both files back; afterwards the block must be in the destination
 *     exactly once and gone from the source, and the gate's inventory must be clean — or both files go back.
 * It prints the block's line count and SHA-256 — the manifest line a meaning check (D138) works from.
 * Self-tested in scripts/docsize-selftest.mjs ("mover: --move …"). */
if (args.includes('--move')) {
  const opt = k => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : undefined }
  const norm = p => (p || '').replace(/\\/g, '/').replace(/^(\.\/)+/, '')
  const src = norm(opt('--move')), dest = norm(opt('--dest'))
  const from = opt('--from'), toLine = opt('--to-line'), under = opt('--under'), pointer = opt('--pointer')
  const section = args.includes('--section'), createUnder = args.includes('--create-under'), dryM = args.includes('--dry-run')
  const noPointer = args.includes('--no-pointer')
  if (!src || !dest || from === undefined || !!toLine === section || (pointer === undefined) === !noPointer) die('usage: --move <file> --from "<first line>" (--to-line "<last line>" | --section) --dest <file> [--under "<heading>" [--create-under]] (--pointer "<line>" | --no-pointer) [--dry-run]')
  if (pointer !== undefined && /[\r\n]/.test(pointer)) die('--pointer must be ONE line.')
  if (pointer !== undefined && !pointer.includes(dest.split('/').pop())) die(`--pointer must name the destination (${dest.split('/').pop()}), so every pointer can be found by searching for the file it points to.`)
  const realRepo = realpathSync(REPO)
  for (const f of [src, dest]) {
    if (/^([A-Za-z]:|\/)/.test(f) || f.split('/').includes('..')) die(`${f}: give a path from the repo root, inside the repo.`)
    if (!existsSync(join(REPO, f))) die(`${f}: no such file (create the destination with its header first).`)
    const rel = relative(realRepo, realpathSync(join(REPO, f)))
    if (!rel || rel.startsWith('..') || isAbsolute(rel)) die(`${f}: resolves outside the repo (a link?) — refusing.`)
  }
  if (realpathSync(join(REPO, src)) === realpathSync(join(REPO, dest))) die('the source and the destination are the same file — a move within a file is an ordinary edit.')
  const withEndsM = t => t.match(/[^\n]*\n|[^\n]+$/g) || []
  const bare = l => l.replace(/\r?\n$/, '')
  const fenced = lines => { let fence = null; return lines.map(l => { const was = fence; fence = fenceStep(fence, bare(l)); return !!(was || fence) }) }
  const count = (t, b) => t.split(b).length - 1
  const srcText = readFileSync(join(REPO, src), 'utf8'), destText = readFileSync(join(REPO, dest), 'utf8')
  const eolOf = t => (t.includes('\r\n') ? '\r\n' : '\n')
  const mixed = t => t.includes('\r\n') && /(^|[^\r])\n/.test(t)
  if (mixed(srcText) || mixed(destText) || (destText.includes('\n') && eolOf(srcText) !== eolOf(destText))) die(`${src} and ${dest} do not share one line ending — moving the bytes would mix them. Fix the endings first.`)
  for (const [f, t] of [[src, srcText], [dest, destText]]) if (t && !t.endsWith('\n')) die(`${f} does not end in a newline — add one first, so the bytes can move unchanged.`)
  const eolM = eolOf(srcText)
  const ls = withEndsM(srcText), inF = fenced(ls)
  const starts = ls.map((l, i) => (bare(l) === from ? i : -1)).filter(i => i >= 0)
  if (starts.length !== 1) die(`--from must match exactly ONE line of ${src}; it matches ${starts.length}. Quote the whole line, exactly.`)
  const s = starts[0]
  if (inF[s]) die(`--from is a line inside a code block in ${src} — anchor on a line outside it.`)
  let e // exclusive
  if (section) {
    const lvl = (/^(#{1,6}) /.exec(from) || [])[1]
    if (!lvl) die('--section needs --from to be a heading line (# … ######).')
    e = ls.length
    for (let i = s + 1; i < ls.length; i++) {
      const h = !inF[i] && /^(#{1,6}) /.exec(bare(ls[i]))
      if (h && h[1].length <= lvl.length) { e = i; break }
    }
  } else {
    const ends = ls.map((l, i) => (i >= s && bare(l) === toLine ? i : -1)).filter(i => i >= 0)
    if (ends.length !== 1) die(`--to-line must match exactly ONE line of ${src} at or after the start; it matches ${ends.length}.`)
    if (inF[ends[0]]) die(`--to-line is a line inside a code block in ${src} — end on a line outside it.`)
    e = ends[0] + 1
  }
  if (section && e === ls.length) console.log(`note: the section runs to the end of ${src}.`)
  for (let i = s; i < e; i++) {
    if (inF[i]) continue
    if (/^### \[[A-Z][A-Z0-9-]+\]/.test(bare(ls[i]))) die(`the block holds a backlog item (${bare(ls[i]).slice(0, 40)}…) — move items with: backlog-archive.mjs <ID> --homes <file>.`)
    if (/^\|\s*D\d+\s*\|/.test(bare(ls[i]))) die(`the block holds a ruling row (${bare(ls[i]).slice(0, 12)}…) — rulings move with: backlog-archive.mjs --rulings.`)
  }
  const head0 = ls.slice(0, s).join(''), tail0 = ls.slice(e).join('')
  const blockM = ls.slice(s, e).join('')
  if (destText.includes(blockM)) die(`${dest} already holds this exact block — it was moved already, or it is a copy. Nothing written.`)
  if (count(srcText, blockM) !== 1) die(`the block occurs more than once in ${src} — refusing to guess which copy moves.`)
  const newSrc = head0 + (pointer !== undefined ? pointer + eolM : '') + tail0
  /* where it lands: the end of --under's section, else the end of the file, one blank line before it */
  const dl = withEndsM(destText), inD = fenced(dl)
  let at = dl.length, head = ''
  if (under !== undefined) {
    const hits = dl.map((l, i) => (bare(l) === under ? i : -1)).filter(i => i >= 0)
    if (hits.length > 1) die(`--under matches ${hits.length} lines of ${dest}; it must match one.`)
    if (hits.length === 1) {
      if (inD[hits[0]]) die(`--under is a line inside a code block in ${dest}.`)
      const lvl = ((/^(#{1,6}) /.exec(under) || [])[1] || '#######').length
      for (let i = hits[0] + 1; i < dl.length; i++) {
        const h = !inD[i] && /^(#{1,6}) /.exec(bare(dl[i]))
        if (h && h[1].length <= lvl) { at = i; break }
      }
      while (at > hits[0] + 1 && !bare(dl[at - 1]).trim()) at-- // land before the section's trailing blank lines
    } else if (createUnder) head = under + eolM + eolM
    else die(`--under "${under}" is not a line of ${dest}. Check the heading, or add --create-under to create it at the end of the file.`)
  }
  const before = dl.slice(0, at).join('')
  /* one blank line between what is there and what arrives: none if the text before already ends blank */
  const lastBefore = at > 0 ? bare(dl[at - 1]) : ''
  const sep = !before.trim() ? '' : (lastBefore.trim() ? eolM : '')
  const rest = dl.slice(at).join('')
  const newDest = before + sep + head + blockM + (rest && bare(rest.split('\n')[0]).trim() ? eolM : '') + rest
  /* every check in memory first — nothing is written until the result is known to be right */
  if (count(newDest, blockM) !== 1 || count(newSrc, blockM) !== 0) die(`internal: the block would be in ${dest} ${count(newDest, blockM)} time(s) and in ${src} ${count(newSrc, blockM)} — nothing written.`)
  if (!newDest.startsWith(before) || !newDest.endsWith(rest) || !newSrc.startsWith(head0) || !newSrc.endsWith(tail0)) die('internal: text around the move would change — nothing written.')
  if (pointer !== undefined && withEndsM(newSrc).filter(l => bare(l) === pointer).length !== 1) die(`--pointer would occur more than once in ${src} — make it unique.`)
  const hash = createHash('sha256').update(blockM).digest('hex').slice(0, 16)
  console.log(`${src} lines ${s + 1}–${e} (${e - s} lines, sha256 ${hash}) → ${dest}${under ? ` under "${under}"` : ''}${pointer !== undefined ? ' · pointer left' : ''}`)
  if (dryM) { console.log('--dry-run: nothing written.'); process.exit(0) }
  const files = [[src, srcText, newSrc], [dest, destText, newDest]]
  const putBack = why => {
    const stuck = []
    for (const [f, old] of files) { try { if (readFileSync(join(REPO, f), 'utf8') !== old) writeFileSync(join(REPO, f), old) } catch { stuck.push(f) } }
    for (const [f] of files) { try { rmSync(join(REPO, f) + '.docmove-tmp', { force: true }) } catch { /* a leftover temp copy is harmless */ } }
    die(stuck.length ? `${why} — AND ${stuck.join(', ')} could not be put back: restore from git (git checkout -- <file>) before anything else.` : `${why} — both files were put back exactly as they were.`)
  }
  try {
    for (const [f, , t] of files) {
      writeFileSync(join(REPO, f) + '.docmove-tmp', t)
      if (readFileSync(join(REPO, f) + '.docmove-tmp', 'utf8') !== t) throw new Error(`the temporary copy of ${f} did not read back as written`)
    }
    for (const [f] of files) renameSync(join(REPO, f) + '.docmove-tmp', join(REPO, f))
  } catch (err) { putBack(`writing failed (${err.code || err.message})`) }
  const landed = count(readFileSync(join(REPO, dest), 'utf8'), blockM), left = count(readFileSync(join(REPO, src), 'utf8'), blockM)
  if (landed !== 1 || left !== 0) putBack(`after writing, the block is in ${dest} ${landed} time(s) and still in ${src} ${left} time(s)`)
  const r = spawnSync(process.execPath, [GATE, '--inventory'], { cwd: REPO, encoding: 'utf8' })
  if (r.status !== 0) { console.error(r.stdout + r.stderr); putBack('the inventory was not clean after the move') }
  console.log('moved; the block landed once and the inventory is clean.')
  process.exit(0)
}

const id =(args.find(a => !a.startsWith('--') && args[args.indexOf(a) - 1] !== '--homes') || '').replace(/^\[|\]$/g, '')
const hi = args.indexOf('--homes')
/* Homes as git paths from the repo root, `/`-separated, so a Windows `docs\facts.md` matches what
   git reports (Astra); an absolute path or one climbing out of the repo is refused below. */
const homes = hi >= 0 && args[hi + 1] ? args[hi + 1].split(',').map(s => s.trim().replace(/\\/g, '/').replace(/^(\.\/)+/, '')).filter(Boolean) : []
const dry = args.includes('--dry-run')
if (!/^[A-Z][A-Z0-9-]+$/.test(id)) die('usage: backlog-archive.mjs <ITEM-ID> --homes <file>[,<file>...] [--dry-run]')

/* Split into lines KEEPING each line's own ending, so the slice we move is byte-exact. */
const withEnds = t => t.match(/[^\n]*\n|[^\n]+$/g) || []
const live = readFileSync(join(REPO, LIVE), 'utf8')
const arch = readFileSync(join(REPO, ARCHIVE), 'utf8')

/* The same code-block rule as docsize.mjs's fenceStep — keep the two identical: opens on 3+
   backticks or tildes, closes only on the SAME character, at least as long, with nothing after. */
function fenceStep(fence, line) {
  const f = /^ {0,3}(`{3,}|~{3,})(.*)$/.exec(line)
  if (!f) return fence
  if (fence) return f[1][0] === fence.ch && f[1].length >= fence.len && !f[2].trim() ? null : fence
  return { ch: f[1][0], len: f[1].length }
}

/* Every item heading, fence-aware, as { id, start line, end line (exclusive) }. */
function items(text) {
  const ls = withEnds(text), heads = []
  let fence = null
  ls.forEach((l, i) => {
    const s = l.replace(/\r?\n$/, '')
    const was = fence
    fence = fenceStep(fence, s)
    if (!was && !fence && /^#{1,3} /.test(s)) heads.push({ i, id: (/^### \[([A-Z][A-Z0-9-]+)\]/.exec(s) || [])[1] || null })
  })
  return { ls, list: heads.map((h, k) => ({ id: h.id, from: h.i, to: k + 1 < heads.length ? heads[k + 1].i : ls.length })).filter(h => h.id) }
}

const L = items(live), A = items(arch)
const hits = L.list.filter(h => h.id === id)
if (hits.length === 0) die(`[${id}] heads no item in ${LIVE}.`)
if (hits.length > 1) die(`[${id}] heads ${hits.length} items in ${LIVE} — give each its own id first; moving "the first one" is how the wrong item moves.`)
if (A.list.some(h => h.id === id)) die(`[${id}] already heads an item in ${ARCHIVE} — rename one of them first, or the two become one id.`)

if (!homes.length) die(`--homes is required: name the file(s) where [${id}]'s still-useful facts now live. Write the pointer, THEN move (OUTSTANDING.md §Maintaining).`)
const base = (git('merge-base', 'HEAD', 'origin/main') || git('merge-base', 'HEAD', 'main') || 'HEAD').trim()
const changed = new Set([...git('diff', '--name-only', base).split('\n'), ...git('ls-files', '--others', '--exclude-standard').split('\n')].filter(Boolean))
for (const h of homes) {
  if (/^([A-Za-z]:|\/)/.test(h) || h.split('/').includes('..')) die(`--homes ${h}: give a path from the repo root, inside the repo.`)
  if (!existsSync(join(REPO, h))) die(`--homes ${h}: no such file (paths are from the repo root).`)
  if (h === LIVE || h === ARCHIVE) die(`--homes ${h}: the backlog cannot be the home of what leaves it.`)
  const mentions = readFileSync(join(REPO, h), 'utf8').includes(id)
  if (!mentions && !changed.has(h)) die(`--homes ${h}: it neither mentions ${id} nor was changed on this branch, so nothing shows the facts were written there.`)
}

const { from, to } = hits[0]
const block = L.ls.slice(from, to).join('')
const eol = live.includes('\r\n') ? '\r\n' : '\n'
const newLive = L.ls.slice(0, from).join('') + L.ls.slice(to).join('')
/* the LOCAL date — toISOString is UTC, which read a day early on its first real run (UTC+8) */
const now = new Date(), date = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
/* the note names the item: two items archived the same day to the same home once produced two identical note
   lines, which the gate's doubled-body check rightly refused (found 24 Sep 26, archiving [LW-UI-WINDOW]) */
const note = `*Moved here ${date} by backlog-archive.mjs ([${id}]). Forward facts: ${homes.map(h => '`' + h + '`').join(', ')}.*${eol}${eol}`
const newArch = arch + (arch.endsWith('\n') ? '' : eol) + eol + note + block + (block.endsWith('\n') ? '' : eol)

console.log(`[${id}]: ${to - from} lines, ${LIVE} line ${from + 1} → end of ${ARCHIVE}`)
if (dry) { console.log('--dry-run: nothing written.'); process.exit(0) }

writeFileSync(join(REPO, LIVE), newLive)
writeFileSync(join(REPO, ARCHIVE), newArch)
const r = spawnSync(process.execPath, [GATE, '--inventory'], { cwd: REPO, encoding: 'utf8' })
if (r.status !== 0) {
  writeFileSync(join(REPO, LIVE), live)
  writeFileSync(join(REPO, ARCHIVE), arch)
  console.error(r.stdout + r.stderr)
  die('the inventory was not clean after the move, so BOTH files were put back exactly as they were.')
}
console.log('moved; the inventory is clean.')

const refs = git('grep', '-n', '-F', `[${id}]`, '--', '*.md').split('\n').filter(l => l && !l.startsWith(`${ARCHIVE}:`))
if (refs.length) {
  console.log(`\n${refs.length} other mention(s) of [${id}] — check each still reads true now it is archived:`)
  for (const l of refs) console.log('  ' + (l.length > 150 ? l.slice(0, 147) + '...' : l))
}
