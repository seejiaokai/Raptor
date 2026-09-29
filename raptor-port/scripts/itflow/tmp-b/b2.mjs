import { chromium } from 'playwright'
import { browser, fresh, go, cap, center, around, mid, menuDump, toastOf, typeIn, modals, mdrag, errors, SP } from './lib.mjs'
const log = (...a) => console.log(...a)
const ONLY = process.argv[2]
const run = async (name, fn) => { if (ONLY && !ONLY.split(',').includes(name)) return; log('\n=== ' + name); const page = await fresh(); await go(page, 'editsched'); try { await fn(page) } catch (e) { log('ERR', e.message.split('\n')[0]) } await page.context().close() }
const board = async (page, di = 0) => { await page.click(`#eWeek [data-sbday="${di}"]:visible`); await page.waitForSelector('#schedBoard'); await page.waitForTimeout(800) }

await run('board-inputs', async (page) => {
  await board(page)
  await center(page, '#schedBoard [data-inpadd="0.g"]')
  const g0 = await page.locator('#schedBoard [data-grdel]').count()
  await page.click('#schedBoard [data-inpadd="0.g"]'); await page.waitForTimeout(600)
  await page.selectOption('#inpEditPerson', 'beams'); await page.selectOption('#inpEditType', 'Meeting')
  await page.waitForTimeout(300)
  await cap(page, 'b7-newinput', around(720, 450, 700), [{ n: 1, sel: '#inpEditPerson' }, { n: 2, sel: '#inpEditType' }, { n: 3, sel: '#inpEditSave' }])
  await page.click('#inpEditSave'); await page.waitForTimeout(800)
  log('ground rows', g0, '->', await page.locator('#schedBoard [data-grdel]').count(), 'toast', await toastOf(page))
  log('new row', await page.evaluate(() => [...document.querySelectorAll('#schedBoard .grnd [data-bfld$=".prog"]')].map(e => e.value).join(' | ')))
})
await run('week-accept', async (page) => {
  await page.click('#eWeek [data-pitog="0"]'); await page.waitForTimeout(500)
  const acc = await page.evaluate(() => [...document.querySelectorAll('#eWeek .day[data-day="0"] [data-acc]')].map(e => `${e.dataset.acc} "${e.innerText}" t="${e.title.slice(0, 70)}" @${Math.round(e.getBoundingClientRect().x)},${Math.round(e.getBoundingClientRect().y)}`))
  log('accept buttons', acc)
  const b = page.locator('#eWeek .day[data-day="0"] [data-acc="g"]').first()
  if (await b.count()) {
    await b.evaluate(e => e.scrollIntoView({ block: 'center' })); await page.waitForTimeout(300)
    const bb = await b.boundingBox()
    await cap(page, 'b8-accept', around(280, bb.y + 20, 560), [{ n: 1, sel: '#eWeek .day[data-day="0"] [data-acc="g"]' }])
    await b.click(); await page.waitForTimeout(700)
    log('after accept toast', await toastOf(page), 'buttons', await page.evaluate(() => [...document.querySelectorAll('#eWeek .day[data-day="0"] [data-acc]')].map(e => e.dataset.acc + ':' + e.innerText)))
  }
})
await run('board-arm', async (page) => {
  await board(page)
  await center(page, '#schedBoard [data-fill="d:0.0.0.+"]')
  log('duty cell', await page.locator('#schedBoard [data-fill="d:0.0.0.+"]').innerText())
  await page.click('#schedBoard [data-fill="d:0.0.0.+"]'); await page.waitForTimeout(500)
  log('ARM', await page.evaluate(() => window.ARM ? window.ARM.key : 'none'), 'head', await page.evaluate(() => document.querySelector('#sbRoster')?.innerText.replace(/\s+/g, ' ').slice(0, 80)))
  await page.screenshot({ path: `${SP}/b2-board-armed.png` })
  await page.click('#sbRoster .rpuck[data-person="beams"]'); await page.waitForTimeout(600)
  log('duty after', await page.locator('#schedBoard [data-fill="d:0.0.0.+"]').innerText(), 'toast', await toastOf(page))
})
// phone: arm a seat → the drawer opens → tap a name
await run('phone', async () => {})
{
  if (!ONLY || ONLY.includes('phone')) {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true })
    const page = await ctx.newPage(); page.on('pageerror', e => errors.push(String(e)))
    await page.goto('http://localhost:4185/?fresh=1')
    await page.fill('#luser', 'ad'); await page.fill('#lpass', 'a'); await page.click('#loginForm button[type=submit]')
    await page.waitForSelector('#vWeek .day', { state: 'attached' }); await page.waitForTimeout(500)
    await go(page, 'editsched')
    await page.locator('#eWeek [data-sbday="0"]').first().tap(); await page.waitForSelector('#schedBoard'); await page.waitForTimeout(900)
    await page.screenshot({ path: `${SP}/b11-phone-board.png` })
    const c = page.locator('#schedBoard [data-fill="a:0.0.+"]').first()
    await c.evaluate(e => e.scrollIntoView({ block: 'center' })); await page.waitForTimeout(400)
    await c.tap(); await page.waitForTimeout(700)
    log('phone ARM', await page.evaluate(() => window.ARM ? window.ARM.key : 'none'), 'ros-open', await page.evaluate(() => document.body.classList.contains('ros-open')))
    await page.screenshot({ path: `${SP}/b11-phone-drawer.png` })
    const p = page.locator('#sbRoster .rpuck[data-person="beams"]').first()
    log('puck visible', await p.isVisible())
    await p.tap(); await page.waitForTimeout(700)
    log('phone after', (await c.innerText()).replace(/\s+/g, ' '), 'ros-open', await page.evaluate(() => document.body.classList.contains('ros-open')))
    await page.screenshot({ path: `${SP}/b11-phone-after.png` })
    await ctx.close()
  }
}
console.log(errors)
await browser.close()
