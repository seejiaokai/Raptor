/* w2-01 — THE VIEW PAGE: a published day's issued face (R7), its "Working draft — not issued" peek (R8),
   an unpublished day's plans picker (R9) and a plan preview there (R15, Astra 29 + 37).
   Rules: AM5, AM19, AM22, AM24, AM30, AM31, AM51c; ui-contracts §Amendment marks (the view page keeps a
   NEUTRAL DASHED hint for a published day's pending edit, never the AL-coloured dotted mark).
   Usage: node w2-01-view.mjs [desktop|phone]   (default both) */
process.env.HP_SHOTS = 'C:/Users/User/projects/Raptor/raptor-port/docs/img/handpass/2026-09-24-amendment/w2'
const L = await import('./w2-lib.mjs')
const { open, editWeek, go, check, note, summary, installToasts, takeToasts, viewDay, viewPick, clip, h, bookDay, STATE, DESK, PHONE } = L
const which = process.argv[2] ? [process.argv[2]] : ['desktop', 'phone']

for (const w of which) {
  const W = w === 'phone' ? PHONE : DESK, P = w === 'phone' ? 'p' : 'd'
  console.log(`\n##### ${w} #####`)
  const { browser, page, errors } = await open({ ...W, state: STATE })
  await installToasts(page)

  /* a pending edit on Tue (Original, nothing pending) that the view page can hint at: the first flying
     line's AREA cell — one of the cell kinds the neutral hint is drawn on (.areacell) */
  await editWeek(page)
  const area = page.locator('#eWeek .day[data-day="1"] .areacell[data-area="1.0.0"]').first()
  await area.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' }))
  const areaWas = (await area.innerText()).trim()
  await area.click(); await page.keyboard.press('Control+A'); await page.keyboard.type('EAST', { delay: 15 })
  await area.evaluate(e => e.blur()); await page.waitForTimeout(700)
  const tueH = await h(page, 1)
  check(`${P}.setup Tue area edit goes pending`, /1\s*pending/.test(tueH.pending), `area "${areaWas}"→EAST · head ${tueH.tag} "${tueH.pending}"`)
  const editStyle = await page.evaluate(() => { const e = document.querySelector('#eWeek .day[data-day="1"] .areacell[data-area="1.0.0"]'); const s = getComputedStyle(e)
    return { alp: e.getAttribute('data-alp'), aln: e.getAttribute('data-aln'), style: s.outlineStyle, color: s.outlineColor } })
  check(`${P}.edit-week pending area cell is DOTTED in AL1 cyan (AM19)`, editStyle.style === 'dotted' && /59, 198, 232/.test(editStyle.color), JSON.stringify(editStyle))
  await clip(page, `${P}-01-editweek-tue-area-pending`, '#eWeek .day[data-day="1"] .areacell[data-area="1.0.0"]', { pad: 40 })

  /* ---- R7: Monday's issued face (AL1 issued, one pending time change on the working copy) ---- */
  await go(page, 'viewsched')
  let v = await viewDay(page, 0)
  console.log('R7 mon issued', JSON.stringify(v))
  check(`${P}.R7 Mon issued face is the frozen document (class issued)`, /\bissued\b/.test(v.cls), v.cls)
  check(`${P}.R7 Mon tag names the issued version AL1 (AM22)`, v.tag === 'AL1', v.tag)
  check(`${P}.R7 Mon picker = "AL1 — as issued" (default) + "Working draft — not issued" (AM5/AM31)`,
    v.picker && v.picker.attr === 'vwork' && v.picker.opts[0] === '*AL1 — as issued' && v.picker.opts[1] === 'Working draft — not issued', JSON.stringify(v.picker))
  check(`${P}.R7 Mon issued face shows no "Not yet signed" (AM24)`, !v.nys)
  check(`${P}.R7 Mon issued face shows no pending chip and no pending marks (AM5)`, !v.pend && v.alp === 0, `pend "${v.pend}" alp ${v.alp}`)
  check(`${P}.R7 Mon issued face keeps its issued AL1 mark (solid) on the note`, v.alc >= 1, `alc ${v.alc}`)
  check(`${P}.R7 Mon issued face has no write controls`, v.writers === 0, `writers ${v.writers}`)
  check(`${P}.R7 Mon issued face shows the issued take-off, NOT the unpublished 07:45 (AM5/AM6)`, v.to0 && v.to0 !== '07:45', `first line TO "${v.to0}"`)
  const issuedTo = v.to0
  await clip(page, `${P}-02-R7-view-mon-issued-head`, '#vWeek .day[data-day="0"] .day-head', { pad: 8, extraH: 150 })

  /* ---- R8: Monday's working-draft peek ---- */
  await viewPick(page, 0, 'working')
  v = await viewDay(page, 0)
  console.log('R8 mon working', JSON.stringify(v))
  check(`${P}.R8 Mon working peek wears the bar "Viewing Working draft — not issued · the issued schedule is AL1" (AM5)`,
    /Viewing Working draft — not issued · the issued schedule is AL1/.test(v.bar), v.bar)
  check(`${P}.R8 Mon working peek carries the amber "Working draft" stamp`, /Working draft\[work\]/.test(v.stamp), v.stamp)
  const stamp = await page.evaluate(() => { const b = document.querySelector('#vWeek .day[data-day="0"] .dbeak.work'); if (!b) return null; const s = getComputedStyle(b); return { border: s.borderStyle, bcolor: s.borderColor, color: s.color } })
  note(`${P}.R8 stamp style`, JSON.stringify(stamp))
  check(`${P}.R8 Mon working peek shows "Not yet signed" (AM24 — the working copy, not the issued face)`, v.nys)
  check(`${P}.R8 Mon working peek shows "1 pending" (AM23)`, /1\s*pending/.test(v.pend), v.pend)
  check(`${P}.R8 Mon working peek has no write controls`, v.writers === 0, `writers ${v.writers} (seats keep data-slot: ${v.slots})`)
  const inert = await L.seatInert(page, '#vWeek .day[data-day="0"]')
  check(`${P}.R8 a seat on the working peek is inert (tap arms nothing, right-click changes nothing)`, inert.ok, JSON.stringify(inert))
  check(`${P}.R8 Mon working peek shows the unpublished 07:45`, v.to0 === '07:45', `first line TO "${v.to0}" (issued "${issuedTo}")`)
  /* the pending TO time is a text cell: the view page draws NO text-level mark (ui-contracts) */
  const toMark = await page.evaluate(() => { const s = document.querySelector('#vWeek .day[data-day="0"]'); const e = [...s.querySelectorAll('[data-alp]')][0]; if (!e) return null
    const cs = getComputedStyle(e); return { tag: e.tagName, cls: String(e.className).slice(0, 30), text: e.innerText.slice(0, 12), aln: e.getAttribute('data-aln'), outline: cs.outlineStyle + ' ' + cs.outlineColor, deco: cs.textDecorationLine + ' ' + cs.textDecorationStyle + ' ' + cs.textDecorationColor } })
  note(`${P}.R8 Mon pending text cell on the view page`, JSON.stringify(toMark))
  check(`${P}.R8 Mon pending TEXT cell carries no AL-coloured mark on the view page`, !toMark || (toMark.outline.startsWith('none') && !/dotted/.test(toMark.deco)), JSON.stringify(toMark))
  await clip(page, `${P}-03-R8-view-mon-working-head`, '#vWeek .day[data-day="0"] .day-head', { pad: 8, extraH: 150 })
  await clip(page, `${P}-04-R8-view-mon-working-wave1`, '#vWeek .day[data-day="0"] .go', { pad: 4 })
  await viewPick(page, 0, 'issued')
  v = await viewDay(page, 0)
  check(`${P}.R8 back to "as issued" → frozen again`, /\bissued\b/.test(v.cls) && !v.nys && !v.pend, v.cls)

  /* ---- R8 on Tue: the neutral dashed hint on a pending CELL (the area cell edited above) ---- */
  v = await viewDay(page, 1)
  check(`${P}.R7 Tue issued face: no mark on the edited area cell, area still "${areaWas}"`, v.alp === 0, `alp ${v.alp}`)
  const tueArea = await page.evaluate(() => (document.querySelector('#vWeek .day[data-day="1"] .areacell') || {}).innerText)
  check(`${P}.R7 Tue issued face shows the ISSUED area value`, tueArea && tueArea.trim() === areaWas, `"${tueArea}" (issued "${areaWas}", working "EAST")`)
  await viewPick(page, 1, 'working')
  const hint = await page.evaluate(() => { const e = document.querySelector('#vWeek .day[data-day="1"] .areacell[data-alp]'); if (!e) return null; const s = getComputedStyle(e)
    return { text: e.innerText, aln: e.getAttribute('data-aln'), style: s.outlineStyle, color: s.outlineColor, width: s.outlineWidth } })
  console.log('R8 tue area hint', JSON.stringify(hint))
  check(`${P}.R8 Tue working peek: the pending area cell wears the NEUTRAL DASHED hint, not AL1 cyan dotted (ui-contracts §Amendment marks, AM19)`,
    hint && hint.style === 'dashed' && /242, 214, 153/.test(hint.color), JSON.stringify(hint))
  await clip(page, `${P}-05-R8-view-tue-working-area-hint`, '#vWeek .day[data-day="1"] .areacell[data-alp]', { pad: 40 })
  await clip(page, `${P}-06-R8-view-tue-working-head`, '#vWeek .day[data-day="1"] .day-head', { pad: 8, extraH: 120 })
  const vt = await viewDay(page, 1)
  check(`${P}.R8 Tue working peek: "Not yet signed" + "1 pending" + the amber stamp`, vt.nys && /1\s*pending/.test(vt.pend) && /\[work\]/.test(vt.stamp), JSON.stringify({ nys: vt.nys, pend: vt.pend, stamp: vt.stamp }))
  await viewPick(page, 1, 'issued')

  /* ---- R9: Wednesday — never published, Plan A / Plan B (B live, edited) ---- */
  v = await viewDay(page, 2)
  console.log('R9 wed', JSON.stringify(v))
  check(`${P}.R9 Wed (unpublished) offers the PLANS picker, not the issued/working one (AM31)`,
    v.picker && v.picker.attr === 'dver' && v.picker.opts.join('|') === 'Plan A|*Plan B ●', JSON.stringify(v.picker))
  check(`${P}.R9 Wed reads DRAFT (tag) and "Draft" (stamp) — never published clothes (AM22/AM30)`, v.tag === 'DRAFT' && /^Draft$/.test(v.stamp), `${v.tag} / ${v.stamp}`)
  await clip(page, `${P}-07-R9-view-wed-plans-picker`, '#vWeek .day[data-day="2"] .day-head', { pad: 8, extraH: 60 })
  /* R15 — look at Plan A (a 'd:' preview on the view page) */
  const opt = await page.evaluate(() => [...document.querySelector('#vWeek select[data-dver="2"]').options].find(o => o.value.startsWith('d:'))?.value)
  await viewPick(page, 2, opt)
  v = await viewDay(page, 2)
  console.log('R15 wed plan A', JSON.stringify(v))
  check(`${P}.R15 Wed Plan A preview says what it is: "👁 Viewing plan Plan A — read-only"`, /Viewing plan Plan A — read-only/.test(v.bar), v.bar)
  check(`${P}.R15 the view page offers NO "Switch to this plan" and no scheduler "Back" button (A4 — viewers look, never switch)`, v.barBtns.length === 0, JSON.stringify(v.barBtns))
  check(`${P}.R15/Astra29 a plan preview never looks published: tag DRAFT, stamp "Draft" (AM30)`, v.tag === 'DRAFT' && /^Draft$/.test(v.stamp), `${v.tag} / ${v.stamp}`)
  check(`${P}.R15/Astra37 a plan preview shows no warnings list and no flag rings (AM51c)`, !v.warnList && v.rings === 0, `warnList ${v.warnList} rings ${v.rings}`)
  check(`${P}.R15 the preview has no write controls`, v.writers === 0, `writers ${v.writers}`)
  const wedNote = await page.evaluate(() => document.querySelector('#vWeek .day[data-day="2"]').innerText.includes('WED PLAN B NOTE'))
  check(`${P}.R15 Plan A's content is shown (Plan B's note absent)`, !wedNote)
  await clip(page, `${P}-08-R15-view-wed-planA-preview`, '#vWeek .day[data-day="2"] .day-head', { pad: 8, extraH: 200 })
  /* compare with the live day — it IS validated, so its warnings show */
  await viewPick(page, 2, 'live')
  const vl = await viewDay(page, 2)
  note(`${P}.R15 the live Wed for comparison`, `warnList ${vl.warnList} rings ${vl.rings} bar "${vl.bar}"`)
  check(`${P}.R15 picking "Plan B ●" returns to the live day (no bar)`, !vl.bar && /Plan B ●/.test(vl.picker.opts.find(o => o.startsWith('*')) || ''), JSON.stringify(vl.picker))

  /* ---- Thu: published with plans — the plans are HIDDEN from viewers (AM31) ---- */
  v = await viewDay(page, 3)
  check(`${P}.R9 Thu (published, with plans) shows the issued/working picker, never the plans (AM31)`,
    v.picker && v.picker.attr === 'vwork' && v.picker.opts[0] === '*Original — as issued', JSON.stringify(v.picker))
  /* ---- Sun: Original after an unpublished AL1 — the view page is back on the Original ---- */
  v = await viewDay(page, 6)
  check(`${P}.R7 Sun (AL1 unpublished) reads "Original — as issued", tag ORIG`, v.picker && v.picker.opts[0] === '*Original — as issued' && v.tag === 'ORIG', `${v.tag} ${JSON.stringify(v.picker)}`)

  check(`${P}.no console errors`, errors.length === 0, errors.join(' | ').slice(0, 300))
  note(`${P}.toasts`, JSON.stringify(await takeToasts(page)))
  await browser.close()
}
process.exitCode = summary('w2-01-view') ? 1 : 0
