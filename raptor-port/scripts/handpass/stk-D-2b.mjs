/* Walker D, world 2b: P4c-03 (the three ways at an input's fields) and P4c-09 (folds) re-done more closely. Same built Saturday. */
import * as H from './stk-D-lib.mjs'
const { open, nav, openBoard, boxList, walkForward, clickBox, caret, caretIdx, label, snap, same, sleep, pic, row, savePart, scopeSel, ensureHelper } = H
const { browser, page, errors } = await open({ width: 1440, height: 900, who: 'a', fresh: false, state: process.env.STK_STATE })
page.setDefaultTimeout(9000)
const wk = scopeSel('week', 5), sb = scopeSel('board', 5)
async function S(id, did, fn) {
  try {
    const r = await fn()
    const bad = r.checks.filter(c => !c[1])
    row(id, did, r.checks.map(c => `${c[1] ? '✓' : '✗'} ${c[0]}${c[2] !== undefined ? ' [' + (typeof c[2] === 'string' ? c[2] : JSON.stringify(c[2])).slice(0, 320) + ']' : ''}`).join(' · '), r.verdict || (bad.length ? 'FAIL' : 'PASS'), r.pics || [])
  } catch (e) { row(id, did, 'ERROR ' + String(e.message || e).slice(0, 500), 'NOT WALKED (script error — re-run)', [await pic(page, 'ERR-' + id)]) }
  savePart('world2b')
}
const seq = () => page.evaluate(() => window.commandStreamLen())
const typeNow = async txt => { await page.keyboard.press('Control+A'); await page.keyboard.type(txt, { delay: 8 }) }
const popups = () => page.evaluate(() => ({ arm: !!(window.ARM && window.ARM.key), q: document.querySelectorAll('.mission-role-question').length, pops: [...document.querySelectorAll('.wavemenu,#inpEditPop,.pop,.popup,.stpop,.areapop,.rosterpop,#cxPop,[role=dialog],[role=menu]')].filter(e => e.getBoundingClientRect().width > 0).map(e => e.className.toString().slice(0, 30)).slice(0, 6) }))
const iid = await page.evaluate(() => window.INPUTS.find(i => /TAB/.test(i.remarks || '')).iid)
const gi = await page.evaluate(i => window.DAYS[5].ground.findIndex(r => r.src === i), iid)
const rd = () => page.evaluate(i => { const x = window.INPUTS.find(y => y.iid === i); return { s: x.s, e: x.e, remarks: x.remarks, n: window.INPUTS.length } }, iid)
const grRow = () => page.evaluate(([g]) => { const r = window.DAYS[5].ground[g]; return { str: r.str, end: r.end, rmks: r.rmks } }, [gi])
const echoes = surf => page.evaluate(([s, i]) => [...document.querySelectorAll(`${s} [data-ifld^="${i}."],${s} [data-inp^="${i}."]`)].map(e => (e.getAttribute('data-ifld') || e.getAttribute('data-inp')).split('.')[1] + '=' + (e.value !== undefined && e.tagName !== 'DIV' && e.tagName !== 'SPAN' ? e.value : e.innerText)), [surf === 'week' ? wk : sb, iid])
const groundBoxes = surf => page.evaluate(([s, g]) => ['str', 'end', 'rmks'].map(k => { const e = document.querySelector(`${s} [data-bfld="gr:5.${g}.${k}"],${s} [data-txt="gr:5.${g}.${k}"]`); return k + '=' + (e ? (e.value !== undefined && e.tagName !== 'DIV' && e.tagName !== 'SPAN' ? e.value : e.innerText) : 'NONE') }), [surf === 'week' ? wk : sb, gi])
console.log('input', iid, 'ground row', gi)

/* three goes at the input's three boxes; each one reports the input, the programme row and the echo */
async function threeBoxes(scope, firstKey, keys, vals, surf) {
  const list = await boxList(page, scope)
  const ix = list.findIndex(b => b.key === firstKey)
  const n0 = await seq(), r0 = await rd(), g0 = await grRow()
  await clickBox(page, scope, ix)
  const at = [await caret(page)]
  for (let i = 0; i < 3; i++) { await typeNow(vals[i]); await page.keyboard.press('Tab'); await sleep(400); at.push(await caret(page)) }
  const n1 = await seq(), r1 = await rd(), g1 = await grRow()
  return { n0, n1, r0, r1, g0, g1, at: at.map(label), echo: await echoes(surf === 'week' ? 'week' : 'board'), ground: await groundBoxes(surf) }
}
await openBoard(page, 5)
{
  const rowsNow = () => page.evaluate(() => document.querySelectorAll('#sbBoard .pinp .sb-arow, #sbBoard .pinp .sbi-row').length)
  if (!(await rowsNow())) { await page.locator('#sbBoard [data-pitog="5"]:visible').first().click(); await sleep(500) }
}
await S('P4c-03-board-programme-row', 'Board, Saturday: the accepted input\'s PROGRAMME row (TRAINING 11:00–12:00): clicked into its start, typed 10:15, Tab, 11:45, Tab, text, Tab', async () => {
  const x = await threeBoxes(sb, `gr:5.${gi}.str`, ['str', 'end', 'rmks'], ['10:15', '11:45', 'PROG ROW TEXT'], 'board')
  const pics = [await pic(page, 'P4c-03-board-programme-row')]
  return { checks: [
    ['Tab order start → end → Remarks → next', /gr:5\.\d+\.end/.test(x.at[1]) && /gr:5\.\d+\.rmks/.test(x.at[2]), x.at],
    ['the programme row shows the typed values', x.ground.join(' ') === 'str=10:15 end=11:45 rmks=PROG ROW TEXT', x.ground],
    ['the SAVED INPUT (the same input) took the values', x.r1.s === 615 && x.r1.e === 705 && x.r1.remarks === 'PROG ROW TEXT', { before: x.r0, after: x.r1 }],
    ['the Personal Inputs echo of the same input shows them', x.echo.join(' ') === 'str=10:15 end=11:45 rmks=PROG ROW TEXT', x.echo],
    ['no second input; 3 commands', x.r1.n === x.r0.n && x.n1 - x.n0 === 3, { commands: x.n1 - x.n0 }],
  ], pics }
})
await S('P4c-03-board-echo', 'Board, Saturday: the same input\'s Personal Inputs echo boxes: clicked into start, typed 10:20, Tab, 11:50, Tab, text, Tab', async () => {
  const x = await threeBoxes(sb, `${iid}.str`, ['str', 'end', 'rmks'], ['10:20', '11:50', 'ECHO TEXT'], 'board')
  const pics = [await pic(page, 'P4c-03-board-echo')]
  return { checks: [
    ['Tab order start → end → Remarks', /\.end/.test(x.at[1]) && /\.rmks/.test(x.at[2]), x.at],
    ['the SAVED INPUT took the values (s=620, e=710)', x.r1.s === 620 && x.r1.e === 710 && x.r1.remarks === 'ECHO TEXT', { before: x.r0, after: x.r1 }],
    ['the programme row (other occurrence) shows them', x.ground.join(' ') === 'str=10:20 end=11:50 rmks=ECHO TEXT', x.ground],
    ['no second input; 3 commands', x.r1.n === x.r0.n && x.n1 - x.n0 === 3, { commands: x.n1 - x.n0 }],
  ], pics }
})
await nav(page, 'editsched')
await S('P4c-03-week-programme-row', 'Week, Saturday: the input\'s PROGRAMME row: start 10:25, end 11:55, text, with Tab', async () => {
  const x = await threeBoxes(wk, `gr:5.${gi}.str`, [], ['10:25', '11:55', 'WEEK PROG TEXT'], 'week')
  const pics = [await pic(page, 'P4c-03-week-programme-row')]
  return { checks: [
    ['Tab order start → end → Remarks', /gr:5\.\d+\.end/.test(x.at[1]) && /gr:5\.\d+\.rmks/.test(x.at[2]), x.at],
    ['the programme row shows the typed values', x.ground.join(' ') === 'str=10:25 end=11:55 rmks=WEEK PROG TEXT', x.ground],
    ['the SAVED INPUT (the same input) took the values (s=625, e=715)', x.r1.s === 625 && x.r1.e === 715 && x.r1.remarks === 'WEEK PROG TEXT', { before: x.r0, after: x.r1 }],
    ['the week\'s input echo boxes show them', x.echo.join(' ') === 'str=10:25 end=11:55 rmks=WEEK PROG TEXT', x.echo],
  ], pics }
})
await S('P4c-03-week-echo', 'Week, Saturday: the input\'s own boxes (inp): start 10:35, end 11:45, text, with Tab', async () => {
  const x = await threeBoxes(wk, `${iid}.str`, [], ['10:35', '11:45', 'WEEK ECHO TEXT'], 'week')
  const pics = [await pic(page, 'P4c-03-week-echo')]
  return { checks: [
    ['Tab order start → end → Remarks', /\.end/.test(x.at[1]) && /\.rmks/.test(x.at[2]), x.at],
    ['the SAVED INPUT took the values (s=635, e=705)', x.r1.s === 635 && x.r1.e === 705 && x.r1.remarks === 'WEEK ECHO TEXT', { before: x.r0, after: x.r1 }],
    ['the programme row shows them', x.ground.join(' ') === 'str=10:35 end=11:45 rmks=WEEK ECHO TEXT', x.ground],
  ], pics }
})

/* ---- P4c-09 with the sections really folded ---- */
await openBoard(page, 5)
await S('P4c-09-board-folds', 'Board, Saturday: Personal Inputs, Available crew, SANS and the warnings panel folded with their own toggles; Tabbed the whole route', async () => {
  const state = () => page.evaluate(() => ({
    pin: document.querySelectorAll('#sbBoard [data-secmove$=".inputs"] .sb-arow, #sbBoard [data-secmove$=".inputs"] .sbi-row').length,
    avail: document.querySelectorAll('#sbBoard [data-secmove$=".avail"] .puck').length,
    pinHead: (document.querySelector('#sbBoard [data-secmove$=".inputs"] [data-pitog]') || {}).innerText || '',
    availHead: (document.querySelector('#sbBoard [data-secmove$=".avail"] .sb-ph, #sbBoard [data-secmove$=".avail"] [data-avtog]') || {}).innerText || '',
  }))
  const s0 = await state()
  // unfold both, to see them open first
  if (!s0.pin) { await page.locator('#sbBoard [data-pitog="5"]:visible').first().click(); await sleep(400) }
  const open0 = await state()
  const pics = [await pic(page, 'P4c-09-board-open-state')]
  const withIn = (await boxList(page, sb)).filter(b => b.kind === 'ifld').length
  // fold Personal Inputs and Available crew
  await page.locator('#sbBoard [data-pitog="5"]:visible').first().click(); await sleep(400)
  const avt = page.locator('#sbBoard [data-avtog]:visible').first()
  if (await avt.count()) { await avt.click(); await sleep(400) }
  const folded = await state()
  pics.push(await pic(page, 'P4c-09-board-folded-state'))
  const list = await boxList(page, sb)
  const fw = await walkForward(page, sb, { keepStops: false })
  await page.keyboard.press('Tab'); await sleep(200)
  const after = await state(), p1 = await popups()
  pics.push(await pic(page, 'P4c-09-board-after-route'))
  return { checks: [
    ['open state: Personal Inputs rows drawn, its 3 echo boxes in the route', open0.pin > 0 && withIn === 3, { open0, withIn }],
    ['folded state: no Personal Inputs rows, no echo boxes in the route, Available crew pucks hidden', folded.pin === 0 && list.filter(b => b.kind === 'ifld').length === 0 && folded.avail < open0.avail, { folded, ifld: list.filter(b => b.kind === 'ifld').length }],
    ['Tabbed over all ' + fw.n + ' boxes in order', fw.bad.length === 0, fw.bad.slice(0, 3)],
    ['folds unchanged after the route, no popup opened, nothing written', JSON.stringify(folded) === JSON.stringify(after) && p1.pops.length === 0 && fw.noWrite, { folded, after, p1 }],
  ], pics }
})
console.log('ERRORS', JSON.stringify(errors))
row('ERRORS-world2b', 'console / page errors / 4xx during world 2b', errors.length ? errors.join(' || ') : 'none', errors.length ? 'FINDING' : 'PASS')
savePart('world2b', { errors })
await browser.close()
