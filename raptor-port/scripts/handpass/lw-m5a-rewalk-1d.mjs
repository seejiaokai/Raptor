// M5a re-walk 1d — after an Escape in a box, is the NEXT leaving of that box (not by Enter) swallowed? typed 19 then Escape, then typed 21 and left by another box
process.env.LW_OUT ||= '../../docs/img/handpass/2026-10-28-lw-m5a/rewalk/r1d'
process.env.LW_TODAY ||= '2026-01-25'
const R = await import('./lw-m5a-rewalk-lib.mjs')
const { L, T, note, press, txt, balRow, shotD } = R
console.log('[lw-m5a-rewalk-1d v1]')
L.clearOut()
const S = 'desk'
const w = await L.newCtx('desk'); const P = w.page
const ok = c => (c ? 'PASS' : 'FAIL')
try {
  await L.signIn(w, 'admin'); await R.openBalances(w)
  const before = (await balRow(P, 'stiff')).app   // 17.5
  const typeNoEnter = async v => { await press(w, T('bal-LVE-stiff')); await P.waitForTimeout(200); await P.keyboard.press('Control+A'); await P.keyboard.type(v, { delay: 30 }); await P.waitForTimeout(150) }
  const read = async () => ({ v: await P.locator(T('bal-LVE-stiff')).inputValue(), e: await txt(P, T('bal-LVE-stiff-err')), row: (await balRow(P, 'stiff')).app })
  // (a) plain: type 21, leave by another box: saved?
  await typeNoEnter('21'); await press(w, T('bal-LVE-bane')); await P.waitForTimeout(500)
  const a = await read()
  note('E1 type 21 in Saber\'s box, leave by pressing another box (no Escape before): saved', S, ok(a.v === '21'), `before ${before}; now ${JSON.stringify(a)}`, [])
  // (b) type 22, Escape (back to 21), then type 23, leave by another box
  await typeNoEnter('22'); await P.keyboard.press('Escape'); await P.waitForTimeout(400)
  const b1 = await read()
  await typeNoEnter('23'); await press(w, T('bal-LVE-bane')); await P.waitForTimeout(500)
  const b2 = await read(); await shotD(w, '70-after-escape-then-leave')
  note('E2 type 22, Escape (puts 21 back), then type 23 and leave by another box: 23 saved', S, ok(b2.v === '23'), `after Escape ${JSON.stringify(b1)}; after typing 23 and leaving ${JSON.stringify(b2)}`, ['70-after-escape-then-leave'])
  // (c) the same again with Enter to see Enter still works
  await typeNoEnter('24'); await P.keyboard.press('Enter'); await P.waitForTimeout(500)
  const c = await read()
  note('E3 type 24 + Enter after that: saved', S, ok(c.v === '24'), JSON.stringify(c), [])
  // (d) type 25, Escape, then Tab away with an emptied box
  await typeNoEnter('25'); await P.keyboard.press('Escape'); await P.waitForTimeout(300)
  await press(w, T('bal-LVE-stiff')); await P.waitForTimeout(150); await P.keyboard.press('Control+A'); await P.keyboard.press('Backspace'); await P.keyboard.press('Tab'); await P.waitForTimeout(400)
  const d = await read()
  note('E4 Escape, then the box emptied and left by Tab: "Type a figure"', S, ok(/Type a figure/i.test(d.e || '')), JSON.stringify(d), [])
} catch (e) { note('ERROR', S, 'FAIL', String(e).slice(0, 600)); await L.shot(w, 'error').catch(() => {}) }
R.dump('r1d')
await w.ctx.close(); await L.closeBrowser()
console.log('DONE')
