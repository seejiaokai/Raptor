/* [HUMAN-RETEST] Tracker — walker w1, walk J: ROLES and the File menu
   (R2, R3, R4; Astra #12; Fable #33).

   1. A member (us/us): no ⇪ File menu; everything else on the bar is there.
   2. The admin opens ⤓ Export, then flips "view as member" with the ADMIN badge
      (top right): the Export window closes and File disappears; flipping back
      brings File back.
   3. The admin starts an Import whose file asks "Replace it?" several times; at
      the first question he flips to member view — does the import carry on
      writing? (He is still the admin; the note is what happens.) Tried by
      keyboard (Tab to the badge) and by pointer. */
import { open, shot, save, log, DESK, sleep, menu, pickSyl, arrangeOn, arrangeOff, dragBy, drawn, exportVia, importVia, dlgUp, dlgText, tmp } from './trk-w1-lib.mjs'

const L = log()
const FILE = tmp('w1-j-export.json')
const hasFile = page => page.locator('#fileMenuBtn').count().then(n => n > 0)
/* the badge's words are drawn in capitals (CSS); compare them in one case */
const badge = page => page.locator('#roleBadge').innerText().then(t => t.trim().toLowerCase().replace(/^./, c => c.toUpperCase())).catch(() => '?')
const topAtSel = (page, sel) => page.evaluate(sel => {
  const el = document.querySelector(sel); if (!el) return 'no such element'
  const r = el.getBoundingClientRect(), hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2)
  if (!hit) return 'nothing'
  return hit.closest(sel) ? 'the badge itself (pressable)' : `${hit.tagName.toLowerCase()}${hit.id ? '#' + hit.id : ''} is on top of it`
}, sel)
const posOf = (d, id) => (d.balls.find(b => b.id === id) || {}).t

/* ---- 1. a member ---- */
{
  const M = await open({ size: DESK, who: 'u' })
  const bar = await M.page.evaluate(() => [...document.querySelectorAll('#page-tracker header .controls > *')].map(e => (e.id || e.className || e.tagName) + '').join(' · '))
  await shot(M.page, 'w1-14-member-bar')
  L.ok('14: a member has no ⇪ File menu', !(await hasFile(M.page)), `bar: ${bar}`)
  L.ok('14: a member still has the Syllabus ✎ and Course ✎ menus and ✓ Save slot', (await M.page.locator('#sylMenuBtn').count()) && (await M.page.locator('#courseMenuBtn').count()), `badge "${await badge(M.page)}"`)
  await M.browser.close()
}

/* ---- 2. admin: Export open, then the flip ---- */
const A = await open({ size: DESK, who: 'a' })
const pa = A.page
await pa.evaluate(() => { window.showSaveFilePicker = undefined })
await menu(pa, 'file', 'exportBtn'); await pa.waitForSelector('#copyModal', { state: 'visible' })
const cover = await topAtSel(pa, '#roleBadge')
await shot(pa, 'w1-14-admin-export-open')
L.note('14: with the Export window open, at the ADMIN badge', cover)
const bb = await pa.locator('#roleBadge').boundingBox()
await pa.mouse.click(bb.x + bb.width / 2, bb.y + bb.height / 2); await sleep(500)
const afterPress = { badge: await badge(pa), exportOpen: await pa.locator('#copyModal').isVisible().catch(() => false), file: await hasFile(pa) }
L.note('14: after one press on the badge', JSON.stringify(afterPress))
if (afterPress.badge !== 'Member') {                          // the press only closed the window — press again to flip
  await pa.mouse.click(bb.x + bb.width / 2, bb.y + bb.height / 2); await sleep(500)
}
await shot(pa, 'w1-14-flipped-to-member')
L.ok('14 / R4: flipping to member view closes the Export window and hides ⇪ File', (await badge(pa)) === 'Member' && !(await pa.locator('#copyModal').isVisible().catch(() => false)) && !(await hasFile(pa)), `badge ${await badge(pa)}; Export window ${await pa.locator('#copyModal').isVisible().catch(() => false) ? 'OPEN' : 'closed'}; File ${await hasFile(pa) ? 'SHOWN' : 'hidden'}`)
L.ok('14 / R4: the badge itself can be pressed while the Export window is open (the flip closes it)', afterPress.badge === 'Member', afterPress.badge === 'Member' ? 'one press flipped' : 'the first press only closed the Export window (the backdrop covers the badge); a second press flipped')
await pa.click('#roleBadge'); await sleep(500)
await shot(pa, 'w1-14-flipped-back')
L.ok('14 / R4: flipping back to admin brings ⇪ File back', (await badge(pa)) === 'Admin' && await hasFile(pa), `badge ${await badge(pa)}`)

/* ---- 3. the flip in the middle of an Import ---- */
await pickSyl(pa, '2026')
const ex = await exportVia(pa, { tick: 'all', file: FILE })
const filePos = posOf(await drawn(pa), 'ACG-03')
await arrangeOn(pa); await dragBy(pa, 'ACG-03', 150, 0); await arrangeOff(pa)
const movedPos = posOf(await drawn(pa), 'ACG-03')
L.note('14: set-up', `exported ${ex.json.charts.sylcat.length} charts; then moved ACG-03 ${filePos} → ${movedPos} (the file still has ${filePos})`)

/* 3a. keyboard: at the first question, Tab back to the badge and press Enter */
let kbd = null
const askedK = await importVia(pa, FILE, async (msg, i, page) => {
  if (i !== 0) return 'ok'
  const cov = await topAtSel(page, '#roleBadge')
  let reached = false
  for (let k = 0; k < 160 && !reached; k++) { await page.keyboard.press('Shift+Tab'); reached = await page.evaluate(() => document.activeElement && document.activeElement.id === 'roleBadge') }
  if (reached) { await page.keyboard.press('Enter'); await sleep(500) }
  kbd = { cover: cov, reached, badge: await badge(page), file: await hasFile(page), questionStillUp: await page.locator('#dlgModal').isVisible().catch(() => false), q: (await dlgText(page)).slice(0, 60) }
  await shot(page, 'w1-14-import-flipped-by-keyboard')
  return 'ok'
})
L.note('14: at the first "Replace it?" question — keyboard', JSON.stringify(kbd))
L.note('14: the import went on to ask / say', askedK.map(a => `"${a.msg.slice(0, 60)}" → ${a.ans}`).join(' || '))
await pickSyl(pa, '2026')
const posK = posOf(await drawn(pa), 'ACG-03')
L.ok('14: after flipping to member view mid-import, the import STOPS writing (Astra #12 expectation)', !(kbd && kbd.badge === 'Member' && posK === filePos),
  `view as ${await badge(pa)}; 2026 ACG-03 ${posK === filePos ? 'went BACK to the file\'s place — the import kept writing charts in member view' : 'kept the local move'} (${posK}); File menu ${await hasFile(pa) ? 'shown' : 'hidden'}`)
await shot(pa, 'w1-14-after-import-in-member-view')
if ((await badge(pa)) === 'Member') { await pa.click('#roleBadge'); await sleep(500) }

/* 3b. pointer: at the first question, press the badge */
await arrangeOn(pa); await dragBy(pa, 'ACG-03', 150, 0); await arrangeOff(pa)
let ptr = null
const askedP = await importVia(pa, FILE, async (msg, i, page) => {
  if (i !== 0) return 'ok'
  const cov = await topAtSel(page, '#roleBadge')
  const b = await page.locator('#roleBadge').boundingBox()
  await page.mouse.click(b.x + b.width / 2, b.y + b.height / 2); await sleep(500)
  const up = await page.locator('#dlgModal').isVisible().catch(() => false)
  const qAfter = up ? await dlgText(page) : ''
  ptr = { cover: cov, badge: await badge(page), questionStillUp: up, sameQuestion: up && qAfter === msg, questionNow: qAfter.replace(/\s+/g, ' ').slice(0, 70) }
  await shot(page, 'w1-14-import-badge-pressed')
  return ptr.questionStillUp ? 'ok' : 'leave'
})
L.note('14: at the first question — pointer press on the badge', JSON.stringify(ptr))
if (ptr && !ptr.questionStillUp) {
  /* the press answered the question (Cancel via the backdrop); carry on answering what follows */
  for (let i = 0; i < 12; i++) {
    if (!(await dlgUp(pa, 5000))) break
    const m = await dlgText(pa); askedP.push({ msg: m.replace(/\s+/g, ' '), ans: 'ok' })
    await pa.click('#dlgOk'); await sleep(450)
    if (/^(Brought in|Nothing)/.test(m)) break
  }
}
L.note('14: that import then asked / said', askedP.map(a => `"${a.msg.slice(0, 60)}" → ${a.ans}`).join(' || '))
L.note('14: afterwards', `view as ${await badge(pa)}; File ${await hasFile(pa) ? 'shown' : 'hidden'}`)
save('w1-j-roles', { rows: L.rows, kbd, ptr, askedK, askedP, errors: A.errors })
console.log(`errors ${A.errors.length}: ${A.errors.slice(0, 4).join(' | ')}`)
await A.browser.close()
