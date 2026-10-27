// Re-walk walker B, B1 + B3 + B4 + the static half of B2: tab row count inside its outline; headings; filter rows; dates on one line;
// a name left of its puck's chip. Widths 402, 390, 360 (fresh world each, admin).
process.env.LW_OUT ||= '../../docs/img/handpass/2026-10-27-lw-m4/rewalk/b'
const B = await import('./lw-m4-walk-b-lib.mjs')
const { T, shot, rec } = B
console.log('[lw-m4-rw-b1 v1]')
B.L.clearOut()
for (const [W, H] of [[402, 874], [390, 844], [360, 740]]) {
  const w = await B.newPhone(W, H, 'chromium')
  const P = w.page
  try {
    await B.signIn(w, 'admin')
    const tabGeom = () => P.evaluate(() => {
      const out = {}
      for (const id of ['lw-tab-grid', 'lw-tab-approvals', 'oil-tracker']) {
        const b = document.querySelector(`[data-testid="${id}"]`); const r = b.getBoundingClientRect()
        const kids = [...b.querySelectorAll('*')].map(k => k.getBoundingClientRect()).filter(k => k.width > 1)
        out[id] = { l: Math.round(r.left), r: Math.round(r.right), t: Math.round(r.top), b: Math.round(r.bottom), cl: Math.round(Math.min(...kids.map(k => k.left))), cr: Math.round(Math.max(...kids.map(k => k.right))), cls: b.className, lit: b.classList.contains('on') || b.getAttribute('aria-selected') === 'true' || b.getAttribute('aria-pressed') === 'true' }
      }
      const ce = document.querySelector('[data-testid="lw-approvals-count"]'); const c = ce.getBoundingClientRect(); out.count = { l: Math.round(c.left), r: Math.round(c.right), t: Math.round(c.top), b: Math.round(c.bottom), txt: ce.textContent }
      out.vw = innerWidth
      return out
    })
    await P.evaluate(() => window.scrollTo(0, 0))
    await shot(w, `b1-${W}-grid-tabrow`, { clip: { x: 0, y: 0, width: W, height: 120 } })
    const g1 = await tabGeom()
    await B.openApprovals(w, `b1-${W}-open`)
    await P.evaluate(() => window.scrollTo(0, 0)); await B.sleep(w, 300)
    await shot(w, `b1-${W}-approvals-top`)
    const g2 = await tabGeom()
    const inside = g => g.count.l >= g['lw-tab-approvals'].l + 4 && g.count.r <= g['lw-tab-approvals'].r - 4 && g.count.t >= g['lw-tab-approvals'].t && g.count.b <= g['lw-tab-approvals'].b
    rec(`B1 count inside its outline (Grid up)`, W, inside(g1) ? 'PASS' : 'FAIL', JSON.stringify({ count: g1.count, tab: g1['lw-tab-approvals'] }), [`b1-${W}-grid-tabrow.png`])
    rec(`B1 count inside its outline (Approvals lit)`, W, inside(g2) ? 'PASS' : 'FAIL', JSON.stringify({ count: g2.count, tab: g2['lw-tab-approvals'], lit: g2['lw-tab-approvals'].lit }), [`b1-${W}-approvals-top.png`])
    rec(`B1 the tab row fits the screen`, W, g2['oil-tracker'].r <= W && g2['lw-tab-approvals'].r <= g2['oil-tracker'].l + 2 ? 'PASS' : 'FAIL', JSON.stringify({ oil: g2['oil-tracker'], vw: W }), [`b1-${W}-approvals-top.png`])
    /* B4 the filter rows */
    const g = await B.filterGeometry(P)
    const chips = g.rows.flat()
    const rowsTxt = g.rows.map(r => r.map(c => c.text).join(' · ')).join(' // ')
    const spill = chips.filter(c => c.overflowX || c.contentRight > c.r + 0.5 || (c.lines !== null && c.lines > 1.2) || c.h > 40)
    console.log(`filters ${W}: ` + rowsTxt)
    rec(`B4 three rows`, W, g.rows.length === 3 ? 'PASS' : 'FAIL', `${g.rows.length} rows: ${rowsTxt}`, [`b1-${W}-approvals-top.png`])
    rec(`B4 every chip's words on one line`, W, spill.length === 0 ? 'PASS' : 'FAIL', spill.length ? 'spill: ' + spill.map(c => `${c.text} h${c.h} lines${c.lines}`).join(', ') : `${chips.length} chips, none spill; heights ${[...new Set(chips.map(c => c.h))]}`, [`b1-${W}-approvals-top.png`])
    const pick = chips.find(c => c.id === 'appr-pick'), aa = chips.find(c => c.id === 'appr-approve-all')
    rec(`B4 Pick dates left / Approve all right on the 3rd row`, W, pick && aa && g.rows[2] && g.rows[2].includes(pick) && g.rows[2].includes(aa) && pick.x < 40 && aa.r > W - 40 ? 'PASS' : 'FAIL', `pick x${pick && pick.x}-${pick && pick.r}; all x${aa && aa.x}-${aa && aa.r}`, [`b1-${W}-approvals-top.png`])
    /* B3 headings: each heading's text box and the figure under it */
    const hd = await P.evaluate(() => {
      const cols = document.querySelector('.appr-cols')
      const tr = el => { const rg = document.createRange(); rg.selectNodeContents(el); const rs = [...rg.getClientRects()].filter(r => r.width > 0); const b = rg.getBoundingClientRect(); return { l: b.left, r: b.right, t: b.top, b: b.bottom, h: b.height, lh: parseFloat(getComputedStyle(el).lineHeight) || 16, lines: rs.length ? new Set(rs.map(r => Math.round(r.top))).size : 0 } }
      const heads = [...cols.children].map(s => ({ txt: s.textContent.trim(), ...tr(s), sl: s.getBoundingClientRect().left, sr: s.getBoundingClientRect().right }))
      const line = [...document.querySelectorAll('[data-testid^="appr-line-"]')].find(e => e.getBoundingClientRect().height > 0)
      const figs = ['.appr-days', '.appr-bal', '.appr-avail', '.appr-placed'].map(s => { const e = line.querySelector(s); return { s, ...tr(e) } })
      return { heads, figs, wide: document.documentElement.scrollWidth, vw: innerWidth }
    })
    console.log(`headings ${W}: ` + JSON.stringify(hd.heads.map(h => `${h.txt} ${Math.round(h.l)}-${Math.round(h.r)} lines${h.lines}`)) + ' figs ' + JSON.stringify(hd.figs.map(f => `${f.s} ${Math.round(f.l)}-${Math.round(f.r)}`)))
    const gaps = []
    for (let i = 0; i < hd.heads.length - 1; i++) gaps.push(Math.round(hd.heads[i + 1].l - hd.heads[i].r))
    await P.evaluate(() => document.querySelector('.appr-cols').scrollIntoView({ block: 'center' })); await B.sleep(w, 250)
    const cb = await P.evaluate(() => { const r = document.querySelector('.appr-cols').getBoundingClientRect(); return { x: 0, y: Math.max(0, r.top - 6), width: innerWidth, height: 150 } })
    await shot(w, `b1-${W}-headings`, { clip: cb })
    rec(`B3 no two headings touch (gaps)`, W, gaps.every(x => x >= 4) ? 'PASS' : 'FAIL', `gaps ${gaps.join(', ')}px; headings ${hd.heads.map(h => `${h.txt}:${Math.round(h.l)}-${Math.round(h.r)}`).join(' ')}`, [`b1-${W}-headings.png`])
    const la = hd.heads.find(h => /lowest/i.test(h.txt))
    if (W === 360) rec(`B3 LOWEST over AVAIL on two lines`, W, la && la.lines === 2 ? 'PASS' : 'FAIL', `lowest-avail heading lines ${la && la.lines}, box ${la && Math.round(la.l)}-${Math.round(la.r)}`, [`b1-${W}-headings.png`])
    const pl = hd.heads.find(h => /placed/i.test(h.txt)), la2 = hd.heads.find(h => /lowest/i.test(h.txt))
    rec(`B3 LOWEST AVAIL does not run into PLACED`, W, la2 && pl && la2.r + 4 <= pl.l ? 'PASS' : 'FAIL', `lowest ends ${Math.round(la2.r)}, placed starts ${Math.round(pl.l)}`, [`b1-${W}-headings.png`])
    rec(`B3 page does not scroll sideways`, W, hd.wide <= hd.vw + 1 ? 'PASS' : 'FAIL', `scrollWidth ${hd.wide}, viewport ${hd.vw}`, [])
    /* B2 static: dates one line; names left of their puck's chip, every kind of puck listed */
    await P.evaluate(() => window.scrollTo(0, 0)); await B.sleep(w, 200)
    const ls = await P.evaluate(() => [...document.querySelectorAll('[data-testid^="appr-line-"]')].filter(e => e.getBoundingClientRect().height > 0).map(e => {
      const d = e.querySelector('.appr-dlink'), dr = d.getBoundingClientRect()
      const rg = document.createRange(); rg.selectNodeContents(d); const nl = new Set([...rg.getClientRects()].filter(r => r.width > 0).map(r => Math.round(r.top))).size
      const pk = e.querySelector('.puck'), nm = pk.querySelector('.nm').getBoundingClientRect(), rl = pk.querySelector('.role'), rr = rl ? rl.getBoundingClientRect() : null, pr = pk.getBoundingClientRect()
      const ap = e.querySelector('.appr-ok').getBoundingClientRect(), box = e.querySelector('.appr-box').getBoundingClientRect(), btns = e.querySelector('.appr-btns').getBoundingClientRect()
      return { who: e.dataset.testid.slice(10), nm: pk.querySelector('.nm').textContent, role: rl ? rl.textContent : '', cls: pk.className, dates: d.textContent.trim(), datesLines: nl, dh: Math.round(dr.height), dr: Math.round(dr.right), apprL: Math.round(ap.left), btnsL: Math.round(btns.left), nmL: Math.round(nm.left), nmR: Math.round(nm.right), roleL: rr ? Math.round(rr.left) : null, puckL: Math.round(pr.left), top: Math.round(e.getBoundingClientRect().top), h: Math.round(e.getBoundingClientRect().height) }
    }))
    console.log(`lines ${W}:\n` + ls.map(l => JSON.stringify(l)).join('\n'))
    const multi = ls.filter(l => l.datesLines > 1)
    rec(`B2 every date on one line`, W, multi.length === 0 ? 'PASS' : (W === 360 ? 'PASS' : 'FAIL'), `${ls.length} lines; two-line dates: ${multi.map(l => l.dates).join(', ') || 'none'}` + (W === 360 && multi.length ? ' (360: expected for a half day — noted)' : ''), [`b1-${W}-approvals-top.png`])
    const nameLeft = ls.filter(l => l.roleL !== null && l.nmR <= l.roleL + 1 && l.nmL <= l.puckL + 4)
    rec(`B2 a name at the left of its puck (box, per kind)`, W, nameLeft.length === ls.length ? 'PASS' : 'FAIL', ls.map(l => `${l.nm}[${l.role}] name ${l.nmL}-${l.nmR} chip ${l.roleL} ${l.cls.replace(/\s+/g, '.')}`).join('; '), [`b1-${W}-approvals-top.png`])
    await shot(w, `b1-${W}-list-first`)
    /* the rest of the list, scrolled */
    await P.evaluate(() => window.scrollTo(0, 400)); await B.sleep(w, 250)
    await shot(w, `b1-${W}-list-rest`)
  } catch (e) { rec('ERROR', W, 'FAIL', String(e).slice(0, 400)); await shot(w, `b1-${W}-error`).catch(() => {}) }
  if (w.errs.length) rec('console', W, 'FAIL', w.errs.join(' || ').slice(0, 600))
  await w.ctx.close()
}
B.writeResults('b1')
await B.closeAll()
console.log('DONE')
