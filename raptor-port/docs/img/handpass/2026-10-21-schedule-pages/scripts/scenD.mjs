import { launch, login, go, shot } from './common.mjs'
const size = process.argv[2] || 'desktop'
const tag = size === 'phone' ? 'ph' : 'dk'
const { browser, page, errors } = await launch(size)
await login(page, 'a')
// admin first adds a line with a bare "<" so the member read is meaningful
await go(page, 'editsched')
await page.locator('.airbtn[data-air]:visible').first().click(); await page.waitForTimeout(400)
await page.click('#airAdd'); await page.waitForTimeout(300)
await page.locator('#airBody [data-airi]').last().fill('2 X FIGHTER <090 inbound / 20 NM'); await page.locator('#airTitle').click(); await page.waitForTimeout(300)
await page.click('#airDone'); await page.waitForTimeout(300)
// sign out through the control
const lo = page.locator('button:has-text("Logout"):visible, a:has-text("Logout"):visible, #logoutBtn:visible').first()
console.log('logout visible', await lo.count())
if (await lo.count()) await lo.click(); else { await page.click('#burger'); await page.waitForTimeout(400); await page.click('#drawerLogout') }
await page.waitForTimeout(800)
await login(page, 'u')
console.log('page after member login', await page.evaluate(() => window.CURPAGE))
await go(page, 'viewsched')
const btns = await page.locator('.airbtn[data-air]:visible').count()
console.log('member traffic buttons', btns)
if (btns) {
  await page.locator('.airbtn[data-air]:visible').first().click(); await page.waitForTimeout(500)
  console.log('window rows:', await page.evaluate(() => ({ title: document.querySelector('#airTitle')?.innerText, inputs: document.querySelectorAll('#airBody input').length, dels: document.querySelectorAll('#airBody [data-airdel]').length, addBtn: !!document.querySelector('#airAdd'), foot: !!document.querySelector('.airpop-foot'), text: document.querySelector('#airBody')?.innerText })))
  await shot(page, `D1-${tag}-member-traffic`)
  // repaint with window open
  await page.evaluate(() => window.renderSchedule()); await page.waitForTimeout(400)
  console.log('still open after repaint', await page.evaluate(() => !document.querySelector('#airpop').hidden))
}
// also try Edit Schedule as member
console.log('member editsched nav exists/visible', await page.locator('.nav a[data-page="editsched"]:visible').count())
console.log('ERRORS', JSON.stringify(errors))
await browser.close()
