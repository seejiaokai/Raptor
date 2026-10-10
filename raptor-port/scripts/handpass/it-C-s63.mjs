import * as C from './it-C-lib.mjs'
const { row, sleep } = C
const size = 'desk'
const w = await C.world(size, 'ad', { fresh: false })
const p = w.page
const rg = await C.pid(p, 'Ranger')
const TXT = '<b>Ops</b> "A&B"', TXT2 = 'Ops <i>two</i> "C&D"'
const SAT = '2026-07-18', SUN = '2026-07-19'
const pics = [], seen = []
/* a surface: does it print the text literally, and did any markup become a real element? */
const lit = async (name, scopeSel) => {
  const r = await p.evaluate(([sel, t1, t2]) => {
    const root = sel ? document.querySelector(sel) : document.body
    if (!root) return { found: false, why: 'no such surface ' + sel, realMarkup: 0 }
    const txt = root.innerText || ''
    const real = [...document.querySelectorAll('b, i')].filter(e => (e.textContent === 'Ops' || e.textContent === 'two')).length
    return { found: txt.toLowerCase().includes(t1.toLowerCase()) || txt.toLowerCase().includes(t2.toLowerCase()), snippet: (txt.split('\n').find(l => l.includes('Ops')) || '').slice(0, 160), realMarkup: real }
  }, [scopeSel || null, TXT, TXT2])
  seen.push({ name, ...r }); console.log('SURFACE', name, JSON.stringify(r))
  return r
}
// 1. the OIL question, named person
await C.openNew(w, SAT)
await p.selectOption('#inpEditType', 'Event'); await p.selectOption('#inpEditPerson', rg); await C.setTimes(p, '08:00', '12:00')
await p.fill('input#inpEditTitle', TXT); await p.fill('#inpEditRmk', 'w63')
await C.saveWin(w)
const q1 = await C.qRead(p); const q1html = await p.evaluate(() => document.querySelector('[data-testid="oilconf"] .airpop-head').innerHTML)
await lit('OIL question heading (Ranger)', '[data-testid="oilconf"]'); pics.push(await C.pic(w, 's63-oil-question'))
await C.qAnswer(w, 'yes'); await C.closeWins(p)
// 2. an overlapping commitment
await C.fileNew(w, { iso: SAT, type: 'Meeting', person: rg, s: '09:00', e: '10:00', rmk: 'm63', oil: 'no' })
// 3. ALL AVAIL with the same text
await C.openNew(w, SUN)
await p.selectOption('#inpEditType', 'Event'); await p.selectOption('#inpEditPerson', 'allavail'); await C.setTimes(p, '08:00', '12:00')
await p.fill('input#inpEditTitle', TXT); await p.fill('#inpEditRmk', 'x63')
await C.saveWin(w)
const q2 = await C.qRead(p); const q2html = await p.evaluate(() => document.querySelector('[data-testid="oilconf"] .airpop-head').innerHTML)
await lit('OIL question heading (ALL AVAIL)', '[data-testid="oilconf"]')
await C.qAnswer(w, 'yes'); await C.closeWins(p)
const W = (await C.recAll(p, { remarks: 'w63' }))[0], X = (await C.recAll(p, { remarks: 'x63' }))[0]
console.log('RECS', JSON.stringify([W, X]))
// 4. the warning on the board, and publish
await C.openBoard(w, 5)
const wl = (await C.warnLines(p)).filter(x => x !== '✕').slice(0, 6); console.log('WARNLIST', JSON.stringify(wl))
await lit('warning list (Saturday board)', '#sbSide'); pics.push(await C.pic(w, 's63-warning'))
const pubS = await C.publishOpenDay(w, 5); await C.closeBoard(p)
await C.openBoard(w, 6); const pubU = await C.publishOpenDay(w, 6)
// 5. the ALL AVAIL count window
await C.openCount(w, X.iid)
const cw = await C.winState(p); await lit('ALL AVAIL count window', '.availwin'); pics.push(await C.pic(w, 's63-count-window'))
await C.closeCountWin(w); await C.closeBoard(p)
// 6. retitle after publishing -> To go out
await C.winRetitle(w, SAT, W.iid, { title: TXT2 })
await C.winRetitle(w, SUN, X.iid, { title: TXT2 })
await C.go(p, 'editsched')
const chipBtn = p.locator('#eWeek [data-pendlist="5"]:visible').first()
await chipBtn.evaluate(e => e.scrollIntoView({ block: 'center' })); await chipBtn.click(); await sleep(500)
const pl = await p.evaluate(() => { const e = document.querySelector('.chgwin'); return e ? e.innerText.replace(/\s+/g, ' ').trim() : '(closed)' })
await lit('To go out (pending list)', '.chgwin'); pics.push(await C.pic(w, 's63-to-go-out')); await p.locator('.chgwin .win-x').first().click().catch(() => {}); await sleep(400)
// 7. the changes window (history)
await C.go(p, 'editsched'); await p.locator('#histBtn').click(); await sleep(600)
await p.getByText(/^All changes/).first().click().catch(() => {}); await sleep(500)
const hist = (await p.locator('.chgwin').first().innerText()).replace(/\s+/g, ' ').trim()
await lit('changes window (history)', '.chgwin'); pics.push(await C.pic(w, 's63-history'))
await p.locator('.chgwin .win-x').first().click().catch(() => {}); await sleep(300)
// 8. the history bubble: hover the edited name box of the retitled request on Saturday's board
await C.openBoard(w, 5)
let bubble = null

const target = await p.evaluate(() => { const b = [...document.querySelectorAll('#schedBoard [data-bfld$=".prog"]')].find(x => /ops/i.test(x.value || x.textContent || '')); return b ? b.dataset.bfld : null })
if (target) {
  const el = p.locator(`#schedBoard [data-bfld="${target}"]`).first()
  await el.scrollIntoViewIfNeeded().catch(() => {})
  const box = await el.boundingBox()
  await p.mouse.move(box.x + box.width / 2, box.y + box.height / 2); await sleep(900)
  bubble = await p.evaluate(() => { const b = document.querySelector('.histbub'); return b && b.offsetParent !== null ? { text: b.innerText.replace(/s+/g, ' ').slice(0, 400), html: b.innerHTML.slice(0, 400) } : (b ? { text: '(hidden) ' + b.innerText.replace(/s+/g, ' ').slice(0, 300) } : null) })
  pics.push(await C.pic(w, 's63-history-bubble'))
}
await C.closeBoard(p)
console.log('BUBBLE', JSON.stringify(bubble))
seen.push({ name: 'history bubble', found: !!(bubble && /Ops/.test(bubble.text)), snippet: bubble && bubble.text.slice(0, 160), realMarkup: await p.evaluate(() => [...document.querySelectorAll('b, i')].filter(e => e.textContent === 'Ops' || e.textContent === 'two').length) })
// 9. the export
await C.go(p, 'inputs'); await p.locator('#inListBtn').click(); await sleep(400)
const [dl] = await Promise.all([p.waitForEvent('download', { timeout: 8000 }).catch(() => null), p.locator('#inExport').click()])
let csvLine = null, csvHead = null
if (dl) { const chunks = []; for await (const c of await dl.createReadStream()) chunks.push(c); const t = Buffer.concat(chunks).toString('utf8'); const ls = t.split(/\r?\n/); csvHead = ls[0]; csvLine = ls.filter(l => /Ops/.test(l)) }
console.log('CSV', csvHead, JSON.stringify(csvLine))
// 10. delete the Ranger input
await C.openSaved(w, SAT, W.iid)
await p.evaluate(() => { window.__t = []; new MutationObserver(ms => { for (const m of ms) for (const n of m.addedNodes) { const t = n.nodeType === 1 ? (n.innerText || '') : ''; if (t && /toast|snack|undo|removed|deleted/i.test((n.className || '') + ' ' + t)) window.__t.push(t.trim().slice(0, 200)) } }).observe(document.body, { childList: true, subtree: true }) })
await p.locator('#inpEditDel').click(); await sleep(500)
for (const sel of ['[data-testid="inped-delall-yes"]', '[data-testid="inped-delconfirm"]']) { const b = p.locator(`${sel}:visible`).first(); if (await b.count()) { await b.click(); await sleep(500) } }
const toast = await p.evaluate(() => (window.__t || []).join(' | ') + ' || ' + [...document.querySelectorAll('#toast, .toast, [role=status]')].map(e => e.innerText.trim()).filter(Boolean).join(' | '))
await C.closeWins(p)
const gone = (await C.recAll(p, { remarks: 'w63' })).length === 0
await C.go(p, 'editsched')
const chipBtn2 = p.locator('#eWeek [data-pendlist="5"]:visible').first()
let pl2 = '(no pending button)'
if (await chipBtn2.count()) { await chipBtn2.evaluate(e => e.scrollIntoView({ block: 'center' })); await chipBtn2.click(); await sleep(500); pl2 = await p.evaluate(() => { const e = document.querySelector('.chgwin'); return e ? e.innerText.replace(/\s+/g, ' ').trim() : '(closed)' }); await lit('To go out after deletion', '.chgwin'); pics.push(await C.pic(w, 's63-after-delete')); await p.locator('.chgwin .win-x').first().click().catch(() => {}); await sleep(400) }
await C.go(p, 'editsched'); await p.locator('#histBtn').click(); await sleep(600)
await p.getByText(/^All changes/).first().click().catch(() => {}); await sleep(500)
const hist2 = (await p.locator('.chgwin').first().innerText()).replace(/\s+/g, ' ').trim()
await lit('history after deletion', '.chgwin'); pics.push(await C.pic(w, 's63-history-after-delete'))
console.log('TOAST', toast, 'GONE', gone)
const q1ok = q1 && q1.head.includes(TXT) && q1html.includes('&lt;b&gt;')
const q2ok = q2 && q2.head.includes(TXT) && q2html.includes('&lt;b&gt;')
const noReal = seen.every(s => s.realMarkup === 0)
const allFound = seen.filter(s => !/after deletion/.test(s.name)).every(s => s.found)
row(63, size, 'admin', q1ok && q2ok && noReal && allFound ? 'PASS' : 'CHECK',
  `Text ${TXT} on a Sat Event for Ranger and an ALL AVAIL Event; overlapping Meeting; published both days; retitled to ${TXT2}; the Ranger input then deleted. OIL question headings: "${q1 && q1.head}" / "${q2 && q2.head}" (markup in the heading: ${JSON.stringify(q1html)}). Warning list: ${JSON.stringify(wl)}. Count window head: "${cw && cw.head}". To go out: "${String(pl).slice(0, 400)}". History: "${hist.slice(0, 500)}". History bubble: ${JSON.stringify(bubble)}. Export row(s): ${JSON.stringify(csvLine)} (header ${csvHead}). Deletion: toast "${toast}", record gone ${gone}; To go out after: "${String(pl2).slice(0, 300)}"; history after: "${hist2.slice(0, 500)}". Surfaces: ${seen.map(s => s.name + ': literal=' + s.found + ' realTags=' + s.realMarkup).join('; ')}`, pics)
await C.finish(w, 's63')
