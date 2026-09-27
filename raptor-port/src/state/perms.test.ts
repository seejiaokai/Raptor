/* [ACCOUNTS] D200 (3) — the permissions matrix (state/perms.ts) against the table IT
   builds the database's security from (docs/data-model.md §11), and the command gate
   against every command type the app registers.

   "One place in the app answers 'may this person do this?', mirroring that table, with a
   test that fails when they disagree" — owner, D200, 26 Sep 26. This is that test. Register line AC14. */
import { describe, it, expect, beforeAll } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import {
  PERMS, T, MEDICAL_DETAIL, COMMAND_OPS, allows, cmdAuthorize, type Act, type Cell, type Role,
} from './perms'
import { registeredTypes } from '../command'
import type { Actor } from '../command/types'
import { initStore } from './store'
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
    expect(COMMAND_OPS['account.addNew'].more).toEqual([[T.person, 'C'], [T.accessreq, 'D']])
    expect(COMMAND_OPS['access.approveNew'].more).toEqual([[T.user, 'C'], [T.person, 'C']])
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
    for (const t of ['account.add', 'account.update', 'access.approve', 'access.decline', 'guestview.set',
      'settings.accounts', 'settings.accessreqs', 'settings.guestview', 'settings.rules',
      /* [ACCOUNTS-NEW-PERSON] (NP8): a new person alone, with his account, by approval; the bell's seen */
      'person.add', 'account.addNew', 'access.approveNew', 'access.seen']) {
      expect(cmdAuthorize(t, actor('admin', 'stiff')), t).toBe(true)
      expect(cmdAuthorize(t, actor('member', 'bane')), t).toBe(false)
    }
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
