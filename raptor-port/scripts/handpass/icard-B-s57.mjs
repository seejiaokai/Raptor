// #57 Archived and deleted names in the replacement Person field - Saber (admin), phone 390x844 by touch
import * as L from './icard-B-lib.mjs'
const browser = await L.launch()
const T = true
const { ctx, page: p } = await L.open(browser, { width: 390, height: 844 }, 'ad', 'a', true)
await L.watchToasts(p)
const pics = []
const idOf = cs => L.csId(p, cs)
async function adminUsers() {
  await p.evaluate(() => window.go('admin')); await p.waitForTimeout(500)
  if (!(await p.locator('#accList').isVisible())) { await L.press(T, p.locator('#page-admin button', { hasText: 'Sign-in and roster' }).first()); await p.waitForTimeout(500) }
}
async function addPerson(cs) {
  await adminUsers()
  await p.fill('#accAddCs', cs)
  await p.selectOption('#accAddSeat', 'FCP').catch(() => {}); await p.selectOption('#accAddCat', 'OCU').catch(() => {})
  await L.press(T, p.locator('#accAdd')); await p.waitForTimeout(600)
}
async function openRow(id) {
  await adminUsers()
  const r = p.locator(`#accList [data-person="${id}"] .acc-tap`)
  await r.scrollIntoViewIfNeeded(); await L.press(T, r); await p.waitForTimeout(300)
}
await L.scn(57, '390x844 touch', 'Saber (admin)', async () => {
  const notes = [], ck = []
  await addPerson('Zed'); await addPerson('Yap')
  const zed = await idOf('Zed'), yap = await idOf('Yap')
  notes.push(`added Zed=${zed} Yap=${yap}`)
  // a retained PAST input for Yap (8 Jul), and an ordinary saved input for Saber (20 Jul)
  await L.fileInput(p, T, { iso: '2026-07-08', type: 'Appointment', who: yap, from: '09:00', to: '10:00', title: 'Yap past', rmk: 'old remark' })
  await L.fileInput(p, T, { iso: '2026-07-20', type: 'Duty', who: await idOf('Saber'), from: '09:00', to: '10:00', title: 'Reassign me' })
  const past = await L.rec(p, { title: 'Yap past' }), duty = await L.rec(p, { title: 'Reassign me' })
  notes.push(`Yap's past input: person ${past && past.person}; Saber's duty ${duty && duty.iid}`)
  // archive Zed through Admin -> Users
  await openRow(zed)
  await L.press(T, p.locator('#accEdArchive')); await p.waitForTimeout(600)
  const archived = await p.evaluate(id => !!(window.PEOPLE[id] && window.PEOPLE[id].archived), zed)
  notes.push(`Zed archived: ${archived}`)
  // reassignment to the archived person from an ordinary saved input
  await L.openFromList(p, T, duty.iid)
  const opts = await p.locator('#inpEditPerson').evaluate(sel => [...sel.querySelectorAll('optgroup')].map(g => g.label + ': ' + [...g.querySelectorAll('option')].map(o => o.textContent).join(',').slice(0, 80)))
  const hasZed = await p.locator('#inpEditPerson option', { hasText: /^Zed$/ }).count()
  notes.push(`Person list groups: ${JSON.stringify(opts)}; Zed offered: ${hasZed}`)
  pics.push(await L.shot(p, 'B57-1-person-list'))
  if (hasZed) {
    await p.selectOption('#inpEditPerson', zed)
    await L.saveWin(p, T, 'no')
    const r = await L.recId(p, duty.iid)
    notes.push(`after saving with Zed: person ${r.person === zed ? 'Zed (the archived man)' : r.person}`)
    ck.push(r.person === zed)
  } else ck.push(false)
  await L.closeAll(p)
  // delete Yap: archive then delete
  await openRow(yap)
  await L.press(T, p.locator('#accEdArchive')); await p.waitForTimeout(500)
  await adminUsers()
  await L.press(T, p.locator('#accArchToggle')); await p.waitForTimeout(300)
  const ar = p.locator(`#accArchList [data-person="${yap}"] .acc-tap`)
  await ar.scrollIntoViewIfNeeded(); await L.press(T, ar); await p.waitForTimeout(300)
  await L.clearToasts(p)
  await L.press(T, p.locator('#accArDel')); await p.waitForTimeout(350)
  notes.push('delete button now says: "' + (await p.locator('#accArDel').innerText().catch(() => '?')) + '"; note: "' + (await p.locator('#accArDelNote').innerText().catch(() => '')) + '"')
  await L.press(T, p.locator('#accArDel')); await p.waitForTimeout(900)
  notes.push('after the second press, toasts ' + JSON.stringify(await L.toasts(p)))
  pics.push(await L.shot(p, 'B57-3-delete'))
  const gone = await p.evaluate(id => !window.PEOPLE[id], yap)
  const stays = await L.recId(p, past.iid)
  notes.push(`Yap deleted: ${gone}; his past input still stored: ${!!stays} (person ${stays && stays.person})`)
  // open the retained past input, save only its remark
  await L.openFromList(p, T, past.iid)
  const shown = await p.evaluate(() => { const s = document.querySelector('#inpEditPerson'); const f = document.querySelector('#inpEditPersonFixed'); return s ? 'select shows "' + s.options[s.selectedIndex].text + '" (value ' + s.value + ')' : f ? 'fixed "' + f.textContent + '"' : 'no person control' })
  pics.push(await L.shot(p, 'B57-2-deleted-persons-input'))
  await p.fill('#inpEditRmk', 'remark edited after delete')
  await L.saveWin(p, T, 'no')
  const after = await L.recId(p, past.iid)
  notes.push(`window showed: ${shown}; after saving only the remark: person ${after && after.person} (was ${past.person}), remark "${after && after.remarks}"`)
  ck.push(after && after.person === past.person && after.remarks === 'remark edited after delete')
  // the list card names him
  await L.toList(p, T)
  const card = await p.locator(`#inList [data-testid="inl-row-${past.iid}"] [data-testid="inl-who"]`).innerText().catch(() => '?')
  notes.push(`the list card names the person "${card}"`)
  ck.push(/Yap/.test(card))
  await L.undo(p); await L.redo(p)
  return { ok: ck.every(Boolean), saw: notes.join(' || ') + ` || checks ${JSON.stringify(ck)}`, pics }
})
L.save('s57')
console.log(L.errs)
await browser.close()
