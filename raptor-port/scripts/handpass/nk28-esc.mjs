// The host's reproduction: Escape and the changes window, in a PLAIN browser (storage works) — both walkers saw it stay
// open. From raptor-port/:  WALK_DIR=dist node scripts/handpass/nk28-esc.mjs
console.log('nk28-esc v1')
const H = await import('./nk28-w1-lib.mjs')
const { L, world, sleep, tab, vis } = H
const w = await world({ locked: false }); const p = w.page
await p.waitForSelector('#luser'); await L.login(p, 'a'); await tab(p, 'editsched')
await p.click('#histBtn'); await sleep(900)
const open = !!(await vis(p, '.chgwin'))
await p.keyboard.press('Escape'); await sleep(600)
const afterBody = !!(await vis(p, '.chgwin'))
if (afterBody) { await p.locator('.chgwin').first().click({ position: { x: 40, y: 12 } }); await sleep(300); await p.keyboard.press('Escape'); await sleep(600) }
const afterInside = !!(await vis(p, '.chgwin'))
console.log(JSON.stringify({ open, openAfterEscape: afterBody, openAfterClickInsideThenEscape: afterInside, errors: w.errors || [] }))
await L.closeAll?.()
process.exit(0)
