/* THE BAKE — his chart loop (R26: he exports charts, a session bakes them into the shipped
   charts, he imports the charts-only file he gets back), as a pure function so a test can run
   it on a file the app itself exported ([TRK-BAKE-STALE], 28 Sep 26). The command that reads
   and writes the data files is bake-user-charts.mjs, beside this.

   It had not run since the charts got ids (13 Sep 26) and their details became per chart (D126):
   it looked for `src/data/` from the wrong folder, read name-keyed charts and one shared details
   table. Now, from a CURRENT (v3) file — an older one is refused, because the file baked is one
   he has just exported (D120):
   - each BUILT-IN chart in the file (an `sb…` id; its shipped name from BUILTIN_SYL) replaces
     that chart's events and layout — the layout WHOLE, its drawn lines, merges and fonts too;
   - the file's details for that chart are DIFFS over its shipped wording (collectCharts,
     D126): each is laid over the shipped wording and kept in EVENT_INFO_BY_SYL under the
     chart's name, as far as it differs from the base table — never in the base EVENT_INFO,
     which every chart shares;
   - a chart made in the app (`sc…`) is not a built-in: reported, not baked;
   - a built-in the file does not carry is left as it is (absence is not an instruction to
     delete — the old script's rule), and reported;
   - the shipped order: the baked built-ins take the slots they already have, in the FILE's
     order, so a file of one chart moves nothing and a file of all four sets the order;
   - every event must have a position, or the bake stops;
   - no student name may reach the shipped data: a name from the file's roster found in what
     would be written stops the bake (the file may carry students; they are never baked). */
import { readFile } from '../../src/tracker/app/fileFormat.js'
import { BUILTIN_SYL, builtinSylById } from '../../src/tracker/app/sylIds.js'
import { shippedDetails } from '../../src/tracker/app/eventDetails.js'

const copy = o => JSON.parse(JSON.stringify(o))

export function bakeCharts(raw, data) {
  const f = readFile(raw)
  if (f.version < 3) throw new Error('That file is older than the current format — export a fresh one from the app, then bake that.')
  const ch = f.charts
  if (!ch || !Array.isArray(ch.order) || !ch.order.length) throw new Error('That file carries no charts.')
  const out = {
    SYLLABI: copy(data.SYLLABI), DEFAULT_LAYOUTS: copy(data.DEFAULT_LAYOUTS),
    EVENT_INFO: copy(data.EVENT_INFO), EVENT_INFO_BY_SYL: copy(data.EVENT_INFO_BY_SYL),
    DEFAULT_SYL_ORDER: copy(data.DEFAULT_SYL_ORDER),
  }
  const report = { baked: [], custom: [], untouched: [], deleted: [], details: [] }
  const catName = id => ((ch.sylcat || []).find(e => e && e.id === id) || {}).name || id
  const inFile = new Set(ch.order)
  const tomb = new Set(Array.isArray(ch.deleted) ? ch.deleted : [])
  for (const id of ch.order) {
    const b = builtinSylById(id)
    if (!b) { report.custom.push(catName(id)); continue }
    const name = b.name
    const events = ch.syllabi && ch.syllabi[id]
    if (!Array.isArray(events)) throw new Error(`${name}: the file names it but carries no events.`)
    const lay = (ch.layouts && ch.layouts[id]) || {}
    const miss = events.map(e => e && e.id).filter(eid => !lay[eid] || typeof lay[eid].x !== 'number' || typeof lay[eid].y !== 'number')
    if (miss.length) throw new Error(`${name}: ${miss.length} event(s) with no position: ${miss.slice(0, 6).join(', ')} — place them on the chart, export again.`)
    out.SYLLABI[name] = copy(events)
    out.DEFAULT_LAYOUTS[name] = copy(lay)
    const diffs = (ch.eventInfoBySyl && ch.eventInfoBySyl[id]) || {}
    for (const [eid, fields] of Object.entries(diffs)) {
      if (!fields || typeof fields !== 'object') continue
      const merged = { ...shippedDetails(data.EVENT_INFO, data.EVENT_INFO_BY_SYL, name, eid), ...fields }
      const base = data.EVENT_INFO[eid] || {}
      const prof = {}
      for (const k of Object.keys(merged)) if ((merged[k] || '') !== (base[k] || '')) prof[k] = merged[k]
      const block = out.EVENT_INFO_BY_SYL[name] = out.EVENT_INFO_BY_SYL[name] || {}
      if (Object.keys(prof).length) block[eid] = prof; else delete block[eid]
      report.details.push(name + ' · ' + eid)
    }
    /* A ball no longer on the chart leaves nothing behind (D130). The rest of the chart's
       shipped details are KEPT: the file carries only what differs from the wording the app
       ships — an earlier bake included — so a detail the file leaves out is exactly what the
       app shows (Astra's final read, 28 Sep 26; rebuilding the block from the file alone
       would have wiped every earlier bake). */
    const onChart = new Set(events.map(e => e && e.id))
    const kept = out.EVENT_INFO_BY_SYL[name]
    if (kept) {
      for (const eid of Object.keys(kept)) if (!onChart.has(eid)) delete kept[eid]
      if (!Object.keys(kept).length) delete out.EVENT_INFO_BY_SYL[name]
    }
    report.baked.push(name)
  }
  for (const b of BUILTIN_SYL) if (!inFile.has(b.id)) (tomb.has(b.id) ? report.deleted : report.untouched).push(b.name)
  /* the order: the baked ones take the slots they have, in the file's order */
  const slots = out.DEFAULT_SYL_ORDER.map((n, i) => report.baked.includes(n) ? i : -1).filter(i => i >= 0)
  const newcomers = report.baked.filter(n => !out.DEFAULT_SYL_ORDER.includes(n))
  report.baked.filter(n => out.DEFAULT_SYL_ORDER.includes(n)).forEach((n, k) => { out.DEFAULT_SYL_ORDER[slots[k]] = n })
  out.DEFAULT_SYL_ORDER.push(...newcomers)
  /* no student name in what would be written */
  const names = new Set()
  const byCourse = (f.students && f.students.byCourse) || {}
  for (const c of Object.values(byCourse)) for (const s of Object.values((c && c.bySyllabus) || {}))
    for (const e of ((s && s.roster) || [])) { const n = typeof e === 'string' ? e : e && e.name; if (n && String(n).trim()) names.add(String(n).trim()) }
  if (names.size) {
    const written = JSON.stringify([out.SYLLABI, out.DEFAULT_LAYOUTS, out.EVENT_INFO_BY_SYL, out.DEFAULT_SYL_ORDER])
    const leaked = [...names].filter(n => written.includes(n))
    if (leaked.length) throw new Error('A student name would reach the shipped charts (' + leaked.join(', ') + ') — nothing was baked.')
  }
  report.namesChecked = names.size
  return { out, report }
}
