// draw-tick.mjs — Approvals on a phone, the half-day date's line with the decided look's tick (as built on pull request
// 861) and without it (the question put to him, chat 197, 28 Nov 26: [LW-DECIDE-LOOK], his D2881 against D1441). Drawn
// on the real app: the branch's build served on PORT, the "without" frame only hiding the tick in Approvals' buttons.
// Run from raptor-port/:  PORT=4174 node docs/mock/2026-11-28-appr-phone-tick/draw-tick.mjs
import path from 'node:path'
import { fileURLToPath } from 'node:url'
const here = path.dirname(fileURLToPath(import.meta.url))
process.env.LWDL_OUT = path.join(here, 'img')
const { run, signIn, press, pic, T, sleep, closeBrowsers } = await import('../../../scripts/handpass/lwdl-lib.mjs')

await run('tick', ['p402', 'p390', 'p360'], async S => {
  const page = S.page
  await signIn(S); await press(S, T('lw-tab-approvals')); await sleep(page, 900)
  /* the first line holding a half day (its date carries AM or PM) */
  const mark = () => page.evaluate(() => {
    const ls = [...document.querySelectorAll('[data-testid="approvals-page"] [data-testid^="appr-line-"]')]
    const l = ls.find(x => / (AM|PM)/.test(x.querySelector('[data-testid="appr-dates"]')?.innerText || ''))
    if (!l) return null
    l.setAttribute('data-tk', '1')
    const d = l.querySelector('[data-testid="appr-dates"]'); const r = d.getBoundingClientRect()
    return { text: d.innerText.replace(/\n/g, ' / '), lines: Math.round(r.height / (parseFloat(getComputedStyle(d).lineHeight) || 15)), rowH: Math.round(l.getBoundingClientRect().height) }
  })
  const a = await mark()
  if (!a) { S.note('no half-day line'); return }
  await page.locator('[data-tk="1"]').scrollIntoViewIfNeeded()
  S.note('with the tick: ' + JSON.stringify(a))
  await pic(S, 'with-tick', ['[data-tk="1"]'], { pad: 10 })
  await page.addStyleTag({ content: '[data-testid="approvals-page"] .appr-btns .dec-ic{display:none !important}' })
  await sleep(page, 200)
  const b = await mark()
  S.note('without the tick: ' + JSON.stringify(b))
  await pic(S, 'without-tick', ['[data-tk="1"]'], { pad: 10 })
})
await closeBrowsers()
