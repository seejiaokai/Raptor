// @vitest-environment jsdom
/* THE SECOND FIX READ (multi-squadron batch 1, 18 Nov 26): Astra's, a fresh Opus reader's and the security read's blind
   reads of the second round of fixes, each claim reproduced here red first before its fix (chat 109's night, job 1).
   - Astra 1, Opus F1, security H3: the last-admin lock and the master guard asked only when an account row is written —
     a person-only delete or a home move got past both.
   - Astra 2, security H1: the gate's account list read otherwise than the loader's — a re-keyed or name-colliding row
     made Osprey an admin, switched Kestrel off or took Saber's master mark.
   - Security H4, his D2205 (18 Nov 26): only a master admin changes a master admin's account.
   - Astra 6, 7: the master sentence said first; a raised developer role told whose a man is.
   - Opus F3: a man with no squadron is given one from today, never a day already gone.
   - Security H5: another squadron's change history written or deleted.
   - Astra 5: an Undo's history line filed with the change it takes back, across a midnight move. */
import { afterAll, afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { storeBackend, store } from '../engine/hooks'
import { initStore, resetSession, notify, writeInputsBatch } from './store'
import { INPUTS, leadOf } from '../engine/inputs'
import { signIn, sessionFor, updateAccount, accountById, accountsLoad, seedAccounts, deleteAccountProblem, otherSquadronPersonProblem } from './accounts'
import { setSession, setEffectiveRole } from './auth'
import { installGlobalUndo } from './undo-wire'
import { _resetTimeline, globalUndo, globalRedo } from '../undo/timeline'
import { elogFlush, logAction } from '../engine/editlog'
import { PEOPLE } from '../engine/people'
import { updatePersonField } from './quals-write'
import { setUnitSeeds, setHome, setGrant, homeOn, todayIso, unitsLoad, unitRows } from './units'
import { moveFrom } from './units-model'
import { addDays } from './flyplan-model'
import { commitSettingsIntent, commitPeopleIntent, commitPeopleEdit } from './people-settings-commit'
import { ownershipViolation, setTrkUnitProbe } from './perms'
import { deriveActor } from '../command'

const mem: Record<string, string> = {}
const fake = {
  getItem: (k: string) => (k in mem ? mem[k]! : null),
  setItem: (k: string, v: string) => { if (v === 'null') delete mem[k]; else mem[k] = v },
  keys: () => Object.keys(mem),
}
const signInAs = (name: string, pass: string) => { const r = signIn(name, pass); resetSession(sessionFor(r)); notify(); return r }
const P = (id: string): any => (PEOPLE as any)[id]
/* the account list stored as rows first (an ordinary change), so a forged row lands on a stored list */
const storeList = () => { signInAs('ad', 'a'); expect(updateAccount('acus', { name: 'ranger2' })).toBe(null) }
const forgeAcct = (key: string, row: any) => { const r = commitSettingsIntent('account.update', null, () => { store.set('account:' + key, row) }) as any; accountsLoad(); return r }

beforeEach(() => {
  Object.keys(mem).forEach(k => delete mem[k])
  storeBackend.impl = fake
  setUnitSeeds(true)
  initStore()
  accountsLoad()
  resetSession(null)
  _resetTimeline()
  installGlobalUndo()
})
afterEach(() => { setSession(null); resetSession(null); _resetTimeline(); vi.useRealTimers() })
afterAll(() => { storeBackend.impl = null })

describe('Astra 1, Opus F1, security H3 — the lock and the master guard judge people and homes, not only account rows', () => {
  it("Hunter's person-only delete of Saber (the master) is refused; Saber stays", () => {
    storeList()
    signInAs('ad2', 'a2')
    const r = commitPeopleIntent('person.delete', null, () => {
      Object.assign(P('stiff'), { deleted: true, deletedFrom: todayIso(), archived: true, archivedBy: 'del' })
    }) as any
    expect(r.ok).toBe(false)
    expect(P('stiff').deleted).toBeFalsy()
    accountsLoad()
    expect(accountById('acad')).toBeTruthy()
  })
  it("the master's person-only delete of Kestrel, 149's only admin, is refused (the lock)", () => {
    storeList()
    const r = commitPeopleIntent('person.delete', null, () => {
      Object.assign(P('kes9'), { deleted: true, deletedFrom: todayIso(), archived: true, archivedBy: 'del' })
    }) as any
    expect(r.ok).toBe(false)
    expect(P('kes9').deleted).toBeFalsy()
  })
  it('Kestrel making himself a placeholder (special) is refused: 149 would have no admin', () => {
    signInAs('ad9', 'a9')
    const r = commitPeopleEdit(() => { P('kes9').special = true }) as any
    expect(r.ok).toBe(false)
    expect(P('kes9').special).toBeFalsy()
  })
  it("the master moving Kestrel to 142 is refused by the screen's door in the lock's words, and at the gate", () => {
    signInAs('ad', 'a')
    const t1 = moveFrom(todayIso())
    expect(setHome('kes9', 'u142')).toEqual({ ok: false, message: "Kestrel is 149's last admin. Make another admin of 149 first." })
    expect(homeOn('kes9', t1)).toBe('u149')
    const r = commitSettingsIntent('home.set', null, () => { store.set('home:hzkes', { id: 'hzkes', pid: 'kes9', unit: 'u142', from: t1 }) }) as any
    unitsLoad()
    expect(r.ok).toBe(false)
    expect(homeOn('kes9', t1)).toBe('u149')
  })
  it('…a home move judged on its own date: a row dated a week on is refused as well', () => {
    signInAs('ad', 'a')
    const t7 = addDays(todayIso(), 7)
    const r = commitSettingsIntent('home.set', null, () => { store.set('home:hzkes7', { id: 'hzkes7', pid: 'kes9', unit: 'u142', from: t7 }) }) as any
    unitsLoad()
    expect(r.ok).toBe(false)
    expect(homeOn('kes9', t7)).toBe('u149')
  })
  it('…while a second 149 admin first lets him move, and an ordinary move of a member still goes through', () => {
    signInAs('ad', 'a')
    expect(updateAccount('acus9', { role: 'admin' })).toBe(null)
    expect(setHome('kes9', 'u142').ok).toBe(true)
    expect(setHome('her9', 'u142').ok).toBe(true)
  })
})

describe('Astra 2, security H1 — the gate reads the account list as the loader does', () => {
  it("Hunter renaming his own account onto Kestrel's sign-in name (the loader would drop Kestrel's) is refused", () => {
    signInAs('ad2', 'a2')
    const r = commitSettingsIntent('account.update', null, () => {
      for (const a of seedAccounts()) store.set(`account:${a.id}`, a.id === 'acad2' ? { ...a, name: 'ad9' } : a)
    }) as any
    accountsLoad()
    expect(r.ok).toBe(false)
    expect(accountById('acad9')).toBeTruthy()
  })
  it("a row re-keyed into Ranger's slot cannot make Osprey a 149 admin", () => {
    storeList()
    signInAs('ad2', 'a2')
    const r = forgeAcct('acus', { id: 'acus9', name: 'us9', role: 'admin', pid: 'osp9', on: true, createdAt: -1 })
    expect(r.ok).toBe(false)
    expect(accountById('acus9')!.role).toBe('main')
    expect(accountById('acus')).toBeTruthy()
  })
  it("…nor switch Kestrel off", () => {
    storeList()
    signInAs('ad2', 'a2')
    const r = forgeAcct('acus', { id: 'acad9', name: 'ad9', role: 'admin', pid: 'kes9', on: false, createdAt: -1 })
    expect(r.ok).toBe(false)
    expect(accountById('acad9')!.on).toBe(true)
  })
  it("…nor take Saber's master mark", () => {
    storeList()
    signInAs('ad2', 'a2')
    const r = forgeAcct('acus', { id: 'acad', name: 'ad', role: 'admin', pid: 'stiff', on: false, createdAt: -1 })
    expect(r.ok).toBe(false)
    expect(accountById('acad')!.master).toBe(true)
    expect(accountById('acad')!.on).toBe(true)
  })
})

describe("security H4, his D2205 — only a master admin changes a master admin's account", () => {
  const MASTER_ONLY = 'Only a master admin can do that'
  it("Hunter (142's plain admin) cannot suspend, demote or rename Saber by Admin → Users", () => {
    signInAs('ad2', 'a2')
    expect(updateAccount('acad', { on: false })).toBe(MASTER_ONLY)
    expect(updateAccount('acad', { role: 'main' })).toBe(MASTER_ONLY)
    expect(updateAccount('acad', { name: 'saber2' })).toBe(MASTER_ONLY)
    const a = accountById('acad')!
    expect([a.on, a.role, a.name]).toEqual([true, 'admin', 'ad'])
  })
  it("…nor by a forged account row", () => {
    storeList()
    signInAs('ad2', 'a2')
    const a = { ...accountById('acad')! }
    expect(forgeAcct('acad', { ...a, on: false }).ok).toBe(false)
    expect(forgeAcct('acad', { ...a, role: 'main' }).ok).toBe(false)
    expect(forgeAcct('acad', { ...a, name: 'saber2' }).ok).toBe(false)
    expect(accountById('acad')).toMatchObject({ on: true, role: 'admin', name: 'ad', master: true })
  })
  it("…nor archive or rename Saber's person", () => {
    signInAs('ad2', 'a2')
    expect((commitPeopleEdit(() => { P('stiff').archived = true }) as any).ok).toBe(false)
    expect((commitPeopleEdit(() => { P('stiff').cs = 'HIJACK' }) as any).ok).toBe(false)
    expect(P('stiff').archived).toBeFalsy()
    expect(P('stiff').cs).toBe('Saber')
    expect(updatePersonField('stiff', { callsign: 'Hijack' })).toBe(MASTER_ONLY)
  })
  it('…an admin of 142 by a right given him (Kestrel) cannot either', () => {
    signInAs('ad', 'a')
    expect(setGrant('acad9', 'u142', 'admin', 'kes9').ok).toBe(true)
    signInAs('ad9', 'a9')
    expect(updateAccount('acad', { on: false })).toBe(MASTER_ONLY)
    expect(accountById('acad')!.on).toBe(true)
  })
  it("…while Hunter keeps the rest of Saber's Quals row, and a master changes another master's account", () => {
    signInAs('ad2', 'a2')
    expect(updatePersonField('stiff', { cat: 'OCU' })).toBe(null)
    signInAs('ad', 'a')
    expect(updateAccount('acad9', { name: 'kestrel9' })).toBe(null)
  })
})

describe('Astra 6 — the master sentence is said first by Delete', () => {
  const SAID = "Saber is a master admin, so he can't be deleted"
  it('to Kestrel, to Hunter and to Saber himself', () => {
    signInAs('ad9', 'a9')
    expect(deleteAccountProblem('stiff')).toBe(SAID)
    signInAs('ad2', 'a2')
    expect(deleteAccountProblem('stiff')).toBe(SAID)
    signInAs('ad', 'a')
    expect(deleteAccountProblem('stiff')).toBe(SAID)
  })
})

describe('Astra 7 — the developer bridge’s raised admin is told whose a man is', () => {
  it('Ranger raised to admin, changing Osprey: "He is 149\'s. Only an admin of 149 can change him."', () => {
    signInAs('us', 'us')
    setEffectiveRole('admin')
    expect(otherSquadronPersonProblem('osp9')).toBe("He is 149's. Only an admin of 149 can change him.")
    expect(updatePersonField('osp9', { callsign: 'Osprey2' })).toBe("He is 149's. Only an admin of 149 can change him.")
  })
  it("…and a member keeps his own-row refusal", () => {
    signInAs('us', 'us')
    expect(otherSquadronPersonProblem('osp9')).toBe(null)
  })
})

describe('Opus F3 — a man with no squadron is given one from today, never from a day gone', () => {
  it('on a shared store the master cannot give Rocky a first home dated last week', () => {
    const seeded = unitRows()
    for (const u of seeded.units) mem['sqn142_unit:' + u.id] = JSON.stringify(u)
    for (const p of seeded.places) mem['sqn142_place:' + p.id] = JSON.stringify(p)
    for (const x of seeded.unitplaces) mem['sqn142_unitplace:' + x.id] = JSON.stringify(x)
    for (const h of seeded.homes) mem['sqn142_home:' + h.id] = JSON.stringify(h)
    setUnitSeeds(false); unitsLoad()
    expect(homeOn('rocky')).toBe(null)
    signInAs('ad', 'a')
    const r = commitSettingsIntent('home.set', null, () => { store.set('home:hzrocky', { id: 'hzrocky', pid: 'rocky', unit: 'u142', from: addDays(todayIso(), -7) }) }) as any
    unitsLoad()
    expect(r.ok).toBe(false)
    expect(homeOn('rocky')).toBe(null)
  })
})

/* the fix read's Opus 7 (open since the night of 17–18 Nov 26 — docs/superpowers/briefs/2026-11-18-multi-sqn-b1-fixread-opus7-open.md),
   its proof put back as written there, with the plan's still-open 1: a member names only his own squadron's people */
describe("Opus 7 — a man's inputs are his own squadron's", () => {
  const her9 = () => INPUTS.find((x: any) => String(leadOf(x)) === 'her9') as any
  it("142's plain admin cannot rewrite a 149 man's leave remarks, by any write of the inputs", () => {
    signInAs('ad2', 'a2')
    const r = her9()
    expect(r, 'the 149 seed input').toBeTruthy()
    const was = r.remarks
    expect(writeInputsBatch(() => { r.remarks = 'rewritten by 142' }), 'refused').toBeFalsy()
    expect(her9().remarks).toBe(was)
  })
  it("…while 149's admin and the master may, and 142's admin keeps his own men's", () => {
    signInAs('ad9', 'a9')
    expect(writeInputsBatch(() => { her9().remarks = 'by 149' })).toBeTruthy()
    expect(her9().remarks).toBe('by 149')
    signInAs('ad', 'a')
    expect(writeInputsBatch(() => { her9().remarks = 'by the master' })).toBeTruthy()
    signInAs('ad2', 'a2')
    const own = INPUTS.find((x: any) => homeOn(String(leadOf(x))) === 'u142') as any
    expect(own, 'a 142 input').toBeTruthy()
    expect(writeInputsBatch(() => { own.remarks = 'by 142' })).toBeTruthy()
  })
  it('a 142 member cannot put a 149 man into an input (the plan’s still-open 1)', () => {
    signInAs('us', 'us')
    const mine = INPUTS.find((x: any) => String(leadOf(x)) === 'bane') as any
    expect(mine, "Ranger's own input").toBeTruthy()
    const was = JSON.stringify(mine)
    writeInputsBatch(() => { mine.people = [...(Array.isArray(mine.people) ? mine.people : [{ p: mine.person, by: mine.by }]), { p: 'her9', by: 'bane' }] })
    expect(JSON.stringify(INPUTS.find((x: any) => x.iid === mine.iid))).toBe(was)
  })
})

describe('security H5 — a history line is its own squadron’s', () => {
  const saved = () => store.keys('elog:').map(k => [k, store.get(k, null)] as [string, any]).filter(x => x[1])
  it("Ranger (a 142 member) cannot file a line in 149's history", () => {
    signInAs('us', 'us')
    logAction(null, 'Kestrel cancelled all 149 flying tomorrow', { date: '2026-07-13', sect: 'day', unit: 'u149' })
    elogFlush()
    expect(saved().filter(([, v]) => v.u === 'u149').length).toBe(0)
  })
  it("Hunter (142's plain admin) cannot delete a line of 149's history", () => {
    signInAs('ad9', 'a9')
    logAction(null, '149 line', { date: '2026-07-13', sect: 'day', unit: 'u149' })
    elogFlush()
    const [k] = saved().find(([, v]) => v.u === 'u149')!
    signInAs('ad2', 'a2')
    const r = commitSettingsIntent('elog.sweep', null, () => { store.set(k, null) }) as any
    expect(r.ok).toBe(false)
    expect(store.get(k, null)).toBeTruthy()
  })
  it("…while Kestrel files and sweeps his own squadron's lines", () => {
    signInAs('ad9', 'a9')
    logAction(null, '149 own line', { date: '2026-07-13', sect: 'day', unit: 'u149' })
    elogFlush()
    const [k] = saved().find(([, v]) => v.lbl === '149 own line')!
    expect((commitSettingsIntent('elog.sweep', null, () => { store.set(k, null) }) as any).ok).toBe(true)
  })
})

/* Fable's plan, still open 2 (his D2194): the admin branch of the gate returned early, so 142's plain admin could write a
   bell line to a 149 man or mark his history or bell read. Asked of the gate directly, with the command a forged write
   would make. */
describe("still open 2, his D2194 — an admin's bell lines and read records are his own squadron's people's", () => {
  const env = (changes: any[]): any => ({ seq: 1, at: '', origin: 'local', scope: { module: 'settings' }, type: 'inputs.write', actor: deriveActor(), changes })
  const line = (to: string, what: any[] = [{ k: 'del' }]) => ({ id: 'n1', to, by: 'zz', at: 1, iid: 'i1', name: 'x', day: '2026-07-13', what })
  const put = (collection: string, id: string, after: any) => ({ op: 'put', collection, id, before: null, after })
  it("Hunter (142's plain admin) may not write a bell line to 149's Osprey, nor mark his history or bell read", () => {
    signInAs('ad2', 'a2')
    expect(ownershipViolation(env([put('notices', 'n1', line('osp9'))]))).toMatch(/bell line of another squadron's man/)
    expect(ownershipViolation(env([{ op: 'delete', collection: 'notices', id: 'n1', before: line('osp9'), after: null }]))).toMatch(/bell line of another squadron's man/)
    expect(ownershipViolation(env([put('settings', 'seen:osp9', { pid: 'osp9', ids: [] })]))).toMatch(/another squadron's man's read record/)
    expect(ownershipViolation(env([put('settings', 'noticeseen:osp9', { pid: 'osp9', ids: [] })]))).toMatch(/another squadron's man's read record/)
  })
  it('…while his own squadron’s man, the holiday line (which reaches every squadron at the place) and the master pass', () => {
    signInAs('ad2', 'a2')
    /* (a line with no input: since fix read 7's fault M a line naming an input — `line`'s `i1` — rides only the command
       that changes it, with the pass's mark; this pins the squadron test alone) */
    expect(ownershipViolation(env([put('notices', 'n1', { ...line('bane'), iid: '' })]))).toBeNull()
    expect(ownershipViolation(env([put('notices', 'n1', line('osp9', [{ k: 'oilhol', a: '2026-07-13', b: '2026-07-13' }]))]))).toBeNull()
    expect(ownershipViolation(env([put('settings', 'seen:bane', { pid: 'bane', ids: [] })]))).toBeNull()
    signInAs('ad', 'a')
    expect(ownershipViolation(env([put('notices', 'n1', { ...line('osp9'), iid: '' })]))).toBeNull()
  })
  /* NARROWED by his D2223 (19 Nov 26): "the filer is told only while he is still that man's admin or in the input" — so a
     149 member who filed a 142 man's input is no longer told of a change to it (state/notices.ts filerTold, the pass's
     own test), and a line to him riding that change is judged as any other line: refused. Before D2223 this case pinned
     that he was told. A master filer is still told — an admin everywhere. */
  it("…and the telling of an input the same command changed, judged by 7c: only to a filer still told of it (D2223)", () => {
    signInAs('ad2', 'a2')
    const inp = { iid: 'i1', type: 'Training', person: 'bane', people: [{ p: 'bane' }], by: 'osp9', date: 'Jul 13', allday: true }
    const edited = { ...inp, remarks: 'moved' }
    const ch = { op: 'put', collection: 'inputs', id: 'i1', before: inp, after: edited }
    expect(ownershipViolation(env([ch, put('notices', 'n1', line('osp9', [{ k: 'rmk' }]))]))).toMatch(/bell line of another squadron's man/)
    /* the master filed it: still told, wherever his home (he is an admin of every squadron — the move itself is pinned in
       leavewar/multi-sqn-fixread4-bells.test.ts, D2223) */
    const byMaster = { ...inp, by: 'stiff' }
    const ch2 = { op: 'put', collection: 'inputs', id: 'i1', before: byMaster, after: { ...byMaster, remarks: 'moved' } }
    /* (marked as the pass marks a filer-only line — fix read 7, fault M: the squadrons its telling read, Ranger's 142) */
    expect(ownershipViolation(env([ch2, put('notices', 'n1', { ...line('stiff', [{ k: 'rmk' }]), fu: ['u142'] })]))).toBeNull()
  })
})

describe("Astra 5 — an Undo's line is filed with the change it takes back, across a midnight move", () => {
  const saved = () => store.keys('elog:').map(k => store.get(k, null)).filter(Boolean) as any[]
  it("the master's change to Osprey while he is 149's, undone and redone after he became 142's: both lines 149's", () => {
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(new Date(2026, 10, 18, 9, 0, 0))
    signInAs('ad', 'a')
    expect(setHome('osp9', 'u142').ok).toBe(true)                    // 142's from 19 Nov
    expect(updatePersonField('osp9', { cat: 'OCU' })).toBe(null)       // made while he is 149's
    elogFlush()
    vi.setSystemTime(new Date(2026, 10, 19, 9, 0, 0))
    expect(homeOn('osp9')).toBe('u142')
    expect(globalUndo()).toMatchObject({ ok: true })
    elogFlush()
    expect(globalRedo()).toMatchObject({ ok: true })
    elogFlush()
    const lines = saved().filter(l => /^(Undo|Redo)/.test(String(l.lbl)))
    expect(lines.map(l => l.u)).toEqual(['u149', 'u149'])
  })
})

/* Fable's plan, still open 5 (his D2203, 18 Nov 26): a person who moves to another squadron loses every View and Plan
   he held of others — dropped inside the move command, so an Undo of the move puts them back with it. */
describe('still open 5, his D2203 — a man who moves squadron loses every right he held in another', () => {
  const grantsOf = (account: string) => unitRows().grants.filter(g => g.account === account)
  it("Ranger, 142's, with View of 149, moved to 149: no right of his is left, and Undo puts the View back", () => {
    signInAs('ad', 'a')
    expect(setGrant('acus', 'u149', 'view', 'bane').ok).toBe(true)
    expect(grantsOf('acus').length).toBe(1)
    expect(setHome('bane', 'u149').ok).toBe(true)
    unitsLoad()
    expect(grantsOf('acus')).toEqual([])
    expect(globalUndo()).toMatchObject({ ok: true })
    unitsLoad()
    expect(grantsOf('acus').map(g => g.unit)).toEqual(['u149'])
  })
  it("a man with no right elsewhere moves as before; another man's right is left alone", () => {
    signInAs('ad', 'a')
    expect(setGrant('achex', 'u149', 'view', 'rocky').ok).toBe(true)
    expect(setHome('bane', 'u149').ok).toBe(true)
    unitsLoad()
    expect(grantsOf('achex').length).toBe(1)
  })
})

/* Fable's plan, still open 7: a plain admin's forged delete of another squadron's man's home row is refused. Already held
   by the gate's WHO rule (an admin of the row's unit, before and after) — pinned here, not red first. */
describe("still open 7 — 142's plain admin cannot delete a 149 home row", () => {
  it("Hunter's forged delete of Ranger's move to 149 (a stored 149 home row) is refused, the row kept", () => {
    signInAs('ad', 'a')
    expect(setHome('bane', 'u149').ok).toBe(true)
    const key = store.keys('home:').find(k => { const v: any = store.get(k, null); return v && v.pid === 'bane' && v.unit === 'u149' })!
    expect(key).toBeTruthy()
    signInAs('ad2', 'a2')
    const r = commitSettingsIntent('home.set', null, () => { store.set(key, null) }) as any
    unitsLoad()
    expect(r.ok).toBe(false)
    expect(store.get(key, null)).toMatchObject({ pid: 'bane', unit: 'u149' })
  })
})

/* Fable's plan, still open 3: the Tracker's record ids carry no squadron (v3:<course>:<syllabus>:… — the unit is added by
   its storage door, tracker/storage.js, bound once to the signed-in person's own squadron), so the gate never knew whose
   Tracker a change was to, and the admin branch returned early. A doorway bound to 149's (the console's
   bindStorageUnit before the Tracker loads, as the Leave War's swap was for H2) let 142's people change 149's Tracker.
   The Tracker now tells the gate which squadron's is open (setTrkUnitProbe — boot.ts, from the doorway's own bound unit). */
describe("still open 3 — a squadron's Tracker is changed only by its own people", () => {
  const env = (): any => ({ seq: 1, at: '', origin: 'local', scope: { module: 'trk' }, type: 'trk.marks', actor: deriveActor(),
    changes: [{ op: 'put', collection: 'trk.marks', id: 'v3:c1:sb2024:m:e1', before: null, after: '{"ST-01":{"g":2}}' }] })
  afterEach(() => setTrkUnitProbe(null))
  it("with 149's Tracker open, Hunter (142's admin) and Ranger (142's member) are refused", () => {
    setTrkUnitProbe(() => 'u149')
    signInAs('ad2', 'a2')
    expect(ownershipViolation(env())).toMatch(/another squadron's Tracker/)
    signInAs('us', 'us')
    expect(ownershipViolation(env())).toMatch(/another squadron's Tracker/)
  })
  it("…while 149's own admin and member, the master, and 142's people on 142's Tracker pass", () => {
    setTrkUnitProbe(() => 'u149')
    signInAs('ad9', 'a9'); expect(ownershipViolation(env())).toBeNull()
    signInAs('us9', 'us9'); expect(ownershipViolation(env())).toBeNull()
    signInAs('ad', 'a'); expect(ownershipViolation(env())).toBeNull()
    setTrkUnitProbe(() => 'u142')
    signInAs('ad2', 'a2'); expect(ownershipViolation(env())).toBeNull()
    signInAs('us', 'us'); expect(ownershipViolation(env())).toBeNull()
    setTrkUnitProbe(() => null)
    signInAs('ad2', 'a2'); expect(ownershipViolation(env())).toBeNull()
  })
})
