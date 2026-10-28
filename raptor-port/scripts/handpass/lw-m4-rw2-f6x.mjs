// Re-walk 2 F6x — baseline for F6: the Leave War grid scrolled down by its own cell tap (no Approvals involved), then Edit Schedule / Inputs: where do they open?
process.env.LW_OUT ||= '../../docs/img/handpass/2026-10-27-lw-m4/rewalk2'
const A = await import('./lw-m4-walk-a-lib.mjs')
const { L, pressLoc, lineLoc } = A
const { T, rec, shot } = L
console.log('[lw-m4-rw2-f6x v1]')
const w = await L.newCtx('desk'); const P = w.page
const st = () => P.evaluate(() => ({ winY: Math.round(document.scrollingElement.scrollTop), winMax: Math.round(document.scrollingElement.scrollHeight - innerHeight), page: [...document.querySelectorAll('[id^="page-"]')].filter(e => e.getBoundingClientRect().height > 0).map(e => e.id + '@' + Math.round(e.getBoundingClientRect().top)) }))
async function clickNav(name) { const el = P.locator('a, button').filter({ hasText: new RegExp('^' + name + '$') }).first(); const b = await el.boundingBox(); await P.mouse.click(b.x + b.width / 2, b.y + b.height / 2) }
try {
  await L.signIn(w, 'admin')
  // scroll the page down on the plain grid (window scroll), no Approvals
  await P.evaluate(() => window.scrollTo(0, 547)); await P.waitForTimeout(400)
  console.log('plain grid scrolled', JSON.stringify(await st()))
  await clickNav('Edit Schedule'); await P.waitForTimeout(1200)
  const e = await st(); console.log('Edit Schedule after leaving a scrolled plain grid', JSON.stringify(e)); await shot(w, 'f6x-1-edit-from-plain-grid')
  await clickNav('Leave War'); await P.waitForTimeout(1000)
  console.log('back on the war', JSON.stringify(await st()))
  // and Edit Schedule reached with no Leave War visit before it, scrolled by hand
  await clickNav('Edit Schedule'); await P.waitForTimeout(800)
  console.log('Edit Schedule again', JSON.stringify(await st()))
  await clickNav('Inputs'); await P.waitForTimeout(800)
  console.log('Inputs', JSON.stringify(await st()))
  // a plain visit sequence with the war never scrolled
  await clickNav('Leave War'); await P.waitForTimeout(800); await P.evaluate(() => window.scrollTo(0, 0)); await clickNav('Edit Schedule'); await P.waitForTimeout(800)
  console.log('Edit Schedule from an unscrolled war', JSON.stringify(await st()))
} catch (e) { console.log('ERR', e) }
await w.ctx.close(); await L.closeBrowser(); console.log('DONE')
