/* WALKER G — the sizes the brief names beyond 1440x900 and 390x844: 390x568, 844x390 (a phone on its side) and 1536x864.
   What is asked of each: the Inputs month with a shared bar, the day window opened over it, the settings window and the
   "Calendar" window opened from the gear, the SANS month — each whole on the screen, nothing running sideways, the front
   window the thing found at its centre. Not a full re-walk of the nine scenarios. */
import * as G from './cal-G-lib.mjs'
const { L, sleep } = G
G.setTag('sizes')
const SIZES = [
  { n: '390x568', vp: { width: 390, height: 568 }, phone: true },
  { n: '844x390', vp: { width: 844, height: 390 }, phone: true },
  { n: '1536x864', vp: { width: 1536, height: 864 }, phone: false },
]
const browser = await L.launch()
const out = []
for (const S of SIZES) {
  const ctx = await browser.newContext({ viewport: S.vp, ...(S.phone ? { isMobile: true, hasTouch: true } : {}) })
  const errors = []
  const p = await L.page(ctx, errors)
  await p.goto(G.BASE + '/'); await L.signIn(p, 'a', { goto: false })
  const tid = id => p.locator(`[data-testid="${id}"]`)
  const r = { size: S.n }
  const side = () => p.evaluate(() => ({ sw: document.documentElement.scrollWidth, iw: innerWidth, ih: innerHeight }))
  const winCheck = async t => p.evaluate(testid => {
    const w = document.querySelector(`[data-testid="${testid}"]`); if (!w) return 'not up'
    const b = w.getBoundingClientRect(), e = document.elementFromPoint(b.left + b.width / 2, Math.min(b.top + b.height / 2, innerHeight - 4))
    return { rect: [Math.round(b.left), Math.round(b.top), Math.round(b.width), Math.round(b.height)], inView: b.left >= 0 && b.top >= 0 && b.right <= innerWidth + 1 && b.bottom <= innerHeight + 1, frontAtCentre: !!e && w.contains(e) }
  }, t)
  await L.go(p, 'inputs'); await G.toInputsCal(p); await G.monthTo(p, 2026, 6)
  r.month = await side(); r.f1 = await G.shot(p, `${S.n}-inputs-month`)
  await G.openDay(p, '2026-07-23'); await sleep(500)
  r.day = { ...(await side()), win: await winCheck('win-inputsday') }; r.f2 = await G.shot(p, `${S.n}-day-open`)
  await p.keyboard.press('Escape'); await sleep(300)
  // gear > Calendar…
  await tid('in-gear').click(); await tid('win-inputsset').waitFor(); await sleep(400)
  r.settings = { ...(await side()), win: await winCheck('win-inputsset') }; r.f3 = await G.shot(p, `${S.n}-settings`)
  await tid('iset-days').click(); await tid('win-days').waitFor(); await sleep(500)
  r.calendar = { ...(await side()), win: await winCheck('win-days') }; r.f4 = await G.shot(p, `${S.n}-calendar-window`)
  // SANS month
  for (const w of ['win-days', 'win-inputsset']) if (await tid(w).count()) { await tid(w + '-x').click({ timeout: 3000 }).catch(() => {}); await sleep(250) }
  await p.locator('#inSansMode').click(); await sleep(600)
  r.sans = await side(); r.f5 = await G.shot(p, `${S.n}-sans-month`)
  r.errors = errors
  console.log(S.n, JSON.stringify(r))
  out.push(r)
  await ctx.close()
}
G.row('SIZES', 'Inputs month > opened 23 Jul > gear > "Calendar…" > SANS month at 390x568, 844x390 and 1536x864', JSON.stringify(out.map(o => ({ size: o.size, month: o.month, day: o.day, settings: o.settings, calendar: o.calendar, sans: o.sans, errors: o.errors }))), 'RECORDED', out.flatMap(o => [o.f1, o.f2, o.f3, o.f4, o.f5]))
G.saveRows('sizes')
await browser.close()
