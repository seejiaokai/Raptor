import * as C from './appr-a-common.mjs'
console.log('[appr-a-w2 v1]')
C.initLog('appr-a-w2-log.txt')
const { browser, page } = await C.launchReal125({ w: 1550, h: 917 })
const errs = []; C.watchErrors(page, errs)
await C.stageWorld(page)
const P = page
const T = C.T
async function state(label) {
  const b = await C.boxes(P), g = await C.geo(P)
  const aa = b.approveAll
  C.note(`  [${label}] winRoom ${g.winRoom} lines ${g.lines} approveAll ${aa ? `left ${aa.l} right ${aa.r} w ${aa.w}` : 'none'} card bottom ${g.card?.bottom} (screen ${g.inner}) scroller ${g.scroller?.top}-${g.scroller?.bottom} room ${g.sc?.room} counts ${JSON.stringify(await C.counts(P))}`)
  return { b, g }
}
const press = async (id, name) => {
  const before = await state('before ' + name)
  await P.locator(T(id)).click(); await C.sleep(700)
  const after = await state('after ' + name)
  await C.shot(P, 'w2-' + name)
  const diffs = C.diffBoxes(before.b, after.b, ['approveAll', 'scroller', 'cols'])
  const aaMove = before.b.approveAll && after.b.approveAll ? { dl: +(after.b.approveAll.l - before.b.approveAll.l).toFixed(2), dr: +(after.b.approveAll.r - before.b.approveAll.r).toFixed(2), wBefore: before.b.approveAll.w, wAfter: after.b.approveAll.w } : null
  const cardFoot = Math.abs(after.g.card.bottom - (Math.floor(after.g.trueH + 0.01) - 8)) <= 1.01
  C.note(`  moved: ${diffs.length ? diffs.join(' ; ') : 'nothing'}; approveAll ${JSON.stringify(aaMove)}`)
  C.check('W2-' + name + '-still', diffs.length === 0, `press ${name}: title, chips, Pick dates, card unmoved (${diffs.join(' ; ') || 'all within 1px'})`)
  C.check('W2-' + name + '-aa', !aaMove || Math.abs(aaMove.dl) <= 1.01, `Approve all left edge moved ${aaMove?.dl} (right edge moved ${aaMove?.dr}; width ${aaMove?.wBefore} -> ${aaMove?.wAfter})`)
  C.check('W2-' + name + '-foot', cardFoot && after.g.winRoom <= 0, `card foot ${after.g.card.bottom} vs ${Math.floor(after.g.trueH + 0.01) - 8}, window room ${after.g.winRoom}, lines ${after.g.lines}`)
  return { before, after }
}
await state('initial')
await C.shot(P, 'w2-0-initial')
await press('appr-new', 'new')
await press('appr-all', 'all')
await press('appr-m-2026-01', 'jan')
await press('appr-m-2026-02', 'feb')
await press('appr-m-2026-03', 'mar')
await press('appr-all', 'all-again')
// Pick dates: open
const rOpen = await press('appr-pick', 'pick-open')
const inf = await P.evaluate(() => { const pk = document.querySelector('[data-testid="appr-range-picker"]'); return pk ? [...pk.querySelectorAll('button')].map(b => (b.dataset.testid || '') + '|' + b.innerText.trim() + '|' + (b.getAttribute('aria-label') || '')).slice(0, 60) : null })
C.note('picker buttons: ' + JSON.stringify(inf))
const day = n => P.locator(`${T('appr-range-picker')} button`).filter({ hasText: new RegExp('^' + n + '$') }).first()
await day(12).click(); await C.sleep(500); await C.shot(P, 'w2-pick-start')
const g1 = await C.geo(P); C.note('after start pick: ' + JSON.stringify({ winRoom: g1.winRoom, scroller: g1.scroller }))
await day(16).click(); await C.sleep(900)
await C.shot(P, 'w2-pick-range')
const stR = await state('after range picked')
const pickOpen = await P.evaluate(() => !!document.querySelector('[data-testid="appr-range-picker"]'))
C.note('picker still open after range: ' + pickOpen)
if (pickOpen) { await P.locator(T('appr-pick')).click(); await C.sleep(700) }
const stC = await state('after picker closed')
await C.shot(P, 'w2-pick-closed')
const bAll = rOpen.before.b
const diffs = C.diffBoxes(bAll, stC.b, ['approveAll', 'scroller', 'cols'])
C.check('W2-pick-after-close', diffs.length === 0 && stC.g.winRoom <= 0 && Math.abs(stC.g.card.bottom - (Math.floor(stC.g.trueH + 0.01) - 8)) <= 1.01, `after the picker closed (range 12-16 Jan): neighbours vs before opening ${diffs.join(' ; ') || 'unmoved'}, winRoom ${stC.g.winRoom}, card foot ${stC.g.card.bottom}, lines ${stC.g.lines}`)
C.check('W2-pick-lines', stC.g.lines > 0 && stC.g.lines < 19, `lines after range ${stC.g.lines}`)
C.note('errors ' + JSON.stringify(errs)); C.check('W2-err', errs.length === 0, 'page errors: ' + (errs.join('|') || 'none'))
C.summary()
await Promise.race([browser.close(), C.sleep(8000)])
process.exit(0)
