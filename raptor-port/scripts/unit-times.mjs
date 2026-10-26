#!/usr/bin/env node
/* Writes src/testing/unit-times.ts — each unit test file's measured time on GitHub's machines — from the logs of one or
   more GitHub runs of the checks ([CI-UNIT-SHARE-2-6], 21 Oct 26). The unit legs split their files by these times
   (src/testing/shard-plan.ts); a file the list does not know still runs, in the share its path's hash names, so the
   list only needs refreshing when the shares drift apart again (read each leg's time: `gh run view <id> --json jobs`).

     node scripts/unit-times.mjs <run id> [<run id> …]     (from raptor-port/; needs the gh command, signed in)
     node scripts/unit-times.mjs --check <run id> …        prints the plan's predicted share loads, writes nothing

   A file seen in several runs gets the mean of its times. The figures are each file's own test time as vitest prints it
   ("✓ raptor src/x.test.ts (12 tests) 345ms"); a fixed cost per file is added by the plan itself (PER_FILE_MS). */
import { execFileSync } from 'node:child_process'
import { writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const here = dirname(fileURLToPath(import.meta.url))
const out = join(here, '..', 'src', 'testing', 'unit-times.ts')
const args = process.argv.slice(2)
const check = args.includes('--check')
const runs = args.filter(a => /^\d+$/.test(a))
if (!runs.length) {
  console.error('usage: node scripts/unit-times.mjs [--check] <run id> [<run id> …]')
  process.exit(2)
}

const gh = (...a) => execFileSync('gh', a, { encoding: 'utf8', maxBuffer: 256 * 1024 * 1024 })
const repo = gh('repo', 'view', '--json', 'nameWithOwner', '--jq', '.nameWithOwner').trim()
// eslint-disable-next-line no-control-regex
const strip = s => s.replace(/\x1b\[[0-9;]*m/g, '')
const LINE = /^\S+\s+[✓×↓]\s+(raptor|leavewar)\s+(src\/\S+\.test\.tsx?)\s+\((\d+) tests?[^)]*\)(?:\s+(\d+)ms)?/

const seen = new Map() // path -> [ms…]
const projectOf = new Map()
for (const run of runs) {
  const jobs = JSON.parse(gh('run', 'view', run, '--json', 'jobs')).jobs.filter(j => j.name.startsWith('unit'))
  if (!jobs.length) throw new Error(`run ${run} has no unit legs`)
  for (const j of jobs) {
    if (j.conclusion !== 'success') throw new Error(`run ${run}: "${j.name}" did not pass (${j.conclusion}) — measure a green run`)
    const log = strip(gh('api', '--allow-escape-sequences', `repos/${repo}/actions/jobs/${j.databaseId}/logs`))
    let n = 0
    for (const line of log.split(/\r?\n/)) {
      const m = line.match(LINE)
      if (!m) continue
      n++
      projectOf.set(m[2], m[1])
      if (!seen.has(m[2])) seen.set(m[2], [])
      seen.get(m[2]).push(m[4] ? Number(m[4]) : 0)
    }
    if (!n) throw new Error(`run ${run}: no file lines read from "${j.name}" — has vitest's report changed?`)
    console.log(`run ${run} · ${j.name}: ${n} files`)
  }
}

const times = Object.fromEntries([...seen].sort(([a], [b]) => (a < b ? -1 : 1))
  .map(([p, ms]) => [p, Math.round(ms.reduce((s, x) => s + x, 0) / ms.length / 10) * 10]))

if (check) {
  const { planShards, PER_FILE_MS } = await import('../src/testing/shard-plan.ts').catch(() => {
    throw new Error('--check needs a Node that runs .ts files by itself (22.18+ or 23.6+)')
  })
  /* each project's share count as the checks file's unit matrix lists it */
  const { readFileSync } = await import('node:fs')
  const wf = readFileSync(join(here, '..', '..', '.github', 'workflows', 'deploy.yml'), 'utf8').replace(/\r\n/g, '\n')
  const counts = new Map([...wf.slice(wf.indexOf('\n  unit:\n'), wf.indexOf('\n  geometry:\n')).matchAll(/- project: (\S+)\n\s+shard: \d+\/(\d+)/g)].map(m => [m[1], Number(m[2])]))
  for (const [project, count] of counts) {
    const paths = [...projectOf].filter(([, pr]) => pr === project).map(([p]) => p)
    const plan = planShards(paths, times, count)
    console.log(project, plan.map(s => `${s.length} files ${Math.round(s.reduce((t, p) => t + times[p] + PER_FILE_MS, 0) / 1000)}s`).join(' · '))
  }
  process.exit(0)
}

const body = Object.entries(times).map(([p, ms]) => `  '${p}': ${ms},`).join('\n')
writeFileSync(out, `/* Each unit test file's own test time in milliseconds on GitHub's machines — WRITTEN BY scripts/unit-times.mjs from
   run(s) ${runs.join(', ')}; do not edit by hand. Read by shard-plan.ts to split the unit legs by time. A file not listed
   still runs (the share its path's hash names); a file listed that no longer exists is ignored. */
export const UNIT_TIMES: Readonly<Record<string, number>> = {
${body}
}
`)
console.log(`wrote ${Object.keys(times).length} files' times to src/testing/unit-times.ts`)
