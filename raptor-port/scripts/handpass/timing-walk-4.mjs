/* The ?timing readout's walk, part 4 (chat 165, 24 Nov 26) — the re-walk of what the code reads' fixes touched:
   W27 a long Timing window on a phone and the failed-save band (Astra's read, 5); W28 the Tracker opened while the Leave
   War's background download still arrives (Astra's read, 3); W29 Escape with the keys in the Timing window over a Leave
   War person window and over the Tracker's Show All (Astra's 1 and 6); W30 Escape with a seat picked on Edit Schedule
   (the fresh Opus read's F4); W31 folded by its ✕ from the keys, the keys on the corner button (Astra's 4).
   node scripts/handpass/timing-walk-4.mjs   (from raptor-port/, on a build already made). ONLY=W27 runs one. */
import { serve, browserOf, fresh, DESK, PHONE, signIn, outsideTime, openBy, readout, pageRows, openWindow, topAt, pic, shotDir, judge, notWalked, saveResults, sleep } from './timing-walk-lib.mjs'

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
const box = (page, sel) => page.evaluate(s => { const e = document.querySelector(s); if (!e) return null; const r = e.getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width, h: r.height, b: r.bottom } }, sel)

/* W27 — a phone: the failed-save band up, 30 pages opened, the Timing window opened from its corner button */
await scen('W27', PHONE, {}, async ({ page, dir }) => {
  await page.goto(B + '/?savefail&timing'); await signIn(page); await outsideTime(page, 'viewsched')
  await openBy(page, 'editsched', 'drawer'); await outsideTime(page, 'editsched')
  const band = await page.waitForSelector('.topbar > .savestat.failed, .saveband', { timeout: 15000 }).then(() => true, () => false)
  for (let i = 0; i < 16; i++) for (const p of ['inputs', 'quals']) { await openBy(page, p, 'drawer'); await outsideTime(page, p) }
  await sleep(800)
  await openWindow(page); await sleep(500)
  const r = await readout(page)
  const bandBox = await box(page, '.topbar > .savestat.failed, .saveband')
  const retry = await page.$('.saveband button, .savestat.failed button')
  let hit = null
  if (retry) { const b = await retry.boundingBox(); hit = await topAt(page, b.x + b.width / 2, b.y + b.height / 2) }
  const top = await box(page, '.topbar')
  await pic(page, dir, 'phone-30-rows-band')
  judge('W27', band && r.open && pageRows(r).length >= 30 && r.win.y >= Math.round((top ? top.b : 0)) && (!retry || !/timing/.test(hit || '')),
    `band up ${band}; ${pageRows(r).length} page rows; the window's top ${r.win.y}px, the top bar's foot ${top ? Math.round(top.b) : '?'}px, the band ${bandBox ? Math.round(bandBox.y) + '–' + Math.round(bandBox.b) : 'none'}px; at the band's Retry: ${hit}`)
})

/* W28 — the Tracker opened while the Leave War's background download is held 6 s, then let through */
await scen('W28', DESK, {}, async ({ page, dir }) => {
  let release
  const held = new Promise(r => { release = r })
  await page.route(/LeaveWarPage-[^/]*\.js/, async r => { await held; await r.continue() })
  const h0 = srv.hits.length
  await page.goto(B + '/?timing'); await signIn(page); await outsideTime(page, 'viewsched')
  await sleep(2500)                                   // the background fetch of the Leave War starts after 2 s idle
  await openBy(page, 'tracker')
  setTimeout(() => release(), 600)
  await outsideTime(page, 'tracker'); await sleep(1500)
  const r = pageRows(await readout(page))
  const tr = r.find(x => x.label === 'Tracker')
  const sentTr = srv.hits.slice(h0).filter(h => /TrackerPage[^/]*\.(js|css)$/.test(h.p) && h.st === 200).reduce((a, h) => a + h.n, 0)
  const sentLw = srv.hits.slice(h0).filter(h => /LeaveWarPage[^/]*\.(js|css)$/.test(h.p) && h.st === 200).reduce((a, h) => a + h.n, 0)
  const dl = /downloaded (\d+) KB/.exec(tr ? tr.tag : '')
  await pic(page, dir, 'tracker-row')
  judge('W28', !!dl && Math.abs(Number(dl[1]) * 1024 - sentTr) <= Math.max(3072, sentTr * 0.1), `the Tracker's row "${tr ? tr.tag + ': ' + tr.value : 'none'}"; the server sent the Tracker's own files ${Math.round(sentTr / 1024)} KB and the Leave War's ${Math.round(sentLw / 1024)} KB meanwhile`)
})

/* W29 — the keys in the Timing window, over a Leave War person window and over the Tracker's Show All: Escape folds
   the Timing window only */
await scen('W29', DESK, {}, async ({ page, dir }) => {
  await page.goto(B + '/?timing'); await signIn(page); await outsideTime(page, 'viewsched')
  await page.click('#timingRoot .timingwin .win-x')
  await openBy(page, 'leavewar'); await outsideTime(page, 'leavewar'); await sleep(800)
  const who = page.locator('[data-testid^="person-"]:visible').first()
  if (await who.count()) {
    await who.click(); await sleep(800)
    const pw = async () => page.locator('[data-testid="person-window"]').isVisible().catch(() => false)
    const up = await pw()
    await page.click('#timingRoot .timing-pill'); await sleep(400)
    const keysIn = await page.evaluate(() => !!document.activeElement?.closest('.timingwin'))
    await pic(page, dir, 'person-window-and-timing')
    await page.keyboard.press('Escape'); await sleep(500)
    judge('W29-leavewar', up && keysIn && !(await tOpen(page)) && await pw(), `the person window up ${up}; the Timing window opened from its button, the keys in it ${keysIn}; Escape: the Timing window open ${await tOpen(page)}, the person window still up ${await pw()}`)
    await page.keyboard.press('Escape'); await sleep(500)
    judge('W29-leavewar-next', !(await pw()), `the next Escape (the keys back on the page): the person window up ${await pw()}`)
  } else notWalked('W29-leavewar', 'no person on the Leave War grid to open')
  if (await tOpen(page)) await page.click('#timingRoot .timingwin .win-x')
  await openBy(page, 'tracker'); await outsideTime(page, 'tracker'); await sleep(800)
  if (await page.locator('#showAllBtn:visible').count()) {
    await page.click('#showAllBtn'); await sleep(800)
    const panel = () => page.evaluate(() => { const b = document.getElementById('showAllBtn'); return !!(b && (b.getAttribute('aria-pressed') === 'true' || b.classList.contains('on') || b.classList.contains('active'))) || !!document.querySelector('.showall:not([hidden]), #showAllPanel:not([hidden]), [data-showall="1"]') })
    const shot1 = await panel()
    await page.click('#timingRoot .timing-pill'); await sleep(400)
    await pic(page, dir, 'showall-and-timing')
    await page.keyboard.press('Escape'); await sleep(500)
    judge('W29-tracker', !(await tOpen(page)) && (await panel()) === shot1, `Show All up ${shot1}; with the keys in the Timing window, Escape: the Timing window open ${await tOpen(page)}, Show All as it was ${(await panel()) === shot1}`)
  } else notWalked('W29-tracker', 'no Show All button in sight')
})

/* W30 — a seat picked on Edit Schedule's week, the Timing window up: one Escape puts the seat down only */
await scen('W30', DESK, {}, async ({ page, dir }) => {
  await page.goto(B + '/?timing'); await signIn(page); await outsideTime(page, 'viewsched')
  await openBy(page, 'editsched'); await outsideTime(page, 'editsched'); await sleep(500)
  const seat = page.locator('#eWeek [data-slot]:visible, #eWeek [data-fill]:visible').first()
  if (await seat.count()) {
    await seat.click(); await sleep(400)
    const armed = await page.evaluate(() => !!window.ARM)
    await page.mouse.click(5, 300); await page.evaluate(() => document.activeElement?.blur?.())
    if (!(await page.evaluate(() => !!window.ARM)) && armed) { await seat.click(); await sleep(300) }
    const armed2 = await page.evaluate(() => !!window.ARM)
    await page.keyboard.press('Escape'); await sleep(400)
    judge('W30', armed2 && !(await page.evaluate(() => !!window.ARM)) && await tOpen(page), `a seat picked ${armed2}; one Escape: the seat put down ${!(await page.evaluate(() => !!window.ARM))}, the Timing window still open ${await tOpen(page)}`)
    await pic(page, dir, 'after-escape')
  } else notWalked('W30', 'no seat on the week to pick')
})

/* W31 — the keyboard alone: Tab to the corner button, Enter opens the window, Escape folds it, the keys on the button */
await scen('W31', PHONE, {}, async ({ page, dir }) => {
  await page.goto(B + '/?timing'); await signIn(page); await outsideTime(page, 'viewsched')
  await page.focus('#timingRoot .timing-pill'); await page.keyboard.press('Enter'); await sleep(400)
  const inWin = await page.evaluate(() => !!document.activeElement?.closest('.timingwin'))
  await page.keyboard.press('Escape'); await sleep(400)
  const onPill = await page.evaluate(() => !!document.activeElement?.classList.contains('timing-pill'))
  await page.keyboard.press('Enter'); await sleep(400)
  const again = await tOpen(page)
  await page.locator('#timingRoot .timingwin .win-x').press('Enter'); await sleep(400)
  const onPill2 = await page.evaluate(() => !!document.activeElement?.classList.contains('timing-pill'))
  await pic(page, dir, 'folded-keys-on-button')
  judge('W31', inWin && onPill && again && onPill2, `Enter on the button: the keys in the window ${inWin}; Escape folds it, the keys on the button ${onPill}; Enter opens it again ${again}; its ✕ by Enter, the keys on the button ${onPill2}`)
})

saveResults('walk-part4' + (ONLY ? '-' + ONLY.join('_') : ''))
await cr.close(); await srv.close()
