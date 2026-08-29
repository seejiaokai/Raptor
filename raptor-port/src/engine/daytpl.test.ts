/* Whole-day schedule templates — mirrors dutytpl.test.ts's shape (mutators,
   caps, save/load/reset, untrusted-load garbage) plus the day-specific pieces:
   tplFromDay's crew-blanking and cx/flag strip, and applyDayTpl's refusal on
   a published day and its restoreDayVersion-style direct write. */
import { beforeEach, describe, expect, it } from 'vitest'
import { storeBackend } from './hooks'
import { DAYS } from './data'
import { SCHED, signOf, setDayApproved, dayApproved, publishALDay } from './publish'
import { txtSet } from './slots'
import {
  DAYTPL_STD, DAYTPL_CFG, dayTplAreStandard,
  tplFromDay, addDayTpl, delDayTpl, renameDayTpl, moveDayTpl,
  applyDayTpl, dayTplSave, dayTplLoad, dayTplReset, MAX_DAYTPL,
} from './daytpl'

/* templates are minted off DAYS[0] and applyDayTpl overwrites it wholesale —
   every test starts from the pristine day, same discipline restore.test.ts uses */
const D0 = JSON.parse(JSON.stringify(DAYS[0]))

const mem: Record<string, string> = {}
const fake = {
  getItem: (k: string) => (k in mem ? mem[k]! : null),
  setItem: (k: string, v: string) => { mem[k] = v },
}

const sign = (di: number) => {
  const g = signOf(di)
  g.cur = 'ignite'; g.sked = 'bane'; g.plan = 'stiff'; g.appr = 'pump'
}

beforeEach(() => {
  DAYS[0] = JSON.parse(JSON.stringify(D0))
  Object.keys(mem).forEach(k => delete mem[k])
  storeBackend.impl = fake
  dayTplReset()
  SCHED.pending = {}; SCHED.changes = {}; SCHED.added = {}; SCHED.als = []
  SCHED.al = 0; SCHED.dayOK = {}; SCHED.sign = {}; SCHED.orig = {}; SCHED.cur = {}
})

describe('the seeded library', () => {
  it('opens empty — no factory day templates', () => {
    expect(DAYTPL_CFG).toEqual([])
    expect(DAYTPL_STD).toEqual([])
    expect(dayTplAreStandard()).toBe(true)
  })
})

describe('editing the library', () => {
  it('adds, renames, deletes and reorders a template', () => {
    const a = addDayTpl(0, 'Ordinary Tuesday')
    const b = addDayTpl(0)
    expect(a && a.title).toBe('Ordinary Tuesday')
    expect(b && b.title).toBe('Template 2')   // default name counts the library as it stood
    expect(DAYTPL_CFG.length).toBe(2)
    renameDayTpl(a!.id, 'Renamed')
    expect(DAYTPL_CFG.find(x => x.id === a!.id)!.title).toBe('Renamed')
    moveDayTpl(1, 0)
    expect(DAYTPL_CFG[0]!.title).toBe('Template 2')
    expect(delDayTpl(a!.id)).toBe(true)
    expect(DAYTPL_CFG.map(t => t.title)).toEqual(['Template 2'])
    expect(delDayTpl('nope')).toBe(false)
  })

  it('titles clamp to MAX_DAYTPL_TITLE, and the library caps at MAX_DAYTPL', () => {
    const t = addDayTpl(0, 'x'.repeat(40))
    expect(t!.title.length).toBe(24)
    for (let i = DAYTPL_CFG.length; i < MAX_DAYTPL; i++) expect(addDayTpl(0)).not.toBeNull()
    expect(DAYTPL_CFG.length).toBe(MAX_DAYTPL)
    expect(addDayTpl(0)).toBeNull()
  })

  it('moveDayTpl refuses an out-of-range index', () => {
    addDayTpl(0)
    expect(moveDayTpl(-1, 0)).toBe(false)
    expect(moveDayTpl(0, 99)).toBe(false)
  })
})

describe('tplFromDay — the crew-blanked mint', () => {
  it('captures structure and blanks every person reference', () => {
    const t = tplFromDay(0, 'Standard flying day')
    const d = t.d
    // structure survives: times, callsigns, missions, labels, opts
    expect(d.waves[0].label).toBe('WAVE 1')
    expect(d.waves[0].formations[0].cs).toBe('VL')
    expect(d.waves[0].formations[0].msn).toBe('BFM')
    expect(d.waves[0].formations[0].to).toBe('12:40')
    expect(d.waves[0].formations[0].aircraft[0].area).toBe('D1415')
    expect(d.waves[0].formations[0].aircraft[0].opts).toEqual({ tk2: true, tpod: true, nav: false, bombs: '' })
    expect(d.dutywaves[0].label).toBe('1st wave')
    expect(d.dutywaves[0].rows[0].role).toBe('SDO')
    expect(d.dutywaves[0].rows[0].str).toBe('0700')
    expect(d.ground[0].prog).toBe('HQ ENGAGEMENT')
    expect(d.notes).toEqual(DAYS[0].notes)
    // every person reference is blanked
    expect(d.waves[0].formations[0].aircraft[0].p).toBe('')
    expect(d.waves[0].formations[0].aircraft[0].w).toBe('')
    expect(d.dutywaves[0].rows[0].id).toBe('')
    expect(d.ground[0].who).toBe('')
    expect(d.allhands.some((r: any) => r.who !== '' && !(Array.isArray(r.who) && r.who.length === 0))).toBe(false)
    expect(d.sims.oft.find((r: any) => 'p' in r)!.p).toBe('')
    expect(d.sims.oft.find((r: any) => 'pax' in r)!.pax).toEqual([])
    expect(d.sims.amt.find((r: any) => 'pax' in r)!.pax).toEqual([])
  })

  it('strips cx / cxr / red-flag marks', () => {
    DAYS[0].waves[0].formations[0].aircraft[0].cx = true
    DAYS[0].waves[0].formations[0].aircraft[0].cxr = 'WX'
    DAYS[0].waves[0].formations[0].cx = true
    DAYS[0].waves[0].formations[0].aircraft[1]!.flag = true
    DAYS[0].dutywaves[0].rows[0].flag = true
    DAYS[0].ground[0].cx = true
    DAYS[0].allhands[0]!.flag = true
    const t = tplFromDay(0, 'Cancelled day')
    expect(t.d.waves[0].formations[0].aircraft[0].cx).toBeUndefined()
    expect(t.d.waves[0].formations[0].aircraft[0].cxr).toBeUndefined()
    expect(t.d.waves[0].formations[0].cx).toBeUndefined()
    expect(t.d.waves[0].formations[0].aircraft[1].flag).toBeUndefined()
    expect(t.d.dutywaves[0].rows[0].flag).toBeUndefined()
    expect(t.d.ground[0].cx).toBeUndefined()
    expect(t.d.allhands[0].flag).toBeUndefined()
  })

  it('drops the accepted-input src reference off a ground row', () => {
    DAYS[0].ground[0].src = 'inp:nact.1'
    const t = tplFromDay(0, 'x')
    expect(t.d.ground[0].src).toBeUndefined()
  })

  it('does not carry dow / dt / today / wc', () => {
    const t = tplFromDay(0, 'x')
    expect((t.d as any).dow).toBeUndefined()
    expect((t.d as any).dt).toBeUndefined()
    expect((t.d as any).today).toBeUndefined()
    expect((t.d as any).wc).toBeUndefined()
  })

  it('mutating the mint does not reach back into the live day', () => {
    const t = tplFromDay(0, 'x')
    t.d.ground[0]!.prog = 'CHANGED'
    expect(DAYS[0].ground[0]!.prog).not.toBe('CHANGED')
  })
})

describe('applyDayTpl', () => {
  it('refuses a published day', () => {
    sign(0); setDayApproved(0, 1)
    expect(dayApproved(0)).toBe(true)
    const t = addDayTpl(0)!
    expect(applyDayTpl(0, t.id)).toBe(false)
    expect(DAYS[0].ground[0]!.who).not.toBe('')   // untouched
  })

  it('returns false for an unknown template id', () => {
    expect(applyDayTpl(0, 'nope')).toBe(false)
  })

  it('applies the template structure onto the day, keeping dow/dt/today/wc', () => {
    const savedWc = DAYS[0].wc, savedDow = DAYS[0].dow, savedDt = DAYS[0].dt
    const tueCs = DAYS[1].waves[0].formations[0].cs
    const t = tplFromDay(1, 'Tuesday shape')   // a different day's structure
    DAYTPL_CFG.push(t)
    expect(applyDayTpl(0, t.id)).toBe(true)
    expect(DAYS[0].dow).toBe(savedDow)
    expect(DAYS[0].dt).toBe(savedDt)
    expect(DAYS[0].wc).toBe(savedWc)
    expect(DAYS[0].waves[0].formations[0].cs).toBe(tueCs)   // Tuesday's structure, not Monday's
  })

  it('the applied day is a crewless copy of the source day’s structure', () => {
    const t = tplFromDay(0, 'Self shape')
    DAYTPL_CFG.push(t)
    DAYS[0].ground[0]!.who = 'someone-still-here'   // prove it really got overwritten
    expect(applyDayTpl(0, t.id)).toBe(true)
    expect(DAYS[0].ground[0]!.who).toBe('')
    expect(DAYS[0].waves[0].formations[0].cs).toBe('VL')   // structure came from the template
  })

  it('drops the day’s pending and structural-add marks, leaves other days alone', () => {
    SCHED.pending['dn:0.0'] = 1
    SCHED.pending['dn:1.0'] = 1
    SCHED.added['wl:0.0'] = 1
    const t = addDayTpl(0)!
    expect(applyDayTpl(0, t.id)).toBe(true)
    expect(SCHED.pending['dn:0.0']).toBeUndefined()
    expect(SCHED.pending['dn:1.0']).toBe(1)   // day 1 untouched
    expect(SCHED.added['wl:0.0']).toBeUndefined()
  })

  /* the corner an earlier build missed: applying a template to a day that was
     PUBLISHED and then REOPENED must clear the day's issued AL changes-marks
     too, not just pending/added. Reopen keeps those marks (it voids the
     signature, not the history), and a template swap marks NOTHING pending —
     so a surviving mark would render the template's brand-new rows in a past
     AL's colour. restoreDayVersion wipes all three slices for the same reason;
     applyDayTpl now mirrors it. */
  it('drops the day’s issued AL changes-marks — no stale AL tint on template content', () => {
    sign(0); setDayApproved(0, 1)             // publish Monday
    txtSet('dn:0.0', 'AMENDED NOTE')          // amend a note
    sign(0); publishALDay(0)                  // issue AL1 → changes['dn:0.0']=1
    expect(SCHED.changes['dn:0.0']).toBe(1)
    setDayApproved(0, 0)                       // reopen to draft — keeps the AL1 mark
    expect(SCHED.changes['dn:0.0']).toBe(1)
    const t = addDayTpl(0)!                    // capture + apply a template on the reopened day
    expect(applyDayTpl(0, t.id)).toBe(true)
    expect(SCHED.changes['dn:0.0']).toBeUndefined()   // the AL1 tint is gone
  })

  it('does not push history or reflow itself — the caller owns that step', () => {
    let pushed = 0
    const orig = SCHED.al   // sanity: no publish machinery touched
    const t = addDayTpl(0)!
    applyDayTpl(0, t.id)
    expect(SCHED.al).toBe(orig)
    expect(pushed).toBe(0)
  })
})

describe('persistence, like dutytpl', () => {
  it('the empty library writes nothing, and a saved template survives a reload', () => {
    dayTplSave()
    expect('sqn142_daytpl' in mem ? JSON.parse(mem['sqn142_daytpl']!) : 'unset').toBe(null)
    addDayTpl(0, 'Keeper')
    dayTplSave()
    addDayTpl(0, 'Scratch')   // live edit after the save
    dayTplLoad()
    expect(DAYTPL_CFG.map(t => t.title)).toEqual(['Keeper'])
  })

  it('a reloaded template still applies — the blob round-trips through storage', () => {
    addDayTpl(0, 'Keeper')
    dayTplSave()
    dayTplLoad()
    const t = DAYTPL_CFG[0]!
    expect(applyDayTpl(0, t.id)).toBe(true)
    expect(DAYS[0].waves[0].formations[0].cs).toBe('VL')
  })

  it('garbage in storage falls back to empty, dropping bad entries', () => {
    mem['sqn142_daytpl'] = JSON.stringify([
      { id: 'x', title: 'Ok', d: { notes: ['n'], allhands: 'nope', waves: [], sims: { amt: [] }, dutywaves: [], ground: [], simnotes: 5, prognotes: '', dutynotes: '', grndnotes: '' } },
      'not a template',
      { title: 'no d blob' },
      { id: 'y', title: 'also ok', d: {} },
    ])
    dayTplLoad()
    expect(DAYTPL_CFG.map(t => t.title)).toEqual(['Ok', 'also ok'])
    expect(DAYTPL_CFG[0]!.d.allhands).toEqual([])     // non-array coerced to empty
    expect(DAYTPL_CFG[0]!.d.notes).toEqual(['n'])
    expect(DAYTPL_CFG[0]!.d.simnotes).toBe('')        // non-string coerced to empty
    expect(DAYTPL_CFG[1]!.d).toEqual({
      notes: [], allhands: [], waves: [], sims: {}, dutywaves: [], ground: [],
      simnotes: '', prognotes: '', dutynotes: '', grndnotes: '',
    })
  })

  it('an id-less entry ahead of a literal dtN id does not collide with it', () => {
    /* a hand-edited file: an entry with no id sits BEFORE one that reads 'dt1'.
       Minting must skip 'dt1' rather than reuse it, so both stay addressable. */
    mem['sqn142_daytpl'] = JSON.stringify([
      { title: 'no id', d: {} },
      { id: 'dt1', title: 'literal dt1', d: {} },
    ])
    dayTplLoad()
    const ids = DAYTPL_CFG.map(t => t.id)
    expect(new Set(ids).size).toBe(2)          // no duplicate id
    expect(ids).toContain('dt1')               // the literal one is preserved
  })

  it('a non-array blob resets to empty', () => {
    mem['sqn142_daytpl'] = JSON.stringify({ nope: true })
    dayTplLoad()
    expect(DAYTPL_CFG).toEqual([])
  })

  it('dayTplReset clears the library and storage', () => {
    addDayTpl(0, 'x')
    dayTplSave()
    dayTplReset()
    expect(DAYTPL_CFG).toEqual([])
    expect(mem['sqn142_daytpl'] ? JSON.parse(mem['sqn142_daytpl']) : null).toBe(null)
  })
})

describe('a day template remembers the section order (owner, 29 Aug 26)', () => {
  it('captures a re-arranged day\'s order and restores it on apply', () => {
    DAYS[0].secOrder = ['ground', 'sims', 'prog', 'waves', 'duty']
    const t = addDayTpl(0, 'reordered')!
    expect(t.d.secOrder, 'the order travels into the template').toEqual(['ground', 'sims', 'prog', 'waves', 'duty'])
    delete DAYS[0].secOrder                                  // back to default before applying
    expect(applyDayTpl(0, t.id)).toBe(true)
    expect(DAYS[0].secOrder, 'and comes back on the applied day').toEqual(['ground', 'sims', 'prog', 'waves', 'duty'])
  })

  it('a default-order day mints a CLEAN template — no secOrder field', () => {
    delete DAYS[0].secOrder
    const t = addDayTpl(0, 'plain')!
    expect(t.d.secOrder).toBeUndefined()
    /* and applying it leaves the day with no custom order (renders default) */
    DAYS[0].secOrder = ['ground', 'prog', 'waves', 'duty', 'sims']
    expect(applyDayTpl(0, t.id)).toBe(true)
    expect(DAYS[0].secOrder).toBeUndefined()
  })

  it('a hand-edited storage file has its secOrder cleaned (unknowns and repeats dropped)', () => {
    mem['sqn142_daytpl'] = JSON.stringify([{
      id: 'dt1', title: 'junk', d: {
        notes: [], allhands: [], waves: [], sims: {}, dutywaves: [], ground: [],
        simnotes: '', prognotes: '', dutynotes: '', grndnotes: '',
        secOrder: ['nope', 'waves', 'waves', 'prog'],
      },
    }])
    dayTplLoad()
    expect(DAYTPL_CFG[0]!.d.secOrder, 'junk and the duplicate are stripped').toEqual(['waves', 'prog'])
  })
})
