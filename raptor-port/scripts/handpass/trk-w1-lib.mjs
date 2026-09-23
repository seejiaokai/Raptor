/* [HUMAN-RETEST] Tracker — walker w1's shared helpers (23 Sep 26).

   Thin wrappers over trk-lib.mjs for the export → wipe → import walks (D120):
   every step still goes through the app's own controls — the File menu, the
   Export window's own tick-boxes, the Syllabus dropdown CLICKED before its option
   is chosen, the app's own question box. Only the OS file pickers are replaced,
   the documented way (trk-lib header): with the native pickers removed the app
   takes its other real path — a download out, a file input in (the iPhone's). */
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { shot, dlg, reveal, core, TMP } from './trk-lib.mjs'
import { mkdirSync } from 'node:fs'
mkdirSync(TMP, { recursive: true })
export * from './trk-lib.mjs'

export const sleep = ms => new Promise(r => setTimeout(r, ms))
export const ball = (page, id) => page.locator(`#flowSvg .ball[data-id="${id}"]`).first()
export const tmp = name => resolve(TMP, name)

/* a menu item behind one of the bar's menus (course ✎, syllabus ✎, ⇪ File) */
export async function menu(page, which, item) {
  await page.click(`#${which}MenuBtn`)
  await page.waitForSelector(`#${item}`, { state: 'visible', timeout: 4000 })
  await page.click(`#${item}`)
  await sleep(300)
}

export const sylOptions = page => page.evaluate(() => [...document.querySelectorAll('#sylSel option')].map(o => ({ id: o.value, label: o.textContent, sel: o.selected })))
export const sylLabels = async page => (await sylOptions(page)).map(o => o.label)
export const curSylLabel = page => page.locator('#sylSel option:checked').innerText().catch(() => '')
export const courseLabels = page => page.evaluate(() => [...document.querySelectorAll('#courseSel option')].map(o => o.textContent))
export const crewLabels = page => page.evaluate(() => [...document.querySelectorAll('#activeSel option')].map(o => o.textContent))
const bare = s => String(s || '').replace(/ ✎$/, '')

/* A dropdown the way a person uses it: press it, then choose the option.
   `want` is an exact label (the " ✎" edited mark ignored) or a RegExp. Does NOT
   answer any question the switch raises — the caller reads it. */
export async function pickFrom(page, sel, want) {
  await page.click(sel); await sleep(150)
  const v = await page.evaluate(({ sel, exact, src }) => {
    const re = src ? new RegExp(src) : null
    const o = [...document.querySelector(sel).options].find(o => {
      const t = o.textContent.replace(/ ✎$/, '')
      return re ? re.test(o.textContent) : t === exact
    })
    return o ? o.value : null
  }, { sel, exact: typeof want === 'string' ? want : null, src: want instanceof RegExp ? want.source : null })
  if (v == null) { await page.keyboard.press('Escape'); throw new Error(`no option ${want} in ${sel}`) }
  await page.selectOption(sel, v)
  /* the headless browser keeps the native list drawn after a scripted choice (a
     real choice closes it); moving focus off the box closes it — no state change */
  await page.evaluate(sel => { const el = document.querySelector(sel); if (el && document.activeElement === el) el.blur() }, sel)
  await sleep(900)
  return v
}
export const pickSyl = (page, want) => pickFrom(page, '#sylSel', want)
export const pickCourse = (page, want) => pickFrom(page, '#courseSel', want)
export const pickCrew = (page, want) => pickFrom(page, '#activeSel', want)

export async function dlgUp(page, timeout = 3000) {
  const t0 = Date.now()
  while (Date.now() - t0 < timeout) {
    if (await page.locator('#dlgModal').isVisible().catch(() => false)) return true
    await sleep(120)
  }
  return false
}
export const dlgText = page => page.locator('#dlgMsg').innerText().then(s => s.trim()).catch(() => '')

/* arrange (chart edit) mode through the Syllabus ✎ menu */
export const arranging = page => page.locator('#arrTools.on').count().then(n => n > 0)
export async function arrangeOn(page) { if (!(await arranging(page))) await menu(page, 'syl', 'arrangeBtn'); await sleep(250) }
export async function arrangeOff(page) { if (await arranging(page)) await menu(page, 'syl', 'arrangeBtn'); await sleep(250) }
export async function tool(page, label) { await page.locator('#arrTools button', { hasText: label }).first().click(); await sleep(180) }
export const saveLit = page => page.locator('#saveChanges').count().then(n => n > 0)
export const saveStat = page => page.locator('#saveStat').innerText().catch(() => '')

export async function center(loc) { const b = await loc.boundingBox(); return b ? { x: b.x + b.width / 2, y: b.y + b.height / 2 } : null }
export async function dragBy(page, id, dx, dy) {
  await reveal(page, id)
  const c = await center(ball(page, id)); if (!c) return false
  await page.mouse.move(c.x, c.y); await page.mouse.down()
  for (let i = 1; i <= 8; i++) await page.mouse.move(c.x + dx * i / 8, c.y + dy * i / 8)
  await page.mouse.up(); await sleep(350)
  return true
}
/* the centre of a ball — outside arrange mode a press here grades the picked student */
export async function tapBall(page, id) {
  await reveal(page, id)
  const b = await ball(page, id).boundingBox(); if (!b) return false
  await page.mouse.click(b.x + b.width / 2, b.y + b.height / 2); await sleep(400)
  return true
}
/* + Flight / + Acad … in the edit strip: it asks for the event's name first */
export async function addBall(page, label, name) {
  await page.locator('#arrTools button', { hasText: label }).first().click(); await sleep(300)
  if (await dlgUp(page, 2000)) return dlg(page, { value: name })
  return { text: '(no name question)' }
}

/* What a person SEES of one chart: every ball's id, position, label and font,
   and every stroke — read off the drawn chart, not the store (trk-01's reader). */
export async function drawn(page) {
  return page.evaluate(() => {
    const svg = document.querySelector('#flowSvg')
    const balls = [...svg.querySelectorAll('.ball')].map(g => {
      const t = g.getAttribute('transform') || ''
      const txt = [...g.querySelectorAll('text')].map(x => x.textContent).join('|')
      const fs = [...g.querySelectorAll('text')].map(x => x.style.fontSize || x.getAttribute('font-size') || '').join('|')
      return { id: g.dataset.id, t, txt, fs }
    }).sort((a, b) => a.id.localeCompare(b.id))
    const lines = [...svg.querySelectorAll('path, line, polyline')]
      .filter(p => !p.closest('.ball') && !/hit|handle/.test(p.getAttribute('class') || '') && p.id !== 'drawPrev')
      .map(p => (p.getAttribute('d') || [p.getAttribute('x1'), p.getAttribute('y1'), p.getAttribute('x2'), p.getAttribute('y2')].join(',') || p.getAttribute('points') || '') + (p.getAttribute('marker-end') ? ' [end-arrow]' : '') + (p.getAttribute('marker-start') ? ' [start-arrow]' : ''))
      .sort()
    return { balls, lines }
  })
}

/* ---------- aiming at a point of the chart (read-only geometry) ---------- */
/* chart coordinates → screen pixels, through the chart's own current pan/zoom */
export const toScreen = (page, pts) => page.evaluate(pts => {
  const m = document.getElementById('viewport').getScreenCTM()
  return pts.map(p => ({ x: m.a * p.x + m.c * p.y + m.e, y: m.b * p.x + m.d * p.y + m.f }))
}, pts)
/* a ball's centre in chart coordinates (its group sits at centre − 29) */
export const ballCentre = (page, id) => page.evaluate(id => {
  const g = [...document.querySelectorAll('#flowSvg .ball')].find(x => x.dataset.id === id); if (!g) return null
  const m = /translate\(([-\d.]+),\s*([-\d.]+)\)/.exec(g.getAttribute('transform') || ''); return m ? { x: +m[1] + 29, y: +m[2] + 29 } : null
}, id)
/* bring a chart point to the middle of the board by dragging empty space (arrange
   mode pans that way — the wheel zooms there) */
export async function revealPoint(page, pt) {
  for (let i = 0; i < 14; i++) {
    const d = await page.evaluate(pt => {
      const bd = document.getElementById('board'), b = bd.getBoundingClientRect()
      const m = document.getElementById('viewport').getScreenCTM()
      const sx = m.a * pt.x + m.c * pt.y + m.e, sy = m.b * pt.x + m.d * pt.y + m.f
      let grab = null
      for (let fy = 0.12; fy < 0.92 && !grab; fy += 0.07) for (let fx = 0.04; fx < 0.96 && !grab; fx += 0.05) {
        const x = b.left + b.width * fx, y = b.top + b.height * fy, el = document.elementFromPoint(x, y)
        if (el && (el.id === 'flowSvg' || (el.closest && el.closest('#flowSvg') && !el.closest('.ball') && el.tagName.toLowerCase() === 'rect' && !/hit|handle|port|lend|lvert|wedge/.test(el.getAttribute('class') || '')))) grab = { x, y }
      }
      return { dx: sx - (b.left + b.width / 2), dy: sy - (b.top + b.height / 2), w: b.width, h: b.height, grab }
    }, pt)
    if (Math.abs(d.dx) < d.w / 4 && Math.abs(d.dy) < d.h / 4) return true
    if (!d.grab) return false
    const step = { x: Math.max(-500, Math.min(500, -d.dx)), y: Math.max(-500, Math.min(500, -d.dy)) }
    await page.mouse.move(d.grab.x, d.grab.y); await page.mouse.down()
    for (let k = 1; k <= 6; k++) await page.mouse.move(d.grab.x + step.x * k / 6, d.grab.y + step.y * k / 6)
    await page.mouse.up(); await sleep(150)
  }
  return false
}
/* a real click at a chart point */
export async function clickAt(page, pt) { const [s] = await toScreen(page, [pt]); await page.mouse.click(s.x, s.y); await sleep(250); return s }

/* ---------- the File menu ---------- */
/* ⤓ Export through its own window. tick: 'all' | 'as-opened' | [labels].
   students: tick "Students & courses". Returns what the window offered and what
   the file holds. */
export async function exportVia(page, { tick = 'all', students = false, file, shotName = null, preAnswer = 'ok' } = {}) {
  await page.evaluate(() => { try { delete window.showSaveFilePicker } catch (_) {} window.showSaveFilePicker = undefined })
  await menu(page, 'file', 'exportBtn')
  /* does anything ask BEFORE the Export window (e.g. unsaved flow edits)? */
  let pre = null
  if (!(await page.locator('#copyModal').isVisible().catch(() => false)) && await dlgUp(page, 1200)) {
    pre = await dlgText(page)
    await page.click(preAnswer === 'ok' ? '#dlgOk' : '#dlgCancel'); await sleep(400)
  }
  await page.waitForSelector('#copyModal', { state: 'visible' })
  const offers = (await page.locator('#copySylList label').allInnerTexts()).map(s => s.trim())
  const tickedAtOpen = await page.locator('#copySylList input:checked').count()
  const chartsAtOpen = await page.isChecked('#copyCharts')
  const studentsAtOpen = await page.isChecked('#copyStudents')
  const countLine = await page.locator('#copyModal .mini', { hasText: 'Syllabi to include' }).innerText().catch(() => '')
  if (shotName) await shot(page, shotName)
  if (students && !(await page.isChecked('#copyStudents'))) await page.click('#copyStudents')
  const boxes = await page.locator('#copySylList label').all()
  for (const lb of boxes) {
    const name = (await lb.innerText()).trim(), cb = lb.locator('input')
    const want = tick === 'all' ? true : tick === 'as-opened' ? await cb.isChecked() : tick.includes(name)
    if (want !== (await cb.isChecked())) await cb.click()
  }
  const warn = await page.locator('#copyWarn').innerText().catch(() => '')
  const [dl] = await Promise.all([page.waitForEvent('download', { timeout: 15000 }), page.click('#copyOk')])
  const suggested = dl.suggestedFilename()
  const text = readFileSync(await dl.path(), 'utf8')
  if (file) writeFileSync(file, text)
  let conf = '(no confirmation)'
  if (await dlgUp(page, 4000)) conf = (await dlg(page, {})).text.replace(/\s+/g, ' ')
  return { pre, offers, tickedAtOpen, chartsAtOpen, studentsAtOpen, countLine, warn, suggested, text, json: JSON.parse(text), conf }
}

const FINAL = /^(Brought in|Students & marks restored|Nothing was brought in|That file)/
/* ⇪ Import a file through the menu. `decide(msg, i, page)` returns 'ok' | 'alt' |
   'cancel' | 'leave' (leave the question up and stop). Default: OK to everything
   ("Replace it" for a chart already here, Yes to students, OK to the result). */
export async function importVia(page, file, decide = null) {
  await page.evaluate(() => { try { delete window.showOpenFilePicker } catch (_) {} window.showOpenFilePicker = undefined })
  await page.click('#fileMenuBtn'); await page.waitForSelector('#importFileBtn', { state: 'visible' })
  const [chooser] = await Promise.all([page.waitForEvent('filechooser', { timeout: 10000 }), page.click('#importFileBtn')])
  await chooser.setFiles(file)
  const asked = []
  for (let i = 0; i < 40; i++) {
    if (!(await dlgUp(page, 8000))) { asked.push({ msg: '(no further question within 8 s)' }); break }
    const msg = await dlgText(page)
    const btns = (await page.locator('#dlgModal button').allInnerTexts()).map(s => s.trim())
    const ans = decide ? await decide(msg, i, page) : 'ok'
    asked.push({ msg: msg.replace(/\s+/g, ' '), btns, ans })
    if (ans === 'leave') break
    const id = ans === 'alt' ? '#dlgAlt' : ans === 'cancel' ? '#dlgCancel' : '#dlgOk'
    await page.click(id); await sleep(450)
    if (FINAL.test(msg)) break
  }
  return asked
}

/* ---------- reading an event's details the way a person does ---------- */
/* ⓘ on, tap the ball, read the bubble, ⓘ off */
export async function bubble(page, id) {
  await page.click('#detailsBtn'); await sleep(200)
  const ok = await reveal(page, id)
  let txt = '(ball not found)'
  if (ok !== false || await ball(page, id).count()) {
    await ball(page, id).click().catch(() => {}); await sleep(400)
    txt = await page.evaluate(() => { const b = document.getElementById('detailBubble'); return b && b.style.display !== 'none' ? b.innerText : '(no bubble)' })
  }
  await page.click('#detailsBtn'); await sleep(200)
  return txt.replace(/\s+/g, ' ').trim()
}
/* ☰ Show All → the row for one event (filtered by its code) */
export async function showAllRow(page, id, { close = true } = {}) {
  await page.click('#showAllBtn'); await page.waitForSelector('#showAllPanel', { state: 'visible' }); await sleep(250)
  await page.fill('#saSearch', id); await sleep(300)
  const row = page.locator('#saBody .sarow').filter({ has: page.locator('.sid', { hasText: new RegExp('^' + id.replace(/[()]/g, '\\$&') + '$') }) }).first()
  const txt = (await row.count()) ? (await row.innerText()).replace(/\s+/g, ' ').trim() : '(no row)'
  if (close) { await page.click('#saClose'); await sleep(200) }
  return txt
}
/* ☰ Show All → Edit on one row → change fields by their label → Save */
export async function showAllEdit(page, id, fields, shotName = null) {
  await page.click('#showAllBtn'); await page.waitForSelector('#showAllPanel', { state: 'visible' }); await sleep(250)
  await page.fill('#saSearch', id); await sleep(300)
  const row = page.locator('#saBody .sarow').filter({ has: page.locator('.sid', { hasText: new RegExp('^' + id.replace(/[()]/g, '\\$&') + '$') }) }).first()
  await row.locator('button.sedit').click(); await sleep(250)
  const before = {}
  for (const [label, v] of Object.entries(fields)) {
    const box = page.locator('.saedit label', { hasText: label }).locator('input, textarea').first()
    before[label] = await box.inputValue()
    await box.fill(v)
  }
  if (shotName) await shot(page, shotName)
  await page.locator('.saedit .saedit-btns button.primary').click(); await sleep(400)
  const after = (await row.innerText()).replace(/\s+/g, ' ').trim()
  await page.click('#saClose'); await sleep(200)
  return { before, after }
}
/* the grading pop-up's ✎ Edit details → the details window → Save */
export async function popEditDetails(page, id, fields, shotName = null) {
  await tapBall(page, id)
  if (!(await page.locator('#pop').isVisible().catch(() => false))) return { err: 'no pop-up' }
  const title = await page.locator('#popTitle').innerText().catch(() => '')
  await page.click('#popEditInfo'); await page.waitForSelector('#infoModal', { state: 'visible' }); await sleep(200)
  const map = { name: '#ifName', fmt: '#ifFmt', hrs: '#ifHrs', crew: '#ifCrew', pre: '#ifPre' }
  const before = {}
  for (const [k, v] of Object.entries(fields)) { before[k] = await page.inputValue(map[k]); await page.fill(map[k], v) }
  if (shotName) await shot(page, shotName)
  await page.click('#ifSave'); await sleep(400)
  return { title, before }
}

/* the store's view of the charts — READ-ONLY, to check what a screen claims */
export const storeCharts = page => core(page, c => c.collectCharts())
/* one stored record, by the tail of its key (the Tracker files under raptor:tracker/…) — READ-ONLY */
export const lsGet = (page, tail) => page.evaluate(tail => {
  for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (k && /tracker/i.test(k) && k.endsWith(tail)) return localStorage.getItem(k) }
  return null
}, tail)
