/* www w2 probe 1: explore the board roster, ALL AVAIL on Friday. */
const PHONE = process.env.PHONE === '1'
process.env.WWW_WHO = 'w2'
process.env.WWW_RUN ||= 'p1-' + (PHONE ? 'p' : 'd')
const X = await import('./www-lib.mjs')
const { say, sleep, FRI } = X
say('www-w2-p1 v1')
const w = await X.open({ phone: PHONE })
const { page, P } = w
await X.board(w, FRI)
const wi = await X.addWave(w, FRI, '')
await X.typeIn(w, `[data-bfld="ff:${FRI}.${wi}.0.to"]`, '12:00')
await X.typeIn(w, `[data-bfld="ff:${FRI}.${wi}.0.msn"]`, 'VL BFM')
await X.ensureRoster(w)
await X.pic(w, `p1-board-${P}`)
const ro = await page.evaluate(() => {
  const r = document.querySelector('#sbRoster'); if (!r) return 'NO ROSTER'
  return { text: r.innerText.replace(/\s+/g, ' ').slice(0, 1500), pucks: [...r.querySelectorAll('.rpuck')].length }
})
say('ROSTER', JSON.stringify(ro))
// find ALL AVAIL-ish controls
const ctl = await page.evaluate(() => [...document.querySelectorAll('#schedBoard *')].filter(e => e.getBoundingClientRect().width > 0 && /ALL/.test(e.innerText || '') && (e.innerText || '').length < 30 && e.children.length < 3).map(e => ({ tag: e.tagName, id: e.id, cls: String(e.className).slice(0, 40), t: e.innerText.trim(), d: Object.keys(e.dataset).join(',') })).slice(0, 20))
say('ALLCTL', JSON.stringify(ctl))
const rp = await page.evaluate(() => [...document.querySelectorAll('#sbRoster .rpuck')].slice(0, 5).map(e => e.outerHTML.slice(0, 300)))
say('RPUCK', JSON.stringify(rp))
await X.fin(w)
