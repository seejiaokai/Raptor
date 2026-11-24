/* The ?timing readout's walk, part 5 (chat 167, 24 Nov 26) — the two roll-call rows no earlier part walked:
   W33 a box over the page (Admin → Day templates, the app's boxes at z 470) with the Timing window open — the box over
   the window, its own ✕ pressable, the window usable again once it closes; W34 the "Not kept" band (a browser that
   refuses its storage — the agent's `?nostore` switch, D1901) with the Timing window open — the band never covered.
   Desktop and phone each. node scripts/handpass/timing-walk-5.mjs   (from raptor-port/, on a build already made). */
import { serve, browserOf, fresh, DESK, PHONE, signIn, outsideTime, openBy, readout, openWindow, topAt, pic, shotDir, judge, notWalked, saveResults, sleep } from './timing-walk-lib.mjs'

const ONLY = process.env.ONLY ? process.env.ONLY.split(',') : null
const on = id => !ONLY || ONLY.includes(id)
const srv = await serve()
const cr = await browserOf('chromium')
const B = srv.base
async function scen(id, size, opts, fn) {
  if (!on(id)) return
  const s = await fresh(cr, size, opts)
  const dir = shotDir(id)
  try { await fn({ ...s, dir }) } catch (e) { judge(id + '-ran', false, 'the step stopped: ' + String(e).slice(0, 300)) }
  if (s.errors.length) console.log(`  ${id} page errors: ${s.errors.join(' | ')}`)
  await s.ctx.close()
}
const tOpen = async page => (await readout(page)).open
const mid = (page, sel) => page.evaluate(s => { const e = document.querySelector(s); if (!e) return null; const r = e.getBoundingClientRect(); return r.width ? [r.left + r.width / 2, r.top + r.height / 2] : null }, sel)

for (const [id, size] of [['W33-desk', DESK], ['W33-phone', PHONE]]) {
  await scen(id, size, {}, async ({ page, dir }) => {
    const phone = size === PHONE
    await page.goto(B + '/?timing'); await signIn(page); await outsideTime(page, 'viewsched')
    await openBy(page, 'admin', phone ? 'drawer' : 'top'); await outsideTime(page, 'admin'); await sleep(500)
    if (!(await tOpen(page))) await openWindow(page)
    /* on a phone the open Timing window is a panel over the page's foot — folded first, as a person would, to reach the
       page's list; the box is then judged over its corner button */
    if (phone) { await page.click('#timingRoot .timingwin .win-x'); await sleep(300) }
    /* the Day templates button lives in Admin's "Squadron config" section, chosen first */
    await page.locator('.adm-cat', { hasText: 'Squadron config' }).click(); await sleep(400)
    await page.click('#admDayTpl'); await sleep(600)
    const up = await page.locator('#daytplModal:not([hidden])').isVisible().catch(() => false)
    const tx = await mid(page, phone ? '#timingRoot .timing-pill' : '#timingRoot .timingwin .win-x')
    const atX = tx ? await topAt(page, tx[0], tx[1]) : null
    const cx = await mid(page, '#daytplClose')
    const atClose = cx ? await topAt(page, cx[0], cx[1]) : null
    await pic(page, dir, 'box-over-the-window')
    await page.click('#daytplClose'); await sleep(400)
    const gone = !(await page.locator('#daytplModal:not([hidden])').isVisible().catch(() => false))
    const tx2 = await mid(page, phone ? '#timingRoot .timing-pill' : '#timingRoot .timingwin .win-x')
    const atX2 = tx2 ? await topAt(page, tx2[0], tx2[1]) : null
    const what = phone ? 'corner button' : 'Timing window\'s ✕'
    judge(id, up && !/timing/.test(atX || '') && /daytplClose/.test(atClose || '') && gone && (phone ? /timing-pill/ : /timingwin.*win-x/).test(atX2 || ''),
      `the Day templates box up ${up}; at the ${what}: ${atX}; at the box's ✕: ${atClose}; closed by its ✕ ${gone}; the ${what} then: ${atX2}`)
    await pic(page, dir, 'box-closed')
  })
}

for (const [id, size] of [['W34-desk', DESK], ['W34-phone', PHONE]]) {
  await scen(id, size, {}, async ({ page, dir }) => {
    const phone = size === PHONE
    await page.goto(B + '/?nostore&timing'); await signIn(page); await outsideTime(page, 'viewsched'); await sleep(600)
    if (!(await tOpen(page))) await openWindow(page)
    const band = await page.evaluate(() => { const e = [...document.querySelectorAll('.savestat, .saveband')].find(x => /Not kept/.test(x.textContent || '') && x.getBoundingClientRect().width); if (!e) return null; const r = e.getBoundingClientRect(); return { x: r.left, y: r.top, w: r.width, h: r.height } })
    let covered = null
    if (band) {
      covered = []
      for (let x = band.x + 4; x < band.x + band.w; x += 12) for (const y of [band.y + 3, band.y + band.h / 2, band.y + band.h - 3]) { const t = await topAt(page, x, y); if (/timing/.test(t || '')) covered.push(`${Math.round(x)},${Math.round(y)}`) }
    }
    const win = (await readout(page)).win
    await pic(page, dir, 'not-kept-band-and-window')
    judge(id, !!band && covered.length === 0, `"Not kept" band ${band ? `at ${Math.round(band.x)},${Math.round(band.y)} ${Math.round(band.w)}×${Math.round(band.h)}` : 'not found'}; points of it under the Timing window: ${covered ? covered.length : '—'}${covered && covered.length ? ' (' + covered.slice(0, 4).join(' ') + ')' : ''}; the window ${win ? `${win.x},${win.y} ${win.w}×${win.h}` : 'folded'}${phone ? ' (phone)' : ''}`)
  })
}

/* W35 — one Escape, one thing, with the keys in the Timing window and one of the app's own layers open (the fix read of
   chat 167: the Leave War's exact-days calendar closes one level on Escape at the same spot the window listens) —
   (a) the calendar opened first, the window then opened from its corner button: Escape closes the calendar only, the
   next Escape folds the window; (b) the window open, the calendar opened after, a press on the window: Escape folds
   the window only, the calendar stays */
await scen('W35', DESK, {}, async ({ page, dir }) => {
  await page.goto(B + '/?timing'); await signIn(page); await outsideTime(page, 'viewsched')
  await openBy(page, 'leavewar'); await outsideTime(page, 'leavewar'); await sleep(700)
  const cal = () => page.locator('[data-testid="od-apply"]').isVisible().catch(() => false)
  const keysIn = () => page.evaluate(() => !!document.activeElement?.closest('#timingRoot'))
  /* (a) */
  if (await tOpen(page)) { await page.click('#timingRoot .timingwin .win-x'); await sleep(300) }
  await page.click('[data-testid="open-chip"]'); await sleep(500)
  await page.click('[data-testid="od-more"]'); await sleep(400)
  const calA = await cal()
  await page.click('#timingRoot .timing-pill'); await sleep(400)
  const kA = await keysIn()
  await pic(page, dir, 'a-calendar-and-window')
  await page.keyboard.press('Escape'); await sleep(400)
  const a1 = { calendar: await cal(), window: await tOpen(page) }
  await page.keyboard.press('Escape'); await sleep(400)
  const a2 = { calendar: await cal(), window: await tOpen(page) }
  judge('W35-a', calA && kA && !a1.calendar && a1.window === true && a2.window === false,
    `calendar up ${calA}, the window opened from its button with the keys in it ${kA}; first Escape: calendar ${a1.calendar ? 'still up' : 'closed'}, window ${a1.window ? 'open' : 'folded'}; second Escape: window ${a2.window ? 'open' : 'folded'}`)
  /* (b) */
  await pic(page, dir, 'a-after-two-escapes')
  const pb = (await readout(page)).pillBox
  const atPill = pb ? await topAt(page, pb.x + pb.w / 2, pb.y + pb.h / 2) : 'no button'
  const err = await page.click('#timingRoot .timing-pill', { timeout: 5000 }).then(() => '', e => String(e).split('\n').slice(0, 6).join(' / ').slice(0, 400))
  /* walked once (chat 167): a blocking Leave War sheet lifts itself over every movable window on the page (Sheet.tsx,
     `over`), the Timing window included, so with the window open the sheet's backdrop covers it and its button — (b)
     cannot be reached by a press here; it is carried by TimingReadout-layers.test.tsx */
  if (err) { notWalked('W35-b', `the sheet's backdrop over the corner button (at it: ${atPill}) — carried by TimingReadout-layers.test.tsx`); return }
  await sleep(400)
  await page.click('[data-testid="od-more"]'); await sleep(400)
  const calB = await cal()
  const body = await page.evaluate(() => { const w = document.querySelector('#timingRoot .timingwin .tm-body') || document.querySelector('#timingRoot .timingwin'); const r = w.getBoundingClientRect(); return [r.left + r.width / 2, r.top + Math.min(40, r.height / 2)] })
  await page.mouse.click(body[0], body[1]); await sleep(300)
  const kB = await keysIn()
  await pic(page, dir, 'b-window-pressed-calendar-up')
  await page.keyboard.press('Escape'); await sleep(400)
  const b1 = { calendar: await cal(), window: await tOpen(page) }
  judge('W35-b', calB && kB && b1.calendar && b1.window === false,
    `calendar up ${calB}, a press on the window put the keys in it ${kB}; Escape: window ${b1.window ? 'open' : 'folded'}, calendar ${b1.calendar ? 'still up' : 'closed'}`)
  await pic(page, dir, 'b-after-escape')
})

await cr.close(); await srv.close()
saveResults('part5')
