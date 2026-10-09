import * as L from './it-B-lib.mjs'
const W = await L.mk('desk', { who: 'us', pass: 'us' })
const p = W.page
await L.openNew(W, '2026-07-15')
await p.selectOption('#inpEditType', 'Event')
await p.locator('[data-testid="pp-several"]').click(); await L.sleep(500)
await L.shot(p, 'probe6-several')
const out = await p.evaluate(() => {
  const w = document.querySelector('[data-testid="win-inputedit"]')
  return { html: [...document.querySelectorAll('[data-testid^="pp-"], .pp-pop, .pp-list')].slice(0, 30).map(e => e.tagName + '#' + e.id + ' ' + (e.getAttribute('data-testid') || '') + ' :: ' + (e.innerText || '').replace(/\s+/g, ' ').slice(0, 80)), allowed: [...w.querySelectorAll('#inpEditPerson option')].map(o => o.value + ':' + o.text).slice(0, 8) }
})
console.log(JSON.stringify(out, null, 1))
await W.browser.close()
