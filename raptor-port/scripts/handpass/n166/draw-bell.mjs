// draw-bell - [MSQ-PICK-GUARD] step 2, picture 4 (desktop): a bell line leading to another squadron, pressed with an Input
// window open -> the refusal note R3.
// SET-UP, by presses, once (step 1's bell-a way, copied - its own saved file): Saber gives Hunter Plan of 149 (Admin ->
// Users) and files an input for Hunter on Tue 8 Dec 2026 on 142, so Hunter's bell carries a 142 line. The browser's saved
// data after that set-up is copied into each fresh browser.
// THEN Hunter signs in, picks 149, opens an input on 149's Inputs and types in its Remarks, opens the bell's list.
//  TODAY: the 142 line pressed (it enters 142, the window held, the ask card). AFTER: the line NOT pressed (the guard
//  refuses the press), the bell list left as it stood, the note R3 raised. In the app today the press goes to the
//  squadron change (ui/topstate.ts openNotice -> enterForLine) BEFORE any branch closes the list (setBellList(false)), so a
//  guard placed there would leave the list showing - the reading behind leaving it open in the drawing.
//   node raptor-port/scripts/handpass/n166/draw-bell.mjs
// Pictures: drawn/p4-d-<today|after>[-crop].png
import { chromium } from '@playwright/test'
import { writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { mk, closeAll, FACT, signIn, go, barSq, pageOn, windowsNow, reachPick, wait, boxOf, covered, bands, SIZES } from './lib.mjs'
import { TMP, hit, vis, inputsList, typeWords, inputWin, shot, blocked } from './draw-lib.mjs'
const STATE = resolve(TMP, 'bell-state-d.json')
const R3 = 'Blocked: close the open window, then press this line again.'
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
  await hit(s, day()); await page.fill('#inpEditRmk', 'n166 for hunter'); await hit(s, '#inpEditSave', 500)
  for (let i = 0; i < 3; i++) {
    const nd = vis(s, 'button').filter({ hasText: /^No document$/ }); if (await nd.count()) await hit(s, nd.first())
    if (await vis(s, '#dlgOk').count()) await hit(s, '#dlgOk')
  }
  FACT('p4.setup.inputFiled', !(await vis(s, '#inpEditRmk').count()))
  await wait(s, 800)
  writeFileSync(STATE, JSON.stringify(await s.ctx.storageState()))
  await s.ctx.close()
}
let br
async function fresh() {
  const S = SIZES.d; br = br || await chromium.launch()
  const ctx = await br.newContext({ viewport: { width: S.w, height: S.h }, deviceScaleFactor: 2, storageState: STATE })
  const page = await ctx.newPage(); page.on('dialog', d => d.dismiss().catch(() => {}))
  return { ctx, page, sz: 'd', desk: true, W: S.w, H: S.h }
}
/* Hunter on 149, an input open on 149's Inputs with typed words, the bell's list open, the 142 line marked */
async function stage(s, k) {
  await signIn(s, 'ad2', 'a2')
  const p = await reachPick(s, 149, 'bar'); FACT(`${k}.setupPick149`, { pressed: !!p.pressed, squadron: await barSq(s) })
  await inputsList(s)
  const row = vis(s, '#inBody tr[data-iid], #inList [data-iid]').filter({ hasNotText: /Hunter/ }).first()
  FACT(`${k}.input`, (await row.innerText()).replace(/\s+/g, ' ').slice(0, 40))
  const o = row.locator('[data-testid="in-open"]'); await hit(s, (await o.count()) ? o.first() : row, 700)
  FACT(`${k}.typed`, await typeWords(s, '#inpEditRmk', 'N166 bell words'))
  FACT(`${k}.bellCovered`, await covered(s, '#notifyBell'))
  const bb = await boxOf(s, '#notifyBell'); await s.page.mouse.click(bb.x + bb.w / 2, bb.y + bb.h / 2); await wait(s, 600)
  const line = s.page.locator('[data-testid="bell-list"] .bl-line').filter({ hasText: /8 Dec/ }).first()
  if (!(await line.count())) throw new Error('no 8 Dec line in the bell')
  await line.evaluate(e => e.setAttribute('data-n166line', '1'))
  FACT(`${k}.line`, { words: (await line.innerText()).replace(/\s+/g, ' ').trim(), covered: await covered(s, '[data-n166line]') })
}
try {
  console.log('draw-bell v1')
  await setup()
  {
    const s = await fresh(), k = 'p4.d.today'
    try {
      await stage(s, k)
      const lb = await boxOf(s, '[data-n166line]'); await s.page.mouse.click(lb.x + lb.w / 2, lb.y + lb.h / 2); await wait(s, 1000)
      const q = await s.page.evaluate(() => [...document.querySelectorAll('[data-testid="inped-swap"] .askcard-q, #dlgMsg')].filter(e => e.getBoundingClientRect().width > 0).map(e => e.textContent.trim()))
      FACT(`${k}.after`, { squadron: await barSq(s), page: await pageOn(s), window: await inputWin(s), question: q, bands: await bands(s), bellListShowing: await s.page.evaluate(() => !!document.querySelector('[data-testid="bell-list"]') && document.querySelector('[data-testid="bell-list"]').getBoundingClientRect().width > 0) })
      await shot(s, 'p4-d-today'); await shot(s, 'p4-d-today-crop', ['.inpedwin', '[data-testid="inped-swap"]', '#notifyBell'])
    } catch (e) { FACT(`${k}.error`, String(e).split('\n')[0].slice(0, 200)); process.exitCode = 1 } finally { await s.ctx.close().catch(() => {}) }
  }
  {
    const s = await fresh(), k = 'p4.d.after'
    try {
      await stage(s, k)
      await s.page.evaluate(() => document.querySelectorAll('[data-n166line]').forEach(e => e.removeAttribute('data-n166line')))
      const n = await blocked(s, k, R3)
      FACT(`${k}.state`, { squadron: await barSq(s), window: await inputWin(s), windows: (await windowsNow(s)).map(w => w.what) })
      const bl = await boxOf(s, '[data-testid="bell-list"]')
      FACT(`${k}.bellList`, { showing: !!bl, box: bl, overlapsTheNote: !!bl && bl.x < n.box.x + n.box.w && bl.x + bl.w > n.box.x && bl.y < n.box.y + n.box.h && bl.y + bl.h > n.box.y })
      await shot(s, 'p4-d-after'); await shot(s, 'p4-d-after-crop', ['#toastEl', '.inpedwin', '[data-testid="bell-list"]'])
    } catch (e) { FACT(`${k}.error`, String(e).split('\n')[0].slice(0, 200)); process.exitCode = 1 } finally { await s.ctx.close().catch(() => {}) }
  }
} catch (e) { console.error('FAILED', String(e).split('\n')[0]); process.exitCode = 1 } finally { await closeAll(); if (br) await br.close() }
