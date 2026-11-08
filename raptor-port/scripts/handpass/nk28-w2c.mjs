// W2 part C: Inputs list and calendar bars (2), medical (5), an input's own window and a question box (7).
console.log('nk28-w2c v1')
const { world, L, vis, pic, sleep, closeAll, ok, note, firstTop, under, tapShot, nav } = await import('./nk28-w2lib.mjs')
process.env.W2_KEEP = '1'
const REST = 'this browser loses your work on a reload'
const BAND = '.topbar > .savestat.nokeep'
const rectOf = (p, sel) => p.evaluate(sel => { const e = [...document.querySelectorAll(sel)].find(e => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 && e.checkVisibility() }); if (!e) return null; const r = e.getBoundingClientRect(); return { t: Math.round(r.top * 10) / 10, b: Math.round(r.bottom * 10) / 10, l: Math.round(r.left), r: Math.round(r.right) } }, sel)
const list = async p => JSON.stringify(await p.evaluate(() => [...document.querySelectorAll('button, [role=button], select, input, textarea')].filter(e => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 && r.top >= 0 && r.top < 874 && r.left < 402 && r.right > 0 && !e.closest('#drawer, .topbar') && e.checkVisibility({ opacityProperty: true, visibilityProperty: true }) }).slice(0, 36).map(e => (e.id || e.className.toString().split(' ')[0]) + '|' + (e.innerText || e.value || e.title || e.getAttribute('aria-label') || '').trim().slice(0, 20).replace(/\n/g, ' ') + '|' + Math.round(e.getBoundingClientRect().left) + ',' + Math.round(e.getBoundingClientRect().top))))
async function bandCheck(p, sc, step, f) {
  const band = await vis(p, BAND), bar = await vis(p, '.topbar'), ft = await firstTop(p)
  const words = band && band.bold === 'Not kept' && band.rest === REST
  ok(sc, step, !!band && words && !band.btn && band.h <= 40 && !band.restCut && band.l === 0 && band.r === 402 && Math.abs(band.b - bar.b) <= 2 && ft && ft.t >= band.b - 0.5, `words=${JSON.stringify([band && band.bold, band && band.rest])} h=${band && band.h} box=${band && band.l}..${band && band.r} bandBottom=${band && band.b} barBottom=${bar && bar.b} firstTop=${JSON.stringify(ft)}`, f)
  return band
}
const w = await world(); const p = w.page
try {
  await L.login(p, 'a'); await sleep(400)
  await nav(p, 'inputs')
  // 2: Inputs calendar and list
  await sleep(500)
  let f = await pic(p, 'S2-inputs-calendar'); await bandCheck(p, '2', 'Inputs calendar view', f)
  let t = await tapShot(p, '#inListBtn', 'S2-inputs-list-tap'); await sleep(800)
  f = await pic(p, 'S2-inputs-list'); await bandCheck(p, '2', 'Inputs list view', f)
  note('2', 'List tap pictures', `${t.ms}ms after the tap start`, t.quick + ' | ' + t.settled)
  const sc = await p.evaluate(() => { for (const e of [...document.querySelectorAll('*')]) { if (e.closest('.topbar,#drawer') || !e.checkVisibility()) continue; const o = getComputedStyle(e).overflowY; if (/auto|scroll/.test(o) && e.scrollHeight - e.clientHeight > 80) { e.scrollTop = 400; return { who: e.tagName + '.' + String(e.className).split(' ')[0], top: e.scrollTop } } } window.scrollTo(0, 400); return { who: 'window', top: window.scrollY } })
  await sleep(500); f = await pic(p, 'S2-inputs-list-scrolled')
  const bnd = await vis(p, BAND)
  note('2', 'Inputs list scrolled', `scroller ${JSON.stringify(sc)}; band top ${bnd && bnd.t}`, f)
  // 5: medical tab and document viewer
  await p.tap('#inMedBtn'); await sleep(900)
  f = await pic(p, 'S5-medical-tab'); await bandCheck(p, '5', 'Medical tab band', f)
  t = await tapShot(p, '.medcard >> nth=3', 'S5-zenith-tap'); await sleep(900)
  f = await pic(p, 'S5-docviewer')
  const band = await vis(p, BAND)
  const hit = await under(p, [[201, band.t + 10], [20, band.t + 10], [380, band.t + 10], [200, 20]])
  const scrim = await p.evaluate(() => { const e = [...document.querySelectorAll('[class*=scrim], [class*=docview]')].filter(e => e.checkVisibility()).map(e => e.className.toString().split(' ')[0] + '@' + Math.round(e.getBoundingClientRect().top)); return e })
  ok('5', 'document viewer with the band up', !!band && hit.slice(0, 3).every(x => x === 'band'), `band ${band.t}..${band.b}; what a finger meets at band points & bar: ${hit.join(',')}; layers ${JSON.stringify(scrim)}`, f + ' | ' + t.quick)
  // 7: Edit input -> an input's own window
  await p.tap('#docViewEdit'); await sleep(1200)
  f = await pic(p, 'S7-input-window')
  const band7 = await vis(p, BAND); const hit7 = band7 ? await under(p, [[201, band7.t + 10], [20, band7.t + 10], [200, 20], [380, 30]]) : null
  note('7', 'input window: what stands at the top', `band ${band7 ? band7.t + '..' + band7.b : 'not visible'}; finger meets at band points & bar: ${hit7 && hit7.join(',')}; controls: ${await list(p)}`, f)
  // question box: type then close
  const ta = p.locator('textarea:visible, input[type=text]:visible').first()
  if (await ta.count()) {
    await ta.tap().catch(() => {}); await p.keyboard.type('walk w2'); await sleep(300)
    const xb = await rectOf(p, '.iw-x, #inpWinX, .win-x, [aria-label=Close], .inpwin button')
    note('7', 'typed into the input window', `box focused: ${await p.evaluate(() => document.activeElement && (document.activeElement.id || document.activeElement.tagName))}`, await pic(p, 'S7-typed'))
  }
  console.log(await list(p))
} catch (e) { ok('C', 'script', null, 'stopped: ' + String(e.message).split('\n')[0]); console.log(e.stack.split('\n').slice(0, 4).join('\n')) }
if (w.errors.length) note('C', 'page errors', w.errors.slice(0, 10).join(' | '))
console.log('errors:', w.errors.length)
await w.ctx.close(); await closeAll()
