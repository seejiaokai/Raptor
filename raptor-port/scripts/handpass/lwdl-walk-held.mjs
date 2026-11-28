// lwdl-walk-held.mjs — walks Approve held by a medical: finding a bid whose Approve is held, pictured. From the lw-decide-look walk of 28 Nov 26 ([LW-DECIDE-LOOK], his D2881); run from raptor-port/.
// Approve held by a medical (Fable 12 · Astra 12): find a real way to a bid whose Approve is held, then picture it
import { run, signIn, press, place, cellState, readDecide, pic, T, sleep, closeBrowsers, gotoMonth, closeWin } from './lwdl-lib.mjs'
const anyWin = page => page.evaluate(() => ['bid-picker', 'daylist'].find(t => { const e = document.querySelector(`[data-testid="${t}"]`); return e && e.getBoundingClientRect().width > 0 }) || 'none')
await run('HELD2', ['desk', 'p402'], async S => {
  const page = S.page
  await signIn(S)
  const P = 'slipway'
  const tries = [
    ['2026-02-19', 'whole LL bid, then a morning OML', async D => { await place(page, P, [D], 'LL'); return page.evaluate(() => window.fileInput({ person: 'slipway', date: 'Feb 19', yr: 2026, type: 'OML', remarks: '', allday: false, half: 'am', s: 0, e: 720 })) }],
    ['2026-02-20', 'a morning OML, then a whole LL bid', async D => { await page.evaluate(() => window.fileInput({ person: 'slipway', date: 'Feb 20', yr: 2026, type: 'OML', remarks: '', allday: false, half: 'am', s: 0, e: 720 })); await sleep(page, 300); return page.evaluate(D => window.lwSetCell('slipway', D, 'LL'), D) }],
    ['2026-02-23', 'a whole OML, then a whole LL bid', async D => { await page.evaluate(() => window.fileInput({ person: 'slipway', date: 'Feb 23', yr: 2026, type: 'OML', remarks: '', allday: true })); await sleep(page, 300); return page.evaluate(D => window.lwSetCell('slipway', D, 'LL'), D) }],
  ]
  let found = null
  for (const [D, how, fn] of tries) {
    let r; try { r = await fn(D) } catch (e) { r = 'error ' + e.message.split('\n')[0] }
    await sleep(page, 500)
    await gotoMonth(S, D)
    await page.evaluate(s => document.querySelector(s)?.scrollIntoView({ block: 'center', inline: 'center' }), T(`cell-${P}-${D}`))
    await press(S, T(`cell-${P}-${D}`)); await sleep(page, 900)
    const w = await anyWin(page)
    const d = w === 'none' ? [] : await readDecide(page, T(w))
    const ap = d.find(b => /approve/.test(b.tid))
    const title = ap ? await page.evaluate(t => document.querySelector(`[data-testid="${t}"]`)?.title, ap.tid) : null
    S.note(`${how} (${D}): returned ${JSON.stringify(r)}; cell ${await cellState(page, P, D)}; window ${w}; Approve ${ap ? `disabled=${ap.disabled} op=${ap.opacity} title="${title}"` : 'none'}`)
    await pic(S, `try-${D.slice(8)}`, w === 'none' ? [] : [T(w)], { full: w === 'none' })
    if (ap && ap.disabled && !found) { found = { D, w, ap }; break }
    await closeWin(S)
  }
  if (!found) { S.note('NOT WALKED: no door reached a held Approve'); return }
  const { D, w } = found
  await pic(S, '1-held-waiting-row', [`${T(w)} .bp-acts, ${T(w)} .dl-acts`], { pad: 10 })
  await page.locator(T(found.ap.tid)).click({ force: true }).catch(() => {}); await sleep(page, 500)
  S.check((await cellState(page, P, D)).includes(':w'), 'pressing the held Approve does nothing', await cellState(page, P, D))
  const rf = (await readDecide(page, T(w))).find(b => /refuse/.test(b.tid))
  await press(S, T(rf.tid)); await sleep(page, 800)
  if ((await anyWin(page)) === 'none') { await press(S, T(`cell-${P}-${D}`)); await sleep(page, 900) }
  const w2 = await anyWin(page)
  const d2 = await readDecide(page, T(w2))
  S.data.heldRefused = d2.map(b => ({ t: b.words, cls: b.cls, dis: b.disabled, op: b.opacity, col: b.color, edge: b.edge }))
  S.note('after Refuse: cell ' + await cellState(page, P, D) + ' buttons ' + JSON.stringify(S.data.heldRefused))
  const ap2 = d2.find(b => /approve/.test(b.tid)), rf2 = d2.find(b => /refuse/.test(b.tid))
  S.check(ap2.disabled && /lit/.test(rf2.cls) && /dec-ring/.test(rf2.cls), 'refused: Refuse lit and ringed; the held Approve still not pressable', [ap2.cls, ap2.disabled, ap2.opacity, rf2.cls])
  await pic(S, '2-held-refused-row', [`${T(w2)} .bp-acts, ${T(w2)} .dl-acts`], { pad: 10 })
  await pic(S, '2-held-refused', [T(w2)])
})
await closeBrowsers()
