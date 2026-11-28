// draw-q19 - question 19 (chat 204): a Tracker window hidden behind the Flow chart tab.
// THE PHONE, AS THE BRIEF WROTE IT (402x874, at 2x): Saber (150 made first, so three squadrons are in the list): ☰ ->
// Tracker -> Info -> "+ Set lull period" -> a day tapped, not saved. Then the Flow chart tab and ☰ are pressed for. In
// the running app the pop-up's shade covers both (as n191's draw-s1-lull found, 26 Nov 26), so a finger cannot reach the
// state; the script records what covers each and pictures the Info tab with the pop-up up (q19-info-lull).
// THE ONE WAY PRESSES REACH IT: a desktop window narrowed. Saber on a desktop 1536 wide opens the same pop-up on the Info
// panel, a day tapped, then the window is made 1000 wide (under the Tracker's own 1050 phone-layout width): the Tracker
// shows its Flow chart tab and the Info panel - pop-up, shade and all - is hidden behind it. The picker is then pressed for
// 149 (its list opened and closed), the app's own guardSay raises the note. Pictures:
//   q19-info-lull        the phone: Info tab with the lull pop-up up (what "the open window" is)
//   q19-built            the narrowed desktop: Flow chart showing, the note as built ("…on the Tracker, then pick 149.")
//   q19-recommended      the same, the recommended words ("…on the Tracker’s Info tab, then pick 149.")
//   node raptor-port/scripts/handpass/n204/draw-q19.mjs        (ONLY=p,d)
import { run, closeAll, FACT, signIn, go, wait, vis, hit, covered, boxOf, barSq, windowsNow, listOpenedAndClosed, refuseAppWay, swapWords, noteFacts, tring, untring, sshot, make150 } from './q-lib.mjs'

const ONLY = (process.env.ONLY || '').split(',').filter(Boolean)
const want = k => !ONLY.length || ONLY.includes(k)
const BUILT = 'Blocked: close the open window on the Tracker, then pick 149.'
const REC = 'Blocked: close the open window on the Tracker’s Info tab, then pick 149.'
const tabs = s => s.page.evaluate(() => [...document.querySelectorAll('button[data-view]')].filter(b => b.getBoundingClientRect().width > 0).map(b => b.textContent.trim() + (b.classList.contains('active') ? ' (showing)' : '')))
const seen = (s, sel) => s.page.evaluate(sel => { const e = document.querySelector(sel); if (!e) return 'not in the page'; const b = e.getBoundingClientRect(); for (let p = e; p; p = p.parentElement) { const c = getComputedStyle(p); if (c.display === 'none' || c.visibility === 'hidden') return 'in the page, hidden' } return b.width > 2 && b.right > 0 && b.left < innerWidth ? 'seen' : 'in the page, out of sight' }, sel)
const coverOf = (s, l) => l.evaluate(b => { const r = b.getBoundingClientRect(); const h = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return h === b || b.contains(h) ? 'free' : 'covered by ' + h?.tagName.toLowerCase() + (h?.id ? '#' + h.id : '') + '.' + String(h?.className || '').split(/\s+/)[0] })
const openNow = s => s.page.evaluate(() => { const w = window.__n204.open([]); return w && { reason: w.reason, id: w.row.id } })

async function lullUp(s, k) {
  await go(s, 'tracker'); await s.page.waitForSelector('#flowSvg .ball', { timeout: 30000 }); await wait(s, 800)
  FACT(`${k}.start`, { squadron: await barSq(s), tabs: await tabs(s) })
  const info = vis(s, 'button[data-view]').filter({ hasText: /Info/ })
  if (await info.count()) await hit(s, info.first(), 700)
  await hit(s, '#setLullBtn', 700)
  const d = await s.page.evaluate(() => { const b = [...document.querySelectorAll('#lullCal .day:not(.out)')].find(e => e.getBoundingClientRect().width > 0 && !e.disabled); if (b) { b.setAttribute('data-q19d', '1'); return { iso: b.dataset.iso || null, text: b.textContent } } return null })
  if (!d) throw new Error('no day on the lull calendar')
  await hit(s, '[data-q19d]', 600)
  FACT(`${k}.lull`, { day: d, cal: await seen(s, '#lullCal'), step: await s.page.evaluate(() => document.querySelector('#lullStep')?.textContent.trim() ?? null), tabs: await tabs(s), openNow: await openNow(s) })
}

if (want('p')) await run('q19.p', 'p', async s => {
  const k = 'q19.p'
  await signIn(s, 'ad', 'a')
  await make150(s, k)
  await lullUp(s, k)
  const flow = vis(s, 'button[data-view]').filter({ hasText: /Flow chart/ }).first()
  FACT(`${k}.pressFor`, { flowChartTab: await coverOf(s, flow), burger: await covered(s, '#burger'), bell: await covered(s, '#notifyBell') })
  const back = await s.page.evaluate(() => { const c = document.querySelector('#lullCal'); const e = c?.closest('[class*="lull"]:not(#lullCal)') || c; const b = e?.getBoundingClientRect(); return b ? { x: b.left, y: b.top, w: b.width, h: b.height } : null })
  /* no ring: the pop-up is not new; the picture shows its shade over the tabs and ☰ */
  await sshot(s, 'q19-phone-lull', [back, await boxOf(s, 'button[data-view].active'), await boxOf(s, '#burger')], 10)
  /* a finger on the Flow chart tab lands on the shade: what happens */
  const fb = await boxOf(s, 'button[data-view]:not(.active)')
  if (fb) { await s.page.touchscreen.tap(fb.x + fb.w / 2, fb.y + fb.h / 2); await wait(s, 600) }
  FACT(`${k}.afterTapOnFlowChart`, { tabs: await tabs(s), cal: await seen(s, '#lullCal'), openNow: await openNow(s), windows: (await windowsNow(s)).map(w => w.testid || w.what) })
})

if (want('d')) await run('q19.d', 'd', async s => {
  const k = 'q19.d'
  await signIn(s, 'ad', 'a')
  await make150(s, k)
  await lullUp(s, k)
  FACT(`${k}.at1536`, { picker: await covered(s, '#sqnMenuBtn'), tabs: await tabs(s) })
  /* the small picture: what "the open window" is - the pop-up on the Info panel, before the window is narrowed */
  const back = await s.page.evaluate(() => { const c = document.querySelector('#lullCal'); const e = c?.closest('[class*="lull"]:not(#lullCal)') || c; const b = e?.getBoundingClientRect(); return b ? { x: b.left, y: b.top, w: b.width, h: b.height } : null })
  await sshot(s, 'q19-info-lull', [back], 14)
  await s.page.setViewportSize({ width: 1000, height: 864 }); s.W = 1000
  await wait(s, 900)
  FACT(`${k}.at1000`, { tabs: await tabs(s), cal: await seen(s, '#lullCal'), shade: await seen(s, '.lullback'), picker: await covered(s, '#sqnMenuBtn'), openNow: await openNow(s), windows: (await windowsNow(s)).map(w => w.testid || w.what) })
  await listOpenedAndClosed(s, k)
  const r = await refuseAppWay(s, k, 'u149')
  const m = await noteFacts(s, `${k}.built`, BUILT, { picker: '#sqnMenuBtn', tabs: 'button[data-view].active' })
  FACT(`${k}.state`, { squadron: await barSq(s), tabs: await tabs(s), refusal: r.refusal })
  const ftab = await boxOf(s, 'button[data-view].active'), pick = await boxOf(s, '#sqnMenuBtn'), itab = await boxOf(s, 'button[data-view]:not(.active)')
  let ring = await tring(s, m.box, 'the note')
  await sshot(s, 'q19-built', [ring, ftab, pick, itab], 14)
  await untring(s)
  await swapWords(s, k, REC)
  const m2 = await noteFacts(s, `${k}.rec`, REC, { picker: '#sqnMenuBtn', tabs: 'button[data-view].active' })
  ring = await tring(s, m2.box, 'the note')
  await sshot(s, 'q19-recommended', [ring, ftab, pick, itab], 14)
})
await closeAll()
