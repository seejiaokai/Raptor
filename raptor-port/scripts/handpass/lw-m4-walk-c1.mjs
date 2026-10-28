// walker C, scenario 1 — the bell's decision lines (desktop, admin and member in one context)
const CL = await import('./lw-m4-walk-c-lib.mjs')
const L = await CL.setup('c', 's1')
const H = CL.mk(L)
const { T, rec, shot, press, vis, txt } = L
console.log('[lw-m4-walk-c1 v2]')
L.clearOut()
const size = 'desk'
const w = await L.newCtx(size)
const P = w.page
const out = []
let before = []
const say = (...a) => console.log(...a)

async function memberBell(id, label, expectRe, tapCheck = true) {
  await L.switchTo(w, 'member')
  const after = await H.bell(w)
  const fresh = H.bellDiff(before, after)
  await shot(w, `${id}-bell`)
  say(`   bell after ${label}: new=${fresh.length}`, fresh.map(l => `${l.unread ? '*' : ''}${l.text}`).join(' | '))
  before = after
  return fresh
}
async function tapNewest(id, fresh, expectIso) {
  if (!fresh.length) return null
  const target = await P.locator(T(`bell-line-${fresh[0].id}`)).first()
  await H.pressLoc(w, target)
  await P.waitForTimeout(500)
  await shot(w, `${id}-tap`)
  const ring = await H.ring(w)
  const tabs = await H.activeTab(w)
  say(`   tap -> ring ${JSON.stringify(ring)} tabs ${tabs}`)
  return ring
}
const wait = ms => P.waitForTimeout(ms)

try {
  await L.signIn(w, 'member')
  before = await H.bell(w); await L.closeBell(w)
  say('   bell at start:', before.length)

  /* 1a approved (through Approvals) */
  await H.bid(w, '2026-01-13')
  await L.switchTo(w, 'admin')
  await L.openApprovals(w)
  await shot(w, '1a-approvals-before')
  await H.pressLoc(w, H.lineBtn(w, '13 Jan', 'appr-approve'))
  await wait(500)
  await shot(w, '1a-approvals-after')
  let f = await memberBell('1a', 'approved')
  rec('1a approved', size, f.length === 1 && /Your leave.*13 Jan.*LL approved.*Saber/.test(f[0].text) && f[0].unread ? 'PASS' : 'FAIL', f.map(l => l.text).join(' | '), ['1a-bell'])
  let ring = await tapNewest('1a', f)
  rec('1a tap -> grid, ringed', size, ring ? 'PASS' : 'FAIL', JSON.stringify(ring), ['1a-tap'])

  /* 1b refused (through Approvals) */
  await H.bid(w, '2026-01-16')
  await L.switchTo(w, 'admin')
  await L.openApprovals(w)
  await H.pressLoc(w, H.lineBtn(w, '16 Jan', 'appr-refuse'))
  await wait(500)
  await shot(w, '1b-approvals-after')
  f = await memberBell('1b', 'refused')
  rec('1b refused', size, f.length === 1 && /Your leave.*16 Jan.*LL refused.*Saber/.test(f[0].text) ? 'PASS' : 'FAIL', f.map(l => l.text).join(' | '), ['1b-bell'])
  ring = await tapNewest('1b', f)
  rec('1b tap -> grid, ringed', size, ring ? 'PASS' : 'FAIL', JSON.stringify(ring), ['1b-tap'])

  /* 1c put back to a bid: the approved 13 Jan leave, second tap on the lit Approve in the bid window */
  await L.switchTo(w, 'admin')
  await L.openCell(w, 'bane', '2026-01-13')
  await shot(w, '1c-window-approved')
  await press(w, T('decide-approve'))
  await wait(600)
  await L.openCell(w, 'bane', '2026-01-13')
  const placedTxt = await txt(P, T('bid-placed'))
  await shot(w, '1c-window-after')
  await L.closeWin(w)
  f = await memberBell('1c', 'put back to a bid')
  rec('1c put back to a bid', size, f.length === 1 && /13 Jan/.test(f[0].text) && /bid/i.test(f[0].text) && /Saber/.test(f[0].text) ? 'PASS' : 'FAIL', `placed line now: "${placedTxt}"; bell: ` + f.map(l => l.text).join(' | '), ['1c-bell', '1c-window-after'])
  ring = await tapNewest('1c', f)
  rec('1c tap -> grid, ringed', size, ring ? 'PASS' : 'FAIL', JSON.stringify(ring), ['1c-tap'])

  /* 1d his pending bid moved by Saber (Move on the grid) */
  await H.bid(w, '2026-01-20')
  await L.switchTo(w, 'admin')
  await L.openCell(w, 'bane', '2026-01-20')
  await press(w, T('decide-shift')); await wait(500)
  await shot(w, '1d-move-armed')
  await press(w, T('cell-bane-2026-01-21')); await wait(700)
  await shot(w, '1d-move-done')
  f = await memberBell('1d', 'moved')
  rec('1d pending bid moved by Saber', size, f.length === 1 && /moved/i.test(f[0].text) && /Saber/.test(f[0].text) ? 'PASS' : 'FAIL', f.map(l => l.text).join(' | '), ['1d-bell'])
  ring = await tapNewest('1d', f)
  rec('1d tap -> grid, ringed', size, ring ? 'PASS' : 'FAIL', JSON.stringify(ring), ['1d-tap'])

  /* 1e his pending bid deleted by Saber */
  await H.bid(w, '2026-01-22')
  await L.switchTo(w, 'admin')
  await L.openCell(w, 'bane', '2026-01-22')
  await press(w, T('bid-clear')); await wait(500)
  if (await vis(P, T('bid-picker'))) { await press(w, T('bid-clear')); await wait(600) }
  await shot(w, '1e-after-delete')
  f = await memberBell('1e', 'deleted')
  rec('1e pending bid deleted by Saber', size, f.length === 1 && /delet/i.test(f[0].text) && /Saber/.test(f[0].text) ? 'PASS' : 'FAIL', f.map(l => l.text).join(' | '), ['1e-bell'])
  ring = await tapNewest('1e', f)
  rec('1e tap -> grid, ringed', size, ring ? 'PASS' : 'FAIL', JSON.stringify(ring), ['1e-tap'])

  /* 1f his approved leave moved */
  await H.bid(w, '2026-01-26')
  await L.switchTo(w, 'admin')
  await L.openCell(w, 'bane', '2026-01-26')
  await press(w, T('decide-approve')); await wait(600)
  await L.openCell(w, 'bane', '2026-01-26')
  await press(w, T('decide-shift')); await wait(500)
  await press(w, T('cell-bane-2026-01-27')); await wait(700)
  await shot(w, '1f-after-move')
  f = await memberBell('1f', 'approved leave moved')
  rec('1f approved leave moved', size, f.some(l => /moved/i.test(l.text) && /Saber/.test(l.text)) ? 'PASS' : 'FAIL', f.map(l => l.text).join(' | '), ['1f-bell'])
  ring = await tapNewest('1f', f)
  rec('1f tap -> grid, ringed', size, ring ? 'PASS' : 'FAIL', JSON.stringify(ring), ['1f-tap'])

  /* 1g approved leave deleted */
  await H.bid(w, '2026-01-29')
  await L.switchTo(w, 'admin')
  await L.openCell(w, 'bane', '2026-01-29')
  await press(w, T('decide-approve')); await wait(600)
  await L.openCell(w, 'bane', '2026-01-29')
  await press(w, T('bid-clear')); await wait(500)
  if (await vis(P, T('bid-picker'))) { await press(w, T('bid-clear')); await wait(600) }
  await shot(w, '1g-after-delete')
  f = await memberBell('1g', 'approved leave deleted')
  rec('1g approved leave deleted', size, f.some(l => /delet/i.test(l.text) && /Saber/.test(l.text)) ? 'PASS' : 'FAIL', f.map(l => l.text).join(' | '), ['1g-bell'])
  ring = await tapNewest('1g', f)
  rec('1g tap -> grid, ringed', size, ring ? 'PASS' : 'FAIL', JSON.stringify(ring), ['1g-tap'])

  /* 1h leave placed already approved (Approve what I enter ON) */
  await L.switchTo(w, 'admin')
  await L.openCell(w, 'bane', '2026-02-02')
  const tickOn = await L.approveWhatIEnter(w, true)
  await shot(w, '1h-window-tick-on')
  const placed = await L.placeLeave(w, 'LL')
  await wait(300)
  await shot(w, '1h-after-place')
  f = await memberBell('1h', 'placed approved')
  rec('1h LL added and approved', size, f.length === 1 && /Your leave.*2 Feb.*LL added and approved.*Saber/.test(f[0].text) ? 'PASS' : 'FAIL', `tick ${tickOn}, placed ${placed}; ` + f.map(l => l.text).join(' | '), ['1h-bell'])
  ring = await tapNewest('1h', f)
  rec('1h tap -> grid, ringed', size, ring ? 'PASS' : 'FAIL', JSON.stringify(ring), ['1h-tap'])

  /* 1i days decided together = ONE line (a three-day bid by drag, approved from Approvals) */
  const opened = await H.drag(w, '2026-02-09', '2026-02-11')
  await shot(w, '1i-drag-window')
  await press(w, T('sel-LL')); await wait(500)
  if (await vis(P, T('select-sheet'))) { await press(w, T('sel-LL')); await wait(600) }
  say('   3-day bid: window still up?', await vis(P, T('select-sheet')))
  await L.switchTo(w, 'admin')
  await L.openApprovals(w)
  const lines9 = await L.apprLines(P)
  say('   Ranger lines:', JSON.stringify(lines9.filter(l => l.who === 'bane').map(l => l.text)))
  await H.pressLoc(w, H.lineBtn(w, 'Wed 11 Feb', 'appr-approve')); await wait(500)
  await shot(w, '1i-approvals-after')
  f = await memberBell('1i', 'three days decided together')
  rec('1i three days approved together = ONE line', size, f.length === 1 && /9.*11 Feb.*LL approved.*Saber/.test(f[0].text) ? 'PASS' : 'FAIL', `drag opened ${opened}; ` + f.map(l => l.text).join(' | '), ['1i-bell'])
  ring = await tapNewest('1i', f)
  rec('1i tap -> grid, ringed', size, ring ? 'PASS' : 'FAIL', JSON.stringify(ring), ['1i-tap'])

  /* 1j his own move and delete of his pending bid tell him nothing */
  await L.switchTo(w, 'member')
  await H.bid(w, '2026-02-12')
  await L.openCell(w, 'bane', '2026-02-12')
  const hasMove = await vis(P, T('decide-shift'))
  say('   member sees Move on own pending bid:', hasMove)
  if (hasMove) { await press(w, T('decide-shift')); await wait(500); await press(w, T('cell-bane-2026-02-13')); await wait(700) }
  await shot(w, '1j-after-own-move')
  await L.openCell(w, 'bane', '2026-02-13')
  const hasClear = await vis(P, T('bid-clear'))
  if (hasClear) { await press(w, T('bid-clear')); await wait(500); if (await vis(P, T('bid-picker'))) { await press(w, T('bid-clear')); await wait(600) } }
  await shot(w, '1j-after-own-delete')
  const cell13 = await P.locator(T('cell-bane-2026-02-13')).count() ? await H.cellText(w, 'bane', '2026-02-13') : null
  const after = await H.bell(w)
  await shot(w, '1j-bell')
  const fresh = H.bellDiff(before, after)
  rec('1j his own move and delete tell him nothing', size, fresh.length === 0 && hasMove && hasClear ? 'PASS' : 'FAIL', `move offered ${hasMove}, delete offered ${hasClear}, cell 13 Feb text "${cell13}"; new bell lines ${fresh.length}: ` + fresh.map(l => l.text).join(' | '), ['1j-after-own-move', '1j-after-own-delete', '1j-bell'])
  before = after
  await L.closeBell(w)

  /* the admin's own bell: nothing about all these requests (D1219) */
  await L.switchTo(w, 'admin')
  const ab = await H.bell(w)
  await shot(w, '1k-admin-bell')
  rec('1k the admin bell has nothing about new requests', size, ab.every(l => !/request|bid|LL/i.test(l.text)) ? 'PASS' : 'FAIL', `${ab.length} lines: ` + ab.map(l => l.text).join(' | '), ['1k-admin-bell'])
} catch (e) {
  rec('ERROR', size, 'FAIL', String(e).slice(0, 400))
  await shot(w, 'error').catch(() => {})
}
if (w.errs.length) rec('console', size, 'FAIL', w.errs.join(' || ').slice(0, 800))
L.writeResults('s1')
await w.ctx.close()
await L.closeBrowser()
console.log('DONE')
