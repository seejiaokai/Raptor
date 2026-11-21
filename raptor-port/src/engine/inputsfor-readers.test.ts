/* THE GUARD: EVERY READ OF THE WHOLE INPUTS LIST GOES THROUGH inputsFor, OR IS ALLOWED HERE WITH ITS REASON
   (multi-squadron batch 1, step 3 — the plan docs/superpowers/plans/2026-11-17-multi-sqn-build-batches.md §3.4 "Inputs
   stay one list").

   The inputs stay ONE list, one record each, for every squadron. A reader that walks the whole of it for ONE squadron's
   schedule or page — what lands on a day, what a version freezes, a day's filing, the Inputs page's list — would take
   the other squadron's requests too: a 149 member's leave landing on 142's Unavailable list. Such a reader asks
   engine/inputs.ts inputsFor(unit, at), an input belonging to its people's home squadron on that date.

   Beside it stands engine/inputs-readers.test.ts, which asks a different question of the same files (does a reader read
   the per-person LINES or the RECORDS); this one asks only "whose squadron's inputs". It counts reads, not files: each
   file's count must equal its allowance, exactly — a new whole-list read, a second one in an allowed file too, turns it
   red; an allowance no longer used turns it red as well.

   Not counted, because they are not a walk of the list: a change of it (push, splice, indexOf…), its length, an index,
   `includes(row)` (is this the live record), and a look-up of ONE record by its id (a find / findIndex / some on a
   line naming `iid` or `inpId(`). */
import { describe, it, expect } from 'vitest'
import { join } from 'node:path'
import { countAll, countIn } from '../testing/enumguard'

const SRC = join(__dirname, '..')

const NOT_A_WALK = String.raw`(?!(?:\s+as\s+any\[\]\s*\))?\s*(?:\.\s*(?:push|splice|unshift|pop|shift|indexOf|includes|length)\b|\[))`
/* a whole-list read: the stored list by name, the Leave War's doorway to it, the per-person view of every input */
const READ = new RegExp(String.raw`\bINPUTS\b` + NOT_A_WALK + String.raw`|\bwarInputs\(\)` + NOT_A_WALK + String.raw`|\binputLines\(\)`)
const BY_ID = (line: string) => /\.(?:find|findIndex|some)\(/.test(line) && /\biid\b|\binpId\(/.test(line)

const ALLOWED: Record<string, { n: number; why: string }> = {
  'engine/inputs.ts': { n: 11, why: 'the home of the list: its declaration, ids, the seed snapshot, the per-person view of all of it, and inputsFor / inputsOn themselves — with the reshape\'s one body (inputsOnDay for a day reader, inputsTouching and inputsListed for a list reader, the plan §3.2 A-iii)' },
  'engine/overlay.ts': { n: 3, why: 'an index of every input by its id (a look-up table), the stored weeks\' memo signature (requestsSig) — a cache key over every record, never a list shown — and landingRequests, a squadron\'s requests as they land, each judged on its own first day by the one body (inputOnDay — the reshape plan §3.2 A-iii, Fable F4: a writer never iterates "touches")' },
  'engine/medical.ts': { n: 2, why: 'one man\'s medical rows (a man\'s own, whatever squadron) — and, with no man named, the Medical tab\'s three lists, which ui/MedicalView.tsx and ui/InputsPage.tsx narrow to the signed-in person\'s own squadron' },
  'state/person-delete.ts': { n: 1, why: 'a deleted man\'s own inputs — his, whatever squadron' },
  'state/roster-restore.ts': { n: 1, why: 'is a man still named in ANY input — every squadron\'s' },
  'state/history.ts': { n: 1, why: 'the history snapshot: the whole list, stored whole' },
  'state/persist.ts': { n: 1, why: 'storage: every input saved, one row each' },
  'state/sched-commit.ts': { n: 2, why: 'the list kept in its saved order after a command, and the bell\'s notices — each input\'s notice goes to its own people, whatever squadron' },
  'state/store.ts': { n: 3, why: 'upkeep of every record (the till-date tick settled, a missing year filled) and the demo boot\'s other-week requests checked against all (no record twice)' },
  'state/demoseed.ts': { n: 7, why: 'the demo seed: its own seeded records looked for and laid — 142\'s before the second squadron\'s people are seeded, and 149\'s own two (step 4, seedDemo149), looked for by their own man' },
  'ui/InputWindow.tsx': { n: 1, why: 'the ids of every input before a save of several, to find the one record the save added — ids, never a list' },
  'ui/inputedit.tsx': { n: 6, why: 'one man\'s own records — a clash of his leave or medical, his upchits, an OIL answer of his — a man\'s, whatever squadron' },
  'ui/changesmodel.ts': { n: 2, why: 'the records of ONE group filing (by its group id) — a look-up, never a list' },
  'probe-bridge.ts': { n: 4, why: 'the developer\'s test bridge hands the browser tests the whole list' },
  'ui/sanscal-model.ts': { n: 1, why: 'the SANS day\'s model walks the records it is HANDED — ui/SansDay.tsx hands it the signed-in person\'s own squadron\'s (inputsFor(myUnit(), iso)); the default is for its tests' },
  'leavewar/schedrecs.ts': { n: 1, why: 'the Leave War\'s one typed doorway to the list (warInputs)' },
  'leavewar/state/demoworld.ts': { n: 1, why: 'the Leave War demo world\'s inputs' },
  'leavewar/inputgate.ts': { n: 4, why: 'the clash rules at the inputs door: one man\'s leave against his own records (sick cuts leave, no overlap) — a man\'s, whatever squadron; and the gate\'s before-and-after snapshot of every war input\'s claim (snapshot, apply), which must see every input a command could have changed — those two were always there, missed by the old counter until C9 (a template\'s backtick swallowed them)' },
  'leavewar/sync.ts': { n: 10, why: 'the Leave War\'s reads: the absence index and its restore (per person), its writes (approve-extend, cuts, moves), one man\'s OIL question and the bell\'s lines (per person), the ALL AVAIL crowd\'s kept-out men (its people are rosterOf\'s) — since batch 1\'s step 4 each squadron\'s Leave War is a whole world of its own (swapWarWorld), whose people are its own squadron\'s alone (projectPeople), so a read keyed by one of its men never reaches another squadron\'s' },
  'leavewar/ui/DayList.tsx': { n: 1, why: 'the Leave War doorway, for one record by its id' },
  'leavewar/ui/Matrix.tsx': { n: 1, why: 'the Leave War doorway, for the input a war cell derives from, by its id' },
}

const counts = countAll(SRC, READ, BY_ID)

describe('every read of the whole inputs list goes through inputsFor, or is allowed with its reason (multi-squadron step 3)', () => {
  it('each file reads the whole list exactly as often as it is allowed — no more, no fewer', () => {
    const allowed = Object.fromEntries(Object.entries(ALLOWED).filter(([, a]) => a.n > 0).map(([f, a]) => [f, a.n]))
    expect(counts, 'a read of the whole inputs list outside engine/inputs.ts inputsFor: go through inputsFor(unit, at), or allow it in ALLOWED with its reason (and an allowance no longer used is taken off)').toEqual(allowed)
  })
  it('every allowance says why', () => {
    for (const [f, a] of Object.entries(ALLOWED)) if (a.n) expect(a.why.length, f).toBeGreaterThan(20)
  })
  it('the counter sees a whole-list read, and never a change of the list, a look-up by id, a quoted name or a comment', () => {
    const n = (s: string) => countIn(s, READ, BY_ID)
    expect(n('for (const r of INPUTS as any[]) f(r)')).toBe(1)
    expect(n('(INPUTS||[]).forEach(f)')).toBe(1)
    expect(n('const a = warInputs().filter(f)')).toBe(1)
    expect(n('if (inputLines().some(f)) x()')).toBe(1)
    expect(n('function g(rows = INPUTS) {}')).toBe(1)
    expect(n('INPUTS.push(r); INPUTS.splice(i, 1); (INPUTS as any[]).indexOf(r); INPUTS.length; INPUTS[0]; INPUTS.includes(r)')).toBe(0)
    expect(n('const r = INPUTS.find((x: any) => x.iid === id)')).toBe(0)
    expect(n("const k = { name: 'INPUTS' } // INPUTS.filter(f)")).toBe(0)
    expect(n("import { INPUTS, inputsFor } from './inputs'")).toBe(0)
    expect(n('inputsFor(UNIT, dt).forEach(f)')).toBe(0)
    /* C9: a read inside a template string's ${…} hole is counted; the template's literal text is not code */
    expect(n('const h = `<ul>${INPUTS.filter(f).map(li).join("")}</ul>`')).toBe(1)
    expect(n('const t = `INPUTS.filter(f) is only words here`')).toBe(0)
  })
})
