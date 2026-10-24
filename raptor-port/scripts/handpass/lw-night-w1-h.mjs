// WALKER 1 — scenario 19 (changes that are not a bid: nothing is raised; and what a posting out and an approved-back bid do).
// Usage, from raptor-port/:  LW_PORT=4180 [SIZES=phone,desk] [ONLY=a,b,...] node scripts/handpass/lw-night-w1-h.mjs
import * as H from './lw-night-w1-lib.mjs'
import path from 'node:path'
import { readdirSync, unlinkSync } from 'node:fs'
const { L, T, rec } = H
console.log('lw-night-w1-h v1', L.OUT, 'port', L.PORT)
const SIZES = (process.env.SIZES || 'phone,desk').split(',')
const ONLY = process.env.ONLY ? new Set(process.env.ONLY.split(',')) : null
const run = id => !ONLY || ONLY.has(String(id))
for (const f of readdirSync(L.OUT)) if (f.endsWith('.png') && /^s19-/.test(f) && SIZES.some(s => f.includes(`-${s}-`)) && (!ONLY || [...ONLY].some(o => f.startsWith(`s19${o}-`)))) unlinkSync(path.join(L.OUT, f))
const RED = { border: /240, 85, 95/, bg: /46, 20, 24/, ink: /255, 170, 176/ }
const judge = (id, size, conds, said, pics) => {
  const bad = conds.filter(c => !c[1])
  rec(id, size, bad.length ? 'FAIL' : 'PASS', (bad.length ? 'FAILED: ' + bad.map(c => `${c[0]} (saw ${c[2]})`).join('; ') + ' — ' : '') + said, pics)
}
const rowsOpen = P => P.evaluate(() => { const e = document.querySelector('[data-testid^="avail-p-"]'); return !!e && e.getBoundingClientRect().height > 0 })
const availCell = async (P, iso) => { const c = await H.rowCell(P, `avail-p-${iso}`); return c ? `${c.text} ${H.levelOf(c)}` : null }
async function openRows(w) { const P = w.page; await P.evaluate(() => window.scrollTo(0, 0)); await P.waitForTimeout(250); if (!(await rowsOpen(P))) { await L.press(w, T('counts-toggle')); await P.waitForTimeout(600) } }
async function readA(w, iso) { const P = w.page; let a = await availCell(P, iso); if (a === null) { await openRows(w); await L.reachCell(w, 'bane', iso); a = await availCell(P, iso) } return a }
async function f1(w, iso, minus = 0) {
  const P = w.page
  await P.evaluate(() => window.scrollTo(0, 0))
  const a0 = await H.availP(w, iso)
  const req = await H.setReq(w, iso, Number(a0) - minus); await P.waitForTimeout(300)
  const cell = await H.rowCell(P, `avail-p-${iso}`)
  if (H.levelOf(cell) !== 'ok') throw new Error(`F1 ${iso}: Available P ${cell.text} ${H.levelOf(cell)}`)
  return { a0, req, cell }
}
async function setAvailPoints(w, amberText, redText) {
  const P = w.page
  await P.evaluate(() => window.scrollTo(0, 0)); await P.waitForTimeout(200)
  if (!(await H.availP(w, '2026-12-15'))) throw new Error('no avail row')
  await L.press(w, T('fly-name-avail-p')); await P.waitForSelector(T('cform-amber-pt'), { timeout: 4000 })
  await P.locator(T('cform-amber-pt')).fill(amberText); await P.locator(T('cform-red-pt')).fill(redText)
  await P.waitForTimeout(200)
  await L.press(w, T('cform-save')); await P.waitForTimeout(500)
  if (await L.vis(P, T('counter-form'))) throw new Error('Available P window stayed open')
}
async function setCounterAmber(w, ruleId, n) {
  const P = w.page
  await P.evaluate(() => window.scrollTo(0, 0)); await P.waitForTimeout(200)
  if (!(await H.availP(w, '2026-12-15'))) throw new Error('no rows')
  await L.press(w, T(`manning-info-${ruleId}`)); await P.waitForTimeout(400)
  await L.press(w, T('counter-edit-open')); await P.waitForSelector(T('cform-amber'), { timeout: 4000 })
  await P.locator(T('cform-amber')).fill(String(n)); await P.waitForTimeout(200)
  await L.press(w, T('cform-save')); await P.waitForTimeout(500)
  if (await L.vis(P, T('counter-form'))) throw new Error('counter window stayed open')
}

for (const size of SIZES) {
  const phone = size === 'phone'
  const w = await H.startWorld(size)
  const P = w.page
  const ids = await H.peopleIds(P)
  const sc = async (id, fn) => { if (!run(id)) return; console.log(`-- S19${id} [${size}]`); try { await fn() } catch (e) { rec(`S19${id}`, size, 'NOT DONE', 'script stopped: ' + String(e).slice(0, 500)); await H.closeAll(w).catch(() => {}); await P.keyboard.press('Escape').catch(() => {}) } }
  const nob = (b, why) => [[`no bubble (${why})`, b.where === 'none', H.bubbleLine(b)]]

  /* (a) Required P typed higher so Available P turns red */
  await sc('a', async () => {
    const D = '2026-12-08'
    await P.evaluate(() => window.scrollTo(0, 0))
    const a0 = await H.availP(w, D)
    const req = await H.setReq(w, D, Number(a0) + 3)
    await P.waitForTimeout(500)
    const b = await H.bubbleNow(P), a = await availCell(P, D)
    const pic = await H.cropPic(w, `s19a-${size}-settled`, [T('counts-toggle'), T(`avail-p-${D}`), T(`req-p-${D}`)])
    judge('S19a Required P typed higher: Available P turns red', size, [
      ['proof: Required P shows the typed figure', req === String(Number(a0) + 3), req],
      ['Available P turned red', a === `${a0} red`, `${a0} → ${a}`],
      ...nob(b, 'nothing was placed'),
    ], `Required P ${req}; Available P ${a0} → ${a}`, [pic].filter(Boolean))
  })
  /* (b) the Required row's "From <date> on" run */
  await sc('b', async () => {
    const D = '2026-12-14', D2 = '2026-12-16'
    await P.evaluate(() => window.scrollTo(0, 0))
    await H.availP(w, D)
    const before = await availCell(P, D2)
    const sel = T(`req-p-${D}`)
    await L.reachCell(w, 'bane', D)
    await P.locator(sel).scrollIntoViewIfNeeded()
    await L.press(w, sel)
    await P.waitForTimeout(400)
    const runBtn = phone ? T('fly-edit-run') : T('fly-edit-run')
    const hasRun = await L.vis(P, runBtn)
    if (hasRun) { await L.press(w, runBtn); await P.waitForTimeout(250) }
    if (phone) {
      const tapText = async t => { const bb = await P.evaluate(t => { const e = [...document.querySelectorAll('button')].find(b => { const r = b.getBoundingClientRect(); return r.height > 20 && r.top > 500 && b.innerText.trim() === t }); if (!e) return null; const r = e.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 } }, t); if (!bb) throw new Error('no pad key ' + t); await L.finger(w, bb.x, bb.y) }
      for (const ch of '30') await tapText(ch)
      await tapText('Done')
    } else { const inp = P.locator(T('fly-edit-input')); await inp.waitFor({ timeout: 3000 }); await inp.fill('30'); await inp.press('Enter') }
    await P.waitForTimeout(700)
    const b = await H.bubbleNow(P)
    const after = await availCell(P, D2), reqD2 = await H.rowCell(P, `req-p-${D2}`)
    const pic = await H.cropPic(w, `s19b-${size}-settled`, [T('counts-toggle'), T(`req-p-${D}`), T(`avail-p-${D2}`)])
    judge('S19b Required P "From <date> on" (a run over many days)', size, [
      ['the run choice was offered and used', hasRun, `fly-edit-run visible=${hasRun}`],
      ['proof: 16 Dec now has a Required figure and turned red', /red$/.test(after || '') && reqD2 && /30/.test(reqD2.text), `${before} → ${after}; Required ${JSON.stringify(reqD2)}`],
      ...nob(b, 'nothing was placed'),
    ], `Available P 16 Dec ${before} → ${after}`, [pic].filter(Boolean))
  })
  /* (d) Undo of a Refuse; Redo of a bid */
  await sc('d', async () => {
    const D = '2026-12-10'
    const f = await f1(w, D)
    await H.bidType(w, ids.Hunter, D, { type: 'LL', inView: true, approve: false }); await H.dismissBubble(w)
    await P.evaluate(() => window.scrollTo(0, 0))
    await L.openCellR(w, ids.Hunter, D); await P.waitForSelector(T('bid-picker'), { timeout: 5000 })
    await L.press(w, T('decide-refuse')); await P.waitForTimeout(700)
    const refused = await H.kinds(w, ids.Hunter, D), aRef = await readA(w, D)
    await P.evaluate(() => window.scrollTo(0, 0))
    const sU = await H.tapPic(w, '#undoBtn', `s19d-${size}-undo-refuse-after-tap`)
    await P.waitForTimeout(700)
    const bU = await H.bubbleNow(P), kU = await H.kinds(w, ids.Hunter, D), aU = await readA(w, D)
    judge('S19d Undo of a Refuse', size, [
      ['proof: the refuse was in, and Undo put the bid back (pending, counting again)', refused.some(x => /s-r/.test(x)) && kU.some(x => /^LL\|k-ll\|s-w/.test(x)), `refused ${JSON.stringify(refused)} → ${JSON.stringify(kU)}`],
      ['the figure went back down', aRef === `${f.a0} ok` && aU === `${Number(f.a0) - 1} red`, `${aRef} → ${aU}`],
      ...nob(bU, 'an Undo'), ...(sU ? [['none right after the tap either', sU.where === 'none', H.bubbleLine(sU)]] : []),
    ], `Available P ${aRef} → ${aU}; ${H.bubbleLine(bU)}`, [`s19d-${size}-undo-refuse-after-tap.png`])
    // Undo the bid itself, then Redo it
    await P.evaluate(() => window.scrollTo(0, 0))
    await H.tapPic(w, '#undoBtn', null); await P.waitForTimeout(600)
    const kUU = await H.kinds(w, ids.Hunter, D), aUU = await readA(w, D)
    await P.evaluate(() => window.scrollTo(0, 0))
    const sR = await H.tapPic(w, '#redoBtn', `s19d-${size}-redo-bid-after-tap`)
    await P.waitForTimeout(700)
    const bR = await H.bubbleNow(P), kR = await H.kinds(w, ids.Hunter, D), aR = await readA(w, D)
    judge('S19d Redo of a bid', size, [
      ['proof: Undo removed the bid, Redo placed it again', kUU.length === 0 && kR.some(x => /^LL\|k-ll\|s-w/.test(x)), `after Undo ${JSON.stringify(kUU)} → after Redo ${JSON.stringify(kR)}`],
      ['the figure went 28 → 27 red', aUU === `${f.a0} ok` && aR === `${Number(f.a0) - 1} red`, `${aUU} → ${aR}`],
      ...nob(bR, 'a Redo'), ...(sR ? [['none right after the tap either', sR.where === 'none', H.bubbleLine(sR)]] : []),
    ], `Available P ${aUU} → ${aR}; ${H.bubbleLine(bR)}`, [`s19d-${size}-redo-bid-after-tap.png`])
  })
  /* (e) an OD filed on the Inputs page, then back to the war */
  await sc('e', async () => {
    const D = '2026-12-11'
    const f = await f1(w, D)
    await L.inputsList(w)
    await L.press(w, '#inNew'); await P.waitForSelector('#inpEditPerson', { timeout: 6000 })
    await P.selectOption('#inpEditPerson', { label: 'Drifter' }).catch(async () => { const v = await P.evaluate(id => id, ids.Drifter); await P.selectOption('#inpEditPerson', v) })
    await P.selectOption('#inpEditType', { value: 'OD' }).catch(async () => { await P.selectOption('#inpEditType', { label: 'OD' }) })
    for (let i = 0; i < 8 && !(await L.vis(P, T(`inpEdCal-day-${D}`))); i++) { await L.press(w, T('inpEdCal-next')); await P.waitForTimeout(200) }
    await L.press(w, T(`inpEdCal-day-${D}`)); await P.waitForTimeout(250)
    await L.press(w, '#inpEditSave'); await P.waitForTimeout(900)
    const oilAsk = await L.vis(P, T('oilconf'))
    await P.evaluate(() => window.go('leavewar')); await P.waitForSelector('[data-testid="row-stiff"]'); await P.waitForTimeout(1000)
    await openRows(w); await L.reachCell(w, ids.Drifter, D)
    const b = await H.bubbleNow(P), a = await availCell(P, D), k = await H.kinds(w, ids.Drifter, D)
    const pic = await H.cropPic(w, `s19e-${size}-settled`, [T('counts-toggle'), T(`avail-p-${D}`)])
    judge('S19e an OD filed on the Inputs page, then back to the war', size, [
      ['proof: Drifter’s cell on 11 Dec shows the OD', k.some(x => /^OD\|k-od/.test(x)), JSON.stringify(k)],
      ['Available P turned red', a === `${Number(f.a0) - 1} red`, `${f.a0} → ${a}`],
      ...nob(b, 'a filing made on another page'),
    ], `OIL question asked: ${oilAsk}; Available P ${f.a0} → ${a}`, [pic].filter(Boolean))
  })
  /* (f) Post out / Post in */
  await sc('f', async () => {
    const D = '2026-12-14'
    const f = await f1(w, D)
    await P.evaluate(() => window.scrollTo(0, 0))
    const po = await H.postOut(w, ids.Diesel, D)
    await P.waitForTimeout(500)
    const b = await H.bubbleNow(P), a = await readA(w, D), kd = await H.kinds(w, ids.Diesel, D)
    let pic = await H.cropPic(w, `s19f-${size}-postout-settled`, [T('counts-toggle'), T('manning-bubble'), T('manning-bubble-foot'), T(`avail-p-${D}`)])
    if (!pic) pic = await H.settled(w, `s19f-${size}-postout-settled-full`)
    rec('S19f Post out from the one-day window, on a date that turns Available P red', size, 'RECORD', `Available P ${f.a0} → ${a}; Diesel's cell ${JSON.stringify(kd)}; posting line "${po.line}", right after the confirm tap: ${H.bubbleLine(po.seen)}; settled: ${H.bubbleLine(b)}. A bubble must never say "This bid" for it: ${b.where !== 'none' && /^This bid/.test(b.text) ? 'IT DOES — FAIL' : 'it does not'}.`, [pic].filter(Boolean))
    if (b.where !== 'none' && /^This bid/.test(b.text)) rec('S19f never "This bid" for a posting out', size, 'FAIL', `bubble said "${b.text}"`, [pic].filter(Boolean))
    await H.dismissBubble(w)
    // the drag window: a posting out from its ⋯
    const D2 = '2026-12-15'
    const f2 = await f1(w, D2)
    if (!(await H.dragCells(w, [ids.Vandal, D2], [ids.Vandal, '2026-12-16']))) throw new Error('no drag window')
    await H.setManningView(w, true)
    await L.press(w, T('sel-more')); await P.waitForTimeout(300)
    await L.press(w, T('sel-postout')); await P.waitForTimeout(400)
    const line = await L.txt(P, T('sel-po-line'))
    const seen = await H.tapPic(w, T('sel-po-confirm'), `s19f-${size}-sel-postout-after-tap`)
    await P.waitForTimeout(800)
    const open = await L.vis(P, T('select-sheet'))
    const b2 = await H.bubbleNow(P), a2 = await readA(w, D2), kv = await H.kinds(w, ids.Vandal, D2)
    const pic2 = await H.cropPic(w, `s19f-${size}-sel-postout-settled`, [T('counts-toggle'), T('manning-bubble'), T('manning-bubble-foot'), T(`avail-p-${D2}`)])
    rec('S19f Post out from the drag window, on a date that turns Available P red', size, 'RECORD', `Available P ${f2.a0} → ${a2}; Vandal's cell ${JSON.stringify(kv)}; window still open ${open}; line "${line}"; right after the confirm tap: ${H.bubbleLine(seen)}; settled: ${H.bubbleLine(b2)}. "This bid" for it: ${b2.where !== 'none' && /^This bid/.test(b2.text) ? 'YES — FAIL' : 'no'}.`, [`s19f-${size}-sel-postout-after-tap.png`, pic2].filter(Boolean))
    if (b2.where !== 'none' && /^This bid/.test(b2.text)) rec('S19f never "This bid" for a posting out (drag window)', size, 'FAIL', `bubble said "${b2.text}"`, [pic2].filter(Boolean))
    await H.dismissBubble(w)
    // Post in: a man's first day in the squadron set later — the days before it count nobody, so Available P falls on the F1 day before
    await L.closeAny(w)
    const D3 = '2026-12-29', D4 = '2026-12-31'
    const f3 = await f1(w, D3)
    await P.evaluate(() => window.scrollTo(0, 0))
    const pi = await H.postIn(w, ids.Reaper, D4)
    const sheetTxt = (pi.sheet?.text || '').slice(0, 300)
    await H.setManningView(w, true)
    let piSeen = null, piDid = 'no confirm control found'
    if (await L.vis(P, T('pi-confirm'))) { piSeen = await H.tapPic(w, T('pi-confirm'), `s19f-${size}-postin-after-tap`); await P.waitForTimeout(900); piDid = 'pressed Post in' }
    const bPI = await H.bubbleNow(P), aPI = await readA(w, D3)
    const picPI = await H.cropPic(w, `s19f-${size}-postin-settled`, [T('counts-toggle'), T('manning-bubble'), T('manning-bubble-foot'), T(`avail-p-${D3}`)])
    judge('S19f Post in (days before it count nobody)', size, [
      ['the Post in was pressed', piDid === 'pressed Post in', piDid],
      ['proof: Available P fell on 29 Dec (the days before his first day count nobody)', aPI === `${Number(f3.a0) - 1} red`, `${f3.a0} → ${aPI}`],
      ['no bubble right after', !piSeen || piSeen.where === 'none', piSeen ? H.bubbleLine(piSeen) : 'n/a'],
      ['no bubble settled', bPI.where === 'none', H.bubbleLine(bPI)],
    ], `sheet "${sheetTxt}"; ${H.bubbleLine(bPI)}`, [`s19f-${size}-postin-after-tap.png`, picPI].filter(Boolean))
    await L.closeAny(w)
  })
  /* (g) lesson 4: the drag window open on a man's days, a higher Required P typed behind it, then ✕ */
  await sc('g', async () => {
    const D = '2026-12-21', DA = '2026-12-22'
    await P.evaluate(() => window.scrollTo(0, 0))
    const a0 = await H.availP(w, DA)
    if (!(await H.dragCells(w, [ids.Cinch, D], [ids.Cinch, DA]))) throw new Error('no drag window')
    await H.setManningView(w, true)
    const open1 = await L.vis(P, T('select-sheet'))
    let typed = null
    try { typed = await H.setReq(w, DA, Number(a0) + 3) } catch (e) { typed = 'ERR ' + String(e).slice(0, 80) }
    await P.waitForTimeout(500)
    const open2 = await L.vis(P, T('select-sheet'))
    const aMid = await availCell(P, DA)
    const bMid = await H.bubbleNow(P)
    const midPic = await H.settled(w, `s19g-${size}-window-open-after-typing`)
    let b = null, seen = null
    if (open2) { seen = await H.tapPic(w, T('sel-cancel'), `s19g-${size}-x-after-tap`); await P.waitForTimeout(600); b = await H.bubbleNow(P) }
    else { b = await H.bubbleNow(P) }
    const a = await availCell(P, DA), kC = (await H.kinds(w, ids.Cinch, D)).join('+')
    const pic = await H.cropPic(w, `s19g-${size}-settled`, [T('counts-toggle'), T('manning-bubble'), T('manning-bubble-foot'), T(`avail-p-${DA}`)])
    judge('S19g the drag window open, a higher Required P typed behind it, then ✕', size, [
      ['the drag window was open when the figure was typed', open1, `open=${open1}`],
      ['the figure typed behind it took (Available P red)', /red$/.test(a || ''), `${a0} → ${aMid} / after ✕ ${a}; typed "${typed}"`],
      ['nothing was placed (Cinch’s days empty)', kC === '', kC],
      ['no bubble while the window was open', bMid.where === 'none', H.bubbleLine(bMid)],
      ...nob(b, 'nothing was placed — not "This bid turns …"'), ...(seen ? [['none right after the ✕ tap', seen.where === 'none', H.bubbleLine(seen)]] : []),
    ], `window still open after the typed figure: ${open2}${open2 ? '' : ' (the press on the Required cell itself closed the drag window, so its ✕ was never reached)'}; ${H.bubbleLine(b)}`, [midPic, seen ? `s19g-${size}-x-after-tap.png` : null, pic].filter(Boolean))
  })
  /* (h) Approve a refused bid back */
  await sc('h', async () => {
    const D = '2026-12-23'
    const f = await f1(w, D)
    await H.bidType(w, ids.Hunter, D, { type: 'LL', inView: true, approve: false }); await H.dismissBubble(w)
    await P.evaluate(() => window.scrollTo(0, 0))
    await L.openCellR(w, ids.Hunter, D); await P.waitForSelector(T('bid-picker'), { timeout: 5000 })
    await L.press(w, T('decide-refuse')); await P.waitForTimeout(700)
    const aRef = await readA(w, D), kRef = await H.kinds(w, ids.Hunter, D)
    await P.evaluate(() => window.scrollTo(0, 0))
    await L.openCellR(w, ids.Hunter, D); await P.waitForSelector(T('bid-picker'), { timeout: 5000 })
    await H.setManningView(w, true)
    const seen = await H.tapPic(w, T('decide-approve'), `s19h-${size}-window-approve-after-tap`)
    await P.waitForTimeout(800)
    const b = await H.bubbleNow(P), a = await readA(w, D), k = await H.kinds(w, ids.Hunter, D)
    const pic = await H.cropPic(w, `s19h-${size}-window-settled`, [T('counts-toggle'), T('manning-bubble'), T('manning-bubble-foot'), T(`avail-p-${D}`)])
    rec('S19h Approve a refused bid back — from the bid window', size, 'RECORD', `refused: cell ${JSON.stringify(kRef)}, Available P ${aRef}; after Approve: cell ${JSON.stringify(k)}, Available P ${a}; right after the tap: ${H.bubbleLine(seen)}; settled: ${H.bubbleLine(b)}. D1345 reads: raised, "This bid …" — ${b.where !== 'none' && /^This bid/.test(b.text) ? 'holds' : 'DOES NOT HOLD (no "This bid …" bubble)'}`, [`s19h-${size}-window-approve-after-tap.png`, pic].filter(Boolean))
    await H.dismissBubble(w)
    // via the drag window: refuse a second bid (Cinch 24 Dec) then approve it back by the drag window
    const D2 = '2026-12-24'
    const f2 = await f1(w, D2)
    if (!(await H.dragCells(w, [ids.Cinch, D2], [ids.Cinch, '2026-12-28']))) throw new Error('no drag window (fixture)')
    await H.setSwitch(w, false, 'sel')
    await H.selPress(w, T('sel-LL'), null, { ask: 'ask-then-go' }); await H.dismissBubble(w)
    if (!(await H.dragCells(w, [ids.Cinch, D2], [ids.Cinch, '2026-12-28']))) throw new Error('no drag window (refuse)')
    await L.press(w, T('sel-refuse')); await P.waitForTimeout(800)
    await H.dismissBubble(w)
    const aR2 = await readA(w, D2), kR2 = await H.kinds(w, ids.Cinch, D2)
    if (!(await H.dragCells(w, [ids.Cinch, D2], [ids.Cinch, '2026-12-28']))) throw new Error('no drag window (approve)')
    await H.setManningView(w, true)
    const seen2 = await H.tapPic(w, T('sel-approve'), `s19h-${size}-drag-approve-after-tap`)
    await P.waitForTimeout(800)
    const b2 = await H.bubbleNow(P), a2 = await readA(w, D2), k2 = await H.kinds(w, ids.Cinch, D2)
    const pic2 = await H.cropPic(w, `s19h-${size}-drag-settled`, [T('counts-toggle'), T('manning-bubble'), T('manning-bubble-foot'), T(`avail-p-${D2}`)])
    rec('S19h Approve a refused bid back — from the drag window', size, 'RECORD', `refused: cell ${JSON.stringify(kR2)}, Available P ${aR2}; after Approve: cell ${JSON.stringify(k2)}, Available P ${a2}; right after the tap: ${H.bubbleLine(seen2)}; settled: ${H.bubbleLine(b2)}. D1345 reads: raised, "This bid …" — ${b2.where !== 'none' && /^This bid/.test(b2.text) ? 'holds' : 'DOES NOT HOLD (no "This bid …" bubble)'}`, [`s19h-${size}-drag-approve-after-tap.png`, pic2].filter(Boolean))
  })
  /* (c) the Available row's amber/red points; a counter's amber number */
  await sc('c', async () => {
    const D = '2026-12-09'
    const f = await f1(w, D)
    await setAvailPoints(w, '+ 5', '+ 3')
    await P.waitForTimeout(500)
    const b1 = await H.bubbleNow(P), a1 = await availCell(P, D)
    const pic1 = await H.cropPic(w, `s19c-${size}-points-settled`, [T('counts-toggle'), T(`avail-p-${D}`), T(`req-p-${D}`)])
    judge('S19c the Available P row’s amber and red points changed in its window', size, [
      ['proof: the day turned red (28 is under Required 28 + 3)', a1 === `${f.a0} red`, `${f.a0} ok → ${a1}`],
      ...nob(b1, 'only a setting changed'),
    ], `Available P ${f.a0} → ${a1}`, [pic1].filter(Boolean))
    const ip0 = await H.rowCell(P, `count-ip-${D}`)
    await setCounterAmber(w, 'ip', 17)
    await P.waitForTimeout(500)
    const b2 = await H.bubbleNow(P), ip1 = await H.rowCell(P, `count-ip-${D}`)
    const pic2 = await H.cropPic(w, `s19c-${size}-counter-settled`, [T('counts-toggle'), T(`count-ip-${D}`)])
    judge('S19c a counter’s amber number typed (IP 17)', size, [
      ['proof: IP on the day turned amber', H.levelOf(ip1) === 'amber', `${JSON.stringify(ip0)} → ${JSON.stringify(ip1)}`],
      ...nob(b2, 'only a setting changed'),
    ], `IP ${ip0?.text} ${H.levelOf(ip0)} → ${ip1?.text} ${H.levelOf(ip1)}`, [pic2].filter(Boolean))
  })
  rec('errors-19', size, w.errs.length ? 'FAIL' : 'PASS', w.errs.length ? w.errs.slice(0, 6).join(' || ') : 'none (console, page, 4xx)')
  await w.ctx.close()
}
await L.closeBrowser()
H.saveResults(`h-${SIZES.join('-')}${ONLY ? '-' + [...ONLY].join('') : ''}`)
const R = H.results, c = r => R.filter(x => x.verdict === r).length
console.log('DONE', R.length, 'records:', c('PASS'), 'PASS', c('FAIL'), 'FAIL', c('RECORD'), 'RECORD', c('NOT DONE'), 'NOT DONE')
