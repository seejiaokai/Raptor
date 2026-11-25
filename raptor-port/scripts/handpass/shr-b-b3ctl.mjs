// Walker b — B3's control: the same gestures on a ONE-MAN leave (Ranger alone, 08:00–10:00) on the week, so the host can
// tell the shared row's behaviour from the standing one: (1) end 0700 Tab; (2) start 0900 Tab, then the end cleared, Tab.
console.log('shr-b-b3ctl v1')
const SZ = process.env.SZ || 'desk', ENG = process.env.ENG || 'chromium', cfg = `${SZ} ${ENG}`
const B = await (await import('./shr-b-lib.mjs')).setup(`b3ctl-${SZ}-${ENG}`)
const { start, fileInput, go, sleep, state, weekCell, typeIn, pic, J, judge, showDay } = B
const UNAV = di => [`#eWeek .day[data-day="${di}"] .sec-unav`]
const notesFor = (page, ms = 3000) => page.evaluate(ms => new Promise(res => { const seen = []; const t0 = performance.now(); const tick = () => { const t = document.getElementById('toastEl'); if (t) { const cs = getComputedStyle(t); const s = (t.textContent || '').replace(/\s+/g, ' ').trim(); if (+cs.opacity > 0.05 && s && seen[seen.length - 1] !== s) seen.push(s) } if (performance.now() - t0 < ms) setTimeout(tick, 80); else res(seen) }; tick() }), ms)
for (const v of ['end0700', 'clearend']) { const c = `B3ctl-${v}`; try {
  const w = await start(SZ, ENG)
  const iid = await fileInput(w, c, B.WED, { type: 'LL', people: [B.RANGER], from: '08:00', to: '10:00' })
  await go(w.page, 'editsched'); await sleep(600)
  const di = await w.page.evaluate(() => window.DAYS.findIndex(x => x.dt === 'Jul 15')); await showDay(w.page, di)
  const s0 = await state(w, c, 'filed (one man)', di, { who: ['bane'] })
  const steps = [s0]
  const seq = v === 'end0700' ? [['end', '0700']] : [['str', '0900'], ['end', '']]
  let notes = []
  for (const [f, val] of seq) {
    await typeIn(w, await weekCell(w.page, di, 'bane', f), val)
    const np = notesFor(w.page); await w.page.keyboard.press('Tab'); notes = await np
    steps.push(await state(w, c, `${f} ${JSON.stringify(val)} Tab`, di, { who: ['bane'] }))
  }
  const p = await pic(w, c, `b3ctl-${v}-${SZ}-${ENG}`, UNAV(di), steps.at(-1).screen)
  judge(c, cfg, 'RECORD', { iid, steps: steps.map(s => ({ step: s.step, store: s.store, screen: s.screen, caret: s.caret })), notes }, p)
  await w.ctx.close()
} catch (e) { judge(c, cfg, 'NOT WALKED', 'error: ' + String(e.message || e).split('\n')[0].slice(0, 300)) } }
await B.done()
