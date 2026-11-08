// W3 S26 — hide and flag again on both lists (Edit Schedule day list, board list). Usage: node sm-w3-s26.mjs pc|phone
import * as L from './sm-lib.mjs'
const size = process.argv[2] || 'pc'
console.log('sm-w3-s26 v1', size, L.DIST)
const OUT = L.outDir('w3')
const ORIGIN = 'http://localhost:4394'
const res = {}
const step = async (k, fn) => { try { res[k] = await fn(); console.log(k, JSON.stringify(res[k])) } catch (e) { res[k] = { err: e.message.split('\n')[0] }; console.log(k, 'ERR', res[k].err) } }
const W = await L.launch(size, { origin: ORIGIN })
const P = W.page
await L.signIn(W)
await L.goEdit(W)
const D = '#eWeek section.day[data-day="1"]'
const openList = async () => {
  await L.center(P, D); await L.sleep(300)
  const open = await P.evaluate(() => document.querySelector('#eWeek section.day[data-day="1"] [data-dwbox="1"]').classList.contains('open'))
  if (!open) { await L.press(W, `${D} [data-daywarn="1"]`); await L.sleep(500) }
}
const readE = () => P.evaluate(() => {
  const box = document.querySelector('#eWeek section.day[data-day="1"] [data-dwbox="1"]')
  const bar = box.querySelector('.daywarn')
  return { open: box.classList.contains('open'), bar: bar.innerText.replace(/\s+/g, ' ').trim(),
    lines: [...box.querySelectorAll('.witem[data-wix]')].map(e => {
      const t = e.querySelector('.wtx') || e.children[1]; const b = e.querySelector('button.witem-mute')
      const s = b && b.querySelector('svg.wmuteico'); const r = s && s.getBoundingClientRect(); const br = b && b.getBoundingClientRect()
      return { ix: e.dataset.wix, hid: e.classList.contains('hid'), struck: getComputedStyle(t).textDecorationLine.includes('line-through'), txt: t.textContent.trim().slice(0, 50),
        btn: b ? (s ? 'reset' : b.textContent.trim()) : '', title: b && b.title, svg: r && [+r.width.toFixed(1), +r.height.toFixed(1)], btnBox: br && [Math.round(br.width), Math.round(br.height)], woff: b && b.dataset.woff,
        svgColor: s && getComputedStyle(s).color, btnColor: b && getComputedStyle(b).color }
    }) }
})
await step('e.initial', async () => { await openList(); return readE() })
await L.center(P, `${D} [data-dwbox="1"]`)
await L.pic(W, OUT, `s26-${size}-e-0-initial`, { sel: `${D} [data-dwbox="1"]` })
// hide each, one at a time, with a picture after each
const n0 = res['e.initial'].lines?.length || 0
for (let i = 0; i < n0; i++) {
  await step(`e.hide${i}`, async () => {
    const w = res['e.initial'].lines[i].woff
    await L.press(W, `${D} [data-woff="${w}"]`); await L.sleep(500)
    return readE()
  })
  await L.pic(W, OUT, `s26-${size}-e-hide${i}`, { sel: `${D} [data-dwbox="1"]` })
}
await step('e.allhidden', () => readE())
await L.pic(W, OUT, `s26-${size}-e-allhidden`, { sel: `${D} [data-dwbox="1"]` })
// the day's bar when all hidden (closed list)
// restore all with the arrow
for (let i = 0; i < n0; i++) {
  await step(`e.flag${i}`, async () => {
    const w = res['e.initial'].lines[i].woff
    await L.press(W, `${D} [data-woff="${w}"]`); await L.sleep(500)
    return readE()
  })
}
await L.pic(W, OUT, `s26-${size}-e-restored`, { sel: `${D} [data-dwbox="1"]` })
// puck flags after (Static)
await step('e.pucks', () => P.evaluate(() => [...document.querySelectorAll('#eWeek section.day[data-day="1"] .puck')].filter(e => e.offsetParent).slice(0, 80).filter(e => e.classList.contains('warn')).length))
// hide one (last) then reload-free Undo? (hide is not in undo) -> hide last, hover words
await step('e.hide-last', async () => { const w = res['e.initial'].lines[n0 - 1].woff; await L.press(W, `${D} [data-woff="${w}"]`); await L.sleep(500); return readE() })
if (!W.phone) {
  const w = res['e.initial'].lines[n0 - 1].woff
  await P.hover(`${D} [data-woff="${w}"]`); await L.sleep(1200)
  await L.pic(W, OUT, `s26-pc-e-hover-reset`, { sel: `${D} [data-dwbox="1"]`, pad: 60 })
}
// ---- the board
await L.openBoard(W, 1)
const openFold = async () => { if (!W.phone) return; const o = await P.locator('#schedBoard .sbwrap').first().evaluate(e => e.classList.contains('open')).catch(() => true); if (!o) { await P.locator('#schedBoard [data-sbwtog]').first().click(); await L.sleep(500) } }
await openFold()
const readB = () => P.evaluate(() => {
  const w = document.querySelector('#schedBoard .sb-warn'); if (!w) return { err: 'no .sb-warn' }
  return { head: (w.querySelector('.wh') || {}).textContent, lines: [...w.querySelectorAll('.wln[data-wix]')].map(e => {
    const t = e.querySelector('.wln-t'); const b = e.querySelector('button.wln-mute'); const s = b && b.querySelector('svg.wmuteico'); const r = s && s.getBoundingClientRect(); const br = b && b.getBoundingClientRect()
    return { ix: e.dataset.wix, hid: e.classList.contains('hid'), struck: getComputedStyle(t).textDecorationLine.includes('line-through'), btn: b ? (s ? 'reset' : b.textContent.trim()) : '', title: b && b.title, svg: r && [+r.width.toFixed(1), +r.height.toFixed(1)], btnBox: br && [Math.round(br.width), Math.round(br.height)], woff: b && b.dataset.woff, svgColor: s && getComputedStyle(s).color }
  }) }
})
await step('b.initial', () => readB())
await L.pic(W, OUT, `s26-${size}-b-state-after-e-hide`, { sel: '#schedBoard .sb-warn' })
const lines = res['b.initial'].lines || []
// flag all again on the board, then hide each on board
for (const l of lines.filter(l => l.hid)) { await L.press(W, `#schedBoard [data-woff="${l.woff}"]`); await L.sleep(500); await openFold() }
await step('b.allflagged', () => readB())
await L.pic(W, OUT, `s26-${size}-b-0-initial`, { sel: '#schedBoard .sb-warn' })
for (let i = 0; i < lines.length; i++) {
  await step(`b.hide${i}`, async () => { await openFold(); await L.press(W, `#schedBoard [data-woff="${lines[i].woff}"]`); await L.sleep(500); await openFold(); return readB() })
  await L.pic(W, OUT, `s26-${size}-b-hide${i}`, { sel: '#schedBoard .sb-warn' })
}
await step('b.allhidden', () => readB())
await L.pic(W, OUT, `s26-${size}-b-allhidden`, { sel: '#schedBoard .sb-warn' })
if (!W.phone) {
  await P.hover(`#schedBoard [data-woff="${lines[0].woff}"]`); await L.sleep(1200)
  await L.pic(W, OUT, `s26-pc-b-hover-reset`, { sel: '#schedBoard .sb-warn', pad: 40 })
}
for (let i = 0; i < lines.length; i++) { await step(`b.flag${i}`, async () => { await openFold(); await L.press(W, `#schedBoard [data-woff="${lines[i].woff}"]`); await L.sleep(500); await openFold(); return readB() }) }
await L.pic(W, OUT, `s26-${size}-b-restored`, { sel: '#schedBoard .sb-warn' })
if (!W.phone) {
  await P.hover(`#schedBoard [data-woff="${lines[0].woff}"]`); await L.sleep(1000)
  await step('b.active-title', () => P.evaluate(w => document.querySelector(`#schedBoard [data-woff="${w}"]`).title, lines[0].woff))
}
await step('errs', async () => W.errs)
L.saveJson(OUT, `s26-${size}-results`, res)
await L.closeAll(W)
console.log('DONE')
