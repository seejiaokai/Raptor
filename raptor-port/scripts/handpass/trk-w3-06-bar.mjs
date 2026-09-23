/* w3 item 6 — the bar (R96–R99).
   Desktop: the left-to-right order, one row at 1440; ✓ Save changes alone at
   the far right (a structure edit shows it) and the bar the same height with or
   without it; ⌃ hides the bar → the slim strip names the crew member → "Show
   bar" restores; the choice survives a reload (this browser). Find event:
   predictions, more text narrows, ↓ ↑, Enter, click a row, click back in,
   Escape / ✕, a search that finds nothing leaves the chart alone — and the
   PAGE never scrolls while the list walks (R68). Phone: 🔍 opens a full-width
   strip whose list is full width and tappable. */
import { open, shot, save, log, login, toTracker, DESK, PHONE } from './trk-lib.mjs'
import { sleep, menuItem, dlg, box } from './trk-w3-lib.mjs'

const L = log()
const barItems = page => page.evaluate(() => {
  const h = document.querySelector('#page-tracker header'); if (!h) return null
  const vis = el => { const r = el.getBoundingClientRect(); const cs = getComputedStyle(el); return r.width > 0 && r.height > 0 && cs.display !== 'none' && cs.visibility !== 'hidden' }
  const hr = h.getBoundingClientRect()
  const pick = [['Crew', '#activeSel'], ['Course', '#courseSel'], ['Course ✎', '#courseMenuBtn'], ['Syllabus', '#sylSel'], ['Syllabus ✎', '#sylMenuBtn'], ['ⓘ', '#detailsBtn'], ['↶', '#trUndoBtn'], ['↷', '#trRedoBtn'], ['☰ Show All', '#showAllBtn'], ['⇪ File', '#fileMenuBtn'], ['Find', '#hSearch'], ['🔍', '#hSearchBtn'], ['⌃', '#barHideBtn'], ['✓ Save changes', '#saveChanges'], ['status', '#saveStat']]
  const items = pick.map(([n, s]) => { const el = document.querySelector(s); if (!el || !vis(el)) return null; const r = el.getBoundingClientRect(); return { n, x: Math.round(r.left), r: Math.round(r.right), y: Math.round(r.top), h: Math.round(r.height) } }).filter(Boolean)
  return { h: Math.round(hr.height), top: Math.round(hr.top), right: Math.round(hr.right), items }
})
const findState = page => page.evaluate(() => {
  const ul = document.getElementById('hSearchList'); const rows = ul ? [...ul.querySelectorAll('.findrow')] : []
  const on = ul && ul.querySelector('.findrow.on')
  const ring = [...document.querySelectorAll('#flowSvg circle.found')].map(c => c.closest('.ball') && c.closest('.ball').dataset.id)
  return { value: (document.getElementById('hSearch') || {}).value, stat: (document.getElementById('hSearchStat') || {}).textContent, listShown: !!ul && ul.classList.contains('on'), rows: rows.length, first: rows.slice(0, 4).map(r => r.dataset.id), lit: on ? on.dataset.id : null, ring, pageY: Math.round(window.scrollY), boardTop: document.getElementById('board').scrollTop }
})

/* ---------------- desktop ---------------- */
{
  const { browser, page, errors } = await open({ size: DESK, who: 'a' })
  let b0 = await barItems(page)
  const order = b0.items.map(i => i.n).join(' · ')
  const want = 'Crew · Course · Course ✎ · Syllabus · Syllabus ✎ · ⓘ · ↶ · ↷ · ☰ Show All · ⇪ File · Find · ⌃ · status'
  L.ok('desk: the bar reads left to right as ruled', order === want, order)
  const ys = b0.items.map(i => i.y + i.h / 2); const oneRow = Math.max(...ys) - Math.min(...ys) < 12
  L.ok('desk: one row at 1440', oneRow, `header ${b0.h}px; centres ${Math.min(...ys)}–${Math.max(...ys)}`)
  await shot(page, 'w3-06-desk-bar', { el: '#page-tracker header' })
  /* a structure edit: arrange → + Test → Done editing (no Save) */
  await menuItem(page, 'syl', 'arrangeBtn')
  await page.locator('#arrTools button', { hasText: '+ Test' }).click(); await sleep(300)
  await dlg(page, { value: 'W3-T1' }); await sleep(400)
  await menuItem(page, 'syl', 'arrangeBtn')
  const b1 = await barItems(page)
  const save1 = b1.items.find(i => i.n === '✓ Save changes')
  L.ok('desk: a structure edit shows ✓ Save changes', !!save1, JSON.stringify(save1))
  const lastLeft = Math.max(...b1.items.filter(i => !['✓ Save changes', 'status'].includes(i.n)).map(i => i.r))
  L.ok('desk: …alone at the far right (a gap after ⌃, nothing to its right but the status)', save1 && save1.x - lastLeft > 100 && b1.right - save1.r < 140, `⌃ ends at ${lastLeft}, Save ${save1 && save1.x}–${save1 && save1.r}, bar ends ${b1.right}`)
  L.ok('desk: the bar is the same height with and without it', b1.h === b0.h, `${b0.h} → ${b1.h}`)
  const moved = b0.items.filter(i => i.n !== 'status').filter(i => { const j = b1.items.find(k => k.n === i.n); return !j || j.x !== i.x || j.y !== i.y }).map(i => i.n)
  L.ok('desk: no other control moved when it appeared', !moved.length, moved.join(', ') || 'none moved')
  L.note('desk: the status beside it', await page.locator('#saveStat').innerText())
  await shot(page, 'w3-06-desk-bar-save', { el: '#page-tracker header' })
  await page.click('#saveChanges'); await sleep(500)
  const b2 = await barItems(page)
  L.ok('desk: after saving, the button goes and the bar keeps its height', !b2.items.find(i => i.n === '✓ Save changes') && b2.h === b0.h, `${b2.h}px · status "${await page.locator('#saveStat').innerText()}"`)

  /* ⌃ hides the bar */
  const board0 = await box(page, '#board')
  await page.click('#barHideBtn'); await sleep(400)
  const strip = await page.locator('#barShowBtn').innerText().catch(() => '')
  const board1 = await box(page, '#board')
  L.ok('desk: ⌃ hides the bar; a slim strip names the crew member and offers "Show bar"', !(await page.locator('#page-tracker header').count()) && /STUDENT A/.test(strip) && /Show bar/.test(strip), strip.replace(/\s+/g, ' '))
  L.ok('desk: the chart grows into the space', board1.h > board0.h, `${board0.h} → ${board1.h}px`)
  await shot(page, 'w3-06-desk-bar-hidden')
  /* reload: the choice is this browser's */
  await page.reload(); await login(page, 'a'); await toTracker(page)
  L.ok('desk: hidden survives a reload (sign in again, back on the Tracker: still the strip)', await page.locator('#barShowBtn').isVisible().catch(() => false), '')
  await page.click('#barShowBtn'); await sleep(400)
  L.ok('desk: "Show bar" brings the bar back', await page.locator('#page-tracker header').isVisible(), '')
  await page.reload(); await login(page, 'a'); await toTracker(page)
  L.ok('desk: shown survives a reload too', await page.locator('#page-tracker header').isVisible() && !(await page.locator('#barShowBtn').count()), '')

  /* Find event */
  await page.click('#hSearch'); await page.keyboard.type('ST', { delay: 30 }); await sleep(400)
  let f = await findState(page)
  L.ok('desk Find: typing "ST" lists the matches under the box, the first ringed and lit', f.listShown && f.rows > 5 && f.lit === f.first[0] && f.ring[0] === f.lit, JSON.stringify(f))
  await shot(page, 'w3-06-desk-find-ST')
  await page.keyboard.type('-1', { delay: 30 }); await sleep(400)
  const f2 = await findState(page)
  L.ok('desk Find: more text narrows it ("ST-1")', f2.rows > 0 && f2.rows < f.rows, `${f.rows} → ${f2.rows}: ${f2.first.join(',')}`)
  await page.keyboard.press('ArrowDown'); await sleep(300); await page.keyboard.press('ArrowDown'); await sleep(300)
  const f3 = await findState(page)
  L.ok('desk Find: ↓ ↓ moves the ring and the lit row together', f3.lit === f2.first[2] && f3.ring[0] === f3.lit, JSON.stringify({ lit: f3.lit, ring: f3.ring, stat: f3.stat }))
  await page.keyboard.press('ArrowUp'); await sleep(300)
  const f4 = await findState(page)
  L.ok('desk Find: ↑ moves back', f4.lit === f2.first[1] && f4.ring[0] === f4.lit, JSON.stringify({ lit: f4.lit, ring: f4.ring }))
  await page.keyboard.press('Enter'); await sleep(300)
  const f5 = await findState(page)
  L.ok('desk Find: Enter walks forward', f5.lit === f2.first[2] || f5.ring[0] === f2.first[2], JSON.stringify({ lit: f5.lit, ring: f5.ring, stat: f5.stat }))
  /* click a row */
  const row = page.locator('#hSearchList .findrow').nth(0)
  const rowId = await row.getAttribute('data-id')
  await row.click(); await sleep(400)
  const f6 = await findState(page)
  L.ok('desk Find: clicking a row rings that ball, keeps the text, shuts the list', f6.ring[0] === rowId && f6.value === 'ST-1' && !f6.listShown, JSON.stringify(f6))
  await page.click('#hSearch'); await sleep(300)
  L.ok('desk Find: clicking back in reopens the list', (await findState(page)).listShown, '')
  /* the page never scrolls while a long list is walked */
  await page.keyboard.press('Control+A'); await page.keyboard.type('A', { delay: 30 }); await sleep(400)
  const fa = await findState(page)
  for (let i = 0; i < 40; i++) { await page.keyboard.press('ArrowDown'); await sleep(40) }
  await sleep(300)
  const fb = await findState(page); const hdr = await box(page, '#page-tracker header')
  L.ok('desk Find: walking 40 rows down a long list ("A") never scrolls the PAGE', fb.pageY === 0 && hdr && hdr.y > 0, `${fa.rows} rows; page scrollY ${fb.pageY}; bar top ${hdr && hdr.y}`)
  await shot(page, 'w3-06-desk-find-long-list')
  await page.keyboard.press('Escape'); await sleep(300)
  const f7 = await findState(page)
  L.ok('desk Find: Escape clears it (text, ring, list)', !f7.value && !f7.ring.length && !f7.listShown, JSON.stringify(f7))
  await page.click('#hSearch'); await page.keyboard.type('ACG-0', { delay: 30 }); await sleep(300)
  await page.click('#hSearchClear'); await sleep(300)
  const f8 = await findState(page)
  L.ok('desk Find: ✕ clears it', !f8.value && !f8.ring.length, JSON.stringify(f8))
  /* a search that finds nothing leaves the chart alone */
  await page.keyboard.type('ST-05', { delay: 30 }); await sleep(400)
  const before = await findState(page)
  await page.keyboard.type('ZZ', { delay: 30 }); await sleep(400)
  const none = await findState(page)
  L.ok('desk Find: a search that finds nothing leaves the chart where it was (ring and scroll kept) and says "no match"', none.stat === 'no match' && none.boardTop === before.boardTop && JSON.stringify(none.ring) === JSON.stringify(before.ring), JSON.stringify({ before: { ring: before.ring, top: before.boardTop }, after: { ring: none.ring, top: none.boardTop, stat: none.stat, list: none.listShown } }))
  await shot(page, 'w3-06-desk-find-nomatch')
  L.note('desk errors', errors.join(' | ') || 'none')
  await browser.close()
}

/* ---------------- phone ---------------- */
{
  const { browser, page, errors } = await open({ size: PHONE, who: 'a', touch: true })
  const t = await box(page, '#hSearchBtn')
  await page.touchscreen.tap(t.x + t.w / 2, t.y + t.h / 2); await sleep(400)
  const panel = await box(page, '#hSearchPanel')
  L.ok('phone: 🔍 opens a full-width strip under the bar', panel && panel.w >= 360, JSON.stringify(panel))
  await page.keyboard.type('ACG', { delay: 40 }); await sleep(400)
  const list = await box(page, '#hSearchList')
  L.ok('phone: its list is full width', list && list.w >= 340, JSON.stringify(list))
  await shot(page, 'w3-06-phone-find')
  const row = page.locator('#hSearchList .findrow').nth(3); const rid = await row.getAttribute('data-id'); const rb = await row.boundingBox()
  await page.touchscreen.tap(rb.x + rb.width / 2, rb.y + rb.height / 2); await sleep(500)
  const f = await findState(page)
  L.ok('phone: a tap on a row rings that ball and shuts the list (keyboard away)', f.ring[0] === rid && !f.listShown, JSON.stringify({ rid, ring: f.ring, list: f.listShown, focus: await page.evaluate(() => document.activeElement && document.activeElement.id) }))
  await shot(page, 'w3-06-phone-find-picked')
  L.note('phone errors', errors.join(' | ') || 'none')
  await browser.close()
}
save('w3-06-bar', { rows: L.rows })
