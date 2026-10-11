/* WHAT A REQUEST WRITES ON ITS ROW, AND WHOSE PUCKS A ROW DRAWS — the pure half ([ALL-AVAIL-AS-MEMBER] step 2 (b); the
   plan docs/superpowers/plans/2026-10-11-one-rule-plan.md §4.1, §4.3). His rulings:
   D755 — "a row that came from an input IS the input: whoever stands on it … is in the input";
   D756 — an input is ONE record with the list of its people;
   D727 — an input's people are named A to Z; D363 — a dead `kept` row is left as it is.

   An input is one record and its row ONE ground row, a whole copy of the input: `who` is the first to join, `more` the
   rest in the order they joined (a placeholder is one of them), and the hash the row carries (`srcv`) moves whenever
   anything the row shows moves — so the re-make rule keeps the row saying what its input says. Whose pucks a row
   draws, and in what order, is ONE answer every builder reads (`rowPeopleDrawn`).

   IT REPLACES the pure half of `[GROUP-INPUT-ONE-ROW]` step 3 (D661, D735 — one row a man, tied by an entry mark `srcg`
   and DRAWN as one). What that file pinned and this one no longer does, each because D755 / D756 took its subject away:
   - "AN ORDINARY REQUEST: the six fields and the `srcv` it always had — byte for byte": the hash is a new one on
     purpose, so every row made before the build is re-made ONCE, whole (the plan's R6) — pinned here as changed;
   - "A GROUPED RECORD: a seventh, `srcg`": no row carries an entry mark — pinned here as its absence;
   - "rows carrying the same entry mark are one row", "the LEAD is the first member in the day's own display order":
     there are no member rows to gather or to lead — one input, one row;
   - "rows whose scheduler's marks differ are honestly drawn apart" (D735): there is one row, so one set of marks.
   ALL AVAIL / ALL AS ONE OF THE PEOPLE (step 3 of the one-rule build, 12 Oct 26 — owner D750, D753, D755, D757). The
   pure answer was built for it at step 2 — "a placeholder is one of them", "then its placeholder, last" — while no
   door could yet make such an input; the doors do now, so the answer is pinned from every side here: ALL as well as
   ALL AVAIL, a placeholder that joined first, the hash moving with it, and which rows the builders draw as a row of
   several (`inputRowSeveral`). Nothing in this file pinned the old rule ("filed on its own") — that was the doors'.
   `groundGroups` is dead code until step 6 of the build takes its callers out (reorder.ts, board.ts, daytpl.ts): what
   it answers meanwhile — every row its own — is pinned in one case, so a caller cannot be handed a group again.

   What is KEPT, unchanged: `entryIdOf`'s own three cases — the published day's reader still asks it of the copies an
   issued version froze before the build (engine/entryfold.ts). RETIRED with step 2 (g): "it is the SAME test the Inputs
   pages group by" — an entry is its record now, so the Inputs pages group nothing (state/inputgroup.ts answers every
   record as its own entry); inputs saved before the build with a group id read as the one-person inputs they are
   (D759 reading 10). */
import { describe, expect, it } from 'vitest'
import { entryIdOf } from './inputentry'
import { requestRowFields, srcvOf } from './overlay'
import { groundGroups, rowPeopleDrawn, drawnPeople, inputRowSeveral } from './grouprows'
import { PEOPLE } from './people'

const base = { iid: 'a1', person: 'bane', type: 'Training', date: 'Jul 15', yr: 2026, allday: false, s: 660, e: 720, remarks: 'range' }
/* the same input as the one-rule build stores it: its people in a list, in the order they joined */
const { person: _one, ...SAYS } = base
const withPeople = (ids: string[], over: any = {}) => ({ ...SAYS, people: ids.map(p => ({ p })), ...over })
/* the hash the row's `srcv` was before the one-rule build: the six fields the request writes, FNV-1a, base 36 */
const oldSrcv = (f: any) => {
  const s = [f.prog, f.str, f.end, f.who, f.rmks, f.srcType].map((x: any) => String(x ?? '')).join('|')
  let h = 0x811c9dc5
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193) }
  return (h >>> 0).toString(36)
}
const cs = (id: string) => String((PEOPLE as any)[id].cs)

describe('entryIdOf — the identity of an entry of the old grouped shape (read off copies frozen before the build)', () => {
  it('an ordinary input has none; nor has a medical entry or an upchit, whatever group fields it carries', () => {
    expect(entryIdOf(base)).toBe('')
    expect(entryIdOf({ ...base, grp: '' })).toBe('')
    expect(entryIdOf({ ...base, grp: 'g1', type: 'ATT C' })).toBe('')
    expect(entryIdOf({ ...base, grp: 'g1', type: 'Upchit' })).toBe('')
    expect(entryIdOf(null)).toBe('')
  })
  it('the records of one entry share it, whoever they are for — and a blank end date, half or remark reads as none', () => {
    const a = entryIdOf({ ...base, grp: 'g1', grpBy: 'stiff' })
    expect(a).toMatch(/^g1~/)
    expect(entryIdOf({ ...base, iid: 'a2', person: 'pike', grp: 'g1', grpBy: 'stiff', endDate: '', half: '', oil: { x: 1 }, acc: 'g' })).toBe(a)
  })
  it('ANY shared field that differs makes it another entry — a date or a half the row does not even show', () => {
    const one = { ...base, grp: 'g1' }, a = entryIdOf(one)
    for (const change of [{ endDate: 'Jul 16' }, { date: 'Jul 16' }, { s: 600 }, { remarks: 'other' }, { title: 'Range brief' }, { type: 'Meeting' }, { allday: true }, { yr: 2027 }]) {
      expect(entryIdOf({ ...one, ...change }), JSON.stringify(change)).not.toBe(a)
    }
    expect(entryIdOf({ ...one, grp: 'g2' }), 'another group').not.toBe(a)
  })
})

describe('what a request writes on its row — a whole copy of the input (D755, D756; the plan §4.3)', () => {
  it('AN INPUT OF ONE PERSON: its name, its two times, its person, its remark and its kind — and no `more`', () => {
    const f: any = requestRowFields(base)
    expect(f).toEqual({ prog: 'TRAINING', str: '11:00', end: '12:00', who: 'bane', rmks: 'range', srcType: 'Training' })
    expect('more' in f, 'nobody to put under the name box: the key is not written').toBe(false)
    /* the same input stored with its list reads the same — an old-shaped record is a one-person input (D756) */
    expect(requestRowFields(withPeople(['bane']))).toEqual(f)
    expect(srcvOf(withPeople(['bane']))).toBe(srcvOf(base))
  })
  it('AN INPUT OF SEVERAL: the first to join in the name box, the rest under it in the order they joined', () => {
    const f: any = requestRowFields(withPeople(['pike', 'bane', 'split']))
    expect([f.who, f.more]).toEqual(['pike', ['bane', 'split']])
    expect(Object.keys(f)).toEqual(['prog', 'str', 'end', 'who', 'rmks', 'srcType', 'more'])
    /* a placeholder is one of them, wherever it joined */
    expect(requestRowFields(withPeople(['bane', 'allavail', 'pike'])).more).toEqual(['allavail', 'pike'])
    const alone: any = requestRowFields(withPeople(['allavail']))
    expect([alone.who, 'more' in alone], 'filed for ALL AVAIL alone: the placeholder holds the name box').toEqual(['allavail', false])
  })
  /* step 3 of the build (D750, D755): the placeholder is one of the people the request writes — ALL as ALL AVAIL, and
     in the place it JOINED in, the name box included: the stored row is the order they joined, never the order drawn */
  it('A PLACEHOLDER AMONG THEM is written where it joined — ALL as ALL AVAIL; joined first, it holds the name box with the people under it', () => {
    expect(requestRowFields(withPeople(['bane', 'all', 'pike'])).more).toEqual(['all', 'pike'])
    const first: any = requestRowFields(withPeople(['allavail', 'pike', 'bane']))
    expect([first.who, first.more]).toEqual(['allavail', ['pike', 'bane']])
    const last: any = requestRowFields(withPeople(['pike', 'bane', 'allavail']))
    expect([last.who, last.more]).toEqual(['pike', ['bane', 'allavail']])
  })
  it('…and THE HASH MOVES WITH IT: put in, taken out, ALL for ALL AVAIL, the only person for it — so the re-make keeps the row saying what its input says', () => {
    const two = srcvOf(withPeople(['bane', 'pike']))
    const withIt = srcvOf(withPeople(['bane', 'pike', 'allavail']))
    expect(withIt, 'ALL AVAIL joins').not.toBe(two)
    expect(srcvOf(withPeople(['bane', 'pike', 'all'])), 'ALL is not ALL AVAIL').not.toBe(withIt)
    expect(srcvOf(withPeople(['bane', 'allavail'])), 'a person leaves from beside it').not.toBe(withIt)
    expect(srcvOf(withPeople(['allavail'])), 'the only person, for ALL AVAIL').not.toBe(srcvOf(withPeople(['bane'])))
    expect(srcvOf(withPeople(['allavail', 'bane'])), 'and the first to join leaving — ALL AVAIL takes the name box').not.toBe(srcvOf(withPeople(['bane', 'allavail'])))
    expect(srcvOf(withPeople(['bane', 'pike', 'allavail'])), 'steady: the same people, the same hash').toBe(withIt)
  })
  it('an all-day input writes no times; its own title is the row’s name, the kind kept beside it', () => {
    const f: any = requestRowFields(withPeople(['bane', 'pike'], { allday: true, type: 'Meeting', title: 'Range safety brief' }))
    expect([f.prog, f.str, f.end, f.srcType]).toEqual(['RANGE SAFETY BRIEF', '', '', 'Meeting'])
  })
  it('NO ENTRY MARK: nothing a request writes carries `srcg` — an old grouped record’s row neither', () => {
    for (const r of [base, withPeople(['bane', 'pike']), { ...base, grp: 'g1', grpBy: 'stiff' }]) expect('srcg' in (requestRowFields(r) as any)).toBe(false)
  })
  it('THE HASH MOVES WHEN ANYONE JOINS OR LEAVES — so the re-make owns the row’s people', () => {
    const three = srcvOf(withPeople(['bane', 'pike', 'split']))
    expect(srcvOf(withPeople(['bane', 'pike', 'split', 'rocky'])), 'one joins').not.toBe(three)
    expect(srcvOf(withPeople(['bane', 'split'])), 'one leaves from under the name box').not.toBe(three)
    expect(srcvOf(withPeople(['pike', 'split'])), 'the first to join leaves: the next takes the name box').not.toBe(three)
    expect(srcvOf(withPeople(['bane', 'pike', 'allavail'])), 'a placeholder in a man’s place').not.toBe(three)
    expect(srcvOf(withPeople(['bane'])), 'down to one').not.toBe(srcvOf(withPeople(['bane', 'pike'])))
    expect(srcvOf(withPeople(['pike'])), 'the ONLY person replaced (D755 (2))').not.toBe(srcvOf(withPeople(['bane'])))
    expect(srcvOf(withPeople(['bane', 'pike', 'split'])), 'and it is steady: the same people, the same hash').toBe(three)
  })
  it('…AND WHEN ANY FIELD THE ROW SHOWS CHANGES — but not for one it does not show', () => {
    const two = withPeople(['bane', 'pike']), was = srcvOf(two)
    for (const change of [{ s: 600 }, { e: 780 }, { remarks: 'other' }, { title: 'Range brief' }, { type: 'Meeting' }, { allday: true }]) {
      expect(srcvOf({ ...two, ...change }), JSON.stringify(change)).not.toBe(was)
    }
    /* its dates are not on the row: a last day added re-makes nothing (until the one-rule build the entry mark moved
       the hash for it) */
    for (const change of [{ endDate: 'Jul 16' }, { yr: 2027 }, { oil: { '2026-07-18': 1 } }, { acc: 'g' }, { by: 'stiff', at: 1 }]) {
      expect(srcvOf({ ...two, ...change }), JSON.stringify(change)).toBe(was)
    }
  })
  it('EVERY ROW MADE BEFORE THE BUILD IS RE-MADE ONCE: no input hashes to what its row carried before (the plan’s R6)', () => {
    for (const r of [base, { ...base, grp: 'g1', grpBy: 'stiff' }, withPeople(['bane'])]) expect(srcvOf(r)).not.toBe(oldSrcv(requestRowFields(r)))
  })
})

describe('rowPeopleDrawn — the pucks of a row, the one answer every builder reads (the plan §4.3)', () => {
  const WED = 2
  const row = (who: any, more?: any[], o: any = {}) => ({ prog: 'TRAINING', str: '11:00', end: '12:00', who, rmks: '', ...(more ? { more } : {}), ...o })
  const drawn = (d: any, ri: number) => rowPeopleDrawn(d, WED, ri).map(p => `${p.id}@${p.key}`)
  const k = (ri: number, n?: number) => `g:${WED}.${ri}${n == null ? '' : `.x${n}`}`
  it('a row that came from an input: its named people A to Z by callsign (D727) — every puck on the key of the place it stands on', () => {
    /* joined Vandal, Ranger, Zenith, Nomad — out of A-to-Z order on purpose */
    expect(['split', 'bane', 'vinci', 'pike'].map(cs)).toEqual(['Vandal', 'Ranger', 'Zenith', 'Nomad'])
    const d = { ground: [row('z'), row('split', ['bane', 'vinci', 'pike'], { src: 'i1' })] }
    expect(drawn(d, 1)).toEqual([`pike@${k(1, 2)}`, `bane@${k(1, 0)}`, `split@${k(1)}`, `vinci@${k(1, 1)}`])
    expect(rowPeopleDrawn(d, WED, 1).every(p => p.ri === 1), 'every puck is that row’s').toBe(true)
    expect(d.ground[1], 'a read: the stored row is left in the order they joined').toMatchObject({ who: 'split', more: ['bane', 'vinci', 'pike'] })
  })
  it('…then its placeholder, last — wherever in the list it joined, the name box included', () => {
    const under = { ground: [row('pike', ['allavail', 'bane'], { src: 'i1' })] }
    expect(drawn(under, 0)).toEqual([`pike@${k(0)}`, `bane@${k(0, 1)}`, `allavail@${k(0, 0)}`])
    const first = { ground: [row('allavail', ['pike', 'bane'], { src: 'i1' })] }
    expect(drawn(first, 0)).toEqual([`pike@${k(0, 0)}`, `bane@${k(0, 1)}`, `allavail@${k(0)}`])
  })
  /* step 3 of the build: ALL is drawn as ALL AVAIL is; and the two orders are independent — the people keep their
     A-to-Z order whatever place the placeholder joined in */
  it('ALL is drawn last too; and one person beside a placeholder is drawn before it whichever of them joined first', () => {
    expect(drawn({ ground: [row('pike', ['all', 'bane'], { src: 'i1' })] }, 0)).toEqual([`pike@${k(0)}`, `bane@${k(0, 1)}`, `all@${k(0, 0)}`])
    expect(drawn({ ground: [row('bane', ['allavail'], { src: 'i1' })] }, 0)).toEqual([`bane@${k(0)}`, `allavail@${k(0, 0)}`])
    expect(drawn({ ground: [row('allavail', ['bane'], { src: 'i1' })] }, 0)).toEqual([`bane@${k(0, 0)}`, `allavail@${k(0)}`])
  })
  /* OLD DATA: a row stored before the build could hold a placeholder twice (D278) or both of them; an input never does
     (D753), and the re-make sweeps such a row at its first read — but the pure answer is asked of whatever it is
     handed, and must not lose a puck or a key: both go last, in their stored order */
  it('a stored row that carries two placeholders (old data — D278; an input holds one, D753): both drawn last, in stored order, each on its own key', () => {
    const d = { ground: [row('allavail', ['pike', 'all', 'bane'], { src: 'i1' })] }
    expect(drawn(d, 0)).toEqual([`pike@${k(0, 0)}`, `bane@${k(0, 2)}`, `allavail@${k(0)}`, `all@${k(0, 1)}`])
  })
  it('`inputRowSeveral` — which rows the week, the board and the peek draw through this answer: an input’s row holding more than one, a placeholder counted as one of them', () => {
    expect(inputRowSeveral(row('bane', ['allavail'], { src: 'i1' })), 'a person and ALL AVAIL').toBe(true)
    expect(inputRowSeveral(row('allavail', ['bane'], { src: 'i1' })), 'whichever joined first').toBe(true)
    expect(inputRowSeveral(row('bane', ['pike'], { src: 'i1' }))).toBe(true)
    expect(inputRowSeveral(row('allavail', undefined, { src: 'i1' })), 'ALL AVAIL alone is a row of one').toBe(false)
    expect(inputRowSeveral(row('bane', undefined, { src: 'i1' }))).toBe(false)
    expect(inputRowSeveral(row('bane', ['', ''], { src: 'i1' })), 'blank places are nobody').toBe(false)
    expect(inputRowSeveral(row('bane', ['allavail'])), 'a row nobody filed is drawn as it always was').toBe(false)
    expect(inputRowSeveral(row('bane', ['allavail'], { src: 'i1', kept: true })), 'and a dead `kept` row (D363)').toBe(false)
    expect(inputRowSeveral(null)).toBe(false)
  })
  it('an input of one person, and one filed for ALL AVAIL alone: one puck, on the name box’s key', () => {
    expect(drawn({ ground: [row('bane', undefined, { src: 'i1' })] }, 0)).toEqual([`bane@${k(0)}`])
    expect(drawn({ ground: [row('allavail', undefined, { src: 'i1' })] }, 0)).toEqual([`allavail@${k(0)}`])
  })
  it('a row nobody filed keeps its stored order — the name box, then what stands under it', () => {
    const d = { ground: [row('split', ['allavail', 'bane', 'pike'])] }
    expect(drawn(d, 0)).toEqual([`split@${k(0)}`, `allavail@${k(0, 0)}`, `bane@${k(0, 1)}`, `pike@${k(0, 2)}`])
  })
  it('a dead `kept` row keeps its stored order too — it is not its request’s row (D363)', () => {
    const d = { ground: [row('split', ['bane', 'pike'], { src: 'i1', kept: true })] }
    expect(drawn(d, 0)).toEqual([`split@${k(0)}`, `bane@${k(0, 0)}`, `pike@${k(0, 1)}`])
  })
  it('a blank place is left out, and the places after it keep their own keys', () => {
    const filed = { ground: [row('', ['split', '', 'bane'], { src: 'i1' })] }
    expect(drawn(filed, 0), 'an empty name box, a held gap').toEqual([`bane@${k(0, 2)}`, `split@${k(0, 0)}`])
    const hand = { ground: [row('', ['', 'pike'])] }
    expect(drawn(hand, 0)).toEqual([`pike@${k(0, 1)}`])
    expect(drawn({ ground: [row('')] }, 0)).toEqual([])
  })
  it('a row that is not there, and a day with no ground rows, answer with nothing', () => {
    expect(rowPeopleDrawn({ ground: [row('bane')] }, WED, 5)).toEqual([])
    expect(rowPeopleDrawn({}, WED, 0)).toEqual([])
    expect(rowPeopleDrawn(null, WED, 0)).toEqual([])
  })
  it('`drawnPeople` is the same answer under its old name, for the builders not yet moved', () => {
    const d = { ground: [row('z'), row('split', ['bane', 'allavail', 'pike'], { src: 'i1' })] }
    expect(drawnPeople(d, WED, groundGroups(d)[1]!)).toEqual(rowPeopleDrawn(d, WED, 1))
  })
})

describe('groundGroups — every row is its own (dead code until step 6 of the build takes its callers out)', () => {
  const row = (rid: string, o: any = {}) => ({ prog: 'TRAINING', str: '11:00', end: '12:00', who: rid, rmks: '', rid, ...o })
  const shape = (d: any) => groundGroups(d).map(g => `${g.lead}:${g.members.join('+')}`)
  it('one answer a row — its own lead and only member — whatever an old stored row still carries', () => {
    /* rows as a day stored before the build holds them: one a man, the same entry mark — never gathered again */
    const d = { ground: [row('a', { src: 'i1', srcg: 'g1~x' }), row('z'), row('b', { src: 'i2', srcg: 'g1~x' }), row('c', { src: 'i3', srcg: 'g1~x', kept: true }), row('e', { srcg: 'g1~x' })] }
    expect(shape(d)).toEqual(['0:0', '1:1', '2:2', '3:3', '4:4'])
    expect(shape({ ...d, gman: true }), 'on a hand-ordered list too').toEqual(['0:0', '1:1', '2:2', '3:3', '4:4'])
  })
  it('a day with no ground rows answers with nothing', () => {
    expect(groundGroups({})).toEqual([])
    expect(groundGroups(null)).toEqual([])
  })
})
