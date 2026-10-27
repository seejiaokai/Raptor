// Walker B: the member's bell on a phone beside his drawing (r22-7-bell-phone.png): approved, refused, added-and-approved lines.
// Also the bell on 390x844 and 360x740. Chromium.
process.env.LW_OUT ||= '../../docs/img/handpass/2026-10-27-lw-m4/b'
const B = await import('./lw-m4-walk-b-lib.mjs')
const { L, T, shot, rec } = B
console.log('[lw-m4-walk-b12 v1]')
for (const [W, H] of [[402, 874], [390, 844], [360, 740]]) {
  const w = await B.newPhone(W, H, 'chromium')
  const P = w.page
  try {
    await B.signIn(w, 'member')
    for (const d of ['2026-01-13', '2026-01-15', '2026-01-19']) { await L.openCell(w, 'bane', d); await L.placeLeave(w, 'LL'); await B.sleep(w, 200) }
    await B.switchTo(w, 'admin'); await B.openApprovals(w)
    await P.evaluate(() => window.scrollTo(0, 0)); await B.sleep(w, 300)
    const mark = async (re, name) => P.evaluate(([src, name]) => { const rx = new RegExp(src); const ls = [...document.querySelectorAll('[data-testid="approvals-page"] [data-testid^="appr-line-"]')]; const i = ls.findIndex(e => rx.test(e.innerText) && /Ranger/.test(e.innerText)); if (i >= 0) ls[i].setAttribute('data-walk', name); return i }, [re, name])
    const i13 = await mark('13 Jan', 'a13'), i14 = await mark('15 Jan', 'a14')
    console.log('lines', i13, i14)
    await B.press(w, '[data-walk="a13"] [data-testid="appr-approve"]'); await B.sleep(w, 400)
    await B.press(w, '[data-walk="a14"] [data-testid="appr-refuse"]'); await B.sleep(w, 400)
    await B.openGrid(w)
    await L.openCell(w, 'bane', '2026-03-09')
    await L.placeLeave(w, 'LL'); await B.sleep(w, 400)
    await B.switchTo(w, 'member')
    await L.openBell(w)
    const bl = await B.bellLines(P)
    console.log(`${W}: bell`, bl.map(b => (b.unread ? '● ' : '') + b.text).join(' | '))
    await shot(w, `s12-bell-${W}`)
    await shot(w, `s12-bell-${W}-sharp`, { scale: 'device', clip: { x: 0, y: 0, width: W, height: Math.min(H, 520) } })
    const geo = await P.evaluate(() => {
      const list = document.querySelector('[data-testid="bell-list"]'); const lr = list.getBoundingClientRect()
      const lines = [...list.querySelectorAll('[data-testid^="bell-line-"]')].map(e => { const r = e.getBoundingClientRect(); return { l: Math.round(r.left), r: Math.round(r.right), t: Math.round(r.top), b: Math.round(r.bottom), h: Math.round(r.height), clipped: e.scrollWidth > e.clientWidth + 1 } })
      return { list: { l: Math.round(lr.left), r: Math.round(lr.right), t: Math.round(lr.top), b: Math.round(lr.bottom) }, vw: innerWidth, lines }
    })
    console.log(JSON.stringify(geo))
    const inside = geo.lines.every(l => l.l >= geo.list.l - 0.5 && l.r <= geo.list.r + 0.5 && !l.clipped) && geo.list.l >= 0 && geo.list.r <= geo.vw
    rec(`S12 member's bell on a phone [${W}]`, `${W}`, bl.length >= 3 && inside ? 'PASS' : 'FAIL', `${bl.length} lines: ${bl.map(b => (b.unread ? '(unread) ' : '') + b.text).join(' | ')}; list box ${JSON.stringify(geo.list)}; every line inside, none clipped: ${inside}`, [`s12-bell-${W}.png`, `s12-bell-${W}-sharp.png`])
  } catch (e) { rec('ERROR ' + W, `${W}`, 'FAIL', String(e).slice(0, 300)); await shot(w, `s12-error-${W}`).catch(() => {}) }
  if (w.errs.length) rec('console ' + W, `${W}`, 'FAIL', w.errs.join(' || ').slice(0, 600))
  await w.ctx.close()
}
B.writeResults('s12')
await B.closeAll()
console.log('DONE')
