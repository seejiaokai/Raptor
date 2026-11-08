import { newWorld, sleep, close, shot, VERSION } from './oeb-w2-lib.mjs'
console.log(VERSION, 'explore5 inputs')
const w = await newWorld(process.env.SIZE || 'pc', 'sat')
const { page } = w
const tap = async l => (w.phone ? l.tap() : l.click())
try {
  await page.evaluate(() => window.go('inputs')); await sleep(800)
  if (await page.locator('#inCalBtn').count()) { await page.locator('#inCalBtn').click().catch(() => {}); await sleep(300) }
  console.log('cal heading', await page.locator('#inpCal .ic-mon').first().innerText().catch(e => 'none'))
  const d = page.locator('#inpCal [data-icday="2026-07-18"]')
  console.log('day count', await d.count())
  await d.first().scrollIntoViewIfNeeded()
  await d.first().click({ position: { x: 8, y: 8 } }).catch(e => console.log('click', e.message.slice(0, 80)))
  await sleep(300)
  console.log('add btn', await page.locator('#icPopAdd').count())
  if (w.phone) await page.locator('#icPopAdd').tap(); else await page.locator('#icPopAdd').click()
  await page.waitForSelector('[data-testid="win-inputedit"]'); await sleep(300)
  console.log('types', await page.locator('#inpEditType option').evaluateAll(o => o.map(x => x.value + ':' + x.textContent)))
  console.log('people', await page.locator('#inpEditPerson option').evaluateAll(o => o.map(x => x.value + ':' + x.textContent).slice(0, 12)))
  await shot(w, 'zz-explore-inputwin-' + w.size)
  console.log(w.errors)
} finally { await close(w) }
