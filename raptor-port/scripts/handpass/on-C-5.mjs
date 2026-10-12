import * as L from './on-C-lib.mjs'
const { tid, shot, check } = L
const browser = await L.launch()
const { ctx, page, errors } = await L.world(browser)
const F = []
const tr = await L.fileIt(page, L.FRI, { type: 'Training', people: ['bane', 'nick'], from: '09:00', to: '12:00', title: 'Range brief' }, 'yes')
const du = await L.fileIt(page, L.FRI, { type: 'Duty', people: ['harpoon'], title: 'Gate duty' }, 'yes')
const oilOn = id => page.evaluate(i => JSON.stringify((window.INPUTS.find(r => r.iid === i) || {}).oil || null), id)
F.push(`Filed on Fri 17: Training for Ranger+Tally ${tr} oil ${await oilOn(tr)}; Duty for Trident ${du} oil ${await oilOn(du)}`)
const pub = await L.signAndPublish(page, L.FRI_DI)
F.push('publish: ' + JSON.stringify(pub))
const rd = async () => ({ pend: await L.pendingOn(page, L.FRI_DI), go: await L.toGoOut(page, L.FRI_DI), view: await L.viewSchedRows(page, L.FRI_DI) })
const show = s => `dstat "${s.pend.dstat}" | head "${s.pend.head.slice(0, 230)}" | go-out "${s.go.title} | ${s.go.tabLabel} | ${s.go.head} | ${JSON.stringify(s.go.lines)}" | view ${JSON.stringify(s.view)}`
const base = await rd(); F.push('BEFORE holiday: ' + show(base)); console.log('BASE', show(base))
await L.toWeek(page); await shot(page, 'C5-1-before-head')
/* the holiday */
await L.fileOutHoliday(page, L.FRI, 'National Day')
const win = tid(page, 'win-oilday')
const listUp = await win.count() === 1
const info = listUp ? { title: (await win.locator('.win-ttl').innerText()).replace(/\s+/g, ' '), lead: await tid(page, 'odl-lead').innerText().catch(() => ''), count: await tid(page, 'odl-count').innerText().catch(() => ''), cards: await win.locator('.icard').count(), save: await tid(page, 'odl-save').isDisabled() } : null
console.log('LIST', JSON.stringify(info), 'measure', JSON.stringify(await L.measure(page, '[data-testid="win-oilday"]')))
F.push('List after saving the holiday: ' + JSON.stringify(info) + ' measure ' + JSON.stringify(await L.measure(page, '[data-testid="win-oilday"]')) + '; toast "' + await L.toast(page) + '"')
await L.hush(page); await shot(page, 'C5-2-list'); await L.unhush(page)
/* read the day WITHOUT touching the list (go to the week) */
const afterDecl = await rd(); F.push('AFTER declaring, nothing answered: ' + show(afterDecl)); console.log('DECL', show(afterDecl))
await L.toWeek(page); await shot(page, 'C5-3-head-after-declaring')
const sign1 = await L.signoffsOn(page, L.FRI_DI); F.push('board sign strip after declaring: ' + JSON.stringify(sign1))
const stillUp = await tid(page, 'win-oilday').count()
F.push('is the list still up after leaving the Inputs page? ' + stillUp)
console.log('list still up', stillUp)
/* get the list back: Saber\'s own bell line */
if (!stillUp) {
  await page.locator('.bellbtn:visible').first().click(); await page.waitForTimeout(400)
  const bl = tid(page, 'bell-list')
  const lines = await bl.locator('.bl-line').allInnerTexts().catch(() => [])
  F.push('Saber\'s bell lines: ' + JSON.stringify(lines.map(x => x.replace(/\s+/g, ' '))))
  console.log('BELL', JSON.stringify(lines))
  if (await bl.locator('.bl-line').count()) { await bl.locator('.bl-line').first().click(); await page.waitForTimeout(500) }
}
console.log('list up now', await tid(page, 'win-oilday').count())
/* answer the Training Yes and Save */
await tid(page, `odl-yes-${tr}`).click()
const cnt = await tid(page, 'odl-count').innerText()
await L.hush(page); await shot(page, 'C5-4-list-one-yes'); await L.unhush(page)
await tid(page, 'odl-save').click(); await page.waitForTimeout(700)
const t = await L.toast(page)
F.push(`picked Yes on the Training; count "${cnt}"; Save; toast "${t}"; Training oil ${await oilOn(tr)}; Duty oil ${await oilOn(du)}`)
const after = await rd(); F.push('AFTER Save: ' + show(after)); console.log('AFTERSAVE', show(after))
await L.toWeek(page); await shot(page, 'C5-5-head-after-save')
const g = await L.toGoOut(page, L.FRI_DI, true); await shot(page, 'C5-6-changes-window'); await page.locator('.chgwin .win-x').first().click().catch(() => {})
const sign2 = await L.signoffsOn(page, L.FRI_DI); F.push('board sign strip after Save: ' + JSON.stringify(sign2))
/* reload */
await page.reload(); await page.waitForSelector('#vWeek .day, #loginForm', { state: 'attached' }); await page.waitForTimeout(600)
if (await page.locator('#luser').isVisible().catch(() => false)) { await page.fill('#luser', 'ad'); await page.fill('#lpass', 'a'); await page.click('#loginForm button[type=submit]'); await page.waitForSelector('#vWeek .day', { state: 'attached' }); await page.waitForTimeout(600) }
const rl = await rd(); F.push('AFTER reload: ' + show(rl) + ' | oil ' + await oilOn(tr)); console.log('RELOAD', show(rl))
console.log('FACTS\n' + F.join('\n'))
console.log('ERRORS', JSON.stringify(errors))
await ctx.close(); await browser.close()
