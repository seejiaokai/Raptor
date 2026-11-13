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
