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
/* WHO, as a person id (28 Sep 26 — D376, "own place"): the course and student a
   person reopens the Tracker on are remembered per PERSON, so the next person on a
   shared browser never lands on someone else's pick. The id, not the name — a
   callsign rename keeps his place. '' when nobody is signed in or nothing is wired
   (the standalone Tracker keeps the browser's one place, as it always did). */
let whoId = () => ''
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
/* WHO HAS BEEN DELETED (owner D981, 17 Oct 26 — what D299's "his place on any course still running — goes" means for
   the Tracker). A man deleted through Post out is kept underneath as a hidden "deleted" mark (D290), so Raptor knows
   his id; the list above leaves him out like anyone archived, which cannot tell the two apart. So his id crosses here
   too, on the same bridge and with the same guard: the Tracker takes him off every course still running for him
   (core.js leaveRunningCourses). Empty in the standalone Tracker. */
let gone = []
let goneSig = ''
const goneSubs = new Set()
export function setGonePeople(ids) {
  const l = Array.isArray(ids) ? ids.map(String).sort() : []
  const s = l.join(','); if (s === goneSig) return
  gone = l; goneSig = s
  goneSubs.forEach(f => { try { f(gone) } catch (_) {} })
}
export function getGonePeople() { return gone }
export function onGonePeople(f) { goneSubs.add(f); return () => goneSubs.delete(f) }
/* EACH MAN'S MEDICAL DAYS (owner D1002, D1003, D1018 — 18 Oct 26: the Tracker's "No. of Down Days" is worked out from the
   Inputs, every medical day he was down — HL, OML, ATT C, ATT B). A third channel on the same bridge, with the same
   guard — a rider on the people seam, not a fourth crossing: Raptor works each downchit out on ITS side into plain ISO
   days (peoplewire.ts medForTracker — the row's own year resolved there), keyed by person id, so the Tracker never
   reads Raptor's store or its date labels. One row: { iid, type, startIso, endIso, half: 'am'|'pm'|'', firstEnd?,
   cutOn? } — `firstEnd` and `cutOn` only where an upchit cut the input and it keeps the end it was filed with (D999).
   Empty in the standalone Tracker, where every student reads "—". */
let med = {}
let medSig = ''
const medSubs = new Set()
const medRowSig = r => [r.iid, r.type, r.startIso, r.endIso, r.half || '', r.firstEnd || '', r.cutOn || ''].join('\u001f')
const medSigOf = m => Object.keys(m).sort().map(k => k + '\u001d' + (Array.isArray(m[k]) ? m[k] : []).map(medRowSig).join('\u001e')).join('\u001c')
export function setMedInputs(next) {
  const m = next && typeof next === 'object' && !Array.isArray(next) ? next : {}
  const s = medSigOf(m); if (s === medSig) return
  med = m; medSig = s
  medSubs.forEach(f => { try { f(med) } catch (_) {} })
}
export function getMedInputs() { return med }
export function onMedInputs(f) { medSubs.add(f); return () => medSubs.delete(f) }
export function setWhoami(fn) { who = typeof fn === 'function' ? fn : () => '' }
export function whoami() { try { const v = who(); return v == null ? '' : String(v) } catch (_) { return '' } }
export function setWhoamiId(fn) { whoId = typeof fn === 'function' ? fn : () => '' }
export function whoamiId() { try { const v = whoId(); return v == null ? '' : String(v) } catch (_) { return '' } }
