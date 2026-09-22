/* H3 — schedule work AND the man's own request on the same day: one credit or
        two, and which reason it carries          (Fable S43, Codex 19)
   H5 — an earned day and a hand-given award on the same date in the Leave War
                                                   (Codex 23)
   Clean Sunday (day 6). Ranger is the man. */
import { open, board, tap, type, shot, oilMode, publish, go } from './lib.mjs'
import { modeRead, names, putSure, fileRequest, money, tracker, closeTracker, closeSheets, leaveWar, publishAL, SUN } from './ef.mjs'

const STATE = 'C:/Users/User/AppData/Local/Temp/claude/C--Users-User-projects-Raptor/f98d5224-18e3-4e42-8a4f-bd4fe1b84782/scratchpad/hp/state-sat.json'
const di = 6, WHO = 'bane'
const R = {}
const { browser, page, errors } = await open({ state: STATE })
const { writeFileSync } = await import('node:fs')
const OUT = 'C:/Users/User/projects/Raptor/raptor-port/docs/img/handpass/ef-h.json'
const save = t => { R._at = t; writeFileSync(OUT, JSON.stringify(R, null, 1)) }

/** Everything the Leave War shows about one man on one date, read off the
    screens a scheduler uses: the cell, the sheet the cell opens, the records
    in it and what each record offers to do. */
async function dayRead(tag) {
  await leaveWar(page)
  await closeSheets(page)
  const cell = page.locator(`[data-testid="cell-${WHO}-${SUN}"]`).first()
  const cellText = await cell.innerText().catch(() => 'NO CELL')
  await cell.scrollIntoViewIfNeeded()
  await cell.click()
  await page.waitForTimeout(900)
  const sheet = await page.evaluate(() => {
    const s = document.querySelector('[role="dialog"].bidsheet')
    if (!s) return { open: false }
    const recs = [...s.querySelectorAll('[data-testid^="dl-"], .daylist-oil, [data-testid^="oil-detail-"]')]
      .map(e => ({ id: e.getAttribute('data-testid'), text: (e.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 240) }))
    return {
      open: true,
      testid: s.getAttribute('data-testid'),
      text: (s.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 1400),
      buttons: [...s.querySelectorAll('button')].map(b => (b.innerText || b.getAttribute('aria-label') || '').replace(/\s+/g, ' ').trim()).filter(Boolean),
      recs,
    }
  })
  await shot(page, `EF-H-${tag}-day`)
  return { cellText, sheet }
}

await board(page, di)

/* ---------------- H3: two sources of evidence, one day ------------------ */
await tap(page, `[data-gradd="${di}"]`)
await type(page, `[data-bfld="gr:${di}.0.prog"]`, 'MORNING BRIEF')
await type(page, `[data-bfld="gr:${di}.0.str"]`, '09:00')
await type(page, `[data-bfld="gr:${di}.0.end"]`, '11:00')
R.g = await putSure(page, `[data-fill="g:${di}.0.+"]`, WHO, id => JSON.stringify(window.DAYS[6].ground[0]).includes('"' + id + '"'))
R.req = await fileRequest(page, di, { door: 'g', person: WHO, type: 'Duty', st: '15:00', en: '17:00', allday: false, oil: 'yes' })
R.rows = await page.evaluate(() => window.DAYS[6].ground.map(g => `${g.prog}|${g.str}-${g.end}|${g.who}${g.oil ? '|oil=' + g.oil : ''}`))
save('built')

await oilMode(page, true)
R.mode = (await modeRead(page)).people.filter(p => p.id === WHO).map(p => `${p.text} :: ${p.title} :: ${p.key}`)
await shot(page, 'EF-H-01-two-sources-mode')
await oilMode(page, false)
R.bars = await page.evaluate(() => [...document.querySelectorAll('#schedBoard .puck[data-person="bane"]')]
  .filter(e => !e.closest('#sbRoster'))
  .map(e => (e.className.match(/oilbar-(fo|ho)/)?.[1] || 'NO BAR') + ' :: ' + (e.getAttribute('title') || '') + ' :: ' +
    ((e.closest('.sb-row,.sb-arow,tr,li') || {}).innerText || '').replace(/\s+/g, ' ').trim().slice(0, 40)))
R.publishOrig = await publish(page, di)
await page.waitForTimeout(800)
await shot(page, 'EF-H-02-published')
R.afterPublish = await dayRead('03-h3')
R.tracker1 = await tracker(page, [WHO])
await shot(page, 'EF-H-04-tracker')
await closeTracker(page)
save('h3')

/* ---------------- H5: a hand-given award beside the earned day ---------- */
await leaveWar(page)
await closeSheets(page)
const cell = page.locator(`[data-testid="cell-${WHO}-${SUN}"]`).first()
await cell.scrollIntoViewIfNeeded(); await cell.click(); await page.waitForTimeout(900)
const oilBtn = page.locator('[role="dialog"].bidsheet [data-testid="bid-oil"]:visible').first()
R.awardDoor = await oilBtn.count() ? (await oilBtn.innerText()).trim() : 'NO +OIL DOOR ON THIS DAY'
if (await oilBtn.count()) {
  await oilBtn.click(); await page.waitForTimeout(1000)
  R.awardForm = await page.evaluate(() => {
    const s = document.querySelector('[role="dialog"].bidsheet')
    return s ? { testids: [...s.querySelectorAll('[data-testid]')].map(e => e.getAttribute('data-testid')),
      text: (s.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 700) } : 'NO SHEET'
  })
  await shot(page, 'EF-H-05-award-form')
  const why = page.locator('[role="dialog"].bidsheet [data-testid="oil-why"]:visible').first()
  if (await why.count()) {
    await why.fill('Stood in at short notice')
    await page.locator('[role="dialog"].bidsheet [data-testid="oil-given-by"]:visible').first().fill('SQNCDR')
    const days = page.locator('[role="dialog"].bidsheet [data-testid="oil-days"]:visible').first()
    if (await days.count()) await days.fill('0.5')
    await shot(page, 'EF-H-05b-award-filled')
    const give = page.locator('[role="dialog"].bidsheet [data-testid="oil-give"]:visible').first()
    R.giveLabel = await give.count() ? (await give.innerText()).trim() : 'NO GIVE BUTTON'
    if (await give.count()) { await give.click(); await page.waitForTimeout(1300) }
    R.awardSaved = true
  } else R.awardSaved = 'NO REASON BOX IN THE AWARD FORM'
}
save('award-attempt')
await closeSheets(page)
R.bothRecords = await dayRead('06-both-records')
R.tracker2 = await tracker(page, [WHO])
await shot(page, 'EF-H-07-tracker-both')
await closeTracker(page)
save('h5-award')

/* what can be done to each record */
await leaveWar(page); await closeSheets(page)
await page.locator(`[data-testid="cell-${WHO}-${SUN}"]`).first().click(); await page.waitForTimeout(900)
R.recordActions = await page.evaluate(() => {
  const s = document.querySelector('[role="dialog"].bidsheet')
  if (!s) return 'NO SHEET'
  return [...s.querySelectorAll('li, .dl-line, .daylist-oil')].map(e => ({
    text: (e.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 200),
    buttons: [...e.querySelectorAll('button')].map(b => (b.innerText || '').trim()).filter(Boolean),
  })).filter(r => r.text)
})
await shot(page, 'EF-H-08-record-actions')
await closeSheets(page)
save('actions')

/* clear ONLY the award */
await page.locator(`[data-testid="cell-${WHO}-${SUN}"]`).first().click(); await page.waitForTimeout(900)
R.clearButtons = await page.evaluate(() => [...document.querySelectorAll('[role="dialog"].bidsheet [data-testid^="dl-clear-"]')].map(b => b.getAttribute('data-testid')))
const clr = page.locator('[role="dialog"].bidsheet [data-testid^="dl-clear-"]').first()
if (await clr.count()) { await clr.click(); await page.waitForTimeout(1000) }
await closeSheets(page)
R.afterClear = await dayRead('09-after-clear')
R.tracker3 = await tracker(page, [WHO])
await closeTracker(page)
save('cleared')

/* ---------------- deny the schedule row and publish the change ---------- */
await board(page, di)
await oilMode(page, true)
const denied = await page.evaluate(() => {
  const el = [...document.querySelectorAll('#schedBoard [data-oilp]')].find(e => {
    const row = e.closest('.sb-arow,.sb-row,tr,li')
    if (!row || !/MORNING BRIEF/i.test(row.innerText || '')) return false
    const pk = e.matches('[data-person]') ? e : e.querySelector('[data-person]')
    return pk && pk.dataset.person === 'bane'
  })
  if (!el) return null
  el.scrollIntoView({ block: 'center' }); el.click(); return true
})
R.deniedBrief = denied
await page.waitForTimeout(800)
R.afterDenyMode = (await modeRead(page)).people.filter(p => p.id === WHO).map(p => `${p.text} :: ${p.title}`)
await shot(page, 'EF-H-10-brief-denied-mode')
await oilMode(page, false)
R.publishAL = await publishAL(page, di)
await page.waitForTimeout(900)
await shot(page, 'EF-H-11-al1')
R.afterDeny = await dayRead('12-after-deny')
R.tracker4 = await tracker(page, [WHO])
await shot(page, 'EF-H-13-tracker-after-deny')
await closeTracker(page)
/* C23's last question: can the AUTOMATIC credit be cleared from the war? */
await leaveWar(page); await closeSheets(page)
await page.locator(`[data-testid="cell-${WHO}-${SUN}"]`).first().click(); await page.waitForTimeout(900)
R.autoSheetButtons = await page.evaluate(() => {
  const s = document.querySelector('[role="dialog"].bidsheet')
  return s ? [...s.querySelectorAll('button')].map(b => (b.getAttribute('data-testid') || '') + '=' + (b.innerText || '').replace(/\s+/g, ' ').trim()).filter(x => x !== '=') : 'NO SHEET'
})
const bc = page.locator('[role="dialog"].bidsheet [data-testid="bid-clear"]:visible').first()
R.pressedClear = await bc.count() ? true : 'NO CLEAR BUTTON'
if (await bc.count()) { await bc.click(); await page.waitForTimeout(1200) }
await closeSheets(page)
R.afterAutoClear = await dayRead('14-after-clearing-the-auto-credit')
R.tracker5 = await tracker(page, [WHO])
await shot(page, 'EF-H-15-tracker-after-auto-clear')
await closeTracker(page)
await board(page, di)
R.boardAfterAutoClear = await page.evaluate(() => [...document.querySelectorAll('#schedBoard .puck[data-person="bane"]')]
  .filter(e => !e.closest('#sbRoster'))
  .map(e => (e.className.match(/oilbar-(fo|ho)/)?.[1] || 'NO BAR') + ' :: ' + (e.getAttribute('title') || '')))
await shot(page, 'EF-H-16-board-after-auto-clear')
R.errors = errors.slice(0, 10)
save('done')

console.log('ground row:', R.g, '| request:', JSON.stringify(R.req))
console.log('rows now:', JSON.stringify(R.rows))
console.log('\n-- the mode on both of his events:'); R.mode.forEach(s => console.log('   ' + s))
console.log('-- his bars outside the mode:'); R.bars.forEach(s => console.log('   ' + s))
console.log('-- publish:', JSON.stringify(R.publishOrig))
console.log('\n== H3: his Leave War day after publishing ==')
console.log('  cell: ' + R.afterPublish.cellText)
console.log('  sheet(' + R.afterPublish.sheet.testid + '): ' + R.afterPublish.sheet.text)
console.log('  records:', JSON.stringify(R.afterPublish.sheet.recs, null, 1))
console.log('  tracker:', JSON.stringify(R.tracker1))
console.log('\n== H5: the hand-given award ==')
console.log('  award door:', R.awardDoor, '| saved:', R.awardSaved)
console.log('  award form:', JSON.stringify(R.awardForm))
console.log('  cell now: ' + R.bothRecords.cellText)
console.log('  sheet: ' + R.bothRecords.sheet.text)
console.log('  records:', JSON.stringify(R.bothRecords.sheet.recs, null, 1))
console.log('  tracker:', JSON.stringify(R.tracker2))
console.log('\n  what each record offers:', JSON.stringify(R.recordActions, null, 1))
console.log('\n  clear buttons found:', JSON.stringify(R.clearButtons))
console.log('  after clearing the award — cell: ' + R.afterClear.cellText)
console.log('  sheet: ' + R.afterClear.sheet.text)
console.log('  tracker:', JSON.stringify(R.tracker3))
console.log('\n== denying the schedule row ==')
console.log('  denied:', R.deniedBrief, '| mode now:', JSON.stringify(R.afterDenyMode))
console.log('  publish AL:', JSON.stringify(R.publishAL))
console.log('  cell: ' + R.afterDeny.cellText)
console.log('  sheet: ' + R.afterDeny.sheet.text)
console.log('  tracker:', JSON.stringify(R.tracker4))
console.log('\nerrors', R.errors)
await browser.close()
