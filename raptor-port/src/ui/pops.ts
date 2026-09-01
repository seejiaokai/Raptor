/* Which pop-ups are open — module state so the delegated click routing can
   open them; the components read it and re-render via the store version. */
export let DAYPOP: number | null = null
export function setDayPop(di: number | null) { DAYPOP = di }
export let INSIGHTS = false
export function setInsights(on: boolean) { INSIGHTS = on }
/* the airspace/traffic popup: which wave it is looking at, as 'di|gi' */
export let AIRKEY: string | null = null
export function setAirKey(k: string | null) { AIRKEY = k }
/* the Manage-users modal flag lived here until 23 Aug 26 — Manage users is a
   section of the Admin PAGE now (ui/AdminPage.tsx), so there is no popup
   state to hold: the page unmounts with the session like every other page. */
/* the Duty-templates editor (owner, 13 Aug 26) — opened from the "+ Block"
   picker's pencil. A plain on/off flag; the component keeps its own selected
   template locally, because that is ephemeral view state, not schedule state. */
export let TPLEDIT = false
export function setTplEdit(on: boolean) { TPLEDIT = on }
/* the Flying-waves sheet (owner, 25 Aug 26; unified 30 Aug 26) — opened from the
   "+ Wave" picker's single gear (and the Admin config button). One sheet that both
   edits the wave templates and shows / hides / deletes what appears in the picker,
   so the old separate ⚙ Manage sheet (WAVEMANAGE, retired 30 Aug 26) is folded in.
   Same shape as TPLEDIT: a plain on/off flag, the component keeps its own selected
   template locally. */
export let WAVEEDIT = false
export function setWaveEdit(on: boolean) { WAVEEDIT = on }
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
/* The "Set default order?" snackbar (owner, 29 Aug 26 pt.3 — the in-place drag
   that replaced the Arrange sheet). After an admin drags a section into a new
   place, an actionable snackbar offers to make that day's order the squadron's
   house default (engine/order.ts SEC_DEFAULT) so every un-arranged day follows
   it henceforth. Holds the DAY INDEX that was just re-ordered — accept reads that
   day's current secOrder as the new default. null = no offer showing.
   DEFINED IN state/view.ts and re-exported here (31 Aug 26 bug pass): it is
   keyed by day index, so it must be cleared when the week/session/page changes
   or it would apply to the wrong day — those reset paths live in state and
   cannot reach into ui/pops, so the flag moved to view.ts where they sweep it. */
export { SECDEFOFFER, setSecDefOffer } from '../state/view'
/* The one personal input being edited from the week or the board (owner,
   10 Aug 26). The INPUT OBJECT, never its index or its content key: undo is
   still live under the modal and renumbers INPUTS, and the key is built from
   the very fields the dialog exists to change. */
export let INPEDIT: any = null
export function setInpEdit(r: any) { INPEDIT = r }
/* The OIL-ask hand-off (owner, 28 Aug 26 — the bell's "review your weekend/PH
   input" tap): the IID of the input whose OIL question should open as soon as
   the editor mounts on that row. The iid, never the row object — the tap may
   land after an undo reminted every row, and InputEditor re-resolves through
   inpById at open. One-shot: the editor clears it as it consumes it. */
export let OILASK: string | null = null
export function setOilAsk(iid: string | null) { OILASK = iid }
/* The supporting-document viewer (owner, 27 Aug 26) — every user may view
   every input's document, so this carries only WHICH input's paperwork is on
   screen: the INPUT OBJECT, for the same reason INPEDIT holds the object —
   undo renumbers INPUTS under an open modal. */
export let DOCVIEW: any = null
export function setDocView(r: any) { DOCVIEW = r }
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
