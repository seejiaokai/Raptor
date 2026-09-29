/* D121 — walker c: the member's Tracker is the admin's Tracker (28 Sep 26).
   The same four things walked as the admin (ad/a) and then as a member (us/us), at 1440×900,
   and the two compared: the three ✎ menus and the File menu, the + Add list, a date box that
   refuses a day after today (D374), and a grade. (The member's fold at 844×390 is walked in
   trk-lo-2c-fold.mjs part 3.) Assertions of the right behaviour: nothing differs.

     HP_URL=http://localhost:4175 HP_SHOTS=<dir> HP_OUT=<dir> node scripts/handpass/trk-lo-2c-member.mjs
*/
import { open, shot, save, log, reveal, DESK } from './trk-lib.mjs'
import { typeDate } from './trk-w2-lib.mjs'

const L = log()
const sleep = ms => new Promise(r => setTimeout(r, ms))
const allErrors = []
const todayIso = page => page.evaluate(() => new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Singapore', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date()))
const addDays = (iso, n) => { const d = new Date(iso + 'T00:00:00Z'); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10) }
const out = {}

for (const who of ['a', 'u']) {
  const tag = who === 'a' ? 'admin' : 'member'
  const { browser, page, errors } = await open({ size: DESK, who })
  const r = out[tag] = {}
  r.me = await page.evaluate(() => (document.querySelector('.topbar')?.innerText.match(/[A-Z]+ · (ADMIN|MEMBER)/) || [''])[0])

  /* 1 — the menus, as they open */
  r.menus = {}
  for (const m of ['course', 'syl', 'file']) {
    await page.click(`#${m}MenuBtn`); await sleep(300)
    r.menus[m] = await page.evaluate(m => {
      const b = document.getElementById(m + 'MenuBtn'), box = b.closest('.menu')
      return [...box.querySelectorAll('button, label')].filter(x => x !== b && x.offsetParent).map(x => (x.textContent || '').trim().replace(/\s+/g, ' ')).filter(Boolean)
    }, m)
    if (m === 'file') await shot(page, `lo-2c-m-${tag}-file-menu`)
    await page.keyboard.press('Escape'); await sleep(150)
    if (await page.locator(`#${m}MenuBtn.primary`).count()) { await page.click(`#${m}MenuBtn`); await sleep(150) }
  }

  /* 2 — the + Add list */
  await page.click('#addStu'); await sleep(400)
  r.add = await page.evaluate(() => ({ msg: (document.getElementById('dlgMsg') || {}).textContent, rows: document.querySelectorAll('#dlgList .dlg-item').length, first: [...document.querySelectorAll('#dlgList .dlg-lbl')].slice(0, 3).map(x => x.textContent), filter: !!document.getElementById('dlgFilter'), input: !!document.getElementById('dlgInput') }))
  await shot(page, `lo-2c-m-${tag}-add-list`)
  await page.click('#dlgCancel'); await sleep(300)

  /* 3 — Last Flown (Syllabus): a day after today is refused, put back, and says why (D374) */
  const tomorrow = addDays(await todayIso(page), 1)
  const before = await page.inputValue('#lastSyll')
  const typed = await typeDate(page, '#lastSyll', tomorrow)
  /* leave the box as a person does: Tab until the focus moves on (Chrome's date box walks its
     own parts and its calendar icon first — from the year, the first Tab lands on the icon) */
  for (let i = 0; i < 4 && (await page.evaluate(() => document.activeElement && document.activeElement.id === 'lastSyll')); i++) { await page.keyboard.press('Tab'); await sleep(150) }
  await sleep(400)
  r.refuse = await page.evaluate(() => ({ value: document.getElementById('lastSyll').value, warn: [...document.querySelectorAll('.datewarn')].map(x => x.textContent.trim()).filter(Boolean) }))
  r.refuse.typed = typed; r.refuse.before = before; r.refuse.tomorrow = tomorrow
  await shot(page, `lo-2c-m-${tag}-date-refused`, { el: '.c-curr' }).catch(async () => { await shot(page, `lo-2c-m-${tag}-date-refused`) })

  /* 4 — a grade: ACG-01 DCO for the picked student */
  const done = () => page.evaluate(() => +((document.getElementById('side').innerText.match(/(\d+)\s*\n?\s*DONE/) || [0, -1])[1]))
  const d0 = await done()
  await reveal(page, 'ACG-01')
  const bb = await page.locator('#flowSvg .ball[data-id="ACG-01"]').first().boundingBox()
  await page.mouse.click(bb.x + bb.width / 2, bb.y + bb.height / 2); await sleep(400)
  r.popTitle = ((await page.locator('#popTitle').innerText().catch(() => '')) || '').replace(/\s+/g, ' ').trim()
  await shot(page, `lo-2c-m-${tag}-grade-popup`)
  await page.locator('#pop .opts button', { hasText: 'DCO' }).first().click(); await sleep(500)
  const d1 = await done()
  r.grade = { done: [d0, d1], stored: await page.evaluate(() => window.__undoForTests ? window.__undoForTests().grade('ACG-01') : null), undo: await page.evaluate(() => { const u = document.getElementById('trUndoBtn'); return u ? { off: u.disabled, t: u.title } : null }) }
  await shot(page, `lo-2c-m-${tag}-graded`)

  L.note(`${tag} (${r.me})`, JSON.stringify(r))
  L.ok(`${tag}: the + Add list offers the roster above "Or type a callsign"`, r.add.rows > 10 && r.add.filter && r.add.input, JSON.stringify(r.add))
  L.ok(`${tag}: a day after today in Last Flown (Syllabus) is refused — the box goes back and one line says why`, r.refuse.value === r.refuse.before && r.refuse.warn.some(w => /hasn.t come yet|after today|future/i.test(w)), JSON.stringify(r.refuse))
  L.ok(`${tag}: a press on ACG-01 opens its grading pop-up; DCO grades it (DONE ${d0} → ${d1}) and ↶ can take it back`, /ACG-01/.test(r.popTitle) && d1 === d0 + 1 && r.grade.undo && !r.grade.undo.off, JSON.stringify({ pop: r.popTitle, ...r.grade }))
  L.ok(`${tag}: no console or page error`, errors.length === 0, errors.join(' | '))
  allErrors.push(...errors.map(e => tag + ': ' + e))
  await browser.close()
}

/* the comparison — D121: the same Tracker for everyone */
const A = out.admin, U = out.member
L.ok('D121 the member is signed in as a member (the badge says so)', /MEMBER/.test(U.me) && /ADMIN/.test(A.me), `${A.me} / ${U.me}`)
L.ok('D121 the ✎ Course, ✎ Syllabus and File menus hold the same items for the member as for the admin (File: Import and Export too)', JSON.stringify(A.menus) === JSON.stringify(U.menus) && U.menus.file.some(x => /Import/.test(x)) && U.menus.file.some(x => /Export/.test(x)), JSON.stringify({ admin: A.menus, member: U.menus }))
L.ok('D121 the + Add list is the same length for both', A.add.rows === U.add.rows, `${A.add.rows} / ${U.add.rows}`)
L.ok('D121 the refusal reads the same for both', JSON.stringify(A.refuse.warn) === JSON.stringify(U.refuse.warn), JSON.stringify([A.refuse.warn, U.refuse.warn]))
L.ok('D121 a grade does the same for both', A.grade.done[1] - A.grade.done[0] === U.grade.done[1] - U.grade.done[0] && A.grade.stored === U.grade.stored, JSON.stringify([A.grade, U.grade]))

save('lo-2c-member', { rows: L.rows, out, errors: allErrors })
const fails = L.rows.filter(r => r.pass === false)
console.log(fails.length ? `\n${fails.length} FAIL` : '\nALL PASS')
process.exit(fails.length ? 1 : 0)
