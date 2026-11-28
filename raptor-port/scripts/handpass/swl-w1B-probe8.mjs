// swl-w1B-probe8 — walker B (chat 203): the script's own ✕ presses in a row (s26 hid nothing) — each press logged with the list
// read before and after, and the press point's topmost element. SWLB_RUN=probe8 node scripts/handpass/swl-w1B-probe8.mjs
import './swl-w1B-env.mjs'
const B = await import('./swl-w1B-lib.mjs')
const { T, L, J, sleep } = B
console.log('VERSION swl-w1B-probe8 1')
await T.run('probe8', 'd', async (p, W) => {
  const l1 = await B.mkLine(p, W, 4, { cs: 'VL', msn: 'BFM', to: '13:00', ld: '14:00' })
  await B.plan(p, W, 4, l1.rcp, 'cards', 'm'); await B.plan(p, W, 4, l1.fcp, 'yeti', 'b')
  await B.places(p, W, 4, 'p0', ['cards'])
  for (let n = 0; n < 6; n++) {
    const l = await B.readList(p, '#eWeek', 4)
    const y = l.lines.find(z => !z.hid && !z.gone)
    if (!y) break
    await B.openList(p, W, '#eWeek', 4)
    const info = await p.evaluate(([i, x]) => { const b = document.querySelector(`#eWeek .day[data-day="${i}"] [data-woff="${i}.${x}"]`); if (!b) return 'no button'; b.scrollIntoView({ block: 'center' }); const r = b.getBoundingClientRect(); const h = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return { r: [Math.round(r.left), Math.round(r.top), Math.round(r.width)], hit: h ? h.tagName + '.' + h.className + ' ' + (h.textContent || '').slice(0, 20) : null, open: document.querySelector(`#eWeek .day[data-day="${i}"] [data-dwbox="${i}"]`).className } }, [4, y.ix])
    const r = await B.tapLine(p, W, '#eWeek', 4, y.ix, 't' + n)
    const l2 = await B.readList(p, '#eWeek', 4)
    W.rec('t' + n, `press ✕ on line ${y.ix} "${y.text.slice(0, 60)}"`, 'REC', `${r} · ${J(info)} · after: ${B.listSay(l2).slice(0, 300)}`, await W.pic(p, 't' + n))
  }
})
