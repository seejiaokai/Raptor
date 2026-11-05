// Walker A, part 2: S5 (pass states) at phone + desktop; S2 (phone sideways 874x402, reach top and foot, band up/down)
import { L, VER, shot, press, openSide, closeSide } from './mgb-walk-a-lib.mjs'
console.log(VER, 'a2')
const passFacts = (page) => page.evaluate(() => {
  const q = s => document.querySelector(s)
  return { cs: q('.pass-cs')?.textContent, state: q('.pass-state')?.textContent,
    fields: [...document.querySelectorAll('.pass-fields > div')].map(d => d.textContent), steps: document.querySelectorAll('.pass-steps li').length,
    guest: !!q('#accGuest'), meanwhile: q('.pass-foot')?.textContent.slice(0, 200), who: q('.pass-who')?.textContent,
    fieldBoxes: [...document.querySelectorAll('.pass-fields > div')].map(d => { const b = d.getBoundingClientRect(); return [Math.round(b.left), Math.round(b.right), Math.round(b.top), Math.round(b.bottom)] }),
    card: (() => { const b = q('.pass-top').getBoundingClientRect(); return [Math.round(b.left), Math.round(b.right)] })(), sw: document.documentElement.scrollWidth, vw: innerWidth }
})
async function makePass(page, tap, user, cs, ini, seat, cat) {
  await L.signIn(page, user, 'x'); await page.waitForSelector('#accessRequest')
  await page.fill('#accCs', cs)
  if (ini !== null) await page.fill('#accIni', ini)
  await page.selectOption('#accSeat', seat)
  if (cat) await page.selectOption('#accCat', cat)
  await press(page, tap, '#accSend'); await page.waitForSelector('#accessWaiting'); await page.waitForTimeout(500)
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
  const states = [
    ['a-pilot-ini-cat', 'p1', 'Maverick', 'MV', 'FCP', 'OCU'],
    ['b-noini', 'p2', 'Goose', '', 'RCP', 'C'],
    ['c-personnel', 'p3', 'Jester', 'JE', 'GND', null],
    ['e-longsignin', 'averyveryverylongsigninnamethatkeepsgoingandgoingforever', 'Viper', 'VP', 'FCP', 'B'],
  ]
  for (const [id, u, cs, ini, seat, cat] of states) {
    await makePass(page, tap, u, cs, ini, seat, cat)
    const f = await passFacts(page)
    L.note(`S5-${id}-${sfx}`, f)
    await shot(page, `S5-${id}-${sfx}`)
    const fits = f.card[0] >= 0 && f.card[1] <= f.vw && f.sw <= f.vw
    const noCat = id !== 'c-personnel' || !f.fields.some(x => /CAT/i.test(x))
    L.check(`S5-${id}-${sfx}`, 'pass drawn, fits the screen' + (id === 'c-personnel' ? ', no CAT field' : id === 'b-noini' ? ' (initials field state noted)' : ''), fits && noCat && f.guest, f)
    await L.signOut(page)
  }
  /* d: guest switch off */
  await L.signIn(page, 'ad', 'a')
  await page.evaluate(() => window.go('admin')); await page.waitForTimeout(500)
  await page.locator('.adm-cat').filter({ hasText: 'Users' }).first().click(); await page.waitForTimeout(400)
  if (await page.locator('#admGuestView').isChecked()) await page.locator('#admGuestView').click()
  await page.waitForTimeout(500)
  await L.signOut(page)
  await makePass(page, tap, 'p4', 'Iceman', 'IC', 'FCP', 'OCU')
  const fd = await passFacts(page)
  L.note(`S5-d-guestoff-${sfx}`, fd)
  await shot(page, `S5-d-guestoff-${sfx}`)
  L.check(`S5-d-guestoff-${sfx}`, 'guest switch off: no View the schedule, Sign out there', !fd.guest && (await page.locator('#accOut').count()) === 1, fd)
  await ctx.close()
}

/* S2: phone sideways */
{
  const { page, tap, ctx } = await openSide()
  await L.signIn(page, 'ad', 'a')
  await page.evaluate(() => window.go('admin')); await page.waitForTimeout(500)
  await page.locator('.adm-cat').filter({ hasText: 'Users' }).first().click(); await page.waitForTimeout(400)
  if (!(await page.locator('#admGuestView').isChecked())) await page.locator('#admGuestView').click()
  await page.waitForTimeout(400)
  await L.signOut(page)
  const reach = async (id, rootSel, items) => {
    const r = await page.evaluate(({ rootSel, items }) => {
      const root = document.querySelector(rootSel) || document.querySelector('.login')
      const scrollers = [root, document.scrollingElement, document.querySelector('.login')].filter(Boolean)
      const out = { vh: innerHeight }
      const top = () => { for (const s of scrollers) s.scrollTop = 0 }
      const bot = () => { for (const s of scrollers) s.scrollTop = s.scrollHeight }
      const rect = s => { const e = document.querySelector(s); if (!e) return null; const b = e.getBoundingClientRect(); return { top: Math.round(b.top), bottom: Math.round(b.bottom) } }
      top(); out.atTop = Object.fromEntries(items.map(s => [s, rect(s)])); out.bandTop = rect('.saveband.is-screen')
      bot(); out.atFoot = Object.fromEntries(items.map(s => [s, rect(s)])); out.bandFoot = rect('.saveband.is-screen')
      out.scrollMax = scrollers.map(s => s.scrollHeight - s.clientHeight)
      top()
      return out
    }, { rootSel, items })
    return r
  }
  const ok = (r, first, last) => {
    const t = r.atTop[first], b = r.atFoot[last], bt = r.bandTop
    const topOk = t && t.top >= 0 && (!bt || bt.bottom <= t.top + 0.5)
    const footOk = b && b.bottom <= r.vh + 0.5 && b.top >= 0
    return { topOk: !!topOk, footOk: !!footOk }
  }
  /* sign-in at 402 tall, band up and down */
  await shot(page, 'S2-signin-side')
  let r = await reach('s', '#login', ['.lb-mark', '#luser', '#lpass', '#loginForm button[type=submit]'])
  L.note('S2-signin-side', r)
  let o = ok(r, '.lb-mark', '#loginForm button[type=submit]')
  L.check('S2-signin-side-noband', 'sign-in on 874x402: logo top >=0, submit reachable at foot', o.topOk && o.footOk, { o, r })
  /* request form */
  await L.signIn(page, 'sidestr', 'x'); await page.waitForSelector('#accessRequest')
  await page.fill('#accCs', 'Sideways'); await page.fill('#accIni', 'SW'); await page.selectOption('#accSeat', 'FCP'); await page.selectOption('#accCat', 'OCU')
  await shot(page, 'S2-request-side')
  r = await reach('r', '#accessRequest', ['.lb-mark', '#accCs', '#accSend'])
  L.note('S2-request-side', r)
  o = ok(r, '.lb-mark', '#accSend')
  L.check('S2-request-side-noband', 'request form on 874x402: logo top >=0, Send reachable', o.topOk && o.footOk, { o, r })
  /* request form with band: refuse then trigger a failure by pressing send */
  await L.refuse(page, true)
  await press(page, tap, '#accSend'); await page.waitForSelector('#accessWaiting'); await page.waitForTimeout(600)
  const items = ['.lb-mark', '.pass-claws', '.pass-cs', '#accGuest', '#accOut', '.pass-who']
  await page.evaluate(() => { for (const s of [document.querySelector('.login'), document.scrollingElement]) s && (s.scrollTop = 0) })
  await shot(page, 'S2-pass-band-top-side')
  r = await reach('p', '#accessWaiting', items)
  L.note('S2-pass-band-side', r)
  o = ok(r, '.lb-mark', '.pass-who')
  const allTop = items.filter(s => r.atTop[s] && r.atTop[s].top < 0)
  L.check('S2-pass-band-side', 'pass with band on 874x402: logo top >=0 under band at top; Signed in as reachable at foot', o.topOk && o.footOk, { o, r })
  await page.evaluate(() => { for (const s of [document.querySelector('.login'), document.scrollingElement]) s && (s.scrollTop = 1e6) })
  await page.waitForTimeout(200)
  await shot(page, 'S2-pass-band-foot-side')
  /* each item at some scroll position fully reachable: check by scrollIntoView and elementFromPoint */
  const hit = await page.evaluate((items) => items.map(s => { const e = document.querySelector(s); if (!e) return [s, 'missing']; e.scrollIntoView({ block: 'center' }); const b = e.getBoundingClientRect(); const x = b.left + b.width / 2, y = b.top + b.height / 2; const at = document.elementFromPoint(x, y); return [s, b.top >= 0 && b.bottom <= innerHeight, !!at && (e.contains(at) || at.contains(e))] }), items)
  L.note('S2-pass-band-side-reach', hit)
  /* band down after Retry */
  await L.refuse(page, false)
  await press(page, tap, '.saveband.is-screen button'); await page.waitForTimeout(700)
  await page.evaluate(() => { for (const s of [document.querySelector('.login'), document.scrollingElement]) s && (s.scrollTop = 0) })
  await shot(page, 'S2-pass-noband-top-side')
  r = await reach('p', '#accessWaiting', items)
  L.note('S2-pass-noband-side', r)
  o = ok(r, '.lb-mark', '.pass-who')
  L.check('S2-pass-noband-side', 'pass without band on 874x402: top and foot reachable', o.topOk && o.footOk, { o, r })
  await page.evaluate(() => { for (const s of [document.querySelector('.login'), document.scrollingElement]) s && (s.scrollTop = 1e6) })
  await shot(page, 'S2-pass-noband-foot-side')
  await L.signOut(page)
  /* sign-in with band up (sideways) */
  await L.refuse(page, true)
  await L.signIn(page, 'sidestr2', 'x'); await page.waitForTimeout(500)
  const bandUp = await page.locator('.saveband.is-screen').count()
  L.note('S2-band-at-signin', `after sign in as a stranger with saves refused: band count ${bandUp}`)
  await ctx.close()
  await closeSide()
}
await L.finish('mgb-walk-a2').catch(() => {})
console.log('errors:', L.errs.length ? L.errs : 'none')
process.exit(0)
