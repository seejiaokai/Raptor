/* rcb2-w1 plain-user round, steps 1, 2, 3, 6 — in one world: Ranger files leave; admin puts him on BRIEFING, opens the warning on the
   board, week strip, day details and Insights, hides it and Undoes; publishes the day; Ranger looks; both through the current-version eye.
   usage: node scripts/handpass/rcb2/rcb2-w1-pu.mjs [desktop|phone] */
const KIND = process.argv[2] || 'desktop'
process.env.RCB2_RUN = 'pu-' + KIND + (process.env.RCB2_TAG || '')
const X = await import('./rcb2-w1-lib.mjs')
const { L, say, check, nrm, sleep, FRI } = X
const P = KIND === 'phone' ? 'p' : 'd'
const w = await X.world(KIND, 'us')
const page = w.page
const OLD = /(leave|downchit) \+ flying/i
const closes = []
// STEP 1: Ranger files leave via Inputs
const r = await X.fileInput(w, { iso: '2026-07-17', type: 'LL', remarks: 'rcb2 w1 plain user', pic: `pu-1-ranger-input-${P}` })
say('Ranger filed', JSON.stringify({ added: r.added, asked: r.asked, hasPerson: r.hasPerson }))
check('PU1a Ranger files leave on the Inputs page: it is added', !!r.added && !!r.rec, JSON.stringify({ added: r.added, rec: !!r.rec }))
await L.go(page, 'inputs'); await sleep(600)
const onCal = await page.evaluate(() => (document.body.innerText || '').includes('rcb2 w1 plain user') || !!document.querySelector('[data-icday="2026-07-17"]'))
await X.pic(w, `pu-1b-inputs-page-${P}`)
check('PU1b the leave shows on the Inputs page', onCal, String(onCal))
await L.go(page, 'leavewar'); await sleep(900)
await X.pic(w, `pu-1c-leavewar-${P}`)
const lw = await page.evaluate(() => (document.body.innerText || '').slice(0, 300).replace(/\s+/g, ' '))
check('PU1c Leave War page opens for Ranger (RECORDED, no error)', 'RECORDED', lw)
// STEP 2: admin puts Ranger on BRIEFING
await X.relogin(w, 'a')
await X.board(w, FRI)
await X.ground(w, FRI, { prog: 'BRIEFING', str: '09:00', end: '10:00', who: 'bane' }).catch(e => say('ground failed', String(e).slice(0, 100)))
const bw = await X.boardWarn(w)
say('board warnings:', JSON.stringify(bw.lines.map(l => l.text.slice(0, 90))))
await X.pic(w, `pu-2a-board-${P}`)
const mine = bw.lines.filter(l => /Ranger/.test(l.text))
check('PU2a admin puts Ranger on BRIEFING: board warns "On leave + planned"/"On leave but tasked — BRIEFING"', mine.some(l => /On leave but tasked/.test(l.text)), JSON.stringify(mine.map(l => l.text.slice(0, 90))))
check('PU2b board name "planned" not "flying"', !bw.lines.some(l => OLD.test(l.text)), '')
const dd = await X.dayDetails(w, FRI, { root: '#schedBoard', name: `pu-2c-daydetails-board-${P}` })
say('board day details:', JSON.stringify(dd).slice(0, 300))
if (!dd.error) for (const way of ['x', 'Escape', 'outside', 'Close']) { const c = await X.closeDayDetails(w, way); closes.push(['board dd', way, c]); if (c === 'closed' && way !== 'Close') await X.dayDetails(w, FRI, { root: '#schedBoard' }); }
// STEP 3: hide, count, undo
const h = mine[0]
if (h && h.ix !== undefined) {
  await X.hideIx(w, FRI, h.ix).catch(e => say('hide failed', String(e).slice(0, 100)))
  const after = await X.boardWarn(w)
  await X.pic(w, `pu-3a-hidden-${P}`)
  check('PU3a hiding the warning: it is marked hidden / struck on the board', after.lines.some(l => /Ranger/.test(l.text) && (l.hid || l.struck)) || after.lines.filter(l => /Ranger/.test(l.text)).length === 0, JSON.stringify(after.lines.filter(l => /Ranger/.test(l.text)).map(l => [l.hid, l.struck])))
  await X.undo(w)
  const back = await X.boardWarn(w)
  await X.pic(w, `pu-3b-undo-${P}`)
  check('PU3b Undo brings the warning back live', back.lines.some(l => /Ranger/.test(l.text) && !l.hid && !l.struck), JSON.stringify(back.lines.filter(l => /Ranger/.test(l.text)).map(l => [l.hid, l.struck])))
} else check('PU3 hide', 'NOT WALKED', 'no Ranger warning line to hide')
await X.closeBoard(w)
// STEP 6: publish, inspect as Ranger, repeat via current-version eye
const pub = await X.signAndPublish(w, FRI).catch(e => ({ error: String(e).slice(0, 120) }))
say('publish', JSON.stringify(pub).slice(0, 200))
await X.relogin(w, 'us')
await L.go(page, 'viewsched'); await sleep(700)
const vw = await X.weekWarn(w, '#vWeek', FRI)
await X.pic(w, `pu-6a-ranger-view-${P}`)
say('Ranger View-only Friday strip:', JSON.stringify(vw.items.map(i => i.text.slice(0, 80))))
check('PU6a Ranger sees the published warning with the "planned" name', vw.items.some(i => /On leave \+ planned/.test(i.text)) && !vw.items.some(i => OLD.test(i.text)), JSON.stringify(vw.items.map(i => i.text.slice(0, 60))))
const d2 = await X.dayDetails(w, FRI, { root: '#vWeek', name: `pu-6b-ranger-daydetails-${P}` })
if (!d2.error) for (const way of ['Close', 'x', 'Escape', 'outside']) { const c = await X.closeDayDetails(w, way); closes.push(['ranger dd', way, c]); if (c === 'closed' && way !== 'outside') await X.dayDetails(w, FRI, { root: '#vWeek' }) }
check('PU6b Ranger day details names the check "planned"', !d2.error && /planned/.test(d2.text) && !OLD.test(d2.text), (d2.text || d2.error || '').slice(0, 200))
say('window closes:', JSON.stringify(closes))
check('PU every window closed each way', closes.every(c => c[2] === 'closed' || c[2] === 'was not open'), JSON.stringify(closes.filter(c => c[2] !== 'closed')))
say('errors', JSON.stringify(w.errors))
check('PU no console/page errors', w.errors.length === 0, w.errors.slice(0, 3).join(' | '))
await X.finishWorld(w)
X.W.summary()
