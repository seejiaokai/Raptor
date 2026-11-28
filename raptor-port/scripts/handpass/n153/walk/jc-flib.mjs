// Walker C: Admin → Users' Filter, read and pressed as a person does.
import { note } from './jlib.mjs'
export const SEARCH = '#page-admin input[placeholder^="Find a callsign"]'
export const box = e => { const b = e.getBoundingClientRect(); return { x: +b.left.toFixed(1), y: +b.top.toFixed(1), w: +b.width.toFixed(1), h: +b.height.toFixed(1) } }
export const look = s => s.page.evaluate(SEARCH => {
  const bx = e => { if (!e) return null; const b = e.getBoundingClientRect(); return { x: +b.left.toFixed(1), y: +b.top.toFixed(1), w: +b.width.toFixed(1), h: +b.height.toFixed(1) } }
  const cs = e => { if (!e) return null; const c = getComputedStyle(e); return { bg: c.backgroundColor, border: c.borderTopColor, bw: c.borderTopWidth, color: c.color, radius: c.borderTopLeftRadius, font: `${c.fontWeight} ${c.fontSize}` } }
  const f = document.querySelector('#accFilter'); let q = document.querySelector(SEARCH)
  /* the drawn box of the search is the frame around its input: the nearest parent that has a border */
  for (let e = q && q.parentElement, i = 0; e && i < 3; e = e.parentElement, i++) if (parseFloat(getComputedStyle(e).borderTopWidth) > 0) { q = e; break }
  const heading = [...document.querySelectorAll('#page-admin h3,#page-admin h4,#page-admin .adm-sub')].find(e => /^PEOPLE|^People/.test(e.textContent.trim()) && e.getBoundingClientRect().width > 0)
  const showing = [...document.querySelectorAll('#page-admin p,#page-admin span,#page-admin div')].filter(e => e.getBoundingClientRect().width > 0 && /^Showing \d+ of \d+/.test(e.textContent.trim())).sort((a, b) => a.textContent.length - b.textContent.length)[0]
  const firstRow = [...document.querySelectorAll('#page-admin [data-person]')].find(e => e.getBoundingClientRect().height > 0)
  return { label: f ? f.textContent.replace(/\s+/g, ' ').trim() : null, filter: bx(f), filterLook: cs(f), search: bx(q), searchLook: cs(q), heading: bx(heading), showing: showing ? showing.textContent.replace(/\s+/g, ' ').trim() : null, showingBox: bx(showing), firstRow: bx(firstRow), panel: !!document.querySelector('#accFilterPanel') }
}, SEARCH)
export const ticks = s => s.page.evaluate(() => { const p = document.querySelector('#accFilterPanel'); return p ? [...p.querySelectorAll('button[aria-pressed="true"]')].map(b => b.textContent.trim()) : null })
export async function openF(s) { if (!(await s.page.locator('#accFilterPanel').count())) { await tap(s, s.page.locator('#accFilter')); await s.page.waitForTimeout(240) } return s.page.locator('#accFilterPanel').count() }
export async function closeF(s) { if (await s.page.locator('#accFilterPanel').count()) { await tap(s, s.page.locator('#accFilter')); await s.page.waitForTimeout(240) } }
export async function tap(s, l) { if (s.desk) await l.click(); else await l.tap(); await s.page.waitForTimeout(160) }
export async function tick(s, label) {
  await openF(s)
  const b = s.page.locator('#accFilterPanel button', { hasText: new RegExp(`^(✓\\s*)?${label}$`) })
  if (!(await b.count())) { note(`[${s.sz}] no filter tick "${label}"`); return false }
  await tap(s, b.first()); return true
}
export const onChipLook = s => s.page.evaluate(() => { const e = document.querySelector('#accFilterPanel button[aria-pressed="true"]'); if (!e) return null; const c = getComputedStyle(e); return { bg: c.backgroundColor, border: c.borderTopColor, color: c.color } })
