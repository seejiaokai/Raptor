// W1 part e2 — scenarios 7 and 8 again, with the person FAR DOWN the roster (so the Manning rows really are out of view when
// the bid is placed) and the scroll done WITHOUT a pointer (a finger scroll starts with a pointerdown, which the app counts as
// "his next tap" and takes the bubble down — recorded separately). The first run (lw-m3b-w1-e78.mjs, Drifter near the top) left
// the Manning rows on screen with only the Manning BUTTON scrolled off: its pictures are s7-1..s7-4.
// Usage (from raptor-port/): node scripts/handpass/lw-m3b-w1-e78b.mjs
const M = await import('./lw-m3b-w1-lib.mjs')
const { L, T } = M
const path = await import('node:path')
for (const p of ['s7d-', 's8-']) L.clearPrefix(p)
console.log('lw-m3b-w1-e78b phone/chromium out', L.OUT)
const w = await M.start('phone')
const P = w.page
console.log('page scripts:', await M.scriptCheck(w))
const lines = [], bad = []
const say = s => { lines.push(s); console.log('   ' + s) }
const judge = (ok, s) => { if (!ok) bad.push(s); say((ok ? 'ok    ' : 'WRONG ') + s) }
const shot = async name => { await P.screenshot({ path: path.join(L.OUT, name + '.png'), scale: 'css' }); return name + '.png' }
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
const buttonInView = () => P.evaluate(() => { const r = document.querySelector('[data-testid="counts-toggle"]').getBoundingClientRect(); return r.bottom > 0 && r.top < innerHeight })
const rowsGeom = () => P.evaluate(() => { const e = document.querySelector('[data-testid^="avail-p-2026"]'); if (!e) return null; const r = e.getBoundingClientRect(); return { top: Math.round(r.top), bottom: Math.round(r.bottom) } })

const ids = await M.ids(P)
const FAR = ids.Vapor
console.log('far man Vapor =', FAR)
async function bidFar(iso, name) {
  await L.openCellR(w, FAR, iso); await P.waitForSelector(T('bid-picker'), { timeout: 5000 })
  await M.setSwitch(w, false)
  let q = await tapRead(T('bid-LL'), name + '-first')
  if (await L.vis(P, T('bid-picker'))) { say('   (the window stayed open after the first tap: ' + (await L.txt(P, T('bid-dayline'))) + ' / ' + ((await L.txt(P, T('bid-picker'))) || '').slice(0, 120) + ' — tapping the same leave again, as the app asks)'); q = await tapRead(T('bid-LL'), name) }
  else await shot(name)
  if (await L.vis(P, T('bid-picker'))) { await L.closeAny(w); throw new Error('the bid window stayed open') }
  return q
}

/* ---------------- 7 (far down) ---------------- */
{
  const D = '2026-12-17'
  const f = await M.f1(w, D)
  say(`7d fixture: Required P typed ${f.req}, Available P ${f.cell.text} (${f.level})`)
  const folded = await M.foldRows(w)
  say(`7d the Manning rows are folded before the bid: ${folded}`)
  const q = await bidFar(D, 's7d-1-after-tap')
  const b = await M.bub(P)
  await shot('s7d-2-settled')
  say('7d right after the tap: ' + M.bubLine(q))
  say('7d settled:            ' + M.bubLine(b))
  const rv = await M.rowsInView(P), bt = await buttonInView()
  say(`7d Manning rows open ${await M.rowsOpen(P)}, in view ${rv} (rows at ${JSON.stringify(await rowsGeom())}); the Manning button in view ${bt}; scrollY ${b && b.scrollY}`)
  judge(!!b && M.isRed(b), '7d the bubble is red')
  judge(!!b && /^This bid: Available P \d+ → \d+$/.test(b.label || ''), `7d it reads "${b && b.label}" (the form "This bid: Available P 27 → 26", figures as read)`)
  judge(!!b && b.gapBelow <= 40 && b.inside, `7d it stands at the foot of the screen (${b && b.gapBelow}px above it)`)
  judge(!rv && !!b && !!b.show && b.show.visible, `7d the Manning rows are out of view (${!rv}) and Show › is ${b && b.show && b.show.visible ? 'drawn' : 'not drawn'}`)
  if (b && b.show && b.show.visible) {
    const c = await L.centre(P, T('manning-bubble-show'))
    const after = await tapRead(c, 's7d-3-show-q')
    await P.waitForTimeout(700)
    await shot('s7d-4-show-settled')
    const open = await M.anyWindowOpen(P)
    say(`7d after Show ›: bubble ${M.bubLine(await M.bub(P))}; rows in view ${await M.rowsInView(P)} (rows at ${JSON.stringify(await rowsGeom())}); the Manning button in view ${await buttonInView()}; windows open ${JSON.stringify(open)}`)
    judge(!(await M.bub(P)), '7d the bubble goes after Show ›')
    judge(await M.rowsInView(P), '7d Show › took him to the Manning rows (rows in view)')
    judge(open.length === 0, `7d no stray window opened (${JSON.stringify(open)})`)
  }
}

/* ---------------- 8 ---------------- */
{
  const D = '2026-12-18'
  const f = await M.f1(w, D)
  say(`8 fixture: Required P typed ${f.req}, Available P ${f.cell.text} (${f.level})`)
  await M.foldRows(w)
  await bidFar(D, 's8-1-after-tap')
  const trail = []
  const snap = async label => {
    const b = await M.bub(P), rv = await M.rowsInView(P), bt = await buttonInView()
    trail.push({ label, rv, bt, show: b?.show?.visible ?? null, y: b?.rect.y, words: b?.label })
    say(`8 ${label}: scrollY ${await P.evaluate(() => Math.round(scrollY))}; rows in view ${rv}; Manning button in view ${bt}; bubble ${b ? 'up' : 'GONE'}, Show › ${b?.show ? (b.show.visible ? 'drawn' : 'hidden') : 'not there'}; box y ${b?.rect.y}`)
    return b
  }
  const b0 = await snap('start')
  judge(!!b0 && !!b0.show && b0.show.visible && !trail[0].rv, '8 bubble up with Show › while the rows are out of view')
  // scroll up without a pointer in steps of 120 px until the Manning button is in view
  let n = 0
  const firstRowsIn = { at: null }, firstShowGone = { at: null }
  while (n < 40) {
    await P.evaluate(() => window.scrollBy(0, -120)); await P.waitForTimeout(250); n++
    const b = await snap(`scroll up ${n}`)
    const t = trail[trail.length - 1]
    if (t.rv && firstRowsIn.at === null) firstRowsIn.at = n
    if (b && b.show && !b.show.visible || (b && !b.show)) { if (firstShowGone.at === null) firstShowGone.at = n }
    if (t.bt && n > (firstRowsIn.at ?? 0) + 1) break
    if ((await P.evaluate(() => Math.round(scrollY))) === 0) break
  }
  await shot('s8-2-scrolled-up')
  const last = trail[trail.length - 1]
  say(`8 the rows came into view at step ${firstRowsIn.at}; Show › went at step ${firstShowGone.at}`)
  judge(last.rv && last.bt && last.show !== true && last.words === trail[0].words, `8 rows (and the button) in view: Show › ${last.show === true ? 'still drawn' : 'gone'}, bubble ${last.words ? 'still up with its words' : 'GONE'}`)
  judge(firstRowsIn.at !== null && firstShowGone.at !== null && firstShowGone.at <= firstRowsIn.at, `8 Show › left as soon as the rows came into view? rows in at step ${firstRowsIn.at}, Show › gone at step ${firstShowGone.at}`)
  // and out again
  n = 0
  while (n < 40) {
    await P.evaluate(() => window.scrollBy(0, 120)); await P.waitForTimeout(250); n++
    await snap(`scroll down ${n}`)
    const t = trail[trail.length - 1]
    if (!t.rv && !t.bt) break
  }
  await shot('s8-3-scrolled-down')
  const l2 = trail[trail.length - 1]
  judge(!l2.rv && l2.show === true && l2.words === trail[0].words, `8 rows out of view again: Show › ${l2.show === true ? 'drawn' : 'not drawn'}, bubble ${l2.words ? 'up' : 'GONE'}`)
  const ys = trail.map(t => t.y).filter(v => v != null)
  judge(ys.length > 3 && Math.max(...ys) - Math.min(...ys) <= 1, `8 the bubble stood still through ${ys.length} readings: box y ${Math.min(...ys)}..${Math.max(...ys)}`)
  // a FINGER scroll: pointerdown first — what happens to the bubble
  await P.waitForTimeout(300)
  const bf = await M.bub(P)
  say('8f before the finger scroll: bubble ' + (bf ? 'up' : 'gone'))
  if (bf) {
    await w.cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: 200, y: 500, id: 1 }] })
    await P.waitForTimeout(60)
    await w.cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: 200, y: 440, id: 1 }] })
    await P.waitForTimeout(60)
    const mid = await M.bub(P)
    await shot('s8-4-finger-down-mid-scroll')
    await w.cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
    await P.waitForTimeout(300)
    say(`8f a finger put down and moved (a scroll begins): bubble ${mid ? 'still up' : 'GONE'}; after the lift ${(await M.bub(P)) ? 'up' : 'gone'}`)
  }
}
console.log(`SUMMARY [phone/chromium]: ${lines.filter(l => /^(ok|WRONG)/.test(l)).length} judged, ${bad.length} wrong`)
for (const b of bad) console.log('   WRONG: ' + b)
console.log('errors:', JSON.stringify(w.errs))
await w.ctx.close(); await M.closeBrowser()
