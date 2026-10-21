/* [UI-CONSISTENCY-LOOK] round 2 built (D1129–D1132) — the walk, written as assertions of the RIGHT behaviour (a PASS means
   correct), so running it again on a fixed build IS the re-walk (bug-check order §5). Each changed control is SEEN and
   PRESSED on its own surface: Quals' two edit buttons (desktop, phone); the Scheduler Board's Undo / Redo / History / sync
   at 1366, 1536 (his PC), 1599 and 1600 (the two edges of D1126's band) and 1920, against the top bar at the same width;
   the board's highlighter mark and the hidden toggle (desktop), the toggle's fold (phone); the Tracker's line icons
   (desktop), its bar hidden and shown, its File menu and ⓘ, and its joined view tabs (1050 and a phone).
   Run: HP_URL=http://localhost:<port> HP_SHOTS=<folder> node scripts/handpass/cr2-walk.mjs → <folder>/walk/ */
import { existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { chromium } from '@playwright/test'
const { BASE, SHOTS, login, go } = await import('./lib.mjs')
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const OUT = SHOTS + '/' + (process.env.CR2_WALK_DIR || 'walk')
rmSync(OUT, { recursive: true, force: true }); mkdirSync(OUT, { recursive: true })
const browser = await chromium.launch({ headless: true, ...(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {}) })
const sleep = ms => new Promise(r => setTimeout(r, ms))
const results = []; const errors = []
const ok = (name, pass, detail = '') => { results.push({ name, pass: !!pass, detail }); console.log((pass ? 'PASS ' : 'FAIL ') + name + (detail ? ' — ' + detail : '')) }
let n = 0
const shot = async (page, name) => { await page.screenshot({ path: `${OUT}/${String(++n).padStart(2, '0')}-${name}.png` }) }
async function world(vp, touch) {
  const ctx = await browser.newContext({ viewport: vp, deviceScaleFactor: 1, ...(touch ? { isMobile: true, hasTouch: true } : {}) })
  await ctx.clock.install({ time: new Date('2026-07-13T09:00:00') })
  const page = await ctx.newPage()
  page.on('pageerror', e => errors.push(`${vp.width}: page error ${e.message}`))
  page.on('console', m => { if (m.type() === 'error') errors.push(`${vp.width}: console ${m.text()}`) })
  page.on('response', r => { if (r.status() >= 400) errors.push(`${vp.width}: ${r.status()} ${r.url()}`) })
  await page.goto(BASE + '/'); await login(page, 'a')
  return { ctx, page }
}
/* what a person sees: a box with a width and height, not display:none, not visibility:hidden */
const seen = (page, sel) => page.evaluate(sel => {
  const e = document.querySelector(sel); if (!e) return null
  const r = e.getBoundingClientRect(), cs = getComputedStyle(e)
  return { shown: r.width > 0 && r.height > 0 && cs.visibility !== 'hidden', w: Math.round(r.width), h: Math.round(r.height), x: Math.round(r.left), y: Math.round(r.top), bg: cs.backgroundColor, cls: e.className, title: e.getAttribute('title') || '' }
}, sel)
const press = async (page, sel, touch) => { const l = page.locator(sel).first(); if (touch) await l.tap(); else await l.click(); await sleep(400) }
async function openBoard(page) {
  await go(page, 'editsched'); await sleep(300)
  await page.locator('#eWeek [data-sbday="0"]:visible').first().click(); await page.waitForSelector('#schedBoard'); await sleep(500)
}
const closeBoard = page => page.evaluate(() => document.querySelector('#sbDone')?.click()).then(() => sleep(400))

/* ================= Quals — D1129 ================= */
for (const [vp, touch, tag] of [[{ width: 1536, height: 864 }, false, 'pc'], [{ width: 402, height: 874 }, true, 'phone']]) {
  const { ctx, page } = await world(vp, touch)
  await go(page, 'quals'); await sleep(400)
  await press(page, '#qEdit', touch)
  const done = await seen(page, '#qSave'), eq = await seen(page, '#qEditQuals'), ex = await seen(page, '#qExport')
  ok(`${tag} Quals: while editing, Done and Edit quals both shown`, done?.shown && eq?.shown)
  ok(`${tag} Quals: Done is the bright blue, Edit quals is not`, done.bg !== eq.bg && /primary/.test(done.cls) && !/primary/.test(eq.cls), `Done ${done.bg} · Edit quals ${eq.bg}`)
  ok(`${tag} Quals: Edit quals is the plain grey of Export beside it`, eq.bg === ex.bg, `${eq.bg} / ${ex.bg}`)
  await shot(page, `${tag}-quals-editing`)
  await press(page, '#qEditQuals', touch)
  const eq2 = await seen(page, '#qEditQuals')
  const txt = await page.locator('#qEditQuals').textContent()
  const pressed = await page.locator('#qEditQuals').getAttribute('aria-pressed')
  ok(`${tag} Quals: pressed, it reads "✕ Edit quals", still plain, and the mode is on`, txt === '✕ Edit quals' && eq2.bg === ex.bg && pressed === 'true', `"${txt}" ${eq2.bg} pressed=${pressed}`)
  await shot(page, `${tag}-quals-inside`)
  await press(page, '#qEditQuals', touch)
  ok(`${tag} Quals: pressed again, the mode is off and the button still plain`, (await page.locator('#qEditQuals').getAttribute('aria-pressed')) === 'false' && (await seen(page, '#qEditQuals')).bg === ex.bg)
  await press(page, '#qSave', touch)
  ok(`${tag} Quals: Done ends editing`, (await seen(page, '#qEdit'))?.shown && !(await seen(page, '#qSave'))?.shown)
  await ctx.close()
}

/* ================= The Scheduler Board's bar — D1130 ================= */
for (const w of [1366, 1536, 1599, 1600, 1920]) {
  const { ctx, page } = await world({ width: w, height: 864 }, false)
  await go(page, 'editsched'); await sleep(300)
  const topWords = (await seen(page, '#undoBtn .bl'))?.shown
  const topSync = (await seen(page, '#fastSync .synclbl'))?.shown
  await openBoard(page)
  const compact = w <= 1599
  for (const id of ['sbUndo', 'sbRedo', 'sbHist']) {
    const b = await seen(page, '#' + id), bl = await seen(page, `#${id} .bl`)
    ok(`${w} board ${id}: ${compact ? 'its icon only, 34 wide' : 'its word back'}, its name on hover`,
      b?.shown && (compact ? (!bl?.shown && b.w <= 36) : bl?.shown) && b.title.length > 0, `w=${b?.w} word=${bl?.shown} title="${b?.title.slice(0, 30)}"`)
  }
  /* the blind read's two (21 Oct 26): each still says what it is where only its icon shows */
  const names = await page.evaluate(() => ['#sbUndo', '#sbRedo', '#undoBtn', '#redoBtn'].map(s => document.querySelector(s)?.getAttribute('aria-label')))
  const syncP = await page.evaluate(() => ['#sbSync', '#fastSync'].map(s => document.querySelector(s)?.getAttribute('aria-pressed')))
  ok(`${w} board and top bar: Undo / Redo named for a screen reader, the sync dot says on or off`, names.join() === 'Undo,Redo,Undo,Redo' && syncP.every(p => p === 'true' || p === 'false'), `${names.join()} · ${syncP.join()}`)
  const sl = await seen(page, '#sbSync .synclbl')
  ok(`${w} board sync: ${compact ? 'its dot alone' : 'its words back'}`, compact ? !sl?.shown : sl?.shown)
  ok(`${w} board and top bar agree: Undo's word ${compact ? 'hidden' : 'shown'} on both, sync the same`,
    !!topWords === !!(await seen(page, '#sbUndo .bl'))?.shown && !!topSync === !!sl?.shown, `top: undo word ${topWords}, sync ${topSync}`)
  /* one line = every button's middle on the same line (a shorter one, the sync dot, starts lower but centres the same) */
  const mids = await page.evaluate(() => [...document.querySelectorAll('.sb-actions > *')].filter(e => e.getBoundingClientRect().width > 0).map(e => { const r = e.getBoundingClientRect(); return { id: e.id || e.className.split(' ')[0], m: Math.round(r.top + r.height / 2), h: Math.round(r.height) } }))
  const ms = mids.map(x => x.m)
  ok(`${w} board: its buttons stand on one line`, ms.length > 3 && Math.max(...ms) - Math.min(...ms) <= 3, mids.map(x => `${x.id}:${x.m}/${x.h}`).join(' '))
  /* operate the two that act here: History opens and closes the changes window; sync toggles and back */
  await press(page, '#sbHist', false)
  const chg = await page.evaluate(() => { const e = document.querySelector('.chgwin'); return !!e && !e.hidden && e.getBoundingClientRect().width > 0 })
  ok(`${w} board: History, pressed as an icon, opens the changes window`, chg && (await page.locator('#sbHist').getAttribute('aria-pressed')) === 'true')
  if (w === 1536) await shot(page, 'pc1536-board-history-open')
  await press(page, '#sbHist', false)
  ok(`${w} board: History pressed again closes it`, (await page.locator('#sbHist').getAttribute('aria-pressed')) === 'false')
  const s0 = (await seen(page, '#sbSync')).cls
  await press(page, '#sbSync', false); const s1 = (await seen(page, '#sbSync')).cls
  await press(page, '#sbSync', false); const s2 = (await seen(page, '#sbSync')).cls
  ok(`${w} board: the sync dot still toggles fast sync and back`, /\bon\b/.test(s1) !== /\bon\b/.test(s0) && s2 === s0, `${s0} → ${s1} → ${s2}`)
  await page.mouse.move(0, 0); await sleep(200)
  await shot(page, `w${w}-board-bar`)
  await closeBoard(page); await ctx.close()
}

/* ================= The highlighter mark — D1131 ================= */
for (const w of [1366, 1536]) {
  const { ctx, page } = await world({ width: w, height: 864 }, false)
  await openBoard(page)
  const tog = await seen(page, '#sbHl'), lab = await seen(page, '#sbHlStrip > .hl-lab'), tab = await seen(page, '#sbHlStrip .hl-gtab')
  ok(`${w} board: the toggle by the search is gone (it folded nothing here)`, tog && !tog.shown)
  ok(`${w} board: the mark leads the CAT / TYPE / QUALS row, on its line, left of CAT`, lab?.shown && tab?.shown && lab.x + lab.w <= tab.x && Math.abs((lab.y + lab.h / 2) - (tab.y + tab.h / 2)) <= 4, `mark x=${lab?.x} w=${lab?.w} · CAT x=${tab?.x}`)
  const wk = await page.evaluate(() => { const e = document.querySelector('#page-editsched .filters .hl-lab'); return e ? getComputedStyle(e).color : null })
  ok(`${w} board: the mark wears the week's grey`, wk && getComputedStyleColor(await page.evaluate(() => getComputedStyle(document.querySelector('#sbHlStrip > .hl-lab')).color)) === getComputedStyleColor(wk), wk)
  /* the row still works: CAT opens its chips, a chip lights and goes off */
  await press(page, '#sbHlStrip .hl-gtab', false)
  const chip = page.locator('#sbHlStrip .hl-grp.open .fchip').first()
  ok(`${w} board: CAT, pressed, opens its chips`, await chip.isVisible())
  await chip.click(); await sleep(300)
  ok(`${w} board: a chip pressed lights`, /\bon\b/.test(await chip.getAttribute('class')))
  if (w === 1536) await shot(page, 'pc1536-board-highlight-lit')
  await chip.click(); await sleep(300)
  ok(`${w} board: pressed again it goes off`, !/\bon\b/.test(await chip.getAttribute('class')))
  await press(page, '#sbHlStrip .hl-gtab', false)
  await shot(page, `w${w}-board-highlight`)
  await closeBoard(page); await ctx.close()
}
{ /* phone: the toggle stays, and folds the row */
  const { ctx, page } = await world({ width: 402, height: 874 }, true)
  await go(page, 'editsched'); await sleep(300)
  await page.evaluate(() => window.openScheduler(0)); await page.waitForSelector('#schedBoard'); await sleep(500)
  const tog = await seen(page, '#sbHl'), lab = await seen(page, '#sbHlStrip > .hl-lab')
  ok('phone board: the toggle is shown, the mark label is not', tog?.shown && !lab?.shown)
  const st0 = await seen(page, '#sbHlStrip')
  await press(page, '#sbHl', true)
  const st1 = await seen(page, '#sbHlStrip')
  ok('phone board: a tap on the toggle opens the CAT / TYPE / QUALS row', !st0.shown && st1.shown)
  await shot(page, 'phone-board-highlight-open')
  await press(page, '#sbHl', true)
  ok('phone board: a second tap folds it away', !(await seen(page, '#sbHlStrip')).shown)
  await ctx.close()
}

/* ================= The Tracker — D1132 ================= */
const TYPED = /[✎ⓘ☰⇪⌃⌄🗺]/u
{
  const { ctx, page } = await world({ width: 1536, height: 864 }, false)
  await go(page, 'tracker'); await sleep(900)
  for (const id of ['courseMenuBtn', 'sylMenuBtn', 'detailsBtn', 'showAllBtn', 'fileMenuBtn', 'barHideBtn']) {
    const g = await seen(page, `#${id} svg.trkglyph`), t = await page.locator('#' + id).textContent()
    ok(`pc Tracker ${id}: a line icon, about the text's size, no typed mark`, g?.shown && g.w >= 13 && g.w <= 17 && !TYPED.test(t), `icon ${g?.w}px "${t.trim()}"`)
  }
  await shot(page, 'pc-tracker-bar')
  await press(page, '#detailsBtn', false)
  ok('pc Tracker: ⓘ, pressed, turns Info mode on', /primary/.test((await seen(page, '#detailsBtn')).cls))
  await press(page, '#detailsBtn', false)
  ok('pc Tracker: pressed again, off', !/primary/.test((await seen(page, '#detailsBtn')).cls))
  await press(page, '#fileMenuBtn', false)
  ok('pc Tracker: File opens its menu — Import and Export', (await seen(page, '#importFileBtn'))?.shown && (await seen(page, '#exportBtn'))?.shown)
  await shot(page, 'pc-tracker-file-open')
  await page.keyboard.press('Escape'); await sleep(300)
  if ((await seen(page, '#importFileBtn'))?.shown) { await page.mouse.click(1400, 500); await sleep(300) }
  await press(page, '#sylMenuBtn', false)
  ok('pc Tracker: the syllabus pencil opens its menu', (await seen(page, '#arrangeBtn'))?.shown)
  await page.keyboard.press('Escape'); await sleep(300)
  if ((await seen(page, '#arrangeBtn'))?.shown) { await page.mouse.click(1400, 500); await sleep(300) }
  await press(page, '#barHideBtn', false)
  const peek = await seen(page, '#barShowBtn'), pg = await seen(page, '#barShowBtn svg.trkglyph')
  ok('pc Tracker: ^ hides the bar; the strip that brings it back wears the line chevron', peek?.shown && pg?.shown && !(await seen(page, '#barHideBtn'))?.shown)
  await shot(page, 'pc-tracker-bar-hidden')
  await press(page, '#barShowBtn', false)
  ok('pc Tracker: the strip brings the bar back', (await seen(page, '#barHideBtn'))?.shown)
  await ctx.close()
}
for (const [vp, touch, tag] of [[{ width: 1050, height: 800 }, false, 'w1050'], [{ width: 402, height: 874 }, true, 'phone']]) {
  const { ctx, page } = await world(vp, touch)
  await go(page, 'tracker'); await sleep(900)
  const seg = await page.evaluate(() => {
    const s = document.querySelector('#viewtabs .vt-seg'); if (!s) return null
    const cs = getComputedStyle(s), r = s.getBoundingClientRect()
    const bs = [...s.querySelectorAll(':scope > button')].map(b => { const br = b.getBoundingClientRect(), bc = getComputedStyle(b); return { t: b.textContent.trim(), in: br.left >= r.left && br.right <= r.right && br.top >= r.top && br.bottom <= r.bottom, icon: !!b.querySelector('svg.trkglyph'), bw: bc.borderTopColor, active: b.classList.contains('active') } })
    return { shown: r.width > 0, border: cs.borderTopWidth, radius: cs.borderTopLeftRadius, bs }
  })
  ok(`${tag} Tracker: the three view tabs sit in one bordered box`, seg?.shown && seg.border === '1px' && parseFloat(seg.radius) >= 8 && seg.bs.length === 3 && seg.bs.every(b => b.in), JSON.stringify(seg && { border: seg.border, radius: seg.radius, tabs: seg.bs.map(b => b.t) }))
  ok(`${tag} Tracker: each tab wears a line icon, no typed mark or emoji`, seg?.bs.every(b => b.icon && !TYPED.test(b.t)))
  await shot(page, `${tag}-tracker-tabs`)
  await press(page, '#viewtabs [data-view="info"]', touch)
  ok(`${tag} Tracker: Info, pressed, is the picked tab`, await page.locator('#viewtabs [data-view="info"]').evaluate(e => e.classList.contains('active')))
  await shot(page, `${tag}-tracker-info`)
  await press(page, '#viewtabs [data-view="flow"]', touch)
  ok(`${tag} Tracker: Flow chart, pressed, is picked again`, await page.locator('#viewtabs [data-view="flow"]').evaluate(e => e.classList.contains('active')))
  await press(page, '#showAllTab', touch)
  ok(`${tag} Tracker: Show All, pressed, opens its list`, (await page.locator('#showAllPanel.on').count()) === 1)
  await page.keyboard.press('Escape'); await sleep(300)
  if (tag === 'phone') {
    for (const id of ['courseMenuBtn', 'sylMenuBtn', 'detailsBtn', 'fileMenuBtn', 'barHideBtn']) {
      const g = await seen(page, `#${id} svg.trkglyph`)
      ok(`phone Tracker ${id}: its line icon shown`, g?.shown)
    }
    await shot(page, 'phone-tracker-bar')
  }
  await ctx.close()
}
function getComputedStyleColor(c) { return String(c).replace(/\s+/g, '') }

await browser.close()
ok('no page error, console error or failed request during the walk', errors.length === 0, errors.slice(0, 5).join(' | '))
const pass = results.filter(r => r.pass).length
writeFileSync(`${OUT}/results.json`, JSON.stringify({ pass, total: results.length, results, errors }, null, 1))
console.log(`\n${pass}/${results.length} PASS`)
process.exit(pass === results.length ? 0 : 1)
