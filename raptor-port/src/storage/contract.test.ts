// src/storage/contract.test.ts
/* THE CONTRACT every backend must pass. Stage 4 runs this same function
   against the Dataverse adapter; if it passes, the app cannot tell the
   difference. Add a case here, never in a backend's own test file. */
import { describe, it, expect } from 'vitest'
import type { Backend } from './backend'
import { MemoryBackend } from './memory'

export function contractTests(name: string, make: () => Backend | Promise<Backend>): void {
  describe(`Backend contract: ${name}`, () => {
    it('loadAll on an empty store returns every collection, empty', async () => {
      const b = await make()
      const snap = await b.loadAll()
      expect(Object.keys(snap).sort()).toEqual(['inputs', 'leavewar', 'people', 'plan', 'settings', 'tracker', 'weeks'])
      for (const c of Object.values(snap)) expect(c).toEqual({})
    })
    it('put then loadAll round-trips the exact string', async () => {
      const b = await make()
      await b.put('settings', 'rules', '{"v":{"dur":99},"s":{}}')
      const snap = await b.loadAll()
      expect(snap.settings['rules']).toBe('{"v":{"dur":99},"s":{}}')
    })
    it('a later put overwrites', async () => {
      const b = await make()
      await b.put('inputs', 'all', '[1]')
      await b.put('inputs', 'all', '[2]')
      expect((await b.loadAll()).inputs['all']).toBe('[2]')
    })
    it('remove deletes; removing an absent id is not an error', async () => {
      const b = await make()
      await b.put('weeks', '13-07-2026', '{}')
      await b.remove('weeks', '13-07-2026')
      await b.remove('weeks', 'never-there')
      expect((await b.loadAll()).weeks).toEqual({})
    })
    it('many puts across collections all come back', async () => {
      const b = await make()
      await b.put('settings', 'daytpl', 'null')
      await b.put('leavewar', 'wars', '[]')
      await b.put('tracker', 'v3:master', '{"order":[]}')
      await b.put('plan', 'all', '{"pp":[],"dm":{}}')
      const snap = await b.loadAll()
      expect(snap.settings['daytpl']).toBe('null')
      expect(snap.leavewar['wars']).toBe('[]')
      expect(snap.tracker['v3:master']).toBe('{"order":[]}')
      expect(snap.plan['all']).toBe('{"pp":[],"dm":{}}')
    })
    it('does not parse values: a non-JSON string survives untouched', async () => {
      const b = await make()
      await b.put('leavewar', 'current', 'war-2026')
      expect((await b.loadAll()).leavewar['current']).toBe('war-2026')
    })
  })
}

contractTests('MemoryBackend', () => new MemoryBackend())
