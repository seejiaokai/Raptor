/* [TRK-DLG-LEFTOVERS] 1 — the question box: one question at a time, and the door
   behind it shut (the leftovers walk, walker a, 28 Sep 26). Assertions of the RIGHT
   behaviour: a PASS means correct. Order list: Fable B1-1…B1-7, Astra scenario 5.
   Desktop 1440x900 then a phone 390x844 with touch (a keyboard attached to the phone
   for the Tab steps). Everything through the app's own controls and real keys.

     HP_URL=http://localhost:4175 HP_SHOTS=<dir> HP_OUT=<dir> node scripts/handpass/trk-lo-2a-dlg.mjs
     LO_ONLY=desk|phone to run one size. */
import { writeFileSync } from 'node:fs'
import { open, save, log, DESK, PHONE } from './trk-lib.mjs'
import { exportVia, importVia, tmp, sylLabels } from './trk-w1-lib.mjs'
import { sleep, press, choose, menu, qText, waitQ, focusAt, half, shot } from './trk-lo-2a-lib.mjs'

const L = log()
const allErrors = []
const j = o => JSON.stringify(o)

for (const mode of (process.env.LO_ONLY ? [process.env.LO_ONLY] : ['desk', 'phone'])) {
  const touch = mode === 'phone'
  const M = touch ? 'P' : 'D'
  const S = (n, what) => `lo-2a-B${M}${n}-${what}`
  const { browser, page, errors } = await open({ size: touch ? PHONE : DESK, who: 'a', touch })
  const course = () => page.evaluate(() => { const c = document.getElementById('courseSel'); return c.options[c.selectedIndex].textContent })
  const courses = () => page.evaluate(() => [...document.querySelectorAll('#courseSel option')].map(o => o.textContent))
  /* Tab n times; every stop, and whether it was inside the box or behind the shade */
  const tabWalk = async (n, shift = false) => {
    const stops = []
    for (let i = 0; i < n; i++) { await page.keyboard.press(shift ? 'Shift+Tab' : 'Tab'); await sleep(40); stops.push(await focusAt(page)) }
    return stops
  }
  const words = stops => stops.map(f => f.d + (f.inDlg ? ' [box]' : f.inTracker ? ' [BEHIND THE SHADE]' : '')).join(' → ')

  /* a second course, so a delete question can be asked */
  await menu(page, 'course', 'addCourse', touch); await waitQ(page)
  await page.fill('#dlgInput', 'LO B1'); await press(page, '#dlgOk', touch); await sleep(600)
  await choose(page, '#courseSel', '26ABSG')

  /* an empty spot of Raptor's top bar (no button, link or box at it), found while no
     question is up */
  const barSpot = await page.evaluate(() => {
    const bar = document.querySelector('.topbar'); const r = bar.getBoundingClientRect()
    for (let x = r.left + r.width * 0.45; x < r.right - 10; x += 8) {
      const el = document.elementFromPoint(x, r.top + r.height / 2)
      if (el && bar.contains(el) && !el.closest('a,button,input,select,label')) return { x: Math.round(x), y: Math.round(r.top + r.height / 2), el: el.tagName.toLowerCase() + '.' + el.className }
    }
    return null
  })

  /* ---- 1. a question with a text box (✎ Rename course): Tab and Shift+Tab go round
     inside it ---- */
  await menu(page, 'course', 'renCourse', touch)
  const q1 = await waitQ(page); await sleep(200)
  await shot(page, S('01', 'rename-question'))
  const f0 = await focusAt(page)
  const fw = await tabWalk(10), bw = await tabWalk(10, true)
  L.ok(`${M} 1 Tab ×10 from the Rename question stays inside the box`, fw.every(f => f.inDlg), `start ${f0.d} · ${words(fw)}`)
  L.ok(`${M} 1 Shift+Tab ×10 stays inside the box`, bw.every(f => f.inDlg), words(bw))
  const pageInert = await page.evaluate(() => [...document.querySelector('#page-tracker .tr-root').children].map(c => (c.id || c.className.split(' ')[0]) + (c.hasAttribute('inert') ? ':inert' : ':live')))
  L.ok(`${M} 1 while it is up, every other part of the Tracker's page is shut (inert); the box and its shade are not`, pageInert.filter(x => /:live$/.test(x)).every(x => /^(dlgOverlay|dlgModal)/.test(x)), pageInert.join(' | '))

  /* ---- 2. a press on Raptor's own top bar with the mouse (an empty spot) ---- */
  const hitNow = await page.evaluate(pt => { const hit = pt && document.elementFromPoint(pt.x, pt.y); return hit ? hit.tagName.toLowerCase() + '#' + hit.id : null }, barSpot)
  const spot = { pt: barSpot, hitNow }
  L.note(`${M} 2 an empty spot of Raptor's top bar, and what a press there lands on while the question is up`, j(spot))
  if (spot.pt) {
    if (touch) await page.touchscreen.tap(spot.pt.x, spot.pt.y); else await page.mouse.click(spot.pt.x, spot.pt.y)
    await sleep(400)
  }
  const q2 = await qText(page)
  L.note(`${M} 2 after the press: is the Rename question still up?`, q2 ? 'yes — "' + q2.replace(/\s+/g, ' ') + '"' : 'NO — the press landed on the grey shade, which answers Cancel (as a press anywhere outside the box always has); the course is still "' + await course() + '"')
  if (q2) {
    const t2 = await tabWalk(40)
    L.ok(`${M} 2 …then Tab ×40: focus never lands on the Tracker's controls behind the shade`, !t2.some(f => f.inTracker), words(t2))
    await page.keyboard.press('Escape'); await sleep(300)
  }

  /* ---- 3. a question with NO text box (🗑 Delete course) leaves the keyboard where
     it was: Tab from there walks Raptor's top bar and then only the box ---- */
  await choose(page, '#courseSel', 'LO B1')
  await menu(page, 'course', 'delCourse', touch)
  const q3 = await waitQ(page); await sleep(200)
  const f3 = await focusAt(page)
  const t3 = await tabWalk(45)
  L.ok(`${M} 3 Delete-course question up; Tab ×45 from where the keyboard was: never the Tracker's controls behind the shade (#activeSel, + Add, ⇅ Reorder…)`, !t3.some(f => f.inTracker), `question "${(q3 || '').replace(/\s+/g, ' ').slice(0, 60)}" · start ${f3.d} · ${words(t3)}`)
  L.note(`${M} 3 the stops that were Raptor's own top bar (Tab)`, t3.filter(f => !f.inDlg && !f.inTracker).map(f => f.d).filter((v, i, a) => a.indexOf(v) === i).join(' · ') || 'none')
  /* backwards from where the keyboard was (the menu item that asked, now gone): Shift+Tab
     reaches Raptor's own bar, which is outside the shade */
  await page.keyboard.press('Escape'); await sleep(300)
  await menu(page, 'course', 'delCourse', touch); await waitQ(page); await sleep(200)
  const t3b = await tabWalk(45, true)
  L.ok(`${M} 3 …and Shift+Tab ×45 from there: never the Tracker's controls behind the shade either`, !t3b.some(f => f.inTracker), words(t3b))
  L.note(`${M} 3 the stops that were Raptor's own top bar (Shift+Tab)`, t3b.filter(f => !f.inDlg && !f.inTracker).map(f => f.d).filter((v, i, a) => a.indexOf(v) === i).join(' · ') || 'none')
  await shot(page, S('02', 'delete-question-tab-walk'))

  /* ---- 4. Logout while a question is up: refused, the Tracker brought forward (by
     keyboard — the shade covers the bar to the mouse). And a Raptor tab by keyboard:
     the page changes, the question waits; Logout from there comes back to it. ---- */
  const toKey = async (id, key = 'Shift+Tab') => {
    for (let i = 0; i < 60; i++) { const f = await focusAt(page); if (f.id === id) return true; await page.keyboard.press(key); await sleep(30) }
    return false
  }
  /* a fresh question each time: once the keyboard is back inside the box it stays there */
  const freshQ = async () => { if (await qText(page)) { await page.keyboard.press('Escape'); await sleep(300) } await menu(page, 'course', 'delCourse', touch); await waitQ(page); await sleep(200) }
  await freshQ()
  const reachLogout = await toKey('logout')
  if (reachLogout) {
    await page.keyboard.press('Enter'); await sleep(700)
    const signIn = await page.locator('#luser').isVisible().catch(() => false)
    L.ok(`${M} 4 Shift+Tab to Raptor's Logout, Enter, while the question is up: refused; the Tracker stays and the question is still up`, !signIn && (await page.evaluate(() => window.CURPAGE)) === 'tracker' && !!(await qText(page)), `sign-in page: ${signIn} · page ${await page.evaluate(() => window.CURPAGE)} · question "${((await qText(page)) || 'none').replace(/\s+/g, ' ').slice(0, 40)}"`)
  } else L.note(`${M} 4 COULD NOT REACH Raptor's Logout by keyboard from the question`, 'Shift+Tab never stops on it')
  if (touch) {
    /* the phone's bar: Shift+Tab reaches the ☰ (a keyboard on the phone); Enter opens the
       drawer — over the question; a finger on the drawer's Logout */
    await freshQ()
    const bur = await toKey('burger')
    if (bur) { await page.keyboard.press('Enter'); await sleep(500) }
    const drawerUp = await page.evaluate(() => { const d = document.getElementById('drawer'); return !!d && /open/.test(d.className) })
    const covered = await page.evaluate(() => { const m = document.getElementById('dlgModal'); if (!m) return null; const r = m.getBoundingClientRect(); const hit = document.elementFromPoint(r.left + r.width / 2, r.top + 20); return !m.contains(hit) })
    await shot(page, S('04a', 'phone-drawer-over-question'))
    const tabNext = []
    for (let i = 0; i < 4; i++) { await page.keyboard.press('Tab'); await sleep(40); tabNext.push((await focusAt(page)).d) }
    L.note(`${M} 4 phone + keyboard: Shift+Tab to ☰, Enter while the Delete-course question is up`, `drawer opened: ${drawerUp} · the drawer covers the question box: ${covered} · Tab from ☰ then goes: ${tabNext.join(' → ')}`)
    if (drawerUp) {
      await page.locator('#drawerLogout').tap(); await sleep(900)
      const signIn = await page.locator('#luser').isVisible().catch(() => false)
      L.ok(`${M} 4 …a finger on the drawer's Logout: refused; the Tracker and its question stay`, !signIn && (await page.evaluate(() => window.CURPAGE)) === 'tracker' && !!(await qText(page)),
        `sign-in page: ${signIn} · page ${await page.evaluate(() => window.CURPAGE)} · question up: ${!!(await qText(page))} · drawer open: ${await page.evaluate(() => /open/.test((document.getElementById('drawer') || {}).className || ''))}`)
      await shot(page, S('04b', 'phone-drawer-logout-refused'))
      if (await page.evaluate(() => /open/.test((document.getElementById('drawer') || {}).className || ''))) { await page.keyboard.press('Escape'); await sleep(300) }
    }
  }
  await freshQ()
  const qualsReached = await (async () => {
    for (let i = 0; i < 60; i++) {
      if (await page.evaluate(() => { const e = document.activeElement; return !!(e && e.matches && e.matches('#topnav a[data-page="quals"]')) })) return true
      await page.keyboard.press('Shift+Tab'); await sleep(30)
    }
    return false
  })()
  if (qualsReached) {
    await page.keyboard.press('Enter'); await page.waitForFunction(() => window.CURPAGE === 'quals', null, { timeout: 5000 }).catch(() => {}); await sleep(400)
    L.note(`${M} 4 Enter on Raptor's Quals tab (keyboard) while the question is up`, 'page now ' + await page.evaluate(() => window.CURPAGE))
    await shot(page, S('03', 'quals-while-question-waits'))
    const got = await toKey('logout', 'Tab')
    if (got) { await page.keyboard.press('Enter'); await sleep(900) }
    const signIn = await page.locator('#luser').isVisible().catch(() => false)
    L.ok(`${M} 4 from Quals, Logout by keyboard: refused, the Tracker comes forward with its question still up`, got && !signIn && (await page.evaluate(() => window.CURPAGE)) === 'tracker' && !!(await qText(page)),
      `Logout reached: ${got} · sign-in page: ${signIn} · page ${await page.evaluate(() => window.CURPAGE)} · question "${((await qText(page)) || 'none').replace(/\s+/g, ' ').slice(0, 50)}"`)
    await shot(page, S('04', 'logout-refused-tracker-forward'))
  } else L.note(`${M} 4 COULD NOT REACH the Quals tab by keyboard`, touch ? 'the phone bar has no nav tabs (they are in the ☰ drawer)' : '')

  /* ---- 5. Escape answers the question on screen (Cancel: the course stays) ---- */
  if (!(await qText(page))) { await menu(page, 'course', 'delCourse', touch); await waitQ(page) }
  await page.keyboard.press('Escape'); await sleep(400)
  L.ok(`${M} 5 Escape answers the question on screen: it goes, and the course is not deleted`, !(await qText(page)) && (await courses(page)).includes('LO B1'), `question ${await qText(page)} · courses ${j(await courses(page))}`)

  /* ---- 6. a second Delete key press while the delete-ball question is up (Edit chart
     layout): what does the second press do — a second question behind the first? ---- */
  if (!touch) {
    await choose(page, '#courseSel', '26ABSG')
    await menu(page, 'syl', 'arrangeBtn', false)
    await page.locator('#arrTools button', { hasText: '▣ Select' }).first().click(); await sleep(200)
    const box = await page.evaluate(() => { const g = [...document.querySelectorAll('#flowSvg .ball')].find(x => x.dataset.id === 'ACG-01'); const r = g.getBoundingClientRect(); return { x0: r.left - 14, y0: r.top - 10, x1: r.right + 14, y1: r.bottom + 10 } })
    await page.mouse.move(box.x0, box.y0); await page.mouse.down()
    for (let k = 1; k <= 6; k++) await page.mouse.move(box.x0 + (box.x1 - box.x0) * k / 6, box.y0 + (box.y1 - box.y0) * k / 6)
    await page.mouse.up(); await sleep(300)
    const sel = await page.evaluate(() => document.querySelectorAll('#flowSvg circle[stroke-dasharray="3 2"]').length)
    await page.keyboard.press('Delete'); await sleep(400)
    const qa = await qText(page)
    await page.keyboard.press('Delete'); await sleep(400)
    await page.keyboard.press('Escape'); await sleep(400)
    const qb = await qText(page)
    L.ok(`${M} 6 Edit chart layout, ACG-01 selected, Delete → the delete question; Delete AGAIN while it is up, then Escape: no second copy of the question waits behind it`, !qb,
      `selected ${sel} · first "${(qa || 'none').replace(/\s+/g, ' ').slice(0, 50)}" · after Escape: ${qb ? '"' + qb.replace(/\s+/g, ' ').slice(0, 50) + '" — the second Delete press queued the same question again' : 'none'}`)
    if (qb) { await shot(page, S('05', 'second-delete-question')); await page.keyboard.press('Escape'); await sleep(300) }
    L.ok(`${M} 6 …and ACG-01 is still on the chart`, (await page.locator('#flowSvg .ball[data-id="ACG-01"]').count()) === 1, '')
    /* 6b. a line just drawn is selected; switching course asks "discard your edits?" —
       Backspace while that question is up must not act on the chart behind it */
    await page.locator('#arrTools button', { hasText: '╱ Line' }).first().click(); await sleep(200)
    const bd = await page.evaluate(() => { const r = document.getElementById('board').getBoundingClientRect(); return { x: r.left + 60, y: r.top + 60 } })
    await page.mouse.click(bd.x, bd.y); await sleep(200); await page.mouse.click(bd.x + 150, bd.y); await sleep(400)
    const lids = () => page.evaluate(() => new Set([...document.querySelectorAll('#flowSvg [data-lid]')].map(e => e.dataset.lid)).size)
    const n0 = await lids()
    await choose(page, '#courseSel', 'LO B1')
    const ql = await qText(page)
    await page.keyboard.press('Backspace'); await sleep(400)
    const n1 = await lids()
    await shot(page, S('05b', 'backspace-behind-question'))
    L.ok(`${M} 6b a line just drawn (selected), "discard your edits?" up from a course switch, Backspace pressed: the line behind the shade is untouched`, n1 === n0 && !!ql,
      `question "${(ql || 'none').replace(/\s+/g, ' ').slice(0, 60)}" · lines on the chart ${n0} → ${n1}${n1 < n0 ? ' — the Backspace deleted the selected line behind the question' : ''} · question still up: ${!!(await qText(page))}`)
    if (await qText(page)) { await page.click('#dlgOk'); await sleep(800) }   /* discard them and switch */
    await choose(page, '#courseSel', '26ABSG')
    if (await page.locator('#arrTools.on').count()) await menu(page, 'syl', 'arrangeBtn', false)
  }

  /* ---- 7. an Import of a backup holding two charts that already exist: each question
     in turn, nothing skipped that was not chosen ---- */
  const file = tmp(`lo-2a-two-charts-${M}.json`)
  const ex = await exportVia(page, { tick: ['2026', 'Tx 2026'], students: false, file })
  L.note(`${M} 7 File → Export, two charts ticked`, `offered ${ex.offers.join(' / ')} · file charts ${j((ex.json.charts || {}).order)} · "${ex.conf}"`)
  const before = await sylLabels(page)
  const answers = ['alt', 'ok']   /* chart 1: Add as new; chart 2: Replace it */
  let n = 0
  const asked = await importVia(page, file, async (msg, i, pg) => {
    if (/already exists/.test(msg)) return answers[n++] || 'ok'
    if (/Name for the incoming/.test(msg)) { await shot(pg, S('06', 'import-name-question')); return 'ok' }
    if (/Bring in (the )?students|students/i.test(msg) && !/Brought in/.test(msg)) return 'cancel'
    return 'ok'
  })
  const after = await sylLabels(page)
  L.note(`${M} 7 the import's questions, in order, and the answers given`, asked.map(a => `"${a.msg.slice(0, 70)}" → ${a.ans}`).join(' | '))
  const chartQs = asked.filter(a => /already exists/.test(a.msg))
  const final = asked.find(a => /^(Brought in|Nothing was brought in)/.test(a.msg))
  L.ok(`${M} 7 two chart questions, one after the other, each answered as chosen; the closing message skips nothing`, chartQs.length === 2 && /2026/.test(chartQs[0].msg) && /Tx 2026/.test(chartQs[1].msg) && !!final && !/skipped/i.test(final.msg),
    `charts asked: ${chartQs.map(a => a.msg.slice(0, 20)).join(' · ')} · final "${final ? final.msg : 'none'}"`)
  L.ok(`${M} 7 the chart added as new is in the Syllabus list; the replaced one is still there once`, after.map(x => x.replace(/ ✎$/, '')).includes('2026 (new)') && after.filter(x => x.replace(/ ✎$/, '') === 'Tx 2026').length === 1, `before ${j(before)} → after ${j(after)}`)
  await shot(page, S('07', 'after-import'))

  /* ---- 8. on a phone: a finger on Raptor's bar (the ☰) while a question is up ---- */
  if (touch) {
    await menu(page, 'course', 'renCourse', true); await waitQ(page); await sleep(200)
    const bur = await page.evaluate(() => { const r = document.getElementById('burger').getBoundingClientRect(); const hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return { x: r.left + r.width / 2, y: r.top + r.height / 2, hit: hit.tagName.toLowerCase() + '#' + hit.id } })
    await page.touchscreen.tap(bur.x, bur.y); await sleep(500)
    const drawer = await page.evaluate(() => { const d = document.getElementById('drawer'); return !!d && getComputedStyle(d).visibility !== 'hidden' && d.getBoundingClientRect().width > 0 && /open/.test(d.className) })
    L.note(`${M} 8 a finger on the ☰ while the Rename question is up`, `lands on ${bur.hit} · drawer opened: ${drawer} · question still up: ${!!(await qText(page))}`)
    await shot(page, S('08', 'phone-burger-under-shade'))
    if (await qText(page)) { await page.keyboard.press('Escape'); await sleep(300) }
  }

  L.note(`${M} console / page errors`, errors.join(' | ') || 'none')
  allErrors.push(...errors.map(e => M + ': ' + e))
  await browser.close()
}

save('lo-2a-dlg', { rows: L.rows, errors: allErrors })
const fails = L.rows.filter(r => r.pass === false).length
console.log(`\n${fails} FAIL · errors ${JSON.stringify(allErrors)}`)
process.exit(fails ? 1 : 0)
