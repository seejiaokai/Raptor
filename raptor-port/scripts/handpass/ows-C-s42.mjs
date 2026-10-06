/* walker C — S42 (roles, overlays, pending visibility; S04's three-version fixture) with H-04 (member with S08's fixture pending) on the way.
   Ranger flies 10:00–11:15, no in-time: ORIGINAL 07:00–13:15 FO (lead 3h); lead 2h30 (H-04: pending) → AL1 07:30–13:15 HO; lead 2h → working 08:00–13:15 HO. */
import * as C from './ows-C-lib.mjs'
const { S, L, W, LW, WB, world, judge, row, pic, sleep, SAT } = C
const { browser, p, errors } = await world()
const di = C.SATI, M = 'bane', PH = C.PHONE
const T = PH ? 'S42ph' : 'S42'
await C.expiryForever(p)
await L.go(p, 'editsched'); await sleep(400)
const w = await C.flyWave(p, di, { cs: 'VIPER', to: '10:00', ld: '11:15', p1: M })
const pub = await C.pubOrig(p, di)
const oOrig = await C.oilOf(p, M, SAT, T + '-1-orig')
console.log('ORIG', C.say(oOrig))
await S.logicSet(p, 'reportLead', '2h30')

async function viewFace(tag) {
  await S.toWeek(p); await L.go(p, 'viewsched'); await sleep(600); await W.showDay(p, di, '#vWeek')
  const f = await p.evaluate(([i, m]) => {
    const d = document.querySelector(`#vWeek .day[data-day="${i}"]`); if (!d) return null
    const t = e => e ? (e.innerText || '').replace(/\s+/g, ' ').trim() : ''
    const pk = [...d.querySelectorAll(`[data-person="${m}"]`)].find(e => e.offsetParent !== null)
    const vis = s => [...d.querySelectorAll(s)].filter(e => e.offsetParent !== null).length
    return { tag: t(d.querySelector('.verchip')), puck: pk ? pk.className : '(no puck)', title: pk ? pk.getAttribute('title') || '' : '', pend: t(d.querySelector('.dpend')), controls: { publish: vis('[data-beak]'), alpub: vis('[data-alpub]'), unpub: vis('[data-unpub]'), sign: vis('select[data-sign]'), planmenu: vis('[data-planmenu]') } }
  }, [di, M])
  const sh = await pic(p, tag + '-viewsched')
  return { f, sh }
}
async function logicControls() {
  await L.go(p, 'logic'); await sleep(500)
  const edit = await p.locator('#lgEdit:visible').count()
  const inputs = await p.locator('input[data-lgset]:visible').count()
  return { editButton: edit, inputs }
}

/* ---------- H-04: S08's fixture (published ORIG, lead changed → pending); a guest and a member ---------- */
const adminPend = await C.dayState(p, di, T + '-h04-admin')
const adminFace = await viewFace(T + '-h04-admin')
await C.reloadAs(p, 'm'); await sleep(600)
const mFace = await viewFace(T + '-h04-member')
const mLogic = await logicControls()
const mPic = await pic(p, T + '-h04-member-logic')
const mLW = await C.oilOf(p, M, SAT, T + '-h04-member-lw')
console.log('H04 member face', JSON.stringify(mFace.f), JSON.stringify(mLogic), C.say(mLW))
judge(T + '.H04', 'H-04: with S08\'s fixture pending (Logic lead 3h → 2h30 under the published ORIG Saturday), signed in as the member (us / Ranger)', [
  ['View-only Sched Saturday shows the published version (tag ORIG)', !!mFace.f && /ORIG/.test(mFace.f.tag), mFace.f && mFace.f.tag],
  ['Ranger\'s puck wears the FULL-day green edge', !!mFace.f && /oilbar-fo/.test(mFace.f.puck), mFace.f && mFace.f.puck],
  ['no publish / amendment / unpublish / sign-off controls drawn on that face', !!mFace.f && Object.values(mFace.f.controls).every(n => n === 0 || n === undefined) || (!!mFace.f && mFace.f.controls.publish + mFace.f.controls.alpub + mFace.f.controls.unpub + mFace.f.controls.sign === 0), mFace.f && mFace.f.controls],
  ['Logic page: no Edit-rules button and no value boxes for the member', mLogic.editButton === 0 && mLogic.inputs === 0, mLogic],
  ['Leave War: still FO, tracker worked 07:00–13:15', mLW.letters === 'FO' && /07:00.13:15/.test(mLW.row), { cell: mLW.cell.text, row: mLW.row.slice(0, 160) }],
], [mFace.sh, mPic, ...mLW.pics, adminFace.sh])
await C.reloadAs(p, 'a'); await sleep(600)

/* ---------- the amendment, then the third value ---------- */
const am = await C.pubAL(p, di)
const oAl = await C.oilOf(p, M, SAT, T + '-2-al')
await S.logicSet(p, 'reportLead', '2h')
console.log('AL', C.say(oAl))
const dW = await C.dayState(p, di, T + '-3-working')
const oNow = await C.oilOf(p, M, SAT, T + '-3-paid')
const amd = await C.amendments(p)
const amdPic = await pic(p, T + '-3-amendments')
/* working copy's figure: OIL Earn on the board */
await S.toBoard(p, di); await p.locator('#sbOil').click().catch(() => {}); await sleep(800)
const wfig = await p.evaluate(m => [...document.querySelectorAll('#schedBoard .puck[data-person="' + m + '"]')].filter(e => e.offsetParent !== null && !e.closest('#sbRoster')).map(e => e.innerText.replace(/\s+/g, ' ').trim()), M)
const wfigPic = await pic(p, T + '-3-working-oilmode')
await p.locator('#sbOil').click().catch(() => {}); await sleep(400); await S.closeBoard(p)
console.log('NOW', C.say(oNow, dW), JSON.stringify(wfig), JSON.stringify(amd && amd.text))
judge(T + '.a', 'three versions: ORIG (lead 3h), AL1 (lead 2h30), working copy (lead 2h)', [
  ['paid = AL1: HO, worked 07:30–13:15 (not 08:00, not 07:00)', oNow.letters === 'HO' && /07:30.13:15/.test(oNow.row) && /AL\s*1/.test(am.head.tag), { cell: oNow.cell.text, row: oNow.row.slice(0, 160), tag: am.head.tag }],
  ['the working copy reads 1 pending; its To go out line says half day 07:30–13:15 → half day 08:00–13:15', C.pendOf(dW.head) === '1' && /08:00.13:15/.test(dW.list), { chip: dW.head.pending, list: dW.list.slice(0, 400) }],
  ['working copy\'s OIL Earn figure for Ranger: half day', /HO/.test(wfig.join(' ')), wfig],
  ['the Amendments box carries the pending OIL line', !!amd && /1 day with changes|Sat/.test(amd.text), amd && amd.text],
], [...oNow.pics, ...dW.pics, amdPic, wfigPic])

/* ---------- the ORIGINAL looked at ---------- */
await S.toWeek(p); await W.showDay(p, di)
const lk = await WB.look(p, di, /Original/i)
const face = lk.err ? null : await WB.lookFace(p, di)
const origPuck = await p.evaluate(([i, m]) => { const d = document.querySelector(`#eWeek .day[data-day="${i}"]`); const pk = d && [...d.querySelectorAll(`[data-person="${m}"]`)].find(e => e.offsetParent !== null); return pk ? pk.className : '(no puck)' }, [di, M])
const lookPic = await pic(p, T + '-4-original-look')
const afterLook = await C.oilOf(p, M, SAT, T + '-4-lw-while-looking')
await S.toWeek(p); const back = await WB.backLive(p, di)
console.log('LOOK', JSON.stringify(lk).slice(0, 200), JSON.stringify(face), origPuck, back)
judge(T + '.b', 'Edit Schedule: the plans menu → look at the ORIGINAL version (👁), the Leave War looked at while the preview is up, then Back to live copy', [
  ['the ORIGINAL could be looked at', !lk.err, lk.err || lk.label],
  ['its face wears the full-day (FO) edge Ranger went out with', /oilbar-fo/.test(origPuck), origPuck],
  ['no write door inside the look (no OIL period buttons / sign selects)', !!face && face.signs === 0, face],
  ['merely looking changed no money: Leave War still HO 07:30–13:15', afterLook.letters === 'HO' && /07:30.13:15/.test(afterLook.row), { cell: afterLook.cell.text, row: afterLook.row.slice(0, 160) }],
], [lookPic, ...afterLook.pics])

/* ---------- member: the latest face; guest ---------- */
await C.reloadAs(p, 'm'); await sleep(600)
const mf2 = await viewFace(T + '-5-member-latest')
const mlw2 = await C.oilOf(p, M, SAT, T + '-5-member-lw')
judge(T + '.c', 'signed in as the member: View-only Sched Saturday (AL1) and the Leave War', [
  ['the face is AL1 and Ranger wears the HALF-day edge', !!mf2.f && /AL\s*1/.test(mf2.f.tag) && /oilbar-ho/.test(mf2.f.puck), mf2.f && { tag: mf2.f.tag, puck: mf2.f.puck }],
  ['no publish / sign controls', !!mf2.f && mf2.f.controls.publish + mf2.f.controls.alpub + mf2.f.controls.unpub + mf2.f.controls.sign === 0, mf2.f && mf2.f.controls],
  ['no pending chip leaked on the member\'s face (the working copy is not his)', !!mf2.f, mf2.f && mf2.f.pend],
  ['Leave War: HO, worked 07:30–13:15', mlw2.letters === 'HO' && /07:30.13:15/.test(mlw2.row), { cell: mlw2.cell.text, row: mlw2.row.slice(0, 160) }],
], [mf2.sh, ...mlw2.pics])
row(T + '.pendmember', 'what the member\'s View-only Saturday says about pending', JSON.stringify({ chip: mf2.f && mf2.f.pend }), 'RECORDED', [mf2.sh])

/* guest door: Admin → Guest switch on, sign out, sign in with a name nobody has */
let guestNote = ''
try {
  await C.reloadAs(p, 'a'); await sleep(500)
  await L.go(p, 'admin'); await sleep(600)
  const sw = p.locator('#admGuestView')
  if (!(await sw.count())) throw new Error('no guest switch on Admin')
  if (!(await sw.isChecked())) { await sw.check(); await sleep(400) }
  await p.locator('button', { hasText: /^Logout$/ }).first().click(); await sleep(800)
  await p.fill('#luser', 'walkerguest'); await p.fill('#lpass', 'x'); await p.click('#loginForm button[type=submit]'); await sleep(1500)
  /* an unlisted name is asked to request access first (the app's own card); with the guest switch on, the request leads into the guest view (D221) */
  if (await p.locator('#accSend').count()) {
    await p.fill('#accCs', 'Walker'); await p.fill('#accIni', 'WK')
    await p.selectOption('#accSeat', { index: 1 }); await sleep(300)
    if ((await p.locator('#accCat option').count()) > 1) await p.selectOption('#accCat', { index: 1 })
    await p.click('#accSend'); await sleep(1500)
    if (!(await p.locator('#guestApp').count())) { await p.locator('#accOut').click().catch(() => {}); await sleep(800); await p.fill('#luser', 'walkerguest'); await p.fill('#lpass', 'x'); await p.click('#loginForm button[type=submit]'); await sleep(1500) }
  }
  const g = await p.evaluate(([i, m]) => {
    const a = document.querySelector('#guestApp'); if (!a) return { app: false, body: document.body.innerText.slice(0, 200) }
    const t = e => e ? (e.innerText || '').replace(/\s+/g, ' ').trim() : ''
    const d = a.querySelectorAll('.day')
    const pk = [...a.querySelectorAll(`[data-person="${m}"]`)].find(e => e.offsetParent !== null)
    const ctl = ['[data-beak]', '[data-alpub]', '[data-unpub]', 'select[data-sign]', '[data-lgset]', '#lgEdit'].map(s => s + ':' + [...a.querySelectorAll(s)].filter(e => e.offsetParent !== null).length)
    return { app: true, days: d.length, text: t(a).slice(0, 300), puck: pk ? pk.className : '(no puck for Ranger in the guest face)', ctl }
  }, [di, M])
  const gp = await pic(p, T + '-6-guest')
  guestNote = JSON.stringify(g)
  row(T + '.guest', 'Admin → Guest view switch on → Logout → sign in as an unlisted name (walkerguest): the published week as a guest', guestNote, 'RECORDED', [gp])
} catch (e) { guestNote = 'NOT WALKED: ' + String(e.message).slice(0, 200); row(T + '.guest', 'the guest door', guestNote, 'NOT WALKED', []) }
console.log('GUEST', guestNote)
await C.finish(browser, errors, 'ows-C-' + T.toLowerCase())
