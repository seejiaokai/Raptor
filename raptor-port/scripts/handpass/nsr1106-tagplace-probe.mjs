// [NOTSAVED-REFUSAL-LOOK] the drawing check's one difference: on the phone the drawing's "Blocked" tag starts at the figure
// box's right edge, the build's at its left. Where is each tag's containing box, on each build, with and without the
// phone's mobile viewport? Usage (from raptor-port/): WALK_DIR=<dist> MG_OUT=<folder> node …/nsr1106-tagplace-probe.mjs
import * as L from './mg1105-lib.mjs'
const T = id => `[data-testid="${id}"]`
const read = (page, label) => page.evaluate(([s, label]) => {
  const e = document.querySelector(s.replace('dice"]', 'dice-err"]')), i = document.querySelector(s), fb = i && i.closest('.bp-fb')
  const r = x => x && (b => ({ x: Math.round(b.x), w: Math.round(b.width) }))(x.getBoundingClientRect())
  return { label, offL: e && e.offsetLeft, cbRect: e && e.offsetParent && r(e.offsetParent), ml: e && getComputedStyle(e).marginLeft, tf: fb && getComputedStyle(fb).transform, wm: e && getComputedStyle(e).position, box: r(i), fb: r(fb), tag: r(e), cb: e && e.offsetParent && (e.offsetParent.className || e.offsetParent.tagName), left: e && getComputedStyle(e).left, right: e && getComputedStyle(e).right, cls: e && e.className, text: e && e.textContent }
}, [T('bal-LVE-dice'), label])
for (const mobile of [false, true]) {
  L.SIZES.phone.opts = { viewport: { width: 402, height: 874 }, hasTouch: true, isMobile: mobile }
  const { page } = await L.open('phone')
  await L.signIn(page, 'ad', 'a')
  await page.evaluate(() => window.go('leavewar')); await page.waitForTimeout(1500)
  await page.locator(T('lw-tab-balances')).first().click(); await page.waitForTimeout(900)
  const bx = page.locator(T('bal-LVE-dice'))
  await bx.scrollIntoViewIfNeeded(); await bx.click(); await bx.fill('abc'); await page.keyboard.press('Enter'); await page.waitForTimeout(300)
  L.note(`isMobile=${mobile} red tag, box focused`, await read(page, 'red'))
  await page.locator(T('balances-page')).click({ position: { x: 4, y: 4 } }).catch(() => {}); await page.waitForTimeout(200)
  L.note(`isMobile=${mobile} red tag, after a tap away`, await read(page, 'red-away'))
  await page.evaluate((s) => { const e = document.querySelector(s); e.classList.add('bp-blocked'); e.style.left = '0px'; e.style.right = 'auto'; if (window.__relayout) { e.style.display = 'none'; void e.offsetHeight; e.style.display = '' } }, T('bal-LVE-dice-err'))
  L.note(`isMobile=${mobile} same tag, left 0`, await read(page, 'left0'))
  await page.evaluate((s) => { const e = document.querySelector(s); e.style.display = 'none'; void e.offsetHeight; e.style.display = '' }, T('bal-LVE-dice-err'))
  L.note(`isMobile=${mobile} same tag, laid out afresh`, await read(page, 'relayout'))
  await page.context().close()
}
process.exit(0)
