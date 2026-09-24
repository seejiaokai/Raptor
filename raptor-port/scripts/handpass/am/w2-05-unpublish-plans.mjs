/* w2-05 — UNPUBLISH A DAY THAT HAS PLANS (S12, S30) and PER-PLAN SIGN-OFFS (Astra 23).
   S12 asks one thing to RECORD, not judge: after Unpublish, do a STOWED plan's old sign-offs come back green?
   Rules: AM12 (each plan its own sign-offs), AM11 (content back → names back), AM32–AM34/AM37c (Unpublish:
   the version under comes back; the day's sign-offs cleared; Original → a plain draft), AM31 (the view page's
   plans picker returns for an unpublished day), AM8 (Publish day → the Original again).
   Usage: node w2-05-unpublish-plans.mjs [s12|s30|a23|all] */
process.env.HP_SHOTS = 'C:/Users/User/projects/Raptor/raptor-port/docs/img/handpass/2026-09-24-amendment/w2'
const L = await import('./w2-lib.mjs')
const { open, editWeek, go, check, note, summary, installToasts, takeToasts, h, bookDay, switchTo, altPlan, lookAt, viewDay, viewPick,
  clip, screen, signDay, editText, publishAL, publishDay, unpublish, marks, STATE, DESK, PHONE } = L
const part = process.argv[2] || 'all'
const signed = hd => hd.signs.filter(s => s && !/— name —/.test(s)).length
const noteMark = (page, di) => page.evaluate(i => { const e = document.querySelector(`#eWeek [data-txt="dn:${i}.0"]`); return e ? { text: e.innerText.trim(), alc: e.getAttribute('data-alc'), aln: e.getAttribute('data-aln'), alp: e.getAttribute('data-alp') } : null }, di)

/* ======================= S12 — Unpublish AL1 with plans (Tuesday) ============================ */
if (part === 'all' || part === 's12') for (const order of ['B-live', 'A-live']) {
  console.log(`\n##### S12 — Unpublish AL1 with ${order === 'B-live' ? 'Plan B live (Plan A STOWED)' : 'Plan A live (Fable\'s literal order)'} — desktop #####`)
  const P = process.argv[3] === 'phone' ? 'p' : 'd'
  const { browser, page, errors } = await open({ ...(P === 'p' ? PHONE : DESK), state: STATE })
  await installToasts(page); await editWeek(page)
  /* Tue: Original, nothing pending. Sign all four on the live day (the R2 note fires), then "+ Alt Plan" */
  await signDay(page, 1)
  let t = await takeToasts(page); let hd = await h(page, 1)
  check(`${P}.${order}.S12 signing a published day with nothing to publish: "All signed — no changes to publish right now" (AM15b)`, t.some(x => /All signed — no changes to publish right now/.test(x)) && !hd.alpub, `toast ${JSON.stringify(t)} state "${hd.signState}"`)
  await altPlan(page, 1); await takeToasts(page)
  hd = await h(page, 1)
  check(`${P}.${order}.S12 after "+ Alt Plan" the live Plan B carries the sign-offs (4 names)`, /Plan B/.test(hd.selector) && signed(hd) === 4, JSON.stringify({ sel: hd.selector.trim(), signs: hd.signs }))
  const origNote = (await noteMark(page, 1)).text
  /* on Plan B: change the note → sign-offs blank → sign B → Publish AL1 */
  await editText(page, 'dn:1.0', 'TUE AL1 NOTE (W2)')
  hd = await h(page, 1)
  check(`${P}.${order}.S12/AM11 the edit blanks Plan B's sign-offs`, signed(hd) === 0 && /1\s*pending/.test(hd.pending), JSON.stringify({ signs: hd.signs, pend: hd.pending }))
  await signDay(page, 1)
  const pub = await publishAL(page, 1)
  t = await takeToasts(page); hd = await h(page, 1)
  check(`${P}.${order}.S12 Publish AL1 from Plan B → tag AL1`, pub.pressed && hd.tag === 'AL1', `${JSON.stringify(pub)} tag ${hd.tag} toast ${JSON.stringify(t)}`)
  const nm = await noteMark(page, 1)
  check(`${P}.${order}.S12 the note now wears the SOLID AL1 mark`, nm && nm.alc === '1' && !nm.alp, JSON.stringify(nm))
  /* Action A: switch to Plan A — its diff vs AL1 is the note back */
  await switchTo(page, 1, /Plan A/)
  t = await takeToasts(page); hd = await h(page, 1)
  check(`${P}.${order}.S12-A switch to Plan A: "1 pending" (its note is the Original's), toast says the same`, /1\s*pending/.test(hd.pending) && t.some(x => /1 difference from AL1 pending/.test(x)), `${hd.pending} toast ${JSON.stringify(t)}`)
  note(`${P}.${order}.S12-A Plan A's sign-offs now (signed at base Original; the day is at AL1)`, `${signed(hd)} names · "${hd.signState}"`)
  check(`${P}.${order}.S12-A Plan A's old sign-offs do NOT read valid against AL1 (they signed the Original)`, signed(hd) === 0, JSON.stringify(hd.signs))
  if (order === 'B-live') { await switchTo(page, 1, /Plan B/); await takeToasts(page) }
  /* Action B: Unpublish AL1 */
  const before = await h(page, 1)
  const un = await unpublish(page, 1)
  t = await takeToasts(page); hd = await h(page, 1)
  console.log('S12 unpublish', JSON.stringify(un), JSON.stringify(t), JSON.stringify(hd))
  check(`${P}.${order}.S12-B Unpublish AL1 → tag back to ORIG (AM37c)`, un.pressed && hd.tag === 'ORIG', `${JSON.stringify(un)} tag ${hd.tag}`)
  check(`${P}.${order}.S12-B/AM34 the live plan's sign-offs are cleared by the unpublish`, signed(hd) === 0, JSON.stringify(hd.signs))
  let bk = await bookDay(page, 1)
  note(`${P}.${order}.S12-B the book after the unpublish`, JSON.stringify({ cur: bk.cur, pending: bk.pending, plans: bk.plans, retired: bk.retired.filter(r => r.startsWith('2026-07-14')), correcting: bk.correcting }))
  if (order === 'B-live') {
    const nm2 = await noteMark(page, 1)
    check(`${P}.B-live.S12-D Plan B's note (the AL1 change) is back to pending: DOTTED in AL1's colour, "1 pending", "Publish AL1" offered`, nm2 && nm2.alp === '1' && nm2.aln === '1' && /1\s*pending/.test(hd.pending) && hd.alpub && /Publish AL1/.test(hd.alpub.text), JSON.stringify({ nm2, pend: hd.pending, alpub: hd.alpub }))
    await clip(page, `${P}-60-S12-tue-planB-after-unpublish`, '#eWeek .day[data-day="1"] .day-head', { pad: 8, extraH: 250 })
    /* Action C: switch to the STOWED Plan A — does its old (Original-bound) signature come back green? RECORD */
    await switchTo(page, 1, /Plan A/)
    t = await takeToasts(page); hd = await h(page, 1)
    note(P + '.B-live.S12-C (Q4, record only) the STOWED Plan A after the unpublish', `${signed(hd)} names ${JSON.stringify(hd.signs)} · state "${hd.signState}" · pending "${hd.pending}" · toast ${JSON.stringify(t)}`)
    check(P + '.B-live.S12-C Plan A (= the Original) reads nothing pending', !hd.pending, hd.pending)
    await clip(page, `${P}-61-S12-tue-stowed-planA-after-unpublish`, '#eWeek .day[data-day="1"] .day-head', { pad: 8, extraH: 250 })
    /* Action D: back to B */
    await switchTo(page, 1, /Plan B/); await takeToasts(page)
    hd = await h(page, 1); const nm3 = await noteMark(page, 1)
    check(P + '.B-live.S12-D back on Plan B: the note dotted AL1, "1 pending", Publish AL1 locked until signed', nm3 && nm3.aln === '1' && /1\s*pending/.test(hd.pending) && hd.alpub && hd.alpub.disabled, JSON.stringify({ nm3, pend: hd.pending, alpub: hd.alpub }))
  } else {
    note(P + '.A-live.S12-C (record) the LIVE Plan A after the unpublish', `${signed(hd)} names · state "${hd.signState}" · pending "${hd.pending}"`)
    check(P + '.A-live.S12 Plan A (= the Original) reads nothing pending after the unpublish', !hd.pending, hd.pending)
    await switchTo(page, 1, /Plan B/); t = await takeToasts(page); hd = await h(page, 1)
    const nm3 = await noteMark(page, 1)
    check(P + '.A-live.S12-D Plan B vs the Original: the note dotted AL1, "1 pending"', nm3 && nm3.aln === '1' && /1\s*pending/.test(hd.pending), JSON.stringify({ nm3, pend: hd.pending, toast: t }))
    note(P + '.A-live.S12-D Plan B\'s sign-offs (spent at its publish)', `${signed(hd)} names · "${hd.signState}"`)
  }
  /* the view page: back on the Original */
  await go(page, 'viewsched')
  const v = await viewDay(page, 1)
  const hasAl1Note = await page.evaluate(() => document.querySelector('#vWeek .day[data-day="1"]').innerText.includes('TUE AL1 NOTE (W2)'))
  check(`${P}.${order}.S12 the view page reads "Original — as issued", tag ORIG, without the withdrawn AL1 note (AM35 — silent)`, v.picker && v.picker.opts[0] === '*Original — as issued' && v.tag === 'ORIG' && !hasAl1Note, JSON.stringify({ picker: v.picker, tag: v.tag, hasAl1Note }))
  check(`${P}.${order}.S12: no console errors`, errors.length === 0, errors.join(' | ').slice(0, 300))
  await browser.close()
}

/* ======================= S12 variant — the STOWED plan has its OWN signed edit (makes Q4 concrete) */
if (part === 'all' || part === 's12x') {
  console.log('##### S12 variant — stowed Plan A carries its own signed edit — desktop #####')
  const { browser, page, errors } = await open({ ...DESK, state: STATE })
  await installToasts(page); await editWeek(page)
  await altPlan(page, 1); await takeToasts(page)                    // Tue: A (stowed) + B (live), both = Original
  await switchTo(page, 1, /Plan A/); await takeToasts(page)
  await editText(page, 'dn:1.0', 'TUE PLAN A OWN EDIT')             // A: its own change over the Original
  await signDay(page, 1)
  let hd = await h(page, 1)
  check('d.S12x Plan A: its own edit, signed → "Publish AL1" unlocked on A', signed(hd) === 4 && hd.alpub && !hd.alpub.disabled, JSON.stringify({ signs: hd.signs, alpub: hd.alpub }))
  const aSigns = hd.signs.join('|')
  await switchTo(page, 1, /Plan B/); await takeToasts(page)
  await editText(page, 'dn:1.0', 'TUE PLAN B AL1'); await signDay(page, 1)
  const pub = await publishAL(page, 1); await takeToasts(page)
  hd = await h(page, 1)
  check('d.S12x Plan B published as AL1', pub.pressed && hd.tag === 'AL1', JSON.stringify({ pub, tag: hd.tag }))
  await switchTo(page, 1, /Plan A/); await takeToasts(page)
  hd = await h(page, 1)
  note("d.S12x while AL1 stands, Plan A's signatures (given against the Original)",`${signed(hd)} names · "${hd.signState}" · alpub ${JSON.stringify(hd.alpub)}`)
  await switchTo(page, 1, /Plan B/); await takeToasts(page)
  const un = await unpublish(page, 1); await takeToasts(page)
  hd = await h(page, 1)
  check('d.S12x Unpublish AL1 (Plan B live) → ORIG', un.pressed && hd.tag === 'ORIG', JSON.stringify({ un, tag: hd.tag }))
  await switchTo(page, 1, /Plan A/)
  const t = await takeToasts(page); hd = await h(page, 1)
  note('d.S12x (Q4, record only) the stowed Plan A after the unpublish — its pre-AL1 signatures', `${signed(hd)} names ${hd.signs.join('|')} (given: ${aSigns}) · state "${hd.signState}" · Publish button ${JSON.stringify(hd.alpub)} · toast ${JSON.stringify(t)}`)
  await clip(page, 'd-65-S12x-stowed-planA-signed-edit-after-unpublish', '#eWeek .day[data-day="1"] .day-head', { pad: 8, extraH: 250 })
  check('d.S12x: no console errors', errors.length === 0, errors.join(' | ').slice(0, 300))
  await browser.close()
}

/* ======================= S30 — Unpublish the Original of a day with plans (Thursday) ========== */
if (part === 'all' || part === 's30') for (const w of ['desktop', 'phone']) {
  const W = w === 'phone' ? PHONE : DESK, P = w === 'phone' ? 'p' : 'd'
  console.log(`\n##### S30 — ${w} #####`)
  const { browser, page, errors } = await open({ ...W, state: STATE })
  await installToasts(page)
  /* before: the view page shows the issued/working picker; plans hidden (AM31) */
  await go(page, 'viewsched')
  let v = await viewDay(page, 3)
  check(`${P}.S30 before: Thu (published) shows "Original — as issued", no plans picker (AM31)`, v.picker && v.picker.attr === 'vwork', JSON.stringify(v.picker))
  await editWeek(page)
  const un = await unpublish(page, 3)
  let t = await takeToasts(page); let hd = await h(page, 3)
  check(`${P}.S30 Unpublish the Original → DRAFT tag, "Publish day" (locked until signed), plans kept (selector "Plan A")`, un.pressed && hd.tag === 'DRAFT' && hd.beak && /Publish day/.test(hd.beak.text) && /Plan A/.test(hd.selector), JSON.stringify({ un, tag: hd.tag, beak: hd.beak, sel: hd.selector.trim(), toast: t }))
  const m = await L.menu(page, 3)
  check(`${P}.S30 the plans menu drops its "published" note and the issued rows`, !/This day is published/.test(m.text) && !m.items.some(i => i.does.startsWith('look:')), m.text.slice(0, 200))
  await L.menuClose(page)
  await clip(page, `${P}-62-S30-thu-unpublished-edit`, '#eWeek .day[data-day="3"] .day-head', { pad: 8, extraH: 120 })
  /* the view page: the plans picker is back for viewers */
  await go(page, 'viewsched')
  v = await viewDay(page, 3)
  check(`${P}.S30/AM31 the view page's PLANS picker returns for Thu ("Plan A ●", "Plan B"), DRAFT tag`, v.picker && v.picker.attr === 'dver' && v.picker.opts.join('|') === '*Plan A ●|Plan B' && v.tag === 'DRAFT', JSON.stringify({ picker: v.picker, tag: v.tag }))
  const optB = await page.evaluate(() => [...document.querySelector('#vWeek select[data-dver="3"]').options].find(o => o.value.startsWith('d:'))?.value)
  await viewPick(page, 3, optB)
  v = await viewDay(page, 3)
  const wet = await page.evaluate(() => document.querySelector('#vWeek .day[data-day="3"]').innerText.includes('THU PLAN B — WET WEATHER'))
  check(`${P}.S30/AM30 a viewer can look at Plan B (read-only, never published clothes)`, /Viewing plan Plan B — read-only/.test(v.bar) && v.tag === 'DRAFT' && wet && v.barBtns.length === 0, JSON.stringify({ bar: v.bar, tag: v.tag, wet, btns: v.barBtns }))
  await clip(page, `${P}-63-S30-view-thu-planB-after-unpublish`, '#vWeek .day[data-day="3"] .day-head', { pad: 8, extraH: 140 })
  /* a member sees the same picker (the admin's view-as-member flip; desktop badge / phone drawer) */
  if (w === 'desktop') { await page.locator('#roleBadge').click(); await page.waitForTimeout(800) }
  else { await page.locator('#burger').click(); await page.waitForTimeout(400); await page.locator('#drawerRole').click(); await page.waitForTimeout(800) }
  v = await viewDay(page, 3)
  const who = await page.evaluate(() => (document.querySelector('#roleBadge') || {}).innerText)
  check(`${P}.S30/AM31 as a MEMBER the plans picker is there too`, v.picker && v.picker.attr === 'dver' && v.picker.opts.length === 2, `${who} ${JSON.stringify(v.picker)}`)
  if (w === 'desktop') { await page.locator('#roleBadge').click(); await page.waitForTimeout(800) }
  else { await page.locator('#burger').click(); await page.waitForTimeout(400); await page.locator('#drawerRole').click(); await page.waitForTimeout(800) }
  /* republish: sign + Publish day → the ORIGINAL label again */
  await editWeek(page)
  await signDay(page, 3)
  const pb = await publishDay(page, 3)
  t = await takeToasts(page); hd = await h(page, 3)
  check(`${P}.S30/AM33 sign + "Publish day" → ORIG again (the same label, not AL1)`, pb.pressed && hd.tag === 'ORIG', JSON.stringify({ pb, tag: hd.tag, toast: t }))
  const bk = await bookDay(page, 3)
  note(`${P}.S30 the book after the republish`, JSON.stringify({ cur: bk.cur, plans: bk.plans, retired: bk.retired.filter(r => r.startsWith('2026-07-16')), correcting: bk.correcting }))
  await go(page, 'viewsched')
  v = await viewDay(page, 3)
  check(`${P}.S30 the view page is back to "Original — as issued" (plans hidden again)`, v.picker && v.picker.attr === 'vwork' && v.picker.opts[0] === '*Original — as issued', JSON.stringify(v.picker))
  check(`${P}.S30: no console errors`, errors.length === 0, errors.join(' | ').slice(0, 300))
  await browser.close()
}

/* ======================= Astra 23 — per-plan sign-offs, back and forth ======================== */
if (part === 'all' || part === 'a23') {
  console.log('\n##### Astra 23 (Wed, never published) — desktop #####')
  const { browser, page, errors } = await open({ ...DESK, state: STATE })
  await installToasts(page); await editWeek(page)
  await signDay(page, 2, 0)
  let hd = await h(page, 2); const sB = hd.signs.join('|')
  check('d.A23 Plan B signed (pick 0) → "Signed — this day can be published", Publish day unlocked', signed(hd) === 4 && /Signed — this day can be published/.test(hd.signState) && hd.beak && !hd.beak.disabled, JSON.stringify({ signs: hd.signs, st: hd.signState }))
  await switchTo(page, 2, /Plan A/); await takeToasts(page)
  hd = await h(page, 2)
  check('d.A23 switch to Plan A: its own EMPTY sign-offs, Publish day locked (AM12)', signed(hd) === 0 && hd.beak && hd.beak.disabled, JSON.stringify({ signs: hd.signs, beak: hd.beak }))
  await signDay(page, 2, 1)
  hd = await h(page, 2); const sA = hd.signs.join('|')
  check('d.A23 Plan A signed with different names (pick 1)', signed(hd) === 4 && sA !== sB, `A ${sA} · B ${sB}`)
  for (const [re, want, lbl] of [[/Plan B/, sB, 'B'], [/Plan A/, sA, 'A'], [/Plan B/, sB, 'B'], [/Plan A/, sA, 'A']]) {
    await switchTo(page, 2, re); await takeToasts(page)
    hd = await h(page, 2)
    check(`d.A23 back on Plan ${lbl}: its own four names, green`, hd.signs.join('|') === want && /Signed — this day can be published/.test(hd.signState), hd.signs.join('|'))
  }
  /* an edit on A blanks A only; putting it back restores A's names (AM11) */
  const was = (await noteMark(page, 2)).text
  await editText(page, 'dn:2.0', 'A23 TEMP EDIT')
  hd = await h(page, 2)
  check('d.A23 an edit on Plan A blanks Plan A\'s sign-offs (AM11)', signed(hd) === 0, JSON.stringify(hd.signs))
  await editText(page, 'dn:2.0', was)
  hd = await h(page, 2)
  check('d.A23/AM11 putting the note back restores Plan A\'s names', hd.signs.join('|') === sA, hd.signs.join('|'))
  await switchTo(page, 2, /Plan B/); await takeToasts(page)
  hd = await h(page, 2)
  check('d.A23 Plan B untouched by all of it', hd.signs.join('|') === sB, hd.signs.join('|'))
  await clip(page, 'd-64-A23-wed-planB-own-signoffs', '#eWeek .day[data-day="2"] .day-head', { pad: 8, extraH: 150 })
  check('d.A23: no console errors', errors.length === 0, errors.join(' | ').slice(0, 300))
  await browser.close()
}
process.exitCode = summary('w2-05-unpublish-plans') ? 1 : 0
