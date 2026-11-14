import * as C from './appr-a-common.mjs'
console.log('[appr-a-w3 v1]')
C.initLog('appr-a-w3-log.txt')
const { browser, page } = await C.launchReal125({ w: 1550, h: 917 })
const errs = []; C.watchErrors(page, errs)
await C.stageWorld(page)
const P = page, T = C.T
const setWin = await C.windowCtl(P)
const meas = () => P.evaluate(sel => {
  const b = e => { if (!e) return null; const r = e.getBoundingClientRect(); return { l: +r.left.toFixed(1), t: +r.top.toFixed(1), r: +r.right.toFixed(1), b: +r.bottom.toFixed(1), w: +r.width.toFixed(1), h: +r.height.toFixed(1) } }
  const pk = document.querySelector('[data-testid="appr-range-picker"]'); const card = document.querySelector(`${sel} .appr-card`); const sc = document.querySelector(`${sel} .appr-scroll`)
  const se = document.scrollingElement
  const out = { inner: innerHeight, winRoom: +(se.scrollHeight - se.clientHeight).toFixed(2), picker: b(pk), card: b(card), scroller: b(sc), scTop: sc?.scrollTop, scRoom: sc ? sc.scrollHeight - sc.clientHeight : null }
  if (pk) {
    // every button of the picker: wholly inside card and viewport, and actually hit at its centre
    const bad = []
    for (const e of pk.querySelectorAll('button')) {
      const r = e.getBoundingClientRect(); if (!r.width) continue
      const cx = r.left + r.width / 2, cy = r.top + r.height / 2
      const hit = document.elementFromPoint(cx, cy)
      const inside = r.top >= card.getBoundingClientRect().top - 0.5 && r.bottom <= card.getBoundingClientRect().bottom + 0.5 && r.bottom <= innerHeight + 0.5
      if (!inside || !hit || !(hit === e || e.contains(hit))) bad.push(`${e.dataset.testid}: box ${r.top.toFixed(0)}-${r.bottom.toFixed(0)} insideCard/viewport=${inside} hit=${hit ? (hit.dataset.testid || hit.className || hit.tagName) : 'none'}`)
    }
    out.bad = bad
    const last = [...pk.querySelectorAll('button[data-testid^="appr-range-day-"]')].pop(); out.lastDay = b(last)
    out.pkOverflow = { clientH: pk.clientHeight, scrollH: pk.scrollHeight }
  }
  return out
}, C.PAGE)
for (const h of [680, 560]) {
  C.note(`=== window 1550x${h}`)
  await setWin(1550, h)
  // close picker if open (fresh state)
  if (await P.evaluate(() => !!document.querySelector('[data-testid="appr-range-picker"]'))) { await P.locator(T('appr-pick')).click(); await C.sleep(500) }
  await P.locator(T('appr-all')).click(); await C.sleep(500)
  const m0 = await meas(); C.note('closed: ' + JSON.stringify({ winRoom: m0.winRoom, card: m0.card, scroller: m0.scroller }))
  await P.locator(T('appr-pick')).click(); await C.sleep(800)
  const m = await meas()
  C.note('picker open: ' + JSON.stringify(m))
  await C.shot(P, `w3-${h}-open`)
  C.check(`W3-${h}-room`, m.winRoom <= 0, `window room ${m.winRoom}`)
  C.check(`W3-${h}-whole`, !!m.picker && m.picker.t >= m.card.t && m.picker.b <= m.card.b + 0.5 && m.picker.b <= m.inner, `picker box ${JSON.stringify(m.picker)}, card ${JSON.stringify(m.card)}, screen ${m.inner}, scroller h ${m.scroller?.h}`)
  C.check(`W3-${h}-buttons`, m.bad && m.bad.length === 0, `buttons not wholly visible/hit: ${m.bad ? m.bad.length : 'n/a'} ${m.bad ? m.bad.slice(0, 4).join(' ; ') : ''}`)
  // month arrows
  const prevBox = await P.locator(T('appr-range-next')).boundingBox()
  await P.locator(T('appr-range-next')).click().catch(e => C.note('next click failed: ' + String(e).slice(0, 120))); await C.sleep(400)
  const title1 = await P.locator(T('appr-range-title')).innerText().catch(() => '?')
  await P.locator(T('appr-range-prev')).click().catch(e => C.note('prev click failed: ' + String(e).slice(0, 120))); await C.sleep(400)
  const title2 = await P.locator(T('appr-range-title')).innerText().catch(() => '?')
  C.check(`W3-${h}-arrows`, /February/.test(title1) && /January/.test(title2), `next -> "${title1.replace(/\s+/g, ' ')}", prev -> "${title2.replace(/\s+/g, ' ')}"`)
  // press a day: the last one (28 is in the last row region)
  let pressed = 'ok'
  const dayBtn = P.locator(T('appr-range-day-2026-01-30'))
  try { await dayBtn.click({ timeout: 5000 }) } catch (e) { pressed = 'FAILED ' + String(e).slice(0, 150) }
  await C.sleep(500)
  const afterStart = await P.evaluate(() => (document.querySelector('[data-testid="appr-range-picker"]')?.innerText || '').replace(/\s+/g, ' ').slice(-60))
  C.note(`day 30 pressed: ${pressed}; picker foot words "${afterStart}"`)
  await C.shot(P, `w3-${h}-day-picked`)
  C.check(`W3-${h}-day`, pressed === 'ok' && /end date|Pick an end|30/i.test(afterStart), `pressing a day in the last week: ${pressed}; foot "${afterStart}"`)
  // wheel the list while the picker is open
  const sc = await P.evaluate(sel => document.querySelector(`${sel} .appr-scroll`).getBoundingClientRect().height, C.PAGE)
  const y0 = await C.listY(P)
  await P.mouse.move(700, h > 600 ? 480 : 400)
  const m1 = await C.scMid(P); await P.mouse.move(m1.x, m1.y); await P.mouse.wheel(0, 150); await C.sleep(400)
  const y1 = await C.listY(P)
  C.note(`wheel with picker open: scroller height ${sc}, list ${y0} -> ${y1}, winRoom ${await C.winRoom(P)}`)
  // end the range (Jan 31) then close; wheel again
  await P.locator(T('appr-range-day-2026-01-31')).click().catch(() => {}); await C.sleep(700)
  const stillOpen = await P.evaluate(() => !!document.querySelector('[data-testid="appr-range-picker"]'))
  if (stillOpen) { await P.locator(T('appr-pick')).click(); await C.sleep(500) }
  await P.locator(T('appr-all')).click(); await C.sleep(600)
  const m2 = await meas()
  const mm = await C.scMid(P); await P.mouse.move(mm.x, mm.y)
  const z0 = await C.listY(P); await P.mouse.wheel(0, 150); await C.sleep(400); const z1 = await C.listY(P)
  C.note(`after close, All: list ${z0} -> ${z1}, winRoom ${await C.winRoom(P)}, scroller room ${m2.scRoom}`)
  C.check(`W3-${h}-wheel`, z1 > z0 && (await C.winRoom(P)) <= 0, `list scrolls by the wheel after the picker closes (${z0} -> ${z1}); with picker open ${y0} -> ${y1} (scroller h ${sc})`)
  await C.shot(P, `w3-${h}-after`)
}
C.note('errors ' + JSON.stringify(errs)); C.check('W3-err', errs.length === 0, 'page errors: ' + (errs.join('|') || 'none'))
C.summary()
await Promise.race([browser.close(), C.sleep(8000)])
process.exit(0)
