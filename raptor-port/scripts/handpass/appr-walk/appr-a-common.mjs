// appr-a-common.mjs v1 — walker A's shared helpers (built on the host's appr-pc-lib.mjs)
import * as A from '../appr-pc-lib.mjs'
import { appendFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
export { A }
export const { sleep, T, PAGE, geo, launchReal125, launchPhone, launchDesk, stageWorld, watchErrors, signIn, logout, openApprovals } = A
export const OUT = A.OUT
export const results = []   // {id, verdict, text}
let logFile = null
export function initLog(name) { logFile = path.join(OUT, name); writeFileSync(logFile, '') }
export const note = s => { console.log(s); if (logFile) appendFileSync(logFile, s + '\n') }
export const check = (id, ok, what) => { const v = ok ? 'PASS' : 'FAIL'; results.push({ id, v, what }); note(`  ${v} ${id}: ${what}`); return ok }
export async function windowCtl(page) {
  const cdp = await page.context().newCDPSession(page)
  const { windowId } = await cdp.send('Browser.getWindowForTarget')
  return async (width, height) => {
    await cdp.send('Browser.setWindowBounds', { windowId, bounds: { windowState: 'normal' } })
    await cdp.send('Browser.setWindowBounds', { windowId, bounds: { width, height } })
    await sleep(700)
  }
}
export const scMid = page => page.evaluate(sel => { const r = document.querySelector(`${sel} .appr-scroll`).getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 } }, PAGE)
export const listY = page => page.evaluate(sel => document.querySelector(`${sel} .appr-scroll`)?.scrollTop ?? null, PAGE)
export const winRoom = page => page.evaluate(() => { const se = document.scrollingElement; return +(se.scrollHeight - se.clientHeight).toFixed(2) })
/* wheel the list by `dy` with the real mouse over the scroller, in 100px ticks */
export async function wheelList(page, dy, step = 100) {
  const m = await scMid(page); await page.mouse.move(m.x, m.y)
  let left = Math.abs(dy); const sgn = Math.sign(dy)
  while (left > 0) { const s = Math.min(step, left); await page.mouse.wheel(0, sgn * s); left -= s; await sleep(50) }
  await sleep(350)
}
/* boxes of the page's parts */
export const boxes = page => page.evaluate(sel => {
  const b = e => { if (!e) return null; const r = e.getBoundingClientRect(); return { l: +r.left.toFixed(2), t: +r.top.toFixed(2), r: +r.right.toFixed(2), b: +r.bottom.toFixed(2), w: +r.width.toFixed(2), h: +r.height.toFixed(2) } }
  const q = s => document.querySelector(`${sel} ${s}`)
  const o = { title: b(q('.appr-title')), card: b(q('.appr-card')), cols: b(q('.appr-cols')), scroller: b(q('.appr-scroll')), approveAll: b(q('[data-testid="appr-approve-all"]')), pick: b(q('[data-testid="appr-pick"]')) }
  for (const id of ['appr-new', 'appr-all', 'appr-m-2026-01', 'appr-m-2026-02', 'appr-m-2026-03']) o[id] = b(q(`[data-testid="${id}"]`))
  return o
}, PAGE)
export function diffBoxes(a, bx, ignore = []) {
  const out = []
  for (const k of Object.keys(a)) {
    if (ignore.includes(k)) continue
    const x = a[k], y = bx[k]
    if (!x && !y) continue
    if (!x || !y) { out.push(`${k}: ${x ? 'present' : 'absent'} -> ${y ? 'present' : 'absent'}`); continue }
    const d = ['l', 't', 'r', 'b'].map(p => Math.abs(x[p] - y[p]))
    if (Math.max(...d) > 1.01) out.push(`${k}: l ${x.l}->${y.l} t ${x.t}->${y.t} r ${x.r}->${y.r} b ${x.b}->${y.b}`)
  }
  return out
}
export const lineIds = page => page.evaluate(sel => [...document.querySelectorAll(`${sel} [data-testid^="appr-line-"]`)].map(e => e.dataset.testid), PAGE)
/* a line's state: lit text of its approve/refuse buttons, box, and whether wholly inside the scroller */
/* BY INDEX: ids repeat for one person's several requests */
export const lineInfo = (page, idx) => page.evaluate(([sel, idx]) => {
  const l = document.querySelectorAll(`${sel} [data-testid^="appr-line-"]`)[idx]; if (!l) return null
  const r = l.getBoundingClientRect(); const scr = document.querySelector(`${sel} .appr-scroll`)?.getBoundingClientRect(); const cb = document.querySelector(`${sel} .appr-cols`)?.getBoundingClientRect()
  const sc = scr && { top: Math.max(scr.top, cb ? cb.bottom : 0), bottom: scr.bottom - 6 }
  const ap = l.querySelector('[data-testid="appr-approve"]'), rf = l.querySelector('[data-testid="appr-refuse"]')
  const tx = e => e ? e.innerText.replace(/\s+/g, ' ').trim() : null
  return { idx, id: l.dataset.testid, text: l.innerText.replace(/\s+/g, ' ').slice(0, 60), top: +r.top.toFixed(1), bottom: +r.bottom.toFixed(1), inView: sc ? r.top >= sc.top - 0.5 && r.bottom <= sc.bottom + 0.5 : null, approve: tx(ap), refuse: tx(rf), apPressed: ap?.getAttribute('aria-pressed'), rfPressed: rf?.getAttribute('aria-pressed') }
}, [PAGE, idx])
export const nthLine = (page, idx) => page.locator(`${PAGE} [data-testid^="appr-line-"]`).nth(idx)
/* counts: the Approvals tab's count and Approve all's words */
export const counts = page => page.evaluate(() => {
  const tab = document.querySelector('[data-testid="lw-tab-approvals"]'); const aa = document.querySelector('[data-testid="appr-approve-all"]')
  return { tab: tab ? tab.innerText.replace(/\s+/g, ' ').trim() : null, approveAll: aa ? aa.innerText.replace(/\s+/g, ' ').trim() : null }
})
/* a picture of everything / a clip */
export const shot = async (page, name, clip) => { const f = path.join(OUT, 'appr-a-' + name + '.png'); await page.screenshot({ path: f, ...(clip ? { clip } : {}) }); return 'appr-a-' + name + '.png' }
/* a line wholly inside the scroller? wheel (never set scrollTop) until the line is in the middle of the list */
export async function wheelToLine(page, id) {
  for (let i = 0; i < 40; i++) {
    const info = await lineInfo(page, id); if (!info) return null
    const sc = await page.evaluate(sel => { const r = document.querySelector(`${sel} .appr-cols`).getBoundingClientRect(); return { t: r.bottom } }, PAGE)
    if (info.inView) return info
    await wheelList(page, info.top < sc.t ? -100 : 100, 100)
  }
  return lineInfo(page, id)
}
export function summary() {
  const c = { PASS: 0, FAIL: 0 }; for (const r of results) c[r.v]++
  note(`SUMMARY ${c.PASS} PASS, ${c.FAIL} FAIL`)
  return c
}
