// read Saturday's warning state on the week: the issue bar, the warning list lines, and which pucks on that day wear a ring
import { SAT_DI } from './on-RX1-lib.mjs'

export async function ensureOpen(page, di = SAT_DI) {
  const open = await page.evaluate(di => { const d = [...document.querySelectorAll('#eWeek .day:not(.peek)')][di]; const b = d.querySelector('.dwbox'); return !!(b && b.classList.contains('open')) }, di)
  if (!open) {
    const bar = page.locator(`#eWeek [data-daywarn="${di}"]`)
    if (await bar.count()) { await bar.evaluate(e => e.click()); await page.waitForTimeout(350) }
  }
}
export const warnRead = (page, di = SAT_DI) => page.evaluate(di => {
  const d = [...document.querySelectorAll('#eWeek .day:not(.peek)')][di]
  const bar = d.querySelector('.daywarn')
  const list = [...d.querySelectorAll('.dwlist .witem')].map(w => w.querySelector('.wtx').innerText.replace(/\s+/g, ' ').trim())
  const rings = []
  for (const p of d.querySelectorAll('.puck')) {
    const cs = getComputedStyle(p)
    const nm = (p.querySelector('.nm') || {}).textContent
    const cls = [...p.classList].filter(c => !['puck', 'sm', 'r', 'me', 'oilbar', 'oilbar-fo', 'oilbar-ho', 'lift-land'].includes(c))
    const ring = cs.boxShadow !== 'none' && !p.classList.contains('me') ? cs.boxShadow : ''
    const out = cs.outlineStyle !== 'none' && cs.outlineWidth !== '0px' ? cs.outlineColor : ''
    if (cls.length || ring || out) rings.push(`${nm}[${p.closest('[data-slot]') ? p.closest('[data-slot]').getAttribute('data-slot') : (p.closest('[data-inpseat]') ? 'inp:' + p.closest('[data-inpseat]').getAttribute('data-inpseat') : '?')}] cls=${cls.join('.')} ring=${ring.slice(0, 60)} outline=${out}`)
  }
  return { bar: bar ? bar.innerText.replace(/\s+/g, ' ').trim() : 'NO BAR', open: !!d.querySelector('.dwbox.open'), list, rings }
}, di)
