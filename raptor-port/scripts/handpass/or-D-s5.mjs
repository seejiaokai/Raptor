// D5 — the people picker by touch
import { open, shot, sleep, log, errs, browser, press, csId, WIN, touchDrag, tapCdp } from './or-D-lib.mjs'
const { ctx, page } = await open()
await page.evaluate(() => window.go('inputs')); await sleep(500)
if (await page.locator('#inListBtn[aria-pressed="false"]').count()) { await press(page.locator('#inListBtn')); await sleep(300) }
await press(page.locator('#inNew')); await page.locator(WIN).waitFor(); await sleep(400)
await press(page.locator(`${WIN} [data-testid="pp-several"]`)); await sleep(300)
const info = () => page.evaluate(sel => {
  const w = document.querySelector(sel)
  const g = w.querySelector('[data-ppgroup="ph"]')
  const why = [...w.querySelectorAll('[data-testid="pp-phwhy"], .pp-phwhy, [class*="phwhy"]')].map(e => e.innerText.replace(/\s+/g, ' ').trim())
  return {
    count: (w.querySelector('[data-testid="pp-count"]') || {}).innerText,
    pressed: [...w.querySelectorAll('[data-pp][aria-pressed="true"]')].map(b => b.innerText.replace(/\s+/g, ' ').split(' ')[0]),
    ph: [...w.querySelectorAll('[data-ph]')].map(b => b.getAttribute('data-ph') + ':' + (b.getAttribute('aria-pressed') === 'true' ? 'on' : 'off') + (b.disabled ? ':greyed' : '')),
    group: g ? g.innerText.replace(/\s+/g, ' ').trim() : null, why,
  }
}, WIN)
const toPh = async () => { await page.locator(`${WIN} [data-ppgroup="ph"]`).evaluate(e => e.scrollIntoView({ block: 'center' })); await sleep(300) }
const tapPp = async cs => { const id = await csId(page, cs); const b = page.locator(`${WIN} [data-pp="${id}"]`); await b.evaluate(e => e.scrollIntoView({ block: 'center' })); await sleep(200); await b.tap(); await sleep(250) }
await toPh()
log('D5 opened:', JSON.stringify(await info()))
await shot(page, 'D5-01-placeholders-apart')
log('D5 groups in the picker, in order:', JSON.stringify(await page.evaluate(sel => [...document.querySelectorAll(`${sel} [data-ppgroup]`)].map(g => g.getAttribute('data-ppgroup') + ':' + (g.querySelector('[data-ph]') ? 'two placeholder pucks' : g.querySelectorAll('[data-pp]').length + ' people')), WIN)))
await tapPp('Drifter'); await tapPp('Hunter'); await tapPp('Saber')
await toPh()
log('D5 Drifter + Hunter picked (Saber, lit by default, put down):', JSON.stringify(await info()))
await shot(page, 'D5-02-two-picked')
await press(page.locator(`${WIN} [data-ph="allavail"]`)); await sleep(300)
log('D5 + ALL AVAIL tapped:', JSON.stringify(await info()))
await shot(page, 'D5-03-plus-allavail')
await press(page.locator(`${WIN} [data-ph="all"]`)); await sleep(300)
log('D5 then ALL tapped (swap, never both):', JSON.stringify(await info()))
await shot(page, 'D5-04-swapped-to-all')
await press(page.locator(`${WIN} [data-ph="allavail"]`)); await sleep(300)
log('D5 then ALL AVAIL tapped again:', JSON.stringify(await info()))
await press(page.locator(`${WIN} [data-ph="allavail"]`)); await sleep(300)
log('D5 ALL AVAIL tapped again (put down):', JSON.stringify(await info()))
// LL: greyed with the reason
await page.locator(`${WIN} #inpEditType`).evaluate(e => e.scrollIntoView({ block: 'center' })); await sleep(200)
await page.selectOption('#inpEditType', 'LL'); await sleep(400)
await toPh()
log('D5 type LL:', JSON.stringify(await info()))
await shot(page, 'D5-05-LL-greyed')
await page.locator(`${WIN} #inpEditType`).evaluate(e => e.scrollIntoView({ block: 'center' })); await sleep(200)
await page.selectOption('#inpEditType', 'Training'); await sleep(300)
await toPh()
log('D5 type Training, one day:', JSON.stringify(await info()))
// two days
const cal = page.locator('#inpEdCal'); await cal.evaluate(e => e.scrollIntoView({ block: 'center' })); await sleep(300)
log('D5 calendar month:', await page.locator('#inpEdCal .rc-mon').textContent(), '| dates before:', await page.evaluate(() => (document.querySelector('#inpEdCal') || {}).innerText && [...document.querySelectorAll('#inpEdCal [aria-pressed="true"],#inpEdCal .on,#inpEdCal .sel')].map(e => e.getAttribute('data-cal'))))
await page.locator('#inpEdCal [data-cal="2026-07-15"]').tap(); await sleep(250)
await page.locator('#inpEdCal [data-cal="2026-07-16"]').tap(); await sleep(350)
await toPh()
log('D5 Training 15 to 16 Jul (two days):', JSON.stringify(await info()))
await shot(page, 'D5-06-two-day-greyed')
// back to one day
await cal.evaluate(e => e.scrollIntoView({ block: 'center' })); await sleep(300)
await page.locator('#inpEdCal [data-cal="2026-07-15"]').tap(); await sleep(250)
await page.locator('#inpEdCal [data-cal="2026-07-15"]').tap(); await sleep(350)
await toPh()
log('D5 back to one day:', JSON.stringify(await info()))
// a finger dragged across pucks: first row of pilots
await tapPp('Drifter'); await tapPp('Hunter')   // put both down
log('D5 before the drag:', JSON.stringify((await info()).pressed))
const ids = []; for (const cs of ['Ace', 'Cinch']) ids.push(await csId(page, cs))
const a = page.locator(`${WIN} [data-pp="${ids[0]}"]`); await a.evaluate(e => e.scrollIntoView({ block: 'center' })); await sleep(300)
const ba = await a.boundingBox(), bc = await page.locator(`${WIN} [data-pp="${ids[1]}"]`).boundingBox()
log('D5 drag from Ace to Cinch', JSON.stringify({ ba, bc }))
const c = await page.context().newCDPSession(page)
const pt = (x, y) => [{ x: Math.round(x), y: Math.round(y), id: 1 }]
await c.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: pt(ba.x + ba.width / 2, ba.y + ba.height / 2) })
for (let i = 1; i <= 16; i++) { await c.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: pt(ba.x + ba.width / 2 + (bc.x + bc.width / 2 - ba.x - ba.width / 2) * i / 16, ba.y + ba.height / 2) }); await sleep(30) }
await c.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); await c.detach().catch(() => {}); await sleep(500)
log('D5 after the finger drag across Ace, Anvil, Blade, Cinch:', JSON.stringify(await info()))
await shot(page, 'D5-07-finger-drag')
log(errs)
await ctx.close(); await browser.close()
