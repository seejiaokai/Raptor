// [ASK-AT-THE-CONTROL] (D1626) — the Tracker's questions (roll-call #58–#71), today and as a card hanging from the
// control pressed, at a desktop's and his iPhone's size. Pictures only: nothing in the app changes.
//   WALK_DIR=<frozen dist> ISR_OUT=docs/img/handpass/2026-11-04-ask-at-the-control/tracker LOOK_URL=http://localhost:4397/ \
//     node scripts/handpass/ask-at-tracker.mjs [n …]
// Every Tracker question is drawn today by ONE centred dialog (#dlgModal over its shade #dlgOverlay, Modals.jsx). The card
// is that same box, moved whole (rehomeInPage) to hang from the control pressed — its words and buttons untouched.
// Where the control pressed is a menu item, the menu has closed by the time the question is up (Header.jsx Menu closes
// on the item's press), so the card hangs from the menu's own button — the ✎ pencil or File — where the item sat just
// under it. On the phone Logout sits in the ☰ drawer, which also closes on the press: the card hangs from ☰.
import { writeFileSync } from 'node:fs'
import { join } from 'node:path'
import * as L from './isr-A-lib.mjs'
import { CARD_CSS, rehomeInPage } from './ask-at-lib.mjs'
const sleep = ms => new Promise(r => setTimeout(r, ms))
if (process.argv.length <= 2) L.clean(); else (await import("node:fs")).mkdirSync(L.OUT, { recursive: true })

/* never TYPE on the phone: an emulated phone zooms to a focused box (the method's trap) — the box's own input event */
const setVal = (page, sel, v) => page.evaluate(([sel, v]) => { const r = document.querySelector(sel); Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(r, v); r.dispatchEvent(new Event('input', { bubbles: true })) }, [sel, v])
const P = (page, tap, sel) => L.press(page, tap, sel)
const dlgUp = page => page.waitForSelector('#dlgModal', { state: 'visible', timeout: 8000 })
const dlgText = page => page.evaluate(() => (document.querySelector('#dlgMsg') || {}).textContent || '')
async function answer(page, tap, id = '#dlgOk') { await P(page, tap, id); await sleep(500) }
async function arrange(page, tap) { await P(page, tap, '#sylMenuBtn'); await P(page, tap, '#arrangeBtn'); await sleep(300) }
async function infoTab(page, tap) { if (tap) { await P(page, tap, 'button[data-view="info"]'); await sleep(300) } }
async function flowTab(page, tap) { if (tap) { await P(page, tap, 'button[data-view="flow"]'); await sleep(300) } }
/* an unsaved flow edit: a new event on the chart (a moved ball only saves its position — the smoke suite's note) */
async function dirty(page, tap) {
  await arrange(page, tap)
  await P(page, tap, '#arrTools button:has-text("+ Acad")'); await page.waitForSelector('#dlgInput')
  await setVal(page, '#dlgInput', 'NEW ACAD'); await answer(page, tap)
  await arrange(page, tap)
  if (!await page.locator('#saveChanges').count()) throw new Error('premise: the chart has no unsaved flow edit')
}
async function twoCourses(page, tap) {
  const n = await page.locator('#courseSel option').count()
  if (n >= 2) return
  await P(page, tap, '#courseMenuBtn'); await P(page, tap, '#addCourse'); await page.waitForSelector('#dlgInput')
  await setVal(page, '#dlgInput', 'OTHER'); await answer(page, tap)
  if (await page.locator('#courseSel option').count() < 2) throw new Error('premise: a second course was not added')
}
async function feed(page, withStudents) {
  await page.evaluate(ws => {
    const SID = 'scaskimp1'
    const charts = { order: [SID], syllabi: { [SID]: [{ id: 'SI-01', type: 'acad', seq: 0, prereqs: [], phase: 'P' }, { id: 'SI-02', type: 'flight', seq: 1, prereqs: ['SI-01'], phase: 'P' }] }, layouts: {}, eventInfo: {}, sylcat: [{ id: SID, name: 'HANDOVER CHART' }] }
    const students = ws ? { courses: ['HANDOVER COURSE'], sylcat: [{ id: SID, name: 'HANDOVER CHART' }], byCourse: { 'HANDOVER COURSE': { plan: { sylId: SID }, lulls: {}, pace: {}, bySyllabus: { [SID]: { roster: ['STUDENT ONE'], marks: {}, dates: {} } } } } } : null
    const text = JSON.stringify(window.__fileFormatForTests.buildFile({ charts, students, savedAt: new Date().toISOString() }))
    window.__pickOpenForTests = async () => ({ name: 'handover.json', text })
  }, withStudents)
}

/* Each question: how it is reached through the app's own controls, the control the card hangs from (per size), the
   premise its words must show, and what the control pressed was when it is not the one ringed. */
const Q = [
  { n: '58', what: 'Log out with unsaved chart edits', expect: /Save them before logging out/,
    ctl: { desktop: '#logout', phone: '#burger' }, pressed: { desktop: 'Logout (top bar)', phone: 'Logout in the ☰ menu (the menu closes on the press — the card hangs from ☰)' },
    stage: async (page, tap) => { await dirty(page, tap); if (tap) { await P(page, tap, '#burger'); await P(page, tap, '#drawerLogout') } else await P(page, tap, '#logout') } },
  { n: '59', what: 'Remove a prerequisite link (Edit chart layout, 🗑 Delete, tap an arrow)', expect: /Remove link/,
    ctl: { desktop: '[data-aq="ctl"]', phone: '[data-aq="ctl"]' }, pressed: { desktop: 'the arrow tapped with the 🗑 Delete tool', phone: 'the arrow tapped with the 🗑 Delete tool' },
    stage: async (page, tap) => {
      await arrange(page, tap); await P(page, tap, '#arrTools button:has-text("🗑 Delete")')
      const ok = await page.evaluate(() => {
        const box = (document.querySelector('#flowWrap') || document.querySelector('#flowSvg').parentElement).getBoundingClientRect()
        const p = [...document.querySelectorAll('#flowSvg .edgehit')].find(x => { const r = x.getBoundingClientRect(); const cx = r.left + r.width / 2, cy = r.top + r.height / 2; return r.width > 20 && r.height > 20 && cx > box.left + 40 && cx < Math.min(box.right, innerWidth) - 40 && cy > box.top + 60 && cy < Math.min(box.bottom, innerHeight) - 80 })
        if (!p) return false
        p.setAttribute('data-aq', 'ctl'); p.style.stroke = '#ff3b6b'; p.style.strokeOpacity = '1'; p.style.strokeWidth = '4'
        p.dispatchEvent(new MouseEvent('click', { bubbles: true })); return true
      })
      if (!ok) throw new Error('premise: no arrow in view to tap')
    } },
  { n: '60', what: 'Remove a lull period (× on its chip, Info)', expect: /lull period/,
    ctl: { desktop: '[data-aq="ctl"]', phone: '[data-aq="ctl"]' }, pressed: { desktop: 'the × on the lull chip', phone: 'the × on the lull chip' },
    stage: async (page, tap) => {
      await infoTab(page, tap)
      await P(page, tap, '#setLullBtn'); await page.waitForSelector('#lullCal.on')
      await P(page, tap, '#lullCal .day:not(.out)')
      const days = page.locator('#lullCal .day:not(.out)'); const k = await days.count(); await (tap ? days.nth(k - 1).tap() : days.nth(k - 1).click()); await sleep(500)
      await page.evaluate(() => { const x = document.querySelector('#lullChips .chip .x'); x.setAttribute('data-aq', 'ctl'); x.scrollIntoView({ block: 'center' }) }); await sleep(200)
      await P(page, tap, '[data-aq="ctl"]')
    } },
  { n: '61', what: 'Remove a student from the syllabus (✕ on his chip, Info)', expect: /Remove .* from/,
    ctl: { desktop: '[data-aq="ctl"]', phone: '[data-aq="ctl"]' }, pressed: { desktop: 'the ✕ on a student chip', phone: 'the ✕ on a student chip' },
    stage: async (page, tap) => {
      await infoTab(page, tap)
      if (!await page.locator('.c-students .chip .x').count()) { await P(page, tap, '#addStu'); await page.waitForSelector('#dlgInput'); await setVal(page, '#dlgInput', 'STUDENT A'); await answer(page, tap) }
      await page.evaluate(() => { const x = document.querySelector('.c-students .chip .x'); x.setAttribute('data-aq', 'ctl'); x.scrollIntoView({ block: 'center' }) }); await sleep(200)
      await P(page, tap, '[data-aq="ctl"]')
    } },
  { n: '62a', what: 'Unsaved flow edits — switching the Syllabus dropdown', expect: /Discard them and switch to “/,
    ctl: { desktop: '#sylSel', phone: '#sylSel' }, pressed: { desktop: 'the Syllabus dropdown', phone: 'the Syllabus dropdown' },
    stage: async (page, tap) => { await dirty(page, tap); const v = await page.evaluate(() => { const s = document.querySelector('#sylSel'); return [...s.options].map(o => o.value).find(x => x !== s.value) }); await page.selectOption('#sylSel', v) } },
  { n: '62b', what: 'Unsaved flow edits — switching the Course dropdown', expect: /switch to course/,
    ctl: { desktop: '#courseSel', phone: '#courseSel' }, pressed: { desktop: 'the Course dropdown', phone: 'the Course dropdown' },
    stage: async (page, tap) => { await twoCourses(page, tap); await dirty(page, tap); const v = await page.evaluate(() => { const s = document.querySelector('#courseSel'); return [...s.options].map(o => o.value).find(x => x !== s.value) }); await page.selectOption('#courseSel', v) } },
  { n: '62c', what: 'Unsaved flow edits — ✎ (course) → + Add course (the same words for Rename / Delete course, ✎ (syllabus) → + Add syllabus, and File → Import)', expect: /add a course/,
    ctl: { desktop: '#courseMenuBtn', phone: '#courseMenuBtn' }, pressed: { desktop: '+ Add course in the course ✎ menu (the menu closes on the press)', phone: '+ Add course in the course ✎ menu (the menu closes on the press)' },
    stage: async (page, tap) => { await dirty(page, tap); await P(page, tap, '#courseMenuBtn'); await P(page, tap, '#addCourse') } },
  { n: '63', what: 'Delete course', expect: /Delete course/,
    ctl: { desktop: '#courseMenuBtn', phone: '#courseMenuBtn' }, pressed: { desktop: 'Delete course in the course ✎ menu', phone: 'Delete course in the course ✎ menu' },
    stage: async (page, tap) => { await twoCourses(page, tap); await P(page, tap, '#courseMenuBtn'); await P(page, tap, '#delCourse') } },
  { n: '64', what: 'Duplicate a syllabus with unsaved edits', expect: /Keep the edits on/,
    ctl: { desktop: '#sylMenuBtn', phone: '#sylMenuBtn' }, pressed: { desktop: 'Duplicate syllabus in the syllabus ✎ menu', phone: 'Duplicate syllabus in the syllabus ✎ menu' },
    stage: async (page, tap) => { await dirty(page, tap); await P(page, tap, '#sylMenuBtn'); await P(page, tap, '#dupSyl') } },
  { n: '65', what: 'Delete a built-in syllabus that has saved edits', expect: /built-in syllabus that has saved edits/,
    ctl: { desktop: '#sylMenuBtn', phone: '#sylMenuBtn' }, pressed: { desktop: 'Delete syllabus in the syllabus ✎ menu', phone: 'Delete syllabus in the syllabus ✎ menu' },
    stage: async (page, tap) => { await dirty(page, tap); await P(page, tap, '#saveChanges'); await sleep(600); if (await page.locator('#dlgModal').isVisible()) await answer(page, tap); await P(page, tap, '#sylMenuBtn'); await P(page, tap, '#delSyl') } },
  { n: '66', what: 'Delete syllabus', expect: /Delete syllabus “/,
    ctl: { desktop: '#sylMenuBtn', phone: '#sylMenuBtn' }, pressed: { desktop: 'Delete syllabus in the syllabus ✎ menu', phone: 'Delete syllabus in the syllabus ✎ menu' },
    stage: async (page, tap) => { await P(page, tap, '#sylMenuBtn'); await P(page, tap, '#delSyl') } },
  { n: '67', what: 'Reset layout (Edit chart layout → ↺ Reset layout)', expect: /Reset/,
    ctl: { desktop: '#resetLayout', phone: '#resetLayout' }, pressed: { desktop: '↺ Reset layout', phone: '↺ Reset layout' },
    stage: async (page, tap) => { await arrange(page, tap); await P(page, tap, '#resetLayout') } },
  { n: '68', what: 'Delete an event (the event editor\'s Delete ball; also the Delete key and the 🗑 tool)', expect: /Delete/,
    ctl: { desktop: '#edDelete', phone: '#edDelete' }, pressed: { desktop: 'Delete ball in the event editor', phone: 'Delete ball in the event editor' },
    stage: async (page, tap) => {
      await arrange(page, tap)
      await page.evaluate(() => { const b = [...document.querySelectorAll('#flowSvg .ball')].find(x => { const r = x.getBoundingClientRect(); return r.width > 0 && r.top > 120 && r.bottom < innerHeight - 60 && r.left > 0 && r.right < innerWidth }); b.dispatchEvent(new MouseEvent('dblclick', { bubbles: true })) })
      await page.waitForSelector('#editModal'); await P(page, tap, '#edDelete')
    } },
  { n: '69', what: 'Export with unsaved flow edits', expect: /exported file includes them/,
    ctl: { desktop: '#fileMenuBtn', phone: '#fileMenuBtn' }, pressed: { desktop: 'Export… in the File menu', phone: 'Export… in the File menu' },
    stage: async (page, tap) => { await dirty(page, tap); await P(page, tap, '#fileMenuBtn'); await P(page, tap, '#exportBtn') } },
  { n: '70', what: 'Import — a chart that already exists', expect: /already exists/,
    ctl: { desktop: '#fileMenuBtn', phone: '#fileMenuBtn' }, pressed: { desktop: 'Import… in the File menu, then the file picked', phone: 'Import… in the File menu, then the file picked' },
    stage: async (page, tap) => {
      await feed(page, false); await P(page, tap, '#fileMenuBtn'); await P(page, tap, '#importFileBtn'); await dlgUp(page); await answer(page, tap)
      await feed(page, true); await P(page, tap, '#fileMenuBtn'); await P(page, tap, '#importFileBtn')
    } },
  { n: '71', what: 'Import — bring the students and marks in too?', expect: /also contains students and marks/,
    ctl: { desktop: '#fileMenuBtn', phone: '#fileMenuBtn' }, pressed: { desktop: 'Import… in the File menu (after "Replace it")', phone: 'Import… in the File menu (after "Replace it")' },
    stage: async (page, tap) => {
      await feed(page, false); await P(page, tap, '#fileMenuBtn'); await P(page, tap, '#importFileBtn'); await dlgUp(page); await answer(page, tap)
      await feed(page, true); await P(page, tap, '#fileMenuBtn'); await P(page, tap, '#importFileBtn'); await dlgUp(page); await sleep(300); await answer(page, tap)
    } },
]

const pick = process.argv.slice(2)
const manifest = []
for (const q of Q.filter(q => !pick.length || pick.includes(q.n))) {
  const entry = { n: q.n, area: 'Tracker', screen: 'the Tracker tab', control: q.pressed.desktop, question: null, answers: null,
    today: 'the Tracker\'s one dialog, centred on the screen over a dark shade (#dlgModal)', proposal: 'sheet', pics: { today: {}, card: {} }, measures: {}, newWords: [], notes: [] }
  if (q.pressed.phone !== q.pressed.desktop) entry.notes.push('phone: ' + q.pressed.phone)
  for (const size of ['desktop', 'phone']) {
    const { page, tap } = await L.session(size, 'ad')
    try {
      await page.addStyleTag({ content: CARD_CSS })
      /* the Tracker's box clips what is outside its edge (overflow:auto, tracker.css): the pointer is let out, unless the box is
         too tall for its side and scrolls (rehomeInPage sets that inline, which wins); the box keeps its own frame (the
         Tracker's --panel2 and --line, near the card's), so the pointer takes the box's own edge colour */
      await page.addStyleTag({ content: '#dlgModal.aq-frame{overflow:visible !important} #dlgModal.aq-frame::before{border-color:var(--line) !important}' })
      await page.evaluate(() => window.go('tracker')); await page.waitForFunction(() => window.CURPAGE === 'tracker')
      await page.waitForSelector('#flowSvg .ball', { timeout: 20000 }); await sleep(400)
      await q.stage(page, tap)
      await dlgUp(page); await sleep(350)
      const t = await dlgText(page)
      L.check(q.n, `${size}: the question is up and reads as expected`, q.expect.test(t), t.slice(0, 120))
      if (!q.expect.test(t)) { L.notWalked(q.n, `${size}: premise failed`); continue }
      entry.question = t.replace(/\s+/g, ' ').trim()
      entry.answers = await page.evaluate(() => [...document.querySelectorAll('#dlgModal button')].filter(b => b.getBoundingClientRect().width > 0).map(b => b.textContent.trim()))
      if (!tap) await page.mouse.move(2, 898)
      await page.evaluate(() => document.activeElement && document.activeElement.blur && document.activeElement.blur())
      const ctl = q.ctl[size]
      /* today's box and the card, both measured first, so the desktop's two pictures share one clip */
      const today = await page.evaluate(() => { const r = document.querySelector('#dlgModal').getBoundingClientRect(); return { l: r.left, t: r.top, r: r.right, b: r.bottom } })
      await page.evaluate(() => { const b = document.querySelector('#dlgModal'), o = document.querySelector('#dlgOverlay'); window.__aqSave = { bs: b.getAttribute('style'), bc: b.className, os: o && o.getAttribute('style') } })
      const m0 = await page.evaluate(rehomeInPage, [ctl, '#dlgModal', '#dlgOverlay', 360])
      const restore = () => page.evaluate(() => { const b = document.querySelector('#dlgModal'), o = document.querySelector('#dlgOverlay'), s = window.__aqSave; b.setAttribute('style', s.bs); b.className = s.bc; if (o) o.setAttribute('style', s.os) })
      await restore()
      const c = await page.evaluate(sel => { const e = [...document.querySelectorAll(sel)].find(x => x.getBoundingClientRect().width > 0); const r = e.getBoundingClientRect(); return { l: r.left, t: r.top, r: r.right, b: r.bottom } }, ctl)
      const vw = size === 'desktop' ? 1440 : 402, vh = size === 'desktop' ? 900 : 874
      const U = [today, c, { l: m0.card.l, t: m0.card.t, r: m0.card.l + m0.card.w, b: m0.card.t + m0.card.h }]
      const l = Math.max(0, Math.min(...U.map(x => x.l)) - 40), tp0 = Math.max(0, Math.min(...U.map(x => x.t)) - 40), tp = tp0 < 120 ? 0 : tp0 /* a crop that would start inside the top bars starts at the top, so the page names are whole */
      const clip = { x: l, y: tp, width: Math.min(vw, Math.max(...U.map(x => x.r)) + 40) - l, height: Math.min(vh, Math.max(...U.map(x => x.b)) + 40) - tp }
      await sleep(150)
      const shoot = async which => { const f = `${q.n}-${size}-${which}.png`; await page.screenshot({ path: join(L.OUT, f), ...(size === 'desktop' ? { clip } : {}) }); entry.pics[which][size] = 'A/' + f }
      await shoot('today')
      const m = await page.evaluate(rehomeInPage, [ctl, '#dlgModal', '#dlgOverlay', 360]); await sleep(150)
      /* the card must not cover the control it hangs from, and must sit on the screen */
      const cover = await page.evaluate(sel => { const e = [...document.querySelectorAll(sel)].find(x => x.getBoundingClientRect().width > 0); const r = e.getBoundingClientRect(); const top = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return !!(top && top.closest('#dlgModal')) }, ctl)
      L.check(q.n, `${size}: the card is on the screen and leaves the control pressed uncovered`, m.onScreen && !cover, m)
      await shoot('card')
      entry.measures[size] = m
    } catch (e) { L.notWalked(q.n, `${size}: ${String(e.message || e).split('\n')[0]}`); entry.notes.push(`${size}: not pictured — ${String(e.message || e).split('\n')[0]}`) }
    await page.context().close()
  }
  manifest.push(entry)
}
writeFileSync(join(L.OUT, '..', pick.length ? `manifest-part-${pick.join('-')}.json` : 'manifest.json'), JSON.stringify(manifest, null, 2))
await L.finish('ask-at-tracker')
