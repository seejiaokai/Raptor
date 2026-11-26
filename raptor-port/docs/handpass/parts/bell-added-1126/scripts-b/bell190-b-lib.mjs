// bell190-b shared helpers — the Inputs page walk (walker B). Every control here was proved on the running build by the
// probes bell190-b-probe*.mjs (26 Nov 26).
import { createRequire } from 'module'
import { mkdirSync, readdirSync, unlinkSync, existsSync } from 'fs'
const require = createRequire(process.cwd() + '/package.json')
const pw = require('playwright')
export const URL = process.env.B_URL || 'http://localhost:4190/'
const ENGINE = process.env.B_ENGINE || 'chromium'          // the host's WebKit re-run: B_ENGINE=webkit B_URL=http://localhost:4173/
const SUFFIX = process.env.B_SUFFIX || ''                    // e.g. "-webkit", added to every picture's name
export const PICS = process.cwd().replace(/\\/g, '/') + '/docs/img/handpass/2026-11-26-bell-added/b'
export const ID = { Ranger: 'bane', Saber: 'stiff', Tally: 'nick', Hex: 'rocky' }   // Moxie's id is read after he is made

/* a phone taps, a desktop clicks */
export async function press(page, sel) { if (page._touch) await page.tap(sel); else await page.click(sel) }
export function clearPics(prefix) {
  mkdirSync(PICS, { recursive: true })
  for (const f of readdirSync(PICS)) if (f.startsWith(prefix)) unlinkSync(PICS + '/' + f)
}
export async function launch(kind = 'desk') {
  let b, ctx
  if (kind === 'phone') {
    /* WebKit refuses this port ("Not allowed to use restricted network port 4190" — bell190-b-wk.mjs, 26 Nov 26), and the
       walker may not start a server: the phone is walked in Chromium at his iPhone's size, touch and pixel density */
    b = await pw[ENGINE].launch()
    ctx = await b.newContext({ viewport: { width: 402, height: 874 }, isMobile: true, hasTouch: true, deviceScaleFactor: 3 })
  } else {
    b = await pw.chromium.launch()
    ctx = await b.newContext({ viewport: { width: 1536, height: 864 } })
  }
  const page = await ctx.newPage(); page._touch = kind === 'phone'
  const errs = []
  page.on('pageerror', e => errs.push('pageerror ' + String(e)))
  page.on('console', m => { if (m.type() === 'error') errs.push('console ' + m.text()) })
  page.on('response', r => { if (r.status() >= 400) errs.push('http ' + r.status() + ' ' + r.url()) })
  return { b, ctx, page, errs, kind }
}
export async function pic(page, name) {
  await page.screenshot({ path: PICS + '/' + name + SUFFIX + '.png' })
  return 'b/' + name + SUFFIX + '.png'
}
export async function signIn(page, u, p) {
  // WebKit: a sign-out may still be navigating when the next sign-in starts — wait for it, then go again once
  try { await page.goto(URL) } catch (e) { await page.waitForTimeout(800); await page.goto(URL) }
  await page.waitForSelector('#luser')
  await page.fill('#luser', u); await page.fill('#lpass', p)
  await press(page,'#loginForm button[type=submit]'); await page.waitForSelector('#notifyBell', { timeout: 15000 })
  await page.waitForTimeout(500)
  const badge = await page.locator('#roleBadge').innerText().catch(() => '?')
  return badge.replace(/\s+/g, ' ')
}
export async function signOut(page) {
  await closeBell(page)
  await closeWin(page)
  // a fixture step: on a phone Logout sits in the side menu, so it is pressed by the element's own click
  if (page._touch) await page.evaluate(() => document.querySelector('#logout').click())
  else await press(page, '#logout')
  await page.waitForSelector('#luser')
}
export const as = {
  saber: page => signIn(page, 'ad', 'a'),
  ranger: page => signIn(page, 'us', 'us'),
  moxie: page => signIn(page, 'moxie@mail', 'x'),
  hex: page => signIn(page, 'hex', 'x'),
}
/* Saber adds Moxie, a WSO, CAT B, member, sign-in moxie@mail, on Admin -> Users — the app's own form */
export async function makeMoxie(page) {
  // a fixture step, not under test: on a phone the add form sits out of reach of fill, so it is made at a desktop's width
  if (page._touch) { await page.setViewportSize({ width: 1200, height: 874 }); await page.waitForTimeout(300) }
  await page.evaluate(() => window.go('admin')); await page.waitForFunction(() => window.CURPAGE === 'admin'); await page.waitForTimeout(500)
  await page.locator('#accAddCs').scrollIntoViewIfNeeded()
  await page.fill('#accAddCs', 'Moxie'); await page.fill('#accAddIni', 'MX')
  await page.selectOption('#accAddSeat', 'RCP'); await page.selectOption('#accAddCat', 'B')
  await page.fill('#accAddName', 'moxie@mail'); await page.waitForTimeout(150)
  await press(page,'#accAdd'); await page.waitForTimeout(500)
  const id = await page.evaluate(() => Object.keys(window.PEOPLE).find(k => window.PEOPLE[k].cs === 'Moxie'))
  if (!id) throw new Error('Moxie was not added')
  if (page._touch) { await page.setViewportSize({ width: 402, height: 874 }); await page.waitForTimeout(300) }
  ID.Moxie = id
  return id
}
export async function moxieId(page) {
  const id = await page.evaluate(() => Object.keys(window.PEOPLE).find(k => window.PEOPLE[k].cs === 'Moxie'))
  if (id) ID.Moxie = id
  return id
}
export async function goInputs(page) {
  await closeBell(page)
  await page.evaluate(() => window.go('inputs')); await page.waitForFunction(() => window.CURPAGE === 'inputs'); await page.waitForTimeout(600)
}
const MONTHS = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december']
export async function monthStill(page) {
  await page.waitForTimeout(60)
  await page.waitForFunction(() => !document.getAnimations().some(a => a.playState === 'running' && isFinite(a.effect?.getComputedTiming?.().endTime ?? Infinity)), null, { timeout: 3000 }).catch(() => {})
  await page.waitForTimeout(80)
}
export async function toMonth(page, y, m) {
  if (await page.locator('#inCalBtn').count()) { await press(page,'#inCalBtn').catch(() => {}); await page.waitForTimeout(300) }
  for (let i = 0; i < 40; i++) {
    const t = (await page.locator('[data-testid="ic-mon"]').first().innerText()).trim().toLowerCase().split(/\s+/)
    const d = y * 12 + (m - 1) - (+t[1] * 12 + MONTHS.findIndex(x => x.startsWith(t[0].slice(0, 3))))
    if (!d) { await monthStill(page); return t.join(' ') }
    await press(page,d > 0 ? '#icNext' : '#icPrev'); await page.waitForTimeout(320)
  }
  throw new Error('month never reached')
}
export const WIN = '[data-testid="win-inputedit"]'
export async function openNewFromList(page) {
  await press(page,'#inListBtn'); await page.waitForTimeout(400)
  await press(page,'#inNew'); await page.waitForSelector(WIN)
}
export async function openDay(page, iso) {
  await toMonth(page, +iso.slice(0, 4), +iso.slice(5, 7))
  const cell = page.locator(`#inpCal [data-icday="${iso}"]`)
  if (page._touch) await cell.tap({ position: { x: 8, y: 8 } }); else await cell.click({ position: { x: 8, y: 8 } })
  await page.waitForSelector('#icPopAdd', { timeout: 5000 })
  await page.waitForTimeout(300)
}
export async function openNewFromDay(page, iso) {
  await openDay(page, iso)
  await press(page,'#icPopAdd'); await page.waitForSelector(WIN)
}
export async function setType(page, t) { await page.selectOption('#inpEditType', t); await page.waitForTimeout(200) }
/* one person: the A-to-Z list; several: the "Several people" switch and the pucks */
export async function setPeople(page, ids, edit = false) {
  // a medical or a leave window has no "Several people" switch: one person, the A-to-Z list
  if (!(await page.locator(`${WIN} [data-testid="pp-several"]`).count())) { await page.selectOption('#inpEditPerson', ids[0]); await page.waitForTimeout(150); return }
  const several = await page.locator('[data-testid="pp-several"]').getAttribute('aria-checked')
  if (ids.length === 1 && several !== 'true' && !edit) { await page.selectOption('#inpEditPerson', ids[0]); await page.waitForTimeout(150); return }
  if (several !== 'true') {
    if (!edit && await page.locator('#inpEditPerson').count()) await page.selectOption('#inpEditPerson', ids[0]).catch(() => {})
    await press(page,'[data-testid="pp-several"]'); await page.waitForTimeout(250)
  }
  const want = new Set(ids)
  // add the wanted first, so the last man is never cleared
  for (const id of ids) {
    const sel = id === 'allavail' || id === 'all' ? `${WIN} [data-ph="${id}"]` : `${WIN} [data-pp="${id}"]`
    const on = await page.locator(sel).first().getAttribute('aria-pressed')
    if (on !== 'true') { await page.locator(sel).first().click(); await page.waitForTimeout(120) }
  }
  const chosen = await page.evaluate(w => [...document.querySelectorAll(w + ' [aria-pressed="true"][data-pp], ' + w + ' [aria-pressed="true"][data-ph]')].map(e => e.getAttribute('data-pp') || e.getAttribute('data-ph')), WIN)
  for (const id of chosen) if (!want.has(id)) {
    const sel = id === 'allavail' || id === 'all' ? `${WIN} [data-ph="${id}"]` : `${WIN} [data-pp="${id}"]`
    await page.locator(sel).first().click(); await page.waitForTimeout(120)
  }
}
export async function chosenPeople(page) {
  return page.evaluate(w => {
    const s = document.querySelector(w + ' [data-testid="pp-several"]')
    if (s && s.getAttribute('aria-checked') === 'true') return [...document.querySelectorAll(w + ' [aria-pressed="true"][data-pp], ' + w + ' [aria-pressed="true"][data-ph]')].map(e => e.getAttribute('data-pp') || e.getAttribute('data-ph'))
    const sel = document.querySelector('#inpEditPerson'); return sel ? [sel.value] : []
  }, WIN)
}
export async function pickDates(page, from, to) {
  // the window's calendar may open on another month: step it to the month of `from`
  for (let i = 0; i < 24; i++) {
    if (await page.locator(`[data-testid="inpEdCal-day-${from}"]`).count()) break
    await press(page,'[data-testid="inpEdCal-next"]'); await page.waitForTimeout(150)
  }
  await press(page,`[data-testid="inpEdCal-day-${from}"]`); await page.waitForTimeout(150)
  if (to && to !== from) { await press(page,`[data-testid="inpEdCal-day-${to}"]`); await page.waitForTimeout(150) }
}
/* press Add / Save; answer what the app asks (the document question: "no document"); return what stood after */
export async function save(page, opts = {}) {
  await press(page,'#inpEditSave'); await page.waitForTimeout(500)
  const asked = []
  for (let i = 0; i < 4; i++) {
    if (!(await page.locator(WIN).count())) break
    const q = await page.evaluate(w => {
      const vis = e => e && e.getBoundingClientRect().width > 0
      const cands = [...document.querySelectorAll('[data-testid="oilconf"], [data-testid="docconf"], [data-testid*="confirm"], [data-testid*="conf"], .askcard, [role="alertdialog"], .airpop')].filter(vis).filter(e => !e.matches(w))
      return cands.map(e => (e.getAttribute('data-testid') || e.className) + ': ' + e.innerText.replace(/\s+/g, ' ').slice(0, 200))
    }, WIN)
    if (!q.length) break
    asked.push(...q)
    // the leave / medical "No document" question: answered "No document", as a filer with none yet does
    const nodoc = page.locator('[data-testid="docconf-nodoc"]')
    if (await nodoc.count() && await nodoc.isVisible()) { if (opts.picAsk) await pic(page, opts.picAsk); await nodoc.click(); await page.waitForTimeout(600); continue }
    if (opts.onAsk) { const done = await opts.onAsk(page, q); if (done) { await page.waitForTimeout(500); continue } }
    break
  }
  return { open: await page.locator(WIN).count(), asked }
}
export async function inputIds(page) { return page.evaluate(() => window.INPUTS.map(r => r.iid)) }
export async function made(page, had) {
  return page.evaluate(had => window.INPUTS.filter(r => !had.includes(r.iid)).map(r => ({ iid: r.iid, people: (r.people || [{ p: r.person }]).map(e => e.p), type: r.type, date: r.date, endDate: r.endDate, by: r.by, acc: r.acc })), had)
}
export async function input(page, iid) {
  return page.evaluate(iid => { const r = window.INPUTS.find(x => x.iid === iid); return r ? { iid: r.iid, people: (r.people || [{ p: r.person }]).map(e => e.p), type: r.type, date: r.date, endDate: r.endDate, by: r.by } : null }, iid)
}
export async function notices(page) { return page.evaluate(() => JSON.parse(JSON.stringify(window.NOTICES || []))) }
export function newNotices(all, before) { const ids = new Set(before.map(n => n.id)); return all.filter(n => !ids.has(n.id)) }
export function fmt(ns) { return ns.map(n => `to=${n.to} by=${n.by} ${n.name} ${n.day} what=${JSON.stringify(n.what)}${n.read ? ' READ' : ''}`).join('\n    ') }
/* the bell on screen: open it, read every line, picture it */
export async function closeDay(page) {
  const x = page.locator('[data-testid="win-inputsday-x"]').first()
  if (await x.count() && await x.isVisible()) { if (page._touch) await x.tap(); else await x.click(); await page.waitForTimeout(350); return true }
  return false
}
export async function readBell(page, picName) {
  await closeBell(page)
  if (page._touch) await closeDay(page)   // on a phone the opened day's panel stands over the bell (recorded in s1p's log)
  const lit = await page.evaluate(() => { const b = document.querySelector('#notifyBell'); return { on: b.classList.contains('on'), dot: !!b.querySelector('.belldot') && getComputedStyle(b.querySelector('.belldot')).display !== 'none' } })
  if (page._touch) {
    await page.tap('#notifyBell'); await page.waitForTimeout(60)
    if (picName) await pic(page, picName + '-tap')          // a picture right after the tap (D1281)
    await page.waitForTimeout(400)
  } else { await press(page,'#notifyBell'); await page.waitForTimeout(450) }
  const shot = picName ? await pic(page, picName) : null
  const lines = await page.evaluate(() => {
    const l = document.querySelector('.bell-list')
    if (!l || l.getBoundingClientRect().width < 1) return null
    return [...l.querySelectorAll('.bl-line')].map(e => ({ id: e.getAttribute('data-testid'), unread: e.classList.contains('unread'), name: e.querySelector('.bl-name')?.innerText, day: e.querySelector('.bl-day')?.innerText, what: e.querySelector('.bl-what')?.innerText, text: e.innerText.replace(/\s+/g, ' ') }))
  })
  const toast = lines ? null : await page.evaluate(() => document.body.innerText.match(/Nothing new[^\n]*/)?.[0] || null)
  return { lit, lines, toast, shot }
}
export function bellText(r) {
  if (!r.lines) return `(no list) ${r.toast || ''}`.trim()
  if (!r.lines.length) return '(empty list)'
  return r.lines.map(l => `${l.unread ? '•' : '○'} ${l.name} | ${l.day} | ${l.what}`).join(' // ')
}
export async function closeBell(page) {
  const open = await page.evaluate(() => { const l = document.querySelector('.bell-list'); return !!l && l.getBoundingClientRect().width > 0 })
  if (open) { await press(page,'#notifyBell').catch(() => {}); await page.waitForTimeout(250) }
}
/* tap the bell line whose name matches; report what opened */
export async function tapLine(page, match, picName) {
  const lines = page.locator('.bell-list .bl-line')
  const n = await lines.count()
  let hit = -1
  for (let i = 0; i < n; i++) { const t = await lines.nth(i).innerText(); if (!match || t.includes(match)) { hit = i; break } }
  if (hit < 0) return { opened: 'NO LINE TO TAP' }
  if (page._touch) await lines.nth(hit).tap(); else await lines.nth(hit).click()
  await page.waitForTimeout(250)
  const quick = picName ? await pic(page, picName + '-tap') : null
  await page.waitForTimeout(700)
  const shot = picName ? await pic(page, picName) : null
  const what = await page.evaluate(w => {
    const win = document.querySelector(w)
    return { page: window.CURPAGE, window: win && win.getBoundingClientRect().width > 0 ? win.innerText.replace(/\s+/g, ' ').slice(0, 160) : null }
  }, WIN)
  return { ...what, shot, quick }
}
/* open an input's own window from the List: its row carries data-iid */
export async function openFromList(page, iid) {
  await press(page,'#inListBtn'); await page.waitForTimeout(400)
  let row = page.locator(`#page-inputs [data-iid="${iid}"]:visible`).first()
  if (!(await row.count())) {
    // the List opens on today's fortnight (26 Nov -> 10 Dec): pick "All dates" to reach July
    await press(page, '#inRangeBtn'); await page.waitForTimeout(250)
    await press(page, '#inRangeAll'); await page.waitForTimeout(400)
    row = page.locator(`#page-inputs [data-iid="${iid}"]:visible`).first()
  }
  await row.scrollIntoViewIfNeeded()
  if (page._touch) await row.tap(); else await row.click()
  await page.waitForSelector(WIN, { timeout: 5000 })
}
export async function openFromBar(page, iid, iso) {
  await toMonth(page, +iso.slice(0, 4), +iso.slice(5, 7))
  const bar = page.locator(`#inpCal .ib-bar[data-iid="${iid}"]`).first()
  await bar.click()
  await page.waitForSelector(WIN, { timeout: 5000 })
}
export async function openFromDayCard(page, iid, iso) {
  await openDay(page, iso)
  const card = page.locator(`[data-popiid="${iid}"]:visible`).first()
  await card.scrollIntoViewIfNeeded().catch(() => {})
  await card.click()
  await page.waitForSelector(WIN, { timeout: 5000 })
}
export async function closeWin(page) {
  for (const sel of ['#inpEditCancel', '#inpEditClose', '[data-testid="win-inputedit-x"]']) {
    if (!(await page.locator(WIN).count())) break
    const l = page.locator(sel).first()
    if (await l.count() && await l.isVisible()) { await l.click().catch(() => {}); await page.waitForTimeout(250) }
  }
  if (await page.locator(WIN).count()) { await page.keyboard.press('Escape'); await page.waitForTimeout(250) }
  return (await page.locator(WIN).count()) === 0
}
/* file one input through the window; returns the new record */
export async function file(page, o) {
  const had = await inputIds(page)
  if (o.from === 'day') await openNewFromDay(page, o.from2 || o.date)
  else await openNewFromList(page)
  await setType(page, o.type)
  if (o.title) await page.locator('#inpEditOwnTitle').evaluate((el, v) => {   // set through the box's own change event (no typing — a phone would zoom)
    const set = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set; set.call(el, v)
    el.dispatchEvent(new Event('input', { bubbles: true })); el.dispatchEvent(new Event('change', { bubbles: true }))
  }, o.title)
  await setPeople(page, o.people)
  if (!(o.from === 'day' && !o.to)) await pickDates(page, o.date, o.to)
  const ppl = await chosenPeople(page)
  if (o.picBefore) await pic(page, o.picBefore)
  const r = await save(page, o)
  const rows = await made(page, had)
  return { rows, ppl, ...r }
}
