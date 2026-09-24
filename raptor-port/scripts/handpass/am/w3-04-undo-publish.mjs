/* w3-04 — Undo / Redo across a publish, at desktop AND phone (the board's own Undo/Redo, and the top bar's).
     S16 — Publish day → Undo → Redo through the scheduler BOARD's buttons (the phone board on a phone):
           after Undo the day is a dashed DRAFT with blank sign-offs; after Redo it is ORIG, sign-offs still blank.
           Then Undo keeps walking back — every step recorded (what the bubble says, what the day shows).
     S16 money — Saturday: Unpublish → sign → Publish day → Undo → Redo, the Leave War cells read after each.
     S17 — the order the ONE timeline walks: edit A, sign, Publish AL1, edit B, then Undo × n (and the refusal
           "…published after that change…" if it ever appears); and the variant: Unpublish AL1 then Undo.
     Astra 7 — route A: Unpublish AL1 then Undo the unpublish; route B (a fresh world): Undo the AL1 publish
           itself. The two routes must agree: working changes re-open, the viewer moves back, and the same-label
           reissue is AL1 (never AL2).
   Usage: node w3-04-undo-publish.mjs [desktop|phone] */
process.env.HP_SHOTS = 'C:/Users/User/projects/Raptor/raptor-port/docs/img/handpass/2026-09-24-amendment/w3'
const L = await import('./w3-lib.mjs')
const { open, STATE, W, checker, watchToasts, toasts, editWeek, head, book, signDay, publishDay, publishAL, shot, viewDay, board,
  closeBoard, tapUnpub, unpublish, undoState, pressHist, lwRead, lwShot, navTo, editText, go } = L
const which = process.argv[2] ? [process.argv[2]] : ['desktop', 'phone']
const SAT_MEN = ['Saber', 'Piston', 'Reaper', 'Anvil']
const brief = h => h ? `${h.tag} | ${(h.pending || '-').replace(/\s+/g, ' ')} | ${h.signState} | pub=${h.beak ? h.beak.text : h.alpub ? h.alpub.text : '-'} | unpub=${h.unpub ? h.unpub.text : '-'}` : 'null'

for (const w of which) {
  const { check, note, summary } = checker('w3-04 ' + w)
  const P = s => `w3-04-${w}-${s}`
  /* ============ world 1: S16 on the board (Friday) ============ */
  {
    const { browser, page, errors } = await open({ ...W[w], state: STATE })
    await watchToasts(page)
    try {
      /* ---- S16: Friday, on the board ---- */
      await board(page, 4)
      await signDay(page, 4)
      const pb = await publishDay(page, 4)
      const h1 = await head(page, 4)
      note('S16 board publish', { pb, h: brief(h1), toasts: await toasts(page) })
      check('S16: Publish day on the board → ORIG', h1.tag === 'ORIG', h1.tag)
      await shot(page, P('a-board-fri-published'))
      const u1 = await pressHist(page, 'undo')
      const h2 = await head(page, 4)
      note('S16 board Undo', { u1, h: brief(h2) })
      check('S16/AM39: the board\'s Undo of "Publish day" puts Friday back to a DRAFT', u1.where === '#schedBoard #sbUndo' && h2.tag === 'DRAFT', `${u1.where} → ${h2.tag}`)
      check('S16/AM39c: after that Undo the sign-offs are blank (4 to sign)', /4 to sign/.test(h2.signState) && h2.signs.every(s => /name/.test(s) || !s), `${h2.signState} ${JSON.stringify(h2.signs)}`)
      check('AM39b: its bubble says "Undid: publishing a day"', (u1.toasts || []).some(t => /Undid: publishing a day/.test(t)), JSON.stringify(u1.toasts))
      await shot(page, P('b-board-fri-after-undo'))
      const r1 = await pressHist(page, 'redo')
      const h3 = await head(page, 4)
      note('S16 board Redo', { r1, h: brief(h3) })
      check('S16/AM39c: Redo lands Friday published (ORIG) with the sign-offs still blank', h3.tag === 'ORIG' && /4 to sign/.test(h3.signState), brief(h3))
      check('AM39b: its bubble says "Redid: publishing a day"', (r1.toasts || []).some(t => /Redid: publishing a day/.test(t)), JSON.stringify(r1.toasts))
      await shot(page, P('c-board-fri-after-redo'))
      /* keep walking back: every press recorded */
      const walk = []
      for (let i = 0; i < 7; i++) {
        const st = await undoState(page)
        const u = await pressHist(page, 'undo')
        const h = await head(page, 4)
        walk.push({ offered: st.undo && st.undo.title, said: (u.toasts || []).join(' / ') || u.why, day: brief(h) })
        if (!u.pressed) break
      }
      note('S16/S17 the board\'s Undo walked back step by step', walk)
      const resigned = walk.find(s => /Undid: a sign-off/.test(s.said) && !/4 to sign/.test(s.day))
      note('S16 (record): does undoing a sign-off after the publish was undone bring earlier signatures back?', resigned ? `YES — ${resigned.day}` : 'no — every step left the day with blank sign-offs')
      await shot(page, P('d-board-fri-walked-back'))
      await closeBoard(page)
    } catch (e) { check('world 1 ran to the end', false, String(e && e.stack || e).slice(0, 700)); await shot(page, P('zz-crash-1')).catch(() => {}) }
    check('world 1: no console errors', errors.length === 0, JSON.stringify(errors).slice(0, 400))
    await browser.close()
  }
  /* ============ world 2: S16 money on the board (Saturday) ============ */
  {
    const { browser, page, errors } = await open({ ...W[w], state: STATE })
    await watchToasts(page)
    try {
      const lw0 = await lwRead(page, SAT_MEN)
      await board(page, 5)
      /* the everything Saturday is ALREADY bid against in the saved world (a man credited there has spent past
         his balance), so Unpublish takes its two taps: the warning, then the confirm */
      const up = await unpublish(page, 5, { confirm: true })
      note('Sat unpublish on the board (two taps: warn, then confirm)', { up, toasts: await toasts(page), tag: (await head(page, 5)).tag })
      const lw1 = await lwRead(page, SAT_MEN)
      await lwShot(page, P('e1-lw-sat-after-unpublish'), 'Saber')
      await board(page, 5)
      await signDay(page, 5)
      const ps = await publishDay(page, 5)
      note('Sat republished', { ps, toasts: await toasts(page) })
      const lw2 = await lwRead(page, SAT_MEN)
      await board(page, 5)
      const u2 = await pressHist(page, 'undo')
      const hs = await head(page, 5)
      const lw3 = await lwRead(page, SAT_MEN)
      await lwShot(page, P('e2-lw-sat-after-undo-of-publish'), 'Saber')
      await board(page, 5)
      const r2 = await pressHist(page, 'redo')
      const hs2 = await head(page, 5)
      const lw4 = await lwRead(page, SAT_MEN)
      await lwShot(page, P('e3-lw-sat-after-redo'), 'Saber')
      note('S16 money', { start: lw0, afterUnpublish: lw1, afterPublish: lw2, afterUndo: lw3, afterRedo: lw4, undo: u2, undoDay: brief(hs), redo: r2, redoDay: brief(hs2) })
      const has = o => Object.values(o).every(v => /[FH]O/.test(v)), none = o => Object.values(o).every(v => !/[FH]O/.test(v))
      check('S16 money/AM46: Unpublish withdraws Saturday\'s credits', has(lw0) && none(lw1), `${JSON.stringify(lw0)} → ${JSON.stringify(lw1)}`)
      check('S16 money/AM46: Publish day brings them back', has(lw2), JSON.stringify(lw2))
      check('S16 money/AM39: Undo of that publish withdraws them again (and Saturday is a draft)', none(lw3) && hs.tag === 'DRAFT', `${JSON.stringify(lw3)} ${hs.tag}`)
      check('S16 money/AM39c: Redo publishes again and the credits are back', has(lw4) && hs2.tag === 'ORIG', `${JSON.stringify(lw4)} ${hs2.tag}`)
    } catch (e) { check('world 2 ran to the end', false, String(e && e.stack || e).slice(0, 700)); await shot(page, P('zz-crash-2')).catch(() => {}) }
    check('world 2: no console errors', errors.length === 0, JSON.stringify(errors).slice(0, 400))
    await browser.close()
  }
  /* ============ world 3: S17 in a clean world ============ */
  {
    const { browser, page, errors } = await open({ ...W[w], state: STATE })
    await watchToasts(page)
    try {
      /* ---- S17: the order the timeline walks (Tuesday, the edit week) ---- */
      await editWeek(page)
      const keys = await page.evaluate(() => [...document.querySelectorAll('#eWeek .day[data-day="1"] [data-txt]')].map(e => e.dataset.txt))
      const kA = keys.find(k => /^dn:1\./.test(k)), kB = keys.find(k => k !== kA && /^(ap|gr|pn|sn|gn|dtn):1\./.test(k)) || keys.find(k => k !== kA)
      note('S17 keys', { kA, kB })
      await editText(page, kA, 'S17 EDIT A')
      await signDay(page, 1)
      const pa = await publishAL(page, 1)
      note('S17 publish AL1', { pa, h: brief(await head(page, 1)), toasts: await toasts(page) })
      await editText(page, kB, 'S17 EDIT B')
      const order = []
      for (let i = 0; i < 9; i++) {
        const st = await undoState(page)
        const u = await pressHist(page, 'undo')
        const h = await head(page, 1)
        order.push({ offered: st.undo && st.undo.title, said: (u.toasts || []).join(' / ') || u.why, tue: brief(h) })
        if (!u.pressed) break
      }
      note('S17 the Undo order', order)
      check('S17/AM39: the 1st Undo reverses edit B', /Undid: a note on the schedule|Undid: a change/.test(order[0] && order[0].said || ''), JSON.stringify(order[0]))
      check('S17/AM39: the 2nd Undo reverses the AL1 publish itself (runs Unpublish: Tue back at ORIG)', /publishing an amendment/.test(order[1] && order[1].said || '') && /^ORIG/.test(order[1].tue), JSON.stringify(order[1]))
      const refused = order.find(s => /published after that change/.test(s.said))
      note('S17 (record): did the "published after that change" refusal ever appear in a plain Undo walk?', refused ? JSON.stringify(refused) : 'never — Undo always reverses the publish first (as an Unpublish), so it never has to reach behind it')
      await shot(page, P('f-s17-after-walk'))
      /* redo it all back, recording */
      const redo = []
      for (let i = 0; i < 9; i++) { const u = await pressHist(page, 'redo'); redo.push({ said: (u.toasts || []).join(' / ') || u.why, tue: brief(await head(page, 1)) }); if (!u.pressed) break }
      note('S17 the Redo order', redo)
      /* variant: Unpublish AL1, then Undo → the unpublish is reversed (not edit A) */
      const hv = await head(page, 1)
      note('S17 variant start', brief(hv))
      if (/^AL1/.test(hv.tag)) {
        await tapUnpub(page, 1)
        const hu = await head(page, 1)
        const uv = await pressHist(page, 'undo')
        const hv2 = await head(page, 1)
        note('S17 variant', { afterUnpublish: brief(hu), undo: uv, afterUndo: brief(hv2) })
        check('S17: Undo right after Unpublish reverses the Unpublish (AL1 back), not an older edit', /^AL1/.test(hv2.tag) && (uv.toasts || []).some(t => /taking a published day back/.test(t)), `${brief(hv2)} ${JSON.stringify(uv.toasts)}`)
      } else note('S17 variant', 'skipped — Tuesday did not end the redo walk at AL1: ' + brief(hv))
      note('book at the end of world 3', await book(page))
    } catch (e) { check('world 3 ran to the end', false, String(e && e.stack || e).slice(0, 700)); await shot(page, P('zz-crash-3')).catch(() => {}) }
    check('world 3: no console errors', errors.length === 0, JSON.stringify(errors).slice(0, 400))
    await browser.close()
  }

  /* ============ Astra 7: route A (Unpublish then Undo) and route B (Undo the publish) ============ */
  const route = async (label, how) => {
    const { browser, page, errors } = await open({ ...W[w], state: STATE })
    await watchToasts(page)
    const out = {}
    try {
      await editWeek(page)
      await editText(page, 'dn:1.0', 'ASTRA7 CHANGE')
      await signDay(page, 1)
      await publishAL(page, 1)
      out.published = brief(await head(page, 1))
      out.viewPublished = (await viewDay(page, 1)).picker[0]
      await editWeek(page)
      if (how === 'unpublish') { out.act = await tapUnpub(page, 1) } else { out.act = await pressHist(page, 'undo') }
      const h = await head(page, 1)
      out.after = brief(h)
      out.afterNote = await page.evaluate(() => { const e = document.querySelector('#eWeek [data-txt="dn:1.0"]'); return e ? (e.innerText || '').trim() : null })
      out.afterMark = await page.evaluate(() => { const e = document.querySelector('#eWeek [data-txt="dn:1.0"]'); return e ? { alp: e.getAttribute('data-alp'), aln: e.getAttribute('data-aln'), alc: e.getAttribute('data-alc') } : null })
      out.viewAfter = (await viewDay(page, 1)).picker[0]
      await shot(page, P(`g-astra7-${label}-after`))
      await editWeek(page)
      out.book = await book(page)
      if (how === 'unpublish') {
        out.undo = await pressHist(page, 'undo')
        out.afterUndo = brief(await head(page, 1))
        out.viewAfterUndo = (await viewDay(page, 1)).picker[0]
        await editWeek(page)
        out.redo = await pressHist(page, 'redo')
        out.afterRedo = brief(await head(page, 1))
      }
      await signDay(page, 1)
      const re = await publishAL(page, 1)
      out.reissue = { label: re.label, tag: (await head(page, 1)).tag }
      out.bookEnd = await book(page)
      out.viewEnd = (await viewDay(page, 1)).picker[0]
    } catch (e) { out.crash = String(e && e.stack || e).slice(0, 500) }
    out.errors = errors
    await browser.close()
    return out
  }
  const A = await route('A-unpublish', 'unpublish')
  const B = await route('B-undo', 'undo')
  note('Astra7 route A (Unpublish AL1, then Undo it)', A)
  note('Astra7 route B (Undo the AL1 publish)', B)
  check('Astra7: route A — Unpublish reopens the change (ORIG, 1 pending, Publish AL1, sign-offs cleared)', /^ORIG \| 1\s+pending \| 4 to sign \| pub=Publish AL1/.test(A.after || ''), A.after)
  check('Astra7: route A — the viewer moves back to "Original — as issued"', A.viewAfter === '*Original — as issued', A.viewAfter)
  check('Astra7: route A — Undo of the Unpublish restores AL1 (tag and viewer)', /^AL1/.test(A.afterUndo || '') && A.viewAfterUndo === '*AL1 — as issued', `${A.afterUndo} | ${A.viewAfterUndo}`)
  check('Astra7: route B — Undo of the publish lands in the SAME state as route A\'s Unpublish', B.after === A.after, `A: ${A.after} | B: ${B.after}`)
  check('Astra7: route B — the viewer moves back to "Original — as issued"', B.viewAfter === '*Original — as issued', B.viewAfter)
  check('Astra7: both routes re-open the change with the same mark (dotted, goes out as AL1)', JSON.stringify(A.afterMark) === JSON.stringify(B.afterMark) && A.afterMark && A.afterMark.alp === '1' && A.afterMark.aln === '1', `A ${JSON.stringify(A.afterMark)} | B ${JSON.stringify(B.afterMark)}`)
  check('Astra7/AM33: route A reissues under the SAME label (AL1, never AL2)', A.reissue && /AL1/.test(A.reissue.label) && A.reissue.tag === 'AL1', JSON.stringify(A.reissue))
  check('Astra7/AM33: route B reissues under the SAME label (AL1, never AL2)', B.reissue && /AL1/.test(B.reissue.label) && B.reissue.tag === 'AL1', JSON.stringify(B.reissue))
  note('Astra7 (record, register Q6 / Fable 5-10): the book after each route', { A: { retired: A.book && A.book.retired, correcting: A.book && A.book.correcting }, B: { retired: B.book && B.book.retired, correcting: B.book && B.book.correcting } })
  check('Astra7: no console errors in either route', !(A.errors || []).length && !(B.errors || []).length, JSON.stringify([A.errors, B.errors]).slice(0, 300))
  summary()
}
