// @vitest-environment jsdom
// src/storage/contract.test.ts
/* THE CONTRACT every backend must pass. Stage 4 runs this same function
   against the Dataverse adapter; if it passes, the app cannot tell the
   difference. Add a case here, never in a backend's own test file. */
import { describe, it, expect } from 'vitest'
import type { Backend, Entry } from './backend'
import { MemoryBackend } from './memory'
import { BrowserBackend, JOURNAL_KEY } from './browser'

/* [ARCH-STACK-4] phase 0 — the fault knobs the GROUP contract drives (design
   §19.4, §20.3, §20.4). Every backend's rig supplies them so one suite proves
   "atomic or recoverable" for all; a future backend (Dataverse $batch) supplies
   its own. `reopen` = the tab closed and a new one boots on the same data. */
export type Faults = {
  failJournalWrite(): void          // the group's journal cannot be stored at all
  crashAfter(k: number): void       // the tab dies after k entries were applied
  storageFull(loads: number): void  // the next `loads` boot replays cannot write
  corruptJournal(): void            // an unreadable journal is lying in storage
  reopen(): Backend
}

export function contractTests(name: string, make: () => Backend | Promise<Backend>, faults?: (b: Backend) => Faults): void {
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

    /* ---- the all-or-nothing group ---- */
    const BEFORE = async (b: Backend) => {
      await b.put('inputs', 'all', 'I0'); await b.put('leavewar', 'wars', 'W0'); await b.put('tracker', 'old', 'T0')
    }
    const GROUP: Entry[] = [
      { collection: 'inputs', id: 'all', value: 'I1' },
      { collection: 'leavewar', id: 'wars', value: 'W1' },
      { collection: 'tracker', id: 'old', value: null },
    ]
    const isBefore = (s: any) => s.inputs.all === 'I0' && s.leavewar.wars === 'W0' && s.tracker.old === 'T0'
    const isAfter = (s: any) => s.inputs.all === 'I1' && s.leavewar.wars === 'W1' && !('old' in s.tracker)

    it('putMany applies every entry (puts and removes) and leaves no journal behind', async () => {
      const b = await make()
      await BEFORE(b)
      await b.putMany(GROUP)
      const s = await b.loadAll()
      expect(isAfter(s)).toBe(true)
      expect(b.unfinished()).toBeNull()
    })

    if (faults) {
      it('a journal that cannot be written applies NOTHING (the group retries whole)', async () => {
        const b = await make(); const f = faults(b)
        await BEFORE(b)
        f.failJournalWrite()
        await expect(b.putMany(GROUP)).rejects.toThrow()
        expect(isBefore(await f.reopen().loadAll())).toBe(true)
      })

      for (const k of [0, 1, 2]) {
        it(`a crash after ${k} applied entries is COMPLETED at the next boot — exactly after, never between`, async () => {
          const b = await make(); const f = faults(b)
          await BEFORE(b)
          f.crashAfter(k)
          await expect(b.putMany(GROUP)).rejects.toThrow()
          const b2 = f.reopen()
          expect(isAfter(await b2.loadAll())).toBe(true)
          expect(b2.unfinished()).toBeNull()
          expect(isAfter(await f.reopen().loadAll())).toBe(true)    // and it stays done
        })
      }

      it('a replay that cannot finish keeps the journal, boots on the acknowledged world, and reports it unfinished', async () => {
        const b = await make(); const f = faults(b)
        await BEFORE(b)
        f.crashAfter(1)
        await expect(b.putMany(GROUP)).rejects.toThrow()
        f.storageFull(1)
        const b2 = f.reopen()
        expect(isAfter(await b2.loadAll())).toBe(true)              // the journal's values overlaid
        expect(b2.unfinished()?.map(e => e.collection)).toEqual(['inputs', 'leavewar', 'tracker'])
        const b3 = f.reopen()                                        // space again: finished for real
        expect(isAfter(await b3.loadAll())).toBe(true)
        expect(b3.unfinished()).toBeNull()
      })

      it('an unreadable journal is dropped, never half-applied', async () => {
        const b = await make(); const f = faults(b)
        await BEFORE(b)
        f.corruptJournal()
        const b2 = f.reopen()
        expect(isBefore(await b2.loadAll())).toBe(true)
        expect(b2.unfinished()).toBeNull()
      })

      it('writeJournal replaces the stored journal (the boot reset filter); null removes it', async () => {
        const b = await make(); const f = faults(b)
        await BEFORE(b)
        f.crashAfter(0)
        await expect(b.putMany(GROUP)).rejects.toThrow()
        await b.writeJournal([{ collection: 'tracker', id: 'old', value: null }])
        const s = await f.reopen().loadAll()
        expect(s.inputs.all).toBe('I0')                               // the filtered-out entries never land
        expect(s.leavewar.wars).toBe('W0')
        expect('old' in s.tracker).toBe(false)
        const b3 = f.reopen()
        await b3.writeJournal(null)
        expect(b3.unfinished()).toBeNull()
      })
    }
  })
}

/* the Memory backend's data lives in the instance, so "reopen" is the same
   object booting again */
contractTests('MemoryBackend', () => new MemoryBackend(), b => {
  const m = b as MemoryBackend
  return {
    failJournalWrite: () => m.failNext(1),
    crashAfter: k => m.crashNextAfter(k),
    storageFull: n => m.failReplay(n),
    corruptJournal: () => { /* the Memory journal is typed data — nothing to corrupt */ },
    reopen: () => m,
  }
})

/* a Storage that can be told to throw, to drive quota / crash paths */
function faultStorage() {
  const m = new Map<string, string>()
  let failJournal = false, crashAfter: number | null = null, full = 0, loading = false
  const tick = () => {
    if (crashAfter !== null && m.has(JOURNAL_KEY)) {
      if (crashAfter <= 0) { crashAfter = null; throw new Error('crash') }
      crashAfter--
    }
  }
  const s: any = {
    get length() { return m.size },
    key(i: number) { return [...m.keys()][i] ?? null },
    getItem(k: string) { return m.has(k) ? m.get(k)! : null },
    setItem(k: string, v: string) {
      if (k === JOURNAL_KEY) {
        if (failJournal) { failJournal = false; throw new Error('QuotaExceededError') }
        m.set(k, String(v)); return
      }
      if (loading && full > 0) throw new Error('QuotaExceededError')
      tick()
      m.set(k, String(v))
    },
    removeItem(k: string) {
      if (k !== JOURNAL_KEY) {
        if (loading && full > 0) throw new Error('QuotaExceededError')
        tick()
      }
      m.delete(k)
    },
    clear() { m.clear() },
  }
  return {
    ls: s as Storage,
    failJournalWrite: () => { failJournal = true },
    crashAfter: (k: number) => { crashAfter = k },
    storageFull: (n: number) => { full = n },
    corruptJournal: () => { m.set(JOURNAL_KEY, '{not json') },
    /* a boot: replay writes fail while "full" is counting down */
    boot: (b: BrowserBackend) => {
      const orig = b.loadAll.bind(b)
      b.loadAll = async () => { loading = true; try { return await orig() } finally { loading = false; if (full > 0) full-- } }
      return b
    },
  }
}
const FS = new WeakMap<Backend, ReturnType<typeof faultStorage>>()
contractTests('BrowserBackend', () => { localStorage.clear(); return new BrowserBackend() })
contractTests('BrowserBackend (fault storage)', () => {
  const fs = faultStorage()
  const b = fs.boot(new BrowserBackend(fs.ls))
  FS.set(b, fs)
  return b
}, b => {
  const fs = FS.get(b)!
  return {
    failJournalWrite: fs.failJournalWrite,
    crashAfter: fs.crashAfter,
    storageFull: fs.storageFull,
    corruptJournal: fs.corruptJournal,
    reopen: () => fs.boot(new BrowserBackend(fs.ls)),
  }
})
