/* www W3 fix 6 — the chips' names. usage: [PHONE=1] node scripts/handpass/www/www-w3-s6.mjs */
const PHONE = process.env.PHONE === '1'
process.env.WWW_RUN ||= 's6-' + (PHONE ? 'p' : 'd')
const H = await import('./www-w3-lib.mjs')
const { X, say, sleep, L } = H
const size = PHONE ? '402' : '1536'
const P = PHONE ? 'p' : 'd'
const w = await X.open({ phone: PHONE })
const { page } = w
const R = (did, exp, saw, v, pic) => X.row('6 chips names', size, did, exp, saw, v, pic)
const key = cs => page.evaluate(c => Object.keys(window.PEOPLE).find(k => window.PEOPLE[k].cs === c), cs)
const A = await key('Comet'), B = await key('Blade')
await X.board(w, X.FRI)
await H.frFlight(w, X.FRI, '17:00', '', A, 'BRF FLT')
await H.gRow(w, X.FRI, 'BRIEFING', '15:00', '15:30', A)
await H.gRow(w, X.FRI, 'EARLY TASK', '06:00', '07:00', B)
await H.frFlight(w, X.FRI, '16:00', '', B, 'LD FLT')
const chipsOf = async () => page.evaluate(() => [...document.querySelectorAll('#schedBoard .seat, #schedBoard .puck')].filter(e => e.classList.contains('puck') && e.getBoundingClientRect().width > 0 && !e.closest('#sbRoster')).map(e => (e.innerText.replace(/\s+/g, ' ').trim()) + ' :: ' + [...e.querySelectorAll('.lchip')].map(c => c.innerText.trim() + '=' + c.title).join(',') + ' :: puck title ' + e.title))
const C = await key('Cinch'), D = await key('Basher')
await H.frFlight(w, X.FRI, '10:00', '11:00', C, 'DBR FLT')
await H.gRow(w, X.FRI, 'BRIEFING', '11:45', '12:05', C)
await H.frFlight(w, X.FRI, '12:30', '13:30', D, 'WS FLT')
const cs = await chipsOf()
R('Cinch: flight 10:00-11:00 + BRIEFING 11:45-12:05 (in the debrief window); Basher (a WSO) in a front seat', 'Cinch chip "Misses flight debrief"; Basher chip "Wrong seat"', JSON.stringify(cs.filter(c => /Cinch|Basher/.test(c))), cs.some(c => /Cinch.*=Misses flight debrief/.test(c)) && cs.some(c => /Basher.*=Wrong seat/.test(c)) ? 'PASS' : 'FAIL', `6-a-chips-${P}.png`)
await X.pic(w, `6-a-chips-${P}`)
const bw = await X.boardWarn(w)
R('Comet: flight T/O 17:00 + BRIEFING 15:00-15:30 (inside the brief window); Blade: ground 06:00-07:00 + flight T/O 16:00; the pucks, their chips and titles', 'Comet\'s chip title "Misses flight brief"; Blade\'s grey chip "Long day (>12h)"', JSON.stringify({ pucks: cs.filter(c => /Comet|Blade/.test(c)), lines: bw.filter(l => /Comet|Blade/.test(l)) }), cs.some(c => /Comet.*=Misses flight brief/.test(c)) && cs.some(c => /Blade.*=Long day \(>12h\)/.test(c)) ? 'PASS' : 'FAIL', `6-a-chips-${P}.png`)
if (!PHONE) {
  const ch = page.locator('#schedBoard .puck', { hasText: 'Comet' }).locator('.lchip').first()
  if (await ch.count()) { await ch.hover(); await sleep(1300); await page.screenshot({ path: `${X.SHOTS}/6-b-hover-${P}.png` }); R('hovered the chip on Comet\'s puck', 'title reads "Misses flight brief"', await ch.getAttribute('title'), (await ch.getAttribute('title')) === 'Misses flight brief' ? 'PASS' : 'FAIL', `6-b-hover-${P}.png`) }
}
await X.closeBoard(w)
// Edit Schedule's Legend fold, read whole
const lg = page.locator('button:visible, summary:visible, [role=button]:visible').filter({ hasText: /^\s*Legend/ }).first()
let legTxt = 'NO LEGEND BUTTON'
if (await lg.count()) { await lg.click(); await sleep(500); legTxt = await page.evaluate(() => { const e = [...document.querySelectorAll('#shell *')].filter(x => x.getBoundingClientRect().width > 0 && /long work day/i.test(x.innerText || '')); const leaf = e.filter(x => !e.some(o => o !== x && x.contains(o))); const el = leaf[0] && leaf[0].parentElement.parentElement; return el ? el.innerText.replace(/\s+/g, ' ') : '' }) }
await X.pic(w, `6-c-editsched-legend-${P}`)
R('Edit Schedule: opened the Legend fold; its flags', 'RECORD (this fold names flags by their long names)', legTxt.slice(0, 700), 'RECORDED', `6-c-editsched-legend-${P}.png`)
// the Logic page: every chip name drawn
await L.go(page, 'logic'); await sleep(700)
const need = ['Misses flight brief', 'Misses flight debrief', 'Misses sim brief', 'Misses sim debrief', 'Wrong seat', 'Long day (>12h)', 'Days in a row']
const drawn = await page.evaluate(n => { const out = {}; for (const s of n) { const e = [...document.querySelectorAll('#shell *')].filter(x => x.getBoundingClientRect().width > 0 && (x.title === s || (x.children.length === 0 && (x.innerText || '').trim() === s))); out[s] = e.map(x => x.tagName + '.' + String(x.className).slice(0, 20) + (x.title === s ? '[title]' : '[text]')).slice(0, 3) } return out }, need)
await X.pic(w, `6-d-logic-${P}`)
R('the Logic page: every name drawn as an element\'s own title or text', need.join(' | '), JSON.stringify(drawn), 'RECORDED', `6-d-logic-${P}.png`)
await X.fin(w)
