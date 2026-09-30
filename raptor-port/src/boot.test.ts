// @vitest-environment jsdom
/* [DB-READINESS] group A, phase 5 — NEVER SEED DEMO DATA INTO A SHARED STORE (plan §3 phase 5; §8 P5-LANDING,
   P0-BOOTSTRAP; Astra R2-09, R3-03; Fable F2-05, F3-04). Drives the app's REAL boot (src/boot.ts — the one main.tsx
   runs) on the stand-in store, under both policies:
   - the BLANK policy (a shared store): an unstarted store gets NOTHING demo — no requests, roster, weeks, planning
     notes, accounts or Leave War world — and exactly one thing made: the first admin (his person and his account), in
     the same saved group as the "started" stamp; a store it cannot set up that way is refused before anything is
     written (fail closed);
   - the DEMO policy (every test, the dev server, the e2e suite, his preview): unchanged;
   - in ONE process (the same module instances), a demo boot after a blank one loads the whole demo, and a blank boot
     after a demo one loads none of it — the live arrays are reset from frozen seed copies, or to blank, every boot;
   - a STARTED store is read as it stands under either policy;
   - the landing pass is not a demo pass: a real request on a week nobody has opened lands when the week is opened
     (P5-LANDING). */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { INPUTS } from './engine/inputs'
import { PEOPLE } from './engine/people'
import { DAYS } from './engine/data'
import { CURWEEK } from './engine/waves'
import { weekBundle } from './engine/weeks-data'
import { PLANPUCKS } from './state/plan'
import { loadWeek } from './state/store'
import { ACCOUNTS_LIST, signIn } from './state/accounts'
import { rawState } from './leavewar/state/store'
import { MemoryBackend } from './storage/memory'
import { SCHEMA_VERSION } from './storage/reset'
import { readSchema, StoreAheadError } from './storage/schema'
import type { Snapshot } from './storage/backend'
import { bootApp, BootConfigError } from './boot'
import { bootPolicyFrom, readBootstrap, DEMO_POLICY, type BootPolicy, type BootstrapAdmin } from './bootpolicy'

const ADMIN: BootstrapAdmin = { principal: 'Boss@Unit.Example', person: { cs: 'Boss', ini: 'BS', seat: 'FCP', cat: 'A' } }
const blank = (bootstrap: BootPolicy['bootstrap'] = ADMIN): BootPolicy => ({ seedDemo: false, bootstrap })
const stamp = (initialized: boolean, format = SCHEMA_VERSION) =>
  JSON.stringify({ stage: 1, dataFormatVersion: format, initialized, appliedAt: 'x', minClient: format })

async function boot(be: MemoryBackend, policy: BootPolicy) {
  const p = bootApp(be, policy)
  /* whatever happens, let every timer the boot starts run out, then report the boot's own outcome */
  const settled = p.then(() => null, (e: unknown) => e)
  await vi.advanceTimersByTimeAsync(be.latency + 1)
  const err = await settled
  if (err) throw err
  const { postman } = await p
  await postman.flush()
}
/* every stored key, by collection — what a store holds after the boot */
async function keys(be: MemoryBackend): Promise<Record<string, string[]>> {
  const snap = await be.loadAll()
  const out: Record<string, string[]> = {}
  for (const c of Object.keys(snap) as Array<keyof Snapshot>) { const ks = Object.keys(snap[c] || {}).sort(); if (ks.length) out[c] = ks }
  return out
}
const realPeople = () => Object.keys(PEOPLE).filter(id => !PEOPLE[id].special)
const noWaves = (days: any[]) => days.every(d => !(d.waves || []).length && !(d.ground || []).length && !(d.dutywaves || []).length)

beforeEach(() => { vi.useFakeTimers() })
afterEach(async () => { vi.useRealTimers() })

describe('the boot policy comes from the build settings (src/bootpolicy.ts)', () => {
  it('no setting is the demo; VITE_SEED_DEMO "false" or "0" is a shared store', () => {
    expect(bootPolicyFrom({})).toEqual(DEMO_POLICY)
    expect(bootPolicyFrom({ VITE_SEED_DEMO: 'true' }).seedDemo).toBe(true)
    expect(bootPolicyFrom({ VITE_SEED_DEMO: 'false' }).seedDemo).toBe(false)
    expect(bootPolicyFrom({ VITE_SEED_DEMO: '0' }).seedDemo).toBe(false)
  })
  it('the first admin reads as one of two forms; anything else is kept as invalid, never guessed at', () => {
    expect(readBootstrap(undefined)).toBeNull()
    expect(readBootstrap('')).toBeNull()
    expect(readBootstrap(JSON.stringify(ADMIN))).toEqual({ principal: 'Boss@Unit.Example', person: { cs: 'Boss', ini: 'BS', seat: 'FCP', cat: 'A' } })
    expect(readBootstrap('{"principal":"it@x","personId":"p123"}')).toEqual({ principal: 'it@x', personId: 'p123' })
    expect(readBootstrap('{not json')).toBe('invalid')
    expect(readBootstrap('{"person":{"cs":"X"}}')).toBe('invalid')                                   // no principal
    expect(readBootstrap('{"principal":"a","personId":"p1","person":{"cs":"X"}}')).toBe('invalid')   // both forms at once
    expect(readBootstrap('{"principal":"a"}')).toBe('invalid')                                        // neither form
    expect(bootPolicyFrom({ VITE_SEED_DEMO: 'false', VITE_BOOTSTRAP_ADMIN: JSON.stringify(ADMIN) }).bootstrap).toEqual(ADMIN)
  })
})

describe("a shared store's first boot: nothing demo, and the first admin", () => {
  it('stores only the stamp, the first admin\'s person and account, and the one change-log batch naming them', async () => {
    const be = new MemoryBackend()
    await boot(be, blank())
    const k = await keys(be)
    const [pid] = realPeople()
    const [acct] = ACCOUNTS_LIST
    expect(k).toEqual({
      people: [pid],
      settings: [`account:${acct.id}`, 'schema'].sort(),
      changes: expect.any(Array),
    })
    expect(k.changes).toHaveLength(1)
    const batch = JSON.parse(be.peek('changes', k.changes[0])!)
    expect(batch.type).toBe('boot')
    expect(batch.items.map((i: any) => `${i.table}:${i.key}`).sort()).toEqual([`Person:people/${pid}`, 'SchemaVersion:settings/schema', `User:settings/account:${acct.id}`].sort())
    expect(readSchema(be.peek('settings', 'schema'))!.initialized).toBe(true)
  })

  it('he signs in as the admin, and he is the only person on the roster', async () => {
    const be = new MemoryBackend()
    await boot(be, blank())
    const people = realPeople()
    expect(people).toHaveLength(1)
    expect(PEOPLE[people[0]]).toMatchObject({ cs: 'Boss', initials: 'BS', seat: 'FCP', q: 'A' })
    expect(ACCOUNTS_LIST).toEqual([expect.objectContaining({ name: 'boss@unit.example', role: 'admin', pid: people[0], on: true })])
    /* his password is Microsoft's check at the database step — today any non-empty one, as for any account an admin adds */
    expect(signIn('boss@unit.example', 'anything')).toMatchObject({ kind: 'ok', account: { role: 'admin', pid: people[0] } })
    /* no demo account signs in */
    expect(signIn('ad', 'a')).toMatchObject({ kind: 'new' })
    expect(signIn('us', 'us')).toMatchObject({ kind: 'new' })
  })

  it('nothing demo is anywhere: no request, no planning note, a blank schedule (the two authored weeks too), no Leave War world', async () => {
    const be = new MemoryBackend()
    await boot(be, blank())
    expect(INPUTS).toHaveLength(0)
    expect(PLANPUCKS).toHaveLength(0)
    expect(DAYS).toHaveLength(7)
    expect(noWaves(DAYS)).toBe(true)
    expect(noWaves(weekBundle('13/07/2026').days)).toBe(true)
    expect(noWaves(weekBundle('20/07/2026').days)).toBe(true)
    expect(weekBundle('20/07/2026').inputs).toEqual([])
    const lw = rawState()
    expect(lw.wars).toHaveLength(0)
    expect(Object.keys(lw.openings)).toHaveLength(0)
    expect(lw.ledger).toHaveLength(0)
  })

  it('a reload writes nothing and makes nothing twice', async () => {
    const be = new MemoryBackend()
    await boot(be, blank())
    const before = JSON.stringify(await be.loadAll())
    const pid = realPeople()[0]
    await boot(be, blank())
    expect(JSON.stringify(await be.loadAll())).toBe(before)
    expect(realPeople()).toEqual([pid])
    expect(ACCOUNTS_LIST).toHaveLength(1)
  })

  it('the pre-made person form: IT\'s person row is left byte for byte, and his admin account is made for it', async () => {
    const be = new MemoryBackend()
    const row = JSON.stringify({ cs: 'Chief', initials: 'CF', seat: 'RCP', q: 'IWSO', flight: '-', ord: 1024 })
    be.seed({ settings: { schema: stamp(false) }, people: { pit1: row } })
    await boot(be, blank({ principal: 'chief@unit.example', personId: 'pit1' }))
    expect(be.peek('people', 'pit1')).toBe(row)
    expect(ACCOUNTS_LIST).toEqual([expect.objectContaining({ name: 'chief@unit.example', role: 'admin', pid: 'pit1', on: true })])
    expect(readSchema(be.peek('settings', 'schema'))!.initialized).toBe(true)
  })

  const FAILS: Array<[string, BootPolicy['bootstrap']]> = [
    ['none configured', null],
    ['a setting that does not read', 'invalid'],
    ['a person the app cannot make (no seat)', { principal: 'x@y', person: { cs: 'X', ini: '', seat: '', cat: '' } }],
    ['a person the app cannot make (a callsign over 14 letters)', { principal: 'x@y', person: { cs: 'ABCDEFGHIJKLMNOP', ini: '', seat: 'FCP', cat: 'A' } }],
    ['a sign-in name over 80 letters', { principal: 'x'.repeat(81), person: { cs: 'X', ini: '', seat: 'FCP', cat: 'A' } }],
    ['a pre-made person not in the store', { principal: 'x@y', personId: 'nobody' }],
  ]
  for (const [what, bootstrap] of FAILS) {
    it(`fails closed — ${what}: it refuses to start, and nothing is written but the unstarted stamp`, async () => {
      const be = new MemoryBackend()
      await expect(boot(be, blank(bootstrap))).rejects.toBeInstanceOf(BootConfigError)
      const k = await keys(be)
      expect(Object.keys(k)).toEqual(['settings'])
      expect(k.settings).toEqual(['schema'])
      expect(readSchema(be.peek('settings', 'schema'))!.initialized).toBe(false)
    })
  }

  it('an interrupted first boot leaves nothing, and the next one makes him once', async () => {
    const be = new MemoryBackend()
    be.failNext(1000)                                     // the boot's one saved group never lands (the page is gone)
    await boot(be, blank()).catch(() => {})
    be.failNext(0)
    const k = await keys(be)
    expect(k.people).toBeUndefined()
    expect((k.settings || []).filter(s => s.startsWith('account:'))).toEqual([])
    await boot(be, blank())
    const k2 = await keys(be)
    expect(k2.people).toHaveLength(1)
    expect(k2.settings.filter(s => s.startsWith('account:'))).toHaveLength(1)
    expect(readSchema(be.peek('settings', 'schema'))!.initialized).toBe(true)
  })

  for (const [what, schema] of [
    ['a later stage', JSON.stringify({ stage: 2, dataFormatVersion: SCHEMA_VERSION, initialized: false, appliedAt: 'x', minClient: SCHEMA_VERSION })],
    ['a later format', JSON.stringify({ stage: 1, dataFormatVersion: SCHEMA_VERSION + 1, initialized: false, appliedAt: 'x', minClient: SCHEMA_VERSION + 1 })],
  ]) {
    it(`a store ahead of this build (${what}) is refused before anything is made — no first admin, nothing written`, async () => {
      const be = new MemoryBackend()
      be.seed({ settings: { schema } })
      await expect(boot(be, blank())).rejects.toBeInstanceOf(StoreAheadError)
      expect(await keys(be)).toEqual({ settings: ['schema'] })
      expect(be.peek('settings', 'schema')).toBe(schema)
    })
  }

  it('a wipe (a format below this build\'s) keeps the admin, makes nothing twice, and brings no demo back', async () => {
    const be = new MemoryBackend()
    await boot(be, blank())
    const pid = realPeople()[0]
    /* an older build's stamp: the wipe clears requests, weeks and the Leave War, keeps people and settings */
    be.seed({ settings: { schema: stamp(true, SCHEMA_VERSION - 1) } })
    await boot(be, blank())
    expect(realPeople()).toEqual([pid])
    expect(ACCOUNTS_LIST).toHaveLength(1)
    expect(INPUTS).toHaveLength(0)
    expect(rawState().wars).toHaveLength(0)
    expect(readSchema(be.peek('settings', 'schema'))!.initialized).toBe(true)
  })
})

describe('in one process, a demo boot and a blank boot never leak into each other (frozen seed copies — Fable F2-05)', () => {
  /* the whole demo, as a boot leaves it — the requests, the roster, the loaded week, the Leave War's world and the
     accounts — with the ids minted fresh at every boot (a request's, a row's, a document's) blanked out */
  const demoPicture = () => JSON.stringify({
    inputs: INPUTS, people: PEOPLE, days: DAYS, week: CURWEEK,
    wars: rawState().wars.map(w => ({ period: w.period, recs: Object.keys(w.recs).sort() })),
    ledger: rawState().ledger.map(e => e.id).sort(), openings: rawState().openings,
    accounts: ACCOUNTS_LIST,
  }).replace(/"(iid|docId|src|rid)":"[^"]*"/g, '"$1":"·"')
  it('demo → blank → demo, with the same module instances', async () => {
    await boot(new MemoryBackend(), DEMO_POLICY)
    const picture = demoPicture()
    const demo = { inputs: INPUTS.length, people: realPeople().length, wars: rawState().wars.length, waves: DAYS[0].waves.length }
    expect(demo.inputs).toBeGreaterThan(0)
    expect(demo.people).toBeGreaterThan(10)
    expect(demo.wars).toBeGreaterThan(0)
    expect(demo.waves).toBeGreaterThan(0)
    expect(signIn('ad', 'a')).toMatchObject({ kind: 'ok' })

    await boot(new MemoryBackend(), blank())
    expect(INPUTS).toHaveLength(0)
    expect(realPeople()).toHaveLength(1)
    expect(rawState().wars).toHaveLength(0)
    expect(noWaves(DAYS)).toBe(true)
    expect(signIn('ad', 'a')).toMatchObject({ kind: 'new' })

    await boot(new MemoryBackend(), DEMO_POLICY)
    expect({ inputs: INPUTS.length, people: realPeople().length, wars: rawState().wars.length, waves: DAYS[0].waves.length }).toEqual(demo)
    expect(demoPicture()).toBe(picture)
    expect(PEOPLE.stiff).toBeTruthy()
    expect(signIn('ad', 'a')).toMatchObject({ kind: 'ok' })
    expect(noWaves(weekBundle('20/07/2026').days)).toBe(false)
  })

  it('two blank stores in a row: the second holds only its own first admin', async () => {
    await boot(new MemoryBackend(), blank())
    await boot(new MemoryBackend(), blank({ principal: 'two@unit.example', person: { cs: 'Second', ini: '', seat: 'RCP', cat: 'B' } }))
    const people = realPeople()
    expect(people).toHaveLength(1)
    expect(PEOPLE[people[0]].cs).toBe('Second')
    expect(ACCOUNTS_LIST.map(a => a.name)).toEqual(['two@unit.example'])
  })

  it('the boot week is the one the app opens on, whatever week the last boot left loaded', async () => {
    await boot(new MemoryBackend(), DEMO_POLICY)
    const week = CURWEEK
    loadWeek('20/07/2026')
    await boot(new MemoryBackend(), blank())
    expect(CURWEEK).toBe(week)
  })
})

describe('a started store is read as it stands, under either policy', () => {
  const started = () => {
    const be = new MemoryBackend()
    be.seed({
      settings: {
        schema: stamp(true),
        'account:a1': JSON.stringify({ id: 'a1', name: 'lead@unit.example', role: 'admin', pid: 'p1', on: true }),
      },
      people: { p1: JSON.stringify({ cs: 'Lead', initials: 'LD', seat: 'FCP', q: 'IP', flight: '-', ord: 1024 }) },
      inputs: { i1: JSON.stringify({ iid: 'i1', ord: 1024, person: 'p1', date: 'Jul 14', yr: 2026, allday: true, type: 'LL', remarks: 'x', mod: '2026-07-01' }) },
    })
    return be
  }
  for (const [name, policy] of [['demo', DEMO_POLICY], ['blank', blank()]] as Array<[string, BootPolicy]>) {
    it(`${name}: exactly what is stored — its request, its person, its account; no demo, no first admin`, async () => {
      const be = started()
      const before = JSON.stringify(await be.loadAll())
      await boot(be, policy)
      expect(INPUTS.map((r: any) => r.iid)).toEqual(['i1'])
      expect(realPeople()).toEqual(['p1'])
      expect(ACCOUNTS_LIST.map(a => a.id)).toEqual(['a1'])
      expect(rawState().wars).toHaveLength(0)
      expect(JSON.stringify(await be.loadAll())).toBe(before)
    })
  }

  it('no account rows: the demo policy reads the seeded list (as today); the blank one reads none', async () => {
    const seedOnly = () => { const be = new MemoryBackend(); be.seed({ settings: { schema: stamp(true) } }); return be }
    await boot(seedOnly(), DEMO_POLICY)
    expect(ACCOUNTS_LIST.map(a => a.name)).toContain('ad')
    await boot(seedOnly(), blank())
    expect(ACCOUNTS_LIST).toEqual([])
  })

  it('a stored list with no admin who can sign in: the demo re-adds its admin (as today); a shared store never does', async () => {
    const lockedOut = () => {
      const be = new MemoryBackend()
      be.seed({
        settings: { schema: stamp(true), 'account:a1': JSON.stringify({ id: 'a1', name: 'lead@unit.example', role: 'admin', pid: 'p1', on: false }) },
        people: { p1: JSON.stringify({ cs: 'Lead', initials: 'LD', seat: 'FCP', q: 'IP', flight: '-', ord: 1024 }) },
      })
      return be
    }
    await boot(lockedOut(), DEMO_POLICY)
    expect(ACCOUNTS_LIST.map(a => a.name)).toContain('ad')
    await boot(lockedOut(), blank())
    expect(ACCOUNTS_LIST.map(a => a.name)).toEqual(['lead@unit.example'])
  })
})

describe('the landing pass is not a demo pass (P5-LANDING — Fable F3-04)', () => {
  it('a shared store: a real request filed on a week nobody has opened lands on its day when the week is opened', async () => {
    const be = new MemoryBackend()
    await boot(be, blank())
    const pid = realPeople()[0]
    /* a member filed it from another browser: its row is in the store before this client boots */
    be.seed({ inputs: { itest: JSON.stringify({ iid: 'itest', ord: 1024, person: pid, date: 'Jul 22', yr: 2026, allday: false, s: 840, e: 960, type: 'Appointment', remarks: 'Dental', mod: '2026-07-20' }) } })
    await boot(be, blank())
    loadWeek('20/07/2026')
    const row = INPUTS.find((r: any) => r.iid === 'itest')
    expect(row.acc).toBe('g')
    expect(DAYS[2].ground.some((g: any) => g.src === 'itest')).toBe(true)
  })
})
