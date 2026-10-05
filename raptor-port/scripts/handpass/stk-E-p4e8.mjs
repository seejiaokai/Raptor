/* Walker E — P4e-08: all thirteen window surrounds tell a drag that began INSIDE the window from a press on the surround. HP_PHONE=1 for the phone. */
import * as E from './stk-E-lib.mjs'
const phone = !!process.env.HP_PHONE
const SZ = phone ? 'phone' : 'desktop'
const STATE = process.env.E_STATE_DIR + `/world-${SZ}.json`
const sleep = E.sleep
const { browser, ctx, page, errors } = await E.world({ size: phone ? E.PHONE : E.DESK, phone, state: STATE })
const rows = []
const pics = []
const click = async (sel, o = {}) => { const l = page.locator(sel).first(); await l.waitFor({ state: 'visible', timeout: 8000 }); await l.scrollIntoViewIfNeeded(); await l.click(o); await sleep(450) }
async function openDay(di) {
  await E.closeBoard(page)
  if ((await page.evaluate(() => window.CURPAGE)) !== 'editsched') await E.nav(page, 'editsched')
  await page.evaluate(d => { const b = document.querySelector(`#eWeek [data-sbday="${d}"]`); const dd = b.closest('.day'); const sc = dd.parentElement; if (sc && sc.scrollWidth > sc.clientWidth) sc.scrollLeft = dd.offsetLeft - (sc.firstElementChild ? sc.firstElementChild.offsetLeft : 0) }, di)
  await sleep(300)
  await page.locator(`#eWeek [data-sbday="${di}"]:visible`).first().click()
  await page.waitForSelector('#schedBoard', { state: 'visible', timeout: 10000 }); await sleep(600)
}
const isOpen = id => page.evaluate(id => { const e = document.getElementById(id); if (!e) return false; const r = e.getBoundingClientRect(); const cs = getComputedStyle(e); return r.width > 0 && r.height > 0 && cs.display !== 'none' && cs.visibility !== 'hidden' && !e.hidden }, id)
/* a point inside the window's box and a point on the surround (inside the root, outside the box) */
async function points(id) {
  return page.evaluate(id => {
    const root = document.getElementById(id); const rr = root.getBoundingClientRect()
    const kids = [...root.children].filter(k => { const q = k.getBoundingClientRect(); return q.width > 40 && q.height > 40 })
    const box = kids[0] || root; const b = box.getBoundingClientRect()
    // inside: a spot on the box's own text, away from buttons
    let inside = { x: b.left + b.width / 2, y: b.top + Math.min(40, b.height / 2) }
    const txt = [...box.querySelectorAll('input, textarea, p, div, span, h2, b')].find(e => { const q = e.getBoundingClientRect(); return q.width > 60 && q.height > 10 && q.top > b.top && q.bottom < b.bottom && !e.closest('button') })
    if (txt) { const q = txt.getBoundingClientRect(); inside = { x: q.left + Math.min(q.width / 2, 40), y: q.top + q.height / 2 } }
    const cands = [[rr.right - 12, rr.bottom - 12], [rr.left + 12, rr.bottom - 12], [rr.right - 12, rr.top + 12], [rr.left + 12, rr.top + 12], [rr.left + 12, (rr.top + rr.bottom) / 2], [rr.right - 12, (rr.top + rr.bottom) / 2]]
    let out = null
    for (const [x, y] of cands) { if (x < 0 || y < 0 || x > innerWidth || y > innerHeight) continue; const inBox = x >= b.left - 2 && x <= b.right + 2 && y >= b.top - 2 && y <= b.bottom + 2; const h = document.elementFromPoint(x, y); if (!inBox && h && (h === root || h.id === id)) { out = { x, y }; break } }
    return { inside, out, box: [b.left, b.top, b.width, b.height].map(Math.round), root: [rr.left, rr.top, rr.width, rr.height].map(Math.round) }
  }, id)
}
async function trySurface(name, id, open, close) {
  const r = { name, id, status: '' }
  try {
    await open(); await sleep(700)
    if (!(await isOpen(id))) { r.status = 'NOT OPENED'; rows.push(r); return }
    const pt = await points(id)
    if (!pt.out) { r.status = 'NO SURROUND POINT (the window fills the screen)'; r.pt = pt; rows.push(r); pics.push(await E.pic(page, `p4e08-${SZ}-${id}-open`)); await close().catch(() => {}); return }
    pics.push(await E.pic(page, `p4e08-${SZ}-${id}-open`))
    // press INSIDE the window, drag out onto the surround, release
    await page.mouse.move(pt.inside.x, pt.inside.y); await page.mouse.down(); await page.mouse.move((pt.inside.x + pt.out.x) / 2, (pt.inside.y + pt.out.y) / 2, { steps: 6 }); await page.mouse.move(pt.out.x, pt.out.y, { steps: 6 }); await page.mouse.up(); await sleep(500)
    r.afterDrag = await isOpen(id)
    pics.push(await E.pic(page, `p4e08-${SZ}-${id}-after-drag`))
    // a separate press and release on the surround
    const pt2 = await points(id).catch(() => pt)
    const o = (pt2 && pt2.out) || pt.out
    await page.mouse.move(o.x, o.y); await page.mouse.down(); await page.mouse.up(); await sleep(600)
    r.afterSurroundClick = await isOpen(id)
    r.status = (r.afterDrag === true && r.afterSurroundClick === false) ? 'PASS' : 'FAIL'
    if (r.afterSurroundClick) { await page.keyboard.press('Escape'); await sleep(300); if (await isOpen(id)) await close().catch(() => {}) }
  } catch (e) { r.status = 'ERROR ' + String(e.message).replace(/\s+/g, ' ').slice(0, 160); await page.keyboard.press('Escape').catch(() => {}) }
  rows.push(r); console.log(JSON.stringify(r))
}
const closeBoardAnd = async fn => { await E.closeBoard(page); await fn() }
const adminCfg = async () => { await E.nav(page, 'admin'); await page.locator('.adm-cat').nth(1).click(); await sleep(500) }

// 1-3: template windows from Admin
await adminCfg()
await trySurface('Duty templates', 'tplModal', () => click('#admDutyTpl'), () => click('#tplClose'))
await trySurface('Wave templates', 'waveTplModal', () => click('#admWaveTpl'), () => click('#waveTplClose'))
await trySurface('Day templates', 'daytplModal', () => click('#admDayTpl'), () => click('#daytplClose'))
// 12: week calendar
await E.nav(page, 'editsched')
await trySurface('Week calendar', 'weekCal', () => phone ? click('#page-editsched .filters .filt-cal') : click('#weekSegE .wk-cal'), () => click('#weekCal .x'))
// 7: day details
await trySurface('Day details', 'dayPop', () => click('#eWeek [data-dayinfo]'), () => click('#dayPop .x, #dayPop button:text-is("Close")'))
// 9: Insights
await trySurface('Insights', 'insightModal', async () => { if (phone) { await click('#editSchedMore'); await click('#editSchedMoreInsights') } else await click('#insightBtn') }, () => click('#insightClose'))
// board surfaces
await openDay(5)
await trySurface('Traffic', 'airpop', () => click('#sbBoard [data-air]'), () => click('#airClose'))
await trySurface('Sort all', 'sortAllPop', async () => { if (phone) { await click('#sbMore'); await click('#sbMoreSort, #sbMore ~ * :text("Sort all"), button:has-text("Sort all")') } else await click('#sbSortAll') }, () => page.keyboard.press('Escape'))
await trySurface('Cancellation (CX)', 'cxPop', () => click('#sbBoard button:text-is("CX")'), () => page.keyboard.press('Escape'))
await trySurface('Saved plans', 'draftsModal', async () => { await click('#schedBoard [data-planmenu]'); if (!(await page.locator('.wavemenu :text("Manage plans")').count())) { await click('.wavemenu :text("Alt Plan")'); await sleep(800); await click('#schedBoard [data-planmenu]') } await click('.wavemenu :text("Manage plans")') }, async () => { await page.keyboard.press('Escape'); await page.locator('#draftsModal .x, #draftsModal button:text-is("Done")').first().click({ timeout: 3000 }).catch(() => {}) })
await trySurface('Input editor', 'inpEditPop', async () => { const t = page.locator('#sbBoard [data-pitog="5"]').first(); if (await t.count()) { const tx = (await t.innerText()).toLowerCase(); if (tx.includes('show')) await t.click(); await sleep(400) } await click('#sbBoard [data-inpedit]') }, () => page.keyboard.press('Escape'))
await E.closeBoard(page)
// 5: document viewer (Medical card)
await E.nav(page, 'inputs')
await trySurface('Document viewer', 'docViewPop', async () => { await click('#inMedBtn'); await click('#medView button[title^="Tap to view"]') }, async () => { await page.keyboard.press('Escape'); await page.locator('#medClose').click({ timeout: 3000 }).catch(() => {}) })
await page.locator('#medClose').click({ timeout: 2000 }).catch(() => {})
// 13: the phone drawer
if (phone) await trySurface('Drawer', 'drawer', () => click('#burger'), () => page.keyboard.press('Escape'))
else rows.push({ name: 'Drawer', id: 'drawer', status: 'NOT DRAWN on a desktop (the drawer exists on a phone only)' })
const pass = rows.filter(r => r.status === 'PASS').length
const checks = rows.map(r => [`${r.name} (#${r.id}): a drag begun inside and let go on the surround leaves it open; a press on the surround closes it`, r.status === 'PASS' || /NOT DRAWN/.test(r.status), r.status === 'PASS' ? 'open after drag, closed after surround click' : r])
checks.push(['no console / page / 4xx errors', !errors.length, errors])
E.judge('P4e-08', `${SZ}: the thirteen surrounds - ${pass} of ${rows.length} behave`, checks, pics)
E.savePart('p4e8-' + SZ, { rows })
await browser.close()
