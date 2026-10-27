// walker C — the bell on a phone (402 x 874) beside his drawing r22-7; a long list; a tap on a line (extra to the desktop walk)
const CL = await import('./lw-m4-walk-c-lib.mjs')
const L = await CL.setup('c', 's7phone')
const H = CL.mk(L)
const { T, rec, shot, press, vis, txt } = L
console.log('[lw-m4-walk-c7 v1]')
L.clearOut()
const size = 'phone'
const w = await L.newCtx(size)
const P = w.page
const say = (...a) => console.log(...a)
const wait = ms => P.waitForTimeout(ms)
try {
  await L.signIn(w, 'member')
  for (const d of ['2026-01-07', '2026-01-09', '2026-01-13', '2026-01-15', '2026-01-19', '2026-01-21']) {
    const ok = await H.bid(w, d)
    say('   bid', d, ok)
  }
  await L.switchTo(w, 'admin')
  await L.openApprovals(w)
  await shot(w, '7a-approvals-phone')
  await press(w, T('appr-approve-all'), '7b-armed-q'); await wait(1100)
  await shot(w, '7b-armed')
  await press(w, T('appr-approve-all'), '7c-approved-q'); await wait(900)
  await shot(w, '7c-approved')
  say('   approvals after approve all:', JSON.stringify((await L.apprLines(P)).map(l => l.who + ':' + (l.lit || '-'))))
  await L.switchTo(w, 'member')
  /* the bell: a tap, the quick picture and the settled one */
  await press(w, '#notifyBell', '7d-bell-q'); await wait(600)
  await shot(w, '7d-bell')
  const lines = await L.bellLines(P)
  say('   bell lines:', lines.length, lines.map(l => (l.unread ? '*' : '') + l.text).join(' | '))
  const m = await P.evaluate(() => {
    const list = document.querySelector('[data-testid="bell-list"]'); if (!list) return null
    const r = list.getBoundingClientRect()
    let sc = list; const out = []
    while (sc && sc !== document.body) { const cs = getComputedStyle(sc); if (/(auto|scroll)/.test(cs.overflowY)) out.push({ tag: sc.tagName, id: sc.id, cls: String(sc.className).slice(0, 30), sh: sc.scrollHeight, ch: sc.clientHeight }); sc = sc.parentElement }
    const btns = [...document.querySelectorAll('button')].filter(b => /Mark all read/.test(b.innerText)).map(b => { const bb = b.getBoundingClientRect(); return { top: Math.round(bb.top), bottom: Math.round(bb.bottom), vis: bb.height > 0 } })
    return { listBox: { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) }, scrollers: out, markAll: btns, vh: innerHeight, vw: innerWidth }
  })
  say('   bell geometry:', JSON.stringify(m))
  rec('P1 phone bell: every box inside the screen, Mark all read reachable', size, m && m.listBox.x >= 0 && m.listBox.x + m.listBox.w <= m.vw && m.markAll.some(b => b.vis && b.bottom <= m.vh) ? 'PASS' : 'FAIL', JSON.stringify(m), ['7d-bell-q', '7d-bell'])
  /* a tap on the newest line */
  await press(w, T(`bell-line-${lines[0].id}`), '7e-tap-q')
  await wait(900); await shot(w, '7e-tap-1s')
  const ring1 = await H.ring(w)
  await wait(2200); await shot(w, '7f-tap-3s')
  const ring3 = await H.ring(w)
  say('   ring at 1 s', JSON.stringify(ring1), 'at 3 s', JSON.stringify(ring3))
  rec('P2 phone: a tap on a bell line -> the grid at that day, ringed', size, ring1 ? 'PASS' : 'FAIL', `ring at 1 s ${JSON.stringify(ring1)}; at 3 s ${JSON.stringify(ring3)}; newest line "${lines[0].text}"`, ['7e-tap-q', '7e-tap-1s', '7f-tap-3s'])
} catch (e) {
  rec('ERROR', size, 'FAIL', String(e).slice(0, 400))
  await shot(w, 'error').catch(() => {})
}
if (w.errs.length) rec('console', size, 'FAIL', w.errs.join(' || ').slice(0, 800))
L.writeResults('s7phone')
await w.ctx.close()
await L.closeBrowser()
console.log('DONE')
