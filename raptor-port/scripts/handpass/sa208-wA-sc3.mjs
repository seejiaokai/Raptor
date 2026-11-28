// sa208-wA-sc3 — walker A's plain-user rounds for the chat 208 walk: Astra S1 (desktop and phone), Fable F38 (desktop) and
// F39 (phone; its drags in Chromium's phone). Loaded by sa208-wA.mjs, which hands it its helpers. Brief:
// docs/superpowers/briefs/2026-11-27-sans-answers-walk-brief.md.
export function add(SC, H, X) {
  const { B, Y, L, W5, T, J, sleep, ID, ISO, clean, NFW, OFFW, HALF, note, LNF, LOFF, LHRS, chk, rec, nw, step, pics,
    nowPic, noteGeom, geomSay, mkSim, sim, file, reason, pick, plant, rsay, lines, hide, moveMan, fingerIn, at, sansOnly } = H
  const { judgeNote, judgeReason, judgeLine, DESK, WK, PC, leads, judgeLead, unpicked } = X
  const A_WORDS = 'Advisory — on shift and also down for a ground event or programme item; or SANS availability not filed, or planned outside it'
  /* the amber A on a man's seated puck: the chip's own hover words, the puck's whole hover */
  const amber = (p, id) => p.evaluate(id => [...document.querySelectorAll(`#schedBoard [data-slot] .puck[data-person="${id}"], #schedBoard [data-fill] .puck[data-person="${id}"]`)].filter(e => e.getBoundingClientRect().width > 0).map(e => { const c = [...e.querySelectorAll('.lchip')].find(x => (x.textContent || '').trim() === 'A'); return { chip: !!c, chipTitle: c ? c.getAttribute('title') : null, title: e.getAttribute('title') || '' } }), id)
  /* the SANS form's three ticks, in the order drawn, and a picture of the window */
  const ticks = p => p.evaluate(() => [...document.querySelectorAll('#inpEditSans label')].filter(e => e.getBoundingClientRect().width > 0).map(e => ({ t: (e.textContent || '').trim(), x: Math.round(e.getBoundingClientRect().left), y: Math.round(e.getBoundingClientRect().top), on: !!(e.querySelector('input') || {}).checked })))
  /* Hex posted out as SANS from Thu 16 (the Leave War's own Post out), then signed in as himself */
  async function hexSans(p, W) {
    await Y.X.A.post(p, W, ID.Hex, ISO[3], 'hex-post')
    const role = await T.as(p, W, 'hex', 'hex')
    Y.need(W, 'set.hex', 'signed in as Hex (posted out as SANS from Thu 16)', /hex/i.test(role) || !!role, `role badge "${role}"`)
  }
  async function fileAsHex(p, W, kinds, span, tag) {
    let form = null, fpic = ''
    const f = await B.fileS(p, W, ISO[3], null, kinds, span, { beforeSave: async () => { form = await ticks(p); fpic = await W.pic(p, tag + '-form') } })
    Y.need(W, 'set.' + tag, `Hex files his own SANS availability for Thu 16 on the SANS tab: ${kinds.join('+')} ${span}`, !!f.iid, f.iid ? J(f.made) : f.refused, fpic)
    chk(W, tag + '.ticks', 'D2755: the form\'s ticks read Fly · OFT · AMT, left to right (or top to bottom on a wrap), in his own filing', form && form.map(x => x.t).join(',') === 'Fly,OFT,AMT' && form[0].x <= form[1].x && form[1].x <= form[2].x, J(form), fpic)
    const rows = await B.sansDayRows(p, W, ISO[3])
    return { iid: f.iid, rows }
  }

  /* ---- PU1 · Astra S1: file, plan, read, hide, plant again, offer AMT — Bolt, Mon 13, AMT BOX 13:00–14:00 ---- */
  SC.PU1 = async (p, W) => {
    const di = 0
    let iid = null
    await step(W, 'S1.file', async () => {
      const c = await W5.commit(p, W, ISO[di], ID.Jester, ['fly'], 'all', 's1-file')
      iid = c.iid
      Y.need(W, 'S1.file', 'S1: Inputs → SANS, 13 Jul, "+ Commitment", Jester, Fly only, All day, Save', !!iid, J(c.rec), c.pic)
      const rows = await B.sansDayRows(p, W, ISO[di])
      rec(W, 'S1.cal', 'S1: the SANS calendar\'s Mon 13 window — what each man filed (his entry read)', rows)
      const u = await unpicked(p, W, di, 'Mon', 's1-card')
      const b = B.rowOf(u.sW, ID.Jester) || {}
      chk(W, 'S1.card', 'S1: the schedule\'s crew list (nothing picked) shows Jester "F"', b.badge === 'F', B.rowSay(b), u.pic)
    })
    if (!iid) return
    const box = await mkSim(p, W, di, 'amt', 'BOX', '13:00', '14:00')
    /* a twin row of the same times, nobody on it: his reason read there once he sits on BOX (dev5: "already on …") */
    const twin = await mkSim(p, W, di, 'amt', 'BOX2', '16:00', '17:00')
    const BX = sim(di, 'amt', box, 'p')
    let ix = null
    await step(W, 'S1.plant', async () => {
      const k = await plant(p, W, di, BX, ID.Jester, 's1')
      judgeReason(W, 'S1.reason', 'S1: AMT BOX 13:00–14:00 front picked — Jester struck "SANS — offered Fly only, not AMT"', k, OFFW('Fly', 'AMT'))
      judgeNote(W, 'S1.note', 'S1: tapped on — the note "Jester — SANS — offered Fly only, not AMT"', k, note('Jester', OFFW('Fly', 'AMT')))
      if (k.g) chk(W, 'S1.notebox', 'S1: the note on its first frame — in the screen, words whole, not under the top bar', k.g.inScreen && k.g.whole && !k.g.underBar, geomSay(k.g), k.first)
      const l = await lines(p, W, di, 'Jester', 's1')
      judgeLine(W, 'S1.list', 'S1: the warning list "Jester — SANS: offered Fly only today. Planned on AMT BOX 13:00–14:00"', l, LOFF('Jester', 'Fly', 'AMT BOX 13:00–14:00'))
      const m = l.sans.find(x => x.text === LOFF('Jester', 'Fly', 'AMT BOX 13:00–14:00')); ix = m ? m.ix : null
    })
    await step(W, 'S1.again', async () => {
      if (ix == null) { nw(W, 'S1.again', 'hide and plant again', 'his line was not found'); return }
      await hide(p, W, di, ix, 's1-hide')
      const off = await moveMan(p, W, di, BX, 'crew', 's1-off')
      chk(W, 'S1.off', 'S1: his line hidden, then he is taken off the seat (dragged back to the crew list)', !String(await at(p, BX)).includes(ID.Jester), `seat ${J(await at(p, BX))} · notes ${J(off.seen)}`, off.first)
      const k = await plant(p, W, di, BX, ID.Jester, 's1-again')
      judgeNote(W, 'S1.note2', 'S1: planted there again with his line hidden — the same short note "Jester — SANS — offered Fly only, not AMT"', k, note('Jester', OFFW('Fly', 'AMT')))
      const l = await lines(p, W, di, 'Jester', 's1-again')
      rec(W, 'S1.list2', 'S1: his line after the second plant (RECORDED — hidden still?)', l.say, l.pic)
    })
    await step(W, 'S1.amt', async () => {
      const e = await B.editS(p, W, ISO[di], iid, { kinds: ['fly', 'amt'] })
      const r = await reason(p, W, di, `[data-fill="s:${di}.amt.${twin}.+"]`, ID.Jester, 's1-amt')
      const l = await lines(p, W, di, 'Jester', 's1-amt')
      chk(W, 'S1.amt', 'S1: his filing edited to Fly + AMT — the SANS mismatch gone: not struck, no SANS line', r.r && !r.r.struck && !l.sans.length, `saved ${J(e.now && e.now.sans)} · ${rsay(r.r)} · ${l.say}`, pics(r.pic, l.pic))
    })
  }

  /* ---- PU38 · Fable F38, desktop end to end: Hex files Thu, PM, Fly + OFT; the scheduler's whole round ---- */
  SC.PU38 = async (p, W) => {
    if (!DESK()) { rec(W, 'F38', 'F38', 'desktop round — walked at the desktop size'); return }
    const di = 3
    await hexSans(p, W)
    const f = await fileAsHex(p, W, ['fly', 'oft'], 'PM', 'f38-file')
    rec(W, 'F38.card', 'F38: his entry on the SANS calendar — its letters and his half day (RECORDED; Fable expected "F/O · PM")', f.rows)
    await B.asS(p, W)
    await step(W, 'F38.panel', async () => {
      await B.listW(p, W, 'Thu')
      const s = await B.readSec(p, 'W'); const h = B.rowOf(s, ID.Hex) || {}
      chk(W, 'F38.panel', 'F38: Edit Schedule, Thursday\'s crew panel (nothing picked) — Hex "F/O · PM" on one line', h.badge === 'F/O · PM' && h.bLines === 1, B.rowSay(h), await B.secPic(p, W, 'W', 'f38-panel').catch(() => ''))
    })
    const ep = await mkSim(p, W, di, 'oft', 'EP-9', '09:00', '')
    const EPW = sim(di, 'oft', ep, 'w'), TAIL = 'OFT EP-9 09:00–10:30 (end assumed)'
    let ix = null
    await step(W, 'F38.plant', async () => {
      const k = await plant(p, W, di, EPW, ID.Hex, 'f38')
      judgeReason(W, 'F38.reason', 'F38: a morning OFT row with only a start (EP-9 09:00) — Hex struck "SANS — available PM only"', k, HALF('PM'))
      judgeLead(W, 'F38.note', 'F38: planted anyway — the note "Hex — SANS — available PM only"', k, note('Hex', HALF('PM')))
      const l = await lines(p, W, di, 'Hex', 'f38')
      chk(W, 'F38.list', 'F38: the warning list "Hex — SANS: available 12:01–23:59 only. Planned on OFT EP-9 09:00–10:30 (end assumed)"', l.sans.some(x => x.text === LHRS('Hex', '12:01', '23:59', TAIL)), l.say, l.pic)
      const m = l.sans.find(x => /EP-9/.test(x.text)); ix = m ? m.ix : null
      await B.openB(p, W, di); await W5.boardDrawer(p, W, false)
      const a = await amber(p, ID.Hex)
      const ppic = await Y.clipOf(p, W, `#schedBoard ${EPW}`, 'f38-puck', 30)
      chk(W, 'F38.amber', 'F38 / D2757: the amber "A" on his puck — the chip\'s hover and the puck\'s hover read the new words', a.length && a.every(x => x.chip && x.chipTitle === A_WORDS && x.title.includes(A_WORDS)), J(a), ppic)
      /* a real mouse hover over the A (desktop): the browser's own tooltip is not drawn in a headless picture — the words are read */
      const chip = p.locator(`#schedBoard ${EPW} .lchip`).filter({ hasText: /^A$/ }).first()
      if (await chip.count()) { await chip.hover(); await sleep(600); rec(W, 'F38.hover', 'F38: the mouse rests on the A (a headless browser draws no tooltip; its words are the title read above)', await chip.getAttribute('title'), await nowPic(p, W, 'f38-hover')) }
    })
    await step(W, 'F38.hide', async () => {
      if (ix == null) { nw(W, 'F38.hide', 'hide', 'his line not found'); return }
      const n0 = (await lines(p, W, di, 'Hex', '')).head
      await hide(p, W, di, ix, 'f38-hide')
      const l = await lines(p, W, di, 'Hex', 'f38-hidden')
      await B.openB(p, W, di); const a = await amber(p, ID.Hex)
      rec(W, 'F38.hidden', 'F38: his line hidden — the count before / after, and his "A" (RECORDED: it goes or stays as before)', `before "${n0}" · after "${l.head}" · ${l.say} · amber ${J(a)}`, l.pic)
      chk(W, 'F38.count', 'F38: the count drops by one when his line is hidden', (() => { const n = s => +((/(\d+) issues?/.exec(s || '') || [])[1] || -1); return n(l.head) === n(n0) - 1 })(), `"${n0}" → "${l.head}"`)
      await B.closeB(p, W)
      const d = await Y.dayList(p, W, '#eWeek', di)
      const hid = (d.lines || []).find(x => x.hid && /Hex/.test(x.text))
      const dpic = await Y.clipOf(p, W, `#eWeek .day[data-day="${di}"] [data-dwbox="${di}"]`, 'f38-daylist', 10)
      rec(W, 'F38.daylist', 'F38: Thursday\'s list on Edit Schedule opened by its bar — the hidden line and its button', `${Y.listSay(d)}`, dpic)
      if (hid && /data-woff/.test(hid.html || '')) {
        await Y.dayLineBtn(p, W, '#eWeek', di, hid.ix, 'f38-unhide')
        const d2 = await Y.readDay(p, '#eWeek', di)
        const back = (d2.lines || []).find(x => /Hex/.test(x.text) && /SANS/.test(x.text))
        chk(W, 'F38.unhide', 'F38: the hidden line\'s own ↺ button ("Flag this again") pressed — the line shown again', back && !back.hid, Y.listSay(d2), await Y.clipOf(p, W, `#eWeek .day[data-day="${di}"] [data-dwbox="${di}"]`, 'f38-unhidden', 10))
      } else nw(W, 'F38.unhide', 'unhide', 'no button on the hidden line in Edit Schedule\'s list: ' + Y.listSay(d))
      /* the day's list closed again by its bar (a control that opens and closes) */
      await W.press(p, `#eWeek .day[data-day="${di}"] [data-daywarn="${di}"]`, 'f38-bar-close'); await sleep(350)
      const st = await p.evaluate(i => { const b = document.querySelector(`#eWeek .day[data-day="${i}"] [data-dwbox="${i}"]`); return b ? b.classList.contains('open') : null }, di)
      chk(W, 'F38.barclose', 'F38: the day\'s list closes by its own bar', st === false, 'open: ' + st)
    })
    await step(W, 'F38.end', async () => {
      await Y.setBox(p, W, di, `sr:${di}.oft.${ep}.end`, '10:15')
      const l = await lines(p, W, di, 'Hex', 'f38-end')
      chk(W, 'F38.end', 'F38: the end typed 10:15 — "(end assumed)" gone: "…Planned on OFT EP-9 09:00–10:15"', l.sans.some(x => x.text === LHRS('Hex', '12:01', '23:59', 'OFT EP-9 09:00–10:15')) && !l.sans.some(x => /end assumed/.test(x.text)), l.say, l.pic)
    })
    const e10 = await mkSim(p, W, di, 'oft', 'EP-10', '14:00', '15:00')
    const E10W = sim(di, 'oft', e10, 'w')
    await step(W, 'F38.move', async () => {
      const m = await moveMan(p, W, di, EPW, E10W, 'f38-move')
      const l = await lines(p, W, di, 'Hex', 'f38-move')
      chk(W, 'F38.move', 'F38: Hex dragged to an afternoon row (EP-10 14:00–15:00) — no SANS note, his SANS line gone', String(await at(p, E10W)).includes(ID.Hex) && !sansOnly(m.seen).length && !l.sans.length, `notes ${J(m.seen)} · ${l.say}`, pics(m.first, l.pic))
    })
    await step(W, 'F38.del', async () => {
      const e = await B.editS(p, W, ISO[di], f.iid, { del: true })
      const l = await lines(p, W, di, 'Hex', 'f38-del')
      chk(W, 'F38.del', 'F38: his filing deleted on the calendar — the line becomes "Hex — SANS: no availability filed for today. Planned on OFT EP-10 14:00–15:00"', l.sans.some(x => x.text === LNF('Hex', 'OFT EP-10 14:00–15:00')), `deleted: ${J(e.now)} · ${l.say}`, l.pic)
    })
    await step(W, 'F38.crew', async () => {
      /* lesson 17: the crew panel's own show / hide pressed both ways, the page no wider than the window after each */
      await B.closeB(p, W); await L.go(p, 'editsched')
      const tog = p.locator('#rosTab:visible, .ros-tab:visible, .ros-rail:visible').first()
      if (!(await tog.count())) { nw(W, 'F38.crew', 'the crew panel\'s toggle', 'no toggle drawn on the desktop'); return }
      const wide = () => p.evaluate(() => ({ doc: document.documentElement.scrollWidth, vw: innerWidth }))
      await W.press(p, tog, 'crew-hide'); await sleep(500); const w1 = await wide(); const p1 = await W.pic(p, 'f38-crew-hidden')
      await W.press(p, tog, 'crew-show'); await sleep(500); const w2 = await wide(); const p2 = await W.pic(p, 'f38-crew-shown')
      chk(W, 'F38.crew', 'F38 / lesson 17: the crew panel hidden and shown again by its own control — the page no wider than the window each time', w1.doc <= w1.vw + 1 && w2.doc <= w2.vw + 1, `${J(w1)} · ${J(w2)}`, pics(p1, p2))
    })
  }

  /* ---- PU39 · Fable F39, phone end to end: Hex files AM-only AMT from the phone; an afternoon AMT seat; the note; the list;
     a blank man by tap, and (Chromium's phone) by a finger drag at an ordinary speed and a quick flick ---- */
  SC.PU39 = async (p, W) => {
    if (DESK()) { rec(W, 'F39', 'F39', 'phone round — walked at the phone size'); return }
    const di = 3
    let iid = null
    if (WK()) {
      await hexSans(p, W)
      const f = await fileAsHex(p, W, ['amt'], 'AM', 'f39-file')
      iid = f.iid
      chk(W, 'F39.card', 'F39: his calendar entry reads "A · AM"', /\bA\b/.test(f.rows) && /AM/.test(f.rows), f.rows)
      await B.asS(p, W)
    }
    const box = await mkSim(p, W, di, 'amt', 'BOX', '13:00', '14:00')
    const BXW = sim(di, 'amt', box, 'w'), BXP = sim(di, 'amt', box, 'p')
    if (WK()) await step(W, 'F39.plant', async () => {
      const r = await reason(p, W, di, BXW, ID.Hex, 'f39')
      const h = r.r || {}
      chk(W, 'F39.reason', 'F39: the afternoon AMT BOX rear tapped to arm it — Hex struck, "A" with "AM" under it, reason "SANS — available AM only" whole at 402px (not cut, not past the edge)', h.struck && h.why === HALF('AM') && h.l === 'A' && h.h === 'AM' && !h.cut && !h.past, `${rsay(h)} · reason ${h.whyL}–${h.whyR} of ${r.s && r.s.vw}, ${h.whyLines} line(s)`, r.pic)
      const k = await pick(p, W, di, BXW, ID.Hex, 'f39')
      judgeLead(W, 'F39.note', 'F39: tapped on — the note "Hex — SANS — available AM only"', k, note('Hex', HALF('AM')))
      chk(W, 'F39.notebox', 'F39: the note on its first frame — whole text in view, not under the top bar', k.g && k.g.inScreen && k.g.whole && !k.g.underBar && k.g.op > 0, k.g ? geomSay(k.g) : 'no note', pics(k.first, k.crop))
      const l = await lines(p, W, di, 'Hex', 'f39')
      const m = l.sans.find(x => /AMT BOX/.test(x.text))
      chk(W, 'F39.list', 'F39: the warning list\'s long line, wrapped and whole — "Hex — SANS: available 00:00–12:00 only. Planned on AMT BOX 13:00–14:00"', m && m.text === LHRS('Hex', '00:00', '12:00', 'AMT BOX 13:00–14:00') && m.inScreen !== false, l.say + (m ? ` · ${m.wraps} · in screen ${m.inScreen} · button ${m.btnTop}` : ''), l.pic)
      if (m) {
        await hide(p, W, di, m.ix, 'f39-hide')
        const l2 = await lines(p, W, di, 'Hex', 'f39-hidden')
        chk(W, 'F39.hidden', 'F39: hidden by its ✕', l2.sans.some(x => x.hid), l2.say, l2.pic)
        await B.closeB(p, W)
        const d = await Y.dayList(p, W, '#eWeek', di)
        const hid = (d.lines || []).find(x => x.hid && /Hex/.test(x.text))
        if (hid && /data-woff/.test(hid.html || '')) {
          await Y.dayLineBtn(p, W, '#eWeek', di, hid.ix, 'f39-unhide')
          const d2 = await Y.readDay(p, '#eWeek', di)
          const back = (d2.lines || []).find(x => /Hex/.test(x.text) && /SANS/.test(x.text))
          chk(W, 'F39.unhide', 'F39: unhidden by its own ↺ button ("Flag this again") on Edit Schedule\'s list', back && !back.hid, Y.listSay(d2), await Y.clipOf(p, W, `#eWeek .day[data-day="${di}"] [data-dwbox="${di}"]`, 'f39-unhidden', 10))
        } else nw(W, 'F39.unhide', 'unhide', 'no button on the hidden line: ' + Y.listSay(d))
      }
      const kb = await plant(p, W, di, BXP, ID.Jester, 'f39-tap')
      judgeNote(W, 'F39.tap', 'F39: a blank man (Jester, a pilot) planted by tap on BOX front — "Jester — SANS — no availability filed for today"', kb, note('Jester', NFW))
    })
    if (PC()) {
      const e11 = await mkSim(p, W, di, 'oft', 'EP-11', '15:00', '16:00')
      const e12 = await mkSim(p, W, di, 'oft', 'EP-12', '15:00', '16:00')
      await step(W, 'F39.drag', async () => {
        /* final run 1 (final-pu39): Otter's finger drag aimed at EP-11's REAR seat landed in its FRONT seat (the row's whole
           place lit; "Illegal seat") — kept as a lead to check; the lesson-2 pair is walked on front seats with pilots */
        const k = await fingerIn(p, W, di, sim(di, 'oft', e11, 'p'), ID.Rebel, 'f39-ordinary', { hold: 500, steps: 14, gap: 25, centre: true })
        chk(W, 'F39.drag', 'F39 / lesson 2: Rebel (pilot, nothing filed) dragged by a finger at a person\'s ordinary speed onto EP-11 front — planted; the hint while held and the note "Rebel — SANS — no availability filed for today"', k.placed && k.hover && k.hover.why === NFW && (k.seen || []).includes(note('Rebel', NFW)), `hint ${J(k.hover)} · notes ${J(k.seen)} · first frame ${k.g ? geomSay(k.g) : '-'}`, pics(k.hpic, k.first))
        const q = await fingerIn(p, W, di, sim(di, 'oft', e12, 'p'), ID.Kraken, 'f39-flick', { hold: 200, steps: 4, gap: 12, rest: 60, centre: true })
        rec(W, 'F39.flick', 'F39 / lesson 2: Kraken moved by a quick flick (a short hold, four quick moves) onto EP-12 front — planted or not, and the note (RECORDED: what a flick does)', `planted ${q.placed} · hint ${J(q.hover)} · notes ${J(q.seen)} · holds ${J(q.holds)}`, pics(q.hpic, q.first))
        const o = await fingerIn(p, W, di, sim(di, 'oft', e11, 'w'), ID.Otter, 'f39-rear', { hold: 500, steps: 14, gap: 25, centre: true })
        rec(W, 'F39.rear', 'F39 (lead): Otter (WSO) dragged by a finger onto EP-11\'s REAR seat at its centre — where he lands (RECORDED)', `EP-11 rear ${J(await at(p, sim(di, 'oft', e11, 'w')))} · front ${J(await at(p, sim(di, 'oft', e11, 'p')))} · hint ${J(o.hover)} · notes ${J(o.seen)}`, pics(o.hpic, o.first))
      })
    }
  }
}
