/* The schedule's PDF export — via the browser's own print pipeline, because a
   client-side PDF library would be the first heavyweight dependency in a repo
   that has none, and "Save as PDF" in the print dialog gives the squadron a
   real file with zero bytes shipped. A hidden iframe gets a complete standalone
   document (its OWN stylesheet, never the app's — the dark theme, chips and
   pucks are screen furniture, not paperwork) and prints itself.

   REDESIGN (owner, 16 Sep 26 — [FLAG-EXPORT]): the export is a REPORTING tool to
   an agency, not a planning grid. So: white background, ONE clean per-day layout
   (not the planning sheet's many coloured grids), no personnel-roster columns
   (schedRows never had them), and the PUBLISHED version of each day (publishedDays)
   — a scheduler's in-progress working copy must not go out as the signed record.
   schedPrintHTML is split from printSchedPDF because the text is testable and the
   print dialog is not. */
import { esc } from '../state/view'
import { DAYS } from '../engine/data'
import { schedRows, publishedDays, dayIssuedLabel } from './export'

const HEAD = ['Day', 'Date', 'Wave', 'CS', 'Mission', 'Brief', 'TO', 'Land', 'FCP', 'FCP lvl', 'RCP', 'RCP lvl', 'Area', 'Area time', 'Rmks', 'Stores']
/* column index by header name, so the report reads by meaning not position */
const IX: Record<string, number> = {}; HEAD.forEach((h, i) => (IX[h] = i))

/* one flying line as a report row: crew folded to "CALLSIGN (LVL)", times grouped,
   remarks + stores together. The planning sheet's front/back seat columns become a
   single readable Crew cell — an agency reads names, not a seat matrix. */
function crewCell(cs: string, lvl: string) {
  if (!cs) return ''
  return lvl ? `${esc(cs)} <span class="lvl">${esc(lvl)}</span>` : esc(cs)
}

export function schedPrintHTML(rows: any[][], weekLabel: string, dayLabel?: (dayName: string) => string): string {
  const body = rows.slice(1)
  /* group the flat rows by day (column 0 carries the day name) — one titled block
     per day, the report's single clean layout instead of one long table. */
  const byDay: { day: string; date: string; lines: any[][] }[] = []
  body.forEach(r => {
    const day = r[IX['Day']], date = r[IX['Date']]
    let g = byDay[byDay.length - 1]
    if (!g || g.day !== day) { g = { day, date, lines: [] }; byDay.push(g) }
    g.lines.push(r)
  })
  const th = ['Wave', 'CS / Mission', 'Brief', 'T/O', 'Land', 'FCP', 'RCP', 'Area', 'Time', 'Remarks', 'Stores']
    .map(h => `<th>${esc(h)}</th>`).join('')
  const blocks = byDay.map(g => {
    const stamp = dayLabel ? dayLabel(g.day) : ''
    const trs = g.lines.map(r => `<tr>`
      + `<td class="wv">${esc(r[IX['Wave']])}</td>`
      + `<td class="csm"><b>${esc(r[IX['CS']])}</b>${r[IX['Mission']] ? `<span class="msn">${esc(r[IX['Mission']])}</span>` : ''}</td>`
      + `<td class="t">${esc(r[IX['Brief']])}</td>`
      + `<td class="t">${esc(r[IX['TO']])}</td>`
      + `<td class="t">${esc(r[IX['Land']])}</td>`
      + `<td>${crewCell(r[IX['FCP']], r[IX['FCP lvl']])}</td>`
      + `<td>${crewCell(r[IX['RCP']], r[IX['RCP lvl']])}</td>`
      + `<td>${esc(r[IX['Area']])}</td>`
      + `<td class="t">${esc(r[IX['Area time']])}</td>`
      + `<td class="rmk">${esc(r[IX['Rmks']])}</td>`
      + `<td class="rmk">${esc(r[IX['Stores']])}</td>`
      + `</tr>`).join('')
    return `<section class="day">`
      + `<div class="dhead"><h2>${esc(g.day)} <span class="date">${esc(g.date)}</span></h2>`
      + (stamp ? `<span class="stamp">${esc(stamp)}</span>` : '')
      + `</div>`
      + (g.lines.length
        ? `<table><thead><tr>${th}</tr></thead><tbody>${trs}</tbody></table>`
        : `<div class="none">No flying programmed.</div>`)
      + `</section>`
  }).join('')
  const now = new Date()
  const gen = `${String(now.getDate()).padStart(2, '0')} ${now.toLocaleString('en', { month: 'short' })} ${now.getFullYear()}, ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
  return `<!doctype html><html><head><meta charset="utf-8"><title>142 SQN Flying Programme — ${esc(weekLabel)}</title><style>
@page{size:A4 portrait;margin:14mm 12mm}
*{box-sizing:border-box}
body{font-family:'Segoe UI',system-ui,-apple-system,Arial,sans-serif;color:#1a1a1a;background:#fff;margin:0;font-size:10px;line-height:1.35}
.mark{text-align:center;font-size:9px;letter-spacing:.18em;font-weight:700;color:#b00;margin:0 0 6px}
header{border-bottom:2px solid #1a1a1a;padding-bottom:8px;margin-bottom:12px}
header h1{font-size:16px;font-weight:800;letter-spacing:.02em;margin:0}
header .wk{font-size:11px;font-weight:600;color:#333;margin-top:2px}
header .gen{font-size:8.5px;color:#777;margin-top:2px}
section.day{margin:0 0 12px;break-inside:avoid}
.dhead{display:flex;align-items:baseline;justify-content:space-between;border-bottom:1px solid #cfcfcf;margin-bottom:4px;padding-bottom:2px}
.dhead h2{font-size:12px;font-weight:700;margin:0}
.dhead h2 .date{font-size:10px;font-weight:500;color:#666;margin-left:6px}
.dhead .stamp{font-size:8px;font-weight:700;letter-spacing:.04em;text-transform:uppercase;color:#2c6e49;border:1px solid #b7d8c5;background:#eef7f1;border-radius:3px;padding:1px 7px}
table{border-collapse:collapse;width:100%}
th{font-size:8px;font-weight:700;letter-spacing:.03em;text-transform:uppercase;color:#555;text-align:left;padding:3px 6px;border-bottom:1.5px solid #999;background:#f5f5f5}
td{padding:4px 6px;border-bottom:1px solid #e4e4e4;vertical-align:top}
td.t{font-variant-numeric:tabular-nums;white-space:nowrap}
td.wv{font-weight:600;color:#444;white-space:nowrap}
td.csm b{font-weight:700}
td.csm .msn{color:#666;margin-left:5px}
td .lvl{font-size:8px;color:#888;font-weight:600}
td.rmk{color:#333}
.none{font-size:9.5px;color:#999;font-style:italic;padding:2px 0 4px}
tbody tr:nth-child(even) td{background:#fafafa}
</style></head><body>
<div class="mark">RESTRICTED</div>
<header><h1>142 SQN — Flying Programme</h1><div class="wk">${esc(weekLabel)}</div><div class="gen">Generated ${esc(gen)} · published schedule</div></header>
${blocks}
<div class="mark" style="margin-top:10px">RESTRICTED</div>
</body></html>`
}

export function printSchedPDF(): void {
  if (typeof document === 'undefined') return
  /* OWNER RULING 17 Sep 26: an export is NOT a boundary event. This is a
     scheduler-only snapshot of the current published schedule — it does not
     constrain undo, so it reports nothing. The old discloseCurrentIssued() call
     here is gone; see state/disclosure.ts. */
  /* "Mon 13 Jul – Sun 19 Jul" from the loaded week's first and last day —
     dow is the full word ('Monday'), dt is 'Jul 13', so flip dt to day-first */
  const lbl = (d: any) => {
    const [mon, num] = String(d.dt || '').split(' ')
    return `${String(d.dow || '').slice(0, 3)} ${num || ''} ${mon || ''}`.trim()
  }
  const a = DAYS[0], b = DAYS[DAYS.length - 1]
  const weekLabel = a && b ? `${lbl(a)} – ${lbl(b)}` : ''
  /* the PUBLISHED version of each day, with a per-day signed/working stamp */
  const dayIx: Record<string, number> = {}; DAYS.forEach((d: any, i: number) => (dayIx[d.dow] = i))
  const html = schedPrintHTML(schedRows(publishedDays()), weekLabel, (dayName) => dayIssuedLabel(dayIx[dayName] ?? -1))
  const f = document.createElement('iframe')
  f.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0'
  const cleanup = () => { try { f.remove() } catch { /* already gone */ } }
  f.addEventListener('load', () => {
    try { f.contentWindow!.focus(); f.contentWindow!.print() } catch { /* jsdom has no print */ }
    /* the iframe has to outlive the dialog or Chrome prints a blank page;
       afterprint is the real signal, the timeout the fallback for browsers
       that never fire it on an iframe's window */
    try { window.addEventListener('afterprint', cleanup, { once: true }) } catch { /* no-op */ }
    setTimeout(cleanup, 60000)
  })
  document.body.appendChild(f)
  if ('srcdoc' in f) f.srcdoc = html
  else {
    const d = (f as HTMLIFrameElement).contentDocument
    if (d) { d.open(); d.write(html); d.close() }
  }
}
