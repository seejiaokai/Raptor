// S37 — the month bar, tip and day card tell the same story (phone 390x844; the filing member, then another signed in).
import { closeWins, world, closeAll, toInputs, fileInput, openDay, pic, T, sleep, readInputs, switchUser, setPerson, listAll, listSearch, listRow, observe } from './aa-A-lib.mjs'
const LONG = 'walkS37 a long remark about the exercise planning meeting, bring the maps and the signed forms for every crew member who is free'
for (const ph of ['allavail', 'all']) {
  const w = await world({ who: 'us', size: 'p' })
  const page = w.page
  await toInputs(page)
  await fileInput(page, { iso: '2026-07-18', type: 'Event', person: ph, remarks: LONG + ' ' + ph, start: '09:00', end: '12:00', oil: 'yes' })
  await closeWins(page)
  const rec = (await readInputs(page, 'walkS37'))[0]
  for (const who of ['us', 'ad']) {
    if (who === 'ad') { await closeWins(page); await switchUser(page, 'ad'); await toInputs(page) }
    const tag = `${ph}-${who}`
    // member's default view is "mine": the placeholder is nobody's
    const dflt = await page.evaluate(() => document.querySelector('#inFPerson')?.value).catch(() => null)
    await setPerson(page, 'all')
    await page.locator('#inpCal').scrollIntoViewIfNeeded()
    const bar = page.locator(`[data-testid="ib-bar-${rec.iid}"]`).first()
    console.log(tag, 'default filter', dflt, '| bar present:', await bar.count(), '| bar text:', await bar.innerText().catch(() => null), '| tip (title):', JSON.stringify(await bar.getAttribute('title').catch(() => null)), '| classes:', await bar.getAttribute('class').catch(() => null))
    await pic(page, `s37-${tag}-1-month`)
    // open the day
    await openDay(page, '2026-07-18')
    await sleep(300)
    const row = page.locator(`[data-testid="idy-row-${rec.iid}"]`)
    const card = {
      text: (await row.innerText().catch(() => '')).replace(/\s+/g, ' '),
      cls: await row.getAttribute('class').catch(() => null),
      puck: await row.locator('.puck.allavail, .puck').count().catch(() => 0),
      puckHtml: await row.locator('.puck').first().evaluate(e => e.className + ' :: ' + e.innerText).catch(() => null),
    }
    console.log(tag, 'DAY CARD:', JSON.stringify(card))
    await pic(page, `s37-${tag}-2-day`)
    // the tap on the card
    await row.locator('.sd-open').click().catch(() => {}); await sleep(700)
    const ed = await page.evaluate(() => { const p = document.querySelector('#inpEditPop'); return p ? { save: !!p.querySelector('#inpEditSave'), person: p.querySelector('#inpEditPerson')?.selectedOptions[0]?.textContent || p.querySelector('#inpEditPersonFixed')?.textContent, text: p.innerText.replace(/\s+/g, ' ').slice(0, 500) } : null })
    console.log(tag, 'CARD TAPPED -> editor:', JSON.stringify(ed))
    await pic(page, `s37-${tag}-3-editor`)
    await closeWins(page)
  }
  console.log(ph, 'errs', JSON.stringify(w.errs))
  await w.ctx.close()
}
await closeAll()
