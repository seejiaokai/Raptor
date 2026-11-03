// Walker W2 shared helpers (Inputs batch check, 3 Nov 26) — notes' "Make public" on published days. Reads only; writes through controls.
import * as L from './isr-A-lib.mjs'
import { pubDay, face, editWeek, showDay, closeBoard, toGoOut, closeChg } from './isr-A-pub.mjs'
export { L, pubDay, face, editWeek, showDay, closeBoard, toGoOut, closeChg }
export const sleep = ms => new Promise(r => setTimeout(r, ms))
export const KEYS = { pn: 'prognotes', dtn: 'dutynotes', sn: 'simnotes', gn: 'gnotes' }
export const npub = (page, di) => page.evaluate(i => (window.DAYS[i] && window.DAYS[i].npub) || null, di)
export const dayKeys = (page, di) => page.evaluate(i => Object.keys(window.DAYS[i]).filter(k => /note/i.test(k)).map(k => k + '=' + JSON.stringify(window.DAYS[i][k]).slice(0, 80)), di)
export async function typeNote(page, key, di, words) {
  await editWeek(page); await showDay(page, di)
  const box = page.locator(`#eWeek .blknote.ed[data-txt="${key}:${di}"]`).first()
  if (!(await box.count())) return false
  await box.evaluate(e => e.scrollIntoView({ block: 'center' }))
  await box.click(); await page.keyboard.type(words); await sleep(150)
  await page.locator('#eWeek').evaluate(() => document.activeElement && document.activeElement.blur()); await sleep(500)
  return true
}
export const head = (page, key, di, surf = '#eWeek') => page.evaluate(([s, k, i]) => {
  const d = document.querySelector(`${s} .day[data-day="${i}"]`); if (!d) return null
  const b = d.querySelector(`[data-notepub="${k}:${i}"]`); if (!b) return { btn: null }
  const h = b.closest('.blknote-h, .sb-nh')
  const box = d.querySelector(`.blknote.ed[data-txt="${k}:${i}"]`)
  return { head: h ? (h.textContent || '').replace(/\s+/g, ' ').trim() : null, btn: (b.textContent || '').trim(), title: b.title, on: b.classList.contains('on'), boxCls: box ? box.className : null, boxParentCls: box && box.parentElement ? box.parentElement.className : null }
}, [surf, key, di])
export async function pressPub(page, key, di) {
  await editWeek(page); await showDay(page, di)
  const b = page.locator(`#eWeek [data-notepub="${key}:${di}"]`).first()
  if (!(await b.count())) return false
  await b.evaluate(e => e.scrollIntoView({ block: 'center' })); await b.click(); await sleep(600)
  return true
}
export async function viewNotes(page, di) {
  await closeBoard(page); await L.go(page, 'viewsched'); await showDay(page, di, '#vWeek')
  return page.evaluate(i => { const d = document.querySelector(`#vWeek .day[data-day="${i}"]`); if (!d) return null; return { notes: [...d.querySelectorAll('.blknote')].map(e => (e.textContent || '').replace(/\s+/g, ' ').trim()), heads: [...d.querySelectorAll('.blknote-h')].map(e => (e.textContent || '').replace(/\s+/g, ' ').trim()) } }, di)
}
export const undoTitle = page => page.evaluate(() => { const u = document.getElementById('undoBtn'), r = document.getElementById('redoBtn'); return { undo: u && u.title, undoOff: u && u.disabled, redo: r && r.title, redoOff: r && r.disabled } })
export async function signIn(page, user) {
  if (await page.locator('#logout').count()) { await page.locator('#logout').click(); await sleep(700) }
  await page.fill('#luser', user); await page.fill('#lpass', user === 'ad' ? 'a' : user)
  await page.click('#loginForm button[type=submit]')
  await page.waitForSelector('#vWeek .day', { state: 'attached' }); await sleep(500)
}
export async function reloadIn(page, user = 'ad') {
  await page.reload(); await sleep(900)
  if (await page.locator('#luser').isVisible().catch(() => false)) { await page.fill('#luser', user); await page.fill('#lpass', user === 'ad' ? 'a' : user); await page.click('#loginForm button[type=submit]') }
  await page.waitForSelector('#vWeek .day', { state: 'attached' }); await sleep(600)
}
