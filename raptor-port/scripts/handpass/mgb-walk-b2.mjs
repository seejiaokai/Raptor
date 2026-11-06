// Walker B, script 2: S11 (phone sideways 874x402, board Desktop layout, both bars, panned) and S20 (band only, panned).
import * as L from './mgb-walk-b-lib.mjs'
console.log('mgb-walk-b2 v1')

const reach = (page, sel) => page.evaluate(sel => {
  const band = document.querySelector(sel)
  if (!band) return null
  const btns = [...band.querySelectorAll('button')]
  const out = btns.map(btn => { const b = btn.getBoundingClientRect(); const hit = document.elementFromPoint(b.left + b.width / 2, b.top + b.height / 2); return { t: btn.textContent, l: Math.round(b.left), r: Math.round(b.right), inScreen: b.left >= 0 && b.right <= innerWidth && b.width > 0, hit: hit === btn || btn.contains(hit) } })
  const msg = band.querySelector('.sv-msg, .oil-msg'), m = msg.getBoundingClientRect(), r = band.getBoundingClientRect()
  return { band: { l: Math.round(r.left), r: Math.round(r.right), top: Math.round(r.top), h: Math.round(r.height) }, words: { l: Math.round(m.left), r: Math.round(m.right), in: m.left >= 0 && m.left < innerWidth - 60 }, btns: out, vw: innerWidth }
}, sel)

async function pans(page, id, bandSel, oilToo) {
  const widest = await page.locator('#schedBoard').evaluate(b => b.scrollWidth - b.clientWidth)
  L.check(id + '-pans', 'the layout really pans', widest > 100, widest)
  for (const [nm, pan] of [['left', 0], ['mid', Math.round(widest / 2)], ['right', widest]]) {
    await page.locator('#schedBoard').evaluate((b, x) => { b.scrollLeft = x }, pan)
    await page.waitForTimeout(400)
    const got = await page.locator('#schedBoard').evaluate(b => Math.round(b.scrollLeft))
    const band = await reach(page, bandSel)
    const sf = await L.stripFacts(page, bandSel)
    const ok = band && band.words.in && band.btns.every(b => b.inScreen && b.hit)
    L.check(`${id}-${nm}`, `band words at left, Retry on screen and pressable (panned ${got} of ${widest}); band h ${sf && sf.h}, retry gap to right ${sf && sf.retryRightGap}`, !!ok && sf.h === 36, { band, h: sf && sf.h, gap: sf && sf.retryRightGap, wordsCut: sf && sf.wordsCut })
    if (oilToo) {
      const o = await reach(page, '[data-testid="oilbar"]')
      const of = await L.barFacts(page)
      const bp = band && o ? { bandBottom: band.band.top + band.band.h, oilTop: o.band.top, gap: o.band.top - (band.band.top + band.band.h), overlap: o.band.top < band.band.top + band.band.h - 0.5 } : null
      L.check(`${id}-${nm}-oil`, 'OIL bar: its buttons on screen and pressable; not piled on the band', !!o && o.btns.every(b => b.inScreen && b.hit) && bp && !bp.overlap, { o, bp, h: of && of.h, msgCut: of && of.msgCut })
    }
    await L.shot(page, `${id}-${nm}`, { x: 0, y: 0, width: 874, height: 402 })
  }
}

async function s11() {
  const id = 'S11-874'
  const { page, tap, ctx } = await L.openAt('phone', 874, 402)
  try {
    const r = await L.oilBarUp(page, tap, { band: true, dragSize: { width: 1024, height: 768 } })
    L.check(id + '-up', 'both bars up (OIL bar and failed-save band)', r.up && JSON.stringify(r.before) === JSON.stringify(r.after), { up: r.up })
    const bandOn = await page.locator('#schedBoard .saveband').count()
    L.note(id, `before the layout switch: failed band on the board ${bandOn}; top bar band ${await page.locator('.topbar > .savestat.failed').count()}`)
    await L.shot(page, id + '-before-wide')
    await page.locator('#sbMore').tap(); await page.waitForTimeout(300)
    await page.locator('#sbMoreWide').tap(); await page.waitForTimeout(600)
    const wide = await page.locator('#schedBoard').evaluate(b => b.classList.contains('sb-wide'))
    L.check(id + '-wide', 'Desktop layout is on', wide, wide)
    L.check(id + '-oilkept', 'the OIL bar is still up after the switch', (await page.locator('[data-testid="oilbar"]').count()) === 1, await page.locator('[data-testid="oilbar"]').count())
    await pans(page, id, '#schedBoard .saveband', true)
  } catch (e) { L.notWalked(id, 'threw: ' + String(e.message).split('\n')[0]) }
  await ctx.close()
}
async function s20() {
  const id = 'S20-874'
  const { page, tap, ctx } = await L.openAt('phone', 874, 402)
  try {
    await L.pinToday(page)
    await L.signIn(page, 'ad', 'a')
    await page.waitForSelector('#vWeek .day', { state: 'attached' })
    await L.raiseBand(page, tap)
    await L.go(page, 'editsched')
    await page.locator('#eWeek [data-sbday="1"]:visible').first().tap()
    await page.waitForSelector('#schedBoard:not([hidden])')
    await page.waitForTimeout(500)
    await page.locator('#sbMore').tap(); await page.waitForTimeout(300)
    await page.locator('#sbMoreWide').tap(); await page.waitForTimeout(600)
    const wide = await page.locator('#schedBoard').evaluate(b => b.classList.contains('sb-wide'))
    L.check(id + '-wide', 'Desktop layout is on, band up', wide && (await page.locator('#schedBoard .saveband').count()) === 1, wide)
    await pans(page, id, '#schedBoard .saveband', false)
  } catch (e) { L.notWalked(id, 'threw: ' + String(e.message).split('\n')[0]) }
  await ctx.close()
}
await s11()
await s20()
await L.finish('b2')
process.exit(0)
