import { existsSync } from 'node:fs'
import { chromium, expect, test, type Page } from '@playwright/test'

/* [PUCK-DOT-ZOOM] (owner, 6 Oct 26 — "i cant see the red crew rest warning, over the amber line … its when im at
   default zoom"; his screen runs Windows at 125%). The dotted red ring on a puck ("this day breaks tomorrow's crew
   rest") was one screen pixel thick there and sat hard against the amber ring of an advisory, where it reads as the
   amber ring's edge. On a screen whose scaling is not a whole number it is now two screen pixels thick
   (src/ui/dotring.ts); on an unscaled screen it is what it always was.

   A REAL SCALING, NOT AN EMULATED ONE: Playwright's `deviceScaleFactor` scales the finished picture and leaves the
   page's own arithmetic at 1, where the browser rounds any width under 2px down to 1px — so the fault and the fix
   both vanish under it. `--force-device-scale-factor` is what Windows' display scaling hands the browser; each case
   is therefore its own browser, with no viewport emulation. The pixels are counted, because a picture cannot fail. */

const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const launchOptions = existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {}

async function ringAt(scale: number, baseURL: string, run: (page: Page) => Promise<void>) {
  const browser = await chromium.launch({ headless: true, ...launchOptions, args: [`--force-device-scale-factor=${scale}`, '--window-size=1440,900'] })
  try {
    /* the project's own picture scaling taken off: it cannot be combined with "no viewport emulation" */
    const page = await (await browser.newContext({ viewport: null, deviceScaleFactor: undefined })).newPage()
    await page.goto(baseURL + '?fresh=1')
    await page.fill('#luser', 'ad'); await page.fill('#lpass', 'a'); await page.click('#loginForm button[type=submit]')
    await page.waitForSelector('#vWeek .day', { state: 'attached' })
    await run(page)
  } finally { await browser.close() }
}

/* the first puck on the week that wears the dotted ring, given an advisory's amber ring as `puck()` gives one (the
   class `warn` on the same element — html.ts), pictured with 8px of margin; the count is of the pixels in that margin
   that are the ring's own red at full strength */
async function measure(page: Page) {
  const el = page.locator('#vWeek .puck.boxdot').first()
  await expect(el, 'the demo week has a man whose day breaks the next day\'s crew rest').toHaveCount(1)
  await el.evaluate(n => { n.classList.add('warn'); n.scrollIntoView({ block: 'center', inline: 'center' }) })
  const css = await el.evaluate(n => { const s = getComputedStyle(n); return { w: parseFloat(s.outlineWidth), dpr: devicePixelRatio, handed: getComputedStyle(document.documentElement).getPropertyValue('--dot-w') } })
  const b = (await el.boundingBox())!
  const pad = 8
  const png = await page.screenshot({ clip: { x: b.x - pad, y: b.y - pad, width: b.width + pad * 2, height: b.height + pad * 2 } })
  const red = await page.evaluate(async ({ src, inner }) => {
    const img = new Image(); img.src = src; await img.decode()
    const c = document.createElement('canvas'); c.width = img.width; c.height = img.height
    const g = c.getContext('2d')!; g.drawImage(img, 0, 0)
    const d = g.getImageData(0, 0, c.width, c.height).data
    let n = 0
    for (let y = 0; y < c.height; y++) for (let x = 0; x < c.width; x++) {
      if (x >= inner && x < c.width - inner && y >= inner && y < c.height - inner) continue
      const i = (y * c.width + x) * 4
      if (d[i] > 170 && d[i + 1] < 125 && d[i + 2] < 135) n++
    }
    return n
  }, { src: 'data:image/png;base64,' + png.toString('base64'), inner: Math.round(pad * css.dpr) })
  return { ...css, red }
}

test.describe('the dotted crew-rest ring on a scaled screen', () => {
  test.describe.configure({ mode: 'serial' })

  test('at 125% (his screen) it is two screen pixels thick and its red shows all round an amber ring', async ({ baseURL }) => {
    await ringAt(1.25, baseURL!, async page => {
      const m = await measure(page)
      expect(m.dpr).toBe(1.25)
      expect(Math.round(m.w * m.dpr * 100) / 100, 'thickness, in screen pixels').toBe(2)
      /* one pixel thick it measured 100 here, two thick 233 (6 Oct 26) */
      expect(m.red, 'pixels in the ring\'s own red').toBeGreaterThan(170)
    })
  })

  test('zoomed out to 80% it is still two screen pixels thick', async ({ baseURL }) => {
    await ringAt(0.8, baseURL!, async page => {
      const m = await measure(page)
      expect(Math.round(m.w * m.dpr * 100) / 100, 'thickness, in screen pixels').toBe(2)
      /* one pixel thick it measured 34 here, two thick 92 */
      expect(m.red, 'pixels in the ring\'s own red').toBeGreaterThan(60)
    })
  })

  test('on an unscaled screen nothing is handed over: the ring is the one pixel it always was', async ({ baseURL }) => {
    await ringAt(1, baseURL!, async page => {
      const m = await measure(page)
      expect(m.handed).toBe('')
      expect(m.w).toBe(1)
    })
  })

  test('on a 2x screen (a phone\'s kind) nothing is handed over either', async ({ baseURL }) => {
    await ringAt(2, baseURL!, async page => {
      const m = await measure(page)
      expect(m.handed).toBe('')
      expect(m.w).toBe(1.5)
    })
  })
})
