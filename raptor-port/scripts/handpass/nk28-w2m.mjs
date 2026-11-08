// W2 part M: scenario 15 (magnifier close-ups at 4x) and scenario 16 (page moves down by exactly the band height).
console.log('nk28-w2m v1')
const { world, L, vis, pic, sleep, closeAll, ok, note, firstTop, under, tapShot, nav, OUT } = await import('./nk28-w2lib.mjs')
process.env.W2_KEEP = '1'
const glyph = (p, sel) => p.evaluate(sel => {
  const host = [...document.querySelectorAll(sel)].find(e => e.checkVisibility() && e.getBoundingClientRect().width > 0)
  if (!host) return null
  const svg = host.tagName === 'svg' ? host : host.querySelector('svg')
  if (!svg) return { hostBox: host.getBoundingClientRect().toJSON(), noSvg: true, text: host.innerText }
  const r = svg.getBoundingClientRect(); const c = svg.querySelector('circle'), path = svg.querySelector('path, line')
  const vb = svg.getAttribute('viewBox')
  const hb = path ? path.getBoundingClientRect() : null
  const cr = c ? c.getBoundingClientRect() : null
  return { svgBox: { l: r.left, t: r.top, w: r.width, h: r.height }, viewBox: vb, cls: String(svg.getAttribute('class')), stroke: getComputedStyle(svg).color, circleBox: cr && { w: +cr.width.toFixed(2), h: +cr.height.toFixed(2) }, handleBox: hb && { w: +hb.width.toFixed(2), h: +hb.height.toFixed(2), len: +Math.hypot(hb.width, hb.height).toFixed(2) }, d: path ? (path.getAttribute('d') || '') : null, hasCircle: !!c }
}, sel)
// ---- 15
{
  const w = await world({ dsf: 4 }); const p = w.page
  try {
    await L.login(p, 'a'); await sleep(500)
    await nav(p, 'tracker'); await sleep(600)
    const gT = await glyph(p, '#hSearchBtn')
    const box = await p.locator('#hSearchBtn').boundingBox()
    await p.screenshot({ path: OUT + '/S15-tracker-find-4x.png', clip: { x: box.x - 6, y: box.y - 6, width: box.width + 12, height: box.height + 12 } })
    // Edit Schedule's search box
    await nav(p, 'editsched'); await sleep(900)
    const gE = await glyph(p, '.searchbox')
    const b2 = await p.locator('.searchbox:visible').first().boundingBox()
    await p.screenshot({ path: OUT + '/S15-editsched-search-4x.png', clip: { x: b2.x - 6, y: b2.y - 6, width: Math.min(110, b2.width) + 12, height: b2.height + 12 } })
    // the full-width one for the zoomed handle
    note('15', 'magnifier glyph measures', `Tracker Find: ${JSON.stringify(gT)}; Edit Schedule search box: ${JSON.stringify(gE)}`, 'w2/S15-tracker-find-4x.png | w2/S15-editsched-search-4x.png')
    const same = gT && gE && gT.handleBox && gE.handleBox && Math.abs(gT.handleBox.len - gE.handleBox.len) <= 0.6 && gT.d === gE.d
    // the Tracker's Find strip (the box inside it)
    await nav(p, 'tracker'); await sleep(600)
    await p.tap('#hSearchBtn'); await sleep(700)
    const gS = await glyph(p, '.searchbox, #hSearchBar, #hSearchWrap')
    const f = await pic(p, 'S15-tracker-find-open')
    note('15', 'Tracker Find strip magnifier', JSON.stringify(gS), f)
    ok('15', 'Tracker Find magnifier has the same handle as Edit Schedule search box', !!same, `Tracker handle ${JSON.stringify(gT && gT.handleBox)} path ${gT && gT.d}; Edit Schedule handle ${JSON.stringify(gE && gE.handleBox)} path ${gE && gE.d}`, 'w2/S15-tracker-find-4x.png | w2/S15-editsched-search-4x.png')
  } catch (e) { ok('15', 'script', null, 'stopped: ' + String(e.message).split('\n')[0]); console.log(e.stack.split('\n').slice(0, 4).join('\n')) }
  if (w.errors.length) note('M', 'page errors 15', w.errors.slice(0, 10).join(' | '))
  await w.ctx.close()
}
// ---- 16
const PAGES = ['editsched', 'viewsched', 'inputs', 'quals', 'logic', 'leavewar', 'help', 'admin']
const measure = async locked => {
  const w = await world({ locked }); const p = w.page; const out = {}
  try {
    await L.login(p, 'a'); await sleep(500)
    for (const id of PAGES) {
      await nav(p, id); await sleep(300)
      const ft = await firstTop(p)
      const bar = await vis(p, '.topbar')
      const band = await vis(p, '.topbar > .savestat.nokeep')
      out[id] = { firstTop: ft && ft.t, tag: ft && ft.tag, barBottom: bar && bar.b, band: band && band.h }
    }
  } catch (e) { out.err = String(e.message).split('\n')[0] }
  if (w.errors.length) out.errors = w.errors.slice(0, 5)
  await w.ctx.close(); return out
}
const A = await measure(true), B = await measure(false)
for (const id of PAGES) {
  const a = A[id], b = B[id]
  if (!a || !b) { ok('16', id, null, `NOTRUN: ${JSON.stringify([a, b])}`); continue }
  const d = Math.round((a.firstTop - b.firstTop) * 10) / 10
  ok('16', id + ' moves down by exactly the band height', Math.abs(d - a.band) <= 1 && Math.abs((a.barBottom - b.barBottom) - a.band) <= 1, `first content refused ${a.firstTop} (${a.tag}) vs plain ${b.firstTop} (${b.tag}): moved ${d}; band height ${a.band}; bar bottom ${a.barBottom} vs plain ${b.barBottom}`)
}
if (A.err || B.err) note('M', '16 errors', JSON.stringify([A.err, B.err, A.errors, B.errors]))
await closeAll()
