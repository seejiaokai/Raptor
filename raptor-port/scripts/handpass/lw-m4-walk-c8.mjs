// walker C — a long bell list on the desktop: is "Mark all read" reachable, does the list scroll (extra to the walk)
const CL = await import('./lw-m4-walk-c-lib.mjs')
const L = await CL.setup('c', 's8long')
const H = CL.mk(L)
const { T, rec, shot, press, vis, txt } = L
console.log('[lw-m4-walk-c8 v1]')
L.clearOut()
const size = 'desk'
const w = await L.newCtx(size)
const P = w.page
const say = (...a) => console.log(...a)
const wait = ms => P.waitForTimeout(ms)
try {
  await L.signIn(w, 'member')
  for (const d of ['01-07', '01-09', '01-13', '01-15', '01-19', '01-21', '01-23', '01-27', '01-29', '02-03', '02-05', '02-10']) await H.bid(w, `2026-${d}`)
  await L.switchTo(w, 'admin')
  await L.openApprovals(w)
  await press(w, T('appr-approve-all')); await wait(1100); await press(w, T('appr-approve-all')); await wait(900)
  await L.switchTo(w, 'member')
  const lines = await H.bell(w)
  await shot(w, '8a-long-bell')
  const m = await P.evaluate(() => {
    const list = document.querySelector('[data-testid="bell-list"]')
    const sc = []; let e = list
    while (e && e !== document.body) { const cs = getComputedStyle(e); if (/(auto|scroll)/.test(cs.overflowY)) sc.push({ cls: String(e.className).slice(0, 30), sh: e.scrollHeight, ch: e.clientHeight, st: e.scrollTop }); e = e.parentElement }
    const btn = [...document.querySelectorAll('button')].find(b => /Mark all read/.test(b.innerText))
    const bb = btn && btn.getBoundingClientRect()
    return { n: list.querySelectorAll('[data-testid^="bell-line-"]').length, scrollers: sc, markAll: bb ? { top: Math.round(bb.top), bottom: Math.round(bb.bottom), h: Math.round(bb.height) } : null, vh: innerHeight }
  })
  say('   lines', lines.length, 'geometry', JSON.stringify(m))
  const reach = m.markAll && m.markAll.h > 0 && m.markAll.bottom <= m.vh
  rec('8 a long list (12 lines) on a desktop: "Mark all read" is on screen or the list scrolls to it', size, reach ? 'PASS' : 'FAIL', JSON.stringify(m), ['8a-long-bell'])
  /* scroll the list to its end */
  await P.evaluate(() => { const l = document.querySelector('[data-testid="bell-list"]'); let e = l; while (e && e !== document.body) { if (/(auto|scroll)/.test(getComputedStyle(e).overflowY) && e.scrollHeight > e.clientHeight) { e.scrollTop = e.scrollHeight; return } e = e.parentElement } })
  await wait(400); await shot(w, '8b-long-bell-scrolled')
  const m2 = await P.evaluate(() => { const btn = [...document.querySelectorAll('button')].find(b => /Mark all read/.test(b.innerText)); const bb = btn && btn.getBoundingClientRect(); return bb ? { top: Math.round(bb.top), bottom: Math.round(bb.bottom), h: Math.round(bb.height), vh: innerHeight } : null })
  say('   after scrolling to the end: Mark all read', JSON.stringify(m2))
} catch (e) {
  rec('ERROR', size, 'FAIL', String(e).slice(0, 400))
  await shot(w, 'error').catch(() => {})
}
if (w.errs.length) rec('console', size, 'FAIL', w.errs.join(' || ').slice(0, 800))
L.writeResults('s8long')
await w.ctx.close()
await L.closeBrowser()
console.log('DONE')
