// I8 (Undo takes the notice), I9 (read survives), I10 (more than thirty). One world.
import * as L from './or-I-lib.mjs'
const { page, browser } = await L.start()
const ID = {}
for (const cs of ['Ranger', 'Saber', 'Tally', 'Hex']) ID[cs] = await L.csId(page, cs)
const results = {}
let cur = 'Saber'
const as = async (cs) => { await page.evaluate(([id, role]) => { window.raptorRole(role); window.raptorMe(id) }, [ID[cs], cs === 'Saber' ? 'admin' : 'member']); await page.waitForTimeout(400); cur = cs }
const btn = async id => { const b = page.locator(id + ':visible').first(); return (await b.count()) ? ((await b.isDisabled()) ? 'disabled' : 'enabled') : 'no button here' }
const state = async () => ({ bell: await L.bellState(page), undo: await btn('#undoBtn'), redo: await btn('#redoBtn') })
async function readRanger(label, { tap = false, closeAfter = true } = {}) {
  const back = cur
  if (cur !== 'Ranger') await as('Ranger')
  const st = await L.bellState(page)
  const f = await L.openList(page)
  const lines = L.lineTexts(f)
  L.say(`   [${label}] Ranger's bell lit=${st.lit}; ${lines.length} line(s)${f && f.empty ? ' EMPTY: ' + f.empty : ''}`)
  lines.slice(0, 6).forEach(l => L.say('      ' + l)); if (lines.length > 6) L.say(`      ... (${lines.length - 6} more)`)
  results[label] = { lit: st.lit, lines, empty: f && f.empty }
  if (tap && f && f.lines.length) {
    await page.locator('.bell-list .bl-line').first().click(); await page.waitForTimeout(600)
    L.say('   tapped the first line; window open?', await page.locator('#inpEditPop:visible').count(), 'note:', await L.note(page))
    const x = page.locator('#inpEditClose:visible, #inpEditCancel:visible').first(); if (await x.count()) await x.click()
    await page.waitForTimeout(300)
    const f2 = await L.openList(page); L.say('   after the tap, list:'); L.lineTexts(f2).slice(0, 3).forEach(l => L.say('      ' + l))
    results[label + ' after tap'] = { lines: L.lineTexts(f2), bell: await L.bellState(page) }
  }
  if (closeAfter) await L.closeList(page)
  if (back !== 'Ranger') await as(back)
  return { st, lines }
}
const clickEnd = async (iid, value) => {
  const ri = await L.rowIdx(page, iid)
  const el = page.locator(`#eWeek .day:not(.peek) [data-txt="gr:${L.DI}.${ri}.end"]`).first()
  await el.scrollIntoViewIfNeeded(); await el.click(); await page.keyboard.press('Control+a'); await page.keyboard.type(value); await page.keyboard.press('Enter'); await page.waitForTimeout(250)
  await page.mouse.click(5, 450); await page.waitForTimeout(150)
}

// ============ I8
L.say('=== I8')
await as('Ranger')
const f = await L.fileIt(page, { title: 'Solo training', kind: 'Training', pick: ['Ranger'], from: '13:00', to: '14:00', oil: 'close' })
L.say('   Ranger filed:', JSON.stringify(await L.rec(page, f.iid)))
await readRanger('I8-0 after Ranger filed his own Training')
await as('Saber')
await L.toWeek(page)
let ri = await L.rowIdx(page, f.iid)
const addz = page.locator(`#eWeek .day:not(.peek) [data-fill="g:${L.DI}.${ri}.+"] .addz`).first()
L.say('   +add box:', JSON.stringify(await addz.boundingBox()))
const m = await L.toastMark(page)
await L.drag(page, L.rosterPuck(page, ID.Tally), addz)
L.say('   Saber dragged Tally onto "+ add": note =', await L.toastsSince(page, m), '|', JSON.stringify(await L.rec(page, f.iid)))
await L.shot(page, 'I8-week-after-add')
const stA = await state(); L.say('   Saber: undo/redo state', JSON.stringify(stA))
await readRanger('I8-1 Ranger reads the list (after Tally added)')
await as('Saber')
L.say('   Saber (in place) presses Undo; state before:', JSON.stringify(await state()))
let u = await L.undo(page)
L.say('   Undo:', u, '|', JSON.stringify(await L.rec(page, f.iid)), '| note', await L.note(page))
results.I8_undo = { u, rec: await L.rec(page, f.iid) }
const r2 = await readRanger('I8-2 Ranger after Saber pressed Undo')
await as('Saber')
let rd = await L.redo(page)
L.say('   Redo:', rd, '|', JSON.stringify(await L.rec(page, f.iid)))
results.I8_redo = { rd, rec: await L.rec(page, f.iid) }
await readRanger('I8-3 Ranger after Saber pressed Redo')
await as('Saber')
// round B: Ranger taps the line (it is read), then Undo and Redo
L.say('--- I8 round B: the line read first (a tap on it), then Undo, then Redo')
await readRanger('I8-4 Ranger taps the line', { tap: true })
await as('Saber')
u = await L.undo(page); L.say('   Undo:', u, '|', JSON.stringify(await L.rec(page, f.iid)))
await readRanger('I8-5 Ranger after Undo (the line had been read)')
await as('Saber')
rd = await L.redo(page); L.say('   Redo:', rd, '|', JSON.stringify(await L.rec(page, f.iid)))
await readRanger('I8-6 Ranger after Redo (the line had been read before the Undo)')
await as('Saber')

// ============ I9
L.say('=== I9')
// Saber changes the remark so Ranger has an unread line, then Ranger signs in for real
await L.toWeek(page)
{ ri = await L.rowIdx(page, f.iid)
  const el = page.locator(`#eWeek .day:not(.peek) [data-txt="gr:${L.DI}.${ri}.rmks"]`).first()
  await el.scrollIntoViewIfNeeded(); await el.click(); await page.keyboard.press('Control+a'); await page.keyboard.type('Bring ID'); await page.keyboard.press('Enter'); await page.waitForTimeout(300); await page.mouse.click(5, 450) }
await L.signOut(page); await L.signIn(page, 'us', 'us'); cur = 'Ranger'
L.say('   signed in as Ranger (real sign-in):', JSON.stringify(await state()))
await page.evaluate(() => window.go('inputs')); await page.waitForTimeout(400)
L.say('   on the Inputs page as Ranger: undo/redo', await btn('#undoBtn'), await btn('#redoBtn'))
let fl = await L.openList(page)
L.say('   list before Mark all read:'); L.lineTexts(fl).slice(0, 4).forEach(l => L.say('      ' + l))
results.I9_before = { lines: L.lineTexts(fl), state: await state() }
await L.shotList(page, 'I9-before-markall')
await page.locator('[data-testid="bell-markall"]').click(); await page.waitForTimeout(500)
L.say('   after "Mark all read": bell', JSON.stringify(await state()))
fl = await L.listFacts(page); results.I9_after_markall = { lines: L.lineTexts(fl), state: await state() }
L.lineTexts(fl).slice(0, 3).forEach(l => L.say('      ' + l))
await L.shotList(page, 'I9-after-markall')
await L.closeList(page)
// Undo: not an Undo step
L.say('   Ranger Undo button after Mark all read:', await btn('#undoBtn'))
// reload
await page.reload(); await page.addStyleTag({ content: '*{scroll-behavior:auto !important}' })
await page.waitForSelector('#vWeek .day, #loginForm', { state: 'attached' }); await page.waitForTimeout(500)
const needLogin = await page.locator('#loginForm').isVisible().catch(() => false)
L.say('   after reload: login card shown?', needLogin)
if (needLogin) await L.signIn(page, 'us', 'us')
L.say('   after reload (+ sign-in as Ranger): bell', JSON.stringify(await L.bellState(page)))
fl = await L.openList(page); results.I9_after_reload = { lines: L.lineTexts(fl), bell: await L.bellState(page) }
L.say('   list after reload:', fl ? fl.lines.length + ' lines; first unread? ' + fl.lines.some(l => l.unread) : 'no list'); L.lineTexts(fl).slice(0, 3).forEach(l => L.say('      ' + l))
await L.shotList(page, 'I9-after-reload'); await L.closeList(page)
await L.signOut(page); await L.signIn(page, 'us', 'us')
L.say('   after sign-out and sign-in: bell', JSON.stringify(await L.bellState(page)), 'undo:', await btn('#undoBtn'))
fl = await L.openList(page); results.I9_after_signin = { lines: L.lineTexts(fl), bell: await L.bellState(page) }
L.say('   unread lines now:', fl ? fl.lines.filter(l => l.unread).length : 'no list', 'of', fl ? fl.lines.length : 0)
await L.shotList(page, 'I9-after-signin'); await L.closeList(page)

// ============ I10
L.say('=== I10')
await L.signOut(page); await L.signIn(page, 'ad', 'a'); cur = 'Saber'
const g = await L.fileIt(page, { title: 'Loop brief', kind: 'Meeting', pick: ['Ranger', 'Hex'], from: '09:00', to: '10:00', oil: 'close' })
await L.toWeek(page)
const n0 = await page.evaluate(() => (window.NOTICES || []).length)
L.say('   saved notices before the loop:', n0)
const vals = ['11:00', '12:00']
for (let i = 0; i < 33; i++) {
  await clickEnd(g.iid, vals[i % 2])
}
L.say('   after 33 real saves: INPUTS', JSON.stringify(await L.rec(page, g.iid)))
const n1 = await page.evaluate(() => (window.NOTICES || []).filter(n => true).length)
const nr = await page.evaluate(id => (window.NOTICES || []).filter(n => n.to === id).length, ID.Ranger)
L.say('   saved notices now:', n1, '| for Ranger:', nr)
results.I10_saved = { total: n1, forRanger: nr }
await L.signOut(page); await L.signIn(page, 'us', 'us'); cur = 'Ranger'
L.say('   Ranger signed in: bell', JSON.stringify(await L.bellState(page)))
fl = await L.openList(page)
L.say('   list shows', fl.lines.length, 'lines; markAll offered?', fl.markAll, '; unread:', fl.lines.filter(l => l.unread).length)
L.lineTexts(fl).slice(0, 3).forEach(l => L.say('      ' + l)); L.say('      ...'); L.lineTexts(fl).slice(-2).forEach(l => L.say('      ' + l))
results.I10_list = { count: fl.lines.length, first: L.lineTexts(fl).slice(0, 3), last: L.lineTexts(fl).slice(-2) }
await L.shotList(page, 'I10-list')
await page.locator('[data-testid="bell-markall"]').click(); await page.waitForTimeout(500)
L.say('   after Mark all read: bell', JSON.stringify(await L.bellState(page)))
results.I10_after = { bell: await L.bellState(page) }
await L.shotList(page, 'I10-after-markall'); await L.closeList(page)
await page.reload(); await page.addStyleTag({ content: '*{scroll-behavior:auto !important}' }); await page.waitForTimeout(800)
if (await page.locator('#loginForm').isVisible().catch(() => false)) await L.signIn(page, 'us', 'us')
L.say('   after a reload: bell', JSON.stringify(await L.bellState(page)))
L.record('I8-I10', results)
console.log(L.errs)
await browser.close()
