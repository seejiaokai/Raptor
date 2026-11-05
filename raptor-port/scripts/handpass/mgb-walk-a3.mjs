// Walker A, part 3: S3 (sign-in boxes under the band), S13a (Tab to Retry), S7 (Retry on sign-in, request form, pass, guest bar), S8 (guest page with band), S6 (stranger chain, saves refused)
import { L, VER, shot, press, sleep } from './mgb-walk-a-lib.mjs'
console.log(VER, 'a3')
const cnt = (page, s) => page.locator(s).count()
const geo = (page, extra = []) => page.evaluate((extra) => {
  const r = (s) => { const e = document.querySelector(s); if (!e) return null; const b = e.getBoundingClientRect(); return { top: Math.round(b.top), bottom: Math.round(b.bottom) } }
  return { band: r('.saveband.is-screen'), login: document.querySelector('.login')?.className, bands: document.querySelectorAll('.saveband, .savestat.failed').length, ...Object.fromEntries(extra.map(s => [s, r(s)])) }
}, extra)
/* a band on the sign-in: sign in as admin, refuse, make two guest-switch writes that fail, sign out */
async function failBand(page, tap) {
  await L.refuse(page, false)
  await L.signIn(page, 'ad', 'a')
  await page.evaluate(() => window.go('admin')); await page.waitForTimeout(500)
  await page.locator('.adm-cat').filter({ hasText: 'Users' }).first().click(); await page.waitForTimeout(300)
  await L.refuse(page, true)
  await page.locator('#admGuestView').click(); await page.waitForTimeout(300)
  await page.locator('#admGuestView').click(); await page.waitForTimeout(1200)
  const top = await page.locator('.topbar > .savestat.failed').count()
  await L.signOut(page)
  await page.waitForSelector('#login'); await page.waitForTimeout(500)
  return { topBand: top, signinBand: await cnt(page, '.saveband.is-screen') }
}
for (const size of ['phone', 'desktop']) {
  const sfx = size === 'desktop' ? 'desk' : 'phone'
  const { page, tap, ctx } = await L.open(size)
  await L.signIn(page, 'ad', 'a')
  await page.evaluate(() => window.go('admin')); await page.waitForTimeout(500)
  await page.locator('.adm-cat').filter({ hasText: 'Users' }).first().click(); await page.waitForTimeout(400)
  if (!(await page.locator('#admGuestView').isChecked())) await page.locator('#admGuestView').click()
  await page.waitForTimeout(400)
  await L.signOut(page)

  /* A: sign-in with band */
  let f = await failBand(page, tap)
  L.note(`A-${sfx}`, f)
  L.check(`S3-${sfx}-band`, 'sign-in carries the band after a failed save', f.signinBand === 1, f)
  const baseG = await geo(page, ['#luser', '#lpass', '.lb-mark'])
  L.note(`S3-${sfx}-geo`, baseG)
  await shot(page, `S3-signin-band-${sfx}`)
  for (const id of ['#luser', '#lpass']) {
    const loc = page.locator(id)
    if (tap) await loc.tap(); else await loc.click()
    await sleep(100)
    await shot(page, `S3-tap-${id.slice(1)}-immediate-${sfx}`)
    await sleep(500)
    const g = await page.evaluate((id) => { const b = document.querySelector('.saveband.is-screen').getBoundingClientRect(), e = document.querySelector(id).getBoundingClientRect(); const vv = window.visualViewport; return { bandBottom: Math.round(b.bottom), boxTop: Math.round(e.top), boxBottom: Math.round(e.bottom), vvH: Math.round(vv.height), vvTop: Math.round(vv.offsetTop), vh: innerHeight, focused: document.activeElement.id } }, id)
    await shot(page, `S3-tap-${id.slice(1)}-settled-${sfx}`)
    L.check(`S3-${sfx}-${id.slice(1)}`, 'box focused, clear of the band and inside the visible screen', g.focused === id.slice(1) && g.boxTop >= g.bandBottom - 0.5 && g.boxBottom <= g.vvTop + g.vvH + 0.5, g)
  }
  /* S13 first half (desktop): Tab to Retry */
  if (size === 'desktop') {
    await page.locator('#luser').focus()
    let found = false, seq = []
    for (let i = 0; i < 8 && !found; i++) {
      await page.keyboard.press('Shift+Tab'); await sleep(100)
      const a = await page.evaluate(() => ({ id: document.activeElement.id, tag: document.activeElement.tagName, txt: (document.activeElement.textContent || '').trim().slice(0, 20), inBand: !!document.activeElement.closest('.saveband') }))
      seq.push(a); found = a.inBand
    }
    if (!found) { await page.locator('#luser').focus(); for (let i = 0; i < 8 && !found; i++) { await page.keyboard.press('Tab'); await sleep(100); const a = await page.evaluate(() => ({ id: document.activeElement.id, tag: document.activeElement.tagName, inBand: !!document.activeElement.closest('.saveband') })); seq.push(a); found = a.inBand } }
    const ring = await page.evaluate(() => { const e = document.activeElement, cs = getComputedStyle(e); return { onRetry: !!e.closest('.saveband'), outline: cs.outlineStyle + ' ' + cs.outlineWidth + ' ' + cs.outlineColor, boxShadow: cs.boxShadow, focusVisible: e.matches(':focus-visible'), bg: cs.backgroundColor } })
    L.note('S13a-desk', { found, seq, ring })
    await shot(page, 'S13a-tab-to-retry-desk')
    const b = await page.locator('.saveband button').boundingBox()
    await shot(page, 'S13a-tab-to-retry-crop-desk', { x: Math.max(0, b.x - 120), y: 0, width: 240 + b.width, height: 60 })
    const visibleRing = found && ring.focusVisible && (ring.outline.indexOf('none') < 0 || ring.boxShadow !== 'none')
    L.check('S13a-desk', 'Tab reaches Retry on the sign-in with the band up; a keyboard ring is visible', visibleRing, { found, ring })
  }
  /* S7 sign-in: Retry refused stays, allowed goes */
  await press(page, tap, '.saveband.is-screen button'); await sleep(700)
  let g = await geo(page)
  L.check(`S7-signin-${sfx}-stay`, 'Retry still refused: band stays, screen stays under it', g.bands === 1 && /band-up/.test(g.login || ''), g)
  await shot(page, `S7-signin-retry-still-${sfx}`)
  await L.refuse(page, false)
  await press(page, tap, '.saveband.is-screen button'); await sleep(700)
  g = await geo(page)
  L.check(`S7-signin-${sfx}-gone`, 'Retry allowed: band and .band-up gone', g.bands === 0 && !/band-up/.test(g.login || ''), g)
  await shot(page, `S7-signin-retry-good-${sfx}`)

  /* B: the chain for a stranger with saves failing */
  f = await failBand(page, tap)
  L.check(`S6-${sfx}-signin-band`, 'chain: sign-in has the band', f.signinBand === 1, f)
  const un = 'chain' + sfx
  await L.signIn(page, un, 'x'); await page.waitForSelector('#accessRequest'); await sleep(400)
  g = await geo(page, ['.lb-mark'])
  L.check(`S6-${sfx}-form-band`, 'chain: Request access form shows the band, screen moved down', g.bands === 1 && /band-up/.test(g.login || ''), g)
  await shot(page, `S6-request-band-${sfx}`)
  /* S7 request form */
  await press(page, tap, '.saveband.is-screen button'); await sleep(700)
  g = await geo(page)
  L.check(`S7-form-${sfx}-stay`, 'request form: Retry refused, band stays', g.bands === 1 && /band-up/.test(g.login || ''), g)
  await L.refuse(page, false)
  await press(page, tap, '.saveband.is-screen button'); await sleep(700)
  g = await geo(page)
  L.check(`S7-form-${sfx}-gone`, 'request form: Retry allowed, band and .band-up gone', g.bands === 0 && !/band-up/.test(g.login || ''), g)
  await shot(page, `S7-form-retry-good-${sfx}`)
  /* send with saves failing again -> pass with band -> guest page */
  await page.fill('#accCs', 'Chain' + sfx); await page.fill('#accIni', 'CH'); await page.selectOption('#accSeat', 'FCP'); await page.selectOption('#accCat', 'OCU')
  await L.refuse(page, true)
  await press(page, tap, '#accSend'); await page.waitForSelector('#accessWaiting'); await sleep(600)
  g = await geo(page, ['.lb-mark'])
  L.check(`S6-${sfx}-pass-band`, 'chain: the pass has the band, logo below it', g.bands === 1 && g['.lb-mark'] && g['.lb-mark'].top >= g.band.bottom - 0.5, g)
  await press(page, tap, '#accGuest'); await page.waitForSelector('#guestApp'); await sleep(600)
  /* S8 */
  const gb = await page.evaluate(() => {
    const q = s => document.querySelector(s), r = s => { const e = q(s); if (!e) return null; const b = e.getBoundingClientRect(); return { top: Math.round(b.top), bottom: Math.round(b.bottom), left: Math.round(b.left), right: Math.round(b.right) } }
    const strip = document.querySelector('#guestApp .wkstrip, #guestApp [class*=week], #guestApp .page')
    return { bar: r('#guestApp .topbar'), band: r('#guestApp .savestat.failed'), cls: q('#guestApp .topbar')?.className, page: r('#guestApp .page'), strip: strip ? { cls: strip.className, ...(() => { const b = strip.getBoundingClientRect(); return { top: Math.round(b.top), bottom: Math.round(b.bottom) } })() } : null,
      notes: [...document.querySelectorAll('#guestApp .savestat, #guestApp [class*=saving], .sv-note, .sv-saving')].map(e => e.className + ':' + e.textContent.trim().slice(0, 30)), vw: innerWidth }
  })
  L.note(`S8-${sfx}`, gb)
  await shot(page, `S8-guest-band-${sfx}`)
  L.check(`S8-${sfx}-band`, 'guest page: band is the bar\'s last line (inside the bar, page below it)', !!gb.band && !!gb.bar && gb.band.bottom <= gb.bar.bottom + 0.5 && gb.page.top >= gb.band.bottom - 0.5, gb)
  /* swipe a day / scroll the week strip */
  const sc = await page.evaluate(() => { const els = [...document.querySelectorAll('#guestApp *')].filter(e => e.scrollWidth > e.clientWidth + 20 && ['auto', 'scroll'].includes(getComputedStyle(e).overflowX)); return els.map(e => ({ cls: e.className, sw: e.scrollWidth, cw: e.clientWidth, st: e.scrollLeft })).slice(0, 3) })
  L.note(`S8-${sfx}-scrollers`, sc)
  if (sc.length) {
    const before = sc[0].st
    await page.evaluate(() => { const e = [...document.querySelectorAll('#guestApp *')].find(e => e.scrollWidth > e.clientWidth + 20 && ['auto', 'scroll'].includes(getComputedStyle(e).overflowX)); e.scrollLeft += 300 }); await sleep(600)
    const after = await page.evaluate(() => { const e = [...document.querySelectorAll('#guestApp *')].find(e => e.scrollWidth > e.clientWidth + 20 && ['auto', 'scroll'].includes(getComputedStyle(e).overflowX)); return e.scrollLeft })
    L.note(`S8-${sfx}-swipe`, { before, after })
  }
  await page.evaluate(() => { const e = document.querySelector('#guestApp'); e.scrollTop = 400; window.scrollTo(0, 400) }); await sleep(500)
  const gb2 = await page.evaluate(() => { const b = document.querySelector('#guestApp .savestat.failed')?.getBoundingClientRect(); const bar = document.querySelector('#guestApp .topbar')?.getBoundingClientRect(); return { bandTop: b && Math.round(b.top), barTop: bar && Math.round(bar.top), barBottom: bar && Math.round(bar.bottom), scrollY: Math.round(scrollY) } })
  L.note(`S8-${sfx}-scrolled`, gb2)
  await shot(page, `S8-guest-band-scrolled-${sfx}`)
  await page.evaluate(() => { document.querySelector('#guestApp').scrollTop = 0; window.scrollTo(0, 0) })
  /* S7 guest bar */
  await press(page, tap, '#guestApp .savestat.failed button'); await sleep(700)
  const still = await cnt(page, '#guestApp .savestat.failed')
  L.check(`S7-guest-${sfx}-stay`, 'guest bar: Retry refused, band stays', still === 1, still)
  await L.refuse(page, false)
  await press(page, tap, '#guestApp .savestat.failed button'); await sleep(700)
  const gone = await cnt(page, '#guestApp .savestat.failed')
  const cls = await page.evaluate(() => document.querySelector('#guestApp .topbar')?.className)
  L.check(`S7-guest-${sfx}-gone`, 'guest bar: Retry allowed, band gone', gone === 0 && !/save-failed/.test(cls), { gone, cls })
  await shot(page, `S7-guest-retry-good-${sfx}`)
  await press(page, tap, '#guestOut'); await sleep(700)
  await shot(page, `S6-after-guest-signout-${sfx}`)
  /* sign in again as the same stranger: the pass again, then sign out */
  await L.signIn(page, un, 'x'); await sleep(500)
  const again = await cnt(page, '#accessWaiting')
  L.check(`S6-${sfx}-pass-again`, 'chain: signing in again shows the pass again (request kept)', again === 1, again)
  await shot(page, `S6-pass-again-${sfx}`)
  await L.signOut(page)
  await ctx.close()
}
await L.finish('mgb-walk-a3').catch(() => {})
console.log('errors:', L.errs.length ? L.errs : 'none')
process.exit(0)
