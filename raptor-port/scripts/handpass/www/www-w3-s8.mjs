/* www W3 fixes 7 + 8 — the Logic row "A flight"; the pending OIL note when both ends move; plain user: warning tap lights crew,
   "A flight" changed and Reset. usage: [PHONE=1] node scripts/handpass/www/www-w3-s8.mjs */
const PHONE = process.env.PHONE === '1'
process.env.WWW_RUN ||= 's8-' + (PHONE ? 'p' : 'd')
const H = await import('./www-w3-lib.mjs')
const { X, say, sleep, L } = H
const size = PHONE ? '402' : '1536'
const P = PHONE ? 'p' : 'd'
const w = await X.open({ phone: PHONE })
const { page } = w
const R = (did, exp, saw, v, pic) => X.row('7/8 A flight row, pending OIL both ends', size, did, exp, saw, v, pic)
// 7: the row
await L.go(page, 'logic'); await sleep(600)
const rowText = await page.evaluate(() => { const e = [...document.querySelectorAll('.lgset')].find(x => x.querySelector('.lgnm')?.innerText.trim() === 'A flight'); if (!e) return null; e.scrollIntoView({ block: 'center' }); return e.innerText.replace(/\s+/g, ' ').trim() })
await sleep(300)
await X.pic(w, `7-a-row-${P}`)
const want = 'Conflicts, the tight turn, the debrief, crew rest, the long day, OIL and Insights hours count to that landing, and its warnings say it was assumed.'
R('opened Logic; read the row "A flight"', `contains "${want}"`, String(rowText), rowText && rowText.includes(want) ? 'PASS' : 'FAIL', `7-a-row-${P}.png`)
const rallyKey = await page.evaluate(() => document.querySelector('.lgset[data-lgname="Default rally before take-off"]')?.dataset.lgkey)
say('rally key', rallyKey)
// plain user: A flight changed then Reset
await H.logicOpen(w, true)
const v1 = await H.setSetting(w, 'fltLen', '75')
await X.pic(w, `7-b-changed-${P}`)
await X.press(w, '[data-lgreset="fltLen"]', { after: `7-c-reset-after-tap-${P}` }); await sleep(800)
const v2 = await page.locator('[data-lgset="fltLen"]:visible').first().inputValue()
await X.pic(w, `7-c-reset-${P}`)
R('typed 75 in "A flight", then pressed the row Reset', 'box 1h30... back to 1h', `typed -> ${v1}; after Reset ${v2}`, v2 === '1h' ? 'PASS' : 'FAIL', `7-c-reset-${P}.png`)
await H.logicDone(w)
// 8: both ends moved on a published OIL Saturday
await H.logicOpen(w, true); await H.setSetting(w, 'fltLen', '90'); await H.logicDone(w)
await X.board(w, X.SAT)
await H.frFlight(w, X.SAT, '12:00', '', 'bane', 'OIL FLT')
const pr = await H.signAndPublish(w, X.SAT); await sleep(800)
const hp = await H.head(w, X.SAT)
await X.closeBoard(w)
R('A flight 90; built Ranger T/O 12:00 no landing on Saturday; signed and published', 'ORIG', JSON.stringify(hp), hp && /ORIG/.test(hp.tag) ? 'PASS' : 'NOT WALKED', '')
await H.logicOpen(w, true)
await H.setSetting(w, 'fltLen', '120'); await H.setSetting(w, rallyKey, '165'); await H.logicDone(w)
await X.board(w, X.SAT)
const h = await H.head(w, X.SAT)
await X.press(w, '.dpend', { scope: 'board', after: `8-a-open-after-tap-${P}` }); await sleep(900)
const items = await page.evaluate(() => [...document.querySelectorAll('.chgwin .pl-item')].filter(e => e.getBoundingClientRect().width > 0).map(e => e.innerText.replace(/\s+/g, ' ').trim()))
await X.pic(w, `8-b-pending-${P}`)
R('A flight 2h and the default rally 2h45 together on the published OIL Saturday; opened the pending list', 'RECORD whole; Ranger line: "Still a full day of OIL. It counts 09:15–16:00, not 09:00–15:30." (or "OIL changes: …")', JSON.stringify({ head: h && h.pending, items }), 'RECORDED', `8-b-pending-${P}.png`)
R('the OIL note for Ranger', 'contains "Still a full day of OIL. It counts <new start>–<new end>, not <old start>–<old end>." or "OIL changes"', JSON.stringify(items.filter(l => /OIL/.test(l))), items.some(l => /Still a full day of OIL\. It counts \d\d:\d\d–\d\d:\d\d, not \d\d:\d\d–\d\d:\d\d\./.test(l) || /OIL changes/.test(l)) ? 'PASS' : 'FAIL', `8-b-pending-${P}.png`)
await X.press(w, '.chgwin .win-x'); await sleep(500)
await X.closeBoard(w)
await H.logicOpen(w, true)
await H.setSetting(w, 'fltLen', '60'); const rv = await H.setSetting(w, rallyKey, '180'); await H.logicDone(w)
R('put both settings back (A flight 1h, rally 3h)', 'both back', `rally box ${rv}`, 'RECORDED', '')
// plain user (desktop): a warning tapped lights its crew
if (!PHONE) {
  await X.board(w, X.SAT)
  await H.gRow(w, X.SAT, 'BRIEFING', '11:00', '11:30', 'bane')
  const wl = page.locator('#schedBoard #sbWarn .wln:visible, #schedBoard #sbSide .wln:visible').filter({ hasText: 'Conflict' }).first()
  if (await wl.count()) {
    await wl.click(); await sleep(700)
    const lit = await page.evaluate(() => [...document.querySelectorAll('#schedBoard .puck')].filter(e => e.getBoundingClientRect().width && /hl|lit|flash|warn-hl|wl-on/.test(e.className) && /Ranger/.test(e.innerText)).map(e => String(e.className)))
    await X.pic(w, `9-warn-tap-${P}`)
    const sel = await page.evaluate(() => [...document.querySelectorAll('#schedBoard .puck.sel, #schedBoard .puck.selected')].length)
    R('tapped the Conflict warning line on the board', 'its crew lit in the warning colours, never selection blue', JSON.stringify({ litClasses: lit.slice(0, 3), selectedPucks: sel }), 'RECORDED', `9-warn-tap-${P}.png`)
  } else R('tapped a warning line', 'crew lit', 'no Conflict line visible', 'NOT WALKED', '')
  await X.closeBoard(w)
}
await X.fin(w)
