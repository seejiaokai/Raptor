/* [CI-UNIT-SHARE-2-6] (21 Oct 26): GitHub's unit legs split the files by measured time (shard-plan.ts, wired through
   timed-sequencer.ts). The one thing that must never happen is a unit file run twice or never, so this lists every unit
   file as vitest's two projects define them (vite.config.ts), reads the shares the checks file actually runs
   (.github/workflows/deploy.yml), and proves every file lands in exactly one share of its project — today's files, a new
   one the times do not know, and a list given in any order. */
import { describe, expect, it } from 'vitest'
import { readdirSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import type { TestSpecification, Vitest } from 'vitest/node'
import { PER_FILE_MS, pathHash, planShards } from './shard-plan'
import { specKey, TimedSequencer } from './timed-sequencer'
import { UNIT_TIMES } from './unit-times'

const PORT = fileURLToPath(new URL('../../', import.meta.url)).replace(/\\/g, '/').replace(/\/$/, '')
const WORKFLOW = readFileSync(new URL('../../../.github/workflows/deploy.yml', import.meta.url), 'utf8').replace(/\r\n/g, '\n')

/** Every unit file of each project, as vite.config.ts's include / exclude choose them. */
function unitFiles(): Record<'raptor' | 'leavewar', string[]> {
  const all = (readdirSync(`${PORT}/src`, { recursive: true }) as string[])
    .map(p => 'src/' + p.replace(/\\/g, '/'))
    .filter(p => /\.test\.tsx?$/.test(p) && !p.includes('/node_modules/'))
    .sort()
  return { raptor: all.filter(p => !p.startsWith('src/leavewar/')), leavewar: all.filter(p => p.startsWith('src/leavewar/')) }
}

/** The unit job's matrix in the checks file: each project's share count, and the shares listed. */
function workflowShares(): Map<string, { count: number; indices: number[] }> {
  const job = WORKFLOW.slice(WORKFLOW.indexOf('\n  unit:\n'), WORKFLOW.indexOf('\n  geometry:\n'))
  expect(job.length, 'the unit job is found in deploy.yml').toBeGreaterThan(100)
  const out = new Map<string, { count: number; indices: number[] }>()
  for (const m of job.matchAll(/- project: (\S+)\n\s+shard: (\d+)\/(\d+)/g)) {
    const e = out.get(m[1]) ?? { count: Number(m[3]), indices: [] }
    expect(Number(m[3]), `${m[1]}: every share of a project is out of the same count`).toBe(e.count)
    e.indices.push(Number(m[2]))
    out.set(m[1], e)
  }
  /* a project listed WITHOUT a shard would run whole beside its shares — every file twice */
  const bare = [...job.matchAll(/- project: (\S+)\n(?!\s+shard:)/g)].map(m => m[1])
  expect(bare, 'no unit project runs unsharded beside its shares').toEqual([])
  return out
}

/** The real sequencer, as a run with `--shard=index/count` builds it — given stand-in specs. */
async function shareOf(paths: string[], index: number, count: number, root = PORT): Promise<string[]> {
  const ctx = { config: { root, shard: { index, count } } } as unknown as Vitest
  const specs = paths.map(p => ({ moduleId: `${root}/${p}` }) as unknown as TestSpecification)
  return (await new TimedSequencer(ctx).shard(specs)).map(s => specKey(root, s.moduleId))
}

async function provePartition(paths: string[], count: number) {
  const seen = new Map<string, number>()
  for (let k = 1; k <= count; k++) {
    const share = await shareOf(paths, k, count)
    expect(share.length, `share ${k}/${count} is not empty`).toBeGreaterThan(0)
    for (const p of share) seen.set(p, (seen.get(p) ?? 0) + 1)
  }
  const twice = [...seen].filter(([, n]) => n > 1).map(([p]) => p)
  const never = paths.filter(p => !seen.has(p))
  expect(twice, 'no file runs in two shares').toEqual([])
  expect(never, 'no file is left out of every share').toEqual([])
  expect(seen.size).toBe(new Set(paths).size)
}

describe('the unit tests split across GitHub’s machines by time', () => {
  const files = unitFiles()
  const shares = workflowShares()

  it('the checks file runs both projects, each as shares 1 to n with none missing or doubled', () => {
    expect([...shares.keys()].sort()).toEqual(['leavewar', 'raptor'])
    for (const [project, { count, indices }] of shares) {
      expect([...indices].sort((a, b) => a - b), `${project}'s shares`).toEqual(Array.from({ length: count }, (_, i) => i + 1))
    }
    expect(files.raptor.length).toBeGreaterThan(400)
    expect(files.leavewar.length).toBeGreaterThan(100)
  })

  it('every unit file of each project lands in exactly one of its shares', async () => {
    for (const [project, { count }] of shares) await provePartition(files[project as 'raptor' | 'leavewar'], count)
  })

  it('a new file the times do not know lands in exactly one share — its hash’s', async () => {
    const extra = ['src/zz-new-one.test.ts', 'src/ui/zz-new-two.test.tsx']
    for (const p of extra) expect(UNIT_TIMES[p]).toBeUndefined()
    const count = shares.get('raptor')!.count
    await provePartition([...files.raptor, ...extra], count)
    for (const p of extra) {
      const k = pathHash(p) % count
      expect(planShards([...files.raptor, ...extra], UNIT_TIMES, count)[k]).toContain(p)
    }
  })

  it('the plan is the same on every machine: any order of the list, the same shares', () => {
    const count = shares.get('raptor')!.count
    const a = planShards(files.raptor, UNIT_TIMES, count)
    const b = planShards([...files.raptor].reverse(), UNIT_TIMES, count)
    expect(b).toEqual(a)
    expect(planShards([...files.raptor, files.raptor[0]], UNIT_TIMES, count), 'a path given twice is planned once').toEqual(a)
  })

  it('the shares are close in measured time (the point of the split)', () => {
    for (const [project, { count }] of shares) {
      const plan = planShards(files[project as 'raptor' | 'leavewar'], UNIT_TIMES, count)
      const loads = plan.map(s => s.reduce((t, p) => t + (UNIT_TIMES[p] ?? 0) + PER_FILE_MS, 0))
      const mean = loads.reduce((s, x) => s + x, 0) / count
      expect(Math.max(...loads), `${project}: ${loads.map(l => Math.round(l / 1000) + 's').join(' · ')}`).toBeLessThan(mean * 1.15)
    }
  })

  it('without --shard (his PC, npm test) every file is kept; a Windows path keys the same as a Linux one', async () => {
    const ctx = { config: { root: PORT, shard: undefined } } as unknown as Vitest
    const specs = files.raptor.slice(0, 5).map(p => ({ moduleId: `${PORT}/${p}` }) as unknown as TestSpecification)
    expect(await new TimedSequencer(ctx).shard(specs)).toBe(specs)
    expect(specKey('C:\\Users\\x\\raptor-port', 'C:/Users/x/raptor-port/src/ui/a.test.tsx')).toBe('src/ui/a.test.tsx')
    expect(specKey('c:/Users/x/raptor-port/', 'C:\\Users\\x\\raptor-port\\src\\ui\\a.test.tsx')).toBe('src/ui/a.test.tsx')
    expect(specKey('/home/runner/work/Raptor/Raptor/raptor-port', '/home/runner/work/Raptor/Raptor/raptor-port/src/a.test.ts')).toBe('src/a.test.ts')
  })

  it('a share count below 1 is refused, not silently run as nothing', () => {
    expect(() => planShards(['src/a.test.ts'], {}, 0)).toThrow(/at least 1/)
  })
})
