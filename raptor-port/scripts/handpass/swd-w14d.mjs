// swd-w14d — walker w14d: the calendar's doors, the merged bell, the plain-user round (B5, B6, A3, A4, A6, A8, A9, D1–D3, E;
// D2388, D2394, D2421, D2341, D2340, D2391, D2521, D769, D1693, D350, D2563), each case a fresh world, both sizes.
// Run from raptor-port/, one size a process:  SZ=d|p W14D_RUN=run1 [ONLY=b5,a3] node scripts/handpass/swd-w14d.mjs
// SZ=p runs each scenario on the phone (WebKit 402×874, taps) — or, for a held finger drag only (A3, A8, A9), Chromium at
// 402×874 with real fingers over CDP ('phone-chromium'; WebKit's in-page touches drive no pointer events, walk-scripts §4).
// Plan: docs/superpowers/briefs/2026-11-25-sans-words-w14-plan.md §B5, §B6, §A3, §A4, §A6, §A8, §A9, §D, §E. Routes proved by
// swd-w14d-probe.mjs (P9 yes; P10: a member's window over a shared offer has no Save) and D:/raptor-work/c174-walk/recipes.md.
import './swd-w14d-env.mjs'
import { writeFileSync } from 'node:fs'
import path from 'node:path'
const Z = await import('./swd-w14d-lib.mjs')
const { K, X, T, L, M, RANGER, HEX, I, md, recIs, WORDS: Wd, lineIs, bell, say, sayB, need, asR, asS, asH, scene, sleep, remDays, J,
  tickOf, seatOn, fileMe, topBar, tbSay, postAny, moveTo, tapAndRead, tapSay, barLook, run, editDates, addState, sayAdd, noFly,
  fileIn, editIn, notes, recOf, OUT } = Z
console.log('VERSION swd-w14d 5 · size', process.env.SZ || 'd', '· run', process.env.W14D_RUN || 'run1', '· only', process.env.ONLY || 'all')
const SZ = process.env.SZ || 'd'
const chk = (W, id, what, ok, note, pic) => W.rec(id, what, !!ok, note, pic)
const rec = (W, id, what, note, pic) => W.rec(id, what, 'REC', note, pic)
const nw = (W, id, what, note, pic) => W.rec(id, what, 'NW', note, pic)
const fitChk = (W, id, b) => chk(W, id, 'the bell: every line inside its panel, words wrapped; Mark all read reachable', b.allFit && b.markAll !== 'off screen', `all fit ${b.allFit} · Mark all read ${b.markAll}`, b.pic)
const mine = async p => (await M.sansRecs(p)).filter(r => r.who.split('+').includes(RANGER))
const SAVED = (range, left, were, who, date) => `Saved ${range}. ${left} ${were ? 'were' : 'was'} left out because ${who === 'you' ? "you're" : who + ' is'} SANS from ${date}.`
const eSay = e => e.ok ? `note "${e.said}" (shown ${e.shown}) · window stayed ${e.stayed} · the window read ${M.winDatesSay(e.dd)} · record ${M.sayRecs(e.rec ? [e.rec] : [])} · made ${M.sayRecs(e.made)}` : (e.noSave ? `NO Save in the window: ${J(e.r)}` : e.why)

/* ---------- B5: an existing one-man filing stretched back in its own window ---------- */
async function b5(p, W) {
  const s = 'b5'
  await postAny(p, W, RANGER, I[17], `${s}.f1`)
  await asR(p, W)
  const g = await fileMe(p, W, 'Ranger', I[17], I[18], `${s}.f2`)
  for (const [n, taps, to, who] of [['1', [I[16], I[18]], I[18], 'you'], ['2', [I[16], I[19]], I[19], 'you'], ['3', [I[16], I[18]], I[18], 'Ranger']]) {
    if (n === '3') await asS(p, W)
    /* run 1 found no Dates calendar in a saved one-man filing's window: read what the window offers first */
    await T.closeAll(p, W); await M.onSans(p, W)
    const o = await X.openLine(p, W, I[17], g.iid, `${s}-${n}w`)
    const cal = o.ok ? await p.locator('#inpEditPop [data-testid^="inpEdCal-day-"]').count() : 0
    const foot = o.ok ? M.clean(await p.evaluate(() => { const w = document.querySelector('#inpEditPop'); return w ? [...w.querySelectorAll('p, .hint, .note, div')].filter(e => !e.children.length && /dates/i.test(e.textContent || '')).map(e => e.textContent).join(' | ') : '' })) : ''
    const pw = await W.pic(p, `${s}-${n}w`)
    await X.closeInp(p, W)
    if (!cal) {
      rec(W, `${s}.${n}`, `${n === '3' ? 'Saber, for Ranger,' : 'Ranger'} opens the saved filing (Fri 17 – ${n === '2' ? 'Sat 18' : 'Sat 18'}) from Fri 17's line to stretch it back to Thu 16: its window has NO Dates calendar — the stretch cannot be made by this door (B5's RECORD-if-refused)`, `opened ${o.ok} · date buttons in the window ${cal} · its words "${foot}" · ${o.ok ? `person ${o.r.person} · save ${o.r.save} · del ${o.r.del}` : o.why}`, (o.pic || '') + ', ' + pw)
      const all = await mine(p)
      chk(W, `${s}.${n}n`, 'nothing changed: one filing, Fri 17 – Sat 18, nothing on Thu 16', all.length === 1 && recIs(all[0], RANGER, I[17], I[18]), M.sayRecs(all), pw)
      continue
    }
    const e = await editDates(p, W, I[17], g.iid, taps, `${s}-${n}`)
    const range = `Fri 17 – ${to === I[18] ? 'Sat 18' : 'Sun 19'} Jul`
    const words = SAVED(range, 'Thu 16 Jul', false, who, 'Fri 17 Jul')
    const all = await mine(p)
    const who_ = n === '3' ? 'Saber, for Ranger,' : 'Ranger'
    chk(W, `${s}.${n}a`, `${who_} opens the filing from Fri 17's line, Dates Thu 16 then ${md(to)}, Save: ONE filing, Fri 17 – ${md(to)}, nothing saved on Thu 16 (D2388)`, e.ok && recIs(e.rec, RANGER, I[17], to) && e.made.length === 0 && all.length === 1, `${eSay(e)} · his filings ${M.sayRecs(all)}`, e.pic)
    if (e.ok && /left out/.test(e.said)) chk(W, `${s}.${n}b`, `the note's exact words: "${words}" (D2394 Q1)`, e.said === words && e.shown, `"${e.said}"`, e.pic)
    else rec(W, `${s}.${n}b`, `the note (the cut's words expected: "${words}"; RECORD if the window refused instead)`, eSay(e), e.pic)
    const v = await K.seen(p, W, I[16], `${s}-${n}c`)
    chk(W, `${s}.${n}c`, 'the SANS month: Thu 16 does not list Ranger', !v.has, v.words, v.pic)
    await T.closeAll(p, W)
  }
}

/* ---------- B6: the cut note never leaks into the next save ---------- */
async function b6(p, W) {
  const s = 'b6'
  await postAny(p, W, RANGER, I[17], `${s}.f1`)
  await asR(p, W)
  /* a saved filing's window has no Dates calendar (B5, run 1): the cut is made instead by "+ Commitment" on Fri 17 and its
     window's own Dates calendar, Thu 16 then Sat 18 (w13 s6e's door) */
  const c0 = await M.commitOpen(p, W, I[17], `${s}-f2`)
  need(W, `${s}.f2`, '+ Commitment on Fri 17', c0.ok, c0.why || '', c0.pic)
  await X.tapWinDate(p, W, I[16]); await X.tapWinDate(p, W, I[18])
  await X.setKinds(p, W, ['f'])
  const e = await M.add(p, W, `${s}-f3`)
  need(W, `${s}.f3`, 'the cut made first: Dates Thu 16 then Sat 18, Add — saved Fri 17 – Sat 18 with the cut note', e.made.length === 1 && /left out/.test(e.said || ''), `note "${e.said}" · made ${M.sayRecs(e.made)}`, e.pic)
  await T.closeAll(p, W)
  /* (a) Sun 19 alone */
  let c = await M.commitOpen(p, W, I[19], `${s}-a`)
  need(W, `${s}.a0`, '+ Commitment on Sun 19', c.ok, c.why || '', c.pic)
  await X.setKinds(p, W, ['f'])
  let a = await M.add(p, W, `${s}-a`)
  chk(W, `${s}.a`, '(a) Sun 19 filed alone: the ordinary note only, never the cut\'s words', a.made.length === 1 && !/left out|SANS from/.test(a.said), `note "${a.said}" (shown ${a.shown}) · made ${M.sayRecs(a.made)}`, a.pic)
  await T.closeAll(p, W)
  /* (b) no kind ticked */
  c = await M.commitOpen(p, W, I[20], `${s}-b`)
  need(W, `${s}.b0`, '+ Commitment on Mon 20', c.ok, c.why || '', c.pic)
  await X.setKinds(p, W, [])
  a = await M.add(p, W, `${s}-b`)
  chk(W, `${s}.b`, '(b) nothing ticked, Add: "Tick at least one of Fly / AMT / OFT" only (as built, w13 s21a), nothing saved', a.made.length === 0 && /^Tick at least one of Fly \/ AMT \/ OFT/.test(a.said) && !/left out|Saved/.test(a.said), `note "${a.said}" · stayed ${a.stayed}`, a.pic)
  await X.closeInp(p, W); await T.closeAll(p, W)
  /* (c) + Commitment, Cancel */
  c = await M.commitOpen(p, W, I[20], `${s}-c`)
  need(W, `${s}.c0`, '+ Commitment on Mon 20', c.ok, c.why || '', c.pic)
  await W.press(p, '#inpEditCancel:visible', 'cancel')
  const n = await M.noteNow(p)
  const pic = await W.pic(p, `${s}-c-after`)
  chk(W, `${s}.c`, '(c) Cancel: no note at all', !n.said || !n.shown, `note "${n.said}" (shown ${n.shown})`, pic)
}

/* ---------- A3: Saber's window opened on another man, Ranger chosen at Save ---------- */
async function a3(p, W) {
  const s = 'a3'
  await postAny(p, W, RANGER, I[17], `${s}.f1`)
  const d = await M.drag(p, W, I[15], I[18])
  const pic0 = await W.pic(p, `${s}-00`)
  need(W, `${s}.00`, `Saber drags Wed 15 → Sat 18 on the SANS month (${W.touchCdp ? 'a held finger' : 'a mouse'}): the window opens`, d.opened, `held ${J(d.picked)} · person as it came "${d.r && d.r.person}" · offered ${d.r && d.r.options.length}`, pic0)
  rec(W, `${s}.01`, 'the Person box as the window came (its default person)', `"${d.r.person}" · ${M.winDatesSay(await M.winDates(p))}`, pic0)
  const w = await X.setWho(p, W, RANGER)
  if (!/picked/.test(w)) { rec(W, `${s}.02`, 'the Person box would not offer Ranger for this run — which door refused (RECORD)', w, await W.pic(p, `${s}-02`)); return }
  const before = (await M.sansRecs(p)).length
  const a = await M.add(p, W, `${s}-03`)
  const all = await M.sansRecs(p)
  chk(W, `${s}.03`, 'Add: ONE filing, for Ranger, Fri 17 – Sat 18; nothing saved for anyone else (D2388)', a.made.length === 1 && recIs(a.made[0], RANGER, I[17], I[18]), `made ${M.sayRecs(a.made)} · SANS records ${before} → ${all.length}`, a.pic)
  const words = SAVED('Fri 17 – Sat 18 Jul', 'Wed 15 – Thu 16 Jul', true, 'Ranger', 'Fri 17 Jul')
  chk(W, `${s}.04`, `the note: "${words}" (D2394 Q1, the left-out days as one run)`, a.said === words && a.shown, `"${a.said}" (shown ${a.shown})`, a.pic)
  for (const d2 of [15, 16]) { const v = await K.seen(p, W, I[d2], `${s}-05-${d2}`); chk(W, `${s}.05.${d2}`, `the SANS month: ${md(I[d2])} lists nobody new (no Ranger)`, !v.has, v.words, v.pic) }
  const v = await K.seen(p, W, I[18], `${s}-06`)
  chk(W, `${s}.06`, 'the SANS month: Sat 18 lists Ranger', v.has, v.words, v.pic)
}

/* ---------- A4: the member's own stretch of a shared offer (P10) ---------- */
async function a4(p, W) {
  const s = 'a4'
  await postAny(p, W, RANGER, I[17], `${s}.f1`)
  await tickOf(p, W, HEX, true, `${s}.f2`)
  const f = await T.file(p, W, I[18], [RANGER, HEX], ['fly'], null, `${s}-f3`)
  need(W, `${s}.f3`, 'Saber files ONE shared Sat 18 offer for Ranger and Hex', !!f.iid, f.iid ? J(f.made) : f.refused, f.pic)
  await T.closeAll(p, W)
  await tickOf(p, W, HEX, false, `${s}.f4`)
  await postAny(p, W, HEX, I[24], `${s}.f5`)
  await asR(p, W)
  await M.onSans(p, W)
  const o = await X.openLine(p, W, I[18], f.iid, `${s}-01`)
  if (!o.ok) { rec(W, `${s}.01`, 'Ranger opens the shared offer from Sat 18', o.why, o.pic); return }
  await X.tapWinDate(p, W, I[18]); await X.tapWinDate(p, W, I[19])
  const r = await X.inpRead(p), dd = await M.winDates(p)
  const pic = await W.pic(p, `${s}-02`)
  if (!r.save) {
    rec(W, `${s}.02`, 'Ranger, a member, opens the offer Saber filed for him and Hex: his window offers no edit of it (no ruling says he may — RECORD)', `no Save button · its words "${r.ro}" · picked ${r.picked.join('+')} · after tapping Sat 18 then Sun 19: ${M.winDatesSay(dd)}`, o.pic + ', ' + pic)
    await X.closeInp(p, W)
  } else {
    const a = await M.add(p, W, `${s}-02`)
    chk(W, `${s}.02`, 'Save through Sun 19: refused, "Hex is SANS from Fri 24 Jul. Take him out of this offer to add earlier days." (D2394 Q10)', a.said === 'Hex is SANS from Fri 24 Jul. Take him out of this offer to add earlier days.', `"${a.said}" · stayed ${a.stayed}`, a.pic)
    await X.closeInp(p, W)
  }
  const r2 = (await M.sansRecs(p)).find(x => x.iid === f.iid)
  chk(W, `${s}.03`, 'nothing changed: the offer still Sat 18 alone, both men', recIs(r2, `${RANGER}+${HEX}`, I[18]), M.sayRecs(r2 ? [r2] : []), pic)
}

/* ---------- A6: the greyed "+ Commitment" after his date is MOVED ---------- */
async function a6(p, W) {
  const s = 'a6'
  await postAny(p, W, RANGER, I[17], `${s}.f1`)
  await moveTo(p, W, I[17], I[20], `${s}.f2`)
  let r = await addState(p, W, I[17], `${s}-00`)
  chk(W, `${s}.00`, 'Saber opens Fri 17: + Commitment never grey, no words (D2421)', r.add === 'enabled' && !r.why, sayAdd(r), r.pic)
  await asR(p, W)
  for (const [d, n] of [[17, '01'], [19, '02']]) {
    r = await addState(p, W, I[d], `${s}-${n}`)
    chk(W, `${s}.${n}`, `Ranger opens ${md(I[d])}: + Commitment greyed, "You're SANS from Mon 20 Jul." (D2394 Q4, D2421)`, r.add === 'greyed' && r.why === "You're SANS from Mon 20 Jul.", sayAdd(r), r.pic)
    if (W.isPhone) chk(W, `${s}.${n}h`, 'on the phone the words stand inside the day\'s sheet at both heights', /as opened:.*inside the visible window: true.*after a tap on its top bar:.*inside the visible window: true/.test(r.heights), r.heights, r.pic)
  }
  r = await addState(p, W, I[20], `${s}-03`)
  chk(W, `${s}.03`, 'Ranger opens Mon 20: + Commitment live, no words', r.add === 'enabled' && !r.why, sayAdd(r), r.pic)
  await asS(p, W)
  await moveTo(p, W, I[20], I[16], `${s}.f3`)
  await asR(p, W)
  r = await addState(p, W, I[15], `${s}-04`)
  chk(W, `${s}.04`, 'after the second move, Ranger opens Wed 15: greyed, "You\'re SANS from Thu 16 Jul."', r.add === 'greyed' && r.why === "You're SANS from Thu 16 Jul.", sayAdd(r), r.pic)
  if (W.isPhone) chk(W, `${s}.04h`, 'on the phone the words stand inside the day\'s sheet at both heights', /as opened:.*inside the visible window: true.*after a tap on its top bar:.*inside the visible window: true/.test(r.heights), r.heights, r.pic)
  r = await addState(p, W, I[16], `${s}-05`)
  chk(W, `${s}.05`, 'Ranger opens Thu 16: + Commitment live, no words', r.add === 'enabled' && !r.why, sayAdd(r), r.pic)
}

/* ---------- A8: a cut run beside a no-fly day (P9) ---------- */
async function a8(p, W) {
  const s = 'a8'
  const nf = await noFly(p, W, I[17], `${s}-f1`)
  need(W, `${s}.f1`, 'Saber sets Fri 17 no fly (SANS day → Calendar… → Fri 17 NF)', nf.ok && nf.after && nf.after.cls === 'nf', J({ ...nf, pic: undefined }), nf.pic)
  await postAny(p, W, RANGER, I[17], `${s}.f2`)
  await asR(p, W)
  let d = await M.drag(p, W, I[16], I[17])
  need(W, `${s}.f3`, `Ranger drags Thu 16 → Fri 17 (${W.touchCdp ? 'a held finger' : 'a mouse'}): the window opens`, d.opened, `held ${J(d.picked)} · ticks ${d.r && d.r.ticks}`, await W.pic(p, `${s}-f3`))
  rec(W, `${s}.00`, 'the window on a run ending on a no-fly day: its Fly / AMT / OFT boxes as it came', `ticks "${d.r.ticks}" · ${M.winDatesSay(await M.winDates(p))}`, await W.pic(p, `${s}-00`))
  await X.setKinds(p, W, ['f'])
  const r1 = await X.inpRead(p)
  let a = await M.add(p, W, `${s}-01`)
  rec(W, `${s}.01`, 'Fly ticked, Add: what the window does with Fly on a no-fly day (RECORD — none of these rulings covers it)', `ticks before Add "${r1.ticks}" · note "${a.said}" (shown ${a.shown}) · stayed ${a.stayed} · made ${M.sayRecs(a.made)}`, a.pic)
  const flyOn17 = (await mine(p)).filter(m => (m.date === 'Jul 17' || m.end === 'Jul 17') && /f/.test(m.sans))
  chk(W, `${s}.02`, 'never a Fly offer saved on the no-fly day', flyOn17.length === 0, `his filings ${M.sayRecs(await mine(p))}`, a.pic)
  if (!a.made.length) chk(W, `${s}.03`, 'a save refused never shows a "Saved" note', !/^Saved/.test(a.said), `"${a.said}"`, a.pic)
  else rec(W, `${s}.03`, 'the Fly save went through: its note', `"${a.said}" · ${M.sayRecs(a.made)}`, a.pic)
  if (a.made.length) {   /* remove what it made, so the OFT try starts clean — the top bar's own Undo */
    await T.closeAll(p, W)
    const u = await topBar(p, W, 'undo', RANGER, `${s}-03u`)
    rec(W, `${s}.03u`, 'his Undo of that save (so the OFT try starts clean)', `${tbSay(u)} · filings ${M.sayRecs(await mine(p))}`, u.pic)
  }
  if (!a.stayed) { await T.closeAll(p, W); d = await M.drag(p, W, I[16], I[17]); need(W, `${s}.f4`, 'the drag again for OFT', d.opened, J(d.picked), await W.pic(p, `${s}-f4`)) }
  await X.setKinds(p, W, ['o'])
  const r2 = await X.inpRead(p)
  a = await M.add(p, W, `${s}-04`)
  const words = SAVED('Fri 17 Jul', 'Thu 16 Jul', false, 'you', 'Fri 17 Jul')
  rec(W, `${s}.04r`, 'OFT only, Add: what it did', `ticks "${r2.ticks}" · note "${a.said}" · stayed ${a.stayed} · made ${M.sayRecs(a.made)}`, a.pic)
  if (a.made.length) {
    chk(W, `${s}.04`, 'saved: ONE filing, Fri 17 only, OFT', a.made.length === 1 && recIs(a.made[0], RANGER, I[17]) && a.made[0].sans === 'o', M.sayRecs(a.made), a.pic)
    chk(W, `${s}.05`, `its note: "${words}" (D2394 Q1)`, a.said === words, `"${a.said}"`, a.pic)
  } else chk(W, `${s}.05`, 'refused: never a "Saved" note', !/^Saved/.test(a.said), `"${a.said}"`, a.pic)
}

/* A8's control (added after run 2): Fly on the no-fly day with NO cut — Fri 17 alone from its own "+ Commitment" — so the
   sheet can say whether the Fly save belongs to the cut or to the day; the SANS month's Fri 17 read after */
async function a8b(p, W) {
  const s = 'a8b'
  const nf = await noFly(p, W, I[17], `${s}-f1`)
  need(W, `${s}.f1`, 'Saber sets Fri 17 no fly', nf.ok && nf.after && nf.after.cls === 'nf', J({ ...nf, pic: undefined }), nf.pic)
  await postAny(p, W, RANGER, I[17], `${s}.f2`)
  await asR(p, W)
  const c = await M.commitOpen(p, W, I[17], `${s}-01`)
  need(W, `${s}.f3`, '+ Commitment on Fri 17 (no fly) — open to him', c.ok, c.why || '', c.pic)
  const r0 = await X.inpRead(p)
  await X.setKinds(p, W, ['f'])
  const a = await M.add(p, W, `${s}-01`)
  rec(W, `${s}.01`, 'Fri 17 alone (no run, no cut), Fly ticked, Add: what it does (RECORD — D642 rules that a no-fly day "takes OFT and AMT"; none names Fly)', `ticks as it came "${r0.ticks}" · note "${a.said}" (shown ${a.shown}) · stayed ${a.stayed} · made ${M.sayRecs(a.made)}`, a.pic)
  const v = await K.seen(p, W, I[17], `${s}-02`)
  rec(W, `${s}.02`, 'the SANS month\'s Fri 17 after (does his Fly offer count on the NF day?)', v.words, v.pic)
}

/* ---------- A9: a run that starts before his SECOND SANS start ---------- */
async function a9(p, W) {
  const s = 'a9'
  await tickOf(p, W, RANGER, true, `${s}.f1`)
  let t = await T.moveClock(p, W, '2026-07-16T09:00:00')
  W.rec(`${s}.f2`, "the clock moved to Thu 16 09:00, reloaded: the app's today", null, t)
  await tickOf(p, W, RANGER, false, `${s}.f3`)
  t = await T.moveClock(p, W, '2026-07-17T09:00:00')
  W.rec(`${s}.f4`, "the clock moved to Fri 17 09:00, reloaded: the app's today (w13 s20c's world, kept there)", null, t)
  await tickOf(p, W, RANGER, true, `${s}.f5`)
  await asR(p, W)
  const st = {}
  for (const d of [15, 16, 17, 18]) st[d] = await addState(p, W, I[d], `${s}-f6-${d}`)
  rec(W, `${s}.f6`, "each day's + Commitment as Ranger, read before the picks (Wed 15 SANS? Thu 16 a gap?)", [15, 16, 17, 18].map(d => `${md(I[d])}: ${sayAdd(st[d])}`).join(' | '))
  const gap = st[15].add === 'enabled' && st[16].add === 'greyed' && st[17].add === 'enabled'
  /* the control first (w13's result): Wed 15 → Sat 18, a gap in its middle — refused whole. Run first so the cut's saved
     Fri 17 – Sat 18 cannot turn it into an "already filed" refusal (the plan's order swapped for that reason) */
  let d = await M.drag(p, W, I[15], I[18])
  need(W, `${s}.f7`, 'Ranger drags Wed 15 → Sat 18: the window opens', d.opened, J(d.picked), await W.pic(p, `${s}-f7`))
  let a = await M.add(p, W, `${s}-01`)
  if (gap) chk(W, `${s}.01`, 'Wed 15 – Sat 18 (Thu 16 a gap in its middle): refused whole, nothing saved, no "Saved" note (D2388)', a.made.length === 0 && !/^Saved/.test(a.said), `note "${a.said}" · stayed ${a.stayed} · made ${M.sayRecs(a.made)}`, a.pic)
  else nw(W, `${s}.01`, 'the gap control', 'the world did not make Wed 15 SANS with Thu 16 a gap (f6)', a.pic)
  await X.closeInp(p, W); await T.closeAll(p, W)
  d = await M.drag(p, W, I[16], I[18])
  need(W, `${s}.f8`, 'Ranger drags Thu 16 → Sat 18: the window opens', d.opened, J(d.picked), await W.pic(p, `${s}-f8`))
  a = await M.add(p, W, `${s}-02`)
  chk(W, `${s}.02`, 'Thu 16 – Sat 18 (Thu 16 not SANS, Fri 17 and Sat 18 SANS): saved Fri 17 – Sat 18 only, Thu 16 left out (D2388)', a.made.length === 1 && recIs(a.made[0], RANGER, I[17], I[18]) && /Thu 16 Jul was left out/.test(a.said), `note "${a.said}" · made ${M.sayRecs(a.made)}`, a.pic)
  rec(W, `${s}.03`, 'the date the note names (RECORD)', `"${a.said}"`, a.pic)
}

/* ---------- D1: the reminder beside changed-input lines ---------- */
async function d1(p, W) {
  const s = 'd1'
  await postAny(p, W, RANGER, I[17], `${s}.f1`)
  await seatOn(p, W, `${s}.f2`, 5)
  const n = async () => (await notes(p, RANGER)).length
  const n0 = await n()
  const t = await fileIn(p, W, I[27], { type: 'Training', who: RANGER, from: '09:00', to: '10:00', title: 'Training', remarks: 'Bring kit' }, `${s}-1`)
  need(W, `${s}.1`, '(1) Saber files a Training "Training" 09:00–10:00 for Ranger, Mon 27 Jul (Inputs → the day → + Input)', !!t.iid, J(t.rec) + ' · asked ' + J(t.asked), t.pic)
  const n1 = await n()
  const l = await fileIn(p, W, I[28], { type: 'LL', who: RANGER, span: 'all' }, `${s}-2`)
  need(W, `${s}.2`, '(2) Saber files an LL for Ranger, Tue 28 Jul, all day', !!l.iid, J(l.rec) + ' · asked ' + J(l.asked), l.pic)
  const n2 = await n()
  const c3 = await editIn(p, W, l.iid, I[28], () => p.selectOption('#inpEditPop #inpEditType', 'OL'), `${s}-3`)
  need(W, `${s}.3`, '(3) the LL changed to OL (its window, Type → OL, Save)', c3.ok && c3.rec.type === 'OL', J(c3.rec) + ' · asked ' + J(c3.asked), c3.pic)
  const n3 = await n()
  const c4 = await editIn(p, W, l.iid, I[28], () => W.press(p, '#inpEditSpan [data-span="am"]', 'span-am'), `${s}-4`)
  need(W, `${s}.4`, '(4) the OL made a morning half day (AM, Save)', c4.ok, J(c4.rec) + ' · asked ' + J(c4.asked), c4.pic)
  const n4 = await n()
  const c5 = await editIn(p, W, t.iid, I[27], async () => { await W.press(p, `#inpEdCal [data-iso="${I[30]}"]`, 'cal-30'); await p.fill('#inpEditPop #inpEditOwnTitle', 'Range brief'); await p.fill('#inpEditPop #inpEditRmk', 'Bring water') }, `${s}-5`)
  need(W, `${s}.5`, '(5) on "Training", ONE save: moved to Thu 30 Jul, renamed "Range brief", its remark changed', c5.ok && c5.rec.date === 'Jul 30' && c5.rec.title === 'Range brief', J(c5.rec) + ' · asked ' + J(c5.asked), c5.pic)
  const n5 = await n()
  chk(W, `${s}.6`, 'each line is written at Saber\'s save, at once (D2562): Ranger\'s stored notices rise with each save (read from the store)', n1 > n0 && n2 > n1 && n3 > n2 && n4 > n3 && n5 > n4, `counts ${[n0, n1, n2, n3, n4, n5].join(' → ')} · ${J(await notes(p, RANGER))}`)
  await asR(p, W)
  let b = await bell(p, W, `${s}-7`)
  const by = re => b.lines.find(x => re.test(x.body))
  const L1 = b.lines.find(x => x.body === 'You were added · Saber' && /Training|Range brief/.test(x.title))
  const L3 = by(/^LL changed to OL · Saber$/), L4 = by(/^Now OL \(AM\) · Saber$/), L5 = by(/^Now Thu 30 Jul/)
  chk(W, `${s}.7a`, '(1) "You were added · Saber" under the input\'s name and date (D769)', !!L1, L1 ? say(L1) : sayB(b), b.pic)
  chk(W, `${s}.7c`, '(3) "LL changed to OL · Saber" (D2521 Q1)', !!L3, L3 ? say(L3) : sayB(b), b.pic)
  chk(W, `${s}.7d`, '(4) "Now OL (AM) · Saber" (D2521 Q2)', !!L4, L4 ? say(L4) : sayB(b), b.pic)
  rec(W, `${s}.7e`, '(5) the three-change line — D2521 Q3\'s count is what is built; his D2600 ("name every change", NOT built) → RECORDED', L5 ? say(L5) : 'no such line: ' + sayB(b), b.pic)
  chk(W, `${s}.7r`, 'the reminder\'s words exactly D2340 / D2390, untouched by the words pass', b.rem && b.rem.title === "You're SANS from Fri 17 Jul." && b.rem.body === "You're planned on Sat 18 Jul with nothing filed. Tap to file for availability.", say(b.rem), b.pic)
  chk(W, `${s}.7u`, 'every line unread with its own dot, the bell lit (D769)', b.lit === true && b.lines.length >= 5 && b.lines.every(x => x.unread), sayB(b), b.pic)
  const order = b.lines.map(x => x.id.startsWith('sansdue') ? 'REMINDER' : x.body.replace(' · Saber', ''))
  const ix = x => b.lines.indexOf(x)
  chk(W, `${s}.7o`, 'input lines newest first (D769): (5) above (4) above (3) above (1)', L1 && L3 && L4 && L5 && ix(L5) < ix(L4) && ix(L4) < ix(L3) && ix(L3) < ix(L1), order.join(' | '), b.pic)
  rec(W, `${s}.7p`, 'where the reminder sits among them (NOT RULED → RECORD)', order.join(' | '), b.pic)
  fitChk(W, `${s}.7f`, b)
  if (L5) {
    const tp = await tapAndRead(p, W, L5.id, `${s}-8`)
    chk(W, `${s}.8`, 'tap line (5): the input\'s own window opens; that line turns read (D769)', tp.ok && tp.inputWin !== 'none' && tp.line && !tp.line.unread, tapSay(tp), tp.pic)
    const rm = tp.after && tp.after.rem
    chk(W, `${s}.8b`, 'the reminder still unread, the bell still lit', rm && rm.unread && tp.after.lit === true, tp.after ? sayB(tp.after) : '', tp.pic)
  }
  b = await bell(p, W, '')
  if (b.rem) {
    const tr = await tapAndRead(p, W, b.rem.id, `${s}-9`)
    chk(W, `${s}.9`, 'tap the reminder: the SANS calendar on Sat 18 with its window (D2340)', tr.ok && /^Jul(y)? 2026$/i.test(tr.month) && /Sat\s*18/.test(tr.win), tapSay(tr), tr.pic)
  }
  b = await bell(p, W, '')
  await W.press(p, '[data-testid="bell-markall"]:visible', 'markall'); await sleep(400)
  b = await bell(p, W, `${s}-10`)
  chk(W, `${s}.10`, 'Mark all read: every line read, the bell dark', b.lit === false && b.lines.every(x => !x.unread), sayB(b), b.pic)
  await T.reload(p, 'us', 'us')
  b = await bell(p, W, `${s}-11`)
  chk(W, `${s}.11`, 'after a reload (signed in again): the same, all read, the bell dark', b.lit === false && b.lines.length >= 5 && b.lines.every(x => !x.unread), sayB(b), b.pic)
}

/* ---------- D2: a SANS change line beside an input line, and Saber's Undo ---------- */
async function d2(p, W) {
  const s = 'd2'
  await postAny(p, W, RANGER, I[17], `${s}.f1`)
  const m = await fileIn(p, W, I[27], { type: 'Meeting', who: RANGER, from: '10:00', to: '11:00', title: 'Meeting' }, `${s}-f2`)
  need(W, `${s}.f2`, 'Saber files a Meeting 10:00–11:00 for Ranger, Mon 27 Jul', !!m.iid, J(m.rec), m.pic)
  await asR(p, W)
  await fileMe(p, W, 'Ranger', I[17], null, `${s}.f3`)
  await asS(p, W)
  await moveTo(p, W, I[17], I[18], `${s}.1`)
  const c = await editIn(p, W, m.iid, I[27], () => W.press(p, `#inpEdCal [data-iso="${I[28]}"]`, 'cal-28'), `${s}-2`)
  need(W, `${s}.2`, 'Saber changes Ranger\'s Meeting of Mon 27 to Tue 28 (same sign-in)', c.ok && c.rec.date === 'Jul 28', J(c.rec), c.pic)
  const nb = await notes(p, RANGER)
  rec(W, `${s}.2n`, 'Ranger\'s notices as stored after the two changes (read)', J(nb))
  const u1 = await topBar(p, W, 'undo', RANGER, `${s}-3`)
  const mr = await recOf(p, m.iid)
  const na = await notes(p, RANGER)
  chk(W, `${s}.3`, 'the first top bar Undo takes back the Meeting\'s move (back on Mon 27); Ranger\'s unread input line simply goes (D1693)', u1.pressed && mr && mr.date === 'Jul 27' && na.length === nb.length - 1, `${tbSay(u1)} · Meeting ${J(mr)} · notices ${nb.length} → ${na.length}: ${J(na)}`, u1.pic)
  const u2 = await barLook(p)
  chk(W, `${s}.4`, 'the second Undo reaches the posting: greyed, saying why (D350)', u2.greyed === true && /post/i.test(u2.title || ''), J(u2), await W.pic(p, `${s}-4`))
  await asR(p, W)
  const b = await bell(p, W, `${s}-5`)
  const A = b.lines.filter(x => lineIs(x, Wd.A('Sat 18 Jul', 'Fri 17 Jul', true)))
  chk(W, `${s}.5`, 'Ranger: his A line untouched, unread, D2391 A\'s words', A.length === 1 && A[0].unread, sayB(b), b.pic)
  chk(W, `${s}.5b`, 'no line about the Meeting\'s move (taken back); only the A line and "You were added"', !b.lines.some(x => /^Now /.test(x.body)) && b.lines.every(x => A.includes(x) || x.body === 'You were added · Saber'), sayB(b), b.pic)
  fitChk(W, `${s}.5f`, b)
  nw(W, `${s}.6`, 'the READ case (he had read the input line before Saber\'s Undo; struck "taken back · Saber" as built)', 'probe P6 is NO: a reload sends Saber to the sign-in card and clears his Undo list, and two tabs never share a read mark — test-only (plan §B "Fixes only a test can show")')
}

/* ---------- D3: the 2b reminder beside an input's added and deleted lines (Hex) ---------- */
async function d3(p, W) {
  const s = 'd3'
  await tickOf(p, W, HEX, true, `${s}.f1`)
  await seatOn(p, W, `${s}.f2`, 5, HEX)
  const m = await fileIn(p, W, I[27], { type: 'Meeting', who: HEX, from: '10:00', to: '11:00', title: 'Meeting' }, `${s}-f3`)
  need(W, `${s}.f3`, 'Saber files a Meeting 10:00–11:00 for Hex, Mon 27 Jul', !!m.iid, J(m.rec), m.pic)
  const dl = await editIn(p, W, m.iid, I[27], async () => {}, `${s}-f4`, '#inpEditDel')
  need(W, `${s}.f4`, 'Saber deletes it (its window\'s Delete)', !dl.rec, `note "${dl.note}" · record after ${J(dl.rec)}`, dl.pic)
  await asH(p, W)
  let b = await bell(p, W, `${s}-1`)
  chk(W, `${s}.1`, 'Hex\'s reminder: "Your SANS availability is needed." over D2390\'s body, unchanged (D2394 2b)', b.rem && b.rem.title === 'Your SANS availability is needed.' && /^You're planned on .+ with nothing filed\. Tap to file for availability\.$/.test(b.rem.body) && /Sat 18/.test(b.rem.body), say(b.rem), b.pic)
  const added = b.lines.find(x => x.body === 'You were added · Saber')
  const gone = b.lines.find(x => /Deleted/.test(x.body))
  chk(W, `${s}.2`, 'the Meeting\'s "You were added · Saber" line', !!added, added ? say(added) : sayB(b), b.pic)
  rec(W, `${s}.3`, 'its deleted line — today the input\'s name and date in bold, "Deleted · Saber" (D2563\'s reword NOT built → RECORDED)', gone ? say(gone) : 'no deleted line: ' + sayB(b), b.pic)
  fitChk(W, `${s}.3f`, b)
  if (gone) {
    const tp = await tapAndRead(p, W, gone.id, `${s}-4`)
    chk(W, `${s}.4`, 'its tap: "That input is gone", the line read, the list left open (D2563 records today\'s tap)', tp.ok && /That input is gone/.test(tp.toast) && tp.listOpen && tp.line && !tp.line.unread, tapSay(tp), tp.pic)
  }
}

/* ---------- E: the plain-user round, as Ranger ---------- */
async function e1(p, W) {
  const s = 'e1'
  await postAny(p, W, RANGER, I[17], `${s}.f1`)
  await seatOn(p, W, `${s}.f2`, 5)
  await asR(p, W)
  let b = await bell(p, W, `${s}-01`)
  chk(W, `${s}.01`, 'the bell opens: his reminder (Sat 18), unread, the bell lit', b.rem && b.rem.unread && b.lit === true && remDays(b.rem) === 'Sat 18 Jul', sayB(b), b.pic)
  chk(W, `${s}.02`, 'closed by Escape', (await X.bellShut(p, 'escape', W)) === 'closed', '', await W.pic(p, `${s}-02`))
  await W.press(p, '.bellbtn:visible', 'bell'); await p.waitForSelector('[data-testid="bell-list"]', { timeout: 5000 }).catch(() => {})
  chk(W, `${s}.03`, 'closed by pressing the bell again', (await X.bellShut(p, 'bell', W)) === 'closed', '', await W.pic(p, `${s}-03`))
  await W.press(p, '.bellbtn:visible', 'bell'); await p.waitForSelector('[data-testid="bell-list"]', { timeout: 5000 }).catch(() => {})
  chk(W, `${s}.04`, 'closed by a press outside it', (await X.bellShut(p, 'out', W)) === 'closed', `page now ${await p.evaluate(() => window.CURPAGE)}`, await W.pic(p, `${s}-04`))
  b = await bell(p, W, '')
  const t = await X.bellTap(p, W, b.rem.id, `${s}-05`)
  chk(W, `${s}.05`, 'a tap on the reminder opens the SANS calendar on Sat 18, its window open, + Commitment live (D2340)', t.page === 'inputs' && t.win && /Sat\s*18/.test(t.win.ttl) && t.win.add === 'enabled', `page ${t.page} · ${t.month} · window "${t.win && t.win.ttl}" · + Commitment ${t.win && t.win.add}`, t.pic)
  /* E2: the SANS day window */
  chk(W, `${s}.06`, 'the SANS day window closed by its ✕', (await X.sansX(p, W, 'x')) === 'closed', '', await W.pic(p, `${s}-06`))
  await M.sday(p, W, I[18])
  chk(W, `${s}.07`, 'closed by Escape', (await X.sansX(p, W, 'esc')) === 'closed', '', await W.pic(p, `${s}-07`))
  await M.sday(p, W, I[18])
  if (!W.isPhone) {
    await p.locator(`[data-testid="sc-day-${I[19]}"]`).first().click({ position: { x: 8, y: 8 } }); await sleep(600)
    const pg = await X.sansPage(p)
    chk(W, `${s}.08`, 'a press outside it, on Sun 19 of the month: the page acts (the window shows Sun 19), the page under it as it was (lesson 4)', !!pg.win && /Sun\s*19/.test(pg.win.ttl), `window "${pg.win && pg.win.ttl}"`, await W.pic(p, `${s}-08`))
  } else {
    const geo = () => p.evaluate(() => { const w = [...document.querySelectorAll('[data-testid="win-sansday"]')].find(e => e.getBoundingClientRect().width > 0); if (!w) return 'gone'; const r = w.getBoundingClientRect(); return `top ${Math.round(r.y)} height ${Math.round(r.height)}` })
    const box = await p.evaluate(() => { const w = [...document.querySelectorAll('[data-testid="win-sansday"]')].find(e => e.getBoundingClientRect().width > 0); const r = w.getBoundingClientRect(); return [r.x, r.y] })
    const g0 = await geo()
    const gx = box[0] + 16, gy = box[1] + 26
    await p.mouse.move(gx, gy); await p.mouse.down(); for (let i = 1; i <= 8; i++) { await p.mouse.move(gx, gy + 36 * i); await sleep(30) } await sleep(90); await p.mouse.up(); await sleep(600)
    const g1 = await geo(); const pic1 = await W.pic(p, `${s}-08a`)
    const top = await p.evaluate(() => { const w = [...document.querySelectorAll('[data-testid="win-sansday"]')].find(e => e.getBoundingClientRect().width > 0); return w ? w.getBoundingClientRect().y : 0 })
    await p.mouse.move(gx, top + 26); await p.mouse.down(); for (let i = 1; i <= 8; i++) { await p.mouse.move(gx, top + 26 - 36 * i); await sleep(30) } await sleep(90); await p.mouse.up(); await sleep(600)
    const g2 = await geo()
    rec(W, `${s}.08`, 'the phone window\'s six-dot bar dragged down 288 and back up (D648, as built; a held mouse in WebKit — his iPhone\'s finger is his look)', `at open ${g0} · dragged down ${g1} · dragged back ${g2}`, pic1 + ', ' + await W.pic(p, `${s}-08b`))
  }
  await X.sansX(p, W)
  /* E3: the commitment window */
  const before = (await mine(p)).length
  let c = await M.commitOpen(p, W, I[18], `${s}-09`)
  await W.press(p, '#inpEditCancel:visible', 'cancel'); await sleep(400)
  chk(W, `${s}.09`, '+ Commitment → Cancel: closed, nothing made', c.ok && !(await p.locator('#inpEditPop:visible').count()) && (await mine(p)).length === before, `opened ${c.ok}`, c.pic + ', ' + await W.pic(p, `${s}-09-after`))
  c = await M.commitOpen(p, W, I[18], `${s}-10`)
  await W.press(p, '[data-testid="win-inputedit-x"]:visible', 'inp-x'); await sleep(400)
  chk(W, `${s}.10`, '+ Commitment → ✕ (nothing typed): closed at once, no question', !(await p.locator('#inpEditPop:visible').count()) && !(await p.locator('[data-testid="inped-escask-go"]:visible').count()), '', await W.pic(p, `${s}-10-after`))
  c = await M.commitOpen(p, W, I[18], `${s}-11`)
  await p.keyboard.press('Escape'); await sleep(500)
  chk(W, `${s}.11`, '+ Commitment → Escape: closed', !(await p.locator('#inpEditPop:visible').count()), '', await W.pic(p, `${s}-11-after`))
  c = await M.commitOpen(p, W, I[18], `${s}-12`)
  if (W.isPhone) await p.locator('#inpEditRmk').tap().catch(() => {})
  await p.fill('#inpEditRmk', 'W14D NOTE').catch(() => {})
  await W.press(p, '[data-testid="win-inputedit-x"]:visible', 'inp-x'); await sleep(400)
  const ask = await p.locator('[data-testid="inped-escask-go"]:visible').count()
  const askWords = M.clean(await p.locator('[data-testid="inped-escask-go"]:visible').first().evaluate(e => (e.closest('[role="dialog"], .escask, .inped-escask') || e.parentElement).textContent).catch(() => ''))
  chk(W, `${s}.12`, '+ Commitment → a remark typed → ✕: "Close it and lose them?" asked at the ✕ (D1622)', ask > 0 && /Close it and lose them\?/.test(askWords), `"${askWords}"`, await W.pic(p, `${s}-12-ask`))
  if (ask) { await W.press(p, '[data-testid="inped-escask-go"]:visible', 'discard'); await sleep(400) }
  chk(W, `${s}.12b`, 'answered to close: the window gone, nothing made', !(await p.locator('#inpEditPop:visible').count()) && (await mine(p)).length === before, '', await W.pic(p, `${s}-12-after`))
  c = await M.commitOpen(p, W, I[18], `${s}-13`)
  await X.setKinds(p, W, ['f'])
  const a = await M.add(p, W, `${s}-13`)
  const made = a.made.filter(x => x.who === RANGER)
  chk(W, `${s}.13`, '+ Commitment → Add (Fly): one Sat 18 filing', made.length === 1 && recIs(made[0], RANGER, I[18]), `made ${M.sayRecs(a.made)} · note "${a.said}"`, a.pic)
  b = await bell(p, W, `${s}-14`)
  chk(W, `${s}.14`, 'the bell: the reminder gone now Sat 18 is filed, no take-back line', !b.rem && b.struck.length === 0, sayB(b), b.pic)
  let v = await K.seen(p, W, I[18], `${s}-14m`)
  chk(W, `${s}.14m`, 'the SANS month: Sat 18 lists him and counts him (D2341)', v.has && v.f >= 1, v.words, v.pic)
  await T.closeAll(p, W)
  /* E4: open the saved commitment from Sat 18's line, delete it */
  await M.onSans(p, W)
  const o = await X.openLine(p, W, I[18], made[0] && made[0].iid, `${s}-15`)
  chk(W, `${s}.15`, 'the saved commitment opens from Sat 18\'s line, with Delete', o.ok && o.r && o.r.del, o.ok ? `${o.r.person} · ${o.r.ticks} · del ${o.r.del}` : o.why, o.pic)
  if (o.ok) {
    await W.press(p, '#inpEditDel:visible', 'delete'); await sleep(700)
    const gone = !(await M.sansRecs(p)).some(r => r.iid === made[0].iid)
    chk(W, `${s}.16`, 'Delete: the filing gone', gone, `note "${await L.toastSaid(p)}"`, await W.pic(p, `${s}-16`))
    b = await bell(p, W, `${s}-17`)
    chk(W, `${s}.17`, 'Sat 18 back in the reminder, which stays READ, the bell not lit (D2560: he tapped it with Sat 18 in it)', b.rem && !b.rem.unread && b.lit === false && remDays(b.rem) === 'Sat 18 Jul', sayB(b), b.pic)
    v = await K.seen(p, W, I[18], `${s}-17m`)
    chk(W, `${s}.17m`, 'the SANS month: Sat 18 no longer lists him (D2341)', !v.has, v.words, v.pic)
  }
  await T.closeAll(p, W)
  /* E5 — [SANS-WORDS-LEFTOVERS] (5): the note over the window's head, and a tap on its ✕ within the note's seconds */
  if (W.isPhone) {
    c = await M.commitOpen(p, W, I[19], `${s}-18`)
    await X.setKinds(p, W, ['f'])
    await W.press(p, '#inpEditSave:visible', 'save')
    await sleep(150)
    const nd = p.getByRole('button', { name: 'No document' }); if (await nd.count()) { await nd.first().click().catch(() => {}); await sleep(150) }
    const geo = await p.evaluate(() => {
      const b = e => { if (!e) return null; const r = e.getBoundingClientRect(); return r.width ? [r.x, r.y, r.width, r.height].map(Math.round) : null }
      const t = document.getElementById('toastEl'), cs = t ? getComputedStyle(t) : null
      const x = [...document.querySelectorAll('[data-testid="win-sansday-x"]')].find(e => e.getBoundingClientRect().width > 0)
      const xb = x && x.getBoundingClientRect()
      const at = xb ? document.elementFromPoint(xb.x + xb.width / 2, xb.y + xb.height / 2) : null
      return { note: t ? (t.textContent || '').replace(/\s+/g, ' ').trim() : '', noteBox: b(t), noteShown: !!(cs && +cs.opacity > 0.05 && cs.visibility !== 'hidden'), notePE: cs ? cs.pointerEvents : '', xBox: b(x), atX: at ? (at.dataset.testid || at.id || at.className || at.tagName) + '' : 'nothing', xc: xb ? [xb.x + xb.width / 2, xb.y + xb.height / 2] : null }
    })
    const picN = await W.pic(p, `${s}-18-note`)
    let landed = 'no ✕'
    if (geo.xc) {
      await p.touchscreen.tap(geo.xc[0], geo.xc[1]); await sleep(60)
      await p.screenshot({ path: path.join(OUT, 'taps', `${W.scn}-e5-x-now-phone.png`) })
      await sleep(700)
      landed = (await p.locator('[data-testid="win-sansday"]:visible').count()) ? 'the day window still open' : 'the day window closed'
    }
    rec(W, `${s}.18`, '[SANS-WORDS-LEFTOVERS] (5): a filing saved with the SANS day window open; the window\'s ✕ tapped within the note\'s seconds — does the tap land? (RECORD)', `${J(geo)} · after the tap: ${landed}`, picN + ', ' + await W.pic(p, `${s}-18-after`) + `, taps/${W.scn}-e5-x-now-phone.png`)
  } else rec(W, `${s}.18`, '[SANS-WORDS-LEFTOVERS] (5)', 'a phone step (the note over the phone window\'s title bar) — walked at the phone size only')
  /* the bell opened from other pages (lesson 12) */
  for (const pg of ['viewsched', 'leavewar']) {
    await T.closeAll(p, W); await L.go(p, pg)
    b = await bell(p, W, `${s}-19-${pg}`)
    chk(W, `${s}.19.${pg}`, `the bell opened from ${pg === 'viewsched' ? 'View-only Sched' : 'the Leave War'}: its list opens over the page, every line inside`, b.opened && b.allFit, sayB(b), b.pic)
    await X.bellShut(p, 'escape', W)
  }
}

/* ---------- E: as Saber — the Post out sheet, Quals' Edit, the other places, a published day's face, the changes window ---------- */
async function e2(p, W) {
  const s = 'e2'
  await postAny(p, W, RANGER, I[17], `${s}.f1`)
  await seatOn(p, W, `${s}.f2`, 5)
  await asR(p, W)
  const f = await fileMe(p, W, 'Ranger', I[18], null, `${s}.f3`)
  await fileMe(p, W, 'Ranger', I[19], null, `${s}.f3b`)
  await M.onSans(p, W)
  const o = await X.openLine(p, W, I[19], (await mine(p)).find(r => r.date === 'Jul 19').iid, `${s}-f4`)
  if (o.ok) { await W.press(p, '#inpEditDel:visible', 'delete'); await sleep(700) }
  need(W, `${s}.f4`, 'Ranger files Sat 18 and Sun 19, then deletes the Sun 19 one (for the changes window)', o.ok && (await mine(p)).length === 1, M.sayRecs(await mine(p)), o.pic)
  await asS(p, W)
  /* the Post out sheet (Hex, Fri 24): ✕, Escape, a press outside, post out, the posted-out sheet, Undo post out — w13 pu2 */
  const poOpen = async () => {
    await K.warReady(p)
    const c = (await L.lwCell(p, W, HEX, I[24])).cell
    if (!c) return false
    await W.press(p, c, 'cell'); await sleep(300)
    await W.press(p, '[data-testid="bid-more"]:visible', 'more')
    await W.press(p, '[data-testid="bid-postout"]:visible', 'postout'); await sleep(300)
    return !!(await p.locator('[data-testid="po-confirm"]:visible').count())
  }
  const sheetUp = () => p.locator('[data-testid="bid-picker"]:visible, [data-testid="postout-sheet"]:visible').count()
  let op = await poOpen()
  const pic0 = await W.pic(p, `${s}-01`)
  await W.press(p, '[data-testid="bid-cancel"]:visible', 'sheet-x'); await sleep(500)
  chk(W, `${s}.01`, "Hex's Fri 24 → ⋯ → Post out: the sheet opens; its ✕ closes it", op && !(await sheetUp()), `opened ${op}`, pic0 + ', ' + await W.pic(p, `${s}-01-after`))
  op = await poOpen()
  await p.keyboard.press('Escape'); await sleep(600)
  chk(W, `${s}.02`, 'opened again; Escape closes it', op && !(await sheetUp()), `opened ${op}`, await W.pic(p, `${s}-02-after`))
  op = await poOpen()
  const box = await p.locator('[data-testid="bid-picker"]:visible').first().boundingBox().catch(() => null)
  const vp = p.viewportSize()
  const pt = box ? (box.y > 120 ? [Math.round(vp.width / 2), Math.round(box.y / 2)] : [Math.max(8, Math.round(box.x / 2)), Math.round(vp.height / 2)]) : [10, 10]
  const at = await p.evaluate(([x, y]) => { const e = document.elementFromPoint(x, y); return e ? (e.className || e.tagName) + '' : 'nothing' }, pt)
  if (W.isPhone) await p.touchscreen.tap(pt[0], pt[1]); else await p.mouse.click(pt[0], pt[1])
  await sleep(600)
  const still = await sheetUp()
  rec(W, `${s}.03`, `opened again; a press outside it at ${pt.join(',')} (on "${String(at).slice(0, 40)}") (RECORD, as w13)`, `sheet still up ${still > 0}`, await W.pic(p, `${s}-03-after`))
  if (still) { await W.press(p, '[data-testid="bid-cancel"]:visible', 'sheet-x'); await sleep(400) }
  const r = await L.postOut(p, W, HEX, I[24], `${s}-04`)
  chk(W, `${s}.04`, 'Post out → SANS → Post out: Hex SANS from Fri 24', /becomes SANS/.test(r.line || ''), `"${r.line}" ${J(r.after)}`, r.pic)
  let sh = await T.sheet(p, W, HEX, I[24], `${s}-05`)
  await W.press(p, '[data-testid="postout-cancel"]:visible', 'po-x'); await sleep(500)
  chk(W, `${s}.05`, 'his PO cell opens the posted-out sheet; its ✕ closes it', sh.kind === 'posted-out sheet' && !(await sheetUp()), `${sh.kind} · "${sh.line}"`, sh.pic)
  sh = await T.sheet(p, W, HEX, I[24], `${s}-06`)
  await p.keyboard.press('Escape'); await sleep(600)
  chk(W, `${s}.06`, 'opened again; Escape closes it', sh.kind === 'posted-out sheet' && !(await sheetUp()), sh.kind, await W.pic(p, `${s}-06-after`))
  const u = await T.undoPo(p, W, HEX, I[24], `${s}-07`)
  const cell = (await L.lwCell(p, W, HEX, I[24])).text
  chk(W, `${s}.07`, 'Undo post out: the posting gone, his Fri 24 cell no longer PO', u.ok && !u.err && !/PO/.test(cell), `"${u.before}" · cell "${cell}" ${u.err || ''}`, u.pic)
  /* Quals → Edit quals → Done, and its Escape */
  await T.closeAll(p, W); await L.go(p, 'quals')
  const edit = async () => p.evaluate(() => !!document.querySelector('#qSave') && document.querySelector('#qSave').getBoundingClientRect().width > 0)
  await W.press(p, '#qEdit:visible', 'qedit'); await sleep(400)
  const on1 = await edit(); const picQ = await W.pic(p, `${s}-08`)
  await W.press(p, '#qSave:visible', 'qdone'); await sleep(400)
  chk(W, `${s}.08`, 'Quals → Edit quals opens the edit; Done closes it', on1 && !(await edit()), `edit on ${on1} → after Done ${await edit()}`, picQ + ', ' + await W.pic(p, `${s}-08-after`))
  await W.press(p, '#qEdit:visible', 'qedit'); await sleep(400)
  const on2 = await edit()
  await p.keyboard.press('Escape'); await sleep(500)
  const after = await edit()
  rec(W, `${s}.09`, 'Quals → Edit quals, then Escape (RECORD)', `edit on ${on2} → after Escape still in edit: ${after}`, await W.pic(p, `${s}-09-after`))
  if (after) { await W.press(p, '#qSave:visible', 'qdone'); await sleep(300) }
  /* the other places that should show his Sat 18 filing */
  const v = await K.seen(p, W, I[18], `${s}-10`)
  chk(W, `${s}.10`, 'the SANS month: Sat 18 lists Ranger, its F count counting him (D2341)', v.has && v.f >= 1, v.words, v.pic)
  await T.closeAll(p, W)
  const wc = await T.weekCrewOf(p, W, 'sat', RANGER, `${s}-11`)
  chk(W, `${s}.11`, "Edit Schedule's crew list, Sat: Ranger under SANS Avail, no reason line printed (D2420)", T.inSansAvail(wc.c) && !wc.c.pucks.some(x => x.shown && x.printed), `${wc.day} · ${T.crewWhere(wc.c)}`, wc.pic)
  const bc = await T.boardCrewOf(p, W, 5, RANGER, `${s}-12`)
  chk(W, `${s}.12`, "the Scheduler Board's crew drawer, Sat: Ranger under SANS Avail, no reason line printed", T.inSansAvail(bc.c) && !bc.c.pucks.some(x => x.shown && x.printed), T.crewWhere(bc.c), bc.pic)
  await L.openBoard(p, W, 5)
  const bells = await p.evaluate(() => [...document.querySelectorAll('.bellbtn')].map(e => ({ id: e.id, shown: e.getBoundingClientRect().width > 0, top: Math.round(e.getBoundingClientRect().top), inBoard: !!e.closest('#schedBoard') })))
  /* run 2: the first drawn bell was the page's own, under the board's bar (walk-scripts §7) — the board's own is inside it */
  const shownBell = bells.find(x => x.shown && x.inBoard)
  let bb = 'none shown'
  if (shownBell) {
    await W.press(p, '#schedBoard .bellbtn:visible', 'board-bell')
    await p.waitForSelector('[data-testid="bell-list"]', { timeout: 4000 }).catch(() => {})
    bb = await p.evaluate(() => { const l = [...document.querySelectorAll('[data-testid="bell-list"]')].find(e => e.getBoundingClientRect().width > 0); return l ? `list open, ${l.querySelectorAll('.bl-line').length} line(s)` : 'no list' })
  }
  const picB = await W.pic(p, `${s}-13`)
  chk(W, `${s}.13`, 'the Scheduler Board open: its bell shows and opens its list', !!shownBell && /list open/.test(bb), `${J(bells)} · ${bb}`, picB)
  await p.keyboard.press('Escape'); await sleep(300)
  await L.closeBoard(p, W)
  await L.go(p, 'viewsched')
  const vs = await p.evaluate(() => { const t = e => (e.textContent || '').replace(/\s+/g, ' ').trim(); return [...document.querySelectorAll('#vWeek .rsans, #vWeek [class*="sans"]')].filter(e => e.getBoundingClientRect().width > 0).map(t).join(' / ').slice(0, 200) || 'no SANS section drawn' })
  chk(W, `${s}.14`, 'View-only Sched: no SANS section (w13, as ruled)', vs === 'no SANS section drawn', vs, await W.pic(p, `${s}-14`))
  /* R20: the changes window, "All changes": the filing and its delete */
  await L.go(p, 'editsched')
  await W.press(p, '#histBtn:visible', 'hist'); await sleep(900)
  const tab = p.locator('.chgwin .win-tab:visible', { hasText: 'All changes' }).first()
  if (await tab.count()) { await W.press(p, tab, 'all-changes'); await sleep(500) }
  const cw = await p.evaluate(() => { const w = [...document.querySelectorAll('.chgwin')].find(e => e.getBoundingClientRect().width > 0); return w ? [...w.querySelectorAll('li, .chg-line, .hl-line, [class*="line"]')].filter(e => e.getBoundingClientRect().width > 0 && /SANS|Ranger/.test(e.textContent || '')).map(e => (e.textContent || '').replace(/\s+/g, ' ').trim()).filter((x, i, a) => a.indexOf(x) === i).slice(0, 12) : ['no window'] })
  const cwPic = await W.pic(p, `${s}-15`)
  rec(W, `${s}.15`, 'R20 — the changes window, "All changes": Ranger\'s SANS lines (the filings and the delete) (RECORD)', J(cw), cwPic)
  await p.keyboard.press('Escape'); await sleep(500)
  chk(W, `${s}.16`, 'the changes window closed by Escape', !(await p.evaluate(() => [...document.querySelectorAll('.chgwin')].some(e => e.getBoundingClientRect().width > 0))), '', await W.pic(p, `${s}-16`))
  /* R21: one look at a published day's face (Thu 16, his demo wave 2), unchanged by rounds 1–5 */
  await L.openBoard(p, W, 3)
  const pb = await L.publish(p, W, 3)
  await L.closeBoard(p, W)
  await L.go(p, 'viewsched'); await sleep(500)
  const face = await p.evaluate(() => { const d = [...document.querySelectorAll('#vWeek .day')][3]; if (!d) return 'no day'; d.scrollIntoView({ block: 'start' }); return (d.textContent || '').replace(/\s+/g, ' ').slice(0, 260) })
  await sleep(300)
  rec(W, `${s}.17`, 'R21 — a published day\'s face (Thu 16 published, View-only Sched): one look, unchanged by rounds 1–5 (RECORD)', `publish button "${pb}" · face "${face}"`, await W.pic(p, `${s}-17`))
}

const SCN = { b5: {}, b6: {}, a3: { phone: 'pc' }, a4: {}, a6: {}, a8: { phone: 'pc' }, a8b: {}, a9: { phone: 'pc' }, d1: {}, d2: {}, d3: {}, e1: {}, e2: {} }
const FN = { b5, b6, a3, a4, a6, a8, a8b, a9, d1, d2, d3, e1, e2 }
const ONLY = process.env.ONLY ? process.env.ONLY.split(',') : Object.keys(SCN)
for (const n of ONLY) {
  if (!SCN[n]) { console.log('no scenario', n); continue }
  const szKey = SZ === 'd' ? 'd' : (SCN[n].phone || 'p')
  console.log('=== ' + n + ' ' + szKey)
  await run(n, szKey, scene(FN[n]))
  writeFileSync(path.join(OUT, `results-all-${SZ}.json`), JSON.stringify(L.results, null, 1))
}
const c = k => L.results.filter(r => r.ok === k).length
console.log(`DONE ${SZ}: ${L.results.length} rows · PASS ${c(true)} · FAIL ${c(false)} · RECORDED ${c('REC')} · NOT WALKED ${c('NW')}`)
process.exit(0)
