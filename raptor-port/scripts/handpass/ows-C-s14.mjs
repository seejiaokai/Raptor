/* walker C — S14 (member request edit + Logic edit stay separate) and S15 (a member deletes an earning request), two worlds.
   Fixture: Ranger (M) flies VIPER 12:00–13:00 with IN TIME 10:00 and has a Duty request 06:00–06:30 (Inputs page, OIL confirmed): 06:00–15:00, 540, FO. Published. */
import * as C from './ows-C-lib.mjs'
const { S, L, W, LW, RC, world, judge, row, pic, sleep, SAT } = C
const MODE = process.env.OWS_MODE || 'S14'
const di = C.SATI, M = 'bane'

async function fixture(p) {
  await C.expiryForever(p)
  const dutyType = await p.evaluate(() => 'Duty')
  const filed = await RC.fileInput(p, { person: M, type: 'Duty', di, allday: false, from: '06:00', to: '06:30', remarks: 'walker C duty request' })
  await L.go(p, 'editsched'); await sleep(400)
  const w = await C.flyWave(p, di, { cs: 'VIPER', to: '12:00', ld: '13:00', p1: M })
  const its = await C.inTime(p, di, w.wi, 'IN TIME 10:00')
  const pub = await C.pubOrig(p, di)
  return { filed, w, its, pub }
}
async function memberEdit(p, iid, { from, to, del }) {
  await C.reloadAs(p, 'm'); await sleep(500)
  await L.go(p, 'inputs'); await sleep(800)
  /* the page looks ahead from today by default: widen it through its own date-range button to All dates */
  await p.locator('#inRangeBtn').click(); await sleep(400)
  const all = p.locator('button:visible, [role=option]:visible, li:visible', { hasText: /^All dates$/ }).first()
  if (await all.count()) { await all.click(); await sleep(600) }
  const before = await p.evaluate(i => { const t = document.querySelector(`#inBody tr[data-iid="${i}"]`); return t ? t.innerText.replace(/\s+/g, ' ').trim() : 'NO ROW' }, iid)
  const out = { before, asked: [] }
  if (del) {
    const x = p.locator(`#inBody tr[data-iid="${iid}"] .rmx, #inBody tr[data-iid="${iid}"] [data-del], #inBody tr[data-iid="${iid}"] [title*="Delete"], #inBody tr[data-iid="${iid}"] [title*="Remove"]`).first()
    out.delBtn = await x.count() ? await x.evaluate(e => e.outerHTML.slice(0, 120)) : 'NONE'
    if (await x.count()) { await x.click(); await sleep(700) }
    for (let k = 0; k < 3; k++) { const conf = p.locator('button:visible', { hasText: /^(Delete|Yes|Remove|Confirm)/ }).first(); if (await conf.count()) { out.asked.push(await conf.innerText()); await conf.click(); await sleep(600) } else break }
  } else {
    await p.locator(`#inBody tr[data-iid="${iid}"] [data-edit]`).first().click(); await sleep(500)
    await p.locator('#inBody tr.ined [data-ed="stime"]').fill(from); await p.locator('#inBody tr.ined [data-ed="stime"]').blur()
    await p.locator('#inBody tr.ined [data-ed="etime"]').fill(to); await p.locator('#inBody tr.ined [data-ed="etime"]').blur()
    await p.locator('#inBody tr.ined [data-save]').click(); await sleep(800)
    for (let k = 0; k < 3; k++) {
      const conf = p.locator('[data-testid="oilconf"]:visible')
      if (await conf.count()) { out.asked.push('oil'); await conf.locator('button').filter({ hasText: /^Yes/ }).first().click().catch(() => {}); await conf.getByRole('button', { name: 'Save', exact: true }).click().catch(() => {}); await sleep(600) } else break
    }
  }
  out.after = await p.evaluate(i => { const t = document.querySelector(`#inBody tr[data-iid="${i}"]`); return t ? t.innerText.replace(/\s+/g, ' ').trim() : '(row gone)' }, iid)
  out.pic = await pic(p, MODE + '-member-inputs')
  return out
}

const { browser, p, errors } = await world()
const fx = await fixture(p)
const o1 = await C.oilOf(p, M, SAT, MODE + '-1')
console.log('FX', JSON.stringify({ filed: fx.filed, got: fx.w.got, its: fx.its, tag: fx.pub.head.tag })); console.log('O1', C.say(o1))
judge(MODE + '.a', 'Inputs page (admin): Ranger, type Duty, Sat 18 Jul 06:00–06:30, OIL confirmed Yes; board: VIPER 12:00–13:00, Ranger, IN TIME 10:00; four signed, published', [
  ['request filed and OIL asked/confirmed', !!fx.filed.iid && fx.filed.asked.includes('oil'), fx.filed],
  ['published ORIG', fx.pub.head.tag === 'ORIG', fx.pub.head.tag],
  ['FO, worked 06:00–06:30, 10:00–15:00', o1.letters === 'FO' && /06:00.06:30/.test(o1.row) && /10:00.15:00/.test(o1.row), { cell: o1.cell.text, row: o1.row.slice(0, 200), bal: o1.bal }],
], o1.pics)

if (MODE === 'S14') {
  const me = await memberEdit(p, fx.filed.iid, { from: '07:00', to: '07:30' })
  console.log('ME', JSON.stringify(me))
  await C.reloadAs(p, 'a'); await sleep(500)
  const o2 = await C.oilOf(p, M, SAT, 'S14-2')
  const d2 = await C.dayState(p, di, 'S14-2')
  console.log('O2', C.say(o2, d2))
  judge('S14.b', 'signed in as the member (us / Ranger): Inputs → the row\'s pencil → start 07:00, end 07:30 → ✓; then back as admin', [
    ['the row now reads 07:00–07:30', /07:00.*07:30/.test(me.after), me],
    ['paid holds: FO, worked 06:00–06:30, 10:00–15:00', o2.letters === 'FO' && /06:00.06:30/.test(o2.row) && /10:00.15:00/.test(o2.row), { cell: o2.cell.text, row: o2.row.slice(0, 200), bal: o2.bal }],
    ['the day reads pending (the request change)', C.pendOf(d2.head) !== '0', d2.head.pending],
  ], [me.pic, ...o2.pics, ...d2.pics])
  row('S14.list1', 'To go out list after the member\'s edit, before any Logic change', `chip "${d2.head.pending}" signs [${d2.head.signs.join('|')}] · list "${d2.list.slice(0, 600)}"`, 'RECORDED', d2.pics)
  await S.logicSet(p, 'debrief', '2h30')
  const o3 = await C.oilOf(p, M, SAT, 'S14-3')
  const d3 = await C.dayState(p, di, 'S14-3')
  console.log('O3', C.say(o3, d3))
  judge('S14.c', 'as admin: Logic → Flight debrief after land 2h → 2h30', [
    ['paid still FO 06:00–06:30, 10:00–15:00', o3.letters === 'FO' && /06:00.06:30/.test(o3.row) && /10:00.15:00/.test(o3.row) && !/15:30/.test(o3.row), { row: o3.row.slice(0, 200), bal: o3.bal }],
    ['the To go out list carries BOTH the Logic OIL line (Flight debrief 2h → 2h30) and the request change as separate lines', /Flight debrief/i.test(d3.list) && /OIL on this day/.test(d3.list) && (/request|input|Duty|Ranger/i.test(d3.list.replace(/OIL on this day.*Ranger · OIL/, ''))), d3.list.slice(0, 700)],
    ['candidate for Ranger: 07:00–07:30, 10:00–15:30 full day named in the Logic line', /07:00.07:30, 10:00.15:30/.test(d3.list), d3.list.slice(0, 700)],
    ['the four sign-offs are empty', d3.signsEmpty, d3.head.signs],
  ], [...o3.pics, ...d3.pics])
  const am = await C.pubAL(p, di)
  const o4 = await C.oilOf(p, M, SAT, 'S14-4')
  const d4 = await C.dayState(p, di, 'S14-4')
  console.log('O4', C.say(o4, d4))
  judge('S14.d', 'sign again and Publish AL', [
    ['AL1', /AL\s*1/.test(am.head.tag), am.head.tag],
    ['FO once, worked 07:00–07:30, 10:00–15:30, balance unchanged', o4.letters === 'FO' && /07:00.07:30/.test(o4.row) && /10:00.15:30/.test(o4.row) && o4.bal === o1.bal && (o4.row.match(/AUTO/g) || []).length === 1, { row: o4.row.slice(0, 200), bal: o4.bal, was: o1.bal }],
    ['nothing pending', C.pendOf(d4.head) === '0', d4.head.pending],
  ], [...o4.pics, ...d4.pics])
} else {
  /* S15: the member deletes the request */
  const me = await memberEdit(p, fx.filed.iid, { del: true })
  console.log('ME', JSON.stringify(me))
  /* the supported history path: the member's own Undo, in the same session, takes the deletion back */
  const un0 = await p.evaluate(() => { const u = document.querySelector('#undoBtn'); return u ? (u.title || '') + (u.disabled ? ' (off)' : '') : 'none' })
  const ur = await W.door(p, 'top', 'undo')
  await sleep(500)
  const restored = await p.evaluate(i => { const t = document.querySelector(`#inBody tr[data-iid="${i}"]`); return t ? t.innerText.replace(/\s+/g, ' ').trim() : '(row gone)' }, fx.filed.iid)
  const restPic = await pic(p, 'S15-2-member-undo')
  row('S15.undo', 'still signed in as the member: the top bar Undo after the deletion', `Undo button "${un0}" → pressed ${JSON.stringify(ur)} → the row now reads: ${restored}`, /gone/.test(restored) ? 'FAIL' : 'PASS', [restPic])
  if (!/gone/.test(restored)) { await memberEdit(p, fx.filed.iid, { del: true }) }
  await C.reloadAs(p, 'a'); await sleep(500)
  const o2 = await C.oilOf(p, M, SAT, 'S15-2')
  const d2 = await C.dayState(p, di, 'S15-2')
  console.log('O2', C.say(o2, d2))
  judge('S15.b', 'signed in as the member: Inputs → delete the request row; then back as admin', [
    ['the row is gone for the member', /gone/.test(me.after), me],
    ['paid holds: FO, worked 06:00–06:30, 10:00–15:00, balance as before', o2.letters === 'FO' && /06:00.06:30/.test(o2.row) && /10:00.15:00/.test(o2.row) && o2.bal === o1.bal, { cell: o2.cell.text, row: o2.row.slice(0, 200), bal: o2.bal }],
    ['the day reads pending, with a traceable To go out line', C.pendOf(d2.head) !== '0' && d2.list.length > 0, { chip: d2.head.pending, list: d2.list.slice(0, 500) }],
  ], [me.pic, ...o2.pics, ...d2.pics])
  await S.toBoard(p, di); await p.locator('#sbOil').click(); await sleep(800)
  const cand = await p.evaluate(m => [...document.querySelectorAll('#schedBoard .puck[data-person="' + m + '"]')].filter(e => e.offsetParent !== null && !e.closest('#sbRoster')).map(e => e.innerText.replace(/\s+/g, ' ').trim()), M)
  const candPic = await pic(p, 'S15-2-candidate-oilmode')
  await p.locator('#sbOil').click().catch(() => {}); await sleep(400); await S.closeBoard(p)
  row('S15.candfig', 'the working copy in OIL Earn mode after the deletion: Ranger\'s figure (the candidate)', JSON.stringify(cand), 'RECORDED', [candPic])
  row('S15.cand', 'the To go out list after the deletion (what the candidate would pay)', `chip "${d2.head.pending}" · list "${d2.list.slice(0, 700)}"`, 'RECORDED', d2.pics)
  /* Undo the deletion in the member's own session */
  await C.reloadAs(p, 'm'); await sleep(500)
  const topU = await p.evaluate(() => { const u = document.querySelector('#undoBtn'); return u ? (u.title || '') + (u.disabled ? ' (off)' : '') : 'none' })
  await L.go(p, 'inputs'); await sleep(600)
  const topU2 = await p.evaluate(() => { const u = document.querySelector('#undoBtn'); return u ? (u.title || '') + (u.disabled ? ' (off)' : '') : 'none' })
  row('S15.undo-after-signin', 'signed in as the member AGAIN (new session) — is there an Undo for the deletion?', `top bar Undo: "${topU}" / on the Inputs page "${topU2}"`, 'RECORDED', [await pic(p, 'S15-3-member-resession')])
}
await C.finish(browser, errors, 'ows-C-' + MODE.toLowerCase())
