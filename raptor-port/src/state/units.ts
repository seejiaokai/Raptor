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
import { setHomeResolver } from '../engine/roster'
import { DEMO_149_PEOPLE } from './demoseed'
import {
  UNIT_PFX, PLACE_PFX, UNITPLACE_PFX, GRANT_PFX, HOME_PFX, UNIT_ROW_PREFIXES,
  rowsFrom, placeIdOn, homeUnitOn, grantIn, unitIn, placeIn, levelFrom, moveFrom,
  validUnitNum, validTz, MAX_PLACE_NAME,
  type UnitRows, type Unit, type Place, type Grant, type GrantLevel, type UnitLevel, type LevelAccount,
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
export const units = (): Unit[] => unitRows().units
export const unitById = (id: string): Unit | undefined => unitIn(unitRows(), id)
export const places = (): Place[] => unitRows().places
export const placeById = (id: string): Place | undefined => placeIn(unitRows(), id)
/* the place a unit is at on a date */
export const placeOfOn = (unit: string, iso: string): Place | null => { const id = placeIdOn(unitRows(), unit, iso); return id ? placeIn(unitRows(), id) ?? null : null }
/* a person's home unit on a date (the demo's 142 when he has no row; null on a shared store) */
export const homeOn = (pid: string, iso: string = todayIso()): string | null => homeUnitOn(unitRows(), pid, iso, fallbackHome())
/* …and the engine's rosters ask the same (engine/roster.ts rosterOf, engine/inputs.ts inputsFor — multi-squadron step 3):
   the engine does not import state/, so the answer is handed to it here, once, as this module loads */
setHomeResolver((pid, iso) => homeOn(pid, iso))
/* the rights an account holds in OTHER units */
export const grantsOf = (accountId: string): Grant[] => unitRows().grants.filter(g => g.account === accountId)
/* an account's level in a unit on a date — the one answer (units-model.ts levelFrom); the caller hands in the account */
export const levelOfAccount = (acct: LevelAccount | null | undefined, unit: string, iso: string = todayIso()): UnitLevel | null =>
  levelFrom(acct, unit, iso, unitRows(), fallbackHome())
/* the same over the rows before a command (the commit gate) */
export const levelBefore = (acct: LevelAccount | null | undefined, unit: string, iso: string, rows: UnitRows): UnitLevel | null =>
  levelFrom(acct, unit, iso, rows, fallbackHome())
export const homeBefore = (pid: string, iso: string, rows: UnitRows): string | null => homeUnitOn(rows, pid, iso, fallbackHome())

/* ---- the writes ---- */
function said(r: CommitResult): UnitSave {
  if ('queued' in r) return { ok: false, pending: r.done.then(said) }
  return { ok: r.ok, ...(!r.ok ? { message: r.message || 'This change could not be saved.' } : {}) }
}
/* one row written and read back — a write the store did not keep fails the whole command */
function put(k: string, v: unknown): void {
  store.set(k, v)
  if (JSON.stringify(store.get(k, null)) !== JSON.stringify(v)) throw new Error('The setting could not be saved. Try again.')
  ROWS = null
}
function save(type: string, meta: unknown, fn: () => string | void): UnitSave {
  let id: string | undefined
  const r = said(commitSettingsIntent(type, meta, () => { const got = fn(); if (got) id = got; ROWS = null }))
  ROWS = null
  return r.ok && id ? { ...r, id } : r
}
const no = (message: string): UnitSave => ({ ok: false, message })

/* A NEW PERSON'S HOME, written INSIDE the command that makes him (person.add, account.addNew, access.approveNew —
   roster-add.ts and accounts.ts): the adder's own home unit by default (D2094), from today. Nothing when the adder has no
   home (a shared store whose rows are not made yet) — the gate's own check then has nothing to judge. Mutations only. */
export function putNewHome(pid: string, adderPid: string | null): void {
  if (!isCommitting()) throw new Error('A home is written only inside the command that makes the person')
  const unit = adderPid ? homeOn(adderPid) : fallbackHome()
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
export function addUnit(numIn: string, placeId: string, firstAdmin?: string): UnitSave {
  const num = String(numIn ?? '').trim()
  if (!validUnitNum(num)) return no('Type the squadron number — letters and digits, at most 12')
  if (units().some(u => u.num === num)) return no(`Squadron ${num} is already set up`)
  if (!placeById(placeId)) return no('Pick the place the squadron is at')
  return save('unit.add', null, () => {
    const id = newId('u')
    put(UNIT_PFX + id, { id, num, kind: 'sqn' })
    const up = newId('up')
    put(UNITPLACE_PFX + up, { id: up, unit: id, place: placeId, from: todayIso() })
    if (firstAdmin) { const g = newId('g'); put(GRANT_PFX + g, { id: g, account: firstAdmin, unit: id, level: 'admin' }) }
    return id
  })
}

/* unit.place — a unit moves: a new row from tomorrow (D2119), its past places kept; a second move typed for the same
   date replaces that date's row */
export function moveUnit(unit: string, placeId: string): UnitSave {
  if (!unitById(unit)) return no('That squadron is gone')
  if (!placeById(placeId)) return no('Pick the place the squadron is moving to')
  const from = moveFrom(todayIso())
  if (placeIdOn(unitRows(), unit, from) === placeId) return no('The squadron is already there')
  const same = unitRows().unitplaces.find(x => x.unit === unit && x.from === from)
  return save('unit.place', null, () => {
    const id = same ? same.id : newId('up')
    put(UNITPLACE_PFX + id, { id, unit, place: placeId, from })
    return id
  })
}

/* place.set — a place made, or its name or time zone changed */
export function setPlace(p: { id?: string; name: string; tz: string }): UnitSave {
  const name = String(p.name ?? '').trim()
  if (!name || name.length > MAX_PLACE_NAME) return no(`Type the place's name — at most ${MAX_PLACE_NAME} characters`)
  if (!validTz(p.tz)) return no('Pick the place’s time zone')
  if (p.id && !placeById(p.id)) return no('That place is gone')
  return save('place.set', null, () => {
    const id = p.id || newId('p')
    put(PLACE_PFX + id, { id, name, tz: p.tz })
    return id
  })
}

/* grant.set — a right in a unit that is not the account's home: 'admin' or 'view'; one grant per account and unit, a
   second replacing the first (its id kept) */
export function setGrant(account: string, unit: string, level: GrantLevel, accountPid: string): UnitSave {
  if (level !== 'admin' && level !== 'view') return no('Pick admin or view')
  if (!unitById(unit)) return no('That squadron is gone')
  if (homeOn(accountPid) === unit) return no('That is his own squadron — his role there is set on his account')
  const had = grantIn(unitRows(), account, unit)
  if (had && had.level === level) return no('He already has that')
  return save('grant.set', null, () => {
    const id = had ? had.id : newId('g')
    put(GRANT_PFX + id, { id, account, unit, level })
    return id
  })
}
export function removeGrant(account: string, unit: string): UnitSave {
  const had = grantIn(unitRows(), account, unit)
  if (!had) return no('He has no right there to take away')
  return save('grant.remove', null, () => { put(GRANT_PFX + had.id, null) })
}

/* home.set — a person's home unit: his first row from today, a change from tomorrow (D2119); the same date replaces */
export function setHome(pid: string, unit: string): UnitSave {
  if (!unitById(unit)) return no('That squadron is gone')
  const mine = unitRows().homes.filter(h => h.pid === pid)
  /* a man who has a squadron today — by a row, or the demo's 142 for a man with none — moves from tomorrow (D2119);
     only a man with no squadron at all is placed from today. Reading the rows alone placed the demo's 142 men (no row)
     from today, rewriting a day already begun (the full check's Opus read, 18 Nov 26) — the commit gate refuses that */
  const now = homeOn(pid)
  const from = now ? moveFrom(todayIso()) : todayIso()
  if (now && homeOn(pid, from) === unit) return no('That is already his squadron')
  const same = mine.find(h => h.from === from)
  return save('home.set', null, () => {
    /* a man with no row of his own (the demo's 142) gets his squadron of today written first: a person's FIRST row covers
       every day before it (units-model.ts atOn), so the move alone would have moved his today and his past too */
    if (now && !mine.length) { const h0 = newId('h'); put(HOME_PFX + h0, { id: h0, pid, unit: now, from: todayIso() }) }
    const id = same ? same.id : newId('h')
    put(HOME_PFX + id, { id, pid, unit, from })
    return id
  })
}
