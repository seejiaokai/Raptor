// W1 part B1 — scenarios 11 and 15 at 390x844 (touch), one context. VERSION 1
import { start, openCalendarWindow, press, shot, text, rect, vis, swipeOn, cardOnTop, pass, rec, summary, results } from './lib.mjs'
console.log('w1/b1.mjs VERSION 1')
const SZ = '390x844'
const L = await start(390, 844)
const { page } = L
const month = () => text(L, '[data-testid="days-month"]')
const step = async (id, fn) => { try { await fn() } catch (e) { rec(id, SZ, 'NOT WALKED', 'the script stopped: ' + String(e).split('\n')[0].slice(0, 200)); await shot(L, `s${id}-STOPPED`).catch(() => {}) } }
/* what each date of the shown month reads: its kind (from the class) */
const kinds = () => page.evaluate(() => [...document.querySelectorAll('[data-testid^="days-step-"]')].map(b => ({ iso: b.getAttribute('data-testid').slice(10), cls: b.className.replace('days-step', '').trim(), aria: b.getAttribute('aria-label') })))
const nfList = async () => (await kinds()).filter(k => /nf/.test(k.cls)).map(k => k.iso.slice(5))
const nfAll = async () => {
  const out = {}
  const m0 = await month()
  out[m0] = await nfList()
  for (let i = 0; i < 2; i++) { await swipeOn(L, '[data-testid="days-grid"]', -140, 0, 0.5, 0.3); out[await month()] = await nfList() }
  for (let i = 0; i < 2; i++) await swipeOn(L, '[data-testid="days-grid"]', 140, 0, 0.5, 0.3)
  return out
}
const dumpEvery = () => page.evaluate(() => [...document.querySelectorAll('[data-testid="win-every"] [data-testid], [data-testid="win-every"] button')].map(e => (e.getAttribute('data-testid') || '') + ' | ' + (e.innerText || '').replace(/\s+/g, ' ').slice(0, 50)).filter((x, i, a) => a.indexOf(x) === i))

await openCalendarWindow(L)
await page.evaluate(() => 0)
const before = await nfAll()
console.log('NF before:', JSON.stringify(before))

await step('11', async () => {
  await press(L, '[data-testid="days-wd-3"]')
  await page.waitForSelector('[data-testid="win-every"]')
  const fromTxt = await text(L, '[data-testid="every-from"]')
  await press(L, '[data-testid="every-from"]')
  const c = await cardOnTop(L, 'From')
  const info = await page.evaluate(() => {
    const card = document.querySelector('[data-testid="dcal-card"]')
    const dow = [...card.querySelector('[data-testid="dcal-dow"]').children].map(e => ({ t: e.innerText, cls: e.className, fw: getComputedStyle(e).fontWeight, col: getComputedStyle(e).color, bg: getComputedStyle(e).backgroundColor }))
    const th = card.querySelector('[data-testid="dcal-day-2026-10-08"]'), tu = card.querySelector('[data-testid="dcal-day-2026-10-06"]')
    const w = e => getComputedStyle(e.querySelector('b') || e).fontWeight
    return { title: card.querySelector('[data-testid="dcal-title"]').innerText.replace(/\s+/g, ' '), dow, thuWeight: w(th), thuCls: th.className, tueWeight: w(tu), tueCls: tu.className, marked: [...card.querySelectorAll('[data-iso].is-mk')].map(e => e.getAttribute('data-iso').slice(8)).join(',') }
  })
  const f1 = await shot(L, 's11-from-calendar-open')
  await page.locator('[data-testid="dcal-day-2026-10-20"]').tap(); await page.waitForTimeout(400)
  const gone = !(await vis(L, '[data-testid="dcal-card"]'))
  const fromAfter = await text(L, '[data-testid="every-from"]'), says = await text(L, '[data-testid="every-says"]')
  const f2 = await shot(L, 's11-after-tap-tuesday')
  const ok1 = c.onScreen && c.onTop && /^(Thu|Mon|Tue|Wed|Fri|Sat|Sun) \d+ \w+ \d{4}/.test(fromTxt) && gone && /Tue 20 Oct 2026/.test(fromAfter) && /from Tue 20 Oct 2026 onward/.test(says)
  pass('11', SZ, ok1, `From box before: "${fromTxt}"; calendar box ${JSON.stringify({ l: c.l, t: c.t, r: c.r, b: c.b })} on screen ${c.onScreen}, on top ${c.onTop}; title "${info.title}"; weekday heads ${JSON.stringify(info.dow.map(d => `${d.t}:${d.cls || '-'}:${d.fw}:${d.col}`))}; THU date weight ${info.thuWeight} (${info.thuCls}) vs TUE date weight ${info.tueWeight} (${info.tueCls}); marked dates ${info.marked}; after tapping Tue 20 Oct: calendar gone ${gone}, box reads "${fromAfter}", sentence "${says}"`, f2)
  rec('11-pic', SZ, 'RECORD', 'picture of the calendar open on From (centre of the screen): ' + f1, f1)
  await press(L, '[data-testid="every-save"]'); await page.waitForTimeout(500)
  const winOpen = await vis(L, '[data-testid="win-every"]')
  const after = await nfAll(); const f3 = await shot(L, 's11-after-save-month')
  rec('11-nf', SZ, 'RECORD', `after Save the "Every ..." window is ${winOpen ? 'still open' : 'closed'}; dates reading NF (non weekend ones are the Thursdays; weekends also show a dash and are not listed) by month: ${JSON.stringify(after)}; before the rule: ${JSON.stringify(before)}`, f3)
})
await step('15', async () => {
  await press(L, '[data-testid="days-wd-3"]')
  await page.waitForSelector('[data-testid="win-every"]')
  console.log('Every window parts:', JSON.stringify(await dumpEvery()))
  const listed = await text(L, '[data-testid="win-every"]')
  const fl = await shot(L, 's15-every-window-with-rule')
  const rm = page.locator('[data-testid="win-every"] button', { hasText: /^Remove$/ }).first()
  if (!(await rm.count())) { rec('15', SZ, 'NOT WALKED', 'no Remove button found in the Every Thursday window; text: ' + listed.slice(0, 300), fl); return }
  const u0 = await page.evaluate(() => ({ undo: document.getElementById('undoBtn').disabled, redo: document.getElementById('redoBtn').disabled }))
  await rm.tap(); await page.waitForTimeout(500)
  const after = await text(L, '[data-testid="win-every"]').catch(() => '(window gone)')
  const open1 = await vis(L, '[data-testid="win-every"]')
  const f1 = await shot(L, 's15-after-remove')
  const u1 = await page.evaluate(() => ({ undo: document.getElementById('undoBtn').disabled, redo: document.getElementById('redoBtn').disabled }))
  /* the month behind: close the Every window (Cancel) to read the month */
  if (open1) { const cx = page.locator('[data-testid="every-cancel"]'); if (await cx.count()) await cx.first().tap(); await page.waitForTimeout(300) }
  const nfRm = await nfAll()
  const f2 = await shot(L, 's15-month-after-remove')
  await page.locator('#undoBtn').tap(); await page.waitForTimeout(500)
  const u2 = await page.evaluate(() => ({ undo: document.getElementById('undoBtn').disabled, redo: document.getElementById('redoBtn').disabled }))
  const nfUn = await nfAll()
  const f3 = await shot(L, 's15-month-after-undo')
  await press(L, '[data-testid="days-wd-3"]'); await page.waitForSelector('[data-testid="win-every"]')
  const listedUndo = await text(L, '[data-testid="win-every"]')
  const f4 = await shot(L, 's15-every-window-after-undo')
  rec('15', SZ, 'RECORD', `Remove: window text before "${listed.replace(/\s+/g, ' ').slice(0, 260)}"; after Remove the Every window is ${open1 ? 'still open' : 'gone'} reading "${String(after).replace(/\s+/g, ' ').slice(0, 260)}"; Undo/Redo disabled before ${JSON.stringify(u0)} after Remove ${JSON.stringify(u1)} after pressing Undo ${JSON.stringify(u2)}; NF by month after Remove ${JSON.stringify(nfRm)}; NF after Undo ${JSON.stringify(nfUn)}; Every window reopened after Undo reads "${listedUndo.replace(/\s+/g, ' ').slice(0, 260)}"`, f1)
})
console.log('\nRESULTS_JSON ' + JSON.stringify(results))
summary('b1')
await L.browser.close()
