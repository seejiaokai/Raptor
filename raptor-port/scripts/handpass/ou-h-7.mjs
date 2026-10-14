/* helper walk S20: the "not answered" bar left up, and the place changed. A world on real storage so a reload keeps what was saved.
   usage: DL_BASE=... DL_SHOTS=... node scripts/handpass/ou-h-7.mjs [desk|phone] */
import { L, J, pworld, bar, sheet, rec, noteNow, board, closeBoard, uncx, fixture, signAs, rowOut, part, SAT, SAT_ISO } from './ou-h-0.mjs'
const SIZE = process.argv[2] === 'phone' ? 'phone' : 'desk', T = SIZE, S = `S20 ${T}`
const w = await pworld(SIZE), p = w.page
console.log('ou-h-7 S20 version 1', SIZE)
const click = sel => p.evaluate(s => { const e = [...document.querySelectorAll(s)].find(x => x.getClientRects().length); if (e) { e.click(); return true } return false }, sel)
/** the cancel's question opened on Saturday's board, then left: the bar */
async function raise(id) {
  await board(w, SAT)
  await uncx(w, SAT, id)
  await w.press('[data-testid="oilconf-cancel"]'); await L.sleep(500)
  return bar(p)
}
/** press "Answer OIL" and read what came of it; answer "Don't un-cancel" if a question opened */
async function answerOil(id) {
  const had = !!(await bar(p))
  if (!had) return { had }
  await w.press('[data-testid="oilbar-answer"]'); await L.sleep(500)
  const q = await sheet(p), note = await noteNow(p), r = await rec(p, id)
  if (q) { await w.press('[data-testid="oilconf-cancel"]'); await L.sleep(400) }
  return { had, q, note, r }
}
try {
  let X
  await part(w, S, 'S20a fixture', 'a cancelled, unanswered input on Saturday', async () => {
    X = await fixture(w, 'bane', 'Range brief')
    rowOut(S, 'S20a fixture', 'cancelled with its reason, on Sat 18, no answer', `input ${J(X.now)}; asked at the move: ${X.asked}`, X.now.cx && X.now.cxr === 'WX' && !X.now.oil && !X.asked)
  })
  await part(w, S, 'S20b the board stepped to the next day', 'RECORD (Q7): whether the bar stays; and what "Answer OIL" does from another day', async () => {
    const b0 = await raise(X.id)
    await click('#sbNextDay'); await L.sleep(700)
    const b1 = await bar(p)
    await L.pic(w, `S20b-next-day-${T}`)
    const a = await answerOil(X.id)
    rowOut(S, 'S20b the board stepped to the next day', 'RECORD: the bar and "Answer OIL" from Sunday', `bar before ${J(b0)}; on Sunday the bar ${J(b1)}; "Answer OIL": ${J(a)}`, !!b0)
  })
  await part(w, S, 'S20c the board closed with Done', 'RECORD (Q7): whether the bar stays', async () => {
    const b0 = await raise(X.id)
    await closeBoard(w); await L.sleep(400)
    const b1 = await bar(p), r = await rec(p, X.id)
    await L.pic(w, `S20c-done-${T}`)
    rowOut(S, 'S20c Done', 'RECORD: the bar after Done', `bar before ${J(b0)}; after Done ${J(b1)}; input ${J(r)}`, !!b0)
    if (b1) { const a = await answerOil(X.id); console.log('   answer after Done', J(a)) }
  })
  await part(w, S, 'S20d the page changed', 'the bar is gone (ui-contracts: a page changing takes it away)', async () => {
    const b0 = await raise(X.id)
    await L.go(w, 'leavewar'); await L.sleep(500)
    const b1 = await bar(p)
    await L.go(w, 'editsched'); await L.sleep(500)
    const b2 = await bar(p)
    await L.pic(w, `S20d-page-${T}`)
    rowOut(S, 'S20d the page changed', 'the bar gone on the other page and gone on coming back', `bar before ${J(b0)}; on Leave War ${J(b1)}; back on Edit Schedule ${J(b2)}`, !!b0 && !b1 && !b2)
  })
  await part(w, S, 'S20e the week changed', 'the bar is gone (a week changing takes it away)', async () => {
    const b0 = await raise(X.id)
    let moved = await click('[data-sbweek="1"]'); let how = 'the week arrow'
    if (!moved) { how = 'Next day pressed twice (Sat to Sun to Mon of the next week)'; moved = await click('#sbNextDay'); await L.sleep(500); moved = (await click('#sbNextDay')) && moved }
    await L.sleep(800)
    const b1 = await bar(p)
    await L.pic(w, `S20e-week-${T}`)
    await click('[data-sbweek="-1"]') || await click('#sbPrevDay'); await L.sleep(800)
    const b2 = await bar(p)
    rowOut(S, 'S20e the week changed', 'the bar gone after stepping to the next week', `bar before ${J(b0)}; week stepped ${moved} by ${how}; bar ${J(b1)}; after stepping back ${J(b2)}`, !!b0 && moved && !b1)
  })
  await part(w, S, 'S20f the name badge to the member view', 'RECORD: the bar; "Answer OIL" in the member view must not un-cancel (D760 reading 2)', async () => {
    const b0 = await raise(X.id)
    await closeBoard(w)
    const bb = await bar(p)
    await p.locator('#roleBadge').evaluate(e => e.click()); await L.sleep(700)
    const b1 = await bar(p), q = await sheet(p)
    await L.pic(w, `S20f-member-view-${T}`)
    const a = b1 ? await answerOil(X.id) : null
    const r = await rec(p, X.id)
    await p.locator('#roleBadge').evaluate(e => e.click()); await L.sleep(700)
    rowOut(S, 'S20f member view', 'the bar gone, or "Answer OIL" does not un-cancel', `bar before ${J(b0)}; after Done ${J(bb)}; in the member view: bar ${J(b1)}, sheet ${J(q)}; "Answer OIL" there: ${J(a)}; input ${J(r)}`, !!b0 && (!b1 || (a && !a.q && r.cx)) && r.cx && !r.oil)
  })
  await part(w, S, 'S20g sign out and in as a member', 'the bar is gone; the member cannot un-cancel', async () => {
    const b0 = await raise(X.id)
    await signAs(w, 'us', 'us')
    const b1 = await bar(p)
    await L.pic(w, `S20g-member-${T}`)
    await signAs(w, 'ad', 'a')
    const b2 = await bar(p), r = await rec(p, X.id)
    rowOut(S, 'S20g sign out and in', 'the bar gone for the member and gone again on the admin\'s return; still cancelled', `bar before ${J(b0)}; as the member ${J(b1)}; admin back ${J(b2)}; input ${J(r)}`, !!b0 && !b1 && !b2 && r.cx && !r.oil)
  })
  await part(w, S, 'S20h sign in as another admin', 'a second admin account', async () => {
    L.row(S, 'S20h another admin', 'the bar gone', 'there is no second admin account on this world (only Saber, `ad`); making one is Admin → Users work outside this scenario', 'NOT WALKED')
  })
  await part(w, S, 'S20i reload', 'after a reload the input is still cancelled with its reason, no stray answer; the bar gone', async () => {
    const b0 = await raise(X.id)
    await p.reload(); await L.sleep(1500)
    if (await p.locator('#luser').isVisible().catch(() => false)) { await p.fill('#luser', 'ad'); await p.fill('#lpass', 'a'); await p.click('#loginForm button[type=submit]'); await p.waitForSelector('#vWeek .day', { state: 'attached', timeout: 20000 }) }
    await L.sleep(800)
    const b1 = await bar(p), r = await rec(p, X.id).catch(e => 'ERR ' + e.message.slice(0, 80))
    await L.pic(w, `S20i-reload-${T}`)
    rowOut(S, 'S20i reload', 'still cancelled with WX, no answer; the bar gone', `bar before ${J(b0)}; after the reload ${J(b1)}; input ${J(r)}`, !!b0 && !b1 && r && r.cx && r.cxr === 'WX' && !r.oil)
  })
} finally { await L.close(w) }
