// r-g (chat 151, the re-walk) — fix 7: signing out and in again starts with no leftover landing. Hunter (Plan of 149)
// picks 149, switches to the member view and signs out; Ranger signs in → his own squadron (142), his own pages, the ☰
// menu closed; Hunter signs in again → the admin view, 142. SZ=p (WebKit phone, ☰) or SZ=d (desktop 1536).
import { serve, stop, newPage, signIn, as, step, rec, pic, picsFor, press, openMenu, menuPick, barPick, go, grant, finish, note, facts, state } from './vlib.mjs'
import { check, shutMenu } from './r-lib.mjs'
const SZ = process.env.SZ || 'p'
console.log('r-g-signout v1', SZ)
picsFor('r-g-' + SZ)
const pick = (s, n, name) => s.desk ? barPick(s, n, name) : menuPick(s, n, name)
const pages = st => (st.tabs.length ? st.tabs : st.items)
await serve()
try {
  const s = await newPage(SZ)
  const { page } = s
  await signIn(s, 'ad', 'a')
  await step('grant Hunter Plan of 149', async () => { await grant(s, 'prowler', '149', 'plan'); await go(s, 'viewsched'); await shutMenu(s) })
  await as(s, 'ad2', 'a2')
  await step('Hunter: 149, member view, sign out', async () => {
    await pick(s, '149', 'g-01-pick'); await shutMenu(s)
    if (s.desk) await press(s, '#roleBadge'); else { await openMenu(s); await press(s, '#drawerRole', 'g-02-role') }
    await shutMenu(s)
    const st = await rec(s, 'g-a-before-signout'); await pic(s, 'g-02-member-view-149')
    check('premise: 149 in view, the member view', st.barMark?.startsWith('149') && (s.desk ? /MEMBER/i.test(st.badge || '') : /admin view/i.test(st.role || '')), { mark: st.barMark, badge: st.badge, role: st.role, page: st.page })
    if (s.desk) await press(s, '#logout'); else { await openMenu(s); await press(s, '#drawerLogout', 'g-03-logout') }
    await page.waitForSelector('#luser', { timeout: 20000 }); await page.waitForTimeout(400); await pic(s, 'g-03-signed-out')
  })
  await step('Ranger signs in', async () => {
    await signIn(s, 'us', 'us')
    const st = await rec(s, 'g-b-ranger-in'); await pic(s, 'g-04-ranger-in')
    check('Ranger: his own squadron 142', st.barMark?.startsWith('142'), st.barMark)
    check('Ranger: his own seven pages', pages(st).length === 7, pages(st))
    check('Ranger: the ☰ menu closed', !st.drawerOpen, st.drawerOpen)
    check('Ranger: lands on View-only Sched', st.page === 'page-viewsched', st.page)
    if (!s.desk) { await openMenu(s, 'g-05-ranger-menu'); const m = await rec(s, 'g-c-ranger-menu'); await pic(s, 'g-05-ranger-menu'); check('Ranger menu: one squadron, 142 · Your squadron, no list', !m.dBtn && m.dLine === '142 · Your squadron' && !m.dList, { dBtn: m.dBtn, line: m.dLine, list: m.dList }); await shutMenu(s) }
  })
  await step('Hunter signs in again', async () => {
    await as(s, 'ad2', 'a2')
    const st = await rec(s, 'g-d-hunter-again'); await pic(s, 'g-06-hunter-again')
    check('Hunter: 142', st.barMark?.startsWith('142'), st.barMark)
    check('Hunter: the admin view (nine pages)', pages(st).length === 9, pages(st))
    if (s.desk) check('Hunter: badge reads the admin view', !/MEMBER/i.test(st.badge || ''), st.badge)
    else { await openMenu(s); const m = await rec(s, 'g-e-hunter-menu'); await pic(s, 'g-07-hunter-menu'); check('Hunter menu: "Switch to the member view" offered, 142 · Your squadron', /member view/i.test(m.role || '') && m.dLine === '142 · Your squadron', { role: m.role, line: m.dLine }); await shutMenu(s) }
  })
  await s.ctx.close()
} finally { finish('r-g-' + SZ); await stop() }
