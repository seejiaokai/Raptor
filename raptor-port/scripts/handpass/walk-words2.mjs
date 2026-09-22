/* WORDING 12 (finger targets at 390px), 8 (two "✓ Done" buttons at once),
   10 ("tap to see each one" does nothing), 17 (no acknowledgement after a
   gesture). All four need the app on screen. */
import { open, board, openInputs, tap, shot, SHOTS } from './lib.mjs'
const L = []; const S = (k, v) => { L.push({ [k]: v }); return v }

/* ---------- 12: the tap targets, at a phone width ---------------------- */
{
  const { browser, page } = await open({ state: 'C:/Users/User/projects/Raptor/raptor-port/docs/handpass/state-sat.json' })
  await board(page, 5); await openInputs(page, 5)
  await tap(page, '#sbOil'); await page.waitForTimeout(800)
  await page.setViewportSize({ width: 390, height: 844 }); await page.waitForTimeout(900)
  S('12 — tap targets at 390px', await page.evaluate(() => {
    const t = [...document.querySelectorAll('.oilpk, .oilitem[data-oilitem], .oilcount')].filter(e => e.offsetParent)
    const sizes = t.map(e => { const r = e.getBoundingClientRect(); return { w: Math.round(r.width), h: Math.round(r.height) } })
    const hs = sizes.map(s => s.h).sort((a, b) => a - b)
    return {
      count: t.length,
      shortest: hs[0], median: hs[Math.floor(hs.length / 2)], tallest: hs[hs.length - 1],
      under24px: hs.filter(h => h < 24).length,
      under44px: hs.filter(h => h < 44).length,
      narrowest: Math.min(...sizes.map(s => s.w)),
    }
  }))
  await shot(page, 'w12-phone-targets')
  await browser.close()
}

/* ---------- 8: two "✓ Done" buttons at once ---------------------------- */
{
  const { browser, page } = await open({ state: 'C:/Users/User/projects/Raptor/raptor-port/docs/handpass/state-sat.json' })
  await board(page, 5)
  const done = () => page.evaluate(() => [...document.querySelectorAll('button')].filter(e => e.offsetParent)
    .filter(e => /done/i.test(e.innerText || ''))
    .map(e => ({ id: e.id, txt: (e.innerText || '').replace(/\s+/g, ' ').trim(), title: (e.title || '').slice(0, 56),
                 inBoard: !!e.closest('#schedBoard') })))
  S('8 — Done buttons, mode OFF', await done())
  await tap(page, '#sbOil'); await page.waitForTimeout(800)
  S('8 — Done buttons, mode ON', await done())
  await shot(page, 'w08-two-done-desktop')
  await page.setViewportSize({ width: 390, height: 844 }); await page.waitForTimeout(800)
  S('8 — and at 390px', await done())
  await shot(page, 'w08-two-done-phone')
  await browser.close()
}

console.log(JSON.stringify(L, null, 1)); console.log('shots in ' + SHOTS)
