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
/* The one personal input being edited from the week or the board (owner,
   10 Aug 26). The INPUT OBJECT, never its index or its content key: undo is
   still live under the modal and renumbers INPUTS, and the key is built from
   the very fields the dialog exists to change. */
export let INPEDIT: any = null
export function setInpEdit(r: any) { INPEDIT = r }
/* the mobile drawer */
export let DRAWER = false
export function setDrawer(on: boolean) { DRAWER = on }
/* The listed view of the edit log (owner, 11 Aug 26). `false` closed; open it
   with `'all'` for the whole week or a day index to narrow it to one day —
   the filter IS the open state, so there is no second flag to keep in step
   with it, and closing forgets the filter (a list you reopen should show
   everything, not a narrowing you set ten minutes ago). */
export let HISTLIST: false | 'all' | number = false
export function setHistList(v: false | 'all' | number) { HISTLIST = v }
