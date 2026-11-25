// shr-c-c4c6 v1 — Share C, C6 and C4.
//   C6 (Opus S14 a): a ONE-man leave (LL Ranger alone 08:00–10:00, Wed 15 Jul, filed by the admin on the Inputs page); Ranger
//      signed in, his own cell → words typed, Enter; changed, left; ✕; reopened. EXPECTED: saves as before, on that same
//      input (no new one); RECORD any refusal.
//   C4 (Astra S12): the admin's drag window — Ranger's days Mon 13 – Wed 15 Jul dragged over the shared leave (Ranger + Hex,
//      08:00–10:00, Mon–Wed); what it shows; words typed; ✕. A fresh fixture: the same, then Move pressed. EXPECTED: the
//      shared Inputs-page leave left alone or changed for Ranger only; RECORD exactly what the window shows and saves.
//   WR4_OUT=<dir> WR4_NEW=.tmp/build-6c7f3aac7 SZ=desk|phone ONLY=C6,C4close,C4move node scripts/handpass/shr-c-c4c6.mjs
import * as C from './shr-c-lib.mjs'
const { L, T, J, sleep } = C
const SZ = process.env.SZ || 'desk', ENG = 'chromium', tg = `${SZ}-${ENG}`
const ONLY = new Set((process.env.ONLY || 'C6,C4close,C4move').split(','))
console.log('shr-c-c4c6 v1', tg, L.OUT, [...ONLY])
const WED = '2026-07-15', MON = '2026-07-13', DAYS = ['Jul 13', 'Jul 14', 'Jul 15']
const st = P => C.store(P, ['bane', 'rocky'], DAYS)

if (ONLY.has('C6')) {
  let w = null; const pics = [], log = []
  try {
    w = await C.world(SZ, ENG); const P = w.page
    await C.signIn(w, 'ad')
    const iid = await L.fileInput(w, 'c6', WED, { type: 'LL', people: [L.RANGER], from: '08:00', to: '10:00' })
    const s0 = await st(P); log.push(['filed', s0])
    if (!iid || !s0.some(x => x.includes(iid) && /^Ranger LL/.test(x))) throw new Error('fixture did not land ' + J(s0))
    await C.signOutIn(w, 'us'); await C.toWar(w)
    await C.openCell(w, 'bane', WED, w.phone ? `c6-${tg}-01-open-q` : null)
    const sh = await C.sheet(P)
    pics.push(await C.pic(w, `c6-${tg}-01-window`, [T('remarks-sheet'), T('bid-picker')], 12))
    const BOX = (await C.vis(P, T('remarks-remarks'))) ? T('remarks-remarks') : T('bid-remarks')
    const WIN = BOX === T('remarks-remarks') ? T('remarks-sheet') : T('bid-picker')
    await C.typeInto(w, BOX, 'Solo words'); await P.keyboard.press('Enter'); await sleep(700)
    const n1 = await L.shownToast(P); const s1 = await st(P); const b1 = await C.valueOf(P, BOX); log.push(['Enter', s1, b1, n1])
    pics.push(await C.pic(w, `c6-${tg}-02-save1`, [WIN], 12))
    await C.typeInto(w, BOX, 'Solo words again'); await C.leaveBox(w, WIN, w.phone ? `c6-${tg}-03-left-q` : null)
    const n2 = await L.shownToast(P); const s2 = await st(P); const b2 = await C.valueOf(P, BOX); log.push(['left', s2, b2, n2])
    await C.closeAny(w); await C.openCell(w, 'bane', WED)
    const b3 = await C.valueOf(P, BOX), s3 = await st(P); log.push(['reopened', s3, b3])
    pics.push(await C.pic(w, `c6-${tg}-04-reopened`, [WIN], 12))
    const ok = s1.length === 1 && s1[0].includes(`[${iid}]`) && /rmk="Solo words"/.test(s1[0]) && s3.length === 1 && s3[0].includes(`[${iid}]`) && /rmk="Solo words again"/.test(s3[0]) && b3 === 'Solo words again' && !n1 && !n2
    C.rec('C6 a one-man leave\'s remark from Ranger\'s own cell (member): Enter, changed and left, ✕, reopened', tg, ok ? 'PASS' : 'FAIL', `window ${sh?.id} "${sh?.text?.slice(0, 120)}"; notes (refusals) ${J([n1, n2])}; ${J(log)}`, pics)
  } catch (e) { C.rec('C6', tg, 'NOT WALKED', 'the script could not act: ' + String(e).split('\n')[0].slice(0, 300) + ' ' + J(log), pics) }
  if (w) await w.ctx.close().catch(() => {})
}

async function drag(w, who, a, b) {
  const P = w.page
  await C.reachCell(w, who, b)
  const c1 = await C.centre(P, T(`cell-${who}-${a}`))
  const bb = await P.locator(T(`cell-${who}-${b}`)).boundingBox(); const c3 = { x: bb.x + bb.width / 2, y: bb.y + bb.height / 2 }
  if (w.phone) {
    const pts = [0, .25, .5, .75, 1].map(t => ({ x: Math.round(c1.x + (c3.x - c1.x) * t), y: Math.round(c1.y) }))
    await w.cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: pts[0].x, y: pts[0].y, id: 1 }] })
    await P.waitForTimeout(420)
    for (const p of pts.slice(1)) { await w.cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: p.x, y: p.y, id: 1 }] }); await P.waitForTimeout(40) }
    await P.waitForTimeout(90)
    await w.cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
    await P.waitForTimeout(500)
  } else { await P.mouse.move(c1.x, c1.y); await P.mouse.down(); await P.mouse.move((c1.x + c3.x) / 2, c1.y, { steps: 4 }); await P.mouse.move(c3.x, c3.y, { steps: 4 }); await P.mouse.up(); await P.waitForTimeout(600) }
}
for (const [id, end] of [['C4close', 'close'], ['C4move', 'move']]) {
  if (!ONLY.has(id)) continue
  let w = null; const pics = [], log = []
  try {
    w = await C.world(SZ, ENG); const P = w.page
    await C.signIn(w, 'ad')
    const iid = await C.fileRange(w, id, MON, WED)
    const s0 = await st(P); log.push(['filed', s0])
    if (!iid) throw new Error('fixture did not land ' + J(s0))
    await C.toWar(w)
    await drag(w, 'bane', MON, WED)
    const sh = await C.sheet(P)
    const tids = sh?.tids || []
    console.log('DRAG WINDOW', J(sh))
    pics.push(await C.pic(w, `c4-${tg}-${id}-01-window`, [T('select-sheet'), T('bid-picker'), T('daylist-sheet')], 12))
    if (sh?.id !== 'select-sheet') { C.rec(`C4 ${id} the drag window over the shared leave`, tg, 'RECORDED', `the drag opened ${J(sh?.id)} "${sh?.text}" — not the drag window; store ${J(s0)}`, pics); continue }
    const box = tids.find(t => /remarks$/.test(t))
    let typed = null
    if (box) { await C.typeInto(w, T(box), `Ranger run ${id}`); typed = await C.valueOf(P, T(box)) }
    const s1 = await st(P); log.push(['typed', s1, typed])
    pics.push(await C.pic(w, `c4-${tg}-${id}-02-typed`, [T('select-sheet')], 12))
    let after
    if (end === 'close') { await C.press(w, T('sel-cancel'), w.phone ? `c4-${tg}-${id}-03-close-q` : null); await sleep(600) }
    else {
      const mv = tids.find(t => /move|shift/i.test(t))
      if (!mv) { log.push(['no Move offered', tids]) } else { await C.press(w, T(mv), w.phone ? `c4-${tg}-${id}-03-move-q` : null); await sleep(700) }
    }
    after = await C.sheet(P)
    const note = await L.shownToast(P), s2 = await st(P); log.push([`after ${end}`, s2, note, after?.id, after?.text?.slice(0, 240)])
    pics.push(await C.pic(w, `c4-${tg}-${id}-04-after`, [T('select-sheet'), '[role=dialog]', T(`cell-bane-${MON}`), T(`cell-bane-${WED}`), T(`cell-rocky-${WED}`)], 20))
    await C.closeAny(w)
    const fin = await st(P)
    const sharedSame = fin.length === 1 && fin[0].includes(`[${iid}]`) && /^Ranger\+Hex LL Jul 13–Jul 15 480-600 rmk="" /.test(fin[0])
    const hexOk = fin.some(x => /^(Ranger\+Hex|Hex) LL Jul 13–Jul 15 480-600 rmk="" till=- docs=0 /.test(x))
    const rangerOnly = !sharedSame && hexOk && fin.filter(x => /^Hex/.test(x)).length <= 1
    C.rec(`C4 ${id} the drag window (admin) over Ranger's three days of the shared leave: words typed, then ${end === 'close' ? '✕' : 'Move'}`, tg, sharedSame || rangerOnly ? 'PASS' : 'FAIL',
      `the window: ${J(sh.text)}; its controls ${J(tids)}; words box ${J(box)} held ${J(typed)}; ${J(log)}; final store ${J(fin)} — the shared leave ${sharedSame ? 'left alone' : rangerOnly ? 'changed for Ranger only' : 'CHANGED for Hex too'}`, pics)
  } catch (e) { C.rec(`C4 ${id}`, tg, 'NOT WALKED', 'the script could not act: ' + String(e).split('\n')[0].slice(0, 300) + ' ' + J(log), pics) }
  if (w) await w.ctx.close().catch(() => {})
}
console.log('ERRORS', J(L.facts.errors))
C.saveResults(`c4c6-${tg}.json`)
await L.finish()
