// Walker B, script 1b: S13's second half again, the two ways the question is left: by mouse press and by the keyboard.
import * as L from './mgb-walk-b-lib.mjs'
console.log('mgb-walk-b1b v1')
async function s13(byKey) {
  const id = 'S13b-desk-' + (byKey ? 'keys' : 'mouse')
  const { page, tap, ctx } = await L.openAt('desktop', 1536, 864)
  try {
    const r = await L.oilBarUp(page, tap, { cancelByKey: byKey })
    L.check(id + '-up', 'the OIL bar is up', r.up, r.up)
    await page.waitForTimeout(300)
    const f = await L.barFacts(page)
    const ring = await page.evaluate(() => {
      const a = document.activeElement, s = a ? getComputedStyle(a) : null
      return { active: a && (a.getAttribute('data-testid') || a.tagName), focusVisible: a ? a.matches(':focus-visible') : null, outline: s && `${s.outlineStyle} ${s.outlineWidth} ${s.outlineColor} off ${s.outlineOffset}` }
    })
    L.check(id + '-focus', 'Answer OIL has the keys when the bar comes up', ring.active === 'oilbar-answer', ring)
    const ringOk = ring.focusVisible === true && /solid 2px/.test(ring.outline || '')
    if (byKey) L.check(id + '-ring', 'its ring is visible (focus-visible, solid 2px outline)', ringOk, ring)
    else L.note(id + '-ring', 'RECORDED, left by a mouse press: ' + JSON.stringify(ring) + ' (the browser shows no ring for a script focus after a mouse press)')
    const b = f.kids[1]
    await L.shot(page, id + '-ring', { x: Math.max(0, b.l - 260), y: f.top - 10, width: 600, height: 60 })
    await L.shot(page, id + '-board')
    // a Tab/Shift+Tab nudge shows what a keyboard user would see on this button
    if (!byKey) {
      await page.keyboard.press('Shift+Tab'); await page.keyboard.press('Tab')
      const r2 = await page.evaluate(() => { const a = document.activeElement, s = getComputedStyle(a); return { active: a.getAttribute('data-testid'), fv: a.matches(':focus-visible'), outline: `${s.outlineStyle} ${s.outlineWidth} ${s.outlineColor}` } })
      L.note(id + '-ring2', 'after Shift+Tab, Tab (keys now): ' + JSON.stringify(r2))
      await L.shot(page, id + '-ring-afterkeys', { x: Math.max(0, b.l - 260), y: f.top - 10, width: 600, height: 60 })
    }
    await page.keyboard.press('Escape'); await page.waitForTimeout(500)
    const gone = await page.locator('[data-testid="oilbar"]').count()
    L.check(id + '-esc', 'Escape closes the bar', gone === 0, { barCount: gone })
    await L.shot(page, id + '-after-escape')
    const still = await page.evaluate(() => ({ confirm: !!document.querySelector('[data-testid="oilconf"]'), board: !!document.querySelector('#schedBoard:not([hidden])') }))
    L.note(id, 'after Escape: ' + JSON.stringify(still))
  } catch (e) { L.notWalked(id, 'threw: ' + String(e.message).split('\n')[0]) }
  await ctx.close()
}
await s13(true)
await s13(false)
await L.finish('b1b')
process.exit(0)
