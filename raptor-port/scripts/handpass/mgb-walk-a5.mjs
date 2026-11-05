// Walker A, part 5: S18 (suspended screen with band, Retry), S19 (band carried through a member sign-in), S9 (cold start attempt)
import { L, VER, shot, press, sleep } from './mgb-walk-a-lib.mjs'
console.log(VER, 'a5')
const snap = (page) => page.evaluate(() => {
  const r = (s) => { const e = document.querySelector(s); if (!e) return null; const b = e.getBoundingClientRect(); return { top: Math.round(b.top), bottom: Math.round(b.bottom) } }
  return { saveband: document.querySelectorAll('.saveband').length, topFailed: document.querySelectorAll('.topbar > .savestat.failed').length, allFailed: document.querySelectorAll('.savestat.failed').length,
    statusRoles: [...document.querySelectorAll('[role=status]')].filter(e => /Not saved/.test(e.textContent)).length, liveRegions: [...document.querySelectorAll('[aria-live]')].filter(e => /Not saved/.test(e.textContent)).length,
    band: r('.saveband.is-screen'), logo: r('.lb-mark'), login: document.querySelector('.login')?.className, text: (document.querySelector('.login')?.innerText || '').replace(/\s+/g, ' ').slice(0, 220) }
})
async function failBand(page) {
  await L.refuse(page, false)
  await L.signIn(page, 'ad', 'a')
  await page.evaluate(() => window.go('admin')); await page.waitForTimeout(500)
  await page.locator('.adm-cat').filter({ hasText: 'Users' }).first().click(); await page.waitForTimeout(300)
  await L.refuse(page, true)
  await page.locator('#admGuestView').click(); await page.waitForTimeout(300)
  await page.locator('#admGuestView').click(); await page.waitForTimeout(1200)
  await L.signOut(page); await page.waitForSelector('#login'); await page.waitForTimeout(500)
}
for (const size of ['phone', 'desktop']) {
  const sfx = size === 'desktop' ? 'desk' : 'phone'
  const { page, tap, ctx } = await L.open(size)
  /* suspend Ranger */
  await L.signIn(page, 'ad', 'a')
  await page.evaluate(() => window.go('admin')); await page.waitForTimeout(500)
  await page.locator('.adm-cat').filter({ hasText: 'Users' }).first().click(); await page.waitForTimeout(400)
  await page.getByPlaceholder(/Find a callsign/).fill('Ranger'); await page.waitForTimeout(600)
  await page.locator('.acc-tap').first().click(); await page.waitForTimeout(600)
  const lbl = await page.locator('#accEdOnOff').textContent()
  await page.locator('#accEdOnOff').click(); await page.waitForTimeout(800)
  const lbl2 = await page.locator('#accEdOnOff').count() ? await page.locator('#accEdOnOff').textContent() : 'gone'
  L.note(`S18-${sfx}-suspend`, `button said '${lbl}' then '${lbl2}'`)
  await L.signOut(page)
  /* S18 without band, then with band */
  await L.signIn(page, 'us', 'us'); await sleep(600)
  let s = await snap(page)
  L.note(`S18-${sfx}-noband`, s)
  await shot(page, `S18-suspended-noband-${sfx}`)
  await L.signOut(page)
  await failBand(page)
  await L.signIn(page, 'us', 'us'); await sleep(700)
  s = await snap(page)
  L.note(`S18-${sfx}-band`, s)
  await shot(page, `S18-suspended-band-${sfx}`)
  const suspended = /suspend/i.test(s.text)
  L.check(`S18-${sfx}`, 'suspended screen shows the band, screen moved below it, logo not covered', suspended && s.saveband === 1 && /band-up/.test(s.login || '') && s.logo && s.logo.top >= s.band.bottom - 0.5, s)
  /* S7 on suspended */
  if (s.saveband === 1) {
    await press(page, tap, '.saveband.is-screen button'); await sleep(700)
    let t = await snap(page)
    L.check(`S7-suspended-${sfx}-stay`, 'suspended: Retry refused, band stays', t.saveband === 1 && /band-up/.test(t.login || ''), t)
    await L.refuse(page, false)
    await press(page, tap, '.saveband.is-screen button'); await sleep(700)
    t = await snap(page)
    L.check(`S7-suspended-${sfx}-gone`, 'suspended: Retry allowed, band and .band-up gone', t.saveband === 0 && !/band-up/.test(t.login || ''), t)
    await shot(page, `S7-suspended-retry-good-${sfx}`)
  }
  await L.signOut(page)
  /* un-suspend Ranger (tidy) */
  await L.refuse(page, false)
  await L.signIn(page, 'ad', 'a')
  await page.evaluate(() => window.go('admin')); await page.waitForTimeout(500)
  await page.locator('.adm-cat').filter({ hasText: 'Users' }).first().click(); await page.waitForTimeout(400)
  await page.getByPlaceholder(/Find a callsign/).fill('Ranger'); await page.waitForTimeout(600)
  await page.locator('.acc-tap').first().click(); await page.waitForTimeout(600)
  if (/Reinstate|Activate|Resume|Unsuspend|Enable/i.test(await page.locator('#accEdOnOff').textContent())) await page.locator('#accEdOnOff').click()
  await page.waitForTimeout(600)
  await L.signOut(page)

  /* S19: member with saves refused */
  await L.signIn(page, 'us', 'us'); await sleep(800)
  const inApp = await page.locator('#vWeek, #logout, #burger').count()
  L.note(`S19-${sfx}-in`, `signed in as us, app elements ${inApp}`)
  await L.refuse(page, true)
  /* a write the member can make: sign-out itself, or the Quals page */
  await page.evaluate(() => window.go('quals')).catch(() => {}); await sleep(600)
  const topBefore = await snap(page)
  L.note(`S19-${sfx}-member-before-signout`, topBefore)
  await L.signOut(page); await page.waitForSelector('#login'); await sleep(600)
  const signin = await snap(page)
  L.note(`S19-${sfx}-signin`, signin)
  await shot(page, `S19-signin-band-${sfx}`)
  await L.signIn(page, 'us', 'us'); await sleep(900)
  const after = await snap(page)
  L.note(`S19-${sfx}-after`, after)
  await shot(page, `S19-after-signin-${sfx}`)
  const oneBand = after.allFailed === 1 && after.topFailed === 1 && after.saveband === 0
  L.check(`S19-${sfx}`, 'after signing in again with saves refused: exactly one band, in the top bar; one status for a screen reader', signin.saveband === 1 && oneBand && after.statusRoles <= 1, { signin: signin.saveband, after })
  await ctx.close()
}

/* S9: cold start — try to leave a save unfinished, then reload */
{
  const { page, ctx } = await L.open('desktop')
  await L.signIn(page, 'ad', 'a')
  await page.evaluate(() => window.go('admin')); await page.waitForTimeout(500)
  await page.locator('.adm-cat').filter({ hasText: 'Users' }).first().click(); await page.waitForTimeout(300)
  await L.refuse(page, true)
  await page.locator('#admGuestView').click(); await sleep(1500)
  const keys = await page.evaluate(() => Object.keys(localStorage).filter(k => /pending|journal|group|wal|tx|unfinished/i.test(k)))
  L.note('S9-keys', { pendingLikeKeys: keys, failedBand: await page.locator('.topbar > .savestat.failed').count() })
  await page.reload(); await page.waitForSelector('#luser').catch(() => {}); await sleep(1200)
  const after = await snap(page)
  L.note('S9-after-reload', after)
  await shot(page, 'S9-cold-start-desk')
  if (after.saveband === 1) L.say('RECORD S9 a failed save left behind makes the band show at the very first screen after a reload: ' + JSON.stringify(after))
  else L.notWalked('S9', `could not leave an unfinished save group through the page (the browser refusal is lost on reload, nothing pending is kept); sign-in after reload shows no band (${JSON.stringify({ saveband: after.saveband, keys })})`)
  await ctx.close()
}
await L.finish('mgb-walk-a5').catch(() => {})
console.log('errors:', L.errs.length ? L.errs : 'none')
process.exit(0)
