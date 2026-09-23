/* EVENT DETAILS BELONG TO THE CHART THEY WERE TYPED ON (owner, 23 Sep 26 —
   D126). A detail typed on Tx stays on Tx; 2026's event with the same code
   keeps its own. The same code can be a different sortie on two charts (Tx's
   BFM-5 flies the long course's BFM-7 profile), so one table keyed by event
   code — what this replaced — let a Tx edit rewrite 2026's wording and let an
   import of ONE chart put back details on every other chart ([HUMAN-RETEST]
   W1-8, W1-9; D122).

   The stored shape: { [sylId]: { [eventId]: { name?, fmt?, hrs?, crew?, pre? } } }
   — per chart, ONLY the fields that differ from that chart's shipped wording
   (the base table, then the chart's own profile when it is a built-in). A
   field the user emptied is stored as '' so the emptiness wins over the doc.

   Pure functions, no core.js and no browser: core.js wires them to the store,
   and the tests read them directly. */

export const DETAIL_FIELDS = ['name', 'fmt', 'hrs', 'crew', 'pre'];

const isObj = v => !!v && typeof v === 'object' && !Array.isArray(v);
const own = (o, k) => Object.prototype.hasOwnProperty.call(o, k);

/* What the chart shipped with for one event: the base table, then the
   built-in's own profile on top (a custom chart has no profile). */
export function shippedDetails(EVENT_INFO, EVENT_INFO_BY_SYL, base, id) {
  const prof = base && own(EVENT_INFO_BY_SYL, base) ? EVENT_INFO_BY_SYL[base] : null;
  return Object.assign({}, (own(EVENT_INFO, id) && EVENT_INFO[id]) || {}, (prof && own(prof, id) && prof[id]) || {});
}

/* The fields of `vals` that differ from `shipped` — the override to store, or
   null when there is nothing to keep. Only the five detail fields count. */
export function diffDetails(shipped, vals) {
  const out = {};
  for (const f of DETAIL_FIELDS) {
    if (!isObj(vals) || !own(vals, f)) continue;
    const v = vals[f] == null ? '' : String(vals[f]);
    if (v !== ((shipped && shipped[f]) || '')) out[f] = v;
  }
  return Object.keys(out).length ? out : null;
}

/* One chart's block, cleaned: every entry diffed against that chart's shipped
   wording, empty entries dropped. `shippedOf(eventId)` gives the shipped. */
export function scrubBlock(block, shippedOf) {
  const out = {};
  if (!isObj(block)) return out;
  for (const id of Object.keys(block)) {
    const d = diffDetails(shippedOf(id), block[id]);
    if (d) out[id] = d;
  }
  return out;
}

/* Merge an incoming block into a chart's own, field by field: the incoming
   edits win where they speak, every other typed detail on the chart stays
   (D122: an import never wipes an event's typed details). */
export function mergeBlock(mine, incoming, shippedOf) {
  const out = JSON.parse(JSON.stringify(isObj(mine) ? mine : {}));
  if (isObj(incoming)) {
    for (const id of Object.keys(incoming)) {
      if (!isObj(incoming[id])) continue;
      out[id] = Object.assign({}, out[id] || {}, incoming[id]);
    }
  }
  return scrubBlock(out, shippedOf);
}

/* The OLD one-table shape ({ eventId: fields }, 'v3:eventinfo' and the
   `eventInfo` of a file written before D126) cleaned the way the old build
   cleaned it: a field equal to the plain base table is dropped unless the user
   typed it on purpose (its `__kept` marker). What survives is exactly what the
   old build laid over EVERY chart with that code. */
export function realFlatEdits(flat, EVENT_INFO) {
  const out = {};
  if (!isObj(flat)) return out;
  for (const id of Object.keys(flat)) {
    const o = flat[id]; if (!isObj(o)) continue;
    const base = (own(EVENT_INFO, id) && EVENT_INFO[id]) || {};
    const kept = Array.isArray(o.__kept) ? o.__kept : [];
    const d = {};
    for (const f of DETAIL_FIELDS) {
      if (!own(o, f)) continue;
      const v = o[f] == null ? '' : String(o[f]);
      if (v !== (base[f] || '') || kept.includes(f)) d[f] = v;
    }
    if (Object.keys(d).length) out[id] = d;
  }
  return out;
}

/* One chart's block from old one-table edits: each edit whose event is ON this
   chart, diffed against this chart's shipped wording — so the chart reads
   exactly as the old build showed it, and nothing lands on a chart that does
   not have the event. */
export function blockFromFlat(edits, eventIds, shippedOf) {
  const on = new Set(eventIds || []);
  const pick = {};
  for (const id of Object.keys(edits || {})) if (on.has(id)) pick[id] = edits[id];
  return scrubBlock(pick, shippedOf);
}

/* A file's or the store's per-chart table, shape-checked: an object of
   objects of objects. Anything else reads as damaged. */
export function isDetailsTable(t) {
  if (!isObj(t)) return false;
  for (const sid of Object.keys(t)) {
    if (!isObj(t[sid])) return false;
    for (const id of Object.keys(t[sid])) if (!isObj(t[sid][id])) return false;
  }
  return true;
}
