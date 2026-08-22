/* Which pop-ups are open — module state so the delegated click routing can
   open them; the components read it and re-render via the store version. */
export let DAYPOP: number | null = null
export function setDayPop(di: number | null) { DAYPOP = di }
export let INSIGHTS = false
export function setInsights(on: boolean) { INSIGHTS = on }
/* the airspace/traffic popup: which wave it is looking at, as 'di|gi' */
export let AIRKEY: string | null = null
export function setAirKey(k: string | null) { AIRKEY = k }
/* the Manage-users modal */
export let USERM = false
export function setUserModal(on: boolean) { USERM = on }
/* the Duty-templates editor (owner, 13 Aug 26) — opened from the "+ Block"
   picker's pencil. A plain on/off flag; the component keeps its own selected
   template locally, because that is ephemeral view state, not schedule state. */
export let TPLEDIT = false
export function setTplEdit(on: boolean) { TPLEDIT = on }
/* The Day-templates editor (owner, 15 Aug 26) — opened from the day-templates
   picker's pencil, on either entry point (the board or the edit week's
   sign-off strip), or straight after "Save this day as a template" so the
   owner can rename what he just captured without a second tap to find it.
   `false` closed, `true` open on whatever the modal already had selected (or
   its first template), a string open PRE-SELECTED on that template's id — the
   filter-is-the-open-state idiom HISTLIST already uses above, so there is no
   second flag tracking "which one to select on open" that could fall out of
   step with this one. */
export let DAYTPLEDIT: false | true | string = false
export function setDayTplEdit(v: false | true | string) { DAYTPLEDIT = v }
/* The Drafts manage modal (owner, 15 Aug 26) — opened from the drafts menu's
   pencils, on either surface. Unlike DAYTPLEDIT it must carry the DAY: drafts
   are per-day, so the modal is scoped to the day whose menu opened it. `id`
   optionally pre-selects one draft (a row's own pencil), the same open-
   pre-selected idiom DAYTPLEDIT's string form carries. */
export let DRAFTSEDIT: null | { di: number, id?: string } = null
export function setDraftsEdit(v: null | { di: number, id?: string }) { DRAFTSEDIT = v }
/* The one personal input being edited from the week or the board (owner,
   10 Aug 26). The INPUT OBJECT, never its index or its content key: undo is
   still live under the modal and renumbers INPUTS, and the key is built from
   the very fields the dialog exists to change. */
export let INPEDIT: any = null
export function setInpEdit(r: any) { INPEDIT = r }
/* the mobile drawer */
export let DRAWER = false
export function setDrawer(on: boolean) { DRAWER = on }
/* The week-jump calendar (owner, Aug 26) — a month grid that loads any week by
   tapping a date, snapping to that date's Monday-week. `false` closed; 'view'
   opened from the schedule seg / mobile icon; 'board' opened from the scheduler
   board's top-left icon, where the pick also opens the tapped day. The calendar
   itself is store-free chrome; this is just which surface asked for it. */
export let WEEKCAL: false | 'view' | 'board' = false
export function setWeekCal(v: false | 'view' | 'board') { WEEKCAL = v }
/* The listed view of the edit log (owner, 11 Aug 26). `false` closed; open it
   with `'all'` for the whole week or a day index to narrow it to one day —
   the filter IS the open state, so there is no second flag to keep in step
   with it, and closing forgets the filter (a list you reopen should show
   everything, not a narrowing you set ten minutes ago). */
export let HISTLIST: false | 'all' | number = false
export function setHistList(v: false | 'all' | number) { HISTLIST = v }
/* GROUPED BY DETAIL, or the flat timeline (owner, 11 Aug 26). Off by default —
   "whats the latest changes based on time by default" — and it is a view of the
   same rows, not a filter, so it sits beside the day filter rather than in it.
   Kept here with HISTLIST because it is list state, not schedule state, and
   because closing the list resets both: a view you set ten minutes ago should
   not be waiting for you when you reopen. */
export let HISTGROUP = false
export function setHistGroup(on: boolean) { HISTGROUP = !!on }
/* which groups are unfolded, by the key they group on. A Set mutated in place,
   like DWOPEN and HLSET — the store notifies, the builder re-reads. */
export const HISTOPEN = new Set<string>()
export function toggleHistOpen(k: string) { HISTOPEN.has(k) ? HISTOPEN.delete(k) : HISTOPEN.add(k) }
/* Every route out of the list forgets all of its view state. Keeping this in
   one helper matters because a row jump is also a close: resetting only the
   modal flag there made Grouped silently come back the next time the list was
   opened, even though the close button correctly returned to By time. */
export function closeHistList() {
  HISTLIST = false
  HISTGROUP = false
  HISTOPEN.clear()
}
