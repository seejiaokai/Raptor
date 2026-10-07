/* Walker E — one picture of EVERY screen and window, fresh world, admin. HP_PHONE=1 for 390x844. */
import * as E from './stk-E-lib.mjs'
const phone = !!process.env.HP_PHONE
const SZ = phone ? 'phone' : 'desktop'
const only = process.env.ONLY ? process.env.ONLY.split(',') : null
const { browser, page, errors } = await E.world({ size: phone ? E.PHONE : E.DESK, phone, who: null })
const LEDGER = []
const slug = s => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
const sleep = E.sleep
async function S(screen, fn, o = {}) {
  if (only && !only.some(k => screen.toLowerCase().includes(k))) return
  let note = ''
  try { const r = await fn(); if (typeof r === 'string') note = r } catch (e) { note = 'COULD NOT REACH: ' + String(e.message || e).split('\n')[0].slice(0, 200) }
  await sleep(250)
  const f = await E.pic(page, `${only ? 'r2-' : ''}${SZ}-${slug(screen)}`)
  const sw = await E.sideways(page)
  LEDGER.push({ screen, size: SZ, file: f, note, docSideways: sw.over ? `document scrolls sideways ${sw.sw}>${sw.cw}` : '' })
  console.log('PIC', f, note, sw.over ? 'SIDEWAYS' : '')
}
const click = async (sel, o = {}) => { const l = page.locator(sel).first(); await l.waitFor({ state: 'visible', timeout: 8000 }); await l.scrollIntoViewIfNeeded(); await l.click(o); await sleep(450) }
const sclick = (sel) => click(sel).catch(() => {})
const closeAny = async () => {
  await page.keyboard.press('Escape'); await sleep(250)
  for (const sel of ['.win-x:visible', 'button:text-is("Close"):visible', '#daytplClose:visible', '#insightClose:visible']) { const l = page.locator(sel).first(); if (await l.count()) { await l.click().catch(() => {}); await sleep(300); break } }
}
const present = async sel => (await page.locator(sel + ':visible').count()) > 0

/* ---- the sign-in card (before sign-in) ---- */
await S('Sign-in card', async () => { await page.waitForSelector('#luser', { state: 'visible' }) })
await E.signIn(page, 'a')

await S('View-only Sched', async () => { await E.nav(page, 'viewsched') })
if (phone) {
  await S('Phone drawer', async () => { await page.locator('#burger').click(); await sleep(500) })
  await closeAny(); if (await present('#drawer.on, #drawer.open')) await page.locator('#drawerClose, .drawer-x').first().click().catch(() => {})
  await page.mouse.click(380, 400).catch(() => {}); await sleep(300)
  await E.nav(page, 'viewsched')
  await S('View-only Sched - more menu', async () => { await click('#viewSchedMore') })
  await closeAny()
  await S('Insights (from View-only more menu)', async () => { if (!(await present('#viewSchedMoreInsights'))) await click('#viewSchedMore'); await click('#viewSchedMoreInsights'); await page.waitForSelector('#insightClose', { state: 'visible' }) })
  await sclick('#insightClose')
} else {
  await S('Insights', async () => { await click('#insightBtn'); await page.waitForSelector('#insightClose', { state: 'visible' }) })
  await sclick('#insightClose')
}
await S('Week calendar', async () => {
  if (phone) { const c = page.locator('.wknav-mbtn.filt-cal:visible').first(); if (await c.count()) await c.click(); else throw new Error('no week-calendar door visible on the phone View-only page') }
  else await click('#weekSeg .wk-cal')
  await page.waitForSelector('#weekCal', { state: 'visible' })
})
if (await present('#weekCal .x')) await click('#weekCal .x')

await S('Edit Schedule', async () => { await E.nav(page, 'editsched') })
await S('Amendments box', async () => { await page.locator('#alPanel').scrollIntoViewIfNeeded(); await sleep(300) })
await page.evaluate(() => window.scrollTo(0, 0))
if (phone) {
  await S('Edit Schedule - more menu', async () => { await click('#editSchedMore') })
  await closeAny()
}
await S('Saved plans menu', async () => { await page.evaluate(() => window.scrollTo(0, 0)); await click('#eWeek [data-planmenu]'); })
await closeAny(); await page.mouse.click(5, 5).catch(() => {}); await sleep(300)
await S('Day details window', async () => { await click('#eWeek [data-dayinfo]'); })
await closeAny(); await sleep(300)
await S('Day template window', async () => { await click('#eWeek [data-daytplopen]') })
await closeAny(); await sleep(300)

/* ---- the Scheduler Board, Wednesday ---- */
await S('Scheduler Board', async () => { await E.nav(page, 'editsched'); await click('#eWeek [data-sbday="2"]'); await page.waitForSelector('#schedBoard', { state: 'visible' }); await sleep(500) })
if (phone) {
  await S('Scheduler Board - more menu', async () => { await click('#sbMore') })
  await S('Scheduler Board - Desktop layout', async () => { if (!(await present('#sbMoreWide'))) await click('#sbMore'); await click('#sbMoreWide'); await sleep(600) })
  await S('Scheduler Board - Desktop layout - crew list', async () => { await click('#sbMore'); const c = page.locator('#sbCrew:visible, #sbMore ~ * [data-sbcrew]:visible').first(); await closeAny(); return 'menu closed again' })
  await S('Scheduler Board - Insights (Board more)', async () => { await click('#sbMore'); await click('#sbMoreInsights'); await page.waitForSelector('#insightClose', { state: 'visible' }) })
  await sclick('#insightClose')
} else {
  await S('Scheduler Board - Insights', async () => { await click('#sbInsights'); await page.waitForSelector('#insightClose', { state: 'visible' }) })
  await sclick('#insightClose')
}
await S('Changes window', async () => { await click('#sbHist'); await page.waitForSelector('.chgwin', { state: 'visible' }) })
await sclick('.chgwin .win-x')
await S('Traffic window', async () => { await click('#sbBoard [data-air]'); await page.waitForSelector('#airpop', { state: 'visible' }) })
await sclick('#airClose')
await S('Board saved plans menu', async () => { await click('#schedBoard [data-planmenu]') })
await closeAny(); await page.mouse.click(5, 5).catch(() => {})
await S('Board OIL mode', async () => { const d = phone ? '#sbBoard [data-oilmode="2"]' : '#sbOil'; if (phone && !(await present(d))) await click('#sbMore'); await click(d); await sleep(500) })
{ const d = phone ? '#sbBoard [data-oilmode="2"]' : '#sbOil'; if (await present(d)) await click(d); else { await click('#sbMore').catch(() => {}); await click('#sbMoreOil').catch(() => {}) } }
await S('Board highlight', async () => { if (!(await present('#schedBoard'))) { await E.nav(page, 'editsched'); await click('#eWeek [data-sbday="2"]'); await page.waitForSelector('#schedBoard', { state: 'visible' }) } if (phone) { await click('#sbMore'); await click('#sbHl') } else await click('#schedBoard [data-hlgrp-btn]') })
await closeAny()
await E.closeBoard(page)

/* ---- Inputs ---- */
await S('Inputs list and form', async () => { await E.nav(page, 'inputs') })
await S('Inputs calendar', async () => { await click('#inCalBtn'); await page.waitForSelector('#inpCal', { state: 'visible' }) })
await sclick('#icClose').catch(() => {})
await S('Medical view', async () => { await click('#inMedBtn'); await page.waitForSelector('#medView', { state: 'visible' }) })
await sclick('#medClose').catch(() => {})
await S('Inputs period picker', async () => { await click('#inRangeBtn') })
await sclick('#inRangeAll').catch(() => {})
await S('Quals', async () => { await E.nav(page, 'quals') })
await S('Logic', async () => { await E.nav(page, 'logic') })
await S('Logic - scrolled', async () => { await page.evaluate(() => { document.querySelector('#lgBody')?.scrollIntoView(); window.scrollTo(0, 1500) }); await sleep(400) })

/* ---- Leave War ---- */
await S('Leave War grid', async () => { await E.nav(page, 'leavewar'); await sleep(800) })
await S('Leave War one-day sheet', async () => {
  await E.nav(page, 'leavewar'); await sleep(900)
  const pt = await page.evaluate((MINL) => { const cs = [...document.querySelectorAll('[data-testid^="cell-"]')].filter(c => { const r = c.getBoundingClientRect(); return r.width > 4 && r.left > MINL && r.right < innerWidth - 10 && r.top > 120 && r.bottom < innerHeight - 10 }); const c = cs[Math.floor(cs.length / 2)] || cs[0]; if (!c) return null; const r = c.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2, id: c.dataset.testid } }, phone ? 115 : 470)
  if (!pt) throw new Error('no visible grid cell'); await page.mouse.click(pt.x, pt.y); await sleep(800); return 'clicked ' + pt.id
})
await closeAny(); await sleep(300)
await S('Leave War Settings', async () => { await page.locator('[data-testid]', { hasText: '⚙' }).first().click(); await sleep(600) })
await closeAny(); await sleep(300)
await S('Leave War OIL tracker', async () => { await page.locator('[data-testid]', { hasText: 'OIL tracker' }).first().click(); await sleep(900) })
await closeAny(); await sleep(300)

/* ---- Tracker ---- */
await S('Tracker Flow', async () => { await E.nav(page, 'tracker'); await page.waitForSelector('#flowSvg .ball', { timeout: 20000 }); await sleep(2500) })
await S('Tracker Details', async () => { await click('#detailsBtn'); await sleep(400) })
await sclick('#detailsBtn').catch(() => {})
await S('Tracker Edit chart layout', async () => { await click('#sylMenuBtn'); await click('#arrangeBtn'); await sleep(600) })
await page.keyboard.press('Escape').catch(() => {})

/* ---- Help, Admin ---- */
await S('Help', async () => { await E.nav(page, 'help') })
await S('Admin Users', async () => { await E.nav(page, 'admin'); if (phone) await click('.adm-cat >> nth=0'); else await click('.adm-cat >> nth=0') })
await S('Admin Squadron config', async () => { if (phone) await click('.adm-back'); await click('.adm-cat >> nth=1'); await sleep(400) })
await S('Duty template window', async () => { await click('#admDutyTpl'); await page.waitForSelector('#tplModal', { state: 'visible' }) })
await sclick('#tplClose')
await S('Day template window (Admin)', async () => { await click('#admDayTpl'); await page.waitForSelector('#daytplModal', { state: 'visible' }) })
await sclick('#daytplClose')
await S('Wave template window', async () => { await click('#admWaveTpl'); await page.waitForSelector('#waveTplModal', { state: 'visible' }) })
await sclick('#waveTplClose')
await S('Admin Data', async () => { if (phone) await click('.adm-back'); await click('.adm-cat >> nth=2'); await sleep(400) })

E.savePart('screens-' + SZ, { ledger: LEDGER, errors })
console.log('ERRORS', errors)
await browser.close()
