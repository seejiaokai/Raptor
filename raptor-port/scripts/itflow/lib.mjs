/* The toolkit every journey under j/ is handed by capture.mjs: a fresh signed-in page, page switching, sign in
   and out, and `shot` — one cropped picture with its marks read off the live page. */
import { chromium } from 'playwright'
import { existsSync, mkdirSync } from 'node:fs'

const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const PORT = process.env.PORT || 4185
/* One fixed "today" for every picture (the Post in box, an archived line's date, a post-out date still to come all
   read the clock), so a re-shoot gives the same pictures — pinned the way od-walk.mjs and onedoor.spec.ts pin it. */
const TODAY = '2026-09-29T09:00:00'
export const DESKTOP = { width: 1440, height: 900 }
export const PHONE = { width: 390, height: 844 }

export async function open(OUT) {
  mkdirSync(OUT, { recursive: true })
  const browser = await chromium.launch(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {})
  const manifest = {}
  const errors = []

  /* Pictures are JPEG (the deck carries ~70; PNG made it several times heavier) at 2x, sharp on a phone; the
     map's page thumbnails pass scale 1 — they are a few centimetres wide. `who` null stays on the sign-in card. */
  async function fresh(who = 'ad', { viewport = DESKTOP, scale = 2, phone = false } = {}) {
    const ctx = await browser.newContext({ viewport, deviceScaleFactor: scale, ...(phone ? { isMobile: true, hasTouch: true } : {}) })
    await ctx.clock.setFixedTime(new Date(TODAY))
    const page = await ctx.newPage()
    page.on('pageerror', e => errors.push(String(e)))
    await page.goto(`http://localhost:${PORT}/?fresh=1`)
    if (who) {
      await signIn(page, who, who === 'ad' ? 'a' : who)
      await page.waitForSelector('#vWeek .day', { state: 'attached' })
      await page.waitForTimeout(500)
    }
    return page
  }

  /* One picture: `crop` is {x,y,w,h} in CSS pixels; each mark is {n, sel} — an orange ring numbered n, a CLICK (its
     badge at the ring's `pos` corner: tl, bl, tr, br — default tl, moved where two badges would touch) — or
     {see: true, sel} — a green ring with no number, WHAT YOU SHOULD SEE. `sel` is a selector or a locator; the
     element's box is read at the moment of the shot, never hard-coded. */
  async function shot(page, id, crop, marks = []) {
    const ms = []
    for (const m of marks) {
      const el = typeof m.sel === 'string' ? page.locator(m.sel).first() : m.sel
      const b = await el.boundingBox()
      if (!b) throw new Error(`${id}: mark ${m.n ?? 'see'} (${m.sel}) is not on screen`)
      ms.push({ n: m.n, see: !!m.see, pos: m.pos || 'tl', x: (b.x - crop.x) / crop.w, y: (b.y - crop.y) / crop.h, w: b.width / crop.w, h: b.height / crop.h })
    }
    await page.screenshot({ path: `${OUT}/${id}.jpg`, type: 'jpeg', quality: 88, clip: { x: crop.x, y: crop.y, width: crop.w, height: crop.h } })
    manifest[id] = { w: crop.w, h: crop.h, marks: ms }
  }

  return { fresh, shot, go, signIn, signOut, find, manifest, errors, FULL: { x: 0, y: 0, w: 1440, h: 900 }, close: () => browser.close() }
}

export async function go(page, p) {
  await page.evaluate(p => window.go(p), p)
  await page.waitForFunction(p => window.CURPAGE === p, p)
  await page.waitForTimeout(700)
}

export async function signIn(page, user, pass) {
  await page.fill('#luser', user)
  await page.fill('#lpass', pass)
  await page.click('#loginForm button[type=submit]')
}

export async function signOut(page) {
  await page.locator('#logout:visible, #accOut:visible, #guestOut:visible').first().click()
  await page.waitForSelector('#luser')
}

/* Admin → Users' search box — the tidy way to get one man's row into a fixed crop. */
export async function find(page, q) {
  await page.fill('#accFind', q)
  await page.waitForTimeout(300)
}
