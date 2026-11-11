/* pdl-w1-s5b v1 — S5 follow-up: does Escape close the changes window (a) after a click on the day's count, (b) after a click inside the window; Escape on a window opened by the keyboard */
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
const HERE = dirname(fileURLToPath(import.meta.url))
const RUN = process.env.RUN || 's5b'
process.env.HP_URL ||= 'http://localhost:4291'
process.env.HP_SHOTS ||= resolve(HERE, '../../../docs/img/handpass/2026-11-12-published-day-logic-settings/w1/' + RUN)
console.log('pdl-w1-s5b v1', process.env.HP_SHOTS)
const P = await import('./pdl-w1-lib.mjs')
const { X, L, sleep, row } = P
const w = await X.world('desktop')
const { page } = w
const man = w.ID('Vandal')
await P.openBoard(w, 1); console.log('Tue edit', JSON.stringify(await P.line(w, 1, { to: '12:00', ld: '13:00', who: man }))); await L.closeBoard(page)
await L.go(page, 'editsched'); await sleep(600)
const titleLoc = page.locator('text=/^Changes · /').first()
const open = async () => (await titleLoc.count()) && (await titleLoc.isVisible().catch(() => false))
const cnt = page.locator('#eWeek .day[data-day="1"] .dpend:visible').first()
const label = (await cnt.innerText()).replace(/\s+/g, ' ')
const act = async () => page.evaluate(() => { const a = document.activeElement; return a ? a.tagName + '#' + a.id + '.' + String(a.className).slice(0, 30) + '|' + (a.textContent || '').trim().slice(0, 20) : 'none' })
/* (a) click the count, Escape at once */
await cnt.click(); await sleep(700)
const o1 = await open(); const act1 = await act()
await page.keyboard.press('Escape'); await sleep(600)
const a = await open()
await P.shotPage(page, 's5b-a-after-escape-focus-on-count')
console.log('a: opened', o1, 'focus', act1, 'still open after Escape', a)
/* (b) click inside the window (its title), Escape */
if (a) {
  await titleLoc.click(); await sleep(300)
  const act2 = await act()
  await page.keyboard.press('Escape'); await sleep(600)
  const b = await open()
  await P.shotPage(page, 's5b-b-after-escape-focus-in-window')
  console.log('b: focus', act2, 'still open after Escape', b)
  row('S5.D4b Escape on the changes window', 'RECORDED', `opened from the "${label}" count; focus after the press: ${act1}; Escape straight after: still open = ${a}; after a click inside the window (focus ${act2}) then Escape: still open = ${b}`, 's5b-a-*.png, s5b-b-*.png')
  if (b) { const x = titleLoc.locator('xpath=ancestor::*[.//button[normalize-space()="✕"]][1]').locator('button:has-text("✕")').first(); await x.click(); await sleep(500); console.log('closed with ✕:', !(await open())) }
} else row('S5.D4b Escape on the changes window', 'RECORDED', `opened from the "${label}" count; Escape straight after closed it (focus ${act1})`, 's5b-a-after-escape-focus-on-count.png')
P.finish(w)
await w.browser.close()
