// Walker C — reading an input on every surface that shows a remark (scenarios 43-48)
import * as L from './ivet-C-lib.mjs'

export const stored = (p, iid) => p.evaluate(iid => { const r = window.INPUTS.find(x => x.iid === iid); return r ? { remarks: r.remarks, date: r.date, endDate: r.endDate } : null }, iid)

/* the phone: the List's card and the opened day's card for each day asked; tag is a picture-name stem */
export async function readPhone(page, it, tag) {
  await L.toList(page, true)
  await page.evaluate(() => window.scrollTo(0, 0))
  await page.locator(`[data-testid="inl-row-${it.iid}"], [data-testid="inl-row-${it.rowIid || it.iid}"]`).first().scrollIntoViewIfNeeded().catch(() => {})
  const card = await L.phoneCard(page, it.iid)
  const nCards = await page.evaluate(iid => { const want = window.INPUTS.find(r => r.iid === iid); const ids = want.grp ? window.INPUTS.filter(r => r.grp === want.grp).map(r => r.iid) : [iid]; return ids.reduce((n, i) => n + document.querySelectorAll(`[data-testid="inl-row-${i}"]`).length, 0) }, it.iid)
  const pics = [await L.shot(page, `${tag}-phone-list`)]
  const days = {}
  for (const iso of it.days || []) {
    await L.openDay(page, iso, true)
    days[iso] = await L.dayCard(page, it.iid)
    pics.push(await L.shot(page, `${tag}-phone-day-${iso.slice(5)}`))
    await page.keyboard.press('Escape'); await page.waitForTimeout(150)
  }
  return { card, nCards, days, pics }
}
/* the desktop: the table's Remarks cell, the window's Remarks box, and the opened day's card */
export async function readDesk(page, it, tag) {
  await L.toList(page, false)
  await page.fill('#inFSearch', it.search || '').catch(() => {})
  await page.waitForTimeout(250)
  const row = await L.deskRow(page, it.iid)
  const pics = []
  let win = null
  if (row) {
    const trIid = await page.evaluate(iid => { const want = window.INPUTS.find(r => r.iid === iid); const tr = [...document.querySelectorAll('#inBody tr[data-iid]')].find(t => { const r = window.INPUTS.find(x => x.iid === t.getAttribute('data-iid')); return r && (r.iid === iid || (want.grp && r.grp === want.grp)) }); return tr?.getAttribute('data-iid') }, it.iid)
    const el = page.locator(`#inBody tr[data-iid="${trIid}"]`)
    await el.scrollIntoViewIfNeeded()
    pics.push(await L.shot(page, `${tag}-desk-row`))
    await page.locator(`#inBody tr[data-iid="${trIid}"] [data-testid="in-open"]`).click(); await page.locator(L.WIN).waitFor()
    win = await page.inputValue('#inpEditRmk')
    pics.push(await L.shot(page, `${tag}-desk-window`))
    await page.locator('#inpEditCancel').click(); await page.waitForTimeout(150)
  }
  await page.fill('#inFSearch', '').catch(() => {})
  const days = {}
  for (const iso of it.days || []) {
    await L.openDay(page, iso, false)
    days[iso] = await L.dayCard(page, it.iid)
    pics.push(await L.shot(page, `${tag}-desk-day-${iso.slice(5)}`))
    await page.keyboard.press('Escape'); await page.waitForTimeout(150)
  }
  return { row, win, days, pics }
}
export const norm = s => (s ?? '').replace(/\s+/g, ' ').trim()
