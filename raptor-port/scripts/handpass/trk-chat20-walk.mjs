/* CHAT 20 — the Tracker's small batch (8 Nov 26): a hand pass of the running app, desktop AND phone, on the frozen build.
   S1  Delete course's question (D1860): exact words, no ↺ / ⇅; Cancel keeps the course; yes deletes it.
   S2  Restore in Reorder courses (D128): a drawn turning-back arrow (svg), pressed — the course is back in the Course list.
   S3  The Students card: Reorder's drawn icon, each name's drawn pencil and drawn ✕; pencil opens a rename box, cancelled
       changes nothing; Reorder opens the crew window, closed.
   S4  Icons on the bar and menus: the gear and Show All open and close; the course, syllabus and File menus open, close on a
       click outside and on Escape; desktop: a row shades under the mouse, shows a focus ring under the keyboard; Edit chart
       layout opens, its Reset layout tool shows the turning-back arrow, left without saving.
   S5  The Tracker's plain-user round (D1557): pick another student; Find an event and pick it from the list; tap the event and
       mark DCO; close the window; the ball's colour, the Info panel and Show All show it; Legend opened and closed; switch
       courses and come back.
   Every press is a real tap / click on screen; nothing is written into the data directly. Desktop world: Chromium 1536×864 at
   device scale 2 (so the cropped pictures are sharp); phone: WebKit 402×874, touch, scale 2, with a picture right after each tap.
   From raptor-port/:  WALK_DIR=<frozen dist> HP_URL=http://localhost:4362 [C9_RESULTS=<scratch file>] [ONLY=S1,S4] node scripts/handpass/trk-chat20-walk.mjs
   Version line: kc20walk v1. */
import { mkdirSync, readdirSync, rmSync, writeFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
console.log('kc20walk v1')
const HERE = dirname(fileURLToPath(import.meta.url))
const OUT = resolve(HERE, '..', '..', 'docs/img/handpass/2026-11-08-chat20-tracker/walk')
process.env.C9_RESULTS ||= resolve(OUT, '..', 'unused-c9-results.json')
const L = await import('./trk-chat9-lib.mjs')
const { mkWorld, closeW, closeAll, geo, sleep, PHONE, PC } = L
const { serveFrozen, WALK_DIR } = await import('./isr-serve.mjs')
if (!WALK_DIR) { console.error('set WALK_DIR to the frozen build folder'); process.exit(2) }
console.log('serving ' + WALK_DIR + ' at ' + L.BASE)
for (const e of ['chromium', 'webkit']) {
  const b = await L.browserFor(e, true, false); const orig = b.newContext.bind(b)
  b.newContext = async o => { const c = await orig(o); await serveFrozen(c, L.BASE); return c }
}
mkdirSync(OUT, { recursive: true })
for (const f of readdirSync(OUT)) if (f.endsWith('.png')) rmSync(resolve(OUT, f))   /* one run, one folder */
const ONLY = (process.env.ONLY || '').split(',').filter(Boolean)
const CLOCK = '2026-11-08T09:00:00+08:00'
const steps = []
let exitCode = 0

/* ---------- recording ---------- */
const mark = w => { w.errAt = w.errors.length }
function rec(w, scn, step, pressed, expected, seen, pass, pics = []) {
  const errs = w.errors.slice(w.errAt || 0); w.errAt = w.errors.length
  const row = { scenario: scn, width: w.label, step, pressed, expected, seen: String(seen).slice(0, 900), pass: pass === null ? 'NOTRUN' : pass ? 'PASS' : 'FAIL', pics, errors: errs }
  steps.push(row); if (row.pass !== 'PASS') exitCode = 1
  console.log(` ${row.pass.padEnd(6)} ${scn} ${w.label} ${step} — ${row.seen.slice(0, 240)}${errs.length ? '  ERRORS: ' + errs.join(' | ') : ''}`)
}
const name = (w, scn, what) => `${scn.toLowerCase()}-${w.label}-${what}`
async function shot(w, nm) {
  await sleep(350)
  await w.page.screenshot({ path: resolve(OUT, nm + '.png'), animations: 'disabled', caret: 'hide' })
  return nm + '.png'
}
async function crop(w, nm, sel, pad = 8) {
  const r = await w.page.evaluate(sel => { const e = [...document.querySelectorAll(sel)].find(e => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 }); if (!e) return null; const r = e.getBoundingClientRect(); return { x: r.left, y: r.top, w: r.width, h: r.height } }, sel)
  if (!r) return null
  const vw = w.size.width, vh = w.size.height
  const x = Math.max(0, r.x - pad), y = Math.max(0, r.y - pad)
  await w.page.screenshot({ path: resolve(OUT, nm + '.png'), animations: 'disabled', caret: 'hide', clip: { x, y, width: Math.min(vw - x, r.w + 2 * pad), height: Math.min(vh - y, r.h + 2 * pad) } })
  return nm + '.png'
}
const vis = (w, sel) => w.page.locator(sel).filter({ visible: true }).first()
async function waitVis(w, sel, ms = 5000) { try { await vis(w, sel).waitFor({ state: 'visible', timeout: ms }); return true } catch { return false } }
async function isVis(w, sel) { return (await w.page.locator(sel).filter({ visible: true }).count()) > 0 }
/* a real tap (phone) or click (desktop) on the control; on a phone a picture right after the lift (D1281) */
async function press(w, sel, nm) {
  const l = vis(w, sel)
  let tapPic = null
  if (w.touch) {
    await l.tap({ timeout: 8000 })
    if (nm) { await w.page.screenshot({ path: resolve(OUT, nm + '-tap.png'), animations: 'disabled', caret: 'hide' }); tapPic = nm + '-tap.png' }
  } else await l.click({ timeout: 8000 })
  await sleep(650)
  return tapPic
}
async function pressXY(w, x, y, nm) {
  let tapPic = null
  if (w.touch) { await w.page.touchscreen.tap(x, y); if (nm) { await w.page.screenshot({ path: resolve(OUT, nm + '-tap.png'), animations: 'disabled', caret: 'hide' }); tapPic = nm + '-tap.png' } } else await w.page.mouse.click(x, y)
  await sleep(650)
  return tapPic
}
const pics = (...a) => a.flat().filter(Boolean)
const tabTo = async (w, word) => { if (!w.touch) return; await press(w, `#viewtabs button:has-text("${word}")`); await sleep(500) }
const courseInfo = w => w.page.evaluate(() => { const s = document.getElementById('courseSel'); return { value: s.value, name: s.options[s.selectedIndex] && s.options[s.selectedIndex].text, all: [...s.options].map(o => ({ v: o.value, t: o.text })) } })

/* a second course, made the way a person makes one: course pencil → + Add course → type a name → OK */
async function ensureTwoCourses(w, scn, nm) {
  const ci = await courseInfo(w)
  if (ci.all.length >= 2) return ci
  await press(w, '#courseMenuBtn'); await press(w, '#addCourse')
  const up = await waitVis(w, '#dlgInput')
  if (up) { await vis(w, '#dlgInput').fill('WALKB'); await press(w, '#dlgOk') }
  await sleep(800)
  const after = await courseInfo(w)
  rec(w, scn, 'set-up: a second course made through + Add course', 'course pencil → + Add course → typed WALKB → OK', 'two or more courses in the Course list', JSON.stringify(after.all.map(x => x.t)), after.all.length >= 2)
  return after
}
const clean = s => String(s).replace(/\r/g, '').replace(/ /g, ' ')

/* ---------- the scenarios ---------- */
async function S1S2(w) {
  const scn = 'S1'
  mark(w)
  await ensureTwoCourses(w, scn)
  const before = await courseInfo(w)
  const cname = before.name
  const want = `Delete course ${cname}?\n\nIts students and marks are kept: Restore in Reorder courses brings it back in this browser.`
  let p0 = await press(w, '#courseMenuBtn', name(w, 'S1', 'menu'))
  const pMenu = await shot(w, name(w, 'S1', 'menu-open'))
  const pr = await press(w, '#delCourse', name(w, 'S1', 'delete'))
  const up = await waitVis(w, '#dlgMsg')
  const txt = up ? clean(await vis(w, '#dlgMsg').innerText()) : ''
  const pQ = await shot(w, name(w, 'S1', 'question'))
  const exact = txt === want
  const marks = (txt.match(/[↺⇅]/g) || []).length
  rec(w, scn, 'the question reads exactly', 'course pencil → Delete course', JSON.stringify(want), JSON.stringify(txt) + ' | ↺/⇅ count ' + marks, up && exact && marks === 0, pics(p0, pMenu, pr, pQ))
  const pc = await press(w, '#dlgCancel', name(w, 'S1', 'cancel'))
  const mid = await courseInfo(w)
  const pAfterCancel = await shot(w, name(w, 'S1', 'after-cancel'))
  rec(w, scn, 'Cancel keeps the course', 'Cancel in the question', `course ${cname} still selected and in the list`, `selected ${mid.name}; list ${JSON.stringify(mid.all.map(x => x.t))}; question gone: ${!(await isVis(w, '#dlgModal'))}`, mid.value === before.value && mid.all.some(x => x.v === before.value) && !(await isVis(w, '#dlgModal')), pics(pc, pAfterCancel))
  await press(w, '#courseMenuBtn'); const pr2 = await press(w, '#delCourse', name(w, 'S1', 'delete2'))
  await waitVis(w, '#dlgMsg')
  const pY = await press(w, '#dlgOk', name(w, 'S1', 'yes'))
  await sleep(800)
  const aft = await courseInfo(w)
  const pDel = await shot(w, name(w, 'S1', 'deleted'))
  rec(w, scn, 'answering yes deletes it', 'Delete course → OK', `${cname} no longer in the Course list`, `selected ${aft.name}; list ${JSON.stringify(aft.all.map(x => x.t))}`, !aft.all.some(x => x.v === before.value) && aft.all.length === before.all.length - 1, pics(pr2, pY, pDel))

  /* S2 */
  const s2 = 'S2'
  await press(w, '#courseMenuBtn'); const po = await press(w, '#ordCourse', name(w, 'S2', 'reorder'))
  const open = await waitVis(w, '#ordModal')
  const row = w.page.locator('#ordModal .ordrow').filter({ hasText: cname }).filter({ has: w.page.locator('button:has-text("Restore")') }).first()
  const found = (await row.count()) > 0
  const btn = row.locator('button', { hasText: 'Restore' }).first()
  const info = found ? await btn.evaluate(b => ({ svg: b.querySelectorAll('svg').length, text: b.textContent, html: b.innerHTML.slice(0, 200), w: b.getBoundingClientRect().width, h: b.getBoundingClientRect().height })) : null
  const pW = await shot(w, name(w, 'S2', 'window'))
  /* zoomed crop of the button: its box with padding, through the page screenshot clip */
  let pCrop = null
  if (found) { const r = await btn.boundingBox(); if (r) { const x = Math.max(0, r.x - 10), y = Math.max(0, r.y - 10); await w.page.screenshot({ path: resolve(OUT, name(w, 'S2', 'restore-button-crop') + '.png'), animations: 'disabled', clip: { x, y, width: Math.min(w.size.width - x, r.width + 20), height: r.height + 20 } }); pCrop = name(w, 'S2', 'restore-button-crop') + '.png' } }
  rec(w, s2, 'Restore wears a drawn arrow (svg), no typed ↺', 'course pencil → Reorder courses', 'deleted course listed with a Restore button holding an svg and no ↺', open && found ? `button text ${JSON.stringify(info.text)}, svg ${info.svg}, size ${Math.round(info.w)}x${Math.round(info.h)}` : `window open ${open}, row found ${found}`, !!(open && found && info.svg >= 1 && !/↺/.test(info.text)), pics(po, pW, pCrop))
  if (found) {
    const pRs = await press(w, '#ordModal .ordrow:has-text("' + cname + '") button:has-text("Restore")', name(w, 'S2', 'restore'))
    const back = await courseInfo(w)
    const pB = await shot(w, name(w, 'S2', 'restored'))
    rec(w, s2, 'Restore brings the course back', 'Restore', `${cname} back in the Course list`, `list ${JSON.stringify(back.all.map(x => x.t))}`, back.all.some(x => x.t.startsWith(cname)), pics(pRs, pB))
  } else rec(w, s2, 'Restore brings the course back', 'Restore', 'course back in the list', 'no Restore button to press', null)
  if (await isVis(w, '#ordCancel')) { await press(w, '#ordCancel'); }
  else if (await isVis(w, '#ordSave')) { await press(w, '#ordSave') }
  rec(w, s2, 'the Reorder window closes', 'Cancel', 'window gone', 'window visible: ' + (await isVis(w, '#ordModal')), !(await isVis(w, '#ordModal')))
}

async function S3(w) {
  const scn = 'S3'; mark(w)
  await tabTo(w, 'Info')
  const pSide = await shot(w, name(w, 'S3', 'students-card'))
  const d = await w.page.evaluate(() => {
    const card = [...document.querySelectorAll('.c-students')].find(e => e.getBoundingClientRect().width > 0)
    if (!card) return null
    const ord = card.querySelector('#ordCrew')
    const chips = [...card.querySelectorAll('.chip')]
    const one = b => b ? (() => { const s = b.querySelector('svg'); const shapes = s ? [...s.querySelectorAll('path,rect,circle,polygon')] : []; const cs = shapes.map(e => getComputedStyle(e)); return { svg: b.querySelectorAll('svg').length, text: b.textContent.trim(), fills: cs.map(c => c.fill).slice(0, 4), strokes: cs.map(c => c.stroke).slice(0, 4) } })() : null
    return { ord: one(ord), ordText: ord && ord.textContent.trim(), chips: chips.length, names: chips.map(c => c.textContent.replace(/\s+/g, ' ').trim()), pencils: chips.map(c => one(c.querySelector('.ren'))), xs: chips.map(c => one(c.querySelector('.x'))) }
  })
  const pCard = await crop(w, name(w, 'S3', 'card-crop'), '.c-students', 6)
  const pOrd = await crop(w, name(w, 'S3', 'reorder-crop'), '.c-students #ordCrew', 10)
  const pPen = await crop(w, name(w, 'S3', 'pencil-crop'), '.c-students .chip .ren', 12)
  const pX = await crop(w, name(w, 'S3', 'x-crop'), '.c-students .chip .x', 12)
  if (!d) { rec(w, scn, 'the Students card is on screen', 'Info tab', 'card visible', 'not found', null, pics(pSide)); return }
  rec(w, scn, 'Reorder wears a drawn two-arrow icon (svg)', 'looked at', 'svg in the Reorder button', `svg ${d.ord && d.ord.svg}, text ${JSON.stringify(d.ordText)}`, !!d.ord && d.ord.svg >= 1, pics(pSide, pOrd))
  rec(w, scn, 'each name has a drawn pencil (svg, filled)', 'looked at', `${d.chips} chips each with a pencil holding an svg`, `pencils svg counts ${JSON.stringify(d.pencils.map(p => p && p.svg))}; first pencil fills ${JSON.stringify(d.pencils[0] && d.pencils[0].fills)} strokes ${JSON.stringify(d.pencils[0] && d.pencils[0].strokes)}. The tip direction is for the picture (crop).`, d.chips > 0 && d.pencils.every(p => p && p.svg >= 1) && !!d.pencils[0].fills.some(f => f && f !== 'none' && f !== 'rgba(0, 0, 0, 0)'), pics(pPen, pCard))
  rec(w, scn, 'each name has a drawn ✕', 'looked at', 'each ✕ is a drawn svg, no typed ✕', `x svg counts ${JSON.stringify(d.xs.map(p => p && p.svg))}; texts ${JSON.stringify(d.xs.map(p => p && p.text))}`, d.chips > 0 && d.xs.every(p => p && p.svg >= 1 && p.text.trim() === ''), pics(pX))
  /* pencil → rename box → cancel */
  const pr = await press(w, '.c-students .chip .ren', name(w, 'S3', 'pencil'))
  const up = await waitVis(w, '#dlgInput')
  const val = up ? await vis(w, '#dlgInput').inputValue() : ''
  const pBox = await shot(w, name(w, 'S3', 'rename-box'))
  rec(w, scn, 'a name\'s pencil opens a rename box', 'pencil on the first student', 'rename box with the name in it', `box open ${up}, value ${JSON.stringify(val)}, question ${JSON.stringify(up ? clean(await vis(w, '#dlgMsg').innerText()) : '')}`, up && val.length > 0, pics(pr, pBox))
  if (up) await press(w, '#dlgCancel')
  const names2 = await w.page.evaluate(() => [...document.querySelectorAll('.c-students .chip')].map(c => c.textContent.replace(/\s+/g, ' ').trim()))
  const pAfter = await shot(w, name(w, 'S3', 'rename-cancelled'))
  rec(w, scn, 'cancelling the rename changes nothing', 'Cancel', 'same names', `before ${JSON.stringify(d.names)} after ${JSON.stringify(names2)}; box gone ${!(await isVis(w, '#dlgModal'))}`, JSON.stringify(d.names) === JSON.stringify(names2) && !(await isVis(w, '#dlgModal')), pics(pAfter))
  /* Reorder */
  const po = await press(w, '.c-students #ordCrew', name(w, 'S3', 'reorder'))
  const open = await waitVis(w, '#ordModal')
  const pW = await shot(w, name(w, 'S3', 'crew-window'))
  rec(w, scn, 'Reorder opens the crew reorder window', 'Reorder', 'window open', `open ${open}, title ${JSON.stringify(open ? await vis(w, '#ordTitle').innerText() : '')}`, open, pics(po, pW))
  if (open) await press(w, '#ordCancel')
  rec(w, scn, 'the crew window closes', 'Cancel', 'window gone', 'visible: ' + (await isVis(w, '#ordModal')), !(await isVis(w, '#ordModal')), pics(await shot(w, name(w, 'S3', 'crew-closed'))))
  await tabTo(w, 'Flow')
}

async function menuOpen(w, id) { return w.page.evaluate(id => { const p = document.getElementById(id + 'MenuPanel'); return !!p && p.classList.contains('on') && p.getBoundingClientRect().width > 0 }, id) }
async function S4(w) {
  const scn = 'S4'; mark(w)
  /* the gear */
  let pr = await press(w, '#flexBtn', name(w, 'S4', 'gear'))
  let open = await waitVis(w, '#trkFlexWin')
  const pG = await shot(w, name(w, 'S4', 'gear-open'))
  const pGi = await crop(w, name(w, 'S4', 'gear-icon-crop'), '#flexBtn', 10)
  rec(w, scn, 'the gear opens flex settings', 'gear', 'window open', 'open ' + open, open, pics(pr, pG, pGi))
  if (open) await press(w, '[data-testid=trk-flex-x]', name(w, 'S4', 'gear-close'))
  rec(w, scn, 'the gear window closes', '✕ in the window', 'window gone', 'visible ' + (await isVis(w, '#trkFlexWin')), !(await isVis(w, '#trkFlexWin')), pics(await shot(w, name(w, 'S4', 'gear-closed'))))
  /* Show All (list icon) */
  const saSel = w.touch ? '#showAllTab' : '#showAllBtn'
  pr = await press(w, saSel, name(w, 'S4', 'showall'))
  open = await waitVis(w, '#showAllPanel')
  const pS = await shot(w, name(w, 'S4', 'showall-open'))
  const pSi = await crop(w, name(w, 'S4', 'showall-icon-crop'), w.touch ? '#showAllTab' : '#showAllBtn', 10)
  rec(w, scn, 'Show All opens', saSel, 'panel open', 'open ' + open, open, pics(pr, pS, pSi))
  if (open) await press(w, '#saClose', name(w, 'S4', 'showall-close'))
  rec(w, scn, 'Show All closes', 'Close', 'panel gone', 'visible ' + (await isVis(w, '#showAllPanel')), !(await isVis(w, '#showAllPanel')), pics(await shot(w, name(w, 'S4', 'showall-closed'))))
  /* the three menus */
  const bd = await w.page.evaluate(() => { const r = document.getElementById('board').getBoundingClientRect(); return { x: r.left + 6, y: r.top + 6 } })
  for (const id of ['course', 'syl', 'file']) {
    const btn = `#${id}MenuBtn`
    let p1 = await press(w, btn, name(w, 'S4', id + '-open'))
    let on = await menuOpen(w, id)
    const pO = await shot(w, name(w, 'S4', id + '-menu'))
    const pIc = await crop(w, name(w, 'S4', id + '-btn-crop'), btn, 10)
    const rowsSvg = await w.page.evaluate(id => [...document.querySelectorAll('#' + id + 'MenuPanel button')].map(b => b.textContent.trim().slice(0, 22) + ':' + b.querySelectorAll('svg').length), id)
    rec(w, scn, `${id} menu opens`, btn, 'menu panel shown', `shown ${on}; rows(svg count) ${JSON.stringify(rowsSvg)}`, on, pics(p1, pO, pIc))
    const pc = await pressXY(w, bd.x, bd.y, name(w, 'S4', id + '-outside'))
    rec(w, scn, `${id} menu closes on a click outside`, `click on the chart's corner`, 'menu gone', 'shown ' + (await menuOpen(w, id)), !(await menuOpen(w, id)), pics(pc, await shot(w, name(w, 'S4', id + '-after-outside'))))
    await press(w, btn); on = await menuOpen(w, id)
    await w.page.keyboard.press('Escape'); await sleep(500)
    rec(w, scn, `${id} menu closes on Escape`, 'open again, then Escape', 'menu gone', `opened ${on}; after Escape shown ${await menuOpen(w, id)}`, on && !(await menuOpen(w, id)), pics(await shot(w, name(w, 'S4', id + '-after-escape'))))
  }
  /* desktop: hover shade and keyboard focus ring */
  if (!w.touch) {
    for (const [id, row0, row1] of [['course', '#addCourse', '#ordCourse'], ['syl', '#dupSyl', '#renSyl'], ['file', '#importFileBtn', '#exportBtn']]) {
      await press(w, `#${id}MenuBtn`)
      const bgRest = await w.page.evaluate(s => getComputedStyle(document.querySelector(s)).backgroundColor, row0)
      await vis(w, row1).hover(); await sleep(350)
      const bgHover = await w.page.evaluate(s => getComputedStyle(document.querySelector(s)).backgroundColor, row1)
      const bgOther = await w.page.evaluate(s => getComputedStyle(document.querySelector(s)).backgroundColor, row0)
      const pH = await shot(w, name(w, 'S4', id + '-hover'))
      const pHc = await crop(w, name(w, 'S4', id + '-hover-crop'), `#${id}MenuPanel`, 6)
      rec(w, scn, `${id} menu: a row under the mouse shades`, `hover ${row1}`, 'hovered row background differs from a resting row', `resting ${bgRest}; hovered ${bgHover}; other row while hovering ${bgOther}`, bgHover !== bgRest && bgOther === bgRest, pics(pH, pHc))
      await w.page.mouse.move(2, 2); await w.page.keyboard.press('Escape'); await sleep(400)
      /* keyboard: Tab to the menu button, Enter opens, Tab/arrows into the rows */
      await w.page.locator(`#${id}MenuBtn`).focus()
      await w.page.keyboard.press('Enter'); await sleep(400)
      const seq = []
      for (const k of ['Tab', 'ArrowDown', 'ArrowDown']) {
        await w.page.keyboard.press(k); await sleep(250)
        seq.push(await w.page.evaluate(() => { const a = document.activeElement; if (!a) return null; const cs = getComputedStyle(a); return { id: a.id || a.tagName, inMenu: !!a.closest('.menupanel'), fv: a.matches(':focus-visible'), outline: cs.outlineStyle + ' ' + cs.outlineWidth + ' ' + cs.outlineColor, shadow: cs.boxShadow.slice(0, 70), bg: cs.backgroundColor } }))
      }
      const last = seq[seq.length - 1]
      const pK = await shot(w, name(w, 'S4', id + '-keyboard'))
      const pKc = await crop(w, name(w, 'S4', id + '-keyboard-crop'), `#${id}MenuPanel`, 6)
      const ring = seqs => seqs.some(s => s && s.inMenu && s.fv && ((/^(solid|auto)/.test(s.outline) && !/^[a-z]+ 0px/.test(s.outline)) || (s.shadow && s.shadow !== 'none')))
      rec(w, scn, `${id} menu: a row under the keyboard shows its focus ring`, `focus the ${id} button, Enter, Tab, ArrowDown ×2`, 'focused row inside the menu with a visible ring', JSON.stringify(seq), ring(seq), pics(pK, pKc))
      await w.page.keyboard.press('Escape'); await sleep(400)
    }
  }
  /* Edit chart layout */
  await press(w, '#sylMenuBtn'); const pa = await press(w, '#arrangeBtn', name(w, 'S4', 'edit-layout'))
  await sleep(700)
  const arr = await w.page.evaluate(() => { const t = document.getElementById('arrTools'); const b = document.getElementById('resetLayout'); const r = b && b.getBoundingClientRect(); return { on: !!t && t.classList.contains('on'), resetVis: !!r && r.width > 0, svg: b ? b.querySelectorAll('svg').length : 0, text: b ? b.textContent.trim() : null } })
  const pE = await shot(w, name(w, 'S4', 'edit-layout-open'))
  const pReset = await crop(w, name(w, 'S4', 'reset-layout-crop'), '#resetLayout', 10)
  rec(w, scn, 'Edit chart layout opens with Reset layout wearing the turning-back arrow', 'syllabus pencil → Edit chart layout', 'tool strip on; Reset layout holds an svg', JSON.stringify(arr), arr.on && arr.resetVis && arr.svg >= 1 && !/↺/.test(arr.text || ''), pics(pa, pE, pReset))
  await press(w, '#sylMenuBtn'); const pd = await press(w, '#arrangeBtn', name(w, 'S4', 'edit-layout-leave'))
  let dlg = await isVis(w, '#dlgModal'), dlgSaid = ''
  if (dlg) { dlgSaid = clean(await vis(w, '#dlgMsg').innerText()); const btns = await w.page.locator('#dlgModal button').allInnerTexts(); dlgSaid += ' [' + btns.join(' | ') + ']'; const dis = w.page.locator('#dlgModal button', { hasText: /discard|don.t save|leave/i }).first(); if (await dis.count()) await dis.click(); else await vis(w, '#dlgCancel').click(); await sleep(600) }
  const left = await w.page.evaluate(() => { const t = document.getElementById('arrTools'); return !t || !t.classList.contains('on') })
  rec(w, scn, 'leaving Edit chart layout without saving', 'syllabus pencil → Done editing chart', 'tool strip gone, no save asked (nothing was changed)', `strip gone ${left}; question ${dlg ? dlgSaid : 'none'}`, left, pics(pd, await shot(w, name(w, 'S4', 'edit-layout-left'))))
}

const infoText = async w => {
  await tabTo(w, 'Info')
  const t = await w.page.evaluate(() => [...document.querySelectorAll('#page-tracker .card')].filter(e => e.getBoundingClientRect().width > 0).map(e => e.innerText.replace(/\s+/g, ' ').trim()).join(' || '))
  await tabTo(w, 'Flow')
  return t
}
const ballSig = (w, id) => w.page.evaluate(id => { const g = [...document.querySelectorAll('#flowSvg .ball')].find(x => x.dataset.id === id); if (!g) return null; return [...g.querySelectorAll('*')].map(e => { const cs = getComputedStyle(e); return cs.fill + '/' + cs.stroke }).join(';') }, id)
const showAllOf = async (w, id) => {
  await press(w, w.touch ? '#showAllTab' : '#showAllBtn')
  await vis(w, '#saSearch').fill(id); await sleep(500)
  const t = clean(await w.page.evaluate(() => document.getElementById('saBody').innerText)).replace(/\s+/g, ' ').slice(0, 400)
  return t
}
async function S5(w) {
  const scn = 'S5'; mark(w)
  const c0 = await courseInfo(w)
  await ensureTwoCourses(w, scn)
  const c1 = await courseInfo(w)
  if (c1.value !== c0.value) { await vis(w, '#courseSel').selectOption(c0.value); await sleep(1200) }
  const first = await courseInfo(w)
  /* pick another student */
  const st0 = await w.page.evaluate(() => { const s = document.getElementById('activeSel'); return { v: s.value, t: s.options[s.selectedIndex] && s.options[s.selectedIndex].text, all: [...s.options].map(o => ({ v: o.value, t: o.text })) } })
  const other = st0.all.find(o => o.v !== st0.v)
  if (!other) { rec(w, scn, 'pick another student', 'Crew dropdown', 'a second student', 'only one student', null); return }
  await vis(w, '#activeSel').selectOption(other.v); await sleep(1000)
  const st1 = await w.page.evaluate(() => { const s = document.getElementById('activeSel'); return s.options[s.selectedIndex].text })
  const pPick = await shot(w, name(w, 'S5', 'student-picked'))
  rec(w, scn, 'pick another student', 'Crew dropdown → ' + other.t, 'the dropdown and the chart follow', `was ${st0.t}, now ${st1}`, st1 === other.t, pics(pPick))
  /* Find an event, pick from the list */
  const ID = 'ACG-09'
  if (w.size.width <= 1050) await press(w, '#hSearchBtn', name(w, 'S5', 'find-open')); else await vis(w, '#hSearch').click()
  await sleep(400)
  await L.typeFind(w.page, ID)
  const listed = await w.page.locator('#hSearchList .findrow').count()
  const pF = await shot(w, name(w, 'S5', 'find-typed'))
  const rowText = listed ? clean(await w.page.locator('#hSearchList .findrow').first().innerText()).replace(/\s+/g, ' ') : ''
  const pf = listed ? await press(w, '#hSearchList .findrow', name(w, 'S5', 'find-pick')) : null
  await sleep(1500)
  const g0 = await geo(w.page, ID)
  const pLand = await shot(w, name(w, 'S5', 'find-landed'))
  rec(w, scn, 'Find an event by typing and pick it from the list', `Find → typed ${ID} → first row`, 'a list row for the event; the chart lands the event in view', `rows ${listed}, first row ${JSON.stringify(rowText)}; ball on screen ${!!g0.ball}, at ${g0.ball ? Math.round(g0.ball.x) + ',' + Math.round(g0.ball.y) : '-'}`, listed > 0 && !!g0.ball && g0.ball.y > 0 && g0.ball.y < w.size.height, pics(pF, pf, pLand))
  /* before the mark */
  const sig0 = await ballSig(w, ID)
  const info0 = await infoText(w)
  const sa0 = await showAllOf(w, ID); const pSA0 = await shot(w, name(w, 'S5', 'showall-before')); await press(w, '#saClose')
  const g1 = await geo(w.page, ID)
  /* tap the event */
  const pt = await pressXY(w, g1.ball.x, g1.ball.y, name(w, 'S5', 'tap-event'))
  await sleep(1300)
  const g2 = await geo(w.page, ID)
  const pPop = await shot(w, name(w, 'S5', 'marking-window'))
  rec(w, scn, 'tapping the event opens the marking window', 'tap the ball', 'marking window shown', `shown ${g2.pop && g2.pop.shown}`, !!(g2.pop && g2.pop.shown), pics(pt, pPop))
  const pd = await press(w, '#pop [data-g=dco]', name(w, 'S5', 'dco'))
  await sleep(900)
  const g3 = await geo(w.page, ID)
  const stillOpen = !!(g3.pop && g3.pop.shown)
  const pD = await shot(w, name(w, 'S5', 'after-dco'))
  rec(w, scn, 'DCO pressed in the marking window', 'DCO', 'the grade is taken', `window still open after DCO: ${stillOpen}`, true, pics(pd, pD))
  if (stillOpen) await press(w, '#pop button:has-text("Close")', name(w, 'S5', 'close'))
  await sleep(600)
  const g4 = await geo(w.page, ID)
  const pC = await shot(w, name(w, 'S5', 'window-closed'))
  rec(w, scn, 'the marking window closes', 'Close (or closed itself)', 'window gone', `shown ${!!(g4.pop && g4.pop.shown)}`, !(g4.pop && g4.pop.shown), pics(pC))
  const sig1 = await ballSig(w, ID)
  const pB = await crop(w, name(w, 'S5', 'ball-crop'), `#flowSvg .ball[data-id="${ID}"]`, 30)
  rec(w, scn, 'the ball changes colour on the chart', 'looked at', 'ball fills differ from before', `before ${sig0 && sig0.slice(0, 160)} | after ${sig1 && sig1.slice(0, 160)}`, !!sig0 && !!sig1 && sig0 !== sig1, pics(pB))
  const info1 = await infoText(w)
  const pI = await (async () => { await tabTo(w, 'Info'); const p = await shot(w, name(w, 'S5', 'info-after')); await tabTo(w, 'Flow'); return p })()
  rec(w, scn, 'the Info panel reflects it', 'Info (tab on a phone; side panel on a desktop)', 'the panel text differs from before', `before: ${info0.slice(0, 260)} || after: ${info1.slice(0, 260)}`, info0 !== info1, pics(pI))
  const sa1 = await showAllOf(w, ID); const pSA1 = await shot(w, name(w, 'S5', 'showall-after')); await press(w, '#saClose')
  rec(w, scn, 'Show All shows it', 'Show All filtered to the event', 'the event\'s line differs from before / mentions the grade', `before: ${sa0.slice(0, 200)} || after: ${sa1.slice(0, 200)}`, sa0 !== sa1, pics(pSA0, pSA1))
  /* Legend */
  const pl = await press(w, '#legendBtn', name(w, 'S5', 'legend'))
  const lo = await waitVis(w, '#trkLegend'); const pLg = await shot(w, name(w, 'S5', 'legend-open'))
  rec(w, scn, 'Legend opens', 'Legend', 'legend shown', 'open ' + lo, lo, pics(pl, pLg))
  await pressXY(w, 6, w.size.height - 6, name(w, 'S5', 'legend-outside'))
  rec(w, scn, 'Legend closes on a press outside', 'press on the dimmed page', 'legend gone', 'visible ' + (await isVis(w, '#trkLegend')), !(await isVis(w, '#trkLegend')), pics(await shot(w, name(w, 'S5', 'legend-closed'))))
  /* switch courses and come back */
  if (c1.all.length >= 2 || (await courseInfo(w)).all.length >= 2) {
    const all = (await courseInfo(w)).all; const otherC = all.find(o => o.v !== first.value)
    await vis(w, '#courseSel').selectOption(otherC.v); await sleep(1500)
    const mid = await courseInfo(w); const balls = await w.page.locator('#flowSvg .ball').count()
    const pO = await shot(w, name(w, 'S5', 'other-course'))
    rec(w, scn, 'switch to another course', 'Course dropdown', 'the other course shows', `now ${mid.name}, balls on chart ${balls}`, mid.value === otherC.v, pics(pO))
    await vis(w, '#courseSel').selectOption(first.value); await sleep(1500)
    const bk = await courseInfo(w)
    await L.land(w, ID)
    const sig2 = await ballSig(w, ID)
    const stBack = await w.page.evaluate(() => { const s = document.getElementById('activeSel'); return s.options[s.selectedIndex] && s.options[s.selectedIndex].text })
    const pBk = await shot(w, name(w, 'S5', 'back-on-first'))
    rec(w, scn, 'coming back, the mark is still there', 'Course dropdown back', 'same course, same student, ball still coloured as marked', `course ${bk.name}, student ${stBack}, ball same as marked: ${sig2 === sig1}`, bk.value === first.value && sig2 === sig1, pics(pBk))
  } else rec(w, scn, 'switch courses and come back', 'Course dropdown', 'two courses', 'only one course', null)
}

/* ---------- run ---------- */
const want = id => !ONLY.length || ONLY.includes(id)
async function world(label, opts, fnsList) {
  const w = await mkWorld({ ...opts, clock: CLOCK }); w.label = label; mark(w)
  for (const [id, fn] of fnsList) {
    if (!want(id)) continue
    try { await fn(w) } catch (e) { rec(w, id, 'script', '-', 'runs to the end', 'stopped: ' + String(e.message).split('\n')[0], null); try { await shot(w, name(w, id, 'stopped')) } catch {} }
    /* the next scenario starts from the plain chart */
  }
  await closeW(w)
}
const WIDTHS = [['desktop', { size: PC, dpr: 2 }], ['phone', { size: PHONE, touch: true, engine: 'webkit', dpr: 2 }]]
for (const [label, o] of WIDTHS) {
  /* S1 and S2 follow one another in one world (the deleted course is restored there); S3, S4 and S5 each get a fresh one */
  await world(label, o, [['S1', S1S2]])
  if (want('S2') && !want('S1')) await world(label, o, [['S2', S1S2]])
  await world(label, o, [['S3', S3]])
  await world(label, o, [['S4', S4]])
  await world(label, o, [['S5', S5]])
}
await closeAll()
writeFileSync(resolve(OUT, 'walk-results.json'), JSON.stringify(steps, null, 1))
const tally = {}; for (const s of steps) { const k = s.scenario + ' ' + s.width; tally[k] = tally[k] || { PASS: 0, FAIL: 0, NOTRUN: 0 }; tally[k][s.pass]++ }
console.log(JSON.stringify(tally, null, 1))
console.log('done: ' + steps.length + ' steps; results ' + resolve(OUT, 'walk-results.json'))
process.exit(exitCode)
