// draw-mid - [MSQ-PICK-GUARD] step 2, picture 6 (desktop and phone): his own move to 149 taking effect at midnight with an
// Input window open (step 1's mid-e1 way, copied).
// Hunter (sign-in ad2, admin of 142) moves 142 -> 149 from 16 Jul 2026. Before midnight he opens an input on Inputs and
// types in its Remarks; the page's clock is run past midnight.
//  TODAY: what the screen shows then (the window held, greyed, "This change could not be saved.").
//  AFTER: the same screen with the shade and the F1 card over it.
// STAND-INS, both named (as step 1): (1) the move is written as a home row at the sign-in card before he signs in - no
// screen saves a move (scripts/handpass/msq/msq-rs-lib.mjs world); (2) the page's clock, installed at 23:58:30 on 15 Jul
// 2026, is run forward to 00:00:30 - the app's own midnight wake fires on the way. The phone is rs-lib's phone world:
// WebKit at 402x874, 3x (rs-lib's own density; not changed here). On the phone the words are set through the box's own
// input event, not typed (typing zooms an emulated phone).
//   node raptor-port/scripts/handpass/n166/draw-mid.mjs <d|p>
// Pictures: drawn/p6-<d|p>-<today|after>[-crop].png
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
const HERE = dirname(fileURLToPath(import.meta.url))
process.env.RS_OUT = process.env.RS_OUT || resolve(HERE, '../../../.tmp/n166-draw/rs')
/* rs-lib's desktop world opens at 1x; the drawings are at 2x (the brief): its browser's new contexts get deviceScaleFactor 2
   on the desktop, nothing else changed (the same playwright module rs-lib loads, wrapped here, rs-lib itself untouched) */
import { createRequire } from 'node:module'
const PW = createRequire(resolve(HERE, '../../../package.json'))('playwright')
const launch0 = PW.chromium.launch.bind(PW.chromium)
PW.chromium.launch = async (...a) => { const b = await launch0(...a); const nc = b.newContext.bind(b); b.newContext = (o = {}) => nc(o.isMobile ? o : { deviceScaleFactor: 2, ...o }); return b }
const RS = await import('../msq/msq-rs-lib.mjs')
const { FACT, barSq, roleNow, bands, wait, go } = await import('./lib.mjs')
const { hit, vis, typeWords, inputWin, shot, refreshCard, askTemplate } = await import('./draw-lib.mjs')
const T = (process.argv[2] || 'd') === 'd' ? 'd' : 'p'
const F1 = { title: 'You are 149\'s from today', body: 'Your move to 149 took effect at midnight. Refresh and sign in again to carry on. Anything you hadn\'t saved is lost.' }

async function stage(k) {
  const w = await RS.world({ origin: 'http://localhost:4700', size: T, user: 'ad2', now: '2026-07-15T23:58:30', moves: [{ pid: 'prowler', from: 'u142', to: 'u149', day: '2026-07-16' }] })
  const s = { page: w.page, ctx: w.ctx, desk: !w.phone, W: T === 'd' ? 1536 : 402, H: T === 'd' ? 864 : 874, w }
  await w.page.addStyleTag({ content: '*{transition:none !important;animation:none !important}' }).catch(() => {})
  await go(s, 'inputs'); await wait(s, 700)
  if (await vis(s, '#inListBtn[aria-pressed="false"]').count()) await hit(s, '#inListBtn')
  if (!(await vis(s, '#inBody tr[data-iid], #inList [data-iid]').count())) { await hit(s, '#inRangeBtn'); if (await s.page.locator('#inRangeAll').count()) await hit(s, s.page.locator('#inRangeAll').first()); if (await vis(s, '#inRangeAll').count()) await hit(s, '#inRangeBtn') }
  const row = vis(s, '#inBody tr[data-iid], #inList [data-iid]').first()
  FACT(`${k}.input`, (await row.innerText()).replace(/\s+/g, ' ').slice(0, 40))
  const o = row.locator('[data-testid="in-open"]'); await hit(s, (await o.count()) ? o.first() : row, 700)
  FACT(`${k}.typed`, await typeWords(s, '#inpEditRmk', 'N166E1 words'))
  FACT(`${k}.beforeMidnight`, { squadron: await barSq(s), role: (await roleNow(s)).badge || (await roleNow(s)).menuLine, window: await inputWin(s) })
  await RS.clockTo(w, '2026-07-16T00:00:30'); await wait(s, 1500)
  FACT(`${k}.afterMidnight`, { squadron: await barSq(s), role: (await roleNow(s)).badge || (await roleNow(s)).menuLine, window: await inputWin(s), bands: await bands(s) })
  return s
}
await askTemplate()   // captured before any clock is moved (its own desktop browser)
for (const which of ['today', 'after']) {
  const k = `p6.${T}.${which}`
  let s
  try {
    s = await stage(k)
    if (which === 'today') { await shot(s, `p6-${T}-today`); await shot(s, `p6-${T}-today-crop`, ['.inpedwin'], 14) }
    else { await refreshCard(s, k, F1); await shot(s, `p6-${T}-after`); await shot(s, `p6-${T}-after-crop`, ['#n166card'], T === 'd' ? 60 : 30) }
  } catch (e) { FACT(`${k}.error`, String(e).split('\n')[0].slice(0, 200)); process.exitCode = 1 } finally { if (s) await s.w.browser.close().catch(() => {}) }
}
const { closeAll } = await import('./lib.mjs'); await closeAll()
