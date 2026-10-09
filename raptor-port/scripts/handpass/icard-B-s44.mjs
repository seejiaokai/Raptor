// #44 Move an upchit - Saber (admin), desktop 1440x900
import * as L from './icard-B-lib.mjs'
const browser = await L.launch()
const { ctx, page: p } = await L.open(browser, { width: 1440, height: 900 })
await L.watchToasts(p)
const T = false
const sab = await L.csId(p, 'Saber')
const snap = async () => (await L.recs(p, { person: sab })).filter(r => /^(ATT C|OML|Upchit)$/.test(r.type)).map(r => `${r.type} ${r.date}${r.endDate ? '→' + r.endDate : ''}${r.remarks ? ' [' + r.remarks + ']' : ''}`).sort().join(' ; ')
const pics = []
const sheet = p.locator('[data-testid="upconf"]')
await L.scn(44, '1440x900', 'Saber (admin)', async () => {
  const notes = []
  await L.fileInput(p, T, { type: 'ATT C', who: sab, dates: ['2026-07-13', '2026-07-22'], doc: L.DOC })
  await L.fileInput(p, T, { type: 'OML', who: sab, dates: ['2026-07-25', '2026-07-27'], doc: L.DOC })
  // file the upchit on 20 Jul through the window's own Upchit kind
  await L.openDay(p, '2026-07-20', T); await L.press(T, p.locator('#icPopAdd')); await p.locator(L.WIN).waitFor()
  await p.selectOption('#inpEditType', 'Upchit'); await L.attachDoc(p, L.DOC)
  await p.click('#inpEditSave'); await sheet.waitFor({ timeout: 4000 })
  notes.push('filing summary: ' + (await sheet.innerText()).replace(/\s+/g, ' '))
  await sheet.locator('[data-testid="upconf-left-0"] button', { hasText: /^Keep$/ }).click()
  await sheet.locator('[data-testid="upconf-save"]').click(); await p.waitForTimeout(700)
  const base = await snap(); notes.push('after filing the upchit on 20 Jul (Keep OML): ' + base)
  const up = (await L.recs(p, { person: sab })).find(r => r.type === 'Upchit')
  // reopen the upchit from the list, choose the EARLIER return date 17 Jul
  await L.openFromList(p, T, up.iid)
  const calBefore = await L.calRead(p)
  await L.tapDate(p, T, '2026-07-17')
  const calAfter = await L.calRead(p)
  await p.click('#inpEditSave'); await sheet.waitFor({ timeout: 4000 })
  const st = (await sheet.innerText()).replace(/\s+/g, ' ')
  const during = await snap()
  pics.push(await L.shot(p, 'B44-1-summary-before-save'))
  notes.push(`calendar ${calBefore} -> ${calAfter}; summary before saving: "${st}"; saved while summary up: ${during === base ? 'unchanged' : during}`)
  // Cancel
  await sheet.locator('button', { hasText: /^Cancel$/ }).click(); await p.waitForTimeout(500)
  const afterCancel = await snap()
  notes.push('after Cancel: ' + (afterCancel === base ? 'unchanged' : afterCancel) + `; window open ${await p.locator(L.WIN).count()}`)
  // confirm
  if (!(await p.locator(L.WIN).count())) { await L.openFromList(p, T, up.iid); await L.tapDate(p, T, '2026-07-17') }
  await p.click('#inpEditSave'); await sheet.waitFor({ timeout: 4000 })
  const left = sheet.locator('[data-testid^="upconf-left-"]')
  const nLeft = await left.count()
  for (let i = 0; i < nLeft; i++) await sheet.locator(`[data-testid="upconf-left-${i}"] button`, { hasText: /^Keep$/ }).click()
  pics.push(await L.shot(p, 'B44-2-summary-keep-chosen'))
  await sheet.locator('[data-testid="upconf-save"]').click(); await p.waitForTimeout(800)
  const after = await snap()
  notes.push('after confirming (Keep): ' + after)
  const med = await L.medText(p, T)
  pics.push(await L.shot(p, 'B44-3-medical-tab'))
  notes.push('medical tab, Saber lines: ' + med.split(String.fromCharCode(10)).map((l, i, a) => /Saber/.test(l) ? a.slice(Math.max(0, i - 1), i + 5).join(' ') : '').filter(Boolean).join(' || ') + ' ; headers: ' + med.split(String.fromCharCode(10)).filter(l => /^(MEDICALLY DOWN|PENDING UPCHIT|UPCHIT COMPLETE)/.test(l)).join(', '))
  await L.toList(p, T)
  const rowTxt = await p.evaluate(() => [...document.querySelectorAll('#inBody tr')].filter(tr => /Saber/.test(tr.textContent) && /ATT C|OML|UPCHIT/i.test(tr.textContent)).map(tr => tr.innerText.replace(/\s+/g, ' ').slice(0, 90)))
  pics.push(await L.shot(p, 'B44-4-list'))
  notes.push('list rows: ' + rowTxt.join(' | '))
  await L.undo(p); const u = await snap(); notes.push('Undo: ' + (u === base ? 'back to before the move' : u)); await L.redo(p); const r = await snap(); notes.push('Redo: ' + (r === after ? 'same as confirmed' : r))
  const ok = /ends Jul 16/.test(st) && /Jul 17/.test(st) && /OML/.test(st) && during === base && afterCancel === base && /ATT C Jul 13→Jul 16/.test(after) && u === base && r === after
  return { ok, saw: notes.join(' || '), pics }
})
L.save('s44')
console.log(L.errs)
await browser.close()
