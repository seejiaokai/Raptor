/* THE TRACKER'S ROLE FLAG, on its own so Raptor can set it without loading
   the Tracker (7 Sep 26). Raptor's resetSession/toggleRole write the flag at
   every login, logout and view-as flip — long before (and whether or not) the
   Tracker tab is ever opened. Importing core.js for that would drag the whole
   chart engine and its syllabus data (~280 KB) into Raptor's first download,
   which is exactly what the tab's lazy chunk exists to avoid. So the flag
   lives here, a few lines with no imports; core.js subscribes and mirrors it
   into its own `readOnly` export when it eventually loads. */
let ro = false
const subs = new Set()
export function isReadOnly() { return ro }
export function setReadOnly(v) {
  const next = !!v; if (next === ro) return
  ro = next
  subs.forEach(f => { try { f(ro) } catch (_) {} })
}
export function onReadOnly(f) { subs.add(f); return () => subs.delete(f) }
