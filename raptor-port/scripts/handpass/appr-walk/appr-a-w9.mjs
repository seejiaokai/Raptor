import * as C from './appr-a-common.mjs'
console.log('[appr-a-w9 v1]')
C.initLog('appr-a-w9-log.txt')
const { browser, page } = await C.launchReal125({ w: 1550, h: 917 })
const errs = []; C.watchErrors(page, errs)
await C.stageWorld(page)
const P = page, T = C.T
const focusInfo = () => P.evaluate(sel => {
  const e = document.activeElement; if (!e || e === document.body) return { none: true }
  const r = e.getBoundingClientRect(); const cols = document.querySelector(`${sel} .appr-cols`).getBoundingClientRect(); const sc = document.querySelector(`${sel} .appr-scroll`); const scr = sc.getBoundingClientRect(); const card = document.querySelector(`${sel} .appr-card`).getBoundingClientRect()
  const cs = getComputedStyle(e)
  const inList = !!e.closest('.appr-scroll')
  return { tid: e.dataset.testid || e.className || e.tagName, text: e.innerText.replace(/\s+/g, ' ').trim().slice(0, 20), inList, top: +r.top.toFixed(1), bottom: +r.bottom.toFixed(1), colsBottom: +cols.bottom.toFixed(1), scBottom: +scr.bottom.toFixed(1), fadeTop: +(card.bottom - 28).toFixed(1), scTop: +sc.scrollTop.toFixed(1), winY: scrollY, outline: cs.outlineStyle + ' ' + cs.outlineWidth + ' ' + cs.outlineColor, shadow: cs.boxShadow.slice(0, 60), underHeadings: inList && r.top < cols.bottom - 0.5, underBottom: inList && r.bottom > scr.bottom + 0.5, underFade: inList && r.bottom > card.bottom - 28 + 0.5 }
}, C.PAGE)
// click an empty area to the left of Approve all (the gap after the chips), nothing pressed
const aa = (await C.boxes(P)).approveAll
const pt = { x: aa.l - 60, y: aa.t + aa.h / 2 }
await P.mouse.click(pt.x, pt.y); await C.sleep(400)
C.note(`clicked empty area at ${pt.x.toFixed(0)},${pt.y.toFixed(0)} (Approve all left edge ${aa.l}); focus: ${JSON.stringify(await focusInfo())}`)
await C.shot(P, 'w9-0-start')
const stops = []
for (let i = 1; i <= 15; i++) {
  await P.keyboard.press('Tab'); await C.sleep(250)
  const f = await focusInfo(); stops.push(f)
  C.note(`Tab ${i}: ${JSON.stringify(f)}`)
  if (i === 5 || i === 9 || i === 15) await C.shot(P, `w9-tab${i}`)
}
const inListStops = stops.filter(s => s.inList)
const bad15 = stops.filter(s => s.underHeadings || s.underBottom || s.underFade)
const ringOk = stops.every(s => s.none ? false : (!/none/.test(s.outline.split(' ')[0]) && !/ 0px/.test(s.outline)) || (s.shadow && s.shadow !== 'none'))
C.check('W9-15', inListStops.length >= 5 && bad15.length === 0, `Tab x15: ${inListStops.length} stops inside the list, wholly visible inside the scroller: ${bad15.length === 0}, offenders ${JSON.stringify(bad15.map(s => s.tid + ' ' + s.top + '-' + s.bottom))}`)
C.check('W9-ring', ringOk, `focus ring visible on each stop (outline/shadow): ${JSON.stringify(stops.map(s => s.outline.split(' ').slice(0, 2).join(' ') + '/' + (s.shadow === 'none' ? '-' : 'sh')).slice(0, 15))}`)
C.check('W9-room', (await C.winRoom(P)) <= 0 && stops.every(s => s.winY === 0), `window room ${await C.winRoom(P)}, window scrollY at every stop ${stops.map(s => s.winY).join(',')}`)
// Shift+Tab back
const back = []
for (let i = 1; i <= 15; i++) { await P.keyboard.press('Shift+Tab'); await C.sleep(200); back.push(await focusInfo()) }
const badBack = back.filter(s => s.underHeadings || s.underBottom || s.underFade)
C.note('Shift+Tab x15: ' + JSON.stringify(back.map(s => s.tid + ' ' + s.top + '-' + s.bottom + ' sc' + s.scTop)))
await C.shot(P, 'w9-shifttab-end')
C.check('W9-back', badBack.length === 0 && back.every(s => s.winY === 0), `Shift+Tab back: offenders ${JSON.stringify(badBack.map(s => s.tid + ' ' + s.top + '-' + s.bottom))}; focus ends on ${back[back.length - 1].tid} (${back[back.length - 1].text})`)
// EXTRA: continue forward through the whole list (bottom lines)
await P.mouse.click(pt.x, pt.y); await C.sleep(200)
const all = []
for (let i = 1; i <= 62; i++) { await P.keyboard.press('Tab'); await C.sleep(120); all.push(await focusInfo()) }
const badAll = all.filter(s => s.underHeadings || s.underBottom || s.underFade)
C.note(`EXTRA tab through all: ${all.length} stops, offenders ${JSON.stringify(badAll.map(s => s.tid + ' ' + s.top + '-' + s.bottom + ' (headings ' + s.colsBottom + ', scroller foot ' + s.scBottom + ', fade ' + s.fadeTop + ')'))}`)
await C.shot(P, 'w9-extra-foot')
C.check('W9-extra', badAll.length === 0, `extra: Tab through the whole list (${all.length} stops): offenders ${badAll.length} ${JSON.stringify(badAll.slice(0, 5).map(s => s.tid + ' ' + s.top + '-' + s.bottom + ' headings ' + s.colsBottom + ' foot ' + s.scBottom + ' fade ' + s.fadeTop))}`)
C.note('errors ' + JSON.stringify(errs)); C.check('W9-err', errs.length === 0, 'page errors: ' + (errs.join('|') || 'none'))
C.summary()
await Promise.race([browser.close(), C.sleep(8000)])
process.exit(0)
