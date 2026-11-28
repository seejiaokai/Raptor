// Re-walk of the fixes (23 Nov 26) — step 0, a look round: Ranger (142) and Osprey (149) on the Leave War: their own rows,
// which days are open to a bid, and what the bid window offers when a member presses one of his own days. Reads only.
import { serve, stop, newPage, signIn, shot, note, save, errs, facts } from '../walk/lib.mjs'
import { navTo } from '../walk/w1-view.mjs'

await serve()
try {
  for (const [u, p] of [['us', 'us'], ['us9', 'us9']]) {
    const s = await newPage('d')
    await signIn(s, u, p)
    await navTo(s, 'Leave War'); await s.page.waitForTimeout(1500)
    facts[`${u}-tabs`] = await s.page.evaluate(() => [...document.querySelectorAll('[data-testid^="lw-tab-"]')].map(e => e.dataset.testid + ':' + e.textContent.trim()))
    facts[`${u}-rows`] = await s.page.evaluate(() => [...document.querySelectorAll('[data-testid^="row-"]')].map(e => e.dataset.testid).slice(0, 40))
    facts[`${u}-cells-sample`] = await s.page.evaluate(() => [...document.querySelectorAll('[data-testid^="cell-"]')].map(e => e.dataset.testid).slice(0, 5))
    facts[`${u}-cells-count`] = await s.page.evaluate(() => document.querySelectorAll('[data-testid^="cell-"]').length)
    facts[`${u}-open-chip`] = await s.page.evaluate(() => { const e = document.querySelector('[data-testid="open-chip"]'); return e ? e.textContent.trim() : null })
    facts[`${u}-mine`] = await s.page.evaluate(() => { const e = document.querySelector('.lw-me, [data-me="1"], [aria-current="true"]'); return e ? e.outerHTML.slice(0, 200) : null })
    await shot(s, `r0-${u}-leavewar.png`)
    await s.ctx.close()
  }
} finally { save('r0'); await stop() }
console.log(JSON.stringify(facts, null, 1).slice(0, 4000))
console.log('errs', errs.length, errs.slice(0, 10))
