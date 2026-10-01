/* [WARN-HIDE-KEPT] walker A — probe 4 (own world, nothing recorded): the nought-minute line, an AVALON wave and desk,
   where ALL AVAIL sits. Through the app's own controls; prints what the app then holds and draws. */
import { world, L, W, pic, warnsOf, pk, sum, addWave, addBlock, toastNow } from './wh-a-lib.mjs'
import { handPut } from './seat-lib.mjs'
const { browser, p, errors } = await world()
p.setDefaultTimeout(6000)
const short = w => w.map(x => `${x.ix} ${x.sev} ${x.code} ${JSON.stringify(x.who)} key=${x.key} :: ${x.msg.slice(0, 70)}`).join('\n   ')
try {
await L.go(p, 'editsched'); await W.showDay(p, 1)
/* (a) nought-minute */
await W.weekText(p, 'ff:1.0.0.ld', '08:40')
console.log('(a) toast:', await toastNow(p))
console.log('(a) Tue warnings:\n   ' + short(await warnsOf(p, 1)))
console.log('(a) time cells:', JSON.stringify(await p.evaluate(() => [...document.querySelectorAll('#eWeek .day[data-day="1"] .go .form')].slice(0, 2).map(f => [...f.querySelectorAll('.fcell.bto, .fcell.ld')].map(c => { const cs = getComputedStyle(c); const inner = [...c.querySelectorAll('[data-txt]')].map(t => { const s = getComputedStyle(t); return t.dataset.txt + '=' + t.innerText + ' cls=' + t.className + ' color=' + s.color + ' outline=' + s.outlineStyle + ' ' + s.outlineColor + ' shadow=' + s.boxShadow.slice(0, 50) + ' border=' + s.borderTopStyle + ' ' + s.borderTopColor + ' bg=' + s.backgroundColor }); return { cls: c.className, shadow: cs.boxShadow.slice(0, 60), border: cs.borderTopStyle + ' ' + cs.borderTopColor, inner } })))).slice(0, 2600))
await p.evaluate(() => { const e = document.querySelector('#eWeek .day[data-day="1"] .go .form'); e.scrollIntoView({ block: 'center', inline: 'nearest' }) }); await L.sleep(300)
await pic(p, 'probe4-nought')
/* (d) ALL AVAIL pucks seated anywhere this week? */
console.log('(d) ALL AVAIL seated:', JSON.stringify(await p.evaluate(() => [...document.querySelectorAll('#eWeek [data-person="allavail"], #eWeek [data-person="all"], #eWeek .oilcount, #eWeek [data-availwin], #eWeek .sentchip')].filter(e => e.offsetParent).map(e => { const d = e.closest('.day'); const sl = e.closest('[data-slot],[data-fill]'); return (d ? d.dataset.day : '?') + ':' + e.className + ':' + (sl ? (sl.dataset.slot || sl.dataset.fill) : '') + ':' + (e.getAttribute('title') || '').slice(0, 60) }).slice(0, 12))))
/* (b) an AVALON wave on Tuesday's board */
await W.boardOn(p, 1)
console.log('(b) add wave:', await addWave(p, 1, 'AVALON'), '| toast:', await toastNow(p))
const nw = await p.evaluate(() => window.DAYS[1].waves.length)
console.log('(b) waves:', nw, JSON.stringify(await p.evaluate(() => window.DAYS[1].waves.map(w => ({ label: w.label, sa: w.sa, keys: Object.keys(w).join(), f: (w.formations || []).map(f => ({ cs: f.cs, to: f.to, ld: f.ld, ac: (f.ac || f.acs || f.lines || []).length, keys: Object.keys(f).join() })) })).slice(2))).slice(0, 900))
console.log('(b) new wave seats:', JSON.stringify(await p.evaluate(() => { const g = [...document.querySelectorAll('#schedBoard .sb-go')].pop(); return { head: g.querySelector('.sb-ph, .sb-gh, :scope > div').innerText.replace(/\s+/g, ' ').slice(0, 200), seats: [...g.querySelectorAll('[data-slot], [data-fill]')].map(e => (e.dataset.slot || 'fill:' + e.dataset.fill) + '|' + e.className).slice(0, 20) } })))
await p.evaluate(() => { const g = [...document.querySelectorAll('#schedBoard .sb-go')].pop(); g.scrollIntoView({ block: 'center' }) }); await L.sleep(300)
await pic(p, 'probe4-avalon-wave')
const seats = await p.evaluate(() => { const g = [...document.querySelectorAll('#schedBoard .sb-go')].pop(); return [...g.querySelectorAll('[data-slot]')].map(e => e.dataset.slot) })
if (seats.length) {
  const r = await handPut(p, seats[0], 'sufa'); console.log('(b) put Grit on', seats[0], JSON.stringify(r))
  if (!r.took) { /* a drag from the board's crew list */
    try { const src = p.locator('#sbRoster .rpuck[data-person="sufa"]:visible').first(); const dst = p.locator(`#schedBoard [data-slot="${seats[0]}"]`).first(); await W.drag(p, src, dst); console.log('(b) drag: seat now holds', await p.evaluate(k => [...document.querySelectorAll(`#schedBoard [data-slot="${k}"] [data-person]`)].map(e => e.dataset.person), seats[0]), '| toast:', await toastNow(p)) } catch (e) { console.log('(b) drag failed', String(e).split('\n')[0]) }
  }
  console.log('(b) Tue warnings:\n   ' + short(await warnsOf(p, 1)))
  console.log('(b) Grit on board:', sum(await pk(p, '#schedBoard', 'sufa')))
  await pic(p, 'probe4-avalon-grit')
}
/* (c) an AVALON duty block */
console.log('(c) add block:', await addBlock(p, 1, 'AVALON'), '| toast:', await toastNow(p))
console.log('(c) dutywaves:', JSON.stringify(await p.evaluate(() => window.DAYS[1].dutywaves.map(w => ({ label: w.label, sa: w.sa, tpl: w.tpl, keys: Object.keys(w).join(), rows: (w.rows || []).map(r => (r.role || r.name) + ' ' + (r.str || '') + '-' + (r.end || '')) })).slice(2))).slice(0, 700))
const fills = await p.evaluate(() => [...document.querySelectorAll('#schedBoard .sb-panel.duty [data-fill]')].map(e => e.dataset.fill))
console.log('(c) duty fills:', fills.join(' '))
const avFill = fills.filter(f => f.startsWith('d:1.2.'))
if (avFill.length) {
  const r = await handPut(p, avFill[0], 'sufa'); console.log('(c) put Grit on', avFill[0], JSON.stringify(r))
  console.log('(c) Tue warnings:\n   ' + short(await warnsOf(p, 1)))
  console.log('(c) Grit on board:', sum(await pk(p, '#schedBoard', 'sufa')))
  await p.evaluate(k => { const e = document.querySelector(`#schedBoard [data-fill="${k}"]`); if (e) e.scrollIntoView({ block: 'center' }) }, avFill[0]); await L.sleep(300)
  await pic(p, 'probe4-avalon-desk')
}
} catch (e) { console.log('PROBE ERROR', String(e).split('\n').slice(0, 3).join(' / ')) }
console.log('ERRORS', JSON.stringify(errors))
await browser.close()
