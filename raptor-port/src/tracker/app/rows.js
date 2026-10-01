// src/tracker/app/rows.js
/* THE TRACKER ONE PIECE PER THING ([DB-READINESS] group A, phase 5b — owner D462, 30 Sep 26: "every Tracker record that
   holds several people's or several charts' work is saved one piece per thing, like the rest of the app, before the IT
   team settles its tables"; D464 — his charts, syllabi and every ball's typed details are his own work and are KEPT).

   The Tracker keeps its own records and their names — `v3:courses`, a course and chart's student list
   `v3:<course>:<chart>:roster`, the chart records under `v3:master:` — and every caller in core.js still reads and
   writes them whole. What changes is how each is STORED: as one row per thing, the shape of the design's tables
   (docs/data-model.md §3, §5):
   - a student list      → one row per enrolment   `v3:<course>:<chart>:enr:<id>`  = the entry + its place   (Enrolment)
   - the course list and
     the deleted courses → one row per course      `v3:master:course:<id>`         = { id, name, ord, deleted? } (Course)
   - the charts: their definitions, names, order, hidden and deleted marks
                         → one row per chart       `v3:master:chart:<id>`          = the catalogue entry + ord,
                                                                                    hidden, tomb, def        (Syllabus)
   - the details typed on the balls
                         → one row per chart+ball  `v3:master:info:<chart>:<ball>` = the ball's typed fields  (TrainingEvent)
   Order lives on the row (`ord`, sparse and stable, read by (ord, id) — the rest of the app's rule, command/ord.ts).

   THIS MODULE IS THE ONE CONVERSION, pure (no storage, no core.js): core.js's storage door, the fold that converts a
   browser's old records once at boot (src/tracker/fold.ts), and the tests all use it, so they cannot drift apart.
   - `splitValue` turns a record's new value into the rows that CHANGE, compared with the rows given — the rows THIS
     client last read. A row it never read is never removed, a row it did not change is never written: two people's work
     on two different things never overwrites (plan §2.2 — deletes only from a command's own change).
   - `joinRows` turns the rows back into the record, exactly as core.js has always read it.
   - A row that cannot be read is left alone: never read, never removed.
   - A record that is not in the shape rows need (a list of bare names from before the ids, a doubled id, an id that
     could not be a key) is NOT split: `splitValue` answers null and the caller keeps it whole, as before (the old
     upgrades read it so — D120). */
import { mintOrd, byOrd } from '../../command/ord';

export const ROW = { course: 'v3:master:course:', chart: 'v3:master:chart:', info: 'v3:master:info:' };

const CHART_KINDS = ['sylcat', 'sylorder', 'sylhidden', 'syltomb', 'syls'];
const SYL_ID = /^s[bc][0-9a-z]+$/;
const COURSE_ID = /^c[0-9a-z]+$/;
const has = (o, k) => Object.prototype.hasOwnProperty.call(o, k);
const isObj = v => !!v && typeof v === 'object' && !Array.isArray(v);
const safeId = v => typeof v === 'string' && v !== '' && v.indexOf(':') < 0;
function parse(s) { try { return JSON.parse(s); } catch (_) { return undefined; } }

/** The split record a key names, or null. `prefix` is where its rows live. */
export function logicalOf(k) {
  if (typeof k !== 'string') return null;
  if (k === 'v3:courses') return { kind: 'courses', key: k, prefix: ROW.course };
  if (k === 'v3:delcourses') return { kind: 'delcourses', key: k, prefix: ROW.course };
  if (k === 'v3:master:eventinfo') return { kind: 'eventinfo', key: k, prefix: ROW.info };
  if (k.startsWith('v3:master:')) {
    const kind = k.slice('v3:master:'.length);
    return CHART_KINDS.includes(kind) ? { kind, key: k, prefix: ROW.chart } : null;
  }
  const m = /^v3:([^:]+):([^:]+):roster$/.exec(k);
  if (m && m[1] !== 'master') return { kind: 'roster', key: k, prefix: 'v3:' + m[1] + ':' + m[2] + ':enr:', c: m[1], syl: m[2] };
  return null;
}
/** Is this a row of a split record? (course, enrolment, chart or ball-details row) */
export function isRowKey(k) {
  if (typeof k !== 'string') return false;
  if (k.startsWith(ROW.course) || k.startsWith(ROW.chart) || k.startsWith(ROW.info)) return true;
  const p = k.split(':');
  return p.length === 5 && p[0] === 'v3' && p[3] === 'enr';
}
/** What a record reads as when nothing of it is stored: an empty list or table — the details alone as nothing, so
    their one-time conversion from the older one-table record can tell "never converted" from "converted, empty". */
export function emptyOf(L) {
  if (L.kind === 'eventinfo') return null;
  return (L.kind === 'syltomb' || L.kind === 'syls') ? '{}' : '[]';
}

/* ---- reading a family of rows ---- */
/* the rows of a family that can be read: [{ key, id, row }] — a row whose JSON is broken, or whose id is not the one
   its key names, is left out (and so never removed either) */
function readable(L, fam) {
  const out = [];
  for (const [key, s] of fam) {
    if (!key.startsWith(L.prefix)) continue;
    const rest = key.slice(L.prefix.length);
    if (L.kind === 'eventinfo') {
      const i = rest.indexOf(':'); if (i <= 0) continue;
      const syl = rest.slice(0, i); let ev;
      try { ev = decodeURIComponent(rest.slice(i + 1)); } catch (_) { continue; }
      const v = parse(s); if (!SYL_ID.test(syl) || !isObj(v)) continue;
      out.push({ key, syl, ev, row: v });
      continue;
    }
    const v = parse(s);
    if (!isObj(v) || v.id !== rest) continue;
    out.push({ key, id: rest, row: v });
  }
  return out;
}
const byRowOrd = byOrd(r => r.id);
const sortRows = list => list.slice().sort((a, b) => byRowOrd(a.row, b.row));
const without = (o, drop) => { const c = {}; for (const k of Object.keys(o)) if (!drop.includes(k)) c[k] = o[k]; return c; };

/* the chart row's parts: the catalogue entry (every field but the row's own), its place, hidden, deleted, events */
const CHART_OWN = ['ord', 'hidden', 'tomb', 'def'];
function chartParts(row) {
  const entry = typeof row.name === 'string' ? without(row, CHART_OWN) : null;
  return { entry, ord: row.ord, hidden: row.hidden === true, tomb: has(row, 'tomb') ? row.tomb : undefined, def: has(row, 'def') ? row.def : undefined };
}
function chartRow(id, p) {
  const o = p.entry ? Object.assign({}, p.entry, { id }) : { id };
  if (typeof p.ord === 'number') o.ord = p.ord;
  if (p.hidden) o.hidden = true;
  if (p.tomb !== undefined) o.tomb = p.tomb;
  if (p.def !== undefined) o.def = p.def;
  return Object.keys(o).length === 1 ? null : o;   /* nothing left on it: the chart has no row */
}

/** The record, rebuilt from its rows (the string core.js has always read), or null when the rows hold none of it. */
export function joinRows(L, fam) {
  const rows = readable(L, fam);
  switch (L.kind) {
    case 'roster':
      return rows.length ? JSON.stringify(sortRows(rows).map(r => without(r.row, ['ord']))) : null;
    case 'courses': case 'delcourses': {
      const del = L.kind === 'delcourses';
      const mine = rows.filter(r => (r.row.deleted === true) === del);
      return mine.length ? JSON.stringify(sortRows(mine).map(r => without(r.row, ['ord', 'deleted']))) : null;
    }
    case 'eventinfo': {
      if (!rows.length) return null;
      const out = {};
      for (const r of rows.slice().sort((a, b) => (a.key < b.key ? -1 : a.key > b.key ? 1 : 0))) (out[r.syl] || (out[r.syl] = {}))[r.ev] = r.row;
      return JSON.stringify(out);
    }
  }
  /* the chart records: each is one part of every chart row */
  const parts = sortRows(rows).map(r => ({ id: r.id, p: chartParts(r.row) }));
  switch (L.kind) {
    case 'sylcat': { const l = parts.filter(x => x.p.entry); return l.length ? JSON.stringify(l.map(x => x.p.entry)) : null; }
    case 'sylorder': { const l = parts.filter(x => typeof x.p.ord === 'number'); return l.length ? JSON.stringify(l.map(x => x.id)) : null; }
    case 'sylhidden': { const l = parts.filter(x => x.p.hidden); return l.length ? JSON.stringify(l.map(x => x.id)) : null; }
    case 'syltomb': { const l = parts.filter(x => x.p.tomb !== undefined); if (!l.length) return null; const o = {}; for (const x of l) o[x.id] = x.p.tomb; return JSON.stringify(o); }
    case 'syls': { const l = parts.filter(x => x.p.def !== undefined); if (!l.length) return null; const o = {}; for (const x of l) o[x.id] = x.p.def; return JSON.stringify(o); }
  }
  return null;
}

/* ---- writing ---- */
/* a list's rows with their places: the place each already has (from `prev`, by id) is kept while it still sits in
   order; a new or moved row takes one from its neighbours (command/ord.ts) */
function placed(list, prevOrd, idOf) {
  const rows = list.map(e => { const r = Object.assign({}, e); delete r.ord; const o = prevOrd.get(idOf(e)); if (typeof o === 'number') r.ord = o; return r; });
  mintOrd(rows, idOf);
  return rows;
}
/* the change: every key whose string differs, and a null for each key to remove */
function diff(fam, next, removable) {
  const ch = new Map();
  for (const [k, v] of next) if (fam.get(k) !== v) ch.set(k, v);
  for (const k of removable) if (!next.has(k)) ch.set(k, null);
  return ch;
}
function uniqueIds(list, idOf) { const s = new Set(); for (const e of list) { const i = idOf(e); if (s.has(i)) return false; s.add(i); } return true; }

/** The rows a record's new value CHANGES, compared with `fam` (the rows this client last read) — a Map of key →
    row string, or null for a row to remove. Null (no Map) when the value is not in a shape rows can hold. */
export function splitValue(L, value, fam) {
  const v = parse(value);
  if (v === undefined) return null;
  const rows = readable(L, fam);
  switch (L.kind) {
    case 'roster': {
      if (!Array.isArray(v) || !v.every(e => isObj(e) && safeId(e.id) && typeof e.name === 'string') || !uniqueIds(v, e => e.id)) return null;
      const prev = new Map(rows.map(r => [r.id, r.row.ord]));
      const next = new Map(placed(v, prev, e => e.id).map(r => [L.prefix + r.id, JSON.stringify(r)]));
      return diff(fam, next, rows.map(r => r.key));
    }
    case 'courses': case 'delcourses': {
      const del = L.kind === 'delcourses';
      if (!Array.isArray(v) || !v.every(e => isObj(e) && typeof e.id === 'string' && COURSE_ID.test(e.id) && typeof e.name === 'string') || !uniqueIds(v, e => e.id)) return null;
      const mine = rows.filter(r => (r.row.deleted === true) === del);
      const prev = new Map(mine.map(r => [r.id, r.row.ord]));
      const next = new Map(placed(v.map(e => without(e, ['deleted'])), prev, e => e.id).map(r => [ROW.course + r.id, JSON.stringify(del ? Object.assign(r, { deleted: true }) : r)]));
      return diff(fam, next, mine.map(r => r.key));
    }
    case 'eventinfo': {
      if (!isObj(v)) return null;
      const next = new Map();
      for (const syl of Object.keys(v)) {
        if (!SYL_ID.test(syl) || !isObj(v[syl])) return null;
        for (const ev of Object.keys(v[syl])) { if (!isObj(v[syl][ev])) return null; next.set(ROW.info + syl + ':' + encodeURIComponent(ev), JSON.stringify(v[syl][ev])); }
      }
      return diff(fam, next, rows.map(r => r.key));
    }
  }
  /* the chart records: replace ONE part of every chart row, keep the rest */
  const part = new Map();   /* id → this record's part for that chart */
  if (L.kind === 'sylcat') {
    if (!Array.isArray(v) || !v.every(e => isObj(e) && typeof e.id === 'string' && SYL_ID.test(e.id) && typeof e.name === 'string') || !uniqueIds(v, e => e.id)) return null;
    for (const e of v) part.set(e.id, without(e, CHART_OWN));
  } else if (L.kind === 'sylorder' || L.kind === 'sylhidden') {
    if (!Array.isArray(v) || !v.every(id => typeof id === 'string' && SYL_ID.test(id))) return null;
    const ids = [...new Set(v)];
    if (L.kind === 'sylhidden') for (const id of ids) part.set(id, true);
    else {
      const prev = new Map(rows.map(r => [r.id, r.row.ord]));
      for (const r of placed(ids.map(id => ({ id })), prev, e => e.id)) part.set(r.id, r.ord);
    }
  } else {   /* syltomb, syls: a table keyed by chart id */
    if (!isObj(v) || !Object.keys(v).every(id => SYL_ID.test(id))) return null;
    for (const id of Object.keys(v)) part.set(id, v[id]);
  }
  const field = { sylcat: 'entry', sylorder: 'ord', sylhidden: 'hidden', syltomb: 'tomb', syls: 'def' }[L.kind];
  const off = { entry: null, ord: undefined, hidden: false, tomb: undefined, def: undefined }[field];
  const next = new Map(), removable = [];
  const ids = new Set([...rows.map(r => r.id), ...part.keys()]);
  const known = new Map(rows.map(r => [r.id, r]));
  for (const id of ids) {
    const r = known.get(id);
    if (!r && fam.has(ROW.chart + id)) continue;   /* a row of this chart that cannot be read: left alone */
    const p = r ? chartParts(r.row) : { entry: null, ord: undefined, hidden: false, tomb: undefined, def: undefined };
    p[field] = part.has(id) ? part.get(id) : off;
    const row = chartRow(id, p);
    if (row) next.set(ROW.chart + id, JSON.stringify(row));
    else if (r) removable.push(r.key);
  }
  return diff(fam, next, removable);
}

/** The one-time conversion of a browser's old records (the fold's `tracker` converter, src/tracker/fold.ts): every old
    record that can be split becomes its rows and is removed; one that cannot is left exactly as it is; everything else
    — layouts, marks, dates, pace, lulls, plans, flags — is not touched. `old` is the Tracker's stored records, key →
    string. Returns the entries to write: { id, value } (value null = remove). */
export function foldTracker(old) {
  const cur = new Map(Object.entries(old || {}));
  const out = new Map();
  const set = (k, v) => { out.set(k, v); if (v === null) cur.delete(k); else cur.set(k, v); };
  /* the chart records one after another onto the same chart rows; the course lists onto the course rows */
  const keys = [...cur.keys()].filter(k => logicalOf(k)).sort();
  let details = false;
  for (const k of keys) {
    const L = logicalOf(k), v = cur.get(k);
    if (v == null || v === '') { set(k, null); continue; }
    const fam = new Map([...cur].filter(([kk]) => kk.startsWith(L.prefix)));
    const ch = splitValue(L, v, fam);
    if (!ch) continue;
    for (const [rk, rv] of ch) set(rk, rv);
    set(k, null);
    if (L.kind === 'eventinfo') details = true;
  }
  /* the details are in their new form now, even if empty: an older one-table record is never read again (core.js
     loadEventInfo) */
  if (details && cur.get('v3:eventinfomig') !== '1') set('v3:eventinfomig', '1');
  return [...out].map(([id, value]) => ({ id, value }));
}
