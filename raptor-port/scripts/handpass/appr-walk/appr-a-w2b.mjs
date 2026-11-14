import * as C from './appr-a-common.mjs'
console.log('[appr-a-w2b v1]')
const TAG = process.env.W2B_TAG || 'after'
C.initLog(`appr-a-w2b-${TAG}-log.txt`)
const { browser, page } = await C.launchReal125({ w: 1550, h: 917 })
const errs = []; C.watchErrors(page, errs)
await C.stageWorld(page)
const P = page, T = C.T
const wid = async () => (await C.boxes(P)).approveAll
// Approve all geometry across filters (also BEFORE build)
const seen = []
for (const id of ['appr-all', 'appr-new', 'appr-all', 'appr-m-2026-01', 'appr-m-2026-02', 'appr-m-2026-03']) {
  await P.locator(T(id)).click(); await C.sleep(600)
  const b = await wid(); const c = await C.counts(P)
  seen.push({ id, l: b.l, r: b.r, w: b.w, words: c.approveAll })
  C.note(`  ${id}: Approve all left ${b.l} right ${b.r} width ${b.w} words "${c.approveAll}"`)
}
if (TAG === 'after') {
  await P.locator(T('appr-all')).click(); await C.sleep(600)
  const before = await C.boxes(P)
  await P.locator(T('appr-pick')).click(); await C.sleep(600)
  await P.locator(T('appr-range-day-2026-01-05')).click(); await C.sleep(400)
  await P.locator(T('appr-range-day-2026-01-09')).click(); await C.sleep(900)
  await C.shot(P, 'w2-pick-5to9')
  const g = await C.geo(P); const b = await C.boxes(P)
  C.note(`  after 5-9 Jan: lines ${g.lines} winRoom ${g.winRoom} card bottom ${g.card.bottom} (screen ${g.inner}) scroller ${g.scroller?.top}-${g.scroller?.bottom} room ${g.sc?.room} words ${(await C.counts(P)).approveAll}`)
  const d = C.diffBoxes(before, b, ['approveAll', 'scroller', 'cols', 'pick'])
  C.check('W2-pick-5to9', g.lines >= 1 && g.lines < 19 && d.length === 0 && g.winRoom <= 0 && Math.abs(g.card.bottom - (g.inner - 8)) <= 1.01, `range 5-9 Jan: ${g.lines} lines, neighbours ${d.join(';') || 'unmoved'}, winRoom ${g.winRoom}, card foot ${g.card.bottom} vs ${g.inner - 8}`)
  const lastLine = await P.evaluate(sel => { const ls = [...document.querySelectorAll(`${sel} [data-testid^="appr-line-"]`)]; const l = ls[ls.length - 1]; return l ? l.getBoundingClientRect().bottom : null }, C.PAGE)
  C.note(`  last line bottom ${lastLine}, card bottom ${g.card.bottom}: empty ${+(g.card.bottom - lastLine).toFixed(1)}px below the last line`)
}
await Promise.race([browser.close(), C.sleep(8000)])
C.note('errors ' + JSON.stringify(errs)); C.summary()
process.exit(0)
