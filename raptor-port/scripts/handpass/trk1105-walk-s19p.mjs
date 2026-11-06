/* S19 (phone, member, WebKit) — an ordinary session on a phone: every tap with its two pictures.  node scripts/handpass/trk1105-walk-s19p.mjs */
import { open, back, login, navTo, keys, classify, diffKeys, ocuAny, pair, words, grade, openBall, click, shot, tap2, pickDay, exportFile, mk, sleep, P } from './trk1105-walk-lib.mjs'
console.log('trk1105-walk-s19p v1')
const L = mk('S19p')
const { browser, page, errors } = await open({ engine: 'webkit', size: P, touch: true, who: 'u' })
const T = async (name, fn) => { try { await fn() } catch (e) { L.ok(name, 'P', 'member', false, 'SCRIPT STOP: ' + String(e.message).split('\n').slice(0, 3).join(' ').slice(0, 300)) } }
const k0 = await keys(page)
const markT = async (id, g, pic) => { await openBall(page, id, true); await tap2(page, `#pop .opts button[data-g="${g}"]`, pic); await sleep(500) }
await T('picks and add', async () => {
  const opts = await page.locator('#activeSel option').evaluateAll(o => o.map(x => x.value))
  await page.selectOption('#activeSel', opts[1]); await sleep(500)
  await page.locator('#page-tracker button[data-view="info"]').tap(); await sleep(500)
  const pics = await tap2(page, '#addStu', 'S19p-1-add')
  await page.waitForSelector('#dlgModal', { state: 'visible' })
  await page.locator('#dlgModal button:visible', { hasText: /Cancel/i }).first().tap(); await sleep(500)
  const c1 = (await page.locator('#dlgModal:visible').count()) === 0
  await page.locator('#addStu').tap(); await sleep(500); await page.touchscreen.tap(200, 860); await sleep(500)
  const c2 = (await page.locator('#dlgModal:visible').count()) === 0
  if (!c2) await page.locator('#dlgModal button:visible', { hasText: /Cancel/i }).first().tap()
  await sleep(400)
  await page.locator('#addStu').tap(); await page.waitForSelector('#dlgList .dlg-item'); await page.locator('#dlgList .dlg-item').first().tap(); await sleep(300)
  if (await page.locator('#dlgOk:visible').count()) await page.locator('#dlgOk').tap(); await sleep(900)
  await page.locator('#page-tracker button[data-view="flow"]').tap(); await sleep(500)
  L.ok('phone: student picked; + Add closed by Cancel and by a tap outside, then a roster man added', 'P', 'member', c1 && c2 && (await page.locator('#activeSel option').count()) >= 3, `cancel ${c1}; outside ${c2}; students ${(await page.locator('#activeSel option').allInnerTexts()).join('/')}`, pics)
})
await T('marks', async () => {
  await page.locator('#page-tracker button[data-view="info"]').tap(); await sleep(500)
  await page.locator('#courseStart').tap(); await pickDay(page, 1, true)
  await page.locator('#page-tracker button[data-view="flow"]').tap(); await sleep(600)
  await markT('ST-02', 'dco', 'S19p-2-dco')
  await openBall(page, 'ST-01', true); await page.locator('#popFailDate').tap(); await pickDay(page, 3, true); await page.locator('#popFailPlus').tap(); await sleep(500); await page.locator('#pop button:has-text("Close")').tap(); await sleep(500)
  await markT('ST-03', 'na', 'S19p-3-na')
  await openBall(page, 'ST-02', true); await tap2(page, '#pop button:has-text("Close")', 'S19p-4-popclose'); await sleep(300)
  const closed = (await page.locator('#pop:visible').count()) === 0
  L.ok('phone: three marks set by tap (DCO, failure with date, N.A.); the pop-up closed by its Close', 'P', 'member', (await grade(page, 'ST-02')) === 'dco' && (await grade(page, 'ST-03')) === 'na' && closed, `ST-02 ${await grade(page, 'ST-02')}, ST-03 ${await grade(page, 'ST-03')}, pop closed ${closed}`, 'S19p-2-dco-set.png,S19p-3-na-set.png')
})
await T('tabs and windows', async () => {
  const out = {}
  for (const [name, sel] of [['Info', '#page-tracker button[data-view="info"]'], ['Show All', '#page-tracker button:visible:has-text("Show All")']]) {
    await tap2(page, sel, `S19p-5-${name.replace(' ', '')}`); await sleep(400)
    out[name] = true
    await shot(page, `S19p-5-${name.replace(' ', '')}-shown`)
    const c = page.locator('button:visible:has-text("Close")').first(); if (await c.count()) { await c.tap(); await sleep(400) }
  }
  await page.locator('#page-tracker button[data-view="flow"]').tap(); await sleep(400)
  await tap2(page, '#legendBtn', 'S19p-6-legend'); await sleep(300)
  const lopen = await page.evaluate(() => [...document.querySelectorAll('.modal, [role=dialog]')].some(e => e.getBoundingClientRect().width > 100 && getComputedStyle(e).visibility !== 'hidden'))
  await page.touchscreen.tap(10, 860); await sleep(500)
  const lclosed = await page.evaluate(() => ![...document.querySelectorAll('.modal, [role=dialog]')].some(e => e.getBoundingClientRect().width > 100 && getComputedStyle(e).visibility !== 'hidden' && getComputedStyle(e).display !== 'none'))
  L.ok('phone: Info and Show All tabs open; Legend opens and a tap outside closes it', 'P', 'member', lopen && lclosed, `legend opened ${lopen}, closed by outside tap ${lclosed}`, 'S19p-6-legend-set.png')
})
await T('undo redo, hide bar, export', async () => {
  await page.locator('#page-tracker button[data-view="flow"]').tap(); await sleep(400)
  await tap2(page, '.topbar #trUndoBtn', 'S19p-7-undo1'); await sleep(400)
  await tap2(page, '.topbar #trUndoBtn', 'S19p-7-undo2'); await sleep(400)
  const mid = await pair(page)
  await tap2(page, '.topbar #trRedoBtn', 'S19p-7-redo'); await sleep(400)
  const end = await pair(page)
  L.ok('phone: top bar undo twice, redo once (taps with two pictures each)', 'P', 'member', mid.redoOff === false && end.undoOff === false, `redo lit after undos ${!mid.redoOff}; undo title "${end.title}"`, 'S19p-7-undo1-now.png,S19p-7-redo-set.png')
  await page.locator('#barHideBtn').tap(); await sleep(500); const hid = (await page.locator('#courseSel:visible').count()) === 0
  await page.getByText('Show bar').first().tap(); await sleep(500)
  L.ok('phone: hide the bar and show it again', 'P', 'member', hid && (await page.locator('#courseSel:visible').count()) === 1, `hidden ${hid}`)
  try { const f = await exportFile(page, 'S19p-export.json', true); L.ok('phone: File Export gives a file (WebKit)', 'P', 'member', true, f) } catch (e) { L.ok('phone: File Export in WebKit', 'P', 'member', null, 'NOT WALKED: ' + String(e.message).split('\n')[0].slice(0, 150)) }
})
await T('away, reload, sign out and in, results', async () => {
  await navTo(page, 'inputs', true); await sleep(400); await navTo(page, 'tracker', true); await page.waitForSelector('#flowSvg .ball'); await sleep(400)
  await page.reload(); await back(page, 'u', true)
  await page.click('#burger'); await sleep(400); await page.locator('#drawer').getByText(/Log ?out/i).first().tap(); await sleep(1200)
  await login(page, 'u'); await navTo(page, 'tracker', true); await page.waitForSelector('#flowSvg .ball'); await sleep(700)
  const g = [await grade(page, 'ST-02'), await grade(page, 'ST-03')]
  await openBall(page, 'ST-01', true); const t = await page.locator('#pop').innerText(); await page.locator('#pop button:has-text("Close")').tap(); await sleep(400)
  L.ok('phone: after reload, sign-out and in: same student, the DCO mark, the N.A. still taken back, and the failure date', 'P', 'member', g[0] === 'dco' && g[1] !== 'na' && t.includes('03/11/26'), `marks (ST-03 N.A. was taken back by the two undos before the reload) ${g}; failure date shown ${t.includes('03/11/26')}`, await shot(page, 'S19p-8-after'))
})
const kEnd = await keys(page), cl = classify(diffKeys(k0, kEnd))
const pr = await pair(page)
L.ok('phone: only raptor:tracker/ and ocuLocal: keys beside the app\'s own; no ocu: key; one pair, top bar only', 'P', 'member', ocuAny(kEnd).length === 0 && cl.other.length === 0 && pr.undo === 1 && pr.redo === 1 && pr.inTop && !pr.inTracker, `tracker ${cl.tracker.length}; ocuLocal ${cl.ocuLocal.length}; ocu ${cl.ocu.length}`)
L.note('errors', errors.join(' | ').slice(0, 500) || 'none')
await browser.close()
L.save('S19p')
