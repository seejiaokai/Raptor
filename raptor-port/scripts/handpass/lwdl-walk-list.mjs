// lwdl-walk-list.mjs — walks the day's list's decide buttons: every transition, one row, rings whole, entries independent. From the lw-decide-look walk of 28 Nov 26 ([LW-DECIDE-LOOK], his D2881); run from raptor-port/.
// lw-decide-look walk — the day's list (two entries on one day): every transition, boxes across states, one row,
// rings whole, Delete armed beside a grey Refuse, independent entries, an OIL award unchanged; the list beside the window.
// Scenarios: Fable 3, 5b, 5c, 6, 7, 11 · Astra 3, 7.  ENV: PORT TAG ONLY SIZES
import { run, signIn, press, openCell, isOpen, closeWin, place, cellState, readDecide, pic, ringPixels, isCyan, T, sleep, closeBrowsers } from './lwdl-lib.mjs'
const DL = T('daylist')
const rowsOf = page => page.evaluate(() => [...document.querySelectorAll('[data-testid="daylist"] > li')].map(li => {
  const acts = li.querySelector('.dl-acts'); const bs = acts ? [...acts.querySelectorAll('button')].filter(b => b.getBoundingClientRect().width > 0) : []
  return { key: li.dataset.testid, text: (li.querySelector('.dl-main')?.innerText || li.innerText).replace(/\s+/g, ' ').slice(0, 60),
    btns: bs.map(b => { const r = b.getBoundingClientRect(); return { tid: b.dataset.testid, t: b.innerText.replace(/\s+/g, ' ').trim(), cls: b.className, x: Math.round(r.left * 10) / 10, y: Math.round(r.top * 10) / 10, w: Math.round(r.width * 10) / 10, h: Math.round(r.height * 10) / 10 } }),
    tops: [...new Set(bs.map(b => Math.round(b.getBoundingClientRect().top)))] }
}))
const st = btns => { const a = btns.find(b => /dl-approve/.test(b.tid)), r = btns.find(b => /dl-refuse/.test(b.tid)); if (!a || !r) return 'none'; return /\blit\b/.test(a.cls) ? 'approved' : /\blit\b/.test(r.cls) ? 'refused' : 'waiting' }
async function tapIn(S, sel, label) {
  const page = S.page; const loc = page.locator(sel).first(); await loc.scrollIntoViewIfNeeded()
  if (S.touch) { const bb = await loc.boundingBox(); await page.touchscreen.tap(bb.x + bb.width / 2, bb.y + bb.height / 2); await sleep(page, 60); await pic(S, label + '-tap60ms', [DL]); await sleep(page, 900) }
  else { await loc.click(); await sleep(page, 700) }
}

await run('LIST', ['desk', 'p402', 'p390'], async S => {
  const page = S.page
  await signIn(S)
  /* Ace 19 Jan: an FO award and a refused OL bid */
  const P = 'dj', D = '2026-01-19'
  S.note('cell ' + await cellState(page, P, D))
  await openCell(S, P, D, 'daylist')
  let rows = await rowsOf(page)
  S.note('list rows: ' + JSON.stringify(rows.map(r => [r.key, r.text, r.btns.map(b => b.t + (/(lit|dec-off)/.test(b.cls) ? '[' + b.cls.match(/lit|dec-off/)[0] + ']' : ''))])))
  const bidRow = () => rows.find(r => r.btns.some(b => /dl-approve/.test(b.tid)))
  const award0 = rows.find(r => !r.btns.some(b => /dl-approve/.test(b.tid)))
  S.check(!!bidRow(), 'the bid row carries Approve / Refuse', rows.map(r => r.key))
  const seq = [['refused', null], ['waiting', 'refuse'], ['approved', 'approve'], ['refused', 'refuse'], ['approved', 'approve'], ['waiting', 'approve']]
  const boxes = {}
  let k = 0
  for (const [want, pressWhat] of seq) {
    if (pressWhat) {
      const tid = bidRow().btns.find(b => b.tid.startsWith('dl-' + pressWhat)).tid
      await tapIn(S, T(tid), `${++k}-press-${pressWhat}`)
      if (!(await isOpen(page, 'daylist'))) { S.note('list closed after a press; reopening'); await openCell(S, P, D, 'daylist') }
      rows = await rowsOf(page)
    }
    const br = bidRow()
    S.check(st(br.btns) === want, `OL bid reads ${want}`, br.btns.map(b => b.t + ' ' + b.cls))
    S.check(br.tops.length === 1, `${want}: Approve, Refuse, Move, Delete on one row`, br.tops)
    const d = await readDecide(page, `[data-testid="${br.key}"]`)
    S.check(d.every(b => b.padL >= 2 && b.padR >= 2 && !b.clipped), `${want}: marks and words ≥2px inside the edge`, d.map(b => [b.words, b.padL, b.padR, b.clipped]))
    S.check(d.every(b => b.ringCut.length === 0), `${want}: the ring not cut by any container`, d.map(b => b.ringCut))
    const lit = d.find(b => /\blit\b/.test(b.cls))
    if (lit) {
      const rp = await ringPixels(S, T(lit.tid))
      S.check(['ringTop', 'ringBottom', 'ringLeft', 'ringRight'].every(x => isCyan(rp[x])), `${want}: ring painted cyan all round`, rp)
      const grey = d.find(b => b !== lit); S.check(/dec-off/.test(grey.cls) && grey.mark?.color === grey.color, `${want}: the other grey with its mark`, [grey.cls, grey.mark?.color, grey.color])
    }
    boxes[want] = boxes[want] || br.btns.map(b => [b.tid.replace(/-[\w-]+$/, ''), b.x, b.y, b.w, b.h])
    S.note(`${want} boxes ${JSON.stringify(br.btns.map(b => [b.t, b.x, b.y, b.w, b.h]))}`)
    const aw = rows.find(r => r.key === award0?.key)
    if (award0) S.check(JSON.stringify(aw?.text) === JSON.stringify(award0.text), 'the FO award line unchanged', [award0.text, aw?.text])
    S.note('grid cell ' + await cellState(page, P, D))
    await pic(S, `${k}-${want}`, [DL])
  }
  S.data.boxes = boxes
  const keyed = Object.entries(boxes).map(([s, b]) => [s, JSON.stringify(b.map(x => x.slice(1)))])
  S.check(new Set(keyed.map(x => x[1])).size === 1, 'every button keeps its box across waiting / approved / refused', Object.fromEntries(keyed))
  /* arm Delete without confirming; Refuse grey beside it stays told apart */
  rows = await rowsOf(page)
  const delTid = bidRow().btns.find(b => /del|clear/.test(b.tid) || b.t === 'Delete')?.tid
  if (delTid) {
    await press(S, T(delTid)); await sleep(page, 400)
    rows = await rowsOf(page)
    S.note('after one Delete press: list open=' + await isOpen(page, 'daylist') + ' bid row ' + JSON.stringify(bidRow()?.btns.map(b => [b.t, b.cls])) + ' cell ' + await cellState(page, 'dj', '2026-01-19'))
    await pic(S, 'Z-delete-armed', [DL])
    await page.keyboard.press('Escape').catch(() => {}); await sleep(page, 300)
  } else S.note('no Delete in the bid row: ' + JSON.stringify(bidRow().btns.map(b => b.tid)))
  await closeWin(S)

  /* Cutter? no — Outlaw 5 Feb: an approved LL and an HO on one day (approved leave rows) */
  const P2 = 'casper', D2 = '2026-02-05'
  await openCell(S, P2, D2, 'daylist')
  rows = await rowsOf(page)
  S.note('casper list: ' + JSON.stringify(rows.map(r => [r.key, r.text, r.btns.map(b => b.t + ' ' + b.cls.replace(/dchip|dec/g, '').trim())])))
  const llRow = () => rows.find(r => /LL/.test(r.text) && r.btns.some(b => /dl-approve/.test(b.tid))) || rows.find(r => r.btns.some(b => /dl-approve/.test(b.tid)))
  if (llRow()) {
    const other0 = rows.filter(r => r !== llRow()).map(r => r.text + '|' + r.btns.map(b => b.t).join(','))
    S.check(st(llRow().btns) === 'approved', 'approved LL reads Approved', llRow().btns.map(b => b.t))
    await pic(S, 'L1-approved-leave', [DL])
    await tapIn(S, T(llRow().btns.find(b => /dl-refuse/.test(b.tid)).tid), 'L2-grey-refuse')
    if (!(await isOpen(page, 'daylist'))) await openCell(S, P2, D2, 'daylist')
    rows = await rowsOf(page)
    S.note('after grey Refuse on the approved LL: ' + JSON.stringify(rows.map(r => [r.text, r.btns.map(b => b.t + ' ' + b.cls.replace(/dchip|dec/g, '').trim())])) + ' cell ' + await cellState(page, P2, D2))
    S.check(llRow() && st(llRow().btns) === 'refused', 'one press on grey Refuse refuses the approved leave', llRow()?.btns.map(b => b.t))
    S.check(rows.filter(r => r !== llRow()).map(r => r.text + '|' + r.btns.map(b => b.t).join(',')).join() === other0.join(), 'the other entry on the day unchanged', [other0, rows.filter(r => r !== llRow()).map(r => r.text)])
    await pic(S, 'L3-refused', [DL])
    if (llRow()) { await tapIn(S, T(llRow().btns.find(b => /dl-approve/.test(b.tid)).tid), 'L4-grey-approve'); if (!(await isOpen(page, 'daylist'))) await openCell(S, P2, D2, 'daylist'); rows = await rowsOf(page)
      S.check(llRow() && st(llRow().btns) === 'approved', 'grey Approve: approved again in one press', llRow()?.btns.map(b => b.t)); await pic(S, 'L5-approved-again', [DL]) }
    const undoOver = await page.evaluate(() => { const b = document.getElementById('undoBtn'); const r = b.getBoundingClientRect(); const h = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return h === b || b.contains(h) ? 'pressable' : 'covered by ' + (h?.className || h?.tagName) })
    S.note('top-bar Undo with the day list open: ' + undoOver)
    await closeWin(S)
    await page.locator('#undoBtn').click({ timeout: 4000 }).catch(e => S.note('undo: ' + e.message.split('\n')[0])); await sleep(page, 700)
    if (!(await isOpen(page, 'daylist'))) await openCell(S, P2, D2, 'daylist')
    rows = await rowsOf(page)
    S.note('after one Undo: ' + JSON.stringify(rows.map(r => [r.text, r.btns.map(b => b.t + ' ' + b.cls.replace(/dchip|dec/g, '').trim())])) + ' cell ' + await cellState(page, P2, D2))
    S.check(llRow() && st(llRow().btns) === 'refused', 'one Undo: the list follows (refused again, nothing stale ringed)', llRow()?.btns.map(b => b.t + ' ' + b.cls))
    await pic(S, 'L6-after-undo', [DL])
  } else S.note('no decide row on Outlaw 5 Feb')
  await closeWin(S)
})

/* the same entry in the window and in the day's list: one look (Fable 11); main compared separately */
await run('LOOK', ['p402', 'p390', 'desk'], async S => {
  const page = S.page
  await signIn(S)
  // window: Drifter 17 Feb refused
  await place(page, 'slipway', ['2026-02-17'], 'LL')
  await openCell(S, 'slipway', '2026-02-17'); await press(S, T('decide-refuse')); await sleep(page, 700)
  if (!(await isOpen(page))) await openCell(S, 'slipway', '2026-02-17')
  const w = await readDecide(page, T('bid-picker'))
  await pic(S, 'W-refused-window', [T('bid-actions')], { pad: 10 })
  await closeWin(S)
  await openCell(S, 'dj', '2026-01-19', 'daylist')
  const l = await readDecide(page, T('daylist'))
  await pic(S, 'L-refused-list', ['[data-testid="daylist"] .dl-acts'], { pad: 10 })
  const pick = d => d.map(b => ({ t: b.words, h: b.h, w: b.w, fs: b.fontSize, mark: b.mark?.w, ring: b.outline, col: b.color, bg: b.bg, edge: b.edge }))
  S.data.window = pick(w); S.data.list = pick(l)
  S.note('window: ' + JSON.stringify(pick(w)))
  S.note('list:   ' + JSON.stringify(pick(l)))
  const same = (a, b) => a.h === b.h && a.fs === b.fs && a.mark === b.mark && a.ring === b.ring && a.col === b.col && a.bg === b.bg && a.edge === b.edge
  S.check(same(pick(w)[0], pick(l)[0]) && same(pick(w)[1], pick(l)[1]), 'window and list: one height, letter, mark, ring, grey and fill (widths may differ by layout)', { w: pick(w), l: pick(l) })
})
await closeBrowsers()
