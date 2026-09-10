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

/* THE STORE'S IDS WIN ON IMPORT (bug-check, 10 Sep 26). Two browsers that
   converted the same names minted DIFFERENT ids for the same people (the id
   is random by design), so a laptop's export brought into the phone landed
   each student a second time under the file's id: one chart under the file's
   id, another under the store's, the same name twice on one course — the very
   ambiguity + Add refuses, and a split that leaves a person's pace and lull
   periods under one id and their marks under the other. And an OLDER,
   name-keyed backup minted fresh ids for everyone on the way in, orphaning
   every id-keyed record the store already held for them. So before a block
   is written, every entry it carries is matched to the enrolment the course
   already has — by person id first (a callsign can be renamed on either
   side), then by name — the same rule findEnrolment applies at + Add, and the
   file's id is rewritten to the store's throughout: the roster, the marks and
   dates keyed under it, the lulls and pace. The file's NAME is kept on the
   entries it writes (a rename made where the file came from is the label
   being brought in; core.js carries it to the charts the file does not
   touch), and a person id the store knows but the file does not rides onto
   the entry so a link survives the round trip. Two entries that name two
   different people under one callsign — both carry a person id, and they
   differ — are NOT merged, the same conflict + Add hands the user; and a
   store id the file already carries is that entry's own, so nobody else is
   mapped onto it. `existing` is every entry on every roster of the course. */
export function reconcileIds(block, existing) {
  const byPid = Object.create(null), byName = Object.create(null), storeOf = Object.create(null);
  for (const e of (existing || [])) {
    if (!isEntry(e)) continue;
    if (!has(storeOf, e.id)) storeOf[e.id] = e;
    if (e.pid && !has(byPid, e.pid)) byPid[e.pid] = e;
    if (!has(byName, e.name)) byName[e.name] = e;
  }
  const src = block || {}, syls = src.bySyllabus || {};
  const map = Object.create(null);   // file id → store id
  const taken = new Set();           // ids no other file entry may be mapped onto
  for (const syl of Object.keys(syls)) for (const e of ((syls[syl] || {}).roster || [])) if (isEntry(e)) taken.add(e.id);
  for (const syl of Object.keys(syls)) for (const e of ((syls[syl] || {}).roster || [])) {
    if (!isEntry(e) || has(map, e.id)) continue;
    let t = null;
    if (e.pid && has(byPid, e.pid)) t = byPid[e.pid];
    else if (has(byName, e.name) && !(e.pid && byName[e.name].pid && byName[e.name].pid !== e.pid)) t = byName[e.name];
    if (!t || t.id === e.id || taken.has(t.id)) continue;
    map[e.id] = t.id; taken.add(t.id);
  }
  const re = id => has(map, id) ? map[id] : id;
  const rekey = m => { const o = Object.create(null); for (const k of Object.keys(m || {})) o[re(k)] = m[k]; return o; };
  const bySyllabus = Object.create(null);
  for (const syl of Object.keys(syls)) {
    const sv = syls[syl] || {};
    const roster = (sv.roster || []).map(e => {
      if (!isEntry(e)) return e;
      const out = { ...e, id: re(e.id) };
      const s = storeOf[out.id]; if (s && s.pid && !out.pid) out.pid = s.pid;
      return out;
    });
    bySyllabus[syl] = { ...sv, roster, marks: rekey(sv.marks), dates: rekey(sv.dates) };
  }
  const out = { ...src, bySyllabus, lulls: rekey(src.lulls), pace: rekey(src.pace) };
  return { block: JSON.parse(JSON.stringify(out)), remapped: Object.assign({}, map) };
}
