/* [ACCOUNTS] D200 (3) — the permissions matrix (state/perms.ts) against the table IT
   builds the database's security from (docs/data-model.md §11), and the command gate
   against every command type the app registers.

   "One place in the app answers 'may this person do this?', mirroring that table, with a
   test that fails when they disagree" — owner, D200, 26 Sep 26. This is that test. Register line AC14. */
import { describe, it, expect, beforeAll, beforeEach, afterEach } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import {
  PERMS, T, MEDICAL_DETAIL, COMMAND_OPS, allows, cmdAuthorize, type Act, type Cell, type Role,
  memberFilesForOthers, mayFileInputFor, mayFileGroup, mayEditInput, mayDeleteInput, filedForOther, INPUT_FILER_NOTE,
} from './perms'
import { registeredTypes } from '../command'
import type { Actor } from '../command/types'
import { initStore, resetSession, notify, switchRoleView } from './store'
import { signIn, sessionFor } from './accounts'
import { setMembersFile } from './memberfile'
import { storeBackend } from '../engine/hooks'
import { INPUT_TYPES, isLeave, needsDoc, isSansAvail, typeGroup } from '../engine/inputs'
import { lwHistInit } from '../leavewar/state/store'

const ROOT = join(__dirname, '..', '..')
const read = (p: string) => readFileSync(join(ROOT, p), 'utf8')

/* ---- the §11 parser -----------------------------------------------------------
   Reads the letters C R U D in each cell; "own" makes the letters of its clause the
   own-row rule; words in parentheses are notes; "gap: [ITEM-ID]" in the notes column
   names a rule the app does not obey yet. */
const ROLES: Role[] = ['admin', 'member', 'guest', 'pending']
function parseCell(raw: string): Cell {
  let t = raw.replace(/\*\*/g, '').replace(/`/g, '').trim()
  while (/\([^()]*\)/.test(t)) t = t.replace(/\([^()]*\)/g, ' ')
  const out: Cell = { all: [], own: [] }
  if (/^—\s*$/.test(t) || t === '') return out
  for (const clause of t.split(/[;,]/)) {
    const words = clause.trim().split(/\s+/).filter(Boolean)
    const letters = words.filter(w => /^[CRUD]$/.test(w)) as Act[]
    const own = words.includes('own')
    for (const l of letters) (own ? out.own : out.all).push(l)
  }
  return out
}
function section11(): { head: string[]; rows: Record<string, { cells: Record<Role, Cell>; gaps: string[]; guestNote: string }> } {
  const md = read('docs/data-model.md')
  const a = md.indexOf('## 11. Security roles'), b = md.indexOf('## 12.')
  expect(a, '§11 exists').toBeGreaterThan(0)
  const lines = md.slice(a, b).split('\n').filter(l => l.startsWith('|'))
  const split = (l: string) => l.split('|').slice(1, -1).map(x => x.trim())
  const head = split(lines[0])
  const rows: Record<string, any> = {}
  for (const l of lines.slice(2)) {
    const c = split(l)
    const key = c[0].replace(/`/g, '').trim()
    const cells = {} as Record<Role, Cell>
    ROLES.forEach((r, i) => { cells[r] = parseCell(c[i + 1]) })
    const gaps = [...c[5].matchAll(/gap:\s*`?\[([A-Z0-9-]+)\]/g)].map(m => m[1])
    rows[key] = { cells, gaps, guestNote: c[3] }
  }
  return { head, rows }
}
const sortCell = (c: Cell) => ({ all: [...c.all].sort(), own: [...c.own].sort() })

describe('D200 (3): the permissions matrix IS data-model.md §11', () => {
  const { head, rows } = section11()

  it('§11 has the columns the matrix has', () => {
    expect(head).toEqual(['Table', 'Admin', 'Member', 'Guest', 'Pending', 'Own-row rule and notes'])
  })
  it('every §11 row is in PERMS and every PERMS row is in §11', () => {
    expect(Object.keys(rows).sort()).toEqual(Object.keys(PERMS).sort())
  })
  for (const key of Object.keys(PERMS)) {
    it(`"${key}" — every role's letters and own-row letters match`, () => {
      const doc = rows[key]
      expect(doc, `§11 row ${key}`).toBeTruthy()
      for (const r of ROLES) expect(sortCell(PERMS[key][r]), `${key} / ${r}`).toEqual(sortCell(doc.cells[r]))
    })
    it(`"${key}" — the named gaps match (a gap cannot open or close silently)`, () => {
      expect([...PERMS[key].gaps].sort()).toEqual([...rows[key].gaps].sort())
    })
  }
  it('D211 + D213: the medical-detail rule and §11 agree — every member reads a medical input in full, and a guest too', () => {
    const guestNote = rows[T.input].guestNote
    expect(MEDICAL_DETAIL.includes('guest')).toBe(!/no medical detail/.test(guestNote))
    expect(MEDICAL_DETAIL).toEqual(expect.arrayContaining(['admin', 'member', 'guest']))
  })
  it('the parser itself reads the forms the table uses', () => {
    expect(parseCell('R, C U D **own** (while `stage = open`)')).toEqual({ all: ['R'], own: ['C', 'U', 'D'] })
    expect(parseCell('C R U D **own**; R')).toEqual({ all: ['R'], own: ['C', 'R', 'U', 'D'] })
    expect(parseCell('R (D by sweep only)')).toEqual({ all: ['R'], own: [] })
    expect(parseCell('C R U D (decide, move)')).toEqual({ all: ['C', 'R', 'U', 'D'], own: [] })
    expect(parseCell('—')).toEqual({ all: [], own: [] })
  })
})

describe('allows — the one rule under every question', () => {
  it('a member edits his own Person row and not another (D149)', () => {
    expect(allows('member', T.person, 'U', 'bane', 'bane')).toBe(true)
    expect(allows('member', T.person, 'U', 'stiff', 'bane')).toBe(false)
    expect(allows('admin', T.person, 'U', 'stiff', 'bane')).toBe(true)
  })
  it('a guest reads the published week and writes nothing', () => {
    expect(allows('guest', T.sched, 'R')).toBe(true)
    for (const [t, a] of [[T.sched, 'U'], [T.input, 'C'], [T.person, 'U'], [T.bid, 'C'], [T.tracker, 'U']] as [string, Act][])
      expect(allows('guest', t, a, 'x', 'x'), `${t} ${a}`).toBe(false)
  })
  it('a pending person may only ask for access, as himself', () => {
    expect(allows('pending', T.accessreq, 'C', 'hex2@mail', 'hex2@mail')).toBe(true)
    expect(allows('pending', T.accessreq, 'C', 'someone@else', 'hex2@mail')).toBe(false)
    expect(allows('pending', T.accessreq, 'D', 'hex2@mail', 'hex2@mail')).toBe(false)
    expect(allows('pending', T.sched, 'R')).toBe(false)
  })
  it('an account switched off holds nothing', () => {
    for (const t of Object.keys(PERMS)) for (const a of ['C', 'R', 'U', 'D'] as Act[]) expect(allows('off', t, a, 'x', 'x')).toBe(false)
  })
  it('an own-row letter never matches a missing identity', () => {
    expect(allows('member', T.person, 'U', 'bane', null)).toBe(false)
    expect(allows('member', T.person, 'U', '', '')).toBe(false)
  })
})

/* ---- AN INPUT FILED FOR ANOTHER MAN (owner D654, D655, D658, D660 — 7 Oct 26; the build plan
   docs/superpowers/plans/2026-10-07-inputs-sans-redesign-plan.md §3.13) ----
   A second kind of "mine" on the one table every member writes: a Duty & other commitments input (never SANS
   Availability) that he FILED for another man, while the squadron's switch is on. The questions take the RECORD now —
   the answer depends on who filed it and its kind. These are the questions the screens ask; what a member's command
   really changed is held by the commit gate, through the real route: leavewar/groupinput.test.ts. */
describe('D654 / D655: the input questions take the record — the man, whoever filed it, an admin', () => {
  const mem: Record<string, string> = {}
  const as = (name: string, pass = 'x') => { resetSession(sessionFor(signIn(name, pass))); notify() }
  const rec = (person: string, o: Record<string, any> = {}) => ({ iid: 'ix', person, type: 'Meeting', date: 'Feb 10', yr: 2026, allday: false, s: 540, e: 600, remarks: '', ...o })
  beforeEach(() => {
    Object.keys(mem).forEach(k => delete mem[k])
    storeBackend.impl = { getItem: (k: string) => (k in mem ? mem[k]! : null), setItem: (k: string, v: string) => { if (v === 'null') delete mem[k]; else mem[k] = v }, keys: () => Object.keys(mem) }
    initStore(); resetSession(null)
  })
  afterEach(() => { resetSession(null); storeBackend.impl = null })
  const off = () => { as('ad', 'a'); expect(setMembersFile(false).ok).toBe(true) }

  it('which kinds a member may file for others: Duty & other commitments, never SANS Availability (D655, D658)', () => {
    for (const t of INPUT_TYPES) {
      const want = !isLeave(t) && !needsDoc(t) && !isSansAvail(t)
      expect(memberFilesForOthers(t), t).toBe(want)
      expect(want, `${t} is under the Duty & other commitments heading`).toBe(typeGroup(t) === 'other' && !isSansAvail(t))
    }
    for (const t of ['Meeting', 'Duty', 'Training', 'Appointment', 'Other']) expect(memberFilesForOthers(t), t).toBe(true)
    for (const t of ['LL', 'OL', 'ATT C', 'ATT B', 'OML', 'HL', 'Upchit', 'SANS Availability']) expect(memberFilesForOthers(t), t).toBe(false)
    expect(memberFilesForOthers('no such kind'), 'a kind the app does not know').toBe(false)
    expect(memberFilesForOthers(''), 'no kind').toBe(false)
  })
  it('SANS Availability stays out with the switch on or off (D658)', () => {
    expect(memberFilesForOthers('SANS Availability')).toBe(false)
    off()
    expect(memberFilesForOthers('SANS Availability')).toBe(false)
    expect(memberFilesForOthers('Meeting'), 'the kind test is not the switch').toBe(true)
  })

  it('mayFileInputFor: an admin anyone, any kind; a member himself any kind, another man only a duty or commitment', () => {
    as('ad', 'a')
    for (const t of ['Meeting', 'LL', 'ATT C', 'Upchit', 'SANS Availability']) expect(mayFileInputFor('rocky', t), `admin ${t}`).toBe(true)
    as('us', 'us')
    for (const t of ['Meeting', 'LL', 'ATT C', 'Upchit', 'SANS Availability']) expect(mayFileInputFor('bane', t), `own ${t}`).toBe(true)
    expect(mayFileInputFor('rocky', 'Meeting')).toBe(true)
    for (const t of ['LL', 'OL', 'ATT C', 'OML', 'Upchit', 'SANS Availability', 'no such kind']) expect(mayFileInputFor('rocky', t), `other ${t}`).toBe(false)
    expect(mayFileInputFor('rocky', undefined), 'a kind not named is never filed for another man').toBe(false)
    expect(mayFileInputFor(null, 'Meeting'), 'nobody').toBe(false)
  })
  it('mayFileInputFor: with the switch off a member files for himself only', () => {
    off()
    as('us', 'us')
    expect(mayFileInputFor('rocky', 'Meeting')).toBe(false)
    expect(mayFileInputFor('bane', 'Meeting')).toBe(true)
    as('ad', 'a')
    expect(mayFileInputFor('rocky', 'Meeting'), 'an admin is not switched').toBe(true)
  })
  it('mayFileGroup: an admin any kind but the medical ones and the upchit (D655 reading 4); a member a duty or commitment while the switch is on', () => {
    as('ad', 'a')
    for (const t of ['Meeting', 'LL', 'OL', 'SANS Availability']) expect(mayFileGroup(t), `admin ${t}`).toBe(true)
    for (const t of ['ATT C', 'ATT B', 'OML', 'HL', 'Upchit']) expect(mayFileGroup(t), `admin ${t}`).toBe(false)
    as('us', 'us')
    expect(mayFileGroup('Meeting')).toBe(true)
    for (const t of ['LL', 'ATT C', 'Upchit', 'SANS Availability']) expect(mayFileGroup(t), `member ${t}`).toBe(false)
    off()
    as('us', 'us')
    expect(mayFileGroup('Meeting')).toBe(false)
  })

  it('mayEditInput / mayDeleteInput: the man in full; the filer of a duty or commitment; an admin; nobody else', () => {
    as('us', 'us')
    for (const q of [mayEditInput, mayDeleteInput]) {
      expect(q(rec('bane', { type: 'LL', by: 'stiff' })), 'his own, whoever filed it, any kind').toBe(true)
      expect(q(rec('rocky', { by: 'bane' })), 'he filed it').toBe(true)
      expect(q(rec('rocky', { by: 'stiff', grp: 'g1', grpBy: 'bane' })), 'he filed the entry another man was added to').toBe(true)
      expect(q(rec('rocky', { by: 'stiff' })), 'filed by someone else').toBe(false)
      expect(q(rec('rocky', { by: 'casper', grp: 'g1', grpBy: 'casper' })), 'another member\'s entry').toBe(false)
      expect(q(rec('rocky')), 'no filer recorded: the man and an admin only (D56)').toBe(false)
      expect(q(rec('rocky', { type: 'LL', by: 'bane' })), 'a leave is never his, whatever the record says').toBe(false)
      expect(q(rec('rocky', { type: 'SANS Availability', by: 'bane' })), 'nor a SANS availability').toBe(false)
      expect(q(null), 'no record').toBe(false)
    }
    as('ad', 'a')
    for (const q of [mayEditInput, mayDeleteInput]) for (const r of [rec('rocky'), rec('rocky', { type: 'LL', by: 'bane' })]) expect(q(r)).toBe(true)
  })
  it('with the switch off his filing is no longer his to change — the man and an admin still can', () => {
    off()
    as('us', 'us')
    expect(mayEditInput(rec('rocky', { by: 'bane' }))).toBe(false)
    expect(mayDeleteInput(rec('rocky', { by: 'stiff', grp: 'g1', grpBy: 'bane' }))).toBe(false)
    expect(mayEditInput(rec('bane', { by: 'stiff' })), 'his own is untouched by the switch').toBe(true)
    as('hex')
    expect(mayEditInput(rec('rocky', { by: 'bane' })), 'the man').toBe(true)
    as('ad', 'a')
    expect(mayEditInput(rec('rocky', { by: 'bane' })), 'an admin').toBe(true)
  })
  it('the admin\'s member view is judged as a member', () => {
    as('ad', 'a')
    const others = rec('rocky', { by: 'bane' })
    expect(mayEditInput(others)).toBe(true)
    switchRoleView()
    expect(mayEditInput(others), 'Saber, as a member, did not file it').toBe(false)
    expect(mayEditInput(rec('rocky', { by: 'stiff' })), 'what he filed for another man is his as a filer').toBe(true)
    expect(mayFileInputFor('rocky', 'LL')).toBe(false)
    switchRoleView()
    expect(mayFileInputFor('rocky', 'LL')).toBe(true)
  })
  it('a guest, a pending person and an account switched off: nothing', () => {
    for (const s of [{ user: 'principal:g', role: 'guest', pid: null, name: 'g' }, { user: 'principal:p', role: 'pending', pid: null, name: 'p' }, { user: 'principal:o', role: 'off', pid: null, name: 'o' }]) {
      resetSession(s as any)
      expect(mayFileInputFor('rocky', 'Meeting'), s.role).toBe(false)
      expect(mayFileGroup('Meeting'), s.role).toBe(false)
      expect(mayEditInput(rec('rocky', { by: 'bane' })), s.role).toBe(false)
      expect(mayDeleteInput(rec('rocky', { by: 'bane' })), s.role).toBe(false)
    }
  })
  it('with nobody signed in (the headless engine) every question answers as before: yes', () => {
    resetSession(null)
    expect(mayFileInputFor('rocky', 'LL')).toBe(true)
    expect(mayEditInput(rec('rocky'))).toBe(true)
    expect(mayDeleteInput(rec('rocky'))).toBe(true)
  })
  it('filedForOther — the one test of "he filed it for another man", on a record before and after', () => {
    const a = rec('rocky', { by: 'bane' })
    expect(filedForOther('bane', a, { ...a, e: 700 }), 'a change').toBe(true)
    expect(filedForOther('bane', null, a), 'a filing').toBe(true)
    expect(filedForOther('bane', a, null), 'a deletion').toBe(true)
    expect(filedForOther('bane', a, { ...a, person: 'casper' }), 'never moved to another man').toBe(false)
    expect(filedForOther('bane', a, { ...a, type: 'LL' }), 'never retyped to a leave').toBe(false)
    expect(filedForOther('bane', { ...a, type: 'LL' }, a), 'nor from one').toBe(false)
    expect(filedForOther('bane', { ...a, by: 'stiff' }, { ...a, by: 'bane' }), 'read from the record as it WAS on a change').toBe(false)
    expect(filedForOther('bane', null, { ...a, by: 'stiff', grp: 'g1', grpBy: 'bane' }), 'the entry\'s filer').toBe(true)
    expect(filedForOther('casper', a, { ...a, e: 700 }), 'someone else').toBe(false)
    expect(filedForOther('bane', null, null), 'nothing').toBe(false)
    off()
    expect(filedForOther('bane', a, { ...a, e: 700 }), 'the switch off').toBe(false)
  })
  it('§11\'s Input row says the same: the letters stand, and its own-row note carries the filer\'s clause word for word (D200)', () => {
    const md = read('docs/data-model.md')
    const row = md.split('\n').find(l => l.startsWith('| `Input` |'))
    expect(row, '§11 Input row').toBeTruthy()
    expect(row!).toContain(INPUT_FILER_NOTE)
    for (const d of ['D654', 'D655', 'D658', 'D660']) expect(INPUT_FILER_NOTE, d).toContain(d)
    expect(sortCell(PERMS[T.input].member)).toEqual({ all: ['R'], own: ['C', 'D', 'R', 'U'] })
  })
  it('the switch\'s command is the admin\'s, like every setting', () => {
    expect(cmdAuthorize('settings.memberfile', actor('admin', 'stiff'))).toBe(true)
    expect(cmdAuthorize('settings.memberfile', actor('member', 'bane'))).toBe(false)
  })
})

const actor = (role: Actor['role'], personId?: string, principal?: string): Actor => ({ id: 'x', role, personId, principal, session: {} })

describe('the command gate (cmdAuthorize) — every command the app registers', () => {
  beforeAll(() => { initStore(); lwHistInit() })

  it('every registered command type has a row, and every row names a PERMS table', () => {
    const missing = registeredTypes().filter(t => !COMMAND_OPS[t])
    expect(missing, 'registered types with no COMMAND_OPS row').toEqual([])
    for (const [t, o] of Object.entries(COMMAND_OPS)) {
      expect(PERMS[o.table], `${t} → ${o.table}`).toBeTruthy()
      /* [ACCOUNTS-NEW-PERSON] (Fable's plan read F11): every OTHER table a command writes is a row too */
      for (const [mt] of o.more || []) expect(PERMS[mt], `${t} → more ${mt}`).toBeTruthy()
    }
  })
  it("NP8 — a command is authorised only if EVERY table it writes allows it (Astra's plan read 1)", () => {
    /* [ONE-DOOR] (D308; round 1 — Fable F11 / Astra 6): each also writes his post-in date on the war */
    expect(COMMAND_OPS['account.addNew'].more).toEqual([[T.person, 'C'], [T.accessreq, 'D'], [T.profile, 'U']])
    expect(COMMAND_OPS['access.approveNew'].more).toEqual([[T.user, 'C'], [T.person, 'C'], [T.profile, 'U']])
    expect(COMMAND_OPS['account.update'].more, 'a rename onto a waiting name answers its request').toEqual([[T.accessreq, 'D']])
    /* withhold ONE of the tables from the admin: the whole command is refused, not just that half */
    const cell = PERMS[T.person].admin, was = cell.all.slice()
    cell.all = cell.all.filter(a => a !== 'C')
    try {
      expect(cmdAuthorize('account.addNew', actor('admin', 'stiff'))).toBe(false)
      expect(cmdAuthorize('access.approveNew', actor('admin', 'stiff'))).toBe(false)
      expect(cmdAuthorize('account.add', actor('admin', 'stiff')), 'a command that does not write a Person is untouched').toBe(true)
    } finally { cell.all = was }
    expect(cmdAuthorize('account.addNew', actor('admin', 'stiff'))).toBe(true)
  })
  it('the Tracker\'s command types (registered on its first mount) all have rows', () => {
    const src = read('src/tracker/app/core.js')
    const m = src.match(/const cols = \[([^\]]+)\];\s*\n\s*for \(const c of cols\)/)
    expect(m, 'the Tracker registration list').toBeTruthy()
    const types = [...m![1].matchAll(/'([^']+)'/g)].map(x => x[1]).concat(['trk.gesture'])
    expect(types.length).toBe(12)
    for (const t of types) expect(COMMAND_OPS[t], t).toBeTruthy()
    /* its own Undo / Redo, each one restore command ([DB-READINESS] group A, phase 4.1 — P4.1-TRACKER-RESTORE) */
    for (const t of ['tracker.undo', 'tracker.redo']) {
      expect(src.includes(`cmdDefinePermission('${t}'`), `${t} registered`).toBe(true)
      expect(COMMAND_OPS[t], t).toBeTruthy()
    }
  })
  it('an unmapped type is refused', () => {
    expect(cmdAuthorize('no.such.type', actor('admin', 'stiff'))).toBe(false)
  })
  it('the four board writes are the admin\'s (Fable R2-2)', () => {
    for (const t of ['sched.slot', 'sched.fill', 'sched.text', 'sched.delete']) {
      expect(cmdAuthorize(t, actor('admin', 'stiff')), t).toBe(true)
      expect(cmdAuthorize(t, actor('member', 'bane')), t).toBe(false)
    }
  })
  /* the GATE's own-row rule only — the input commands name no owner in production; a member is
     held to his own inputs by the ownership invariant (accounts.test.ts AC7, the real route) */
  it('the gate\'s input rule: an owner named must be the member; none named passes to the writer and the invariant', () => {
    expect(cmdAuthorize('inputs.write', actor('member', 'bane'), { owner: 'bane' })).toBe(true)
    expect(cmdAuthorize('inputs.write', actor('member', 'bane'), { owner: 'stiff' })).toBe(false)
    expect(cmdAuthorize('inputs.write', actor('member', 'bane'), { owners: ['bane', 'stiff'] })).toBe(false)
    expect(cmdAuthorize('inputs.write', actor('member', 'bane'))).toBe(true)
    expect(cmdAuthorize('inputs.write', actor('admin', 'stiff'), { owner: 'bane' })).toBe(true)
  })
  it('the roster: a member\'s own Quals row only, and only when the command names it (D149)', () => {
    expect(cmdAuthorize('people.edit', actor('member', 'bane'), { owner: 'bane' })).toBe(true)
    expect(cmdAuthorize('people.edit', actor('member', 'bane'), { owner: 'stiff' })).toBe(false)
    expect(cmdAuthorize('people.edit', actor('member', 'bane'))).toBe(false)
    expect(cmdAuthorize('people.edit', actor('admin', 'stiff'))).toBe(true)
  })
  it('a guest, a pending person and an account switched off run no forward command', () => {
    for (const role of ['guest', 'pending', 'off'] as Actor['role'][])
      for (const t of Object.keys(COMMAND_OPS)) {
        if (role === 'pending' && t === 'access.request') continue
        expect(cmdAuthorize(t, actor(role, undefined, 'p@mail'), { owner: 'p@mail' }), `${role} ${t}`).toBe(false)
      }
  })
  it('a pending person asks for access as himself, and only that', () => {
    expect(cmdAuthorize('access.request', actor('pending', undefined, 'p@mail'), { owner: 'p@mail' })).toBe(true)
    expect(cmdAuthorize('access.request', actor('pending', undefined, 'p@mail'), { owner: 'q@mail' })).toBe(false)
    expect(cmdAuthorize('access.request', actor('pending', undefined, 'p@mail'))).toBe(false)
    expect(cmdAuthorize('settings.accessreqs', actor('pending', undefined, 'p@mail'), { owner: 'p@mail' })).toBe(false)
  })
  it('accounts, the guest switch and every settings key are the admin\'s', () => {
    /* the accounts and the requests are rows since [DB-READINESS] group A, phase 4.4 — written only by their intents,
       never by a bare `settings.<key>` command */
    for (const t of ['account.add', 'account.update', 'access.approve', 'access.decline', 'guestview.set',
      'settings.guestview', 'settings.rules',
      /* [ACCOUNTS-NEW-PERSON] (NP8): a new person alone, with his account, by approval */
      'person.add', 'account.addNew', 'access.approveNew']) {
      expect(cmdAuthorize(t, actor('admin', 'stiff')), t).toBe(true)
      expect(cmdAuthorize(t, actor('member', 'bane')), t).toBe(false)
    }
    /* the bell's seen: his OWN row (AccessRequestSeen, R3-04) — never another admin's, never a member's */
    expect(cmdAuthorize('access.seen', actor('admin', 'stiff'), { owner: 'stiff' })).toBe(true)
    expect(cmdAuthorize('access.seen', actor('admin', 'stiff'), { owner: 'bane' })).toBe(false)
    expect(cmdAuthorize('access.seen', actor('member', 'bane'), { owner: 'bane' })).toBe(false)
    for (const t of ['settings.accounts', 'settings.accessreqs', 'settings.changeseen']) expect(cmdAuthorize(t, actor('admin', 'stiff')), t).toBe(false)
  })
  it('the Leave War: a member\'s own bid rides the war\'s writer; deciding is the admin\'s', () => {
    expect(cmdAuthorize('lw.edit', actor('member', 'bane'))).toBe(true)
    expect(cmdAuthorize('lw.edit', actor('member', 'bane'), { owner: 'stiff' })).toBe(false)
    for (const t of ['lw.decide', 'lw.approve', 'lw.decideApproved', 'lw.removeApproved', 'lw.moveApproved'])
      expect(cmdAuthorize(t, actor('member', 'bane')), t).toBe(false)
  })
  it('the Tracker: every member (D121)', () => {
    expect(cmdAuthorize('trk.marks', actor('member', 'bane'))).toBe(true)
    expect(cmdAuthorize('trk.gesture', actor('member', 'bane'))).toBe(true)
  })
})
