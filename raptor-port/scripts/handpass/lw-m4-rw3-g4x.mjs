// Re-walk 3 G4 explore — Admin -> Users: how a man is deleted.
process.env.LW_OUT ||= '../../docs/img/handpass/2026-10-27-lw-m4/rewalk3'
const L = await import('./lw-m4-lib.mjs')
const { T, shot } = L
console.log('[lw-m4-rw3-g4x v2]')
const w = await L.newCtx('desk'); const P = w.page
try {
  await L.signIn(w, 'admin')
  await P.evaluate(() => window.go('admin')); await P.waitForTimeout(1200)
  await P.locator('#admUsers').getByText('Blade', { exact: true }).first().click(); await P.waitForTimeout(800); await shot(w, 'g4x-2-blade-open')
  const btns = await P.evaluate(() => [...document.querySelectorAll('#admUsers button, #admUsers [data-testid], #admUsers select, #admUsers input')].filter(e => e.getBoundingClientRect().height > 0).map(e => (e.dataset.testid || e.id || e.tagName) + ':' + (e.innerText || e.value || '').trim().slice(0, 30).replace(/\s+/g, ' ')))
  console.log(JSON.stringify(btns))
} catch (e) { console.log('ERR', e) }
await w.ctx.close(); await L.closeBrowser()
