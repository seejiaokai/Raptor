// W1 part h2 — scenario 37 (phone, Chromium + WebKit): tap every control of a bid window, the day's list and the bubble, the pointer left on
// each: no tint or see-through cell only the pressed state shows (D1281, the order's §7.10). Every tap gets a reading ~100 ms after the lift
// (the pinned cells' backgrounds against their baseline) and a picture; a second reading when settled. Decided buttons keep their colours.
// Usage (from raptor-port/): node scripts/handpass/lw-m3b-w1-h37.mjs [chromium|webkit]
const M = await import('./lw-m3b-w1-lib.mjs')
const { L, T } = M
const path = await import('node:path')
const engine = process.argv[2] || 'chromium'
const tag = engine === 'webkit' ? 'wk' : 'cr'
L.clearPrefix('s37-' + tag)
console.log('lw-m3b-w1-h37 phone/' + engine, 'out', L.OUT)
const w = await M.start('phone', engine)
const P = w.page
console.log('page scripts:', await M.scriptCheck(w))
const lines = [], bad = []
const say = s => { lines.push(s); console.log('   ' + s) }
const judge = (ok, s) => { if (!ok) bad.push(s); say((ok ? 'ok    ' : 'WRONG ') + s) }
const ids = await M.ids(P)
let n = 0
P.on('filechooser', fc => fc.setFiles([]).catch(() => {}))

/* every pinned (position: sticky) box of the grid in view, with its background; keyed so two readings can be compared */
const pinned = () => P.evaluate(() => {
  const out = []
  const seen = new Map()
  for (const e of document.querySelectorAll('#page-leavewar td, #page-leavewar th')) {   // as the standing test of D1281 reads them (e2e/leavewar.spec.ts)
    const cs = getComputedStyle(e)
    if (cs.position !== 'sticky' || e.classList.contains('lwph')) continue
    const r = e.getBoundingClientRect()
    if (r.width < 1 || r.height < 1) continue
    const base = e.tagName + '.' + [...e.classList].join('.') + '|' + (e.dataset.testid || e.textContent.trim().slice(0, 10)).replace(/\s+/g, '')
    const k = base + '#' + (seen.set(base, (seen.get(base) || 0) + 1), seen.get(base))
    const m = cs.backgroundColor.match(/rgba?\(([^)]+)\)/)
    const parts = m ? m[1].split(',').map(x => parseFloat(x)) : [0, 0, 0, 0]
    const a = parts.length > 3 ? parts[3] : 1
    out.push({ k, bg: cs.backgroundColor, a, bgi: cs.backgroundImage === 'none' ? '' : cs.backgroundImage.slice(0, 50), op: cs.opacity, inView: !(r.bottom < 0 || r.top > innerHeight || r.right < 0 || r.left > innerWidth) })
  }
  return out
})
let base = null
const diff = (cur) => {
  const bm = new Map(base.map(b => [b.k, b]))
  const flags = []
  for (const c of cur) {
    const b = bm.get(c.k)
    if (!b) continue
    if (c.bg !== b.bg || c.op !== b.op || c.bgi !== b.bgi) flags.push(`${c.k}: ${b.bg}${b.bgi ? ' ' + b.bgi : ''} → ${c.bg}${c.bgi ? ' ' + c.bgi : ''} (opacity ${b.op} → ${c.op})`)
    else if (c.a < 0.99 && b.a >= 0.99) flags.push(`${c.k}: see-through ${c.bg}`)
  }
  return flags
}
/* tap a control with the finger left down-pressed state (pointer left where it pressed); read pinned cells at ~100 ms and when settled */
async function tapCheck(label, target, { settle = 450, expectClose = false } = {}) {
  n++
  const nn = String(n).padStart(2, '0')
  const c = typeof target === 'string' ? await L.centre(P, target) : target
  if (engine === 'chromium') {
    await w.cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: c.x, y: c.y, id: 1 }] })
    await P.waitForTimeout(40)
    await w.cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
  } else await P.touchscreen.tap(c.x, c.y)
  await P.waitForTimeout(100)
  const quick = await pinned()
  const fq = diff(quick)
  const file = `s37-${tag}-${nn}-${label.replace(/\W+/g, '-')}.png`
  await P.screenshot({ path: path.join(L.OUT, file), scale: 'css' })
  await P.waitForTimeout(settle)
  const settled = await pinned()
  const fs = diff(settled)
  const only = fq.filter(x => !fs.includes(x))
  say(`37 [${label}] pinned cells read ${quick.length}; at 100 ms: ${fq.length ? 'CHANGED ' + fq.slice(0, 3).join(' ; ') : 'unchanged'}; settled: ${fs.length ? 'CHANGED ' + fs.slice(0, 3).join(' ; ') : 'unchanged'}  [${file}]`)
  if (fq.length || fs.length) bad.push(`${label}: quick ${JSON.stringify(fq.slice(0, 3))} settled ${JSON.stringify(fs.slice(0, 3))}`)
  return { quick: fq, settled: fs, only, file }
}
const seeUnder = async () => (await pinned()).filter(p => p.a < 0.99).map(p => p.k + ' ' + p.bg)

/* the world: a few pending bids on separate days, and a day holding two entries */
const days = ['2026-11-02', '2026-11-03', '2026-11-04', '2026-11-05', '2026-11-06', '2026-11-09', '2026-11-10', '2026-11-11']
for (const d of days) await M.bidType(w, ids.Ranger, d, { approve: false })
await M.bidType(w, ids.Ranger, '2026-11-12', { approve: false, portion: 'am' })
await M.bidType(w, ids.Ranger, '2026-11-12', { approve: false, portion: 'pm', type: 'OL' })
await P.evaluate(() => window.scrollTo(0, 0)); await P.waitForTimeout(300)
await L.reachCell(w, ids.Ranger, days[0])
base = await pinned()
const clear0 = await seeUnder()
say(`37 baseline: ${base.length} pinned cells (sticky td / th of the grid, as the standing test reads them): ${base.map(b => b.k.split('#')[0]).join(', ')}; see-through at rest: ${JSON.stringify(clear0)}`)
const open = async d => { await P.keyboard.press('Escape').catch(() => {}); await P.waitForTimeout(200); await L.closeAny(w); await L.openCellR(w, ids.Ranger, d); await P.waitForSelector(T('bid-picker'), { timeout: 5000 }); await P.waitForTimeout(350) }

/* ---- the bid window: the controls that leave it open ---- */
await open(days[0])
for (const [label, sel] of [['Duration AM', T('portion-am')], ['Duration PM', T('portion-pm')], ['Duration Whole day', T('portion-full')], ['Pick a range', T('span-range')], ['Pick a range again', T('span-range')], ['Remarks box', T('bid-remarks')], ['till tick', T('bid-tl')], ['Approve what I enter', T('bid-approve-tick')], ['Approve what I enter again', T('bid-approve-tick')], ['Document', T('bid-doc-row') + ' button'], ['more', T('bid-more')]]) {
  if (!(await L.vis(P, T('bid-picker')))) await open(days[0])
  if (!(await P.locator(sel).count())) { say(`37 [${label}] control not drawn here`); continue }
  await tapCheck(label, sel)
}
/* ---- the controls that close it: each on its own day ---- */
const closers = [['Approve', 'decide-approve'], ['Refuse', 'decide-refuse'], ['Move', 'decide-shift'], ['Delete', 'bid-clear'], ['LL', 'bid-LL'], ['CSE', 'bid-file-CSE'], ['OD', 'bid-file-OD'], ['Grant OIL', 'bid-oil']]
for (let i = 0; i < closers.length; i++) {
  const [label, tid] = closers[i]
  await open(days[i + 1] || days[1])
  if (!(await P.locator(T(tid)).count())) { say(`37 [${label}] control not drawn here`); continue }
  const r = await tapCheck(label, T(tid), { settle: 700 })
  const wins = await M.anyWindowOpen(P)
  say(`37 [${label}] windows open after: ${JSON.stringify(wins)}`)
  if (wins.length) { await L.closeAny(w); await P.keyboard.press('Escape'); await P.waitForTimeout(300) }
  if (label === 'Move') { await P.keyboard.press('Escape'); await P.mouse.click(5, 5).catch(() => {}); await P.waitForTimeout(300) }
}
await L.closeAny(w)
/* the ⋯ items that file: Other and Attach each on a free day */
for (const [label, tid, d] of [['Other', 'bid-file-OTH', '2026-11-16'], ['Attach', 'bid-file-ATCH', '2026-11-17']]) {
  await L.closeAny(w); await L.openCellR(w, ids.Ranger, d); await P.waitForSelector(T('bid-picker')); await L.press(w, T('bid-more')); await P.waitForSelector(T('bid-more-menu'))
  await tapCheck(label, T(tid), { settle: 700 })
}
await L.closeAny(w)
/* ---- the close ✕ ---- */
try { await open('2026-11-18'); await tapCheck('close ✕', T('bid-cancel')) } catch (e) { say('37 [close ✕] could not open a window on a free day: ' + String(e).slice(0, 120) + '; windows ' + JSON.stringify(await M.anyWindowOpen(P))); await P.screenshot({ path: path.join(L.OUT, `s37-${tag}-stuck-before-close.png`), scale: 'css' }) }

/* ---- the day's list ---- */
await L.closeAny(w); await L.openCellR(w, ids.Ranger, '2026-11-12'); await P.waitForSelector(T('daylist'), { timeout: 5000 }); await P.waitForTimeout(400)
const ents = await P.evaluate(() => [...document.querySelectorAll('[data-testid^="dl-approve-"]')].map(b => b.dataset.testid.replace('dl-approve-', '')))
say('37 the day list holds ' + ents.length + ' entries')
if (ents.length >= 2) {
  // an approved entry's id changes (a request becomes an input), so each press finds its button again by position
  const nth = (prefix, i) => `[data-testid^="${prefix}"]:not([data-testid$="-row"]) >> nth=${i}`
  await tapCheck('list Approve (entry 1)', nth('dl-approve-', 0))
  await tapCheck('list Refuse (entry 2)', nth('dl-refuse-', 1))
  await tapCheck('list Refuse again (entry 2)', nth('dl-refuse-', 1))
  await tapCheck('list remarks box', '[data-testid^="dl-"][data-testid$="-remarks"] >> nth=0')
  await tapCheck('list till tick', '[data-testid^="dl-"][data-testid$="-tl"] >> nth=0')
  await tapCheck('list Move (entry 2)', nth('dl-move-', 1), { settle: 700 })
  await P.keyboard.press('Escape'); await P.waitForTimeout(300)
  if (!(await L.vis(P, T('daylist')))) { await L.openCellR(w, ids.Ranger, '2026-11-12'); await P.waitForSelector(T('daylist'), { timeout: 5000 }).catch(() => {}) }
  if (await L.vis(P, T('daylist'))) await tapCheck('list close ✕', T('daylist-close'), { settle: 600 })
}
await L.closeAny(w)

/* ---- the bubble ---- */
{
  const D = '2026-12-15'
  await P.evaluate(() => window.scrollTo(0, 0)); await P.waitForTimeout(200)
  const f = await M.f1(w, D); await M.foldRows(w)
  await L.openCellR(w, ids.Drifter, D); await P.waitForSelector(T('bid-picker')); await M.setSwitch(w, false)
  const c = await L.centre(P, T('bid-LL'))
  if (engine === 'chromium') { await w.cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: c.x, y: c.y, id: 1 }] }); await P.waitForTimeout(40); await w.cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }) } else await P.touchscreen.tap(c.x, c.y)
  await P.waitForTimeout(700)
  if (await L.vis(P, T('bid-picker'))) { await L.press(w, T('bid-LL')); await P.waitForTimeout(700) }
  const b = await M.bub(P)
  say('37 the bubble is up: ' + M.bubLine(b))
  if (b) {
    base = await pinned()
    await tapCheck('bubble body', { x: b.rect.x + 60, y: b.rect.y + b.rect.h / 2 })
    const b2 = await M.bub(P)
    say('37 a tap on the bubble\'s words leaves it ' + (b2 ? 'UP' : 'gone') + '; the screen shows ' + JSON.stringify(await M.anyWindowOpen(P)))
    if (b2 && b2.show) { await tapCheck('bubble Show ›', T('manning-bubble-show'), { settle: 900 }) }
    else if (!b2) say('37 (the bubble went on the first tap, so Show › was not pressed on this bubble)')
  }
}
const withChange = lines.filter(l => /CHANGED/.test(l))
console.log(`SUMMARY [phone/${engine}]: ${n} taps read; ${withChange.length} with a pinned cell changed or see-through; flagged: ${JSON.stringify(bad.slice(0, 6))}`)
console.log('errors:', JSON.stringify(w.errs))
await w.ctx.close(); await M.closeBrowser()
