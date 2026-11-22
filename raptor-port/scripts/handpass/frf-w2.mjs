// Walker w2 of the fable-read-faults bug check (22 Nov 26, chat 138): the Inputs faults F1–F4 walked through the app's
// own doors, desktop Chromium 1536x864 and iPhone WebKit 402x874. Brief:
// docs/superpowers/briefs/2026-11-22-fable-read-faults-walk-brief.md.
// Run from raptor-port/ against a served build:  W2_URL=http://localhost:4312/ node scripts/handpass/frf-w2.mjs
//   ONLY=s2|s3|s4   one scenario (pictures then go to an only-<filter> sub-folder)   SZ=d|p   one size
import { chromium, webkit } from '@playwright/test'
import { existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const VERSION = 'frf-w2 v1 (22 Nov 26)'
const HERE = dirname(fileURLToPath(import.meta.url))
const URL_ = process.env.W2_URL || 'http://localhost:4312/'
const ONLY = process.env.ONLY || '', SZONLY = process.env.SZ || ''
const BASE = resolve(HERE, '../../docs/img/handpass/2026-11-22-fable-read-faults/w2')
const OUT = ONLY || SZONLY ? resolve(BASE, `only-${ONLY || 'all'}-${SZONLY || 'both'}`) : BASE
if (existsSync(OUT)) rmSync(OUT, { recursive: true, force: true })
mkdirSync(OUT, { recursive: true })
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const launchOpts = existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {}
const SIZES = {
  d: { name: 'desktop', eng: chromium, opts: { viewport: { width: 1536, height: 864 } } },
  p: { name: 'phone', eng: webkit, opts: { viewport: { width: 402, height: 874 }, isMobile: true, hasTouch: true, deviceScaleFactor: 3 } },
}
/* the input's window: a floating window on the Inputs page, the schedule's own pop-up (#inpEditPop) on Edit Schedule and the board */
const WIN = ':is([data-testid="win-inputedit"], #inpEditPop:not([hidden]))'
const results = []
const log = (...a) => console.log(...a)
log(VERSION, URL_, 'out', OUT)
/* a tiny real PNG (1x1, blue) — what the Document button is handed */
const PNG = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', 'base64')

function mkCtx(page, sz, scen) {
  const errs = []
  page.on('pageerror', e => errs.push('pageerror: ' + e.message))
  page.on('console', m => { if (m.type() === 'error') errs.push('console: ' + m.text()) })
  page.on('requestfailed', r => errs.push('requestfailed: ' + r.url() + ' ' + (r.failure()?.errorText || '')))
  page.on('response', r => { if (r.status() >= 400) errs.push('http ' + r.status() + ' ' + r.url()) })
  const phone = sz.name === 'phone'
  let n = 0
  const c = {
    p: page, sz, phone, errs, scen,
    async shot(step) { const f = `${scen}-${String(++n).padStart(2, '0')}-${step}-${sz.name}.png`; await page.screenshot({ path: resolve(OUT, f) }); return f },
    /* a press as a person makes it: a tap on the phone (with a picture within ~100ms of the lift), a click on the desktop */
    async press(sel, step) {
      const l = typeof sel === 'string' ? page.locator(sel).first() : sel
      await l.scrollIntoViewIfNeeded().catch(() => {})
      if (phone) { await l.tap(); if (step) { await c.shot(step + '-tap') } }
      else await l.click()
      await page.waitForTimeout(phone ? 450 : 250)
    },
    async toasts() { return page.evaluate(() => (window.__w2toasts || []).slice()) },
    async clearToasts() { await page.evaluate(() => { window.__w2toasts = [] }) },
    rec(id, pass, note, pics = []) { results.push({ scen, size: sz.name, id, pass, note, pics }); log(`${pass === true ? 'PASS' : pass === false ? 'FAIL' : pass} [${scen} ${sz.name}] ${id} — ${note}${pics.length ? ' | ' + pics.join(', ') : ''}`) },
  }
  return c
}
async function boot(sz, scen, who = 'ad') {
  const b = await sz.eng.launch(sz.eng === chromium ? launchOpts : {})
  const ctx = await b.newContext(sz.opts)
  await ctx.addInitScript(() => {
    window.__w2toasts = []
    let last = ''
    new MutationObserver(() => { const t = document.getElementById('toastEl'); if (!t) return; const s = (t.textContent || '').trim(); if (s && s !== last && t.style.opacity !== '0') { last = s; window.__w2toasts.push(s) } })
      .observe(document, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ['style'] })
  })
  const page = await ctx.newPage()
  const c = mkCtx(page, sz, scen)
  c.browser = b
  await page.goto(URL_)
  await page.fill('#luser', who); await page.fill('#lpass', who === 'ad' ? 'a' : 'us')
  await page.click('#loginForm button[type=submit]')
  await page.waitForSelector('#vWeek .day', { state: 'attached' }); await page.waitForTimeout(600)
  return c
}
const goPage = async (c, to) => { await c.p.evaluate(t => window.go(t), to); await c.p.waitForFunction(t => window.CURPAGE === t, to); await c.p.waitForTimeout(500) }
const pid = (c, cs) => c.p.evaluate(cs => Object.keys(window.PEOPLE).find(id => window.PEOPLE[id].cs === cs), cs)
const MONTHS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec']
async function calTo(c, iso) {
  for (let i = 0; i < 36 && !(await c.p.locator(`#inpEdCal [data-iso="${iso}"]`).count()); i++) {
    const [m, y] = (await c.p.locator('#inpEdCal .dcal-my').innerText()).trim().split(/\s+/)
    const at = `${y}-${String(MONTHS.indexOf(m.toLowerCase().slice(0, 3)) + 1).padStart(2, '0')}`
    await c.press(`#inpEdCal button[aria-label="${at < iso.slice(0, 7) ? 'Next' : 'Previous'} month"]`)
  }
}
/* the Inputs page's List, every date */
async function toList(c) {
  await goPage(c, 'inputs')
  if (await c.p.locator('#inListBtn[aria-pressed="false"]').count()) await c.press('#inListBtn')
  const rng = (await c.p.locator('#inRangeBtn').innerText()).trim()
  if (!/all/i.test(rng)) { await c.press('#inRangeBtn'); await c.press('#inRangeAll') }
}
/* file one input through "+ Input": { type, people:[callsigns], iso, start, end, title, goes, to, oil } */
async function fileNew(c, f) {
  await toList(c)
  const before = await c.p.evaluate(() => window.INPUTS.map(r => r.iid))
  await c.press('#inNew')
  await c.p.locator(WIN + ' >> visible=true').first().waitFor()
  await c.p.selectOption('#inpEditType', f.type); await c.p.waitForTimeout(250)
  const ids = []; for (const cs of f.people) ids.push(await pid(c, cs))
  if (ids.length > 1) await c.press(`${WIN} [data-testid="pp-several"]`)
  if (ids.length > 1) {
    for (const id of ids) if ((await c.p.locator(`${WIN} [data-pp="${id}"]`).getAttribute('aria-pressed')) !== 'true') await c.press(`${WIN} [data-pp="${id}"]`)
    const on = await c.p.evaluate(s => [...document.querySelectorAll(`${s} [data-pp][aria-pressed="true"]`)].map(b => b.getAttribute('data-pp')), WIN)
    for (const id of on) if (!ids.includes(id)) await c.press(`${WIN} [data-pp="${id}"]`)
  } else await c.p.selectOption('#inpEditPerson', ids[0])
  await calTo(c, f.iso); await c.press(`#inpEdCal [data-iso="${f.iso}"]`); await c.p.waitForTimeout(650); await c.press(`#inpEdCal [data-iso="${f.iso}"]`)
  if (f.start) {
    if (await c.p.locator('#inpEditAllday').count() && await c.p.locator('#inpEditAllday').isChecked()) await c.press('#inpEditAllday')
    await c.p.fill('#inpEditStart', f.start); await c.p.fill('#inpEditEnd', f.end)
  }
  if (f.title != null && await c.p.locator('#inpEditOwnTitle').count()) await c.p.fill('#inpEditOwnTitle', f.title)
  if (f.to != null) await c.p.fill('#inpEditTo', f.to)
  if (f.goes) await c.press(`${WIN} [data-testid="inpEdit-goes-${f.goes}"]`)
  if (f.before) await f.before()
  await c.press('#inpEditSave', f.saveStep)
  const dc = c.p.locator('[data-testid="docconf-nodoc"]'); if (await dc.isVisible().catch(() => false)) await c.press(dc)
  if (f.oil) { await c.p.locator('[data-testid="oilconf"]').waitFor({ timeout: 4000 }); if (f.oilShot) await c.shot(f.oilShot); await c.press(`[data-testid="oil-${f.oil}"]`); await c.press('[data-testid="oilconf-save"]') }
  await c.p.waitForTimeout(500)
  const iid = await c.p.evaluate(b => window.INPUTS.map(r => r.iid).filter(x => !b.includes(x)), before)
  if (iid.length !== 1) throw new Error('fileNew: expected one new record, got ' + JSON.stringify(iid))
  return iid[0]
}
const rec = (c, iid) => c.p.evaluate(i => { const r = window.INPUTS.find(x => x.iid === i); return r ? JSON.parse(JSON.stringify(r)) : null }, iid)
const docCount = r => { if (!r) return -1; const ids = r.docIds || (r.docId ? [r.docId] : []); return ids.length }
/* the board for a day of the demo week */
async function toBoard(c, di) {
  await goPage(c, 'editsched')
  if (await c.p.locator('#schedBoard .sb-sec').count()) { /* already open: move by day? close first */ }
  await c.p.locator(`#eWeek [data-sbday="${di}"]`).first().evaluate(e => { e.scrollIntoView({ block: 'center', inline: 'center' }); e.click() })
  await c.p.locator('#schedBoard .sb-sec').first().waitFor({ state: 'attached' }); await c.p.waitForTimeout(700)
}
async function closeBoard(c) {
  const done = c.p.locator('#schedBoard [data-sbdone], #schedBoard .sb-done, #sbDone').first()
  if (await done.count()) await c.press(done); else await c.p.keyboard.press('Escape')
  await c.p.waitForTimeout(400)
}
const shown = (c, sel) => c.p.evaluate(s => { const e = [...document.querySelectorAll(s)].find(x => { const r = x.getBoundingClientRect(); return r.width > 0 && r.height > 0 && getComputedStyle(x).visibility !== 'hidden' }); return !!e }, sel)

/* ---------- helpers on screen ---------- */
/* the document viewer is up and shows the picture (its image drawn, natural size > 0) */
async function viewerShows(c) {
  await c.p.waitForTimeout(500)
  return c.p.evaluate(() => {
    const pop = document.getElementById('docViewPop'); if (!pop || pop.hidden) return { up: false }
    const img = pop.querySelector('.docview-img'), fr = pop.querySelector('.docview-frame'), none = pop.querySelector('.docview-none')
    const r = (img || fr)?.getBoundingClientRect()
    return { up: true, img: !!img, loaded: img ? img.complete && img.naturalWidth > 0 : !!fr, w: r ? Math.round(r.width) : 0, none: none ? none.textContent : null }
  })
}
/* closes the viewer by its ✕ (a ✕ on the desktop, Escape on the second call to vary the way) */
async function closeViewer(c, how = 'x') {
  if (how === 'esc') await c.p.keyboard.press('Escape')
  else await c.press('#docViewPop .airpop-head .x, #docViewPop .airpop-head button')
  await c.p.waitForTimeout(300)
  return c.p.evaluate(() => { const p = document.getElementById('docViewPop'); return !p || p.hidden })
}
const winUp = c => c.p.locator(WIN + ' >> visible=true').first().count().then(n => n > 0)
const chips = c => c.p.locator(`${WIN} .docchip`).count()
async function closeWin(c, how) {
  if (how === 'esc') await c.p.keyboard.press('Escape')
  else if (how === 'x') await c.press('[data-testid="win-inputedit-x"], #inpEditClose >> visible=true')
  else await c.press('#inpEditCancel')
  await c.p.waitForTimeout(350)
  return !(await winUp(c))
}
/* opens the input from the Inputs List row (its name button) */
/* the List draws a table on a desktop and cards on a phone */
const listOpen = (c, iid) => c.phone ? `[data-testid="inl-row-${iid}"] [data-testid="inl-open"]` : `#intbl tr[data-iid="${iid}"] [data-testid="in-open"]`
const listClip = (c, iid) => c.phone ? `[data-testid="inl-row-${iid}"] [data-testid="inl-doc"]` : `#intbl tr[data-iid="${iid}"] .rclip`
async function openFromList(c, iid) { await toList(c); await c.press(listOpen(c, iid)); await c.p.locator(WIN + ' >> visible=true').first().waitFor({ timeout: 4000 }) }
async function toCalDay(c, iso) {
  await goPage(c, 'inputs')
  if (await c.p.locator('#inCalBtn[aria-pressed="false"]').count()) await c.press('#inCalBtn')
  const want = new Date(iso + 'T12:00:00Z').toLocaleString('en', { month: 'short', timeZone: 'UTC' }).toLowerCase()
  for (let i = 0; i < 14; i++) { const t = (await c.p.locator('#inpCal .ic-mon').first().innerText()).toLowerCase(); if (t.includes(want)) break; await c.press('#icPrev'); await c.p.waitForTimeout(400) }
  log('  calendar on:', (await c.p.locator('#inpCal .ic-mon').first().innerText()).trim())
  /* a person presses the day's empty foot, below its bars (the bars open their own input) */
  const bx = await c.p.locator(`[data-icday="${iso}"]`).boundingBox()
  const x = bx.x + bx.width / 2, y = bx.y + bx.height - 5
  if (c.phone) await c.p.touchscreen.tap(x, y); else await c.p.mouse.click(x, y)
  await c.p.locator('[data-testid="win-inputsday"]').waitFor({ timeout: 4000 })
  await c.p.waitForTimeout(400)
}
const card = iid => `[data-testid="win-inputsday"] [data-testid="idy-row-${iid}"]`
async function closeDay(c) { await c.press('[data-testid="win-inputsday-x"]'); await c.p.waitForTimeout(300) }

/* ---------- S2: a document on a shared input (Inputs F1) ---------- */
async function s2(sz) {
  const c = await boot(sz, 's2')
  try {
    const iid = await fileNew(c, { type: 'Meeting', people: ['Drifter', 'Hunter'], iso: '2026-07-15', start: '14:00', end: '15:00', title: 'W2 doc brief' })
    let r = await rec(c, iid)
    c.rec('fixture', (r.people || []).length === 2 && docCount(r) === 0, `filed one Meeting for ${(r.people || []).length} people, ${docCount(r)} documents, acc=${r.acc}`, [await c.shot('filed')])
    /* attach: the window reopened from the List, the Document button pressed, a PNG handed to its chooser */
    await openFromList(c, iid)
    const [fc] = await Promise.all([c.p.waitForEvent('filechooser'), c.press(`${WIN} .docbtn`)])
    await fc.setFiles({ name: 'w2-orders.png', mimeType: 'image/png', buffer: PNG })
    await c.p.waitForTimeout(400)
    const chipPic = await c.shot('chip-in-window')
    c.rec('chip-before-save', (await chips(c)) === 1, `chips in the window before Save: ${await chips(c)}`, [chipPic])
    await c.clearToasts()
    await c.press('#inpEditSave', 'save-attach')
    await c.p.waitForTimeout(600)
    r = await rec(c, iid)
    const savedPic = await c.shot('after-save-attach')
    c.rec('attach-saved', !(await winUp(c)) && docCount(r) === 1, `window closed: ${!(await winUp(c))}; documents on the record: ${docCount(r)}; notes: ${JSON.stringify(await c.toasts())}; late date ${r.mod}`, [savedPic])
    await checkDoors(c, iid, 1, 'attached')
    /* a reload: kept */
    await c.p.reload(); await c.p.waitForTimeout(800)
    if (await c.p.locator('#luser').count()) { await c.p.fill('#luser', 'ad'); await c.p.fill('#lpass', 'a'); await c.p.click('#loginForm button[type=submit]') }
    await c.p.waitForSelector('#vWeek .day', { state: 'attached' }); await c.p.waitForTimeout(700)
    r = await rec(c, iid)
    await openFromList(c, iid)
    const n1 = await chips(c)
    let vw = null
    if (n1) { await c.press(`${WIN} .docopen`); vw = await viewerShows(c) }
    c.rec('attach-after-reload', docCount(r) === 1 && n1 === 1 && vw?.loaded === true, `after a reload: record ${docCount(r)} doc; chip ${n1}; viewer ${JSON.stringify(vw)}`, [await c.shot('reload-attached')])
    if (vw?.up) await closeViewer(c)
    await closeWin(c, 'cancel')
    /* take it off: ✕ on the chip, Save */
    await openFromList(c, iid)
    await c.press(`${WIN} .docdel`, 'docdel')
    const offPic = await c.shot('chip-taken-off')
    c.rec('chip-off-in-window', (await chips(c)) === 0, `chips after its ✕: ${await chips(c)}`, [offPic])
    await c.clearToasts()
    await c.press('#inpEditSave', 'save-remove')
    await c.p.waitForTimeout(600)
    r = await rec(c, iid)
    c.rec('remove-saved', !(await winUp(c)) && docCount(r) === 0, `window closed: ${!(await winUp(c))}; documents on the record: ${docCount(r)}; notes: ${JSON.stringify(await c.toasts())}`, [await c.shot('after-save-remove')])
    await checkDoors(c, iid, 0, 'removed')
    await c.p.reload(); await c.p.waitForTimeout(800)
    if (await c.p.locator('#luser').count()) { await c.p.fill('#luser', 'ad'); await c.p.fill('#lpass', 'a'); await c.p.click('#loginForm button[type=submit]') }
    await c.p.waitForSelector('#vWeek .day', { state: 'attached' }); await c.p.waitForTimeout(700)
    r = await rec(c, iid)
    await openFromList(c, iid)
    c.rec('remove-after-reload', docCount(r) === 0 && (await chips(c)) === 0, `after a reload: record ${docCount(r)}; chips ${await chips(c)}`, [await c.shot('reload-removed')])
    /* the plain-user round on this window: Escape closes it with nothing changed */
    c.rec('window-escape-clean', await closeWin(c, 'esc'), 'Escape with nothing changed closes the window at once', [await c.shot('esc-closed')])
    c.rec('errors', c.errs.length === 0, c.errs.length ? c.errs.slice(0, 6).join(' || ') : 'none')
  } finally { await c.browser.close() }
}
/* Personal Inputs is folded by default: its heading is pressed open where the input's line is not in sight */
async function unfoldPI(c, root, iid, di) {
  const vis = async () => (await c.p.locator(`${root} [data-inpedit="${iid}"] >> visible=true`).count()) > 0
  if (await vis()) return true
  const tog = c.p.locator(`${root} [data-pitog="${di}"] >> visible=true`)
  if (await tog.count()) { await c.press(tog.first()); await c.p.waitForTimeout(400) }
  return vis()
}
/* every door that shows the input: List (clip + window), calendar day card (clip + window), Edit Schedule's week row, the board's Ground row */
async function checkDoors(c, iid, want, tag) {
  /* 1 the List */
  await toList(c)
  const clip = await c.p.locator(listClip(c, iid)).count()
  let vw = null
  if (clip) { await c.press(listClip(c, iid)); vw = await viewerShows(c) }
  const lp = await c.shot(`${tag}-list`)
  c.rec(`${tag}: List paperclip`, want ? clip === 1 && vw?.loaded === true : clip === 0, `paperclip on the row: ${clip}; viewer ${JSON.stringify(vw)}`, [lp])
  if (vw?.up) await closeViewer(c, 'esc')
  await openFromList(c, iid)
  let n = await chips(c); vw = null
  if (n) { await c.press(`${WIN} .docopen`); vw = await viewerShows(c) }
  c.rec(`${tag}: List → window chip`, want ? n === 1 && vw?.loaded === true : n === 0, `chips ${n}; viewer ${JSON.stringify(vw)}`, [await c.shot(`${tag}-list-window`)])
  if (vw?.up) await closeViewer(c)
  await closeWin(c, 'x')
  /* 2 the calendar's day card */
  await toCalDay(c, '2026-07-15')
  const cd = await c.p.locator(card(iid)).count()
  const cclip = await c.p.locator(`${card(iid)} [data-testid="idy-doc"]`).count()
  vw = null
  if (cclip) { await c.press(`${card(iid)} [data-testid="idy-doc"]`); vw = await viewerShows(c) }
  c.rec(`${tag}: calendar card clip`, cd === 1 && (want ? cclip === 1 && vw?.loaded === true : cclip === 0), `card ${cd}; clip ${cclip}; viewer ${JSON.stringify(vw)}`, [await c.shot(`${tag}-cal-card`)])
  if (vw?.up) await closeViewer(c)
  if (cd) {
    await c.press(`${card(iid)} [data-testid="idy-open"]`)
    await c.p.locator(WIN + ' >> visible=true').first().waitFor({ timeout: 4000 }).catch(() => {})
    n = await chips(c)
    c.rec(`${tag}: calendar card → window chip`, (await winUp(c)) && n === want, `window ${await winUp(c)}; chips ${n}`, [await c.shot(`${tag}-cal-window`)])
    if (await winUp(c)) await closeWin(c, 'cancel')
  }
  if (await c.p.locator('[data-testid="win-inputsday"]').count()) await closeDay(c)
  /* 3 Edit Schedule's week row and 4 the board's Ground Programme row */
  await goPage(c, 'editsched')
  await unfoldPI(c, '#eWeek', iid, 2)
  const wk = c.p.locator(`#eWeek .day:not(.peek) [data-inpedit="${iid}"] >> visible=true`)
  const wkN = await wk.count()
  if (wkN) {
    await c.press(wk.first())
    await c.p.locator(WIN + ' >> visible=true').first().waitFor({ timeout: 4000 }).catch(() => {})
    n = await chips(c)
    c.rec(`${tag}: Edit Schedule week row → window chip`, (await winUp(c)) && n === want, `rows ${wkN}; window ${await winUp(c)}; chips ${n}`, [await c.shot(`${tag}-week-window`)])
    if (await winUp(c)) await closeWin(c, 'x')
  } else c.rec(`${tag}: Edit Schedule week row`, 'NOT WALKED', 'no row of the input with an edit button on the week')
  if (process.env.W2_DUMP) log('WEEKROW', await c.p.evaluate(() => [...document.querySelectorAll('#eWeek .day:not(.peek) .pl-row')].filter(r => /W2 doc/i.test(r.textContent + [...r.querySelectorAll('input,textarea')].map(i => i.value).join(' '))).map(r => r.outerHTML.slice(0, 2500)).join('\n')))
  await toBoard(c, 2)
  if (process.env.W2_DUMP) log('BOARDROW', await c.p.evaluate(() => [...document.querySelectorAll('#schedBoard .sb-arow')].filter(r => /W2 doc/i.test(r.textContent + [...r.querySelectorAll('input,textarea')].map(i => i.value).join(' '))).map(r => r.outerHTML.slice(0, 2500)).join('\n')))
  if (process.env.W2_DUMP) log('PINP', await c.p.evaluate(() => document.querySelector('#schedBoard .sb-panel.pinp')?.outerHTML.slice(0, 1500)))
  /* the Ground Programme row is the input itself, typed in place, with no window button (its time, title, remark and
     people edit there); the input's window and its document are reached from its line under Personal Inputs */
  const gr = await c.p.locator('#schedBoard .sb-panel.grnd .sb-arow textarea[data-bfld$=".prog"]').evaluateAll(t => t.filter(x => /W2 DOC/i.test(x.value)).length)
  c.rec(`${tag}: board Ground Programme row there`, gr === 1, `rows titled W2 DOC BRIEF on the board's Ground Programme: ${gr}`)
  await unfoldPI(c, '#schedBoard', iid, 2)
  for (const panel of ['pinp']) {
    const b = c.p.locator(`#schedBoard .sb-panel.${panel} [data-inpedit="${iid}"] >> visible=true`)
    const bn = await b.count()
    if (!bn) { c.rec(`${tag}: board ${panel} row`, false, `no line of the input under the board's Personal Inputs`, [await c.shot(`${tag}-board-nopinp`)]); continue }
    await c.press(b.first())
    await c.p.locator(WIN + ' >> visible=true').first().waitFor({ timeout: 4000 }).catch(() => {})
    n = await chips(c); vw = null
    if (n) { await c.press(`${WIN} .docopen`); vw = await viewerShows(c) }
    c.rec(`${tag}: board ${panel} row → window chip`, (await winUp(c)) && n === want && (!want || vw?.loaded === true), `window ${await winUp(c)}; chips ${n}; viewer ${JSON.stringify(vw)}`, [await c.shot(`${tag}-board-${panel}`)])
    if (vw?.up) await closeViewer(c)
    if (await winUp(c)) await closeWin(c, 'cancel')
  }
  await closeBoard(c)
}
/* the box of an element in view, and what a point at its middle meets */
const boxOf = (c, sel) => c.p.evaluate(s => { const e = [...document.querySelectorAll(s)].find(x => x.getBoundingClientRect().width > 0); if (!e) return null; const r = e.getBoundingClientRect(); const h = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return { l: Math.round(r.left), t: Math.round(r.top), r: Math.round(r.right), b: Math.round(r.bottom), reached: !!h && (h === e || e.contains(h)) } }, sel)
/* the unsaved question: up, and where it hangs against the ✕ and the window's foot */
async function askAt(c) {
  await c.p.waitForTimeout(350)
  const q = await boxOf(c, '[data-testid="inped-escask"]')
  const x = await boxOf(c, '[data-testid="win-inputedit-x"]') || await boxOf(c, '#inpEditClose')
  const foot = await boxOf(c, ':is([data-testid="win-inputedit"], #inpEditPop) .airpop-foot') || await boxOf(c, '#inpEditSave')
  return { q, x, foot, nearX: !!(q && x && q.t >= x.t - 4 && q.t - x.b < 60 && q.r >= x.l - 40), aboveFoot: !!(q && foot && q.b < foot.t - 40) }
}
async function leaveWarCell(c, who, iso) {
  await goPage(c, 'leavewar'); await c.p.waitForTimeout(1500)
  const id = await pid(c, who)
  const sel = `[data-testid="cell-${id}-${iso}"]`
  /* the war opens on its bidding window: press the July month button until the day is drawn */
  for (let i = 0; i < 3 && !(await c.p.locator(sel).count()); i++) {
    const jul = c.p.locator('button', { hasText: /^jul$/i }).first()
    if (await jul.count()) { await c.press(jul); await c.p.waitForTimeout(800) }
  }
  if (!(await c.p.locator(sel).count())) return { drawn: false }
  await c.p.locator(sel).scrollIntoViewIfNeeded().catch(() => {})
  return c.p.evaluate(s => { const e = document.querySelector(s); return { drawn: true, text: (e.textContent || '').trim(), cls: e.className, html: e.innerHTML.slice(0, 300) } }, sel)
}

/* ---------- S3: an Other under Unavailable with its OIL answer, one Save (Inputs F2); the ✕ question; the window following ---------- */
async function s3(sz) {
  const c = await boot(sz, 's3')
  try {
    const hunter = await pid(c, 'Hunter'), drifter = await pid(c, 'Drifter')
    /* A: a new Other, Unavailable, a time, the OIL question answered at the Save */
    await c.clearToasts()
    const a = await fileNew(c, { type: 'Other', people: ['Hunter'], iso: '2026-07-18', start: '09:00', end: '12:00', title: 'W2 away', goes: 'u', oil: 'no', oilShot: 'oil-question-asked' })
    let r = await rec(c, a)
    c.rec('A one Save: goes + OIL', r.acc === 'u' && !!r.oil, `acc=${r.acc} oil=${JSON.stringify(r.oil)} notes=${JSON.stringify(await c.toasts())}`, [await c.shot('A-filed')])
    /* B: a saved Other on the Ground Programme, Sat, answered */
    const b = await fileNew(c, { type: 'Other', people: ['Drifter'], iso: '2026-07-18', start: '13:00', end: '15:00', title: 'W2 ground', goes: 'g', oil: 'no' })
    r = await rec(c, b)
    c.rec('B fixture', r.acc === 'g' && !!r.oil, `acc=${r.acc} oil=${JSON.stringify(r.oil)}`)
    /* F2 itself: a SAVED Other whose OIL question nobody answered — made through the app: an Other on Fri 17 (a working
       day, no question), then Fri 17 declared a public holiday in the Calendar window and its OIL list left with Later */
    const f = await fileNew(c, { type: 'Other', people: ['Ranger'], iso: '2026-07-17', start: '09:00', end: '11:00', title: 'W2 unanswered', goes: 'g' })
    let unanswered = false
    try {
      await goPage(c, 'inputs')
      await c.press('#inGear'); await c.press('[data-testid="iset-days"]')
      await c.p.locator('[data-testid="win-days"]').waitFor({ timeout: 4000 })
      const ht = c.p.locator('[data-testid="days-tab-holidays"]'); if (await ht.count()) await c.press(ht)
      await c.press('[data-testid="hol-add"]')
      await c.p.locator('[data-testid="hol-name"]').fill('W2 holiday')
      for (let i = 0; i < 14 && !(await c.p.locator('[data-testid="hol-dates"] [data-iso="2026-07-17"]').count()); i++) {
        const nav = c.p.locator('[data-testid="hol-dates"] button[aria-label="Previous month"]'); await c.press(nav)
      }
      await c.press('[data-testid="hol-dates"] [data-iso="2026-07-17"]'); await c.p.waitForTimeout(650); await c.press('[data-testid="hol-dates"] [data-iso="2026-07-17"]')
      await c.shot('F-holiday-form')
      await c.press('[data-testid="hol-save"]')
      await c.p.locator('[data-testid="win-oilday"]').waitFor({ timeout: 5000 })
      const listPic = await c.shot('F-oil-list')
      await c.press('[data-testid="odl-later"]')
      r = await rec(c, f)
      unanswered = !r.oil
      c.rec('F fixture: saved Other, OIL unanswered', unanswered && r.acc === 'g', `acc=${r.acc} oil=${JSON.stringify(r.oil)} (Fri 17 made a public holiday, its list left with Later)`, [listPic])
      const dx = c.p.locator('[data-testid="win-days-x"]'); if (await dx.count()) await c.press(dx)
    } catch (e) { c.rec('F fixture', 'NOT WALKED', 'could not make the unanswered Other through the Calendar window: ' + String(e.message).split('\n')[0], [await c.shot('F-fixture-stopped')]) }
    if (unanswered) {
      await openFromList(c, f)
      await c.press(`${WIN} [data-testid="inpEdit-goes-u"]`)
      await c.clearToasts()
      await c.press('#inpEditSave', 'F-save')
      const asked = await c.p.locator('[data-testid="oilconf"]').count()
      const qp = await c.shot('F-oil-asked')
      if (asked) { await c.press('[data-testid="oil-no"]'); await c.press('[data-testid="oilconf-save"]') }
      await c.p.waitForTimeout(500)
      r = await rec(c, f)
      const said = await c.toasts()
      c.rec('F2: Goes to Unavailable + OIL answer in one Save', asked > 0 && r.acc === 'u' && !!r.oil && !said.includes('OIL answer saved'), `question asked: ${asked > 0}; acc=${r.acc}; oil=${JSON.stringify(r.oil)}; notes=${JSON.stringify(said)}`, [qp, await c.shot('F-saved')])
    }
    /* where A stands: the board's Unavailable, not its Ground Programme; the week; the calendar card; the Leave War */
    await toBoard(c, 5)
    const unav = await c.p.locator(`#schedBoard .sb-panel.unav [data-inprow^="${a}"]`).count()
    const grA = await c.p.locator(`#schedBoard .sb-panel.grnd [data-person="${hunter}"]`).count()
    const grB = await c.p.locator(`#schedBoard .sb-panel.grnd [data-person="${drifter}"]`).count()
    await c.p.locator('#schedBoard .sb-panel.unav').first().scrollIntoViewIfNeeded().catch(() => {})
    c.rec('A on the board: Unavailable, not Ground', unav === 1 && grA === 0, `board Sat: Unavailable rows of A ${unav}; Hunter pucks on the Ground Programme ${grA} (B's Drifter on the Ground Programme: ${grB})`, [await c.shot('A-board-unavailable')])
    await closeBoard(c)
    await goPage(c, 'editsched')
    const wkU = await c.p.locator(`#eWeek .day:not(.peek) [data-inprow^="${a}"], #eWeek .day:not(.peek) .sec-unav [data-inpedit="${a}"]`).count()
    const wkAny = await c.p.locator(`#eWeek .day:not(.peek) [data-inpedit="${a}"]`).count()
    c.rec('A on Edit Schedule week', wkU >= 1, `week: rows of A under Unavailable ${wkU}, any edit button ${wkAny}`)
    await toCalDay(c, '2026-07-18')
    const oilTag = await c.p.locator(`${card(a)} [data-testid="idy-oil"]`).count()
    const cardA = await c.p.locator(card(a)).count()
    c.rec('A card: no OIL? tag', cardA === 1 && oilTag === 0, `card ${cardA}; OIL? tag ${oilTag}`, [await c.shot('A-cal-card')])
    await closeDay(c)
    const lwA = await leaveWarCell(c, 'Hunter', '2026-07-18')
    const lwPicA = await c.shot('A-leavewar')
    const lwB = await leaveWarCell(c, 'Drifter', '2026-07-18')
    c.rec('A counts him out on the Leave War', lwA.drawn && /\S/.test(lwA.text) && !(lwB.drawn && /\S/.test(lwB.text)), `Hunter 18 Jul: ${JSON.stringify(lwA)} | Drifter (B, Ground) 18 Jul: ${JSON.stringify(lwB)}`, [lwPicA])
    /* the ✕ question: B reopened, Unavailable picked, ✕ */
    await openFromList(c, b)
    await c.press(`${WIN} [data-testid="inpEdit-goes-u"]`)
    await c.press('[data-testid="win-inputedit-x"]', 'X-press')
    let g = await askAt(c)
    c.rec('✕ asks, hanging from the ✕', !!g.q && g.nearX && g.aboveFoot, JSON.stringify(g), [await c.shot('X-asks')])
    if (g.q) await c.press('[data-testid="inped-escask-stay"]')
    await c.p.keyboard.press('Escape')
    g = await askAt(c)
    c.rec('Escape asks, hanging from the ✕', !!g.q && g.nearX && g.aboveFoot, JSON.stringify(g), [await c.shot('Esc-asks')])
    if (g.q) await c.press('[data-testid="inped-escask-stay"]')
    const stillU = await c.p.locator(`${WIN} [data-testid="inpEdit-goes-u"][aria-pressed="true"]`).count()
    await c.press('#inpEditCancel')
    const closedAtOnce = !(await winUp(c)) && !(await c.p.locator('[data-testid="inped-escask"]').count())
    r = await rec(c, b)
    c.rec('Keep editing keeps the pick; Cancel closes at once, nothing saved', stillU === 1 && closedAtOnce && r.acc === 'g', `pick kept after Keep editing: ${stillU === 1}; Cancel closed at once: ${closedAtOnce}; B acc=${r.acc}`, [await c.shot('Cancel-closed')])
    /* an Attach's "To" changed, ✕ */
    const at = await fileNew(c, { type: 'Attach', people: ['Ranger'], iso: '2026-07-16', to: '145 Sqn' })
    await openFromList(c, at)
    await c.p.fill('#inpEditTo', 'Exercise W2')
    await c.press('[data-testid="win-inputedit-x"]')
    g = await askAt(c)
    c.rec('Attach To changed: ✕ asks at the ✕', !!g.q && g.nearX, JSON.stringify(g), [await c.shot('Attach-asks')])
    if (g.q) await c.press('[data-testid="inped-escask-go"]')
    r = await rec(c, at)
    c.rec('Discard and close leaves the To as saved', !(await winUp(c)) && r.to === '145 Sqn', `window closed ${!(await winUp(c))}; to=${JSON.stringify(r.to)}`)
    /* the window follows a move made on the schedule behind it */
    await followCheck(c, b, drifter)
    c.rec('errors', c.errs.length === 0, c.errs.length ? c.errs.slice(0, 6).join(' || ') : 'none')
  } finally { await c.browser.close() }
}
/* with B's window open, its place changed from the schedule behind it: where can a person press? */
async function followCheck(c, b, drifter) {
  /* first door tried: the Inputs page's window leaves the page behind working (D641) — is Edit Schedule in the top bar
     pressable with it up, and does the window stay while the schedule is used? */
  await openFromList(c, b)
  const nav = c.p.locator('button, a', { hasText: /^Edit Schedule$/ }).filter({ visible: true }).first()
  const navReach = (await nav.count()) ? await nav.evaluate(e => { const r = e.getBoundingClientRect(); const h = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return !!h && (h === e || e.contains(h)) }) : false
  log('  Inputs page window up: Edit Schedule in the top bar reachable:', navReach)
  if (navReach) {
    await c.press(nav)
    await c.p.waitForTimeout(600)
    const still = await winUp(c)
    log('  after pressing Edit Schedule: page', await c.p.evaluate(() => window.CURPAGE), 'window still up:', still)
    const pic = await c.shot('follow-inputs-window-then-editsched')
    c.rec('follow (door 1): Inputs window kept while the schedule is opened', 'NOTE', `pressed Edit Schedule with the window up: page now ${await c.p.evaluate(() => window.CURPAGE)}, window still up: ${still}`, [pic])
    if (still) {
      await unfoldPI(c, '#eWeek', b, 5)
      const rowBtns = async () => c.p.evaluate(iid => {
        const e = [...document.querySelectorAll(`#eWeek .day:not(.peek) [data-inpedit="${iid}"]`)].find(x => x.getBoundingClientRect().width > 0)
        const row = e && e.closest('.pl-row, [data-inprow], .sb-arow, .inp-row, div')
        let r = e; for (let i = 0; i < 4 && r && !r.querySelector('button[data-acc], button[data-unacc], .accs button'); i++) r = r.parentElement
        return r ? [...r.querySelectorAll('button')].filter(x => x.getBoundingClientRect().width > 0).map(x => ({ t: x.textContent.trim(), acc: x.getAttribute('data-acc'), attrs: [...x.attributes].map(a => a.name).filter(n => n.startsWith('data-')).join(',') })) : null
      }, b)
      log('  week: B line buttons:', JSON.stringify(await rowBtns()))
      const goesLine = () => c.p.locator(`${WIN} [data-testid="inpEdit-goes-line"]`).first().innerText().catch(() => '')
      const pressed = () => c.p.evaluate(s => [...document.querySelectorAll(`${s} .goesbtn`)].filter(x => x.getAttribute('aria-pressed') === 'true').map(x => x.textContent.trim()), WIN)
      const rowOf = `#eWeek .day:not(.peek) :is(.pl-row, [data-inprow]):has([data-inpedit="${b}"])`
      const rej = c.p.locator(`${rowOf} button`, { hasText: /^Reject$/ }).filter({ visible: true }).first()
      if (await rej.count()) {
        const reach = await rej.evaluate(e => { const r = e.getBoundingClientRect(); const h = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return !!h && (h === e || e.contains(h)) })
        await rej.scrollIntoViewIfNeeded(); await c.press(rej)
        await c.p.waitForTimeout(500)
        let r = await rec(c, b)
        const p1 = await c.shot('follow-week-reject')
        c.rec('follow: Reject behind the window', (await winUp(c)) && r.acc === 'r' && /Rejected/.test(await goesLine()), `button reachable ${reach}; record acc=${r.acc}; window up ${await winUp(c)}; its Goes to line: "${await goesLine()}", picked ${JSON.stringify(await pressed())}`, [p1])
        log('  week: B line buttons after Reject:', JSON.stringify(await rowBtns()))
        const un = c.p.locator(`${rowOf} button[data-acc="u"]`).filter({ visible: true }).first()
        if (await un.count()) {
          await c.press(un); await c.p.waitForTimeout(500)
          r = await rec(c, b)
          const p2 = await c.shot('follow-week-unavail')
          const pk = await pressed()
          c.rec('follow: → Unavail behind the window, window shows Unavailable', r.acc === 'u' && pk.join() === 'Unavailable', `record acc=${r.acc}; window picked ${JSON.stringify(pk)}; line "${await goesLine()}"`, [p2])
          if (await winUp(c)) {
            await c.clearToasts(); await c.press('#inpEditSave'); await c.p.waitForTimeout(400)
            const ok = c.p.locator('[data-testid="oilconf"]'); if (await ok.count()) { await c.press('[data-testid="oil-no"]'); await c.press('[data-testid="oilconf-save"]') }
            const r2 = await rec(c, b)
            c.rec('follow: the window\'s Save keeps Unavailable', r2.acc === 'u', `acc after the window's Save: ${r2.acc}; window up ${await winUp(c)}; notes ${JSON.stringify(await c.toasts())}`, [await c.shot('follow-after-save')])
          }
        } else c.rec('follow: → Unavail behind the window', 'NOT WALKED', 'no → Unavail button on B\'s week line after Reject')
      } else c.rec('follow: Reject behind the window', 'NOT WALKED', 'no Reject on B\'s Personal Inputs line on the week', [await c.shot('follow-week-noreject')])
      if (await winUp(c)) await closeWin(c, 'cancel')
    }
  } else { c.rec('follow (door 1)', 'NOTE', 'with the Inputs page window up the top bar is not pressable', [await c.shot('follow-inputs-window')]); await closeWin(c, 'cancel') }
  await toBoard(c, 5)
  await unfoldPI(c, '#schedBoard', b, 5)
  const rowSel = `#schedBoard .sb-panel.pinp :is([data-inprow^="${b}"], .sb-arow:has([data-inpedit="${b}"]))`
  const btns = await c.p.locator(`${rowSel} button`).evaluateAll(bs => bs.map(x => (x.textContent || '').trim() + (x.getAttribute('data-acc') ? '[' + x.getAttribute('data-acc') + ']' : '')))
  log('  B row buttons under Personal Inputs:', JSON.stringify(btns))
  await c.press(`#schedBoard .sb-panel.pinp [data-inpedit="${b}"] >> visible=true`)
  await c.p.locator(WIN + ' >> visible=true').first().waitFor({ timeout: 4000 })
  const winPic = await c.shot('follow-window-open')
  /* can the row's buttons behind be reached with the window up? */
  const target = c.p.locator(`${rowSel} button:is([data-acc], [data-unacc], [data-rej]) >> visible=true`).first()
  if (!(await target.count())) { c.rec('follow: window follows a move behind it', 'NOT WALKED', `no → Ground / → Unavail / Reject button on B's Personal Inputs line (buttons: ${JSON.stringify(btns)})`, [winPic]); await closeWin(c, 'cancel'); return }
  const reach = await target.evaluate(e => { const r = e.getBoundingClientRect(); const h = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return { label: e.textContent.trim(), reached: !!h && (h === e || e.contains(h)), hit: h ? (h.id || h.className || h.tagName) : null } })
  log('  behind-the-window button:', JSON.stringify(reach))
  if (!reach.reached) {
    c.rec('follow: window follows a move behind it', 'NOT WALKED', `with the input's window up on the board, its Personal Inputs button "${reach.label}" is covered (a press there meets ${reach.hit}) — the schedule's input window is a pop-up over a veil, a press outside closes it (the pop-up rule), so no person can change the row behind it while it stays open`, [winPic])
    /* the plain-user round: that press outside closes the window (nothing typed) */
    const vb = await boxOf(c, `${rowSel}`)
    if (vb) { if (c.phone) await c.p.touchscreen.tap(5, 5); else await c.p.mouse.click(5, 300); await c.p.waitForTimeout(400) }
    c.rec('board pop-up: a press outside closes it', !(await winUp(c)), `window up after a press outside: ${await winUp(c)}`, [await c.shot('follow-outside-closed')])
    if (await winUp(c)) await closeWin(c, 'cancel')
    return
  }
  await c.press(target)
  const r = await rec(c, b)
  const goesOn = await c.p.locator(`${WIN} [data-testid="inpEdit-goes-u"][aria-pressed="true"]`).count()
  c.rec('follow: window follows a move behind it', goesOn === 1, `after "${reach.label}" behind: record acc=${r.acc}; window shows Unavailable picked: ${goesOn === 1}`, [await c.shot('follow-after-move')])
  await c.press('#inpEditSave')
  const r2 = await rec(c, b)
  c.rec('follow: a Save from the window keeps the new place', r2.acc === r.acc, `acc after the window's Save: ${r2.acc}`)
}
async function s4() { throw new Error('S4 not yet written') }

const scen = { s2, s3, s4 }
for (const k of ['d', 'p']) {
  if (SZONLY && SZONLY !== k) continue
  for (const s of ['s2', 's3', 's4']) {
    if (ONLY && ONLY !== s) continue
    let c
    try { c = await scen[s](SIZES[k]) } catch (e) { results.push({ scen: s, size: SIZES[k].name, id: 'RUN', pass: 'NOT WALKED', note: 'script stopped: ' + String(e.message || e).slice(0, 300) }); log('STOPPED', s, k, e.stack) }
  }
}
writeFileSync(resolve(OUT, 'results.json'), JSON.stringify(results, null, 1))
log('done', results.length, 'lines')
