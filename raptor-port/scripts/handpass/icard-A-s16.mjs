import { launch, open, openDay, press, shot, cardFacts, toList, overflow, judge, saveRows, geom2, saveWin, csId, DAYWIN, WIN, rec, recAll, errs } from './icard-A-lib.mjs'
const browser = await launch()
const T = true
const CS = 'Wlkrone'
const { ctx, page: p } = await open(browser, { width: 390, height: 844 }, 'ad', 'a', T)
const probs = []; const pics = []; const notes = []
const toast = async () => (await p.locator('.toast, #toast, [role="status"]').allInnerTexts().catch(() => [])).join(' | ').slice(0, 200)
async function toUsers() {
  await p.evaluate(() => window.go('admin')); await p.waitForTimeout(700)
  const t = p.locator('[data-admcat="users"]:visible, .adm-cat:has-text("Users"):visible').first()
  if (await t.count()) { await t.tap().catch(() => {}); await p.waitForTimeout(400) }
  await p.waitForSelector('#accAddBlock', { state: 'attached', timeout: 8000 })
}
async function openRow(archived) {
  if (archived && !(await p.locator('#accArchList').count())) { await p.locator('#accArchToggle').scrollIntoViewIfNeeded(); await p.locator('#accArchToggle').tap(); await p.waitForTimeout(400) }
  const pid = await csId(p, CS)
  const b = p.locator(`${archived ? '#accArchList' : '#accList'} [data-person="${pid}"] .acc-tap`).first()
  await b.scrollIntoViewIfNeeded(); await b.tap(); await p.waitForTimeout(450)
  return pid
}
// 1. the disposable person (no sign-in)
await toUsers()
await p.fill('#accAddCs', CS); await p.fill('#accAddIni', 'WK')
await p.selectOption('#accAddSeat', 'FCP').catch(() => {})
const cats = await p.evaluate(() => [...document.querySelectorAll('#accAddCat option')].map(o => o.value)); if (cats.length > 1) await p.selectOption('#accAddCat', cats[1]).catch(() => {})
await p.locator('#accAdd').scrollIntoViewIfNeeded(); await p.locator('#accAdd').tap(); await p.waitForTimeout(900)
const pid = await csId(p, CS)
console.log('person added', !!pid, pid)
if (!pid) { judge(16, 'phone 390', 'admin', 'NOT RUN', 'the disposable person could not be added through Admin > Users'); await ctx.close(); await browser.close(); saveRows('s16'); process.exit(0) }
// 2. an input before today
await openDay(p, '2026-07-15', T)
await press(T, p.locator('#icPopAdd')); await p.locator(WIN).waitFor()
await p.selectOption('#inpEditType', 'Meeting'); await p.selectOption('#inpEditPerson', pid)
await p.fill('#inpEditStart', '09:00'); await p.fill('#inpEditEnd', '10:00'); await p.fill('#inpEditOwnTitle', 'Wlkr briefing')
await saveWin(p, T, 'no')
const r0 = await rec(p, { title: 'Wlkr briefing' })
console.log('input', JSON.stringify(r0))
await p.keyboard.press('Escape'); await p.waitForTimeout(250)
// undo / redo of the main save
await press(T, p.locator('#undoBtn')); await p.waitForTimeout(450)
const gone = !(await rec(p, { title: 'Wlkr briefing' }))
await press(T, p.locator('#redoBtn')); await p.waitForTimeout(450)
const back = !!(await rec(p, { title: 'Wlkr briefing' }))
if (!gone || !back) probs.push(`Undo/Redo of the filing: gone ${gone}, back ${back}`)
const iid = (await rec(p, { title: 'Wlkr briefing' })).iid
async function inspect(label) {
  await toList(p, T)
  const c = (await cardFacts(p, '#inList', 'inl')).find(x => x.iid === iid)
  const card = p.locator(`#inList [data-testid="inl-row-${iid}"]`)
  const out = { who: c && c.who, kind: c && c.kind, title: c && c.title }
  if (!c) { probs.push(`${label}: the past input has no card in the list`); return out }
  await card.scrollIntoViewIfNeeded(); pics.push(await shot(p, `16-${label}-list`))
  if (c.who !== CS) probs.push(`${label}: the card names "${c.who}" not ${CS}`)
  await card.tap(); await p.locator(WIN).waitFor()
  const w = await p.evaluate(() => { const s = document.querySelector('#inpEditPerson'); const f = document.querySelector('#inpEditPersonFixed'); return { sel: s ? (s.options[s.selectedIndex] || {}).text : null, val: s ? s.value : null, fixed: f ? f.textContent : null, head: (document.querySelector('[data-testid="win-inputedit"] .win-ttl') || {}).textContent } })
  out.win = w
  pics.push(await shot(p, `16-${label}-window`))
  const shown = w.sel || w.fixed || ''
  if (!new RegExp(CS).test(shown + ' ' + (w.head || ''))) probs.push(`${label}: the window shows person "${shown}" / head "${w.head}"`)
  if (w.val && w.val !== pid) probs.push(`${label}: the window's person value is ${w.val}, not his id`)
  await press(T, p.locator('#inpEditCancel')); await p.waitForTimeout(250)
  notes.push(label + ' ' + JSON.stringify(out))
  return out
}
await inspect('before')
// 3. archive him
await toUsers(); await openRow(false)
await shot(p, '16-user-row-before-archive')
await p.locator('#accEdArchive').scrollIntoViewIfNeeded(); await p.locator('#accEdArchive').tap(); await p.waitForTimeout(900)
const archived = await p.evaluate(id => !!(window.PEOPLE[id] && window.PEOPLE[id].archived), pid)
console.log('archived', archived)
if (!archived) probs.push('Admin > Users did not archive him')
await inspect('archived')
// 4. restore
await toUsers(); await openRow(true)
await p.locator('#accArRestore').scrollIntoViewIfNeeded(); await p.locator('#accArRestore').tap(); await p.waitForTimeout(900)
const restored = await p.evaluate(id => !!(window.PEOPLE[id] && !window.PEOPLE[id].archived), pid)
console.log('restored', restored)
if (!restored) probs.push('he was not restored')
// 5. delete (asks twice)
await toUsers(); await openRow(false)
await p.locator('#accEdDel').scrollIntoViewIfNeeded(); await p.locator('#accEdDel').tap(); await p.waitForTimeout(350)
const ask = (await p.locator('#accEdDel').innerText()).trim()
await shot(p, '16-delete-armed')
await p.locator('#accEdDel').tap(); await p.waitForTimeout(1000)
const del = await p.evaluate(id => window.PEOPLE[id] ? { deleted: !!window.PEOPLE[id].deleted, cs: window.PEOPLE[id].cs } : 'gone', pid)
console.log('delete ask', ask, 'then', JSON.stringify(del))
const still = await rec(p, { iid })
if (!still) probs.push('the past input was removed with the person')
await inspect('deleted')
judge(16, 'phone 390', 'admin', probs.length ? 'FAIL' : 'PASS', probs.join(' | ') || `past input (15 Jul) kept the callsign ${CS} on its list card and opened its window on him while archived, after restore and after deletion; ${notes.join(' ; ')}`, pics)
await ctx.close()
await browser.close()
saveRows('s16')
console.log('ERRS', JSON.stringify(errs))
