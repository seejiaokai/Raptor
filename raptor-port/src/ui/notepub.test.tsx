// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { blkNoteHTML } from './html'
import { sbNote } from './board-html'
import { toggleNotePub, notePub } from '../state/view'
import { setSession } from '../state/auth'
import { DAYS } from '../engine/data'
import { dayKeys } from '../engine/restore'
import { SCHED, signOf, setDayApproved, dayDelta } from '../engine/publish'
import { stashClear } from '../engine/weekstash'

/* Scheduler notes can be made public (owner, Aug 26 — "Scheduler notes can toggle
   to show in view only schedule. In which it will show as Public notes in edit
   schedule and scheduler board but in view only schedule it shows Notes").
   Since D1588 (3 Nov 26) the flag is the DAY's own `npub` — saved with the note and shared, and drawn from the day being
   drawn, so the issued face shows it as the day went out (D1592). */
const DSNAP = JSON.stringify(DAYS)
beforeEach(() => { setSession({ user: 'a', role: 'admin' }) })
afterEach(() => { DAYS.length = 0; JSON.parse(DSNAP).forEach((d: any) => DAYS.push(d)) })

describe('a public scheduler note', () => {
  const day = () => { const d: any = DAYS[0]; d.prognotes = 'brief the duty crew'; return d }

  it('edit week: header and toggle flip with the public flag', () => {
    const d = day()
    const off = blkNoteHTML(0, d, true, 'pn', 'prognotes')
    expect(off).toContain('Scheduler notes')
    expect(off).toContain('data-notepub="pn:0"')     // the toggle rides the header
    expect(off).toContain('Make public')
    expect(off).toContain('class="blknote ed"')       // still editable
    expect(toggleNotePub('pn:0'), 'public afterwards').toBe(true)
    const on = blkNoteHTML(0, d, true, 'pn', 'prognotes')
    expect(on).toContain('Public notes')
    expect(on).toContain('On view-only')
  })

  it('view-only week: nothing unless public AND has text, then the header reads "Notes"', () => {
    const d = day()
    expect(blkNoteHTML(0, d, false, 'pn', 'prognotes'), 'scheduler-only → not issued').toBe('')
    toggleNotePub('pn:0')
    const v = blkNoteHTML(0, d, false, 'pn', 'prognotes')
    expect(v).toContain('>Notes<')                    // the view-only heading is just "Notes"
    expect(v).not.toContain('Public notes')
    expect(v).not.toContain('data-notepub')           // no toggle for a viewer
    expect(v).toContain('brief the duty crew')
    /* public but empty → still nothing to issue */
    expect(blkNoteHTML(0, { npub: ['pn'] }, false, 'pn', 'prognotes')).toBe('')
  })

  it('the board header mirrors the flag; a read-only board and a member cannot toggle', () => {
    const d = day()
    expect(sbNote(d, 0, 'pn', 'prognotes', '', false)).toContain('Scheduler notes')
    toggleNotePub('pn:0')
    const on = sbNote(d, 0, 'pn', 'prognotes', '', false)
    expect(on).toContain('Public notes')
    expect(on).toContain('data-notepub="pn:0"')
    /* a read-only board (pv) shows the label but no control */
    expect(sbNote(d, 0, 'pn', 'prognotes', '', true)).not.toContain('data-notepub')
    /* a member is refused at the write path — nothing is flipped */
    setSession({ user: 'user', role: 'main' })
    expect(toggleNotePub('gn:0')).toBe(false)
    expect(notePub('gn:0')).toBe(false)
  })

  it('the flag is per note — making the programme note public leaves the ground note alone', () => {
    toggleNotePub('pn:0')
    expect(notePub('pn:0')).toBe(true)
    expect(notePub('gn:0')).toBe(false)
    expect((DAYS[0] as any).npub, 'kept on the day itself — saved with it').toEqual(['pn'])
    toggleNotePub('pn:0')
    expect((DAYS[0] as any).npub, 'scheduler-only again leaves no trace on the day').toBeUndefined()
  })

  /* D1592: the issued face draws the note as the day WENT OUT — a copy of the day without the flag stays scheduler-only
     there, though the working copy has since made it public */
  it('the day drawn decides: the issued copy keeps its own choice (D1592)', () => {
    const issued = structuredClone(day())
    toggleNotePub('pn:0')
    expect(blkNoteHTML(0, issued, false, 'pn', 'prognotes'), 'as it went out').toBe('')
    expect(blkNoteHTML(0, DAYS[0], false, 'pn', 'prognotes'), 'the working copy').toContain('brief the duty crew')
  })

  /* D1592: on a published day the choice waits for the next amendment — the comparison sees it on the note's own address */
  it('the comparison sees the choice on the note itself, and a note never made public compares as before', () => {
    const d = day()
    const before = dayKeys(d, 0).get('pn:0')
    expect(before, 'unchanged for a note that is not public').toBe('brief the duty crew')
    toggleNotePub('pn:0')
    expect(dayKeys(DAYS[0], 0).get('pn:0'), 'the note reads changed').not.toBe(before)
    expect(dayKeys(DAYS[0], 0).get('gn:0'), 'the other notes do not').toBe(dayKeys(JSON.parse(DSNAP)[0], 0).get('gn:0'))
  })
})

/* D1592 on a real published day: the choice is one pending change, waiting for the next amendment */
describe('a note made public on a day already published (D1592)', () => {
  beforeEach(() => {
    SCHED.pending = {}; SCHED.changes = {}; SCHED.added = {}; SCHED.als = []
    SCHED.al = 0; SCHED.dayOK = {}; SCHED.sign = {}; SCHED.orig = {}; SCHED.cur = {}
    stashClear()
  })
  it('reads as a change waiting on that day, and as none once it is put back', () => {
    ;(DAYS[0] as any).prognotes = 'brief the duty crew'
    const g = signOf(0); g.cur = 'ignite'; g.sked = 'bane'; g.plan = 'stiff'; g.appr = 'pump'
    setDayApproved(0, true)
    expect(dayDelta(0), 'nothing waiting as published').toEqual([])
    toggleNotePub('pn:0')
    expect(dayDelta(0).map((e: any) => e.addr), 'the note is waiting for the next amendment').toContain('pn:0')
    toggleNotePub('pn:0')
    expect(dayDelta(0), 'put back as it went out: nothing waiting').toEqual([])
  })
})

/* To go out on a published day (D1592; the bug check of 3 Nov 26): where only the choice changed it read the whole note
   struck through and written again with "· public" after it, as if the note had been rewritten */
describe('To go out words for a note made public', () => {
  it('says "scheduler-only → shown on view-only" where only the choice changed, and nothing special where the words changed', async () => {
    const { notePubWords } = await import('./pendlist')
    expect(notePubWords('pn:3', 'brief 0700', 'brief 0700␟public')).toEqual({ from: 'scheduler-only', to: 'shown on view-only' })
    expect(notePubWords('gn:3', 'x␟public', 'x')).toEqual({ from: 'shown on view-only', to: 'scheduler-only' })
    expect(notePubWords('pn:3', 'brief 0700', 'brief 0730␟public'), 'words changed too: the plain words say both').toBeNull()
    expect(notePubWords('dn:3.0', 'a', 'a␟public'), 'not a section note').toBeNull()
  })
})

/* The bug check of 3 Nov 26, on a day already published (D1592, D45, D103) */
describe('a note made public on a published day — what waits and what is said', () => {
  beforeEach(() => {
    SCHED.pending = {}; SCHED.changes = {}; SCHED.added = {}; SCHED.als = []
    SCHED.al = 0; SCHED.dayOK = {}; SCHED.sign = {}; SCHED.orig = {}; SCHED.cur = {}
    stashClear()
  })
  const publish = () => { const g = signOf(0); g.cur = 'ignite'; g.sked = 'bane'; g.plan = 'stiff'; g.appr = 'pump'; setDayApproved(0, true) }
  it('an EMPTY note made public changes nothing that went out: nothing waits', () => {
    ;(DAYS[0] as any).simnotes = ''
    publish()
    toggleNotePub('sn:0')
    expect(dayDelta(0), 'the view-only schedule prints no empty note: nothing to amend').toEqual([])
    ;(DAYS[0] as any).simnotes = 'OFT 2 u/s'
    expect(dayDelta(0).map((e: any) => e.addr), 'words typed: the note and its choice wait together').toContain('sn:0')
  })
  it('the press says the choice waits for the next amendment, and the plain words once it is put back', async () => {
    const { routeClick } = await import('./interactions')
    const { HOOKS } = await import('../engine/hooks')
    ;(DAYS[0] as any).prognotes = 'brief the duty crew'
    publish()
    const said: string[] = [], was = HOOKS.toast
    HOOKS.toast = ((m: any) => { said.push(String(m)) }) as any
    const press = () => { const b = document.createElement('button'); b.dataset.notepub = 'pn:0'; document.body.appendChild(b); try { routeClick({ target: b, stopPropagation() {}, preventDefault() {} } as any) } finally { b.remove() } }
    try {
      press()
      expect(said.at(-1)).toBe('Note made public. It goes out with the next amendment.')
      /* …and the button's own words say it waits, on the week and the board alike */
      expect(blkNoteHTML(0, DAYS[0], true, 'pn', 'prognotes')).toContain('Public: goes out with the next amendment')
      expect(sbNote(DAYS[0], 0, 'pn', 'prognotes', '', false)).toContain('Public: goes out with the next amendment')
      press()
      expect(said.at(-1), 'put back as it went out: nothing waits').toBe('Note is scheduler-only again')
    } finally { HOOKS.toast = was }
  })
})
