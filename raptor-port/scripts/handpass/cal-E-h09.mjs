// H-09 — the three tabs, and arriving on the page. Sizes desk / phone / short; roles ad / us.
import { launch, world, toInputs, shot, press, saveRows, big, makeInput, closeDay } from './cal-E-lib.mjs'
const size = process.argv[2] || 'desk'
const who = process.argv[3] || 'ad'
const b = await launch()
const log = []
const L = (...a) => { log.push(a.join(' ')); console.log(...a) }
const res = {}
const w = await world(b, size, who); const p = w.page
const N = n => `h09-${size}-${who}-${n}`
const rect = sel => p.evaluate(sel => { const e = document.querySelector(sel); if (!e) return null; const r = e.getBoundingClientRect(); return { top: Math.round(r.top), h: Math.round(r.height), left: Math.round(r.left), right: Math.round(r.right), vis: r.width > 0 && r.height > 0 } }, sel)
const nav = async () => {
  // the real navigation: a desktop top-bar button, or the phone's menu
  if (big(size)) { await p.locator('button[data-page="inputs"], [data-page="inputs"]').first().click() }
  else {
    await p.locator('#burger').click(); await p.waitForTimeout(500)
    await shot(p, N('0b-menu'))
    await p.locator('#drawer a[data-page="inputs"]').tap()
  }
  await p.waitForTimeout(800)
}
// start on the schedule page, scrolled down
await p.evaluate(() => scrollTo(0, 400)); await p.waitForTimeout(200)
L('before: page', await p.evaluate(() => window.CURPAGE), 'scrollY', await p.evaluate(() => scrollY))
await shot(p, N('0-before'))
try { await nav() } catch (e) { L('NAV FAILED', String(e).slice(0, 200)); await p.evaluate(() => window.go('inputs')); await p.waitForTimeout(800) }
res.arrive = { page: await p.evaluate(() => window.CURPAGE), scrollY: await p.evaluate(() => scrollY) }
L('arrived: page', res.arrive.page, 'scrollY', res.arrive.scrollY)
await shot(p, N('1-arrived'))
const tabsInfo = async () => {
  const t = await Promise.all(['#inMemberMode', '#inSansMode', '#inMedBtn'].map(rect))
  const tools = await Promise.all(['#icPrev', '#inCalBtn', '#inListBtn', '#inFiltersBtn', '#inFPerson', '[data-testid="in-gear"]'].map(rect))
  const sel = await p.evaluate(() => ['#inMemberMode', '#inSansMode', '#inMedBtn'].map(s => document.querySelector(s).getAttribute('aria-selected')))
  return { tabs: t, tools: tools.filter(x => x && x.vis), sel }
}
const ti = await tabsInfo(); res.tabsInfo = ti
const mids = ti.tabs.map(t => t.top + t.h / 2)
L('tabs: tops/heights', JSON.stringify(ti.tabs.map(t => [t.top, t.h])), 'one row?', Math.max(...mids) - Math.min(...mids) <= 1, '| tallest tool height', Math.max(...ti.tools.map(t => t.h)), '| tab height', ti.tabs[0].h, '| selected', JSON.stringify(ti.sel))
res.tabHeight = ti.tabs[0].h; res.toolHeight = Math.max(...ti.tools.map(t => t.h)); res.oneRow = Math.max(...mids) - Math.min(...mids) <= 1
const present = async () => p.evaluate(() => ({ cal: !!document.querySelector('#inCalBtn')?.offsetParent, list: !!document.querySelector('#inListBtn')?.offsetParent, filters: !!(document.querySelector('#inFPerson')?.offsetParent || document.querySelector('#inFiltersBtn')?.offsetParent), month: !!document.querySelector('#inpCal .ic-mon')?.offsetParent, sansMonth: !!document.querySelector('#sansCal, [data-testid^="sc-"], .sansmonth')?.offsetParent }))
const noSide = () => p.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 0.5)
const boxScroll = () => p.evaluate(() => {
  // any element that is a scroll container with content beyond its own height, inside the page, that is large (month-like)
  const bad = []
  for (const e of document.querySelectorAll('#page-inputs *, #inpCal, #inpCal *')) {
    const cs = getComputedStyle(e); if (!/(auto|scroll)/.test(cs.overflowY)) continue
    const r = e.getBoundingClientRect(); if (r.height < 120 || !e.offsetParent) continue
    if (e.scrollHeight - e.clientHeight > 2) bad.push((e.id || e.className.toString().slice(0, 30)) + ':' + Math.round(e.scrollHeight - e.clientHeight))
  }
  return bad
})
L('Inputs tab (Calendar): present', JSON.stringify(await present()), '| sideways scroll ok', await noSide(), '| inner scroll boxes', JSON.stringify(await boxScroll()))
res.inputsCal = { present: await present(), noSide: await noSide(), boxes: await boxScroll() }
// step Inputs -> SANS -> Medical -> Inputs
for (const [name, sel] of [['SANS', '#inSansMode'], ['Medical', '#inMedBtn'], ['Inputs', '#inMemberMode']]) {
  await press(p, size, p.locator(sel)); await p.waitForTimeout(700)
  const ti2 = await tabsInfo(); const pr = await present()
  const mids2 = ti2.tabs.map(t => t.top + t.h / 2)
  L('tab', name, '| selected', JSON.stringify(ti2.sel), '| one row', Math.max(...mids2) - Math.min(...mids2) <= 1, '| tab tops', JSON.stringify(ti2.tabs.map(t => t.top)), '| present', JSON.stringify(pr), '| scrollY', await p.evaluate(() => scrollY), '| side ok', await noSide(), '| boxes', JSON.stringify(await boxScroll()))
  res['tab ' + name] = { sel: ti2.sel, pr, tops: ti2.tabs.map(t => t.top), side: await noSide(), boxes: await boxScroll(), scrollY: await p.evaluate(() => scrollY) }
  await shot(p, N('2-tab-' + name))
}
// Calendar <-> List on the Inputs tab
await press(p, size, p.locator('#inListBtn')); await p.waitForTimeout(500)
L('List: present', JSON.stringify(await present()), 'list table visible', await p.locator('#intbl').isVisible())
await shot(p, N('3-list'))
await press(p, size, p.locator('#inCalBtn')); await p.waitForTimeout(500)
L('Calendar again: present', JSON.stringify(await present()))
// reload on each tab — the PLAIN address, after one write (a fresh-flagged world forgets everything on reload)
await w.ctx.close()
for (const [name, sel] of [['Inputs', '#inMemberMode'], ['SANS', '#inSansMode'], ['Medical', '#inMedBtn']]) {
  const w2 = await world(b, size, who, { plain: true }); const q = w2.page
  await toInputs(q)
  // one write through the app: an input on a date in the current month
  const before = await q.evaluate(() => window.INPUTS.length)
  await makeInput(q, size, '2026-10-22', { type: 'LL', remarks: 'reload fixture' }).catch(e => L('  write failed', String(e).slice(0, 120)))
  L('plain world', name, ': records', before, '->', await q.evaluate(() => window.INPUTS.length))
  await closeDay(q)
  await press(q, size, q.locator(sel)); await q.waitForTimeout(500)
  await q.reload(); await q.waitForTimeout(2000)
  const st = await q.evaluate(() => ({ page: window.CURPAGE, loginShown: !!document.querySelector('#loginForm')?.offsetParent, selected: ['#inMemberMode', '#inSansMode', '#inMedBtn'].map(s => document.querySelector(s)?.getAttribute('aria-selected')), scrollY: scrollY, hasFixture: !!window.INPUTS?.find(x => x.remarks === 'reload fixture') }))
  L('reload on tab', name, '->', JSON.stringify(st)); res['reload ' + name] = st
  await shot(q, N('4-reload-' + name))
  if (st.loginShown) {
    await q.fill('#luser', who === 'ad' ? 'ad' : 'us'); await q.fill('#lpass', who === 'ad' ? 'a' : 'us'); await q.click('#loginForm button[type=submit]'); await q.waitForTimeout(1800)
    const st2 = await q.evaluate(() => ({ page: window.CURPAGE, selected: ['#inMemberMode', '#inSansMode', '#inMedBtn'].map(s => document.querySelector(s)?.getAttribute('aria-selected')), scrollY: scrollY }))
    L('  after signing in again:', JSON.stringify(st2)); res['reload ' + name + ' signed'] = st2
    await shot(q, N('4b-after-signin-' + name))
  }
  w2.errors.length && L('  errors', JSON.stringify(w2.errors))
  await w2.ctx.close()
}
L('errors', JSON.stringify(w.errors))
saveRows(`h09-${size}-${who}`, [{ log, res, errors: w.errors }])
await b.close()
