import * as G from './cal-G-lib.mjs'
const { L, W, sleep } = G
G.setTag('probe9')
const { browser, p, errors } = await G.world({ who: 'a' })
const tid = id => p.locator(`[data-testid="${id}"]`)
const pdf = n => Buffer.from(`%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj 2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj 3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 200 100]>>endobj\n% G-probe doc ${n}\ntrailer<</Root 1 0 R>>\n%%EOF`)
await L.go(p, 'inputs'); await G.toInputsCal(p); await G.monthTo(p, 2026, 6)
await G.openDay(p, '2026-07-20'); await G.plusInput(p)
await p.selectOption('#inpEditType', 'ATT B'); await sleep(200)
await p.selectOption('#inpEditPerson', 'bane')
console.log('range cal cells', await p.locator('#inpEditPop [data-cal]').count(), await p.locator('[data-testid="win-inputedit"] [data-cal]').count())
await p.locator('[data-testid="win-inputedit"] [data-cal="2026-07-24"]').first().click(); await sleep(300)
await p.locator('[data-testid="win-inputedit"] .docfield input[type=file]').first().setInputFiles([{ name: 'ranger-down-A.pdf', mimeType: 'application/pdf', buffer: pdf('A') }]); await sleep(700)
await p.fill('#inpEditRmk', 'G probe medical A'); await G.shot(p, 'editor-medical')
await p.click('#inpEditSave'); await sleep(900)
for (let i = 0; i < 3; i++) { const nd = p.locator('[data-testid="docconf-nodoc"]:visible'); if (await nd.count()) { await nd.click(); await sleep(400) } }
await G.shot(p, 'after-add')
console.log('records', JSON.stringify(await p.evaluate(() => window.INPUTS.filter(x => /G probe/.test(x.remarks || '')).map(x => ({ iid: x.iid, who: window.PEOPLE[x.person].cs, type: x.type, date: x.date, end: x.endDate, docIds: x.docIds, by: x.by, at: x.at })))))
await p.locator('#inMedBtn').click(); await sleep(800); await G.shot(p, 'medical-tab')
console.log('cards', JSON.stringify(await p.locator('.medcard').allInnerTexts()))
// as-of Jul 22 to see it down
await p.locator('#medCalBtn').click(); await sleep(300)
console.log('errors', JSON.stringify(errors))
await browser.close()
