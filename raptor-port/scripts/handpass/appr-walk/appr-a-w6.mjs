import * as C from './appr-a-common.mjs'
console.log('[appr-a-w6 v1]')
C.initLog('appr-a-w6-log.txt')
const { browser, page } = await C.launchReal125({ w: 1550, h: 917 })
const errs = []; C.watchErrors(page, errs)
await C.stageWorld(page)
const P = page, T = C.T
await C.wheelList(P, 200)
const y0 = await C.listY(P)
// find a single-day line wholly in view: text has "1 day"
let target = null
for (let i = 0; i < 19; i++) { const li = await C.lineInfo(P, i); const full = await C.nthLine(P, i).innerText(); if (li.inView && /1 day/.test(full) && !/ – /.test(full)) { target = li; break } }
C.note('scrollTop ' + y0 + ' target ' + JSON.stringify(target))
await C.nthLine(P, target.idx).locator(T('appr-dates')).click(); await C.sleep(1200)
const ringed = await P.evaluate(() => [...document.querySelectorAll('.lw-ring')].map(e => e.dataset.testid || e.className))
C.note('ringed ' + JSON.stringify(ringed))
const cellId = ringed.find(x => /^cell-/.test(x))
await P.locator(T(cellId)).click(); await C.sleep(900)
await C.shot(P, 'w6-1-day-window')
const dump = await P.evaluate(() => {
  const vis = e => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 }
  return [...document.querySelectorAll('[role=dialog] button, [data-testid="bid-picker"] button, [data-testid="daylist-sheet"] button')].filter(vis).map(b => (b.dataset.testid || '') + '|' + b.innerText.replace(/\s+/g, ' ').trim() + '|' + (b.getAttribute('aria-pressed') || '')).slice(0, 40)
})
C.note('window buttons: ' + JSON.stringify(dump))
const wantRefuse = process.env.W6_DECIDE === 'refuse'
const btn = P.locator('[role=dialog] button, [data-testid="bid-picker"] button, [data-testid="daylist-sheet"] button').filter({ hasText: wantRefuse ? /^Refuse$/ : /^Approve$/ }).first()
await btn.click(); await C.sleep(800)
await C.shot(P, 'w6-2-decided-in-window')
const dump2 = await P.evaluate(() => [...document.querySelectorAll('[role=dialog] button, [data-testid="bid-picker"] button, [data-testid="daylist-sheet"] button')].filter(b => b.getBoundingClientRect().width > 0).map(b => b.innerText.replace(/\s+/g, ' ').trim() + '|' + (b.getAttribute('aria-pressed') || '')).slice(0, 12))
C.note('window after deciding: ' + JSON.stringify(dump2))
// close window: Escape then Back on slim bar
await P.keyboard.press('Escape'); await C.sleep(500)
let slim = await P.locator(T('appr-slim')).count()
C.note('slim bar after Escape ' + slim)
if (!slim) { C.note('slim bar missing') }
await P.locator(T('appr-back')).click(); await C.sleep(1000)
const g1 = await C.geo(P); const lt = await C.lineInfo(P, target.idx)
await C.shot(P, 'w6-3-back')
const idxNow = []
for (let i = 0; i < g1.lines; i++) { const li = await C.lineInfo(P, i); const full = await C.nthLine(P, i).innerText(); if (/Approved|Refused|Already (approved|refused)/i.test(full)) idxNow.push(li.idx + ':' + full.replace(/\s+/g, ' ').slice(0, 70) + ' top ' + li.top) }
C.note('target line top before ' + target.top + ' ; line now ' + JSON.stringify(await C.lineInfo(P, target.idx)))
C.note(`back: scrollTop ${g1.sc?.top} (was ${y0}), winRoom ${g1.winRoom}, lines ${g1.lines}, lit/decided: ${JSON.stringify(idxNow)}; counts ${JSON.stringify(await C.counts(P))}`)
C.check('W6-state', idxNow.length >= 1 && g1.sc && Math.abs(g1.sc.top - y0) <= 2 && g1.winRoom <= 0, `request shows its new state (${JSON.stringify(idxNow)}), list ${y0} -> ${g1.sc?.top}, winRoom ${g1.winRoom}`)
await C.sleep(6000)
const mm = await C.scMid(P); await P.mouse.move(mm.x, mm.y)
const a0 = await C.listY(P), w0 = await C.winRoom(P)
await P.mouse.wheel(0, 150); await C.sleep(400)
const a1 = await C.listY(P); const winY = await P.evaluate(() => scrollY)
C.note(`after 6 s: wheel 150: list ${a0} -> ${a1}, window scrollY ${winY}, winRoom ${w0}`)
await C.shot(P, 'w6-4-after-wait-wheel')
C.check('W6-wheel', a1 > a0 && winY === 0 && w0 <= 0, `after the 6 s wait the wheel moves the list at once (${a0} -> ${a1}), the window not at all (scrollY ${winY}, room ${w0})`)
C.note('errors ' + JSON.stringify(errs)); C.check('W6-err', errs.length === 0, 'page errors: ' + (errs.join('|') || 'none'))
C.summary()
await Promise.race([browser.close(), C.sleep(8000)])
process.exit(0)
