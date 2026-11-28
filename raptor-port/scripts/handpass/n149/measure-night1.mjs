// The night of 22–23 Nov 26, job 1 — the drawing check (D1494) of what was built against the approved drawings
// (docs/mock/2026-11-22-msq-b1-screens/img): the filter (nfa, nfb, nfd, nfc), the eight-squadron filter (f5c-p), Add a
// person's Home squadron (b1-7), the roles fold open (k2) and a person's row with eight squadrons (f5b-p). Each picture is
// taken the way its drawing script took it — the same engine, size and frame (redraw-pieces.mjs `shot`: the whole phone
// screen, or on a desktop the box round the named parts, 24px round) — with the parts' places and sizes written beside it.
// Serve the build first:  npx vite preview --port 4476 --strictPort   then, from raptor-port/:
//   MQ_URL=http://localhost:4476/ MQ_OUT=<a folder outside the checkout> node scripts/handpass/n149/measure-night1.mjs
import { chromium, webkit } from '@playwright/test'
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'

const URL_ = process.env.MQ_URL || 'http://localhost:4476/'
const OUT = process.env.MQ_OUT || 'n149-out'
mkdirSync(OUT, { recursive: true })
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const launch = existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {}
const SIZES = {
  d: { engine: chromium, opts: { viewport: { width: 1536, height: 864 }, deviceScaleFactor: 2 } },
  p: { engine: webkit, opts: { viewport: { width: 402, height: 874 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 } },
}
const errs = [], facts = {}
const browsers = {}
async function session(sz, user, pass) {
  const S = SIZES[sz]
  if (!browsers[sz]) browsers[sz] = await S.engine.launch(sz === 'd' ? launch : {})
  const ctx = await browsers[sz].newContext(S.opts)
  const page = await ctx.newPage()
  page.on('pageerror', e => errs.push(`[${sz}] PAGEERROR ${e}`))
  page.on('console', m => { if (m.type() === 'error') errs.push(`[${sz}] CONSOLE ${m.text()}`) })
  page.on('response', r => { if (r.status() >= 400) errs.push(`[${sz}] ${r.status()} ${r.url()}`) })
  await page.goto(URL_); await page.waitForSelector('#luser')
  await page.fill('#luser', user); await page.fill('#lpass', pass)
  await page.click('#loginForm button[type=submit]')
  await page.waitForSelector('#vWeek .day', { state: 'attached' }); await page.waitForTimeout(800)
  await page.addStyleTag({ content: '#toastEl { display: none !important; }' })
  return { ctx, page }
}
async function toUsers(page) {
  await page.evaluate(() => window.go('admin'))
  await page.waitForSelector('#page-admin.on', { state: 'attached' }); await page.waitForTimeout(600)
  if (!(await page.locator('#page-admin button.acc-main').first().isVisible())) {
    await page.locator('#page-admin button.adm-cat', { hasText: 'Users' }).first().click(); await page.waitForTimeout(600)
  }
}
async function shot(page, file, sels, pad = 24) {
  await page.mouse.move(1, 1).catch(() => {})
  await page.evaluate(() => { document.activeElement && document.activeElement.blur && document.activeElement.blur() })
  await page.waitForTimeout(200)
  let clip
  if (sels) {
    const r = await page.evaluate(sels => {
      let L = 1e9, T = 1e9, R = -1e9, B = -1e9
      for (const s of sels) for (const e of document.querySelectorAll(s)) {
        const b = e.getBoundingClientRect(); if (!(b.width > 0)) continue
        L = Math.min(L, b.left); T = Math.min(T, b.top); R = Math.max(R, b.right); B = Math.max(B, b.bottom)
      }
      return L < 1e9 ? { L, T, R, B, W: innerWidth, H: innerHeight } : null
    }, sels)
    const x = Math.max(0, r.L - pad), y = Math.max(0, r.T - pad)
    clip = { x, y, width: Math.min(r.W, r.R + pad) - x, height: Math.min(r.H, r.B + pad) - y }
  }
  await page.screenshot({ path: `${OUT}/${file}`, ...(clip ? { clip } : {}) })
  return clip || { x: 0, y: 0 }
}
/* the places and sizes of the named parts, in the screen's measure */
const rects = (page, sels) => page.evaluate(sels => Object.fromEntries(sels.map(s => {
  const e = document.querySelector(s); if (!e) return [s, null]
  const b = e.getBoundingClientRect(), cs = getComputedStyle(e)
  return [s, { x: +b.left.toFixed(1), y: +b.top.toFixed(1), w: +b.width.toFixed(1), h: +b.height.toFixed(1), font: cs.fontSize, text: (e.textContent || '').trim().slice(0, 60) }]
})), sels)
const tick = async (page, k) => {
  if (!(await page.locator('#accFilterPanel').count())) await page.click('#accFilter')
  await page.click(`#accFilterPanel [data-ftick="${k}"]`); await page.waitForTimeout(150)
}
const HEAD = ['#page-admin .od-head', '#page-admin .od-head h4.adm-sub', '#page-admin .od-find', '#accFilter', '#accFilterPanel',
  '#accShowing', '#accFilterPanel [data-fgroup="seat"]', '#accFilterPanel [data-fgroup="role"]', '#accFilterPanel [data-fgroup="sqn"]',
  '#accFilterPanel [data-ftick="seat:Pilots"]', '#accFilterClear', '#accList .od-cols', '#accList > .acc-row']
const FRAME_ND = ['#page-admin .od-head', '#page-admin #accFilterPanel', '#page-admin #accShowing', '#accList > .acc-row']

for (const sz of ['p', 'd']) {
  // nfa — Hunter, nothing ticked
  { const { ctx, page } = await session(sz, 'ad2', 'a2'); await toUsers(page)
    facts[`nfa-${sz}`] = await rects(page, HEAD)
    facts[`nfa-${sz}`].clip = await shot(page, `nfa-${sz}.png`, sz === 'd' ? ['#page-admin .od-head', '#accList > .acc-row:nth-child(-n+3)'] : null)
    await ctx.close() }
  // nfb — Pilots and Admin ticked, the panel open; nfd — the panel closed
  { const { ctx, page } = await session(sz, 'ad2', 'a2'); await toUsers(page)
    await tick(page, 'seat:Pilots'); await tick(page, 'role:admin')
    await page.evaluate(() => window.scrollTo(0, 0))
    facts[`nfb-${sz}`] = await rects(page, HEAD)
    facts[`nfb-${sz}`].clip = await shot(page, `nfb-${sz}.png`, sz === 'd' ? FRAME_ND : null)
    await page.keyboard.press('Escape'); await page.waitForTimeout(200)
    facts[`nfd-${sz}`] = await rects(page, HEAD)
    facts[`nfd-${sz}`].clip = await shot(page, `nfd-${sz}.png`, sz === 'd' ? FRAME_ND : null)
    await ctx.close() }
  // nfc — Saber, 142 and 149 ticked, the panel open
  { const { ctx, page } = await session(sz, 'ad', 'a'); await toUsers(page)
    await tick(page, 'sqn:u142'); await tick(page, 'sqn:u149')
    await page.evaluate(() => window.scrollTo(0, 0))
    facts[`nfc-${sz}`] = await rects(page, [...HEAD, '[data-unit-head="u142"]', '[data-unit-head="u149"]'])
    facts[`nfc-${sz}`].heads = await page.$$eval('[data-testid="acc-groups"] h4.adm-sub', hs => hs.map(h => h.textContent))
    facts[`nfc-${sz}`].clip = await shot(page, `nfc-${sz}.png`, sz === 'd' ? FRAME_ND : null)
    await page.keyboard.press('Escape'); await page.waitForTimeout(200)
    await page.evaluate(() => { const h = document.querySelector('[data-unit-head="u149"]'); h.scrollIntoView({ block: 'center' }) })
    await shot(page, `n1c-${sz}.png`, null)
    await ctx.close() }
  // b1-7 — Saber's Add a person, its Home squadron first
  { const { ctx, page } = await session(sz, 'ad', 'a'); await toUsers(page)
    await page.evaluate(() => document.querySelector('#accAddBlock').scrollIntoView({ block: 'center' })); await page.waitForTimeout(250)
    facts[`b1-7-${sz}`] = await rects(page, ['#accAddBlock', '#accAddBlock h4', '#accAddHome', 'label[for="accAddHome"]', '#accAddCs', '#accAddSeat'])
    await shot(page, `b1-7-${sz}.png`, ['#accAddBlock'], 16)
    await ctx.close() }
  // k2 — Saber opens Hunter, the roles fold open
  { const { ctx, page } = await session(sz, 'ad', 'a'); await toUsers(page)
    await page.locator('#accList [data-person="prowler"] .acc-tap').click(); await page.waitForSelector('[data-testid="acc-roles"]')
    await page.locator('[data-testid="acc-roles"] summary').click(); await page.waitForTimeout(200)
    await page.evaluate(() => document.querySelector('#page-admin .acc-row.od-row-on').scrollIntoView({ block: 'center' }))
    facts[`k2-${sz}`] = await rects(page, ['#page-admin .acc-edit', '[data-testid="acc-sq"]', '[data-testid="acc-roles"]', '[data-testid="acc-roles"] summary',
      '[data-testid="acc-roles"] .acc-rt-lab', '[data-testid="acc-roles"] table', '[data-testid="acc-roles"] .acc-rt-key', '[data-testid="acc-roles"] .acc-rt-notes',
      '[data-testid="acc-roles"] tbody tr'])
    await shot(page, `k2-${sz}.png`, ['#page-admin .acc-row.od-row-on'], sz === 'd' ? 40 : 12)
    await ctx.close() }
}
// f5b-p and f5c-p — eight squadrons on the iPhone (D2321)
{
  const { ctx, page } = await session('p', 'ad', 'a')
  for (let n = 150; n <= 155; n++) { const r = await page.evaluate(x => window.raptorAddUnit(String(x), 'acad2'), n); if (!r.ok) errs.push(`${n}: ${JSON.stringify(r)}`) }
  await toUsers(page)
  await page.locator('#accList [data-person="prowler"] .acc-tap').click(); await page.waitForSelector('[data-testid="acc-sq"]')
  await page.evaluate(() => document.querySelector('#page-admin .acc-row.od-row-on').scrollIntoView({ block: 'center' }))
  facts['f5b-p'] = await rects(page, ['#page-admin .acc-edit', '[data-testid="acc-sq"]', '[data-testid="acc-roles"]'])
  facts['f5b-p'].rows = await page.$$eval('[data-testid="acc-sq"] .acc-acts', gs => gs.map(g => new Set([...g.children].map(b => Math.round(b.getBoundingClientRect().top))).size))
  await shot(page, 'f5b-p.png', ['#page-admin .acc-row.od-row-on'], 12)
  await page.click('#accEdCancel'); await page.evaluate(() => window.scrollTo(0, 0))
  await tick(page, 'sqn:u142'); await tick(page, 'sqn:u149'); await page.evaluate(() => window.scrollTo(0, 0))
  facts['f5c-p'] = await rects(page, HEAD)
  facts['f5c-p'].sqRows = await page.$$eval('#accFilterPanel [data-fgroup="sqn"] .fchip', cs => new Set(cs.map(c => Math.round(c.getBoundingClientRect().top))).size)
  facts['f5c-p'].button = await page.textContent('#accFilter')
  await shot(page, 'f5c-p.png', null)
  /* the fit test's measure catches a cut word (e2e/users-fit.spec.ts): the old long Role words (D2305 ended them) put back
     in the box, each measured as the test measures — they must be seen as too wide on the iPhone */
  await page.keyboard.press('Escape'); await page.click('#accShowingClear')
  await page.locator('#accList [data-person="prowler"] .acc-tap').click(); await page.waitForSelector('#accEdRole')
  facts.catch = await page.evaluate(() => {
    const role = document.querySelector('#accEdRole'), cs = getComputedStyle(role)
    const ctx = document.createElement('canvas').getContext('2d'); ctx.font = `${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`
    const room = role.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight)
    return ['Member — own inputs, quals and bids', 'Admin — schedules and manages', 'Master admin'].map(t => ({ t, w: +ctx.measureText(t).width.toFixed(1), room: +room.toFixed(1), cut: ctx.measureText(t).width > room + 0.5 }))
  })
  await ctx.close()
}
for (const b of Object.values(browsers)) await b.close()
writeFileSync(`${OUT}/facts.json`, JSON.stringify(facts, null, 1))
console.log('errors:', errs.length ? errs.join('\n') : 'none')
