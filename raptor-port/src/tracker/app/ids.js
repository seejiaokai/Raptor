// src/tracker/app/ids.js
/* ENROLMENT IDS (10 Sep 26, the stable-ids round). A student used to BE
   their typed name: the roster was a string array and the name was a segment
   of every storage key. Now a roster entry is { id, name, pid? } — an opaque
   id minted when the student is added, the name a label, the person id from
   Raptor's roster when they were picked off it — and every per-student record
   files under the id. This module is the ONE converter from the old shape to
   the new, pure (no storage, no core.js), so the once-per-course migration at
   load and the import of an older file cannot drift apart.
   Random rather than a counter so two browsers never mint the same id. */
export function mintId() { return 's' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8); }
export const isEntry = e => !!e && typeof e === 'object' && !Array.isArray(e) && typeof e.id === 'string' && !!e.id && typeof e.name === 'string';

/* One course's block in the file shape — { plan, bySyllabus: { syl: { roster,
   marks, dates } }, lulls, pace } — name-keyed in, id-keyed out. The same name
   on two syllabi is one student (pace and lulls are per course), so one map
   of name → id spans the block; an entry already an object keeps its id and
   lends it to the same name elsewhere. `links` is the course's old
   { name: personId } map, folded into `pid`. Returns the new block and the
   name → id map (the caller moves the course-level keys the block does not
   carry: last-edit, lastStudent, the per-browser lastCrew pref). */
/* Own-property lookups only: a mark keyed "constructor" in a hand-edited file
   must read as a mark, never as Object.prototype's (review finding 5). */
const has = (o, k) => Object.prototype.hasOwnProperty.call(o, k);
const conflict = msg => { throw new Error('The people in that file are inconsistent: ' + msg + ', so it has not been opened.'); };
export function upgradeCourseBlock(block, links) {
  const ids = Object.create(null);          // name → id, one per course
  const nameOfId = Object.create(null);     // id → name, to catch one id under two names
  const src = block || {};
  const syls = src.bySyllabus || {};
  /* fileFormat.js refuses a bad file before anything is written; this module
     is the belt for a block that did NOT come through it — an import path, a
     hand-edited store. Pass 1 walks every syllabus's roster once, refusing a
     roster that is not a list, an empty name, and the three id/name
     conflicts, before anything below mints an id or writes a key. */
  for (const syl of Object.keys(syls)) {
    const sv = syls[syl] || {};
    if (sv.roster != null && !Array.isArray(sv.roster)) conflict('the crew list for “' + syl + '” is not a list');
    const seenId = new Set(), seenNm = new Set();
    for (const e of (sv.roster || [])) {
      const nm = isEntry(e) ? e.name : (typeof e === 'string' ? e : null); if (nm == null) continue;
      if (nm === '') conflict('an empty name on “' + syl + '”');
      if (seenNm.has(nm)) conflict('“' + nm + '” twice on “' + syl + '”'); seenNm.add(nm);
      if (!isEntry(e)) continue;
      if (seenId.has(e.id)) conflict('id ' + e.id + ' twice on “' + syl + '”'); seenId.add(e.id);
      if (has(nameOfId, e.id) && nameOfId[e.id] !== nm) conflict('id ' + e.id + ' carries two names');
      nameOfId[e.id] = nm; if (!has(ids, nm)) ids[nm] = e.id;
    }
  }
  const idFor = name => has(ids, name) ? ids[name] : (ids[name] = mintId());
  /* re-key a map by the names that were legacy on THIS syllabus (or, for the
     course-level maps, on any syllabus); a key that is already an id — or a
     name nobody on a legacy roster carries — is left exactly as it is.
     Object.create(null): a genuine own key named "__proto__" (JSON.parse
     makes one a literal data property, not an accessor call) must land as
     data here too — assigning it into a plain {} would hit the inherited
     setter and silently reassign the prototype instead of writing the key.
     The final JSON round-trip below re-clones everything back to ordinary
     objects, so the null prototype never leaks out to the caller. */
  const rekey = (m, legacyNames) => { const o = Object.create(null); for (const k of Object.keys(m || {})) o[legacyNames.has(k) && has(ids, k) ? ids[k] : k] = m[k]; return o; };
  const legacyAll = new Set();
  const bySyllabus = Object.create(null); // same reasoning: a syllabus literally named "__proto__"
  for (const syl of Object.keys(syls)) {
    const sv = syls[syl] || {};
    const roster = [], legacyHere = new Set();
    for (const e of (sv.roster || [])) {
      if (isEntry(e)) { roster.push({ ...e }); continue; }
      if (typeof e !== 'string' || !e) continue;
      const entry = { id: idFor(e), name: e }; legacyHere.add(e); legacyAll.add(e);
      const pid = links && has(links, e) ? links[e] : null;
      if (typeof pid === 'string' && pid) entry.pid = pid;
      roster.push(entry);
    }
    bySyllabus[syl] = { ...sv, roster, marks: rekey(sv.marks, legacyHere), dates: rekey(sv.dates, legacyHere) };
  }
  const out = { ...src, bySyllabus, lulls: rekey(src.lulls, legacyAll), pace: rekey(src.pace, legacyAll) };
  return { block: JSON.parse(JSON.stringify(out)), ids: Object.assign({}, ids) };
}
