// The night of 7–8 Nov 26, job 2 — React Doctor's findings on the shell, the state and the windows: THE WALK BY PRESSES.
// rss1108-same.mjs proves every touched screen LOOKS the same; this proves the same presses DO the same, on the build
// before and the build after, and writes what each did (a window closed or not, where the keys went, the words a note
// said, what the changes window and the bell list, what a reload kept, the export's file) into one record per build,
// then compares the two. Pictures of the hard surfaces (the medical-clash and upchit sheets, the document viewer, the
// Help form after a label press, the round's result after a reload) on the build after.
//   W1 every window that took a quiet shade or a named ✕ — closed by Escape, by its ✕ and by a press outside, desktop and
//      phone (lessons 4, 12, 19: a press behind an open window, a window from one page only, a window over a window).
//   W2 Help — a press on each label puts the keys in its field (the one new gesture), then a report sent and listed.
//   W3 the plain-user round (D1557) on the browser's own store: a plan duplicated, an input filed with its OIL answer,
//      Undo, Redo, the changes window, the bell, a reload that keeps both, the export's file.
//   W4 the medical-clash sheet, the upchit sheet and the document viewer, reached by filing as a person does.
// Usage, from raptor-port/:  node scripts/handpass/rss1108-walk.mjs <before dist> <after dist> [out folder] [only parts, e.g. w3]
import { chromium, webkit, LAUNCH, serveDist } from '../drawcheck/lib.mjs'
import { mkdirSync, writeFileSync } from 'node:fs'
import path from 'node:path'
console.log('[rss1108-walk v5]')
const [before, after, out = 'docs/img/handpass/2026-11-08-rd-shell-state/walk', onlyArg = ''] = process.argv.slice(2)
const ONLY = onlyArg.split(',').filter(Boolean), run = part => !ONLY.length || ONLY.includes(part)
mkdirSync(out, { recursive: true })
const ORIGIN = 'http://localhost:4394'
const NOW = new Date('2026-07-14T09:30:00+08:00')
const QUIET = '*{scroll-behavior:auto !important} *,*::before,*::after{transition:none !important;animation:none !important;caret-color:transparent !important}'
const NL = String.fromCharCode(10)
const V = sel => `${sel} >> visible=true`
const firstLine = e => String(e && e.message || e).split(NL)[0]
const press = async (p, sel) => { try { await p.locator(V(sel)).first().click({ timeout: 6000 }) } catch (e) { throw new Error(`pressing ${sel}: ${firstLine(e)}`) } await p.clock.runFor(450) }
const phoneOf = p => p.viewportSize().width < 600
async function tab(p, page) {
  if (phoneOf(p)) { await press(p, '#burger'); await press(p, `#drawerNav a[data-page="${page}"]`) }
  else await press(p, `#topnav a[data-page="${page}"]`)
  await p.clock.runFor(900)
}
async function insights(p) {
  if (await p.locator(V('#insightBtn')).count()) await press(p, '#insightBtn')
  else { await press(p, '#page-editsched .schedule-more'); await press(p, '#editSchedMoreInsights') }
}
async function signIn(p, user = 'ad', pass = 'a') {
  await p.fill('#luser', user); await p.fill('#lpass', pass); await p.click('#loginForm button[type=submit]')
  await p.waitForSelector('#vWeek .day', { state: 'attached', timeout: 20000 }); await p.clock.runFor(1500)
  await p.addStyleTag({ content: QUIET }).catch(() => {})
}
async function world(br, dist, { phone = false, q = '?fresh=1' } = {}) {
  const ctx = await br.newContext(phone ? { viewport: { width: 402, height: 874 }, deviceScaleFactor: 3, hasTouch: true } : { viewport: { width: 1536, height: 864 }, deviceScaleFactor: 1.25, acceptDownloads: true })
  await serveDist(ctx, ORIGIN, dist)
  const p = await ctx.newPage()
  const errs = []; p.on('pageerror', e => errs.push(firstLine(e)))
  await p.clock.install({ time: NOW }); await p.clock.pauseAt(new Date(NOW.getTime() + 5000))
  await p.goto(ORIGIN + '/' + q)
  await p.addStyleTag({ content: QUIET }).catch(() => {})
  await signIn(p)
  return { ctx, p, errs }
}
/* what the passing note says now ('' when none) */
const note = p => p.evaluate(() => { const t = document.getElementById('toastEl'); return t && +getComputedStyle(t).opacity > 0.5 ? (t.textContent || '').trim() : '' })
/* is the window open: drawn, not hidden, taking room */
const isOpen = (p, sel) => p.evaluate(s => { const n = document.querySelector(s); if (!n || n.hidden) return false; const r = n.getBoundingClientRect(); return r.width > 0 && r.height > 0 && getComputedStyle(n).visibility !== 'hidden' && getComputedStyle(n).display !== 'none' }, sel)
/* a point outside the window's box that lands on nothing that does anything of its own: on the window's own shade if it has
   one, else on a plain part of the page */
const outsidePoint = (p, sel) => p.evaluate(s => {
  const root = document.querySelector(s), box = root.firstElementChild
  const inBox = el => !!el && (box ? box.contains(el) : root.contains(el))
  const busy = el => !el || !!el.closest('button,a,input,select,textarea,label,[role=button],[role=dialog],[data-slot],[data-fill],.puck,.dow,.dinfobtn,[tabindex],[onclick],.topbar,#topnav,.wkbar,.wknav')
  for (let y = innerHeight - 6; y > 60; y -= 37) for (let x = 6; x < innerWidth; x += 53) {
    const el = document.elementFromPoint(x, y)
    if (!el || inBox(el)) continue
    if (el === root) return { x, y, on: 'shade' }
  }
  for (let y = innerHeight - 6; y > 60; y -= 37) for (let x = 6; x < innerWidth; x += 53) {
    const el = document.elementFromPoint(x, y)
    if (!el || inBox(el) || root.contains(el) || busy(el)) continue
    return { x, y, on: el.tagName.toLowerCase() + (el.id ? '#' + el.id : '') + (el.className && typeof el.className === 'string' ? '.' + el.className.trim().split(/\s+/).join('.') : '') }
  }
  return null
}, sel)

/* W1 — the windows, each opened as a person opens it, closed three ways */
const WINDOWS = [
  { name: 'day details', sel: '#dayPop', x: '#dayPopClose', open: async p => { await press(p, '.dinfobtn[data-dayinfo="0"]') } },
  { name: 'Traffic', sel: '#airpop', x: '#airClose', open: async p => { await tab(p, 'editsched'); await press(p, '#eWeek .airbtn[data-air]') } },
  { name: 'Insights', sel: '#insightModal', x: '#insightClose', open: async p => { await tab(p, 'editsched'); await insights(p) } },
  { name: 'Day templates', sel: '#daytplModal', x: '#daytplClose', open: async p => { await tab(p, 'editsched'); await press(p, '#eWeek [data-daytplopen="0"]'); await press(p, 'text=Manage templates') } },
  { name: 'Plans', sel: '#draftsModal', x: '#draftsClose', open: async p => { await tab(p, 'editsched'); await press(p, '#eWeek [data-planmenu="0"]'); await press(p, '[data-plandup]'); await press(p, '#eWeek [data-planmenu="0"]'); await press(p, '[data-planmanage]') } },
  { name: 'Jump to a date', sel: '#weekCal', x: '#weekCal .x', open: async p => { await tab(p, 'editsched'); await press(p, '#page-editsched .wk-cal, #page-editsched .filt-cal, .wknav-mbtn.filt-cal') } },
  { name: 'side menu', sel: '#drawer.open', x: null, phoneOnly: true, open: async p => { await press(p, '#burger') } },
]
async function w1(br, dist, phone) {
  const res = {}
  for (const w of WINDOWS) {
    if (w.phoneOnly && !phone) continue
    for (const way of ['Escape', 'x', 'outside']) {
      if (way === 'x' && !w.x) continue
      const { ctx, p, errs } = await world(br, dist, { phone })
      let r
      try {
        await w.open(p)
        const was = await isOpen(p, w.sel)
        let how = way
        if (way === 'Escape') { await p.keyboard.press('Escape'); await p.clock.runFor(500) }
        else if (way === 'x') await press(p, w.x)
        else { const pt = await outsidePoint(p, w.sel); how = pt ? `outside on ${pt.on}` : 'no plain place outside'; if (pt) { if (phone) await p.touchscreen.tap(pt.x, pt.y); else await p.mouse.click(pt.x, pt.y); await p.clock.runFor(500) } }
        r = { opened: was, closed: was && !(await isOpen(p, w.sel)), how, errors: errs.slice(0, 2) }
      } catch (e) { r = { error: firstLine(e) } }
      res[`${w.name} · ${way}`] = r
      await ctx.close()
    }
  }
  return res
}

/* W2 — Help: the labels, then a report */
async function w2(br, dist, tag) {
  const { ctx, p, errs } = await world(br, dist)
  const res = {}
  try {
    await tab(p, 'help')
    const focus = () => p.evaluate(() => document.activeElement && document.activeElement.id || document.activeElement && document.activeElement.tagName)
    await p.locator('label[for="bugCat"], #bugFile .mfield:has(#bugCat) > label').first().click(); await p.clock.runFor(200)
    res.afterCategoryLabel = await focus()
    await p.locator('label[for="bugText"], #bugFile .mfield:has(#bugText) > label').first().click(); await p.clock.runFor(200)
    res.afterWhatHappenedLabel = await focus()
    await p.screenshot({ path: path.join(out, `${tag}-help-label.png`) })
    const cats = await p.locator('#bugCat option').allInnerTexts()
    await p.selectOption('#bugCat', { index: Math.min(1, cats.length - 1) })
    await p.fill('#bugText', 'The walk of 8 Nov 26: a report sent from Help.')
    await press(p, '#bugSend'); await p.clock.runFor(300)
    res.sendNote = await note(p)
    res.listed = (await p.locator('#bugList, #bugMine').first().innerText().catch(() => '')).replace(/\s+/g, ' ').slice(0, 400)
    await p.screenshot({ path: path.join(out, `${tag}-help-sent.png`) })
  } catch (e) { res.error = firstLine(e) }
  res.errors = errs.slice(0, 3)
  await ctx.close()
  return res
}

/* W3 — the plain-user round, on the browser's own store so a reload keeps what was saved */
async function w3(br, dist, tag) {
  const { ctx, p, errs } = await world(br, dist, { q: '' })
  const res = {}
  const undoTitle = () => p.locator('#undoBtn').first().getAttribute('title').catch(() => null)
  const redoTitle = () => p.locator('#redoBtn').first().getAttribute('title').catch(() => null)
  try {
    await tab(p, 'editsched')
    await press(p, '#eWeek [data-planmenu="0"]'); await press(p, '[data-plandup]'); await p.clock.runFor(300)
    res.planNote = await note(p)
    res.planLabel = (await p.locator('#eWeek [data-planmenu="0"]').first().innerText().catch(() => '')).trim()
    await p.clock.runFor(4000)
    /* an input filed on the Inputs calendar, its OIL question answered */
    await tab(p, 'inputs')
    if (await p.locator(V('#inCalBtn')).count()) await press(p, '#inCalBtn')
    await p.locator('#inpCal [data-icday="2026-07-18"]').first().click({ position: { x: 8, y: 8 }, timeout: 6000 }); await p.clock.runFor(500)
    await press(p, '#icPopAdd'); await p.selectOption('#inpEditType', 'Duty'); await p.clock.runFor(300); await press(p, '#inpEditSave')
    res.oilQuestion = (await p.locator('[data-testid="oilconf"]').first().innerText().catch(() => '')).replace(/\s+/g, ' ').slice(0, 300)
    const yes = p.locator('[data-testid="oilconf"] button').filter({ hasText: /^Yes/ }).first()
    res.oilAnswer = (await yes.innerText().catch(() => '')).trim()
    await yes.click(); await p.clock.runFor(300)
    res.oilSave = (await p.locator('[data-testid="oilconf-save"]').first().innerText().catch(() => '')).trim()
    await press(p, '[data-testid="oilconf-save"]'); await p.clock.runFor(300)
    res.inputNote = await note(p)
    await p.clock.runFor(4000)
    /* the Inputs day's window closed, as he would, so the top bar is his again (an input's windows keep it covered, D1645) */
    for (const x of ['[data-testid="win-inputedit-x"]', '[data-testid="win-inputsday-x"]']) if (await p.locator(V(x)).count()) await press(p, x)
    res.windowsLeft = await p.evaluate(() => [...document.querySelectorAll('[data-testid^="win-"]')].filter(n => n.offsetParent).map(n => n.getAttribute('data-testid')))
    res.undoTitle1 = await undoTitle()
    await press(p, '#undoBtn'); res.undoNote = await note(p); res.redoTitle1 = await redoTitle(); await p.clock.runFor(4000)
    await press(p, '#redoBtn'); res.redoNote = await note(p); res.undoTitle2 = await undoTitle(); await p.clock.runFor(4000)
    /* what the changes window and the bell say */
    await tab(p, 'editsched')
    await press(p, '#histBtn'); await p.clock.runFor(400)
    /* the whole week's changes, as the window lists them — all of them, not only those new to him (his own are not) */
    { const all = p.locator(V('button')).filter({ hasText: /^All changes/ }); if (await all.count()) { await all.first().click(); await p.clock.runFor(300) } }
    if (await p.locator(V('.cw-day')).filter({ hasText: 'Week' }).count()) { await p.locator(V('.cw-day')).filter({ hasText: 'Week' }).first().click(); await p.clock.runFor(300) }
    res.changes = (await p.evaluate(() => { const d = document.querySelector('.cw-day'); let n = d; for (let i = 0; i < 8 && n && !(n.getAttribute('role') === 'dialog' || /win/.test(String(n.className))); i++) n = n.parentElement; return n ? n.innerText : '' })).replace(/\s+/g, ' ').slice(0, 900)
    await p.screenshot({ path: path.join(out, `${tag}-round-changes.png`) })
    await press(p, '#histBtn')
    await press(p, '#notifyBell'); await p.clock.runFor(400)
    res.bell = (await p.evaluate(() => [...document.querySelectorAll('[data-testid^="bell"], [class*="bell-"]')].filter(n => n.offsetParent).map(n => n.innerText.trim()).filter(Boolean).join(' | '))).replace(/\s+/g, ' ').slice(0, 900)
    await p.keyboard.press('Escape'); await p.clock.runFor(300)
    /* the export's file */
    const dl = p.waitForEvent('download', { timeout: 8000 }).catch(() => null)
    await press(p, '#exportSched')
    const d = await dl
    res.export = d ? { name: d.suggestedFilename(), bytes: (await d.createReadStream().then(s => new Promise(r => { let n = 0; s.on('data', c => { n += c.length }); s.on('end', () => r(n)) }))) } : 'no file'
    /* a reload: signed in again, both kept */
    await p.clock.runFor(6000)
    await p.reload(); await p.addStyleTag({ content: QUIET }).catch(() => {})
    await signIn(p)
    await tab(p, 'editsched')
    res.planLabelAfterReload = (await p.locator('#eWeek [data-planmenu="0"]').first().innerText().catch(() => '')).trim()
    await p.screenshot({ path: path.join(out, `${tag}-round-reloaded-edit.png`) })
    await tab(p, 'inputs')
    if (await p.locator(V('#inCalBtn')).count()) await press(p, '#inCalBtn')
    await p.locator('#inpCal [data-icday="2026-07-18"]').first().click({ position: { x: 8, y: 8 }, timeout: 6000 }); await p.clock.runFor(500)
    res.dayAfterReload = (await p.locator('[data-testid="win-inputsday"], #icPop').first().innerText().catch(() => '')).replace(/\s+/g, ' ').slice(0, 400)
    await p.screenshot({ path: path.join(out, `${tag}-round-reloaded-inputs.png`) })
  } catch (e) { res.error = firstLine(e) }
  res.errors = errs.slice(0, 3)
  await ctx.close()
  return res
}

/* W4 — the medical-clash sheet, the upchit sheet and the document viewer */
const PDF = word => Buffer.from(`%PDF-1.4${NL}1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj${NL}2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj${NL}3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 300 400]>>endobj${NL}% ${word}${NL}trailer<</Root 1 0 R>>${NL}%%EOF`)
async function toMonth(p, y, m) {
  const MONTHS = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december']
  for (let i = 0; i < 40; i++) {
    const [name, year] = (await p.locator('#inpCal .ic-mon').innerText()).trim().toLowerCase().split(/\s+/)
    const d = y * 12 + (m - 1) - (+year * 12 + MONTHS.findIndex(x => x.startsWith(name)))
    if (!d) return
    await press(p, d > 0 ? '#icNext' : '#icPrev')
  }
  throw new Error('the calendar never reached the month asked for')
}
async function w4(br, dist, tag) {
  const { ctx, p, errs } = await world(br, dist)
  const res = {}
  const closeAll = async () => {
    for (const s of ['[data-testid="win-inputedit-x"]', '[data-testid="inped-swap-go"], [data-testid="inped-leave-go"], [data-testid="inped-escask-go"]', '[data-testid="win-inputsday-x"]'])
      if (await p.locator(V(s)).count()) { await p.locator(V(s)).first().click(); await p.clock.runFor(300) }
  }
  try {
    await tab(p, 'inputs')
    if (await p.locator(V('#inCalBtn')).count()) await press(p, '#inCalBtn')
    await toMonth(p, 2026, 10)
    const who = await p.evaluate(() => { const P = window.PEOPLE; return Object.keys(P).filter(id => !P[id].san && !P[id].archived && !P[id].deleted && !P[id].special && !P[id].pers)[5] })
    /* what already stands on file (the setting of the scene, as the browser test does): ATT C on 13–15 Oct */
    await p.evaluate(who => window.fileInput({ iid: 'w4-c', person: who, type: 'ATT C', date: 'Oct 13', endDate: 'Oct 15', yr: 2026, allday: true }), who)
    const fileMed = async (type, from) => {
      await p.locator(`#inpCal [data-icday="${from}"]`).first().click({ position: { x: 8, y: 8 } }); await p.clock.runFor(400)
      await press(p, '#icPopAdd'); await p.selectOption('#inpEditPop #inpEditType', type); await p.selectOption('#inpEditPop #inpEditPerson', who); await p.clock.runFor(200)
      await press(p, '#inpEditSave')
      if (await p.locator(V('[data-testid="docconf-nodoc"]')).count()) { res[`${type} docconf`] = (await p.locator('[data-testid="docconf"]').first().innerText()).replace(/\s+/g, ' ').slice(0, 200); await press(p, '[data-testid="docconf-nodoc"]') }
    }
    /* the medical clash: ATT B on the 14th, inside the ATT C */
    await fileMed('ATT B', '2026-10-14')
    res.medclashOpen = await isOpen(p, '[data-testid="medclash"]')
    res.medclash = (await p.locator('[data-testid="medclash"]').first().innerText().catch(() => '')).replace(/\s+/g, ' ').slice(0, 300)
    await p.screenshot({ path: path.join(out, `${tag}-medclash.png`) })
    await press(p, '[data-testid="medclash"] .x'); res.medclashClosedByX = !(await isOpen(p, '[data-testid="medclash"]'))
    await closeAll()
    /* the upchit: an ATT B on 17–18 Oct on file, an upchit filed on the 14th */
    await p.evaluate(who => window.fileInput({ iid: 'w4-b', person: who, type: 'ATT B', date: 'Oct 17', endDate: 'Oct 18', yr: 2026, allday: true }), who)
    await fileMed('Upchit', '2026-10-14')
    res.upconfOpen = await isOpen(p, '[data-testid="upconf"]')
    res.upconf = (await p.locator('[data-testid="upconf"]').first().innerText().catch(() => '')).replace(/\s+/g, ' ').slice(0, 300)
    await p.screenshot({ path: path.join(out, `${tag}-upconf.png`) })
    await press(p, '[data-testid="upconf"] .x'); res.upconfClosedByX = !(await isOpen(p, '[data-testid="upconf"]'))
    await closeAll()
    /* the document viewer: an ATT C filed with a certificate, opened from its clip on the list */
    await press(p, '#inListBtn'); await press(p, '#inRangeBtn'); await press(p, '#inRangeAll')
    await press(p, '#inNew'); await p.selectOption('#inpEditType', 'ATT C'); await p.locator('#inpEdCal [data-iso]').nth(14).click(); await p.clock.runFor(200)
    await p.locator('[data-testid="win-inputedit"] .docfield input[type=file]').first().setInputFiles([{ name: 'cert-one.pdf', mimeType: 'application/pdf', buffer: PDF('one') }])
    await p.clock.runFor(400)
    await press(p, '#inpEditSave')
    if (await p.locator(V('[data-testid="medclash"]')).count()) await press(p, '[data-testid="medclash"] .airpop-foot .abtn.ghost')
    await press(p, '#inBody .rclip')
    res.viewerOpen = await isOpen(p, '#docViewPop')
    res.viewer = (await p.locator('#docViewPop').first().innerText().catch(() => '')).replace(/\s+/g, ' ').slice(0, 200)
    await p.screenshot({ path: path.join(out, `${tag}-docviewer.png`) })
    await p.keyboard.press('Escape'); await p.clock.runFor(400); res.viewerClosedByEscape = !(await isOpen(p, '#docViewPop'))
    if (res.viewerClosedByEscape) { await press(p, '#inBody .rclip'); await press(p, '#docViewClose'); res.viewerClosedByX = !(await isOpen(p, '#docViewPop')) }
    if (res.viewerClosedByX) {
      await press(p, '#inBody .rclip'); const pt = await outsidePoint(p, '#docViewPop')
      res.viewerOutside = pt ? pt.on : 'no plain place outside'
      if (pt) { await p.mouse.click(pt.x, pt.y); await p.clock.runFor(400); res.viewerClosedOutside = !(await isOpen(p, '#docViewPop')) }
    }
  } catch (e) { res.error = firstLine(e) }
  res.errors = errs.slice(0, 3)
  await ctx.close()
  return res
}

async function walk(dist, tag) {
  const rec = {}
  const cr = await chromium.launch(LAUNCH)
  if (run('w1')) rec.w1desk = await w1(cr, dist, false)
  if (run('w2')) rec.w2 = await w2(cr, dist, tag)
  if (run('w3')) rec.w3 = await w3(cr, dist, tag)
  if (run('w4')) rec.w4 = await w4(cr, dist, tag)
  await cr.close()
  if (run('w1')) { const wk = await webkit.launch(); rec.w1phone = await w1(wk, dist, true); await wk.close() }
  return rec
}
const A = await walk(before, 'before'), B = await walk(after, 'after')
writeFileSync(path.join(out, ONLY.length ? `record-${ONLY.join('-')}.json` : 'record.json'), JSON.stringify({ before: A, after: B }, null, 1))
/* the comparison: every value the same, but the one gesture added on purpose (W2's two label presses) */
const EXPECTED = new Set(['w2.afterCategoryLabel', 'w2.afterWhatHappenedLabel'])
let same = 0, differ = 0
const walkKeys = (a, b, at) => {
  for (const k of new Set([...Object.keys(a || {}), ...Object.keys(b || {})])) {
    const x = a?.[k], y = b?.[k], here = at ? `${at}.${k}` : k
    if (x && typeof x === 'object' && !Array.isArray(x) && y && typeof y === 'object' && !Array.isArray(y)) { walkKeys(x, y, here); continue }
    const eq = JSON.stringify(x) === JSON.stringify(y)
    if (eq) same++; else differ++
    if (!eq || EXPECTED.has(here)) console.log(`${eq ? 'SAME ' : EXPECTED.has(here) ? 'MEANT' : 'DIFF '} ${here}: ${JSON.stringify(x)} → ${JSON.stringify(y)}`)
  }
}
walkKeys(A, B, '')
for (const [k, v] of Object.entries(B.w1desk || {})) console.log(`after desk  ${k}: ${JSON.stringify(v)}`)
for (const [k, v] of Object.entries(B.w1phone || {})) console.log(`after phone ${k}: ${JSON.stringify(v)}`)
for (const w of ['w2', 'w3', 'w4']) if (B[w]) console.log(`after ${w}: ${JSON.stringify(B[w])}`)
console.log(`${same} values the same, ${differ} differ`)
