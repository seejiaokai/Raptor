/* F — [REQ-DOOR-WORDS] 3: a deleted request that had NO row on a published day is named in that day's pending list (and
   the changes window), never a bare "item". Made the way it happens: a meeting for Bane on Wed 15 → Thu 16 Jul — its row
   lands on ONE day, so the published Thursday carries only its filing; Thursday is signed and issued as the next AL with
   it; then the meeting is deleted where its row stands, and Thursday's "N pending" list is read.
   Usage: node sf-f-pendname.mjs [outdir-suffix] */
const OUT = 'f-pendname' + (process.argv[2] ? '-' + process.argv[2] : '')
process.env.HP_URL ||= 'http://localhost:4174'
process.env.HP_SHOTS ||= new URL(`../../../docs/img/handpass/2026-09-28-small-fixes/${OUT}`, import.meta.url).pathname.replace(/^\/(\w:)/, '$1')
const L = await import('./sf-lib.mjs')
const W4 = await import('../am/w4-lib.mjs')
const { open, go, editWeek, board, closeBoard, openInputs, signDay, publishAL, screen, check, note, summary, SF_STATE, DESK } = L
const THU = 3

const { browser, page, errors } = await open({ ...DESK, state: SF_STATE })
await W4.fileInput(page, { person: 'bane', type: 'Meeting', from: '2026-07-15', to: '2026-07-16', span: 'custom', start: '09:00', end: '10:00', remarks: 'SF-F2 MEETING' })
const iid = await page.evaluate(() => (window.INPUTS.find(x => /SF-F2 MEETING/.test(x.remarks || '')) || {}).iid)
await editWeek(page)
/* its row: landed by itself, or accepted on Wednesday the way a scheduler accepts it */
let where = await page.evaluate(iid => window.DAYS.map((d, di) => ((d.ground || []).some(g => String(g.src) === String(iid)) ? di : -1)).filter(x => x >= 0), iid)
if (!where.length) {
  const acc = page.locator(`#eWeek button[data-acc="g"][data-acck="${iid}"]:visible`).first()
  if (await acc.count()) { await acc.scrollIntoViewIfNeeded(); await acc.click(); await page.waitForTimeout(700) }
  where = await page.evaluate(iid => window.DAYS.map((d, di) => ((d.ground || []).some(g => String(g.src) === String(iid)) ? di : -1)).filter(x => x >= 0), iid)
}
const thuPub = await page.evaluate(d => window.dayApproved(d), THU)
note('the meeting', JSON.stringify({ iid, rowOn: where, thuPublished: thuPub }))
check('setup: its row stands on ONE day, not Thursday, and Thursday is published', where.length === 1 && where[0] !== THU && thuPub, JSON.stringify({ where, thuPub }))

/* Thursday issued with the meeting's filing */
await signDay(page, THU)
const pub = await publishAL(page, THU)
note('Thursday issued', JSON.stringify(pub))

/* deleted where its row stands */
await board(page, where[0]); await openInputs(page, where[0])
const line = page.locator(`#schedBoard [data-inpedit="${iid}"]:visible`).first()
if (await line.count()) { await line.evaluate(e => e.scrollIntoView({ block: 'center' })); await line.click(); await page.waitForTimeout(800) }
const del = page.locator('#inpEditDel:visible').first()
for (let i = 0; i < 2 && await del.count(); i++) { await del.click(); await page.waitForTimeout(700) }
if (await page.locator('#inpEditCancel:visible').count()) await page.locator('#inpEditCancel:visible').click()
const gone = await page.evaluate(iid => !window.INPUTS.some(x => x.iid === iid), iid)
check('setup: the meeting is deleted', gone, '')
await closeBoard(page)

/* Thursday's pending list */
await go(page, 'editsched'); await page.waitForTimeout(500)
const btn = page.locator(`#eWeek [data-pendlist="${THU}"]:visible`).first()
let lines = []
if (await btn.count()) {
  await btn.scrollIntoViewIfNeeded(); await btn.click(); await page.waitForTimeout(700)
  lines = await page.evaluate(() => [...document.querySelectorAll('.chgwin:not([hidden]) .win-body li, .chgwin:not([hidden]) .win-body [data-chgkey], .chgwin:not([hidden]) .win-body .cw-line, .chgwin:not([hidden]) .win-body .pl-item')]
    .filter(e => e.offsetWidth).map(e => e.textContent.replace(/\s+/g, ' ').trim()).filter(Boolean))
}
await screen(page, 'f3-thursday-pending-list')
note('F3 Thursday\'s pending list', JSON.stringify(lines))
const cs = await page.evaluate(() => window.PEOPLE.bane.cs)            // the demo's bane goes by his callsign
const named = lines.filter(t => t.includes(cs) && /Meeting/i.test(t))
check('F3a Thursday reads pending for the deleted meeting', lines.length > 0, JSON.stringify(lines))
check('F3b its line names whose and what — never a bare "item"', named.length > 0 && !lines.some(t => /\bitem\b/.test(t) && !t.includes(cs)), JSON.stringify(lines))

check('no console errors', errors.length === 0, errors.join(' | ').slice(0, 300))
await browser.close()
process.exitCode = summary('sf-f-pendname') ? 1 : 0
