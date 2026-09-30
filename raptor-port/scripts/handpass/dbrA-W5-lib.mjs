/* [DB-READINESS] group A — the group-wide FULL walk, walker W5 (the Tracker), 30 Sep 26: the Tracker helpers the W5 parts
   share. The group's driver (`dbrA-lib.mjs`) judges each step three ways (the rows it wrote are named by its change-log
   batch; a reload gives it all back; the reload writes nothing) — but its `state` reads the scheduler's world, not the
   Tracker's. So a W5 reload also reads the Tracker's own picture before and after: everything Export writes
   (`collectCharts(null, { deleted: true })`, `collectStudents()`), the course list, the chart catalogue, the student list
   on screen and what each dropdown lists and has picked.

   Every gesture goes through the Tracker's own controls (its menus, its question box, the side panel's chips, the top
   bar's ↶ ↷). The only thing replaced is the operating system's file window, the documented way the earlier Tracker walks
   did it (trk-w1-lib.mjs): with the native pickers removed, the app takes its other real path — a download out, a file
   input in — the one an iPhone takes. */
import * as L from './dbrA-lib.mjs'
import { reveal } from './trk-lib.mjs'

export const sleep = ms => new Promise(r => setTimeout(r, ms))
export const ball = (page, id) => page.locator(`#flowSvg .ball[data-id="${id}"]`).first()

/* the Tracker through its tab (the burger drawer on a phone); waits for its boot and load chain — a chart with no event
   draws no ball, so a ball is not the signal */
export async function toTracker(page) {
  const tab = page.locator('#topnav a[data-page="tracker"]:visible')
  if (await tab.count()) await tab.click()
  else {
    await page.click('#burger'); await sleep(250)
    await page.locator('#drawer a[data-page="tracker"]').first().click()
  }
  await page.waitForFunction(() => window.CURPAGE === 'tracker')
  await page.waitForFunction(() => !!window.__coreForTests && !!document.querySelector('#page-tracker #courseSel, #page-tracker [data-testid="trk-nocourse"]'), null, { timeout: 25000 })
  await page.evaluate(() => window.__coreForTests.whenLoaded())
  await sleep(600)
}

/* the app's own question box */
export async function dlgUp(page, timeout = 3000) {
  const t0 = Date.now()
  while (Date.now() - t0 < timeout) {
    if (await page.locator('#dlgModal').isVisible().catch(() => false)) return true
    await sleep(100)
  }
  return false
}
export const dlgText = page => page.locator('#dlgMsg').innerText().then(s => s.trim()).catch(() => '')
/* answer it: type `value` (when given) into its name box, then press OK (or Cancel when ok=false) */
export async function dlg(page, { value = null, ok = true, timeout = 5000 } = {}) {
  await page.waitForSelector('#dlgModal', { state: 'visible', timeout })
  const text = await dlgText(page)
  if (value != null) {
    const own = page.locator('#dlgInput:visible')
    const inp = (await own.count()) ? own.first() : page.locator('#dlgModal input:visible, #dlgModal textarea:visible').first()
    await inp.fill(String(value))
  }
  await page.click(ok ? '#dlgOk' : '#dlgCancel')
  await sleep(350)
  return text
}
/* one of the bar's ✎ menus (course | syl | file), then an item */
export async function menu(page, which, item) {
  await page.click(`#${which}MenuBtn`)
  await page.waitForSelector(`#${item}`, { state: 'visible', timeout: 4000 })
  await page.click(`#${item}`)
  await sleep(300)
}
/* a dropdown the way a person uses it: press it, then choose the option whose text matches */
export async function pickFrom(page, sel, want) {
  await page.click(sel); await sleep(120)
  const v = await page.evaluate(({ sel, exact, src }) => {
    const re = src ? new RegExp(src) : null
    const o = [...document.querySelector(sel).options].find(o => (re ? re.test(o.textContent) : o.textContent.replace(/ ✎$/, '') === exact))
    return o ? o.value : null
  }, { sel, exact: typeof want === 'string' ? want : null, src: want instanceof RegExp ? want.source : null })
  if (v == null) { await page.keyboard.press('Escape'); throw new Error(`no option ${want} in ${sel}`) }
  await page.selectOption(sel, v)
  await page.evaluate(sel => { const el = document.querySelector(sel); if (el && document.activeElement === el) el.blur() }, sel)
  await sleep(900)
  await page.evaluate(() => window.__coreForTests.whenLoaded())
  return v
}
export const opts = (page, sel) => page.evaluate(sel => [...document.querySelectorAll(sel + ' option')].map(o => o.textContent), sel)
export const picked = (page, sel) => page.evaluate(sel => { const e = document.querySelector(sel); return e ? (e.selectedOptions[0] || {}).textContent || null : null }, sel)

/* a ball brought into view the way a person does it (the chart's own scroll), then a real click (or a finger's tap) */
export async function tapBall(page, id, { touch = false } = {}) {
  await reveal(page, id)
  const b = await ball(page, id).boundingBox()
  if (!b) throw new Error('no ball ' + id)
  if (touch) await page.touchscreen.tap(b.x + b.width / 2, b.y + b.height / 2)
  else await page.mouse.click(b.x + b.width / 2, b.y + b.height / 2)
  await sleep(450)
}
/* grade a ball for the student on screen through the pop-up (DCO / DPCO / Marginal / N.A. / Not done) */
export async function grade(page, id, label = 'DCO', { touch = false } = {}) {
  await tapBall(page, id, { touch })
  await page.waitForSelector('#pop', { state: 'visible', timeout: 5000 })
  const btn = page.locator('#pop button').filter({ hasText: new RegExp('^\\s*' + label + '\\s*$') }).first()
  if (touch) { const b = await btn.boundingBox(); await page.touchscreen.tap(b.x + b.width / 2, b.y + b.height / 2) }
  else await btn.click()
  await sleep(500)
}
/* the grade the store holds for a ball and the student on screen (read-only, to CHECK what the screen claims) */
export const gradeOf = (page, id) => page.evaluate(id => window.__undoForTests().grade(id), id)
export const firstBalls = (page, n) => page.evaluate(n => [...document.querySelectorAll('#flowSvg .ball')].map(g => g.dataset.id).slice(0, n), n)

/* the Tracker's ⇅ Reorder window (crew | course | syllabus): move row `from` to `to` with the ▲ / ▼ buttons */
export async function ordMove(page, from, to) {
  let i = from
  while (i !== to) {
    const row = page.locator('#ordList .ordrow').nth(i)
    await row.locator(i > to ? 'button[title="Move up"]' : 'button[title="Move down"]').click()
    i += i > to ? -1 : 1
    await sleep(120)
  }
}
export const ordRows = page => page.locator('#ordList .ordrow .onm').allInnerTexts()
export const ordHidden = page => page.locator('#ordHidden .ordrow .onm').allInnerTexts().catch(() => [])

/* ---------- the Tracker's own picture ---------- */
export async function trkPic(page) {
  return page.evaluate(async () => {
    const t = window.__coreForTests
    await t.whenLoaded()
    const opt = sel => [...document.querySelectorAll(sel + ' option')].map(o => o.textContent)
    const pick = sel => { const e = document.querySelector(sel); return e ? (e.selectedOptions[0] || {}).textContent || null : null }
    return {
      charts: await t.collectCharts(null, { deleted: true }),
      students: await t.collectStudents(),
      courses: t.coursesNow(),
      /* the chart catalogue's own list ORDER is not stored since phase 5b (plan §9: "it reads in the charts' display
         order") and is never shown — the dropdown's order is, and is compared below as `chartList` and in
         `charts.order` — so the catalogue is compared by id: every name, base and userNamed mark, not its array order */
      catalogue: t.sylsNow().slice().sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0)),
      roster: t.rosterNow(),
      screen: {
        title: (document.getElementById('courseTitle') || {}).textContent || null,
        courseList: opt('#courseSel'), chartList: opt('#sylSel'), crewList: opt('#activeSel'),
        course: pick('#courseSel'), chart: pick('#sylSel'), crew: pick('#activeSel'),
        /* the Students card's chips, in their order ("1 ALPHA", "2 BRAVO") */
        chips: [...document.querySelectorAll('#page-tracker [data-rm]')].map(x => x.parentElement.textContent.replace(/[✎×]/g, '').replace(/\s+/g, ' ').trim()),
        balls: document.querySelectorAll('#flowSvg .ball').length,
      },
    }
  })
}
/* the Tracker rows alone, from the raw storage (for the report's "rows it wrote") */
export const isTrk = k => k.startsWith('tracker/')

/* reload, sign in again, come back to the same week and to the Tracker by its tab; the app's state (the driver's
   `state`) AND the Tracker's picture must be the same, and the reload must write nothing */
export async function trkReload(page, name, who = 'a', { ignore = [] } = {}) {
  const s1 = await L.state(page), t1 = await trkPic(page), r1 = await L.rows(page)
  ignore = [...ignore]
  /* NARROW IGNORE 1 — the loaded week's hidden row ids. When the week on screen has never been saved in this world (no
     `weeks/<wk>` row: the pristine demo week), the app builds it from the seed at every load and mints each row's hidden
     id (`rid`, never printed) afresh — nothing the person made, and nothing stored to lose. Only the `rid` leaves of a
     week with NO stored row are let through; a saved week's ids must still read back the same. */
  const unsavedWeek = s1.week != null && !Object.keys(r1).some(k => k === `weeks/${s1.week}` || k.startsWith(`weeks/${s1.week}#`))
  /* stripped BEFORE the compare (the driver's diff lists at most ~40 differences, so filtering after could hide a real
     one behind a crowd of ids) */
  const noRid = s => { if (!unsavedWeek || !s.hist) return s; const c = JSON.parse(JSON.stringify(s)); const walk = o => { if (Array.isArray(o)) o.forEach(walk); else if (o && typeof o === 'object') { delete o.rid; Object.values(o).forEach(walk) } }; walk(c.hist); return c }
  /* NARROW IGNORE 2 — the student on screen, when this person never PICKED one on this course. D376: each person
     reopens on the student HE last had open; one who never picked starts on the course's last-graded student, else the
     first. So after a change to the crew's order (or a removal) the first in the list is who a reload shows — a view
     choice kept per person in the browser (`ocuLocal:`), not saved data. Only when no pick of his is recorded. */
  const neverPicked = await page.evaluate(() => {
    const t = window.__coreForTests, c = (document.getElementById('courseSel') || {}).value
    if (!t || !c) return false
    const v = localStorage.getItem('ocuLocal:' + t.pickKey('lastCrew:' + c))
    return !v
  })
  if (neverPicked) ignore.push(/^\.screen\.crew:/)
  await page.reload()
  await L.signIn(page, who, { goto: false })
  if (s1.week != null) {
    const wk = await page.evaluate(() => window.CURWEEK)
    if (wk !== s1.week) { await page.evaluate(w => window.loadWeek(w), s1.week); await sleep(700) }
  }
  await toTracker(page)
  await L.settle(page, 700)
  const s2 = await L.state(page), t2 = await trkPic(page), r2 = await L.rows(page)
  const tAll = L.stateDiff(t1, t2)
  const d = L.stateDiff(noRid(s1), noRid(s2)).filter(x => !ignore.some(re => re.test(x)))
  const td = tAll.filter(x => !ignore.some(re => re.test(x)))
  const ridMoved = unsavedWeek && JSON.stringify(s1.hist) !== JSON.stringify(s2.hist)
  const let2 = tAll.filter(x => ignore.some(re => re.test(x)))
  L.check(`${name} — a reload gives back exactly what was there (the app)`, !d.length, d.length ? d.slice(0, 10).join(' || ') : `week ${s2.week}${ridMoved ? ' (the never-saved demo week’s hidden row ids were minted afresh — left out of the compare)' : ''}`)
  L.check(`${name} — a reload gives back exactly what was there (the Tracker: every chart, detail, course, student, mark, and the screen)`, !td.length,
    td.length ? td.slice(0, 12).join(' || ') : `${t2.courses.length} courses · ${t2.charts.order.length} charts · on ${t2.screen.course} / ${t2.screen.chart} / ${t2.screen.crew}${let2.length ? ` (let through: ${let2.join('; ')} — never picked, D376)` : ''}`)
  const rd = L.diff(r1, r2)
  L.check(`${name} — the reload wrote nothing`, !rd.put.length && !rd.del.length && !rd.newBatches.length, rd.put.length || rd.del.length || rd.newBatches.length ? { put: rd.put.slice(0, 12), del: rd.del.slice(0, 12), batches: rd.newBatches.slice(0, 4) } : 'no row changed')
  return { s1, s2, t1, t2, d, td }
}

/* a step's rows in a short line for the table */
export const rowsLine = a => `put ${a.put.length}${a.put.length ? ' [' + a.put.slice(0, 6).join(', ') + (a.put.length > 6 ? ' …' : '') + ']' : ''} · del ${a.del.length}${a.del.length ? ' [' + a.del.slice(0, 6).join(', ') + ']' : ''} · batches ${a.batches.length} (${a.batches.map(b => `${b.type}/${b.n}`).join(' ')})`

/* the export and import through the File menu: the OS file window replaced by the app's other real path */
export async function exportFile(page, { students = false, charts = true } = {}) {
  await page.evaluate(() => { try { delete window.showSaveFilePicker } catch (_) {} window.showSaveFilePicker = undefined })
  await menu(page, 'file', 'exportBtn')
  await page.waitForSelector('#copyModal', { state: 'visible' })
  if ((await page.isChecked('#copyCharts')) !== charts) await page.click('#copyCharts')
  if ((await page.isChecked('#copyStudents')) !== students) await page.click('#copyStudents')
  if (charts) await page.click('#copyTickAll')
  const [dl] = await Promise.all([page.waitForEvent('download', { timeout: 15000 }), page.click('#copyOk')])
  const text = await (await import('node:fs')).promises.readFile(await dl.path(), 'utf8')
  let conf = null
  if (await dlgUp(page, 4000)) conf = await dlg(page, {})
  return { name: dl.suggestedFilename(), text, conf }
}
/* `decide(msg)` → 'ok' | 'alt' | 'cancel'; every question and answer is returned */
export async function importFile(page, file, decide = () => 'ok') {
  await page.evaluate(() => { try { delete window.showOpenFilePicker } catch (_) {} window.showOpenFilePicker = undefined })
  await page.click('#fileMenuBtn'); await page.waitForSelector('#importFileBtn', { state: 'visible' })
  const [chooser] = await Promise.all([page.waitForEvent('filechooser', { timeout: 10000 }), page.click('#importFileBtn')])
  await chooser.setFiles(file)
  const asked = []
  for (let i = 0; i < 40; i++) {
    if (!(await dlgUp(page, 8000))) { asked.push({ msg: '(no further question)' }); break }
    const msg = await dlgText(page)
    const ans = await decide(msg)
    asked.push({ msg: msg.replace(/\s+/g, ' ').slice(0, 200), ans })
    await page.click(ans === 'alt' ? '#dlgAlt' : ans === 'cancel' ? '#dlgCancel' : '#dlgOk'); await sleep(500)
    if (/^(Brought in|Students & marks restored|Nothing was brought in|That file)/.test(msg)) break
  }
  await page.evaluate(() => window.__coreForTests.whenLoaded())
  return asked
}

/* the first boot of a fresh world: sign in; exactly ONE change-log batch, of type boot */
export async function firstBoot(page) {
  await L.signIn(page, 'a')
  await L.settle(page)
  const r = await L.rows(page)
  const batches = Object.keys(r).filter(k => k.startsWith('changes/'))
  const types = batches.map(k => { try { return JSON.parse(r[k]).type } catch (_) { return '?' } })
  const byColl = {}
  for (const k of Object.keys(r)) { const c = k.split('/')[0]; byColl[c] = (byColl[c] || 0) + 1 }
  L.check('first boot — ONE change-log batch, of type boot', batches.length === 1 && types[0] === 'boot', `${batches.length} batch(es): ${types.join(', ')} · rows by collection ${JSON.stringify(byColl)}`)
  return { rows: r, byColl }
}
/* the Tracker's FIRST mount in this world: its one named exempt writer (the seed, the one-time upgrades, their flags —
   plan §9 phase 4.1). Recorded, not judged — then a reload must give it all back and write nothing. */
export async function firstMount(page) {
  const before = await L.rows(page)
  await toTracker(page)
  await L.settle(page)
  const after = await L.rows(page)
  const a = L.audit(before, after)
  return a
}

/* ONE user action = ONE saved group = ONE change-log batch (plan §2.7). A gesture whose save spills into a second batch
   leaves a moment (and, on the database, a second changeset) where only part of the action is stored. */
export function oneBatch(name, a) {
  return L.check(`${name} — one action, ONE change-log batch`, a.batches.length <= 1,
    a.batches.length <= 1 ? `${a.batches.length} batch` : a.batches.map(b => `${b.key} ${b.type}/${b.n}`).join(' + '))
}
