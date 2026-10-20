/* The test run's file order and its split across machines ([CI-UNIT-SHARE-2-6], 21 Oct 26). Wired in `vite.config.ts`
   (`test.sequence.sequencer`). Two jobs:
   - `shard` — only when a run is given `--shard=k/n` (GitHub's unit legs, `.github/workflows/deploy.yml`): the files go
     out by measured time (`shard-plan.ts`), not vitest's equal-count split by a hash of the path. The k-th machine runs
     the k-th share of the SAME plan, so the n machines together run every file exactly once.
   - `sort` — every run, sharded or not (his PC's one job, `npm test`): vitest's own order, unchanged.
   vitest's own sequencer is loaded only when a run starts (a type import here, a real one inside `sort`), so building
   the app, which reads the same configuration, never loads the test runner. */
import type { TestSequencer, TestSpecification, Vitest } from 'vitest/node'
import { planShards } from './shard-plan'
import { UNIT_TIMES } from './unit-times'

/** A spec's path relative to the configuration's folder, forward slashes — the key `unit-times.ts` uses. */
export function specKey(root: string, moduleId: string): string {
  const r = root.replace(/\\/g, '/').replace(/\/+$/, '')
  const m = moduleId.replace(/\\/g, '/')
  return m.toLowerCase().startsWith(r.toLowerCase() + '/') ? m.slice(r.length + 1) : m
}

export class TimedSequencer implements TestSequencer {
  private readonly ctx: Vitest
  constructor(ctx: Vitest) {
    this.ctx = ctx
  }

  async shard(files: TestSpecification[]): Promise<TestSpecification[]> {
    const shard = this.ctx.config.shard
    if (!shard) return files
    const { index, count } = shard
    const root = this.ctx.config.root
    const keys = files.map(f => specKey(root, f.moduleId))
    const mine = new Set(planShards(keys, UNIT_TIMES, count)[index - 1])
    return files.filter((_, i) => mine.has(keys[i]))
  }

  async sort(files: TestSpecification[]): Promise<TestSpecification[]> {
    const { BaseSequencer } = await import('vitest/node')
    return new BaseSequencer(this.ctx).sort(files)
  }
}
