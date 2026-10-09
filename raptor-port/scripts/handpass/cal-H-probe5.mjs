import * as H from './cal-H-lib.mjs'
H.setTag('p5')
const { browser, page, errors } = await H.world({})
// the badge
console.log('badge', await page.locator('#roleBadge').innerText(), await page.locator('#roleBadge').getAttribute('title'))
// sign out, sign in as a stranger
await H.signOut(page)
await page.fill('#luser', 'stranger'); await page.fill('#lpass', 'x'); await page.click('#loginForm button[type=submit]'); await H.sleep(1200)
console.log('after stranger:', (await page.evaluate(() => document.body.innerText.replace(/\s+/g, ' ').slice(0, 600))))
await H.pic(page, 'stranger')
console.log('cp', await page.evaluate(() => window.CURPAGE))
await page.evaluate(() => { try { window.go('admin') } catch (e) { } }); await H.sleep(600)
console.log('after go(admin):', (await page.evaluate(() => document.body.innerText.replace(/\s+/g, ' ').slice(0, 400))), await page.evaluate(() => window.CURPAGE))
await H.pic(page, 'stranger-go-admin')
// guest?
console.log('guest button', await page.locator('#guestIn, [data-testid=guest-in], button:has-text("guest")').count())
// admin page controls
console.log(errors)
await browser.close()
