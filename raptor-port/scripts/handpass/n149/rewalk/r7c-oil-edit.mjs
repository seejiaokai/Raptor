// Re-walk round 2 — an ordinary OIL edit redraws (the war's change count was touched by A2's fix). Saber, by presses:
// Leave War → OIL → a 142 man's name → +1 with a reason → Save: his balance; ✕; Balances: his OIL figure. Pick 149, the same
// for a 149 man; pick 142 back: the 142 man's figures as left.
import { serve, stop, newPage, signIn, pick, note, save, errs, facts } from '../walk/lib.mjs'
import { navTo } from '../walk/w1-view.mjs'
import { step, press, shot, vis, text } from './rlib.mjs'

const SZS = (process.env.SZ || 'd,p').split(',')
const T = id => `[data-testid="${id}"]`
const q = (s, id) => s.page.evaluate(id => document.querySelector(`[data-testid="${id}"]`)?.textContent.replace(/\s+/g, ' ').trim() ?? null, id)
async function credit(s, P, pid) {
  await press(s, T('oil-tracker')); await s.page.waitForTimeout(800)
  facts[`${P}-${pid}-oil-before`] = await q(s, `oil-bal-${pid}`)
  const nm = s.page.locator(T(`oil-name-${pid}`)).first(); await nm.scrollIntoViewIfNeeded(); if (s.desk) await nm.click(); else await nm.tap(); await s.page.waitForTimeout(400)
  await s.page.locator(T('oil-amt')).first().fill('1')
  facts[`${P}-${pid}-reason-box`] = await vis(s, T('oil-reason'))
  if (facts[`${P}-${pid}-reason-box`]) await s.page.locator(T('oil-reason')).first().fill('Re-walk credit')
  await shot(s, `${P}-${pid}-1-credit-form.png`, [T('oil-credit-panel')])
  await press(s, T('oil-credit-save')); await s.page.waitForTimeout(600)
  facts[`${P}-${pid}-oil-err`] = await q(s, 'oil-credit-err')
  facts[`${P}-${pid}-oil-after`] = await q(s, `oil-bal-${pid}`)
  await shot(s, `${P}-${pid}-2-after-credit.png`)
  await press(s, T('oil-close'))
  await press(s, T('lw-tab-balances')); await s.page.waitForTimeout(700)
  facts[`${P}-${pid}-bal-oil`] = await q(s, `bal-oil-${pid}`)
  await shot(s, `${P}-${pid}-3-balances.png`)
}

await serve()
try {
  for (const sz of SZS) {
    const s = await newPage(sz); const P = `r7c-${sz}`
    await signIn(s, 'ad', 'a')
    await step('142 credit', async () => { await navTo(s, 'Leave War'); await s.page.waitForTimeout(1200); await credit(s, P, 'dice') })
    await step('149 credit', async () => { await pick(s, '149'); await s.page.waitForTimeout(600); await credit(s, P, 'kes9') })
    await step('back to 142', async () => {
      await pick(s, '142'); await s.page.waitForTimeout(700)
      facts[`${P}-back-bal-oil-dice`] = await q(s, 'bal-oil-dice'); facts[`${P}-back-kes9-shown`] = await vis(s, T('bal-row-kes9'))
    })
    await s.ctx.close()
  }
} finally { save('r7c'); await stop() }
console.log(JSON.stringify(facts, null, 1))
console.log('errs', errs.length, errs.slice(0, 10))
