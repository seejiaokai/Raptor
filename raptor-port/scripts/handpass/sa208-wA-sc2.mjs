// sa208-wA-sc2 — walker A's second set of scenarios for the chat 208 walk (A6–A14: the input's row and the swap, the OIL
// question, the posting that starts later, the week, two warnings, untimed and standby lines, AM / PM and the column).
// Loaded by sa208-wA.mjs, which hands it its helpers. Brief: docs/superpowers/briefs/2026-11-27-sans-answers-walk-brief.md.
export function add(SC, H, X) {
  const { B, Y, L, W5, T, J, sleep, ID, ISO, clean, NFW, OFFW, HALF, note, LNF, LOFF, LHRS, chk, rec, nw, step, pics,
    nowPic, noteGeom, geomSay, mkLine, mkSim, seat, sim, file, reason, pick, plant, rsay, lines, dragIn, moveMan, at, sansOnly } = H
  const { judgeNote, judgeReason, judgeLine, DESK, WK } = X
  /* a note that leads with the SANS words, with or without "(+N more)" */
  const leads = (seen, w) => (seen || []).some(n => n === w || (n.startsWith(w + ' (+') && /\(\+\d+ more\)$/.test(n)))
  X.leads = leads
  const judgeLead = (W, id, what, r, want) => chk(W, id, what, r.placed !== false && leads(r.seen, want), `notes ${J(r.seen)}${r.g ? ' · first frame ' + geomSay(r.g) : ''} · holds ${J(r.holds)}`, r.pic || pics(r.first, r.crop))
  X.judgeLead = judgeLead
  /* the SANS section with nothing picked (the board's list and Edit Schedule's crew panel) */
  async function unpicked(p, W, di, dow, tag) {
    await B.openB(p, W, di); await B.unarm(p, W, 'B'); await B.showList(p, W, 'B')
    const sB = await B.readSec(p, 'B'); const pB = await B.secPic(p, W, 'B', tag + '-B').catch(() => '')
    await B.showList(p, W, 'B', false)
    await B.listW(p, W, dow); await B.showList(p, W, 'W')
    const sW = await B.readSec(p, 'W'); const pW = await B.secPic(p, W, 'W', tag + '-W').catch(() => '')
    await B.showList(p, W, 'W', false)
    return { sB, sW, pic: pics(pB, pW) }
  }
  X.unpicked = unpicked

  /* ---- A6 · Mon 13: F6 (onto an input's row and a duty desk), S6 (a swap with the man on an input's row) ---- */
  SC.A6 = async (p, W) => {
    const di = 0
    await step(W, 'F6', async () => {
      const g = await p.evaluate(() => window.DAYS[0].ground.map((r, i) => [i, r.prog, r.who, r.src ? 'input ' + r.srcType : 'typed row']))
      rec(W, 'F6.rows', 'F6: Monday\'s programme rows (which came from an input)', J(g))
      const k = await plant(p, W, di, '[data-fill="g:0.7.+"]', ID.Otter, 'f6-input')
      rec(W, 'F6.reason', 'F6: Zenith\'s MEETING row (an accepted input, 09:00–17:00) picked — Otter\'s row in SANS Avail before the drop (RECORDED: the ground programme asks no SANS availability, D2583)', `armed ${k.armed} · ${rsay(k.r)}`, k.pic)
      judgeNote(W, 'F6.note', 'F6: Otter added to the input\'s row — no SANS words in any note (that row asks no SANS availability)', k, null)
      const l = await lines(p, W, di, 'Otter', 'f6-input')
      judgeLine(W, 'F6.list', 'F6: no SANS line for Otter from the input\'s row', l, null)
      chk(W, 'F6.agree', 'F6: the crew list\'s strike agreed with the drop — not struck for SANS before, no SANS line after', !(k.r && /SANS/.test(k.r.why || '')) && !l.sans.length, `${rsay(k.r)} · ${l.say}`)
      const d = await plant(p, W, di, '[data-fill="d:0.0.0.+"]', ID.Pixel, 'f6-duty')
      rec(W, 'F6.duty', 'F6: a duty desk (Monday\'s first) picked, Pixel tapped on — his row before, every note (RECORDED)', `armed ${d.armed} · ${rsay(d.r)} · notes ${J(d.seen)} · holds ${J(d.holds)}`, d.pic)
      const ld = await lines(p, W, di, 'Pixel', 'f6-duty')
      judgeLine(W, 'F6.dutylist', 'F6: no SANS line for Pixel from the duty desk', ld, null)
    })
    /* 07:30–08:30: clear of Bolt's SXO duty 13:00–21:30 and his APPOINTMENT 10:00–11:00 (dev4: at 14:00 the duty clash led
       the note, "(+3 more)" — the F10 rule, recorded there) */
    const ri = await mkSim(p, W, di, 'oft', 'EP-9', '07:30', '08:30')
    const EPW = sim(di, 'oft', ri, 'w')
    await step(W, 'S6', async () => {
      const k = await plant(p, W, di, EPW, ID.Marlin, 's6-marlin')
      judgeNote(W, 'S6.marlin', 'S6: Marlin tapped on to OFT EP-9 07:30–08:30 rear — "Marlin — SANS — no availability filed for today"', k, note('Marlin', NFW))
      if (WK()) { rec(W, 'S6.swap', 'S6 swap drag', 'walked on the desktop and in Chromium\'s phone (WebKit\'s touches drive no drag)'); return }
      const m = await moveMan(p, W, di, EPW, '[data-slot="g:0.6"]', 's6-swap')
      const ep = await at(p, EPW), gr = await p.evaluate(() => window.DAYS[0].ground[6] ? window.DAYS[0].ground[6].who : 'no row')
      const lb = await lines(p, W, di, 'Bolt', 's6-bolt'), lm = await lines(p, W, di, 'Marlin', 's6-marlin2')
      rec(W, 'S6.where', 'S6: Marlin\'s puck (EP-9 rear) dragged onto Bolt\'s puck on his APPOINTMENT row (an input, 10:00–11:00) — where each man is now, every note (RECORDED: the input-row swap rule, D755)', `EP-9 rear ${J(ep)} · APPOINTMENT row ${J(gr)} · notes ${J(m.seen)} · hint ${J(m.hover)} · ${lb.say} · ${lm.say}`, pics(m.hpic, m.first, lb.pic, lm.pic))
      if (String(ep).includes(ID.Bolt)) {
        chk(W, 'S6.note', 'S6: the man swapped into the sim (Bolt, nothing filed) gets the short note "Bolt — SANS — no availability filed for today"', leads(m.seen, note('Bolt', NFW)), J(m.seen), m.first)
        judgeLine(W, 'S6.list', 'S6: the warning list names the sim — "Bolt — SANS: no availability filed for today. Planned on OFT EP-9 07:30–08:30"', lb, LNF('Bolt', 'OFT EP-9 07:30–08:30'))
        const card = await p.evaluate(() => { const r = window.DAYS[0].ground[6]; const i = r && (window.INPUTS || []).find(x => x.iid === r.src); return { row: r && r.who, input: i ? JSON.stringify(i.people || i.person) : 'no input' } })
        chk(W, 'S6.card', 'S6: the input and its programme row agree about their person', card.input.includes(String(card.row)), J(card))
        await B.openB(p, W, di); await Y.sbUndo(p, W)
        rec(W, 'S6.undo', 'S6: Undo — both back', `EP-9 rear ${J(await at(p, EPW))} · APPOINTMENT ${J(await p.evaluate(() => window.DAYS[0].ground[6].who))}`)
      }
    })
  }

  /* ---- A7 · Sat 18: F7 / S7 — a swap held at the OIL question; the note after the answer ---- */
  SC.A7 = async (p, W) => {
    const di = 5
    let gi = -1
    await step(W, 'S7.set', async () => {
      await L.go(p, 'inputs')
      await p.locator('#inpCal [data-icday="2026-07-18"]').first().click({ position: { x: 8, y: 8 } }).catch(() => {}); await sleep(400)
      await W.press(p, '#icPopAdd:visible', 'icpop-add')
      await p.waitForSelector('#inpEditPop', { timeout: 5000 })
      const types = await p.locator('#inpEditType option').evaluateAll(os => os.map(o => o.value + ':' + o.textContent.trim()))
      const tr = types.find(t => /training/i.test(t))
      if (!tr) { nw(W, 'S7.set', 'a Training input', 'no Training type: ' + J(types)); return }
      await p.selectOption('#inpEditType', tr.split(':')[0]); await sleep(200)
      await p.selectOption('#inpEditPerson', ID.Jester).catch(() => {}); await sleep(150)
      const ad = p.locator('#inpEditAllday'); if (await ad.count() && await ad.isChecked()) await ad.uncheck()
      if (await p.locator('#inpEditStart').count()) { await p.fill('#inpEditStart', '14:00'); await p.fill('#inpEditEnd', '15:00') }
      const before = await p.evaluate(() => (window.INPUTS || []).map(r => r.iid))
      await W.press(p, '#inpEditSave:visible', 'save'); await sleep(700)
      const q = await p.locator('[data-testid="oilconf"]:visible').count()
      const qtext = q ? clean(await p.locator('[data-testid="oilconf"]').first().textContent()) : ''
      const qpic = await W.pic(p, 's7-file-oil')
      if (q) { await W.press(p, '[data-testid="oilconf-cancel"]:visible', 'oil-back'); await sleep(500) }
      let made = (await p.evaluate(() => (window.INPUTS || []).map(r => r.iid))).filter(x => !before.includes(x))
      rec(W, 'S7.file', 'S7: Saber files a Training input for Jester, Sat 18 14:00–15:00; the OIL question at filing (RECORDED), answered "Back"', `question ${q ? '"' + qtext + '"' : 'none'} · made ${J(made)}`, qpic)
      if (!made.length) {
        if (!(await p.locator('#inpEditPop:visible').count())) { nw(W, 'S7.set', 'the Training input', 'the window closed and nothing was made'); return }
        await W.press(p, '#inpEditSave:visible', 'save2'); await sleep(600)
        if (await p.locator('[data-testid="oil-no"]:visible').count()) { await W.press(p, '[data-testid="oil-no"]:visible', 'oil-no'); await W.press(p, '[data-testid="oilconf-save"]:visible', 'oil-save'); await sleep(700) }
        made = (await p.evaluate(() => (window.INPUTS || []).map(r => r.iid))).filter(x => !before.includes(x))
        rec(W, 'S7.file2', 'S7: the input saved with its OIL answered "No OIL" (Back kept the window open, nothing saved unanswered)', J(made))
      }
      await T.closeAll(p, W)
      gi = await p.evaluate(([iid]) => (window.DAYS[5].ground || []).findIndex(r => r.src === iid), [made[0]])
      Y.need(W, 'S7.row', 'Jester\'s Training row on Sat 18\'s programme', gi >= 0, J(await p.evaluate(() => (window.DAYS[5].ground || []).map(r => r.prog + ':' + r.who))))
    })
    if (gi < 0) return
    const ri = await mkSim(p, W, di, 'oft', 'EP-9', '10:00', '11:00')
    const EPW = sim(di, 'oft', ri, 'w')
    await step(W, 'S7', async () => {
      const k = await plant(p, W, di, EPW, ID.Marlin, 's7-marlin')
      judgeNote(W, 'S7.marlin', 'S7: Marlin tapped on to Sat OFT EP-9 rear — "Marlin — SANS — no availability filed for today"', k, note('Marlin', NFW))
      if (WK()) { rec(W, 'S7.swap', 'S7 swap drags', 'walked on the desktop and in Chromium\'s phone'); return }
      const row = () => p.evaluate(i => window.DAYS[5].ground[i].who, gi)
      const go = async (tag) => moveMan(p, W, di, EPW, `[data-slot="g:${di}.${gi}"]`, tag)
      const m1 = await go('s7-swap1')
      const sheet = await p.evaluate(() => { const t = x => (x.textContent || '').replace(/\s+/g, ' ').trim(); return [...document.querySelectorAll('[data-testid="oilconf"], [data-testid="oilbar"]')].filter(e => e.getBoundingClientRect().width > 0).map(e => (e.getAttribute('data-testid') || e.className) + ': ' + t(e).slice(0, 300)) })
      const spic = await W.pic(p, 's7-sheet')
      rec(W, 'S7.sheet', 'S7: Marlin dragged onto Jester\'s Training row — the OIL question (RECORDED its words); notes before the answer', `sheet ${J(sheet)} · notes so far ${J(m1.seen)} · EP-9 rear ${J(await at(p, EPW))} · row ${J(await row())}`, spic)
      if (!sheet.length) { nw(W, 'S7.oil', 'the swap held at the OIL question', 'no question showed (the input\'s OIL was already answered at filing — see S7.file)'); return }
      chk(W, 'S7.before', 'S7: before the answer nobody moved and no placement note with SANS words showed', String(await at(p, EPW)).includes(ID.Marlin) && !sansOnly(m1.seen).some(n => /^Jester/.test(n)), J(m1.seen))
      await W.press(p, '[data-testid="oilconf-cancel"]:visible', 'dont-swap'); await sleep(500)
      chk(W, 'S7.dont', 'S7: the question\'s "No" button ("Don’t swap") — both places kept', String(await at(p, EPW)).includes(ID.Marlin) && String(await row()).includes(ID.Jester), `EP-9 rear ${J(await at(p, EPW))} · row ${J(await row())} · bar ${J(await p.evaluate(() => { const b = document.querySelector('[data-testid="oilbar"]'); return b && b.getBoundingClientRect().width ? b.textContent.trim() : null }))}`, await W.pic(p, 's7-dont'))
      const ok = p.locator('[data-testid="oilbar-ok"]:visible'); if (await ok.count()) await W.press(p, ok, 'oilbar-ok')
      await go('s7-swap2')
      if (await p.locator('[data-testid="oil-no"]:visible').count()) await W.press(p, '[data-testid="oil-no"]:visible', 'oil-no')
      await Y.noteWatch(p)
      await W.press(p, '[data-testid="oilconf-save"]:visible', 'swap'); await sleep(40)
      const first = await nowPic(p, W, 's7-answered'); const g = await noteGeom(p); await sleep(700)
      const seen = await Y.notesSeen(p)
      const lj = await lines(p, W, di, 'Jester', 's7-after')
      rec(W, 'S7.after', 'S7: OIL answered "No OIL", Swap pressed — where each man is (RECORDED)', `EP-9 rear ${J(await at(p, EPW))} · row ${J(await row())} · notes ${J(seen)} · first frame ${geomSay(g)}`, first)
      chk(W, 'S7.note', 'F7 / S7: after the answer, Jester (now in the sim) gets the short note "Jester — SANS — no availability filed for today", never the long line, not lost behind the question', leads(seen, note('Jester', NFW)) && !seen.some(n => /Planned on/.test(n)), J(seen), first)
      judgeLine(W, 'S7.list', 'S7: the warning list still names the sim — "Jester — SANS: no availability filed for today. Planned on OFT EP-9 10:00–11:00"', lj, LNF('Jester', 'OFT EP-9 10:00–11:00'))
    })
  }

  /* ---- A8 · F8 / S4: Ranger posted out as SANS from Fri 17 — Thu, Fri, Mon; across midnight into Friday; filed ---- */
  SC.A8 = async (p, W) => {
    await B.postR(p, W, 'a8-post')
    const th = await mkSim(p, W, 3, 'oft', 'EP-9', '10:00', '11:00')
    const fr = await mkSim(p, W, 4, 'oft', 'EP-9', '10:00', '11:00')
    const fr2 = await mkSim(p, W, 4, 'oft', 'EP-8', '14:00', '15:00')
    const mo = await mkLine(p, W, 0, 'VX', '09:00', '10:00')
    const R17 = 'SANS from Fri 17 Jul: no availability filed'
    const ranger = async (di, sel, tag) => { const a = await B.arm(p, W, 'B', di, sel, { now: true, tag }); const c = await Y.crewAll(p, '#schedBoard'); const pic = await Y.clipOf(p, W, `#schedBoard .rpuck[data-person="${ID.Ranger}"]:visible`, tag + '-ranger', 40); return { a, c, say: Y.say1(c, ID.Ranger), pic } }
    await step(W, 'F8.thu', async () => {
      const r = await ranger(3, sim(3, 'oft', th, 'p'), 'f8-thu')
      chk(W, 'F8.thu', 'F8 / S4: Thu 16 (before his date) EP-9 front picked — Ranger not struck for SANS, no SANS words', !/SANS/.test(r.say), r.say, r.pic)
    })
    await step(W, 'F8.fri', async () => {
      const r = await reason(p, W, 4, sim(4, 'oft', fr, 'p'), ID.Ranger, 'f8-fri')
      judgeReason(W, 'F8.reason', 'F8 / S4: Fri 17 EP-9 front picked — Ranger struck "SANS from Fri 17 Jul: no availability filed" (no "file it")', r, R17)
      if (DESK()) {
        await B.unarm(p, W, 'B')
        const h = await B.dragHold(p, W, 'B', ID.Ranger, sim(4, 'oft', fr, 'p'), 'f8-hint', { drop: false, pic: true })
        chk(W, 'F8.hint', 'S4: the drag hint over Friday\'s seat — the same words', h.hover && h.hover.why === R17, J(h.hover), h.hpic)
      }
      const k = await plant(p, W, 4, sim(4, 'oft', fr, 'p'), ID.Ranger, 'f8-plant')
      judgeNote(W, 'F8.note', 'F8 / S4: planted on Friday — the note "Ranger — SANS from Fri 17 Jul: no availability filed"; nothing tells the scheduler to file', k, note('Ranger', R17))
      const l = await lines(p, W, 4, 'Ranger', 'f8-fri')
      rec(W, 'F8.list', 'F8: Friday\'s warning list, his SANS line (RECORDED)', l.say, l.pic)
    })
    await step(W, 'F8.mon', async () => {
      const r = await ranger(0, seat(0, mo, 'p'), 'f8-mon')
      chk(W, 'F8.mon', 'F8: Mon 13 VX front picked — Ranger not struck for SANS', !/SANS/.test(r.say), r.say, r.pic)
    })
    await step(W, 'S4.cross', async () => {
      await B.closeB(p, W)
      await p.clock.setSystemTime(new Date('2026-07-17T00:00:20'))
      await sleep(65000)
      const today = await L.today(p)
      const r = await reason(p, W, 4, `[data-fill="s:4.oft.${fr2}.+"]`, ID.Ranger, 's4-cross')
      const l = await lines(p, W, 4, 'Ranger', 's4-cross')
      rec(W, 'S4.cross', 'S4: the clock crosses into Fri 17 with the page open (the posting now run) — his reason and line on Friday, no reload (RECORDED)', `page today ${today} · ${rsay(r.r)} · ${l.say}`, pics(r.pic, l.pic))
      await T.reload(p, 'ad', 'a'); await sleep(800)
      const r2 = await reason(p, W, 4, `[data-fill="s:4.oft.${fr2}.+"]`, ID.Ranger, 's4-reopen')
      const l2 = await lines(p, W, 4, 'Ranger', 's4-reopen')
      chk(W, 'S4.reopen', 'S4: reopened on Friday — the ordinary words: struck "SANS — no availability filed for today", line "Ranger — SANS: no availability filed for today. Planned on OFT EP-9 10:00–11:00"', r2.r && r2.r.why === NFW && l2.sans.some(x => x.text === LNF('Ranger', 'OFT EP-9 10:00–11:00')), `${rsay(r2.r)} · ${l2.say}`, pics(r2.pic, l2.pic))
      chk(W, 'S4.same', 'S4 / lesson 29: the page left open read the same as reopened', r.r && r2.r && r.r.why === r2.r.why && J(l.sans.map(x => x.text)) === J(l2.sans.map(x => x.text)), `open: "${r.r && r.r.why}" ${J(l.sans.map(x => x.text))} · reopened: "${r2.r && r2.r.why}" ${J(l2.sans.map(x => x.text))}`)
    })
    await step(W, 'S4.file', async () => {
      await file(p, W, ISO[4], ID.Ranger, ['oft'], 'all', 's4-oft')
      const r = await reason(p, W, 4, `[data-fill="s:4.oft.${fr2}.+"]`, ID.Ranger, 's4-filed')
      const l = await lines(p, W, 4, 'Ranger', 's4-filed')
      chk(W, 'S4.filed', 'S4: OFT filed for Friday — his strike and his SANS line gone', r.r && !r.r.struck && !l.sans.length, `${rsay(r.r)} · ${l.say}`, pics(r.pic, l.pic))
    })
  }

  /* ---- A9 · F9: planted on Thursday's seat from Edit Schedule's week ---- */
  SC.A9 = async (p, W) => {
    const wi = await mkLine(p, W, 3, 'VT', '09:00', '10:00')
    await B.closeB(p, W)
    await step(W, 'F9', async () => {
      const a = await B.arm(p, W, 'W', 3, seat(3, wi, 'p'), { now: true, tag: 'f9' })
      const s = await B.readSec(p, 'W'); const row = B.rowOf(s, ID.Jester)
      const sp = await B.secPic(p, W, 'W', 'f9-reason').catch(() => '')
      chk(W, 'F9.reason', 'F9: Thursday\'s VT 09:00–10:00 front seat pressed in Edit Schedule\'s week — Jester struck "SANS — no availability filed for today" in the week\'s crew panel', a.armed && row && row.struck && row.why === NFW, `armed ${a.armed} · ${rsay(row)}`, pics(sp, a.now))
      const k = await B.pickMan(p, W, 'W', ID.Jester, 'f9', { now: true, pic: true })
      const first = k.now || await nowPic(p, W, 'f9-note')
      const holds = await at(p, seat(3, wi, 'p'))
      chk(W, 'F9.note', 'F9: tapped on from the week — the short words for him (D2753); "Thu ·" in front only when the line lands on another day (RECORDED the words exactly)', String(holds).includes(ID.Jester) && (k.seen || []).some(n => n === note('Jester', NFW) || n === 'Thu · ' + note('Jester', NFW)), `notes ${J(k.seen)} · holds ${J(holds)}`, pics(first, k.tpic))
      await B.closeB(p, W)
      const d = await Y.dayList(p, W, '#eWeek', 3)
      rec(W, 'F9.list', 'F9: Thursday\'s list on Edit Schedule — his line', Y.listSay(d), await Y.clipOf(p, W, '#eWeek .day[data-day="3"] [data-dwbox="3"]', 'f9-list', 10))
    })
  }

  /* ---- A10 · F10 (second case): SANS the top line with a lesser one ---- */
  SC.A10 = async (p, W) => {
    const di = 1
    const wi = await mkLine(p, W, di, 'VQ', '17:30', '18:30')
    await step(W, 'F10b', async () => {
      const k = await plant(p, W, di, seat(di, wi, 'w'), ID.Marlin, 'f10b')
      const l = await lines(p, W, di, 'Marlin', 'f10b')
      const n = (k.seen || []).find(x => /^Marlin/.test(x)) || ''
      const more = /\(\+\d+ more\)$/.test(n)
      W.rec('F10b', 'F10: Marlin (on Tue\'s RU ACM 14:40, nothing filed) planted on VQ 17:30 rear — SANS ranks above a double turn: "Marlin — SANS — no availability filed for today (+1 more)"', more ? /^Marlin — SANS — no availability filed for today \(\+\d+ more\)$/.test(n) : 'REC', `notes ${J(k.seen)} · ${l.say}${more ? '' : ' (no second warning raised — RECORDED)'}`, pics(k.first, k.crop, l.pic))
    })
  }

  /* ---- A11 · Wed 15: F11 (untimed flight and untimed OFT), F12 (standby lines) ---- */
  SC.A11 = async (p, W) => {
    const di = 2
    const vu = await mkLine(p, W, di, 'VU')
    const ep = await mkSim(p, W, di, 'oft', 'EP-7')
    await step(W, 'F11a', async () => {
      const k = await plant(p, W, di, seat(di, vu, 'p'), ID.Rebel, 'f11a')
      judgeReason(W, 'F11a.reason', 'F11: VU (no times) front seat — Rebel struck "SANS — no availability filed for today"', k, NFW)
      judgeNote(W, 'F11a.note', 'F11: planted — the note "Rebel — SANS — no availability filed for today"', k, note('Rebel', NFW))
      const l = await lines(p, W, di, 'Rebel', 'f11a')
      rec(W, 'F11a.list', 'F11: the flying line\'s words with no times (RECORDED — flying lines unchanged by D2754)', l.say, l.pic)
    })
    await step(W, 'F11b', async () => {
      const k = await plant(p, W, di, sim(di, 'oft', ep, 'w'), ID.Otter, 'f11b')
      judgeReason(W, 'F11b.reason', 'F11: OFT EP-7 (no times) rear seat — Otter struck "SANS — no availability filed for today"', k, NFW)
      judgeNote(W, 'F11b.note', 'F11: planted — the note "Otter — SANS — no availability filed for today"', k, note('Otter', NFW))
      const l = await lines(p, W, di, 'Otter', 'f11b')
      judgeLine(W, 'F11b.list', 'F11: the list "Otter — SANS: no availability filed for today. Planned on OFT EP-7 (no times yet)"', l, LNF('Otter', 'OFT EP-7 (no times yet)'))
    })
    for (const kind of ['SC', 'AVALON', 'BB']) await step(W, 'F12.' + kind, async () => {
      const l = await Y.addLine(p, W, di, { kind })
      Y.need(W, 'F12.set.' + kind, `Wed: + Wave → ${kind}`, l.wi >= 0, J(l))
      const n = l.f.n
      for (const ai of kind === 'SC' ? [0, 1] : [0]) {
        const sel = seat(di, l.wi, 'p', ai), tag = `f12-${kind}-${ai}`
        const k = await plant(p, W, di, sel, ID.Jester, tag)
        const row = k.r
        const ls = await lines(p, W, di, 'Jester', tag)
        await B.openB(p, W, di); await W5.boardDrawer(p, W, false)
        const pk = (await Y.pucksOf(p, '#schedBoard', ID.Jester)).filter(x => x.where !== 'crew list')
        chk(W, `F12.${kind}${ai}`, `F12: ${kind} line, place ${ai + 1} of ${n} — Jester (nothing filed) not struck for SANS, no SANS note, no SANS line, no amber "A" from SANS`, k.placed && !(row && /SANS/.test(row.why || '')) && !sansOnly(k.seen).length && !ls.sans.length && !pk.some(x => x.chips.includes('A')), `${rsay(row)} · notes ${J(k.seen)} · ${ls.say} · pucks ${Y.puckSay(pk)}`, pics(k.pic, ls.pic))
        await B.openB(p, W, di); await Y.sbUndo(p, W)
      }
    })
  }

  /* ---- A12 · Mon 13: F29 / S14 / F32 — AM / PM under the letter, the column, PM filings on a morning seat. dev4: Tally is an
     OCU WSO, so his plant on VX led with "OCU with no IP" (ranked above SANS — the F10 rule); Marlin (CAT A) carries the
     note check, Tally the reason and the hint. Pixel's typed hours are read, not judged against the flight's own window ---- */
  SC.A12 = async (p, W) => {
    const di = 0
    await file(p, W, ISO[di], ID.Marlin, ['fly'], 'PM', 'marlin')
    await file(p, W, ISO[di], ID.Pixel, ['fly'], ['08:00', '10:00'], 'pixel')
    await file(p, W, ISO[di], ID.Jester, ['fly'], 'AM', 'jester')
    await file(p, W, ISO[di], ID.Otter, ['oft'], 'PM', 'otter')
    const vx = await mkLine(p, W, di, 'VX', '09:00', '10:00')
    const vw = await mkLine(p, W, di, 'VW', '09:00', '10:00')
    const ve = await mkLine(p, W, di, 'VE', '16:00', '17:00')
    const say = (s, ids) => ids.map(id => B.rowSay(B.rowOf(s, id))).join(' · ')
    await step(W, 'F29.none', async () => {
      const u = await unpicked(p, W, di, 'Mon', 'f29-none')
      for (const [surf, s] of [['B', u.sB], ['W', u.sW]]) {
        const t = B.rowOf(s, ID.Tally) || {}, m = B.rowOf(s, ID.Marlin) || {}, j = B.rowOf(s, ID.Jester) || {}, o = B.rowOf(s, ID.Otter) || {}, x = B.rowOf(s, ID.Pixel) || {}
        chk(W, 'F29.none.' + surf, `F29 / S14 / D2758 (${surf === 'B' ? 'the board' : 'Edit Schedule\'s panel'}), nothing picked: on one line — Tally "F · PM", Marlin "F · PM", Jester "F · AM", Otter "O · PM", Pixel "F · 08:00–10:00"`, t.badge === 'F · PM' && t.bLines === 1 && m.badge === 'F · PM' && j.badge === 'F · AM' && o.badge === 'O · PM' && x.badge === 'F · 08:00–10:00' && x.bLines === 1, say(s, [ID.Tally, ID.Marlin, ID.Jester, ID.Otter, ID.Pixel]), u.pic)
        const c = B.colJudge(s)
        chk(W, 'F29.none.col.' + surf, `S14 (${surf}), nothing picked: the letters in one column`, c.ok, c.why)
      }
    })
    const pickedSec = async (sel, tag) => { const a = await B.arm(p, W, 'B', di, sel, { now: true, tag }); const s = await B.readSec(p, 'B'); const pic = await B.secPic(p, W, 'B', tag + '-sec').catch(() => ''); return { a, s, pic: pics(pic, a.now) } }
    await step(W, 'F29.rear', async () => {
      const { s, pic } = await pickedSec(seat(di, vx, 'w'), 'f29-vxrear')
      const t = B.rowOf(s, ID.Tally) || {}, m = B.rowOf(s, ID.Marlin) || {}, x = B.rowOf(s, ID.Pixel) || {}
      chk(W, 'F29.rear.tally', 'F29 / F32: VX 09:00–10:00 rear picked — Tally struck "SANS — available PM only", "F" with "PM" under it, his hover the same', t.struck && t.why === HALF('PM') && t.l === 'F' && t.h === 'PM' && t.title === `Tally — ${HALF('PM')}`, B.rowSay(t) + ` · title "${t.title}"`, pic)
      chk(W, 'F29.rear.marlin', 'F29: Marlin (Fly PM) the same — struck "SANS — available PM only", "F" / "PM"', m.struck && m.why === HALF('PM') && m.l === 'F' && m.h === 'PM', B.rowSay(m))
      rec(W, 'F29.rear.pixel', 'F29: Pixel (typed 08:00–10:00) on VX 09:00–10:00 — struck or free, his hours under the letter (RECORDED: the flight\'s whole window, brief included, is what his hours are held against)', B.rowSay(x))
      chk(W, 'F29.rear.pixelh', 'F29: typed hours stay whole under his letter — "F" with "08:00–10:00" under it', x.l === 'F' && x.h === '08:00–10:00', B.rowSay(x))
      const c = B.colJudge(s)
      chk(W, 'F29.rear.col', 'F29 / S14 (lesson 9): the letters in one column for struck and free rows alike (left edges within 0.5px), after the widest reason', c.ok, c.why + ' · ' + s.rows.map(r => `${r.cs}${r.struck ? '(x)' : ''}@${r.bL}`).join(' '))
      chk(W, 'F29.rear.cut', 'S14: nothing cut or past the list\'s edge; no sideways scroll', !s.rows.some(r => r.cut || r.past) && !s.sideways.length && !s.pageWide, B.secSay(s))
    })
    await step(W, 'F29.front', async () => {
      const { s, pic } = await pickedSec(seat(di, vx, 'p'), 'f29-vxfront')
      const j = B.rowOf(s, ID.Jester) || {}
      chk(W, 'F29.front.jester', 'F29: VX front picked — Jester (Fly AM) free, "F" with "AM" under it (a pilot\'s row)', !j.struck && j.l === 'F' && j.h === 'AM', B.rowSay(j), pic)
      const c = B.colJudge(s)
      chk(W, 'F29.front.col', 'F29 / S14: the column measured with a front seat picked — one column', c.ok, c.why + ' · ' + s.rows.map(r => `${r.cs}${r.struck ? '(x)' : ''}@${r.bL}`).join(' '))
    })
    await step(W, 'F29.eve', async () => {
      const { s, pic } = await pickedSec(seat(di, ve, 'w'), 'f29-verear')
      const t = B.rowOf(s, ID.Tally) || {}, x = B.rowOf(s, ID.Pixel) || {}, o = B.rowOf(s, ID.Otter) || {}
      chk(W, 'F29.eve.tally', 'F29: VE 16:00–17:00 rear picked — Tally free, "F" with "PM" under it, no reason', !t.struck && !t.why && t.l === 'F' && t.h === 'PM', B.rowSay(t), pic)
      chk(W, 'F29.eve.pixel', 'F29: Pixel (typed 08:00–10:00) struck "SANS — available 08:00–10:00 only", hours under the letter', x.struck && x.why === HALF('08:00–10:00') && x.h === '08:00–10:00', B.rowSay(x))
      chk(W, 'F29.eve.otter', 'F29: Otter (OFT PM) struck "SANS — offered OFT only, not Fly", "O" with "PM" under it', o.struck && o.why === OFFW('OFT', 'Fly') && o.l === 'O' && o.h === 'PM', B.rowSay(o))
      const c = B.colJudge(s)
      chk(W, 'F29.eve.col', 'F29 / S14: one column, struck and free', c.ok, c.why + ' · ' + s.rows.map(r => `${r.cs}${r.struck ? '(x)' : ''}@${r.bL}`).join(' '))
    })
    await step(W, 'F32', async () => {
      if (DESK()) {
        await B.openB(p, W, di); await B.unarm(p, W, 'B')
        const h = await B.dragHold(p, W, 'B', ID.Tally, seat(di, vx, 'w'), 'f32-hint', { drop: false, pic: true })
        chk(W, 'F32.hint', 'F32: the drag hint over VX rear — "SANS — available PM only"', h.hover && h.hover.why === HALF('PM'), J(h.hover), h.hpic)
      }
      const k = await plant(p, W, di, seat(di, vx, 'w'), ID.Tally, 'f32')
      rec(W, 'F32.tally', 'F32: Tally (an OCU WSO) planted on VX rear — the note (RECORDED: "OCU with no IP" ranks above SANS, so it leads, the F10 rule)', `notes ${J(k.seen)}`, pics(k.first, k.crop))
      const l = await lines(p, W, di, 'Tally', 'f32')
      chk(W, 'F32.list', 'F32 / D2759: the warning list keeps clock times — "Tally — SANS: available 12:01–23:59 only. Planned on VX (T/O 09:00)" (not ruled — the pair goes to him)', l.sans.some(x => x.text === LHRS('Tally', '12:01', '23:59', 'VX (T/O 09:00)')), l.say, l.pic)
      const km = await plant(p, W, di, seat(di, vw, 'w'), ID.Marlin, 'f32m')
      judgeLead(W, 'F32.note', 'F32: Marlin (Fly PM) planted on VW 09:00–10:00 rear — the note "Marlin — SANS — available PM only"', km, note('Marlin', HALF('PM')))
      const lm = await lines(p, W, di, 'Marlin', 'f32m')
      chk(W, 'F32.mlist', 'F32 / D2759: his line keeps clock times — "Marlin — SANS: available 12:01–23:59 only. Planned on VW (T/O 09:00)"', lm.sans.some(x => x.text === LHRS('Marlin', '12:01', '23:59', 'VW (T/O 09:00)')), lm.say, pics(km.first, lm.pic))
    })
  }

  /* ---- A13 · Fri 17: S12, S13, F34, F35, F37 ---- */
  SC.A13 = async (p, W) => {
    const di = 4
    const fB = await file(p, W, ISO[di], ID.Zenith, ['oft'], 'AM', 'zenith')
    const fK = await file(p, W, ISO[di], ID.Kraken, ['oft'], 'PM', 'kraken')
    await file(p, W, ISO[di], ID.Jester, ['oft'], ['08:00', '10:00'], 'jester')
    await file(p, W, ISO[di], ID.Zulu, ['oft'], 'PM', 'zulu')
    await file(p, W, ISO[di], ID.Otter, ['fly'], 'AM', 'otter')
    await file(p, W, ISO[di], ID.Pixel, ['fly'], 'PM', 'pixel')
    const e9 = await mkSim(p, W, di, 'oft', 'EP-9', '14:00', '15:00')
    const e10 = await mkSim(p, W, di, 'oft', 'EP-10', '09:00', '10:00')
    const e12 = await mkSim(p, W, di, 'oft', 'EP-12')
    const s9 = await mkSim(p, W, di, 'oft', 'EP-8', '16:00', '17:00')
    const s10 = await mkSim(p, W, di, 'oft', 'EP-7', '07:00', '08:00')
    const s12 = await mkSim(p, W, di, 'oft', 'EP-13')
    const E9 = sim(di, 'oft', e9, 'p'), E9W = sim(di, 'oft', e9, 'w'), E9X = `[data-fill="s:${di}.oft.${s9}.+"]`, E10 = sim(di, 'oft', e10, 'p'), E10X = `[data-fill="s:${di}.oft.${s10}.+"]`
    await step(W, 'S12.e9', async () => {
      const r = await reason(p, W, di, E9, ID.Zenith, 's12-e9')
      const k = r.s, b = B.rowOf(k, ID.Zenith) || {}, kr = B.rowOf(k, ID.Kraken) || {}, j = B.rowOf(k, ID.Jester) || {}
      chk(W, 'S12.e9.reasons', 'S12: EP-9 14:00–15:00 front picked — Zenith (OFT AM) struck "SANS — available AM only" ("O" / "AM"); Kraken (OFT PM) free; Jester (typed 08:00–10:00) struck "SANS — available 08:00–10:00 only"', b.struck && b.why === HALF('AM') && b.l === 'O' && b.h === 'AM' && !kr.struck && j.struck && j.why === HALF('08:00–10:00'), [b, kr, j].map(B.rowSay).join(' · '), r.pic)
      let k2
      if (DESK()) { k2 = await dragIn(p, W, di, E9, ID.Zenith, 's12-bolt'); chk(W, 'S12.hint', 'S12: the drag hint — "SANS — available AM only"', k2.hover && k2.hover.why === HALF('AM'), J(k2.hover), k2.hpic) }
      else k2 = await pick(p, W, di, E9, ID.Zenith, 's12-bolt')
      judgeLead(W, 'S12.bolt.note', 'S12: Zenith planted — the note "Zenith — SANS — available AM only"', k2, note('Zenith', HALF('AM')))
      const l = await lines(p, W, di, 'Zenith', 's12-bolt')
      chk(W, 'S12.bolt.list', 'S12 / D2759: his warning line keeps clock times — "Zenith — SANS: available 00:00–12:00 only. Planned on OFT EP-9 14:00–15:00"', l.sans.some(x => x.text === LHRS('Zenith', '00:00', '12:00', 'OFT EP-9 14:00–15:00')), l.say, l.pic)
      const kj = await plant(p, W, di, E9W, ID.Jester, 's12-jester')
      judgeLead(W, 'S12.jester.note', 'S12: Jester planted on EP-9 rear — "Jester — SANS — available 08:00–10:00 only"', kj, note('Jester', HALF('08:00–10:00')))
      const lj = await lines(p, W, di, 'Jester', 's12-jester')
      judgeLine(W, 'S12.jester.list', 'S12: "Jester — SANS: available 08:00–10:00 only. Planned on OFT EP-9 14:00–15:00"', lj, LHRS('Jester', '08:00', '10:00', 'OFT EP-9 14:00–15:00'))
    })
    await step(W, 'S12.e10', async () => {
      const k = await plant(p, W, di, E10, ID.Kraken, 's12-kraken')
      judgeReason(W, 'S12.kraken.reason', 'S12: EP-10 09:00–10:00 front picked — Kraken struck "SANS — available PM only" ("O" / "PM")', k, HALF('PM'), 'O / PM')
      judgeLead(W, 'S12.kraken.note', 'S12: planted — "Kraken — SANS — available PM only"', k, note('Kraken', HALF('PM')))
      const l = await lines(p, W, di, 'Kraken', 's12-kraken')
      chk(W, 'S12.kraken.list', 'S12 / D2759: "Kraken — SANS: available 12:01–23:59 only. Planned on OFT EP-10 09:00–10:00"', l.sans.some(x => x.text === LHRS('Kraken', '12:01', '23:59', 'OFT EP-10 09:00–10:00')), l.say, l.pic)
    })
    await step(W, 'F34.typed', async () => {
      const e = await B.editS(p, W, ISO[di], fB, { span: ['00:00', '12:00'] })
      const r = await reason(p, W, di, E9X, ID.Zenith, 'f34-typed')
      const l = await lines(p, W, di, 'Zenith', 'f34-typed')
      chk(W, 'F34.typed', 'F34 / S12: Zenith\'s AM changed to typed hours 00:00–12:00 — "SANS — available 00:00–12:00 only" (typed hours stay hours), never "AM only"', r.r && r.r.why === HALF('00:00–12:00'), `saved ${J(e.now)} · ${rsay(r.r)} · ${l.say}`, pics(r.pic, l.pic))
      await B.editS(p, W, ISO[di], fB, { span: 'AM' })
      const r2 = await reason(p, W, di, E9X, ID.Zenith, 'f34-back')
      chk(W, 'F34.back', 'F34: typed hours changed back to AM — "SANS — available AM only"', r2.r && r2.r.why === HALF('AM'), rsay(r2.r), r2.pic)
    })
    await step(W, 'S13', async () => {
      const t = async (bfld, v) => { await L.openBoard(p, W, di); await W5.boardDrawer(p, W, false); return Y.setBox(p, W, di, bfld, v) }
      const read = async (cs, tag) => lines(p, W, di, cs, tag)
      await t(`sr:${di}.oft.${e9}.str`, '11:00'); await t(`sr:${di}.oft.${e9}.end`, '12:00')
      let l = await read('Zenith', 's13-1100')
      chk(W, 'S13.am.in', 'S13: EP-9 (Zenith on it, OFT AM) retimed 11:00–12:00 — AM covers it: no SANS line', !l.sans.length, l.say, l.pic)
      await t(`sr:${di}.oft.${e9}.str`, '12:00'); await t(`sr:${di}.oft.${e9}.end`, '12:30')
      l = await read('Zenith', 's13-1200')
      chk(W, 'S13.am.out', 'S13: EP-9 12:00–12:30 — outside AM: his line back, "Zenith — SANS: available 00:00–12:00 only. Planned on OFT EP-9 12:00–12:30"', l.sans.length === 1 && l.sans[0].text === LHRS('Zenith', '00:00', '12:00', 'OFT EP-9 12:00–12:30'), l.say, l.pic)
      await t(`sr:${di}.oft.${e10}.str`, '12:01'); await t(`sr:${di}.oft.${e10}.end`, '13:00')
      l = await read('Kraken', 's13-1201')
      chk(W, 'S13.pm.in', 'S13: EP-10 (Kraken on it, OFT PM) retimed 12:01–13:00 — PM covers it: no SANS line', !l.sans.length, l.say, l.pic)
      await t(`sr:${di}.oft.${e10}.str`, '12:00')
      l = await read('Kraken', 's13-1200pm')
      chk(W, 'S13.pm.out', 'S13: EP-10 12:00–13:00 — PM starts 12:01: "Kraken — SANS: available 12:01–23:59 only. Planned on OFT EP-10 12:00–13:00"', l.sans.length === 1 && l.sans[0].text === LHRS('Kraken', '12:01', '23:59', 'OFT EP-10 12:00–13:00'), l.say, l.pic)
      await t(`sr:${di}.oft.${e9}.str`, ''); await t(`sr:${di}.oft.${e9}.end`, '')
      l = await read('Zenith', 's13-clear')
      chk(W, 'S13.clear', 'S13: EP-9\'s times cleared — no hours held against him: no SANS line (OFT offered)', !l.sans.length, l.say, l.pic)
      await B.editS(p, W, ISO[di], fB, { kinds: ['fly'] })
      l = await read('Zenith', 's13-fly')
      const r = await reason(p, W, di, E9X, ID.Zenith, 's13-fly')
      chk(W, 'S13.fly', 'S13: Zenith changed to Fly only — his line on the untimed sim "Zenith — SANS: offered Fly only today. Planned on OFT EP-9 (no times yet)"; an OFT row\'s reason "SANS — offered Fly only, not OFT"', l.sans.some(q => q.text === LOFF('Zenith', 'Fly', 'OFT EP-9 (no times yet)')) && r.r && r.r.why === OFFW('Fly', 'OFT'), `${rsay(r.r)} · ${l.say}`, pics(r.pic, l.pic))
    })
    await step(W, 'F34.k', async () => {
      await B.editS(p, W, ISO[di], fK, { span: ['13:00', '17:00'] })
      let r = await reason(p, W, di, E10X, ID.Kraken, 'f34-k1317')
      chk(W, 'F34.k1317', 'F34: Kraken\'s PM changed to typed 13:00–17:00 — "SANS — available 13:00–17:00 only", no "PM only" left over', r.r && r.r.why === HALF('13:00–17:00'), rsay(r.r), r.pic)
      await B.editS(p, W, ISO[di], fK, { span: 'all' })
      r = await reason(p, W, di, E10X, ID.Kraken, 'f34-kall')
      const l = await lines(p, W, di, 'Kraken', 'f34-kall')
      chk(W, 'F34.kall', 'F34: changed to all day — no strike, no SANS line', r.r && !r.r.struck && !l.sans.length, `${rsay(r.r)} · ${l.say}`, pics(r.pic, l.pic))
    })
    await step(W, 'F35', async () => {
      const vn = await mkLine(p, W, di, 'VN', '11:30', '13:00')
      const a = await B.arm(p, W, 'B', di, seat(di, vn, 'w'), { now: true, tag: 'f35' }); const s = await B.readSec(p, 'B'); const pic = await B.secPic(p, W, 'B', 'f35-sec').catch(() => '')
      const z = B.rowOf(s, ID.Otter) || {}, rb = B.rowOf(s, ID.Pixel) || {}
      chk(W, 'F35.noon', 'F35: VN 11:30–13:00 (across noon) rear picked — Otter (Fly AM) struck "SANS — available AM only", Pixel (Fly PM) struck "SANS — available PM only"', z.why === HALF('AM') && rb.why === HALF('PM'), `${B.rowSay(z)} · ${B.rowSay(rb)}`, pics(pic, a.now))
      const vm = await mkLine(p, W, di, 'VM', '23:00', '00:30')
      const a2 = await B.arm(p, W, 'B', di, seat(di, vm, 'w'), { now: true, tag: 'f35n' }); const s2 = await B.readSec(p, 'B'); const pic2 = await B.secPic(p, W, 'B', 'f35n-sec').catch(() => '')
      rec(W, 'F35.night', 'F35: VM 23:00–00:30 (lands after midnight) rear picked — Pixel (Fly PM): struck or not (RECORDED)', B.rowSay(B.rowOf(s2, ID.Pixel)), pics(pic2, a2.now))
    })
    await step(W, 'F37', async () => {
      const X12 = sim(di, 'oft', e12, 'w')
      const k = await plant(p, W, di, X12, ID.Zulu, 'f37')
      judgeReason(W, 'F37.reason', 'F37: OFT EP-12 (no times) rear picked — Zulu (OFT PM) not struck', k, null)
      judgeNote(W, 'F37.note', 'F37: planted — no SANS words', k, null)
      let l = await lines(p, W, di, 'Zulu', 'f37')
      judgeLine(W, 'F37.list', 'F37: no SANS line until times are typed', l, null)
      await Y.setBox(p, W, di, `sr:${di}.oft.${e12}.str`, '09:00'); await Y.setBox(p, W, di, `sr:${di}.oft.${s12}.str`, '07:00')
      const r = await reason(p, W, di, `[data-fill="s:${di}.oft.${s12}.+"]`, ID.Zulu, 'f37-0900')
      l = await lines(p, W, di, 'Zulu', 'f37-0900')
      chk(W, 'F37.typed', 'F37: start 09:00 typed — Zulu struck "SANS — available PM only"; his line "Zulu — SANS: available 12:01–23:59 only. Planned on OFT EP-12 09:00–10:30 (end assumed)"', r.r && r.r.why === HALF('PM') && l.sans.some(x => x.text === LHRS('Zulu', '12:01', '23:59', 'OFT EP-12 09:00–10:30 (end assumed)')), `${rsay(r.r)} · ${l.say}`, pics(r.pic, l.pic))
    })
  }

  /* ---- A14 · Wed 15: F33 (Scribe, AM OFT); F36 (a PM filing over Tue–Thu) ---- */
  SC.A14 = async (p, W) => {
    await step(W, 'F33', async () => {
      const di = 2
      const ep = await mkSim(p, W, di, 'oft', 'EP-11', '13:00', '14:00')
      const k = await plant(p, W, di, sim(di, 'oft', ep, 'w'), ID.Scribe, 'f33')
      judgeReason(W, 'F33.reason', 'F33: Wed OFT EP-11 13:00–14:00 rear — Scribe (seed: OFT, AM) struck "SANS — available AM only"', k, HALF('AM'), 'O / AM')
      judgeLead(W, 'F33.note', 'F33: planted — "Scribe — SANS — available AM only"', k, note('Scribe', HALF('AM')))
      const vt = await mkLine(p, W, di, 'VT', '07:00', '08:00')
      const r = await reason(p, W, di, seat(di, vt, 'w'), ID.Scribe, 'f33-fly')
      judgeReason(W, 'F33.fly', 'F33: a flying seat (VT 07:00–08:00 rear) — "SANS — offered OFT only, not Fly" (what he offered wins over hours)', r, OFFW('OFT', 'Fly'))
    })
    await step(W, 'F36', async () => {
      await T.closeAll(p, W)
      await W5.sansDay(p, W, ISO[1])
      await W.press(p, '[data-testid="win-sansday"] [data-testid="sd-add"]', 'sd-add')
      await p.waitForSelector('#inpEditPop', { timeout: 5000 })
      await p.selectOption('#inpEditPerson', ID.Pixel); await sleep(200)
      await B.setKinds(p, W, ['fly']); await B.setSpan(p, W, 'PM')
      const d16 = p.locator('#inpEditPop b', { hasText: /^16$/ }).first()
      if (W.isPhone) await d16.tap(); else await d16.click()
      await sleep(300)
      const form = clean(await p.locator('#inpEditPop').first().textContent())
      const fpic = await W.pic(p, 'f36-form')
      const before = await p.evaluate(() => (window.INPUTS || []).map(r => r.iid))
      await W.press(p, '#inpEditSave:visible', 'save'); await sleep(900)
      const nd = p.getByRole('button', { name: 'No document' }); if (await nd.count()) { await nd.first().click().catch(() => {}); await sleep(400) }
      const iid = (await p.evaluate(() => (window.INPUTS || []).map(r => r.iid))).filter(x => !before.includes(x))[0]
      await T.closeAll(p, W)
      const made = iid ? await T.inp(p, iid) : null
      Y.need(W, 'F36.file', 'F36: Pixel files Fly, PM, Tue 14 – Thu 16 in one filing (the form\'s date calendar: 16 pressed after the window opened on 14)', !!iid, `form "${form.slice(Math.max(0, form.indexOf('Dates')), Math.max(0, form.indexOf('Dates')) + 140)}" · ${J(made)}`, fpic)
      for (const di of [1, 2, 3]) {
        const wi = await mkLine(p, W, di, 'VA' + di, '07:00', '08:00')
        const r = await reason(p, W, di, seat(di, wi, 'w'), ID.Pixel, 'f36-' + di)
        judgeReason(W, 'F36.' + di, `F36: ${['Mon', 'Tue', 'Wed', 'Thu'][di]} 07:00–08:00 rear — Pixel struck "SANS — available PM only" (one filing over the span)`, r, HALF('PM'), 'F / PM')
      }
    })
  }
}
