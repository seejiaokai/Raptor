// u1 — the plain-user round (bug-check order §7.0a): Ranger with View of 149 and Hunter with Plan of 149, SZ=d (desktop
// 1536) or SZ=p (phone): the everyday tasks through ☰ and the top bar — every offered page opened, ☰ and its list
// opened and closed, each squadron picked and back, the bell and a line in it, sign out; a picture after each press.
import { serve, stop, newPage, signIn, as, step, rec, pic, picsFor, press, openMenu, closeMenuOutside, menuPick, barPick, go, grant, finish, note, facts, state } from './vlib.mjs'
const SZ = process.env.SZ || 'd'
console.log('u1-plain v1', SZ)
picsFor('u1-' + SZ)
let n = 0
const P = (who, what) => `${who}-${String(++n).padStart(2, '0')}-${what}`
async function pickVia(s, num, who) {
  if (s.desk) await barPick(s, num)
  else { await menuPick(s, num, P(who, `pick${num}`)); await pic(s, P(who, `menu-after-pick${num}`)); await closeMenuOutside(s) }
}
async function round(s, who, home) {
  for (const num of [home, '149', home]) {
    await step(`${who} ${num}`, async () => {
      await pickVia(s, num, who)
      const st = await rec(s, `${who}-${num}-${n}`)
      const pages = s.desk ? st.tabs : st.items
      for (const p of pages) { await go(s, p, P(who, `go-${p}`)); await s.page.waitForTimeout(p === 'tracker' || p === 'leavewar' ? 1200 : 300); const v = await state(s); facts[`${who}-${num}-${p}`] = { page: v.page, mark: v.barMark }; await pic(s, P(who, `${num}-${p}`)) }
      await go(s, 'viewsched')
    })
  }
  await step(`${who} menu and its list open and close`, async () => {
    if (!(await state(s)).burger) { facts[`${who}-menu`] = 'no ☰ at this width'; return }
    await openMenu(s, P(who, 'menu-open')); await pic(s, P(who, 'menu-open'))
    if ((await state(s)).dBtn) {
      await press(s, '#drawerSqnBtn', P(who, 'list-open')); await rec(s, `${who}-list-open`); await pic(s, P(who, 'list-open'))
      await press(s, '#drawerSqnBtn', P(who, 'list-close')); await rec(s, `${who}-list-closed-by-mark`); await pic(s, P(who, 'list-closed'))
    }
    await closeMenuOutside(s, P(who, 'menu-shade')); await rec(s, `${who}-menu-closed`); await pic(s, P(who, 'menu-closed'))
  })
  await step(`${who} bell`, async () => {
    await press(s, '#notifyBell', P(who, 'bell')); await pic(s, P(who, 'bell-open'))
    facts[`${who}-bell-lines`] = await s.page.evaluate(() => [...document.querySelectorAll('[data-testid="bell-list"] .bl-line')].filter(l => l.getBoundingClientRect().height > 0).map(l => l.textContent.replace(/\s+/g, ' ').trim().slice(0, 80)))
    note(who, 'bell:', JSON.stringify(facts[`${who}-bell-lines`]))
    const ln = s.page.locator('[data-testid="bell-list"] .bl-line').filter({ visible: true }).first()
    if (await ln.count()) { await press(s, ln, P(who, 'bell-line')); await rec(s, `${who}-after-bell-line`); await pic(s, P(who, 'after-bell-line')) }
    await s.page.keyboard.press('Escape'); await s.page.waitForTimeout(300)
    await go(s, 'viewsched')
  })
  await step(`${who} sign out`, async () => {
    if (s.desk) await press(s, '#logout'); else { await openMenu(s); await press(s, '#drawerLogout', P(who, 'logout')) }
    await s.page.waitForSelector('#luser', { timeout: 20000 }); await pic(s, P(who, 'signed-out'))
  })
}
await serve()
try {
  const s = await newPage(SZ)
  await signIn(s, 'ad', 'a')
  await step('grants', async () => { await grant(s, 'bane', '149', 'view'); await grant(s, 'prowler', '149', 'plan'); await go(s, 'viewsched') })
  await as(s, 'us', 'us')
  await round(s, 'ranger', '142')
  await signIn(s, 'ad2', 'a2')
  await round(s, 'hunter', '142')
  await s.ctx.close()
} finally { finish('u1-' + SZ); await stop() }
