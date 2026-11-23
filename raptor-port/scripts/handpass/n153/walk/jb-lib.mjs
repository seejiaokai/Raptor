// jb-lib v1 - walker B's helpers on top of jlib: each squadron's Tracker given its own marks and its own course by presses,
// and read back through the screen. Nothing here writes storage; the one allowed exception (a dated move) lives in jb-mid*.
import { go, press, state, pickSq, shut, note, ask, vclick, check, pic, step, admCat } from './jlib.mjs'
export const wait = (s, ms) => s.page.waitForTimeout(ms)

/* what the Tracker draws: the squadron in the bar, the course list, the crew, the done count, unsaved mark, band words */
export const fp = s => s.page.evaluate(() => {
  const shown = e => { if (!e) return false; const b = e.getBoundingClientRect(); const c = getComputedStyle(e); return b.width > 1 && b.height > 1 && c.visibility !== 'hidden' && c.display !== 'none' }
  const t = e => e ? e.textContent.replace(/\s+/g, ' ').trim() : null
  const bar = [...document.querySelectorAll('.topbar .mark')].find(shown)
  const dm = document.querySelector('.drawer-sqn .mark')
  const sel = id => { const e = document.getElementById(id); return e && e.options ? { cur: e.selectedOptions[0]?.text.trim() ?? null, all: [...e.options].map(o => o.text.trim()) } : null }
  const side = document.querySelector('#side')
  const m = side ? side.innerText.replace(/\s+/g, ' ').match(/([\d.]+)%\s*COMPLETE\s*(\d+)\s*DONE\s*(\d+)\s*REMAINING/i) : null
  const pg = document.querySelector('#page-tracker')
  const on = !!pg && pg.classList.contains('on')
  const bands = pg ? [...pg.querySelectorAll('[role=status], [role=alert], .trkband, .band, .saveband')].filter(shown).map(t).filter(Boolean).slice(0, 4) : []
  return {
    page: document.querySelector('.page.on')?.id || null,
    sq: (t(bar) || t(dm) || '').replace(/TALON.*/, ''),
    course: sel('courseSel')?.cur ?? null, courses: sel('courseSel')?.all ?? null,
    stu: sel('activeSel')?.cur ?? null, done: m ? +m[2] : null,
    dirty: shown(document.querySelector('#saveChanges')), stat: t(document.querySelector('#saveStat')),
    bands, on,
    undo: (() => { const b = [...document.querySelectorAll('#trUndoBtn,#undoBtn')].find(shown); return b ? { off: b.disabled, tip: b.getAttribute('title') || b.getAttribute('aria-label') } : null })(),
    redo: (() => { const b = [...document.querySelectorAll('#trRedoBtn,#redoBtn')].find(shown); return b ? { off: b.disabled, tip: b.getAttribute('title') || b.getAttribute('aria-label') } : null })(),
  }
})
export const short = f => `${f.sq}|${f.course}|${f.stu}|done ${f.done}|${(f.courses || []).join('/')}${f.dirty ? '|DIRTY' : ''}`

/* a mark on the chart: the event's ball pressed, then a grade in its window */
export async function mark(s, ev, g = 'dco') {
  const { page } = s
  const ball = page.locator(`#page-tracker g.ball[data-id="${ev}"]`).first()
  if (!(await ball.count())) { note(`no ball ${ev}`); return false }
  await ball.scrollIntoViewIfNeeded().catch(() => {})
  await wait(s, 150)
  const b = await ball.boundingBox()
  if (!b) { note(`ball ${ev} has no box`); return false }
  const x = b.x + b.width / 2, y = b.y + b.height / 2
  if (s.desk) await page.mouse.click(x, y); else await page.touchscreen.tap(x, y)
  try { await page.waitForSelector('#pop .opts button', { state: 'visible', timeout: 2500 }) } catch { note(`no window on ${ev}`); return false }
  const o = page.locator(`#pop .opts button[data-g="${g}"]`).first()
  if (s.desk) await o.click(); else await o.tap()
  await wait(s, 500)
  if (await page.locator('#pop').filter({ visible: true }).count()) {
    const c = page.locator('#pop .opts button', { hasText: /^Close$/ }).first()
    if (await c.count()) { if (s.desk) await c.click(); else await c.tap(); await wait(s, 300) }
  }
  return true
}
/* a course of its own, by the course pencil; answers a Discard question only if `answer` names one */
export async function addCourse(s, name, answer) {
  const { page } = s
  await vclick(s, '#courseMenuBtn'); await wait(s, 200)
  await vclick(s, '#addCourse'); await wait(s, 350)
  const a = await ask(s)
  if (a.msg && !(await page.locator('#dlgInput').filter({ visible: true }).count())) {
    note('add course asked:', a.msg)
    if (!answer) return { asked: a }
    await press(s, answer); await wait(s, 400)
    if (answer === '#dlgCancel') return { asked: a, stopped: true }
  }
  await page.waitForSelector('#dlgInput:visible', { timeout: 3000 })
  await page.locator('#dlgInput:visible').first().fill(name)
  await vclick(s, '#dlgOk'); await wait(s, 900)
  return { ok: true }
}
export async function pickCourse(s, text) {
  const { page } = s
  const v = await page.evaluate(t => { const e = document.getElementById('courseSel'); const o = [...e.options].find(x => x.text.trim() === t); return o ? o.value : null }, text)
  if (!v) { note('no course', text); return false }
  await page.selectOption('#courseSel', v); await wait(s, 700); return true
}
/* every squadron gets: a course named after it (kept in the list) and `n` marks on the first student of its first course */
export async function dress(s, unit, evs) {
  await go(s, 'tracker'); await wait(s, 1800)
  const first = (await fp(s)).course
  await addCourse(s, 'JB' + unit)
  await pickCourse(s, first); await wait(s, 500)
  for (const e of evs) await mark(s, e, 'dco')
  await wait(s, 700)
  const f = await fp(s)
  note(`dressed ${unit}: ${short(f)}`)
  return f
}
export async function makeSquadron(s, num) {
  const { page } = s
  await admCat(s, 'Squadrons'); await wait(s, 300)
  await page.locator('#sqNew').filter({ visible: true }).first().click(); await wait(s, 300)
  await page.fill('#sqNewNum', String(num))
  const opts = await page.evaluate(() => [...document.querySelectorAll('#sqNewAdmin option')].map(o => [o.value, o.textContent.trim()]))
  const h = opts.find(o => /Hunter/.test(o[1])) || opts.find(o => o[0])
  if (h) await page.selectOption('#sqNewAdmin', h[0])
  await page.locator('#sqNewSave').click(); await wait(s, 700)
  const has = await page.evaluate(n => [...document.querySelectorAll('#sqList [data-unit]')].some(r => r.textContent.includes(n)), String(num))
  note(`made squadron ${num}: ${has}`)
  return has
}
/* the seeded course, where each squadron's marks were put: chosen by its dropdown when the chart is clean */
export async function onSeed(s) {
  await go(s, 'tracker'); await wait(s, 900)
  const f = await fp(s)
  if (f.course !== '26ABSG' && (f.courses || []).includes('26ABSG') && !f.dirty) await pickCourse(s, '26ABSG')
  return fp(s)
}
/* a reload as a person makes it; lands wherever the app puts him, signed in or on the card */
export async function reload(s, user = 'ad', pass = 'a') {
  const { page } = s
  await page.reload(); await page.waitForSelector('.page.on, #luser', { state: 'attached', timeout: 30000 }); await wait(s, 1600)
  const card = await page.locator('#luser').filter({ visible: true }).count()
  if (card) {
    await page.fill('#luser', user); await page.fill('#lpass', pass); await page.click('#loginForm button[type=submit]')
    await page.waitForSelector('.page.on', { state: 'attached', timeout: 30000 }); await wait(s, 1500)
  }
  await page.addStyleTag({ content: '*{transition:none !important;animation:none !important}' }).catch(() => {})
  return page.evaluate(c => ({ card: !!c, page: document.querySelector('.page.on')?.id || null }), card)
}
/* the member-view switch: the chip at the top right on a desktop, the menu's line on a phone */
export async function roleSwitch(s, name) {
  if (s.desk) return press(s, '#roleBadge', name)
  await press(s, '#burger'); await wait(s, 250)
  const ok = await press(s, '#drawerRole', name)
  await shut(s); await wait(s, 300)
  return ok
}
/* the words a person sees at the top of the page: the band or cover, whichever is drawn */
export const head = (s, n = 260) => s.page.evaluate(n => { const p = document.querySelector('.page.on'); return p ? p.innerText.replace(/\s+/g, ' ').trim().slice(0, n) : null }, n)
/* every drawn line that talks about the member view, a pick or holding */
export const holdWords = s => s.page.evaluate(() => {
  const out = new Set()
  for (const e of document.querySelectorAll('body *')) {
    if (e.children.length > 2) continue
    const b = e.getBoundingClientRect(); if (b.width < 2 || b.height < 2) continue
    const c = getComputedStyle(e); if (c.visibility === 'hidden' || c.display === 'none') continue
    const t = (e.textContent || '').replace(/\s+/g, ' ').trim()
    if (t.length > 8 && t.length < 160 && /member view|You picked|close this|Switch back|Leave the member|admin view/i.test(t)) out.add(t)
  }
  return [...out].slice(0, 8)
})
export { go, press, state, pickSq, shut, note, ask, vclick, check, pic, step }
