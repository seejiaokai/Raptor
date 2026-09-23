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
import { shippedDetails, diffDetails, scrubBlock, mergeBlock, realFlatEdits, blockFromFlat, isDetailsTable } from './eventDetails.js';
import { SEED_STATE, SEED_STAMP } from '../data/seedState.js';
import { storage, flushNow, loadLatest } from '../storage.js';
import * as FMT from './fileFormat.js';
import * as FS from './fileStore.js';
import { findEvents } from './eventOrder.js';
import { onTrackerSessionEnd, onBeforeTrackerLogout } from '../role.js';
import { getPeople, onPeople, whoami } from '../people.js';
import { mintId, isEntry, upgradeCourseBlock, reconcileIds } from './ids.js';
import { mintCourseId, isCourseEntry, isCourseId, isReservedCourseName, upgradeCourses, reconcileCourseIds } from './courseIds.js';
import {
  BUILTIN_SYL, mintSylId, isSylId, isBuiltinSylId, isCustomSylId, isSylEntry,
  builtinSylById, builtinIdByName, builtinIdByAlias, builtinBaseOf,
  classifyDefinedName, upgradeSyllabi, buildUnionSylcat, reconcileSylIds,
} from './sylIds.js';
/* [ARCH-STACK] Step 2 phase 5 — the shared command layer (see the sSet router
   below). A Tracker durable write now joins the SAME change stream + auth gate
   every module funnels through. */
import {
  commit as cmdCommit, isCommitting as cmdIsCommitting, definePermission as cmdDefinePermission,
  anyone as cmdAnyone, registerRecord as cmdRegisterRecord, deferEffect as cmdDeferEffect,
  registerGuardedStore as cmdRegisterGuardedStore,
} from '../../command';

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

/* ---------- ACCESS: no roles in the Tracker (owner, 23 Sep 26 — D121) ----------
   "For the tracker, admin and member should have the same access authority."
   Everyone marks, edits charts, manages students, courses and syllabi, AND uses
   the File menu (⇪ Import, ⤓ Export) — the standalone app's shape, where there
   were no roles at all. This supersedes the 7 Sep 26 second word ("…except the
   file portion which is admin only"), whose lock (`fileLocked`, written from
   Raptor's login through role.js and checked at the three file entry points
   and the File menu) is gone: the Tracker reads no role. What role.js still
   carries is the login SESSION, below. */
/* A login or a logout ends the Tracker's SESSION (role.js; Raptor's
   resetSession). Undo is per login session and never reaches another user
   (owner, 13 Sep 26), and the modes and windows the last person left open are
   theirs — the [HUMAN-RETEST] walk (23 Sep 26, F10) found the next login able
   to undo the admin's mark, still in Details mode, and dropped into chart
   editing over the admin's unsaved draft. Plain state only, no redraw: at a
   logout the section is not on screen, and the next mount redraws the board.
   An unsaved chart edit is ASKED ABOUT before the Logout ever gets here (D129,
   onBeforeTrackerLogout above); on any other session end it is kept behind
   ✓ Save changes, never thrown away without a word. */
onTrackerSessionEnd(() => endSession());
/* BEFORE the logout, not after (owner, 23 Sep 26 — D129): unsaved chart edits
   ask Save / Discard / Stay, over the Tracker tab (`show`), so the next person
   never lands on someone else's half-done chart. Save writes them (✓ Save
   changes); Discard reloads the chart from the store; Stay keeps the session. */
onBeforeTrackerLogout(async show => {
  /* A question already up is answered first: a Logout reached by keyboard (the
     question's shade stops the mouse, not Tab) used to cancel it, and the job
     behind it — an import — carried on into the next person's session (the two
     code reads, Fable F-D). */
  if (dlg) { if (show) show(); return false; }
  if (!sylDirty) return true;
  if (show) show();
  const c = await uiChoice('You have unsaved chart edits on “' + curSylName() + '”.\n\nSave them before logging out?', 'Save them', 'Discard them', 'Stay');
  if (c === 'cancel') return false;
  if (c === 'ok') await persistSyl();
  else { clearDirty(); if (arrangeMode) toggleArrange(); await loadCourse(course); refreshSyl(); renderBoard(); renderSide(); }
  return true;
});
function endSession() {
  undoStack = []; redoStack = [];
  if (dlg) dlgClose(null);            /* a half-answered question: cancelled */
  pop = null; popDoneDate = ''; popFailDate = '';
  failLog = null; lullPick = null; lullCopy = null;
  infoId = null; editId = null; ordMode = null; sylModalOpen = false; showAllOpen = false; copyOpen = false;
  showDetails = false; hideDetailBubble();
  if (arrangeMode) {
    /* `view` is the editing canvas's pan and zoom: it stays in Edit chart layout */
    arrangeMode = false; connectSrc = null; drawing = null; selBalls = new Set(); tool = 'move'; view = { x: 0, y: 0, k: 1 };
    if (sylDirty) setSaveStatus('unsaved flow edits — hit “Save changes”', 'saving');
  }
  hintFlash = null;
  searchHit = null; searchQ = ''; searchCount = 0; searchAt = 0; searchHits = [];
  notify();
}

export const DEFAULT_SYLLABUS = SYLLABI[DEFAULT_SYL_NAME];
export const TYPE_COLOR = { flight: '#19b6e8', acad: '#27d64a', test: '#ff4040', sim: '#ffe000', device: '#b063ff' };
const DARKC = new Set(['sim', 'acad', 'na', 'flight', 'test', 'device']); // labels needing dark text on light fills
export const GRADE_FILL = { dco: '#000000', dpco: '#1f6dff', marg: '#27d64a', na: '#cdbb8e' };
export const DONE = new Set(['dco', 'dpco', 'marg']);
/* Event details, PER CHART (owner, 23 Sep 26 — D126): { [sylId]: { [eventId]:
   fields } }, only what differs from that chart's shipped wording. One table
   keyed by event code (the old 'v3:eventinfo') let a detail typed on Tx show on
   2026 and let an import of one chart reset another's (W1-8, W1-9, D122). The
   helpers and the reasoning: app/eventDetails.js. */
export let eventInfo = {}; export let showDetails = false;
const kEventInfo = () => SYL_NS + ':eventinfo';
const kEventInfoFlat = 'v3:eventinfo';          /* the old one-table shape: read once, to convert */
/* the chart's shipped wording for one event — the base table, then the
   built-in's own profile (the short course renumbers sorties, so e.g. its
   BFM-5 flies the BFM-7 profile) */
function shippedFor(sylId, id) { return shippedDetails(EVENT_INFO, EVENT_INFO_BY_SYL, baseOf(sylId), id); }
const shippedOfSyl = sylId => id => shippedFor(sylId, id);
async function loadEventInfo() {
  const r = await sGet(kEventInfo());
  if (r != null && r !== '') { eventInfo = sParse(r, {}, 'object'); if (!isDetailsTable(eventInfo)) eventInfo = {}; }
  else { eventInfo = await convertFlatEventInfo(); if (Object.keys(eventInfo).length) await saveEventInfo(); }
  for (const sid of Object.keys(eventInfo)) {
    eventInfo[sid] = scrubBlock(eventInfo[sid], shippedOfSyl(sid));
    if (!Object.keys(eventInfo[sid]).length) delete eventInfo[sid];
  }
}
/* ONE-TIME: a browser that typed details before D126 holds them in the old
   one-table key, where each one showed on EVERY chart with that code. His typed
   details are real work — they are part of the charts he exports on the way to
   the database (D120) — so they are carried over, not dropped: each edit lands
   on every chart that has the event, so every chart reads exactly as it did.
   The old key is left in place, untouched (a backup, never read again once the
   new one exists). Chart definitions are read from storage here, not from the
   live lets: at boot they are not loaded yet. */
async function convertFlatEventInfo() {
  let flat = null;
  try { flat = sParse(await sGet(kEventInfoFlat), null, 'object'); } catch (_) { flat = null; }
  const edits = realFlatEdits(flat, EVENT_INFO);
  if (!Object.keys(edits).length) return {};
  const defs = sParse(await sGet(kSyls()), {}, 'object') || {};
  const ids = new Set([...SYLS.map(e => e.id), ...Object.keys(SYL_TOMB || {}).filter(isSylId)]);
  const out = {};
  for (const sid of ids) {
    const def = (has(defs, sid) && Array.isArray(defs[sid])) ? defs[sid] : (baseOf(sid) ? SYLLABI[baseOf(sid)] : (isBuiltinSylId(sid) ? SYLLABI[builtinBaseOf(sid)] : null));
    if (!Array.isArray(def)) continue;
    const base = baseOf(sid) || (isBuiltinSylId(sid) ? builtinBaseOf(sid) : null);
    const b = blockFromFlat(edits, def.map(e => e && e.id), id => shippedDetails(EVENT_INFO, EVENT_INFO_BY_SYL, base, id));
    if (Object.keys(b).length) out[sid] = b;
  }
  return out;
}
async function saveEventInfo() { await sSet(kEventInfo(), JSON.stringify(eventInfo)); }
/* The chart's shipped wording, then what was typed on THIS chart. `sylId`
   defaults to the chart on screen — every surface draws that one. */
export function infoFor(id, sylId) {
  const sid = sylId || curSylId();
  return Object.assign({}, shippedFor(sid, id), ((eventInfo[sid] || {})[id]) || {});
}
/* What the source document says for this event on this chart (no typed
   edit) — what "Reset to doc" puts back in the boxes. */
export function docInfoFor(id) { return shippedFor(curSylId(), id); }
/* Is there a document at all? A ball the user made has none, so the button
   that promises one is not offered ([HUMAN-RETEST] w3-F4). */
export function hasDocInfo(id) { const d = docInfoFor(id); return ['name', 'fmt', 'hrs', 'crew', 'pre'].some(f => !!d[f]); }
/* Prereq wording for display: the free-text note if there is one, otherwise the
   actual chart links. */
export function preText(id) {
  const d = infoFor(id); if (d.pre) return d.pre;
  const e = byid[id]; const ps = e && e.prereqs || []; return ps.length ? ps.join(', ') : '';
}
/* `where` is 'bubble' for the floating details bubble. The grading pop-up
   prints the same text right above its own ✎ Edit details button, so there
   "tap Edit details" is a door; the bubble has no button, and in Details mode
   the pop-up is switched off — so the bubble says how to reach it instead
   ([HUMAN-RETEST] F4, 23 Sep 26). */
export function infoHtml(id, where) {
  const d = infoFor(id); const rows = [];
  if (d.fmt) rows.push('<b>Type:</b> ' + escapeId(d.fmt) + (d.hrs ? ' · ' + escapeId(d.hrs) : ''));
  if (d.crew) rows.push('<b>Crew:</b> ' + escapeId(d.crew));
  { const p = preText(id); if (p) rows.push('<b>Prerequisites:</b> ' + escapeId(p)); }
  const nm = d.name ? ('<div style="font-weight:600;margin-bottom:3px">' + escapeId(d.name) + '</div>') : '';
  /* With nobody on the chart a tap opens no pop-up (F9), so its ✎ Edit details
     is not a door there — ☰ Show All's Edit is (the gates' smoke run found the
     two fixes pointing at each other, 23 Sep 26). */
  const none = where !== 'bubble' ? 'No details yet — tap Edit details.'
    : !roster.length ? 'No details yet — ☰ Show All → Edit to add them.'
      : showDetails ? 'No details yet — turn ⓘ off, then tap the ball and ✎ Edit details.'
        : 'No details yet — tap the ball, then ✎ Edit details.';
  return nm + (rows.length ? rows.join('<br>') : '<span class="mini">' + none + '</span>');
}
/* The grey hint in the "Type / format" box — ONE string for both editors that
   carry that box, the details window (Modals.jsx) and Show All's inline editor
   (ShowAllPanel.jsx). D64 (owner, 23 Sep 26) changed it in the first only; the
   second kept the old words until the [HUMAN-RETEST] walk (F11). */
export const FMT_HINT = 'e.g. Lecture, OFT/AMT, 2 x F-15';
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
/* [CMDL-FINISH] C9 — the Tracker's monotonic DURABLE-version counter. signature()
   (trkStore below) returns it so the whole-world guard asks "changed?" cheaply.
   Bumped only where mem changes durably (trkWrite / trkDelete / trkStore.restore). */
let TRK_SIG = 0;
/* [CMDL-FINISH] R3-004 — per-key MUTATION generations, so the sGet read-back
   mirror never resurrects a key a write/delete changed DURING the async read. A
   key in the map has been mutated at least once (its count survives a delete as a
   tombstone). bumpMemGen fires wherever mem changes through trkWrite/trkDelete. */
const memGen = new Map();
function bumpMemGen(k) { memGen.set(k, (memGen.get(k) || 0) + 1); }
/* [CMDL-FINISH] §4 (GU-004) — while a gesture is open this holds the keys it
   wrote (key→value), so their storage flush can be deferred to ONE boundary
   effect. Non-null ⇒ sSet records instead of persisting inline. A key whose
   pending value is TRK_DEL is a DELETE (delKey inside a gesture), flushed as a
   storage.delete at the boundary — so a gesture that removes records (a student
   or syllabus delete) still lands as ONE envelope, storage and all. */
let TRK_GESTURE_PENDING = null;
const TRK_DEL = Symbol('trk.del');
/* [CMDL-FINISH] §4 (N7) — the Tracker's own legacy undo (applyHist/applyMarkHist)
   RESTORES earlier state; its saves must not emit a FORWARD command envelope (a
   global-undo consumer would read a legacy undo as a new change, and today it
   pushes a spurious step). While this is set, trkWrite/trkDelete take their raw
   branch: mem + storage, off the command stream. It is scoped to the SYNCHRONOUS
   trkWrite alone (via trkRestoring), never held across the awaited step() — a
   click landing inside that await must still record normally. */
let TRK_RESTORING = false;
function trkRestoring(fn) { const prev = TRK_RESTORING; TRK_RESTORING = true; try { return fn(); } finally { TRK_RESTORING = prev; } }
/* the persisted mirror, read SYNCHRONOUSLY — the record source once hydrated
   (used by the §3 write()/restore re-derive; nothing on it awaits or calls
   loadCourse — build-advice #5). */
function memGet(k) { return (k in mem) ? mem[k] : null; }
async function sGet(k) {
  const gen = memGen.get(k);
  try {
    const r = await storage.get(k);
    /* C2 — mirror the read into mem so a later before-image / cross-course delete
       is correct. R3-004 — but ONLY if no write/delete landed during the await
       (the gen is unchanged): otherwise the live mem is newer and must win, and a
       key deleted mid-read stays dropped rather than being resurrected. A read is
       not a mutation, so it never bumps the gen. */
    if (memGen.get(k) === gen && r) mem[k] = r.value;
    return r ? r.value : null;
  } catch (e) { return mem[k] ?? null; }
}
/* [CMDL-FINISH] C2 — seed `mem` from every known-collection storage key before
   command routing is enabled, so a delete or a cross-course write has a real
   before-image (an un-hydrated key would emit no change on delete / no before on
   edit). Runs once in init(), after the boot loads, before TRK_COMMANDS. */
async function trkHydrateMem() {
  try {
    const { keys } = await storage.list();
    for (const k of keys) {
      if (!trkCollectionOf(k)) continue;
      const r = await storage.get(k);
      if (r) mem[k] = r.value;
    }
  } catch (_) {}
}
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
/* [ARCH-STACK] Step 2 phase 5 — the Tracker COMMAND LAYER (ADDITIVE, §5.4).
   Every durable Tracker write funnels through sSet, which synchronously mirrors
   the value into `mem` (the persisted representation) and then AWAITS the async
   storage.set. The SYNCHRONOUS mem write now runs inside commit() (the reducer is
   synchronous; the async persist stays OUTSIDE it, exactly as the design mandates
   — §5.4), emitting the record-level change stream. The async storage.set is
   unchanged (the legacy persist, left running — no cutover).

   ALLOWLIST by design: only keys whose grammar matches one of the 10 record
   collections route through a command (always a VALID collection). Anything else
   — the one-shot migration flags, view-preferences, the seed stamp, any unknown
   key — writes RAW, exactly as today (migration flags + seedstamp are seed-exempt,
   §3.1). So a key that fails to match can never hit the well-formed-change
   invariant; the worst case is a durable write that stays off the stream, never a
   corrupted migration. Command routing is OFF until init() enables it (after all
   boot migrations + loads), so no boot/seed write is ever commanded and every
   existing Tracker unit test (which drives init but registers no subscriber) is
   behaviour-identical. */
let TRK_COMMANDS = false;
let TRK_REGISTERED = false;
/* map a storage key to its logical collection by GRAMMAR (segment-precise, so a
   migration flag like `…:rostermig` never matches `…:roster`), or null = exempt. */
function trkCollectionOf(k) {
  const p = String(k).split(':');
  const last = p[p.length - 1], last2 = p[p.length - 2];
  if (last2 === 'm') return 'trk.marks';
  if (last2 === 'd') return 'trk.dates';
  if (last2 === 'pace') return 'trk.pace';
  if (last2 === 'lulls') return 'trk.lulls';
  if (last === 'roster') return 'trk.roster';
  if (last === 'plan') return 'trk.plan';
  if (last === 'syls' || last === 'syl') return 'trk.syls';   // kSyls (catalogue defs) + kSyl (per-course flow def)
  if (last === 'sylcat' || last === 'sylorder' || last === 'sylhidden' || last === 'syltomb') return 'trk.catalogue';
  if (last === 'eventinfo') return 'trk.eventinfo';
  if (last === 'courses' || last === 'delcourses') return 'trk.courses';   // v3:courses — the course list; v3:delcourses — the deleted ones (D128)
  if (p.indexOf('lay') >= 0) return 'trk.layout';   // v3:master:lay:<syl> or v3:lay:<c>:<name>
  // NB: the one-shot migration flags (…:sylreset / …:sylcatmig / …:syljournal /
  // …:idmig / …:rostermig / …:courseidmig / …:idmap), the view-prefs (…:last /
  // …:lastStudent) and the seed stamp all fall through to raw here, exactly as
  // intended (seed-exempt, §3.1); every match above is a valid collection, so the
  // well-formed-change invariant can never roll back a migration write.
  return null;
}
/* the record source is `mem` (the persisted mirror). The mem write happens INSIDE
   the command's apply (the scheduler pattern), so enlist captures the pre-write
   mem and the diff is exactly the touched key. */
/* exported for the [CMDL-FINISH] write()-seam + capture/restore unit tests;
   production wiring uses it only through this module. */
export const trkStore = {
  key: 'tracker',
  /* [CMDL-FINISH] N2 — a SHALLOW mem copy (string values are immutable), not
     JSON.stringify: capture() runs on every guarded commit once trk is registered.
     R3-005/build-advice #6 — also snapshot the transaction-mutated history +
     selection + dirty flag, which are NOT derivable from mem (a rejected grouped
     gesture must restore them, and pushMarkUndo clears redo before a grade).
     CMDLF-005/006/Fable#9 — and the course POINTER (course + COURSES) plus the
     in-editor flow DRAFT (SYL, byid rebuildable from it). All cheap references /
     small slices, so capture() stays O(1)-ish and safe to run every commit: no
     gesture mutates SYL or COURSES in place (structural flow edits are the sylDirty
     draft, saved separately, never a gesture). */
  capture: () => ({ mem: Object.assign({}, mem), undo: undoStack.slice(), redo: redoStack.slice(), active, sylDirty,
    syl: SYL, course, courses: COURSES.slice() }),
  restore: (snap) => {
    // [CMDL-FINISH] CMDLF-007 — bump the sGet generation for every key that
    // changes shape across the restore (both the outgoing and incoming key sets),
    // so an sGet begun before the restore cannot mirror a stale value back in.
    for (const kk of Object.keys(mem)) bumpMemGen(kk);
    for (const kk of Object.keys(mem)) delete mem[kk];
    Object.assign(mem, snap.mem);
    for (const kk of Object.keys(mem)) bumpMemGen(kk);
    undoStack = snap.undo.slice(); redoStack = snap.redo.slice(); active = snap.active; sylDirty = snap.sylDirty;
    // [CMDL-FINISH] CMDLF-005/006/Fable#9 — restore the course POINTER and the exact
    // in-editor flow DRAFT (SYL/byid). A rejected gesture must leave an unsaved flow
    // draft untouched; the old rebuild-from-mem (rebuildSyl=true) rebuilt SYL from
    // the persisted def and discarded the draft. Re-derive the REST of the course
    // layer (plan/roster/marks/dates/layout) from the restored mem with
    // rebuildSyl=false, so SYL/byid survive.
    course = snap.course; COURSES = snap.courses.slice();
    /* the GLOBAL lets too — the catalogue, the event details, the deleted
       courses — or a rolled-back change stayed on screen (the two code reads,
       Astra #3) */
    trkReloadGlobalsFromMem();
    DELCOURSES = sParse(memGet(kDelCourses), [], 'array').filter(c => isCourseEntry(c) && !COURSES.some(x => isCourseEntry(x) && x.id === c.id));
    SYL = snap.syl; byid = {}; SYL.forEach(e => byid[e.id] = e);
    TRK_SIG++;
    trkReloadCurrentFromMem(false);
    renderBoard(); renderSide(); notify();
  },
  records: () => {
    const m = new Map();
    for (const kk of Object.keys(mem)) {
      const col = trkCollectionOf(kk);
      if (!col) continue;
      m.set(col + '/' + kk, { collection: col, id: kk, value: mem[kk] });
    }
    return m;
  },
  signature: () => String(TRK_SIG),               // [CMDL-FINISH] C9
  write: (entries) => trkWriteRecords(entries),    // [CMDL-FINISH] §3 (M1/R4-003/R4-004)
};
function trkRegisterCommands() {
  if (TRK_REGISTERED) return; TRK_REGISTERED = true;
  const cols = ['trk.marks', 'trk.dates', 'trk.roster', 'trk.layout', 'trk.syls', 'trk.plan', 'trk.pace', 'trk.lulls', 'trk.eventinfo', 'trk.catalogue', 'trk.courses'];
  for (const c of cols) {
    cmdDefinePermission(c, cmdAnyone);   // permissive at Step 2 (the real file/role gates are unchanged)
    cmdRegisterRecord({ key: 'tracker:' + c, cls: 'record', collection: c, module: 'tracker' });
  }
  cmdDefinePermission('trk.gesture', cmdAnyone);   // [CMDL-FINISH] §4 — a multi-collection gesture's envelope
  /* [CMDL-FINISH] §3 (C9) / P4-END — now that EVERY post-boot Tracker write routes
     through the command layer (per-write via trkWrite/trkDelete, or grouped via
     trkGesture), guard trkStore: its cheap durable-version signature() is checked
     on every commit, app-wide, so a write that skips txn.enlist() is caught. The
     only post-boot raw path is TRK_RESTORING (legacy undo), which runs standalone
     from a keypress and is never nested inside another module's command, so it is
     baked into the next commit's pre-snapshot, not flagged. Registered here, at
     the end of init (after trkHydrateMem), so the first capture sees the full mem. */
  cmdRegisterGuardedStore(trkStore);
}
/* [CMDL-FINISH] §3 — re-derive the CURRENT course's live lets from `mem`
   SYNCHRONOUSLY (the id-native happy path: no migrations, no async sGet, no
   storage writes — build-advice #5). Mirrors loadCourseNow's tail + loadLayout +
   loadStudent, reading mem. `rebuildSyl` gates the SYL/byid rebuild: skip it to
   PRESERVE an unsaved flow draft when the current syllabus's def did not change
   (R4-003). */
function trkReloadCurrentFromMem(rebuildSyl) {
  const c = course;
  plan = sParse(memGet(kPlan(c)), null, 'object') || { lulls: [], mode: 'pace', epw: 2, target: null, sylId: firstSylId() };
  if (!plan.sylId) plan.sylId = firstSylId();
  customDefs = sParse(memGet(kSyls(c)), {}, 'object');
  if (rebuildSyl) {
    let __src = sylSource(plan.sylId);
    if (!__src) { plan.sylId = firstSylId(); __src = sylSource(plan.sylId) || DEFAULT_SYLLABUS; }
    SYL = __src ? JSON.parse(JSON.stringify(__src)) : [];
    byid = {}; SYL.forEach(e => byid[e.id] = e);
  }
  roster = sParse(memGet(kRosterFor(c, plan.sylId)), [], 'array').filter(isEntry);
  const onRoster = id => !!id && roster.some(r => r.id === id);
  if (!onRoster(active)) active = roster[0] ? roster[0].id : null;
  layout = sParse(memGet(kLayout()), {}, 'object'); loadLineDefaults(); loadEdgeMeta();
  trkLoadStudentsFromMem();
}
function trkLoadStudentsFromMem() {
  marks = {}; dates = {}; lulls = {}; lastEdit = {}; pace = {};
  for (const { id: s } of roster) {
    marks[s] = sParse(memGet(kMarks(course, s)), {}, 'object');
    dates[s] = sParse(memGet(kDates(course, s)), null, 'object') || { lastSyll: null, lastCurr: null };
    try { lastEdit[s] = JSON.parse(memGet(kLast(course, s)) || 'null') || null; } catch (_) { lastEdit[s] = null; }
    let pr = null; try { pr = JSON.parse(memGet(kPace(course, s)) || 'null'); } catch (_) {}
    pace[s] = pr || { epw: plan.epw ?? 2, target: plan.target ?? null, target2: plan.target2 ?? null };
    const l = memGet(kLulls(course, s));
    if (l == null || l === '') lulls[s] = (plan.lulls || []).map(x => ({ start: x.start, end: x.end }));
    else { try { lulls[s] = JSON.parse(l); } catch (_) { lulls[s] = []; } }
  }
}
/* [CMDL-FINISH] §3 (CMDLF-004) — re-derive the GLOBAL catalogue + event-info live
   lets from mem. A restore that changed a global record (a syllabus delete/restore
   touches sylcat/sylorder/sylhidden/syltomb; an event-detail edit touches
   eventinfo) updated mem but not these lets, so the board went blank/stale until a
   reload. Synchronous, reads mem only — the id-native happy path; boot's
   fail-closed id validation (loadSylCat) already ran on this data. */
function trkReloadGlobalsFromMem() {
  const cat = sParse(memGet(kSylCat()), [], 'array').filter(isSylEntry);
  const seen = new Set();
  SYLS = cat.filter(e => !seen.has(e.id) && seen.add(e.id));
  for (const e of SYLS) { if (isBuiltinSylId(e.id)) e.base = builtinBaseOf(e.id); else if (e.base) delete e.base; }
  const ord = sParse(memGet(kSylOrder()), null, 'array');
  SYL_ORDER = (Array.isArray(ord) && ord.length) ? ord.filter(isSylId) : DEFAULT_SYL_ID_ORDER.slice();
  if (!SYL_ORDER.length) SYL_ORDER = DEFAULT_SYL_ID_ORDER.slice();
  const hid = sParse(memGet(kSylHidden()), [], 'array');
  SYL_HIDDEN = Array.isArray(hid) ? hid.filter(isSylId) : [];
  const tomb = sParse(memGet(kSylTomb()), {}, 'object');
  SYL_TOMB = (tomb && typeof tomb === 'object') ? tomb : {};
  eventInfo = sParse(memGet(kEventInfo()), {}, 'object') || {};
  if (!isDetailsTable(eventInfo)) eventInfo = {};
}
/* [CMDL-FINISH] §3 (F8/GU-007, M1/R4-003/R4-004) — the batch, delete-aware,
   per-collection record write for the undo seam, driven by the key-grammar→scope
   table. Apply every entry to mem, then reconcile the LIVE lets:
   - a course/syllabus POINTER change (a restored `courses` dropping the current
     course, or a restored `plan` changing sylId) → full synchronous re-derive of
     the whole per-syllabus layer from mem, so a repointed key never writes the OLD
     chart's layer under new keys (R4-004);
   - otherwise re-apply only the touched records that belong to the LOADED
     course+syllabus into the live lets (others are storage/mem only), and rebuild
     SYL/byid ONLY if the current syllabus's def actually changed (R4-003 — a dirty
     flow draft survives an unrelated restore).
   Repaint releases at the transaction boundary via cmdDeferEffect (Q2). Called
   only from a reducer that already enlisted trkStore. */
function trkWriteRecords(entries) {
  const beforeSyl = curSylId();
  const beforeDef = JSON.stringify(customDefs && customDefs[beforeSyl]);
  for (const e of entries) { if (e.op === 'delete') delete mem[e.id]; else mem[e.id] = e.value; bumpMemGen(e.id); }
  // [CMDL-FINISH] CMDLF-004 — re-derive the global catalogue/event-info lets first
  // (a delete/restore of a syllabus changes them, and the pointer logic below reads
  // SYLS/SYL_ORDER via firstSylId/sylSource).
  if (entries.some(e => e.collection === 'trk.catalogue' || e.collection === 'trk.eventinfo')) trkReloadGlobalsFromMem();
  // the globals that steer the pointers, always re-read from mem
  COURSES = sParse(memGet(kCourses), [], 'array');
  DELCOURSES = sParse(memGet(kDelCourses), [], 'array').filter(c => isCourseEntry(c) && !COURSES.some(x => isCourseEntry(x) && x.id === c.id));
  const courseGone = COURSES.length > 0 && !COURSES.some(c => isCourseEntry(c) && c.id === course);
  if (courseGone) { const first = COURSES.find(isCourseEntry); course = first ? first.id : course; }
  customDefs = sParse(memGet(kSyls(course)), {}, 'object');
  const memPlan = sParse(memGet(kPlan(course)), null, 'object');
  const newSyl = (memPlan && memPlan.sylId) || firstSylId();
  if (courseGone || newSyl !== beforeSyl) {
    trkReloadCurrentFromMem(true);   // whole per-syllabus layer (SYL/byid rebuilt — the old draft is abandoned by design)
  } else {
    const c = course, syl = curSylId();
    let rosterTouched = false, studentsTouched = false;
    for (const e of entries) {
      const p = String(e.id).split(':');
      if (e.collection === 'trk.roster' && p[1] === c && p[2] === syl) rosterTouched = true;
      else if ((e.collection === 'trk.marks' || e.collection === 'trk.dates') && p[1] === c && p[2] === syl) studentsTouched = true;
      else if ((e.collection === 'trk.pace' || e.collection === 'trk.lulls') && p[1] === c) studentsTouched = true;
      else if (e.collection === 'trk.plan' && p[1] === c) plan = sParse(memGet(e.id), null, 'object') || plan;
      else if (e.collection === 'trk.layout' && p[p.length - 1] === syl) { layout = sParse(memGet(e.id), {}, 'object'); loadLineDefaults(); loadEdgeMeta(); }
    }
    if (rosterTouched) {
      roster = sParse(memGet(kRosterFor(c, syl)), [], 'array').filter(isEntry);
      const onR = id => !!id && roster.some(r => r.id === id);
      if (!onR(active)) active = roster[0] ? roster[0].id : null;
      trkLoadStudentsFromMem();
    } else if (studentsTouched) {
      trkLoadStudentsFromMem();
    }
    const afterDef = JSON.stringify(customDefs && customDefs[curSylId()]);
    if (afterDef !== beforeDef) {
      const __src = sylSource(curSylId());
      SYL = __src ? JSON.parse(JSON.stringify(__src)) : [];
      byid = {}; SYL.forEach(e => byid[e.id] = e);
    }
  }
  TRK_SIG++;
  cmdDeferEffect(() => {
    // [CMDL-FINISH] CMDLF-003 — mem is the in-session mirror; a reload re-reads
    // storage, so a restore that touched only mem would be lost. Flush every
    // applied record (incl. those for unloaded courses) to durable storage at the
    // transaction boundary. Fire-and-forget with the save-status idiom, as sSet.
    setSaveStatus('', 'saving');
    Promise.all(entries.map(e => e.op === 'delete'
      ? (storage.delete ? storage.delete(e.id) : storage.set(e.id, ''))
      : storage.set(e.id, e.value)))
      .then(() => setSaveStatus('', 'ok'), () => setSaveStatus('local only', 'ok'));
    renderBoard(); renderSide(); notify();
  });
}

/* the synchronous durable-record write: routed through a named command when
   enabled + the key is a known record + we're not already committing; else raw. */
function trkWrite(k, v) {
  const col = (TRK_COMMANDS && !TRK_RESTORING) ? trkCollectionOf(k) : null;
  if (col && !cmdIsCommitting()) {
    cmdCommit({
      type: col,
      scope: { module: 'trk', courseId: course, sylId: curSylId() },
      apply: (txn) => { txn.enlist(trkStore); mem[k] = v; bumpMemGen(k); TRK_SIG++; },
    });
  } else {
    mem[k] = v; bumpMemGen(k); TRK_SIG++;
  }
}
/* [CMDL-FINISH] §4 — no longer `async`, so a call inside a gesture completes its
   mem write SYNCHRONOUSLY (no await sequences a later write into a microtask that
   would escape the gesture's reducer). Returns a promise so `await sSet(...)`
   still works outside a gesture. Inside a gesture: mem write (trkWrite takes its
   raw branch while committing) + record the key; the storage flush is deferred by
   trkGesture to the transaction boundary. */
function sSet(k, v) {
  trkWrite(k, v);
  if (TRK_GESTURE_PENDING) { TRK_GESTURE_PENDING.set(k, v); return Promise.resolve(); }
  setSaveStatus('', 'saving');
  return storage.set(k, v).then(() => setSaveStatus('', 'ok'), () => setSaveStatus('local only', 'ok'));
}
/* flush a gesture's pending storage writes at the transaction boundary (M4: via
   cmdDeferEffect, so a rejected gesture never persists and a queued one flushes at
   drain). The mem records are already written; this is only the durable copy. */
function flushGesture(pending) {
  if (!pending || !pending.size) return;
  setSaveStatus('', 'saving');
  Promise.all([...pending].map(([k, v]) => v === TRK_DEL
    ? (storage.delete ? storage.delete(k) : storage.set(k, ''))
    : storage.set(k, v)))
    .then(() => setSaveStatus('', 'ok'), () => setSaveStatus('local only', 'ok'));
}
/* [CMDL-FINISH] §4 (GU-004) — run a gesture's SYNCHRONOUS mem + live-let
   mutations inside ONE command, so a multi-write gesture is ONE envelope (ONE
   undo step at Step 3). The caller HOISTS every async read/prompt BEFORE this and
   passes a sync fn. Nested (or already committing) ⇒ just run, joining the open
   transaction. The storage flush is raised as a boundary effect (M4). */
function trkGesture(fn) {
  if (TRK_GESTURE_PENDING || cmdIsCommitting() || !TRK_COMMANDS) { fn(); return; }
  const pending = new Map();
  TRK_GESTURE_PENDING = pending;
  try {
    cmdCommit({
      type: 'trk.gesture',
      scope: { module: 'trk', courseId: course, sylId: curSylId() },
      apply: (txn) => { txn.enlist(trkStore); fn(); cmdDeferEffect(() => flushGesture(pending)); },
    });
  } finally { TRK_GESTURE_PENDING = null; }
}

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
    const dl = defaultLayoutOf(curSylId());
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
/* SYLLABUS IDS ([TRK-CSID] 1B-ii). A syllabus is now an opaque id and the typed
   name is a label (mirror of course/student ids). `curSyl()` returns the current
   syllabus ID — the key segment every per-course student key files under
   (v3:<courseId>:<sylId>:…) and the suffix of the global layout key. Shipped
   data tables (SYLLABI / DEFAULT_LAYOUTS / EVENT_INFO_BY_SYL) stay keyed by the
   canonical NAME, so a lookup into them goes through the entry's `base`
   (curBase()); a custom has no base and no shipped table row. */
export function curSyl() { return curSylId(); }
export function curSylId() { return (plan && plan.sylId) || firstSylId(); }
export function curSylName() { return sylName(curSylId()); }
function curBase() { return baseOf(curSylId()); }
const kMarks = (c, s) => 'v3:' + c + ':' + curSylId() + ':m:' + s;
const kDatesOld = (c, s) => 'v3:' + c + ':d:' + s;              /* legacy: dates per course only */
const kDates = (c, s) => 'v3:' + c + ':' + curSylId() + ':d:' + s;
const kDatesFor = (c, syl, s) => 'v3:' + c + ':' + syl + ':d:' + s;
const kLayout = () => SYL_NS + ':lay:' + curSylId();
/* legacy layout key builders — read ONLY by the migration's KEEP half, which
   folds a course's own / old-master layout onto the syllabus id before retiring
   these paths; loadLayout no longer adopts them (the reset owns the fold). */
const kLayoutOwnFor = (c, name) => 'v3:lay:' + c + ':' + name;
const kLayoutOldMasterFor = name => 'v3:lay:SYLLABUS EDIT:' + name;
async function loadLayout() {
  layout = sParse(await sGet(kLayout()), {}, 'object'); loadLineDefaults(); loadEdgeMeta();
}
/* Adopt shipped default __lines / __derived only when the key is ABSENT. */
function loadLineDefaults() {
  const dl = defaultLayoutOf(curSylId());
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
/* Pick the built-in default layout that shares the most event IDs with a chart's
   events (the one on screen by default). */
function bestDefaultLayout(evs) {
  const ids = new Set((evs || SYL).map(e => e.id)); let best = null, bestN = 0;
  for (const k in DEFAULT_LAYOUTS) { const dl = DEFAULT_LAYOUTS[k]; if (!dl) continue; let n = 0; for (const id in dl) if (ids.has(id)) n++; if (n > bestN) { bestN = n; best = dl; } }
  return best;
}
/* Build a COMPLETE {id:{x,y}} for every event in the current SYL — the
   duplicate's copy. The same rule as an export, so a copy lands where the board
   drew the original. */
async function snapshotLayout(srcId) { return layoutSnapshotFor(srcId, SYL); }
/* EVERY ball's place, for ANY chart — on screen or not — by THE BOARD'S OWN
   RULE (nodePos): a place the user gave it; else the built-in's own course map
   (a custom chart borrows the built-in map that shares the most of its events);
   else the automatic flow. A chart that is not on screen used to have no map to
   borrow and no automatic flow, so every ball it had never dragged was written
   at 60,60 and came back stacked in one corner after export → wipe → import;
   one on screen fell back to the automatic flow while the board drew the
   borrowed map, so a ↺ Reset copy came back re-laid ([HUMAN-RETEST] W1-3, the
   D120 route). */
export async function layoutSnapshotFor(sylId, events) {
  const out = {};
  let saved = null;
  try { const r = await sGet(kLayoutFor(course, sylId)); if (r) saved = JSON.parse(r); } catch (_) {}
  const own = defaultLayoutOf(sylId);
  const live = (sylId === curSylId() && layout) ? layout : null;
  const evs = JSON.parse(JSON.stringify(events || []));      /* computeFlow scribbles on what it is given */
  const map = own || bestDefaultLayout(evs);
  const auto = computeFlow(evs).pos;
  evs.forEach(e => {
    const p = (live && live[e.id]) || (saved && saved[e.id]) || (map && map[e.id])
      || auto[e.id] || { x: 60, y: 60 };
    out[e.id] = { x: p.x, y: p.y };
  });
  for (const k of ['__edgeMeta', '__merges', '__unmerges', '__font', '__lines', '__derived']) {
    const v = (live && live[k]) || (saved && saved[k]) || (own && own[k]);
    if (v != null) out[k] = JSON.parse(JSON.stringify(v));
  }
  return out;
}

/* THE CATALOGUE ([TRK-CSID] 1B-ii). `SYLS` is the ordered live list of
   { id, name, base?, userNamed? } — the id is the identity, the name a label.
   A BUILT-IN entry carries a base = the canonical shipped SYLLABI key it draws
   its definition, default layout and event-info from (always authoritative from
   the code table); `userNamed:true` once a user relabels it, so a shipped rename
   never clobbers the relabel. A CUSTOM entry has no base; its definition lives
   under its id in `customDefs`. An EDITED built-in is a built-in entry PLUS an
   override definition under its id in `customDefs` (the old CUSTOMS[name] shadow,
   now id-keyed). `customDefs` is the id-keyed def store persisted at v3:master:syls. */
export let SYLS = [];
export let customDefs = {};
/* Built-ins can be renamed and deleted like any other syllabus. Now id-keyed:
   hidden/tomb are sets of ids; SYL_ALIAS is retired (a relabelled built-in keeps
   its id and resolves its layout through its own `base`, §6/§13 Q6). */
export let SYL_HIDDEN = [], SYL_TOMB = {};
export function isHidden(id) { return SYL_HIDDEN.indexOf(id) >= 0; }
export function sylEntry(id) { return SYLS.find(e => e.id === id) || null; }
export function sylName(id) { const e = sylEntry(id); return e ? e.name : ''; }
export function sylIdOf(name) { const e = SYLS.find(x => x.name === name); return e ? e.id : null; }
/* base — the canonical shipped name a built-in resolves through; authoritative
   from the code table for any sb… id, absent for a custom. */
/* base resolves ONLY through a live catalogue entry — a deleted (tombstoned)
   built-in has no entry, so it must not resolve back to a shipped def via the
   code table; reconcileBuiltins keeps every live built-in entry's base correct. */
function baseOf(id) { const e = sylEntry(id); return e && e.base ? e.base : null; }
function defaultLayoutOf(id) { const b = baseOf(id); return b ? (DEFAULT_LAYOUTS[b] || null) : null; }
/* the "✎ edited / custom" marker: an override or custom definition is stored
   under the id (mirror of the old CUSTOMS[name] presence check). */
export function sylHasOwnDef(id) { return !!(customDefs && has(customDefs, id)); }
/* builtinOf(id) — truthy (the id) for a built-in id that the catalogue holds,
   else null; kept as the name delSyl/UI already read. */
export function builtinOf(id) { return (isBuiltinSylId(id) && sylEntry(id)) ? id : null; }
/* own-property lookup so a def keyed "__proto__"/"constructor" reads as a def,
   never as Object.prototype's (review CSID-REV-08). Resolve an override ONLY for
   a live catalogue entry, so a stale/orphan customDefs id (no entry) does not
   resurrect an identity the catalogue excludes (review CSID-B07). */
function sylSource(id) { if (customDefs && has(customDefs, id) && sylEntry(id)) return customDefs[id]; const b = baseOf(id); return b ? SYLLABI[b] : null; }
export function allSylIds() { return SYLS.map(e => e.id).filter(id => !isHidden(id)); }
export function orderedSylIds() {
  const all = allSylIds();
  const ranked = SYL_ORDER.filter(id => all.includes(id));
  return [...ranked, ...all.filter(id => !ranked.includes(id))];
}
/* labels, for the dropdown / reorder modal / chart export (names-in-modal is
   kept, §9 — labels are unique across the catalogue by ensureUniqueLabel). */
export function allSylNames() { return allSylIds().map(sylName); }
export function orderedSylNames() { return orderedSylIds().map(sylName); }
/* deleted built-ins offered for restore in the reorder modal (§9): a built-in
   whose id is tombstoned or hidden, labelled by its shipped canonical name (it
   has no live catalogue entry once deleted). */
export function hiddenBuiltins() { return BUILTIN_SYL.filter(b => SYL_TOMB[b.id] || isHidden(b.id)).map(b => ({ id: b.id, name: b.name })); }
function firstSylId() {
  const def = builtinIdByName(DEFAULT_SYL_NAME);
  if (def && sylEntry(def) && !isHidden(def)) return def;
  const o = orderedSylIds();
  return o[0] || (SYLS[0] && SYLS[0].id) || def || 'sb2026';
}
/* one label per catalogue entry (§15 CSID2-R2-06): keep an existing user label,
   disambiguate the INCOMING one with a numeric suffix so a shipped rename that
   collides with a user's custom label never silently duplicates. The id is the
   true key; this is a display/lookup guard so sylIdOf's first-match is safe. */
function ensureUniqueLabel(id, desired) {
  const taken = new Set(SYLS.filter(e => e.id !== id).map(e => e.name));
  let nm = desired, n = 2;
  while (taken.has(nm)) nm = desired + ' (' + (n++) + ')';
  return nm;
}
function padId(id) {
  const SPECIAL = { 'IEPE': 'IEPE/IPC', 'T-9': 'T-09', 'NVG-1': 'NVG-01', 'ST-7(P)': 'ST-07(P)', 'ST-7(W)': 'ST-07(W)' };
  if (SPECIAL[id]) return SPECIAL[id];
  const m = (id + '').match(/^([A-Z()\/]+)-(\d+)([A-Z]?(\([A-Z]\))?)$/);
  if (!m) return id;
  return m[1] + '-' + (m[2].length === 1 ? ('0' + m[2]) : m[2]) + (m[3] || '');
}
/* Translate a LEGACY layout's event-id references onto the shipped ids (§17
   CSID2-R4-02, §18 CSID2-R5-03; review CSID-REV-01/02). The built-in charts
   renumbered sorties (padId/SPECIAL), so a hand-drawn layout folded onto a
   built-in id must have its position keys, its event-keyed __font, AND its
   id-referencing routing metadata mapped to the NEW ids — or nodePos/anchorPt
   miss them and the hand-drawn work is silently lost. Marks are RESET (§5.3) /
   refused on import (§19), so no MARK translation exists; layout-only, KEEP half.
   - position keys + __font keys: exact-match-first (padId fallback), __all kept;
   - __edgeMeta keys are `<id>▸<id>` — split and map each side;
   - the routing ARRAYS (__lines/__derived/__merges/__unmerges) and every value
     are walked, translating only a STRING that is a legacy event id resolving to
     a shipped id (a line id / side / coordinate is left — padId is a no-op and it
     is not in the target's id set), so an anchor {t:'ball',id:'IEPE'} becomes
     'IEPE/IPC' while nothing else is disturbed.
   COLLISION = FAIL CLOSED (§14 CSID2-03/§16): if two source keys map to one
   destination with DIFFERING values, return { ok:false } so the migration fails
   closed and the differing source is never silently dropped. Returns { layout, ok }. */
function translateLayoutKeys(lay, idSet) {
  if (!lay || typeof lay !== 'object') return { layout: lay, ok: true };
  const mapKey = k => idSet.has(k) ? k : (idSet.has(padId(k)) ? padId(k) : null);
  const tok = s => idSet.has(s) ? s : (idSet.has(padId(s)) ? padId(s) : s);
  /* a string may be a bare event id OR a COMPOSITE key: an edge is `<id>▸<id>`
     and a crossing pair is `<edgekey>|<edgekey>` (__derived/__merges/__unmerges,
     review CSID-02). Translate each event-id token in place; a non-event token
     (a line id, a side) resolves to itself (padId is a no-op, not in the set). */
  const tstr = s => (typeof s === 'string') ? ((s.indexOf('▸') >= 0 || s.indexOf('|') >= 0) ? s.replace(/[^▸|]+/g, tok) : tok(s)) : s;
  const twalk = v => Array.isArray(v) ? v.map(twalk) : (v && typeof v === 'object' ? Object.fromEntries(Object.keys(v).map(k => [k, twalk(v[k])])) : tstr(v));
  const out = {}; let ok = true;
  const put = (o, k, val) => { if (Object.prototype.hasOwnProperty.call(o, k)) { if (JSON.stringify(o[k]) !== JSON.stringify(val)) ok = false; } else o[k] = val; };
  for (const k in lay) {
    if (k === '__font') {
      const f = lay.__font || {}, nf = {};
      for (const fk in f) { if (fk === '__all') { nf.__all = f.__all; continue; } const nk = mapKey(fk); if (nk) put(nf, nk, f[fk]); }
      out.__font = nf; continue;
    }
    if (k === '__edgeMeta') {
      const em = lay.__edgeMeta || {}, ne = {};
      for (const ek in em) { const nk = ek.split('▸').map(p => mapKey(p) || p).join('▸'); put(ne, nk, twalk(em[ek])); }
      out.__edgeMeta = ne; continue;
    }
    if (k === '__merges' || k === '__unmerges' || k === '__lines' || k === '__derived') { out[k] = twalk(lay[k]); continue; }
    if (k.indexOf('__') === 0) { out[k] = lay[k]; continue; }
    const nk = mapKey(k); if (nk) put(out, nk, lay[k]);
  }
  return { layout: out, ok };
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
/* SUPERSEDED by migrateSylIds ([TRK-CSID] 1B-ii). The legacy flat-roster split
   and the fresh-store demo seed both belonged to the name-keyed era; the syllabus
   migration now RESETS the whole student layer (§5.3), re-seeds the demo pair
   id-keyed, and sets kRosterMig for every course BEFORE any course opens — so this
   always early-returns. Kept as a defensive flag-set for a course that somehow
   reaches load unflagged (it stamps the flag; the student layer is already the
   reset's clean id-native start). */
async function migrateRosters(c) {
  try { if (!(await sGet(kRosterMig(c)))) await sSet(kRosterMig(c), '1'); } catch (_) {}
}
const has = (o, k) => Object.prototype.hasOwnProperty.call(o, k);
/* EVERY syllabus ID the STORE holds a per-course record under, plus every
   catalogue id ([TRK-CSID] 1B-ii — replaces the name-keyed storeSylNames). Never
   just the ids this boot loaded and never just the visible ones: somebody
   enrolled only on a currently-HIDDEN built-in is still enrolled. The whole
   catalogue (hidden included) is a superset; a per-course scan of the store
   catches any id that has a roster/marks/dates record even if it left the
   catalogue (an orphan after a delete). Bounded storage.list() scan — it cannot
   miss a key. Empty rosters are skipped by every reader, so the superset is safe. */
async function storeSylIds(c) {
  const out = new Set(SYLS.map(e => e.id));
  const pre = 'v3:' + c + ':';
  for (const k of ((await storage.list(pre)).keys || [])) {
    const rest = k.slice(pre.length), i = rest.indexOf(':'); if (i <= 0) continue;
    const seg = rest.slice(0, i), tail = rest.slice(i + 1);
    if (isSylId(seg) && (tail === 'roster' || tail.startsWith('m:') || tail.startsWith('d:'))) out.add(seg);
  }
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
    const syls = await storeSylIds(c), ids = Object.create(null), rosters = {};
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

/* ============================================================================
   SYLLABUS NAMES → SYLLABUS IDS ([TRK-CSID] 1B-ii). "Keep charts, reset marks":
   the global chart CATALOGUE (definitions, layouts, order/hidden/tomb, labels)
   is converted IN PLACE (the owner's hand-drawn work, kept); the per-(course,
   syllabus) STUDENT LAYER (rosters/marks/dates/pace/lulls/last) is RESET — the
   single riskiest piece (mark keys carry the syllabus name MID-KEY) is thrown
   away rather than migrated (owner decision, spec §Owner decisions/§5).

   Driven by a durable PAYLOAD JOURNAL (§15 CSID2-R2-01): the complete intended
   outputs are computed ONCE from the ORIGINAL sources, written + read back
   BEFORE any store mutation, and every apply is a whole-object/whole-key write
   from the carried payload — so a retry re-applies with no live object to
   mis-parse (the name-vs-id ambiguity the earlier designs could not resolve).
   TWO flags: kSylCatMig (KEEP verified) then kSylReset (RESET done); a verified
   KEEP is never redone if RESET later fails; boot is ready only when both land.
   Fail-closed on any unrecoverable state (setBootError; App shows the reload
   panel with no board, no writers). Same read-back discipline as
   migrateCourseIds (proves the whiteboard write + resumability, not backend
   durability — that is [TRK-DISK]/the DB step). ========================== */
const kSylCatMig = 'v3:sylcatmig';       /* KEEP half done + verified */
const kSylReset = 'v3:sylreset';         /* RESET half done */
const kSylIdJournal = 'v3:syljournal';   /* the durable payload journal of a run in progress */
const kSylAliasLegacy = SYL_NS + ':sylalias';   /* retired pref (§6); purged by the migration */

/* structural equality that ignores object KEY ORDER (arrays stay ordered): two
   saved layouts holding the same positions serialised in a different key order
   are the SAME layout, so the migration's differing-source guard must not treat a
   re-ordered re-save as a conflict and brick the upgrade (review RR-02). */
const layoutEq = (a, b) => {
  if (a === b) return true;
  if (!a || !b || typeof a !== 'object' || typeof b !== 'object') return a === b;
  const aArr = Array.isArray(a), bArr = Array.isArray(b);
  if (aArr !== bArr) return false;
  if (aArr) { if (a.length !== b.length) return false; for (let i = 0; i < a.length; i++) if (!layoutEq(a[i], b[i])) return false; return true; }
  const ak = Object.keys(a), bk = Object.keys(b);
  if (ak.length !== bk.length) return false;
  for (const k of ak) { if (!has(b, k) || !layoutEq(a[k], b[k])) return false; }
  return true;
};

/* Compute the COMPLETE intended outputs ONCE from the ORIGINAL sources. Returns
   the journal object, or null after setBootError on an unrecoverable conflict. */
async function buildSylJournal() {
  const idByName = Object.create(null);      // name → id (mint once, reused)
  const defById = Object.create(null);       // id → definition payload (custom / built-in override)
  const catById = Object.create(null);       // id → {id,name,base?}
  const sylcat = [];
  const rawLayoutById = Object.create(null); // id → raw (pre-translation) layout, for the precedence/conflict check
  const layoutSrcById = Object.create(null); // id → source key the layout came from
  const addCat = (id, name, base) => { if (catById[id]) return catById[id]; const e = { id, name }; if (base) e.base = base; catById[id] = e; sylcat.push(e); return e; };

  /* EVERY shipped built-in is in the catalogue (§5.2 step 1) — even one no data
     references yet — so a fresh store's index is complete without waiting for the
     boot reconcile. A built-in the user had DELETED (its name in the legacy
     syltomb pref) is left out and stays tombstoned (hidden ≠ deleted). */
  const tombNames = Object.keys(sParse(await sGet(kSylTomb()), {}, 'object') || {});
  const hiddenNames = sParse(await sGet(kSylHidden()), [], 'array').filter(x => typeof x === 'string');   // read here too: the classify guard below needs it
  for (const b of BUILTIN_SYL) { idByName[b.name] = b.id; if (tombNames.indexOf(b.name) < 0) addCat(b.id, b.name, b.name); }

  /* definitions, precedence highest-first: master → legacy master → per-course
     own → the plan.custom single legacy def (§14 CSID2-02) */
  const defByName = Object.create(null);
  /* provenance: a def in the GLOBAL master (v3:master:syls) was adopted into the old
     reader's CUSTOMS UNCONDITIONALLY and shown; a def from the legacy master or a
     per-course store was adopted ONLY when its name was neither hidden nor
     tombstoned. Track the global-master names so the classify step honours that
     guard and does not resurrect a suppressed legacy def (review RR-03). */
  const defFromMaster = Object.create(null);
  const addDefs = (obj, fromMaster) => { if (obj && typeof obj === 'object' && !Array.isArray(obj)) for (const n of Object.keys(obj)) if (!has(defByName, n)) { defByName[n] = obj[n]; if (fromMaster) defFromMaster[n] = true; } };
  addDefs(sParse(await sGet(kSyls()), {}, 'object'), true);
  addDefs(sParse(await sGet(kSylsOldMaster()), {}, 'object'), false);
  for (const cE of COURSES) addDefs(sParse(await sGet(kSylsOwn(cE.id)), {}, 'object'), false);
  /* the plan.custom single legacy def (v3:<course>:syl) is collected PER COURSE,
     not merged by name: two unopened courses can share a sylName but hold
     DIFFERENT edited charts, so each gets its OWN minted id + unique label and
     its plan points at its own chart — never silently collapsing onto the first
     (review CSID-REVIEW-01; the old loader switched plan.sylName to '<syl> (edited)'). */
  const customPlanDefs = [];   // { courseId, syl, name, def }
  for (const cE of COURSES) {
    const p = sParse(await sGet(kPlan(cE.id)), {}, 'object');
    if (p && p.custom) { const sr = await sGet(kSyl(cE.id)); const legacy = sr ? sParse(sr, null) : null; if (legacy) { const syl = p.sylName || DEFAULT_SYL_NAME; customPlanDefs.push({ courseId: cE.id, syl, name: syl + ' (edited)', def: legacy }); } }
  }
  /* CLASSIFY every name that carries a DEFINITION (§17 CSID2-R4-01): current
     canonical → built-in id (def becomes its override); else a custom id.
     EXCEPT a canonical name the user had DELETED (its name in the legacy syltomb
     pref): the old app showed such a def as an INDEPENDENT custom — a
     v3:master:syls key was adopted into CUSTOMS unconditionally and rendered,
     while the shipped built-in stayed hidden+tombstoned — so folding it onto the
     built-in id here would HIDE a chart the owner was using (review: a migration
     must preserve what the old READER showed). Mint it a custom id; the built-in
     is left tombstoned (it was never seeded into the catalogue above). */
  for (const name of Object.keys(defByName)) {
    /* the old reader did NOT adopt a legacy-master / per-course def whose name was
       hidden or tombstoned — it showed no chart for it — so minting a visible custom
       (or a built-in override) here would RESURRECT a chart the owner had suppressed.
       Only a GLOBAL-master def is unconditional. Skip the suppressed legacy def; the
       built-in (if any) is handled by seeding/hidden/tomb below (review RR-03). */
    if (!defFromMaster[name] && (hiddenNames.indexOf(name) >= 0 || tombNames.indexOf(name) >= 0)) continue;
    const cls = classifyDefinedName(name);
    /* fold a def onto the built-in id ONLY when that built-in is LIVE — neither
       tombstoned NOR hidden. The old reader's CUSTOMS was never filtered by hidden
       or tomb, so a surviving def under a hidden (or deleted) built-in name SHOWED
       as a custom; folding it onto the built-in id would make it a hidden override
       that vanishes. Mint a visible custom instead; the built-in is still seeded
       (if not tombstoned) and carried in the hidden set, exactly as the old model
       held it (review: preserve what the old READER showed). */
    const asBuiltin = cls.builtin && tombNames.indexOf(name) < 0 && hiddenNames.indexOf(name) < 0;
    const id = asBuiltin ? cls.id : mintSylId();
    idByName[name] = id;
    if (!has(defById, id)) defById[id] = defByName[name];
    addCat(id, name, asBuiltin ? cls.base : undefined);
  }
  /* now the per-course plan.custom charts: a fresh id + a label unique in the
     catalogue for each, so neither is lost when the sylNames collide. */
  const uniqLabel = desired => { const taken = new Set(sylcat.map(e => e.name)); let nm = desired, n = 2; while (taken.has(nm)) nm = desired + ' (' + (n++) + ')'; return nm; };
  const editedPlanId = Object.create(null);
  for (const { courseId, name, def } of customPlanDefs) {
    const id = mintSylId(); defById[id] = def; addCat(id, uniqLabel(name)); editedPlanId[courseId] = id;
  }
  /* the course's OWN hand-drawn layout (v3:lay:<course>:<sylName>) belongs to
     ITS edited chart, not to the built-in the sylName spells (review CSID-IR-01):
     that layout name collides with the built-in name, so routing it by name would
     hang it on e.g. sb2026 and DROP the edited chart's positions (then purge the
     source). Claim those exact keys for the minted edited id here, keyed by the
     precise source key so a DIFFERENT course's built-in layout under the same name
     is untouched. */
  const editedLayKey = new Map();   // 'v3:lay:<course>:<sylName>' → edited id
  for (const { courseId, syl } of customPlanDefs) if (has(editedPlanId, courseId)) editedLayKey.set('v3:lay:' + courseId + ':' + syl, editedPlanId[courseId]);

  /* RESOLVE the rest — names with NO definition (a pref entry, a layout-only
     name, a plan pointer): a canonical name or a historical alias folds onto the
     built-in it names (the def-less-alias fold, §18 CSID2-R3-02 — STORE path
     only, §19); a name already classified as a custom keeps that id; an ordinary
     def-less name resolves to nothing (its plan pointer is repaired at RESET). */
  const resolve = name => {
    if (typeof name !== 'string' || !name) return null;
    if (has(idByName, name)) return idByName[name];      // already classified (custom or built-in)
    const bid = builtinIdByName(name) || builtinIdByAlias(name);
    if (bid) return idByName[name] = bid;
    return null;
  };

  /* layout sources, precedence highest-first per NAME: master lay → legacy
     master lay → per-course own lay. Kept RAW here; translated + assigned to an
     id below. A layout under an unresolved name is dropped (nothing to hang it
     on). Built-in fold layouts are event-id-translated (§17 CSID2-R4-02). */
  const allKeys = (await storage.list()).keys || [];
  const candByName = Object.create(null);           // name → [{raw, srcKey, kind}] every source
  const legacyLayKeys = [];                         // legacy layout keys to purge after the fold
  const masterLayKeys = [];                         // v3:master:lay:<name> (rewritten to id form)
  const rank = { master: 0, oldmaster: 1, own: 2 };
  /* COLLECT every candidate layout per name; the winner and any conflict are
     decided AFTER the whole sweep, not inline. A later higher-precedence source
     (a master read AFTER two differing per-course layouts) must then settle the
     name the way the old reader did — always the master — instead of a sticky
     first-seen flag bricking the upgrade regardless of read order (review RR-01). */
  const consider = (name, raw, srcKey, kind) => { (candByName[name] || (candByName[name] = [])).push({ raw, srcKey, kind }); };
  for (const k of allKeys) {
    if (k.startsWith(SYL_NS + ':lay:')) { const name = k.slice((SYL_NS + ':lay:').length); masterLayKeys.push({ k, name }); const raw = sParse(await sGet(k), null, 'object'); if (raw) consider(name, raw, k, 'master'); continue; }
    if (k.startsWith('v3:lay:SYLLABUS EDIT:')) { const name = k.slice('v3:lay:SYLLABUS EDIT:'.length); legacyLayKeys.push(k); const raw = sParse(await sGet(k), null, 'object'); if (raw) consider(name, raw, k, 'oldmaster'); continue; }
    if (k.startsWith('v3:lay:')) { const rest = k.slice('v3:lay:'.length), i = rest.indexOf(':'); if (i > 0) { const cid = rest.slice(0, i), name = rest.slice(i + 1); if (COURSES.some(c => c.id === cid)) { legacyLayKeys.push(k); const raw = sParse(await sGet(k), null, 'object'); if (raw) { const eid = editedLayKey.get(k); if (eid) { if (!has(rawLayoutById, eid)) { rawLayoutById[eid] = raw; layoutSrcById[eid] = k; } } else consider(name, raw, k, 'own'); } } } continue; }
  }
  /* pick each name's winner at its HIGHEST available precedence (§14 CSID2-03):
     a same-rank DIFFERING non-empty pair (two courses' own hand-drawn layouts with
     no master) fails closed — nothing written or purged, both sources intact — but
     a re-ordered-but-equal re-save (layoutEq, not raw text) and empty sources never
     trigger it, whichever order they were read (review RR-01/RR-02). */
  const layByName = Object.create(null);            // name → {raw, srcKey, kind} winner
  for (const name of Object.keys(candByName)) {
    const cands = candByName[name];
    let best = rank.own; for (const c of cands) if (rank[c.kind] < best) best = rank[c.kind];
    const top = cands.filter(c => rank[c.kind] === best);
    const nonEmpty = top.filter(c => Object.keys(c.raw || {}).length);
    if (nonEmpty.length) {
      const win = nonEmpty[0];
      if (nonEmpty.some(c => !layoutEq(c.raw, win.raw))) { setBootError('Two different saved chart layouts were found for the same syllabus, so the Tracker could not finish upgrading safely. Reload to try again — nothing has been changed.'); return null; }
      layByName[name] = { raw: win.raw, srcKey: win.srcKey, kind: win.kind };
    } else {
      layByName[name] = { raw: top[0].raw, srcKey: top[0].srcKey, kind: top[0].kind };   // all empty at the winning rank → keep an empty result
    }
  }

  /* prefs (name-keyed pre-mig) */
  const orderNames = sParse(await sGet(kSylOrder()), [], 'array').filter(x => typeof x === 'string');
  /* hiddenNames and tombNames already read above (built-in seeding + classify guard) */

  /* discover every remaining name (prefs, layouts, plan pointers) so an id is
     assigned (or the name is knowingly dropped) before anything is written */
  const planSylByCourse = Object.create(null);
  for (const cE of COURSES) { const p = sParse(await sGet(kPlan(cE.id)), {}, 'object'); if (p) { planSylByCourse[cE.id] = p; } }
  const everyName = new Set([...Object.keys(defByName), ...Object.keys(layByName), ...orderNames, ...hiddenNames, ...tombNames]);
  for (const cE of COURSES) { const p = planSylByCourse[cE.id]; if (p) { if (p.sylName) everyName.add(p.sylName); if (p.__oldSyl) everyName.add(p.__oldSyl); } }
  for (const name of everyName) resolve(name);   // populates idByName + folds def-less aliases

  /* assign layouts to ids (translated), with the fail-closed differing-source
     guard (§14 CSID2-03, §16 CSID2-R3-01): one id, one layout; a second
     DIFFERING non-empty source refuses the whole conversion rather than drop a
     user's hand-drawn positions. */
  for (const name of Object.keys(layByName)) {
    const id = idByName[name]; if (!id) continue;   // unresolved → drop
    const { raw, srcKey } = layByName[name];
    if (has(rawLayoutById, id)) {
      const held = rawLayoutById[id];
      const heldEmpty = !Object.keys(held || {}).length, rawEmpty = !Object.keys(raw || {}).length;
      /* two NAMES onto one id: conflict only when BOTH are non-empty and structurally
         differ (layoutEq ignores key order); an empty source never conflicts, and an
         empty holder is upgraded to a non-empty one rather than lost (review RR-02). */
      if (!heldEmpty && !rawEmpty && !layoutEq(held, raw)) { setBootError('Two different saved layouts point at the same syllabus, so the Tracker could not finish upgrading safely. Reload to try again — nothing has been changed.'); return null; }
      if (heldEmpty && !rawEmpty) { rawLayoutById[id] = raw; layoutSrcById[id] = srcKey; }
      continue;
    }
    rawLayoutById[id] = raw; layoutSrcById[id] = srcKey;
  }
  /* build the id-keyed layout payloads, event-id-translated onto the target def;
     a differing-value collision fails closed (§14 CSID2-03, review CSID-REV-02). */
  const layoutOut = Object.create(null);   // destKey → payload
  for (const id of Object.keys(rawLayoutById)) {
    const base = isBuiltinSylId(id) ? builtinBaseOf(id) : null;
    const def = defById[id] || (base ? SYLLABI[base] : null) || [];
    const idSet = new Set((def || []).map(e => e.id));
    const t = translateLayoutKeys(raw2plain(rawLayoutById[id]), idSet);
    if (!t.ok) { setBootError('Two saved layout positions point at the same event under the new ids, so the Tracker could not finish upgrading safely. Reload to try again — nothing has been changed.'); return null; }
    layoutOut[SYL_NS + ':lay:' + id] = t.layout;
  }

  /* the id-forms of the prefs. HIDDEN and TOMB map through the CANONICAL
     built-in name ONLY (builtinIdByName), NEVER the alias fold: the old reader
     hid a built-in only when its CURRENT shipped name was in the set
     (SYL_NAMES.filter(!isHidden)) and never hid a custom at all, so a stale alias
     name (e.g. 'FG JUL 26' after the shipped rename to '2026') or a custom name
     sitting in these prefs was DEAD. Folding it onto the live built-in id would
     hide/delete a chart the owner could see before the upgrade — a shipped rename
     even UN-deleted such a built-in in the old app (review: preserve what the old
     READER showed). order stays alias-tolerant: it is display-only and filtered
     to visible ids at render, so a dead entry there can resurrect nothing. */
  const order = []; for (const n of orderNames) { const id = idByName[n]; if (id && !order.includes(id)) order.push(id); }
  const hidden = []; for (const n of hiddenNames) { const id = builtinIdByName(n); if (id && !hidden.includes(id)) hidden.push(id); }
  const tomb = Object.create(null); for (const n of tombNames) { const id = builtinIdByName(n); if (id) tomb[id] = 1; }

  /* EVERY persisted course namespace, not just the visible index (review
     CSID-IR-02): delCourse drops a course from v3:courses but KEEPS its records,
     so a deleted legacy course still holds v3:<id>:<sylName>:roster|m:|d: student
     data. The RESET must sweep and repair those too, or a later re-import of that
     course under its old id would surface the stale marks — the global reset flags
     then block any cleanup. allCourseNamespaces already unions the index with a
     v3: prefix scan; deleted namespaces are repaired WITHOUT re-adding them to the
     visible index (applyResetJournal only writes their per-course records). */
  const namespaces = await allCourseNamespaces();
  for (const c of namespaces) if (!(c in planSylByCourse)) { const p = sParse(await sGet(kPlan(c)), null, 'object'); if (p) planSylByCourse[c] = p; }

  /* per-course plan target id (drops __oldSyl). The fallback and every target are
     validated against the LIVE, non-tombstoned catalogue being built (review
     CSID-04): a course pointing at a vanished/tombstoned chart is repaired to a
     real remaining syllabus, never to a deleted default. */
  const plans = Object.create(null);
  const liveIds = new Set(sylcat.map(e => e.id));
  const preferred = builtinIdByName(DEFAULT_SYL_NAME);
  const fallbackId = liveIds.has(preferred) ? preferred : (sylcat[0] && sylcat[0].id);
  for (const c of namespaces) {
    const p = planSylByCourse[c];
    /* a plan.custom course points at ITS OWN edited chart id; else the sylName's id (CSID-B04/REVIEW-01) */
    let t = has(editedPlanId, c) ? editedPlanId[c] : ((p && p.sylName) ? (idByName[p.sylName] || resolve(p.sylName)) : null);
    if (!t || !liveIds.has(t)) t = fallbackId;
    plans[c] = t;
  }

  /* the id-keyed definition store: built-in overrides + customs under their id */
  const defs = Object.create(null); for (const id of Object.keys(defById)) defs[id] = defById[id];

  /* PURGE = legacy source keys ∖ destination keys (§16 CSID2-R3-01): the
     name-keyed master layout keys whose id-form is not itself a destination, the
     legacy layout keys, the legacy def stores, and the retired sylalias pref. */
  const destKeys = new Set([kSyls(), kSylOrder(), kSylHidden(), kSylTomb(), kSylCat(), ...Object.keys(layoutOut)]);
  const purge = new Set();
  for (const { k } of masterLayKeys) if (!destKeys.has(k)) purge.add(k);
  for (const k of legacyLayKeys) if (!destKeys.has(k)) purge.add(k);
  for (const cE of COURSES) { purge.add(kSylsOwn(cE.id)); purge.add(kSyl(cE.id)); }
  purge.add(kSylsOldMaster()); purge.add(kSylAliasLegacy);

  return {
    defs, sylcat, layouts: layoutOut, order, hidden, tomb, plans,
    purge: [...purge].filter(k => !destKeys.has(k)),
    courseIds: namespaces,   /* review CSID-IR-02: RESET sweeps every persisted namespace, incl. deleted courses */
  };
}
/* re-clone through JSON so a null-proto or shared ref never leaks into a payload */
function raw2plain(v) { try { return JSON.parse(JSON.stringify(v)); } catch (_) { return v; } }

/* KEEP — replay the journal's catalogue writes (idempotent whole-object writes),
   read-back-verified, purge sources, then verify all destinations survived. */
async function applyKeepJournal(j) {
  const put = async (k, v) => { const s = JSON.stringify(v); await sSet(k, s); return (await sGet(k)) === s; };
  if (!(await put(kSyls(), j.defs))) return false;
  for (const destKey of Object.keys(j.layouts)) { const s = JSON.stringify(j.layouts[destKey]); await sSet(destKey, s); if ((await sGet(destKey)) !== s) return false; }
  if (!(await put(kSylOrder(), j.order))) return false;
  if (!(await put(kSylHidden(), j.hidden))) return false;
  if (!(await put(kSylTomb(), j.tomb))) return false;
  if (!(await put(kSylCat(), j.sylcat))) return false;   /* the index every reader keys off — written last */
  for (const k of j.purge) await delKey(k);
  /* FINAL verify after ALL purges (§16 CSID2-R3-01): a purge must not have
     deleted a destination that shared a key with a legacy name. */
  for (const destKey of Object.keys(j.layouts)) { const v = await sGet(destKey); if (v == null || v === '' || v !== JSON.stringify(j.layouts[destKey])) return false; }
  if ((await sGet(kSylCat())) !== JSON.stringify(j.sylcat)) return false;
  return true;
}

/* RESET — clear the student layer under every course, convert the plan to its
   id, zero the legacy pace fallbacks (§14 CSID2-07), stamp the id-native flags,
   and re-seed the demo pair on the default course (so smoke:tracker finds it).
   Delete-only + idempotent: a half-done reset simply finishes on the retry. */
async function applyResetJournal(j) {
  for (const c of j.courseIds) {
    const pre = 'v3:' + c + ':';
    for (const k of ((await storage.list(pre)).keys || [])) {
      const rest = k.slice(pre.length), i = rest.indexOf(':'); const seg = i > 0 ? rest.slice(0, i) : rest;
      const tail = i > 0 ? rest.slice(i + 1) : '';
      /* the whole student layer, under ANY middle segment (name OR id — §5.3):
         per-(course,syllabus) roster/marks/dates, plus the course-level flat
         roster, lulls, pace, last, lastStudent and the legacy per-course dates.
         NEVER the plan or the flags, and never a legacy DEF key (v3:c:syl /
         v3:c:syls — those are the KEEP half's to purge). */
      /* protect the EXACT course-level keys only (tail empty) — a SYLLABUS
         literally named 'plan' etc. has a tail (roster/m:/d:) and must still be
         swept (review CSID-REV-07); the def keys (syl/syls) are the KEEP half's */
      if (tail === '' && (seg === 'plan' || seg === 'rostermig' || seg === 'idmig' || seg === 'idmap' || seg === 'syl' || seg === 'syls')) continue;
      if (tail === 'roster' || tail.startsWith('m:') || tail.startsWith('d:')      /* v3:c:<seg>:roster|m:*|d:* — any middle seg */
        || seg === 'roster' || seg === 'lulls' || seg === 'pace' || seg === 'last' || seg === 'lastStudent'
        || seg === 'd') await delKey(k);                                            /* legacy flat dates v3:c:d:* */
    }
    /* the plan: keep mode + epw (a genuine course pace default), zero lulls /
       targets, point at the mapped syllabus id, drop the legacy fields */
    let p = sParse(await sGet(kPlan(c)), {}, 'object') || {};
    const np = { sylId: j.plans[c] || (BUILTIN_SYL[0] && BUILTIN_SYL[0].id), mode: p.mode || 'pace', epw: (p.epw != null ? p.epw : 2), target: null, target2: null, lulls: [] };
    const npStr = JSON.stringify(np);
    /* verify the plan + flag writes (review CSID-01) — sSet swallows a failed
       write, so a stamped flag over an unwritten plan would strand the reset. */
    await sSet(kPlan(c), npStr); if ((await sGet(kPlan(c))) !== npStr) return false;
    await sSet(kRosterMig(c), '1'); await sSet(kIdMig(c), '1');
    if ((await sGet(kRosterMig(c))) !== '1' || (await sGet(kIdMig(c))) !== '1') return false;
    await delKey(kIdMap(c));
  }
  /* re-seed the demo pair on the default course, id-native (entries), exactly as
     a fresh store's born-clean course would have them. */
  const def = COURSES.find(c => c.name === DEFAULT_COURSE_NAME);
  if (def) {
    const p = sParse(await sGet(kPlan(def.id)), {}, 'object') || {};
    const sid = p.sylId || (BUILTIN_SYL[0] && BUILTIN_SYL[0].id);
    const rk = kRosterFor(def.id, sid);
    const cur = sParse(await sGet(rk), [], 'array');
    if (!cur.length) await sSet(rk, JSON.stringify([{ id: mintId(), name: 'STUDENT A' }, { id: mintId(), name: 'STUDENT B' }]));
  }
  return true;
}

/* Runs once per browser in init(), after migrateCourseIds()+loadCourses() and
   BEFORE loadCourse(). One retry on the same boot (mirror the course retry). */
/* a persisted journal is REPLAYED, so its identities must be valid BEFORE any
   write (§16, review CSID-03): every id a real syllabus id, every sb… id one the
   code table ships. */
function validSylJournal(j) {
  if (!j || typeof j !== 'object') return false;
  const ok = id => isSylId(id) && !(isBuiltinSylId(id) && !builtinSylById(id));
  if (!Array.isArray(j.sylcat) || !j.sylcat.every(e => isSylEntry(e) && ok(e.id))) return false;
  if (j.defs && !Object.keys(j.defs).every(ok)) return false;
  if (j.plans && !Object.values(j.plans).every(id => id == null || ok(id))) return false;
  if (Array.isArray(j.order) && !j.order.every(ok)) return false;
  if (Array.isArray(j.hidden) && !j.hidden.every(ok)) return false;
  if (j.tomb && !Object.keys(j.tomb).every(ok)) return false;
  if (!Array.isArray(j.courseIds) || !j.courseIds.every(isCourseId)) return false;
  /* DESTINATIONS + PURGE must stay inside the migration's own namespaces (review
     CSID-REVIEW-03), so a tampered/corrupt journal can never write the course
     index or delete unrelated data on replay. A layout dest is v3:master:lay:<id>
     for a valid id; a purge entry is a known LEGACY source key and disjoint from
     every destination. */
  const layPre = SYL_NS + ':lay:';
  const destKeys = new Set([kSyls(), kSylOrder(), kSylHidden(), kSylTomb(), kSylCat()]);
  if (j.layouts && typeof j.layouts === 'object') {
    for (const dk of Object.keys(j.layouts)) { if (!(typeof dk === 'string' && dk.startsWith(layPre) && ok(dk.slice(layPre.length)))) return false; destKeys.add(dk); }
  } else if (j.layouts != null) return false;
  const legalPurge = pk => typeof pk === 'string' && !destKeys.has(pk) && (
    pk === kSylsOldMaster() || pk === kSylAliasLegacy || pk.startsWith(layPre) ||          /* old master lay + retired alias pref */
    pk.startsWith('v3:lay:') ||                                                            /* legacy own/old-master layout keys */
    /^v3:c[0-9a-z]+:syls?$/.test(pk));                                                     /* per-course legacy def stores */
  if (Array.isArray(j.purge)) { if (!j.purge.every(legalPurge)) return false; } else if (j.purge != null) return false;
  return true;
}
export async function migrateSylIds() {
  try {
    if ((await sGet(kSylCatMig)) && (await sGet(kSylReset))) return true;
    let journal = null;
    const jraw = await sGet(kSylIdJournal);
    if (jraw) {
      try { journal = JSON.parse(jraw); } catch (_) { journal = null; }
      /* a partial KEEP has already re-keyed some stores, so REDISCOVERY would
         mis-read id-keyed data as names — a bad existing journal FAILS CLOSED,
         it is never rebuilt (review CSID-03). */
      if (!journal || !validSylJournal(journal)) { setBootError('The Tracker could not finish upgrading your syllabus data (the saved upgrade record was unreadable). Reload to try again.'); return false; }
    }
    if (!journal) {
      journal = await buildSylJournal();
      if (!journal) return false;                 // buildSylJournal set bootError, or a read failure
      const jstr = JSON.stringify(journal);
      await sSet(kSylIdJournal, jstr);
      if ((await sGet(kSylIdJournal)) !== jstr) return false;   // durable BEFORE any mutation
    }
    /* Read-back BOTH flags before retiring the journal (review CSID-01): sSet
       swallows a failed write, so a stamped-but-unwritten flag with the journal
       deleted would send the next boot into rediscovery over converted data.
       The replay is idempotent, so keeping the journal on any miss is safe. */
    if (!(await sGet(kSylCatMig))) { if (!(await applyKeepJournal(journal))) return false; await sSet(kSylCatMig, '1'); if ((await sGet(kSylCatMig)) !== '1') return false; }
    if (!(await sGet(kSylReset))) { if (!(await applyResetJournal(journal))) return false; await sSet(kSylReset, '1'); if ((await sGet(kSylReset)) !== '1') return false; }
    await delKey(kSylIdJournal);
    return true;
  } catch (err) {
    try { setBootError('The Tracker could not finish upgrading your syllabus data. Reload to try again.'); } catch (_) {}
    return false;
  }
}
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
  const all = await storeSylIds(c);
  const ranked = orderedSylIds().filter(n => all.includes(n));
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
  /* The grading pop-up belongs to one event on the chart that is going away. A
     press on the dropdown closes it (the outside-click rule), but a KEYBOARD
     switch has no press — it left the pop-up up over the new chart, where its
     buttons would grade that chart's same-code ball ([HUMAN-RETEST] F13). */
  pop = null; hideDetailBubble();
  /* History belongs to the chart it was recorded on. Switching COURSE never
     went through clearDirty, so an Undo pressed afterwards stamped the old
     course's chart onto the new one's syllabus and saved it immediately. */
  undoStack = []; redoStack = [];
  const pr = await sGet(kPlan(c)); plan = sParse(pr, null, 'object') || { lulls: [], mode: 'pace', epw: 2, target: null, sylId: firstSylId() };
  if (!plan.sylId) plan.sylId = firstSylId();
  /* the id-keyed definition store is GLOBAL (v3:master:syls) — customs and
     edited-built-in overrides, both keyed by syllabus id. Reloaded here so an
     import elsewhere in the session is reflected. The legacy per-course/
     old-master def adoption and the plan.custom / SYL_RENAME / __oldSyl folds
     that used to live here are OWNED BY migrateSylIds now (§4/§5.2), which runs
     before any course opens — this path is purely id-native. */
  customDefs = sParse(await sGet(kSyls(c)), {}, 'object');
  /* Open on whatever was last marked (a syllabus id). Done before the roster and
     layout load so it costs no second pass. Only at app start; every other
     caller has already decided the syllabus. */
  const __lastS = await sGet(kLastStudent(c));
  if (__lastS && restoreLastSyllabus) {
    try {
      const rec = JSON.parse(await sGet(kLast(c, __lastS)) || 'null');
      if (rec && rec.syl && sylSource(rec.syl)) plan.sylId = rec.syl;
    } catch (_) {}
  }
  let __src = sylSource(plan.sylId);
  if (!__src) { /* the chart vanished -> fall back cleanly */
    plan.sylId = firstSylId();
    await savePlan(); __src = sylSource(plan.sylId) || DEFAULT_SYLLABUS;
  }
  /* With no charts shipped in the code and none opened yet, DEFAULT_SYLLABUS is
     undefined and JSON.parse(JSON.stringify(undefined)) throws, which aborted
     loadCourse half-way and left the app looking broken. An empty board is the
     correct state here: the user has simply not opened their file yet. */
  SYL = __src ? JSON.parse(JSON.stringify(__src)) : [];
  byid = {}; SYL.forEach(e => byid[e.id] = e);
  await migrateRosters(c);
  await migrateIds(c);
  /* ONE RETRY ON THIS SAME LOAD (legacy enrolment-id migration; a no-op once
     migrateSylIds has reset+flagged the course, which is every store). */
  if (!(await sGet(kIdMig(c)))) await migrateIds(c);
  const rr = await sGet(kRosterFor(c, plan.sylId));
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
  /* self-heal: a custom syllabus whose stored layout doesn't cover its events
     (a built-in resolves its default layout through base, so it is left alone) */
  if (SYL.length && !defaultLayoutOf(plan.sylId)) {
    const bd = bestDefaultLayout();
    if (bd && layoutNodeCount(layout) < SYL.length) {
      layout = await snapshotLayout(plan.sylId);
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
async function saveRoster() { if (rosterHeld) return; await sSet(kRosterFor(course, curSylId()), JSON.stringify(roster)); }
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
function _dlgShow(msg, { input = false, def = '', cancel = true, cancelLabel = 'Cancel', ok = 'OK', alt = null, list = null, filter = false, placeholder = '', listTitle = '' } = {}) {
  return new Promise(res => {
    _dlgRes = res;
    dlg = { msg, input, def, cancel, cancelLabel, ok, alt, list, filter, placeholder, listTitle };
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
export async function uiChoice(msg, okLabel, altLabel, cancelLabel) {
  const r = await _dlgShow(msg, { ok: okLabel, alt: altLabel, cancelLabel: cancelLabel || 'Cancel' });
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
  else { const dl = defaultLayoutOf(curSylId()) || BORROW; b = (dl && dl[id]) ? dl[id] : (AUTO[id] || { x: 60, y: 60 }); }
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

/* Continuous top-to-bottom flow following the real prerequisite graph. Takes
   any chart's events (the one on screen by default) so an export can place a
   chart that is not on screen exactly as the board would ([HUMAN-RETEST] W1-3). */
function computeFlow(evs) {
  const EV = evs || SYL; const by = {}; EV.forEach(e => { by[e.id] = e; });
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
    const e = by[id]; if (!e) return 0;
    const ps = (e.prereqs || []).filter(p => by[p]); if (!ps.length) return level[id] = 0;
    busy[id] = 1;
    let m = 0; ps.forEach(p => { m = Math.max(m, lvl(p) + 1); });
    delete busy[id];
    return level[id] = m;
  }
  EV.forEach(e => lvl(e.id));
  // place root 'feeder' events (no prereqs but feed a mid-chain node) just above what they feed
  const _kids = {}; EV.forEach(e => (e.prereqs || []).forEach(p => { if (by[p]) (_kids[p] = _kids[p] || []).push(e.id); }));
  EV.forEach(e => { if ((e.prereqs || []).filter(p => by[p]).length === 0) { const ch = _kids[e.id] || []; if (ch.length) { level[e.id] = Math.max(0, Math.min(...ch.map(c => level[c])) - 1); } } });
  const byLevel = {}; let maxL = 0;
  EV.forEach(e => { const L = level[e.id]; (byLevel[L] = byLevel[L] || []).push(e); maxL = Math.max(maxL, L); });
  const slot = {};
  Object.keys(byLevel).forEach(L => { byLevel[L].sort((a, b) => a.seq - b.seq); byLevel[L].forEach((e, i) => slot[e.id] = i); });
  const kids = {}; EV.forEach(e => (e.prereqs || []).forEach(p => { if (by[p]) (kids[p] = kids[p] || []).push(e.id); }));
  for (let pass = 0; pass < 8; pass++) {
    for (let L = 1; L <= maxL; L++) {
      const arr = byLevel[L] || [];
      arr.forEach(e => { const ps = (e.prereqs || []).filter(p => by[p]).map(p => slot[p]); e._b = ps.length ? ps.reduce((x, y) => x + y, 0) / ps.length : slot[e.id]; });
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
function applyHist(u) { SYL = JSON.parse(u.syl); byid = {}; SYL.forEach(e => byid[e.id] = e); layout = JSON.parse(u.lay); loadEdgeMeta(); selEdge = null; markDirty(); trkRestoring(() => saveLayout()); renderBoard(); renderSide(); }
async function applyMarkHist(u) {
  const s = u.who;
  marks[s] = JSON.parse(u.m);
  if (u.d == null) delete dates[s]; else dates[s] = JSON.parse(u.d);
  /* The pop-up's buttons describe a grade that just changed under it — or,
     when the picker is about to move, somebody else's. */
  if (pop) closePop();
  if (active !== s) { active = s; prefSet('lastCrew:' + course, s); refreshActive(); }
  await trkRestoring(() => saveMarks(s)); if (dates[s]) await trkRestoring(() => saveDates(s));
  /* keep the view: the person is looking at the ball they are taking back, as
     grading keeps it (R62) — a plain redraw threw the chart back to its top
     ([HUMAN-RETEST] W2-F6) */
  redrawKeepView();
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
export function renderBoard() {
  const board = document.getElementById('board');
  if (!board) return;
  BORROW = null;
  if (!defaultLayoutOf(curSylId())) BORROW = bestDefaultLayout();
  const hasPlaced = layoutNodeCount(layout) > 0;
  const f = computeFlow(); AUTO = f.pos;
  const bd = bounds(); const W = Math.max(f.W, bd.W), H = (hasPlaced || defaultLayoutOf(curSylId()) || BORROW) ? bd.H : Math.max(f.H, bd.H);
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
/* Re-fit once the chart is on screen again. A resize or a phone turned while
   the Info tab hid the chart measured a 0-wide box, so the fit was skipped —
   and nothing re-fitted when Flow came back: the chart sat at the old zoom,
   842px of it in a 390px screen, until "reset" ([HUMAN-RETEST] w3-F2). */
export function refitAfterShow() {
  if (typeof window === 'undefined' || zoomIsMine || arrangeMode) return;
  const run = () => { const svg = document.getElementById('flowSvg'); if (!svg) return; fitPhoneWidth(parseFloat(svg.getAttribute('width')) || 0); applyFlowZoom(); notify(); };
  if (typeof requestAnimationFrame !== 'undefined') requestAnimationFrame(run); else run();
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
/* The anchor maths every zoom of the flow chart shares — the + / − buttons and
   the pinch. It used to be written twice, and when the slack above arrived
   (9 Sep 26) only the buttons' copy learned about it: the pinch still treated
   the chart as starting at the board's very corner, so its anchor landed the
   board's padding plus half a view below-right of the fingers and the chart
   ran off up-left (owner, 23 Sep 26: "does not follow where my fingers open or
   close"; 807px on a phone going 40% → 133%). One body now, two callers.
   Where the chart's own top-left corner sits, in screen pixels from the board's
   outer edge with the board scrolled to 0,0: border, padding, then the slack. */
function chartOrigin(board) {
  const cs = getComputedStyle(board);
  return { x: board.clientLeft + (parseFloat(cs.paddingLeft) || 0) + boardPad.x,
           y: board.clientTop + (parseFloat(cs.paddingTop) || 0) + boardPad.y };
}
/* The chart point (unzoomed chart pixels) under a screen point given in
   pixels from the board's outer edge. */
function chartPointAt(board, sx, sy) {
  const o = chartOrigin(board);
  return { x: (board.scrollLeft + sx - o.x) / flowZoom, y: (board.scrollTop + sy - o.y) / flowZoom };
}
/* Scroll so chart point c sits under screen point (sx, sy) at the zoom now in
   force. Runs AFTER applyFlowZoom: the slack can change with the zoom (the
   sideways half exists only once the chart is wider than the board). */
function placeChartPoint(board, c, sx, sy) {
  void board.scrollWidth; /* force reflow, or the new scroll range is stale and clamps */
  const o = chartOrigin(board);
  board.scrollLeft = o.x + c.x * flowZoom - sx; board.scrollTop = o.y + c.y * flowZoom - sy;
}
/* Anchored at the middle of the current view, the same way a pinch anchors
   under the fingers. Without the scroll correction, CSS zoom rescales the whole
   page under an unchanged scroll position and the viewport lands on a different
   part of the chart. */
export function setFlowZoom(z) {
  zoomIsMine = true;
  const board = document.getElementById('board');
  if (board && !arrangeMode && flowZoom > 0) {
    const sx = board.clientLeft + board.clientWidth / 2, sy = board.clientTop + board.clientHeight / 2;
    const c = chartPointAt(board, sx, sy);
    flowZoom = z; applyFlowZoom();
    placeChartPoint(board, c, sx, sy);
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
        if (pinching) return;   /* a second finger starts nothing: it is a pinch */
        e.stopPropagation();
        const key = selEdge; pushUndo();
        const mv = ev2 => { const pt = svgPt(ev2); edgeMeta[key] = { ...(edgeMeta[key] || {}), mid: { x: Math.round(pt.x), y: Math.round(pt.y) } }; schedDragPaint(); };
        const stop = () => { window.removeEventListener('pointermove', mv); window.removeEventListener('pointerup', up); };
        const up = () => { fingerStop = null; stop(); markDirty(); saveLayout(); wireBoard(); };
        window.addEventListener('pointermove', mv); window.addEventListener('pointerup', up); fingerStop = stop;
      });
    }
    /* drag a line end onto a blue N/E/S/W point to snap / reconnect */
    document.querySelectorAll('#flowSvg .endhandle').forEach(h => {
      h.addEventListener('pointerdown', e => {
        if (pinching) return;
        e.stopPropagation(); const end = h.dataset.end;
        const mv = ev2 => { const pt = svgPt(ev2); h.setAttribute('cx', pt.x.toFixed(1)); h.setAttribute('cy', pt.y.toFixed(1)); highlightPort(pt); };
        const stop = () => { window.removeEventListener('pointermove', mv); window.removeEventListener('pointerup', up); };
        const up = ev2 => { fingerStop = null; stop(); applyEndSnap(end, svgPt(ev2)); };
        window.addEventListener('pointermove', mv); window.addEventListener('pointerup', up); fingerStop = stop;
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
        if (pinching) return;
        if (tool === 'line' && drawing) return;
        if (tool === 'delball') { e.stopPropagation(); deleteLine(h.dataset.lid); return; }
        if (tool === 'merge' || tool === 'unmerge') { e.stopPropagation(); e.preventDefault(); mergeClick(lkey(h.dataset.lid)); return; }
        if (!lineEditable()) return;
        e.stopPropagation(); selLine = h.dataset.lid; renderBoard();
      });
    });
    document.querySelectorAll('#flowSvg .lvert').forEach(h => {
      h.addEventListener('pointerdown', e => {
        if (pinching) return;
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
        const stop = () => { window.removeEventListener('pointermove', mv); window.removeEventListener('pointerup', up); };
        const up = () => {
          fingerStop = null; stop();
          if (moved) { pushUndo(); markDirty(); saveLayout(); } renderBoard();
        };
        window.addEventListener('pointermove', mv); window.addEventListener('pointerup', up); fingerStop = stop;
      });
    });
    document.querySelectorAll('#flowSvg .lend').forEach(h => {
      h.addEventListener('pointerdown', e => {
        if (pinching) return;
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
        const stop = () => { window.removeEventListener('pointermove', mv); window.removeEventListener('pointerup', up); };
        const up = ev2 => {
          fingerStop = null; stop();
          pushUndo();
          const pt = svgPt(ev2), sn = snapAnchor(pt, id);
          const dst = sn ? { x: sn.x, y: sn.y } : pt;
          L.pts = endDragRebuild(base, first, o, dst);
          L[key] = sn ? sn.an : null;
          const made = deriveLineLinks();
          markDirty(); saveLayout(); renderBoard(); renderSide();
          flashHint(made.length ? ('Linked ' + made.join(', ')) : (sn ? 'End connected.' : 'End left loose — nothing linked yet.'));
        };
        window.addEventListener('pointermove', mv); window.addEventListener('pointerup', up); fingerStop = stop;
      });
    });
  } else {
    svg.addEventListener('pointerdown', e => { if (!e.target.closest('.ball')) hideDetailBubble(); });
  }
  if (arrangeMode) {
    /* arrange: pan the viewport transform, wheel to zoom */
    svg.addEventListener('pointerdown', e => {
      if (pinching) return;   /* the second finger of a pinch: no pan, no box, no line end */
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
      if (pinching) { pan = null; return; }   /* pinching fingers neither pan nor steer a half-drawn line */
      if (tool === 'line' && drawing) {
        const cp = svgPt(e); const c0 = drawing.pts[0];
        if (Math.abs(cp.x - c0.x) < 12) cp.x = c0.x; else if (Math.abs(cp.y - c0.y) < 12) cp.y = c0.y;
        drawing.cur = cp; refreshPreview(); highlightPort(cp); return;
      }
      if (!pan) return;
      view.x = pan.vx + (e.clientX - pan.x0); view.y = pan.vy + (e.clientY - pan.y0); schedView();
    });
    const endPan = () => { if (pan) flushView(); pan = null; svg.style.cursor = 'grab'; perfOff(); };
    svg.addEventListener('pointerup', endPan); svg.addEventListener('pointercancel', endPan);
    svg.addEventListener('dblclick', e => { if (tool === 'line' && drawing) { e.preventDefault(); e.stopPropagation(); finishLine(drawing.pts.length >= 2); } });
    svg.style.cursor = 'grab';
    svg.addEventListener('wheel', e => {
      e.preventDefault();
      const o = canvasOrigin(), mx = e.clientX - o.x, my = e.clientY - o.y;
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
/* Where Edit chart layout's canvas starts on screen: the SVG's own box, inside
   its border. The view transform (view.x / view.y) is measured from here. The
   wheel always measured from the SVG; the pinch measured from the board, a
   padding and a border away, so its anchor missed by that much times the zoom
   change (180px on a phone). */
function canvasOrigin() {
  const svg = document.getElementById('flowSvg'); if (!svg) return { x: 0, y: 0 };
  const r = svg.getBoundingClientRect(), cs = getComputedStyle(svg);
  return { x: r.left + (parseFloat(cs.borderLeftWidth) || 0), y: r.top + (parseFloat(cs.borderTopWidth) || 0) };
}
/* Edit chart layout's twin of chartPointAt / placeChartPoint: its canvas pans
   and zooms by `view` instead of by scrolling. Points in client pixels; `o` is
   canvasOrigin(), passed in when the caller already holds it. */
function canvasPointAt(cx, cy, o = canvasOrigin()) { return { x: (cx - o.x - view.x) / view.k, y: (cy - o.y - view.y) / view.k }; }
function placeCanvasPoint(c, cx, cy, o = canvasOrigin()) { view.x = cx - o.x - c.x * view.k; view.y = cy - o.y - c.y * view.k; }

/* [TRK-PINCH-DRAGS-BALL] (23 Sep 26) — a pinch starts with ONE finger, and in
   Edit chart layout one finger acts the moment it lands: it picks a ball (or a
   selected group) up and moves it, starts a selection box, starts or finishes a
   drawn line, grabs a line's handle, and with Delete or Merge acts on a drawn
   line on the spot. So every pinch that began on a ball dragged it — the ball
   moved, an undo step appeared and the move saved itself (F-B of
   docs/handpass/2026-09-23-tracker-pinch.md). The second finger says the person
   meant to zoom, so it takes all of that back: the chart, its stored layout,
   both undo lists, ✓ Save changes, the selection and a half-drawn line return
   to how they were the moment the first finger landed. A pan is not taken back
   — it changes nothing, and the zoom anchors on the view it left. Walked:
   docs/handpass/2026-09-23-tracker-pinch-ball.md.
   `firstFinger` is that moment; `fingerStop` ends the gesture the first finger
   started (its listeners and in-flight state) — each such gesture sets it when
   it begins and clears it when it ends. The only store write a first finger can
   make here is the chart's layout (a drag saves on its drop, which the pinch
   stops; Delete, Merge and a finished line save at once), so that one key is
   put back — deleted again if it was not stored before. */
let firstFinger = null, fingerStop = null;
function holdFirstFinger() {
  const k = kLayout();
  firstFinger = { syl: JSON.stringify(SYL), lay: JSON.stringify(layout), key: k, had: k in mem, stored: mem[k],
    undo: undoStack.slice(), redo: redoStack.slice(), dirty: sylDirty,
    sel: [...selBalls].join('\u0000'), selLine, selEdge, mergeFirst, connectSrc, drawing: drawing ? JSON.stringify(drawing) : null };
}
function takeBackFirstFinger() {
  const f = firstFinger, stop = fingerStop; firstFinger = null; fingerStop = null;
  if (stop) stop();
  pan = null;
  if (!f) return;
  const same = JSON.stringify(SYL) === f.syl && JSON.stringify(layout) === f.lay && sylDirty === f.dirty
    && undoStack.length === f.undo.length && undoStack[undoStack.length - 1] === f.undo[f.undo.length - 1]
    && redoStack.length === f.redo.length && redoStack[redoStack.length - 1] === f.redo[f.redo.length - 1]
    && [...selBalls].join('\u0000') === f.sel && selLine === f.selLine && selEdge === f.selEdge
    && mergeFirst === f.mergeFirst && connectSrc === f.connectSrc && (drawing ? JSON.stringify(drawing) : null) === f.drawing;
  if (!same) {
    /* the chart the way the Tracker's own undo restores one (applyHist) */
    const sylChanged = JSON.stringify(SYL) !== f.syl;
    SYL = JSON.parse(f.syl); byid = {}; SYL.forEach(e => byid[e.id] = e);
    layout = JSON.parse(f.lay); loadEdgeMeta();
    undoStack = f.undo; redoStack = f.redo; sylDirty = f.dirty;
    selBalls = new Set(f.sel ? f.sel.split('\u0000') : []); selLine = f.selLine; selEdge = f.selEdge;
    mergeFirst = f.mergeFirst; connectSrc = f.connectSrc; drawing = f.drawing ? JSON.parse(f.drawing) : null;
    alignGuides = []; hintFlash = null;
    /* a restore, not a new edit: off the command stream, like applyHist's save */
    if ((f.key in mem) !== f.had || mem[f.key] !== f.stored)
      trkRestoring(() => { if (f.had) sSet(f.key, f.stored); else delKey(f.key); });
    renderBoard(); if (sylChanged) renderSide();
  } else if (stop) renderBoard();   /* a handle or a box moved on screen only */
}

/* Two-finger pinch zoom on the flow chart. The chart point under the fingers
   when the second one lands stays under their midpoint for the whole gesture
   — so fingers that drift or slide while pinching carry the chart with them,
   the way a map does, instead of zooming about the spot they started on.
   The fingers are counted in the CAPTURE phase, so the pinch sees the second
   finger before that finger's own ball, line or canvas handler runs — those
   start nothing while `pinching` is on — and sees every finger even where a
   handler stops the event (the Line tool and the line handles do). */
let pinching = false;
function enablePinchZoom(el) {
  if (!el || el.__pinch) return; el.__pinch = true;
  const pts = new Map(); let start = null;
  const dist = a => Math.hypot(a[0].x - a[1].x, a[0].y - a[1].y);
  const mid = a => ({ x: (a[0].x + a[1].x) / 2, y: (a[0].y + a[1].y) / 2 });
  el.addEventListener('pointerdown', e => {
    if (e.pointerType === 'mouse') return;
    pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pts.size === 1 && arrangeMode) holdFirstFinger();
    if (pts.size === 2) {
      const a = [...pts.values()], m = mid(a);
      pinching = true;
      if (arrangeMode) takeBackFirstFinger();   /* may redraw the board, so before perfOn marks it */
      perfOn();
      start = { d: dist(a) || 1, k: view.k, z: flowZoom };
      if (arrangeMode) {
        start.o = canvasOrigin();
        start.p = canvasPointAt(m.x, m.y, start.o);
      } else {
        start.r = el.getBoundingClientRect();
        start.c = chartPointAt(el, m.x - start.r.left, m.y - start.r.top);
      }
    }
  }, { capture: true, passive: false });
  el.addEventListener('pointermove', e => {
    if (!pts.has(e.pointerId)) return;
    pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pts.size !== 2 || !start) return;
    e.preventDefault();
    const a = [...pts.values()], m = mid(a);
    const f = (dist(a) || 1) / start.d;
    if (arrangeMode) {
      view.k = Math.min(4, Math.max(0.1, start.k * f));
      placeCanvasPoint(start.p, m.x, m.y, start.o);
      schedView();
    } else {
      flowZoom = Math.min(3, Math.max(0.1, +(start.z * f).toFixed(3))); applyFlowZoom();
      placeChartPoint(el, start.c, m.x - start.r.left, m.y - start.r.top);
    }
  }, { capture: true, passive: false });
  const drop = e => {
    if (!pts.delete(e.pointerId)) return;   /* not a finger this board is counting */
    if (!pts.size) firstFinger = null;
    if (pts.size < 2) {
      start = null;
      /* A pinch is the user taking the zoom over, the same as pressing + or −:
         without the flag a rotate afterwards snapped their zoom back to fit. */
      if (pinching) { pinching = false; if (!arrangeMode) zoomIsMine = true; flushView(); perfOff(); notify(); }
    }
  };
  /* pointerleave stays a plain listener: it does not bubble, so in the capture
     phase it would fire for every ball a finger slides off, mid-pinch. It also
     drops a finger whose target the take-back redrew away and that then lifts off
     the board (walked: E18 of docs/handpass/2026-09-23-tracker-pinch-ball.md; a
     window-level lift listener was tried and no check needed it — break test B8). */
  el.addEventListener('pointerup', drop, true); el.addEventListener('pointercancel', drop, true); el.addEventListener('pointerleave', drop);
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
  /* A code deleted from this chart and not saved yet still has its marks filed
     (they go at ✓ Save changes — D124). A new ball given it now would come up
     graded with the deleted ball's marks, so it waits for the save. */
  if ((sylSource(curSylId()) || []).some(e => e && e.id === id)) {
    await uiAlert('“' + id + '” was deleted from this chart and that is not saved yet. Press ✓ Save changes first (its marks are removed then), or Undo to bring it back.');
    return;
  }
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
  fingerStop = () => { svg.removeEventListener('pointermove', mv); svg.removeEventListener('pointerup', up); marquee = null; const gl = document.getElementById('bandLayer'); if (gl) gl.innerHTML = ''; };
  const mv = ev => {
    const p = svgPt(ev); const x = Math.min(marquee.x0, p.x), y = Math.min(marquee.y0, p.y), w = Math.abs(p.x - marquee.x0), h = Math.abs(p.y - marquee.y0); marquee.rect = { x, y, w, h };
    const gl = document.getElementById('bandLayer'); if (gl) gl.innerHTML = `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="rgba(54,194,255,0.12)" stroke="#36c2ff" stroke-width="0.8" stroke-dasharray="4 3"/>`;
  };
  const up = () => {
    fingerStop = null;
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
  fingerStop = () => { g.removeEventListener('pointermove', onGroupDrag); g.removeEventListener('pointerup', endGroupDrag); g.removeEventListener('pointercancel', endGroupDrag); groupDrag = null; perfOff(); };
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
  if (!groupDrag) return; const g = ev.currentTarget; fingerStop = null;
  g.removeEventListener('pointermove', onGroupDrag); g.removeEventListener('pointerup', endGroupDrag); g.removeEventListener('pointercancel', endGroupDrag);
  const moved = groupDrag.moved; groupDrag = null; flushDragPaint(); perfOff(); if (moved) { saveLayout(); renderBoard(); }
}
function startDrag(ev) {
  if (!arrangeMode || pinching) return; if (tool === 'select') { startGroupDrag(ev); return; } if (tool !== 'move') return;
  ev.preventDefault(); const g = ev.currentTarget, id = g.dataset.id, p = svgPt(ev), cur = nodePos(id);
  drag = { id, g, dx: p.x - cur.x, dy: p.y - cur.y, moved: false, snap: { syl: JSON.stringify(SYL), lay: JSON.stringify(layout) }, pushed: false }; perfOn(); try { g.setPointerCapture(ev.pointerId); } catch (e) {}
  g.addEventListener('pointermove', onDrag); g.addEventListener('pointerup', endDrag); g.addEventListener('pointercancel', endDrag);
  fingerStop = () => { g.removeEventListener('pointermove', onDrag); g.removeEventListener('pointerup', endDrag); g.removeEventListener('pointercancel', endDrag); drag = null; alignGuides = []; perfOff(); };
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
  if (!drag) return; const g = drag.g; fingerStop = null;
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
  /* crew + prereq note are event-info overrides: merge, don't clobber name/fmt/hrs.
     Written through writeInfo, the details window's own body: this box is
     pre-filled from the chart ON SCREEN, so on a renumbered syllabus (Tx) its
     untouched fields are that syllabus's profile, and diffing them against the
     global base stored the profile as a global override — one text-only edit of
     BFM-3 on Tx rewrote 2026's BFM-3 crew line ([HUMAN-RETEST] F5, 23 Sep 26;
     the details window was fixed for exactly this on SA-5, this box was not). */
  {
    const cur = infoFor(editId);
    writeInfo(editId, { name: cur.name || '', fmt: cur.fmt || '', hrs: cur.hrs || '',
      crew: vals.crew.trim(), pre: vals.pre.trim() });
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
/* A day typed by hand stands until a later flight moves it (D123) — the hand
   marks say so; an emptied box stands for nothing. */
export async function setLastSyll(s, v) {
  pushMarkUndo(s, 'Last Flown (Syllabus)', 'lastSyll');
  const d = dates[s]; d.lastSyll = v; d.lastCurr = v;
  if (v) { d.handSyll = true; d.handCurr = true; } else { delete d.handSyll; delete d.handCurr; }
  stamp(d); await saveDates(s); renderSide();
}
export async function setLastCurr(s, v) {
  pushMarkUndo(s, 'Last Flown (Currency)', 'lastCurr');
  const d = dates[s]; d.lastCurr = v;
  if (v) d.handCurr = true; else delete d.handCurr;
  stamp(d); await saveDates(s); renderSide();
}
export async function setDownDays(s, v) { pushMarkUndo(s, 'the down days', 'downDays'); dates[s].downDays = v; stamp(dates[s]); await saveDates(s); renderSide(); }
export async function setUpchit(s, v) { pushMarkUndo(s, 'the upchit date', 'upchit'); dates[s].upchit = v; stamp(dates[s]); await saveDates(s); renderSide(); }
/* v is kept verbatim — an empty or half-typed box must stay as typed. epwOf()
   does the coercion for the arithmetic. */
export async function setEpw(s, v) { pace[s] = { ...paceOf(s), epw: v }; await savePace(s); renderSide(); }
export async function setTarget(s, v) { pace[s] = { ...paceOf(s), target: v }; await savePace(s); renderSide(); }
export async function setTarget2(s, v) { pace[s] = { ...paceOf(s), target2: v }; await savePace(s); renderSide(); }
/* Asks first: adding a period takes two deliberate clicks, and removing one
   took one stray tap on its ×, with no undo — lull periods are not in the
   history ([HUMAN-RETEST] W2-F4). */
export async function removeLull(s, i) {
  const l = (lulls[s] || [])[i]; if (!l) return;
  if (!await uiConfirm('Remove ' + nameOf(s) + '’s lull period ' + fmt(parseD(l.start)) + ' → ' + fmt(parseD(l.end)) + '?')) return;
  const now = lulls[s] || []; const at = now.indexOf(l); if (at < 0) return;
  now.splice(at, 1); await saveLulls(s); renderSide();
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
/* the tick-list's "select all" row — the approved 7 Aug design promised it
   ([HUMAN-RETEST] W2-F5; R53) */
export function setLullCopyAll(on) {
  if (!lullCopy) return;
  lullCopy = { ...lullCopy, picked: on ? roster.map(r => r.id).filter(id => id !== lullCopy.from) : [] }; notify();
}
export async function applyLullCopy() {
  if (!lullCopy) return;
  const src = (lulls[lullCopy.from] || []).map(l => ({ start: l.start, end: l.end }));
  const picked = lullCopy.picked;
  // [CMDL-FINISH] §4 (Class B, R3-002) — copying the lull periods to every picked
  // student is ONE gesture = ONE envelope, not one save per student.
  trkGesture(() => { for (const s of picked) { lulls[s] = src.map(l => ({ ...l })); saveLulls(s); } });
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
     of a name, not of a circle. The centre names the COURSE: `course` has been
     the course's hidden id since 13 Sep 26 (course ids), and this line kept
     printing it — a code like "cmudq0…" in the middle of the Students card
     ([HUMAN-RETEST] F1, 23 Sep 26). */
  return `<div style="text-align:center;margin-top:6px"><svg viewBox="-95 6 340 140" width="340" height="140" style="max-width:100%;height:auto">
  ${segs}<circle cx="${cx}" cy="${cy}" r="${rI}" fill="#f6c21a" stroke="#0007"/>
  <text x="${cx}" y="${cy + 4}" text-anchor="middle" font-size="11" font-weight="700">${escapeId(curCourseName())}</text>${labels}</svg></div>`;
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
  /* Nobody on this chart, nobody to grade: say so rather than open a pop-up
     titled "ST-01 ·" whose every grade, counter and date box does nothing
     ([HUMAN-RETEST] F9, 23 Sep 26). The Students card beside it already offers
     + Add. */
  if (!active) { flashHint('No students on this chart yet — add one with + Add in the Students card to start marking. Event details: ☰ Show All → Edit.'); return; }
  openPop(id, ev);
}

/* ---------- where each student was last marking ---------- */
/* [CMDL-FINISH] §4 — no longer async: called inside popGrade's gesture reducer,
   so both writes must land SYNCHRONOUSLY (an await between them would sequence the
   second into a microtask that escapes the gesture's envelope). sSet's mem write
   is synchronous; its storage goes through the gesture's deferred flush. Only
   popGrade calls this. */
function noteLastEdit(s, id) {
  if (!s || !id) return;
  lastEdit[s] = { syl: curSyl(), event: id };
  sSet(kLast(course, s), JSON.stringify(lastEdit[s]));
  sSet(kLastStudent(course), s);
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
  /* [CMDL-FINISH] §4 (Class A) — the whole grade (last-edit note, the mark, and a
     flight's Last-Flown) is ONE gesture = ONE envelope. No reads to hoist; every
     write's mem mutation is synchronous inside the reducer, storage deferred. */
  trkGesture(() => {
    pushMarkUndo(s, 'the mark on ' + popId);
    noteLastEdit(s, popId);
    marks[s] = marks[s] || {};
    const m = marks[s][popId] = marks[s][popId] || { g: 0, f: 0 }; m.g = v === '0' ? 0 : v;
    /* A grade that means "accomplished" is dated the day it is pressed (the box
       in the pop-up, today unless changed first); Not done and N.A. carry no
       day, so the date goes with the grade. */
    /* a year still being typed (0002…) is not a day: today, as for an empty box
       (the two code reads, Fable F-E) */
    if (DONE.has(v)) m.d = isWholeDay(popDoneDate) ? popDoneDate : isoToday(); else delete m.d;
    stamp(m);
    saveMarks(s);
    /* any change to a flight's grade — done, taken back, N.A. — can move Last
       Flown, up or down (D123) */
    if (byid[popId] && byid[popId].type === 'flight') settleLastFlown(s);
  });
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
  trkGesture(() => {   // [CMDL-FINISH] §4 (Class A) — the count + day list as ONE envelope
    pushMarkUndo(s, 'the failure count on ' + popId);
    /* + records a failure on the pop-up's failure day; − takes the LATEST one
       back. The count and the list of days are kept in step. */
    const fd = failDates(s, popId);
    for (let k = 0; k < delta; k++) fd.push(popFailDate || isoToday());
    for (let k = 0; k < -delta && fd.length; k++) fd.pop();
    m.f = fd.length; m.fd = fd;
    stamp(m);
    saveMarks(s);
  });
  redrawKeepView();
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
  /* While a day is retyped, the date box passes through EMPTY (after the "0"
     of "09" it holds no full date) and through half-typed years (0002, 0020,
     0202…). An empty box used to re-date the flight to TODAY for that instant,
     and Last Flown followed ([HUMAN-RETEST] W2-F2). Only a whole, real day
     re-dates a mark; a grade pressed on an empty box still takes today. */
  if (!isWholeDay(v)) return;
  if (!popId || !s || !DONE.has(gradeOf(s, popId))) return;
  await setDoneDate(s, popId, v);
}
/* a yyyy-mm-dd a person could mean — not blank, not a year still being typed */
function isWholeDay(v) { return typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v) && v >= '1900-01-01'; }
export async function setDoneDate(s, id, iso) {
  if (!s || !marks[s] || !marks[s][id] || !DONE.has(gradeOf(s, id))) return;
  trkGesture(() => {   // [CMDL-FINISH] §4 (Class A) — re-date + a flight's Last-Flown as ONE envelope
    pushMarkUndo(s, 'the date on ' + id, 'doneDate:' + id);
    marks[s][id].d = iso || isoToday();
    stamp(marks[s][id]);
    saveMarks(s); renderSide();
    if (byid[id] && byid[id].type === 'flight') settleLastFlown(s);
  });
}
/* Re-date ONE failure — the i-th (oldest first) on an event — from the full
   lowdown. An emptied box leaves the failure undated, not deleted. */
export async function setFailDate(s, id, i, iso) {
  if (!s || !marks[s] || !marks[s][id]) return;
  const fd = failDates(s, id); if (i < 0 || i >= fd.length) return;
  trkGesture(() => {   // [CMDL-FINISH] §4 (Class A)
    pushMarkUndo(s, 'the date of ' + failLabel(id, i), 'failDate:' + id + ':' + i);
    fd[i] = iso || null; marks[s][id].fd = fd;
    stamp(marks[s][id]);
    saveMarks(s); renderSide();
  });
}
/* The full lowdown of one student's failures, opened from the Failures title
   on the side panel (owner, 9 Sep 26: "if the user clicks on the title
   'failures' then it will show a full lowdown of all failures with a date").
   Holds the student it opened for; the rows read the live marks. */
export let failLog = null;   /* the student, while the list is up */
export function openFailLog(s) { if (!s) return; failLog = s; notify(); }
export function closeFailLog() { failLog = null; notify(); }
/* LAST FLOWN IS THE LATEST DAY ACTUALLY FLOWN (owner, 23 Sep 26 — D123): worked
   out from the flights marked done, whatever order they were entered in. So an
   older sortie recorded after a newer one never drags it back (the 2 Sep rule,
   "the most recent flight always wins"), AND correcting a flight to an earlier
   day, or taking it back, pulls it back to the latest flight still flown — the
   old forward-only ratchet could not come back down, even from a future day
   ([HUMAN-RETEST] W2-F3). A day TYPED into either box by hand stands until a
   later flight moves it, as before (D123 leaves that as it is): `handSyll` /
   `handCurr` mark a typed day, and a flight that reaches it takes over. */
function latestFlown(m, isFlight) {
  let best = null;
  for (const id of Object.keys(m || {})) {
    const r = m[id];
    if (!r || !DONE.has(r.g) || !isWholeDay(r.d) || !isFlight(id)) continue;
    if (!best || r.d > best) best = r.d;
  }
  return best;
}
/* the dates record after a change to the flights: pure, so the ball-delete
   sweep (D124) can settle a course that is not on screen the same way */
function settledDates(d0, flown) {
  const d = Object.assign({ lastSyll: null, lastCurr: null }, d0 || {});
  const keep = (cur, hand) => !!(hand && cur && (!flown || cur > flown));
  const hs = keep(d.lastSyll, d.handSyll), hc = keep(d.lastCurr, d.handCurr);
  d.lastSyll = hs ? d.lastSyll : flown; d.lastCurr = hc ? d.lastCurr : flown;
  if (hs) d.handSyll = true; else delete d.handSyll;
  if (hc) d.handCurr = true; else delete d.handCurr;
  return d;
}
function settleLastFlown(s) {
  const was = dates[s] || { lastSyll: null, lastCurr: null };
  const d = settledDates(was, latestFlown(marks[s], id => !!(byid[id] && byid[id].type === 'flight')));
  if ((d.lastSyll || null) === (was.lastSyll || null) && (d.lastCurr || null) === (was.lastCurr || null)
    && !!d.handSyll === !!was.handSyll && !!d.handCurr === !!was.handCurr) return;
  dates[s] = d; stamp(d); saveDates(s); renderSide();
}
/* Exported: the bubble is ONE element on the page body, so it outlived the
   chart that raised it — over the phone's Info tab, over the Leave War grid,
   and (behind the sign-in card) over the next person's first page. App.jsx
   hides it when the phone switches half and when the Tracker tab goes off
   screen; the session end hides it at a logout ([HUMAN-RETEST] w3-F1). */
export function hideDetailBubble() { const b = document.getElementById('detailBubble'); if (b) b.style.display = 'none'; }
function showDetailBubble(id, anchorEl, html) {
  let b = document.getElementById('detailBubble');
  if (!b) { b = document.createElement('div'); b.id = 'detailBubble'; document.body.appendChild(b); }
  /* The event's details, then the selected student's own record on it (grade,
     the day, each failure's day) — so the bubble answers for the person the
     chart is showing, not only for the event. */
  b.innerHTML = html != null ? html : `<div class="dbId">${escapeId(id)}</div>${infoHtml(id, 'bubble')}${markHtml(active, id)}`;
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
  writeInfo(id, { name: t(vals.name), fmt: t(vals.fmt), hrs: t(vals.hrs), crew: t(vals.crew), pre: t(vals.pre) });
  /* Event details save themselves to the store like a mark does — no button to
     press (they used to also flag the user's file unsaved; gone 9 Sep 26). */
  await saveEventInfo(); renderBoard(); renderSide();
}
/* THE one body that turns what an editor holds into the stored override — used
   by the details window (saveInfoFor), Show All's editor and the chart editor's
   ball box (saveEdit), so they can never drift apart again ([HUMAN-RETEST] F5).
   It writes to the chart ON SCREEN only (D126), comparing against what that
   chart shipped with — the base plus its own profile — so an untouched field is
   never stored, and nothing typed here reaches another chart. */
function writeInfo(id, o) {
  const sid = curSylId();
  const d = diffDetails(shippedFor(sid, id), o);
  const blk = Object.assign({}, eventInfo[sid] || {});
  if (d) blk[id] = d; else delete blk[id];
  if (Object.keys(blk).length) eventInfo[sid] = blk; else delete eventInfo[sid];
}
/* Drop what was typed on this chart for one event (the chart reads its doc
   again). The editors' "Reset to doc" no longer calls this — it refills the
   boxes and Save decides ([HUMAN-RETEST] w3-F4: it used to save on the press,
   so the window's Cancel beside it cancelled nothing). */
export async function resetInfoFor(id) {
  if (!id) return;
  writeInfo(id, docInfoFor(id)); await saveEventInfo(); renderBoard(); notify();
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
  for (const n of await storeSylIds(course)) {
    const r = (n === curSylId()) ? roster : sParse(await sGet(kRosterFor(course, n)), [], 'array').filter(isEntry);
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
    const isNew = !r;
    /* [CMDL-FINISH] §4 (Class B) — HOIST the reused-enrolment reads (an enrolment
       REUSED from another chart of this course already has a pace and lull periods,
       both hanging off the course not the syllabus — loadStudent only fills those
       for the roster it loaded) BEFORE the sync gesture, so the mem they mirror is
       in the gesture's before-image. Then the roster/marks/dates writes are ONE
       envelope. */
    let paceRead = null, lullsRead = null;
    if (isNew) {
      r = src ? { id: src.id, name: src.name } : { id: mintId(), name: v };
      const pid = (src && src.pid) || link; if (pid) r.pid = pid;
      if (src) { paceRead = await sGet(kPace(course, r.id)); lullsRead = await sGet(kLulls(course, r.id)); }
    }
    trkGesture(() => {
      if (isNew) {
        roster.push(r); marks[r.id] = {}; dates[r.id] = { lastSyll: null, lastCurr: null };
        if (paceRead) { try { pace[r.id] = JSON.parse(paceRead); } catch (_) {} }
        if (lullsRead) { try { lulls[r.id] = JSON.parse(lullsRead); } catch (_) {} }
        saveRoster(); saveMarks(r.id); saveDates(r.id);
      } else if (link && !r.pid) { r.pid = link; saveRoster(); }
      active = r.id; refreshActive(); renderBoard(); renderSide();
    });
  });
}
export async function removeStudent(v) {
  if (rosterHeld) { await uiAlert(HELD_MSG); return; }
  if (!await uiConfirm('Remove ' + nameOf(v) + ' from ' + curSylName() + '?\n\nTheir marks, dates, pace and lull periods on this syllabus are deleted.')) return;
  await onChain(() => removeStudentNow(v));
}
async function removeStudentNow(v) {
  const c = course, syl = curSylId();
  /* [CMDL-FINISH] §4 (Class C) — HOIST every async read BEFORE the gesture: the
     other syllabi's rosters that decide whether this person's course-level pace
     and lull periods are still needed elsewhere, and the last-marked pointer.
     Then the removal and all its deletes are ONE synchronous envelope. */
  let elsewhere = false;
  for (const sn of await storeSylIds(c)) {
    if (sn === syl) continue;
    const rr = await sGet(kRosterFor(c, sn));
    if (sParse(rr, [], 'array').some(x => isEntry(x) && x.id === v)) { elsewhere = true; break; }
  }
  const wasLastStudent = (await sGet(kLastStudent(c))) === v;
  trkGesture(() => {
    roster = roster.filter(x => x.id !== v); delete marks[v]; delete dates[v];
    /* Their undo steps go with them: an Undo that brought a removed student's
       mark back would put a mark on nobody's chart. */
    undoStack = undoStack.filter(e => e.who !== v); redoStack = redoStack.filter(e => e.who !== v);
    saveRoster();
    /* Deleting the roster entry alone left their name and every mark sitting in
       storage — and on a shared tracker, in the file the whole team reads. Worse,
       adding the same callsign back handed them the old pace and lull periods
       while the marks started clean, which is the most confusing outcome of all. */
    delKey(kMarksFor(c, syl, v));
    delKey(kDatesFor(c, syl, v));
    delKey(kDatesOld(c, v));
    delKey(kLast(c, v));
    /* Pace and lulls belong to the course; only drop them once this person is
       off every syllabus in it, or removing them from one chart would wipe the
       pacing they still need on another. */
    if (!elsewhere) { delKey(kPace(c, v)); delKey(kLulls(c, v)); delete pace[v]; delete lulls[v]; }
    if (wasLastStudent) delKey(kLastStudent(c));
    if (prefGet('lastCrew:' + c) === v) prefSet('lastCrew:' + c, '');
    if (active === v) active = roster[0] ? roster[0].id : null;
    refreshActive(); renderBoard(); renderSide();
  });
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
    /* [CMDL-FINISH] §4 (Class C) — HOIST the other syllabi's stored rosters (read
       across the whole course, the SAME breadth findEnrolment used for the clash
       check above) BEFORE the gesture, so relabelling every roster the id sits on
       lands as ONE envelope. */
    const c = course, syl = curSylId();
    const otherSyls = (await storeSylIds(c)).filter(sn => sn !== syl);
    const otherRosters = new Map();
    for (const sn of otherSyls) otherRosters.set(sn, sParse(await sGet(kRosterFor(c, sn)), [], 'array'));
    trkGesture(() => {
      /* The name is the enrolment's ONE label, and findEnrolment relies on every
         chart of the course agreeing on it (a person can sit on several syllabi
         under the same id). So set it on every roster the id appears in — the
         live roster here plus each other syllabus's stored one — not just the
         visible chart. No per-student record moves: they are keyed by the id. */
      let hit = false;
      const r = roster.find(x => x.id === id); if (r) { r.name = v; hit = true; saveRoster(); }
      for (const sn of otherSyls) {
        const rr = otherRosters.get(sn);
        let changed = false;
        for (const e of rr) { if (isEntry(e) && e.id === id && e.name !== v) { e.name = v; changed = true; } }
        if (changed) { sSet(kRosterFor(c, sn), JSON.stringify(rr)); hit = true; }
      }
      if (hit) { refreshActive(); renderBoard(); renderSide(); }
    });
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

/* ---- syllabus display order (ids since 1B-ii) ---- */
const kSylOrder = () => SYL_NS + ':sylorder';
const kSylCat = () => SYL_NS + ':sylcat';
/* default order = the shipped built-ins in their DEFAULT_SYL_ORDER, as ids */
const DEFAULT_SYL_ID_ORDER = DEFAULT_SYL_ORDER.map(builtinIdByName).filter(Boolean);
export let SYL_ORDER = DEFAULT_SYL_ID_ORDER.slice();
async function loadSylOrder() { try { const r = await sGet(kSylOrder()); const a = r ? JSON.parse(r) : null; SYL_ORDER = (Array.isArray(a) && a.length) ? a.filter(isSylId) : DEFAULT_SYL_ID_ORDER.slice(); } catch (e) { SYL_ORDER = DEFAULT_SYL_ID_ORDER.slice(); } if (!SYL_ORDER.length) SYL_ORDER = DEFAULT_SYL_ID_ORDER.slice(); }
async function saveSylOrder() { await sSet(kSylOrder(), JSON.stringify(SYL_ORDER)); }
const kSylHidden = () => SYL_NS + ':sylhidden';
const kSylTomb = () => SYL_NS + ':syltomb';
async function loadSylPrefs() {
  try { const r = await sGet(kSylHidden()); SYL_HIDDEN = r ? JSON.parse(r) : []; } catch (e) { SYL_HIDDEN = []; }
  if (!Array.isArray(SYL_HIDDEN)) SYL_HIDDEN = [];
  SYL_HIDDEN = SYL_HIDDEN.filter(isSylId);
  try { const r = await sGet(kSylTomb()); SYL_TOMB = r ? JSON.parse(r) : {}; } catch (e) { SYL_TOMB = {}; }
  if (!SYL_TOMB || typeof SYL_TOMB !== 'object') SYL_TOMB = {};
}
async function saveSylPrefs() { await sSet(kSylHidden(), JSON.stringify(SYL_HIDDEN)); await sSet(kSylTomb(), JSON.stringify(SYL_TOMB)); }
/* the catalogue index (SYLS) — written LAST by the migration, the source of
   truth every reader keys off. Load it, then reconcile against the code table. */
async function loadSylCat() {
  let a = null;
  try { const r = await sGet(kSylCat()); a = r ? JSON.parse(r) : null; } catch (e) { a = null; }
  const raw = Array.isArray(a) ? a.filter(isSylEntry) : [];
  /* FAIL CLOSED on an invalid stored id (§16 CSID2-R3-03, review CSID-REV-08/B07):
     a separator-/__proto__-shaped id, or an sb… id the code table does not ship,
     must NEVER reach a storage-key builder or sylSource's override lookup — the
     migration only ever writes valid ids, so one here is corruption / a bad
     cross-device sync. Reject it with the reload panel rather than silently
     dropping it (which could still resolve via a stale customDefs override). */
  for (const e of raw) {
    if (!isSylId(e.id) || (isBuiltinSylId(e.id) && !builtinSylById(e.id))) {
      setBootError('Your saved Tracker data holds a syllabus with an id this version does not recognise, so it could not be opened safely. Reload to try again.');
      SYLS = []; return;
    }
  }
  const seen = new Set();
  SYLS = raw.filter(e => !seen.has(e.id) && seen.add(e.id));
  for (const e of SYLS) { if (isBuiltinSylId(e.id)) e.base = builtinBaseOf(e.id); else if (e.base) delete e.base; }
}
async function saveSylCat() { await sSet(kSylCat(), JSON.stringify(SYLS)); }
/* the synchronous durable-record DELETE: drop mem[k] (so the persisted mirror
   stays in sync — leaving a stale value made a later same-value write read as a
   no-op and drop it) and, when routing is on for a known key, emit a `delete`
   Change (Codex-4/Fable-8). Then the async storage removal, OUTSIDE the command
   (the legacy persist, unchanged). */
function trkDelete(k) {
  const col = (TRK_COMMANDS && !TRK_RESTORING) ? trkCollectionOf(k) : null;
  /* [CMDL-FINISH] R3-004 — the `(k in mem)` gate is GONE: with mem hydrated, a
     delete of a stored-but-unwritten-this-session key must still route through a
     command so it emits a delete change with a real before-image. */
  if (col && !cmdIsCommitting()) {
    cmdCommit({
      type: col,
      scope: { module: 'trk', courseId: course, sylId: curSylId() },
      apply: (txn) => { txn.enlist(trkStore); delete mem[k]; bumpMemGen(k); TRK_SIG++; },
    });
  } else {
    delete mem[k]; bumpMemGen(k); TRK_SIG++;
  }
}
async function delKey(k) {
  trkDelete(k);
  /* [CMDL-FINISH] §4 — inside a gesture the mem drop above is synchronous (the
     trkDelete raw branch while committing); record the DELETE so its storage
     flush rides the gesture's ONE boundary effect, exactly as sSet does. */
  if (TRK_GESTURE_PENDING) { TRK_GESTURE_PENDING.set(k, TRK_DEL); return; }
  try {
    if (storage && storage.delete) { await storage.delete(k); }
    else { await storage.set(k, ''); }   // soft-delete fallback; mem already dropped above
  } catch (_) { try { await storage.set(k, ''); } catch (e) {} }
}

/* BOOT RECONCILE (§5a, CSID2-R2-06/R3-03). Deterministic ids remove per-boot
   MINTING for built-ins but not catalogue MAINTENANCE: after the one-shot
   migration a newly-shipped built-in has no sylcat entry; a shipped rename must
   keep the id and repoint base; and a shipped label change must not clobber a
   user relabel. Idempotent, runs every boot after the catalogue loads AND inside
   reloadFromStore. Never mints (built-in ids are deterministic), never touches a
   custom entry. */
/* the SYNCHRONOUS catalogue mutations of the boot reconcile — returns whether the
   catalogue changed (the caller persists). Split out ([CMDL-FINISH] §4) so
   restoreHiddenSyl can run it INSIDE its gesture; the async wrapper keeps the
   boot/reload callers unchanged. */
function reconcileBuiltinsSync() {
  let changed = false;
  for (const e of SYLS) {
    if (!isBuiltinSylId(e.id)) continue;
    const canon = builtinBaseOf(e.id);
    if (e.base !== canon) { e.base = canon; changed = true; }        /* repoint base on a shipped rename */
    if (!e.userNamed && e.name !== canon) { e.name = ensureUniqueLabel(e.id, canon); changed = true; }  /* shipped label, unless user-renamed */
  }
  for (const b of BUILTIN_SYL) {
    if (SYL_TOMB[b.id]) continue;                                     /* deleted: never re-offer */
    if (SYLS.some(e => e.id === b.id)) continue;
    SYLS.push({ id: b.id, name: ensureUniqueLabel(b.id, b.name), base: b.name }); changed = true;
  }
  return changed;
}
async function reconcileBuiltins() {
  if (reconcileBuiltinsSync()) await saveSylCat();
}
/* Unsaved flow edits belong to the chart on screen, and loadCourse replaces
   that chart from storage. Switching SYLLABUS asked before doing so; switching
   or adding a COURSE did not, so the edits vanished without a word and the
   unsaved flag stayed lit over a chart that had nothing unsaved. Every route
   that loads another chart asks through this one door. */
async function leaveFlowEdits(what) {
  if (!sylDirty) return true;
  if (!await uiConfirm('You have unsaved flow edits on “' + curSylName() + '”.\n' + what)) return false;
  clearDirty(); return true;
}
export async function switchSyllabus(v) {
  /* v is a syllabus ID (the dropdown's option value since 1B-ii). */
  const nm = sylName(v) || v;
  if (!await leaveFlowEdits('Discard them and switch to “' + nm + '”?')) { refreshSyl(); return; }
  /* the id flip rides the chain with the load: kMarks/kDates key on curSylId(),
     so a flip landing inside a roster write's tail re-keyed its saves */
  await onChain(async () => { plan.sylId = v; await savePlan(); await loadCourseNow(course); });
  refreshCourses(); refreshSyl(); refreshActive(); renderBoard(); renderSide(); setSaveStatus('switched to ' + nm, 'ok');
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
  /* the modal lists LABELS (unique across the catalogue, §9); rerank SYL_ORDER
     (ids) via a label→id map, keeping anyone the modal did not name after. */
  const byName = new Map(SYLS.map(e => [e.name, e.id]));
  const ranked = list.map(n => byName.get(n)).filter(Boolean);
  const all = allSylIds();
  SYL_ORDER = [...ranked.filter(id => all.includes(id)), ...all.filter(id => !ranked.includes(id))];
  await saveSylOrder();
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
export async function restoreHiddenSyl(id) {
  /* takes an ID (§9 CSID2-09). A deleted built-in was swept + tombstoned +
     dropped from the catalogue; clear both flags, then the reconcile re-adds its
     entry (empty student layer, shipped def) so it is offered again.
     [CMDL-FINISH] §4 (Class B): the flag clears + reconcile + order add are ONE
     synchronous envelope (reconcileBuiltinsSync has no async step). */
  trkGesture(() => {
    SYL_HIDDEN = SYL_HIDDEN.filter(x => x !== id);
    delete SYL_TOMB[id];
    saveSylPrefs();
    reconcileBuiltinsSync(); saveSylCat();
    if (sylEntry(id) && !SYL_ORDER.includes(id)) { SYL_ORDER.push(id); saveSylOrder(); }
  });
  refreshSyl();
  setSaveStatus('restored built-in “' + sylName(id) + '”', 'ok');
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
  const chosen = curSylId(); const useId = allSylIds().indexOf(chosen) >= 0 ? chosen : firstSylId();
  // [CMDL-FINISH] §4 (Class B) — the whole course creation (entry + plan + empty
  // rosters + migration flags) is ONE gesture = ONE envelope; the load after is a
  // separate async read.
  trkGesture(() => {
    COURSES.unshift({ id, name: v }); saveCourses();
    sSet(kPlan(id), JSON.stringify({ lulls: [], mode: 'pace', epw: 2, target: null, sylId: useId }));
    for (const sid of allSylIds()) sSet(kRosterFor(id, sid), JSON.stringify([]));
    sSet(kRosterMig(id), '1');   /* clean start: add students yourself, no marks carried over */
    sSet(kIdMig(id), '1');       /* born id-keyed — there is nothing to convert */
  });
  await loadCourse(id); refreshCourses(); refreshSyl(); refreshActive(); renderBoard(); renderSide();
  setSaveStatus('course ' + v + ' created on the ' + sylName(useId) + ' syllabus — add students to begin', 'ok');
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
/* A DELETED COURSE CAN BE RESTORED (owner, 23 Sep 26 — D128). Delete always
   kept the course's records ("marks remain in storage"), but nothing on any
   screen brought them back: re-creating the name started EMPTY under a new id
   ([HUMAN-RETEST] F12). The entry now moves to a deleted list, and the course
   ⇅ Reorder window offers ↺ Restore — the same door deleted built-in charts
   have — bringing it back under its own id, students and marks intact. */
const kDelCourses = 'v3:delcourses';
export let DELCOURSES = [];
async function loadDelCourses() {
  DELCOURSES = sParse(await sGet(kDelCourses), [], 'array').filter(c => isCourseEntry(c) && !COURSES.some(x => isCourseEntry(x) && x.id === c.id));
}
export function deletedCourses() { return DELCOURSES.slice(); }
export async function delCourse() {
  if (COURSES.length <= 1) { await uiAlert('Keep at least one course.'); return; }
  if (!await leaveFlowEdits('Discard them and delete the course?')) return;
  if (!await uiConfirm('Delete course ' + curCourseName() + '?\n\nIts students and marks are kept: ↺ Restore in ⇅ Reorder courses brings it back in this browser.')) return;   /* "in this browser": a backup does not carry a deleted course (D131) */
  const gone = COURSES.find(c => c.id === course);
  trkGesture(() => {
    COURSES = COURSES.filter(c => c.id !== course); saveCourses();
    if (gone && isCourseEntry(gone)) { DELCOURSES = [...DELCOURSES.filter(c => c.id !== gone.id), { id: gone.id, name: gone.name }]; sSet(kDelCourses, JSON.stringify(DELCOURSES)); }
  });
  await loadCourse(COURSES[0] && COURSES[0].id); refreshCourses(); refreshActive(); renderBoard(); renderSide();
}
/* Back into the dropdown, at the end, under its own id. A course made since
   under the same name keeps it; the restored one says so in its name. */
export async function restoreCourse(id) {
  const e = DELCOURSES.find(c => c.id === id); if (!e) return;
  /* already live (a belt: no control reaches this) — just drop the stale entry */
  if (COURSES.some(c => isCourseEntry(c) && c.id === id)) { DELCOURSES = DELCOURSES.filter(c => c.id !== id); await sSet(kDelCourses, JSON.stringify(DELCOURSES)); refreshCourses(); return; }
  let nm = e.name;
  if (COURSES.some(c => isCourseEntry(c) && c.name === nm)) { let n = 2; nm = e.name + ' (restored)'; while (COURSES.some(c => c.name === nm)) nm = e.name + ' (restored ' + (n++) + ')'; }
  trkGesture(() => {
    DELCOURSES = DELCOURSES.filter(c => c.id !== id); sSet(kDelCourses, JSON.stringify(DELCOURSES));
    COURSES = [...COURSES, { id, name: nm }]; saveCourses();
  });
  refreshCourses();
  setSaveStatus('restored course “' + nm + '”', 'ok');
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
    /* the same refusal as + Add (D124): a code deleted from this chart and not
       saved yet still has its marks filed, so putting it back through the list
       would bring them back with it (the two code reads, Fable F-B) */
    const gone = (sylSource(curSylId()) || []).map(e => e && e.id).filter(x => x && !byid[x]);
    const back = arr.map(e => e.id).filter(x => gone.includes(x));
    if (back.length) throw new Error('“' + back.join(', ') + '” was deleted from this chart and that is not saved yet. Press ✓ Save changes first (its marks are removed then), or Undo to bring it back.');
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
  const id = curSylId();
  if (!sylDirty && sylHasOwnDef(id)) { setSaveStatus('no changes to save', 'ok'); return true; }
  /* D124: an event this save takes off the chart takes its marks with it, in
     every course — undoing the delete before this press still brings the ball
     back as it was, marks and all (the edit's own undo). */
  const saved = sylSource(id) || [];
  const gone = saved.map(e => e && e.id).filter(x => x && !byid[x]);
  await sweepChart(id, new Set(gone), saved, SYL);
  /* Built-ins are editable: the saved version is stored as an override under the
     built-in's id and takes precedence when the syllabus is loaded (sylSource). */
  /* A built-in whose events are exactly the shipped ones is not an edit — a
     save of font or line changes alone (those live in the layout) used to store
     the untouched event list as an override, so the chart read "✎ edited",
     offered "Revert edits only" for nothing, and came back unmarked after an
     export → import. The same rule the import follows ([HUMAN-RETEST] F7; the
     re-walk found this second writer, 23 Sep 26). */
  const shipped = isBuiltinSylId(id) ? SYLLABI[builtinBaseOf(id)] : null;
  if (shipped && sameDef(SYL, shipped)) delete customDefs[id];
  else customDefs[id] = JSON.parse(JSON.stringify(SYL));
  await sSet(kSyls(course), JSON.stringify(customDefs));
  clearDirty(); refreshSyl(); renderBoard(); renderSide();
  setSaveStatus('syllabus “' + sylName(id) + '” saved' + (isBuiltinSylId(id) && sylHasOwnDef(id) ? ' (overrides the built-in)' : ''), 'ok');
  return true;
}

/* The syllabus-editing commands (duplicate, add, delete) point the plan at a
   syllabus ID, flush, and reload. The flip and the load ride the chain
   together, as switchSyllabus's do — see loadChain. */
async function switchSylNow(id) {
  await onChain(async () => {
    plan.sylId = id; await savePlan();
    if (typeof flushNow === 'function') { try { await flushNow(); } catch (_) {} }
    clearDirty(); await loadCourseNow(course);
  });
}
/* the first live syllabus id OTHER than `id` (a delete's landing chart). */
function firstOtherSylId(id) {
  const def = builtinIdByName(DEFAULT_SYL_NAME);
  if (def !== id && sylEntry(def) && !isHidden(def)) return def;
  const o = orderedSylIds().filter(x => x !== id);
  return o[0] || def || 'sb2026';
}
/* EVERY course namespace present in storage — the live COURSES plus any a
   delCourse dropped from the index while KEEPING its records (review CSID-B05):
   a syllabus delete must sweep those too, or a later re-import of the deleted
   course would resurface records under a since-restored built-in. Scanned by the
   2nd colon-bounded segment being a course id. */
async function allCourseNamespaces() {
  const out = new Set(COURSES.map(c => c.id));
  for (const k of ((await storage.list('v3:')).keys || [])) {
    const rest = k.slice(3), i = rest.indexOf(':'); if (i <= 0) continue;
    const seg = rest.slice(0, i); if (isCourseId(seg)) out.add(seg);
  }
  return [...out];
}
/* sweep every per-course student record filed under a syllabus id (delete). */
/* [CMDL-FINISH] §4 (Class C) — the READ phase of a syllabus delete: gather every
   stored key to remove and every plan pointer to repoint, across EVERY course
   namespace (not just the live one, so no dangling pointer is left — §15
   CSID2-R2-04, review CSID-B05/B06). delSyl then applies the whole sweep
   synchronously as ONE envelope. Replaces the old sweepSylRecords/repairPlanSyl
   pair, whose deletes and plan writes were interleaved with these reads. */
async function planSylSweep(sylId, fallback) {
  const dels = [];            // stored keys to delete
  const planFixes = [];       // { c, key, value, plan } plan records to repoint
  for (const c of await allCourseNamespaces()) {
    const pre = 'v3:' + c + ':' + sylId + ':';
    for (const k of ((await storage.list(pre)).keys || [])) dels.push(k);
    /* clear this course's last-edit pointers that name the deleted syllabus, and
       lastStudent when it points at one — else loadCourseNow's restore reopens the
       (deleted, maybe later restored-empty) chart. */
    const lastS = await sGet(kLastStudent(c));
    for (const k of ((await storage.list('v3:' + c + ':last:')).keys || [])) {
      try { const rec = JSON.parse((await sGet(k)) || 'null'); if (rec && rec.syl === sylId) { dels.push(k); if (lastS && k === kLast(c, lastS)) dels.push(kLastStudent(c)); } } catch (_) {}
    }
    /* repoint any course's plan.sylId that names the deleted id. */
    try {
      const pr = await sGet(kPlan(c));
      if (pr) { const p = JSON.parse(pr); if (p && p.sylId === sylId) { p.sylId = fallback; planFixes.push({ c, key: kPlan(c), value: JSON.stringify(p), plan: p }); } }
    } catch (_) {}
  }
  return { dels, planFixes };
}
/* DELETING A BALL WIPES ITS MARKS (owner, 23 Sep 26 — D124: "deleting a ball
   should also wipe its marks and a new ball with the same code dont come up
   graded"). Marks are filed under the event's CODE, per course and chart, so the
   sweep covers every course that uses this chart. READ first (the storage scans),
   then every write in ONE gesture — delSyl's pattern. A student whose wiped marks
   included a flight has Last Flown settled again (D123). `def` is the chart as it
   was, for which events were flights. */
/* ONE sweep for a chart whose events changed at a save (or a revert), across
   every course that uses the chart: the marks of the events taken off it go
   (D124), a student's "last worked" pointer to one of them goes with them (the
   two code reads, Astra #4 — else a new ball with that code read as their last
   work), and Last Flown is settled again from the flights as the chart now has
   them (D123) — also when a ball merely changed between flight and not-flight
   (the two code reads, Fable F-G / Astra #2). `before` / `after` are the event
   lists as saved and as they will be. READ first, then every write in ONE
   gesture — delSyl's pattern. */
async function sweepChart(sylId, kill, before, after) {
  const flights = list => new Set((list || []).filter(e => e && e.type === 'flight').map(e => e.id));
  const was = flights(before), now = flights(after);
  const typeMoved = [...new Set([...was, ...now])].some(x => !kill.has(x) && was.has(x) !== now.has(x));
  if (!kill.size && !typeMoved) return;
  const isFlightNow = x => now.has(x) && !kill.has(x);
  const writes = [], dels = [];
  for (const c of await allCourseNamespaces()) {
    const pre = 'v3:' + c + ':' + sylId + ':m:';
    for (const k of ((await storage.list(pre)).keys || [])) {
      const m = sParse(await sGet(k), null, 'object'); if (!m) continue;
      const hit = Object.keys(m).filter(x => kill.has(x));
      const s = k.slice(pre.length);
      if (hit.length) { for (const x of hit) delete m[x]; writes.push({ k, v: JSON.stringify(m), c, s, m }); }
      if (typeMoved || hit.some(x => was.has(x))) {
        const dk = kDatesFor(c, sylId, s);
        const d0 = sParse(await sGet(dk), null, 'object');
        const d = settledDates(d0, latestFlown(m, isFlightNow));
        const same = d0 && (d0.lastSyll || null) === (d.lastSyll || null) && (d0.lastCurr || null) === (d.lastCurr || null) && !!d0.handSyll === !!d.handSyll && !!d0.handCurr === !!d.handCurr;
        if (!same) { stamp(d); writes.push({ k: dk, v: JSON.stringify(d), c, s, d }); }
      }
    }
    if (kill.size) {
      for (const k of ((await storage.list('v3:' + c + ':last:')).keys || [])) {
        try { const rec = JSON.parse((await sGet(k)) || 'null'); if (rec && rec.syl === sylId && kill.has(rec.event)) dels.push({ k, c, s: k.slice(('v3:' + c + ':last:').length) }); } catch (_) {}
      }
    }
  }
  /* and what was typed on them (D130 — "delete them too"): details belong to
     the chart (D126), so it is this chart's entries that go */
  const typed = eventInfo[sylId] ? [...kill].filter(x => eventInfo[sylId][x]) : [];
  if (!writes.length && !dels.length && !typed.length) return;
  trkGesture(() => {
    for (const w of writes) {
      sSet(w.k, w.v);
      if (w.c === course && sylId === curSylId()) { if (w.m) marks[w.s] = w.m; if (w.d) dates[w.s] = w.d; }
    }
    for (const x of dels) { delKey(x.k); if (x.c === course) lastEdit[x.s] = null; }
    if (typed.length) {
      const blk = Object.assign({}, eventInfo[sylId]); for (const x of typed) delete blk[x];
      if (Object.keys(blk).length) eventInfo[sylId] = blk; else delete eventInfo[sylId];
      saveEventInfo();
    }
  });
}
/* dupSyl / addSyl are catalogue-only now: mint an sc… id, file the def+layout
   under it, add the entry. NO mark copy — the student layer starts EMPTY on the
   copy (a change from before, acceptable under the reset, §6). Colon allowed (§8). */
export async function dupSyl() {
  const srcId = curSylId();
  /* The copy is made from the chart AS IT IS ON SCREEN, and switching to it then
     dropped the original's unsaved edits without a word — the edits moved into
     the copy and left the original ([HUMAN-RETEST] Fable #3). Ask which. */
  if (sylDirty) {
    const c = await uiChoice('You have unsaved flow edits on “' + sylName(srcId) + '”. The copy is made from the chart as it is on screen.\n\nKeep the edits on “' + sylName(srcId) + '” too?', 'Yes — save them on both', 'No — only in the copy');
    if (c === 'cancel') return;
    if (c === 'ok') await persistSyl();
  }
  const nm = ((await uiPrompt('Name for the duplicated syllabus:', sylName(srcId) + ' copy')) || '').trim();
  if (!nm) return;
  if (SYLS.some(e => e.name === nm)) { await uiAlert('A syllabus with that name already exists.'); return; }
  /* [CMDL-FINISH] §4 (Class B) — HOIST the layout snapshot read (and the live-def
     copy, which captures unsaved arrange edits) BEFORE the gesture; the catalogue
     + def + layout writes then land as ONE envelope. The switch + reload after is
     a separate async step (as addCourse's load is). A storage error no longer
     surfaces here synchronously — the writes are atomic to memory and their flush
     is best-effort at the gesture boundary (the status line shows "local only" on
     failure), so the old mid-sequence rollback is neither reachable nor needed. */
  const id = mintSylId();
  const defCopy = JSON.parse(JSON.stringify(SYL));
  const layoutSnap = await snapshotLayout(srcId);
  /* The copy reads exactly as the chart it came from, details included
     (D126: details belong to a chart, so the copy takes this chart's). A copy is
     a custom chart with no shipped profile of its own, so what the source SHOWS
     — its profile and its typed edits — is written onto the copy as its own. */
  const infoCopy = {};
  for (const e of defCopy) {
    if (!e || !e.id) continue;
    const d = diffDetails(shippedDetails(EVENT_INFO, EVENT_INFO_BY_SYL, null, e.id), infoFor(e.id, srcId));
    if (d) infoCopy[e.id] = d;
  }
  trkGesture(() => {
    customDefs[id] = defCopy;
    sSet(kSyls(course), JSON.stringify(customDefs));
    sSet(kLayoutFor(course, id), JSON.stringify(layoutSnap));
    if (Object.keys(infoCopy).length) { eventInfo[id] = infoCopy; saveEventInfo(); }
    SYLS.push({ id, name: ensureUniqueLabel(id, nm) }); saveSylCat();
    if (!SYL_ORDER.includes(id)) { SYL_ORDER.push(id); saveSylOrder(); }
  });
  try {
    await switchSylNow(id);
    refreshSyl(); refreshActive(); renderBoard(); renderSide();
    setSaveStatus('duplicated as “' + nm + '”', 'ok');
  } catch (err) {
    await uiAlert('The syllabus was duplicated, but switching to it failed — reloading.\n\n' + ((err && err.message) || err));
    await loadCourse(course); refreshSyl(); refreshActive(); renderBoard(); renderSide();
  }
}

/* Add syllabus: a brand-new EMPTY sheet (no events, no marks). */
export async function addSyl() {
  /* adding switches to the new sheet, which drops the chart's unsaved flow
     edits — ask, as the Syllabus dropdown does ([HUMAN-RETEST] Fable #3) */
  if (!await leaveFlowEdits('Discard them and add a new syllabus?')) return;
  const nm = ((await uiPrompt('Name for the new (empty) syllabus:', 'New syllabus')) || '').trim();
  if (!nm) return;
  if (SYLS.some(e => e.name === nm)) { await uiAlert('A syllabus with that name already exists.'); return; }
  /* [CMDL-FINISH] §4 (Class B) — the new empty chart's catalogue + def + blank
     layout are ONE envelope; the switch + reload after is a separate async step.
     (See dupSyl for why the old storage-error rollback is gone.) */
  const id = mintSylId();
  trkGesture(() => {
    customDefs[id] = [];                                   /* empty event list */
    sSet(kSyls(course), JSON.stringify(customDefs));
    sSet(kLayoutFor(course, id), JSON.stringify({}));      /* blank canvas */
    SYLS.push({ id, name: ensureUniqueLabel(id, nm) }); saveSylCat();
    if (!SYL_ORDER.includes(id)) { SYL_ORDER.push(id); saveSylOrder(); }
  });
  try {
    await switchSylNow(id);
    refreshSyl(); refreshActive(); renderBoard(); renderSide();
    setSaveStatus('added empty syllabus “' + nm + '”', 'ok');
    /* the Edit button this used to name folded into the Syllabus ✎ menu on
       9 Sep 26 as "Edit chart layout" ([HUMAN-RETEST] F3) */
    if (!arrangeMode) flashHint('Empty sheet ready — Syllabus ✎ → Edit chart layout, then use + Flight / + Acad / + Test / + Sim / + CFT/IAT/EPT to add events.');
  } catch (err) {
    await uiAlert('The syllabus was added, but switching to it failed — reloading.\n\n' + ((err && err.message) || err));
    await loadCourse(course); refreshSyl(); refreshActive(); renderBoard(); renderSide();
  }
}

/* Rename syllabus (built-ins too): a pure catalogue relabel now — set the
   entry's name, mark a built-in userNamed so a shipped rename never clobbers it,
   save the catalogue. NO moveSylData, NO tombstone-and-shadow, NO layout copy,
   NO alias: the id, the base and the layout are untouched. This is the headline
   test (§6). Colon allowed (§8). */
export async function renSyl() {
  const id = curSylId();
  const old = sylName(id);
  const nm = ((await uiPrompt('Rename syllabus “' + old + '” to:', old)) || '').trim();
  if (!nm || nm === old) return;
  if (SYLS.some(e => e.id !== id && e.name === nm)) { await uiAlert('A syllabus named “' + nm + '” already exists.'); return; }
  try {
    /* mark userNamed on EVERY rename, not just built-ins (review finding 5): a
       custom's relabel must travel through export/import too — sylcatEntryOf only
       emits userNamed when set and upsertSylEntry only adopts a file's label when
       it is, so without this a custom rename was silently lost on re-import. */
    const e = sylEntry(id); if (e) { e.name = nm; e.userNamed = true; }
    await saveSylCat();
    refreshCourses(); refreshSyl(); refreshActive(); renderBoard(); renderSide();
    setSaveStatus('renamed “' + old + '” → “' + nm + '”', 'ok');
  } catch (err) {
    await uiAlert('Could not rename the syllabus.\n\n' + ((err && err.message) || err));
    await loadCourse(course); refreshSyl(); refreshActive(); renderBoard(); renderSide();
  }
}

/* Delete syllabus (custom or built-in) = a real SWEEP (§14 CSID2-08): remove
   every student record under the id in EVERY course, repair every course's plan
   (§15 CSID2-R2-04), then drop the catalogue entry. A built-in is tombstoned +
   hidden so the boot reconcile never re-offers it until it is restored (hidden ≠
   deleted). "Revert edits only" keeps the built-in and drops just the override. */
export async function delSyl() {
  const id = curSylId(), nm = sylName(id), isB = isBuiltinSylId(id);
  if (allSylIds().length <= 1) { await uiAlert('Keep at least one syllabus.'); return; }
  let confirmed = false;
  if (isB && sylHasOwnDef(id)) {
    const c = await uiChoice('“' + nm + '” is a built-in syllabus that has saved edits.\n\nDelete it outright, or just throw away your edits and keep the shipped version?',
      'Delete it', 'Revert edits only');
    if (c === 'cancel') return;
    if (c === 'ok') confirmed = true;
    if (c === 'alt') {
      /* an event the edits had added goes with the revert — and its marks with
         it, as a deleted ball's do (D124) */
      const edited = customDefs[id] || [], shipped = SYLLABI[builtinBaseOf(id)] || [];
      const back = new Set(shipped.map(e => e && e.id));
      const gone = edited.map(e => e && e.id).filter(x => x && !back.has(x));
      await sweepChart(id, new Set(gone), edited, shipped);
      delete customDefs[id];
      await sSet(kSyls(course), JSON.stringify(customDefs));
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
    const fallback = firstOtherSylId(id);
    /* [CMDL-FINISH] §4 (Class C) — gather the whole sweep (all the async storage
       scans + reads) FIRST, then apply deletes + catalogue drop + plan repairs as
       ONE synchronous envelope. The switch + reload after is a separate step. */
    const { dels, planFixes } = await planSylSweep(id, fallback);
    trkGesture(() => {
      for (const k of dels) delKey(k);
      for (const f of planFixes) { sSet(f.key, f.value); if (f.c === course) plan = f.plan; }
      SYLS = SYLS.filter(e => e.id !== id);
      if (isB) { if (!isHidden(id)) SYL_HIDDEN.push(id); SYL_TOMB[id] = 1; }
      delete customDefs[id];
      sSet(kSyls(course), JSON.stringify(customDefs));
      delKey(kLayoutFor(course, id));
      /* a custom chart's details go with it (it cannot come back); a built-in
         keeps them, so a restore from ⇅ Reorder brings back what was typed */
      if (!isB && eventInfo[id]) { delete eventInfo[id]; saveEventInfo(); }
      SYL_ORDER = SYL_ORDER.filter(x => x !== id);
      saveSylCat(); saveSylPrefs(); saveSylOrder();
    });
    await switchSylNow(fallback);
    refreshCourses(); refreshSyl(); refreshActive(); renderBoard(); renderSide();
    setSaveStatus('deleted syllabus “' + nm + '”', 'ok');
  } catch (err) {
    await uiAlert('Could not delete the syllabus.\n\n' + ((err && err.message) || err));
    await loadCourse(course); refreshSyl(); refreshActive(); renderBoard(); renderSide();
  }
}

/* Going in and out of Edit chart layout keeps the point of the chart in the
   middle of the board in the middle, at the same zoom — through the anchor
   bodies the zoom uses (chartPointAt / placeChartPoint, canvasPointAt /
   placeCanvasPoint). It used to copy the scroll into the canvas's pan and back,
   blind to the slack round the chart (9 Sep 26): the chart jumped 216px going
   in on a phone and landed elsewhere coming out. And it left the canvas's pan
   and zoom (`view`) behind on the ordinary chart, where the next pinch painted
   them on as a transform — the chart shrank below the zoom it showed and slid
   under its left edge (owner, 23 Sep 26: "the left side of the tracker chart is
   cut off"). Outside Edit chart layout `view` is the identity, always.
   A zoom changed while editing is the user's own, as a pinch or + / − is
   (zoomIsMine), or the next redraw on a phone snapped it back to fit.
   The board itself moves at the switch — the tool strip lands above it (240px
   on a phone) and the zoom bar below leaves — on React's next render, after
   this returns; so the point is placed now and again once that has landed,
   before the frame is painted (coming out, the slack is re-cut for the board's
   new height first: cut for the old one, it left no room to centre a point
   near the chart's top). */
export function toggleArrange() {
  const board = document.getElementById('board');
  const mid = () => ({ x: board.clientLeft + board.clientWidth / 2, y: board.clientTop + board.clientHeight / 2 });   /* from the board's outer edge */
  const midOnScreen = () => { const r = board.getBoundingClientRect(), m = mid(); return { x: r.left + m.x, y: r.top + m.y }; };
  const settle = fn => { if (typeof requestAnimationFrame !== 'undefined') requestAnimationFrame(fn); };
  if (!arrangeMode) {
    const c = board && flowZoom > 0 ? chartPointAt(board, mid().x, mid().y) : null;
    arrangeMode = true;
    view = { x: 0, y: 0, k: flowZoom };
    setTool('move'); renderBoard();
    const place = () => { if (!c || !arrangeMode) return; const m = midOnScreen(); placeCanvasPoint(c, m.x, m.y); applyView(); };
    place(); settle(place);
  } else {
    let c = null; if (board && document.getElementById('flowSvg')) { const m = midOnScreen(); c = canvasPointAt(m.x, m.y); }
    const k = Math.min(3, Math.max(0.1, view.k)), was = flowZoom;
    arrangeMode = false; connectSrc = null;
    renderBoard();   /* the ordinary chart: renderBoard puts `view` back to the identity */
    flowZoom = k; if (k !== was) zoomIsMine = true; applyFlowZoom();
    /* the slack is half a view, so it is re-cut for the board's settled size first */
    const place = () => { if (!c || arrangeMode) return; applyFlowZoom(); const m = mid(); placeChartPoint(board, c, m.x, m.y); };
    place(); settle(place);
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
  /* D124: its marks go with it — said here, because the question used to say
     only "Delete ACG-03?" and the marks stayed filed under the code, so a new
     ball later given that code came up already graded ([HUMAN-RETEST] W2-F7). */
  const msg = list.length === 1
    ? 'Delete ' + names[0] + ' from this syllabus?\n\nEvery student’s marks on it are removed when you press ✓ Save changes.'
    : 'Delete these ' + list.length + ' events from this syllabus?\n\n' + preview + '\n\nEvery student’s marks on them are removed when you press ✓ Save changes.';
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
  await loadDelCourses();
  try { await loadSylPrefs(); } catch (_) {}
  await loadSylCat();
  if (bootError) { notify(); return; }   /* an invalid stored id fails closed (CSID-B07); App shows the reload panel */
  await reconcileBuiltins();
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

/* the identity catalogue entry for a syllabus id, as a file carries it:
   {id, name, base?(built-in, authoritative), userNamed?}. */
function sylcatEntryOf(id) {
  const e = sylEntry(id); const out = { id, name: e ? e.name : (sylName(id) || id) };
  if (isBuiltinSylId(id)) out.base = builtinBaseOf(id);
  if (e && e.userNamed) out.userNamed = true;
  return out;
}
/* Charts: everything that draws the flow. Never a person. Id-keyed since 1B-ii,
   carrying a sylcat that labels every id. */
export async function collectCharts(ids, opts) {
  const list = (ids && ids.length) ? ids : orderedSylIds();
  const syllabi = {}, layouts = {}, order = [], sylcat = [];
  for (const id of list) {
    const src = sylSource(id); if (!src) continue;
    order.push(id);
    syllabi[id] = JSON.parse(JSON.stringify(src));
    layouts[id] = await layoutSnapshotFor(id, syllabi[id]);
    sylcat.push(sylcatEntryOf(id));
  }
  /* each exported chart's OWN detail edits, keyed by the chart (D126), and
     nothing else: the file used to carry the whole baked table, and an import
     of one chart then put that table back over every other chart's edits
     ([HUMAN-RETEST] W1-9; D122). */
  const eventInfoBySyl = {};
  for (const id of order) if (eventInfo[id] && Object.keys(eventInfo[id]).length) eventInfoBySyl[id] = JSON.parse(JSON.stringify(eventInfo[id]));
  const out = { order, syllabi, layouts, eventInfoBySyl, sylcat };
  /* A backup of EVERY chart also names the built-ins he deleted, so after
     export → wipe → import they stay deleted — the wiped app ships them all
     (owner, 23 Sep 26 — D127; [HUMAN-RETEST] F8). Never on a file of some
     charts: a chart handed over must not delete anything at the other end. */
  if (opts && opts.deleted) {
    out.deleted = BUILTIN_SYL.filter(b => SYL_TOMB[b.id]).map(b => b.id);
    /* and what was typed on them, so ↺ Restore after the wipe brings it back as it
       would have before (D127 "exactly as before the wipe"; the two code reads,
       Fable F-A / Astra #1). The file format accepts a details key a deleted id
       names without a chart of its own. */
    for (const id of out.deleted) if (eventInfo[id] && Object.keys(eventInfo[id]).length) eventInfoBySyl[id] = JSON.parse(JSON.stringify(eventInfo[id]));
  }
  return out;
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
  /* an ALWAYS-PRESENT identity-only sylcat (§CSID2-04): every syllabus id any
     bySyllabus block or plan.sylId references, labelled — so a student-only
     export still reconciles by identity at the destination. */
  const refIds = new Set();
  for (const c of Object.keys(byCourse)) {
    const b = byCourse[c] || {};
    for (const sid of Object.keys(b.bySyllabus || {})) refIds.add(sid);
    if (b.plan && b.plan.sylId) refIds.add(b.plan.sylId);
  }
  const sylcat = [...refIds].filter(isSylId).map(sylcatEntryOf);
  /* courses ride out as {id,name} entries (file v2); byCourse is keyed by course
     id, bySyllabus by syllabus id */
  return { courses: COURSES.slice(), byCourse, sylcat };
}

/* ---------- writing state back in, from the user's file ---------- */

/* Charts only. Writes syllabus definitions, layouts and event info — and
   nothing filed under a student. THE RULE: no roster, mark or date key may be
   written here, so importing a chart can never disturb anyone's progress.
   scripts/smoke.mjs pins that by watching every localStorage write. */
/* upsert a catalogue entry on import (§CSID2-R2-05 label rule): a plain incoming
   label never overwrites a local userNamed one; a userNamed import adopts the
   file's label; add-as-new is a deliberate new label (userNamed). Base for a
   built-in is always the app's. */
function upsertSylEntry(id, label, fileEntry, isAddNew) {
  const fileUserNamed = !!(fileEntry && fileEntry.userNamed);
  let e = sylEntry(id);
  if (!e) {
    e = { id, name: ensureUniqueLabel(id, label || id) };
    if (isBuiltinSylId(id)) e.base = builtinBaseOf(id);
    if (isAddNew || fileUserNamed) e.userNamed = true;
    SYLS.push(e); return;
  }
  if (isBuiltinSylId(id)) e.base = builtinBaseOf(id);
  /* §15 CSID2-R2-05: the file's userNamed label WINS whenever the file carries
     that provenance (even over a local userNamed label); a plain incoming label
     never overwrites a local one. */
  if (fileUserNamed && label) { e.name = ensureUniqueLabel(id, label); e.userNamed = true; }
}
/* Two event lists are the same chart definition when they match field for
   field — ignoring `_b`, computeFlow's scratch value, which it writes onto the
   event objects it lays out and so can ride into an export. */
function sameDef(a, b) {
  const strip = l => JSON.stringify((l || []).map(e => { const c = { ...e }; delete c._b; return c; }));
  return strip(a) === strip(b);
}
export async function applyCharts(charts, opts) {
  const o = opts || {};
  const list = (o.ids && o.ids.length) ? o.ids : (charts.order || Object.keys(charts.syllabi || {}));
  const catById = new Map((charts.sylcat || []).map(e => [e.id, e]));
  const applied = [], pairs = [];
  for (const src of list) {
    const events = (charts.syllabi || {})[src];
    if (!events) continue;
    const target = (o.mode === 'add' && o.rename && o.rename.from === src) ? o.rename.to : src;
    /* A built-in coming in EXACTLY as shipped is not an edit. Stored as an
       override it read "✎ edited" in the dropdown, offered "Revert edits only"
       for a chart nobody touched, and would stop following a corrected shipped
       version — after the export → wipe → import route every built-in came back
       that way (D120; [HUMAN-RETEST] F7). */
    const shipped = isBuiltinSylId(target) ? SYLLABI[builtinBaseOf(target)] : null;
    if (shipped && sameDef(events, shipped)) delete customDefs[target];
    else customDefs[target] = JSON.parse(JSON.stringify(events));
    /* A ball the file's chart no longer has keeps its students' marks, out of
       sight — an import never deletes anyone's marks; importing the old chart
       back brings them back (owner, 23 Sep 26 — D132; the D124 wipe is a
       ✓ Save changes / Revert thing only). */
    const lay = (charts.layouts || {})[src];
    if (lay) await sSet(kLayoutFor(course, target), JSON.stringify(lay));
    if (SYL_TOMB[target]) delete SYL_TOMB[target];
    if (SYL_HIDDEN.indexOf(target) >= 0) SYL_HIDDEN = SYL_HIDDEN.filter(x => x !== target);
    const label = (o.mode === 'add' && o.rename && o.rename.from === src) ? o.rename.label : (catById.get(src) ? catById.get(src).name : null);
    upsertSylEntry(target, label, catById.get(src), o.mode === 'add');
    if (!SYL_ORDER.includes(target)) SYL_ORDER.push(target);
    applied.push(target); pairs.push({ src, target, events });
  }
  /* The file records the order the user put their charts in. Only on a whole-file
     open — importing one syllabus must not reshuffle everything else. */
  if (!o.ids && Array.isArray(charts.order) && charts.order.length) {
    const inFile = charts.order.filter(id => sylEntry(id));
    const rest = SYL_ORDER.filter(id => !inFile.includes(id));
    SYL_ORDER = [...inFile, ...rest];
  }
  await sSet(kSyls(course), JSON.stringify(customDefs));
  /* Event details: ONLY the charts brought in, and never wiping a detail typed
     here (D122, D126). A file carries each chart's own edits; the file's edit
     wins where it speaks, everything else typed on the chart stays. A file
     written before D126 carries one table for every chart — its real edits are
     laid onto each imported chart that has the event, as the old build showed
     them, and on no other chart ([HUMAN-RETEST] W1-9). */
  const bySyl = charts.eventInfoBySyl && typeof charts.eventInfoBySyl === 'object' ? charts.eventInfoBySyl : null;
  const flatEdits = !bySyl && charts.eventInfo ? realFlatEdits(charts.eventInfo, EVENT_INFO) : null;
  let infoTouched = false;
  for (const { src, target, events } of pairs) {
    const shipped = shippedOfSyl(target);
    let incoming = bySyl ? bySyl[src] : (flatEdits ? blockFromFlat(flatEdits, (events || []).map(e => e && e.id), shipped) : null);
    /* A built-in brought in AS NEW becomes a custom chart, which has no shipped
       profile of its own: the file's block holds only what differed from the
       built-in's profile, so the profile itself is laid under it — the copy
       reads as the chart in the file did, as ⧉ Duplicate's copy does (D126;
       the two code reads, Fable F-C). */
    if (target !== src && isBuiltinSylId(src) && !isBuiltinSylId(target)) {
      const prof = {};
      for (const e of (events || [])) {
        if (!e || !e.id) continue;
        const d = diffDetails(shippedDetails(EVENT_INFO, EVENT_INFO_BY_SYL, null, e.id), shippedDetails(EVENT_INFO, EVENT_INFO_BY_SYL, builtinBaseOf(src), e.id));
        if (d) prof[e.id] = d;
      }
      incoming = mergeBlock(prof, incoming || {}, shipped);
    }
    if (!incoming || !Object.keys(incoming).length) continue;
    const merged = mergeBlock(eventInfo[target], incoming, shipped);
    if (Object.keys(merged).length) eventInfo[target] = merged; else delete eventInfo[target];
    infoTouched = true;
  }
  if (infoTouched) await saveEventInfo();
  await saveSylCat(); await saveSylPrefs(); await saveSylOrder();
  await loadCourse(course);
  refreshSyl(); renderBoard(); renderSide();
  return { applied };
}

/* THE STUDENT-IMPORT GUARDRAIL (§19, owner decision). Student MARKS / dates /
   rosters and plan pointers import ONLY from an id-native v3 file that carries a
   sylcat resolving to real identities. A pre-v3 (name-keyed) student block, or
   any reference whose syllabus id does not resolve to an existing, non-tombstoned
   syllabus, is REFUSED with a plain message — charts still import. This removes
   the whole legacy-marks-import cascade (there is no name→built-in guessing in
   the file path). Runs AFTER applyCharts (so a chart restored in the same import
   already exists / cleared its tomb). */
const STUDENT_GUARD_MSG = 'These student marks were saved by an older version and can’t be brought in safely. Import the charts, then re-enter marks — or export a fresh backup from the current app and import that.';
function reconcileStudentsSyllabi(students, version) {
  const s = students || {};
  const refs = new Set(); let nameKeyed = false;
  for (const c of Object.keys(s.byCourse || {})) {
    const cv = s.byCourse[c] || {};
    for (const k of Object.keys(cv.bySyllabus || {})) { refs.add(k); if (!isSylId(k)) nameKeyed = true; }
    if (cv.plan && cv.plan.sylName != null) nameKeyed = true;          /* a name-keyed plan pointer = pre-v3 */
    if (cv.plan && cv.plan.sylId) refs.add(cv.plan.sylId);
  }
  /* a PRE-v3 student payload is refused OUTRIGHT (§19, review CSID-B03): the file
     version is the id/name provenance, so an id-SHAPED legacy name (e.g. a chart
     literally named 'sb2026') must never be read as an id and imported as the
     built-in. Also refuse a name-keyed block / legacy plan pointer even when the
     version is absent (a direct call), before the empty-refs shortcut (CSID-REV-09). */
  if ((refs.size || nameKeyed) && version != null && version < 3) throw new Error(STUDENT_GUARD_MSG);
  if (nameKeyed) throw new Error(STUDENT_GUARD_MSG);
  if (!refs.size) return s;                       /* no student syllabus refs (courses-only) — nothing to guard */
  if (!Array.isArray(s.sylcat)) throw new Error(STUDENT_GUARD_MSG);
  for (const r of refs) if (!isSylId(r)) throw new Error(STUDENT_GUARD_MSG);
  /* REFERENCE COMPLETENESS (§14 CSID2-04, §15 CSID2-R2-03, review CSID-REVIEW-02 +
     CSID-IR-03): every referenced id must be a KNOWN identity — labelled by the
     file's own sylcat, OR already an existing store syllabus. This runs AFTER
     applyCharts, so a chart brought in by the SAME import (its identity carried in
     charts.sylcat, not students.sylcat) is in the store and resolves here; that is
     the union of both catalogues §15 asks for, not students.sylcat alone. An
     unlabelled reference to NEITHER is refused — it could otherwise collide with a
     reconcile target and silently drop a block. Existence at the destination and
     no-two-refs-onto-one-dest are still enforced below, so this stays fail-closed. */
  const catIds = new Set((s.sylcat || []).filter(isSylEntry).map(e => e.id));
  for (const r of refs) if (!catIds.has(r) && !sylEntry(r)) throw new Error(STUDENT_GUARD_MSG);
  /* reconcile the file's syllabus ids to the store's (one map), refuse a clash */
  const { remapped, conflicts } = reconcileSylIds(buildUnionSylcat(null, s.sylcat), SYLS);
  if (conflicts.length) { const x = conflicts[0]; throw new Error('The students could not be brought in: the syllabus “' + x.name + '” in the file is a different chart than the one already here. Nothing has been changed.'); }
  const re = id => has(remapped, id) ? remapped[id] : id;
  /* every referenced id must resolve to a syllabus that EXISTS and is NOT
     tombstoned at the destination (§CSID2-04 / §CSID2-R5-02) */
  for (const r of refs) { const t = re(r); if (!sylEntry(t) || SYL_TOMB[t]) throw new Error(STUDENT_GUARD_MSG); }
  /* two distinct referenced ids MUST NOT reconcile onto one destination — that
     would collapse two student blocks into one, silently losing marks (CSID-REVIEW-02). */
  const seenDest = new Map();
  for (const r of refs) { const t = re(r); if (seenDest.has(t) && seenDest.get(t) !== r) throw new Error(STUDENT_GUARD_MSG); seenDest.set(t, r); }
  const byCourse = {};
  for (const c of Object.keys(s.byCourse || {})) {
    const cv = s.byCourse[c] || {}, nb = {};
    for (const k of Object.keys(cv.bySyllabus || {})) { const nk = re(k); if (has(nb, nk)) throw new Error(STUDENT_GUARD_MSG); nb[nk] = cv.bySyllabus[k]; }
    const ncv = { ...cv, bySyllabus: nb };
    if (ncv.plan && ncv.plan.sylId) ncv.plan = { ...ncv.plan, sylId: re(ncv.plan.sylId) };
    byCourse[c] = ncv;
  }
  return { ...s, byCourse };
}

/* People only. Never writes a syllabus or layout key. */
export async function applyStudents(students, links, version) {
  /* GUARDRAIL FIRST (§19): refuse a pre-v3 / unresolved student block outright,
     before any write; reconcile+remap syllabus ids for a valid v3 block. The
     file version (when known — the import path) is the id/name provenance. */
  students = reconcileStudentsSyllabi(students, version);
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
    const pExisting = [], pSyls = await storeSylIds(c);
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
    for (const n of await storeSylIds(c)) for (const e of sParse(await sGet(kRosterFor(c, n)), [], 'array')) if (isEntry(e)) existing.push(e);
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
    for (const n of await storeSylIds(c)) {
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
   yes) and ⤓ Export (a copy out) — open to everyone since 23 Sep 26 (D121:
   admin and member have the same access; the admin lock that stood here is
   gone). Every entry point still runs its picker before any await: the
   browser spends the click. */

/* ---------- Export: a copy of the store as a file ----------
   The backup before the database move, or a chart to hand over. Students start
   OFF and are reset OFF on every open, not just the first: this is the moment
   a file leaves the owner's hands, so it begins clean and they have to opt in —
   the safety measure agreed when tick-boxes were chosen over two files that
   cannot mix. For a full backup they tick it; the dialog and the confirmation
   both say which kind of file was written. */
export let copyOpen = false, copyOpts = { charts: true, students: false }, copyPick = {};
export async function openCopy() {
  /* Export writes what the STORE holds (collectCharts reads each chart's saved
     definition), so a ball added or linked and not yet saved was missing from
     the file with no word said — and that file is the one his charts reach the
     database by (D120; [HUMAN-RETEST] Fable #2). Ask first. No await happens
     when nothing is unsaved, so the window still opens on the click. */
  if (sylDirty) {
    const c = await uiChoice('You have unsaved flow edits on “' + curSylName() + '”.\n\nSave them first, so the exported file includes them?', 'Save, then export', 'Export without them');
    if (c === 'cancel') return;
    if (c === 'ok') await persistSyl();
  }
  copyOpts = { charts: true, students: false };
  /* copyPick keys by syllabus ID now (§9); the modal labels each by name. */
  copyPick = {}; orderedSylIds().forEach(id => { copyPick[id] = (id === curSylId()); });
  copyOpen = true; notify();
}
export function closeCopy() { copyOpen = false; notify(); }
export function setCopyOpt(which, on) { copyOpts = { ...copyOpts, [which]: !!on }; notify(); }
export function setCopyPick(id, on) { copyPick = { ...copyPick, [id]: !!on }; notify(); }
/* the Export window's All / None ([HUMAN-RETEST] Fable #5) */
export function setCopyPickAll(on) { const p = {}; orderedSylIds().forEach(id => { p[id] = !!on; }); copyPick = p; notify(); }

export async function saveCopyClick() {
  const ids = Object.keys(copyPick).filter(id => copyPick[id]);
  if (!copyOpts.charts && !copyOpts.students) { await uiAlert('Tick charts, students, or both.'); return; }
  if (copyOpts.charts && !ids.length) { await uiAlert('Tick at least one syllabus.'); return; }
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
    charts: opts.charts ? await collectCharts(ids, { deleted: ids.length === orderedSylIds().length }) : null,
    students: opts.students ? await collectStudents() : null, savedAt }), null, 2);
  try {
    if (handle) await FS.writeTo(handle, text); else FS.downloadInstead(name, text);
  } catch (err) {
    closeCopy(); setSaveStatus('copy NOT saved — ' + ((err && err.message) || err), 'err'); notify(); return;
  }
  closeCopy();
  setSaveStatus('', 'ok'); notify();
  /* "A full backup" only when it IS one: every chart AND the students. A file
     with the students and one chart of four was called a full backup — on the
     route to the database that is the file that loses the other three
     ([HUMAN-RETEST] W1-4). */
  const all = orderedSylIds().length, n = opts.charts ? ids.length : 0;
  const chartsLine = !opts.charts ? 'no charts' : (n === all ? 'every chart' : n + ' of ' + all + ' charts');
  await uiAlert('Exported as “' + (handle ? handle.name : name) + '”.\n\n'
    + (opts.students
      ? 'It CONTAINS student names and marks, with ' + chartsLine + (opts.charts && n === all ? ' — a full backup' : ' — NOT a full backup') + '; only send it to someone entitled to see them.'
      : 'It contains ' + chartsLine + ' — no student names or marks.'));
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
   applyStudents to refuse. Returns the reconciled charts + students + version. */
export function normalizeImport(parsed) {
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
    const { remapped, conflicts } = reconcileSylIds(union, SYLS);
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
function remapStudentsSyl(students, re) {
  const byCourse = {};
  for (const c of Object.keys(students.byCourse || {})) {
    const cv = students.byCourse[c] || {}, nb = {};
    /* two source ids must never collide onto one dest — that would silently drop
       a student block before the guardrail sees it (review CSID-REVIEW-02). */
    for (const k of Object.keys(cv.bySyllabus || {})) { const nk = re(k); if (has(nb, nk)) throw new Error(STUDENT_GUARD_MSG); nb[nk] = cv.bySyllabus[k]; }
    const ncv = { ...cv, bySyllabus: nb };
    if (ncv.plan && ncv.plan.sylId) ncv.plan = { ...ncv.plan, sylId: re(ncv.plan.sylId) };
    byCourse[c] = ncv;
  }
  const out = { ...students, byCourse };
  if (Array.isArray(students.sylcat)) out.sylcat = students.sylcat.map(e => ({ ...e, id: re(e.id) }));
  return out;
}
export async function importClick() {
  /* Playwright cannot drive the OS file picker and the bundled module
     namespace cannot be patched (its exports are getters), so the smoke suite
     hands a file in through window.__pickOpenForTests instead. */
  const pick = (typeof window !== 'undefined' && window.__pickOpenForTests) || FS.pickOpen;
  const picked = await pick();                 /* no await before this — gesture */
  if (!picked) return;
  /* An import reloads the chart on screen from the store, so its unsaved flow
     edits were lost — and the orange Save changes stayed lit over a chart with
     nothing left to save ([HUMAN-RETEST] Fable #3). Asked AFTER the pick: the
     picker must be the first thing the click does. */
  if (!await leaveFlowEdits('Discard them and bring the file in?')) return;
  let obj; try { obj = JSON.parse(picked.text); } catch (_) { await uiAlert('That file is not readable as JSON.'); return; }
  let parsed; try { parsed = FMT.readFile(obj); } catch (e) { await uiAlert(e.message); return; }
  let norm; try { norm = normalizeImport(parsed); } catch (e) { await uiAlert(e.message); return; }
  const charts = norm.charts;
  const hasCharts = !!(charts && Array.isArray(charts.order) && charts.order.length && charts.syllabi);
  if (!hasCharts && !parsed.contains.students) { await uiAlert('That file holds no charts and no students.'); return; }
  const catById = new Map(((charts && charts.sylcat) || []).map(e => [e.id, e]));
  const addAsNew = Object.create(null);   /* fileId → freshly minted id; students follow */
  const done = [], skipped = [], keptDeleted = [];
  const wanted = Object.create(null);     /* store id → the name the file gives it */
  if (hasCharts) {
    for (const id of charts.order) {
      if (!(charts.syllabi || {})[id]) continue;
      const label = catById.get(id) ? catById.get(id).name : (sylName(id) || id);
      if (!sylEntry(id)) {   /* new here — bring it straight in (colon allowed, §8) */
        await applyCharts(charts, { ids: [id], mode: 'replace' }); done.push(label); wanted[id] = label; continue;
      }
      /* The third answer SKIPS this chart and the import carries on. It read
         "Cancel", so a person pressing it to stop the whole import saw it keep
         going, and the closing report never named the chart left behind
         ([HUMAN-RETEST] W1-7). A press outside the box skips too. */
      const c = await uiChoice(
        '“' + label + '” already exists.\n\nReplace it, or add the incoming one under a new name?',
        'Replace it', 'Add as new', 'Skip this one');
      if (c === 'cancel') { skipped.push(label); continue; }
      if (c === 'ok') {
        await applyCharts(charts, { ids: [id], mode: 'replace' }); done.push(label);
        if (catById.get(id) && catById.get(id).userNamed) wanted[id] = label;
        continue;
      }
      const to = ((await uiPrompt('Name for the incoming syllabus:', label + ' (new)')) || '').trim();
      if (!to || SYLS.some(e => e.name === to)) { await uiAlert('That name is blank or already taken.'); continue; }
      const newId = mintSylId();
      await applyCharts(charts, { ids: [id], mode: 'add', rename: { from: id, to: newId, label: to } });
      addAsNew[id] = newId; done.push(to);
    }
    /* THE FILE'S ORDER. Each chart above comes in on its own (applyCharts with
       `ids`), and only a whole-block applyCharts ever applied the order the file
       saved — a path this button never takes, so export → wipe → import put his
       hand-drawn charts back in the default order (D120; [HUMAN-RETEST] F6). A
       file carrying MORE than one chart is a backup coming home: the charts it
       carries take its order, ahead of any chart it does not carry (a shipped
       built-in he had deleted, say). A ONE-chart file is a chart handed over and
       keeps its place at the end — importing one chart never reshuffles the rest.
       A chart added as new follows its new id. */
    /* A chart that came in while the name it carries was still held by another
       chart here got a " (2)" on it — the file's order decides which lands first
       (a renamed built-in whose old name a copy now wears: [HUMAN-RETEST] W1-6).
       Once every chart is in, give each the name the file gives it if that name
       is free now. */
    let relabelled = false;
    for (const id of Object.keys(wanted)) {
      const e = sylEntry(id), want = wanted[id];
      if (e && e.name !== want && !SYLS.some(x => x.id !== id && x.name === want)) { e.name = want; relabelled = true; }
    }
    if (relabelled) { await saveSylCat(); refreshSyl(); }
    /* the built-ins the backup names as deleted stay deleted (D127): hidden and
       tombstoned exactly as ⇅ Reorder's delete leaves one, so ↺ Restore brings it
       back. Nothing filed under it is swept — a chart import never touches a mark
       (the rule applyCharts keeps) — and the last chart is never taken away. */
    const delInfo = charts.eventInfoBySyl && typeof charts.eventInfoBySyl === 'object' ? charts.eventInfoBySyl : {};
    let delInfoTouched = false;
    for (const id of (Array.isArray(charts.deleted) ? charts.deleted : [])) {
      if (!isBuiltinSylId(id)) continue;
      /* its typed details come home with it, whatever happens to the chart */
      if (delInfo[id]) {
        const shipped = x => shippedDetails(EVENT_INFO, EVENT_INFO_BY_SYL, builtinBaseOf(id), x);
        const merged = mergeBlock(eventInfo[id], delInfo[id], shipped);
        if (Object.keys(merged).length) eventInfo[id] = merged; else delete eventInfo[id];
        delInfoTouched = true;
      }
      if (!sylEntry(id) || orderedSylIds().length <= 1) continue;
      const nm = sylName(id);
      if (curSylId() === id) await switchSylNow(firstOtherSylId(id));
      trkGesture(() => {
        SYLS = SYLS.filter(e => e.id !== id);
        if (!isHidden(id)) SYL_HIDDEN.push(id); SYL_TOMB[id] = 1;
        SYL_ORDER = SYL_ORDER.filter(x => x !== id);
        saveSylCat(); saveSylPrefs(); saveSylOrder();
      });
      keptDeleted.push(nm);
    }
    if (delInfoTouched) await saveEventInfo();
    if (keptDeleted.length) refreshSyl();
    const fileIds = charts.order.filter(id => (charts.syllabi || {})[id]);
    if (fileIds.length > 1) {
      const inFile = fileIds.map(id => (has(addAsNew, id) ? addAsNew[id] : id)).filter(id => sylEntry(id));
      SYL_ORDER = [...inFile, ...SYL_ORDER.filter(id => !inFile.includes(id))];
      await saveSylOrder(); refreshSyl();
    }
  }
  let people = false;
  if (parsed.contains.students && parsed.students) {
    people = await uiConfirm('This file also contains students and marks.\n\nBring them in too? A student already here who is ALSO in the file will have their marks replaced by the file’s. Anyone the file does not name keeps theirs, untouched.');
    /* the student guardrail (§19) lives in applyStudents: a pre-v3 / unresolved
       student block is refused with a plain message; charts (above) still import.
       normalizeImport already reconciled a v3 block through the ONE import map;
       an add-as-new chart composes onto it here so its students follow the new id
       (§CSID2-05). A pre-v3 block (norm.students still name-keyed) is refused. */
    if (people && norm.studentsRefused) {
      /* normalizeImport turned the students away (incomplete / colliding v3 refs),
         but the charts above still imported */
      await uiAlert(STUDENT_GUARD_MSG); people = false;
    } else if (people) {
      /* norm.students is the v3 block reconciled through the ONE import map (or the
         raw pre-v3 block, which the version guardrail refuses in applyStudents). */
      let block = norm.students || parsed.students;
      if (Object.keys(addAsNew).length) {
        block = remapStudentsSyl(block, id => has(addAsNew, id) ? addAsNew[id] : id);
        /* the add-as-new chart got a NEW id AND a new label; refresh the student
           catalogue's label for every id that is now a live store entry, or the
           re-reconcile would see the new id under the SOURCE chart's old name and
           refuse the students as a name clash (review CSID-B01). */
        if (Array.isArray(block.sylcat)) block = { ...block, sylcat: block.sylcat.map(e => (sylEntry(e.id) ? { ...e, name: sylName(e.id) } : e)) };
      }
      try { await applyStudents(block, parsed.links, norm.version); }
      catch (e) { await uiAlert((e && e.message) || 'The students could not be brought in.'); people = false; }
    }
  }
  const what = [done.length ? 'brought in ' + done.join(', ') : null, people ? 'students & marks restored' : null].filter(Boolean).join(' · ');
  if (what) setSaveStatus(what, 'ok');
  const skip = (skipped.length ? '\n\nSkipped, left as they are here: ' + skipped.join(', ') + '.' : '')
    + (keptDeleted.length ? '\n\nDeleted, as in the backup: ' + keptDeleted.join(', ') + ' (↺ Restore in ⇅ Reorder brings ' + (keptDeleted.length === 1 ? 'it' : 'them') + ' back).' : '');
  await uiAlert((what
    ? what.charAt(0).toUpperCase() + what.slice(1) + '.\n\n' + (people ? 'It is saved.' : 'Everyone’s marks are untouched. It is saved.')
    : 'Nothing was brought in.') + skip);
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
  /* Syllabus NAMES → syllabus IDS ([TRK-CSID] 1B-ii), AFTER course ids are
     settled (the student-layer keys the reset clears are v3:<courseId>:…) and
     BEFORE migrateAllCourses/loadCourse. Same fail-closed + one-retry shape. */
  let smig = await migrateSylIds();
  if (!smig) smig = await migrateSylIds();
  if (!smig) {
    loading = false;
    if (!bootError) setBootError('The Tracker could not finish upgrading your syllabus data — the browser did not keep what was written. Reload to try again.');
    return;
  }
  /* Every course, not just the one about to open: an export must never meet a
     course nobody has opened since the upgrade and find stale records. (After
     migrateSylIds these are no-ops — the reset flagged every course.) */
  await migrateAllCourses();
  await loadDelCourses();   /* D128 — after the course-id conversion, which the entries depend on */
  await loadSylPrefs();
  /* the catalogue index (written by the migration), then the boot reconcile
     (add newly-shipped built-ins, repoint base on a shipped rename, respect a
     user relabel) and the id order — all BEFORE loadCourse reads a syllabus. */
  await loadSylCat();
  if (bootError) { loading = false; return; }   /* loadSylCat fails closed on an invalid stored id (CSID-B07) */
  await reconcileBuiltins();
  await loadSylOrder();
  /* After loadCourses + course-id migration, which fill COURSES with {id,name}
     entries — a course that was deleted, renamed, or only ever existed in
     someone else's browser simply fails the membership test and falls back to
     the top of the list. lastCourse is a course id. */
  const __want = prefGet('lastCourse');
  await loadCourse((__want && COURSES.some(c => isCourseEntry(c) && c.id === __want)) ? __want : (COURSES[0] && COURSES[0].id), true);
  await loadEventInfo();
  ready = true;
  /* [ARCH-STACK] phase 5: enable command routing now that every boot migration
     and load has run its raw seed/migration writes. Post-boot user edits emit the
     change stream; boot writes above stayed raw.
     [CMDL-FINISH] C2 — hydrate mem from every known-collection storage key FIRST,
     so a cross-course delete/edit has a real before-image before any command runs. */
  await trkHydrateMem();
  trkRegisterCommands();
  TRK_COMMANDS = true;
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
      applyStudents, whenLoaded, migrateAllCourses, migrateCourseIds, migrateSylIds, SYLLABI, DEFAULT_LAYOUTS,
      rosterNow: () => roster, nameOf, byName, courseIdOf, courseName, curCourseName,
      curSylId, curSylName, sylName, sylIdOf, sylsNow: () => SYLS.slice(),
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
