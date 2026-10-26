// W1 part e — scenarios 7 and 8 (phone, Chromium): the manning bubble at the foot, red, "This bid: Available P 27 → 26";
// Show › only while the Manning rows are out of view; Show takes him there and the bubble goes; no stray window opens.
// Usage (from raptor-port/): node scripts/handpass/lw-m3b-w1-e78.mjs
const M = await import('./lw-m3b-w1-lib.mjs')
const { L, T } = M
const path = await import('node:path')
for (const p of ['s7-', 's8-']) L.clearPrefix(p)
console.log('lw-m3b-w1-e78 phone/chromium out', L.OUT)
const w = await M.start('phone')
const P = w.page
console.log('page scripts:', await M.scriptCheck(w))
const lines = [], bad = []
const say = s => { lines.push(s); console.log('   ' + s) }
const judge = (ok, s) => { if (!ok) bad.push(s); say((ok ? 'ok    ' : 'WRONG ') + s) }
const shot = async name => { await P.screenshot({ path: path.join(L.OUT, name + '.png'), scale: 'css' }); return name + '.png' }
/* a touch tap on a control, then (100 ms after the lift, the finger left where it pressed) the reading and the picture */
async function tapRead(target, name) {
  const c = typeof target === 'string' ? await L.centre(P, target) : target
  await w.cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: c.x, y: c.y, id: 1 }] })
  await P.waitForTimeout(40)
  await w.cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
  await P.waitForTimeout(100)
  const b = await M.bub(P)
  if (name) await shot(name)
  await P.waitForTimeout(450)
  return b
}
async function bidAndSee(who, iso, { inView, name, type = 'LL' }) {
  await L.openCellR(w, who, iso); await P.waitForSelector(T('bid-picker'), { timeout: 5000 })
  await M.setSwitch(w, false)
  await M.setManningView(w, inView)
  const q = await tapRead(T(`bid-${type}`), name)
  if (await L.vis(P, T('bid-picker'))) { await L.closeAny(w); throw new Error('the bid window stayed open') }
  return q
}

const ids = await M.ids(P)
const D1 = '2026-12-15', D2 = '2026-12-16'

/* ---------------- 7 ---------------- */
{
  const f = await M.f1(w, D1)
  say(`7 fixture: Required P typed ${f.req}, Available P ${f.cell.text} (${f.level})`)
  const folded = await M.foldRows(w)
  say(`7 the Manning rows are folded before the bid: ${folded}`)
  const before = await M.availNow(P, D1).catch(() => null)
  const q = await bidAndSee(ids.Drifter, D1, { inView: false, name: 's7-1-after-tap' })
  const b = await M.bub(P)
  const pic = await shot('s7-2-settled')
  say('7 right after the tap: ' + M.bubLine(q))
  say('7 settled:            ' + M.bubLine(b))
  say(`7 Manning rows open ${await M.rowsOpen(P)}, in view ${await M.rowsInView(P)}; the Manning button in view: ${await P.evaluate(() => { const r = document.querySelector('[data-testid="counts-toggle"]').getBoundingClientRect(); return r.bottom > 0 && r.top < innerHeight })}; page scrollY ${b && b.scrollY}`)
  judge(!!b && M.isRed(b), '7 the bubble is red (border / fill / words colours of the red family)')
  judge(!!b && /^This bid:/.test(b.label || '') && /Available P \d+ → \d+/.test(b.label), `7 the bubble reads "${b && b.label}" (wanted "This bid: Available P 27 → 26" in its figures as read)`)
  judge(!!b && b.pairs.length === 1 && b.pairs[0].t === (b.label || '').replace('This bid: ', ''), `7 one pair named: ${JSON.stringify(b && b.pairs.map(p => p.t))}`)
  judge(!!b && b.gapBelow <= 40 && b.inside, `7 the bubble stands at the foot of the screen (${b && b.gapBelow}px above the foot) and inside it`)
  const rowsView = await M.rowsInView(P)
  judge(!!b && !!b.show && b.show.visible === !rowsView, `7 Show › is ${b && b.show ? 'there' : 'not there'} while the Manning rows are ${rowsView ? 'in' : 'out of'} view`)
  if (b && b.show && b.show.visible) {
    const showCentre = await L.centre(P, T('manning-bubble-show'))
    const after = await tapRead(showCentre, 's7-3-show-q')
    const pic3 = await shot('s7-4-show-settled')
    const open = await M.anyWindowOpen(P)
    say(`7 after Show ›: bubble ${M.bubLine(after)}; Manning rows in view ${await M.rowsInView(P)}; windows open: ${JSON.stringify(open)}`)
    judge(!(await M.bub(P)), '7 the bubble goes after Show ›')
    judge(await M.rowsInView(P), '7 Show › took him to the Manning rows (rows in view)')
    judge(open.length === 0, `7 no stray window opened (open: ${JSON.stringify(open)})`)
  } else say('7 NOT WALKED: Show › not drawn, so it could not be pressed')
}

/* ---------------- 8 ---------------- */
{
  const f = await M.f1(w, D2)
  say(`8 fixture: Required P typed ${f.req}, Available P ${f.cell.text} (${f.level})`)
  await M.foldRows(w)
  const q = await bidAndSee(ids.Drifter, D2, { inView: false, name: 's8-1-after-tap' })
  const b0 = await M.bub(P)
  say('8 bubble up, rows out of view: ' + M.bubLine(b0) + `; rows in view ${await M.rowsInView(P)}`)
  const trail = []
  const snap = async label => { const b = await M.bub(P); const rv = await M.rowsInView(P); trail.push({ label, rv, show: b?.show?.visible ?? null, gap: b?.gapBelow, y: b?.rect.y, label2: b?.label }); say(`8 ${label}: rows in view ${rv}; bubble ${b ? 'up' : 'GONE'}, Show › ${b?.show ? (b.show.visible ? 'drawn' : 'hidden') : 'not there'}, bubble box y ${b?.rect.y} (${b?.gapBelow}px above the foot)`); return b }
  await snap('start')
  // a finger scroll toward the top, in steps, until the Manning rows are in view
  let steps = 0
  while (!(await M.rowsInView(P)) && steps < 10) { await M.fingerScroll(w, 300); steps++; await snap(`after finger scroll ${steps} (up)`) }
  const inView = await M.rowsInView(P)
  const bIn = await M.bub(P)
  await shot('s8-2-rows-in-view')
  judge(inView && !!bIn && !(bIn.show && bIn.show.visible), `8 rows scrolled into view: Show › is ${bIn?.show ? (bIn.show.visible ? 'still drawn' : 'hidden') : 'gone'} (wanted gone / hidden); bubble ${bIn ? 'still up' : 'gone'}`)
  // and out again
  steps = 0
  while ((await M.rowsInView(P)) && steps < 10) { await M.fingerScroll(w, -300); steps++; await snap(`after finger scroll ${steps} (down)`) }
  const bOut = await M.bub(P)
  await shot('s8-3-rows-out-again')
  judge(!(await M.rowsInView(P)) && !!bOut && !!bOut.show && bOut.show.visible, `8 rows out of view again: Show › ${bOut?.show ? (bOut.show.visible ? 'drawn' : 'hidden') : 'gone'} (wanted drawn)`)
  const ys = trail.map(t => t.y).filter(v => v != null), gaps = trail.map(t => t.gap).filter(v => v != null)
  judge(ys.length > 0 && Math.max(...ys) - Math.min(...ys) <= 1 && trail.every(t => t.label2 === trail[0].label2), `8 the bubble never moved under the finger: box y ${Math.min(...ys)}..${Math.max(...ys)} over ${ys.length} readings, gap above the foot ${Math.min(...gaps)}..${Math.max(...gaps)}, words unchanged`)
}
console.log(`SUMMARY [phone/chromium]: ${lines.filter(l => /^(ok|WRONG)/.test(l)).length} judged, ${bad.length} wrong`)
for (const b of bad) console.log('   WRONG: ' + b)
console.log('errors:', JSON.stringify(w.errs))
await w.ctx.close(); await M.closeBrowser()
