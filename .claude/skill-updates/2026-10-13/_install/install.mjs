// Install the approved 13 Oct 26 skill review. Run from the repo root:
//   node <this file> drafts            copy / merge every staged draft over its live file
//   node <this file> log <n,n,…|none>  mark the notes (the list = ASK rows he agreed to close) and archive the resolved
// Version line, so stale output is visible:
console.log('install.mjs v3 —', process.argv.slice(2).join(' '))
import { readFileSync, writeFileSync, existsSync, mkdirSync, copyFileSync, readdirSync, statSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { dirname, join } from 'node:path'
import { tmpdir } from 'node:os'

const S = '.claude/skill-updates/2026-10-13'
const TODAY = '2026-10-13'
const mode = process.argv[2]

function walk(dir, out = []) {
  for (const n of readdirSync(dir)) {
    const p = join(dir, n).replace(/\\/g, '/')
    if (statSync(p).isDirectory()) walk(p, out); else out.push(p)
  }
  return out
}

if (mode === 'drafts') {
  const base = readFileSync(`${S}/_review/base-commit.txt`, 'utf8').trim()
  const staged = [...walk(`${S}/.claude`), ...walk(`${S}/raptor-port`), `${S}/DECISIONS.md`, `${S}/HANDOFF.md`]
  for (const sp of staged) {
    const live = sp.slice(S.length + 1)
    if (!existsSync(live)) { mkdirSync(dirname(live), { recursive: true }); copyFileSync(sp, live); console.log('NEW    ', live); continue }
    let baseText
    try { baseText = execFileSync('git', ['show', `${base}:${live}`], { maxBuffer: 1 << 28 }) } catch { throw new Error(`no base for ${live}`) }
    const liveText = readFileSync(live)
    if (Buffer.compare(liveText, baseText) === 0) { copyFileSync(sp, live); console.log('COPIED ', live); continue }
    // the live file moved since the drafts were staged: three-way merge, stop on a conflict
    const tb = join(tmpdir(), 'install-base.tmp'); writeFileSync(tb, baseText)
    try {
      const merged = execFileSync('git', ['merge-file', '-p', live, tb, sp], { maxBuffer: 1 << 28 })
      writeFileSync(live, merged); console.log('MERGED ', live)
    } catch (e) { throw new Error(`CONFLICT merging ${live} — resolve by hand; nothing more was written`) }
  }
  console.log('drafts installed:', staged.length, 'files')
}

if (mode === 'log') {
  const decline = new Set((process.argv[3] || 'none').split(',').filter(x => /^\d+$/.test(x)).map(Number))
  const LOG = '.claude/skill-observations/log.md'
  const ARCH = `.claude/skill-observations/archive/log-${TODAY}.md`
  // the table
  const rows = new Map()
  for (const l of readFileSync(`${S}/_review/dispositions.md`, 'utf8').split('\n')) {
    const m = l.match(/^\| (\d+) \| (APPLY|REFLECTED|FILED|MEMORY|ASK|OPEN) \| (.*) \|\s*$/)
    if (m) rows.set(Number(m[1]), { code: m[2], text: m[3] })
  }
  // re-read the LIVE log now (safety rule 1), back it up (rule 4)
  const text = readFileSync(LOG, 'utf8')
  const eol = text.includes('\r\n') ? '\r\n' : '\n'
  writeFileSync(join(tmpdir(), `skill-log-backup-${Date.now()}.md`), text)
  const lines = text.split(eol)
  const heads = []
  lines.forEach((l, i) => { const m = l.match(/^### Observation (\d+):/); if (m) heads.push({ n: Number(m[1]), i }) })
  const before = heads.length
  const firstHead = heads[0].i
  const header = lines.slice(0, firstHead)             // the log's own head, and the first date headings
  const keep = [], gone = []
  let actioned = 0, declined = 0, open = 0, untouched = 0
  heads.forEach((h, k) => {
    const end = k + 1 < heads.length ? heads[k + 1].i : lines.length
    const chunk = lines.slice(h.i, end)                // ONE bounded entry (rule 2)
    const r = rows.get(h.n)
    const si = chunk.findIndex(l => /^\s*-?\s*\*\*Status:\*\*/.test(l))
    if (si < 0) throw new Error(`#${h.n} has no Status line`)
    if (!r) { keep.push(...chunk); untouched++; return }        // logged after the review's table was made
    let status = null
    if (r.code === 'OPEN') status = null
    else if (r.code === 'ASK') status = decline.has(h.n) ? `DECLINED (${TODAY}) — ${r.text} (owner, skill review of 13 Oct 26)` : null
    else {
      const how = r.code === 'REFLECTED' ? 'Already reflected: ' : r.code === 'FILED' ? 'Filed in the backlog: ' : r.code === 'MEMORY' ? 'Memory note: ' : 'Applied: '
      status = `ACTIONED (${TODAY}) — ${how}${r.text} (skill review of 13 Oct 26)`
    }
    if (status === null) { keep.push(...chunk); open++; return }
    if (!/^\*\*Status:\*\* OPEN/.test(chunk[si].trim())) throw new Error(`#${h.n} is not OPEN: ${chunk[si]}`)
    chunk[si] = `**Status:** ${status}`
    status.startsWith('ACTIONED') ? actioned++ : declined++
    gone.push(...chunk)
  })
  // date headings that sit between entries travel with the chunk before them; keep the active log's own head whole
  const trim = a => { while (a.length && a[a.length - 1].trim() === '') a.pop(); return a }
  const active = [...header, ...trim(keep), '']
  const archive = [...lines.slice(0, lines.findIndex(l => l.trim() === '---') + 1), '', `## Resolved by the skill review of ${TODAY}`, '', ...trim(gone), '']
  if (existsSync(ARCH)) throw new Error(`${ARCH} exists already`)
  const count = a => a.filter(l => /^### Observation \d+:/.test(l)).length
  if (count(active) + count(archive) !== before) throw new Error(`header count: ${count(active)} + ${count(archive)} != ${before}`)
  if (count(archive) !== actioned + declined) throw new Error('archive count is off')
  // rule 1 again: the live file must not have moved while this ran
  if (readFileSync(LOG, 'utf8') !== text) throw new Error('the live log changed during the run — run again')
  writeFileSync(ARCH, archive.join(eol))
  writeFileSync(LOG, active.join(eol))
  writeFileSync('.claude/skill-observations/last-review-date.txt', TODAY + eol)
  console.log(`before ${before} · actioned ${actioned} · declined ${declined} · left open ${open} · untouched (newer) ${untouched}`)
  console.log(`active now ${count(active)} · archived ${count(archive)}`)
}
