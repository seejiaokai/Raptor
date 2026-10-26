// The look card's picture for [KBS-PHONE-SLIDE] (his recordings of 25 Oct 26 11:49 and 11:54): his screen as the keys
// come up over the input window, Remarks tapped — the build he tested on the left, the fixed one on the right, three
// moments of the slide, the page behind the window ringed where it shows. Frames from kbs-slide-walk.mjs FRAMES=1.
// Usage (from raptor-port/): node scripts/handpass/kbs-slide-look.mjs
import { chromium } from 'playwright'
import { readdirSync, readFileSync, writeFileSync } from 'node:fs'
const DIR = 'docs/img/handpass/2026-10-25-kbs-slide'
const near = (side, t) => {
  const fs = readdirSync(`${DIR}/${side}/frames`).filter(f => f.startsWith('A-up-'))
  const best = fs.map(f => [Math.abs(Number(f.slice(5, 8)) - t), f]).sort((a, b) => a[0] - b[0])[0][1]
  return { ms: Number(best.slice(5, 8)), data: readFileSync(`${DIR}/${side}/frames/${best}`).toString('base64') }
}
const MOMENTS = [60, 95, 130]
const rows = MOMENTS.map(t => [near('before', t), near('after', t)])
const b = await chromium.launch()
const p = await b.newPage()
const png = await p.evaluate(async rows => {
  const CW = 402, CH = 470, S = 1.5, pad = 14, head = 64, lab = 30
  const c = document.createElement('canvas'); c.width = Math.round(2 * CW * S + 3 * pad); c.height = Math.round(head + rows.length * (CH * S + lab + pad))
  const g = c.getContext('2d'); g.fillStyle = '#fff'; g.fillRect(0, 0, c.width, c.height)
  g.fillStyle = '#111'; g.font = 'bold 26px sans-serif'
  g.fillText('The build you tested', pad, 34); g.fillText('Fixed', pad * 2 + CW * S, 34)
  g.font = '19px sans-serif'; g.fillStyle = '#444'
  g.fillText('Remarks tapped, the keys coming up — the input window from a calendar day (OL)', pad, 56)
  for (let r = 0; r < rows.length; r++) {
    for (let k = 0; k < 2; k++) {
      const f = rows[r][k], x0 = pad + k * (CW * S + pad), y0 = head + r * (CH * S + lab + pad) + lab
      const img = new Image(); img.src = 'data:image/png;base64,' + f.data; await img.decode()
      /* the frame at 2x: its top CH points */
      g.drawImage(img, 0, 0, CW * 2, CH * 2, x0, y0, CW * S, CH * S)
      g.strokeStyle = '#999'; g.lineWidth = 1; g.strokeRect(x0 + 0.5, y0 + 0.5, CW * S - 1, CH * S - 1)
      g.fillStyle = '#111'; g.font = 'bold 20px sans-serif'; g.fillText(`${f.ms} ms into the slide`, x0, y0 - 8)
      /* where the window stood before the keys: a dashed line */
      g.setLineDash([8, 6]); g.strokeStyle = '#00b8d4'; g.lineWidth = 2; g.beginPath(); g.moveTo(x0, y0 + 12 * S); g.lineTo(x0 + CW * S, y0 + 12 * S); g.stroke(); g.setLineDash([])
      /* the page behind the window, where it shows: its wide "+ Input" bar, found by its colour */
      const t = document.createElement('canvas'); t.width = CW * 2; t.height = CH * 2
      const tg = t.getContext('2d'); tg.drawImage(img, 0, 0, CW * 2, CH * 2, 0, 0, CW * 2, CH * 2)
      const d = tg.getImageData(0, 0, t.width, t.height).data
      /* a solid bar across most of the width, a dozen rows deep — never a box's thin outline */
      let y1 = -1, y2 = -1, run = 0
      for (let y = 0; y < t.height; y++) {
        let n = 0
        for (let x = 0; x < t.width; x += 2) { const i = (y * t.width + x) * 4; if (d[i] < 140 && d[i + 1] > 160 && d[i + 2] > 200) n++ }
        if (n > (t.width / 2) * 0.8) { run++; if (run >= 12) { if (y1 < 0) y1 = y - 11; y2 = y } } else run = 0
      }
      if (y1 >= 0) {
        const top = y0 + (Math.max(0, y1 - 70) / 2) * S, bot = y0 + (y2 / 2 + 6) * S
        g.strokeStyle = '#e53935'; g.lineWidth = 4; g.strokeRect(x0 + 4, top, CW * S - 8, bot - top)
        g.fillStyle = '#e53935'; g.fillRect(x0 + 4, bot, 300, 30)
        g.fillStyle = '#fff'; g.font = 'bold 18px sans-serif'; g.fillText('the page behind shows', x0 + 12, bot + 21)
      }
    }
  }
  return c.toDataURL('image/png')
}, rows)
writeFileSync(`${DIR}/look-before-after.png`, Buffer.from(png.split(',')[1], 'base64'))
await b.close()
console.log('wrote', `${DIR}/look-before-after.png`, rows.map(r => r.map(f => f.ms).join('/')).join(' '))
