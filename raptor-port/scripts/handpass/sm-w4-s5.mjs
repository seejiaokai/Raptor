// W4 scenario 5: a two-day meeting, the week, PC. Tap on its line in Tuesday's list opens a folded Personal Inputs and flashes its row.
import * as L from './sm-lib.mjs'
const ORIGIN = 'http://localhost:4398'
console.log('sm-w4-s5 v1', L.DIST)
const OUT = L.outDir('w4')
const W = await L.launch('pc', { origin: ORIGIN })
const { page } = W
const res = {}
const persInfo = () => page.evaluate(() => {
  const h = document.querySelector('#eWeek section.day[data-day="1"] [data-pitog="1"]'); if (!h) return { err: 'no fold header' }
  const sec = h.closest('.sec, .plist'); const rows = [...sec.querySelectorAll('.pl-row')].filter(r => r.getBoundingClientRect().height > 0)
  return { header: h.textContent.trim().slice(0, 40), cls: sec.className, visibleRows: rows.map(r => r.textContent.replace(/\s+/g, ' ').trim().slice(0, 40)) }
})
try {
  await L.signIn(W)
  const m = await L.fileInput(W, { who: 'Saint', type: 'Meeting', iso: '2026-07-13', iso2: '2026-07-14', remarks: 'Safety brief' })
  res.filed = m && { iid: m.iid, acc: m.acc }
  await L.publishDay(W, 1); await L.closeBoard(W)
  // open the meeting's window from the Inputs list and change its remarks
  await L.openInputsList(W)
  await page.getByText('Safety brief', { exact: false }).filter({ visible: true }).first().click(); await page.waitForSelector(L.T('win-inputedit')); await L.sleep(600)
  await page.locator('#inpEditRmk').fill('Safety brief (moved to room 2)'); await L.sleep(200)
  await page.locator('#inpEditSave').click(); await L.sleep(1100)
  for (let i = 0; i < 4; i++) {
    const open = await page.evaluate(() => [...document.querySelectorAll('[data-testid="docconf"], [data-testid="oilconf"]')].filter(e => e.getBoundingClientRect().width).map(e => e.dataset.testid))
    if (!open.length) break
    if (open.includes('docconf')) await page.locator(L.T('docconf-nodoc')).first().click()
    else { await page.locator(L.T('oil-no')).first().click(); await L.sleep(250); await page.locator(L.T('oilconf-save')).first().click() }
    await L.sleep(700)
  }
  res.winOpenAfterSave = await page.evaluate(() => !![...document.querySelectorAll('[data-testid="win-inputedit"]')].find(e => e.getBoundingClientRect().height > 0))
  await L.goEdit(W); await page.evaluate(() => window.scrollTo(0, 0)); await L.sleep(600)
  res.pending = await L.dayPending(page, 1)
  res.pers0 = await persInfo()
  console.log('pers0', JSON.stringify(res.pers0))
  // make sure it is folded: if rows are visible, press the header
  if (res.pers0.visibleRows && res.pers0.visibleRows.length) {
    await page.locator('#eWeek section.day[data-day="1"] [data-pitog="1"]').first().click(); await L.sleep(500)
  }
  res.persFolded = await persInfo()
  console.log('folded', JSON.stringify(res.persFolded))
  await L.pic(W, OUT, 's5-1-folded', { sel: '#eWeek section.day[data-day="1"]' })
  await L.press(W, page.locator('#eWeek section.day[data-day="1"] [data-pendlist="1"]')); await L.sleep(1000)
  res.lines = await page.evaluate(() => [...document.querySelectorAll('.chgwin .pl-item')].filter(e => e.getBoundingClientRect().height > 0).map(e => ({ tag: e.tagName, text: e.textContent.replace(/\s+/g, ' ').trim().slice(0, 60) })))
  console.log('lines', JSON.stringify(res.lines))
  await L.pic(W, OUT, 's5-2-list', { sel: '.chgwin' })
  const line = page.locator('.chgwin .pl-item').filter({ hasText: /Meeting/ }).first()
  res.lineTag = (await line.count()) ? await line.evaluate(e => e.tagName) : 'none'
  if (await line.count()) {
    await L.press(W, line); await L.sleep(1500)
    res.after = await page.evaluate(() => ({ y: Math.round(scrollY), toast: (document.querySelector('#toastEl') || {}).textContent,
      flash: [...document.querySelectorAll('.chgflash')].filter(e => e.getBoundingClientRect().height > 0).map(e => ({ text: e.textContent.replace(/\s+/g, ' ').trim().slice(0, 40), inPers: !!e.closest('.sec-inp'), top: Math.round(e.getBoundingClientRect().top) })) }))
    res.persAfter = await persInfo()
    console.log('after', JSON.stringify(res.after), JSON.stringify(res.persAfter))
    await L.pic(W, OUT, 's5-3-land', { sel: '.chgflash', pad: 40 })
    await L.pic(W, OUT, 's5-3-landfull', {})
  }
  // View-only Sched, Tuesday
  await page.keyboard.press('Escape'); await L.sleep(300)
  await page.evaluate(() => window.go('viewsched')); await L.sleep(1200)
  await page.evaluate(() => window.scrollTo(0, 0))
  const vp = page.locator('#vWeek [data-pendlist]').first()
  res.viewPendlist = await page.evaluate(() => [...document.querySelectorAll('[data-pendlist]')].filter(e => e.getBoundingClientRect().height > 0).map(e => e.getAttribute('data-pendlist') + ':' + e.textContent.trim()))
  console.log('viewPend', JSON.stringify(res.viewPendlist))
  const vb = page.locator('[data-pendlist]').filter({ visible: true }).first(); res.vbCount = await vb.count(); await L.pic(W, OUT, 's5-4-viewonly-day', {})
  if (await vb.count()) {
    await L.press(W, vb); await L.sleep(900)
    res.viewLines = await page.evaluate(() => [...document.querySelectorAll('.chgwin .pl-item')].filter(e => e.getBoundingClientRect().height > 0).map(e => ({ tag: e.tagName, text: e.textContent.replace(/\s+/g, ' ').trim().slice(0, 60) })))
    console.log('viewLines', JSON.stringify(res.viewLines))
    await L.pic(W, OUT, 's5-4-viewonly-list', { sel: '.chgwin' })
  } else { res.viewNote = 'no pending button for Tuesday in View-only Sched'; await L.pic(W, OUT, 's5-4-viewonly', {}) }
} catch (e) { res.err = String(e).slice(0, 300); console.log('ERR', res.err); try { await L.pic(W, OUT, 's5-err', {}) } catch {} }
res.errs = W.errs
console.log('RESULT', JSON.stringify(res))
await L.closeAll(W)
