/* [TRK-RETEST-NOTES] C11 — the + Add list follows the squadron roster while it is open
   (the leftovers walk, walker a, 28 Sep 26). Assertions of the RIGHT behaviour: a PASS
   means correct. Order list: Fable's C11, Astra scenario 4. Baseline: trk-lo-00-f-roster
   (the open list kept 58 rows without the new man).
   + Add is opened and LEFT OPEN, a search typed in it; the person reaches Admin → Users
   and adds a new person, comes back, then archives him, comes back.
   How he gets there with the box open: the shade covers Raptor's bar to a pointer, and
   (since this build) Tab / Shift+Tab go round inside the box. The one keyboard way left is
   entering the page from its start — what the browser does after its address bar (F6,
   then Tab): the script puts the keyboard on the page's first control (the first nav tab
   on a desktop, the ☰ on a phone) and walks from there with real Tab / Enter. That one
   focus move is the only thing not done by a key or a press, and it is said so.

     HP_URL=http://localhost:4175 HP_SHOTS=<dir> HP_OUT=<dir> node scripts/handpass/trk-lo-2a-roster.mjs
     LO_ONLY=desk|phone to run one size. */
import { open, save, log, DESK, PHONE, core } from './trk-lib.mjs'
import { sleep, press, qText, waitQ, half, focusAt, shot } from './trk-lo-2a-lib.mjs'

const L = log()
const allErrors = []
const j = o => JSON.stringify(o)

for (const mode of (process.env.LO_ONLY ? [process.env.LO_ONLY] : ['desk', 'phone'])) {
  const touch = mode === 'phone'
  const M = touch ? 'P' : 'D'
  const S = (n, what) => `lo-2a-E${M}${n}-${what}`
  const { browser, page, errors } = await open({ size: touch ? PHONE : DESK, who: 'a', touch })
  const list = () => page.evaluate(() => [...document.querySelectorAll('#dlgList .dlg-item')].map(b => b.querySelector('.dlg-lbl').textContent))
  const boxText = () => page.evaluate(() => { const m = document.getElementById('dlgModal'); return m ? m.innerText.replace(/\s+/g, ' ').slice(0, 220) : '' })
  const toastText = () => page.evaluate(() => { const t = document.getElementById('toastEl'); return t ? t.textContent : '' })

  /* the keyboard's way out of the Tracker with the box open, to Raptor's Admin page */
  const keyboardTo = async pageId => {
    if (touch) {
      await page.focus('#burger')                       /* the page's first control: the ☰ */
      await page.keyboard.press('Enter'); await sleep(500)
      const up = await page.evaluate(() => /open/.test((document.getElementById('drawer') || {}).className || ''))
      if (!up) return 'the drawer did not open'
      await page.locator(`#drawer a[data-page="${pageId}"]`).first().tap()   /* the drawer sits over the shade */
    } else {
      await page.focus('#topnav a:first-of-type')       /* the page's first control: the first nav tab */
      let ok = false
      for (let i = 0; i < 20 && !ok; i++) {
        ok = await page.evaluate(id => { const e = document.activeElement; return !!(e && e.matches && e.matches(`#topnav a[data-page="${id}"]`)) }, pageId)
        if (!ok) { await page.keyboard.press('Tab'); await sleep(40) }
      }
      if (!ok) return 'Tab never reached the ' + pageId + ' tab'
      await page.keyboard.press('Enter')
    }
    await page.waitForFunction(id => window.CURPAGE === id, pageId, { timeout: 5000 }).catch(() => {})
    await sleep(500)
    if (touch && pageId === 'admin') { const cat = page.locator('.adm-cat', { hasText: 'Users' }).first(); if (await cat.count()) { await cat.tap(); await sleep(300) } }
    return ''
  }
  const backToTracker = async () => {
    if (touch) { await press(page, '#burger', true); await sleep(400); await page.locator('#drawer a[data-page="tracker"]').first().tap() }
    else await page.click('#topnav a[data-page="tracker"]')
    await page.waitForFunction(() => window.CURPAGE === 'tracker'); await sleep(700)
  }
  const addPerson = async cs => {
    await page.fill('#accAddCs', cs); await page.fill('#accAddIni', 'ZZ')
    const pilot = await page.evaluate(() => { const o = [...document.querySelectorAll('#accAddSeat option')].find(o => /pilot/i.test(o.textContent)); return o ? o.value : null })
    if (pilot) await page.selectOption('#accAddSeat', pilot)
    const ocu = await page.evaluate(() => { const o = [...document.querySelectorAll('#accAddCat option')].find(o => /OCU/.test(o.textContent)); return o ? o.value : null })
    if (ocu) await page.selectOption('#accAddCat', ocu)
    await press(page, '#accAdd', touch); await sleep(600)
    return toastText()
  }

  /* ---- 1. + Add open, a search typed, left open ---- */
  await half(page, 'info', touch)
  await press(page, '#addStu:visible', touch); await waitQ(page); await sleep(300)
  const l0 = await list()
  await page.locator('#dlgFilter').pressSequentially('ZUL', { delay: 40 })
  L.note(`${M} 1 + Add open: the roster list`, `${l0.length} people · searching "ZUL": ${j(await list())} · "${await boxText()}"`)
  const inside = []
  for (let i = 0; i < 8; i++) { await page.keyboard.press(i % 2 ? 'Shift+Tab' : 'Tab'); await sleep(40); inside.push(await focusAt(page)) }
  L.ok(`${M} 1 Tab / Shift+Tab from the open + Add stay inside it (the door behind the shade is shut)`, inside.every(f => f.inDlg), inside.map(f => f.d).join(' → '))
  await shot(page, S('01', 'add-open-searching'))

  /* ---- 2. to Admin → Users (keyboard from the page's start), add ZULU9, back ---- */
  const why2 = await keyboardTo('admin')
  if (why2) { L.note(`${M} 2 COULD NOT REACH Admin → Users with + Add open`, why2); await browser.close(); continue }
  const t2 = await addPerson('ZULU9')
  L.note(`${M} 2 Admin → Users: Add a person ZULU9 (Pilot, OCU)`, 'toast: ' + t2)
  await shot(page, S('02', 'admin-added-zulu9'))
  await backToTracker()
  const up2 = await qText(page), l2 = await list()
  L.ok(`${M} 2 back on the Tracker: the + Add box is still open, the search "ZUL" kept, and it lists ZULU9 now`, !!up2 && (await page.inputValue('#dlgFilter')) === 'ZUL' && l2.includes('ZULU9'), `box up: ${!!up2} · search "${await page.inputValue('#dlgFilter').catch(() => '-')}" · list ${j(l2)}`)
  await page.fill('#dlgFilter', ''); await sleep(250)
  const l2all = await list()
  L.ok(`${M} 2 …with the search cleared the list has one more person than when it opened`, l2all.length === l0.length + 1, `${l0.length} → ${l2all.length}`)
  await page.locator('#dlgFilter').pressSequentially('ZUL', { delay: 40 })
  await shot(page, S('03', 'open-list-shows-zulu9'))

  /* ---- 3. archive ZULU9 on Admin → Users, back: he has left the open list ---- */
  const why3 = await keyboardTo('admin')
  if (why3) L.note(`${M} 3 COULD NOT REACH Admin → Users the second time`, why3)
  else {
    const row = page.locator('#accList [data-person]', { hasText: 'ZULU9' }).first()
    const pid = await row.getAttribute('data-person').catch(() => null)
    await row.locator('.acc-tap').first().click(); await sleep(300)
    await press(page, '#accEdArchive', touch); await sleep(600)
    L.note(`${M} 3 Admin → Users: ZULU9 (${pid}) archived`, `toast: ${await toastText()} · archived group: ${await page.locator('#accArchToggle').innerText().catch(() => 'none')}`)
    await shot(page, S('04', 'admin-archived-zulu9'))
    await backToTracker()
    const l3 = await list()
    L.ok(`${M} 3 back on the Tracker: the open list no longer offers ZULU9 (Zulu, already on the roster, still matches "ZUL")`, !!(await qText(page)) && !l3.includes('ZULU9') && l3.includes('Zulu'), `list ${j(l3)} · "${await boxText()}"`)
    await shot(page, S('05', 'open-list-zulu9-gone'))
  }

  /* ---- 4. a second new person, then Enter on the sole match picks HIM (by his id) ---- */
  const why4 = await keyboardTo('admin')
  if (!why4) {
    const t4 = await addPerson('ZULU8')
    const pid8 = await page.locator('#accList [data-person]', { hasText: 'ZULU8' }).first().getAttribute('data-person').catch(() => null)
    L.note(`${M} 4 Admin → Users: Add a person ZULU8`, `toast: ${t4} · person ${pid8}`)
    await backToTracker()
    await page.fill('#dlgFilter', ''); await page.locator('#dlgFilter').pressSequentially('ZULU8', { delay: 40 })
    const l4 = await list()
    await page.keyboard.press('Enter'); await sleep(600)
    const r = await core(page, c => c.rosterNow().map(x => ({ name: x.name, pid: x.pid || null })))
    const got = Array.isArray(r) ? r.find(x => /ZULU8/i.test(x.name)) : null
    L.ok(`${M} 4 the open list gained ZULU8; Enter on him (the one left) adds him, linked to that person`, l4.length === 1 && l4[0] === 'ZULU8' && !(await qText(page)) && !!got && got.pid === pid8, `list ${j(l4)} · student ${j(got)} (person ${pid8})`)
    await shot(page, S('06', 'zulu8-added-as-student'))
  } else L.note(`${M} 4 COULD NOT REACH Admin → Users the third time`, why4)

  L.note(`${M} console / page errors`, errors.join(' | ') || 'none')
  allErrors.push(...errors.map(e => M + ': ' + e))
  await browser.close()
}

save('lo-2a-roster', { rows: L.rows, errors: allErrors })
const fails = L.rows.filter(r => r.pass === false).length
console.log(`\n${fails} FAIL · errors ${JSON.stringify(allErrors)}`)
process.exit(fails ? 1 : 0)
