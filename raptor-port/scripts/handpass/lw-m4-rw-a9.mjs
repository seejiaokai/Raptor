// Re-walk A9 — small ones: "New 0" has no dot; Pick dates… with one day picked reads "13 Jan" (never "13 Jan – 13 Jan").
process.env.LW_OUT ||= '../../docs/img/handpass/2026-10-27-lw-m4/rewalk/a'
const A = await import('./lw-m4-walk-a-lib.mjs')
const { L } = A
const { T, rec, shot, txt, press, vis } = L
console.log('[lw-m4-rw-a9 v1]')
const w = await L.newCtx('desk'); const P = w.page
const wait = ms => P.waitForTimeout(ms)
try {
  await L.signIn(w, 'member')
  await L.openCell(w, 'bane', '2026-01-13'); await L.placeLeave(w, 'LL')
  await L.switchTo(w, 'admin')
  await L.openApprovals(w)
  // New 0 (first visit saw it), no dot
  const nz = await P.evaluate(() => { const n = document.querySelector('[data-testid="appr-new"]'); const d = n.querySelector('.appr-dot'); const c = d && getComputedStyle(d); return { text: n.innerText.trim(), dotClass: d && d.className, dotVisible: d && c.display !== 'none' && c.visibility !== 'hidden' && parseFloat(c.opacity) > 0 && d.getBoundingClientRect().width > 0, dotBg: d && c.backgroundColor, dotW: d && Math.round(d.getBoundingClientRect().width * 10) / 10 } })
  console.log('New chip:', JSON.stringify(nz))
  await shot(w, 'a9-1-new', { clip: { x: 20, y: 130, width: 700, height: 120 } })
  await L.openGrid(w); await L.openApprovals(w)
  const n0 = await P.evaluate(() => { const n = document.querySelector('[data-testid="appr-new"]'); const d = n.querySelector('.appr-dot'); const c = getComputedStyle(d); return { text: n.innerText.trim(), dotClass: d.className, bg: c.backgroundColor, vis: c.visibility, w: Math.round(d.getBoundingClientRect().width * 10) / 10, op: c.opacity } })
  console.log('New 0 chip:', JSON.stringify(n0))
  await shot(w, 'a9-2-new0', { clip: { x: 20, y: 130, width: 700, height: 120 } })
  rec('A9.1 "New 0" has no dot (nothing drawn)', 'desk', /New\s*0/.test(n0.text) && (/none/.test(n0.dotClass) && (n0.bg === 'rgba(0, 0, 0, 0)' || n0.vis === 'hidden' || n0.op === '0')) ? 'PASS' : 'FAIL', JSON.stringify(n0), ['a9-2-new0'])
  // Pick dates: one day
  await press(w, T('appr-pick')); await wait(600)
  await shot(w, 'a9-3-pick-open')
  const ids = await P.evaluate(() => [...document.querySelectorAll('[data-testid]')].filter(e => e.getBoundingClientRect().height > 0 && /appr-|range|day|cal/i.test(e.dataset.testid) && !/^cell-|^head-/.test(e.dataset.testid)).map(e => e.dataset.testid).slice(0, 60))
  console.log('ids:', ids.join(' '))
  const dayBtn = ids.find(i => /2026-01-13/.test(i))
  console.log('day button id:', dayBtn)
  if (dayBtn) {
    await press(w, T(dayBtn)); await wait(500)
    await shot(w, 'a9-4-one-day')
    const label = await P.evaluate(() => [...document.querySelectorAll('[data-testid="appr-pick"], [data-testid="appr-range"]')].map(e => e.dataset.testid + ':' + e.innerText.replace(/\s+/g, ' ').trim()))
    console.log('labels:', JSON.stringify(label))
    await P.mouse.click(1400, 700); await wait(500)
    const label2 = await txt(P, T('appr-pick')); const rng = await txt(P, T('appr-range'))
    console.log('after closing: pick', label2, '| range', rng)
    await shot(w, 'a9-5-one-day-closed', { clip: { x: 20, y: 130, width: 1300, height: 120 } })
    const all = [label2, rng, ...label].join(' | ')
    rec('A9.2 Pick dates… with one day picked reads "13 Jan", never "13 Jan – 13 Jan"', 'desk', /13 Jan/.test(all) && !/13 Jan\s*[–-]\s*13 Jan/.test(all) ? 'PASS' : 'FAIL', all, ['a9-4-one-day', 'a9-5-one-day-closed'])
  } else rec('A9.2 one day picked', 'desk', 'NOT WALKED', 'no day button found; ids ' + ids.join(' '), ['a9-3-pick-open'])
} catch (e) { rec('ERROR', 'desk', 'FAIL', String(e).slice(0, 400)); await shot(w, 'a9-error').catch(() => {}) }
if (w.errs.length) rec('console', 'desk', 'FAIL', w.errs.join(' || ').slice(0, 400))
await w.ctx.close(); L.writeResults('a9'); await L.closeBrowser(); console.log('DONE')
