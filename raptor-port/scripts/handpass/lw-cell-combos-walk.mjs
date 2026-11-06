// The WALK of [LW-CELL-COMBOS] (his D1723, D1725–D1731; 6 Nov 26): every kind of day the build draws, MADE THROUGH THE APP'S
// OWN CONTROLS — the drag window's leave, OD, Grant OIL (FO, HO), its AM / PM, a pending bid, and a leave filed on the Inputs
// page over a pending bid (the "!") — on a man who is here (Vapor) and the same on a man posted out (Diesel), then:
//   - every made day measured on screen: each box's letters inside its box, and the "!" over no letters;
//   - each day tapped on both men, the window it opens recorded beside the other man's (§7.11 lesson 23 — the expected
//     window is the one the same entry opens on an ordinary day), on a phone with a picture right after the tap (§7.10);
//   - the Legend's "Marks on a day" opened, closed by Escape and by a tap outside;
//   - the plain-user round (§7.0a): Undo and Redo of the last filing, a reload, the Inputs page.
// SIZE=desk|phone (the phone is WebKit at his iPhone's 402), LW_DIST=<build>, LW_OUT=<pictures>. Written as assertions,
// so a re-run on a fixed build is the re-walk.
process.env.LW_OUT ||= '2026-11-06-lw-cell-combos/walk'
process.env.WNAME = 'combos'
const { L, row, T, fresh, finish } = await import('./lw-f1106-w0.mjs')
const SIZE = L.SIZE
console.log('[lw-cell-combos-walk v3]', SIZE, L.DIST)
const w = await fresh(SIZE)
const P = w.page
const step = async (id, fn) => { try { await fn() } catch (e) { console.log(e.stack); row(id, SIZE, 'step', 'stopped: ' + String(e).slice(0, 250), 'NOT WALKED') } }
const GONE = await L.pidOf(P, 'Diesel'), HERE = await L.pidOf(P, 'Vapor')
const d = i => L.day(i)                         // L.day(33) = Mon 7 Dec 26
const PO = d(43)                                // Diesel posted out from Thu 17 Dec: his last day in is Wed 16 Dec

/* the days made, and what each should hold */
const DAYS = [
  ['one-whole', d(33), 'an OD alone'],
  ['two-whole', d(34), 'an OD and an LL, side by side, turned'],
  ['stack', d(35), 'an OD, an LL and an FO: a stack of cards'],
  ['one-fo', d(36), 'an FO alone'],
  ['whole-half', d(41), 'an OD with an HO over its morning'],
  ['last-or-half', d(42), 'an HO alone (Diesel: his last day in)'],
  ['am-pm', d(43), 'an LL morning over an OL afternoon (Diesel: his first gone day)'],
  ['am-pm-2', d(44), 'an LL morning over an OL afternoon'],
  ['bare-weekend', d(45), 'nothing (Diesel: a bare gone day, "PO")'],
  ['alarm-one', d(47), 'an LL filed on the Inputs page over a pending bid: the "!"'],
  ['pending', d(48), 'a pending LL bid'],
  ['two-pending', d(49), 'an OD beside a pending LL bid'],
  ['alarm-two', d(50), 'an OD beside an LL filed over a pending bid: two turned with the "!"'],
]

/* the drag window over two days, then its buttons */
async function drag(pid, a, z, ...buttons) {
  await L.dragCells(w, [pid, a], [pid, z])
  for (const b of buttons) {
    if (typeof b === 'function') { await b(); continue }
    if (!(await P.locator(T(b)).count())) { console.log(`   !! no ${b} in the window`); continue }
    await L.press(w, T(b)); await P.waitForTimeout(350)
    /* "below zero — tap the same leave again" */
    if (/^sel-(LL|OL)$/.test(b) && await L.vis(P, T('select-sheet')) && /again/i.test((await L.txt(P, T('select-sheet'))) || '')) { await L.press(w, T(b)); await P.waitForTimeout(500) }
  }
  await P.waitForTimeout(500)
  await L.closeWin(w); await L.settle(w)
}
const auto = on => async () => { await L.autoApprove(w, on, 'sel') }
const oil = pick => async () => {
  await L.press(w, T('sel-oil')); await P.waitForTimeout(300)
  if (await P.locator(T('sel-oil-pick-' + pick)).count()) await L.press(w, T('sel-oil-pick-' + pick))
  await L.press(w, T('sel-oil-give')); await P.waitForTimeout(700)
}
const more = async () => { if (await P.locator(T('sel-more')).count()) { await L.press(w, T('sel-more')); await P.waitForTimeout(300) } }

/* a leave filed on the Inputs page, the way a person does (the window "+ Input" opens — e2e/step4-leavewar.spec.ts) */
async function fileOnInputs(pid, type, iso) {
  await L.goPage(w, 'inputs', 'Inputs')
  await P.locator('#inListBtn').click(); await P.waitForTimeout(300)
  if (await P.locator('[data-testid="win-inputedit"]').count()) await P.locator('#inpEditCancel').click()
  await P.locator('#inNew').click(); await P.waitForSelector('#inpEditSave')
  await P.selectOption('#inpEditType', type)
  await P.selectOption('#inpEditPerson', pid)
  for (let i = 0; i < 36 && !(await P.locator(`#inpEdCal [data-iso="${iso}"]`).count()); i++) {
    const at = await P.locator('[data-testid="inpEdCal"]').getAttribute('data-month')
    await P.locator(`#inpEdCal button[aria-label="${at < iso.slice(0, 7) ? 'Next' : 'Previous'} month"]`).click()
  }
  await P.locator(`#inpEdCal [data-iso="${iso}"]`).click()
  if (await P.locator('#inpEditSpan').count()) await P.locator('#inpEditSpan [data-span="all"]').click()
  const before = await P.evaluate(() => window.INPUTS.length)
  await P.locator('#inpEditSave').click()
  await P.waitForTimeout(700)
  if (await P.locator('[data-testid="docconf-nodoc"]').count()) { await P.locator('[data-testid="docconf-nodoc"]').click(); await P.waitForTimeout(500) }
  const after = await P.evaluate(() => window.INPUTS.length)
  const said = await P.evaluate(() => (window.__said || []).slice(-1)[0] || '')
  await L.toWar(w); await L.openGrid(w); await L.settle(w)
  return { filed: after !== before, said }
}

async function setUp(pid) {
  await drag(pid, d(33), d(35), 'sel-file-OD')
  await drag(pid, d(34), d(35), auto(true), 'sel-LL')
  await drag(pid, d(35), d(36), oil('fo'))
  await drag(pid, d(40), d(41), 'sel-file-OD')
  await drag(pid, d(41), d(42), oil('ho'))
  await drag(pid, d(43), d(44), 'sel-portion-am', 'sel-LL')
  await drag(pid, d(43), d(44), 'sel-portion-pm', 'sel-OL')
  await drag(pid, d(47), d(48), auto(false), 'sel-LL')
  await drag(pid, d(49), d(50), 'sel-file-OD')
  await drag(pid, d(49), d(50), auto(false), 'sel-LL')
  await drag(pid, d(51), d(51), auto(true))        // the switch left on, as he keeps it (D1186)
  const f1 = await fileOnInputs(pid, 'LL', d(47))
  const f2 = await fileOnInputs(pid, 'LL', d(50))
  return { f1, f2 }
}

/* a day's cell as drawn: its classes, each box's words and place, and whether each box's letters stand inside its box and
   clear of the "!" (the letters' own line box — what a person sees cut) */
const look = (pid, iso) => P.evaluate(([pid, iso]) => {
  const td = document.querySelector(`[data-testid="cell-${pid}-${iso}"]`)
  if (!td) return null
  const warn = td.querySelector('.mk.warn'), wr = warn && getComputedStyle(warn).display !== 'none' ? warn.getBoundingClientRect() : null
  const boxes = [...td.querySelectorAll('.c')].filter(c => c.textContent).map(c => {
    const r = c.getBoundingClientRect(), rg = document.createRange(); rg.selectNodeContents(c); const t = rg.getBoundingClientRect()
    /* along the box's LENGTH only — the run of the letters: a line box is taller than its capitals by the font's own space
       above and below (a half day's box is about as tall as its capitals), so across the box it says nothing; the letters'
       own pixels across it are the measure's (lw-cell-combos-measure.mjs, every combination, 0 cut) */
    const tol = 0.75, turned = getComputedStyle(c).writingMode !== 'horizontal-tb'
    const inside = turned ? t.top >= r.top - tol && t.bottom <= r.bottom + tol : t.left >= r.left - tol && t.right <= r.right + tol
    const under = !!wr && t.left < wr.right - tol && t.right > wr.left + tol && t.top < wr.bottom - tol && t.bottom > wr.top + tol
    return { text: c.textContent, place: [...c.classList].filter(k => /^(whole|top|bot|left|right|bx-\w+)$/.test(k)).join(' '), inside, under, fs: getComputedStyle(c).fontSize }
  })
  return { td: [...td.classList].filter(k => /^(bx-\w+|gone|pofin|mkd)$/.test(k)).join(' '), boxes, mark: wr ? '!' : '', polast: !!td.querySelector('.polast'), text: td.innerText.replace(/\s+/g, ' ').trim() }
}, [pid, iso])
const sayLook = x => !x ? 'no cell' : `[${x.td}] ${x.boxes.map(b => `${b.text}(${b.place}${b.inside ? '' : ' CUT'}${b.under ? ' UNDER-!' : ''})`).join(' + ') || `"${x.text}"`}${x.mark ? ' !' : ''}${x.polast ? ' |last' : ''}`

/* what a tap opened, read off the screen */
const win = () => P.evaluate(() => {
  const vis = t => { const e = document.querySelector(`[data-testid="${t}"]`); return e && e.getBoundingClientRect().height > 0 ? e : null }
  const which = ['bid-picker', 'daylist-sheet', 'postout-sheet', 'select-sheet', 'sel-sheet', 'closed-note'].find(t => vis(t)) || 'none'
  const s = which === 'none' ? null : vis(which)
  return { which, title: s ? (s.querySelector('.bidsheet-hd .when')?.textContent || '').replace(/\s+/g, ' ').trim() : '' }
})

const made = {}
await step('setup', async () => {
  await L.postOutOn(w, GONE, PO, 'overseas', PO)
  await L.toWar(w); await L.openGrid(w)
  for (const [who, pid] of [['Vapor', HERE], ['Diesel', GONE]]) {
    made[who] = await setUp(pid)
    await L.rowShot(w, pid, d(32), d(37), `S-${SIZE}-${who}-week1`)
    await L.rowShot(w, pid, d(40), d(45), `S-${SIZE}-${who}-week2`)
    await L.rowShot(w, pid, d(46), d(51), `S-${SIZE}-${who}-week3`)
  }
  row('S-made', SIZE, 'the Inputs-page filings over the pending bids (Vapor, Diesel)', JSON.stringify(made),
    made.Vapor?.f1.filed && made.Vapor?.f2.filed && made.Diesel?.f1.filed && made.Diesel?.f2.filed ? 'PASS' : 'FAIL',
    ['week1', 'week2', 'week3'].flatMap(k => [`S-${SIZE}-Vapor-${k}`, `S-${SIZE}-Diesel-${k}`]))
})

/* each made day, as drawn, on both men */
const EXPECT = {
  'one-whole': x => x.boxes.length === 1, 'two-whole': x => /bx-tilt/.test(x.boxes.map(b => b.place).join()) && x.boxes.length === 2,
  stack: x => /bx-pile/.test(x.td) && x.boxes.length === 1, 'one-fo': x => x.boxes.length === 1,
  'whole-half': x => /bx-floor/.test(x.boxes.map(b => b.place).join()) && /bx-roof/.test(x.boxes.map(b => b.place).join()),
  'am-pm': x => x.boxes.length === 2 && /top/.test(x.boxes.map(b => b.place).join()) && /bot/.test(x.boxes.map(b => b.place).join()),
  'am-pm-2': x => x.boxes.length === 2, 'alarm-one': x => x.mark === '!' && /bx-alarm/.test(x.td),
  'two-pending': x => x.boxes.length === 2, 'alarm-two': x => x.mark === '!' && x.boxes.length === 2 && /bx-tilt/.test(x.boxes.map(b => b.place).join()),
}
for (const [id, iso, what] of DAYS) await step('L-' + id, async () => {
  const got = { Vapor: await look(HERE, iso), Diesel: await look(GONE, iso) }
  const whole = x => !!x && x.boxes.every(b => b.inside && !b.under)
  const goneDay = iso >= PO, lastDay = iso === d(42)
  const shapeOk = x => !EXPECT[id] || (!!x && EXPECT[id](x))
  const diesel = got.Diesel
  const poOk = !diesel ? false : lastDay ? diesel.polast && /bx-last/.test(diesel.td)
    : goneDay ? (got.Vapor?.boxes.length ? /bx-gone/.test(diesel.td) && !/PO/.test(diesel.text) : diesel.text === 'PO' && !/bx-gone/.test(diesel.td)) : !/bx-gone|bx-last/.test(diesel.td)
  const ok = whole(got.Vapor) && whole(got.Diesel) && shapeOk(got.Vapor) && poOk
  /* a close-up of the day on both men, four times the pixels, for the host's look (§7.10's close-up) */
  const pics = []
  for (const [who, pid] of [['Vapor', HERE], ['Diesel', GONE]]) {
    await L.reachCell(w, pid, iso)
    const cellL = P.locator(T(`cell-${pid}-${iso}`)).first()
    /* the desktop's pixels four times over FIRST (it can move the page), then the cell found and measured */
    const cdp = w.phone ? null : await w.ctx.newCDPSession(P)
    const vp = P.viewportSize()
    if (cdp) { await cdp.send('Emulation.setDeviceMetricsOverride', { width: vp.width, height: vp.height, deviceScaleFactor: 4, mobile: false }); await P.waitForTimeout(400) }
    await cellL.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await P.waitForTimeout(350)
    const b = await cellL.boundingBox()
    if (!b && cdp) { await cdp.send('Emulation.clearDeviceMetricsOverride'); await cdp.detach() }
    if (b) {
      await P.screenshot({ path: `${L.OUT}/C-${id}-${SIZE}-${who}.png`, clip: { x: b.x - 3, y: b.y - 3, width: b.width + 6, height: b.height + 6 }, scale: 'device' })
      if (cdp) { await cdp.send('Emulation.clearDeviceMetricsOverride'); await cdp.detach() }
      pics.push(`C-${id}-${SIZE}-${who}`)
    }
  }
  row('L-' + id, SIZE, `${iso}: ${what}`, `Vapor ${sayLook(got.Vapor)} · Diesel ${sayLook(got.Diesel)}`, ok ? 'PASS' : 'FAIL', pics)
})

/* each made day tapped, on Vapor then Diesel: the same window is expected (D1722 — the posting changes nothing a tap opens on
   a day that holds an entry); a bare gone day opens the posted-out sheet, which a here man has no twin of */
for (const [id, iso, what] of DAYS) await step('T-' + id, async () => {
  const got = {}
  for (const [who, pid] of [['Vapor', HERE], ['Diesel', GONE]]) {
    await L.openCell(w, pid, iso, w.phone ? `T-${id}-${SIZE}-${who}-0tap` : null)
    got[who] = await win()
    await L.shot(w, `T-${id}-${SIZE}-${who}`)
    await L.closeWin(w); await L.settle(w)
  }
  const same = got.Vapor.which === got.Diesel.which
  const bare = id === 'bare-weekend'
  row('T-' + id, SIZE, `tap ${iso} (${what}) on Vapor, then on Diesel`, `Vapor: ${got.Vapor.which} "${got.Vapor.title}" · Diesel: ${got.Diesel.which} "${got.Diesel.title}"`,
    bare ? 'RECORD' : same ? 'PASS' : 'FAIL', [`T-${id}-${SIZE}-Vapor`, `T-${id}-${SIZE}-Diesel`])
})

/* the Legend: opened, its "Marks on a day" pictured and measured, closed by Escape and by a tap outside */
await step('G-legend', async () => {
  await P.evaluate(() => window.scrollTo(0, 0)); await P.waitForTimeout(200)
  await L.press(w, T('legend-open')); await P.waitForTimeout(500)
  const rows = await P.evaluate(() => ['leg-two-whole', 'leg-corner-more', 'leg-corner-warn', 'leg-last-day', 'leg-corner-po'].map(t => {
    const e = document.querySelector(`[data-testid="${t}"]`); if (!e) return `${t}: MISSING`
    e.scrollIntoView({ block: 'center' })
    const bad = [...e.querySelectorAll('.c')].filter(c => { const r = c.getBoundingClientRect(), rg = document.createRange(); rg.selectNodeContents(c); const t2 = rg.getBoundingClientRect()
      return t2.left < r.left - .75 || t2.right > r.right + .75 || t2.top < r.top - .75 || t2.bottom > r.bottom + .75 }).length
    return `${t}: ${e.closest('.leg-row')?.innerText.replace(/\s+/g, ' ').trim()}${bad ? ' CUT' : ''}`
  }))
  await P.locator(T('leg-two-whole')).first().evaluate(e => e.scrollIntoView({ block: 'center' }))
  await P.waitForTimeout(300)
  await L.shot(w, `G-${SIZE}-1-legend-marks`)
  await P.keyboard.press('Escape'); await P.waitForTimeout(400)
  const goneEsc = !(await L.vis(P, T('legend')))
  await L.press(w, T('legend-open')); await P.waitForTimeout(500)
  const scrim = await P.locator(T('legend-scrim')).count()
  if (scrim) { const b = await P.locator(T('legend-scrim')).first().boundingBox(); await L.finger(w, b.x + 6, b.y + b.height - 6, w.phone ? `G-${SIZE}-2-0tap-outside` : null) }
  else await L.finger(w, 6, (P.viewportSize().height) - 6)
  await P.waitForTimeout(400)
  const goneOut = !(await L.vis(P, T('legend')))
  await L.shot(w, `G-${SIZE}-3-closed`)
  const ok = rows.every(r => !/MISSING|CUT/.test(r)) && goneEsc && goneOut
  row('G-legend', SIZE, 'the Legend: "Marks on a day" read and measured; closed by Escape; reopened and closed by a tap outside',
    `${rows.join(' | ')} · Escape closed: ${goneEsc} · outside closed: ${goneOut}`, ok ? 'PASS' : 'FAIL', [`G-${SIZE}-1-legend-marks`, `G-${SIZE}-3-closed`])
})

/* the phone's grid opens one step out (0.8): its letters at the one zoomed-out scale (D1726) */
await step('Z-scale', async () => {
  const z = await P.evaluate(() => { const t = document.querySelector('#page-leavewar .mx-wrap > table.mx'); return { zoom: t?.style.zoom || '1', small: !!t?.classList.contains('lw-small') } })
  const want = w.phone ? z.small && +z.zoom < 1 : !z.small
  row('Z-scale', SIZE, 'the grid at the zoom it opens at: the zoomed-out letters class only below 1', JSON.stringify(z), want ? 'PASS' : 'FAIL', [])
})

/* the plain-user round: Undo the last filing (Diesel's LL over his pending bid on the 24th), Redo it, reload, the Inputs page */
await step('U-undo-redo', async () => {
  const before = sayLook(await look(GONE, d(50)))
  await L.undo(w); await L.settle(w)
  const undone = sayLook(await look(GONE, d(50)))
  await L.rowShot(w, GONE, d(46), d(51), `U-${SIZE}-1-after-undo`)
  await L.redo(w); await L.settle(w)
  const redone = sayLook(await look(GONE, d(50)))
  await L.rowShot(w, GONE, d(46), d(51), `U-${SIZE}-2-after-redo`)
  row('U-undo-redo', SIZE, 'Undo then Redo of the last filing (Diesel, 24 Dec)', `before ${before} · undone ${undone} · redone ${redone}`,
    undone !== before && redone === before ? 'PASS' : 'FAIL', [`U-${SIZE}-1-after-undo`, `U-${SIZE}-2-after-redo`])
})
await step('U-reload', async () => {
  const before = await Promise.all(DAYS.map(([, iso]) => look(GONE, iso).then(sayLook)))
  await L.reloadAs(w, 'admin'); await L.toWar(w); await L.openGrid(w); await L.settle(w)
  await L.reachCell(w, GONE, d(33))
  const after = await Promise.all(DAYS.map(([, iso]) => L.reachCell(w, GONE, iso).then(() => look(GONE, iso)).then(sayLook)))
  const diff = DAYS.filter((_, i) => before[i] !== after[i]).map(([id], i) => id)
  await L.rowShot(w, GONE, d(46), d(51), `U-${SIZE}-3-after-reload`)
  row('U-reload', SIZE, 'a reload: every made day of Diesel drawn the same', diff.length ? `changed: ${diff.join(', ')}` : 'all the same', diff.length ? 'FAIL' : 'PASS', [`U-${SIZE}-3-after-reload`])
})
await step('U-inputs', async () => {
  const mine = await L.inputsOf(P, GONE)
  await L.goPage(w, 'inputs', 'Inputs'); await P.waitForTimeout(500)
  await L.shot(w, `U-${SIZE}-4-inputs`)
  row('U-inputs', SIZE, 'the Inputs page holds Diesel\'s filings', `${mine.length} inputs: ${JSON.stringify(mine).slice(0, 300)}`, mine.length >= 4 ? 'PASS' : 'RECORD', [`U-${SIZE}-4-inputs`])
  await L.toWar(w)
})

console.log('errs', JSON.stringify(w.errs))
row('errs', SIZE, 'console errors during the walk', `${w.errs.length}: ${JSON.stringify(w.errs.slice(0, 4))}`, w.errs.length ? 'FAIL' : 'PASS', [])
finish('combos-' + SIZE)
await L.closeBrowser()
