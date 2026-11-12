/* rcsb-w2-n6 v2 — W2 N6: where else the sentence is. Monday take-off 12:00 no landing; Tuesday line; then the crew list's reason, the ALL AVAIL window's reason, the tight-turn note.
   usage: node scripts/handpass/rcsb/w2/rcsb-w2-n6.mjs [pc|phone] */
const KIND = process.argv[2] || 'pc'
const C = await import('./rcsb-w2-common.mjs')
C.setShots(`N6-${KIND}`)
console.log('rcsb-w2-n6 v2', KIND, process.env.HP_SHOTS)
const Q = await C.load()
const { R, X, L, sleep } = Q
const j = C.j
const w = await R.world(KIND)
const { page } = w
const P = KIND === 'phone' ? 'p-' : 'd-'
const id = w.ID('Vandal'), MON = 0, TUE = 1
const out = { kind: KIND }
await L.board(page, MON)
const gm = await X.addWave(w, MON, '')
await X.typeIn(w, `[data-bfld="ff:${MON}.${gm}.0.to"]`, '12:00')
await X.seatPhoneAware(w, `[data-slot="${MON}.${gm}.0.0.p"]`, id)
await L.closeBoard(page)
await L.board(page, TUE)
const gt = await X.addWave(w, TUE, '')
await X.typeIn(w, `[data-bfld="ff:${TUE}.${gt}.0.to"]`, '01:00')
// 1) the crew list while Tuesday's empty front seat is armed (Vandal not yet on Tuesday)
await X.ensureRoster(w)
await X.press(w, `[data-slot="${TUE}.${gt}.0.0.p"]`); await sleep(500)
out.armed = await page.evaluate(() => window.ARM && window.ARM.key)
console.log('armed', out.armed)
out.rosterPuck = await page.evaluate(i => { const e = document.querySelector(`#sbRoster .rpuck[data-person="${i}"]`); return e ? { cls: e.className.replace(/\s+/g, ' '), title: e.title, text: e.innerText.replace(/\s+/g, ' '), html: e.outerHTML.slice(0, 900), vis: !!e.offsetWidth } : null }, id)
console.log('roster puck', j(out.rosterPuck))
await R.shot(page, P + '02-armed-whole')
const rp = page.locator(`#sbRoster .rpuck[data-person="${id}"]:visible`).first()
if (await rp.count()) { await rp.evaluate(e => e.scrollIntoView({ block: 'center' })); await sleep(250); await X.pic(page, P + '02-armed-roster-vandal', `#sbRoster .rpuck[data-person="${id}"]`, { pad: 120 }) }
out.rosterPlaceholder = await page.evaluate(() => [...document.querySelectorAll('#sbRoster .rpuck[data-person="allavail"], #sbRoster .rpuck[data-person="all"]')].filter(e => e.offsetWidth).map(e => e.innerText.replace(/\s+/g, ' ') + ' | ' + e.title))
console.log('placeholders in roster', j(out.rosterPlaceholder))
await page.evaluate(() => document.querySelector('#schedBoard [data-disarm]')?.click()); await sleep(300)
await X.closeRoster(w)
// 2) seat him and read the tight turn and the breach
await X.seatPhoneAware(w, `[data-slot="${TUE}.${gt}.0.0.p"]`, id)
const tueSet = async to => { await X.typeIn(w, `[data-bfld="ff:${TUE}.${gt}.0.to"]`, to); return (await X.boardWarn(page, w)).items.filter(t => t.includes('Vandal')) }
out.t0430 = await tueSet('04:30'); console.log('04:30', j(out.t0430))
await R.shot(page, P + '01-tight-0430-board')
{ const sel = KIND === 'phone' ? '#schedBoard #sbWarn' : '#schedBoard .sb-warn'; if (await page.locator(sel + ':visible').count()) await X.pic(page, P + '01-tight-0430-issues', sel, { pad: 6 }) }
out.t0400 = await tueSet('04:00'); console.log('04:00', j(out.t0400))
// 3) a Common Programme row on Tuesday
const n0 = await page.evaluate(d => window.DAYS[d].allhands.length, TUE)
await X.press(w, `[data-padd="${TUE}"]`); await sleep(600)
out.ap = await page.evaluate(d => { const keys = new Set(); document.querySelectorAll('#schedBoard [data-bfld], #schedBoard [data-fill]').forEach(e => { if (!e.offsetWidth) return; const k = e.dataset.bfld || e.dataset.fill; if (k && /^a[a-z]?:/.test(k) && k.includes(':' + d + '.')) keys.add(k) }); return [...keys] }, TUE)
console.log('programme keys', j(out.ap), 'rows before', n0)
await R.shot(page, P + '03-programme-row-added')
const ri = n0
const row = await page.evaluate(([d, r]) => window.DAYS[d].allhands[r], [TUE, ri])
console.log('new row', j(row))
await X.typeIn(w, `[data-bfld="ap:${TUE}.${ri}.prog"]`, 'WINDOWTEST')
await X.typeIn(w, `[data-bfld="ap:${TUE}.${ri}.str"]`, '01:00')
await X.typeIn(w, `[data-bfld="ap:${TUE}.${ri}.end"]`, '02:00')
console.log('row after typing', j(await page.evaluate(([d, r]) => window.DAYS[d].allhands[r], [TUE, ri])))
// seat ALL AVAIL on it
await X.ensureRoster(w)
await X.press(w, `[data-fill="a:${TUE}.${ri}.+"]`); await sleep(500)
console.log('armed', await page.evaluate(() => window.ARM && window.ARM.key))
const aa = page.locator('#sbRoster .rpuck[data-person="allavail"]:visible').first()
if (await aa.count()) { await C.hit(w, aa); await sleep(700) } else console.log('NO ALL AVAIL puck in the crew list')
await page.evaluate(() => document.querySelector('#schedBoard [data-disarm]')?.click()); await X.closeRoster(w)
out.rowAfterSeat = await page.evaluate(([d, r]) => JSON.stringify(window.DAYS[d].allhands[r]), [TUE, ri])
console.log('row after seating', out.rowAfterSeat)
await R.shot(page, P + '04-programme-row-allavail')
// open the ALL AVAIL window: tap the placeholder puck on the row
out.chipHtml = await page.evaluate(([d, r]) => { const s = document.querySelector(`#schedBoard [data-fill="a:${d}.${r}.+"]`); const p = s && s.closest('td, .ppl, div'); return p ? p.outerHTML.slice(0, 900) : 'no slot' }, [TUE, ri])
console.log('row people html', out.chipHtml)
const chip = page.locator(`#schedBoard [data-fill="a:${TUE}.${ri}.+"] .oilcount:visible`).first()
console.log('chips', await chip.count())
const pk = chip
if (await pk.count()) {
  await pk.evaluate(e => e.scrollIntoView({ block: 'center' })); await sleep(250)
  await C.hit(w, pk); await sleep(900)
  await R.shot(page, P + '05-allavail-tapped')
  out.win = await page.evaluate(() => { const els = [...document.querySelectorAll('[role=dialog], .modal-box, .aawin, #aaWin, [class*=aawin], [class*=allav], [class*=availwin]')].filter(e => e.offsetWidth); return els.map(e => e.id + '.' + String(e.className).slice(0, 40) + ' | ' + e.innerText.replace(/[\s ]+/g, ' ').slice(0, 1200)).slice(0, 4) })
  console.log('window', j(out.win))
  out.winFull = await page.evaluate(() => {
    const h = [...document.querySelectorAll('*')].find(e => e.offsetWidth && /^Who.s available/.test((e.innerText || '').trim()) && e.children.length < 3)
    if (!h) return 'no window heading'
    let el = h; while (el.parentElement && el.innerText.length < 700) el = el.parentElement
    const t = el.innerText.replace(/[\s ]+/g, ' ')
    const i = t.indexOf('Vandal')
    return { cls: String(el.className), vandal: i >= 0 ? t.slice(i, i + 420) : 'NO Vandal', flagged: (t.match(/\d+ men? are flagged/) || [''])[0] }
  })
  console.log('Window full', j(out.winFull))
  await page.evaluate(() => { const e = [...document.querySelectorAll('*')].filter(x => x.offsetWidth && x.children.length === 0 && /Crew rest breach/.test(x.innerText || '') && !x.closest('#sbSide'))[0]; if (e) e.scrollIntoView({ block: 'center' }) })
  await sleep(400)
  await R.shot(page, P + '05-allavail-vandal-reason')
}
out.errors = w.errors
console.log('errors', j(w.errors))
const { writeFileSync } = await import('node:fs')
writeFileSync(process.env.HP_SHOTS + '/out.json', JSON.stringify(out, null, 1))
await w.browser.close()
