// RX1-6 — Personal input on a SATURDAY: no OIL question; OIL Earn greys it; publish; the tracker credits nothing
import { launch, openWorld, fileX, shotX, rowIdx, inputOf, errs, openBoard, centre, boardRowEl, boardRowNames, log, drag2, rosterPuckOf, toastMark, toastsSince, toastNow, waitQuiet, oilOn, oilPeople, oilBannerText, signAndPublish, lwOpen, lwTracker, lwCloseSheet, lwCellsOf, winState, closeWin } from './or-RX1-lib.mjs'
const BASELINE = process.argv[2] === 'baseline'
const browser = await launch()
const { page: p } = await openWorld(browser, { fresh: false })
const DI = 5
let iid = null
if (!BASELINE) {
  const f = await fileX(p, { type: 'Personal', person: 'Ranger', from: '2026-07-18', to: '2026-07-18', timed: ['09:00', '12:00'] })
  iid = f.made[0].iid
  log('filed', f.made, 'oil questions at save', f.oilSeen, 'toasts', f.toasts, 'window still open', f.stillOpen)
  const ri = await rowIdx(p, DI, iid)
  await openBoard(p, DI)
  let row = boardRowEl(p, DI, ri); await centre(row); await p.waitForTimeout(300); await waitQuiet(p)
  let m = await toastMark(p)
  await drag2(p, await rosterPuckOf(p, '#sbRoster', 'ALL AVAIL'), row.locator('.addz').first())
  log('drop toasts', await toastsSince(p, m), '| oilq standing', await p.locator('[data-testid="oilconf"]').count())
  log('people', await inputOf(p, iid), 'board row', (await boardRowNames(p, DI, ri)).names)
  await shotX(p, 'rx1-6-1-board-after-drop')
  /* OIL Earn on */
  await oilOn(p, true)
  await p.waitForTimeout(500)
  log('day line (issues box) text', await p.evaluate(() => { const e = [...document.querySelectorAll('#schedBoard *')].find(e => e.offsetParent && /nobody earns/i.test(e.textContent) && e.children.length === 0); return e ? e.textContent : null }))
  const rowSel = `#schedBoard [data-oilsent="i:${iid}"]:visible`
  row = p.locator(rowSel).first().locator('xpath=ancestor::*[contains(@class,"sb-arow")][1]')
  await row.evaluate(e => e.scrollIntoView({ block: 'center' })); await p.waitForTimeout(300)
  const state = await row.evaluate(r => [...r.querySelectorAll('.puck')].map(e => ({ puck: e.getAttribute('data-person'), cls: String(e.className), puckTitle: e.getAttribute('title'), wrapperCls: String(e.parentElement.className), wrapperTitle: e.parentElement.getAttribute('title') })))
  log('pucks on the row in OIL Earn', state)
  log('counter title', await row.locator('.oilcount').first().getAttribute('title'), '| text', await row.locator('.oilcount').first().innerText())
  await shotX(p, 'rx1-6-2-board-oilearn')
  /* hover + tap Ranger */
  const rp = row.locator('.puck', { hasText: 'Ranger' }).first()
  await rp.hover(); await p.waitForTimeout(900)
  await shotX(p, 'rx1-6-3-hover-ranger')
  const before = JSON.stringify(await inputOf(p, iid))
  const tm = await toastMark(p)
  await rp.click(); await p.waitForTimeout(600)
  log('tap on Ranger: INPUTS unchanged', before === JSON.stringify(await inputOf(p, iid)), '| new notes', await toastsSince(p, tm), '| oilPeople', await oilPeople(p, iid))
  await shotX(p, 'rx1-6-4-after-tap-ranger')
  /* the ALL AVAIL window */
  await row.locator('.oilcount').first().click(); await p.waitForTimeout(800)
  const w = await winState(p)
  log('window', w && { tabs: w.tabs, on: w.on, off: w.off, inert: w.inert, total: w.total, tail: w.text })
  await shotX(p, 'rx1-6-5-allavail-window')
  const win = p.locator('.availwin .seat.oilpk').first()
  if (await win.count()) {
    const nm = await win.evaluate(e => (window.PEOPLE[e.dataset.oilp] || {}).cs)
    await win.hover(); await p.waitForTimeout(800)
    log('a man in the window', nm, '| seat title', await win.getAttribute('title'), '| seat class', await win.getAttribute('class'), '| puck title', await win.locator('.puck').first().getAttribute('title'))
    await shotX(p, 'rx1-6-6-hover-man-in-window')
    const b4 = JSON.stringify((await winState(p)).seats)
    const cb = await row.locator('.oilcount').first().innerText()
    await win.click(); await p.waitForTimeout(600)
    log('tap on that man: window changed?', b4 !== JSON.stringify((await winState(p)).seats), '| counter before/after', cb, await row.locator('.oilcount').first().innerText())
    await shotX(p, 'rx1-6-7-after-tap-man')
  }
  await closeWin(p); await oilOn(p, false)
}
log('errs so far', errs)
/* sign and publish Saturday */
const pub = await signAndPublish(p, DI); log('publish', pub)
await p.evaluate(() => window.go('editsched')); await p.waitForTimeout(600)
await lwOpen(p, 'jul')
log('cells 18 Jul', await lwCellsOf(p, ['bane', 'nick', 'rocky', 'prowler'], ['2026-07-18']))
await shotX(p, BASELINE ? 'rx1-6c-leavewar-baseline' : 'rx1-6-8-leavewar')
const tr = await lwTracker(p)
log('tracker open', tr.open, '| entries total', (tr.entries || []).length, '| entries mentioning 18 Jul', (tr.entries || []).filter(e => /18 Jul/.test(e)))
const seg = n => { const i = (tr.text || '').indexOf(n); return i >= 0 ? tr.text.slice(i, i + 110) : 'NO ' + n }
log('Ranger row', seg('Ranger'), '| Hunter row', seg('Hunter'), '| Reaper', seg('Reaper'), '| Anvil', seg('Anvil'), '| Fable', seg('Fable'))
log('18 Jul in tracker text', (tr.text.match(/18 Jul[^+]{0,60}/g) || []))
await shotX(p, BASELINE ? 'rx1-6c-tracker-baseline' : 'rx1-6-9-tracker')
await lwCloseSheet(p)
await openBoard(p, DI); await oilOn(p, true); await p.waitForTimeout(700)
log('AFTER PUBLISH, board in OIL Earn: issues/day lines', await p.evaluate(() => [...document.querySelectorAll('#schedBoard *')].filter(e => e.offsetParent && /OIL/.test(e.textContent) && e.children.length === 0 && e.textContent.length > 25).map(e => e.textContent.trim()).slice(0, 12)))
log('windows seats (inert count by class)', await p.evaluate(() => 0))
await shotX(p, BASELINE ? 'rx1-6c-board-oilearn-baseline' : 'rx1-6-10-board-oilearn-published')
log('errs', errs)
await browser.close()
