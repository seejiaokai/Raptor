// src/tracker/app/sylIds.js
/* SYLLABUS IDS ([TRK-CSID] 1B-ii, 13 Sep 26; ARCH-STACK step 1B). A syllabus
   used to BE its typed NAME: the name was a global-catalogue key
   (v3:master:syls / lay / sylorder / …), the MIDDLE segment of every per-course
   student key (v3:<courseId>:<name>:m:<studentId>), and the current-chart
   pointer (plan.sylName). Now a syllabus is an opaque id and the name is a
   label, exactly as a course became in 1B-i and a student in the stable-ids
   round.

   Two id-spaces, both matching SYL_ID_RE and both distinct from course (c…) and
   student (s…) ids so a storage dump stays legible:
   - BUILT-IN  →  a shipped DETERMINISTIC id from the BUILTIN_SYL table below,
     the SAME on every browser and build. A built-in's id is a pure function of
     the code table, so it needs no per-boot minting and cross-browser a
     built-in chart matches by id with no reconcile (design A, §3/§13.1; the
     rejected random+reconcile design B needed an every-boot reconcile).
   - CUSTOM    →  a minted random id (two browsers never mint the same one).

   This module is the ONE pure converter (no storage, no core.js), shared by the
   once-per-browser migration (core.js migrateSylIds) and by file import
   (core.js normalizeImport), so the two paths cannot drift. It mirrors
   app/courseIds.js. */

/* THE CODE TABLE. Each built-in carries a fixed id that NEVER changes — not on
   a user rename, not on a shipped SYL_RENAME. `name` is the canonical shipped
   SYLLABI key (the catalogue entry's `base`, the source of its definition,
   default layout and per-syllabus event-info); `aliases` are old shipped names
   (the retired SYL_RENAME sources) that a shipped build once used for the same
   built-in. A new shipped built-in appears here with its own new id.
   The ids are permanent: changing one orphans every record filed under it. */
export const BUILTIN_SYL = [
  { id: 'sb2024', name: '2024', aliases: [] },
  { id: 'sb2026', name: '2026', aliases: ['FG JUL 26', 'Default July 26'] },
  { id: 'sbtx2026', name: 'Tx 2026', aliases: [] },
  { id: 'sbagaa2026', name: 'A/G - A/A 2026', aliases: [] },
];

/* Random rather than a counter so two browsers never mint the same id. */
export function mintSylId() { return 'sc' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8); }

/* A syllabus id is a storage-key SEGMENT — the global keys' suffix
   (v3:master:lay:<id>) and the per-course student key's MIDDLE segment
   (v3:<courseId>:<id>:m:<studentId>) — so it must carry no separator and cannot
   collide with a global namespace. `sb…` is the code table's alone, `sc…` is a
   minted custom; enforce exactly this at every boundary that accepts an id from
   OUTSIDE (a v3 import, a hand-edited store), because a nonempty-string check
   alone would let 'master:lay' through and clobber v3:master:lay:* (mirror
   COURSE_ID_RE, review CSID-07). */
export const SYL_ID_RE = /^s[bc][0-9a-z]+$/;
export const isSylId = v => typeof v === 'string' && SYL_ID_RE.test(v);
export const isBuiltinSylId = v => isSylId(v) && v[1] === 'b';
export const isCustomSylId = v => isSylId(v) && v[1] === 'c';
export const isSylEntry = e => !!e && typeof e === 'object' && !Array.isArray(e) && typeof e.id === 'string' && !!e.id && typeof e.name === 'string';

const has = (o, k) => Object.prototype.hasOwnProperty.call(o, k);
const isPlainObject = v => !!v && typeof v === 'object' && !Array.isArray(v);

/* id → table entry, canonical name → id, historical alias → id. Built once. */
const BUILTIN_BY_ID = Object.create(null);
const BUILTIN_ID_BY_NAME = Object.create(null);
const BUILTIN_ID_BY_ALIAS = Object.create(null);
for (const b of BUILTIN_SYL) {
  BUILTIN_BY_ID[b.id] = b;
  BUILTIN_ID_BY_NAME[b.name] = b.id;
  for (const a of (b.aliases || [])) BUILTIN_ID_BY_ALIAS[a] = b.id;
}
export function builtinSylById(id) { return has(BUILTIN_BY_ID, id) ? BUILTIN_BY_ID[id] : null; }
export function builtinIdByName(name) { return has(BUILTIN_ID_BY_NAME, name) ? BUILTIN_ID_BY_NAME[name] : null; }
export function builtinIdByAlias(name) { return has(BUILTIN_ID_BY_ALIAS, name) ? BUILTIN_ID_BY_ALIAS[name] : null; }
/* base is ALWAYS derived from the table for a built-in id (§16 CSID2-R3-03): the
   sb… namespace is the table's alone, and sylSource/default-layouts/event-info
   resolve through base, so a base supplied by a file/store is never trusted. */
export function builtinBaseOf(id) { const b = builtinSylById(id); return b ? b.name : null; }

/* CLASSIFY — decide the identity of a name that carries a real DEFINITION (a
   store custom def, or a file charts.syllabi payload). §17 CSID2-R4-01 split
   CLASSIFY (definition present) from RESOLVE (a reference with no definition):
   only a name with a def is classified. ONE rule, store and file:
   - a CURRENT canonical shipped name → its deterministic built-in id (base =
     canonical; any stored/file def becomes the built-in's override);
   - a historical-alias-WITH-def OR an ordinary name with a def → a CUSTOM
     (caller mints/reuses the id). A historical alias that carries its own
     definition is NOT folded onto the built-in (§15 CSID2-R2-02): with no
     provenance in legacy data this is the one conservative call that can never
     silently merge two distinct charts, and it is identical in both paths.
   Returns { builtin:true, id, base } or { builtin:false } (caller mints). */
export function classifyDefinedName(name) {
  const bid = builtinIdByName(name);
  return bid ? { builtin: true, id: bid, base: builtinBaseOf(bid) } : { builtin: false };
}

const conflict = msg => { throw new Error('The charts in that file are inconsistent: ' + msg + ', so it has not been opened.'); };

/* THE FILE'S CHART LAYER, name-keyed in → id-keyed out (mirror upgradeCourses).
   A v1/v2 file keys charts.syllabi / charts.layouts by NAME and charts.order is
   a name list. Every chart here HAS a definition (it is in charts.syllabi), so
   CLASSIFY decides each: the current canonical name → its built-in id; any
   other name (a relabelled built-in, a historical alias with its own def, an
   ordinary custom) → a minted custom id. Builds the id-keyed charts block and
   a charts.sylcat { id, name, base? }[] carrying each id its label. Does not
   mutate its input. A custom minted here gets a fresh id; the same name seen
   again (order + syllabi + layouts) reuses it. */
export function upgradeSyllabi(charts) {
  const src = charts || {};
  const syllabiIn = isPlainObject(src.syllabi) ? src.syllabi : {};
  const layoutsIn = isPlainObject(src.layouts) ? src.layouts : {};
  const orderIn = Array.isArray(src.order) ? src.order : [];
  const map = Object.create(null);        // chart name → id
  const sylcat = [], seenId = new Set();
  const assign = name => {
    if (has(map, name)) return map[name];
    const cls = classifyDefinedName(name);
    const id = cls.builtin ? cls.id : mintSylId();
    if (seenId.has(id)) conflict('“' + name + '” resolves to an id already in use');
    map[name] = id; seenId.add(id);
    const e = { id, name }; if (cls.builtin) e.base = cls.base; sylcat.push(e);
    return id;
  };
  const syllabi = Object.create(null), layouts = Object.create(null);
  for (const name of Object.keys(syllabiIn)) syllabi[assign(name)] = syllabiIn[name];
  for (const name of Object.keys(layoutsIn)) layouts[assign(name)] = layoutsIn[name];
  const order = orderIn.map(assign);
  const out = { order, syllabi, layouts, sylcat };
  if (src.eventInfo != null) out.eventInfo = src.eventInfo;
  return { charts: JSON.parse(JSON.stringify(out)), map: Object.assign({}, map) };
}

/* THE UNION IDENTITY CATALOGUE (§15 CSID2-R2-03, §14 CSID2-04). Labels and
   provenance travel in a sylcat, present in BOTH the charts block (rich) and
   the students block (identity-only) — a student-only or partial export still
   carries labels for every id it references. normalizeImport unions the two
   before reconciling: overlapping ids MUST agree on identity (name/base/
   userNamed) or the file is refused; id- and name-uniqueness are enforced across
   the union; and every sb… id is validated against the code table with its base
   made authoritative (§16 CSID2-R3-03) — an unknown sb… id is rejected. Returns
   the deduped union { id, name, base?, userNamed? }[]. Throws (named) on any
   disagreement or bad id. */
export function buildUnionSylcat(chartsSylcat, studentsSylcat) {
  const byId = new Map();     // id → normalized entry
  const byName = new Map();   // name → id (uniqueness)
  const ingest = (cat, whose) => {
    for (const e of (cat || [])) {
      if (!isSylEntry(e)) conflict('a syllabus in the ' + whose + ' has no id or name');
      if (!isSylId(e.id)) conflict('syllabus id “' + e.id + '” is not a valid id');
      /* sb… is the code table's alone: an unknown built-in id is rejected, and
         base is taken from the table, never trusted from the file. */
      let base = e.base;
      if (isBuiltinSylId(e.id)) {
        const b = builtinSylById(e.id);
        if (!b) conflict('syllabus id “' + e.id + '” is not a syllabus this app ships');
        base = b.name;
      } else if (base != null && !(typeof base === 'string' && base)) {
        conflict('syllabus “' + e.name + '” has a damaged base');
      }
      const userNamed = e.userNamed === true;
      const norm = { id: e.id, name: e.name };
      if (base != null) norm.base = base;
      if (userNamed) norm.userNamed = true;
      if (byId.has(e.id)) {
        const p = byId.get(e.id);
        /* overlapping ids across the two catalogues must agree on identity */
        if (p.name !== norm.name || (p.base || null) !== (norm.base || null))
          conflict('syllabus id “' + e.id + '” is described two different ways');
        /* userNamed is the OR of the two (a rename recorded in either wins) */
        if (norm.userNamed) p.userNamed = true;
        continue;
      }
      if (byName.has(e.name) && byName.get(e.name) !== e.id)
        conflict('the label “' + e.name + '” is used by two different syllabuses');
      byId.set(e.id, norm); byName.set(e.name, e.id);
    }
  };
  ingest(chartsSylcat, 'charts');
  ingest(studentsSylcat, 'students');
  return [...byId.values()];
}

/* THE STORE'S IDS WIN ON IMPORT (mirror reconcileCourseIds). A file syllabus
   whose id the store already has IS that syllabus — and EVERY built-in matches
   this way, because its id is deterministic (the same on every browser), so a
   built-in never needs a name reconcile. A file CUSTOM whose id the store does
   not have falls back to a store custom of the SAME NAME (the store's id wins,
   so a laptop's export does not land the chart a second time under the file's
   id); a name that matches a store syllabus under a DIFFERENT id is a conflict —
   collected and handed to the caller, which REFUSES the import. Every chosen
   target is reserved across the whole file so two file syllabuses can never map
   onto one store id. `existing` is the store's catalogue ({id,name} entries).
   Returns { remapped: fileId→storeId, conflicts }. */
export function reconcileSylIds(sylcat, existing) {
  const listIn = (sylcat || []).filter(isSylEntry);
  const byName = Object.create(null), storeIds = new Set();
  for (const e of (existing || [])) {
    if (!isSylEntry(e)) continue;
    if (!has(byName, e.name)) byName[e.name] = e;
    storeIds.add(e.id);
  }
  const remap = Object.create(null);
  const taken = new Set(listIn.map(e => e.id));
  for (const e of listIn) if (storeIds.has(e.id)) taken.add(e.id);
  for (const e of listIn) {
    if (storeIds.has(e.id)) continue;      // the store already holds this id
    if (isBuiltinSylId(e.id)) continue;    // a built-in id is authoritative even before the store lists it
    const mate = has(byName, e.name) ? byName[e.name] : null;
    if (!mate || mate.id === e.id || taken.has(mate.id)) continue;
    remap[e.id] = mate.id; taken.add(mate.id);
  }
  const conflicts = [], seenC = new Set();
  for (const e of listIn) {
    if (seenC.has(e.name)) continue;
    const mate = has(byName, e.name) ? byName[e.name] : null;
    const resolved = has(remap, e.id) ? remap[e.id] : e.id;
    if (mate && resolved !== mate.id) { conflicts.push({ name: e.name, fileId: e.id, storeId: mate.id }); seenC.add(e.name); }
  }
  return { remapped: Object.assign({}, remap), conflicts };
}
