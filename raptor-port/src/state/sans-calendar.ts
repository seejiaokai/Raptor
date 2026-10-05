/** SANS planning demand, separate from operational availability (D570–D572/D580).
 * Read the settings record on each call: Undo/reload cannot leave a stale cache. */
import { store, HOOKS } from '../engine/hooks'
import { cmdDeferEffect, type CommitResult } from '../command'
import { commitSettingsIntent } from './people-settings-commit'

export type FlyingPeriod = 'unset' | 'day' | 'night' | 'both'
export interface SansDay { required: number | null; flying: FlyingPeriod }
export interface SansCutoffs { amberFrom: number; redFrom: number }
export interface SansSaveResult { ok: boolean; message?: string; pending?: Promise<SansSaveResult> }
export const SANS_DEFAULT_CUTOFFS: Readonly<SansCutoffs> = Object.freeze({ amberFrom: 1, redFrom: 3 })
const PERIODS = ['unset', 'day', 'night', 'both']
const integer = (v: unknown): v is number => typeof v === 'number' && Number.isSafeInteger(v)
const object = (v: unknown): v is Record<string, unknown> => !!v && typeof v === 'object' && !Array.isArray(v)
export function validSansDate(iso: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return false
  const d = new Date(iso + 'T12:00:00Z')
  return Number.isFinite(d.getTime()) && d.toISOString().slice(0, 10) === iso
}
function validDay(v: unknown): v is SansDay {
  return object(v) && Object.keys(v).every(k => k === 'required' || k === 'flying') &&
    (v.required === null || (integer(v.required) && v.required >= 0)) && PERIODS.includes(v.flying as string)
}
function validCutoffs(v: unknown): v is SansCutoffs {
  return object(v) && Object.keys(v).every(k => k === 'amberFrom' || k === 'redFrom') &&
    integer(v.amberFrom) && integer(v.redFrom) && v.amberFrom >= 1 && v.redFrom > v.amberFrom
}
export function getSansDay(iso: string): SansDay {
  const v: unknown = store.get('sansday:' + iso, null)
  return validSansDate(iso) && validDay(v) ? { required: v.required, flying: v.flying } : { required: null, flying: 'unset' }
}
export function getSansCutoffs(): SansCutoffs {
  const v: unknown = store.get('sanscalendar', null)
  return validCutoffs(v) ? { ...v } : { ...SANS_DEFAULT_CUTOFFS }
}
export function sansShortage(offered: number, required: number | null, cutoffs = getSansCutoffs()) {
  const needed = required == null ? 0 : Math.max(0, required - offered)
  const state = required == null ? 'unset' : required === 0 ? 'zero' : needed === 0 ? 'enough' : 'short'
  const tone = state !== 'short' ? 'none' : needed >= cutoffs.redFrom ? 'red' : needed >= cutoffs.amberFrom ? 'amber' : 'none'
  return { offered, required, needed, state, tone } as const
}
function result(r: CommitResult): SansSaveResult {
  if ('queued' in r) return { ok: false, pending: r.done.then(result) }
  return { ok: r.ok, ...(!r.ok ? { message: r.message || 'This change could not be saved.' } : {}) }
}
function save(type: string, key: string, value: unknown, meta: unknown): SansSaveResult {
  return result(commitSettingsIntent(type, meta, () => {
    store.set(key, value)
    // The legacy preference writer catches backend errors. Never report a saved
    // target unless its exact record can be read back; throw inside the command
    // so the existing capture/rollback and buffered persistence own the failure.
    if (JSON.stringify(store.get(key, null)) !== JSON.stringify(value)) throw new Error('The calendar setting could not be saved. Try again.')
    cmdDeferEffect(HOOKS.renderInputs)
  }))
}
export function saveSansDay(iso: string, value: SansDay): SansSaveResult {
  if (!validSansDate(iso)) return { ok: false, message: 'Choose a valid calendar date.' }
  if (!validDay(value)) return { ok: false, message: 'Required SANS must be a whole number of zero or more. Choose a flying period.' }
  const row = value.required === null && value.flying === 'unset' ? null : { required: value.required, flying: value.flying }
  return save('sans.day.set', 'sansday:' + iso, row, { date: iso })
}
export function saveSansCutoffs(value: SansCutoffs): SansSaveResult {
  if (!validCutoffs(value)) return { ok: false, message: 'Amber must start at 1 or more; red must start above amber. Use whole numbers.' }
  return save('settings.sanscalendar', 'sanscalendar', { amberFrom: value.amberFrom, redFrom: value.redFrom }, null)
}
