// THE TILL-DATE TICK + D949 Q1-Q3 + D950 round 2's words — a WALK of the BUILT app, written as ASSERTIONS of the right behaviour.
// Every step prints PASS / FAIL (or NOT WALKED) with the value it read, and leaves a picture in
//   docs/img/handpass/2026-10-17-tick-r2/<step>.png     (element-clipped, 2x desktop / 3x phone)
// It reads the app; the only writes are the ones a person makes with the controls. Nothing under src/ is touched.
//   node scripts/handpass/tick-r2-walk.mjs            (LOOK_URL=http://localhost:4180/ by default)
import { chromium } from '@playwright/test'
import { existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

console.log('tick-r2-walk v1')
const T0 = Date.now()
const HERE = dirname(fileURLToPath(import.meta.url))
const OUT = process.argv[2] || join(HERE, '../../docs/img/handpass/2026-10-17-tick-r2')   // a re-walk: its own folder
rmSync(OUT, { recursive: true, force: true }); mkdirSync(OUT, { recursive: true })
const URL = process.env.LOOK_URL || 'http://localhost:4180/'
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const browser = await chromium.launch(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {})
const ONLY = process.env.ONLY ? process.env.ONLY.split(',') : null // 'desk' | 'phone' | 'member'

let LASTPAGE = null
const results = [], errs = []
const rec = (id, ok, note, pic) => {
  const tag = ok === true ? 'PASS' : ok === false ? 'FAIL' : ok === 'note' ? 'NOTE' : 'NOT WALKED'
  results.push({ id, tag, note, pic })
  console.log(`${tag}  ${id}  —  ${note}${pic ? `   [${pic}]` : ''}`)
}
const J = v => JSON.stringify(v)
const sleep = ms => new Promise(r => setTimeout(r, ms))

/* ───────────────────────── drivers (from r1b-till-walk.mjs) ───────────────────────── */
async function newCtx(tag, width, height, phone) {
  const ctx = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: phone ? 3 : 2, ...(phone ? { isMobile: true, hasTouch: true } : {}) })
  const page = await ctx.newPage(); LASTPAGE = page
  page.on('pageerror', e => errs.push(`${tag} pageerror: ` + String(e).slice(0, 240)))
  page.on('console', m => { if (m.type() === 'error') errs.push(`${tag} console: ` + m.text().slice(0, 240)) })
  page.on('response', r => { if (r.status() >= 400) errs.push(`${tag} http ${r.status()}: ` + r.url().slice(0, 120)) })
  return { tag, phone, page, ctx }
}
const MARK_CSS = '*{scroll-behavior:auto !important} *,*::before,*::after{transition:none !important;animation:none !important} [data-wk]{outline:2px solid #ff2d55 !important;outline-offset:2px}'
async function signIn(C, who = 'ad', pw = 'a') {
  const { page } = C
  await page.goto(URL)
  await page.addStyleTag({ content: MARK_CSS })
  await page.fill('#luser', who); await page.fill('#lpass', pw)
  await page.click('#loginForm button[type=submit]')
  await page.waitForSelector('#vWeek .day', { state: 'attached' })
  await page.waitForTimeout(500)
}
const hideToast = page => page.evaluate(() => { const t = document.getElementById('toastEl'); if (t) t.style.display = 'none' })
const press = async (C, sel, nth = 0) => {
  const l = C.page.locator(sel).nth(nth)
  await l.scrollIntoViewIfNeeded(); await l.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'nearest' })); await C.page.waitForTimeout(120)
  if (C.phone) await l.tap(); else await l.click()
}
async function closeBoard(C) {
  if (await C.page.locator('#schedBoard:not([hidden])').count()) {
    const b = C.page.locator('#sbDone:visible, #sbClose:visible').first()
    if (await b.count()) { await (C.phone ? b.tap() : b.click()); await C.page.waitForTimeout(400) }
  }
}
async function dropWindow(C) { for (let i = 0; i < 6; i++) { const fx = C.page.locator('[data-testid="win-inputedit-x"]:visible, [data-testid="win-inputsday-x"]:visible').last(); if (await fx.count()) { await (C.phone ? fx.tap() : fx.click()); await C.page.waitForTimeout(300); continue } break }
  for (let i = 0; i < 3; i++) { const x = C.page.locator('#inpEditClose:visible').first(); if (await x.count()) { await x.click(); await C.page.waitForTimeout(300) } else break } }
async function goPage(C, name) { await dropWindow(C); await closeBoard(C); await C.page.evaluate(n => window.go(n), name); await C.page.waitForTimeout(800); await hideToast(C.page) }
async function openWeek(C) { await goPage(C, 'editsched') }
async function openBoard(C, di = 0) {
  await openWeek(C)
  await press(C, `#eWeek [data-sbday="${di}"]`)
  await C.page.waitForSelector('#schedBoard:not([hidden])'); await C.page.waitForTimeout(700); await hideToast(C.page)
}
const PIROWS = (where, di) => where === 'board' ? '#schedBoard .sb-panel.pinp [data-inprow]' : `#eWeek .day[data-day="${di}"] .sec-inp [data-inprow]`
const PITOG = (where, di) => where === 'board' ? `#schedBoard [data-pitog="${di}"]` : `#eWeek .day[data-day="${di}"] [data-pitog="${di}"]`
async function ensurePI(C, where, di) {
  if (!(await C.page.locator(PIROWS(where, di)).count())) { if (await C.page.locator(PITOG(where, di)).count()) { await press(C, PITOG(where, di)); await C.page.waitForTimeout(400) } }
  return C.page.locator(PIROWS(where, di)).count()
}
async function snap(page, name, sels, marks = [], pad = 8) {
  const prep = await page.evaluate(([sels, marks]) => {
    const vis = e => { const r = e.getBoundingClientRect(); return r.width > 1 && r.height > 1 }
    const els = sels.flatMap(s => [...document.querySelectorAll(s)]).filter(vis)
    if (!els.length) return false
    els[0].scrollIntoView({ block: 'center', inline: 'nearest' })
    for (const s of marks) for (const e of document.querySelectorAll(s)) if (vis(e)) e.setAttribute('data-wk', '1')
    return true
  }, [sels, marks])
  if (!prep) { errs.push(`${name}: nothing to picture for ${J(sels)}`); return null }
  await page.waitForTimeout(200)
  const clip = await page.evaluate(([sels, pad]) => {
    const vis = e => { const r = e.getBoundingClientRect(); return r.width > 1 && r.height > 1 }
    let L = 1e9, T = 1e9, R = -1e9, B = -1e9
    for (const e of sels.flatMap(s => [...document.querySelectorAll(s)]).filter(vis)) { const r = e.getBoundingClientRect(); L = Math.min(L, r.left); T = Math.min(T, r.top); R = Math.max(R, r.right); B = Math.max(B, r.bottom) }
    const x = Math.max(0, L - pad), y = Math.max(0, T - pad), r = Math.min(innerWidth, R + pad), b = Math.min(innerHeight, B + pad)
    return { x, y, width: Math.max(2, r - x), height: Math.max(2, b - y) }
  }, [sels, pad])
  await page.screenshot({ path: join(OUT, name + '.png'), clip })
  await page.evaluate(() => document.querySelectorAll('[data-wk]').forEach(e => e.removeAttribute('data-wk')))
  return name + '.png'
}
async function step(id, fn) {
  try {
    const r = await fn()
    rec(id, r.ok, r.note, r.pic)
  } catch (e) { try { await LASTPAGE.screenshot({ path: join(OUT, 'err-' + id.replace(/[^a-z0-9]+/gi, '-').slice(0, 40) + '.png') }) } catch {}; rec(id, false, 'SCRIPT/DRIVER ERROR (read before blaming the app): ' + String(e.message || e).replace(/\s*\n\s*/g, ' / ').slice(0, 1100)) }
}
const MONTHS = ['JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE', 'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER']
async function calTo(C, y, m) {
  for (let i = 0; i < 40; i++) {
    const t = (await C.page.locator('#inpCal .ic-mon').innerText()).trim().toUpperCase().split(/\s+/)
    const d = y * 12 + (m - 1) - (+t[1] * 12 + MONTHS.findIndex(x => x.startsWith(t[0])))
    if (!d) return `${t[0]} ${t[1]}`
    await press(C, d > 0 ? '#icNext' : '#icPrev'); await C.page.waitForTimeout(200)
  }
  throw new Error('the calendar never reached the month asked for')
}
async function openDayAdd(C, iso) {
  await goPage(C, 'inputs'); if (await C.page.locator('#inCalBtn[aria-pressed="false"]').count()) { await press(C, '#inCalBtn'); await C.page.waitForTimeout(500) }
  const at = await calTo(C, 2026, 7)
  await C.page.locator(`#inpCal [data-icday="${iso}"]`).click({ position: { x: 8, y: 8 } }); await C.page.waitForTimeout(400)
  await C.page.locator('#icPopAdd').click(); await C.page.waitForSelector('[data-testid="win-inputedit"]'); await C.page.waitForTimeout(400)
  return at
}

/* ───────────────────────── page-side readers ───────────────────────── */
/* the tick, its date, the Remarks box and the range, as the window draws them right now */
const readTick = page => page.evaluate(() => {
  const R = e => { if (!e) return null; const b = e.getBoundingClientRect(); return { l: +b.left.toFixed(1), r: +b.right.toFixed(1), t: +b.top.toFixed(1), b: +b.bottom.toFixed(1), w: +b.width.toFixed(1), h: +b.height.toFixed(1) } }
  const tick = document.querySelector('#inpEditTill'), date = document.querySelector('[data-testid="inped-till"]'), rmk = document.querySelector('#inpEditRmk'), tl = document.querySelector('[data-testid="inped-tl"]')
  const win = document.querySelector('[data-testid="win-inputedit"]') || document.querySelector('#inpEditPop .inpedbox')
  const cs = date ? getComputedStyle(date) : null
  const cal = {}; for (const d of [13, 14, 15, 16, 17]) { const c = document.querySelector(`#inpEdCal [data-iso="2026-07-${d}"]`); if (c) cal[d] = (c.className || '').replace(/\s+/g, '.') + (c.getAttribute('aria-pressed') ? ' ap=' + c.getAttribute('aria-pressed') : '') + (c.getAttribute('aria-selected') ? ' as=' + c.getAttribute('aria-selected') : '') }
  const hdr = (document.querySelector('#inpEditPop')?.innerText.split('\n').find(l => l.indexOf('→') > 0 && /Jul/.test(l)) || '').trim()
  return {
    present: !!tick, type: document.querySelector('#inpEditType')?.value, checked: tick?.checked, text: date?.textContent, cls: date?.className,
    line: cs?.textDecorationLine, struck: !!cs && /line-through/.test(cs.textDecorationLine + ' ' + cs.textDecoration),
    inTL: !!tick && !!tl && tl.contains(tick) && !!tl.parentElement && tl.parentElement.getAttribute('data-testid') !== 'x' && !!tick.closest('[data-testid="inped-tl"]'),
    afterRmk: !!tl && !!rmk && (rmk.compareDocumentPosition(tl) & Node.DOCUMENT_POSITION_FOLLOWING) !== 0,
    sameLine: !!tl && !!rmk && Math.min(R(tl).b, R(rmk).b) - Math.max(R(tl).t, R(rmk).t) > 4,
    rmk: rmk?.value, hdr, cal, rTick: R(tick), rDate: R(date), rTl: R(tl), rRmk: R(rmk), rWin: R(win), winScrollOver: win ? win.scrollWidth > win.clientWidth + 1 : null,
    pageOver: document.documentElement.scrollWidth > innerWidth + 1,
    tickInert: !!tick?.closest('[inert]'),
  }
})
const tk = r => `type ${r.type}, tick ${r.checked ? 'CHECKED' : 'unchecked'}, date "${r.text}" ${r.struck ? 'STRUCK' : 'plain'} (line "${r.line}", class "${r.cls}"), range "${r.hdr}"`

/* ═════════════ T1 — the tick in the input's window ═════════════ */
let FILED = false
async function t1(C) {
  const at = await openDayAdd(C, '2026-07-14')
  const W = '[data-testid="win-inputedit"]'
  const r0 = await readTick(C.page)
  const pic0 = await snap(C.page, `t1-1-open-OL-${C.tag}`, [W], ['#inpEditTill', '[data-testid="inped-till"]', '#inpEditRmk'], 6)
  const b = []
  if (!r0.present) b.push('no tick #inpEditTill in the window')
  if (r0.type !== 'OL') b.push(`window opens with type ${J(r0.type)} (expected OL)`)
  if (!r0.checked) b.push('the tick is not checked for a leave')
  if (r0.struck) b.push(`the date is struck through (line "${r0.line}")`)
  if (r0.text !== 'till 14 Jul') b.push(`date label reads ${J(r0.text)}`)
  if (!r0.inTL) b.push('the tick is not inside [data-testid=inped-tl]')
  if (!r0.afterRmk) b.push('the tick is not after the Remarks box in the document')
  if (!r0.sameLine) b.push(`the tick is not on the Remarks line (tl y ${r0.rTl?.t}-${r0.rTl?.b}, box y ${r0.rRmk?.t}-${r0.rRmk?.b})`)
  rec(`T1-1 ${C.tag} window opens on OL (calendar on ${at}, 14 Jul)`, !b.length, b.length ? b.join('; ') : tk(r0) + `; tick after the box on the same line (tick x ${r0.rTick.l}-${r0.rTick.r}, box x ${r0.rRmk.l}-${r0.rRmk.r})`, pic0)

  /* geometry (phone is the one that matters; desktop is measured too) */
  {
    const g = []; const w = r0.rWin
    for (const [k, e] of [['tick label', r0.rTl], ['date', r0.rDate], ['Remarks box', r0.rRmk], ['tick box', r0.rTick]]) if (e && w && (e.l < w.l - 0.5 || e.r > w.r + 0.5)) g.push(`${k} x ${e.l}-${e.r} sticks out of the window ${w.l}-${w.r}`)
    if (r0.winScrollOver) g.push('the window scrolls sideways'); if (r0.pageOver) g.push('the page scrolls sideways')
    if (r0.rTick && (r0.rTick.w < 18 || r0.rTick.h < 18)) g.push(`tick box is ${r0.rTick.w}x${r0.rTick.h}px (<18)`)
    rec(`T1-2 ${C.tag} geometry: tick, date and Remarks box inside the window${C.phone ? ' (phone 390)' : ''}`, !g.length, g.length ? g.join('; ') : `window x ${w.l}-${w.r}; box ${r0.rRmk.l}-${r0.rRmk.r} (${r0.rRmk.w}px wide); tick box ${r0.rTick.w}x${r0.rTick.h}; date ${r0.rDate.l}-${r0.rDate.r}; label ${r0.rTl.l}-${r0.rTl.r}`)
  }

  /* an OL leave picked 20 -> 22 Jul, unticked, re-picked 21 -> 24 Jul: the hand choice stays through both taps (D953, weighed at the save) */
  {
    const taps = []
    const rd = async lab => { await C.page.waitForTimeout(400); const r = await readTick(C.page); taps.push(`${lab}: ${r.checked ? 'checked' : 'UNCHECKED'}, date "${r.text}"`); return r }
    await press(C, '#inpEdCal [data-iso="2026-07-20"]'); const p1 = await rd('tap 20')
    await press(C, '#inpEdCal [data-iso="2026-07-22"]'); const p2 = await rd('tap 22')
    const picA = await snap(C.page, `t1-2b-OL-20-22-${C.tag}`, [W], ['#inpEditTill', '[data-testid="inped-till"]'], 6)
    await press(C, '#inpEditTill'); const p3 = await rd('untick')
    await press(C, '#inpEdCal [data-iso="2026-07-21"]'); const p4 = await rd('tap 21 (fresh start)')
    await press(C, '#inpEdCal [data-iso="2026-07-24"]'); const p5 = await rd('tap 24')
    const picB = await snap(C.page, `t1-2c-OL-21-24-unticked-${C.tag}`, [W], ['#inpEditTill', '[data-testid="inped-till"]'], 6)
    const g = []
    if (p2.type !== 'OL') g.push(`type reads ${J(p2.type)} (expected OL)`)
    if (!p2.checked || p2.text !== 'till 22 Jul') g.push(`after 20->22 the tick is ${p2.checked ? 'checked' : 'unchecked'}, date "${p2.text}" (expected checked, "till 22 Jul")`)
    if (p3.checked) g.push('the untick did not take')
    for (const [lab, p, d] of [['tap 21', p4, null], ['tap 24', p5, 'till 24 Jul']]) { if (p.checked) g.push(`the tick came back on at ${lab}`); if (!p.struck) g.push(`date not struck through at ${lab}`); if (d && p.text !== d) g.push(`date reads ${J(p.text)} at ${lab} (expected ${J(d)})`) }
    rec(`T1-2b ${C.tag} OL leave 20->22 Jul, untick, re-pick 21->24 Jul: the tick stays unchecked through both taps`, !g.length, g.length ? g.join('; ') + ' | ' + taps.join(' | ') : taps.join(' | '), [picA, picB].filter(Boolean).join(' '))
    /* back to one day on 14 Jul for the steps that follow */
    await press(C, '#inpEdCal [data-iso="2026-07-14"]'); await C.page.waitForTimeout(250)
    await press(C, '#inpEdCal [data-iso="2026-07-14"]'); await C.page.waitForTimeout(400)
    const back = await readTick(C.page)
    if (back.text !== 'till 14 Jul') rec(`T1-2d ${C.tag} back to 14 Jul alone`, false, `date reads ${J(back.text)}; cal ${J(back.cal)}`)
  }

  /* Meeting */
  const opts =await C.page.locator('#inpEditType option').evaluateAll(os => os.map(o => ({ v: o.value, t: o.textContent.trim() })))
  const meet = opts.find(o => /^meeting$/i.test(o.v) || /^meeting$/i.test(o.t))
  if (!meet) { rec(`T1-3 ${C.tag} change type to Meeting`, null, 'no Meeting option in #inpEditType: ' + J(opts.map(o => o.v))); return }
  await C.page.selectOption('#inpEditType', meet.v); await C.page.waitForTimeout(500)
  const r1 = await readTick(C.page)
  const pic1 = await snap(C.page, `t1-3-meeting-${C.tag}`, [W], ['#inpEditTill', '[data-testid="inped-till"]'], 6)
  const b1 = []
  if (r1.type !== meet.v) b1.push(`type reads ${J(r1.type)}`)
  if (r1.checked) b1.push('tick is still CHECKED for a one-day meeting'); if (!r1.struck) b1.push(`date is not struck through (line "${r1.line}")`); if (!/\boff\b/.test(r1.cls || '')) b1.push(`date has no class "off" (${J(r1.cls)})`)
  rec(`T1-3 ${C.tag} type Meeting, one day: unchecked, date struck`, !b1.length, b1.length ? b1.join('; ') : tk(r1), pic1)

  /* tap the tick */
  await press(C, '#inpEditTill'); await C.page.waitForTimeout(300)
  const r2 = await readTick(C.page)
  const pic2 = await snap(C.page, `t1-4-ticked-${C.tag}`, [W], ['#inpEditTill', '[data-testid="inped-till"]'], 6)
  const b2 = []; if (!r2.checked) b2.push('tap did not check the tick'); if (r2.struck) b2.push('date is still struck through')
  rec(`T1-4 ${C.tag} tap the tick: checked, not struck`, !b2.length, b2.length ? b2.join('; ') : tk(r2), pic2)

  /* 16 Jul ends the range */
  await press(C, '#inpEdCal [data-iso="2026-07-16"]'); await C.page.waitForTimeout(400)
  const r3 = await readTick(C.page)
  const pic3 = await snap(C.page, `t1-5-two-days-${C.tag}`, [W], ['#inpEditTill', '[data-testid="inped-till"]'], 6)
  const b3 = []; if (r3.text !== 'till 16 Jul') b3.push(`date reads ${J(r3.text)} (expected "till 16 Jul")`); if (!r3.checked) b3.push('tick is NOT checked for two days'); if (r3.struck) b3.push('date struck through')
  rec(`T1-5 ${C.tag} tap 16 Jul (the 14th is the start): still checked`, !b3.length, b3.length ? b3.join('; ') : tk(r3) + `; cal ${J(r3.cal)}`, pic3)

  /* one day again: 14 then 14 */
  await press(C, '#inpEdCal [data-iso="2026-07-14"]'); await C.page.waitForTimeout(350)
  const r4a = await readTick(C.page)
  await press(C, '#inpEdCal [data-iso="2026-07-14"]'); await C.page.waitForTimeout(400)
  const r4 = await readTick(C.page)
  const pic4 = await snap(C.page, `t1-6-one-day-again-${C.tag}`, [W], ['#inpEditTill', '[data-testid="inped-till"]'], 6)
  const b4 = []
  if (r4.text !== 'till 14 Jul') b4.push(`date reads ${J(r4.text)} (expected "till 14 Jul" — is it one day again? cal ${J(r4.cal)})`)
  /* D953 changed: a hand choice is weighed at the SAVE — the dates ended as they began (one day), so the hand tick STAYS */
  if (!r4.checked) b4.push('tick is UNCHECKED after stretching to 16 Jul and cutting back to 14 Jul alone — the hand tick was lost (the dates ended as they began)'); if (r4.struck) b4.push(`date struck through (line "${r4.line}")`)
  rec(`T1-6 ${C.tag} stretch to 16 Jul, cut back to 14 Jul alone: the hand tick STAYS checked`, !b4.length, b4.length ? b4.join('; ') : `after the first tap: tick ${r4a.checked ? 'checked' : 'unchecked'}, date "${r4a.text}"; after the second: ${tk(r4)}; cal ${J(r4.cal)}`, pic4)

  /* tick on, Brief, Save */
  if (!r4.checked) { await press(C, '#inpEditTill'); await C.page.waitForTimeout(300) }
  await C.page.locator('#inpEditRmk').fill('Brief'); await C.page.waitForTimeout(200)
  const r5 = await readTick(C.page)
  const pic5 = await snap(C.page, `t1-7-brief-ticked-${C.tag}`, [W], ['#inpEditTill', '[data-testid="inped-till"]', '#inpEditRmk'], 6)
  await press(C, '#inpEditSave'); await C.page.waitForTimeout(900)
  const gone = (await C.page.locator('[data-testid="win-inputedit"]').count()) === 0
  const stored = await C.page.evaluate(() => (window.INPUTS || []).filter(i => i.remarks === 'Brief').map(i => ({ type: i.type, date: i.date, end: i.endDate || i.end || i.to, till: i.till, person: i.person })))
  const b5 = []; if (!r5.checked) b5.push('the tick was not checked before Save'); if (!gone) b5.push('window did not close on Add'); if (stored.length !== 1) b5.push(`stored ${stored.length} records with remark "Brief" ${J(stored)}`)
  FILED = !b5.length
  rec(`T1-7 ${C.tag} tick on, remark "Brief", Add`, !b5.length, b5.length ? b5.join('; ') : `before Add: ${tk(r5)}; window closed; stored ${J(stored[0])}`, pic5)

  if (!C.phone) {
    await goPage(C, 'inputs'); await C.page.waitForTimeout(300)
    if (await C.page.locator('#inListBtn').count()) {
      await press(C, '#inListBtn'); await C.page.waitForTimeout(700)
      const list = await C.page.evaluate(`(() => { const rows = [...document.querySelectorAll('table tr, [role=row]')].filter(r => /Brief/.test(r.textContent)); const r = rows[0]; if (!r) return { found: false }
        const cells = [...r.querySelectorAll('td, [role=cell]')].map(c => { const k = c.cloneNode(true); k.querySelectorAll('.latetag, .latechip').forEach(x => x.remove()); return k.textContent.replace(/\\s+/g, ' ').trim() }); r.setAttribute('data-wk-l', '1'); return { found: true, cells, rmk: cells.find(c => /^Brief/.test(c)) } })()`)
      const pl = list.found ? await snap(C.page, 't1-8-list-desk', ['[data-wk-l]'], ['[data-wk-l]'], 6) : null
      await C.page.evaluate(() => document.querySelectorAll('[data-wk-l]').forEach(e => e.removeAttribute('data-wk-l')))
      rec('T1-8 desk Inputs List Remarks column', list.found && list.rmk === 'Brief till 14 Jul', list.found ? `Remarks column reads ${J(list.rmk)}; cells ${J(list.cells)}` : 'no List row mentioning Brief', pl)
    } else rec('T1-8 desk Inputs List', null, 'no #inListBtn')
  }
}

/* ───────── the Brief row on Tuesday (Personal Inputs) and the window opened from it ───────── */
const WINS = ['[data-testid="win-inputedit"]', '#inpEditPop .inpedbox']
const SCOPE = (where, di) => where === 'board' ? '#schedBoard' : `#eWeek .day[data-day="${di}"]`
async function briefRowSel(C, where, di, sec = 'inp') {
  const container = where === 'board' ? (sec === 'inp' ? '.sb-panel.pinp' : '.sb-panel.grnd') : (sec === 'inp' ? '.sec-inp' : '.sec-grnd')
  return C.page.evaluate(([scope, container, where]) => {
    const rows = [...document.querySelectorAll(`${scope} ${container} [data-inprow]`)]
    const r = rows.find(r => { const b = r.querySelector(where === 'board' ? 'textarea.rmkin' : '.rmk .ntx'); return b && /^Brief/.test(b.value ?? b.textContent) })
    return r ? `${scope} ${container} [data-inprow="${r.dataset.inprow}"]` : null
  }, [SCOPE(where, di), container, where])
}
const readRow = (page, rowSel, where) => page.evaluate(([rs, where]) => {
  const r = document.querySelector(rs); if (!r) return null
  const box = r.querySelector(where === 'board' ? 'textarea.rmkin' : '.rmk .ntx'); const till = r.querySelector('.rk-till')
  const after = e => e ? getComputedStyle(e, '::after').content : null
  const nm = r.querySelector('.nm .ntx'); const rmkWrap = r.querySelector('.rmk, .rmkt')
  const g = till ? getComputedStyle(till).color.match(/\d+/g).map(Number) : null
  return {
    tillLines: till ? till.getClientRects().length : 0, tillRect: till ? Math.round(till.getBoundingClientRect().width) + 'x' + Math.round(till.getBoundingClientRect().height) : null, box: box?.value ?? box?.textContent, till: till?.textContent, boxHasTill: /\btill\b/i.test(box?.value ?? box?.textContent ?? ''), tillInsideBox: !!(box && till && box.contains(till)),
    follows: !!(till && box && till.previousElementSibling === box), grey: g ? g.slice(0, 3).join(',') : null, neutral: g ? Math.max(...g.slice(0, 3)) - Math.min(...g.slice(0, 3)) <= 40 : null,
    acc: r.querySelector('.accb')?.textContent.trim(), accAttr: r.querySelector('.accb')?.dataset.acc, title: r.getAttribute('title'), cls: r.className,
    nameAfter: after(nm), nameText: nm?.textContent, rmkAfter: [after(rmkWrap), after(box), after(till)], kids: rmkWrap ? [...rmkWrap.children].map(c => c.className + ':' + (c.value ?? c.textContent)) : [],
  }
}, [rowSel, where])

async function openWinFromRow(C, rowSel) {
  await press(C, `${rowSel} .inpedit`); await C.page.waitForSelector('[data-testid="win-inputedit"], #inpEditPop:not([hidden]) #inpEditSave'); await C.page.waitForTimeout(500)
}

/* ═════════════ T2 — the week and the board show the date after the box; untick from the row's window ═════════════ */
async function t2(C, where) {
  const di = 1
  if (where === 'board') await openBoard(C, di); else await openWeek(C)
  const n = await ensurePI(C, where, di)
  const rowSel = await briefRowSel(C, where, di)
  if (!rowSel) return rec(`T2-1 ${C.tag} ${where} Tuesday's Brief row`, FILED ? false : null, `no Brief row on Tuesday's Personal Inputs (${n} rows there)${FILED ? '' : ' — T1 did not file it'}`)
  const a = await readRow(C.page, rowSel, where)
  const pa = await snap(C.page, `t2-1-${where}-${C.tag}-row`, [rowSel], [`${rowSel} .rk-till`], 6)
  const b = []
  if (a.box !== 'Brief') b.push(`box holds ${J(a.box)}`); if (a.till !== 'till 14 Jul') b.push(`grey date reads ${J(a.till)}`); if (!a.follows) b.push('grey date does not follow the box'); if (a.tillInsideBox) b.push('the date is inside the box'); if (a.tillLines > 1) b.push(`the grey date breaks over ${a.tillLines} lines (${a.tillRect}) — it wraps mid-word`)
  rec(`T2-1 ${C.tag} ${where} row: box "Brief", grey "till 14 Jul" after it`, !b.length, b.length ? b.join('; ') : `box ${J(a.box)}, grey ${J(a.till)} (colour ${a.grey}), button "${a.acc}", row class "${a.cls}", kids ${J(a.kids)}`, pa)
  /* open the window from the row, untick, save */
  await openWinFromRow(C, rowSel)
  const w0 = await readTick(C.page)
  if (!w0.checked) { rec(`T2-2 ${C.tag} ${where} window from the row`, false, 'window opens with the tick UNCHECKED though the row shows the date: ' + tk(w0)); await dropWindow(C); return }
  await press(C, '#inpEditTill'); await C.page.waitForTimeout(300)
  const w1 = await readTick(C.page)
  const pw = await snap(C.page, `t2-2-${where}-${C.tag}-window-unticked`, WINS, ['#inpEditTill'], 6)
  await press(C, '#inpEditSave'); await C.page.waitForTimeout(900)
  if (where === 'board') { await ensurePI(C, where, di) } else { await ensurePI(C, where, di) }
  const rowSel2 = (await briefRowSel(C, where, di)) || rowSel
  const c = await readRow(C.page, rowSel2, where)
  const pc = await snap(C.page, `t2-3-${where}-${C.tag}-row-unticked`, [rowSel2], [rowSel2], 6)
  const bb = []
  if (w1.checked) bb.push('tap did not untick'); if (c?.box !== 'Brief') bb.push(`box reads ${J(c?.box)}`); if (c?.till) bb.push(`a grey date "${c.till}" still stands after the box`)
  rec(`T2-3 ${C.tag} ${where} untick in the window, Save: row shows "Brief" with no grey date`, !bb.length, bb.length ? bb.join('; ') : `window untick ${J(w1.checked)}; row box ${J(c.box)}, no .rk-till (kids ${J(c.kids)})`, [pw, pc].join(' '))
  /* re-open: unchecked */
  await openWinFromRow(C, rowSel2)
  const w2 = await readTick(C.page)
  const pr = await snap(C.page, `t2-4-${where}-${C.tag}-reopened`, WINS, ['#inpEditTill', '[data-testid="inped-till"]'], 6)
  rec(`T2-4 ${C.tag} ${where} re-open: tick unchecked`, !w2.checked && w2.struck, tk(w2), pr)
  /* tick it again, save */
  await press(C, '#inpEditTill'); await C.page.waitForTimeout(300)
  const w3 = await readTick(C.page)
  await press(C, '#inpEditSave'); await C.page.waitForTimeout(900)
  await ensurePI(C, where, di)
  const d = await readRow(C.page, (await briefRowSel(C, where, di)) || rowSel, where)
  rec(`T2-5 ${C.tag} ${where} tick again, Save: the grey date is back`, w3.checked && d?.till === 'till 14 Jul', `tick now ${w3.checked ? 'checked' : 'unchecked'}; row grey ${J(d?.till)}, box ${J(d?.box)}`)

  /* across saves (D953 reading 2): ticked one-day Brief -> end moved to 15 Jul, Save -> end back to 14 Jul alone, Save: the OLD hand tick must not come back.
     The window on Edit Schedule and the board has no calendar ("The dates are changed on the Inputs page"), so the dates are changed from the Inputs page
     (once, on the week pass); the row is read back on THIS screen. */
  const back = async () => { if (where === 'board') await openBoard(C, di); else await openWeek(C); await ensurePI(C, where, di); return (await briefRowSel(C, where, di)) || null }
  const openBriefOnInputs = async () => {
    await goPage(C, 'inputs'); if (await C.page.locator('#inCalBtn[aria-pressed="false"]').count()) { await press(C, '#inCalBtn'); await C.page.waitForTimeout(500) }; await calTo(C, 2026, 7)
    await C.page.locator('#inpCal [data-icday="2026-07-14"]').click({ position: { x: 8, y: 8 } }); await C.page.waitForTimeout(500)
    const ok = await C.page.evaluate(`(() => { const w = document.querySelector('[data-testid="win-inputsday"]'); if (!w) return false; const c = [...w.querySelectorAll('.icard')].find(c => /Brief/.test(c.innerText)); if (!c) return false; c.setAttribute('data-wk-c', '1'); return true })()`)
    if (!ok) throw new Error('the Inputs page day window does not list the Brief card')
    await press(C, '[data-wk-c]'); await C.page.waitForTimeout(700)
    for (const [lab, pos] of [['the name', { x: 24, y: 18 }], ['the right end', { x: 200, y: 30 }]]) {
      if (await C.page.locator('[data-testid="win-inputedit"]').count()) break
      console.log('   (tap on the Brief card opened nothing — tapping ' + lab + ')')
      const lc = C.page.locator('[data-wk-c]').first(); await (C.phone ? lc.tap({ position: pos }) : lc.click({ position: pos })); await C.page.waitForTimeout(700)
    }
    if (!(await C.page.locator('[data-testid="win-inputedit"]').count())) { console.log('   (still nothing — page click on the card)'); await C.page.evaluate(() => document.querySelector('[data-wk-c]').click()); await C.page.waitForTimeout(700) }
    await C.page.waitForSelector('[data-testid="win-inputedit"]'); await C.page.waitForTimeout(500)
    await C.page.evaluate(() => document.querySelectorAll('[data-wk-c]').forEach(e => e.removeAttribute('data-wk-c')))
  }
  await openBriefOnInputs()
  const x0 = await readTick(C.page)
  await press(C, '#inpEdCal [data-iso="2026-07-14"]'); await C.page.waitForTimeout(250)
  await press(C, '#inpEdCal [data-iso="2026-07-15"]'); await C.page.waitForTimeout(400)
  const x1 = await readTick(C.page)
  const px1 = await snap(C.page, `t2-6-${where}-${C.tag}-end-15`, WINS, ['#inpEditTill', '[data-testid="inped-till"]'], 6)
  await press(C, '#inpEditSave'); await C.page.waitForTimeout(900)
  const rsB = await back()
  const y1 = rsB ? await readRow(C.page, rsB, where) : null
  const py1 = rsB ? await snap(C.page, `t2-7-${where}-${C.tag}-row-end-15`, [rsB], [rsB], 6) : null
  const e1 = []
  if (!x0.checked) e1.push('window opened unchecked before the stretch'); if (x1.text !== 'till 15 Jul') e1.push(`date reads ${J(x1.text)} after tapping 14 then 15 (cal ${J(x1.cal)})`); if (!x1.checked) e1.push('tick not checked for two days')
  if (!y1) e1.push('the Brief row is not on Tuesday after the stretch'); else if (y1.till !== 'till 15 Jul') e1.push(`after Save the row's grey date reads ${J(y1.till)} (expected "till 15 Jul")`)
  rec(`T2-6 ${C.tag} ${where} one-day Brief stretched to 15 Jul (from the Inputs page), Save: grey "till 15 Jul"`, !e1.length, e1.length ? e1.join('; ') : `window ${tk(x1)}; row grey ${J(y1.till)}`, [px1, py1].filter(Boolean).join(' '))
  await openBriefOnInputs()
  await press(C, '#inpEdCal [data-iso="2026-07-14"]'); await C.page.waitForTimeout(250)
  await press(C, '#inpEdCal [data-iso="2026-07-14"]'); await C.page.waitForTimeout(400)
  const z0 = await readTick(C.page)
  await press(C, '#inpEditSave'); await C.page.waitForTimeout(900)
  const rsC = await back()
  const z1 = rsC ? await readRow(C.page, rsC, where) : null
  const pz1 = rsC ? await snap(C.page, `t2-8-${where}-${C.tag}-row-back-one-day`, [rsC], [rsC], 6) : null
  await openBriefOnInputs()
  const z2 = await readTick(C.page)
  const pz2 = await snap(C.page, `t2-9-${where}-${C.tag}-reopened-one-day`, WINS, ['#inpEditTill', '[data-testid="inped-till"]'], 6)
  const e2 = []
  if (z0.text !== 'till 14 Jul') e2.push(`before Save the date reads ${J(z0.text)} (expected "till 14 Jul" — one day again? cal ${J(z0.cal)})`)
  if (!z1) e2.push('the Brief row is gone'); else { if (z1.till) e2.push(`after Save the row still shows a grey date "${z1.till}" — the old hand tick came back`); if (z1.box !== 'Brief') e2.push(`box reads ${J(z1.box)}`) }
  if (z2.checked) e2.push('re-opened window shows the tick CHECKED'); if (!z2.struck) e2.push('re-opened date not struck through')
  rec(`T2-7 ${C.tag} ${where} end back to 14 Jul alone, Save: row shows NO grey date (one-day default), tick unchecked on re-open`, !e2.length, e2.length ? e2.join('; ') : `before Save ${tk(z0)}; row box ${J(z1.box)}, no grey date; re-opened ${tk(z2)}`, [pz1, pz2].filter(Boolean).join(' '))
  /* tick on, Save: T3 starts with "Brief till 14 Jul" */
  await press(C, '#inpEditTill'); await C.page.waitForTimeout(300)
  const z3 = await readTick(C.page)
  await press(C, '#inpEditSave'); await C.page.waitForTimeout(900)
  const rsD = await back()
  const z4 = rsD ? await readRow(C.page, rsD, where) : null
  rec(`T2-8 ${C.tag} ${where} tick on, Save: "Brief" prints "till 14 Jul" again`, z3.checked && z4?.till === 'till 14 Jul' && z4?.box === 'Brief', `tick ${z3.checked ? 'checked' : 'unchecked'}; row box ${J(z4?.box)}, grey ${J(z4?.till)}`)
}

/* ═════════════ T3 — Accept: the Ground Programme row's box ═════════════ */
const GP = (where, di) => where === 'board' ? '#schedBoard .sb-panel.grnd' : `#eWeek .day[data-day="${di}"] .sec-grnd`
async function gpRowSel(C, where, di) {
  return C.page.evaluate(([gp, where]) => {
    const rows = [...document.querySelectorAll(gp + ' .gr-frominput')]
    const i = rows.findIndex(r => { const b = r.querySelector(where === 'board' ? 'textarea.rmkin' : '.rmk .ntx'); return b && /^Brief/.test(b.value ?? b.textContent) })
    if (i < 0) return null
    document.querySelectorAll('[data-wk-g]').forEach(e => e.removeAttribute('data-wk-g')); rows[i].setAttribute('data-wk-g', '1'); return gp + ' [data-wk-g]'
  }, [GP(where, di), where])
}
const gpState = (page, rowSel, where) => page.evaluate(([rs, where]) => {
  const r = document.querySelector(rs); const b = r?.querySelector(where === 'board' ? 'textarea.rmkin' : '.rmk .ntx'); const till = r?.querySelector('.rk-till')
  const dp = [...document.querySelectorAll('#eWeek .dpend, #schedBoard .dpend')].map(e => e.textContent.trim()).join('|')
  return { box: b?.value ?? b?.textContent, till: till?.textContent, tillInside: !!(b && till && b.contains(till)), follows: !!(till && b && till.previousElementSibling === b), rows: window.ELOG?.rows?.length ?? -1, hist: (window.HIST?.ix ?? -1) + '/' + (window.HIST?.stack?.length ?? -1), inputs: JSON.stringify(window.INPUTS).length, pend: dp, focus: document.activeElement === b }
}, [rowSel, where])

async function t3accept(C) {
  const di = 1
  await openWeek(C); await ensurePI(C, 'week', di)
  const rs = await briefRowSel(C, 'week', di)
  if (!rs) return rec(`T3-0 ${C.tag} Accept the Brief row`, null, 'no Brief row on Tuesday')
  const before = await readRow(C.page, rs, 'week')
  if (/^Accept/.test(before.acc || '')) { await press(C, `${rs} .accb`); await C.page.waitForTimeout(900); await ensurePI(C, 'week', di) }
  const rs2 = await briefRowSel(C, 'week', di); const after = await readRow(C.page, rs2, 'week')
  const gp = await C.page.evaluate(g => document.querySelectorAll(g + ' .gr-frominput').length, GP('week', di))
  rec(`T3-0 ${C.tag} Brief row accepted (button before "${before.acc}")`, /^Reject/.test(after.acc || '') && gp > 0, `button now "${after.acc}"; Tuesday Ground Programme rows from inputs: ${gp}; the name's ::after reads ${J(after.nameAfter)}; marker after the remark ${J(after.rmkAfter)}`)
}
/* press a Ground Programme remark box at its RIGHT end: on a phone the LATE chip can sit over the box's middle (the first tap, in the middle, was "intercepted" by the chip) — measured and noted once */
const LATE_OVER = new Set()
async function pressBox(C, boxSel) {
  const l = C.page.locator(boxSel).first(); await l.scrollIntoViewIfNeeded(); await l.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'nearest' })); await C.page.waitForTimeout(150)
  const m = await C.page.evaluate(bs => { const b = document.querySelector(bs); const r = b.getBoundingClientRect(); const lt = b.closest('.rmk, .rmkt, [data-inprow], .gr-frominput')?.querySelector('.latetag'); const t = lt ? lt.getBoundingClientRect() : null; const cx = r.left + r.width / 2, cy = r.top + r.height / 2; const hit = document.elementFromPoint(cx, cy); return { box: [Math.round(r.left), Math.round(r.right), Math.round(r.top), Math.round(r.bottom)], late: t ? [Math.round(t.left), Math.round(t.right), Math.round(t.top), Math.round(t.bottom)] : null, centreHit: hit ? (hit.className || hit.tagName) : null, boxHit: hit === b || b.contains(hit) } }, boxSel)
  if (!m.boxHit && m.late) LATE_OVER.add(C.tag + ' ' + J(m))
  const pt = await C.page.evaluate(bs => { const b = document.querySelector(bs); const r = b.getBoundingClientRect(); const pts = [[r.right - 6, r.top + r.height / 2], [r.right - 6, r.bottom - 4], [r.left + r.width * .75, r.top + r.height / 2], [r.left + r.width / 2, r.top + r.height / 2]]; for (const [x, y] of pts) { const h = document.elementFromPoint(x, y); if (h && (h === b || b.contains(h))) return { x, y } } return null }, boxSel)
  if (!pt) throw new Error('no point on the box is free to press: ' + J(m))
  if (C.phone) await C.page.touchscreen.tap(pt.x, pt.y); else await C.page.mouse.click(pt.x, pt.y)
}
async function t3box(C, where) {
  const di = 1
  if (where === 'board') await openBoard(C, di); else await openWeek(C)
  const rs = await gpRowSel(C, where, di)
  if (!rs) return rec(`T3-1 ${C.tag} ${where} Ground Programme row for Brief`, null, 'no Ground Programme row for Brief')
  const s0 = await gpState(C.page, rs, where)
  const pic0 = await snap(C.page, `t3-1-${where}-${C.tag}-gp-row`, [rs], [`${rs} .rk-till`], 6)
  const b = []
  if (!/^Brief( x)?$/.test(s0.box)) b.push(`box holds ${J(s0.box)}`); if (s0.till !== 'till 14 Jul') b.push(`grey date reads ${J(s0.till)}`); if (!s0.follows) b.push('grey date does not follow the box'); if (s0.tillInside) b.push('the date is INSIDE the box')
  rec(`T3-1 ${C.tag} ${where} Ground Programme row: box "Brief" only, grey date after the box`, !b.length, b.length ? b.join('; ') : `box ${J(s0.box)}, grey ${J(s0.till)} after it, outside the box`, pic0)
  /* click in, Tab */
  const boxSel = where === 'board' ? `${rs} textarea.rmkin` : `${rs} .rmk .ntx`
  await pressBox(C, boxSel); await C.page.waitForTimeout(250)
  const sf = await gpState(C.page, rs, where)
  await C.page.keyboard.press('Tab'); await C.page.waitForTimeout(800)
  const rs2 = await gpRowSel(C, where, di) || rs
  const s1 = await gpState(C.page, rs2, where)
  const pic1 = await snap(C.page, `t3-2-${where}-${C.tag}-after-tab`, [rs2], [`${rs2} .rk-till`], 6)
  const bt = []
  if (!sf.focus) bt.push('the click did not put the cursor in the box (gesture not proven)'); if (s1.focus) bt.push('Tab did not leave the box (gesture not proven)')
  for (const k of ['box', 'till', 'rows', 'hist', 'inputs', 'pend']) if (s0[k] !== s1[k]) bt.push(`${k} changed ${J(s0[k])} -> ${J(s1[k])}`)
  if (s1.tillInside) bt.push('date inside the box after Tab'); if (!s1.follows) bt.push('date no longer follows the box')
  rec(`T3-2 ${C.tag} ${where} click in the box and Tab: nothing changes`, !bt.length, bt.length ? bt.join('; ') : `box ${J(s1.box)}, grey ${J(s1.till)} after it; edit-log rows ${s0.rows}, history ${s0.hist}, pending ${J(s0.pend) || 'none'} — all unchanged`, pic1)
  /* type a word at the end, Tab */
  const word = where === 'board' ? ' y' : ' x'
  await pressBox(C, boxSel); await C.page.keyboard.press('Control+End'); await C.page.keyboard.type(word, { delay: 30 })
  await C.page.keyboard.press('Tab'); await C.page.waitForTimeout(900)
  const rs3 = await gpRowSel(C, where, di)
  const s2 = rs3 ? await gpState(C.page, rs3, where) : null
  const pic2 = rs3 ? await snap(C.page, `t3-3-${where}-${C.tag}-typed`, [rs3], [`${rs3} .rk-till`], 6) : null
  const bw = []
  if (!s2) bw.push('the row is gone after typing'); else {
    if (s2.box !== 'Brief' + (where === 'board' ? ' x y' : ' x').replace(/^ x y$/, ' x y')) { /* board may have week's " x" first */ }
    if (!/^Brief( x)?( y)?$/.test(s2.box) || !s2.box.endsWith(word.trim())) bw.push(`box reads ${J(s2.box)} (expected it to end with "${word.trim()}")`)
    if (s2.till !== 'till 14 Jul') bw.push(`grey date reads ${J(s2.till)}`); if (s2.tillInside) bw.push('date inside the box'); if (!s2.follows) bw.push('date does not follow the box')
  }
  rec(`T3-3 ${C.tag} ${where} type "${word.trim()}" at the end, Tab: box reads Brief…${word.trim()}, date after it`, !bw.length, bw.length ? bw.join('; ') : `box ${J(s2.box)}, grey ${J(s2.till)} outside the box`, pic2)
  /* Escape */
  if (s2) {
    const before = s2.box
    await pressBox(C, boxSel); await C.page.keyboard.press('Control+End'); await C.page.keyboard.type('zz', { delay: 30 })
    const typing = await gpState(C.page, rs3, where)
    await C.page.keyboard.press('Escape'); await C.page.waitForTimeout(700)
    const rs4 = await gpRowSel(C, where, di) || rs3
    const s3 = await gpState(C.page, rs4, where)
    const pic3 = await snap(C.page, `t3-4-${where}-${C.tag}-escape`, [rs4], [`${rs4} .rk-till`], 6)
    const be = []
    if (!/zz$/.test(typing.box || '')) be.push(`the typing was not proven (box read ${J(typing.box)})`)
    if (s3.box !== before) be.push(`after Escape the box reads ${J(s3.box)} (expected ${J(before)})`); if (/till/i.test(s3.box || '') || s3.tillInside) be.push('a date is inside the box after Escape')
    if (s3.till !== 'till 14 Jul' || !s3.follows) be.push(`date after Escape: ${J(s3.till)}, follows ${s3.follows}`)
    rec(`T3-5 ${C.tag} ${where} type "zz" then Escape: back to the saved text, no date inside`, !be.length, be.length ? be.join('; ') : `typing read ${J(typing.box)}; after Escape ${J(s3.box)}, grey ${J(s3.till)} outside`, pic3)
    await C.page.keyboard.press('Tab').catch(() => {})
  }
}

/* ═════════════ T4 — "rejected" ═════════════ */
const REJ_NOTE = 'A rejected input flags nothing until accepted again. Delete it here if it should go entirely.'
async function t4(C) {
  const di = 1
  await openWeek(C); await ensurePI(C, 'week', di)
  const rs = await briefRowSel(C, 'week', di)
  if (!rs) return rec(`T4-0 ${C.tag} Brief row`, null, 'no Brief row on Tuesday')
  /* an accepted row elsewhere */
  const accd = await C.page.evaluate(() => { const r = [...document.querySelectorAll('#eWeek .pl-row.accd')].find(r => r.getBoundingClientRect().width > 1); if (!r) return null; const nm = r.querySelector('.nm .ntx'); return { name: nm?.textContent, after: getComputedStyle(nm, '::after').content, rmkAfter: [getComputedStyle(r.querySelector('.rmk .ntx') || r, '::after').content] } })
  const a = await readRow(C.page, rs, 'week')
  const picA = await snap(C.page, `t4-1-accepted-${C.tag}`, [rs], [rs], 6)
  rec(`T4-1 ${C.tag} an ACCEPTED row reads "· accepted" after its name and nothing after its remark`, /accepted/.test(a.nameAfter || '') && !/accepted|rejected/.test((a.rmkAfter || []).join(' ')), `Brief row: name "${a.nameText}" ::after ${J(a.nameAfter)}, after the remark ${J(a.rmkAfter)}; another accepted row: ${J(accd)}`, picA)
  await press(C, `${rs} .accb`); await C.page.waitForTimeout(900); await ensurePI(C, 'week', di)
  const rs2 = await briefRowSel(C, 'week', di)
  if (!rs2) return rec(`T4-2 ${C.tag} rejected row`, false, 'after Reject the Brief row is no longer in Personal Inputs')
  const r = await readRow(C.page, rs2, 'week')
  const note = await C.page.evaluate(d => [...document.querySelectorAll(`#eWeek .day[data-day="${d}"] .sec-inp .pl-inpnote`)].map(e => e.textContent.trim()), di)
  const picR = await snap(C.page, `t4-2-rejected-week-${C.tag}`, [`#eWeek .day[data-day="${di}"] .sec-inp`], [rs2, `#eWeek .day[data-day="${di}"] .sec-inp .pl-inpnote`], 6)
  const b = []
  if (!/· rejected/.test(r.nameAfter || '')) b.push(`name ::after reads ${J(r.nameAfter)} (expected " · rejected")`)
  if (/rejected|accepted/.test((r.rmkAfter || []).join(' '))) b.push(`a marker follows the remark: ${J(r.rmkAfter)}`)
  if (r.title !== 'Rejected from the day — flags nothing until accepted again') b.push(`row title reads ${J(r.title)}`)
  if (J(note) !== J([REJ_NOTE])) b.push(`panel note reads ${J(note)}`)
  if (!/^Accept/.test(r.acc || '')) b.push(`button reads "${r.acc}" (expected Accept)`)
  rec(`T4-2 ${C.tag} week: rejected row`, !b.length, b.length ? b.join('; ') : `name "${r.nameText}" ::after ${J(r.nameAfter)}; nothing after the remark; hover ${J(r.title)}; note ${J(note[0])}; button "${r.acc}"`, picR)
  /* the board */
  await openBoard(C, di); await ensurePI(C, 'board', di)
  const bn = await C.page.evaluate(() => [...document.querySelectorAll('#schedBoard .sb-panel.pinp .sb-pinote')].map(e => e.textContent.trim()))
  const bsel = await briefRowSel(C, 'board', di)
  const br = bsel ? await C.page.evaluate(s => { const r = document.querySelector(s); return { cls: r.className, title: r.getAttribute('title') } }, bsel) : null
  const picB = await snap(C.page, `t4-3-rejected-board-${C.tag}`, ['#schedBoard .sb-panel.pinp .sb-pb'], ['#schedBoard .sb-panel.pinp .sb-pinote'], 6)
  rec(`T4-3 ${C.tag} board: the panel's note and the row's hover`, J(bn) === J([REJ_NOTE]) && !!br && br.title === 'Rejected from the day — flags nothing until accepted again', `board note ${J(bn)}; row class "${br?.cls}", hover ${J(br?.title)}`, picB)
  /* accept again */
  await openWeek(C); await ensurePI(C, 'week', di)
  const rs3 = await briefRowSel(C, 'week', di)
  await press(C, `${rs3} .accb`); await C.page.waitForTimeout(900); await ensurePI(C, 'week', di)
  const f = await readRow(C.page, (await briefRowSel(C, 'week', di)) || rs3, 'week')
  rec(`T4-4 ${C.tag} Accept again: back to "· accepted"`, /^Reject/.test(f.acc || '') && /accepted/.test(f.nameAfter || ''), `button "${f.acc}", name ::after ${J(f.nameAfter)}, grey ${J(f.till)}`)
}

/* ═════════════ T5 — the board's wave header "(prev day)" ═════════════ */
async function t5(C) {
  await openBoard(C, 0)
  const wv = await C.page.evaluate(() => {
    const ws = [...document.querySelectorAll('#schedBoard .sb-go')].filter(w => w.querySelector('.sb-go-h') && w.getBoundingClientRect().width > 1)
    if (!ws.length) return null; document.querySelectorAll('[data-wk-w]').forEach(e => e.removeAttribute('data-wk-w'))
    const w = ws[0]; w.setAttribute('data-wk-w', '1'); return { n: ws.length, lines: w.querySelectorAll('.itline').length, head: w.querySelector('.sb-go-h').innerText.replace(/\s+/g, ' ').trim() }
  })
  if (!wv) return rec(`T5-0 ${C.tag} a flying wave on Monday's board`, null, 'no wave drawn')
  const W = '#schedBoard [data-wk-w]'
  const itl = `${W} .itline`
  if (!wv.lines) { await press(C, `${W} [data-itadd]`); await C.page.waitForTimeout(600) }
  const lines = await C.page.locator(itl).count()
  if (!lines) return rec(`T5-0 ${C.tag} a yellow in-time line`, false, `pressing "+ In-time / Rally" drew no .itline (lines before: ${wv.lines})`)
  const undoBefore = await C.page.evaluate(() => (window.HIST?.ix ?? -1))
  const readH = () => C.page.evaluate(() => { const w = document.querySelector('#schedBoard [data-wk-w]'); const h = w.querySelector('.sb-go-h'); const pd = h.querySelector('.sb-prevday'); const t = h.querySelector('.sb-wtitle'); const grey = pd ? getComputedStyle(pd).color : null; return { head: h.innerText.replace(/\s+/g, ' ').trim(), pd: pd?.textContent, grey, line: w.querySelector('.itline')?.textContent, pdLeft: pd ? Math.round(pd.getBoundingClientRect().left) : null, titleRight: t ? Math.round(t.getBoundingClientRect().right) : null, over: h.scrollWidth > h.clientWidth + 1 } })
  const h0 = await readH()
  await press(C, itl); await C.page.keyboard.press('Control+A'); await C.page.keyboard.type('22:30H IN TIME', { delay: 25 }); await C.page.keyboard.press('Tab'); await C.page.waitForTimeout(900)
  const h1 = await readH()
  const pic1 = await snap(C.page, `t5-1-prevday-on-${C.tag}`, [`${W} .sb-go-h`, `${W} .intimes`], [`${W} .sb-prevday`], 6)
  const b = []
  if (h0.pd) b.push(`before the typing the header already carried "${h0.pd}" (line ${J(h0.line)})`)
  if (h1.pd !== '(prev day)') b.push(`after "22:30H IN TIME" the header carries ${J(h1.pd)} (line now ${J(h1.line)}, header ${J(h1.head)})`)
  if (h1.over) b.push('the header scrolls sideways')
  rec(`T5-1 ${C.tag} later in-time line: "(prev day)" beside the title`, !b.length, b.length ? b.join('; ') : `header reads ${J(h1.head)}; "(prev day)" colour ${h1.grey}, starts x ${h1.pdLeft} after the title ends x ${h1.titleRight}; line reads ${J(h1.line)}`, pic1)
  await press(C, itl); await C.page.keyboard.press('Control+A'); await C.page.keyboard.type('06:00H IN TIME', { delay: 25 }); await C.page.keyboard.press('Tab'); await C.page.waitForTimeout(900)
  const h2 = await readH()
  const pic2 = await snap(C.page, `t5-2-prevday-off-${C.tag}`, [`${W} .sb-go-h`, `${W} .intimes`], [], 6)
  rec(`T5-2 ${C.tag} "06:00H IN TIME": "(prev day)" goes`, !h2.pd && /06:00/.test(h2.line || ''), `header reads ${J(h2.head)}; line ${J(h2.line)}; prevday ${J(h2.pd)}`, pic2)
  /* undo back */
  const ub = C.page.locator('#sbUndo').first(); let n = 0
  while (n < 8 && await ub.isVisible() && !(await ub.isDisabled())) { await (C.phone ? ub.tap() : ub.click()); await C.page.waitForTimeout(500); n++ }
  rec(`T5-3 ${C.tag} Undo until the top bar's Undo is disabled`, 'note', `pressed Undo ${n} time(s); in-time lines on the wave now ${await C.page.locator(itl).count()}`)
}

/* ═════════════ T6 — round 2's words (desktop) ═════════════ */
async function t6(C) {
  await goPage(C, 'viewsched')
  const day0 = '#vWeek .day[data-day="0"] .day-head'
  const head = await C.page.evaluate(sel => {
    const h = document.querySelector(sel); if (!h) return null
    const out = []
    for (const e of h.querySelectorAll('*')) { if (e.children.length) continue; const t = e.textContent.trim(); if (!t) continue; const cs = getComputedStyle(e); out.push({ t, tag: e.tagName.toLowerCase(), cls: e.className, border: cs.borderTopStyle + ' ' + cs.borderTopWidth, bg: cs.backgroundColor, rx: Math.round(e.getBoundingClientRect().right - h.getBoundingClientRect().left), w: Math.round(h.getBoundingClientRect().width) }) }
    return { text: h.innerText.replace(/\s+/g, ' ').trim(), out }
  }, day0)
  if (!head) return rec('T6-1 desk View-only Monday head', null, 'no Monday head on View-only Sched')
  const pic = await snap(C.page, 't6-1-viewonly-monday-head', [day0], [], 8)
  const boxed = head.out.filter(e => /^draft$/i.test(e.t) && !/verchip/.test(e.cls) && (!/^none/.test(e.border) && !/ 0px$/.test(e.border) || !/rgba\(0, 0, 0, 0\)|transparent/.test(e.bg)))
  const stampWord = head.out.filter(e => /^Draft$/.test(e.t))
  const tag = head.out.filter(e => /^DRAFT$/.test(e.t) || /draft/i.test(e.cls))
  const bad = []
  if (stampWord.length) bad.push(`an element reads exactly "Draft": ${J(stampWord)}`)
  if (boxed.length) bad.push(`a boxed Draft: ${J(boxed)}`)
  if (!/DRAFT/.test(head.text)) bad.push('no DRAFT tag in the head')
  rec('T6-1 desk View-only Sched, Monday: no boxed "Draft" stamp; the DRAFT tag stays', !bad.length, bad.length ? bad.join('; ') + `; head text ${J(head.text)}` : `head reads ${J(head.text)}; leaf parts ${J(head.out.map(e => [e.t, e.border]))}`, pic)
  /* the peek */
  const peek = await C.page.evaluate(() => {
    const leaves = [...document.querySelectorAll('#vWeek *')].filter(e => !e.children.length && /next week/i.test(e.textContent))
    document.querySelectorAll('[data-wk-f]').forEach(e => e.removeAttribute('data-wk-f'))
    if (!leaves.length) return { found: false, body: [...document.querySelectorAll('*')].filter(e => !e.children.length && /next week/i.test(e.textContent)).map(e => e.className + ':' + e.textContent.trim()).slice(0, 5) }
    leaves[0].setAttribute('data-wk-f', '1'); return { found: true, text: leaves[0].textContent.trim(), cls: leaves[0].className }
  })
  if (peek.found) { await C.page.evaluate(() => { const e = document.querySelector('[data-wk-f]'); let p = e.parentElement; while (p && p.scrollWidth <= p.clientWidth + 1) p = p.parentElement; if (p) p.scrollLeft = p.scrollWidth; e.scrollIntoView({ block: 'center', inline: 'center' }) }); await C.page.waitForTimeout(400) }
  const pp = peek.found ? await snap(C.page, 't6-2-peek-viewonly', ['[data-wk-f]'], ['[data-wk-f]'], 30) : null
  rec('T6-2 desk View-only Sched: the next-week peek reads "Next week: click a day to load it"', peek.found && peek.text === 'Next week: click a day to load it', peek.found ? `peek reads ${J(peek.text)}` : 'no "next week" text found in the week; elsewhere: ' + J(peek.body), pp)
  /* placeholders heading: Edit Schedule */
  await openWeek(C)
  const ph = await C.page.evaluate(() => {
    const vis = e => { const r = e.getBoundingClientRect(); return r.width > 1 && r.height > 1 }
    const all = [...document.querySelectorAll('body *')].filter(e => !e.children.length && /^placeholders?\b/i.test(e.textContent.trim()))
    const drag = [...document.querySelectorAll('body *')].filter(e => !e.children.length && /drag in/i.test(e.textContent)).map(e => e.textContent.trim())
    document.querySelectorAll('[data-wk-f]').forEach(e => e.removeAttribute('data-wk-f'))
    const v = all.filter(vis); if (v[0]) v[0].setAttribute('data-wk-f', '1')
    return { texts: all.map(e => e.textContent.trim() + (vis(e) ? '' : ' (hidden)')), drag, parent: v[0]?.parentElement?.className }
  })
  const pph = ph.texts.length ? await snap(C.page, 't6-3-placeholders', ['[data-wk-f]'], ['[data-wk-f]'], 40) : null
  rec('T6-3 desk Edit Schedule: the crew panel heading reads "Placeholders" (no "· drag in")', ph.texts.some(t => t === 'Placeholders') && !ph.drag.length, `headings found ${J(ph.texts)}; any "drag in" text on the page: ${J(ph.drag)}`, pph)
}

/* ═════════════ T7 — a published day (desktop) ═════════════ */
async function t7(C) {
  const di = 1
  await openWeek(C); await ensurePI(C, 'week', di)
  let rs = await briefRowSel(C, 'week', di)
  if (!rs) return rec('T7-0 desk Brief row on Tuesday', null, 'no Brief row on Tuesday')
  let a = await readRow(C.page, rs, 'week')
  if (/^Accept/.test(a.acc || '')) { await press(C, `${rs} .accb`); await C.page.waitForTimeout(900); await ensurePI(C, 'week', di); rs = await briefRowSel(C, 'week', di); a = await readRow(C.page, rs, 'week') }
  if (!a.till) { rec('T7-0 desk Brief row before publishing', false, `the row shows no grey date before publishing (box ${J(a.box)}) — T2 left it unticked?`); return }
  const day = `#eWeek .day[data-day="${di}"]`
  for (const role of ['cur', 'sked', 'plan', 'appr']) {
    const sel = C.page.locator(`${day} select[data-sign="${role}"][data-signday="${di}"]`).first()
    await sel.scrollIntoViewIfNeeded()
    const opts = await sel.locator('option').evaluateAll(os => os.map(o => o.value).filter(Boolean))
    if (!opts.length) return rec('T7-1 desk publish Tuesday', false, `sign-off ${role} offers no names`)
    await sel.selectOption(opts[0])
  }
  const beak = C.page.locator(`${day} [data-beak="${di}"]`).first()
  if (await beak.isDisabled()) return rec('T7-1 desk publish Tuesday', false, 'Publish day still disabled; hover ' + J(await beak.getAttribute('title')))
  await beak.scrollIntoViewIfNeeded(); await beak.click(); await C.page.waitForTimeout(900)
  const chip = await C.page.evaluate(d => [...document.querySelectorAll(d + ' .verchip')].map(e => e.textContent.trim()).join(' | '), day)
  const pic1 = await snap(C.page, 't7-1-published', [`${day} .day-head`], [`${day} .verchip`])
  rec('T7-1 desk publish Tuesday through its own controls', /ORIG/.test(chip), `chip reads ${J(chip)}; pending chip ${J(await C.page.evaluate(d => (document.querySelector(d + ' .dpend')?.textContent || '').trim(), day))}`, pic1)
  /* untick, save */
  await ensurePI(C, 'week', di)
  rs = await briefRowSel(C, 'week', di)
  await openWinFromRow(C, rs)
  const w0 = await readTick(C.page)
  await press(C, '#inpEditTill'); await C.page.waitForTimeout(300)
  const w1 = await readTick(C.page)
  await press(C, '#inpEditSave'); await C.page.waitForTimeout(900)
  await openWeek(C)
  const pend = await C.page.evaluate(d => ({ tue: (document.querySelector(d + ' .dpend')?.textContent || '').trim(), all: [...document.querySelectorAll('#eWeek .day')].map(x => [x.dataset.day, (x.querySelector('.dpend')?.textContent || '').trim()]) }), day)
  const pic2 = await snap(C.page, 't7-2-pending-chip', [`${day} .day-head`], [`${day} .dpend`])
  let listTxt = '', pic3 = null
  if (/pending/.test(pend.tue)) {
    await C.page.locator(`${day} .dpend`).first().scrollIntoViewIfNeeded(); await C.page.locator(`${day} .dpend`).first().click(); await C.page.waitForTimeout(600)
    const tab = C.page.locator('.chgwin:not([hidden]) .win-tab', { hasText: 'To go out' }).first()
    if (await tab.count()) { await tab.click(); await C.page.waitForTimeout(400) }
    listTxt = await C.page.evaluate(() => [...document.querySelectorAll('.chgwin:not([hidden]) .pl-list')].map(e => e.innerText.replace(/\s+/g, ' ').trim()).join(' || '))
    pic3 = await snap(C.page, 't7-3-pending-list', ['.chgwin:not([hidden])'], [], 6)
  }
  const b = []
  if (!w0.checked) b.push('window opened with the tick unchecked before the untick'); if (w1.checked) b.push('the tap did not untick')
  if (!/(^|\D)1\Wpending/.test(pend.tue) || pend.tue.length > 20) b.push(`Tuesday's head reads ${J(pend.tue)} (all: ${J(pend.all)})`)
  if (!/Brief[^|]*till 14 Jul[^|]*(→|->)[^|]*Brief(?![^|]*till)/.test(listTxt)) b.push(`pending list does not show "Brief till 14 Jul" -> "Brief": ${J(listTxt.slice(0, 400))}`)
  rec('T7-2 desk published Tuesday, untick the Brief tick: "1 pending" and the remark goes "Brief till 14 Jul" -> "Brief"', !b.length, b.length ? b.join('; ') : `head ${J(pend.tue)}; list ${J(listTxt.slice(0, 300))}`, [pic2, pic3].filter(Boolean).join(' '))
}

/* ═════════════ T8 — a member (phone) ═════════════ */
async function t8(C) {
  const at = await openDayAdd(C, '2026-07-15')
  const W = '[data-testid="win-inputedit"]'
  const r0 = await readTick(C.page)
  if (!r0.present) { rec('T8-1 member new input window: tick', false, 'no tick in the member\'s window: ' + J({ type: r0.type })); return }
  await press(C, '#inpEditTill'); await C.page.waitForTimeout(300)
  const r1 = await readTick(C.page)
  await press(C, '#inpEditTill'); await C.page.waitForTimeout(300)
  const r2 = await readTick(C.page)
  const pic = await snap(C.page, 't8-1-member-new', [W], ['#inpEditTill', '[data-testid="inped-till"]'], 6)
  rec('T8-1 member (Ranger) new input on 15 Jul: the tick toggles', r1.checked !== r0.checked && r2.checked === r0.checked, `type ${r0.type}: ${r0.checked} -> ${r1.checked} -> ${r2.checked}; date "${r2.text}" ${r2.struck ? 'struck' : 'plain'}; tick inert ${r0.tickInert}`, pic)
  /* someone else's card */
  await dropWindow(C)
  await goPage(C, 'inputs'); await calTo(C, 2026, 7)
  const iso = '2026-07-14'
  await C.page.locator(`#inpCal [data-icday="${iso}"]`).click({ position: { x: 8, y: 8 } }); await C.page.waitForTimeout(500)
  { const cf = C.page.locator('[data-testid="win-inputsday"] button', { hasText: 'Clear filters' }).first(); if (await cf.count()) { console.log('   (the member day window opened with a filter on: "No inputs match on this day" — pressing Clear filters)'); await cf.tap(); await C.page.waitForTimeout(600) } }
  const cards = await C.page.evaluate(() => [...document.querySelectorAll('[data-testid="win-inputsday"] .icard')].map((c, i) => ({ i, text: c.innerText.replace(/\s+/g, ' ').trim().slice(0, 90), cls: c.className })))
  console.log('   member day-window cards on 14 Jul:', J(cards))
  let opened = null
  for (const c of cards) {
    await C.page.evaluate(i => { document.querySelectorAll('[data-wk-c]').forEach(e => e.removeAttribute('data-wk-c')); document.querySelectorAll('[data-testid="win-inputsday"] .icard')[i].setAttribute('data-wk-c', '1') }, c.i)
    const lc = C.page.locator('[data-wk-c]').first(); await lc.scrollIntoViewIfNeeded(); await lc.tap().catch(() => {}); await C.page.waitForTimeout(600)
    if (await C.page.locator(W).count()) {
      const who = await C.page.evaluate(() => { const s = document.querySelector('#inpEditPerson'); return { person: s ? s.options[s.selectedIndex]?.text : null, fixed: document.querySelector('#inpEditPerson, [data-testid="inped-person"]')?.outerHTML.slice(0, 80) } })
      const t = await readTick(C.page)
      if (t.present && t.tickInert) { opened = { c, who, t }; break }
      console.log('   card', c.i, 'opened a window whose tick is not inert:', J({ tickInert: t.tickInert, present: t.present, who }))
      await dropWindow(C); await C.page.keyboard.press('Escape').catch(() => {}); await C.page.waitForTimeout(300)
      if (!(await C.page.locator('[data-testid="win-inputsday"]').count())) await C.page.locator(`#inpCal [data-icday="${iso}"]`).click({ position: { x: 8, y: 8 } })
      await C.page.waitForTimeout(400)
    }
  }
  if (!opened) { rec('T8-2 member opens someone else\'s input: read-only, tick inert', null, `no card opened a read-only window with a tick (cards ${J(cards.map(c => c.text))})`); return }
  const before = opened.t.checked
  const box = await C.page.locator('#inpEditTill').boundingBox()
  if (box) await C.page.touchscreen.tap(box.x + box.width / 2, box.y + box.height / 2); await C.page.waitForTimeout(400)
  const after = await readTick(C.page)
  const pic2 = await snap(C.page, 't8-2-member-others-card', [W], ['#inpEditTill', '[data-testid="inped-till"]'], 6)
  rec('T8-2 member opens someone else\'s input: tick inside an [inert] body, a tap does not change it', opened.t.tickInert && after.checked === before, `card "${opened.c.text}"; tick inert ${opened.t.tickInert}; checked ${before} -> ${after.checked}; date "${after.text}" ${after.struck ? 'struck' : 'plain'}`, pic2)
}

/* ───────────────────────── the runs ───────────────────────── */
async function runFull(C) {
  await step(`T5  ${C.tag} board wave header "(prev day)"`, () => t5(C).then(() => ({ ok: 'note', note: 'sub-steps T5-* above' })))
  await step(`T1  ${C.tag} the tick in the window`, () => t1(C).then(() => ({ ok: 'note', note: 'sub-steps T1-* above' })))
  await step(`T2  ${C.tag} week`, () => t2(C, 'week').then(() => ({ ok: 'note', note: 'sub-steps T2-* above' })))
  await step(`T2  ${C.tag} board`, () => t2(C, 'board').then(() => ({ ok: 'note', note: 'sub-steps T2-* above' })))
  await step(`T3  ${C.tag} accept`, () => t3accept(C).then(() => ({ ok: 'note', note: 'see T3-0' })))
  await step(`T3  ${C.tag} GP box (week)`, () => t3box(C, 'week').then(() => ({ ok: 'note', note: 'sub-steps T3-* above' })))
  await step(`T3  ${C.tag} GP box (board)`, () => t3box(C, 'board').then(() => ({ ok: 'note', note: 'sub-steps T3-* above' })))
  await step(`T4  ${C.tag} rejected`, () => t4(C).then(() => ({ ok: 'note', note: 'sub-steps T4-* above' })))
  if (!C.phone) {
    await step('T6  desk round 2 words', () => t6(C).then(() => ({ ok: 'note', note: 'sub-steps T6-* above' })))
    await step('T7  desk published day', () => t7(C).then(() => ({ ok: 'note', note: 'sub-steps T7-* above' })))
  }
}
if (!ONLY || ONLY.includes('desk')) { const D = await newCtx('desk', 1440, 900, false); await signIn(D); await runFull(D); await D.ctx.close() }
if (!ONLY || ONLY.includes('phone')) { FILED = false; const P = await newCtx('phone390', 390, 844, true); await signIn(P); await runFull(P); await P.ctx.close() }
if (!ONLY || ONLY.includes('member')) { const M = await newCtx('member390', 390, 844, true); await signIn(M, 'us', 'us'); await step('T8  member phone', () => t8(M).then(() => ({ ok: 'note', note: 'sub-steps T8-* above' }))); await M.ctx.close() }

writeFileSync(join(OUT, 'results.json'), JSON.stringify({ results, errs }, null, 1))
const c = t => results.filter(r => r.tag === t).length
console.log(`\nSUMMARY  PASS ${c('PASS')}  FAIL ${c('FAIL')}  NOT WALKED ${c('NOT WALKED')}  (${Math.round((Date.now() - T0) / 1000)}s)`)
for (const o of LATE_OVER) console.log('LATE chip over the middle of a Ground Programme box:', o)
console.log('console/page errors:', errs.length); for (const e of [...new Set(errs)].slice(0, 40)) console.log('  ' + e)
await browser.close()
