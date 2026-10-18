/* WALK of the night's job 7 (18 Oct 26) on the RUNNING built app, served on :4174 — the Tracker's Legend pop-out, the flex
   settings window, and the down days worked out from the man's medical inputs since his course start. Each step is an
   assertion, PASS / FAIL; its note prints the value judged. Pictures: docs/img/handpass/2026-10-18-night-job7/ (this
   script empties that folder first). Desktop 1440 x 900; phone 390 x 844, isMobile + hasTouch.
   The man: Zenith (a roster man), added through the real "+ Add"; his medical inputs are filed through the app's local-only
   inputs door (window.fileInput — the same door the approved mock-ups used); the deleting (B1) is the Inputs page's own.
   usage: node scripts/handpass/night1018-job7-walk.mjs [baseURL] */
import { createRequire } from 'node:module'
import { existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
const require = createRequire(import.meta.url)
const { chromium } = require('playwright')
console.log('night1018-job7-walk v1')
const here = dirname(fileURLToPath(import.meta.url))
const out = join(here, '..', '..', 'docs', 'img', 'handpass', '2026-10-18-night-job7')
rmSync(out, { recursive: true, force: true }); mkdirSync(out, { recursive: true })
const base = process.argv[2] || 'http://localhost:4174'
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const b = await chromium.launch(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {})
const DESK = { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 }
const PHONE = { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 }
const problems = []
const results = []
const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

/* ---------- dates, from the squadron's own today ---------- */
const isoOf = ms => new Date(ms).toISOString().slice(0, 10)
const msOf = iso => Date.UTC(+iso.slice(0, 4), +iso.slice(5, 7) - 1, +iso.slice(8, 10))
const addDays = (iso, n) => isoOf(msOf(iso) + n * 86400000)
const TODAY = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Singapore', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date())
const lbl = iso => MON[+iso.slice(5, 7) - 1] + ' ' + +iso.slice(8, 10)         /* "Sep 28" — an input's own date words */
const words = iso => +iso.slice(8, 10) + ' ' + MON[+iso.slice(5, 7) - 1] + ' ' + iso.slice(0, 4) /* "20 Sep 2026" */
const CS1 = addDays(TODAY, -28)      /* the first course start */
const CS2 = addDays(TODAY, -12)      /* the later one (D5) */
const ATTC = [addDays(TODAY, -20), addDays(TODAY, -18)]   /* 3 days */
const OML = addDays(TODAY, -10)                           /* half a day (AM) */
const HL = [addDays(TODAY, -2), addDays(TODAY, 7)]        /* running past today; counts T-2..T = 3 days */
const SYLL = addDays(TODAY, -7), CURR = addDays(TODAY, -3)
console.log('today (Singapore):', TODAY, '| course start', CS1, '| later', CS2)

/* ---------- plumbing ---------- */
const rec = (id, pass, seen, pic) => { results.push({ id, pass, seen: String(seen).replace(/\s+/g, ' ').slice(0, 300), pic: pic || '' }); console.log(`${pass === true ? 'PASS' : pass === false ? 'FAIL' : pass} ${id} — ${String(seen).replace(/\s+/g, ' ').slice(0, 300)}${pic ? '  [' + pic + ']' : ''}`) }
const guard = async (id, fn) => { try { await fn() } catch (e) { rec(id, 'NOT WALKED', 'script stopped: ' + String(e.message).split('\n')[0]) } }
const shot = async (p, name) => { await p.screenshot({ path: join(out, name + '.png') }); return name + '.png' }
const newPage = async (dev, tag) => {
  const ctx = await b.newContext({ baseURL: base, ...dev })
  const p = await ctx.newPage()
  p.on('pageerror', e => problems.push(`${tag} pageerror: ${e.message}`))
  p.on('console', m => { if (m.type() === 'error') problems.push(`${tag} console: ${m.text().slice(0, 200)}`) })
  p.on('response', r => { if (r.status() >= 400) problems.push(`${tag} http ${r.status()} ${r.url().slice(0, 120)}`) })
  p.on('dialog', d => { problems.push(`${tag} browser dialog: ${d.message().slice(0, 120)}`); d.dismiss() })
  return { ctx, p }
}
async function login(p, u, pw) {
  await p.waitForSelector('#luser'); await p.fill('#luser', u); await p.fill('#lpass', pw); await p.click('#loginForm button[type=submit]')
  await p.waitForSelector('#vWeek .day', { state: 'attached' }); await p.waitForTimeout(400)
}
const goTracker = async p => { await p.evaluate(() => window.go('tracker')); await p.waitForTimeout(1500) }
const tab = async (p, v) => { const t = p.locator(`#viewtabs button[data-view=${v}]`); if (await t.isVisible()) { await t.click(); await p.waitForTimeout(350) } }
const txt = (p, sel) => p.evaluate(s => { const e = document.querySelector(s); return e ? e.innerText.trim() : null }, sel)
const exists = (p, sel) => p.evaluate(s => !!document.querySelector(s) && !!document.querySelector(s).getClientRects().length, sel)
const active = p => p.evaluate(() => { const a = document.activeElement; return a ? (a.id || a.tagName) : null })
async function pickDay(p, boxSel, iso) {
  await p.click(boxSel); await p.waitForSelector('.dcal'); await p.waitForTimeout(150)
  const cell = `.dcal [data-iso="${iso}"]`
  for (let i = 0; i < 14 && !(await p.$(cell)); i++) { await p.click('.dcal .dcal-nav[aria-label="Previous month"]'); await p.waitForTimeout(80) }
  for (let i = 0; i < 30 && !(await p.$(cell)); i++) { await p.click('.dcal .dcal-nav[aria-label="Next month"]'); await p.waitForTimeout(80) }
  await p.click(cell); await p.waitForTimeout(300)
}
const inView = (p, sel) => p.evaluate(s => { const e = document.querySelector(s); if (!e) return null; const r = e.getBoundingClientRect(); return { l: Math.round(r.left), t: Math.round(r.top), r: Math.round(r.right), b: Math.round(r.bottom), fits: r.left >= 0 && r.top >= 0 && r.right <= innerWidth && r.bottom <= innerHeight, vw: innerWidth, vh: innerHeight } }, sel)
const barInfo = p => p.evaluate(() => {
  const vis = e => e.getBoundingClientRect().width && e.getBoundingClientRect().height
  const mids = [...document.querySelectorAll('#page-tracker header .controls > *')].filter(vis).map(e => { const r = e.getBoundingClientRect(); return r.top + r.height / 2 }).sort((a, c) => a - c)
  const rows = mids.filter((m, i) => i === 0 || m - mids[i - 1] > 14).length
  const lb = document.getElementById('legendBtn'), sa = document.getElementById('showAllBtn')
  const l = lb && lb.getBoundingClientRect(), s = sa && sa.getBoundingClientRect()
  return { rows, legend: l && { x: Math.round(l.x), y: Math.round(l.y), w: Math.round(l.width) }, showAll: s && s.width ? { x: Math.round(s.x), y: Math.round(s.y), w: Math.round(s.width) } : 'hidden', hdrH: Math.round(document.querySelector('#page-tracker header').getBoundingClientRect().height) }
})
const openLegend = async p => { await p.click('#legendBtn'); await p.waitForSelector('[data-testid=trk-legend]'); await p.waitForTimeout(250) }
const closedLegend = p => p.waitForSelector('[data-testid=trk-legend]', { state: 'detached', timeout: 2500 }).then(() => true, () => false)
const scrollInfo = async p => { await p.locator('.c-curr').scrollIntoViewIfNeeded(); await p.evaluate(() => document.querySelector('.c-curr').scrollIntoView({ block: 'center' })); await p.waitForTimeout(250) }
const openFlex = async p => { await p.click('#flexBtn'); await p.waitForSelector('[data-testid=trk-flex]'); await p.waitForTimeout(250) }
const flexGone = p => p.waitForSelector('[data-testid=trk-flex]', { state: 'detached', timeout: 2500 }).then(() => true, () => false)
const flexbarTxt = p => txt(p, '[data-testid=trk-flexbar]')
const legendFlexTxt = p => txt(p, '[data-testid=trk-legend-flex]')

/* the Zenith fixture: real "+ Add" with a course start; returns what the add box showed */
async function addZenith(p, phone, courseStartIso, tag) {
  if (phone) await tab(p, 'info')
  await p.click('#addStu'); await p.waitForSelector('#dlgModal #dlgFilter'); await p.waitForTimeout(300)
  const box = await p.evaluate(() => {
    const d = document.querySelector('#dlgDate'), list = document.querySelector('#dlgList'), lab = document.querySelector('.dlg-date label')
    return d ? { label: lab ? lab.innerText.trim() : null, text: d.querySelector('.datebox-txt') ? d.querySelector('.datebox-txt').innerText.trim() : d.innerText.trim(), dateTop: Math.round(d.getBoundingClientRect().top), listTop: list ? Math.round(list.getBoundingClientRect().top) : null, filterTop: Math.round(document.querySelector('#dlgFilter').getBoundingClientRect().top) } : null
  })
  const picA = await shot(p, `D1a-add-box-default-${tag}`)
  await pickDay(p, '#dlgDate', courseStartIso)
  const picked = await txt(p, '#dlgDate .datebox-txt')
  await p.fill('#dlgFilter', 'Zenith'); await p.waitForTimeout(200)
  const picB = await shot(p, `D1b-add-box-picked-${tag}`)
  await p.locator('#dlgList .dlg-item', { hasText: 'Zenith' }).first().click(); await p.waitForTimeout(800)
  const closed = !(await p.$('#dlgModal'))
  return { box, picked, closed, picA, picB }
}
const fileMedical = p => p.evaluate(([a, o, h]) => {
  window.fileInput({ person: 'vinci', type: 'ATT C', date: a.s, endDate: a.e, yr: a.y, allday: true })
  window.fileInput({ person: 'vinci', type: 'OML', date: o.s, yr: o.y, allday: false, half: 'am' })
  window.fileInput({ person: 'vinci', type: 'HL', date: h.s, endDate: h.e, yr: h.y, allday: true })
}, [{ s: lbl(ATTC[0]), e: lbl(ATTC[1]), y: +ATTC[0].slice(0, 4) }, { s: lbl(OML), y: +OML.slice(0, 4) }, { s: lbl(HL[0]), e: lbl(HL[1]), y: +HL[0].slice(0, 4) }])

/* the window's rows, as read */
const logRows = p => p.evaluate(() => [...document.querySelectorAll('#downLog .frow')].map(r => ({
  chip: r.querySelector('.chip')?.innerText.trim(), when: r.querySelector('.dd-when')?.innerText.trim(), note: r.querySelector('.mini')?.innerText.trim() || '', days: r.querySelector('.dd-days')?.innerText.trim() })))

/* =====================================================================  DESKTOP  */
const D = await newPage(DESK, 'desk'); const dp = D.p
await dp.goto('/'); await login(dp, 'ad', 'a'); await goTracker(dp)

/* ---- L1 desktop ---- */
await guard('L1-desk', async () => {
  const bar = await barInfo(dp)
  const beside = bar.showAll !== 'hidden' && bar.legend && Math.abs(bar.legend.y - bar.showAll.y) <= 4 && bar.legend.x > bar.showAll.x
  const pic0 = await shot(dp, 'L1a-topbar-desktop')
  rec('L1 desk — "Legend" beside Show All, bar one row', beside && bar.rows === 1, JSON.stringify(bar), pic0)
  await openLegend(dp)
  const info = await dp.evaluate(() => {
    const l = document.querySelector('[data-testid=trk-legend]')
    return { balls: l.querySelectorAll('.tleg-tile svg, .tleg-ballrow svg').length, tiles: l.querySelectorAll('.tleg-tile').length, secs: [...l.querySelectorAll('.tleg-sec')].map(e => e.innerText.trim()), flex: !!l.querySelector('[data-testid=trk-legend-flex]'), expanded: document.getElementById('legendBtn').getAttribute('aria-expanded'), rect: (r => ({ l: Math.round(r.left), t: Math.round(r.top), r: Math.round(r.right), b: Math.round(r.bottom) }))(l.getBoundingClientRect()), vh: innerHeight }
  })
  const pic1 = await shot(dp, 'L1b-legend-open-desktop')
  rec('L1 desk — press opens the pop-out: chart balls, currency, flex bands', info.balls >= 14 && info.secs.some(s => /Currency/i.test(s)) && info.flex && info.expanded === 'true', JSON.stringify(info), pic1)
  const fl = await legendFlexTxt(dp)
  rec('L1 desk — flex bands read as built (defaults)', /Optional Flex/.test(fl || '') && /7/.test(fl || ''), (fl || '').slice(0, 220))
  await dp.keyboard.press('Escape'); await dp.waitForTimeout(250)
  const gone = await closedLegend(dp), act = await active(dp)
  const pic2 = await shot(dp, 'L1c-after-escape-desktop')
  rec('L1 desk — Escape closes, keyboard back on the button', gone && act === 'legendBtn', `closed=${gone}; activeElement=${act}`, pic2)
  await openLegend(dp)
  await dp.mouse.click(1100, 650); await dp.waitForTimeout(300)
  const gone2 = await closedLegend(dp)
  const pic3 = await shot(dp, 'L1d-after-tap-outside-desktop')
  rec('L1 desk — a tap outside closes it', gone2, `closed=${gone2}; activeElement=${await active(dp)}`, pic3)
})

/* ---- D1: add Zenith with a course start ---- */
let zOK = false
await guard('D1', async () => {
  const r = await addZenith(dp, false, CS1, 'desktop')
  const above = r.box && r.box.listTop != null && r.box.dateTop < r.box.filterTop && r.box.dateTop < r.box.listTop
  rec('D1 desk — add box shows "Course start" date box above the list, today by default', !!r.box && r.box.label === 'Course start' && above && r.box.text.includes(words(TODAY)), JSON.stringify(r.box), r.picA)
  rec('D1 desk — a course start a few weeks back can be picked', r.picked.includes(words(CS1)), `box reads: ${r.picked}`, r.picB)
  const who = await txt(dp, '.c-overall .who'), cs = await txt(dp, '#courseStart .datebox-txt')
  zOK = r.closed && /ZENITH/i.test(who || '') && !!cs && cs.includes(words(CS1))
  const pic = await shot(dp, 'D1c-info-after-add-desktop')
  rec('D1 desk — he is added; Info panel "Course start" shows the picked day', zOK, `who=${who}; course start box=${cs}; add box closed=${r.closed}`, pic)
})
await guard('setup', async () => {
  await pickDay(dp, '#lastSyll', SYLL); await pickDay(dp, '#lastCurr', CURR)
  await dp.evaluate(() => document.activeElement && document.activeElement.blur())
})

/* ---- D2: medical inputs ---- */
await guard('D2', async () => {
  await dp.evaluate(() => window.go('inputs')); await dp.waitForTimeout(500)
  await fileMedical(dp); await dp.waitForTimeout(300)
  await dp.click('#inListBtn'); await dp.waitForTimeout(800)
  const rows = await dp.evaluate(() => [...document.querySelectorAll('[data-testid=in-open]')].map(e => e.closest('tr') ? e.closest('tr').innerText.replace(/\s+/g, ' ') : ''))
  const picI = await shot(dp, 'D2a-inputs-page-list-desktop')
  rec('D2 desk — inputs filed for him on the Inputs page (HL shows in its list; ATT C and OML are before the list\'s fortnight)', rows.some(r => /Zenith/.test(r) && /\bHL\b/.test(r)), `list rows: ${rows.join(' | ').slice(0, 200)}`, picI)
  await goTracker(dp); await dp.waitForSelector('#downDays')
  const num = await txt(dp, '#downDays .datebox-txt')
  const labels = await dp.evaluate(() => [...document.querySelectorAll('.c-curr label')].map(l => l.innerText.trim()))
  const kv = await dp.evaluate(() => [...document.querySelectorAll('.c-curr .curKv .kv')].map(k => k.innerText.replace(/\s+/g, ' ').trim()))
  const noTyped = await dp.evaluate(() => { const d = document.getElementById('downDays'); return { tag: d && d.tagName, upchit: !!document.getElementById('upchit'), typedInputs: [...document.querySelectorAll('.c-curr input[type=number], .c-curr input[type=text]')].length } })
  await scrollInfo(dp)
  const pic = await shot(dp, 'D2b-info-down-days-desktop')
  rec('D2 desk — "No. of Down Days" = 3 + ½ + running days (expect 6½ days)', num === '6½ days', `reads: ${num}`, pic)
  rec('D2 desk — no typed box, no "Upchit Date" box', noTyped.tag === 'BUTTON' && !noTyped.upchit && noTyped.typedInputs === 0 && !labels.some(l => /Upchit/i.test(l)), `labels=${labels.join(' / ')}; downDays element=${noTyped.tag}; typed inputs=${noTyped.typedInputs}`)
  const cur = kv.find(k => /currency/i.test(k)) || ''
  const noteTxt = await txt(dp, '.c-curr > .mini')
  rec('D2 desk — "Days since currency" shows no "down" subtraction', /3d/.test(cur) && !/down/i.test(cur) && !/down/i.test((noteTxt || '')), `kv=${kv.join(' | ')}; note=${(noteTxt || '').slice(0, 100)}`)
})

/* ---- D3: the window ---- */
await guard('D3', async () => {
  await dp.click('#downDays'); await dp.waitForSelector('#downLog'); await dp.waitForTimeout(300)
  const rows = await logRows(dp), tot = await txt(dp, '#downLogTotal'), head = await txt(dp, '#downLog .lullhd b')
  const foot = await dp.evaluate(() => { const m = [...document.querySelectorAll('#downLog > .mini')].pop(); return m ? m.innerText.trim() : null })
  const focusOnClose = await active(dp)
  const pic = await shot(dp, 'D3a-down-days-window-desktop')
  const okRows = rows.length === 3 && rows[0].chip === 'ATT C' && rows[0].days === '3 days' && rows[1].chip === 'OML' && /\(AM\)/.test(rows[1].when) && rows[1].days === '½ day' && rows[2].chip === 'HL' && rows[2].days === '3 days' && /still running · counted to today/.test(rows[2].note)
  rec('D3 desk — window lists each input: kind, dates, days (½ day; still running · counted to today)', okRows, JSON.stringify(rows), pic)
  rec('D3 desk — total and footer naming the course start', tot === '6½ days' && !!foot && foot.includes(words(CS1)) && /Since the course start/.test(foot), `header=${head}; total=${tot}; footer=${foot}; keyboard on open=${focusOnClose}`)
  await dp.keyboard.press('Escape'); await dp.waitForTimeout(300)
  const gone = !(await exists(dp, '#downLog')), act = await active(dp)
  const pic2 = await shot(dp, 'D3b-after-escape-desktop')
  rec('D3 desk — Escape closes, keyboard back on the number', gone && act === 'downDays', `closed=${gone}; activeElement=${act}`, pic2)
  await dp.click('#downDays'); await dp.waitForSelector('#downLog'); await dp.waitForTimeout(200)
  await dp.mouse.click(60, 600); await dp.waitForTimeout(300)
  rec('D3 desk — a tap outside also closes it, keyboard back on the number', !(await exists(dp, '#downLog')) && (await active(dp)) === 'downDays', `activeElement=${await active(dp)}`)
})

/* ---- D5: later course start ---- */
await guard('D5', async () => {
  await scrollInfo(dp)
  const before = await txt(dp, '#downDays .datebox-txt')
  await pickDay(dp, '#courseStart', CS2); await dp.evaluate(() => document.activeElement && document.activeElement.blur()); await dp.waitForTimeout(300)
  const after = await txt(dp, '#downDays .datebox-txt'), cs = await txt(dp, '#courseStart .datebox-txt')
  await scrollInfo(dp)
  const pic = await shot(dp, 'D5-later-course-start-desktop')
  rec('D5 desk — later course start: the total drops (ATT C falls out, expect 3½ days)', after === '3½ days' && cs.includes(words(CS2)), `before=${before}; after=${after}; course start box=${cs}`, pic)
})

/* ---- F1–F3 admin ---- */
await guard('F1', async () => {
  await scrollInfo(dp)
  const before = await flexbarTxt(dp), dsyll = await dp.evaluate(() => [...document.querySelectorAll('.c-curr .curKv .kv')].map(k => k.innerText.replace(/\s+/g, ' ').trim()))
  await openFlex(dp)
  const w = await dp.evaluate(() => ({ ttl: document.querySelector('.tflex-ttl').innerText.replace(/\s+/g, ' '), from1: document.querySelector('[data-testid=trk-flex-from-1]').value, save: !!document.querySelector('[data-testid=trk-flex-save]'), fits: (r => r.bottom <= innerHeight && r.top >= 0)(document.querySelector('[data-testid=trk-flex]').getBoundingClientRect()), exp: document.getElementById('flexBtn').getAttribute('aria-expanded') }))
  const pic = await shot(dp, 'F1a-flex-settings-admin-desktop')
  rec('F1 desk — the ⚙ opens "Flex settings" (admin: Save, the 7 editable)', /^Flex settings/.test(w.ttl) && w.from1 === '7' && w.save && w.fits, JSON.stringify(w), pic)
  await dp.fill('[data-testid=trk-flex-from-1]', '8'); await dp.click('[data-testid=trk-flex-save]')
  const gone = await flexGone(dp); await dp.waitForTimeout(300)
  const after = await flexbarTxt(dp)
  await scrollInfo(dp)
  const pic2 = await shot(dp, 'F1b-info-flex-after-8-desktop')
  rec('F1 desk — 7 → 8, Save: window closes; a student 7 days since his last syllabus flight now reads current', gone && /Current/i.test(after || '') && !/Optional/i.test(after || ''), `before="${before}"; after="${after}"; kv=${dsyll.join(' | ')}`, pic2)
  await openLegend(dp)
  const lf = await legendFlexTxt(dp)
  await dp.evaluate(() => document.querySelector('[data-testid=trk-legend] .tleg-body').scrollTo(0, 99999)); await dp.waitForTimeout(200)
  const pic3 = await shot(dp, 'F1c-legend-flex-bands-after-8-desktop')
  rec('F1 desk — the Legend\'s flex bands follow (0–7 current, 8–13 optional)', /0\s*–\s*7/.test(lf || '') && /8\s*–\s*13/.test(lf || ''), (lf || '').replace(/\s+/g, ' ').slice(0, 260), pic3)
  await dp.keyboard.press('Escape'); await dp.waitForTimeout(200)
})
await guard('F2', async () => {
  await openFlex(dp)
  await dp.fill('[data-testid=trk-flex-from-1]', '14'); await dp.fill('[data-testid=trk-flex-from-2]', '10'); await dp.click('[data-testid=trk-flex-save]'); await dp.waitForTimeout(300)
  const err1 = await txt(dp, '[data-testid=trk-flex-err]'), open1 = await exists(dp, '[data-testid=trk-flex]')
  const pic = await shot(dp, 'F2a-refused-14-then-10-desktop')
  rec('F2 desk — 14 then 10 is refused with a reason (window stays open)', !!err1 && open1, `message="${err1}"; window still open=${open1}`, pic)
  await dp.fill('[data-testid=trk-flex-from-1]', '14'); await dp.fill('[data-testid=trk-flex-from-2]', '14'); await dp.click('[data-testid=trk-flex-save]'); await dp.waitForTimeout(300)
  const err2 = await txt(dp, '[data-testid=trk-flex-err]')
  await dp.fill('[data-testid=trk-flex-from-1]', 'abc'); await dp.click('[data-testid=trk-flex-save]'); await dp.waitForTimeout(300)
  const err3 = await txt(dp, '[data-testid=trk-flex-err]'), open3 = await exists(dp, '[data-testid=trk-flex]')
  rec('F2 desk — 14 then 14 and a non-number are refused with a reason too', !!err2 && !!err3 && open3, `14,14: "${err2}"; "abc": "${err3}"; still open=${open3}`)
  await dp.click('[data-testid=trk-flex-cancel]'); await flexGone(dp)
  const fb = await flexbarTxt(dp)
  await openFlex(dp); const keep = await dp.inputValue('[data-testid=trk-flex-from-1]'); await dp.click('[data-testid=trk-flex-cancel]'); await flexGone(dp)
  rec('F2 desk — after the refusals and Cancel the saved figures stand (8)', keep === '8' && /Current/i.test(fb || ''), `from-1 reopens as ${keep}; flex bar "${fb}"`)
})
await guard('F3', async () => {
  await openFlex(dp); await dp.click('label.tflex-sw'); await dp.waitForTimeout(150)
  const st = await dp.evaluate(() => document.querySelector('[data-testid=trk-flex-on]').checked)
  await dp.click('[data-testid=trk-flex-save]'); const gone = await flexGone(dp); await dp.waitForTimeout(300)
  await scrollInfo(dp)
  const info = await dp.evaluate(() => ({ h3: document.querySelector('.c-curr h3').textContent.trim(), flexbars: document.querySelectorAll('[data-testid=trk-flexbar]').length, kv: [...document.querySelectorAll('.c-curr .curKv .kv')].map(k => k.innerText.replace(/\s+/g, ' ').trim()), note: (document.querySelector('.c-curr > .mini') || {}).innerText }))
  const pic = await shot(dp, 'F3a-info-flex-off-desktop')
  rec('F3 desk — "Track flex" off, Save: no flex bar, no "Days since syllabus", heading "Currency"', st === false && gone && info.flexbars === 0 && !info.kv.some(k => /syllabus/i.test(k)) && info.h3 === 'Currency', JSON.stringify(info), pic)
  await openLegend(dp)
  const lg = await dp.evaluate(() => ({ flexPart: !!document.querySelector('[data-testid=trk-legend-flex]'), secs: [...document.querySelectorAll('[data-testid=trk-legend] .tleg-sec')].map(e => e.innerText.trim()) }))
  const pic2 = await shot(dp, 'F3b-legend-flex-off-desktop')
  rec('F3 desk — the Legend has no flex part', !lg.flexPart && !lg.secs.some(s => /Flex/i.test(s)), JSON.stringify(lg), pic2)
  await dp.keyboard.press('Escape'); await dp.waitForTimeout(200)
  await openFlex(dp); const picoff = await shot(dp, 'F3c-flex-settings-off-desktop')
  await dp.click('label.tflex-sw'); await dp.fill('[data-testid=trk-flex-from-1]', '7'); await dp.click('[data-testid=trk-flex-save]'); await flexGone(dp); await dp.waitForTimeout(300)
  await scrollInfo(dp)
  const back = await dp.evaluate(() => ({ h3: document.querySelector('.c-curr h3').textContent.trim(), flexbar: (document.querySelector('[data-testid=trk-flexbar]') || {}).innerText, kv: [...document.querySelectorAll('.c-curr .curKv .kv')].map(k => k.innerText.replace(/\s+/g, ' ').trim()) }))
  const pic3 = await shot(dp, 'F3d-info-flex-back-on-7-desktop')
  rec('F3 desk — back on and back to 7: flex bar and "Days since syllabus" return, reads the optional flex again', /Currency/.test(back.h3) && /flex/i.test(back.h3) && /Optional/.test(back.flexbar || '') && back.kv.some(k => /syllabus/i.test(k)), JSON.stringify(back), pic3)
})

/* ---- B1: delete one of his medical inputs on the Inputs page ---- */
await guard('B1', async () => {
  await dp.evaluate(() => window.go('inputs')); await dp.waitForTimeout(500)
  await dp.click('#inListBtn'); await dp.waitForTimeout(800)
  const row = dp.locator('tr', { hasText: 'Zenith' }).filter({ hasText: 'HL' }).locator('[data-testid=in-open]').first()
  await row.click(); await dp.waitForSelector('#inpEditDel'); await dp.waitForTimeout(300)
  await dp.click('#inpEditDel'); await dp.waitForTimeout(500)
  if (await exists(dp, '#inpEditDel')) { await dp.click('#inpEditDel'); await dp.waitForTimeout(500) }
  const left = await dp.evaluate(() => [...document.querySelectorAll('[data-testid=in-open]')].map(e => e.closest('tr') ? e.closest('tr').innerText.replace(/\s+/g, ' ') : ''))
  const picI = await shot(dp, 'B1a-inputs-after-delete-desktop')
  rec('B1 desk — his HL deleted on the Inputs page', !left.some(r => /Zenith/.test(r) && /\bHL\b/.test(r)), `Zenith rows left in list: ${left.filter(r => /Zenith/.test(r)).length}`, picI)
  await goTracker(dp); await dp.waitForSelector('#downDays')
  const num = await txt(dp, '#downDays .datebox-txt')
  await scrollInfo(dp)
  await dp.click('#downDays'); await dp.waitForSelector('#downLog'); await dp.waitForTimeout(300)
  const rows = await logRows(dp), tot = await txt(dp, '#downLogTotal')
  const pic = await shot(dp, 'B1b-tracker-window-after-delete-desktop')
  rec('B1 desk — the Tracker\'s number and window follow (expect ½ day, one row)', num === '½ day' && tot === '½ day' && rows.length === 1 && rows[0].chip === 'OML', `number=${num}; window total=${tot}; rows=${JSON.stringify(rows)}`, pic)
  await dp.keyboard.press('Escape'); await dp.waitForTimeout(250)
})

/* ---- B2: sign out and back in ---- */
await guard('B2', async () => {
  await dp.click('#logout'); await dp.waitForSelector('#luser'); await dp.waitForTimeout(300)
  await login(dp, 'ad', 'a'); await goTracker(dp)
  const who = await txt(dp, '.c-overall .who')
  if (!/ZENITH/i.test(who || '')) { await dp.evaluate(() => { const s = document.querySelector('#activeSel'); if (s) { const o = [...s.options].find(o => /ZENITH/i.test(o.textContent)); if (o) { s.value = o.value; s.dispatchEvent(new Event('change', { bubbles: true })) } } }); await dp.waitForTimeout(500) }
  const who2 = await txt(dp, '.c-overall .who'), cs = await txt(dp, '#courseStart .datebox-txt'), num = await txt(dp, '#downDays .datebox-txt')
  await scrollInfo(dp)
  const pic = await shot(dp, 'B2-after-sign-out-and-in-desktop')
  rec('B2 desk — sign out and back in: the course start is kept', /ZENITH/i.test(who2 || '') && !!cs && cs.includes(words(CS2)), `after sign-in: student=${who2}; course start=${cs}; down days=${num}`, pic)
})

/* ---- B3: export, then import in a clean browser ---- */
let exported = null
await guard('B3', async () => {
  await openFlex(dp); await dp.fill('[data-testid=trk-flex-from-1]', '9'); await dp.click('[data-testid=trk-flex-save]'); await flexGone(dp); await dp.waitForTimeout(300)
  await dp.evaluate(() => { window.__pickSaveForTests = async name => ({ name, createWritable: async () => ({ write: async t => { window.__exportedForTests = t }, close: async () => {} }) }) })
  await dp.click('#fileMenuBtn'); await dp.waitForTimeout(150); await dp.click('#exportBtn'); await dp.waitForSelector('#copyStudents'); await dp.waitForTimeout(300)
  await dp.check('#copyStudents'); await dp.click('#copyTickAll'); await dp.waitForTimeout(200); await dp.click('#copyOk'); await dp.waitForTimeout(1500)
  exported = await dp.evaluate(() => window.__exportedForTests || null)
  if (await exists(dp, '#dlgOk')) { await dp.click('#dlgOk'); await dp.waitForTimeout(300) }
  const hasCS = !!exported && exported.includes(CS2), hasFlex = !!exported && /"from"\s*:\s*\[\s*9\s*,/.test(exported)
  rec('B3 desk — Export (charts + students) written: carries the course start and the flex figures', hasCS && hasFlex, `file ${exported ? exported.length : 0} bytes; course start ${CS2} in file=${hasCS}; flex from [9,…] in file=${hasFlex}`)
  /* put the live figure back to 7 */
  await openFlex(dp); await dp.fill('[data-testid=trk-flex-from-1]', '7'); await dp.click('[data-testid=trk-flex-save]'); await flexGone(dp)
})
const importInto = async (p, text) => {
  await p.evaluate(t => { window.__pickOpenForTests = async () => ({ name: 'job7-walk.json', text: t }) }, text)
  await p.click('#fileMenuBtn'); await p.waitForTimeout(150); await p.click('#importFileBtn'); await p.waitForTimeout(1200)
  const said = []
  for (let i = 0; i < 40 && (await p.$('#dlgModal')); i++) {
    const t = ((await p.locator('#dlgModal').textContent()) || '').replace(/\s+/g, ' ').trim(); said.push(t.slice(0, 160))
    await p.click('#dlgOk'); await p.waitForTimeout(1200)
  }
  return said
}
const pickZenith = async p => { await p.evaluate(() => { const s = document.querySelector('#activeSel'); if (s) { const o = [...s.options].find(o => /ZENITH/i.test(o.textContent)); if (o) { s.value = o.value; s.dispatchEvent(new Event('change', { bubbles: true })) } } }); await p.waitForTimeout(600) }
await guard('B3b', async () => {
  if (!exported) throw new Error('no exported file to import')
  const C = await newPage(DESK, 'desk-fresh'); const cp = C.p
  await cp.goto('/'); await login(cp, 'ad', 'a'); await goTracker(cp)
  const flex0 = await cp.evaluate(() => 0)
  const said = await importInto(cp, exported)
  await pickZenith(cp)
  const who = await txt(cp, '.c-overall .who'), cs = await txt(cp, '#courseStart .datebox-txt')
  await openFlex(cp); const from1 = await cp.inputValue('[data-testid=trk-flex-from-1]'); const pic = await shot(cp, 'B3-after-import-clean-browser-desktop')
  rec('B3 desk — Import into a clean browser: the course start and the flex settings survive', /ZENITH/i.test(who || '') && !!cs && cs.includes(words(CS2)) && from1 === '9', `student=${who}; course start=${cs}; flex From(1) opens as ${from1} (exported as 9); import said (${said.length} boxes): ${said.map(x => x.slice(0, 90)).join(' || ')}`, pic)
  await C.ctx.close()
  /* D4 — the same file with the course start taken out: a man with none */
  const stripped = exported.replace(/"courseStart"\s*:\s*"[^"]*"/g, '"courseStart": null')
  const E = await newPage(DESK, 'desk-nostart'); const ep = E.p
  await ep.goto('/'); await login(ep, 'ad', 'a'); await goTracker(ep)
  await importInto(ep, stripped); await pickZenith(ep)
  const who2 = await txt(ep, '.c-overall .who'), cs2 = await txt(ep, '#courseStart .datebox-txt'), num = await txt(ep, '#downDays .datebox-txt'), warn = await txt(ep, '.c-curr .datewarn')
  await scrollInfo(ep)
  const pic2 = await shot(ep, 'D4-no-course-start-desktop')
  rec('D4 desk — a student with no course start: the number reads "—" with "Set the course start to count them."', /ZENITH/i.test(who2 || '') && num === '—' && warn === 'Set the course start to count them.', `student=${who2}; course start box=${(cs2 || '').replace(/\s+/g, ' ')}; number=${num}; line=${warn}`, pic2)
  /* and the typed-name demo student (not a man on the roster) */
  const a = await ep.evaluate(() => { const s = document.querySelector('#activeSel'); const o = s && [...s.options].find(o => /STUDENT A/i.test(o.textContent)); if (o) { s.value = o.value; s.dispatchEvent(new Event('change', { bubbles: true })) } return !!o })
  await ep.waitForTimeout(500)
  const numA = await txt(ep, '#downDays .datebox-txt'), warnA = await txt(ep, '.c-curr .datewarn')
  const picA = await shot(ep, 'D4b-typed-name-student-a-desktop')
  rec('D4 desk (extra) — the demo "STUDENT A" (a typed name, not on the roster), no course start', 'INFO', `number=${numA}; line under it=${warnA === null ? '(none)' : warnA}`, picA)
  await E.ctx.close()
})

/* ---- F4 member ---- */
await guard('F4', async () => {
  await dp.click('#logout'); await dp.waitForSelector('#luser'); await dp.waitForTimeout(300)
  await login(dp, 'us', 'us'); await goTracker(dp)
  const has = await exists(dp, '#flexBtn')
  await openFlex(dp)
  const w = await dp.evaluate(() => ({ ttl: document.querySelector('.tflex-ttl').innerText.replace(/\s+/g, ' '), save: !!document.querySelector('[data-testid=trk-flex-save]'), cancel: !!document.querySelector('[data-testid=trk-flex-cancel]'), inputs: document.querySelectorAll('[data-testid=trk-flex] input').length, from1Tag: document.querySelector('[data-testid=trk-flex-from-1]').tagName, onDisabled: document.querySelector('[data-testid=trk-flex-on]').getAttribute('aria-disabled'), from1: document.querySelector('[data-testid=trk-flex-from-1]').innerText }))
  const pic = await shot(dp, 'F4-flex-settings-member-desktop')
  rec('F4 desk — member: ⚙ opens the window read-only (no Save, figures not editable)', has && !w.save && w.inputs === 0 && w.from1Tag === 'SPAN' && w.onDisabled === 'true', JSON.stringify(w), pic)
  await dp.keyboard.press('Escape'); await dp.waitForTimeout(250)
  rec('F4 desk — Escape closes it, keyboard back on the ⚙', !(await exists(dp, '[data-testid=trk-flex]')) && (await active(dp)) === 'flexBtn', `closed=${!(await exists(dp, '[data-testid=trk-flex]'))}; activeElement=${await active(dp)}`)
})
await D.ctx.close()

/* =====================================================================  PHONE  */
const P = await newPage(PHONE, 'phone'); const pp = P.p
await pp.goto('/'); await login(pp, 'ad', 'a'); await goTracker(pp)
await guard('L1-phone', async () => {
  const bar = await barInfo(pp)
  const pic0 = await shot(pp, 'L1e-topbar-phone')
  rec('L1 phone — "Legend" is on the Tracker\'s top bar', !!bar.legend && bar.legend.w > 20 && bar.legend.x >= 0 && bar.legend.x + bar.legend.w <= 390, JSON.stringify(bar), pic0)
  await pp.tap('#legendBtn'); await pp.waitForSelector('[data-testid=trk-legend]'); await pp.waitForTimeout(300)
  const info = await pp.evaluate(() => { const l = document.querySelector('[data-testid=trk-legend]'); const r = l.getBoundingClientRect(); const body = l.querySelector('.tleg-body'); return { balls: l.querySelectorAll('.tleg-tile svg, .tleg-ballrow svg').length, flex: !!l.querySelector('[data-testid=trk-legend-flex]'), secs: [...l.querySelectorAll('.tleg-sec')].map(e => e.innerText.trim()), l: Math.round(r.left), r: Math.round(r.right), t: Math.round(r.top), b: Math.round(r.bottom), vw: innerWidth, vh: innerHeight, scrolls: body.scrollHeight > body.clientHeight + 1 } })
  const pic1 = await shot(pp, 'L1f-legend-open-phone')
  rec('L1 phone — a tap opens the pop-out within the screen: balls, currency, flex', info.balls >= 14 && info.flex && info.l >= 0 && info.r <= info.vw && info.b <= info.vh && info.secs.some(s => /Currency/i.test(s)), JSON.stringify(info), pic1)
  await pp.keyboard.press('Escape'); await pp.waitForTimeout(250)
  const g1 = await closedLegend(pp), a1 = await active(pp)
  rec('L1 phone — Escape closes, keyboard back on the button', g1 && a1 === 'legendBtn', `closed=${g1}; activeElement=${a1}`)
  await pp.tap('#legendBtn'); await pp.waitForSelector('[data-testid=trk-legend]'); await pp.waitForTimeout(200)
  await pp.touchscreen.tap(370, 800); await pp.waitForTimeout(350)
  const g2 = await closedLegend(pp)
  const pic2 = await shot(pp, 'L1g-after-tap-outside-phone')
  rec('L1 phone — a tap outside closes it', g2, `closed=${g2}`, pic2)
})
await guard('F-phone', async () => {
  await pp.tap('#flexBtn'); await pp.waitForSelector('[data-testid=trk-flex]'); await pp.waitForTimeout(300)
  const r = await inView(pp, '[data-testid=trk-flex]'); const pic = await shot(pp, 'F1d-flex-settings-admin-phone')
  rec('F1 phone (extra) — the ⚙ window fits the screen', !!r && r.fits, JSON.stringify(r), pic)
  await pp.tap('[data-testid=trk-flex-cancel]'); await flexGone(pp)
})
let phoneOK = false
await guard('D1-phone', async () => {
  const r = await addZenith(pp, true, CS1, 'phone')
  const who = await txt(pp, '.c-overall .who'), cs = await txt(pp, '#courseStart .datebox-txt')
  const g = await inView(pp, '#dlgModal')
  phoneOK = r.closed && /ZENITH/i.test(who || '') && !!cs && cs.includes(words(CS1))
  rec('D1 phone — add box: Course start above the list, today by default; he is added with the picked course start', !!r.box && r.box.label === 'Course start' && r.box.dateTop < r.box.listTop && r.box.text.includes(words(TODAY)) && phoneOK, `box=${JSON.stringify(r.box)}; after add: ${who}; course start=${cs}`, r.picA)
  await pickDay(pp, '#lastSyll', SYLL); await pickDay(pp, '#lastCurr', CURR)
  await pp.evaluate(() => document.activeElement && document.activeElement.blur())
  await pp.evaluate(() => window.go('inputs')); await pp.waitForTimeout(500)
  await fileMedical(pp); await pp.waitForTimeout(300)
  await goTracker(pp); await tab(pp, 'info'); await pp.waitForSelector('#downDays')
})
await guard('D6', async () => {
  const num = await txt(pp, '#downDays .datebox-txt')
  await scrollInfo(pp)
  const pic0 = await shot(pp, 'D6a-info-down-days-phone')
  rec('D6 phone — Info panel shows the total (expect 6½ days)', num === '6½ days', `reads: ${num}`, pic0)
  await pp.tap('#downDays'); await pp.waitForSelector('#downLog'); await pp.waitForTimeout(350)
  const rows = await logRows(pp), tot = await txt(pp, '#downLogTotal'), geo = await inView(pp, '#downLog')
  const clip = await pp.evaluate(() => [...document.querySelectorAll('#downLog .chip, #downLog .dd-when, #downLog .dd-days, #downLog .mini, #downLog .failtot, #downLog .lullhd b')].map(e => { const cs = getComputedStyle(e); return { t: e.innerText.trim().slice(0, 24), cut: e.scrollWidth > e.clientWidth + 1 && cs.overflow !== 'visible', ell: cs.textOverflow === 'ellipsis' && e.scrollWidth > e.clientWidth + 1, over: e.getBoundingClientRect().right > innerWidth } }).filter(x => x.cut || x.ell || x.over))
  const pic = await shot(pp, 'D6b-down-days-window-phone')
  rec('D6 phone — the window fits the screen, words whole', !!geo && geo.fits && clip.length === 0 && rows.length === 3 && tot === '6½ days', `window=${JSON.stringify(geo)}; rows=${rows.length}; total=${tot}; clipped/overflowing=${JSON.stringify(clip)}`, pic)
  await pp.keyboard.press('Escape'); await pp.waitForTimeout(300)
  rec('D6 phone — Escape closes, keyboard back on the number', !(await exists(pp, '#downLog')) && (await active(pp)) === 'downDays', `activeElement=${await active(pp)}`)
})
await P.ctx.close()
await b.close()

/* ---------- the report ---------- */
writeFileSync(join(out, 'results.json'), JSON.stringify({ today: TODAY, results, problems }, null, 1))
console.log('\n=== TABLE ===')
for (const r of results) console.log(`${String(r.pass).padEnd(10)} | ${r.id} | ${r.seen.slice(0, 160)} | ${r.pic}`)
console.log('\nPASS', results.filter(r => r.pass === true).length, 'FAIL', results.filter(r => r.pass === false).length, 'NOT WALKED', results.filter(r => r.pass === 'NOT WALKED').length)
console.log('PROBLEMS', problems.length); for (const x of [...new Set(problems)]) console.log('  ', x)
