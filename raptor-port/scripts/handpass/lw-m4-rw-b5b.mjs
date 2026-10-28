// Re-walk walker B, B5 extra: Back and X held DOWN with a finger (the touched state an iPhone keeps), a picture while the finger is down.
process.env.LW_OUT ||= '../../docs/img/handpass/2026-10-27-lw-m4/rewalk/b'
const B = await import('./lw-m4-walk-b-lib.mjs')
const { T, shot, rec } = B
console.log('[lw-m4-rw-b5b v1]')
const w = await B.newPhone(402, 874, 'chromium')
const P = w.page
try {
  await B.signIn(w, 'admin')
  const c0 = await B.centre(P, T('lw-tab-approvals'))
  console.log('over the tab centre before opening:', await P.evaluate(({ x, y }) => { const h = document.elementFromPoint(x, y); return h ? h.tagName + '.' + String(h.className).slice(0, 40) + '#' + (h.dataset.testid || '') : null }, c0))
  await B.openApprovals(w)
  await P.evaluate(() => window.scrollTo(0, 0)); await B.sleep(w, 250)
  const hold = async (name, sel) => {
    const c = await B.centre(P, sel)
    await w.cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: c.x, y: c.y }] })
    await P.waitForTimeout(160)
    await shot(w, name + '-down')
    const st = await P.evaluate(s => { const e = document.querySelector(s); const c = getComputedStyle(e); return { bg: c.backgroundColor, fg: c.color, bd: c.borderTopStyle + ' ' + c.borderTopColor, op: c.opacity, active: e.matches(':active'), hover: e.matches(':hover') } }, sel)
    await w.cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
    await P.waitForTimeout(500)
    await shot(w, name + '-after')
    return st
  }
  await B.press(w, '[data-testid^="appr-line-"] [data-testid="appr-dates"]', null); await B.sleep(w, 900)
  const sb = await hold('b5b-back', T('appr-back'))
  console.log('Back held:', JSON.stringify(sb))
  const onAppr = await B.vis(P, T('approvals-page'))
  await P.evaluate(() => window.scrollTo(0, 0)); await B.sleep(w, 250)
  await B.press(w, '[data-testid^="appr-line-"] [data-testid="appr-dates"]', null); await B.sleep(w, 900)
  const sx = await hold('b5b-x', T('appr-slim-x'))
  console.log('X held:', JSON.stringify(sx))
  rec('B5 Back held down: no tint, no box, plain words (finger down picture)', 'phone', sb.bg === 'rgba(0, 0, 0, 0)' && sb.bd.startsWith('none') ? 'PASS' : 'FAIL', JSON.stringify(sb) + ` approvals page after lift ${onAppr}`, ['b5b-back-down.png', 'b5b-back-after.png'])
  rec('B5 X held down: no tint, no box (finger down picture)', 'phone', sx.bg === 'rgba(0, 0, 0, 0)' && sx.bd.startsWith('none') ? 'PASS' : 'FAIL', JSON.stringify(sx), ['b5b-x-down.png', 'b5b-x-after.png'])
} catch (e) { rec('ERROR', 'phone', 'FAIL', String(e).slice(0, 400)); await shot(w, 'b5b-error').catch(() => {}) }
if (w.errs.length) rec('console', 'phone', 'FAIL', w.errs.join(' || ').slice(0, 600))
await w.ctx.close()
B.writeResults('b5b')
await B.closeAll()
console.log('DONE')
