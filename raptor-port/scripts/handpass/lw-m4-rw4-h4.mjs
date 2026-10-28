// Re-walk 4, H4 (+H5): the slim bar's fill (D1445) on a phone (finger) and the desktop (1536 at 1.25); and the desktop top of Approvals (D1444 unchanged). Chromium.
process.env.LW_OUT ||= '../../docs/img/handpass/2026-10-27-lw-m4/rewalk4'
const B = await import('./lw-m4-walk-b-lib.mjs')
const { L, T, shot, rec } = B
console.log('[lw-m4-rw4-h4 v1]')
const readBar = P => P.evaluate(() => {
  const s = document.querySelector('[data-testid="appr-slim"]'); if (!s) return null
  const st = e => { const c = getComputedStyle(e); const r = e.getBoundingClientRect(); return { txt: e.innerText.replace(/\s+/g, ' ').trim(), bg: c.backgroundColor, bd: `${c.borderTopWidth} ${c.borderTopStyle} ${c.borderTopColor}`, fg: c.color, fs: c.fontSize, fw: c.fontWeight, box: `${Math.round(r.left)},${Math.round(r.top)} ${Math.round(r.width)}x${Math.round(r.height)}` } }
  return { bar: st(s), back: st(document.querySelector('[data-testid="appr-back"]')), x: st(document.querySelector('[data-testid="appr-slim-x"]')), vw: innerWidth, vh: innerHeight }
})
/* phone */
{
  const w = await B.newPhone(402, 874, 'chromium'); const P = w.page
  try {
    await B.signIn(w, 'admin'); await B.openApprovals(w); await P.evaluate(() => window.scrollTo(0, 0)); await B.sleep(w, 300)
    await B.press(w, '[data-testid="approvals-page"] [data-testid="appr-dates"]', 'h4-phone-dates-q'); await B.sleep(w, 1000)
    await shot(w, 'h4-phone-bar')
    const s = await readBar(P); console.log('phone', JSON.stringify(s))
    const b = s.bar.box.split(/[, x]/).map(Number)
    await shot(w, 'h4-phone-bar-zoom', { clip: { x: 0, y: b[1] - 40, width: 402, height: 874 - b[1] + 40 } })
    rec('H4 phone: slim bar fill rgb(22, 27, 34), words, Back ▴ and ✕', 'phone', s.bar.bg === 'rgb(22, 27, 34)' && /Back/.test(s.back.txt) && s.x.txt === '✕' && /pending/.test(s.bar.txt) ? 'PASS' : 'FAIL', `bar bg ${s.bar.bg} text "${s.bar.txt}" edge ${s.bar.bd}; Back "${s.back.txt}" bg ${s.back.bg} bd ${s.back.bd} fg ${s.back.fg}; ✕ "${s.x.txt}" bg ${s.x.bg} bd ${s.x.bd}; box ${s.bar.box}`, ['h4-phone-bar.png', 'h4-phone-bar-zoom.png'])
  } catch (e) { console.log('ERR phone', String(e).slice(0, 300)); rec('H4 phone', 'phone', 'NOT WALKED', String(e).slice(0, 200)) }
  if (w.errs.length) console.log('errs', w.errs)
  await w.ctx.close()
}
/* desktop */
{
  const w = await L.newCtx('desk'); const P = w.page
  try {
    await L.signIn(w, 'admin'); await L.openApprovals(w); await P.evaluate(() => window.scrollTo(0, 0)); await B.sleep(w, 300)
    /* H5: the desktop top */
    const top = await P.evaluate(() => {
      const root = document.querySelector('[data-testid="approvals-page"]')
      const chips = [...root.querySelectorAll('[data-testid^="appr-m-"]')].filter(e => e.getBoundingClientRect().width > 0).map(e => e.innerText.trim())
      const link = root.querySelector('[data-testid="appr-elsewhere"]')
      return { chips, link: link ? link.textContent.trim() : null, sub: root.querySelector('[data-testid="appr-sub"]')?.innerText.trim() }
    })
    console.log('desktop top', JSON.stringify(top))
    await shot(w, 'h5-desktop-top')
    rec('H5 desktop: every month chip and "+2 pending in JAN - DEC 27 ›"', 'desk', top.chips.length === 12 && top.link && /^\+2 pending in JAN . DEC 27 ›$/.test(top.link) ? 'PASS' : 'FAIL', `chips ${JSON.stringify(top.chips)}; link "${top.link}"; sub "${top.sub}"`, ['h5-desktop-top.png'])
    await L.press(w, '[data-testid="approvals-page"] [data-testid="appr-dates"]'); await B.sleep(w, 1000)
    await shot(w, 'h4-desk-bar')
    const s = await readBar(P); console.log('desk', JSON.stringify(s))
    const b = s.bar.box.split(/[, x]/).map(Number)
    await shot(w, 'h4-desk-bar-zoom', { clip: { x: Math.max(0, b[0] - 40), y: b[1] - 40, width: Math.min(1536, b[2] + 80), height: 110 } })
    rec('H4 desktop: slim bar fill rgb(22, 27, 34), words, Back ▴ and ✕', 'desk', s.bar.bg === 'rgb(22, 27, 34)' && /Back/.test(s.back.txt) && s.x.txt === '✕' && /pending/.test(s.bar.txt) ? 'PASS' : 'FAIL', `bar bg ${s.bar.bg} text "${s.bar.txt}" edge ${s.bar.bd}; Back "${s.back.txt}" bg ${s.back.bg} bd ${s.back.bd} fg ${s.back.fg}; ✕ "${s.x.txt}" bg ${s.x.bg} bd ${s.x.bd}; box ${s.bar.box}`, ['h4-desk-bar.png', 'h4-desk-bar-zoom.png'])
  } catch (e) { console.log('ERR desk', String(e).slice(0, 300)); rec('H4/H5 desktop', 'desk', 'NOT WALKED', String(e).slice(0, 200)) }
  if (w.errs.length) console.log('errs', w.errs)
  await w.ctx.close()
}
B.writeResults('h4'); await B.closeAll()
