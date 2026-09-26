/* Break tests for [ACCOUNTS-NEW-PERSON] (bug-check order §8.4, 26 Sep 26): break each wired surface ONCE on
   purpose, run its named test file(s), record which tests went red, restore the file byte for byte.
   RUN IT IN A SCRATCH WORKTREE of the committed code, never in a checkout someone is reading (a reviewer
   could read a deliberately broken file — skill-observation #281):
     git worktree add --detach <scratch>/bt HEAD
     (PowerShell) New-Item -ItemType Junction -Path <scratch>/bt/raptor-port/node_modules -Target <repo>/raptor-port/node_modules
     node raptor-port/scripts/handpass/np-breaks.mjs <scratch>/bt/raptor-port [B1,B2,…]
   Results: BREAKS_OUT (default <root>/../../breaks.json). B11 and B24 are the first, too-loose forms of B11b and
   B24b (B11's text matched twice; B24 pointed at test files with no storage behind them) — kept so a re-run shows
   the same table as the evidence sheet §7. The sign-up selects' geometry break is a browser test, run by hand
   (§7, B30). */
import { readFileSync, writeFileSync } from 'node:fs'
import { spawnSync } from 'node:child_process'

const ROOT = process.argv[2]           // …/bt/raptor-port
const only = process.argv[3] ? process.argv[3].split(',') : null
const NPUI = 'src/ui/accounts-newperson.test.tsx'
const RA = 'src/state/roster-add.test.ts'
const ACC = 'src/state/accounts.test.ts'
const QU = 'src/ui/quals.test.tsx'
const PERMS = 'src/state/perms.test.ts'

const B = [
  ['B1', 'Sign-up card: its four labelled fields', 'src/ui/AccessScreen.tsx', '<label htmlFor="accIni">Initials</label>', '', [NPUI]],
  ['B2', 'Sign-up card: personnel have no CAT box', 'src/ui/AccessScreen.tsx', "{seat !== 'GND' && <>", '{true && <>', [NPUI]],
  ['B3', 'Waiting screen + the waiting list: "what he gave" in one line', 'src/state/accounts.ts', "return [r.ini, seat, r.cat && `CAT ${r.cat}`].filter(Boolean).join(' · ')", "return ''", [NPUI, ACC]],
  ['B4', "The bell: each admin's own seen (D227)", 'src/state/accounts.ts', 'ACCESS_REQS.filter(r => !r.seenBy.includes(id))', 'ACCESS_REQS.slice()', [NPUI, ACC]],
  ['B5', 'The bell: the phone category list does not count (Admin page `shown`)', 'src/ui/AdminPage.tsx', "shown={cat === 'users' && (drilled || !HOOKS.isPhone())}", "shown={cat === 'users'}", [NPUI]],
  ['B6', 'The bell: the list on screen puts it out (Users panel effect)', 'src/ui/UsersPanel.tsx', 'if (!p.shown || !accessAlert()) return', 'if (true) return', [NPUI]],
  ['B7', "The bell's order: access before a bug report", 'src/ui/Shell.tsx', "              if (accessAlert()) {\n", "              if (false && accessAlert()) {\n", [NPUI]],
  ['B8', "Approve → New person: the admin's corrections win", 'src/state/accounts.ts', 'export function approveRequestNew(reqId: string, np: NewPerson, role: AccountRole): string | null {', 'export function approveRequestNew(reqId: string, np: NewPerson, role: AccountRole): string | null {\n  np = (ACCESS_REQS.find(r => r.id === reqId) as any) ?? np', [NPUI]],
  ['B9', 'Approve → On the roster: never pre-picked (D204)', 'src/ui/UsersPanel.tsx', "np: { cs: r.cs, ini: r.ini, seat: r.seat, cat: r.cat }, pid: '', role: 'main',", "np: { cs: r.cs, ini: r.ini, seat: r.seat, cat: r.cat }, pid: rosterMatch(r)?.pid ?? '', role: 'main',", [NPUI]],
  ['B10', 'Approve → On the roster: a person who already has an account is said so (Fable read #1)', 'src/ui/UsersPanel.tsx', '  if (acct) return { pid: hit,', '  if (false && acct) return { pid: hit,', [NPUI]],
  ['B11', 'Add → New person with a sign-in: person AND account', 'src/state/accounts.ts', '    writeAccounts([...ACCOUNTS_LIST, { id: newAccountId(), name, role, pid, on: true }])', '    void pid', [NPUI, ACC]],
  ['B12', 'Add → New person, blank sign-in: a roster-only person', 'src/state/roster-add.ts', "return saidOf(commitPeopleIntent('person.add', null, () => { putNewPerson(np) }))", 'return null', [NPUI, RA]],
  ['B13', 'Add form: clears whole after an add (Astra read #1)', 'src/ui/UsersPanel.tsx', "const resetAddForm = () => { setName(''); setPid(''); setNp(BLANK); setRole('main'); setMode('roster') }", "const resetAddForm = () => { setName(''); setNp(BLANK); setRole('main'); setMode('roster') }", [NPUI]],
  ['B14', 'Seat → CAT: personnel hold none, a CAT never rides through (Astra read #2)', 'src/state/roster-add.ts', '      : []', "      : Object.keys(QCHIP).filter(k => k !== 'IP' && k !== 'IR')", [NPUI, RA]],
  ['B15', 'The words: "Callsign/Name" on the New person fields (D219)', 'src/ui/UsersPanel.tsx', '<label htmlFor={`${p.idp}Cs`}>{CALLSIGN_LABEL}</label>', '<label htmlFor={`${p.idp}Cs`}>Callsign</label>', [NPUI]],
  ['B16', 'Quals "+ Add person" → Admin → Users (D217)', 'src/ui/QualsPage.tsx', 'onClick={() => openAdminUsers({ newPerson: true })}>+ Add person</button>', 'onClick={() => {}}>+ Add person</button>', [NPUI, QU]],
  ['B17', 'Quals column head "Callsign/Name" (D219)', 'src/ui/QualsPage.tsx', "+ sortTh('cs', CALLSIGN_LABEL,", "+ sortTh('cs', 'Callsign',", [QU]],
  ['B18', 'Quals CSV first head "Callsign/Name"', 'src/ui/QualsPage.tsx', "const head = [CALLSIGN_LABEL, 'Initials',", "const head = ['Callsign', 'Initials',", [QU]],
  ['B19', 'The one add: PID-01, a callsign that is anyone\'s is refused', 'src/state/roster-add.ts', '    if (hit) {', '    if (false && hit) {', [RA, ACC]],
  ['B20', 'The one add: personnel stored with no CAT', 'src/state/roster-add.ts', "seat: 'GND', pers: true, q: '',", "seat: 'GND', pers: true, q: 'C',", [RA]],
  ['B21', 'The one add: 14 letters, a longer name refused (D226)', 'src/state/roster-add.ts', 'if (np.cs.length > MAX_CS) return CS_TOO_LONG', 'if (np.cs.length > MAX_CS + 6) return CS_TOO_LONG', [RA, NPUI]],
  ['B22', 'The one add: initials never required (D225)', 'src/state/roster-add.ts', '  if (np.ini.length > MAX_INITIALS) return', "  if (!np.ini) return 'Type the initials'\n  if (np.ini.length > MAX_INITIALS) return", [RA, NPUI, ACC]],
  ['B23', 'The sign-up never says whether a callsign is taken', 'src/state/accounts.ts', 'const bad = newPersonProblem(npIn, { roster: false })', 'const bad = newPersonProblem(npIn)', [ACC]],
  ['B24', 'A person is kept across a reload (the roster persisted inside the command)', 'src/state/people-settings-commit.ts', 'const advancePeople = () => { rawPersistPeople(); PEOPLE_BASELINE = JSON.stringify(PEOPLE) }', 'const advancePeople = () => { PEOPLE_BASELINE = JSON.stringify(PEOPLE) }', [RA, ACC]],
  ['B25', 'Permissions: approving with New person writes a Person (§11 / the command gate)', 'src/state/perms.ts', "'access.approveNew': op(T.accessreq, 'D', 'never', [[T.user, 'C'], [T.person, 'C']]),", "'access.approveNew': op(T.accessreq, 'D', 'never', [[T.user, 'C']]),", [PERMS, ACC]],
  ['B26', 'A pending "open Users" never outlives a sign-in', 'src/state/view.ts', "{ name:'ADMINOPEN', scopes:['session'], reset:()=>clearAdminOpen() },", "{ name:'ADMINOPEN', scopes:[], reset:()=>clearAdminOpen() },", [NPUI]],
  ['B11b', 'Add → New person with a sign-in: person AND account (unique match)', 'src/state/accounts.ts', '    const pid = putNewPerson(np)\n    writeAccounts([...ACCOUNTS_LIST, { id: newAccountId(), name, role, pid, on: true }])', '    const pid = putNewPerson(np); void pid', [NPUI, ACC]],
  ['B24b', 'A person is kept across a reload — the real storage wiring', 'src/state/people-settings-commit.ts', 'const advancePeople = () => { rawPersistPeople(); PEOPLE_BASELINE = JSON.stringify(PEOPLE) }', 'const advancePeople = () => { PEOPLE_BASELINE = JSON.stringify(PEOPLE) }', ['src/state/txn-wiring.test.ts']],
  ['B28', 'Approve note: the account is checked before archived (both fix checks #1)', 'src/ui/UsersPanel.tsx', '  if (acct) return { pid: hit, note:', '  if (acct && !p.archived) return { pid: hit, note:', [NPUI]],
  ['B29', "The account editor keeps its archived person in the picker (Astra's fix check #2)", 'src/state/accounts.ts', 'return p && !p.special && (id === keep || (!p.archived && !accountOfPid(id)))', 'return p && !p.special && !p.archived && (id === keep || !accountOfPid(id))', [NPUI, ACC]],
  ['B31', "Approve note: the signed-in admin's OWN account names another admin (Astra's second fix check)", 'src/ui/UsersPanel.tsx', 'const him = isOwnAccount(acct)', 'const him = false && isOwnAccount(acct)', [NPUI]],
  ['B32', "Approve note: an archived man who is back — restore said as the step after (Fable's second fix check)", 'src/ui/UsersPanel.tsx', "${p.archived ? ', and restore them on the Quals page if they are back' : ''}", '', [NPUI]],
  ['B27', 'Only an admin adds a person (the function gate)', 'src/state/roster-add.ts', "if (!mayManageRoster()) return 'Only an admin can add someone'", '', [RA, ACC]],
]

const out = []
for (const [id, surface, file, find, repl, tests] of B) {
  if (only && !only.includes(id)) continue
  const p = `${ROOT}/${file}`
  const orig = readFileSync(p, 'utf8')
  const n = orig.split(find).length - 1
  if (n !== 1) { out.push({ id, surface, file, error: `find matched ${n} times` }); console.log(`${id} SKIP — find matched ${n} times`); continue }
  writeFileSync(p, orig.replace(find, repl))
  let r
  try {
    r = spawnSync(process.platform === 'win32' ? 'npx.cmd' : 'npx', ['vitest', 'run', ...tests], { cwd: ROOT, encoding: 'utf8', shell: true, maxBuffer: 64 << 20 })
  } finally { writeFileSync(p, orig) }
  const text = (r.stdout || '') + (r.stderr || '')
  const red = [...new Set([...text.matchAll(/^\s*×\s+(.+?)(?:\s+\d+ms)?$/gm)].map(m => m[1].trim()))]
  const summary = (text.match(/Tests\s+.+/) || [''])[0].trim()
  out.push({ id, surface, file, exit: r.status, red, summary })
  console.log(`${id} ${r.status ? 'RED' : 'GREEN(!)'} — ${surface} :: ${summary}`)
  for (const t of red.slice(0, 4)) console.log(`     × ${t}`)
}
writeFileSync(process.env.BREAKS_OUT || `${ROOT}/../../breaks.json`, JSON.stringify(out, null, 2))
