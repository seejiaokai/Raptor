// Walker A readers (READ ONLY): what each surface says
import { MONTHS, shot, WIN, OUT } from './or-A-lib.mjs'
import { join } from 'node:path'

const FACTS = `(root) => {
  const txt = e => (e ? (e.innerText || e.textContent || '').replace(/\\s+/g, ' ').trim() : '')
  const pk = e => [...e.querySelectorAll('.puck:not(.rpuck)')].filter(x => x.offsetParent).map(x => ({ n: txt(x.querySelector('.nm')) || txt(x), cls: (x.className.match(/oilbar-(fo|ho)|oilglow|half|warn[a-z-]*|ring[a-z-]*/g) || []).join('+') }))
  return { txt: txt(root), pucks: pk(root), counters: [...root.querySelectorAll('.oilcount')].filter(x => x.offsetParent).map(x => txt(x)), vals: [...root.querySelectorAll('input, textarea')].filter(x => x.offsetParent && x.type !== 'checkbox').map(x => x.value), cls: root.className }
}`
export async function readWeek(p, di) {
  return p.evaluate(([di, F]) => {
    const f = eval(F)
    const d = document.querySelectorAll('#eWeek .day:not(.peek)')[di]
    const g = [...d.querySelectorAll('.sec-grnd .pl-row.gr-frominput')].map(r => f(r))
    const l = [...d.querySelectorAll('.sec-inp .pl-row')].map(r => f(r))
    return { ground: g, inputs: l }
  }, [di, FACTS])
}
export async function readBoard(p) {
  return p.evaluate(F => {
    const f = eval(F)
    const g = [...document.querySelectorAll('#schedBoard .sb-panel.grnd .sb-arow')].filter(r => r.offsetParent).map(r => f(r))
    const l = [...document.querySelectorAll('#schedBoard .sb-panel.pinp .sb-arow')].filter(r => r.offsetParent).map(r => f(r))
    return { ground: g, inputs: l }
  }, FACTS)
}
export async function openBoard(p, di) {
  if (await p.evaluate(() => window.SBDAY != null)) return
  await p.evaluate(() => window.go('editsched'))
  await p.locator('#eWeek .day').first().waitFor()
  const d = p.locator(`#eWeek [data-sbday="${di}"]:visible`).first()
  await d.scrollIntoViewIfNeeded(); await d.click()
  await p.waitForSelector('#schedBoard', { timeout: 6000 }); await p.waitForTimeout(500)
  const rows = await p.evaluate(() => document.querySelectorAll('#schedBoard .pinp .sb-arow, #schedBoard .pinp .sbi-row').length)
  if (!rows && await p.locator(`#schedBoard [data-pitog="${di}"]:visible`).count()) { await p.locator(`#schedBoard [data-pitog="${di}"]:visible`).first().click(); await p.waitForTimeout(400) }
}
export async function closeBoard(p) {
  if (!(await p.evaluate(() => window.SBDAY != null))) return
  const d = p.locator('#sbDone:visible').first()
  if (await d.count()) await d.click(); else await p.keyboard.press('Escape')
  await p.waitForTimeout(500)
}
export async function toWeek(p) { await closeBoard(p); await p.evaluate(() => window.go('editsched')); await p.locator('#eWeek .day').first().waitFor(); await p.waitForTimeout(300) }
export const weekDayLoc = (p, di) => p.locator('#eWeek .day:not(.peek)').nth(di)

/* OIL Earn on the board: who counts on the input's row (pucks with class `on`), plus the counter's tooltip */
export async function oilRead(p, iid) {
  return p.evaluate(iid => {
    const cs = id => (window.PEOPLE[id] && window.PEOPLE[id].cs) || id
    const seen = {}
    for (const e of document.querySelectorAll(`#schedBoard [data-oilitem="i:${iid}"][data-oilp]`)) { if (!e.offsetParent) continue; seen[cs(e.getAttribute('data-oilp'))] = e.classList.contains('on') ? (e.querySelector('.oilamt') ? e.querySelector('.oilamt').textContent : 'on') : 'off' }
    const items = [...document.querySelectorAll(`#schedBoard [data-oilitem="i:${iid}"]:not([data-oilp])`)].filter(e => e.offsetParent).map(e => (/\bon\b/.test(e.className) ? 'on' : 'off') + ':' + (e.getAttribute('title') || '').slice(0, 80))
    const cnt = [...document.querySelectorAll(`#schedBoard [data-oilsent="i:${iid}"]`)].filter(e => e.offsetParent).map(e => e.textContent.trim() + ' | ' + (e.getAttribute('title') || ''))
    return { named: seen, items, counters: cnt }
  }, iid)
}
export async function oilOn(p) {
  const on = await p.evaluate(() => !!document.querySelector('#schedBoard [data-oilitem]'))
  if (!on) { await p.locator('#sbOil').click(); await p.waitForTimeout(800) }
}
export async function oilOff(p) {
  const on = await p.evaluate(() => !!document.querySelector('#schedBoard [data-oilitem]'))
  if (on) { await p.locator('#sbOil').click(); await p.waitForTimeout(600) }
}

/* the Inputs pages' reading of one input on a day: month's cell text/bar, the opened day's card, the List's row */
export async function readInputsPage(p, iso, iid, { shots = null } = {}) {
  await closeBoard(p)
  await p.evaluate(() => window.go('inputs'))
  await p.locator('#inpCal, #inListBtn').first().waitFor()
  if (await p.locator('#inCalBtn[aria-pressed="false"]').count()) { await p.locator('#inCalBtn').click(); await p.waitForTimeout(250) }
  const [yy, mm] = iso.split('-').map(Number)
  const at = async () => { const [m, y] = (await p.locator('#inpCal .ic-mon').textContent()).trim().toLowerCase().split(/\s+/); return +y * 12 + MONTHS.findIndex(x => x.startsWith(m)) }
  let d = yy * 12 + (mm - 1) - await at()
  for (; d > 0; d--) await p.locator('#icNext').click()
  for (; d < 0; d++) await p.locator('#icPrev').click()
  await p.waitForSelector(`[data-icday="${iso}"]`)
  const out = {}
  out.cell = await p.evaluate(iid => ({ bars: [...document.querySelectorAll('#inpCal .ib-bar[data-iid]')].filter(e => e.getAttribute('data-iid').includes(iid) || e.getAttribute('data-iid') === iid).map(e => ({ txt: (e.innerText || '').replace(/\s+/g, ' ').trim(), title: e.getAttribute('title'), cls: e.className, opacity: getComputedStyle(e).opacity, deco: getComputedStyle(e).textDecorationLine })) }), iid)
  if (shots) { const bx = await p.locator(`[data-icday="${iso}"]`).boundingBox(); await p.screenshot({ path: join(OUT, shots + '-month.png'), clip: { x: Math.max(0, bx.x - 120), y: Math.max(0, bx.y - 4), width: Math.min(1440 - Math.max(0, bx.x - 120), bx.width + 240), height: bx.height + 8 } }) }
  await p.locator(`[data-icday="${iso}"]`).focus(); await p.keyboard.press('Enter')
  await p.waitForSelector('[data-testid="win-inputsday"]'); await p.waitForTimeout(350)
  out.card = await p.evaluate(iid => { const c = document.querySelector(`[data-testid="win-inputsday"] [data-popiid="${iid}"]`); return c ? { txt: (c.innerText || '').replace(/\s+/g, ' ').trim(), cls: c.className } : null }, iid)
  out.dayAll = await p.evaluate(() => (document.querySelector('[data-testid="win-inputsday"]').innerText || '').replace(/\s+/g, ' ').trim().slice(0, 500))
  if (shots) await p.locator('[data-testid="win-inputsday"]').screenshot({ path: join(OUT, shots + '-card.png') })
  await p.locator('[data-testid="win-inputsday-x"]').click().catch(async () => { await p.keyboard.press('Escape') })
  await p.waitForTimeout(250)
  await p.locator('#inListBtn').click(); await p.waitForTimeout(500)
  if (!(await p.locator('#inRangeAll').count())) { await p.locator('#inRangeBtn').click(); await p.waitForTimeout(250) }
  if (await p.locator('#inRangeAll').count()) { await p.locator('#inRangeAll').click(); await p.waitForTimeout(400) }
  out.list = await p.evaluate(iid => { const els = [...document.querySelectorAll(`#inBody [data-iid="${iid}"], #inList [data-iid="${iid}"]`)].filter(e => e.offsetParent); return els.map(c => ({ txt: (c.innerText || '').replace(/\s+/g, ' ').trim(), cls: c.className.slice(0, 80) })) }, iid)
  if (shots) { const row = p.locator(`#inBody [data-iid="${iid}"]`).first(); if (await row.count()) await row.screenshot({ path: join(OUT, shots + '-list.png') }) }
  await p.locator('#inCalBtn').click(); await p.waitForTimeout(300)
  return out
}
export const winSay = async p => ((await p.locator(WIN).count()) ? (await p.locator(WIN).innerText()).replace(/\s+/g, ' ').slice(0, 900) : null)
