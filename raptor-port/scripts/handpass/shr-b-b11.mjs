// Walker b — B11 (Astra S14): halves and the week's edge. (a) a shared AM leave (Ranger + Hex, Wed): Ranger's end changed
// away from the half, then back to the half's own end; (b) a shared all-day leave Sun 19 – Mon 20 Jul (across the week's
// edge): Ranger's start typed on Sunday (this week), his remark on Monday (the next week, loaded by the app's own week
// arrow). EXPECTED: Ranger's alone changes; RECORD the half label and what the next week shows.
console.log('shr-b-b11 v1')
const SZ = process.env.SZ || 'desk', ENG = process.env.ENG || 'chromium', cfg = `${SZ} ${ENG}`
const ONLY = (process.env.ONLY || 'a,b').split(',')
const B = await (await import('./shr-b-lib.mjs')).setup(`b11-${SZ}-${ENG}`)
const { start, fileInput, go, sleep, log, weekRows, weekCell, typeIn, pic, J, judge, showDay, caret, openDay, ids, press, answerAsks } = B
const all = (page, re) => page.evaluate(src => { const nm = { bane: 'Ranger', rocky: 'Hex' }; const hm = m => m == null ? '' : String(Math.floor(m / 60)).padStart(2, '0') + ':' + String(m % 60).padStart(2, '0'); return window.INPUTS.filter(r => new RegExp(src).test(r.date || '') && (r.people || []).some(x => x.p === 'bane' || x.p === 'rocky') && r.type === 'LL').map(r => `${(r.people || []).map(x => nm[x.p] || x.p).join('+')} ${r.date}${r.endDate ? '→' + r.endDate : ''} ${r.allday ? 'allday' : hm(r.s) + '-' + hm(r.e)}${r.half ? ' half:' + r.half : ''} "${r.remarks || ''}" [${r.iid}]`) }, re.source)
/* each man's row on day di: its name cell's words (the half label sits there or beside the times) */
const named = (page, di) => page.evaluate(di => [...document.querySelectorAll(`#eWeek .day[data-day="${di}"] .sec-unav .pl-row`)].filter(r => r.getBoundingClientRect().width > 1 && r.querySelector('.puck[data-person="bane"], .puck[data-person="rocky"]')).map(r => `${r.querySelector('.puck[data-person="bane"]') ? 'Ranger' : 'Hex'} :: ${(r.querySelector('.nm')?.innerText || '').replace(/\s+/g, ' ').trim()} :: ${[...r.querySelectorAll('.t')].map(e => (e.innerText || '').trim()).join('-')} :: ${(r.querySelector('.rmk')?.innerText || '').replace(/\s+/g, ' ').trim()}`), di)
let w
if (ONLY.includes('a')) { const c = 'B11-a', P = `b11a-${SZ}`; try {
  w = await start(SZ, ENG)
  const iid = await fileInput(w, c, B.WED, { type: 'LL', people: [B.RANGER, B.HEX], span: 'am' })
  await go(w.page, 'editsched'); await sleep(600)
  const di = await w.page.evaluate(() => window.DAYS.findIndex(x => x.dt === 'Jul 15')); await showDay(w.page, di)
  const steps = [{ step: 'filed AM', store: await all(w.page, /Jul 15/), rows: await named(w.page, di) }]
  log(c, J(steps[0]))
  if (!steps[0].store.length || !/half/.test(steps[0].store[0])) throw new Error('not filed as a half: ' + J(steps[0].store))
  const pics = [await pic(w, c, `${P}-0-filed`, [`#eWeek .day[data-day="${di}"] .sec-unav`], steps[0].rows)]
  const endWas = (/-(\d\d:\d\d)/.exec((await weekRows(w.page, di)).find(r => r.startsWith('Ranger ')) || '') || [])[1]
  for (const v of ['1100', endWas ? endWas.replace(':', '') : '1200']) {
    await typeIn(w, await weekCell(w.page, di, 'bane', 'end'), v); await w.page.keyboard.press('Tab'); await sleep(600)
    await w.page.mouse.click(3, 120); await sleep(600)
    const s = { step: `Ranger end ${v} Tab, clicked away`, store: await all(w.page, /Jul 15/), rows: await named(w.page, di) }
    steps.push(s); log(c, J(s))
    pics.push(await pic(w, c, `${P}-${steps.length - 1}-end-${v}`, [`#eWeek .day[data-day="${di}"] .sec-unav`], s.rows))
  }
  const last = steps.at(-1), mid = steps[1]
  const hexKept = st => st.filter(x => /^Hex /.test(x) && /half:/.test(x)).length === 1
  const ok = hexKept(mid.store) && hexKept(last.store) && mid.store.some(x => /^Ranger .* 08:00-11:00/.test(x) && !/half/.test(x))
  judge(c, cfg, ok ? 'PASS' : 'FAIL', { halfEnd: endWas, steps }, pics.join(', '))
  judge(c + ' half label', cfg, 'RECORD', steps.map(s => ({ step: s.step, store: s.store, rows: s.rows })), pics.join(', '))
  await w.ctx.close()
} catch (e) { judge(c, cfg, 'NOT WALKED', 'error: ' + String(e.message || e).split('\n')[0].slice(0, 300)); try { await w.ctx.close() } catch {} } }

if (ONLY.includes('b')) { const c = 'B11-b', P = `b11b-${SZ}`; try {
  w = await start(SZ, ENG)
  /* Sun 19 → Mon 20 Jul, all day, through the Inputs window (Sunday's + Input, the calendar's Monday tapped for the end) */
  await openDay(w, '2026-07-19')
  const before = await ids(w.page)
  await press(w, '#icPopAdd'); await w.page.locator('#inpEditPop #inpEditType').waitFor()
  await w.page.selectOption('#inpEditPop #inpEditType', 'LL')
  await press(w, '#inpEditPop [data-testid="pp-several"]')
  for (const id of [B.RANGER, B.HEX]) if ((await w.page.locator(`#inpEditPop [data-pp="${id}"]`).getAttribute('aria-pressed')) !== 'true') await press(w, `#inpEditPop [data-pp="${id}"]`)
  const lit = await w.page.evaluate(() => [...document.querySelectorAll('#inpEditPop [data-pp][aria-pressed="true"]')].map(b => b.getAttribute('data-pp')))
  for (const id of lit) if (![B.RANGER, B.HEX].includes(id)) await press(w, `#inpEditPop [data-pp="${id}"]`)
  if (await w.page.locator('#inpEditSpan [data-span="all"]').count()) await press(w, '#inpEditSpan [data-span="all"]')
  const mon = w.page.locator('[data-testid="inpEdCal-day-2026-07-20"]').first(); if (await mon.count()) await press(w, mon)
  const reads = await w.page.evaluate(() => (document.querySelector('#inpEditPop .rc-read')?.textContent || '').trim())
  await press(w, '#inpEditSave'); await answerAsks(w)
  if (await w.page.locator('[data-testid="win-inputsday-x"]').count()) await press(w, '[data-testid="win-inputsday-x"]')
  const made = (await ids(w.page)).filter(x => !before.includes(x))
  const s0 = await all(w.page, /Jul (19|20)/)
  log(c, `filed: dates ${reads}; new ${J(made)}; store ${J(s0)}`)
  if (s0.length !== 1 || !/Jul 19→Jul 20/.test(s0[0])) throw new Error('not one leave Sun–Mon: ' + J(s0))
  await go(w.page, 'editsched'); await sleep(600)
  const SUN = await w.page.evaluate(() => window.DAYS.findIndex(x => x.dt === 'Jul 19')); await showDay(w.page, SUN)
  const pics = [await pic(w, c, `${P}-0-sun`, [`#eWeek .day[data-day="${SUN}"] .sec-unav`], await named(w.page, SUN))]
  await typeIn(w, await weekCell(w.page, SUN, 'bane', 'str'), '0900'); await w.page.keyboard.press('Tab'); await sleep(600)
  await w.page.mouse.click(3, 120); await sleep(600)
  const s1 = { step: 'Sunday: Ranger start 0900 Tab', store: await all(w.page, /Jul (19|20)/), sun: await named(w.page, SUN) }
  log(c, J(s1)); pics.push(await pic(w, c, `${P}-1-sun-0900`, [`#eWeek .day[data-day="${SUN}"] .sec-unav`], s1.sun))
  /* the next week, by the week's own arrow */
  const nxt = w.page.locator('#wkNext:visible, [data-wknav="next"]:visible, [aria-label="Next week"]:visible').first()
  const how = (await nxt.count()) ? 'the next-week arrow' : 'loadWeek (no arrow found)'
  if (await nxt.count()) { await nxt.click(); await sleep(1200) } else { await w.page.evaluate(() => window.loadWeek('20/07/2026')); await sleep(1200) }
  const wk = await w.page.evaluate(() => window.DAYS.map(d => d.dt))
  const MON = wk.indexOf('Jul 20')
  if (MON < 0) throw new Error('next week not loaded: ' + J(wk) + ' by ' + how)
  await showDay(w.page, MON); await sleep(300)
  const s2 = { step: `next week (${how}): Monday read`, store: await all(w.page, /Jul (19|20)/), mon: await named(w.page, MON) }
  log(c, J(s2)); pics.push(await pic(w, c, `${P}-2-mon`, [`#eWeek .day[data-day="${MON}"] .sec-unav`], s2.mon))
  const rk = await weekCell(w.page, MON, 'bane', 'rmks')
  if (!rk) throw new Error('no remark cell for Ranger on Monday: ' + J(s2.mon))
  await typeIn(w, rk, 'next'); await w.page.keyboard.press('Tab'); await sleep(600)
  await w.page.mouse.click(3, 120); await sleep(600)
  const s3 = { step: 'Monday: Ranger remark "next" Tab', store: await all(w.page, /Jul (19|20)/), mon: await named(w.page, MON) }
  log(c, J(s3)); pics.push(await pic(w, c, `${P}-3-mon-remark`, [`#eWeek .day[data-day="${MON}"] .sec-unav`], s3.mon))
  const st = s3.store
  const ok = st.length === 2 && st.some(x => /^Ranger Jul 19→Jul 20 09:00-23:59 "next"/.test(x)) && st.some(x => /^Hex Jul 19→Jul 20 allday ""/.test(x))
  judge(c, cfg, ok ? 'PASS' : 'FAIL', { filed: s0, s1, s2, s3 }, pics.join(', '))
  judge(c + ' next week shows', cfg, 'RECORD', { mondayBefore: s2.mon, mondayAfter: s3.mon }, pics.slice(2).join(', '))
  await w.ctx.close()
} catch (e) { judge(c, cfg, 'NOT WALKED', 'error: ' + String(e.message || e).split('\n')[0].slice(0, 300)); try { await w.ctx.close() } catch {} } }
await B.done()
