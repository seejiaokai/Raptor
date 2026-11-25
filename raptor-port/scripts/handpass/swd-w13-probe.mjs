// swd-w13-probe — the doors tried once before the walk is written (read only; window.* read). SZ=d node …/swd-w13-probe.mjs
process.env.W13_RUN ||= 'probe'
import './swd-w13-env.mjs'
const M = await import('./swd-w13-lib.mjs')
const { X, T, L, RANGER, HEX, ISO, sleep, J } = { ...M, J: JSON.stringify }
console.log('VERSION swd-w13-probe 2 · size', process.env.SZ || 'd')
const SZ = process.env.SZ || 'd'
const log = (...a) => console.log('>>', ...a.map(x => typeof x === 'string' ? x : J(x)))
await T.run('probe', SZ, async (p, W) => {
  await M.post(p, W, RANGER, ISO[17], 'p.f1')
  await M.asR(p, W)
  let pg = await M.sday(p, W, ISO[16]); log('Thu 16 as Ranger', pg.win)
  await X.sansX(p, W)
  let r = await M.drag(p, W, ISO[16], ISO[18]); log('drag 16→18', r.opened, r.picked, r.r, await M.winDates(p))
  if (r.opened) {
    const a = await M.add(p, W, 'drag'); log('add', a.said, a.shown, a.stayed, a.made)
    log('recs', M.sayRecs(await M.sansRecs(p)))
    log('undo title', await p.locator('#undoBtn').first().getAttribute('title').catch(() => ''))
    await W.press(p, '#undoBtn:visible', 'undo'); await sleep(800)
    log('after undo', M.sayRecs(await M.sansRecs(p)), await L.toastSaid(p))
  }
  await T.closeAll(p, W)
  r = await M.keys(p, W, ISO[16], 2); log('keys 16 +2 Enter', r.picked, r.opened, await M.winDates(p))
  await X.closeInp(p, W)
  const c = await M.commitOpen(p, W, ISO[17], 'c'); log('commit Fri 17', c.ok, c.why, await M.winDates(p))
  if (c.ok) {
    log(await X.tapWinDate(p, W, ISO[16]), await M.winDates(p))
    log(await X.tapWinDate(p, W, ISO[18]), await M.winDates(p))
    await W.pic(p, 'cal-after')
    await X.closeInp(p, W)
  }
  await M.asS(p, W)
  r = await M.drag(p, W, ISO[16], ISO[18]); log('Saber drag 16→18', r.opened, r.r && r.r.person, r.r && r.r.options, await M.winDates(p))
  await X.closeInp(p, W)
  const c2 = await M.commitOpen(p, W, ISO[17], 'c2'); log('Saber commit Fri 17', c2.ok, c2.r && c2.r.person, c2.r && c2.r.options)
  if (c2.ok) {
    log(await X.setWho(p, W, RANGER), await M.winDates(p))
    log(await X.tapWinDate(p, W, ISO[16]), await M.winDates(p))
    log(await X.tapWinDate(p, W, ISO[18]), await M.winDates(p))
    await X.closeInp(p, W)
  }
  await X.sansX(p, W)
  log('Aug in July view', await p.locator('[data-testid="sc-day-2026-08-01"]').count(), await p.locator('[data-testid="sc-day-2026-08-02"]').count())
  log('crew', await p.evaluate(() => [...document.querySelectorAll('.sc-day')].slice(-3).map(e => e.dataset.icday + ' ' + e.className)))
})
process.exit(0)
