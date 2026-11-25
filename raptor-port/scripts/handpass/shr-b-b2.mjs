// Walker b — B2 (O-S1, O-S2, O-S3 on the week): Shift+Tab back into Ranger's row; Escape in his row; Hex's row typed and
// Shift+Tab back to Ranger's. Each on a fresh fixture.  SZ=desk|phone ENG=chromium|webkit ONLY=s1,s2,s3
console.log('shr-b-b2 v1')
const SZ = process.env.SZ || 'desk', ENG = process.env.ENG || 'chromium', cfg = `${SZ} ${ENG}`
const ONLY = (process.env.ONLY || 's1,s2,s3').split(',')
const B = await (await import('./shr-b-lib.mjs')).setup(`b2-${SZ}-${ENG}`)
const { start, fileInput, go, sleep, log, state, weekCell, typeIn, pic, J, judge, showDay, caret } = B
const UNAV = di => [`#eWeek .day[data-day="${di}"] .sec-unav`]
const marks = (page, di) => page.evaluate(di => ({ dayChanges: [...document.querySelectorAll(`#eWeek .day[data-day="${di}"] .dchg`)].map(e => (e.textContent || '').trim()).join('|'), undo: document.getElementById('undoBtn')?.getAttribute('title') }), di)
const rangerStore = st => st.filter(x => /^LL Ranger /.test(x))
const hexStore = st => st.filter(x => /^LL Hex /.test(x))
const cellText = (page, sel) => page.evaluate(s => (document.querySelector(s)?.textContent || '').trim(), sel)
async function fixture(c) {
  const w = await start(SZ, ENG)
  const iid = await fileInput(w, c, B.WED, { type: 'LL', people: [B.RANGER, B.HEX], from: '08:00', to: '10:00' })
  if (!iid) throw new Error('fixture not filed')
  await go(w.page, 'editsched'); await sleep(600)
  const di = await w.page.evaluate(() => window.DAYS.findIndex(x => x.dt === 'Jul 15'))
  await showDay(w.page, di); await sleep(300)
  const s0 = await state(w, c, 'filed', di)
  if (s0.store.length !== 1 || s0.screen.length !== 2) throw new Error('fixture not one input two rows')
  return { w, iid, di }
}
const away = async w => { if (w.tap) await w.page.touchscreen.tap(3, 120); else await w.page.mouse.click(3, 120); await sleep(800) }
const tab = async (w, shift) => { await w.page.keyboard.press(shift ? 'Shift+Tab' : 'Tab'); await sleep(600) }

/* O-S1: start 0900 Tab, end 1100 Tab, Shift+Tab back into his end (look: 11:00), Tab, click out */
if (ONLY.includes('s1')) { const c = 'B2-S1'; try {
  const { w, di } = await fixture(c); const P = `b2s1-${SZ}-${ENG}`
  await typeIn(w, await weekCell(w.page, di, 'bane', 'str'), '0900'); await tab(w); await state(w, c, 'start 0900 Tab', di)
  await typeIn(w, await weekCell(w.page, di, 'bane', 'end'), '1100'); await tab(w); const a = await state(w, c, 'end 1100 Tab', di)
  const m1 = await marks(w.page, di)
  await tab(w, true)
  const b = await state(w, c, 'Shift+Tab (back into his end)', di)
  const endShown = await cellText(w.page, `[data-inp="${b.caret}"]`)
  const p1 = await pic(w, c, `${P}-1-shifttab`, UNAV(di), { caret: b.caret, endShown })
  await tab(w); const d = await state(w, c, 'Tab again (untouched)', di)
  await away(w); const e = await state(w, c, 'clicked out', di); const m2 = await marks(w.page, di)
  const p2 = await pic(w, c, `${P}-2-left`, UNAV(di), e.screen)
  const ok = /bane\.end$/.test(b.caret || '') && endShown === '11:00' && rangerStore(e.store).length === 1 && rangerStore(e.store)[0].includes('09:00-11:00') && hexStore(e.store).length === 1 && hexStore(e.store)[0].includes('08:00-10:00') && J(m1) === J(m2) && J(a.store) === J(e.store)
  judge(c, cfg, ok ? 'PASS' : 'FAIL', { caretAfterShiftTab: b.caret, endShown, storeBefore: a.store, storeAfter: e.store, screenAfter: e.screen, marksBefore: m1, marksAfter: m2, tabAgain: d.screen }, `${p1}, ${p2}`)
  await w.ctx.close()
} catch (e) { judge(c, cfg, 'NOT WALKED', 'error: ' + String(e.message || e).split('\n')[0].slice(0, 300)) } }

/* O-S2: start 0900 Tab, CLICK back into his start, 0930, Escape, click out */
if (ONLY.includes('s2')) { const c = 'B2-S2'; try {
  const { w, di } = await fixture(c); const P = `b2s2-${SZ}-${ENG}`
  await typeIn(w, await weekCell(w.page, di, 'bane', 'str'), '0900'); await tab(w); const a = await state(w, c, 'start 0900 Tab', di); const m1 = await marks(w.page, di)
  const sel = await weekCell(w.page, di, 'bane', 'str')
  await typeIn(w, sel, '0930'); await sleep(200)
  const typed = await cellText(w.page, sel)
  await w.page.keyboard.press('Escape'); await sleep(600)
  const b = await state(w, c, 'typed 0930 then Escape', di)
  /* Escape blurs the box and the section repaints with fresh addresses: Ranger's start is read from his row as drawn now */
  const rowNow = b.screen.find(x => x.startsWith('Ranger ')) || ''
  const shown = (await cellText(w.page, sel)) || (/^Ranger (\S*)-/.exec(rowNow) || [])[1] || ''
  const p1 = await pic(w, c, `${P}-1-escape`, UNAV(di), { typed, shownAfterEscape: shown, caret: b.caret })
  await away(w); const e = await state(w, c, 'clicked out', di); const m2 = await marks(w.page, di)
  const p2 = await pic(w, c, `${P}-2-left`, UNAV(di), e.screen)
  const ok = typed === '0930' && shown === '09:00' && J(a.store) === J(e.store) && rangerStore(e.store)[0]?.includes('09:00-10:00') && hexStore(e.store)[0]?.includes('08:00-10:00') && J(m1) === J(m2)
  judge(c, cfg, ok ? 'PASS' : 'FAIL', { typed, shownAfterEscape: shown, caretAfterEscape: b.caret, storeBefore: a.store, storeAfter: e.store, screenAfter: e.screen, marksBefore: m1, marksAfter: m2 }, `${p1}, ${p2}`)
  await w.ctx.close()
} catch (e) { judge(c, cfg, 'NOT WALKED', 'error: ' + String(e.message || e).split('\n')[0].slice(0, 300)) } }

/* O-S3: Ranger start 0900 Tab; click Hex's end, 1200; Shift+Tab until the caret is in Ranger's end; look; Tab; leave */
if (ONLY.includes('s3')) { const c = 'B2-S3'; try {
  const { w, di } = await fixture(c); const P = `b2s3-${SZ}-${ENG}`
  await typeIn(w, await weekCell(w.page, di, 'bane', 'str'), '0900'); await tab(w); await state(w, c, 'Ranger start 0900 Tab', di)
  await typeIn(w, await weekCell(w.page, di, 'rocky', 'end'), '1200')
  const trail = []
  let reached = null
  for (let i = 0; i < 6; i++) {
    await tab(w, true)
    const s = await state(w, c, `Shift+Tab #${i + 1}`, di)
    const shown = s.caret ? await cellText(w.page, `[data-inp="${s.caret}"]`) : null
    trail.push({ caret: s.caret, shown, store: s.store, screen: s.screen })
    if (/~bane\.end$/.test(s.caret || '')) { reached = { ...s, shown }; break }
  }
  const p1 = await pic(w, c, `${P}-1-in-ranger-end`, UNAV(di), reached ? { caret: reached.caret, shown: reached.shown } : 'never reached')
  if (!reached) { judge(c, cfg, 'NOT WALKED', { why: 'Shift+Tab never reached Ranger\'s end in 6 presses', trail }, p1); await w.ctx.close() }
  else {
    await tab(w); const d = await state(w, c, 'Tab (untouched)', di)
    await away(w); const e = await state(w, c, 'left the day', di)
    const p2 = await pic(w, c, `${P}-2-left`, UNAV(di), e.screen)
    const rangerEndsSeen = trail.map(t => t.screen.find(x => x.startsWith('Ranger '))).filter(Boolean)
    const ok = reached.shown === '10:00' && rangerEndsSeen.every(x => x.includes('-10:00')) && rangerStore(e.store).length === 1 && rangerStore(e.store)[0].includes('09:00-10:00') && hexStore(e.store).length === 1 && hexStore(e.store)[0].includes('08:00-12:00')
    judge(c, cfg, ok ? 'PASS' : 'FAIL', { rangerEndShownWhenReached: reached.shown, trail, afterTab: d.screen, storeAfter: e.store, screenAfter: e.screen }, `${p1}, ${p2}`)
    await w.ctx.close()
  }
} catch (e) { judge(c, cfg, 'NOT WALKED', 'error: ' + String(e.message || e).split('\n')[0].slice(0, 300)) } }
await B.done()
