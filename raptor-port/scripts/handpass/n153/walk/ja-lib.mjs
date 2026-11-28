// Walker A (night of 24 Nov 26): the Tracker's records kept apart. Helpers on top of jlib.mjs. Every step presses the
// app's own controls; the page is read for facts only. Version line: ja-lib v1.
import { readFileSync } from 'node:fs'
import { newPage, go, state, note, press, pickSq, shut, ask, check, pic } from './jlib.mjs'
export * from './jlib.mjs'

export const OUTDIR = process.env.MQ_OUT
/* a browser with no native save/open picker (the app then uses its download and file-input doors, as Safari does) */
export async function mk(sz) {
  const s = await newPage(sz)
  s.page.setDefaultTimeout(20000)
  await s.ctx.addInitScript('try { delete window.showSaveFilePicker; delete window.showOpenFilePicker } catch (e) {}')
  return s
}
export const sleep = (s, ms) => s.page.waitForTimeout(ms)
/* one press, no fixed wait beyond a short settle; a finger on a phone */
export async function hit(s, sel, ms = 250) {
  const l = typeof sel === 'string' ? s.page.locator(sel).filter({ visible: true }).first() : sel
  if (!(await l.count())) { note(`[${s.sz}] no control ${sel}`); return false }
  try { if (s.desk) await l.click({ timeout: 8000 }); else await l.tap({ timeout: 8000 }) }
  catch (e) { const w = await s.page.evaluate(sel => { const q = typeof sel === 'string' ? document.querySelector(sel) : null; if (!q) return null; const b = q.getBoundingClientRect(), t = document.elementFromPoint(b.left + b.width / 2, b.top + b.height / 2); return { box: [b.left, b.top, b.width, b.height].map(Math.round), top: t ? `${t.tagName}#${t.id}.${t.className?.baseVal ?? t.className}` : null } }, typeof sel === 'string' ? sel : null).catch(() => null); note(`[${s.sz}] press on ${sel} did not land: ${JSON.stringify(w)} ${String(e).split(String.fromCharCode(10)).slice(0, 1)}`); throw e }
  await s.page.waitForTimeout(ms)
  return true
}
/* the Tracker's bar as drawn */
export const T = s => s.page.evaluate(() => {
  const opt = id => { const e = document.getElementById(id); if (!e) return null; const o = e.options[e.selectedIndex]; return { now: o ? o.textContent.trim() : null, list: [...e.options].map(x => x.textContent.trim()) } }
  const ev = document.getElementById('evCount')
  const st = document.getElementById('saveStat')
  const shown = e => { if (!e) return false; const b = e.getBoundingClientRect(); return b.width > 1 && b.height > 1 && getComputedStyle(e).visibility !== 'hidden' }
  const mark = [...document.querySelectorAll('.topbar .mark')].find(shown)
  return {
    sq: mark ? mark.textContent.replace(/\s+/g, ' ').trim() : null,
    title: document.getElementById('courseTitle')?.textContent.trim() ?? null,
    course: opt('courseSel'), syl: opt('sylSel'), crew: opt('activeSel'),
    events: ev ? ev.textContent.trim() : null,
    saveStat: st && !st.hidden ? st.textContent.trim() : '',
    dirty: shown(document.getElementById('saveChanges')),
    balls: document.querySelectorAll('#flowSvg .ball').length,
  }
})
export const ballIds = s => s.page.evaluate(() => [...document.querySelectorAll('#flowSvg .ball')].map(b => b.dataset.id))
/* the phone's two halves */
export async function half(s, which) {
  if (s.desk) return
  const b = s.page.locator(`#viewtabs button[data-view="${which}"]`).filter({ visible: true })
  if (await b.count()) {
    try { await b.first().tap({ timeout: 8000 }) } catch (e) {
      const w = await b.first().evaluate(el => { const r = el.getBoundingClientRect(), t = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return { tab: el.className, box: [r.left, r.top, r.width, r.height].map(Math.round), top: t ? `${t.tagName}#${t.id}.${t.className?.baseVal ?? t.className}` : null, opens: [...document.querySelectorAll('.lullback, .overlay, #lullCal, #lullCopy, #failLog, #pop, .dcal-layer')].map(x => x.id || x.className) } }).catch(() => null)
      note(`[${s.sz}] the ${which} tab did not take the tap: ${JSON.stringify(w)}`); await pic(s, `stuck-${which}`); throw e
    }
    await s.page.waitForTimeout(350)
  }
}
/* the Info side as drawn, for the student on screen */
export async function info(s) {
  await half(s, 'info')
  const v = await s.page.evaluate(() => {
    const t = e => e ? e.textContent.replace(/\s+/g, ' ').trim() : null
    const nums = [...document.querySelectorAll('#side .c-overall .num')].map(n => `${t(n.querySelector('.l'))}=${t(n.querySelector('.v'))}`)
    return {
      who: t(document.querySelector('#side .c-overall h3 .who')),
      overall: nums.join(' '),
      students: [...document.querySelectorAll('#side .c-students .chips .chip')].map(c => t(c).replace(/^\d+\s*/, '')),
      fails: [...document.querySelectorAll('#failChips .failchip')].map(c => `${t(c)}@${c.dataset.date || ''}`),
      failTotal: t(document.getElementById('failTotal')),
      lulls: [...document.querySelectorAll('#lullChips .lullchip')].map(t),
      pace: document.getElementById('epwIn')?.value ?? null,
    }
  })
  await half(s, 'flow')
  return v
}
/* the Course / Syllabus pencil menus */
export async function menuItem(s, menu, item) {
  await hit(s, `#${menu}MenuBtn`, 200)
  return hit(s, `#${item}`, 300)
}
export async function answer(s, sel = '#dlgOk', ms = 400) {
  await s.page.waitForSelector('#dlgModal', { timeout: 4000 })
  return hit(s, sel, ms)
}
export async function addCourse(s, name) {
  const before = (await T(s)).course?.list || []
  await menuItem(s, 'course', 'addCourse')
  await s.page.waitForSelector('#dlgInput', { timeout: 4000 })
  await s.page.locator('#dlgInput').fill(name)
  await hit(s, '#dlgOk', 900)
  const after = (await T(s)).course
  return !before.includes(name) && after.now === name
}
export async function pickCourse(s, name) {
  if ((await T(s)).course?.now === name) return true  // a person cannot re-pick the shown option: no change event
  await s.page.locator('#courseSel').selectOption({ label: name })
  await s.page.waitForTimeout(700)
  return (await T(s)).course.now === name
}
export async function pickSyl(s, label) {
  { const t = (await T(s)).syl; const m = t?.list.find(x => x === label) || t?.list.find(x => x.startsWith(label)); if (m) label = m; if (t?.now === label) return }
  await s.page.locator('#sylSel').selectOption({ label })
  await s.page.waitForTimeout(700)
}
export async function pickCrew(s, name) {
  if ((await T(s)).crew?.now === name) return true
  await s.page.locator('#activeSel').selectOption({ label: name })
  await s.page.waitForTimeout(500)
  return (await T(s)).crew.now === name
}
/* + Add on the Students card: a typed callsign, or a person picked from the roster by their pid */
export async function addStudent(s, name, pid) {
  await half(s, 'info')
  await hit(s, '#addStu', 300)
  await s.page.waitForSelector('#dlgModal', { timeout: 4000 })
  if (pid) await hit(s, `#dlgList .dlg-item[data-key="${pid}"]`, 700)
  else { await s.page.locator('#dlgInput').fill(name); await hit(s, '#dlgOk', 700) }
  await half(s, 'flow')
  return (await T(s)).crew?.now === name.toUpperCase()
}
/* a ball pressed and a grade given; the pop-up left closed. g: dco dpco marg na 0 */
export async function openBall(s, id) {
  await half(s, 'flow')
  const b = s.page.locator(`#flowSvg .ball[data-id="${id}"]`).first()
  await b.scrollIntoViewIfNeeded().catch(() => {})
  await s.page.waitForTimeout(120)
  const r = await b.boundingBox()
  if (!r) { note(`[${s.sz}] no ball ${id}`); return false }
  const x = r.x + r.width / 2, y = r.y + r.height / 2
  if (s.desk) await s.page.mouse.click(x, y); else await s.page.touchscreen.tap(x, y)
  try { await s.page.waitForFunction(() => { const p = document.getElementById('pop'); return p && p.style.visibility !== 'hidden' && p.getBoundingClientRect().width > 0 }, null, { timeout: 2500 }) } catch { note(`[${s.sz}] pop-up did not open on ${id}`); return false }
  await s.page.waitForTimeout(120)
  return true
}
export async function grade(s, id, g = 'dco') {
  if (!(await openBall(s, id))) return false
  await hit(s, `#pop .opts button[data-g="${g}"]`, 320)
  if (await s.page.locator('#dlgModal').count()) { note(`[${s.sz}] a question after grading: ${(await ask(s)).msg}`); await hit(s, '#dlgOk', 300) }
  return true
}
export async function failOnce(s, id) {
  if (!(await openBall(s, id))) return false
  await hit(s, '#popFailPlus', 250)
  await hit(s, s.page.locator('#pop .opts button', { hasText: /^Close$/ }), 250)
  return true
}
export async function ballInfo(s, id) {
  if (!(await openBall(s, id))) return null
  const v = await s.page.evaluate(() => ({
    title: document.getElementById('popTitle')?.textContent.replace(/\s+/g, ' ').trim(),
    fails: document.getElementById('failCount')?.textContent.trim(),
    done: !!document.querySelector('#popDoneRow .mini')?.textContent.startsWith('Done on') && !document.querySelector('#popDoneRow .mini')?.textContent.includes('when marked'),
    date: document.querySelector('#popDoneDate')?.getAttribute('data-value') || document.querySelector('#popDoneDate')?.textContent?.trim() || null,
    failDates: [...document.querySelectorAll('#popFailDates .fdate')].map(f => f.textContent.trim()),
  }))
  await hit(s, s.page.locator('#pop .opts button', { hasText: /^Close$/ }), 220)
  return v
}
/* one squadron's chosen course read whole: bar + side */
export async function readBack(s, course, crew) {
  await pickCourse(s, course).catch(() => {})
  if (crew) await pickCrew(s, crew).catch(() => {})
  const t = await T(s); const i = await info(s)
  return { sq: t.sq, course: t.course?.now, courses: t.course?.list, crew: t.crew?.now, crews: t.crew?.list, overall: i.overall, fails: i.fails, who: i.who }
}
/* a pick, with whatever answer the question needs */
export async function pick(s, num, ans) {
  await pickSq(s, num)
  await s.page.waitForTimeout(250)
  const q = await ask(s)
  if (q.msg && ans) { await answer(s, ans, 900) }
  if (!s.desk) await shut(s)
  await s.page.waitForTimeout(700)
  return q
}
export const savedPick = file => JSON.parse(readFileSync(file, 'utf8'))

/* the app's date box: pressed, its month turned by the arrows, the day pressed */
export async function pickDate(s, box, iso) {
  await hit(s, box, 300)
  const ym = iso.slice(0, 7)
  for (let i = 0; i < 24; i++) {
    const at = await s.page.locator('[data-testid="dcal"]').first().getAttribute('data-month').catch(() => null)
    if (!at) { note(`[${s.sz}] no calendar from ${box}`); return false }
    if (at === ym) break
    await hit(s, `[data-testid="dcal-${at > ym ? 'prev' : 'next'}"]`, 160)
  }
  await hit(s, `[data-testid="dcal-day-${iso}"]`, 350)
  return true
}
export const undoBtn = s => s.page.evaluate(() => { const u = document.getElementById('trUndoBtn'), r = document.getElementById('trRedoBtn'); return { undo: u ? { on: !u.disabled, t: u.title } : null, redo: r ? { on: !r.disabled, t: r.title } : null } })
export const pressUndo = s => hit(s, '#trUndoBtn', 450)
export const pressRedo = s => hit(s, '#trRedoBtn', 450)
export async function failLog(s) {
  await half(s, 'info'); await hit(s, '#failTitle', 300)
  const v = await s.page.evaluate(() => ({ total: document.getElementById('failLogTotal')?.textContent.trim(), rows: [...document.querySelectorAll('#failLog .frow')].map(r => `${r.dataset.ev}#${r.dataset.fi}:${r.querySelector('.datebox')?.getAttribute('data-value') || r.querySelector('.datebox-txt')?.textContent.trim()}`) }))
  await hit(s, '#failLogClose', 250); await half(s, 'flow')
  return v
}

/* the chart's layout editor */
export async function arrange(s, on) {
  const isOn = await s.page.evaluate(() => document.getElementById('arrTools')?.classList.contains('on'))
  if (!!isOn === !!on) return
  await hit(s, '#sylMenuBtn', 150); await hit(s, '#arrangeBtn', 350)
}
export async function tool(s, words) {
  const b = s.page.locator('#arrTools button', { hasText: words }).first()
  if (!(await b.isVisible())) await s.page.locator('#page-tracker button', { hasText: 'Tools ▾' }).first().click()
  await b.click(); await s.page.waitForTimeout(200)
}
/* Delete tool, then a press on the event; answers the app's question if it asks. Leaves the editor. */
export async function delEvent(s, id) {
  await arrange(s, true)
  await tool(s, 'Delete')
  const b = s.page.locator(`#flowSvg .ball[data-id="${id}"]`).first()
  await b.scrollIntoViewIfNeeded().catch(() => {}); await s.page.waitForTimeout(150)
  /* the editor's tool strip can stand over a ball near the chart's top: bring the ball to the board's middle (a view scroll only) */
  await s.page.evaluate(id => {
    const bd = document.getElementById('board'), g = [...document.querySelectorAll('#flowSvg .ball')].find(n => n.dataset.id === id)
    if (!bd || !g) return
    const a = bd.getBoundingClientRect(), r = g.getBoundingClientRect()
    bd.scrollTop += (r.top + r.height / 2) - (a.top + a.height / 2)
    bd.scrollLeft += (r.left + r.width / 2) - (a.left + a.width / 2)
  }, id)
  await s.page.waitForTimeout(250)
  const r = await b.boundingBox(); if (!r) { note(`no ball ${id}`); return null }
  const x = r.x + r.width / 2, y = r.y + r.height / 2
  const on = await s.page.evaluate(([x, y, id]) => document.elementFromPoint(x, y)?.closest('.ball')?.dataset.id === id, [x, y, id])
  if (!on) {
    const w = await s.page.evaluate(([x, y]) => { const e = document.elementFromPoint(x, y); const b = document.getElementById('board').getBoundingClientRect(); return { at: `${e?.tagName}#${e?.id}.${e?.className?.baseVal ?? e?.className}`, up: e?.parentElement?.id, board: [Math.round(b.top), Math.round(b.bottom)], scroll: document.getElementById('board').scrollTop } }, [x, y])
    note(`[${s.sz}] delEvent: over ${id} at ${Math.round(x)},${Math.round(y)}: ${JSON.stringify(w)}`); await pic(s, `covered-${id}`)
  }
  if (s.desk) await s.page.mouse.click(x, y); else await s.page.touchscreen.tap(x, y)
  await s.page.waitForTimeout(350)
  let said = null
  if (await s.page.locator('#dlgModal').count()) { said = (await ask(s)).msg; await hit(s, '#dlgOk', 350) }
  await tool(s, 'Move').catch(() => {})
  await arrange(s, false)
  return { said, gone: !(await ballIds(s)).includes(id) }
}
/* the fastest ordinary pick: the top bar's button and row with no waiting between the presses */
export async function fastPick(s, num) {
  const btn = s.page.locator('#sqnMenuBtn').filter({ visible: true }).first()
  if (s.desk) await btn.click({ noWaitAfter: true }); else await btn.tap({ noWaitAfter: true })
  const row = s.page.locator('#sqnMenu .sqm-row', { has: s.page.locator('.sqm-num', { hasText: new RegExp(`^${num}$`) }) }).first()
  if (s.desk) await row.click({ noWaitAfter: true }); else await row.tap({ noWaitAfter: true })
}
/* a press and the pick in the same instant, inside one browser task and the next frame: the closest a person's two presses can come */
export const samePress = (s, sel, num) => s.page.evaluate(async ([sel, num]) => {
  document.querySelector(sel).click()
  document.getElementById('sqnMenuBtn').click()
  await new Promise(r => requestAnimationFrame(r))
  const row = [...document.querySelectorAll('#sqnMenu .sqm-row')].find(r => r.querySelector('.sqm-num')?.textContent.trim() === num)
  if (!row) return 'no row'
  row.click(); return 'pressed'
}, [sel, num])
