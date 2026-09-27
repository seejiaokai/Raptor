/* THE ONE CHANGES WINDOW'S LINES ([DRAFT-PENDING], 28 Sep 26 — D168, D170; the approved mock-up
   docs/mock/changes-window.html, option A). What a line says, how a move reads as ONE line (Fable F2), the two
   groupings (Who = by person and sitting; Where = by the day's own sections — Astra DP-12's closed list), what is new
   to you, and the counts the day chip and the admin's icon show. */
import { beforeEach, describe, expect, it } from 'vitest'
import { ELOG, elogClear, type ELogRow } from '../engine/editlog'
import { setCurWeek } from '../engine/waves'
import { linesFor, byWho, byWhere, sectionOf, dayCounts, weekNew, SECT_ORDER } from './changesmodel'

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

describe('Group by Where — one closed list of sections (Astra DP-12)', () => {
  it('every key prefix has its section, and a line with no key names its own or is "The day"', () => {
    const cases: Array<[Partial<ELogRow>, string]> = [
      [{ key: '1.0.0.0.p' }, 'fly'], [{ key: 'ff:1.0.0.cs' }, 'fly'], [{ key: 'fr:1.0.0.0' }, 'fly'], [{ key: 'wl:1.0' }, 'fly'],
      [{ key: 'it:1.0' }, 'fly'], [{ key: 'tr:1.0' }, 'fly'], [{ key: 'st:1.0.0.0' }, 'fly'], [{ key: 'ar:1.0.0' }, 'fly'], [{ key: 'at:1.0.0' }, 'fly'],
      [{ key: 'd:1.0.0' }, 'duty'], [{ key: 'dr:1.0.0.role' }, 'duty'], [{ key: 'dl:1.0' }, 'duty'], [{ key: 'dtn:1.0' }, 'duty'],
      [{ key: 'a:1.0.0' }, 'prog'], [{ key: 'ap:1.0.prog' }, 'prog'], [{ key: 'pn:1.0' }, 'prog'],
      [{ key: 's:1.am.0.p' }, 'sim'], [{ key: 'sr:1.am.0.label' }, 'sim'], [{ key: 'sn:1.0' }, 'sim'],
      [{ key: 'g:1.0' }, 'ground'], [{ key: 'gr:1.0.prog' }, 'ground'], [{ key: 'gn:1.0' }, 'ground'],
      [{ key: 'dn:1.0' }, 'note'],
      [{ key: '', sect: 'abs' }, 'abs'], [{ key: '', sect: 'quals' }, 'quals'], [{ key: '', sect: 'day' }, 'day'],
      [{ key: '', lbl: 'Wave added' }, 'day'],
    ]
    for (const [x, s] of cases) expect(sectionOf(row(x)), JSON.stringify(x)).toBe(s)
    expect(SECT_ORDER).toEqual(['fly', 'duty', 'prog', 'sim', 'ground', 'note', 'abs', 'quals', 'day'])
  })

  it('groups follow the day\'s own order', () => {
    put(row({ key: 'g:1.0', lbl: 'g', from: 'a', to: 'b' }), row({ key: 'd:1.0.0', lbl: 'd', from: '—', to: 'bane' }))
    expect(byWhere(linesFor(['2026-07-14'], newTo('stiff'))).map(g => g.sect)).toEqual(['duty', 'ground'])
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
