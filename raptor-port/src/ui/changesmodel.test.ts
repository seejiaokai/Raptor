/* THE ONE CHANGES WINDOW'S LINES ([DRAFT-PENDING], 28 Sep 26 — D168, D170; the approved mock-up
   docs/mock/changes-window.html, option A). What a line says, how a move reads as ONE line (Fable F2), the two
   groupings (Item = one group per item, every line item-first — D340, D345, [CHG-BY-ITEM]; Who = by person and
   sitting), what is new to you, and the counts the day chip and the admin's icon show. */
import { beforeEach, describe, expect, it } from 'vitest'
import { ELOG, elogClear, type ELogRow } from '../engine/editlog'
import { setCurWeek } from '../engine/waves'
import { linesFor, byWho, byItem, itemOf, entriesOf, whoEntry, dayCounts, weekNew } from './changesmodel'

let n = 0
const row = (x: Partial<ELogRow>): ELogRow => ({
  seq: ++n, t: 1_000_000 + n * 1000, who: 'Hex', pid: 'rocky', di: 1, date: '2026-07-14', key: '', lbl: '', from: '', to: '', ...x,
} as ELogRow)
const put = (...rows: ELogRow[]) => { rows.forEach(r => ELOG.rows.push(r)); ELOG.next = n + 1 }
const newTo = (pid: string) => (r: ELogRow) => !!r.pid && r.pid !== pid   // no seen record: everything by others is new

beforeEach(() => { elogClear(); n = 0; setCurWeek('13/07/2026') })

describe('what a line says', () => {
  it('a man put on a seat: his name, then where', () => {
    put(row({ key: '1.0.0.0.p', lbl: 'RU BFM · #1 FCP', from: '—', to: 'bane' }))
    const [l] = linesFor(['2026-07-14'], newTo('stiff'))
    expect(l!.title).toBe('Ranger')
    expect(l!.text).toBe('put on RU BFM · #1 FCP')
  })

  it('a man taken off a seat: his name, then where he left', () => {
    put(row({ key: '1.0.0.0.p', lbl: 'RU BFM · #1 FCP', from: 'bane', to: '—' }))
    expect(linesFor(['2026-07-14'], newTo('stiff'))[0]!.text).toBe('taken off RU BFM · #1 FCP')
  })

  it('a MOVE — off one place and onto another by the same person, together — is ONE line (Fable F2)', () => {
    put(
      row({ key: 'a:1.3.0', lbl: 'Programme · MET + NOTAM BRIEF', from: 'bane', to: '—' }),
      row({ key: 'a:1.5.0', lbl: 'Programme · SODB', from: '—', to: 'bane' }),
    )
    const ls = linesFor(['2026-07-14'], newTo('stiff'))
    expect(ls).toHaveLength(1)
    expect(ls[0]!.title).toBe('Ranger')
    expect(ls[0]!.text).toBe('moved from Programme · MET + NOTAM BRIEF to Programme · SODB')
    expect(ls[0]!.seqs).toHaveLength(2)
  })

  /* Fable's final read (F7): a man taken off MONDAY and put on TUESDAY is one change on EACH day (the owner's D109), so the
     week must not pair them into one line — the admin's icon would then read 1 while the two days' chips read 1 + 1 */
  it('a man moved to ANOTHER day is one line on each day — never paired into one for the week', () => {
    put(
      row({ di: 0, date: '2026-07-13', key: 'a:0.3.0', lbl: 'Programme · MET + NOTAM BRIEF', from: 'bane', to: '—' }),
      row({ di: 1, date: '2026-07-14', key: 'a:1.5.0', lbl: 'Programme · SODB', from: '—', to: 'bane' }),
    )
    const week = ['2026-07-13', '2026-07-14', '2026-07-15', '2026-07-16', '2026-07-17', '2026-07-18', '2026-07-19']
    expect(linesFor(week, newTo('stiff'))).toHaveLength(2)
    expect(weekNew(newTo('stiff'))).toBe(2)
  })

  it('two different people\'s edits are never paired into a move', () => {
    put(
      row({ key: 'a:1.3.0', lbl: 'Programme · MET', from: 'bane', to: '—' }),
      row({ key: 'a:1.5.0', lbl: 'Programme · SODB', from: '—', to: 'bane', pid: 'stiff', who: 'Saber' }),
    )
    expect(linesFor(['2026-07-14'], newTo('x'))).toHaveLength(2)
  })

  it('a typed value: where, then from → to', () => {
    put(row({ key: 'gr:1.2.str', lbl: 'Ground · MASS BRIEF · start', from: '06:00', to: '06:15' }))
    const [l] = linesFor(['2026-07-14'], newTo('stiff'))
    expect(l!.title).toBe('Ground · MASS BRIEF · start')
    expect([l!.from, l!.to]).toEqual(['06:00', '06:15'])
  })

  it('newest first', () => {
    put(row({ lbl: 'one' }), row({ lbl: 'two' }))
    expect(linesFor(['2026-07-14'], newTo('stiff')).map(l => l.title)).toEqual(['two', 'one'])
  })

  it('only the days asked for — and a line that spans days on each of them', () => {
    put(row({ lbl: 'Mon', date: '2026-07-13' }), row({ lbl: 'span', date: '2026-07-13', end: '2026-07-15', sect: 'abs' }))
    expect(linesFor(['2026-07-14'], newTo('stiff')).map(l => l.title)).toEqual(['span'])
    expect(linesFor(['2026-07-13'], newTo('stiff')).map(l => l.title)).toEqual(['span', 'Mon'])
  })
})

describe('THE ITEM of a line — from its row-anchored key, never its words (D340, D345; [CHG-BY-ITEM])', () => {
  /* one case per key family the history can hold, and per keyless kind — the closed table of the plan's §2.3 (it replaces
     Astra DP-12's closed list of sections, which went with Group by Where) */
  it('every key family names its item, its title and its detail', () => {
    const T = '2026-07-14'
    const cases: Array<[Partial<ELogRow>, string, string, string]> = [
      [{ key: '1.0.0.0.p', lbl: 'VL BFM · #1 FCP' }, `${T}|F|0.0`, 'Flying · VL BFM', '#1 FCP'],
      [{ key: '1.0.0.1.w', lbl: 'VL BFM · #2 RCP' }, `${T}|F|0.0`, 'Flying · VL BFM', '#2 RCP'],
      [{ key: 'ff:1.0.0.to', lbl: 'VL · take-off' }, `${T}|F|0.0`, 'Flying · VL BFM', 'Take-off'],
      [{ key: 'fr:1.0.0.1', lbl: 'VL · #2 remarks' }, `${T}|F|0.0`, 'Flying · VL BFM', '#2 remarks'],
      [{ key: 'st:1.0.0.0', lbl: 'VL · #1 stores' }, `${T}|F|0.0`, 'Flying · VL BFM', '#1 stores'],
      [{ key: 'ar:1.0.0', lbl: 'VL · area' }, `${T}|F|0.0`, 'Flying · VL BFM', 'Area'],
      [{ key: 'at:1.0.0', lbl: 'VL · area time' }, `${T}|F|0.0`, 'Flying · VL BFM', 'Area time'],
      [{ key: 'wl:1.1', lbl: 'Wave · WAVE 2' }, `${T}|W|1`, 'Wave · WAVE 2', 'Label'],
      [{ key: 'it:1.1', lbl: 'WAVE 2 · In-time / Rally' }, `${T}|W|1`, 'Wave · WAVE 2', 'In-time / Rally'],   // W6: one name (D504)
      [{ key: 'tr:1.1', lbl: 'WAVE 2 · traffic' }, `${T}|W|1`, 'Wave · WAVE 2', 'Traffic'],
      [{ key: 'd:1.0.0', lbl: 'Duty · SDO' }, `${T}|D|0.0`, 'Duty · SDO', ''],
      [{ key: 'dr:1.0.0.str', lbl: 'Duty · SDO · start' }, `${T}|D|0.0`, 'Duty · SDO', 'Start'],
      [{ key: 'dl:1.1', lbl: 'Duty block · 2nd wave' }, `${T}|DB|1`, 'Duty block · 2nd wave', 'Label'],
      [{ key: 's:1.amt.1.p', lbl: 'Sim · AMT BOX' }, `${T}|S|amt.1`, 'Sim · AMT BOX', 'FCP'],
      [{ key: 's:1.amt.1.pax.1', lbl: 'Sim · AMT BOX' }, `${T}|S|amt.1`, 'Sim · AMT BOX', 'Pax 2'],
      [{ key: 'sr:1.oft.0.label', lbl: 'Sim · OFT EP-5 · label' }, `${T}|S|oft.0`, 'Sim · OFT EP-5', 'Label'],
      [{ key: 'a:1.0.0', lbl: 'Programme · SODB' }, `${T}|A|0`, 'Programme · SODB', ''],
      [{ key: 'ap:1.0.str', lbl: 'Programme · SODB · start' }, `${T}|A|0`, 'Programme · SODB', 'Start'],
      [{ key: 'g:1.2', lbl: 'Ground · MEDICAL APPT' }, `${T}|G|2`, 'Ground · MEDICAL APPT', ''],
      [{ key: 'gr:1.2.end', lbl: 'Ground · MEDICAL APPT · end' }, `${T}|G|2`, 'Ground · MEDICAL APPT', 'End'],
      [{ key: 'dn:1.0', lbl: 'Day note' }, `${T}|N|dn:1.0`, 'Day note', ''],
      [{ key: 'pn:1.0', lbl: 'Programme notes' }, `${T}|N|pn:1.0`, 'Programme notes', ''],
      [{ key: '', iid: 'in7', sub: 'bane', sect: 'abs', itype: 'LL', lbl: 'Ranger · LL added · 14 Jul' }, `${T}|I|in7`, 'Input · Ranger · LL', ''],   // gone: its line keeps the type (Astra FR-04)
      [{ key: '', iid: 'in8', sub: 'bane', sect: 'abs', lbl: 'Ranger · LL added · 14 Jul' }, `${T}|I|in8`, 'Input · Ranger', ''],
      [{ key: 'iu:in7', lbl: 'Ranger · LL', from: 'rocky', to: 'bane' }, `${T}|I|in7`, 'Input · Ranger', ''],   // a reassign: named by who holds it now
      [{ key: '', sub: 'rocky', fld: 'q', sect: 'quals', lbl: 'Hex · CAT', from: 'B', to: 'A' }, `${T}|Q|rocky`, 'Quals · Hex', 'CAT'],
      [{ key: '', sub: 'bane', sect: 'abs', lbl: 'Leave War · Ranger · LL 14 Jul: refused' }, `${T}|LW|bane`, 'Leave War · Ranger', ''],
      [{ key: '', sub: 'bane', sect: 'abs', fld: 'posting', lbl: 'Leave War · Ranger · posting out 14 Jul' }, `${T}|LW|bane`, 'Leave War · Ranger', ''],
      [{ key: '', sub: 'bane', sect: 'quals', fld: 'roster', lbl: 'Ranger · added to the roster' }, `${T}|Q|bane`, 'Quals · Ranger', ''],
      [{ key: '', sect: 'day', lbl: 'Published — the Original' }, `${T}|DAY`, 'The day', ''],
      [{ key: '', lbl: 'Programme item added' }, `${T}|DAY`, 'The day', ''],
    ]
    for (const [x, id, title, detail] of cases) {
      const it0 = itemOf(row(x))
      expect([it0.id, it0.title, it0.detail], JSON.stringify(x)).toEqual([id, title, detail])
    }
  })

  /* W7 (the Codex stack check, 5 Oct 26; D530, D340): a Blue/Red answer is a line about a FORMATION. Its record names the
     formation by its hidden row id — which the window read as "the man this line is about" and filed under
     "Leave War · <the hidden code>". It belongs to its flying line, named as the schedule names it. */
  it('W7 a Blue/Red answer is filed under its formation — never under "Leave War" or a hidden code', async () => {
    const { DAYS } = await import('../engine/data')
    const { ridKey } = await import('../engine/rowids')
    const T = '2026-07-14'
    const role = (x: Partial<ELogRow>) => row({ key: '', sect: 'day', fld: 'mission-role', from: 'Unresolved', to: 'Red', ...x })
    /* the formation is gone, or its week is not on screen: its callsign, off the line's own words */
    const gone = itemOf(role({ sub: 'rabc', lbl: 'RU · mission role · Working copy' }))
    expect([gone.id, gone.title, gone.detail]).toEqual([`${T}|MR|rabc`, 'Flying · RU', 'Mission role'])
    /* the last resort wrote the code itself as the name — it is never shown */
    expect(itemOf(role({ sub: 'rabc', lbl: 'rabc · mission role · copied with the day template' })).title).toBe('Flying · line')
    /* the formation is on screen: the very item its other changes are filed under */
    const f: any = (DAYS as any)[1].waves[0].formations[0], had = f.rid
    f.rid = 'rw7live'
    try {
      const live = itemOf(role({ sub: 'rw7live', lbl: `${f.cs} · mission role · Published · AL1` }))
      const sibling = itemOf(row({ key: ridKey('ff:1.0.0.to', DAYS), lbl: `${f.cs} · take-off` }))
      expect(live.title).toBe(`Flying · ${f.cs} ${f.msn}`)
      expect(live.id, 'grouped with the same line').toBe(sibling.id)
      expect(live.detail).toBe('Mission role')
      put(role({ sub: 'rw7live', lbl: `${f.cs} · mission role · Working copy` }), role({ sub: 'rw7live', lbl: `${f.cs} · mission role · copied with the day template`, from: 'Red', to: 'Blue' }))
      const ls = linesFor([T], newTo('stiff'))
      const es = ls.flatMap(l => entriesOf(l))
      expect(es.map(e => [e.title, e.detail, e.text, e.from, e.to]).sort()).toEqual([
        [`Flying · ${f.cs} ${f.msn}`, 'Mission role', 'Working copy', 'Unresolved', 'Red'],
        [`Flying · ${f.cs} ${f.msn}`, 'Mission role', 'copied with the day template', 'Red', 'Blue'],
      ].sort())
      for (const g of byItem(ls, true, [T])) expect(g.title).not.toMatch(/Leave War|rw7live/)
      for (const l of ls) expect(whoEntry(l, true, [T]).title).toBe(`Tue · Flying · ${f.cs} ${f.msn}`)
    } finally { if (had === undefined) delete f.rid; else f.rid = had }
  })

  it('a line with nothing to file it by — no key, no input, no man, no day — is its own item, in its own words', () => {
    const r = row({ key: '', date: null, di: null, lbl: 'Undo' })
    const it0 = itemOf(r)
    expect(it0.id).toBe(`|L|${r.seq}`)
    expect(it0.title).toBe('Undo')
  })

  it('a posting and a roster add read under their man, without repeating him (Fable F3, Astra 05)', () => {
    put(
      row({ key: '', sub: 'bane', sect: 'abs', fld: 'posting', lbl: 'Leave War · Ranger · posting out 14 Jul · Overseas Sqn' }),
      row({ key: '', sub: 'bane', sect: 'quals', fld: 'roster', lbl: 'Ranger · added to the roster' }),
    )
    const es = linesFor(['2026-07-14'], newTo('stiff')).flatMap(l => entriesOf(l))
    expect(es.map(e => [e.title, e.detail, e.text])).toEqual([
      ['Quals · Ranger', '', 'added to the roster'],
      ['Leave War · Ranger', '', 'posting out 14 Jul · Overseas Sqn'],
    ])
  })

  it('a leave begun the week before is filed under its first day IN this week (Fable F9)', () => {
    put(row({ key: '', iid: 'in9', sub: 'bane', sect: 'abs', date: '2026-07-09', end: '2026-07-15', lbl: 'Ranger · LL added · 9 Jul–15 Jul' }))
    const week = ['2026-07-13', '2026-07-14', '2026-07-15', '2026-07-16', '2026-07-17', '2026-07-18', '2026-07-19']
    expect(byItem(linesFor(week, newTo('stiff')), true, week).map(g => g.title)).toEqual(['Mon · Input · Ranger'])
  })

  it('the SAME name on two rows is two items; the same row renamed between two changes is ONE (identity is the row)', () => {
    put(
      row({ key: 'ap:1.0.str', lbl: 'Programme · SODB · start', from: '05:45', to: '06:00' }),
      row({ key: 'ap:1.1.prog', lbl: 'Programme · MASS BRIEF · item', from: 'MASS BRIEF', to: 'SODB' }),
      row({ key: 'ap:1.1.str', lbl: 'Programme · SODB · start', from: '06:00', to: '06:10' }),
    )
    const g = byItem(linesFor(['2026-07-14'], newTo('stiff')), false)
    expect(g.map(x => x.key)).toEqual(['item:2026-07-14|A|1', 'item:2026-07-14|A|0'])
    expect(g[0]!.entries).toHaveLength(2)
  })

  it('the same event on two days is two items, and in the week view the day leads the title', () => {
    put(
      row({ di: 0, date: '2026-07-13', key: 'ap:0.0.str', lbl: 'Programme · SODB · start', from: '07:45', to: '07:50' }),
      row({ di: 1, date: '2026-07-14', key: 'ap:1.0.str', lbl: 'Programme · SODB · start', from: '05:45', to: '05:50' }),
    )
    const week = ['2026-07-13', '2026-07-14', '2026-07-15', '2026-07-16', '2026-07-17', '2026-07-18', '2026-07-19']
    const g = byItem(linesFor(week, newTo('stiff')), true)
    expect(g.map(x => x.title)).toEqual(['Tue · Programme · SODB', 'Mon · Programme · SODB'])
    expect(byItem(linesFor(['2026-07-14'], newTo('stiff')), false)[0]!.title).toBe('Programme · SODB')
  })
})

describe('GROUP BY ITEM — the latest-changed item on top, a line per change, item-first words (D340, D345)', () => {
  it('an item changed once is ONE line; changed more, a group whose entries are newest first; the newest item on top', () => {
    put(
      row({ key: 'a:1.0.0', lbl: 'Programme · SODB', from: '—', to: 'bane', t: 1_000_000 }),
      row({ key: 'ap:1.1.str', lbl: 'Programme · MASS BRIEF · start', from: '06:00', to: '06:15', t: 2_000_000 }),
      row({ key: 'a:1.0.1', lbl: 'Programme · SODB', from: '—', to: 'casper', t: 3_000_000 }),
    )
    const g = byItem(linesFor(['2026-07-14'], newTo('stiff')), false)
    expect(g.map(x => [x.title, x.one, x.entries.length])).toEqual([['Programme · SODB', false, 2], ['Programme · MASS BRIEF', true, 1]])
    expect(g[0]!.entries.map(e => e.text)).toEqual(['Outlaw put on', 'Ranger put on'])   // casper's callsign is Outlaw
    const mass = g[1]!.entries[0]!
    expect([mass.detail, mass.from, mass.to]).toEqual(['Start', '06:00', '06:15'])
  })

  it('words are item-first: a man put on, taken off, a seat that changed hands (from → to, the seat named)', () => {
    put(
      row({ key: 'a:1.0.0', lbl: 'Programme · SODB', from: 'bane', to: '—' }),
      row({ key: '1.0.0.0.w', lbl: 'VL BFM · #1 RCP', from: 'bane', to: 'casper' }),
    )
    const es = linesFor(['2026-07-14'], newTo('stiff')).flatMap(l => entriesOf(l))
    const seat = es.find(e => e.title === 'Flying · VL BFM')!
    expect([seat.detail, seat.text, seat.from, seat.to]).toEqual(['#1 RCP', '', 'Ranger', 'Outlaw'])
    expect(es.find(e => e.title === 'Programme · SODB')!.text).toBe('Ranger taken off')
  })

  it('a MOVE shows under BOTH items — "moved in from" where he reached, "moved out to" where he left — and is still ONE change', () => {
    put(
      row({ key: 'a:1.1.0', lbl: 'Programme · MASS BRIEF', from: 'bane', to: '—' }),
      row({ key: 'a:1.0.0', lbl: 'Programme · SODB', from: '—', to: 'bane' }),
    )
    const ls = linesFor(['2026-07-14'], newTo('stiff'))
    expect(ls).toHaveLength(1)                                   // the tab's count
    const g = byItem(ls, false)
    const by = Object.fromEntries(g.map(x => [x.title, x.entries[0]!]))
    expect(by['Programme · SODB']!.text).toBe('Ranger moved in from MASS BRIEF')
    expect(by['Programme · MASS BRIEF']!.text).toBe('Ranger moved out to SODB')
    /* each goes to ITS place */
    expect(by['Programme · SODB']!.key).toBe('a:1.0.0')
    expect(by['Programme · MASS BRIEF']!.key).toBe('a:1.1.0')
    /* a move between two kinds of item keeps the kind */
    elogClear(); n = 0
    put(
      row({ key: 'd:1.0.0', lbl: 'Duty · SDO', from: 'bane', to: '—' }),
      row({ key: 'a:1.0.0', lbl: 'Programme · SODB', from: '—', to: 'bane' }),
    )
    const g2 = byItem(linesFor(['2026-07-14'], newTo('stiff')), false)
    expect(g2.find(x => x.title === 'Programme · SODB')!.entries[0]!.text).toBe('Ranger moved in from Duty · SDO')
  })

  /* the places inside one item, by what the key says (Astra's final read, FR-03): a sim's passengers by number, a desk's or a
     ground row's main place and its extras, a crowd's places — never the row's own number */
  it("a move within one item names its two real places — a sim's passengers, a desk's main and extra, a crowd", () => {
    const cases: Array<[string, string, string, string]> = [
      ['s:1.amt.1.pax.0', 's:1.amt.1.pax.1', 'Pax 1', 'Pax 2'],
      ['d:1.0.2', 'd:1.0.2.x0', 'place 1', 'place 2'],
      ['g:1.2.x0', 'g:1.2', 'place 2', 'place 1'],
      ['a:1.0.0', 'a:1.0.2', 'place 1', 'place 3'],
    ]
    for (const [from, to, a, b] of cases) {
      elogClear(); n = 0
      put(row({ key: from, lbl: 'x', from: 'bane', to: '—' }), row({ key: to, lbl: 'x', from: '—', to: 'bane' }))
      const e = byItem(linesFor(['2026-07-14'], newTo('stiff')), false)[0]!.entries[0]!
      expect([e.text, e.from, e.to], `${from} → ${to}`).toEqual(['Ranger moved', a, b])
    }
  })

  it('a move WITHIN one item is ONE entry — "moved", its two places from → to (Fable F2)', () => {
    put(
      row({ key: '1.0.0.0.p', lbl: 'VL BFM · #1 FCP', from: 'bane', to: '—' }),
      row({ key: '1.0.0.0.w', lbl: 'VL BFM · #1 RCP', from: '—', to: 'bane' }),
    )
    const g = byItem(linesFor(['2026-07-14'], newTo('stiff')), false)
    expect(g).toHaveLength(1)
    expect(g[0]!.one).toBe(true)
    const e = g[0]!.entries[0]!
    expect([e.text, e.from, e.to]).toEqual(['Ranger moved', '#1 FCP', '#1 RCP'])
  })

  it('a keyless line reads without repeating its item: an input, a Leave War decision, a Quals detail', () => {
    put(
      row({ key: '', iid: 'in7', sub: 'bane', sect: 'abs', lbl: 'Ranger · LL added · 14 Jul' }),
      row({ key: '', sub: 'bane', sect: 'abs', lbl: 'Leave War · Ranger · LL 20 Jul: refused', date: '2026-07-14' }),
      row({ key: '', sub: 'rocky', fld: 'q', sect: 'quals', lbl: 'Hex · CAT', from: 'B', to: 'A' }),
    )
    const es = linesFor(['2026-07-14'], newTo('stiff')).flatMap(l => entriesOf(l))
    expect(es.find(e => e.title === 'Input · Ranger')!.text).toBe('LL added · 14 Jul')
    expect(es.find(e => e.title === 'Leave War · Ranger')!.text).toBe('LL 20 Jul: refused')
    const q = es.find(e => e.title === 'Quals · Hex')!
    expect([q.detail, q.text, q.from, q.to]).toEqual(['CAT', '', 'B', 'A'])
  })
})

describe('Group by Who — by person and SITTING', () => {
  it('one person\'s changes with no gap over 30 minutes are one sitting; a longer gap starts another', () => {
    put(
      row({ lbl: 'a', t: 1_000_000 }), row({ lbl: 'b', t: 1_000_000 + 10 * 60_000 }),
      row({ lbl: 'c', t: 1_000_000 + 60 * 60_000 }),
      row({ lbl: 'd', t: 1_000_000 + 61 * 60_000, pid: 'stiff', who: 'Saber' }),
    )
    const g = byWho(linesFor(['2026-07-14'], newTo('x')))
    expect(g.map(x => [x.pid, x.lines.map(l => l.title).join('')])).toEqual([['stiff', 'd'], ['rocky', 'c'], ['rocky', 'ba']])
  })
})

describe('Group by Who keeps its sittings, its lines item-first (D345 (6))', () => {
  it('each line leads with its item; a move once, under the item he reached', () => {
    put(
      row({ key: 'a:1.1.0', lbl: 'Programme · MASS BRIEF', from: 'bane', to: '—' }),
      row({ key: 'a:1.0.0', lbl: 'Programme · SODB', from: '—', to: 'bane' }),
      row({ key: 'ap:1.1.str', lbl: 'Programme · MASS BRIEF · start', from: '06:00', to: '06:15' }),
    )
    const [g] = byWho(linesFor(['2026-07-14'], newTo('stiff')))
    const es = g!.lines.map(l => whoEntry(l, false))
    expect(es.map(e => [e.title, e.detail, e.text])).toEqual([
      ['Programme · MASS BRIEF', 'Start', ''],
      ['Programme · SODB', '', 'Ranger moved in from MASS BRIEF'],
    ])
    expect(whoEntry(g!.lines[1]!, true).title).toBe('Tue · Programme · SODB')
  })
})

describe('the counts', () => {
  it('the day counts what is new to you and what changed; the week counts a line once', () => {
    put(row({ lbl: 'x', date: '2026-07-14' }), row({ lbl: 'mine', pid: 'stiff', date: '2026-07-14' }),
      row({ lbl: 'span', date: '2026-07-13', end: '2026-07-15', sect: 'abs' }))
    const c = dayCounts(newTo('stiff'))
    expect(c['2026-07-14']).toEqual({ fresh: 2, all: 3 })
    expect(c['2026-07-16']).toEqual({ fresh: 0, all: 0 })
    expect(weekNew(newTo('stiff'))).toBe(2)
  })
})
