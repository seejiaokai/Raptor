/* D260–D262 walk — a survey of the fresh demo world: which men carry an OIL award, an undecided bid, approved leave,
   in January to April (the war JAN – DEC 26, OPEN, bidding 1 Jan – 31 Mar), so the walk uses real days. Read only. */
process.env.HP_SHOTS ||= new URL('../../../docs/img/handpass/2026-09-27-d260-d262/probe', import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1')
const L = await import('../ab/ab-lib.mjs')
const { openHi } = await import('../am/w2-lib.mjs')
const { browser, page } = await openHi({ width: 1440, height: 900, who: 'a', dpr: 1 })
for (const m of ['2026-01-05', '2026-02-05', '2026-03-05', '2026-04-05']) {
  await L.lwOpen(page, m)
  const got = await page.evaluate((mon) => {
    const out = []
    for (const c of document.querySelectorAll('[data-testid^="cell-"]')) {
      const id = c.getAttribute('data-testid'); const d = id.slice(-10); if (!d.startsWith(mon)) continue
      const chip = c.querySelector('.c'); if (!chip) continue
      const t = (chip.innerText || '').trim(); const mk = c.querySelector('.mk')
      out.push(`${id.slice(5, -11)} ${d.slice(5)} ${t}${mk ? '[' + mk.innerText.trim() + ']' : ''} ${String(chip.className).replace(/^c ?/, '')}`)
    }
    return out
  }, m.slice(0, 7))
  console.log(m.slice(0, 7), got.length, '\n  ' + got.join('\n  '))
}
await browser.close()
