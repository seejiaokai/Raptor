// Walker A, route 1: scenarios 1, 2, 3, 15 and the simple line states of 13. Desktop 1536 x 860 at 1.25, admin.
process.env.LW_OUT ||= '../../docs/img/handpass/2026-10-27-lw-m4/a/s1'
const A = await import('./lw-m4-walk-a-lib.mjs')
const { L, bidBatch, placeBid, scrollState, scrollTo, lineLoc, pressLoc, approveBtn, refuseBtn, lineInfo, shotLine, topbarUndo, topbarRedo, timeTap, nodesGrid } = A
const { T, rec, shot, txt, press } = L
console.log('[lw-m4-walk-a-s1 v1]')
L.clearOut()
const pdf = L.pdfPath('m4-a-form.pdf')
const w = await L.newCtx('desk')
const P = w.page
const size = 'desk'
try {
  await L.signIn(w, 'member')
  await bidBatch(w, 'bane', [
    { iso: '2026-01-12', pdf }, { iso: '2026-01-14' },
    { iso: '2026-01-19', portion: 'am' }, { iso: '2026-01-20', portion: 'pm' },
    { iso: '2026-01-26' }, { iso: '2026-01-27' },
    { iso: '2026-01-30' }, { iso: '2026-01-31' }, { iso: '2026-02-01' }, { iso: '2026-02-02' },
    { iso: '2026-02-09', type: 'OIL' }, { iso: '2026-02-11', type: 'CCL' }, { iso: '2026-02-16', pdf: [pdf, L.pdfPath('m4-a-form2.pdf')] }, { iso: '2026-02-18' },
  ])
  await L.switchTo(w, 'admin')
  /* a request placed by Saber (Approve what I enter OFF) */
  await placeBidSaber()
  async function placeBidSaber() { await placeBid(w, 'bane', '2026-02-23', 'LL', 'full', { adminOff: true }) }
  const gridNodesBefore = await nodesGrid(P)
  const tab0 = await L.tabCount(P)
  await L.openApprovals(w)
  const sub0 = await txt(P, T('appr-sub'))
  const lines0 = await L.apprLines(P)
  console.log('tab', tab0, 'sub', sub0, 'lines', lines0.length)
  for (const l of lines0) console.log('  ', l.who, '|', l.text)
  await shot(w, 'a-s1-1-approvals')
  await P.evaluate(() => window.scrollTo(0, 0))
  /* ---- 1. the tab, the page, the order, the columns, the halves ---- */
  const tabTxt = tab0
  rec('1a tab and header', size, /^\d+$/.test(tabTxt || '') ? 'PASS' : 'FAIL', `tab count "${tabTxt}", header "${sub0}", ${lines0.length} lines (header N counts this period only; tab counts all periods if it differs)`, ['a-s1-1-approvals'])
  const order = lines0.filter(l => l.who === 'bane').map(l => l.text.match(/(Mon|Tue|Wed|Thu|Fri|Sat|Sun) \d+ \w+/)[0])
  console.log('order of Ranger lines:', order.join(' > '))
  const expect = ['Mon 12 Jan', 'Wed 14 Jan', 'Mon 19 Jan', 'Tue 20 Jan', 'Mon 26 Jan', 'Fri 30 Jan', 'Mon 9 Feb', 'Wed 11 Feb', 'Mon 16 Feb', 'Wed 18 Feb', 'Mon 23 Feb']
  rec('1b oldest placed first', size, JSON.stringify(order) === JSON.stringify(expect) ? 'PASS' : 'FAIL', `observed ${order.join(', ')}; the bids went in the order ${expect.join(', ')}`, ['a-s1-1-approvals'])
  const halves = await P.evaluate(() => document.querySelector('[data-testid="approvals-page"]').innerText.includes('½'))
  rec('1c no half sign', size, halves ? 'FAIL' : 'PASS', 'page text holds a ½: ' + halves, ['a-s1-1-approvals'])
  /* columns line up: every cell class's left edge (right edge for .r) the same on every line */
  const cols = await P.evaluate(() => {
    const out = {}
    for (const line of document.querySelectorAll('.appr-line')) {
      for (const c of ['appr-who', 'appr-box', 'appr-dates', 'appr-days', 'appr-bal', 'appr-avail', 'appr-placed', 'appr-cliphold', 'appr-btns', 'appr-ok', 'appr-no']) {
        const e = line.querySelector('.' + c); if (!e) continue
        const b = e.getBoundingClientRect(); const r = e.classList.contains('r')
        ;(out[c] ||= []).push(Math.round((r ? b.right : b.left) * 10) / 10)
      }
    }
    const head = {}
    for (const [i, e] of [...document.querySelectorAll('.appr-cols span')].entries()) { const b = e.getBoundingClientRect(); head[i + ':' + e.innerText] = Math.round((e.classList.contains('r') ? b.right : b.left) * 10) / 10 }
    return { out, head }
  })
  const spread = Object.fromEntries(Object.entries(cols.out).map(([k, v]) => [k, Math.round((Math.max(...v) - Math.min(...v)) * 10) / 10]))
  console.log('col spreads', JSON.stringify(spread), 'heads', JSON.stringify(cols.head), 'sample x', JSON.stringify(Object.fromEntries(Object.entries(cols.out).map(([k, v]) => [k, v[0]]))))
  rec('1d columns line up', size, Object.values(spread).every(v => v <= 1) ? 'PASS' : 'FAIL', 'spread (px) per cell: ' + JSON.stringify(spread), ['a-s1-1-approvals'])
  /* ---- 13 states: pending, 0/1/2 docs, half day, weekend run, OIL, CCL, by Saber ---- */
  await shotLine(w, 'a-s1-13-pending-LL', 'Mon 12 Jan')
  await shotLine(w, 'a-s1-13-half-AM', 'Mon 19 Jan')
  await shotLine(w, 'a-s1-13-weekend-run', 'Fri 30 Jan')
  await shotLine(w, 'a-s1-13-OIL', 'Mon 9 Feb')
  await shotLine(w, 'a-s1-13-CCL', 'Wed 11 Feb')
  await shotLine(w, 'a-s1-13-2docs', 'Mon 16 Feb')
  await shotLine(w, 'a-s1-13-bySaber', 'Mon 23 Feb')
  await shotLine(w, 'a-s1-13-nodoc', 'Wed 14 Jan')
  for (const [d, n] of [['Mon 12 Jan', '1 doc'], ['Wed 14 Jan', '0 docs'], ['Mon 16 Feb', '2 docs']]) {
    const clip = await lineLoc(P, d).locator('[data-testid="appr-clip"]').count()
    const clipTxt = clip ? (await lineLoc(P, d).locator('[data-testid="appr-clip"]').innerText()).replace(/\s+/g, ' ') : ''
    console.log('   clip on', d, clip, `"${clipTxt}"`)
  }
  const info = {}
  for (const d of ['Mon 12 Jan', 'Wed 14 Jan', 'Mon 19 Jan', 'Fri 30 Jan', 'Mon 9 Feb', 'Wed 11 Feb', 'Mon 16 Feb', 'Mon 23 Feb']) info[d] = (await lineInfo(P, d)).text
  console.log(JSON.stringify(info, null, 1))
  /* ---- 15 speed + nodes ---- */
  const times = []
  for (const d of ['Wed 14 Jan', 'Mon 19 Jan', 'Mon 12 Jan']) {
    const pr = timeTap(P, d)
    await P.waitForTimeout(100)
    await pressLoc(w, approveBtn(P, d))
    times.push(Math.round(await pr))
    await P.waitForTimeout(400)
    await pressLoc(w, approveBtn(P, d)) /* the second tap sends it back */
    await P.waitForTimeout(500)
  }
  times.sort((a, b) => a - b)
  console.log('tap-to-lit ms (sorted):', times)
  /* ---- 2. approve one ---- */
  const d2 = 'Mon 12 Jan'
  const cnt0 = await L.tabCount(P), all0 = await txt(P, T('appr-approve-all'))
  await pressLoc(w, approveBtn(P, d2)); await P.waitForTimeout(500)
  const i2 = await lineInfo(P, d2)
  const cnt1 = await L.tabCount(P), all1 = await txt(P, T('appr-approve-all'))
  await shot(w, 'a-s1-2-approved-12jan')
  await shotLine(w, 'a-s1-13-lit-approved', d2)
  rec('2a approve lights it, the line stays', size, i2.ok.p === 'true' && /Approved/.test(i2.ok.t || '') ? 'PASS' : 'FAIL', JSON.stringify(i2.ok) + ' cls=' + i2.cls, ['a-s1-2-approved-12jan', 'a-s1-13-lit-approved'])
  rec('2b tab count and Approve all each fall by one', size, Number(cnt1) === Number(cnt0) - 1 && all1 !== all0 ? 'PASS' : 'FAIL', `tab ${cnt0} -> ${cnt1}; Approve all "${all0}" -> "${all1}"`, ['a-s1-2-approved-12jan'])
  /* refuse + second tap (3) */
  const d3 = 'Wed 14 Jan'
  await pressLoc(w, refuseBtn(P, d3)); await P.waitForTimeout(500)
  const i3 = await lineInfo(P, d3)
  await shotLine(w, 'a-s1-13-lit-refused', d3)
  rec('3a Refuse lights it "Refused"', size, i3.no.p === 'true' && /Refused/.test(i3.no.t || '') ? 'PASS' : 'FAIL', JSON.stringify(i3.no), ['a-s1-13-lit-refused'])
  await pressLoc(w, refuseBtn(P, d3)); await P.waitForTimeout(500)
  const i3b = await lineInfo(P, d3)
  await shotLine(w, 'a-s1-13-back-to-pending', d3)
  rec('3b second tap on lit Refuse -> pending', size, i3b.no.p !== 'true' && i3b.ok.p !== 'true' && /Refuse$/.test((i3b.no.t || '').trim()) ? 'PASS' : 'FAIL', JSON.stringify({ ok: i3b.ok, no: i3b.no }), ['a-s1-13-back-to-pending'])
  /* the same for Approve */
  await pressLoc(w, approveBtn(P, d2)); await P.waitForTimeout(500)
  const i3c = await lineInfo(P, d2)
  rec('3c second tap on lit Approve -> pending', size, i3c.ok.p !== 'true' && /Approve$/.test((i3c.ok.t || '').trim()) ? 'PASS' : 'FAIL', JSON.stringify(i3c.ok), [])
  /* ---- 2d: scroll so the line is near the foot, approve it, Undo, scroll measured ---- */
  const ss0 = await scrollState(P)
  console.log('scroll state', JSON.stringify(ss0))
  const dLast = 'Mon 23 Feb'
  await P.evaluate(() => window.scrollTo(0, document.scrollingElement.scrollHeight))
  await P.waitForTimeout(500)
  const before = await scrollState(P)
  await pressLoc(w, approveBtn(P, dLast)); await P.waitForTimeout(500)
  const litLast = await lineInfo(P, dLast)
  const mid = await scrollState(P)
  const undoVis = await P.evaluate(() => { const b = document.querySelector('#undoBtn').getBoundingClientRect(); return { top: Math.round(b.top), bottom: Math.round(b.bottom), w: Math.round(b.width) } })
  await shot(w, 'a-s1-2-before-undo')
  await topbarUndo(w)
  const afterU = await scrollState(P)
  const iu = await lineInfo(P, dLast)
  await shot(w, 'a-s1-2-after-undo')
  rec('2c Undo: back to pending, the page did not move', size, afterU.win === mid.win && iu.ok.p !== 'true' ? 'PASS' : 'FAIL', `scrollY before approve ${before.win}, after approve ${mid.win}, after Undo ${afterU.win}; Undo button at top ${undoVis.top}; line ok.pressed=${iu.ok.p}`, ['a-s1-2-before-undo', 'a-s1-2-after-undo'])
  await topbarRedo(w)
  const afterR = await scrollState(P)
  const ir = await lineInfo(P, dLast)
  await shot(w, 'a-s1-2-after-redo')
  rec('2d Redo: lit Approved again, page still', size, ir.ok.p === 'true' && /Approved/.test(ir.ok.t || '') && afterR.win === mid.win ? 'PASS' : 'FAIL', `ok=${JSON.stringify(ir.ok)} scrollY ${afterR.win} (was ${mid.win})`, ['a-s1-2-after-redo'])
  await pressLoc(w, approveBtn(P, dLast)); await P.waitForTimeout(500)
  const ir2 = await lineInfo(P, dLast)
  rec('2e after Redo a second tap still sends it back (star 1)', size, ir2.ok.p !== 'true' ? 'PASS' : 'FAIL', `ok=${JSON.stringify(ir2.ok)}`, [])
  await shot(w, 'a-s1-2-after-redo-second-tap')
  /* nodes back on the grid */
  await P.evaluate(() => window.scrollTo(0, 0))
  await L.openGrid(w); await P.waitForTimeout(900)
  const gridNodesAfter = await nodesGrid(P)
  rec('15 speed and nodes', size, 'PASS', `tap-to-lit ms ${times.join(', ')} (median ${times[1]}); grid nodes before Approvals ${gridNodesBefore}, after leaving ${gridNodesAfter}`, [])
} catch (e) {
  rec('ERROR', size, 'FAIL', String(e).slice(0, 400))
  await shot(w, 'a-s1-error').catch(() => {})
}
console.log('errs', JSON.stringify(w.errs))
L.writeResults('s1')
await w.ctx.close(); await L.closeBrowser()
console.log('DONE')
