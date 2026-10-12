// G4 (sick leave cuts one man of a shared leave) - LL for Drifter, Hunter, Tally Mon 13 - Fri 17 Jul; publish Wed; medical (ATT C) for Tally Wed-Thu
import { open, fileInput, toWeek, toBoard, toView, shot, shotEl, browser, errs, readRows, inputsRead, signAndPublish, counts, sleep, toastMark, toastsSince, csId, reload, saveData, MONTHS } from './or-G-lib.mjs'
const rec = {}
const DI = 2
const { ctx, page } = await open()
const ids = { D: await csId(page, 'Drifter'), H: await csId(page, 'Hunter'), T: await csId(page, 'Tally') }
const leaveRows = async () => page.evaluate(() => window.INPUTS.filter(r => ['LL', 'ATT C'].includes(r.type) && /Jul (1[3-7])/.test(r.date)).map(r => ({ iid: r.iid.slice(-5), type: r.type, date: r.date, endDate: r.endDate || r.to || null, people: r.people ? r.people.map(e => window.PEOPLE[e.p]?.cs) : [window.PEOPLE[r.person]?.cs], docs: r.doc ? 'doc' : null, keys: Object.keys(r).join(',') })))
async function lwDump(tag) {
  await page.evaluate(() => { if (window.closeScheduler && document.querySelector('#schedBoard')) window.closeScheduler() }).catch(() => {})
  await page.evaluate(() => window.go('leavewar')); await sleep(1300)
  const mon = page.locator('[data-testid="month-JUL"]'); if (await mon.count()) { await mon.first().click(); await sleep(1200) }
  const out = await page.evaluate(([ids]) => {
    const res = {}
    for (const [k, id] of Object.entries(ids)) {
      res[window.PEOPLE[id].cs] = ['2026-07-13', '2026-07-14', '2026-07-15', '2026-07-16', '2026-07-17'].map(d => { const c = document.querySelector(`[data-testid="cell-${id}-${d}"]`); return d.slice(8) + ':' + (c ? ((c.innerText || '').replace(/\s+/g, ' ').trim() || '(blank)') + '[' + c.className.replace(/\s+/g, '.').slice(0, 40) + ']' : 'NO CELL') })
    }
    res.rowsDrawn = ['dice'].length && Object.keys(ids).map(k => ids[k]).map(id => !!document.querySelector(`[data-testid="row-${id}"]`))
    return res
  }, [ids])
  await shot(page, tag)
  return out
}
async function toMonth() {
  await page.evaluate(() => window.go('inputs')); await sleep(500)
  if (await page.locator('#inCalBtn').getAttribute('aria-pressed') !== 'true') { await page.locator('#inCalBtn').click(); await sleep(300) }
  await page.locator('#inpCal').waitFor()
  const at = async () => { const [m, y] = (await page.locator('#inpCal .ic-mon').textContent()).trim().toLowerCase().split(/\s+/); return +y * 12 + MONTHS.findIndex(x => x.startsWith(m)) }
  let d = 2026 * 12 + 6 - await at()
  for (; d > 0; d--) await page.locator('#icNext').click()
  for (; d < 0; d++) await page.locator('#icPrev').click()
  await page.waitForSelector('[data-icday="2026-07-15"]')
}
async function inputsCal(tag) {
  await toMonth(); await sleep(400)
  await page.locator('#toastEl').evaluate(t => t.style.visibility = 'hidden').catch(() => {})
  const bars = await page.evaluate(() => [...document.querySelectorAll('.ib-bar')].filter(b => { const r = b.getBoundingClientRect(); return r.width > 0 }).map(b => (b.textContent || '').replace(/\s+/g, ' ').trim() + ' @' + (b.getAttribute('data-iid') || '').slice(-5)).filter(t => /Drifter|Hunter|Tally|LL|ATT/i.test(t)).slice(0, 20))
  await shot(page, tag + '-month')
  const cell = page.locator('[data-icday="2026-07-15"]')
  await cell.focus(); await page.keyboard.press('Enter'); await page.waitForSelector('[data-testid="win-inputsday"]'); await sleep(400)
  const card = await page.locator('[data-testid="win-inputsday"]').innerText()
  await shot(page, tag + '-day15')
  await page.keyboard.press('Escape'); await sleep(250)
  return { bars, card: card.replace(/\s+/g, ' ').slice(0, 900) }
}

rec.filed = await fileInput(page, { type: 'LL', people: ['Drifter', 'Hunter', 'Tally'], from: '2026-07-13', to: '2026-07-17' })
console.log('filed', JSON.stringify(rec.filed))
rec.inputsLL = await leaveRows(); console.log('LL rows', JSON.stringify(rec.inputsLL))
rec.pub = await signAndPublish(page, DI); console.log('pub', JSON.stringify(rec.pub))
rec.beforeMed = { counts: await counts(page, DI), lw: await lwDump('G4-lw-before-medical'), cal: await inputsCal('G4-before-medical') }
console.log('beforeMed counts', JSON.stringify(rec.beforeMed.counts.a), JSON.stringify(rec.beforeMed.counts.lines))
console.log('beforeMed lw', JSON.stringify(rec.beforeMed.lw))
/* the medical down-chit for Tally Wed-Thu */
rec.medFiled = await fileInput(page, { type: 'ATT C', person: 'Tally', from: '2026-07-15', to: '2026-07-16' })
console.log('med', JSON.stringify(rec.medFiled))
rec.after = { inputs: await leaveRows() }
console.log('after rows', JSON.stringify(rec.after.inputs))
rec.after.counts = await counts(page, DI); rec.after.lw = await lwDump('G4-lw-after-medical'); rec.after.cal = await inputsCal('G4-after-medical')
console.log('after counts', JSON.stringify(rec.after.counts))
console.log('after lw', JSON.stringify(rec.after.lw))
console.log('after cal', JSON.stringify(rec.after.cal))
/* ONE Undo */
await toWeek(page)
await page.locator('#undoBtn:visible').first().click(); await sleep(800)
rec.undoToast = (await page.evaluate(() => document.getElementById('toastEl')?.innerText || '')).replace(/\s+/g, ' ')
rec.undo = { inputs: await leaveRows(), counts: await counts(page, DI) }
console.log('undo', rec.undoToast, JSON.stringify(rec.undo.inputs), JSON.stringify(rec.undo.counts.a), JSON.stringify(rec.undo.counts.lines))
rec.undo.lw = await lwDump('G4-lw-after-undo')
console.log('undo lw', JSON.stringify(rec.undo.lw))
saveData('G4', rec)
console.log('errs', JSON.stringify(errs))
await ctx.close(); await browser.close()
