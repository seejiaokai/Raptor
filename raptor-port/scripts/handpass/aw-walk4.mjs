/* [ALL-AVAIL-WINDOW] — the walk's fourth pass (one order: the mode on, THEN the issued preview), 23 Sep 26. (a) The two doors that
   decide whether a VERSION's window can ever reach its earn half: is the plans
   menu offered while OIL Earn is on, and is OIL Earn offered while a version is
   previewed? (b) The refusal toast on a PHONE over the bottom panel — the mode
   switched on at desktop width (its button there), then the screen narrowed,
   since the mode is day state and survives the resize. */
import { open, board, tap, type, put, shot, publish } from './lib.mjs'
import { buildSaturday } from './fixture.mjs'

const DI = 5
const R = {}
const step = async (name, fn) => { try { R[name] = await fn() } catch (e) { R[name] = { THREW: String(e && e.message || e).slice(0, 240) } } }
const { browser, page, errors } = await open({ width: 1440, height: 900 })
let OPS = null
await step('0-build', async () => {
  await buildSaturday(page, DI)
  await tap(page, `[data-gradd="${DI}"]`)
  const gi = await page.evaluate(() => window.DAYS[5].ground.length - 1)
  await type(page, `[data-bfld="gr:${DI}.${gi}.prog"]`, 'OPS BRIEF')
  await type(page, `[data-bfld="gr:${DI}.${gi}.str"]`, '16:00')
  await type(page, `[data-bfld="gr:${DI}.${gi}.end"]`, '17:00')
  const r = await put(page, `[data-fill="g:${DI}.${gi}.+"]`, ['allavail'])
  OPS = await page.evaluate(() => { const x = window.DAYS[5].ground.find(g => g.prog === 'OPS BRIEF'); return x && x.rid ? `r:${x.rid}` : null })
  return r
})
await step('1-publish', async () => publish(page, DI))
await step('4-mode-on-then-preview', async () => {
  await page.locator('#sbOil').click(); await page.waitForTimeout(600)          // the mode ON first
  await tap(page, `[data-planmenu="${DI}"]`)
  await page.locator('[data-planpv]:visible').first().click(); await page.waitForTimeout(700)
  const st = await page.evaluate(() => ({ frozenFace: !!document.querySelector('#schedBoard .pv-frozen'),
    oilBtnPressed: document.querySelector('#sbOil')?.getAttribute('aria-pressed'), items: document.querySelectorAll('#schedBoard [data-oilitem]').length }))
  const c = page.locator(`#schedBoard [data-oilsent="${OPS}"]:visible`).first()
  let w = null
  if (await c.count()) {
    await c.evaluate(e => e.scrollIntoView({ block: 'center' })); await c.click(); await page.waitForTimeout(400)
    w = await page.evaluate(() => ({ tabs: [...document.querySelectorAll('.availwin .win-tab')].map(t => t.textContent.trim() + (t.classList.contains('on') ? ' [on]' : '')), from: document.querySelector('.availwin .win-from')?.textContent }))
    if (w.tabs.length === 2) {
      await page.locator('.availwin .win-tab').nth(1).click(); await page.waitForTimeout(300)
      const before = await page.evaluate(() => JSON.stringify(window.DAYS[5].oild || {}))
      await page.locator('.availwin .rpuck .puck').first().click(); await page.waitForTimeout(300)
      w.foot = await page.evaluate(() => document.querySelector('.availwin .win-foot')?.textContent)
      w.wrote = before !== await page.evaluate(() => JSON.stringify(window.DAYS[5].oild || {}))
      await page.screenshot({ path: process.env.HP_SHOTS + '/41-desk-mode-then-issued-preview-readonly.png' })
    }
  }
  return { st, window: w }
})
R.errors = errors.slice(0, 20)
console.log(JSON.stringify(R, null, 1))
await browser.close()
