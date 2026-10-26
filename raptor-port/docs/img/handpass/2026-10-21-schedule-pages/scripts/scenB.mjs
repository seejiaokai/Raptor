import { launch, login, go, shot } from './common.mjs'
const size = process.argv[2] || 'desktop'
const tag = size === 'phone' ? 'ph' : 'dk'
const { browser, ctx, page, errors, hook } = await launch(size)
await login(page)
await go(page, 'editsched')
const air = page.locator('.airbtn[data-air]:visible').first()
console.log('traffic buttons visible:', await page.locator('.airbtn[data-air]:visible').count())
await air.scrollIntoViewIfNeeded(); await air.click(); await page.waitForTimeout(500)
const rows = () => page.locator('#airBody [data-airi]')
console.log('title:', await page.locator('#airTitle').innerText(), 'rows:', await rows().count())
await shot(page, `B1-${tag}-traffic-open`)
if (await rows().count() === 0) { await page.click('#airAdd'); await page.waitForTimeout(400); console.log('after Add row rows:', await rows().count()) }
const box = rows().first()
console.log('row0 value:', await box.inputValue())
await box.click()
await page.keyboard.press('End')
await page.keyboard.type(' ABC', { delay: 40 })
const state = (label) => page.evaluate(l => { const a = document.activeElement; return l + ': active=' + (a && a.tagName) + ' data-airi=' + (a && a.dataset && a.dataset.airi) + ' value=' + (a && a.value) + ' caret=' + (a && a.selectionStart) + '/' + (a && a.value && a.value.length) + ' inAirBody=' + !!(a && a.closest && a.closest('#airBody')) }, label)
console.log(await state('before repaint'))
await shot(page, `B2-${tag}-traffic-typed-before-repaint`)
const nodeBefore = await page.evaluate(() => { const i = document.querySelector('#airBody [data-airi]'); window.__airNode = i; return true })

// ROUTE 1: second tab in same context
const p2 = await ctx.newPage(); hook(p2)
await p2.goto('http://localhost:4291/')
await p2.waitForTimeout(1500)
const needLogin = await p2.locator('#luser').count()
console.log('second tab shows login?', needLogin)
if (needLogin) await login(p2)
await go(p2, 'editsched')
// make a change on tab 2: type into a day note? use undo-visible change: add scheduler note? use the Logic crew rest
await go(p2, 'logic'); await p2.click('#lgEdit'); await p2.waitForTimeout(300)
const cr = p2.locator('.lgset[data-lgkey="crewRest"] input').first()
await cr.click(); await p2.keyboard.press('Control+A'); await p2.keyboard.type('11h'); await p2.keyboard.press('Enter'); await p2.waitForTimeout(800)
console.log('tab2 crewRest now', await cr.inputValue())
await page.bringToFront(); await page.waitForTimeout(1500)
console.log(await state('after switching back (route 1)'))
const vc1 = await page.evaluate(() => ({ crew: window.VCONF && window.VCONF.crewRest, sameNode: window.__airNode === document.querySelector('#airBody [data-airi]'), val: document.querySelector('#airBody [data-airi]')?.value }))
console.log('route 1 tab1 saw other tab change?', JSON.stringify(vc1))
await p2.close()

// ROUTE 2: bridge notify
const route2 = async (lbl) => {
  await page.evaluate(() => { window.__mut = 0; window.__mo = new MutationObserver(r => { window.__mut += r.length }); window.__mo.observe(document.querySelector('#airpop'), { childList: true, subtree: true, attributes: true, characterData: true }); window.__ver0 = document.querySelector('#eWeek')?.innerHTML.length })
  await page.evaluate(() => window.renderEditWeek())
  await page.waitForTimeout(500)
  console.log(await state(lbl)); console.log(' mutations inside traffic window during repaint:', await page.evaluate(() => window.__mut), '; eWeek html length before/after', await page.evaluate(() => window.__ver0), await page.evaluate(() => document.querySelector('#eWeek')?.innerHTML.length))
  console.log(' node kept:', await page.evaluate(() => window.__airNode === document.querySelector('#airBody [data-airi]')), 'is __airNode connected:', await page.evaluate(() => window.__airNode.isConnected))
}
await route2('after renderEditWeek() notify')
await shot(page, `B3-${tag}-traffic-after-repaint`)
await page.keyboard.type('XYZ', { delay: 40 })
console.log(await state('after typing more'))
await shot(page, `B4-${tag}-traffic-kept-typing`)
// real repaint from a real action: toggle something else? press Escape-less. Also a second notify
await page.evaluate(() => { window.renderSchedule(); window.renderStatus && window.renderStatus() })
await page.waitForTimeout(400)
console.log(await state('after 2 more notifies'))
console.log('ERRORS', JSON.stringify(errors))
await browser.close()
