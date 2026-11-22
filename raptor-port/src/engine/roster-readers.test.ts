/* THE GUARD: EVERY WALK OF THE PEOPLE GOES THROUGH rosterOf, OR IS ALLOWED HERE WITH ITS REASON (multi-squadron batch 1,
   step 3 — the plan docs/superpowers/plans/2026-11-17-multi-sqn-build-batches.md §3.4 "People").

   PEOPLE is ONE list for every squadron (the community's — storage/keyowner.ts). A look-up by id (`PEOPLE[id]`) is
   always fine. What is not fine is a WALK of the whole list — a loop, a filter, a map, a find over every person, or the
   whole record handed to something that walks it — on a surface that lists one squadron's people: it would list the
   other squadron's men too (149's pilots in 142's crew list, its SANS men on 142's SANS calendar). Such a walk asks
   engine/roster.ts rosterOf(unit, iso) instead.

   The guard counts walks, not files: each file's count must equal its allowance below, exactly. A new walk anywhere —
   a second one in an allowed file too — turns it red until it goes through rosterOf or is allowed here with its
   reason; an allowance a file no longer uses turns it red as well, so the list never outlives what it excuses. */
import { describe, it, expect } from 'vitest'
import { join } from 'node:path'
import { countAll, countIn } from '../testing/enumguard'

const SRC = join(__dirname, '..')

/* A WALK OF PEOPLE: Object.keys / values / entries of it (cast or not), a for…in over it, or the whole record handed on
   — as an argument, a default parameter or an assignment (`f(PEOPLE)`, `= PEOPLE)`, `w.PEOPLE = PEOPLE;`), which is how
   a walk hides one call away (tracker/peoplewire.ts projectForTracker(PEOPLE)). `id in PEOPLE` is a look-up, not a walk. */
const WALK = /Object\.(?:keys|values|entries)\(\s*\(?\s*PEOPLE\b|for\s*\(\s*(?:const|let|var)\s+\w+\s+in\s+PEOPLE\b|[(,=]\s*PEOPLE\s*[),;]/

const ALLOWED: Record<string, { n: number; why: string }> = {
  'engine/roster.ts': { n: 1, why: 'rosterOf itself — THE one walk' },
  'engine/people.ts': { n: 10, why: 'the people module\'s own upkeep of every record: each man\'s quals derived from his own ticks, the callsign index (callsigns are unique across the community, D288 — a look-up by callsign is a look-up, not a list), the archived men holding one callsign, the two placeholders (SPECIALS) that stand on every squadron\'s schedule, the seed\'s snapshot, and sansSig — who is SANS from when as one string for a drawing\'s cache key (D2313, ui/peek.ts): it lists nobody and counts nobody, and a change to any squadron\'s man only redraws a preview' },
  /* A RECORD HANDED ON FOR LOOK-UPS BY ID — a default parameter `people = PEOPLE` the model reads only as `people[id]`
     (the name of each person IN an input). Counted all the same, so a walk added behind one is seen. */
  'ui/inputcard-model.ts': { n: 2, why: 'an input card\'s names: the people record is read by id for the men IN the input, never walked' },
  'ui/inputscal-model.ts': { n: 7, why: 'the Inputs calendar\'s filters and names: the people record is read by id for the men IN an input, never walked' },
  'ui/placedline.ts': { n: 3, why: '"By Saber": the filer\'s name, read by id, never walked' },
  'ui/sanscal-model.ts': { n: 2, why: 'the SANS calendar\'s Highlight list (sansRoster) and day (sansDayGroups) walk the record they are HANDED — their screens hand them the signed-in person\'s own squadron (unitPeople(myUnit()) in ui/SansCal.tsx, ui/SansDay.tsx); the default is for their tests' },
  'state/flyplan.ts': { n: 1, why: 'the SANS men committed on a date (sansCommittedOn): its default people list only — every reader in the app hands it one squadron\'s people on the date since step 4 (the SANS day and month, the Leave War\'s need figures through leavewar/sync.ts flyAnswer, engine/roster.ts unitPeople)' },
  'engine/overlay.ts': { n: 1, why: 'the deleted men and the day each is gone from (deletedCutoffs) — a deleted man is stripped from EVERY squadron\'s weeks, so it must see every squadron\'s deleted men' },
  'state/person-delete.ts': { n: 2, why: 'the deleted men again — stripped from an incoming day, and checked against an Undo or Redo — whatever squadron they were in' },
  'state/roster-restore.ts': { n: 1, why: 'the image of the WHOLE roster a restore is checked against (every record, copied)' },
  'state/people-settings-commit.ts': { n: 12, why: 'storage and the one write funnel: the baseline and its rollback are the whole record, laid back whole; a resync and the seed\'s new bodies walk every record by definition' },
  'state/persist.ts': { n: 3, why: 'storage: the whole roster loaded and saved, one row a person' },
  'state/seeds.ts': { n: 1, why: 'the seed: the whole roster emptied before the seed is laid' },
  'state/demoseed.ts': { n: 6, why: 'the demo seed: picks its seeded men out of the demo\'s one squadron by callsign and seat, before the second squadron\'s people are seeded — and, seeding 149 (step 4, seedDemo149), puts the placeholders back last in the people\'s key order' },
  'ui/peoplepick-model.ts': { n: 1, why: 'the two placeholders (ALL AVAIL, ALL) — on every squadron\'s schedule, nobody\'s own' },
  'probe-bridge.ts': { n: 1, why: 'the developer\'s test bridge hands the browser tests the whole record' },
  /* (state/accounts.ts linkablePeople and ui/UsersPanel.tsx's list left this list in batch 1's second half, §4 item 1:
     both read the page's squadron through rosterOf — ui/userslist-model.ts) */
}

const counts = countAll(SRC, WALK)

describe('every walk of the people goes through rosterOf, or is allowed with its reason (multi-squadron step 3)', () => {
  it('each file walks PEOPLE exactly as often as it is allowed — no more, no fewer', () => {
    const allowed = Object.fromEntries(Object.entries(ALLOWED).map(([f, a]) => [f, a.n]))
    expect(counts, 'a walk of the whole people list outside engine/roster.ts rosterOf: go through rosterOf(unit, iso), or allow it in ALLOWED with its reason (and an allowance no longer used is taken off)').toEqual(allowed)
  })
  it('every allowance says why', () => {
    for (const [f, a] of Object.entries(ALLOWED)) expect(a.why.length, f).toBeGreaterThan(20)
  })
  it('the counter sees a walk however it is spelt, and never a look-up, a quoted name or a comment', () => {
    const n = (s: string) => countIn(s, WALK)
    expect(n('for (const id of Object.keys(PEOPLE)) x(id)')).toBe(1)
    expect(n('const a = Object.values((PEOPLE as any)).map(f)')).toBe(1)
    expect(n('for (const id in PEOPLE) {}')).toBe(1)
    expect(n('setPeople(project(PEOPLE))')).toBe(1)
    expect(n('function f(people = PEOPLE) {}')).toBe(1)
    expect(n('const p = PEOPLE[id]; if (id in PEOPLE) ok()')).toBe(0)
    expect(n("const k = { name: 'PEOPLE' } // Object.keys(PEOPLE)")).toBe(0)
    expect(n('/* Object.keys(PEOPLE) */ const b = PEOPLE_BASELINE')).toBe(0)
    expect(n("import { PEOPLE, whoId } from '../engine/people'")).toBe(0)
    /* C9: a walk written inside a template string's ${…} hole (the html builders' style) is a walk all the same; the
       template's literal text is not code */
    expect(n('const h = `<ul>${Object.keys(PEOPLE).map(li).join("")}</ul>`')).toBe(1)
    expect(n('const h = `a ${x ? `<b>${Object.values(PEOPLE).length}</b>` : ""} c`')).toBe(1)
    expect(n('const t = `Object.keys(PEOPLE) is only words here`')).toBe(0)
  })
})
