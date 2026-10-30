// The small fixes of 30 Oct 26 — his D1525 ([LW-HALF-WORDS-ELSEWHERE]): wherever the Leave War writes a half day in words it
// reads AM or PM after the code — "LL (AM)" — and a whole day the code alone. Through the app's own controls: the admin
// places an approved morning LL and an approved afternoon OL on Ranger's day (the day's list), an approved morning LL alone
// on another day (his approved-leave window), and a pending morning LL (his bid); then signs out, Ranger signs in on the same
// page (no reload — the walk's world is not saved) and reads his bell and his two windows. SIZE=desk (default) or phone.
process.env.LW_OUT ||= '2026-10-30-lw-small-fixes/s5'
const L = await import('./lw-sf-lib.mjs')
const { T } = L
const SIZE = process.env.SIZE || 'desk'
console.log('[lw-sf-s5 v1]', SIZE)
L.clearOut()
const w = await L.newCtx(SIZE === 'phone' ? 'phone' : 'desk')
const P = w.page
await L.signIn(w, 'admin')
const R = 'bane', TWO = '2026-11-12', ONE = '2026-11-17', BID = '2026-11-19'
const flat = s => (s || '').replace(/\s+/g, ' ').trim()

/* place a leave of `type` on one half, Auto-approve as asked */
async function place(iso, half, type, approve) {
  await L.openCell(w, R, iso); await L.autoApprove(w, approve)
  await L.press(w, T(`portion-${half}`)).catch(() => {}); await P.waitForTimeout(200)
  const ok = await L.placeLeave(w, type)
  await L.closeWin(w)
  return ok
}
const a1 = await place(TWO, 'am', 'LL', true)
const a2 = await place(TWO, 'pm', 'OL', true)
const a3 = await place(ONE, 'am', 'LL', true)
const a4 = await place(BID, 'am', 'LL', false)
console.log('placed', a1, a2, a3, a4)

/* 1. the day's list of a day with two halves — its lines say AM / PM after each box */
await L.openCell(w, R, TWO, w.phone ? 'a1-daylist-q' : null)
const dl = await P.evaluate(() => [...document.querySelectorAll('[data-testid="daylist"] li .dl-main')].map(e => e.textContent.trim()))
await L.shot(w, 'a1-daylist')
L.rec('D1525 the day’s list names each half AM / PM', SIZE, dl.length === 2 && dl[0] === 'AM · approved' && dl[1] === 'PM · approved' ? 'PASS' : 'FAIL', `lines: ${dl.join(' | ')}`, ['a1-daylist'])
await L.closeWin(w)

/* 2. Ranger signs in on the same page: his bell, then his own approved morning, then his pending morning bid */
if (w.phone) { await L.press(w, '#burger'); await P.waitForTimeout(300); await L.press(w, '#drawerLogout') } else await L.press(w, '#logout')
await P.waitForSelector('#loginForm'); await P.waitForTimeout(300)
await P.fill('#luser', 'us'); await P.fill('#lpass', 'us'); await P.click('#loginForm button[type=submit]')
await P.waitForSelector('#vWeek .day', { state: 'attached' })
await L.openWar(w, 'member')
await L.press(w, '#notifyBell'); await P.waitForTimeout(600)
const bell = await P.evaluate(() => [...document.querySelectorAll('[data-testid="bell-list"] li, [data-testid="bell-list"] [role="listitem"], [data-testid="bell-list"] > *')].map(e => e.textContent.replace(/\s+/g, ' ').trim()).filter(Boolean))
await L.shot(w, 'a2-bell')
const bellAll = bell.join(' | ')
L.rec('D1525 his bell names the half: "LL (AM) added and approved", "OL (PM) …"', SIZE,
  /LL \(AM\) added and approved/.test(bellAll) && /OL \(PM\) added and approved/.test(bellAll) && !/\bmorning\b|\bafternoon\b/i.test(bellAll) ? 'PASS' : 'FAIL', `bell: ${bellAll.slice(0, 400)}`, ['a2-bell'])
await P.keyboard.press('Escape'); await P.waitForTimeout(300)

await L.openCell(w, R, ONE, w.phone ? 'a3-approved-q' : null)
const which = await P.evaluate(() => ['remarks-sheet', 'bid-picker', 'daylist-sheet', 'closed-note'].filter(id => document.querySelector(`[data-testid="${id}"]`)))
const head = flat(await L.txt(P, '[data-testid="remarks-sheet"] .bidsheet-hd .cur'))
await L.shot(w, 'a3-approved')
L.rec('D1525 his approved-leave window: "LL (AM)" in its title', SIZE, head === 'LL (AM)' ? 'PASS' : 'FAIL', `opened ${which.join(',')}; title "${head}"`, ['a3-approved'])
await L.closeWin(w)

await L.openCell(w, R, BID, w.phone ? 'a4-bid-q' : null)
const which2 = await P.evaluate(() => ['remarks-sheet', 'bid-picker', 'daylist-sheet', 'closed-note'].filter(id => document.querySelector(`[data-testid="${id}"]`)))
const said = flat(await L.txt(P, '[data-testid^="closed-bid-"]')) || flat(await L.txt(P, '[data-testid="bid-picker"] .bidsheet-hd'))
await L.shot(w, 'a4-bid')
L.rec('D1525 his pending morning bid’s window (look only — closed-day window if the day is closed)', SIZE, 'LOOK', `opened ${which2.join(',')}; says "${said}"`, ['a4-bid'])
await L.closeWin(w)

console.log('errors:', w.errs.length ? w.errs : 'none')
L.writeResults('s5-' + SIZE)
await L.closeBrowser()
