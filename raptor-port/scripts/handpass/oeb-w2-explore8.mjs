import { newWorld, sleep, close, shot, VERSION } from './oeb-w2-lib.mjs'
console.log(VERSION, 'explore8 filing')
const w = await newWorld('pc', 'sat')
const { page } = w
try {
  await page.evaluate(() => window.go('inputs')); await sleep(800)
  const d = page.locator('#inpCal [data-icday="2026-07-18"]').first()
  await d.click({ position: { x: 8, y: 8 } }); await sleep(300)
  await page.locator('#icPopAdd').click()
  await page.waitForSelector('[data-testid="win-inputedit"]'); await sleep(250)
  await page.selectOption('#inpEditType', 'LL')
  const opts = await page.locator('#inpEditPerson option').evaluateAll(o => o.map(x => x.value + ':' + x.textContent.trim()).slice(0, 8))
  console.log(opts)
  await page.selectOption('#inpEditPerson', { label: 'Ace' }).catch(e => console.log('label fail'))
  console.log('person now', await page.locator('#inpEditPerson').inputValue())
  await page.fill('#inpEditRmk', 'W2 LL')
  await shot(w, 'zz-explore-fill')
  await page.locator('#inpEditSave').click(); await sleep(700)
  await shot(w, 'zz-explore-saved')
  console.log(await page.evaluate(() => ({ n: window.INPUTS.length, last: window.INPUTS[window.INPUTS.length - 1], first: window.INPUTS[0] })))
  console.log(await page.evaluate(() => [...document.querySelectorAll('.floatwin')].map(e => e.className + ' ' + e.innerText.slice(0, 80))))
} finally { await close(w) }
