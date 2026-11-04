// THE KEYBOARD AND WINDOWS BATCH'S WALK (5 Nov 26 — D1645–D1648, [BOARD-KEYS-LEFT], [VEILED-WINDOWS-BAR], [WINDOWS-KEEP-KEYS];
// pull request 636). Written as assertions of the RIGHT behaviour (a PASS means correct), so re-running it is the re-walk.
// Every step presses the app's own controls; the probe bridge (window.DAYS / INPUTS / CURPAGE / CURWEEK / SBDAY) is only READ.
//   from raptor-port:  WALK_DIR=<frozen dist> KW_OUT=<pictures folder> [ONLY=s1,s2…] [SIZES=desktop,phone] node scripts/handpass/kw-walk.mjs
// The build is served from WALK_DIR inside the test browser (isr-serve.mjs) — no server holds a port. Each run empties its folder.
import { chromium } from '@playwright/test'
import { existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { serveFrozen } from './isr-serve.mjs'

const VERSION = 'kw-walk v6'
const HERE = dirname(fileURLToPath(import.meta.url))
const OUT = process.env.KW_OUT || join(HERE, '../../docs/img/handpass/2026-11-05-keys-windows/walk')
const URL = 'http://localhost:4393/'
const ONLY = (process.env.ONLY || '').split(',').filter(Boolean)
const SIZE_LIST = (process.env.SIZES || 'desktop,phone').split(',')
const run = id => !ONLY.length || ONLY.includes(id)
rmSync(OUT, { recursive: true, force: true }); mkdirSync(OUT, { recursive: true })
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const browser = await chromium.launch(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {})
const results = [], errs = []
const say = l => { results.push(l); console.log(l) }
const check = (id, name, ok, got) => say(`${ok ? 'PASS' : 'FAIL'} ${id} ${name} — saw ${JSON.stringify(got)}`)
const notWalked = (id, why) => say(`NOT WALKED ${id} — ${why}`)
const note = (id, what) => say(`NOTE ${id} — ${what}`)
console.log(`[${VERSION}] → ${OUT}  build ${process.env.WALK_DIR}  only ${ONLY.join(',') || 'all'}`)
if (!process.env.WALK_DIR) throw new Error('WALK_DIR (the frozen build) is required')

const SIZES = {
  desktop: { viewport: { width: 1536, height: 864 } },
  phone: { viewport: { width: 402, height: 874 }, isMobile: true, hasTouch: true },
}
async function session(size, user = 'ad') {
  const ctx = await browser.newContext({ ...SIZES[size], deviceScaleFactor: 2 })
  await serveFrozen(ctx, URL)
  const page = await ctx.newPage()
  page.on('pageerror', e => errs.push(`[${size}] page error ${e.message}`))
  page.on('console', m => { if (m.type() === 'error') errs.push(`[${size}] console ${m.text()}`) })
  page.on('response', r => { if (r.status() >= 400) errs.push(`[${size}] HTTP ${r.status()} ${r.url()}`) })
  await page.goto(URL)
  await page.fill('#luser', user); await page.fill('#lpass', user === 'ad' ? 'a' : user)
  await page.click('#loginForm button[type=submit]')
  await page.waitForSelector('#vWeek .day', { state: 'attached' })
  await page.waitForTimeout(500)
  return { ctx, page, phone: size === 'phone', size }
}
const W = {}
let n = 0
/* a picture of the whole screen, numbered in run order */
const shot = async (w, name) => { const f = `${String(++n).padStart(3, '0')}-${w.size}-${name}.png`; await w.page.screenshot({ path: join(OUT, f) }); return f }
/* a press as the person makes it: a finger on the phone (a picture within ~100ms of the lift, the finger left where it
   pressed — D1281), the mouse on a desktop */
async function press(w, sel, name) {
  const l = w.page.locator(sel).filter({ visible: true }).first()
  if (!(await l.count())) return false
  await l.scrollIntoViewIfNeeded().catch(() => {})
  if (w.phone) { await l.tap(); if (name) await shot(w, name + '-q') }
  else await l.click()
  await w.page.waitForTimeout(w.phone ? 550 : 250)
  return true
}
const go = async (w, p) => { await w.page.evaluate(p => window.go(p), p); await w.page.waitForFunction(p => window.CURPAGE === p, p); await w.page.waitForTimeout(400) }
const up = (w, sel) => w.page.evaluate(sel => { const e = document.querySelector(sel); return !!e && !e.hidden && e.getBoundingClientRect().width > 0 }, sel)
/* what the browser finds at the middle of the first drawn match — the control itself, or what lies over it */
const hitAt = (w, sel) => w.page.evaluate(sel => {
  const el = [...document.querySelectorAll(sel)].find(e => e.getBoundingClientRect().width > 0)
  if (!el) return { found: false }
  const r = el.getBoundingClientRect(), hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2)
  return { found: true, isIt: !!hit && (hit === el || el.contains(hit)), id: el.id, over: hit ? (hit.id || String(hit.className).slice(0, 40) || hit.tagName) : '' }
}, sel)
/* the window's box against the bar over it — the board's own bar while the board is open, else the top bar */
const boxVsBar = (w, box) => w.page.evaluate(box => {
  const b = document.querySelector(box); if (!b) return null
  const bar = document.querySelector('#schedBoard:not([hidden]) .sb-top') || document.getElementById('burger').closest('.topbar')
  const r = b.getBoundingClientRect(), f = bar.getBoundingClientRect()
  return { boxTop: Math.round(r.top), boxFoot: Math.round(r.bottom), barFoot: Math.round(f.bottom), vh: innerHeight }
}, box)
const focusAt = w => w.page.evaluate(() => {
  const a = document.activeElement
  return a && a !== document.body ? { tag: a.tagName, id: a.id, label: a.getAttribute('aria-label'), cls: String(a.className).slice(0, 40), data: { ...a.dataset },
    ring: a.matches(':focus-visible'), outline: getComputedStyle(a).outlineColor + ' ' + getComputedStyle(a).outlineStyle, inMenu: !!a.closest('.wavemenu'), inBoard: !!a.closest('#schedBoard') } : null
})
const ACCENT = 'rgb(59, 198, 232)'
const bellOff = async w => { await w.page.keyboard.press('Escape').catch(() => {}); await w.page.mouse.click(5, 500).catch(() => {}); await w.page.waitForTimeout(300) }
/* an undoable change: one line of traffic added through its window (on the week, or the board while it is open) */
async function change(w) {
  const where = (await up(w, '#schedBoard')) ? '#sbBoard' : '#eWeek'
  if (!(await press(w, `${where} [data-air]`))) return false
  await press(w, '#airAdd'); await press(w, '#airDone')
  return true
}
const undoSel = w => w.page.evaluate(() => (document.querySelector('#schedBoard:not([hidden]) #sbUndo') ? '#sbUndo' : '#undoBtn'))
/* the bar's check: at Undo's middle (or the bell's, where the page draws no Undo) the browser finds the control itself */
async function barFree(w, id, label) {
  const u = await undoSel(w)
  let h = await hitAt(w, u)
  if (!h.found) h = await hitAt(w, (await up(w, '#schedBoard')) ? '#sbBell' : '#notifyBell')
  check(id, `${label}: the bar is pressable over the window (met at the control's middle)`, h.found && h.isIt, h)
}
async function boxBelow(w, id, label, box) {
  const m = await boxVsBar(w, box)
  check(id, `${label}: the box sits below the bar and on the screen`, !!m && m.boxTop >= m.barFoot - 1 && m.boxFoot <= m.vh + 1, m)
}

/* ---------- S1 Jump to a date (D1645): Edit Schedule, View-only Sched, the board ---------- */
async function s1(w) {
  const P = w.page
  for (const pg of ['editsched', 'viewsched']) {
    await go(w, pg)
    if (pg === 'editsched') await change(w)
    const cal = 'button[aria-label="Jump to a date"]'
    await press(w, cal, `s1-${pg}-open`)
    const open = await up(w, '#weekCal')
    await shot(w, `s1-${pg}-cal-open`)
    check(`S1.${pg}.1`, `Jump to a date opens on ${pg}`, open, open)
    if (!open) continue
    await barFree(w, `S1.${pg}.2`, `Jump to a date, ${pg}`)
    await boxBelow(w, `S1.${pg}.3`, `Jump to a date, ${pg}`, '#weekCal .airpop-box')
    if (pg === 'editsched') {
      const wk = await P.evaluate(() => window.CURWEEK)
      await press(w, '#undoBtn', `s1-${pg}-undo`)
      await shot(w, `s1-${pg}-after-undo`)
      check(`S1.${pg}.4`, 'Undo pressed with it open: the window stays, the week stays', (await up(w, '#weekCal')) && (await P.evaluate(() => window.CURWEEK)) === wk, await up(w, '#weekCal'))
      if (!w.phone) {
        await P.keyboard.press('Escape'); await P.waitForTimeout(300)
        const f = await focusAt(w)
        check(`S1.${pg}.5`, 'Escape after a press on Undo closes it, the keys back on its button', !(await up(w, '#weekCal')) && f?.label === 'Jump to a date', f)
        await press(w, cal)
      }
    }
    /* the bell: closes the window first, and opens its list on top */
    await press(w, '#notifyBell', `s1-${pg}-bell`)
    const bl = await up(w, '[data-testid="bell-list"]')
    await shot(w, `s1-${pg}-bell`)
    check(`S1.${pg}.6`, 'the bell closes the window first and its list opens', !(await up(w, '#weekCal')) && bl, { cal: await up(w, '#weekCal'), bell: bl })
    await bellOff(w)
    /* its own ways out: ✕, a tap on its surround; and a date picked lands there */
    await press(w, cal); await press(w, '#weekCal .airpop-head .x', `s1-${pg}-x`)
    check(`S1.${pg}.7`, 'its ✕ closes it', !(await up(w, '#weekCal')), await up(w, '#weekCal'))
    await press(w, cal)
    const b = await P.locator('#weekCal .airpop-box').boundingBox()
    if (w.phone) await P.touchscreen.tap(8, b.y + b.height + 30); else await P.mouse.click(8, b.y + b.height + 30)
    await P.waitForTimeout(400); await shot(w, `s1-${pg}-surround`)
    check(`S1.${pg}.8`, 'a tap on its surround closes it', !(await up(w, '#weekCal')), await up(w, '#weekCal'))
    const wk0 = await P.evaluate(() => window.CURWEEK)
    await press(w, cal)
    await press(w, '#weekCal [data-testid^="wcal-day-"]:not([disabled]) >> nth=20', `s1-${pg}-pick`)
    await shot(w, `s1-${pg}-picked`)
    const wk1 = await P.evaluate(() => window.CURWEEK)
    check(`S1.${pg}.9`, 'a date picked closes it and the schedule goes there', !(await up(w, '#weekCal')) && wk1 !== wk0, { from: wk0, to: wk1 })
    await press(w, cal); await press(w, '#weekCal .wc-today')
    note(`S1.${pg}`, `back on the week of ${await P.evaluate(() => window.CURWEEK)}`)
  }
  /* the board's own calendar: Undo on the board's bar, a day chip / day arrow closes it first */
  await go(w, 'editsched')
  await press(w, '#eWeek .day[data-day="1"] .dt.sb-open')
  await change(w)
  await press(w, '#sbCal', 's1-board-open')
  await shot(w, 's1-board-cal-open')
  check('S1.board.1', 'the board\'s calendar opens', await up(w, '#weekCal'), await up(w, '#weekCal'))
  await barFree(w, 'S1.board.2', 'Jump to a date over the board')
  await boxBelow(w, 'S1.board.3', 'Jump to a date over the board', '#weekCal .airpop-box')
  await press(w, '#sbUndo', 's1-board-undo')
  check('S1.board.4', 'the board\'s Undo with it open: the window stays', await up(w, '#weekCal'), await up(w, '#weekCal'))
  const day0 = await P.evaluate(() => window.SBDAY)
  if (w.phone) await press(w, '#sbNextDay', 's1-board-nextday'); else await press(w, '#sbDays [data-sbtab="3"]')
  await shot(w, 's1-board-after-day')
  const day1 = await P.evaluate(() => window.SBDAY)
  check('S1.board.5', 'another control of the board\'s bar (the day) closes it first, then does its job', !(await up(w, '#weekCal')) && day1 !== day0, { cal: await up(w, '#weekCal'), from: day0, to: day1 })
  await press(w, '#sbDone')
}

/* ---------- S2 the day-details window (D1645): the edit week's ⓘ, View-only Sched's day name, the board's ⓘ ---------- */
const dayTitle = w => w.page.evaluate(() => document.getElementById('dayPopTitle')?.textContent || null)
async function s2(w) {
  const P = w.page
  await go(w, 'editsched')
  /* a change the window shows: a wave added on day 0 through the board's own + Wave (the day's count in its title) */
  await press(w, '#eWeek .day[data-day="0"] .dt.sb-open')
  await press(w, '#sbBoard [data-wvadd]'); await press(w, '.wavemenu [data-wmkind=""]')
  await press(w, '#sbDone')
  await press(w, '#eWeek .day[data-day="0"] .dinfobtn', 's2-week-open')
  await shot(w, 's2-week-open')
  const t1 = await dayTitle(w)
  check('S2.week.1', 'the day details open from the edit week\'s ⓘ', await up(w, '#dayPop'), t1)
  await barFree(w, 'S2.week.2', 'day details, Edit Schedule')
  await boxBelow(w, 'S2.week.3', 'day details, Edit Schedule', '#dayPop .airpop-box')
  await press(w, '#undoBtn', 's2-week-undo')
  await shot(w, 's2-week-after-undo')
  const t2 = await dayTitle(w)
  check('S2.week.4', 'Undo with it open: it stays, and reads the day as Undo left it (the wave added is gone from its title)', (await up(w, '#dayPop')) && t2 !== t1, { before: t1, after: t2 })
  await press(w, '#redoBtn')
  check('S2.week.5', 'Redo: it reads the day again', (await dayTitle(w)) === t1, await dayTitle(w))
  await press(w, '#undoBtn')
  for (const [how, act] of [['Close', () => press(w, '#dayPopDone', 's2-close')], ['✕', () => press(w, '#dayPopClose', 's2-x')],
    ['Escape', async () => { if (w.phone) return 'skip'; await P.keyboard.press('Escape'); await P.waitForTimeout(300) }],
    ['the bell', () => press(w, '#notifyBell', 's2-bell')], ['a page name (or ☰)', () => w.phone ? press(w, '#burger', 's2-burger') : press(w, '.nav a[data-page="viewsched"]', 's2-page')]]) {
    if (!(await up(w, '#dayPop'))) await press(w, '#eWeek .day[data-day="0"] .dinfobtn')
    if (!(await up(w, '#dayPop'))) { notWalked(`S2.close ${how}`, 'the window would not reopen'); continue }
    if ((await act()) === 'skip') { note(`S2.close ${how}`, 'no keyboard on the phone'); continue }
    await shot(w, `s2-after-${how.replace(/\W+/g, '')}`)
    check(`S2.close ${how}`, `${how} closes the day details`, !(await up(w, '#dayPop')), await up(w, '#dayPop'))
    await bellOff(w)
    if (w.phone && (await up(w, '.drawer.open'))) { await P.mouse.click(390, 400); await P.waitForTimeout(300) }
    if ((await P.evaluate(() => window.CURPAGE)) !== 'editsched') await go(w, 'editsched')
  }
  /* View-only Sched: the day name opens it (no Undo there — the bell is the bar's control met) */
  await go(w, 'viewsched')
  await press(w, '#vWeek .day[data-day="1"] [data-dayinfo]', 's2-view-open')
  await shot(w, 's2-view-open')
  check('S2.view.1', 'the day details open on View-only Sched', await up(w, '#dayPop'), await dayTitle(w))
  await barFree(w, 'S2.view.2', 'day details, View-only Sched')
  await boxBelow(w, 'S2.view.3', 'day details, View-only Sched', '#dayPop .airpop-box')
  await press(w, '#dayPopClose')
  /* the board's ⓘ: the board's own Undo met; a board day step closes it first */
  await go(w, 'editsched')
  await press(w, '#eWeek .day[data-day="2"] .dt.sb-open')
  await change(w)
  await press(w, '#schedBoard .dinfobtn', 's2-board-open')
  await shot(w, 's2-board-open')
  check('S2.board.1', 'the day details open over the board', await up(w, '#dayPop'), await dayTitle(w))
  await barFree(w, 'S2.board.2', 'day details over the board')
  await boxBelow(w, 'S2.board.3', 'day details over the board', '#dayPop .airpop-box')
  await press(w, '#sbUndo', 's2-board-undo')
  check('S2.board.4', 'the board\'s Undo with it open: it stays', await up(w, '#dayPop'), await up(w, '#dayPop'))
  if (w.phone) await press(w, '#sbNextDay', 's2-board-next'); else await press(w, '#sbDays [data-sbweek="1"]', 's2-board-week')
  await shot(w, 's2-board-after-step')
  check('S2.board.5', 'a day or week step on the board\'s bar closes it first', !(await up(w, '#dayPop')), await up(w, '#dayPop'))
  if (!w.phone) await press(w, '#sbDays [data-sbweek="-1"]')
  await press(w, '#sbDone')
}

/* ---------- S3 the document viewer (D1645): the Medical page, the Inputs list, an input's window on each page ---------- */
const viewer = w => up(w, '#docViewPop')
async function medViewer(w, tag) {
  await go(w, 'inputs')
  await press(w, '#inMedBtn')
  return press(w, '.medsec.med-pend .medcard', tag)
}
async function s3(w) {
  const P = w.page
  if (!(await medViewer(w, 's3-med-open'))) { notWalked('S3.med', 'no medical card to press'); return }
  await shot(w, 's3-med-open')
  check('S3.med.1', 'the viewer opens from a medical card', await viewer(w), await viewer(w))
  await barFree(w, 'S3.med.2', 'the viewer over the Medical page')
  await boxBelow(w, 'S3.med.3', 'the viewer over the Medical page', '#docViewPop .docviewbox')
  for (const [how, act] of [['Close', () => press(w, '#docViewDone', 's3-close')], ['✕', () => press(w, '#docViewClose', 's3-x')],
    ['Escape', async () => { if (w.phone) return 'skip'; await P.keyboard.press('Escape'); await P.waitForTimeout(300) }],
    ['the bell', () => press(w, '#notifyBell', 's3-bell')]]) {
    if (!(await viewer(w))) await press(w, '.medsec.med-pend .medcard')
    if ((await act()) === 'skip') { note(`S3.close ${how}`, 'no keyboard on the phone'); continue }
    await shot(w, `s3-after-${how.replace(/\W+/g, '')}`)
    check(`S3.close ${how}`, `${how} closes the viewer`, !(await viewer(w)), await viewer(w))
    await bellOff(w)
  }
  /* an Undo with the viewer open shows the input as Undo left it: its remarks changed through its own window, then undone */
  await press(w, '.medsec.med-pend .medcard')
  const sub0 = await P.evaluate(() => document.querySelector('#docViewPop .docview-sub')?.textContent || '')
  const canEdit = await press(w, '#docViewEdit')
  if (canEdit && (await up(w, '#inpEditRmk'))) {
    await P.locator('#inpEditRmk').filter({ visible: true }).first().fill('KW WALK REMARK')
    await press(w, '#inpEditSave')
    await press(w, '.medsec.med-pend .medcard', 's3-undo-open')
    const sub1 = await P.evaluate(() => document.querySelector('#docViewPop .docview-sub')?.textContent || '')
    await press(w, '#undoBtn', 's3-undo')
    await shot(w, 's3-after-undo')
    const sub2 = await P.evaluate(() => document.querySelector('#docViewPop .docview-sub')?.textContent || '')
    check('S3.undo', 'Undo with the viewer open: it stays, and shows the remarks as Undo left them', (await viewer(w)) && sub1.includes('KW WALK REMARK') && !sub2.includes('KW WALK REMARK'), { before: sub0, saved: sub1, afterUndo: sub2 })
    await press(w, '#docViewDone')
  } else notWalked('S3.undo', `no "Edit input" on the viewer, or no Remarks box (${canEdit})`)
  /* the Inputs page's input window (a movable window — the page behind works, D641): its paperclip; the bar stays free; the
     viewer's Close closes it alone */
  await press(w, '#inListBtn'); await press(w, '#inRangeBtn'); await press(w, '#inRangeAll')
  await press(w, '#inBody .rclip', 's3-list-open')
  await shot(w, 's3-list-open')
  if (await viewer(w)) {
    check('S3.list.1', 'the viewer opens from the Inputs list\'s paperclip', true, true)
    await barFree(w, 'S3.list.2', 'the viewer over the Inputs list')
    await press(w, '#docViewDone')
  } else notWalked('S3.list', 'no paperclip on the Inputs list')
  /* the schedule's own input window keeps the bar covered (D1645) — and so does a viewer opened over it */
  await go(w, 'editsched')
  if (!(await press(w, '#eWeek .day[data-day="0"] [data-inpedit]', 's3-inpwin-open'))) { notWalked('S3.inpwin', 'no input row with a door on Monday'); return }
  await P.waitForTimeout(300)
  const win = await up(w, '#inpEditPop')
  const u0 = await hitAt(w, '#undoBtn')
  check('S3.inpwin.1', 'the schedule\'s input window keeps the bar covered', win && u0.found && !u0.isIt, u0)
  await P.locator('#inpEditPop .docfield input[type=file]').first().setInputFiles({ name: 'kw-walk.pdf', mimeType: 'application/pdf', buffer: Buffer.from('%PDF-1.4 %%EOF') })
  await press(w, '#inpEditPop .docopen', 's3-inpwin-doc')
  await shot(w, 's3-inpwin-doc')
  const u1 = await hitAt(w, '#undoBtn')
  check('S3.inpwin.2', 'the viewer opened over it keeps its whole veil: the bar still covered', (await viewer(w)) && u1.found && !u1.isIt, u1)
  await press(w, '#docViewDone', 's3-inpwin-doc-close')
  await shot(w, 's3-inpwin-after-close')
  check('S3.inpwin.3', 'the viewer\'s Close closes it alone: the input window is still there', !(await viewer(w)) && (await up(w, '#inpEditPop')), { viewer: await viewer(w), win: await up(w, '#inpEditPop') })
  await press(w, '#inpEditCancel')
}

/* ---------- S4 Traffic on View-only Sched read only for everyone (D1647) ---------- */
async function s4(w, who) {
  const P = w.page
  await go(w, 'viewsched')
  if (!(await press(w, '#vWeek [data-air]', `s4-${who}-view`))) { notWalked(`S4.${who}`, 'no Traffic button on View-only Sched'); return }
  await shot(w, `s4-${who}-view`)
  const r = await P.evaluate(() => ({ boxes: document.querySelectorAll('#airBody [data-airi]').length, del: document.querySelectorAll('#airBody [data-airdel]').length,
    add: !!document.getElementById('airAdd'), list: !!document.querySelector('#airBody .airview') }))
  check(`S4.${who}.1`, `View-only Sched, ${who}: the plain read list — no box, no ✕, no Add row`, r.boxes === 0 && r.del === 0 && !r.add && r.list, r)
  await barFree(w, `S4.${who}.2`, `Traffic on View-only Sched, ${who}`)
  await press(w, '#airClose')
  if (who === 'admin') {
    await go(w, 'editsched')
    await press(w, '#eWeek [data-air]', 's4-admin-edit')
    check('S4.admin.3', 'Edit Schedule, an admin: the editing window (Add row)', await up(w, '#airAdd'), await up(w, '#airAdd'))
    await press(w, '#airDone')
    await press(w, '#eWeek .day[data-day="0"] .dt.sb-open')
    await press(w, '#sbBoard [data-air]', 's4-admin-board')
    check('S4.admin.4', 'the board, an admin: the editing window (Add row)', await up(w, '#airAdd'), await up(w, '#airAdd'))
    await press(w, '#airDone'); await press(w, '#sbDone')
  }
}

/* ---------- S5 the board by the keys (D1646) — a desktop, real keys ---------- */
const MENUS = [['+ Block', '#sbBoard [data-dwadd]'], ['Templates', '#sbTpl'], ['the plans selector', '#schedBoard [data-planmenu]'],
  ['a jet\'s stores', '#sbBoard [data-stcfg]'], ['+ Wave', '#sbBoard [data-wvadd]']]
async function s5(w) {
  const P = w.page
  await go(w, 'editsched')
  await press(w, '#eWeek .day[data-day="2"] .dt.sb-open')
  for (const [name, sel] of MENUS) {
    const b = P.locator(sel).filter({ visible: true }).first()
    if (!(await b.count())) { notWalked(`S5 ${name}`, 'no button'); continue }
    await b.focus(); await P.keyboard.press('Enter'); await P.waitForTimeout(250)
    const f = await focusAt(w)
    await shot(w, `s5-${name.replace(/\W+/g, '')}-enter`)
    check(`S5.${name}.1`, `${name} opened by Enter: the keys on its first pick, the cyan ring`, !!f?.inMenu && f.ring && f.outline.startsWith(ACCENT) && f.cls.includes('wm'), f)
    await P.keyboard.press('ArrowDown'); await P.waitForTimeout(100)
    const f2 = await focusAt(w)
    check(`S5.${name}.2`, '↓ moves to the next item, in the menu', !!f2?.inMenu && JSON.stringify(f2) !== JSON.stringify(f), f2)
    await P.keyboard.press('Escape'); await P.waitForTimeout(200)
    const f3 = await focusAt(w)
    check(`S5.${name}.3`, 'Escape closes it, the keys back on its button', !(await up(w, '.wavemenu')) && !!f3 && !f3.inMenu, f3)
    /* the mouse, then the keys: opened by a click (no keys moved, no ring), then ↓ on the button goes into it */
    await b.click(); await P.waitForTimeout(250)
    const m = await focusAt(w)
    const ringed = await P.evaluate(() => [...document.querySelectorAll('.wavemenu button')].some(x => x.matches(':focus-visible')))
    await shot(w, `s5-${name.replace(/\W+/g, '')}-mouse`)
    check(`S5.${name}.4`, 'opened by the mouse: the keys not moved into it, no ring', (await up(w, '.wavemenu')) && !m?.inMenu && !ringed, { m, ringed })
    await b.focus(); await P.keyboard.press('ArrowDown'); await P.waitForTimeout(200)
    const m2 = await focusAt(w)
    check(`S5.${name}.5`, 'then ↓ on its button: the keys go into the open menu', !!m2?.inMenu, m2)
    await P.keyboard.press('Escape'); await P.waitForTimeout(200)
  }
  /* a pick by the keys: + Block → "Empty block" reached by the arrows, Enter adds it; the keys back on + Block; the block shows
     on the board and on the week; then the keys first, the mouse after: the plans menu opened by Enter, a pick by a click */
  const blocks0 = await P.evaluate(() => (window.DAYS[2].dutywaves || []).length)
  const blk = P.locator('#sbBoard [data-dwadd]').filter({ visible: true }).first()
  await blk.focus(); await P.keyboard.press('Enter'); await P.waitForTimeout(200)
  for (let i = 0; i < 12; i++) { const t = await P.evaluate(() => document.activeElement?.textContent || ''); if (/Empty block/.test(t)) break; await P.keyboard.press('ArrowDown') }
  await P.keyboard.press('Enter'); await P.waitForTimeout(500)
  const blocks1 = await P.evaluate(() => (window.DAYS[2].dutywaves || []).length)
  const fb = await focusAt(w)
  await shot(w, 's5-block-picked')
  check('S5.pick.1', 'Empty block picked by the keys: a block added, the keys back on + Block', blocks1 === blocks0 + 1 && fb?.data?.dwadd != null, { blocks0, blocks1, fb })
  const plan = P.locator('#schedBoard [data-planmenu]').filter({ visible: true }).first()
  await plan.focus(); await P.keyboard.press('Enter'); await P.waitForTimeout(250)
  await P.locator('.wavemenu button.wm').first().click(); await P.waitForTimeout(300)
  check('S5.pick.2', 'keys then mouse: the plans menu opened by Enter, its first pick clicked — the menu closes, no error', !(await up(w, '.wavemenu')), await up(w, '.wavemenu'))
  /* the day and week chips by Tab, Enter and Space */
  await P.locator('#sbCal').focus()
  let reached = null
  for (let i = 0; i < 20; i++) { await P.keyboard.press('Tab'); const f = await focusAt(w); if (f?.data?.sbtab != null || f?.data?.sbweek != null) { reached = f; break } }
  check('S5.chips.1', 'Tab from the board\'s calendar reaches the day chips', !!reached, reached)
  const tabTo = await P.locator('#sbDays [data-sbtab="5"]').focus().then(() => true)
  await P.keyboard.press('Enter'); await P.waitForTimeout(350)
  const fc = await focusAt(w)
  await shot(w, 's5-chip-enter')
  check('S5.chips.2', 'Enter on Saturday\'s chip opens Saturday; the keys stay on its chip, the cyan ring', tabTo && (await P.evaluate(() => window.SBDAY)) === 5 && fc?.data?.sbtab === '5' && fc.ring && fc.outline.startsWith(ACCENT), fc)
  const wk0 = await P.evaluate(() => window.CURWEEK)
  await P.locator('#sbDays [data-sbweek="1"]').focus(); await P.keyboard.press(' '); await P.waitForTimeout(500)
  const fw = await focusAt(w)
  check('S5.chips.3', 'Space on › moves a week, the same day, the keys on ›', (await P.evaluate(() => window.CURWEEK)) !== wk0 && (await P.evaluate(() => window.SBDAY)) === 5 && fw?.data?.sbweek === '1', { wk: await P.evaluate(() => window.CURWEEK), fw })
  await P.locator('#sbDays [data-sbweek="-1"]').focus(); await P.keyboard.press('Enter'); await P.waitForTimeout(500)
  check('S5.chips.4', 'Enter on ‹ comes back', (await P.evaluate(() => window.CURWEEK)) === wk0, await P.evaluate(() => window.CURWEEK))
  /* the read's F2 (5 Nov 26): a chip pressed by the keys closes what stands over the board first — the Traffic window */
  /* (on Wednesday: Saturday, where the chips step above left the board, has standby waves only — no Traffic button) */
  await press(w, '#sbDays [data-sbtab="2"]')
  await press(w, '#sbBoard [data-air]')
  const airUp = await up(w, '#airpop')
  if (!airUp) notWalked('S5.F2', 'the Traffic window would not open on Wednesday')
  await P.locator('#sbDays [data-sbtab="4"]').focus(); await P.keyboard.press('Enter'); await P.waitForTimeout(350)
  await shot(w, 's5-chip-over-traffic')
  check('S5.F2', 'Enter on Friday\'s chip with the Traffic window up: the window closes first, Friday opens', airUp && !(await up(w, '#airpop')) && (await P.evaluate(() => window.SBDAY)) === 4, { airUp, air: await up(w, '#airpop'), day: await P.evaluate(() => window.SBDAY) })
  /* the read's F3: Tab past a menu's last item closes it, the keys back on its button */
  const blk2 = P.locator('#sbBoard [data-dwadd]').filter({ visible: true }).first()
  await blk2.focus(); await P.keyboard.press('Enter'); await P.waitForTimeout(200)
  await P.evaluate(() => { const b = [...document.querySelectorAll('.wavemenu button')].filter(x => !x.disabled); b[b.length - 1].focus() })
  await P.keyboard.press('Tab'); await P.waitForTimeout(200)
  const ft = await focusAt(w)
  check('S5.F3', 'Tab past + Block\'s last item: the menu closes, the keys on + Block, on the board', !(await up(w, '.wavemenu')) && ft?.data?.dwadd != null && ft.inBoard, ft)
  /* Tab stays on the board: from its last stop to its first; with the keys nowhere, Tab lands on the board */
  const ends = await P.evaluate(() => {
    const b = document.getElementById('schedBoard')
    const s = [...b.querySelectorAll('button,a[href],input,select,textarea,[tabindex]:not([tabindex="-1"]),[contenteditable="true"],[contenteditable=""]')]
      .filter(n => n.tabIndex >= 0 && !n.disabled && !n.closest('[hidden], [inert]') && n.getClientRects().length > 0)
    document.querySelectorAll('[data-kw-end]').forEach(x => x.removeAttribute('data-kw-end'))
    s[0].setAttribute('data-kw-end', 'first'); s[s.length - 1].setAttribute('data-kw-end', 'last')
    return s.length
  })
  await P.locator('[data-kw-end="last"]').focus(); await P.keyboard.press('Tab'); await P.waitForTimeout(150)
  check('S5.tab.1', 'Tab from the board\'s last stop goes to its first', await P.evaluate(() => document.activeElement?.getAttribute('data-kw-end') === 'first'), { stops: ends, at: await focusAt(w) })
  await P.keyboard.press('Shift+Tab'); await P.waitForTimeout(150)
  check('S5.tab.2', 'Shift+Tab from its first goes to its last', await P.evaluate(() => document.activeElement?.getAttribute('data-kw-end') === 'last'), await focusAt(w))
  await P.evaluate(() => document.activeElement && document.activeElement.blur()); await P.keyboard.press('Tab'); await P.waitForTimeout(150)
  check('S5.tab.3', 'with the keys nowhere, Tab lands on the board, never the week behind it', !!(await focusAt(w))?.inBoard, await focusAt(w))
  /* Sort all: opened by the keys, Escape closes it — the board stays */
  const sa = P.locator('#sbSortAll').filter({ visible: true }).first()
  if (await sa.count()) {
    await sa.focus(); await P.keyboard.press('Enter'); await P.waitForTimeout(300)
    await shot(w, 's5-sortall-open')
    const op = await up(w, '#sortAllPop')
    await P.keyboard.press('Escape'); await P.waitForTimeout(300)
    check('S5.sortall', 'Sort all opened by the keys; Escape closes it, the board stays', op && !(await up(w, '#sortAllPop')) && (await up(w, '#schedBoard')), { opened: op, stays: await up(w, '#schedBoard') })
  } else notWalked('S5.sortall', 'Sort all is behind ⋯ at this width')
  await press(w, '#sbDone')
  /* Edit Schedule's day name: Shift+Tab from the date reaches it, Enter shows that day's crew */
  await P.locator('#eWeek .day[data-day="4"] .dt.sb-open').focus(); await P.keyboard.press('Shift+Tab'); await P.waitForTimeout(150)
  const dn = await focusAt(w)
  check('S5.dayname.1', 'Shift+Tab from the date reaches the day name', dn?.data?.crewday === '4', dn)
  await P.keyboard.press('Enter'); await P.waitForTimeout(400)
  const crewHead = await P.evaluate(() => { const b = document.querySelector('[data-crewstep="1"]'); return b ? (b.parentElement?.textContent || '').replace(/\s+/g, ' ').trim() : null })
  const dnAfter = await focusAt(w)
  await shot(w, 's5-dayname-enter')
  const dow4 = await P.evaluate(() => window.DAYS[4].dow)
  check('S5.dayname.2', 'Enter on Friday\'s name shows Friday\'s crew, the cyan ring on the name', !!crewHead && crewHead.includes(dow4) && !!dnAfter?.ring && dnAfter.outline.startsWith(ACCENT), { crewHead, dnAfter })
  /* clean up the block the keys added */
  await press(w, '#undoBtn')
}

/* ---------- S6 an unreadable clock said once (D1648): on the board and the week ---------- */
const SAID = /reporting line 1 has no recognised clock\. Check the time\./g
async function s6(w) {
  const P = w.page
  await go(w, 'editsched')
  await press(w, '#eWeek .day[data-day="3"] .dt.sb-open')
  await press(w, '#sbBoard [data-wvadd]'); await press(w, '.wavemenu [data-wmkind=""]')
  const gi = await P.evaluate(() => { const ws = [...document.querySelectorAll('#schedBoard:not([hidden]) [data-gline]')]; return ws.length ? ws[ws.length - 1].dataset.gline : null })
  if (!gi) { notWalked('S6', 'no new wave'); return }
  for (let k = 0; k < 2; k++) await press(w, `#sbBoard [data-gline="${gi}"]`)
  const ek = gi.replace('.', '|')
  await press(w, `#sbBoard [data-itadd="${ek}"]`)
  const line = P.locator(`#sbBoard [data-itline^="${ek}|"]`).first()
  if (w.phone) await line.tap(); else await line.click()
  await P.keyboard.press('Control+A'); await P.keyboard.type('25:90 in time'); await P.keyboard.press('Tab'); await P.waitForTimeout(500)
  const fb = `#sbBoard .intimes[data-intimes="${ek}"] [data-reporting-feedback]`
  await P.evaluate(sel => document.querySelector(sel)?.closest('.sb-go')?.scrollIntoView({ block: 'center' }), fb)
  const said = (await P.evaluate(sel => document.querySelector(sel)?.textContent || '', fb))
  await shot(w, 's6-board-note')
  const lines = await P.evaluate(gi => { const [d, g] = gi.split('.').map(Number); return window.DAYS[d].waves[g].formations.length }, gi)
  check('S6.board', `the board's red note, a wave of ${lines} unnamed lines: the unreadable clock said once`, lines >= 3 && (said.match(SAID) || []).length === 1, said)
  await press(w, '#sbDone')
  const wk = `#eWeek .intimes[data-intimes="${ek}"] [data-reporting-feedback]`
  await P.evaluate(sel => document.querySelector(sel)?.scrollIntoView({ block: 'center' }), wk)
  const saidW = await P.evaluate(sel => document.querySelector(sel)?.textContent || '', wk)
  await shot(w, 's6-week-note')
  check('S6.week', 'the edit week\'s red note for the same wave: said once', (saidW.match(SAID) || []).length === 1, saidW)
  const issues = await P.evaluate(([d]) => (window.WARN.byDay[d]?.warns || []).filter(x => x.code === 'REPORT_UNRESOLVED').length, [3])
  /* the issues list already says each sentence once (validate's own add() keeps one line per code, men and words) —
     unchanged by D1648, which is about the red note alone */
  check('S6.issues', 'the day\'s issues list: one line for the sentence, as it always was (engine unchanged)', issues === 1, issues)
  for (let k = 0; k < 5; k++) await press(w, '#undoBtn')
}

for (const size of SIZE_LIST) {
  const w = await session(size)
  W[size] = w
  for (const [id, f] of [['s1', s1], ['s2', s2], ['s3', s3], ['s4', w2 => s4(w2, 'admin')], ['s5', s5], ['s6', s6]]) {
    if (!run(id)) continue
    if (id === 's5' && w.phone) { note('S5', 'the board by the keys is walked at a desktop: a phone has no keyboard (its chips are not drawn there)'); continue }
    try { await f(w) } catch (e) { say(`FAIL ${id}.ERROR [${size}] the script stopped: ${String(e.message).split('\n')[0]}`); await shot(w, `${id}-error`).catch(() => {}) }
  }
  await w.ctx.close()
  /* a member on View-only Sched */
  if (run('s4')) {
    const m = await session(size, 'us')
    try { await s4(m, 'member') } catch (e) { say(`FAIL s4.member.ERROR [${size}] ${String(e.message).split('\n')[0]}`) }
    await m.ctx.close()
  }
}
await browser.close()
const lines = [...results, ...errs.map(e => 'BROWSER ' + e)]
writeFileSync(join(OUT, 'results-kw-walk.txt'), `[${VERSION}]\n` + lines.join('\n') + '\n')
console.log(`\n${results.filter(r => r.startsWith('PASS')).length} PASS · ${results.filter(r => r.startsWith('FAIL')).length} FAIL · ${results.filter(r => r.startsWith('NOT WALKED')).length} NOT WALKED · ${errs.length} browser errors`)
