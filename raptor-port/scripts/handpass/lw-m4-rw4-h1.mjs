// Re-walk 4, H1 (+H3): the phone top of Approvals (D1444) at 402, 390, 360 by finger, admin. Chromium.
process.env.LW_OUT ||= '../../docs/img/handpass/2026-10-27-lw-m4/rewalk4'
const B = await import('./lw-m4-walk-b-lib.mjs')
const { T, shot, rec } = B
console.log('[lw-m4-rw4-h1 v1]')
for (const width of [402, 390, 360]) {
  const w = await B.newPhone(width, 874, 'chromium')
  const P = w.page
  try {
    await B.signIn(w, 'admin')
    await B.openApprovals(w)
    await P.evaluate(() => window.scrollTo(0, 0)); await B.sleep(w, 300)
    const g = await P.evaluate(() => {
      const root = document.querySelector('[data-testid="approvals-page"]')
      const card = root.querySelector('.appr-card').getBoundingClientRect()
      const title = root.querySelector('.appr-title').getBoundingClientRect()
      const link = root.querySelector('[data-testid="appr-elsewhere"]')
      const lr = link && link.getBoundingClientRect()
      const chips = [...root.querySelectorAll('.appr-filters .appr-f, [data-testid="appr-pick"], [data-testid="appr-approve-all"]')].filter(c => c.getBoundingClientRect().width > 0)
      const info = chips.map(c => { const r = c.getBoundingClientRect(); const rg = document.createRange(); rg.selectNodeContents(c); const t = rg.getBoundingClientRect(); return { id: c.dataset.testid, text: c.innerText.replace(/\s+/g, ' ').trim(), top: Math.round(r.top), h: Math.round(r.height), left: Math.round(r.left), right: Math.round(r.right), textH: Math.round(t.height) } })
      const cols = root.querySelector('.appr-cols').getBoundingClientRect()
      return { vw: innerWidth, card: [Math.round(card.left), Math.round(card.right)], titleTop: Math.round(title.top), titleBottom: Math.round(title.bottom), link: link ? { text: link.textContent.trim(), top: Math.round(lr.top), bottom: Math.round(lr.bottom), left: Math.round(lr.left), right: Math.round(lr.right), h: Math.round(lr.height) } : null, chips: info, colsTop: Math.round(cols.top), head: root.querySelector('[data-testid="appr-sub"]')?.innerText.trim(), pageScrollW: document.documentElement.scrollWidth }
    })
    console.log(width, JSON.stringify(g))
    const clip = { x: 0, y: Math.max(0, g.titleTop - 40), width: width, height: g.colsTop + 60 - Math.max(0, g.titleTop - 40) }
    await shot(w, `h1-top-${width}`, { clip })
    const tops = [...new Set(g.chips.map(c => c.top))].sort((a, b) => a - b)
    const monthChips = g.chips.filter(c => /appr-m-/.test(c.id || '')).map(c => c.text)
    const row1 = g.chips.filter(c => c.top === tops[0]).map(c => c.text)
    const row2 = g.chips.filter(c => c.top === tops[1]).map(c => c.text)
    const oneLine = g.chips.every(c => c.h < 40)
    const linkOnTitle = g.link && Math.abs(g.link.bottom - g.titleBottom) < 8 || (g.link && g.link.top < g.titleBottom)
    const noCut = g.link ? g.link.right <= g.card[1] : true
    const noX = g.pageScrollW <= g.vw
    if (width === 402) {
      rec('H1 link on title line reading "+2 in JAN - DEC 27 ›"', 'phone402', g.link && /^\+2 in JAN . DEC 27 ›$/.test(g.link.text) && linkOnTitle ? 'PASS' : 'FAIL', `link "${g.link && g.link.text}" top ${g.link && g.link.top} bottom ${g.link && g.link.bottom}; title ${g.titleTop}-${g.titleBottom}`, ['h1-top-402.png'])
      rec('H1 only Jan and Feb chips beside New and All', 'phone402', JSON.stringify(row1.filter(x => !/Pick|Approve/.test(x))) === JSON.stringify(['New 0', 'All', 'Jan', 'Feb']) && !monthChips.some(m => !/^(Jan|Feb)$/.test(m)) ? 'PASS' : 'FAIL', `row1 ${JSON.stringify(row1)} months ${JSON.stringify(monthChips)}`, ['h1-top-402.png'])
      rec('H1 Pick dates… and Approve all on the next row', 'phone402', row2.some(x => /Pick dates/.test(x)) && row2.some(x => /Approve all/.test(x)) && tops.length === 2 ? 'PASS' : 'FAIL', `rows ${JSON.stringify(tops)} row2 ${JSON.stringify(row2)}`, ['h1-top-402.png'])
    } else {
      rec(`H3 phone ${width}: same top, nothing cut, no chip on two lines`, `phone${width}`, oneLine && noCut && noX && g.link && /^\+2 in JAN . DEC 27 ›$/.test(g.link.text) && JSON.stringify(row1.filter(x => !/Pick|Approve/.test(x))) === JSON.stringify(['New 0', 'All', 'Jan', 'Feb']) && tops.length === 2 ? 'PASS' : 'FAIL', `link ${JSON.stringify(g.link)} title ${g.titleTop}-${g.titleBottom} linkOnTitleLine ${linkOnTitle}; rows ${JSON.stringify(tops)}; row1 ${JSON.stringify(row1)} row2 ${JSON.stringify(row2)}; oneLine ${oneLine}; scrollW ${g.pageScrollW}/${g.vw}`, [`h1-top-${width}.png`])
    }
    if (width === 402) {
      await B.press(w, T('appr-elsewhere'), 'h1-link-q'); await B.sleep(w, 800)
      await P.evaluate(() => window.scrollTo(0, 0)); await B.sleep(w, 300)
      const after = await P.evaluate(() => ({ head: document.querySelector('[data-testid="appr-sub"]')?.innerText.trim(), title: document.querySelector('.appr-title')?.innerText.trim(), view: document.body.innerText.match(/View\s+[A-Z]{3}\s*.\s*[A-Z]{3}\s*\d+/)?.[0] || null, link: document.querySelector('[data-testid="appr-elsewhere"]')?.textContent.trim() || null, lines: [...document.querySelectorAll('[data-testid^="appr-line-"]')].length }))
      console.log('after link tap', JSON.stringify(after))
      await shot(w, 'h1-after-link', { clip: { x: 0, y: 0, width: 402, height: 874 } })
      rec('H1 tap the link: the other period opens', 'phone402', after.view && !/JAN . DEC 27/.test(after.view) || (after.link && /JAN . DEC 27/.test(after.link) === false && after.link) ? 'PASS' : 'CHECK', `after: ${JSON.stringify(after)}`, ['h1-link-q.png', 'h1-after-link.png'])
    }
  } catch (e) { console.log('ERR', width, String(e).slice(0, 300)); rec('script error', width, 'NOT WALKED', String(e).slice(0, 200)) }
  if (w.errs.length) console.log('errs', w.errs)
  await w.ctx.close()
}
B.writeResults('h1')
await B.closeAll()
