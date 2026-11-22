/* msq-j2-w1-h3 v1 — W1's Leave War row look + person window (19 Nov 26) */
import * as Hm from './msq-j2-w1-h2.mjs'
export const rowClip = async (w, X, name, pid, cs) => {
  const page = w.page
  const c = await Hm.lwScroll(page, pid, Hm.T); await page.waitForTimeout(400)
  const box = await page.evaluate(([pid, d]) => {
    const e = document.querySelector(`[data-testid="cell-${pid}-${d}"]`); if (!e) return null
    const tr = e.closest('tr') || e.parentElement; const r = tr.getBoundingClientRect(); return { y: r.top, h: r.height }
  }, [pid, Hm.T])
  const file = X.L.SHOTS_DIR
  if (box) {
    const y = Math.max(0, box.y - 4), h = Math.min(box.h + 8, 864 - y)
    await page.screenshot({ path: process.env.HP_SHOTS + '/' + name + '-row.png', clip: { x: 0, y, width: 1536, height: h } })
  }
  await X.pic(w, name + '-page')
  const days = []; for (let n = -4; n <= 9; n++) days.push(Hm.iso(Hm.T, n))
  const r = await Hm.lwRow(page, pid, days)
  return r
}
export const sig = r => Object.entries(r).map(([d, v]) => d.slice(5) + '=' + v.replace(/ \{.*$/, '') + '|' + (v.match(/\{(.*)\}/) || ['', ''])[1]).join('  ')
/* open the person window from his name in the grid; returns its words */
export const personWin = async (w, X, name, pid) => {
  const page = w.page
  const el = page.locator(`tr:has([data-testid="cell-${pid}-${Hm.T}"]) .puck`).first()
  if (!(await el.count())) return '(no name puck found)'
  await el.click().catch(() => {}); await page.waitForTimeout(900)
  await X.pic(w, name + '-win')
  const t = await page.evaluate(() => {
    const els = [...document.querySelectorAll('[role=dialog], .pwin, .personwin, .lwwin, [class*=win]')].filter(e => e.getBoundingClientRect().width > 100)
    return els.map(e => e.innerText.replace(/\s+/g, ' ').trim()).filter(Boolean).slice(0, 3).join(' ## ').slice(0, 900)
  })
  return t
}
