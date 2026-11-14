// LESSON 31 ON THE APPROVALS PAGE (13 Nov 26, [APPROVALS-SCROLL-INSIDE], his D2006, D2008): a real Chrome window STARTED
// at 125%, no screen size emulated, resized through the browser's own window (DevTools' Browser.setWindowBounds — the
// window, not an emulated page) to neighbouring heights, some making the page's height a fraction. At each: the window
// behind the page must scroll by nothing; the page and its card reach the screen's foot (8px off, as Balances); only the
// list scrolls, and a wheel turned at its foot then at once back up moves the list at once, the window still.
// Also a short window, a tall wide one (2560), and the window narrowed across the 700 phone width and back.
//   cd raptor-port ; APPR_DIST=<built folder> APPR_OUT=<picture folder> node scripts/handpass/appr-pc-fit.mjs
import { launchReal125, stageWorld, geo, pic, writeLog, watchErrors, sleep, PAGE } from './appr-pc-lib.mjs'

console.log('[appr-pc-fit v2]')
const log = []; const note = s => { log.push(s); console.log(s) }
const fails = []; const check = (ok, what) => { note(`  ${ok ? 'PASS' : 'FAIL'} ${what}`); if (!ok) fails.push(what) }
const errs = []
const { browser, page, headless } = await launchReal125({ w: 1550, h: 917 })
note(`window: ${headless ? 'HEADLESS' : 'a real headed window'} at --force-device-scale-factor=1.25, no viewport emulated`)
watchErrors(page, errs)
const n = await stageWorld(page)
note(`lines on Approvals: ${n}`)
const cdp = await page.context().newCDPSession(page)
const { windowId } = await cdp.send('Browser.getWindowForTarget')
const setWin = async (width, height) => {
  await cdp.send('Browser.setWindowBounds', { windowId, bounds: { windowState: 'normal' } })
  await cdp.send('Browser.setWindowBounds', { windowId, bounds: { width, height } })
  await sleep(700)
}
const scrollerMid = async () => page.evaluate(sel => { const r = document.querySelector(`${sel} .appr-scroll`).getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 } }, PAGE)
const readY = () => page.evaluate(sel => ({ win: scrollY, list: document.querySelector(`${sel} .appr-scroll`)?.scrollTop ?? null }), PAGE)

/* one height: measure, then the wheel down to the list's foot, then at once back up */
async function atHeight(w, h, label) {
  await setWin(w, h)
  await page.evaluate(sel => { document.querySelector(`${sel} .appr-scroll`).scrollTop = 0 }, PAGE)
  await sleep(150)
  const g = await geo(page)
  const frac = g.trueH != null && Math.abs(g.trueH - Math.round(g.trueH)) > 0.01
  note(`${label}: window ${w}×${h} → page ${g.innerW}×${g.inner}, the screen's true height ${g.trueH}${frac ? ' (a FRACTION)' : ''}, dpr ${g.dpr}`)
  note(`  window room to scroll ${g.winRoom}; page h ${g.page?.h} (style ${g.pageStyleH}); card bottom ${g.card?.bottom}; scroller ${g.scroller?.top}–${g.scroller?.bottom} (room ${g.sc?.room}); body "${g.bodyClass}"`)
  check(g.winRoom <= 0, `${label}: the window behind the page cannot scroll (room ${g.winRoom})`)
  check(g.card && Math.abs(g.card.bottom - (Math.floor(g.trueH + 0.01) - 8)) <= 1.01, `${label}: the card's foot 8px off the screen's foot (${g.card?.bottom} against ${Math.floor(g.trueH + 0.01) - 8})`)
  const m = await scrollerMid()
  await page.mouse.move(m.x, m.y)
  for (let i = 0; i < 12; i++) { await page.mouse.wheel(0, 400); await sleep(60) }
  await sleep(500)
  const atFoot = await readY()
  const g2 = await geo(page)
  check(atFoot.win === 0 && g2.sc && atFoot.list >= g2.sc.room - 1, `${label}: wheeled to the list's foot — list ${atFoot.list} of ${g2.sc?.room}, window ${atFoot.win}`)
  await page.mouse.wheel(0, -200); await sleep(250)
  const up = await readY()
  check(up.list < atFoot.list && up.win === 0, `${label}: wheeled up AT ONCE from the foot — the list ${atFoot.list} → ${up.list}, the window ${up.win}`)
  /* the wheel over the page's top (the title), where nothing scrolls: the window must not move */
  const t = await page.evaluate(sel => { const r = document.querySelector(`${sel} .appr-title`).getBoundingClientRect(); return { x: r.left + 20, y: r.top + r.height / 2 } }, PAGE)
  await page.mouse.move(t.x, t.y); await page.mouse.wheel(0, 600); await sleep(300)
  const overTitle = await readY()
  check(overTitle.win === 0, `${label}: a wheel over the title moves the window by nothing (${overTitle.win})`)
  return g
}

/* neighbouring window heights: the inner height steps by 0.8 at 125%, so every few is a fraction */
const results = []
for (const h of [905, 906, 907, 908, 909, 910, 911]) results.push(await atHeight(1550, h, `h${h}`))
await setWin(1550, 910); await page.evaluate(sel => { document.querySelector(`${sel} .appr-scroll`).scrollTop = 0 }, PAGE); await sleep(300)
await pic(page, 'fit-1536-top')
await page.evaluate(sel => { document.querySelector(`${sel} .appr-scroll`).scrollTop = 260 }, PAGE); await sleep(300)
await pic(page, 'fit-1536-scrolled')
for (const h of [1072, 1073, 1074, 1075]) results.push(await atHeight(1550, h, `h${h}`))
/* a short window (a laptop on a low screen) and a tall wide one */
results.push(await atHeight(1550, 680, 'short-680'))
await pic(page, 'fit-short-680')
results.push(await atHeight(1550, 560, 'short-560'))
await pic(page, 'fit-short-560')
results.push(await atHeight(3200, 1500, 'wide-2560'))
await pic(page, 'fit-wide-2560')

/* across the phone width and back, live: narrower than 700 the page is the phone's (no fit, the window scrolls); back wide,
   fitted again and the list where it was */
await setWin(1550, 1000)
await page.evaluate(sel => { document.querySelector(`${sel} .appr-scroll`).scrollTop = 200 }, PAGE); await sleep(300)
const before = await geo(page)
await setWin(640, 1000)
const narrow = await geo(page)
note(`narrowed: page ${narrow.innerW} wide — scroller ${narrow.scroller ? 'still there' : 'gone'}, page style height "${narrow.pageStyleH}", window room ${narrow.winRoom}, body "${narrow.bodyClass}"`)
check(narrow.innerW <= 700 && !narrow.scroller && narrow.pageStyleH === '' && !/lw-appr-on/.test(narrow.bodyClass), `narrowed to ${narrow.innerW}: the phone's page, no inner scroller, no fitted height, the body's pad back`)
await pic(page, 'fit-narrow-phone-layout')
await setWin(1550, 1000)
const wide = await geo(page)
note(`widened again: scroller at ${wide.sc?.top} (was ${before.sc?.top}), window room ${wide.winRoom}`)
check(!!wide.scroller && wide.winRoom <= 0, 'widened again: fitted, the window cannot scroll')
check(wide.sc && wide.sc.top === before.sc.top, `widened again: the list at the place it had (${wide.sc?.top} against ${before.sc?.top})`)

note(`errors on the page: ${errs.length ? errs.join(' | ') : 'none'}`)
note(`${fails.length ? 'FAILED: ' + fails.length : 'ALL PASS'} (${log.filter(l => /PASS|FAIL/.test(l)).length} checks)`)
writeLog('fit-log.txt', log)
await Promise.race([browser.close(), sleep(8000)])
process.exit(fails.length ? 1 : 0)
