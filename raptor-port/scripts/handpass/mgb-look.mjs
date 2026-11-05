// The member / guest build (5 Nov 26 — [ACCESS-WAIT-LOOK], [SAVEBAND-LOOK], [GUEST-SAVE-WARNING]): the host's own look at
// the built screens beside their approved drawings, at his iPhone's 402 × 874 (WebKit, by touch) and his PC's 1536
// (Chromium). Every state is reached through the app's own controls; a failed save is a browser that refuses to write
// (the same wrapper as e2e/save-note.spec.ts). Pictures and a results file go to MG_OUT.
// Usage (from raptor-port/): WALK_DIR=<frozen dist> MG_OUT=<folder> node scripts/handpass/mgb-look.mjs
import * as L from './mg1105-lib.mjs'
import { join } from 'node:path'

const shot = (page, name, clip) => page.screenshot({ path: join(L.OUT, name + '.png'), ...(clip ? { clip } : {}) })
const press = (page, tap, sel) => tap ? page.locator(sel).tap() : page.locator(sel).click()

for (const size of ['phone', 'desktop']) {
  const sfx = size === 'desktop' ? 'desk' : 'phone'
  const { page, tap, ctx } = await L.open(size)
  /* the guest switch on, so the waiting screen offers "View the schedule" (as his drawing shows it) */
  await L.signIn(page, 'ad', 'a')
  await page.evaluate(() => window.go('admin')); await page.waitForTimeout(500)
  await page.locator('.adm-cat').filter({ hasText: 'Users' }).first().click(); await page.waitForTimeout(400)
  if (!(await page.locator('#admGuestView').isChecked())) await page.locator('#admGuestView').click()
  await page.waitForTimeout(400)
  /* Edit Schedule with a failed save: the strip */
  await L.refuse(page, true)
  await page.evaluate(() => window.go('editsched')); await page.waitForTimeout(900)
  await page.locator('#admGuestView').count()
  /* a real change that must save: a day note typed on the week is heavy to reach; the guest switch flipped twice is one tap each */
  await page.evaluate(() => window.go('admin')); await page.waitForTimeout(500)
  await page.locator('.adm-cat').filter({ hasText: 'Users' }).first().click(); await page.waitForTimeout(300)
  await page.locator('#admGuestView').click(); await page.waitForTimeout(300)
  await page.locator('#admGuestView').click(); await page.waitForTimeout(1500)
  await page.evaluate(() => window.go('editsched')); await page.waitForTimeout(1200)
  const band = await page.waitForSelector('.topbar > .savestat.failed', { timeout: 8000 }).then(() => true, () => false)
  L.check(`B1-${sfx}`, 'Edit Schedule: the band is up', band, band)
  const bar = await page.locator('.topbar').boundingBox()
  await shot(page, `B1-editsched-band-${sfx}`, { x: 0, y: 0, width: size === 'desktop' ? 1536 : 402, height: Math.round(bar.y + bar.height + 140) })
  const facts = await page.evaluate(() => {
    const b = document.querySelector('.topbar > .savestat.failed'), r = b.getBoundingClientRect(), cs = getComputedStyle(b)
    const msg = b.querySelector('.sv-msg').getBoundingClientRect(), btn = b.querySelector('button'), br = btn.getBoundingClientRect()
    return { h: Math.round(r.height), left: Math.round(r.left), right: Math.round(r.right), vw: innerWidth, wordsLeft: Math.round(msg.left), retryRight: Math.round(innerWidth - br.right),
      lead: b.querySelector('.sv-msg b').textContent, rest: b.querySelector('.sv-rest').textContent, sepShown: b.querySelector('.sv-sep').getBoundingClientRect().width > 1,
      retryBg: getComputedStyle(btn).backgroundColor, edge: getComputedStyle(document.querySelector('.topbar')).borderBottomColor, line: cs.borderTopColor, text: b.textContent }
  })
  L.note(`B1-${sfx}`, facts)
  /* Retry lands it */
  await L.refuse(page, false)
  await press(page, tap, '.topbar > .savestat.failed button')
  const gone = await page.waitForSelector('.topbar > .savestat.failed', { state: 'detached', timeout: 5000 }).then(() => true, () => false)
  L.check(`B2-${sfx}`, 'Retry saves and the band goes', gone, gone)
  /* a stranger: the request is refused by the browser, so it is not saved */
  await L.signOut(page)
  await L.signIn(page, 'stranger', 'x')
  await page.waitForSelector('#accessRequest')
  await page.fill('#accCs', 'Stranger'); await page.fill('#accIni', 'ST')
  await page.selectOption('#accSeat', 'FCP'); await page.selectOption('#accCat', 'OCU')
  await L.refuse(page, true)
  await press(page, tap, '#accSend')
  await page.waitForSelector('#accessWaiting')
  const wb = await page.waitForSelector('.saveband.is-screen', { timeout: 8000 }).then(() => true, () => false)
  L.check(`W1-${sfx}`, 'the waiting screen says the request did not save (the band)', wb, wb)
  await page.waitForTimeout(300)
  await shot(page, `W1-waiting-band-${sfx}`)
  const wf = await page.evaluate(() => {
    const band = document.querySelector('.saveband.is-screen').getBoundingClientRect(), logo = document.querySelector('#accessWaiting .lb-mark').getBoundingClientRect()
    return { bandTop: Math.round(band.top), bandBottom: Math.round(band.bottom), logoTop: Math.round(logo.top), covered: logo.top < band.bottom - 0.5 }
  })
  L.check(`W2-${sfx}`, 'nothing under the band: the logo below it', !wf.covered, wf)
  await L.refuse(page, false)
  await press(page, tap, '.saveband.is-screen button')
  const wgone = await page.waitForSelector('.saveband', { state: 'detached', timeout: 5000 }).then(() => true, () => false)
  L.check(`W3-${sfx}`, 'Retry saves the request and the band goes', wgone, wgone)
  await page.waitForTimeout(300)
  /* the waiting screen as drawn (C-diag-phone.png, C-desk.png) */
  await shot(page, `W4-waiting-${sfx}`)
  if (size === 'desktop') {
    const b = await page.locator('#accessWaiting .login-wrap').boundingBox()
    const w = 600, x = Math.round(b.x + b.width / 2 - w / 2), y = Math.max(0, Math.round(b.y - 70)), h = Math.min(864 - y, Math.round(b.height + 140))
    await shot(page, `W4-waiting-crop-desk`, { x, y, width: w, height: h })
  }
  L.note(`W4-${sfx}`, await page.evaluate(() => ({
    cs: document.querySelector('.pass-cs').textContent, state: document.querySelector('.pass-state').textContent,
    fields: [...document.querySelectorAll('.pass-fields > div')].map(d => d.textContent),
    steps: [...document.querySelectorAll('.pass-steps li')].map(l => l.className + ':' + l.textContent),
    who: document.querySelector('.pass-who').textContent, sideScroll: document.documentElement.scrollWidth > innerWidth,
  })))
  /* the guest page with a failed save */
  await press(page, tap, '#accGuest')
  await page.waitForSelector('#guestApp')
  await L.refuse(page, true)
  /* a write the guest page makes on its own is rare; a week step is a view change only — so the band is raised the way
     a person on this browser meets it: a save that failed before he came here stays failed (the request, again) */
  await L.signOut(page)
  await L.signIn(page, 'stranger2', 'x')
  await page.waitForSelector('#accessRequest')
  await page.fill('#accCs', 'Second'); await page.selectOption('#accSeat', 'RCP'); await page.selectOption('#accCat', 'C')
  await press(page, tap, '#accSend')
  await page.waitForSelector('.saveband.is-screen', { timeout: 8000 })
  await press(page, tap, '#accGuest')
  await page.waitForSelector('#guestApp')
  const gb = await page.waitForSelector('#guestApp .topbar.save-failed > .savestat.failed', { timeout: 8000 }).then(() => true, () => false)
  L.check(`G1-${sfx}`, 'the guest page: the band is the bar\'s last line', gb, gb)
  await page.waitForTimeout(400)
  const gbar = await page.locator('#guestApp .topbar').boundingBox()
  await shot(page, `G1-guest-band-${sfx}`, { x: 0, y: 0, width: size === 'desktop' ? 1536 : 402, height: Math.round(gbar.y + gbar.height + 260) })
  L.note(`G1-${sfx}`, await page.evaluate(() => {
    const b = document.querySelector('#guestApp .savestat.failed').getBoundingClientRect(), bar = document.querySelector('#guestApp .topbar').getBoundingClientRect()
    const first = document.querySelector('#guestApp .page').getBoundingClientRect()
    return { bandBottom: Math.round(b.bottom), barBottom: Math.round(bar.bottom), pageTop: Math.round(first.top), covers: first.top < b.bottom - 0.5 }
  }))
  /* signed out with the save still failing: the sign-in screen */
  await press(page, tap, '#guestOut')
  await page.waitForSelector('#login')
  const lb = await page.waitForSelector('.saveband.is-screen', { timeout: 5000 }).then(() => true, () => false)
  L.note(`S1-${sfx}`, `the sign-in after signing out with the save still failing: band ${lb ? 'up' : 'not up'}`)
  if (lb) await shot(page, `S1-signin-band-${sfx}`)
  await ctx.close()
}
await L.finish('mgb-look').catch(() => {})
console.log('errors:', L.errs.length ? L.errs : 'none')
process.exit(0)
