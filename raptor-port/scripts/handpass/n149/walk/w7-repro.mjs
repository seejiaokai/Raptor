// Walk step 7 — the second reproduction of the walk's findings, the "bell open" case with two tabs of one browser, and
// the members' plain-user round.
//  (a) the phone menu (☰) offers "Edit Schedule" to a View holder with 149 picked; tapping it lands on View-only Sched
//  (b) Admin → Data's "Clear old clutter…" offered to a View holder with 149 picked, a press does nothing (phone)
//  (c) Hunter (Plan of 149) with his bell open in one tab; Saber, in a second tab of the same browser, takes his Plan
//  (d) Ranger (desktop) and Osprey (phone): every tab, the bell opened and closed, the menu's absence, sign-out
import { serve, stop, newPage, signIn, shot, pick, menuRows, note, save, errs, facts, text, vis, SIZES } from './lib.mjs'
import { navTo, adminCat, openRow, lineBtn, toastText, bellOpen, bellLines, bellClose, tabsShown, liveControls } from './w1-view.mjs'

async function step(name, fn) { try { await fn() } catch (e) { note(`STEP FAILED ${name}: ${String(e).split('\n')[0]}`); facts[`fail:${name}`] = String(e).split('\n')[0] } }
async function logout(s) {
  const { page } = s
  if (await page.locator('#logout:visible').count()) await page.click('#logout')
  else { await page.click('#burger'); await page.waitForTimeout(300); await page.click('#drawerLogout') }
  await page.waitForSelector('#luser', { timeout: 20000 }); await page.waitForTimeout(500)
}
async function giveHunter(s, level) {
  await adminCat(s, 'Users'); await openRow(s, 'prowler'); await s.page.click(lineBtn('149', level)); await s.page.click('#accEdSave'); await s.page.waitForTimeout(700)
}

await serve()
try {
  // (a) and (b) on the phone, twice over two fresh browsers
  for (const run of [1, 2]) {
    const s = await newPage('p'); const P = `w7-p-r${run}`
    await signIn(s, 'ad', 'a'); await step('give view', () => giveHunter(s, 'view')); await logout(s); await signIn(s, 'ad2', 'a2')
    await step('a drawer', async () => {
      await pick(s, '149')
      await s.page.click('#burger'); await s.page.waitForTimeout(400)
      facts[`${P}-drawer`] = await s.page.evaluate(() => [...document.querySelectorAll('#drawerNav a')].map(a => a.textContent.trim()))
      await shot(s, `${P}-a1-drawer-149-view.png`)
      await s.page.locator('#drawerNav a[data-page="editsched"]').click(); await s.page.waitForTimeout(800)
      facts[`${P}-landed`] = await s.page.evaluate(() => document.querySelector('.page.on').id)
      await shot(s, `${P}-a2-after-tap-edit.png`)
    })
    await step('b data', async () => {
      await adminCat(s, 'Data')
      await s.page.click('#admWipeDate'); await s.page.waitForTimeout(400)
      const day = s.page.locator('.dcal button:not([disabled]), [data-iso]:not([disabled])').filter({ hasText: /^\d{1,2}$/ })
      if (await day.count()) { await day.nth(5).click(); await s.page.waitForTimeout(400) }
      facts[`${P}-wipe-enabled`] = await s.page.evaluate(() => !document.querySelector('#admWipe').disabled)
      await s.page.locator('#admWipe').scrollIntoViewIfNeeded()
      await s.page.click('#admWipe'); await s.page.waitForTimeout(100)
      await shot(s, `${P}-b1-data-press.png`)
      await s.page.waitForTimeout(600)
      facts[`${P}-wipe-after`] = { label: await text(s, '#admWipe'), toast: await toastText(s) }
    })
    await s.ctx.close()
  }
  // (c) two tabs of one browser
  await step('c two tabs', async () => {
    const A = await newPage('d'); const P = 'w7-d-tabs'
    await signIn(A, 'ad', 'a'); await giveHunter(A, 'plan'); await logout(A); await signIn(A, 'ad2', 'a2')
    await pick(A, '149'); await navTo(A, 'Edit Schedule')
    await bellOpen(A); facts[`${P}-A-bell-before`] = await bellLines(A)
    const pB = await A.ctx.newPage(); const B = { ctx: A.ctx, page: pB, sz: 'd', desk: true }
    pB.on('dialog', d => d.accept().catch(() => {}))
    await signIn(B, 'ad', 'a'); await giveHunter(B, 'none'); facts[`${P}-B-toast`] = await toastText(B)
    await A.page.bringToFront(); await A.page.waitForTimeout(3000)
    facts[`${P}-A-after-3s`] = { lines: await bellLines(A), mark: await text(A, '#sqnMenuBtn'), page: await A.page.evaluate(() => document.querySelector('.page.on').id), tabs: await tabsShown(A) }
    await shot(A, `${P}-c1-A-after.png`)
    await bellClose(A); await bellOpen(A); facts[`${P}-A-bell-reopened`] = await bellLines(A); await bellClose(A)
    facts[`${P}-A-menu`] = await menuRows(A)
    // a press on the Edit Schedule page: does it save into 149?
    await A.ctx.close()
  })
  // (d) members' round
  for (const [sz, u, p, who] of [['d', 'us', 'us', 'ranger'], ['p', 'us9', 'us9', 'osprey']]) {
    await step(`d round ${who}`, async () => {
      const s = await newPage(sz); const P = `w7-${sz}-${who}`
      await signIn(s, u, p)
      facts[`${P}-menu`] = await menuRows(s); facts[`${P}-mark`] = await s.page.evaluate(() => { const e = document.querySelector('.sqnmark, #sqnMark, [data-testid="sqn-mark"]'); return e ? e.textContent.trim() : null })
      facts[`${P}-tabs`] = await tabsShown(s)
      for (const t of facts[`${P}-tabs`]) {
        if (!(await navTo(s, t))) continue
        if (t === 'Tracker') await s.page.waitForTimeout(2000)
        facts[`${P}-page-${t}`] = await s.page.evaluate(() => { const p = document.querySelector('.page.on'); return p ? p.id + ' · ' + p.innerText.replace(/\s+/g, ' ').slice(0, 90) : null })
        await shot(s, `${P}-${t.replace(/\W+/g, '')}.png`)
      }
      await bellOpen(s); facts[`${P}-bell`] = await bellLines(s); facts[`${P}-bell-show`] = await text(s, '[data-testid="bell-show"]'); await bellClose(s)
      await logout(s); facts[`${P}-out`] = await vis(s, '#luser')
      await s.ctx.close()
    })
  }
} finally { save('w7'); await stop() }
console.log('errs', errs.length, errs.slice(0, 10))
