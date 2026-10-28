// M5a re-walk 6 — the person window left open across midnight on 31 Dec (a Playwright fake clock, no bridge, no touch): the new year's lines
process.env.LW_OUT ||= '../../docs/img/handpass/2026-10-28-lw-m5a/rewalk/r6'
process.env.LW_TODAY ||= '2026-12-31'
const R = await import('./lw-m5a-rewalk-lib.mjs')
const { L, T, note, press, txt, balRow, pwRead, closePw, shotD, eq } = R
console.log('[lw-m5a-rewalk-6 v1]')
L.clearOut()
const S = 'desk'
const w = await L.newCtx('desk'); const P = w.page
const ok = c => (c ? 'PASS' : 'FAIL')
try {
  await w.ctx.clock.install({ time: new Date('2026-12-31T23:57:00') })
  await P.goto(L.PLAIN); await P.waitForSelector('#luser')
  await P.fill('#luser', 'ad'); await P.fill('#lpass', 'a'); await P.click('#loginForm button[type=submit]'); await P.waitForSelector('#vWeek .day', { state: 'attached' })
  await L.openWar(w, 'admin'); await R.openBalances(w)
  await R.typeInBox(w, T('bal-LVE-bane'), 37); await R.typeInBox(w, T('bal-cf-bane'), 4)
  await press(w, T('bal-name-bane')); await P.waitForTimeout(700)
  const w0 = await pwRead(P); await shotD(w, '01-before-midnight')
  note('M0 before midnight (23:57 on 31 Dec): Ranger\'s window open, year picker and 2026 lines', S, 'NOTE', `App ${w0.app} incl ${w0.cf}; "${w0.taken}"; picker ${JSON.stringify(w0.year)}; ${w0.lines.length} lines`, ['01-before-midnight'])
  await w.ctx.clock.runFor('03:30'); await P.waitForTimeout(1500)
  console.log('page date now:', await P.evaluate(() => new Date().toString()))
  const w1 = await pwRead(P); await shotD(w, '02-after-midnight')
  const lines2026 = w1.lines.filter(l => /^2026-/.test(l.id))
  note('M1 after midnight, window left open, no touch: figures follow (69 incl 33, "0 taken")', S, ok(w1.app === '69' && w1.cf === '33' && /^0 taken/.test(w1.taken)), `App ${w1.app} incl ${w1.cf}; "${w1.taken}"`, ['02-after-midnight'])
  note('M2 … the year picker reads "2027 and ahead" and the 2026 lines are gone from the list', S, ok(/2027 and ahead/.test(w1.year?.value === 'ahead' ? w1.year.options[0] : '') && !lines2026.length), `picker value "${w1.year?.value}", options ${JSON.stringify(w1.year?.options)}; lines ${w1.lines.length}: ${w1.lines.map(l => l.text).join(' | ') || 'none'}`, ['02-after-midnight'])
  const hasPast = (w1.year?.options || []).some(o => /^2026$/.test(o.trim()))
  note('M3 the 2026 lines are one pick away: "2026" is in the picker', S, ok(hasPast), `options ${JSON.stringify(w1.year?.options)}`, [])
  if (hasPast) {
    await P.locator(T('pw-year')).selectOption({ index: (w1.year.options.findIndex(o => /^2026$/.test(o.trim()))) }); await P.waitForTimeout(500)
    const w2 = await pwRead(P); await shotD(w, '03-picked-2026')
    note('M4 2026 picked: the 2026 lines come back', S, ok(w2.lines.length >= 8), `${w2.lines.length} lines: ${w2.lines.map(l => l.text).slice(0, 3).join(' | ')} …`, ['03-picked-2026'])
  }
  await closePw(w)
  await press(w, T('bal-name-bane')); await P.waitForTimeout(700)
  const w3 = await pwRead(P)
  note('M5 closed and reopened after midnight: same as the left-open window', S, ok(w3.lines.length === w1.lines.length && w3.year?.value === w1.year?.value), `reopened: picker "${w3.year?.value}", ${w3.lines.length} lines`, [])
} catch (e) { note('ERROR', S, 'FAIL', String(e).slice(0, 600)); await L.shot(w, 'error').catch(() => {}) }
note('errors (console, page, 4xx)', S, w.errs.length ? 'FAIL' : 'PASS', w.errs.length ? w.errs.join(' || ').slice(0, 800) : 'none')
R.dump('r6')
await w.ctx.close(); await L.closeBrowser()
console.log('DONE')
