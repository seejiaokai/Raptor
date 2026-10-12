// K8 - a reload at every stage: an add from the schedule, ALL AVAIL added, a swap, a cancel, a (row) X - reload after each.
import * as K from './or-K-lib.mjs'
const { fileInput, goWeek, goBoard, shot, shotEl, readRows, inputsOf, reload, saveRes, errs, drag, rowLoc, rosterPuck, csId, toast, toastMark, toastsSince } = K
const out = {}
const { ctx, page: p } = await K.openWorld({ fresh: false })
await K.hideToast(p)
const A = 'Range brief', B = 'Solo drill'
const fa = await fileInput(p, { type: 'Meeting', people: ['Drifter', 'Hunter', 'Ranger'], from: '2026-07-15', to: '2026-07-15', timed: ['14:00', '15:00'], title: A })
const fb = await fileInput(p, { type: 'Training', person: 'Ranger', from: '2026-07-16', to: '2026-07-16', timed: ['10:00', '11:00'], title: B })
console.log('filed', JSON.stringify(fa), JSON.stringify(fb))
const idA = fa[0].iid, idB = fb[0].iid
const WED = 2, THU = 3
const ri = (di, id) => p.evaluate(([di, id]) => (window.DAYS[di].ground || []).findIndex(g => g.src === id), [di, id])
/* read everything as it stands: week + board for both inputs, + INPUTS */
async function readAll(label, { pic = false } = {}) {
  const res = { label }
  await goWeek(p)
  for (const di of [WED, THU]) { const f = p.locator(`#eWeek .day:not(.peek) [data-pitog="${di}"]`).first(); const o = await p.evaluate(di => document.querySelectorAll('#eWeek .day:not(.peek)')[di].querySelectorAll('.sec-inp .pl-row').length, di); if (!o && await f.count()) { await f.evaluate(e => e.scrollIntoView({ block: 'center' })); await f.click(); await p.waitForTimeout(400) } }
  const w = await p.evaluate(([A, B]) => {
    const rd = (di, t) => { const d = [...document.querySelectorAll('#eWeek .day:not(.peek)')][di]; const pick = sel => [...d.querySelectorAll(sel)].filter(r => (r.querySelector('.nm .ntx')?.textContent || '').trim().toLowerCase() === t.toLowerCase()).map(r => ({ who: [...r.querySelectorAll('.ppl .puck')].map(k => (k.querySelector('.nm')?.textContent || k.textContent).trim()), cx: /CX/.test(r.querySelector('.nm')?.textContent || '') ? r.querySelector('.cxtag')?.textContent : null })); return { ground: pick('.sec-grnd .pl-row'), line: pick('.sec-inp .pl-row'), lineText: [...d.querySelectorAll('.sec-inp .pl-row')].filter(r => (r.querySelector('.nm .ntx')?.textContent || '').trim().toLowerCase() === t.toLowerCase()).map(r => r.innerText.replace(/\s+/g, ' ').trim().slice(0, 120)) } }
    return { A: rd(2, A), B: rd(3, B) }
  }, [A, B])
  res.week = w
  if (pic) {
    await K.hideToast(p)
    for (const di of [WED, THU]) for (const sec of ['ground', 'inputs']) {
      const loc = p.locator(`#eWeek .day:not(.peek) [data-secmove="${di}.${sec}"]`).first()
      if (await loc.count()) { await K.scrollToSec(p, sec, di).catch(() => {}); await p.waitForTimeout(200); await shotEl(loc, `k8-${label.replace(/\W+/g, '-')}-week-${di === WED ? 'wed' : 'thu'}-${sec}`) }
    }
  }
  const bd = {}
  for (const [di, t, k] of [[WED, A, 'A'], [THU, B, 'B']]) {
    await goBoard(p, di); await K.openFold(p, 'board', di)
    const r = await readRows(p, t)
    const lineAll = await p.evaluate(() => [...document.querySelectorAll('#schedBoard .pinp .sb-arow')].map(r => r.innerText.replace(/\s+/g, ' ').trim().slice(0, 140)))
    bd[k] = { ground: r.boardGround.map(x => x.who), line: r.boardInputs.map(x => x.who), lineAll }
    if (pic) { await K.hideToast(p); await shot(p, `k8-${label.replace(/\W+/g, '-')}-board-${k}`) }
  }
  res.board = bd
  res.inputs = { A: await inputsOf(p, A), B: await inputsOf(p, B) }
  await goWeek(p)
  return res
}
const steps = []
const step = async (label, doIt) => {
  const mk = await toastMark(p)
  await doIt()
  const note = await toastsSince(p, mk)
  const before = await readAll(label + ' (before reload)', { pic: false })
  await reload(p); await goWeek(p)
  const after = await readAll(label + ' (after reload)', { pic: true })
  const same = JSON.stringify({ w: before.week, b: before.board, i: before.inputs }) === JSON.stringify({ w: after.week, b: after.board, i: after.inputs })
  console.log('\n=== ' + label + ' | note: ' + note + ' | same after reload: ' + same)
  console.log(' A week ground', JSON.stringify(after.week.A.ground.map(x => x.who)), 'line', JSON.stringify(after.week.A.lineText), '| board', JSON.stringify(after.board.A.ground), JSON.stringify(after.board.A.line))
  console.log(' B week ground', JSON.stringify(after.week.B.ground.map(x => x.who)), 'line', JSON.stringify(after.week.B.lineText), '| board', JSON.stringify(after.board.B.ground), JSON.stringify(after.board.B.line), 'boardLines', JSON.stringify(after.board.B.lineAll))
  console.log(' INPUTS A', JSON.stringify(after.inputs.A.map(r => ({ p: r.people, s: r.s, e: r.e, k: r.keys }))), 'B', JSON.stringify(after.inputs.B.map(r => ({ p: r.people, k: r.keys }))))
  steps.push({ label, note, same, before, after })
  out[label] = { note, same, before, after }
}
// 1. an add from the schedule: Tally dragged from the crew list onto the Meeting row's "+ add"
await step('1 add Tally', async () => {
  await goWeek(p); await K.openFold(p, 'week'); await K.scrollToSec(p, 'ground', WED); await p.waitForTimeout(300)
  const row = await rowLoc(p, 'weekG', A)
  await drag(p, await rosterPuck(p, 'Tally'), row.locator('.addz').first())
})
// 2. ALL AVAIL added: the crew list's ALL AVAIL puck onto the same row
await step('2 ALL AVAIL added', async () => {
  await goWeek(p); await K.openFold(p, 'week'); await K.scrollToSec(p, 'ground', WED); await p.waitForTimeout(300)
  const row = await rowLoc(p, 'weekG', A)
  const ph = p.locator('#eRoster').getByText('ALL AVAIL', { exact: true }).first()
  await drag(p, ph, row.locator('.addz').first())
})
// 3. a swap: Tally dragged from the crew list ONTO the lone puck of the Training on Thursday
await step('3 swap Tally for Ranger', async () => {
  await goWeek(p); await K.openFold(p, 'week'); await K.scrollToSec(p, 'ground', THU); await p.waitForTimeout(300)
  const row = await rowLoc(p, 'weekG', B)
  const rid = await csId(p, 'Ranger')
  await drag(p, await rosterPuck(p, 'Tally'), row.locator(`.ppl .puck[data-person="${rid}"]`).first())
})
// 4. a cancel: the board's CX on the Meeting's row, reason WX
await step('4 cancel (CX WX)', async () => {
  const r = await ri(WED, idA)
  await goBoard(p, WED)
  const cx = p.locator(`#schedBoard [data-grcx="${WED}.${r}"]`).first()
  await cx.scrollIntoViewIfNeeded(); await cx.click()
  await p.waitForSelector('#cxSave', { timeout: 4000 })
  const q = p.locator('#cxQuick [data-cxq="WX"]').first()
  if (await q.count()) await q.click(); else await p.locator('#cxReason').fill('WX')
  await p.waitForTimeout(200); await p.locator('#cxSave').click(); await p.waitForTimeout(600)
})
// 5. the row's X on the Training (Thursday)
await step('5 row X (off the programme)', async () => {
  const r = await ri(THU, idB)
  await goBoard(p, THU)
  const x = p.locator(`#schedBoard [data-grdel="${THU}.${r}"]`).first()
  console.log('X button count', await p.locator(`#schedBoard [data-grdel="${THU}.${r}"]`).count())
  await x.scrollIntoViewIfNeeded(); await x.click(); await p.waitForTimeout(700)
  const c = await p.evaluate(() => [...document.querySelectorAll('button')].filter(b => b.offsetParent && /^(yes|remove|delete|take off|confirm|ok)/i.test(b.textContent.trim())).map(b => b.textContent.trim()))
  console.log('confirm buttons after X:', JSON.stringify(c))
})
out.errs = errs.slice(); saveRes('k8', out); console.log('ERRS', JSON.stringify(errs))
await ctx.close(); await K.browser.close()
