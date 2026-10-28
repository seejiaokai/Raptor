// Re-walk 3 G4 explore 2 — press Delete on a man in Admin -> Users, see what it asks.
process.env.LW_OUT ||= '../../docs/img/handpass/2026-10-27-lw-m4/rewalk3'
const L = await import('./lw-m4-lib.mjs')
const { T, shot } = L
console.log('[lw-m4-rw3-g4y v1]')
const w = await L.newCtx('desk'); const P = w.page
try {
  await L.signIn(w, 'admin')
  await P.evaluate(() => window.go('admin')); await P.waitForTimeout(1200)
  await P.locator('#admUsers').getByText('Static', { exact: true }).first().click(); await P.waitForTimeout(800)
  await P.locator('#accEdDel').click(); await P.waitForTimeout(800); await shot(w, 'g4y-1-delete-pressed')
  const vis = await P.evaluate(() => [...document.querySelectorAll('button, input, select, [role=dialog]')].filter(e => e.getBoundingClientRect().height > 0 && /del|date|confirm|sure|cancel/i.test((e.id || '') + (e.innerText || '') + (e.dataset.testid || ''))).map(e => (e.dataset.testid || e.id || e.tagName) + ':' + (e.innerText || e.value || '').trim().slice(0, 60).replace(/\s+/g, ' ')))
  console.log(JSON.stringify(vis))
} catch (e) { console.log('ERR', String(e).slice(0, 300)) }
await w.ctx.close(); await L.closeBrowser()
