/* w3-01 — S13 steps 1–2 (Fable) + Astra rank 14 (reload and week-change halves), at desktop AND phone.
   Starts from the everything week and builds the HIGH-INFORMATION state through the app's own controls:
     Mon  AL1 + one pending change (fixture) + PARTIAL sign-offs (CUR CK, SKED CK only)
     Tue  Unpublished (its Original pulled back, one tap — Astra 32) and corrected (a note), not republished
     Wed  Plan A / Plan B (fixture)       Thu  Original + contingency Plan B (fixture) — and a PREVIEW of its Original
     Sat  a Leave War OIL bid spends a Saturday credit → Unpublish tapped ONCE → armed "Withdraw — confirm"
     view page: Monday's "Working draft — not issued" chosen
   Then: RELOAD (durable things survive; previews, arms, the working choice, the Edit history and Undo clear),
   Tuesday republished under the SAME label, then WEEK CHANGE and back (the same split), and an Undo pressed on
   the OTHER week (it must take you to the change — AM39b). Usage: node w3-01-reload-week.mjs [desktop|phone] */
process.env.HP_SHOTS = 'C:/Users/User/projects/Raptor/raptor-port/docs/img/handpass/2026-09-24-amendment/w3'
const L = await import('./w3-lib.mjs')
const { open, STATE, W, checker, watchToasts, toasts, reload, editWeek, head, book, signDay, publishDay, editText, shot, go,
  viewDay, pickView, dayInfo, menuPick, menuLook, unpubBtn, tapUnpub, signRole, lwBid, lwRead, changeWeek, weekNow, histList,
  undoState, pressHist, closePops, cellText } = L
const which = process.argv[2] ? [process.argv[2]] : ['desktop', 'phone']

for (const w of which) {
  const { check, note, summary } = checker('w3-01 ' + w)
  const { browser, page, errors } = await open({ ...W[w], state: STATE })
  await watchToasts(page)
  const P = s => `w3-01-${w}-${s}`
  const dayShot = async (s, di, root = '#eWeek') => {
    const d = page.locator(`${root} .day[data-day="${di}"]`).first()
    await d.evaluate(e => { e.scrollIntoView({ block: 'start', inline: 'start' }); window.scrollBy(0, -(window.innerWidth < 820 ? 64 : 150)) }); await page.waitForTimeout(350)
    await shot(page, P(s))
  }
  try {
    /* ---------------- SETUP: the high-information state ---------------- */
    await editWeek(page)
    const s1 = await signRole(page, 0, 'cur', 0), s2 = await signRole(page, 0, 'sked', 0)
    const h0 = await head(page, 0)
    note('setup Mon signed 2 of 4', { cur: s1, sked: s2, head: h0 })
    check('setup: Mon partial sign-off reads 2 to sign (AM10/AM15)', /2 to sign/.test(h0.signState), h0.signState)

    const u1 = await tapUnpub(page, 1)
    const h1 = await head(page, 1)
    note('setup Tue unpublish (one tap)', { u1, h1 })
    check('Astra32: Tue Unpublish with no OIL clash is ONE tap', u1.tapped && h1.tag === 'DRAFT' && !!h1.beak, `tag=${h1.tag} beak=${h1.beak && h1.beak.text}`)
    const tueKey = await page.evaluate(() => [...document.querySelectorAll('#eWeek .day[data-day="1"] [data-txt]')].map(e => e.dataset.txt).find(k => /^dn:1\./.test(k)) || null)
    note('Tue note key', tueKey)
    if (tueKey) await editText(page, tueKey, 'TUE CORRECTED NOTE')
    const h1b = await head(page, 1)
    note('Tue after correction', h1b)
    check('setup: Tue correction shows as pending on the draft (AM37c: Original retracted → a plain draft)', /1\s+pending/.test(h1b.pending) && h1b.tag === 'DRAFT', `${h1b.tag} ${h1b.pending}`)

    const pv = await menuLook(page, 3, /^Original/)
    const h3 = await head(page, 3)
    note('setup Thu preview', { menu: pv.rows, h3sel: h3.selector })
    check('setup: Thu previews its issued Original (the selector reads 👁)', /👁/.test(h3.selector), h3.selector.replace(/\s+/g, ' '))
    await dayShot('a-thu-preview', 3)

    const bid = await lwBid(page, 'Saber', '2026-07-21', 'OIL')
    note('setup Leave War bid (Saber OIL Tue 21 Jul)', bid)
    await editWeek(page)
    const a5 = await tapUnpub(page, 5)
    note('setup Sat Unpublish tap 1', a5)
    check('AM37: Sat Unpublish with a bid against arms and warns ("Withdraw — confirm")', a5.after && /Withdraw — confirm/.test(a5.after.text) && a5.toasts.some(t => /Heads up/.test(t)), JSON.stringify(a5.after) + ' ' + JSON.stringify(a5.toasts))
    await dayShot('b-sat-armed', 5)

    await go(page, 'viewsched')
    await pickView(page, 0, 'working')
    const v0 = await viewDay(page, 0)
    note('setup view Mon working', v0)
    check('setup: view page Mon on "Working draft — not issued" is labelled (AM5)', /Working draft/.test(v0.bar) && v0.picker.some(o => o === '*Working draft — not issued'), v0.bar)
    await dayShot('c-view-mon-working', 0, '#vWeek')

    /* a page change with the arm up: record whether it survives (the formal Astra 33 check is w3-02) */
    await editWeek(page)
    note('Sat button after a page change (view → edit)', await unpubBtn(page, 5))
    const u0 = await undoState(page)
    note('undo before reload', u0)
    const hl0 = await histList(page, P('d-history-before-reload'))
    note('Edit history before reload', { count: hl0.count, rows: (hl0.rows || []).slice(0, 12), foot: hl0.foot })
    const bk0 = await book(page)
    note('book before reload', bk0)

    /* ---------------- RELOAD ---------------- */
    await reload(page, 'a')
    note('landed after reload', await page.evaluate(() => window.CURPAGE))
    const rv0 = await viewDay(page, 0)
    note('view Mon after reload', rv0)
    check('Astra14/S13: reload clears the viewer\'s Working choice (Mon back on "AL1 — as issued")', rv0.picker[0] === '*AL1 — as issued' && !/Working/.test(rv0.bar), rv0.picker.join(' / '))
    await dayShot('e-view-mon-after-reload', 0, '#vWeek')
    await editWeek(page)
    const r0 = await head(page, 0), r1 = await head(page, 1), r2 = await head(page, 2), r3 = await head(page, 3), r5 = await head(page, 5)
    note('heads after reload', { r0, r1, r2, r3, r5 })
    check('S13/Astra14: reload keeps Mon at AL1 with its pending change (durable)', r0.tag === 'AL1' && /1\s+pending/.test(r0.pending), `${r0.tag} ${r0.pending}`)
    check('Astra14: reload keeps Mon\'s PARTIAL sign-offs (2 to sign, two names)', /2 to sign/.test(r0.signState) && r0.signs.filter(s => s && !/name/.test(s)).length === 2, `${r0.signState} ${JSON.stringify(r0.signs)}`)
    const tueTxt = tueKey ? await cellText(page, '#eWeek', tueKey) : null
    check('S13: reload keeps Tue as a DRAFT with its correction', r1.tag === 'DRAFT' && tueTxt === 'TUE CORRECTED NOTE', `${r1.tag} note="${tueTxt}"`)
    const bk1 = await book(page)
    check('S13: reload keeps Tue "correcting" its Original (the same-label flag persists)', !!(bk1.correcting && bk1.correcting['1']), JSON.stringify(bk1.correcting))
    check('Astra14: reload keeps the plans (Wed on Plan B, Thu on Plan A)', /Plan B/.test(r2.selector) && /Plan A/.test(r3.selector), `${r2.selector.replace(/\s+/g, ' ')} | ${r3.selector.replace(/\s+/g, ' ')}`)
    check('S13/Astra14: reload clears Thu\'s preview', !/👁/.test(r3.selector), r3.selector.replace(/\s+/g, ' '))
    check('S13/Astra14/Astra33: reload clears Sat\'s armed Unpublish', r5.unpub && r5.unpub.text === 'Unpublish', JSON.stringify(r5.unpub))
    const u1r = await undoState(page)
    note('undo after reload', u1r)
    check('S13: reload empties Undo (the timeline is this sitting only — AM49/undo-contract)', u1r.undo && u1r.undo.disabled, JSON.stringify(u1r.undo))
    const hl1 = await histList(page, P('f-history-after-reload'))
    note('Edit history after reload', { empty: hl1.empty, count: hl1.count, foot: hl1.foot })
    check('AM49: reload clears the Edit history (this sitting only)', /No changes yet/.test(hl1.empty || ''), hl1.empty || hl1.count)
    check('R12 wording: the Edit history footnote tells the truth about the schedule on reload', !/the schedule does the same/i.test(hl1.foot || ''),
      `footnote says "${hl1.foot}" — but Monday's AL1 + pending change, its sign-offs and Tuesday's correction all survived this reload`)
    const lw = await lwRead(page, ['Saber'], '2026-07-21')
    check('Astra14: reload keeps the Leave War bid (Saber OIL on 21 Jul)', lw.Saber === 'OIL', JSON.stringify(lw))

    /* Tuesday republished after the reload → the SAME label (Original), no AL */
    await editWeek(page)
    await signDay(page, 1)
    const pd = await publishDay(page, 1)
    const r1b = await head(page, 1)
    note('Tue republish', { pd, r1b, toasts: await toasts(page) })
    check('S13/AM33: Tue republished after a reload reissues the SAME label (ORIG, not AL1)', r1b.tag === 'ORIG', r1b.tag)
    const di1 = await dayInfo(page, 1, P('g-tue-dayinfo-after-reissue'))
    note('Tue ⓘ after reissue', di1)
    check('S13/AM35: Tue ⓘ lists no amendment after the quiet correction', /No amendment has touched this day yet/.test(di1), di1.slice(0, 160))
    const bk2 = await book(page)
    note('book correcting after reissue', bk2.correcting)
    check('AM33: the reissue closes Tue\'s correction', !(bk2.correcting && bk2.correcting['1']), JSON.stringify(bk2.correcting))
    const tv = await viewDay(page, 1)
    check('S13: the view page shows Tue "Original — as issued" after the reissue', tv.picker[0] === '*Original — as issued', tv.picker.join(' / '))
    await dayShot('h-view-tue-reissued', 1, '#vWeek')

    /* ---------------- WEEK CHANGE and back ---------------- */
    await pickView(page, 0, 'working')
    await editWeek(page)
    await menuLook(page, 3, /^Original/)
    const a5b = await tapUnpub(page, 5)
    note('re-armed before the week change', { thu: (await head(page, 3)).selector, sat: a5b.after })
    const via = await changeWeek(page, '2026-07-20')
    const wk1 = await weekNow(page)
    note('changed week', { via, wk1 })
    check('S13: the week changes (to Jul 20)', wk1 === 'Jul 20', wk1)
    await shot(page, P('i-next-week'))
    await changeWeek(page, '2026-07-13')
    const wk2 = await weekNow(page)
    check('S13: and comes back (Jul 13)', wk2 === 'Jul 13', wk2)
    const b0 = await head(page, 0), b1 = await head(page, 1), b3 = await head(page, 3), b5 = await head(page, 5)
    note('heads after the week round trip', { b0, b1, b3, b5 })
    check('S13/Astra14: the week round trip keeps Mon (AL1, 1 pending, 2 to sign) and Tue (ORIG)', b0.tag === 'AL1' && /1\s+pending/.test(b0.pending) && /2 to sign/.test(b0.signState) && b1.tag === 'ORIG', `${b0.tag} ${b0.pending} ${b0.signState} | Tue ${b1.tag}`)
    check('S13/Astra14: the week round trip clears Thu\'s preview', !/👁/.test(b3.selector), b3.selector.replace(/\s+/g, ' '))
    check('S13/Astra14/Astra33: the week round trip clears Sat\'s armed Unpublish', b5.unpub && b5.unpub.text === 'Unpublish', JSON.stringify(b5.unpub))
    const vb = await viewDay(page, 0)
    check('Astra14/Astra26: the week round trip clears the viewer\'s Working choice', vb.picker[0] === '*AL1 — as issued', vb.picker.join(' / '))
    await editWeek(page)
    const u2 = await undoState(page)
    note('undo after the week round trip', u2)
    check('S13: Undo still has the session\'s entries after a week change (labelled with the last one)', u2.undo && !u2.undo.disabled && /publishing a day/.test(u2.undo.title || ''), JSON.stringify(u2.undo))

    /* Undo pressed on the OTHER week — the one Undo takes you to where the change was (AM39b) */
    await changeWeek(page, '2026-07-20')
    const un = await pressHist(page, 'undo')
    const wk3 = await weekNow(page)
    const c1 = await head(page, 1)
    note('undo from next week', { un, wk3, c1 })
    check('AM39b: Undo pressed on another week brings you back to the week of the change', wk3 === 'Jul 13', wk3)
    check('AM39/AM32: that Undo of "Publish day" runs Unpublish (Tue back to DRAFT)', c1.tag === 'DRAFT', c1.tag)
    check('AM39b: the Undo says what it did in a bubble', (un.toasts || []).some(t => /Undid: publishing a day/.test(t)), JSON.stringify(un.toasts))
    await dayShot('j-undo-snapped-tue', 1)
    const re = await pressHist(page, 'redo')
    const c1r = await head(page, 1)
    note('redo', { re, c1r })
    check('AM39c: Redo lands Tue published again (ORIG)', c1r.tag === 'ORIG', c1r.tag)
    check('AM39c: after the Redo the sign-offs stay cleared (4 to sign)', /4 to sign/.test(c1r.signState), c1r.signState)
    check('AM39b: the Redo says what it did', (re.toasts || []).some(t => /Redid: publishing a day/.test(t)), JSON.stringify(re.toasts))
    note('book at the end', await book(page))
  } catch (e) { check('script ran to the end', false, String(e && e.stack || e).slice(0, 600)); await shot(page, P('zz-crash')).catch(() => {}) }
  check('no console errors during the walk', errors.length === 0, JSON.stringify(errors).slice(0, 400))
  summary()
  await browser.close()
}
