console.log('oeb-w1-fresh v1')
import { launch, closeAll, open, oilOn, oilIsOn, swChecked, selCount, toastText, noteText, sleep, pic, BAR, SW, toTop, press, mkReport, saveRows, blur } from './oeb-w1-lib.mjs'

const only = (process.argv[3] || '').split(',').filter(Boolean)
const sizes = process.argv[2] ? [process.argv[2]] : ['phone', 'pc']
const rep = mkReport()
const WANT = 'Nothing on this day earns OIL. Turn off the switch and each man earns as he did before.'

const fable = page => page.evaluate(() => {
  const p = [...document.querySelectorAll('#schedBoard .oilpk .puck')].find(x => /^Fable/.test(x.innerText.trim()) && x.getBoundingClientRect().width > 0)
  if (!p) return null
  const s = getComputedStyle(p)
  return { cls: p.className, par: p.parentElement.className, earning: /oilglow/.test(p.className), sel: p.classList.contains('sel') }
})
const state = async W => ({ sw: await swChecked(W.page), note: await noteText(W.page), fable: await fable(W.page), sel: await selCount(W.page), toast: await toastText(W.page), undoDis: await W.page.evaluate(() => document.getElementById('sbUndo')?.disabled) })
const fmt = s => `switch=${s.sw} note=${JSON.stringify(s.note)} fableEarning=${s.fable && s.fable.earning} sel=${s.sel} toast=${JSON.stringify(s.toast && s.toast.shown ? s.toast.text : null)}`
const sliderLook = page => page.evaluate(() => { const i = document.querySelector('#schedBoard .daybar input[data-oilblank]'); const l = i.closest('label'); const si = getComputedStyle(i), sl = getComputedStyle(l); const b = i.getBoundingClientRect(); return { inputBg: si.backgroundColor, inputAccent: si.accentColor, labelColor: sl.color, labelBg: sl.backgroundColor, box: [Math.round(b.width), Math.round(b.height)], after: getComputedStyle(i, '::after').backgroundColor, bgimg: si.backgroundImage.slice(0, 60) } })
const undo = async W => { await press(W, '#sbUndo'); await sleep(500) }
const redo = async W => { await press(W, '#sbRedo'); await sleep(500) }
// press the words of the switch (right end of the label, off the slider) or the slider itself
const pressWords = async W => { const l = W.page.locator(SW).filter({ visible: true }).first(); const b = await l.boundingBox(); const pos = { x: b.width - 10, y: b.height / 2 }; if (W.phone) await l.tap({ position: pos }); else await l.click({ position: pos }) }
const pressSlider = async W => { const l = W.page.locator(`${SW} input`).filter({ visible: true }).first(); if (W.phone) await l.tap(); else await l.click() }
const settle = async (W, sc, what) => { await sleep(150); const s = await state(W); await pic(W, `${sc}-${W.size}-${what}-now`, W.phone ? { sel: BAR, pad: 40 } : { sel: BAR, pad: 40 }); if (W.phone) { await sleep(1000); await pic(W, `${sc}-${W.size}-${what}-settled`, { sel: BAR, pad: 40 }) } return s }
const ready = async W => { await open(W); await oilOn(W); await toTop(W); await blur(W.page) }

const SC = {}
SC.W11 = async W => {
  if (!W.phone) return rep.add({ sc: 'W1.1', size: W.size, res: 'NOT WALKED', said: 'brief marks W1.1 phone only', pic: '' })
  await open(W); await toTop(W); await blur(W.page)
  const m = await W.page.evaluate(() => { const b = [...document.querySelectorAll('#schedBoard .daybar .mbtn')].map(x => { const r = x.getBoundingClientRect(); const s = x.querySelector('svg'); const sr = s && s.getBoundingClientRect(); const h = document.querySelector('#schedBoard .daybar .daybar-h').getBoundingClientRect(); return { t: x.innerText.trim(), top: r.top, h: r.height, w: r.width, x: r.x, svgRight: sr && sr.right, svgW: sr && sr.width, svgMid: sr && (sr.top + sr.height / 2), midY: r.top + r.height / 2, heading: h.top } }); return { b, head: document.querySelector('#schedBoard .daybar .daybar-h').innerText } })
  const p1 = await pic(W, 'W1.1-phone-bar-rest', { sel: BAR, pad: 30 })
  const tpl = m.b[0], oil = m.b[1]
  const sameRow = Math.abs(tpl.top - oil.top) < 2
  const sameH = Math.abs(tpl.h - oil.h) < 0.6
  const marks = tpl.svgW > 0 && oil.svgW > 0
  rep.add({ sc: 'W1.1a', size: 'phone', res: head(m) && sameRow && sameH && marks ? 'PASS' : 'FAIL', said: `heading "${m.head}"; Templates h=${tpl.h.toFixed(1)} w=${tpl.w.toFixed(1)} mark ${tpl.svgW}px; OIL Earn h=${oil.h.toFixed(1)} w=${oil.w.toFixed(1)} mark ${oil.svgW}px; one row=${sameRow}; same height=${sameH}`, pic: p1 })
  function head(m) { return /THIS DAY/i.test(m.head) }
  // tap Templates
  const before = await W.page.evaluate(() => document.querySelectorAll('*').length)
  await W.page.locator('#schedBoard .daybar [data-daytpladd]').tap(); await sleep(100)
  const p2 = await pic(W, 'W1.1-phone-templates-now', { full: true }); await sleep(1000)
  const p2b = await pic(W, 'W1.1-phone-templates-settled', { full: true })
  const menu = await W.page.evaluate(() => { const vis = e => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 }; const c = [...document.querySelectorAll('[role=menu],[class*=menu],[class*=tpl],[class*=pop]')].filter(vis).map(e => e.className + ':' + e.innerText.trim().slice(0, 40)); return c.slice(0, 6) })
  rep.add({ sc: 'W1.1b', size: 'phone', res: 'RECORDED', said: `after tapping Templates, visible menu-like elements: ${JSON.stringify(menu)} (open judged from picture)`, pic: p2b })
  // close by a tap outside it: the heading THIS DAY
  await W.page.locator('#schedBoard .daybar .daybar-h').tap(); await sleep(500)
  const p3 = await pic(W, 'W1.1-phone-templates-closed', { full: true })
  const menu2 = await W.page.evaluate(() => { const vis = e => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 }; return [...document.querySelectorAll('[role=menu],[class*=menu],[class*=tpl],[class*=pop]')].filter(vis).map(e => e.className + ':' + e.innerText.trim().slice(0, 40)).slice(0, 6) })
  rep.add({ sc: 'W1.1c', size: 'phone', res: 'RECORDED', said: `after tap outside, visible menu-like elements: ${JSON.stringify(menu2)}`, pic: p3 })
  await toTop(W)
  await W.page.locator('#schedBoard .daybar [data-oilmode]').tap(); await sleep(100)
  const p4 = await pic(W, 'W1.1-phone-oil-now', { full: true }); await sleep(1000)
  const on = await oilIsOn(W.page); const p5 = await pic(W, 'W1.1-phone-oil-settled', { full: true })
  rep.add({ sc: 'W1.1d', size: 'phone', res: on ? 'PASS' : 'FAIL', said: `after tapping OIL Earn the mode is ${on ? 'on' : 'off'}; bar words "${await W.page.evaluate(() => document.querySelector('#schedBoard .daybar').innerText.replace(/\n+/g, ' | '))}"`, pic: p5 })
}
SC.W12 = async W => {
  await ready(W)
  const s0 = await state(W); const l0 = await sliderLook(W.page)
  const pa = await pic(W, `W1.2-${W.size}-off`, { sel: BAR, pad: 40 })
  await pressWords(W)
  const s1 = await settle(W, 'W1.2', 'words-on'); const l1 = await sliderLook(W.page)
  const wanted = 'Nothing on this day earns OIL. Turn off the switch and each man earns as he did before.'
  const ok = s0.sw === false && s0.fable.earning && s1.sw === true && s1.note === wanted && s1.fable && !s1.fable.earning
  rep.add({ sc: 'W1.2', size: W.size, res: ok ? 'PASS' : 'FAIL', said: `before: ${fmt(s0)} look=${JSON.stringify(l0)}; after words: ${fmt(s1)} look=${JSON.stringify(l1)}; note under bar=${JSON.stringify(s1.note)}; Fable puck class "${s1.fable && s1.fable.cls}"`, pic: `W1.2-${W.size}-words-on-now.png` })
  rep.add({ sc: 'W1.2-toast', size: W.size, res: 'RECORDED', said: `passing note after switching on by words: ${JSON.stringify(s1.toast)}`, pic: `W1.2-${W.size}-words-on-now.png` })
  // W1.3
  await pressSlider(W)
  const s2 = await settle(W, 'W1.3', 'slider-off')
  const ok3 = s2.sw === false && s2.note !== WANT &&  s2.fable && s2.fable.earning
  rep.add({ sc: 'W1.3', size: W.size, res: ok3 ? 'PASS' : 'FAIL', said: `after slider press: ${fmt(s2)}; Fable puck class "${s2.fable && s2.fable.cls}"`, pic: `W1.3-${W.size}-slider-off-now.png` })
  rep.add({ sc: 'W1.3-toast', size: W.size, res: 'RECORDED', said: `passing note after switching off by slider: ${JSON.stringify(s2.toast)}`, pic: `W1.3-${W.size}-slider-off-now.png` })
}
SC.W14 = async W => {
  if (W.phone) return rep.add({ sc: 'W1.4', size: W.size, res: 'NOT WALKED', said: 'PC only', pic: '' })
  await ready(W)
  await W.page.evaluate(() => { window.scrollTo(0, 0) })
  let found = false, n = 0
  await W.page.keyboard.press('Tab')
  for (; n < 150; n++) {
    if (await W.page.evaluate(() => document.activeElement && document.activeElement.matches('input[data-oilblank]'))) { found = true; break }
    await W.page.keyboard.press('Tab')
  }
  if (!found) return rep.add({ sc: 'W1.4', size: 'pc', res: 'NOT WALKED', said: 'Tab never reached the switch in 150 presses', pic: '' })
  await sleep(300)
  const pr = await pic(W, 'W1.4-pc-ring', { sel: BAR, pad: 40 })
  const act = () => W.page.evaluate(() => { const a = document.activeElement; return { onSwitch: !!(a && a.matches('input[data-oilblank]')), tag: a && a.tagName + '.' + a.className } })
  await W.page.keyboard.press('Space'); await sleep(500)
  const s1 = await state(W); const a1 = await act(); const p1 = await pic(W, 'W1.4-pc-space-on', { sel: BAR, pad: 40 })
  const ok1 = s1.sw === true && s1.note === WANT && a1.onSwitch
  await W.page.keyboard.press('Space'); await sleep(500)
  const s2 = await state(W); const a2 = await act(); const p2 = await pic(W, 'W1.4-pc-space-off', { sel: BAR, pad: 40 })
  const ok2 = s2.sw === false && s2.note !== WANT &&  a2.onSwitch
  rep.add({ sc: 'W1.4', size: 'pc', res: ok1 && ok2 ? 'PASS' : 'FAIL', said: `Tabs to reach: ${n + 1}. Space1: ${fmt(s1)} focus=${JSON.stringify(a1)}; Space2: ${fmt(s2)} focus=${JSON.stringify(a2)}`, pic: `${p1}, ${p2}, ring ${pr}` })
}
SC.W15 = async W => {
  await ready(W)
  await pressWords(W); await sleep(500)
  const s1 = await state(W)
  await undo(W); const s2 = await settle(W, 'W1.5', 'undo')
  await redo(W); const s3 = await settle(W, 'W1.5', 'redo')
  const ok = s1.sw === true && s2.sw === false && s2.note !== WANT &&  s3.sw === true && s3.note !== null
  rep.add({ sc: 'W1.5', size: W.size, res: ok ? 'PASS' : 'FAIL', said: `on: ${fmt(s1)}; Undo: ${fmt(s2)}; Redo: ${fmt(s3)}`, pic: `W1.5-${W.size}-undo-now.png, W1.5-${W.size}-redo-now.png` })
}
SC.W16 = async W => {
  await ready(W)
  await pressWords(W); await sleep(500)
  const b = await state(W)
  await W.page.waitForFunction(() => true)
  await toTop(W)
  // Fable's puck is on the SDO desk; bring it into view
  await W.page.evaluate(() => { const p = [...document.querySelectorAll('#schedBoard .oilpk .puck')].find(x => /^Fable/.test(x.innerText.trim())); p.scrollIntoView({ block: 'center' }) }); await sleep(300)
  const p = W.page.locator('#schedBoard .oilpk .puck').filter({ hasText: /^Fable/ }).filter({ visible: true }).first()
  const hist0 = await W.page.evaluate(() => document.getElementById('sbUndo')?.disabled)
  if (W.phone) await p.tap(); else await p.click()
  await sleep(120)
  const t = await toastText(W.page); const pn = await pic(W, 'W1.6-' + W.size + '-tap-now', { full: true })
  if (W.phone) { await sleep(1000) } else await sleep(300)
  const a = await state(W); const ps = W.phone ? await pic(W, 'W1.6-' + W.size + '-tap-settled', { full: true }) : pn
  const wanted = 'Nothing on this day earns. Turn off the switch first.'
  const ok = t && t.shown && t.text === wanted && a.sel === 0 && a.sw === true && a.fable && !a.fable.earning
  rep.add({ sc: 'W1.6', size: W.size, res: ok ? 'PASS' : 'FAIL', said: `toast right after tap ${JSON.stringify(t)}; afterwards ${fmt(a)}; Undo disabled before=${hist0} after=${a.undoDis}`, pic: pn })
}
SC.W17 = async W => {
  await ready(W)
  await pressWords(W); await sleep(500)
  const sat1 = await state(W)
  const goNext = async () => { if (W.phone) await press(W, '#sbNextDay'); else await W.page.locator('#schedBoard').getByText(/^Sun 19$/).first().click(); await sleep(900) }
  const goPrev = async () => { if (W.phone) await press(W, '#sbPrevDay'); else await W.page.locator('#schedBoard').getByText(/^Sat 18$/).first().click(); await sleep(900) }
  await goNext()
  const head1 = await W.page.evaluate(() => document.querySelector('.sb-top, #schedBoard')?.innerText.slice(0, 60).replace(/\n+/g, ' '))
  const modeOnSun = await oilIsOn(W.page)
  const p1 = await pic(W, `W1.7-${W.size}-sunday-arrive`, { full: true })
  if (!modeOnSun) { await oilOn(W) }
  await toTop(W)
  const sun = await state(W)
  const p2 = await pic(W, `W1.7-${W.size}-sunday-switch`, { sel: BAR, pad: 40 })
  await goPrev()
  const modeOnSat = await oilIsOn(W.page)
  if (!modeOnSat) await oilOn(W)
  await toTop(W)
  const sat2 = await state(W)
  const p3 = await pic(W, `W1.7-${W.size}-saturday-back`, { sel: BAR, pad: 40 })
  const ok = sat1.sw === true && sun.sw === false && sat2.sw === true
  rep.add({ sc: 'W1.7', size: W.size, res: ok ? 'PASS' : 'FAIL', said: `Saturday before: switch=${sat1.sw}; Sunday arrived with mode ${modeOnSun ? 'still on' : 'off (I pressed OIL Earn)'} head="${head1}": switch=${sun.sw}; back on Saturday mode ${modeOnSat ? 'still on' : 'off (I pressed OIL Earn)'}: switch=${sat2.sw} note=${JSON.stringify(sat2.note)}`, pic: `${p2}, ${p3}` })
}
SC.W18 = async W => {
  await ready(W)
  await pressWords(W); await sleep(500)
  await W.page.locator('#schedBoard .daybar [data-oilmode].done').filter({ visible: true }).first()[W.phone ? 'tap' : 'click'](); await sleep(700)
  const off = !(await oilIsOn(W.page)); const p1 = await pic(W, `W1.8-${W.size}-mode-left`, { full: true })
  await oilOn(W)
  await toTop(W)
  const s = await settle(W, 'W1.8', 'reentered')
  rep.add({ sc: 'W1.8', size: W.size, res: off && s.sw === true && s.note ? 'PASS' : 'FAIL', said: `mode left=${off}; re-entered: ${fmt(s)}`, pic: `W1.8-${W.size}-reentered-now.png` })
}
SC.A13 = async W => {
  await ready(W)
  const rows = []
  await pressWords(W); await sleep(500); const a = await state(W); rows.push('words:' + a.sw)
  await pressWords(W); await sleep(500); const b = await state(W); rows.push('words again:' + b.sw)
  await pressSlider(W); await sleep(500); const c = await state(W); rows.push('slider:' + c.sw); await pic(W, `A13-${W.size}-slider-on`, { sel: BAR, pad: 40 })
  await pressSlider(W); await sleep(500); const d = await state(W); rows.push('slider again:' + d.sw)
  // two quick presses on the slider
  const l = W.page.locator(`${SW} input`).filter({ visible: true }).first()
  if (W.phone) { await l.tap(); await sleep(120); await l.tap() } else { await l.click(); await sleep(120); await l.click() }
  await sleep(700)
  const e = await state(W); rows.push('two quick presses -> ' + e.sw); const pq = await pic(W, `A13-${W.size}-two-quick`, { sel: BAR, pad: 40 })
  // one Undo undoes one press: do a single press then Undo
  await pressSlider(W); await sleep(500); const f = await state(W); rows.push('one more press -> ' + f.sw)
  await undo(W); const g = await state(W); rows.push('Undo -> ' + g.sw)
  await pic(W, `A13-${W.size}-undo`, { sel: BAR, pad: 40 })
  // count undo steps for the two quick presses: undo once more and see
  await undo(W); const h = await state(W); rows.push('Undo again -> ' + h.sw)
  const ok = a.sw === true && b.sw === false && c.sw === true && d.sw === false && e.sw === false && f.sw === true && g.sw === false
  rep.add({ sc: 'A13', size: W.size, res: ok ? 'PASS' : 'FAIL', said: rows.join('; '), pic: pq })
}
SC.A26 = async W => {
  await ready(W)
  const title = await W.page.evaluate(() => document.querySelector('#schedBoard .daybar label.lgmix').title)
  let pi = ''
  if (!W.phone) { const l = W.page.locator(SW).first(); await l.hover(); await sleep(1500); pi = await pic(W, 'A26-pc-hover', { full: true }) }
  const wantedTitle = 'Anything added to this day later earns no OIL either.'
  rep.add({ sc: 'A26a', size: W.size, res: title === wantedTitle ? 'PASS' : 'FAIL', said: `switch's title attribute: ${JSON.stringify(title)}${W.phone ? ' (no hover on a phone)' : ' (native tooltip does not show in a headless picture)'}`, pic: pi })
  await pressWords(W); await sleep(120); const t1 = await toastText(W.page); await pic(W, `A26-${W.size}-on-note`, { full: true })
  await sleep(400); const n1 = await noteText(W.page)
  await pressWords(W); await sleep(120); const t2 = await toastText(W.page); await pic(W, `A26-${W.size}-off-note`, { full: true })
  rep.add({ sc: 'A26b', size: W.size, res: 'RECORDED', said: `passing note on: ${JSON.stringify(t1)}; under-bar note on: ${JSON.stringify(n1)}; passing note off: ${JSON.stringify(t2)}`, pic: `A26-${W.size}-on-note.png, A26-${W.size}-off-note.png` })
}

for (const size of sizes) {
  for (const k of Object.keys(SC)) {
    if (only.length && !only.includes(k)) continue
    const W = await launch(size)
    try { await SC[k](W) } catch (e) { rep.add({ sc: k, size, res: 'NOT WALKED', said: 'script error: ' + e.message.split('\n')[0], pic: '' }) }
    if (W.errs.length) rep.note(`${k}/${size}: page errors ${JSON.stringify(W.errs)}`)
    await closeAll(W)
  }
}
saveRows(rep, 'fresh-' + (process.argv[2] || 'both') + (only.length ? '-' + only.join('') : ''))
console.log('DONE')
