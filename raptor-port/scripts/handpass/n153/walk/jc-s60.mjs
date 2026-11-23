// jc-s60 - S60, the Bell everyday round: notices made by normal work (an access request, an account change, a leave bid and its decision), read as a member, a View holder, a Plan holder and the master admin;
// the bell opened and closed by its button, a press outside and Escape; Show pressed; a notice opened; Mark all read; a foreign squadron in view; after Undo and Redo.
import { signIn, newPage, closeAll, finish, step, pic, picsFor, note, check, facts, as, logout, go, shut, pickSq, state } from './jlib.mjs'
import { bell, toUsers, editRow, saveRow, doUndo, doRedo, toast, tips } from './jc-lib.mjs'
const SZ = process.env.SZ || 'd'
console.log('jc-s60 v1', SZ)
picsFor('jc-s60-' + SZ)
const rec = (k, v) => { facts[k] = v; note(`RECORD ${k}: ${typeof v === 'string' ? v : JSON.stringify(v)}`) }
const lit = s => s.page.evaluate(() => { const e = [...document.querySelectorAll('#notifyBell')].find(x => x.getBoundingClientRect().width > 0); return !!e && e.classList.contains('on') })
const bellBtn = s => s.page.locator('#notifyBell').filter({ visible: true }).first()
const press = async (s, l) => { if (s.desk) await l.click(); else await l.tap(); await s.page.waitForTimeout(320) }
const outside = async s => { const W = s.page.viewportSize().width, H = s.page.viewportSize().height; if (s.desk) await s.page.mouse.click(12, H - 60); else await s.page.touchscreen.tap(8, H - 40); await s.page.waitForTimeout(350) }
/* a bell lit by a waiting request takes its first press to Users (as ruled): a second press opens the list */
const openList = async s => {
  if (await bell.isOpen(s)) return
  for (let i = 1; i <= 4; i++) {
    await press(s, bellBtn(s)); if (await bell.isOpen(s)) { if (i > 1) rec(`S60 presses of the bell before its list opened`, i); break }
    note(`[${s.sz}] bell press ${i} went to ${(await state(s)).page}, toast: ${await toast(s)}`)
  }
  await s.page.waitForTimeout(150)
}
const unread = s => s.page.evaluate(() => [...document.querySelectorAll('[data-testid="bell-list"] .bl-line.unread')].filter(e => e.getBoundingClientRect().height > 0).length)
const shows = s => s.page.evaluate(() => [...document.querySelectorAll('[data-testid="bell-show"] button')].map(b => `${b.textContent.trim()}:${b.getAttribute('aria-pressed')}`))
async function closings(s, tag) {
  await press(s, bellBtn(s)); check(`S60 ${tag} the button opens it`, await bell.isOpen(s), 'open'); await pic(s, `${tag}-1-open`)
  await press(s, bellBtn(s)); check(`S60 ${tag} the button closes it`, !(await bell.isOpen(s)), 'closed')
  await press(s, bellBtn(s)); await outside(s); check(`S60 ${tag} a press outside closes it`, !(await bell.isOpen(s)), 'closed')
  const pageAfter = (await state(s)).page; rec(`S60 ${tag} page after the outside press`, pageAfter)
  await press(s, bellBtn(s)); await s.page.keyboard.press('Escape'); await s.page.waitForTimeout(280); check(`S60 ${tag} Escape closes it`, !(await bell.isOpen(s)), 'closed')
}
async function ask(s, cs, num) {
  const { page } = s
  await page.goto(`http://localhost:${process.env.MQ_PORT}/`); await page.waitForSelector('#luser'); await page.fill('#luser', `${cs}@mail`); await page.fill('#lpass', 'x'); await page.click('#loginForm button[type=submit]'); await page.waitForSelector('#accForm')
  await page.selectOption('#accSqn', { label: num }); await page.fill('#accCs', cs); await page.fill('#accIni', 'QQ'); await page.selectOption('#accSeat', { index: 1 }); await page.selectOption('#accCat', { index: 1 }); await page.click('#accSend'); await page.waitForSelector('#accessWaiting'); await page.locator('#accOut').first().click(); await page.waitForSelector('#luser'); await page.waitForTimeout(200)
}
try {
  const s = await newPage(SZ); const { page } = s
  await step('S60 the master admin: closings on an empty bell', async () => { await signIn(s, 'ad', 'a'); rec('S60 Saber lit at sign-in', await lit(s)); await closings(s, 'saber') })
  await step('S60 notices made by normal work', async () => {
    await toUsers(s); await editRow(s, 'prowler', [{ line: ['149', 'view'] }]); await saveRow(s); await page.waitForTimeout(200)
    await editRow(s, 'bane', [{ line: ['149', 'view'] }]); await saveRow(s); await page.waitForTimeout(200); await logout(s)
    await ask(s, 'Wren', '149'); await ask(s, 'Crow', '142')
    await signIn(s, 'ad', 'a'); rec('S60 Saber lit with a request on his own 142', await lit(s))
  })
  await step('S60 the bell takes the master admin to the request', async () => {
    await press(s, bellBtn(s)); await page.waitForTimeout(350); const st = await state(s); const t = await toast(s); rec('S60 Saber bell press', { page: st.page, bar: st.barMark || st.dMark, toast: t, open: await bell.isOpen(s) }); await pic(s, 'saber-2-request')
    check('S60 the press lands on Users', st.page === 'page-admin', st.page); check('S60 the toast names the squadron', /waiting for access to 142/.test(t || ''), t)
    const on = await page.evaluate(() => [...document.querySelectorAll('#admWaiting [data-req]')].filter(r => r.getBoundingClientRect().height > 0).map(r => r.innerText.replace(/\s+/g, ' ').slice(0, 40))); check('S60 the request is on the list in view', on.some(x => /Crow/.test(x)), on)
    check('S60 149\'s request is not on 142\'s list', !on.some(x => /Wren/.test(x)), on)
  })
  await step('S60 Undo and Redo against the notice', async () => {
    await as(s, 'ad', 'a'); await toUsers(s); await editRow(s, 'prowler', [{ line: ['149', 'plan'] }]); await saveRow(s); await page.waitForTimeout(200)
    await as(s, 'ad2', 'a2'); await openList(s); const before = await bell.lines(s); rec('S60 Hunter bell before', before.slice(0, 3)); check('S60 his bell says Plan of 149', before.some(x => /Given Plan of 149/.test(x)), before.slice(0, 1)); await bell.close(s)
    await as(s, 'ad', 'a'); await toUsers(s); await editRow(s, 'prowler', [{ line: ['149', 'view'] }]); await saveRow(s); await page.waitForTimeout(200); await doUndo(s); rec('S60 Undo says', await toast(s)); await doRedo(s); rec('S60 Redo says', await toast(s)); await editRow(s, 'prowler', [{ line: ['149', 'plan'] }]); await saveRow(s); await page.waitForTimeout(200)
    await as(s, 'ad2', 'a2'); await openList(s); const after = await bell.lines(s); rec('S60 Hunter bell after Undo and Redo', after.slice(0, 4)); await pic(s, 'hunter-1-after-undo')
    await bell.close(s)
  })
  await step('S60 a Plan holder: closings, Show, a foreign View, Mark all read', async () => {
    await closings(s, 'hunter'); await openList(s)
    rec('S60 Hunter Show', await shows(s)); const list = page.locator('[data-testid="bell-show"] button')
    const n = await list.count(); for (let i = 0; i < n; i++) { await press(s, list.nth(i)); const L = await bell.lines(s); rec(`S60 Hunter after Show ${i}`, { show: await shows(s), lines: L.length }); check(`S60 his own lines stay after Show ${i}`, L.some(x => /Given|ended/.test(x)), L.length); await press(s, list.nth(i)) }
    const sc = page.locator('[data-testid="bell-list"] .bl-scroll').first(); const scrollable = await sc.evaluate(e => e.scrollHeight > e.clientHeight + 2); rec('S60 the list scrolls', scrollable)
    if (scrollable) { await sc.evaluate(e => { e.scrollTop = e.scrollHeight }); await page.waitForTimeout(150); check('S60 scrolled', (await sc.evaluate(e => e.scrollTop)) > 0, await sc.evaluate(e => e.scrollTop)) }
    await bell.close(s); await pickSq(s, '149'); await shut(s); await page.waitForTimeout(350); const v = await state(s); rec('S60 Hunter viewing 149', { bar: v.barMark || v.dMark, page: v.page, tabs: v.tabs.length ? v.tabs : v.items })
    await openList(s); const L = await bell.lines(s); rec('S60 Hunter bell on 149', L.slice(0, 3)); await pic(s, 'hunter-2-on-149'); check('S60 his personal lines still there on 149', L.some(x => /Given/.test(x)), L.length)
    const u0 = await unread(s); const m = page.locator('[data-testid="bell-markall"]').filter({ visible: true }); rec('S60 unread before Mark all read', u0); if (await m.count()) { await press(s, m.first()); await page.waitForTimeout(250); check('S60 Mark all read clears the marks', (await unread(s)) === 0, await unread(s)); await bell.close(s); check('S60 the bell is no longer lit', !(await lit(s)), await lit(s)) } else { rec('S60 no Mark all read drawn', true); await bell.close(s) }
    await pickSq(s, '142'); await shut(s); await page.waitForTimeout(250); await logout(s); await signIn(s, 'ad2', 'a2'); check('S60 read stays read after signing in again', !(await lit(s)), await lit(s))
  })
  await step('S60 a member: his own notices, no Show, a line opened', async () => {
    await as(s, 'us', 'us'); await closings(s, 'ranger'); await openList(s); const L = await bell.lines(s); rec('S60 Ranger bell', L.slice(0, 4)); rec('S60 Ranger Show row', await shows(s)); await pic(s, 'ranger-1-bell')
    check('S60 his View notice shown', L.some(x => /View of 149/.test(x)), L.slice(0, 2))
    const first = page.locator('[data-testid="bell-list"] .bl-line').filter({ hasText: 'View of 149' }).first()
    if (await first.count()) { await press(s, first); await page.waitForTimeout(400); const st = await state(s); rec('S60 Ranger pressed his View line', { page: st.page, bar: st.barMark || st.dMark, open: await bell.isOpen(s) }); await pic(s, 'ranger-2-pressed'); check('S60 the press lands on a page he has', !!st.page, st.page); if (await bell.isOpen(s)) await bell.close(s) }
  })
  await s.ctx.close()
} finally { finish('jc-s60-' + SZ); await closeAll() }
