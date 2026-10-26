// WALKER 1 — scenarios 10, 11 and 12 (a filing's bubble: overseas duty, course, UNA — from the one-day window and from the drag window).
// Usage, from raptor-port/:  LW_PORT=4180 [SIZES=phone,desk] [ONLY=10,11,12] node scripts/handpass/lw-night-w1-d.mjs
import * as H from './lw-night-w1-lib.mjs'
import path from 'node:path'
import { readdirSync, unlinkSync } from 'node:fs'
const { L, T, rec } = H
console.log('lw-night-w1-d v1', L.OUT, 'port', L.PORT)
const SIZES = (process.env.SIZES || 'phone,desk').split(',')
const ONLY = process.env.ONLY ? new Set(process.env.ONLY.split(',')) : null
const run = id => !ONLY || ONLY.has(String(id))
for (const f of readdirSync(L.OUT)) if (f.endsWith('.png') && /^s1[012]-/.test(f) && SIZES.some(s => f.includes(`-${s}-`)) && (!ONLY || [...ONLY].some(o => f.startsWith(`s${o}-`)))) unlinkSync(path.join(L.OUT, f))
const RED = { border: /240, 85, 95/, bg: /46, 20, 24/, ink: /255, 170, 176/ }
const judge = (id, size, conds, said, pics) => {
  const bad = conds.filter(c => !c[1])
  rec(id, size, bad.length ? 'FAIL' : 'PASS', (bad.length ? 'FAILED: ' + bad.map(c => `${c[0]} (saw ${c[2]})`).join('; ') + ' — ' : '') + said, pics)
}
const redConds = (b, words) => [
  ['a bubble is up', b.where !== 'none', b.where],
  [`words "${words}"`, b.text === words, b.text],
  ['not the old "This bid …" for a filing', /^This bid/.test(words) || !/^This bid/.test(b.text || ''), b.text],
  ['data-level red', b.level === 'red', b.level],
  ['red border / fill / words', RED.border.test(b.border || '') && RED.bg.test(b.bg || '') && RED.ink.test(b.color || ''), `${b.border} ${b.bg} ${b.color}`],
  ['box inside the screen', !!b.inside, JSON.stringify(b.rect)],
  ['not both notes', !(b.all?.mid && b.all?.foot), JSON.stringify(b.all)],
  ['no sideways page scroll', b.docOverflowX <= 0 && b.pageScrollX === 0, `overflow ${b.docOverflowX} scrollX ${b.pageScrollX}`],
]
async function f1(w, iso, extra = 0) {
  const P = w.page
  await P.evaluate(() => window.scrollTo(0, 0))
  const a0 = await H.availP(w, iso)
  const req = await H.setReq(w, iso, Number(a0) + extra); await P.waitForTimeout(300)
  const cell = await H.rowCell(P, `avail-p-${iso}`)
  if (extra === 0 && H.levelOf(cell) !== 'ok') throw new Error(`F1 ${iso}: Available P ${cell.text} ${H.levelOf(cell)}`)
  return { a0, req, cell }
}
const availCell = async (P, iso) => { const c = await H.rowCell(P, `avail-p-${iso}`); return c ? `${c.text} ${H.levelOf(c)}` : null }
const boxOf = async (w, who, iso) => ((await L.cellInfo(w.page, who, iso))?.boxes ?? []).map(b => ({ text: b.text, cls: b.cls, bg: b.bg, brs: b.brs }))
async function inputsHas(w, text) {
  const P = w.page
  await L.inputsList(w)
  if (!w.phone) { const q = P.locator('input[placeholder="Search inputs"]'); if (await q.count()) { await q.fill('Drifter'); await P.waitForTimeout(600) } }
  const rows = await P.evaluate(() => [...document.querySelectorAll('#page-inputs [data-testid^="in"], #page-inputs tr, #page-inputs li, #page-inputs .inrow, #page-inputs .bar, #page-inputs .in-bar')].map(e => e.innerText.replace(/\s+/g, ' ').trim()).filter(Boolean).slice(0, 400))
  const body = await P.evaluate(() => (document.querySelector('#page-inputs') || document.body).innerText.replace(/\s+/g, ' ') || '')
  return { rows, body }
}

for (const size of SIZES) {
  const phone = size.startsWith('phone')
  const w = await H.startWorld(phone ? 'phone' : 'desk', size.endsWith('webkit') ? 'webkit' : 'chromium')
  const P = w.page
  const ids = await H.peopleIds(P)
  const sc = async (id, fn) => { if (!run(id)) return; console.log(`-- S${id} [${size}]`); try { await fn() } catch (e) { rec(`S${id}`, size, 'NOT DONE', 'script stopped: ' + String(e).slice(0, 500)); await H.closeAll(w).catch(() => {}) } }

  /* ============ S10: overseas duty and course from the one-day window ============ */
  await sc(10, async () => {
    const D = '2026-12-17'
    const f = await f1(w, D)
    if (phone) { await P.evaluate(() => window.scrollTo(0, 0)); await P.waitForTimeout(200); if (await P.evaluate(() => { const e = document.querySelector('[data-testid^="avail-p-2026"]'); return !!e && e.getBoundingClientRect().height > 0 })) { await L.press(w, T('counts-toggle')); await P.waitForTimeout(500) } }
    const r1 = await H.fileKind(w, ids.Drifter, D, 'OD', { inView: true, name: `s10-${size}-od-after-tap` })
    const b1 = await H.bubbleNow(P)
    const bx = await boxOf(w, ids.Drifter, D)
    const a1 = await availCell(P, D)
    const pic1 = await H.cropPic(w, `s10-${size}-od-settled`, [T('counts-toggle'), T('manning-bubble'), T(`avail-p-${D}`)])
    const cellPic = await (async () => { try { await L.cellShot(w, ids.Drifter, D, `s10-${size}-od-cell`); return `s10-${size}-od-cell.png` } catch { return null } })()
    judge('S10 overseas duty from the one-day window', size, [
      ['the OD on Drifter’s cell, filled (approved) in slate (128,142,160)', bx.some(b => b.text === 'OD' && /k-od/.test(b.cls) && /s-a/.test(b.cls) && /128, 142, 160/.test(b.bg)), JSON.stringify(bx)],
      ['Available P turned red', a1 === `${Number(f.a0) - 1} red`, `${f.a0} → ${a1}`],
      ...redConds(b1, 'This overseas duty turns Available P red.'),
    ], `Available P ${f.a0} → ${a1}; right after the tap: ${H.bubbleLine(r1.seen)}; settled: ${H.bubbleLine(b1)}`, [`s10-${size}-od-after-tap.png`, pic1, cellPic].filter(Boolean))
    await H.dismissBubble(w)
    const r2 = await H.fileKind(w, ids.Ridge, D, 'CSE', { inView: true, name: `s10-${size}-cse-after-tap` })
    const b2 = await H.bubbleNow(P)
    const bx2 = await boxOf(w, ids.Ridge, D)
    const a2 = await availCell(P, D)
    const pic2 = await H.cropPic(w, `s10-${size}-cse-settled`, [T('counts-toggle'), T('manning-bubble'), T(`avail-p-${D}`)])
    judge('S10 course from the one-day window, same day', size, [
      ['CSE on Ridge’s cell', bx2.some(b => b.text === 'CSE' && /k-cse|k-crs|k-course/.test(b.cls) || b.text === 'CSE'), JSON.stringify(bx2)],
      ['Available P lower, still red', a2 === `${Number(f.a0) - 2} red`, `${a1} → ${a2}`],
      ...redConds(b2, 'This course takes Available P lower, still red.'),
    ], `Available P ${a1} → ${a2}; right after: ${H.bubbleLine(r2.seen)}; settled: ${H.bubbleLine(b2)}`, [`s10-${size}-cse-after-tap.png`, pic2].filter(Boolean))
    await H.dismissBubble(w)
    /* the OD on the Inputs page */
    const inp = await inputsHas(w, 'Drifter')
    const sec = (inp.body.match(/THU 17 DEC[\s\S]*?(?=(?:MON|TUE|WED|THU|FRI|SAT|SUN) \d+ [A-Z]{3}\b|$)/i) || [''])[0]
    const near = (inp.body.match(/.{0,120}Drifter\s*OD\b.{0,120}/i) || [''])[0]
    const tbl = (inp.body.match(/Drifter\s+17 Dec.{0,60}/i) || [''])[0]
    const hasOD = (/Drifter\s*OD\b/i.test(sec) && /Ridge\s*CSE\b/i.test(sec)) || /Drifter\s+17 Dec\b.{0,40}\bOD\b/i.test(inp.body)
    const inpPic = await H.settled(w, `s10-${size}-inputs-page`)
    rec('S10 the OD on the Inputs page', size, hasOD ? 'PASS' : 'RECORD', `under the Inputs list's heading for Thu 17 Dec, a Drifter OD card and a Ridge CSE card: ${hasOD}; that day's text: "${(sec || tbl || near).slice(0, 260)}"`, [inpPic])
    await P.evaluate(() => window.go('leavewar')); await P.waitForSelector('[data-testid="row-stiff"]'); await P.waitForTimeout(700)
  })

  /* ============ S11: UNA from the one-day window ============ */
  await sc(11, async () => {
    const D = '2026-12-10'
    const f = await f1(w, D)
    // F2: a pending bid first
    await H.bidType(w, ids.Hunter, D, { type: 'LL', inView: true, approve: false }); await H.dismissBubble(w)
    const a0 = await availCell(P, D)
    if (a0 !== `${Number(f.a0) - 1} red`) throw new Error(`premise F2: ${a0}`)
    // a. UNA whole day
    const ra = await H.fileKind(w, ids.Ridge, D, 'UNA', { inView: true, name: `s11-${size}-una-whole-after-tap` })
    const ba = await H.bubbleNow(P), aa = await availCell(P, D), kra = await H.kinds(w, ids.Ridge, D)
    const pa = await H.cropPic(w, `s11-${size}-una-whole-settled`, [T('counts-toggle'), T('manning-bubble'), T(`avail-p-${D}`)])
    judge('S11 UNA whole day on a red day', size, [
      ['UNA on Ridge’s cell', kra.some(x => /^UNA\|k-una/.test(x)), JSON.stringify(kra)],
      ['Available P lower by 1, still red', aa === `${Number(f.a0) - 2} red`, `${a0} → ${aa}`],
      ...redConds(ba, 'This UNA takes Available P lower, still red.'),
    ], `Available P ${a0} → ${aa}; right after: ${H.bubbleLine(ra.seen)}; settled: ${H.bubbleLine(ba)}`, [`s11-${size}-una-whole-after-tap.png`, pa].filter(Boolean))
    await H.dismissBubble(w)
    // b. a morning UNA: lower by .5
    const rb = await H.fileKind(w, ids.Diesel, D, 'UNA', { inView: true, portion: 'am', name: `s11-${size}-una-am-after-tap` })
    const bb = await H.bubbleNow(P), ab = await availCell(P, D), krb = await H.kinds(w, ids.Diesel, D)
    const pb = await H.cropPic(w, `s11-${size}-una-am-settled`, [T('counts-toggle'), T('manning-bubble'), T(`avail-p-${D}`)])
    judge('S11 UNA morning (lower by .5)', size, [
      ['a morning UNA on Diesel’s cell', krb.some(x => /^UNA\|k-una/.test(x) && /top|right-am|left/.test(x)), JSON.stringify(krb)],
      ['Available P lower by .5, still red', ab === `${Number(f.a0) - 2.5} red`, `${aa} → ${ab}`],
      ...redConds(bb, 'This UNA takes Available P lower, still red.'),
    ], `Available P ${aa} → ${ab}; right after: ${H.bubbleLine(rb.seen)}; settled: ${H.bubbleLine(bb)}`, [`s11-${size}-una-am-after-tap.png`, pb].filter(Boolean))
    await H.dismissBubble(w)
    // c. a morning UNA beside his approved afternoon leave: whole day away
    const rcL = await H.bidType(w, ids.Gambit, D, { type: 'LL', inView: true, approve: true, portion: 'pm' }); await H.dismissBubble(w)
    const ac0 = await availCell(P, D)
    const rc = await H.fileKind(w, ids.Gambit, D, 'UNA', { inView: true, portion: 'am', name: `s11-${size}-una-beside-leave-after-tap` })
    const bc = await H.bubbleNow(P), ac = await availCell(P, D), krc = await H.kinds(w, ids.Gambit, D)
    const pc = await H.cropPic(w, `s11-${size}-una-beside-leave-settled`, [T('counts-toggle'), T('manning-bubble'), T(`avail-p-${D}`)])
    judge('S11 UNA beside his approved afternoon leave (whole day away)', size, [
      ['Gambit holds an approved PM LL', rcL.k.some(x => /^LL\|k-ll\|s-a/.test(x)), JSON.stringify(rcL.k)],
      ['a UNA now also on the cell', krc.some(x => /^UNA\|k-una/.test(x)), JSON.stringify(krc)],
      ['Available P lower by .5 (the whole day now away), still red', ac === `${Number(ac0.split(' ')[0]) - 0.5} red`, `${ac0} → ${ac}`],
      ...redConds(bc, 'This UNA takes Available P lower, still red.'),
    ], `Available P ${ac0} → ${ac}; right after: ${H.bubbleLine(rc.seen)}; settled: ${H.bubbleLine(bc)}`, [`s11-${size}-una-beside-leave-after-tap.png`, pc].filter(Boolean))
    await H.dismissBubble(w)
    // d. a bid in the next window → "This bid …"
    const rd = await H.bidType(w, ids.Trident, D, { type: 'LL', inView: true, approve: false, name: `s11-${size}-bid-after-una-after-tap` })
    const bd = await H.bubbleNow(P), ad = await availCell(P, D)
    judge('S11 then a bid in the next window', size, [
      ['LL pending', rd.k.some(x => /^LL\|k-ll\|s-w/.test(x)), JSON.stringify(rd.k)],
      ...redConds(bd, 'This bid takes Available P lower, still red.'),
    ], `Available P ${ac} → ${ad}; right after: ${H.bubbleLine(rd.seen)}; settled: ${H.bubbleLine(bd)}`, [`s11-${size}-bid-after-una-after-tap.png`])
    await H.dismissBubble(w)
  })

  /* ============ S12: filings from the drag window ============ */
  await sc(12, async () => {
    const press = async (sel, name) => {
      await H.setSwitch(w, false, 'sel').catch(() => {})
      await H.setManningView(w, true)
      const r = await H.selPress(w, sel, name, { ask: 'ask-then-go' })
      await P.waitForTimeout(600)
      return r
    }
    // (a) one man CSE: Ridge 9–10 Dec, F1 on 9 Dec (Wed)
    {
      const D9 = '2026-12-09', D10 = '2026-12-10'
      const f = await f1(w, D9)
      if (!(await H.dragCells(w, [ids.Piston, D9], [ids.Piston, D10]))) throw new Error('no drag window (CSE one man)')
      const r = await press(T('sel-file-CSE'), `s12-${size}-cse-one-after-tap`)
      const b = await H.bubbleNow(P), a = await availCell(P, D9), k = await boxOf(w, ids.Piston, D9)
      const pic = await H.cropPic(w, `s12-${size}-cse-one-settled`, [T('counts-toggle'), T('manning-bubble'), T(`avail-p-${D9}`)])
      judge('S12 one man, a range holding a red day: course', size, [
        ['the window closed', !r.open, `open=${r.open} note="${r.note}"`],
        ['CSE on the cell', k.some(x => x.text === 'CSE'), JSON.stringify(k)],
        ['Available P turned red', a === `${Number(f.a0) - 1} red`, `${f.a0} → ${a}`],
        ...redConds(b, 'This course turns Available P red.'),
      ], `Available P ${f.a0} → ${a}; ${H.bubbleLine(b)}`, [`s12-${size}-cse-one-after-tap.png`, pic].filter(Boolean))
      await H.dismissBubble(w)
    }
    // (b) three men CSE on 11 Dec
    {
      const D = '2026-12-11'
      const f = await f1(w, D)
      if (!(await H.dragCells(w, [ids.Reaper, D], [ids.Cinch, D]))) throw new Error('no drag window (CSE three men)')
      const r = await press(T('sel-file-CSE'), `s12-${size}-cse-three-after-tap`)
      const b = await H.bubbleNow(P), a = await availCell(P, D)
      const pic = await H.cropPic(w, `s12-${size}-cse-three-settled`, [T('counts-toggle'), T('manning-bubble'), T(`avail-p-${D}`)])
      judge('S12 three men: course', size, [
        ['the window closed', !r.open, `open=${r.open} note="${r.note}"`],
        ['Available P turned red (3 away)', a === `${Number(f.a0) - 3} red`, `${f.a0} → ${a}`],
        ...redConds(b, 'This course turns Available P red.'),
        ['names the row once', (b.text.match(/Available P/g) || []).length === 1, b.text],
      ], `Available P ${f.a0} → ${a}; ${H.bubbleLine(b)}`, [`s12-${size}-cse-three-after-tap.png`, pic].filter(Boolean))
      await H.dismissBubble(w)
    }
    // (c) OD over Thu 3 – Mon 7 Dec (a weekend inside), F1 on 3 Dec
    {
      const D3 = '2026-12-03', D7 = '2026-12-07'
      const f = await f1(w, D3)
      if (!(await H.dragCells(w, [ids.Drifter, D3], [ids.Drifter, D7]))) throw new Error('no drag window (OD range)')
      const span = await L.txt(P, T('sel-span'))
      const r = await press(T('sel-file-OD'), `s12-${size}-od-range-after-tap`)
      const b = await H.bubbleNow(P), a = await availCell(P, D3)
      const ks = []; for (const d of ['2026-12-03', '2026-12-04', '2026-12-05', '2026-12-06', D7]) ks.push((await boxOf(w, ids.Drifter, d)).map(x => x.text).join('+') || 'none')
      const pic = await H.cropPic(w, `s12-${size}-od-range-settled`, [T('counts-toggle'), T('manning-bubble'), T(`avail-p-${D3}`)])
      judge('S12 overseas duty over Thu 3 – Mon 7 Dec (a weekend inside)', size, [
        ['the window closed', !r.open, `open=${r.open} note="${r.note}"`],
        ['OD on the weekdays', ks[0] === 'OD' && ks[1] === 'OD' && ks[4] === 'OD', JSON.stringify(ks) + ' ' + span],
        ['Available P turned red on 3 Dec', a === `${Number(f.a0) - 1} red`, `${f.a0} → ${a}`],
        ...redConds(b, 'This overseas duty turns Available P red.'),
        ['never turns into "This bid"', !/This bid/.test(b.text || ''), b.text],
      ], `range ${span}; cells ${JSON.stringify(ks)}; Available P ${f.a0} → ${a}; ${H.bubbleLine(b)}`, [`s12-${size}-od-range-after-tap.png`, pic].filter(Boolean))
      const btnIn = await P.evaluate(() => { const r = document.querySelector('[data-testid="counts-toggle"]').getBoundingClientRect(); return r.bottom > 0 && r.top < innerHeight })
      const oilUp = await L.vis(P, T('oilconf'))
      const covered = await P.evaluate(() => { const n = document.querySelector('[data-testid="manning-bubble-foot"]'); if (!n) return null; const r = n.getBoundingClientRect(); const e = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return e ? (e.dataset.testid || e.className || e.tagName).toString().slice(0, 40) : null })
      const placementOk = b.where === 'mid'
      rec('S12 OD over a weekend: where the bubble stands while the OIL question is up', size, placementOk ? 'PASS' : 'FAIL', `the Manning button is ${btnIn ? 'IN view' : 'out of view'}; the OIL question (weekend days) is ${oilUp ? 'up over the input window' : 'not up'}; the bubble stands ${b.where === 'mid' ? 'under the Manning button' : b.where === 'foot' ? 'AT THE FOOT with "Show ›" although the button is in view, behind the OIL question’s scrim (the element at its centre is "' + covered + '")' : 'nowhere'}. D1277: the foot note is for a button out of view. A tap anywhere (the OIL question’s own buttons included) ends it, so it is seen only dimmed behind the dialog.`, [`s12-${size}-od-range-after-tap.png`])
      const did = await H.clearOilAsk(w)
      rec('S12 OD over a weekend: the OIL question answered', size, 'RECORD', `cleared by: ${JSON.stringify(did)}; bubble after: ${H.bubbleLine(await H.bubbleNow(P))}`, [])
      await H.dismissBubble(w)
    }
    // (d) UNA on three men, 14 Dec
    {
      const D = '2026-12-14'
      const f = await f1(w, D)
      if (!(await H.dragCells(w, [ids.Piston, D], [ids.Saber, D]))) throw new Error('no drag window (UNA three men)')
      const who = await L.txt(P, T('sel-who'))
      const r = await press(T('sel-una'), `s12-${size}-una-three-after-tap`)
      const b = await H.bubbleNow(P), a = await availCell(P, D)
      const pic = await H.cropPic(w, `s12-${size}-una-three-settled`, [T('counts-toggle'), T('manning-bubble'), T(`avail-p-${D}`)])
      judge('S12 UNA on three men', size, [
        ['the window closed', !r.open, `open=${r.open} note="${r.note}"`],
        ['Available P turned red (3 away)', a === `${Number(f.a0) - 3} red`, `${f.a0} → ${a}`],
        ...redConds(b, 'This UNA turns Available P red.'),
        ['names the row once', (b.text.match(/Available P/g) || []).length === 1, b.text],
      ], `${who}; Available P ${f.a0} → ${a}; ${H.bubbleLine(b)}`, [`s12-${size}-una-three-after-tap.png`, pic].filter(Boolean))
      await H.dismissBubble(w)
    }
    // (e) one man's range with a day outside his stint (posted out): the skip note? ✕ → the bubble with the filing's word
    {
      const D28 = '2026-12-28', D30 = '2026-12-30'
      const po = await H.postOut(w, ids.Vandal, '2026-12-29')
      const f = await f1(w, D28)
      if (!(await H.dragCells(w, [ids.Vandal, D28], [ids.Vandal, D30]))) throw new Error('no drag window (OD outside the stint)')
      const r = await press(T('sel-file-OD'), `s12-${size}-od-stint-after-tap`)
      const noteText = (await L.txt(P, T('sel-note'))) || ''
      const bWhile = await H.bubbleNow(P)
      const openPic = await H.settled(w, `s12-${size}-od-stint-window`)
      const ks = []; for (const d of [D28, '2026-12-29', D30]) ks.push((await boxOf(w, ids.Vandal, d)).map(x => x.text).join('+') || 'none')
      let bAfter = null
      if (r.open) { await L.press(w, T('sel-cancel')); await P.waitForTimeout(500); bAfter = await H.bubbleNow(P) }
      const shown = bAfter || bWhile
      rec('S12 a range with a day outside his stint (posted out from 29 Dec; OD 28–30 Dec)', size, 'RECORD', `posting "${po.line}" closed=${!po.stillOpen}; window ${r.open ? 'STAYED open with note "' + noteText + '"' : 'closed'}; cells 28/29/30 Dec: ${JSON.stringify(ks)}; bubble while open: ${H.bubbleLine(bWhile)}; after ✕: ${bAfter ? H.bubbleLine(bAfter) : 'n/a'}. RIGHT (if a day is skipped): the window stays with its note, no bubble, ✕ then the bubble naming the filing: "${shown.text}"`, [`s12-${size}-od-stint-after-tap.png`, openPic])
      if (r.open && bAfter) judge('S12 skipped day: ✕ then the bubble with the filing’s word', size, [['no bubble while the window is open', bWhile.where === 'none', H.bubbleLine(bWhile)], ...redConds(bAfter, 'This overseas duty turns Available P red.')], 'after ✕', [])
      await H.dismissBubble(w)
    }
  })
  rec(`errors-d`, size, w.errs.length ? 'FAIL' : 'PASS', w.errs.length ? w.errs.slice(0, 6).join(' || ') : 'none (console, page, 4xx)')
  await w.ctx.close()
}
await L.closeBrowser()
H.saveResults(`d-${SIZES.join('-')}${ONLY ? '-' + [...ONLY].join('') : ''}`)
const R = H.results, c = r => R.filter(x => x.verdict === r).length
console.log('DONE', R.length, 'records:', c('PASS'), 'PASS', c('FAIL'), 'FAIL', c('RECORD'), 'RECORD', c('NOT DONE'), 'NOT DONE')
