// The Leave War fixes of 31 Oct 26 — the BEFORE walk (and its re-walk on the fixed build): shared helpers for
// lw-fx1031-1.mjs (R1), -2 (R2), -3 (R3). Builds on lw-rr-lib.mjs (a build served inside the browser, saved world, clock).
// Every script sets LW_OUT with `||=` BEFORE importing this; the pictures of a re-walk go to a folder of its own by setting
// LW_OUT first (a re-walk must never write over `before/`).
process.env.LW_OUT ||= '2026-10-31-lw-fixes/before'
import { readdirSync, unlinkSync } from 'node:fs'
import path from 'node:path'
export * from './lw-rr-lib.mjs'
import * as L from './lw-rr-lib.mjs'

/* only this script's own pictures are emptied (the four scripts share one folder) */
export function clearMine(prefix) {
  for (const f of readdirSync(L.OUT)) if (f.startsWith(prefix) && /\.(png|json)$/.test(f)) unlinkSync(path.join(L.OUT, f))
}
export const SIZE = process.env.SIZE || 'desk'
export async function world(who = 'admin') {
  const w = await L.newWorld(SIZE === 'phone' ? 'phone' : 'desk')
  await L.signInSaved(w, who); await L.toWar(w)
  return w
}
/* the war's lines for one man on Approvals: their words, lit state and the line's own reason text ("appr-why") */
export const apprRead = (w, pid) => w.page.evaluate(pid => [...document.querySelectorAll(`[data-testid="approvals-page"] [data-testid="appr-line-${pid}"]`)]
  .filter(e => e.getBoundingClientRect().height > 0)
  .map(e => ({ text: e.innerText.replace(/\s+/g, ' ').trim(), lit: e.className.match(/lit-(\w+)/)?.[1] || '', why: e.querySelector('[data-testid="appr-why"]')?.textContent.trim() || null,
    buttons: [...e.querySelectorAll('button')].filter(b => b.getBoundingClientRect().width > 0).map(b => (b.dataset.testid || '?') + (b.disabled ? '(disabled)' : '') + ':' + b.innerText.replace(/\s+/g, ' ').trim()) })), pid)
export async function toApprovals(w) { await L.toWar(w); await L.settle(w); await L.openApprovals(w) }
/* his cell on a day as drawn: the boxes' words and kinds */
export const cellWords = async (w, pid, d) => { const c = await L.cellInfo(w.page, pid, d); return c ? (c.boxes.map(b => `${b.text}:${(b.cls.match(/s-[awr]/) || [''])[0]}`).join(',') || 'empty') : 'no cell' }
/* the bid window's ⋯ → Post out with the chosen outcome and a posting date picked in the sheet's own calendar */
export async function postOutOn(w, pid, d, outcome, poDate, pic = null) {
  const P = w.page
  await L.toWar(w); await L.openGrid(w)
  await L.openCell(w, pid, d)
  await L.press(w, L.T('bid-more')); await P.waitForTimeout(250)
  await L.press(w, L.T('bid-postout')); await P.waitForTimeout(400)
  const chip = L.T(`po-${outcome}`)
  if ((await P.locator(chip).getAttribute('aria-pressed')) !== 'true') await L.press(w, chip)
  await P.waitForTimeout(200)
  const date0 = await P.locator(L.T('po-date')).getAttribute('data-value').catch(() => null)
  let calNote = ''
  if (date0 !== poDate) {
    await L.press(w, L.T('po-date')); await P.waitForTimeout(500)
    const day = P.locator(L.T(`dcal-day-${poDate}`)).first()
    if (!(await day.count())) calNote = `the sheet's calendar has no day ${poDate}`
    else {
      const dis = await day.evaluate(e => e.disabled || e.getAttribute('aria-disabled') === 'true' || e.classList.contains('off') || e.classList.contains('dis')).catch(() => false)
      calNote = dis ? `day ${poDate} is drawn disabled` : ''
      await L.press(w, L.T(`dcal-day-${poDate}`)); await P.waitForTimeout(500)
    }
    if (await L.vis(P, L.T('dcal-card'))) { await L.press(w, L.T('dcal-scrim')).catch(() => {}); await P.waitForTimeout(300) }
  }
  const date = await P.locator(L.T('po-date')).getAttribute('data-value').catch(() => null)
  const line = await L.txt(P, L.T('po-line'))
  const confirmDisabled = await P.locator(L.T('po-confirm')).evaluate(e => e.disabled).catch(() => null)
  if (pic) await L.shot(w, pic)
  let confirmed = false
  if (date === poDate && !confirmDisabled) { await L.press(w, L.T('po-confirm')); await P.waitForTimeout(600); confirmed = true }
  await L.settle(w)
  return { date0, date, line, calNote, confirmDisabled, confirmed }
}
/* what the last passing notes said */
export const said = (w, n = 3) => L.lastSaid(w, n)

/* THE RE-WALK'S VERDICTS (31 Oct 26, on the fixed build): each step that the rulings decide is recorded PASS or FAIL against
   the RIGHT behaviour — D1541 (a posting out refuses no leave), D1542 (the clash note's link for a man with no row), D1543
   (a half held by approved leave greys Whole day) and D1544 (Approve greyed on a refused bid under a medical). A step's
   pictures are named beside it; the RECORDED lines stay for what only a look can judge. */
export function check(id, size, ok, said, pics = []) { L.rec(id, size, ok ? 'PASS' : 'FAIL', said, pics) }
