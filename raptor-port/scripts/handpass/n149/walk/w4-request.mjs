// Walk step 4 — Request access as a new person to 149; who sees it (Hunter 142 only: not; Kestrel: yes; Hunter with
// Plan of 149: yes, his bell's tap entering 149 with its toast); Kestrel gives access; the new man signs in, a 149 man.
import { serve, stop, newPage, signIn, shot, pick, menuRows, note, save, errs, facts, text, vis } from './lib.mjs'
import { navTo, adminCat, openRow, lineBtn, toastText, bellOpen, bellLines, bellClose, tabsShown } from './w1-view.mjs'

const SZS = (process.env.SZ || 'd').split(',')
async function step(name, fn) { try { await fn() } catch (e) { note(`STEP FAILED ${name}: ${String(e).split('\n')[0]}`); facts[`fail:${name}`] = String(e).split('\n')[0] } }
async function logout(s) {
  const { page } = s
  if (await page.locator('#accOut:visible').count()) await page.click('#accOut')
  else if (await page.locator('#logout:visible').count()) await page.click('#logout')
  else { await page.click('#burger'); await page.waitForTimeout(300); await page.click('#drawerLogout') }
  await page.waitForSelector('#luser', { timeout: 20000 }); await page.waitForTimeout(500)
}
const waitingRows = s => s.page.evaluate(() => [...document.querySelectorAll('#admWaiting [data-req]')].map(r => r.textContent.replace(/\s+/g, ' ').trim().slice(0, 80)))
const badges = s => s.page.evaluate(() => [...document.querySelectorAll('.navbadge, #drawerWaitBadge, .belldot')].filter(e => e.getBoundingClientRect().width > 0).map(e => (e.id || e.className) + ':' + e.textContent.trim()))

await serve()
try {
  for (const sz of SZS) {
    const s = await newPage(sz)
    const P = `w4-${sz}`
    await step('viper asks 149', async () => {
      await signIn(s, 'viper@mail', 'v1', { pending: true })
      await s.page.waitForSelector('#accForm', { timeout: 10000 })
      facts[`${P}-sqn-options`] = await s.page.evaluate(() => [...document.querySelectorAll('#accSqn option')].map(o => `${o.value}=${o.textContent}`))
      facts[`${P}-sqn-default`] = await s.page.evaluate(() => document.querySelector('#accSqn').value)
      await s.page.selectOption('#accSqn', { label: '149' })
      await s.page.fill('#accCs', 'Viper'); await s.page.fill('#accIni', 'VP'); await s.page.selectOption('#accSeat', { label: 'Pilot' }); await s.page.waitForTimeout(200); { const o = await s.page.evaluate(() => [...document.querySelectorAll('#accCat option')].map(o => o.value).filter(v => v)); facts[P + '-cat-options'] = o; if (o.length) await s.page.selectOption('#accCat', o[0]) }
      await shot(s, `${P}-01-viper-form.png`, ['#accForm'])
      await s.page.click('#accSend'); await s.page.waitForTimeout(800)
      facts[`${P}-viper-after-send`] = await s.page.evaluate(() => document.body.innerText.replace(/\s+/g, ' ').slice(0, 300))
      await shot(s, `${P}-02-viper-sent.png`)
    })
    await logout(s); await signIn(s, 'ad2', 'a2')
    await step('hunter 142 only', async () => {
      facts[`${P}-hunter-badges`] = await badges(s)
      await bellOpen(s); facts[`${P}-hunter-bell`] = await bellLines(s); await bellClose(s)
      await adminCat(s, 'Users'); facts[`${P}-hunter-waiting`] = await waitingRows(s); facts[`${P}-hunter-nowait`] = await text(s, '#admNoWaiting')
      await shot(s, `${P}-03-hunter-waiting.png`, ['#admWaiting', '#admNoWaiting', 'h4.adm-sub'])
    })
    await logout(s); await signIn(s, 'us9', 'us9')
    await step('osprey member', async () => { facts[`${P}-osprey-badges`] = await badges(s); await bellOpen(s); facts[`${P}-osprey-bell`] = await bellLines(s); await bellClose(s) })
    await logout(s); await signIn(s, 'ad', 'a')
    await step('saber sees it?', async () => {
      facts[`${P}-saber-badges`] = await badges(s)
      await bellOpen(s); facts[`${P}-saber-bell`] = await bellLines(s); facts[`${P}-saber-bell-show`] = await text(s, '[data-testid="bell-show"]'); await shot(s, `${P}-04-saber-bell.png`, ['[data-testid="bell-list"]']); await bellClose(s)
      await adminCat(s, 'Users'); facts[`${P}-saber142-waiting`] = await waitingRows(s)
      await openRow(s, 'prowler'); await s.page.click(lineBtn('149', 'plan')); await s.page.click('#accEdSave'); await s.page.waitForTimeout(700)
    })
    await logout(s); await signIn(s, 'ad2', 'a2')
    await step('hunter plan: bell tap', async () => {
      facts[`${P}-hunterP-badges`] = await badges(s); facts[`${P}-hunterP-page0`] = await s.page.evaluate(() => document.querySelector('.page.on').id)
      await shot(s, `${P}-05-hunterP-arrive.png`)
      await s.page.locator('#notifyBell:visible').first().click(); await s.page.waitForTimeout(250)
      const toastNow = await toastText(s)
      await s.page.waitForTimeout(700)
      facts[`${P}-tap1`] = { toast: toastNow, toastLater: await toastText(s), mark: await text(s, '#sqnMenuBtn'), page: await s.page.evaluate(() => document.querySelector('.page.on').id), bellOpen: await vis(s, '[data-testid="bell-list"]'), waiting: await waitingRows(s) }
      await shot(s, `${P}-06-hunterP-after-tap1.png`)
      await s.page.locator('#notifyBell:visible').first().click(); await s.page.waitForTimeout(600)
      facts[`${P}-tap2`] = { bellOpen: await vis(s, '[data-testid="bell-list"]'), lines: await bellLines(s), badges: await badges(s) }
      await shot(s, `${P}-07-hunterP-after-tap2.png`); await bellClose(s)
    })
    await logout(s); await signIn(s, 'ad9', 'a9')
    await step('kestrel gives access', async () => {
      facts[`${P}-kestrel-badges`] = await badges(s)
      await adminCat(s, 'Users'); facts[`${P}-kestrel-waiting`] = await waitingRows(s)
      await shot(s, `${P}-08-kestrel-waiting.png`, ['#admWaiting', 'h4.adm-sub'])
      await s.page.locator('#admWaiting button[data-approve]').first().click(); await s.page.waitForTimeout(500)
      facts[`${P}-approve-form`] = await s.page.evaluate(() => { const f = document.querySelector('[data-approving]'); return f ? f.innerText.replace(/\s+/g, ' ').slice(0, 300) : null })
      await shot(s, `${P}-09-kestrel-approve-form.png`, ['[data-approving]'])
      await s.page.click('#apvGo'); await s.page.waitForTimeout(900)
      facts[`${P}-approve-toast`] = await toastText(s)
      facts[`${P}-kestrel-list-has-viper`] = await s.page.evaluate(() => /Viper/.test(document.querySelector('#page-admin').innerText))
      await shot(s, `${P}-10-kestrel-after.png`)
    })
    await logout(s); await signIn(s, 'viper@mail', 'v1')
    await step('viper signs in', async () => {
      facts[`${P}-viper-mark`] = await text(s, '#sqnMenuBtn'); facts[`${P}-viper-menu`] = await menuRows(s)
      facts[`${P}-viper-badge`] = await text(s, '#roleBadge')
      await navTo(s, 'Quals'); facts[`${P}-viper-quals-kestrel`] = await s.page.evaluate(() => /Kestrel/.test(document.querySelector('#page-quals').innerText))
      await shot(s, `${P}-11-viper-in.png`)
    })
    await s.ctx.close()
  }
} finally { save('w4'); await stop() }
console.log('errs', errs.length, errs.slice(0, 10))
