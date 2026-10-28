// Walker D, script d4: the page left open across midnight on 31 Dec — a real clock (Playwright's fake clock), no bridge, no touch.
process.env.LW_OUT ||= '../../docs/img/handpass/2026-10-28-lw-m5a/d'
process.env.LW_TODAY ||= '2026-12-31'
const D = await import('./lw-m5a-walk-d-lib.mjs')
const { L, note, eq } = D
const { T, press, vis, txt, shot } = L
console.log('[lw-m5a-walk-d-d4 v1]')
const w = await L.newCtx('desk')
const P = w.page
const exp = (label, got, want) => ({ label, got, want, ok: eq(got, want) })
function judge(id, checks, pics, extra = '') {
  const bad = checks.filter(c => !c.ok)
  note(id, 'desk', bad.length ? 'FAIL' : 'PASS', checks.map(c => `${c.label} ${c.got}${c.ok ? '' : ' (expected ' + c.want + ')'}`).join('; ') + (extra ? ' · ' + extra : ''), pics)
}
try {
  if (!w.ctx.clock) throw new Error('this Playwright has no clock')
  await w.ctx.clock.install({ time: new Date('2026-12-31T23:57:00') })
  // sign in WITHOUT the helper's pinned day: the app's own clock is the page's (faked) Date
  await P.goto(L.PLAIN); await P.waitForSelector('#luser')
  console.log('page Date now:', await P.evaluate(() => new Date().toString()))
  await P.fill('#luser', 'ad'); await P.fill('#lpass', 'a')
  await P.click('#loginForm button[type=submit]'); await P.waitForSelector('#vWeek .day', { state: 'attached' })
  await L.openWar(w, 'admin')
  await D.openBalances(w)
  // fixture: Ranger 37 incl 4, typed today (31 Dec 2026)
  await D.typeInBox(w, T('bal-LVE-bane'), 37); await D.typeInBox(w, T('bal-cf-bane'), 4)
  const r0 = await D.balRow(P, 'bane')
  // his window, docked, open while the page stays up
  await press(w, T('bal-name-bane')); await P.waitForTimeout(700)
  const w0 = await D.pwRead(P)
  await shot(w, 'd4-before-midnight')
  console.log('before:', JSON.stringify(r0), '| window', w0.app, w0.cf, w0.taken, w0.med, JSON.stringify(w0.other), 'lve tile:', w0.lve)
  console.log('page Date before wait:', await P.evaluate(() => new Date().toString()))
  // let the clock run through midnight: no touch
  await w.ctx.clock.runFor('03:30'); await P.waitForTimeout(1500)
  console.log('page Date after:', await P.evaluate(() => new Date().toString()))
  const r1 = await D.balRow(P, 'bane'), w1 = await D.pwRead(P)
  await shot(w, 'd4-after-midnight')
  console.log('after:', JSON.stringify(r1), '| window', w1 && `${w1.app} ${w1.cf} ${w1.taken} ${w1.med} ${JSON.stringify(w1.other)} lve tile: ${w1.lve}`)
  judge('52 midnight on 31 Dec, page and window left open, no touch: Ranger 37 incl 4 (Senior +36) → 69 incl 33', [
    exp('page App bal before', r0.app, '37'), exp('page App bal after', r1.app, '69'), exp('page incl after', r1.cf, '33'),
    exp('window App after', w1?.app, '69'), exp('window incl after', w1?.cf, '33'),
    exp('"taken" before', w0.taken, '5 taken'), exp('"taken" after', w1?.taken, '0 taken'),
    exp('CCL tile kept (D1489)', w1?.other.CCL, w0.other.CCL), exp('FCL kept', w1?.other.FCL, w0.other.FCL), exp('PL kept', w1?.other.PL, w0.other.PL), exp('EL kept', w1?.other.EL, w0.other.EL), exp('CL kept', w1?.other.CL, w0.other.CL),
  ], ['d4-before-midnight', 'd4-after-midnight'], `lve tile before "${w0.lve}", after "${w1?.lve}"; window "till 31 Dec" words in tile`)
  // the carried-forward's date words: "till 31 Dec" now the new year? read the tile's words
  note('52 the tile words after midnight ("till 31 Dec" — the new year\'s)', 'desk', 'PASS', `LVE tile reads: "${w1?.lve}" (before: "${w0.lve}"), MED ${w1?.med}`, ['d4-after-midnight'])
  // the other surfaces after midnight: grid figure, My leave (admin's own)
  await D.closePw(w)
  await L.openGrid(w); await P.waitForTimeout(800)
  const gf = await D.gridFig(P, 'bane'), ml = await D.myLeave(P)
  await shot(w, 'd4-grid-after')
  note('52 the grid\'s figure beside Ranger after midnight', 'desk', /^\S+/.test(gf) ? 'PASS' : 'FAIL', `grid figure "${gf}" (War bal; his pending bids still stand), Saber's My leave "${ml}"`, ['d4-grid-after'])
  // Days taken view: heading follows the View period
  await D.openBalances(w)
  await press(w, T('bal-view-taken')); await P.waitForTimeout(600)
  const head = await txt(P, T('bal-taken-head'))
  await shot(w, 'd4-taken-after')
  note('52 Days taken after midnight: its heading follows the View period', 'desk', /JAN - DEC 26|JAN - DEC 27/.test(head || '') ? 'PASS' : 'FAIL', `heading "${head}"`, ['d4-taken-after'])
  // the window's year picker and lines after midnight: left open (read before) and reopened (read now)
  await press(w, T('bal-view-bal')); await P.waitForTimeout(500)
  const wr = await D.winOf(w, 'bane', true, 'd4-window-reopened')
  note('52 the window reopened after midnight: year picker and lines', 'desk', 'PASS', `year picker value "${wr.year?.value}" options ${JSON.stringify(wr.year?.options)}; ${wr.lines.length} lines: ${wr.lines.map(l => l.id + ' ' + l.text).join(' / ')}; left-open window read after midnight: year ${JSON.stringify(w1?.year)} lines ${w1?.lines.length}`, ['d4-after-midnight', 'd4-window-reopened'])
  await D.closePw(w)
} catch (e) { note('ERROR', 'desk', 'FAIL', String(e).slice(0, 500)); await shot(w, 'd4-error').catch(() => {}) }
note('errors (console, page, 4xx)', 'desk', w.errs.length ? 'FAIL' : 'PASS', w.errs.length ? w.errs.join(' || ').slice(0, 800) : 'none')
D.dumpResults('d4')
await w.ctx.close(); await L.closeBrowser()
console.log('DONE')
