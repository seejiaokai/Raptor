/* UNITS, PLACES, HOMES AND RIGHTS — the reads and the typed commands (multi-squadron batch 1, step 1; the pure half is
   state/units-model.ts). Built on state/flyplan.ts's pattern, the one command layer (docs/undo-contract.md §5): settings
   rows written ONLY by the typed commands below, through commitSettingsIntent, each write read back; a raw write of a
   unit row outside a command is refused by the settings write hook (people-settings-commit.ts), as the flying plan's is.
   `unitsLoad` sits in the settings store's loader list, so a rollback, an Undo and a Redo re-read the rows.

   Who may run each command is perms.ts's — COMMAND_OPS for the type, and the commit gate for the row: an admin OF the
   unit a row names, read from the row itself, over the rows as they stood before the command (unitRowViolation).

   This file imports none of the accounts, the permissions or the seeds (each imports it): the seeds switch is handed in
   by state/seeds.ts and state/store.ts (setUnitSeeds), the caller's person and account by the caller. Nothing on screen
   reads it yet — step 2 puts the unit into the schedule's identity. */
import { store } from '../engine/hooks'
import { newId } from '../engine/newid'
import { isCommitting, type CommitResult } from '../command'
import { commitSettingsIntent } from './people-settings-commit'
import { accessWas, tellAccess } from './acctlines'
import { setHomeResolver, needDay } from '../engine/roster'
import { setSchedTickAt } from '../engine/publish'
import { PEOPLE } from '../engine/people'
import { DEMO_149_PEOPLE } from './demoseed'
/* the last-admin lock's words for a step's draft (accounts.ts imports this file; the call is at run time, never at load) */
import { lockProblemFor, accountById, masterChangeProblem, signedInAccount, otherSquadronPersonProblem, adminNow, levelAcct, MASTER_ONLY_WORDS } from './accounts'
import { lastAdminBreach, type LockWorld, type LockBreach } from './lastadmin'
import {
  UNIT_PFX, PLACE_PFX, UNITPLACE_PFX, GRANT_PFX, HOME_PFX, UNIT_ROW_PREFIXES,
  rowsFrom, placeIdOn, homeUnitOn, homeChangesIn, stintsIn, grantOn, grantHolds, datedRowsBreach, unitIn, placeIn, levelFrom, moveFrom, schedTickHolds,
  validUnitNum, validTz, MAX_PLACE_NAME, unitsAtPlace,
  type UnitRows, type Unit, type Place, type Grant, type GrantLevel, type GrantHolder, type UnitLevel, type LevelAccount, type Stint,
  type DatedBreach,
} from './units-model'

export interface UnitSave { ok: boolean; message?: string; id?: string; pending?: Promise<UnitSave> }

/* ---- the seeds (demo data, D56 — wiped with everything else before the database) ----
   Two squadrons at one place, both there from a far-past date; on the demo only, a person with no home row is at 142
   (on a shared store, nowhere — his home is written when he is made, and the first admin's at the store's first boot).
   Since step 4 the demo's 149 has people of its own (state/demoseed.ts DEMO_149_PEOPLE): each one's home row is a seed
   too, from the same far-past date — read from memory like every seed here, never written at load. */
export const DEMO_HOME = 'u142'
const SEED: UnitRows = {
  units: [{ id: 'u142', num: '142', kind: 'sqn' }, { id: 'u149', num: '149', kind: 'sqn' }],
  places: [{ id: 'p1', name: 'Home base', tz: 'Australia/Perth' }],
  unitplaces: [{ id: 'up142', unit: 'u142', place: 'p1', from: '2000-01-01' }, { id: 'up149', unit: 'u149', place: 'p1', from: '2000-01-01' }],
  grants: [],
  homes: DEMO_149_PEOPLE.map(([pid]) => ({ id: 'h' + pid, pid, unit: 'u149', from: '2000-01-01' })),
}
let SEEDS_ON = true
export function setUnitSeeds(on: boolean): void { SEEDS_ON = on; ROWS = null }
const fallbackHome = () => (SEEDS_ON ? DEMO_HOME : null)

/* today, the viewer's own date — as the Inputs calendar's Today (ui/daysfmt.ts isoToday; not imported: ui is above state) */
export const todayIso = (): string => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

/* ---- the reads ----
   Built from the rows once and kept until a row changes: dropped by every write below and by unitsLoad (the loader list,
   and the boot). */
let ROWS: UnitRows | null = null
export function unitsLoad(): void { ROWS = null }
const storedEntries = (): Array<[string, unknown]> => {
  const out: Array<[string, unknown]> = []
  for (const p of UNIT_ROW_PREFIXES) for (const k of store.keys(p)) out.push([k, store.get(k, null)])
  return out
}
export function unitRows(): UnitRows {
  if (!ROWS) ROWS = rowsFrom(storedEntries(), SEEDS_ON ? SEED : null)
  return ROWS
}
/* the rows as they stood BEFORE a command, from the store now with each of its changed rows put back — the commit gate's
   view (perms.ts), so a command is judged by the rights its author held, never by the ones it gave him */
export function unitRowsBefore(changes: readonly { collection: string; id: string; before?: unknown }[]): UnitRows {
  const m = new Map<string, unknown>(storedEntries())
  for (const c of changes) {
    if (c.collection !== 'settings' || !UNIT_ROW_PREFIXES.some(p => c.id.startsWith(p))) continue
    if (c.before == null) m.delete(c.id); else m.set(c.id, c.before)
  }
  return rowsFrom(m.entries(), SEEDS_ON ? SEED : null)
}
/* …and AFTER it: the store now with each of its changed rows' after-images laid on — the same as the live rows for a
   command already applied, and the command's own outcome for one judged before it is (a hand-built envelope) */
export function unitRowsAfter(changes: readonly { collection: string; id: string; op?: string; after?: unknown }[]): UnitRows {
  const m = new Map<string, unknown>(storedEntries())
  for (const c of changes) {
    if (c.collection !== 'settings' || !UNIT_ROW_PREFIXES.some(p => c.id.startsWith(p))) continue
    if (c.op === 'delete' || c.after == null) m.delete(c.id); else m.set(c.id, c.after)
  }
  return rowsFrom(m.entries(), SEEDS_ON ? SEED : null)
}
export const units = (): Unit[] => unitRows().units
export const unitById = (id: string): Unit | undefined => unitIn(unitRows(), id)
export const places = (): Place[] => unitRows().places
export const placeById = (id: string): Place | undefined => placeIn(unitRows(), id)
/* the place a unit is at on a date */
export const placeOfOn = (unit: string, iso: string): Place | null => { const id = placeIdOn(unitRows(), unit, iso); return id ? placeIn(unitRows(), id) ?? null : null }
/* a person's home unit on a date (the demo's 142 when he has no row; null on a shared store) — the day required, and
   checked in tests and development builds (the reshape plan §3.2 A-i's contract, engine/roster.ts needDay) */
export const homeOn = (pid: string, iso: string): string | null => {
  needDay(iso, 'homeOn')
  return homeUnitOn(unitRows(), pid, iso, fallbackHome())
}
/* the days in a..b (a excluded, b included) on which his squadron changes (units-model.ts homeChangesIn — never a row's
   date as such) — and the same over the rows before a command (the commit gate) */
export const homeChangesOn = (pid: string, a: string, b: string): string[] => homeChangesIn(unitRows(), pid, a, b, fallbackHome())
export const homeChangesBefore = (pid: string, a: string, b: string, rows: UnitRows): string[] => homeChangesIn(rows, pid, a, b, fallbackHome())
/* his runs of days in a unit (units-model.ts stintsIn — the Leave War's rosters by date, A1) */
export const stintsOf = (pid: string, unit: string): Stint[] => stintsIn(unitRows(), pid, unit, fallbackHome())
/* was he ever, or will he be, that squadron's — over the rows a command was judged by (the gate's K5 line) */
export const everOfBefore = (pid: string, unit: string, rows: UnitRows): boolean => stintsIn(rows, pid, unit, fallbackHome()).length > 0
/* …and the engine's rosters ask the same (engine/roster.ts rosterOf, engine/inputs.ts inputsFor — multi-squadron step 3):
   the engine does not import state/, so the answer is handed to it here, once, as this module loads — both questions
   of the home handle (the reshape plan §3.2 A-i) */
setHomeResolver({ on: (pid, iso) => homeUnitOn(unitRows(), pid, iso, fallbackHome()), changesIn: (pid, a, b) => homeChangesOn(pid, a, b) })
/* …and whether a man's Scheduler tick counts in a squadron on a day (units-model.ts schedTickHolds — core line 4, D2160),
   handed to the sign-off boxes the same way */
export const schedTickIn = (pid: string, unit: string, iso: string): boolean =>
  schedTickHolds((PEOPLE as any)[pid], pid, unit, iso, unitRows(), fallbackHome())
setSchedTickAt(schedTickIn)
/* the rights an account holds in OTHER units */
export const grantsOf = (accountId: string): Grant[] => unitRows().grants.filter(g => g.account === accountId)
/* an account's level in a unit on a date — the one answer (units-model.ts levelFrom); the caller hands in the account */
export const levelOfAccount = (acct: LevelAccount | null | undefined, unit: string, iso: string): UnitLevel | null =>
  levelFrom(acct, unit, iso, unitRows(), fallbackHome())
/* the same over the rows before a command (the commit gate) */
export const levelBefore = (acct: LevelAccount | null | undefined, unit: string, iso: string, rows: UnitRows): UnitLevel | null =>
  levelFrom(acct, unit, iso, rows, fallbackHome())
export const homeBefore = (pid: string, iso: string, rows: UnitRows): string | null => homeUnitOn(rows, pid, iso, fallbackHome())
/* THE RIGHT THAT HOLDS (units-model.ts grantOn — the reading rule, the reshape plan §4.3): an account's right in a unit on a
   date, live, or over the rows a command was judged by */
export const grantOfOn = (acct: GrantHolder, unit: string, iso: string = todayIso()): Grant | undefined => grantOn(unitRows(), acct, unit, iso, fallbackHome())
export const grantBefore = (acct: GrantHolder, unit: string, iso: string, rows: UnitRows): Grant | undefined => grantOn(rows, acct, unit, iso, fallbackHome())
/* does this one row hold on `iso` for that account, over `rows` */
export const grantRowHolds = (acct: GrantHolder, g: Pick<Grant, 'from'>, iso: string, rows: UnitRows): boolean => grantHolds(rows, acct, g, iso, fallbackHome())
/* the one check for homes and places (units-model.ts datedRowsBreach), with this store's fallback home */
export const datedBreach = (before: UnitRows, after: UnitRows, today: string, opts: Omit<Parameters<typeof datedRowsBreach>[3], 'fallback'>): DatedBreach | null =>
  datedRowsBreach(before, after, today, { ...opts, fallback: fallbackHome() })
/* the one last-admin rule (state/lastadmin.ts — Piece C), with this store's fallback home */
/* (K3 — his D2160: an admin who moved squadron is a MEMBER of the squadron he joined, and the lock does not count him as
   its admin at home; lastadmin.ts's own `home` asks levelFrom for it, the accounts handed in whole, their `adminOf` /
   `adminFrom` with them) */
export const lockBreach = (w: Omit<LockWorld, 'fallback'>): LockBreach | null => lastAdminBreach({ ...w, fallback: fallbackHome() })
/* a step's draft of the rows: these rows with some taken away and some laid on (a row of the same id replaced) — what a
   door hands the lock, so it judges the rows the step would leave, as the gate does */
export function rowsDraft(r: UnitRows, d: { units?: Unit[]; unitplaces?: UnitRows['unitplaces']; grants?: Grant[]; homes?: UnitRows['homes']; dropGrants?: (g: Grant) => boolean }): UnitRows {
  const lay = <T extends { id: string }>(was: T[], add: T[] | undefined): T[] => (add?.length ? [...was.filter(x => !add.some(y => y.id === x.id)), ...add] : was)
  return {
    units: lay(r.units, d.units), places: r.places, unitplaces: lay(r.unitplaces, d.unitplaces),
    grants: lay(d.dropGrants ? r.grants.filter(g => !d.dropGrants!(g)) : r.grants, d.grants), homes: lay(r.homes, d.homes),
  }
}
/* an account by its id as the reading rule takes it (its man and its link day); a right naming an account that is gone
   has no man — it holds for nobody a person can use */
const holderOf = (account: string): GrantHolder => { const a = accountById(account); return { id: account, pid: a ? String(a.pid) : '', pidFrom: a?.pidFrom } }
/* PLAN IS A MASTER ADMIN'S TO GIVE, RAISE, LOWER OR TAKE (the Plan audit's PA1 — D2199, D2211): the approved drawing's
   words (picture 1b of 19 Nov, D2217) */
export const PLAN_MASTER_ONLY = 'Only a master admin gives Plan or makes a master admin.'
/* (a signed-in account that is not a master's; no account behind the session — a probe's or a test's — the gate judges) */
const notMaster = (): boolean => { const me = signedInAccount(); return !!me && me.master !== true }

/* ---- the writes ---- */
/* (a refusal raised inside a command keeps its own words; the gate's reason never reaches the screen — the generic words
   until these doors are drawn, D1625; as roster-add.ts saidOf — Fable's blind read, 3) */
function said(r: CommitResult): UnitSave {
  if ('queued' in r) return { ok: false, pending: r.done.then(said) }
  return { ok: r.ok, ...(!r.ok ? { message: (r.reason === 'refused' && r.message) || 'This change could not be saved.' } : {}) }
}
/* one row written and read back — a write the store did not keep fails the whole command */
function put(k: string, v: unknown): void {
  store.set(k, v)
  if (JSON.stringify(store.get(k, null)) !== JSON.stringify(v)) throw new Error('The setting could not be saved. Try again.')
  ROWS = null
}
function save(type: string, meta: unknown, fn: () => string | void): UnitSave {
  let id: string | undefined
  /* (a right given, changed or taken — "+ New squadron"'s first admin among them — tells its man, inside: batch 1's second
     half §7 item 6, state/acctlines.ts) */
  const r = said(commitSettingsIntent(type, meta, txn => { const was = accessWas(); const got = fn(); if (got) id = got; ROWS = null; tellAccess(txn, was) }))
  ROWS = null
  return r.ok && id ? { ...r, id } : r
}
const no = (message: string): UnitSave => ({ ok: false, message })

/* A NEW PERSON'S HOME, written INSIDE the command that makes him (person.add, account.addNew, access.approveNew —
   roster-add.ts and accounts.ts): the adder's own home unit by default (D2094), from today. Nothing when the adder has no
   home (a shared store whose rows are not made yet) — the gate's own check then has nothing to judge. Mutations only. */
/* (PD1 — the page's squadron where the signed-in adder runs it: installed by perms.ts, which this file never imports) */
/* (`named` — the Home squadron Add a person names, batch 1's second half §4 item 7, R-A3: it wins over both defaults; the
   door has checked it is there and the adder's to give — roster-add.ts newHomeProblem — and the gate checks it again) */
let NEW_HOME_UNIT: ((adderPid: string | null) => string | null) | null = null
export function setNewHomeUnit(fn: ((adderPid: string | null) => string | null) | null): void { NEW_HOME_UNIT = fn }
export function putNewHome(pid: string, adderPid: string | null, named?: string): void {
  if (!isCommitting()) throw new Error('A home is written only inside the command that makes the person')
  const unit = named || (NEW_HOME_UNIT && NEW_HOME_UNIT(adderPid)) || (adderPid ? homeOn(adderPid, todayIso()) : fallbackHome())
  if (!unit) return
  const id = newId('h')
  /* written as the accounts write theirs — no read-back: this row rides inside ANOTHER module's command, and a world
     with no storage behind it (a headless test, a store that cannot be touched) must still add the person; there the
     row is simply not kept and he reads as the demo's fallback home, as every unstored person does */
  store.set(HOME_PFX + id, { id, pid, unit, from: todayIso() })
  ROWS = null
}

/* unit.add — a master makes a unit at a place, and names its first admin (D2184 Q10): in step 1 an existing account,
   given an 'admin' grant there (step 3 of the batch adds a new person as he would be added anywhere) */
/* (`place` — a place's id, or a NEW place, its name and time zone, made in the same command: "+ New place…" inside
   "+ New squadron", one Undo step — batch 1's second half §6 item 4, D2308, R-O8b) */
export function addUnit(numIn: string, place: string | NewPlace, firstAdmin?: string): UnitSave {
  const num = String(numIn ?? '').trim()
  if (!validUnitNum(num)) return no('Type the squadron number — letters and digits, at most 12')
  if (units().some(u => u.num === num)) return no(`Squadron ${num} is already set up`)
  const np = typeof place === 'string' ? null : place
  const npBad = np ? newPlaceProblem(np) : null
  if (npBad) return no(npBad)
  if (!np && !placeById(place as string)) return no('Pick the place the squadron is at')
  const placeId = np ? newId('p') : (place as string)
  /* its first admin's Plan is a right given today (R5 — the reshape plan §4.4): said at the door in setGrant's own words,
     never the gate's reason — not between his move saved and its day, and only an admin's sign-in (PA2) */
  /* NEVER A SQUADRON WITH NO ADMIN (B6 — D2191, D2184 Q10; the reshape plan §5.2): its first admin is required, and he must
     be one who counts there on every day the lock judges (state/lastadmin.ts) — a master admin counts only at home, and
     a first admin whose move away is saved for a later day leaves it none from then. Those two say the generic words
     until "+ New squadron" has its screen, drawn for him (D1625). */
  if (!firstAdmin) return no("Name the squadron's first admin.")
  const faBad = firstAdminProblem(firstAdmin)
  if (faBad) return no(faBad)
  const id = newId('u'), up = newId('up'), g = newId('g')
  const draft = rowsDraft(unitRows(), {
    units: [{ id, num, kind: 'sqn' }], unitplaces: [{ id: up, unit: id, place: placeId, from: todayIso() }],
    grants: [{ id: g, account: firstAdmin, unit: id, level: 'admin', from: todayIso(), first: true }],
  })
  if (lockProblemFor({ rows: draft })) return no('This change could not be saved.')
  return save('unit.add', null, () => {
    if (np) put(PLACE_PFX + placeId, { id: placeId, name: np.name.trim(), tz: np.tz })
    put(UNIT_PFX + id, { id, num, kind: 'sqn' })
    put(UNITPLACE_PFX + up, { id: up, unit: id, place: placeId, from: todayIso() })
    /* (dated the day it is given, as setGrant's: the commit gate refuses a new right not dated today — fix read 8, fault G) */
    /* (`first` — K3: the squadron's named first admin moves into it as its admin, units-model.ts adminRoleHolds; every
       other man who moves squadron joins as a member, D2160) */
    put(GRANT_PFX + g, { id: g, account: firstAdmin, unit: id, level: 'admin', from: todayIso(), first: true, fromAt: Date.now() })
    return id
  })
}

/* WHO MAY BE A NEW SQUADRON'S FIRST ADMIN — the door's own checks, one body: addUnit asks it, and Admin → Squadrons'
   first-admin list (ui/squadrons-model.ts) offers only the accounts it passes, so the list never offers a man the door
   would refuse (§15 D14 — the agent's narrowing of D2308's words, told to him). An account that is gone passes here: the
   gate judges it. */
export function firstAdminProblem(account: string): string | null {
  const fa = accountById(account)
  if (!fa) return null
  if (homeOn(String(fa.pid), moveFrom(todayIso())) !== homeOn(String(fa.pid), todayIso())) return 'He moves squadron tomorrow — give this after the move'
  if (!adminNow(fa)) return 'This change could not be saved.'
  /* never a master admin (§15 D14): he acts in every squadron already, so Plan gives him nothing and the last-admin rule
     would not count him (state/lastadmin.ts) — the first-admin list leaves him out; no right is ever given his account */
  if (fa.master) return 'This change could not be saved.'
  return null
}

/* MAY THE SIGNED-IN ACCOUNT MOVE THIS SQUADRON — the move door's own check (moveUnit below), read by Admin → Squadrons to
   open a squadron's row only for an admin of it (§6 item 2) */
export const mayMoveUnit = (unit: string): boolean => signedInAdminOf(unit)

/* unit.place — a unit moves: a new row from tomorrow (D2119), its past places kept; a second move typed for the same
   date replaces that date's row */
/* (`place` — a place's id, or a NEW place made in the same command: "+ New place…" in the squadron's Place list, one
   Undo step — §6 item 2, R-O8b; by an admin of that squadron, held at the gate too) */
export function moveUnit(unit: string, place: string | NewPlace): UnitSave {
  if (!unitById(unit)) return no('That squadron is gone')
  const np = typeof place === 'string' ? null : place
  const npBad = np ? newPlaceProblem(np) : null
  if (npBad) return no(npBad)
  if (!np && !placeById(place as string)) return no('Pick the place the squadron is moving to')
  if (!signedInAdminOf(unit)) return no('This change could not be saved.')
  const placeId = np ? newId('p') : (place as string)
  const from = moveFrom(todayIso())
  if (placeIdOn(unitRows(), unit, from) === placeId) return no('The squadron is already there')
  const same = unitRows().unitplaces.find(x => x.unit === unit && x.from === from)
  return save('unit.place', null, () => {
    if (np) put(PLACE_PFX + placeId, { id: placeId, name: np.name.trim(), tz: np.tz })
    const id = same ? same.id : newId('up')
    put(UNITPLACE_PFX + id, { id, unit, place: placeId, from })
    return id
  })
}

/* A NEW PLACE, made inside the command that puts a squadron there (+ New squadron, a squadron's move) or alone by a
   master admin — its name and time zone, the same checks as setPlace */
export interface NewPlace { name: string; tz: string }
function newPlaceProblem(p: NewPlace): string | null {
  const name = String(p.name ?? '').trim()
  if (!name || name.length > MAX_PLACE_NAME) return `Type the place's name — at most ${MAX_PLACE_NAME} characters`
  if (!validTz(p.tz)) return 'Pick the place’s time zone'
  return null
}
/* the signed-in account an admin of that squadron today — its own admin, a Plan holder, a master admin (D2336); no
   account behind the session (a probe's or a test's) — the gate judges */
function signedInAdminOf(unit: string): boolean {
  const me = signedInAccount()
  if (!me) return true
  /* (levelOfAccount reads the role with the level: a member is no squadron's admin; a master admin is every one's) */
  return levelOfAccount(levelAcct(me), unit, todayIso()) === 'admin'
}
/* WHO MAY CHANGE A PLACE (§6 item 3 — D2196, D2336, PG1; §15 D13, §16 D13′): an admin of EVERY squadron at it, today or
   from a later day (units-model.ts unitsAtPlace), a master admin always; a place no squadron is at, and a new place on
   its own, a master admin's. The drawn words for two (D2336); for three or more they name every one, by the same rule
   (§9 — the agent's reading); for one, the drawn "Only an admin of 149 can change it." */
const COUNT = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve']
export function placeChangeProblem(placeId: string | undefined): string | null {
  const me = signedInAccount()
  if (!me || me.master) return null
  if (!placeId) return MASTER_ONLY_WORDS
  const at = unitsAtPlace(unitRows(), placeId, todayIso())
  if (!at.length) return MASTER_ONLY_WORDS
  if (at.every(u => signedInAdminOf(u))) return null
  const nums = at.map(u => unitById(u)?.num ?? u).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
  if (nums.length === 1) return `Only an admin of ${nums[0]} can change it.`
  if (nums.length === 2) return `Only an admin of both ${nums[0]} and ${nums[1]} can change the time zone: both squadrons are here.`
  const list = `${nums.slice(0, -1).join(', ')} and ${nums[nums.length - 1]}`
  return `Only an admin of ${list} can change the time zone: all ${COUNT[nums.length] ?? nums.length} squadrons are here.`
}
/* place.set — a place made, or its name or time zone changed */
export function setPlace(p: { id?: string; name: string; tz: string }): UnitSave {
  const name = String(p.name ?? '').trim()
  if (!name || name.length > MAX_PLACE_NAME) return no(`Type the place's name — at most ${MAX_PLACE_NAME} characters`)
  if (!validTz(p.tz)) return no('Pick the place’s time zone')
  if (p.id && !placeById(p.id)) return no('That place is gone')
  const who = placeChangeProblem(p.id)
  if (who) return no(who)
  return save('place.set', null, () => {
    const id = p.id || newId('p')
    put(PLACE_PFX + id, { id, name, tz: p.tz })
    return id
  })
}

/* grant.set — a right in a unit that is not the account's home: 'admin' (Plan) or 'view' (the reshape plan §4.3, Piece B).
   "He already has that" and the row it changes are the right that HOLDS today (grantOn); where none holds but an ended
   row of that account and unit is stored, a NEW row is written — an ended row is never re-dated, so its Undo removes the
   new row and the old one stays ended. */
export function setGrant(account: string, unit: string, level: GrantLevel, accountPid: string): UnitSave {
  if (level !== 'admin' && level !== 'view') return no('Pick admin or view')
  if (!unitById(unit)) return no('That squadron is gone')
  if (homeOn(accountPid, todayIso()) === unit) return no('That is his own squadron — his role there is set on his account')
  const acct = accountById(account)
  const had = grantOn(unitRows(), { id: account, pid: accountPid, pidFrom: acct?.pidFrom }, unit, todayIso(), fallbackHome())
  if (had && had.level === level) return no('He already has that')
  /* PLAN — given, raised or lowered — only by a master admin (PA1); and only to an admin (PA2 — D2201, D785: an admin is
     given Plan; its words wait for the first screen that gives a right, drawn then — §14 of the plan) */
  if ((level === 'admin' || had?.level === 'admin') && notMaster()) return no(PLAN_MASTER_ONLY)
  if (level === 'admin' && acct && !adminNow(acct)) return no('This change could not be saved.')
  /* NO RIGHT ON A MASTER ADMIN'S ACCOUNT (batch 1's second half, plan §15 D14 — R2-O14): he acts in every squadron, his row
     reads "Full access" with no buttons (R4), so a row given him would be hidden and come back when the mark comes off.
     The generic words: no screen offers it. Held at the gate too (perms.ts unitRowViolation). */
  if (acct?.master) return no('This change could not be saved.')
  /* NOT BETWEEN A MOVE SAVED AND ITS DAY (Fable's sample review, 1 — his D2203; the plan §4.3, Fable 4, Opus L3): a right
     ends at the start of his move day, so one given or raised in the rest of the day it is saved would last that day
     only. A lowering passes — whatever it leaves ends at midnight by the rule. Held at the gate too (perms.ts
     unitRowViolation) */
  const gives = !had || (had.level === 'view' && level === 'admin')
  if (gives && homeOn(accountPid, moveFrom(todayIso())) !== homeOn(accountPid, todayIso())) return no('He moves squadron tomorrow — give this after the move')
  /* a squadron's only Plan lowered to View leaves it no admin (B6 — the one last-admin rule, state/lastadmin.ts) */
  if (had && had.level === 'admin' && level !== 'admin') {
    const lock = lockProblemFor({ rows: rowsDraft(unitRows(), { grants: [{ id: had.id, account, unit, level, from: todayIso() }] }) })
    if (lock) return no(lock)
  }
  return save('grant.set', null, () => {
    const id = had ? had.id : newId('g')
    /* (its day — fault P: notices.ts adminThen counts it only from then, so a line his move retired stays retired; and,
       made Plan, its moment — §16 D1′: a level written here always differs from the one it had) */
    put(GRANT_PFX + id, { id, account, unit, level, from: todayIso(), ...(level === 'admin' ? { fromAt: Date.now() } : {}) })
    return id
  })
}
/* grant.remove — the right that holds today; Plan only by a master admin (PA1) */
export function removeGrant(account: string, unit: string): UnitSave {
  const had = grantOn(unitRows(), holderOf(account), unit, todayIso(), fallbackHome())
  if (!had) return no('He has no right there to take away')
  if (had.level === 'admin' && notMaster()) return no(PLAN_MASTER_ONLY)
  /* a squadron's only Plan taken away leaves it no admin (B6 — the one last-admin rule, state/lastadmin.ts) */
  if (had.level === 'admin') {
    const lock = lockProblemFor({ rows: rowsDraft(unitRows(), { dropGrants: x => x.id === had.id }) })
    if (lock) return no(lock)
  }
  return save('grant.remove', null, () => { put(GRANT_PFX + had.id, null) })
}
/* EVERY RIGHT OF AN ACCOUNT THAT IS GOING (fix read 11, fault E — SEC11-5): written INSIDE the person delete's own
   command (accounts.ts dropAccountOfPid), as a move drops a man's rights inside its own (setHome above). A right left
   naming a sign-in that is gone was handed to whoever got a new account under that id next. (fix read 11, fault H — the
   host, D2203 read for a delete:) the gate lets the admin making an allowed person delete drop these rights in any
   squadron, since the same command takes the account row away (perms.ts unitRowViolation); a bare removal by one who is
   no admin of that squadron stays refused. */
export function dropGrantsOfAccount(accountId: string): void {
  if (!isCommitting()) throw new Error('dropGrantsOfAccount runs only inside a command')
  for (const g of unitRows().grants.filter(x => x.account === accountId)) put(GRANT_PFX + g.id, null)
}
/* ONE SQUADRON'S LINE OF A PERSON'S ACCESS, written INSIDE Admin → Users' one Save (accounts.ts saveAccess — batch 1's
   second half, plan §4 item 5): the right that holds today set to `level`, or taken away (null). As setGrant writes it —
   the same row raised or lowered, dated today; where none holds, a new row (an ended row is never re-dated). The door
   has judged it; the commit gate judges every row again. */
export function putGrantLine(account: string, unit: string, level: GrantLevel | null): void {
  if (!isCommitting()) throw new Error('putGrantLine runs only inside a command')
  const had = grantOn(unitRows(), holderOf(account), unit, todayIso(), fallbackHome())
  if (level == null) { if (had) put(GRANT_PFX + had.id, null); return }
  if (had && had.level === level) return
  const id = had ? had.id : newId('g')
  put(GRANT_PFX + id, { id, account, unit, level, from: todayIso(), ...(level === 'admin' ? { fromAt: Date.now() } : {}) })
}
/* named rights, dropped INSIDE another command (a Plan holder made a member — accounts.ts updateAccount, PA2) */
export function dropGrantRows(ids: readonly string[]): void {
  if (!isCommitting()) throw new Error('dropGrantRows runs only inside a command')
  for (const id of ids) put(GRANT_PFX + id, null)
}

/* home.set — a person's home unit: his first row from today, a change from tomorrow (D2119); the same date replaces */
export function setHome(pid: string, unit: string): UnitSave {
  if (!unitById(unit)) return no('That squadron is gone')
  /* R1 (the blind read's Opus F1): a master admin's squadron is a master admin's to change (D2205 — masterChangeProblem
     first, "Only a master admin can do that"), and nobody moves himself — his D2249, in his words. Held at the gate too
     (perms.ts §8, G1). */
  const master = masterChangeProblem(pid)
  if (master) return no(master)
  const me = signedInAccount()
  if (me && String(me.pid) === pid && homeOn(pid, todayIso())) return no("You can't move yourself to another squadron — ask another admin")
  const mine = unitRows().homes.filter(h => h.pid === pid)
  /* a man who has a squadron today — by a row, or the demo's 142 for a man with none — moves from tomorrow (D2119);
     only a man with no squadron at all is placed from today. Reading the rows alone placed the demo's 142 men (no row)
     from today, rewriting a day already begun (the full check's Opus read, 18 Nov 26) — the commit gate refuses that */
  const now = homeOn(pid, todayIso())
  /* K4 — a man is moved by an admin of the squadron he is in (his D2160: "the new one never asked"; the gate, perms.ts
     unitRowViolation, asks the squadron he leaves): anyone else is told whose he is, in Admin → Users' own words
     (accounts.ts otherSquadronPersonProblem), never the gate's refusal */
  if (now) { const other = otherSquadronPersonProblem(pid); if (other) return no(other) }
  const from = now ? moveFrom(todayIso()) : todayIso()
  if (now && homeOn(pid, from) === unit) return no('That is already his squadron')
  const same = mine.find(h => h.from === from)
  /* never a squadron left with no admin (Astra 1, security H3) — the one last-admin rule (state/lastadmin.ts, Piece C) over
     the rows the move leaves, on every date, said in the lock's words; held at the gate too. The ids are the draft's only:
     a row of the same date is replaced, as the write below replaces it */
  const draftHomes = [{ id: same ? same.id : '~move', pid, unit, from }]
  if (now && !mine.length) draftHomes.unshift({ id: '~base', pid, unit: now, from: todayIso() })
  const lock = lockProblemFor({ rows: rowsDraft(unitRows(), { homes: draftHomes }) })
  if (lock) return no(lock)
  /* his D2203 (18 Nov 26): a man who moves to another squadron loses every View and Plan he held of others — no right is
     touched here: the reading rule (units-model.ts grantOn) ends each at the start of his move day (his D2243 — Q4), so
     the move writes his squadron rows only, and its Undo and Redo restore those alone (the reshape plan §4.3, R3) */
  return save('home.set', null, () => {
    /* a man with no row of his own (the demo's 142) gets his squadron of today written first: a person's FIRST row covers
       every day before it (units-model.ts atOn), so the move alone would have moved his today and his past too */
    if (now && !mine.length) { const h0 = newId('h'); put(HOME_PFX + h0, { id: h0, pid, unit: now, from: todayIso() }) }
    const id = same ? same.id : newId('h')
    put(HOME_PFX + id, { id, pid, unit, from })
    return id
  })
}
