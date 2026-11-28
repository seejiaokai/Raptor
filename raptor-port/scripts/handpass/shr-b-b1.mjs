// Walker b — B1 (Astra S05, O-S8 on the week): Ranger's row of the shared leave on Edit Schedule's week — start 0900,
// end 1100, remark "own hours", each left by Tab (desk) or by a tap on the next box (phone); caret left; reload.
// EXPECTED: Ranger 09:00–11:00 "own hours" on an input of his own; Hex 08:00–10:00, none; screen = store at every step.
//   SZ=desk|phone ENG=chromium|webkit node scripts/handpass/shr-b-b1.mjs
console.log('shr-b-b1 v1')
const SZ = process.env.SZ || 'desk', ENG = process.env.ENG || 'chromium', cfg = `${SZ} ${ENG}`
const B = await (await import('./shr-b-lib.mjs')).setup(`b1-${SZ}-${ENG}`)
const { start, fileInput, go, sleep, log, state, weekCell, typeIn, pic, J, judge, showDay, reloadWeek } = B
const c = 'B1'
const UNAV = di => [`#eWeek .day[data-day="${di}"] .sec-unav`]
try {
  const w = await start(SZ, ENG)
  const iid = await fileInput(w, c, B.WED, { type: 'LL', people: [B.RANGER, B.HEX], from: '08:00', to: '10:00' })
  if (!iid) throw new Error('fixture not filed')
  await go(w.page, 'editsched'); await sleep(600)
  const di = await w.page.evaluate(() => window.DAYS.findIndex(x => x.dt === 'Jul 15'))
  await showDay(w.page, di); await sleep(300)
  const steps = [await state(w, c, 'filed', di)]
  if (steps[0].store.length !== 1 || steps[0].screen.length !== 2) throw new Error('fixture not one input two rows: ' + J(steps[0]))
  const pics = [await pic(w, c, `b1-${SZ}-${ENG}-0-filed`, UNAV(di), steps[0].screen)]
  const vals = [['str', '0900'], ['end', '1100'], ['rmks', 'own hours']]
  for (let i = 0; i < vals.length; i++) {
    const [f, v] = vals[i]
    const sel = await weekCell(w.page, di, 'bane', f)
    if (!sel) throw new Error('no cell for Ranger ' + f)
    await typeIn(w, sel, v)
    if (w.tap) {
      /* the phone: the next box tapped (the last: Hex's start, then a tap away) */
      const next = i < 2 ? await weekCell(w.page, di, 'bane', vals[i + 1][0]) : null
      if (next) { await w.page.locator(next).first().tap(); await sleep(60); pics.push(await pic(w, c, `b1-${SZ}-${ENG}-${i + 1}a-lift`, UNAV(di), 'within 100ms of the lift')) }
      else { await w.page.keyboard.press('Tab') }
      await sleep(650)
    } else { await w.page.keyboard.press('Tab'); await sleep(600) }
    const s = await state(w, c, `${f} ${v}, ${w.tap && i < 2 ? 'tap next box' : 'Tab'} (typed in ${sel.match(/data-inp="([^"]+)"/)[1]})`, di)
    steps.push(s)
    pics.push(await pic(w, c, `b1-${SZ}-${ENG}-${i + 1}-${f}`, UNAV(di), s.screen))
  }
  /* the caret leaves the section: a click (tap) on the week's empty title area */
  const away = await w.page.evaluate(() => { const e = document.elementFromPoint(3, 120); return e ? e.tagName + '.' + e.className : null })
  if (w.tap) await w.page.touchscreen.tap(3, 120); else await w.page.mouse.click(3, 120)
  await sleep(800)
  const left = await state(w, c, `caret left (pressed ${away})`, di); steps.push(left)
  pics.push(await pic(w, c, `b1-${SZ}-${ENG}-4-left`, UNAV(di), left.screen))
  await reloadWeek(w); await showDay(w.page, di); await sleep(300)
  const rel = await state(w, c, 'after reload', di); steps.push(rel)
  pics.push(await pic(w, c, `b1-${SZ}-${ENG}-5-reload`, UNAV(di), rel.screen))
  /* judge: Ranger alone 09:00–11:00 "own hours", Hex 08:00–10:00 "" — store and screen after each step */
  const want = { 1: ['09:00-10:00', ''], 2: ['09:00-11:00', ''], 3: ['09:00-11:00', 'own hours'] }
  const bad = []
  for (let i = 1; i < steps.length; i++) {
    const s = steps[i], k = Math.min(i, 3), [rt, rr] = want[k]
    const R = s.store.filter(x => /^LL Ranger /.test(x)), H = s.store.filter(x => /^LL Hex /.test(x)), RH = s.store.filter(x => /Ranger\+Hex|Hex\+Ranger/.test(x))
    if (!(R.length === 1 && R[0].includes(`${rt} "${rr}"`) && H.length === 1 && H[0].includes('08:00-10:00 ""') && RH.length === 0)) bad.push(`store at ${s.step}: ${J(s.store)}`)
    const sr = s.screen.find(x => x.startsWith('Ranger ')), sh = s.screen.find(x => x.startsWith('Hex '))
    if (!sr || !sr.includes(`${rt} "${rr}"`) || !sh || !sh.includes('08:00-10:00 ""')) bad.push(`screen at ${s.step}: ${J(s.screen)}`)
  }
  const order = rel.screen.map(x => x.split(' ')[0])
  judge(c, cfg, bad.length ? 'FAIL' : 'PASS', { bad, steps }, pics.join(', '))
  judge(c + ' row order', cfg, 'RECORD', { afterChanges: left.screen.map(x => x.split(' ')[0]), afterReload: order }, pics.at(-1))
  await w.ctx.close()
} catch (e) { judge(c, cfg, 'NOT WALKED', 'error: ' + String(e.message || e).split('\n')[0].slice(0, 400)) }
await B.done()
