import * as C from './appr-a-common.mjs'
console.log('[appr-a-w8 v2]')
C.initLog('appr-a-w8-log.txt')
const { browser, page } = await C.launchReal125({ w: 1550, h: 917 })
const errs = []; C.watchErrors(page, errs)
await C.stageWorld(page)
const P = page, T = C.T
const apprUp = () => P.evaluate(() => { const p = document.querySelector('[data-testid="approvals-page"]'); return !!p && !p.hidden && p.getBoundingClientRect().height > 0 })
const pwUp = () => P.evaluate(() => { const p = document.querySelector('[data-testid="person-window"]'); return !!p && p.getBoundingClientRect().width > 0 })
const trackerUp = () => P.evaluate(() => !!document.querySelector('[data-testid="oil-close"]') && document.querySelector('[data-testid="oil-close"]').getBoundingClientRect().width > 0)
async function snap(label) {
  const g = await C.geo(P); const up = await apprUp()
  const lit = []
  for (let i = 0; i < g.lines; i++) { const full = await C.nthLine(P, i).innerText(); if (/Approved|Refused|Already/.test(full)) lit.push(i + ':' + full.replace(/\s+/g, ' ').slice(0, 40)) }
  const chip = await P.evaluate(() => [...document.querySelectorAll('.appr-filters .appr-f.on')].map(e => e.innerText.trim()))
  C.note(`${label}: approvalsUp ${up} personWindow ${await pwUp()} tracker ${await trackerUp()} scrollTop ${g.sc?.top} winRoom ${g.winRoom} lines ${g.lines} chipsOn ${JSON.stringify(chip)} lit ${JSON.stringify(lit)} counts ${JSON.stringify(await C.counts(P))}`)
  return { g, up, lit, chip }
}
// dates picked: 5 Jan - 28 Feb
await P.locator(T('appr-pick')).click(); await C.sleep(500)
await P.locator(T('appr-range-day-2026-01-05')).click(); await C.sleep(300)
await P.locator(T('appr-range-next')).click(); await C.sleep(300)
await P.locator(T('appr-range-next')).click(); await C.sleep(300)
await P.locator(T('appr-range-day-2026-03-31')).click(); await C.sleep(900)
await C.wheelList(P, 300)
let A = null
for (let i = 0; i < 19; i++) { const li = await C.lineInfo(P, i); if (li && li.inView) { A = li.idx + 1; break } }
await C.nthLine(P, A).locator(T('appr-approve')).click(); await C.sleep(600)
const base = await snap('base (range picked, line ' + A + ' decided)')
await C.shot(P, 'w8-0-base')
C.check('W8-0', base.lit.length === 1 && base.g.sc.top === 300 && base.g.winRoom <= 0 && base.g.lines > 8, `baseline: ${base.g.lines} lines in range, scrollTop ${base.g.sc.top}, lit ${base.lit.length}`)
// (a) OIL tab
await P.locator(T('oil-tracker')).first().click(); await C.sleep(1500)
await C.shot(P, 'w8-1a-oil-open')
C.note('(a) tracker open: ' + await trackerUp())
await P.locator(T('oil-close')).click(); await C.sleep(1200)
await C.shot(P, 'w8-2a-closed')
const a = await snap('(a) after close')
C.check('W8-a', a.up && a.lit.length === 1 && a.lit[0] === base.lit[0] && JSON.stringify(a.chip) === JSON.stringify(base.chip) && Math.abs(a.g.sc.top - base.g.sc.top) <= 2 && a.g.winRoom <= 0, `(a) OIL tab then close: Approvals up ${a.up}, lit ${JSON.stringify(a.lit)}, dates chip ${JSON.stringify(a.chip)} (was ${JSON.stringify(base.chip)}), list ${base.g.sc.top} -> ${a.g.sc.top}, winRoom ${a.g.winRoom}`)
// (b) My leave -> person window -> OIL line -> tracker -> close
await P.locator(T('my-leave')).click(); await C.sleep(1100)
await C.shot(P, 'w8-3b-person-window')
C.note('(b) person window up: ' + await pwUp())
await P.locator(T('pw-oil')).click(); await C.sleep(1500)
await C.shot(P, 'w8-4b-oil-open-from-person')
C.note('(b) tracker up: ' + await trackerUp() + ' person window up: ' + await pwUp())
await P.locator(T('oil-close')).click(); await C.sleep(1200)
await C.shot(P, 'w8-5b-closed')
const b = await snap('(b) after tracker closed')
C.check('W8-b', b.up && b.lit.length === 1 && b.lit[0] === base.lit[0] && JSON.stringify(b.chip) === JSON.stringify(base.chip) && Math.abs(b.g.sc.top - base.g.sc.top) <= 2 && b.g.winRoom <= 0, `(b) person window OIL line then close: Approvals up ${b.up}, lit ${JSON.stringify(b.lit)}, chip ${JSON.stringify(b.chip)}, list ${base.g.sc.top} -> ${b.g.sc.top}, winRoom ${b.g.winRoom}, person window still up ${await pwUp()}`)
if (await pwUp()) { await P.locator(T('pw-close')).click(); await C.sleep(600) }
const b2 = await snap('(b) after the person window also closed')
// (c) Balances then Approvals
await P.locator(T('lw-tab-balances')).first().click(); await C.sleep(1200)
await C.shot(P, 'w8-6c-balances')
C.note('(c) on Balances: winRoom ' + await C.winRoom(P))
await P.locator(T('lw-tab-approvals')).first().click(); await C.sleep(1200)
await C.shot(P, 'w8-7c-approvals-again')
const c = await snap('(c) Balances then Approvals')
C.check('W8-c', c.up && c.g.winRoom <= 0 && Math.abs(c.g.card.bottom - (c.g.inner - 8)) <= 1.01, `(c) new visit — report: Approvals up ${c.up}, lit ${JSON.stringify(c.lit)}, chips ${JSON.stringify(c.chip)}, list ${c.g.sc?.top}, lines ${c.g.lines}, winRoom ${c.g.winRoom}`)
C.note('errors ' + JSON.stringify(errs)); C.check('W8-err', errs.length === 0, 'page errors: ' + (errs.join('|') || 'none'))
C.summary()
await Promise.race([browser.close(), C.sleep(8000)])
process.exit(0)
