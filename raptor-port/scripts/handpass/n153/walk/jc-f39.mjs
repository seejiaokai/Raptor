// jc-f39 - S39 (only the Squadron ticks clear at a pick, by the top bar's list, the ☰ menu and the bell, with Users hidden or the
// Filter open, and the same squadron picked again) and S40 (what Plans means on each squadron's list).
import { signIn, newPage, closeAll, finish, step, pic, picsFor, note, check, facts, pickSq, go, logout, state, shut } from './jlib.mjs'
import { toUsers, editRow, saveRow, bell, who } from './jc-lib.mjs'
import { look, ticks, openF, closeF, tick, SEARCH, tap } from './jc-flib.mjs'
const SZ = process.env.SZ || 'd'
console.log('jc-f39 v1', SZ)
picsFor('jc-f39-' + SZ)
const rec = (k, v) => { facts[k] = v; note(`RECORD ${k}: ${typeof v === 'string' ? v : JSON.stringify(v)}`) }
/* a row's name without the small squadron mark an outsider's row carries beside it ("Hunter" + "142") */
const names = s => s.page.evaluate(() => [...document.querySelectorAll('#page-admin [data-person]')].filter(r => r.getBoundingClientRect().height > 0).map(r => (r.querySelector('.acc-name') || r).textContent.trim().split(/\s+/)[0].replace(/\d+$/, '')))
const allTicks = async s => { await openF(s); const t = (await ticks(s) || []).map(x => x.replace(/^✓\s*/, '')); return t }
const setTicks = async s => { for (const x of ['Pilots', 'C', 'Member', '149']) await tick(s, x); await s.page.fill(SEARCH, 'a'); await s.page.waitForTimeout(200) }
const KEPT = ['Pilots', 'C', 'Member']
async function judge(s, tag) {
  const t = await allTicks(s); const q = await s.page.inputValue(SEARCH)
  rec(`S39 ${tag} ticks after`, t)
  check(`S39 ${tag} Squadron ticks cleared`, !t.includes('142') && !t.includes('149'), t)
  check(`S39 ${tag} Seat, CAT, Role kept`, KEPT.every(k => t.includes(k)) && t.length === 3, t)
  check(`S39 ${tag} search kept`, q === 'a', q)
  await closeF(s); const l = await look(s); check(`S39 ${tag} count follows`, l.label === 'Filter · 3', l.label)
}
async function ask142(s, cs) {
  const { page } = s
  await page.goto(`http://localhost:${process.env.MQ_PORT}/`); await page.waitForSelector('#luser'); await page.fill('#luser', `${cs}@mail`); await page.fill('#lpass', 'x')
  await page.click('#loginForm button[type=submit]'); await page.waitForSelector('#accForm')
  await page.selectOption('#accSqn', { label: '142' }); await page.fill('#accCs', cs); await page.fill('#accIni', 'ZZ'); await page.selectOption('#accSeat', { index: 1 }); await page.selectOption('#accCat', { index: 1 })
  await page.click('#accSend'); await page.waitForSelector('#accessWaiting'); await page.locator('#accOut').first().click(); await page.waitForSelector('#luser'); await page.waitForTimeout(200)
}
try {
  const s = await newPage(SZ); const { page } = s
  await signIn(s, 'ad', 'a'); await toUsers(s)
  await step('S39 pick by the size\'s own door', async () => {
    await setTicks(s); await closeF(s); rec('S39 set', await look(s).then(l => ({ label: l.label, showing: l.showing })))
    await pic(s, 's39-1-set')
    await pickSq(s, '149'); await shut(s); await page.waitForTimeout(300)
    const st = await state(s); rec('S39 after pick', { page: st.page, bar: st.barMark })
    await pic(s, 's39-2-picked'); await judge(s, 'direct pick')
  })
  await step('S39 pick with the Filter panel open', async () => {
    await tick(s, '142'); await openF(s); await pic(s, 's39-3-open-before')
    await pickSq(s, '142'); await shut(s); await page.waitForTimeout(300); await pic(s, 's39-4-open-after')
    rec('S39 panel open after the pick', await page.locator('#accFilterPanel').count())
    await judge(s, 'Filter open')
  })
  await step('S39 control: leave Users and come back with no pick', async () => {
    await tick(s, '142'); await closeF(s); const b4 = await allTicks(s); await closeF(s); const q4 = await page.inputValue(SEARCH)
    rec('S39 control before leaving', { t: b4, q: q4 })
    await go(s, 'inputs'); await shut(s); await page.waitForTimeout(350)
    await toUsers(s); const t = await allTicks(s); await closeF(s); const q = await page.inputValue(SEARCH)
    rec('S39 control after leaving and returning, no pick', { t, q })
    facts.leaveClears = t.length === 0
  })
  await step('S39 pick while Users is hidden', async () => {
    /* set again what the control's leave may have cleared */
    for (const x of ['Pilots', 'C', 'Member']) if (!(await allTicks(s)).includes(x)) await tick(s, x)
    if (!(await allTicks(s)).includes('142')) await tick(s, '142')
    await page.fill(SEARCH, 'a'); await page.waitForTimeout(150)
    await closeF(s); await go(s, 'inputs'); await shut(s); await page.waitForTimeout(350)
    await pickSq(s, '149'); await shut(s); await page.waitForTimeout(300)
    await toUsers(s)
    if (facts.leaveClears) { const t = await allTicks(s); await closeF(s); rec('S39 Users hidden: all ticks after (leaving Users clears them in itself)', t); check('S39 Users hidden: no Squadron tick survives', !t.includes('142') && !t.includes('149'), t) }
    else await judge(s, 'Users hidden')
  })
  await step('S39 same squadron again', async () => {
    await tick(s, '142'); await closeF(s); const before = await allTicks(s); await closeF(s); rec('S39 before same-squadron pick', before)
    await pickSq(s, '149'); await shut(s); await page.waitForTimeout(300)
    const after = await allTicks(s); await closeF(s); rec('S39 same-squadron pick leaves (RECORD)', after)
    const st = await state(s); check('S39 same-squadron pick stays on the page', st.page === 'page-admin', st.page)
  })
  await s.ctx.close()

  const b = await newPage(SZ)
  await step('S39 by the bell', async () => {
    await ask142(b, 'Zed')
    await signIn(b, 'ad', 'a'); await pickSq(b, '149'); await shut(b); await toUsers(b)
    await tick(b, 'Pilots'); await tick(b, 'C'); await tick(b, 'Member'); await tick(b, '142'); await b.page.fill(SEARCH, 'a'); await closeF(b)
    await b.page.locator('#notifyBell').filter({ visible: true }).first().click(); await b.page.waitForTimeout(650)
    const st = await state(b); const t = await b.page.evaluate(() => document.querySelector('#toastEl')?.textContent?.trim()); rec('S39 bell landed', { page: st.page, bar: st.barMark, toast: t })
    check('S39 bell landed on 142', /142/.test(st.barMark || st.dMark || ''), st.barMark || st.dMark); await pic(b, 's39-5-bell')
    await judge(b, 'bell')
  })
  await b.ctx.close()

  const u = await newPage(SZ); const p2 = u.page
  await signIn(u, 'ad', 'a')
  await step('S40 Plans on each list', async () => {
    await toUsers(u); await editRow(u, 'prowler', [{ line: ['149', 'plan'] }]); await saveRow(u); await p2.waitForTimeout(200)
    await pickSq(u, '149'); await shut(u); await toUsers(u)
    const l0 = await look(u); const hd = await p2.evaluate(() => [...document.querySelectorAll('#page-admin h4,#page-admin .adm-sub')].map(e => e.textContent.trim()).find(t => /^people/i.test(t)))
    rec('S40 149 people heading', hd); const all149 = await names(u); rec('S40 149 rows', all149.length)
    check('S40 outsider drawn on 149\'s list', all149.includes('Hunter'), all149.includes('Hunter'))
    await tick(u, 'Plans 149'); await closeF(u); const pl = await names(u); const lp = await look(u); rec('S40 Plans 149 finds', { pl, showing: lp.showing }); await pic(u, 's40-1-plans-149')
    check('S40 Plans 149 finds Hunter', pl.includes('Hunter'), pl)
    check('S40 Plans 149 finds no own member', !pl.includes('Kestrel') && !pl.includes('Osprey'), pl)
    await tick(u, 'Plans 149'); await closeF(u)
    for (const r of ['Admin', 'Member', 'Master admin']) {
      await tick(u, r); await closeF(u); const n = await names(u); const l = await look(u); rec(`S40 149 ${r}`, { n: n.slice(0, 12), showing: l.showing })
      if (r === 'Admin') check('S40 149 Admin finds its own admin', n.includes('Kestrel'), n)
      if (r === 'Member') check('S40 149 Member finds its member', n.includes('Osprey'), n)
      await tick(u, r); await closeF(u)
    }
    await pickSq(u, '142'); await shut(u); await toUsers(u)
    const chips = await p2.evaluate(() => [...document.querySelectorAll('#accFilterPanel button')].map(b => b.textContent.trim())); await openF(u)
    const list = await p2.evaluate(() => [...document.querySelectorAll('#accFilterPanel button')].map(b => b.textContent.trim().replace(/^✓\s*/, ''))); await closeF(u)
    rec('S40 142 chips', list); check('S40 one Plans tick, for the list in view', list.filter(x => /^Plans/.test(x)).length === 1 && list.includes('Plans 142'), list.filter(x => /^Plans/.test(x)))
    await tick(u, 'Plans 142'); await closeF(u); const none = await names(u); const ln = await look(u); rec('S40 Plans 142 finds', { n: none, showing: ln.showing }); await pic(u, 's40-2-plans-142')
    check('S40 Hunter is not an outsider of his own 142', !none.includes('Hunter'), none); await tick(u, 'Plans 142'); await closeF(u)
    await page2Search(u)
  })
  await u.ctx.close()
} finally { finish('jc-f39-' + SZ); await closeAll() }
async function page2Search(u) {
  await u.page.fill(SEARCH, 'Hunt'); await u.page.waitForTimeout(220); const n = await names(u); check('S40 search finds Hunter on 142', n.includes('Hunter'), n); await u.page.fill(SEARCH, ''); await u.page.waitForTimeout(150)
  await pickSq(u, '149'); await shut(u); await toUsers(u); await u.page.fill(SEARCH, 'Hunt'); await u.page.waitForTimeout(220); const m = await names(u); check('S40 search finds the outsider on 149', m.includes('Hunter'), m); await pic(u, 's40-3-search-149')
}
