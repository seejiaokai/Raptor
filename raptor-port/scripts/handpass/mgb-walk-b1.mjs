// Walker B, script 1: S10 (OIL bar at phone 320 and 375, with and without the band) and S13's second half (desktop keys).
import * as L from './mgb-walk-b-lib.mjs'
console.log('mgb-walk-b1 v1')
const only = process.env.ONLY || ''

async function s10(w, h, band) {
  const id = `S10-${w}${band ? '-band' : ''}`
  const { page, tap, ctx } = await L.openAt('phone', w, h)
  try {
    let r
    const onTap = async () => { await L.shot(page, `${id}-tap`) }
    for (let attempt = 1; attempt <= 2; attempt++) {
      try { r = await L.oilBarUp(page, tap, { band, onTap }); break }
      catch (e) { L.note(id, `attempt ${attempt} threw: ${String(e.message).split('\n')[0]}`); if (attempt === 1) { await ctx.clearCookies(); await page.reload(); await page.waitForSelector('#luser') } }
    }
    if (!r) {
      // fallback: the drag at 402x874, then the screen set to the width
      L.note(id, 'direct route failed; trying drag at 402x874 then resizing')
      L.notWalked(id, 'the OIL bar route could not be driven at this size'); return
    }
    L.check(id, 'the OIL bar is up and nothing moved', r.up && JSON.stringify(r.before) === JSON.stringify(r.after), { up: r.up })
    await page.waitForTimeout(400)
    const f = await L.barFacts(page)
    L.note(id, f)
    L.check(`${id}-h`, 'bar height 36', f.h === 36, f.h)
    L.check(`${id}-fit`, 'one line, nothing past the right edge, words not cut', f.oneLine && !f.pastRight && !f.msgCut && f.scrollW <= f.vw, { oneLine: f.oneLine, pastRight: f.pastRight, msgCut: f.msgCut, scrollW: f.scrollW, vw: f.vw })
    const ok = f.kids[f.kids.length - 1]
    L.check(`${id}-ok`, 'OK button on screen', ok.r <= f.vw && ok.l >= 0, ok)
    if (f.sign) {
      const am = await L.amberIn(ctx, page, { x: f.sign.l, y: f.top + (f.h - f.sign.h) / 2, width: f.sign.w, height: f.sign.h })
      L.check(`${id}-sign`, 'sign drawn amber (pixels) and 16px', am.amber > 8 && f.sign.w === 16, { am, sign: f.sign })
    } else L.check(`${id}-sign`, 'a sign element found', false, null)
    await L.shot(page, `${id}-settled`, { x: 0, y: 0, width: w, height: 300 })
    // stand-in for the longest wording (the real one needs a cancelled input): letters replaced only
    const msg = await page.evaluate(() => { const m = document.querySelector('[data-testid="oilbar-text"]'); return m.innerHTML })
    L.note(id, 'msg html: ' + msg)
    await page.evaluate(() => {
      const m = document.querySelector('[data-testid="oilbar-text"]')
      const lead = m.querySelector('b'), rest = m.querySelector('.sv-rest')
      if (lead) lead.textContent = 'Not un-cancelled'
      if (rest) rest.textContent = 'OIL not answered'
      window.dispatchEvent(new Event('resize'))
    })
    await page.waitForTimeout(400)
    const f2 = await L.barFacts(page)
    L.check(`${id}-long`, 'STAND-IN longest wording (letters replaced in the page): one line, not past right edge, not cut, h 36', f2.oneLine && !f2.pastRight && !f2.msgCut && f2.h === 36, { h: f2.h, oneLine: f2.oneLine, pastRight: f2.pastRight, msgCut: f2.msgCut, kids: f2.kids, msgW: f2.kids[0] })
    await L.shot(page, `${id}-longword`, { x: 0, y: 0, width: w, height: 300 })
  } catch (e) { L.notWalked(id, 'threw: ' + String(e.message).split('\n')[0]) }
  await ctx.close()
}

async function s13() {
  const id = 'S13b-desk'
  const { page, tap, ctx } = await L.openAt('desktop', 1536, 864)
  try {
    const r = await L.oilBarUp(page, tap)
    L.check(id + '-up', 'the OIL bar is up', r.up, r.up)
    await page.waitForTimeout(300)
    const f = await L.barFacts(page)
    const ring = await page.evaluate(() => {
      const a = document.activeElement, s = a ? getComputedStyle(a) : null
      return { active: a && (a.getAttribute('data-testid') || a.tagName), focusVisible: a ? a.matches(':focus-visible') : null, outline: s && `${s.outlineStyle} ${s.outlineWidth} ${s.outlineColor} off ${s.outlineOffset}` }
    })
    L.check(id + '-focus', 'Answer OIL has the keys when the bar comes up', ring.active === 'oilbar-answer', ring)
    L.check(id + '-ring', 'its ring is visible (focus-visible, outline width > 0)', ring.focusVisible === true && /solid 2px/.test(ring.outline || ''), ring)
    const b = f.kids[1]
    await L.shot(page, id + '-ring', { x: Math.max(0, b.l - 260), y: f.top - 10, width: 600, height: 60 })
    await L.shot(page, id + '-board')
    await page.keyboard.press('Escape'); await page.waitForTimeout(500)
    const gone = await page.locator('[data-testid="oilbar"]').count()
    L.check(id + '-esc', 'Escape closes the bar', gone === 0, { barCount: gone })
    await L.shot(page, id + '-after-escape')
    const still = await page.evaluate(() => ({ confirm: !!document.querySelector('[data-testid="oilconf"]'), board: !!document.querySelector('#schedBoard:not([hidden])') }))
    L.note(id, 'after Escape: ' + JSON.stringify(still))
  } catch (e) { L.notWalked(id, 'threw: ' + String(e.message).split('\n')[0]) }
  await ctx.close()
}

if (!only || only === 's10') {
  await s10(375, 812, false)
  await s10(375, 812, true)
  await s10(320, 640, false)
  await s10(320, 640, true)
}
if (!only || only === 's13') await s13()
await L.finish('b1')
process.exit(0)
