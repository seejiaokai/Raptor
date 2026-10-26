// exploration: which CSS rules win on a joined box (jl / jr) and on an OTH box
const M = await import('./lw-m3b-w1-lib.mjs')
const { L, T } = M
const w = await M.start('desk')
const P = w.page
const ids = await M.ids(P)
const who = ids.Ranger
const open = await M.dragCells(w, [who, '2026-12-09'], [who, '2026-12-11'])
await M.setSwitch(w, false, 'sel'); await L.press(w, T('sel-LL')); await P.waitForTimeout(700)
if (await L.vis(P, T('select-sheet'))) { await L.press(w, T('sel-LL')); await P.waitForTimeout(600) }
await L.openCellR(w, who, '2026-12-20'); await P.waitForSelector(T('bid-picker'))
await L.press(w, T('bid-more')); await P.waitForSelector(T('bid-more-menu')); await L.press(w, T('bid-file-OTH')); await P.waitForTimeout(700)
const probe = (iso, props) => P.evaluate(([who, iso, props]) => {
  const c = document.querySelector(`[data-testid="cell-${who}-${iso}"] .c`)
  const cs = getComputedStyle(c)
  const out = { cls: c.className.toString(), computed: Object.fromEntries(props.map(p => [p, cs.getPropertyValue(p)])), winners: {} }
  const rules = []
  const walk = (list, ctx) => { for (const r of list) { if (r.cssRules && !r.selectorText) walk(r.cssRules, ctx + (r.conditionText ? '@' + r.conditionText + ' ' : r.name ? '@layer ' + r.name + ' ' : '')); else if (r.selectorText) { try { if (c.matches(r.selectorText)) rules.push({ sel: r.selectorText.slice(0, 110), ctx, style: r.style }) } catch { } } } }
  for (const ss of document.styleSheets) { try { walk(ss.cssRules, '') } catch { } }
  for (const p of props) out.winners[p] = rules.filter(r => r.style.getPropertyValue(p)).map(r => `${r.ctx}${r.sel} => ${r.style.getPropertyValue(p)}${r.style.getPropertyPriority(p) ? ' !important' : ''}`).slice(-6)
  return out
}, [who, iso, props])
console.log('LL middle day:', JSON.stringify(await probe('2026-12-10', ['right', 'left', 'color', 'border-top-right-radius', 'box-shadow', 'background-color']), null, 1))
console.log('OTH:', JSON.stringify(await probe('2026-12-20', ['background-color', 'box-shadow', 'color']), null, 1))
await w.ctx.close(); await M.closeBrowser()
