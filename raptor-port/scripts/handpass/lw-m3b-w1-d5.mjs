// W1 part d5 — scenario 5 (member, phone): his own refused bid lights nothing and rings nothing.
// The refused bid is made by the admin (Saber) in a first context on real storage; the member then signs in in a SECOND context
// started from that context's saved storage (walk-scripts §3). Bidding is opened for Nov 2026 through the open-dates window.
// Usage (from raptor-port/): node scripts/handpass/lw-m3b-w1-d5.mjs [chromium|webkit]
const M = await import('./lw-m3b-w1-lib.mjs')
const { L, T } = M
const engine = process.argv[2] || 'chromium'
const tag = engine === 'webkit' ? 'wk' : 'cr'
L.clearPrefix('s5-' + tag)
console.log('lw-m3b-w1-d5 phone/' + engine, 'out', L.OUT)
const lines = [], bad = []
const say = s => { lines.push(s); console.log('   ' + s) }
const judge = (ok, s) => { if (!ok) bad.push(s); say((ok ? 'ok    ' : 'WRONG ') + s) }
const OPEN = '2026-11-24', CLOSED = '2026-12-02'

/* the admin's world */
const a = await M.start('phone', engine)
const AP = a.page
say('open-dates window after the Nov button: ' + await M.openMonths(a, ['2026-11']))
for (const d of [OPEN, CLOSED]) {
  await M.bidType(a, 'bane', d, { approve: false })
  await L.openCellR(a, 'bane', d); await AP.waitForSelector(T('bid-picker'))
  await L.press(a, T('decide-refuse')); await AP.waitForTimeout(500)
  say(`admin: ${d} -> ${(await M.cellWords(AP, 'bane', d)).boxes[0].split('|')[2]} (s-r = refused); record ${await M.stateOf(AP, 'bane', d)}`)
}
await L.closeAny(a)
const state = await a.ctx.storageState()
console.log('   admin errors:', JSON.stringify(a.errs))
await a.ctx.close()

/* the member's world, from the saved storage */
const m = await M.newCtx('phone', engine, state)
const P = m.page
await L.signInPlain(m, 'member'); await M.hideTransient(P)
console.log('page scripts:', await M.scriptCheck(m))
say('member signed in; his refused bid on ' + OPEN + ': ' + await M.stateOf(P, 'bane', OPEN))
judge(/refused/.test(await M.stateOf(P, 'bane', OPEN)), 'the fixture reached the member (a refused bid on ' + OPEN + ')')

/* ---- on the day open for bidding ---- */
await L.openCellR(m, 'bane', OPEN, `s5-${tag}-1-open-q`)
await P.waitForTimeout(500)
const dump = await L.sheetDump(P)
say(`open day: a tap opens ${dump?.id}: "${(dump?.text || '').slice(0, 260)}"`)
await M.winPic(m, `s5-${tag}-2-open-window`, { sel: dump?.id === 'daylist' ? T('daylist') : T('bid-picker') })
const st = await M.btnState(P, ['bid-LL', 'bid-OL', 'bid-OIL', 'decide-approve', 'decide-refuse'])
say('buttons: ' + st.map(b => b.there ? `${b.id}[${b.text}] ring ${b.outline} cls "${b.cls}" pressed ${b.pressed}` : `${b.id} (not drawn)`).join(' | '))
const ll = st[0]
judge(ll.there && !/\blit\b/.test(ll.cls) && !ll.outline.startsWith('solid'), `his own refused bid: LL button not lit / ringed (cls "${ll.cls}", outline ${ll.outline})`)
judge(!st[3].there && !st[4].there, `a member's window offers no Approve / Refuse (drawn: approve ${st[3].there}, refuse ${st[4].there})`)
const litAny = await P.evaluate(() => [...document.querySelectorAll('[data-testid="bid-picker"] [aria-pressed="true"], [data-testid="bid-picker"] .lit')].map(e => (e.dataset.testid || e.className) + ':' + e.textContent.trim().slice(0, 12)))
say('anything lit or aria-pressed in the window: ' + JSON.stringify(litAny))
await L.closeAny(m)
await L.cellShot(m, 'bane', OPEN, `s5-${tag}-3-cell-refused`)

/* ---- on the day closed for him ---- */
await L.openCellR(m, 'bane', CLOSED, `s5-${tag}-4-closed-q`)
await P.waitForTimeout(500)
const d2 = await L.sheetDump(P)
say(`closed day: a tap opens ${d2?.id}: "${(d2?.text || '').slice(0, 300)}"`)
await M.winPic(m, `s5-${tag}-5-closed-window`, { sel: d2?.id === 'closed-note' ? T('closed-note') : '.bidsheet, [role="dialog"]' })
const lit2 = await P.evaluate(() => [...document.querySelectorAll('[data-testid="closed-note"] [aria-pressed="true"], [data-testid="closed-note"] .lit')].map(e => (e.dataset.testid || e.className) + ':' + e.textContent.trim().slice(0, 12)))
judge(lit2.length === 0, 'closed day: nothing lit or pressed in his closed-day window: ' + JSON.stringify(lit2))
await L.closeAny(m)
console.log(`SUMMARY [phone/${engine}]: ${lines.filter(l => /^(ok|WRONG)/.test(l)).length} judged, ${bad.length} wrong`)
for (const b of bad) console.log('   WRONG: ' + b)
console.log('errors:', JSON.stringify(m.errs))
await m.ctx.close(); await M.closeBrowser()
