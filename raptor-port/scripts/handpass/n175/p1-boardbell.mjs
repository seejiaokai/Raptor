// p1-boardbell - P1 case 3 (F28 a): the Scheduler Board's OWN bell, a line that leads to another squadron.
// SET-UP, by presses, once (desktop, as chat 166's bell-a): Saber gives Hunter Plan of 149 (Admin → Users) and files an
// input for Hunter on Tue 8 Dec 2026 on 142 - so Hunter's bell carries a 142 line. The browser's saved data after that
// set-up is copied into each fresh browser (the same saved data; nothing invented).
// THEN: Hunter signs in, picks 149, Edit Schedule → a day's date (149's Scheduler Board); (a) the board's own bell → the
// 142 line; (b) the same with a cancel-reason typed (the CX box) - is the board's bell reachable at all?
//   node raptor-port/scripts/handpass/n175/p1-boardbell.mjs <d|p>
// Deciding pictures: p1-boardbell-<size>-*.png
import { writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { chromium, webkit } from '@playwright/test'
import { mk, closeAll, FACT, signIn, barSq, pageOn, go, windowsNow, reachPick, wait, boxOf, covered, hit, vis, typeIn, valOf, decide, scratch, notesNow, askNow, normSz, TMP } from './p1-lib.mjs'
const SZ = normSz(process.argv[2] || 'd'), T = SZ
const STATE = resolve(TMP, `boardbell-state.json`)
const lineBtn = (unitNum, v) => `[data-testid="acc-sq"] [aria-label="Access to ${unitNum}"] button[data-line="${v}"]`

async function setup() {
  const s = await mk('d'); const { page } = s
  await signIn(s, 'ad', 'a')
  await go(s, 'admin'); await wait(s, 600)
  const r = page.locator('[data-person="prowler"] .acc-tap').first(); await r.scrollIntoViewIfNeeded(); await r.click(); await page.waitForSelector('[data-testid="acc-sq"]', { timeout: 8000 }); await wait(s, 300)
  const b = page.locator(lineBtn('149', 'plan')); if ((await b.getAttribute('aria-pressed')) !== 'true') await b.click()
  await page.locator('#accEdSave').click(); await wait(s, 700)
  await go(s, 'inputs'); await wait(s, 500)
  if (await vis(s, '#inListBtn[aria-pressed="false"]').count()) await hit(s, '#inListBtn')
  await hit(s, '#inNew', 600)
  const v = await page.evaluate(() => [...document.querySelector('#inpEditPerson').options].find(x => /Hunter/.test(x.textContent))?.value)
  await page.selectOption('#inpEditPerson', v)
  const day = () => page.locator('.floatwin.inpedwin button[aria-label^="Tue 8 Dec 2026"]').first()
  for (let i = 0; i < 12 && !(await day().count()); i++) await hit(s, page.locator('.floatwin.inpedwin button[aria-label="Next month"]').first(), 250)
  await hit(s, day()); await page.fill('#inpEditRmk', 'p1 for hunter'); await hit(s, '#inpEditSave', 500)
  for (let i = 0; i < 3; i++) {
    const nd = vis(s, 'button').filter({ hasText: /^No document$/ }); if (await nd.count()) await hit(s, nd.first())
    if (await vis(s, '#dlgOk').count()) await hit(s, '#dlgOk')
  }
  FACT(`P1.boardbell.${T}.setup`, { inputFiled: !(await vis(s, '#inpEditRmk').count()) })
  await wait(s, 800)
  writeFileSync(STATE, JSON.stringify(await s.ctx.storageState()))
  await s.ctx.close()
}
const BR = {}
async function fresh() {
  const phone = SZ === 'p', kind = phone ? 'webkit' : 'chromium'
  if (!BR[kind]) BR[kind] = await (phone ? webkit : chromium).launch()
  const opts = phone ? { viewport: { width: 402, height: 874 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 } : { viewport: { width: 1536, height: 864 }, deviceScaleFactor: 2 }
  const ctx = await BR[kind].newContext({ ...opts, storageState: STATE })
  const page = await ctx.newPage(); page.on('dialog', d => d.dismiss().catch(() => {}))
  return { ctx, page, sz: SZ, desk: !phone, W: phone ? 402 : 1536, H: phone ? 874 : 864 }
}
const boardNow = s => s.page.evaluate(() => { const e = document.querySelector('#schedBoard'); return !!e && !e.hidden && e.getBoundingClientRect().width > 2 ? document.querySelector('#schedBoard .sb-title')?.textContent.replace(/\s+/g, ' ').trim() : false })
async function one(withCx) {
  const k = `P1.boardbell.${T}.${withCx ? 'cx' : 'plain'}`, P = `p1-boardbell-${withCx ? 'cx' : 'plain'}-${T}`
  const s = await fresh(); const { page } = s
  try {
    await signIn(s, 'ad2', 'a2')
    const p = await reachPick(s, 149, 'bar'); FACT(`${k}.setupPick149`, { pressed: !!p.pressed, squadron: await barSq(s) })
    await go(s, 'editsched'); await wait(s, 600)
    await hit(s, vis(s, '.page.on .sb-open[data-sbday]').first(), 1200)
    FACT(`${k}.board`, await boardNow(s))
    if (withCx) { await hit(s, vis(s, '#schedBoard [data-pcx], #schedBoard [data-lcx], #schedBoard [data-drcx], #schedBoard [data-srcx]').first(), 800); FACT(`${k}.typed`, await typeIn(s, '#cxReason', 'P1 reason typed')) }
    FACT(`${k}.boardBellCovered`, await covered(s, '#sbBell'))
    if ((await covered(s, '#sbBell')) !== 'free') { await decide(s, `${P}-1-bell-covered`, '#sbBell', '#cxPop .airpop-box'); return }
    const bb = await boxOf(s, '#sbBell'); if (s.desk) await page.mouse.click(bb.x + bb.w / 2, bb.y + bb.h / 2); else await page.touchscreen.tap(bb.x + bb.w / 2, bb.y + bb.h / 2); await wait(s, 700)
    const lines = await page.evaluate(() => [...document.querySelectorAll('[data-testid="bell-list"] .bl-line, .bell-list .bl-line')].filter(l => l.getBoundingClientRect().height > 0).map(l => l.textContent.replace(/\s+/g, ' ').trim().slice(0, 100)))
    FACT(`${k}.bellLines`, lines)
    const line = page.locator('.bell-list .bl-line').filter({ hasText: /8 Dec/ }).first()
    if (!(await line.count())) { FACT(`${k}.line`, 'no 8 Dec line'); await scratch(s, `${P}-no-line`); return }
    await line.evaluate(e => e.setAttribute('data-p1line', '1'))
    FACT(`${k}.lineCovered`, await covered(s, '[data-p1line]'))
    await decide(s, `${P}-1-board-bell-list`, '[data-p1line]', '.bell-list')
    const lb = await boxOf(s, '[data-p1line]'); if (s.desk) await page.mouse.click(lb.x + lb.w / 2, lb.y + lb.h / 2); else await page.touchscreen.tap(lb.x + lb.w / 2, lb.y + lb.h / 2); await wait(s, 1200)
    FACT(`${k}.afterLine`, { squadron: await barSq(s), page: await pageOn(s), board: await boardNow(s), windows: (await windowsNow(s)).map(x => x.what + ': ' + x.words.slice(0, 100)), notes: await notesNow(s), question: await askNow(s) })
    await decide(s, `${P}-2-after-line`, ['.topbar .mark', '#sqnMenuBtn'], null)
  } catch (e) { FACT(`${k}.error`, String(e).split('\n')[0].slice(0, 160)) } finally { await s.ctx.close().catch(() => {}) }
}
try {
  console.log('p1-boardbell v1', SZ)
  await setup()
  await one(false); await one(true)
} catch (e) { console.error('FAILED', String(e).split('\n')[0]); process.exitCode = 1 } finally { await closeAll(); for (const b of Object.values(BR)) await b.close().catch(() => {}) }
void valOf
