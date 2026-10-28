// M5a re-walk 1c — why did F1b read no words in script 1? the same two refusals in a row (Enter, Escape, then leaving another way)
process.env.LW_OUT ||= '../../docs/img/handpass/2026-10-28-lw-m5a/rewalk/r1c'
process.env.LW_TODAY ||= '2026-01-25'
const R = await import('./lw-m5a-rewalk-lib.mjs')
const { L, T, note, press, txt, balRow, shotD } = R
console.log('[lw-m5a-rewalk-1c v1]')
L.clearOut()
const S = 'desk'
const w = await L.newCtx('desk'); const P = w.page
const ok = c => (c ? 'PASS' : 'FAIL')
try {
  await L.signIn(w, 'admin'); await R.openBalances(w)
  const before = (await balRow(P, 'stiff')).app
  const empty = async () => { await press(w, T('bal-LVE-stiff')); await P.waitForTimeout(200); await P.keyboard.press('Control+A'); await P.keyboard.press('Backspace'); await P.waitForTimeout(150) }
  const read = async () => ({ v: await P.locator(T('bal-LVE-stiff')).inputValue(), e: await txt(P, T('bal-LVE-stiff-err')) })
  await empty(); await P.keyboard.press('Enter'); await P.waitForTimeout(500)
  const a = await read()
  await P.keyboard.press('Escape'); await P.waitForTimeout(400)
  const a2 = await read()
  await empty(); await press(w, T('bal-LVE-bane')); await P.waitForTimeout(500)
  const b = await read(); await shotD(w, '60-second-refusal-other-box')
  note('F1g Enter on an emptied box, Escape, then the box emptied again and left by pressing another box', S, ok(/Type a figure/i.test(b.e || '') && b.v === before), `after Enter ${JSON.stringify(a)}; after Escape ${JSON.stringify(a2)}; second leave ${JSON.stringify(b)}`, ['60-second-refusal-other-box'])
  /* same with a different box: is it Escape that muted it? try without Escape: Enter, then empty again + other box */
  await P.keyboard.press('Escape'); await P.waitForTimeout(300)
  await empty(); await P.keyboard.press('Enter'); await P.waitForTimeout(500)
  const c = await read()
  await empty(); await press(w, T('bal-LVE-bane')); await P.waitForTimeout(500)
  const d = await read(); await shotD(w, '61-second-refusal-no-escape')
  note('F1h Enter on an emptied box, then emptied again at once (no Escape) and left by another box', S, ok(/Type a figure/i.test(d.e || '') && d.v === before), `after first Enter ${JSON.stringify(c)}; second leave ${JSON.stringify(d)}`, ['61-second-refusal-no-escape'])
} catch (e) { note('ERROR', S, 'FAIL', String(e).slice(0, 600)); await L.shot(w, 'error').catch(() => {}) }
R.dump('r1c')
await w.ctx.close(); await L.closeBrowser()
console.log('DONE')
