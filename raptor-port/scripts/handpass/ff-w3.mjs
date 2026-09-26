/* Walker W3 — [CROWD-SWAP-SAYS-BUSY] (the five-flags batch, 26 Sep 26): "already on" when a man is moved inside his own
   row. Fable's scenarios F1–F6 and F20, and §2.3's five consumers of the busy check (the drag caption, the drop toast,
   the armed palette's strike / reason / "N free", the palette tap's toast, the green "where can he go" rings).
   Drives the PRODUCTION build already served at http://localhost:4176 (never rebuilds). Every fixture is made through
   the app's own controls (+ Item, + Row, + Line, typed times, the palette); window.* is READ for the tables only.
   Every check asserts the RIGHT behaviour (PASS = correct), so re-running this IS the re-walk.
   Usage, from raptor-port/:  node scripts/handpass/ff-w3.mjs [part ...]
     parts: f4d f4p f2d f2p f3 f5 f6 f1a f1b f1c f1d f1e f20   (none = all)
   Pictures: docs/img/handpass/2026-09-26-five-flags/w3/ · every check prints PASS / FAIL / NOTE; W3_RESULTS=<folder> also writes JSON */
process.env.HP_URL = 'http://localhost:4176'
const SHOTS = process.env.FF_SHOTS || 'C:/Users/User/projects/Raptor/.claude/worktrees/five-flags-batch-build-ef7d85/raptor-port/docs/img/handpass/2026-09-26-five-flags/w3'
process.env.HP_SHOTS = SHOTS
const L = await import('./am/am-lib.mjs')
const W = await import('./am/w1-lib.mjs')
const { login, editWeek, board, closeBoard, signDay, publishDay, head, BASE } = L
const { toastSpy, toasts, boardType, shotBox, norm } = W
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { chromium } from '@playwright/test'

const DESK = { width: 1440, height: 900 }, PHONE = { width: 390, height: 844 }
const MON = 0
const RANGER = 'bane', REAPER = 'dice', SABER = 'stiff'
/* a swap of two men INSIDE one Common Programme crowd leaves the list's members the same and changes their order: the
   amendment batch's settled counting (list place, one "order changed" item — docs/handpass/2026-09-25-amendment-batch.md,
   re-walk A) reads it as ONE pending change. Fable's F4 wrote 2 from D109 ("a swap of two men is two moves"), which is
   about two different places; the walker asserts the shipped counting and reports the difference as a note. */
const SWAPN = 1

/* ---------- bookkeeping ---------- */
let RES = [], PART = ''
function check(id, ok, what, detail = '', pic = '') {
  RES.push({ part: PART, id, ok: !!ok, what, detail: typeof detail === 'string' ? detail : JSON.stringify(detail), pic })
  console.log(`${ok ? 'PASS' : 'FAIL'} ${id} — ${what}${detail ? ' | ' + (typeof detail === 'string' ? detail : JSON.stringify(detail)) : ''}${pic ? ' [' + pic + ']' : ''}`.slice(0, 1600))
  return !!ok
}
function note(id, what, detail = '', pic = '') {
  RES.push({ part: PART, id, ok: null, what, detail: typeof detail === 'string' ? detail : JSON.stringify(detail), pic })
  console.log(`NOTE ${id} — ${what}${detail ? ' | ' + (typeof detail === 'string' ? detail : JSON.stringify(detail)) : ''}${pic ? ' [' + pic + ']' : ''}`.slice(0, 1600))
}

/* ---------- a fresh demo world (a fresh browser context), desktop or phone ---------- */
async function openW({ phone = false, dpr = 1, who = 'a' } = {}) {
  const CH = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
  mkdirSync(SHOTS, { recursive: true })
  const browser = await chromium.launch({ headless: true, ...(existsSync(CH) ? { executablePath: CH } : {}) })
  const ctx = await browser.newContext({ viewport: phone ? PHONE : DESK, deviceScaleFactor: dpr, ...(phone ? { hasTouch: true } : {}) })
  const page = await ctx.newPage()
  const errors = []
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()) })
  page.on('pageerror', e => errors.push('PAGEERROR ' + e.message))
  page.on('response', r => { if (r.status() >= 400) errors.push('HTTP ' + r.status() + ' ' + r.url()) })
  await page.goto(BASE + '/')
  await page.addStyleTag({ content: '*{scroll-behavior:auto !important}' })
  await login(page, who)
  await toastSpy(page)
  const cdp = phone ? await ctx.newCDPSession(page) : null
  return { browser, ctx, page, errors, cdp, phone }
}
async function reloadW(w) {
  await w.page.reload(); await w.page.waitForTimeout(900)
  if (await w.page.locator('#luser:visible').count()) await login(w.page, 'a')
  await w.page.addStyleTag({ content: '*{scroll-behavior:auto !important}' })
  await toastSpy(w.page)
}
const pic = async (page, name) => { const f = `${SHOTS}/${name}.png`; await page.screenshot({ path: f }); return `${name}.png` }
const boxPic = async (page, name, sel, anc = null, o = {}) => { const f = await shotBox(page, name, sel, anc, o); return f ? `${name}.png` : `(${name}: not found)` }

/* ---------- reads ---------- */
const crowd = (page, di, ri) => page.evaluate(([d, r]) => { const a = window.DAYS[d].allhands[r]; const w = Array.isArray(a.who) ? a.who : (a.who ? [a.who] : []); return w.filter(Boolean) }, [di, ri])
const cs = (page) => page.evaluate(() => Object.fromEntries(Object.entries(window.PEOPLE).map(([k, p]) => [k, p.cs])))
/* the day's warning list as the engine holds it (what the side list draws) */
const warnsOf = (page, di) => page.evaluate(d => (window.WARN.all || []).filter(w => w.di === d).map(w => `${w.sev}|${w.code}|${(w.who || []).join(',')}|${w.msg}`), di)
const allWarns = (page) => page.evaluate(() => (window.WARN.all || []).map(w => `${w.di}|${w.sev}|${w.code}|${(w.who || []).join(',')}|${w.msg}`))
const pendingOn = async (page, di) => norm((await head(page, di))?.pending || '')
const pnum = s => { const m = /(\d+)/.exec(String(s || '')); return m ? +m[1] : 0 }

/* the armed palette's answer for one man: struck? what reason? printed where? and his column's "N free" */
async function palette(page, pid) {
  return page.evaluate(id => {
    const vis = e => !!(e && (e.offsetWidth || e.offsetHeight))
    const r = document.querySelector('#sbRoster'); if (!r) return { found: false, why: 'no #sbRoster' }
    const p = r.querySelector(`.rpuck[data-person="${id}"]`); if (!p) return { found: false }
    const col = p.closest('.rcol, .rall')
    const pucks = col ? [...col.querySelectorAll('.rpuck')] : []
    const line = p.querySelector('.rwhy'), colLine = col && col.querySelector(':scope > .rwhy')
    const lr = line && line.getBoundingClientRect(), dr = r.getBoundingClientRect()
    return {
      found: true, visible: vis(p), no: p.classList.contains('no'), cls: p.className, why: p.getAttribute('data-why') || '',
      line: line ? line.textContent : '', lineVisible: vis(line), colLine: colLine ? colLine.textContent : '',
      lineClipped: line ? (line.scrollWidth > line.clientWidth + 1 || lr.right > Math.min(innerWidth, dr.right) + 1 || lr.left < -1) : null,
      head: col ? ((col.querySelector('.rh, .rh2') || {}).textContent || '') : '',
      freeCounted: pucks.filter(e => !e.classList.contains('no')).length, total: pucks.length, pos: pucks.indexOf(p),
      title: p.getAttribute('title') || '', drawerOpen: document.body.classList.contains('ros-open'),
      armed: window.ARM ? window.ARM.key : null,
    }
  }, pid)
}
const headFree = s => { const m = /·\s*(\d+)\s*free/.exec(String(s || '')); return m ? +m[1] : null }

/* ---------- gestures, through the app's own controls ---------- */
/* tap a board button (the + Item / + Row / + Line / ⓘ / Undo) */
async function press(page, sel) {
  const b = page.locator(`#schedBoard ${sel}:visible`).first()
  await b.evaluate(e => e.scrollIntoView({ block: 'center' })); await page.waitForTimeout(150)
  await b.click(); await page.waitForTimeout(450)
}
/* arm a people cell's "+ add" (the board's own tap) */
async function armFill(page, fill, root = '#schedBoard') {
  const z = page.locator(`${root} [data-fill="${fill}"] .addz:visible`).first()
  if (!(await z.count())) return 'NO +add for ' + fill
  await z.evaluate(e => e.scrollIntoView({ block: 'center' })); await page.waitForTimeout(200)
  const b = await z.boundingBox(); await page.mouse.click(b.x + b.width / 2, b.y + b.height / 2); await page.waitForTimeout(400)
  return page.evaluate(() => window.ARM && window.ARM.key)
}
/* arm an empty seat (a flying seat, a sim seat) by tapping it */
async function armSeat(page, slot) {
  const s = page.locator(`#schedBoard [data-slot="${slot}"]:visible`).first()
  if (!(await s.count())) return 'NO seat ' + slot
  await s.evaluate(e => e.scrollIntoView({ block: 'center' })); await page.waitForTimeout(200)
  const b = await s.boundingBox(); await page.mouse.click(b.x + b.width / 2, b.y + b.height / 2); await page.waitForTimeout(400)
  return page.evaluate(() => window.ARM && window.ARM.key)
}
/* tap a name in the palette (plants him into whatever is armed) */
async function tapName(page, pid) {
  const p = page.locator(`#sbRoster .rpuck[data-person="${pid}"]`).first()
  await p.evaluate(e => e.scrollIntoView({ block: 'center' })); await page.waitForTimeout(150)
  const b = await p.boundingBox(); if (!b) return 'no box'
  await page.mouse.click(b.x + Math.min(b.width / 2, 20), b.y + b.height / 2); await page.waitForTimeout(600)
  return 'tapped'
}
async function plant(page, fill, pid) { const a = await armFill(page, fill); const t = await tapName(page, pid); return `${a} → ${t}` }

/* A drag the way a person does it — press, lift past the slop, travel, HOLD over the target and read what the screen
   says under the ghost, then let go. A target off-screen is reached with the app's own edge auto-scroll.
   Mouse on the desktop; a real finger (CDP touch: press, hold past the 180ms, travel, lift) on the phone. */
async function dragRead(w, src, dst, name, { touch = false, at = null } = {}) {
  const { page, cdp } = w
  if (!(await src.count())) return { error: 'no source' }
  if (!(await dst.count())) return { error: 'no target' }
  const vh = page.viewportSize().height
  /* bring the pair on screen: the upper one near the top of its scroll box */
  const sh = await src.elementHandle(), th = await dst.elementHandle()
  await page.evaluate(([g, t]) => {
    const up = g.getBoundingClientRect().top <= t.getBoundingClientRect().top ? g : t
    up.scrollIntoView({ block: 'start', inline: 'nearest' })
    let n = g, box = null
    while (n && n !== document.body) { const oy = getComputedStyle(n).overflowY
      if ((oy === 'auto' || oy === 'scroll') && n.scrollHeight > n.clientHeight + 1) { box = n; break } n = n.parentElement }
    const top = box ? box.getBoundingClientRect().top : 0
    const d = up.getBoundingClientRect().top - (top + 140)
    if (box) box.scrollTop += d; else window.scrollBy(0, d)
  }, [sh, th])
  await page.waitForTimeout(300)
  const a = await src.boundingBox()
  const ax = a.x + a.width / 2, ay = a.y + a.height / 2
  const tpt = async () => { const b = await dst.boundingBox(); return at ? at(b) : { x: b.x + Math.min(b.width / 2, 30), y: b.y + Math.min(b.height / 2, 9) } }
  const down = async (x, y) => touch ? cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y, id: 7 }] }) : (page.mouse.move(x, y).then(() => page.mouse.down()))
  const move = async (x, y) => touch ? cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x, y, id: 7 }] }) : page.mouse.move(x, y)
  const up = async () => touch ? cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }) : page.mouse.up()
  await down(ax, ay)
  if (touch) await page.waitForTimeout(320)                       // the finger's hold (180ms) arms the drag
  await move(ax + 2, ay + 5); await page.waitForTimeout(40)
  await move(ax + 4, ay + 9); await page.waitForTimeout(60)
  let t = await tpt()
  if (t.y < 70 || t.y > vh - 70) {                                 // hold in the edge band: the app scrolls the target in
    const ey = t.y > vh - 70 ? vh - 18 : 18
    for (let i = 0; i < 8; i++) { await move(ax + (t.x - ax) * i / 8, ay + (ey - ay) * i / 8); await page.waitForTimeout(16) }
    for (let i = 0; i < 500; i++) { t = await tpt(); if (t.y > 110 && t.y < vh - 110) break; await move(t.x, ey + (i % 2 ? 1 : -1)); await page.waitForTimeout(22) }
  }
  t = await tpt()
  const s0 = { x: ax + 4, y: ay + 9 }
  for (let i = 1; i <= 12; i++) { await move(s0.x + (t.x - s0.x) * i / 12, s0.y + (t.y - s0.y) * i / 12); await page.waitForTimeout(touch ? 20 : 8) }
  await page.waitForTimeout(200)
  const hover = await page.evaluate(() => {
    const g = document.querySelector('.dragimg, .tdghost'), c = g && g.querySelector('.dwhy')
    const ov = document.querySelector('.dragover'), ow = document.querySelector('.dragover-why')
    const k = e => e ? (e.dataset.slot || e.dataset.fill || e.className.slice(0, 30)) : null
    return { ghost: g ? g.className.split(' ')[0] : null, caption: c ? c.textContent : '', over: k(ov), overWhy: k(ow) }
  })
  const shotName = await pic(page, name)
  await up(); await page.waitForTimeout(900)
  return { ...hover, pic: shotName }
}

/* the day's pending list, opened from the head's own button */
async function pendList(page, di, root) {
  const b = page.locator(`${root} [data-pendlist="${di}"]:visible`).first()
  if (!(await b.count())) return null
  await b.evaluate(e => e.scrollIntoView({ block: 'center' })); await page.waitForTimeout(150)
  await b.click(); await page.waitForTimeout(500)
  const r = await page.evaluate(() => { const p = document.querySelector('#pendList'); if (!p) return { open: false }
    return { open: true, head: (p.querySelector('.pl-head') || {}).innerText?.replace(/\s+/g, ' ').trim(), rows: [...p.querySelectorAll('.pl-item')].map(e => e.innerText.replace(/\s+/g, ' ').trim()) } })
  return r
}
const closePop = async (page) => { await page.keyboard.press('Escape'); await page.waitForTimeout(300) }
const sbUndo = async (page) => { await page.locator('#sbUndo:visible').first().click(); await page.waitForTimeout(700) }
const sbRedo = async (page) => { await page.locator('#sbRedo:visible').first().click(); await page.waitForTimeout(700) }
const busyToast = (ts, what = 'already on') => ts.filter(t => t.includes(what))

/* ============================================================================================================
   F4 — the reported swap, desktop: both directions, unpublished then published (D109: a swap is two moves),
   Undo / Redo / reload. Consumers walked: the drag caption (with the seat he is dragged from), the drop toast.
   ============================================================================================================ */
async function f4d() {
  const w = await openW(), { page, errors } = w
  try {
    await board(page, MON)
    const pl = await plant(page, `a:${MON}.2.+`, REAPER)
    const c0 = await crowd(page, MON, 2)
    const t0 = await toasts(page)
    check('F4d-0', c0.join() === [RANGER, REAPER].join(), 'fixture: FLIGHT SAFETY STAND-DOWN holds Ranger then Reaper (+ add, palette tap)', { pl, c0, t0 }, await boxPic(page, 'f4d-00-fixture-crowd', `#schedBoard [data-fill="a:${MON}.2.+"]`, '.sb-arow'))
    const w0 = await warnsOf(page, MON)

    // (1) Reaper onto Ranger — unpublished
    let h = await dragRead(w, page.locator(`#schedBoard [data-slot="a:${MON}.2.1"] .puck:visible`).first(), page.locator(`#schedBoard [data-slot="a:${MON}.2.0"]:visible`).first(), 'f4d-01-hover-reaper-onto-ranger')
    let c1 = await crowd(page, MON, 2), t1 = await toasts(page), w1 = await warnsOf(page, MON)
    check('F4d-1a', h.ghost && !h.caption, 'unpublished · Reaper dragged onto Ranger: nothing printed under the ghost', h, h.pic)
    check('F4d-1b', c1.join() === [REAPER, RANGER].join(), 'the two swap places', c1, await boxPic(page, 'f4d-02-after-swap', `#schedBoard [data-fill="a:${MON}.2.+"]`, '.sb-arow'))
    check('F4d-1c', !busyToast(t1).length, 'no "already on" toast after the drop', t1)
    check('F4d-1d', JSON.stringify(w1) === JSON.stringify(w0), 'Monday\'s warning list unchanged by the swap', { added: w1.filter(x => !w0.includes(x)), gone: w0.filter(x => !w1.includes(x)) })
    await sbUndo(page)
    check('F4d-1e', (await crowd(page, MON, 2)).join() === [RANGER, REAPER].join(), 'the board\'s Undo puts them back', await crowd(page, MON, 2))
    await toasts(page)

    // (2) Ranger onto Reaper — unpublished, the other direction
    h = await dragRead(w, page.locator(`#schedBoard [data-slot="a:${MON}.2.0"] .puck:visible`).first(), page.locator(`#schedBoard [data-slot="a:${MON}.2.1"]:visible`).first(), 'f4d-03-hover-ranger-onto-reaper')
    c1 = await crowd(page, MON, 2); t1 = await toasts(page)
    check('F4d-2a', h.ghost && !h.caption, 'unpublished · Ranger dragged onto Reaper: nothing under the ghost', h, h.pic)
    check('F4d-2b', c1.join() === [REAPER, RANGER].join() && !busyToast(t1).length, 'they swap, no busy toast', { c1, t1 })
    await sbUndo(page); await toasts(page)

    // the same swap on the EDIT WEEK (the other surface that draws the crowd), undone by the page's Undo
    await closeBoard(page); await editWeek(page)
    h = await dragRead(w, page.locator(`#eWeek [data-slot="a:${MON}.2.1"] .puck:visible`).first(), page.locator(`#eWeek [data-slot="a:${MON}.2.0"]:visible`).first(), 'f4d-03w-week-hover-reaper-onto-ranger')
    c1 = await crowd(page, MON, 2); t1 = await toasts(page)
    check('F4d-W', h.ghost && !h.caption && c1.join() === [REAPER, RANGER].join() && !busyToast(t1).length, 'edit week · Reaper dragged onto Ranger: nothing under the ghost, they swap, no busy toast', { h, c1, t1 }, h.pic)
    await page.locator('#undoBtn:visible').first().click(); await page.waitForTimeout(700); await toasts(page)
    check('F4d-Wu', (await crowd(page, MON, 2)).join() === [RANGER, REAPER].join(), 'the page Undo puts them back', await crowd(page, MON, 2))
    // publish Monday through the day's own controls
    const sg = await signDay(page, MON, 0), pb = await publishDay(page, MON)
    const hp = await head(page, MON)
    check('F4d-P', pb.pressed && /ORIG/.test(hp.tag) && pnum(hp.pending) === 0, 'Monday published (signed, Publish day) — ORIG, nothing pending', { sg, pb, tag: hp.tag, pend: norm(hp.pending) })
    await toasts(page)
    await board(page, MON)

    // (3) Reaper onto Ranger — published
    h = await dragRead(w, page.locator(`#schedBoard [data-slot="a:${MON}.2.1"] .puck:visible`).first(), page.locator(`#schedBoard [data-slot="a:${MON}.2.0"]:visible`).first(), 'f4d-04-hover-published-reaper-onto-ranger')
    c1 = await crowd(page, MON, 2); t1 = await toasts(page)
    let pend = await pendingOn(page, MON)
    check('F4d-3a', h.ghost && !h.caption, 'published · Reaper onto Ranger: nothing under the ghost', h, h.pic)
    check('F4d-3b', c1.join() === [REAPER, RANGER].join() && !busyToast(t1).length, 'they swap, no busy toast', { c1, t1 })
    check('F4d-3c', pnum(pend) === SWAPN, `the head reads ${SWAPN} pending (a swap INSIDE one crowd is one "order changed" — the amendment batch's list-place rule; Fable's F4 expected 2 from D109, see the note)`, pend, await boxPic(page, 'f4d-05-published-head-pending', '#schedBoard .dpend'))
    let pl2 = await pendList(page, MON, '#schedBoard')
    const lp = await pic(page, 'f4d-06-pending-list')
    check('F4d-3d', pl2 && pl2.rows.length === SWAPN && pl2.rows.every(r => /FLIGHT SAFETY STAND-DOWN/.test(r) && /order changed/.test(r)), 'the pending list agrees with the head: one line, "FLIGHT SAFETY STAND-DOWN … order changed"', pl2, lp)
    note('F4d-3n', 'expectation difference, not a defect by the record: Fable\'s F4 said "2 pending (D109: a swap is two moves)"; the shipped count is 1, one "order changed" line — the amendment batch\'s list-place rule (a list whose members are unchanged and whose order differs is ONE item), already on main. D109\'s reading speaks of two places; whether a swap inside one crowd should read 1 or 2 is the owner\'s call if he reads D109 the other way', { head: pend, list: pl2 && pl2.rows })
    await closePop(page)
    await sbUndo(page)
    pend = await pendingOn(page, MON)
    check('F4d-3e', (await crowd(page, MON, 2)).join() === [RANGER, REAPER].join() && pnum(pend) === 0, 'Undo → back, 0 pending', { crowd: await crowd(page, MON, 2), pend })
    await sbRedo(page)
    pend = await pendingOn(page, MON)
    check('F4d-3f', (await crowd(page, MON, 2)).join() === [REAPER, RANGER].join() && pnum(pend) === SWAPN, 'Redo → swapped again, pending as before', { crowd: await crowd(page, MON, 2), pend }, await boxPic(page, 'f4d-07-after-redo', `#schedBoard [data-fill="a:${MON}.2.+"]`, '.sb-arow'))
    await sbUndo(page); await toasts(page)

    // (4) Ranger onto Reaper — published, the other direction
    h = await dragRead(w, page.locator(`#schedBoard [data-slot="a:${MON}.2.0"] .puck:visible`).first(), page.locator(`#schedBoard [data-slot="a:${MON}.2.1"]:visible`).first(), 'f4d-08-hover-published-ranger-onto-reaper')
    c1 = await crowd(page, MON, 2); t1 = await toasts(page); pend = await pendingOn(page, MON)
    check('F4d-4a', h.ghost && !h.caption, 'published · Ranger onto Reaper: nothing under the ghost', h, h.pic)
    check('F4d-4b', c1.join() === [REAPER, RANGER].join() && !busyToast(t1).length && pnum(pend) === SWAPN, 'they swap, no busy toast, the same pending count', { c1, t1, pend })
    const wP = await warnsOf(page, MON)
    check('F4d-4c', JSON.stringify(wP) === JSON.stringify(w0), 'the warning list is the same as before any swap', { added: wP.filter(x => !w0.includes(x)), gone: w0.filter(x => !wP.includes(x)) })

    // reload → holds
    await reloadW(w)
    await editWeek(page)
    const hw = await head(page, MON)
    await board(page, MON)
    pend = await pendingOn(page, MON)
    check('F4d-5', (await crowd(page, MON, 2)).join() === [REAPER, RANGER].join() && pnum(pend) === SWAPN && pnum(hw.pending) === SWAPN, 'after a reload the swap holds and the board and the week heads read the same count', { crowd: await crowd(page, MON, 2), board: pend, week: norm(hw.pending) }, await boxPic(page, 'f4d-09-after-reload', `#schedBoard [data-fill="a:${MON}.2.+"]`, '.sb-arow'))
  } catch (e) { check('F4d-CRASH', false, String(e && e.stack || e)) }
  check('F4d-ERR', !errors.length, 'browser error list empty (console, page errors, 4xx)', errors.slice(0, 6))
  await w.browser.close()
}

/* F4 on the PHONE with a real finger (CDP touch) — unpublished and published */
async function f4p() {
  const w = await openW({ phone: true, dpr: 2 }), { page, errors } = w
  try {
    await board(page, MON)
    const pl = await plant(page, `a:${MON}.2.+`, REAPER)
    const c0 = await crowd(page, MON, 2)
    await toasts(page)
    check('F4p-0', c0.join() === [RANGER, REAPER].join(), 'phone fixture: Ranger then Reaper on FLIGHT SAFETY (armed + add, the drawer\'s name tapped)', { pl, c0 }, await boxPic(page, 'f4p-00-phone-fixture', `#schedBoard [data-fill="a:${MON}.2.+"]`, '.sb-arow'))
    const w0 = await warnsOf(page, MON)
    let h = await dragRead(w, page.locator(`#schedBoard [data-slot="a:${MON}.2.1"] .puck:visible`).first(), page.locator(`#schedBoard [data-slot="a:${MON}.2.0"]:visible`).first(), 'f4p-01-phone-finger-hover-reaper-onto-ranger', { touch: true })
    let c1 = await crowd(page, MON, 2), t1 = await toasts(page)
    check('F4p-1a', h.ghost === 'puck' || /tdghost|puck/.test(String(h.ghost)), 'the finger drag armed (a ghost rides under the finger)', h, h.pic)
    check('F4p-1b', !h.caption, 'phone · Reaper onto Ranger: nothing under the finger', h.caption)
    check('F4p-1c', c1.join() === [REAPER, RANGER].join() && !busyToast(t1).length, 'they swap, no busy toast', { c1, t1 }, await boxPic(page, 'f4p-02-phone-after-swap', `#schedBoard [data-fill="a:${MON}.2.+"]`, '.sb-arow'))
    check('F4p-1d', JSON.stringify(await warnsOf(page, MON)) === JSON.stringify(w0), 'warning list unchanged', '')
    await sbUndo(page); await toasts(page)
    await closeBoard(page); await editWeek(page)
    await signDay(page, MON, 0); const pb = await publishDay(page, MON)
    await toasts(page)
    await board(page, MON)
    h = await dragRead(w, page.locator(`#schedBoard [data-slot="a:${MON}.2.0"] .puck:visible`).first(), page.locator(`#schedBoard [data-slot="a:${MON}.2.1"]:visible`).first(), 'f4p-03-phone-finger-hover-published-ranger-onto-reaper', { touch: true })
    c1 = await crowd(page, MON, 2); t1 = await toasts(page)
    const pend = await pendingOn(page, MON)
    check('F4p-2a', pb.pressed && !h.caption, 'published (on the phone) · Ranger onto Reaper by finger: nothing under the finger', { pb, h }, h.pic)
    check('F4p-2b', c1.join() === [REAPER, RANGER].join() && !busyToast(t1).length && pnum(pend) === SWAPN, 'they swap, no busy toast, the same pending count as the desktop', { c1, t1, pend }, await pic(page, 'f4p-04-phone-published-after-swap'))
  } catch (e) { check('F4p-CRASH', false, String(e && e.stack || e)) }
  check('F4p-ERR', !errors.length, 'browser error list empty', errors.slice(0, 6))
  await w.browser.close()
}

/* build "SAFETY WALK" on Monday's Common Programme through + Item and typed times; returns its row index */
async function safetyWalk(page, str = '0845', end = '0915') {
  await press(page, `[data-padd="${MON}"]`)
  const ri = await page.evaluate(() => window.DAYS[0].allhands.length - 1)
  await boardType(page, `ap:${MON}.${ri}.prog`, 'SAFETY WALK')
  await boardType(page, `ap:${MON}.${ri}.str`, str)
  await boardType(page, `ap:${MON}.${ri}.end`, end)
  const row = await page.evaluate(i => { const a = window.DAYS[0].allhands[i]; return `${a.prog}|${a.str}-${a.end}` }, ri)
  return { ri, row }
}

/* ============================================================================================================
   F2 — a man on ANOTHER overlapping programme row is offered as free (the second half of the promise).
   Consumers: the armed palette (strike, reason line, "N free"), the palette tap's toast, the warning list, the rings.
   ============================================================================================================ */
async function f2(phone) {
  const tag = phone ? 'F2p' : 'F2d', pf = phone ? 'f2p' : 'f2d'
  const w = await openW({ phone, dpr: phone ? 2 : 1 }), { page, errors } = w
  try {
    await board(page, MON)
    const sw = await safetyWalk(page)
    await toasts(page)
    note(`${tag}-0`, 'fixture: + Item → SAFETY WALK 08:45–09:15, empty; Ranger on FLIGHT SAFETY STAND-DOWN 08:30–09:00', sw)
    const armed = await armFill(page, `a:${MON}.${sw.ri}.+`)
    const pr = await palette(page, RANGER)
    const want = 'already on FLIGHT SAFETY STAND-DOWN 08:30–09:00'
    const pp = phone ? await pic(page, `${pf}-01-drawer-armed-ranger-struck`) : await boxPic(page, `${pf}-01-palette-armed-ranger-struck`, `#sbRoster .rpuck[data-person="${RANGER}"]`, '.rcol')
    check(`${tag}-1a`, armed === `a:${MON}.${sw.ri}.+` && pr.no && pr.why === want, 'SAFETY WALK armed: Ranger is struck with "already on FLIGHT SAFETY STAND-DOWN 08:30–09:00"', { armed, no: pr.no, why: pr.why }, pp)
    check(`${tag}-1b`, pr.lineVisible && pr.line === want && pr.lineClipped === false, 'the reason is PRINTED under his name, whole', { line: pr.line, vis: pr.lineVisible, clipped: pr.lineClipped, colLine: pr.colLine })
    check(`${tag}-1c`, headFree(pr.head) === pr.freeCounted && pr.no, 'the column\'s "N free" does not count him (head number = names not struck)', { head: pr.head, notStruck: pr.freeCounted, total: pr.total, pos: pr.pos })
    if (phone) check(`${tag}-1d`, pr.drawerOpen, 'on the phone the drawer opens as the picker', pr.drawerOpen)
    // tap him anyway → he plants, the toast says why, the list raises the clash, both his pucks ring red
    const wb = await warnsOf(page, MON)
    await tapName(page, RANGER)
    const t = await toasts(page)
    const onRows = { fs: await crowd(page, MON, 2), sw: await crowd(page, MON, sw.ri) }
    const wa = await warnsOf(page, MON)
    /* Ranger already carries one clash in the seed (VL BFM & Sim EP-4) — the NEW one is the one naming both rows */
    const clash = wa.filter(x => /\|DOUBLE_BOOK\|/.test(x) && x.includes(RANGER) && /FLIGHT SAFETY STAND-DOWN/.test(x) && /SAFETY WALK/.test(x))
    check(`${tag}-2a`, onRows.sw.includes(RANGER), 'tapping him anyway plants him (everything plants)', onRows)
    check(`${tag}-2b`, t.some(x => /FLIGHT SAFETY|clash|already on/.test(x)), 'the toast repeats the reason (or the validator\'s clash words)', t)
    check(`${tag}-2c`, clash.length === 1 && !wb.some(x => /SAFETY WALK/.test(x)), 'Monday\'s warning list raises the clash between the two rows (and did not before)', { clash, rangerBefore: wb.filter(x => x.includes(RANGER)) })
    note(`${tag}-2c-wording`, 'the clash as the warning list words it (F20: the validator\'s wording is untouched by this change — validate.ts\'s diff is the two leaving-seat helpers only)', clash)
    const rings = await page.evaluate(([r, i]) => [`a:0.2.`, `a:0.${i}.`].map(k => {
      const pk = [...document.querySelectorAll(`#schedBoard [data-slot^="${k}"] .puck[data-person="${r}"]`)].find(p => p.offsetWidth || p.offsetHeight)
      return pk ? { key: pk.closest('[data-slot]').dataset.slot, cls: pk.className, ring: getComputedStyle(pk).boxShadow } : null }), [RANGER, sw.ri])
    const rp = await boxPic(page, `${pf}-02-planted-anyway-rings`, `#schedBoard [data-fill="a:${MON}.2.+"]`, '.sb-panel')
    check(`${tag}-2d`, rings.every(r => r && /boxred|hard/.test(r.cls)), 'his puck rings red on BOTH rows', rings, rp)
    const sl = phone ? null : await boxPic(page, `${pf}-03-warning-list`, '#sbSide')
    if (sl) note(`${tag}-2e`, 'picture of the day\'s warning list with the clash', '', sl)
    // Undo the plant, retype SAFETY WALK to abut (09:00–09:30): Ranger NOT struck
    await sbUndo(page); await toasts(page)
    check(`${tag}-3a`, !(await crowd(page, MON, sw.ri)).includes(RANGER), 'Undo takes the plant off', await crowd(page, MON, sw.ri))
    await page.keyboard.press('Escape'); await page.waitForTimeout(200)
    await boardType(page, `ap:${MON}.${sw.ri}.str`, '0900')
    await boardType(page, `ap:${MON}.${sw.ri}.end`, '0930')
    await toasts(page)
    const a2 = await armFill(page, `a:${MON}.${sw.ri}.+`)
    const pr2 = await palette(page, RANGER)
    const p3 = phone ? await pic(page, `${pf}-04-drawer-abutting-ranger-free`) : await boxPic(page, `${pf}-04-palette-abutting-ranger-free`, `#sbRoster .rpuck[data-person="${RANGER}"]`, '.rcol')
    check(`${tag}-3b`, a2 === `a:${MON}.${sw.ri}.+` && !pr2.no && !pr2.why, 'retyped to 09:00–09:30 (abutting 08:30–09:00): Ranger is NOT struck', { a2, row: await page.evaluate(i => window.DAYS[0].allhands[i].str + '-' + window.DAYS[0].allhands[i].end, sw.ri), no: pr2.no, why: pr2.why, head: pr2.head }, p3)
    note(`${tag}-3c`, '"N free" with the overlap vs abutting (Ranger is one of the differences)', { overlap: pr.head, abutting: pr2.head })
  } catch (e) { check(`${tag}-CRASH`, false, String(e && e.stack || e)) }
  check(`${tag}-ERR`, !errors.length, 'browser error list empty', errors.slice(0, 6))
  await w.browser.close()
}

/* ============================================================================================================
   F3 — dragging a man OFF a programme row onto four overlapping kinds of target: the row he is leaving is never named.
   ============================================================================================================ */
async function f3() {
  const w = await openW(), { page, errors } = w
  try {
    await board(page, MON)
    // four overlapping empty targets, through + Row / + Item / + Line and typed times
    await press(page, `[data-sradd="${MON}.oft"]`)
    const oi = await page.evaluate(() => window.DAYS[0].sims.oft.length - 1)
    await boardType(page, `sr:${MON}.oft.${oi}.label`, 'OFT F3'); await boardType(page, `sr:${MON}.oft.${oi}.str`, '0830'); await boardType(page, `sr:${MON}.oft.${oi}.end`, '1000')
    await press(page, `[data-dradd="${MON}.0"]`)
    const dri = await page.evaluate(() => window.DAYS[0].dutywaves[0].rows.length - 1)
    await boardType(page, `dr:${MON}.0.${dri}.role`, 'DESK F3'); await boardType(page, `dr:${MON}.0.${dri}.str`, '0800'); await boardType(page, `dr:${MON}.0.${dri}.end`, '1200')
    await press(page, `[data-gradd="${MON}"]`)
    const gi = await page.evaluate(() => window.DAYS[0].ground.length - 1)
    await boardType(page, `gr:${MON}.${gi}.prog`, 'GROUND F3'); await boardType(page, `gr:${MON}.${gi}.str`, '0830'); await boardType(page, `gr:${MON}.${gi}.end`, '0930')
    await press(page, `[data-gline="${MON}.0"]`)
    const li = await page.evaluate(() => window.DAYS[0].waves[0].formations.length - 1)
    await boardType(page, `ff:${MON}.0.${li}.cs`, 'FTHREE'); await boardType(page, `ff:${MON}.0.${li}.to`, '0900'); await boardType(page, `ff:${MON}.0.${li}.ld`, '1030')
    await toasts(page)
    const fx = await page.evaluate(([oi, dri, gi, li]) => { const d = window.DAYS[0]; const f = d.waves[0].formations[li]
      return { oft: `${d.sims.oft[oi].label} ${d.sims.oft[oi].str}-${d.sims.oft[oi].end}`, desk: `${d.dutywaves[0].rows[dri].role} ${d.dutywaves[0].rows[dri].str}-${d.dutywaves[0].rows[dri].end}`,
        ground: `${d.ground[gi].prog} ${d.ground[gi].str}-${d.ground[gi].end}`, line: `${f.cs} br=${f.br} to=${f.to} ld=${f.ld}` } }, [oi, dri, gi, li])
    note('F3-0', 'fixture: four overlapping empty targets made through + Row / + Item / + Line and typed times; Ranger on FLIGHT SAFETY 08:30–09:00', fx)
    const targets = [
      { id: 'oft', label: 'an OFT box 08:30–10:00 (its empty front seat)', sel: `[data-slot="s:${MON}.oft.${oi}.p"]`, arm: `s:${MON}.oft.${oi}.p`, lands: (d) => d.sims.oft[oi].p === 'bane' || d.sims.oft[oi].w === 'bane' },
      { id: 'desk', label: 'a duty desk 08:00–12:00 (its + add)', sel: `[data-fill="d:${MON}.0.${dri}.+"]`, lands: (d) => d.dutywaves[0].rows[dri].id === 'bane' || (d.dutywaves[0].rows[dri].more || []).includes('bane') },
      { id: 'ground', label: 'a ground row 08:30–09:30 (its + add)', sel: `[data-fill="g:${MON}.${gi}.+"]`, lands: (d) => d.ground[gi].who === 'bane' || (d.ground[gi].more || []).includes('bane') },
      { id: 'fly', label: 'wave 1\'s new line, take-off 09:00 (its empty front seat)', sel: `[data-slot="0.0.${li}.0.p"]`, arm: `0.0.${li}.0.p`, lands: (d) => d.waves[0].formations[li].aircraft[0].p === 'bane' },
    ]
    for (const T of targets) {
      // first the plain question (he is NOT leaving): arm the target, his palette line still names FLIGHT SAFETY
      const ak = T.arm ? await armSeat(page, T.arm) : await armFill(page, T.sel.match(/"(.*)"/)[1])
      const pr = await palette(page, RANGER)
      /* the desk (08:00–12:00) also overlaps his VL BFM window (from 11:40), and the scan names the first commitment it
         meets — any "already on …" is the busy check speaking; the other three overlap only the stand-down */
      check(`F3-${T.id}-plain`, T.id === 'desk' ? /^already on /.test(pr.why) : /^already on FLIGHT SAFETY STAND-DOWN 08:30–09:00$/.test(pr.why), `${T.label}, armed (he stays on the row): the palette still says he is busy`, { ak, why: pr.why })
      await page.keyboard.press('Escape'); await page.waitForTimeout(250)
      await page.evaluate(() => { const x = document.querySelector('#schedBoard [data-disarm]'); if (x && (x.offsetWidth || x.offsetHeight)) x.click() }); await page.waitForTimeout(250)
      await toasts(page)
      // then the drag OFF the row onto it
      const snap0 = await page.evaluate(() => JSON.stringify(window.DAYS[0]))
      const h = await dragRead(w, page.locator(`#schedBoard [data-slot="a:${MON}.2.0"] .puck:visible`).first(), page.locator(`#schedBoard ${T.sel}:visible`).first(), `f3-${T.id}-hover-ranger-off-flight-safety`)
      const t = await toasts(page)
      const d = await page.evaluate(() => window.DAYS[0])
      const on = T.lands(d), off = !(await crowd(page, MON, 2)).includes(RANGER)
      const wa = await warnsOf(page, MON)
      check(`F3-${T.id}-a`, !/FLIGHT SAFETY/.test(h.caption), `dragged off FLIGHT SAFETY onto ${T.label}: the caption never names the row he is leaving`, { caption: h.caption, over: h.over }, h.pic)
      check(`F3-${T.id}-b`, on && off, 'after the drop he is on the target and off the row', { on, off })
      check(`F3-${T.id}-c`, !t.some(x => /FLIGHT SAFETY/.test(x)) && !wa.some(x => x.includes(RANGER) && /FLIGHT SAFETY/.test(x)), 'no toast and no warning names the row he left', { toasts: t, ranger: wa.filter(x => x.includes(RANGER)) })
      if (h.caption) note(`F3-${T.id}-other`, 'the caption named something else (a real commitment/rule, not the row he left)', h.caption)
      await boxPic(page, `f3-${T.id}-after-drop`, `#schedBoard ${T.sel}`, '.sb-arow, .sb-line, .sb-go')
      /* Undo ONLY a drop that changed the day — an Undo after a drop that did not land would take a fixture step back */
      if (await page.evaluate(s0 => JSON.stringify(window.DAYS[0]) !== s0, snap0)) {
        await sbUndo(page); await toasts(page)
        const same = await page.evaluate(s0 => JSON.stringify(window.DAYS[0]) === s0, snap0)
        check(`F3-${T.id}-undo`, same && (await crowd(page, MON, 2)).includes(RANGER), 'Undo puts him back on FLIGHT SAFETY and the day is as before the drag', { same, crowd: await crowd(page, MON, 2) })
      } else note(`F3-${T.id}-undo`, 'the drop changed nothing — no Undo pressed', '')
    }
  } catch (e) { check('F3-CRASH', false, String(e && e.stack || e)) }
  check('F3-ERR', !errors.length, 'browser error list empty', errors.slice(0, 6))
  await w.browser.close()
}

/* ============================================================================================================
   F5 — the green "where can he go" rings (the fourth consumer), on the board AND the edit week.
   ============================================================================================================ */
async function f5() {
  const w = await openW(), { page, errors } = w
  try {
    await board(page, MON)
    const sw = await safetyWalk(page)
    await toasts(page)
    /* why WPNS & TACTICS SYNC (11:30–12:00) is NOT a free row for Ranger on this seed: his VL BFM window opens 11:40 and
       his OFT EP-4 starts 12:00 — read off the armed palette, so the ring's answer can be compared with the picker's */
    await armFill(page, `a:${MON}.3.+`)
    const wp = await palette(page, RANGER)
    note('F5-0', 'fixture: + Item SAFETY WALK 08:45–09:15 (empty). What the palette says of Ranger for WPNS & TACTICS SYNC 11:30–12:00', { wpnsWhy: wp.why })
    await page.evaluate(() => { const x = document.querySelector('#schedBoard [data-disarm]'); if (x && (x.offsetWidth || x.offsetHeight)) x.click() }); await page.waitForTimeout(300)
    const ringRead = (root) => page.evaluate(([root, ri, id]) => {
      const q = s => [...document.querySelectorAll(`${root} ${s}`)].find(e => e.offsetWidth || e.offsetHeight)
      const r = e => e ? (e.classList.contains('oktake') ? 'green' : e.classList.contains('oktake-f') ? 'dim green' : 'none') : 'NOT DRAWN'
      const w2 = [...document.querySelectorAll(`${root} [data-slot^="0.1."]`)].filter(e => e.offsetWidth || e.offsetHeight).map(e => `${e.dataset.slot}:${r(e)}`)
      const selPk = [...document.querySelectorAll(`${root} .puck.sel`)].filter(e => e.offsetWidth || e.offsetHeight).map(e => e.dataset.person)
      return { selected: [...new Set(selPk)], safetyWalk: r(q(`[data-fill="a:0.${ri}.+"]`)), met: r(q('[data-fill="a:0.1.+"]')), sodb: r(q('[data-fill="a:0.0.+"]')), wpns: r(q('[data-fill="a:0.3.+"]')),
        ownRow: r(q('[data-fill="a:0.2.+"]')), wave2: w2 }
    }, [root, sw.ri, RANGER])
    const selectRanger = async (root) => {
      const pk = page.locator(`${root} [data-slot="a:${MON}.2.0"] .puck:visible`).first()
      await pk.evaluate(e => e.scrollIntoView({ block: 'center' })); await page.waitForTimeout(200)
      if (!(await pk.evaluate(e => e.classList.contains('sel')))) { await pk.click(); await page.waitForTimeout(600) }
      return pk.evaluate(e => e.classList.contains('sel'))
    }
    // on the board: Ranger's puck clicked (the blue selection)
    const s1 = await selectRanger('#schedBoard')
    const rb = await ringRead('#schedBoard')
    const p1 = await boxPic(page, 'f5-01-board-rings-ranger-selected', '#schedBoard .sb-panel.prog')
    check('F5-b1', s1 && rb.selected.join() === RANGER && rb.safetyWalk === 'none', 'board, Ranger selected (blue): SAFETY WALK\'s + add has NO green ring (he is busy 08:30–09:00)', rb, p1)
    check('F5-b2', rb.met === 'green' && rb.sodb === 'green', 'the free programme rows around it — MET + NOTAM BRIEF 08:15–08:30 (abutting) and SODB 07:45–08:15 — are green', { met: rb.met, sodb: rb.sodb })
    check('F5-b2w', rb.wpns === (wp.why ? 'none' : 'green'), 'WPNS & TACTICS SYNC\'s ring agrees with the palette\'s answer for it (he is busy there on this seed: VL BFM from 11:40)', { ring: rb.wpns, palette: wp.why })
    check('F5-b3', rb.wave2.some(x => /green/.test(x)), 'the seats of the evening wave (wave 2) are dim green (he could take over)', rb.wave2)
    note('F5-b4', 'his OWN row\'s + add (FLIGHT SAFETY) shows (green on main too, where every programme cell was excluded)', rb.ownRow)
    await boxPic(page, 'f5-02-board-rings-wave2', `#schedBoard [data-slot="0.1.0.0.p"]`, '.sb-go')
    // on the edit week (the selection carries; select only if it did not)
    await closeBoard(page); await editWeek(page)
    const s2 = await selectRanger('#eWeek')
    const rw = await ringRead('#eWeek')
    const p2 = await boxPic(page, 'f5-03-week-rings-ranger-selected', `#eWeek .day[data-day="0"] [data-fill="a:0.2.+"]`, '.day')
    check('F5-w1', s2 && rw.safetyWalk === 'none' && rw.met === 'green' && rw.wpns === rb.wpns, 'edit week, Ranger selected: SAFETY WALK no ring, MET green, WPNS as on the board', rw, p2)
    note('F5-w2', 'edit week: his own row\'s + add shows', rw.ownRow)
  } catch (e) { check('F5-CRASH', false, String(e && e.stack || e)) }
  check('F5-ERR', !errors.length, 'browser error list empty', errors.slice(0, 6))
  await w.browser.close()
}

/* ============================================================================================================
   F6 — the duplicate door: (a) palette drag onto his own row's + add, (b) arm + tap, (c) his own puck onto the
   same row's + add; a published Monday for the no-op.
   ============================================================================================================ */
async function f6() {
  const w = await openW(), { page, errors } = w
  try {
    await board(page, MON)
    const dup = async () => (await crowd(page, MON, 2)).filter(x => x === RANGER).length
    // (a)
    const h = await dragRead(w, page.locator(`#sbRoster .rpuck[data-person="${RANGER}"]`).first(), page.locator(`#schedBoard [data-fill="a:${MON}.2.+"] .addz:visible`).first(), 'f6-a-hover-palette-ranger-onto-own-row', { at: (b) => ({ x: b.x + b.width / 2, y: b.y + b.height / 2 }) })
    let t = await toasts(page), n = await dup(), wa = await warnsOf(page, MON)
    const pa = await boxPic(page, 'f6-a-after-palette-drag', `#schedBoard [data-fill="a:${MON}.2.+"]`, '.sb-arow')
    check('F6-a', n === 1, '(a) palette drag of Ranger onto FLIGHT SAFETY\'s + add: he is never listed twice', { count: n, crowd: await crowd(page, MON, 2), caption: h.caption, toasts: t, rangerWarn: wa.filter(x => x.includes(RANGER)) }, pa)
    if (n > 1) await sbUndo(page)
    await toasts(page)
    // (b)
    const ak = await armFill(page, `a:${MON}.2.+`)
    const pr = await palette(page, RANGER)
    await tapName(page, RANGER)
    t = await toasts(page); n = await dup(); wa = await warnsOf(page, MON)
    const pb = await boxPic(page, 'f6-b-after-arm-and-tap', `#schedBoard [data-fill="a:${MON}.2.+"]`, '.sb-arow')
    check('F6-b', n === 1, '(b) arm FLIGHT SAFETY\'s + add, tap Ranger: he is never listed twice', { armed: ak, paletteSays: { no: pr.no, why: pr.why }, count: n, crowd: await crowd(page, MON, 2), toasts: t, rangerWarn: wa.filter(x => x.includes(RANGER)) }, pb)
    if (n > 1) await sbUndo(page)
    await toasts(page)
    /* (d)/(e) — the route that DID speak on main: Ranger put onto ANOTHER man's seat in the crowd he is already on.
       main's trim made that seat's row (`a:0.2.1` → `a:0.2`) differ from the event's (`a:0.2` → `a:0`), so the drag caption,
       the drop toast and the armed palette all said "already on FLIGHT SAFETY STAND-DOWN"; this branch matches them. */
    await plant(page, `a:${MON}.2.+`, REAPER); await toasts(page)
    note('F6-de-0', 'fixture for (d)/(e): FLIGHT SAFETY holds Ranger and Reaper', await crowd(page, MON, 2))
    const snapD = await page.evaluate(() => JSON.stringify(window.DAYS[0]))
    const hd = await dragRead(w, page.locator(`#sbRoster .rpuck[data-person="${RANGER}"]`).first(), page.locator(`#schedBoard [data-slot="a:${MON}.2.1"]:visible`).first(), 'f6-d-hover-palette-ranger-onto-reaper-in-his-own-crowd')
    t = await toasts(page); n = await dup()
    const cd = await crowd(page, MON, 2)
    const pd = await boxPic(page, 'f6-d-after-palette-ranger-onto-reaper', `#schedBoard [data-fill="a:${MON}.2.+"]`, '.sb-arow')
    check('F6-d', n === 1 || !!hd.caption || t.length > 0, '(d) palette Ranger dropped onto Reaper\'s seat in the crowd Ranger is already on: never a silent second copy (either one copy, or the caption / a toast says so)', { caption: hd.caption, crowd: cd, count: n, toasts: t, rangerWarn: (await warnsOf(page, MON)).filter(x => x.includes(RANGER) && /FLIGHT SAFETY/.test(x)) }, hd.pic)
    note('F6-d-pic', 'after the drop', '', pd)
    if (await page.evaluate(s0 => JSON.stringify(window.DAYS[0]) !== s0, snapD)) { await sbUndo(page); await toasts(page) }
    // (e) arm Reaper's seat (tap it) and tap Ranger in the palette
    const re = page.locator(`#schedBoard [data-slot="a:${MON}.2.1"]:visible`).first()
    await re.evaluate(e => e.scrollIntoView({ block: 'center' })); await page.waitForTimeout(200)
    const rb = await re.boundingBox(); await page.mouse.click(rb.x + rb.width / 2, rb.y + rb.height / 2); await page.waitForTimeout(450)
    const armE = await page.evaluate(() => window.ARM && window.ARM.key)
    if (armE === `a:${MON}.2.1`) {
      const prE = await palette(page, RANGER)
      const ppE = await boxPic(page, 'f6-e-palette-reaper-seat-armed-ranger', `#sbRoster .rpuck[data-person="${RANGER}"]`, '.rcol')
      await tapName(page, RANGER)
      t = await toasts(page); n = await dup()
      check('F6-e', n === 1 || prE.no || t.some(x => !/planned$/.test(x)), '(e) Reaper\'s seat armed, Ranger tapped: never a silent second copy (struck before the tap, or a warning after)', { armed: armE, paletteBefore: { no: prE.no, why: prE.why }, crowd: await crowd(page, MON, 2), count: n, toasts: t }, ppE)
      await boxPic(page, 'f6-e-after-tap', `#schedBoard [data-fill="a:${MON}.2.+"]`, '.sb-arow')
      if (await page.evaluate(s0 => JSON.stringify(window.DAYS[0]) !== s0, snapD)) { await sbUndo(page); await toasts(page) }
    } else note('F6-e', 'a tap on Reaper\'s filled seat does not arm it (it selects him) — route (e) is not reachable this way', { armE })
    await page.evaluate(() => { const x = document.querySelector('#schedBoard [data-disarm]'); if (x && (x.offsetWidth || x.offsetHeight)) x.click() }); await page.waitForTimeout(250)
    await page.keyboard.press('Escape'); await page.waitForTimeout(200)
    await sbUndo(page); await toasts(page)                      // Reaper's plant off again, for (c)'s no-op
    check('F6-de-z', (await crowd(page, MON, 2)).join() === RANGER, 'back to Ranger alone before (c)', await crowd(page, MON, 2))
    // (c) — on a published Monday, so a no-op must read 0 pending
    await closeBoard(page); await editWeek(page)
    await signDay(page, MON, 0); const pub = await publishDay(page, MON)
    await toasts(page)
    await board(page, MON)
    const hc = await dragRead(w, page.locator(`#schedBoard [data-slot="a:${MON}.2.0"] .puck:visible`).first(), page.locator(`#schedBoard [data-fill="a:${MON}.2.+"] .addz:visible`).first(), 'f6-c-hover-own-puck-onto-own-row', { at: (b) => ({ x: b.x + b.width / 2, y: b.y + b.height / 2 }) })
    t = await toasts(page); n = await dup()
    const pend = await pendingOn(page, MON)
    check('F6-c', pub.pressed && n === 1 && pnum(pend) === 0 && !busyToast(t).length, '(c) published Monday, Ranger\'s own puck onto his own row\'s + add: one copy, 0 pending, no busy toast', { caption: hc.caption, count: n, pend, toasts: t }, hc.pic)
  } catch (e) { check('F6-CRASH', false, String(e && e.stack || e)) }
  check('F6-ERR', !errors.length, 'browser error list empty', errors.slice(0, 6))
  await w.browser.close()
}

/* ============================================================================================================
   F1 — "was it his only event that day": Reaper works Mon–Fri; his ONLY Saturday event is one of five shapes; he is
   dragged (edit week, mouse) onto an empty Sunday ground row. The drag must NOT say "7th day in a row"; the palette
   (Saturday stays) must.
   ============================================================================================================ */
const SAT = 5, SUN = 6
async function f1(v) {
  const tag = 'F1' + v
  const w = await openW(), { page, errors } = w
  try {
    // Reaper Mon, Wed, Thu, Fri on each day's SODB (Tuesday he is already on OPS BRIEFER)
    const setup = []
    for (const di of [0, 2, 3, 4]) { await board(page, di); setup.push(`${di}:${await plant(page, `a:${di}.0.+`, REAPER)}`) }
    await toasts(page)
    // Saturday: his ONLY event
    await board(page, SAT)
    let satKey = '', satDesc = ''
    if (v === 'a') {
      await press(page, `[data-padd="${SAT}"]`)
      await boardType(page, `ap:${SAT}.0.prog`, 'SAT BRIEF'); await boardType(page, `ap:${SAT}.0.str`, '0900'); await boardType(page, `ap:${SAT}.0.end`, '1000')
      await plant(page, `a:${SAT}.0.+`, REAPER); satKey = `a:${SAT}.0.0`; satDesc = 'a Common Programme row (SAT BRIEF 09:00–10:00)'
    } else if (v === 'b') {
      await press(page, `[data-sradd="${SAT}.oft"]`)
      await boardType(page, `sr:${SAT}.oft.0.label`, 'SAT OFT'); await boardType(page, `sr:${SAT}.oft.0.str`, '0900'); await boardType(page, `sr:${SAT}.oft.0.end`, '1000')
      await armSeat(page, `s:${SAT}.oft.0.p`); await tapName(page, REAPER); satKey = `s:${SAT}.oft.0.p`; satDesc = 'an OFT front seat (SAT OFT 09:00–10:00)'
    } else if (v === 'c') {
      await plant(page, `d:${SAT}.0.0.+`, REAPER); satKey = `d:${SAT}.0.0.x0`; satDesc = 'a duty desk\'s extras line (SDO 08:00–18:00, Fable holds the desk)'
    } else if (v === 'd') {
      await press(page, `[data-gradd="${SAT}"]`)
      await boardType(page, `gr:${SAT}.0.prog`, 'SAT ROW'); await boardType(page, `gr:${SAT}.0.str`, '0900'); await boardType(page, `gr:${SAT}.0.end`, '1000')
      await armFill(page, `g:${SAT}.0.+`)
      const other = await page.evaluate(r => [...document.querySelectorAll('#sbRoster .rpuck:not(.no)')].map(e => e.dataset.person).filter(p => p !== r && !window.PEOPLE[p].special)[0], REAPER)
      await tapName(page, other); await plant(page, `g:${SAT}.0.+`, REAPER); satKey = `g:${SAT}.0.x0`; satDesc = 'a ground row\'s extras line (SAT ROW 09:00–10:00, another man holds the name)'
    } else if (v === 'e') {
      await press(page, `[data-wvadd="${SAT}"]`)
      await page.locator('[data-wmkind=""]:visible').first().click(); await page.waitForTimeout(600)
      const f = await page.evaluate(d => (window.DAYS[d].waves[0] || {}).formations?.length, SAT)
      if (!f) await press(page, `[data-gline="${SAT}.0"]`)
      await boardType(page, `ff:${SAT}.0.0.to`, '0900'); await boardType(page, `ff:${SAT}.0.0.ld`, '1030')
      await armSeat(page, `${SAT}.0.0.0.p`); await tapName(page, REAPER); satKey = `${SAT}.0.0.0.p`; satDesc = 'a flying front seat (the control — worked before the change)'
    }
    await toasts(page)
    // Sunday: an empty ground row
    await board(page, SUN)
    await press(page, `[data-gradd="${SUN}"]`)
    await boardType(page, `gr:${SUN}.0.prog`, 'SUN DUTY'); await boardType(page, `gr:${SUN}.0.str`, '0900'); await boardType(page, `gr:${SUN}.0.end`, '1200')
    await page.keyboard.press('Escape'); await page.waitForTimeout(200)
    await toasts(page)
    const days = await page.evaluate(id => window.DAYS.map((d, i) => JSON.stringify(d).includes(`"${id}"`) ? d.dow.slice(0, 3) : null).filter(Boolean), REAPER)
    const satEvents = await page.evaluate(id => { const j = JSON.stringify(window.DAYS[5]); return (j.match(new RegExp(`"${id}"`, 'g')) || []).length }, REAPER)
    note(`${tag}-0`, `fixture: Reaper on Mon–Fri; his only Saturday event is ${satDesc} at ${satKey}; Sunday "SUN DUTY 09:00–12:00" empty`, { setup, days, satMentions: satEvents })
    // the edit week, Saturday brought to the front with the week's own › arrow
    await closeBoard(page); await editWeek(page)
    for (let i = 0; i < 8; i++) {
      const front = await page.evaluate(() => { const d = [...document.querySelectorAll('#eWeek .day[data-day]')].find(x => x.getBoundingClientRect().right > 80); return d ? +d.dataset.day : -1 })
      if (front >= SAT) break
      await page.locator('#weekNext:visible').first().click(); await page.waitForTimeout(350)
    }
    const src = page.locator(`#eWeek [data-slot="${satKey}"] .puck:visible`).first()
    const dst = page.locator(`#eWeek [data-fill="g:${SUN}.0.+"]:visible`).first()
    const h = await dragRead(w, src, dst, `f1${v}-01-week-hover-reaper-sat-to-sun`, { at: (b) => ({ x: b.x + b.width / 2, y: b.y + b.height / 2 }) })
    const t = await toasts(page)
    const after = await page.evaluate(id => ({ sat: JSON.stringify(window.DAYS[5]).includes(`"${id}"`), sun: JSON.stringify(window.DAYS[6]).includes(`"${id}"`) }), REAPER)
    const runW = (await allWarns(page)).filter(x => x.includes(REAPER) && /7th|in a row/i.test(x))
    check(`${tag}-1`, !h.error && !/7th day|in a row/i.test(h.caption), `(${v}) dragging Reaper off ${satDesc} onto Sunday: no "7th day in a row" under the ghost`, h, h.pic)
    check(`${tag}-2`, after.sun && !after.sat, 'the move landed: on Sunday, off Saturday', after)
    check(`${tag}-3`, !runW.length && !t.some(x => /7th|in a row/i.test(x)), 'no run warning after the drop, no toast about it (the caption and the drop agree)', { runW, toasts: t })
    await boxPic(page, `f1${v}-02-week-after-drop`, `#eWeek .day[data-day="${SUN}"]`)
    await page.locator('#undoBtn:visible').first().click(); await page.waitForTimeout(700); await toasts(page)
    const back = await page.evaluate(id => JSON.stringify(window.DAYS[5]).includes(`"${id}"`) && !JSON.stringify(window.DAYS[6]).includes(`"${id}"`), REAPER)
    check(`${tag}-4`, back, 'the page Undo puts him back on Saturday', back)
    // from the PALETTE (Saturday stays): struck "7th day in a row — breaks Sunday"; the plant raises the run warning
    await board(page, SUN)
    await armFill(page, `g:${SUN}.0.+`)
    const pr = await palette(page, REAPER)
    const pp = await boxPic(page, `f1${v}-03-palette-reaper-7th-day`, `#sbRoster .rpuck[data-person="${REAPER}"]`, '.rcol')
    check(`${tag}-5`, pr.no && /7th day in a row/.test(pr.why) && /Sunday/.test(pr.why), 'from the palette (Saturday stays): Reaper struck "7th day in a row — breaks Sunday"', { why: pr.why }, pp)
    await tapName(page, REAPER)
    const t2 = await toasts(page)
    const runW2 = (await allWarns(page)).filter(x => x.includes(REAPER) && /7th|in a row|days/i.test(x))
    check(`${tag}-6`, runW2.length >= 1, 'the plant raises the run warning', { runW2, toasts: t2 })
  } catch (e) { check(`${tag}-CRASH`, false, String(e && e.stack || e)) }
  check(`${tag}-ERR`, !errors.length, 'browser error list empty', errors.slice(0, 6))
  await w.browser.close()
}

/* ============================================================================================================
   F20 — negatives that must still hold: desk holder ↔ extras, ground name ↔ extras, sim front seat → its extras,
   a man on an ⓘ row armed elsewhere, SC MAIN → SPARE, AVALON MAIN → desk.
   ============================================================================================================ */
async function f20() {
  const w = await openW(), { page, errors } = w
  try {
    await board(page, MON)
    const CSn = await cs(page)
    // desk holder ↔ his extras line (SDO, Sidewinder holds it)
    const deskHolder = await page.evaluate(() => window.DAYS[0].dutywaves[0].rows[0].id)
    await plant(page, `d:${MON}.0.0.+`, REAPER); await toasts(page)
    let h = await dragRead(w, page.locator(`#schedBoard [data-slot="d:${MON}.0.0"] .puck:visible`).first(), page.locator(`#schedBoard [data-slot="d:${MON}.0.0.x0"]:visible`).first(), 'f20-01-hover-desk-holder-onto-extra')
    let t = await toasts(page)
    let r = await page.evaluate(() => { const x = window.DAYS[0].dutywaves[0].rows[0]; return { id: x.id, more: x.more } })
    check('F20-desk', !h.error && !h.caption && !busyToast(t).length && r.id === REAPER && (r.more || []).includes(deskHolder), `desk holder (${CSn[deskHolder]}) dragged onto his extra (Reaper): silent, swapped`, { caption: h.caption, toasts: t, r }, h.pic)
    await sbUndo(page); await sbUndo(page); await toasts(page)   // the swap, then Reaper's plant — he must be on nothing for the next walk
    note('F20-desk-z', 'desk back as the seed', await page.evaluate(() => { const x = window.DAYS[0].dutywaves[0].rows[0]; return { id: x.id, more: x.more || [] } }))
    // ground name ↔ its extras (STAFF MTG @ HQ, Vapor)
    const gHold = await page.evaluate(() => window.DAYS[0].ground[1].who)
    await plant(page, `g:${MON}.1.+`, REAPER); await toasts(page)
    h = await dragRead(w, page.locator(`#schedBoard [data-slot="g:${MON}.1.x0"] .puck:visible`).first(), page.locator(`#schedBoard [data-slot="g:${MON}.1"]:visible`).first(), 'f20-02-hover-ground-extra-onto-name')
    t = await toasts(page)
    r = await page.evaluate(() => { const x = window.DAYS[0].ground[1]; return { who: x.who, more: x.more } })
    check('F20-ground', !h.error && !h.caption && !busyToast(t).length && r.who === REAPER, `ground row's extra (Reaper) dragged onto its name (${CSn[gHold]}): silent, swapped`, { caption: h.caption, toasts: t, r }, h.pic)
    await sbUndo(page); await sbUndo(page); await toasts(page)
    // sim front seat ↔ its extras (OFT EP-4, Talisman in front): Reaper planted as an extra, then the two swapped
    const simP = await page.evaluate(() => window.DAYS[0].sims.oft[0].p)
    /* a full sim row opens a spare pair of empty seats on the board (board-html simSpare, D50) — tap the first, tap Reaper */
    await armSeat(page, `s:${MON}.oft.0.x0`); await tapName(page, REAPER); await toasts(page)
    const simX = await page.evaluate(() => (window.DAYS[0].sims.oft[0].more || []).indexOf('dice'))
    h = await dragRead(w, page.locator(`#schedBoard [data-slot="s:${MON}.oft.0.p"] .puck:visible`).first(), page.locator(`#schedBoard [data-slot="s:${MON}.oft.0.x${simX}"]:visible`).first(), 'f20-03-hover-sim-front-onto-its-extra')
    t = await toasts(page)
    r = await page.evaluate(() => { const x = window.DAYS[0].sims.oft[0]; return { p: x.p, w: x.w, more: x.more } })
    check('F20-sim', !h.error && simX >= 0 && !h.caption && !busyToast(t).length && r.p === REAPER, `sim front seat (${CSn[simP]}) dragged onto the same box's extra (Reaper): silent, swapped`, { simX, caption: h.caption, err: h.error, toasts: t, r }, h.pic)
    for (let i = 0; i < 2; i++) if (await page.locator('#sbUndo:visible:not([disabled])').count()) { await sbUndo(page) }
    await toasts(page)
    note('F20-sim-z', 'sim back as the seed', await page.evaluate(() => { const x = window.DAYS[0].sims.oft[0]; return { p: x.p, w: x.w, more: x.more || [] } }))
    // a man on an ⓘ programme row, armed elsewhere: never busy
    const sw = await safetyWalk(page)
    await press(page, `[data-pinfo="${MON}.2"]`); await toasts(page)
    await armFill(page, `a:${MON}.${sw.ri}.+`)
    const pr = await palette(page, RANGER)
    const pi = await boxPic(page, 'f20-04-info-row-ranger-not-busy', `#sbRoster .rpuck[data-person="${RANGER}"]`, '.rcol')
    check('F20-info', !pr.no && !pr.why, 'FLIGHT SAFETY made ⓘ info-only; SAFETY WALK (overlapping) armed: Ranger is not busy', { no: pr.no, why: pr.why }, pi)
    await page.keyboard.press('Escape'); await page.waitForTimeout(250)
    await page.evaluate(() => { const x = document.querySelector('#schedBoard [data-disarm]'); if (x && (x.offsetWidth || x.offsetHeight)) x.click() }); await page.waitForTimeout(250)
    await press(page, `[data-pinfo="${MON}.2"]`); await toasts(page)
    // SC: + Wave → SC (two shifts, each MAIN, MAIN, SPARE, SPARE — a front and a rear seat each)
    await press(page, `[data-wvadd="${MON}"]`)
    await page.locator('[data-wmkind="sc"]:visible').first().click(); await page.waitForTimeout(700)
    const sc = await page.evaluate(() => { const d = window.DAYS[0]; const gi = d.waves.findIndex(x => (x.formations || []).some(f => f.aircraft.some(a => a.role === 'SPARE'))); const wv = d.waves[gi]; return { gi, label: wv && wv.label, lines: wv && wv.formations.map(f => ({ cs: f.cs, to: f.to, ld: f.ld, role: f.aircraft.map(a => a.role || '') })) } })
    note('F20-sc-0', '+ Wave → SC: what it made', sc)
    await toasts(page)
    if (sc.gi >= 0) {
      const G = sc.gi, main1 = `0.${G}.0.0.p`, main2 = `0.${G}.0.1.p`, mainRear = `0.${G}.0.0.w`, spare = `0.${G}.0.2.p`
      await armSeat(page, main1)
      /* a man the palette offers for SC AM MAIN and who is on nothing else on Monday (so no other voice) */
      const cand = await page.evaluate(() => {
        const busy = id => JSON.stringify(window.DAYS[0]).includes(`"${id}"`)
        return [...document.querySelectorAll('#sbRoster .rpuck:not(.no)')].map(e => e.dataset.person).filter(p => !window.PEOPLE[p].special && !busy(p))[0] })
      await tapName(page, cand)
      const t0 = await toasts(page)
      const at = k => page.evaluate(k => { const a = k.split('.'); return window.DAYS[+a[0]].waves[+a[1]].formations[+a[2]].aircraft[+a[3]][a[4]] }, k)
      note('F20-sc-fix', `${CSn[cand]} planted on SC AM MAIN (front seat) through the arm and the palette`, { planted: await at(main1), toasts: t0 })
      const walk = async (id, to, what, picName) => {
        const s0 = await page.evaluate(() => JSON.stringify(window.DAYS[0]))
        const h = await dragRead(w, page.locator(`#schedBoard [data-slot="${main1}"] .puck:visible`).first(), page.locator(`#schedBoard [data-slot="${to}"]:visible`).first(), picName)
        const tt = await toasts(page), landed = await at(to), left = await at(main1)
        check(id, !h.caption && landed === cand && !tt.length, `${what}: caption clear, the move lands, nothing said after`, { caption: h.caption, landed: landed === cand, leftEmpty: !left, toasts: tt }, h.pic)
        if (await page.evaluate(s0 => JSON.stringify(window.DAYS[0]) !== s0, s0)) { await sbUndo(page); await toasts(page) }
      }
      await walk('F20-sc-1', spare, 'SC AM MAIN dragged onto SC AM SPARE (same shift)', 'f20-05-hover-sc-main-onto-spare')
      await armSeat(page, spare)
      const pr2 = await palette(page, cand)
      check('F20-sc-2', /^already on SC AM MAIN 07:00–13:00$/.test(pr2.why), 'a plain plant of the MAIN man onto SPARE (he stays MAIN) still says "already on SC AM MAIN 07:00–13:00"', { why: pr2.why }, await boxPic(page, 'f20-06-palette-sc-main-on-spare', `#sbRoster .rpuck[data-person="${cand}"]`, '.rcol'))
      await page.evaluate(() => { const x = document.querySelector('#schedBoard [data-disarm]'); if (x && (x.offsetWidth || x.offsetHeight)) x.click() }); await page.waitForTimeout(250)
      await walk('F20-sc-3', main2, 'SC AM MAIN (1st) dragged onto the OTHER SC AM MAIN seat of the same shift', 'f20-07-hover-sc-main-onto-other-main')
      await walk('F20-sc-4', mainRear, 'SC AM MAIN front seat dragged onto the same MAIN\'s rear seat', 'f20-08-hover-sc-main-front-onto-rear')
    }
    // AVALON: + Wave → AVALON; MAIN → the AVALON desk
    await press(page, `[data-wvadd="${MON}"]`)
    await page.locator('[data-wmkind="avalon"]:visible').first().click(); await page.waitForTimeout(700)
    const av = await page.evaluate(() => { const d = window.DAYS[0]
      const gi = d.waves.findIndex(x => /AVALON/i.test(x.label || '')); const wv = d.waves[gi]
      const bi = d.dutywaves.findIndex(b => b.sa === 'avalon' || /AVALON/i.test(b.label || ''))
      return { gi, label: wv && wv.label, lines: wv && wv.formations.map(f => ({ cs: f.cs, to: f.to, ld: f.ld, role: f.aircraft.map(a => a.role || '') })),
        bi, desk: bi >= 0 ? d.dutywaves[bi].rows.map(r => `${r.role}|${r.str}-${r.end}|${r.id}`) : null } })
    note('F20-av-0', '+ Wave → AVALON: what it made', av)
    await toasts(page)
    if (av.gi >= 0 && av.bi >= 0) {
      const mainK = `0.${av.gi}.0.0.p`, deskK = `d:0.${av.bi}.0`
      await armSeat(page, mainK)
      const cand = await page.evaluate(() => { const busy = id => JSON.stringify(window.DAYS[0]).includes(`"${id}"`)
        return [...document.querySelectorAll('#sbRoster .rpuck:not(.no)')].map(e => e.dataset.person).filter(p => !window.PEOPLE[p].special && !busy(p))[0] })
      await tapName(page, cand); const tA = await toasts(page)
      const s0 = await page.evaluate(() => JSON.stringify(window.DAYS[0]))
      const deskHasSlot = await page.locator(`#schedBoard [data-slot="${deskK}"]:visible`).count()
      const dst = deskHasSlot ? page.locator(`#schedBoard [data-slot="${deskK}"]:visible`).first() : page.locator(`#schedBoard [data-fill="${deskK}.+"]:visible`).first()
      const h = await dragRead(w, page.locator(`#schedBoard [data-slot="${mainK}"] .puck:visible`).first(), dst, 'f20-09-hover-avalon-main-onto-desk', { at: (b) => ({ x: b.x + Math.min(b.width / 2, 30), y: b.y + b.height / 2 }) })
      const tt = await toasts(page)
      const onDesk = await page.evaluate(([bi, id]) => { const r = window.DAYS[0].dutywaves[bi].rows[0]; return r.id === id || (r.more || []).includes(id) }, [av.bi, cand])
      check('F20-av', !h.caption && onDesk && !busyToast(tt).length, `AVALON MAIN (${CSn[cand]}) dragged onto the AVALON desk: caption clear, lands`, { planted: tA, caption: h.caption, onDesk, toasts: tt }, h.pic)
      if (await page.evaluate(s0 => JSON.stringify(window.DAYS[0]) !== s0, s0)) { await sbUndo(page); await toasts(page) }
    } else note('F20-av', 'AVALON shape not recognised — not driven', av)
  } catch (e) { check('F20-CRASH', false, String(e && e.stack || e)) }
  check('F20-ERR', !errors.length, 'browser error list empty', errors.slice(0, 6))
  await w.browser.close()
}

/* ---------- run ---------- */
const PARTS = { f4d, f4p, f2d: () => f2(false), f2p: () => f2(true), f3, f5, f6, f1a: () => f1('a'), f1b: () => f1('b'), f1c: () => f1('c'), f1d: () => f1('d'), f1e: () => f1('e'), f20 }
const want = process.argv.slice(2).length ? process.argv.slice(2) : Object.keys(PARTS)
for (const p of want) {
  PART = p; RES = []
  console.log(`\n===== ${p} =====`)
  await PARTS[p]()
  /* a machine-readable copy only when asked for (W3_RESULTS=<folder>), never beside the pictures */
  if (process.env.W3_RESULTS) writeFileSync(`${process.env.W3_RESULTS}/w3-results-${p}.json`, JSON.stringify(RES, null, 1))
  const f = RES.filter(r => r.ok === false)
  console.log(`----- ${p}: ${RES.filter(r => r.ok).length} pass · ${f.length} fail · ${RES.filter(r => r.ok === null).length} notes${f.length ? ' · FAILS: ' + f.map(r => r.id).join(', ') : ''}`)
}
