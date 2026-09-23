/* [ALL-AVAIL-WINDOW] — the walk's third pass, 23 Sep 26. (a) The two doors that
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
await step('2-doors', async () => {
  const menuVis = () => page.locator(`#schedBoard [data-planmenu="${DI}"]:visible`).count()
  const before = { planMenuShown: await menuVis(), oilBtnDisabled: await page.locator('#sbOil').isDisabled() }
  await page.locator('#sbOil').click(); await page.waitForTimeout(600)
  const inMode = { oilday: await page.evaluate(() => window.OILDAY), planMenuShown: await menuVis() }
  await page.locator('#sbOil').click(); await page.waitForTimeout(600)
  await tap(page, `[data-planmenu="${DI}"]`)
  await page.locator('[data-planpv]:visible').first().click(); await page.waitForTimeout(600)
  const frozen = () => page.evaluate(() => !!document.querySelector('#schedBoard .pv-frozen'))
  const inPreview = { frozenFace: await frozen(), oilBtnDisabled: await page.locator('#sbOil').isDisabled() }
  /* back to the live day: the plans menu's own live row, and the bridge as the belt */
  await tap(page, `[data-planmenu="${DI}"]`).catch(() => {})
  await page.locator('[data-plangolive]:visible').first().click().catch(() => {}); await page.waitForTimeout(600)
  if (await frozen()) { await page.evaluate(() => window.setDayPreview(5, null)); await page.waitForTimeout(500) }
  return { before, inMode, inPreview, backLive: !(await frozen()) }
})
await step('3-phone-toast-over-panel', async () => {
  await page.locator('#sbOil').click(); await page.waitForTimeout(600)
  await tap(page, `[data-oilitem="${OPS}"]`)                      // the OPS BRIEF row switched off
  await page.setViewportSize({ width: 390, height: 844 }); await page.waitForTimeout(600)
  await board(page, DI)
  const c = page.locator(`#schedBoard [data-oilsent="${OPS}"]:visible`).first()
  await c.evaluate(e => e.scrollIntoView({ block: 'center' })); await c.click(); await page.waitForTimeout(400)
  await page.locator('.availwin .rpuck .puck').first().click(); await page.waitForTimeout(200)
  const t = await page.evaluate(() => { const x = document.getElementById('toastEl'); if (!x) return null
    const b = x.getBoundingClientRect(), w = document.querySelector('.availwin').getBoundingClientRect()
    return { text: x.textContent, shown: x.style.opacity !== '0', toastZ: +getComputedStyle(x).zIndex,
      windowZ: +getComputedStyle(document.querySelector('.availwin')).zIndex, overlaps: b.top < w.bottom && b.bottom > w.top } })
  await shot(page, '31-phone-refusal-toast-over-panel')
  return t
})
R.errors = errors.slice(0, 20)
console.log(JSON.stringify(R, null, 1))
await browser.close()
