// Re-walk A8b — the long bell by wheel: does the list scroll inside, does "Mark all read" stay, does "↓ N more" go at the end (C-F4).
process.env.LW_OUT ||= '../../docs/img/handpass/2026-10-27-lw-m4/rewalk/a'
const A = await import('./lw-m4-walk-a-lib.mjs')
const { L } = A
const { T, rec, shot, txt } = L
console.log('[lw-m4-rw-a8b v1]')
const w = await L.newCtx('desk'); const P = w.page
const wait = ms => P.waitForTimeout(ms)
const read = () => P.evaluate(() => {
  const list = document.querySelector('[data-testid="bell-list"]')
  const lines = [...list.querySelectorAll('[data-testid^="bell-line-"]')]
  const lr = list.getBoundingClientRect()
  const vis = lines.filter(l => { const r = l.getBoundingClientRect(); return r.top >= lr.top - 1 && r.bottom <= lr.bottom + 1 })
  const more = [...document.querySelectorAll('*')].find(e => e.children.length === 0 && /↓\s*\d+\s*more/.test(e.innerText || '') && e.getBoundingClientRect().height > 0)
  const mark = [...document.querySelectorAll('button')].find(b => /Mark all read/i.test(b.innerText) && b.getBoundingClientRect().height > 0)
  const mr = mark && mark.getBoundingClientRect()
  const cs = getComputedStyle(list)
  return { total: lines.length, fullyVisible: vis.length, firstVisible: vis[0] && vis[0].innerText.replace(/\s+/g, ' ').slice(0, 40), lastVisible: vis.length && vis[vis.length - 1].innerText.replace(/\s+/g, ' ').slice(0, 40), listRect: [Math.round(lr.top), Math.round(lr.bottom)], overflowY: cs.overflowY, scrollTop: Math.round(list.scrollTop), scrollH: list.scrollHeight, clientH: list.clientHeight, more: more ? more.innerText.trim() : null, markRect: mr ? [Math.round(mr.top), Math.round(mr.bottom)] : null, vh: innerHeight }
})
try {
  await L.signIn(w, 'member')
  const days = []
  for (let d = 7; d <= 31; d += 2) days.push('2026-01-' + String(d).padStart(2, '0'))
  for (const iso of days) {
    await L.reachCell(w, 'bane', iso)
    await P.evaluate(id => document.querySelector(`[data-testid="${id}"]`)?.scrollIntoView({ block: 'center', inline: 'center' }), L.cellId('bane', iso)); await wait(300)
    await L.openCell(w, 'bane', iso); await L.placeLeave(w, 'LL'); await wait(200)
  }
  await L.switchTo(w, 'admin')
  await L.openApprovals(w)
  const n = await P.locator('[data-testid="approvals-page"] .appr-ok').count()
  for (let i = 0; i < n; i++) { const b = P.locator('[data-testid="approvals-page"] .appr-ok').nth(i); await b.scrollIntoViewIfNeeded(); const bb = await b.boundingBox(); await P.mouse.click(bb.x + bb.width / 2, bb.y + bb.height / 2); await wait(250) }
  await L.switchTo(w, 'member')
  await L.openBell(w); await wait(400)
  const r0 = await read(); console.log('open:', JSON.stringify(r0))
  await shot(w, 'a8b-1-top')
  const lb = await P.locator('[data-testid="bell-list"]').boundingBox()
  await P.mouse.move(lb.x + lb.width / 2, lb.y + lb.height / 2)
  await P.mouse.wheel(0, 250); await wait(500)
  const r1 = await read(); console.log('after wheel 250:', JSON.stringify(r1)); await shot(w, 'a8b-2-middle')
  await P.mouse.wheel(0, 3000); await wait(700)
  const r2 = await read(); console.log('after wheel to the end:', JSON.stringify(r2)); await shot(w, 'a8b-3-end')
  rec('A8.3 the long bell: the list scrolls inside (the lines move), "Mark all read" stays at its foot, "↓ N more" at first', 'desk', r0.more && r1.scrollTop > 0 && r1.firstVisible !== r0.firstVisible && r1.markRect && r0.markRect && r1.markRect[0] === r0.markRect[0] ? 'PASS' : 'FAIL', `open ${JSON.stringify(r0)}; after wheel ${JSON.stringify(r1)}`, ['a8b-1-top', 'a8b-2-middle'])
  rec('A8.4 at the end: no "↓ N more", "Mark all read" still at the foot', 'desk', !r2.more && r2.markRect && r2.markRect[0] === r0.markRect[0] ? 'PASS' : 'FAIL', JSON.stringify(r2), ['a8b-3-end'])
} catch (e) { rec('ERROR', 'desk', 'FAIL', String(e).slice(0, 400)); await shot(w, 'a8b-error').catch(() => {}) }
if (w.errs.length) rec('console', 'desk', 'FAIL', w.errs.join(' || ').slice(0, 400))
await w.ctx.close(); L.writeResults('a8b'); await L.closeBrowser(); console.log('DONE')
