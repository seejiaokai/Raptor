// src/storage/keyowner.ts
/* WHOSE IS EACH STORED RECORD — A SQUADRON'S, OR EVERYONE'S (the multi-squadron build, batch 1, step 0: the key
   inventory — plan docs/superpowers/plans/2026-11-17-multi-sqn-build-batches.md §3.4, the red team's F-M1).

   Two squadrons share one app from batch 1 (D1695, D2087). Every stored record is either
   - a UNIT's: it belongs to one squadron (a detachment from batch 2) and each unit keeps its own copy — the schedule's
     weeks, days and issued versions, saved plans, the planning calendar, Logic, the day / wave / duty templates, the
     flying plan, the change history, the guest and members' switches, the whole Leave War, the whole Tracker; or
   - the COMMUNITY's: one record for everyone, whatever squadron is in view — people, accounts, access requests,
     inputs (one authoritative record each, asked for by unit through `inputsFor` from step 3), the bell's notices,
     every "seen" record, the store's own stamp and its change log.
   Nothing a person's own squadron owns is ever worked out from whatever schedule happens to be in view (§3.4's
   principle) — this list is what makes "whose" a question with one answer.

   Pure, no imports beyond the collection type. A record on NEITHER list is a design gap, not a default: `ownerOf`
   answers null and `keyowner.test.ts` fails — so a new kind of record cannot reach storage without someone deciding
   whose it is. The same split is written out for people in docs/data-schema.md §Whose is each record. */
import type { Collection } from './backend'

export type KeyOwner = 'unit' | 'community'

/* Collections that are wholly one owner's: every row in them, whatever its id. */
export const UNIT_COLLECTIONS: readonly Collection[] = [
  'weeks',    // the schedule's weeks, days, issued versions and retractions (World 1)
  'plan',     // the planning calendar's pucks (`pp:`) and day remarks (`dm:`)
  'leavewar', // the Leave War's whole world — wars, records, ledger, openings, figures, grades, profiles, settings
  'tracker',  // the Tracker's whole key space — courses, charts, ball details, flex, layouts, marks, dates, pace
]
export const COMMUNITY_COLLECTIONS: readonly Collection[] = [
  'people',   // the roster — one record a person, whatever squadron he is in
  'inputs',   // one record an input; read by unit through the person's home unit on the date (step 3)
  'notices',  // the bell's notices — each addressed to a person
  'changes',  // the store's own change log — an invalidation list naming rows, one stream for the whole store
]

/* The `settings` collection is mixed: its fixed keys and its row prefixes, each placed once. */
export const UNIT_SETTINGS: readonly string[] = [
  'rules',        // Logic — each squadron its own, crew rest included (D2109, D2122)
  'daytpl', 'dutytpl', 'wavetpl', 'wavehide', 'wavedefault', // the day / duty / wave templates and the house wave order
  'cxreasons',    // the cancel-reason list the scheduler picks from
  'stores',       // the stores list a jet's stores box offers
  'lookahead',    // how many weeks ahead the schedule pages reach
  'secdefault',   // the house order of a day's sections
  'qualcols',     // the LoX column list on Quals (a person's ticks stay on his own record)
  'insights',     // "Track blue/red sorties" — a squadron's switch (D524)
  'sanscalendar', // the SANS calendar's three day colours, with the flying plan
  'guestview',    // the admin's switch letting people waiting for access read the published week
  'memberfile',   // "members may file duties and commitments for other people" (D654)
]
export const UNIT_SETTING_PREFIXES: readonly string[] = [
  'flyday:', 'flyrule:', 'flyrun:', // the flying plan — a date's class and figures, a weekday's rule, a running figure
  'missionrole:', // a formation's blue/red answer on a schedule day
  'elog:',        // the change history's lines — each unit's own schedule's history
]
export const COMMUNITY_SETTINGS: readonly string[] = [
  'schema',       // the store's own stamp (storage/schema.ts)
]
export const COMMUNITY_SETTING_PREFIXES: readonly string[] = [
  'account:', 'accessreq:', 'reqseen:', // accounts, access requests and each admin's seen requests
  'seen:',        // each person's own "seen" for the change history
  'noticeseen:',  // each person's own read marks of his bell
  'apprseen:',    // when an admin last opened the Leave War's Approvals — his own row
  'lwseen:',      // when a person last opened his own Leave War window — his own row
]

/* Whose a stored record is, from its collection and id alone; null = on neither list (a gap the test catches). */
export function ownerOf(collection: Collection, id: string): KeyOwner | null {
  if (UNIT_COLLECTIONS.includes(collection)) return 'unit'
  if (COMMUNITY_COLLECTIONS.includes(collection)) return 'community'
  if (collection !== 'settings') return null
  if (UNIT_SETTINGS.includes(id) || UNIT_SETTING_PREFIXES.some(p => id.startsWith(p))) return 'unit'
  if (COMMUNITY_SETTINGS.includes(id) || COMMUNITY_SETTING_PREFIXES.some(p => id.startsWith(p))) return 'community'
  return null
}

/* THE MODULE SINGLETONS — the live, in-memory halves of the records above (data-schema.md §Whose is each record).
   A UNIT's singleton holds the one unit IN VIEW, as it holds one week today: the "142 ▾" pick reloads it by the path a
   week load uses (step 2). A COMMUNITY singleton holds everyone's and is never swapped; its every enumeration of
   people goes through `rosterOf(unit, iso)` from step 3. The derived results of a check (`WARN`, `REST`, `EVD`, …)
   follow the schedule in view. `module` is the file under src/ that exports it; the test checks each still does, so a
   rename cannot leave this list stale. Module-private state (the week stash, the flying plan's cache, Quals' column
   list, the seen caches) is named in the doc with its file. */
export const UNIT_SINGLETONS: ReadonlyArray<{ name: string; module: string }> = [
  { name: 'DAYS', module: 'engine/data' },
  { name: 'SCHED', module: 'engine/publish' },
  { name: 'DATES', module: 'engine/inputs' },
  { name: 'CURWEEK', module: 'engine/waves' },
  { name: 'PLANPUCKS', module: 'state/plan' },
  { name: 'DAYRMK', module: 'state/plan' },
  { name: 'VCONF', module: 'engine/rules' },
  { name: 'SHIFT_HARD', module: 'engine/rules' },
  { name: 'CXR_CFG', module: 'engine/cxreasons' },
  { name: 'DAYTPL_CFG', module: 'engine/daytpl' },
  { name: 'DUTYTPL_CFG', module: 'engine/dutytpl' },
  { name: 'WAVETPL_CFG', module: 'engine/wavetpl' },
  { name: 'WAVEHIDE', module: 'engine/wavetpl' },
  { name: 'STORE_CFG', module: 'engine/stores' },
  { name: 'LOOK_CFG', module: 'engine/lookahead' },
  { name: 'ELOG', module: 'engine/editlog' },
  { name: 'GUESTVIEW', module: 'state/accounts' },
  { name: 'WARN', module: 'engine/validate' },
  { name: 'REST', module: 'engine/validate' },
  { name: 'EVD', module: 'engine/validate' },
]
export const COMMUNITY_SINGLETONS: ReadonlyArray<{ name: string; module: string }> = [
  { name: 'PEOPLE', module: 'engine/people' },
  { name: 'ID_BY_CS', module: 'engine/people' },
  { name: 'INPUTS', module: 'engine/inputs' },
  { name: 'ACCOUNTS_LIST', module: 'state/accounts' },
  { name: 'ACCESS_REQS', module: 'state/accounts' },
  { name: 'NOTICES', module: 'state/notices' },
]
