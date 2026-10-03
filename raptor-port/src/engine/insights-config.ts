import { store, HOOKS } from './hooks'
let tracking = false
let epoch = 0
export const missionTracking = () => tracking
export const missionTrackingEpoch = () => epoch
/** Reset before overlay: absent and malformed data always mean Off. */
export function insightsLoad(): void {
  const value = store.get('insights', null)
  const next = !!value && value.trackBlueRedSorties === true
  if (next !== tracking) epoch++
  tracking = next
}
export function setMissionTracking(on: boolean): void {
  store.set('insights', { trackBlueRedSorties: !!on })
  insightsLoad()
  HOOKS.renderEditWeek()
}
