// Re-walk A2 — the page beside r22-1 / r22-2: divider, card place, columns, a name's side in every puck present (lesson 9).
process.env.LW_OUT ||= '../../docs/img/handpass/2026-10-27-lw-m4/rewalk/a'
const { L, placeBid } = await import('./lw-m4-walk-a-lib.mjs')
const { T, rec, shot, vis, txt } = L
console.log('[lw-m4-rw-a2 v1]')
const w = await L.newCtx('desk')
const P = w.page
try {
  await L.signIn(w, 'admin')
  // the grid card's place under the tab row
  const geo = () => P.evaluate(() => {
    const tab = document.querySelector('[data-testid="lw-tab-grid"]')
    let row = tab; while (row && row.getBoundingClientRect().width < 500) row = row.parentElement
    const rb = row.getBoundingClientRect()
    const kids = [...document.querySelector('#page-leavewar').querySelectorAll('*')].filter(e => { const b = e.getBoundingClientRect(); return b.width > 900 && b.top >= rb.bottom - 1 && b.top < rb.bottom + 60 && b.height > 100 })
    const first = kids[0]
    const b = first && first.getBoundingClientRect()
    return { tabRowBottom: Math.round(rb.bottom), cardTop: b && Math.round(b.top), cardLeft: b && Math.round(b.left), cardRight: b && Math.round(b.right), cls: first && (first.className.toString().slice(0, 40) + ' ' + (first.dataset.testid || '')), gap: b && Math.round(b.top - rb.bottom) }
  })
  await shot(w, 'a2-0-grid')
  const gGrid = await geo()
  await L.openApprovals(w)
  const gAppr = await geo()
  console.log('grid card:', JSON.stringify(gGrid)); console.log('approvals card:', JSON.stringify(gAppr))
  await shot(w, 'a2-1-approvals')
  rec('A2.1 the card stands under the tab row where the grid card stands', 'desk', gGrid.gap != null && gAppr.gap != null && Math.abs(gGrid.gap - gAppr.gap) <= 2 && Math.abs(gGrid.cardLeft - gAppr.cardLeft) <= 2 ? 'PASS' : 'FAIL', `grid gap ${gGrid.gap} left ${gGrid.cardLeft}; approvals gap ${gAppr.gap} left ${gAppr.cardLeft}`, ['a2-0-grid', 'a2-1-approvals'])
  // divider between New and DATES
  const div = await P.evaluate(() => {
    const n = document.querySelector('[data-testid="appr-new"]').getBoundingClientRect()
    const row = document.querySelector('[data-testid="appr-new"]').parentElement
    const kids = [...row.children].map(e => ({ cls: e.className.toString().slice(0, 30), txt: (e.innerText || '').trim().slice(0, 12), l: Math.round(e.getBoundingClientRect().left), w: Math.round(e.getBoundingClientRect().width), h: Math.round(e.getBoundingClientRect().height), bl: getComputedStyle(e).borderLeftWidth, bg: getComputedStyle(e).backgroundColor }))
    return { newRight: Math.round(n.right), kids: kids.slice(0, 6) }
  })
  console.log('filter row first kids:', JSON.stringify(div))
  const clip = { x: 20, y: 140, width: 700, height: 100 }
  await shot(w, 'a2-2-divider-zoom', { clip })
  // columns and a name's side in every puck
  const cols = await P.evaluate(() => {
    const heads = [...document.querySelector('.appr-cols:not(.ph)').children].map(h => ({ t: h.innerText.trim(), l: Math.round(h.getBoundingClientRect().left), r: Math.round(h.getBoundingClientRect().right) }))
    const lines = [...document.querySelectorAll('[data-testid^="appr-line-"]')].filter(l => l.getBoundingClientRect().height > 0).map(l => {
      const pk = l.querySelector('.puck'); const nm = pk.querySelector('.nm'); const role = pk.querySelector('.role')
      const pb = pk.getBoundingClientRect(), nb = nm.getBoundingClientRect(), rb = role ? role.getBoundingClientRect() : null
      const rg = document.createRange(); rg.selectNodeContents(nm); const tb = rg.getBoundingClientRect()
      return { who: l.dataset.testid.slice(10), cls: pk.className, name: nm.innerText, nameLeftInPuck: Math.round((tb.left - pb.left) * 10) / 10, nameRightEdge: Math.round(tb.right), chipLeft: rb && Math.round(rb.left), nameBeforeChip: rb ? tb.right <= rb.left + 1 : null, puckW: Math.round(pb.width) }
    })
    return { heads, lines }
  })
  console.log('headings:', JSON.stringify(cols.heads))
  for (const l of cols.lines) console.log('puck', JSON.stringify(l))
  const ok = cols.lines.length > 0 && cols.lines.every(l => l.nameBeforeChip && l.nameLeftInPuck <= 12)
  const kinds = [...new Set(cols.lines.map(l => l.cls.replace(/\bsm\b/, '').trim()))]
  rec('A2.4 a name stands at the LEFT of its puck, WSO and pilot alike (lesson 9, by box)', 'desk', ok ? 'PASS' : 'FAIL', `${cols.lines.length} pucks, classes ${JSON.stringify(kinds)}; name offsets ${cols.lines.map(l => l.who + ':' + l.nameLeftInPuck + (l.cls.includes(' r ') || / r( |$)/.test(l.cls) ? 'W' : 'P')).join(' ')}`, ['a2-1-approvals'])
  await shot(w, 'a2-3-pucks-zoom', { clip: { x: 20, y: 240, width: 820, height: 420 } })
} catch (e) {
  rec('ERROR', 'desk', 'FAIL', String(e).slice(0, 300)); await shot(w, 'a2-error').catch(() => {})
}
if (w.errs.length) rec('console', 'desk', 'FAIL', w.errs.join(' || ').slice(0, 600))
await w.ctx.close()
L.writeResults('a2')
await L.closeBrowser()
console.log('DONE')
