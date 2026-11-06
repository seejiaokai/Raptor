/* S19 — an ordinary Tracker session, start to finish (D admin; P member Chromium-touch is not needed: P member uses WebKit for the
   shorter round below).  node scripts/handpass/trk1105-walk-s19.mjs */
import { open, back, login, logout, navTo, keys, diffKeys, classify, ocuAny, pair, words, grade, mark, openBall, click, shot, pickDay, exportFile, importFile, answerDialogs, mk, sleep, D, P } from './trk1105-walk-lib.mjs'
console.log('trk1105-walk-s19 v1')
const L = mk('S19')
const winCount = page => page.evaluate(() => [...document.querySelectorAll('.modal, [role=dialog]')].filter(e => e.getBoundingClientRect().width > 100 && getComputedStyle(e).display !== 'none' && getComputedStyle(e).visibility !== 'hidden').length + ([...document.querySelectorAll('div, section')].some(e => /^All events — name, crew/.test(e.textContent.trim().slice(0, 40)) && e.getBoundingClientRect().width > 300 && e.children.length < 6) ? 1 : 0))
const popOpen = page => page.locator('#pop:visible').count()
const { browser, ctx, page, errors } = await open({})
const T = async (name, fn) => { try { await fn() } catch (e) { L.ok(name, 'D', 'admin', false, 'SCRIPT STOP: ' + String(e.message).split('\n').slice(0, 3).join(' ').slice(0, 300)) } }
const k0 = await keys(page)
let studentId = null, added = ''
await T('pick course and student', async () => {
  const opts = await page.locator('#activeSel option').evaluateAll(o => o.map(x => [x.value, x.textContent.trim()]))
  await page.selectOption('#activeSel', opts[1][0]); await sleep(600)
  await page.selectOption('#courseSel', await page.locator('#courseSel').inputValue()); await sleep(300)
  studentId = opts[1][0]
  L.ok('pick a student from the bar dropdown (the course list holds one course)', 'D', 'admin', (await page.locator('#activeSel').inputValue()) === studentId, `student ${opts[1][1]}; courses ${(await page.locator('#courseSel option').allInnerTexts()).join('/')}`, await shot(page, 'S19-1-picked'))
})
await T('+ Add pickers closed each way', async () => {
  const res = {}
  await click(page, '#addStu'); await page.waitForSelector('#dlgModal', { state: 'visible' })
  await page.locator('#dlgModal button:visible', { hasText: /Cancel/i }).first().click(); await sleep(400); res.cancel = (await winCount(page)) === 0
  await click(page, '#addStu'); await sleep(500); await page.mouse.click(40, 400); await sleep(500); res.outside = (await page.locator('#dlgModal:visible').count()) === 0
  if (!res.outside) { await page.keyboard.press('Escape'); await sleep(300) }
  await click(page, '#addStu'); await sleep(500); await page.keyboard.press('Escape'); await sleep(500); res.escape = (await page.locator('#dlgModal:visible').count()) === 0
  if (!res.escape) { await page.locator('#dlgModal button:visible', { hasText: /Cancel/i }).first().click(); await sleep(300) }
  L.ok('+ Add picker closes by Cancel, by a press outside and by Escape', 'D', 'admin', res.cancel && res.outside && res.escape, JSON.stringify(res), await shot(page, 'S19-2-add-closed'))
  await click(page, '#addStu'); await page.waitForSelector('#dlgList .dlg-item'); added = (await page.locator('#dlgList .dlg-item').first().innerText()).trim().split('\n')[0]
  await page.locator('#dlgList .dlg-item').first().click(); await sleep(250)
  if (await page.locator('#dlgOk:visible').count()) await click(page, '#dlgOk'); await sleep(900)
  L.ok('+ Add: the roster man is added and picked', 'D', 'admin', (await page.locator('#activeSel option').allInnerTexts()).some(t => t.trim().toUpperCase().startsWith(added.toUpperCase().slice(0, 4))), `added "${added}"; students ${(await page.locator('#activeSel option').allInnerTexts()).join('/')}`, await shot(page, 'S19-3-added'))
})
await T('course start, marks, pop-up closers', async () => {
  await click(page, '#courseStart'); await pickDay(page, 1, false)
  await mark(page, 'ST-02', 'dco', false)
  await openBall(page, 'ST-01', false); await click(page, '#popFailDate'); await pickDay(page, 3, false); await click(page, '#popFailPlus'); await page.locator('#pop button:has-text("Close")').click(); await sleep(500)
  await mark(page, 'ST-03', 'na', false)
  const r = {}
  await openBall(page, 'ST-02', false); await page.locator('#pop button:has-text("Close")').click(); await sleep(400); r.close = (await popOpen(page)) === 0
  await openBall(page, 'ST-02', false); await page.keyboard.press('Escape'); await sleep(400); r.esc = (await popOpen(page)) === 0
  await openBall(page, 'ST-02', false); await page.mouse.click(1100, 700); await sleep(400); r.outside = (await popOpen(page)) === 0
  if (await popOpen(page)) await page.keyboard.press('Escape')
  L.ok('three marks set (DCO, failure with its date, N.A.); the marking pop-up closes by Close, Escape and a press outside', 'D', 'admin', r.close && r.esc && r.outside && (await grade(page, 'ST-02')) === 'dco' && (await grade(page, 'ST-03')) === 'na', JSON.stringify(r) + ` ST-02 ${await grade(page, 'ST-02')} ST-03 ${await grade(page, 'ST-03')}`, await shot(page, 'S19-4-marks'))
})
await T('windows closed each way', async () => {
  const out = {}
  // down days window (opens from its number)
  await click(page, '#downDays'); await sleep(500); const opened = await winCount(page)
  await page.keyboard.press('Escape'); await sleep(400); out.downEsc = (await winCount(page)) === 0
  await click(page, '#downDays'); await sleep(500); await page.mouse.click(40, 600); await sleep(400); out.downOutside = (await winCount(page)) === 0
  if ((await winCount(page)) > 0) await page.keyboard.press('Escape')
  out.downOpened = opened > 0
  await shot(page, 'S19-5-after-downdays')
  for (const [name, sel] of [['Legend', '#legendBtn'], ['Show All', '#showAllBtn']]) {
    await click(page, sel); await sleep(500)
    const o = (await winCount(page)) > 0
    await page.keyboard.press('Escape'); await sleep(400); const e = (await winCount(page)) === 0
    await click(page, sel); await sleep(500); await page.mouse.click(40, 600); await sleep(400); const x = (await winCount(page)) === 0
    if ((await winCount(page)) > 0) { const c = page.locator('button:visible:has-text("Close")').first(); if (await c.count()) await c.click(); else await page.keyboard.press('Escape'); await sleep(300) }
    out[name] = { opened: o, esc: e, outside: x }
  }
  // Find event
  await page.locator('#hSearch').fill('ST-0'); await sleep(500)
  const listShown = await page.evaluate(() => { const l = document.getElementById('hSearchList'); return !!l && l.getBoundingClientRect().width > 0 })
  await page.keyboard.press('Escape'); await sleep(400)
  out.find = { listShown, clearedByEsc: (await page.locator('#hSearch').inputValue()) === '' }
  const ok = out.downOpened && out.downEsc && out.downOutside && out['Legend'].opened && out['Legend'].esc && out['Legend'].outside && out['Show All'].opened && out['Show All'].esc && out['Show All'].outside && out.find.listShown && out.find.clearedByEsc
  L.ok('down-days window, Legend, Show All and Find event open and close by each of their ways', 'D', 'admin', ok, JSON.stringify(out), await shot(page, 'S19-6-all-closed'))
})
await T('undo/redo from top bar, hide bar, export/import', async () => {
  const g0 = [await grade(page, 'ST-02'), await grade(page, 'ST-03')]
  await click(page, '.topbar #trUndoBtn'); await sleep(500); await click(page, '.topbar #trUndoBtn'); await sleep(500)
  const g1 = [await grade(page, 'ST-02'), await grade(page, 'ST-03')]
  const mid = await pair(page)
  await click(page, '.topbar #trRedoBtn'); await sleep(500)
  const end = await pair(page)
  const g2 = [await grade(page, 'ST-02'), await grade(page, 'ST-03')]
  L.ok('undo two steps and redo one from the top bar (a step is a mark, a date or a pick)', 'D', 'admin', g0.join() !== g1.join() && mid.redoOff === false && end.undoOff === false, `marks before ${g0}; after two undos ${g1}; after one redo ${g2}; redo lit after undos ${!mid.redoOff}; last undo title "${end.title}"`, await shot(page, 'S19-7-undo-redo'))
  await click(page, '#barHideBtn'); await sleep(500); const hid = (await page.locator('#courseSel:visible').count()) === 0; await page.getByText('Show bar').first().click(); await sleep(500)
  L.ok('hide the Tracker bar and show it again', 'D', 'admin', hid && (await page.locator('#courseSel:visible').count()) === 1, `hidden ${hid}`)
  // restore ST-03 for the later checks: redo is gone, set it again
  if ((await grade(page, 'ST-03')) !== 'na') await mark(page, 'ST-03', 'na', false)
  if ((await grade(page, 'ST-02')) !== 'dco') await mark(page, 'ST-02', 'dco', false)
  const f = await exportFile(page, 'S19-export.json')
  await importFile(page, f)
  const dl = await answerDialogs(page, [/^Replace/i, /^Yes/i, /^Import/i, /^OK/i], 9000)
  await sleep(1200)
  L.ok('File Export then File Import of the same file: dialogs answered, chart still drawn, marks still there', 'D', 'admin', (await page.locator('#flowSvg .ball').count()) > 20 && (await grade(page, 'ST-02')) === 'dco', `dialogs ${dl.map(d => d.pressed).join(' > ')}; ST-02 ${await grade(page, 'ST-02')}`, await shot(page, 'S19-8-imported'))
})
await T('away and back, reload, sign out and in', async () => {
  await navTo(page, 'editsched'); await sleep(400); await navTo(page, 'tracker'); await page.waitForSelector('#flowSvg .ball'); await sleep(500)
  await navTo(page, 'inputs'); await sleep(400); await navTo(page, 'tracker'); await sleep(500)
  await page.reload(); await back(page, 'a', false)
  await page.locator('#logout').click(); await sleep(1200)
  if (await page.locator('#dlgModal:visible').count()) await answerDialogs(page, [/^Save/i], 2000)
  await login(page, 'a'); await navTo(page, 'tracker', false); await page.waitForSelector('#flowSvg .ball'); await sleep(800)
  L.ok('Edit Schedule and back, Inputs and back, reload, sign out and in: the Tracker comes back', 'D', 'admin', (await page.evaluate(() => window.CURPAGE)) === 'tracker', '', await shot(page, 'S19-9-after-signin'))
})
await T('the places that should show the result', async () => {
  const stuOpt = await page.locator('#activeSel option:checked').innerText()
  const g = [await grade(page, 'ST-02'), await grade(page, 'ST-03')]
  const csel = await page.locator('#courseSel option').allInnerTexts()
  await openBall(page, 'ST-01', false); const popTxt = (await page.locator('#pop').innerText()); await page.keyboard.press('Escape'); await sleep(300)
  const cs = (await page.locator('#courseStart').innerText()).trim()
  const info = (await page.locator('#page-tracker').innerText())
  L.ok('Tracker after the reload and sign-in: same student, marks (DCO, N.A.), failure date, course start, course list', 'D', 'admin', g[0] === 'dco' && g[1] === 'na' && popTxt.includes('03/11/26') && /1 Nov|Nov/.test(cs) && csel.length >= 1, `student "${stuOpt}"; marks ${g}; pop shows failure 03/11/26 ${popTxt.includes('03/11/26')}; course start "${cs}"; courses ${csel.join('/')}`, await shot(page, 'S19-10-tracker-after'))
  await click(page, '#showAllBtn'); await sleep(700)
  const sa = await page.locator('body').innerText()
  await shot(page, 'S19-11-showall-after'); await page.keyboard.press('Escape'); await sleep(400)
  L.ok("Show All's table lists the events for that student's chart (ST-01 and ST-02 present)", 'D', 'admin', /ST-01/.test(sa) && /ST-02/.test(sa), 'rows present')
  L.ok("the Info panel's Last flown / currency bars are drawn", 'D', 'admin', /Last Flown/i.test(info) && /Landing/i.test(info), 'Info text has Last Flown and Landing currency: ' + (/Last Flown/i.test(info) && /Landing/i.test(info)), await shot(page, 'S19-12-info', { el: '#page-tracker' }))
  // the person's window from the roster
  try {
    await navTo(page, 'quals'); await sleep(900)
    const who = added.split(/\s|\n/)[0]
    const cell = page.getByText(who, { exact: false }).first()
    const has = await cell.count()
    if (has) { await cell.click({ force: true, timeout: 5000 }).catch(() => {}); await sleep(900) }
    const txt = (await page.locator('body').innerText())
    L.ok("the person's window from Quals for the added student: opens; does it name his Tracker course? (recorded)", 'D', 'admin', has > 0, `found "${who}" on Quals ${has}; page text mentions the Tracker course 26ABSG: ${/26ABSG/.test(txt)}; mentions Tracker: ${/Tracker/i.test(txt.replace(/Tracker\n/g, ''))}`, await shot(page, 'S19-13-person-window'))
  } catch (e) { L.ok("the person's window from the roster", 'D', 'admin', null, 'NOT WALKED: ' + String(e.message).split('\n')[0].slice(0, 160)) }
})
await navTo(page, 'tracker', false); await page.waitForSelector('#flowSvg .ball'); await sleep(500)
const kEnd = await keys(page), cl = classify(diffKeys(k0, kEnd))
L.ok('through the whole round: only raptor:tracker/ (and ocuLocal:) keys changed beside the app\'s own; no ocu: key', 'D', 'admin', ocuAny(kEnd).length === 0 && cl.other.length === 0, `tracker ${cl.tracker.length}; ocuLocal ${cl.ocuLocal.length}; appOwn ${cl.appOwn.length}; ocu ${cl.ocu.length}`)
const pr = await pair(page)
L.ok('one pair, top bar only', 'D', 'admin', pr.undo === 1 && pr.redo === 1 && pr.inTop && !pr.inTracker, '')
L.note('errors', errors.join(' | ').slice(0, 500) || 'none')
await browser.close()
L.save('S19d')
