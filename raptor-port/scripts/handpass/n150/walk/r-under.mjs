// r-under (chat 151, the re-walk) — a lead from r-p2's S23 (the copy of p2): with the ☰ list open, a press on Logout
// closed the list and moved the menu's lines up under the finger, and no sign-out came. Now that the list opens under the
// mark (fix 1), every line below it moves up when it closes. What does a press on a line below the open list do —
// nothing but close the list (as "a press elsewhere closes the list first, the menu still open"), or the control that
// slid under the finger? Hunter (Plan of 149, nine pages) on 142, the list open, then a press on each of: Inputs, Help,
// Logout — the page reached, the squadron, whether signed out, read after each, with the lines' places before and after.
// SZ=p WebKit phone (finger), SZ=c Chromium phone (finger), SZ=n Chromium 820 (mouse).
import { chromium } from '@playwright/test'
import { SIZES } from '../../n149/walk/lib.mjs'
import { serve, stop, newPage, signIn, as, step, rec, pic, picsFor, press, openMenu, go, grant, finish, note, facts, state } from './vlib.mjs'
import { check, shutMenu, quick } from './r-lib.mjs'
const SZ = process.env.SZ || 'p'
SIZES.c = { engine: chromium, desk: false, opts: { viewport: { width: 402, height: 874 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 } }
console.log('r-under v1', SZ)
picsFor('r-under-' + SZ)
const lines = s => s.page.evaluate(() => Object.fromEntries([...document.querySelectorAll('#drawerNav a[data-page], #drawerRole, #drawerLogout')].map(e => { const b = e.getBoundingClientRect(); return [e.dataset.page || e.id, { y: Math.round(b.top), h: Math.round(b.height), x: Math.round(b.left + 20) }] })))
await serve()
try {
  const s = await newPage(SZ)
  const { page } = s
  await signIn(s, 'ad', 'a')
  await step('grant', async () => { await grant(s, 'prowler', '149', 'plan'); await go(s, 'viewsched'); await shutMenu(s) })
  await as(s, 'ad2', 'a2')
  for (const target of ['inputs', 'help', 'drawerLogout']) {
    await step(`a press on ${target} with the list open`, async () => {
      if ((await state(s)).page !== 'page-viewsched') await go(s, 'viewsched')
      await shutMenu(s)
      await openMenu(s)
      const closedAt = await lines(s)
      await press(s, '#drawerSqnBtn')
      const openAt = await lines(s); const st0 = await state(s)
      check(`premise (${target}): list open, menu open, 142, View-only Sched`, !!st0.dList && st0.drawerOpen && st0.barMark?.startsWith('142') && st0.page === 'page-viewsched', { list: st0.dList, page: st0.page })
      await pic(s, `${target}-01-list-open`)
      const t = openAt[target]
      const x = t.x, y = t.y + t.h / 2
      const underAfter = Object.entries(closedAt).find(([, b]) => y >= b.y && y < b.y + b.h)?.[0] || 'blank'
      facts[`${target}-places`] = { pressAt: { x, y }, openAt: t, lineThereOnceClosed: underAfter }
      note(`${target}: pressed at y ${Math.round(y)}; with the list closed that point is on:`, underAfter)
      if (s.desk) await page.mouse.click(x, y); else await page.touchscreen.tap(x, y)
      if (!s.desk) await quick(s, `${target}-02-press`)
      await page.waitForTimeout(900)
      const signedOut = await page.locator('#luser').isVisible().catch(() => false)
      const st = signedOut ? null : await state(s)
      const res = signedOut ? 'signed out' : `page ${st.page}, menu ${st.drawerOpen ? 'open' : 'closed'}, list ${st.dList ? 'open' : 'closed'}, ${st.barMark}`
      facts[`${target}-result`] = res; note(`${target}: after the press —`, res)
      await pic(s, `${target}-03-after`)
      const wantPage = target === 'drawerLogout' ? null : `page-${target}`
      check(`a press on ${target} with the list open does not reach a DIFFERENT control (the one that slid under the finger)`,
        signedOut ? target === 'drawerLogout' : (st.page === 'page-viewsched' || st.page === wantPage),
        { res, lineThereOnceClosed: underAfter })
      check(`a press on ${target} with the list open does what was pressed (or the list only closes, the menu open)`,
        signedOut ? target === 'drawerLogout' : (st.page === wantPage || (!st.dList && st.drawerOpen && st.page === 'page-viewsched')), res)
      if (signedOut) await signIn(s, 'ad2', 'a2')
    })
  }
  await s.ctx.close()
} finally { finish('r-under-' + SZ); await stop() }
