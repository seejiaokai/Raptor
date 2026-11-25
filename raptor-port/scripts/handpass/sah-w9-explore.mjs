// w9 explore — read the world before writing the walk: Ranger's (bane) own items on 13–26 Jul, the SANS records already
// in the demo, what "+ Commitment" offers an admin, a range filed 17–21, and what the posted-out sheet shows. Desktop only.
import './sah-w9-env.mjs'
const L = await import('./asp-w2-lib.mjs')
const { sleep, J } = L
console.log('sah-w9-explore v1', L.URL_, L.OUT)
const R = 'bane'
const sz = L.SIZES.d, W = L.mk('x', sz)
const { b, p } = await L.world(sz, W)
await L.signIn(p, 'ad', 'a')
console.log('today', await L.today(p))
const mine = (id) => p.evaluate(id => (window.DAYS || []).map((d, di) => {
  const out = []
  const walk = (o, path) => { if (o == null) return; if (typeof o === 'string') { if (o === id) out.push(path); return } if (Array.isArray(o)) { o.forEach((x, i) => walk(x, path + '[' + i + ']')); return } if (typeof o === 'object') for (const k of Object.keys(o)) walk(o[k], path + '.' + k) }
  walk(d, '')
  const desc = out.map(pth => { const m = pth.match(/^\.(waves)\[(\d+)\]\.formations\[(\d+)\]/); if (m) { const f = d.waves[+m[2]].formations[+m[3]]; return `wave${m[2]} ${f.cs} ${f.to}-${f.ld} (brief ${f.brf || ''})` } const g = pth.match(/^\.(\w+)\[(\d+)\]/); if (g) { const r = d[g[1]][+g[2]]; return `${g[1]}[${g[2]}] ${r && (r.prog || r.label || r.name || '')} ${r && (r.str || '')}-${r && (r.end || '')}` } return pth })
  return d.dt + ': ' + (desc.join(' | ') || 'nothing')
}), id)
console.log('week 13 Jul, Ranger:', (await mine(R)).join('\n  '))
const S = await import('./sud-w6-lib.mjs')
await S.gotoWeek(p, W, '2026-07-20')
console.log('week 20 Jul, Ranger:', (await mine(R)).join('\n  '))
await S.gotoWeek(p, W, '2026-07-13')
console.log('SANS inputs in demo:', J(await p.evaluate(() => (window.INPUTS || []).filter(i => /sans/i.test(i.type)).map(i => ({ iid: i.iid, type: i.type, p: i.person || i.people, date: i.date, end: i.endDate, sans: i.sans })))))
console.log('Ranger record', J(await p.evaluate(id => window.PEOPLE[id], R)))
console.log('inputs of Ranger 13-26 Jul', J(await p.evaluate(id => (window.INPUTS || []).filter(i => JSON.stringify(i.people || i.person || '').includes(id)).map(i => ({ type: i.type, date: i.date, end: i.endDate, s: i.s, e: i.e })), R)))
const po = await L.postOut(p, W, R, '2026-07-17', 'x-po')
console.log('post out', J(po))
await S.openSans(p, W)
await S.sansGoto(p, W, '2026-07-17')
console.log('month cells', J(await p.evaluate(() => ['15', '16', '17', '18', '19', '20', '21'].map(d => { const iso = '2026-07-' + d; const c = document.querySelector(`[data-testid="sc-day-${iso}"]`); return iso + ' ' + (c ? c.className + ' :: ' + (c.innerText || '').replace(/\s+/g, ' ') : 'none') }))))
await S.sansOpenDay(p, W, '2026-07-17')
await W.press(p, '[data-testid="sd-add"]', 'sd-add')
await p.waitForSelector('#inpEditPop'); await sleep(400)
console.log('person options', J(await p.locator('#inpEditPerson option').evaluateAll(os => os.map(o => o.value + ':' + o.textContent.trim()))))
console.log('cal present', await p.locator('[data-testid="inpEdCal"]').count(), await p.locator('[data-testid="inpEdCal-day-2026-07-21"]').count())
console.log('form text', (await p.locator('#inpEditPop').innerText()).replace(/\s+/g, ' ').slice(0, 600))
await W.pic(p, 'x-form')
await p.keyboard.press('Escape'); await sleep(400)
await b.close()
