// The sign-in's mark — the claw beside the app's name — measured as drawn, TALON against the RAPTOR it replaced
// ([TALON-RENAME], his "the talon page is a bit off", 3 Nov 26). On the built app (dist/), at his PC's size (1536 × 864
// at 1.25) and his iPhone's (402 × 874 at 3): the ink of the claw (its blue) and of the word (its white) found in the
// picture itself, so letter spacing and a letter's own empty space count as the eye sees them. RAPTOR is put back for
// the comparison by changing the drawn words only, in the page. Prints the measures; writes the pictures beside.
//   npm run build && node scripts/handpass/talon-lockup-measure.mjs [out dir]
import { chromium } from '@playwright/test'
import { preview } from 'vite'
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = dirname(fileURLToPath(import.meta.url))
const ROOT = join(HERE, '../..')
const OUT = process.argv[2] || join(ROOT, 'docs/img/handpass/2026-11-03-talon/lockup')
mkdirSync(OUT, { recursive: true })
const PORT = 4294
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const server = await preview({ root: ROOT, preview: { port: PORT, strictPort: true, open: false }, logLevel: 'silent' })
const browser = await chromium.launch(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {})
const SIZES = [['pc', { width: 1536, height: 864 }, 1.25], ['iphone', { width: 402, height: 874 }, 3]]
const OLD_SUB = '<b>R</b>eadiness · <b>A</b>vailability · <b>P</b>lanning<br><b>T</b>racking &amp; <b>O</b>ps <b>R</b>eporting'

for (const [tag, viewport, dpr] of SIZES) {
  for (const word of ['TALON', 'RAPTOR']) {
    const page = await browser.newPage({ viewport, deviceScaleFactor: dpr })
    await page.goto(`http://localhost:${PORT}/?fresh=1`)
    await page.waitForSelector('#luser', { state: 'visible' })
    await page.waitForFunction(() => !document.getElementById('bootclaw'))
    if (word === 'RAPTOR') await page.evaluate(s => { document.querySelector('.lb-word').textContent = 'RAPTOR'; document.querySelector('.lb-sub').innerHTML = s }, OLD_SUB)
    await page.waitForTimeout(150)
    const mark = await page.locator('.lb-mark').boundingBox()
    const clip = { x: 0, y: Math.max(0, mark.y - 2), width: viewport.width, height: mark.height + 4 }   // the mark's own row: the line under it has blue letters too
    const png = await page.screenshot({ clip })
    writeFileSync(join(OUT, `${tag}-${word}.png`), png)
    const m = await page.evaluate(async ([b64, clip, dpr, vw]) => {
      const img = await new Promise(r => { const i = new Image(); i.onload = () => r(i); i.src = 'data:image/png;base64,' + b64 })
      const c = document.createElement('canvas'); c.width = img.width; c.height = img.height
      const g = c.getContext('2d'); g.drawImage(img, 0, 0); const d = g.getImageData(0, 0, c.width, c.height).data
      const box = () => ({ l: 1e9, r: -1, t: 1e9, b: -1 })
      const blue = box(), white = box()
      for (let y = 0; y < c.height; y++) for (let x = 0; x < c.width; x++) {
        const i = (y * c.width + x) * 4, R = d[i], G = d[i + 1], B = d[i + 2]
        const put = o => { o.l = Math.min(o.l, x); o.r = Math.max(o.r, x); o.t = Math.min(o.t, y); o.b = Math.max(o.b, y) }
        if (R > 200 && G > 200 && B > 200) put(white)         // the word
      }
      /* the claw's own blue (not its faint light), left of the word only: the word's smoothed edges carry a blue fringe */
      for (let y = 0; y < c.height; y++) for (let x = 0; x < white.l - 4 * dpr; x++) {
        const i = (y * c.width + x) * 4, R = d[i], G = d[i + 1], B = d[i + 2]
        if (B > 150 && G > 120 && R < 120) { blue.l = Math.min(blue.l, x); blue.r = Math.max(blue.r, x); blue.t = Math.min(blue.t, y); blue.b = Math.max(blue.b, y) }
      }
      const css = o => ({ l: o.l / dpr, r: o.r / dpr, t: o.t / dpr + clip.y, b: o.b / dpr + clip.y })
      const cb = css(blue), wb = css(white)
      const r1 = v => Math.round(v * 10) / 10
      return {
        claw: [r1(cb.l), r1(cb.r), r1(cb.t), r1(cb.b)], word: [r1(wb.l), r1(wb.r), r1(wb.t), r1(wb.b)],
        gap: r1(wb.l - cb.r),
        clawMid: r1((cb.t + cb.b) / 2), wordMid: r1((wb.t + wb.b) / 2),
        clawAboveCap: r1(wb.t - cb.t), clawBelowBase: r1(cb.b - wb.b),
        groupMid: r1((cb.l + wb.r) / 2), pageMid: vw / 2,
        offCentre: r1((cb.l + wb.r) / 2 - vw / 2),
      }
    }, [png.toString('base64'), clip, dpr, viewport.width])
    console.log(`${tag} ${word.padEnd(6)} gap ${m.gap}  claw ink ${m.claw[0]}–${m.claw[1]}, word ink ${m.word[0]}–${m.word[1]}  | claw above caps ${m.clawAboveCap}, below base ${m.clawBelowBase}, mids ${m.clawMid}/${m.wordMid}  | group off centre ${m.offCentre}`)
    await page.close()
  }
}
await browser.close()
await new Promise(r => server.httpServer.close(r))
