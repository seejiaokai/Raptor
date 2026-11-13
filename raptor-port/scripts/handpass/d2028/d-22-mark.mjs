/* d-22-mark v1 — the pictures for his look: three of the walk's own pictures, the place marked and one plain line on each
   (D853, D921, D1222). Draws nothing of the app: an outline and a caption over the walk's picture.
   usage (from raptor-port/): node scripts/handpass/d2028/d-22-mark.mjs */
import { chromium } from 'playwright'
import { existsSync, mkdirSync, readFileSync } from 'node:fs'
const CHROMIUM = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH || ''
const BASE = 'C:/Users/User/projects/Raptor/raptor-port/docs/img/handpass/2026-11-13-rules-check-small-batch/d2028'
const OUT = BASE + '/for-him'
mkdirSync(OUT, { recursive: true })
const JOBS = [
  { src: 'd123-phone/d1-a-back-board.png', out: '1-his-case-phone', w: 1206, crop: [0, 900, 1206, 1100],
    cap: 'After "Any other row" went from 1h to 2h: the published Saturday still reads an hour, and Ranger is still listed.',
    boxes: [[111, 1026, 770, 48], [55, 1858, 240, 58]] },
  { src: 'fix-his-phone/f1-remark-pendinglist.png', out: '2-the-fix-phone', w: 1206, crop: [0, 380, 1206, 1420],
    cap: 'Length changed AND a remark typed on that day: the list now names the man the next amendment moves.',
    boxes: [[65, 1624, 1075, 112], [285, 515, 222, 50]] },
  { src: 'probe-simchip-pc/p-1-after-press.png', out: '3-sim-count-older-fault', w: 1920, crop: [0, 420, 1920, 260],
    cap: 'Older fault, filed, not this job: the count "42" sits inside the empty seat\'s box, so a press arms the seat and the window does not open.',
    boxes: [[738, 590, 104, 30]] },
  // his questions of 13 Nov 26 (d-24-explain.mjs made the sources)
  { src: 'explain-q1-phone/e3-pending-list-today.png', out: '4-oil-line-today', w: 1206, crop: [0, 1040, 1206, 700],
    cap: 'TODAY: "No OIL earned" was also switched on for this Saturday. The list names Ranger and does not say it.',
    boxes: [[63, 1485, 1080, 129]] },
  { src: 'explain-q1-phone/e4-recommended-DRAWING.png', out: '5-oil-line-recommended-DRAWING', w: 1206, crop: [0, 1040, 1206, 740],
    cap: 'A DRAWING of my recommendation: the one line says both, the decision first.',
    boxes: [[63, 1485, 1080, 171]] },
  { src: 'explain-vague-phone/e3-pending-list-today.png', out: '6-the-vague-line', w: 1206, crop: [0, 1040, 1206, 700],
    cap: 'The line the rare tie would show: "changed", with no name. (Real app; here it comes from "No OIL earned" alone.)',
    boxes: [[63, 1485, 1080, 129]] },
  // [SIM-COUNT-OVER-SEAT], before and after the fix (d-23-simchip-measure.mjs made the sources)
  { src: '../simcount/before-pc/m-0-whole.png', out: '7-sim-count-desktop-BEFORE', w: 1920, crop: [0, 500, 1920, 190],
    cap: 'BEFORE, desktop: the count "42" sits inside the empty rear seat. A press arms the seat; the window never opens.',
    boxes: [[737, 592, 105, 28]] },
  { src: '../simcount/after-pc/m-0-whole.png', out: '8-sim-count-desktop-AFTER', w: 1920, crop: [0, 500, 1920, 190],
    cap: 'AFTER, desktop: the count has its own place beside ALL AVAIL; the rear seat starts after it. A press opens the window.',
    boxes: [[736, 590, 36, 32]] },
  { src: '../simcount/before-phone/m-0-whole.png', out: '9-sim-count-phone-BEFORE', w: 1206, crop: [0, 1200, 1206, 420],
    cap: 'BEFORE, phone: the same fault. The count is inside the rear seat.',
    boxes: [[315, 1395, 60, 54]] },
  { src: '../simcount/after-phone/m-0-whole.png', out: '10-sim-count-phone-AFTER', w: 1206, crop: [0, 1200, 1206, 420],
    cap: 'AFTER, phone: no room beside the pair, so the count sits under its puck, as on the phone\'s week.',
    boxes: [[84, 1437, 60, 36]] },
  // the hint printed twice ([RULES-BATCH-OLDER-1113], the eighth)
  { src: 'explain-q1-phone/e3-pending-list-today.png', out: '11-hint-printed-twice', w: 1206, crop: [0, 1440, 1206, 1182],
    cap: 'The same hint twice. I recommend keeping the one under the list and removing the one at the foot.',
    boxes: [[63, 1630, 380, 56], [55, 2515, 380, 56]] },
]
const browser = await chromium.launch(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {})
for (const jb of JOBS) {
  const [cx, cy, cw, ch] = jb.crop
  const page = await browser.newPage({ viewport: { width: cw, height: ch + 90 }, deviceScaleFactor: 1 })
  const data = readFileSync(`${BASE}/${jb.src}`).toString('base64')
  const boxes = jb.boxes.map(([x, y, w, h]) => `<div style="position:absolute;left:${x - cx - 6}px;top:${y - cy - 6}px;width:${w + 12}px;height:${h + 12}px;border:5px solid #ffd60a;border-radius:10px;box-sizing:border-box"></div>`).join('')
  await page.setContent(`<body style="margin:0;background:#0b0f14"><div style="height:90px;display:flex;align-items:center;padding:0 24px;font:600 ${cw > 1500 ? 26 : 30}px 'Segoe UI',Arial,sans-serif;color:#fff;background:#12202c;box-sizing:border-box">${jb.cap.replace(/</g, '&lt;')}</div><div style="position:relative;width:${cw}px;height:${ch}px;overflow:hidden"><img src="data:image/png;base64,${data}" style="position:absolute;left:${-cx}px;top:${-cy}px;width:${jb.w}px">${boxes}</div></body>`)
  await page.waitForFunction(() => [...document.images].every(i => i.complete && i.naturalWidth))
  await page.screenshot({ path: `${OUT}/${jb.out}.png` })
  console.log('wrote', jb.out)
  await page.close()
}
await browser.close()
