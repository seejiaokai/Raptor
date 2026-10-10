import * as C from './it-C-lib.mjs'
const { row, sleep } = C
const size = process.argv[2] || 'desk'
const w = await C.world(size, 'ad', { fresh: false })
const p = w.page
const rg = await C.pid(p, 'Ranger'), sb = await C.pid(p, 'Saber'), bs = await C.pid(p, 'Basher')
const LONG = '1234567890123456789012345678901234567890'
const pics = []
await C.fileNew(w, { iso: '2026-07-18', type: 'Event', person: rg, title: 'Weekend exercise', s: '08:00', e: '12:00', rmk: 'o59a', oil: 'yes' })
await C.fileNew(w, { iso: '2026-07-18', type: 'Event', person: sb, s: '08:00', e: '12:00', rmk: 'o59b', oil: 'yes' })
await C.fileNew(w, { iso: '2026-07-18', type: 'Event', person: bs, title: LONG, s: '08:00', e: '12:00', rmk: 'o59c', oil: 'yes' })
await C.openBoard(w, 5)
const pub = await C.publishOpenDay(w, 5)
console.log('PUB', JSON.stringify(pub))
await C.oilMode(p, true)
const toRows = async () => { await p.evaluate(() => { const rows = [...document.querySelectorAll('#schedBoard .sb-arow')].filter(r => r.offsetParent && !r.closest('.pinp') && (r.querySelector('.puck[data-person="bane"], .puck[data-person="stiff"], .puck[data-person="glass"], .seat.oilpk')) && /(WEEKEND|EVENT|1234567890)/i.test(r.innerText + ' ' + [...r.querySelectorAll('input,textarea')].map(x => x.value).join(' '))); if (rows[0]) rows[0].scrollIntoView({ block: 'center' }) }); await sleep(400) }
const toInputs = async () => { await p.evaluate(() => { const r = [...document.querySelectorAll('#schedBoard .inprow, #schedBoard .sbi-row')].find(r => r.offsetParent); if (r) r.scrollIntoView({ block: 'center' }) }); await sleep(400) }
const readEarn = () => p.evaluate(() => {
  const root = document.querySelector('#schedBoard')
  const cells = [...root.querySelectorAll('.oilitem')].filter(e => e.offsetParent).map(e => { const q = e.getBoundingClientRect(); const par = e.parentElement.getBoundingClientRect(); return { text: e.innerText.trim(), cls: e.className, title: e.title, w: Math.round(q.width), clip: e.scrollWidth > e.clientWidth + 1, outOfParent: q.right > par.right + 1 || q.left < par.left - 1 } })
  const rows = [...root.querySelectorAll('.sb-arow')].filter(r => r.offsetParent && (r.querySelector('.puck[data-person="bane"], .puck[data-person="stiff"], .puck[data-person="glass"], .seat.oilpk')) && /(WEEKEND|EVENT|1234567890)/i.test(r.innerText + ' ' + [...r.querySelectorAll('input,textarea')].map(x => x.value).join(' '))).map(r => ({ ground: !r.closest('.pinp'), name: ((r.querySelector('[data-bfld$=".prog"]') || {}).value) || ((r.querySelector('.oilitem') || {}).textContent) || null, kind: (r.querySelector('.nm-kind') || {}).textContent || null, seats: [...r.querySelectorAll('.seat.oilpk')].map(x => x.dataset.oilp + ':' + (['on', 'off', 'inert'].find(k => x.classList.contains(k)) || '?')) }))
  return { cells, rows }
})
const e1 = await readEarn(); console.log(JSON.stringify(e1))
const ring = async () => p.evaluate(() => [...document.querySelectorAll('#schedBoard .seat.oilpk')].filter(s => s.offsetParent).map(s => s.dataset.oilp + ':' + (['on', 'off', 'inert'].find(k => s.classList.contains(k)) || '?')))
const seats0 = await ring()
await toRows(); pics.push(await C.pic(w, 's59-oilearn-before')); await toInputs(); pics.push(await C.pic(w, 's59-oilearn-inputs-panel')); await toRows()
// operate Ranger's earning control
const seat = p.locator(`#schedBoard .seat.oilpk[data-oilp="${rg}"]`).first()
let operated = null
if (await seat.count()) { await seat.scrollIntoViewIfNeeded(); await C.press(w, seat); await sleep(700); operated = await ring() }
await toRows(); pics.push(await C.pic(w, 's59-oilearn-after-tap'))
const recs = () => p.evaluate(() => window.INPUTS.filter(x => /^o59/.test(x.remarks)).map(x => ({ r: x.remarks, p: window.PEOPLE[x.person].cs, type: x.type, title: x.title || null, oil: x.oil == null ? null : x.oil })).sort((a, b) => a.r.localeCompare(b.r)))
const r1 = await recs()
await C.oilMode(p, false)
await toRows(); pics.push(await C.pic(w, 's59-normal-rows'))
const normalKinds = await p.evaluate(() => [...document.querySelectorAll('#schedBoard .sb-arow')].filter(r => r.offsetParent && !r.closest('.pinp') && (r.querySelector('.puck[data-person="bane"], .puck[data-person="stiff"], .puck[data-person="glass"]')) && /(WEEKEND|EVENT|1234567890)/i.test(r.innerText + ' ' + [...r.querySelectorAll('input,textarea')].map(x => x.value).join(' '))).map(r => (((r.querySelector('[data-bfld$=".prog"]') || {}).value) || '?') + ' / ' + ((r.querySelector('.nm-kind') || {}).textContent || 'no kind tag')))
await C.closeBoard(p)
// reopen the input
const A = (await C.recAll(p, { remarks: 'o59a' }))[0]
await C.openSaved(w, '2026-07-18', A.iid)
const info = await C.winInfo(p)
pics.push(await C.pic(w, 's59-reopened'))
await C.closeWins(p)
// the 40-character title, alignment again
await C.winRetitle(w, '2026-07-18', A.iid, { title: LONG })
await C.openBoard(w, 5); await C.oilMode(p, true)
const e2 = await readEarn(); console.log(JSON.stringify(e2))
await toRows(); pics.push(await C.pic(w, 's59-oilearn-long'))
await C.oilMode(p, false); await C.closeBoard(p)
const r2 = await recs()
const names = e1.cells.map(c => c.text)
const nameOk = names.some(t => /weekend exercise/i.test(t)) && names.some(t => /^event$/i.test(t))
const clip = c => c.filter(x => x.clip || x.outOfParent).map(x => x.text)
const sameOthers = JSON.stringify(r1.filter(x => x.r !== 'o59a')) === JSON.stringify(r2.filter(x => x.r !== 'o59a'))
const groundKind = e1.rows.filter(r => r.ground).map(r => r.kind)
const ok = pub.published && nameOk && groundKind.some(k => k === 'Event') && r1.find(x => x.r === 'o59a').title === 'Weekend exercise' && r1.find(x => x.r === 'o59a').type === 'Event' && info.title === 'Weekend exercise' && clip(e1.cells).length === 0 && clip(e2.cells).length === 0
row(59, size, 'admin', ok ? 'PASS' : 'CHECK',
  `Sat 18 Jul published (${pub.published ? pub.kind + ' ' + pub.version : pub.why}); Ranger Event titled "Weekend exercise", Saber untitled Event, Basher Event titled with 40 characters. In OIL Earn the item cells read ${JSON.stringify(names)} and the Ground Programme rows' kind tags in the mode ${JSON.stringify(e1.rows.filter(r => r.ground).map(r => r.kind || 'none'))} (Personal Inputs cards: ${JSON.stringify(e1.rows.filter(r => !r.ground).map(r => r.kind || 'none'))}); same rows with the mode OFF: ${JSON.stringify(normalKinds)}. Switches before ${JSON.stringify(seats0)} -> after tapping Ranger ${JSON.stringify(operated)}. Records after the tap: ${JSON.stringify(r1)}; after leaving the mode, reopened input shows Title "${info.title}" Type "${info.type}". 40-character title set on Ranger's input and the mode re-entered: cells ${JSON.stringify(e2.cells.map(c => c.text + (c.clip ? ' [CLIPPED]' : '') + (c.outOfParent ? ' [OUT]' : '')))}; others unchanged by the tap or the retitle: ${sameOthers}`, pics)
await C.finish(w, 's59-' + size)
