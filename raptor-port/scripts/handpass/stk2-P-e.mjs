/* Walker P re-walk: P4e-06 (Insights closes from every door after scrolling), P4e-07 (tall and short windows by height), P4e-08 (the thirteen surrounds).
   Desktop and phone (touch emulation), each scenario in a fresh copy of the Saturday world (STK_STATE). ONLY=P4e-06,... and SIZES=desktop,phone. */
import * as E from './stk2-P-elib.mjs'
const ONLY = process.env.ONLY ? process.env.ONLY.split(',') : null
const want = id => !ONLY || ONLY.includes(id)
const SIZES = process.env.SIZES ? process.env.SIZES.split(',') : ['desktop', 'phone']
const STATE = process.env.STK_STATE
const sleep = E.sleep
const PART = 'e' + (ONLY ? '-' + ONLY.join('+') : '') + '-' + SIZES.join('+')
const click = async (page, sel, o = {}) => { const l = page.locator(sel).first(); await l.waitFor({ state: 'visible', timeout: 8000 }); await l.scrollIntoViewIfNeeded(); await l.click(o); await sleep(450) }
async function openDay(page, di) {
  await E.closeBoard(page)
  if ((await page.evaluate(() => window.CURPAGE)) !== 'editsched') await E.nav(page, 'editsched')
  await page.evaluate(d => { const b = document.querySelector(`#eWeek [data-sbday="${d}"]`); const dd = b.closest('.day'); const sc = dd.parentElement; if (sc && sc.scrollWidth > sc.clientWidth) sc.scrollLeft = dd.offsetLeft - (sc.firstElementChild ? sc.firstElementChild.offsetLeft : 0) }, di)
  await sleep(300)
  await page.locator(`#eWeek [data-sbday="${di}"]:visible`).first().click()
  await page.waitForSelector('#schedBoard', { state: 'visible', timeout: 10000 }); await sleep(600)
}
const hit = loc => loc.evaluate(e => { const r = e.getBoundingClientRect(); const h = document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2); return { own: !!h && (h === e || e.contains(h)), x: Math.round(r.x), y: Math.round(r.y), right: Math.round(r.right), bottom: Math.round(r.bottom), w: Math.round(r.width), h: Math.round(r.height) } })
async function wheel(page, sel, dy) { const b = await page.locator(sel).first().boundingBox(); await page.mouse.move(b.x + b.width / 2, b.y + Math.min(b.height - 40, Math.max(40, b.height / 2))); await page.mouse.wheel(0, dy); await sleep(250) }

/* ================= P4e-06 ================= */
async function p06(phone, SZ) {
  const FULL = phone ? E.PHONE : E.DESK
  const w = await E.world({ size: FULL, phone, state: STATE }); const { page, errors } = w; const pics = [], checks = []
  const doors = phone
    ? [['View-only Sched ⋯', async () => { await E.nav(page, 'viewsched'); await click(page, '#viewSchedMore'); await click(page, '#viewSchedMoreInsights') }, async () => (await page.evaluate(() => window.CURPAGE)) === 'viewsched'],
       ['Edit Schedule ⋯', async () => { await E.nav(page, 'editsched'); await click(page, '#editSchedMore'); await click(page, '#editSchedMoreInsights') }, async () => (await page.evaluate(() => window.CURPAGE)) === 'editsched'],
       ['Board ⋯', async () => { await openDay(page, 5); await click(page, '#sbMore'); await click(page, '#sbMoreInsights') }, async () => (await page.evaluate(() => window.SBDAY)) === 5 && (await page.locator('#schedBoard:visible').count()) > 0]]
    : [['View-only Sched (direct)', async () => { await E.nav(page, 'viewsched'); await click(page, '#insightBtn') }, async () => (await page.evaluate(() => window.CURPAGE)) === 'viewsched'],
       ['Edit Schedule (direct)', async () => { await E.nav(page, 'editsched'); await click(page, '#insightBtn') }, async () => (await page.evaluate(() => window.CURPAGE)) === 'editsched'],
       ['Board (direct)', async () => { await openDay(page, 5); await click(page, '#sbInsights') }, async () => (await page.evaluate(() => window.SBDAY)) === 5 && (await page.locator('#schedBoard:visible').count()) > 0]]
  try {
    for (const [name, open, restored] of doors) {
      await open(); await page.waitForSelector('#insightClose', { state: 'visible', timeout: 8000 }); await sleep(400)
      const rowsBefore = await page.locator('#insightBody .irow').count()
      const all = page.locator('[data-insights-all]'); let shown = rowsBefore
      if (await all.count()) { await all.first().click(); await sleep(500); shown = await page.locator('#insightBody .irow').count() }
      await wheel(page, '#insightModal .modal-box', 4000)
      const r = await hit(page.locator('#insightClose'))
      const sc = await page.locator('#insightModal .modal-box').evaluate(e => ({ scroll: Math.round(e.scrollTop), max: Math.round(e.scrollHeight - e.clientHeight) }))
      pics.push(await E.pic(page, `p4e06-${SZ}-insights-bottom-${name.replace(/[^A-Za-z]+/g, '-')}`))
      await page.locator('#insightClose').click(); await sleep(500)
      const closed = (await page.locator('#insightModal:visible').count()) === 0
      const back = await restored()
      checks.push([`${name}: after Show all (${rowsBefore} -> ${shown} rows) and scrolling to the bottom (${sc.scroll}/${sc.max}) the cross is on screen and what a finger lands on; it closes and the starting surface is back`, r.own && r.y >= 0 && r.bottom <= FULL.height && closed && back && sc.scroll > 20, { cross: r, closed, back, sc }])
    }
    checks.push(['no console / page / 4xx errors', !errors.length, errors])
  } catch (e) { checks.push(['script ran to the end', false, String(e.stack).replace(/\s+/g, ' ').slice(0, 500)]); pics.push(await E.pic(page, 'p4e06-FAILED')) }
  E.judge('P4e-06-' + SZ, `${SZ}: Insights opened from each door, Show all, scrolled to the bottom, the cross pressed`, checks, pics)
  await w.browser.close()
}
/* ================= P4e-07 ================= */
async function p07(phone, SZ) {
  const FULL = phone ? E.PHONE : E.DESK
  const w = await E.world({ size: FULL, phone, state: STATE }); const { page, errors } = w; const pics = [], checks = []
  const sizes = phone ? [['390x844', E.PHONE], ['390x568', { width: 390, height: 568 }], ['844x390', { width: 844, height: 390 }]] : [['1440x900', E.DESK], ['1280x700', { width: 1280, height: 700 }]]
  const meas = async sel => page.evaluate(sel => { const e = document.querySelector(sel); if (!e) return null; const r = e.getBoundingClientRect(); return { top: Math.round(r.top), bottom: Math.round(r.bottom), h: Math.round(r.height), vh: innerHeight, gapBelow: Math.round(innerHeight - r.bottom), x: Math.round(r.left), w: Math.round(r.width) } }, sel)
  const results = []
  try {
    for (const [label, sz] of sizes) {
      await page.setViewportSize(sz); await sleep(500)
      await E.nav(page, 'viewsched')
      if (phone && sz.width < 700) { await click(page, '#viewSchedMore'); await click(page, '#viewSchedMoreInsights') } else { if (await page.locator('#insightBtn:visible').count()) await click(page, '#insightBtn'); else { await click(page, '#viewSchedMore'); await click(page, '#viewSchedMoreInsights') } }
      await page.waitForSelector('#insightClose', { state: 'visible' }); await sleep(500)
      const ins = await meas('#insightModal .modal-box'); pics.push(await E.pic(page, `p4e07-${SZ}-${label}-insights`))
      const cross = await hit(page.locator('#insightClose')); await page.locator('#insightClose').click(); await sleep(400)
      await E.nav(page, 'admin'); await page.locator('.adm-cat').nth(1).click(); await sleep(400)
      await click(page, '#admDutyTpl'); await page.waitForSelector('#tplModal', { state: 'visible' }); await sleep(500)
      const duty = await meas('#tplModal .modal-box'); pics.push(await E.pic(page, `p4e07-${SZ}-${label}-duty-templates`))
      const dclose = await hit(page.locator('#tplClose')); await page.locator('#tplClose').click(); await sleep(400)
      await click(page, '#admDayTpl'); await page.waitForSelector('#daytplModal', { state: 'visible' }); await sleep(500)
      const dayt = await meas('#daytplModal .modal-box'); pics.push(await E.pic(page, `p4e07-${SZ}-${label}-day-templates-short`))
      await page.locator('#daytplClose').click(); await sleep(400)
      results.push({ label, wide: sz.width > 820, ins, cross: cross.own, duty, dclose: dclose.own, dayt })
    }
    await page.setViewportSize(FULL)
    if (phone) {
      for (const r of results) {
        if (r.wide) { checks.push([`${r.label}: the phone rules apply to widths up to 820px; at this width (a phone on its side) the windows are centred inside the screen with their close reachable`, r.ins.top >= 0 && r.ins.bottom <= r.ins.vh + 1 && r.cross && r.dclose, { ins: r.ins, duty: r.duty, short: r.dayt }]); continue }
        const tallLeavesStrip = r.ins.top <= 40 && r.ins.bottom >= r.ins.vh - 2
        checks.push([`${r.label}: the tall Insights window runs up to a thin strip at the top (top ${r.ins.top}px of ${r.ins.vh}px, bottom edge ${r.ins.bottom}) and its cross is reachable`, tallLeavesStrip && r.cross, r.ins])
        checks.push([`${r.label}: the Duty templates window stays within the screen and its close is reachable (top ${r.duty.top}, bottom ${r.duty.bottom} of ${r.duty.vh})`, r.duty.top >= 0 && r.duty.bottom <= r.duty.vh + 1 && r.dclose, r.duty])
        checks.push([`${r.label}: the short Day templates window is only as tall as its content (${r.dayt.h}px) and sits at the bottom (gap below ${r.dayt.gapBelow}px)`, r.dayt.h < r.dayt.vh * 0.6 && r.dayt.gapBelow <= 6, r.dayt])
      }
    } else {
      for (const r of results) checks.push([`${r.label}: windows sit inside the screen with their close reachable (the phone-height rules apply to a phone only)`, r.ins.top >= 0 && r.ins.bottom <= r.ins.vh + 1 && r.cross && r.dclose, { ins: r.ins, duty: r.duty }])
    }
    checks.push(['no console / page / 4xx errors', !errors.length, errors])
  } catch (e) { checks.push(['script ran to the end', false, String(e.stack).replace(/\s+/g, ' ').slice(0, 500)]); pics.push(await E.pic(page, 'p4e07-FAILED')) }
  console.log(JSON.stringify(results))
  E.judge('P4e-07-' + SZ, `${SZ}: tall (Insights, Duty templates) and short (Day templates) windows at ${sizes.map(s => s[0]).join(', ')}`, checks, pics)
  await w.browser.close()
}
/* ================= P4e-08 ================= */
async function p08(phone, SZ) {
  const { browser, ctx, page, errors } = await E.world({ size: phone ? E.PHONE : E.DESK, phone, state: STATE })
  const rows = [], pics = []
  const click = async (sel, o = {}) => { const l = page.locator(sel).first(); await l.waitFor({ state: 'visible', timeout: 8000 }); await l.scrollIntoViewIfNeeded(); await l.click(o); await sleep(450) }
  const isOpen = id => page.evaluate(id => { const e = document.getElementById(id); if (!e) return false; const r = e.getBoundingClientRect(); const cs = getComputedStyle(e); return r.width > 0 && r.height > 0 && cs.display !== 'none' && cs.visibility !== 'hidden' && !e.hidden }, id)
  async function points(id) {
    return page.evaluate(id => {
      const root = document.getElementById(id); const rr = root.getBoundingClientRect()
      const kids = [...root.children].filter(k => { const q = k.getBoundingClientRect(); return q.width > 40 && q.height > 40 })
      const box = kids[0] || root; const b = box.getBoundingClientRect()
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
      await page.mouse.move(pt.inside.x, pt.inside.y); await page.mouse.down(); await page.mouse.move((pt.inside.x + pt.out.x) / 2, (pt.inside.y + pt.out.y) / 2, { steps: 6 }); await page.mouse.move(pt.out.x, pt.out.y, { steps: 6 }); await page.mouse.up(); await sleep(500)
      r.afterDrag = await isOpen(id)
      pics.push(await E.pic(page, `p4e08-${SZ}-${id}-after-drag`))
      const pt2 = await points(id).catch(() => pt)
      const o = (pt2 && pt2.out) || pt.out
      await page.mouse.move(o.x, o.y); await page.mouse.down(); await page.mouse.up(); await sleep(600)
      r.afterSurroundClick = await isOpen(id)
      r.status = (r.afterDrag === true && r.afterSurroundClick === false) ? 'PASS' : 'FAIL'
      if (r.afterSurroundClick) { await page.keyboard.press('Escape'); await sleep(300); if (await isOpen(id)) await close().catch(() => {}) }
    } catch (e) { r.status = 'ERROR ' + String(e.message).replace(/\s+/g, ' ').slice(0, 160); await page.keyboard.press('Escape').catch(() => {}) }
    rows.push(r); console.log(JSON.stringify(r))
  }
  const adminCfg = async () => { await E.nav(page, 'admin'); await page.locator('.adm-cat').nth(1).click(); await sleep(500) }
  await adminCfg()
  await trySurface('Duty templates', 'tplModal', () => click('#admDutyTpl'), () => click('#tplClose'))
  await trySurface('Wave templates', 'waveTplModal', () => click('#admWaveTpl'), () => click('#waveTplClose'))
  await trySurface('Day templates', 'daytplModal', () => click('#admDayTpl'), () => click('#daytplClose'))
  await E.nav(page, 'editsched')
  await trySurface('Week calendar', 'weekCal', () => phone ? click('#page-editsched .filters .filt-cal') : click('#weekSegE .wk-cal'), () => click('#weekCal .x'))
  await trySurface('Day details', 'dayPop', () => click('#eWeek [data-dayinfo]'), () => click('#dayPop .x, #dayPop button:text-is("Close")'))
  await trySurface('Insights', 'insightModal', async () => { if (phone) { await click('#editSchedMore'); await click('#editSchedMoreInsights') } else await click('#insightBtn') }, () => click('#insightClose'))
  await openDay(page, 5)
  await trySurface('Traffic', 'airpop', () => click('#sbBoard [data-air]'), () => click('#airClose'))
  await trySurface('Sort all', 'sortAllPop', async () => { if (phone) { await click('#sbMore'); await click('#sbMoreSort, #sbMore ~ * :text("Sort all"), button:has-text("Sort all")') } else await click('#sbSortAll') }, () => page.keyboard.press('Escape'))
  await trySurface('Cancellation (CX)', 'cxPop', () => click('#sbBoard button:text-is("CX")'), () => page.keyboard.press('Escape'))
  await trySurface('Saved plans', 'draftsModal', async () => { await click('#schedBoard [data-planmenu]'); if (!(await page.locator('.wavemenu :text("Manage plans")').count())) { await click('.wavemenu :text("Alt Plan")'); await sleep(800); await click('#schedBoard [data-planmenu]') } await click('.wavemenu :text("Manage plans")') }, async () => { await page.keyboard.press('Escape'); await page.locator('#draftsModal .x, #draftsModal button:text-is("Done")').first().click({ timeout: 3000 }).catch(() => {}) })
  await trySurface('Input editor', 'inpEditPop', async () => { const t = page.locator('#sbBoard [data-pitog="5"]').first(); if (await t.count()) { const tx = (await t.innerText()).toLowerCase(); if (tx.includes('show')) await t.click(); await sleep(400) } await click('#sbBoard [data-inpedit]') }, () => page.keyboard.press('Escape'))
  await E.closeBoard(page)
  await E.nav(page, 'inputs')
  await trySurface('Document viewer', 'docViewPop', async () => { await click('#inMedBtn'); await click('#medView button[title^="Tap to view"]') }, async () => { await page.keyboard.press('Escape'); await page.locator('#medClose').click({ timeout: 3000 }).catch(() => {}) })
  await page.locator('#medClose').click({ timeout: 2000 }).catch(() => {})
  if (phone) await trySurface('Drawer', 'drawer', () => click('#burger'), () => page.keyboard.press('Escape'))
  else rows.push({ name: 'Drawer', id: 'drawer', status: 'NOT DRAWN on a desktop (the drawer exists on a phone only)' })
  const pass = rows.filter(r => r.status === 'PASS').length
  const checks = rows.map(r => [`${r.name} (#${r.id}): a drag begun inside and let go on the surround leaves it open; a press on the surround closes it`, r.status === 'PASS' || /NOT DRAWN/.test(r.status), r.status === 'PASS' ? 'open after drag, closed after surround click' : r])
  checks.push(['no console / page / 4xx errors', !errors.length, errors])
  E.judge('P4e-08-' + SZ, `${SZ}: the thirteen surrounds - ${pass} of ${rows.length} behave`, checks, pics)
  E.savePart('p4e8-' + SZ, { rows })
  await browser.close()
}
for (const SZ of SIZES) {
  const phone = SZ === 'phone'
  if (want('P4e-06')) await p06(phone, SZ)
  if (want('P4e-07')) await p07(phone, SZ)
  if (want('P4e-08')) await p08(phone, SZ)
}
E.savePart(PART)
