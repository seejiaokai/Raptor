// lwdl-walk-held3.mjs — walks a whole-day bid under a morning medical: what Approve does, what the buttons wear after Refuse. From the lw-decide-look walk of 28 Nov 26 ([LW-DECIDE-LOOK], his D2881); run from raptor-port/.
// a whole-day LL bid under a morning OML: what does Approve do, and what do the buttons wear after Refuse
import { run, signIn, press, place, cellState, readDecide, pic, T, sleep, closeBrowsers, gotoMonth } from './lwdl-lib.mjs'
await run('HELD3', ['desk', 'p402'], async S => {
  const page = S.page
  await signIn(S)
  const P = 'slipway', D = '2026-02-19'
  await place(page, P, [D], 'LL')
  await page.evaluate(() => window.fileInput({ person: 'slipway', date: 'Feb 19', yr: 2026, type: 'OML', remarks: '', allday: false, half: 'am', s: 0, e: 720 }))
  await sleep(page, 500); await gotoMonth(S, D)
  await page.evaluate(s => document.querySelector(s)?.scrollIntoView({ block: 'center', inline: 'center' }), T(`cell-${P}-${D}`))
  await press(S, T(`cell-${P}-${D}`)); await sleep(page, 900)
  const d0 = await readDecide(page, T('daylist'))
  S.note('waiting: ' + JSON.stringify(d0.map(b => [b.words, b.cls, b.disabled])))
  await pic(S, '1-waiting', [T('daylist')])
  const ap = d0.find(b => /approve/.test(b.tid))
  await press(S, T(ap.tid)); await sleep(page, 700)
  const msg = await page.locator(T('daylist-msg')).innerText().catch(() => '')
  S.note('after Approve: cell ' + await cellState(page, P, D) + ' message "' + msg + '"')
  await pic(S, '2-after-approve', [T('daylist')])
  const d1 = await readDecide(page, T('daylist'))
  S.note('buttons now: ' + JSON.stringify(d1.map(b => [b.words, b.cls, b.disabled, b.opacity])))
  const rf = d1.find(b => /refuse/.test(b.tid))
  if (rf) { await press(S, T(rf.tid)); await sleep(page, 700)
    const d2 = await readDecide(page, T('daylist'))
    S.note('after Refuse: cell ' + await cellState(page, P, D) + ' ' + JSON.stringify(d2.map(b => [b.words, b.cls, b.disabled, b.opacity, b.color])))
    await pic(S, '3-after-refuse', [T('daylist')]) }
})
await closeBrowsers()
