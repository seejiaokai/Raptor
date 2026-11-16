// The Tracker's small fixes, prepared — pictures for the questions page (17 Nov 26, the night's job 4).
// Three backlog items: [TRK-DOWN-DAYS-CANCELLED] (can a cancelled medical input exist today? — proved here through the
// app's own controls), [TRK-MENU-KEYS] (the Tracker's menus under the keys) and [TRK-NO-TYPED-STUDENT] (the + Add window
// without a typed name, his D1931).
// Drawn on the REAL running app by .claude/skills/brainstorming/mockups-on-the-real-app.md: each "today" frame is the app
// as it draws itself, reached through its own controls; each "proposed" frame hides an app node (display:none, never
// removed), changes one line's words, takes one class off, or edits one rule of the app's own stylesheet in place
// (rule.style.setProperty — the menus' keyboard ring, the board's own values: 2px solid var(--accent), offset -2px,
// from `.sb-moreitem:focus-visible`, ui/scheduler/18-oil-board.css). The mark kit (mark, tag, hide, checkTags) is
// round 3's of the multi-squadron design (docs/mock/2026-11-17-multi-sqn-r3/draw.mjs).
//
// Run from raptor-port/, against a built preview already serving:  TS_URL=http://localhost:4180/ node docs/mock/2026-11-17-trk-small/draw.mjs
// TS_ONLY=q1,q2,q3 draws only those. Pictures and manifest.json go to docs/img/2026-11-17-trk-small/.
// Demo data only (the seeded roster's callsigns; the Tracker's demo course). The Inputs calendar is stepped back to
// July 2026, the demo week's month, from the real today — the script steps until the heading reads JULY 2026.
import { chromium } from '@playwright/test'
import { existsSync, mkdirSync, writeFileSync, readFileSync } from 'node:fs'

const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const URL_ = process.env.TS_URL || 'http://localhost:4180/'
const OUT = 'docs/img/2026-11-17-trk-small'
const ONLY = process.env.TS_ONLY ? process.env.TS_ONLY.split(',') : null
mkdirSync(OUT, { recursive: true })

const SIZES = {
  d: { name: 'desktop', opts: { viewport: { width: 1536, height: 864 }, deviceScaleFactor: 2 } },
  p: { name: 'phone', opts: { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 } },
}

const MARK_CSS = `
.mkq { outline: 2px solid #ff2d95 !important; outline-offset: -2px !important; }
.mkq.mkq-o { outline-offset: 2px !important; }
.mkq-tag { position: absolute; z-index: 60; background: #ff2d95; color: #fff; font: 700 10px/14px system-ui, 'Segoe UI', sans-serif;
  padding: 0 4px; border-radius: 7px; pointer-events: none; white-space: nowrap; letter-spacing: 0; text-transform: none; text-decoration: none; }
`
const TOAST_CSS = `.toast, .toasts, #toast, #toastEl { display: none !important; }`

function kit() {
  const mq = {}
  mq.vis = e => { if (!e) return false; const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 }
  mq.hide = e => { e.setAttribute('data-mqhid', '1'); e.style.setProperty('display', 'none', 'important') }
  // The tag is laid on the page itself (fixed, over everything), placed by the element's box: a text box cannot hold a
  // child and a menu panel clips one, so nothing is put inside the app's own parts — only the outline class is.
  mq.mark = (el, label, where = 'in') => {
    const b = el.getBoundingClientRect()
    el.classList.add('mkq'); if (!['in', 'inb', 'mid'].includes(where)) el.classList.add('mkq-o')   // a tag inside keeps the outline inside, where a clipping list still shows it
    const t = document.createElement('span')
    t.className = 'mkq-tag'; t.textContent = label; t.setAttribute('data-mine', '1')
    t.style.position = 'fixed'; t.style.zIndex = '2147483647'
    document.body.appendChild(t)
    const tw = t.offsetWidth, th = t.offsetHeight
    let x, y
    if (where === 'right') { x = b.right + 5; y = b.top + b.height / 2 - th / 2 }
    else if (where === 'left') { x = b.left - 5 - tw; y = b.top + b.height / 2 - th / 2 }
    else if (where === 'above') { x = b.right - tw; y = b.top - 3 - th }
    else if (where === 'inb') { x = b.right - 4 - tw; y = b.bottom - 4 - th }
    else if (where === 'mid') { x = b.left + b.width / 2 - tw / 2; y = b.top + b.height / 2 - th / 2 }
    else { x = b.right - 1 - tw; y = b.top + 1 }
    t.style.left = x + 'px'; t.style.top = y + 'px'
    const a = el.getBoundingClientRect()
    if (!['x', 'y', 'width', 'height'].every(k => Math.abs(a[k] - b[k]) < 0.5)) throw new Error('mark moved its element: ' + label)
    return true
  }
  // a tag only, no outline — for a part whose own ring is what the picture shows
  mq.tag = (el, label, where = 'in') => { mq.mark(el, label, where); el.classList.remove('mkq', 'mkq-o') }
  mq.checkTags = () => {
    const bad = []
    for (const t of document.querySelectorAll('.mkq-tag')) {
      const r = t.getBoundingClientRect()
      if (!(r.width > 0)) { bad.push(t.textContent + ': not drawn'); continue }
      for (let a = t.parentElement; a && a !== document.documentElement; a = a.parentElement) {
        const cs = getComputedStyle(a)
        if (cs.overflowX !== 'visible' || cs.overflowY !== 'visible') {
          const c = a.getBoundingClientRect()
          if (r.left < c.left - 0.5 || r.right > c.right + 0.5 || r.top < c.top - 0.5 || r.bottom > c.bottom + 0.5) bad.push(t.textContent + ': clipped by ' + a.className)
        }
      }
    }
    return bad
  }
  mq.unmark = () => {
    document.querySelectorAll('[data-mine]').forEach(e => e.remove())
    document.querySelectorAll('[data-mqhid]').forEach(e => { e.style.removeProperty('display'); e.removeAttribute('data-mqhid') })
    document.querySelectorAll('.mkq').forEach(e => e.classList.remove('mkq', 'mkq-o'))
  }
  // a React-held box's value set through its own input event — never typed, so an emulated phone does not zoom to it
  mq.setVal = (el, v) => { Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(el, v); el.dispatchEvent(new Event('input', { bubbles: true })) }
  // THE ONE RULE EDITED IN PLACE: the Tracker's menu items under the keys, given the board's ring (found once, asserted)
  mq.menuRing = () => {
    let n = 0
    for (const sh of document.styleSheets) {
      let rules; try { rules = sh.cssRules } catch { continue }
      const walk = list => { for (const r of list) { if (r.cssRules && !r.selectorText) walk(r.cssRules); else if (r.selectorText && /\.menupanel\s*>\s*button:focus-visible/.test(r.selectorText) && r.style.background) { r.style.setProperty('outline', '2px solid var(--accent)'); r.style.setProperty('outline-offset', '-2px'); n++ } } }
      walk(rules)
    }
    if (n !== 1) throw new Error('menu ring rule found ' + n + ' times')
    return n
  }
  window.__mq = mq
}

const manifest = {}
const errs = []
let browser

async function world(sz) {
  const ctx = await browser.newContext(SIZES[sz].opts)
  await ctx.addInitScript(kit)
  const page = await ctx.newPage()
  page.on('pageerror', e => { errs.push(`[${sz}] PAGEERROR ${e}`); console.log('PAGEERROR', String(e)) })
  page.on('console', m => { if (m.type() === 'error') errs.push(`[${sz}] CONSOLE ${m.text()}`) })
  await page.goto(URL_)
  await page.waitForSelector('#luser')
  await page.fill('#luser', 'ad'); await page.fill('#lpass', 'a')
  await page.click('#loginForm button[type=submit]')
  await page.waitForSelector('#vWeek .day', { state: 'attached' }); await page.waitForTimeout(700)
  await page.addStyleTag({ content: MARK_CSS + TOAST_CSS })
  return { ctx, page }
}
function rec(file, question, sz, kind, caption) { manifest[file] = { question, size: SIZES[sz].name, kind, caption } }
async function shot(page, file, clip) {
  const bad = await page.evaluate(() => window.__mq.checkTags())
  if (bad.length) throw new Error(file + ': ' + bad.join('; '))
  await page.waitForTimeout(120)
  await page.screenshot({ path: `${OUT}/${file}`, ...(clip ? { clip } : {}) })
  console.log('  wrote', file)
}
// the union of the named elements' boxes, padded, kept inside the viewport
async function clipOf(page, sels, pad = 12, extra = {}) {
  const r = await page.evaluate(([s]) => {
    const els = s.flatMap(q => [...document.querySelectorAll(q)].filter(e => window.__mq.vis(e)).slice(0, 1))
    if (!els.length) return null
    els.push(...[...document.querySelectorAll('.mkq-tag')].filter(e => window.__mq.vis(e)))   // every tag inside the crop
    const b = els.map(e => e.getBoundingClientRect())
    return { l: Math.min(...b.map(x => x.left)), t: Math.min(...b.map(x => x.top)), r: Math.max(...b.map(x => x.right)), b: Math.max(...b.map(x => x.bottom)) }
  }, [sels])
  if (!r) throw new Error('nothing to crop: ' + sels.join(', '))
  const vp = page.viewportSize()
  const x = Math.max(0, Math.floor(r.l - pad - (extra.l || 0))), y = Math.max(0, Math.floor(r.t - pad - (extra.t || 0)))
  const w = Math.min(vp.width, Math.ceil(r.r + pad + (extra.r || 0))) - x, h = Math.min(vp.height, Math.ceil(r.b + pad + (extra.b || 0))) - y
  return { x, y, width: w, height: h }
}

// ---------- Q1: a cancelled medical input, made through the app's own controls ----------
// The route: a scheduler cancels an activity input on the Ground Programme (the board's CX, a reason), then the input's
// kind is changed to a medical one in its own window on the Inputs page. The cancel rides the input (D760) and no step
// takes it off: a medical never stands on the Ground Programme (engine/inputs.ts goesOnProg), and the CX button is only
// on Ground Programme rows (ui/board.ts → ui/reqdoor.ts rowMark), so nothing can cancel a medical directly either.
async function toBoardThu(page) {
  await page.evaluate(() => window.go('editsched'))
  await page.waitForSelector('#page-editsched.on #eWeek .day')
  await page.waitForTimeout(900)
  await page.evaluate(() => document.querySelector('#eWeek .day:not(.peek) [data-sbday="3"]').click())
  await page.waitForSelector('.sb-go [data-gline]')
  await page.waitForTimeout(1200)
}
const rangerInput = page => page.evaluate(() => {
  const r = window.INPUTS.find(x => window.PEOPLE[x.person] && window.PEOPLE[x.person].cs === 'Ranger' && x.date === 'Jul 16')
  return r ? { iid: r.iid, type: r.type, cx: !!r.cx, cxr: r.cxr || '' } : null
})
async function inputsJuly(page) {
  await page.evaluate(() => window.go('inputs'))
  await page.waitForTimeout(1200)
  for (let i = 0; i < 12; i++) {
    const head = await page.evaluate(() => (document.querySelector('#page-inputs') || document.body).innerText)
    if (/JUL\w* 2026/i.test(head)) break   // JULY on a desktop, JUL on a phone
    await page.locator('#page-inputs button:visible', { hasText: '‹' }).first().click()
    await page.waitForTimeout(300)
  }
  await page.waitForTimeout(600)
}
async function q1(sz) {
  const { ctx, page } = await world(sz)
  try {
    if (sz === 'd') {
      // step 1 — the board's CX on Ranger's Appointment (Thursday 16 Jul), reason WX
      await toBoardThu(page)
      const ri = await page.evaluate(() => {
        const d = window.DAYS[3]
        return (d.ground || []).findIndex(r => { const i = window.INPUTS.find(x => String(x.iid) === String(r.src)); return i && window.PEOPLE[i.person] && window.PEOPLE[i.person].cs === 'Ranger' })
      })
      if (ri < 0) throw new Error('Ranger\'s Appointment is not on Thursday\'s Ground Programme')
      await page.click(`[data-grcx="3.${ri}"]`)
      await page.waitForTimeout(500)
      await page.getByRole('button', { name: 'WX', exact: true }).click()
      await page.waitForTimeout(200)
      await page.evaluate(([ri]) => {
        const mq = window.__mq
        const dlg = document.querySelector('#cxPop .airpop-box')
        mq.mark(dlg.querySelector('input, textarea'), '1a')
        const btn = [...dlg.querySelectorAll('button')].find(b => /Cancel line/.test(b.textContent)); mq.mark(btn, '1b', 'left')
        const row = document.querySelector(`[data-grcx="3.${ri}"]`).closest('.sb-grow, [data-gline], tr, div'); void row
      }, [ri])
      await shot(page, '1-route-d-cx.png', await clipOf(page, ['#cxPop .airpop-box'], 14))
      rec('1-route-d-cx.png', 'q1', 'd', 'today', 'Step 1, a real press: the board\'s CX on Ranger\'s Appointment, reason WX (1a), then Cancel line (1b).')
      await page.evaluate(() => window.__mq.unmark())
      await page.getByRole('button', { name: 'Cancel line' }).click()
      await page.waitForTimeout(600)
      let r = await rangerInput(page)
      if (!r || !r.cx || r.type !== 'Appointment') throw new Error('step 1 did not cancel: ' + JSON.stringify(r))
      await page.click('#sbDone')
      await page.waitForTimeout(800)
      // step 2 — its window on the Inputs page: the kind changed to OML, saved, "No document"
      await inputsJuly(page)
      await page.click(`[data-testid="ib-bar-${r.iid}"]`)
      await page.waitForTimeout(800)
      await page.selectOption('#inpEditType', 'OML')
      await page.waitForTimeout(400)
      await page.evaluate(() => {
        const mq = window.__mq
        mq.mark(document.querySelector('[data-testid=inped-cx]'), '1c', 'right')
        mq.mark(document.getElementById('inpEditType'), '1d')
      })
      await shot(page, '1-route-d-retype.png', await clipOf(page, ['[data-testid=inped-cx]', '#inpEditType'], 16, { r: 40 }))
      rec('1-route-d-retype.png', 'q1', 'd', 'today', 'Step 2, a real change: the cancelled input\'s own window (its CX WX tag, 1c), its kind changed to OML (1d), then Save and "No document".')
      await page.evaluate(() => window.__mq.unmark())
      await page.getByRole('button', { name: 'Save', exact: true }).click()
      await page.waitForTimeout(800)
      await page.getByRole('button', { name: 'No document', exact: true }).click()
      await page.waitForTimeout(900)
      r = await rangerInput(page)
      if (!r || !r.cx || r.type !== 'OML') throw new Error('step 2 did not leave a cancelled OML: ' + JSON.stringify(r))
      await page.waitForTimeout(6500)   // the app's own just-changed ring (about six seconds) gone before the calendar's pictures
      console.log('  PROOF: Ranger\'s input is now', JSON.stringify({ type: r.type, cancelled: r.cx, reason: r.cxr }))
      // the calendar: struck through
      const bar = `[data-testid="ib-bar-${r.iid}"]`
      if (!(await page.evaluate(b => document.querySelector(b).classList.contains('is-cx'), bar))) throw new Error('the bar is not drawn cancelled')
      await page.evaluate(b => window.__mq.mark(document.querySelector(b), '1e', 'right'), bar)
      await shot(page, '1-cal-d-today.png', await clipOf(page, [bar], 10, { l: 420, r: 210, t: 70, b: 40 }))
      rec('1-cal-d-today.png', 'q1', 'd', 'today', 'The Inputs calendar, 16 Jul: "Ranger · OML" struck through, as cancelled (1e).')
      // proposed: the change of kind takes the cancel off — the bar plain
      await page.evaluate(b => { window.__mq.unmark(); const e = document.querySelector(b); e.classList.remove('is-cx'); window.__mq.mark(e, '1f', 'right') }, bar)
      await shot(page, '1-cal-d-proposed.png', await clipOf(page, [bar], 10, { l: 420, r: 210, t: 70, b: 40 }))
      rec('1-cal-d-proposed.png', 'q1', 'd', 'proposed', 'Proposed (A): changing its kind to a medical one took the cancel off, so "Ranger · OML" is a plain medical (1f). Drawn: the struck look taken off this one bar.')
      await page.evaluate(b => { window.__mq.unmark(); document.querySelector(b).classList.add('is-cx') }, bar)
      // the Medical tab, as of 16 Jul: Ranger medically down
      await page.locator('#page-inputs button:visible', { hasText: 'Medical' }).first().click()
      await page.waitForTimeout(700)
      await page.locator('#page-inputs button:visible', { hasText: 'as of' }).first().click()
      await page.waitForTimeout(500)
      await page.locator('#page-inputs button:visible', { hasText: /^16$/ }).first().click()
      await page.waitForTimeout(800)
      const card = await page.evaluate(() => {
        const mq = window.__mq
        const c = [...document.querySelectorAll('#page-inputs .medcard')].find(e => mq.vis(e) && /Ranger/.test(e.textContent))
        if (!c) return false
        mq.mark(c, '1g', 'in'); c.setAttribute('data-ts-card', '1'); return true
      })
      if (!card) throw new Error('Ranger is not on the Medical tab')
      await shot(page, '1-medical-d-today.png', await clipOf(page, ['[data-ts-card]'], 14, { l: 30, t: 60, r: 260, b: 30 }))
      rec('1-medical-d-today.png', 'q1', 'd', 'today', 'The Medical tab as of 16 Jul: Ranger under Medically down (1g), the cancel not shown.')
      await page.evaluate(() => window.__mq.unmark())
      // the Tracker: Ranger added from the roster, course start 1 Jul 26; his down days count it
      await page.evaluate(() => window.go('tracker'))
      await page.waitForTimeout(2500)
      await addRanger(page)
      const dd = await page.evaluate(() => (document.getElementById('downDays') || {}).textContent || '')
      if (!/^1 day/.test(dd)) throw new Error('the Tracker\'s down days read ' + dd)
      await page.click('#downDays')
      await page.waitForTimeout(700)
      await page.evaluate(() => { const mq = window.__mq; mq.mark(document.querySelector('#downLog .frow'), '1h', 'mid'); mq.tag(document.getElementById('downDays'), '1i', 'left') })
      await shot(page, '1-downlog-d-today.png', await clipOf(page, ['#downLog', '#downDays'], 14))
      rec('1-downlog-d-today.png', 'q1', 'd', 'today', 'The Tracker, Ranger added from the roster with course start 1 Jul 26: No. of Down Days "1 day" (1i), and its window lists the cancelled OML of 16 Jul as 1 day (1h).')
    } else {
      // the phone: the same route, made the same way, then the Tracker's window on a phone
      await toBoardThu(page)
      const ri = await page.evaluate(() => (window.DAYS[3].ground || []).findIndex(r => { const i = window.INPUTS.find(x => String(x.iid) === String(r.src)); return i && window.PEOPLE[i.person] && window.PEOPLE[i.person].cs === 'Ranger' }))
      await page.locator(`[data-grcx="3.${ri}"]`).first().click()
      await page.waitForTimeout(500)
      await page.getByRole('button', { name: 'WX', exact: true }).click()
      await page.getByRole('button', { name: 'Cancel line' }).click()
      await page.waitForTimeout(600)
      let r = await rangerInput(page)
      if (!r || !r.cx) throw new Error('phone step 1 did not cancel')
      await page.click('#sbDone')
      await page.waitForTimeout(800)
      await inputsJuly(page)
      const barVis = await page.evaluate(i => window.__mq.vis(document.querySelector(`[data-testid="ib-bar-${i}"]`)), r.iid)
      if (!barVis) throw new Error('the phone calendar does not show the bar to open')
      await page.click(`[data-testid="ib-bar-${r.iid}"]`)
      await page.waitForTimeout(800)
      await page.selectOption('#inpEditType', 'OML')
      await page.getByRole('button', { name: 'Save', exact: true }).click()
      await page.waitForTimeout(800)
      await page.getByRole('button', { name: 'No document', exact: true }).click()
      await page.waitForTimeout(900)
      r = await rangerInput(page)
      if (!r || !r.cx || r.type !== 'OML') throw new Error('phone step 2 did not leave a cancelled OML')
      await page.evaluate(() => window.go('tracker'))
      await page.waitForTimeout(2500)
      await phoneInfo(page)
      await addRanger(page)
      await phoneInfo(page)
      await page.evaluate(() => document.getElementById('downDays').scrollIntoView({ block: 'center' }))
      await page.waitForTimeout(400)
      await page.click('#downDays')
      await page.waitForTimeout(700)
      await page.evaluate(() => window.__mq.mark(document.querySelector('#downLog .frow'), '1h', 'mid'))
      await shot(page, '1-downlog-p-today.png', await clipOf(page, ['#downLog'], 10))
      rec('1-downlog-p-today.png', 'q1', 'p', 'today', 'The same on a phone: the cancelled OML counted, 1 day (1h).')
    }
  } finally { await ctx.close() }
}
async function phoneInfo(page) {
  const b = page.locator('#page-tracker [data-view="info"]:visible')
  if (await b.count()) { await b.first().click(); await page.waitForTimeout(500) }
}
async function addRanger(page) {
  await page.locator('#page-tracker .c-students button:visible', { hasText: '+ Add' }).first().click()
  await page.waitForTimeout(600)
  await page.click('#dlgDate')
  await page.waitForTimeout(500)
  for (let i = 0; i < 4; i++) { await page.locator('[aria-label="Previous month"]:visible').first().click(); await page.waitForTimeout(200) }
  await page.locator('[data-iso="2026-07-01"]:visible').first().click()
  await page.waitForTimeout(400)
  await page.evaluate(() => window.__mq.setVal(document.getElementById('dlgFilter'), 'Ranger'))
  await page.waitForTimeout(300)
  await page.locator('#dlgList .dlg-item:visible').first().click()
  await page.waitForTimeout(1200)
}

// ---------- Q2: the Tracker's menus under the keys ----------
const MENUS = [['file', '#fileMenuBtn', 'File'], ['course', '#courseMenuBtn', 'Course'], ['syl', '#sylMenuBtn', 'Syllabus']]
async function q2(sz) {
  const { ctx, page } = await world(sz)
  try {
    await page.evaluate(() => window.go('tracker'))
    await page.waitForTimeout(2500)
    if (sz === 'p') {
      // a phone has no keys: a tap opens the menu and no ring shows, before or after the change
      await page.locator('#fileMenuBtn:visible').first().click()
      await page.waitForTimeout(500)
      await page.locator('#page-tracker h3:visible, #page-tracker .flbl:visible').first().click({ force: true }).catch(() => {})
      const open = await page.evaluate(() => !!document.querySelector('.menupanel.on'))
      if (!open) { await page.locator('#fileMenuBtn:visible').first().click(); await page.waitForTimeout(500) }
      await shot(page, '2-file-p-same.png', await clipOf(page, ['#fileMenuBtn', '.menupanel.on'], 12, { l: 40, r: 40 }))
      rec('2-file-p-same.png', 'q2', 'p', 'today', 'On a phone the File menu opened by a tap: no ring, today and after the change alike.')
      return
    }
    const ringOf = () => page.evaluate(() => { const a = document.activeElement; return a ? { id: a.id, txt: (a.textContent || '').trim(), fv: a.matches(':focus-visible'), outline: getComputedStyle(a).outlineColor + ' ' + getComputedStyle(a).outlineStyle } : null })
    for (const [k, btn, name] of MENUS) {
      // TODAY: Enter on the button opens the menu, the keys stay on the button; Tab reaches its first item, the browser's ring
      await page.focus(btn); await page.keyboard.press('Shift')
      await page.keyboard.press('Enter'); await page.waitForTimeout(400)
      await page.keyboard.press('ArrowDown'); await page.waitForTimeout(200)
      let a = await ringOf()
      if (!a || '#' + a.id !== btn) throw new Error(k + ': after Enter and ↓ the keys are not on the button: ' + JSON.stringify(a))
      if (k === 'file') {
        await page.evaluate(() => window.__mq.tag(document.querySelector('.menupanel.on'), '2a', 'right'))
        await shot(page, '2-file-d-today-enter.png', await clipOf(page, [btn, '.menupanel.on'], 12, { l: 20, r: 60 }))
        rec('2-file-d-today-enter.png', 'q2', 'd', 'today', 'Today: Enter on File ▾ opens the menu (2a) and the ↓ key does nothing: the keys stay on File ▾.')
        await page.evaluate(() => window.__mq.unmark())
      }
      await page.keyboard.press('Tab'); await page.waitForTimeout(200)
      a = await ringOf()
      if (!a || !a.fv) throw new Error(k + ': Tab did not put a keyboard ring on the first item')
      await page.evaluate(() => window.__mq.tag(document.activeElement, '2b', 'in'))
      await shot(page, `2-${k}-d-today.png`, await clipOf(page, [btn, '.menupanel.on'], 12, { l: 20, r: 60 }))
      rec(`2-${k}-d-today.png`, 'q2', 'd', 'today', `Today: the ${name} menu's first item reached by Tab wears the browser's white ring (2b) — measured ${a.outline}.`)
      await page.evaluate(() => window.__mq.unmark())
      await page.keyboard.press('Escape'); await page.waitForTimeout(300)
    }
    // PROPOSED: the board's ring on the items (the one rule edited in place); Enter puts the keys on the first item, ↓ the next
    await page.evaluate(() => window.__mq.menuRing())
    for (const [k, btn, name] of MENUS) {
      await page.focus(btn); await page.keyboard.press('Shift')
      await page.keyboard.press('Enter'); await page.waitForTimeout(400)
      await page.keyboard.press('Tab'); await page.waitForTimeout(200)   // drawn: the keys put on the first item, as Enter would
      const a = await ringOf()
      if (!a || !/solid/.test(a.outline)) throw new Error(k + ': the proposed ring did not take: ' + JSON.stringify(a))
      await page.evaluate(() => window.__mq.tag(document.activeElement, '2c', 'in'))
      await shot(page, `2-${k}-d-proposed.png`, await clipOf(page, [btn, '.menupanel.on'], 12, { l: 20, r: 60 }))
      rec(`2-${k}-d-proposed.png`, 'q2', 'd', 'proposed', `Proposed: Enter opens the ${name} menu with the keys on its first item, in the app's cyan ring (2c). Drawn: the board's ring on the menu's items; the keys put there by Tab.`)
      await page.evaluate(() => window.__mq.unmark())
      if (k === 'file') {
        await page.keyboard.press('Tab'); await page.waitForTimeout(200)   // drawn: ↓ moving to the next item
        await page.evaluate(() => window.__mq.tag(document.activeElement, '2d', 'in'))
        await shot(page, '2-file-d-proposed-down.png', await clipOf(page, [btn, '.menupanel.on'], 12, { l: 20, r: 60 }))
        rec('2-file-d-proposed-down.png', 'q2', 'd', 'proposed', 'Proposed: ↓ moves the keys to Export… (2d). Drawn: the next item reached by Tab.')
        await page.evaluate(() => window.__mq.unmark())
      }
      await page.keyboard.press('Escape'); await page.waitForTimeout(300)
    }
  } finally { await ctx.close() }
}

// ---------- Q3: + Add without a typed name (his D1931) ----------
async function q3(sz) {
  const { ctx, page } = await world(sz)
  try {
    await page.evaluate(() => window.go('tracker'))
    await page.waitForTimeout(2500)
    if (sz === 'p') await phoneInfo(page)
    await page.locator('#page-tracker .c-students button:visible', { hasText: '+ Add' }).first().click()
    await page.waitForTimeout(700)
    const DLG = '#dlgFilter'
    const box = async () => (await clipOf(page, ['#dlgDate', '#dlgOk, #dlgCancel'], 0)).y
    void box
    const dlgClip = async () => {
      const r = await page.evaluate(() => { const b = document.getElementById('dlgFilter').closest('[role=dialog], .modal, .dlg, .lullcal') || document.getElementById('dlgFilter').parentElement.parentElement.parentElement; b.setAttribute('data-ts-dlg', '1'); return true })
      void r
      return clipOf(page, ['[data-ts-dlg]'], 10)
    }
    void DLG
    // today, the window as it opens
    await page.evaluate(() => {
      const mq = window.__mq
      if (!mq.vis(document.getElementById('dlgInput'))) throw new Error('no typed-name box')
      mq.mark(document.getElementById('dlgInput'), '3a'); mq.mark(document.getElementById('dlgOk'), '3b', 'right')
    })
    await shot(page, `3-add-${sz}-today.png`, await dlgClip())
    rec(`3-add-${sz}-today.png`, 'q3', sz, 'today', 'Today: + Add, with "Or type a callsign" (3a) and OK (3b), which adds what was typed as a student linked to nobody.')
    // proposed: the typed box gone, and OK with it (a tap on a name adds him at once)
    await page.evaluate(() => {
      const mq = window.__mq; mq.unmark()
      mq.hide(document.getElementById('dlgInput')); mq.hide(document.getElementById('dlgOk'))
      mq.mark(document.getElementById('dlgCancel'), '3c', 'left')
    })
    await shot(page, `3-add-${sz}-proposed.png`, await dlgClip())
    rec(`3-add-${sz}-proposed.png`, 'q3', sz, 'proposed', 'Proposed: no typed box and no OK; a tap on a name adds him, Cancel closes (3c). Drawn: the box and OK hidden.')
    await page.evaluate(() => window.__mq.unmark())
    // today, a search that matches nobody
    await page.evaluate(() => window.__mq.setVal(document.getElementById('dlgFilter'), 'Zzyx'))
    await page.waitForTimeout(400)
    const line = await page.evaluate(() => { const n = document.querySelector('#dlgList .dlg-none'); return n ? n.textContent : '' })
    if (!/OK adds them as a new crew member/.test(line)) throw new Error('the no-match line reads: ' + line)
    await page.evaluate(() => { const mq = window.__mq; mq.mark(document.querySelector('#dlgList .dlg-none'), '3d', 'inb'); mq.mark(document.getElementById('dlgOk'), '3b', 'right') })
    await shot(page, `3-nomatch-${sz}-today.png`, await dlgClip())
    rec(`3-nomatch-${sz}-today.png`, 'q3', sz, 'today', `Today: a search that matches nobody — "${line}" (3d); OK or Enter adds "ZZYX" as a student linked to nobody.`)
    // proposed: the line's first sentence alone; no box, no OK
    await page.evaluate(() => {
      const mq = window.__mq; mq.unmark()
      const n = document.querySelector('#dlgList .dlg-none'); n.setAttribute('data-ts-old', n.textContent); n.textContent = 'Nobody on the roster matches “Zzyx”.'
      mq.hide(document.getElementById('dlgInput')); mq.hide(document.getElementById('dlgOk'))
      mq.mark(n, '3e', 'inb')
    })
    await shot(page, `3-nomatch-${sz}-proposed.png`, await dlgClip())
    rec(`3-nomatch-${sz}-proposed.png`, 'q3', sz, 'proposed', 'Proposed: "Nobody on the roster matches “Zzyx”." (3e) and nothing to add; Enter does nothing. Drawn: the line\'s second sentence, the box and OK taken away.')
    // proposed: nobody on the roster at all — the nearest real state (a search matching nobody), its words changed,
    // the search box and the list's title hidden
    await page.evaluate(() => {
      const mq = window.__mq; mq.unmark()
      const n = document.querySelector('#dlgList .dlg-none'); n.textContent = 'Nobody is on the squadron roster yet.'
      mq.hide(document.getElementById('dlgFilter').closest('.findbox') || document.getElementById('dlgFilter'))
      const t = document.querySelector('.dlg-listtitle'); if (t) mq.hide(t)
      mq.hide(document.getElementById('dlgInput')); mq.hide(document.getElementById('dlgOk'))
      mq.mark(n, '3f', 'inb')
    })
    await shot(page, `3-empty-${sz}-proposed.png`, await dlgClip())
    rec(`3-empty-${sz}-proposed.png`, 'q3', sz, 'proposed', 'Proposed, nobody on the roster: "Nobody is on the squadron roster yet." (3f); nothing can be added. Drawn from the nearest real state, a search matching nobody, its words changed and the search box hidden.')
    await page.evaluate(() => window.__mq.unmark())
  } finally { await ctx.close() }
}

browser = await chromium.launch(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {})
const ALL = { q1, q2, q3 }
try {
  for (const sz of ['d', 'p']) {
    console.log('== ' + SIZES[sz].name)
    for (const [k, f] of Object.entries(ALL)) {
      if (ONLY && !ONLY.includes(k)) continue
      try { await f(sz) } catch (e) { errs.push(`[${sz}] ${k} FAILED: ${e.message}`); console.log(k, 'FAILED', e.message) }
    }
  }
} finally {
  await browser.close()
}
let old = {}
try { old = JSON.parse(readFileSync(`${OUT}/manifest.json`, 'utf8')) } catch {}
const merged = { ...old, ...manifest }
const sorted = Object.fromEntries(Object.keys(merged).sort().map(k => [k, merged[k]]))
writeFileSync(`${OUT}/manifest.json`, JSON.stringify(sorted, null, 2) + '\n')
console.log('ERRORS ' + (errs.length ? '\n' + errs.join('\n') : 'none'))
