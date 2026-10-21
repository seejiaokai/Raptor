/* The aircrew palette's own rendering rules. slotrules.test.ts pins the ENGINE
   answer (slotBar/slotRules); this file pins what the palette does with it when
   nothing is armed, which is the one path that cannot ask slotBar anything —
   there is no slot to ask about — and so has to reason from the day alone.
   String assertions only: jsdom has no layout engine in this repo, so a test
   here can prove which class was emitted and nothing about what was painted. */
import { beforeEach, describe, expect, it } from 'vitest'
import { DAYS } from '../engine/data'
import { INPUTS } from '../engine/inputs'
import { PEOPLE } from '../engine/people'
import { dayEngaged, dayOff, dayStandby, slotRules } from '../engine/avail'
import { validate } from '../engine/validate'
import { SCHED } from '../engine/publish'
import { rosterPuck, paletteHTML, sansAvailHTML, specialRowHTML } from './palette-html'
import { makeStandalone } from '../engine/waves'
import { slotTitle } from '../state/view'

const DSNAP = JSON.stringify(DAYS)
const ISNAP = JSON.stringify(INPUTS)
beforeEach(() => {
  DAYS.length = 0; JSON.parse(DSNAP).forEach((d: any) => DAYS.push(d))
  INPUTS.length = 0; JSON.parse(ISNAP).forEach((i: any) => INPUTS.push(i))
  SCHED.pending = {}; SCHED.changes = {}; SCHED.als = []
  validate()
})

/* the unarmed palette, built the way paletteHTML builds it */
const unarmed = (id: string, di = 0) => {
  const d = DAYS[di]
  return rosterPuck(id, di, '', dayEngaged(d), dayOff(d), dayStandby(d), null)
}

describe('the unarmed palette and the grounded man (ATT B)', () => {
  /* 'nasty' is the id slotrules.test.ts uses for the same rule, for the same
     reason: nothing in the seed week competes with the test's own input. */
  const groundHim = (type: string) =>
    INPUTS.push({ person: 'nasty', date: 'Jul 13', allday: true, type, remarks: '', mod: '' })

  it('ATT B is not struck through — he may still man a desk', () => {
    groundHim('ATT B')
    const html = unarmed('nasty')
    expect(html).not.toContain('rpuck no')
    expect(html).toContain('rpuck busy')
  })

  it('and the puck says what he cannot do', () => {
    groundHim('ATT B')
    expect(unarmed('nasty')).toContain('grounded today')
  })

  it('ATT C — genuinely away — is still struck through', () => {
    groundHim('ATT C')
    expect(unarmed('nasty')).toContain('rpuck no')
  })

  it('ordinary leave is still struck through', () => {
    groundHim('LL')
    expect(unarmed('nasty')).toContain('rpuck no')
  })

  it('ATT B PLUS leave is struck through — one carve-out does not excuse the other', () => {
    groundHim('ATT B')
    groundHim('OL')
    expect(unarmed('nasty')).toContain('rpuck no')
  })

  it('a man with nothing on is neither struck nor dimmed', () => {
    const html = unarmed('split')
    expect(html).not.toContain('rpuck no')
    expect(html).toContain(`data-person="split"`)
  })

  it('the roster still names every man it draws', () => {
    groundHim('ATT B')
    expect(unarmed('nasty')).toContain(PEOPLE['nasty'].cs)
  })
})

/* THE SANS AVAILABILITY SECTION (owner, 14 Aug 26) — the per-column SANS
   sub-bands are gone; every SANS member, pilot or WSO, lists in ONE
   full-width `.rall.rsans` band instead. Grey-out is automatic (rosterPuck
   already reads slotBar), so this file only has to pin that the band lists
   everyone, the badge tracks a filed record, and the columns above it never
   carry a SANS name a second time. */
describe('the SANS Availability palette section', () => {
  const SANS_IDS = Object.keys(PEOPLE).filter(id => PEOPLE[id].san)
    .sort((a, b) => PEOPLE[a].cs.localeCompare(PEOPLE[b].cs))
  /* one row's own markup, isolated by splitting on the row wrapper — rosterPuck
     never emits a nested <div>, so the first `</div>` after the split IS the
     row's own close */
  const rowsOf = (html: string) => html.split('<div class="rsans-row">').slice(1).map(s => s.split('</div>')[0])
  const rowFor = (html: string, id: string) => rowsOf(html).find(r => r.includes(`data-person="${id}"`))

  it('lists every SANS member, one row each, unarmed', () => {
    const html = paletteHTML(0)
    expect((html.match(/class="rsans-row"/g) || []).length).toBe(SANS_IDS.length)
    SANS_IDS.forEach(id => expect(rowFor(html, id), id).toBeTruthy())
  })

  it('the badge shows iff a record is filed for the day', () => {
    INPUTS.push({ person: 'krait', date: DAYS[0].dt, allday: true, type: 'SANS Availability', sans: { f: true }, mod: 'now' })
    const html = paletteHTML(0)
    expect(rowFor(html, 'krait')).toContain('rsans-b')
    expect(rowFor(html, 'yeti')).not.toContain('rsans-b')
  })

  /* RECORD-LESS SANS ARE STRUCK BY DEFAULT (owner bug report, 14 Aug 26) — with
     nothing armed, a SANS man who filed nothing used to read as ordinarily
     available; only arming a slot ever asked the SANS gate anything. 'ipman'
     carries no record in the seed week, same as the armed tests below rely on. */
  it('an unarmed, record-less SANS puck is struck by default, reason in the title', () => {
    const html = unarmed('ipman')
    expect(html).toContain('rpuck no')
    expect(html).toContain('SANS — no availability filed for today')
    /* nothing is armed, so showWhy stays off — the reason lands in the title
       only, never printed under the name (that is an ARMED-only affordance) */
    expect(html).not.toContain('haswhy')
    expect(html).not.toContain('rwhy')
  })

  it('filing a record removes the unarmed strike', () => {
    INPUTS.push({ person: 'ipman', date: DAYS[0].dt, allday: true, type: 'SANS Availability', sans: { f: true }, mod: 'now' })
    const html = unarmed('ipman')
    expect(html).not.toContain('rpuck no')
  })

  it('a real absence still outranks "no record filed" — a SANS man on leave reads as on-leave', () => {
    INPUTS.push({ person: 'ipman', date: DAYS[0].dt, allday: true, type: 'LL', remarks: '', mod: '' })
    const html = unarmed('ipman')
    expect(html).toContain('rpuck no')
    expect(html).toContain('leave')
    expect(html).not.toContain('SANS — no availability filed for today')
  })

  it('the .rsans-r remarks span renders when the record carries remarks, and not otherwise', () => {
    INPUTS.push({ person: 'ipman', date: DAYS[0].dt, allday: true, type: 'SANS Availability', sans: { f: true }, remarks: 'keen for anything', mod: 'now' })
    // a record with no remarks at all — no empty span either
    INPUTS.push({ person: 'krait', date: DAYS[0].dt, allday: true, type: 'SANS Availability', sans: { f: true }, mod: 'now' })
    const html = paletteHTML(0)
    const ipmanRow = rowFor(html, 'ipman')!
    expect(ipmanRow).toContain('rsans-r')
    expect(ipmanRow).toContain('keen for anything')
    expect(rowFor(html, 'krait')).not.toContain('rsans-r')
  })

  it('the old per-column SANS sub-bands are gone — no SANS name inside a seat column', () => {
    const html = paletteHTML(0)
    /* one "SANS Avail" heading — the full-width band, never a per-column
       sub-band beside "Pilots"/"WSOs" (renamed from "SANS Availability",
       owner 24 Aug 26) */
    expect((html.match(/>SANS Avail · \d+ free</g) || []).length).toBe(1)
    /* the three seat columns sit in .rcols, BEFORE the full-width band —
       isolate that slice and confirm no SANS id's puck (which itself
       carries data-person twice, on the .rpuck wrapper and the inner
       puck() span) ever lands inside it */
    const colsBlock = html.slice(html.indexOf('<div class="rcols">'), html.indexOf('<div class="rall rsans">'))
    SANS_IDS.forEach(id => expect(colsBlock, id).not.toContain(`data-person="${id}"`))
  })

  it('an armed flying seat greys a record-less SANS entry, reason printed', () => {
    const armKey = '0.0.0.0.p'
    const arules = slotRules(armKey)
    const html = sansAvailHTML(0, armKey, dayEngaged(DAYS[0]), dayOff(DAYS[0]), dayStandby(DAYS[0]), arules)
    const row = rowFor(html, 'ipman')!
    expect(row).toContain('rpuck no haswhy')
    expect(row).toMatch(/rwhy">SANS/)
  })

  it('an armed duty seat leaves a record-less SANS entry ungreyed — no SANS grey off a jet', () => {
    const armKey = 'd:0.0.0'
    const arules = slotRules(armKey)
    const html = sansAvailHTML(0, armKey, dayEngaged(DAYS[0]), dayOff(DAYS[0]), dayStandby(DAYS[0]), arules)
    const row = rowFor(html, 'ipman')!
    expect(row).not.toContain('haswhy')
    expect(row).not.toContain('rpuck no')
  })
})

describe('the Placeholders strip', () => {
  it('carries BOTH sentinels — ALL AVAIL and the ALL puck (owner, 28 Aug 26), same idiom', () => {
    const html = specialRowHTML(0)
    expect(html).toContain('data-person="allavail"')
    expect(html).toContain('data-person="all"')
    expect(html).toContain('>ALL AVAIL<')
    expect(html).toContain('>ALL<')
    /* both render the sentinel puck shape — never a seat/qual-decorated person puck */
    expect((html.match(/puck allavail/g) || []).length).toBe(2)
  })
})

/* [CROWD-SWAP-SAYS-BUSY] W3's re-walk (26 Sep 26): with a crowd's "+ add" armed, the palette asks with the key AS ARMED
   (the `.+` kept), so a man already in that crowd is struck with the reason — the palette used to strip the `.+`, which
   asked about "the row" and read him as simply on it. Since D271 (27 Sep 26) a tap on him there is REFUSED, so the
   struck line says so before the tap: "· not added twice". */
describe('an armed crowd strikes a man already in it', () => {
  it('Ranger, on FLIGHT SAFETY STAND-DOWN, is struck from its own "+ add" with the reason', async () => {
    const view = await import('../state/view')
    const { setSession } = await import('../state/auth')
    setSession({ user: 'a', role: 'admin' })                 // only an editor arms a slot
    view.armSlot('a:0.2.+')
    expect(view.armedKey()).toBe('a:0.2.+')
    try {
      const html = paletteHTML(0)
      const m = /<span class="rpuck no[^"]*"[^>]*data-person="bane"[^>]*data-why="([^"]*)"/.exec(html)
      expect(m, 'Ranger struck').toBeTruthy()
      expect(m![1]).toBe('already on FLIGHT SAFETY STAND-DOWN 08:30–09:00 · not added twice')
    } finally { view.disarmSlot() }
  })
})

/* [BOARD-SIDE-WIDTH] — the right panel's rulings of 21 Oct 26 (D1118, D1119, D1120) */
const seq = (html: string, from: string, to?: string) => {
  const a = html.indexOf(from), b = to ? html.indexOf(to, a) : html.length
  return [...html.slice(a, b).matchAll(/<span class="rpuck ([^"]*)" data-drag="1" data-person="([^"]+)"/g)].map(m => ({ cls: m[1], id: m[2] }))
}
const freeId = () => {
  /* a pilot with nothing at all on Monday: not tasked, not away, not SANS */
  const d = DAYS[0], eng = dayEngaged(d), off = dayOff(d)
  return Object.keys(PEOPLE).find(id => PEOPLE[id].seat === 'FCP' && !PEOPLE[id].san && !PEOPLE[id].archived && !PEOPLE[id].special && !eng.has(id) && !off.has(id))!
}

describe('D1118 — the ATT B man with nothing else that day, no place picked', () => {
  it('is drawn in full colour with "ATT B: no flying", straight after the free men, and not counted free', () => {
    const id = freeId()
    const before = paletteHTML(0)
    const n0 = Number((before.match(/Pilots · (\d+) free/) || [])[1])
    INPUTS.push({ person: id, date: 'Jul 13', allday: true, type: 'ATT B', remarks: 'Medically down', mod: '' })
    const html = paletteHTML(0)
    const pilots = seq(html, '>Pilots ·', '<div class="rcol">' + '<div class="rh">WSOs')
    const me = pilots.findIndex(p => p.id === id)
    expect(pilots[me].cls).toContain('grounded')
    expect(pilots[me].cls).not.toContain('busy')
    expect(pilots[me].cls).not.toContain('no')
    expect(html).toContain('ATT B: no flying')
    /* every man above him is free, and the next one is not */
    pilots.slice(0, me).forEach(p => expect(p.cls.trim(), p.id).toMatch(/^(standby)?$/))
    expect(pilots[me + 1].cls).not.toMatch(/^\s*$/)
    expect(Number((html.match(/Pilots · (\d+) free/) || [])[1])).toBe(n0 - 1)
  })
  it('a seat picked still judges him by the seat — struck for a jet', () => {
    const id = freeId()
    INPUTS.push({ person: id, date: 'Jul 13', allday: true, type: 'ATT B', remarks: '', mod: '' })
    const d = DAYS[0], key = '0.0.0.0.p'
    const html = rosterPuck(id, 0, key, new Set(), dayOff(d), new Map(), slotRules(key))
    expect(html).toContain('rpuck no')
    expect(html).not.toContain('ATT B: no flying')
  })
  it('a SANS man on ATT B with no record filed is struck for that, never drawn free (blind read F3)', () => {
    const id = Object.keys(PEOPLE).find(k => PEOPLE[k].san && !PEOPLE[k].archived && !dayEngaged(DAYS[0]).has(k))!
    INPUTS.push({ person: id, date: 'Jul 13', allday: true, type: 'ATT B', remarks: '', mod: '' })
    const html = unarmed(id)
    expect(html).toContain('rpuck no')
    expect(html).not.toContain('ATT B: no flying')
  })
  it('tasked elsewhere too, he stays faded as today', () => {
    INPUTS.push({ person: 'nasty', date: 'Jul 13', allday: true, type: 'ATT B', remarks: '', mod: '' })
    if (!dayEngaged(DAYS[0]).has('nasty')) return
    expect(unarmed('nasty')).toContain('rpuck busy')
  })
})

describe('D1119 — the SANS section is ordered free first and counted; the strip drops its dot', () => {
  it('free first, then the rest, callsign order within; the heading counts the free men', () => {
    /* the two SANS men LAST by callsign file a record for Monday, so they are free — and must lead the section */
    const last2 = Object.keys(PEOPLE).filter(id => PEOPLE[id].san && !PEOPLE[id].archived)
      .sort((a, b) => PEOPLE[a].cs.localeCompare(PEOPLE[b].cs)).slice(-2)
    last2.forEach(id => INPUTS.push({ person: id, date: DAYS[0].dt, allday: true, type: 'SANS Availability', sans: { f: true }, mod: 'now' }))
    const html = paletteHTML(0)
    const rows = seq(html, '<div class="rall rsans">', '<div class="rall rpers">')
    const rank = (c: string) => c.includes('no') ? 2 : (c.includes('busy') ? 1 : 0)
    const ranks = rows.map(r => rank(r.cls))
    expect(ranks).toEqual([...ranks].sort((a, b) => a - b))
    for (let i = 1; i < rows.length; i++) if (ranks[i] === ranks[i - 1])
      expect(PEOPLE[rows[i - 1].id].cs.localeCompare(PEOPLE[rows[i].id].cs)).toBeLessThan(0)
    const n = Number((html.match(/SANS Avail · (\d+) free/) || [])[1])
    expect(n).toBe(ranks.filter(r => r === 0).length)
    expect(n).toBeGreaterThanOrEqual(2)
    expect(rows.slice(0, 2).map(r => r.id).sort()).toEqual([...last2].sort())
  })
  it('a line with no callsign or mission names the seat alone', () => {
    const f = DAYS[0].waves[0].formations[0]
    f.cs = ''; f.msn = ''
    expect(slotTitle('0.0.0.0.p')).toBe('FCP')
    f.cs = 'VL'
    expect(slotTitle('0.0.0.0.w')).toMatch(/^RCP · <span class="mono"[^>]*>VL<\/span>$/)
  })
})

describe('D1120 — a man only standing by (SC SPARE, AVALON, BB) is not faded as tasked', () => {
  const addWave = (kind: string, id: string, ai = 0) => {
    const w: any = makeStandalone(kind)
    w.formations[0].aircraft[ai].p = id
    DAYS[0].waves.push(w)
    return w
  }
  for (const kind of ['avalon', 'bb']) {
    it(`a man on a ${kind.toUpperCase()} line reads standing by, counted free`, () => {
      const id = freeId()
      addWave(kind, id)
      const d = DAYS[0]
      expect(dayEngaged(d).has(id), "the day's own tasked list is unchanged").toBe(true)
      expect(dayEngaged(d, true).has(id)).toBe(false)
      expect(dayStandby(d).get(id)).toBe(kind.toUpperCase())
      const html = paletteHTML(0)
      const me = seq(html, '>Pilots ·', '<div class="rh">WSOs').find(p => p.id === id)!
      expect(me.cls.trim()).toBe('standby')
      expect(html).toContain(`${kind.toUpperCase()} standby, free for anything else`)
    })
  }
  it('a standby line that flies (its B typed) is a task: faded', () => {
    const id = freeId()
    const w = addWave('avalon', id)
    w.formations[0].br = '10:00'
    const d = DAYS[0]
    expect(dayStandby(d).has(id)).toBe(false)
    expect(dayEngaged(d, true).has(id)).toBe(true)
  })
  it('a man on a standby line AND a sim stays faded', () => {
    const id = freeId()
    addWave('avalon', id)
    const sim = (DAYS[0].sims.amt || [])[0]
    sim.p = id
    expect(dayEngaged(DAYS[0], true).has(id)).toBe(true)
  })
  it("an AVALON desk (a block carrying the wave's noconf) stands by too; a plain desk does not", () => {
    const id = freeId()
    DAYS[0].dutywaves = DAYS[0].dutywaves || []
    DAYS[0].dutywaves.push({ label: 'AVALON duties', sa: 'avalon', noconf: true, rows: [{ role: 'AV', id, str: '08:00', end: '16:00' }] })
    expect(dayEngaged(DAYS[0], true).has(id)).toBe(false)
    expect(dayStandby(DAYS[0]).get(id)).toBe('AVALON')
    DAYS[0].dutywaves[DAYS[0].dutywaves.length - 1].noconf = false
    expect(dayEngaged(DAYS[0], true).has(id)).toBe(true)
  })
  it('an SC SPARE keeps its own words', () => {
    const id = freeId()
    const w: any = makeStandalone('sc')
    const ai = w.formations[0].aircraft.findIndex((a: any) => a.spare)
    w.formations[0].aircraft[ai].p = id
    DAYS[0].waves.push(w)
    expect(paletteHTML(0)).toContain('SC spare, standing by and free for anything else')
  })
})
