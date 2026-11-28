// r-d (chat 151, the re-walk) — scenario d: Ranger (View of 149), 149 picked, presses a bell line about his own page →
// 142 back in view, the page the line names opened (on the right row, where it names one), no band. The fresh demo world
// gives Ranger no such line (only "Given View of 149", which opens nothing), so one is made through the app's controls:
// Saber opens December for bidding on 142's Leave War → Ranger's bell gets "Leave War 1 Dec – 31 Dec · Bidding open".
// SZ=d (desktop 1536) or SZ=p (WebKit phone).
import { serve, stop, newPage, signIn, as, step, rec, pic, picsFor, press, menuPick, barPick, go, grant, finish, note, facts, state } from './vlib.mjs'
import { check, shutMenu, T, wins } from './r-lib.mjs'
const SZ = process.env.SZ || 'd'
console.log('r-d-bellline v1', SZ)
picsFor('r-d-' + SZ)
const pick = (s, n, name) => s.desk ? barPick(s, n, name) : menuPick(s, n, name)
const shown = (s, sel) => s.page.evaluate(sel => [...document.querySelectorAll(sel)].some(e => e.getBoundingClientRect().width > 0), sel)
await serve()
try {
  const s = await newPage(SZ)
  const { page } = s
  await signIn(s, 'ad', 'a')
  await step('Saber: View of 149 to Ranger; December opened for bidding on 142', async () => {
    await grant(s, 'bane', '149', 'view'); await go(s, 'viewsched'); await shutMenu(s)
    await go(s, 'leavewar'); await page.waitForTimeout(1500)
    await press(s, T('open-chip')); await press(s, T('od-month-2026-12'))
    if (await shown(s, T('od-apply'))) await press(s, T('od-apply'))
    await pic(s, 'd-01-saber-opened-december')
    if (await shown(s, T('open-dates-close'))) await press(s, T('open-dates-close'))
    await page.keyboard.press('Escape'); await page.waitForTimeout(300)
    await go(s, 'viewsched'); await shutMenu(s)
  })
  await as(s, 'us', 'us')
  await step('Ranger: 149, then the bell line', async () => {
    await pick(s, '149', 'd-02-pick'); await shutMenu(s)
    const st0 = await rec(s, 'd-a-149'); check('premise: 149 in view', st0.barMark?.startsWith('149'), st0.barMark)
    await press(s, '#notifyBell', 'd-03-bell')
    const lines = await page.evaluate(() => [...document.querySelectorAll('[data-testid="bell-list"] .bl-line')].filter(l => l.getBoundingClientRect().height > 0).map(l => l.textContent.replace(/\s+/g, ' ').trim().slice(0, 90)))
    facts['d-lines'] = lines; note('bell lines:', JSON.stringify(lines)); await pic(s, 'd-03-bell-open')
    const ln = page.locator('[data-testid="bell-list"] .bl-line', { hasText: /Leave War/ }).filter({ visible: true }).first()
    if (!(await ln.count())) { check('premise: a Leave War line in Ranger\'s bell', false, lines); return }
    await press(s, ln, 'd-04-line'); await page.waitForTimeout(1200)
    const st = await rec(s, 'd-b-after-line'); const w = await wins(s)
    const band = await page.evaluate(() => [...document.querySelectorAll('.moveband')].filter(b => b.getBoundingClientRect().width > 0).map(b => b.textContent.trim()))
    const month = await page.evaluate(() => { const r = document.querySelector('[data-testid="cell-bane-2026-12-09"]'); if (!r) return null; const b = r.getBoundingClientRect(); return { x: Math.round(b.left), inView: b.left >= 0 && b.right <= innerWidth } })
    facts['d-landed'] = { page: st.page, mark: st.barMark, windows: w, band, rangerDec9: month }; note('landed:', JSON.stringify(facts['d-landed']))
    await pic(s, 'd-04-after-line')
    check('d: 142 back in view', st.barMark?.startsWith('142'), st.barMark)
    check('d: his Leave War open', st.page === 'page-leavewar', st.page)
    check('d: no band', band.length === 0, band)
    check('d: Ranger\'s own row there (his 9 Dec cell drawn)', !!month, month)
  })
  await s.ctx.close()
} finally { finish('r-d-' + SZ); await stop() }
