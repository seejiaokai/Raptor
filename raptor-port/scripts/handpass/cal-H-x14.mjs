/* X-14 — role changes close privilege gaps across every open door (D655, D658, D641). Opened as Saber (admin); authority
   is then taken away IN PLACE — by the badge (the admin's member view, a real control) and by the host's swap (raptorMe /
   raptorRole) — while the windows stay up; each write is pressed AFTER the change. */
import * as H from './cal-H-lib.mjs'
H.setTag('x14')
const { browser, page, errors } = await H.world({})
await H.toastSpy(page)
const SABER = await H.pidOf(page, 'Saber'), RANGER = await H.pidOf(page, 'Ranger'), ZEN = await H.pidOf(page, 'Zenith')
const swap = async (pid, role) => { await page.evaluate(([p, r]) => { window.raptorMe(p); window.raptorRole(r) }, [pid, role]); await H.sleep(600) }
const swapFull = async (pid, role) => { await page.evaluate(([p, r]) => { window.raptorMe(p); window.raptorRole(r); window.lwSetRole(r) }, [pid, role]); await H.sleep(700) }
const badge = () => page.locator('#roleBadge').innerText()
const tid = id => page.locator(`[data-testid="${id}"]`)
const toggleView = async () => { await page.locator('#roleBadge').click(); await H.sleep(700) }
const rec = {}
const MS = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december']
async function holTap(iso) {
  const at = async () => { const [m, y] = (await tid('holcal-month').textContent()).trim().toLowerCase().split(/\s+/); return +y * 12 + MS.indexOf(m) }
  let d = +iso.slice(0, 4) * 12 + (+iso.slice(5, 7) - 1) - await at()
  for (; d > 0; d--) await tid('holcal-next-month').click()
  for (; d < 0; d++) await tid('holcal-prev-month').click()
  await tid(`holcal-day-${iso}`).click(); await H.sleep(200)
}
const holList = () => page.evaluate(() => [...document.querySelectorAll('.hol-line')].map(e => e.innerText.replace(/\s+/g, ' ')))

/* ---------- A1: the Inputs settings window, left up while the admin becomes a member ---------- */
await H.inputsMonth(page, 2026, 7)
await tid('in-gear').click(); await H.sleep(600)
const sw = tid('iset-memberfile'); const was = await sw.isChecked()
await sw.click(); await H.sleep(250)
const a1pre = await H.pic(page, 'a1-settings-open-admin')
await toggleView()
const winAfter = await tid('win-inputsset').count()
const saveVis = await tid('iset-save').count()
const a1b = await H.pic(page, 'a1b-member-view-window-up')
let saveRes = 'no Save button left'
let toastA1 = []
if (saveVis) { await H.toastSpy(page); await tid('iset-save').click().catch(e => { saveRes = 'press failed: ' + String(e.message).split('\n')[0] }); await H.sleep(800); toastA1 = await H.toasts(page); saveRes = 'pressed' }
const a1c = await H.pic(page, 'a1c-after-save-press')
await toggleView() // back to admin
const badgeBack = await badge()
await H.inputsMonth(page, 2026, 7)
await tid('in-gear').click(); await H.sleep(600)
const nowVal = await tid('iset-memberfile').isChecked()
H.judge('X-14 (A1) settings window', 'opened the Inputs settings window as Saber, flipped "Members may file duties and commitments for other people" (not saved), tapped the name badge to the member view with the window still up, pressed Save', [
  ['the badge changed to the member view', true, badgeBack],
  ['the window did not pass a write: the stored setting is unchanged', nowVal === was, { was, nowVal, windowStillUp: winAfter, saveRes, toastA1 }],
], [a1pre, a1b, a1c], { was, nowVal, winAfter, saveVis, toastA1 })
await tid('iset-cancel').click().catch(() => {}); await H.sleep(300)

console.log('>>> start A2')
/* ---------- A2: the Calendar window's holiday form ---------- */
await H.go(page, 'leavewar'); await page.waitForSelector('[data-testid="row-slipway"]'); await H.sleep(600)
await tid('settings-open').click(); await H.sleep(300); await tid('settings-days').click(); await tid('win-days').waitFor()
if (await tid('days-tabs').count()) await tid('days-tab-holidays').click()
await H.sleep(300)
await tid('hol-add').click(); await tid('hol-name').fill('X14 Hol'); await tid('hol-short').fill('XH'); await holTap('2026-09-02')
const a2a = await H.pic(page, 'a2a-holiday-form-admin')
await toggleView()
const formUp = await tid('win-holiday').count()
const calUp = await tid('win-days').count()
let a2res = 'form gone'
if (formUp) { await tid('hol-save').click().catch(e => { a2res = 'press failed' }); await H.sleep(800); a2res = 'pressed' }
const a2b = await H.pic(page, 'a2b-holiday-after-save-as-member')
const errTxt = await tid('hol-err').innerText().catch(() => '')
await toggleView()
await H.go(page, 'leavewar'); await H.sleep(500)
let holsAfter = []
if (await tid('win-days').count() === 0) { await tid('settings-open').click(); await H.sleep(300); await tid('settings-days').click(); await tid('win-days').waitFor() }
if (await tid('days-tabs').count()) await tid('days-tab-holidays').click()
await H.sleep(300); holsAfter = await holList()
H.judge('X-14 (A2) Calendar window', 'opened Calendar → Holidays → Add form (name, short form, 2 Sep) as Saber; tapped the badge to member view with the window up; pressed the form\'s Save', [
  ['no holiday "X14 Hol" was written', !holsAfter.some(t => /X14 Hol/.test(t)), { holsAfter: holsAfter.filter(t => /X14|Sep/.test(t)), formUp, calUp, a2res, errTxt }],
], [a2a, a2b], { formUp, calUp, a2res, errTxt })
await tid('win-days-x').click().catch(() => {}); await H.sleep(300)

console.log('>>> start A3')
/* ---------- A3: a Required cell typed after authority is gone ---------- */
const reqCell = iso => page.locator(`[data-testid="req-p-${iso}"]`).first()
await H.go(page, 'leavewar'); await H.sleep(500)
const c = reqCell('2026-09-10'); await c.scrollIntoViewIfNeeded(); await c.click(); await H.sleep(250); await page.keyboard.type('5')
const a3a = await H.pic(page, 'a3a-required-box-typed-admin')
/* the box is left OPEN: authority is changed in place (no click, so nothing blurs and commits first) */
await swapFull(RANGER, 'member')
await page.keyboard.press('Enter'); await H.sleep(700)
const a3b = await H.pic(page, 'a3b-after-enter-as-member')
const memberCell = (await reqCell('2026-09-10').innerText()).trim()
const editableNow = await reqCell('2026-09-10').evaluate(e => e.classList.contains('editable'))
await swapFull(SABER, 'admin')
const adminCell = (await reqCell('2026-09-10').innerText()).trim()
H.judge('X-14 (A3) Required cell', 'clicked a Required P cell (10 Sep) as Saber, typed 5 and left the box open, swapped in place to Ranger (member, Leave War role member too), pressed Enter', [
  ['no figure was written (the cell reads blank again as admin)', !/5/.test(adminCell), { memberCell, adminCell }],
  ['in member view the cell is not an editable one', !editableNow, editableNow],
], [a3a, a3b], { memberCell, adminCell, editableNow })
await page.keyboard.press('Escape')

console.log('>>> start A4')
/* ---------- A4: the group editor, left up while another man (a member in the group, not its filer) takes over ---------- */
await H.inputsMonth(page, 2026, 7)
await H.fileShared(page, { iso: '2026-07-20', type: 'Meeting', people: ['Ranger', 'Drifter'], remarks: 'X14 group' })
await H.inputsMonth(page, 2026, 7)
await H.openBar(page, /\+2/)
await page.fill('#inpEditRmk', 'X14 hijacked')
const a4a = await H.pic(page, 'a4a-group-editor-admin')
await swap(RANGER, 'member')
const edUp = await tid('win-inputedit').count()
const saveBtn = await page.locator('#inpEditSave').count()
let a4res = 'no Save left'
if (saveBtn) { await page.click('#inpEditSave').catch(() => { a4res = 'press failed' }); await H.sleep(900); a4res = 'pressed' }
const a4b = await H.pic(page, 'a4b-group-editor-after-swap-save')
const rmk = (await H.inputsNow(page)).filter(x => /X14/.test(x.remarks)).map(x => x.person + ':' + x.remarks)
await swap(SABER, 'admin')
H.judge('X-14 (A4) group editor', 'opened the shared Meeting\'s editor as Saber, typed a new remark, then swapped to Ranger (a member in the group who did not file it) with the window up and pressed Save', [
  ['the remark was NOT changed to the typed one', !rmk.some(t => /hijacked/.test(t)), { rmk, edUp, saveBtn, a4res }],
], [a4a, a4b], { rmk, edUp, saveBtn, a4res })
await page.keyboard.press('Escape'); await H.sleep(300)

console.log('>>> start A5')
/* ---------- A5: a drag begun as admin and finished after the swap ---------- */
await H.inputsMonth(page, 2026, 7)
const bar = page.locator('#inpCal .ib-bar').filter({ hasText: /\+2/ }).first()
const bb = await bar.boundingBox()
const datesOf = async () => (await H.inputsNow(page)).filter(x => /X14/.test(x.remarks)).map(x => x.date + (x.endDate ? '→' + x.endDate : ''))
const d0 = await datesOf()
const cx = bb.x + bb.width / 2, cy = bb.y + bb.height / 2
await page.mouse.move(cx, cy); await page.mouse.down()
await page.mouse.move(cx + 20, cy + 4, { steps: 4 })
await swap(RANGER, 'member')
await page.mouse.move(cx + 190, cy + 6, { steps: 8 }); await H.sleep(150)
const a5a = await H.pic(page, 'a5a-mid-drag-after-swap')
await page.mouse.up(); await H.sleep(900)
const d1 = await datesOf()
const a5b = await H.pic(page, 'a5b-after-drop')
await swap(SABER, 'admin')
H.judge('X-14 (A5) bar drag', 'pressed on the shared Meeting\'s bar as Saber, dragged, swapped to Ranger (member, in the group, not the filer) in the middle of the drag, finished the drag two days on', [
  ['the drop moved nothing (dates unchanged)', JSON.stringify(d0) === JSON.stringify(d1), { before: d0, after: d1 }],
], [a5a, a5b], { d0, d1 })

console.log('>>> start A6')
/* ---------- A6: doors for a member, SANS member, non-SANS member ---------- */
const doors = async who => {
  await H.go(page, 'inputs'); await H.inputsMonth(page, 2026, 7); await H.sleep(300)
  const o = { gear: await tid('in-gear').count() }
  await page.locator('#inSansMode').click().catch(() => {}); await H.sleep(600)
  o.sansGear = await tid('sc-gear').count()
  await tid('sc-day-2026-07-21').click({ position: { x: 8, y: 8 } }).catch(() => {}); await H.sleep(600)
  o.sdAdd = await tid('sd-add').count(); o.sdAddOn = o.sdAdd ? await tid('sd-add').isEnabled() : null
  o.sdWhy = await tid('sd-addwhy').innerText().catch(() => '')
  o.picSans = await H.pic(page, 'a6-sans-' + who)
  await tid('win-sansday-x').click().catch(() => {}); await H.sleep(300)
  await page.locator('#inMemberMode').click().catch(() => {}); await H.sleep(300)
  await H.go(page, 'leavewar'); await page.waitForSelector('[data-testid="row-slipway"]'); await H.sleep(400)
  o.lwGear = await tid('settings-open').count()
  o.reqEditable = await reqCell('2026-09-10').evaluate(e => e.classList.contains('editable')).catch(() => null)
  o.badge = await badge()
  o.pic = await H.pic(page, 'a6-doors-' + who)
  return o
}
await swapFull(RANGER, 'member'); const dRanger = await doors('ranger')
await swapFull(ZEN, 'member'); const dZen = await doors('sansman')
await swapFull(SABER, 'admin'); const dAdmin = await doors('admin')
H.judge('X-14 (A6) doors by role', 'as Ranger (non-SANS member), Zenith (SANS member) and Saber (admin) read which privileged doors exist: Inputs gear, SANS gear, "+ Commitment" on an opened SANS day, Leave War ⚙, Required cell editable', [
  ['admin has the Inputs gear, the SANS gear, the Leave War ⚙, and editable Required cells', dAdmin.gear === 1 && dAdmin.sansGear === 1 && dAdmin.lwGear === 1 && dAdmin.reqEditable === true, dAdmin],
  ['a non-SANS member has none of the admin doors, and "+ Commitment" is off with its reason', dRanger.gear === 0 && dRanger.sansGear === 0 && dRanger.lwGear === 0 && !dRanger.reqEditable && dRanger.sdAddOn !== true, dRanger],
  ['a SANS member has none of the admin doors, and "+ Commitment" is on (his own)', dZen.gear === 0 && dZen.sansGear === 0 && dZen.lwGear === 0 && !dZen.reqEditable && dZen.sdAddOn === true, dZen],
], [dRanger.picSans, dZen.picSans, dAdmin.picSans, dRanger.pic, dZen.pic, dAdmin.pic], { dRanger, dZen, dAdmin })

console.log('>>> start A7')
/* ---------- A7: guest and a signed-in person without access ---------- */
await H.go(page, 'admin'); await H.sleep(500)
const usersTab = page.locator('[data-admcat="users"]:visible, .adm-cat:has-text("Users"):visible').first(); if (await usersTab.count()) { await usersTab.click(); await H.sleep(400) }
await page.locator('#admGuestView').scrollIntoViewIfNeeded().catch(() => {})
const gv = page.locator('#admGuestView'); if (!(await gv.isChecked())) await gv.check(); await H.sleep(500)
await H.signOut(page)
await page.fill('#luser', 'stranger'); await page.fill('#lpass', 'x'); await page.click('#loginForm button[type=submit]'); await H.sleep(1000)
const noAccessFirst = await page.evaluate(() => document.body.innerText.replace(/\s+/g, ' ').slice(0, 200))
await page.fill('#accReqCs, input[placeholder="callsign or name"]', 'Stranger').catch(() => {})
await page.fill('input[placeholder="initials"]', 'ST').catch(() => {})
const sels = page.locator('select:visible'); const nsel = await sels.count()
if (nsel >= 2) { await sels.nth(0).selectOption({ index: 1 }); await sels.nth(1).selectOption({ index: 1 }) }
await page.locator('button:has-text("Request access")').click().catch(() => {}); await H.sleep(900)
const noAccessText = await page.evaluate(() => document.body.innerText.replace(/\s+/g, ' ').slice(0, 300))
const a7a = await H.pic(page, 'a7a-no-access-screen')
const guestBtn = await page.locator('#accGuest').count()
await page.evaluate(() => { try { window.go('editsched') } catch (e) { } }); await H.sleep(500)
const stillWaiting = (await page.locator('#vWeek .day').count()) === 0 ? 1 : 0
let guestInfo = {}
if (guestBtn) {
  await page.locator('#accGuest').click(); await H.sleep(1200)
  guestInfo.badge = await badge().catch(() => '')
  guestInfo.nav = await page.evaluate(() => [...document.querySelectorAll('nav button, .topbar button')].map(b => b.innerText.trim()).filter(Boolean).slice(0, 14))
  guestInfo.pic = await H.pic(page, 'a7b-guest-view')
  await page.evaluate(() => { try { window.go('inputs') } catch (e) { } }); await H.sleep(700)
  guestInfo.cp = await page.evaluate(() => window.CURPAGE)
  guestInfo.gear = await tid('in-gear').count()
  guestInfo.addBtn = await page.locator('#icPopAdd, #inAdd').count()
  guestInfo.pic2 = await H.pic(page, 'a7c-guest-after-go-inputs')
  await page.evaluate(() => { try { window.go('admin') } catch (e) { } }); await H.sleep(500)
  guestInfo.cpAdmin = await page.evaluate(() => window.CURPAGE)
  guestInfo.adminBody = await page.evaluate(() => document.body.innerText.replace(/\s+/g, ' ').slice(0, 200))
}
await H.signOut(page).catch(() => {})
// the sign-in card stays usable: sign in as the admin again
await page.fill('#luser', 'ad'); await page.fill('#lpass', 'a'); await page.click('#loginForm button[type=submit]')
const cardUsable = await page.waitForSelector('#vWeek .day', { state: 'attached', timeout: 15000 }).then(() => true, () => false)
H.judge('X-14 (A7) guest and no access', 'turned Guest view on (Admin → Users), signed out, signed in as an unknown name (waiting screen), tried to navigate by hand, pressed "View the schedule" (guest), tried the Inputs and Admin pages, signed out and signed in as Saber again', [
  ['an unknown name gets the Request-access screen, not the app', /Request access/i.test(noAccessFirst), noAccessFirst], ['after asking, a waiting screen with a guest button (switch on)', guestBtn === 1, noAccessText],
  ['navigating by hand does not leave the waiting screen', stillWaiting > 0, stillWaiting],
  ['the guest has no Inputs gear and no add button', guestInfo.gear === 0 && guestInfo.addBtn === 0, guestInfo],
  ['the guest cannot reach Admin', guestInfo.cpAdmin !== 'admin', guestInfo.cpAdmin],
  ['the sign-in card stays usable afterwards', cardUsable, cardUsable],
], [a7a, guestInfo.pic, guestInfo.pic2].filter(Boolean), { guestInfo, noAccessText })
console.log('ERRORS', errors)
H.save('x14', { errors })
await browser.close()
