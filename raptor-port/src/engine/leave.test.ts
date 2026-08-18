/* Ported from reference/tfin.js — the B42 leave taxonomy (LL / OL / OIL),
   widened on 10 Aug 26 to the squadron's real vocabulary. The three original
   assertions are kept intact below; everything after them pins the axes the
   new table added. */
import { describe, expect, it } from 'vitest'
import { LEAVE_TYPES, INPUT_TYPES, INPUT_META, inpMeta, canSpare, canWork, awayAllDay, isLeave, isLocalLeave, isDownchit, isOffType, isPersonal, isUnavail, isSansAvail, offWord, inputCoversDate, typeGroup, withRemarksTail } from './inputs'
import { validate } from './validate'

describe('leave is LL / OL / OIL (tfin B42)', () => {
  it('the three leave types replace the single Leave', () => {
    expect(INPUT_TYPES.slice(0, 3)).toEqual(['LL', 'OL', 'OIL'])
    expect(INPUT_TYPES).not.toContain('Leave')
    expect(INPUT_TYPES).not.toContain('TDY')
  })

  it('LL is local, OL is overseas, OIL is off in lieu', () => {
    expect(LEAVE_TYPES.LL).toBe('local leave')
    expect(LEAVE_TYPES.OL).toBe('overseas leave')
    expect(LEAVE_TYPES.OIL).toBe('off in lieu')
  })

  it('all three read as leave, none of them as anything else', () => {
    expect(isLeave('LL') && isLeave('OL') && isLeave('OIL')).toBe(true)
    expect(isLeave('Leave')).toBe(false)
    expect(isLeave('Office')).toBe(false)
    expect(isLeave('')).toBe(false)
    expect(isLeave(' oil ')).toBe(true)
  })

  it('LL and OIL keep the man on the island, OL does not', () => {
    expect(isLocalLeave('LL') && isLocalLeave('OIL') && !isLocalLeave('OL')).toBe(true)
  })

  /* "Downchit" the TYPE was removed on 10 Aug 26; downchit the CONCEPT is the
     medical group, and isDownchit still answers for it everywhere. */
  it('the medical group is what a downchit became', () => {
    for (const t of ['HL', 'OML', 'ATT C', 'ATT B'])
      expect(isDownchit(t), t).toBe(true)
    expect(INPUT_TYPES).not.toContain('Downchit')
    expect(isLeave('OML')).toBe(false)
    expect(isOffType('OML')).toBe(true)
    expect(isOffType('OIL')).toBe(true)
  })

  /* The offer exemption is gone (owner decision, Aug 26): "Available fly" and
     "Available duty" were removed as types, and "Fly" (renamed "Fly with",
     14 Aug 26) became an ordinary
     commitment. What is left is the two-way split the day's blocks render —
     PRESENTATIONAL since 10 Aug 26, but still a partition. */
  it('every type is either personal or unavailable, and the dead ones are gone', () => {
    expect(INPUT_TYPES).toContain('Fly with')
    expect(INPUT_TYPES).toContain('OD')
    for (const dead of ['Office', 'Available fly', 'Available duty', 'Detachment', 'Downchit'])
      expect(INPUT_TYPES).not.toContain(dead)
    /* the two predicates partition the list — nothing falls between them */
    for (const t of INPUT_TYPES)
      expect(isPersonal(t) !== isUnavail(t), t).toBe(true)
  })

  /* The list and the rules are one object, so neither can grow a member the
     other has never heard of. This is the assertion that keeps the generated
     legend honest — it can only describe what INPUT_META holds. */
  it('the type list IS the rule table, in its declaration order', () => {
    expect(INPUT_TYPES).toEqual(Object.keys(INPUT_META))
    for (const t of INPUT_TYPES) {
      const m = inpMeta(t)
      expect(m, t).toBeTruthy()
      expect(typeof m.name === 'string' && m.name.length > 0, t).toBe(true)
      expect(['leave', 'med', 'duty', 'act', 'sans'], t).toContain(m.grp)
    }
    /* the owner's order: the new types sit below OIL */
    expect(INPUT_TYPES.slice(3, 12)).toEqual(
      ['OFF', 'CCL', 'PL', 'FCL', 'EL', 'HL', 'OML', 'ATT C', 'ATT B'])
  })

  it('isUnavail covers leave, medical and overseas duty; the rest are personal', () => {
    for (const t of ['LL', 'OL', 'OIL', 'OFF', 'CCL', 'PL', 'FCL', 'EL', 'HL', 'OML', 'ATT C', 'ATT B', 'OD'])
      expect(isUnavail(t), t).toBe(true)
    expect(isUnavail('Meeting') || isUnavail('Fly with') || isUnavail('Other') || isUnavail('CSE')).toBe(false)
  })

  it('isPersonal is what a scheduler may lift onto the Ground Programme', () => {
    for (const t of ['Meeting', 'Training', 'CSE', 'Personal', 'Appointment', 'Fly with', 'Other'])
      expect(isPersonal(t), t).toBe(true)
    expect(isPersonal('LL') || isPersonal('OML') || isPersonal('OD')).toBe(false)
    /* isPersonal and the table's `ground` flag are the same set — the block a
       row is drawn in and the button it carries must not disagree */
    for (const t of INPUT_TYPES) expect(inpMeta(t).ground, t).toBe(isPersonal(t))
  })

  /* THE SPARE RULE, in the owner's own words (10 Aug 26): local yes, overseas
     no, with medical the single carve-out — on the island but not fit to walk.
     Derived rather than stored, so this is the whole of it. */
  it('local may stand a spare, overseas may not, medical never does', () => {
    for (const t of ['LL', 'OIL', 'OFF', 'CCL', 'PL', 'FCL', 'EL', 'Training', 'CSE', 'Meeting', 'Fly with', 'Personal', 'Appointment', 'Other'])
      expect(canSpare(t), t).toBe(true)
    for (const t of ['OL', 'OD', 'HL', 'OML', 'ATT C', 'ATT B'])
      expect(canSpare(t), t).toBe(false)
    /* and it really is derived, not a hand-kept column */
    for (const t of INPUT_TYPES)
      expect(canSpare(t), t).toBe(inpMeta(t).local && inpMeta(t).grp !== 'med')
  })

  /* ATT B is the only type in the app that separates "cannot fly" from
     "cannot work" — he is grounded, at his desk. */
  it('only ATT B may still be given a non-flying tasking', () => {
    expect(canWork('ATT B')).toBe(true)
    for (const t of INPUT_TYPES) if (t !== 'ATT B') expect(canWork(t), t).toBe(false)
  })

  /* A half-day closes its own half; a record too thin to place closes the day.
     Both ends are required, so an open-ended half-day cannot shrink to an
     hour through win()'s default. */
  it('awayAllDay: a thin record fails closed', () => {
    expect(awayAllDay({ allday: true })).toBe(true)
    expect(awayAllDay({ type: 'OD' })).toBe(true)                      // no allday, no s/e
    expect(awayAllDay({ allday: false, s: 240 })).toBe(true)           // start only
    expect(awayAllDay({ allday: false, e: 720 })).toBe(true)           // end only
    expect(awayAllDay({ allday: false, s: 240, e: 720 })).toBe(false)  // a real AM
  })

  it('offWord names the leave, with its remark', () => {
    expect(offWord({ type: 'LL', remarks: '' })).toBe('local leave (LL)')
    expect(offWord({ type: 'OML', remarks: 'MED' })).toBe('ordinary medical leave (OML) — MED')
    /* a half-day says which half it is, so the reason a slot is closed is not
       silently the whole day */
    expect(offWord({ type: 'LL', half: 'am', remarks: '' })).toBe('local leave (LL) (AM)')
  })

  it('a ranged input covers every day of its range (inputCoversDate)', () => {
    const inp = { date: 'Jul 13', endDate: 'Jul 17', allday: true }
    expect(inputCoversDate(inp, 'Jul 13') && inputCoversDate(inp, 'Jul 15') && inputCoversDate(inp, 'Jul 17')).toBe(true)
    expect(inputCoversDate({ date: 'Jul 14' }, 'Jul 15')).toBe(false)
  })

  /* SANS AVAILABILITY (owner, 14 Aug 26) — an OFFER, not an absence, but it
     still sits in the isUnavail group (no Accept controls, not a Ground
     Programme candidate) and still may spare, exactly like any other local
     commitment. See sansGate in avail.ts for what actually judges it against
     a flying/OFT/AMT slot. */
  it('SANS Availability is unavail but not personal, may spare, may not work', () => {
    expect(isUnavail('SANS Availability')).toBe(true)
    expect(isPersonal('SANS Availability')).toBe(false)
    expect(isSansAvail('SANS Availability')).toBe(true)
    expect(canSpare('SANS Availability')).toBe(true)
    expect(canWork('SANS Availability')).toBe(false)
  })

  it('the roster really does carry leave to test against', () => {
    const W = validate()
    expect(W.all.some((x: any) => x.code === 'LEAVE_FLY' || x.code === 'DNIF_FLY')).toBe(true)
  })

  /* Duty is a new LOCAL personal input (owner, 18 Aug 26) that must behave in
     every derived rule EXACTLY like Appointment — the whole point of building
     it as a grp:'act' entry rather than special-casing it. */
  it('Duty behaves like Appointment in every derived rule', () => {
    expect(INPUT_TYPES).toContain('Duty')
    for (const pred of [isPersonal, isUnavail, isLeave, isDownchit, isSansAvail, canSpare, canWork, awayAllDay] as any[])
      expect(pred('Duty'), pred.name).toBe(pred('Appointment'))
    // same dropdown section as Appointment — under "Duty & other commitments"
    expect(typeGroup('Duty')).toBe(typeGroup('Appointment'))
    expect(typeGroup('Duty')).toBe('other')
    // and it is NOT overseas duty (OD), which is out of reach
    expect(isUnavail('Duty')).toBe(false)
    expect(isUnavail('OD')).toBe(true)
  })

  /* The remarks date token is rewritten IN PLACE, so a note the typist put
     BEFORE or AFTER it survives the date moving (owner, 18 Aug 26). */
  describe('withRemarksTail rewrites the date token in place', () => {
    const jul = (d: number) => `2026-07-${String(d).padStart(2, '0')}`
    it('a note after the tail survives the end date moving', () => {
      expect(withRemarksTail('till 13 Jul Bangkok', jul(16), jul(18), 'on')).toBe('till 18 Jul Bangkok')
    })
    it('a note before the tail survives too', () => {
      expect(withRemarksTail('LL till 13 Jul', jul(16), jul(18), 'on')).toBe('LL till 18 Jul')
    })
    it('an empty remark just gets the tail; a span reads "till", a single day "on"', () => {
      expect(withRemarksTail('', jul(16), jul(18), 'on')).toBe('till 18 Jul')
      expect(withRemarksTail('', jul(16), jul(16), 'on')).toBe('on 16 Jul')
    })
    it("'none' writes no one-day token and drops an existing one, keeping the note", () => {
      expect(withRemarksTail('till 13 Jul Bangkok', jul(16), jul(16), 'none')).toBe('Bangkok')
      expect(withRemarksTail('', jul(16), jul(16), 'none')).toBe('')
    })
    it("'till' (the Inputs calendar) writes a one-day tail too — 'till <that day>'", () => {
      // a span still names its LAST day
      expect(withRemarksTail('', jul(16), jul(18), 'till')).toBe('till 18 Jul')
      // a single day (end == start, or a lone start with no end) names that day
      expect(withRemarksTail('', jul(16), jul(16), 'till')).toBe('till 16 Jul')
      expect(withRemarksTail('LL', jul(16), '', 'till')).toBe('LL till 16 Jul')
      // an empty form still yields nothing, never 'till <blank>'
      expect(withRemarksTail('', '', '', 'till')).toBe('')
    })
  })
})
