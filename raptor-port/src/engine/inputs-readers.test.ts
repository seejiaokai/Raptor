/* THE GUARD AGAINST A READER LEFT ON THE WRONG LIST ([ALL-AVAIL-AS-MEMBER], the plan's §4.2 — Fable F1, F2, F15;
   docs/superpowers/plans/2026-10-11-one-rule-plan.md; owner D755, D756, D759).

   An input is to become ONE record with the list of its people (D756). From then on a body that asks "is THIS MAN
   busy / away / owed" and still reads the stored list would see an input and not its people — silently: no throw, a
   man simply not flagged. And a body that WRITES, handed the per-person lines instead of the records, would look its
   line up in the list, not find it, and take the LAST input out instead (F1). So every file that reaches the inputs is
   on exactly ONE of three lists here, with what it does:

     LINES    it asks about one man's day and reads the per-person view (inputLines / inputLinesOn). It may not name
              the stored list or the record funnels at all.
     RECORDS  it draws, files, counts, freezes, saves or permits the INPUT and reads the record. A file that does both
              is here, with the bodies that read lines NAMED — the check on those is the review this list forces.
     WRITERS  it changes the list or a record. It finds the RECORD by id and never touches a line.

   A file on no list fails — a NEW file that reaches the inputs stays red until a person has decided which it is. A
   file that changes the list (splice, push, indexOf…) and is not on WRITERS fails. The three funnel files Fable named
   (F2) may not read a day's RECORDS for a man's day at all.

   The lists are what was true on 12 Oct 26, step 1 of the build: the stored records are still one a person. Each later
   step moves files between the lists as it changes them. */
import { describe, it, expect } from 'vitest'
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'

const SRC = join(__dirname, '..')

const LINES: Record<string, string> = {
  'engine/avail.ts': 'who is away for the day or for some hours (dayAway); why a man may not take a place (slotBar — its four absence blocks and its commitment scan)',
  'ui/palette-html.ts': 'the crew list\'s reasons (groundedOnly, offReason)',
  'state/roster-restore.ts': 'is a man still named in any input (stillNamed)',
  'state/flyplan.ts': 'which SANS men have committed on a date (sansCommittedOn)',
  'leavewar/absences.ts': 'one man\'s absences from one line (contribsOfInput, absenceSignature) — it is handed lines by leavewar/sync.ts and reaches no list itself',
}

const RECORDS: Record<string, string> = {
  'engine/inputs.ts': 'the home of the list, of the two funnels by date (inputsOn — records; inputLinesOn — lines) and of the view; sansAvailOn finds one man\'s SANS offer by who is IN the record (namedOf) and hands back the record',
  'engine/events.ts': 'MIXED — a day\'s inputs as the rules read them (mapInp, the whole-day list, both midnight tails) read LINES; a ground row\'s own request, for its clash grade (shiftEvHard), reads the record',
  'engine/weekctx.ts': 'MIXED — who worked a neighbour day (workedSet) reads LINES; the live filing and the neighbours\' issued copies read records',
  'engine/medical.ts': 'the medical lists and trim plans: it hands the records themselves to the one applier and tells them apart by identity — a medical kind holds one person',
  'engine/canonical.ts': 'a request\'s row in the published comparison',
  'engine/drafts.ts': 'loads: a version or a plan against the live requests',
  'engine/lookahead.ts': 'a comment only — its reads go through the week bundle',
  'engine/oilev.ts': 'OIL: one claim a record',
  'engine/overlay.ts': 'a request\'s row, made from its record',
  'engine/publish.ts': 'what a version freezes and what is pending',
  'engine/quarantine.ts': 'a protected day\'s requests',
  'engine/schema.ts': 'the declared shape of a record',
  'engine/validate.ts': 'the official pass installs the issued copies; the rules themselves read the day\'s events',
  'engine/weeks-data.ts': 'the seed weeks\' records',
  'engine/weekstash.ts': 'a comment only',
  'engine/world.ts': 'a comment only',
  'boot.ts': 'the boot: ids and landing',
  'main.tsx': 'a comment only',
  'leavewar/ui/BidPicker.tsx': 'a comment only',
  'leavewar/ui/DayList.tsx': 'one record by its id, for the day\'s list',
  'leavewar/ui/Matrix.tsx': 'a comment only',
  'state/changelines.ts': 'the change history\'s line for an input',
  'state/docs.ts': 'a medical input\'s documents',
  'state/perms.ts': 'who may change an input',
  'state/plan.ts': 'a comment only',
  'state/view.ts': 'UI state that names a request',
  'ui/board-html.ts': 'draws the day\'s inputs on the board',
  'ui/board.ts': 'the board\'s hands on a request\'s row',
  'ui/caldrag.ts': 'a bar dragged on the Inputs calendar',
  'ui/changesmodel.ts': 'the changes window\'s items',
  'ui/ChangesWindow.tsx': 'the changes window',
  'ui/export.ts': 'the CSV: one row an input as stored',
  'ui/histbubble.ts': 'the history bubble of an Unavailable row',
  'ui/html.ts': 'draws the day\'s inputs on the week; how many SANS men have offered reads lines through sansAvailOn',
  'ui/inputscal-model.ts': 'the Inputs calendar\'s bars',
  'ui/InputsCal.tsx': 'the Inputs calendar',
  'ui/InputsSettings.tsx': 'the late cut-off\'s count of inputs',
  'ui/interactions.ts': 'the schedule\'s hands on an input',
  'ui/MedicalView.tsx': 'the Medical tab',
  'ui/MedMoveConfirm.tsx': 'the medical move\'s sheet',
  'ui/oilmode.ts': 'OIL Earn',
  'ui/pendlist.ts': 'the pending list',
  'ui/pops.ts': 'a window\'s open-flag naming a request',
  'ui/sanscal-model.ts': 'the SANS day\'s list: each entry carries its record to the window that changes it',
  'ui/SansCal.tsx': 'the SANS calendar',
  'ui/Shell.tsx': 'a comment only',
  'ui/textedit.ts': 'a typed box on a request',
  'ui/topbits.tsx': 'the bell\'s tap opens a request',
}

const WRITERS: Record<string, string> = {
  'engine/slots.ts': 'files a request on the programme, under Unavailable, or takes it off (acceptInput, unacceptInput)',
  'engine/inputown.ts': 'who is in an input: a person put in, taken out or replaced, and one man given an input of his own (ownInputOf)',
  'state/holderbase.ts': 'the filing a holder\'s day carries',
  'state/store.ts': 'the inputs door (runInputWrite), the week load',
  'state/sched-commit.ts': 'Undo and Redo\'s restore',
  'state/history.ts': 'the history snapshot\'s restore',
  'state/persist.ts': 'the load from storage',
  'state/seeds.ts': 'the seed',
  'state/demoseed.ts': 'the demo seed',
  'state/person-delete.ts': 'a delete\'s and a posting\'s trims (applyDelete)',
  'leavewar/inputgate.ts': 'sick cuts leave',
  'leavewar/state/demoworld.ts': 'the demo world\'s inputs',
  'leavewar/sync.ts': 'MIXED — the war\'s approve-extend, cutDates and moves WRITE; the absence index (refreshAbsences, restoreAbsencesOf), the ALL AVAIL crowd (availableFor) and "has he a past here" (pastOnWar) read LINES; the bell\'s OIL question (oilPendingFor) reads the record — it also answers for an input filed for ALL AVAIL, which has no line',
  'probe-bridge.ts': 'the test bridge files a raw row',
  'ui/inputedit.tsx': 'every save, delete and reassign of an input',
  'ui/InputsPage.tsx': 'MIXED — the List\'s add and delete WRITE; which deleted men still have an input (DeletedGroup) reads LINES',
}

const NAMES = /\bINPUTS\b|\binputsOn\(|\binputLinesOn\(|\binputLines\(|\binpById\(|\binputOn\(/
/* a line, a block and a JSX comment, taken out before a file is searched for what it DOES */
const code = (s: string) => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:'"`\\])\/\/[^\n]*/g, '$1')
const WRITES = /\bINPUTS\.(?:splice|push|unshift|pop|shift|sort|reverse|indexOf)\(|\bINPUTS\.length\s*=[^=]/
const RECORD_READS = /\bINPUTS\b|\binputsOn\(|\binpById\(|\binputOn\(/

function files(dir: string, out: string[] = []): string[] {
  for (const f of readdirSync(dir)) {
    const p = join(dir, f)
    if (statSync(p).isDirectory()) { if (f !== 'testing') files(p, out) }
    else if (/\.(ts|tsx|js|jsx)$/.test(f) && !/\.test\.|\.spec\.|test-setup|testkit/.test(f)) out.push(p)
  }
  return out
}
const rel = (p: string) => relative(SRC, p).replace(/\\/g, '/')
const read = (f: string) => readFileSync(join(SRC, f), 'utf8')
const universe = files(SRC).map(rel).filter(f => NAMES.test(read(f))).sort()
const listed = [LINES, RECORDS, WRITERS]

describe('every file that reaches the inputs is on one list — lines, records or writers (D756; Fable F1, F15)', () => {
  it('no file is on none, and none on two', () => {
    const none = universe.filter(f => !listed.some(l => f in l))
    const twice = universe.filter(f => listed.filter(l => f in l).length > 1)
    expect(none, 'reaches the inputs and is on no list — decide which it is: does it ask about one man\'s day (LINES), about the input (RECORDS), or does it write (WRITERS)?').toEqual([])
    expect(twice, 'on two lists').toEqual([])
  })
  it('the lists name no file that no longer reaches the inputs', () => {
    const gone = listed.flatMap(l => Object.keys(l)).filter(f => !universe.includes(f))
    expect(gone, 'listed, but it no longer names the inputs — take it off its list').toEqual([])
  })
  it('a file on LINES never names the stored list or a record funnel', () => {
    const bad = Object.keys(LINES).filter(f => RECORD_READS.test(code(read(f))))
    expect(bad, 'a per-person reader that reads records would see an input and not its people').toEqual([])
  })
  it('a file that changes the list is on WRITERS — a writer never works on lines (F1)', () => {
    const bad = universe.filter(f => WRITES.test(code(read(f))) && !(f in WRITERS))
    expect(bad, 'changes the inputs list and is not on WRITERS').toEqual([])
  })
  it('the three funnel files read a man\'s day as LINES — never a day\'s records (F2)', () => {
    for (const f of ['engine/events.ts', 'engine/avail.ts', 'engine/weekctx.ts'])
      expect(/\binputsOn\(/.test(code(read(f))), f + ' reads inputLinesOn(dt), which answers a published face\'s own copies').toBe(false)
  })
  it('the comment-stripper sees through a comment and keeps the code', () => {
    expect(code('a /* INPUTS.splice( */ b // INPUTS.indexOf(\nINPUTS.push(x)')).toBe('a  b \nINPUTS.push(x)')
    expect(WRITES.test(code('x = "http://a" + INPUTS.indexOf(r)'))).toBe(true)
  })
})
