// Re-walk round 2, a probe: r7's pick from the Leave War's OIL tab timed out. Saber, desktop (SZ=p for the phone): Leave
// War → OIL, picture; what lies over the Schedules menu's button; then the pick pressed, and what the page does.
import { serve, stop, newPage, signIn, pick, note, save, errs, facts } from '../walk/lib.mjs'
import { navTo } from '../walk/w1-view.mjs'
import { step, press, shot, vis } from './rlib.mjs'

const SZ = process.env.SZ || 'd'
const T = id => `[data-testid="${id}"]`
const over = s => s.page.evaluate(() => {
  const b = document.querySelector('#sqnMenuBtn'); if (!b) return 'no button'
  const r = b.getBoundingClientRect(); const x = r.left + r.width / 2, y = r.top + r.height / 2
  const top = document.elementFromPoint(x, y)
  return { box: [Math.round(r.left), Math.round(r.top), Math.round(r.width), Math.round(r.height)], hidden: b.offsetParent === null, top: top ? `${top.tagName}#${top.id}.${String(top.className).slice(0, 60)}|${top.dataset?.testid || ''}` : null, inert: !!b.closest('[inert]') }
})
await serve()
try {
  const s = await newPage(SZ); const P = `r7b-${SZ}`
  await signIn(s, 'ad', 'a')
  await step('OIL then pick', async () => {
    await navTo(s, 'Leave War'); await s.page.waitForTimeout(1200)
    facts.before = await over(s)
    await press(s, T('oil-tracker')); await s.page.waitForTimeout(900)
    facts.onOil = await over(s); facts.oilRows = await s.page.evaluate(() => document.querySelectorAll('[data-testid^="oil-row-"]').length)
    await shot(s, `${P}-on-oil.png`)
    const ok = await Promise.race([pick(s, '149').then(() => 'picked'), new Promise(r => setTimeout(() => r('timeout 8s'), 8000))])
    facts.pick = ok
    await shot(s, `${P}-after-pick-try.png`)
    facts.after = await over(s)
    facts.menuOpen = await vis(s, '#sqnMenu')
    await press(s, T('lw-tab-grid')); await s.page.waitForTimeout(600)
    facts.onGrid = await over(s)
  })
  await s.ctx.close()
} finally { save('r7b'); await stop() }
console.log(JSON.stringify(facts, null, 1))
console.log('errs', errs.length, errs.slice(0, 10))
