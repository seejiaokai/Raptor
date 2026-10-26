// W2 explore 9 — the member's bell after a scheduler's "→ Unavail".
process.env.HP_URL = 'http://localhost:4180'
import * as H from './lw-m3b-w2-lib.mjs'
const { L, T, note } = H
const w = await H.deskCtx(); const P = w.page
await L.signInPlain(w, 'admin')
const f = await H.fileInput(w, { who: 'Ranger', type: 'Training', from: '2026-07-16', remarks: 'Bell trg', beforeSave: async () => { if (await P.locator('#inpEditAllday').count() && !(await P.locator('#inpEditAllday').isChecked())) await L.press(w, '#inpEditAllday') } })
const iid = f.rec.iid
await H.goEdit(w)
for (const d of ['x', 'u']) {
  const sel = `#eWeek section.day[data-day="3"] [data-acc="${d}"][data-acck="${iid}"]`
  if (!(await P.locator(sel).first().isVisible().catch(() => false))) { await P.locator('#eWeek section.day[data-day="3"] [data-pitog="3"]').first().click(); await P.waitForTimeout(500) }
  await P.locator(sel).first().click(); await P.waitForTimeout(900)
}
note('x9', 'desk', 'acc ' + (await H.inputById(P, iid))?.acc)
await P.evaluate(() => { window.raptorRole('member'); window.raptorMe('bane'); window.lwSetRole('member') }); await P.waitForTimeout(600)
await P.evaluate(() => window.go('inputs')); await P.waitForTimeout(1200)
const st = async tag => note('x9', 'desk', `${tag}: bell class "${await P.locator('.bellbtn:visible').first().getAttribute('class')}" expanded ${await P.locator('.bellbtn:visible').first().getAttribute('aria-expanded')}; list present ${await P.locator('[data-testid="bell-list"]').count()}; toast: ${await P.evaluate(() => (document.querySelector('#toastEl, .toast')?.innerText || '').slice(0, 80))}`)
await st('before')
await P.locator('.bellbtn:visible').first().click(); await P.waitForTimeout(900); await st('after click 1')
await H.pic(w, 'x9-click1', null)
await P.locator('.bellbtn:visible').first().click(); await P.waitForTimeout(900); await st('after click 2')
await H.pic(w, 'x9-click2', null)
note('x9', 'desk', 'list text: ' + await P.evaluate(() => (document.querySelector('[data-testid="bell-list"]')?.innerText || 'none').replace(/\s+/g, ' ')))
note('errors', 'desk', JSON.stringify(w.errs))
await w.ctx.close(); await H.closeBrowser()
