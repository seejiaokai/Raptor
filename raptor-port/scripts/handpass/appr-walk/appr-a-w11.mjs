import * as C from './appr-a-common.mjs'
import { writeFileSync } from 'node:fs'
import path from 'node:path'
console.log('[appr-a-w11 v1]')
C.initLog('appr-a-w11-log.txt')
const { browser, page } = await C.launchReal125({ w: 1550, h: 917 })
const errs = []; C.watchErrors(page, errs)
await C.stageWorld(page)
const P = page, T = C.T
// decide one line (a lit fill) — line 2, in view at the top
await C.nthLine(P, 2).locator(T('appr-approve')).click(); await C.sleep(600)
const g0 = await C.geo(P)
const f = g0.filters, cols = g0.cols, card = g0.card
const clipStrip = { x: cols.left, y: f.bottom - 14, width: cols.w, height: cols.bottom - (f.bottom - 14) }
const clipHead = { x: cols.left, y: cols.top, width: cols.w, height: cols.h }
C.note('strip clip ' + JSON.stringify(clipStrip) + ' headings clip ' + JSON.stringify(clipHead))
await P.mouse.move((await C.scMid(P)).x, (await C.scMid(P)).y)
const steps = []
let ref = null, refHead = null
const equalAt = []
// the lit line's top over the steps
for (let y = 0; y <= 400; y += 40) {
  if (y > 0) { await P.mouse.wheel(0, 40); await C.sleep(250) }
  const st = await C.listY(P)
  const strip = await P.screenshot({ clip: clipStrip, type: 'png' })
  const head = await P.screenshot({ clip: clipHead, type: 'png' })
  const lit = await C.lineInfo(P, 2)
  if (ref === null) { ref = strip; refHead = head }
  const sameStrip = Buffer.compare(strip, ref) === 0, sameHead = Buffer.compare(head, refHead) === 0
  steps.push({ y, st, sameStrip, sameHead, litTop: lit.top, colsBottom: g0.cols.bottom })
  C.note(`step ${y}: scrollTop ${st}, strip identical to step 0: ${sameStrip}, headings strip identical: ${sameHead}, lit line top ${lit.top} (headings bottom ${cols.bottom})`)
  writeFileSync(path.join(C.OUT, `appr-a-w11-strip-${String(y).padStart(3, '0')}.png`), strip)
}
// where the lit line is while crossing the headings, bigger crop at the two steps nearest the crossing
const crossing = steps.filter(s => s.litTop < cols.bottom + 20 && s.litTop > cols.top - 60)
C.note('steps where the lit line is at/under the headings: ' + JSON.stringify(crossing.map(s => s.y + ':' + s.litTop)))
await C.shot(P, 'w11-full-at-400')
C.check('W11-strip', steps.every(s => s.sameStrip), `crop from chips' lower edge to headings' foot identical at all ${steps.length} steps (${steps.filter(s => !s.sameStrip).map(s => s.y).join(',') || 'none differ'})`)
C.check('W11-headings', steps.every(s => s.sameHead), `headings strip identical at all steps (${steps.filter(s => !s.sameHead).map(s => s.y).join(',') || 'none differ'})`)
C.check('W11-crossing', crossing.length > 0, `the lit line crossed the headings during the steps (steps ${crossing.map(s => s.y).join(',')}) so the test covered the crossing`)
C.check('W11-room', (await C.winRoom(P)) <= 0, 'window room ' + await C.winRoom(P))
C.note('errors ' + JSON.stringify(errs)); C.check('W11-err', errs.length === 0, 'page errors: ' + (errs.join('|') || 'none'))
C.summary()
await Promise.race([browser.close(), C.sleep(8000)])
process.exit(0)
