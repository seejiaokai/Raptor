/* d-21-probe-phonechip2 v1 — the HOST's repeat of the walker's differences 2 and 3: on a phone, what happens to a tap on the
   ALL AVAIL count on View-only Sched and Edit Schedule — which events arrive, whether a click is swallowed, and whether a
   plain click (no touch) opens the window. usage (from raptor-port/): node scripts/handpass/d2028/d-21-probe-phonechip2.mjs */
process.env.HP_URL ||= 'http://localhost:4174'
process.env.HP_SHOTS ||= 'C:/Users/User/projects/Raptor/raptor-port/docs/img/handpass/2026-11-13-rules-check-small-batch/d2028/probe-phonechip2'
const { mkdirSync } = await import('node:fs'); mkdirSync(process.env.HP_SHOTS, { recursive: true })
console.log('d-21 v2')
const F = await import('./d-lib2.mjs')
const { D, X, L, sleep, j, SAT } = F
const w = await D.world('phone')
const { page } = w
console.log('bundle', await D.bundle(page), 'ua', await page.evaluate(() => navigator.userAgent.slice(0, 90)), 'vw', await page.evaluate(() => innerWidth + 'x' + innerHeight))
await F.buildD1(w, { logic: process.argv[2] === 'logic' })  // 'logic': the Logic change made after publication, so the phone week's window is read by a plain click (the tap is [COUNT-CHIP-PHONE-TAP])
const up = () => page.evaluate(() => [...document.querySelectorAll('.win-bar')].filter(e => e.offsetWidth).map(e => e.parentElement.innerText.replace(/\s+/g, ' ').slice(0, 70) + (/Ranger/.test(e.parentElement.innerText) ? ' +Ranger' : ' -Ranger')))
for (const surf of ['view', 'edit']) {
  await D.toSurface(w, surf, SAT)
  const sc = D.chipScope(surf, SAT)
  const el = page.locator(sc + ' .oilcount:visible').first()
  await el.evaluate(e => e.scrollIntoView({ block: 'center' })); await sleep(300)
  await page.evaluate(() => {
    window.__ev = []
    for (const ty of ['pointerdown', 'pointerup', 'pointercancel', 'touchstart', 'touchend', 'touchcancel', 'click'])
      document.addEventListener(ty, e => window.__ev.push(ty + '@' + (e.target.className || e.target.tagName) + (e.defaultPrevented ? '!prevented' : '')), { capture: true })
    window.addEventListener('click', e => window.__ev.push('click-bubbled-to-window' + (e.cancelBubble ? '(stopped)' : '')), false)
  })
  await X.pic(page, `${surf}-0-chip`, sc + ' .oilcount')
  await el.tap(); await sleep(900)
  console.log(surf, 'TAP events', j(await page.evaluate(() => window.__ev)), 'window', j(await up()), 'ARM', await page.evaluate(() => window.ARM && window.ARM.key))
  await D.shot(page, `${surf}-1-after-tap`)
  if ((await up()).length) await D.closeAA(w)
  await page.evaluate(() => { const d = document.querySelector('[data-disarm]'); if (window.ARM && d) d.click(); window.__ev = [] })
  await D.toSurface(w, surf, SAT); await sleep(400)
  const el2 = page.locator(sc + ' .oilcount:visible').first()
  await el2.evaluate(e => { e.scrollIntoView({ block: 'center' }); e.click() }); await sleep(900)
  console.log(surf, 'PLAIN CLICK events', j(await page.evaluate(() => window.__ev)), 'window', j(await up()), 'ARM', await page.evaluate(() => window.ARM && window.ARM.key))
  await D.shot(page, `${surf}-2-after-plain-click`)
  if ((await up()).length) await D.closeAA(w)
  await page.evaluate(() => { const d = document.querySelector('[data-disarm]'); if (window.ARM && d) d.click() })
}
await w.browser.close()
