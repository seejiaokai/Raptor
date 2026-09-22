/* WORDING 10 — the ALL AVAIL count chip promises "tap to see each one".
   WORDING 17 — no acknowledgement after any OIL gesture.
   The chip lives OUTSIDE the mode (inside it the sentinel is already opened
   out into real pucks), so 10 is tested there. */
import { open, board, openInputs, tap, shot, SHOTS } from './lib.mjs'
const L = []; const S = (k, v) => { L.push({ [k]: v }); return v }
const { browser, page, errors } = await open({ state: 'C:/Users/User/projects/Raptor/raptor-port/docs/handpass/state-sat.json' })
await board(page, 5)

/* ---- 10 ---------------------------------------------------------------- */
S('10 — the chip, outside the mode', await page.evaluate(() => {
  const c = [...document.querySelectorAll('.oilcount')].filter(e => e.offsetParent)
  return c.slice(0, 4).map(e => ({ txt: (e.innerText || '').trim(), promises: (e.title || '').slice(0, 70),
    sentinel: e.getAttribute('data-oilsent'), onBoard: !!e.closest('#schedBoard') }))
}))
const before = await page.evaluate(() => ({
  pop: document.querySelectorAll('.sentpop, .oilsentlist, [data-oilsentopen]').length,
  pucks: document.querySelectorAll('#schedBoard .puck').length,
  toast: (document.getElementById('toastEl')?.innerText || '').trim(),
}))
await page.evaluate(() => { const t = document.getElementById('toastEl'); if (t) t.innerText = '' })
await page.evaluate(() => {
  const c = [...document.querySelectorAll('#schedBoard .oilcount')].filter(e => e.offsetParent)[0]
    || [...document.querySelectorAll('.oilcount')].filter(e => e.offsetParent)[0]
  c && c.dispatchEvent(new MouseEvent('click', { bubbles: true }))
})
await page.waitForTimeout(1000)
S('10 — after tapping it', await page.evaluate(b => ({
  before: b,
  popsNow: document.querySelectorAll('.sentpop, .oilsentlist, [data-oilsentopen]').length,
  pucksNow: document.querySelectorAll('#schedBoard .puck').length,
  toast: (document.getElementById('toastEl')?.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 90),
  anyNewPanel: [...document.querySelectorAll('[class*=pop],[class*=sheet],[role=dialog]')].filter(e => e.offsetParent).length,
}), before))
await shot(page, 'w10-after-tapping-the-chip')

/* ---- 17: does any OIL gesture acknowledge itself? --------------------- */
await openInputs(page, 5)
await tap(page, '#sbOil'); await page.waitForTimeout(800)
const clear = () => page.evaluate(() => { const t = document.getElementById('toastEl'); if (t) t.innerText = '' })
const said = () => page.evaluate(() => ({
  toast: (document.getElementById('toastEl')?.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 90),
  opacity: document.getElementById('toastEl') ? getComputedStyle(document.getElementById('toastEl')).opacity : null,
}))
S('17 — entering the mode', await said())
await clear()
const item = await page.evaluate(() => (document.querySelector('#schedBoard .oilitem[data-oilitem]') || {}).getAttribute?.('data-oilitem'))
await tap(page, `[data-oilitem="${item}"]`); await page.waitForTimeout(800)
S('17 — a whole item switched off', await said())
await clear()
const who = await page.evaluate(() => (document.querySelector('#schedBoard .oilpk[data-oilp]') || {}).getAttribute?.('data-oilp'))
await tap(page, `[data-oilp="${who}"]`); await page.waitForTimeout(800)
S('17 — one man taken off', await said())
await clear()
await tap(page, '[data-oilblank="5"]'); await page.waitForTimeout(800)
S('17 — the whole-day blanket', await said())
await shot(page, 'w17-gestures')
console.log(JSON.stringify(L, null, 1)); console.log('errors:', errors.slice(0, 4))
console.log('shots in ' + SHOTS)
await browser.close()
