// A8 + A9 — "To go out" on a published day: a shared input's change (A8), and a request taken off, changed, accepted again (A9).
import * as L from './isr-A-lib.mjs'
import * as P from './isr-A-pub.mjs'
const { say, check, note, notWalked, tid, press, shot } = L
const sleep = ms => new Promise(r => setTimeout(r, ms))
async function openInput(page, tap, iso, iid) {
  await L.toInputsCal(page, tap); await L.incalMonth(page, tap, +iso.slice(0, 4), +iso.slice(5, 7)); await L.openDay(page, iso)
  await press(page, tap, `[data-testid="idy-row-${iid}"] [data-testid="idy-open"]`); await tid(page, 'win-inputedit').waitFor(); await page.waitForTimeout(400)
}
async function retitle(page, tap, iso, iid, title) {
  await openInput(page, tap, iso, iid)
  await page.fill('#inpEditOwnTitle', title)
  await press(page, tap, '#inpEditSave'); await page.waitForTimeout(500)
  if (await tid(page, 'oilconf').count()) { await press(page, tap, '[data-testid="oil-yes"]'); await press(page, tap, '[data-testid="oilconf-save"]'); await page.waitForTimeout(400) }
  for (const x of ['win-inputedit-x', 'win-inputsday-x']) if (await tid(page, x).count()) await press(page, tap, `[data-testid="${x}"]`)
}
export async function a8() {
  const size = 'desktop'
  const { ctx, page, tap } = await L.session(size)
  try {
    const three = await L.freeMen(page, 3, [2])
    const iid = await L.fileOn(page, tap, '2026-07-15', { type: 'Event', people: three, from: '09:00', to: '10:00', title: 'Team session' })
    if (!iid) { notWalked('A8', 'the shared Event of three was not filed'); await ctx.close(); return }
    const pub = await P.pubDay(page, tap, 2)
    note('A8', `shared Event of ${three.length} filed (${iid}); publish: ${JSON.stringify(pub.r)}`)
    const f0 = await P.face(page, 2)
    if (!pub.r.pressed) { notWalked('A8', `Wednesday was not published: ${JSON.stringify(pub.r)}`); await ctx.close(); return }
    await retitle(page, tap, '2026-07-15', iid, 'Team review')
    const recs = await page.evaluate(id => window.INPUTS.filter(r => String(r.iid) === id).map(r => ({ title: r.title, people: (r.people || []).map(e => e.p) })), iid)
    const f1 = await P.face(page, 2)
    const out = await P.toGoOut(page, 2, ['A8', size, 'to-go-out'])
    say(`A8 face before ${JSON.stringify(f0)} after ${JSON.stringify(f1)}; record ${JSON.stringify(recs)}; To go out text: ${out.text.slice(0, 500)}`)
    const nChg = (out.text.match(/Team session\s*→\s*Team review|Team session → Team review/g) || []).length
    const head = (out.text.match(/(\d+) changes?/) || [])[0] || null
    check('A8', 'To go out lists the one shared change as ONE item (one "Team session → Team review" line, "1 change")', nChg === 1 && /\b1 change\b/.test(out.text), { shared: three.length, linesSayingTheChange: nChg, header: head, pendingChip: f1 && f1.pend })
    await page.evaluate(() => { const w = document.querySelector('.chgwin:not([hidden])'); if (w) { w.style.outline = '3px solid #ff3b6b'; w.style.outlineOffset = '2px' } })
    await shot(page, 'A8', size, 'to-go-out-marked')
  } catch (e) { say(`ERROR A8: ${e.message.split('\n')[0]}`); await shot(page, 'A8', size, 'error').catch(() => {}) }
  await ctx.close()
}
export async function a9() {
  const size = 'desktop'
  const { ctx, page, tap } = await L.session(size)
  try {
    const [who] = await L.freeMen(page, 1, [2])
    const iid = await L.fileOn(page, tap, '2026-07-15', { type: 'Event', people: [who], from: '09:00', to: '10:00', title: 'Sports day' })
    if (!iid) { notWalked('A9', 'the Event was not filed'); await ctx.close(); return }
    // take it off on the Scheduler Board (Personal Inputs), then publish the day
    await P.editWeek(page); await P.showDay(page, 2)
    await page.locator('#eWeek [data-sbday="2"]').first().evaluate(e => { e.scrollIntoView({ block: 'center', inline: 'center' }); e.click() })
    await page.locator('#schedBoard .sb-sec').first().waitFor({ state: 'attached' }); await sleep(500)
    if (await page.locator('#schedBoard [data-pitog]').count() && !(await page.locator(`#schedBoard [data-acc="x"][data-acck="${iid}"]`).count())) { await page.locator('#schedBoard [data-pitog]').first().click(); await sleep(500) }
    const x = page.locator(`#schedBoard [data-acc="x"][data-acck="${iid}"]`).first()
    const hadX = await x.count()
    if (!hadX) { notWalked('A9', 'no take-off button for the request on the board'); await shot(page, 'A9', size, 'no-takeoff'); await ctx.close(); return }
    await x.evaluate(e => e.scrollIntoView({ block: 'center' })); await x.click(); await sleep(900)
    await P.closeBoard(page)
    const pub = await P.pubDay(page, tap, 2)
    if (!pub.r.pressed) { notWalked('A9', `Wednesday was not published: ${JSON.stringify(pub.r)}`); await ctx.close(); return }
    const f0 = await P.face(page, 2)
    await retitle(page, tap, '2026-07-15', iid, 'Games afternoon')
    const f1 = await P.face(page, 2)
    // accept it again on the board
    await page.locator('#eWeek [data-sbday="2"]').first().evaluate(e => { e.scrollIntoView({ block: 'center', inline: 'center' }); e.click() })
    await page.locator('#schedBoard .sb-sec').first().waitFor({ state: 'attached' }); await sleep(500)
    if (await page.locator('#schedBoard [data-pitog]').count() && !(await page.locator(`#schedBoard [data-acc="g"][data-acck="${iid}"]`).count())) { await page.locator('#schedBoard [data-pitog]').first().click(); await sleep(500) }
    const g = page.locator(`#schedBoard [data-acc="g"][data-acck="${iid}"]`).first()
    if (!(await g.count())) { notWalked('A9', 'no accept button for the taken-off request'); await shot(page, 'A9', size, 'no-accept'); await ctx.close(); return }
    await g.evaluate(e => e.scrollIntoView({ block: 'center' })); await g.click(); await sleep(900)
    await P.closeBoard(page)
    const f2 = await P.face(page, 2)
    const out = await P.toGoOut(page, 2, ['A9', size, 'to-go-out'])
    say(`A9 published-while-off face ${JSON.stringify(f0)}; after retitle while off ${JSON.stringify(f1)}; after accept ${JSON.stringify(f2)}; To go out: ${out.text.slice(0, 500)}`)
    const asWords = /Sports day\s*→\s*Games afternoon/.test(out.text)
    check('A9', 'accepted again, To go out reads it as an ADDITION (no "Sports day → Games afternoon" change of words)', !asWords && /Games afternoon/.test(out.text), { text: out.text.slice(0, 300) })
    await page.evaluate(() => { const w = document.querySelector('.chgwin:not([hidden])'); if (w) { w.style.outline = '3px solid #ff3b6b'; w.style.outlineOffset = '2px' } })
    await shot(page, 'A9', size, 'to-go-out-marked')
  } catch (e) { say(`ERROR A9: ${e.message.split('\n')[0]}`); await shot(page, 'A9', size, 'error').catch(() => {}) }
  await ctx.close()
}
if (process.argv[1].endsWith('isr-A-a8.mjs')) { await a8(); await a9(); await L.finish('a8') }
