/* b3-02b — ITEM 6 (D98), the two-day request, both shapes the app can make (a request lands ONE row, on the day it is
   accepted onto; its filing is one value for every day it covers):
     A. filed Mon–Tue on two published days → it lands on Monday (its first day); Tuesday carries only the filing.
        Load Monday's AL1: what does TUESDAY read before and after (head, pending list, its Personal Inputs row)?
     B. the same request taken off Monday and accepted onto TUESDAY instead (the request's own buttons on the board).
        Load Monday's AL1: Tuesday must not change, the filing must stay, and the message must say it was left as filed.
   Walker B3, 25 Sep 26. Usage (from raptor-port/): node scripts/handpass/am/b3-02b-twoday.mjs */
process.env.HP_SHOTS = process.env.HP_REWALK || 'C:/Users/User/projects/Raptor/raptor-port/docs/img/handpass/2026-09-25-amendment-batch/b3'   // HP_REWALK: the re-walk's own folder, so the first walk's pictures stay
const L = await import('./w2-lib.mjs')
const W4 = await import('./w4-lib.mjs')
const { openHi, editWeek, board, closeBoard, openInputs, head, check, note, summary, installToasts, takeToasts, lookAt, pvBar, pvTap, clip, screen, STATE, DESK, RESULTS } = L
const { fileInput } = W4
import { writeFileSync } from 'node:fs'

const inp = (page, rem) => page.evaluate(r => {
  const x = window.INPUTS.find(y => y.remarks === r); if (!x) return null
  const id = x.iid || x.id
  return { iid: id, acc: x.acc || 'fresh', rows: window.DAYS.map((d, i) => (d.ground || []).some(g => g && g.src === id) ? i : -1).filter(i => i >= 0) }
}, rem)
const dig = (page, di) => page.evaluate(i => JSON.stringify(window.DAYS[i]), di)
async function pendList(page, di) {
  const b = page.locator(`#eWeek .day[data-day="${di}"] .dpendbtn:visible`).first()
  if (!(await b.count())) return 'NO PENDING BUTTON'
  await b.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await b.click(); await page.waitForTimeout(500)
  const t = await page.evaluate(() => { const m = document.querySelector('.pendlist'); return m ? m.innerText.replace(/\s+/g, ' ').trim() : 'NO LIST' })
  return t
}
async function closePend(page) { await page.keyboard.press('Escape'); await page.waitForTimeout(250) }
async function reqRowOnBoard(page, di, iid) {
  await board(page, di); await openInputs(page, di)
  const t = await page.evaluate(id => { const b = document.querySelector(`#schedBoard [data-acck="${id}"]`); const row = b && (b.closest('.sb-arow, .sbi-row') || b.parentElement); return row ? row.innerText.replace(/\s+/g, ' ').trim().slice(0, 140) : 'NO ROW' }, iid)
  return t
}
async function loadMonAL1(page) {
  await lookAt(page, 0, /AL1/)
  await pvTap(page, 0, 'data-restore')
  const bar = await pvBar(page, 0)
  if (bar && /confirm/.test(bar.load || '')) await pvTap(page, 0, 'data-restore')
  return { confirm: bar && bar.load, toasts: await takeToasts(page) }
}

for (const shape of ['A', 'B']) {
  console.log(`\n##### two-day request, shape ${shape} #####`)
  const { browser, page, errors } = await openHi({ ...DESK, state: STATE, dpr: 1 })
  await installToasts(page); await editWeek(page)
  const talId = await page.evaluate(() => Object.keys(window.PEOPLE).find(k => window.PEOPLE[k].cs === 'Talisman'))
  const REM = 'B3 TWODAY ' + shape
  await fileInput(page, { person: talId, type: 'Other', from: '2026-07-13', to: '2026-07-14', span: 'all', remarks: REM })
  await takeToasts(page); await editWeek(page)
  let y = await inp(page, REM)
  note(`${shape}.0 filed Mon–Tue`, JSON.stringify({ y, mon: (await head(page, 0)).pending, tue: (await head(page, 1)).pending }))
  if (shape === 'B') {
    /* take it off Monday, accept it onto Tuesday — through the request's own buttons on each day's board */
    await board(page, 0); await openInputs(page, 0)
    const x = page.locator(`#schedBoard [data-acc="x"][data-acck="${y.iid}"]:visible`).first()
    if (await x.count()) { await x.click(); await page.waitForTimeout(600) }
    await board(page, 1); await openInputs(page, 1)
    const g = page.locator(`#schedBoard [data-acc="g"][data-acck="${y.iid}"]:visible`).first()
    const gl = (await g.count()) ? (await g.innerText()).trim() : 'NO → GROUND ON TUE'
    if (await g.count()) { await g.click(); await page.waitForTimeout(600) }
    await closeBoard(page); await editWeek(page); await takeToasts(page)
    y = await inp(page, REM)
    check('B.1 fixture: the two-day request now stands on TUESDAY\'s programme (taken off Mon, "' + gl + '" on Tue)', y.acc === 'g' && y.rows.join() === '1', JSON.stringify(y))
  }
  const tue0 = await dig(page, 1), h1a = await head(page, 1)
  const tueList0 = h1a.pending ? await pendList(page, 1) : '(nothing pending)'
  if (h1a.pending) { await clip(page, `d-L4${shape}-tue-before-mon-load`, `#eWeek .day[data-day="1"] .day-head`, { pad: 6, extraH: 40 }); await screen(page, `d-L4${shape}-tue-pendlist-before`); await closePend(page) }
  const row0 = await reqRowOnBoard(page, 1, y.iid)
  const warn0 = await page.evaluate(() => (document.querySelector('#sbWarn') || {}).innerText || '')
  await screen(page, `d-L4${shape}-tue-board-before-mon-load`); await closeBoard(page); await editWeek(page)
  note(`${shape}.2 Tuesday BEFORE loading Monday`, JSON.stringify({ tag: h1a.tag, pend: h1a.pending, list: tueList0.slice(0, 220), requestRow: row0 }))
  const acc0 = y.acc
  const r = await loadMonAL1(page)
  y = await inp(page, REM)
  const tue1 = await dig(page, 1), h1b = await head(page, 1), h0b = await head(page, 0)
  const row1 = await reqRowOnBoard(page, 1, y.iid)
  const warn1 = await page.evaluate(() => (document.querySelector('#sbWarn') || {}).innerText || '')
  await screen(page, `d-L4${shape}-tue-board-after-mon-load`); await closeBoard(page); await editWeek(page)
  const w0 = /Talisman/.test(warn0), w1 = /Talisman/.test(warn1)
  check(`${shape}.3 loading Monday raises no NEW warning on Tuesday (Talisman's request)`, w1 === w0, JSON.stringify({ before: w0, after: w1, line: (warn1.split(/\r?\n/).find(l => /Talisman/.test(l)) || '') }))
  note(`${shape}.3 loaded Monday AL1`, JSON.stringify({ r, y, mon: h0b.pending, tue: h1b.pending, requestRow: row1 }))
  check(`${shape}.3 loading Monday leaves Tuesday's CONTENT as it was`, tue1 === tue0, '')
  check(`${shape}.3 loading Monday leaves what Tuesday READS as it was (its pending count)`, h1b.pending === h1a.pending, JSON.stringify([h1a.pending, h1b.pending]))
  check(`${shape}.3 loading Monday leaves the request's filing (and so its row on Tuesday's Personal Inputs) as it was`, y.acc === acc0 && row1 === row0, JSON.stringify({ acc: [acc0, y.acc], row: [row0, row1] }))
  check(`${shape}.3 the load's message says the request was left as filed`, r.toasts.some(t => /request also covers another day — left as filed/.test(t)), JSON.stringify(r.toasts))
  await clip(page, `d-L4${shape}-mon-after-load`, `#eWeek .day[data-day="0"] .day-head`, { pad: 6, extraH: 40 })
  check(`${shape}: no browser errors`, errors.length === 0, errors.join(' | ').slice(0, 300))
  await browser.close()
}
const f = summary('b3-02b-twoday')
writeFileSync('C:/Users/User/AppData/Local/Temp/claude/C--Users-User-projects-Raptor/7d4383dd-dbce-43e3-9712-03047ba69337/scratchpad/b3-02b.json', JSON.stringify(RESULTS, null, 1))
process.exitCode = f ? 1 : 0
