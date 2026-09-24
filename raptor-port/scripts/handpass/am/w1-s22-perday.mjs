/* w1 · S22 (Fable) + Astra rank 16 — per-day numbering and per-day isolation, on a FRESH demo world
   (a new browser context, nothing reloaded). Publish Monday and Tuesday as their Originals; change both;
   sign both; publish ONLY Monday's AL1 → Tuesday must be untouched (its mark, count, sign-offs, version)
   and still offer "Publish AL1" — its own AL1, not AL2 (AM1 the day is the unit; AM2/AM3 each day numbers
   on its own). Then publish Tuesday's AL1; each day's ⓘ lists only its own AL1; a preview of Tuesday's AL1
   shows Tuesday's content.
   Usage: node w1-s22-perday.mjs [desktop|phone] */
process.env.HP_SHOTS = 'C:/Users/User/projects/Raptor/raptor-port/docs/img/handpass/2026-09-24-amendment/w1'
const L = await import('./w1-lib.mjs')
const { open, editWeek, signDay, publishDay, publishAL, editText, planMenuItems, planMenuLook, WIDTHS, widthArg, checker, toastSpy, toasts,
  dayInfo, closeDayInfo, panel, headLine, headN, markSummary, shotUnion } = L
const note = (page, di) => page.evaluate(i => [...document.querySelectorAll(`#eWeek .day[data-day="${i}"] [data-txt]`)].map(e => e.dataset.txt).find(k => k.startsWith(`dn:${i}.`)), di)

for (const w of widthArg()) {
  const C = checker('S22 ' + w)
  const { browser, page, errors } = await open({ ...WIDTHS[w] })
  await toastSpy(page)
  await editWeek(page)
  for (const di of [0, 1]) { await signDay(page, di); const p = await publishDay(page, di); C.log(`publish day ${di}`, { ...p, toasts: await toasts(page) }) }
  const nMon = await note(page, 0), nTue = await note(page, 1)
  await editText(page, nMon, 'MON — AL1 CHANGE')
  await editText(page, nTue, 'TUE — AL1 CHANGE')
  const m0 = await headN(page, 0), t0 = await headN(page, 1)
  C.check('S22.a', m0.alpub?.text === 'Publish AL1' && t0.alpub?.text === 'Publish AL1', 'both days offer their own "Publish AL1" — AM1/AM2', { mon: m0.alpub, tue: t0.alpub })
  await signDay(page, 0); await signDay(page, 1)
  const tBefore = await headN(page, 1), tMarksBefore = await markSummary(page, '#eWeek .day[data-day="1"]')
  if (w === 'desktop') C.log('panel before', await panel(page))
  const p = await publishAL(page, 0)
  const tp = await toasts(page)
  C.log('publish Monday AL1', { ...p, toasts: tp })
  C.check('S22.b', tp.some(t => /^Published AL1 · 1 item on Mon only · approved by \w+ · 1 day with changes still held$/.test(t)), 'the toast: "Published AL1 · 1 item on Mon only · approved by … · 1 day with changes still held" — AM1/AM9', tp)
  const mA = await headN(page, 0), tA = await headN(page, 1), tMarksA = await markSummary(page, '#eWeek .day[data-day="1"]')
  C.log('after Monday AL1', { mon: await headLine(page, 0), tue: await headLine(page, 1) })
  C.check('S22.c', mA.tag === 'AL1' && !mA.pending, 'Monday is at AL1, nothing pending', mA)
  C.check('S22.d', tA.tag === 'ORIG' && tA.pending === '1 pending' && tA.alpub?.text === 'Publish AL1' && !tA.alpub.disabled, 'Tuesday is untouched: still ORIG, "1 pending", its own "Publish AL1" (not AL2), still unlocked — AM1/AM2 (Astra 16)', tA)
  C.check('S22.e', JSON.stringify(tA.signs) === JSON.stringify(tBefore.signs) && JSON.stringify(tMarksA) === JSON.stringify(tMarksBefore), 'Tuesday\'s sign-offs and marks did not move — AM1 (Astra 16)', { before: [tBefore.signs, tMarksBefore], after: [tA.signs, tMarksA] })
  await shotUnion(page, `s22-${w}-1-tue-after-mon-al1`, ['#eWeek .day[data-day="1"] .day-head', '#eWeek .day[data-day="1"] .signoff'])
  if (w === 'desktop') { const P = await panel(page); C.log('panel after Monday AL1', P)
    C.check('S22.f', P.days.length === 1 && /^Tue · 1 change$/.test(P.days[0].text) && P.days[0].btn === 'Publish AL1' && P.tags.some(t => /^AL1 Mon/.test(t)), 'the panel: Tuesday still waiting with "Publish AL1"; the issued list shows AL1 Mon — AM25', P) }
  const p2 = await publishAL(page, 1)
  C.log('publish Tuesday AL1', { ...p2, toasts: await toasts(page) })
  const tB = await headN(page, 1)
  C.check('S22.g', tB.tag === 'AL1', 'Tuesday publishes as ITS OWN AL1 — AM2/AM3', tB.tag)
  const iM = await dayInfo(page, 0); await closeDayInfo(page)
  const iT = await dayInfo(page, 1); await closeDayInfo(page)
  C.check('S22.h', iM.als.length === 1 && iT.als.length === 1, 'each day\'s ⓘ lists only its own AL1 — AM3', { mon: iM.als, tue: iT.als })
  if (w === 'desktop') { const P = await panel(page); C.check('S22.i', P.tags.some(t => /^AL1 Mon/.test(t)) && P.tags.some(t => /^AL1 Tue/.test(t)), 'the panel lists AL1 Mon and AL1 Tue as two records — AM3', P.tags)
    await shotUnion(page, `s22-${w}-2-panel-two-al1`, ['#alPanel']) }
  // a preview of Tuesday's AL1 shows Tuesday's content
  const menu = await planMenuItems(page, 1)
  C.log('Tue menu', menu.map(x => x.text + '→' + x.does))
  await planMenuLook(page, /^AL1/)
  const pv = await page.evaluate(() => { const d = document.querySelector('#eWeek .day[data-day="1"]'); return { bar: ((d.querySelector('.dprev-bar') || {}).innerText || '').replace(/\s+/g, ' '), body: d.innerText.includes('TUE — AL1 CHANGE'), mon: d.innerText.includes('MON — AL1 CHANGE') } })
  C.check('S22.j', /issued AL1/.test(pv.bar) && pv.body && !pv.mon, 'looking at Tuesday\'s AL1 shows Tuesday\'s content, not Monday\'s — AM3 (Astra 17)', pv)
  await shotUnion(page, `s22-${w}-3-tue-al1-preview`, ['#eWeek .day[data-day="1"] .day-head', '#eWeek .day[data-day="1"] .dprev-bar'])
  const back = page.locator('#eWeek [data-golive="1"]:visible').first(); if (await back.count()) { await back.click(); await page.waitForTimeout(500) }
  C.check('S22.z', !errors.length, 'no console errors', errors)
  C.summary()
  await browser.close()
}
