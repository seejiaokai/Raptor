// r-e (chat 151, the re-walk) — scenario e: Hunter (admin of 142, View of 149) with an access request to 142 waiting in
// his bell, 149 picked (View only): a press on the request (the lit bell, and the request's line where the bell's list
// shows one) → 142 back in view, Admin → Users open, its waiting count 142's. The request is made through the app's own
// controls: a new person signs up asking for 142. SZ=d (desktop 1536) or SZ=p (WebKit phone).
import { serve, stop, newPage, signIn, as, logout, step, rec, pic, picsFor, press, menuPick, barPick, go, grant, finish, note, facts, state } from './vlib.mjs'
import { check, shutMenu, T } from './r-lib.mjs'
const SZ = process.env.SZ || 'd'
console.log('r-e-request v1', SZ)
picsFor('r-e-' + SZ)
const pick = (s, n, name) => s.desk ? barPick(s, n, name) : menuPick(s, n, name)
const waiting = s => s.page.evaluate(() => [...document.querySelectorAll('#admWaiting [data-req]')].filter(r => r.getBoundingClientRect().height > 0).map(r => r.textContent.replace(/\s+/g, ' ').trim().slice(0, 60)))
const adminPanel = s => s.page.evaluate(() => { const c = document.querySelector('#page-admin .adm-cat.on .adm-cat-l'); return c ? c.textContent.replace(/\d+$/, '').trim() : null })
const toast = s => s.page.evaluate(() => { const t = document.querySelector('#toastEl'); return t && t.getBoundingClientRect().height > 0 ? t.textContent.replace(/\s+/g, ' ').trim() : null })
await serve()
try {
  const s = await newPage(SZ)
  const { page } = s
  await signIn(s, 'ad', 'a')
  await step('grant Hunter View of 149', async () => { await grant(s, 'prowler', '149', 'view'); await go(s, 'viewsched'); await shutMenu(s) })
  await logout(s)
  await step('a new person asks for 142', async () => {
    await signIn(s, 'viper@mail', 'v1', { pending: true })
    await page.waitForSelector('#accForm', { timeout: 10000 })
    await page.selectOption('#accSqn', { label: '142' })
    await page.fill('#accCs', 'Viper'); await page.fill('#accIni', 'VP'); await page.selectOption('#accSeat', { label: 'Pilot' }); await page.waitForTimeout(200)
    const o = await page.evaluate(() => [...document.querySelectorAll('#accCat option')].map(o => o.value).filter(v => v)); if (o.length) await page.selectOption('#accCat', o[0])
    await pic(s, 'e-01-request-form', ['#accForm'])
    await page.click('#accSend'); await page.waitForTimeout(800)
    await pic(s, 'e-02-sent')
    await logout(s)
  })
  await step('Hunter: 149 picked, the request in the bell', async () => {
    await signIn(s, 'ad2', 'a2')
    await pick(s, '149', 'e-03-pick'); await shutMenu(s)
    const st = await rec(s, 'e-a-149'); await pic(s, 'e-03-149-picked')
    check('premise: 149 in view, View only', st.barMark?.startsWith('149') && (st.tabs.length === 2 || st.items.length === 2), { mark: st.barMark, tabs: st.tabs, items: st.items })
    facts['e-bell-lit'] = await page.evaluate(() => { const b = [...document.querySelectorAll('#notifyBell')].find(e => e.getBoundingClientRect().width > 0); return b ? b.className : null })
    note('bell:', facts['e-bell-lit'])
    await press(s, '#notifyBell', 'e-04-bell')
    const t1 = await toast(s)
    let st1 = await rec(s, 'e-b-after-bell'); await pic(s, 'e-04-after-bell')
    const lines = await page.evaluate(() => [...document.querySelectorAll('[data-testid="bell-list"] .bl-line')].filter(l => l.getBoundingClientRect().height > 0).map(l => l.textContent.replace(/\s+/g, ' ').trim().slice(0, 90)))
    facts['e-bell'] = { toast: t1, page: st1.page, lines }; note('after the bell:', JSON.stringify(facts['e-bell']))
    if (st1.page !== 'page-admin' && lines.length) {
      /* the bell opened its list: the request's line pressed */
      const ln = page.locator('[data-testid="bell-list"] .bl-line', { hasText: /Viper|access|waiting/i }).filter({ visible: true }).first()
      if (await ln.count()) { await press(s, ln, 'e-05-line'); st1 = await rec(s, 'e-c-after-line'); facts['e-line-toast'] = await toast(s); await pic(s, 'e-05-after-line') }
      else note('no request line in the bell list')
    }
    const panel = await adminPanel(s), w = await waiting(s)
    facts['e-landed'] = { page: st1.page, mark: st1.barMark, panel, waiting: w, toast: await toast(s) || t1 }
    note('landed:', JSON.stringify(facts['e-landed']))
    check('e: 142 back in view', st1.barMark?.startsWith('142'), st1.barMark)
    check('e: Admin → Users open', st1.page === 'page-admin' && /Users/.test(panel || ''), { page: st1.page, panel })
    check('e: its waiting list is 142\'s — Viper waiting', w.some(x => /Viper/i.test(x)), w)
    check('e: no band on the page', !(await page.evaluate(() => [...document.querySelectorAll('.moveband')].some(b => b.getBoundingClientRect().width > 0))), 'moveband')
    await pic(s, 'e-06-landed')
  })
  await s.ctx.close()
} finally { finish('r-e-' + SZ); await stop() }
