/* The pictures round (D1747, night of 7–8 Nov 26), group "sched": four of the backlog's small questions, each pictured on
   the real app today and each fix DRAWN on the running app (DOM and style changes in the page, nothing saved), for his
   answer from his phone. Desktop 1536 × 864 (his PC), phone 402 × 874 (his iPhone, touch), both at 2x. Rings are outlines
   on the element itself, each with a tag from its own ::before naming the problem in plain words (the brief, D853, D1222).
   Every picture is real except the ones whose name ends "-A" / "-B" (drawn, and tagged "Drawn: …").
     q1 [SCHED-UNAV-PENDING-MARK] Wed 15 Jul published, then LL for Bolt and a Meeting for Saint filed on it: the Ground
        Programme row's name wears the dotted "waiting" underline, the Unavailable row none; drawn A: the same underline
     q2 [READONLY-WEEK-WORDS] the week's day-3 saved row damaged, the page reloaded: every day's notice and a filing's
        refusal blame "an older version of the app"; drawn A / B: words for the unreadable case
     q3 [LOGIC-WORDS-WORKHOURS] the Logic page's rally sentence; Fri 17 Jul's new line VL (Saint, Echo) with nothing entered,
        its R box suggesting 09:00 while Insights counts Saint from 11:00; drawn A (Insights +2h) and B (the words)
     q4 [INP-ADD-RIGHT] the desktop Inputs list closed and open, the Medical tab closed and open, both on a phone; drawn:
        "+ Input" at the right with the list making room, copied from the Medical tab
   Run from raptor-port/: HP_URL=http://localhost:4291 HP_SHOTS=docs/img/handpass/2026-11-07-pictures-round
        node scripts/handpass/pr-sched.mjs   (PR_ONLY=q1,q3 redoes only those) */
import { existsSync, mkdirSync, writeFileSync, readFileSync } from 'node:fs'
import { chromium } from '@playwright/test'
const { BASE, SHOTS, login, go, board, closeBoard, publish } = await import('./lib.mjs')
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const OUT = SHOTS; mkdirSync(OUT, { recursive: true })
const browser = await chromium.launch({ headless: true, ...(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {}) })
const sleep = ms => new Promise(r => setTimeout(r, ms))
const PC = { width: 1536, height: 864 }, PHONE = { width: 402, height: 874 }
const T = id => `[data-testid="${id}"]`
const ONLY = process.env.PR_ONLY || ''
const want = q => !ONLY || ONLY.split(',').includes(q)
const MEAS = `${OUT}/q-sched-measured.json`
const made = [], measured = existsSync(MEAS) ? JSON.parse(readFileSync(MEAS, 'utf8')) : {}

/* the ring and its tag: an amber outline on the element, and the problem in words from its own ::before */
const STYLE = `*{scroll-behavior:auto!important}
.zz-ring{outline:3px solid #ffb020!important;outline-offset:3px!important;border-radius:7px}
.zz-tagged{overflow:visible!important}
.zz-tagged::before{content:attr(data-zz-tag)!important;position:absolute!important;left:-3px;bottom:calc(100% + 9px);top:auto;right:auto;
  transform:none;z-index:99999!important;white-space:nowrap!important;font:700 12.5px/1.3 system-ui,'Segoe UI',Arial,sans-serif!important;
  color:#ffb020!important;background:#14181f!important;border:1px solid #ffb020!important;border-radius:5px!important;padding:2px 7px!important;
  pointer-events:none!important;text-transform:none!important;letter-spacing:0!important;text-decoration:none!important;
  width:auto!important;height:auto!important;opacity:1!important;display:block!important;box-shadow:none!important;inset:auto;margin:0!important}
.zz-tagged[data-zz-pos=above]::before{left:-3px;bottom:calc(100% + 9px)}
.zz-tagged[data-zz-pos=aboveR]::before{left:auto;right:-3px;bottom:calc(100% + 9px)}
.zz-tagged[data-zz-pos=below]::before{bottom:auto;top:calc(100% + 9px);left:-3px}
.zz-tagged[data-zz-pos=belowR]::before{bottom:auto;top:calc(100% + 9px);left:auto;right:-3px}
.zz-tagged[data-zz-pos=right]::before{bottom:auto;left:calc(100% + 12px);top:50%;transform:translateY(-50%)}
.zz-tagged[data-zz-pos=left]::before{bottom:auto;left:auto;right:calc(100% + 12px);top:50%;transform:translateY(-50%)}
.zz-tagged[data-zz-pos=inTop]::before{bottom:auto;top:6px;left:auto;right:8px}
.zz-tagged[data-zz-wrap]::before{white-space:normal!important}
.zz-tagged[data-zz-pos=headR]::before{bottom:auto;left:auto;right:0;top:50%;transform:translateY(-50%)}
.zz-tagged[data-zz-pos=belowAt]::before{bottom:auto;top:calc(100% + 6px);left:var(--zz-x,0)}
.zz-tagged[data-zz-pos=aboveAt]::before{left:var(--zz-x,0);bottom:calc(100% + var(--zz-y,9px))}
.zz-tagged[data-zz-pos=rightAt]::before{bottom:auto;left:calc(100% + var(--zz-x,12px));top:50%;transform:translateY(-50%)}`
const HIDE_TOASTS = '.toast,.snack{display:none!important}'

async function world(vp, touch, { state = null, toasts = false, init = null } = {}) {
  const ctx = await browser.newContext({ viewport: vp, deviceScaleFactor: 2, ...(touch ? { isMobile: true, hasTouch: true } : {}), ...(state ? { storageState: state } : {}) })
  await ctx.clock.install({ time: new Date('2026-07-13T09:00:00') })
  if (init) await ctx.addInitScript(init.fn, init.arg)
  const page = await ctx.newPage()
  page.on('pageerror', e => console.log('PAGE ERROR', e.message))
  page.on('console', m => { if (m.type() === 'warning' && /persist|read-only|will not read/.test(m.text())) console.log('  console:', m.text().slice(0, 200)) })
  await page.goto(BASE + '/'); await login(page, 'a')
  await page.addStyleTag({ content: STYLE + (toasts ? '' : HIDE_TOASTS) })
  return { ctx, page }
}

/* name one visible element (the first of `sel` whose text holds `text`) as data-zz=<id>, so a ring can find it again */
const name = (page, id, sel, text = '', scope = null, re = null) => page.evaluate(([id, sel, text, scope, re]) => {
  const root = scope ? document.querySelector(scope) : document
  if (!root) return false
  const rx = re ? new RegExp(re) : null
  const els = [...root.querySelectorAll(sel)].filter(e => { const r = e.getBoundingClientRect(); const t = (e.textContent || ''); return (r.width > 0 && r.height > 0) && (!text || t.includes(text)) && (!rx || rx.test(t.trim())) })
  document.querySelectorAll(`[data-zz="${id}"]`).forEach(e => e.removeAttribute('data-zz'))
  if (!els.length) return false
  els[0].setAttribute('data-zz', id); return true
}, [id, sel, text, scope, re])
const Z = id => `[data-zz="${id}"]`

/* items: { sel, tag?, pos?, noring? } — every match ringed, the first carrying the tag */
async function ring(page, items) {
  await page.evaluate(items => {
    for (const e of document.querySelectorAll('.zz-ring,.zz-tagged')) {
      e.classList.remove('zz-ring', 'zz-tagged'); e.removeAttribute('data-zz-tag'); e.removeAttribute('data-zz-pos'); e.removeAttribute('data-zz-wrap')
      if (e.dataset.zzRel) { e.style.position = ''; delete e.dataset.zzRel }
    }
    for (const it of items) {
      const els = [...document.querySelectorAll(it.sel)].filter(e => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 })
      if (!els.length) throw new Error('ring: nothing at ' + it.sel)
      els.forEach((e, i) => {
        if (!it.noring) e.classList.add('zz-ring')
        if (it.tag && i === 0) {
          e.classList.add('zz-tagged'); e.setAttribute('data-zz-tag', it.tag); if (it.pos) e.setAttribute('data-zz-pos', it.pos); if (it.wrap) e.setAttribute('data-zz-wrap', '1')
          if (getComputedStyle(e).position === 'static') { e.style.position = 'relative'; e.dataset.zzRel = '1' }
        }
      })
    }
  }, items)
}
const unring = page => ring(page, [])
const boxOf = (page, sels) => page.evaluate(sels => {
  const rs = []
  for (const sel of sels) for (const e of document.querySelectorAll(sel)) { const r = e.getBoundingClientRect(); if (r.width > 0 && r.height > 0) rs.push(r) }
  if (!rs.length) return null
  return { x: Math.min(...rs.map(r => r.left)), y: Math.min(...rs.map(r => r.top)), r: Math.max(...rs.map(r => r.right)), b: Math.max(...rs.map(r => r.bottom)) }
}, sels)
async function strip(page, nm, y, h, vp, x = 0, w = vp.width) {
  let X = Math.max(0, Math.round(x)); const Y = Math.max(0, Math.round(y))
  if (X + Math.round(w) > vp.width) X = Math.max(0, vp.width - Math.round(w))
  await page.screenshot({ path: `${OUT}/${nm}.png`, clip: { x: X, y: Y, width: Math.min(Math.round(w), vp.width - X), height: Math.min(Math.round(h), vp.height - Y) } })
  made.push(nm); console.log('  ->', nm)
}
/* a picture of the region round the selectors; `top` is the room kept above for a tag */
async function around(page, nm, sels, vp, { pad = 16, top = 40, bottom = null, wide = false, minW = 0 } = {}) {
  const b = await boxOf(page, Array.isArray(sels) ? sels : [sels]); if (!b) throw new Error('around: nothing at ' + sels)
  const bt = bottom == null ? pad : bottom
  if (wide) return strip(page, nm, b.y - top, b.b - b.y + top + bt, vp)
  let px = pad; if (minW && b.r - b.x + px * 2 < minW) px = (minW - (b.r - b.x)) / 2
  await strip(page, nm, b.y - top, b.b - b.y + top + bt, vp, b.x - px, b.r - b.x + px * 2)
}
const center = (page, sel) => page.evaluate(sel => { const e = document.querySelector(sel); if (e) e.scrollIntoView({ block: 'center', inline: 'center' }) }, sel)
const settle = page => page.evaluate(() => { document.activeElement && document.activeElement.blur && document.activeElement.blur() })
const tryQ = async (label, fn) => { try { await fn() } catch (e) { console.log('SKIPPED', label, '—', e.message.split('\n')[0]) } }
const rect = (page, sel) => page.evaluate(sel => { const e = [...document.querySelectorAll(sel)].find(e => e.getBoundingClientRect().width); if (!e) return null; const r = e.getBoundingClientRect(); return [Math.round(r.left), Math.round(r.top), Math.round(r.right), Math.round(r.bottom)] }, sel)

/* ---- the app's own paths (as in the exploration pass) ---- */
async function openInputsList(page) {
  await page.evaluate(() => window.scrollTo(0, 0))
  await page.evaluate(() => window.go('inputs')); await sleep(900)
  const vis = async sel => { const l = page.locator(sel).first(); return (await l.count()) > 0 && await l.isVisible() }
  if (!(await vis(T('in-new'))) && await vis('#inMemberMode')) { await page.locator('#inMemberMode').first().click(); await sleep(600) }
  if (!(await vis(T('in-new'))) && await vis('#inListBtn')) { await page.locator('#inListBtn').first().click(); await sleep(600) }
  await page.waitForSelector(T('in-new'), { timeout: 5000 })
}
async function fillNew(page, { who, type, iso, remarks = null }) {
  await openInputsList(page)
  await page.locator(T('in-new')).first().click(); await page.waitForSelector(T('win-inputedit')); await sleep(500)
  await page.locator('#inpEditPerson').selectOption({ label: who })
  await page.locator('#inpEditType').selectOption(type); await sleep(300)
  if (remarks != null) await page.locator('#inpEditRmk').fill(remarks)
  await page.locator(`[data-testid="inpEdCal-day-${iso}"]`).first().click(); await sleep(200)
  await page.locator(`[data-testid="inpEdCal-day-${iso}"]`).first().click(); await sleep(200)
}
async function fileInput(page, o) {
  const before = await page.evaluate(() => (window.INPUTS || []).map(r => r.iid))
  await fillNew(page, o)
  await page.locator('#inpEditSave').click(); await sleep(1100)
  for (let i = 0; i < 4; i++) {
    const open = await page.evaluate(() => [...document.querySelectorAll('[data-testid="docconf"], [data-testid="oilconf"]')].filter(e => e.getBoundingClientRect().width).map(e => e.dataset.testid))
    if (!open.length) break
    if (open.includes('docconf')) await page.locator(T('docconf-nodoc')).first().click()
    else { await page.locator(T(o.oil === 'yes' ? 'oil-yes' : 'oil-no')).first().click(); await sleep(250); await page.locator(T('oilconf-save')).first().click() }
    await sleep(700)
  }
  const after = await page.evaluate(() => (window.INPUTS || []).map(r => r.iid))
  const fresh = after.filter(i => !before.includes(i))
  return fresh.length ? await page.evaluate(id => JSON.parse(JSON.stringify((window.INPUTS || []).find(r => r.iid === id))), fresh[0]) : null
}
async function goEdit(page) {
  if (await page.evaluate(() => window.CURPAGE === 'editsched')) { await page.evaluate(() => window.go('viewsched')); await sleep(400) }
  await page.evaluate(() => window.go('editsched')); await sleep(1400)
  await page.waitForSelector('#eWeek section.day[data-day="0"]', { state: 'attached', timeout: 8000 })
}
const bf = (di, gi, li, f) => `#schedBoard [data-bfld="ff:${di}.${gi}.${li}.${f}"]`
async function bType(p, sel, value) {
  const el = p.locator(sel + ':visible').first()
  await el.evaluate(e => e.scrollIntoView({ block: 'center' })); await sleep(120)
  await el.click(); await el.fill(''); await el.type(String(value), { delay: 8 }); await el.blur(); await sleep(250)
}
async function bPut(p, di, gi, li, ai, seat, prefs) {
  const slot = `#schedBoard [data-slot="${di}.${gi}.${li}.${ai}.${seat}"]:visible`
  for (let a = 0; a < 3; a++) {
    const el = p.locator(slot).first(); await el.evaluate(e => e.scrollIntoView({ block: 'center' })); await sleep(120)
    await el.click(); await sleep(250)
    for (const pid of prefs) {
      const pk = p.locator(`#sbRoster .rpuck[data-person="${pid}"]:visible`).first()
      if (!(await pk.count())) continue
      await pk.evaluate(e => e.scrollIntoView({ block: 'center' })); await sleep(100)
      try { await pk.click({ timeout: 2500 }) } catch { const b = await pk.boundingBox(); if (b) await p.mouse.click(b.x + b.width / 2, b.y + b.height / 2) }
      await sleep(400)
      const ok = await p.evaluate(([s, pid]) => [...document.querySelectorAll(s)].some(e => e.querySelector(`[data-person="${pid}"]`)), [`#schedBoard [data-slot="${di}.${gi}.${li}.${ai}.${seat}"]`, pid])
      if (ok) return pid
    }
    await p.keyboard.press('Escape')
  }
  return 'FAILED'
}
/* Insights' "Work hours" list: each man's figure, read off the open window */
async function openInsights(p) { await p.locator('#sbInsights').click(); await sleep(900) }
const insHours = (p, names) => p.evaluate(names => {
  const txt = document.body.innerText; const i = txt.indexOf('WORK HOURS'); const L = (i >= 0 ? txt.slice(i) : '').split('\n').map(x => x.trim())
  const out = {}; for (const n of names) { const k = L.indexOf(n); out[n] = k >= 0 ? L[k + 1] : null } return out
}, names)
const closeInsights = async p => { await p.keyboard.press('Escape'); await sleep(400) }

/* ==== q1 [SCHED-UNAV-PENDING-MARK] ==== */
if (want('q1')) await tryQ('q1', async () => {
  const A = await world(PC, false)
  const page = A.page
  await board(page, 2); const pub = await publish(page, 2); await closeBoard(page)
  const lv = await fileInput(page, { who: 'Bolt', type: 'LL', iso: '2026-07-15' })
  const mt = await fileInput(page, { who: 'Saint', type: 'Meeting', iso: '2026-07-15', remarks: 'Safety brief', oil: 'no' })
  console.log('q1 published', JSON.stringify(pub).slice(0, 80), '| LL', lv && lv.type, lv && lv.acc, '| meeting', mt && mt.type, mt && mt.acc)
  await goEdit(page)
  const D2 = '#eWeek section.day[data-day="2"]'
  await name(page, 'grow', '.pl-row.gr-frominput', 'Safety brief', D2)
  await name(page, 'gname', '[data-zz="grow"] .ntx[data-aln]')
  await name(page, 'unav', '.sec-unav', '', D2)
  await name(page, 'urow', '.sec-unav .pl-row', 'Bolt', D2)
  await name(page, 'uname', '[data-zz="urow"] .nm .ntx')
  await name(page, 'pend', '.dpend', '', D2)
  const m = await page.evaluate(([D2]) => {
    const s = document.querySelector(D2); const g = document.querySelector('[data-zz="gname"]'), u = document.querySelector('[data-zz="uname"]')
    const td = e => e ? getComputedStyle(e).textDecorationLine + ' ' + getComputedStyle(e).textDecorationStyle + ' ' + getComputedStyle(e).textDecorationColor : null
    return { head: (s.querySelector('[data-zz="pend"]') || {}).textContent, aln: s.querySelectorAll('[data-aln]').length,
      groundName: g && g.textContent.trim(), groundAln: g && g.dataset.aln, groundDeco: td(g),
      unavName: u && u.textContent.trim(), unavTag: u && u.tagName, unavAln: u ? (u.dataset.aln || null) : 'none', unavDeco: td(u),
      unavRowText: (document.querySelector('[data-zz="urow"]') || {}).innerText }
  }, [D2])
  console.log('q1 edit week', JSON.stringify(m)); measured.q1 = { pc: m }
  // the day's head: its count says 2 pending
  await center(page, D2 + ' [data-zz="pend"]'); await sleep(400); await settle(page)
  await ring(page, [{ sel: Z('pend'), tag: 'Counts both: the leave and the meeting', pos: 'below' }])
  { const b = await boxOf(page, [D2]); const pb = await boxOf(page, [Z('pend')]); await strip(page, 'q-unavmark-pc-head', b.y - 6, pb.b - b.y + 52, PC, b.x - 10, b.r - b.x + 20) }
  // the Ground Programme row: its name underlined, dotted, in AL1's cyan
  await center(page, Z('grow')); await sleep(400)
  await ring(page, [{ sel: Z('gname'), tag: 'Waiting to go out: name underlined', pos: 'above' }])
  await around(page, 'q-unavmark-pc-ground', [Z('grow')], PC, { top: 46, pad: 14 })
  // the Unavailable row: nothing on it
  await center(page, Z('urow')); await sleep(400)
  await ring(page, [{ sel: Z('uname'), tag: "No 'waiting' mark here", pos: 'above' }])
  await around(page, 'q-unavmark-pc-unav', [Z('unav')], PC, { top: 18, pad: 14 })
  // drawn A: the same underline the ground row's name wears (copied from its computed style)
  await page.evaluate(() => {
    const g = document.querySelector('[data-zz="gname"]'), u = document.querySelector('[data-zz="uname"]'); const cs = getComputedStyle(g)
    u.setAttribute('data-aln', g.dataset.aln || '1')
    u.style.textDecorationLine = 'underline'; u.style.textDecorationStyle = 'dotted'; u.style.textDecorationColor = cs.textDecorationColor
    u.style.textDecorationThickness = cs.textDecorationThickness; u.style.textUnderlineOffset = cs.textUnderlineOffset
  })
  await ring(page, [{ sel: Z('uname'), tag: 'Drawn: A, underlined as waiting', pos: 'above' }])
  await around(page, 'q-unavmark-pc-unav-A', [Z('unav')], PC, { top: 18, pad: 14 })
  // the Scheduler Board: the same two rows
  await tryQ('q1 board', async () => {
    await unring(page); await board(page, 2); await sleep(600)
    await name(page, 'bgrow', '#schedBoard .gr-frominput', 'Safety brief')
    if (!(await page.locator(Z('bgrow')).count())) await name(page, 'bgrow', '#schedBoard [class*=row]', 'Safety brief')
    await name(page, 'bunav', '#schedBoard .sb-panel.unav')
    await name(page, 'burow', '#schedBoard .sb-panel.unav .sb-arow', 'Bolt')
    await name(page, 'buname', '[data-zz="burow"] .sbi-ty')
    await name(page, 'bgppl', '[data-zz="bgrow"] .ppl'); await name(page, 'buppl', '[data-zz="burow"] .ppl')
    await name(page, 'bgname', '[data-zz="bgrow"] [data-aln]')
    const bm = await page.evaluate(() => {
      const g = document.querySelector('[data-zz="bgrow"]'), u = document.querySelector('[data-zz="burow"]'), gn = document.querySelector('[data-zz="bgname"]'), un = document.querySelector('[data-zz="buname"]')
      const ol = e => e ? getComputedStyle(e).outlineStyle + ' ' + getComputedStyle(e).outlineWidth + ' ' + getComputedStyle(e).outlineColor : null
      return { ground: g && { cls: g.className, aln: [...g.querySelectorAll('[data-aln]')].map(e => e.tagName + '.' + e.className.slice(0, 30) + '=' + e.dataset.aln), nameOutline: ol(gn) },
        unav: u && { cls: u.className, aln: [...u.querySelectorAll('[data-aln]')].length, name: un && un.tagName + ' ' + un.textContent.trim(), nameOutline: ol(un), text: u.innerText.replace(/\s+/g, ' ').slice(0, 80) } }
    })
    console.log('q1 board', JSON.stringify(bm)); measured.q1.board = bm
    const cropRow = async (nm, sel) => { const b = await boxOf(page, [sel]); await strip(page, nm, b.y - 46, b.b - b.y + 60, PC, b.x - 14, 940) }
    await center(page, Z('bgrow')); await sleep(400)
    await ring(page, [{ sel: Z('bgrow') }, { sel: Z('bgppl'), noring: true, tag: 'Waiting to go out: its name box dotted', pos: 'above' }])
    await cropRow('q-unavmark-pc-board-ground', Z('bgrow'))
    await center(page, Z('burow')); await sleep(400)
    await ring(page, [{ sel: Z('burow') }, { sel: Z('buppl'), noring: true, tag: "No 'waiting' mark here", pos: 'above' }])
    await around(page, 'q-unavmark-pc-board-unav', [Z('bunav')], PC, { top: 18, pad: 14 })
    // drawn A on the board: the name box's own dotted outline, as the Ground Programme row's name box wears it
    await page.evaluate(() => {
      const g = document.querySelector('[data-zz="bgname"]'), u = document.querySelector('[data-zz="buname"]'); const cs = getComputedStyle(g)
      u.style.outline =`${cs.outlineWidth} dotted ${cs.outlineColor}`; u.style.outlineOffset = cs.outlineOffset
    })
    await ring(page, [{ sel: Z('burow') }, { sel: Z('buppl'), noring: true, tag: 'Drawn: A, its name box dotted as waiting', pos: 'above' }])
    await around(page, 'q-unavmark-pc-board-unav-A', [Z('bunav')], PC, { top: 18, pad: 14 })
    await unring(page); await closeBoard(page)
  })
  const state = await A.ctx.storageState(); await A.ctx.close()
  // the phone, the same world
  const P = await world(PHONE, true, { state })
  await goEdit(P.page)
  const pp = P.page
  await name(pp, 'grow', '.pl-row.gr-frominput', 'Safety brief', D2)
  await name(pp, 'gname', '[data-zz="grow"] .ntx[data-aln]')
  await name(pp, 'unav', '.sec-unav', '', D2)
  await name(pp, 'urow', '.sec-unav .pl-row', 'Bolt', D2)
  await name(pp, 'uname', '[data-zz="urow"] .nm .ntx')
  await center(pp, Z('grow')); await sleep(900); await center(pp, Z('grow')); await sleep(600)
  measured.q1.phone = await pp.evaluate(() => ({ grow: !!document.querySelector('[data-zz="grow"]'), gAln: (document.querySelector('[data-zz="gname"]') || {}).dataset?.aln, uAln: (document.querySelector('[data-zz="uname"]') || {}).dataset?.aln || null }))
  console.log('q1 phone', JSON.stringify(measured.q1.phone))
  await ring(pp, [{ sel: Z('gname'), tag: 'Waiting: name underlined', pos: 'above' }])
  await around(pp, 'q-unavmark-ph-ground', [Z('grow')], PHONE, { top: 46, wide: true })
  await center(pp, Z('urow')); await sleep(700)
  await ring(pp, [{ sel: Z('uname'), tag: "No 'waiting' mark here", pos: 'above' }])
  await around(pp, 'q-unavmark-ph-unav', [Z('unav')], PHONE, { top: 18, wide: true })
  await pp.evaluate(() => {
    const g = document.querySelector('[data-zz="gname"]'), u = document.querySelector('[data-zz="uname"]'); const cs = getComputedStyle(g)
    u.setAttribute('data-aln', g.dataset.aln || '1')
    u.style.textDecorationLine = 'underline'; u.style.textDecorationStyle = 'dotted'; u.style.textDecorationColor = cs.textDecorationColor
    u.style.textDecorationThickness = cs.textDecorationThickness; u.style.textUnderlineOffset = cs.textUnderlineOffset
  })
  await ring(pp, [{ sel: Z('uname'), tag: 'Drawn: A, underlined as waiting', pos: 'above' }])
  await around(pp, 'q-unavmark-ph-unav-A', [Z('unav')], PHONE, { top: 18, wide: true })
  await P.ctx.close()
})

/* ==== q2 [READONLY-WEEK-WORDS] ==== */
const NOTE_A = "This week's saved copy could not be read, so it can't be shown here. It is kept as it was saved. Report it on the Help page."
const NOTE_B = "This week's saved copy could not be read, so it can't be shown here. It is kept as it was saved."
const REFUSE_A = 'Blocked: this week’s saved copy could not be read, so it can’t be edited. Nothing was saved.'
/* drawn: the refusal in the app's own grey "Blocked" note (D1667–D1669), built as ui/toast.ts blockedFace builds it */
const blockedNote = (page, msg) => page.evaluate(msg => {
  const t = document.querySelector('#toastEl'); if (!t) return false
  const i = msg.indexOf(':'); const lead = msg.slice(0, i + 1), rest = msg.slice(i + 1).trim()
  const sign = document.createElement('span'); sign.className = 'bk-sign'; sign.setAttribute('aria-hidden', 'true')
  const words = document.createElement('span'); words.className = 'bk-words'
  const b = document.createElement('b'); b.textContent = lead; words.appendChild(b)
  const r = document.createElement('span'); r.className = 'bk-rest'; r.textContent = ' ' + rest; words.appendChild(r)
  t.dataset.face = 'blocked'; t.replaceChildren(sign, words); t.style.borderColor = 'var(--edge-2)'; t.style.color = 'var(--ink)'; t.style.opacity = '1'
  return true
}, msg)
const swapText = (page, sel, has, to) => page.evaluate(([sel, has, to]) => {
  let n = 0
  for (const e of document.querySelectorAll(sel)) { const w = document.createTreeWalker(e, NodeFilter.SHOW_TEXT); const hits = []; while (w.nextNode()) if (w.currentNode.nodeValue.includes(has)) hits.push(w.currentNode); for (const t of hits) { t.nodeValue = to; n++ } }
  return n
}, [sel, has, to])
if (want('q2')) await tryQ('q2', async () => {
  const A = await world(PC, false)
  await board(A.page, 2); await publish(A.page, 2); await closeBoard(A.page)
  const keys = await A.page.evaluate(() => Object.keys(localStorage).filter(k => /weeks\/13-07-2026#2$/.test(k)))
  const st = await A.ctx.storageState(); await A.ctx.close()
  const wk = keys[0]; console.log('q2 damaging', wk)
  const init = { fn: k => { try { if (!sessionStorage.getItem('zzdone')) { localStorage.setItem(k, '{"broken'); sessionStorage.setItem('zzdone', '1') } } catch (e) {} }, arg: wk }
  const D = await world(PC, false, { state: st, toasts: true, init })
  const page = D.page
  await goEdit(page)
  const m = await page.evaluate(() => ({ notices: document.querySelectorAll('#eWeek .dprev-bar').length, days: document.querySelectorAll('#eWeek section.day').length, text: (document.querySelector('#eWeek .dprev-bar') || {}).innerText }))
  console.log('q2 notices', JSON.stringify(m)); measured.q2 = { pc: m }
  const D2 = '#eWeek section.day[data-day="2"]'
  await name(page, 'note', '.dprev-bar', '', D2)
  await name(page, 'day', 'section.day[data-day="2"]', '', '#eWeek')
  /* room under the notice for its tag: the day card clips what passes its edge (overflow hidden) */
  await page.evaluate(() => { document.querySelector('[data-zz="day"]').style.paddingBottom = '38px' })
  await center(page, Z('note')); await sleep(500)
  await ring(page, [{ sel: Z('note'), tag: 'Wrong reason: its saved copy will not read', pos: 'below' }])
  const crop = async nm => { const b = await boxOf(page, [D2]); const nb = await boxOf(page, [Z('note')]); await strip(page, nm, b.y - 6, nb.b - b.y + 50, PC, b.x - 10, b.r - b.x + 20) }
  await crop('q-readonly-pc-notice')
  await swapText(page, Z('note'), 'older version', NOTE_A)
  await ring(page, [{ sel: Z('note'), tag: 'Drawn: A', pos: 'below' }])
  await crop('q-readonly-pc-notice-A')
  await swapText(page, Z('note'), 'saved copy', NOTE_B)
  await ring(page, [{ sel: Z('note'), tag: 'Drawn: B', pos: 'below' }])
  await crop('q-readonly-pc-notice-B')
  await unring(page)
  /* (the board is not pictured: a damaged week's days carry no button to open it — measured; its guard, board.ts, prints
     the same sentence, so A or B changes it there too) */
  // the refusal: a Meeting for Saint on Thu 16 Jul, saved
  await fillNew(page, { who: 'Saint', type: 'Meeting', iso: '2026-07-16', remarks: 'Safety brief' })
  const shot = async (nm, tag, words) => {
    await page.locator('#inpEditSave').click(); await sleep(450)
    if (words) await blockedNote(page, words)
    const t = await page.evaluate(() => { const e = document.querySelector('#toastEl'); return e ? { text: e.innerText, cls: e.className, r: (r => [r.left, r.top, r.right, r.bottom].map(Math.round))(e.getBoundingClientRect()) } : null })
    console.log('q2 toast', JSON.stringify(t)); if (!words) measured.q2.toast = t
    await ring(page, [{ sel: '#toastEl', tag, pos: 'above' }])
    const b = await boxOf(page, ['#toastEl']); await strip(page, nm, b.y - 44, b.b - b.y + 60, PC, b.x - 30, b.r - b.x + 60)
    await unring(page)
  }
  await shot('q-readonly-pc-refusal', 'Same wrong reason when you file an input', null)
  await sleep(4500)
  await shot('q-readonly-pc-refusal-A', 'Drawn: A and B', REFUSE_A)
  measured.q2.windowStillOpen = await page.locator(T('win-inputedit')).count()
  await D.ctx.close()
  // the phone: the same damaged week
  const P = await world(PHONE, true, { state: st, init })
  await goEdit(P.page)
  await name(P.page, 'note', '.dprev-bar', '', D2)
  await P.page.evaluate(() => { document.querySelector('#eWeek section.day[data-day="2"]').style.paddingBottom = '38px' })
  await center(P.page, Z('note')); await sleep(900); await center(P.page, Z('note')); await sleep(500)
  measured.q2.phone = await P.page.evaluate(() => document.querySelectorAll('#eWeek .dprev-bar').length)
  const pcrop = async nm => { const nb = await boxOf(P.page, [Z('note')]); await strip(P.page, nm, nb.y - 150, nb.b - nb.y + 200, PHONE) }
  await ring(P.page, [{ sel: Z('note'), tag: 'Wrong reason: its saved copy will not read', pos: 'below' }])
  await pcrop('q-readonly-ph-notice')
  await swapText(P.page, Z('note'), 'older version', NOTE_A)
  await ring(P.page, [{ sel: Z('note'), tag: 'Drawn: A', pos: 'below' }])
  await pcrop('q-readonly-ph-notice-A')
  await P.ctx.close()
})

/* ==== q3 [LOGIC-WORDS-WORKHOURS] ==== */
const RALLY_B = 'An empty R box suggests take-off less this time, and "+ In-time" fills in the same time. With no in-time or rally entered, a flyer\'s OIL counts from here. His long day and Insights hours count from step. It also sets when the tight crew-rest advisory shows.'
const STEP_B_ADD = ' With no in-time or rally entered, a flyer\'s long day and Insights hours count from it too.'
async function logicShots(page, vp, tag) {
  await go(page, 'logic'); await sleep(600)
  const R = '.lgset[data-lgkey="reportLead"]', S = '.lgset[data-lgkey="step"]'
  /* room under each sentence for its tag, so the tag never covers the setting's own name */
  const room = q => page.evaluate(([q, px]) => { const e = document.querySelector(q); if (e) e.style.paddingBottom = px }, [q, vp === PC ? '40px' : '60px'])
  await room(R)
  await center(page, R + ' .lgwhy'); await sleep(400)
  const words = await page.evaluate(([R, S]) => ({ rally: document.querySelector(R + ' .lgwhy')?.innerText, step: document.querySelector(S + ' .lgwhy')?.innerText, value: document.querySelector(R + ' .lgv')?.innerText }), [R, S])
  console.log('q3 logic', tag, JSON.stringify(words)); (measured.q3 ||= {})['logic_' + tag] = words
  const crop = async nm => { if (vp === PC) await around(page, nm, [R, S], vp, { top: 34, pad: 12 }); else { const b = await boxOf(page, [R]); await strip(page, nm, b.y - 34, b.b - b.y + 50, vp) } }
  const cropStep = async nm => { const b = await boxOf(page, [S]); await strip(page, nm, b.y - 34, b.b - b.y + 50, vp) }
  const W = vp !== PC
  await ring(page, [{ sel: R + ' .lgwhy', tag: 'Not so today: the long day and Insights hours count from step', pos: 'below', wrap: W }])
  await crop(`q-logic-${tag}-today`)
  await page.evaluate(([R, S, rb, sa]) => {
    const r = document.querySelector(R + ' .lgwhy'); const mark = r.querySelector('.lgstd'); r.firstChild.nodeValue !== undefined && (r.childNodes[0].nodeValue = rb); if (mark) r.appendChild(mark)
    const s = document.querySelector(S + ' .lgwhy'); s.childNodes[0].nodeValue = s.childNodes[0].nodeValue + sa
  }, [R, S, RALLY_B, STEP_B_ADD])
  await room(S)
  await ring(page, [{ sel: R + ' .lgwhy', tag: 'Drawn: B, the words say what the app does', pos: 'below', wrap: W }, { sel: S + ' .lgwhy', tag: vp === PC ? 'Drawn: B, one sentence added' : '', pos: 'below' }])
  await center(page, R + ' .lgwhy'); await sleep(300)
  await crop(`q-logic-${tag}-B`)
  if (vp !== PC) { await center(page, S + ' .lgwhy'); await sleep(300); await ring(page, [{ sel: S + ' .lgwhy', tag: 'Drawn: B, one sentence added', pos: 'below' }]); await cropStep(`q-logic-${tag}-B-step`) }
  await unring(page)
}
if (want('q3')) await tryQ('q3', async () => {
  const A = await world(PC, false)
  const page = A.page
  await logicShots(page, PC, 'pc')
  // Fri 17 Jul: a new flying wave, its first line VL 12:00–13:00, Saint front seat, Echo back seat, nothing else entered
  await board(page, 4); await sleep(500)
  await openInsights(page); const before = await insHours(page, ['Saint', 'Echo']); await closeInsights(page)
  await page.locator('#schedBoard [data-wvadd="4"]:visible').first().click(); await sleep(500)
  await page.locator('button.wm[data-wmkind=""]:visible').first().click(); await sleep(800)
  await bType(page, bf(4, 0, 0, 'cs'), 'VL'); await bType(page, bf(4, 0, 0, 'to'), '12:00'); await bType(page, bf(4, 0, 0, 'ld'), '13:00')
  const put = [await bPut(page, 4, 0, 0, 0, 'p', ['salsa']), await bPut(page, 4, 0, 0, 0, 'w', ['freak'])]
  /* (no Escape here: with nothing armed it closes the board) */
  await sleep(300); await settle(page)
  const rl = await page.evaluate(sel => { const e = document.querySelector(sel); return e ? { value: e.value, ph: e.placeholder, cls: e.className } : null }, bf(4, 0, 0, 'rl'))
  const step = await page.evaluate(() => ({ step: window.VCONF.step, reportLead: window.VCONF.reportLead, debrief: window.VCONF.debrief, longDay: window.VCONF.longDay }))
  console.log('q3 seated', put, 'R box', JSON.stringify(rl), JSON.stringify(step))
  await name(page, 'line', '#schedBoard .sb-line', 'VL')
  if (!(await page.locator(Z('line')).count())) await name(page, 'line', '#schedBoard [data-bfld="ff:4.0.0.cs"]')
  await center(page, bf(4, 0, 0, 'rl')); await sleep(400)
  await name(page, 'rlcell', bf(4, 0, 0, 'rl'))
  console.log('q3 rl matches', JSON.stringify(await page.evaluate(sel => [...document.querySelectorAll(sel)].map(e => { const r = e.getBoundingClientRect(); return [e.tagName, e.className, Math.round(r.left), Math.round(r.top), Math.round(r.width), Math.round(r.height)] }), bf(4, 0, 0, 'rl'))), 'before', JSON.stringify(before))
  /* an input draws no ::before, so the tag hangs from the jet's line itself, under it, lined up with the R box */
  await page.evaluate(() => {
    const ln = document.querySelector('[data-zz="line"]'), rl = document.querySelector('[data-zz="rlcell"]')
    ln.style.setProperty('--zz-x', Math.round(rl.getBoundingClientRect().left - ln.getBoundingClientRect().left - 3) + 'px')
  })
  await ring(page, [{ sel: Z('rlcell') }, { sel: Z('line'), noring: true, tag: 'Suggests 09:00, but Insights counts Saint from 11:00', pos: 'belowAt' }])
  await around(page, 'q-logic-pc-board', [Z('line') + ', ' + bf(4, 0, 0, 'rl')], PC, { top: 50, bottom: 44, pad: 16 })
  await unring(page)
  await openInsights(page)
  const today = await insHours(page, ['Saint', 'Echo'])
  // Saint's row in Work hours: the .ibar rows after the "Work hours" heading, up to the next heading
  await page.evaluate(() => {
    const head = [...document.querySelectorAll('#insightBody .isec-h')].find(h => /^work hours/i.test(h.textContent.trim())); if (!head) return
    head.setAttribute('data-zz', 'whhead')
    let e = head.nextElementSibling
    while (e && !e.classList.contains('isec-h')) {
      if (e.classList.contains('ibar') && (e.querySelector('.nm') || {}).textContent?.trim() === 'Saint') {
        e.setAttribute('data-zz', 'whrow'); const v = e.querySelector('.v'); if (v) v.setAttribute('data-zz', 'whval'); break
      }
      e = e.nextElementSibling
    }
  })
  const ins = await page.evaluate(() => { const r = document.querySelector('[data-zz="whrow"]'); return r ? { html: r.outerHTML.slice(0, 700), bars: [...r.querySelectorAll('[style*="width"]')].map(e => e.getAttribute('style')) } : null })
  console.log('q3 insights row', JSON.stringify(ins))
  await center(page, Z('whrow')); await sleep(300)
  /* the tag hangs at the right of the list's heading, so it covers no other man's row */
  await ring(page, [{ sel: Z('whrow') }, { sel: Z('whhead'), noring: true, tag: `Saint ${today.Saint} today: his Friday counts from 11:00, take-off less step`, pos: 'headR' }])
  await around(page, 'q-logic-pc-insights', [Z('whhead'), Z('whrow')], PC, { top: 16, bottom: 30, pad: 30 })
  // drawn A: Friday from 09:00, the default rally: +2h for both men on the line, each row moved to its place in the
  // list (it runs longest first), so the drawing reads as the app would draw it
  await page.evaluate(([vals]) => {
    const hm = s => { const m = /^(\d+)h(\d\d)?$/.exec(s.trim()); return m ? +m[1] * 60 + +(m[2] || 0) : 0 }
    const head = document.querySelector('[data-zz="whhead"]')
    const rows = () => { const out = []; let e = head.nextElementSibling; while (e && !e.classList.contains('isec-h')) { if (e.classList.contains('ibar')) out.push(e); e = e.nextElementSibling } return out }
    for (const [name, from, to, tagz] of vals) {
      const r = rows().find(e => (e.querySelector('.nm') || {}).textContent?.trim() === name); if (!r) continue
      r.setAttribute('data-zz', tagz)
      const v = r.querySelector('.v'); if (v) v.textContent = to
      for (const b of r.querySelectorAll('[style*="width"]')) { const w = b.style.width; if (/%$/.test(w)) b.style.width = (parseFloat(w) * hm(to) / hm(from)).toFixed(2) + '%'; else if (/px$/.test(w)) b.style.width = (parseFloat(w) * hm(to) / hm(from)).toFixed(1) + 'px' }
      const others = rows().filter(e => e !== r)
      const before = others.find(e => hm((e.querySelector('.v') || {}).textContent || '0h') < hm(to))
      if (before) before.parentNode.insertBefore(r, before)
    }
  }, [[['Saint', today.Saint, '18h30', 'whrow'], ['Echo', today.Echo, '27h25', 'whrow2']]])
  await ring(page, [{ sel: Z('whrow') }, { sel: Z('whrow2') }, { sel: Z('whhead'), noring: true, tag: 'Drawn: A, Saint and Echo from 09:00 on Friday: +2h each', pos: 'headR' }])
  await around(page, 'q-logic-pc-insights-A', [Z('whhead'), Z('whrow'), Z('whrow2')], PC, { top: 16, bottom: 30, pad: 30 })
  await unring(page); await closeInsights(page)
  // what A would count: the R box typed at the default rally
  await bType(page, bf(4, 0, 0, 'rl'), '09:00'); await sleep(300)
  await openInsights(page); const withR = await insHours(page, ['Saint', 'Echo']); await closeInsights(page)
  const lines = await page.evaluate(() => { const W0 = window.WARN || []; const W = Array.isArray(W0) ? W0 : Object.values(W0).flat(); return W.filter(w => w.di === 4 || w.d === 4).map(w => (w.code || w.k || '') + ':' + (w.msg || w.t || '').slice(0, 60)).slice(0, 12) })
  measured.q3.board = { before, today, withRTypedAtDefault: withR, rbox: rl, vconf: step, warnsFri: lines }
  console.log('q3 hours', JSON.stringify(measured.q3.board))
  await A.ctx.close()
  const P = await world(PHONE, true)
  await logicShots(P.page, PHONE, 'ph')
  await P.ctx.close()
})

/* ==== q4 [INP-ADD-RIGHT] ==== */
const ROOM = 'calc(min(430px, 100vw - 24px) + 16px)'
if (want('q4')) await tryQ('q4', async () => {
  const A = await world(PC, false)
  const page = A.page
  await openInputsList(page); await settle(page)
  const m = { listtools: await rect(page, '.inputs-listtools'), inNew: await rect(page, '#inNew'), range: await rect(page, '.inrange'), table: await rect(page, '#intbl'),
    display: await page.evaluate(() => getComputedStyle(document.querySelector('.inputs-listtools')).display) }
  const H = 470
  /* the tag clear of the dates button beside it */
  await page.evaluate(() => { const b = document.querySelector('#inNew'), r = document.querySelector('.inrange'); b.style.setProperty('--zz-x', Math.round(r.getBoundingClientRect().right - b.getBoundingClientRect().right + 14) + 'px') })
  await ring(page, [{ sel: '#inNew', tag: 'At the left; its window opens at the right', pos: 'rightAt' }])
  await strip(page, 'q-addright-pc-list', 56, H, PC)
  await unring(page)
  await page.locator('#inNew').click(); await sleep(900)
  m.window = await rect(page, T('win-inputedit'))
  await ring(page, [{ sel: T('win-inputedit'), tag: 'Covers the list’s right columns', pos: 'left' }])
  await strip(page, 'q-addright-pc-listopen', 56, 808, PC)
  // drawn: copied from the Medical tab: the button after a spacer at the row's right end, the list making room
  await unring(page)
  await page.evaluate(room => {
    const row = document.querySelector('.inputs-listtools'), b = document.querySelector('#inNew')
    const sp = document.createElement('span'); sp.style.flex = '1'; sp.className = 'zz-spacer'; row.appendChild(sp); row.appendChild(b)
    document.querySelector('.inwrap').style.paddingRight = room
  }, ROOM)
  await sleep(300)
  m.drawnOpen = { inNew: await rect(page, '#inNew'), table: await rect(page, '#intbl'), wrapPad: await page.evaluate(() => getComputedStyle(document.querySelector('.inwrap')).paddingRight) }
  /* a table draws no ::before: the tag hangs from the list's wrapper, in the free middle of the row above it */
  await page.evaluate(() => { const w = document.querySelector('.inwrap'), r = document.querySelector('.inrange'); w.style.setProperty('--zz-x', Math.round(r.getBoundingClientRect().right - w.getBoundingClientRect().left + 24) + 'px'); const rr = r.getBoundingClientRect(); w.style.setProperty('--zz-y', Math.round(w.getBoundingClientRect().top - (rr.top + rr.bottom) / 2 - 11) + 'px') })
  await ring(page, [{ sel: '.inwrap', tag: 'Drawn: the list makes room, as the Medical tab; + Input sits under the window, as + Medical does', pos: 'aboveAt', noring: true }, { sel: T('win-inputedit') }])
  await strip(page, 'q-addright-pc-listopen-A', 56, 808, PC)
  await unring(page)
  await page.keyboard.press('Escape'); await sleep(600)
  await page.evaluate(() => { const w = document.querySelector('.inwrap'); if (w) w.style.paddingRight = '' })
  const still = await page.evaluate(() => !!document.querySelector('.inputs-listtools > .zz-spacer') && document.querySelector('.inputs-listtools').lastElementChild?.id)
  if (still !== 'inNew') await page.evaluate(() => { const row = document.querySelector('.inputs-listtools'), b = document.querySelector('#inNew'); if (!row.querySelector('.zz-spacer')) { const sp = document.createElement('span'); sp.style.flex = '1'; sp.className = 'zz-spacer'; row.appendChild(sp) } row.appendChild(b) })
  await sleep(300); m.drawnClosed = { inNew: await rect(page, '#inNew') }
  await ring(page, [{ sel: '#inNew', tag: 'Drawn: + Input at the right, as + Medical', pos: 'left' }])
  await strip(page, 'q-addright-pc-list-A', 56, H, PC)
  await unring(page)
  // the Medical tab today
  await page.locator('#inMedBtn').click(); await sleep(900)
  m.medNew = await rect(page, '#medNew'); m.medHead = await rect(page, '.medview .ic-head')
  await ring(page, [{ sel: '#medNew', tag: 'Medical: + Medical at the right (his D1300)', pos: 'left' }])
  await strip(page, 'q-addright-pc-med', 56, H, PC)
  await unring(page)
  await page.locator('#medNew').click(); await sleep(900)
  m.medWindow = await rect(page, T('win-inputedit')); m.medPad = await page.evaluate(() => getComputedStyle(document.querySelector('.med-body')).paddingRight)
  await ring(page, [{ sel: '.med-body', tag: 'The cards make room for the window', pos: 'inTop' }])
  await strip(page, 'q-addright-pc-medopen', 56, 808, PC)
  await unring(page)
  measured.q4 = { pc: m }; console.log('q4 pc', JSON.stringify(m))
  await A.ctx.close()
  // the phone: "+ Input" and "+ Medical" both first in their rows
  const P = await world(PHONE, true)
  await openInputsList(P.page); await settle(P.page)
  measured.q4.phone = { inNew: await rect(P.page, '#inNew') }
  await ring(P.page, [{ sel: '#inNew', tag: 'Phone: first in its row', pos: 'below' }])
  await strip(P.page, 'q-addright-ph-list', 0, 330, PHONE)
  await unring(P.page)
  await P.page.locator('#inMedBtn').click(); await sleep(900)
  measured.q4.phone.medNew = await rect(P.page, '#medNew')
  await ring(P.page, [{ sel: '#medNew', tag: 'Phone: + Medical first too', pos: 'below' }])
  await strip(P.page, 'q-addright-ph-med', 0, 330, PHONE)
  await P.ctx.close()
  console.log('q4 phone', JSON.stringify(measured.q4.phone))
})

writeFileSync(MEAS, JSON.stringify(measured, null, 1))
console.log('made', made.length, made.join(' '))
await browser.close()
