// sns-w1A — walker A's walk of D2573 (a SANS man struck on a flying seat with no times yet), chat 179, 25 Nov 26.
// Scenarios F1 F2 F4 F5 F9 F10 F11 F16 F17 and A-S06 A-S16 A-S20 A-S21, plus the plain-user round (brief: D:/raptor-work/
// c179-walk/BRIEF.md). Run from raptor-port/, one scenario and size a run:
//   SNSA_RUN=<run> ONLY=<scenario> SZ=d|p|pc node scripts/handpass/sns-w1A.mjs
import './sns-w1A-env.mjs'
const A = await import('./sns-w1A-lib.mjs')
const { T, L, W5, RANGER, IPMAN, D, sleep, J, addLine, boardArm, boardPick, crewAll, who, say1, sayAll, weekArm, weekPick, crewPics,
  disarm, noteWatch, notesSeen, dragPath, hoverSay, rings, sbUndo, sbRedo, bflds, commit, noteFits, seatHolds, need, run, RLONG, TODAYW } = A
const ONLY = process.env.ONLY || 'F1', SZ = process.env.SZ || 'd'
console.log(`VERSION sns-w1A 1 · ${ONLY} · ${SZ} · bundle ${process.env.W2_URL} · out ${A.OUT}`)
const ACE = 'dj', BOLT = 'yeti', MARLIN = 'cards', HUNTER = 'prowler'
const ISO18 = '2026-07-18'
const R_NOTE = 'Ranger — ' + RLONG, J_NOTE = 'Jester — ' + TODAYW
const one = (c, id) => who(c, id)[0] || null
const postR = async (p, W) => { const r = await A.Z.post(p, W, RANGER, D[17], 'set.post'); return r }
/* the board's pick with notes logged from the press */
async function pickLogged(p, W, key, id, tag) { await noteWatch(p); const pk = await boardPick(p, W, key, id, tag); await sleep(400); return { ...pk, seen: await notesSeen(p), fits: await noteFits(p) } }
async function placeBy(p, W, di, key, id, tag) { const r = await boardArm(p, W, di, key, tag); if (!r.armed) return { placed: '', why: 'not armed' }; return pickLogged(p, W, key, id, tag) }

const S = {}

/* F1 = A-S02 — the drop's note after a tap with a seat picked; the drag's note; both with and without a newer warning */
S.F1 = async (p, W) => {
  await postR(p, W)
  const a = await addLine(p, W, 5, { cs: 'SNSA' })
  need(W, 'set.line', 'Sat 18: a flying line SNSA, no times', a.wi >= 0 && !a.f.to && !a.f.ld, J(a))
  const kp = `5.${a.wi}.0.0.p`, kw = `5.${a.wi}.0.0.w`
  const r = await boardArm(p, W, 5, kp, 'f1-arm')
  const rg = one(r.c, RANGER)
  W.rec('F1.0', 'before the press: FCP armed, Ranger in the crew list', rg && rg.struck && rg.printed === RLONG, `armed ${r.armed} · ${say1(r.c, RANGER)}`, await crewPics(p, W, '#schedBoard', RANGER, 'f1-arm'))
  const pk = await pickLogged(p, W, kp, RANGER, 'f1-tap')
  W.rec('F1.1', 'tap Ranger (first man on the blank line): he lands in the seat, never refused', pk.placed === RANGER, `seat holds "${pk.placed}"`, pk.notePic)
  W.rec('F1.2', `the note after the tap reads "${R_NOTE}" (Fable's EXPECTED, F1)`, pk.seen.includes(R_NOTE), `notes raised in order ${J(pk.seen)} · left showing "${pk.note}" · ${pk.fits}`, pk.notePic)
  await sbUndo(p, W)
  W.rec('F1.3', 'board Undo: the seat empties', (await seatHolds(p, kp)) === '', `seat "${await seatHolds(p, kp)}"`, await W.pic(p, 'f1-undo'))
  if (!W.isPhone) {
    await W5.boardDrawer(p, W, true); await noteWatch(p)
    const d = await dragPath(p, W, p.locator(`#schedBoard .rpuck[data-person="${RANGER}"]:visible`).first(), [p.locator(`#schedBoard [data-slot="${kp}"]:visible`).first()], 'f1-drag')
    await sleep(400)
    W.rec('F1.4', 'drag Ranger from the crew list into FCP: hover and note', (await seatHolds(p, kp)) === RANGER, `hover ${hoverSay(d.seen[0] && d.seen[0].hover)} · notes ${J(await notesSeen(p))} · seat "${await seatHolds(p, kp)}"`, [d.seen[0] && d.seen[0].pic, d.npic].join(', '))
    await sbUndo(p, W)
  }
  // a newer warning out of the way: Ace (not SANS) in FCP first, then Ranger into the same line's RCP
  const ace = await placeBy(p, W, 5, kp, ACE, 'f1-ace')
  need(W, 'set.ace', 'Ace planned into the blank line FCP first (its no-times warning now up)', ace.placed === ACE, `seat "${ace.placed}" · notes ${J(ace.seen)}`, ace.notePic)
  const r2 = await boardArm(p, W, 5, kw, 'f1-armw')
  W.rec('F1.5', 'before the press: RCP armed, Ranger struck with the reason', !!one(r2.c, RANGER) && one(r2.c, RANGER).printed === RLONG, say1(r2.c, RANGER), await crewPics(p, W, '#schedBoard', RANGER, 'f1-armw'))
  const pk2 = await pickLogged(p, W, kw, RANGER, 'f1-tapw')
  W.rec('F1.6', `A-S02: tap Ranger into RCP with no newer warning: placed, note "${R_NOTE}" — the crew list's words`, pk2.placed === RANGER && pk2.seen.includes(R_NOTE), `seat "${pk2.placed}" · notes ${J(pk2.seen)} · left "${pk2.note}" · ${pk2.fits}`, pk2.notePic)
  if (!W.isPhone) {
    await sbUndo(p, W)
    await W5.boardDrawer(p, W, true); await noteWatch(p)
    const d = await dragPath(p, W, p.locator(`#schedBoard .rpuck[data-person="${RANGER}"]:visible`).first(), [p.locator(`#schedBoard [data-slot="${kw}"]:visible`).first()], 'f1-dragw')
    await sleep(400)
    const ns = await notesSeen(p)
    W.rec('F1.7', 'A-S02: drag Ranger into RCP: placed, the same note as the tap', (await seatHolds(p, kw)) === RANGER && ns.includes(R_NOTE), `hover ${hoverSay(d.seen[0] && d.seen[0].hover)} · notes ${J(ns)} · seat "${await seatHolds(p, kw)}"`, [d.seen[0] && d.seen[0].pic, d.npic].join(', '))
  }
}

/* F2 = A-S05 + A-S04 (and F10, the board's half): the crew list with a seat picked — struck, reason printed, counted out */
S.F2 = async (p, W) => {
  await postR(p, W)
  const f = await commit(p, W, ISO18, BOLT, ['fly'], 'all', 'f2-bolt')
  need(W, 'set.bolt', 'Saber files Fly all day on Sat 18 for Bolt (a SANS pilot), so one SANS man is free', !!f.iid, J(f.rec), f.pic)
  await W5.closeSansWin(p, W)
  const a = await addLine(p, W, 5, { cs: 'SNSA' })
  need(W, 'set.line', 'Sat 18: a flying line SNSA, no times', a.wi >= 0 && !a.f.to, J(a))
  const kp = `5.${a.wi}.0.0.p`, kw = `5.${a.wi}.0.0.w`
  await L.openBoard(p, W, 5); await W5.boardDrawer(p, W, true)
  const u = await crewAll(p, '#schedBoard')
  const ur = one(u, RANGER)
  W.rec('F2.1', 'board, nothing picked: Ranger struck, no reason line (D2420)', !!ur && ur.struck && !ur.printed, `${sayAll(u)} · Ranger ${say1(u, RANGER)} · Bolt ${say1(u, BOLT)}`, await crewPics(p, W, '#schedBoard', RANGER, 'f2-unpicked'))
  const r = await boardArm(p, W, 5, kp, 'f2-fcp')
  const c = r.c, rg = one(c, RANGER), js = one(c, IPMAN), bo = one(c, BOLT)
  const pics = await crewPics(p, W, '#schedBoard', RANGER, 'f2-fcp')
  W.rec('F2.2', 'FCP picked: Ranger struck, his reason printed under his name', !!rg && rg.struck && rg.printed === RLONG, say1(c, RANGER), pics)
  W.rec('F2.3', 'FCP picked: Jester struck, "SANS — no availability filed for today"', !!js && js.struck && js.printed === TODAYW, say1(c, IPMAN), pics)
  const sansPilotsUnfiled = c.pucks.filter(x => x.where === 'SANS Avail' && x.id !== BOLT && !/WSO/.test(x.printed))
  W.rec('F2.4', 'FCP picked: every other unfiled SANS pilot struck with the today words; WSOs "WSO — cannot fly front seat"', sansPilotsUnfiled.length > 0 && sansPilotsUnfiled.every(x => x.struck && (x.printed === TODAYW || x.printed === RLONG)) && c.pucks.filter(x => x.where === 'SANS Avail' && /WSO/.test(x.printed)).every(x => x.struck && x.printed === 'WSO — cannot fly front seat'), c.pucks.filter(x => x.where === 'SANS Avail').map(x => `${x.id}${x.struck ? '(x)' : ''}:"${x.printed}"`).join(' · '), pics)
  W.rec('F2.5', 'Bolt (filed) plain, counted free; the free man before the struck ones; "N free" the same as with nothing picked', !!bo && !bo.struck && c.sansOrder[0] === BOLT && c.head === u.head, `head picked "${c.head}" vs unpicked "${u.head}" · order ${c.sansOrder.join(',')} · Bolt ${say1(c, BOLT)}`, pics)
  W.rec('F2.6', 'every printed reason line sits inside its panel at this width', c.pucks.filter(x => x.printed).every(x => x.inside !== false), c.pucks.filter(x => x.printed && x.inside === false).map(x => x.id + ' ' + J(x.box)).join(' · ') || `all ${c.pucks.filter(x => x.printed).length} inside (vw ${c.vw})`, pics)
  await disarm(p, W)
  const r2 = await boardArm(p, W, 5, kw, 'f2-rcp')
  const c2 = r2.c
  const p2 = await crewPics(p, W, '#schedBoard', RANGER, 'f2-rcp')
  W.rec('F2.7', 'RCP picked: Ranger and Jester struck with the same words as FCP', !!one(c2, RANGER) && one(c2, RANGER).printed === RLONG && !!one(c2, IPMAN) && one(c2, IPMAN).printed === TODAYW, `${say1(c2, RANGER)} · ${say1(c2, IPMAN)} · head "${c2.head}"`, p2)
  W.rec('F2.8', 'RCP picked: a SANS WSO (Marlin) — RECORDED what it shows', 'REC', say1(c2, MARLIN), p2)
  await disarm(p, W)
  const u2 = await crewAll(p, '#schedBoard')
  W.rec('F2.9', 'pick cancelled: printed reasons gone, Ranger still struck and out of the count', !!one(u2, RANGER) && one(u2, RANGER).struck && !u2.pucks.some(x => x.printed && x.where === 'SANS Avail') && u2.head === u.head, `${sayAll(u2)} · ${say1(u2, RANGER)}`, await crewPics(p, W, '#schedBoard', RANGER, 'f2-cancel'))
  // the same on Edit Schedule's crew panel
  await L.closeBoard(p, W)
  const w = await weekArm(p, W, kp, 'f2-wk')
  const wr = one(w.c, RANGER), wj = one(w.c, IPMAN)
  const wp = await crewPics(p, W, '.ros-body', RANGER, 'f2-wk')
  W.rec('F2.10', 'Edit Schedule: seat pressed in the week, the crew panel the same — struck, words, count, order', w.armed === kp && !!wr && wr.printed === RLONG && !!wj && wj.printed === TODAYW && w.c.sansOrder[0] === BOLT && w.c.head === u.head, `armed ${w.armed} · ${sayAll(w.c)} · ${say1(w.c, RANGER)} · ${say1(w.c, IPMAN)}`, wp)
  W.rec('F2.11', 'Edit Schedule crew panel: reason lines inside the panel', w.c.pucks.filter(x => x.printed).every(x => x.inside !== false), w.c.pucks.filter(x => x.printed && x.inside === false).map(x => x.id + ' ' + J(x.box)).join(' · ') || 'all inside', wp)
  // the crew panel's day arrows while armed (A-S05): which day the list follows
  const day0 = await p.locator('.ros-body .er-dayname').first().textContent().catch(() => '')
  const st = p.locator('.ros-body [data-crewstep="-1"]:visible').first()
  if (await st.count()) {
    await W.press(p, st, 'crewstep-back'); await sleep(400)
    const day1 = await p.locator('.ros-body .er-dayname').first().textContent().catch(() => '')
    const c3 = await crewAll(p, '.ros-body')
    W.rec('F2.12', 'A-S05: crew panel stepped back a day while the seat is armed — RECORDED which day it shows and Ranger', 'REC', `day "${day0}" → "${day1}" · ARM ${J(await p.evaluate(() => window.ARM && window.ARM.key))} · ${sayAll(c3)} · ${say1(c3, RANGER)}`, await crewPics(p, W, '.ros-body', RANGER, 'f2-step'))
    await W.press(p, '.ros-body [data-crewstep="1"]:visible', 'crewstep-fwd'); await sleep(400)
  } else W.rec('F2.12', 'A-S05: crew panel day arrows', 'NW', 'while a seat is armed the crew panel shows no day arrows (its heading reads "Tap a name to plan · <day>"), so the list cannot be stepped to another day', await W.pic(p, 'f2-noarrows'))
  await p.keyboard.press('Escape'); await sleep(300)
  // A-S04: the phone board in its Desktop layout
  if (W.isPhone) {
    await L.openBoard(p, W, 5)
    const dr = await p.evaluate(() => { const b = document.querySelector('#schedBoard .sb-ros .ros-body'); if (!b) return 'none'; const r = b.getBoundingClientRect(); return { left: Math.round(r.left), w: Math.round(r.width), out: r.width > 40 && r.left < window.innerWidth - 60 } })
    W.rec('F2.12b', 'LEAD: the phone board reopened from the week — is its AIRCREW drawer still out?', 'REC', 'drawer ' + J(dr), await W.pic(p, 'f2-reopen'))
    if (dr && dr.out) {
      await W.press(p, '#sbMore:visible', 'sb-more'); await sleep(400)
      W.rec('F2.12c', 'LEAD: the ⋯ menu pressed with the drawer out (picture: where the menu draws)', 'REC', '', await W.pic(p, 'f2-more-under-drawer'))
      await p.keyboard.press('Escape'); await sleep(300)
      await W5.boardDrawer(p, W, false)
    }
    await W.press(p, '#sbMore:visible', 'sb-more'); await sleep(400)
    const items = await p.evaluate(() => [...document.querySelectorAll('button, [role="menuitem"]')].filter(e => e.getBoundingClientRect().width > 0 && /layout|desktop|phone/i.test(e.textContent || '')).map(e => (e.textContent || '').trim()))
    const lay = p.locator('button:visible, [role="menuitem"]:visible', { hasText: /Desktop/ }).first()
    if (await lay.count()) {
      await W.press(p, lay, 'layout-desktop'); await sleep(800)
      const r3 = await boardArm(p, W, 5, kp, 'f2-dl')
      const x = one(r3.c, RANGER)
      W.rec('F2.13', 'A-S04: phone board in its Desktop layout — Ranger struck, full reason, inside its panel', !!x && x.struck && x.printed === RLONG && x.inside !== false, `menu ${J(items)} · armed ${r3.armed} · ${say1(r3.c, RANGER)}`, await crewPics(p, W, '#schedBoard', RANGER, 'f2-dl'))
      const tapOk = await p.locator(`#schedBoard .rpuck[data-person="${RANGER}"]:visible`).first().evaluate(e => { const r = e.getBoundingClientRect(); const t = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return !!t && (t === e || e.contains(t)) }).catch(() => false)
      W.rec('F2.14', 'A-S04: his name still reachable (nothing over it) in the Desktop layout', tapOk, `elementFromPoint at his puck hits it: ${tapOk}`)
    } else W.rec('F2.13', 'A-S04: the phone board\'s Desktop layout', 'NW', 'no Desktop layout item in the ⋯ menu: ' + J(items), await W.pic(p, 'f2-nomenu'))
  } else W.rec('F2.13', 'A-S04 desktop: narrowing and widening the crew panel', 'NW', 'no control to resize the board\'s crew panel was found on screen; the panel was read at its own width (F2.6)')
}

/* F4 = A-S07: the same words before and after the times are typed, cleared, half typed */
S.F4 = async (p, W) => {
  await postR(p, W)
  const a = await addLine(p, W, 5, { cs: 'SNSA' })
  need(W, 'set.line', 'Sat 18: a flying line SNSA, no times', a.wi >= 0 && !a.f.to, J(a))
  const kp = `5.${a.wi}.0.0.p`, f = k => `[data-bfld="ff:5.${a.wi}.0.${k}"]`
  const boxes = await bflds(p, 5, a.wi)
  W.rec('F4.boxes', 'the line\'s boxes on the board', 'REC', boxes.join(' '))
  const steps = [
    ['a', 'no times', async () => {}],
    ['b', 'take-off 13:00, landing 14:00', async () => { await L.typeBox(p, W, f('to'), '13:00'); await L.typeBox(p, W, f('ld'), '14:00') }],
    ['c', 'both cleared', async () => { await L.typeBox(p, W, f('to'), ''); await L.typeBox(p, W, f('ld'), '') }],
    ['d', 'landing 14:00 only', async () => { await L.typeBox(p, W, f('ld'), '14:00') }],
    ['e', 'take-off 13:00 only (landing cleared)', async () => { await L.typeBox(p, W, f('ld'), ''); await L.typeBox(p, W, f('to'), '13:00') }],
    ['f', 'take-off cleared, landing 14:00 typed again, then take-off 13:00 restored', async () => { await L.typeBox(p, W, f('to'), ''); await L.typeBox(p, W, f('ld'), '14:00'); await L.typeBox(p, W, f('to'), '13:00') }],
  ]
  const rb = boxes.map(x => x.split('=')[0].split('.').pop()).filter(k => !['cs', 'msn', 'to', 'ld'].includes(k))
  if (rb.length) steps.push(['g', `take-off cleared, landing cleared, the other time boxes typed (${rb.join(', ')}: 12:00)`, async () => { await L.typeBox(p, W, f('to'), ''); await L.typeBox(p, W, f('ld'), ''); for (const k of rb) await L.typeBox(p, W, f(k), '12:00') }])
  for (const [id, what, act] of steps) {
    await L.openBoard(p, W, 5)
    await act()
    const t = await p.evaluate(wi => { const x = window.DAYS[5].waves[wi].formations[0]; return { to: x.to, ld: x.ld } }, a.wi)
    const r = await boardArm(p, W, 5, kp, 'f4-' + id)
    const x = one(r.c, RANGER)
    W.rec('F4.' + id, `${what}: Ranger struck with the same sentence`, !!x && x.struck && x.printed === RLONG, `stored to "${t.to}" ld "${t.ld}" · boxes ${(await bflds(p, 5, a.wi)).join(' ')} · ${say1(r.c, RANGER)}`, await crewPics(p, W, '#schedBoard', RANGER, 'f4-' + id))
    await disarm(p, W)
  }
}

/* F5 = A-S01 — the drag hover over the blank seat, then over a ground place, then over nothing; the drop's note; a
   seat-to-seat drag. Desktop by mouse; 'pc' the phone's size in Chromium by a finger over CDP (WebKit cannot) */
S.F5 = async (p, W) => {
  await postR(p, W)
  const A1 = await addLine(p, W, 0, { cs: 'SNSA' })
  const B1 = await addLine(p, W, 0, { cs: 'SNSB' })
  need(W, 'set.lines', 'Mon 13: two flying lines SNSA and SNSB, no times', A1.wi >= 0 && B1.wi >= 0 && !A1.f.to && !B1.f.to, J({ A1, B1 }))
  const g = await L.groundRow(p, W, 0, 'SNSGR', '21:00', '21:30', null)
  need(W, 'set.ground', 'Mon 13: a Ground Programme row SNSGR 21:00–21:30, empty', !!g.row && g.row.prog === 'SNSGR', J(g.row))
  const ka = `0.${A1.wi}.0.0.p`, kb = `0.${B1.wi}.0.0.p`, kbw = `0.${B1.wi}.0.0.w`, kg = `g:0.${g.ri}.+`
  const ace = await placeBy(p, W, 0, kbw, ACE, 'f5-ace')
  need(W, 'set.ace', 'Ace planned into SNSB\'s RCP first (SNSB\'s no-times warning up before the drags)', ace.placed === ACE, J(ace.seen))
  await L.openBoard(p, W, 0); await W5.boardDrawer(p, W, true); await noteWatch(p)
  const src = () => p.locator(`#schedBoard .rpuck[data-person="${IPMAN}"]:visible`).first()
  const seat = k => p.locator(`#schedBoard [data-slot="${k}"]:visible`).first()
  const gz = p.locator(`#schedBoard [data-fill="${kg}"]:visible`).first()
  const vp = p.viewportSize()
  const nowhere = { x: Math.round(vp.width / 2), y: 30 }
  // 1: over the blank seat, over the ground row, over nothing — let go over nothing
  const d1 = await dragPath(p, W, src(), [seat(ka), gz, nowhere], 'f5-a', 'last', !!W.cdp)
  const h = i => d1.seen[i] && d1.seen[i].hover
  const capOf = x => (x && x.caps || []).filter(c => /dragimg|tdghost/.test(c)).join(' ')
  W.rec('F5.1', `over SNSA's blank FCP: "${TODAYW}" under the carried puck, the seat outlined as a warning`, /SANS — no availability filed for today/.test(capOf(h(0))) && (h(0).tg || []).some(t => t.startsWith(ka + ' ') && /dragover-why/.test(t)), hoverSay(h(0)), d1.seen[0] && d1.seen[0].pic)
  W.rec('F5.2', 'carried on over the ground row: the SANS words leave, the target changes', !/SANS — no availability filed/.test(capOf(h(1))) && !(h(1).tg || []).some(t => t.startsWith(ka + ' ')), hoverSay(h(1)), d1.seen[1] && d1.seen[1].pic)
  W.rec('F5.3', 'carried on over nothing (the board\'s title bar): no words, no outlined target', !/SANS —/.test(capOf(h(2))) && !(h(2).tg || []).length, hoverSay(h(2)), d1.seen[2] && d1.seen[2].pic)
  const after1 = { a: await seatHolds(p, ka), g: await p.evaluate(ri => JSON.stringify(window.DAYS[0].ground[ri].who || ''), g.ri) }
  W.rec('F5.4', 'let go over nothing: nothing placed, the drag over (the seat empty, the ground row empty)', after1.a === '' && !/ipman/.test(after1.g), `${J(after1)} · notes ${J(await notesSeen(p))}`, d1.npic)
  // 2: dropped on SNSA's blank FCP (the first man on SNSA)
  await W5.boardDrawer(p, W, true); await noteWatch(p)
  const d2 = await dragPath(p, W, src(), [seat(ka)], 'f5-b', 'last', !!W.cdp)
  await sleep(400)
  const n2 = await notesSeen(p)
  W.rec('F5.5', 'dropped on SNSA\'s blank FCP: placed, never refused', (await seatHolds(p, ka)) === IPMAN, `seat "${await seatHolds(p, ka)}"`, d2.npic)
  W.rec('F5.6', `the drop's note reads "${J_NOTE}" (Fable's EXPECTED, F5)`, n2.includes(J_NOTE), `notes ${J(n2)}`, d2.npic)
  // 3: from SNSA's seat to SNSB's FCP (SNSB already carries its warning)
  await W5.boardDrawer(p, W, false); await noteWatch(p)
  const d3 = await dragPath(p, W, p.locator(`#schedBoard [data-slot="${ka}"] .puck:visible`).first(), [seat(kb)], 'f5-c', 'last', !!W.cdp)
  await sleep(400)
  const n3 = await notesSeen(p)
  const h3 = d3.seen[0] && d3.seen[0].hover
  W.rec('F5.7', 'seat to seat (SNSA → SNSB): the hover carries the same words over SNSB', /SANS — no availability filed for today/.test(capOf(h3)), hoverSay(h3), d3.seen[0] && d3.seen[0].pic)
  W.rec('F5.8', `seat to seat: moved, the note "${J_NOTE}"`, (await seatHolds(p, kb)) === IPMAN && (await seatHolds(p, ka)) === '' && n3.includes(J_NOTE), `SNSA "${await seatHolds(p, ka)}" SNSB "${await seatHolds(p, kb)}" · notes ${J(n3)}`, d3.npic)
  // 4: Edit Schedule's week — the crew panel's puck dragged onto a third blank line's seat (desktop only)
  if (!W.cdp) {
    const C1 = await addLine(p, W, 0, { cs: 'SNSC' })
    const kc = `0.${C1.wi}.0.0.w`
    await placeBy(p, W, 0, `0.${C1.wi}.0.0.p`, ACE === 'dj' ? HUNTER : ACE, 'f5-hun')
    await L.closeBoard(p, W); await L.go(p, 'editsched'); await A.S.crewPanelTo(p, W, 'mon'); await noteWatch(p)
    const d4 = await dragPath(p, W, p.locator(`.ros-body .rpuck[data-person="${IPMAN}"]:visible`).first(), [p.locator(`#eWeek [data-slot="${kc}"]:visible`).first()], 'f5-d')
    await sleep(400)
    const n4 = await notesSeen(p)
    W.rec('F5.9', 'Edit Schedule week: Jester dragged from the crew panel onto SNSC\'s RCP (Hunter already in FCP): hover words, placed, note', /SANS — no availability filed for today/.test(capOf(d4.seen[0] && d4.seen[0].hover)) && (await seatHolds(p, kc)) === IPMAN && n4.includes(J_NOTE), `${hoverSay(d4.seen[0] && d4.seen[0].hover)} · seat "${await seatHolds(p, kc)}" · notes ${J(n4)}`, [d4.seen[0] && d4.seen[0].pic, d4.npic].join(', '))
  }
}

/* F9 = A-S03 — the green "can take" rings for a selected SANS man: none on any flying seat while he has nothing filed */
S.F9 = async (p, W) => {
  const B1 = await addLine(p, W, 5, { cs: 'SNSB' })
  const T1 = await addLine(p, W, 5, { cs: 'SNST', to: '21:00', ld: '22:00' })
  const O1 = await addLine(p, W, 5, { cs: 'SNSO' })
  need(W, 'set.lines', 'Sat 18: blank SNSB, timed SNST 21:00–22:00, blank SNSO', B1.wi >= 0 && T1.wi >= 0 && O1.wi >= 0, J({ B1, T1, O1 }))
  const h1 = await placeBy(p, W, 5, `5.${T1.wi}.0.0.p`, ACE, 'f9-ace')
  const h2 = await placeBy(p, W, 5, `5.${O1.wi}.0.0.p`, HUNTER, 'f9-hun')
  need(W, 'set.occ', 'Ace in SNST\'s FCP, Hunter in SNSO\'s FCP (occupied seats)', h1.placed === ACE && h2.placed === HUNTER, '')
  const keys = [`5.${B1.wi}.0.0.p`, `5.${B1.wi}.0.0.w`, `5.${T1.wi}.0.0.p`, `5.${T1.wi}.0.0.w`, `5.${O1.wi}.0.0.p`, `5.${O1.wi}.0.0.w`]
  const gkeys = await p.evaluate(() => [...document.querySelectorAll('#schedBoard [data-fill^="g:5."], #schedBoard [data-fill^="d:5."]')].filter(e => e.getBoundingClientRect().width > 0).map(e => e.dataset.fill).slice(0, 4))
  const look = async (tag, root) => {
    if (root === '#schedBoard') { await L.openBoard(p, W, 5); await W5.boardDrawer(p, W, true) }
    else { await L.closeBoard(p, W); await L.go(p, 'editsched'); await A.S.crewPanelTo(p, W, 'sat') }
    const pk = root === '#schedBoard' ? `#schedBoard .rpuck[data-person="${IPMAN}"]:visible` : `.ros-body .rpuck[data-person="${IPMAN}"]:visible`
    const before = await rings(p, root, [...keys, ...gkeys])
    await W.press(p, pk, 'sel-jester'); await sleep(500)
    const r = await rings(p, root, [...keys, ...gkeys])
    if (root === '#schedBoard') await W5.boardDrawer(p, W, false)
    const pic = await W.pic(p, tag)
    /* the selection is let go by a second tap on the same name (the drawer brought out again on a phone) */
    if (root === '#schedBoard') await W5.boardDrawer(p, W, true)
    else if (W.isPhone) await A.S.crewPanelTo(p, W, 'sat')
    await W.press(p, pk, 'unsel-jester').catch(() => {}); await sleep(300)
    const left = await rings(p, root, keys.slice(0, 1).concat(gkeys))
    if (root === '#schedBoard') await W5.boardDrawer(p, W, false)
    else await A.S.crewPanelClose(p, W)
    return { before, r, pic, left }
  }
  for (const [root, nm] of [['#schedBoard', 'board'], ['#eWeek', 'week']]) {
    const x = await look('f9-' + nm + '-nofile', root)
    const fly = keys.map(k => x.r[k]), gr = gkeys.map(k => x.r[k])
    W.rec(`F9.${nm}.1`, `${nm}: Jester tapped, nothing filed — no green ring on any flying seat (blank, timed, occupied), rings still on ground places`, fly.every(v => v === 'none') && gr.some(v => v === 'RING'), `before ${J(x.before)} · after ${J(x.r)}`, x.pic)
  }
  const f = await commit(p, W, ISO18, IPMAN, ['fly'], 'all', 'f9-file')
  need(W, 'set.file', 'Saber files Fly all day on Sat 18 for Jester', !!f.iid, J(f.rec), f.pic)
  await W5.closeSansWin(p, W)
  for (const [root, nm] of [['#schedBoard', 'board'], ['#eWeek', 'week']]) {
    const x = await look('f9-' + nm + '-filed', root)
    W.rec(`F9.${nm}.2`, `${nm}: after the filing, Jester tapped — the empty flying seats ring green (blank SNSB both seats)`, x.r[keys[0]] === 'RING' && x.r[keys[1]] === 'RING', J(x.r), x.pic)
  }
  const u = await W5.uncommit(p, W, ISO18, f.iid, 'f9-unfile')
  need(W, 'set.unfile', 'the filing deleted from its SANS day', u.ok, '', u.pic)
  await W5.closeSansWin(p, W)
  const x = await look('f9-board-unfiled', '#schedBoard')
  W.rec('F9.board.3', 'board: filing deleted, Jester tapped — the flying rings gone again', keys.every(k => x.r[k] === 'none'), J(x.r), x.pic)
}

/* an input filed for a man from the Inputs calendar (swd-w14d-lib's fileIn route, the type picked by its words) */
async function fileInput(p, W, iso, typeRx, who, tag, o = {}) {
  const D4 = await import('./swd-w14d-lib.mjs')
  await D4.inDay(p, W, iso)
  const before = await D4.ids(p)
  await W.press(p, '#icPopAdd', 'icadd')
  await p.locator('#inpEditPop #inpEditType').waitFor()
  const opts = await p.locator('#inpEditPop #inpEditType option').evaluateAll(os => os.map(o => o.value + '=' + o.textContent.trim()))
  const pick = opts.find(x => typeRx.test(x))
  if (!pick) { await p.keyboard.press('Escape'); return { iid: null, why: 'no type matching ' + typeRx + ' in ' + opts.join('|') } }
  await p.selectOption('#inpEditPop #inpEditType', pick.split('=')[0]); await sleep(300)
  if (await p.locator('#inpEditPop #inpEditPerson').count()) await p.selectOption('#inpEditPop #inpEditPerson', who).catch(() => {})
  await sleep(200)
  if (await p.locator('#inpEditSpan [data-span="all"]').count()) { const on = await p.locator('#inpEditSpan [data-span="all"]').getAttribute('aria-pressed'); if (on !== 'true') await W.press(p, '#inpEditSpan [data-span="all"]', 'span-all') }
  else { const ad = p.locator('#inpEditPop #inpEditAllday'); if (await ad.count() && !(await ad.isChecked())) await ad.click() }
  if (o.title) { const t = p.locator('#inpEditPop #inpEditOwnTitle'); if (await t.count()) await t.fill(o.title) }
  if (o.dest) { const b = p.getByRole('button', { name: o.dest, exact: true }); if (await b.count()) await W.press(p, b.first(), 'dest') }
  const pic0 = await W.pic(p, tag + '-form')
  await W.press(p, '#inpEditSave:visible', 'save')
  const asked = await D4.answerAsks(p, W)
  const made = (await D4.ids(p)).filter(x => !before.includes(x))
  const pic = await W.pic(p, tag + '-saved')
  if (await p.locator('[data-testid="win-inputedit"]:visible').count()) { await p.keyboard.press('Escape'); await sleep(300) }
  const x = p.locator('[data-testid="win-inputsday-x"]:visible'); if (await x.count()) await W.press(p, x.first(), 'day-x')
  return { iid: made[0] || null, type: pick, asked, rec: made[0] ? await D4.recOf(p, made[0]) : null, pic: pic0 + ', ' + pic }
}

/* F11 = A-S15 — an absence still outranks; a whole-day meeting; a downchit; the WSO and placeholder refusals */
S.F11 = async (p, W) => {
  const a = await addLine(p, W, 5, { cs: 'SNSA' })
  need(W, 'set.line', 'Sat 18: a flying line SNSA, no times', a.wi >= 0 && !a.f.to, J(a))
  const kp = `5.${a.wi}.0.0.p`
  // (d) placeholders and the WSO first, in the clean world
  let r = await boardArm(p, W, 5, kp, 'f11-ph')
  const aa = one(r.c, 'allavail'), mar = one(r.c, MARLIN)
  W.rec('F11.d1', 'FCP armed: ALL AVAIL struck "cannot crew a jet…", Marlin (SANS WSO) "WSO — cannot fly front seat" (the seat rule outranks)', !!aa && aa.struck && /cannot crew a jet/.test(aa.printed) && !!mar && mar.printed === 'WSO — cannot fly front seat', `ALL AVAIL ${say1(r.c, 'allavail')} · Marlin ${say1(r.c, MARLIN)}`, await crewPics(p, W, '#schedBoard', MARLIN, 'f11-ph'))
  const pk = await pickLogged(p, W, kp, 'allavail', 'f11-allavail')
  W.rec('F11.d2', 'ALL AVAIL tapped into the cockpit: refused, the seat stays empty', pk.placed === '', `seat "${pk.placed}" · notes ${J(pk.seen)}`, pk.notePic)
  await disarm(p, W)
  // (a) Jester on leave all day
  const lv = await fileInput(p, W, ISO18, /^LL=|^OL=|leave/i, IPMAN, 'f11-leave')
  need(W, 'set.leave', 'Jester on leave all day Sat 18 (Inputs)', !!lv.iid, `${lv.type} · ${J(lv.rec)} · ${lv.why || ''}`, lv.pic)
  r = await boardArm(p, W, 5, kp, 'f11-a')
  const ja = one(r.c, IPMAN)
  W.rec('F11.a', 'leave: Jester\'s line names the leave, not the SANS sentence (absences outrank)', !!ja && ja.struck && !!ja.printed && !/SANS —/.test(ja.printed), say1(r.c, IPMAN), await crewPics(p, W, '#schedBoard', IPMAN, 'f11-a'))
  const pa = await pickLogged(p, W, kp, IPMAN, 'f11-a-pick')
  const wa = await A.warns(p, W, 5, 'f11-a')
  W.rec('F11.a2', 'leave: placed, the absence warning still there after placing', 'REC', `seat "${pa.placed}" · notes ${J(pa.seen)} · ${A.warnSay(wa)} · Jester's rows ${J(wa.rows.filter(x => /Jester/.test(x)))}`, [pa.notePic, wa.pic].join(', '))
  await sbUndo(p, W)
}
S.F11b = async (p, W) => {
  const a = await addLine(p, W, 5, { cs: 'SNSA' })
  need(W, 'set.line', 'Sat 18: a flying line SNSA, no times', a.wi >= 0 && !a.f.to, J(a))
  const kp = `5.${a.wi}.0.0.p`
  const m = await fileInput(p, W, ISO18, /meeting/i, IPMAN, 'f11-mtg', { title: 'SNS MEETING' })
  need(W, 'set.mtg', 'a whole-day Meeting for Jester on Sat 18 (Inputs)', !!m.iid, `${m.type} · ${J(m.rec)} · asked ${J(m.asked)} · ${m.why || ''}`, m.pic)
  const onGround = await p.evaluate(() => JSON.stringify(window.DAYS[5].ground.map(g => g.prog + ':' + JSON.stringify(g.who || ''))))
  const r = await boardArm(p, W, 5, kp, 'f11-b')
  W.rec('F11.b', 'whole-day Meeting: Jester\'s line reads the SANS sentence (as a timed seat would)', !!one(r.c, IPMAN) && one(r.c, IPMAN).printed === TODAYW, `${say1(r.c, IPMAN)} · Sat 18 ground rows ${onGround}`, await crewPics(p, W, '#schedBoard', IPMAN, 'f11-b'))
  await disarm(p, W)
  // control: the same Meeting with a timed line
  const t = await addLine(p, W, 5, { cs: 'SNST', to: '13:00', ld: '14:00' })
  const r2 = await boardArm(p, W, 5, `5.${t.wi}.0.0.p`, 'f11-bt')
  W.rec('F11.b2', 'CONTROL the timed line: Jester\'s line with the Meeting', 'REC', say1(r2.c, IPMAN), await crewPics(p, W, '#schedBoard', IPMAN, 'f11-bt'))
  await disarm(p, W)
}
S.F11c = async (p, W) => {
  const a = await addLine(p, W, 5, { cs: 'SNSA' })
  const kp = `5.${a.wi}.0.0.p`
  /* the Inputs page offers no kind named "downchit": its medically-down kinds are ATT C and ATT B; ATT C stands in */
  const dc = await fileInput(p, W, ISO18, /^ATT C=/, IPMAN, 'f11-down')
  need(W, 'set.down', 'an ATT C (medically down) for Jester all day Sat 18 (Inputs) — the stand-in for "downchit"', !!dc.iid, `${dc.type} · ${J(dc.rec)} · ${dc.why || ''}`, dc.pic)
  const r = await boardArm(p, W, 5, kp, 'f11-c')
  const j = one(r.c, IPMAN)
  W.rec('F11.c', 'downchit: Jester\'s line names the downchit, not the SANS sentence', !!j && j.struck && !!j.printed && !/SANS —/.test(j.printed), say1(r.c, IPMAN), await crewPics(p, W, '#schedBoard', IPMAN, 'f11-c'))
  await disarm(p, W)
}

/* F16 — publishing and the warning list untouched; F17 / A-S18 — view-only, a member, reading writes nothing */
S.F16 = async (p, W) => {
  const a = await addLine(p, W, 5, { cs: 'SNSA' })
  const kp = `5.${a.wi}.0.0.p`
  const pj = await placeBy(p, W, 5, kp, IPMAN, 'f16-place')
  need(W, 'set.place', 'Jester planned into Sat 18\'s blank SNSA FCP', pj.placed === IPMAN, J(pj.seen))
  const w = await A.warns(p, W, 5, 'f16')
  W.rec('F16.1', 'the warning list: no line for Jester\'s nothing filed (D2579\'s amber line not built)', !w.rows.some(x => /Jester/.test(x) && /SANS|availability|filed/i.test(x)), A.warnSay(w) + ' · all rows ' + J(w.rows), w.pic)
  await L.closeBoard(p, W); await L.go(p, 'editsched')
  const pk = await p.evaluate(k => { const e = [...document.querySelectorAll(`#eWeek [data-slot="${k}"] .puck`)].find(x => x.getBoundingClientRect().width > 0); if (!e) return 'no puck'; const cs = getComputedStyle(e); return { cls: e.className, txt: (e.textContent || '').trim(), ring: cs.outlineColor + ' ' + cs.outlineStyle + ' / ' + cs.boxShadow, chips: [...e.querySelectorAll('*')].map(x => x.className).filter(Boolean) } }, kp)
  await p.locator(`#eWeek [data-slot="${kp}"]`).first().evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })).catch(() => {}); await sleep(300)
  W.rec('F16.2', 'his seat\'s puck on the week: no new chip or amber ring', 'REC', J(pk), await W5.clip(p, W, p.locator(`#eWeek [data-slot="${kp}"]`).first(), 'f16-puck', 30))
  await L.openBoard(p, W, 5); await noteWatch(p)
  const lab = await L.publish(p, W, 5)
  await sleep(800)
  const after = await p.evaluate(() => { const t = document.querySelector('#schedBoard'); return t ? (t.innerText.match(/(ORIG|AL\d|Published|Issued|PUBLISHED)[^\n]{0,60}/g) || []).slice(0, 4) : [] })
  W.rec('F16.3', 'the day publishes (its publish button pressed after signing)', lab !== 'no publish button' && after.length > 0, `button "${lab}" · notes ${J(await notesSeen(p))} · board says ${J(after)}`, await W.pic(p, 'f16-published'))
  // A-S18: reading on the published day writes nothing
  const pend0 = await L.pendingOf(p, 5)
  const r = await boardArm(p, W, 5, `5.${a.wi}.0.0.w`, 'f16-read')
  await disarm(p, W)
  const pend1 = await L.pendingOf(p, 5)
  W.rec('F17.1', 'A-S18: on the published day a seat armed and the pick cancelled writes nothing (pending unchanged)', J(pend0) === J(pend1), `before ${J(pend0)} · after ${J(pend1)} · while armed Jester ${say1(r.c, IPMAN)}`, await W.pic(p, 'f16-read'))
  await L.closeBoard(p, W)
  await L.go(p, 'viewsched')
  const v = await p.evaluate(() => ({ sans: (document.body.innerText.match(/no availability filed[^\n]*/g) || []).slice(0, 5), crew: [...document.querySelectorAll('#page-viewsched .rpuck, #page-viewsched .ros-body')].filter(e => e.getBoundingClientRect().width > 0).length }))
  W.rec('F17.2', 'View-only Sched: no crew list, no SANS sentence on screen', v.crew === 0 && v.sans.length === 0, J(v), await W.pic(p, 'f17-view'))
  await A.asR(p, W)
  const pages = await p.evaluate(() => [...document.querySelectorAll('nav a, nav button, .navlink, [data-page]')].filter(e => e.getBoundingClientRect().width > 0).map(e => (e.textContent || '').trim()).filter(Boolean).slice(0, 14))
  await L.go(p, 'viewsched').catch(() => {})
  const v2 = await p.evaluate(() => ({ page: window.CURPAGE, sans: (document.body.innerText.match(/no availability filed[^\n]*/g) || []).slice(0, 5), crew: [...document.querySelectorAll('.rpuck, .ros-body')].filter(e => e.getBoundingClientRect().width > 0).length }))
  W.rec('F17.3', 'Ranger signed in: his schedule shows no crew list and no SANS sentence', v2.crew === 0 && v2.sans.length === 0, `pages ${J(pages)} · ${J(v2)}`, await W.pic(p, 'f17-ranger'))
}

/* A-S06 — both seats of every aircraft: a second line, a second aircraft, a night wave, named and unnamed */
S.S06 = async (p, W) => {
  await postR(p, W)
  const a = await addLine(p, W, 5, { cs: 'SNSA' })
  need(W, 'set.line', 'Sat 18: a flying line SNSA, no times', a.wi >= 0 && !a.f.to, J(a))
  await L.openBoard(p, W, 5)
  await W.press(p, L.B(`[data-gline="5.${a.wi}"]`), 'gline'); await sleep(500)
  await W.press(p, L.B(`[data-lac="5.${a.wi}.0"]`), 'lac'); await sleep(500)
  const n = await addLine(p, W, 5, {})
  await p.locator(L.B(`[data-wsel="5.${n.wi}"]`)).first().selectOption('Night wave'); await sleep(600)
  const shape = await p.evaluate(([w, n]) => ({ a: window.DAYS[5].waves[w].formations.map(f => ({ cs: f.cs, to: f.to, n: f.aircraft.length })), night: { label: window.DAYS[5].waves[n].label, f: window.DAYS[5].waves[n].formations.map(f => ({ cs: f.cs, to: f.to, n: f.aircraft.length })) } }), [a.wi, n.wi])
  need(W, 'set.shape', 'SNSA with a second aircraft and a second (unnamed) line; a Night wave line, unnamed, no times', shape.a.length === 2 && shape.a[0].n === 2 && /night/i.test(shape.night.label), J(shape))
  const keys = [[`5.${a.wi}.0.0`, 'SNSA aircraft 1'], [`5.${a.wi}.0.1`, 'SNSA aircraft 2 (the formation\'s +)'], [`5.${a.wi}.1.0`, 'the + Line line (unnamed)'], [`5.${n.wi}.0.0`, 'the Night wave line (unnamed)']]
  for (const [k, nm] of keys) {
    for (const s of ['p', 'w']) {
      const r = await boardArm(p, W, 5, `${k}.${s}`, `s06-${k.replace(/\./g, '')}${s}`)
      const x = one(r.c, RANGER), m = one(r.c, MARLIN)
      const mOk = s === 'p' ? m && m.printed === 'WSO — cannot fly front seat' : m && m.printed === TODAYW
      W.rec(`S06.${k}.${s}`, `${nm} ${s === 'p' ? 'FCP' : 'RCP'}: Ranger struck with his reason; Marlin (SANS WSO) ${s === 'p' ? 'wrong-seat' : 'the today words'}`, r.armed === `${k}.${s}` && !!x && x.struck && x.printed === RLONG && !!mOk, `armed ${r.armed} · Ranger ${say1(r.c, RANGER)} · Marlin ${say1(r.c, MARLIN)}`, await crewPics(p, W, '#schedBoard', RANGER, `s06-${k.replace(/\./g, '')}${s}`))
      await disarm(p, W)
    }
  }
}

/* A-S16 — moves and swaps by drag, Undo and Redo; the Templates menu read */
S.S16 = async (p, W) => {
  await postR(p, W)
  const t = await addLine(p, W, 5, { cs: 'SNST', to: '13:00', ld: '14:00' })
  const b = await addLine(p, W, 5, { cs: 'SNSB' })
  const c = await addLine(p, W, 5, { cs: 'SNSC' })
  const kt = `5.${t.wi}.0.0.p`, kb = `5.${b.wi}.0.0.p`, kc = `5.${c.wi}.0.0.p`
  const r1 = await placeBy(p, W, 5, kt, RANGER, 's16-r'), r2 = await placeBy(p, W, 5, kb, ACE, 's16-a')
  need(W, 'set.crew', 'Ranger in timed SNST FCP, Ace in blank SNSB FCP, SNSC empty', r1.placed === RANGER && r2.placed === ACE, '')
  const seats = async () => ({ T: await seatHolds(p, kt), B: await seatHolds(p, kb), C: await seatHolds(p, kc) })
  await L.openBoard(p, W, 5); await noteWatch(p)
  const cdp = !!W.cdp
  const d1 = await dragPath(p, W, p.locator(`#schedBoard [data-slot="${kt}"] .puck:visible`).first(), [p.locator(`#schedBoard [data-slot="${kc}"]:visible`).first()], 's16-move', 'last', cdp)
  await sleep(400)
  const s1 = await seats(), n1 = await notesSeen(p)
  const cap = x => ((x && x.hover && x.hover.caps) || []).filter(c => /dragimg|tdghost/.test(c)).join(' ')
  W.rec('S16.1', 'move Ranger from timed SNST to blank SNSC: the hover and note give his reason; moved', /SANS from Fri 17 Jul: no availability filed/.test(cap(d1.seen[0])) && s1.C === RANGER && s1.T === '' && n1.includes(R_NOTE), `hover ${cap(d1.seen[0])} · seats ${J(s1)} · notes ${J(n1)}`, [d1.seen[0] && d1.seen[0].pic, d1.npic].join(', '))
  await sbUndo(p, W); const u1 = await seats()
  await sbRedo(p, W); const v1 = await seats()
  W.rec('S16.2', 'Undo puts him back on SNST, Redo moves him to SNSC again', u1.T === RANGER && u1.C === '' && v1.C === RANGER && v1.T === '', `undo ${J(u1)} · redo ${J(v1)}`, await W.pic(p, 's16-redo1'))
  await noteWatch(p)
  const d2 = await dragPath(p, W, p.locator(`#schedBoard [data-slot="${kc}"] .puck:visible`).first(), [p.locator(`#schedBoard [data-slot="${kb}"] .puck:visible`).first()], 's16-swap', 'last', cdp)
  await sleep(400)
  const s2 = await seats(), n2 = await notesSeen(p)
  W.rec('S16.3', 'swap Ranger (SNSC) with Ace (SNSB): both kept, swapped; RECORDED the hover and note', s2.B === RANGER && s2.C === ACE, `hover ${cap(d2.seen[0])} · seats ${J(s2)} · notes ${J(n2)}`, [d2.seen[0] && d2.seen[0].pic, d2.npic].join(', '))
  await sbUndo(p, W); const u2 = await seats()
  await sbRedo(p, W); const v2 = await seats()
  W.rec('S16.4', 'Undo of the swap restores both, Redo swaps again — nobody lost or doubled', u2.B === ACE && u2.C === RANGER && v2.B === RANGER && v2.C === ACE, `undo ${J(u2)} · redo ${J(v2)}`, await W.pic(p, 's16-redo2'))
  const tb = p.locator('#schedBoard button:visible', { hasText: 'Templates' }).first()
  if (await tb.count()) {
    await W.press(p, tb, 'templates'); await sleep(400)
    const items = await p.evaluate(() => [...document.querySelectorAll('button, [role="menuitem"]')].filter(e => e.getBoundingClientRect().width > 0 && e.closest('[class*="menu"], [role="menu"], .pop, .tplmenu')).map(e => (e.textContent || '').trim()).filter(Boolean).slice(0, 12))
    W.rec('S16.5', 'Templates menu read (saving and applying a day template not walked: see the report)', 'REC', J(items), await W.pic(p, 's16-templates'))
    await p.keyboard.press('Escape'); await sleep(300)
  }
}

/* A-S20 — ground, duty and all-hands places ask no SANS availability; none alone puts the day in his reminder */
S.S20 = async (p, W) => {
  await postR(p, W)
  await L.openBoard(p, W, 5)
  const armFill = async (sel, tag) => {
    const z = p.locator(L.B(sel)).first()
    const ad = z.locator('.addz').first()
    await z.evaluate(e => e.scrollIntoView({ block: 'center' })); await sleep(200)
    const ab = (await ad.count()) ? await ad.boundingBox() : null, zb = await z.boundingBox()
    const pos = ab && zb ? { x: ab.x - zb.x + ab.width / 2, y: ab.y - zb.y + ab.height / 2 } : undefined
    if (W.isPhone) await z.tap({ position: pos }); else await z.click({ position: pos })
    await sleep(500)
    const armed = await p.evaluate(() => window.ARM && window.ARM.key)
    await W5.boardDrawer(p, W, true)
    const c = await crewAll(p, '#schedBoard')
    const pic = await crewPics(p, W, '#schedBoard', RANGER, tag)
    return { armed, c, pic }
  }
  const pickNow = async (tag) => { const pk = await pickLogged(p, W, 'x', RANGER, tag); await W5.boardDrawer(p, W, false); return pk }
  const noSans = x => !!x && !/SANS from|SANS —/.test(x.printed || '')
  const g1 = await L.groundRow(p, W, 5, 'SNSG', '21:00', '21:30', null)
  let r = await armFill(`[data-fill="g:5.${g1.ri}.+"]`, 's20-g1')
  W.rec('S20.1', 'a timed Ground Programme row armed: Ranger asked no SANS availability', noSans(one(r.c, RANGER)), `armed ${r.armed} · ${say1(r.c, RANGER)}`, r.pic)
  let pk = await pickNow('s20-g1')
  W.rec('S20.1b', 'Ranger placed on it: RECORDED the note', 'REC', `notes ${J(pk.seen)}`, pk.notePic)
  const g2 = await L.groundRow(p, W, 5, 'SNSG2', '', '', null)
  r = await armFill(`[data-fill="g:5.${g2.ri}.+"]`, 's20-g2')
  W.rec('S20.2', 'a Ground Programme row with no times armed: no SANS reason for Ranger', noSans(one(r.c, RANGER)), `armed ${r.armed} · ${say1(r.c, RANGER)} · row ${J(g2.row)}`, r.pic)
  await disarm(p, W)
  const before = await p.evaluate(() => [...document.querySelectorAll('#schedBoard [data-fill]')].map(e => e.dataset.fill))
  await W.press(p, L.B('[data-dradd="5.0"]'), 'dradd'); await sleep(600)
  const dz = (await p.evaluate(() => [...document.querySelectorAll('#schedBoard [data-fill]')].map(e => e.dataset.fill))).filter(k => !before.includes(k) && /^d:5\.0\./.test(k))[0]
  if (dz) {
    r = await armFill(`[data-fill="${dz}"]`, 's20-d')
    W.rec('S20.3', 'a new duty desk row armed: no SANS reason for Ranger', noSans(one(r.c, RANGER)), `zone ${dz} · armed ${r.armed} · ${say1(r.c, RANGER)}`, r.pic)
    pk = await pickNow('s20-d')
  } else W.rec('S20.3', 'a new duty desk row', 'NW', 'the + Row made no new duty zone')
  await W.press(p, L.B('[data-padd="5"]'), 'add-item')
  const ri = await p.evaluate(() => window.DAYS[5].allhands.length - 1)
  await L.typeBox(p, W, `[data-bfld="ap:5.${ri}.prog"]`, 'SNSAH'); await L.typeBox(p, W, `[data-bfld="ap:5.${ri}.str"]`, '20:00'); await L.typeBox(p, W, `[data-bfld="ap:5.${ri}.end"]`, '20:30')
  r = await armFill(`[data-fill="a:5.${ri}.+"]`, 's20-a')
  W.rec('S20.4', 'a Common Programme (all hands) row armed: no SANS reason for Ranger', noSans(one(r.c, RANGER)), `armed ${r.armed} · ${say1(r.c, RANGER)}`, r.pic)
  pk = await pickNow('s20-a')
  const held = await T.holds(p, RANGER)
  W.rec('S20.5', 'what Ranger holds on Sat 18 now (read)', 'REC', held.split(' | ').filter(x => /Jul 18/.test(x)).join(' '))
  await L.closeBoard(p, W)
  await A.asR(p, W)
  const b = await A.Z.bell(p, W, 's20-bell')
  W.rec('S20.6', 'Ranger\'s bell: no reminder naming Sat 18 (ground, duty and all hands put no day in it, D2564)', !(b.rem && /Sat 18/.test(b.rem.body)), A.Z.sayB(b), b.pic)
}

/* A-S21 — the ordinary workflow, a 14-letter SANS callsign, the search box, a cancelled filing, Undo / Redo */
S.S21 = async (p, W) => {
  await postR(p, W)
  const np = await L.newPerson(p, W, 'Thunderstrikes', 'TS', 'FCP', 'C', '2026-07-01', 's21')
  need(W, 'set.new', 'Admin → Users: a new pilot "Thunderstrikes" (14 letters)', !!np.id, `${np.said} · ${J(np.rec)}`, np.pic)
  const q = await L.qualsTick(p, W, np.id, 's21')
  need(W, 'set.tick', 'Quals: his SANS ticked', q.st && q.st.san, J(q.st), q.pic)
  const a = await addLine(p, W, 5, { cs: 'SNSA' })
  const kp = `5.${a.wi}.0.0.p`
  let r = await boardArm(p, W, 5, kp, 's21-arm')
  const th = one(r.c, np.id)
  W.rec('S21.1', 'blank FCP armed: Thunderstrikes struck with the today words, the long name and the line inside the panel', !!th && th.struck && th.printed === TODAYW && th.inside !== false, `${say1(r.c, np.id)} · Ranger ${say1(r.c, RANGER)}`, await crewPics(p, W, '#schedBoard', np.id, 's21-arm'))
  const sb = p.locator('#searchB:visible').first()
  if (await sb.count()) {
    if (W.isPhone) await sb.tap(); else await sb.click()
    await sb.fill('Ranger'); await sleep(600)
    const c2 = await crewAll(p, '#schedBoard')
    W.rec('S21.2', 'the board\'s search "Ranger" while armed: Ranger shown struck with his reason', !!one(c2, RANGER) && one(c2, RANGER).printed === RLONG, `${c2.pucks.length} pucks shown · ${say1(c2, RANGER)}`, await crewPics(p, W, '#schedBoard', RANGER, 's21-search'))
    const pk = await pickLogged(p, W, kp, RANGER, 's21-pick')
    W.rec('S21.3', 'picked from the search: placed; RECORDED the note', pk.placed === RANGER, `seat "${pk.placed}" · notes ${J(pk.seen)}`, pk.notePic)
    await sb.fill(''); await sleep(300)
  } else W.rec('S21.2', 'the board search box', 'NW', 'no #searchB')
  await L.typeBox(p, W, `[data-bfld="ff:5.${a.wi}.0.to"]`, '13:00'); await L.typeBox(p, W, `[data-bfld="ff:5.${a.wi}.0.ld"]`, '14:00')
  await sbUndo(p, W); await sbUndo(p, W)
  const u = await p.evaluate(w => { const x = window.DAYS[5].waves[w].formations[0]; return { to: x.to, ld: x.ld, p: x.aircraft[0].p } }, a.wi)
  await sbRedo(p, W); await sbRedo(p, W)
  const v = await p.evaluate(w => { const x = window.DAYS[5].waves[w].formations[0]; return { to: x.to, ld: x.ld, p: x.aircraft[0].p } }, a.wi)
  W.rec('S21.4', 'times typed, Undo twice takes them off, Redo twice puts them back', !u.to && !u.ld && v.to === '13:00' && v.ld === '14:00', `undo ${J(u)} · redo ${J(v)}`, await W.pic(p, 's21-redo'))
  await L.closeBoard(p, W)
  const cc = await W5.commit(p, W, ISO18, RANGER, ['fly'], 'all', 's21-cancel', 'cancel')
  W.rec('S21.5', 'a filing for Ranger started and cancelled: nothing saved', !!cc.cancelled && cc.added.length === 0, J({ added: cc.added }), cc.pic)
  await W5.closeSansWin(p, W)
  const b2 = await addLine(p, W, 5, { cs: 'SNSB' })
  r = await boardArm(p, W, 5, `5.${b2.wi}.0.0.p`, 's21-after')
  W.rec('S21.6', 'back on the board after the cancelled filing: Ranger still struck with his reason', !!one(r.c, RANGER) && one(r.c, RANGER).printed === RLONG, say1(r.c, RANGER), await crewPics(p, W, '#schedBoard', RANGER, 's21-after'))
  await disarm(p, W)
  await L.closeBoard(p, W); await L.go(p, 'editsched')
  const k = `#eWeek [data-slot="${kp}"]`
  await p.locator(k).first().evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })).catch(() => {}); await sleep(300)
  W.rec('S21.7', 'his seated puck on the week (marks readable)', 'REC', await p.locator(k + ' .puck').first().evaluate(e => e.className + ' · "' + e.textContent.trim() + '"').catch(() => 'no puck'), await W5.clip(p, W, p.locator(k).first(), 's21-puck', 30))
}

/* the plain-user round */
S.PU = async (p, W) => {
  await postR(p, W)
  await L.go(p, 'editsched')
  W.rec('PU.1', 'Saber on Edit Schedule', 'REC', '', await W.pic(p, 'pu-1-editsched'))
  const a = await addLine(p, W, 5, { cs: 'SNSPU' })
  W.rec('PU.2', 'Sat 18: + Wave → Flying wave on the board, no times', a.wi >= 0 && !a.f.to, J(a), await W.pic(p, 'pu-2-line'))
  const kp = `5.${a.wi}.0.0.p`
  const r = await boardArm(p, W, 5, kp, 'pu-3')
  W.rec('PU.3', 'tap the seat: the crew list shows Ranger struck with his reason', !!one(r.c, RANGER) && one(r.c, RANGER).printed === RLONG, say1(r.c, RANGER), await crewPics(p, W, '#schedBoard', RANGER, 'pu-3'))
  const pk = await pickLogged(p, W, kp, RANGER, 'pu-4')
  W.rec('PU.4', 'tap his name: placed; the note read', pk.placed === RANGER, `notes ${J(pk.seen)} · ${pk.fits}`, pk.notePic)
  const tm = await A.lineTimes(p, W, 5, a.wi, '13:00', '14:00')
  W.rec('PU.5', 'type take-off 13:00 and landing 14:00', tm.to === '13:00' && tm.ld === '14:00', J(tm), await W.pic(p, 'pu-5-times'))
  await sbUndo(p, W)
  const u = await p.evaluate(w => window.DAYS[5].waves[w].formations[0].ld, a.wi)
  W.rec('PU.6', 'Undo: the landing comes off', u === '', `ld "${u}"`, await W.pic(p, 'pu-6-undo'))
  await sbRedo(p, W)
  const v = await p.evaluate(w => window.DAYS[5].waves[w].formations[0].ld, a.wi)
  W.rec('PU.7', 'Redo: the landing back', v === '14:00', `ld "${v}"`, await W.pic(p, 'pu-7-redo'))
  await L.closeBoard(p, W)
  W.rec('PU.8', 'the board closed by ✓ Done', !(await p.locator('#schedBoard:visible').count()), '', await W.pic(p, 'pu-8-done'))
  await L.openBoard(p, W, 5)
  W.rec('PU.9', 'the Scheduler Board opened for Sat 18', await p.evaluate(() => window.SBDAY) === 5, '', await W.pic(p, 'pu-9-board'))
  const w = await A.warns(p, W, 5, 'pu-10')
  W.rec('PU.10', 'the day\'s warning list opened and read', 'REC', A.warnSay(w) + ' · ' + J(w.rows), w.pic)
  await L.closeBoard(p, W)
  W.rec('PU.11', 'closed again with ✓ Done', !(await p.locator('#schedBoard:visible').count()), '', await W.pic(p, 'pu-11-done'))
  await A.asR(p, W)
  const b = await A.Z.bell(p, W, 'pu-12-bell')
  W.rec('PU.12', 'Ranger opens the bell: the SANS reminder names Sat 18', !!b.rem && /Sat 18/.test(b.rem.body), A.Z.sayB(b), b.pic)
  if (b.rem) {
    const t = await A.Z.X.bellTap(p, W, b.rem.id, 'pu-13')
    W.rec('PU.13', 'tap the reminder: the SANS calendar opens on its day', t.page === 'inputs' && /Jul/.test(t.month || ''), J(t), t.pic)
    await T.closeAll(p, W)
    W.rec('PU.14', 'what it opened, closed', !(await p.locator('[data-testid="win-sansday"]:visible').count()), '', await W.pic(p, 'pu-14-closed'))
  }
}

const fn = S[ONLY]
if (!fn) { console.log('no such scenario', ONLY); process.exit(1) }
await run(ONLY, SZ, fn)
A.saveRaw(`${ONLY}-${SZ}-${process.env.SNSA_RUN || 'run1'}`)
const c = k => L.results.filter(r => r.ok === k).length
console.log(`DONE ${ONLY} ${SZ}: ${L.results.length} rows · PASS ${c(true)} · FAIL ${c(false)} · RECORDED ${c('REC')} · NOT WALKED ${c('NW')}`)
process.exit(0)
