// #42 Move a downchit into a different medical entry — Saber, desktop 1440x900
import * as L from './icard-B-lib.mjs'
const browser = await L.launch()
const { ctx, page: p } = await L.open(browser, { width: 1440, height: 900 })
const sab = await L.csId(p, 'Saber')
const snap = async () => (await L.recs(p, { person: sab })).filter(r => /ATT|OML/.test(r.type)).map(r => `${r.type} ${r.date}${r.endDate ? '→' + r.endDate : ''}${r.half ? ' ' + r.half : ''}`).sort().join(' ; ')
await L.fileInput(p, false, { type: 'ATT C', who: sab, dates: ['2026-07-20', '2026-07-21'], doc: L.DOC })
await L.fileInput(p, false, { type: 'OML', who: sab, dates: ['2026-07-23', '2026-07-25'], doc: L.DOC })
const base = await snap()
console.log('BASE', base)
const attId = (await L.rec(p, { type: 'ATT C', person: sab })).iid
const sheet = p.locator('[data-testid="medclash"]')
async function openAtt() {
  await L.toList(p, false)
  await p.locator(`#inBody tr[data-iid="${attId}"] [data-testid="in-open"]`).click(); await p.locator(L.WIN).waitFor()
}
async function moveTo() {
  await openAtt()
  await L.tapDate(p, false, '2026-07-22'); await L.tapDate(p, false, '2026-07-24')
  await p.click('#inpEditSave'); await sheet.waitFor({ timeout: 4000 })
}
const pics = []
await L.scn(42, '1440x900', 'Saber (admin)', async () => {
  const notes = []
  await moveTo()
  const read = await L.calRead(p)
  const sheetText = (await sheet.innerText()).replace(/\s+/g, ' ')
  pics.push(await L.shot(p, 'B42-1-clash-sheet'))
  const duringSave = await snap()
  await sheet.locator('button', { hasText: /^Cancel$/ }).click(); await p.waitForTimeout(500)
  const afterCancel = await snap()
  const winStill = await p.locator(L.WIN).count()
  pics.push(await L.shot(p, 'B42-2-after-cancel'))
  notes.push(`calendar read "${read}"; sheet: "${sheetText}"; saved while sheet up: ${duringSave}; after Cancel: ${afterCancel}; window still open ${winStill}`)
  // B: replaces + Keep them
  await p.locator(L.WIN).count() && await p.keyboard.press('Escape').catch(() => {})
  await L.closeAll(p)
  await moveTo()
  await sheet.locator('button', { hasText: /ATT C replaces/ }).click()
  const sheet2 = (await sheet.innerText()).replace(/\s+/g, ' ')
  await sheet.locator('button', { hasText: /Keep them/ }).click()
  pics.push(await L.shot(p, 'B42-3-replaces-keep-them'))
  await sheet.locator('button', { hasText: /^Save$/ }).click(); await p.waitForTimeout(800)
  const keepTail = await snap()
  notes.push(`sheet after choosing "ATT C replaces": "${sheet2}"; after replaces + Keep them: ${keepTail}`)
  await L.openDay(p, '2026-07-25', false)
  const d25 = (await p.locator(`${L.DAYWIN} [data-testid^="idy-row-"]`).evaluateAll(els => els.map(e => e.innerText.replace(/\s+/g, ' ')))).filter(t => /Saber/.test(t))
  pics.push(await L.shot(p, 'B42-4-day25-oml-tail'))
  await L.openDay(p, '2026-07-23', false)
  const d23 = (await p.locator(`${L.DAYWIN} [data-testid^="idy-row-"]`).evaluateAll(els => els.map(e => e.innerText.replace(/\s+/g, ' ')))).filter(t => /Saber/.test(t))
  pics.push(await L.shot(p, 'B42-5-day23'))
  notes.push('day 25 Saber cards: ' + d25.join(' || ') + ' ; day 23 Saber cards: ' + d23.join(' || '))
  await L.closeAll(p)
  await L.undo(p); const u1 = await snap(); await L.redo(p); const r1 = await snap()
  notes.push(`ONE Undo: ${u1}; Redo: ${r1}`)
  await L.undo(p)
  // C: replaces + Remove
  await moveTo()
  await sheet.locator('button', { hasText: /ATT C replaces/ }).click()
  await sheet.locator('button', { hasText: /Remove those days/ }).click()
  await sheet.locator('button', { hasText: /^Save$/ }).click(); await p.waitForTimeout(800)
  const removeTail = await snap()
  pics.push(await L.shot(p, 'B42-6-replaces-remove'))
  notes.push(`replaces + Remove those days: ${removeTail}`)
  await L.undo(p); const u2 = await snap()
  notes.push(`Undo: ${u2}`)
  // D: keep OML
  await moveTo()
  await sheet.locator('button', { hasText: /Keep OML/ }).click()
  const sheet3 = (await sheet.innerText()).replace(/\s+/g, ' ')
  await sheet.locator('button', { hasText: /^Save$/ }).click(); await p.waitForTimeout(800)
  const keepOml = await snap()
  pics.push(await L.shot(p, 'B42-7-keep-oml'))
  notes.push(`sheet after "Keep OML": "${sheet3}"; result: ${keepOml}`)
  await L.undo(p); const u3 = await snap()
  notes.push(`Undo: ${u3}`)
  const ok = /Saber/.test(sheetText) && /ATT C/.test(sheetText) && /OML/.test(sheetText) && /Jul 22/.test(sheetText) && duringSave === base && afterCancel === base
    && keepTail === 'ATT C Jul 22→Jul 24 ; OML Jul 25' && u1 === base && r1 === keepTail && removeTail === 'ATT C Jul 22→Jul 24' && u2 === base && keepOml === 'ATT C Jul 22 ; OML Jul 23→Jul 25' && u3 === base
  return { ok, saw: notes.join(' || '), pics }
})
L.save('s42')
console.log(L.errs)
await browser.close()
