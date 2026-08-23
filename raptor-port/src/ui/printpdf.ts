/* The schedule's PDF export — via the browser's own print pipeline, because a
   client-side PDF library would be the first heavyweight dependency in a repo
   that has none, and "Save as PDF" in the print dialog gives the squadron a
   real file with zero bytes shipped. A hidden iframe gets a complete
   standalone document (its OWN stylesheet, never the app's — the dark theme,
   chips and pucks are screen furniture, not paperwork) and prints itself; the
   layout is deliberately basic for now — a plain black-on-white table the
   owner can iterate on once he's seen it on paper (owner, 23 Aug 26).
   schedPrintHTML is split from printSchedPDF for the same reason csvText is
   split from exportCSV: the text is testable and the print dialog is not. */
import { esc } from '../state/view'
import { DAYS } from '../engine/data'
import { schedRows } from './export'

export function schedPrintHTML(rows: any[][], weekLabel: string): string {
  const [head, ...body] = rows
  const th = (head || []).map((c: any) => `<th>${esc(c)}</th>`).join('')
  let prevDay: any = null
  const trs = body.map(r => {
    /* a heavier top border where the day changes — the flattened rows carry
       the day name in column 0, so a first-cell change IS a day boundary */
    const cls = prevDay != null && r[0] !== prevDay ? ' class="dayrow"' : ''
    prevDay = r[0]
    return `<tr${cls}>${r.map((c: any) => `<td>${esc(c)}</td>`).join('')}</tr>`
  }).join('')
  return `<!doctype html><html><head><meta charset="utf-8"><title>142 Schedule — ${esc(weekLabel)}</title><style>
@page{size:landscape;margin:10mm}
body{font-family:system-ui,-apple-system,'Segoe UI',sans-serif;color:#000;background:#fff;margin:0}
h1{font-size:14px;margin:0 0 2px}
.sub{font-size:10px;margin:0 0 8px}
table{border-collapse:collapse;width:100%;font-size:9px}
th,td{border:1px solid #888;padding:2px 4px;text-align:left;vertical-align:top}
th{border-color:#000;background:#eee}
thead{display:table-header-group}
tr.dayrow td{border-top:2px solid #000}
</style></head><body><h1>142 SQN — Flying Programme</h1><div class="sub">${esc(weekLabel)}</div><table><thead><tr>${th}</tr></thead><tbody>${trs}</tbody></table></body></html>`
}

export function printSchedPDF(): void {
  if (typeof document === 'undefined') return
  /* "Mon 13 Jul – Sun 19 Jul" from the loaded week's first and last day —
     dow is the full word ('Monday'), dt is 'Jul 13', so flip dt to day-first */
  const lbl = (d: any) => {
    const [mon, num] = String(d.dt || '').split(' ')
    return `${String(d.dow || '').slice(0, 3)} ${num || ''} ${mon || ''}`.trim()
  }
  const a = DAYS[0], b = DAYS[DAYS.length - 1]
  const weekLabel = a && b ? `${lbl(a)} – ${lbl(b)}` : ''
  const html = schedPrintHTML(schedRows(), weekLabel)
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
