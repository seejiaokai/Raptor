// Re-walk item 5: the Inputs list and the Inputs calendar opened day: paperclip / "No document" / neither.
// usage: node lw-m3-rewalk-r5.mjs <phone|desktop>
import * as L from './lw-m3-rewalk-lib.mjs'
const size = process.argv[2] || 'phone'
const tag = `r5-${size === 'phone' ? 'ph' : 'dk'}`
console.log('lw-m3-rewalk-r5 v1', size, tag)
L.clearPrefix(tag)
const w = await L.newCtx(size, 'chromium')
const P = w.page
await L.signInPlain(w, 'admin')
await L.gotoMonth(w, 'JAN'); await P.waitForTimeout(700)
// leave WITH a file: Ranger 20-22 Jan, LL, ticked
await L.openCell(w, 'bane', '2026-01-20')
await L.press(w, L.T('span-range')); await P.waitForTimeout(400)
await L.press(w, L.T('span-day-2026-01-20')); await P.waitForTimeout(200)
await L.press(w, L.T('span-day-2026-01-22')); await P.waitForTimeout(300)
await L.setDoc(w)
console.log('chips', await P.evaluate(() => [...document.querySelectorAll('[data-testid="bid-doc-row"] .docchip')].map(e => e.innerText.trim())))
console.log('approve ticked', (await L.winGeom(P)).tick.map(t => t.checked))
console.log('placed with file', await L.placeLeave(w, 'LL'))
await L.reachCell(w, 'bane', '2026-01-20'); console.log('cell 20 Jan', JSON.stringify((await L.boxes(w, 'bane', '2026-01-20'))?.text))
// a bare leave: Ranger 27 Jan LL ticked, no file
await L.openCellR(w, 'bane', '2026-01-27')
console.log('placed bare', await L.placeLeave(w, 'LL'))
await L.reachCell(w, 'bane', '2026-01-27'); console.log('cell 27 Jan', JSON.stringify((await L.boxes(w, 'bane', '2026-01-27'))?.text))
// the Inputs list
await P.evaluate(() => window.go('inputs')); await P.waitForTimeout(1000)
await L.press(w, '#inListBtn'); await P.waitForTimeout(600)
await L.press(w, '#inRangeBtn'); await P.waitForTimeout(500)
await P.locator('#inRangeAll').click(); await P.waitForTimeout(800)
const cards = () => P.evaluate(() => [...document.querySelectorAll('#page-inputs tr[data-iid], #page-inputs .icard[data-iid]')].map(r => ({ iid: r.dataset.iid, card: r.classList.contains('icard'), kind: (r.querySelector('.icard-kind, .intag')?.innerText || '').replace(/\s+/g, ' ').trim().toUpperCase(), clip: r.querySelectorAll('.rclip, .icard-doc').length, nodoc: r.querySelectorAll('.in-nodoc, .icard-nodoc').length, text: r.innerText.replace(/\s+/g, ' ').trim().slice(0, 90) })))
const all = await cards()
console.log('rows', all.length, 'with clip', all.filter(c => c.clip).length, 'with nodoc', all.filter(c => c.nodoc).length)
const LEAVE = new Set(['LL', 'OL', 'OIL', 'CCL', 'PL', 'FCL', 'EL', 'CL']), MED = new Set(['HL', 'OML', 'ATT C', 'ATT B', 'UPCHIT'])
const byKind = {}; for (const c of all) { const k = c.kind; (byKind[k] ||= { n: 0, clip: 0, nodoc: 0 }); byKind[k].n++; byKind[k].clip += c.clip ? 1 : 0; byKind[k].nodoc += c.nodoc ? 1 : 0 }
console.log('by kind', JSON.stringify(byKind))
// search Ranger to bring the two cards up
if (!(await L.vis(P, '#inFSearch'))) { await L.press(w, '#inFiltersBtn'); await P.waitForTimeout(500) }
await P.fill('#inFSearch', 'Ranger'); await P.waitForTimeout(700)
const rr = await cards()
console.log('Ranger rows', JSON.stringify(rr.filter(c => /LL/.test(c.kind + c.text)).map(c => [c.kind, c.clip, c.nodoc, c.text.slice(0, 60)])))
await P.evaluate(() => { const c = [...document.querySelectorAll('#page-inputs .icard[data-iid], #page-inputs tr[data-iid]')].find(e => e.querySelector('.rclip, .icard-doc')); c && c.scrollIntoView({ block: 'center' }) }); await P.waitForTimeout(400)
await L.shot(w, tag + '-01-list-ranger')
const withClip = rr.find(c => c.clip), bareLL = rr.find(c => !c.clip && c.nodoc)
L.rec(`5 ${size} list: leave with a file shows a paperclip`, size, withClip && !withClip.nodoc ? 'PASS' : 'FAIL', `Ranger LL 20-22 Jan row: clip ${withClip?.clip} nodoc ${withClip?.nodoc}; "${withClip?.text}"`, [tag + '-01-list-ranger'])
L.rec(`5 ${size} list: bare leave says "No document"`, size, bareLL ? 'PASS' : 'FAIL', `Ranger LL 27 Jan row: "${bareLL?.text}"`, [tag + '-01-list-ranger'])
// all dates, no search: kinds
await P.fill('#inFSearch', ''); await P.waitForTimeout(500)
const kindsAll = await cards()
const leaveRows = kindsAll.filter(c => LEAVE.has(c.kind)), medRows = kindsAll.filter(c => MED.has(c.kind)), otherRows = kindsAll.filter(c => !LEAVE.has(c.kind) && !MED.has(c.kind))
const bare = r => r.filter(c => !c.clip)
const isoOf = iid => P.evaluate(i => { let p = document.querySelector(`[data-iid="${i}"]`); while (p && !(p.classList.contains('icard-day'))) p = p.previousElementSibling; return p ? p.dataset.iso : null }, iid)
const medIid = bare(medRows)[0]?.iid, dutyIid = otherRows[0]?.iid
const medIso = medIid ? await isoOf(medIid) : null, dutyIso = dutyIid ? await isoOf(dutyIid) : null
console.log('first bare medical', medIso, bare(medRows)[0]?.kind, '| first duty', dutyIso, otherRows[0]?.kind)
console.log(`leave rows ${leaveRows.length}: bare ${bare(leaveRows).length}, nodoc on bare ${bare(leaveRows).filter(c => c.nodoc).length}, nodoc on clipped ${leaveRows.filter(c => c.clip && c.nodoc).length}`)
console.log(`medical rows ${medRows.length}: bare ${bare(medRows).length}, nodoc on bare ${bare(medRows).filter(c => c.nodoc).length}, clipped ${medRows.filter(c => c.clip).length}`)
console.log(`other rows ${otherRows.length}: nodoc ${otherRows.filter(c => c.nodoc).length}, clip ${otherRows.filter(c => c.clip).length}; kinds ${[...new Set(otherRows.map(c => c.kind))].join(',')}`)
L.rec(`5 ${size} list: every bare leave row "No document"`, size, leaveRows.length && bare(leaveRows).every(c => c.nodoc === 1) && leaveRows.filter(c => c.clip).every(c => !c.nodoc) ? 'PASS' : 'FAIL', `leave rows ${leaveRows.length}, bare ${bare(leaveRows).length}, of which "No document" ${bare(leaveRows).filter(c => c.nodoc).length}`, [tag + '-01-list-ranger'])
L.rec(`5 ${size} list: every bare medical row "No document"`, size, medRows.length && bare(medRows).every(c => c.nodoc === 1) ? 'PASS' : (medRows.length ? 'FAIL' : 'NOT RUN'), `medical rows ${medRows.length}, bare ${bare(medRows).length}, "No document" on ${bare(medRows).filter(c => c.nodoc).length}`, [])
L.rec(`5 ${size} list: a duty says neither`, size, otherRows.length && otherRows.every(c => !c.nodoc) ? 'PASS' : 'FAIL', `duty and other rows ${otherRows.length}: with "No document" ${otherRows.filter(c => c.nodoc).length}`, [])
// pictures by kind: scroll to first medical, first duty
for (const [nm, set] of [['medical', MED], ['duty', null]]) {
  const iid = (set ? kindsAll.find(c => set.has(c.kind)) : otherRows[0])?.iid
  if (!iid) continue
  await P.evaluate(i => { document.querySelector(`[data-iid="${i}"]`)?.scrollIntoView({ block: 'center' }) }, iid); await P.waitForTimeout(400)
  await L.shot(w, tag + '-02-list-' + nm)
}
// the paperclip opens the document (tap)
await P.fill('#inFSearch', 'Ranger'); await P.waitForTimeout(600)
const clipSel = '#page-inputs .rclip, #page-inputs .icard-doc'
console.log('clips present', await P.locator(clipSel).count())
if (await P.locator(clipSel).count()) {
  await P.locator(clipSel).first().scrollIntoViewIfNeeded()
  const bb = await P.locator(clipSel).first().boundingBox(); console.log('clip box', JSON.stringify(bb))
  await L.press(w, clipSel, w.phone ? tag + '-03-clip-tap-q' : null); await P.waitForTimeout(800)
  await L.shot(w, tag + '-04-after-clip')
  const opened = await P.evaluate(() => ({ img: !!document.querySelector('img[src^="blob:"], img[src^="data:"], iframe, embed, object'), wins: [...document.querySelectorAll('.floatwin, .docview, [role=dialog]')].map(e => e.className + ' :: ' + e.innerText.replace(/\s+/g, ' ').slice(0, 80)) }))
  console.log('after clip tap', JSON.stringify(opened))
  L.rec(`5 ${size} list: a tap on the paperclip opens the document`, size, opened.img || opened.wins.length ? 'PASS' : 'FAIL', `after the tap: ${JSON.stringify(opened)}`, w.phone ? [tag + '-03-clip-tap-q', tag + '-04-after-clip'] : [tag + '-04-after-clip'])
}
// Calendar: the opened day
await P.keyboard.press('Escape'); await P.waitForTimeout(300)
await L.press(w, '#inCalBtn'); await P.waitForTimeout(900)
const title = () => P.evaluate(() => (document.querySelector('#page-inputs .ib-top')?.innerText || '').replace(/\s+/g, ' '))
const MONS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']
async function calTo(iso) {
  console.log('title now:', JSON.stringify((await title()).slice(0, 90)))
  const want = Number(iso.slice(0, 4)) * 12 + Number(iso.slice(5, 7)) - 1
  for (let i = 0; i < 30; i++) {
    const m = (await title()).match(/(JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC)[A-Z]* (20\d\d)/i)
    if (!m) break
    const cur = Number(m[2]) * 12 + MONS.indexOf(m[1].toUpperCase())
    if (cur === want) return m[0]
    await L.press(w, cur > want ? '#icPrev' : '#icNext'); await P.waitForTimeout(300)
  }
  return null
}
await P.fill('#inFSearch', '').catch(() => {}); await P.waitForTimeout(500)
await calTo('2026-01-20')
const dayList = await P.evaluate(() => [...document.querySelectorAll('#page-inputs [data-icday]')].filter(e => !/no inputs/.test(e.getAttribute('aria-label') || '') && e.dataset.icday.startsWith('2026-01')).map(e => e.dataset.icday + ' ' + e.getAttribute('aria-label')))
console.log('January days with inputs', dayList.length, JSON.stringify(dayList))
const LEAVEK = new Set(['LL', 'OL', 'OIL', 'CCL', 'PL', 'FCL', 'EL', 'CL']), MEDK = new Set(['HL', 'OML', 'ATT C', 'ATT B', 'UPCHIT'])
const seen = []
let shotsDone = {}
for (const entry of dayList) {
  const iso = entry.slice(0, 10)
  const sel = `#page-inputs [data-icday="${iso}"]`
  await P.locator(sel).first().scrollIntoViewIfNeeded().catch(() => {})
  const nm = `${tag}-06-day-${iso.slice(5)}`
  await L.press(w, sel, w.phone ? nm + '-tap-q' : null); await P.waitForTimeout(700)
  const rows = await P.evaluate(() => [...document.querySelectorAll('[data-testid^="idy-row"]')].filter(e => e.getBoundingClientRect().height > 0).map(c => ({ kind: (c.querySelector('[data-testid="idy-kind"]')?.innerText || '').trim().toUpperCase(), clip: c.querySelectorAll('[data-testid="idy-doc"]').length, nodoc: c.querySelectorAll('[data-testid="idy-nodoc"]').length, text: c.innerText.replace(/\s+/g, ' ').trim().slice(0, 70) })))
  for (const r of rows) {
    const fam = LEAVEK.has(r.kind) ? 'leave' : MEDK.has(r.kind) ? 'medical' : 'duty'
    seen.push({ iso, fam, ...r })
    const key = fam + (r.clip ? '-clip' : r.nodoc ? '-nodoc' : '-none')
    if (!shotsDone[key]) { shotsDone[key] = true; await L.shot(w, `${tag}-07-day-${key}-${iso.slice(5)}`); shotsDone[key] = `${tag}-07-day-${key}-${iso.slice(5)}` }
  }
  await P.keyboard.press('Escape'); await P.waitForTimeout(300)
  if (await L.vis(P, '[data-testid="win-inputsday-x"]')) await L.press(w, '[data-testid="win-inputsday-x"]')
  await P.waitForTimeout(250)
}
const sum = {}
for (const r of seen) { const k = r.fam + (r.clip ? ' with a file' : ' bare'); (sum[k] ||= { n: 0, nodoc: 0, clip: 0 }); sum[k].n++; sum[k].nodoc += r.nodoc ? 1 : 0; sum[k].clip += r.clip ? 1 : 0 }
console.log('calendar day cards by family', JSON.stringify(sum))
const pic = fam => Object.entries(shotsDone).filter(([k, v]) => k.startsWith(fam) && typeof v === 'string').map(([k, v]) => v)
const fileCards = seen.filter(r => r.fam === 'leave' && r.clip), bareLeave = seen.filter(r => r.fam === 'leave' && !r.clip), bareMed = seen.filter(r => r.fam === 'medical' && !r.clip), duties = seen.filter(r => r.fam === 'duty')
L.rec(`5 ${size} calendar day: a leave with a file shows a paperclip`, size, fileCards.length && fileCards.every(r => !r.nodoc) ? 'PASS' : 'FAIL', `leave cards with a file ${fileCards.length}: ${fileCards.map(r => r.iso + ' ' + r.text).join(' / ')}`, pic('leave-clip'))
L.rec(`5 ${size} calendar day: a bare leave says "No document"`, size, bareLeave.length && bareLeave.every(r => r.nodoc) ? 'PASS' : 'FAIL', `bare leave cards ${bareLeave.length}, "No document" on ${bareLeave.filter(r => r.nodoc).length}`, pic('leave-nodoc'))
L.rec(`5 ${size} calendar day: a bare medical says "No document"`, size, bareMed.length ? (bareMed.every(r => r.nodoc) ? 'PASS' : 'FAIL') : 'NOT RUN', `bare medical cards ${bareMed.length}, "No document" on ${bareMed.filter(r => r.nodoc).length}`, pic('medical-nodoc'))
L.rec(`5 ${size} calendar day: a duty says neither`, size, duties.length && duties.every(r => !r.nodoc && !r.clip) ? 'PASS' : 'FAIL', `duty cards ${duties.length}, with a mark ${duties.filter(r => r.nodoc || r.clip).length}; kinds ${[...new Set(duties.map(r => r.kind))].join(',')}`, pic('duty'))
console.log('ERRORS', JSON.stringify(w.errs))
await L.closeBrowser()
