// Walker B, script 3: S12 — the failed-save strip in every place it shows, at the phone (402x874) and the desktop (1536x864).
import * as L from './mgb-walk-b-lib.mjs'
console.log('mgb-walk-b3 v1')
const AMBER = 'rgb(229, 194, 74)'

async function strip(page, ctx, id, sel, shotName, clipH) {
  await page.waitForSelector(sel, { timeout: 8000 }).catch(() => {})
  const f = await L.stripFacts(page, sel)
  if (!f) { L.check(id, 'the strip is up', false, null); return null }
  await page.waitForTimeout(250)
  const am = f.sign ? await L.amberIn(ctx, page, { x: f.sign.x, y: f.sign.y, width: f.sign.w, height: f.sign.h }) : { amber: 0 }
  const ok = f.h === 36 && f.l === 0 && f.r === f.vw && Number(f.leadWeight) >= 600 && f.lead === 'Not saved' && f.retryBg === AMBER && f.retryRightGap <= 24 && f.retryIn && am.amber > 8 && (f.shadow === 'none') && !f.wordsCut
  L.check(id, `strip: 36 high, edge to edge, sign drawn amber, "Not saved" bold, Retry solid amber at the right, no glow, words not cut`, ok, { h: f.h, l: f.l, r: f.r, vw: f.vw, lead: f.lead, weight: f.leadWeight, retryBg: f.retryBg, retryGapRight: f.retryRightGap, amberPx: am.amber, signBox: f.sign && [Math.round(f.sign.w), Math.round(f.sign.h)], shadow: f.shadow, btnShadow: f.btnShadow, edgeTop: f.edgeTop, edgeBottom: f.edgeBottom, bg: f.bg, rest: f.restText, wordsCut: f.wordsCut })
  const clip = { x: 0, y: Math.max(0, f.top - 60), width: f.vw, height: clipH || 160 }
  await L.shot(page, shotName, clip)
  return f
}

async function run(kind, w, h) {
  const sfx = kind === 'phone' ? 'phone' : 'desk'
  const { page, tap, ctx } = await L.openAt(kind, w, h)
  const press = (sel) => (tap ? page.locator(sel).tap() : page.locator(sel).click())
  try {
    await L.pinToday(page)
    await L.signIn(page, 'ad', 'a')
    await page.waitForSelector('#vWeek .day', { state: 'attached' })
    await L.raiseBand(page, tap)
    for (const pg of ['editsched', 'quals', 'leavewar']) {
      await L.go(page, pg)
      await page.evaluate(() => window.scrollTo(0, 0))
      await strip(page, ctx, `S12-${sfx}-top-${pg}`, '.topbar > .savestat.failed', `S12-${sfx}-top-${pg}`)
    }
    // the Leave War's OIL tracker, grid and settings
    await L.go(page, 'leavewar')
    await page.locator('[data-testid="oil-tracker"]:visible').first().click({ timeout: 8000 }).catch(async () => { await page.locator('[data-testid="oil-tracker"]:visible').first().tap() })
    await page.waitForTimeout(700)
    await strip(page, ctx, `S12-${sfx}-oiltracker-grid`, '[data-testid="oil-sheet"] .saveband', `S12-${sfx}-oiltracker-grid`)
    await page.locator('[data-testid="oil-settings"]').click({ timeout: 8000 }).catch(async () => { await page.locator('[data-testid="oil-settings"]').tap() })
    await page.waitForTimeout(700)
    await strip(page, ctx, `S12-${sfx}-oiltracker-settings`, '[data-testid="oil-sheet"] .saveband', `S12-${sfx}-oiltracker-settings`)
    await ctx.close()
  } catch (e) { L.notWalked(`S12-${sfx}-pages`, 'threw: ' + String(e.message).split('\n')[0]); await ctx.close().catch(() => {}) }
  // the board's bar, and both bars together
  const c2 = await L.openAt(kind, w, h)
  try {
    const r = await L.oilBarUp(c2.page, c2.tap, { band: true })
    L.check(`S12-${sfx}-both-up`, 'both bars up on the board', r.up, r.up)
    await c2.page.waitForTimeout(400)
    const f = await strip(c2.page, c2.ctx, `S12-${sfx}-board-band`, '#schedBoard .saveband', `S12-${sfx}-board-both`, 220)
    const o = await L.barFacts(c2.page)
    const am = o.sign ? await L.amberIn(c2.ctx, c2.page, { x: o.sign.l, y: o.top + (o.h - o.sign.h) / 2, width: o.sign.w, height: o.sign.h }) : { amber: 0 }
    const bandBottom = f ? f.top + f.h : null
    L.check(`S12-${sfx}-both-oil`, 'with both up: OIL bar 36 high, edge to edge, sign amber, one under the other (no gap, no overlap), nothing past the right edge', o.h === 36 && o.l === 0 && o.r === o.vw && am.amber > 8 && !o.pastRight && Math.abs(o.top - bandBottom) <= 1, { oil: { h: o.h, l: o.l, r: o.r, top: o.top, amber: am.amber }, bandBottom, pastRight: o.pastRight })
    const edge = await c2.page.evaluate(() => { const b = document.querySelector('[data-testid="oilbar"]'), s = getComputedStyle(b); return { shadow: s.boxShadow, edgeBottom: s.borderBottomColor, edgeTop: s.borderTopColor, bg: s.backgroundColor } })
    L.note(`S12-${sfx}-oilbar-style`, edge)
  } catch (e) { L.notWalked(`S12-${sfx}-board`, 'threw: ' + String(e.message).split('\n')[0]) }
  await c2.ctx.close().catch(() => {})
}
await run('desktop', 1536, 864)
await run('phone', 402, 874)
await L.finish('b3')
process.exit(0)
