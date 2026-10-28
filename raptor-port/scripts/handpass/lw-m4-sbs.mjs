// The side-by-side page's pictures (D1426): every M4 screen that has a drawing, at the drawing's own pixel scale
// (desktop 1.25, phone 3), from the current build served on PORT. Boxes of the parts the page crops are written to boxes.json.
process.env.LW_OUT ||= '../../docs/img/handpass/2026-10-27-lw-m4/sbs'
import { mkdirSync, writeFileSync } from 'node:fs'
import path from 'node:path'
const A = await import('./lw-m4-walk-a-lib.mjs')
const { L, bidBatch, lineLoc, pressLoc, approveBtn, refuseBtn, datesBtn } = A
const { T, press } = L
mkdirSync(L.OUT, { recursive: true })
L.clearOut()
const boxes = {}
const dshot = (w, name) => w.page.screenshot({ path: path.join(L.OUT, name + '.png'), scale: 'device' })
const box = async (page, sel, name) => {
  const b = await (typeof sel === 'string' ? page.locator(sel) : sel).first().boundingBox()
  boxes[name] = b && { x: Math.round(b.x), y: Math.round(b.y), w: Math.round(b.width), h: Math.round(b.height) }
}
const pdf = L.pdfPath('m4-sbs.pdf')
try {
  /* ---- the desktop ---- */
  const w = await L.newCtx('desk')
  const P = w.page
  await L.signIn(w, 'member')
  await bidBatch(w, 'bane', [{ iso: '2026-01-12', pdf }, { iso: '2026-01-14' }, { iso: '2026-01-19', portion: 'am' }, { iso: '2026-01-26' }, { iso: '2026-01-27' }, { iso: '2026-02-16' }])
  await L.switchTo(w, 'admin')
  await L.openApprovals(w)
  await P.evaluate(() => window.scrollTo(0, 0)); await P.waitForTimeout(300)
  await dshot(w, 'd1-top'); await box(P, T('approvals-page'), 'd1-page')
  await pressLoc(w, approveBtn(P, 'Mon 12 Jan')); await P.waitForTimeout(400)
  await pressLoc(w, refuseBtn(P, 'Wed 14 Jan')); await P.waitForTimeout(400)
  await lineLoc(P, 'Mon 12 Jan').scrollIntoViewIfNeeded(); await P.waitForTimeout(200)
  await dshot(w, 'd3-decided'); await box(P, lineLoc(P, 'Mon 12 Jan'), 'd3-ok'); await box(P, lineLoc(P, 'Wed 14 Jan'), 'd3-no')
  await P.evaluate(() => window.scrollTo(0, 0)); await P.waitForTimeout(200)
  await press(w, T('appr-approve-all')); await P.waitForTimeout(250)
  await dshot(w, 'd3-armed'); await box(P, T('appr-approve-all'), 'd3-all')
  await press(w, T('appr-all')); await P.waitForTimeout(300)
  await press(w, T('appr-new')); await P.waitForTimeout(400)
  await dshot(w, 'd2-new'); await box(P, T('appr-also'), 'd2-also')
  await press(w, T('appr-all')); await P.waitForTimeout(300)
  await pressLoc(w, datesBtn(P, 'Mon 19 Jan')); await P.waitForTimeout(900)
  await dshot(w, 'd4-slim'); await box(P, T('appr-slim'), 'd4-slim')
  await w.ctx.close()
  /* ---- the phone ---- */
  const p = await L.newCtx('phone')
  const Q = p.page
  await L.signIn(p, 'member')
  await bidBatch(p, 'bane', [{ iso: '2026-01-12', pdf }, { iso: '2026-01-14' }, { iso: '2026-01-19', portion: 'am' }, { iso: '2026-01-26' }])
  await L.switchTo(p, 'admin')
  await L.openApprovals(p)
  await Q.evaluate(() => window.scrollTo(0, 0)); await Q.waitForTimeout(300)
  await dshot(p, 'p5-top')
  await pressLoc(p, approveBtn(Q, '12 Jan')); await Q.waitForTimeout(400)
  await pressLoc(p, datesBtn(Q, '19 Jan')); await Q.waitForTimeout(900)
  await dshot(p, 'p6-slim')
  await L.switchTo(p, 'member')
  await L.openBell(p); await Q.waitForTimeout(300)
  await dshot(p, 'p7-bell')
  await p.ctx.close()
  writeFileSync(path.join(L.OUT, 'boxes.json'), JSON.stringify(boxes, null, 1))
  console.log('boxes', JSON.stringify(boxes))
} finally { await L.closeBrowser() }
