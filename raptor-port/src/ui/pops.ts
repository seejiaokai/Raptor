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
   undo renumbers INPUTS under an open modal.
   Single-row shape `{ row, up }` (the puck-tap and pending-card callers). The
   Medical page ADDS an optional `{ rows, idx }` when a person's overlapping
   medical documents form one episode (owner, 1 Sep 26): `rows` is a list of
   `{ row, up }` oldest-first and `idx` the one tapped, so the viewer opens
   there and pages the rest. The `row`/`up` fields stay set to the tapped
   entry, so a caller that ignores `rows` (and DocViewer's own single-row
   fallback) is unchanged. */
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

/* ---- [ALL-AVAIL-WINDOW] — the counter's window (owner, D38–D41) -----------
   A THIRD KIND OF TRANSIENT SURFACE, and the app's first. Not a Sheet (scrim,
   Escape, blocks everything) and not an inline popup (dismisses on an outside
   click — the 4 Sep 26 standing rule). It stays open while the scheduler
   SCROLLS AND EDITS the schedule behind it, and it is movable and resizable.
   Its contract is in docs/ui-contracts.md, which states in writing that the
   outside-click rule does NOT apply to it — or a later session will "fix" it.

   `ver` is the version the counter chip was drawn in (Codex OSE-R2-05). Empty
   means the chip came from the working copy. It is carried rather than re-read
   because the snapshot is installed only while the page is built: reading the
   live day when the window opens would list whoever is free NOW under a number
   frozen when the day went out, which is the one thing D44 forbids. */
export type AvailWin = {
  di: number
  item: string
  ver: string
  /* the chip was drawn on the view page's ISSUED FACE, which wears its
     OFFICIAL flags — so the window replays that world, not a bare preview's
     (Fable S3; html.ts withChipWorld). Absent = not the issued face. */
  ofw?: boolean
  /* the event's own words for the title bar, captured at open: the window
     outlives the row that opened it (he can edit the schedule behind it), and
     re-deriving the name from a row he has since renamed would retitle the
     window under him. */
  name: string
  when: string
  /* 'who' = who is available, always offered. 'oil' = who earns, which EXISTS
     ONLY while OIL Earn is on (the mode rule, confirmed 22 Sep 26). */
  tab: 'who' | 'oil'
}
export let AVAILWIN: AvailWin | null = null
/* EVERY OPEN AND EVERY CLOSE GOES THROUGH HERE, so this is where a window
   starts clean: its footer sentence and its position are reset with it. Both
   used to outlive the window (Fable S11): the footer lived in the component,
   which is never unmounted, and the position was reset by each caller that
   remembered to. Open A, tap a man, close, open B — and B's footer still spoke
   about a man who is not behind B. Found for real on 23 Sep 26, when this
   file's own tests leaked one window's sentence into the next. */
export function setAvailWin(v: AvailWin | null) { AVAILWIN = v; AVAILWIN_FOOT = ''; AVAILWIN_BOX = null }
/* a tab change is a new list, so it starts with the tab's own hint */
export function setAvailTab(t: 'who' | 'oil') { if (AVAILWIN) AVAILWIN = { ...AVAILWIN, tab: t }; AVAILWIN_FOOT = '' }
/* THE SENTENCE UNDER THE LIST after a tap — "X — why", or what a switch did.
   Empty = the tab's own hint. Kept beside the window it belongs to, never in
   the component, for the reason above. */
export let AVAILWIN_FOOT = ''
export function setAvailFoot(s: string) { AVAILWIN_FOOT = s }

/* WHERE THE WINDOW SITS, kept OUTSIDE React on purpose. He edits the schedule
   behind it, so every keystroke notifies and re-renders; position held in
   component state would be thrown away on the first one. A drag writes the
   element's style directly at pointer speed and commits here on release, so
   dragging never re-renders the app either. null = where the STYLESHEET puts
   it (Fable S8): the corner on a desktop, the full-width bottom panel on a
   phone. D40's numbers — it OPENS SKINNY at 212px (two 74px pucks, their gap
   and ~16px of slack per column) with 186 as the floor, below which a puck
   clips — live in scheduler.css `.availwin`, and ONLY there: they used to be
   pinned inline from here as well, and an inline size beats the phone rule. */
export let AVAILWIN_BOX: { x: number, y: number, w: number, h: number } | null = null
export function setAvailWinBox(b: { x: number, y: number, w: number, h: number } | null) { AVAILWIN_BOX = b }
