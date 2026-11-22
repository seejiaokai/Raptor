// The night of 22–23 Nov 26, job 3 — the drawing check (D1494) of what was built against the approved drawings
// (docs/mock/2026-11-22-msq-b1-screens/img): Request access's squadron (b1-5), Admin → Squadrons as a master admin
// (b1-3), 149's row opened on its place (b1-4), "+ New squadron" pressed (b1-9) and with "+ New place…" picked (b1-10), and
// a shared place's time zone greyed for a plain admin (p7). Each is reached for real on the built app — at the drawings'
// own sizes (1440 and 390, Chromium — redraw-b1.mjs, redraw-pieces.mjs), so the two pictures sit side by side, and at his
// iPhone's (402, WebKit) and the desktop's (1536, Chromium) — framed as the drawing scripts framed them; a picture of each
// and the parts' places, sizes and words.
// Serve the build first:  npx vite preview --port 4478 --strictPort   then, from raptor-port/:
//   MQ_URL=http://localhost:4478/ MQ_OUT=<a folder outside the checkout> node scripts/handpass/n149/measure-job3.mjs
import { chromium, webkit } from '@playwright/test'
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'

const URL_ = process.env.MQ_URL || 'http://localhost:4478/'
const OUT = process.env.MQ_OUT || 'n149-job3-out'
mkdirSync(OUT, { recursive: true })
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const launch = existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {}
/* (each size its own name — a file system that ignores case would lay "D" over "d") */
const SIZES = {
  d1440: { engine: chromium, desk: true, opts: { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 } },
  p390: { engine: chromium, desk: false, opts: { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 } },
  d1536: { engine: chromium, desk: true, opts: { viewport: { width: 1536, height: 864 }, deviceScaleFactor: 2 } },
  p402: { engine: webkit, desk: false, opts: { viewport: { width: 402, height: 874 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 } },
}
const errs = [], facts = {}
const browsers = {}
async function session(sz, user, pass, pending = false) {
  const S = SIZES[sz]
  const key = S.engine === webkit ? 'wk' : 'cr'
  if (!browsers[key]) browsers[key] = await S.engine.launch(S.engine === webkit ? {} : launch)
  const ctx = await browsers[key].newContext(S.opts)
  const page = await ctx.newPage()
  page.on('pageerror', e => errs.push(`[${sz}] PAGEERROR ${e}`))
  page.on('console', m => { if (m.type() === 'error') errs.push(`[${sz}] CONSOLE ${m.text()}`) })
  page.on('response', r => { if (r.status() >= 400) errs.push(`[${sz}] ${r.status()} ${r.url()}`) })
  await page.goto(URL_); await page.waitForSelector('#luser')
  await page.fill('#luser', user); await page.fill('#lpass', pass)
  await page.click('#loginForm button[type=submit]')
  if (pending) await page.waitForSelector('#accSend')
  else { await page.waitForSelector('#vWeek .day', { state: 'attached' }); await page.waitForTimeout(800) }
  await page.addStyleTag({ content: '#toastEl { display: none !important; } *{transition:none !important;animation:none !important}' })
  return { ctx, page }
}
async function toSquadrons(page) {
  await page.evaluate(() => window.go('admin'))
  await page.waitForSelector('#page-admin.on', { state: 'attached' }); await page.waitForTimeout(500)
  await page.locator('#page-admin button.adm-cat', { has: page.locator('.adm-cat-l', { hasText: /^Squadrons$/ }) }).first().click()
  await page.waitForSelector('#admSquadrons.on #sqList'); await page.waitForTimeout(400)
  await page.evaluate(() => window.scrollTo(0, 0))
}
/* redraw-b1.mjs adminClip: on a desktop from the rail's left to the pane's right, the top of the screen to the foot of
   the lower of the two; on a phone the whole width from the top */
async function adminClip(page, desk) {
  return page.evaluate(desk => {
    const pg = document.querySelector('#page-admin')
    const pane = pg.querySelector('.adm-pane'), pr = pane.getBoundingClientRect()
    const cats = [...pg.querySelectorAll('button.adm-cat')].filter(c => c.getBoundingClientRect().width > 0)
    const left = desk && cats.length ? Math.min(pr.left, cats[0].getBoundingClientRect().left) - 12 : 0
    const x = Math.max(0, left), w = desk ? Math.min(innerWidth - x, pr.right + 12 - x) : innerWidth
    let bottom = pr.bottom
    if (desk && cats.length) bottom = Math.max(bottom, cats[cats.length - 1].getBoundingClientRect().bottom)
    return { x, y: 0, width: w, height: Math.min(innerHeight, bottom + 14) }
  }, desk)
}
async function shot(page, file, clip) {
  await page.mouse.move(1, 1).catch(() => {})
  await page.evaluate(() => { document.activeElement && document.activeElement.blur && document.activeElement.blur() })
  await page.waitForTimeout(200)
  await page.screenshot({ path: `${OUT}/${file}`, ...(clip ? { clip } : {}) })
}
const rects = (page, sels) => page.evaluate(sels => Object.fromEntries(sels.map(s => {
  const e = document.querySelector(s); if (!e) return [s, null]
  const b = e.getBoundingClientRect(), cs = getComputedStyle(e)
  return [s, { x: +b.left.toFixed(1), y: +b.top.toFixed(1), w: +b.width.toFixed(1), h: +b.height.toFixed(1), font: cs.fontSize, op: cs.opacity, text: (e.textContent || '').trim().slice(0, 90) }]
})), sels)
const PANE = ['#page-admin .adm-pane', '#page-admin .adm-pane-head h3', '#admSquadrons h4.adm-sub', '#sqList',
  '#sqList [data-unit="u142"]', '#sqList [data-unit="u149"]', '#sqList [data-unit="u142"] .acc-name', '#sqList [data-unit="u142"] .acc-sub',
  '#sqNew', '#admSquadrons .sq-places h4.adm-sub', '#sqPlaces [data-place="p1"]', '#sqPlaces [data-place="p1"] .acc-sub',
  '#page-admin button.adm-cat.on', '#page-admin button.adm-cat.on svg']

const run = async (sz) => {
  const desk = SIZES[sz].desk
  // b1-5 — Request access, Squadron first
  {
    const { ctx, page } = await session(sz, 'newbie', 'x', true)
    await page.evaluate(() => { document.activeElement && document.activeElement.blur && document.activeElement.blur() })
    const clip = await page.evaluate(() => { const r = document.querySelector('#accForm').getBoundingClientRect(), pad = 14; return { x: Math.max(0, r.left - pad), y: Math.max(0, r.top - pad), width: Math.min(innerWidth, r.width + 2 * pad), height: Math.min(innerHeight - Math.max(0, r.top - pad), r.height + 2 * pad) } })
    await shot(page, `b1-5-${sz}.png`, clip)
    facts[`b1-5-${sz}`] = await rects(page, ['#accForm', 'label[for="accSqn"]', '#accSqn', 'label[for="accCs"]', '#accCs', '#accSeat', '#accCat', '#accSend', '#accOut'])
    facts[`b1-5-${sz}`].options = await page.evaluate(() => [...document.querySelectorAll('#accSqn option')].map(o => o.textContent))
    await ctx.close()
  }
  // b1-3, b1-4, b1-9, b1-10 — Saber, the master admin
  {
    const { ctx, page } = await session(sz, 'ad', 'a')
    await toSquadrons(page)
    await shot(page, `b1-3-${sz}.png`, await adminClip(page, desk))
    facts[`b1-3-${sz}`] = await rects(page, PANE)
    await page.click('#sqList [data-unit="u149"] .acc-tap'); await page.waitForTimeout(250)
    await shot(page, `b1-4-${sz}.png`, await adminClip(page, desk))
    facts[`b1-4-${sz}`] = await rects(page, ['#sqList [data-unit="u149"]', 'label[for="sqPlace"]', '#sqPlace', '#sqMoveNote', '#sqMoveSave', '#sqMoveCancel', '#sqNew'])
    await page.click('#sqMoveCancel'); await page.waitForTimeout(150)
    await page.click('#sqNew'); await page.waitForTimeout(250)
    await shot(page, `b1-9-${sz}.png`, await adminClip(page, desk))
    facts[`b1-9-${sz}`] = await rects(page, ['[data-new-sqn]', '[data-new-sqn] .acc-name', '[data-new-sqn] .acc-sub', 'label[for="sqNewNum"]', '#sqNewNum', '#sqNewPlace', '#sqNewAdmin', '#sqNewNote', '#sqNewSave', '#sqNewCancel'])
    facts[`b1-9-${sz}`].admins = await page.evaluate(() => [...document.querySelectorAll('#sqNewAdmin option')].map(o => o.textContent))
    await page.fill('#sqNewNum', '150')
    await page.selectOption('#sqNewPlace', '+new'); await page.waitForTimeout(150)
    await page.fill('#sqNewPlaceName', 'Northern base')
    await page.selectOption('#sqNewTz', 'Australia/Darwin')
    await page.selectOption('#sqNewAdmin', 'acad2'); await page.waitForTimeout(150)
    await shot(page, `b1-10-${sz}.png`, await adminClip(page, desk))
    facts[`b1-10-${sz}`] = await rects(page, ['#sqNewNum', '#sqNewPlace', 'label[for="sqNewPlaceName"]', '#sqNewPlaceName', '#sqNewTz', '#sqNewAdmin', '#sqNewNote', '#sqNewSave'])
    await ctx.close()
  }
  // p7 — Hunter, 142's admin: Home base's time zone greyed
  {
    const { ctx, page } = await session(sz, 'ad2', 'a2')
    await toSquadrons(page)
    await page.click('#sqPlaces [data-place="p1"] .acc-tap'); await page.waitForTimeout(250)
    await page.evaluate(() => document.querySelector('#sqPlaces').scrollIntoView({ block: 'start' }))
    await page.waitForTimeout(150)
    await shot(page, `p7-${sz}.png`, desk ? await adminClip(page, desk) : null)
    facts[`p7-${sz}`] = await rects(page, ['#sqPlaces [data-place="p1"]', 'label[for="plName"]', '#plName', '#plTz', '#plWhy', '#plSave', '#plCancel', '#sqList [data-unit="u149"] .acc-tap'])
    facts[`p7-${sz}`].disabled = await page.evaluate(() => ({ name: document.querySelector('#plName').disabled, tz: document.querySelector('#plTz').disabled, save: document.querySelector('#plSave').disabled, row149: document.querySelector('#sqList [data-unit="u149"] .acc-tap').disabled, sqNew: !!document.querySelector('#sqNew') }))
    await ctx.close()
  }
}
try {
  for (const sz of (process.env.MQ_SZ ? process.env.MQ_SZ.split(',') : Object.keys(SIZES))) {
    try { await run(sz) } catch (e) { errs.push(`[${sz}] FAILED ${e.message}`) }
  }
} finally {
  for (const b of Object.values(browsers)) await b.close()
}
writeFileSync(`${OUT}/facts.json`, JSON.stringify({ facts, errs }, null, 1))
console.log('ERRORS ' + (errs.length ? '\n' + errs.join('\n') : 'none'))
