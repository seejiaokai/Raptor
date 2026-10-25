// WALKER 2 of the M3 build's FULL check (25 Oct 26) — shared helpers. Pictures go to docs/img/handpass/2026-10-25-lw-m3-build/w2/.
// Sets the port and the picture folder BEFORE lw-r3-lib.mjs is read (it reads them at import). Nothing here touches the app's source.
import { mkdirSync, readdirSync, unlinkSync, writeFileSync } from 'node:fs'
import path from 'node:path'
process.env.LW_PORT = '4180'
process.env.LW_OUT = '2026-10-25-lw-m3-build/w2'
export const L = await import('./lw-r3-lib.mjs')
export const T = L.T
export const OUT = L.OUT
export const log = []
export const note = (id, size, said) => { log.push({ id, size, said }); console.log(`   ${id} [${size}] ${said}`) }
export const clearPrefix = prefix => { for (const f of readdirSync(OUT)) if (f.startsWith(prefix)) unlinkSync(path.join(OUT, f)) }
export const saveLog = name => writeFileSync(path.join(OUT, name), JSON.stringify(log, null, 1))

/* smooth scrolling makes a scroll lag behind the script's reading of it (lib.mjs open() does the same): switched off in every context */
const noSmooth = () => { const add = () => { const st = document.createElement('style'); st.textContent = '*{scroll-behavior:auto !important}'; (document.head || document.documentElement).appendChild(st) }; if (document.head) add(); else document.addEventListener('DOMContentLoaded', add) }
/* a desktop context at his PC's CSS size, with the same error watching lw-r3-lib's newCtx has */
export async function deskCtx() {
  const b = await L.getBrowser('chromium')
  const ctx = await b.newContext({ viewport: { width: 1536, height: 864 }, deviceScaleFactor: 1 })
  const page = await ctx.newPage()
  await page.addInitScript(noSmooth)
  const errs = []
  page.on('crash', () => console.log('   !! PAGE CRASHED (desk)'))
  page.on('console', m => { if (m.type() === 'error') errs.push('desk console: ' + m.text().slice(0, 220)) })
  page.on('pageerror', e => errs.push('desk pageerror: ' + String(e).slice(0, 220)))
  page.on('response', r => { if (r.status() >= 400) errs.push(`desk http ${r.status()}: ` + r.url().slice(0, 120)) })
  page.on('requestfailed', r => errs.push('desk requestfailed: ' + r.url().slice(0, 120) + ' ' + (r.failure()?.errorText || '')))
  return { ctx, page, cdp: null, errs, phone: false, size: 'desk', engine: 'chromium' }
}
export async function phoneCtx(engine = 'chromium') {
  const w = await L.newCtx('phone', engine)
  await w.page.addInitScript(noSmooth)
  w.page.on('requestfailed', r => w.errs.push('phone requestfailed: ' + r.url().slice(0, 120) + ' ' + (r.failure()?.errorText || '')))
  return w
}
/* a phone context carrying a saved world (localStorage of the same origin) — the fixture was built on real storage, so this is the same world at another size */
export async function phoneFrom(state, engine = 'chromium') {
  const { devices } = await import('@playwright/test')
  const b = await L.getBrowser(engine)
  const ctx = await b.newContext({ viewport: L.PHONE, hasTouch: true, isMobile: true, deviceScaleFactor: 3, userAgent: devices['iPhone 13'].userAgent, storageState: state })
  const page = await ctx.newPage()
  await page.addInitScript(noSmooth)
  const errs = []
  const tag = `phone/${engine}`
  page.on('console', m => { if (m.type() === 'error') errs.push(`${tag} console: ` + m.text().slice(0, 220)) })
  page.on('pageerror', e => errs.push(`${tag} pageerror: ` + String(e).slice(0, 220)))
  page.on('response', r => { if (r.status() >= 400) errs.push(`${tag} http ${r.status()}: ` + r.url().slice(0, 120)) })
  page.on('requestfailed', r => errs.push(`${tag} requestfailed: ` + r.url().slice(0, 120)))
  const cdp = engine === 'chromium' ? await ctx.newCDPSession(page) : null
  return { ctx, page, cdp, errs, phone: true, size: 'phone', engine }
}
export const idOf = (P, cs) => P.evaluate(cs => Object.entries(window.PEOPLE || {}).find(([, v]) => v.cs === cs)?.[0], cs)
export const bundleName = P => P.evaluate(() => [...document.scripts].map(s => s.src).filter(s => /index-/.test(s)).map(s => s.split('/').pop()).join(','))

/* a picture cut to the union of the first visible match of each selector, padded; falls back to the whole screen and says so */
export async function pic(w, name, sels, { pad = 10, scale = 'css' } = {}) {
  const P = w.page
  const file = path.join(OUT, name + '.png')
  /* a target outside the screen is brought to the middle first (a clip outside the page cannot be taken) */
  if (sels && sels.length) {
    const off = await P.evaluate(s => { const e = [...document.querySelectorAll(s)].find(e => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 }); if (!e) return false; const r = e.getBoundingClientRect(); return r.bottom < 0 || r.top > innerHeight - 20 }, sels[0])
    if (off) { await P.evaluate(s => [...document.querySelectorAll(s)].find(e => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 })?.scrollIntoView({ block: 'center', inline: 'center' }), sels[0]); await P.waitForTimeout(400) }
  }
  const clip = sels && sels.length ? await P.evaluate(({ sels, pad }) => {
    const rs = []
    for (const s of sels) for (const e of document.querySelectorAll(s)) { const r = e.getBoundingClientRect(); if (r.width > 0 && r.height > 0) { rs.push(r); break } }
    if (!rs.length) return null
    const l = Math.max(0, Math.min(...rs.map(r => r.left)) - pad), t = Math.max(0, Math.min(...rs.map(r => r.top)) - pad)
    const r = Math.min(innerWidth, Math.max(...rs.map(r => r.right)) + pad), b = Math.min(innerHeight, Math.max(...rs.map(r => r.bottom)) + pad)
    return { x: Math.round(l), y: Math.round(t), width: Math.max(10, Math.round(r - l)), height: Math.max(10, Math.round(b - t)) }
  }, { sels, pad }) : null
  if (clip) { try { await P.screenshot({ path: file, clip, scale }) } catch (e) { console.log(`   (clip failed for ${name}: ${String(e).split('\n')[0]} clip ${JSON.stringify(clip)} — whole screen pictured)`); await P.screenshot({ path: file, scale }) } }
  else { await P.screenshot({ path: file, scale }); if (sels && sels.length) console.log(`   (no match for ${sels.join(' | ')} — whole screen pictured: ${name})`) }
  return name + '.png'
}

/* ---------- the Leave War ---------- */
export const availP = (P, iso) => L.txt(P, T('avail-p-' + iso))
export const reqP = (P, iso) => L.txt(P, T('req-p-' + iso))
/* open the Manning rows (folded on a phone, D1258) and bring the person's row and the date's column in reach */
export async function warOpen(w, who, iso) {
  const P = w.page
  await P.evaluate(() => window.go('leavewar')); await P.waitForTimeout(1200)
  await L.reachCell(w, who, iso)
  if (!(await P.locator(T('avail-p-' + iso)).count())) { await P.evaluate(() => window.scrollTo(0, 0)); if (await L.vis(P, T('counts-toggle'))) { await L.press(w, T('counts-toggle')); await P.waitForTimeout(700) } await L.reachCell(w, who, iso) }
}
/* the cell's boxes in words: text | kind | state | portion | outlined? */
export async function cellBoxes(w, who, iso) {
  const i = await L.cellInfo(w.page, who, iso)
  if (!i) return null
  return i.boxes.map(b => `${b.text}|${(b.cls.match(/k-\w+/) || [''])[0]}|${(b.cls.match(/s-[awr]/) || [''])[0]}|${(b.cls.match(/\b(right-am|right-pm|top|bot|left|right|whole)\b/) || [null, 'whole'])[1]}|${/200,\s*212,\s*228/.test(b.bs) ? 'outlined' : 'plain'}|fs${b.fs}|w${b.w}h${b.h}|tw${b.tw}${b.ov > 0 ? '|OVERFLOW' + b.ov : ''}`)
}
/* put a date's column just right of the frozen names (lw-1025-q7.mjs's alignGrid, trimmed): the picture then shows the day and its neighbours */
export async function alignGrid(P, who, iso) {
  await P.locator(T(L.cellId(who, iso))).first().evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' }))
  await P.waitForTimeout(300)
  for (let i = 0; i < 5; i++) {
    const last = await P.evaluate(([who, iso]) => {
      const td = document.querySelector(`[data-testid="cell-${who}-${iso}"]`)
      const tr = td.parentElement
      const frozenRight = Math.max(0, ...[...tr.children].filter(c => getComputedStyle(c).position === 'sticky').map(c => c.getBoundingClientRect().right), ...[...document.querySelectorAll('[data-testid="frozen-cols"] td')].filter(c => c.getBoundingClientRect().width > 0).map(c => c.getBoundingClientRect().right))
      let sc = td.parentElement
      while (sc && !(sc.scrollWidth > sc.clientWidth + 2 && /auto|scroll/.test(getComputedStyle(sc).overflowX))) sc = sc.parentElement
      const r = td.getBoundingClientRect()
      const delta = r.left - (frozenRight + 3 * r.width)
      if (Math.abs(delta) > 2) { if (sc) sc.scrollLeft += delta; else window.scrollBy(delta, 0) }
      return Math.abs(delta)
    }, [who, iso])
    await P.waitForTimeout(350)
    if (last <= 2) break
  }
}
export const winTop = P => P.evaluate(() => { const w = document.querySelector('[data-testid="win-inputedit"], #inpEditPop'); if (!w) return; for (const e of [w, ...w.querySelectorAll('*')]) if (e.scrollTop > 0) e.scrollTop = 0 })
/* a picture of the person's row beside the Available / Required rows and the date's head, cut to the area */
export async function warPic(w, name, who, isos, { pad = 8 } = {}) {
  const P = w.page
  await P.locator(T(L.cellId(who, isos[0]))).first().evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })).catch(() => {})
  await P.waitForTimeout(500)
  try { await alignGrid(P, who, isos[0]) } catch (e) { console.log('   (align failed: ' + String(e).split('\n')[0] + ')') }
  const next = (iso, n) => { const d = new Date(iso + 'T00:00:00Z'); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10) }
  const last = isos[isos.length - 1], more = [next(last, 1), next(last, 2)]
  const sels = [T('head-' + isos[0]), T('head-' + last), ...more.map(d => T('head-' + d)), T('avail-p-' + isos[0]), T('avail-p-' + last), `${T('row-' + who)} td.who`, ...isos.map(d => T(L.cellId(who, d))), ...more.map(d => T(L.cellId(who, d)))]
  return pic(w, name, sels, { pad })
}

/* ---------- the Inputs page ---------- */
export async function openInputsList(w) {
  const P = w.page
  await P.evaluate(() => window.scrollTo(0, 0))
  await P.evaluate(() => window.go('inputs')); await P.waitForTimeout(1000)
  /* the page remembers its last tab: the SANS calendar or Medical may be up — the Inputs tab first */
  if (!(await L.vis(P, T('in-new'))) && await L.vis(P, '#inMemberMode')) { await L.press(w, '#inMemberMode'); await P.waitForTimeout(700) }
  if (!(await L.vis(P, T('in-new'))) && await L.vis(P, '#inListBtn')) { await L.press(w, '#inListBtn'); await P.waitForTimeout(700) }
  await P.waitForSelector(T('in-new'), { timeout: 5000 })
}
/* the input's window is [data-testid=win-inputedit] on the Inputs page and the bare #inpEditPop on the schedule (its own copy) */
export const winsOpen = P => P.evaluate(() => [...document.querySelectorAll('[data-testid="docconf"], [data-testid="oilconf"], [data-testid="upconf"], [data-testid="medconf"], [data-testid="win-inputedit"], #inpEditPop')].filter(e => e.getBoundingClientRect().width > 0).map(e => e.dataset.testid || e.id))
export const WIN = '#inpEditPop .airpop-box, [data-testid="win-inputedit"]'
export const inputsNow = P => P.evaluate(() => (window.INPUTS || []).map(r => r.iid))
export const inputById = (P, iid) => P.evaluate(iid => { const r = (window.INPUTS || []).find(r => r.iid === iid); return r ? JSON.parse(JSON.stringify(r)) : null }, iid)
/* the Inputs calendar: the Inputs tab, the calendar view, on the wanted month */
export async function inCalMonth(w, y, m) {
  const P = w.page
  await P.evaluate(() => window.scrollTo(0, 0))
  await P.evaluate(() => window.go('inputs')); await P.waitForTimeout(900)
  if (!(await L.vis(P, '#inCalBtn')) && await L.vis(P, '#inMemberMode')) { await L.press(w, '#inMemberMode'); await P.waitForTimeout(700) }
  if (await L.vis(P, '#inCalBtn') && (await P.locator('#inCalBtn').getAttribute('aria-pressed')) !== 'true') { await L.press(w, '#inCalBtn'); await P.waitForTimeout(900) }
  await P.waitForSelector('#inpCal', { timeout: 6000 })
  for (let i = 0; i < 24; i++) {
    const lab = (await P.locator('#inpCal .ic-mon').getAttribute('aria-label')) || ''
    const [mn, yr] = lab.toLowerCase().split(/\s+/)
    const cur = (+yr) * 12 + MONTHS.indexOf(mn), want = y * 12 + (m - 1)
    if (cur === want) return lab
    await L.press(w, cur < want ? '#icNext' : '#icPrev'); await P.waitForTimeout(350)
  }
  throw new Error('could not reach the Inputs calendar month')
}
/* open an input's own window by one of its three doors: 'list' (the Inputs list's row), 'cal' (the Inputs calendar's bar), 'row' (the schedule row's name) */
export async function openInputBy(w, iid, door = 'list', { y = 2026, m = 7 } = {}) {
  const P = w.page
  if (door === 'row') {
    await goEdit(w)
    const b = P.locator(`#eWeek [data-inpedit="${iid}"]`).first()
    if (!(await b.count())) throw new Error('no schedule row for ' + iid)
    await b.scrollIntoViewIfNeeded().catch(() => {}); await b.click()
  } else if (door === 'cal') {
    await inCalMonth(w, y, m)
    const bar = P.locator(`#inpCal .ib-bar[data-iid="${iid}"]`).first()
    if (!(await bar.count())) throw new Error('no bar for ' + iid)
    await bar.scrollIntoViewIfNeeded().catch(() => {}); await bar.click()
  } else {
    await openInputsList(w)
    const sel = `#inBody [data-iid="${iid}"], #inList [data-iid="${iid}"]`
    if (!(await P.locator(sel).count())) { await L.press(w, '#inRangeBtn'); await P.waitForTimeout(400); if (await L.vis(P, '#inRangeAll')) { await L.press(w, '#inRangeAll'); await P.waitForTimeout(800) } }
    const row = P.locator(sel).first()
    await row.scrollIntoViewIfNeeded().catch(() => {}); await row.click()
  }
  await P.waitForSelector('#inpEditPop', { state: 'visible', timeout: 6000 }); await P.waitForTimeout(500)
}
/* what the open window's Goes to row says, in words */
export async function goesRead(P) {
  const has = await P.locator(T('inpEdit-goes-g')).count()
  if (!has) return { row: false }
  return { row: true, g: await P.locator(T('inpEdit-goes-g')).getAttribute('aria-pressed'), u: await P.locator(T('inpEdit-goes-u')).getAttribute('aria-pressed'), line: await L.txt(P, T('inpEdit-goes-line')), gDisabled: await P.locator(T('inpEdit-goes-g')).isDisabled(), uDisabled: await P.locator(T('inpEdit-goes-u')).isDisabled() }
}
/* answer every question a save can raise; returns the list of what was asked.  oil: 'yes' | 'no' */
export async function answerAsks(w, tag, { oil = null, doc = 'nodoc', onAsk = null } = {}) {
  const P = w.page, asked = []
  for (let i = 0; i < 4; i++) {
    const open = (await winsOpen(P)).filter(t => t !== 'win-inputedit' && t !== 'inpEditPop')
    if (!open.length) return asked
    asked.push(open.join('+'))
    note(tag, w.size, 'a question opened after the save: ' + open.join(', '))
    if (onAsk) await onAsk(open, P)
    if (open.includes('docconf')) await L.press(w, T('docconf-nodoc'))
    else if (open.includes('oilconf')) {
      if (!oil) throw new Error('an OIL question opened and this step has no answer for it')
      await L.press(w, T(oil === 'yes' ? 'oil-yes' : 'oil-no')); await P.waitForTimeout(300)
      await L.press(w, T('oilconf-save'))
    } else throw new Error('a question opened that this script does not answer: ' + open.join(', '))
    await P.waitForTimeout(700)
  }
  return asked
}
/* the window's own calendar: read what it says it holds */
export const rangeRead = P => L.txt(P, '#inpEditPop .rc-read')
/* open the Inputs list's "+ Input" window for a person and a kind */
export async function newWindow(w, who, type) {
  const P = w.page
  await openInputsList(w)
  await L.press(w, T('in-new')); await P.waitForSelector(T('win-inputedit'), { timeout: 5000 }); await P.waitForTimeout(600)
  if (who) await P.locator('#inpEditPerson').selectOption({ label: who })
  if (type) { await P.locator('#inpEditType').selectOption(type); await P.waitForTimeout(400) }
}
/* set the dates through the window's calendar by tapping, then check the readout is the wanted range */
export async function pickDates(w, from, to) {
  const P = w.page
  await L.press(w, `[data-testid="inpEdCal-day-${from}"]`); await P.waitForTimeout(250)
  if (to && to !== from) { await L.press(w, `[data-testid="inpEdCal-day-${to}"]`); await P.waitForTimeout(250) }
  else { /* a single day: the second tap on the same day ends it there */ await L.press(w, `[data-testid="inpEdCal-day-${from}"]`); await P.waitForTimeout(250) }
  return rangeRead(P)
}
/* File an input through the window.  o: { who, type, from, to, remarks, goes: 'g'|'u'|null, toWhere, times: [s, e] | null, oil, extraPeople: [cs..] , allAvail }
   returns { rec, asked, readout }  — rec is the NEW input (found by the difference of ids) */
export async function fileInput(w, o) {
  const P = w.page
  const before = await inputsNow(P)
  await newWindow(w, o.allAvail ? null : o.who, o.type)
  const out = { asked: [] }
  if (o.several) {
    await L.press(w, `${T('win-inputedit')} ${T('pp-several')}`); await P.waitForTimeout(400)
    const want = []
    for (const cs of o.several) want.push(await idOf(P, cs))
    for (const id of want) if ((await P.locator(`${T('win-inputedit')} [data-pp="${id}"]`).getAttribute('aria-pressed')) !== 'true') { await L.press(w, `${T('win-inputedit')} [data-pp="${id}"]`); await P.waitForTimeout(150) }
    const pressed = await P.evaluate(sel => [...document.querySelectorAll(`${sel} [data-pp][aria-pressed="true"]`)].map(b => b.getAttribute('data-pp')), T('win-inputedit'))
    for (const id of pressed) if (!want.includes(id)) { await L.press(w, `${T('win-inputedit')} [data-pp="${id}"]`); await P.waitForTimeout(150) }
    if (o.goes && o.goesFirst) { await L.press(w, T('inpEdit-goes-' + o.goes)); await P.waitForTimeout(250); out.goesBeforeAll = await goesRead(P) }
    if (o.allAvailToo) { await L.press(w, `${T('win-inputedit')} [data-ph="allavail"]`); await P.waitForTimeout(350) }
    out.picked = await L.txt(P, T('pp-count'))
  }
  if (o.allAvail && !o.several) { await P.locator('#inpEditPerson').selectOption('allavail'); await P.waitForTimeout(300) }
  out.goesRow = await P.locator(T('inpEdit-goes-g')).count()
  if (o.goes && !(o.several && o.goesFirst)) { if (out.goesRow) { await L.press(w, T('inpEdit-goes-' + o.goes)); await P.waitForTimeout(250) } else out.goesRowMissing = true }
  if (o.toWhere != null) await P.locator('#inpEditTo').fill(o.toWhere)
  if (o.remarks != null) await P.locator('#inpEditRmk').fill(o.remarks)
  out.readout = await pickDates(w, o.from, o.to)
  if (o.times) {
    if (await P.locator('#inpEditAllday').count() && await P.locator('#inpEditAllday').isChecked()) { await L.press(w, '#inpEditAllday'); await P.waitForTimeout(250) }
    await P.locator('#inpEditStart').fill(o.times[0]); await P.locator('#inpEditEnd').fill(o.times[1])
  }
  out.goesLine = await L.txt(P, T('inpEdit-goes-line'))
  out.keep = o.keepOpen === true
  if (o.beforeSave) await o.beforeSave(out)
  await L.press(w, '#inpEditSave'); await P.waitForTimeout(1200)
  out.asked = await answerAsks(w, o.tag || 'file', { oil: o.oil, onAsk: o.onAsk })
  const after = await inputsNow(P)
  const fresh = after.filter(i => !before.includes(i))
  out.freshIds = fresh
  out.recs = []
  for (const iid of fresh) out.recs.push(await inputById(P, iid))
  out.rec = out.recs[0] || null
  return out
}

/* ---------- Edit Schedule's lists ---------- */
export const dayScope = (page, di) => `${page === 'editsched' ? '#eWeek' : '#vWeek'} section.day[data-day="${di}"]`
/* a week left blank after the Scheduler Board closes is drawn again by leaving the page and coming back */
export async function goEdit(w) { if (await w.page.evaluate(() => window.CURPAGE === 'editsched')) { await w.page.evaluate(() => window.go('viewsched')); await w.page.waitForTimeout(400) } await w.page.evaluate(() => window.go('editsched')); await w.page.waitForTimeout(1500); await w.page.waitForSelector('#eWeek section.day[data-day="0"]', { state: 'attached', timeout: 8000 }) }
/* the rows of a section of a day as {text, btns}; the section: 'sec-unav' | 'sec-grnd' | 'sec-inp' | 'sec-com'  */
export const rowsOf = (P, di, secCls, scopeRoot = '#eWeek') => P.evaluate(([di, secCls, root]) => {
  const d = document.querySelector(`${root} section.day[data-day="${di}"]`)
  if (!d) return { noDay: true }
  const sec = d.querySelector(`.${secCls}`)
  if (!sec) return { noSection: true }
  return { rows: [...sec.querySelectorAll('.pl-row')].map(r => ({ text: r.innerText.replace(/\s+/g, ' ').trim(), btns: [...r.querySelectorAll('.accb')].map(b => b.textContent.trim()) })) }
}, [di, secCls, scopeRoot])
/* mark one row (by who and words) so it can be pressed and pictured; returns its text and buttons */
export async function tagRow(P, di, secCls, attr, re, root = '#eWeek') {
  return P.evaluate(([di, secCls, attr, re, root]) => {
    document.querySelectorAll(`[${attr}]`).forEach(e => e.removeAttribute(attr))
    const d = document.querySelector(`${root} section.day[data-day="${di}"]`)
    if (!d) return { noDay: true }
    const rows = [...d.querySelectorAll(`.${secCls} .pl-row`)]
    const r = rows.find(r => new RegExp(re, 'i').test(r.innerText))
    if (!r) return { rows: rows.map(x => x.innerText.replace(/\s+/g, ' ').trim().slice(0, 90)) }
    r.setAttribute(attr, '1')
    return { text: r.innerText.replace(/\s+/g, ' ').trim(), btns: [...r.querySelectorAll('.accb')].map(b => b.textContent.trim()) }
  }, [di, secCls, attr, re, root])
}
/* press the row's button whose words are exactly `label` */
export async function pressRowBtn(w, attr, label) {
  const sel = `[${attr}="1"] .accb`
  const n = await w.page.locator(sel).count()
  for (let i = 0; i < n; i++) {
    const t = (await w.page.locator(sel).nth(i).innerText()).trim()
    if (t.toLowerCase() === label.toLowerCase()) {
      await w.page.locator(sel).nth(i).scrollIntoViewIfNeeded().catch(() => {})
      await w.page.locator(sel).nth(i).click(); await w.page.waitForTimeout(900); return true
    }
  }
  return false
}
export async function centreOn(P, sels) {
  await P.locator(sels[0]).first().evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })).catch(() => {})
  await P.waitForTimeout(350)
}

/* ---------- the SANS calendar ---------- */
export async function sansOpen(w) {
  const P = w.page
  await P.evaluate(() => window.scrollTo(0, 0))
  await P.evaluate(() => window.go('inputs')); await P.waitForTimeout(900)
  if (!(await L.vis(P, T('sanscal')))) { await L.press(w, '#inSansMode'); await P.waitForTimeout(900) }
  await P.waitForSelector(T('sanscal'), { timeout: 6000 })
}
const MONTHS = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december']
export async function sansMonth(w, y, m) {
  const P = w.page
  for (let i = 0; i < 24; i++) {
    const lab = (await P.locator(T('sc-month')).getAttribute('aria-label')) || ''
    const [mn, yr] = lab.toLowerCase().split(/\s+/)
    const cur = (+yr) * 12 + MONTHS.indexOf(mn), want = y * 12 + (m - 1)
    if (cur === want) return lab
    await L.press(w, T(cur < want ? 'sc-next' : 'sc-prev')); await P.waitForTimeout(350)
  }
  throw new Error('could not reach the SANS month')
}
export const sansNeed = (P, iso) => L.txt(P, T('sc-need-' + iso))
export const sansDayWords = (P, iso) => P.evaluate(iso => { const e = document.querySelector(`[data-testid="sc-day-${iso}"]`); return e ? e.innerText.replace(/\s+/g, ' ').trim() : null }, iso)

/* ---------- the changes window (the clock in the top bar) and the bell ---------- */
export const chgText = P => P.evaluate(() => {
  const tw = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT); let t = null, n
  while ((n = tw.nextNode())) if (/^\s*Changes · /.test(n.textContent) && n.parentElement && n.parentElement.getBoundingClientRect().width > 0) { t = n.parentElement; break }
  if (!t) return null
  let box = t
  for (let i = 0; i < 6 && box.parentElement; i++) { box = box.parentElement; if (box.getBoundingClientRect().height > 150) break }
  return box.innerText.replace(/\s+/g, ' ').slice(0, 1500)
})
export async function openChanges(w, tab = 'All changes') {
  const P = w.page
  if (!(await chgText(P))) { await P.locator('#histBtn').click(); await P.waitForTimeout(900) }
  if (tab) { await P.getByText(tab, { exact: false }).first().click().catch(() => {}); await P.waitForTimeout(700) }
  return chgText(P)
}
export async function closeChanges(w) {
  const P = w.page
  await P.evaluate(() => {
    const tw = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT); let t = null, n
    while ((n = tw.nextNode())) if (/^\s*Changes · /.test(n.textContent) && n.parentElement && n.parentElement.getBoundingClientRect().width > 0) { t = n.parentElement; break }
    let box = t
    for (let i = 0; i < 6 && box; i++) { const b = [...box.querySelectorAll('button')].find(b => /✕|×/.test(b.textContent || '') || /close/i.test(b.getAttribute('aria-label') || '')); if (b) { b.click(); return } box = box.parentElement }
  })
  await P.waitForTimeout(500)
}
export async function bellText(w) {
  const P = w.page
  /* a first tap may only clear the view's own alert ("Notifications cleared"): tap again when no list came up */
  const read = () => P.evaluate(() => { const l = document.querySelector('[data-testid="bell-list"]'); return l ? l.innerText.replace(/\s+/g, ' ').slice(0, 800) : null })
  let t = null
  for (let i = 0; i < 2 && t == null; i++) { await P.locator('.bellbtn:visible').first().click().catch(() => {}); await P.waitForTimeout(900); t = await read() }
  return t == null ? 'no list' : t
}
export async function closeBell(w) { await w.page.keyboard.press('Escape'); await w.page.waitForTimeout(300); if (await w.page.locator('[data-testid="bell-list"], [data-testid="bell-empty"]').first().isVisible().catch(() => false)) { await w.page.locator('.bellbtn:visible').first().click().catch(() => {}); await w.page.waitForTimeout(400) } }

export async function closeBrowser() { await L.closeBrowser() }

/* Two strips instead of one picture: the date head with the Available rows (the frozen top block), and the person's own row — both across the screen's width, so a
   row far down the list is pictured with his name and the day's column, the dates reading straight down from one strip to the other. */
export async function warStrips(w, name, who, isos) {
  const P = w.page
  const iso = Array.isArray(isos) ? isos[0] : isos
  await P.locator(T(L.cellId(who, iso))).first().evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' }))
  await P.waitForTimeout(600)
  await P.evaluate(iso => {
    document.querySelectorAll('[data-w2pic]').forEach(e => e.removeAttribute('data-w2pic'))
    const mark = (s, k) => { const e = document.querySelector(s); const tr = e && (e.closest('tr') || e); if (tr) tr.setAttribute('data-w2pic', k) }
    mark(`[data-testid="head-${iso}"]`, 'h1'); mark(`[data-testid="avail-p-${iso}"]`, 'h2'); mark(`[data-testid="avail-w-${iso}"]`, 'h3')
  }, iso)
  const a = await pic(w, name + '-head', ['[data-w2pic="h1"]', '[data-w2pic="h2"]', '[data-w2pic="h3"]'], { pad: 2 })
  const b = await pic(w, name, [T('row-' + who)], { pad: 3 })
  return [a, b]
}

/* a picture at a higher pixel density, for boxes a few pixels wide: the page's CSS layout is the same, only the pixels per CSS pixel change (CDP) */
export async function zoomPic(w, name, sels, { pad = 6, dsf = 4 } = {}) {
  const P = w.page
  const cdp = await w.ctx.newCDPSession(P)
  const vp = P.viewportSize()
  await cdp.send('Emulation.setDeviceMetricsOverride', { width: vp.width, height: vp.height, deviceScaleFactor: dsf, mobile: false })
  await P.waitForTimeout(500)
  const f = await pic(w, name, sels, { pad, scale: 'device' })
  await cdp.send('Emulation.clearDeviceMetricsOverride').catch(() => {})
  await cdp.detach().catch(() => {})
  await P.waitForTimeout(300)
  return f
}

/* the same saved world in a context of a higher pixel density: a picture of boxes a few pixels wide, readable (the layout is the same, only the pixels per CSS pixel change) */
export async function deskFrom(state, dsf = 4) {
  const b = await L.getBrowser('chromium')
  const ctx = await b.newContext({ viewport: { width: 1536, height: 864 }, deviceScaleFactor: dsf, storageState: state })
  const page = await ctx.newPage()
  await page.addInitScript(noSmooth)
  const errs = []
  page.on('pageerror', e => errs.push('zoom pageerror: ' + String(e).slice(0, 220)))
  page.on('response', r => { if (r.status() >= 400) errs.push(`zoom http ${r.status()}: ` + r.url().slice(0, 120)) })
  return { ctx, page, cdp: null, errs, phone: false, size: 'desk', engine: 'chromium' }
}
export async function zoomCells(w, name, who, iso, more = [], { dsf = 5, pad = 10 } = {}) {
  const state = await w.ctx.storageState()
  const z = await deskFrom(state, dsf)
  try {
    await L.signInPlain(z, 'admin')
    await warOpen(z, who, iso)
    await z.page.locator(T(L.cellId(who, iso))).first().evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' }))
    await z.page.waitForTimeout(600)
    return await pic(z, name, [T(L.cellId(who, iso)), ...more.map(d => T(L.cellId(who, d)))], { pad, scale: 'device' })
  } finally { await z.ctx.close() }
}
