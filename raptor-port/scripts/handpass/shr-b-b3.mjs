// Walker b — B3 (Astra S04, F-S10, F-S5 on the week): a time cleared; refusals first and later, each followed by tap
// away, tap the box afresh, type the figure it shows; 0800 typed over 08:00. Each on a fresh fixture.
//   SZ=desk|phone ENG=chromium ONLY=clr-end,clr-start,ref-first-0700,ref-first-2570,ref-later,same0800
console.log('shr-b-b3 v1')
const SZ = process.env.SZ || 'desk', ENG = process.env.ENG || 'chromium', cfg = `${SZ} ${ENG}`
const ONLY = (process.env.ONLY || 'clr-end,clr-start,ref-first-0700,ref-first-2570,ref-later,same0800').split(',')
const B = await (await import('./shr-b-lib.mjs')).setup(`b3-${SZ}-${ENG}`)
const { start, fileInput, go, sleep, log, state, weekCell, typeIn, pic, J, judge, showDay, caret } = B
const UNAV = di => [`#eWeek .day[data-day="${di}"] .sec-unav`]
const marks = (page, di) => page.evaluate(di => ({ dayChanges: [...document.querySelectorAll(`#eWeek .day[data-day="${di}"] .dchg`)].map(e => (e.textContent || '').trim()).join('|'), undo: document.getElementById('undoBtn')?.getAttribute('title'), undoDisabled: !!document.getElementById('undoBtn')?.disabled }), di)
const R = st => st.filter(x => /^LL Ranger /.test(x)), H = st => st.filter(x => /^LL Hex /.test(x)), RH = st => st.filter(x => /Ranger\+Hex/.test(x))
const cellText = (page, sel) => page.evaluate(s => (document.querySelector(s)?.textContent || '').trim(), sel)
/* every distinct note shown at the foot over `ms` */
const notesFor = (page, ms = 3500) => page.evaluate(ms => new Promise(res => { const seen = []; const t0 = performance.now(); const tick = () => { const t = document.getElementById('toastEl'); if (t) { const cs = getComputedStyle(t); const s = (t.textContent || '').replace(/\s+/g, ' ').trim(); if (+cs.opacity > 0.05 && s && seen[seen.length - 1] !== s) seen.push(s) } if (performance.now() - t0 < ms) setTimeout(tick, 80); else res(seen) }; tick() }), ms)
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
/* type v into Ranger's field f, Tab, read the notes */
async function put(w, c, di, f, v, label) {
  const sel = await weekCell(w.page, di, 'bane', f)
  await typeIn(w, sel, v)
  const np = notesFor(w.page, 3200)
  await w.page.keyboard.press('Tab')
  const notes = await np
  await sleep(200)
  const s = await state(w, c, label || `${f} ${JSON.stringify(v)} Tab`, di)
  return { ...s, notes, sel }
}
/* after a refusal: tap away, tap the box afresh, type the figure it shows, Tab */
async function retype(w, c, di, f) {
  await away(w)
  const a = await state(w, c, 'after refusal: tapped away', di)
  const sel = await weekCell(w.page, di, 'bane', f)
  const b = w.page.locator(sel).first(); await b.evaluate(el => el.scrollIntoView({ block: 'center' }))
  if (w.tap) await b.tap(); else await b.click(); await sleep(250)
  const shows = await cellText(w.page, sel)
  await w.page.keyboard.press('Control+A'); await w.page.keyboard.type(shows, { delay: 20 })
  const np = notesFor(w.page, 2500)
  await w.page.keyboard.press('Tab'); const notes = await np; await sleep(200)
  const s = await state(w, c, `tapped the box afresh, typed the figure it shows (${shows}), Tab`, di)
  return { afterAway: a, shows, notes, ...s }
}

/* Astra S04: clear a time */
for (const v of ['clr-end', 'clr-start']) { if (!ONLY.includes(v)) continue; const c = `B3-${v}`; try {
  const { w, di } = await fixture(c); const P = `b3-${v}-${SZ}-${ENG}`
  const s1 = await put(w, c, di, 'str', '0900')
  const s2 = await put(w, c, di, v === 'clr-end' ? 'end' : 'str', '', `cleared ${v === 'clr-end' ? 'end' : 'start'}, Tab`)
  const p1 = await pic(w, c, `${P}-1-cleared`, UNAV(di), s2.screen)
  const m1 = await marks(w.page, di)
  /* Shift+Tab back through both time boxes untouched */
  const trail = []
  for (let i = 0; i < 3; i++) { await w.page.keyboard.press('Shift+Tab'); await sleep(500); const s = await state(w, c, `Shift+Tab #${i + 1} untouched`, di); trail.push({ caret: s.caret, store: s.store, screen: s.screen.filter(x => /^Ranger/.test(x)) }); if (/~bane\.str$/.test(s.caret || '')) break }
  const m2 = await marks(w.page, di)
  const s3 = await state(w, c, 'after untouched traversal', di)
  const p2 = await pic(w, c, `${P}-2-traversed`, UNAV(di), s3.screen)
  const s4 = await put(w, c, di, 'str', '0930', 'start 0930 Tab')
  await away(w); const s5 = await state(w, c, 'caret left', di)
  const p3 = await pic(w, c, `${P}-3-0930-left`, UNAV(di), s5.screen)
  const rAfterClear = R(s2.store)[0] || '', scrAfterClear = s2.screen.find(x => x.startsWith('Ranger ')) || ''
  const ok = /allday/.test(rAfterClear) && /^Ranger -"/.test(scrAfterClear.replace(/ \[.*$/, '').replace(/^Ranger -/, 'Ranger -')) !== null && H(s2.store)[0]?.includes('08:00-10:00') && RH(s2.store).length === 0
    && J(s3.store) === J(s2.store) && J(m1) === J(m2)
    && H(s5.store).length === 1 && H(s5.store)[0].includes('08:00-10:00') && R(s5.store).length === 1
  const bothEmpty = /^Ranger -/.test(scrAfterClear)
  judge(c, cfg, ok && bothEmpty ? 'PASS' : 'FAIL', { afterStart: s1.store, afterClear: { store: s2.store, screen: s2.screen, notes: s2.notes }, traversal: trail, marksBefore: m1, marksAfter: m2, after0930: { store: s4.store, screen: s4.screen, notes: s4.notes }, left: { store: s5.store, screen: s5.screen } }, `${p1}, ${p2}, ${p3}`)
  judge(c + ' new start after all day', cfg, 'RECORD', { store: R(s5.store), screen: s5.screen.find(x => x.startsWith('Ranger ')) }, p3)
  await w.ctx.close()
} catch (e) { judge(c, cfg, 'NOT WALKED', 'error: ' + String(e.message || e).split('\n')[0].slice(0, 300)) } }

/* F-S10 (a), (b): a refusal as the FIRST change */
for (const [v, fig] of [['ref-first-0700', '0700'], ['ref-first-2570', '2570']]) { if (!ONLY.includes(v)) continue; const c = `B3-${v}`; try {
  const { w, di } = await fixture(c); const P = `b3-${v}-${SZ}-${ENG}`
  const m0 = await marks(w.page, di)
  const s1 = await put(w, c, di, 'end', fig, `end ${fig} Tab (first change)`)
  const shownEnd = (/-(\S*) "/.exec(s1.screen.find(x => x.startsWith('Ranger ')) || '') || [])[1]
  const p1 = await pic(w, c, `${P}-1-refused`, UNAV(di), { notes: s1.notes, screen: s1.screen })
  const rt = await retype(w, c, di, 'end')
  const p2 = await pic(w, c, `${P}-2-retyped`, UNAV(di), { shows: rt.shows, notes: rt.notes, screen: rt.screen })
  const m1 = await marks(w.page, di)
  const ok = RH(s1.store).length === 1 && s1.store.length === 1 && s1.store[0].includes('08:00-10:00') && shownEnd === '10:00' && RH(rt.store).length === 1 && rt.store.length === 1 && rt.store[0].includes('08:00-10:00') && J(m0) === J(m1)
  judge(c, cfg, ok ? 'PASS' : 'FAIL', { afterRefusal: { store: s1.store, screen: s1.screen, caret: s1.caret, notes: s1.notes, endShown: shownEnd }, retype: { afterAway: rt.afterAway.screen, shows: rt.shows, notes: rt.notes, store: rt.store, screen: rt.screen }, marksBefore: m0, marksAfter: m1 }, `${p1}, ${p2}`)
  judge(c + ' words', cfg, 'RECORD', { refusalNotes: s1.notes, retypeNotes: rt.notes }, p1)
  await w.ctx.close()
} catch (e) { judge(c, cfg, 'NOT WALKED', 'error: ' + String(e.message || e).split('\n')[0].slice(0, 300)) } }

/* F-S10 (c): after a good 0900: end 0830, end 2570, end 1100 — each refusal followed by the retype */
if (ONLY.includes('ref-later')) { const c = 'B3-ref-later'; try {
  const { w, di } = await fixture(c); const P = `b3-ref-later-${SZ}-${ENG}`
  const s0 = await put(w, c, di, 'str', '0900')
  const out = { start0900: s0.store, refusals: [] }
  const pics = []
  let bad = []
  for (const fig of ['0830', '2570']) {
    const m0 = await marks(w.page, di)
    const s = await put(w, c, di, 'end', fig, `end ${fig} Tab`)
    const shown = (/-(\S*) "/.exec(s.screen.find(x => x.startsWith('Ranger ')) || '') || [])[1]
    pics.push(await pic(w, c, `${P}-${fig}-refused`, UNAV(di), { notes: s.notes, screen: s.screen }))
    const rt = await retype(w, c, di, 'end')
    pics.push(await pic(w, c, `${P}-${fig}-retyped`, UNAV(di), { shows: rt.shows, notes: rt.notes, screen: rt.screen }))
    const m1 = await marks(w.page, di)
    out.refusals.push({ fig, store: s.store, screen: s.screen, notes: s.notes, endShown: shown, retype: { shows: rt.shows, notes: rt.notes, store: rt.store, screen: rt.screen }, marksBefore: m0, marksAfter: m1 })
    if (!(R(s.store).length === 1 && R(s.store)[0].includes('09:00-10:00') && H(s.store)[0]?.includes('08:00-10:00') && shown === '10:00' && J(rt.store) === J(s.store) && J(m0) === J(m1))) bad.push(fig)
  }
  const s3 = await put(w, c, di, 'end', '1100', 'end 1100 Tab')
  await away(w); const s4 = await state(w, c, 'caret left', di)
  pics.push(await pic(w, c, `${P}-3-1100-left`, UNAV(di), s4.screen))
  out.end1100 = { store: s3.store, screen: s3.screen, notes: s3.notes }; out.left = { store: s4.store, screen: s4.screen }
  if (!(R(s4.store).length === 1 && R(s4.store)[0].includes('09:00-11:00') && H(s4.store).length === 1 && H(s4.store)[0].includes('08:00-10:00'))) bad.push('1100')
  judge(c, cfg, bad.length ? 'FAIL' : 'PASS', { bad, ...out }, pics.join(', '))
  judge(c + ' words', cfg, 'RECORD', out.refusals.map(r => ({ fig: r.fig, notes: r.notes, retypeNotes: r.retype.notes })), pics[0])
  await w.ctx.close()
} catch (e) { judge(c, cfg, 'NOT WALKED', 'error: ' + String(e.message || e).split('\n')[0].slice(0, 300)) } }

/* F-S5: 0800 typed over 08:00, Tab */
if (ONLY.includes('same0800')) { const c = 'B3-same0800'; try {
  const { w, di } = await fixture(c); const P = `b3-same0800-${SZ}-${ENG}`
  const m0 = await marks(w.page, di); const st0 = await B.store(w.page)
  const s1 = await put(w, c, di, 'str', '0800', 'start 0800 (over 08:00) Tab')
  const m1 = await marks(w.page, di)
  await away(w); const s2 = await state(w, c, 'caret left', di)
  const p1 = await pic(w, c, `${P}-1-left`, UNAV(di), { store: s2.store, screen: s2.screen, undo: m1 })
  const ok = J(st0) === J(s1.store) && J(st0) === J(s2.store) && J(m0) === J(m1)
  judge(c, cfg, ok ? 'PASS' : 'FAIL', { storeBefore: st0, storeAfter: s2.store, screenAfter: s2.screen, notes: s1.notes, marksBefore: m0, marksAfter: m1 }, p1)
  judge(c + ' Undo button', cfg, 'RECORD', { before: m0, after: m1 }, p1)
  await w.ctx.close()
} catch (e) { judge(c, cfg, 'NOT WALKED', 'error: ' + String(e.message || e).split('\n')[0].slice(0, 300)) } }
await B.done()
