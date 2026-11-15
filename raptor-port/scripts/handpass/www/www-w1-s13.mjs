/* www W1 scenario 13 — equal times; print / PDF and CSV (desktop). usage: node scripts/handpass/www/www-w1-s13.mjs */
const PHONE = process.env.PHONE === '1'
process.env.WWW_RUN ||= 's13-' + (PHONE ? 'p' : 'd')
const H = await import('./www-w1-lib3.mjs')
const { X, say, sleep, L, nrm } = H
const size = PHONE ? '402' : '1536'
const P = PHONE ? 'p' : 'd'
const FRI = X.FRI
const w = await X.open({ phone: PHONE })
const { page } = w
const R = (did, exp, saw, v, pic) => X.row('13 equal times, print, CSV', size, did, exp, saw, v, pic)
await X.board(w, FRI)
const wi = await X.flight(w, FRI, '12:00', '12:00', 'bane', { msn: 'EQ FLT' })
const bw = await X.boardWarn(w)
await X.pic(w, `13-1-board-${P}`)
R('flight with T/O 12:00 and landing 12:00 typed; board warnings', 'its own warning (times look wrong / same take-off and landing), not "assumed"', JSON.stringify(bw), bw.some(l => /EQ FLT|Ranger/.test(l) || /same|equal|look wrong|landing/i.test(l)) && !bw.some(l => /assumed/.test(l)) ? 'PASS' : 'FAIL', `13-1-board-${P}.png`)
const title = await page.evaluate(() => [...document.querySelectorAll('#schedBoard [data-bfld="ff:4.0.0.ld"], #schedBoard [data-bfld="ff:4.0.0.to"]')].map(e => e.title || e.getAttribute('aria-label') || ''))
R('the equal-times row\'s own title (hover text)', 'RECORD', JSON.stringify(title), 'RECORDED', `13-1-board-${P}.png`)
await X.closeBoard(w)
const ww = await X.weekWarn(w, '#eWeek', FRI)
await X.pic(w, `13-2-week-${P}`)
R('week strip of Friday', 'no "assumed" on the equal-times line', JSON.stringify(ww.items.filter(l => /Ranger|EQ FLT/.test(l))), !ww.items.some(l => /assumed/.test(l)) ? 'PASS' : 'FAIL', `13-2-week-${P}.png`)
// blank landing on a second flight for comparison, then print and CSV
await X.board(w, FRI)
const wj = await X.flight(w, FRI, '15:00', '', 'bane', { msn: 'BLANK FLT' })
await X.closeBoard(w)
await L.go(page, 'editsched'); await sleep(500)
// CSV
try {
  const [dl] = await Promise.all([page.waitForEvent('download', { timeout: 8000 }), X.press(w, '#exportSched')])
  const p = X.SHOTS + '/13-export.csv'
  await dl.saveAs(p)
  const fs = await import('node:fs')
  const txt = fs.readFileSync(p, 'utf8')
  const rowsF = txt.split(/\r?\n/).filter(l => /EQ FLT|BLANK FLT/.test(l))
  R('pressed the CSV export', 'RECORD what it carries: the typed landing 12:00 for EQ FLT; BLANK FLT landing empty (never a typed assumed landing)', `file ${dl.suggestedFilename()}; lines: ${JSON.stringify(rowsF)}; assumed word present: ${/assumed/i.test(txt)}`, 'RECORDED', '')
  R('CSV: no fabricated landing', 'BLANK FLT line carries no 16:00 landing', JSON.stringify(rowsF.filter(l => /BLANK FLT/.test(l))), rowsF.filter(l => /BLANK FLT/.test(l)).every(l => !/16:00/.test(l)) && rowsF.length ? 'PASS' : 'FAIL', '')
} catch (e) { R('pressed the CSV export', 'RECORD', 'no file came: ' + e.message.slice(0, 120), 'NOT WALKED', '') }
// print / PDF preview
try {
  const popups = []
  page.context().on('page', p => popups.push(p))
  await page.evaluate(() => { window.__printed = 0; window.print = () => { window.__printed++ } })
  await X.press(w, '#exportPdf'); await sleep(1500)
  const pr = await page.evaluate(() => window.__printed)
  let target = page
  if (popups.length) { target = popups[0]; await target.waitForLoadState().catch(() => {}); await sleep(500) }
  const bodyTxt = nrm(await target.evaluate(() => document.body.innerText).catch(() => ''))
  const hits = bodyTxt.match(/(EQ FLT|BLANK FLT)[^A-Z]{0,60}/g) || []
  await target.screenshot({ path: X.SHOTS + `/13-3-print-${P}.png`, fullPage: true }).catch(() => {})
  R('pressed print / PDF', 'RECORD what is generated (a print view with the published/draft rows; no warning column demanded)', `print called ${pr}x; popups ${popups.length}; text hits: ${JSON.stringify(hits)}; assumed word: ${/assumed/i.test(bodyTxt)}; length ${bodyTxt.length}`, 'RECORDED', `13-3-print-${P}.png`)
} catch (e) { R('pressed print / PDF', 'RECORD', 'could not act: ' + e.message.slice(0, 150), 'NOT WALKED', '') }
await X.fin(w)
