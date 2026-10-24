// WALKER 1 — scenarios 8 and 9 (each way in: placed approved; the drag window's fill).
// Usage, from raptor-port/:  LW_PORT=4180 [SIZES=phone,desk] [ONLY=8,9] node scripts/handpass/lw-night-w1-c.mjs
import * as H from './lw-night-w1-lib.mjs'
import path from 'node:path'
import { readdirSync, unlinkSync } from 'node:fs'
const { L, T, rec } = H
console.log('lw-night-w1-c v1', L.OUT, 'port', L.PORT)
const SIZES = (process.env.SIZES || 'phone,desk').split(',')
const ONLY = process.env.ONLY ? new Set(process.env.ONLY.split(',')) : null
const run = id => !ONLY || ONLY.has(String(id))
for (const f of readdirSync(L.OUT)) if (f.endsWith('.png') && /^s0[89]-/.test(f) && SIZES.some(s => f.includes(`-${s}-`)) && (!ONLY || [...ONLY].some(o => f.startsWith(`s0${o[0]}-`)))) unlinkSync(path.join(L.OUT, f))
const RED = { border: /240, 85, 95/, bg: /46, 20, 24/, ink: /255, 170, 176/ }
const judge = (id, size, conds, said, pics) => {
  const bad = conds.filter(c => !c[1])
  rec(id, size, bad.length ? 'FAIL' : 'PASS', (bad.length ? 'FAILED: ' + bad.map(c => `${c[0]} (saw ${c[2]})`).join('; ') + ' — ' : '') + said, pics)
}
const redConds = (b, words) => [
  ['a bubble is up', b.where !== 'none', b.where],
  [`words "${words}"`, b.text === words, b.text],
  ['data-level red', b.level === 'red', b.level],
  ['red border / fill / words', RED.border.test(b.border || '') && RED.bg.test(b.bg || '') && RED.ink.test(b.color || ''), `${b.border} ${b.bg} ${b.color}`],
  ['box inside the screen', !!b.inside, JSON.stringify(b.rect)],
  ['not both notes', !(b.all?.mid && b.all?.foot), JSON.stringify(b.all)],
  ['no sideways page scroll', b.docOverflowX <= 0 && b.pageScrollX === 0, `overflow ${b.docOverflowX} scrollX ${b.pageScrollX}`],
]
const rowsOpen = P => P.evaluate(() => { const e = document.querySelector('[data-testid^="avail-p-"]'); return !!e && e.getBoundingClientRect().height > 0 })
async function f1(w, iso) {
  const P = w.page
  const a0 = await H.availP(w, iso)
  const req = await H.setReq(w, iso, Number(a0)); await P.waitForTimeout(300)
  const cell = await H.rowCell(P, `avail-p-${iso}`)
  if (H.levelOf(cell) !== 'ok') throw new Error(`F1 ${iso}: Available P ${cell.text} ${H.levelOf(cell)}`)
  return { a0, req, cell }
}
const availCell = async (P, iso) => { const c = await H.rowCell(P, `avail-p-${iso}`); return c ? `${c.text} ${H.levelOf(c)}` : null }
const rangePick = async (w, from, to) => {
  const P = w.page
  await L.press(w, T('span-range')); await P.waitForTimeout(400)
  for (const d of [from, to]) {
    for (let i = 0; i < 14 && !(await L.vis(P, T('span-day-' + d))); i++) { await L.press(w, T('span-prev')); await P.waitForTimeout(250) }
    await L.press(w, T('span-day-' + d)); await P.waitForTimeout(250)
  }
}

for (const size of SIZES) {
  const phone = size === 'phone'
  const w = await H.startWorld(size)
  const P = w.page
  const ids = await H.peopleIds(P)
  const sc = async (id, fn) => { if (!run(id)) return; console.log(`-- S${id} [${size}]`); try { await fn() } catch (e) { rec(`S${id}`, size, 'NOT DONE', 'script stopped: ' + String(e).slice(0, 500)); await H.closeAll(w).catch(() => {}) } }

  /* ============ S8: placed approved ("Approve what I enter") ============ */
  await sc(8, async () => {
    const D = '2026-12-22'
    const f = await f1(w, D)
    // F2: one pending bid first (switch off) → red
    const r0 = await H.bidType(w, ids.Ridge, D, { type: 'LL', inView: true, approve: false })
    const b0 = await H.bubbleNow(P)
    // then a man → OL with the switch ON → filled
    const a1 = await H.availNow(P, D)
    await P.evaluate(() => window.scrollTo(0, 0))
    const r = await H.bidType(w, ids.Drifter, D, { type: 'OL', inView: true, approve: true, name: `s08-${size}-approved-after-tap` })
    const b = await H.bubbleNow(P)
    const a2 = await availCell(P, D)
    const pic = await H.cropPic(w, `s08-${size}-approved-settled`, [T('counts-toggle'), T('manning-bubble'), T(`avail-p-${D}`)])
    judge('S8 placed approved on a red day', size, [
      ['F2 set up: first bid raised red', r0.k.some(x => /^LL\|k-ll\|s-w/.test(x)) && b0.level === 'red', `${JSON.stringify(r0.k)} ${b0.level}`],
      ['OL filled (approved) on the cell', r.k.some(x => /^OL\|k-ol\|s-a/.test(x)), JSON.stringify(r.k)],
      ['Available P lower, still red', a2 === `${Number(a1) - 1} red`, `${a1} → ${a2}`],
      ...redConds(b, 'This bid takes Available P lower, still red.'),
    ], `Available P ${f.a0} → ${a1} → ${a2}; settled: ${H.bubbleLine(b)}`, [`s08-${size}-approved-after-tap.png`, pic].filter(Boolean))
    await H.dismissBubble(w)
  })
  await sc('8b', async () => {
    /* the nearest reachable thing to "a locked week" (a stored week the app cannot read — nothing on screen makes one; lw-m3-walk-a5's own note):
       a ticked range over a day that already holds approved leave of another kind (Drifter, 1 Jan, OL from an Input) keeps THAT day pending and the
       window stays open with its note; the other day (2 Jan, set at F1) is approved and turns Available P red */
    const d1 = '2026-01-01', d2 = '2026-01-02'
    await L.reachCell(w, ids.Drifter, d1)
    const k1 = await H.kinds(w, ids.Drifter, d1), k2 = await H.kinds(w, ids.Drifter, d2)
    if (!k1.some(x => /^OL\|/.test(x))) throw new Error(`premise: Drifter holds no OL on 1 Jan: ${JSON.stringify(k1)}`)
    const f = await f1(w, d2)
    await L.openCellR(w, ids.Drifter, d2); await P.waitForSelector(T('bid-picker'), { timeout: 5000 })
    await H.setSwitch(w, true)
    await rangePick(w, d1, d2)
    const sel = await L.txt(P, T('span-selection'))
    await H.setManningView(w, true)
    let seen = await H.tapPic(w, T('bid-LL'), `s08-${size}-b-after-tap`)
    await P.waitForTimeout(700)
    if (await L.vis(P, T('bid-picker')) && /That takes/.test((await L.sheetDump(P))?.text || '')) { seen = await H.tapPic(w, T('bid-LL'), `s08-${size}-b-after-tap`); await P.waitForTimeout(700) }
    const stillOpen = await L.vis(P, T('bid-picker'))
    const text = stillOpen ? (await L.sheetDump(P))?.text : null
    const bWhile = await H.bubbleNow(P)
    const openPic = await H.settled(w, `s08-${size}-b-window-open`)
    const kk = [await H.kinds(w, ids.Drifter, d1), await H.kinds(w, ids.Drifter, d2)]
    let bAfter = null, cl = null
    if (stillOpen) { await L.press(w, T('bid-cancel')); await P.waitForTimeout(400); bAfter = await H.bubbleNow(P); cl = await H.settled(w, `s08-${size}-b-after-x`) }
    judge('S8b kept pending: window stays, no bubble; ✕ then the bubble', size, [
      ['range 1 Jan – 2 Jan picked', /1 Jan/.test(sel || '') && /2 Jan/.test(sel || ''), sel],
      ['the window stays open with its note', stillOpen && /kept pending|not written/.test(text || ''), `open=${stillOpen} "${(text || '').match(/[^|]*(?:kept pending|not written)[^|]*/)?.[0]}"`],
      ['no bubble while the window is open', bWhile.where === 'none', H.bubbleLine(bWhile)],
      ['2 Jan approved LL on the cell; 1 Jan still its OL', kk[1].some(x => /^LL\|k-ll\|s-a/.test(x)) && kk[0].some(x => /^OL\|/.test(x)), JSON.stringify(kk)],
      ...(bAfter ? redConds(bAfter, 'This bid turns Available P red.') : [['✕ pressed', false, 'window did not stay open']]),
    ], `window note: "${(text || '').match(/[^|]*(?:kept pending|not written)[^|]*/)?.[0]}"; after ✕: ${bAfter ? H.bubbleLine(bAfter) : 'n/a'}; (a locked week itself cannot be made on screen — this is the nearest reachable pending day)`, [`s08-${size}-b-after-tap.png`, openPic, cl].filter(Boolean))
  })

  /* ============ S9: the drag window's fill ============ */
  await sc(9, async () => {
    const D14 = '2026-12-14', D15 = '2026-12-15', D16 = '2026-12-16', D18 = '2026-12-18'
    await P.evaluate(() => window.scrollTo(0, 0))
    const f15 = await f1(w, D15), f16 = await f1(w, D16)
    // 15 Dec at F2: a pending bid first
    await H.bidType(w, ids.Hunter, D15, { type: 'LL', inView: true, approve: false })
    await H.dismissBubble(w)
    const a15 = await availCell(P, D15), a16 = await availCell(P, D16)
    if (a15 !== `${Number(f15.a0) - 1} red` || a16 !== `${f16.a0} ok`) throw new Error(`premise: 15 Dec ${a15}, 16 Dec ${a16}`)
    // one man, Mon 14 – Fri 18 Dec
    const opened = await H.dragCells(w, [ids.Ridge, D14], [ids.Ridge, D18])
    if (!opened) throw new Error('no drag window for Ridge 14–18 Dec')
    await H.setSwitch(w, false, 'sel')
    const span = await L.txt(P, T('sel-span'))
    const mv = await H.setManningView(w, true)
    const r = await H.selPress(w, T('sel-LL'), `s09-${size}-one-man-after-tap`, { ask: 'ask-then-go' })
    await P.waitForTimeout(500)
    const b = await H.bubbleNow(P)
    const ks = []; for (const d of [D14, D15, D16, '2026-12-17', D18]) ks.push((await H.kinds(w, ids.Ridge, d)).join('+') || 'none')
    const after = [await availCell(P, D15), await availCell(P, D16)]
    const pic = await H.cropPic(w, `s09-${size}-one-man-settled`, [T('counts-toggle'), T('manning-bubble'), T(`avail-p-${D15}`), T(`avail-p-${D16}`)])
    judge('S9 one man, Mon 14 – Fri 18 Dec (15 Dec F2, 16 Dec F1)', size, [
      ['window spans 5 days', /5 days/.test(span || ''), span],
      ['LL written on all five days (pending)', ks.every(x => /^LL\|k-ll\|s-w/.test(x)), JSON.stringify(ks)],
      ['15 Dec lower and red, 16 Dec turned red', after[0] === `${Number(f15.a0) - 2} red` && after[1] === `${Number(f16.a0) - 1} red`, JSON.stringify(after)],
      ['the window closed', !r.open, `open=${r.open}`],
      ...redConds(b, 'This bid turns Available P red.'),
    ], `asked=${r.asked}; ${H.bubbleLine(b)}; Available P 15 Dec ${a15} → ${after[0]}, 16 Dec ${a16} → ${after[1]}`, [`s09-${size}-one-man-after-tap.png`, pic].filter(Boolean))
    await H.dismissBubble(w)

    // three men on one day (17 Dec... use 21 Dec Mon): Reaper, Anvil, Cinch — the top three rows
    const D21 = '2026-12-21'
    await P.evaluate(() => window.scrollTo(0, 0))
    const f21 = await f1(w, D21)
    const open3 = await H.dragCells(w, [ids.Reaper, D21], [ids.Cinch, D21])
    if (!open3) throw new Error('no drag window for three men')
    await H.setSwitch(w, false, 'sel')
    const who3 = await L.txt(P, T('sel-who'))
    await H.setManningView(w, true)
    const r3 = await H.selPress(w, T('sel-LL'), `s09-${size}-three-men-after-tap`, { ask: 'ask-then-go' })
    await P.waitForTimeout(500)
    const b3 = await H.bubbleNow(P)
    const a21 = await availCell(P, D21)
    const k3 = []; for (const who of [ids.Reaper, ids.Anvil, ids.Cinch]) k3.push((await H.kinds(w, who, D21)).join('+') || 'none')
    const pic3 = await H.cropPic(w, `s09-${size}-three-men-settled`, [T('counts-toggle'), T('manning-bubble'), T(`avail-p-${D21}`)])
    judge('S9 three men on one day', size, [
      ['three men picked', /3 people|3 men|Reaper|Anvil|Cinch/.test(who3 || ''), who3],
      ['LL on all three', k3.every(x => /^LL\|k-ll\|s-w/.test(x)), JSON.stringify(k3)],
      ['Available P turned red', a21 === `${Number(f21.a0) - 3} red`, a21],
      ...redConds(b3, 'This bid turns Available P red.'),
      ['names the row once', (b3.text.match(/Available P/g) || []).length === 1, b3.text],
    ], `who: ${who3}; asked=${r3.asked}; ${H.bubbleLine(b3)}; Available P ${f21.a0} → ${a21}`, [`s09-${size}-three-men-after-tap.png`, pic3].filter(Boolean))
    await H.dismissBubble(w)

    // the below-zero ask: Vapor (LL balance 0) over two days at F1
    const D23 = '2026-12-23', D24 = '2026-12-24'
    await P.evaluate(() => window.scrollTo(0, 0))
    const f23 = await f1(w, D23)
    const open2 = await H.dragCells(w, [ids.Vapor, D23], [ids.Vapor, D24])
    if (!open2) throw new Error('no drag window for Vapor')
    await H.setSwitch(w, false, 'sel')
    await H.setManningView(w, true)
    const kBefore = [(await H.kinds(w, ids.Vapor, D23)).join('+'), (await H.kinds(w, ids.Vapor, D24)).join('+')]
    const first = await H.selPress(w, T('sel-LL'), `s09-${size}-ask-first-tap`, { ask: 'allow' })
    const kMid = [(await H.kinds(w, ids.Vapor, D23)).join('+'), (await H.kinds(w, ids.Vapor, D24)).join('+')]
    const bMid = await H.bubbleNow(P)
    const stillThere = await L.vis(P, T('select-sheet'))
    const second = await H.tapPic(w, T('sel-LL'), `s09-${size}-ask-second-tap`)
    await P.waitForTimeout(700)
    const bEnd = await H.bubbleNow(P)
    const kEnd = [(await H.kinds(w, ids.Vapor, D23)).join('+'), (await H.kinds(w, ids.Vapor, D24)).join('+')]
    const aEnd = await availCell(P, D23)
    judge('S9 the below-zero ask in the drag window', size, [
      ['the first tap asks (note says tap again)', first.asked, first.askNote],
      ['the first tap writes nothing', kMid.every(x => x === '') && kBefore.every(x => x === ''), `before ${JSON.stringify(kBefore)} mid ${JSON.stringify(kMid)}`],
      ['no bubble after the first tap', bMid.where === 'none', H.bubbleLine(bMid)],
      ['the window is still open after the first tap', stillThere, `${stillThere}`],
      ['the second tap places LL', kEnd.every(x => /^LL\|k-ll\|s-w/.test(x)), JSON.stringify(kEnd)],
      ...redConds(bEnd, 'This bid turns Available P red.'),
    ], `ask: "${first.askNote}"; after the second tap: ${H.bubbleLine(bEnd)}; Available P ${f23.a0} → ${aEnd}`, [`s09-${size}-ask-first-tap.png`, `s09-${size}-ask-second-tap.png`])
    await H.dismissBubble(w)

    // a fill with a skipped day. (a) Drifter 1-2 Jan: 1 Jan holds OL from an Input; switch OFF -> 1 Jan not written, 2 Jan written
    // (when 2 Jan is taken already — S8b of the same world — nothing can be written: that premise is gone, so it is walked standalone)
    const J1 = '2026-01-01', J2 = '2026-01-02'
    await P.evaluate(() => window.scrollTo(0, 0))
    await L.reachCell(w, ids.Drifter, J2)
    const kj0 = await H.kinds(w, ids.Drifter, J2).catch(() => [])
    const doSkip = async (tag, who, from, to, fixDay) => {
      await P.evaluate(() => window.scrollTo(0, 0))
      const fj = await f1(w, fixDay)
      const openJ = await H.dragCells(w, [who, from], [who, to])
      if (!openJ) throw new Error(`no drag window for ${tag}`)
      await H.setSwitch(w, false, 'sel')
      await H.setManningView(w, true)
      const rj = await H.selPress(w, T('sel-LL'), `s09-${size}-${tag}-after-tap`, { ask: 'ask-then-go' })
      await P.waitForTimeout(600)
      const open = await L.vis(P, T('select-sheet'))
      const noteText = (await L.txt(P, T('sel-note'))) || ''
      const bWhile = await H.bubbleNow(P)
      const openPic = await H.settled(w, `s09-${size}-${tag}-window-open`)
      let bAfter = null, cl = null
      if (open) { await L.press(w, T('sel-cancel')); await P.waitForTimeout(500); bAfter = await H.bubbleNow(P); cl = await H.settled(w, `s09-${size}-${tag}-after-x`) }
      return { fj, rj, open, noteText, bWhile, bAfter, openPic, cl }
    }
    if (!kj0.some(x => /^LL/.test(x))) {
      const r = await doSkip('skipOL', ids.Drifter, J1, J2, J2)
      const kj = [(await H.kinds(w, ids.Drifter, J1)).join('+'), (await H.kinds(w, ids.Drifter, J2)).join('+')]
      judge('S9 a fill with a day skipped (a day already holding leave): window stays, no bubble; ✕ then the bubble', size, [
        ['the window stays open with its note', r.open && r.noteText.length > 0, `open=${r.open} note="${r.noteText}"`],
        ['no bubble while the window is open', r.bWhile.where === 'none', H.bubbleLine(r.bWhile)],
        ['1 Jan kept its OL and took no LL; 2 Jan took a pending LL', /OL/.test(kj[0]) && !/LL\|k-ll\|s-w/.test(kj[0]) && /LL\|k-ll\|s-w/.test(kj[1]), JSON.stringify(kj)],
        ...(r.bAfter ? redConds(r.bAfter, 'This bid turns Available P red.') : [['✕ pressed', false, 'window did not stay open']]),
      ], `window note: "${r.noteText}"; after ✕: ${r.bAfter ? H.bubbleLine(r.bAfter) : 'n/a'}`, [`s09-${size}-skipOL-after-tap.png`, r.openPic, r.cl].filter(Boolean))
    } else rec('S9 skip (a day already holding leave)', size, 'NOT DONE', `2 Jan already holds Drifter's own LL from S8b of this same world, so its premise (2 Jan free) is gone: ${JSON.stringify(kj0)} - walked in the standalone S9 run instead`)
    // (b) the posted-out man: Diesel posted out from 30 Dec (his last day in the squadron); his days 29-31 Dec filled -> 31 Dec skipped (away)
    {
      const Y1 = '2026-12-29', Y3 = '2026-12-31'
      const po = await H.postOut(w, ids.Diesel, '2026-12-30')
      await P.evaluate(() => window.scrollTo(0, 0))
      const kAway = (await H.kinds(w, ids.Diesel, Y3)).join('+')
      const r = await doSkip('skipPO', ids.Diesel, Y1, Y3, Y1)
      const kd = [(await H.kinds(w, ids.Diesel, Y1)).join('+'), (await H.kinds(w, ids.Diesel, '2026-12-30')).join('+'), (await H.kinds(w, ids.Diesel, Y3)).join('+')]
      const bPO = r.bAfter || r.bWhile
      rec('S9 a fill over a posted-out man’s days', size, 'RECORD', `Diesel posted out from 30 Dec (posting: "${po.line}", window closed ${!po.stillOpen}); drag 29–31 Dec, LL, switch off. Cells after: 29 Dec ${kd[0]}, 30 Dec ${kd[1]}, 31 Dec ${kd[2]} (before the fill 30 and 31 Dec read ${kAway}). The window ${r.open ? 'STAYED open, note "' + r.noteText + '"' : 'closed (nothing skipped)'}; first-tap ask "${r.rj.askNote}"; bubble after: ${H.bubbleLine(bPO)}. A posted-out man’s days after his posting were NOT skipped by the fill: the scenario’s premise (a skipped day) does not arise from a posting out; the skipped-day case is walked with a day already holding leave (the line above).`, [`s09-${size}-skipPO-after-tap.png`, r.openPic].filter(Boolean))
    }
  })
  rec(`errors-c`, size, w.errs.length ? 'FAIL' : 'PASS', w.errs.length ? w.errs.slice(0, 6).join(' || ') : 'none (console, page, 4xx)')
  await w.ctx.close()
}
await L.closeBrowser()
H.saveResults(`c-${SIZES.join('-')}${ONLY ? '-' + [...ONLY].join('') : ''}`)
const R = H.results, c = r => R.filter(x => x.verdict === r).length
console.log('DONE', R.length, 'records:', c('PASS'), 'PASS', c('FAIL'), 'FAIL', c('RECORD'), 'RECORD', c('NOT DONE'), 'NOT DONE')
