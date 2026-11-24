// swd-w14b-probe — the routes w14b needs, proved on this build before any scenario uses them: P6 (does Saber's Undo list
// survive a reload of his own tab, after another man signed in and read in a second tab?), Hex's sign-in and his demo days,
// the top bar's Undo / Redo of a Quals tick. Desktop, fresh worlds. Run from raptor-port/:
//   W14B_RUN=probe node scripts/handpass/swd-w14b-probe.mjs
import './swd-w14b-env.mjs'
const Z = await import('./swd-w14b-lib.mjs')
const { T, L, K, RANGER, HEX, bell, sayB, asR, asS, asH, sleep, J, tickOf, fileMe, topBar, tbSay, seatOn } = Z
console.log('VERSION swd-w14b-probe 1 · bundle served on', process.env.W2_URL)
const R = (W, id, what, ok, note, pic) => W.rec(id, what, ok, note, pic)

/* Hex: his sign-in, his demo days (week 1, week 2 read only), the top bar's Undo / Redo of a Quals tick */
await T.run('probeA', 'd', async (p, W) => {
  R(W, 'demo.hex1', 'Hex holds, week 1 (read)', 'REC', await T.holds(p, HEX))
  R(W, 'demo.ranger1', 'Ranger holds, week 1 (read)', 'REC', await T.holds(p, RANGER))
  await tickOf(p, W, HEX, true, 'tick')
  const u = await topBar(p, W, 'undo', HEX, 'undo1')
  R(W, 'tb.undo', 'top bar Undo after the tick', u.after.san === false ? true : false, tbSay(u), u.pic)
  const r = await topBar(p, W, 'redo', HEX, 'redo1')
  R(W, 'tb.redo', 'top bar Redo', r.after.san === true ? true : false, tbSay(r), r.pic)
  const who = await asH(p, W)
  R(W, 'hex.in', 'Hex signs in (hex / x)', /Hex/i.test(who) ? true : false, 'badge "' + who + '"', await W.pic(p, 'hex-in'))
  const b = await bell(p, W, 'hex-bell')
  R(W, 'hex.bell', 'Hex\'s bell, ticked, nothing seated new', 'REC', sayB(b), b.pic)
})

/* P6 */
await T.run('probe6', 'd', async (p, W, ctx) => {
  await tickOf(p, W, RANGER, true, 'p6.tick')
  await asR(p, W)
  await fileMe(p, W, 'Ranger', K.D[18], null, 'p6.file')
  await asS(p, W)
  await tickOf(p, W, RANGER, false, 'p6.untick')
  const t0 = await p.locator('#undoBtn').first().getAttribute('title').catch(() => '')
  R(W, 'p6.a', 'Saber tab A: Undo title before tab B', 'REC', `"${t0}" disabled ${await p.locator('#undoBtn').first().isDisabled().catch(() => '?')}`)
  const p2 = await ctx.newPage(); await p2.goto(L.URL_); await sleep(1500)
  const onIn = (await p2.locator('#luser:visible').count()) ? 'sign-in card' : 'signed in as ' + (await p2.locator('#roleBadge').first().textContent().catch(() => ''))
  R(W, 'p6.b', 'tab B opens on', 'REC', onIn, await W.pic(p2, 'p6-tabB-open'))
  if (!(await p2.locator('#luser:visible').count())) await L.signOut(p2, W)
  await L.signIn(p2, 'us', 'us')
  let b = await bell(p2, W, 'p6-tabB-bell')
  R(W, 'p6.c', 'Ranger in tab B: his bell', 'REC', sayB(b), b.pic)
  const c = b.change[0]
  if (c) { await X_tap(p2, W, c.id) }
  b = await bell(p2, W, 'p6-tabB-read')
  R(W, 'p6.d', 'Ranger read the C line (tab B)', b.change[0] && !b.change[0].unread ? true : false, sayB(b), b.pic)
  await T.closeAll(p2, W)
  await p.bringToFront()
  await p.reload(); await sleep(1800)
  const who = (await p.locator('#luser:visible').count()) ? 'the sign-in card' : 'signed in as ' + (await p.locator('#roleBadge').first().textContent().catch(() => ''))
  const t1 = await p.locator('#undoBtn').first().getAttribute('title').catch(() => '')
  const d1 = await p.locator('#undoBtn').first().isDisabled().catch(() => 'no button')
  R(W, 'p6.e', 'tab A reloaded: who is signed in, and Saber\'s Undo', 'REC', `${who} · Undo "${t1}" disabled ${d1}`, await W.pic(p, 'p6-tabA-reloaded'))
  if (/sign-in/.test(who)) { await L.signIn(p, 'ad', 'a'); R(W, 'p6.e2', 'tab A: Saber signs in again', 'REC', `Undo "${await p.locator('#undoBtn').first().getAttribute('title').catch(() => '')}" disabled ${await p.locator('#undoBtn').first().isDisabled().catch(() => '?')}`) }
  const u = await topBar(p, W, 'undo', RANGER, 'p6-undo')
  R(W, 'p6.f', 'tab A: the top bar Undo after the reload', 'REC', tbSay(u), u.pic)
  if (u.pressed) {
    await p2.bringToFront(); await p2.reload(); await sleep(1500)
    if (await p2.locator('#luser:visible').count()) await L.signIn(p2, 'us', 'us')
    b = await bell(p2, W, 'p6-tabB-afterundo')
    R(W, 'p6.g', 'tab B reloaded: Ranger\'s bell after Saber\'s Undo of the untick he had READ', 'REC', sayB(b), b.pic)
  }
  await p2.close()
})
async function X_tap(p, W, id) { await Z.X.bellTap(p, W, id, 'p6-tap'); await T.closeAll(p, W) }
process.exit(0)
