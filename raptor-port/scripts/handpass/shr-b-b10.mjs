// Walker b — B10 (Astra S19, O-S14): the whole-input rows. (a) a shared Meeting (Ranger + Hex, 08:00–10:00) — its ONE
// Personal Inputs line typed (start 0900 Tab); (b) the same Meeting accepted onto the Ground Programme by its own Accept,
// the ground row's start typed (0900 Tab); (c) a one-man LL (Ranger alone) — its Unavailable row typed (0900, 1100).
// EXPECTED: (a), (b) the input changes for EVERYONE, still one input (D739); (c) saves on the same input, as before.
console.log('shr-b-b10 v1')
const SZ = process.env.SZ || 'desk', ENG = process.env.ENG || 'chromium', cfg = `${SZ} ${ENG}`
const ONLY = (process.env.ONLY || 'a,b,c').split(',')
const B = await (await import('./shr-b-lib.mjs')).setup(`b10-${SZ}-${ENG}`)
const { start, fileInput, go, sleep, log, weekCell, typeIn, pic, J, judge, showDay, caret, shownToast, recOf } = B
const hm = m => m == null ? '' : String(Math.floor(m / 60)).padStart(2, '0') + ':' + String(m % 60).padStart(2, '0')
const all = page => page.evaluate(() => { const nm = { bane: 'Ranger', rocky: 'Hex' }; const hm = m => m == null ? '' : String(Math.floor(m / 60)).padStart(2, '0') + ':' + String(m % 60).padStart(2, '0'); return window.INPUTS.filter(r => r.date === 'Jul 15' && (r.people || []).some(x => x.p === 'bane' || x.p === 'rocky')).map(r => `${r.type} ${(r.people || []).map(x => nm[x.p] || x.p).join('+')} ${r.allday ? 'allday' : hm(r.s) + '-' + hm(r.e)} "${r.remarks || ''}" acc:${r.acc || '-'} [${r.iid}]`) })
async function unfoldPI(w, di, iid) {
  const sel = `#eWeek .day[data-day="${di}"] [data-inp^="${iid}"][data-inp$=".str"]`
  const shown = () => w.page.evaluate(s => [...document.querySelectorAll(s)].some(x => x.getBoundingClientRect().width > 2), sel)
  if (await shown()) return true
  const tog = w.page.locator(`#eWeek [data-pitog="${di}"]`)
  for (let i = 0; i < (await tog.count()); i++) { await tog.nth(i).scrollIntoViewIfNeeded().catch(() => {}); await tog.nth(i).click().catch(() => {}); await sleep(400); if (await shown()) return true }
  return shown()
}
async function fixtureMeeting(c) {
  const w = await start(SZ, ENG)
  const iid = await fileInput(w, c, B.WED, { type: 'Meeting', people: [B.RANGER, B.HEX], from: '08:00', to: '10:00', title: 'Sync' })
  if (!iid) throw new Error('Meeting not filed')
  await go(w.page, 'editsched'); await sleep(600)
  const di = await w.page.evaluate(() => window.DAYS.findIndex(x => x.dt === 'Jul 15')); await showDay(w.page, di)
  log(c, 'filed ' + J(await all(w.page)))
  return { w, iid, di }
}
/* (a) the Personal Inputs line */
if (ONLY.includes('a')) { const c = 'B10-a'; try {
  const { w, iid, di } = await fixtureMeeting(c)
  const shown = await unfoldPI(w, di, iid)
  const lines = await w.page.evaluate(([di, iid]) => [...document.querySelectorAll(`#eWeek .day[data-day="${di}"] [data-inp^="${iid}"][data-inp$=".str"]`)].filter(e => e.getBoundingClientRect().width > 2).map(e => e.getAttribute('data-inp') + ' in ' + (e.closest('.dsec')?.getAttribute('data-secmove') || '?')), [di, iid])
  log(c, 'PI shown ' + shown + ' lines ' + J(lines))
  if (!lines.length) { judge(c, cfg, 'NOT WALKED', { why: 'the Meeting\'s Personal Inputs line not drawn', lines }); await w.ctx.close() }
  else {
    const sel = `#eWeek .day[data-day="${di}"] [data-inp="${lines[0].split(' ')[0]}"]`
    const p0 = await pic(w, c, `b10a-${SZ}-0-pi`, [sel.replace(/\.str"\]$/, '"]').replace('[data-inp=', '[data-inp^='), `#eWeek .day[data-day="${di}"] [data-secmove$=".pers"], #eWeek .day[data-day="${di}"] .sec-pers`], lines)
    await typeIn(w, sel, '0900'); await w.page.keyboard.press('Tab'); await sleep(700)
    const after = await all(w.page); const note = await shownToast(w.page)
    const p1 = await pic(w, c, `b10a-${SZ}-1-after`, [sel], { after, note }, { noScroll: true })
    await w.page.mouse.click(3, 120); await sleep(600)
    const left = await all(w.page)
    const ok = left.length === 1 && /^Meeting Ranger\+Hex 09:00-10:00/.test(left[0])
    judge(c, cfg, ok ? 'PASS' : 'FAIL', { typedIn: lines[0], after, left, note }, `${p0}, ${p1}`)
    await w.ctx.close()
  }
} catch (e) { judge(c, cfg ? 'B10-a' : '', 'NOT WALKED', 'error: ' + String(e.message || e).split('\n')[0].slice(0, 300)) } }
/* (b) the Ground Programme row made by the line's own Accept */
if (ONLY.includes('b')) { const c = 'B10-b'; try {
  const { w, iid, di } = await fixtureMeeting(c)
  await unfoldPI(w, di, iid)
  const acc = w.page.locator(`#eWeek .day[data-day="${di}"] [data-acc="g"][data-acck="${iid}"]`).first()
  const accs = await w.page.evaluate(([di, iid]) => [...document.querySelectorAll(`#eWeek .day[data-day="${di}"] [data-acck="${iid}"]`)].map(e => e.getAttribute('data-acc') + ':' + (e.textContent || '').trim()), [di, iid])
  log(c, 'accept buttons ' + J(accs))
  {
    /* a Meeting files straight onto the ground programme (acc g, its line offers Reject): only press Accept if offered */
    if (await acc.count()) { await acc.scrollIntoViewIfNeeded(); await acc.click(); await sleep(800) }
    const note0 = await shownToast(w.page)
    const rec0 = await all(w.page)
    const gk = await w.page.evaluate(di => { const e = [...document.querySelectorAll(`#eWeek .day[data-day="${di}"] [data-txt^="gr:${di}."][data-txt$=".prog"]`)].find(x => /sync/i.test(x.value || x.textContent || '')); return e ? e.getAttribute('data-txt').replace(/\.prog$/, '') : null }, di)
    log(c, `accepted: note ${J(note0)} store ${J(rec0)} ground key ${gk}`)
    if (!gk) { judge(c, cfg, 'NOT WALKED', { why: 'no ground row named Sync after Accept', note0, rec0 }); await w.ctx.close() }
    else {
      const gsel = `#eWeek [data-txt="${gk}.str"]`
      const before = await w.page.evaluate(s => (document.querySelector(s)?.textContent || '').trim(), gsel)
      const p0 = await pic(w, c, `b10b-${SZ}-0-ground`, [`#eWeek [data-txt^="${gk}."]`], { before })
      await typeIn(w, gsel, '0900'); await w.page.keyboard.press('Tab'); await sleep(700)
      const after = await all(w.page); const note = await shownToast(w.page)
      await w.page.mouse.click(3, 120); await sleep(600)
      const left = await all(w.page)
      const shownNow = await w.page.evaluate(s => (document.querySelector(s)?.textContent || '').trim(), gsel)
      const p1 = await pic(w, c, `b10b-${SZ}-1-after`, [`#eWeek [data-txt^="${gk}."]`], { left, shownNow, note })
      const ok = left.length === 1 && /^Meeting Ranger\+Hex 09:00-10:00/.test(left[0])
      judge(c, cfg, ok ? 'PASS' : 'FAIL', { groundRow: gk, before, after, left, shownNow, note }, `${p0}, ${p1}`)
      await w.ctx.close()
    }
  }
} catch (e) { judge('B10-b', cfg, 'NOT WALKED', 'error: ' + String(e.message || e).split('\n')[0].slice(0, 300)) } }
/* (c) a one-man Unavailable row */
if (ONLY.includes('c')) { const c = 'B10-c'; try {
  const w = await start(SZ, ENG)
  const iid = await fileInput(w, c, B.WED, { type: 'LL', people: [B.RANGER], from: '08:00', to: '10:00' })
  await go(w.page, 'editsched'); await sleep(600)
  const di = await w.page.evaluate(() => window.DAYS.findIndex(x => x.dt === 'Jul 15')); await showDay(w.page, di)
  const steps = []
  for (const [f, v] of [['str', '0900'], ['end', '1100'], ['rmks', 'own']]) {
    await typeIn(w, await weekCell(w.page, di, 'bane', f), v); await w.page.keyboard.press('Tab'); await sleep(600)
    steps.push({ step: `${f} ${v} Tab`, store: await all(w.page), caret: await caret(w.page) })
  }
  await w.page.mouse.click(3, 120); await sleep(600)
  const left = await all(w.page)
  const p = await pic(w, c, `b10c-${SZ}-left`, [`#eWeek .day[data-day="${di}"] .sec-unav`], left)
  const ok = left.length === 1 && left[0].includes(`LL Ranger 09:00-11:00 "own"`) && left[0].includes(`[${iid}]`)
  judge(c, cfg, ok ? 'PASS' : 'FAIL', { iid, steps, left }, p)
  await w.ctx.close()
} catch (e) { judge('B10-c', cfg, 'NOT WALKED', 'error: ' + String(e.message || e).split('\n')[0].slice(0, 300)) } }
await B.done()
