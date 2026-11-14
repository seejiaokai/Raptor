/* rcf-w3 S24 v1 — Insights: a blank landing adds no hours (D1936). Ranger's week figures before the Friday sortie,
   with it (take-off 19:30, landing blank), then with a typed landing.
   usage: RCF_RUN=s24-r1 node scripts/handpass/rcf/rcf-w3-s24.mjs */
const W = await import('./rcf-w3-lib.mjs')
const { L, say, check, nrm } = W
console.log('rcf-w3-s24 v1', W.SHOTS)
const { browser, page, errors } = await W.openWorld()
const FRI = 4
async function insights(tag) {
  const b = page.locator('#schedBoard button:has-text("Insights"):visible').first()
  await b.click(); await page.waitForTimeout(900)
  // show all, so Ranger is on the list whatever his rank
  const all = page.getByText(/Show all/).first()
  if (await all.count()) { await all.click().catch(() => {}); await page.waitForTimeout(300) }
  const t = nrm(await page.evaluate(() => document.body.innerText))
  const hrs = t.slice(t.indexOf('WORK HOURS'))
  const sorties = (t.slice(0, t.indexOf('WORK HOURS')).match(/Ranger (\d+)/) || [])[1]
  const hours = (hrs.match(/Ranger (\d+h\d*)/) || [])[1]
  say(`[${tag}] Insights: Ranger sorties ${sorties}, work hours ${hours}`)
  await L.shot(page, `insights-${tag}`)
  await page.keyboard.press('Escape'); await page.waitForTimeout(500)
  if (/Week insights/.test(await page.evaluate(() => document.body.innerText)) && await page.locator('text=Week insights').first().isVisible().catch(() => false)) {
    const x = page.locator('button:has-text("✕"):visible').first(); await x.click().catch(() => {}); await page.waitForTimeout(400)
  }
  return { sorties, hours }
}
await L.board(page, FRI)
const base = await insights('0-before')
const wi = await W.addWave(page, FRI)
await W.setF(page, `ff:${FRI}.${wi}.0.to`, '19:30')
await W.seat(page, `[data-slot="${FRI}.${wi}.0.0.p"]`, 'bane')
const blank = await insights('1-landing-blank')
await W.setF(page, `ff:${FRI}.${wi}.0.ld`, '21:00'); await page.waitForTimeout(400)
const real = await insights('2-landing-2100')
say('RECORD Ranger work hours: before', base.hours, '| take-off 19:30 landing blank', blank.hours, '| landing 21:00', real.hours)
check('S24 blank landing adds no hours', blank.hours === base.hours, `before ${base.hours}, blank ${blank.hours}, with a real landing ${real.hours}; sorties ${base.sorties} -> ${blank.sorties} -> ${real.sorties}`)
check('S24 a real landing does add hours (the read can tell)', real.hours !== base.hours, `before ${base.hours}, real ${real.hours}`)
check('S24 no console/page errors', errors.length === 0, errors.slice(0, 3).join(' | '))
await browser.close()
W.summary()
