/* ============================================================================
   OCU Progress Tracker — core application state, logic and flow-board engine.
   This is a faithful port of the original single-file app's main script.
   React components subscribe via subscribe()/getVersion() and read the
   exported live bindings; the flow chart itself is rendered imperatively
   into the #board container (exactly as the original did), because its
   editor relies on direct-DOM manipulation for drag/pan performance.
   ========================================================================== */
import { SYLLABI, SYL_NAMES, DEFAULT_SYL_NAME, DEFAULT_SYL_ORDER } from '../data/syllabi.js';
import { DEFAULT_LAYOUTS } from '../data/layouts.js';
import { EVENT_INFO, EVENT_INFO_BY_SYL } from '../data/eventInfo.js';
import { SEED_STATE, SEED_STAMP } from '../data/seedState.js';
import { storage, flushNow, loadLatest } from '../storage.js';
import * as FMT from './fileFormat.js';
import * as FS from './fileStore.js';
import { findEvents } from './eventOrder.js';
import { isFileLocked, onFileLocked } from '../role.js';
import { getPeople, onPeople, whoami } from '../people.js';
import { mintId, isEntry, upgradeCourseBlock, reconcileIds } from './ids.js';
import { mintCourseId, isCourseEntry, isCourseId, isReservedCourseName, upgradeCourses, reconcileCourseIds } from './courseIds.js';

export { SYLLABI, SYL_NAMES, DEFAULT_SYL_NAME, DEFAULT_SYL_ORDER, DEFAULT_LAYOUTS, EVENT_INFO };
export { mintId };

/* ---------- change notification (React integration) ---------- */
let version = 0;
const listeners = new Set();
export function subscribe(cb) { listeners.add(cb); return () => listeners.delete(cb); }
export function getVersion() { return version; }
export function notify() { version++; listeners.forEach(f => { try { f(); } catch (e) {} }); }
/* the original called these to repaint the header/side panel; in React they
   are all just "something changed, re-render from state" */
const renderSide = notify;
const refreshSyl = notify;
const refreshActive = notify;
const refreshCourses = notify;

/* ---------- FILE ACCESS: the Raptor role seam (7 Sep 26, the Tracker merge) ----------
   The standalone app had no roles at all. Inside Raptor the owner's rule
   (his second word, 7 Sep 26) is: everyone — admin and member alike — marks,
   edits charts and manages students, courses and syllabi exactly as before;
   ONLY the file portion is the admin's: ⇪ Import, ⤓ Export (📁 Open /
   ⊕ Import syllabus / ⤓ Save a copy until 9 Sep 26). ✓ Save changes
   stays for everyone — it writes flow edits to the store and nothing else.
   The flag is written by Raptor's resetSession (every
   login/logout) and the admin's view-as-member toggle, through role.js;
   never persisted, never re-read, so it can never disagree with the session
   actually looking at the page. Enforced at the WRITE PATH (the three file
   entry points below open with `if (fileLocked) return`), not only at the
   affordance (Header.jsx hides the File menu). */
export let fileLocked = isFileLocked();
onFileLocked(next => { if (next === fileLocked) return; fileLocked = next; if (fileLocked) copyOpen = false; notify(); });

export const DEFAULT_SYLLABUS = SYLLABI[DEFAULT_SYL_NAME];
export const TYPE_COLOR = { flight: '#19b6e8', acad: '#27d64a', test: '#ff4040', sim: '#ffe000', device: '#b063ff' };
const DARKC = new Set(['sim', 'acad', 'na', 'flight', 'test', 'device']); // labels needing dark text on light fills
export const GRADE_FILL = { dco: '#000000', dpco: '#1f6dff', marg: '#27d64a', na: '#cdbb8e' };
export const DONE = new Set(['dco', 'dpco', 'marg']);
export let eventInfo = {}; export let showDetails = false;
/* Keep only fields that genuinely differ from the baked base. Files used to
   carry the WHOLE info table and applyCharts stored it verbatim, freezing every
   event to the values of the day the file was saved — which sat above the
   per-syllabus profiles and quietly clobbered them. Scrubbing on load heals
   stores polluted that way; it never touches a real user edit. */
/* __kept marks fields the user typed deliberately even though they match the
   baked base. That happens on a renumbered syllabus: Tx's SA-5 ships with
   "(Refer to BCTM SA-6)" on the end, so deleting that note leaves exactly the
   base wording — indistinguishable, by value alone, from a field a file merely
   carried along. Scrubbing pruned it and the note came back on the next load.
   The marker is what tells the two apart; a file's bulk table has none, so it
   is still pruned exactly as before. */
function scrubEventInfo() {
  for (const k of Object.keys(eventInfo)) {
    const base = EVENT_INFO[k] || {}; const o = eventInfo[k]; const diff = {};
    const kept = Array.isArray(o.__kept) ? o.__kept : [];
    Object.keys(o).forEach(f => {
      if (f === '__kept') return;
      if ((o[f] || '') !== (base[f] || '') || kept.includes(f)) diff[f] = o[f];
    });
    const stillKept = kept.filter(f => f in diff);
    if (stillKept.length) diff.__kept = stillKept;
    if (Object.keys(diff).filter(f => f !== '__kept').length) eventInfo[k] = diff; else delete eventInfo[k];
  }
}
async function loadEventInfo() {
  try { const r = await sGet('v3:eventinfo'); eventInfo = r ? JSON.parse(r) : {}; } catch (e) { eventInfo = {}; }
  scrubEventInfo();
}
async function saveEventInfo() { await sSet('v3:eventinfo', JSON.stringify(eventInfo)); }
/* Base info, then the active syllabus's own profile for that id (the short
   course renumbers sorties, so e.g. its BFM-5 flies the BFM-7 profile), then
   the user's own edits on top. */
export function infoFor(id) {
  const bySyl = (EVENT_INFO_BY_SYL[curSyl()] || {})[id];
  return Object.assign({}, EVENT_INFO[id] || {}, bySyl || {}, eventInfo[id] || {});
}
/* Prereq wording for display: the free-text note if there is one, otherwise the
   actual chart links. */
export function preText(id) {
  const d = infoFor(id); if (d.pre) return d.pre;
  const e = byid[id]; const ps = e && e.prereqs || []; return ps.length ? ps.join(', ') : '';
}
export function infoHtml(id) {
  const d = infoFor(id); const rows = [];
  if (d.fmt) rows.push('<b>Type:</b> ' + escapeId(d.fmt) + (d.hrs ? ' · ' + escapeId(d.hrs) : ''));
  if (d.crew) rows.push('<b>Crew:</b> ' + escapeId(d.crew));
  { const p = preText(id); if (p) rows.push('<b>Prerequisites:</b> ' + escapeId(p)); }
  const nm = d.name ? ('<div style="font-weight:600;margin-bottom:3px">' + escapeId(d.name) + '</div>') : '';
  return nm + (rows.length ? rows.join('<br>') : '<span class="mini">No details yet — tap Edit details.</span>');
}
export const NEXT_CATS = [
  { key: 'CFT', label: 'Next CFT', pred: e => /^CFT/.test(e.id) },
  { key: 'IAT', label: 'Next IAT', pred: e => /^IAT/.test(e.id) },
  { key: 'CPT', label: 'Next CPT (sim)', pred: e => e.type === 'sim' },
  { key: 'FLT', label: 'Next Syllabus Flt', pred: e => e.type === 'flight' },
];
export const BUCKETS = [
  { key: 'flight', label: 'Flights', types: ['flight'] },
  { key: 'acad', label: 'Acad / Spec', types: ['acad'] },
  { key: 'sim', label: 'Sims', types: ['sim'] },
  { key: 'device', label: 'IAT/CFT/EPT', types: ['device'] },
  { key: 'test', label: 'Tests', types: ['test'] },
];

/* ---------- storage ---------- */
const mem = {};
async function sGet(k) { try { const r = await storage.get(k); return r ? r.value : null; } catch (e) { return mem[k] ?? null; } }
/* A stored record that is not the JSON shape its reader expects reads as
   ABSENT (the storage seam, 8 Sep 26 bug pass): one corrupt key must not take
   the whole tab down with an uncaught parse error on every visit. `want` is
   'array' or 'object' (or nothing: either); null, a number, a string or bad
   JSON all fall back. */
function sParse(r, fallback, want) {
  if (r == null || r === '') return fallback;
  try {
    const v = JSON.parse(r);
    if (v == null || typeof v !== 'object') return fallback;
    if (want === 'array' && !Array.isArray(v)) return fallback;
    if (want === 'object' && Array.isArray(v)) return fallback;
    return v;
  } catch (_) { return fallback; }
}
async function sSet(k, v) { mem[k] = v; setSaveStatus('', 'saving'); try { await storage.set(k, v); setSaveStatus('', 'ok'); } catch (e) { setSaveStatus('local only', 'ok'); } }

/* ---------- this browser's own preferences ----------
   Which course and which crew member you were last on is a view preference,
   not data. Everything that goes through sSet lands in ONE SharePoint file
   that the whole team shares, so storing it there would let whoever used the
   app last decide what opens for everybody else.
   The prefix matters: sync/local.js sweeps EVERY "ocu:" localStorage key into
   that shared map on its fallback path, so this deliberately sits outside it.
   Both calls swallow their errors (Safari private mode), which means a store
   that cannot be read degrades to "opens on the first course" rather than
   breaking the boot. */
const PP = 'ocuLocal:';
function prefGet(k) { try { return localStorage.getItem(PP + k); } catch (e) { return null; } }
function prefSet(k, v) { try { localStorage.setItem(PP + k, v); } catch (e) {} }

/* The toolbar hides on demand so the chart gets the whole column (owner phone
   ask, 9 Sep 26 — "have the option to hide this bar so that the space can be
   maximised"). It is a per-BROWSER view choice, so it rides ocuLocal: and NOT
   a shared ocu: key — one saved into the shared file/database would decide the
   bar for everyone. Defaults to SHOWN, so nothing changes until it is chosen.
   The board grows into the freed height on its own (.layout is flex:1), so
   there is nothing to re-measure and no resize to fire. */
export let barHidden = prefGet('barHidden') === '1';
export function toggleBar() { barHidden = !barHidden; prefSet('barHidden', barHidden ? '1' : '0'); notify(); }

/* ---------- app state ---------- */
/* COURSES is [{ id, name }] since 13 Sep 26 (stable ids, ARCH-STACK 1B-i): the
   id is the course — minted once, never printed — and every per-course storage
   key files under it, so a rename is a label change that moves nothing. `course`
   is the current course's ID. app/courseIds.js is the converter; migrateCourseIds
   below folds a name-keyed browser over to ids once. (Pre-migration, during boot,
   COURSES may briefly hold bare-string names — loadCourses reads raw and the
   migration converts; nothing but the migration reads COURSES before it runs.) */
export let COURSES = [], course = null, active = null;
const DEFAULT_COURSE_NAME = '26ABSG';
/* the label for a course id (''=unknown); the id for a name (null=unknown) */
export function courseName(id) { const e = COURSES.find(c => isCourseEntry(c) && c.id === id); return e ? e.name : (typeof id === 'string' ? '' : ''); }
export function courseEntry(id) { return COURSES.find(c => isCourseEntry(c) && c.id === id) || null; }
export function courseIdOf(name) { const e = COURSES.find(c => isCourseEntry(c) && c.name === name); return e ? e.id : null; }
export function curCourseName() { return courseName(course); }
/* `roster` is [{ id, name, pid? }] since 10 Sep 26 (stable ids): the id is the
   enrolment — minted once, never re-used — the name is a label the user can
   change, and `pid` is the Raptor PEOPLE id the student was picked off the
   squadron roster with (absent for a typed name). Every map below keys by that
   ID, never by the name, and `active` is an id. app/ids.js is the converter. */
export let SYL = [], byid = {}, roster = [], marks = {}, dates = {}, plan = {};
export let lulls = {};   /* {studentId: [{start,end}]} for the current course */
export let lastEdit = {};   /* {studentId: {syl, event}} for the current course */
export let pace = {};   /* {studentId: {epw, target, target2}} for the current course */
export let calView = new Date();
/* True while boot migrations and course switches are writing. It used to gate
   the file-unsaved flag; since 9 Sep 26 there is no file to flag (the store is
   the record) and it only marks the boot/switch window. */
let loading = true;
/* Loads and roster writes share ONE queue (9 Sep 26). loadCourse reads a dozen
   records with an await between each and then replaces the roster array with
   what it fetched. A second switch started meanwhile interleaved with the
   first, and a + Add finished while the load had already FETCHED the roster
   but not yet applied it pushed and saved — then the load applied its stale
   copy and the next save wrote that copy back: a slow CI runner showed it as
   two adds, one student. The first cut had writers merely WAIT for the chain;
   the review found that one-way: a switch STARTING inside a write's tail
   flipped the syllabus name under the write's later saves. So every load and
   every roster write body is queued on the chain with onChain(): a load never
   starts inside a write, a write never starts inside a load. Dialogs stay
   OUTSIDE the chain — a queued load must never wait on a human. Nothing run
   on the chain may call loadCourse or onChain (it would wait on itself);
   notify() runs inside it, and no subscriber loads (React subscribers only).
   `loading` above is the flag; this is the gate. */
let loadChain = Promise.resolve();
function onChain(fn) { const p = loadChain.then(fn); loadChain = p.catch(() => {}); return p; }   /* a failed step must not jam the chain */
export function whenLoaded() { return loadChain; }
export let arrangeMode = false, layout = {}, drag = null, AUTO = {}, BORROW = null;
/* ---- per-edge routing metadata layered on top of the prereq graph ---- */
let edgeMeta = {}, merges = new Set(), unmerges = new Set(), selEdge = null, mergeFirst = null, selBalls = new Set(), redoStack = [], alignGuides = [];
function ekey(p, c) { return p + '▸' + c; }
function mkey(a, b) { return [a, b].sort().join('|'); }
/* --- crossing hops: see original comments --- */
const LK = '\u0000L';
function lkey(id) { return LK + id; }
function isLineKey(k) { return typeof k === 'string' && k.slice(0, 2) === LK; }
function hopDefault(k1, k2) { return !(isLineKey(k1) || isLineKey(k2)); }
function hasHop(k1, k2) {
  const mk = mkey(k1, k2);
  return hopDefault(k1, k2) ? !merges.has(mk) : unmerges.has(mk);
}
function setHop(k1, k2, want) {
  const mk = mkey(k1, k2);
  if (hopDefault(k1, k2)) { if (want) merges.delete(mk); else merges.add(mk); }
  else { if (want) unmerges.add(mk); else unmerges.delete(mk); }
}
function loadEdgeMeta() {
  let em = (layout && layout.__edgeMeta), mg = (layout && layout.__merges), un = (layout && layout.__unmerges);
  if (!em || !Object.keys(em).length) { /* fall back to the built-in default's routing metadata */
    const dl = DEFAULT_LAYOUTS[curSyl()];
    if (dl && dl.__edgeMeta) em = JSON.parse(JSON.stringify(dl.__edgeMeta));
    if ((!mg || !mg.length) && dl && dl.__merges) mg = JSON.parse(JSON.stringify(dl.__merges));
    /* kept-hop pairs ship with a default chart too: without this, an arrow
       crossing a shipped drawn line renders flush and reads as a junction */
    if ((!un || !un.length) && dl && dl.__unmerges) un = JSON.parse(JSON.stringify(dl.__unmerges));
  }
  edgeMeta = em || {}; merges = new Set(mg || []);
  unmerges = new Set(un || []);
}
function saveEdgeMeta() { layout.__edgeMeta = edgeMeta; layout.__merges = [...merges]; layout.__unmerges = [...unmerges]; }
function ballFontFor(id) { const f = layout.__font || {}; return f[id] || f.__all || 8.5; }
export function rowOf(id) { return Math.round((nodePos(id).y || 0) / 92); }

/* ---------- hint bar (arrhint) ---------- */
export let hintBase = 'Select: drag a box on empty space to pick several balls, then drag any of them to move the group.';
export let hintFlash = null; let hintT = null;
function flashHint(msg) {
  hintFlash = msg; notify();
  clearTimeout(hintT); hintT = setTimeout(() => { hintFlash = null; notify(); }, 1800);
}

const kCourses = 'v3:courses';
const kCourseIdMig = 'v3:courseidmig';   /* one-shot course name → id migration flag (global) */
const kCourseIdMap = 'v3:courseidmap';   /* name → id mapping of a run still in progress; gone once the flag is in */
/* ---- syllabi are global (see original comments) ---- */
const SYL_NS = 'v3:master';
const kSyl = c => 'v3:' + c + ':syl';
const kRoster = c => 'v3:' + c + ':roster';                  /* legacy: whole-course roster */
const kRosterFor = (c, syl) => 'v3:' + c + ':' + syl + ':roster'; /* roster: per course, per syllabus */
const kRosterMig = c => 'v3:' + c + ':rostermig';            /* one-shot legacy-roster split flag */
const kPlan = c => 'v3:' + c + ':plan';
/* Lull periods are stretches of real time, not properties of a syllabus, so
   they hang off the course and the student — NOT off kDates, which is keyed by
   syllabus and would drop them the moment the user switched. */
const kLulls = (c, s) => 'v3:' + c + ':lulls:' + s;
/* Pace and the two end dates, per student. They used to live on the course, so
   every student on a course shared one target and one events-per-week — which is
   wrong: students run at their own rate and finish on their own date. */
const kPace = (c, s) => 'v3:' + c + ':pace:' + s;
/* Where each student was last marking, so opening the app does not start at the
   top of a 10,000px chart every time. */
const kLast = (c, s) => 'v3:' + c + ':last:' + s;
const kLastStudent = c => 'v3:' + c + ':lastStudent';
const kIdMig = c => 'v3:' + c + ':idmig';  /* one-shot name → id migration flag */
const kIdMap = c => 'v3:' + c + ':idmap';  /* the name → id mapping of a run still in progress; gone once the flag is in */
export function curSyl() { return (plan && plan.sylName) || DEFAULT_SYL_NAME; }
const kMarks = (c, s) => 'v3:' + c + ':' + curSyl() + ':m:' + s;
const kDatesOld = (c, s) => 'v3:' + c + ':d:' + s;              /* legacy: dates per course only */
const kDates = (c, s) => 'v3:' + c + ':' + curSyl() + ':d:' + s;
const kDatesFor = (c, syl, s) => 'v3:' + c + ':' + syl + ':d:' + s;
const kLayout = () => SYL_NS + ':lay:' + curSyl();
const kLayoutOwn = () => 'v3:lay:' + course + ':' + curSyl();
const kLayoutOldMaster = () => 'v3:lay:SYLLABUS EDIT:' + curSyl();
async function loadLayout() {
  let r = await sGet(kLayout());
  if (!r) { /* adopt an existing chart: previous master course first, then this course's own */
    const prev = await sGet(kLayoutOldMaster()) || await sGet(kLayoutOwn());
    if (prev) { r = prev; await sSet(kLayout(), prev); }
  }
  layout = sParse(r, {}, 'object'); loadLineDefaults(); loadEdgeMeta();
}
/* Adopt shipped default __lines / __derived only when the key is ABSENT. */
function loadLineDefaults() {
  const n = curSyl();
  const dl = DEFAULT_LAYOUTS[n] || (SYL_ALIAS && SYL_ALIAS[n] ? DEFAULT_LAYOUTS[SYL_ALIAS[n]] : null);
  if (!dl) return;
  if (!Array.isArray(layout.__lines) && Array.isArray(dl.__lines))
    layout.__lines = JSON.parse(JSON.stringify(dl.__lines));
  if (!Array.isArray(layout.__derived) && Array.isArray(dl.__derived))
    layout.__derived = JSON.parse(JSON.stringify(dl.__derived));
  /* shipped per-ball font sizes (wide labels) must reach a first visit too */
  if (layout.__font == null && dl.__font)
    layout.__font = JSON.parse(JSON.stringify(dl.__font));
}
async function saveLayout() { saveEdgeMeta(); await sSet(kLayout(), JSON.stringify(layout)); }

const kSyls = c => SYL_NS + ':syls';                       /* syllabus definitions: global */
const kSylsOwn = c => 'v3:' + c + ':syls';
const kSylsOldMaster = () => 'v3:SYLLABUS EDIT:syls';
const kMarksFor = (c, syl, s) => 'v3:' + c + ':' + syl + ':m:' + s;  /* marks: per course, per student */
const kLayoutFor = (c, syl) => SYL_NS + ':lay:' + syl;
/* Count only REAL node positions in a layout object, ignoring metadata keys. */
function layoutNodeCount(lay) {
  let n = 0; if (!lay) return 0;
  for (const k in lay) { if (k.indexOf('__') === 0) continue; const v = lay[k]; if (v && typeof v.x === 'number' && typeof v.y === 'number') n++; }
  return n;
}
/* Pick the built-in default layout that shares the most event IDs with the current SYL. */
function bestDefaultLayout() {
  const ids = new Set(SYL.map(e => e.id)); let best = null, bestN = 0;
  for (const k in DEFAULT_LAYOUTS) { const dl = DEFAULT_LAYOUTS[k]; if (!dl) continue; let n = 0; for (const id in dl) if (ids.has(id)) n++; if (n > bestN) { bestN = n; best = dl; } }
  return best;
}
/* Build a COMPLETE {id:{x,y}} for every event in the current SYL. */
async function snapshotLayout(srcName) {
  const out = {}; let saved = null;
  try { const r = await sGet(kLayoutFor(course, srcName)); if (r) saved = JSON.parse(r); } catch (_) {}
  const own = DEFAULT_LAYOUTS[srcName] || null, borrow = bestDefaultLayout();
  const auto = computeFlow().pos;
  SYL.forEach(e => {
    const id = e.id;
    const p = (layout && layout[id]) || (saved && saved[id]) || (own && own[id]) || (borrow && borrow[id]) || auto[id] || { x: 60, y: 60 };
    out[id] = { x: p.x, y: p.y };
  });
  /* carry over line-routing metadata so arrows/merges/fonts copy too */
  if (layout && layout.__edgeMeta) out.__edgeMeta = JSON.parse(JSON.stringify(layout.__edgeMeta));
  if (layout && layout.__merges) out.__merges = JSON.parse(JSON.stringify(layout.__merges));
  if (layout && layout.__unmerges) out.__unmerges = JSON.parse(JSON.stringify(layout.__unmerges));
  if (layout && layout.__font) out.__font = JSON.parse(JSON.stringify(layout.__font));
  if (layout && layout.__lines) out.__lines = JSON.parse(JSON.stringify(layout.__lines));
  if (layout && layout.__derived) out.__derived = JSON.parse(JSON.stringify(layout.__derived));
  return out;
}
/* Like snapshotLayout(), but for ANY syllabus: takes the event list rather than
   reading the live SYL, so a file can carry syllabi that are not on screen. */
export async function layoutSnapshotFor(name, events) {
  const out = {};
  let saved = null;
  try { const r = await sGet(kLayoutFor(course, name)); if (r) saved = JSON.parse(r); } catch (_) {}
  const own = DEFAULT_LAYOUTS[name] || null;
  const live = (name === curSyl() && layout) ? layout : null;
  const auto = (name === curSyl()) ? computeFlow().pos : {};
  (events || []).forEach(e => {
    const p = (live && live[e.id]) || (saved && saved[e.id]) || (own && own[e.id])
      || auto[e.id] || { x: 60, y: 60 };
    out[e.id] = { x: p.x, y: p.y };
  });
  for (const k of ['__edgeMeta', '__merges', '__unmerges', '__font', '__lines', '__derived']) {
    const v = (live && live[k]) || (saved && saved[k]) || (own && own[k]);
    if (v != null) out[k] = JSON.parse(JSON.stringify(v));
  }
  return out;
}

export let CUSTOMS = {};
/* Built-ins can be renamed and deleted like any other syllabus. */
export let SYL_HIDDEN = [], SYL_ALIAS = {}, SYL_TOMB = {};
export function isHidden(n) { return SYL_HIDDEN.indexOf(n) >= 0; }
export function builtinOf(n) { return (SYLLABI[n] && !isHidden(n)) ? n : null; }
function sylSource(n) { return (CUSTOMS && CUSTOMS[n]) || (builtinOf(n) ? SYLLABI[n] : null); }
function firstSylName() {
  const a = allSylNames();
  if (a.includes(DEFAULT_SYL_NAME)) return DEFAULT_SYL_NAME;
  const o = orderedSylNames();
  return o[0] || a[0] || DEFAULT_SYL_NAME;
}
function applyAliasLayouts() { for (const k in SYL_ALIAS) { const b = SYL_ALIAS[k]; if (DEFAULT_LAYOUTS[b] && !DEFAULT_LAYOUTS[k]) DEFAULT_LAYOUTS[k] = DEFAULT_LAYOUTS[b]; } }
const SYL_RENAME = { 'FG JUL 26': '2026', 'Default July 26': '2026' };
function padId(id) {
  const SPECIAL = { 'IEPE': 'IEPE/IPC', 'T-9': 'T-09', 'NVG-1': 'NVG-01', 'ST-7(P)': 'ST-07(P)', 'ST-7(W)': 'ST-07(W)' };
  if (SPECIAL[id]) return SPECIAL[id];
  const m = (id + '').match(/^([A-Z()\/]+)-(\d+)([A-Z]?(\([A-Z]\))?)$/);
  if (!m) return id;
  return m[1] + '-' + (m[2].length === 1 ? ('0' + m[2]) : m[2]) + (m[3] || '');
}
function translateMarks(old, ids) {
  const out = {};
  for (const k in old) {
    let nk = null;
    if (ids.has(k)) nk = k;
    else {
      const p = padId(k); if (ids.has(p)) nk = p;
      else { const q = k.replace(/-0(\d)/, '-$1'); if (ids.has(q)) nk = q; }
    }
    if (nk) out[nk] = old[k];
  }
  return out;
}
/* the retired global syllabus-source "course" — never a real course, filtered
   out whether the store still lists it as a bare string (pre-migration) or as an
   entry object (review CSID-R2-01: the filter must handle BOTH shapes, because
   loadCourses runs before migrateCourseIds when entries are still strings) */
const isRetiredCourse = c => (typeof c === 'string' ? c : (isCourseEntry(c) ? c.name : '')) === 'SYLLABUS EDIT';
async function loadCourses() {
  const r = await sGet(kCourses);
  COURSES = sParse(r, [DEFAULT_COURSE_NAME], 'array').filter(c => !isRetiredCourse(c));
  if (!COURSES.length) COURSES = [DEFAULT_COURSE_NAME];
  /* Left raw here (strings pre-migration, entries after) — migrateCourseIds owns
     the string → entry conversion so it rides the durable one-shot flag. Persist
     only the retired-course filter, keeping the shape untouched otherwise. */
  await sSet(kCourses, JSON.stringify(COURSES));
}
async function saveCourses() { await sSet(kCourses, JSON.stringify(COURSES)); }

/* THE PERSON ON THE ENTRY (10 Sep 26, stable ids — replaces the v3:links
   record of 9 Sep 26): a roster entry { id, name, pid? } carries the Raptor
   PEOPLE id it was picked with; a typed student has none. app/ids.js is the
   converter; migrateIds below folds an old links record in once per course. */
const kLinks = 'v3:links';   /* legacy record, read by migrateIds only */
export function nameOf(id) { const r = roster.find(x => x.id === id); return r ? r.name : ''; }
export function pidOf(id) { const r = roster.find(x => x.id === id); return (r && r.pid) || null; }
export function byName(name) { return roster.find(x => x.name === name) || null; }
/* The bridge person a student on the CURRENT course is linked to, or null —
   null too when the pid names somebody Raptor no longer offers. */
export function linkedPerson(id) { const pid = pidOf(id); if (!pid) return null; return getPeople().find(p => p.id === pid) || null; }
/* The roster chips read linkedPerson on every paint, so a change to Raptor's
   people (a callsign edit, an archive) repaints them; the bridge's own guard
   already swallows every notify that changed nobody. */
onPeople(() => notify());
/* Seat as the squadron says it: the Tracker's list sub-text, beside the CAT. */
const seatWord = s => s === 'FCP' ? 'Pilot' : s === 'RCP' ? 'WSO' : (s || '');

/* Course, syllabus and student names are segments of the storage key
   ('v3:' + course + ':' + syllabus + ':m:' + student), so a colon inside one
   files the record under a different key. Refused at every typing point,
   with one message; fileFormat.js refuses a file carrying one. */
const COLON_MSG = "A name can't contain a colon (:), because the app uses it to file the record.";
async function refuseColon(name) { if (typeof name === 'string' && name.includes(':')) { await uiAlert(COLON_MSG); return true; } return false; }
/* Split the legacy flat roster into per-syllabus rosters; runs once per course. */
async function migrateRosters(c) {
  try {
    if (await sGet(kRosterMig(c))) return;
    const rr = await sGet(kRoster(c));
    if (rr == null || rr === '') {
      /* brand-new file: seed the demo pair once, on the syllabus that's showing.
         Since course ids (1B-i), `c` is the opaque course id — match the default
         course by its NAME, not the id literal (review CSID-R2-04). */
      if (courseName(c) === DEFAULT_COURSE_NAME) {
        let any = false;
        for (const n of allSylNames()) { const r = await sGet(kRosterFor(c, n)); if (r != null && r !== '') { any = true; break; } }
        if (!any) {
          const h = (plan && plan.sylName) || DEFAULT_SYL_NAME;
          /* placeholder names only — this repository is public */
          await sSet(kRosterFor(c, h), JSON.stringify(['STUDENT A', 'STUDENT B']));
        }
      }
      await sSet(kRosterMig(c), '1'); return;
    }
    let old = []; try { old = JSON.parse(rr) || []; } catch (_) { old = []; }
    const names = allSylNames();
    const home = (plan && plan.sylName && names.includes(plan.sylName)) ? plan.sylName : (names[0] || DEFAULT_SYL_NAME);
    const per = {}; names.forEach(n => per[n] = []); if (!per[home]) per[home] = [];
    for (const st of old) {
      let placed = false;
      for (const n of names) {
        const m = await sGet(kMarksFor(c, n, st));
        if (m && m !== '' && m !== '{}') { per[n].push(st); placed = true; }
      }
      if (!placed) per[home].push(st);
    }
    for (const n in per) {
      if (!per[n].length) continue;
      const cur = await sGet(kRosterFor(c, n));
      if (cur == null || cur === '' || cur === '[]') await sSet(kRosterFor(c, n), JSON.stringify(per[n]));
    }
    await sSet(kRosterMig(c), '1');
  } catch (_) {}
}
const has = (o, k) => Object.prototype.hasOwnProperty.call(o, k);
/* EVERY syllabus the STORE knows this course has — never the list this boot
   happens to have loaded, and never the list the hidden pref happens to show.
   Two holes it closes, both of which would leave a roster sitting in names
   while the course was flagged converted, which is the one way this migration
   can lose somebody: migrateAllCourses runs at init BEFORE any course is
   opened, so CUSTOMS is still empty and a duplicated chart's crew would be
   skipped; and allSylNames() drops a HIDDEN built-in, whose crew are still
   real. So: the built-ins unfiltered, the global custom store, both legacy
   per-course custom stores, whatever is already in memory, and the course's
   own plan — its current syllabus and the pre-rename name its marks may still
   be filed under. The same unfiltered union removeStudentNow and renCourse
   already walk, plus the store reads that make it independent of boot order. */
async function storeSylNames(c) {
  const out = new Set(SYL_NAMES);
  for (const k of [kSyls(c), kSylsOwn(c), kSylsOldMaster()])
    for (const n of Object.keys(sParse(await sGet(k), {}, 'object'))) out.add(n);
  for (const n of Object.keys(CUSTOMS || {})) out.add(n);
  const p = sParse(await sGet(kPlan(c)), {}, 'object');
  if (p.sylName) out.add(p.sylName);
  if (p.__oldSyl) out.add(p.__oldSyl);
  return [...out];
}
/* Name keys → enrolment ids, once per course (stable ids, 10 Sep 26).
   sSet swallows a failed write (it only shows "local only"), so this cannot
   trust a write it did not read back, and it cannot write the roster — the
   index every reader keys off — before the records it points at: an
   interrupted run that had converted the roster first would hide marks still
   filed under the name, and a retry keyed off the roster shape would never
   look for them. So: the mapping is derived from EVERY roster first (an
   entry lends its id — the name on it is the way back to a record still
   under the name — a string mints one); each record moves under its id and
   is read back before the legacy key goes; the roster is written LAST and
   read back; the flag is set only when everything verified. Any failure
   leaves the flag unset and the legacy keys in place, and the next load
   finishes the job — the same routine, idempotent. */
async function migrateIds(c) {
  try {
    if (await sGet(kIdMig(c))) return;
    /* The per-syllabus roster SPLIT has to have happened first. migrateRosters
       writes name rosters (it splits the pre-syllabus flat one, and it seeds
       the demo pair), and it needs the course's own plan — so it runs when the
       course is opened, not here. Flagging a course done before it ran would
       leave those names unconverted for good, which is the one way this
       migration could lose someone's marks. Such a course converts on its
       FIRST OPEN, which is where migrateRosters runs; until then its crew are
       still under the pre-syllabus flat roster key, so an export carries no
       roster for it — exactly as it did before this change — and a rename
       carries its records by name (moveSylData and renCourse both read that
       flat key and both carry a bare string). */
    if (!(await sGet(kRosterMig(c)))) return;
    const syls = await storeSylNames(c), ids = Object.create(null), rosters = {};
    for (const n of syls) { rosters[n] = sParse(await sGet(kRosterFor(c, n)), [], 'array'); for (const e of rosters[n]) if (isEntry(e) && !has(ids, e.name)) ids[e.name] = e.id; }
    const names = new Set();
    for (const n of syls) for (const e of rosters[n]) { if (typeof e === 'string' && e) names.add(e); else if (isEntry(e)) names.add(e.name); }
    if (![...names].length) { await sSet(kIdMig(c), '1'); await delKey(kIdMap(c)); return; }
    /* A RUN THAT STOPS HALF-WAY HAS TO RESUME WITH THE SAME IDS. The records
       move before the roster is written (see above — a roster written first
       would show entries whose marks are still filed under the name), so an
       interrupted run leaves records under ids that no roster names. A retry
       that minted fresh ones would look for those records under the NAME,
       find nothing, and write a roster pointing at empty keys: the marks
       already moved would be stranded for good, which is the one loss this
       whole routine exists to prevent. So the mapping is written down FIRST
       and read back — nothing moves until it is durable — and the next
       attempt reuses it. It goes when the flag goes in. */
    const saved = sParse(await sGet(kIdMap(c)), {}, 'object');
    for (const nm of names) if (!has(ids, nm) && has(saved, nm) && typeof saved[nm] === 'string' && saved[nm]) ids[nm] = saved[nm];
    for (const nm of names) if (!has(ids, nm)) ids[nm] = mintId();
    /* Object.create(null) for the same reason ids.js uses it: a student
       literally named "__proto__" must land as a data key, not as a silent
       call to the inherited setter. JSON.parse gives `saved` own keys too. */
    const map = Object.create(null); for (const nm of names) map[nm] = ids[nm];
    const mapStr = JSON.stringify(map);
    if ((await sGet(kIdMap(c))) !== mapStr) { await sSet(kIdMap(c), mapStr); if ((await sGet(kIdMap(c))) !== mapStr) return; }
    const links = sParse(await sGet(kLinks), {}, 'object')[c] || null;
    /* move one record: absent → nothing to do; present → write under the id
       (unless the id already holds it — a retry), read back, only then delete.
       An empty string reads as ABSENT on both sides, because that is what
       delKey writes when the store has no delete of its own (a browser with
       localStorage switched off): treating a tombstone as a value would skip
       the write here and lose the record, and would fail the read-back below
       so the flag never got set. */
    const moved = async (from, to) => {
      const v = await sGet(from); if (v == null || v === '') return true;
      const cur = await sGet(to);
      if (cur == null || cur === '') { await sSet(to, v); if ((await sGet(to)) !== v) return false; }
      await delKey(from); const back = await sGet(from); return back == null || back === '';
    };
    let ok = true;
    for (const n of syls) for (const nm of names) {
      ok = (await moved(kMarksFor(c, n, nm), kMarksFor(c, n, ids[nm]))) && ok;
      ok = (await moved(kDatesFor(c, n, nm), kDatesFor(c, n, ids[nm]))) && ok;
    }
    for (const nm of names) for (const k of [kLulls, kPace, kLast, kDatesOld]) ok = (await moved(k(c, nm), k(c, ids[nm]))) && ok;
    if (!ok) return;
    for (const n of syls) {
      const r = rosters[n]; if (!r.length || r.every(isEntry)) continue;
      const out = r.map(e => isEntry(e) ? e : (typeof e === 'string' && e ? Object.assign({ id: ids[e], name: e }, (links && has(links, e) && typeof links[e] === 'string' && links[e]) ? { pid: links[e] } : {}) : null)).filter(Boolean);
      await sSet(kRosterFor(c, n), JSON.stringify(out));
      if ((await sGet(kRosterFor(c, n))) !== JSON.stringify(out)) return;
    }
    const ls = await sGet(kLastStudent(c)); if (ls && has(ids, ls)) await sSet(kLastStudent(c), ids[ls]);
    const lc = prefGet('lastCrew:' + c); if (lc && has(ids, lc)) prefSet('lastCrew:' + c, ids[lc]);
    if (links) { const all = sParse(await sGet(kLinks), {}, 'object'); delete all[c]; if (Object.keys(all).length) await sSet(kLinks, JSON.stringify(all)); else await delKey(kLinks); }
    await sSet(kIdMig(c), '1');
    await delKey(kIdMap(c));   /* the run is over; the scratch mapping has no reader left */
  } catch (_) {}
}
/* THE FAIL-CLOSED BOOT (stable ids 1B-i, 13 Sep 26; review CSID-04/R2-03/R3-02).
   If migrateCourseIds cannot finish, the app must not run half-converted: init
   sets bootError, does NOT loadCourse and does NOT set `ready`, and App renders a
   "couldn't finish upgrading — reload" panel with no board and no writers. The
   error MUST go through setBootError so it NOTIFIES the store subscription —
   assigning the field alone would leave App on its loading state forever
   (App subscribes to getVersion, which only changes on notify). */
export let bootError = null;
function setBootError(msg) { bootError = msg; notify(); }
/* test-support: the fail-closed boot error is only ever cleared by a reload in
   production; the tracker suite clears it between fixtures so one fail-closed
   pin does not leave the App gated for the next test */
export function clearBootError() { bootError = null; }

/* Course NAMES → course IDS, once per browser (mirror of migrateIds for
   enrolments). Every per-course storage key embeds the course name in its 2nd
   segment; this re-bases them all onto a minted id so a rename moves nothing.
   Resumable and read-back-verified with the SAME discipline as migrateIds:
   derive the name → id map and write it down FIRST (durably, read back) so an
   interrupted run resumes with the same ids; move each key and read it back
   before deleting the source; write the COURSES index LAST and read it back; set
   the one-shot flag only when everything verified. Any failure leaves the flag
   unset and the old keys in place, and the next boot finishes the job.

   The course name sits in the MIDDLE of composite keys
   (v3:<name>:<syl>:m:<student>), so enumerating per-record keys would need every
   syllabus and student reconstructed before the enrolment migration has run and
   could MISS one. It moves by KEY PREFIX via storage.list() instead — every key
   whose 2nd colon-bounded segment equals the course name, plus the legacy
   own-layout keys v3:lay:<name>:* — which cannot miss a key. Over-matching is
   bounded by an EXPLICIT reserved-namespace skiplist and a fail-closed preflight
   that refuses a legacy course whose name is reserved or carries a colon (review
   CSID-08 / R2-01 / R2-02) — either would make the 2nd-segment match ambiguous.

   Durability (review CSID-01/02): the read-back reads the in-memory whiteboard,
   not the backend (adapters → whiteboard → async Postman), exactly as migrateIds
   does — it proves the whiteboard write and gives resumability, not backend
   durability, which is the DB step's job ([TRK-DISK]). Two concurrent tabs are
   un-serialised, as migrateIds is; cross-tab safety is also the DB step. */
const RESERVED_KEY_SEG = new Set(['courses', 'links', 'master', 'lay', 'SYLLABUS EDIT']);
export async function migrateCourseIds() {
  try {
    const raw = sParse(await sGet(kCourses), [DEFAULT_COURSE_NAME], 'array').filter(c => !isRetiredCourse(c));
    const list = raw.length ? raw : [DEFAULT_COURSE_NAME];
    /* Done already — UNLESS a stray bare-string course slipped into the index
       after the flag was set (a hand-edited store, or a future cross-device sync
       from an unmigrated browser): convert it too, rather than leave an un-id'd
       course that every id reader would address as v3:undefined:... (Fable F3).
       The resumable body below mints/reuses its id and prefix-moves its keys. */
    if ((await sGet(kCourseIdMig)) && list.every(isCourseEntry)) return true;
    /* PREFLIGHT — a reserved or colon-bearing legacy name would make the
       2nd-segment prefix match ambiguous (sweep a global, or split at the wrong
       colon), and an entry that already carries a non-minted id would file under
       an unsafe segment. Fail closed: move nothing, stamp nothing. */
    for (const c of list) {
      const nm = isCourseEntry(c) ? c.name : c;
      if (typeof nm !== 'string' || nm === '') { setBootError('A course in your saved Tracker data has no name, so it could not finish upgrading. Reload to try again.'); return false; }
      if (nm.includes(':')) { setBootError('A course named “' + nm + '” contains a colon, which the Tracker can no longer file, so it could not finish upgrading. Reload to try again.'); return false; }
      if (isReservedCourseName(nm)) { setBootError('A course named “' + nm + '” clashes with a name the Tracker reserves, so it could not finish upgrading. Reload to try again.'); return false; }
      if (isCourseEntry(c) && !isCourseId(c.id)) { setBootError('A course in your saved Tracker data has an invalid id, so it could not finish upgrading. Reload to try again.'); return false; }
    }
    /* derive name → id: an entry lends its id (a resumed/partly-done store);
       reuse the durable scratch map on a retry; a bare-string course mints one */
    const saved = sParse(await sGet(kCourseIdMap), {}, 'object');
    const idByName = Object.create(null);
    for (const c of list) if (isCourseEntry(c)) idByName[c.name] = c.id;
    for (const c of list) { const nm = isCourseEntry(c) ? c.name : c; if (!has(idByName, nm)) idByName[nm] = (has(saved, nm) && isCourseId(saved[nm])) ? saved[nm] : mintCourseId(); }
    /* write the map down FIRST and read it back — nothing moves until it is
       durable, and the next attempt reuses it (mirror migrateIds' kIdMap) */
    const map = Object.create(null); for (const c of list) { const nm = isCourseEntry(c) ? c.name : c; map[nm] = idByName[nm]; }
    const mapStr = JSON.stringify(map);
    if ((await sGet(kCourseIdMap)) !== mapStr) { await sSet(kCourseIdMap, mapStr); if ((await sGet(kCourseIdMap)) !== mapStr) return false; }
    /* move one key: absent/empty → nothing; else write dest (unless it already
       holds it — a retry), read back, only then delete source (mirror migrateIds
       moved()). An empty string reads as absent (the delKey tombstone). */
    const moved = async (from, to) => {
      const v = await sGet(from); if (v == null || v === '') return true;
      const cur = await sGet(to);
      if (cur == null || cur === '') { await sSet(to, v); if ((await sGet(to)) !== v) return false; }
      await delKey(from); const back = await sGet(from); return back == null || back === '';
    };
    let ok = true;
    const all = (await storage.list()).keys || [];
    for (const k of all) {
      if (!k.startsWith('v3:')) continue;
      const rest = k.slice(3), ci = rest.indexOf(':'); if (ci <= 0) continue;
      const seg = rest.slice(0, ci);
      if (RESERVED_KEY_SEG.has(seg)) {
        /* legacy own-layout keys carry the course at the 3rd segment
           (v3:lay:<course>:<syl>) — move those, skip every other global */
        if (seg === 'lay') {
          const after = rest.slice(ci + 1), ci2 = after.indexOf(':');
          if (ci2 > 0) { const cn = after.slice(0, ci2); if (has(idByName, cn) && idByName[cn] !== cn) ok = (await moved(k, 'v3:lay:' + idByName[cn] + ':' + after.slice(ci2 + 1))) && ok; }
        }
        continue;
      }
      if (has(idByName, seg) && idByName[seg] !== seg) ok = (await moved(k, 'v3:' + idByName[seg] + ':' + rest.slice(ci + 1))) && ok;
    }
    /* per-browser prefs (localStorage, not the seam): last-crew per course */
    for (const c of list) { const nm = isCourseEntry(c) ? c.name : c, id = idByName[nm]; if (id === nm) continue; const lc = prefGet('lastCrew:' + nm); if (lc != null) prefSet('lastCrew:' + id, lc); }
    /* v3:links payload is keyed by course NAME (review CSID-03): rewrite its
       top-level keys name → id so the enrolment migration and collect/apply find
       each course's person links under the id. */
    {
      const linksRaw = await sGet(kLinks);
      if (linksRaw != null && linksRaw !== '') {
        const lk = sParse(linksRaw, null, 'object');
        if (lk && typeof lk === 'object') {
          const out = Object.create(null); let changed = false;
          for (const nm of Object.keys(lk)) { const id = has(idByName, nm) ? idByName[nm] : nm; out[id] = lk[nm]; if (id !== nm) changed = true; }
          if (changed) { const s = JSON.stringify(out); await sSet(kLinks, s); if ((await sGet(kLinks)) !== s) ok = false; }
        }
      }
    }
    if (!ok) return false;
    const lastC = prefGet('lastCourse'); if (lastC != null && has(idByName, lastC)) prefSet('lastCourse', idByName[lastC]);
    /* write the index LAST and read it back — every reader keys off it */
    const entries = list.map(c => { const nm = isCourseEntry(c) ? c.name : c; return { id: idByName[nm], name: nm }; });
    const entStr = JSON.stringify(entries);
    await sSet(kCourses, entStr); if ((await sGet(kCourses)) !== entStr) return false;
    COURSES = entries;
    await sSet(kCourseIdMig, '1');
    await delKey(kCourseIdMap);
    return true;
  } catch (err) {
    try { setBootError('The Tracker could not finish upgrading your data. Reload to try again.'); } catch (_) {}
    return false;
  }
}
/* every course, at init (review finding 3): an export or a global syllabus
   rename must never meet a course nobody has opened since the upgrade */
export async function migrateAllCourses() { for (const c of COURSES) await migrateIds(isCourseEntry(c) ? c.id : c); }
/* One course as the file-shaped block { plan, bySyllabus: { syl: { roster,
   marks, dates } }, lulls, pace } — collectStudents and migrateIds read it,
   applyStudents writes it. `withNames` also returns every name still sitting
   on a roster as a bare string, for a caller that has to reach a record filed
   under the name rather than under an id. */
async function readCourseBlock(c, withNames) {
  const bySyllabus = {}, names = new Set();
  /* The store's whole list, so a hidden chart or one this boot has not loaded
     still exports its crew — put in display order where the display has an
     opinion, and the rest after. */
  const all = await storeSylNames(c);
  const ranked = orderedSylNames().filter(n => all.includes(n));
  for (const n of [...ranked, ...all.filter(n => !ranked.includes(n))]) {
    const roster = sParse(await sGet(kRosterFor(c, n)), [], 'array');
    if (!roster.length) continue;
    const marks = {}, dates = {};
    for (const e of roster) {
      const s = isEntry(e) ? e.id : (typeof e === 'string' ? e : null); if (!s) continue;
      if (typeof e === 'string') names.add(e);
      const m = await sGet(kMarksFor(c, n, s)); if (m) { try { marks[s] = JSON.parse(m); } catch (_) {} }
      const d = await sGet(kDatesFor(c, n, s)); if (d) { try { dates[s] = JSON.parse(d); } catch (_) {} }
    }
    bySyllabus[n] = { roster, marks, dates };
  }
  let plan = {}; try { const p = await sGet(kPlan(c)); if (p) plan = JSON.parse(p); } catch (_) {}
  const lulls = {}, pace = {};
  for (const n in bySyllabus) for (const e of bySyllabus[n].roster) {
    const s = isEntry(e) ? e.id : e; if (lulls[s] || pace[s]) continue;
    const l = await sGet(kLulls(c, s)); if (l) { try { lulls[s] = JSON.parse(l); } catch (_) {} }
    const pc = await sGet(kPace(c, s)); if (pc) { try { pace[s] = JSON.parse(pc); } catch (_) {} }
  }
  return { block: { plan, lulls, pace, bySyllabus }, names: withNames ? [...names] : [] };
}
async function writeCourseBlock(c, block) {
  if (block.plan && Object.keys(block.plan).length) await sSet(kPlan(c), JSON.stringify(block.plan));
  for (const s in (block.lulls || {})) await sSet(kLulls(c, s), JSON.stringify(block.lulls[s]));
  for (const s in (block.pace || {})) await sSet(kPace(c, s), JSON.stringify(block.pace[s]));
  for (const n in (block.bySyllabus || {})) {
    const b = block.bySyllabus[n];
    await sSet(kRosterFor(c, n), JSON.stringify(b.roster || []));
    for (const s in (b.marks || {})) await sSet(kMarksFor(c, n, s), JSON.stringify(b.marks[s]));
    for (const s in (b.dates || {})) await sSet(kDatesFor(c, n, s), JSON.stringify(b.dates[s]));
  }
}
/* restoreLastSyllabus is OFF by default and ON only from init(). loadCourse
   also runs when the user picks a syllabus themselves, and restoring there
   overwrote their choice the instant they made it — so on any course where
   something had been marked, the syllabus could not be changed at all. */
export function loadCourse(c, restoreLastSyllabus = false) { return onChain(() => loadCourseNow(c, restoreLastSyllabus)); }
async function loadCourseNow(c, restoreLastSyllabus) {
  loading = true;
  course = c;
  /* One site covers init, switchCourse, addCourse, renCourse and delCourse.
     Raw and synchronous, so unlike sSet it never flickers the save status. */
  prefSet('lastCourse', c);
  /* A ring left over from another syllabus would re-light the moment the user
     came back to it. Cleared without redrawing: every caller renders anyway. */
  searchHit = null; searchQ = ''; searchCount = 0; searchAt = 0; searchHits = [];
  /* History belongs to the chart it was recorded on. Switching COURSE never
     went through clearDirty, so an Undo pressed afterwards stamped the old
     course's chart onto the new one's syllabus and saved it immediately. */
  undoStack = []; redoStack = [];
  const pr = await sGet(kPlan(c)); plan = sParse(pr, null, 'object') || { lulls: [], mode: 'pace', epw: 2, target: null, sylName: DEFAULT_SYL_NAME, custom: false };
  if (!plan.sylName) plan.sylName = DEFAULT_SYL_NAME;
  const cs = await sGet(kSyls(c)); CUSTOMS = sParse(cs, {}, 'object');
  { /* adopt custom syllabi stored before syllabi went global */
    let added = false;
    for (const key of [kSylsOldMaster(), kSylsOwn(c)]) {
      const raw = await sGet(key); if (!raw) continue;
      const L = sParse(raw, null, 'object'); if (!L) continue;
      for (const k in L) { if (!CUSTOMS[k] && !isHidden(k) && !SYL_TOMB[k]) { CUSTOMS[k] = L[k]; added = true; } }
    }
    if (added) await sSet(kSyls(c), JSON.stringify(CUSTOMS));
  }
  /* legacy: single edited syllabus stored under kSyl -> import into named customs */
  if (plan.custom) {
    const sr = await sGet(kSyl(c));
    if (sr) {
      const nm = (SYL_RENAME[plan.sylName] || plan.sylName) + ' (edited)';
      const legacy = sParse(sr, null);
      if (legacy && !CUSTOMS[nm] && !isHidden(nm) && !SYL_TOMB[nm]) CUSTOMS[nm] = legacy;
      await sSet(kSyls(c), JSON.stringify(CUSTOMS)); plan.sylName = nm;
    }
    plan.custom = false; await savePlan();
  }
  /* rename migration: legacy syllabus names -> 2026 */
  if (SYL_RENAME[plan.sylName]) { plan.__oldSyl = plan.sylName; plan.sylName = SYL_RENAME[plan.sylName]; await savePlan(); }
  /* Open on whatever was last marked. Done here, before the roster and layout
     load, so it costs no second pass and writes nothing. Only when the app is
     starting: everywhere else the caller has already decided the syllabus. */
  const __lastS = await sGet(kLastStudent(c));
  if (__lastS && restoreLastSyllabus) {
    try {
      const rec = JSON.parse(await sGet(kLast(c, __lastS)) || 'null');
      if (rec && rec.syl && sylSource(rec.syl)) plan.sylName = rec.syl;
    } catch (_) {}
  }
  let __src = sylSource(plan.sylName);
  if (!__src) { /* named syllabus vanished -> fall back cleanly */
    plan.sylName = firstSylName();
    await savePlan(); __src = sylSource(plan.sylName) || DEFAULT_SYLLABUS;
  }
  /* With no charts shipped in the code and none opened yet, DEFAULT_SYLLABUS is
     undefined and JSON.parse(JSON.stringify(undefined)) throws, which aborted
     loadCourse half-way and left the app looking broken. An empty board is the
     correct state here: the user has simply not opened their file yet. */
  SYL = __src ? JSON.parse(JSON.stringify(__src)) : [];
  byid = {}; SYL.forEach(e => byid[e.id] = e);
  await migrateRosters(c);
  await migrateIds(c);
  /* ONE RETRY ON THIS SAME LOAD. A conversion that stopped half-way is not a
     state to sit in: the roster below keeps only entries, so the course comes
     up EMPTY, and an empty crew list is exactly what invites the write that
     destroys it (see rosterHeld). A second attempt costs one pass and usually
     succeeds — the first failure is normally a single refused write. */
  if (!(await sGet(kIdMig(c)))) await migrateIds(c);
  const rr = await sGet(kRosterFor(c, plan.sylName));
  /* Only entries: a string here means the migration above could not finish
     (a write that did not land), and half a converted roster on screen is
     worse than none — the next load retries the whole thing. */
  roster = sParse(rr, [], 'array').filter(isEntry);
  /* AND THE ROSTER IS READ-ONLY UNTIL IT DOES FINISH. The course showing empty
     was the trap: the first + Add called saveRoster, which writes whatever is
     on screen — one entry — over a roster still holding everybody's NAMES. The
     names would then be on no roster at all, so the next migrateIds would not
     know them, would not carry their records, and would not even keep them in
     its id map: marks half under names and half under ids, orphaned for good.
     So while the flag is unset every roster write is refused, with a message,
     and the block lifts by itself on the load that converts the course.
     The flag alone is the condition, which holds the course read-only in one
     case where the data is actually fine — every record moved and every roster
     written, and only the final flag write refused — and that is the right way
     round: the next load re-runs a conversion that has nothing left to do, the
     flag lands, and the block lifts. It fails safe and it self-heals. */
  rosterHeld = !(await sGet(kIdMig(c)));
  /* Read the last-graded student AGAIN, because migrateIds has just rewritten
     that key from a name to an id. The copy taken further up is the one the
     syllabus restore needed — it had to be the NAME, since that is what the
     record was still filed under at the time — but using it here would miss
     every id on the roster on the ONE load that converts a course, and the
     trainer would open on whoever happens to be first instead of the person
     last marked. Every later load reads the same value either way. */
  const __lastS2 = await sGet(kLastStudent(c));
  /* Your own last pick first, then the last person anyone GRADED on this course
     (kLastStudent), then whoever is at the top. The roster is per syllabus, so
     the membership guard quietly handles remembering someone who is not on the
     syllabus being opened. */
  const __myS = prefGet('lastCrew:' + c);
  const onRoster = id => !!id && roster.some(r => r.id === id);
  active = onRoster(__myS) ? __myS : (onRoster(__lastS2) ? __lastS2 : (roster[0] ? roster[0].id : null));
  await loadLayout();
  await loadStudent();
  /* one-time marks + layout migration from the old syllabus name */
  if (plan.__oldSyl) {
    const ids = new Set(SYL.map(e => e.id));
    for (const { id: s } of roster) {
      if (Object.keys(marks[s] || {}).length === 0) {
        const om = await sGet(kMarksFor(course, plan.__oldSyl, s));
        if (om) { marks[s] = translateMarks(JSON.parse(om), ids); await saveMarks(s); }
      }
    }
    if (!Object.keys(layout).length) {
      const ol = await sGet(kLayoutFor(course, plan.__oldSyl));
      if (ol) {
        const l = JSON.parse(ol); const nl = {};
        for (const k in l) { const nk = ids.has(k) ? k : padId(k); if (ids.has(nk)) nl[nk] = l[k]; }
        layout = nl; await saveLayout();
      }
    }
    delete plan.__oldSyl; await savePlan();
  }
  /* self-heal: a custom syllabus whose stored layout doesn't cover its events */
  if (SYL.length && !DEFAULT_LAYOUTS[plan.sylName]) {
    const bd = bestDefaultLayout();
    if (bd && layoutNodeCount(layout) < SYL.length) {
      layout = await snapshotLayout(plan.sylName);
      await saveLayout();
    }
  }
  loading = false;
}
/* Every write of the user's own work goes through one of the functions below,
   straight into the store — marking an event, a date, a pace, a lull, a student.
   Until 9 Sep 26 each also flagged the user's FILE as unsaved (`touched()`), so
   the Save button lit for a mark; the store is the record now (owner: "I thought
   it should be auto synced"), so a mark is saved the moment it lands and nothing
   here lights a button. Only flow edits (markDirty) still wait for Save. */
async function saveSyl() { await sSet(kSyl(course), JSON.stringify(SYL)); }
/* The crew list of a course whose name → id conversion has not finished is
   READ-ONLY (loadCourseNow sets the flag and says why). This is the write
   path, so the guard sits here as well as at the three commands that reach
   it — a new caller cannot get past it by accident. */
export let rosterHeld = false;
const HELD_MSG = 'The crew list for this course is still being moved to the new student records, so it cannot be changed yet. Nothing has been lost — reload the page and it will finish, then try again.';
async function saveRoster() { if (rosterHeld) return; await sSet(kRosterFor(course, plan.sylName), JSON.stringify(roster)); }
async function savePlan() { await sSet(kPlan(course), JSON.stringify(plan)); }
async function loadStudent() {
  marks = {}; dates = {}; lulls = {}; lastEdit = {}; pace = {};
  for (const { id: s } of roster) {
    const m = await sGet(kMarks(course, s)); marks[s] = sParse(m, {}, 'object');
    let d = await sGet(kDates(course, s));
    if (d == null || d === '') { const od = await sGet(kDatesOld(course, s)); if (od) { d = od; await sSet(kDates(course, s), od); } }
    dates[s] = sParse(d, null, 'object') || { lastSyll: null, lastCurr: null };
    /* Everyone inherits a copy of the old course-wide set the first time. The
       original is left in plan.lulls, unread, so an older saved file migrates
       exactly the same way when it is opened. */
    try { lastEdit[s] = JSON.parse(await sGet(kLast(course, s)) || 'null') || null; } catch (_) { lastEdit[s] = null; }
    /* Everyone inherits the old course-wide pace and end dates the first time.
       plan.epw / plan.target / plan.target2 are left in place, unread, so an
       older saved file migrates the same way when it is opened. */
    let pr = null;
    try { pr = JSON.parse(await sGet(kPace(course, s)) || 'null'); } catch (_) {}
    pace[s] = pr || { epw: plan.epw ?? 2, target: plan.target ?? null, target2: plan.target2 ?? null };
    const l = await sGet(kLulls(course, s));
    if (l == null || l === '') lulls[s] = (plan.lulls || []).map(x => ({ start: x.start, end: x.end }));
    else { try { lulls[s] = JSON.parse(l); } catch (_) { lulls[s] = []; } }
  }
}
async function saveLulls(s) { await sSet(kLulls(course, s), JSON.stringify(lulls[s] || [])); }
async function savePace(s) { await sSet(kPace(course, s), JSON.stringify(pace[s] || {})); }
/* Always a shape, even for a student added since load. */
export function paceOf(s) { return (pace && pace[s]) || { epw: 2, target: null, target2: null }; }
/* The box holds whatever the user is part-way through typing, so the maths needs
   its own reading. Clearing it to type a new number used to snap it back to 2. */
export function epwOf(s) { const n = parseFloat(paceOf(s).epw); return n > 0 ? n : 2; }
async function saveMarks(s) { await sSet(kMarks(course, s), JSON.stringify(marks[s])); }
async function saveDates(s) { await sSet(kDates(course, s), JSON.stringify(dates[s])); }

/* ---------- in-page dialogs (promise-based, rendered by <DlgModal/>) ---------- */
export let dlg = null; export let dlgSerial = 0;
let _dlgRes = null;
/* `list` + `filter` (9 Sep 26): a searchable list of { key, label, sub }
   drawn ABOVE the text box; a click on an entry resolves { pick: key }, OK
   still resolves the typed text. Without a list the dialog is the old prompt
   to the byte — the extra fields are null/false/'' and DlgModal draws nothing
   for them. */
function _dlgShow(msg, { input = false, def = '', cancel = true, ok = 'OK', alt = null, list = null, filter = false, placeholder = '', listTitle = '' } = {}) {
  return new Promise(res => {
    _dlgRes = res;
    dlg = { msg, input, def, cancel, ok, alt, list, filter, placeholder, listTitle };
    dlgSerial++;
    notify();
  });
}
export function dlgClose(val) {
  dlg = null;
  const r = _dlgRes; _dlgRes = null; notify(); if (r) r(val);
}
export async function uiConfirm(msg) { return await _dlgShow(msg); }
export async function uiPrompt(msg, def) { const v = await _dlgShow(msg, { input: true, def }); return v === null ? null : (v + ''); }
export async function uiAlert(msg) { await _dlgShow(msg, { cancel: false }); }
/* Pick from a list, or type: resolves { pick: key } for a click on an entry,
   the typed string for OK, null for Cancel. */
export async function uiPick(msg, list, { input = false, placeholder = '', listTitle = '' } = {}) {
  const v = await _dlgShow(msg, { input, list: list || [], filter: true, placeholder, listTitle });
  if (v && typeof v === 'object' && 'pick' in v) return v;
  return v === null ? null : (v + '');
}
/* Three-way ask: returns 'ok', 'alt' or 'cancel'. */
export async function uiChoice(msg, okLabel, altLabel) {
  const r = await _dlgShow(msg, { ok: okLabel, alt: altLabel });
  return r === '__alt__' ? 'alt' : (r === true ? 'ok' : 'cancel');
}

/* ---------- helpers ---------- */
export const gradeOf = (s, id) => (marks[s] && marks[s][id] && marks[s][id].g) || 0;
export const failOf = (s, id) => (marks[s] && marks[s][id] && marks[s][id].f) || 0;
export const isDone = (s, id) => DONE.has(gradeOf(s, id));
/* Each failure carries the DAY it happened (owner, 9 Sep 26: "Failures will
   also track the date in which the student fails"). marks[s][id].fd holds one
   ISO date per failure, oldest first, so fd.length === f. A count recorded
   before dates existed — or read from a file of that time — is that many
   UNDATED failures: nulls here, never an invented day. `f` stays the count the
   ball's red ticks and the file check read. */
export function failDates(s, id) {
  const m = marks[s] && marks[s][id]; const n = (m && m.f) || 0;
  const fd = (m && Array.isArray(m.fd)) ? m.fd : [];
  const out = []; for (let i = 0; i < n; i++) out.push(fd[i] || null);
  return out;
}
/* The owner's notation (16 Aug; each failure its own entry, 9 Sep 26): the
   first failure is the plain code and every later one adds an X — ST-01,
   ST-01X, ST-01XX. `i` is the failure's index, oldest first. */
export function failLabel(id, i) { return id + 'X'.repeat(Math.max(0, i | 0)); }
/* Every failure one student has on this chart, in chart order then as recorded
   — the full lowdown behind the Failures title. */
export function failList(s) {
  const out = [];
  for (const e of [...SYL].sort((a, b) => a.seq - b.seq))
    failDates(s, e.id).forEach((d, i) => out.push({ id: e.id, i, label: failLabel(e.id, i), date: d }));
  return out;
}
/* The day an event was accomplished (owner, 9 Sep 26: "the details portion …
   will reflect the date accomplished automatically as the date updated. But
   the user can also manually change the date after"). Set when a grade lands,
   cleared with it, editable in the pop-up. */
export const doneDate = (s, id) => (marks[s] && marks[s][id] && marks[s][id].d) || null;
const ORD = n => n + (['th', 'st', 'nd', 'rd'][(n % 100 > 10 && n % 100 < 14) ? 0 : Math.min(n % 10, 4) % 4] || 'th');
export const ordinal = ORD;
/* One student's record on one event, for the details bubble — grade, the day it
   was done, and every failure with its day — so a hover in Details mode shows
   THIS student's data, not just the event's. Empty when nothing is marked. */
export function markHtml(s, id) {
  if (!s) return '';
  const g = gradeOf(s, id), gl = { dco: 'DCO', dpco: 'DPCO', marg: 'Marginal', na: 'N.A.' }[g];
  const fd = failDates(s, id);
  if (!gl && !fd.length) return '';
  const rows = [];
  if (gl) rows.push('<b>' + escapeId(nameOf(s)) + ':</b> ' + gl + (DONE.has(g) && doneDate(s, id) ? ' on ' + fmt(parseD(doneDate(s, id))) : ''));
  if (fd.length) rows.push('<b>Failed' + (gl ? '' : ' (' + escapeId(nameOf(s)) + ')') + ':</b> ' + fd.map((d, i) => escapeId(failLabel(id, i)) + ' ' + (d ? fmt(parseD(d)) : 'date not recorded')).join(' · '));
  return '<div class="mkrec">' + rows.join('<br>') + '</div>';
}
/* Escapes for both text and attribute contexts: the result is interpolated into
   attribute values (e.g. data-id="…"), so quotes must be escaped too or a name
   containing one breaks out and injects arbitrary attributes. */
export function escapeId(s) { return (s + '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;'); }

/* annulus sector path (deg, clockwise, y-down) */
function sector(cx, cy, rO, rI, a0, a1) {
  const rad = d => d * Math.PI / 180;
  const p = (r, a) => [cx + r * Math.cos(rad(a)), cy + r * Math.sin(rad(a))];
  if (Math.abs(a1 - a0) >= 359.9) { /* full ring (e.g. single student) -> proper annulus */
    const [ax, ay] = p(rO, 0), [bx, by] = p(rO, 180), [cxi, cyi] = p(rI, 0), [dxi, dyi] = p(rI, 180);
    return `M${ax.toFixed(2)} ${ay.toFixed(2)} A${rO} ${rO} 0 1 1 ${bx.toFixed(2)} ${by.toFixed(2)} A${rO} ${rO} 0 1 1 ${ax.toFixed(2)} ${ay.toFixed(2)} Z ` +
      `M${cxi.toFixed(2)} ${cyi.toFixed(2)} A${rI} ${rI} 0 1 0 ${dxi.toFixed(2)} ${dyi.toFixed(2)} A${rI} ${rI} 0 1 0 ${cxi.toFixed(2)} ${cyi.toFixed(2)} Z`;
  }
  const large = (a1 - a0) % 360 > 180 ? 1 : 0;
  const [o0x, o0y] = p(rO, a0), [o1x, o1y] = p(rO, a1), [i1x, i1y] = p(rI, a1), [i0x, i0y] = p(rI, a0);
  return `M${o0x.toFixed(2)} ${o0y.toFixed(2)} A${rO} ${rO} 0 ${large} 1 ${o1x.toFixed(2)} ${o1y.toFixed(2)} L${i1x.toFixed(2)} ${i1y.toFixed(2)} A${rI} ${rI} 0 ${large} 0 ${i0x.toFixed(2)} ${i0y.toFixed(2)} Z`;
}
/* student i wedge centred so student 0 is at TOP */
function wedge(i, n) { const step = 360 / n; const c = -90 + i * step; return [c - step / 2, c + step / 2]; }

export function isAvail(s, ev) { return !isDone(s, ev.id) && gradeOf(s, ev.id) !== 'na' && ev.prereqs.every(p => isDone(s, p) || gradeOf(s, p) === 'na' || !byid[p]); }
export function availableNow(s) { return SYL.filter(e => isAvail(s, e)).sort((a, b) => a.seq - b.seq); }

function trunc(s, n) { s = (s == null ? '' : '' + s); return s.length > n ? s.slice(0, n - 1) + '…' : s; }
function detScale() { return { sx: 1, sy: 1 }; }
function nodePos(id) {
  let b;
  if (layout[id]) b = layout[id];
  else { const dl = DEFAULT_LAYOUTS[curSyl()] || BORROW; b = (dl && dl[id]) ? dl[id] : (AUTO[id] || { x: 60, y: 60 }); }
  const sc = detScale();
  return (sc.sx === 1 && sc.sy === 1) ? b : { x: b.x * sc.sx, y: b.y * sc.sy };
}

/* Paper course-map shape language: rect=acad, hexagon=device, oval=sim,
   jet=flight, test=rect. */
function innerShape(type, cx, cy) {
  const f = TYPE_COLOR[type], st = 'stroke="#0007" stroke-width="0.8"';
  if (type === 'sim') return `<ellipse cx="${cx}" cy="${cy}" rx="18" ry="10.5" fill="${f}" ${st}/>`;
  if (type === 'device') {
    const pts = [[-18, 0], [-11, -9], [11, -9], [18, 0], [11, 9], [-11, 9]].map(q => (cx + q[0]) + ',' + (cy + q[1])).join(' ');
    return `<polygon points="${pts}" fill="${f}" ${st}/>`;
  }
  if (type === 'flight') {
    const pj = [[0, -16], [2.6, -6], [15, 1.5], [4, 5], [7.5, 13], [0, 9.5], [-7.5, 13], [-4, 5], [-15, 1.5], [-2.6, -6]]
      .map(q => (cx + q[0]) + ',' + (cy + q[1])).join(' ');
    return `<polygon points="${pj}" fill="${f}" ${st} stroke-linejoin="round"/>`;
  }
  /* acad + test: rectangle */
  return `<rect x="${cx - 16}" y="${cy - 9}" width="32" height="18" rx="2.5" fill="${f}" ${st}/>`;
}
function ballGroup(ev, available) {
  const p = nodePos(ev.id), size = 58, cx = size / 2, cy = size / 2, rO = size * 0.47, rI = size * 0.33, x = p.x, y = p.y;
  const n = Math.max(1, roster.length); let segs = '';
  for (let i = 0; i < n; i++) {
    const s = roster[i] ? roster[i].id : null; const g = gradeOf(s, ev.id);
    const fill = (g && g !== 'na' && g !== 0) ? GRADE_FILL[g] : (g === 'na' ? GRADE_FILL.na : '#ffffff');
    const [a0, a1] = wedge(i, n);
    /* Each wedge is a tap target of its own (ballTap): data-wi says whose. */
    segs += `<path class="wedge" data-wi="${i}" d="${sector(cx, cy, rO, rI, a0, a1)}" fill="${fill}" stroke="#111" stroke-width="0.8"/>`;
    /* No failure ticks on an event marked N.A. — it never had to be flown, so
       red marks against it read as a contradiction. The count is only hidden,
       not thrown away; it comes back if the grade does. */
    const f = (g === 'na') ? 0 : failOf(s, ev.id);
    if (f > 0) {
      const shown = Math.min(f, 6); const span = Math.abs(a1 - a0); const gap = Math.min(9, span / (shown + 1)); const mid = (a0 + a1) / 2; const first = mid - (shown - 1) / 2 * gap;
      for (let t = 0; t < shown; t++) {
        const ang = first + t * gap, rad = ang * Math.PI / 180;
        const x1 = cx + rO * 0.80 * Math.cos(rad), y1 = cy + rO * 0.80 * Math.sin(rad), x2 = cx + (rO + 3) * Math.cos(rad), y2 = cy + (rO + 3) * Math.sin(rad);
        segs += `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="#ff2b2b" stroke-width="2.2" stroke-linecap="round"/>`;
      }
    }
  }
  /* The selected crew's wedge wears a cyan edge on EVERY ball (owner, 9 Sep 26
     — picked "cyan edge only" over a fill, so a DCO/DPCO colour is never
     hidden; the same cyan the key ball uses). Drawn after the wedges so it
     sits above its neighbours' black outlines; no hit of its own. */
  const ai = roster.findIndex(r => r.id === active);
  if (ai >= 0) { const [a0, a1] = wedge(ai, n); segs += `<path class="mine" data-wi="${ai}" d="${sector(cx, cy, rO, rI, a0, a1)}" fill="none" stroke="#36c2ff" stroke-width="2.4" stroke-linejoin="round" pointer-events="none"/>`; }
  const dark = DARKC.has(ev.type) ? 'lbl' : 'lbl lbll';
  let hl = available ? `<circle cx="${cx}" cy="${cy}" r="${rO + 3}" fill="none" stroke="#ffd23f" stroke-width="2.6" class="avail"/>` : '';
  /* The search ring sits at rO+8. Its inner edge is 34.06, clear of the yellow
     available ring's outer edge even when svg.perf fattens that to 31.96, so
     the two can never touch or be read as one mark. */
  if (searchHit === ev.id) hl += `<circle cx="${cx}" cy="${cy}" r="${rO + 8}" fill="none" stroke="#00e5c8" stroke-width="2.4" class="found"/>`;
  if (arrangeMode && connectSrc === ev.id) hl += `<circle cx="${cx}" cy="${cy}" r="${rO + 5}" fill="none" stroke="#36c2ff" stroke-width="3"/>`;
  if (arrangeMode && selBalls.has(ev.id)) hl += `<circle cx="${cx}" cy="${cy}" r="${rO + 5}" fill="none" stroke="#36c2ff" stroke-width="1.6" stroke-dasharray="3 2"/>`;
  const num = (ev.num != null && ev.num !== '') ? `<circle cx="${size - 5}" cy="5" r="8.5" class="numbg"/><text class="numbadge" x="${size - 5}" y="8" text-anchor="middle">${escapeId(ev.num)}</text>` : '';
  const label = escapeId(ev.label || ev.id);
  let cap = '';
  /* one invisible disc so the whole ball hit-tests as a single shape — without it the
     gap between the wedge ring and the inner icon fires pointerleave/enter as you cross it */
  const hit = `<circle cx="${cx}" cy="${cy}" r="${(rO + 1).toFixed(2)}" fill="none" pointer-events="all"/>`;
  return `<g class="ball" data-id="${escapeId(ev.id)}" transform="translate(${(x - cx).toFixed(1)},${(y - cy).toFixed(1)})">
  ${hit}${hl}${segs}<g class="core">${innerShape(ev.type, cx, cy)}
  <text class="${dark}" x="${cx}" y="${cy + 3}" text-anchor="middle" style="font-size:${ballFontFor(ev.id)}px">${label}</text></g>${num}${cap}</g>`;
}

/* Continuous top-to-bottom flow following the real prerequisite graph. */
function computeFlow() {
  const COL = 84, ROW = 92, R = 29;
  const level = {};
  /* `busy` breaks prerequisite loops. Without it a chart where A waits for B
     and B waits for A recurses until the stack gives out, and because
     renderBoard calls this every time, the board never draws again — the app
     looks dead. Files are refused before they get here (fileFormat.checkCharts)
     but the JSON editor and older stored charts can still hold a loop, so the
     engine treats one as "already placed" and carries on drawing. */
  const busy = {};
  function lvl(id) {
    if (level[id] != null) return level[id];
    if (busy[id]) return 0;
    const e = byid[id]; if (!e) return 0;
    const ps = (e.prereqs || []).filter(p => byid[p]); if (!ps.length) return level[id] = 0;
    busy[id] = 1;
    let m = 0; ps.forEach(p => { m = Math.max(m, lvl(p) + 1); });
    delete busy[id];
    return level[id] = m;
  }
  SYL.forEach(e => lvl(e.id));
  // place root 'feeder' events (no prereqs but feed a mid-chain node) just above what they feed
  const _kids = {}; SYL.forEach(e => (e.prereqs || []).forEach(p => { if (byid[p]) (_kids[p] = _kids[p] || []).push(e.id); }));
  SYL.forEach(e => { if ((e.prereqs || []).filter(p => byid[p]).length === 0) { const ch = _kids[e.id] || []; if (ch.length) { level[e.id] = Math.max(0, Math.min(...ch.map(c => level[c])) - 1); } } });
  const byLevel = {}; let maxL = 0;
  SYL.forEach(e => { const L = level[e.id]; (byLevel[L] = byLevel[L] || []).push(e); maxL = Math.max(maxL, L); });
  const slot = {};
  Object.keys(byLevel).forEach(L => { byLevel[L].sort((a, b) => a.seq - b.seq); byLevel[L].forEach((e, i) => slot[e.id] = i); });
  const kids = {}; SYL.forEach(e => (e.prereqs || []).forEach(p => { if (byid[p]) (kids[p] = kids[p] || []).push(e.id); }));
  for (let pass = 0; pass < 8; pass++) {
    for (let L = 1; L <= maxL; L++) {
      const arr = byLevel[L] || [];
      arr.forEach(e => { const ps = (e.prereqs || []).filter(p => byid[p]).map(p => slot[p]); e._b = ps.length ? ps.reduce((x, y) => x + y, 0) / ps.length : slot[e.id]; });
      arr.sort((a, b) => a._b - b._b || a.seq - b.seq); arr.forEach((e, i) => slot[e.id] = i);
    }
    for (let L = maxL - 1; L >= 0; L--) {
      const arr = byLevel[L] || [];
      arr.forEach(e => { const cs = (kids[e.id] || []).map(c => slot[c]); e._b = cs.length ? cs.reduce((x, y) => x + y, 0) / cs.length : slot[e.id]; });
      arr.sort((a, b) => a._b - b._b || a.seq - b.seq); arr.forEach((e, i) => slot[e.id] = i);
    }
  }
  let maxSlots = 1; Object.keys(byLevel).forEach(L => maxSlots = Math.max(maxSlots, byLevel[L].length));
  const pos = {};
  Object.keys(byLevel).forEach(L => {
    const arr = byLevel[L]; const n = arr.length; const off = (maxSlots - n) / 2;
    arr.forEach((e, i) => { pos[e.id] = { x: (off + i) * COL + COL / 2 + 20, y: (+L) * ROW + ROW / 2 + 14 }; });
  });
  return { pos, bands: [], W: maxSlots * COL + 40, H: (maxL + 1) * ROW + 30 };
}

/* orthogonal (right-angle) connector, honouring per-edge side/bend metadata. */
const BR = 30; /* ball anchor radius */
function anc(pt, side) { return side === 'N' ? { x: pt.x, y: pt.y - BR } : side === 'S' ? { x: pt.x, y: pt.y + BR } : side === 'E' ? { x: pt.x + BR, y: pt.y } : { x: pt.x - BR, y: pt.y }; }
function dedupe(pts) { const o = [pts[0]]; for (let i = 1; i < pts.length; i++) { const a = o[o.length - 1], b = pts[i]; if (Math.abs(a.x - b.x) > 0.5 || Math.abs(a.y - b.y) > 0.5) o.push(b); } return o; }
function orthConnect(s2, fs, e2, ts) {
  const hs = (fs === 'E' || fs === 'W'), he = (ts === 'E' || ts === 'W');
  if (Math.abs(s2.x - e2.x) < 0.5 || Math.abs(s2.y - e2.y) < 0.5) return [s2, e2];
  if (hs && he) { const mx = (s2.x + e2.x) / 2; return [s2, { x: mx, y: s2.y }, { x: mx, y: e2.y }, e2]; }
  if (!hs && !he) { const my = s2.y < e2.y ? e2.y - 16 : e2.y + 16; return [s2, { x: s2.x, y: my }, { x: e2.x, y: my }, e2]; }
  if (hs && !he) return [s2, { x: e2.x, y: s2.y }, e2];
  return [s2, { x: s2.x, y: e2.y }, e2];
}
function orthVia(s2, e2, mid) {
  return dedupe([s2, { x: s2.x, y: mid.y }, { x: mid.x, y: mid.y }, { x: mid.x, y: e2.y }, e2]);
}
function edgePts(p, c) {
  const a = nodePos(p), b = nodePos(c), m = edgeMeta[ekey(p, c)] || {};
  const dx = b.x - a.x, dy = b.y - a.y;
  let fs = m.fromSide, ts = m.toSide;
  if (!fs) fs = Math.abs(dy) < 0.5 ? (dx >= 0 ? 'E' : 'W') : (dy > 0 ? 'S' : 'N');
  if (!ts) ts = Math.abs(dy) < 0.5 ? (dx >= 0 ? 'W' : 'E') : (dy > 0 ? 'N' : 'S');
  if (!m.fromSide && !m.toSide && m.flip) { /* flip the primary axis of the elbow */
    fs = (fs === 'N' || fs === 'S') ? (dx >= 0 ? 'E' : 'W') : (dy >= 0 ? 'S' : 'N');
    ts = (ts === 'N' || ts === 'S') ? (dx >= 0 ? 'W' : 'E') : (dy >= 0 ? 'N' : 'S');
  }
  const s2 = anc(a, fs), e2 = anc(b, ts);
  let route = m.mid ? orthVia(s2, e2, m.mid) : orthConnect(s2, fs, e2, ts);
  if (!(m.fromSide || m.toSide || m.mid || m.flip)) {
    const obs = []; SYL.forEach(e => { if (e.id === p || e.id === c) return; obs.push(nodePos(e.id)); });
    const pad = 28; let bh = routeHits(route, obs, pad);
    if (bh > 0 && (fs === 'S' || fs === 'N') && (ts === 'N' || ts === 'S')) {
      const gut = 92, dn = s2.y < e2.y, y1 = dn ? s2.y + 16 : s2.y - 16, y2 = dn ? e2.y - 16 : e2.y + 16;
      [(a.x + b.x) / 2, (3 * a.x + b.x) / 4, (a.x + 3 * b.x) / 4, a.x + 46, a.x - 46, b.x + 46, b.x - 46, Math.max(a.x, b.x) + gut, Math.min(a.x, b.x) - gut].forEach(gx => {
        const cd = dedupe([s2, { x: s2.x, y: y1 }, { x: gx, y: y1 }, { x: gx, y: y2 }, { x: b.x, y: y2 }, e2]);
        const h = routeHits(cd, obs, pad); if (h < bh) { bh = h; route = cd; }
      });
    }
    if (bh > 0 && (fs === 'E' || fs === 'W')) {
      const gut = 92, gxr = Math.max(a.x, b.x) + gut, gxl = Math.min(a.x, b.x) - gut;
      const sE = anc(a, 'E'), eE = anc(b, 'E'), sW = anc(a, 'W'), eW = anc(b, 'W');
      [dedupe([sE, { x: gxr, y: sE.y }, { x: gxr, y: eE.y }, eE]), dedupe([sW, { x: gxl, y: sW.y }, { x: gxl, y: eW.y }, eW])].forEach(cd => { const h = routeHits(cd, obs, pad); if (h < bh) { bh = h; route = cd; } });
    }
  }
  return dedupe(route);
}
function segHits(a, b, obs, pad) {
  let h = 0; const vv = Math.abs(a.x - b.x) < 0.5;
  for (let i = 0; i < obs.length; i++) {
    const o = obs[i];
    if (vv) { if (Math.abs(o.x - a.x) < pad && o.y > Math.min(a.y, b.y) - 0.1 && o.y < Math.max(a.y, b.y) + 0.1) h++; }
    else { if (Math.abs(o.y - a.y) < pad && o.x > Math.min(a.x, b.x) - 0.1 && o.x < Math.max(a.x, b.x) + 0.1) h++; }
  }
  return h;
}
function routeHits(pts, obs, pad) { let h = 0; for (let i = 0; i < pts.length - 1; i++) h += segHits(pts[i], pts[i + 1], obs, pad); return h; }
function edgeList() {
  const L = []; const cov = lineCoveredPairs();
  SYL.forEach(ev => ev.prereqs.forEach(p => {
    if (!byid[p]) return; const k = ekey(p, ev.id); if (cov.has(k)) return;
    L.push({ p, c: ev.id, k: k, pts: edgePts(p, ev.id) });
  }));
  return L;
}
function vertSegs(list) {
  const v = [];
  list.forEach(o => {
    const pts = o.pts;
    for (let i = 0; i < pts.length - 1; i++) { const a = pts[i], b = pts[i + 1]; if (Math.abs(a.x - b.x) < 0.5) v.push({ x: a.x, y1: Math.min(a.y, b.y), y2: Math.max(a.y, b.y), k: o.k }); }
  });
  return v;
}
/* build path string; horizontal segments hop (inverted-U) over crossing verticals */
function edgePath(o, vs) {
  const pts = o.pts; let d = `M${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const a = pts[i], b = pts[i + 1];
    if (Math.abs(a.y - b.y) < 0.5 && Math.abs(a.x - b.x) > 0.5) {
      const y = a.y, dir = b.x > a.x ? 1 : -1; let xs = [];
      vs.forEach(sg => {
        if (sg.k === o.k) return; if (!hasHop(o.k, sg.k)) return;
        if (sg.y1 < y - 0.5 && sg.y2 > y + 0.5) { const cx = sg.x; if (cx > Math.min(a.x, b.x) + 3 && cx < Math.max(a.x, b.x) - 3) xs.push(cx); }
      });
      xs.sort((m, n) => dir > 0 ? m - n : n - m);
      xs.forEach(cx => { d += ` L${(cx - dir * 5).toFixed(1)} ${y.toFixed(1)} A5 5 0 0 ${dir > 0 ? 1 : 0} ${(cx + dir * 5).toFixed(1)} ${y.toFixed(1)}`; });
      d += ` L${b.x.toFixed(1)} ${b.y.toFixed(1)}`;
    } else d += ` L${b.x.toFixed(1)} ${b.y.toFixed(1)}`;
  }
  return d;
}
/* ---------- Free-drawn 90-degree lines (Line tool) ---------- */
let selLine = null, drawing = null, lineDrag = null;
function LINES() { if (!layout.__lines || !Array.isArray(layout.__lines)) layout.__lines = []; return layout.__lines; }
/* Pull near-parallel merged free lines flush into one straight run. */
function snapStraight(k1, k2, tol) {
  tol = tol || 6;
  if (!isLineKey(k1) || !isLineKey(k2)) return false;
  const A = lineById(k1.slice(LK.length)), B = lineById(k2.slice(LK.length));
  if (!A || !B || !A.pts || !B.pts || A.pts.length < 2 || B.pts.length < 2) return false;
  const segs = L => {
    const P = L.pts, out = [];
    for (let i = 0; i < P.length - 1; i++) {
      const a = P[i], b = P[i + 1];
      if (Math.abs(a.x - b.x) < 0.5) out.push({ v: true, c: a.x, lo: Math.min(a.y, b.y), hi: Math.max(a.y, b.y), i: i });
      else if (Math.abs(a.y - b.y) < 0.5) out.push({ v: false, c: a.y, lo: Math.min(a.x, b.x), hi: Math.max(a.x, b.x), i: i });
    }
    return out;
  };
  const sa = segs(A), sb = segs(B); let changed = false;
  sa.forEach(x => sb.forEach(y => {
    if (x.v !== y.v) return;                                    /* perpendicular: a real crossing */
    const gap = Math.abs(x.c - y.c);
    if (gap < 0.01 || gap > tol) return;                        /* already flush, or genuinely apart */
    if (y.hi < x.lo - tol || y.lo > x.hi + tol) return;         /* nowhere near along the run */
    const P = B.pts;
    if (y.v) { P[y.i].x = x.c; P[y.i + 1].x = x.c; } else { P[y.i].y = x.c; P[y.i + 1].y = x.c; }
    y.c = x.c; changed = true;
  }));
  return changed;
}
/* Merge / Unmerge pairing, shared by prerequisite arrows and free lines. */
function mergeClick(k) {
  const pick = key => {
    if (isLineKey(key)) { selLine = key.slice(LK.length); selEdge = null; }
    else { selEdge = key; selLine = null; }
  };
  if (!mergeFirst) {
    mergeFirst = k; pick(k); renderBoard();
    flashHint('Now click the crossing line to ' + tool + '.'); return;
  }
  if (mergeFirst !== k) {
    pushUndo();
    setHop(mergeFirst, k, tool === 'unmerge');
    if (tool === 'merge') snapStraight(mergeFirst, k);
    markDirty(); saveLayout();
  }
  mergeFirst = null; selEdge = null; selLine = null; renderBoard();
}
function lineArrow(L) { return (L.arrow == null) ? ((L.b && L.b.t === 'ball') ? 0 : 2) : L.arrow; }
function lineById(id) { const a = LINES(); for (let i = 0; i < a.length; i++) if (a[i].id === id) return a[i]; return null; }
function newLineId() { return 'L' + Date.now().toString(36) + Math.floor(Math.random() * 46656).toString(36); }

/* direction of the last committed segment, so corners alternate naturally */
function lastDir(out) {
  if (out.length < 2) return null;
  const a = out[out.length - 2], b = out[out.length - 1];
  if (Math.abs(a.y - b.y) < 0.5 && Math.abs(a.x - b.x) >= 0.5) return 'h';
  if (Math.abs(a.x - b.x) < 0.5 && Math.abs(a.y - b.y) >= 0.5) return 'v';
  return null;
}
/* force a polyline to be strictly horizontal/vertical by inserting corners */
function normOrtho(pts) {
  if (!pts || pts.length < 2) return (pts || []).map(p => ({ x: p.x, y: p.y }));
  const out = [{ x: pts[0].x, y: pts[0].y }];
  for (let i = 1; i < pts.length; i++) {
    const a = out[out.length - 1], b = pts[i];
    const dx = Math.abs(b.x - a.x), dy = Math.abs(b.y - a.y);
    if (dx < 0.5 || dy < 0.5) { out.push({ x: b.x, y: b.y }); continue; }
    const ld = lastDir(out);
    const vFirst = ld === 'h' ? true : ld === 'v' ? false : dy > dx;
    out.push(vFirst ? { x: a.x, y: b.y } : { x: b.x, y: a.y });
    out.push({ x: b.x, y: b.y });
  }
  return dedupe(out);
}
/* where an anchor currently sits; falls back to the stored point */
function anchorPt(an, fallback, depth) {
  depth = depth || 0;
  if (!an || depth > 6) return fallback;
  if (an.t === 'ball') { if (!byid[an.id]) return fallback; return anc(nodePos(an.id), an.side || 'N'); }
  if (an.t === 'line') {
    const h = lineById(an.id); if (!h) return fallback;
    const hp = linePts(h, depth + 1); if (hp.length < 2) return fallback;
    const i = Math.max(0, Math.min(hp.length - 2, an.i | 0));
    const a = hp[i], b = hp[i + 1], u = Math.max(0, Math.min(1, an.u == null ? 0.5 : an.u));
    return { x: a.x + (b.x - a.x) * u, y: a.y + (b.y - a.y) * u };
  }
  if (an.t === 'edge') {
    if (!byid[an.p] || !byid[an.c]) return fallback;
    const ep = edgePts(an.p, an.c); if (ep.length < 2) return fallback;
    const i = Math.max(0, Math.min(ep.length - 2, an.i | 0));
    const a = ep[i], b = ep[i + 1], u = Math.max(0, Math.min(1, an.u == null ? 0.5 : an.u));
    return { x: a.x + (b.x - a.x) * u, y: a.y + (b.y - a.y) * u };
  }
  return fallback;
}
/* resolved, orthogonal points for a line */
function linePts(L, depth) {
  const raw = (L.pts || []).map(p => ({ x: p.x, y: p.y }));
  if (raw.length < 2) return raw;
  raw[0] = anchorPt(L.a, raw[0], depth);
  raw[raw.length - 1] = anchorPt(L.b, raw[raw.length - 1], depth);
  const out = normOrtho(raw);
  if (!depth) L.pts = out.map(p => ({ x: p.x, y: p.y }));
  return out;
}
function nearestLinePoint(pt, maxD, skipId) {
  let best = null, bd = maxD * maxD;
  LINES().forEach(L => {
    if (L.id === skipId) return; const P = linePts(L, 1);
    for (let i = 0; i < P.length - 1; i++) {
      const a = P[i], b = P[i + 1];
      const vx = b.x - a.x, vy = b.y - a.y, ll = vx * vx + vy * vy; if (ll < 1e-6) continue;
      let u = ((pt.x - a.x) * vx + (pt.y - a.y) * vy) / ll; u = Math.max(0, Math.min(1, u));
      const qx = a.x + vx * u, qy = a.y + vy * u, dd = (qx - pt.x) * (qx - pt.x) + (qy - pt.y) * (qy - pt.y);
      if (dd < bd) { bd = dd; best = { t: 'line', id: L.id, i: i, u: u, x: qx, y: qy }; }
    }
  });
  return best;
}
/* nearest LOOSE end of another drawn line - the junction dot */
function nearestLooseEnd(pt, maxD, skipId) {
  let best = null, bd = maxD * maxD;
  LINES().forEach(L => {
    if (L.id === skipId) return; const P = linePts(L, 1); if (P.length < 2) return;
    [['a', 0], ['b', P.length - 1]].forEach(([k, i]) => {
      if (L[k]) return;
      const q = P[i], dd = (q.x - pt.x) * (q.x - pt.x) + (q.y - pt.y) * (q.y - pt.y);
      if (dd < bd) { bd = dd; best = { t: 'line', id: L.id, i: i === 0 ? 0 : P.length - 2, u: i === 0 ? 0 : 1, x: q.x, y: q.y }; }
    });
  });
  return best;
}
/* nearest point on a drawn prerequisite arrow */
function nearestEdgePoint(pt, maxD) {
  let best = null, bd = maxD * maxD;
  edgeList().forEach(o => {
    const P = o.pts;
    for (let i = 0; i < P.length - 1; i++) {
      const a = P[i], b = P[i + 1];
      const vx = b.x - a.x, vy = b.y - a.y, ll = vx * vx + vy * vy; if (ll < 1e-6) continue;
      let u = ((pt.x - a.x) * vx + (pt.y - a.y) * vy) / ll; u = Math.max(0, Math.min(1, u));
      const qx = a.x + vx * u, qy = a.y + vy * u, dd = (qx - pt.x) * (qx - pt.x) + (qy - pt.y) * (qy - pt.y);
      if (dd < bd) { bd = dd; best = { t: 'edge', p: o.p, c: o.c, i: i, u: u, x: qx, y: qy }; }
    }
  });
  return best;
}
function snapAnchor(pt, skipId) {
  const np = nearestPort(pt, 12);
  if (np) { const q = anc(nodePos(np.id), np.side); return { an: { t: 'ball', id: np.id, side: np.side }, x: q.x, y: q.y }; }
  const le = nearestLooseEnd(pt, 16, skipId);
  if (le) return { an: { t: 'line', id: le.id, i: le.i, u: le.u }, x: le.x, y: le.y };
  const lp = nearestLinePoint(pt, 10, skipId);
  if (lp) return { an: { t: 'line', id: lp.id, i: lp.i, u: lp.u }, x: lp.x, y: lp.y };
  const ep = nearestEdgePoint(pt, 10);
  if (ep) return { an: { t: 'edge', p: ep.p, c: ep.c, i: ep.i, u: ep.u }, x: ep.x, y: ep.y };
  return null;
}
/* Every route on the board in one list. */
function allRoutes() {
  const list = edgeList();
  LINES().forEach(L => {
    const P = linePts(L); if (P.length < 2) return;
    list.push({ line: L, k: lkey(L.id), pts: P });
  });
  return list;
}
function buildFreeLines(routes, vs) {
  let o = '';
  routes.forEach(r => {
    if (!r.line) return; const L = r.line, P = r.pts;
    const d = edgePath(r, vs);
    const on = (selLine === L.id);
    const av = lineArrow(L);
    const mk = av === 0 ? ' marker-end="url(#arr)"' : av === 1 ? ' marker-start="url(#arr)"' : '';
    o += '<path id="lp_' + escapeId(L.id) + '" d="' + d + '" fill="none" stroke="' + (on ? '#36c2ff' : '#657085') + '" stroke-width="' + (on ? 2.4 : 1.3) + '"' + mk + '/>';
    if (arrangeMode) {
      o += '<path class="linehit" id="lh_' + escapeId(L.id) + '" data-lid="' + escapeId(L.id) + '" d="' + d + '" fill="none" stroke="transparent" stroke-width="12"/>';
      if (!L.a) o += '<circle cx="' + P[0].x.toFixed(1) + '" cy="' + P[0].y.toFixed(1) + '" r="4" fill="#ffb84d" stroke="#7a4b00" stroke-width="1"/>';
      if (!L.b) o += '<circle cx="' + P[P.length - 1].x.toFixed(1) + '" cy="' + P[P.length - 1].y.toFixed(1) + '" r="4" fill="#ffb84d" stroke="#7a4b00" stroke-width="1"/>';
    }
  });
  return o;
}
function drawPreviewD() {
  if (!drawing || !drawing.pts.length) return '';
  const P = normOrtho(drawing.pts.concat(drawing.cur ? [drawing.cur] : []));
  if (P.length < 2) return '';
  return P.map((p, i) => (i ? 'L' : 'M') + p.x.toFixed(1) + ' ' + p.y.toFixed(1)).join(' ');
}
function refreshPreview() {
  const el = document.getElementById('drawPrev'); if (!el) return;
  el.setAttribute('d', drawPreviewD());
  const s = document.getElementById('drawStart');
  if (s && drawing && drawing.pts.length) { s.setAttribute('cx', drawing.pts[0].x.toFixed(1)); s.setAttribute('cy', drawing.pts[0].y.toFixed(1)); s.setAttribute('r', '4'); }
  else if (s) s.setAttribute('r', '0');
}
/* redraw one line in place, without rebuilding the whole board */
function refreshLine(id) {
  const L = lineById(id); if (!L) return;
  const P = linePts(L); if (P.length < 2) return;
  let d;
  const kk = lkey(id);
  if ([...unmerges].some(mk => (mk + '').split('|').indexOf(kk) >= 0)) {
    const routes = allRoutes(), vs = vertSegs(routes), me = routes.filter(r => r.k === kk)[0];
    d = me ? edgePath(me, vs) : P.map((p, i) => (i ? 'L' : 'M') + p.x.toFixed(1) + ' ' + p.y.toFixed(1)).join(' ');
  } else d = P.map((p, i) => (i ? 'L' : 'M') + p.x.toFixed(1) + ' ' + p.y.toFixed(1)).join(' ');
  const a = document.getElementById('lp_' + id), b = document.getElementById('lh_' + id);
  if (a) a.setAttribute('d', d); if (b) b.setAttribute('d', d);
  P.forEach((p, i) => {
    const h = document.querySelector('#flowSvg .lend[data-lid="' + id + '"][data-i="' + i + '"]');
    if (h) { h.setAttribute('cx', p.x.toFixed(1)); h.setAttribute('cy', p.y.toFixed(1)); }
    const v = document.querySelector('#flowSvg .lvert[data-lid="' + id + '"][data-i="' + i + '"]');
    if (v) { v.setAttribute('x', (p.x - 5).toFixed(1)); v.setAttribute('y', (p.y - 5).toFixed(1)); }
  });
}
/* true when the current tool may reshape a free line */
function lineEditable() { return arrangeMode && (tool === 'line' || tool === 'editlines'); }
function freeLineOverlay() {
  let o = '';
  if (tool === 'line') {
    o += '<path id="drawPrev" d="' + drawPreviewD() + '" fill="none" stroke="#36c2ff" stroke-width="2" stroke-dasharray="6 4"/>';
    o += '<circle id="drawStart" cx="0" cy="0" r="0" fill="#36c2ff"/>';
  }
  const L = lineById(selLine);
  if (L) {
    const P = linePts(L);
    P.forEach((p, i) => {
      const end = (i === 0 || i === P.length - 1);
      if (end) o += '<circle class="lend" data-lid="' + escapeId(L.id) + '" data-i="' + i + '" cx="' + p.x.toFixed(1) + '" cy="' + p.y.toFixed(1) + '" r="6" fill="#fff" stroke="#e67e22" stroke-width="2.4"/>';
      else o += '<rect class="lvert" data-lid="' + escapeId(L.id) + '" data-i="' + i + '" x="' + (p.x - 5).toFixed(1) + '" y="' + (p.y - 5).toFixed(1) + '" width="10" height="10" fill="#fff" stroke="#2b6cb0" stroke-width="2"/>';
    });
  }
  return o;
}
/* Which way a drawn line flows. */
function lineFlow(L) {
  const ar = lineArrow(L);
  if (ar === 0) return { s: 'a', d: 'b' };
  if (ar === 1) return { s: 'b', d: 'a' };
  const P = linePts(L, 1);
  if (P.length >= 2 && Math.abs(P[0].y - P[P.length - 1].y) > 4)
    return P[0].y < P[P.length - 1].y ? { s: 'a', d: 'b' } : { s: 'b', d: 'a' };
  return { s: 'a', d: 'b' };
}
/* Group lines into components; collect the balls feeding each component. */
function lineComponents() {
  const ls = LINES(); if (!ls.length) return { comps: {}, tapped: new Set() };
  const idx = {}; ls.forEach((L, i) => { idx[L.id] = i; });
  const par = ls.map((_, i) => i);
  const find = a => { while (par[a] !== a) { par[a] = par[par[a]]; a = par[a]; } return a; };
  const uni = (a, b) => { a = find(a); b = find(b); if (a !== b) par[a] = b; };
  const tapped = new Set();
  ls.forEach((L, i) => {
    ['a', 'b'].forEach(k => {
      const an = L[k];
      if (!an) return;
      if (an.t === 'line' && idx[an.id] != null) uni(i, idx[an.id]);
      if (an.t === 'edge') tapped.add(ekey(an.p, an.c));
    });
  });
  const comps = {};
  ls.forEach((L, i) => {
    const r = find(i), f = lineFlow(L);
    const S = L[f.s], D = L[f.d];
    const c = comps[r] = comps[r] || { src: new Set(), dst: new Set() };
    if (S && S.t === 'ball' && byid[S.id]) c.src.add(S.id);
    if (S && S.t === 'edge' && byid[S.p]) c.src.add(S.p);
    if (D && D.t === 'ball' && byid[D.id]) c.dst.add(D.id);
    if (D && D.t === 'edge' && byid[D.c]) c.dst.add(D.c);
  });
  return { comps, tapped };
}
/* prerequisite pairs the drawn lines already represent on screen */
function lineCoveredPairs() {
  const { comps, tapped } = lineComponents();
  const cov = new Set();
  Object.keys(comps).forEach(r => {
    const c = comps[r];
    c.src.forEach(p => {
      c.dst.forEach(q => {
        if (p === q) return; const k = ekey(p, q);
        if (!tapped.has(k)) cov.add(k);
      });
    });
  });
  return cov;
}
/* prerequisite pairs the drawn lines created */
function DERIVED() { if (!layout.__derived || !Array.isArray(layout.__derived)) layout.__derived = []; return layout.__derived; }
function deriveLineLinks() {
  const { comps } = lineComponents();
  const want = new Set();
  Object.keys(comps).forEach(r => {
    const c = comps[r];
    c.src.forEach(p => { c.dst.forEach(q => { if (p !== q && byid[p] && byid[q]) want.add(ekey(p, q)); }); });
  });
  const added = []; const der = DERIVED();
  /* first take back line-created prerequisites the drawing no longer implies */
  for (let i = der.length - 1; i >= 0; i--) {
    const k = der[i];
    if (want.has(k)) continue;
    const p = k.split('▸')[0], c = k.split('▸')[1];
    if (byid[c]) byid[c].prereqs = (byid[c].prereqs || []).filter(x => x !== p);
    der.splice(i, 1);
  }
  /* then add what it implies now; hand-entered prerequisites are never claimed */
  want.forEach(k => {
    const p = k.split('▸')[0], c = k.split('▸')[1];
    byid[c].prereqs = byid[c].prereqs || [];
    if (byid[c].prereqs.indexOf(p) >= 0) return;
    if (wouldCycle(p, c)) return;
    byid[c].prereqs.push(p); der.push(k); added.push(p + ' → ' + c);
  });
  return added;
}
/* Rebuild a line's points while one end is being dragged. */
function endDragRebuild(base, first, o, pt) {
  if (base.length < 2) return base.map(p => ({ x: p.x, y: p.y }));
  if (first) {
    const nxt = base[1];
    const corner = o === 'v' ? { x: nxt.x, y: pt.y } : { x: pt.x, y: nxt.y };
    return dedupe([{ x: pt.x, y: pt.y }, corner].concat(base.slice(1).map(p => ({ x: p.x, y: p.y }))));
  }
  const k = base.length - 1, prv = base[k - 1];
  const corner = o === 'v' ? { x: prv.x, y: pt.y } : { x: pt.x, y: prv.y };
  return dedupe(base.slice(0, k).map(p => ({ x: p.x, y: p.y })).concat([corner, { x: pt.x, y: pt.y }]));
}
/* add a corner to an existing line at the clicked point */
function insertBend(id, pt) {
  const L = lineById(id); if (!L) return false;
  const P = linePts(L); if (P.length < 2) return false;
  let bi = -1, bd = Infinity;
  for (let i = 0; i < P.length - 1; i++) {
    const a = P[i], b = P[i + 1];
    const vx = b.x - a.x, vy = b.y - a.y, ll = vx * vx + vy * vy; if (ll < 1e-6) continue;
    let u = ((pt.x - a.x) * vx + (pt.y - a.y) * vy) / ll; u = Math.max(0, Math.min(1, u));
    const qx = a.x + vx * u, qy = a.y + vy * u, dd = (qx - pt.x) * (qx - pt.x) + (qy - pt.y) * (qy - pt.y);
    if (dd < bd) { bd = dd; bi = i; }
  }
  if (bi < 0) return false;
  pushUndo();
  L.pts = P.slice(0, bi + 1).concat([{ x: pt.x, y: pt.y }], P.slice(bi + 1));
  markDirty(); saveLayout(); renderBoard();
  return true;
}
function finishLine(commit) {
  const d = drawing; drawing = null;
  if (!d || !commit || d.pts.length < 2) { renderBoard(); return; }
  pushUndo();
  const L = { id: newLineId(), pts: normOrtho(d.pts), a: d.a || null, b: d.b || null };
  LINES().push(L); selLine = L.id;
  const made = deriveLineLinks();
  markDirty(); saveLayout(); renderBoard(); renderSide();
  flashHint(made.length ? ('Linked ' + made.join(', ')) : 'Line drawn. Loose ends stay unlinked until you connect them.');
}
function deleteLine(id) {
  const ls = LINES(); const i = ls.findIndex(l => l.id === id); if (i < 0) return;
  pushUndo();
  ls.splice(i, 1);
  /* anything anchored to it becomes loose rather than dangling on a ghost */
  ls.forEach(L => { ['a', 'b'].forEach(k => { if (L[k] && L[k].t === 'line' && L[k].id === id) L[k] = null; }); });
  if (selLine === id) selLine = null;
  deriveLineLinks();
  markDirty(); saveLayout(); renderBoard(); renderSide();
  flashHint('Line deleted — any prerequisites it created are removed with it.');
}

function buildEdges() {
  const routes = allRoutes(), vs = vertSegs(routes); let out = '';
  routes.forEach(o => {
    if (o.line) return; const d = edgePath(o, vs); const m = edgeMeta[o.k] || {}; const ar = (m.arrow == null) ? 0 : m.arrow;
    const mk2 = ar === 0 ? ' marker-end="url(#arr)"' : ar === 1 ? ' marker-start="url(#arr)"' : '';
    const on = (selEdge === o.k);
    const style = on ? ' stroke="#36c2ff" stroke-width="2.4"' : ' stroke="#657085" stroke-width="1.3"';
    out += `<path d="${d}" fill="none"${style}${mk2}/>`;
    if (arrangeMode) out += `<path class="edgehit" data-p="${escapeId(o.p)}" data-c="${escapeId(o.c)}" data-k="${escapeId(o.k)}" d="${d}" fill="none" stroke="transparent" stroke-width="12"/>`;
  });
  return out + buildFreeLines(routes, vs);
}
/* blue N/E/S/W snap ports on every ball + handles for the selected line */
function ballPorts() {
  let o = '';
  SYL.forEach(e => {
    const p = nodePos(e.id);
    ['N', 'E', 'S', 'W'].forEach(sd => { const a = anc(p, sd); o += `<circle class="port" data-id="${escapeId(e.id)}" data-side="${sd}" cx="${a.x.toFixed(1)}" cy="${a.y.toFixed(1)}" r="4.5" fill="#36c2ff" fill-opacity="0.85" stroke="#fff" stroke-width="1"/>`; });
  });
  return o;
}
function nearestPort(pt, maxD) {
  let best = null, bd = maxD * maxD;
  SYL.forEach(e => {
    const q = nodePos(e.id);
    ['N', 'E', 'S', 'W'].forEach(sd => { const a = anc(q, sd); const dx = a.x - pt.x, dy = a.y - pt.y, d = dx * dx + dy * dy; if (d < bd) { bd = d; best = { id: e.id, side: sd }; } });
  });
  return best;
}
function wouldCycle(src, dst) {
  const kids = {}; SYL.forEach(e => (e.prereqs || []).forEach(pp => { (kids[pp] = kids[pp] || []).push(e.id); }));
  const st = [dst], seen = new Set();
  while (st.length) { const n = st.pop(); if (n === src) return true; if (seen.has(n)) continue; seen.add(n); (kids[n] || []).forEach(x => st.push(x)); }
  return false;
}
function buildOverlay() {
  if (!lineEditable()) return '';
  let o = ballPorts() + freeLineOverlay();
  if (tool !== 'editlines') return o;
  if (selEdge) {
    const oe = edgeList().find(x => x.k === selEdge);
    if (oe) {
      const pts = oe.pts, s0 = pts[0], sN = pts[pts.length - 1]; const m = edgeMeta[oe.k] || {};
      let hx, hy; if (m.mid) { hx = m.mid.x; hy = m.mid.y; } else { const mp = pts[Math.floor(pts.length / 2)]; hx = mp.x; hy = mp.y; }
      o += `<rect class="linehandle" x="${(hx - 6).toFixed(1)}" y="${(hy - 6).toFixed(1)}" width="12" height="12" fill="#fff" stroke="#2b6cb0" stroke-width="2"/>`;
      o += `<circle class="endhandle" data-end="from" cx="${s0.x.toFixed(1)}" cy="${s0.y.toFixed(1)}" r="6" fill="#fff" stroke="#e67e22" stroke-width="2.4"/>`;
      o += `<circle class="endhandle" data-end="to" cx="${sN.x.toFixed(1)}" cy="${sN.y.toFixed(1)}" r="6" fill="#fff" stroke="#e67e22" stroke-width="2.4"/>`;
    }
  }
  return o;
}
function highlightPort(pt) {
  const np = nearestPort(pt, 12);
  document.querySelectorAll('#flowSvg .port').forEach(c => {
    const on = np && c.dataset.id === np.id && c.dataset.side === np.side;
    c.setAttribute('r', on ? '7' : '4.5'); c.setAttribute('fill', on ? '#0af' : '#36c2ff');
  });
}
function applyEndSnap(end, pt) {
  const oe = edgeList().find(x => x.k === selEdge); if (!oe) { renderBoard(); return; }
  const p = oe.p, c = oe.c; const np = nearestPort(pt, 22); if (!np) { renderBoard(); return; }
  if (end === 'to') {
    if (np.id === c) { pushUndo(); edgeMeta[selEdge] = { ...(edgeMeta[selEdge] || {}), toSide: np.side }; markDirty(); }
    else {
      if (np.id === p) { flashHint('A link can’t start and end on the same event.'); renderBoard(); return; }
      if ((byid[np.id].prereqs || []).includes(p)) { flashHint('That link already exists.'); renderBoard(); return; }
      if (wouldCycle(p, np.id)) { flashHint('That would create a loop.'); renderBoard(); return; }
      pushUndo(); byid[c].prereqs = (byid[c].prereqs || []).filter(x => x !== p); byid[np.id].prereqs = byid[np.id].prereqs || []; byid[np.id].prereqs.push(p);
      const nk = ekey(p, np.id); edgeMeta[nk] = { ...(edgeMeta[selEdge] || {}), toSide: np.side }; delete edgeMeta[selEdge]; selEdge = nk; markDirty();
    }
  } else { /* from = prerequisite end */
    if (np.id === p) { pushUndo(); edgeMeta[selEdge] = { ...(edgeMeta[selEdge] || {}), fromSide: np.side }; markDirty(); }
    else {
      if (np.id === c) { flashHint('A link can’t start and end on the same event.'); renderBoard(); return; }
      if ((byid[c].prereqs || []).includes(np.id)) { flashHint('That link already exists.'); renderBoard(); return; }
      if (wouldCycle(np.id, c)) { flashHint('That would create a loop.'); renderBoard(); return; }
      pushUndo(); byid[c].prereqs = (byid[c].prereqs || []).filter(x => x !== p); byid[c].prereqs.push(np.id);
      const nk = ekey(np.id, c); edgeMeta[nk] = { ...(edgeMeta[selEdge] || {}), fromSide: np.side }; delete edgeMeta[selEdge]; selEdge = nk; markDirty();
    }
  }
  saveLayout(); renderBoard();
}
function bounds() { let W = 480, H = 480; SYL.forEach(ev => { const p = nodePos(ev.id); W = Math.max(W, p.x + 70); H = Math.max(H, p.y + 70); }); return { W, H }; }

/* ---------- board (with editor-style pan / zoom / connect in arrange mode) ---------- */
let view = { x: 0, y: 0, k: 1 };
export let tool = 'move'; let connectSrc = null, undoStack = [], pan = null;
/* ---------- undo / redo ----------
   ONE history, two kinds of entry, since 9 Sep 26 (owner: "undo and redo …
   for all users … not only isolated to under edit"). The pair sits on the
   main bar now, so it has to take back what EVERYONE does, not only what edit
   mode does:
   · a STRUCTURE entry {syl, lay} — the chart: events, prerequisites, lines,
     arrows, fonts, moved balls, the JSON editor, Reset layout. Restoring one
     marks the syllabus dirty (✓ Save changes lights) and writes the positions,
     exactly as the edit itself did.
   · a MARK entry {who, m, d, what} — one student's marks AND dates together
     (a flight graded done moves Last Flown forward, so the two are one step).
     Restoring one saves itself, as the mark did, and SWITCHES THE CREW PICKER
     to that student if it has moved on: an undo you cannot see is a
     mystery, and the picker moving is the honest way to show whose mark it was.
   Both stacks are cleared when the chart changes (loadCourse — history belongs
   to the chart it was recorded on) and on ✓ Save changes (clearDirty — the
   editing session is a unit). A removed student's entries are dropped with
   them (removeStudent). Not in the history, deliberately: adding / removing /
   renaming students, courses and syllabi, event details, Import — each asks
   first or has its own editor, and a syllabus delete cannot be re-materialised
   from a snapshot of the marks. The disabled state on the bar's buttons reads
   canUndo/canRedo, so every push notifies. */
function trimUndo() { if (undoStack.length > 60) undoStack.shift(); }
function pushUndo() { undoStack.push({ syl: JSON.stringify(SYL), lay: JSON.stringify(layout) }); trimUndo(); redoStack = []; notify(); }
function markSnap(s, what) { return { who: s, m: JSON.stringify(marks[s] || {}), d: dates[s] ? JSON.stringify(dates[s]) : null, what: what || null, t: Date.now() }; }
/* `field` coalesces: the date and down-days boxes fire on every keystroke, and
   nine undo steps for one typed date would be absurd. Keystrokes into the SAME
   box within two seconds of the first are one step (the first snapshot is the
   one kept — it holds the value before any of them). A grade or a failure
   count passes no field, so each press is its own step. */
function pushMarkUndo(s, what, field) {
  if (!s) return;
  const top = undoStack[undoStack.length - 1];
  if (field && top && top.who === s && top.field === field && Date.now() - top.t < 2000) { top.t = Date.now(); return; }
  const e = markSnap(s, what); if (field) e.field = field;
  undoStack.push(e); trimUndo(); redoStack = []; notify();
}
function applyHist(u) { SYL = JSON.parse(u.syl); byid = {}; SYL.forEach(e => byid[e.id] = e); layout = JSON.parse(u.lay); loadEdgeMeta(); selEdge = null; markDirty(); saveLayout(); renderBoard(); renderSide(); }
async function applyMarkHist(u) {
  const s = u.who;
  marks[s] = JSON.parse(u.m);
  if (u.d == null) delete dates[s]; else dates[s] = JSON.parse(u.d);
  /* The pop-up's buttons describe a grade that just changed under it — or,
     when the picker is about to move, somebody else's. */
  if (pop) closePop();
  if (active !== s) { active = s; prefSet('lastCrew:' + course, s); refreshActive(); }
  await saveMarks(s); if (dates[s]) await saveDates(s);
  renderBoard(); renderSide();
}
/* The snapshot that a step's reverse pushes onto the other stack: the SAME
   kind as the entry it undoes, taken from the live state before it is applied. */
function reverseOf(u) { return u.who != null ? markSnap(u.who, u.what) : { syl: JSON.stringify(SYL), lay: JSON.stringify(layout) }; }
/* A mark entry for a student who is gone (removed on another syllabus, or the
   roster reloaded from a file) is skipped, not applied — removeStudent drops
   them, this is the belt to its braces. */
function liveEntry(stack) { while (stack.length && stack[stack.length - 1].who != null && !marks[stack[stack.length - 1].who]) stack.pop(); return stack[stack.length - 1] || null; }
export function canUndo() { return !!liveEntry(undoStack); }
export function canRedo() { return !!liveEntry(redoStack); }
/* What the next press takes back, for the buttons' tooltips. */
function whatOf(u) { return !u ? '' : u.who != null ? (u.what || 'a mark') + ' for ' + nameOf(u.who) : 'a chart edit'; }
export function undoWhat() { return whatOf(liveEntry(undoStack)); }
export function redoWhat() { return whatOf(liveEntry(redoStack)); }
async function step(from, to) {
  const u = liveEntry(from); if (!u) return false;
  from.pop(); to.push(reverseOf(u));
  if (u.who != null) await applyMarkHist(u); else applyHist(u);
  notify(); return true;
}
export async function doUndo() { return step(undoStack, redoStack); }
export async function doRedo() { return step(redoStack, undoStack); }
/* Ctrl/⌘+Z undoes, Ctrl+Y and Ctrl/⌘+Shift+Z redo — everywhere on the tab
   EXCEPT inside a text box (the box's own undo is what the user means there)
   and under a question dialog (the answer comes first; App.jsx binds this to
   the document only while the tab is up). */
export function handleUndoKey(e) {
  if (!(e.ctrlKey || e.metaKey) || e.altKey) return;
  const k = String(e.key || '').toLowerCase();
  if (k !== 'z' && k !== 'y') return;
  const t = e.target;
  if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT' || t.isContentEditable)) return;
  if (dlg) return;
  e.preventDefault();
  if (k === 'y' || e.shiftKey) doRedo(); else doUndo();
}
export function setTool(t) {
  tool = t; connectSrc = null; mergeFirst = null; marquee = null; drawing = null;
  if (t !== 'line' && t !== 'editlines' && t !== 'delball') selLine = null;
  if (t !== 'editlines' && t !== 'merge' && t !== 'unmerge') selEdge = null;
  if (t !== 'select' && t !== 'delball') selBalls = new Set();
  const svg = document.getElementById('flowSvg'); if (svg) svg.style.cursor = t === 'move' ? '' : 'crosshair';
  renderBoard();
  const hints = { move: 'Move: drag a ball (snap-aligns to others). Drag empty space to pan.', select: 'Select: drag a box on empty space to pick several balls, then drag any of them to move the group.', connect: 'Connect: click the prerequisite first, then the event that depends on it.', delball: 'Delete: removes whatever is selected — selected events or the selected line. With nothing selected, click an event, a drawn line, or a prerequisite arrow to delete it. Undo restores them.', text: 'Text: click a ball to edit its text / type / number.', line: 'Line: click to start, then click where it should end — two clicks and it is done. Right angles are automatic. Ends snap to a ball port, onto another line, or onto an existing arrow — tapping an arrow feeds the event it points at; a loose end (amber dot) links nothing until you connect it. Click a line to select it, then drag its squares to reshape, or double-click it in Edit lines to add a bend. Delete removes it. Arrow cycles its arrowhead, and the arrowhead is what decides which way the link runs.', editlines: 'Edit lines: blue N/E/S/W points appear on every ball. Click a line, then drag its ends onto a blue point to snap/reconnect.', merge: 'Merge: click one line, then a crossing line — the hop is removed and near-parallel drawn lines snap flush into one straight run. Works on drawn lines and prerequisite arrows.', unmerge: 'Unmerge: click one line, then a crossing line — the crossing gets an inverted-U hop. Drawn lines cross flat until you do this.' };
  if (hints[t]) { hintBase = hints[t]; hintFlash = null; }
  notify();
}
function applyView() {
  const vp = document.getElementById('viewport'); if (!vp) return;
  const t = `translate(${view.x.toFixed(1)}px,${view.y.toFixed(1)}px) scale(${view.k.toFixed(3)})`;
  vp.style.transformOrigin = '0 0'; vp.style.transform = t;
  vp.setAttribute('transform', `translate(${view.x.toFixed(1)},${view.y.toFixed(1)}) scale(${view.k.toFixed(3)})`);
}
let _vRAF = 0, _dRAF = 0;
/* Pan is driven from window-level listeners, attached once. */
let _panWired = false;
function installGlobalPan() {
  if (_panWired) return; _panWired = true;
  window.addEventListener('pointermove', e => {
    if (!arrangeMode || !pan) return;
    if (pinching) { pan = null; return; }
    view.x = pan.vx + (e.clientX - pan.x0); view.y = pan.vy + (e.clientY - pan.y0); applyView();
  });
  const end = () => { if (!pan) return; pan = null; const s = document.getElementById('flowSvg'); if (s) s.style.cursor = 'grab'; perfOff(); };
  window.addEventListener('pointerup', end);
  window.addEventListener('pointercancel', end);
}
function perfOn() { const s = document.getElementById('flowSvg'); if (s) s.classList.add('perf'); }
function perfOff() { const s = document.getElementById('flowSvg'); if (s) s.classList.remove('perf'); }
function schedView() { applyView(); }
function flushView() { applyView(); }
function schedDragPaint() {
  if (_dRAF) return;
  _dRAF = requestAnimationFrame(() => {
    _dRAF = 0;
    const el = document.getElementById('edgeLayer'); if (el) el.innerHTML = buildEdges(); drawGuides();
  });
}
function flushDragPaint() {
  if (_dRAF) { cancelAnimationFrame(_dRAF); _dRAF = 0; }
  const el = document.getElementById('edgeLayer'); if (el) el.innerHTML = buildEdges(); drawGuides();
}
export function fitView() {
  const board = document.getElementById('board'), b = bounds();
  const cw = board.clientWidth - 24, ch = board.clientHeight - 24;
  view.k = Math.min(cw / b.W, ch / b.H, 1.4); view.x = (cw - b.W * view.k) / 2; view.y = 8; applyView();
}
/* --- keep the view steady when toggling Arrange --- */
function captureViewFromScroll() {
  const board = document.getElementById('board'); if (!board) return;
  view.k = flowZoom;
  view.x = -board.scrollLeft;
  view.y = -board.scrollTop;
}
function restoreScrollFromView() {
  const board = document.getElementById('board'); if (!board) return;
  flowZoom = Math.min(3, Math.max(0.1, view.k));
  applyFlowZoom();
  board.scrollLeft = Math.max(0, -view.x);
  board.scrollTop = Math.max(0, -view.y);
}
export function renderBoard() {
  const board = document.getElementById('board');
  if (!board) return;
  BORROW = null;
  if (!DEFAULT_LAYOUTS[curSyl()]) BORROW = bestDefaultLayout();
  const hasPlaced = layoutNodeCount(layout) > 0;
  const f = computeFlow(); AUTO = f.pos;
  const bd = bounds(); const W = Math.max(f.W, bd.W), H = (hasPlaced || DEFAULT_LAYOUTS[curSyl()] || BORROW) ? bd.H : Math.max(f.H, bd.H);
  const s = active;
  let nodes = ''; SYL.forEach(e => { nodes += ballGroup(e, isAvail(s, e)); });
  let svgW = W, svgH = H;
  if (arrangeMode) { svgW = Math.max(300, board.clientWidth - 24); svgH = Math.max(300, board.clientHeight - 24); }
  else { view = { x: 0, y: 0, k: 1 }; }
  board.innerHTML = `<div class="flowwrap"><svg id="flowSvg" width="${svgW}" height="${svgH}" viewBox="0 0 ${svgW} ${svgH}" class="${arrangeMode ? 'arrange' : ''}">
   <defs><marker id="arr" markerWidth="8" markerHeight="8" refX="5.5" refY="3" orient="auto-start-reverse"><path d="M0,0 L6,3 L0,6 Z" fill="#5a6172"/></marker></defs>
   <g id="viewport"><g id="bandLayer"></g><g id="edgeLayer">${buildEdges()}</g><g id="nodeLayer">${nodes}</g><g id="overlayLayer">${buildOverlay()}</g></g></svg></div>`;
  applyView();
  wireBoard();
  hideDetailBubble();
  fitPhoneWidth(svgW);
  applyFlowZoom();
  /* Fresh markup scrolls to 0,0 — which, with the slack above, is empty
     space. Park at the chart's own corner; a landing that follows moves on. */
  if (boardPad.x || boardPad.y) { board.scrollLeft = boardPad.x; board.scrollTop = boardPad.y; }
  notify();   /* header event count etc. */
}
/* Redraw the board WITHOUT moving the view. Rebuilding the SVG (which a mark
   has to do — the ball's fill and the yellow "can plan next" rings change)
   resets the scroll to the chart's corner, so grading a ball well down the
   chart threw the view back up to the top (owner, 9 Sep 26: skip ahead, "put
   DCO a pokeball down the flow chart. The view jumps back up to the above
   last empty pokeball"). The chart is the SAME size before and after a mark
   — only the colours differ — so the offset still points at the same place:
   capture it and put it straight back, exactly as the crew picker does. */
function redrawKeepView() {
  const board = document.getElementById('board');
  const sx = board ? board.scrollLeft : 0, sy = board ? board.scrollTop : 0;
  renderBoard(); renderSide();
  if (board) { board.scrollLeft = sx; board.scrollTop = sy; }
}
export let flowZoom = 1;
let zoomIsMine = false;   /* the user has taken the zoom over; stop auto-fitting */

/* A phone gets the chart scaled to its own width. At 100% an 880px chart on a
   390px screen leaves 522px of sideways wander that the desktop does not have,
   which is what makes scrolling straight down so awkward. Fitting the width
   makes scrollWidth equal clientWidth, so the only direction left is down.
   The zoom buttons still work — this is a starting point, not a lock. */
const PHONE = 1050;
function fitPhoneWidth(chartW) {
  if (typeof window === 'undefined' || arrangeMode || zoomIsMine) return;
  const board = document.getElementById('board'); if (!board || !chartW) return;
  if (window.innerWidth > PHONE) { flowZoom = 1; return; }
  const cs = getComputedStyle(board);
  const avail = board.clientWidth - parseFloat(cs.paddingLeft || 0) - parseFloat(cs.paddingRight || 0);
  if (avail > 0) flowZoom = Math.min(1, Math.max(0.1, Math.floor((avail / chartW) * 100) / 100));
}
function applyFlowZoom() {
  const w = document.querySelector('#board .flowwrap'); if (w) w.style.zoom = arrangeMode ? 1 : flowZoom;
  padBoard();
}
/* Slack around the chart, half a view's worth on each side, so ANY event —
   the first, the last, one at a side edge of a chart wider than the board —
   can sit in the MIDDLE of the view when a landing asks for it (owner, 9 Sep
   26: "centralise the view if its possible when the crew picker is selected").
   The browser clamps a scroll at the content's edge, so without it the top
   and bottom of the chart could never be centred. Held in SCREEN pixels
   across zooms — the wrapper is what gets zoomed, so its padding is written
   in unzoomed units — and setFlowZoom's anchor maths subtracts it. Sideways
   slack only once the chart already scrolls sideways: a phone chart fitted
   to the width must not start wandering. Nothing in arrange mode (the
   canvas is sized to the board there). renderBoard parks the fresh scroll
   at the chart's top-left corner, so a chart switch looks as it always did. */
let boardPad = { x: 0, y: 0 };
function padBoard() {
  const board = document.getElementById('board'), w = board && board.querySelector('.flowwrap');
  if (!board || !w) return;
  const z = arrangeMode ? 1 : (flowZoom || 1);
  const svg = w.querySelector('svg'); const chartW = svg ? (parseFloat(svg.getAttribute('width')) || 0) * z : 0;
  const y = arrangeMode ? 0 : Math.max(0, Math.round(board.clientHeight / 2));
  const x = (arrangeMode || chartW <= board.clientWidth) ? 0 : Math.max(0, Math.round(board.clientWidth / 2));
  boardPad = { x, y };
  w.style.padding = `${(y / z).toFixed(2)}px ${(x / z).toFixed(2)}px`;
}
/* Anchored at the middle of the current view, the same way pinch zoom anchors
   under the fingers. Without the scroll correction, CSS zoom rescales the whole
   page under an unchanged scroll position and the viewport lands on a different
   part of the chart. */
export function setFlowZoom(z) {
  zoomIsMine = true;
  const board = document.getElementById('board');
  if (board && !arrangeMode && flowZoom > 0) {
    const ox = board.clientWidth / 2, oy = board.clientHeight / 2;
    /* boardPad is screen-constant slack, so take it off before dividing by the
       zoom and put the fresh one back after (padBoard runs inside applyFlowZoom). */
    const cx = (board.scrollLeft + ox - boardPad.x) / flowZoom, cy = (board.scrollTop + oy - boardPad.y) / flowZoom;
    flowZoom = z; applyFlowZoom();
    void board.scrollWidth; /* force reflow, or the new scroll range is stale and clamps */
    board.scrollLeft = boardPad.x + cx * z - ox; board.scrollTop = boardPad.y + cy * z - oy;
  } else { flowZoom = z; applyFlowZoom(); }
  notify();
}
/* "reset" means back to how the chart opened: 100% on a desktop, but on a phone
   the chart opens fitted to the screen's width, and resetting to a literal 100%
   there handed back the 522px of sideways wander that fitting exists to remove.
   Going through setFlowZoom keeps the same point of the chart under the middle
   of the view; the flag is put back afterwards so a rotate re-fits again. */
export function resetFlowZoom() {
  const svg = document.getElementById('flowSvg');
  const keep = flowZoom; zoomIsMine = false;
  fitPhoneWidth(svg ? parseFloat(svg.getAttribute('width')) || 0 : 0);
  const target = flowZoom; flowZoom = keep;
  setFlowZoom(target); zoomIsMine = false;
}
function wireBoard() {
  const svg = document.getElementById('flowSvg');
  document.querySelectorAll('#flowSvg .ball').forEach(g => {
    if (arrangeMode) {
      g.style.touchAction = 'none';
      g.addEventListener('pointerdown', startDrag);
      g.addEventListener('click', e => { if (tool === 'connect') { e.stopPropagation(); connectClick(g.dataset.id); } else if (tool === 'text') { e.stopPropagation(); openEdit(g.dataset.id); } else if (tool === 'delball') { e.stopPropagation(); deleteEventById(g.dataset.id); } });
      g.addEventListener('dblclick', () => openEdit(g.dataset.id));
    } else if (showDetails) {
      g.addEventListener('click', ev => { ev.stopPropagation(); showDetailBubble(g.dataset.id, g); });
      g.addEventListener('pointerenter', () => showDetailBubble(g.dataset.id, g));
      g.addEventListener('pointerleave', hideDetailBubble);
    } else { g.addEventListener('click', ev => ballTap(g.dataset.id, ev)); }
  });
  if (arrangeMode) {
    document.querySelectorAll('#flowSvg .edgehit').forEach(p => {
      p.addEventListener('click', async e => {
        e.stopPropagation();
        const pr = p.dataset.p, ch = p.dataset.c, k = ekey(pr, ch);
        if (tool === 'delball') {
          if (!await uiConfirm('Remove link ' + pr + ' → ' + ch + ' ?')) return;
          pushUndo(); const ev = byid[ch]; if (ev) ev.prereqs = (ev.prereqs || []).filter(x => x !== pr);
          delete edgeMeta[k]; markDirty(); saveLayout(); renderBoard(); renderSide(); return;
        }
        if (tool === 'merge' || tool === 'unmerge') { mergeClick(k); return; }
        /* editlines / any other tool: just select the line */
        selEdge = k; renderBoard();
        if (tool === 'editlines') flashHint('Drag either end (orange) onto a blue point to reconnect, or drag the blue square to bend.');
      });
    });
    /* drag the orange bend handle (Edit lines) */
    const lh = document.querySelector('#flowSvg .linehandle');
    if (lh && selEdge) {
      lh.addEventListener('pointerdown', e => {
        e.stopPropagation();
        const key = selEdge; pushUndo();
        const mv = ev2 => { const pt = svgPt(ev2); edgeMeta[key] = { ...(edgeMeta[key] || {}), mid: { x: Math.round(pt.x), y: Math.round(pt.y) } }; schedDragPaint(); };
        const up = () => { window.removeEventListener('pointermove', mv); window.removeEventListener('pointerup', up); markDirty(); saveLayout(); wireBoard(); };
        window.addEventListener('pointermove', mv); window.addEventListener('pointerup', up);
      });
    }
    /* drag a line end onto a blue N/E/S/W point to snap / reconnect */
    document.querySelectorAll('#flowSvg .endhandle').forEach(h => {
      h.addEventListener('pointerdown', e => {
        e.stopPropagation(); const end = h.dataset.end;
        const mv = ev2 => { const pt = svgPt(ev2); h.setAttribute('cx', pt.x.toFixed(1)); h.setAttribute('cy', pt.y.toFixed(1)); highlightPort(pt); };
        const up = ev2 => { window.removeEventListener('pointermove', mv); window.removeEventListener('pointerup', up); applyEndSnap(end, svgPt(ev2)); };
        window.addEventListener('pointermove', mv); window.addEventListener('pointerup', up);
      });
    });
    document.querySelectorAll('#flowSvg .linehit').forEach(h => {
      h.addEventListener('dblclick', e => {
        if (tool !== 'editlines') return;
        e.preventDefault(); e.stopPropagation();
        selLine = h.dataset.lid;
        if (insertBend(selLine, svgPt(e))) flashHint('Bend added — drag the blue square to shape it.');
      });
      h.addEventListener('pointerdown', e => {
        if (tool === 'line' && drawing) return;
        if (tool === 'delball') { e.stopPropagation(); deleteLine(h.dataset.lid); return; }
        if (tool === 'merge' || tool === 'unmerge') { e.stopPropagation(); e.preventDefault(); mergeClick(lkey(h.dataset.lid)); return; }
        if (!lineEditable()) return;
        e.stopPropagation(); selLine = h.dataset.lid; renderBoard();
      });
    });
    document.querySelectorAll('#flowSvg .lvert').forEach(h => {
      h.addEventListener('pointerdown', e => {
        e.stopPropagation(); e.preventDefault();
        const id = h.dataset.lid, i = +h.dataset.i, L = lineById(id); if (!L) return;
        const P0 = L.pts.map(p => ({ x: p.x, y: p.y }));
        const prevV = i > 0 && Math.abs(P0[i].x - P0[i - 1].x) < 0.5;
        const nextV = i < P0.length - 1 && Math.abs(P0[i].x - P0[i + 1].x) < 0.5;
        let moved = false;
        const mv = ev2 => {
          const pt = svgPt(ev2); moved = true; const p = L.pts;
          if (i > 0) { if (prevV) p[i - 1].x = pt.x; else p[i - 1].y = pt.y; }
          if (i < p.length - 1) { if (nextV) p[i + 1].x = pt.x; else p[i + 1].y = pt.y; }
          p[i].x = pt.x; p[i].y = pt.y; refreshLine(id);
        };
        const up = () => {
          window.removeEventListener('pointermove', mv); window.removeEventListener('pointerup', up);
          if (moved) { pushUndo(); markDirty(); saveLayout(); } renderBoard();
        };
        window.addEventListener('pointermove', mv); window.addEventListener('pointerup', up);
      });
    });
    document.querySelectorAll('#flowSvg .lend').forEach(h => {
      h.addEventListener('pointerdown', e => {
        e.stopPropagation(); e.preventDefault();
        const id = h.dataset.lid, i = +h.dataset.i, L = lineById(id); if (!L) return;
        const first = (i === 0), key = first ? 'a' : 'b';
        const base = linePts(L).map(p => ({ x: p.x, y: p.y }));
        const o = first
          ? (Math.abs(base[0].x - base[1].x) < 0.5 ? 'v' : 'h')
          : (Math.abs(base[base.length - 1].x - base[base.length - 2].x) < 0.5 ? 'v' : 'h');
        L[key] = null;
        const mv = ev2 => {
          const pt = svgPt(ev2);
          L.pts = endDragRebuild(base, first, o, pt); refreshLine(id);
          h.setAttribute('cx', pt.x.toFixed(1)); h.setAttribute('cy', pt.y.toFixed(1));
          highlightPort(pt);
        };
        const up = ev2 => {
          window.removeEventListener('pointermove', mv); window.removeEventListener('pointerup', up);
          pushUndo();
          const pt = svgPt(ev2), sn = snapAnchor(pt, id);
          const dst = sn ? { x: sn.x, y: sn.y } : pt;
          L.pts = endDragRebuild(base, first, o, dst);
          L[key] = sn ? sn.an : null;
          const made = deriveLineLinks();
          markDirty(); saveLayout(); renderBoard(); renderSide();
          flashHint(made.length ? ('Linked ' + made.join(', ')) : (sn ? 'End connected.' : 'End left loose — nothing linked yet.'));
        };
        window.addEventListener('pointermove', mv); window.addEventListener('pointerup', up);
      });
    });
  } else {
    svg.addEventListener('pointerdown', e => { if (!e.target.closest('.ball')) hideDetailBubble(); });
  }
  if (arrangeMode) {
    /* arrange: pan the viewport transform, wheel to zoom */
    svg.addEventListener('pointerdown', e => {
      if (tool === 'line') {
        if (e.target.closest('.lend') || e.target.closest('.lvert')) return;
        e.preventDefault(); e.stopPropagation();
        const pt = svgPt(e);
        if (!drawing) {
          const hit = e.target.closest('.linehit');
          if (hit) { selLine = hit.dataset.lid; renderBoard(); return; }
          const sn = snapAnchor(pt, null);
          drawing = { pts: [sn ? { x: sn.x, y: sn.y } : pt], a: sn ? sn.an : null, b: null, cur: null };
          selLine = null; renderBoard();
          flashHint('Now click where it ends — on a ball port, on another line, or in empty space to leave it loose. Loose ends (amber dots) are junction points — other lines snap onto them, and everything meeting there flows top to bottom.');
          return;
        }
        /* second click always ends the line */
        const s0 = drawing.pts[0];
        if (Math.abs(pt.x - s0.x) < 12) pt.x = s0.x; else if (Math.abs(pt.y - s0.y) < 12) pt.y = s0.y;
        const sn = snapAnchor(pt, null);
        if (sn) { drawing.pts.push({ x: sn.x, y: sn.y }); drawing.b = sn.an; }
        else { drawing.pts.push(pt); drawing.b = null; }
        finishLine(true);
        return;
      }
      if (e.target.closest('.ball') || e.target.closest('.edgehit') || e.target.closest('.port') || e.target.closest('.endhandle') || e.target.closest('.linehandle')) return;
      if (tool === 'select') { startMarquee(e, svg); return; }
      pan = { x0: e.clientX, y0: e.clientY, vx: view.x, vy: view.y }; svg.style.cursor = 'grabbing'; perfOn();
      try { svg.setPointerCapture(e.pointerId); } catch (_) {}
    });
    installGlobalPan();
    svg.addEventListener('pointermove', e => {
      if (tool === 'line' && drawing) {
        const cp = svgPt(e); const c0 = drawing.pts[0];
        if (Math.abs(cp.x - c0.x) < 12) cp.x = c0.x; else if (Math.abs(cp.y - c0.y) < 12) cp.y = c0.y;
        drawing.cur = cp; refreshPreview(); highlightPort(cp); return;
      }
      if (pinching) { pan = null; return; } if (!pan) return;
      view.x = pan.vx + (e.clientX - pan.x0); view.y = pan.vy + (e.clientY - pan.y0); schedView();
    });
    const endPan = () => { if (pan) flushView(); pan = null; svg.style.cursor = 'grab'; perfOff(); };
    svg.addEventListener('pointerup', endPan); svg.addEventListener('pointercancel', endPan);
    svg.addEventListener('dblclick', e => { if (tool === 'line' && drawing) { e.preventDefault(); e.stopPropagation(); finishLine(drawing.pts.length >= 2); } });
    svg.style.cursor = 'grab';
    svg.addEventListener('wheel', e => {
      e.preventDefault();
      const r = svg.getBoundingClientRect(), mx = e.clientX - r.left, my = e.clientY - r.top;
      const f = Math.pow(1.0015, -e.deltaY); const k2 = Math.min(4, Math.max(0.1, view.k * f));
      view.x = mx - (mx - view.x) * (k2 / view.k); view.y = my - (my - view.y) * (k2 / view.k); view.k = k2; schedView();
    }, { passive: false });
  } else {
    /* view mode: the board scrolls, so grab empty space and drag to scroll it */
    dragScroll(document.getElementById('board'),
      e => !!(e.target.closest('.ball') || e.target.closest('.edgehit')));
  }
  enableHScroll(document.getElementById('board'));
  enablePinchZoom(document.getElementById('board'));   /* two-finger zoom, both modes */
}
/* Two-finger pinch zoom on the flow chart. */
let pinching = false;
function enablePinchZoom(el) {
  if (!el || el.__pinch) return; el.__pinch = true;
  const pts = new Map(); let start = null;
  const dist = a => Math.hypot(a[0].x - a[1].x, a[0].y - a[1].y);
  const mid = a => ({ x: (a[0].x + a[1].x) / 2, y: (a[0].y + a[1].y) / 2 });
  el.addEventListener('pointerdown', e => {
    if (e.pointerType === 'mouse') return;
    pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pts.size === 2) {
      const a = [...pts.values()], r = el.getBoundingClientRect(), m = mid(a);
      pinching = true; perfOn();
      start = { d: dist(a) || 1, m,
        k: view.k, vx: view.x, vy: view.y,
        z: flowZoom, sl: el.scrollLeft, st: el.scrollTop,
        ox: m.x - r.left, oy: m.y - r.top };
    }
  }, { passive: false });
  el.addEventListener('pointermove', e => {
    if (!pts.has(e.pointerId)) return;
    pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pts.size !== 2 || !start) return;
    e.preventDefault();
    const a = [...pts.values()];
    const f = (dist(a) || 1) / start.d;
    if (arrangeMode) {
      const k2 = Math.min(4, Math.max(0.1, start.k * f));
      view.k = k2;
      view.x = start.ox - (start.ox - start.vx) * (k2 / start.k);
      view.y = start.oy - (start.oy - start.vy) * (k2 / start.k);
      schedView();
    } else {
      const z2 = Math.min(3, Math.max(0.1, +(start.z * f).toFixed(3)));
      const cx = (start.sl + start.ox) / start.z, cy = (start.st + start.oy) / start.z;
      flowZoom = z2; applyFlowZoom();
      el.scrollLeft = cx * z2 - start.ox; el.scrollTop = cy * z2 - start.oy;
    }
  }, { passive: false });
  const drop = e => {
    pts.delete(e.pointerId);
    if (pts.size < 2) {
      start = null;
      /* A pinch is the user taking the zoom over, the same as pressing + or −:
         without the flag a rotate afterwards snapped their zoom back to fit. */
      if (pinching) { pinching = false; if (!arrangeMode) zoomIsMine = true; flushView(); perfOff(); notify(); }
    }
  };
  el.addEventListener('pointerup', drop); el.addEventListener('pointercancel', drop); el.addEventListener('pointerleave', drop);
}
/* Left/right scrolling for the flow board. */
function enableHScroll(el) {
  if (!el || el.__hscroll) return; el.__hscroll = true;
  const canH = () => el.scrollWidth - el.clientWidth > 1;
  el.addEventListener('wheel', e => {
    if (arrangeMode || !canH()) return;
    const dx = e.deltaX, dy = e.deltaY;
    let amt = 0;
    if (Math.abs(dx) > Math.abs(dy)) return;              /* let the browser do native deltaX */
    if (e.shiftKey) amt = dy;
    else {
      const atTop = el.scrollTop <= 0, atBot = el.scrollTop >= el.scrollHeight - el.clientHeight - 1;
      const noV = el.scrollHeight - el.clientHeight <= 1;
      if (noV || (dy < 0 && atTop) || (dy > 0 && atBot)) amt = dy; else return;
    }
    if (!amt) return;
    const before = el.scrollLeft;
    el.scrollLeft = before + amt;
    if (el.scrollLeft !== before) e.preventDefault();
  }, { passive: false });
  el.tabIndex = el.tabIndex >= 0 ? el.tabIndex : 0;
  el.style.outline = 'none';
  el.addEventListener('keydown', e => {
    if (arrangeMode) return;
    const t = e.target, tag = (t && t.tagName || '').toLowerCase();
    if (tag === 'input' || tag === 'select' || tag === 'textarea' || (t && t.isContentEditable)) return;
    const step = e.shiftKey ? 400 : 90;
    if (e.key === 'ArrowRight') { el.scrollLeft += step; e.preventDefault(); }
    else if (e.key === 'ArrowLeft') { el.scrollLeft -= step; e.preventDefault(); }
    else if (e.key === 'Home') { el.scrollLeft = 0; e.preventDefault(); }
    else if (e.key === 'End') { el.scrollLeft = el.scrollWidth; e.preventDefault(); }
  });
}
/* Grab-and-drag scrolling for any overflow container. */
export function dragScroll(el, skip) {
  if (!el || el.__dragScroll) return; el.__dragScroll = true;
  let st = null;
  el.style.cursor = 'grab';
  el.addEventListener('pointerdown', e => {
    if (arrangeMode) return;   /* arrange mode pans the SVG viewport itself */
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    const t = e.target, tag = (t && t.tagName || '').toLowerCase();
    if (tag === 'input' || tag === 'select' || tag === 'textarea' || tag === 'button' || tag === 'option' || (t && t.isContentEditable)) return;
    if (t && t.closest && (t.closest('button') || t.closest('input') || t.closest('select') || t.closest('a') || t.closest('[data-rm]') || t.closest('[data-lull]'))) return;
    if (skip && skip(e)) return;
    st = { x: e.clientX, y: e.clientY, l: el.scrollLeft, t: el.scrollTop, moved: false, id: e.pointerId };
  });
  el.addEventListener('pointermove', e => {
    if (arrangeMode) { st = null; el.classList.remove('dragging'); return; }
    if (pinching) { st = null; el.classList.remove('dragging'); return; }
    if (!st || e.pointerId !== st.id) return;
    const dx = e.clientX - st.x, dy = e.clientY - st.y;
    if (!st.moved) {
      if (Math.abs(dx) < 3 && Math.abs(dy) < 3) return; st.moved = true;
      el.classList.add('dragging'); try { el.setPointerCapture(st.id); } catch (_) {}
    }
    el.scrollLeft = st.l - dx; el.scrollTop = st.t - dy;
    e.preventDefault();
  });
  const stop = e => {
    if (!st) return; const moved = st.moved; st = null; el.classList.remove('dragging');
    if (moved) { /* swallow the click that follows a drag */
      const kill = ev => { ev.stopPropagation(); ev.preventDefault(); };
      el.addEventListener('click', kill, { capture: true, once: true });
      setTimeout(() => el.removeEventListener('click', kill, true), 0);
    }
  };
  el.addEventListener('pointerup', stop); el.addEventListener('pointercancel', stop); el.addEventListener('pointerleave', stop);
}
function svgPt(ev) {
  const svg = document.getElementById('flowSvg'); const r = svg.getBoundingClientRect();
  return { x: (ev.clientX - r.left - view.x) / view.k, y: (ev.clientY - r.top - view.y) / view.k };
}
function connectClick(id) {
  if (!connectSrc) { connectSrc = id; renderBoard(); return; }
  if (connectSrc === id) { connectSrc = null; renderBoard(); return; }
  const src = connectSrc, dst = id; connectSrc = null;
  const ev = byid[dst];
  if ((ev.prereqs || []).includes(src)) { uiAlert('That link already exists.'); renderBoard(); return; }
  /* cycle guard: dst must not already reach src */
  const kids = {}; SYL.forEach(e => (e.prereqs || []).forEach(p => { (kids[p] = kids[p] || []).push(e.id); }));
  const st = [dst], seen = new Set(); let cyc = false;
  while (st.length) { const n = st.pop(); if (n === src) { cyc = true; break; } if (seen.has(n)) continue; seen.add(n); (kids[n] || []).forEach(c => st.push(c)); }
  if (cyc) { uiAlert('That link would create a loop (“' + src + '” already comes after “' + dst + '”).'); renderBoard(); return; }
  pushUndo(); ev.prereqs = ev.prereqs || []; ev.prereqs.push(src);
  markDirty(); renderBoard(); renderSide();
}
export async function addModule(type) {
  let id = ((await uiPrompt('Name for the new ' + type + ' event:')) || '').trim();
  if (!id) return;
  if (byid[id]) { await uiAlert('An event with that name already exists.'); return; }
  pushUndo();
  const maxSeq = SYL.reduce((m, e) => Math.max(m, e.seq || 0), 0);
  SYL.push({ id, type, seq: maxSeq + 1, prereqs: [], phase: 'Custom' });
  byid = {}; SYL.forEach(e => byid[e.id] = e);
  const board = document.getElementById('board');
  layout[id] = { x: (board.clientWidth / 2 - view.x) / view.k, y: (board.clientHeight / 2 - view.y) / view.k };
  markDirty(); await saveLayout(); renderBoard(); renderSide();
}
let groupDrag = null, marquee = null;
function startMarquee(e, svg) {
  const p0 = svgPt(e); marquee = { x0: p0.x, y0: p0.y, rect: null }; try { svg.setPointerCapture(e.pointerId); } catch (_) {}
  const mv = ev => {
    const p = svgPt(ev); const x = Math.min(marquee.x0, p.x), y = Math.min(marquee.y0, p.y), w = Math.abs(p.x - marquee.x0), h = Math.abs(p.y - marquee.y0); marquee.rect = { x, y, w, h };
    const gl = document.getElementById('bandLayer'); if (gl) gl.innerHTML = `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="rgba(54,194,255,0.12)" stroke="#36c2ff" stroke-width="0.8" stroke-dasharray="4 3"/>`;
  };
  const up = () => {
    svg.removeEventListener('pointermove', mv); svg.removeEventListener('pointerup', up);
    const gl = document.getElementById('bandLayer'); if (gl) gl.innerHTML = '';
    const r = marquee && marquee.rect; marquee = null;
    if (!r || (r.w < 3 && r.h < 3)) { selBalls = new Set(); renderBoard(); return; }
    const sel = new Set(); SYL.forEach(e2 => { const q = nodePos(e2.id); if (q.x >= r.x && q.x <= r.x + r.w && q.y >= r.y && q.y <= r.y + r.h) sel.add(e2.id); });
    selBalls = sel; renderBoard(); flashHint(sel.size + ' selected — drag any one of them to move the group.');
  };
  svg.addEventListener('pointermove', mv); svg.addEventListener('pointerup', up);
}
function startGroupDrag(ev) {
  perfOn(); ev.preventDefault(); const g = ev.currentTarget, id = g.dataset.id; if (!selBalls.has(id)) selBalls = new Set([id]);
  const p = svgPt(ev), start = {}; selBalls.forEach(bid => { const bp = nodePos(bid); start[bid] = { x: bp.x, y: bp.y }; });
  groupDrag = { px: p.x, py: p.y, start, moved: false, snap: { syl: JSON.stringify(SYL), lay: JSON.stringify(layout) }, pushed: false }; try { g.setPointerCapture(ev.pointerId); } catch (e) {}
  g.addEventListener('pointermove', onGroupDrag); g.addEventListener('pointerup', endGroupDrag); g.addEventListener('pointercancel', endGroupDrag);
}
function onGroupDrag(ev) {
  if (!groupDrag) return; const p = svgPt(ev); const dx = p.x - groupDrag.px, dy = p.y - groupDrag.py;
  if (!groupDrag.moved && !groupDrag.pushed) { undoStack.push(groupDrag.snap); trimUndo(); redoStack = []; groupDrag.pushed = true; notify(); }
  groupDrag.moved = true;
  selBalls.forEach(bid => {
    const st = groupDrag.start[bid]; const nx = st.x + dx, ny = st.y + dy; layout[bid] = { x: nx, y: ny };
    const el = document.querySelector('#flowSvg .ball[data-id="' + bid + '"]'); if (el) el.setAttribute('transform', `translate(${(nx - 29).toFixed(1)},${(ny - 29).toFixed(1)})`);
  });
  schedDragPaint();
}
function endGroupDrag(ev) {
  if (!groupDrag) return; const g = ev.currentTarget;
  g.removeEventListener('pointermove', onGroupDrag); g.removeEventListener('pointerup', endGroupDrag); g.removeEventListener('pointercancel', endGroupDrag);
  const moved = groupDrag.moved; groupDrag = null; flushDragPaint(); perfOff(); if (moved) { saveLayout(); renderBoard(); }
}
function startDrag(ev) {
  if (!arrangeMode) return; if (tool === 'select') { startGroupDrag(ev); return; } if (tool !== 'move') return;
  ev.preventDefault(); const g = ev.currentTarget, id = g.dataset.id, p = svgPt(ev), cur = nodePos(id);
  drag = { id, g, dx: p.x - cur.x, dy: p.y - cur.y, moved: false, snap: { syl: JSON.stringify(SYL), lay: JSON.stringify(layout) }, pushed: false }; perfOn(); try { g.setPointerCapture(ev.pointerId); } catch (e) {}
  g.addEventListener('pointermove', onDrag); g.addEventListener('pointerup', endDrag); g.addEventListener('pointercancel', endDrag);
}
function onDrag(ev) {
  if (!drag) return; const p = svgPt(ev); let nx = p.x - drag.dx, ny = p.y - drag.dy;
  if (!drag.moved && !drag.pushed) { undoStack.push(drag.snap); trimUndo(); redoStack = []; drag.pushed = true; notify(); }
  /* smart-align: snap to any other ball's x or y within threshold */
  const TH = 6; alignGuides = []; let gx = null, gy = null;
  SYL.forEach(e => {
    if (e.id === drag.id) return; const q = nodePos(e.id);
    if (gx === null && Math.abs(q.x - nx) < TH) { nx = q.x; gx = q.x; }
    if (gy === null && Math.abs(q.y - ny) < TH) { ny = q.y; gy = q.y; }
  });
  if (gx !== null) alignGuides.push({ v: true, p: gx }); if (gy !== null) alignGuides.push({ v: false, p: gy });
  layout[drag.id] = { x: nx, y: ny }; drag.moved = true; drag.g.setAttribute('transform', `translate(${(nx - 29).toFixed(1)},${(ny - 29).toFixed(1)})`);
  schedDragPaint();
}
function drawGuides() {
  const gl = document.getElementById('bandLayer'); if (!gl) return; const bd = bounds();
  gl.innerHTML = alignGuides.map(g => g.v ? `<line x1="${g.p}" y1="0" x2="${g.p}" y2="${bd.H}" stroke="#36c2ff" stroke-width="0.7" stroke-dasharray="4 4"/>` : `<line x1="0" y1="${g.p}" x2="${bd.W}" y2="${g.p}" stroke="#36c2ff" stroke-width="0.7" stroke-dasharray="4 4"/>`).join('');
}
function endDrag(ev) {
  if (!drag) return; const g = drag.g;
  g.removeEventListener('pointermove', onDrag); g.removeEventListener('pointerup', endDrag); g.removeEventListener('pointercancel', endDrag);
  const moved = drag.moved; drag = null; alignGuides = []; flushDragPaint(); const gl = document.getElementById('bandLayer'); if (gl) gl.innerHTML = ''; perfOff(); if (moved) { saveLayout(); wireBoard(); }
}

/* ---------- inline ball editor (text / colour / number) — state for <EditModal/> ---------- */
export let editId = null;
export function openEdit(id) { const ev = byid[id]; if (!ev) return; editId = id; notify(); }
export function closeEdit() { editId = null; notify(); }
/* Values from the modal; returns an error string, or null on success. */
export async function saveEdit(vals) {
  const ev = byid[editId]; if (!ev) { closeEdit(); return null; }
  /* --- validate the prereq links before touching anything --- */
  const raw = vals.links;
  const list = [...new Set(raw.split(',').map(s => s.trim()).filter(Boolean))];
  const bad = list.filter(p => !byid[p]);
  if (bad.length) return 'No such event: ' + bad.join(', ');
  if (list.includes(ev.id)) return 'An event cannot be its own prerequisite.';
  /* cycle guard: with the new links applied, ev must not reach itself */
  {
    const kids = {}; SYL.forEach(e => {
      const ps = (e.id === ev.id) ? list : (e.prereqs || []);
      ps.forEach(p => { (kids[p] = kids[p] || []).push(e.id); });
    });
    const stack = [...(kids[ev.id] || [])], seen = new Set(); let cyc = false;
    while (stack.length) {
      const n = stack.pop(); if (n === ev.id) { cyc = true; break; }
      if (seen.has(n)) continue; seen.add(n); (kids[n] || []).forEach(c => stack.push(c));
    }
    if (cyc) return 'Those links would create a loop.';
  }
  pushUndo();
  const t = vals.text.trim();
  ev.label = (t && t !== ev.id) ? t : (t === ev.id ? undefined : (t || undefined));
  if (t === ev.id) ev.label = undefined;
  ev.type = vals.type;
  const num = vals.num.trim();
  ev.num = num === '' ? undefined : num;
  /* drop edge styling for links that no longer exist, then apply the new set */
  (ev.prereqs || []).forEach(p => { if (!list.includes(p)) delete edgeMeta[ekey(p, ev.id)]; });
  ev.prereqs = list;
  /* crew + prereq note are event-info overrides: merge, don't clobber name/fmt/hrs */
  {
    const cur = infoFor(editId);
    const o = { name: cur.name || '', fmt: cur.fmt || '', hrs: cur.hrs || '',
      crew: vals.crew.trim(), pre: vals.pre.trim() };
    const base = EVENT_INFO[editId] || {}; const diff = {};
    Object.keys(o).forEach(k => { if (o[k] !== (base[k] || '')) diff[k] = o[k]; });
    if (Object.keys(diff).length) eventInfo[editId] = diff; else delete eventInfo[editId];
    await saveEventInfo();
  }
  markDirty(); await saveLayout(); closeEdit(); refreshSyl(); renderBoard(); renderSide();
  return null;
}
export async function deleteFromEditModal() {
  const rid = editId; if (!rid || !byid[rid]) return;
  /* Ask first, close after. The editor used to close before the question was
     put, so answering "no" left the user with nothing on screen and the edit
     they were making gone. The confirm sits above the editor (71 over 60). */
  if (await deleteEventById(rid)) closeEdit();
}

/* ---------- stats ---------- */
/* Each entry carries `ready`. When nothing in a category can be flown yet this
   still names what is coming, but says so — rendered identically to a genuine
   next event, four unflyable suggestions sat under the words "either can be
   flown next" on a chart with nothing marked at all. */
export function nextOfCat(s, pred) {
  const cands = SYL.filter(e => pred(e) && !isDone(s, e.id) && gradeOf(s, e.id) !== 'na');
  if (!cands.length) return [];
  const avail = cands.filter(e => e.prereqs.every(p => isDone(s, p) || gradeOf(s, p) === 'na' || !byid[p]));
  let pool, ready;
  if (avail.length) { pool = avail.slice(); ready = true; }
  else {
    const first = cands.slice().sort((a, b) => a.seq - b.seq)[0];
    const sibs = cands.filter(e => e !== first && JSON.stringify(e.prereqs) === JSON.stringify(first.prereqs));
    pool = [first, ...sibs]; ready = false;
  }
  return pool.sort((a, b) => a.seq - b.seq).slice(0, 3).map(e => ({ id: e.id, seq: e.seq, ready }));
}
export function stats(s) {
  const r = { buckets: {}, totDone: 0, totAct: 0 };
  BUCKETS.forEach(b => {
    let total = 0, done = 0, na = 0;
    SYL.filter(e => b.types.includes(e.type)).forEach(e => {
      const g = gradeOf(s, e.id);
      if (g === 'na') { na++; return; } total++; if (DONE.has(g)) done++;
    });
    r.buckets[b.key] = { label: b.label, total, done, na, pct: total ? done / total : 0 };
    r.totDone += done; r.totAct += total;
  });
  r.totPct = r.totAct ? r.totDone / r.totAct : 0;
  r.remaining = r.totAct - r.totDone;
  return r;
}

/* date utils */
export const DAY = 864e5;
export function parseD(s) { if (!s) return null; const mm = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s); const d = mm ? new Date(+mm[1], +mm[2] - 1, +mm[3]) : new Date(s); return isNaN(d) ? null : d; }
/* Every date the app writes goes through here, so this one line sets the style
   everywhere — the line under Last Flown, the lull chips, the projected end and
   the end dates. Numeric day-first at the user's choice, 16 Aug: 16/08/26.
   en-GB is the locale that gives dd/mm/yy; the browser's own setting must NOT
   be used here, or the same file reads differently on different machines. The
   native date BOX is a separate matter — it is drawn by the device and the page
   cannot set its format at all, which is why it may still spell the month. */
export function fmt(d) { if (!d) return '—'; return d.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: '2-digit' }); }
export function daysBetween(a, b) { return Math.floor((b - a) / DAY); }
function overlapDays(s, e, a, b) { const lo = Math.max(s, a), hi = Math.min(e, b); return Math.max(0, (hi - lo) / DAY); }
export function lullDaysIn(s, a, b) { return ((lulls && lulls[s]) || []).reduce((t, l) => { const s = parseD(l.start), e = parseD(l.end); if (!s || !e) return t; return t + overlapDays(s.getTime(), e.getTime() + DAY, a, b); }, 0); }
export function flexFor(days) {
  if (days == null) return { txt: 'No flight date set', color: 'var(--grey)' };
  if (days < 7) return { txt: 'Current — no flex required', color: 'var(--marg)' };
  if (days <= 13) return { txt: '1 Optional Flex', color: 'var(--orange)' };
  if (days <= 20) return { txt: '1 Mando Flex (Convertible)', color: 'var(--red)' };
  if (days <= 30) return { txt: '2 Mando Flex (1 Mando, 1 Convertible)', color: 'var(--red)' };
  if (days <= 59) return { txt: '2 Mando Flex (2 Mando)', color: 'var(--red)' };
  if (days <= 119) return { txt: 'Short Refresher Course', color: 'var(--grey)' };
  return { txt: 'Re-course', color: 'var(--grey)' };
}
export function landingCurrency(days) {
  if (days == null) return { txt: 'No currency date set', color: 'var(--grey)' };
  if (days < 7) return { txt: 'Landing Current — No IP Required', color: 'var(--marg)' };
  return { txt: 'Landing Not Current — IP Required', color: 'var(--red)' };
}
export function sliceBg(cols) {
  if (!cols.length) return ''; if (cols.length === 1) return cols[0];
  const step = 100 / cols.length, st = [];
  cols.forEach((c, i) => st.push(`${c} ${(i * step).toFixed(2)}% ${((i + 1) * step).toFixed(2)}%`));
  return `linear-gradient(90deg,${st.join(',')})`;
}

/* ---------- provenance (9 Sep 26) ----------
   Every mark and date write stamps WHO (`by`, the editor's display name from
   Raptor through the bridge — omitted, never '', when nobody is wired) and
   WHEN (`at`, an ISO instant) on the record it changed: marks[s][id] for a
   grade, a failure or either of their days; dates[s] for the panel's four
   boxes and the Last Flown advance. Extra fields on the same records, so
   the file check's shape tests already tolerate them and undo snapshots —
   whole-record JSON — restore the stamp of the time verbatim. No screen
   reads them yet; the database step does. */
function stamp(rec) {
  if (!rec || typeof rec !== 'object') return;
  rec.at = new Date().toISOString();
  const by = whoami(); if (by) rec.by = by; else delete rec.by;
}

/* ---------- side panel actions (inputs live in <SidePanel/>) ---------- */
export async function setLastSyll(s, v) { pushMarkUndo(s, 'Last Flown (Syllabus)', 'lastSyll'); dates[s].lastSyll = v; dates[s].lastCurr = v; stamp(dates[s]); await saveDates(s); renderSide(); }
export async function setLastCurr(s, v) { pushMarkUndo(s, 'Last Flown (Currency)', 'lastCurr'); dates[s].lastCurr = v; stamp(dates[s]); await saveDates(s); renderSide(); }
export async function setDownDays(s, v) { pushMarkUndo(s, 'the down days', 'downDays'); dates[s].downDays = v; stamp(dates[s]); await saveDates(s); renderSide(); }
export async function setUpchit(s, v) { pushMarkUndo(s, 'the upchit date', 'upchit'); dates[s].upchit = v; stamp(dates[s]); await saveDates(s); renderSide(); }
/* v is kept verbatim — an empty or half-typed box must stay as typed. epwOf()
   does the coercion for the arithmetic. */
export async function setEpw(s, v) { pace[s] = { ...paceOf(s), epw: v }; await savePace(s); renderSide(); }
export async function setTarget(s, v) { pace[s] = { ...paceOf(s), target: v }; await savePace(s); renderSide(); }
export async function setTarget2(s, v) { pace[s] = { ...paceOf(s), target2: v }; await savePace(s); renderSide(); }
export async function removeLull(s, i) {
  (lulls[s] = lulls[s] || []).splice(i, 1); await saveLulls(s); renderSide();
}
export function calPrev() { calView = new Date(calView.getFullYear(), calView.getMonth() - 1, 1); notify(); }
export function calNext() { calView = new Date(calView.getFullYear(), calView.getMonth() + 1, 1); notify(); }

/* ---------- the lull calendar ----------
   One pop-up serves both making a period and changing one: first day click sets
   the start, second sets the end and saves. Paging the month must never count
   as a day click — deciding which month to look at is not choosing a date, and
   the old "set mode to Lull start, click, set mode to Lull end, click" pair is
   exactly what made this unusable. */
export let lullPick = null;   /* {student, index, start} while the pop-up is up */
export function openLullPicker(s, index) {
  const cur = (index != null) ? (lulls[s] || [])[index] : null;
  lullPick = { student: s, index: (index == null ? -1 : index), start: null };
  if (cur && cur.start) { const d = parseD(cur.start); if (d) calView = new Date(d.getFullYear(), d.getMonth(), 1); }
  notify();
}
export function closeLullPicker() { lullPick = null; notify(); }
export async function lullDayClick(iso) {
  if (!lullPick) return;
  if (!lullPick.start) { lullPick = { ...lullPick, start: iso }; notify(); return; }
  let a = lullPick.start, b = iso;
  if (parseD(b) < parseD(a)) { const t = a; a = b; b = t; }   /* clicked backwards */
  const s = lullPick.student;
  lulls[s] = lulls[s] || [];
  if (lullPick.index >= 0) lulls[s][lullPick.index] = { start: a, end: b };
  else lulls[s].push({ start: a, end: b });
  lulls[s].sort((x, y) => (x.start < y.start ? -1 : 1));
  lullPick = null;
  await saveLulls(s); renderSide();
}

/* ---------- copying periods between students ---------- */
export let lullCopy = null;   /* {from, picked:[...]} while the tick-list is up */
export function openLullCopy(from) { lullCopy = { from, picked: [] }; notify(); }
export function closeLullCopy() { lullCopy = null; notify(); }
export function toggleLullCopy(s, on) {
  if (!lullCopy) return;
  const picked = on ? [...new Set([...lullCopy.picked, s])] : lullCopy.picked.filter(x => x !== s);
  lullCopy = { ...lullCopy, picked }; notify();
}
export async function applyLullCopy() {
  if (!lullCopy) return;
  const src = (lulls[lullCopy.from] || []).map(l => ({ start: l.start, end: l.end }));
  for (const s of lullCopy.picked) { lulls[s] = src.map(l => ({ ...l })); await saveLulls(s); }
  lullCopy = null; renderSide();
}


/* The names are the information; the ring is only a key. It used to be drawn the
   other way round — a big ring with 11px names — so shrinking the whole thing to
   fit a phone made the names unreadable. Small ring, large names. */
export function renderKeyBall() {
  const n = Math.max(1, roster.length); const cx = 75, cy = 75, rO = 38, rI = 25;
  let segs = '', labels = '';
  for (let i = 0; i < n; i++) {
    const [a0, a1] = wedge(i, n); const r = roster[i]; const on = !!r && r.id === active;
    segs += `<path d="${sector(cx, cy, rO, rI, a0, a1)}" fill="${on ? '#16384a' : '#fff'}" stroke="${on ? '#36c2ff' : '#111'}" stroke-width="${on ? 2 : 1}"/>`;
    const mid = (a0 + a1) / 2 * Math.PI / 180; const lr = rO + 10;
    const x = cx + lr * Math.cos(mid), y = cy + lr * Math.sin(mid);
    const anchor = Math.cos(mid) > 0.3 ? 'start' : Math.cos(mid) < -0.3 ? 'end' : 'middle';
    labels += `<text x="${x.toFixed(0)}" y="${(y + 7).toFixed(0)}" text-anchor="${anchor}" font-size="${on ? 21 : 19}" font-weight="${on ? 800 : 700}" fill="${on ? '#5ec8ff' : '#e9ecf2'}">${escapeId(r ? r.name : '')}</text>`;
  }
  /* Wide and short: the names run out to either side, so the box wants the shape
     of a name, not of a circle. */
  return `<div style="text-align:center;margin-top:6px"><svg viewBox="-95 6 340 140" width="340" height="140" style="max-width:100%;height:auto">
  ${segs}<circle cx="${cx}" cy="${cy}" r="${rI}" fill="#f6c21a" stroke="#0007"/>
  <text x="${cx}" y="${cy + 4}" text-anchor="middle" font-size="11" font-weight="700">${escapeId(course)}</text>${labels}</svg></div>`;
}

/* ---------- popover ---------- */
export let pop = null;               /* {id, x, y} */
/* The pop-up's two date boxes. popDoneDate is the day the event was (or is
   about to be) accomplished — the mark's own date if it has one, else today,
   so a grade lands dated the day it was pressed and the box can change it
   after. popFailDate is the day the next + records a failure on — today until
   the user picks another. Both are per pop-up, never stored on their own. */
export let popDoneDate = '';
export let popFailDate = '';
export function isoOf(d) { return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
export function isoToday() { try { return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Singapore', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date()); } catch (e) { return isoOf(new Date()); } }
export function openPop(id, evt) {
  pop = { id, x: evt.clientX, y: evt.clientY };
  popDoneDate = doneDate(active, id) || isoToday();
  popFailDate = isoToday();
  notify();
}
export function closePop() { pop = null; notify(); }
/* A tap on a ball, outside arrange mode (owner, 9 Sep 26 — "click exactly at
   the portion of the pokeball that person exist in"): the ring is the crew
   picker, one wedge per student — tapping somebody else's wedge PICKS them
   (every ball then edges their wedge in cyan) and opens nothing; tapping the
   selected student's own wedge, or the centre icon, opens the details
   (DCO / DPCO / fail…) as any tap did before. Picking this way keeps the
   view where it is — the user is looking at the ball they tapped; only the
   Crew dropdown lands on the student's latest work. */
export function ballTap(id, ev) {
  const w = ev && ev.target && ev.target.closest ? ev.target.closest('.wedge') : null;
  if (w) {
    const r = roster[+w.dataset.wi];
    if (r && r.id !== active) { setActive(r.id, { land: false }); return; }
  }
  openPop(id, ev);
}

/* ---------- where each student was last marking ---------- */
async function noteLastEdit(s, id) {
  if (!s || !id) return;
  lastEdit[s] = { syl: curSyl(), event: id };
  await sSet(kLast(course, s), JSON.stringify(lastEdit[s]));
  await sSet(kLastStudent(course), s);
}
/* Scrolls the board so an event sits in the middle. The browser clamps to the
   real scroll range, so an event near an edge simply comes as close as it can. */
export function scrollToEvent(id) {
  const bd = document.getElementById('board'); if (!bd || !id) return false;
  const g = [...document.querySelectorAll('#flowSvg .ball')].find(x => x.dataset.id === id);
  if (!g) return false;
  /* The slack is sized from the board, which may have had no height when the
     chart was drawn (first mount, a hidden tab) — size it now, so the middle
     is reachable, then measure. */
  padBoard();
  const r = g.getBoundingClientRect(), b = bd.getBoundingClientRect();
  bd.scrollTop += (r.top + r.height / 2) - (b.top + b.height / 2);
  bd.scrollLeft += (r.left + r.width / 2) - (b.left + b.width / 2);
  return true;
}
/* ---------- find an event on the board ----------
   The ring is baked into the SVG string, so changing the hit means redrawing
   the board, not just notifying React. */
export let searchHit = null, searchQ = '', searchCount = 0, searchAt = 0;
/* Every id the query matches, in findEvents' order — the header's list of
   predictions under the box reads it (owner, 9 Sep 26: "a drop down menu on
   the prediction of the syllabus related to the typed text"); searchAt is
   which of them wears the ring. */
export let searchHits = [];
/* App.jsx owns the phone's Flow/Info tab. Searching from the Info tab would
   measure a display:none board and scroll to nowhere, so the search switches
   back first — same sink arrangement as setCloudSinks. */
let tabSink = null;
export function setTabSink(fn) { tabSink = fn; }
function jumpTo(id) {
  searchHit = id || null;
  if (id && tabSink) { try { tabSink('flow'); } catch (_) {} }
  renderBoard();
  if (!id) return false;
  /* After the frame, so the balls exist and applyFlowZoom's scale has landed —
     measuring in the same tick reads a stale one. Same reason init() defers. */
  if (typeof requestAnimationFrame !== 'undefined') requestAnimationFrame(() => scrollToEvent(id));
  else scrollToEvent(id);
  return true;
}
export function runSearch(q, step) {
  searchQ = q == null ? '' : q;
  const hits = findEvents(SYL, searchQ);
  searchCount = hits.length; searchHits = hits.map(h => h.id);
  if (!hits.length) {
    /* A search that finds nothing is not "another search": the board stays put
       and whatever was ringed stays ringed. */
    searchAt = 0; notify(); return false;
  }
  searchAt = step ? ((searchAt + 1) % hits.length) : 0;
  const done = jumpTo(hits[searchAt].id);
  notify(); return done;
}
/* Pick one of the predictions outright (a click on the list), or walk them
   (↑ ↓ in the box; Enter still walks forward through runSearch). */
export function searchGo(i) {
  if (!searchHits.length) return false;
  searchAt = ((i % searchHits.length) + searchHits.length) % searchHits.length;
  const done = jumpTo(searchHits[searchAt]);
  notify(); return done;
}
export function searchStep(d) { return searchGo(searchAt + d); }
export function clearSearch() {
  searchQ = ''; searchCount = 0; searchAt = 0; searchHits = [];
  if (searchHit) { searchHit = null; renderBoard(); }
  notify();
}
/* Only when the record belongs to the syllabus on screen. Switching syllabus
   under the user to chase a mark would be a surprise, and would prompt about
   unsaved flow edits into the bargain. */
export function showLastEdit(s) {
  const rec = lastEdit[s];
  if (!rec || !rec.event || rec.syl !== curSyl()) return false;
  return scrollToEvent(rec.event);
}
/* The chart's first event in syllabus order — where a student with nothing
   marked yet starts, so a crew pick has somewhere to land for them too. */
export function firstEventId() {
  let f = null; for (const e of SYL) if (!f || e.seq < f.seq) f = e;
  return f ? f.id : null;
}
export async function popGrade(v) {
  const s = active; const popId = pop && pop.id; if (!popId) return;
  if (v === 'cancel') { closePop(); return; }
  /* A syllabus with nobody on its roster leaves active null, and grading threw
     on marks[null][id]. Clicking an event on an empty course should do nothing,
     not break the page. */
  if (!s) { closePop(); return; }
  pushMarkUndo(s, 'the mark on ' + popId);
  await noteLastEdit(s, popId);
  marks[s] = marks[s] || {};
  const m = marks[s][popId] = marks[s][popId] || { g: 0, f: 0 }; m.g = v === '0' ? 0 : v;
  /* A grade that means "accomplished" is dated the day it is pressed (the box
     in the pop-up, today unless changed first); Not done and N.A. carry no
     day, so the date goes with the grade. */
  if (DONE.has(v)) m.d = popDoneDate || isoToday(); else delete m.d;
  stamp(m);
  await saveMarks(s);
  if (byid[popId] && byid[popId].type === 'flight' && DONE.has(v)) await flownOn(s, m.d);
  redrawKeepView(); closePop();
}
export async function popFail(delta) {
  const s = active; const popId = pop && pop.id; if (!popId || !s) return;
  marks[s] = marks[s] || {};
  const m = marks[s][popId] = marks[s][popId] || { g: 0, f: 0 };
  /* Not applicable means it never has to be flown, so it cannot be failed.
     Counting up was allowed and the ball then wore red failure ticks over the
     N/A colour. Existing counts are kept, not wiped — mark it back to a real
     grade and the history is still there. */
  if (delta > 0 && gradeOf(s, popId) === 'na') { flashHint('“' + popId + '” is marked N.A., so it cannot be failed.'); return; }
  pushMarkUndo(s, 'the failure count on ' + popId);
  /* + records a failure on the pop-up's failure day; − takes the LATEST one
     back. The count and the list of days are kept in step. */
  const fd = failDates(s, popId);
  for (let k = 0; k < delta; k++) fd.push(popFailDate || isoToday());
  for (let k = 0; k < -delta && fd.length; k++) fd.pop();
  m.f = fd.length; m.fd = fd;
  stamp(m);
  await saveMarks(s); redrawKeepView();
}
/* The pop-up's "Failed on" box: only where the NEXT + lands. Nothing is saved
   until a failure is recorded on that day. */
export function popFailDateChanged(v) { popFailDate = v; notify(); }
/* The pop-up's "Done on" box. Before a grade it only sets the day the grade
   will carry; on an event already accomplished it re-dates the mark at once
   (owner: "the user can also manually change the date after"). A flight's day
   is also its Last Flown, as before. */
export async function popDoneChanged(v) {
  const s = active; const popId = pop && pop.id;
  popDoneDate = v; notify();
  if (!popId || !s || !DONE.has(gradeOf(s, popId))) return;
  await setDoneDate(s, popId, v || isoToday());
}
export async function setDoneDate(s, id, iso) {
  if (!s || !marks[s] || !marks[s][id] || !DONE.has(gradeOf(s, id))) return;
  pushMarkUndo(s, 'the date on ' + id, 'doneDate:' + id);
  marks[s][id].d = iso || isoToday();
  stamp(marks[s][id]);
  await saveMarks(s); renderSide();
  if (byid[id] && byid[id].type === 'flight') await flownOn(s, marks[s][id].d);
}
/* Re-date ONE failure — the i-th (oldest first) on an event — from the full
   lowdown. An emptied box leaves the failure undated, not deleted. */
export async function setFailDate(s, id, i, iso) {
  if (!s || !marks[s] || !marks[s][id]) return;
  const fd = failDates(s, id); if (i < 0 || i >= fd.length) return;
  pushMarkUndo(s, 'the date of ' + failLabel(id, i), 'failDate:' + id + ':' + i);
  fd[i] = iso || null; marks[s][id].fd = fd;
  stamp(marks[s][id]);
  await saveMarks(s); renderSide();
}
/* The full lowdown of one student's failures, opened from the Failures title
   on the side panel (owner, 9 Sep 26: "if the user clicks on the title
   'failures' then it will show a full lowdown of all failures with a date").
   Holds the student it opened for; the rows read the live marks. */
export let failLog = null;   /* the student, while the list is up */
export function openFailLog(s) { if (!s) return; failLog = s; notify(); }
export function closeFailLog() { failLog = null; notify(); }
/* A flight marked done moves Last Flown FORWARD only. Recording an older sortie
   after a newer one used to drag both dates back to the older day, so "days
   since" jumped up and the currency and flex bars went red for a flight that
   had in fact happened since. The user's rule, 2 Sep: the most recent flight
   always wins. The two boxes in the panel still accept any date by hand. */
async function flownOn(s, d) {
  dates[s] = dates[s] || { lastSyll: null, lastCurr: null };
  const later = (a, b) => (a && a > b) ? a : b;   /* ISO yyyy-mm-dd compares as text */
  const nc = later(dates[s].lastCurr, d), ns = later(dates[s].lastSyll, d);
  if (nc === dates[s].lastCurr && ns === dates[s].lastSyll) return;
  dates[s].lastCurr = nc; dates[s].lastSyll = ns; stamp(dates[s]); await saveDates(s); renderSide();
}
function hideDetailBubble() { const b = document.getElementById('detailBubble'); if (b) b.style.display = 'none'; }
function showDetailBubble(id, anchorEl, html) {
  let b = document.getElementById('detailBubble');
  if (!b) { b = document.createElement('div'); b.id = 'detailBubble'; document.body.appendChild(b); }
  /* The event's details, then the selected student's own record on it (grade,
     the day, each failure's day) — so the bubble answers for the person the
     chart is showing, not only for the event. */
  b.innerHTML = html != null ? html : `<div class="dbId">${escapeId(id)}</div>${infoHtml(id)}${markHtml(active, id)}`;
  b.style.display = 'block'; b.style.left = '-9999px'; b.style.top = '0px';
  const r = anchorEl.getBoundingClientRect();
  const bw = b.offsetWidth, bh = b.offsetHeight, gap = 8, vw = innerWidth, vh = innerHeight;
  let left, top, sided = true;
  if (r.right + gap + bw <= vw - 6) { left = r.right + gap; }                 /* prefer right of the ball */
  else if (r.left - gap - bw >= 6) { left = r.left - gap - bw; }              /* else left */
  else { sided = false; left = Math.min(Math.max(6, r.left + r.width / 2 - bw / 2), vw - bw - 6); }
  if (sided) { top = Math.min(Math.max(6, r.top + r.height / 2 - bh / 2), vh - bh - 6); }
  else { top = (r.bottom + gap + bh <= vh - 6) ? r.bottom + gap : Math.max(6, r.top - gap - bh); }
  b.style.left = left + 'px'; b.style.top = top + 'px';
}
/* The side panel's event chips (Next event, Plannable now) open the same bubble
   the Details mode draws, anchored on the chip. */
export function showEventBubble(id, el) { if (byid[id] && el) showDetailBubble(id, el); }
export function hideEventBubble() { hideDetailBubble(); }
/* One failure's day, over its chip on the Failures card (owner, 9 Sep 26: the
   panel "reflects the dates in which they fail when the mouse hovers over it
   or on the mobile when the user clicks on it"). Same bubble, anchored on the
   chip. */
export function showFailBubble(s, id, i, el) {
  if (!el) return;
  const fd = failDates(s, id); if (i < 0 || i >= fd.length) return;
  const nm = infoFor(id).name;
  const html = `<div class="dbId">${escapeId(failLabel(id, i))}</div>` +
    (nm ? `<div style="font-weight:600;margin-bottom:3px">${escapeId(nm)}</div>` : '') +
    `<b>${escapeId(nameOf(s))}:</b> ${ORD(i + 1)} failure of ${fd.length} on ${escapeId(id)}<br>` +
    `<b>Failed on:</b> ${fd[i] ? fmt(parseD(fd[i])) : 'date not recorded'}`;
  showDetailBubble(id, el, html);
}
/* Tapping a chip snaps the chart to that ball, whichever tab a phone is on, and
   rings it the way a search does — the box shows the code, so ✕ takes the ring
   off again. */
export function showEvent(id) {
  if (!byid[id]) return false;
  hideDetailBubble();
  searchQ = id; searchCount = 1; searchAt = 0; searchHits = [id];
  const done = jumpTo(id); notify(); return done;
}
export function toggleDetails() {
  showDetails = !showDetails;
  if (!showDetails) hideDetailBubble();
  notify(); renderBoard();
}
/* ---------- event info editor ---------- */
export let infoId = null;
export function openInfo(id) { infoId = id; notify(); }
export function closeInfo() { infoId = null; notify(); }
/* the id-explicit forms — used by the inline editor in the Show All list */
export async function saveInfoFor(id, vals) {
  if (!id) return;
  const t = v => (v == null ? '' : String(v)).trim();
  const o = { name: t(vals.name), fmt: t(vals.fmt), hrs: t(vals.hrs), crew: t(vals.crew), pre: t(vals.pre) };
  /* Compare against what the box was FILLED with — base plus this syllabus's own
     profile — not the base alone. The editor pre-fills from infoFor(), so on a
     renumbered syllabus (Tx) an untouched field differs from the global base and
     used to be stored as a global override, pushing Tx wording onto every chart.
     One save of SA-5 on Tx did exactly that. */
  const base = Object.assign({}, EVENT_INFO[id] || {}, (EVENT_INFO_BY_SYL[curSyl()] || {})[id] || {});
  const plain = EVENT_INFO[id] || {};
  const diff = {}; const kept = [];
  Object.keys(o).forEach(k => {
    if (o[k] === (base[k] || '')) return;
    diff[k] = o[k];
    /* Deliberate, but equal to the baked base — only a marker keeps the scrub
       on the next load from deciding it was redundant and dropping it. */
    if (o[k] === (plain[k] || '')) kept.push(k);
  });
  if (kept.length) diff.__kept = kept;
  if (Object.keys(diff).filter(k => k !== '__kept').length) eventInfo[id] = diff; else delete eventInfo[id];
  /* Event details save themselves to the store like a mark does — no button to
     press (they used to also flag the user's file unsaved; gone 9 Sep 26). */
  await saveEventInfo(); renderBoard(); renderSide();
}
export async function resetInfoFor(id) {
  if (!id) return;
  delete eventInfo[id]; await saveEventInfo(); renderBoard(); notify();
}
export async function saveInfo(vals) {
  const id = infoId; if (!id) return;
  await saveInfoFor(id, vals); closeInfo();
}
export async function resetInfo() { await resetInfoFor(infoId); }
/* ---------- Show All ---------- */
export let showAllOpen = false;
export function openShowAll() { showAllOpen = true; notify(); }
export function closeShowAll() { showAllOpen = false; notify(); }

/* ---------- roster / course ops ---------- */
/* + Add (9 Sep 26): the same dialog it always was, with the squadron roster
   above the text box. A PICK adds the person under their callsign — upper-
   cased, as every roster name is — and records the link; a TYPED name adds an
   unlinked student exactly as before (a visitor from another unit, or the
   smoke suite's #dlgInput flow). Somebody already on the roster is not added
   twice (the silent dedupe of old) but the link is recorded for them.
   NO ROSTER = THE OLD PROMPT, byte for byte. The owner will export this app
   back out to its standalone repo, where students are created by typing a
   name and nothing feeds the people bridge (owner, 9 Sep 26: "it's just going
   to be the same old way of typing and creating a student by text"). An empty
   list must not draw an empty roster section, a search box or a "nobody
   matches" line — so the picker only exists when Raptor has handed people
   over. Everything Raptor-specific about + Add lives in this one branch. */
/* The enrolment belongs to the COURSE, not the chart: pace and lull periods
   are filed under it, so the same person added to a second chart of the
   course must land under the SAME id. Looked up across every roster of the
   course — the person id first (a callsign can change in Raptor), then the
   name — and the existing entry's name is kept so every chart agrees. Every
   syllabus the STORE knows, not the visible ones: somebody enrolled only on a
   chart that is currently hidden is still enrolled, and minting them a second
   id would split their pace and lull periods off their marks. */
export async function findEnrolment(pid, name) {
  let byPid = null, byNm = null;
  for (const n of await storeSylNames(course)) {
    const r = (n === plan.sylName) ? roster : sParse(await sGet(kRosterFor(course, n)), [], 'array').filter(isEntry);
    for (const e of r) { if (pid && e.pid === pid && !byPid) byPid = e; if (e.name === name && !byNm) byNm = e; }
  }
  return { byPid, byNm };
}
export async function addStudent() {
  /* the guard is a BARE read, not an awaited helper: every entry point here
     raises its dialog before the first await (the browser spends the click),
     and one extra microtask in front of the picker breaks that. */
  if (rosterHeld) { await uiAlert(HELD_MSG); return; }
  const people = getPeople().map(p => ({ key: p.id, label: p.cs, sub: seatWord(p.seat) + (p.q ? ' · ' + p.q : '') }));
  const r = people.length
    ? await uiPick('Add a crew member', people, { input: true, placeholder: 'Or type a callsign', listTitle: 'From the squadron roster' })
    : await uiPrompt('Student callsign:');
  let v, link = null;
  if (r && typeof r === 'object') {
    const p = getPeople().find(x => x.id === r.pick); if (!p) return;
    v = String(p.cs || '').trim().toUpperCase(); link = p.id;
  } else v = (r || '').trim().toUpperCase();
  if (!v) return;
  const { byPid, byNm } = await findEnrolment(link, v);
  /* a picked person whose callsign is already on the course under SOMEBODY
     ELSE is a conflict the user resolves, never a silent second id */
  if (link && byNm && byNm.pid && byNm.pid !== link) { await uiAlert('A student named ' + v + ' is already on this course, linked to a different person on the roster. Remove them first, or pick the other name.'); return; }
  const src = byPid || byNm;
  /* on the chain: a switch still loading would throw this push away, and a
     switch starting mid-way would re-key the saves below */
  await onChain(async () => {
    let r = src ? roster.find(x => x.id === src.id) : null;
    if (!r) {
      r = src ? { id: src.id, name: src.name } : { id: mintId(), name: v };
      const pid = (src && src.pid) || link; if (pid) r.pid = pid;
      roster.push(r); marks[r.id] = {}; dates[r.id] = { lastSyll: null, lastCurr: null };
      /* An enrolment REUSED from another chart of this course already has a
         pace and lull periods, and both hang off the course rather than the
         syllabus — but loadStudent only fills those maps for the roster it
         loaded, so without this read the panel offered the same person the
         default two events a week, and the first touch of that box would have
         saved it over the real one. One enrolment, one pace. */
      if (src) {
        const pr = await sGet(kPace(course, r.id)); if (pr) { try { pace[r.id] = JSON.parse(pr); } catch (_) {} }
        const l = await sGet(kLulls(course, r.id)); if (l) { try { lulls[r.id] = JSON.parse(l); } catch (_) {} }
      }
      await saveRoster(); await saveMarks(r.id); await saveDates(r.id);
    } else if (link && !r.pid) { r.pid = link; await saveRoster(); }
    active = r.id; refreshActive(); renderBoard(); renderSide();
  });
}
export async function removeStudent(v) {
  if (rosterHeld) { await uiAlert(HELD_MSG); return; }
  if (!await uiConfirm('Remove ' + nameOf(v) + ' from ' + plan.sylName + '?\n\nTheir marks, dates, pace and lull periods on this syllabus are deleted.')) return;
  await onChain(() => removeStudentNow(v));
}
async function removeStudentNow(v) {
  roster = roster.filter(x => x.id !== v); delete marks[v]; delete dates[v];
  /* Their undo steps go with them: an Undo that brought a removed student's
     mark back would put a mark on nobody's chart. */
  undoStack = undoStack.filter(e => e.who !== v); redoStack = redoStack.filter(e => e.who !== v);
  await saveRoster();
  /* Deleting the roster entry alone left their name and every mark sitting in
     storage — and on a shared tracker, in the file the whole team reads. Worse,
     adding the same callsign back handed them the old pace and lull periods
     while the marks started clean, which is the most confusing outcome of all. */
  await delKey(kMarksFor(course, plan.sylName, v));
  await delKey(kDatesFor(course, plan.sylName, v));
  await delKey(kDatesOld(course, v));
  await delKey(kLast(course, v));
  /* Pace and lulls belong to the course; only drop them once this person is
     off every syllabus in it, or removing them from one chart would wipe the
     pacing they still need on another. */
  let elsewhere = false;
  for (const sn of [...new Set([...SYL_NAMES, ...Object.keys(CUSTOMS || {})])]) {
    if (sn === plan.sylName) continue;
    const rr = await sGet(kRosterFor(course, sn));
    if (sParse(rr, [], 'array').some(x => isEntry(x) && x.id === v)) { elsewhere = true; break; }
  }
  if (!elsewhere) { await delKey(kPace(course, v)); await delKey(kLulls(course, v)); delete pace[v]; delete lulls[v]; }
  if ((await sGet(kLastStudent(course))) === v) await delKey(kLastStudent(course));
  if (prefGet('lastCrew:' + course) === v) prefSet('lastCrew:' + course, '');
  if (active === v) active = roster[0] ? roster[0].id : null;
  refreshActive(); renderBoard(); renderSide();
}
/* RENAME A STUDENT (10 Sep 26). A student IS an enrolment id and the name is
   only a label (stable ids), so a rename touches ONE thing — the entry's
   `name` — and nothing filed under the id moves. The pencil on each chip opens
   this. Everyone may rename, exactly as everyone may + Add and Remove; only the
   file portion (Import / Export) is the admin's, so this is NOT gated on the
   file lock. It IS held while the id-migration is still running, the same as
   adding and removing are, because saveRoster is a no-op then. A colon is
   allowed: a student name is never a storage-key segment, unlike a course or
   syllabus name. */
export async function renameStudent(id) {
  if (rosterHeld) { await uiAlert(HELD_MSG); return; }
  const cur = roster.find(x => x.id === id); if (!cur) return;
  const v = ((await uiPrompt('Rename “' + cur.name + '” to:', cur.name)) || '').trim().toUpperCase();
  if (!v || v === cur.name) return;
  /* Two students on the course sharing a name is the ambiguity + Add refuses:
     byName and the dropdown would then resolve one of them at random. Looked up
     course-wide, hidden charts included, the same way + Add finds an enrolment
     — but a match on THIS enrolment (its own name) is not a clash. */
  const { byNm } = await findEnrolment(null, v);
  if (byNm && byNm.id !== id) { await uiAlert('A student named ' + v + ' is already on this course. Pick a different name.'); return; }
  await onChain(async () => {
    /* The name is the enrolment's ONE label, and findEnrolment relies on every
       chart of the course agreeing on it (a person can sit on several syllabi
       under the same id). So set it on every roster the id appears in — the
       live roster here plus each other syllabus's stored one — not just the
       visible chart. No per-student record moves: they are keyed by the id. */
    let hit = false;
    const r = roster.find(x => x.id === id); if (r) { r.name = v; hit = true; await saveRoster(); }
    /* the SAME breadth findEnrolment uses for the duplicate check above, so a
       chart the refusal counts as part of the course is a chart the rename
       reaches — no syllabus is left reading the old label */
    for (const sn of await storeSylNames(course)) {
      if (sn === plan.sylName) continue;
      const rr = sParse(await sGet(kRosterFor(course, sn)), [], 'array');
      let changed = false;
      for (const e of rr) { if (isEntry(e) && e.id === id && e.name !== v) { e.name = v; changed = true; } }
      if (changed) { await sSet(kRosterFor(course, sn), JSON.stringify(rr)); hit = true; }
    }
    if (hit) { refreshActive(); renderBoard(); renderSide(); }
  });
}
export function setActive(v, opts) {
  active = v;
  /* ballTap passes land:false — a pick made ON the chart stays put. */
  const land = !(opts && opts.land === false);
  /* The pop-up's buttons would now grade somebody else. */
  if (pop) closePop();
  /* The yellow "can be planned next" rings are baked into the chart for ONE
     student (renderBoard → isAvail(active, …)), so the chart has to be drawn
     again for the one just picked. It was not (owner, 9 Sep 26): with ST-01
     done for student A, picking student B kept A's rings — ACG-01 lit for B,
     whose own next event is ST-01. Every other path that moves the picker
     (adding or removing a student, an undone mark, a reload) already redraws;
     this was the only one that did not.
     renderBoard replaces the board's markup, which resets its scroll to the
     top-left — and with the redraw in, a crew change snapped to the top of the
     chart (owner, 9 Sep 26, phone screenshot: "the flow chart view should
     remain the same and not snap to something else"). The chart is the SAME
     size for every student (only the rings differ), so the scroll offset
     points at the same place before and after — capture it and put it
     straight back. THEN land on the picked student's latest work, the rule
     this app has always had (owner, same day, once the snap was explained:
     "when u pick a crew it will land on their latest work without having to
     scroll"); someone with no mark on this chart yet lands on the chart's
     FIRST event instead (owner, same evening: "if nothing is clocked … it
     will show the view based on the first item") — never a bare reset to
     the top-left corner. */
  const board = document.getElementById('board');
  const sx = board ? board.scrollLeft : 0, sy = board ? board.scrollTop : 0;
  renderBoard(); renderSide();
  if (board) { board.scrollLeft = sx; board.scrollTop = sy; }
  /* After the frame, so the new balls exist and the zoom scale has landed —
     measuring in the same tick reads a stale one (same reason jumpTo and init
     defer). Guarded on `active`: a quick second pick before the frame must not
     scroll to the first one's mark. */
  const go = () => { if (active === v && !showLastEdit(v)) scrollToEvent(firstEventId()); };
  if (!land) { /* stay */ }
  else if (typeof requestAnimationFrame !== 'undefined') requestAnimationFrame(go);
  else go();
  /* Merely looking at someone counts. Before this, only grading was remembered,
     so picking a crew member and coming back tomorrow forgot them. */
  prefSet('lastCrew:' + course, v);
}

/* ---- syllabus display order ---- */
const kSylOrder = () => SYL_NS + ':sylorder';
export let SYL_ORDER = DEFAULT_SYL_ORDER.slice();
async function loadSylOrder() { try { const r = await sGet(kSylOrder()); const a = r ? JSON.parse(r) : null; SYL_ORDER = (Array.isArray(a) && a.length) ? a : DEFAULT_SYL_ORDER.slice(); } catch (e) { SYL_ORDER = DEFAULT_SYL_ORDER.slice(); } }
async function saveSylOrder() { await sSet(kSylOrder(), JSON.stringify(SYL_ORDER)); }
const kSylHidden = () => SYL_NS + ':sylhidden';
const kSylAlias = () => SYL_NS + ':sylalias';
const kSylTomb = () => SYL_NS + ':syltomb';
async function loadSylPrefs() {
  try { const r = await sGet(kSylHidden()); SYL_HIDDEN = r ? JSON.parse(r) : []; } catch (e) { SYL_HIDDEN = []; }
  try { const r = await sGet(kSylAlias()); SYL_ALIAS = r ? JSON.parse(r) : {}; } catch (e) { SYL_ALIAS = {}; }
  if (!Array.isArray(SYL_HIDDEN)) SYL_HIDDEN = [];
  if (!SYL_ALIAS || typeof SYL_ALIAS !== 'object') SYL_ALIAS = {};
  try { const r = await sGet(kSylTomb()); SYL_TOMB = r ? JSON.parse(r) : {}; } catch (e) { SYL_TOMB = {}; }
  if (!SYL_TOMB || typeof SYL_TOMB !== 'object') SYL_TOMB = {};
  applyAliasLayouts();
}
async function saveSylPrefs() { await sSet(kSylHidden(), JSON.stringify(SYL_HIDDEN)); await sSet(kSylAlias(), JSON.stringify(SYL_ALIAS)); await sSet(kSylTomb(), JSON.stringify(SYL_TOMB)); }
/* Scrub a syllabus name out of the LEGACY storage keys. */
async function purgeLegacySyl(nm) {
  const keys = [kSylsOldMaster(), ...COURSES.map(c => kSylsOwn(c.id))];
  for (const k of keys) {
    try {
      const raw = await sGet(k); if (!raw) continue;
      const L = JSON.parse(raw);
      if (L && Object.prototype.hasOwnProperty.call(L, nm)) { delete L[nm]; await sSet(k, JSON.stringify(L)); }
    } catch (_) {}
  }
}
async function delKey(k) { try { if (storage && storage.delete) { await storage.delete(k); } else { await sSet(k, ''); } } catch (_) { try { await sSet(k, ''); } catch (e) {} } }
/* Move (newNm set) or purge (newNm null) every trace of a syllabus name. */
async function moveSylData(oldNm, newNm) {
  for (const cE of COURSES) {
    const c = cE.id;   /* course keys file under the id since 1B-i (review CSID-05) */
    /* Keyed by enrolment id since 10 Sep 26. A STRING on a roster means that
       course's migration could not finish, so carry the record under its name
       as well — otherwise a syllabus rename would strand it. */
    const ids = new Set();
    const add = arr => (arr || []).forEach(e => { if (isEntry(e)) ids.add(e.id); else if (typeof e === 'string' && e) ids.add(e); });
    add(sParse(await sGet(kRosterFor(c, oldNm)), [], 'array'));
    add(sParse(await sGet(kRoster(c)), [], 'array'));   /* pre-split flat roster: names */
    if (c === course && plan && plan.sylName === oldNm) add(roster);
    for (const s of ids) {
      const m = await sGet(kMarksFor(c, oldNm, s));
      if (m != null && m !== '') { if (newNm) await sSet(kMarksFor(c, newNm, s), m); await delKey(kMarksFor(c, oldNm, s)); }
      const d = await sGet(kDatesFor(c, oldNm, s));
      if (d != null && d !== '') { if (newNm) await sSet(kDatesFor(c, newNm, s), d); await delKey(kDatesFor(c, oldNm, s)); }
    }
    {
      const r = await sGet(kRosterFor(c, oldNm));
      if (r != null && r !== '') { if (newNm) await sSet(kRosterFor(c, newNm), r); await delKey(kRosterFor(c, oldNm)); }
    }
    const l = await sGet(kLayoutFor(c, oldNm));
    if (l != null && l !== '') { if (newNm) await sSet(kLayoutFor(c, newNm), l); await delKey(kLayoutFor(c, oldNm)); }
    try {
      const pr = await sGet(kPlan(c));
      if (pr) {
        const p = JSON.parse(pr);
        if (p.sylName === oldNm) { p.sylName = newNm || firstSylName(); await sSet(kPlan(c), JSON.stringify(p)); }
      }
    } catch (_) {}
  }
}
export function allSylNames() { return [...new Set([...SYL_NAMES.filter(n => !isHidden(n)), ...Object.keys(CUSTOMS || {})])]; }
export function orderedSylNames() {
  const all = allSylNames();
  const ranked = SYL_ORDER.filter(n => all.includes(n));
  const rest = all.filter(n => !ranked.includes(n));
  return [...ranked, ...rest];
}
/* Unsaved flow edits belong to the chart on screen, and loadCourse replaces
   that chart from storage. Switching SYLLABUS asked before doing so; switching
   or adding a COURSE did not, so the edits vanished without a word and the
   unsaved flag stayed lit over a chart that had nothing unsaved. Every route
   that loads another chart asks through this one door. */
async function leaveFlowEdits(what) {
  if (!sylDirty) return true;
  if (!await uiConfirm('You have unsaved flow edits on “' + plan.sylName + '”.\n' + what)) return false;
  clearDirty(); return true;
}
export async function switchSyllabus(v) {
  if (!await leaveFlowEdits('Discard them and switch to “' + v + '”?')) { refreshSyl(); return; }
  /* the name flip rides the chain with the load: kMarks/kDates key on curSyl(),
     so a flip landing inside a roster write's tail re-keyed its saves */
  await onChain(async () => { plan.sylName = v; plan.custom = false; await savePlan(); await loadCourseNow(course); });
  refreshCourses(); refreshSyl(); refreshActive(); renderBoard(); renderSide(); setSaveStatus('switched to ' + v, 'ok');
}
/* ---------- reorder syllabi, courses or crew (modal is <OrdModal/>) ----------
   One mode variable, so only one list can ever be open and the modal keeps a
   single stable set of ids. The three openers take no argument on purpose:
   Header.jsx passes them straight to onClick, so a single openOrd(mode) would
   silently receive the click event as its mode. */
export let ordMode = null;               /* null | 'syllabus' | 'course' | 'crew' */
export function openOrd() { ordMode = 'syllabus'; notify(); }
export function openOrdCourse() { ordMode = 'course'; notify(); }
export function openOrdCrew() { ordMode = 'crew'; notify(); }
export function closeOrd() { ordMode = null; notify(); }
/* Rank against what actually exists now, the way orderedSylNames does: a
   teammate can add a course or a student over SharePoint while the modal sits
   open, and dropping them would delete their work rather than reorder it. */
function reranked(list, live) {
  const ranked = list.filter(n => live.includes(n));
  return [...ranked, ...live.filter(n => !ranked.includes(n))];
}
export async function saveOrderList(list) {
  SYL_ORDER = [...list]; await saveSylOrder();
  closeOrd(); refreshSyl();
  setSaveStatus('syllabus order saved', 'ok');
}
/* COURSES is itself the display order, so there is no separate ranking key. */
export async function saveCourseOrder(list) {
  /* the modal lists NAMES (course names are unique among courses), so rank the
     entries by them — the saveCrewOrder pattern (review CSID-09). Anyone the
     modal did not name (added meanwhile) keeps their place after. */
  const byN = new Map(COURSES.map(c => [c.name, c]));
  const ranked = list.map(n => byN.get(n)).filter(Boolean);
  COURSES = [...ranked, ...COURSES.filter(c => !ranked.includes(c))];
  await saveCourses();
  closeOrd(); refreshCourses();
  setSaveStatus('course order saved', 'ok');
}
/* renderBoard is NOT optional: wedge(i,n) slices every ball's ring by roster
   index, so without it the key re-orders while the balls keep the old
   assignment until the next grade. */
export async function saveCrewOrder(list) {
  if (rosterHeld) { closeOrd(); await uiAlert(HELD_MSG); return; }
  await onChain(async () => {
    /* the modal lists names; rank the entries by them, anyone it did not
       name (added meanwhile) keeps their place after */
    const byN = new Map(roster.map(r => [r.name, r]));
    const ranked = list.map(n => byN.get(n)).filter(Boolean);
    roster = [...ranked, ...roster.filter(r => !ranked.includes(r))];
    await saveRoster();
  });
  closeOrd(); refreshActive(); renderBoard(); renderSide();
  setSaveStatus('crew order saved', 'ok');
}
export async function restoreHiddenSyl(n) {
  SYL_HIDDEN = SYL_HIDDEN.filter(x => x !== n);
  delete SYL_TOMB[n];
  await saveSylPrefs();
  refreshSyl();
  setSaveStatus('restored built-in “' + n + '”', 'ok');
}
export async function switchCourse(v) {
  /* v is a course ID (the dropdown's option value since 1B-i). */
  const nm = courseName(v) || v;
  /* refreshCourses on refusal: the dropdown already shows the new name, and
     only a re-render puts the current course back into it. */
  if (!await leaveFlowEdits('Discard them and switch to course “' + nm + '”?')) { refreshCourses(); return; }
  /* Picking a different course is like opening the app on it, so it does
     restore that course's last-marked syllabus. Picking a syllabus does not. */
  await loadCourse(v, true); refreshCourses(); refreshSyl(); refreshActive(); renderBoard(); renderSide();
  /* Same words as a syllabus switch. Left alone, the status kept saying
     "unsaved flow edits" about a chart that had just been discarded. */
  setSaveStatus('switched to ' + nm, 'ok');
}
export async function addCourse() {
  if (!await leaveFlowEdits('Discard them and add a course?')) return;
  const v = ((await uiPrompt('New course name (e.g. 26BBSG):')) || '').trim().toUpperCase(); if (!v) return;
  if (await refuseColon(v)) return;
  if (isReservedCourseName(v)) { await uiAlert('“' + v + '” is a name the app reserves internally — pick a different course name.'); return; }
  if (COURSES.some(c => c.name === v)) { await uiAlert('A course named ' + v + ' already exists.'); return; }
  /* Born id-keyed (review CSID-05): mint the id, file everything under it.
     Front, not back: the newest course is the one being set up, so it should be
     the one the dropdown offers first and the one the app falls back to. */
  const id = mintCourseId();
  COURSES.unshift({ id, name: v }); await saveCourses();
  const chosen = curSyl(); const useName = allSylNames().indexOf(chosen) >= 0 ? chosen : firstSylName();
  await sSet(kPlan(id), JSON.stringify({ lulls: [], mode: 'pace', epw: 2, target: null, sylName: useName, custom: false }));
  for (const sn of allSylNames()) await sSet(kRosterFor(id, sn), JSON.stringify([]));
  await sSet(kRosterMig(id), '1');   /* clean start: add students yourself, no marks carried over */
  await sSet(kIdMig(id), '1');       /* born id-keyed — there is nothing to convert */
  await loadCourse(id); refreshCourses(); refreshSyl(); refreshActive(); renderBoard(); renderSide();
  setSaveStatus('course ' + v + ' created on the ' + useName + ' syllabus — add students to begin', 'ok');
}
export async function renCourse() {
  if (!await leaveFlowEdits('Discard them and rename the course?')) return;
  const old = course;                       /* the course ID — unchanged by a rename */
  const oldNm = courseName(old);
  const v = ((await uiPrompt('Rename course “' + oldNm + '” to:', oldNm)) || '').trim().toUpperCase();
  if (!v || v === oldNm) return;
  if (await refuseColon(v)) return;
  if (isReservedCourseName(v)) { await uiAlert('“' + v + '” is a name the app reserves internally — pick a different course name.'); return; }
  if (COURSES.some(c => c.name === v)) { await uiAlert('A course named ' + v + ' already exists.'); return; }
  /* LABEL-ONLY since course ids (1B-i): the course IS its id, which does not
     change, and every record — plan, rosters, marks, dates, pace, lulls,
     last-crew — files under that id. So a rename sets the entry's name and moves
     nothing. This replaces a ~65-line copy-every-record-then-verify-then-delete
     apparatus and, with it, the half-carry failure it guarded (a rename that
     stranded a course when storage refused one write). */
  const e = courseEntry(old); if (e) e.name = v;
  await saveCourses();
  refreshCourses(); refreshSyl(); refreshActive(); renderBoard(); renderSide();
  setSaveStatus('renamed ' + oldNm + ' → ' + v, 'ok');
}
export async function delCourse() {
  if (COURSES.length <= 1) { await uiAlert('Keep at least one course.'); return; }
  if (!await leaveFlowEdits('Discard them and delete the course?')) return;
  if (!await uiConfirm('Delete course ' + curCourseName() + '? (marks remain in storage)')) return;
  COURSES = COURSES.filter(c => c.id !== course); await saveCourses();
  await loadCourse(COURSES[0] && COURSES[0].id); refreshCourses(); refreshActive(); renderBoard(); renderSide();
}

/* ---------- syllabus editor (JSON modal) ---------- */
export let sylModalOpen = false;
export function openModal() { sylModalOpen = true; notify(); }
export function closeModal() { sylModalOpen = false; notify(); }
/* Returns an error string, or null on success. */
export async function saveSylText(text) {
  try {
    const arr = JSON.parse(text);
    if (!Array.isArray(arr)) throw new Error('Must be a JSON array');
    arr.forEach((e, i) => {
      if (!e.id || !e.type) throw new Error('Event ' + i + ' needs id and type');
      e.phase = e.phase || 'Unphased'; e.seq = (e.seq != null) ? e.seq : i; e.prereqs = e.prereqs || [];
    });
    pushUndo(); SYL = arr; byid = {}; SYL.forEach(e => byid[e.id] = e); markDirty(); closeModal(); refreshSyl(); renderBoard(); renderSide();
    return null;
  } catch (err) { return err.message; }
}

/* ---------- arrange mode, editor tools, duplicate & save changes ---------- */
/* STRUCTURE edits — adding or removing events, connecting prerequisites,
   drawn lines, arrows, fonts, the JSON editor, undo/redo — are the ONE kind of
   work that waits for ✓ Save changes: the editing session is a unit (undo runs
   back to the last save), so SYL is written on the press. A MOVED BALL is not
   one of them: endDrag saves its position on the drop (saveLayout), as marks,
   dates, students and event details save themselves (see saveSyl…). */
export let sylDirty = false;
function markDirty() { sylDirty = true; notify(); }
/* Both stacks. Leaving redoStack behind let a Redo pressed after a syllabus
   change write the PREVIOUS chart's positions over the new one and save them
   on the spot — four moved boxes on 2026 landed on Tx 2026 under test. */
function clearDirty() { sylDirty = false; undoStack = []; redoStack = []; notify(); }

export async function persistSyl() {
  if (!sylDirty && CUSTOMS[plan.sylName]) { setSaveStatus('no changes to save', 'ok'); return true; }
  const nm = plan.sylName;
  /* Built-ins are editable: the saved version is stored as a master override
     under the SAME name and takes precedence when the syllabus is loaded. */
  CUSTOMS[nm] = JSON.parse(JSON.stringify(SYL));
  await sSet(kSyls(course), JSON.stringify(CUSTOMS));
  clearDirty(); refreshSyl(); renderBoard(); renderSide();
  setSaveStatus('syllabus “' + nm + '” saved' + (SYLLABI[nm] ? ' (overrides the built-in)' : ''), 'ok');
  return true;
}

/* The syllabus-editing commands (duplicate, add, rename, delete) all end by
   pointing the plan at a syllabus, flushing, and reloading. The flip and the
   load ride the chain together, as switchSyllabus's do — see loadChain. */
async function switchSylNow(nm) {
  await onChain(async () => {
    plan.sylName = nm; plan.custom = false; await savePlan();
    if (typeof flushNow === 'function') { try { await flushNow(); } catch (_) {} }
    clearDirty(); await loadCourseNow(course);
  });
}
export async function dupSyl() {
  if (rosterHeld) { await uiAlert(HELD_MSG); return; }   /* the copy would carry an empty crew list */
  const src = plan.sylName;
  const nm = ((await uiPrompt('Name for the duplicated syllabus:', src + ' copy')) || '').trim();
  if (!nm) return;
  if (await refuseColon(nm)) return;
  if (allSylNames().includes(nm)) { await uiAlert('A syllabus with that name already exists.'); return; }
  try {
    if (SYL_TOMB[nm]) { delete SYL_TOMB[nm]; await saveSylPrefs(); }
    /* 1) flow: copy exactly what's on screen now (captures any unsaved arrange edits) */
    CUSTOMS[nm] = JSON.parse(JSON.stringify(SYL));
    await sSet(kSyls(course), JSON.stringify(CUSTOMS));
    /* 2) layout: snapshot a COMPLETE set of positions for every event */
    await sSet(kLayoutFor(course, nm), JSON.stringify(await snapshotLayout(src)));
    /* 3) marks: copy every student's progress from the source syllabus */
    for (const { id: s } of roster) {
      const m = await sGet(kMarksFor(course, src, s)); if (m) await sSet(kMarksFor(course, nm, s), m);
      const d = await sGet(kDatesFor(course, src, s)); if (d) await sSet(kDatesFor(course, nm, s), d);
    }
    await sSet(kRosterFor(course, nm), JSON.stringify(roster));   /* same students on the copy */
    /* 4) switch to the copy, flush to storage, then reload cleanly */
    await switchSylNow(nm);
    refreshSyl(); refreshActive(); renderBoard(); renderSide();
    setSaveStatus('duplicated as “' + nm + '”', 'ok');
  } catch (err) {
    delete CUSTOMS[nm];
    await uiAlert('Could not duplicate the syllabus — nothing was changed.\n\n' + ((err && err.message) || err));
    await loadCourse(course); refreshSyl(); refreshActive(); renderBoard(); renderSide();
  }
}

/* Add syllabus: a brand-new EMPTY sheet (no events, no marks). */
export async function addSyl() {
  const nm = ((await uiPrompt('Name for the new (empty) syllabus:', 'New syllabus')) || '').trim();
  if (!nm) return;
  if (await refuseColon(nm)) return;
  if (allSylNames().includes(nm)) { await uiAlert('A syllabus with that name already exists.'); return; }
  try {
    if (SYL_TOMB[nm]) { delete SYL_TOMB[nm]; await saveSylPrefs(); }
    CUSTOMS[nm] = [];                         /* empty event list */
    await sSet(kSyls(course), JSON.stringify(CUSTOMS));
    await sSet(kLayoutFor(course, nm), JSON.stringify({}));  /* blank canvas */
    await sSet(kRosterFor(course, nm), JSON.stringify([]));  /* no students yet */
    await switchSylNow(nm);
    refreshSyl(); refreshActive(); renderBoard(); renderSide();
    setSaveStatus('added empty syllabus “' + nm + '”', 'ok');
    if (!arrangeMode) flashHint('Empty sheet ready — hit “✎ Edit”, then use + Flight / + Acad / + Test / + Sim / + CFT to add events.');
  } catch (err) {
    delete CUSTOMS[nm];
    await uiAlert('Could not add the syllabus — nothing was changed.\n\n' + ((err && err.message) || err));
    await loadCourse(course); refreshSyl(); refreshActive(); renderBoard(); renderSide();
  }
}

/* Rename syllabus: works on built-ins too. */
export async function renSyl() {
  const old = plan.sylName;
  const nm = ((await uiPrompt('Rename syllabus “' + old + '” to:', old)) || '').trim();
  if (!nm || nm === old) return;
  if (await refuseColon(nm)) return;
  if (allSylNames().includes(nm)) { await uiAlert('A syllabus named “' + nm + '” already exists.'); return; }
  try {
    if (SYL_TOMB[nm]) delete SYL_TOMB[nm];
    const snap = await snapshotLayout(old);
    CUSTOMS[nm] = JSON.parse(JSON.stringify(SYL));
    delete CUSTOMS[old];
    await sSet(kSyls(course), JSON.stringify(CUSTOMS));
    SYL_TOMB[old] = 1;
    await purgeLegacySyl(old);
    await moveSylData(old, nm);
    await sSet(kLayoutFor(course, nm), JSON.stringify(snap));
    const base = SYL_ALIAS[old] || (SYLLABI[old] ? old : null);
    if (base) { SYL_ALIAS[nm] = base; if (DEFAULT_LAYOUTS[base]) DEFAULT_LAYOUTS[nm] = DEFAULT_LAYOUTS[base]; }
    delete SYL_ALIAS[old];
    if (SYLLABI[old] && !isHidden(old)) SYL_HIDDEN.push(old);
    await saveSylPrefs();
    SYL_ORDER = SYL_ORDER.map(n => n === old ? nm : n); await saveSylOrder();
    await switchSylNow(nm);
    refreshCourses(); refreshSyl(); refreshActive(); renderBoard(); renderSide();
    setSaveStatus('renamed “' + old + '” → “' + nm + '”', 'ok');
  } catch (err) {
    await uiAlert('Could not rename the syllabus.\n\n' + ((err && err.message) || err));
    await loadCourse(course); refreshSyl(); refreshActive(); renderBoard(); renderSide();
  }
}

/* Delete syllabus: removes ANY syllabus - custom or built-in. */
export async function delSyl() {
  const nm = plan.sylName, isB = !!builtinOf(nm);
  if (allSylNames().length <= 1) { await uiAlert('Keep at least one syllabus.'); return; }
  let confirmed = false;
  if (isB && CUSTOMS[nm]) {
    const c = await uiChoice('“' + nm + '” is a built-in syllabus that has saved edits.\n\nDelete it outright, or just throw away your edits and keep the shipped version?',
      'Delete it', 'Revert edits only');
    if (c === 'cancel') return;
    if (c === 'ok') confirmed = true;
    if (c === 'alt') {
      delete CUSTOMS[nm];
      await sSet(kSyls(course), JSON.stringify(CUSTOMS));
      if (typeof flushNow === 'function') { try { await flushNow(); } catch (_) {} }
      clearDirty(); await loadCourse(course);
      refreshSyl(); refreshActive(); renderBoard(); renderSide();
      setSaveStatus('“' + nm + '” reverted to built-in', 'ok');
      return;
    }
  }
  if (!confirmed && !await uiConfirm('Delete syllabus “' + nm + '”?\n\nThis removes its flow, its layout and every student’s marks on it, in every course.' +
    (isB ? '\n\nIt is a built-in — you can bring it back later from ⇅ Reorder.' : '\nThis cannot be undone.'))) return;
  try {
    delete CUSTOMS[nm];
    await sSet(kSyls(course), JSON.stringify(CUSTOMS));
    if (SYLLABI[nm] && !isHidden(nm)) SYL_HIDDEN.push(nm);
    SYL_TOMB[nm] = 1;
    if (SYL_ALIAS[nm]) delete DEFAULT_LAYOUTS[nm];   /* alias copy only - never the shipped one */
    delete SYL_ALIAS[nm];
    await purgeLegacySyl(nm);
    await moveSylData(nm, null);
    await saveSylPrefs();
    SYL_ORDER = SYL_ORDER.filter(n => n !== nm); await saveSylOrder();
    await switchSylNow(firstSylName());
    refreshCourses(); refreshSyl(); refreshActive(); renderBoard(); renderSide();
    setSaveStatus('deleted syllabus “' + nm + '”', 'ok');
  } catch (err) {
    await uiAlert('Could not delete the syllabus.\n\n' + ((err && err.message) || err));
    await loadCourse(course); refreshSyl(); refreshActive(); renderBoard(); renderSide();
  }
}

export function toggleArrange() {
  arrangeMode = !arrangeMode;
  /* Capture the framing FIRST (see original comments). */
  if (arrangeMode) { captureViewFromScroll(); setTool('move'); renderBoard(); applyView(); }
  else {
    connectSrc = null; const keep = { x: view.x, y: view.y, k: view.k }; renderBoard(); view = keep; restoreScrollFromView();
    if (sylDirty) setSaveStatus('unsaved flow edits — hit “Save changes”', 'saving');
  }
  notify();
}
export function fitViewClick() { if (arrangeMode) fitView(); }
/* Escape finishes an in-progress line */
export function handleEscapeKey(e) {
  if (e.key !== 'Escape') return;
  /* A question on top of everything else goes first, and answers "no": the
     confirm behind Delete and Remove used to ignore the key entirely. Only this
     one closes here — the thing that asked the question stays open underneath,
     so one press can never fall through and shut two layers at once. */
  if (dlg) { e.preventDefault(); dlgClose(dlg.input ? null : false); return; }
  /* Escape abandons a half-picked lull period rather than saving one end of it. */
  if (lullCopy) { e.preventDefault(); closeLullCopy(); return; }
  if (lullPick) { e.preventDefault(); closeLullPicker(); return; }
  /* Escape used to close the lull calendar and nothing else, so the grading
     pop-up, Show All and Save a copy each needed their own dismiss found by
     eye — four different contracts for one gesture. Innermost first, matching
     what sits on top: Save a copy, then the grading pop-up, then Show All.
     Show All's own handler only fires while focus is inside the panel, which
     it usually is not. */
  if (copyOpen) { e.preventDefault(); closeCopy(); return; }
  /* The three editors (event details, the reorder list, the poke-ball editor)
     and the raw event list were the last dialogs Escape did nothing for. */
  if (infoId != null) { e.preventDefault(); closeInfo(); return; }
  if (failLog) { e.preventDefault(); closeFailLog(); return; }
  if (pop) { e.preventDefault(); closePop(); return; }
  if (showAllOpen) { e.preventDefault(); closeShowAll(); return; }
  if (ordMode) { e.preventDefault(); closeOrd(); return; }
  if (editId != null) { e.preventDefault(); closeEdit(); return; }
  if (sylModalOpen) { e.preventDefault(); closeModal(); return; }
  if (!arrangeMode || tool !== 'line' || !drawing) return;
  e.preventDefault(); finishLine(drawing.pts.length >= 2);
}
/* Delete / Backspace removes the current selection while arranging */
export async function handleDeleteKey(e) {
  if (e.key !== 'Delete' && e.key !== 'Backspace') return;
  if (!arrangeMode) return;
  if (selLine && !selBalls.size) {
    const t0 = e.target, g0 = (t0 && t0.tagName || '').toLowerCase();
    if (g0 === 'input' || g0 === 'textarea' || g0 === 'select' || (t0 && t0.isContentEditable)) return;
    e.preventDefault(); deleteLine(selLine); return;
  }
  if (!selBalls.size) return;
  const t = e.target, tag = (t && t.tagName || '').toLowerCase();
  if (tag === 'input' || tag === 'textarea' || tag === 'select' || (t && t.isContentEditable)) return;
  if (editId != null || sylModalOpen) return;
  e.preventDefault();
  await deleteEvents([...selBalls]);
}
/* Toolbar: tool select with delete-selection shortcut behaviour */
export async function toolButtonClick(t) {
  if (t === 'delball' && selBalls.size) { await deleteEvents([...selBalls]); return; }
  if (t === 'delball' && selLine) { deleteLine(selLine); return; }
  setTool(t);
}
export function arrowClick() {
  const FL = lineById(selLine);
  if (FL) {
    pushUndo(); FL.arrow = (lineArrow(FL) + 1) % 3;
    const made = deriveLineLinks();
    markDirty(); saveLayout(); renderBoard(); renderSide();
    const where = FL.arrow === 0 ? 'Arrow at the finish end.' : FL.arrow === 1 ? 'Arrow at the start end.' : 'No arrow — using the direction it was drawn in.';
    flashHint(made.length ? (where + ' Linked ' + made.join(', ')) : where); return;
  }
  if (!selEdge) { flashHint('Select a line first — Line or Edit lines, then click the line.'); return; }
  pushUndo(); const m = edgeMeta[selEdge] = edgeMeta[selEdge] || {}; m.arrow = ((m.arrow == null ? 0 : m.arrow) + 1) % 3; markDirty(); saveLayout(); renderBoard();
}
export function selectAllClick() {
  if (!arrangeMode) return;
  if (selBalls.size === SYL.length) selBalls = new Set(); else selBalls = new Set(SYL.map(e => e.id));
  renderBoard(); flashHint(selBalls.size ? 'All balls selected — change the Font box to resize their labels.' : 'Selection cleared.');
}
/* What the Font box should show: the selected balls' size if there is a
   selection, else the chart-wide one. It used to be hard-wired to 8.5. */
export function currentFont() {
  const f = layout.__font || {};
  const id = selBalls.size ? [...selBalls][0] : null;
  return (id && f[id]) || f.__all || 8.5;
}
export function setFont(v) {
  v = parseFloat(v) || 8.5;
  pushUndo(); layout.__font = layout.__font || {};
  if (selBalls.size) selBalls.forEach(id => layout.__font[id] = v); else layout.__font.__all = v;
  markDirty(); saveLayout(); renderBoard();
}
export async function resetLayoutClick() {
  /* Name the lines. "Manual moves" read as "the boxes I dragged", but this
     empties the whole layout — every hand-drawn line goes with it, and once any
     later edit saves the empty state the shipped lines stop coming back. */
  const nLines = (layout.__lines || []).length;
  const what = nLines
    ? 'Reset this syllabus back to the course-map layout?\n\nThis puts every box back where the map has it AND deletes all ' + nLines + ' lines drawn on this chart.'
    : 'Reset your manual moves and return to the course-map layout for this syllabus?';
  if (!await uiConfirm(what)) return;
  pushUndo();                    /* so ↶ Undo can actually take it back */
  layout = {}; await saveLayout(); renderBoard();
}
/* Resolves true when something was deleted, false when the user said no. */
async function deleteEvents(ids) {
  const list = [...new Set((ids || []).filter(id => id && byid[id]))];
  if (!list.length) return false;
  const names = list.map(id => byid[id].label || id);
  const preview = names.slice(0, 12).join(', ') + (names.length > 12 ? ' … (+' + (names.length - 12) + ' more)' : '');
  const msg = list.length === 1
    ? 'Delete ' + names[0] + ' from this syllabus?'
    : 'Delete these ' + list.length + ' events from this syllabus?\n\n' + preview;
  if (!await uiConfirm(msg)) return false;
  pushUndo();
  const kill = new Set(list);
  SYL = SYL.filter(e => !kill.has(e.id));
  SYL.forEach(e => { e.prereqs = (e.prereqs || []).filter(p => !kill.has(p)); });
  LINES().forEach(L => {
    ['a', 'b'].forEach(k => {
      const an = L[k]; if (!an) return;
      if (an.t === 'ball' && kill.has(an.id)) L[k] = null;
      else if (an.t === 'edge' && (kill.has(an.p) || kill.has(an.c))) L[k] = null;
    });
  });
  if (layout.__derived) layout.__derived = layout.__derived.filter(k => { const p = k.split('▸')[0], c = k.split('▸')[1]; return !kill.has(p) && !kill.has(c); });
  byid = {}; SYL.forEach(e => byid[e.id] = e);
  kill.forEach(id => {
    delete layout[id];
    if (layout.__font) delete layout.__font[id];
  });
  for (const k in edgeMeta) { const parts = k.split('▸'); if (kill.has(parts[0]) || kill.has(parts[1])) delete edgeMeta[k]; }
  {
    const live = ek => {
      if (isLineKey(ek)) return true;   /* free-line keys aren't event pairs */
      const parts = ek.split('▸'); return !kill.has(parts[0]) && !kill.has(parts[1]);
    };
    merges = new Set([...merges].filter(mk => (mk + '').split('|').every(live)));
    unmerges = new Set([...unmerges].filter(mk => (mk + '').split('|').every(live)));
  }
  selBalls = new Set();
  markDirty(); await saveLayout(); refreshSyl(); renderBoard(); renderSide();
  setSaveStatus(list.length + ' event' + (list.length === 1 ? '' : 's') + ' deleted — Undo restores them', 'ok');
  return true;
}
async function deleteEventById(rid) {
  /* clicking a ball that belongs to the current selection removes the whole group */
  if (selBalls.size > 1 && selBalls.has(rid)) return deleteEvents([...selBalls]);
  return deleteEvents([rid]);
}

/* ---------- save status + backup (auto-save + manual backup button) ---------- */
/* Starts blank, not "saved". A fresh load has saved nothing, and claiming it
   spends the one indicator the user has for whether their work is safe. */
export let saveStat = { text: '', cls: '' };
/* A bare green "saved" used to be shown for EVERY 'ok', whatever had actually
   happened — so switching syllabus reported "saved", and a successful syllabus
   write reported the same words as a successful file write. Sat next to the
   orange "Save changes" button (which watches a different flag) it told the
   user their work was both safe and at risk in the same six pixels.
   Now only a caller that passes no message gets the bare word; anything that
   names what it did says so. Three callers rely on the empty form. */
function setSaveStatus(msg, cls) {
  saveStat = {
    text: (cls === 'saving' ? (msg ? '● ' + msg : '● saving…')
      : cls === 'ok' ? (msg ? '● ' + msg : '● saved')
        : '● ' + msg),
    cls: cls || ''
  };
  notify();
}

/* Seed a brand-new browser from SEED_STATE, once.

   It used to delete every stored syllabus and layout first, so that a freshly
   baked standalone HTML would show its own charts rather than the viewer's
   saved overrides. That export is gone, and with it the only reason to do
   something so destructive: bumping SEED_STAMP would now wipe the user's own
   charts out of their browser. Seeding only adds. */
async function applyBundle() {
  if (typeof SEED_STAMP === 'undefined' || !SEED_STAMP) return;
  let cur = null; try { cur = await sGet('v3:seedstamp'); } catch (e) {}
  if (cur === SEED_STAMP) return;
  for (const k in (SEED_STATE || {})) { try { await sSet(k, SEED_STATE[k]); } catch (_) {} }
  try { await sSet('v3:seedstamp', SEED_STAMP); } catch (e) {}
}

/* ---------- sync integration ---------- */
export { loadLatest };
function isUiBusy() {
  try {
    if (arrangeMode) return true;
    if (drag) return true;
    if (editId != null || sylModalOpen) return true;
    if (pop) return true;
  } catch (e) {}
  return false;
}
/* re-render the app from a refreshed store (used by both sync layers + import) */
async function reloadFromStore() {
  const keepActive = active;
  const keepCal = calView;
  await loadCourses();
  try { await loadSylPrefs(); } catch (_) {}
  await loadSylOrder();
  await loadEventInfo();
  const c = COURSES.some(x => isCourseEntry(x) && x.id === course) ? course : (COURSES[0] && COURSES[0].id);
  await loadCourse(c);
  if (keepActive && roster.some(r => r.id === keepActive)) active = keepActive;
  if (keepCal) calView = keepCal;
  refreshCourses(); refreshSyl(); refreshActive(); renderBoard(); renderSide();
}

/* ---------- reading state out, for the user's file ----------
   Two halves that never mix: charts draw the flow and name nobody; students
   name and grade people and hold no chart. See
   docs/superpowers/specs/2026-08-07-syllabus-file-design.md */

/* Charts: everything that draws the flow. Never a person. */
export async function collectCharts(names) {
  const list = (names && names.length) ? names : orderedSylNames();
  const syllabi = {}, layouts = {}, order = [];
  for (const n of list) {
    const src = sylSource(n); if (!src) continue;
    order.push(n);
    syllabi[n] = JSON.parse(JSON.stringify(src));
    layouts[n] = await layoutSnapshotFor(n, syllabi[n]);
  }
  const ei = JSON.parse(JSON.stringify(EVENT_INFO));
  for (const k in (eventInfo || {})) ei[k] = Object.assign({}, ei[k] || {}, eventInfo[k]);
  return { order, syllabi, layouts, eventInfo: ei };
}

/* Students: everything that names or grades a person. Never a chart.
   Lulls and pace hang off the course, not a syllabus, so they ride beside
   plan rather than inside bySyllabus (additive: an older file simply has no
   key here and migrates from plan.lulls when it is opened). */
export async function collectStudents() {
  const byCourse = {};
  for (const cE of COURSES) {
    const c = cE.id;   /* export keys byCourse by the course id since 1B-i */
    const { block } = await readCourseBlock(c, false);
    /* a course the migration could not finish (a write that did not land)
       still exports whole: converted on the fly, its old links folded in */
    if (await sGet(kIdMig(c))) { byCourse[c] = block; continue; }
    const links = sParse(await sGet(kLinks), {}, 'object')[c] || null;
    /* ids.js REFUSES an inconsistent block by throwing, which is right when it
       guards a file being opened — but here one damaged course would take the
       whole export down with it, and before stable ids this collector could
       not throw at all. So the conversion is per course: a course that refuses
       is exported exactly as it is filed, still name-keyed, and the reason is
       named in the console. There is no per-item user channel on this path —
       saveCopyClick's only failure message covers the whole write — and a
       collector must not raise a dialog of its own: it is also what the tests
       and the smoke suite call. */
    try { byCourse[c] = upgradeCourseBlock(block, links).block; }
    catch (err) {
      byCourse[c] = block;
      try { console.warn('Tracker export: course “' + cE.name + '” could not be re-keyed to enrolment ids, so it is exported as it is filed. ' + ((err && err.message) || err)); } catch (_) {}
    }
  }
  /* courses ride out as {id,name} entries (file v2); byCourse is keyed by id */
  return { courses: COURSES.slice(), byCourse };
}

/* ---------- writing state back in, from the user's file ---------- */

/* Charts only. Writes syllabus definitions, layouts and event info — and
   nothing filed under a student. THE RULE: no roster, mark or date key may be
   written here, so importing a chart can never disturb anyone's progress.
   scripts/smoke.mjs pins that by watching every localStorage write. */
export async function applyCharts(charts, opts) {
  const o = opts || {};
  const list = (o.names && o.names.length) ? o.names : (charts.order || Object.keys(charts.syllabi || {}));
  const applied = [];
  for (const src of list) {
    const events = (charts.syllabi || {})[src];
    if (!events) continue;
    const target = (o.mode === 'add' && o.rename && o.rename.from === src) ? o.rename.to : src;
    CUSTOMS[target] = JSON.parse(JSON.stringify(events));
    const lay = (charts.layouts || {})[src];
    if (lay) await sSet(kLayoutFor(course, target), JSON.stringify(lay));
    if (SYL_TOMB[target]) delete SYL_TOMB[target];
    if (SYL_HIDDEN.indexOf(target) >= 0) SYL_HIDDEN = SYL_HIDDEN.filter(n => n !== target);
    if (!SYL_ORDER.includes(target)) SYL_ORDER.push(target);
    applied.push(target);
  }
  /* The file records the order the user put their charts in. It was written on
     save and never read back, so opening the file elsewhere gave the shipped
     order with the extras tacked on the end. Only on a whole-file open —
     importing one syllabus must not reshuffle everything else. */
  if (!o.names && Array.isArray(charts.order) && charts.order.length) {
    const rest = SYL_ORDER.filter(n => !charts.order.includes(n));
    SYL_ORDER = [...charts.order, ...rest];
  }
  await sSet(kSyls(course), JSON.stringify(CUSTOMS));
  if (charts.eventInfo) {
    for (const k in charts.eventInfo) eventInfo[k] = Object.assign({}, eventInfo[k] || {}, charts.eventInfo[k]);
    scrubEventInfo(); /* the file carries the whole table; keep only real edits */
    await saveEventInfo();
  }
  await saveSylPrefs(); await saveSylOrder();
  await loadCourse(course);
  refreshSyl(); renderBoard(); renderSide();
  return { applied };
}

/* People only. Never writes a syllabus or layout key. */
export async function applyStudents(students, links) {
  /* COURSE-ID LAYER (stable ids 1B-i). A v1 file keys courses by NAME (and
     carries a name-keyed links block); a v2 file keys by course id. Upgrade to
     id-keyed, then reconcile the file's course ids against the store's — a
     name-match adopts the STORE's id (mirror of the enrolment reconcile), a
     name/id contradiction is REFUSED, and a file course named a reserved
     namespace or carrying an invalid id is turned away — all before a single
     record is written. After this, `students.byCourse` and `links` are keyed by
     course id, and `courseEntries` are the {id,name} entries to merge in. */
  const up0 = upgradeCourses(students || {}, links || null);
  for (const e of (up0.students.courses || [])) {
    if (isReservedCourseName(e.name)) throw new Error('That file could not be brought in: a course named “' + e.name + '” clashes with a name the app reserves internally. Rename it in the file, then import again — nothing has been changed.');
    if (!isCourseId(e.id)) throw new Error('That file could not be brought in: a course in it has an invalid id. Nothing has been changed.');
  }
  const rec = reconcileCourseIds(up0.students, up0.links, COURSES);
  if (rec.conflicts.length) { const x = rec.conflicts[0]; throw new Error('The courses could not be brought in: “' + x.name + '” in the file is a different course than the one already here. Rename one of them, then import again — nothing has been changed.'); }
  students = rec.students; links = rec.links || {};
  const courseEntries = students.courses || [];       /* {id,name}[] */
  const courses = courseEntries.map(e => e.id);        /* course IDS to write */
  const cName = id => { const e = courseEntries.find(x => x.id === id); return (e && e.name) || courseName(id) || id; };
  /* REFUSE A FILE THAT NAMES TWO DIFFERENT PEOPLE UNDER ONE CALLSIGN (bug-check,
     11 Sep 26 — Astra/Fable). applyStudents writes course-by-course; a clash
     caught mid-loop would leave earlier courses written and the list unmerged,
     and the old code silently DROPPED the store's student (name guard below),
     orphaning their marks. So check EVERY course first — against the enrolments
     already here (reconcileIds) AND the legacy names still carried under a link
     (a course not yet id-converted) — and throw before anything is written. The
     message reads like the conflict ids.js/fileFormat.js already hand the user;
     importClick catches it and nothing is touched. This also hoists the
     upgradeCourseBlock validation ahead of the first write, so a bad file
     (empty name, etc.) no longer half-imports either. */
  for (const c of courses) {
    const pcs = (students.byCourse || {})[c] || {};
    const pUp = upgradeCourseBlock({ plan: pcs.plan, lulls: pcs.lulls, pace: pcs.pace, bySyllabus: pcs.bySyllabus }, (links || {})[c] || null).block;
    const pExisting = [], pSyls = await storeSylNames(c);
    for (const n of pSyls) for (const e of sParse(await sGet(kRosterFor(c, n)), [], 'array')) if (isEntry(e)) pExisting.push(e);
    const { conflicts } = reconcileIds(pUp, pExisting);
    /* a course still on its legacy bare-string roster carries its people as
       names with a v3:links link; reconcileIds cannot see them (not entries),
       so match the file's linked people against those names by hand. Read the
       per-syllabus rosters AND the pre-syllabus FLAT roster (v3:<c>:roster) —
       a course never opened since the roster split still holds its people only
       there, with empty per-syllabus rosters, and missing it let a conflicting
       import write straight over them (bug-check, 12 Sep 26 — Astra 2nd pass). */
    const storeLinks = sParse(await sGet(kLinks), {}, 'object')[c] || null;
    const legacyPid = Object.create(null);
    if (storeLinks) {
      const legRosters = [await sGet(kRoster(c))];
      for (const n of pSyls) legRosters.push(await sGet(kRosterFor(c, n)));
      for (const raw of legRosters) for (const e of sParse(raw, [], 'array'))
        if (typeof e === 'string' && e && has(storeLinks, e) && typeof storeLinks[e] === 'string' && storeLinks[e]) legacyPid[e] = storeLinks[e];
    }
    const clash = new Set(conflicts.map(x => x.name));
    for (const n in pUp.bySyllabus) for (const e of (pUp.bySyllabus[n].roster || []))
      if (isEntry(e) && e.pid && has(legacyPid, e.name) && legacyPid[e.name] !== e.pid) clash.add(e.name);
    /* say "no students" rather than "nothing changed": charts import first, on
       the user's own per-chart yes, so a chart may already be in — but the whole
       student import is refused here before it writes a thing (Astra 2nd pass). */
    if (clash.size) throw new Error('The students could not be brought in: “' + [...clash][0] + '” names a different person than the one already on ' + cName(c) + '. Rename one of them, then import again — no students or marks have been changed.');
  }
  for (const c of courses) {
    const cs = (students.byCourse || {})[c] || {};
    /* an older file is name-keyed and may carry a links block; the converter
       lands both as entries with pids — the same path the store's own data took */
    const up = upgradeCourseBlock({ plan: cs.plan, lulls: cs.lulls, pace: cs.pace, bySyllabus: cs.bySyllabus }, (links || {})[c] || null).block;
    /* THE FILE'S STUDENTS ARE MATCHED TO THE ENROLMENTS ALREADY HERE (bug-check,
       10 Sep 26 — ids.js reconcileIds says why): every roster the store holds
       for the course, so a chart the file does not carry still counts. */
    const existing = [];
    for (const n of await storeSylNames(c)) for (const e of sParse(await sGet(kRosterFor(c, n)), [], 'array')) if (isEntry(e)) existing.push(e);
    const { block } = reconcileIds(up, existing);
    /* ADDED TO WHAT IS HERE, NOT WRITTEN OVER IT — the promise the Import
       dialog makes. Writing the file's roster whole dropped every student
       added to that chart since the export (their marks stayed in storage,
       reachable by nothing). Anyone on the chart now whom the file does not
       name keeps their place, after the file's people; a bare string (a course
       whose conversion has not finished) rides along the same way and the
       migration below converts it. The file's marks and dates are written per
       student, so a student it does not carry keeps theirs untouched. */
    for (const n in block.bySyllabus) {
      const b = block.bySyllabus[n], roster = b.roster || [];
      const ids = new Set(roster.map(e => isEntry(e) ? e.id : e)), names = new Set(roster.map(e => isEntry(e) ? e.name : e));
      for (const e of sParse(await sGet(kRosterFor(c, n)), [], 'array')) {
        if (isEntry(e) ? (!ids.has(e.id) && !names.has(e.name)) : (typeof e === 'string' && e && !names.has(e))) roster.push(e);
      }
      b.roster = roster;
    }
    await writeCourseBlock(c, block);
    /* One label per enrolment across the course (the rule renameStudent keeps):
       the name the file brought in goes onto every chart it did NOT write too,
       or the charts would disagree and findEnrolment would read two students. */
    const label = Object.create(null);
    for (const n in block.bySyllabus) for (const e of (block.bySyllabus[n].roster || [])) if (isEntry(e) && !has(label, e.id)) label[e.id] = e.name;
    for (const n of await storeSylNames(c)) {
      if (has(block.bySyllabus, n)) continue;
      const rr = sParse(await sGet(kRosterFor(c, n)), [], 'array'); let changed = false;
      for (const e of rr) if (isEntry(e) && has(label, e.id) && e.name !== label[e.id]) { e.name = label[e.id]; changed = true; }
      if (changed) await sSet(kRosterFor(c, n), JSON.stringify(rr));
    }
    /* THE IMPORT CONVERTS THE COURSE; IT DOES NOT DECLARE IT CONVERTED. Stamping
       the flag here was a claim about the whole COURSE made on the strength of
       one FILE, and the file only ever carries what somebody exported — never
       whatever else the store is still holding under a name. Two upgrade-time
       shapes lost people that way. A course caught HALF-CONVERTED (rosterHeld,
       its flag still unset) took the stamp, so migrateIds never ran again: any
       syllabus of it the file did not carry kept its string roster, which the
       next load filters away to an empty crew list with the read-only block now
       lifted — and the first + Add writes that empty list over their names. And
       a course nobody had opened since the roster split took the stamp before
       migrateRosters had even run, so the names that split later out of its flat
       roster were forbidden from ever converting.
       So: lend the flag only where it is honestly true — the roster split has
       nothing left to do because there is no flat legacy roster to split — and
       then run the real conversion. migrateIds takes the imported entries' own
       ids as the mapping, moves whatever is still filed under a name, and sets
       the flag itself; with nothing left to move it takes its no-names path and
       sets the flag just the same. A course that still has a flat roster is left
       unflagged on purpose: migrateIds refuses it until the split has run, and
       that happens on the course's first open, which is where migrateRosters
       lives — the same way such a course has always converted. */
    if (!(await sGet(kRosterMig(c)))) {
      const flat = await sGet(kRoster(c));
      if (flat == null || flat === '' || flat === '[]') await sSet(kRosterMig(c), '1');
    }
    await migrateIds(c);
  }
  /* Merge, never replace. Overwriting the list dropped every course of the
     person doing the opening: their marks stayed in storage but the course was
     no longer in the dropdown, so there was no way back to them. Their own
     courses (entries) stay first; a file course that reconciled to one already
     here keeps the store's entry, and a genuinely new one is appended. */
  if (courseEntries.length) {
    const mine = COURSES.slice();
    const haveId = new Set(mine.map(c => c.id));
    const merged = [...mine, ...courseEntries.filter(e => !haveId.has(e.id))];
    await sSet(kCourses, JSON.stringify(merged));
  }
  await reloadFromStore();
  return { courses: courseEntries.slice() };
}

/* ---------- the File menu: Import, Export ----------
   THE FILE IS A FORMAT, NOT A STORE (owner, 9 Sep 26 — "the file feature is
   for admin to import newly created flow charts … from external areas", and
   to "export these data … then wipe … then import" when the app moves to the
   shared database). Until then the standalone app's model held: the user's
   own .json was the master copy, 📁 Open bound a live file handle and
   ✓ Save changes wrote the store AND that file — so every mark lit the Save
   button and pressing it raised a save-file dialog, which read as duplication
   once the storage seam made the store durable. Gone with it: the handle, the
   file-unsaved flag, the Charts/Students boxes on the menu and the file name
   on the toolbar. What stays is two one-way moves between the store and a
   file — ⇪ Import (a file in: charts always, students & marks only after a
   yes) and ⤓ Export (a copy out) — and the admin lock on both (`fileLocked`,
   mirrored by Header.jsx). Every entry point still runs its picker before
   any await: the browser spends the click. */

/* ---------- Export: a copy of the store as a file ----------
   The backup before the database move, or a chart to hand over. Students start
   OFF and are reset OFF on every open, not just the first: this is the moment
   a file leaves the owner's hands, so it begins clean and they have to opt in —
   the safety measure agreed when tick-boxes were chosen over two files that
   cannot mix. For a full backup they tick it; the dialog and the confirmation
   both say which kind of file was written. */
export let copyOpen = false, copyOpts = { charts: true, students: false }, copyPick = {};
export function openCopy() { if (fileLocked) return;
  copyOpts = { charts: true, students: false };
  copyPick = {}; orderedSylNames().forEach(n => { copyPick[n] = (n === curSyl()); });
  copyOpen = true; notify();
}
export function closeCopy() { copyOpen = false; notify(); }
export function setCopyOpt(which, on) { copyOpts = { ...copyOpts, [which]: !!on }; notify(); }
export function setCopyPick(name, on) { copyPick = { ...copyPick, [name]: !!on }; notify(); }

export async function saveCopyClick() { if (fileLocked) return;
  const names = Object.keys(copyPick).filter(n => copyPick[n]);
  if (!copyOpts.charts && !copyOpts.students) { await uiAlert('Tick charts, students, or both.'); return; }
  if (copyOpts.charts && !names.length) { await uiAlert('Tick at least one syllabus.'); return; }
  const savedAt = new Date().toISOString();
  const opts = { ...copyOpts };
  const name = FMT.suggestedFileName(opts, savedAt);
  let handle = null;
  /* The save picker is the Open picker's twin: Playwright cannot drive it and
     the module's exports cannot be patched, so a test hands in a fake handle
     through window.__pickSaveForTests (the smoke reads the file it wrote). */
  const pickSave = (typeof window !== 'undefined' && window.__pickSaveForTests) || null;
  if (pickSave) { handle = await pickSave(name); if (!handle) return; }
  else if (FS.canWriteInPlace()) { handle = await FS.pickSave(name); if (!handle) return; }
  const text = JSON.stringify(FMT.buildFile({
    charts: opts.charts ? await collectCharts(names) : null,
    students: opts.students ? await collectStudents() : null, savedAt }), null, 2);
  try {
    if (handle) await FS.writeTo(handle, text); else FS.downloadInstead(name, text);
  } catch (err) {
    closeCopy(); setSaveStatus('copy NOT saved — ' + ((err && err.message) || err), 'err'); notify(); return;
  }
  closeCopy();
  setSaveStatus('', 'ok'); notify();
  await uiAlert('Exported as “' + (handle ? handle.name : name) + '”.\n\n'
    + (opts.students ? 'It CONTAINS student names and marks — a full backup; only send it to someone entitled to see them.'
      : 'It contains charts only — no student names or marks.'));
}

/* ONE import for both of the owner's jobs (9 Sep 26 — "is it possible to just
   have 1 button?"): a chart drawn up elsewhere, and the whole export back in
   after the move to the shared database. It reads what the file holds and
   adapts. CHARTS go in chart by chart — a name already here asks "replace it,
   or add as new?" — and never touch a mark: applyCharts writes no roster,
   mark or date key, which smoke.mjs pins by watching every storage write.
   STUDENTS & MARKS go in only after a yes, asked once, so a chart handed over
   can never restore someone's marks by accident; a wipe-then-import finds
   nothing to ask about on the chart side and one question on the people side.
   applyStudents merges (never overwrites the course list). */
export async function importClick() { if (fileLocked) return;
  /* Playwright cannot drive the OS file picker and the bundled module
     namespace cannot be patched (its exports are getters), so the smoke suite
     hands a file in through window.__pickOpenForTests instead. */
  const pick = (typeof window !== 'undefined' && window.__pickOpenForTests) || FS.pickOpen;
  const picked = await pick();                 /* no await before this — gesture */
  if (!picked) return;
  let obj; try { obj = JSON.parse(picked.text); } catch (_) { await uiAlert('That file is not readable as JSON.'); return; }
  let info; try { info = FMT.describeFile(obj); } catch (e) { await uiAlert(e.message); return; }
  const hasCharts = !!(info.charts && info.syllabusNames.length);
  if (!hasCharts && !info.students) { await uiAlert('That file holds no charts and no students.'); return; }
  const { charts, students, links } = FMT.readFile(obj);
  const done = [];
  if (hasCharts) {
    for (const name of info.syllabusNames) {
      if (!allSylNames().includes(name)) {
        await applyCharts(charts, { names: [name], mode: 'replace', rename: null });
        done.push(name); continue;
      }
      const c = await uiChoice(
        '“' + name + '” already exists.\n\nReplace it, or add the incoming one under a new name?',
        'Replace it', 'Add as new');
      if (c === 'cancel') continue;
      if (c === 'ok') {
        await applyCharts(charts, { names: [name], mode: 'replace', rename: null });
        done.push(name); continue;
      }
      const to = ((await uiPrompt('Name for the incoming syllabus:', name + ' (new)')) || '').trim();
      if (!to || allSylNames().includes(to)) { await uiAlert('That name is blank or already taken.'); continue; }
      if (await refuseColon(to)) continue;   /* a storage-key segment, like every other name typed here */
      await applyCharts(charts, { names: [name], mode: 'add', rename: { from: name, to } });
      done.push(to);
    }
  }
  let people = false;
  if (info.students && students) {
    /* honest about the overwrite (bug-check, 11 Sep 26): a student the file
       ALSO names has their marks replaced by the file's — restoring an old
       backup over a live course reverts those students' newer marks. Students
       the file does not name are genuinely untouched. */
    people = await uiConfirm('This file also contains students and marks.\n\nBring them in too? A student already here who is ALSO in the file will have their marks replaced by the file’s. Anyone the file does not name keeps theirs, untouched.');
    /* an older file's links are people data too: they come in WITH the
       students, folded into each entry's pid by the converter. A same-name /
       different-person clash (or a bad file) refuses the WHOLE student import
       before it writes anything — surface it and carry on, students untouched. */
    if (people) {
      try { await applyStudents(students, links); }
      catch (e) { await uiAlert((e && e.message) || 'The students could not be brought in.'); people = false; }
    }
  }
  const what = [done.length ? 'brought in ' + done.join(', ') : null, people ? 'students & marks restored' : null].filter(Boolean).join(' · ');
  if (what) setSaveStatus(what, 'ok');
  await uiAlert(what
    ? what.charAt(0).toUpperCase() + what.slice(1) + '.\n\n' + (people ? 'It is saved.' : 'Everyone’s marks are untouched. It is saved.')
    : 'Nothing was brought in.');
  notify();
}

/* One Save button, one job: write the flow edits into the store. It used to go
   on to write the user's file too (see the File-menu note above), which is what
   put a save-file dialog under a button that reads "Save changes". */
export async function saveChangesClick() { await persistSyl(); }

/* ---------- init ---------- */
export let ready = false;
let initStarted = false;
export async function init() {
  if (initStarted) return; initStarted = true;
  await applyBundle();
  await loadCourses();
  /* Course NAMES → course IDS, once per browser, BEFORE anything reads a
     per-course key (migrateAllCourses/enrolment migration key off the id). ONE
     retry on this boot — a half-done conversion is not a state to run in. If it
     still cannot finish, FAIL CLOSED: bootError is set (and has notified), and
     we do NOT loadCourse and do NOT set ready — App shows a reload panel with no
     board and no writers (review CSID-04 / R2-03). */
  let cmig = await migrateCourseIds();
  if (!cmig) cmig = await migrateCourseIds();
  if (!cmig) {
    loading = false;
    /* A read-back miss (a browser that would not keep the write — Safari private
       mode, a full quota) returns false WITHOUT a bootError, unlike the preflight
       rejections; without this the App would sit on its loading placeholder for
       good (review Fable F1). Fail closed with a message either way. */
    if (!bootError) setBootError('The Tracker could not finish upgrading your data — the browser did not keep what was written. Reload to try again.');
    return;
  }
  /* Every course, not just the one about to open: an export, or a global
     syllabus rename, must never meet a course nobody has opened since the
     upgrade and find half its records still filed under a name. */
  await migrateAllCourses();
  await loadSylPrefs();
  /* After loadCourses + course-id migration, which fill COURSES with {id,name}
     entries — a course that was deleted, renamed, or only ever existed in
     someone else's browser simply fails the membership test and falls back to
     the top of the list. lastCourse is a course id. */
  const __want = prefGet('lastCourse');
  await loadCourse((__want && COURSES.some(c => isCourseEntry(c) && c.id === __want)) ? __want : (COURSES[0] && COURSES[0].id), true);
  await loadEventInfo(); await loadSylOrder();
  ready = true;
  notify();   /* the boot gate (App) subscribes to getVersion — flip it off BootLoading */
  refreshCourses(); refreshSyl(); refreshActive(); renderBoard(); renderSide();
  /* After the first paint, so the balls exist to measure. No last mark → the
     chart's first event, the same landing a crew pick makes. */
  const land = () => { if (!showLastEdit(active)) scrollToEvent(firstEventId()); };
  if (typeof requestAnimationFrame !== 'undefined') requestAnimationFrame(land);
  else land();
  /* Unsaved flow edits must not vanish quietly when the tab closes — the one
     kind of work that waits for the Save button. */
  if (typeof window !== 'undefined')
    window.addEventListener('beforeunload', e => { if (sylDirty) { e.preventDefault(); e.returnValue = ''; } });
  /* Turning a phone sideways changes how much chart fits, so re-fit unless the
     user has set the zoom themselves. */
  if (typeof window !== 'undefined') {
    let t = null;
    window.addEventListener('resize', () => {
      if (zoomIsMine || arrangeMode) return;
      clearTimeout(t);
      t = setTimeout(() => {
        const svg = document.getElementById('flowSvg'); if (!svg) return;
        fitPhoneWidth(parseFloat(svg.getAttribute('width')) || 0);
        applyFlowZoom(); notify();
      }, 120);
    });
  }
  /* The board is rendered imperatively and this module exports nothing to the
     page, so scripts/smoke.mjs has no other way to reach these. */
  if (typeof window !== 'undefined') {
    window.__coreForTests = { layoutSnapshotFor, collectCharts, collectStudents, applyCharts,
      applyStudents, whenLoaded, migrateAllCourses, migrateCourseIds, SYLLABI, DEFAULT_LAYOUTS,
      rosterNow: () => roster, nameOf, byName, courseIdOf, courseName, curCourseName,
      coursesNow: () => COURSES.slice() };
    window.__fileFormatForTests = FMT;
    window.__fileStoreForTests = FS;
    /* Save changes is only on screen while there is an unsaved flow edit, so a
       test that wants to press it has to put the app in that state first. */
    window.__markDirtyForTests = () => markDirty();
    /* Live reads for the undo checks: a mark's grade, and the stacks' depth. */
    window.__undoForTests = () => ({ undo: undoStack.length, redo: redoStack.length, grade: (id, s) => ((marks[s || active] || {})[id] || {}).g || 0, active });
  }
}
