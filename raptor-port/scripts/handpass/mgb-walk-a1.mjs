// Walker A, part 1: S1 (pass under failed save), S4 (14-letter callsign), S5 (pass states), S7 (Retry on each screen), S18 (suspended later)
import { L, VER, shot, press } from './mgb-walk-a-lib.mjs'
console.log(VER, 'a1')
const geo = (page) => page.evaluate(() => {
  const r = (s) => { const e = document.querySelector(s); if (!e) return null; const b = e.getBoundingClientRect(); return { top: Math.round(b.top), bottom: Math.round(b.bottom), left: Math.round(b.left), right: Math.round(b.right), h: Math.round(b.height) } }
  return { band: r('.saveband.is-screen'), logo: r('.lb-mark'), card: r('.login-wrap'), login: document.querySelector('.login')?.className, vw: innerWidth, sw: document.documentElement.scrollWidth }
})
for (const size of ['phone', 'desktop']) {
  const sfx = size === 'desktop' ? 'desk' : 'phone'
  const { page, tap, ctx } = await L.open(size)
  await L.signIn(page, 'ad', 'a')
  await page.evaluate(() => window.go('admin')); await page.waitForTimeout(500)
  await page.locator('.adm-cat').filter({ hasText: 'Users' }).first().click(); await page.waitForTimeout(400)
  if (!(await page.locator('#admGuestView').isChecked())) await page.locator('#admGuestView').click()
  await page.waitForTimeout(500)
  await L.signOut(page)
  /* S1: stranger, request form, saves refused from the start */
  await L.signIn(page, 'stranger', 'x')
  await page.waitForSelector('#accessRequest')
  await L.refuse(page, true)
  await page.fill('#accCs', 'Stranger'); await page.fill('#accIni', 'ST')
  await page.selectOption('#accSeat', 'FCP'); await page.selectOption('#accCat', 'OCU')
  await press(page, tap, '#accSend')
  await page.waitForSelector('#accessWaiting'); await page.waitForTimeout(600)
  await shot(page, `S1-pass-band-${sfx}`)
  const s1 = await page.evaluate(() => ({
    band: !!document.querySelector('.saveband.is-screen'), bandText: document.querySelector('.saveband')?.textContent,
    state: document.querySelector('.pass-state')?.textContent, steps: [...document.querySelectorAll('.pass-steps li')].map(l => l.className + ':' + l.textContent),
    guestBtn: !!document.querySelector('#accGuest'), out: !!document.querySelector('#accOut'), who: document.querySelector('.pass-who')?.textContent }))
  L.note(`S1-${sfx}`, s1)
  const g1 = await geo(page)
  L.check(`S1-${sfx}-cover`, 'band up, pass below it, nothing covered', !!g1.band && g1.logo.top >= g1.band.bottom - 0.5, g1)
  L.say(`RECORD S1-${sfx} pass says step1 '${s1.steps[0]}' state '${s1.state}' while band says '${s1.bandText}'`)
  /* S7: Retry still refused -> band stays; then allowed -> gone */
  await press(page, tap, '.saveband.is-screen button'); await page.waitForTimeout(700)
  const still = await page.locator('.saveband.is-screen').count()
  const gStill = await geo(page)
  L.check(`S7-pass-${sfx}-stay`, 'Retry with saves still refused: band stays and screen stays under it', still === 1 && /band-up/.test(gStill.login), gStill)
  await shot(page, `S7-pass-retry-still-${sfx}`)
  await L.refuse(page, false)
  await press(page, tap, '.saveband.is-screen button'); await page.waitForTimeout(700)
  const g2 = await geo(page)
  L.check(`S7-pass-${sfx}-gone`, 'Retry after allow: band gone, .login.band-up gone', g2.band === null && !/band-up/.test(g2.login || ''), g2)
  await shot(page, `S7-pass-retry-good-${sfx}`)
  await L.signOut(page)

  /* S4: 14-letter callsign, both with band and without */
  for (const withBand of [false, true]) {
    const wn = 'wide' + (withBand ? 'b' : 'n')
    await L.signIn(page, wn, 'x'); await page.waitForSelector('#accessRequest')
    await page.fill('#accCs', 'WWWWWWWWWWWWWW'); await page.fill('#accIni', 'WW'); await page.selectOption('#accSeat', 'FCP'); await page.selectOption('#accCat', 'OCU')
    if (withBand) await L.refuse(page, true)
    await press(page, tap, '#accSend'); await page.waitForSelector('#accessWaiting'); await page.waitForTimeout(500)
    const m = await page.evaluate(() => {
      const h = document.querySelector('.pass-cs'), cs = getComputedStyle(h), card = document.querySelector('.login-wrap, #accessWaiting').getBoundingClientRect()
      const hb = h.getBoundingClientRect()
      const lh = parseFloat(cs.lineHeight) || parseFloat(cs.fontSize) * 1.2
      const rng = document.createRange(); rng.selectNodeContents(h); const rects = [...rng.getClientRects()]
      const passEl = document.querySelector('.pass-top') || h
      const pb = passEl.getBoundingClientRect()
      return { h: Math.round(hb.height), lineHeight: Math.round(lh), fontSize: cs.fontSize, textLines: new Set(rects.map(r => Math.round(r.top))).size, textRight: Math.round(Math.max(...rects.map(r => r.right))), h2Right: Math.round(hb.right), passRight: Math.round(pb.right), scrollW: h.scrollWidth, clientW: h.clientWidth, overflowX: cs.overflowX, wrap: cs.overflowWrap + '/' + cs.wordBreak, vw: innerWidth }
    })
    L.note(`S4-${sfx}-${withBand ? 'band' : 'noband'}`, m)
    await shot(page, `S4-longname-${withBand ? 'band-' : ''}${sfx}`)
    const broke = m.textLines > 1
    L.say(`RECORD S4-${sfx}-${withBand ? 'band' : 'noband'} lines=${m.textLines} h2h=${m.h} lineH=${m.lineHeight} breaksMidWord=${broke} runsPastCard=${m.textRight > m.passRight + 0.5} (textRight ${m.textRight}, passRight ${m.passRight}, scrollW ${m.scrollW}/${m.clientW})`)
    await L.refuse(page, false)
    await L.signOut(page)
  }
  await ctx.close()
}
await L.finish('mgb-walk-a1').catch(() => {})
console.log('errors:', L.errs.length ? L.errs : 'none')
process.exit(0)
