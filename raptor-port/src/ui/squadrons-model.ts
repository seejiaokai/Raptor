/* ADMIN → SQUADRONS — WHAT THE PAGE READS (batch 1's second half, plan §6 — P2, PG1, D2196, D2298, D2306, D2308, D2336;
   pictures b1-3, b1-4, b1-9, b1-10, p7). Pure reads, no screen: ui/SquadronsPanel.tsx draws what this answers.

   - `squadronRows` — each squadron by number, its place today and its people (the count Admin → Users' "People · N"
     reads for that squadron — ui/userslist-model.ts, so the two never disagree): "Home base · 61 people";
   - `placeRows` — each place, A to Z, its grey line the squadrons at it (today or from a later day — a move saved for
     tomorrow counts, as the time zone's door reads it: units-model.ts unitsAtPlace) then its time zone for today:
     "142 · 149 · Perth · GMT+8";
   - `tzLabel` / `tzChoices` — a time zone picked by name and shown as GMT+X for today (D2165, D2298): "Darwin · GMT+9:30";
     the list is every zone the browser knows (Intl), never a list kept here that could drift from it;
   - `firstAdminChoices` — "+ New squadron"'s first admin: the admins of the squadrons there are, offered only where the
     door would take him (state/units.ts firstAdminProblem — not a master admin, not moving tomorrow; §15 D14), switched
     on, "Hunter · 142";
   - `newSqnNote` — the form's line, D2306's words with the number typed filled in (the drawn faded "150" while none is
     typed), and b1-10's "Saved together: …" first where a new place is made with it. */
import { PEOPLE } from '../engine/people'
import { ACCOUNTS_LIST } from '../state/accounts'
import { units, places, unitRows, placeOfOn, unitById, homeOn, firstAdminProblem } from '../state/units'
import { gmtLabel, unitsAtPlace, validTz } from '../state/units-model'
import { usersListOf } from './userslist-model'

/* the drawn faded example in the number box (b1-9), and the number the line names until one is typed */
export const NUM_EXAMPLE = '150'
/* the last choice of every Place list (D2298): it opens the new place's name and time zone in the same form */
export const NEW_PLACE = '+new'

const byNum = (a: string, b: string) => a.localeCompare(b, undefined, { numeric: true })
const numOf = (u: string) => unitById(u)?.num ?? u

export interface SquadronRow { id: string; num: string; sub: string }
export function squadronRows(iso: string): SquadronRow[] {
  return [...units()].sort((a, b) => byNum(a.num, b.num)).map(u => {
    const n = usersListOf(u.id, iso, '').count
    const place = placeOfOn(u.id, iso)
    return { id: u.id, num: u.num, sub: [place?.name, `${n} ${n === 1 ? 'person' : 'people'}`].filter(Boolean).join(' · ') }
  })
}

/* "Australia/Perth" → "Perth"; "America/Argentina/Buenos_Aires" → "Buenos Aires" */
export const cityOf = (tz: string): string => (tz.split('/').pop() || tz).replace(/_/g, ' ')
export const tzLabel = (tz: string, iso: string): string => { const g = gmtLabel(tz, iso); return g ? `${cityOf(tz)} · ${g}` : cityOf(tz) }

export interface PlaceRow { id: string; name: string; tz: string; sub: string; at: string[] }
export function placeRows(iso: string): PlaceRow[] {
  const r = unitRows()
  return [...places()].sort((a, b) => a.name.localeCompare(b.name)).map(p => {
    const at = unitsAtPlace(r, p.id, iso).sort((a, b) => byNum(numOf(a), numOf(b)))
    return { id: p.id, name: p.name, tz: p.tz, at, sub: [...at.map(numOf), tzLabel(p.tz, iso)].join(' · ') }
  })
}

/* every time zone the browser knows, by its city's name; `keep` — a zone already in use, kept on the list even where
   this browser's list leaves it out (an old alias such as "Asia/Calcutta") */
export interface TzChoice { tz: string; label: string }
let ZONES: string[] | null = null
const zones = (): string[] => {
  if (!ZONES) {
    const sv = (Intl as unknown as { supportedValuesOf?: (k: string) => string[] }).supportedValuesOf
    let all: string[] = []
    try { all = sv ? sv('timeZone') : [] } catch { all = [] }
    ZONES = all.filter(z => z.includes('/') && validTz(z))
  }
  return ZONES
}
export function tzChoices(iso: string, keep: readonly string[] = []): TzChoice[] {
  const set = new Set(zones())
  for (const z of keep) if (validTz(z)) set.add(z)
  return [...set].map(tz => ({ tz, label: tzLabel(tz, iso) })).sort((a, b) => a.label.localeCompare(b.label) || a.tz.localeCompare(b.tz))
}

export interface AdminChoice { id: string; label: string }
export function firstAdminChoices(iso: string): AdminChoice[] {
  const out: (AdminChoice & { n: string; cs: string })[] = []
  for (const a of ACCOUNTS_LIST) {
    /* (the door's own check decides it: an admin today, not a master admin, not moving tomorrow) */
    if (a.on === false || firstAdminProblem(a.id)) continue
    const p = (PEOPLE as any)[a.pid]
    if (!p || p.deleted || p.archived) continue
    const home = homeOn(String(a.pid), iso)
    const n = home ? numOf(home) : ''
    const cs = String(p.cs)
    out.push({ id: a.id, label: n ? `${cs} · ${n}` : cs, n, cs })
  }
  return out.sort((x, y) => byNum(x.n, y.n) || x.cs.localeCompare(y.cs)).map(({ id, label }) => ({ id, label }))
}

/* D2306: "… gets Plan of 150, full access to it, so 150 starts with an admin."; before an admin is picked, b1-9's "The
   first admin"; a new place made with it says so first (b1-10) */
export function newSqnNote(num: string, adminCs: string | null, newPlaceName: string | null): string {
  const n = num.trim() || NUM_EXAMPLE
  const who = adminCs || 'The first admin'
  const gets = `${who} gets Plan of ${n}, full access to it, so ${n} starts with an admin.`
  if (newPlaceName == null) return gets
  const name = newPlaceName.trim()
  return `Saved together: ${n} and its new place${name ? `, ${name}` : ''}. ${gets}`
}
