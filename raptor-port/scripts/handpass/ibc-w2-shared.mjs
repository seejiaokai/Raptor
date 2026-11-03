// W2: S15 — the LATE drop on a shared input (Event for three men filed by member us) and on a leave held by two men (filed by ad).
import { L, face, editWeek, showDay, closeBoard, sleep, signIn } from './ibc-w2-lib.mjs'
const { check, note, shot } = L
console.log('ibc-w2-shared v1')
async function openBoard(page, di) { await closeBoard(page); await L.go(page, 'editsched'); await page.locator(`#eWeek [data-sbday="${di}"]:visible`).first().click(); await page.waitForSelector('#schedBoard'); await sleep(700) }
const chips = page => page.evaluate(() => [...document.querySelectorAll('#schedBoard .latechip')].filter(e => e.getBoundingClientRect().height > 0).map(e => ({ id: e.getAttribute('data-lateoff'), off: e.classList.contains('off'), row: (e.closest('[class*=sb]') || e.parentElement).textContent.replace(/\s+/g, ' ').trim().slice(0, 70) })))
const lateOffOf = (page, id) => page.evaluate(id => { const r = window.INPUTS.find(x => String(x.iid) === String(id)); return r ? !!r.lateOff : 'gone' }, id)
const tagsOn = (page, s, di) => page.evaluate(([s, i]) => { const d = document.querySelector(`${s} .day[data-day="${i}"]`); return d ? [...d.querySelectorAll('.latetag')].filter(e => e.getBoundingClientRect().height > 0).map(e => (e.closest('tr, .row, [class*=row]') || e.parentElement).textContent.replace(/\s+/g, ' ').trim().slice(0, 60)) : null }, [s, di])
const weekTags = async (page, pg, di) => { await closeBoard(page); await L.go(page, pg); const s = pg === 'editsched' ? '#eWeek' : '#vWeek'; await showDay(page, di, s); return tagsOn(page, s, di) }

async function shared(TYPE, TITLE, tag) {
  const { page, tap } = await L.session('desktop', 'us')
  const men = await L.freeMen(page, 3, [3])
  note(tag, `three free men for Thu 16 Jul: ${JSON.stringify(men)}`)
  const iid = await L.fileOn(page, tap, '2026-07-16', { type: TYPE, people: men, title: TITLE, remarks: 'W2 shared event' })
  note(tag, `Event filed by member: iid ${iid}; record ${JSON.stringify(iid && await page.evaluate(i => { const r = window.INPUTS.find(x => String(x.iid) === String(i)); return r && { type: r.type, people: r.people && r.people.map(p => p.p), title: r.title } }, iid))}`)
  if (!iid) L.notWalked(tag, 'premise: the Event was not filed (no new input id)')
  else {
    await signIn(page, 'ad')
    const t0 = await weekTags(page, 'viewsched', 3)
    note(tag, `LATE tags on View-only Thu before: ${JSON.stringify(t0)}`)
    await openBoard(page, 3)
    const c0 = await chips(page)
    note(tag, `board chips Thu: ${JSON.stringify(c0)}`)
    const mine = c0.filter(c => c.id === iid)
    check(tag, 'premise: the shared Event shows exactly one LATE chip (one row for a shared input, D661)', mine.length === 1, mine)
    if (!mine.length) { await shot(page, tag, 'desktop', 'board-no-chip'); note(tag, 'board elements mentioning late: ' + JSON.stringify(await page.evaluate(() => [...document.querySelectorAll('#schedBoard *')].filter(e => /late/i.test(String(e.className)) || e.hasAttribute('data-lateoff')).slice(0, 12).map(e => e.tagName + '.' + e.className + '|' + (e.closest('[class*=sb]')||e.parentElement).textContent.replace(/s+/g,' ').trim().slice(0,70))))) }
    if (mine.length) {
      await shot(page, tag, 'desktop', 'board-before')
      await page.locator(`#schedBoard .latechip[data-lateoff="${iid}"]`).first().click(); await sleep(600)
      await shot(page, tag, 'desktop', 'board-after-drop')
      check(tag, 'EXPECTED drop saved for the whole input', (await lateOffOf(page, iid)) === true, await lateOffOf(page, iid))
      const t1 = await weekTags(page, 'viewsched', 3)
      check(tag, 'EXPECTED all faces: LATE gone on View-only (tags before vs after)', t1.length === t0.length - 1, { before: t0, after: t1 })
      const e1 = await weekTags(page, 'editsched', 3)
      note(tag, `Edit Schedule LATE tags Thu after: ${JSON.stringify(e1)}`)
      await shot(page, tag, 'desktop', 'view-after-drop')
      /* member re-edits the input */
      await signIn(page, 'us')
      await L.toInputsCal(page, tap); await L.incalMonth(page, tap, 2026, 7); await L.openDay(page, '2026-07-16')
      await page.locator(`[data-testid="idy-row-${iid}"] .icard-open`).first().click(); await page.locator('#inpEditPop #inpEditRmk').waitFor()
      await page.fill('#inpEditPop #inpEditRmk', 'W2 shared event edited'); await L.press(page, tap, '#inpEditSave'); await sleep(600)
      if (await L.tid(page, 'oilconf').count()) { await L.press(page, tap, (await L.tid(page, 'oil-all').count()) ? '[data-testid="oil-all"]' : '[data-testid="oil-yes"]'); await L.press(page, tap, '[data-testid="oilconf-save"]'); await sleep(400) }
      note(tag, `after member re-edit: lateOff ${JSON.stringify(await lateOffOf(page, iid))}; record ${JSON.stringify(await L.rec(page, iid))}`)
      await shot(page, tag, 'desktop', 'member-edited')
      if (await L.tid(page, 'win-inputsday-x').count()) await page.locator('[data-testid="win-inputsday-x"]').click().catch(() => {})
      await signIn(page, 'ad')
      const t2 = await weekTags(page, 'viewsched', 3)
      note(tag, `RECORD View-only Thu LATE tags after the member's re-edit: ${JSON.stringify(t2)} (count ${t2.length}; before the drop ${t0.length})`)
    }
  }
  await page.context().close()
}
await shared('Event', 'Games afternoon', 'S15-Event')
await shared('Appointment', '', 'S15-Appt')
/* a leave held by two men: admin files OL for two men on Fri 17 Jul */
{
  const { page, tap } = await L.session('desktop', 'ad')
  const men = await L.freeMen(page, 2, [4])
  const iid = await L.fileOn(page, tap, '2026-07-17', { type: 'OL', people: men, remarks: 'W2 two-man leave' })
  note('S15u', `two-man OL: iid ${iid} men ${JSON.stringify(men)}`)
  if (!iid) L.notWalked('S15u', 'premise: the OL was not filed')
  else {
    await openBoard(page, 4)
    const c0 = await chips(page)
    note('S15u', `board chips Fri: ${JSON.stringify(c0)}`)
    const mine = c0.filter(c => c.id === iid)
    if (mine.length < 2) note('S15u', `chips for this input: ${mine.length} (RECORD: shows on ${mine.length} of 2 rows; late? — ${JSON.stringify(await page.evaluate(i => { const r = window.INPUTS.find(x => String(x.iid) === String(i)); return r && { at: r.at, date: r.date } }, iid))})`)
    if (mine.length) {
      await shot(page, 'S15u', 'desktop', 'before')
      await page.locator(`#schedBoard .latechip[data-lateoff="${iid}"]`).first().click(); await sleep(600)
      const c1 = await chips(page)
      note('S15u', `RECORD chips after dropping on the FIRST row: ${JSON.stringify(c1.filter(c => c.id === iid))}`)
      await shot(page, 'S15u', 'desktop', 'after')
    }
  }
  await page.context().close()
}
await L.finish('shared')
