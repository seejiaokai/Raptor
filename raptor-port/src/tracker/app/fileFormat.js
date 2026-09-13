/* One JSON file holding the user's syllabus work. Deliberately free of browser
   APIs and of core.js, so it can be imported and checked in plain Node.

   Shapes (fixed here so every caller agrees):
     charts   = { order: string[], syllabi: {name: event[]},
                  layouts: {name: object}, eventInfo: object }
     students = { courses: string[],
                  byCourse: {course: {plan: object, lulls: object, pace: object,
                    bySyllabus: {syl: {
                    roster: string[] | {id, name, pid?}[],
                    marks: {id: object}, dates: {id: object} }}}} }
                (stable ids, 10 Sep 26: a roster is EITHER the legacy string
                list, keyed by name, OR entries {id, name, pid?}, and then
                marks/dates/lulls/pace are keyed by the entry id — never a
                mix on one roster. A later step converts a legacy file's
                names to ids on import; this format only reads both.)

     links    = { course: { studentName: personId } }   (9 Sep 26 — the
                student's link to Raptor's person record; LEGACY ONLY since
                10 Sep 26 — a file this app writes now carries ids on the
                roster instead, so `links` is read for an older file but
                never written)

   Nested objects rather than joined key strings on purpose: course and
   syllabus names are free text and may contain any separator character —
   EXCEPT a colon, since 9 Sep 26 (see noColon below). A student NAME is no
   longer a storage key (stable ids, 10 Sep 26) — it is a label carried on
   the roster entry — so it may contain anything, including a colon; only
   the entry's id is a key, and ids are minted by the app, never typed.

   See docs/superpowers/specs/2026-08-07-syllabus-file-design.md,
   docs/superpowers/specs/2026-09-09-schema-hardening-design.md and
   docs/superpowers/sdd/2026-09-10-stable-ids/ */
import { isCourseId, isCourseEntry, isReservedCourseName } from './courseIds.js'

export const FILE_FORMAT = 'ocu-tracker';
/* v2 (13 Sep 26, course ids 1B-i): `students.courses` may be the legacy string
   list (v1, keyed by course NAME) OR { id, name } entries (v2, keyed by course
   ID), and byCourse/links are keyed to match — never a mix. A later step
   reconciles a file's course ids to the store's on import; this format reads
   both. An older build reading a v2 file refuses it (version > FILE_VERSION). */
export const FILE_VERSION = 2;

export function buildFile({ charts = null, students = null, links = null, savedAt }) {
  const out = {
    format: FILE_FORMAT,
    version: FILE_VERSION,
    savedAt: savedAt || null,
    contains: { charts: !!charts, students: !!students, links: !!links },
  };
  if (charts) out.charts = charts;
  if (students) out.students = students;
  if (links) out.links = links;
  return out;
}

/* Checking the SHAPE, not just the label. The envelope test below says a file
   came from this app; it says nothing about what is inside. A file that says
   ocu-tracker but holds, say, a roster that is not a list gets written to
   storage before anything notices, and from then on the app opens to a blank
   page on every load with no button left to press — recoverable only by
   clearing the browser's data, which is not a thing a user can be asked to do.
   So every block is checked here, before a single key is written.
   Errors name the part that is wrong, because "that file is broken" leaves
   nobody any wiser. */
const isPlainObject = v => !!v && typeof v === 'object' && !Array.isArray(v);

/* A course, syllabus or student name is a SEGMENT of the storage key the app
   files the record under ('v3:' + course + ':' + syllabus + ':m:' + student),
   so a colon inside one makes the key read as a different record: marks filed
   under "A:B" on syllabus "x" are the same key as course "A" on syllabus "B:x".
   The app refuses the character at every typing point (core.js); a file that
   carries one — written elsewhere, or by an older build — is refused here,
   naming the part, before a single key is written. A chart's name is checked
   too: it becomes a syllabus name the moment it is imported. */
function noColon(part, name, where) {
  if (typeof name === 'string' && name.includes(':'))
    throw new Error('The ' + part + ' name “' + name + '”' + (where || '') + ' in that file contains a colon (:), which the app cannot file, so it has not been opened.');
}

function checkCharts(c) {
  if (!isPlainObject(c)) throw new Error('The charts in that file are damaged, so it has not been opened.');
  if (c.order != null && (!Array.isArray(c.order) || c.order.some(n => typeof n !== 'string')))
    throw new Error('The list of chart names in that file is damaged, so it has not been opened.');
  (c.order || []).forEach(n => noColon('chart', n));
  Object.keys(c.syllabi || {}).forEach(n => noColon('chart', n));
  if (c.syllabi != null && !isPlainObject(c.syllabi))
    throw new Error('The charts in that file are damaged, so it has not been opened.');
  if (c.layouts != null && !isPlainObject(c.layouts))
    throw new Error('The chart positions in that file are damaged, so it has not been opened.');
  if (c.eventInfo != null && !isPlainObject(c.eventInfo))
    throw new Error('The event details in that file are damaged, so it has not been opened.');
  for (const [name, events] of Object.entries(c.syllabi || {})) {
    if (!Array.isArray(events))
      throw new Error('The “' + name + '” chart in that file is damaged, so it has not been opened.');
    for (const e of events) {
      if (!isPlainObject(e) || typeof e.id !== 'string' || !e.id)
        throw new Error('The “' + name + '” chart in that file has an event with no name, so it has not been opened.');
      if (e.prereqs != null && (!Array.isArray(e.prereqs) || e.prereqs.some(p => typeof p !== 'string')))
        throw new Error('The “' + name + '” chart in that file lists a bad prerequisite on ' + e.id + ', so it has not been opened.');
    }
    const bad = firstCycle(events);
    if (bad) throw new Error('The “' + name + '” chart in that file runs in a circle (' + bad + '), so it has not been opened.');
  }
}

/* A prerequisite loop makes the chart's own level-finder recurse until the
   stack gives out, which kills every later render. Cheaper to refuse the file. */
export function firstCycle(events) {
  const by = {}; (events || []).forEach(e => { if (e && e.id) by[e.id] = e; });
  const state = {};   /* 1 = being visited, 2 = finished */
  const walk = (id, trail) => {
    if (state[id] === 2) return null;
    if (state[id] === 1) return trail.slice(trail.indexOf(id)).concat(id).join(' → ');
    state[id] = 1;
    for (const p of (by[id].prereqs || [])) {
      if (!by[p]) continue;
      const hit = walk(p, trail.concat(id));
      if (hit) return hit;
    }
    state[id] = 2;
    return null;
  };
  for (const id of Object.keys(by)) { const hit = walk(id, []); if (hit) return hit; }
  return null;
}

function checkStudents(s) {
  if (!isPlainObject(s)) throw new Error('The people in that file are damaged, so it has not been opened.');
  /* courses: the legacy string[] (v1, name-keyed) OR { id, name } entries (v2,
     id-keyed) — one or the other, never a mix, so the reader cannot
     half-upgrade a file (mirror of the dual roster shape below). */
  if (s.courses != null) {
    if (!Array.isArray(s.courses))
      throw new Error('The list of courses in that file is damaged, so it has not been opened.');
    const allStr = s.courses.every(n => typeof n === 'string');
    const allEnt = s.courses.every(isCourseEntry);
    if (!(allStr || allEnt))
      throw new Error('The list of courses in that file is damaged, so it has not been opened.');
    const cids = new Set(), cnames = new Set();
    for (const c of s.courses) {
      const name = allEnt ? c.name : c;
      noColon('course', name);
      /* a course NAME may not be one the app reserves at the top level — it
         would collide with a global on import (review CSID-08 / R3-01) */
      if (isReservedCourseName(name))
        throw new Error('The course “' + name + '” in that file uses a name the app reserves, so it has not been opened.');
      if (cnames.has(name)) throw new Error('The course “' + name + '” is listed twice in that file, so it has not been opened.');
      cnames.add(name);
      if (allEnt) {
        /* a v2 course id becomes a top-level storage-key segment, so it must
           match the minted grammar — a nonempty check alone would let a
           separator-bearing id clobber a global (review CSID-07) */
        if (!isCourseId(c.id))
          throw new Error('The course “' + name + '” in that file has an invalid id, so it has not been opened.');
        if (cids.has(c.id)) throw new Error('That file lists course id ' + c.id + ' twice, so it has not been opened.');
        cids.add(c.id);
      }
    }
  }
  if (s.byCourse != null && !isPlainObject(s.byCourse))
    throw new Error('The courses in that file are damaged, so it has not been opened.');
  for (const [course, cv] of Object.entries(s.byCourse || {})) {
    /* a v1 byCourse key is a course NAME; a v2 key is a course ID. Refuse a
       colon either way, a reserved NAME, and an id-shaped key that is not a
       valid course id (so a hand-edited v2 file cannot smuggle a bad segment). */
    noColon('course', course);
    if (isReservedCourseName(course))
      throw new Error('The course “' + course + '” in that file uses a name the app reserves, so it has not been opened.');
    if (!isPlainObject(cv))
      throw new Error('Course “' + course + '” in that file is damaged, so it has not been opened.');
    if (cv.bySyllabus != null && !isPlainObject(cv.bySyllabus))
      throw new Error('Course “' + course + '” in that file is damaged, so it has not been opened.');
    /* one id must not carry two names across this course's syllabi (review
       finding 5): a Map remembers the name each id was first seen under. */
    const idToName = new Map();
    for (const [syl, sv] of Object.entries(cv.bySyllabus || {})) {
      noColon('syllabus', syl, ' on course “' + course + '”');
      if (!isPlainObject(sv))
        throw new Error('“' + syl + '” on course “' + course + '” in that file is damaged, so it has not been opened.');
      /* two roster shapes (stable ids, 10 Sep 26): the legacy string list, or
         entries { id, name, pid? } — one or the other, never a mix, so the
         reader cannot half-upgrade a file */
      /* the array check MUST run before either .every() below: a damaged
         file names its part ("the crew list … is damaged"), so a truthy
         non-array roster (a string, a number, a plain object) has to be
         turned away here — reaching .every() on it throws a raw, unnamed
         TypeError instead, which leaves nobody any wiser (review fix). */
      if (sv.roster != null && !Array.isArray(sv.roster))
        throw new Error('The crew list for “' + syl + '” on course “' + course + '” is damaged, so that file has not been opened.');
      const rs = sv.roster || [];
      const isEntry = e => !!e && typeof e === 'object' && !Array.isArray(e) && typeof e.id === 'string' && !!e.id && typeof e.name === 'string' && (e.pid == null || (typeof e.pid === 'string' && !!e.pid));
      const allStr = rs.every(n => typeof n === 'string'), allEntry = rs.every(isEntry);
      if (!(allStr || allEntry))
        throw new Error('The crew list for “' + syl + '” on course “' + course + '” is damaged, so that file has not been opened.');
      /* per roster: no id twice, no name twice; an entry id also can't
         disagree with the name it already carries on an earlier syllabus */
      const ids = new Set(), names = new Set();
      for (const n of rs) {
        const id = allEntry ? n.id : null, name = allEntry ? n.name : n;
        if (allEntry) {
          if (ids.has(id))
            throw new Error('The crew list on course “' + course + '” lists id ' + id + ' twice on “' + syl + '”, so that file has not been opened.');
          ids.add(id);
        }
        if (names.has(name))
          throw new Error('The crew list on course “' + course + '” lists “' + name + '” twice on “' + syl + '”, so that file has not been opened.');
        names.add(name);
        if (allEntry) {
          const prev = idToName.get(id);
          if (prev != null && prev !== name)
            throw new Error('Course “' + course + '” in that file gives id ' + id + ' two names, so it has not been opened.');
          idToName.set(id, name);
        }
      }
      for (const f of ['marks', 'dates']) {
        if (sv[f] != null && !isPlainObject(sv[f]))
          throw new Error('The ' + (f === 'marks' ? 'marks' : 'dates') + ' for “' + syl + '” on course “' + course + '” are damaged, so that file has not been opened.');
      }
    }
    for (const f of ['plan', 'lulls', 'pace']) {
      if (cv[f] != null && !isPlainObject(cv[f]))
        throw new Error('Course “' + course + '” in that file is damaged, so it has not been opened.');
    }
  }
}

/* course → student name → person id, every leaf a non-empty string — the
   LEGACY links block of a pre-10 Sep 26 export. The id is Raptor's PEOPLE
   key; whether it still names somebody is the app's business when the file
   is applied (core.js applyStudents folds it into the roster entry's pid
   through app/ids.js, and a name on no roster is ignored), not the format's.
   Export has not written this block since students became entries. */
function checkLinks(l) {
  if (!isPlainObject(l)) throw new Error('The links in that file are damaged, so it has not been opened.');
  for (const [course, m] of Object.entries(l)) {
    noColon('course', course);
    if (!isPlainObject(m)) throw new Error('The links for course “' + course + '” in that file are damaged, so it has not been opened.');
    for (const [name, id] of Object.entries(m)) {
      noColon('crew member', name, ' on course “' + course + '”');
      if (typeof id !== 'string' || !id)
        throw new Error('The links for course “' + course + '” in that file are damaged (' + name + '), so it has not been opened.');
    }
  }
}

export function readFile(obj) {
  if (!obj || typeof obj !== 'object' || Array.isArray(obj) || obj.format !== FILE_FORMAT)
    throw new Error('That file is not an OCU Tracker file.');
  if (typeof obj.version !== 'number' || obj.version > FILE_VERSION)
    throw new Error('That file was written by a newer version of the app.');
  if (obj.charts != null) checkCharts(obj.charts);
  if (obj.students != null) checkStudents(obj.students);
  if (obj.links != null) checkLinks(obj.links);
  return {
    charts: obj.charts || null,
    students: obj.students || null,
    links: obj.links || null,
    contains: {
      charts: !!(obj.contains && obj.contains.charts),
      students: !!(obj.contains && obj.contains.students),
      links: !!(obj.contains && obj.contains.links),
    },
  };
}

export function describeFile(obj) {
  const { charts, contains } = readFile(obj);
  return {
    charts: contains.charts,
    students: contains.students,
    savedAt: obj.savedAt || null,
    syllabusNames: (charts && Array.isArray(charts.order)) ? charts.order.slice() : [],
  };
}

/* The name is a safety feature: a file holding people must look different in
   File Explorer and in an email attachment list. */
export function suggestedFileName(contains, savedAt) {
  const day = (savedAt || '').slice(0, 10) || 'undated';
  const flag = (contains && contains.students) ? 'WITH-STUDENTS-' : '';
  return `OCU-syllabus-${flag}${day}.json`;
}
