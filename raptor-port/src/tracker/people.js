/* THE PEOPLE BRIDGE — Raptor's roster, handed to the Tracker without either
   app importing the other (9 Sep 26, the person → Tracker link; the same shape
   as role.js and for the same reason). Raptor's PEOPLE id is THE person id
   app-wide; the Tracker's + Add dialog offers this list and records the pick
   as a link beside the student's name (core.js LINKS). Raptor pushes a
   projection here on every notify (peoplewire.ts, wired by TrackerPage.tsx);
   core.js reads it when a dialog opens and subscribes to repaint the roster
   chips. Importing core.js from Raptor's side would put ~280 KB of syllabus
   data into every Raptor visit, and importing the engine from core.js would
   stop the Tracker being a lazy chunk — so the list crosses through these few
   lines with no imports at all.

   THE SIGNATURE GUARD: Raptor notifies on every keystroke of a schedule edit,
   and the projection is rebuilt each time. An unchanged list is a no-op here —
   same array kept, nobody told — so the Tracker's side panel never repaints
   for a change that was not about people (the guard Leave War's
   reprojectRoster applies at its own end of the same idea).

   whoami is the editor's display name for the `by` stamp on marks and dates.
   It is a function, not a value, because the session can change under an
   open tab (logout, view-as); it never throws and answers '' when nobody has
   wired it — the standalone app, or a mark made before Raptor's wire ran —
   and core.js omits the field rather than writing an empty name. */
let list = []            /* [{ id, cs, seat: 'FCP'|'RCP', q, sxo }] */
let sig = ''
let who = () => ''
const subs = new Set()

/* one string per person, every field the Tracker shows or files, in order —
   so a re-ordered or re-callsigned roster counts as a change and a fresh copy
   of the same roster does not */
const sigOf = l => l.map(p => [p.id, p.cs, p.seat, p.q || '', p.sxo ? 1 : 0].join('\u001f')).join('\u001e')

export function setPeople(next) {
  const l = Array.isArray(next) ? next : []
  const s = sigOf(l); if (s === sig) return
  list = l; sig = s
  subs.forEach(f => { try { f(list) } catch (_) {} })
}
export function getPeople() { return list }
export function onPeople(f) { subs.add(f); return () => subs.delete(f) }
export function setWhoami(fn) { who = typeof fn === 'function' ? fn : () => '' }
export function whoami() { try { const v = who(); return v == null ? '' : String(v) } catch (_) { return '' } }
