/* www W3 fix 5 + plain-user round — the pending list names the people on its warning rows; its ways to close.
   usage: [PHONE=1] node scripts/handpass/www/www-w3-s5.mjs */
const PHONE = process.env.PHONE === '1'
process.env.WWW_RUN ||= 's5-' + (PHONE ? 'p' : 'd')
const H = await import('./www-w3-lib.mjs')
const { X, say, sleep, L } = H
const size = PHONE ? '402' : '1536'
const P = PHONE ? 'p' : 'd'
const w = await X.open({ phone: PHONE })
const { page } = w
const R = (did, exp, saw, v, pic) => X.row('5 pending list names / plain user', size, did, exp, saw, v, pic)
await X.board(w, X.FRI)
await H.frFlight(w, X.FRI, '12:00', '', 'bane', 'FRI FLT')
const pr = await H.signAndPublish(w, X.FRI); await sleep(800)
const hp = await H.head(w, X.FRI)
R('built Ranger flight T/O 12:00 on Friday; signed and published', 'ORIG', JSON.stringify(hp), hp && /ORIG/.test(hp.tag) ? 'PASS' : 'NOT WALKED', '')
await H.gRow(w, X.FRI, 'BRIEFING', '11:00', '11:30', 'bane')
const hc = await H.head(w, X.FRI)
await X.pic(w, `5-a-changed-${P}`)
const bw = await X.boardWarn(w)
R('added BRIEFING 11:00-11:30 for Ranger inside the flight\'s step window; the board lines and the head', 'RECORD', JSON.stringify({ head: hc, lines: bw.filter(l => /Ranger/.test(l)) }), 'RECORDED', `5-a-changed-${P}.png`)
async function openList() {
  await X.press(w, '.dpend', { scope: 'board', after: `5-open-after-tap-${P}` }); await sleep(800)
  return page.evaluate(() => {
    const win = document.querySelector('.chgwin:not(.bar)')
    return { shown: !!win && win.getBoundingClientRect().width > 0, items: [...document.querySelectorAll('.chgwin .pl-item')].filter(e => e.getBoundingClientRect().width > 0).map(e => e.innerText.replace(/\s+/g, ' ').trim()), head: (document.querySelector('.chgwin .pl-head') || {}).innerText }
  })
}
const o1 = await openList()
await X.pic(w, `5-b-pending-${P}`)
R('opened the day\'s pending list (To go out)', 'the new warning row starts with his callsign: "Ranger — Conflict: …" then "new"', JSON.stringify(o1), o1.items.some(l => /^Ranger — /.test(l) || /Ranger — Conflict/.test(l)) ? 'PASS' : 'FAIL', `5-b-pending-${P}.png`)
R('RECORD the pending list whole', 'RECORD', JSON.stringify(o1), 'RECORDED', `5-b-pending-${P}.png`)
const tabsRead = {}
for (const t of ['All changes', 'New to you', 'To go out']) {
  const b = page.locator('.chgwin .win-tab:visible', { hasText: t }).first()
  if (await b.count()) { if (PHONE) await b.tap(); else await b.click(); await sleep(500) }
  tabsRead[t] = await page.evaluate(() => [...document.querySelectorAll('.chgwin .cw-out, .chgwin .cw-list, .chgwin [class*="cw-"]')].filter(e => e.getBoundingClientRect().width > 0 && e.children.length === 0 && (e.innerText || '').trim()).map(e => e.innerText.replace(/\s+/g, ' ').trim()).filter(s => s.length > 8 && /Conflict|Misses|Ranger|warning/i.test(s)).slice(0, 12))
  await X.pic(w, `5-b2-tab-${t.replace(/ /g, '')}-${P}`)
}
R('read the other tabs of the window for warning rows', 'RECORD', JSON.stringify(tabsRead), 'RECORDED', `5-b2-tab-Allchanges-${P}.png`)
// close ways
const isOpen = () => page.evaluate(() => { const win = document.querySelector('.chgwin:not(.bar)'); return !!win && win.getBoundingClientRect().width > 0 })
let how = []
await X.press(w, '.chgwin .win-x', { after: `5-c-x-after-tap-${P}` }); await sleep(500)
how.push(['the ✕ (Close)', (await isOpen()) ? 'STILL OPEN' : 'closed'])
await openList(); await page.keyboard.press('Escape'); await sleep(500)
how.push(['Escape', (await isOpen()) ? 'STILL OPEN' : 'closed'])
if (await isOpen()) await X.press(w, '.chgwin .win-x')
await openList(); await page.mouse.click(5, 300); await sleep(500)
how.push(['a tap outside (page edge)', (await isOpen()) ? 'STILL OPEN' : 'closed'])
if (await isOpen()) { await X.pic(w, `5-d-stillopen-${P}`); await X.press(w, '.chgwin .win-x') }
if (PHONE) { await openList(); const h = page.locator('.chgwin .win-hide:visible').first(); if (await h.count()) { await h.tap(); await sleep(600); how.push(['Hide ▾ (phone)', (await page.locator('.chgwin.bar:visible').count()) ? 'folded to the bar' : 'no bar']); await X.pic(w, `5-e-hidden-${P}`); const bb = page.locator('.chgwin.bar .cw-barbtn:visible').first(); if (await bb.count()) { await bb.tap(); await sleep(500) } if (await isOpen()) await X.press(w, '.chgwin .win-x') } }
R('closing the pending list by each way', 'RECORD each; Escape / tap outside not closing is the known [RULES-CHECK-FIXES]', JSON.stringify(how), 'RECORDED', `5-c-x-after-tap-${P}.png`)
// undo the change
let guard = 0, left = hc && hc.pending
while (guard++ < 14) {
  const u = page.locator('#schedBoard button[aria-label="Undo"]:visible').first()
  if (!(await u.count()) || await u.isDisabled()) break
  if (PHONE) await u.tap(); else await u.click(); await sleep(600)
  const h = await H.head(w, X.FRI); left = h && h.pending
  if (!left || !/pending/.test(left) || (h && !/ORIG/.test(h.tag))) break
}
await X.pic(w, `5-f-undone-${P}`)
const hu = await H.head(w, X.FRI)
const bwu = await X.boardWarn(w)
R('undid the change (Undo pressed ' + (guard - 1) + ' times)', 'nothing pending; the new warning gone', JSON.stringify({ head: hu, ranger: bwu.filter(l => /Ranger/.test(l)) }), hu && !/pending/.test(hu.pending) && /ORIG/.test(hu.tag) ? 'PASS' : 'FAIL', `5-f-undone-${P}.png`)
// plain user: a warning tapped lights its crew (desktop)
await X.closeBoard(w)
await X.fin(w)
