// Re-walk item 1: admin, an empty day: "Approve what I enter" box and words, untick and tick again.
// usage: node lw-m3-rewalk-r1.mjs <desktop|phone> <chromium|webkit>
import * as L from './lw-m3-rewalk-lib.mjs'
const size = process.argv[2] || 'desktop', engine = process.argv[3] || 'chromium'
const tag = `r1-${size === 'phone' ? 'ph' : 'dk'}-${engine === 'webkit' ? 'wk' : 'cr'}`
console.log('lw-m3-rewalk-r1 v1', size, engine, tag)
L.clearPrefix(tag)
const w = await L.newCtx(size, engine)
const P = w.page
await L.signInPlain(w, 'admin')
await L.openCellR(w, 'bane', '2026-02-24')
await L.shot(w, tag + '-00-open')
const state = async () => {
  const g = await L.winGeom(P); const t = g?.tick.find(x => x.id === 'bid-approve-tick')
  const looks = {}; for (const k of ['LL', 'OL', 'OIL', 'CL']) looks[k] = await P.evaluate(t => { const b = document.querySelector(`[data-testid="bid-${t}"]`); const c = getComputedStyle(b); return { bg: c.backgroundColor, bd: 'outline ' + c.outlineStyle + ' / border ' + c.borderTopStyle } }, k)
  return { checked: t?.checked, tickBox: t?.box, label: await P.evaluate(() => { const l = document.querySelector('[data-testid="bid-approve-tick-label"]'); const r = l.getBoundingClientRect(); return { x: r.left, y: r.top, w: r.width, h: r.height } }), looks }
}
const hollow = s => Object.values(s.looks).every(l => l.bg === 'rgba(0, 0, 0, 0)' && /dashed/.test(l.bd))
const filled = s => Object.values(s.looks).every(l => l.bg !== 'rgba(0, 0, 0, 0)')
const s0 = await state()
console.log('initial', s0.checked, 'filled', filled(s0), JSON.stringify(s0.looks.LL), 'tickbox', JSON.stringify(s0.tickBox), 'label', JSON.stringify(s0.label))
L.rec(`1 ${size}/${engine} initial`, size, s0.checked === true && filled(s0) ? 'PASS' : 'FAIL', `ticked on open ${s0.checked}; leave buttons filled ${filled(s0)}`, [tag + '-00-open'])
// presses: by box centre / by label words (right part of the words, away from the box)
async function press1(name, how) {
  const before = await state()
  let x, y
  if (how === 'box') { x = before.tickBox.x + before.tickBox.w / 2; y = before.tickBox.y + before.tickBox.h / 2 }
  else { x = before.label.x + before.label.w - 20; y = before.label.y + before.label.h / 2 }
  if (w.phone) await L.finger(w, x, y, 0, tag + '-' + name + '-q')
  else { await P.mouse.click(x, y); await P.waitForTimeout(100); }
  await P.waitForTimeout(350)
  await L.shot(w, tag + '-' + name)
  const after = await state()
  return { before, after, x: Math.round(x), y: Math.round(y) }
}
const plan = [['01-box-untick', 'box', false], ['02-box-tick', 'box', true], ['03-words-untick', 'words', false], ['04-words-tick', 'words', true]]
for (const [name, how, want] of plan) {
  const r = await press1(name, how)
  const ok = r.after.checked === want && (want ? filled(r.after) : hollow(r.after))
  console.log(name, 'at', r.x, r.y, 'checked', r.before.checked, '->', r.after.checked, 'LL', JSON.stringify(r.after.looks.LL))
  L.rec(`1 ${size}/${engine} ${how} -> ${want ? 'ticked' : 'unticked'}`, size, ok ? 'PASS' : 'FAIL', `press ${how} at (${r.x},${r.y}): ${r.before.checked} -> ${r.after.checked}; buttons ${want ? 'filled' : 'hollow+dashed'}: ${want ? filled(r.after) : hollow(r.after)}; LL bg ${r.after.looks.LL.bg} border ${r.after.looks.LL.bd}`, w.phone ? [tag + '-' + name + '-q', tag + '-' + name] : [tag + '-' + name])
}
console.log('ERRORS', JSON.stringify(w.errs))
await L.closeBrowser()
