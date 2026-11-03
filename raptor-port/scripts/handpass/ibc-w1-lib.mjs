// Inputs batch check (3 Nov 26), walker W1 — shared helpers. Built on isr-B-lib.mjs (four sizes, windows, hit tests).
// Pictures land in <ISR_OUT>/B/ . Every write goes through the app's own controls; the probe bridge is only READ.
import * as B from './isr-B-lib.mjs'
import { writeFileSync } from 'node:fs'
import { join } from 'node:path'
export * from './isr-B-lib.mjs'
export const NAME = process.env.W1_NAME || 'w1'
export const rowsOut = []
export const row = (id, did, expected, saw, verdict, pics = '') => { const l = `ROW ${id} | ${did} | EXPECTED: ${expected} | SAW: ${typeof saw === 'string' ? saw : JSON.stringify(saw)} | ${verdict} | ${pics}`; rowsOut.push(l); B.results.push(l); console.log(l) }
export const finishRun = (name) => {
  writeFileSync(join(B.OUT, `results-w1-${name}.txt`), [...rowsOut, ...B.errs.map(e => 'BROWSER ' + e)].join('\n') + '\n')
  console.log(`done ${name}: ${rowsOut.length} rows, ${B.errs.length} browser errors`)
}
/* who holds the keys, in full */
export const act = page => page.evaluate(() => { const a = document.activeElement; if (!a) return null; return { tag: a.tagName, id: a.id || null, testid: a.getAttribute('data-testid'), icday: a.getAttribute('data-icday'), role: a.getAttribute('role'), cls: (a.className && a.className.toString ? a.className.toString() : '').slice(0, 40), text: (a.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 30), inWin: (a.closest('[data-testid^="win-"]') || {getAttribute: () => null}).getAttribute('data-testid') } })
export const wins = B.openWins
export async function signIn(page, user) {
  if (await page.locator('#logout').count()) { await page.locator('#logout').click(); await B.sleep(700) }
  await page.fill('#luser', user); await page.fill('#lpass', user === 'ad' ? 'a' : user)
  await page.click('#loginForm button[type=submit]')
  await page.waitForSelector('#vWeek .day', { state: 'attached' }); await B.sleep(500)
}
/* the keyboard onto a date of the Inputs month, as arrows would leave it (no click) */
export const focusDate = (page, iso) => page.locator(`#inpCal [data-icday="${iso}"]`).first().focus()
/* the front window mark, if the app wears one */
export const front = page => page.evaluate(() => { const f = document.querySelector('[data-front="true"], .floatwin.front, [data-testid^="win-"].front'); return f ? f.getAttribute('data-testid') : null })
/* Inputs page on its Inputs tab (not SANS / Medical), calendar mode, on a month */
export async function inputsCal(w, y, m) {
  await B.go(w.page, 'inputs')
  const t = w.page.locator('#inMemberMode')
  if (await t.count() && (await t.getAttribute('aria-selected')) !== 'true' && (await t.getAttribute('aria-pressed')) !== 'true') await B.press(w, t)
  await B.toInputsCal(w, y, m)
}
