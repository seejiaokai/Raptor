/* The IT flow guide's screenshots ([IT-FLOW-GUIDE], D410) — taken from the RUNNING app, so the deck can be
   re-shot after a screen changes: build, serve on PORT (default 4185), then
     node scripts/itflow/capture.mjs <outDir>
   writes <outDir>/<id>.jpg (2x, cropped) and <outDir>/manifest.json — for each shot its crop and the click
   marks (numbered rings) as fractions of the picture, which deck.mjs lays over it as editable shapes.
   Each journey starts from a fresh sign-in on `?fresh=1`, so no journey leans on another's leftovers. */
import { chromium } from 'playwright'
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'

const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const PORT = process.env.PORT || 4185
const OUT = process.argv[2] || 'itflow-shots'
const ONLY = process.argv[3] ? process.argv[3].split(',') : null
mkdirSync(OUT, { recursive: true })

const browser = await chromium.launch(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {})
const manifest = {}
const errors = []

/* Pictures are JPEG: the deck carries ~50 of them and PNG screenshots made it several times heavier. The map's
   page thumbnails are shot at 1x (scale 1) — they are recognition pictures, a few centimetres wide. */
async function fresh(who = 'ad', viewport = { width: 1440, height: 900 }, scale = 2) {
  const ctx = await browser.newContext({ viewport, deviceScaleFactor: scale })
  const page = await ctx.newPage()
  page.on('pageerror', e => errors.push(String(e)))
  await page.goto(`http://localhost:${PORT}/?fresh=1`)
  if (who) {
    await page.fill('#luser', who)
    await page.fill('#lpass', who === 'ad' ? 'a' : who)
    await page.click('#loginForm button[type=submit]')
    await page.waitForSelector('#vWeek .day', { state: 'attached' })
    await page.waitForTimeout(500)
  }
  return page
}

async function go(page, p) {
  await page.evaluate(p => window.go(p), p)
  await page.waitForFunction(p => window.CURPAGE === p, p)
  await page.waitForTimeout(700)
}

/* One picture: `crop` is {x,y,w,h} in CSS pixels; each mark is {n, sel} — an orange ring numbered n, a CLICK —
   (its badge at the ring's `pos` corner: tl, bl, tr, br — default tl, moved where two badges would touch)
   or {see: true, sel} — a green ring with no number, WHAT YOU SHOULD SEE. The element's box is read at the
   moment of the shot, never hard-coded. */
async function shot(page, id, crop, marks = []) {
  const ms = []
  for (const m of marks) {
    const el = typeof m.sel === 'string' ? page.locator(m.sel).first() : m.sel
    const b = await el.boundingBox()
    if (!b) throw new Error(`${id}: mark ${m.n} (${m.sel}) is not on screen`)
    ms.push({ n: m.n, see: !!m.see, pos: m.pos || 'tl', x: (b.x - crop.x) / crop.w, y: (b.y - crop.y) / crop.h, w: b.width / crop.w, h: b.height / crop.h })
  }
  await page.screenshot({ path: `${OUT}/${id}.jpg`, type: 'jpeg', quality: 88, clip: { x: crop.x, y: crop.y, width: crop.w, height: crop.h } })
  manifest[id] = { w: crop.w, h: crop.h, marks: ms }
}

const FULL = { x: 0, y: 0, w: 1440, h: 900 }
const journeys = {
  /* The map's page thumbnails: each page as it first opens, signed in as the admin. */
  async map() {
    const page = await fresh('ad', undefined, 1)
    for (const p of ['editsched', 'viewsched', 'inputs', 'quals', 'leavewar', 'tracker', 'admin']) {
      await go(page, p)
      await shot(page, `map-${p}`, FULL)
    }
    await page.context().close()
    const out = await fresh(null, undefined, 1)
    await shot(out, 'map-login', FULL)
    await out.context().close()
  },

  /* Publish a day: Edit Schedule → the week → four sign-off names → Publish day → ORIG, seen by everyone. */
  async publish() {
    const page = await fresh()
    const C = { x: 0, y: 0, w: 560, h: 420 }
    await go(page, 'editsched')
    await shot(page, 'publish-1', C, [
      { n: 1, sel: '.nav a[data-page="editsched"]' },
      { n: 2, sel: page.locator('button.wk.on:visible').first(), pos: 'bl' },
    ])
    for (const k of ['cur', 'sked', 'plan', 'appr']) {
      const s = `select[data-sign="${k}"][data-signday="0"]`
      const v = await page.$eval(s, el => [...el.options].find(o => o.value)?.value)
      await page.selectOption(s, v)
      await page.waitForTimeout(250)
    }
    await shot(page, 'publish-2', { x: 0, y: 225, w: 560, h: 420 }, [
      { n: 3, sel: '[data-signbar="0"] .signoff, [data-signbar="0"]' },
      { n: 4, sel: 'button[data-beak="0"]', pos: 'tr' },
    ])
    await page.click('button[data-beak="0"]')
    await page.waitForTimeout(900)
    await shot(page, 'publish-3', C, [
      { see: true, sel: '.dhver:visible' },
      { see: true, sel: 'button.dunpub:visible' },
    ])
    await go(page, 'viewsched')
    await shot(page, 'publish-4', C, [
      { see: true, sel: '.dhver:visible' },
      { see: true, sel: 'select.dver:visible' },
    ])
    await page.context().close()
  },
}

for (const [name, run] of Object.entries(journeys)) {
  if (ONLY && !ONLY.includes(name)) continue
  process.stdout.write(`${name} … `)
  await run()
  console.log('ok')
}
const mf = `${OUT}/manifest.json`
const prev = existsSync(mf) ? JSON.parse((await import('node:fs')).readFileSync(mf, 'utf8')) : {}
writeFileSync(mf, JSON.stringify({ ...prev, ...manifest }, null, 1))
console.log('page errors:', errors.length, errors.slice(0, 3))
await browser.close()
