// [LW-PINCH-IN-CORNER] and [QUALS-PINCH-MID] — the walk's taps and its desktop half (31 Oct 26, `claude/pinch-fixes-1031`,
// evidence docs/handpass/2026-10-31-pinch-fixes.md).
//   · ON A PHONE (402 × 874 at 3x), D1281: a picture RIGHT AFTER each tap — the finger left where it pressed, the touched
//     state an iPhone keeps — on the controls beside the two pinched surfaces, before and after a pinch: the Leave War's
//     Manning fold and a month button, Quals' Pilots · WSOs · Personnel · All switch and a pinned heading (it sorts). After
//     each tap every pinned cell in sight must still be solid (its own fill, fully opaque).
//   · ON A DESKTOP (his PC: 1536 × 730 at 1.25): the Leave War grid part-way down under a Ctrl+scroll burst (the names and
//     the corner at the left edge mid-burst — the desktop's zoom shares the pinch body), and Quals part-way down under a
//     Ctrl+scroll, which must change nothing (a desktop has no pinch there, D1110 — this change must not give it one).
//   node scripts/handpass/pinch1031-taps.mjs <dist> <out-dir> [phone|desk]     ENGINE=webkit for Safari's engine
import { createRequire } from 'node:module'
import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { serveDist, LAUNCH } from '../drawcheck/lib.mjs'
const require = createRequire(import.meta.url)
const { chromium, webkit } = require('@playwright/test')
const [, , DIST = 'dist', OUT0 = 'C:/pinch1031', ONLY] = process.argv
const ENGINE = process.env.ENGINE === 'webkit' ? 'webkit' : 'chromium'
const OUT = join(OUT0, ENGINE + '-taps')
mkdirSync(OUT, { recursive: true })
console.log(`pinch1031-taps v1 — ${ENGINE}, ${DIST}`)
const sleep = ms => new Promise(r => setTimeout(r, ms))
const ORIGIN = 'http://localhost:4197'
const results = []
const check = (id, what, ok, detail) => { results.push({ id, what, ok: !!ok, detail }); console.log(`${ok ? 'PASS' : 'FAIL'} ${id} ${what}${ok ? '' : ' — ' + JSON.stringify(detail)}`) }
const browser = ENGINE === 'webkit' ? await webkit.launch() : await chromium.launch(LAUNCH)
async function fresh(pageName, phone) {
  const ctx = await browser.newContext(phone
    ? { viewport: { width: 402, height: 874 }, deviceScaleFactor: 3, hasTouch: true, isMobile: ENGINE === 'chromium', timezoneId: 'Asia/Singapore' }
    : { viewport: { width: 1536, height: 730 }, deviceScaleFactor: 1.25, timezoneId: 'Asia/Singapore' })
  await serveDist(ctx, ORIGIN, DIST)
  const p = await ctx.newPage()
  const errs = []; p.on('pageerror', e => errs.push(String(e).slice(0, 160)))
  await p.goto(ORIGIN + '/')
  await p.fill('#luser', 'ad'); await p.fill('#lpass', 'a'); await p.click('#loginForm button[type=submit]')
  await p.waitForSelector('#vWeek .day', { timeout: 20000 })
  await p.addStyleTag({ content: '#toastEl{visibility:hidden!important}' })
  await p.evaluate(x => window.go(x), pageName); await p.waitForFunction(x => window.CURPAGE === x, pageName); await sleep(900)
  return { ctx, p, errs }
}
const done = async (id, s) => { check(id, 'no page errors', s.errs.length === 0, s.errs); await s.ctx.close() }

/* every pinned cell in sight is solid: its own fill fully opaque (or a drawn fill), never faded */
const SOLID = sel => {
  const bad = []
  for (const el of document.querySelectorAll(sel)) {
    const r = el.getBoundingClientRect()
    if (!r.width || r.bottom < 0 || r.top > innerHeight || r.right < 0 || r.left > innerWidth) continue
    const cs = getComputedStyle(el), m = cs.backgroundColor.match(/rgba?\(([^)]*)\)/)
    const parts = m ? m[1].split(',').map(Number) : [], a = parts.length === 4 ? parts[3] : 1
    if ((a < 1 && cs.backgroundImage === 'none') || parseFloat(cs.opacity) < 1) bad.push(`${el.tagName.toLowerCase()}.${(el.className || '').toString().split(' ')[0]} ${cs.backgroundColor} ${cs.opacity}`)
  }
  return bad.slice(0, 6)
}
const LW_PINNED = '#page-leavewar .mx-wrap > table.mx > tbody.mxhead th.who, #page-leavewar .mx-wrap > table.mx > tbody.mxhead th.bal, #page-leavewar [data-testid="sticky-head"] .mxfixed-frozen th, #page-leavewar [data-testid="frozen-cols"] td.who, #page-leavewar .mstripe td.mstick'
const Q_PINNED = '#qtbl thead th, #qtbl td.qname, [data-testid="qsticky-head"] th'

/** a tap by a finger, and a picture at once with it left where it pressed (D1281) — then the settled picture */
async function tapShot(s, id, label, loc, pinnedSel) {
  const b = await loc.boundingBox()
  if (!b) { check(id, `${label}: the control is on screen`, false, null); return }
  await s.p.touchscreen.tap(b.x + b.width / 2, b.y + b.height / 2)
  await s.p.screenshot({ path: join(OUT, `${id}-${label}-touched.png`) })
  check(id, `${label}: right after the tap, every pinned cell in sight solid`, (await s.p.evaluate(SOLID, pinnedSel)).length === 0, await s.p.evaluate(SOLID, pinnedSel))
  await sleep(600)
  await s.p.screenshot({ path: join(OUT, `${id}-${label}-settled.png`) })
  check(id, `${label}: settled, every pinned cell in sight solid`, (await s.p.evaluate(SOLID, pinnedSel)).length === 0, await s.p.evaluate(SOLID, pinnedSel))
}
/** a two-finger pinch (CDP in Chromium; in WebKit, Playwright's touchscreen cannot make two fingers — skipped and said) */
async function pinch(s, cx, cy, d0, d1) {
  if (ENGINE !== 'chromium') return false
  const cdp = await s.ctx.newCDPSession(s.p)
  const t = (type, pts) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: pts.map(([x, y], i) => ({ x: Math.round(x), y: Math.round(y), id: i + 1 })) })
  const at = i => { const d = d0 + (d1 - d0) * i / 10; return [[cx - d / 2, cy], [cx + d / 2, cy]] }
  await t('touchStart', [at(0)[0]]); await sleep(30); await t('touchStart', at(0)); await sleep(30)
  for (let i = 1; i <= 10; i++) { await t('touchMove', at(i)); await sleep(20) }
  await t('touchEnd', []); await sleep(700); await cdp.detach()
  return true
}

if (!ONLY || ONLY === 'phone') {
  /* T1 — the Leave War: the Manning fold both ways, a month button; then pinched in and again */
  let s = await fresh('leavewar', true)
  try {
    await s.p.waitForSelector('#page-leavewar .mx-wrap [data-testid^="head-"]')
    await tapShot(s, 'T1', 'manning-open', s.p.locator('[data-testid="counts-toggle"]'), LW_PINNED)
    await tapShot(s, 'T1', 'manning-fold', s.p.locator('[data-testid="counts-toggle"]'), LW_PINNED)
    await tapShot(s, 'T1', 'month-sep', s.p.locator('[data-testid="month-SEP"]'), LW_PINNED)
    if (await pinch(s, 200, 560, 110, 230)) {
      await s.p.screenshot({ path: join(OUT, 'T1-pinched-in.png') })
      await tapShot(s, 'T1', 'zoomed-month-mar', s.p.locator('[data-testid="month-MAR"]'), LW_PINNED)
      await tapShot(s, 'T1', 'zoomed-manning-open', s.p.locator('[data-testid="counts-toggle"]'), LW_PINNED)
    } else check('T1', 'pinched (WebKit takes no two fingers from outside — the zoomed taps are Chromium\'s)', true, null)
  } catch (e) { check('T1', 'NOT WALKED', false, String(e).slice(0, 300)) }
  await done('T1', s)

  /* T2 — Quals: the switch, each way; part-way down, a pinned heading (it sorts); then pinched out and again */
  s = await fresh('quals', true)
  try {
    await s.p.waitForSelector('#qtbl td.qname')
    for (const v of ['WSOs', 'Personnel', 'All', 'Pilots']) await tapShot(s, 'T2', `switch-${v.toLowerCase()}`, s.p.locator('.segview button', { hasText: v }).first(), Q_PINNED)
    await s.p.evaluate(() => window.scrollTo(0, 420)); await sleep(500)
    await tapShot(s, 'T2', 'pinned-heading-sort', s.p.locator('[data-testid="qsticky-head"] .qfixed-scroll th[data-sort]').nth(2), Q_PINNED)
    if (await pinch(s, 200, 450, 230, 80)) {
      await s.p.screenshot({ path: join(OUT, 'T2-pinched-out.png') })
      await tapShot(s, 'T2', 'zoomed-switch-wsos', s.p.locator('.segview button', { hasText: 'WSOs' }).first(), Q_PINNED)
      await tapShot(s, 'T2', 'zoomed-switch-pilots', s.p.locator('.segview button', { hasText: 'Pilots' }).first(), Q_PINNED)
    } else check('T2', 'pinched (Chromium only)', true, null)
  } catch (e) { check('T2', 'NOT WALKED', false, String(e).slice(0, 300)) }
  await done('T2', s)
}

if (!ONLY || ONLY === 'desk') {
  /* D1 — the Leave War grid on his PC, part-way down, a Ctrl+scroll burst read mid-burst: the names and the corner at the
     grid's left edge, the date row under the month buttons */
  let s = await fresh('leavewar', false)
  try {
    await s.p.waitForSelector('#page-leavewar .mx-wrap [data-testid^="head-"]')
    await s.p.evaluate(() => window.scrollTo(0, 260)); await sleep(500)
    await s.p.screenshot({ path: join(OUT, 'D1-rest.png') })
    await s.p.mouse.move(800, 450)
    await s.p.keyboard.down('Control'); await s.p.mouse.wheel(0, 300); await sleep(60)
    const m = await s.p.evaluate(() => {
      const w = document.querySelector('#page-leavewar .mx-wrap').getBoundingClientRect()
      const c = document.querySelector('#page-leavewar .mx-wrap > table.mx > tbody.mxhead th.who').getBoundingClientRect()
      const n = [...document.querySelectorAll('#page-leavewar .mx-wrap .mxbody td.who')].map(e => e.getBoundingClientRect()).filter(r => r.top > 0 && r.bottom < innerHeight)
      return { tf: !!document.querySelector('#page-leavewar .mx-wrap > table.mx').style.transform, cornerOff: Math.round(c.left - w.left), namesOff: n.filter(r => Math.abs(r.left - w.left) > 1.5).length, n: n.length }
    })
    await s.p.screenshot({ path: join(OUT, 'D1-mid-burst.png') })
    await s.p.keyboard.up('Control'); await sleep(600)
    await s.p.screenshot({ path: join(OUT, 'D1-settled.png') })
    check('D1', 'read mid-burst (stretched)', m.tf, m)
    check('D1', 'mid-burst the corner and every name at the grid\'s left edge', Math.abs(m.cornerOff) < 1.5 && m.n > 0 && m.namesOff === 0, m)
  } catch (e) { check('D1', 'NOT WALKED', false, String(e).slice(0, 300)) }
  await done('D1', s)

  /* D2 — Quals on his PC, part-way down: a Ctrl+scroll over the table changes nothing of it (no pinch on a desktop) */
  s = await fresh('quals', false)
  try {
    await s.p.waitForSelector('#qtbl td.qname')
    await s.p.evaluate(() => window.scrollTo(0, 300)); await sleep(500)
    await s.p.screenshot({ path: join(OUT, 'D2-rest.png') })
    await s.p.mouse.move(700, 450)
    await s.p.keyboard.down('Control'); await s.p.mouse.wheel(0, 300); await sleep(60)
    const m = await s.p.evaluate(() => ({ tf: (document.getElementById('qtbl')).style.transform, pinching: !!document.querySelector('.qfixed.q-pinching'), z: getComputedStyle(document.getElementById('qtbl')).zoom }))
    await s.p.keyboard.up('Control'); await sleep(400)
    await s.p.screenshot({ path: join(OUT, 'D2-after.png') })
    check('D2', 'a desktop\'s Ctrl+scroll does not stretch Quals\' table or mark its pinned row', !m.tf && !m.pinching, m)
  } catch (e) { check('D2', 'NOT WALKED', false, String(e).slice(0, 300)) }
  await done('D2', s)
}

await browser.close()
writeFileSync(join(OUT, 'results.json'), JSON.stringify(results, null, 1))
const fails = results.filter(r => !r.ok)
console.log(`\n${ENGINE} taps/desk: ${results.length - fails.length} of ${results.length} checks pass${fails.length ? ' — FAILS: ' + [...new Set(fails.map(f => f.id))].join(', ') : ''}`)
console.log('DONE')
