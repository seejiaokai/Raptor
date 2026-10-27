// Walker B, step 2: Approve all on a phone, fast and slow (lesson 2). Chromium 402x874, admin, real storage.
process.env.LW_OUT ||= '../../docs/img/handpass/2026-10-27-lw-m4/b'
const B = await import('./lw-m4-walk-b-lib.mjs')
const { T, shot, rec, press, step } = B
console.log('[lw-m4-walk-b2 v1]')
const w = await B.newPhone(402, 874, 'chromium')
const P = w.page
const state = async () => {
  const lines = await B.apprLines(P)
  const lit = lines.filter(l => l.lit)
  return {
    n: lines.length, lit: lit.map(l => l.who + ':' + l.lit).join(','), nlit: lit.length,
    all: await B.txt(P, T('appr-approve-all')), tab: await B.tabCount(P),
    undo: await P.evaluate(() => { const u = document.querySelector('#undoBtn'); return u ? (u.disabled ? 'disabled' : 'enabled') : 'none' }),
    hdr: await B.txt(P, T('appr-sub')),
  }
}
const fmt = s => JSON.stringify(s)
const rawTap = async (x, y, holdMs = 30) => {
  await w.cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] })
  await P.waitForTimeout(holdMs)
  await w.cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
}
try {
  await B.signIn(w, 'admin')
  await B.openApprovals(w)
  await P.evaluate(() => window.scrollTo(0, 0)); await B.sleep(w, 300)
  const s0 = await state()
  console.log('start', fmt(s0))
  const c = await B.centre(P, T('appr-approve-all'))
  /* A: fast — two taps, the lifts ~100 ms apart */
  const t0 = Date.now()
  await rawTap(c.x, c.y, 30); await P.waitForTimeout(40); await rawTap(c.x, c.y, 30)
  const gap = Date.now() - t0
  await P.waitForTimeout(120); await shot(w, 's2-fast-q')
  await P.waitForTimeout(700); await shot(w, 's2-fast-settled')
  const sA = await state()
  console.log('after fast double', gap + 'ms', fmt(sA))
  const approvedFast = sA.nlit === s0.n
  const armedFast = /tap again/i.test(sA.all || '')
  rec('S2a fast double tap (<150 ms)', 'phone', (approvedFast || armedFast) && sA.nlit !== s0.n + 1 ? 'PASS' : 'FAIL', `taps ${gap} ms in all; before ${fmt(s0)}; after ${fmt(sA)}; all lines lit: ${approvedFast}; still armed: ${armedFast}`, ['s2-fast-q.png', 's2-fast-settled.png'])
  /* one Undo takes back everything the fast taps did */
  await B.press(w, '#undoBtn', 's2-fast-undo-q'); await B.sleep(w, 600); await shot(w, 's2-fast-undo')
  const sU = await state()
  console.log('after ONE undo', fmt(sU))
  rec('S2b one Undo after the fast taps brings every line back', 'phone', approvedFast ? (sU.nlit === 0 ? 'PASS' : 'FAIL') : 'NOT WALKED', `lit after undo ${sU.nlit}; undo ${sU.undo}; all "${sU.all}"; tab ${sU.tab}`, ['s2-fast-undo.png'])
  /* disarm/clean state check before the slow case */
  await P.evaluate(() => window.scrollTo(0, 0)); await B.sleep(w, 300)
  const sB0 = await state(); console.log('before slow', fmt(sB0))
  /* B: slow — tap, 3 s, tap */
  await B.press(w, T('appr-approve-all'), 's2-slow1-q'); await B.sleep(w, 400); await shot(w, 's2-slow1')
  const sB1 = await state(); console.log('after tap 1', fmt(sB1))
  await B.sleep(w, 2600)
  await shot(w, 's2-slow-3s')
  const sB1b = await state(); console.log('after 3 s', fmt(sB1b))
  rec('S2c slow: first tap arms and stays armed 3 s', 'phone', /tap again/i.test(sB1.all || '') && /tap again/i.test(sB1b.all || '') ? 'PASS' : 'FAIL', `after tap ${sB1.all}; after 3 s ${sB1b.all}`, ['s2-slow1.png', 's2-slow-3s.png'])
  await B.press(w, T('appr-approve-all'), 's2-slow2-q'); await B.sleep(w, 500); await shot(w, 's2-slow2')
  const sB2 = await state(); console.log('after tap 2', fmt(sB2))
  const exp = (await B.apprLines(P)).length
  rec('S2d slow second tap approves exactly the lines shown', 'phone', sB2.nlit === sB0.n && sB2.nlit === exp ? 'PASS' : 'FAIL', `lit ${sB2.nlit} of ${sB0.n}; tab ${sB0.tab} -> ${sB2.tab}; all "${sB2.all}"`, ['s2-slow2-q.png', 's2-slow2.png'])
  await B.press(w, '#undoBtn'); await B.sleep(w, 600)
  const sB3 = await state(); console.log('after undo', fmt(sB3))
  rec('S2e one Undo takes the slow approve-all back', 'phone', sB3.nlit === 0 ? 'PASS' : 'FAIL', `lit ${sB3.nlit}; tab ${sB3.tab}`, [])
  /* C: arm, then a month chip -> disarmed */
  await P.evaluate(() => window.scrollTo(0, 0)); await B.sleep(w, 300)
  await B.press(w, T('appr-approve-all'), 's2-arm2-q'); await B.sleep(w, 400); await shot(w, 's2-arm2')
  const sC1 = await state()
  await B.press(w, T('appr-m-2026-02'), 's2-monthchip-q'); await B.sleep(w, 500); await shot(w, 's2-monthchip')
  const sC2 = await state()
  console.log('arm then month', fmt(sC1), '->', fmt(sC2))
  rec('S2f armed, then a month chip: disarmed, words back', 'phone', /tap again/i.test(sC1.all || '') && !/tap again/i.test(sC2.all || '') && /Approve all \d+/.test(sC2.all || '') && sC2.nlit === 0 ? 'PASS' : 'FAIL', `armed "${sC1.all}" -> after chip "${sC2.all}", lit ${sC2.nlit}`, ['s2-arm2.png', 's2-monthchip.png'])
  /* a tap right after disarm needs a fresh arm: one more Approve all tap must only ARM, not approve */
  await B.press(w, T('appr-approve-all')); await B.sleep(w, 400)
  const sC3 = await state()
  rec('S2g after disarming, the next tap only arms', 'phone', /tap again/i.test(sC3.all || '') && sC3.nlit === 0 ? 'PASS' : 'FAIL', `"${sC3.all}", lit ${sC3.nlit}`, [])
} catch (e) {
  rec('ERROR', 'phone', 'FAIL', String(e).slice(0, 300)); await shot(w, 's2-error').catch(() => {})
}
if (w.errs.length) rec('console', 'phone', 'FAIL', w.errs.join(' || ').slice(0, 600))
await w.ctx.close()
B.writeResults('s2')
await B.closeAll()
console.log('DONE')
