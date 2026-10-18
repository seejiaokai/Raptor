/* The steps of a Tracker file IMPORT that touch nothing of the store
   ([TRK-FILE-TRANSFER-SPLIT], 17 Oct 26 — D493, D775; moved out of core.js
   word for word). Like fileFormat.js beside it, free of browser APIs and of
   core.js, so it can be checked in plain Node: the one thing it reads of the
   store, the chart catalogue (`SYLS`), is handed in by core.js's own
   `normalizeImport`. The rest of the import and export (the questions it
   asks, the writes, the redraws) stays in core.js: it reads and rewrites the
   store's own lists, and lifting it would need the catch-all "core context"
   Astra's read said to stop at (the 13 Oct 26 look — OUTSTANDING.md
   [TRK-FILE-TRANSFER-SPLIT]). Pinned by tracker/file-transfer-boundary.test.ts. */
import { isSylId, isSylEntry, upgradeSyllabi, buildUnionSylcat, reconcileSylIds } from './sylIds.js'

const has = (o, k) => Object.prototype.hasOwnProperty.call(o, k);

/* the refusal of a pre-v3 or colliding students block — shared with core.js's
   reconcileStudentsSyllabi, the guardrail that runs after the charts land */
export const STUDENT_GUARD_MSG = 'These student marks were saved by an older version and can’t be brought in safely. Import the charts, then re-enter marks — or export a fresh backup from the current app and import that.';
/* D1015 (18 Oct 26, his "13 B"): a file of TODAY's version whose student marks belong to a chart that is in neither the
   file nor this Tracker — not found, deleted here, or two of the file's charts landing on one — is not an older file, so
   it is told so in his words; STUDENT_GUARD_MSG stays for a file really saved by an older version. */
export const STUDENT_CHART_MSG = 'Student marks not brought in: they belong to a chart this file doesn’t carry. Export a fresh backup that includes its charts, and import that.';

/* Two event lists are the same chart definition when they match field for
   field — ignoring `_b`, computeFlow's scratch value, which it writes onto the
   event objects it lays out and so can ride into an export. */
export function sameDef(a, b) {
  const strip = l => JSON.stringify((l || []).map(e => { const c = { ...e }; delete c._b; return c; }));
  return strip(a) === strip(b);
}

/* ONE normalize + ONE reconcile across the WHOLE file (§14 CSID2-05, §15
   CSID2-R2-03 — review CSID-REV-03/04/05). readFile is pure and never mints.
   normalizeImport decides id/name by the envelope VERSION, never by a key's
   spelling (a v1/v2 key is a name even if it is spelled like an id); upgrades a
   v1/v2 charts block to ids ONCE; builds the UNION of the charts and students
   catalogues and validates their cross-agreement; reconciles that union to the
   store with a SINGLE map (built-ins by deterministic id; customs by name, store
   id wins; a clash refuses); and applies that one map to BOTH the charts and the
   v3 students block (bySyllabus keys, plan.sylId, sylcat). A pre-v3 students
   block has no sylcat and is left name-keyed for the §19 guardrail in
   applyStudents to refuse. Returns the reconciled charts + students + version.
   `existing` is the store's chart catalogue (core.js's SYLS) at the moment of
   the import. */
export function normalizeImport(parsed, existing) {
  const version = parsed.version;
  let charts = parsed.charts ? JSON.parse(JSON.stringify(parsed.charts)) : null;
  let students = parsed.students ? JSON.parse(JSON.stringify(parsed.students)) : null;
  if (charts && (version == null || version < 3)) charts = upgradeSyllabi(charts).charts;   /* v1/v2 → id + derived sylcat */
  const chartsCat = (charts && Array.isArray(charts.sylcat)) ? charts.sylcat : null;
  const studentsCat = (students && version >= 3 && Array.isArray(students.sylcat)) ? students.sylcat : null;
  let re = id => id;
  let unionIds = null;   /* §15 CSID2-R2-03: the id set every reference is completeness-checked against */
  if (chartsCat || studentsCat) {
    const union = buildUnionSylcat(chartsCat, studentsCat);   /* throws on cross-catalogue disagreement / bad id */
    unionIds = new Set(union.map(e => e.id));
    const { remapped, conflicts } = reconcileSylIds(union, existing);
    if (conflicts.length) { const x = conflicts[0]; throw new Error('That file could not be brought in: the syllabus “' + x.name + '” is a different chart than one already here. Rename one, then import again — nothing has been changed.'); }
    re = id => has(remapped, id) ? remapped[id] : id;
  }
  if (charts) {
    const rk = obj => { const o = {}; for (const k of Object.keys(obj || {})) o[re(k)] = obj[k]; return o; };
    const out = { ...charts };
    if (charts.syllabi) out.syllabi = rk(charts.syllabi);
    if (charts.layouts) out.layouts = rk(charts.layouts);
    if (charts.eventInfoBySyl) out.eventInfoBySyl = rk(charts.eventInfoBySyl);   /* D126: details ride with their chart's id */
    if (Array.isArray(charts.order)) out.order = charts.order.map(re);
    if (Array.isArray(charts.sylcat)) out.sylcat = charts.sylcat.map(e => ({ ...e, id: re(e.id) }));
    charts = out;
  }
  /* the v3 students block, reconciled through the SAME map. REFERENCE
     COMPLETENESS + COLLISION are checked on the ORIGINAL refs BEFORE remapping
     (review CSID-REVIEW-02): a bySyllabus/plan id absent from the file's own
     sylcat, or two refs that reconcile onto one destination, would silently
     collapse or mis-file a student block — so the STUDENT import is refused
     (studentsRefused; charts still import), rather than throwing away the whole
     file. A pre-v3 block stays raw and is refused by the version guardrail. */
  let studentsRefused = false;
  if (students && studentsCat) {
    /* completeness is checked against the UNION of both catalogues, not
       students.sylcat alone (review CSID-IR-03, §15 CSID2-R2-03): a v3 file may
       carry the full identity in charts.sylcat with students.sylcat=[] yet a
       student block still references it — that is a resolvable reference, not a
       refusal. unionIds is the id set buildUnionSylcat validated above. */
    const catIds = unionIds || new Set(studentsCat.filter(isSylEntry).map(e => e.id));
    const refs = new Set();
    for (const c of Object.keys(students.byCourse || {})) { const cv = students.byCourse[c] || {}; for (const k of Object.keys(cv.bySyllabus || {})) refs.add(k); if (cv.plan && cv.plan.sylId) refs.add(cv.plan.sylId); }
    let bad = false; const dests = new Set();
    for (const r of refs) { if (!isSylId(r) || !catIds.has(r)) { bad = true; break; } const t = re(r); if (dests.has(t)) { bad = true; break; } dests.add(t); }
    if (bad) { students = null; studentsRefused = true; }
    else students = remapStudentsSyl(students, re);
  }
  return { charts, students, version, studentsRefused };
}
/* remap a students block's syllabus ids by a mapping FUNCTION (the one import map,
   or an add-as-new fileId→newId step whose students must follow, §CSID2-05). */
export function remapStudentsSyl(students, re) {
  const byCourse = {};
  for (const c of Object.keys(students.byCourse || {})) {
    const cv = students.byCourse[c] || {}, nb = {};
    /* two source ids must never collide onto one dest — that would silently drop
       a student block before the guardrail sees it (review CSID-REVIEW-02). */
    for (const k of Object.keys(cv.bySyllabus || {})) { const nk = re(k); if (has(nb, nk)) throw new Error(STUDENT_CHART_MSG); nb[nk] = cv.bySyllabus[k]; }
    const ncv = { ...cv, bySyllabus: nb };
    if (ncv.plan && ncv.plan.sylId) ncv.plan = { ...ncv.plan, sylId: re(ncv.plan.sylId) };
    byCourse[c] = ncv;
  }
  const out = { ...students, byCourse };
  if (Array.isArray(students.sylcat)) out.sylcat = students.sylcat.map(e => ({ ...e, id: re(e.id) }));
  return out;
}
