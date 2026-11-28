// draw-refresh - [MSQ-PICK-GUARD] the second questions page, drawing d7a (chat 175, 25 Nov 26): the refresh card of the
// approved drawings p6-d and p6-p (chat 166's draw-mid.mjs, its staging copied; its card, ../n166/draw-lib.mjs
// refreshCard, reused unchanged - the shade over the whole app and one card in the middle, built from the app's own
// question card) with the new words. State: his own move to 149 taking effect at midnight, an Input window open.
// STAND-INS, both chat 166's, named: (1) the move is written as a home row at the sign-in card before he signs in (no
// screen saves a move - scripts/handpass/msq/msq-rs-lib.mjs world); (2) the page's clock, installed at 23:58:30 on
// 15 Jul 2026, is run forward to 00:00:30. The phone is rs-lib's phone world (WebKit 402x874, its own 3x).
// The date in the body is READ from the page's own clock after it has run, in the bell's date form ("Tue 8 Dec").
//   node raptor-port/scripts/handpass/n175/draw-refresh.mjs <d|p>
// Pictures: drawn/d7a-<d|p>-refresh[-crop].png
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import { mkdirSync } from 'node:fs'
import { createRequire } from 'node:module'
const HERE = dirname(fileURLToPath(import.meta.url))
process.env.RS_OUT = process.env.RS_OUT || resolve(HERE, '../../../.tmp/n175/draw/rs')
mkdirSync(process.env.RS_OUT, { recursive: true })
const DRAWN = resolve(HERE, '../../../docs/mock/2026-11-25-msq-pick-guard-q2/drawn')
const PW = createRequire(resolve(HERE, '../../../package.json'))('playwright')
const launch0 = PW.chromium.launch.bind(PW.chromium)
PW.chromium.launch = async (...a) => { const b = await launch0(...a); const nc = b.newContext.bind(b); b.newContext = (o = {}) => nc(o.isMobile ? o : { deviceScaleFactor: 2, ...o }); return b }
const RS = await import('../msq/msq-rs-lib.mjs')
const { FACT, barSq, roleNow, bands, wait, go, closeAll } = await import('../n166/lib.mjs')
const { hit, vis, typeWords, inputWin, refreshCard, askTemplate } = await import('../n166/draw-lib.mjs')
const T = (process.argv[2] || 'd') === 'd' ? 'd' : 'p'
const k = `d7a.${T}`
await askTemplate()
let s
try {
  const w = await RS.world({ origin: 'http://localhost:4700', size: T, user: 'ad2', now: '2026-07-15T23:58:30', moves: [{ pid: 'prowler', from: 'u142', to: 'u149', day: '2026-07-16' }] })
  s = { page: w.page, ctx: w.ctx, desk: !w.phone, W: T === 'd' ? 1536 : 402, H: T === 'd' ? 864 : 874, w }
  await w.page.addStyleTag({ content: '*{transition:none !important;animation:none !important}' }).catch(() => {})
  await go(s, 'inputs'); await wait(s, 700)
  if (await vis(s, '#inListBtn[aria-pressed="false"]').count()) await hit(s, '#inListBtn')
  if (!(await vis(s, '#inBody tr[data-iid], #inList [data-iid]').count())) { await hit(s, '#inRangeBtn'); if (await s.page.locator('#inRangeAll').count()) await hit(s, s.page.locator('#inRangeAll').first()); if (await vis(s, '#inRangeAll').count()) await hit(s, '#inRangeBtn') }
  const row = vis(s, '#inBody tr[data-iid], #inList [data-iid]').first()
  FACT(`${k}.input`, (await row.innerText()).replace(/\s+/g, ' ').slice(0, 40))
  const o = row.locator('[data-testid="in-open"]'); await hit(s, (await o.count()) ? o.first() : row, 700)
  FACT(`${k}.typed`, await typeWords(s, '#inpEditRmk', 'N175 typed words'))
  FACT(`${k}.beforeMidnight`, { squadron: await barSq(s), role: (await roleNow(s)).badge || (await roleNow(s)).menuLine })
  await RS.clockTo(w, '2026-07-16T00:00:30'); await wait(s, 1500)
  FACT(`${k}.afterMidnight`, { squadron: await barSq(s), role: (await roleNow(s)).badge || (await roleNow(s)).menuLine, window: await inputWin(s), bands: await bands(s) })
  /* the date the clock really landed on, in the bell's form: weekday, day, month (Singapore's day, as the app keeps it) */
  const day = await s.page.evaluate(() => { const d = new Date(); const p = Object.fromEntries(new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Singapore', weekday: 'short', day: 'numeric', month: 'short' }).formatToParts(d).map(x => [x.type, x.value])); return { clock: d.toISOString(), bellForm: `${p.weekday} ${p.day} ${p.month}` } })
  FACT(`${k}.dateUsed`, day)
  const F = { title: 'You are 149\'s now', body: `Your move to 149 took effect on ${day.bellForm}. Refresh and sign in again to carry on. Anything you hadn't saved is lost.` }
  const c = await refreshCard(s, k, F)
  FACT(`${k}.words`, { title: c.title, body: c.body, buttons: c.buttons, box: c.box })
  await s.page.screenshot({ path: `${DRAWN}/d7a-${T}-refresh.png` })
  const pad = T === 'd' ? 60 : 30, b = c.box
  await s.page.screenshot({ path: `${DRAWN}/d7a-${T}-refresh-crop.png`, clip: { x: Math.max(0, b.x - pad), y: Math.max(0, b.y - pad), width: Math.min(s.W, b.x + b.w + pad) - Math.max(0, b.x - pad), height: Math.min(s.H, b.y + b.h + pad) - Math.max(0, b.y - pad) } })
  console.log(`  picture d7a-${T}-refresh.png + -crop`)
} catch (e) { FACT(`${k}.error`, String(e).split('\n')[0].slice(0, 240)); process.exitCode = 1 } finally { if (s) await s.w.browser.close().catch(() => {}) }
await closeAll()
