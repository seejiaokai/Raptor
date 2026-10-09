// #46 The document route lost with the pencil - Saber (admin), desktop 1440x900
import * as L from './icard-B-lib.mjs'
const browser = await L.launch()
const T = false
const { ctx, page: p } = await L.open(browser, { width: 1440, height: 900 })
await L.watchToasts(p)
const sab = await L.csId(p, 'Saber')
const docN = async iid => (await L.raw(p, iid)) ? ((await L.raw(p, iid)).docIds || []).length + ((await L.raw(p, iid)).docId ? 1 : 0) : -1
const chips = async () => p.locator(`${L.WIN} .docchip`).count()
const pics = []
await L.scn(46, '1440x900', 'Saber (admin)', async () => {
  const notes = []
  await L.fileInput(p, T, { iso: '2026-07-20', type: 'ATT C', who: sab, doc: L.DOC })
  const att = await L.rec(p, { person: sab, type: 'ATT C' })
  notes.push(`filed ATT C with 1 document: stored docs ${await docN(att.iid)}`)
  // open, the paperclip opens the document viewer
  await L.openFromList(p, T, att.iid)
  notes.push(`window: ${await chips()} document chip(s)`)
  await p.locator(`${L.WIN} [data-testid="inped-docview"]`).click()
  const viewer = await p.locator('#docViewPop:not([hidden])').waitFor({ timeout: 3000 }).then(() => true, () => false)
  const imgs1 = viewer ? await p.locator('#docViewPop img, #docViewPop embed, #docViewPop iframe, #docViewPop canvas').count() : 0
  pics.push(await L.shot(p, 'B46-1-viewer-one'))
  notes.push(`paperclip: viewer ${viewer}, ${imgs1} document element(s)`)
  if (viewer) await p.locator('#docViewClose').click()
  // add a second file, save
  await L.attachDoc(p, L.DOC2)
  notes.push(`after Add: ${await chips()} chip(s)`)
  pics.push(await L.shot(p, 'B46-2-two-chips'))
  await L.saveWin(p, T)
  notes.push(`saved: stored docs ${await docN(att.iid)}`)
  // reopen and read both
  await L.openFromList(p, T, att.iid)
  const c2 = await chips()
  await p.locator(`${L.WIN} [data-testid="inped-docview"]`).click()
  await p.locator('#docViewPop:not([hidden])').waitFor({ timeout: 3000 })
  const imgs2 = await p.locator('#docViewPop img, #docViewPop embed, #docViewPop iframe, #docViewPop canvas').count()
  const vtxt = (await p.locator('#docViewPop').innerText()).replace(/\s+/g, ' ')
  pics.push(await L.shot(p, 'B46-3-viewer-two'))
  await p.locator('#docViewPop button', { hasText: /›/ }).first().click(); await p.waitForTimeout(300)
  const vtxt2 = (await p.locator('#docViewPop').innerText()).replace(/\s+/g, ' ')
  notes.push(`next document: "${vtxt2.slice(0, 120)}"`)
  pics.push(await L.shot(p, 'B46-3b-viewer-second'))
  notes.push(`reopened: ${c2} chips; viewer shows ${imgs2} document element(s), text "${vtxt.slice(0, 80)}"`)
  await p.locator('#docViewClose').click()
  // remove one, save
  await p.locator(`${L.WIN} .docchip .docdel`).first().click()
  notes.push(`after removing one: ${await chips()} chip(s)`)
  await L.saveWin(p, T)
  const afterRm = await docN(att.iid)
  await L.openFromList(p, T, att.iid); const cAfter = await chips(); await p.click('#inpEditCancel'); await p.waitForTimeout(300)
  notes.push(`reopened after removing one: ${cAfter} chip(s)`)
  notes.push(`saved: stored docs ${afterRm}`)
  // try removing the final file
  await L.openFromList(p, T, att.iid)
  await p.locator(`${L.WIN} .docchip .docdel`).first().click()
  notes.push(`after removing the last: ${await chips()} chip(s)`)
  await L.clearToasts(p)
  await p.click('#inpEditSave'); await p.waitForTimeout(900)
  const tA = await L.toasts(p)
  const sheetTxt = await p.evaluate(() => { const e = document.querySelector('.upconf-box, [data-testid="upconf"], [data-testid="oilconf"]'); return e ? e.innerText.replace(/\s+/g, ' ').slice(0, 300) : '' })
  const afterLast = await docN(att.iid)
  pics.push(await L.shot(p, 'B46-4-remove-last'))
  notes.push(`Save with no file left: toasts ${JSON.stringify(tA)}; sheet "${sheetTxt}"; window open ${await p.locator(L.WIN).count()}; stored docs ${afterLast}`)
  await L.closeAll(p)
  // retype an ordinary own input into medical with no document
  await L.fileInput(p, T, { iso: '2026-07-22', type: 'Duty', who: sab, from: '09:00', to: '10:00', title: 'Retype me' })
  const du = await L.rec(p, { person: sab, type: 'Duty', title: 'Retype me' })
  await L.openFromList(p, T, du.iid)
  await p.selectOption('#inpEditType', 'ATT C')
  await L.clearToasts(p)
  await p.click('#inpEditSave'); await p.waitForTimeout(900)
  const q = await p.evaluate(() => { const e = document.querySelector('.upconf-box'); return e ? e.innerText.replace(/\s+/g, ' ') : '' })
  pics.push(await L.shot(p, 'B46-5-retype-question'))
  const typeDuring = (await L.recId(p, du.iid)).type
  notes.push(`retype Duty -> ATT C with no document: question "${q}"; saved type while asked ${typeDuring}`)
  // cancel the question (its X)
  await p.locator('.upconf-box button', { hasText: '✕' }).first().click().catch(() => {}); await p.waitForTimeout(500)
  const typeCancel = (await L.recId(p, du.iid)).type
  notes.push(`after cancelling the question: saved type ${typeCancel}; window open ${await p.locator(L.WIN).count()}`)
  // answer No document -> it saves as medical without a document? choose Upload path check
  await p.click('#inpEditSave'); await p.waitForTimeout(700)
  await p.locator('.upconf-box button', { hasText: /^No document$/ }).click().catch(() => notes.push('no "No document" button found'))
  await p.waitForTimeout(700)
  const fin = await L.recId(p, du.iid)
  notes.push(`after "No document": saved type ${fin.type}, docs ${fin.docs}`)
  const ok = viewer && c2 === 2 && imgs2 >= 1 && afterRm === 1 && afterLast >= 0 && /document|certificate/i.test(q) && typeDuring === 'Duty' && typeCancel === 'Duty'
  return { ok, saw: notes.join(' || '), pics }
})
L.save('s46')
console.log(L.errs)
await browser.close()
