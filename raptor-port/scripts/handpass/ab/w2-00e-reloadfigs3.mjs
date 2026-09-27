/* W2 probe e — picture Drifter's every-figure sheet before and after a plain reload (one write first), and what the
   Leave War's stored openings / ledger hold across it (read only). */
process.env.AB_WHO = 'w2'
const L = await import('./ab-lib.mjs')
const W = await import('./w2-lib.mjs')
const { openHi } = await import('../am/w2-lib.mjs')
const WD = process.argv[2] || 'desktop'
const { browser, page, errors } = await openHi({ width: WD === 'phone' ? 390 : 1440, height: WD === 'phone' ? 844 : 900, who: 'a', dpr: WD === 'phone' ? 2 : 1 })
await L.toastSpy(page)
const store = () => page.evaluate(() => ({ openings: localStorage.getItem('raptor:leavewar/openings'), ledger: (localStorage.getItem('raptor:leavewar/ledger') || '').slice(0, 400), current: localStorage.getItem('raptor:leavewar/current') }))
const sheet = async (name) => {
  await L.lwOpen(page, '2026-07-20')
  const who = page.locator('[data-testid="person-slipway"]:visible').first()
  await who.evaluate(e => e.scrollIntoView({ block: 'center' })); await who.click(); await page.waitForTimeout(600)
  const txt = await page.evaluate(() => [...document.querySelectorAll('[data-testid^="pfig-"]')].map(e => (e.innerText || '').replace(/\s+/g, ' ').trim()).filter(Boolean).slice(0, 12))
  await L.shot(page, name)
  const x = page.locator('[data-testid="pfig-close"]:visible').first(); if (await x.count()) await x.click()
  return txt
}
await W.fileMed(page, { person: 'dice', type: 'ATT C', from: '2026-07-22', remarks: 'probe write before reload' })
console.log('before', JSON.stringify(await sheet(`w2-00e-${WD}-drifter-figures-before-reload`)))
console.log('store before', JSON.stringify(await store()))
await W.reload(page, 'a')
console.log('after', JSON.stringify(await sheet(`w2-00e-${WD}-drifter-figures-after-reload`)))
console.log('store after', JSON.stringify(await store()))
console.log('errors', JSON.stringify(errors.slice(0, 10)))
await browser.close()
