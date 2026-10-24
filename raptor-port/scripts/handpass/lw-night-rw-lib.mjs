// RE-WALK of the night of 25 Oct 26 (after the fixes of the walk and of the code read) — shared helpers. Pictures into docs/img/handpass/2026-10-25-lw-night/rewalk/.
// Builds on lw-night-w1-lib.mjs (the bubble's readings, tapPic, dragCells …) and lw-night-w2-lib.mjs (words, windows, the Inputs page's saved records).
process.env.LW_PORT ||= '4180'
process.env.LW_OUT = '2026-10-25-lw-night/rewalk'
export const H1 = await import('./lw-night-w1-lib.mjs')
export const H2 = await import('./lw-night-w2-lib.mjs')
export const L = H1.L
export const T = L.T
import path from 'node:path'
export const results = []
export const rec = (id, size, verdict, said, pics = []) => { results.push({ id, size, verdict, said, pics }); console.log(`${verdict}  ${id} [${size}]  ${said}  [${pics.join(', ')}]`) }
export const judge = (id, size, conds, said, pics) => {
  const bad = conds.filter(c => !c[1])
  rec(id, size, bad.length ? 'FAIL' : 'PASS', (bad.length ? 'FAILED: ' + bad.map(c => `${c[0]} (saw ${c[2]})`).join('; ') + ' — ' : '') + said, pics)
}
import { writeFileSync } from 'node:fs'
export const saveResults = name => { writeFileSync(path.join(L.OUT, `rw-${name}.json`), JSON.stringify(results, null, 1)); console.log('saved', results.length, '→', `rw-${name}.json`) }
export const sleep = (w, ms) => w.page.waitForTimeout(ms)
export const availCell = async (P, iso) => { const c = await H1.rowCell(P, `avail-p-${iso}`); return c ? `${c.text} ${H1.levelOf(c)}` : null }
/* Required P = Available P on a day (a weekday), at the red edge */
export async function f1(w, iso, extra = 0) {
  const P = w.page
  await P.evaluate(() => window.scrollTo(0, 0))
  const a0 = await H1.availP(w, iso)
  const req = await H1.setReq(w, iso, Number(a0) + extra); await P.waitForTimeout(300)
  const cell = await H1.rowCell(P, `avail-p-${iso}`)
  if (extra === 0 && H1.levelOf(cell) !== 'ok') throw new Error(`F1 ${iso}: Available P ${cell.text} ${H1.levelOf(cell)}`)
  return { a0, req, cell }
}
export const rowsOpen = P => P.evaluate(() => { const e = document.querySelector('[data-testid^="avail-p-"]'); return !!e && e.getBoundingClientRect().height > 0 })
export async function openRows(w) { const P = w.page; await P.evaluate(() => window.scrollTo(0, 0)); await P.waitForTimeout(250); if (!(await rowsOpen(P))) { await L.press(w, T('counts-toggle')); await P.waitForTimeout(600) } }
export async function foldRows(w) { const P = w.page; await P.evaluate(() => window.scrollTo(0, 0)); await P.waitForTimeout(250); if (await rowsOpen(P)) { await L.press(w, T('counts-toggle')); await P.waitForTimeout(600) } }
/* a raw tap/click at a point, no picture */
export async function rawTap(w, x, y, hold = 30) {
  if (w.cdp) { await w.cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y, id: 1 }] }); await w.page.waitForTimeout(hold); await w.cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }) }
  else if (w.phone) await w.page.touchscreen.tap(x, y)
  else await w.page.mouse.click(x, y)
}
export const undoTitle = P => P.evaluate(() => { const b = document.querySelector('#undoBtn'); return b ? { title: b.title, dis: b.disabled || b.getAttribute('aria-disabled') === 'true' } : null })
export const engineTag = (size, engine) => size === 'phone' ? (engine === 'webkit' ? 'phone/WebKit' : 'phone/Chromium') : 'desktop/Chromium'
export const shortTag = (size, engine) => size === 'phone' ? (engine === 'webkit' ? 'phw' : 'ph') : 'dk'
