// W2 explore 6 — a Training on Saturday 18 Jul: the OIL question, publishing the weekend, the war's credit, the OIL tracker.
process.env.HP_URL = 'http://localhost:4180'
import * as H from './lw-m3b-w2-lib.mjs'
const { L, T, note } = H
process.env.HP_SHOTS = H.OUT
const HPL = await import('./lib.mjs')
const w = await H.deskCtx(); const P = w.page
await L.signInPlain(w, 'admin')
const ranger = await H.idOf(P, 'Ranger')
const ISO = '2026-07-18', DI = 5
const f = await H.fileInput(w, { who: 'Ranger', type: 'Training', from: ISO, remarks: 'Sat trg', tag: 'x6', oil: 'yes',
  beforeSave: async () => { if (await P.locator('#inpEditAllday').count() && !(await P.locator('#inpEditAllday').isChecked())) await L.press(w, '#inpEditAllday') },
  onAsk: async (open) => { note('x6-ask', 'desk', 'question words: ' + await P.evaluate(() => [...document.querySelectorAll('[data-testid="oilconf"]')].map(e => e.innerText.replace(/\s+/g, ' ')).join('||')) + ' | testids: ' + await P.evaluate(() => [...document.querySelectorAll('[data-testid="oilconf"] [data-testid]')].map(e => e.dataset.testid).join(','))); await H.pic(w, 'x6-oil-question', ['[data-testid="oilconf"]']) } })
note('x6', 'desk', JSON.stringify({ acc: f.rec?.acc, asked: f.asked, oil: f.rec?.oil, rec: f.rec }))
await H.goEdit(w)
note('x6', 'desk', 'Sat Ground/inp: ' + JSON.stringify((await H.rowsOf(P, DI, 'sec-grnd')).rows?.map(r => r.text)) + ' head: ' + await P.evaluate(() => (document.querySelector('#eWeek section.day[data-day="5"]')?.firstElementChild?.innerText || '').replace(/\s+/g, ' ')))
await H.warOpen(w, ranger, ISO)
note('x6', 'desk', 'war before publish: ' + JSON.stringify(await H.cellBoxes(w, ranger, ISO)) + ' avail ' + await H.availP(P, ISO))
await HPL.board(P, DI); const pub = await HPL.publish(P, DI); await HPL.closeBoard(P)
note('x6', 'desk', 'publish: ' + JSON.stringify(pub))
await H.warOpen(w, ranger, ISO)
note('x6', 'desk', 'war after publish: ' + JSON.stringify(await H.cellBoxes(w, ranger, ISO)) + ' avail ' + await H.availP(P, ISO))
await H.warPic(w, 'x6-war-after-publish', ranger, [ISO])
await P.evaluate(() => window.scrollTo(0, 0))
await L.press(w, T('oil-tracker')); await P.waitForTimeout(1200)
note('x6', 'desk', 'OIL tracker rows: ' + await P.evaluate(() => [...document.querySelectorAll('[data-testid^="oil-row-"]')].filter(e => /Ranger/.test(e.innerText)).map(e => e.dataset.testid + ' :: ' + e.innerText.replace(/\s+/g, ' ')).join(' | ')))
await H.pic(w, 'x6-oil-tracker', null)
note('errors', 'desk', JSON.stringify(w.errs))
await w.ctx.close(); await H.closeBrowser()
