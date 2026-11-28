// jc-s56 - S56, the Users everyday round: Add a person; find him by search and Filter; his row and the roles table; his access and sign-in name;
// Save, Cancel, Escape; Suspend and restore; Archive and restore; Delete; then what a member, a View holder and a Plan holder are offered.
import { signIn, newPage, closeAll, finish, step, pic, picsFor, note, check, facts, as, logout, pickSq, shut, state, go, openRow } from './jlib.mjs'
import { toUsers, who, editRow, saveRow, toast, tips, doUndo, doRedo, rowText, bell } from './jc-lib.mjs'
import { tick, closeF, openF, SEARCH, tap } from './jc-flib.mjs'
const SZ = process.env.SZ || 'd'
console.log('jc-s56 v1', SZ)
picsFor('jc-s56-' + SZ)
const rec = (k, v) => { facts[k] = v; note(`RECORD ${k}: ${typeof v === 'string' ? v : JSON.stringify(v)}`) }
const pids = s => s.page.evaluate(() => [...document.querySelectorAll('#page-admin [data-person]')].map(e => e.dataset.person))
const words = s => s.page.evaluate(() => document.body.innerText.replace(/\s+/g, ' ').slice(0, 240))
async function tryIn(s, user, pass) { await s.page.goto(`http://localhost:${process.env.MQ_PORT}/`); await s.page.waitForSelector('#luser'); await s.page.fill('#luser', user); await s.page.fill('#lpass', pass); await s.page.click('#loginForm button[type=submit]'); await s.page.waitForTimeout(1500) }
try {
  const s = await newPage(SZ); const { page } = s
  await signIn(s, 'ad', 'a'); await toUsers(s)
  let zid
  await step('S56 Add a person', async () => {
    const before = await pids(s)
    await page.fill('#accAddCs', 'Quokka'); await page.fill('#accAddIni', 'QK'); await page.selectOption('#accAddSeat', { index: 1 }); await page.selectOption('#accAddCat', { index: 1 }); await page.fill('#accAddName', 'quokka1')
    await page.locator('#accAdd').scrollIntoViewIfNeeded(); await pic(s, 'a1-add-form'); await tap(s, page.locator('#accAdd')); await page.waitForTimeout(600)
    rec('S56 toast after Add', await toast(s))
    const after = await pids(s); const nw = after.filter(x => !before.includes(x)); check('S56 one new row', nw.length === 1, nw); zid = nw[0]
    check('S56 his row reads his name', /Quokka/.test((await rowText(s, zid)) || ''), await rowText(s, zid))
    check('S56 the Add form emptied', (await page.inputValue('#accAddCs')) === '', await page.inputValue('#accAddCs'))
  })
  await step('S56 found by search and Filter', async () => {
    await page.fill(SEARCH, 'quokka'); await page.waitForTimeout(250); const n = await page.evaluate(() => [...document.querySelectorAll('#page-admin [data-person]')].filter(r => r.getBoundingClientRect().height > 0).map(r => r.dataset.person))
    check('S56 search finds him alone', n.length === 1 && n[0] === zid, n); await pic(s, 'a2-search'); await page.fill(SEARCH, ''); await page.waitForTimeout(200)
    await tick(s, 'OCU'); await closeF(s); const v = await page.evaluate(id => { const r = document.querySelector(`#page-admin [data-person="${id}"]`); return !!r && r.getBoundingClientRect().height > 0 }, zid); rec('S56 the OCU tick shows him', v)
    await openF(s); await page.locator('#accFilterClear').click(); await page.waitForTimeout(160); await closeF(s)
  })
  await step('S56 the row, the roles table, Save, Cancel, Escape', async () => {
    await openRow(s, zid); const h = page.locator(`[data-person="${zid}"] summary`, { hasText: 'What each role allows' }).first()
    await tap(s, h); await page.waitForTimeout(200); const opn = await page.evaluate(() => [...document.querySelectorAll('#page-admin summary')].find(e => /What each role allows/.test(e.textContent))?.closest('details')?.open); check('S56 the roles table opens', opn === true, opn); await pic(s, 'a3-roles')
    await tap(s, h); await page.waitForTimeout(160); const cl = await page.evaluate(() => [...document.querySelectorAll('#page-admin summary')].find(e => /What each role allows/.test(e.textContent))?.closest('details')?.open); check('S56 the roles table closes', cl === false, cl)
    await page.fill('#accEdName', 'quokka-cancel'); await tap(s, page.locator('#accEdCancel')); await page.waitForTimeout(220); check('S56 Cancel drops the name', (await who(s, zid)).name === 'quokka1', (await who(s, zid)).name)
    await openRow(s, zid); await page.fill('#accEdName', 'quokka-esc'); await page.keyboard.press('Escape'); await page.waitForTimeout(220); check('S56 Escape drops the name', (await who(s, zid)).name === 'quokka1', (await who(s, zid)).name)
    await editRow(s, zid, [{ name: 'quokka2' }, { line: ['149', 'view'] }]); await saveRow(s); await page.waitForTimeout(180); rec('S56 hover after Save', (await tips(s)).undo?.title)
    const w = await who(s, zid); check('S56 Save kept name and View', w.name === 'quokka2' && w.lines['149'] === 'view', w)
  })
  await step('S56 the new sign-in works; the old one does not', async () => {
    await logout(s); await tryIn(s, 'quokka1', 'x'); const old = await words(s); rec('S56 old sign-in', old); check('S56 old sign-in does not reach the app', /Request access|Sign in|Waiting/.test(old) && !(await page.locator('#topnav').filter({ visible: true }).count() && /View-only/.test(old)), old.slice(0, 60))
    if (await page.locator('#accOut').count()) await page.locator('#accOut').first().click()
    await signIn(s, 'quokka2', 'x'); const st = await state(s); rec('S56 Quokka signed in', { page: st.page, bar: st.barMark || st.dMark, tabs: st.tabs.length ? st.tabs : st.items }); check('S56 Quokka reaches his schedule', st.page === 'page-viewsched', st.page)
    await pic(s, 'a4-quokka-in')
    await bell.open(s); const L = await bell.lines(s); rec('S56 Quokka bell', L.slice(0, 3)); check('S56 his bell says View of 149', L.some(x => /View of 149/.test(x)), L.slice(0, 2)); await bell.close(s)
    await pickSq(s, '149'); await shut(s); await page.waitForTimeout(300); const v = await state(s); rec('S56 Quokka viewing 149', { page: v.page, bar: v.barMark || v.dMark, tabs: v.tabs.length ? v.tabs : v.items }); check('S56 a View holder gets no Admin on 149', !(v.tabs.includes('admin') || v.items.includes('admin')), v.tabs.length ? v.tabs : v.items); await pic(s, 'a5-quokka-149')
    await logout(s); await signIn(s, 'ad', 'a'); await toUsers(s)
  })
  await step('S56 Suspend and restore', async () => {
    await openRow(s, zid); const b = page.locator('#accEdOnOff'); const w0 = await b.textContent(); await tap(s, b); await page.waitForTimeout(350); if (await page.locator('#dlgOk:visible').count()) { rec('S56 suspend asks', await page.locator('#dlgMsg').textContent()); await tap(s, page.locator('#dlgOk')); await page.waitForTimeout(300) }
    rec('S56 suspended row', await rowText(s, zid)); await pic(s, 'a6-suspended')
    await logout(s); await tryIn(s, 'quokka2', 'x'); const off = await words(s); rec('S56 suspended sign-in', off); check('S56 suspended cannot sign in', !(await page.locator('#vWeek .day').count()), off.slice(0, 70)); await pic(s, 'a7-suspended-signin')
    if (await page.locator('#accOut').count()) await page.locator('#accOut').first().click(); await signIn(s, 'ad', 'a'); await toUsers(s)
    await openRow(s, zid); const r = page.locator('#accEdOnOff'); const w1 = await r.textContent(); rec('S56 button on a suspended row', { before: w0, now: w1 }); await tap(s, r); await page.waitForTimeout(350); if (await page.locator('#dlgOk:visible').count()) { await tap(s, page.locator('#dlgOk')); await page.waitForTimeout(300) }
    await logout(s); await signIn(s, 'quokka2', 'x'); check('S56 restored can sign in', (await state(s)).page === 'page-viewsched', (await state(s)).page); await logout(s); await signIn(s, 'ad', 'a'); await toUsers(s)
  })
  await step('S56 Archive, restore, Delete', async () => {
    await openRow(s, zid); await tap(s, page.locator('#accEdArchive')); await page.waitForTimeout(350); if (await page.locator('#dlgOk:visible').count()) { rec('S56 archive asks', await page.locator('#dlgMsg').textContent()); await tap(s, page.locator('#dlgOk')); await page.waitForTimeout(350) }
    const g = page.locator('#page-admin button, #page-admin summary', { hasText: /Archived/ }).filter({ visible: true }).first(); rec('S56 archived group', await g.textContent()); await tap(s, g); await page.waitForTimeout(250)
    const ar = page.locator(`#page-admin [data-person="${zid}"] .acc-tap`).first(); await ar.scrollIntoViewIfNeeded(); await tap(s, ar); await page.waitForTimeout(280); await pic(s, 'a8-archived')
    await tap(s, page.locator('#accArRestore')); await page.waitForTimeout(450); if (await page.locator('#dlgOk:visible').count()) { rec('S56 restore asks', await page.locator('#dlgMsg').textContent()); await tap(s, page.locator('#dlgOk')); await page.waitForTimeout(350) }
    rec('S56 toast after restore', await toast(s)); check('S56 back on the list', !!(await rowText(s, zid)), await rowText(s, zid))
    await openRow(s, zid); const d = page.locator('#accEdDel'); await tap(s, d); await page.waitForTimeout(220); const armed = await d.textContent(); rec('S56 Delete armed', armed); await tap(s, d); await page.waitForTimeout(500); if (await page.locator('#dlgOk:visible').count()) { rec('S56 delete asks', await page.locator('#dlgMsg').textContent()); await tap(s, page.locator('#dlgOk')); await page.waitForTimeout(350) }
    check('S56 Delete took him off', !(await pids(s)).includes(zid), (await pids(s)).includes(zid)); await pic(s, 'a9-deleted')
    await logout(s); await tryIn(s, 'quokka2', 'x'); const off = await words(s); rec('S56 a deleted person signs in', off.slice(0, 100)); check('S56 deleted person does not reach the app', !(await page.locator('#vWeek .day').count()), off.slice(0, 60)); if (await page.locator('#accOut').count()) await page.locator('#accOut').first().click()
  })
  await step('S56 what a member and an admin of one squadron are offered', async () => {
    await signIn(s, 'us', 'us'); const m = await state(s); const mt = m.tabs.length ? m.tabs : m.items; check('S56 a member has no Admin', !mt.includes('admin'), mt); rec('S56 member pages', mt); await logout(s)
    await signIn(s, 'ad2', 'a2'); await toUsers(s); const lines = await page.evaluate(() => [...document.querySelectorAll('#accFilterPanel button')].length); await openRow(s, 'bane')
    const a = await page.evaluate(() => { const r = document.querySelector('#accEdRole'); return r ? [...r.options].map(o => o.value + (o.disabled ? '(off)' : '')) : null }); rec('S56 Hunter (admin of 142) role choices', a); check('S56 own admin cannot make a master admin', !(a || []).includes('master') || (a || []).includes('master(off)'), a)
    await page.locator('#accEdCancel').click(); await page.waitForTimeout(200); await logout(s)
  })
  await s.ctx.close()
} finally { finish('jc-s56-' + SZ); await closeAll() }
