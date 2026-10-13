// W1 part C — scenario 13 at the size given (390x844 | 320x568 | 844x390), and scenario 14 at 390x844. VERSION 2
import { start, openCalendarWindow, press, shot, text, rect, vis, swipeFrom, cardOnTop, pass, rec, summary, results } from './lib.mjs'
const SIZES = { '390x844': [390, 844], '320x568': [320, 568], '844x390': [844, 390] }
const SZ = process.argv[2] || '390x844'
const [W, H] = SIZES[SZ]
console.log(`w1/c.mjs VERSION 2 — ${SZ}`)
const L = await start(W, H)
const { page } = L
const step = async (id, fn) => { try { await fn() } catch (e) { rec(id, SZ, 'NOT WALKED', 'the script stopped: ' + String(e).split('\n')[0].slice(0, 200)); await shot(L, `s${id}-${SZ}-STOPPED`).catch(() => {}) } }
const title = () => text(L, '[data-testid="dcal-title"]')
const sel = id => page.evaluate(i => { const l = document.querySelector(`[data-testid="${i}"]`); if (!l) return null; const o = l.querySelector('[aria-selected="true"]'); return o ? o.innerText.trim() : null }, id)
const optRows = id => page.evaluate(i => [...document.querySelectorAll(`[data-testid="${i}"] [role=option]`)].map(o => o.innerText.trim()), id)
/* a finger scroll on a list: starts inside the list, rests before it lifts */
async function fingerScroll(id, dy) {
  const r = await rect(L, `[data-testid="${id}"]`)
  await swipeFrom(L, r.l + r.w / 2, r.t + r.h / 2 - dy / 2, 0, dy)
  await page.waitForTimeout(700)
}
async function openFrom() {
  await openCalendarWindow(L)
  await press(L, '[data-testid="days-wd-3"]')
  await page.waitForSelector('[data-testid="win-every"]')
  await page.locator('[data-testid="every-from"]').scrollIntoViewIfNeeded()
  await press(L, '[data-testid="every-from"]')
}

if (SZ === '390x844' || true) await step('13', async () => {
  await openFrom()
  const fromBefore = await text(L, '[data-testid="every-from"]')
  const c0 = await cardOnTop(L, 'From')
  const f0 = await shot(L, `s13-${SZ}-1-dates-open`)
  const nav0 = await rect(L, '[data-testid="dcal-next"]'), prev0 = await rect(L, '[data-testid="dcal-prev"]')
  const months = [c0.month]
  for (let i = 0; i < 3; i++) { await press(L, '[data-testid="dcal-next"]'); months.push((await cardOnTop(L, 'From')).month) }
  const nav1 = await rect(L, '[data-testid="dcal-next"]'), prev1 = await rect(L, '[data-testid="dcal-prev"]')
  const c1 = await cardOnTop(L, 'From')
  const f1 = await shot(L, `s13-${SZ}-2-after-three-next`)
  await press(L, '[data-testid="dcal-title"]'); await page.waitForTimeout(400)
  const cL = await cardOnTop(L, 'lists')
  const t1 = await title(), s1 = { month: await sel('dcal-months'), year: await sel('dcal-years') }
  const f2 = await shot(L, `s13-${SZ}-3-lists`)
  /* the year list: a finger scroll until the year is two on */
  const y0 = +s1.year; const log = []
  for (let k = 0; k < 6; k++) {
    const cur = +(await sel('dcal-years'))
    if (cur >= y0 + 2) break
    await fingerScroll('dcal-years', -(cur === y0 ? 88 : 44))
    log.push(await sel('dcal-years'))
  }
  const yAfter = await sel('dcal-years'), t2 = await title()
  const f3 = await shot(L, `s13-${SZ}-4-year-two-on`)
  /* the month list, down past December */
  const mLog = [await sel('dcal-months')]
  for (let k = 0; k < 15; k++) { await fingerScroll('dcal-months', -44); mLog.push(await sel('dcal-months')) }
  const t3 = await title(), rows = await optRows('dcal-months')
  const f4 = await shot(L, `s13-${SZ}-5-month-list-scrolled`)
  await press(L, '[data-testid="dcal-title"]'); await page.waitForTimeout(400)
  const c2 = await cardOnTop(L, 'dates-again'); const t4 = await title(); const m4 = c2.month
  const f5 = await shot(L, `s13-${SZ}-6-dates-back`)
  await press(L, '[data-testid="dcal-today"]'); await page.waitForTimeout(400)
  const c3 = await cardOnTop(L, 'after-today')
  const today = await page.evaluate(() => { const e = document.querySelector('.dcal-d.is-today'); if (!e) return null; const s = getComputedStyle(e), b = getComputedStyle(e.querySelector('b') || e); const bb = e.querySelector('b') ? getComputedStyle(e.querySelector('b')).backgroundColor : null; return { iso: e.getAttribute('data-iso'), bgBtn: s.backgroundColor, bgNumber: bb, col: b.color, picked: !!document.querySelector('.dcal-d.is-sel'), pickedIso: (document.querySelector('.dcal-d.is-sel') || {}).dataset ? document.querySelector('.dcal-d.is-sel').dataset.iso : null } })
  const t5 = await title(), boxNow = await text(L, '[data-testid="every-from"]')
  const f6 = await shot(L, `s13-${SZ}-7-after-today`)
  await page.touchscreen.tap(4, 4); await page.waitForTimeout(400)
  const closed = !(await vis(L, '[data-testid="dcal-card"]'))
  const fromAfter = await text(L, '[data-testid="every-from"]'), everyOpen = await vis(L, '[data-testid="win-every"]')
  const f7 = await shot(L, `s13-${SZ}-8-after-outside-tap`)
  const arrowsStill = nav0.l === nav1.l && nav0.t === nav1.t && prev0.l === prev1.l && prev0.t === prev1.t
  const sameCard = cL.w === c1.w && cL.h === c1.h
  const wrapped = mLog.some((m, i) => /^Dec/.test(m) && /^Jan/.test(mLog[i + 1] || ''))
  const ok = c0.onScreen && c0.onTop && arrowsStill && sameCard && closed && fromAfter === fromBefore && everyOpen && /Oct/.test(t5) && today && today.bgNumber !== 'rgba(0, 0, 0, 0)' && wrapped && (+yAfter === y0 + 2)
  pass('13', SZ, ok, `calendar box ${JSON.stringify({ l: c0.l, t: c0.t, r: c0.r, b: c0.b })} on screen ${c0.onScreen}, on top ${c0.onTop}; after three next arrows months ${months.join(' > ')}, arrows next ${JSON.stringify(nav0)}->${JSON.stringify(nav1)} prev ${JSON.stringify(prev0)}->${JSON.stringify(prev1)} (still ${arrowsStill}); card size dates ${c1.w}x${c1.h} vs lists ${cL.w}x${cL.h} (same ${sameCard}), lists on screen ${cL.onScreen} on top ${cL.onTop}; title on lists "${t1}", chosen ${JSON.stringify(s1)}; year scroll steps ${JSON.stringify(log)} -> year ${yAfter} (wanted ${y0 + 2}), title "${t2}"; month list chosen after each finger scroll ${JSON.stringify(mLog)} (after December comes January: ${wrapped}); title "${t3}"; month rows (${rows.length}) ${JSON.stringify(rows.slice(0, 14))}; title tapped again: dates back on ${m4}, title "${t4}"; Today icon: title "${t5}", today ${JSON.stringify(today)}, From box "${boxNow}"; tap outside: calendar closed ${closed}, From box "${fromAfter}" (before: "${fromBefore}"), Every window still open ${everyOpen}`, f7)
})

if (SZ === '390x844') await step('14', async () => {
  /* the Every window is still up from 13; open the From calendar again */
  if (!(await vis(L, '[data-testid="win-every"]'))) { await openFrom() } else await press(L, '[data-testid="every-from"]')
  const c0 = await cardOnTop(L, 'From'); const e0 = await rect(L, '[data-testid="win-every"]')
  const f0 = await shot(L, 's14-1-open-at-390x844')
  await page.setViewportSize({ width: 844, height: 390 }); await page.waitForTimeout(800)
  const open1 = await vis(L, '[data-testid="dcal-card"]')
  const c1 = open1 ? await cardOnTop(L, 'turned') : null
  const e1 = await rect(L, '[data-testid="win-every"]'), from1 = await text(L, '[data-testid="every-from"]').catch(() => '')
  const f1 = await shot(L, 's14-2-turned-to-844x390')
  await page.setViewportSize({ width: 390, height: 844 }); await page.waitForTimeout(800)
  const open2 = await vis(L, '[data-testid="dcal-card"]')
  const early = open2 ? await cardOnTop({ page, W: 390, H: 844 }, 'back-early') : null
  await page.waitForTimeout(3000)
  L.W = 390; L.H = 844
  const c2 = open2 ? await cardOnTop(L, 'back') : null
  const e2 = await rect(L, '[data-testid="win-every"]'), from2 = await text(L, '[data-testid="every-from"]').catch(() => '')
  const f2 = await shot(L, 's14-3-back-at-390x844')
  const D = c => c ? JSON.stringify({ l: c.l, t: c.t, r: c.r, b: c.b, onScreen: c.onScreen, onTop: c.onTop, month: c.month }) : 'closed'
  rec('14', SZ, 'RECORD', `calendar open at 390x844: ${D(c0)}. After turning to 844x390: calendar ${open1 ? 'stayed open' : 'closed'} ${D(c1)}; the Every window ${JSON.stringify(e0)} -> ${JSON.stringify(e1)}; From box "${from1}". After turning back to 390x844: calendar ${open2 ? 'stayed open' : 'closed'}, at 0.8s ${D(early)}, at 4s ${D(c2)}; Every window ${JSON.stringify(e2)}; From box "${from2}"`, f1)
})
console.log('\nRESULTS_JSON ' + JSON.stringify(results))
summary('c ' + SZ)
await L.browser.close()
