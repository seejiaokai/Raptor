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
    const ctx = await browser.newContext({ viewport, deviceScaleFactor: scale, acceptDownloads: true, ...(phone ? { isMobile: true, hasTouch: true } : {}) })
    await ctx.clock.setFixedTime(new Date(TODAY))
    /* Export as PDF opens the browser's print dialog; a headed run would stop on it, so print does nothing here
       (the init script reaches the hidden print frame too). */
    await ctx.addInitScript(() => { window.print = () => {} })
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
      const cx = b.x + b.width / 2 - crop.x, cy = b.y + b.height / 2 - crop.y
      /* a mark whose element sits outside the picture would be drawn off it — refuse, never draw it wrong */
      if (cx < 0 || cy < 0 || cx > crop.w || cy > crop.h) throw new Error(`${id}: mark ${m.n ?? 'see'} (${m.sel}) is outside the crop`)
      ms.push({ n: m.n, see: !!m.see, pos: m.pos || 'tl', x: (b.x - crop.x) / crop.w, y: (b.y - crop.y) / crop.h, w: b.width / crop.w, h: b.height / crop.h })
    }
    await page.screenshot({ path: `${OUT}/${id}.jpg`, type: 'jpeg', quality: 88, clip: { x: crop.x, y: crop.y, width: crop.w, height: crop.h } })
    manifest[id] = { w: crop.w, h: crop.h, marks: ms }
  }

  return { fresh, shot, go, signIn, signOut, switchTo, publishDay, find, drag, around, span, boardTo, manifest, errors, FULL: { x: 0, y: 0, w: 1440, h: 900 }, PHONE, close: () => browser.close() }
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

/* Sign off and publish day `di` on Edit Schedule (an admin): the four names, then Publish day. The demo week has
   no published day, so a journey that needs one makes it here — in the SAME page: a new ?fresh=1 wipes it. */
export async function publishDay(page, di) {
  if (await page.evaluate(() => window.CURPAGE) !== 'editsched') await go(page, 'editsched')
  for (const k of ['cur', 'sked', 'plan', 'appr']) {
    const s = `select[data-sign="${k}"][data-signday="${di}"]`
    const v = await page.$eval(s, el => [...el.options].find(o => o.value)?.value)
    await page.selectOption(s, v)
    await page.waitForTimeout(200)
  }
  await page.click(`button[data-beak="${di}"]`)
  await page.waitForTimeout(800)
}

/* Sign out and back in as someone else, in the same page (the demo world, published days included, stays). */
export async function switchTo(page, user, pass = user) {
  await signOut(page)
  await signIn(page, user, pass)
  await page.waitForSelector('#vWeek .day', { state: 'attached' })
  await page.waitForTimeout(500)
}

/* A drag on the app's own pointer machine (nothing is browser-draggable): press, a small move to wake it, then
   glide onto the target. `hold` leaves the button down, so a picture can show the ghost in flight. */
export async function drag(page, src, dst, { hold = false } = {}) {
  const a = await (typeof src === 'string' ? page.locator(src).first() : src).boundingBox()
  const b = await (typeof dst === 'string' ? page.locator(dst).first() : dst).boundingBox()
  await page.mouse.move(a.x + 5, a.y + 5)
  await page.mouse.down()
  await page.mouse.move(a.x + 15, a.y + 15, { steps: 3 })
  await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2, { steps: 12 })
  if (!hold) { await page.mouse.up(); await page.waitForTimeout(500) }
}

/* A crop of w×h placed around an element (its box's point fx, fy of the way across the crop), kept on screen. */
export async function around(page, sel, w, h, fx = 0.5, fy = 0.4, vw = 1440, vh = 900) {
  const b = await (typeof sel === 'string' ? page.locator(sel).first() : sel).boundingBox()
  const cx = b.x + b.width / 2, cy = b.y + b.height / 2
  return { x: Math.round(Math.max(0, Math.min(cx - w * fx, vw - w))), y: Math.round(Math.max(0, Math.min(cy - h * fy, vh - h))), w, h }
}

/* A crop framing several elements together: their joint box, padded, widened to the ratio (4:3), kept on screen. */
export async function span(page, sels, { pad = 50, ratio = 4 / 3, vw = 1440, vh = 900 } = {}) {
  const bs = []
  for (const s of sels) bs.push(await (typeof s === 'string' ? page.locator(s).first() : s).boundingBox())
  let x1 = Math.min(...bs.map(b => b.x)) - pad, y1 = Math.min(...bs.map(b => b.y)) - pad
  let x2 = Math.max(...bs.map(b => b.x + b.width)) + pad, y2 = Math.max(...bs.map(b => b.y + b.height)) + pad
  let w = x2 - x1, h = y2 - y1
  if (w / h < ratio) { const nw = h * ratio; x1 -= (nw - w) / 2; w = nw } else { const nh = w / ratio; y1 -= (nh - h) / 2; h = nh }
  w = Math.min(w, vw); h = Math.min(h, vh)
  return { x: Math.round(Math.max(0, Math.min(x1, vw - w))), y: Math.round(Math.max(0, Math.min(y1, vh - h))), w: Math.round(w), h: Math.round(h) }
}

/* The scheduler board scrolls inside its own wrap (its bar covers the top ~105px): bring an element to just under
   the bar, or to the middle. */
export async function boardTo(page, sel, where = 'top') {
  await page.evaluate(([s, where]) => {
    const w = document.querySelector('#schedBoard .sb-boardwrap'), el = document.querySelector(s)
    if (!w || !el) return
    const d = el.getBoundingClientRect().top - w.getBoundingClientRect().top
    w.scrollTop += where === 'top' ? d - 8 : d - w.clientHeight / 2
  }, [sel, where])
  await page.waitForTimeout(350)
}

/* Admin → Users' search box — the tidy way to get one man's row into a fixed crop. */
export async function find(page, q) {
  await page.fill('#accFind', q)
  await page.waitForTimeout(300)
}
