// M5a drawing fixes (D1493) — E: in a member's locked Balances row, each kind's read-only figure beside its amber pending
// figure — their text boxes, on a phone and a desktop.
process.env.LW_OUT ||= '../../docs/img/handpass/2026-10-28-lw-m5a/drawing-fixes/probe'
process.env.LW_TODAY ||= '2026-01-25'
process.env.PORT ||= '4181'
const L = await import('./lw-m4-lib.mjs')
const { T, press } = L
const read = Q => Q.evaluate(() => {
  const row = document.querySelector('[data-testid="bal-row-bane"]')
  const tb = e => { const rg = document.createRange(); rg.selectNodeContents(e); const r = rg.getBoundingClientRect(); return [Math.round(r.top * 100) / 100, Math.round(r.bottom * 100) / 100] }
  const out = {}
  for (const k of ['CCL', 'PL', 'CL']) {
    const pd = document.querySelector(`[data-testid="bal-opd-${k}-bane"]`)
    const ro = pd.parentElement.querySelector('.bp-ro')
    out[k] = { ro: ro && [ro.textContent, ...tb(ro)], pd: [pd.textContent, ...tb(pd)] }
  }
  out.app = tb(row.querySelector('.bp-ro'))
  return out
})
for (const size of ['phone', 'desk']) {
  const m = await L.newCtx(size); const Q = m.page
  await L.signIn(m, 'admin')
  await press(m, T('lw-tab-balances')); await Q.waitForTimeout(600)
  if ((await Q.locator(T('bal-lock')).getAttribute('aria-checked')) !== 'true') { await press(m, T('bal-lock')); await Q.waitForTimeout(300) }
  await L.switchTo(m, 'member')
  await press(m, T('lw-tab-balances')); await Q.waitForTimeout(800)
  console.log('E', size, JSON.stringify(await read(Q)))
  await m.ctx.close()
}
await L.closeBrowser()
