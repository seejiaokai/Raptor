// W3 group E - scenarios 11 (reload), 13 (member), plus a sanity check that the top-bar Undo is live for a non-posting change.
import { newWorld, rec, idOf } from './lib.mjs'
const which = process.argv[2] || 'desktop'
console.log(`w3 groupE VERSION 2 - ${which}`)
const P = which === 'phone' ? 'p' : 'd'
let ANV = null
const sheetText = page => page.evaluate(() => { const s = document.querySelector('.bidsheet'); return s ? s.innerText.replace(/\s+/g, ' ') : '(no sheet up)' })
const state = page => page.evaluate(anv => {
  const g = who => [...document.querySelectorAll(`[data-testid^="cell-${who}-2026-07-"]`)].filter(e => /gone/.test(e.className)).map(e => e.getAttribute('data-testid').slice(-2))
  const r = a => a.length ? `${a[0]}..${a[a.length - 1]} (${a.length})` : '(none)'
  return `Drifter struck ${r(g('slipway'))}; Anvil struck ${r(g(anv))}`
}, ANV)

// ===================== S11
{
  const w = await newWorld(which, { tag: 'E-s11' }); const { page } = w
  try {
    console.log('\n== S11')
    await w.login(); await w.toLeaveWar(); ANV = await idOf(page, 'Anvil'); console.log('  Anvil id', ANV)
    // posting 1: Drifter out from 20 Jul
    await w.tapCell('slipway', '2026-07-14'); await w.press('[data-testid="bid-postout"]')
    await w.press('[data-testid="po-date"]'); await w.cardOnTop('S11 PO'); await w.pickDay('2026-07-20')
    await w.press('[data-testid="po-confirm"]'); await page.waitForTimeout(700)
    // posting 2 (scenario 4): Anvil in from 20 Jul
    await w.tapCell(ANV, '2026-07-14'); await w.press('[data-testid="bid-postin"]')
    await w.press('[data-testid="pi-date"]'); await w.cardOnTop('S11 PI'); await w.pickDay('2026-07-20')
    await w.press('[data-testid="pi-confirm"]'); await page.waitForTimeout(700)
    const before = await state(page); console.log('  before reload:', before)
    await w.shot(`s11-${P}-before-reload`)
    await page.reload(); await page.waitForTimeout(1500)
    let signedAgain = false
    if (await page.locator('#luser').count() && await w.vis('#luser')) { signedAgain = true; await page.fill('#luser', 'ad'); await page.fill('#lpass', 'a'); await page.click('#loginForm button[type=submit]'); await page.waitForSelector('#vWeek .day', { state: 'attached' }) }
    await w.toLeaveWar()
    const after = await state(page); console.log('  after reload:', after, 'signed in again:', signedAgain)
    await w.shot(`s11-${P}-after-reload`)
    // open Drifter's struck day to see the posting date survives
    await w.tapCell('slipway', '2026-07-24')
    const po = await page.locator('[data-testid="postout-date"]').count() ? await w.val('[data-testid="postout-date"]') : '(no Post out box)'
    await page.keyboard.press('Escape').catch(() => {}); await page.waitForTimeout(300); await w.press('[data-testid="month-JUL"]'); await page.waitForTimeout(800)
    await w.tapCell(ANV, '2026-07-10')
    const pi = await page.locator('[data-testid="postin-date"]').count() ? await w.val('[data-testid="postin-date"]') : '(no Post in box)'
    await w.shot(`s11-${P}-after-reload-anvil-sheet`)
    rec(w, '11', before === after && po === '2026-07-20' && pi === '2026-07-20' ? 'PASS' : 'FAIL', `before reload: ${before}; after reload (signed in again: ${signedAgain}): ${after}; Drifter's Post out box on a struck day reads ${po}; Anvil's Post in box on a day before reads ${pi}`, `s11-${P}-before-reload.png, s11-${P}-after-reload.png`)
  } catch (e) { console.log('ERR S11', String(e).slice(0, 500)); await w.shot(`E-S11-ERR-${P}`).catch(() => {}); rec(w, '11', 'NOT WALKED', 'script error: ' + String(e).slice(0, 200)) }
  await w.close().catch(() => {})
}

// ===================== S3 sanity: top-bar Undo is live for a non-posting change
{
  const w = await newWorld(which, { tag: 'E-undo' }); const { page } = w
  try {
    console.log('\n== top-bar Undo sanity')
    await w.login(); await w.toLeaveWar(); ANV = await idOf(page, 'Anvil'); console.log('  Anvil id', ANV)
    const dis0 = await page.evaluate(() => ({ undo: document.querySelector('#undoBtn')?.disabled, redo: document.querySelector('#redoBtn')?.disabled }))
    await w.press('[data-testid="month-FEB"]'); await page.waitForTimeout(800); await w.tapCell(ANV, '2026-02-10'); await w.press('[data-testid="bid-LL"]'); await w.press('[data-testid="bid-LL"]'); await page.waitForTimeout(700); const llCls = await page.locator('[data-testid="cell-' + ANV + '-2026-02-10"]').getAttribute('class')
    const afterBid = await page.evaluate(() => ({ undo: document.querySelector('#undoBtn')?.disabled, redo: document.querySelector('#redoBtn')?.disabled, sheet: !!document.querySelector('.bidsheet') }))
    // now a posting on top of that
    await page.keyboard.press('Escape').catch(() => {}); await page.waitForTimeout(300); await w.press('[data-testid="month-JUL"]'); await page.waitForTimeout(800)
    await w.tapCell('slipway', '2026-07-14'); await w.press('[data-testid="bid-postout"]')
    await w.press('[data-testid="po-date"]'); await w.cardOnTop('undo-sanity PO'); await w.pickDay('2026-07-20')
    await w.press('[data-testid="po-confirm"]'); await page.waitForTimeout(700)
    const afterPO = await page.evaluate(() => ({ undo: document.querySelector('#undoBtn')?.disabled, redo: document.querySelector('#redoBtn')?.disabled }))
    const goneN = () => page.evaluate(() => [...document.querySelectorAll('[data-testid^="cell-slipway-2026-07-"]')].filter(e => /gone/.test(e.className)).length)
    const n0 = await goneN()
    let undoNote = ''
    if (!afterPO.undo) { if (w.TOUCH) await page.locator('#undoBtn').tap(); else await page.locator('#undoBtn').click(); await page.waitForTimeout(700); const nDrawn = await goneN(); const monthNow = await page.evaluate(() => (document.querySelector('[data-testid^="month-"].on, [data-testid^="month-"].act, [data-testid^="month-"][aria-pressed="true"], [data-testid^="month-"][class*="sel"]') || {}).textContent || '(unknown)'); await w.press('[data-testid="month-JUL"]'); await page.waitForTimeout(900); const nJul = await goneN(); await w.shot(`s3-${P}-after-undo-july`); undoNote = `app Undo pressed: Drifter struck July days ${n0} -> ${nDrawn} straight after (month button lit: ${monthNow}), ${nJul} after going back to JUL; Anvil 10 Feb cell class "${await page.locator(`[data-testid="cell-${ANV}-2026-02-10"]`).getAttribute('class', { timeout: 1500 }).catch(() => 'not drawn on screen now (the phone draws a window of months)')}"` }
    await w.shot(`s3-${P}-undo-sanity`)
    rec(w, '3c', 'RECORD', `with a leave (LL) placed on Anvil 10 Feb (cell class then "${llCls}"): top-bar Undo/Redo disabled at start ${JSON.stringify(dis0)}, after the LL ${JSON.stringify(afterBid)}; then a posting out of Drifter from 20 Jul: ${JSON.stringify(afterPO)}; ${undoNote || 'Undo disabled'}`, `s3-${P}-undo-sanity.png`)
  } catch (e) { console.log('ERR undo', String(e).slice(0, 500)); await w.shot(`E-undo-ERR-${P}`).catch(() => {}); rec(w, '3c', 'NOT WALKED', 'script error: ' + String(e).slice(0, 200)) }
  await w.close().catch(() => {})
}

// ===================== S13 member
{
  const w = await newWorld(which, { tag: 'E-s13' }); const { page } = w
  try {
    console.log('\n== S13')
    await w.login('us', 'us')
    await page.evaluate(() => window.go('leavewar')); await page.waitForTimeout(900)
    await page.waitForSelector('[data-testid="row-slipway"]', { timeout: 10000 })
    const rowId = await idOf(page, 'Ranger'), otherId = 'slipway'
    console.log('  Ranger row id:', rowId)
    const tryDay = async (month, iso, who, label, shotName) => {
      await w.press(`[data-testid="month-${month}"]`); await page.waitForTimeout(900)
      await w.tapCell(who, iso)
      const t = await sheetText(page)
      const ctl = await page.evaluate(() => [...document.querySelectorAll('.bidsheet [data-testid]')].map(e => e.getAttribute('data-testid')).join(' '))
      await w.shot(shotName)
      console.log(`  ${label}:`, t, '| controls:', ctl)
      await page.keyboard.press('Escape').catch(() => {}); await page.waitForTimeout(300); await w.press('[data-testid="month-JUL"]'); await page.waitForTimeout(800)
      if (await page.locator('.bidsheet').count()) { await page.locator('[data-testid="bid-cancel"]').first().click().catch(() => {}); await page.waitForTimeout(300) }
      return { t, ctl }
    }
    const jul = await tryDay('JUL', '2026-07-14', rowId, 'his own row, Jul 14 (outside the bidding window)', `s13-${P}-member-own-july`)
    const feb = await tryDay('FEB', '2026-02-10', rowId, 'his own row, Feb 10 (inside the bidding window 1 Jan - 31 Mar)', `s13-${P}-member-own-feb`)
    const oth = await tryDay('FEB', '2026-02-10', otherId, "Drifter's row, Feb 10", `s13-${P}-member-other-feb`)
    rec(w, '13', 'RECORD', `signed in as Ranger (us; row id ${rowId}). His own row 14 Jul (outside the open bidding window): sheet "${jul.t.slice(0, 160)}" controls [${jul.ctl}]. His own row 10 Feb (inside the window): sheet "${feb.t.slice(0, 200)}"; PO offered=${feb.ctl.includes('bid-postout')}, PI offered=${feb.ctl.includes('bid-postin')}; controls [${feb.ctl}]. Drifter's row 10 Feb for comparison: sheet "${oth.t.slice(0, 160)}"`, `s13-${P}-member-own-feb.png, s13-${P}-member-own-july.png`)
  } catch (e) { console.log('ERR S13', String(e).slice(0, 500)); await w.shot(`E-S13-ERR-${P}`).catch(() => {}); rec(w, '13', 'NOT WALKED', 'script error: ' + String(e).slice(0, 200)) }
  await w.close().catch(() => {})
}
console.log('DONE')
