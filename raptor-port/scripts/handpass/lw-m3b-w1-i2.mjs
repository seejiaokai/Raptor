// W1 part i — scenarios A2 and A3 (phone, member Ranger) and the roll-call's R13 (his My leave and his own row).
// A2: Ranger on an open day of his: the row CSE · OD · (empty) · ⋯; the ⋯ holds Attach alone; it files a whole-day ATCH on his row (D1379).
// A3: Ranger on a day closed for bidding: the note, CSE · OD · ⋯ -> Attach files a whole day (D1379).
// Bidding is opened for Nov 2026 by the admin through the open-dates window in a first context; the member signs in in a second one started
// from that context's saved storage (walk-scripts §3). Usage (from raptor-port/): node scripts/handpass/lw-m3b-w1-i2.mjs [chromium|webkit]
const M = await import('./lw-m3b-w1-lib.mjs')
const { L, T } = M
const path = await import('node:path')
const engine = process.argv[2] || 'chromium'
const tag = engine === 'webkit' ? 'wk' : 'cr'
for (const p of ['a2-' + tag, 'a3-' + tag, 'r13-' + tag]) L.clearPrefix(p)
console.log('lw-m3b-w1-i2 phone/' + engine, 'out', L.OUT)
const lines = [], bad = []
const say = s => { lines.push(s); console.log('   ' + s) }
const judge = (ok, s) => { if (!ok) bad.push(s); say((ok ? 'ok    ' : 'WRONG ') + s) }
const brief = c => (c?.boxes || []).map(b => b.split('|')[0] + '/' + b.split('|')[2] + '/' + b.split('|').pop()).join(' + ') || '(empty)'
const OPEN = '2026-11-10', CLOSED = '2026-12-03'

const a = await M.start('phone', engine)
say('admin opens Nov: ' + (await M.openMonths(a, ['2026-11'])).slice(-70))
const state = await a.ctx.storageState()
await a.ctx.close()

const m = await M.newCtx('phone', engine, state)
const P = m.page
await L.signInPlain(m, 'member'); await M.hideTransient(P)
console.log('page scripts:', await M.scriptCheck(m))
const myLeave = async () => (await L.txt(P, T('my-leave'))) || '(not drawn)'
const leave0 = await myLeave()
say('R13 My leave before: ' + leave0)
const pics = []

/* ---------------- A2 ---------------- */
{
  await L.openCellR(m, 'bane', OPEN); await P.waitForSelector(T('bid-picker'), { timeout: 5000 })
  const row = await P.evaluate(() => [...document.querySelectorAll('[data-testid="bid-extra-row"] > *')].map(e => ({ tid: e.dataset.testid || '', text: e.textContent.trim(), shown: e.getBoundingClientRect().width > 0 })))
  say('A2 the row under the leaves: ' + JSON.stringify(row))
  await M.winPic(m, `a2-${tag}-1-window`)
  const names = row.filter(r => r.shown).map(r => r.text || '(empty)')
  // the ⋯ is a wrapper without a testid of its own; its place is the fourth column (read from the picture too): measure the boxes
  const cols = await P.evaluate(() => [...document.querySelectorAll('[data-testid="bid-extra-row"] > *')].map(e => Math.round(e.getBoundingClientRect().left)))
  const gridCols = await P.evaluate(() => getComputedStyle(document.querySelector('[data-testid="bid-extra-row"]')).gridTemplateColumns)
  say(`A2 the three drawn boxes start at x ${JSON.stringify(cols)}; the row's columns: ${gridCols}`)
  judge(names.length === 3 && /CSE/.test(names[0]) && /OD/.test(names[1]) && /⋯/.test(names[2]) && !row.some(r => /bid-oil/.test(r.tid)) && cols[2] > cols[1] + (cols[1] - cols[0]) * 1.5, `A2 the row reads CSE · OD · (nothing in the third place) · ⋯ in the fourth (no Grant OIL for a member): ${JSON.stringify(row.map(r => r.tid + '=' + r.text))}, boxes at x ${JSON.stringify(cols)}`)
  await L.press(m, T('bid-more')); await P.waitForSelector(T('bid-more-menu'), { timeout: 3000 })
  const items = await P.evaluate(() => [...document.querySelectorAll('[data-testid="bid-more-menu"] [role="menuitem"], [data-testid="bid-more-menu"] button')].filter(e => e.getBoundingClientRect().height > 0).map(e => (e.dataset.testid || '') + '=' + e.textContent.trim()))
  say('A2 the ⋯ holds: ' + items.join(' · '))
  await M.winPic(m, `a2-${tag}-2-more`)
  judge(items.length === 1 && /Attach/.test(items[0]), `A2 the ⋯ holds Attach alone: ${items.join(', ')}`)
  const d = await M.tapQ(m, T('bid-file-ATCH'), `a2-${tag}-3-attach-q`)
  await P.waitForTimeout(800)
  say('A2 windows after: ' + JSON.stringify(await M.anyWindowOpen(P)))
  const cell = await M.cellWords(P, 'bane', OPEN)
  say('A2 the cell: ' + brief(cell))
  await L.cellShot(m, 'bane', OPEN, `a2-${tag}-4-cell`)
  const inp = await P.evaluate(() => (window.INPUTS || []).filter(r => r.type === 'Attach' && (r.people || []).some(x => x.p === 'bane')).map(r => ({ date: r.date, endDate: r.endDate, allday: r.allday, half: r.half, acc: r.acc, by: r.by, to: r.to })))
  say('A2 the input: ' + JSON.stringify(inp))
  judge(/^ATCH\/s-a\/whole$/.test(brief(cell)) && inp.length === 1 && inp[0].allday === true && inp[0].acc === 'u' && inp[0].by === 'bane', `A2 a whole-day ATCH on his row, filed by him under Unavailable: ${brief(cell)}; ${JSON.stringify(inp)}`)
  say('R13 his own row after the Attach: ' + brief(cell) + '; My leave: ' + await myLeave())
}
/* ---------------- A3 ---------------- */
{
  await L.openCellR(m, 'bane', CLOSED); await P.waitForSelector(T('closed-note'), { timeout: 5000 })
  const row = await P.evaluate(() => [...document.querySelectorAll('[data-testid="closed-extra-row"] > *')].map(e => ({ tid: e.dataset.testid || '', text: e.textContent.trim(), shown: e.getBoundingClientRect().width > 0 })))
  say('A3 the note: ' + (await L.txt(P, T('closed-note-text'))) + ' | row: ' + JSON.stringify(row))
  await M.winPic(m, `a3-${tag}-1-closed-note`, { sel: T('closed-note') })
  const names = row.filter(r => r.shown).map(r => r.text || '(empty)')
  judge(names.length === 3 && /CSE/.test(names[0]) && /OD/.test(names[1]) && /⋯/.test(names[2]), `A3 the row reads CSE · OD · ⋯: ${JSON.stringify(row.map(r => r.tid + '=' + r.text))}`)
  await L.press(m, T('closed-more')); await P.waitForSelector(T('closed-more-menu'), { timeout: 3000 })
  const items = await P.evaluate(() => [...document.querySelectorAll('[data-testid="closed-more-menu"] [role="menuitem"], [data-testid="closed-more-menu"] button')].filter(e => e.getBoundingClientRect().height > 0).map(e => (e.dataset.testid || '') + '=' + e.textContent.trim()))
  say('A3 the ⋯ holds: ' + items.join(' · '))
  await M.winPic(m, `a3-${tag}-2-more`, { sel: T('closed-note') })
  await M.tapQ(m, T('closed-file-ATCH'), `a3-${tag}-3-attach-q`)
  await P.waitForTimeout(800)
  const wins = await M.anyWindowOpen(P)
  say('A3 windows after: ' + JSON.stringify(wins) + '; error line: ' + (await L.txt(P, T('closed-file-err'))))
  const cell = await M.cellWords(P, 'bane', CLOSED)
  say('A3 the cell: ' + brief(cell))
  await L.cellShot(m, 'bane', CLOSED, `a3-${tag}-4-cell`)
  const inp = await P.evaluate(() => (window.INPUTS || []).filter(r => r.type === 'Attach' && (r.people || []).some(x => x.p === 'bane') && r.date === 'Dec 3').map(r => ({ date: r.date, allday: r.allday, half: r.half, acc: r.acc, by: r.by })))
  say('A3 the input: ' + JSON.stringify(inp))
  judge(/^ATCH\/s-a\/whole$/.test(brief(cell)) && inp.length === 1 && inp[0].allday === true && inp[0].acc === 'u', `A3 a whole-day ATCH filed on a closed day: ${brief(cell)}; ${JSON.stringify(inp)}`)
  say('R13 My leave after: ' + await myLeave())
  judge(await myLeave() === leave0, `R13 "My leave" is unchanged by an Attach (before "${leave0}", after "${await myLeave()}")`)
}
await M.winPic(m, `r13-${tag}-1-top`, { sel: T('my-leave'), above: 0 }).catch(() => {})
await P.evaluate(() => window.scrollTo(0, 0)); await P.waitForTimeout(300)
await P.screenshot({ path: path.join(L.OUT, `r13-${tag}-2-my-leave-top.png`), clip: { x: 0, y: 0, width: 402, height: 330 }, scale: 'css' })
console.log(`SUMMARY [phone/${engine}]: ${lines.filter(l => /^(ok|WRONG)/.test(l)).length} judged, ${bad.length} wrong`)
for (const x of bad) console.log('   WRONG: ' + x)
console.log('errors:', JSON.stringify(m.errs))
await m.ctx.close(); await M.closeBrowser()
