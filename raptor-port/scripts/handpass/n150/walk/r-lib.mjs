// The re-walk's own helpers (chat 151, 23 Nov 26), on top of vlib.mjs. Every step presses the app's own controls; the
// page is read for facts only. A check prints the value it judged and writes PASS or FAIL into the facts.
import { note, facts, state, pic, closeMenuOutside, PICS, shots } from './vlib.mjs'

export const T = id => `[data-testid="${id}"]`
export const checks = []
/* a check of the RIGHT behaviour: PASS means correct; the value judged is printed beside it */
export function check(name, ok, seen) {
  const v = ok ? 'PASS' : 'FAIL'
  checks.push({ name, v, seen }); facts[`check:${name}`] = { v, seen }
  note(`${v} ${name} — seen: ${typeof seen === 'string' ? seen : JSON.stringify(seen)}`)
  return ok
}
/* the menu shut by presses outside it, as many as it takes (fix 4: the first closes only an open list) */
export async function shutMenu(s) { for (let i = 0; i < 3 && (await state(s)).drawerOpen; i++) await closeMenuOutside(s) }
/* what lies on top of a control's middle: 'self' when a press there reaches it */
export const over = (s, sel) => s.page.evaluate(sel => {
  const b = [...document.querySelectorAll(sel)].find(e => e.getBoundingClientRect().width > 0); if (!b) return 'none'
  const r = b.getBoundingClientRect(); const t = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2)
  return t ? (b.contains(t) ? 'self' : `${t.tagName.toLowerCase()}.${String(t.className).slice(0, 40)}|${t.dataset?.testid || t.id || ''}`) : 'nothing'
}, sel)
/* the windows drawn now: their test id, their band's words (drawn parts only), the typed words in their boxes, whether
   their body is held (inert parts) */
export const wins = s => s.page.evaluate(() => [...document.querySelectorAll('.bidsheet, .floatwin')].filter(e => e.getBoundingClientRect().width > 0).map(e => {
  const band = [...e.querySelectorAll('.moveband')].find(b => b.getBoundingClientRect().width > 0)
  return {
    tid: e.dataset.testid || e.querySelector('[data-testid]')?.dataset.testid || '',
    band: band ? band.textContent.replace(/\s+/g, ' ').replace(/Close$/, '').trim() : null,
    bandClose: band ? !!band.querySelector('button') : false,
    held: e.querySelectorAll('[data-heldro]').length,
    typed: [...e.querySelectorAll('textarea, input')].filter(i => i.getBoundingClientRect().width > 0 && i.type !== 'file').map(i => i.value).filter(Boolean),
  }
}))
/* the parts of the ☰ menu's head a person sees, measured: the mark, the list, the grey line, MENU, the first page */
export const menuGeo = s => s.page.evaluate(() => {
  const g = sel => { const e = document.querySelector(sel); if (!e) return null; const b = e.getBoundingClientRect(); if (!(b.width > 0)) return null; return { x: Math.round(b.left), y: Math.round(b.top), w: Math.round(b.width), h: Math.round(b.height), bottom: Math.round(b.bottom) } }
  return { mark: g('.drawer-sqn > :first-child'), list: g('#drawerSqnList'), row1: g('#drawerSqnList .sqm-row'), line: g('#drawerSqnLine'), menuH: g('#drawer .drawer-panel > h4'), page1: g('#drawerNav a'), vh: innerHeight, panelScroll: Math.round(document.querySelector('#drawer .drawer-panel')?.scrollTop ?? -1) }
})
/* a picture right after a press (phone: within ~100 ms of the lift), then the settled one later by the caller */
export async function quick(s, name) { await s.page.waitForTimeout(60); await s.page.screenshot({ path: `${PICS}/${name}-justtapped.png` }); shots.push(`${name}-justtapped`) }
/* a press held about a second at a point: a mouse on the desktop and in WebKit (whose touches cannot be held by the test
   browser), a real finger over Chromium's own touch input where the page is a Chromium phone */
export async function hold(s, x, y, ms, name, cdp) {
  const { page } = s
  if (cdp) {
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] })
    await page.waitForTimeout(ms / 2); if (name) { await page.screenshot({ path: `${PICS}/${name}-midhold.png` }); shots.push(`${name}-midhold`) }
    await page.waitForTimeout(ms / 2)
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
  } else {
    await page.mouse.move(x, y); await page.mouse.down()
    await page.waitForTimeout(ms / 2); if (name) { await page.screenshot({ path: `${PICS}/${name}-midhold.png` }); shots.push(`${name}-midhold`) }
    await page.waitForTimeout(ms / 2)
    await page.mouse.up()
  }
  if (name) await quick(s, name)
  await page.waitForTimeout(450)
}
export { pic }
