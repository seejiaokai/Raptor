/* SCHEMA CONFORMANCE — the live seed data against the shapes schema.ts
   declares (Part C of the schema-hardening design). PEOPLE, INPUTS, DAYS,
   SCHED and the two week snapshots are `any` in the engine, so the compiler
   cannot see a field the seed grew that nobody declared. This file can: a
   tiny structural checker (below, no dependency) walks every record and
   fails with the exact path of an UNKNOWN field or a wrong primitive — so
   the types and the data cannot drift apart without a red test.

   New file, ordinary TS style (see the header of schema.ts). */
import { afterAll, describe, expect, it } from 'vitest'
import { PEOPLE, QORDER } from './people'
import { INPUTS, INPUT_META } from './inputs'
import { DAYS } from './data'
import { WEEK2_DAYS } from './week2'
import { SCHED } from './publish'
import { VCONF, SHIFT_HARD } from './rules'
import { SECTIONS } from './order'
import { INPUT_TYPES, QLEVELS, SEATS, SECTION_KEYS, SHIFT_KINDS, VCONF_KEYS } from './schema'
import type { Day, Input, Person } from './schema'
import { makeStandalone } from './waves'
import { WAVETPL_CFG, addWaveTpl, addWaveTplLine, setWaveTplLine, waveFromTpl, waveTplReset } from './wavetpl'
import { DUTYTPL_CFG, addTpl, setTplWave, blockFromTpl, dutyTplReset } from './dutytpl'
import { inpId } from './inputs'
import { alIssue, markEdit } from './publish'

/* ---- the mini-DSL --------------------------------------------------------
   'string' | 'number' | 'boolean'   a primitive; a trailing '?' allows absent
   [spec]                            an array whose every element is spec
   { field: spec, ... }              an exact object: an undeclared key FAILS
   { $or: [spec, ...] }              any one of the specs
   { $lit: [v, ...] }                one of the literal values
   { $map: spec }                    a record with any keys, every value spec
   { $opt: spec }                    absent (undefined) or spec
   The checker collects every failure as `path: message` rather than stopping
   at the first, so one run reports every drift in a seed. */
type Spec = string | Spec[] | { [k: string]: Spec } | { $or: Spec[] } | { $lit: readonly unknown[] } | { $map: Spec } | { $opt: Spec }

const isObj = (v: unknown): v is Record<string, unknown> => !!v && typeof v === 'object' && !Array.isArray(v)
const show = (v: unknown) => v === null ? 'null' : Array.isArray(v) ? 'array' : typeof v
const describe_ = (s: Spec): string =>
  typeof s === 'string' ? s
  : Array.isArray(s) ? `array of ${describe_(s[0])}`
  : '$or' in s ? (s.$or as Spec[]).map(describe_).join('|')
  : '$lit' in s ? `one of ${(s.$lit as unknown[]).map(x => JSON.stringify(x)).join('|')}`
  : '$map' in s ? `record of ${describe_(s.$map as Spec)}`
  : '$opt' in s ? `optional ${describe_(s.$opt as Spec)}`
  : 'object'

function check(v: unknown, spec: Spec, path: string, errs: string[]) {
  const fail = () => errs.push(`${path}: expected ${describe_(spec)}, got ${show(v)}`)
  if (typeof spec === 'string') {
    const opt = spec.endsWith('?'), t = opt ? spec.slice(0, -1) : spec
    if (v === undefined) { if (!opt) fail(); return }
    if (typeof v !== t) fail()
    return
  }
  if (Array.isArray(spec)) {
    if (!Array.isArray(v)) return fail()
    v.forEach((x, i) => check(x, spec[0], `${path}[${i}]`, errs))
    return
  }
  if ('$opt' in spec) { if (v !== undefined) check(v, spec.$opt as Spec, path, errs); return }
  if ('$lit' in spec) { if (!(spec.$lit as unknown[]).includes(v)) fail(); return }
  if ('$or' in spec) {
    const ok = (spec.$or as Spec[]).some(s => { const e: string[] = []; check(v, s, path, e); return !e.length })
    if (!ok) fail()
    return
  }
  if ('$map' in spec) {
    if (!isObj(v)) return fail()
    Object.keys(v).forEach(k => check(v[k], spec.$map as Spec, `${path}.${k}`, errs))
    return
  }
  if (!isObj(v)) return fail()
  const shape = spec as { [k: string]: Spec }
  Object.keys(v).forEach(k => { if (!(k in shape)) errs.push(`${path}.${k}: unknown field`) })
  Object.keys(shape).forEach(k => check(v[k], shape[k], `${path}.${k}`, errs))
}
/* expect() on the joined list so a failure prints every path at once */
const conform = (v: unknown, spec: Spec, path: string) => { const e: string[] = []; check(v, spec, path, e); expect(e).toEqual([]) }

/* ---- the record specs (mirror schema.ts; a change there changes here) ---- */
const iflag: Spec = { $or: ['boolean', { $lit: ['I'] }] }
const QUALS: Spec = { $map: { $or: ['boolean', { $lit: ['I'] }] } }   // every key optional, admin columns land here too
const PERSON: Spec = {
  cs: 'string', seat: { $lit: SEATS }, q: { $lit: QLEVELS }, sxo: 'boolean?', initials: 'string?', flight: 'string?',
  remarks: 'string?', pers: 'boolean?', special: 'boolean?', archived: 'boolean?', san: 'boolean?',
  sanQ: { $opt: { flown: 'number', carry: 'number', missedQtrs: 'number' } },
  tf: 'boolean?', sched: 'boolean?', scDay: 'boolean?', scNight: 'boolean?', daar: { $opt: iflag }, naar: { $opt: iflag },
  quals: QUALS,
}
const inputSpec = (booted: boolean): Spec => ({
  iid: booted ? 'string' : 'string?', person: 'string', date: 'string', endDate: 'string?', yr: 'number?', allday: 'boolean',
  s: 'number?', e: 'number?', half: { $opt: { $lit: ['am', 'pm'] } }, type: { $lit: INPUT_TYPES }, remarks: 'string?',
  mod: 'string', acc: { $opt: { $lit: ['g', 'u', 'r'] } }, lw: 'string?', docId: 'string?', docIds: { $opt: ['string'] },
  oil: { $opt: { $map: { $lit: [0, 0.5, 1] } } }, sans: { $opt: { f: { $opt: { $lit: [true] } }, o: { $opt: { $lit: [true] } }, a: { $opt: { $lit: [true] } } } },
})
const FLAGS = { cx: 'boolean?', cxr: 'string?', flag: 'boolean?' }
const ALLHANDS: Spec = { ...FLAGS, prog: 'string', str: 'string', end: 'string', who: { $opt: { $or: ['string', ['string']] } }, more: { $opt: ['string'] }, info: 'boolean?' }
const GROUND: Spec = { ...(ALLHANDS as object), rmks: 'string?', src: 'string?' }
const SAKIND: Spec = { $lit: ['sc', 'avalon', 'bb'] }
const SEAT: Spec = { ...FLAGS, p: 'string', w: 'string', area: 'string', rmks: 'string', opts: { $map: { $or: ['boolean', 'string'] } }, spare: 'boolean?', role: { $opt: { $lit: ['MAIN', 'SPARE'] } } }
const FORMATION: Spec = { cs: 'string', msn: 'string', shift: 'string?', to: 'string', ld: 'string', br: 'string?', area: 'string?', atime: 'string?', aircraft: [SEAT], cx: 'boolean?', cxr: 'string?' }
const WAVE: Spec = { label: 'string', night: 'boolean', intimes: ['string'], traffic: ['string'], formations: [FORMATION], standalone: 'boolean?', kind: { $opt: SAKIND }, noconf: 'boolean?' }
const SIM: Spec = { ...FLAGS, label: 'string', str: 'string', end: 'string', rmks: 'string?', p: 'string?', w: 'string?', pax: { $opt: ['string'] }, who: 'string?', more: { $opt: ['string'] } }
const DUTYROW: Spec = { ...FLAGS, role: 'string', id: 'string', str: 'string', end: 'string', more: { $opt: ['string'] } }
const DUTYBLOCK: Spec = { label: 'string', rows: [DUTYROW], sa: { $opt: SAKIND }, noconf: 'boolean?' }
const DAY: Spec = {
  dow: 'string', dt: 'string', wc: 'string', today: 'boolean?', notes: ['string'], allhands: [ALLHANDS], waves: [WAVE],
  sims: { amt: [SIM], oft: [SIM] }, dutywaves: [DUTYBLOCK], ground: [GROUND],
  simnotes: 'string?', prognotes: 'string?', dutynotes: 'string?', grndnotes: 'string?', secOrder: { $opt: ['string'] }, gman: 'boolean?',
}
const SIGNSET: Spec = { cur: 'string', sked: 'string', plan: 'string', appr: 'string' }
const DAYSNAP: Spec = { d: DAY, c: { $map: 'number' } }
const AL: Spec = { n: 'number', keys: ['string'], sign: { $map: SIGNSET }, days: ['number'], n0: 'number', adds: ['string'], structAdds: ['string'], snap: { $opt: { $map: DAYSNAP } } }
const ONE: Spec = { $lit: [1] }
const SCHED_SPEC: Spec = {
  al: 'number', pending: { $map: ONE }, changes: { $map: 'number' }, added: { $map: ONE }, als: [AL], dayOK: { $map: ONE },
  sign: { $map: SIGNSET }, orig: { $map: DAYSNAP }, cur: { $map: { $or: ['number', { $lit: ['orig'] }] } },
  drafts: { $opt: { $map: [{ id: 'string', name: 'string', d: DAY }] } }, curDraft: { $opt: { $map: 'string' } },
}
const SCHED_FIELDS = {
  c: { $map: 'number' }, p: { $map: ONE }, ad: { $map: ONE }, a: [AL], al: 'number', ok: { $map: ONE }, sg: { $map: SIGNSET },
  o: { $map: DAYSNAP }, cv: { $map: { $or: ['number', { $lit: ['orig'] }] } },
  dr: { $opt: { $map: [{ id: 'string', name: 'string', d: DAY }] } }, cd: { $opt: { $map: 'string' } },
}
const PUCK: Spec = { $or: [
  { id: 'string', date: 'string', kind: { $opt: { $lit: ['note'] } }, text: 'string' },
  { id: 'string', date: 'string', kind: { $lit: ['pucks'] }, ids: ['string'] },
] }
const WEEK_SNAP: Spec = { ...SCHED_FIELDS, d: [DAY], i: [inputSpec(true)], wo: ['string'], pp: [PUCK], dm: { $map: 'string' } }
const STASH_SNAP: Spec = { ...SCHED_FIELDS, d: [DAY], wo: ['string'], un: ['string'] }

/* pristine copies, taken at import before any test boots the store: the
   seed literals are what the reference-parity harness reads, and this file
   must judge them as authored, not as initStore leaves them */
const clone = <T,>(v: T): T => JSON.parse(JSON.stringify(v))
const DAYS0 = clone(DAYS), INPUTS0 = clone(INPUTS), SCHED0 = clone(SCHED), WEEK2 = clone(WEEK2_DAYS)

describe('the structural checker itself', () => {
  it('names the exact path of an unknown field and of a wrong primitive', () => {
    const d = clone(DAYS0[0])
    d.waves[0].formations[0].aircraft[0].bogus = 1          // a field nobody declared
    d.waves[0].formations[0].aircraft[0].opts.tk2 = 7       // a store toggle that is neither boolean nor string
    d.ground.push({ prog: 'X', str: '', end: '' })          // fine — proves the walk goes on past a failure
    const e: string[] = []
    check(d, DAY, 'DAYS[0]', e)
    expect(e).toEqual([
      'DAYS[0].waves[0].formations[0].aircraft[0].bogus: unknown field',
      'DAYS[0].waves[0].formations[0].aircraft[0].opts.tk2: expected boolean|string, got number',
    ])
  })
  it('reports a missing required field, a bad literal and a bad array element', () => {
    const e: string[] = []
    check({ cs: 'X', seat: 'LEFT', q: 'IP', quals: {} }, PERSON, 'P', e)
    check(['a', 2], ['string'], 'L', e)
    expect(e).toEqual([
      'P.seat: expected one of "FCP"|"RCP"|"GND", got string',
      'L[1]: expected string, got number',
    ])
  })
})

describe('the const literal unions match the live catalogues', () => {
  /* the unions in schema.ts are hand-typed copies of keys that live in `any`
     objects; these pins are what stop the two spellings drifting */
  it('INPUT_TYPES = INPUT_META keys', () => expect([...INPUT_TYPES]).toEqual(Object.keys(INPUT_META)))
  it('VCONF_KEYS = VCONF keys', () => expect([...VCONF_KEYS].sort()).toEqual(Object.keys(VCONF).sort()))
  it('SHIFT_KINDS = SHIFT_HARD keys', () => expect([...SHIFT_KINDS]).toEqual(Object.keys(SHIFT_HARD)))
  it('SECTION_KEYS = SECTIONS', () => expect([...SECTION_KEYS]).toEqual(SECTIONS))
  it('QLEVELS = the CAT ladder plus the ground-crew blank', () => expect([...QLEVELS]).toEqual([...Object.keys(QORDER), '']))
})

describe('the seed records conform', () => {
  it('PEOPLE — every person, and every one carries derived quals', () => {
    conform(PEOPLE, { $map: PERSON }, 'PEOPLE')
    Object.keys(PEOPLE).forEach(id => expect(isObj(PEOPLE[id].quals), `PEOPLE.${id}.quals`).toBe(true))
  })
  it('INPUTS (pristine, before iids are minted)', () => conform(INPUTS0, [inputSpec(false)], 'INPUTS'))
  it('DAYS', () => conform(DAYS0, [DAY], 'DAYS'))
  it('WEEK2_DAYS', () => conform(WEEK2, [DAY], 'WEEK2_DAYS'))
  it('the initial SCHED', () => conform(SCHED0, SCHED_SPEC, 'SCHED'))
})

describe('every person reference in the seed resolves', () => {
  /* p / w / id / pax[] / more[] are ids or ''. `who` on a programme, ground
     or sim row may be free text ('EXT SQN'), so it cannot be required to
     resolve — but a value shaped like an id (lowercase word) is one, and a
     typo there would silently schedule nobody. */
  const idish = /^[a-z][a-z0-9]*$/
  const must = (v: unknown, path: string, errs: string[]) => { if (v !== '' && !PEOPLE[v as string]) errs.push(`${path}: '${String(v)}' is not a PEOPLE id`) }
  const who = (v: unknown, path: string, errs: string[]) => {
    const list = Array.isArray(v) ? v : v === undefined ? [] : [v]
    list.forEach((x, i) => { if (typeof x === 'string' && idish.test(x) && !PEOPLE[x]) errs.push(`${path}${Array.isArray(v) ? `[${i}]` : ''}: '${x}' looks like an id but is not a PEOPLE id`) })
  }
  const walk = (days: Day[], name: string) => {
    const errs: string[] = []
    days.forEach((d, di) => {
      const P = `${name}[${di}]`
      d.allhands.forEach((r, i) => { who(r.who, `${P}.allhands[${i}].who`, errs); (r.more || []).forEach((m, j) => must(m, `${P}.allhands[${i}].more[${j}]`, errs)) })
      d.ground.forEach((r, i) => { who(r.who, `${P}.ground[${i}].who`, errs); (r.more || []).forEach((m, j) => must(m, `${P}.ground[${i}].more[${j}]`, errs)) })
      d.waves.forEach((w, wi) => w.formations.forEach((f, fi) => f.aircraft.forEach((a, ai) => {
        must(a.p, `${P}.waves[${wi}].formations[${fi}].aircraft[${ai}].p`, errs)
        must(a.w, `${P}.waves[${wi}].formations[${fi}].aircraft[${ai}].w`, errs)
      })))
      ;(['amt', 'oft'] as const).forEach(k => d.sims[k].forEach((r, i) => {
        const Q = `${P}.sims.${k}[${i}]`
        if (r.p !== undefined) must(r.p, `${Q}.p`, errs)
        if (r.w !== undefined) must(r.w, `${Q}.w`, errs)
        ;(r.pax || []).forEach((x, j) => must(x, `${Q}.pax[${j}]`, errs))
        who(r.who, `${Q}.who`, errs)
      }))
      d.dutywaves.forEach((b, bi) => b.rows.forEach((r, ri) => must(r.id, `${P}.dutywaves[${bi}].rows[${ri}].id`, errs)))
    })
    expect(errs).toEqual([])
  }
  it('DAYS', () => walk(DAYS0, 'DAYS'))
  it('WEEK2_DAYS', () => walk(WEEK2, 'WEEK2_DAYS'))
  it('INPUTS.person', () => {
    const errs: string[] = []
    ;(INPUTS0 as Input[]).forEach((r, i) => must(r.person, `INPUTS[${i}].person`, errs))
    expect(errs).toEqual([])
  })
})

describe('after boot', () => {
  /* initStore merges the other weeks' inputs and the demo seeds, mints every
     iid, lands the activity inputs and takes the first history snapshot —
     the snapshots are only real once it has run. Imported lazily so the
     pristine copies above are taken before the store wires anything. */
  it('histSnap() and weekStashSnap() conform, every input has an iid', async () => {
    const { initStore, weekStashSnap } = await import('../state/store')
    const { histSnap } = await import('../state/history')
    initStore()
    conform(JSON.parse(histSnap()), WEEK_SNAP, 'histSnap')
    conform(JSON.parse(weekStashSnap()), STASH_SNAP, 'weekStashSnap')
    conform(INPUTS, [inputSpec(true)], 'INPUTS')
    conform(DAYS, [DAY], 'DAYS')
    conform(SCHED, SCHED_SPEC, 'SCHED')
    Object.keys(PEOPLE).forEach(id => expect(isObj(PEOPLE[id].quals), `PEOPLE.${id}.quals`).toBe(true))
  })
})

describe('after edits — fields the seeds never carry', () => {
  /* Review, 9 Sep 26: everything above judges data as SHIPPED or as BOOTED.
     Most fields the app writes arrive later — a minted wave or duty block, a
     typed-over area strip, a synced leave, an issued amendment — and the
     checker could not see them (it missed `area`/`atime` and the type of
     `lw` on day one). These cases build those records the way the app does,
     headlessly, and hold them to the same specs. LAST in the file: case (e)
     publishes the live SCHED, and nothing may follow it. */
  afterAll(() => { waveTplReset(); dutyTplReset() })

  it('a minted standalone wave, per kind', () => {
    for (const k of ['sc', 'avalon', 'bb'] as const) conform(makeStandalone(k), WAVE, `makeStandalone(${k})`)
  })
  it('a wave minted from a template, per kind, and a standby template with a spare line', () => {
    for (const k of ['fly', 'sc', 'avalon', 'bb'] as const) {
      const t = addWaveTpl('T ' + k, k)!
      if (k === 'sc') { addWaveTplLine(t.id); setWaveTplLine(t.id, 1, 'spare', true) }
      conform(waveFromTpl(t.id), WAVE, `waveFromTpl(${k})`)
    }
    expect(WAVETPL_CFG.length).toBe(4)
  })
  it('a duty block minted from the standard set and from an AVALON template', () => {
    conform(blockFromTpl(DUTYTPL_CFG[0].id), DUTYBLOCK, 'blockFromTpl(std)')
    const t = addTpl('N')!; setTplWave(t.id, 'avalon')
    const b = blockFromTpl(t.id)
    conform(b, DUTYBLOCK, 'blockFromTpl(avalon)')
    expect(b.sa).toBe('avalon'); expect(b.noconf).toBe(true)
  })
  it('a formation with a typed-over area strip (ui/textedit.ts)', () => {
    const f = clone(DAYS0[0]).waves[0].formations[0]
    f.area = 'NORTH'; f.atime = '0800-0900'
    conform(f, FORMATION, 'formation+area')
  })
  it('a leave synced from the Leave War carries the war id as its lw tag (leavewar/sync.ts)', () => {
    const row: any = { person: 'bane', type: 'LL', date: 'Jul 13', yr: 2026, allday: true, remarks: '', mod: 'now', lw: 'y2026' }
    inpId(row)
    conform(row, inputSpec(true), 'synced leave')
  })
  it('an issued amendment: SCHED, the AL and the day snapshots conform', async () => {
    const { histSnap } = await import('../state/history')
    markEdit('dn:0.0'); alIssue(1, ['dn:0.0'])
    expect(SCHED.al).toBe(1); expect(SCHED.cur[0]).toBe(1)
    conform(SCHED, SCHED_SPEC, 'SCHED after AL 1')
    conform(JSON.parse(histSnap()), WEEK_SNAP, 'histSnap after AL 1')
  })
})

/* type-level sanity, checked by `tsc -b` (tests are in tsconfig.app.json):
   a literal must satisfy the declared type, so a new required field or a
   narrowed union fails the build. (The live exports are `any`; assigning one
   to a type proves nothing, which is why no such line is here.) */
;({ cs: 'X', seat: 'FCP', q: 'A', quals: {} }) satisfies Person
;({ person: 'x', date: 'Jul 1', allday: true, type: 'LL', mod: 'now' }) satisfies Input
;({ dow: 'Mon', dt: '1 Jul', wc: '', notes: [], allhands: [], waves: [], sims: { amt: [], oft: [] }, dutywaves: [], ground: [] }) satisfies Day
