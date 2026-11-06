// Walker A, part 6: S19 redone - the band carried from the sign-in into the member's app
import { L, VER, shot, sleep } from './mgb-walk-a-lib.mjs'
console.log(VER, 'a6')
const snap = (page) => page.evaluate(() => ({ saveband: document.querySelectorAll('.saveband').length, topFailed: document.querySelectorAll('.topbar > .savestat.failed').length, allFailed: document.querySelectorAll('.savestat.failed').length,
  statusRoles: [...document.querySelectorAll('[role=status]')].filter(e => /Not saved/.test(e.textContent)).length, appUp: !!document.querySelector('#vWeek, #logout, #burger'), loginUp: !!document.querySelector('#login'), topbars: document.querySelectorAll('.topbar').length,
  bandText: document.querySelector('.topbar > .savestat.failed')?.textContent.replace(/\s+/g, ' ') }))
for (const size of ['phone', 'desktop']) {
  const sfx = size === 'desktop' ? 'desk' : 'phone'
  const { page, tap, ctx } = await L.open(size)
  await L.signIn(page, 'ad', 'a')
  await page.evaluate(() => window.go('admin')); await page.waitForTimeout(500)
  await page.locator('.adm-cat').filter({ hasText: 'Users' }).first().click(); await page.waitForTimeout(300)
  await L.refuse(page, true)
  await page.locator('#admGuestView').click(); await page.waitForTimeout(300)
  await page.locator('#admGuestView').click(); await page.waitForTimeout(1200)
  await L.signOut(page); await page.waitForSelector('#login'); await sleep(600)
  const si = await snap(page)
  await shot(page, `S19-signin-band-${sfx}`)
  await L.signIn(page, 'us', 'us'); await sleep(1000)
  const af = await snap(page)
  L.note(`S19-${sfx}`, { signin: si, afterSignIn: af })
  await shot(page, `S19-member-after-signin-${sfx}`)
  L.check(`S19-${sfx}`, 'band on the sign-in, then after signing in exactly one band in the top bar (none left on a screen), one status for a screen reader', si.saveband === 1 && af.appUp && af.topFailed === 1 && af.allFailed === 1 && af.saveband === 0 && af.statusRoles <= 1, { si, af })
  /* sign out again: the band goes back to the sign-in, once */
  await L.signOut(page); await page.waitForSelector('#login'); await sleep(700)
  const so = await snap(page)
  L.check(`S19-${sfx}-back`, 'signing out again: one band on the sign-in', so.saveband === 1 && so.allFailed === 1, so)
  await ctx.close()
}
await L.finish('mgb-walk-a6').catch(() => {})
console.log('errors:', L.errs.length ? L.errs : 'none')
process.exit(0)
