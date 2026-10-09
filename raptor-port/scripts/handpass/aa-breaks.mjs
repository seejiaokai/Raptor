// THE BREAK TESTS of "an input filed for ALL AVAIL / ALL" and the kind "Event" (the checking order's §8.4: for every wire
// the roll-call marks as wired, break it once on purpose and watch a NAMED test go red; if nothing goes red, that wire
// has no test, by proof). Each break is one exact text swap in one source file; the named test file is run; the file is
// put back from git. Nothing is left changed: it refuses to start on a tree with changes under src/.
//
//   node scripts/handpass/aa-breaks.mjs            (from raptor-port/; about five minutes)
import { execSync, spawnSync } from 'node:child_process'
import { readFileSync, writeFileSync } from 'node:fs'

const sh = (c) => execSync(c, { encoding: 'utf8' })
if (sh('git status --porcelain -- src').trim()) { console.log('REFUSED: src/ has uncommitted changes — commit first, so every break can be put back from git'); process.exit(2) }

const BREAKS = [
  ['B1 the save boundary\'s hard check is not registered', 'src/state/store.ts',
    "  defineInvariant({ id: PLACEHOLDER_SHAPE, cls: 'hard', check: placeholderShapeViolation })\n", '',
    ['src/ui/placeholderlist.test.tsx', 'src/ui/placeholderdoors.test.tsx']],
  ['B2 a crowd man defaults YES whatever the filer answered (the credit)', 'src/engine/oilev.ts',
    "  return (typed || landedExtras(day, claim.iid, String(claim.person))).includes(String(person)) || own\n", "  return true\n",
    ['src/engine/oilplaceholderclaim.test.ts']],
  ['B3 each man\'s switch does not ask the one default', 'src/engine/oilev.ts',
    "  if (held) return claimDefault(day, ev, held, person)\n", '',
    ['src/ui/oilplaceholderclaim.test.tsx', 'src/engine/oilplaceholderclaim.test.ts']],
  ['B4 the placeholder that holds a request is put into the work', 'src/engine/oilev.ts',
    "    if (!held && earnsFrom(ev, inp.person, item, own)) put(inp.person, span(own))\n", "    if (earnsFrom(ev, inp.person, item, own)) put(inp.person, span(own))\n",
    ['src/engine/oilplaceholderclaim.test.ts']],
  ['B5 the off reason does not know the filer\'s No', 'src/ui/oilmode.ts',
    "  if (held && !itemDefaultFor(di, ev, String(person), item))\n    return { why: held.ans == null ? 'filerUnasked' : 'filerNo', what: String(held.type || '').trim() }\n", '',
    ['src/ui/oilplaceholderclaim.test.tsx']],
  ['B6 the window\'s hint ignores the filer\'s answer', 'src/ui/AvailWindow.tsx',
    "      : m.heldHint ? m.heldHint\n", '',
    ['src/ui/oilplaceholderclaim.test.tsx']],
  ['B7 the request row\'s name keeps the named-request words', 'src/ui/oilmode.ts',
    "      if (isSpecial(claim.person))\n", "      if (false)\n",
    ['src/ui/oilplaceholderclaim.test.tsx']],
  ['B8 the editor\'s one body does not ask the placeholder rules', 'src/ui/inputedit.tsx',
    "  if (placeholderRefused({ person: draft.person, type: draft.type, date, endDate })) return null\n", '',
    ['src/ui/placeholderdoors.test.tsx']],
  ['B9 the group save does not judge the whole selection', 'src/ui/inputedit.tsx',
    "    say(placeholderProblem({ person: ph, type: 'Duty', grp: 1 }), 'warn'); return false\n", "    void 0\n",
    ['src/ui/placeholderdoors.test.tsx']],
  ['B10 reassign accepts a placeholder as the source', 'src/ui/inputedit.tsx',
    "  if (isSpecial(r.person)) { HOOKS.toast(`An input for ${PEOPLE[r.person].cs} is changed in its own window — open it to change who it is for`, 'warn'); return false }\n", '',
    ['src/ui/placeholderdoors.test.tsx']],
  ['B11 "→ Unavail" accepts a placeholder input', 'src/engine/slots.ts',
    "  if(dest==='u'&&isSpecial(inp.person))return false;\n", '',
    ['src/ui/placeholderdoors.test.tsx']],
  ['B12 a placeholder is counted as an absent man', 'src/engine/avail.ts',
    "||PEOPLE[inp.person].special)return;", ")return;",
    ['src/ui/placeholderdoors.test.tsx']],
  ['B13 the bell does not ask the filer', 'src/leavewar/sync.ts',
    "    if ((row.person !== personId && !filedByHim(row)) || !oilAsks(row.type) || row.acc === 'r') continue\n", "    if (row.person !== personId || !oilAsks(row.type) || row.acc === 'r') continue\n",
    ['src/ui/placeholderdoors.test.tsx']],
  ['B14 the bell asks a filer who may no longer answer', 'src/leavewar/sync.ts',
    " && mayEditInput(row)\n", "\n",
    ['src/ui/placeholderdoors.test.tsx']],
  ['B15 the picker does not offer the two entries', 'src/ui/PeoplePick.tsx',
    "              {offerPh && <PlaceholderGroup type={type} current={first} />}\n", '',
    ['src/ui/placeholderdoors.test.tsx']],
  ['B16 the picker\'s line does not know a placeholder', 'src/ui/PeoplePick.tsx',
    "  if (ph != null) {\n", "  if (ph != null && false) {\n",
    ['src/ui/placeholderdoors.test.tsx']],
  ['B17 the List\'s Add form does not ask the one body', 'src/ui/InputsPage.tsx',
    "    if (!several && placeholderRefused({ person: filedFor(), type, date, endDate })) return\n", '',
    ['src/ui/placeholderlist.test.tsx']],
  ['B18 the List\'s pencil editor asks the document question first', 'src/ui/InputsPage.tsx',
    "    if (placeholderRefused(draft)) return\n", '',
    ['src/ui/placeholderlist.test.tsx']],
  ['B19 the List\'s pencil editor leaves the placeholders out of its Person list', 'src/ui/InputsPage.tsx',
    "                      <PlaceholderGroup type={draft.type} current={draft.person} />\n", '',
    ['src/ui/placeholderlist.test.tsx']],
  ['B20 the List compares the filter with a person by hand', 'src/ui/InputsPage.tsx',
    "  rows = rows.filter((r: any) => personFilterPasses(fPerson, r.person))", "  if (fPerson !== 'all') rows = rows.filter((r: any) => r.person === fPerson)",
    ['src/ui/placeholderlist.test.tsx']],
  ['B21 the opened day compares the filter by hand', 'src/ui/InputsCal.tsx',
    "  inputs = inputs.filter((r: any) => personFilterPasses(f.fPerson, r.person))", "  if (f.fPerson !== 'all') inputs = inputs.filter((r: any) => r.person === f.fPerson)",
    ['src/ui/placeholderlist.test.tsx']],
  ['B22 the month compares the filter by hand', 'src/ui/inputscal-model.ts',
    "    personFilterPasses(f.fPerson, r.person, people) &&\n", "    (f.fPerson === 'all' || String(r.person) === String(f.fPerson)) &&\n",
    ['src/ui/placeholderlist.test.tsx']],
  ['B23 Event is not red across a standby shift', 'src/engine/inputs.ts',
    "  'Event':      {name:'event',                    grp:'act',   work:false, local:true,  ground:true,  half:false, shiftHard:true},", "  'Event':      {name:'event',                    grp:'act',   work:false, local:true,  ground:true,  half:false},",
    ['src/engine/eventkind.test.ts']],
  ['B24 a seventh kind is let through for a placeholder', 'src/engine/inputs.ts',
    "export const PLACEHOLDER_KINDS:string[]=['Training','Meeting','Appointment','Duty','Event','Other'];", "export const PLACEHOLDER_KINDS:string[]=['Training','Meeting','Appointment','Duty','Event','Other','Fly with'];",
    ['src/engine/placeholderinput.test.ts']],
  ['B25 the demo\'s two placeholder inputs are not seeded', 'src/state/store.ts',
    "    seedDemoPlaceholders()\n", '',
    ['src/state/demostamps.test.ts']],
  ['B26 "→ Unavail" is drawn for a placeholder\'s Other', 'src/ui/html.ts',
    "    +(/^Other$/i.test(String(inp.type))&&!isSpecial(inp.person)\n", "    +(/^Other$/i.test(String(inp.type))\n",
    ['src/ui/placeholderdoors.test.tsx']],
  ['B27 an admin is offered "File it for me only"', 'src/ui/PeoplePick.tsx',
    "    if (why) return { why, fix: !canEditSched() && mine != null ? [mine] : [], fixLabel: 'File it for me only' }\n", "    if (why) return { why, fix: mine != null ? [mine] : [], fixLabel: 'File it for me only' }\n",
    ['src/ui/placeholderdoors.test.tsx']],
]

let red = 0, green = 0
for (const [name, file, from, to, tests] of BREAKS) {
  const src = readFileSync(file, 'utf8')
  if (src.split(from).length !== 2) { console.log(`SKIP   ${name} — the text to break is not there exactly once in ${file}`); green++; continue }
  writeFileSync(file, src.replace(from, to))
  let r
  try { r = spawnSync('npx', ['vitest', 'run', ...tests], { encoding: 'utf8', shell: true, timeout: 240000 }) }
  finally { writeFileSync(file, src) }
  const out = (r.stdout || '') + (r.stderr || '')
  const failed = /Tests\s+\d+ failed/.test(out) || /Test Files\s+\d+ failed/.test(out)
  const which = (out.match(/^\s*[×✗] .*$/gm) || []).slice(0, 2).map(s => s.trim().slice(0, 110)).join(' | ')
  if (failed) { red++; console.log(`RED    ${name} — ${tests.join(', ')}: ${which}`) }
  else { green++; console.log(`GREEN  ${name} — NOTHING went red in ${tests.join(', ')}: this wire has no test`) }
}
console.log(`\n${red} of ${BREAKS.length} breaks caught · ${green} not caught`)
if (sh('git status --porcelain -- src').trim()) console.log('WARNING: src/ is not as it was — check `git status`')
process.exit(green ? 1 : 0)
