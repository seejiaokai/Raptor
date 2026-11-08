// W4 scenario 6: a refusal on a damaged neighbouring week (PC, week). Env: ORIGIN (default 4398), TAG (job|main), SM_DIST
import * as L from './sm-lib.mjs'
const ORIGIN = process.env.ORIGIN || 'http://localhost:4398', TAG = process.env.TAG || 'job'
console.log('sm-w4-s6 v1', TAG, L.DIST)
const OUT = L.outDir('w4')
const res = { tag: TAG }
let W = await L.launch('pc', { origin: ORIGIN })
let page = W.page
let state = null, key = null
try {
  await L.signIn(W)
  const m = await L.fileInput(W, { who: 'Saint', type: 'Meeting', iso: '2026-07-19', iso2: '2026-07-20' })
  res.filed = m && { acc: m.acc, date: m.date, endDate: m.endDate, allday: m.allday }
  await L.goEdit(W)
  await page.getByRole('button', { name: /Jul 20/ }).first().click(); await L.sleep(1500)
  const note = page.locator('[data-txt="dn:0.0"]').first()
  await note.click(); await page.keyboard.type('range closed'); await page.keyboard.press('Tab'); await L.sleep(800)
  await page.locator('#eWeek').click({ position: { x: 5, y: 5 }, force: true }).catch(() => {})
  await L.sleep(600)
  res.noteText = await note.innerText()
  await page.getByRole('button', { name: /Jul 13/ }).first().click(); await L.sleep(1500)
  const keys = await page.evaluate(() => Object.keys(localStorage).filter(k => /weeks\/20-07-2026#/.test(k)))
  res.keys20 = keys
  console.log('keys20', JSON.stringify(keys), 'note', res.noteText)
  if (keys.length) key = keys.sort()[0]
  state = await W.ctx.storageState()
} catch (e) { res.err = String(e).slice(0, 300); console.log('ERR1', res.err) }
await L.closeAll(W)
if (key) {
  W = await L.launch('pc', { origin: ORIGIN, state, init: L.damageInit(key) }); page = W.page
  try {
    try { await L.signIn(W) } catch (e) { console.log('signin note', String(e).slice(0, 120)); await L.sleep(800) }
    await L.goEdit(W)
    res.damaged = await page.evaluate(k => localStorage.getItem(k), key)
    console.log('damaged row now:', JSON.stringify(res.damaged))
    const sun = '#eWeek section.day[data-day="6"]'
    await page.locator(sun).first().scrollIntoViewIfNeeded(); await page.locator(sun + ' [data-pitog="6"]').first().click(); await L.sleep(600)
    res.sunButtons = await page.evaluate(s => [...document.querySelectorAll(s + ' button')].filter(b => b.getBoundingClientRect().height > 0 && /Accept|Reject|Unavail/.test(b.textContent)).map(b => b.textContent.trim()), sun)
    console.log('sunButtons', JSON.stringify(res.sunButtons)); await L.pic(W, OUT, 's6-' + TAG + '-sunday', { sel: sun }); res.sunText = await page.evaluate(s => document.querySelector(s).innerText.replace(/s+/g, ' ').slice(0, 600), sun); console.log('sunText', res.sunText); res.inputsN = await page.evaluate(() => (window.INPUTS || []).filter(r => r.type === 'Meeting').map(r => r.date + '/' + r.endDate + '/' + r.acc))
    const undoState = () => page.evaluate(() => [...document.querySelectorAll('button')].filter(b => /undo/i.test((b.title || '') + (b.getAttribute('aria-label') || '') + b.id) && b.getBoundingClientRect().height > 0).map(b => (b.id || b.title) + ':' + (b.disabled || b.getAttribute('aria-disabled') === 'true' ? 'off' : 'ON')))
    res.undo0 = await undoState()
    const sunRows = () => page.evaluate(s => [...document.querySelectorAll(s + ' .pl-row')].filter(r => r.getBoundingClientRect().height > 0).map(r => r.textContent.replace(/\s+/g, ' ').trim().slice(0, 40)), sun)
    res.rows0 = await sunRows()
    for (const label of ['Accept', 'Reject', 'Unavail']) {
      const b = page.locator(sun + ' button').filter({ hasText: new RegExp(label) }).filter({ visible: true }).first()
      if (!(await b.count())) { res['press_' + label] = 'not offered'; continue }
      await b.scrollIntoViewIfNeeded(); await b.click(); await L.sleep(500)
      const t = await L.toastText(page)
      res['press_' + label] = { toast: t, rows: await sunRows(), undo: await undoState() }
      console.log(label, JSON.stringify(res['press_' + label]))
      await L.pic(W, OUT, `s6-${TAG}-${label}`, { sel: '#toastEl', pad: 40 })
      await L.pic(W, OUT, `s6-${TAG}-${label}-full`, {})
      await L.sleep(3500)
    }
  } catch (e) { res.err2 = String(e).slice(0, 300); console.log('ERR2', res.err2); try { await L.pic(W, OUT, `s6-${TAG}-err`, {}) } catch {} }
  res.errs = W.errs
  await L.closeAll(W)
} else console.log('NO KEY - cannot build fixture')
console.log('RESULT', JSON.stringify(res))
