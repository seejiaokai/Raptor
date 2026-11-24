// THE WHOLE-APP WORDS PASS (owner D808) — round 4 (chat 163, 24 Nov 26; the draft:
// docs/superpowers/briefs/2026-11-24-words-r4-draft.md). For each case: a "today" picture of the BUILT app, driven to the
// case through its own controls, and an "after" picture of the same screen with only the words swapped in the page (the
// node's text replaced, nothing else) — the after words read from words-r4-words.json, so they can change without this
// script. Nothing in the app is changed (mockups-on-the-real-app.md). The bridge (window.INPUTS / NOTICES / DAYS) is only
// READ, and used to get to a place (go, openScheduler, loadWeek).
//
//   node scripts/handpass/words-r4.mjs [only-case,…]        (LOOK_URL=http://localhost:4731/ by default)
//   cases: q1 q2 q3 q4a q4b q4c s1 s2
import { chromium } from '@playwright/test'
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

console.log('words-r4 v1')
const HERE = dirname(fileURLToPath(import.meta.url))
const ONLY = (process.argv[2] || '').split(',').filter(Boolean)
const OUT = join(HERE, '../../docs/img/handpass/2026-11-24-words-r4', ONLY.length ? 'only-' + ONLY.join('-') : '')
rmSync(OUT, { recursive: true, force: true }); mkdirSync(OUT, { recursive: true })
const URL = process.env.LOOK_URL || 'http://localhost:4731/'
const WORDS = JSON.parse(readFileSync(join(HERE, 'words-r4-words.json'), 'utf8'))
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const browser = await chromium.launch(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {})
const sleep = ms => new Promise(r => setTimeout(r, ms))
const facts = { pictures: [], cases: {}, errors: [] }
const log = (c, s) => { (facts.cases[c] ||= { log: [] }).log.push(s); console.log(`[${c}] ${s}`) }
const run = c => !ONLY.length || ONLY.includes(c)

const SIZES = {
  phone: { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
  desk: { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 },
}
const SIZE_SAYS = { phone: 'phone 390x844 @2x', desk: 'desktop 1440x900 @2x' }
const NOMOTION = '*{scroll-behavior:auto !important} *,*::before,*::after{transition:none !important;animation:none !important}'
/* the ring on the changed words, drawn only in an "after" picture; an outline takes no room, so nothing moves */
const RING = '.w4-chg{outline:1.5px solid #34c759;outline-offset:2px;border-radius:3px}'

/* ---------- worlds ---------- */
async function newPage(size, state) {
  const ctx = await browser.newContext({ ...SIZES[size], reducedMotion: 'reduce', ...(state ? { storageState: state } : {}) })
  const page = await ctx.newPage()
  page.on('pageerror', e => facts.errors.push(`${size} pageerror: ` + String(e).slice(0, 200)))
  page.on('console', m => { if (m.type() === 'error') facts.errors.push(`${size} console: ` + m.text().slice(0, 200)) })
  await page.goto(URL)
  await page.waitForFunction(() => document.querySelector('#luser') || document.querySelector('#vWeek .day'))
  await page.addStyleTag({ content: NOMOTION })
  return { ctx, page, tap: !!SIZES[size].hasTouch, size }
}
async function signIn(w, user) {
  const { page } = w
  if (!(await page.locator('#luser').isVisible().catch(() => false))) {
    if (await page.locator('#logout:visible').count()) await page.locator('#logout:visible').click()
    else { await page.locator('#burger').click(); await sleep(400); await page.getByRole('button', { name: /^Log ?out/i }).first().click() }
    await page.locator('#luser').waitFor()
  }
  await page.fill('#luser', user); await page.fill('#lpass', user === 'ad' ? 'a' : user)
  await page.click('#loginForm button[type=submit]')
  await page.waitForSelector('#vWeek .day', { state: 'attached' })
  await sleep(500)
}
/* the next person, on another device: the stored world carried over (the app keeps its data in the browser's storage) */
async function handOver(w, size, user) {
  await sleep(1200)                                 // let the last save reach the store
  const state = await w.ctx.storageState({ indexedDB: true })
  await w.ctx.close()
  const n = await newPage(size, state)
  await signIn(n, user)
  return n
}
const press = async (w, loc) => { const l = (typeof loc === 'string' ? w.page.locator(loc) : loc).first(); await l.scrollIntoViewIfNeeded().catch(() => {}); await (w.tap ? l.tap() : l.click()); await sleep(w.tap ? 650 : 200) }
const go = async (page, p) => { await page.evaluate(p => window.go(p), p); await page.waitForFunction(p => window.CURPAGE === p, p); await sleep(400) }
const ids = page => page.evaluate(() => window.INPUTS.map(r => String(r.iid)))
const recOf = (page, iid) => page.evaluate(i => { const r = window.INPUTS.find(x => String(x.iid) === String(i)); return r ? { type: r.type, title: r.title, date: r.date, endDate: r.endDate, allday: r.allday, half: r.half, s: r.s, e: r.e, cx: !!r.cx, cxr: r.cxr, remarks: r.remarks, people: (r.people || []).map(p => p.p), person: r.person, acc: r.acc } : null }, iid)

/* ---------- the Inputs page ---------- */
const MONTHS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec']
async function toMonth(w, y, m) {
  await go(w.page, 'inputs')
  if (await w.page.locator('#inCalBtn').getAttribute('aria-pressed') !== 'true') await press(w, '#inCalBtn')
  for (let i = 0; i < 60; i++) {
    const [name, year] = (await w.page.locator('#inpCal .ic-mon').innerText()).trim().toLowerCase().split(/\s+/)
    const d = y * 12 + (m - 1) - (+year * 12 + MONTHS.indexOf(name.slice(0, 3)))
    if (!d) { await sleep(400); return }
    await press(w, d > 0 ? '#icNext' : '#icPrev'); await sleep(300)
  }
  throw new Error('the Inputs calendar never reached the month')
}
async function openDay(w, iso) {
  await toMonth(w, +iso.slice(0, 4), +iso.slice(5, 7))
  await w.page.locator(`#inpCal [data-icday="${iso}"]`).focus()
  await w.page.keyboard.press('Enter')
  await w.page.locator('[data-testid="win-inputsday"]').waitFor()
  await sleep(350)
}
/* every question a Save can raise, answered the plain way (no document; OIL yes) — what was asked is returned */
async function answerAsks(w) {
  const asked = []
  for (let i = 0; i < 5; i++) {
    await sleep(350)
    const p = w.page
    if (await p.locator('[data-testid="docconf-nodoc"]:visible').count()) { asked.push('document'); await press(w, '[data-testid="docconf-nodoc"]'); continue }
    if (await p.locator('[data-testid="oilconf"]:visible').count()) {
      asked.push('oil')
      const y = p.locator('[data-testid="oil-all"]:visible, [data-testid="oil-yes"]:visible')
      if (await y.count()) await press(w, y)
      await press(w, '[data-testid="oilconf-save"]'); continue
    }
    if (await p.locator('[data-testid="inped-swap-go"]:visible').count()) { asked.push('swap'); await press(w, '[data-testid="inped-swap-go"]'); continue }
    break
  }
  return asked
}
const shownToast = page => page.evaluate(() => { const t = document.getElementById('toastEl'); if (!t) return ''; const cs = getComputedStyle(t); return +cs.opacity > 0.05 && t.getBoundingClientRect().height > 0 ? (t.textContent || '').replace(/\s+/g, ' ').trim() : '' })
/* file an input through a day of the calendar and its "+ Input" */
async function fileInput(w, c, iso, spec) {
  await openDay(w, iso)
  const before = await ids(w.page)
  await press(w, '#icPopAdd')
  await w.page.locator('#inpEditPop #inpEditType').waitFor()
  await w.page.selectOption('#inpEditPop #inpEditType', spec.type)
  if (spec.people) {
    if (spec.people.length > 1) {
      await press(w, '#inpEditPop [data-testid="pp-several"]')
      for (const id of spec.people) if ((await w.page.locator(`#inpEditPop [data-pp="${id}"]`).getAttribute('aria-pressed')) !== 'true') await press(w, `#inpEditPop [data-pp="${id}"]`)
      const lit = await w.page.evaluate(() => [...document.querySelectorAll('#inpEditPop [data-pp][aria-pressed="true"]')].map(b => b.getAttribute('data-pp')))
      for (const id of lit) if (!spec.people.includes(id)) await press(w, `#inpEditPop [data-pp="${id}"]`)
    } else if (await w.page.locator('#inpEditPop #inpEditPerson').count()) await w.page.selectOption('#inpEditPop #inpEditPerson', spec.people[0])
  }
  if (spec.span && await w.page.locator(`#inpEditSpan [data-span="${spec.span}"]`).count()) await press(w, `#inpEditSpan [data-span="${spec.span}"]`)
  if (spec.from) {
    const ad = w.page.locator('#inpEditPop #inpEditAllday')
    if (await w.page.locator('#inpEditSpan [data-span="custom"]').count()) await press(w, '#inpEditSpan [data-span="custom"]')
    else if (await ad.count() && await ad.isChecked()) await ad.click()
    await w.page.fill('#inpEditPop #inpEditStart', spec.from); await w.page.fill('#inpEditPop #inpEditEnd', spec.to)
  }
  if (spec.title) { const t = w.page.locator('#inpEditPop #inpEditOwnTitle'); if (await t.count()) await t.fill(spec.title); else log(c, 'NOTE: no Title box for type ' + spec.type) }
  if (spec.remarks) await w.page.fill('#inpEditPop #inpEditRmk', spec.remarks)
  await press(w, '#inpEditSave')
  const asked = await answerAsks(w)
  const said = await shownToast(w.page)
  const made = (await ids(w.page)).filter(x => !before.includes(x))
  if (await w.page.locator('[data-testid="win-inputedit"]:visible').count()) log(c, 'NOTE: the input window is still open after Save — the note: ' + JSON.stringify(said))
  if (await w.page.locator('[data-testid="win-inputsday-x"]').count()) await press(w, '[data-testid="win-inputsday-x"]')
  log(c, `filed ${JSON.stringify(spec)} on ${iso}: new input ${JSON.stringify(made)}; asked ${JSON.stringify(asked)}; note ${JSON.stringify(said)}`)
  return made.length === 1 ? made[0] : null
}
/* open a saved input from its day, change it with `edit`, Save */
async function editInput(w, c, iid, iso, edit) {
  await openDay(w, iso)
  const card = w.page.locator(`[data-testid="win-inputsday"] [data-iid="${iid}"], [data-testid="win-inputsday"] [data-popiid="${iid}"]`).first()
  if (!(await card.count())) throw new Error(`no card for ${iid} in the day ${iso}`)
  await press(w, card)
  await w.page.locator('[data-testid="win-inputedit"]').waitFor({ timeout: 5000 })
  await sleep(400)
  await edit()
  await press(w, '#inpEditSave')
  const asked = await answerAsks(w)
  const said = await shownToast(w.page)
  const open = await w.page.locator('[data-testid="win-inputedit"]:visible').count()
  log(c, `saved the change: asked ${JSON.stringify(asked)}; note ${JSON.stringify(said)}; window still open: ${!!open}`)
  if (open) { await w.page.keyboard.press('Escape'); await sleep(300); const d = w.page.getByRole('button', { name: /Discard|Close it/ }).first(); if (await d.count()) await d.click().catch(() => {}) }
  if (await w.page.locator('[data-testid="win-inputsday-x"]').count()) await press(w, '[data-testid="win-inputsday-x"]')
  return { asked, said }
}

/* ---------- pictures ---------- */
/* the viewport box round some elements, padded and kept on the screen */
const boxOf = (page, sels, pad = 12, opts = {}) => page.evaluate(([sels, pad, o]) => {
  let L = 1e9, T = 1e9, R = -1e9, B = -1e9
  for (const s of sels) for (const e of document.querySelectorAll(s)) {
    const r = e.getBoundingClientRect(); if (r.width <= 1 || r.height <= 1) continue
    L = Math.min(L, r.left); T = Math.min(T, r.top); R = Math.max(R, r.right); B = Math.max(B, r.bottom)
  }
  if (L > R) return null
  const x = o.fullWidth ? 0 : Math.max(0, L - pad), y = o.fromTop ? 0 : Math.max(0, T - pad)
  const r = o.fullWidth ? innerWidth : Math.min(innerWidth, R + pad), b = Math.min(innerHeight, B + pad)
  return { x, y, width: r - x, height: b - y }
}, [sels, pad, opts])
async function shot(page, c, name, clip, text, size, extra = {}) {
  if (!clip) { facts.errors.push(`${c} ${name}: nothing to clip`); log(c, `NO PICTURE ${name}: nothing to clip`); return }
  const file = name + '.png'
  await page.screenshot({ path: join(OUT, file), clip })
  facts.pictures.push({ file, case: c, size: SIZE_SAYS[size], text, ...extra })
  log(c, `picture ${file}: ${JSON.stringify(text)}`)
}
/* swap words in a node and ring them; returns what the node now says */
const swapIn = (page, sel, html) => page.evaluate(([sel, html, ring]) => {
  if (!document.getElementById('w4-ring')) { const s = document.createElement('style'); s.id = 'w4-ring'; s.textContent = ring; document.head.append(s) }
  const e = typeof sel === 'string' ? document.querySelector(sel) : null
  if (!e) return null
  e.innerHTML = html
  return (e.textContent || '').replace(/\s+/g, ' ').trim()
}, [sel, html, RING])
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;')

/* the note at the foot, held where it stands once it shows (a passing note fades after a few seconds) */
async function catchToast(page, re, timeout = 6000) {
  try {
    await page.waitForFunction(src => { const t = document.getElementById('toastEl'); if (!t) return false; const cs = getComputedStyle(t); return +cs.opacity > 0.5 && new RegExp(src, 'i').test(t.textContent || '') }, re.source, { timeout })
  } catch { return null }
  await page.evaluate(() => { const s = document.createElement('style'); s.id = 'w4-hold'; s.textContent = '#toastEl{opacity:1 !important}'; document.head.append(s) })
  return page.evaluate(() => (document.getElementById('toastEl').textContent || '').replace(/\s+/g, ' ').trim())
}
const releaseToast = page => page.evaluate(() => document.getElementById('w4-hold')?.remove())
const toastClip = (page, pad = 40) => boxOf(page, ['#toastEl'], pad)
async function toastPair(w, c, name, re, after, extraSels = []) {
  const today = await catchToast(w.page, re)
  if (!today) { const now = await shownToast(w.page); log(c, `NOT AS DRAFTED: no note matching ${re} — the note showing: ${JSON.stringify(now)}`); if (now) await shot(w.page, c, `${name}-what-showed`, await toastClip(w.page), now, w.size); return null }
  await w.page.mouse.move(2, 2).catch(() => {})
  const clip = await boxOf(w.page, ['#toastEl', ...extraSels], 40)
  await shot(w.page, c, `${name}-today`, clip, today, w.size)
  if (after != null) {
    const now = await swapIn(w.page, '#toastEl', `<span class="w4-chg">${esc(after)}</span>`)
    await shot(w.page, c, `${name}-after`, await boxOf(w.page, ['#toastEl', ...extraSels], 40), now, w.size, { swappedFrom: today })
  }
  await releaseToast(w.page)
  return today
}

/* ---------- the bell, on Ranger's phone ---------- */
async function openBell(w) {
  await go(w.page, 'viewsched')
  await w.page.evaluate(() => scrollTo(0, 0))
  const b = w.page.locator('#notifyBell:visible').first()
  await press(w, b)
  const list = await w.page.locator('[data-testid="bell-list"]').waitFor({ timeout: 4000 }).then(() => true).catch(() => false)
  if (!list) { log('bell', 'the bell opened no list; the note: ' + JSON.stringify(await shownToast(w.page))); return [] }
  await sleep(300)
  return w.page.evaluate(() => [...document.querySelectorAll('[data-testid="bell-list"] .bl-line')].map((l, i) => {
    l.setAttribute('data-w4', String(i))
    const t = s => (l.querySelector(s)?.textContent || '').replace(/\s+/g, ' ').trim()
    return { i, name: t('.bl-name'), day: t('.bl-day'), what: t('.bl-what'), ago: t('.bl-ago') }
  }))
}
const bellClip = page => boxOf(page, ['[data-testid="bell-list"]', '#notifyBell'], 10, { fullWidth: true, fromTop: true })
/* the today picture of the list, then an after picture per variant, each swapping one line's words before " · <who>" */
async function bellPair(w, c, lines, pick, variants) {
  const L = lines.find(pick)
  log(c, 'Ranger\'s bell, as the app prints it: ' + JSON.stringify(lines.map(l => `${l.name} ${l.day} / ${l.what}`)))
  await shot(w.page, c, `${c}-phone-bell-today`, await bellClip(w.page), lines.map(l => `${l.name} ${l.day} / ${l.what}`), w.size, { line: L ? `${L.name} ${L.day} / ${L.what}` : null })
  if (!L) { log(c, 'NOT AS DRAFTED: no line of the drafted kind in the bell'); return null }
  for (const [tag, words] of variants) {
    const who = (/ · ([^·]+)$/.exec(L.what) || [])[1]
    const html = `<span class="w4-chg">${esc(words)}</span>${who ? ' · ' + esc(who) : ''}`
    const now = await swapIn(w.page, `[data-w4="${L.i}"] .bl-what`, html)
    await shot(w.page, c, `${c}-phone-bell-after${tag}`, await bellClip(w.page), now, w.size, { swappedFrom: L.what })
  }
  return L
}

const RANGER = 'bane', HEX = 'rocky', WED = '2026-07-15', THU = '2026-07-16'

/* ================= Q1 — an LL changed to OL ================= */
async function q1() {
  const c = 'q1'
  let w = await newPage('desk'); await signIn(w, 'us')
  const iid = await fileInput(w, c, WED, { type: 'LL', span: 'all', remarks: 'Local leave' })
  if (!iid) { log(c, 'NOT REACHED: Ranger could not file his LL'); await w.ctx.close(); return }
  log(c, 'Ranger\'s LL as saved: ' + JSON.stringify(await recOf(w.page, iid)))
  w = await handOver(w, 'desk', 'ad')
  await editInput(w, c, iid, WED, async () => {
    log(c, 'type options: ' + JSON.stringify((await w.page.locator('#inpEditPop #inpEditType option').evaluateAll(os => os.map(o => o.value))).slice(0, 40)))
    await w.page.selectOption('#inpEditPop #inpEditType', 'OL')
  })
  log(c, 'after Saber\'s save: ' + JSON.stringify(await recOf(w.page, iid)))
  w = await handOver(w, 'phone', 'us')
  log(c, 'notices to Ranger in store: ' + JSON.stringify(await w.page.evaluate(r => window.NOTICES.filter(n => n.to === r).map(n => ({ name: n.name, day: n.day, what: n.what })), RANGER)))
  const lines = await openBell(w)
  const L = await bellPair(w, c, lines, l => /Renamed|OL/.test(l.what + l.name), [['', WORDS.q1.after]])
  facts.cases[c].asDrafted = !!L && /^Renamed — was LL · Saber$/.test(L.what) && L.name === 'OL'
  await w.ctx.close()
}

/* ================= Q2 — a whole-day LL made the morning half ================= */
async function q2() {
  const c = 'q2'
  let w = await newPage('desk'); await signIn(w, 'us')
  const iid = await fileInput(w, c, WED, { type: 'LL', span: 'all', remarks: 'Local leave' })
  if (!iid) { log(c, 'NOT REACHED: Ranger could not file his LL'); await w.ctx.close(); return }
  w = await handOver(w, 'desk', 'ad')
  await editInput(w, c, iid, WED, async () => {
    const am = w.page.locator('#inpEditSpan [data-span="am"]')
    if (!(await am.count())) throw new Error('no AM button in the window')
    await press(w, am)
  })
  log(c, 'after Saber\'s save: ' + JSON.stringify(await recOf(w.page, iid)))
  w = await handOver(w, 'phone', 'us')
  const lines = await openBell(w)
  const L = await bellPair(w, c, lines, l => /^Now /.test(l.what), [['', WORDS.q2.after]])
  facts.cases[c].asDrafted = !!L && /^Now 00:00–12:00 am · Saber$/.test(L.what)
  await w.ctx.close()
}

/* ================= Q3 — cancelled, moved and renamed ================= */
async function q3() {
  const c = 'q3'
  let w = await newPage('desk'); await signIn(w, 'ad')
  const iid = await fileInput(w, c, WED, { type: 'Training', people: [RANGER, HEX], from: '09:00', to: '10:00', title: 'Training', remarks: 'Bring your kit' })
  if (!iid) { log(c, 'NOT REACHED: Saber could not file the group input'); await w.ctx.close(); return }
  log(c, 'filed: ' + JSON.stringify(await recOf(w.page, iid)))
  /* the CANCEL: the one door is the schedule — its row's CX, with a reason (D760); there is no cancel in the input's window */
  await go(w.page, 'editsched')
  await w.page.evaluate(() => window.openScheduler(2)); await w.page.waitForSelector('#schedBoard', { timeout: 8000 }); await sleep(700)
  const ri = await w.page.evaluate(i => ((window.DAYS[2].ground) || []).findIndex(g => g && String(g.src) === String(i)), iid)
  log(c, 'its row on Wednesday\'s Ground Programme: ' + ri)
  const cxb = w.page.locator(`#schedBoard [data-grcx="2.${ri}"]:visible`).first()
  if (ri < 0 || !(await cxb.count())) log(c, 'NOT REACHED: no CX button on its row')
  else {
    await cxb.scrollIntoViewIfNeeded(); await cxb.click(); await w.page.locator('#cxReason:visible').waitFor({ timeout: 4000 })
    await w.page.fill('#cxReason', 'weather'); await w.page.keyboard.press('Enter'); await sleep(700)
    log(c, 'cancelled on the schedule: note ' + JSON.stringify(await shownToast(w.page)) + '; record ' + JSON.stringify(await recOf(w.page, iid)))
  }
  const off = w.page.locator('#sbDone:visible, #sbClose:visible').first(); if (await off.count()) { await off.click(); await sleep(600) }
  /* ONE save on the Inputs page: moved a day later, renamed, and its remark changed (the third change the bell's line cuts) */
  await editInput(w, c, iid, WED, async () => {
    const d = w.page.locator(`#inpEdCal [data-iso="${THU}"]`)
    if (!(await d.count())) throw new Error('no Thu 16 Jul in the window\'s calendar')
    await press(w, d)
    log(c, 'the window\'s dates now read: ' + JSON.stringify(await w.page.locator('#inpEditPop .rc-read').innerText().catch(() => '?')))
    await w.page.fill('#inpEditPop #inpEditOwnTitle', 'Range brief')
    await w.page.fill('#inpEditPop #inpEditRmk', 'Bring water')
  })
  log(c, 'after the one save: ' + JSON.stringify(await recOf(w.page, iid)))
  w = await handOver(w, 'phone', 'us')
  log(c, 'notices to Ranger in store: ' + JSON.stringify(await w.page.evaluate(r => window.NOTICES.filter(n => n.to === r).map(n => ({ name: n.name, day: n.day, what: n.what })), RANGER)))
  const lines = await openBell(w)
  const drafted = lines.find(l => /^Cancelled — weather, Now /.test(l.what))
  if (drafted) {
    facts.cases[c].asDrafted = true
    await bellPair(w, c, lines, l => l === drafted, [['-a', WORDS.q3.afterA], ['-b', WORDS.q3.afterB]])
  } else {
    facts.cases[c].asDrafted = false
    log(c, 'NOT AS DRAFTED: no one line says "Cancelled — weather, Now …" — the cancel is its own save on the schedule; the move and rename are another save on the Inputs page')
    await bellPair(w, c, lines, l => /^Now .*,/.test(l.what), [['-a', WORDS.q3.realAfterA], ['-b', WORDS.q3.realAfterB]])
  }
  await w.ctx.close()
}

/* ================= Q4a — a time the app cannot read ================= */
async function q4a() {
  const c = 'q4a'
  const w = await newPage('desk'); await signIn(w, 'ad')
  await go(w.page, 'editsched'); await w.page.evaluate(() => scrollTo(0, 0))
  /* (1) a take-off box of the week: "2560 is not a time. Try 0900 or 09:00." */
  const box = await w.page.evaluate(() => { const e = [...document.querySelectorAll('#eWeek [data-txt^="ff:"][data-txt$=".to"]')].find(x => x.getBoundingClientRect().width > 4); if (!e) return null; e.scrollIntoView({ block: 'center', inline: 'center' }); e.setAttribute('data-w4box', '1'); return { key: e.getAttribute('data-txt'), was: e.textContent } })
  log(c, 'the schedule\'s time box: ' + JSON.stringify(box))
  if (box) {
    await sleep(250)
    await w.page.locator('[data-w4box="1"]').click(); await w.page.keyboard.press('Control+A'); await w.page.keyboard.type('2560', { delay: 10 })
    await w.page.keyboard.press('Tab')
    await toastPair(w, c, 'q4a-1-schedule-time', /is not a time/, null)
  } else log(c, 'NOT REACHED: no take-off box on the week')
  await sleep(4500)
  /* (2) an input's own time, typed in its row on the schedule (the input window's boxes are the browser's own time
     pickers, which cannot hold 2560 — the one place an input's time is typed as text is its row, ui/textedit.ts) */
  let cell = null
  for (let di = 0; di < 7 && !cell; di++) {
    await w.page.evaluate(i => document.querySelector(`#eWeek [data-pitog="${i}"]`)?.click(), di); await sleep(250)
    cell = await w.page.evaluate(() => { const e = [...document.querySelectorAll('#eWeek [data-inp$=".str"]')].find(x => x.getBoundingClientRect().width > 4); if (!e) return null; e.scrollIntoView({ block: 'center', inline: 'center' }); e.setAttribute('data-w4cell', '1'); return { key: e.getAttribute('data-inp'), was: e.textContent, tag: e.tagName } })
  }
  if (!cell) {
    cell = await w.page.evaluate(() => { const e = [...document.querySelectorAll('[data-ifld$=".str"]')].find(x => x.getBoundingClientRect().width > 4); if (!e) return null; e.scrollIntoView({ block: 'center' }); e.setAttribute('data-w4cell', '1'); return { key: e.getAttribute('data-ifld'), was: e.value, tag: e.tagName } })
  }
  log(c, 'an input\'s start-time cell: ' + JSON.stringify(cell))
  if (cell) {
    await sleep(250)
    const el = w.page.locator('[data-w4cell="1"]')
    await el.click()
    if (cell.tag === 'INPUT') { await el.fill(''); await el.type('2560', { delay: 10 }) } else { await w.page.keyboard.press('Control+A'); await w.page.keyboard.type('2560', { delay: 10 }) }
    await w.page.keyboard.press('Tab')
    await toastPair(w, c, 'q4a-2-input-time', /not a time/, WORDS.q4a.after.replace('{typed}', '2560'))
  } else log(c, 'NOT REACHED: no input start-time cell on the week')
  await w.ctx.close()
}

/* ================= Q4b — a man put on the seat he already holds ================= */
async function q4b() {
  const c = 'q4b'
  const w = await newPage('desk'); await signIn(w, 'ad')
  await go(w.page, 'editsched')
  await w.page.evaluate(() => window.openScheduler(0)); await w.page.waitForSelector('#schedBoard', { timeout: 8000 }); await sleep(800)
  const seat = await w.page.evaluate(() => {
    const s = [...document.querySelectorAll('#schedBoard [data-slot]')].find(e => { const p = e.querySelector('.puck[data-person]'); const r = e.getBoundingClientRect(); return p && r.width > 4 && !/^(all|allavail)$/.test(p.getAttribute('data-person')) && window.PEOPLE[p.getAttribute('data-person')] && !window.PEOPLE[p.getAttribute('data-person')].special })
    if (!s) return null
    const id = s.querySelector('.puck[data-person]').getAttribute('data-person')
    return { key: s.getAttribute('data-slot'), id, cs: window.PEOPLE[id].cs }
  })
  log(c, 'a seat with a man on it: ' + JSON.stringify(seat))
  if (!seat) { log(c, 'NOT REACHED: no seated man on Monday\'s board'); await w.ctx.close(); return }
  const slot = w.page.locator(`#schedBoard [data-slot="${seat.key}"]`).first()
  /* (1) by a tap: arm his seat, then press his own name in the crew list */
  await slot.scrollIntoViewIfNeeded(); await slot.click(); await sleep(350)
  const armed = await w.page.evaluate(() => (window.ARM && window.ARM.key) || null)
  log(c, 'armed after a tap on his seat: ' + JSON.stringify(armed) + '; note ' + JSON.stringify(await shownToast(w.page)))
  const name = w.page.locator(`#sbRoster .rpuck[data-person="${seat.id}"]:visible`).first()
  if (!armed) log(c, 'NOT REACHED (tap): a tap on a seat with a man on it arms nothing — see the note above')
  else if (!(await name.count())) log(c, 'NOT REACHED (tap): his name is not in the crew list while he is seated')
  else {
    await name.scrollIntoViewIfNeeded(); await name.click()
    const t = await toastPair(w, c, 'q4b-1-tap', /already in that seat/, WORDS.q4b.afterTap.replace('{name}', seat.cs))
    if (!t) log(c, 'tap: the seat now holds ' + JSON.stringify(await w.page.evaluate(k => window.slotVal(k), seat.key)))
  }
  await w.page.keyboard.press('Escape'); await sleep(4500)
  /* (2) by a drag: his puck lifted from his seat, carried off it and back, and let go on it */
  const puck = w.page.locator(`#schedBoard [data-slot="${seat.key}"] .puck[data-person="${seat.id}"]`).first()
  await puck.scrollIntoViewIfNeeded(); await sleep(200)
  const a = await puck.boundingBox()
  if (!a) { log(c, 'NOT REACHED (drag): no puck box'); await w.ctx.close(); return }
  const cx = a.x + a.width / 2, cy = a.y + a.height / 2
  await w.page.mouse.move(cx, cy); await w.page.mouse.down()
  await w.page.mouse.move(cx + 10, cy + 10, { steps: 3 })
  await w.page.mouse.move(cx + 60, cy + 70, { steps: 8 })
  await w.page.mouse.move(cx, cy, { steps: 10 }); await sleep(250)
  await w.page.mouse.up()
  await toastPair(w, c, 'q4b-2-drag', /lready in that seat/, WORDS.q4b.afterDrag.replace('{name}', seat.cs))
  await w.ctx.close()
}

/* ================= Q4c — a member presses Save on a day's OIL list ================= */
function q4c() {
  /* not driven: the list's window draws nothing for anyone but an admin of its squadron (ui/OilDayList.tsx: `refused`
     → it closes itself and returns nothing), and its Save asks the same test (ui/oilday.ts adminOfList) — so a member
     never sees the list or its Save; the words are a safety net behind a door the screen does not offer him */
  log('q4c', 'NOT REACHABLE through the screen: the OIL list window closes itself and draws nothing for a non-admin (the same test as its Save)')
}

/* ================= S1 — the Inputs page's look-ahead saved ================= */
async function s1() {
  const c = 's1'
  const w = await newPage('desk'); await signIn(w, 'ad')
  await go(w.page, 'inputs')
  if (await w.page.locator('#inListBtn').count()) await press(w, '#inListBtn')
  await press(w, '#inRangeBtn'); await w.page.locator('#inRangePop').waitFor()
  await press(w, '#inRangeEdit')
  const weeks = await w.page.inputValue('#inLookWeeks'); const sun = await w.page.isChecked('#inLookSun')
  log(c, `the setting as it stands: ${weeks} weeks, to Sunday: ${sun}`)
  if (weeks !== '4') await w.page.fill('#inLookWeeks', '4')
  if (!sun) await w.page.check('#inLookSun')
  await press(w, '#inLookSave')
  await toastPair(w, c, 's1-lookahead', /Everyone now opens/, WORDS.s1.after, ['#inRangeBtn'])
  await w.ctx.close()
}

/* ================= S2 — a weekend no Leave War period covers, published ================= */
async function s2() {
  const c = 's2'
  const w = await newPage('desk'); await signIn(w, 'ad')
  /* the demo's periods hold 2026 and 2027 (ui/oilnoperiod-board.test.tsx); the first year no period holds is 2028 —
     a week of February 2028, reached by the week loader (getting to a place) */
  await go(w.page, 'editsched')
  await w.page.evaluate(() => window.loadWeek('31/01/2028')); await sleep(1200)
  const wk = await w.page.evaluate(() => window.DAYS.map((d, i) => `${i}:${d.dow} ${d.dt}`))
  log(c, 'the week loaded: ' + JSON.stringify(wk))
  const SAT = await w.page.evaluate(() => window.DAYS.findIndex(d => /^Sat/i.test(d.dow)))
  if (SAT < 0) { log(c, 'NOT REACHED: no Saturday in the loaded week'); await w.ctx.close(); return }
  /* a man on the Saturday: arm an empty seat on the board, press a name in the crew list */
  await w.page.evaluate(i => window.openScheduler(i), SAT); await w.page.waitForSelector('#schedBoard', { timeout: 8000 }); await sleep(800)
  const empty = await w.page.evaluate(() => { const e = [...document.querySelectorAll('#schedBoard [data-slot], #schedBoard [data-fill]')].find(x => x.getBoundingClientRect().width > 4 && !x.querySelector('.puck[data-person]')); return e ? (e.getAttribute('data-slot') || e.getAttribute('data-fill')) : null })
  log(c, 'an empty place on the Saturday: ' + JSON.stringify(empty))
  if (!empty) { log(c, 'NOT REACHED: nothing on the Saturday to put a man in'); await w.ctx.close(); return }
  const place = w.page.locator(`#schedBoard [data-slot="${empty}"], #schedBoard [data-fill="${empty}"]`).first()
  await place.scrollIntoViewIfNeeded(); await place.click(); await sleep(300)
  const man = await w.page.evaluate(() => { const e = [...document.querySelectorAll('#sbRoster .rpuck[data-person]')].find(x => x.offsetParent && !x.classList.contains('no') && window.PEOPLE[x.getAttribute('data-person')] && !window.PEOPLE[x.getAttribute('data-person')].special); return e ? e.getAttribute('data-person') : null })
  if (man) { const n = w.page.locator(`#sbRoster .rpuck[data-person="${man}"]:visible`).first(); await n.scrollIntoViewIfNeeded(); await n.click(); await sleep(600) }
  log(c, `put ${man} on ${empty}: the place now holds ${JSON.stringify(await w.page.evaluate(k => { try { return window.slotVal(k) } catch { return '?' } }, empty))}; note ${JSON.stringify(await shownToast(w.page))}`)
  const off = w.page.locator('#sbDone:visible, #sbClose:visible').first(); if (await off.count()) { await off.click(); await sleep(600) }
  /* sign the four and publish, on the week */
  await go(w.page, 'editsched')
  await w.page.evaluate(i => { const d = document.querySelector(`#eWeek .day[data-day="${i}"]`); const sc = d && (d.closest('.week') || d.parentElement); if (sc && d) sc.scrollLeft = d.offsetLeft; scrollTo(0, 0) }, SAT); await sleep(400)
  const signed = {}
  for (const role of ['cur', 'sked', 'plan', 'appr']) {
    const sel = w.page.locator(`#eWeek select[data-sign="${role}"][data-signday="${SAT}"]:visible`).first()
    if (!(await sel.count())) { signed[role] = 'NO SELECT'; continue }
    const opts = await sel.locator('option').evaluateAll(os => os.map(o => o.value).filter(Boolean))
    await sel.selectOption(opts[0]); await sleep(250)
    signed[role] = await sel.evaluate(s => s.options[s.selectedIndex]?.text || '')
  }
  log(c, 'signed: ' + JSON.stringify(signed))
  const pub = w.page.locator(`#eWeek [data-beak="${SAT}"]:visible`).first()
  if (!(await pub.count()) || await pub.isDisabled()) { log(c, 'NOT REACHED: the Saturday\'s publish button is ' + ((await pub.count()) ? 'greyed: ' + (await pub.getAttribute('title')) : 'absent')); await w.ctx.close(); return }
  await pub.scrollIntoViewIfNeeded(); await pub.click(); await sleep(400)
  const ok = w.page.getByRole('button', { name: /^(Publish|Yes|Confirm)/ }).first()
  if (await ok.count() && await ok.isVisible().catch(() => false)) await ok.click()
  const year = '2028'
  await toastPair(w, c, 's2-no-period', /no leave war period/, WORDS.s2.after.replace('{year}', year))
  await w.ctx.close()
}

const CASES = { q1, q2, q3, q4a, q4b, q4c, s1, s2 }
for (const [k, f] of Object.entries(CASES)) {
  if (!run(k)) continue
  try { await f() } catch (e) { facts.errors.push(`${k}: ` + String(e && e.stack || e).slice(0, 600)); log(k, 'ERROR ' + String(e && e.message || e).split('\n')[0]) }
}
writeFileSync(join(OUT, 'facts.json'), JSON.stringify(facts, null, 1))
console.log('\npictures:', facts.pictures.length, '· errors:', facts.errors.length)
for (const e of facts.errors.slice(0, 30)) console.log('  ' + e)
await browser.close()
