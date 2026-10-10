import * as L from './icard-C-lib.mjs'
const { sleep } = L
const w = await L.world('desk', 'ad')
const p = w.page
const parts = [], pics = []
let verdict = 'PASS'
const fail = m => { verdict = 'FAIL'; parts.push('FAIL: ' + m) }
const open = async () => ({ day: await p.locator(L.DAYWIN).count(), win: await p.locator(L.WIN).count(), q: await p.locator('[data-testid="oilconf"]:visible').count(), doc: await p.locator('[data-testid="docconf-upload"]:visible').count() })
const fmt = r => r ? `${r.date} ${r.s}-${r.e} rmk "${r.remarks}" oil ${JSON.stringify(r.oil)}` : 'GONE'
try {
  await L.fileNew(w, { iso: '2026-07-18', type: 'Duty', title: 'Behind the question', s: '09:00', e: '12:00', oil: 'yes' })
  const rec = await L.recBy(p, { title: 'Behind the question' })
  const before = fmt(rec)
  parts.push('filed and answered an own weekend Duty: ' + before)
  // day, then input, then the OIL question
  await L.openDay(w, '2026-07-18')
  const card = p.locator('[data-testid^="idy-row-"]').filter({ hasText: 'Behind the question' }).first()
  await card.locator('[data-testid="idy-open"]').click(); await L.win(p).waitFor(); await sleep(300)
  await p.fill('#inpEditRmk', 'draft kept')
  for (const how of ['Escape', 'Cancel']) {
    await p.locator('[data-testid="oil-revise"]').click(); await p.locator('[data-testid="oilconf"]').waitFor(); await sleep(300)
    const o1 = await open()
    // what is under the card's centre now, and a real click on it
    const hit = await card.evaluate(c => { const r = c.getBoundingClientRect(); const x = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return { reachesCard: !!x && c.contains(x), what: x ? (x.className || x.tagName).toString().slice(0, 40) : null } })
    pics.push(await L.pic(w, `80-${how}-1-question-over-window`))
    if (how === 'Escape') await p.keyboard.press('Escape'); else await p.locator('[data-testid="oilconf"] .abtn.ghost').first().click()
    await sleep(500)
    const o2 = await open()
    const remark = await p.locator('#inpEditRmk').inputValue().catch(() => null)
    const r = await L.recId(p, rec.iid)
    parts.push(`${how}: with the question up ${JSON.stringify(o1)}, the card behind is reachable by a click: ${hit.reachesCard} (what is there: ${hit.what}); after ${how}: ${JSON.stringify(o2)}; draft remark "${remark}"; saved ${fmt(r)}`)
    pics.push(await L.pic(w, `80-${how}-2-after`))
    if (o1.q !== 1 || o1.win !== 1 || o1.day !== 1) fail(`${how}: expected question + window + day all open: ${JSON.stringify(o1)}`)
    if (hit.reachesCard) fail(`${how}: a click can reach the covered card`)
    if (!(o2.q === 0 && o2.win === 1 && o2.day === 1)) fail(`${how}: closed more than the front question: ${JSON.stringify(o2)}`)
    if (remark !== 'draft kept') fail(`${how}: the input draft was lost (remark "${remark}")`)
    if (fmt(r) !== before) fail(`${how}: the saved input changed: ${fmt(r)}`)
  }
  // a real click on the covered card while a question is up
  await p.locator('[data-testid="oil-revise"]').click(); await p.locator('[data-testid="oilconf"]').waitFor(); await sleep(300)
  const b = await card.boundingBox()
  await p.mouse.click(b.x + 10, b.y + b.height / 2); await sleep(500)
  const o3 = await open()
  parts.push('a real mouse click on the covered day card while the question is up: ' + JSON.stringify(o3) + '; saved ' + fmt(await L.recId(p, rec.iid)))
  parts.push('(an outside click closes only the question — the popup rule — and reaches nothing behind it)')
  if (o3.win !== 1 || o3.day !== 1) fail('a click on the covered card closed the window or the day: ' + JSON.stringify(o3))
  if (fmt(await L.recId(p, rec.iid)) !== before) fail('a click on the covered card changed the input')
  await p.keyboard.press('Escape'); await sleep(300)
  await L.closeWins(p)
  // the medical question: ATT C with no document
  await L.openNew(w, '2026-07-22')
  await p.selectOption('#inpEditType', 'ATT C')
  await p.fill('#inpEditRmk', 'medical draft')
  await p.locator('#inpEditSave').click(); await sleep(600)
  const m1 = await open()
  parts.push('medical question after Save on a new ATT C with no document: ' + JSON.stringify(m1))
  pics.push(await L.pic(w, '80-medical-1-question'))
  await p.keyboard.press('Escape'); await sleep(500)
  const m2 = await open()
  const rm = await p.locator('#inpEditRmk').inputValue().catch(() => null)
  const saved = await p.evaluate(() => window.INPUTS.filter(r => r.type === 'ATT C' && r.date === 'Jul 22').length)
  parts.push(`Escape on the medical question: ${JSON.stringify(m2)}; draft remark "${rm}"; ATT C records saved: ${saved}`)
  pics.push(await L.pic(w, '80-medical-2-after-escape'))
  if (!(m1.doc && m2.doc === 0 && m2.win === 1 && m2.day === 1)) fail('medical question Escape wrong: ' + JSON.stringify([m1, m2]))
  if (saved) fail('an ATT C was saved by Escape')
  await p.locator('#inpEditSave').click(); await sleep(600)
  await p.locator('[data-testid="docconf-nodoc"]').waitFor().catch(() => {})
  const cancelBtn = p.locator('[data-testid="docconf-nodoc"]').locator('xpath=ancestor::*[contains(@class,"airpop")][1]').locator('.abtn.ghost, [aria-label="Close"], .x').first()
  parts.push('medical question buttons: ' + await p.evaluate(() => [...document.querySelectorAll('[data-testid="docconf-nodoc"]')].map(e => e.closest('.airpop, .floatwin').innerText.replace(/\s+/g, ' ').slice(0, 160)).join(' || ')))
  L.row(80, 'desktop 1440x900', 'Admin (Saber)', verdict, parts.join(' || '), pics)
} catch (e) {
  console.log('ERR', e)
  pics.push(await L.pic(w, '80-err'))
  L.row(80, 'desktop 1440x900', 'Admin (Saber)', 'NOT RUN', 'script stopped: ' + String(e).slice(0, 500) + ' || ' + parts.join(' || '), pics)
}
await L.finish(w)
