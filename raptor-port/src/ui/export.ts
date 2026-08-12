/* CSV export — exportCSV and the schedule flattening (schedRows), verbatim. */
import { DAYS } from '../engine/data'
import { PEOPLE } from '../engine/people'
import { minus, parseHM } from '../engine/time'
import { VCONF } from '../engine/rules'
import { STORE_CFG } from '../engine'

/* Excel does not sniff a .csv for UTF-8: with no byte-order mark it decodes the
   file in the machine's ANSI codepage, so every byte of a multi-byte character
   is shown as its own Latin-1 glyph. The en dash the LoX prints in the AAR
   cells a WSO cannot hold reached the spreadsheet as "â€“" — the three UTF-8
   bytes of "–" read one at a time (owner, 5 Aug 26: DAAR and NAAR down the WSO
   rows). A BOM is the only signal that survives the download; a charset in the
   MIME type is a transport header and never reaches the file on disk, so both
   are set and the BOM is the one doing the work.
   Split out from exportCSV because the text is testable and the download is
   not — jsdom has no Blob URL machinery. */
/* A CELL THAT OPENS WITH = + - @ IS A FORMULA TO A SPREADSHEET, not text
   (audit, 12 Aug 26 — HANDOFF has listed this as an open risk since the store
   labels became renamable, and the survey confirmed it is three clicks away
   and PERSISTS: a store named `=1+1` comes back after a reload and rides into
   every export). Quoting is not protection — Excel and Sheets both evaluate a
   quoted leading `=` once the file is opened.
   A leading apostrophe is the standard neutraliser: spreadsheets read it as
   "treat the rest as text" and do not print it, so the cell still READS as the
   squadron typed it. Prefixing beats refusing here, because unlike a bad clock
   there is nothing malformed about naming something `-30` — the danger is in
   the destination, so the fix belongs at the destination.
   The tab and carriage return are in the set because both can carry a payload
   past a naive importer. */
const csvSafe = (v: any) => {
  const s = String(v == null ? '' : v)
  return /^[=+\-@\t\r]/.test(s) ? "'" + s : s
}
export function csvText(rows: any[][]) {
  return '\uFEFF' + rows.map(r => r.map(c => `"${csvSafe(c).replace(/"/g, '""')}"`).join(',')).join('\r\n')
}
export function exportCSV(name: string, rows: any[][]) {
  const blob = new Blob([csvText(rows)], { type: 'text/csv;charset=utf-8' })
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; a.click()
}

export function schedRows() {
  const rows = [['Day', 'Date', 'Wave', 'CS', 'Mission', 'Brief', 'TO', 'Land', 'FCP', 'FCP lvl', 'RCP', 'RCP lvl', 'Area', 'Area time', 'Rmks', 'Stores']]
  DAYS.forEach((d: any) => (d.waves || []).forEach((w: any) => w.formations.forEach((f: any) => f.aircraft.forEach((a: any) => {
    const F = PEOPLE[a.p] || {}, W = PEOPLE[a.w] || {}, o = a.opts || {}
    const st = STORE_CFG.filter(([k]) => o[k]).map(([, lab]) => lab).concat(o.bombs ? [o.bombs] : []).join(' ')
    const at = f.atime != null ? f.atime : (a.area ? `${f.to.replace(':', '')}-${f.ld.replace(':', '')}` : '')
    /* the INDICATED brief (owner, 6 Aug 26) wins when the scheduler has typed
       one; live VCONF.briefLead is only the fallback for a blank line, and
       that fallback still has to agree with the rule the engine validates
       against, so it stays computed rather than hard-coded. */
    const brief = parseHM(f.br) != null ? f.br : minus(f.to, VCONF.briefLead)
    rows.push([d.dow, d.dt, w.label, f.cs, f.msn, brief, f.to, f.ld, F.cs || '', F.q || '', W.cs || '', W.q || '', a.area || '', at, a.rmks || '', st])
  }))))
  return rows
}
