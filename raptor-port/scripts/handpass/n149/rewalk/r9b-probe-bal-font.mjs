// Re-walk round 2, a probe: on the phone (WebKit) the Leave War's Balances tab drew in a serif letter. Reads the computed
// letter family of Balances' parts and of the tab row beside them, phone and desktop; the search's ⌕ pressed on the phone.
import { serve, stop, newPage, signIn, save, errs, facts } from '../walk/lib.mjs'
import { navTo } from '../walk/w1-view.mjs'
import { step, press, shot, vis } from './rlib.mjs'

const T = id => `[data-testid="${id}"]`
await serve()
try {
  for (const sz of ['p', 'd']) {
    const s = await newPage(sz); const P = `r9b-${sz}`
    await signIn(s, 'ad', 'a')
    await step('fonts', async () => {
      await navTo(s, 'Leave War'); await s.page.waitForTimeout(1200); await press(s, T('lw-tab-balances')); await s.page.waitForTimeout(800)
      facts[`${P}-fonts`] = await s.page.evaluate(() => {
        const f = sel => { const e = document.querySelector(sel); if (!e) return null; const c = getComputedStyle(e); return `${c.fontFamily} | ${c.fontSize}` }
        return { tab: f('[data-testid="lw-tab-balances"]'), view: f('[data-testid="bal-view-bal"]'), name: f('[data-testid^="bal-name-"]'), row: f('[data-testid^="bal-row-"]'), grades: f('[data-testid="bal-grades"]'), body: f('body'), page: f('#page-leavewar') }
      })
      facts[`${P}-search-box-shown`] = await vis(s, T('bal-search'))
      if (!s.desk && !facts[`${P}-search-box-shown`]) {
        const b = s.page.locator('[aria-label*="earch"]:visible, [title*="earch"]:visible').first()
        if (await b.count()) { await b.tap(); await s.page.waitForTimeout(400); facts[`${P}-search-after-tap`] = await vis(s, T('bal-search')); await shot(s, `${P}-search-open.png`) }
      }
    })
    await s.ctx.close()
  }
} finally { save('r9b'); await stop() }
console.log(JSON.stringify(facts, null, 1))
console.log('errs', errs.length, errs.slice(0, 10))
