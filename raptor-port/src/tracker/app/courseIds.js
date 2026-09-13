// src/tracker/app/courseIds.js
/* COURSE IDS (13 Sep 26, ARCH-STACK step 1B-i). A course used to BE its typed
   name: COURSES was a string[] and the name was the 2nd segment of every
   per-course storage key ('v3:' + course + ':...'). Now a course is a
   { id, name } entry — an opaque id minted when the course is created, the name
   a label — and every per-course record files under the id, so renaming a
   course is a label change that moves nothing.

   This module is the ONE pure converter (no storage, no core.js), shared by the
   once-per-browser migration (core.js migrateCourseIds) and by file import
   (core.js applyStudents), so the two paths cannot drift. It mirrors app/ids.js,
   which did the same for enrolment (student) ids.

   Random rather than a counter so two browsers never mint the same id. */
export function mintCourseId() { return 'c' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8); }

/* A course id is a storage-key SEGMENT at the top level ('v3:' + id + ':...'),
   so it must carry no separator and must not collide with a global namespace.
   The mint shape is 'c' + base36; enforce exactly that at every boundary that
   accepts an id from OUTSIDE (a v2 import keeps the file's ids; a hand-edited
   store), because a nonempty-string check alone would let 'master:lay' through
   and clobber v3:master:lay:* (review CSID-07). */
export const COURSE_ID_RE = /^c[0-9a-z]+$/;
export const isCourseId = v => typeof v === 'string' && COURSE_ID_RE.test(v);
export const isCourseEntry = e => !!e && typeof e === 'object' && !Array.isArray(e) && typeof e.id === 'string' && !!e.id && typeof e.name === 'string';

/* The top-level names the Tracker files its own records/globals under. A course
   may not be named one of these (case-insensitively), at add, rename, import
   and the migration preflight — otherwise the prefix-move migration and the key
   builders would collide with app data (review CSID-08, CSID-R2-01, CSID-R3-01).
   'courses'/'links'/'master'/'lay' are v3:courses / v3:links / v3:master:* /
   v3:lay:* ; 'syllabus edit' is the retired global syllabus-source "course"
   (v3:SYLLABUS EDIT:*, still read as a legacy adoption source by
   kSylsOldMaster / kLayoutOldMaster). One list, so the four boundaries and the
   migration skiplist cannot drift. */
export const RESERVED_COURSE_NAMES = ['courses', 'links', 'master', 'lay', 'syllabus edit'];
export const isReservedCourseName = n => typeof n === 'string' && RESERVED_COURSE_NAMES.indexOf(n.trim().toLowerCase()) >= 0;

const has = (o, k) => Object.prototype.hasOwnProperty.call(o, k);

/* THE FILE'S COURSE LAYER, name-keyed in → id-keyed out (mirror of
   upgradeCourseBlock at the course level). A v1 file carries `courses` as a
   string[] and `byCourse` keyed by course NAME, with a separate legacy `links`
   block also keyed by course name; a v2 file already carries `{id,name}`
   entries and id-keyed byCourse/links. This turns either into the v2 shape:
   every course is an entry, byCourse and links are keyed by the id.

   An entry already carrying an id lends it; a bare-string course mints one; the
   same name appearing twice (a corrupt file) is refused — fileFormat.js checks
   that before this runs, but this is the belt for a block that did not come
   through it (a hand-edited store row). Returns the new students block, the
   translated links (or null), and the name/oldId → id map. Does not mutate its
   input. */
const conflict = msg => { throw new Error('The courses in that file are inconsistent: ' + msg + ', so it has not been opened.'); };
export function upgradeCourses(students, links) {
  const src = students || {};
  const listIn = Array.isArray(src.courses) ? src.courses : [];
  const byCourseIn = (src.byCourse && typeof src.byCourse === 'object') ? src.byCourse : {};
  /* key (name for a v1 course, id for a v2 entry) → { id, name } */
  const map = Object.create(null);      // the byCourse/links key as it appears in the file → course id
  const entries = [];
  const seenName = new Set(), seenId = new Set();
  for (const c of listIn) {
    const name = isCourseEntry(c) ? c.name : (typeof c === 'string' ? c : null);
    if (name == null || name === '') conflict('a course with no name');
    if (seenName.has(name)) conflict('“' + name + '” listed twice');
    seenName.add(name);
    const id = isCourseEntry(c) ? c.id : mintCourseId();
    if (seenId.has(id)) conflict('id ' + id + ' listed twice');
    seenId.add(id);
    /* the byCourse/links key for THIS course: a v2 file keys by id, a v1 file by
       name — so the lookup key is the id for an entry, the name for a string */
    const fileKey = isCourseEntry(c) ? c.id : name;
    map[fileKey] = id;
    entries.push({ id, name });
  }
  const byCourse = Object.create(null);   // a course literally keyed "__proto__" must land as data
  for (const k of Object.keys(byCourseIn)) {
    const id = has(map, k) ? map[k] : k;  // a block for a course not in the list keeps its key (fileFormat refuses this shape; belt only)
    byCourse[id] = byCourseIn[k];
  }
  let outLinks = null;
  if (links && typeof links === 'object' && !Array.isArray(links)) {
    outLinks = Object.create(null);
    for (const k of Object.keys(links)) outLinks[has(map, k) ? map[k] : k] = links[k];
  }
  return {
    students: JSON.parse(JSON.stringify({ courses: entries, byCourse })),
    links: outLinks ? JSON.parse(JSON.stringify(outLinks)) : null,
    map: Object.assign({}, map),
  };
}

/* THE STORE'S IDS WIN ON IMPORT (mirror of reconcileIds for enrolments). Two
   browsers that created the same-named course minted DIFFERENT ids for it (the
   id is random by design), so a laptop's export brought into the phone would
   otherwise land the course a SECOND time under the file's id — one course
   under the file's id, another under the store's, the same name twice. And an
   older name-keyed backup minted a fresh id on the way in (upgradeCourses
   above), orphaning every id-keyed record the store already holds for it.

   So before a file's courses are written, each is matched to the course the
   store already has — by ID first (a course whose id the store already knows IS
   that course, keep it), then by NAME (a course the store has under a different
   id) — and the file's id is rewritten to the store's throughout: the course
   entry, the byCourse block and the links block. Precedence and reservation
   mirror reconcileIds exactly (review CSID-06):
   - resolve id-matches FIRST and reserve those store ids;
   - name-fallback only where the store id is not already taken and does not
     contradict an id match;
   - reserve every chosen target across the WHOLE file, so two file courses can
     never map onto one store id;
   - a file course whose NAME matches a store course already claimed by a
     DIFFERENT id is a conflict — collected and handed to the caller, which
     REFUSES the import, the same way the enrolment path does.
   `existing` is the store's COURSES ({id,name} entries). */
export function reconcileCourseIds(students, links, existing) {
  const src = students || {};
  const listIn = Array.isArray(src.courses) ? src.courses.filter(isCourseEntry) : [];
  const byId = Object.create(null), byName = Object.create(null), storeIds = new Set();
  for (const e of (existing || [])) {
    if (!isCourseEntry(e)) continue;
    if (!has(byId, e.id)) byId[e.id] = e;
    if (!has(byName, e.name)) byName[e.name] = e;
    storeIds.add(e.id);
  }
  const remap = Object.create(null);      // file id → store id
  const taken = new Set(listIn.map(e => e.id));   // ids no other file course may map onto
  /* pass 1: id-matches (a file id the store already has is that course) */
  for (const e of listIn) if (storeIds.has(e.id)) taken.add(e.id);
  /* pass 2: name-fallback for the rest */
  for (const e of listIn) {
    if (storeIds.has(e.id)) continue;                 // already the store's own id
    const mate = has(byName, e.name) ? byName[e.name] : null;
    if (!mate || mate.id === e.id || taken.has(mate.id)) continue;
    remap[e.id] = mate.id; taken.add(mate.id);
  }
  /* conflicts: a file course whose NAME matches a store course but resolves to a
     DIFFERENT id than that store course (mirror reconcileIds' seenC scan) */
  const conflicts = [], seenC = new Set();
  for (const e of listIn) {
    if (seenC.has(e.name)) continue;
    const mate = has(byName, e.name) ? byName[e.name] : null;
    const resolved = has(remap, e.id) ? remap[e.id] : e.id;
    if (mate && resolved !== mate.id) { conflicts.push({ name: e.name, fileId: e.id, storeId: mate.id }); seenC.add(e.name); }
  }
  const re = id => has(remap, id) ? remap[id] : id;
  const courses = listIn.map(e => ({ ...e, id: re(e.id) }));
  const byCourse = Object.create(null);
  for (const k of Object.keys(src.byCourse || {})) byCourse[re(k)] = src.byCourse[k];
  let outLinks = null;
  if (links && typeof links === 'object' && !Array.isArray(links)) {
    outLinks = Object.create(null);
    for (const k of Object.keys(links)) outLinks[re(k)] = links[k];
  }
  return {
    students: JSON.parse(JSON.stringify({ courses, byCourse })),
    links: outLinks ? JSON.parse(JSON.stringify(outLinks)) : null,
    remapped: Object.assign({}, remap),
    conflicts,
  };
}
