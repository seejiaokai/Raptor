/* ff-w1 — walker W1 of the five-flags batch walk (26 Sep 26): [PUCK-FLAG-GLOW] (D164) — the "this is you" puck
   with a flag ring. Fable F13, F14, F15 and §2.1 (rows 1–14 and 18) of
   raptor-port/docs/superpowers/specs/2026-09-26-five-flags-scenarios-fable.md; the brief is
   raptor-port/docs/superpowers/briefs/2026-09-26-five-flags-walk-brief.md (W1).

   Drives the REAL production bundle already served at http://localhost:4176 (never rebuilds, never starts a
   server). Every fixture is made through the app's own controls (bug-check order §7.7): the board's arm-and-plant,
   "+ Row", "+ Item", the Unavailable "+ Add" dialog, the Logic page's edit box, the board's remarks box, the
   sign-off selects and Publish, Admin → Users, Logout / Sign in. Reads of window.DAYS / PEOPLE are for the table
   only. Every check asserts the RIGHT behaviour (PASS = correct), so re-running this IS the re-walk.

   The trap Fable names (a): the purple "this is you" class is PASSIVE — clicking that puck or any highlight chip
   removes it. This script never clicks a "you" puck (it plants through the palette with a slot armed, and drags by
   press-and-move, which fires no click); rings are read by computed style and pictures.

   Usage (from raptor-port/):  node scripts/handpass/ff-w1.mjs [A|B|C|D|E|F|G|all]   (or a comma list, e.g. C,D,E)
     SINCE D270 / D272 (27 Sep 26 — "Q2 yes", "question 2 yes"): flagged, his own puck wears the flag's OWN ring, as
     another man's does (amber, thin red, grey, the dotted ring alone), and in OIL Earn mode the green OIL ring; the
     purple fill stays. C2g, D1*, D2*, F9 assert that now (they asserted the purple ring before).
     A  before / after close-ups for the owner's card (solid ring; main's two old rules injected for "before")
     B  F14 — every surface that draws a flagged "you" puck (Saber, solid red), desktop and phone, published and
        not, the 👁 look, the ALL AVAIL window, the palettes, the mouse ghost
     C  F13 dashed + dotted — Outlaw (casper) with a sanctioned late show, signed in as him; before / after
     D  F13 amber / thin red / grey note — Wildcard and Static given accounts, each signed in
     E  F15 — the member's own puck (Ranger, `us`)
     F  the orders: you → flag on → undo → redo, a highlight chip, publish → unpublish, reload; the Leave War row
        (§2.1 row 18); the OIL mode (row 10)
     G  the finger ghost on a real touch phone (CDP touch events) */
process.env.HP_URL = 'http://localhost:4176'
/* pictures default to THIS checkout's folder (a hard-coded worktree path once pointed a re-walk at another chat's
   folder); FF_SHOTS sends a re-walk elsewhere */
process.env.HP_SHOTS = process.env.FF_SHOTS || new URL('../../docs/img/handpass/2026-09-26-five-flags/w1', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')
const L = await import('./am/w2-lib.mjs')      // am-lib (lib.mjs) + openHi
const W = await import('./am/w1-lib.mjs')      // checker, toastSpy, toasts, shotUnion, shotBox, boardType
const { open, openHi, go, board, closeBoard, editWeek, signDay, publishDay, unpublish, head, put, tap, lookAt, menuClose } = L
const { checker, toastSpy, toasts, shotUnion, shotBox, boardType } = W
import { mkdirSync } from 'node:fs'
mkdirSync(process.env.HP_SHOTS, { recursive: true })

const PART = (process.argv[2] || 'all').toUpperCase()
const want = (p) => PART === 'ALL' || PART.split(',').includes(p)
const DESK = { width: 1440, height: 900 }, PHONE = { width: 390, height: 844 }
const HARD = 'rgb(240, 85, 95)'
const PLAIN = `${HARD} 0px 0px 0px 2px`               // the plain 2px red ring every flagged puck wears
const ME_BG = 'rgb(155, 47, 174)'                      // --me, the purple "this is you" fill
/* main's two old rules (git show main:raptor-port/src/ui/scheduler.css), injected for the "before" pictures only */
const OLD_MAIN = '.puck.me.boxred{box-shadow:0 0 0 2px var(--hard),0 0 10px 1px rgba(240,85,95,.7)!important}' +
  '.puck.me.boxdash{outline:2px dashed var(--hard);box-shadow:0 0 10px 1px rgba(240,85,95,.7)!important}'
const SABER = 'stiff', RANGER = 'bane', OUTLAW = 'casper', WILDCARD = 'bapster', TALLY = 'nick', PIXEL = 'badger', STATIC = 'wolf'
const ALLERR = []

/* ---- reading a ring ---------------------------------------------------------------------------------------- */
/** the blurred layers of a computed box-shadow ("rgb(…) 0px 0px 10px 1px, …" → the layers whose blur is > 0) */
function blurred(bs) {
  if (!bs || bs === 'none') return []
  return bs.split(/,(?![^(]*\))/).map(s => s.trim()).filter(l => {
    const n = l.replace(/rgba?\([^)]*\)/g, '').replace(/\binset\b/g, '').match(/-?\d*\.?\d+px/g) || []
    return n.length >= 3 && parseFloat(n[2]) > 0
  })
}
/** every VISIBLE puck of person `pid` inside `scope`, with what the browser actually paints */
async function pucks(page, scope, pid) {
  return page.evaluate(([scope, pid]) => {
    const vis = e => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 && getComputedStyle(e).visibility !== 'hidden' }
    return [...document.querySelectorAll(`${scope} .puck[data-person="${pid}"]`)].filter(vis).map(e => {
      const cs = getComputedStyle(e)
      const at = e.closest('[data-slot]')?.dataset.slot || (e.closest('[data-awp]') ? 'window' : '') || e.closest('[data-fill]')?.dataset.fill
        || (e.closest('.rpuck') ? 'palette' : '') || (e.closest('[class*="unav"]') ? 'unav' : '') || (e.closest('.sec-avail') ? 'avail-list' : '')
        || (e.closest('.dsec') ? 'sec:' + e.closest('.dsec').className.replace(/\s+/g, '.') : '') || e.parentElement?.className || '?'
      return { at, cls: e.className.replace(/\s+/g, ' ').trim(), bs: cs.boxShadow, os: cs.outlineStyle, ow: cs.outlineWidth,
        oo: cs.outlineOffset, oc: cs.outlineColor, bg: cs.backgroundColor, chip: e.querySelector('.lchip')?.textContent || '' }
    })
  }, [scope, pid])
}
/** one-line reading of a puck for the log */
const rd = (m) => m ? `${m.at} [${m.cls}] bs=${m.bs} | outline=${m.os} ${m.ow} off ${m.oo} | bg=${m.bg} | chip=${m.chip}` : 'NONE'
/** the ring of a puck that is "you" AND flagged solid red is the plain ring — no blurred layer, purple fill kept */
const plainMe = (m) => !!m && /\bme\b/.test(m.cls) && /\bboxred\b/.test(m.cls) && m.bs === PLAIN && m.bg === ME_BG && m.os === 'none'
const plainOther = (m) => !!m && !/\bme\b/.test(m.cls) && /\bboxred\b/.test(m.cls) && m.bs === PLAIN

async function watch(page, errors, tag) {
  page.on('dialog', d => { console.log(`[${tag}] DIALOG: ${d.message()}`); d.accept().catch(() => {}) })
  return () => { const e = errors.splice(0); ALLERR.push(...e.map(x => `${tag}: ${x}`)); return e }
}
async function signOut(page) {
  for (const sel of ['#logout', '#accOut', '#guestOut']) {
    const l = page.locator(sel)
    if (await l.count() && await l.first().isVisible()) { await l.first().click(); await page.waitForTimeout(600); break }
  }
  if (await page.locator('#luser').count() === 0) {
    const b = page.locator('#burger')
    if (await b.count() && await b.isVisible()) { await b.click(); await page.waitForTimeout(300); await page.click('#drawerLogout'); await page.waitForTimeout(600) }
  }
  await page.waitForSelector('#luser')
}
async function signIn(page, name, pass = 'x') {
  if (await page.locator('#luser').count() === 0) await signOut(page)
  await page.fill('#luser', name); await page.fill('#lpass', pass)
  await page.click('#loginForm button[type=submit]')
  await page.waitForSelector('#vWeek .day', { state: 'attached' })
  await page.waitForTimeout(700)
  await page.addStyleTag({ content: '*{scroll-behavior:auto !important}' })
}
/** is anything selected or highlighted (which would strip the passive "you" class)? */
const focusOn = (page) => page.evaluate(() => ({ sel: document.querySelectorAll('.puck.sel').length, hl: document.querySelectorAll('.fchip.on').length }))
/** press a visible element where it really is: bring it to the middle of its scroll box, and if something (a sticky
    bar) sits over its centre, nudge until the element itself is what a press there lands on (a "+ add" label passes
    its press to the zone round it — pointer-events none — so the zone counts as a hit) */
async function press(page, loc) {
  await loc.waitFor({ state: 'visible', timeout: 8000 })
  await loc.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' }))
  await page.waitForTimeout(150)
  for (let i = 0; i < 6; i++) {
    const hit = await loc.evaluate(e => { const r = e.getBoundingClientRect(); const h = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return !!h && (h === e || e.contains(h) || (h.contains(e) && !!h.closest('[data-fill],[data-slot]'))) })
    if (hit) break
    await loc.evaluate(e => { let n = e.parentElement; while (n && n !== document.body) { const oy = getComputedStyle(n).overflowY
      if ((oy === 'auto' || oy === 'scroll') && n.scrollHeight > n.clientHeight + 1) { n.scrollTop += 70; return } n = n.parentElement } window.scrollBy(0, 70) })
    await page.waitForTimeout(120)
  }
  const b = await loc.boundingBox()
  await page.mouse.click(b.x + b.width / 2, b.y + b.height / 2)
  await page.waitForTimeout(300)
}
/** plant person pid into the board's append zone (`…+`) or seat `key`, ONCE, through the arm-and-plant: press the
    zone (it arms), then tap his puck in the board's crew palette. Verified by the day's own record growing by one
    mention of him — never by retrying the plant (a retry plants him twice). */
async function plant(page, key, pid, di = 0) {
  const zone = page.locator(key.endsWith('.+') ? `#schedBoard [data-fill="${key}"] .addz:visible` : `#schedBoard [data-slot="${key}"]:visible`).first()
  const n = () => page.evaluate(([i, p]) => (JSON.stringify(window.DAYS[i]).match(new RegExp(`"${p}"`, 'g')) || []).length, [di, pid])
  const n0 = await n()
  let armed = null
  for (let a = 0; a < 2 && !armed; a++) { await press(page, zone); armed = await page.evaluate(() => window.ARM && window.ARM.key) }
  if (!armed) return 'FAILED: the zone did not arm'
  const p = page.locator(`#sbRoster .rpuck[data-person="${pid}"]:visible`).first()
  if (!(await p.count())) { await page.keyboard.press('Escape'); return `FAILED: ${pid} not offered in the palette (armed ${armed})` }
  await press(page, p)
  await page.waitForTimeout(300)
  if (await page.evaluate(() => !!window.ARM)) { await page.keyboard.press('Escape'); await page.waitForTimeout(200) }
  const n1 = await n()
  return n1 === n0 + 1 ? `planted (${armed})` : `FAILED: ${n0}→${n1} mentions (armed ${armed})`
}
/** a close-up: the union of several visible elements, padded */
async function close(page, name, sels, pad = 14) {
  /* the phone's week shows one day at a time and pans sideways: bring the DAY the first element sits in to the
     front first (its own scroller, as a swipe would), then the element to the middle; the clip is kept inside the
     window, and a frame that cannot be drawn returns null instead of stopping the walk */
  const r = await page.evaluate(ss => {
    const vis = e => { const b = e.getBoundingClientRect(); return b.width > 0 && b.height > 0 }
    const els = ss.map(s => [...document.querySelectorAll(s)].find(vis)).filter(Boolean)
    if (!els.length) return null
    const day = els[0].closest('.day'); if (day && (day.getBoundingClientRect().left < 0 || day.getBoundingClientRect().right > innerWidth)) day.scrollIntoView({ block: 'nearest', inline: 'start' })
    els[0].scrollIntoView({ block: 'center', inline: 'nearest' })
    const bs = els.map(e => e.getBoundingClientRect())
    const x0 = Math.min(...bs.map(b => b.left)), y0 = Math.min(...bs.map(b => b.top)), x1 = Math.max(...bs.map(b => b.right)), y1 = Math.max(...bs.map(b => b.bottom))
    return { x0, y0, x1, y1, vw: innerWidth, vh: innerHeight }
  }, sels)
  if (!r) return null
  await page.waitForTimeout(250)
  const x = Math.max(0, r.x0 - pad), y = Math.max(0, r.y0 - pad)
  const w = Math.min(r.vw, r.x1 + pad) - x, h = Math.min(r.vh, r.y1 + pad) - y
  if (w < 4 || h < 4) return null
  await page.screenshot({ path: `${process.env.HP_SHOTS}/${name}.png`, clip: { x, y, width: w, height: h } })
  return name
}

/* ============================================================================================================ */
/* A — BEFORE / AFTER for the owner's card: Saber ("you", red C) beside Ranger (red C), Monday wave 1, the same     */
/*     formation. "after" is this branch as built; "before" is the same page with main's two old rules injected.   */
/* ============================================================================================================ */
if (want('A')) {
  const C = checker('A')
  for (const [w, vp] of [['desktop', DESK], ['phone', PHONE]]) {
    const { browser, page, errors } = await openHi({ ...vp, dpr: 3 })
    const drain = await watch(page, errors, 'A-' + w)
    await go(page, w === 'phone' ? 'viewsched' : 'editsched')
    const scope = w === 'phone' ? '#vWeek .day[data-day="0"]' : '#eWeek .day[data-day="0"]'
    const seats = [`${scope} [data-slot="0.0.0.0.p"]`, `${scope} [data-slot="0.0.0.1.p"]`]
    /* the phone draws View-only Sched (the edit week is a desktop surface); its seats carry the same data-slot */
    const all = await pucks(page, scope, SABER), allR = await pucks(page, scope, RANGER)
    C.log(`${w} Saber`, all.map(rd).join(' || '))
    C.log(`${w} Ranger`, allR.map(rd).join(' || '))
    const meRed = all.filter(m => /\bboxred\b/.test(m.cls))
    C.check(`A1-${w}`, meRed.length > 0 && meRed.every(plainMe), `after (this branch): every flagged "you" puck of Saber's on Monday wears the plain 2px red ring, no glow, purple fill`, meRed.map(m => m.at + ' ' + m.bs).join(' | '))
    C.check(`A2-${w}`, allR.filter(m => /boxred/.test(m.cls)).every(plainOther) && meRed.length && meRed[0].bs === allR.find(m => /boxred/.test(m.cls))?.bs,
      `after: Saber's ring is byte-identical to Ranger's (a flagged puck that is not "you")`, `${meRed[0]?.bs} vs ${allR[0]?.bs}`)
    /* the close-up: Saber and Ranger in the same formation on the edit week; on the phone, the same two on View-only */
    const pair = seats
    await close(page, `A-${w}-after-branch-saber-you-beside-ranger`, pair)
    const tag = await page.addStyleTag({ content: OLD_MAIN })
    await page.waitForTimeout(200)
    const old = (await pucks(page, scope, SABER)).filter(m => /\bboxred\b/.test(m.cls))
    C.check(`A3-${w}`, old.length && old.every(m => blurred(m.bs).length === 1), `before (main's rules injected): the same puck carries ONE blurred red layer — the glow the owner saw`, old[0]?.bs)
    await close(page, `A-${w}-before-main-saber-you-glows-beside-ranger`, pair)
    await tag.evaluate(e => e.remove())
    await page.waitForTimeout(200)
    const back = (await pucks(page, scope, SABER)).filter(m => /\bboxred\b/.test(m.cls))
    C.check(`A4-${w}`, back.every(plainMe), 'the injected rules removed again: the plain ring is back (the picture pair is a fair comparison)')
    if (w === 'desktop') await page.screenshot({ path: `${process.env.HP_SHOTS}/A-desktop-monday-edit-week-context.png`, clip: { x: 0, y: 0, width: 1440, height: 900 } })
    const e = drain(); C.check(`A5-${w}`, e.length === 0, 'no console errors, page errors or 4xx', e.join(' | '))
    await browser.close()
  }
  C.summary()
}

/** a picture of one puck in its place: the n-th visible puck of `pid` inside `scope`, scrolled to the middle the way
    a person scrolls (its own scroll box), clipped with room around it so the neighbours are in the frame */
async function puckShot(page, name, scope, pid, { n = 0, at = null, padX = 120, padY = 30 } = {}) {
  const r = await page.evaluate(([scope, pid, n, at]) => {
    const vis = e => { const b = e.getBoundingClientRect(); return b.width > 0 && b.height > 0 }
    let els = [...document.querySelectorAll(`${scope} .puck[data-person="${pid}"]`)].filter(vis)
    if (at) els = els.filter(e => (e.closest('[data-slot]')?.dataset.slot || e.closest('[data-fill]')?.dataset.fill
      || (e.closest('[class*="unav"]') ? 'unav' : '') || (e.closest('.rpuck') ? 'palette' : '') || '').startsWith(at))
    const e = els[n]; if (!e) return null
    e.scrollIntoView({ block: 'center', inline: 'center' })
    const b = e.getBoundingClientRect()
    return { x: b.x, y: b.y, w: b.width, h: b.height, vw: innerWidth, vh: innerHeight }
  }, [scope, pid, n, at])
  if (!r) return null
  await page.waitForTimeout(200)
  const x = Math.max(0, r.x - padX), y = Math.max(0, r.y - padY)
  await page.screenshot({ path: `${process.env.HP_SHOTS}/${name}.png`,
    clip: { x, y, width: Math.min(r.vw - x, r.w + 2 * padX), height: Math.min(r.vh - y, r.h + 2 * padY) } })
  return name
}
const shoot = (page, name) => page.screenshot({ path: `${process.env.HP_SHOTS}/${name}.png` })
/** run one step; an exception is a FAIL with its message, never a silent stop */
async function step(C, id, what, fn) {
  try { return await fn() } catch (e) { C.check(id, false, what + ' — THREW', String(e && e.message || e).split('\n')[0].slice(0, 300)); return null }
}
/** judge every flagged puck of Saber's in a list: each must be plain (me) and none may glow */
function judge(C, id, what, list, { expectMe = true, need = 1 } = {}) {
  const red = list.filter(m => /\bboxred\b/.test(m.cls))
  const bad = red.filter(m => expectMe ? !plainMe(m) : m.bs !== PLAIN)
  const glow = list.filter(m => /\bbox(red|dash)\b/.test(m.cls) && blurred(m.bs).length)
  C.check(id, red.length >= need && !bad.length && !glow.length, what,
    `${red.length} flagged (${red.map(m => m.at).join(', ')})${bad.length ? ' · NOT PLAIN: ' + bad.map(rd).join(' || ') : ''}${glow.length ? ' · GLOWS: ' + glow.map(rd).join(' || ') : ''}`)
  return red
}

/* ============================================================================================================ */
/* B — F14: every surface that draws a flagged "you" puck (Saber, solid red C on Monday), both widths.            */
/* ============================================================================================================ */
if (want('B')) {
  const C = checker('B')
  const { browser, page, errors } = await openHi({ ...DESK, dpr: 2 })
  const drain = await watch(page, errors, 'B')
  await toastSpy(page)
  await editWeek(page)
  await board(page, 0)
  /* ---- the fixture, through the board's own controls: Saber onto every KIND of row on Monday ---- */
  const planted = {}
  await step(C, 'B0', 'plant', async () => {
    const btn = (s) => page.locator(`#schedBoard ${s}:visible`).first()
    /* ---- 12 first: the ALL AVAIL window. The crowd behind ALL AVAIL is the aircrew with nothing else on at that
       row's time, so Saber (flagged all day) is in it only on a row where he is free: try the seed's programme rows
       in turn, planting ALL AVAIL through the board and opening the row's count chip, until his name is in the list. */
    for (const k of ['a:0.6', 'a:0.5', 'a:0.4', 'a:0.3']) {
      planted.allAvail = await plant(page, k + '.+', 'allavail')
      const chip = page.locator(`#schedBoard [data-fill="${k}.+"] .oilcount[data-oilsent]:visible`).first()
      if (!(await chip.count())) { C.log('B5 no count chip on', k); continue }
      await press(page, chip); await page.waitForTimeout(800)
      const w = await pucks(page, '.availwin', SABER)
      const title = await page.evaluate(() => document.querySelector('.availwin .win-ttl')?.innerText.replace(/\s+/g, ' '))
      C.log('B5 window', { row: k, title, saber: w.map(rd) })
      if (w.length) {
        const wrap = await page.evaluate(pid => { const r = document.querySelector(`.availwin [data-awp="${pid}"]`); return r ? { cls: r.className, text: r.innerText.replace(/\s+/g, ' ').slice(0, 200) } : null }, SABER)
        await puckShot(page, 'B5-desktop-allavail-window-saber', '.availwin', SABER, { padX: 160, padY: 50 })
        await shoot(page, 'B5-desktop-allavail-window-full')
        C.check('B5', w.length === 1 && /\bme\b/.test(w[0].cls) && !blurred(w[0].bs).filter(l => /240, 85, 95/.test(l)).length && (!/boxred/.test(w[0].cls) || w[0].bs === PLAIN),
          'ALL AVAIL window (roll-call 12): Saber listed — "you" puck, a red box if any is plain, no glow; his flag in words beside it', { row: k, puck: w.map(rd), wrap })
      }
      const x = page.locator('.availwin .x:visible, .availwin [aria-label="Close"]:visible, .availwin [aria-label*="lose"]:visible').first()
      if (await x.count()) { await x.click(); await page.waitForTimeout(400) }
      if (w.length) { planted.windowRow = k; break }
    }
    if (!planted.windowRow) C.check('B5', false, 'ALL AVAIL window (roll-call 12): Saber never appeared in the crowd on any row tried')
    planted.deskExtras = await plant(page, 'd:0.0.0.+', SABER)                     // SDO desk 07:00–13:00, extras line
    C.log('B0 desk extras', planted.deskExtras)
    await press(page, btn('[data-dradd="0.0"]')); await page.waitForTimeout(400)  // + Row on the 1st-wave desk block
    const nd = await page.evaluate(() => window.DAYS[0].dutywaves[0].rows.length - 1)
    planted.deskHolder = await plant(page, `d:0.0.${nd}.+`, SABER)                // the new desk row's holder
    planted.deskHolderIs = await page.evaluate(n => window.DAYS[0].dutywaves[0].rows[n].id, nd)
    C.log('B0 desk holder', planted.deskHolder)
    planted.simPax = await plant(page, 's:0.amt.1.pax.8', SABER)                   // the BOX sim's passenger line
    planted.simExtras2 = await plant(page, 's:0.oft.4.+', SABER)                    // EP-6N's extras line
    planted.simExtras = await plant(page, 's:0.oft.1.x0', SABER)                   // EP-4 (Ranger's) extras seat
    planted.groundExtras = await plant(page, 'g:0.1.+', SABER)                     // STAFF MTG @ HQ, extras
    C.log('B0 sim + ground', planted)
    await press(page, btn('[data-gradd="0"]')); await page.waitForTimeout(400)    // + Item on the ground programme
    const ng = await page.evaluate(() => window.DAYS[0].ground.length - 1)
    planted.groundName = await plant(page, `g:0.${ng}.+`, SABER)                   // the new ground row's name
    planted.groundNameIs = await page.evaluate(n => window.DAYS[0].ground[n].who, ng)
    /* the Unavailable block: "+ Add" → the dialog → Saber, the first unavailability type → Add */
    const before = await page.evaluate(() => window.INPUTS.length)
    await press(page, btn('[data-inpadd="0.u"]')); await page.waitForTimeout(500)
    await page.selectOption('#inpEditPerson', SABER); await page.waitForTimeout(200)
    const typ = await page.evaluate(() => { const s = document.querySelector('#inpEditType'); return s ? s.options[s.selectedIndex].text : document.querySelector('#inpEditTypeFixed')?.textContent })
    await page.locator('#inpEditSave:visible').first().click(); await page.waitForTimeout(800)
    /* a clash confirm may follow (he is planted that day) — answer it the way a scheduler filing leave does */
    for (const re of [/^(Add|File|Yes|Confirm|Keep|Save)/i]) {
      const b = page.getByRole('button', { name: re }).first()
      if (await b.count() && await b.isVisible().catch(() => false)) { C.log('B0 confirm', await b.innerText()); await b.click(); await page.waitForTimeout(700) }
    }
    const after = await page.evaluate(() => window.INPUTS.length)
    planted.leave = after > before ? `filed (${typ})` : `NOT FILED (${typ})`
    C.log('B0 planted', planted)
    C.log('B0 toasts', await toasts(page))
    const d = await page.evaluate(([pid]) => { const D = window.DAYS[0], has = v => v === pid || (Array.isArray(v) && v.includes(pid))
      return { desk: D.dutywaves[0].rows.map(r => `${r.role}:${r.id}${(r.more || []).length ? '+' + r.more : ''}`), ground: D.ground.slice(-1).concat(D.ground[1]).map(g => `${g.prog}:${g.who}+${g.more || ''}`),
        pax: D.sims.oft[4].pax, oft1: [D.sims.oft[1].p, D.sims.oft[1].w, ...(D.sims.oft[1].more || [])], prog8: D.allhands[8].who } }, [SABER])
    C.log('B0 the day now', d)
    const ok = Object.values(planted).every(v => !/FAILED|NOT FILED/.test(String(v)))
    C.check('B0', ok, 'fixture made through the board: Saber on a desk (holder + extras), a sim (pax + extras), a ground row (name + extras), ALL AVAIL on a programme row, and leave filed for him on Monday', planted)
    const f = await focusOn(page); C.check('B0b', !f.sel && !f.hl, 'nothing selected or highlighted after the fixture (the passive "you" class can show)', f)
  })

  /* ---- 8: the desktop board — cockpit, programme, desk, sim, ground, Unavailable, the roster ---- */
  await step(C, 'B1', 'desktop board', async () => {
    const all = await pucks(page, '#schedBoard .sb-boardwrap', SABER)
    C.log('B1 board Saber pucks', all.map(rd).join(' || '))
    judge(C, 'B1', 'desktop board: every flagged "you" puck of Saber (cockpit, programme, desk holder + extras, sim seat + pax + extras, ground name + extras, Unavailable) wears the plain red ring, no glow', all, { need: 8 })
    const kinds = { cockpit: '0.0.0.0.p', programme: 'a:0.7.', 'desk-extras': 'd:0.0.0.x', 'desk-holder': 'd:0.0.3', 'sim-seat': 's:0.oft.0.w',
      'sim-pax': 's:0.amt.1.pax', 'sim-extras': 's:0.oft.1.x', 'sim-extras-2': 's:0.oft.4.x', 'ground-extras': 'g:0.1.x', 'ground-name': 'g:0.9', unavailable: 'unav' }
    const seen = Object.fromEntries(Object.entries(kinds).map(([k, pre]) => [k, all.some(m => String(m.at).startsWith(pre))]))
    C.check('B1b', Object.values(seen).every(Boolean), 'desktop board draws Saber on each kind of row (roll-call row 8: cockpit, programme, desk holder + extras, sim seat + pax + extras, ground name + extras, Unavailable)', seen)
    for (const [nm, pre] of Object.entries(kinds)) if (seen[nm]) await puckShot(page, `B1-desktop-board-${nm}`, '#schedBoard .sb-boardwrap', SABER, { at: pre })
    const ros = await pucks(page, '#sbRoster', SABER)
    C.log('B1 board roster Saber', ros.map(rd).join(' || '))
    C.check('B1c', ros.length === 1 && ros.every(m => /\bme\b/.test(m.cls) && (!/boxred/.test(m.cls) || m.bs === PLAIN) && !blurred(m.bs).filter(l => /240, 85, 95/.test(l)).length),
      'board roster (crew palette): Saber\'s puck is "you"; if it carries the red box it is plain, and no red glow', ros.map(rd))
    await puckShot(page, 'B1-desktop-board-roster', '#sbRoster', SABER, { padX: 90, padY: 40 })
    await shoot(page, 'B1-desktop-board-full')
  })

  /* ---- 14: the MOUSE ghost — press Saber's cockpit puck and move; read the ghost; drop back on the same seat ---- */
  await step(C, 'B2', 'mouse ghost', async () => {
    const src = page.locator('#schedBoard .sb-boardwrap [data-slot="0.0.0.0.p"] .puck:visible').first()
    await src.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await page.waitForTimeout(200)
    const b = await src.boundingBox()
    await toasts(page)
    await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2)
    await page.mouse.down()
    await page.mouse.move(b.x + b.width / 2 + 40, b.y + b.height / 2 + 60, { steps: 8 })
    await page.waitForTimeout(300)
    const g = await page.evaluate(() => {
      const e = document.querySelector('.dragimg'); if (!e) return null
      const cs = getComputedStyle(e), be = getComputedStyle(e, '::before'), r = e.getBoundingClientRect()
      return { cls: e.className, bs: cs.boxShadow, bg: cs.backgroundColor, before: be.boxShadow, beforeContent: be.content, x: r.x, y: r.y, w: r.width, h: r.height }
    })
    C.log('B2 ghost', g)
    if (g) await page.screenshot({ path: `${process.env.HP_SHOTS}/B2-desktop-mouse-ghost-of-saber.png`, clip: { x: Math.max(0, g.x - 40), y: Math.max(0, g.y - 30), width: g.w + 80, height: g.h + 70 } })
    /* the promise: no glow on the flagged ghost; the lift box drawn on the veil. Depth shadow: reported, see below */
    C.check('B2', !!g && /\blift\b/.test(g.cls) && !blurred(g.bs).filter(l => /240, 85, 95/.test(l)).length && /59, 198, 232/.test(g.before),
      'mouse ghost of the flagged "you" puck: the cyan lift box on its veil, no red glow', g && { bs: g.bs, before: g.before })
    C.note('B2n', 'the ghost\'s own box-shadow (where the dark depth shadow lives) — the puck\'s !important ring rule wins over .dragimg.lift', g && g.bs)
    await page.mouse.move(b.x + b.width / 2 + 10, b.y + b.height / 2 + 20, { steps: 4 })
    await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2, { steps: 4 })
    await page.waitForTimeout(150)
    await page.mouse.up(); await page.waitForTimeout(600)
    const t = await toasts(page)
    C.check('B2b', t.some(s => /Already in that seat/.test(s)), 'dropping him back on his own seat says "Already in that seat"', t)
    const after = (await pucks(page, '#schedBoard .sb-boardwrap [data-slot="0.0.0.0.p"]', SABER))[0]
    C.check('B2c', plainMe(after), 'after the drop-back his puck is still "you" with the plain ring (the drag fired no click that would strip it)', rd(after))
    /* the same press on Ranger (flagged, NOT "you") — is the missing dark depth shadow the "you" puck's alone, or every
       flagged puck's? (it decides whether B2n is about this change at all) */
    const rsrc = page.locator('#schedBoard .sb-boardwrap [data-slot="0.0.0.1.p"] .puck:visible').first()
    await rsrc.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await page.waitForTimeout(200)
    const rb = await rsrc.boundingBox()
    await page.mouse.move(rb.x + rb.width / 2, rb.y + rb.height / 2); await page.mouse.down()
    await page.mouse.move(rb.x + rb.width / 2 + 40, rb.y + rb.height / 2 + 60, { steps: 8 }); await page.waitForTimeout(300)
    const rg = await page.evaluate(() => { const e = document.querySelector('.dragimg'); return e ? { cls: e.className, bs: getComputedStyle(e).boxShadow, before: getComputedStyle(e, '::before').boxShadow } : null })
    await page.mouse.move(rb.x + rb.width / 2, rb.y + rb.height / 2, { steps: 6 }); await page.waitForTimeout(150)
    await page.mouse.up(); await page.waitForTimeout(500); await toasts(page)
    C.note('B2d', 'Ranger\'s ghost (flagged, not "you"): its own box-shadow is the red ring too — the dark depth shadow is lost for EVERY flagged puck\'s ghost, not only the "you" one (the plain .puck.boxred rule is !important as well; unchanged from main)', rg)
  })

  /* ---- 9: the PHONE board, and the phone drawer as the picker ---- */
  await step(C, 'B3', 'phone board', async () => {
    await page.setViewportSize(PHONE); await page.waitForTimeout(900)
    const all = await pucks(page, '#schedBoard', SABER)
    C.log('B3 phone board Saber pucks', all.map(rd).join(' || '))
    judge(C, 'B3', 'phone board: every flagged "you" puck of Saber wears the plain red ring, no glow', all, { need: 6 })
    for (const [nm, pre] of [['cockpit', '0.0.0.0.p'], ['programme', 'a:0.7.'], ['desk-extras', 'd:0.0.0.x'], ['sim-pax', 's:0.amt.1.pax'], ['ground-name', 'g:0.9'], ['unavailable', 'unav']])
      await puckShot(page, `B3-phone-board-${nm}`, '#schedBoard', SABER, { at: pre, padX: 80, padY: 40 })
    await shoot(page, 'B3-phone-board-full')
    /* arm an empty seat — the drawer opens as the picker; Saber is in it */
    await press(page, page.locator('#schedBoard [data-fill="a:0.9.+"] .addz:visible').first()); await page.waitForTimeout(700)
    C.log('B3 armed', await page.evaluate(() => window.ARM && window.ARM.key))
    const dr = await page.evaluate((pid) => {
      const vis = e => { const b = e.getBoundingClientRect(); return b.width > 0 && b.height > 0 }
      return [...document.querySelectorAll(`.rpuck[data-person="${pid}"] .puck, .rpuck .puck[data-person="${pid}"]`)].filter(vis).map(e => {
        const cs = getComputedStyle(e); return { cls: e.className, bs: cs.boxShadow, bg: cs.backgroundColor, host: e.closest('[id]')?.id } })
    }, SABER)
    C.log('B3 drawer Saber', dr)
    await shoot(page, 'B3-phone-drawer-armed-saber-in-picker')
    C.check('B3b', dr.length >= 1 && dr.every(m => /\bme\b/.test(m.cls) && !blurred(m.bs).filter(l => /240, 85, 95/.test(l)).length && (!/boxred/.test(m.cls) || m.bs === PLAIN)),
      'phone drawer (the picker, a seat armed): Saber\'s puck is "you", no red glow, a red box if any is plain', dr)
    await page.keyboard.press('Escape'); await page.waitForTimeout(300)
    if (await page.evaluate(() => !!window.ARM)) { await page.keyboard.press('Escape'); await page.waitForTimeout(300) }
    await page.setViewportSize(DESK); await page.waitForTimeout(900)
  })

  /* ---- 1–6: the EDIT WEEK (the board closed) — every kind of row, and the Edit aside palette ---- */
  await step(C, 'B4', 'edit week', async () => {
    await closeBoard(page); await go(page, 'editsched')
    const all = await pucks(page, '#eWeek .day[data-day="0"]', SABER)
    C.log('B4 edit week Saber pucks', all.map(rd).join(' || '))
    judge(C, 'B4', 'edit week (roll-call 1–6): every flagged "you" puck of Saber — flying seat, desk holder + extras, sim seat + pax + extras, ground name + extras, programme, Unavailable — plain ring, no glow', all, { need: 8 })
    const kinds = { cockpit: /^0\.0\.0\.0\.p$/, desk: /^d:0\.0\./, sim: /^s:0\.oft\./, ground: /^g:0\./, programme: /^a:0\./, unavailable: /^(iu:|unav)/ }
    const seen = Object.fromEntries(Object.entries(kinds).map(([k, re]) => [k, all.filter(m => re.test(String(m.at))).length]))
    C.check('B4b', Object.values(seen).every(n => n > 0), 'the edit week draws Saber on each kind of row', seen)
    for (const [nm, re] of Object.entries(kinds)) {
      const m = all.find(x => re.test(String(x.at))); if (m) await puckShot(page, `B4-desktop-editweek-${nm}`, '#eWeek .day[data-day="0"]', SABER, { at: m.at })
    }
    const aside = await pucks(page, '#eRoster', SABER)
    C.log('B4 edit aside Saber', aside.map(rd))
    if (aside.length) await puckShot(page, 'B4-desktop-edit-aside-palette', '#eRoster', SABER, { padX: 90, padY: 40 })
    C.check('B4c', aside.length >= 1 && aside.every(m => /\bme\b/.test(m.cls) && !blurred(m.bs).filter(l => /240, 85, 95/.test(l)).length),
      'the Edit aside palette draws Saber "you", no red glow', aside.length ? aside.map(rd) : 'NOT DRAWN (the aside is empty until a day is picked?)')
  })

  /* ---- 7: View-only Sched, unpublished Monday ---- */
  await step(C, 'B6', 'view unpublished', async () => {
    await go(page, 'viewsched')
    const all = await pucks(page, '#vWeek .day[data-day="0"]', SABER)
    judge(C, 'B6', 'View-only Sched, Monday not yet published: every flagged "you" puck of Saber is plain', all, { need: 6 })
    await puckShot(page, 'B6-desktop-view-unpublished-cockpit', '#vWeek .day[data-day="0"]', SABER, { at: '0.0.0.0.p' })
    await page.setViewportSize(PHONE); await page.waitForTimeout(800)
    const ph = await pucks(page, '#vWeek .day[data-day="0"]', SABER)
    judge(C, 'B6p', 'the same on the phone (390): every flagged "you" puck of Saber is plain', ph, { need: 6 })
    await puckShot(page, 'B6-phone-view-unpublished-cockpit', '#vWeek .day[data-day="0"]', SABER, { at: '0.0.0.0.p', padX: 80, padY: 40 })
    await page.setViewportSize(DESK); await page.waitForTimeout(800)
  })

  /* ---- 7 + 13: publish Monday; the issued face (frozen rings) and the live one; the 👁 look, week and board ---- */
  await step(C, 'B7', 'published', async () => {
    await editWeek(page)
    const s = await signDay(page, 0); const p = await publishDay(page, 0)
    C.log('B7 sign + publish', { s, p, head: await head(page, 0) })
    await go(page, 'viewsched')
    const pub = await pucks(page, '#vWeek .day[data-day="0"]', SABER)
    C.log('B7 view published Saber', pub.map(rd).join(' || '))
    judge(C, 'B7', 'View-only Sched, Monday PUBLISHED (the issued face, frozen rings): every flagged "you" puck of Saber is plain', pub, { need: 6 })
    await puckShot(page, 'B7-desktop-view-published-cockpit', '#vWeek .day[data-day="0"]', SABER, { n: 1 })
    await shoot(page, 'B7-desktop-view-published-full')
    /* an amendment after publishing, so the working copy and the issued version differ — then 👁 the Original */
    await board(page, 0)
    const am = await plant(page, 'a:0.9.+', SABER)
    C.log('B7 amendment', am)
    await closeBoard(page); await editWeek(page)
    C.log('B7 head after the amendment', await head(page, 0))
    const live = await pucks(page, '#eWeek .day[data-day="0"]', SABER)
    judge(C, 'B7b', 'edit week with a pending amendment (the live face): every flagged "you" puck plain', live, { need: 8 })
    const looked = await lookAt(page, 0, /Original|ORIG/)
    await page.waitForTimeout(500)
    const pvSel = '#eWeek .day.preview[data-day="0"]'
    const pv = await pucks(page, pvSel, SABER)
    C.log('B7 look (week) Saber', { looked, dayCls: await page.evaluate(() => document.querySelector('#eWeek .day[data-day="0"]').className), pv: pv.map(rd).join(' || ') })
    judge(C, 'B7c', '👁 look at the issued Original on the edit week (the version\'s own flags, D187): every flagged "you" puck plain', pv, { need: 1 })
    await puckShot(page, 'B7-desktop-look-original-week-cockpit', pvSel, SABER, { n: 1 })
    await shoot(page, 'B7-desktop-look-original-week-full')
    await L.planMenuItems(page, 0); const lv = await L.menuLive(page); if (!lv) await menuClose(page)
    C.log('B7 back to live', { lv, dayCls: await page.evaluate(() => document.querySelector('#eWeek .day[data-day="0"]').className) })
    await board(page, 0)
    const lb = await lookAt(page, 0, /Original|ORIG/)
    await page.waitForTimeout(500)
    const pvb = await pucks(page, '#schedBoard .pv-frozen', SABER)
    C.log('B7 look (board) Saber', { lb, pv: pvb.map(rd).join(' || ') })
    judge(C, 'B7d', '👁 look at the issued Original on the board: every flagged "you" puck plain', pvb, { need: 1 })
    await puckShot(page, 'B7-desktop-look-original-board-cockpit', '#schedBoard .pv-frozen', SABER, { padX: 140, padY: 40 })
    await shoot(page, 'B7-desktop-look-original-board-full')
    await closeBoard(page)
  })
  const e = drain(); C.check('B9', e.length === 0, 'no console errors, page errors or 4xx during B', e.join(' | '))
  await browser.close()
  C.summary()
}

/** the Logic page's own edit box for one rule (✎ Edit rules first), typed and committed as a person does */
async function setRule(page, key, value) {
  await go(page, 'logic')
  const ed = page.locator('#lgEdit:visible').first()
  if (await ed.count()) { await ed.click(); await page.waitForTimeout(300) }
  const box = page.locator(`#lgBody .lgin[data-lgset="${key}"]:visible`).first()
  if (!(await box.count())) return 'NO EDIT BOX for ' + key
  await box.evaluate(e => e.scrollIntoView({ block: 'center' }))
  const was = await box.inputValue()
  await box.click(); await box.fill(String(value)); await box.press('Tab'); await page.waitForTimeout(700)
  return { was, now: await page.evaluate(k => window.VCONF && window.VCONF[k], key) }
}
/** Admin → Users: add an account through the form (sign-in name, callsign, role) */
async function addAccount(page, name, pid, role = 'admin') {
  await go(page, 'admin')
  await page.fill('#accAddName', name)
  await page.selectOption('#accAddPid', pid)
  await page.selectOption('#accAddRole', role)
  await page.click('#accAdd'); await page.waitForTimeout(500)
  return page.evaluate(n => [...document.querySelectorAll('#accList *')].some(e => (e.textContent || '').trim() === n), name)
}
/** the puck of person pid in seat `slot` on day di, on whichever week is showing (edit or view) */
const seatPuck = (page, di, slot, pid) => pucks(page, `.week .day[data-day="${di}"] [data-slot="${slot}"]`, pid).then(a => a[0])
const onWeek = async (page) => (await page.evaluate(() => window.CURPAGE)) === 'editsched' ? '#eWeek' : '#vWeek'

/* ============================================================================================================ */
/* C — F13, the DASHED and DOTTED rings on your own puck: Outlaw (casper). His Tuesday breach is solid in the seed  */
/*     (too deep for a late show); "LATE SHOW" on his line plus crew rest 8h (Logic) puts it in the sanctioned band */
/*     = dashed; his Monday is the day that causes it = dotted. Outlaw has a seeded member account ("outlaw").     */
/* ============================================================================================================ */
if (want('C')) {
  const C = checker('C')
  const { browser, page, errors } = await openHi({ ...DESK, dpr: 3 })
  const drain = await watch(page, errors, 'C')
  await toastSpy(page)
  const tue = (p) => seatPuck(p, 1, '1.0.0.1.p', OUTLAW), mon = (p) => pucks(p, '.week .day[data-day="0"]', OUTLAW).then(a => a.find(m => /boxdot/.test(m.cls)))
  await step(C, 'C1', 'the late show remark', async () => {
    await board(page, 1)
    await boardType(page, 'fr:1.0.0.1', '2A: LATE SHOW'); await page.waitForTimeout(400)
    await closeBoard(page); await go(page, 'editsched')
    const t = await tue(page), m = await mon(page)
    C.log('C1 as Saber (Outlaw not you) Tue', rd(t)); C.log('C1 as Saber Mon', rd(m))
    C.check('C1', t && /boxred/.test(t.cls) && t.bs === PLAIN && m && /boxdot/.test(m.cls),
      'as Saber, with the remark but crew rest still 12h: Outlaw\'s Tuesday is still SOLID (too deep to sanction — the seed case), his Monday DOTTED', { tue: rd(t), mon: rd(m) })
    await close(page, 'C1-desktop-as-saber-outlaw-tue-solid-not-you', ['#eWeek .day[data-day="1"] [data-slot="1.0.0.1.p"]', '#eWeek .day[data-day="1"] [data-slot="1.0.0.0.p"]'])
  })
  await step(C, 'C2', 'Outlaw solid + dotted, as himself', async () => {
    await signOut(page); await signIn(page, 'outlaw', 'x')
    C.log('C2 lands on', await page.evaluate(() => window.CURPAGE)); await go(page, 'viewsched')
    const wk = await onWeek(page)
    C.log('C2 signed in as outlaw, page', { page: await page.evaluate(() => window.CURPAGE), wk })
    const t = await tue(page), m = await mon(page)
    C.log('C2 Tue (you, solid)', rd(t)); C.log('C2 Mon (you, dotted)', rd(m))
    C.check('C2', t && /\bme\b/.test(t.cls) && plainMe(t), 'signed in as Outlaw: his SOLID crew-rest puck is "you" with the plain red ring, no glow (D164)', rd(t))
    await close(page, 'C2-desktop-as-outlaw-tue-solid-you', [`${wk} .day[data-day="1"] [data-slot="1.0.0.1.p"]`, `${wk} .day[data-day="1"] [data-slot="1.0.0.0.p"]`])
    /* Fable's read, F1 (27 Sep 26): a flagged "you" puck keeps its purple ring but loses the blur for EVERY kind of
       flag — the dotted one included (`.puck.me.boxdot`). Asserted, so the re-walk proves the fix. */
    /* D270 reading (1), 27 Sep 26: flagged by the dotted cause ring, his puck shows the dotted ring ALONE, as another
       man's does — nothing purple behind it; the purple fill stays */
    C.check('C2g', m && /\bme\b/.test(m.cls) && m.os === 'dotted' && m.bs === 'none' && m.bg === ME_BG,
      'the DOTTED ring on his own puck: the dotted ring alone, nothing purple behind it, purple fill (D270)', m && { bs: m.bs, outline: `${m.os} ${m.ow} off ${m.oo}`, bg: m.bg })
    await close(page, 'C2-desktop-as-outlaw-mon-dotted-you', [`${wk} .day[data-day="0"] .puck.boxdot[data-person="${OUTLAW}"]`], 22)
  })
  await step(C, 'C3', 'crew rest 8h — the breach becomes sanctioned', async () => {
    await signOut(page); await signIn(page, 'ad', 'a')
    const r = await setRule(page, 'crewRest', '8h')
    C.log('C3 crew rest', r)
    await go(page, 'editsched')
    const t = await tue(page)
    C.check('C3', t && /boxdash/.test(t.cls) && !/\bme\b/.test(t.cls) && t.bs === 'none' && t.os === 'dashed',
      'as Saber, crew rest 8h: Outlaw\'s Tuesday turns DASHED (sanctioned late show), nothing solid behind the dashes (not "you")', rd(t))
    await close(page, 'C3-desktop-as-saber-outlaw-tue-dashed-not-you', ['#eWeek .day[data-day="1"] [data-slot="1.0.0.1.p"]', '#eWeek .day[data-day="1"] [data-slot="1.0.0.0.p"]'])
  })
  await step(C, 'C4', 'Outlaw dashed, as himself', async () => {
    await signOut(page); await signIn(page, 'outlaw', 'x'); await go(page, 'viewsched')
    const wk = await onWeek(page)
    const t = await tue(page), m = await mon(page)
    C.log('C4 Tue (you, dashed)', rd(t)); C.log('C4 Mon (you, dotted)', rd(m))
    C.check('C4', t && /\bme\b/.test(t.cls) && /boxdash/.test(t.cls) && t.bs === 'none' && t.os === 'dashed' && t.ow === '2px' && t.oc === HARD && t.bg === ME_BG,
      'signed in as Outlaw: his DASHED puck is "you" — dashed 2px red outline, NOTHING behind the dashes (no glow, no solid ring), purple fill (D164)', rd(t))
    await close(page, `C4-desktop-after-branch-as-outlaw-tue-dashed-you`, [`${wk} .day[data-day="1"] [data-slot="1.0.0.1.p"]`, `${wk} .day[data-day="1"] [data-slot="1.0.0.0.p"]`])
    const tag = await page.addStyleTag({ content: OLD_MAIN }); await page.waitForTimeout(200)
    const o = await tue(page)
    C.check('C4b', o && blurred(o.bs).length === 1, 'before (main\'s rules injected): the same dashed "you" puck carries a blurred red haze behind the dashes', o && o.bs)
    await close(page, `C4-desktop-before-main-as-outlaw-tue-dashed-you-haze`, [`${wk} .day[data-day="1"] [data-slot="1.0.0.1.p"]`, `${wk} .day[data-day="1"] [data-slot="1.0.0.0.p"]`])
    await tag.evaluate(e => e.remove()); await page.waitForTimeout(200)
    /* the phone */
    await page.setViewportSize(PHONE); await page.waitForTimeout(800)
    const tp = await tue(page)
    C.check('C4p', tp && /\bme\b/.test(tp.cls) && tp.bs === 'none' && tp.os === 'dashed', 'the same on the phone (390): dashed, nothing behind', rd(tp))
    await close(page, 'C4-phone-as-outlaw-tue-dashed-you', [`#vWeek .day[data-day="1"] [data-slot="1.0.0.1.p"]`, `#vWeek .day[data-day="1"] [data-slot="1.0.0.0.p"]`])
    const mp = await mon(page)
    await close(page, 'C4-phone-as-outlaw-mon-dotted-you', [`#vWeek .day[data-day="0"] .puck.boxdot[data-person="${OUTLAW}"]`], 22)
    C.log('C4 phone Mon dotted', rd(mp))
    await page.setViewportSize(DESK); await page.waitForTimeout(600)
  })
  const e = drain(); C.check('C9', e.length === 0, 'no console errors, page errors or 4xx during C', e.join(' | '))
  await browser.close()
  C.summary()
}

/* ============================================================================================================ */
/* D — F13, the AMBER, THIN RED and GREY NOTE rings on your own puck. Wildcard carries an amber CP on Monday (Tally, */
/*     his WSO, the same) and a thin-red CP on Thursday (Pixel the same); Static carries the grey long-day note on  */
/*     Tuesday. Both given accounts on Admin → Users (admin role, so the edit week is theirs too) and signed in.    */
/* ============================================================================================================ */
if (want('D')) {
  const C = checker('D')
  const { browser, page, errors } = await openHi({ ...DESK, dpr: 3 })
  const drain = await watch(page, errors, 'D')
  const ringRead = async (p, di, pid) => (await pucks(p, `.week .day[data-day="${di}"]`, pid)).filter(m => /\bwarn\b/.test(m.cls))
  /* as Saber first: the same pucks when they are NOT "you" */
  await go(page, 'editsched')
  const base = { wcMon: await ringRead(page, 0, WILDCARD), tallyMon: await ringRead(page, 0, TALLY), wcThu: await ringRead(page, 3, WILDCARD), pixelThu: await ringRead(page, 3, PIXEL), staticTue: await ringRead(page, 1, STATIC) }
  C.log('D0 as Saber', Object.fromEntries(Object.entries(base).map(([k, v]) => [k, v.map(m => `${m.at} ${m.cls} bs=${m.bs}`)])))
  await close(page, 'D0-desktop-as-saber-wildcard-tally-mon-amber-not-you', ['#eWeek .day[data-day="0"] [data-slot="0.1.0.1.p"]', '#eWeek .day[data-day="0"] [data-slot="0.1.0.1.w"]'])
  await close(page, 'D0-desktop-as-saber-wildcard-pixel-thu-thinred-not-you', [`#eWeek .day[data-day="3"] .puck.warn[data-person="${WILDCARD}"]`, `#eWeek .day[data-day="3"] .puck.warn[data-person="${PIXEL}"]`])
  await close(page, 'D0-desktop-as-saber-static-tue-grey-not-you', [`#eWeek .day[data-day="1"] [data-slot="1.1.0.0.w"]`, `#eWeek .day[data-day="1"] [data-slot="1.1.0.0.p"]`])
  const a1 = await addAccount(page, 'wildcard@mail', WILDCARD), a2 = await addAccount(page, 'static@mail', STATIC)
  C.check('D0', a1 && a2, 'Admin → Users: accounts added for Wildcard and Static (admin role) — the write before any sign-in (§7.7)', { a1, a2 })
  await step(C, 'D1', 'Wildcard', async () => {
    await signOut(page); await signIn(page, 'wildcard@mail', 'x')
    await go(page, 'editsched')
    const mon = await ringRead(page, 0, WILDCARD), tal = await ringRead(page, 0, TALLY), thu = await ringRead(page, 3, WILDCARD), pix = await ringRead(page, 3, PIXEL)
    C.log('D1 Mon Wildcard (you, amber)', mon.map(rd)); C.log('D1 Mon Tally (amber)', tal.map(rd))
    C.log('D1 Thu Wildcard (you, thin red)', thu.map(rd)); C.log('D1 Thu Pixel (thin red)', pix.map(rd))
    const amberShown = mon.some(m => /\bme\b/.test(m.cls) && /229, 168, 59/.test(m.bs)), amberOther = tal.some(m => /229, 168, 59/.test(m.bs))
    const glow = (a) => a.some(m => blurred(m.bs).length) ? 'purple ring + purple glow' : 'purple ring, no glow'
    C.check('D1a', amberShown && amberOther, `AMBER ring on your own puck (Wildcard, CP advisory) vs Tally's: Tally ${amberOther ? 'shows' : 'does NOT show'} the 1.5px amber ring; Wildcard ("you") ${amberShown ? 'shows it too (D270)' : `shows the "you" ${glow(mon)} INSTEAD`}`,
      { you: mon.map(m => m.bs), other: tal.map(m => m.bs) })
    /* D270 (27 Sep 26): flagged, his own puck wears the flag's OWN ring (no glow, D164), the purple fill stays */
    const meFlagged = [...mon, ...thu].filter(m => /\bme\b/.test(m.cls))
    C.check('D1g', meFlagged.length >= 2 && meFlagged.every(m => /0px 0px 0px 1.5px/.test(m.bs) && blurred(m.bs).length === 0 && m.bg === ME_BG),
      'Wildcard\'s own flagged pucks (amber Monday, thin red Thursday): the flag\'s own 1.5px ring, NO glow, purple fill (D270)', meFlagged.map(rd))
    const thinShown = thu.some(m => /\bme\b/.test(m.cls) && /240, 85, 95\) 0px 0px 0px 1.5px/.test(m.bs)), thinOther = pix.some(m => /240, 85, 95\) 0px 0px 0px 1.5px/.test(m.bs))
    C.check('D1b', thinShown && thinOther, `THIN RED ring on your own puck (Wildcard, CP not authorised — a hard flag with no box) vs Pixel's: Pixel ${thinOther ? 'shows' : 'does NOT show'} the 1.5px red ring; Wildcard ("you") ${thinShown ? 'shows it too (D270)' : `shows the "you" ${glow(thu)} INSTEAD`}`,
      { you: thu.map(m => m.bs), other: pix.map(m => m.bs) })
    await close(page, 'D1-desktop-as-wildcard-mon-amber-you-beside-tally', ['#eWeek .day[data-day="0"] [data-slot="0.1.0.1.p"]', '#eWeek .day[data-day="0"] [data-slot="0.1.0.1.w"]'])
    await close(page, 'D1-desktop-as-wildcard-thu-thinred-you-beside-pixel', [`#eWeek .day[data-day="3"] .puck.warn[data-person="${WILDCARD}"]`, `#eWeek .day[data-day="3"] .puck.warn[data-person="${PIXEL}"]`])
    await page.setViewportSize(PHONE); await page.waitForTimeout(800)
    await go(page, 'viewsched')
    await close(page, 'D1-phone-as-wildcard-mon-amber-you-beside-tally', ['#vWeek .day[data-day="0"] [data-slot="0.1.0.1.p"]', '#vWeek .day[data-day="0"] [data-slot="0.1.0.1.w"]'])
    await page.setViewportSize(DESK); await page.waitForTimeout(600)
  })
  await step(C, 'D2', 'Static', async () => {
    await signOut(page); await signIn(page, 'static@mail', 'x')
    await go(page, 'editsched')
    const st = await ringRead(page, 1, STATIC)
    C.log('D2 Tue Static (you, grey note)', st.map(rd)); C.log('D2 the same as Saber saw it', base.staticTue.map(rd))
    const greyShown = st.some(m => /\bme\b/.test(m.cls) && /138, 150, 163/.test(m.bs)), greyOther = base.staticTue.some(m => /138, 150, 163/.test(m.bs))
    const stGlow = st.some(m => blurred(m.bs).length) ? 'purple ring + glow' : 'purple ring, no glow'
    C.check('D2a', greyShown && greyOther, `GREY NOTE ring on your own puck (Static, long work day): seen by Saber the puck ${greyOther ? 'shows' : 'does NOT show'} the 1.5px grey ring; signed in as Static ("you") ${greyShown ? 'it shows too (D270)' : `the "you" ${stGlow} shows INSTEAD`}`,
      { you: st.map(m => m.bs), other: base.staticTue.map(m => m.bs) })
    const stMe = st.filter(m => /\bme\b/.test(m.cls))
    C.check('D2g', stMe.length >= 1 && stMe.every(m => /138, 150, 163\) 0px 0px 0px 1.5px/.test(m.bs) && blurred(m.bs).length === 0 && m.bg === ME_BG),
      'Static\'s own grey-note pucks: the grey 1.5px ring, NO glow, purple fill (D270)', stMe.map(rd))
    await close(page, 'D2-desktop-as-static-tue-grey-you', ['#eWeek .day[data-day="1"] [data-slot="1.1.0.0.w"]', '#eWeek .day[data-day="1"] [data-slot="1.1.0.0.p"]'])
    await close(page, 'D2-desktop-as-static-tue-desk-grey-you', ['#eWeek .day[data-day="1"] [data-slot="d:1.0.2"]'], 30)
  })
  const e = drain(); C.check('D9', e.length === 0, 'no console errors, page errors or 4xx during D', e.join(' | '))
  await browser.close()
  C.summary()
}

/* ============================================================================================================ */
/* E — F15: the member's own puck. As admin, one write that keeps Ranger conflicted on Monday (plant him onto the   */
/*     STAFF MTG, over his wave-1 sortie); then sign in as `us` (Ranger) — View-only Sched, desktop and phone.      */
/* ============================================================================================================ */
if (want('E')) {
  const C = checker('E')
  const { browser, page, errors } = await openHi({ ...DESK, dpr: 2 })
  const drain = await watch(page, errors, 'E')
  await board(page, 0)
  const w = await plant(page, 'g:0.1.+', RANGER)
  await closeBoard(page)
  C.check('E0', /planted/.test(w), 'as admin: Ranger planted onto STAFF MTG @ HQ (09:30–11:00, over his wave-1 sortie) — the one write before the sign-in', w)
  await signOut(page); await signIn(page, 'us', 'us')
  const pg = await page.evaluate(() => window.CURPAGE)
  if (pg !== 'viewsched') await go(page, 'viewsched')
  for (const [wd, vp] of [['desktop', DESK], ['phone', PHONE]]) {
    await page.setViewportSize(vp); await page.waitForTimeout(800)
    const r = await pucks(page, '#vWeek .day[data-day="0"]', RANGER), s = await pucks(page, '#vWeek .day[data-day="0"]', SABER)
    C.log(`E1 ${wd} Ranger`, r.map(rd).join(' || ')); C.log(`E1 ${wd} Saber`, s.map(rd).join(' || '))
    judge(C, `E1-${wd}`, `${wd}: signed in as Ranger (member), every flagged puck of his on Monday is "you" (purple) with the plain red ring, no glow`, r, { need: 3 })
    const sRed = s.filter(m => /boxred/.test(m.cls))
    C.check(`E2-${wd}`, sRed.length && sRed.every(m => !/\bme\b/.test(m.cls) && m.bs === PLAIN && m.bg !== ME_BG), `${wd}: Saber's pucks (not "you" now) are plain olive with the plain red ring`, sRed.map(m => m.bs + ' ' + m.bg).slice(0, 3))
    await close(page, `E1-${wd}-as-ranger-member-you-beside-saber`, ['#vWeek .day[data-day="0"] [data-slot="0.0.0.0.p"]', '#vWeek .day[data-day="0"] [data-slot="0.0.0.1.p"]'])
    /* the legend's purple "you" swatch — open the legend and read the swatch's colour */
    const lg = await page.evaluate(() => {
      const box = [...document.querySelectorAll('.legendbox')].find(e => e.offsetWidth); if (!box) return null
      box.open = true
      const sw = [...box.querySelectorAll('.qk')].find(q => (q.parentElement.textContent || '').trim().endsWith('you'))
      return sw ? { bg: getComputedStyle(sw).backgroundColor, text: sw.parentElement.textContent.trim() } : { none: true }
    })
    await page.waitForTimeout(300)
    C.check(`E3-${wd}`, lg && lg.bg === ME_BG, `${wd}: the legend's "you" swatch is the same purple (unchanged)`, lg)
    const sw = page.locator('.legendbox:visible .qk').filter({ hasText: '▮' }).last()
    if (await sw.count()) await close(page, `E3-${wd}-legend-you-swatch`, ['.legendbox[open]:not([hidden]) .legend'], 8).catch(() => null)
  }
  const e = drain(); C.check('E9', e.length === 0, 'no console errors, page errors or 4xx during E', e.join(' | '))
  await browser.close()
  C.summary()
}

/* ============================================================================================================ */
/* F — the orders (§2.1): you (no flag) → flag on → Undo → Redo; a highlight chip (the purple yields, the ring     */
/*     stays) → clear; publish → unpublish; reload. Then the Leave War's own "you" row (row 18) and the OIL mode    */
/*     (row 10). Saber, Tuesday — the seed gives him no event that day, so the flag is made from nothing.          */
/* ============================================================================================================ */
if (want('F')) {
  const C = checker('F')
  const { browser, page, errors } = await openHi({ ...DESK, dpr: 2 })
  const drain = await watch(page, errors, 'F')
  await toastSpy(page)
  const tueSaber = async () => (await pucks(page, '#eWeek .day[data-day="1"]', SABER)).filter(m => /^g:1\./.test(String(m.at)))
  await step(C, 'F1', 'you, no flag → flag on', async () => {
    await board(page, 1)
    const a = await plant(page, 'g:1.2.+', SABER, 1)                // MEDICAL APPT 13:30–15:00 — his only event
    await closeBoard(page); await go(page, 'editsched')
    const one = await tueSaber()
    C.log('F1 one event', { a, pucks: one.map(rd) })
    C.check('F1', /planted/.test(a) && one.length === 1 && /\bme\b/.test(one[0].cls) && !/boxred|warn/.test(one[0].cls) && /240, 85, 95/.test(one[0].bs) === false && one[0].bg === ME_BG,
      'Saber on one Tuesday event: "you", unflagged — the purple fill and its purple ring (the "you" highlight, kept by D164)', rd(one[0]))
    await puckShot(page, 'F1-desktop-you-no-flag', '#eWeek .day[data-day="1"]', SABER, { at: 'g:1.' })
    await board(page, 1)
    const b = await plant(page, 'g:1.3.+', SABER, 1)                // APPOINTMENT 14:00–16:00 — overlaps → C
    await closeBoard(page); await go(page, 'editsched')
    const two = await tueSaber()
    C.log('F2 two events', { b, pucks: two.map(rd) })
    C.check('F2a', /planted/.test(b), 'the second plant went in through the board (one mention more of him on Tuesday)', b)
    judge(C, 'F2', 'you → flag on: planted on an overlapping row, both his Tuesday pucks turn red C — the plain ring, no glow', two, { need: 2 })
    await puckShot(page, 'F2-desktop-you-then-flag-on', '#eWeek .day[data-day="1"]', SABER, { at: 'g:1.', padY: 60 })
  })
  await step(C, 'F3', 'undo / redo', async () => {
    await page.locator('#undoBtn').click(); await page.waitForTimeout(700)
    const u = await tueSaber()
    C.check('F3', u.length === 1 && !/boxred/.test(u[0].cls) && /\bme\b/.test(u[0].cls), 'Undo → flag off: one puck again, "you" and unflagged', u.map(rd))
    await puckShot(page, 'F3-desktop-after-undo-flag-off', '#eWeek .day[data-day="1"]', SABER, { at: 'g:1.' })
    await page.locator('#redoBtn').click(); await page.waitForTimeout(700)
    const r = await tueSaber()
    judge(C, 'F4', 'Redo → flag on again: plain ring, no glow', r, { need: 2 })
    C.log('F3/F4 toasts', await toasts(page))
  })
  await step(C, 'F5', 'a highlight chip', async () => {
    /* the chips sit folded inside their group tabs on the strip: open the first group, then press its first chip */
    const tab = page.locator('#page-editsched .hl-gtab:visible, .hl-gtab:visible').first()
    await press(page, tab); await page.waitForTimeout(300)
    const chip = page.locator('.hl-grp.open .fchip:visible').first()
    const label = await chip.innerText()
    await chip.click(); await page.waitForTimeout(600)
    const h = await tueSaber()
    C.log('F5 chip on', { label, pucks: h.map(rd) })
    C.check('F5', h.length === 2 && h.every(m => !/\bme\b/.test(m.cls) && /boxred/.test(m.cls) && m.bs === PLAIN),
      `a highlight chip (${label.trim()}) on: the purple "you" yields on his pucks and the red ring stays, plain`, h.map(m => m.cls + ' | ' + m.bs))
    await puckShot(page, 'F5-desktop-chip-on-purple-yields-ring-stays', '#eWeek .day[data-day="1"]', SABER, { at: 'g:1.', padY: 60 })
    await chip.click(); await page.waitForTimeout(600)
    const c = await tueSaber()
    judge(C, 'F5b', 'the chip cleared: "you" comes back, plain ring', c, { need: 2 })
  })
  await step(C, 'F6', 'publish → unpublish', async () => {
    await editWeek(page)
    const s = await signDay(page, 1); const p = await publishDay(page, 1)
    await go(page, 'viewsched')
    const v = await pucks(page, '#vWeek .day[data-day="1"]', SABER)
    C.log('F6 published', { s, p, head: (await head(page, 1)) })
    judge(C, 'F6', 'Tuesday published: on View-only Sched his flagged "you" pucks are plain', v, { need: 2 })
    await puckShot(page, 'F6-desktop-published-tuesday', '#vWeek .day[data-day="1"]', SABER, { n: 0, padY: 60 })
    await editWeek(page)
    const u = await unpublish(page, 1)
    await go(page, 'viewsched')
    const v2 = await pucks(page, '#vWeek .day[data-day="1"]', SABER)
    C.log('F6 unpublished', u)
    judge(C, 'F6b', 'Tuesday unpublished again: still plain', v2, { need: 2 })
  })
  await step(C, 'F7', 'reload', async () => {
    await page.reload(); await page.waitForTimeout(1200)
    if (await page.locator('#luser').count()) await signIn(page, 'ad', 'a')
    else await page.addStyleTag({ content: '*{scroll-behavior:auto !important}' })
    await go(page, 'editsched')
    const r = await tueSaber()
    judge(C, 'F7', 'after a reload: the flagged "you" pucks are still there and plain', r, { need: 2 })
  })
  await step(C, 'F8', 'the Leave War\'s own "you" row (row 18 — its glow is wanted, untouched)', async () => {
    await go(page, 'leavewar'); await page.waitForTimeout(1500)
    const r = await page.evaluate(() => {
      const tr = document.querySelector('#page-leavewar tr.me'); if (!tr) return null
      const who = tr.querySelector('.who') || tr.querySelector('td')
      const cs = getComputedStyle(who); tr.scrollIntoView({ block: 'center' })
      const b = tr.getBoundingClientRect()
      return { text: tr.innerText.slice(0, 20).replace(/\s+/g, ' '), bs: cs.boxShadow, bg: cs.backgroundColor, y: b.y, h: b.height }
    })
    C.log('F8 LW me row', r)
    C.check('F8', !!r, 'the Leave War still marks the signed-in man\'s row (tr.me) — nothing in this change reaches #page-leavewar (the CSS diff touches only scheduler.css\'s two puck rules, the week padding, and the Leave War\'s Reset-order button)', r)
    if (r) await page.screenshot({ path: `${process.env.HP_SHOTS}/F8-desktop-leavewar-you-row.png`, clip: { x: 0, y: Math.max(0, r.y - 80), width: 1440, height: Math.min(900 - Math.max(0, r.y - 80), r.h + 160) } })
  })
  await step(C, 'F9', 'the OIL mode (row 10)', async () => {
    await board(page, 5)
    const zone = await page.evaluate(() => { const z = [...document.querySelectorAll('#schedBoard [data-fill]')].find(e => e.offsetWidth && /^(a|g|d|s):5\.[\w.]*\+$/.test(e.dataset.fill)); return z && z.dataset.fill })
    const a = zone ? await plant(page, zone, SABER, 5).catch(e => 'FAILED ' + e.message) : 'FAILED: no programme or ground row on Saturday'
    const on = await L.oilMode(page, true)
    const m = (await pucks(page, '#schedBoard .sb-boardwrap', SABER))[0]
    C.log('F9 Saturday, OIL mode on', { a, on, saber: rd(m) })
    /* D272 (27 Sep 26, "question 2 yes"): in OIL Earn mode his own earning puck shows the GREEN OIL ring, the purple
       fill stays (it used to be hidden under the purple ring — the first walk's note F9) */
    C.check('F9', m && /\bme\b/.test(m.cls) && /\boilglow\b/.test(m.cls) && /47, 166, 92\) 0px 0px 0px 2px/.test(m.bs) && m.bg === ME_BG,
      'OIL mode on a Saturday: Saber\'s own earning puck shows the GREEN OIL ring, purple fill (D272)', m && { cls: m.cls, bs: m.bs, bg: m.bg })
    await puckShot(page, 'F9-desktop-oil-mode-you-puck', '#schedBoard .sb-boardwrap', SABER, { n: 0, padX: 160, padY: 40 })
    await L.oilMode(page, false); await closeBoard(page)
  })
  const e = drain(); C.check('F99', e.length === 0, 'no console errors, page errors or 4xx during F', e.join(' | '))
  await browser.close()
  C.summary()
}

/* ============================================================================================================ */
/* G — §2.1 row 14, the FINGER ghost: a touch phone (390×844, touch on), a real touch-drag of Saber's flagged       */
/*     cockpit puck on the phone board through CDP touch events (hold past the 180 ms arm), read the ghost, and    */
/*     let go back on the same seat.                                                                              */
/* ============================================================================================================ */
if (want('G')) {
  const C = checker('G')
  const { chromium } = await import('@playwright/test')
  const { existsSync } = await import('node:fs')
  const CH = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
  const browser = await chromium.launch({ headless: true, ...(existsSync(CH) ? { executablePath: CH } : {}) })
  const ctx = await browser.newContext({ viewport: PHONE, deviceScaleFactor: 3, hasTouch: true, isMobile: true })
  const page = await ctx.newPage()
  const errors = []
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()) })
  page.on('pageerror', e => errors.push('PAGEERROR ' + e.message))
  page.on('response', r => { if (r.status() >= 400) errors.push('HTTP ' + r.status() + ' ' + r.url()) })
  const drain = await watch(page, errors, 'G')
  await page.goto(process.env.HP_URL + '/')
  await signIn(page, 'ad', 'a')
  await toastSpy(page)
  await step(C, 'G1', 'finger ghost', async () => {
    await board(page, 0)
    const src = page.locator('#schedBoard [data-slot="0.0.0.0.p"] .puck:visible').first()
    await src.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await page.waitForTimeout(300)
    const b = await src.boundingBox()
    const x = b.x + b.width / 2, y = b.y + b.height / 2
    const cdp = await ctx.newCDPSession(page)
    const T = (type, px, py) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: type === 'touchEnd' ? [] : [{ x: px, y: py, radiusX: 4, radiusY: 4, force: 1, id: 1 }] })
    await T('touchStart', x, y); await page.waitForTimeout(320)          // hold past TD_HOLD (180 ms): the drag arms
    for (let i = 1; i <= 8; i++) { await T('touchMove', x + i * 4, y + i * 7); await page.waitForTimeout(30) }
    await page.waitForTimeout(250)
    const g = await page.evaluate(() => { const e = document.querySelector('.tdghost'); if (!e) return null
      const r = e.getBoundingClientRect(); return { cls: e.className, bs: getComputedStyle(e).boxShadow, before: getComputedStyle(e, '::before').boxShadow, bg: getComputedStyle(e).backgroundColor, x: r.x, y: r.y, w: r.width, h: r.height } })
    C.log('G1 finger ghost', g)
    if (g) await page.screenshot({ path: `${process.env.HP_SHOTS}/G1-phone-finger-ghost-of-saber.png`, clip: { x: Math.max(0, g.x - 30), y: Math.max(0, g.y - 30), width: Math.min(390 - Math.max(0, g.x - 30), g.w + 60), height: g.h + 70 } })
    C.check('G1', !!g && /\bme\b/.test(g.cls) && /\blift\b/.test(g.cls) && !blurred(g.bs).filter(l => /240, 85, 95/.test(l)).length && /59, 198, 232/.test(g.before) && g.bg === ME_BG,
      'finger ghost of the flagged "you" puck (a real touch drag on the phone board): purple, the cyan lift box on its veil, no red glow', g && { bs: g.bs, before: g.before })
    for (let i = 7; i >= 0; i--) { await T('touchMove', x + i * 4, y + i * 7); await page.waitForTimeout(30) }
    await page.waitForTimeout(150)
    await T('touchEnd'); await page.waitForTimeout(700)
    const t = await toasts(page)
    C.check('G2', t.some(s => /Already in that seat/.test(s)), 'let go back on his own seat: "Already in that seat"', t)
    const after = (await pucks(page, '#schedBoard [data-slot="0.0.0.0.p"]', SABER))[0]
    C.check('G3', plainMe(after), 'after the finger drop-back his puck is still "you" with the plain ring', rd(after))
  })
  const e = drain(); C.check('G9', e.length === 0, 'no console errors, page errors or 4xx during G', e.join(' | '))
  await browser.close()
  C.summary()
}

console.log('ALL ERRORS SEEN:', ALLERR.length ? ALLERR.join(' | ') : 'none')
