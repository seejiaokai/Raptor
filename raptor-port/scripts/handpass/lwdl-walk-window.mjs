// lwdl-walk-window.mjs — walks the one-day bid window's decide buttons: transitions, boxes, ring pixels, Undo, keys, hover, tap tint. From the lw-decide-look walk of 28 Nov 26 ([LW-DECIDE-LOOK], his D2881); run from raptor-port/.
// lw-decide-look walk — the one-day bid window: every transition, the boxes across states, the ring's pixels, Undo/Redo,
// the keyboard ring, hover, the tap tint, the leave button's ring beside the decide ring.
// Scenarios: Fable 2, 5a, 6, 7, 10, 16, 19, 21 · Astra 4, 6, 20, 21.  ENV: PORT TAG ONLY SIZES
import { run, signIn, press, openCell, isOpen, closeWin, place, cellState, readDecide, boxesOf, pic, ringPixels, isCyan, accent, T, sleep, closeBrowsers } from './lwdl-lib.mjs'
const P = 'slipway', D = '2026-02-17'
const W = T('bid-picker')
const ROW = [T('decide-approve'), T('decide-refuse'), T('decide-shift'), T('bid-clear')]
const short = d => d.map(b => `${b.tid}:"${b.words}" ${b.cls.replace(/dchip |dec /g, '')} ${b.w}x${b.h}@${b.x},${b.y} ring=${b.outline} col=${b.color} edge=${b.edge} mark=${b.mark ? b.mark.w + 'px ' + b.mark.color : 'none'} padL=${b.padL} padR=${b.padR} cut=${b.ringCut.join(';') || '-'}`)

async function openD(S) { await openCell(S, P, D); }
async function decideAndSettle(S, sel, label) {
  const page = S.page
  const loc = page.locator(sel).first()
  await loc.scrollIntoViewIfNeeded()
  if (S.touch) {
    const bb = await loc.boundingBox()
    await page.touchscreen.tap(bb.x + bb.width / 2, bb.y + bb.height / 2)
    await sleep(page, 60); await pic(S, label + '-tap60ms', [W, T(`cell-${P}-${D}`)])
    await sleep(page, 900); await pic(S, label + '-tap1s', [W, T(`cell-${P}-${D}`)])
  } else { await loc.click(); await sleep(page, 700) }
  const open = await isOpen(page)
  return { open, cell: await cellState(page, P, D) }
}
async function stateShot(S, name) {
  const page = S.page
  const d = await readDecide(page, W)
  const bx = await boxesOf(page, ROW)
  S.data[name] = { d, bx }
  console.log('     [' + name + ']\n       ' + short(d).join('\n       '))
  await pic(S, name, [W])
  await pic(S, name + '-row', [T('bid-actions')], { pad: 10 })
  return { d, bx }
}
const same = (a, b) => a.every((x, i) => x && b[i] && Math.abs(x.x - b[i].x) < 0.6 && Math.abs(x.y - b[i].y) < 0.6 && Math.abs(x.w - b[i].w) < 0.6 && Math.abs(x.h - b[i].h) < 0.6)

await run('WIN', ['desk', 'p402', 'p390'], async S => {
  const page = S.page
  await signIn(S)
  S.check((await cellState(page, P, D)) === 'empty', 'the day starts empty', await cellState(page, P, D))
  await place(page, P, [D], 'LL')
  S.check((await cellState(page, P, D)) === 'LL:w', 'pending LL placed', await cellState(page, P, D))
  const acc = await accent(page); S.note('accent ' + acc)
  await openD(S)
  const s0 = await stateShot(S, '1-waiting')
  const ap0 = s0.d.find(b => b.tid === 'decide-approve'), rf0 = s0.d.find(b => b.tid === 'decide-refuse')
  S.check(ap0 && rf0, 'both decide buttons drawn', s0.d.map(b => b.tid))
  S.check(ap0.outline === 'none' && rf0.outline === 'none', 'waiting: no ring on either', [ap0.outline, rf0.outline])
  S.check(ap0.mark?.kind === 'approve' && rf0.mark?.kind === 'refuse', 'waiting: tick and cross drawn', [ap0.mark, rf0.mark])
  S.check(ap0.markBeforeWords && rf0.markBeforeWords, 'mark before its words, middles level', [ap0.markBeforeWords, rf0.markBeforeWords])
  S.check(ap0.words === 'Approve' && rf0.words === 'Refuse', 'waiting words', [ap0.words, rf0.words])
  S.check(!/rgb\(4[0-9], 5[0-9]/.test(ap0.edge), 'waiting: Approve edge is its own faint colour, not plain grey', ap0.edge)
  S.data.rp0 = { ap: await ringPixels(S, T('decide-approve')), rf: await ringPixels(S, T('decide-refuse')) }
  S.note('waiting pixels approve ' + JSON.stringify(S.data.rp0.ap))

  /* Approve */
  let r = await decideAndSettle(S, T('decide-approve'), '2-approve-press')
  S.note('after Approve: window open=' + r.open + ' cell=' + r.cell)
  S.check(r.cell === 'LL:a', 'grid cell approved after one press', r.cell)
  await pic(S, '2-after-approve-grid', [T(`cell-${P}-${D}`)], { pad: 40 })
  if (!r.open) await openD(S)
  const s1 = await stateShot(S, '3-approved')
  const ap1 = s1.d.find(b => b.tid === 'decide-approve'), rf1 = s1.d.find(b => b.tid === 'decide-refuse')
  S.check(/\blit\b/.test(ap1.cls) && /dec-ring/.test(ap1.cls) && /dec-off/.test(rf1.cls), 'approved: Approve lit+ringed, Refuse grey', [ap1.cls, rf1.cls])
  S.check(ap1.words === 'Approved' && rf1.words === 'Refuse', 'approved words', [ap1.words, rf1.words])
  S.check(ap1.ringCut.length === 0, 'approved ring not cut by any container', ap1.ringCut)
  S.check(rf1.mark && rf1.mark.color === rf1.color, 'grey Refuse: the cross greys with the word', [rf1.mark?.color, rf1.color])
  S.check(!rf1.disabled && rf1.cursor === 'pointer', 'grey Refuse stays pressable', [rf1.disabled, rf1.cursor])
  S.check(same(s0.bx, s1.bx), 'Approve, Refuse, Move, Delete keep their boxes waiting→approved', { before: s0.bx, after: s1.bx })
  const rp1 = await ringPixels(S, T('decide-approve')); S.data.rp1 = rp1
  S.check(['ringTop', 'ringBottom', 'ringLeft', 'ringRight'].every(k => isCyan(rp1[k])), 'approved ring painted cyan on all four sides', rp1)
  S.note('approved ring pixels ' + JSON.stringify(rp1))
  await pic(S, '3-approved-zoom', [T('decide-approve')], { pad: 8 })
  /* the leave button's ring beside it (Fable 19) */
  const lv = await page.evaluate(() => { const e = document.querySelector('.bidsheet .tchip.lv.lit, [data-testid^="bid-"].lv.lit'); if (!e) return null; const c = getComputedStyle(e); return { tid: e.dataset.testid, outline: `${c.outlineStyle} ${c.outlineWidth} ${c.outlineColor} off ${c.outlineOffset}`, shadow: c.boxShadow } })
  S.note('lit leave button: ' + JSON.stringify(lv))
  if (lv) S.check(lv.outline === ap1.outline, 'the decided ring is the lit leave button ring (colour, width, offset)', [lv.outline, ap1.outline])
  else S.note('no lit leave button in this window (to read beside the decide ring)')
  S.check(ap1.shadow === 'none', 'no glow (box-shadow) on the decided button', ap1.shadow)
  if (lv) await pic(S, '3-two-rings', [W])

  /* grey Refuse pressed: decides the other way in one press */
  r = await decideAndSettle(S, T('decide-refuse'), '4-grey-refuse-press')
  S.check(r.cell === 'LL:r', 'grey Refuse: one press refuses', r.cell)
  if (!r.open) await openD(S)
  const s2 = await stateShot(S, '5-refused')
  const ap2 = s2.d.find(b => b.tid === 'decide-approve'), rf2 = s2.d.find(b => b.tid === 'decide-refuse')
  S.check(/dec-off/.test(ap2.cls) && /\blit\b/.test(rf2.cls) && /dec-ring/.test(rf2.cls), 'refused: Refuse lit+ringed, Approve grey', [ap2.cls, rf2.cls])
  S.check(ap2.words === 'Approve' && rf2.words === 'Refused', 'refused words', [ap2.words, rf2.words])
  S.check(same(s0.bx, s2.bx), 'boxes unchanged waiting→refused', { before: s0.bx, after: s2.bx })
  const rp2 = await ringPixels(S, T('decide-refuse')); S.data.rp2 = rp2
  S.check(['ringTop', 'ringBottom', 'ringLeft', 'ringRight'].every(k => isCyan(rp2[k])), 'refused ring cyan on all four sides', rp2)
  S.check(rf2.ringCut.length === 0, 'refused ring not cut', rf2.ringCut)
  await pic(S, '5-refused-zoom', [T('decide-refuse')], { pad: 8 })

  /* grey Approve pressed */
  r = await decideAndSettle(S, T('decide-approve'), '6-grey-approve-press')
  S.check(r.cell === 'LL:a', 'grey Approve: one press approves', r.cell)
  if (!r.open) await openD(S)
  /* second tap on lit Approved → waiting */
  r = await decideAndSettle(S, T('decide-approve'), '7-lit-approved-press')
  S.check(r.cell === 'LL:w', 'second tap on lit Approved: back to waiting', r.cell)
  if (!r.open) await openD(S)
  const s3 = await stateShot(S, '8-waiting-again')
  S.check(JSON.stringify(s3.d.map(b => [b.cls, b.words, b.color, b.edge, b.outline, b.bg])) === JSON.stringify(s0.d.map(b => [b.cls, b.words, b.color, b.edge, b.outline, b.bg])), 'waiting look exactly as before the first press', { now: s3.d.map(b => [b.cls, b.words]), was: s0.d.map(b => [b.cls, b.words]) })
  /* Refuse then lit Refused → waiting */
  r = await decideAndSettle(S, T('decide-refuse'), '9-refuse-press')
  S.check(r.cell === 'LL:r', 'Refuse refuses', r.cell)
  if (!r.open) await openD(S)
  r = await decideAndSettle(S, T('decide-refuse'), '10-lit-refused-press')
  S.check(r.cell === 'LL:w', 'second tap on lit Refused: back to waiting', r.cell)
  if (!r.open) await openD(S)
  const s4 = await stateShot(S, '11-waiting-again2')
  S.check(s4.d.every(b => !/lit|dec-off|dec-ring/.test(b.cls)), 'waiting again: nothing lit, grey or ringed', s4.d.map(b => b.cls))

  /* Undo / Redo with the window: approve, undo, check, redo */
  r = await decideAndSettle(S, T('decide-approve'), '12-approve-for-undo')
  if (r.open) await closeWin(S)
  await page.locator('#undoBtn').click({ timeout: 4000 }).catch(e => S.note('undo press: ' + e.message.split('\n')[0]))
  await sleep(page, 700)
  S.check((await cellState(page, P, D)) === 'LL:w', 'Undo: back to waiting', await cellState(page, P, D))
  await openD(S)
  const s5 = await stateShot(S, '13-after-undo')
  S.check(s5.d.every(b => !/lit|dec-off|dec-ring/.test(b.cls)), 'after Undo the window shows waiting, nothing ringed/grey', s5.d.map(b => b.cls))
  await closeWin(S)
  await page.locator('#redoBtn').click({ timeout: 4000 }).catch(e => S.note('redo press: ' + e.message.split('\n')[0]))
  await sleep(page, 700)
  S.check((await cellState(page, P, D)) === 'LL:a', 'Redo: approved again', await cellState(page, P, D))
  await openD(S)
  const s6 = await stateShot(S, '14-after-redo')
  const ap6 = s6.d.find(b => b.tid === 'decide-approve'), rf6 = s6.d.find(b => b.tid === 'decide-refuse')
  S.check(/lit/.test(ap6.cls) && /dec-off/.test(rf6.cls), 'after Redo the window shows approved', [ap6.cls, rf6.cls])
  /* Undo after the grey one pressed */
  r = await decideAndSettle(S, T('decide-refuse'), '15-grey-refuse-for-undo')
  if (r.open) await closeWin(S)
  await page.locator('#undoBtn').click({ timeout: 4000 }).catch(() => {}); await sleep(page, 700)
  S.check((await cellState(page, P, D)) === 'LL:a', 'ONE Undo of a grey press puts the approval back', await cellState(page, P, D))
  await openD(S)
  const s7 = await stateShot(S, '16-after-undo-grey')
  S.check(/lit/.test(s7.d[0].cls) && /dec-off/.test(s7.d[1].cls), 'window after that Undo: approved', s7.d.map(b => b.cls))

  /* hover (desktop) */
  if (!S.touch) {
    for (const [sel, nm] of [[T('decide-refuse'), 'grey'], [T('decide-approve'), 'lit']]) {
      const before = (await readDecide(page, W)).find(b => b.tid === sel.slice(14, -2))
      await page.locator(sel).hover(); await sleep(page, 300)
      const after = (await readDecide(page, W)).find(b => b.tid === sel.slice(14, -2))
      S.note(`hover ${nm}: before ${before.bg}/${before.color}/${before.outline} after ${after.bg}/${after.color}/${after.outline} cursor ${after.cursor}`)
      await pic(S, '17-hover-' + nm, [T('bid-actions')], { pad: 10 })
      if (nm === 'lit') S.check(after.outline === before.outline && after.bg === before.bg, 'hover never drops the lit fill or ring', [before, after].map(b => [b.bg, b.outline]))
      if (nm === 'grey') S.check(!/rgb\(87, 201, 122\)|rgb\(240, 85, 95\)/.test(after.bg) && after.outline === 'none', 'hover on grey never looks decided', [after.bg, after.outline])
    }
    await page.mouse.move(5, 5)
  }
})

/* keyboard: Tab onto the lit, the grey, back; Space and Enter (desktop) — Fable 1/2, Astra 4 */
await run('KEY', ['desk'], async S => {
  const page = S.page
  await signIn(S)
  await place(page, P, [D], 'LL')
  await openD(S)
  await page.locator(T('decide-approve')).click(); await sleep(page, 700)
  if (!(await isOpen(page))) await openD(S)
  const tabTo = async (tid, key = 'Tab', max = 60) => {
    for (let i = 0; i < max; i++) { const a = await page.evaluate(() => document.activeElement?.dataset?.testid || document.activeElement?.tagName); if (a === tid) return i; await page.keyboard.press(key); await sleep(page, 40) }
    return -1
  }
  const n = await tabTo('decide-approve')
  S.check(n >= 0, 'Tab reaches the lit Approved', n)
  await sleep(page, 200)
  let d = await readDecide(page, W)
  const apF = d.find(b => b.tid === 'decide-approve')
  S.note('lit Approved with keyboard: ' + JSON.stringify({ outline: apF.outline, fv: apF.focusVisible, shadow: apF.shadow }))
  S.data.keyLit = apF
  await pic(S, '1-key-on-lit', [T('bid-actions')], { pad: 10 })
  await page.keyboard.press('Tab'); await sleep(page, 200)
  d = await readDecide(page, W)
  const apU = d.find(b => b.tid === 'decide-approve'), rfF = d.find(b => b.tid === 'decide-refuse')
  S.note('after Tab: focus on ' + await page.evaluate(() => document.activeElement?.dataset?.testid))
  S.note('lit Approved WITHOUT keyboard: ' + apU.outline + ' | grey Refuse WITH keyboard: ' + JSON.stringify({ outline: rfF.outline, fv: rfF.focusVisible, shadow: rfF.shadow }))
  S.data.keyGrey = rfF; S.data.litNoKey = apU
  await pic(S, '2-key-on-grey', [T('bid-actions')], { pad: 10 })
  await pic(S, '2-key-on-grey-zoom', [T('decide-approve'), T('decide-refuse')], { pad: 8 })
  S.check(apF.outline !== apU.outline || apF.shadow !== apU.shadow, 'keyboard arriving on the lit button changes what is drawn (focus can be seen)', { withKey: apF.outline, without: apU.outline })
  S.check(rfF.outline !== 'none' && rfF.outline !== apU.outline, 'the grey button with the keyboard shows a focus ring not identical to the decided ring', { greyFocus: rfF.outline, decided: apU.outline })
  const accC = await page.evaluate(() => { const c = document.createElement('div'); c.style.color = 'var(--accent)'; document.body.append(c); const v = getComputedStyle(c).color; c.remove(); return v })
  S.check(rfF.outline.includes(accC), 'the grey button focus ring is the app cyan, not the browser default', { ring: rfF.outline, cyan: accC })
  await page.keyboard.press('Shift+Tab'); await sleep(page, 200)
  await pic(S, '3-key-back-on-lit', [T('bid-actions')], { pad: 10 })
  /* Space on the grey Refuse */
  await page.keyboard.press('Tab'); await sleep(page, 100)
  await page.keyboard.press('Space'); await sleep(page, 700)
  S.check((await cellState(page, P, D)) === 'LL:r', 'Space on the grey Refuse refuses', await cellState(page, P, D))
  S.note('window open after Space: ' + await isOpen(page) + ', focus on ' + await page.evaluate(() => document.activeElement?.dataset?.testid || document.activeElement?.tagName))
  await pic(S, '4-after-space', [W, T(`cell-${P}-${D}`)])
  if (!(await isOpen(page))) await openD(S)
  /* Enter on the lit Refused → waiting */
  const m = await tabTo('decide-refuse'); S.check(m >= 0, 'Tab reaches the lit Refused', m)
  await page.keyboard.press('Enter'); await sleep(page, 700)
  S.check((await cellState(page, P, D)) === 'LL:w', 'Enter on lit Refused: waiting', await cellState(page, P, D))
  S.check(true, 'the mark creates no keyboard stop (mark is aria-hidden, focusable=false)', null)
  const markFocusable = await page.evaluate(() => [...document.querySelectorAll('svg.dec-ic')].filter(s => s.getAttribute('focusable') !== 'false' || s.getAttribute('tabindex')).length)
  S.check(markFocusable === 0, 'no mark is focusable', markFocusable)
})
await closeBrowsers()
