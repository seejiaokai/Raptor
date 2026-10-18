/* THE WALK of the night's job 5 (18 Oct 26): D1010 (the next-week preview draws a published day as it was issued on
   View-only Sched; Edit Schedule's keeps the working copy), D1011 (Escape in a board time box puts the old time
   back and saves nothing), D1012 (Escape in a calendar's month/year list shuts only the list), D710 (a note's every
   change has its line in the change history). The built app, desktop 1440 x 900, real presses; assertions with pictures.
   Run: node scripts/handpass/night1018-job5-walk.mjs   (the app is served on 4174; this script builds and serves nothing) */
import { rmSync, mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const OUT = resolve(here, '../../docs/img/handpass/2026-10-18-night-job5')
rmSync(OUT, { recursive: true, force: true }); mkdirSync(OUT, { recursive: true })
process.env.HP_URL ||= 'http://localhost:4174'
process.env.HP_SHOTS = OUT
const L = await import('./lib.mjs')

const rows = [], allErrors = []
const check = (id, ok, note) => { rows.push({ id, ok: !!ok, note }); console.log(`${ok ? 'PASS' : 'FAIL'} ${id} — ${note}`) }
const notWalked = (id, why) => { rows.push({ id, ok: null, note: why }); console.log(`NOT WALKED ${id} — ${why}`) }
console.log('night1018-job5-walk v1 →', OUT, 'against', L.BASE)
const sleep = ms => new Promise(r => setTimeout(r, ms))
const flat = s => (s || '').replace(/\s+/g, ' ').trim()

const peekLoc = (page, scope, di) => page.locator(`#${scope} .day.peek[data-peek-day="${di}"]`)
const peekText = (page, scope, di) => peekLoc(page, scope, di).evaluate(e => e.innerText)
/* the first start time of the day's COMMON PROGRAMME table: the first HH:MM after the table's RMKS header */
const firstProgTime = t => { const i = t.indexOf('RMKS'); const m = i < 0 ? null : t.slice(i).match(/(\d\d:\d\d)/); return m ? m[1] : null }
const shotPeek = async (page, scope, di, name) => {
  const l = peekLoc(page, scope, di)
  await l.scrollIntoViewIfNeeded().catch(() => {})
  await sleep(300)
  await page.screenshot({ path: `${OUT}/${name}-page.png` })
  await l.screenshot({ path: `${OUT}/${name}.png` })
}
const doneBoard = async page => { const d = page.locator('#sbDone:visible'); if (await d.count()) { await d.click(); await sleep(700) } }
const pickWeek = async (page, scope, wk) => { await page.click(`#${scope} [data-wk="${wk}"]`); await sleep(800) }
const bumpMinute = hhmm => { const [h, m] = hhmm.split(':').map(Number); const t = (h * 60 + m + 1) % 1440; return String(Math.floor(t / 60)).padStart(2, '0') + String(t % 60).padStart(2, '0') }

/* ============ D1010 — S1, S3, S4, S2 (one world: admin builds it, the member looks last) ============ */
{
  const { browser, page, errors } = await L.open({})
  try {
    await L.go(page, 'editsched')
    await pickWeek(page, 'page-editsched', '20/07/2026')
    const wk = await page.evaluate(() => window.CURWEEK)
    check('S1.0 went to next week with the week buttons', wk === '20/07/2026', `CURWEEK ${wk}`)
    await L.board(page, 0)
    const orig = await page.locator('[data-bfld="ap:0.0.str"]:visible').first().inputValue()
    const pub = await L.publish(page, 0)
    const st = await L.signState(page, 0)
    check('S1.1 published next week\'s Monday with the four sign-offs and the app\'s own Publish day', pub.published && /ORIG/.test(st.chip), `publish ${JSON.stringify(pub)}, chip "${st.chip}", programme row 1 start "${orig}"`)
    const newT = bumpMinute(orig)
    await L.type(page, '[data-bfld="ap:0.0.str"]', newT.replace(':', ''))
    await sleep(500)
    const boxNow = await page.locator('[data-bfld="ap:0.0.str"]:visible').first().inputValue()
    const pend = await page.evaluate(() => [...document.querySelectorAll('#schedBoard .dpend')].filter(e => e.getClientRects().length).map(e => e.textContent.trim()))
    check('S1.2 changed Monday (first programme row start) so it reads "1 pending"', pend.some(p => /^1\s*pending/.test(p)) && boxNow !== orig, `row now "${boxNow}" (was "${orig}"); pending marks: ${JSON.stringify(pend)}`)
    await page.screenshot({ path: `${OUT}/S1-0-board-monday-pending.png` })
    await doneBoard(page)
    await pickWeek(page, 'page-editsched', '13/07/2026')
    const wk2 = await page.evaluate(() => window.CURWEEK)
    check('S1.3 back on this week', wk2 === '13/07/2026', `CURWEEK ${wk2}`)
    // Edit Schedule's preview Monday MUST show the working copy
    const et = await peekText(page, 'eWeek', 0)
    const eT = firstProgTime(et)
    check('S1.4 Edit Schedule\'s preview Monday shows the change (working copy)', /Jul 20/.test(et) && eT === boxNow, `preview Monday (${flat(et).slice(0, 40)}…) first programme start "${eT}"; working copy "${boxNow}", issued "${orig}"`)
    await shotPeek(page, 'eWeek', 0, 'S1-1-edit-preview-monday')
    // View-only Sched's preview Monday must NOT
    await L.go(page, 'viewsched')
    const vt = await peekText(page, 'vWeek', 0)
    const vT = firstProgTime(vt)
    check('S1.5 View-only Sched\'s preview Monday does NOT show the change (as issued)', /Jul 20/.test(vt) && vT === orig && vT !== boxNow, `preview Monday first programme start "${vT}"; issued "${orig}", working "${boxNow}"`)
    await shotPeek(page, 'vWeek', 0, 'S1-2-view-preview-monday')

    // S3 — resize 800 and back on Edit Schedule, then View-only Sched
    await L.go(page, 'editsched'); await sleep(500)
    await page.setViewportSize({ width: 800, height: 900 }); await sleep(900)
    const peeks800 = await page.locator('#eWeek .day.peek').evaluateAll(es => es.filter(e => e.getClientRects().length).length)
    await page.screenshot({ path: `${OUT}/S3-0-edit-at-800.png` })
    await page.setViewportSize({ width: 1440, height: 900 }); await sleep(1200)
    const etB = await peekText(page, 'eWeek', 0)
    check('S3.1 after 800 and back to 1440, Edit Schedule\'s preview still the working copy', firstProgTime(etB) === boxNow, `visible preview days at 800: ${peeks800}; at 1440 Monday start "${firstProgTime(etB)}" (working "${boxNow}")`)
    await shotPeek(page, 'eWeek', 0, 'S3-1-edit-preview-after-resize')
    await L.go(page, 'viewsched'); await sleep(500)
    const vtB = await peekText(page, 'vWeek', 0)
    check('S3.2 then View-only Sched: the preview still the published version', firstProgTime(vtB) === orig, `Monday start "${firstProgTime(vtB)}" (issued "${orig}", working "${boxNow}")`)
    await shotPeek(page, 'vWeek', 0, 'S3-2-view-preview-after-resize')

    // S4 — a day of next week NOT published: Tuesday
    await L.go(page, 'editsched')
    await pickWeek(page, 'page-editsched', '20/07/2026')
    await L.board(page, 1)
    const chip = await page.evaluate(() => (document.querySelector('#schedBoard .verchip') || {}).innerText || '')
    const orig1 = await page.locator('[data-bfld="ap:1.0.str"]:visible').first().inputValue()
    const new1 = bumpMinute(orig1)
    await L.type(page, '[data-bfld="ap:1.0.str"]', new1.replace(':', ''))
    await sleep(500)
    const box1 = await page.locator('[data-bfld="ap:1.0.str"]:visible').first().inputValue()
    check('S4.0 Tuesday of next week is not published and its first programme start was changed', /DRAFT/.test(chip) && box1 !== orig1, `Tuesday chip "${chip}"; start "${orig1}" → "${box1}"`)
    await doneBoard(page)
    await pickWeek(page, 'page-editsched', '13/07/2026')
    const et1 = await peekText(page, 'eWeek', 1)
    check('S4.1 Edit Schedule\'s preview of the unpublished Tuesday shows the working copy', /Jul 21/.test(et1) && firstProgTime(et1) === box1, `Tuesday start "${firstProgTime(et1)}" (working "${box1}", was "${orig1}")`)
    await shotPeek(page, 'eWeek', 1, 'S4-1-edit-preview-tuesday')
    await L.go(page, 'viewsched')
    const vt1 = await peekText(page, 'vWeek', 1)
    check('S4.2 View-only Sched\'s preview of the unpublished Tuesday shows the working copy', /Jul 21/.test(vt1) && firstProgTime(vt1) === box1, `Tuesday start "${firstProgTime(vt1)}" (working "${box1}", was "${orig1}")`)
    await shotPeek(page, 'vWeek', 1, 'S4-2-view-preview-tuesday')

    // S2 — the member
    await page.click('#logout'); await sleep(900)
    await L.login(page, 'm')
    await L.go(page, 'viewsched'); await sleep(500)
    const wkM = await page.evaluate(() => window.CURWEEK)
    const who = await page.evaluate(() => (document.querySelector('#roleBadge') || {}).innerText || '')
    if (wkM !== '13/07/2026') await pickWeek(page, 'page-viewsched', '13/07/2026')
    const mt = await peekText(page, 'vWeek', 0)
    check('S2.1 member (us) on View-only Sched: the preview Monday does not show the change', /Jul 20/.test(mt) && firstProgTime(mt) === orig && firstProgTime(mt) !== boxNow, `signed in as "${who}", week ${wkM}; Monday start "${firstProgTime(mt)}" (issued "${orig}", working "${boxNow}")`)
    await shotPeek(page, 'vWeek', 0, 'S2-1-member-preview-monday')
  } catch (e) { check('D1010 section', false, 'script stopped: ' + String(e).slice(0, 300)); await page.screenshot({ path: `${OUT}/D1010-stopped.png` }).catch(() => {}) }
  allErrors.push(...errors.map(x => 'D1010: ' + x)); await browser.close()
}

/* ============ D1011 — S5 to S8: the board's time boxes ============ */
{
  const { browser, page, errors } = await L.open({})
  const readStored = () => page.evaluate(() => {
    const d = window.DAYS[0]
    return { to: d.waves[0].formations[0].to, duty: d.dutywaves[0].rows[0].str }
  })
  const undoDisabled = () => page.evaluate(() => !!document.querySelector('#sbUndo')?.disabled)
  const boxOf = (sel) => page.locator(`#schedBoard ${sel}:visible`).first()
  const reopen = async () => {
    await page.reload(); await sleep(1200)
    if (await page.locator('#luser').count()) await L.login(page, 'a')
    await L.go(page, 'editsched'); await L.board(page, 0)
  }
  const clickElsewhere = async () => { await page.mouse.click(720, 4); await sleep(400) }
  /* a real typing of a time into a box, no commit: click, select all, type */
  const typeNoCommit = async (loc, text) => { await loc.click(); await page.keyboard.press('Control+A'); await page.keyboard.type(text, { delay: 30 }); await sleep(200) }
  try {
    await L.go(page, 'editsched'); await L.board(page, 0)
    const s0 = await readStored()
    const u0 = await undoDisabled()
    // S5 take-off
    { const box = boxOf('[data-bfld="ff:0.0.0.to"]'); const old = await box.inputValue()
      await typeNoCommit(box, '2359')
      const typed = await box.inputValue()
      await page.screenshot({ path: `${OUT}/S5-0-typed-2359.png` })
      await page.keyboard.press('Escape'); await sleep(500)
      const after = await box.inputValue()
      await page.screenshot({ path: `${OUT}/S5-1-after-escape.png` })
      await clickElsewhere()
      const st = await readStored()
      const afterClick = await box.inputValue()
      const uA = await undoDisabled()
      await reopen()
      const st2 = await readStored(); const boxR = await boxOf('[data-bfld="ff:0.0.0.to"]').inputValue()
      await page.screenshot({ path: `${OUT}/S5-2-after-reload.png` })
      check('S5 take-off box: 2359 typed, Escape → old time back, saves nothing, still old after reload',
        typed !== old && after === old && afterClick === old && st.to === s0.to && uA === u0 && boxR === old && st2.to === s0.to,
        `old "${old}", typed shows "${typed}", after Escape "${after}", after click elsewhere "${afterClick}", stored "${st.to}" (was "${s0.to}"), Undo disabled ${u0}→${uA}; after reload box "${boxR}", stored "${st2.to}"`) }
    // S6 duty row start
    { const sel = '[data-bfld="dr:0.0.0.str"]'
      const box = boxOf(sel); const old = await box.inputValue()
      await typeNoCommit(box, '2359')
      const typed = await box.inputValue()
      await page.screenshot({ path: `${OUT}/S6-0-typed-2359.png` })
      await page.keyboard.press('Escape'); await sleep(500)
      const after = await box.inputValue()
      await page.screenshot({ path: `${OUT}/S6-1-after-escape.png` })
      await clickElsewhere()
      const st = await readStored(); const afterClick = await box.inputValue(); const uA = await undoDisabled()
      await reopen()
      const st2 = await readStored(); const boxR = await boxOf(sel).inputValue()
      await page.screenshot({ path: `${OUT}/S6-2-after-reload.png` })
      check('S6 duty row start box: same', typed !== old && after === old && afterClick === old && st.duty === s0.duty && uA === u0 && boxR === old && st2.duty === s0.duty,
        `old "${old}", typed shows "${typed}", after Escape "${after}", after click "${afterClick}", stored "${st.duty}" (was "${s0.duty}"), Undo disabled ${u0}→${uA}; after reload box "${boxR}", stored "${st2.duty}"`) }
    // S7 Personal input's own start box
    { await L.openInputs(page, 0)
      const loc = page.locator('#schedBoard [data-ifld$=".str"]:visible', { }).filter({ has: page.locator('xpath=self::*') })
      const boxes = await page.locator('#schedBoard [data-ifld$=".str"]:visible').evaluateAll(es => es.map(e => ({ f: e.dataset.ifld, v: e.value })))
      const target = boxes.find(b => b.v === '09:00')
      if (!target) { notWalked('S7', 'no personal input with a start time of 09:00 on the board: ' + JSON.stringify(boxes)) }
      else {
        const sel = `[data-ifld="${target.f}"]`
        const box = boxOf(sel); const old = await box.inputValue()
        const readInput = () => page.evaluate(f => { const id = f.split('.')[0]; const arr = window.INPUTS; const i = Array.isArray(arr) ? arr.find(x => x.id === id) : null; return i ? { str: i.str ?? i.start ?? null } : null }, target.f)
        const i0 = await readInput()
        await typeNoCommit(box, '2359')
        const typed = await box.inputValue()
        await page.screenshot({ path: `${OUT}/S7-0-typed-2359.png` })
        await page.keyboard.press('Escape'); await sleep(500)
        const after = await box.inputValue()
        await page.screenshot({ path: `${OUT}/S7-1-after-escape.png` })
        await clickElsewhere()
        const afterClick = await boxOf(sel).inputValue(); const uA = await undoDisabled(); const i1 = await readInput()
        await reopen(); await L.openInputs(page, 0)
        const boxR = await boxOf(sel).inputValue(); const i2 = await readInput()
        await page.screenshot({ path: `${OUT}/S7-2-after-reload.png` })
        check('S7 a Personal input\'s own start box on the board: same', typed !== old && after === old && afterClick === old && uA === u0 && boxR === old && JSON.stringify(i1) === JSON.stringify(i0) && JSON.stringify(i2) === JSON.stringify(i0),
          `box ${target.f}: old "${old}", typed shows "${typed}", after Escape "${after}", after click "${afterClick}", Undo disabled ${u0}→${uA}; input record ${JSON.stringify(i0)}→${JSON.stringify(i1)}; after reload box "${boxR}", record ${JSON.stringify(i2)}`)
      } }
    // S8 Enter still saves
    { const sel = '[data-bfld="ff:0.0.0.to"]'
      const box = boxOf(sel); const old = await box.inputValue()
      const nw = bumpMinute(old)
      await typeNoCommit(box, nw); await page.keyboard.press('Enter'); await sleep(700)
      const shown = await boxOf(sel).inputValue(); const st = await readStored()
      await page.screenshot({ path: `${OUT}/S8-0-after-enter.png` })
      await reopen()
      const boxR = await boxOf(sel).inputValue(); const st2 = await readStored()
      await page.screenshot({ path: `${OUT}/S8-1-after-reload.png` })
      const nz = v => String(v).replace(':', '')
      const ok1 = nz(shown) === nw && nz(st2.to) === nw && nz(boxR) === nw
      // put it back
      await typeNoCommit(boxOf(sel), old.replace(':', '')); await page.keyboard.press('Enter'); await sleep(700)
      const back = await boxOf(sel).inputValue(); const st3 = await readStored()
      check('S8 Enter still saves a typed time: stays after reload (then put back)', ok1 && nz(back) === nz(old) && nz(st3.to) === nz(old),
        `old "${old}", typed ${nw}, box after Enter "${shown}", stored "${st.to}"; after reload box "${boxR}", stored "${st2.to}"; put back → box "${back}", stored "${st3.to}"`) }
  } catch (e) { check('D1011 section', false, 'script stopped: ' + String(e).slice(0, 300)); await page.screenshot({ path: `${OUT}/D1011-stopped.png` }).catch(() => {}) }
  allErrors.push(...errors.map(x => 'D1011: ' + x)); await browser.close()
}

/* ============ D1012 — S9, S10: Escape in a calendar's month/year list ============ */
{
  const { browser, page, errors } = await L.open({})
  const state = () => page.evaluate(() => ({
    win: !!document.querySelector('[data-testid="win-inputedit"]') && document.querySelector('[data-testid="win-inputedit"]').getClientRects().length > 0,
    oil: !!document.querySelector('[data-testid="oilconf"]'),
    listIn: !!document.querySelector('[data-testid="inpEdCal-lists"]'),
    listOil: !!document.querySelector('[data-testid="oilcal-lists"]'),
  }))
  try {
    await L.go(page, 'inputs')
    await page.click('#inListBtn'); await sleep(500)
    await page.click('#inNew'); await sleep(700)
    await page.screenshot({ path: `${OUT}/S9-0-window-open.png` })
    await page.click('[data-testid="inpEdCal-title"]'); await sleep(500)
    const s1 = await state()
    await page.screenshot({ path: `${OUT}/S9-1-list-open.png` })
    await page.keyboard.press('Escape'); await sleep(500)
    const s2 = await state()
    await page.screenshot({ path: `${OUT}/S9-2-after-escape-1.png` })
    check('S9.1 input window: month/year list open, Escape → only the list closes, window stays', s1.listIn && s1.win && !s2.listIn && s2.win, `before: list ${s1.listIn}, window ${s1.win}; after Escape: list ${s2.listIn}, window ${s2.win}`)
    await page.keyboard.press('Escape'); await sleep(500)
    const s3 = await state()
    await page.screenshot({ path: `${OUT}/S9-3-after-escape-2.png` })
    check('S9.2 Escape again closes the window', !s3.win, `after second Escape: window ${s3.win}`)
    // S10
    await page.click('#inNew'); await sleep(700)
    await page.selectOption('#inpEditType', { label: 'Training' })
    await page.click('[data-testid="inpEdCal-day-2026-07-18"]'); await page.click('[data-testid="inpEdCal-day-2026-07-19"]'); await sleep(300)
    await page.click('#inpEditSave'); await sleep(800)
    const q = await page.locator('[data-testid="oil-some"]').count()
    if (!q) { notWalked('S10', 'no "Only some days…" question after filing Training on Sat 18 – Sun 19 Jul') }
    else {
      await page.click('[data-testid="oil-some"]'); await sleep(600)
      await page.screenshot({ path: `${OUT}/S10-0-only-some-days-calendar.png` })
      await page.click('[data-testid="oilcal-title"]'); await sleep(500)
      const t1 = await state()
      await page.screenshot({ path: `${OUT}/S10-1-list-open.png` })
      await page.keyboard.press('Escape'); await sleep(500)
      const t2 = await state()
      await page.screenshot({ path: `${OUT}/S10-2-after-escape-1.png` })
      check('S10.1 OIL question "Only some days…": month/year list open, Escape → only the list closes, question stays', t1.listOil && t1.oil && !t2.listOil && t2.oil, `before: list ${t1.listOil}, question ${t1.oil}; after Escape: list ${t2.listOil}, question ${t2.oil}`)
      await page.keyboard.press('Escape'); await sleep(500)
      const t3 = await state()
      await page.screenshot({ path: `${OUT}/S10-3-after-escape-2.png` })
      check('S10.2 Escape again closes the question', !t3.oil, `after second Escape: question ${t3.oil}, input window ${t3.win}`)
    }
  } catch (e) { check('D1012 section', false, 'script stopped: ' + String(e).slice(0, 300)); await page.screenshot({ path: `${OUT}/D1012-stopped.png` }).catch(() => {}) }
  allErrors.push(...errors.map(x => 'D1012: ' + x)); await browser.close()
}

/* ============ D710 — S11, S12: a note's change lines ============ */
{
  const { browser, page, errors } = await L.open({})
  const DAY = '2026-10-19'   // after the delete's date (today, 18 Oct): a delete takes a man off notes from its date on
  const openWin = async () => {
    await page.click('#histBtn'); await sleep(800)
    await page.locator('.chgwin button:visible', { hasText: /All changes/ }).click(); await sleep(600)
    return flat(await page.locator('.chgwin').innerText())
  }
  try {
    await L.go(page, 'inputs')
    await page.locator(`[data-icday="${DAY}"]:visible`).click({ position: { x: 10, y: 8 } }); await sleep(700)
    await page.click('#icAddPuck'); await sleep(500)
    await page.fill('.ic-poppuck-edit', 'WALK NOTE')
    await page.click('#icNewNotePpl'); await sleep(700)
    await page.locator('.puck:visible', { hasText: 'Widget' }).first().click()
    await page.locator('.puck:visible', { hasText: 'Ratchet' }).first().click()
    await page.locator('button:visible', { hasText: /^\s*✓\s*Add/ }).click(); await sleep(700)
    const win = flat(await page.locator('.floatwin:not([hidden])').first().innerText())
    check('S11.0 "WALK NOTE" on Mon 19 Oct with Widget and Ratchet (the "+ people" picker)', /WALK NOTE/.test(win) && /Widget/.test(win) && /Ratchet/.test(win), `day panel: ${win.slice(0, 120)}`)
    await page.screenshot({ path: `${OUT}/S11-0-note-with-two-people.png` })
    await L.go(page, 'admin')
    await page.locator('#page-admin button:visible', { hasText: /^Widget/ }).first().click(); await sleep(500)
    await page.locator('button:visible', { hasText: /^Delete$/ }).first().click(); await sleep(500)
    await page.locator('button.del-armed:visible').click(); await sleep(900)
    const gone = !(await page.locator('#page-admin button:visible', { hasText: /^Widget/ }).count())
    await page.screenshot({ path: `${OUT}/S11-1-widget-deleted.png` })
    await L.go(page, 'editsched')
    await page.locator('#page-editsched [aria-label="Jump to a date"]:visible').first().click(); await sleep(600)
    let k = 0
    while (!(await page.locator(`[data-testid="wcal-day-${DAY}"]`).count()) && k++ < 6) { await page.click('[data-testid="wcal-next"]'); await sleep(250) }
    await page.click(`[data-testid="wcal-day-${DAY}"]`); await sleep(900)
    const wk = await page.evaluate(() => window.CURWEEK)
    const txt = await openWin()
    await page.screenshot({ path: `${OUT}/S11-2-changes-window.png` })
    check('S11.1 changes window: a line naming the note "WALK NOTE" and Widget "taken off"', gone && /Note “WALK NOTE” · Widget taken off/.test(txt), `Widget gone from Users: ${gone}; week ${wk}; window: ${txt.slice(txt.indexOf('Mon'), txt.indexOf('Mon') + 220)}`)
    await page.click('.chgwin .x, .chgwin [aria-label="Close"]').catch(() => {}); await sleep(400)

    // S12 — edit the words, then Undo
    await L.go(page, 'inputs'); await sleep(500)
    await page.locator(`[data-icday="${DAY}"]:visible`).click({ position: { x: 10, y: 8 } }); await sleep(700)
    await page.locator('.floatwin:not([hidden]) [data-ppedit]').first().click(); await sleep(500)
    await page.screenshot({ path: `${OUT}/S12-0-editing-words.png` })
    const ed = page.locator('.floatwin:not([hidden]) input:focus, .floatwin:not([hidden]) .ic-poppuck-edit').first()
    await ed.press('Control+A'); await page.keyboard.type('WALK NOTE 2', { delay: 20 }); await page.keyboard.press('Enter'); await sleep(700)
    const win2 = flat(await page.locator('.floatwin:not([hidden])').first().innerText())
    await L.go(page, 'editsched'); await sleep(400)
    const wk2 = await page.evaluate(() => window.CURWEEK)
    const txt2 = await openWin()
    await page.screenshot({ path: `${OUT}/S12-1-words-line.png` })
    check('S12.1 words edited to "WALK NOTE 2": a "· words" line on that day', /WALK NOTE 2/.test(win2) && /Note “WALK NOTE[^”]*” · words/.test(txt2), `panel after edit: ${win2.slice(0, 60)}; week ${wk2}; window: ${txt2.slice(txt2.indexOf('Mon'), txt2.indexOf('Mon') + 330)}`)
    await page.click('.chgwin .x, .chgwin [aria-label="Close"]').catch(() => {}); await sleep(400)
    await page.click('#undoBtn'); await sleep(900)
    const pgAfterUndo = await page.evaluate(() => window.CURPAGE)
    await page.screenshot({ path: `${OUT}/S12-2a-right-after-undo.png` })
    await L.go(page, 'editsched'); await sleep(500)
    const wk3 = await page.evaluate(() => window.CURWEEK)
    const txt3 = await openWin()
    await page.screenshot({ path: `${OUT}/S12-2-undo-line.png` })
    check('S12.2 Undo (top bar): an Undo line appears on that day', /Undo/i.test(txt3) && /Mon/.test(txt3), `page right after Undo: ${pgAfterUndo}; week ${wk3}; window: ${txt3.slice(txt3.indexOf('Mon'), txt3.indexOf('Mon') + 460)}`)
  } catch (e) { check('D710 section', false, 'script stopped: ' + String(e).slice(0, 300)); await page.screenshot({ path: `${OUT}/D710-stopped.png` }).catch(() => {}) }
  allErrors.push(...errors.map(x => 'D710: ' + x)); await browser.close()
}

console.log('\n=== SUMMARY ===')
for (const r of rows) console.log(`${r.ok === null ? 'NOT WALKED' : r.ok ? 'PASS' : 'FAIL'}  ${r.id}`)
console.log('errors:', allErrors.length ? allErrors : 'none')
