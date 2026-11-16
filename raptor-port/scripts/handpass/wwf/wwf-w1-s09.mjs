/* wwf w1 scenario 9 — Logic wording. usage: [PHONE=1] [WHO=u] */
import * as H from './wwf-w1-lib.mjs'
const PHONE = process.env.PHONE === '1'
const WHO = process.env.WHO || 'a'
const RUN = process.env.RUN || `s09-${PHONE ? 'p' : 'd'}-${WHO}`
const X = await H.init(RUN, PHONE)
const { say, sleep, row, pic } = X
const w = await X.open({ phone: PHONE, who: WHO })
const { page } = w
const SZ = (PHONE ? 'phone' : 'desktop') + (WHO === 'a' ? ' admin' : ' member')
const step = async (n, f) => { try { return await f() } catch (e) { say('STEP ERROR', n, String(e.message).split('\n')[0]); return null } }
await step('logic', async () => {
  await X.L.go(page, 'logic'); await sleep(1500)
  await pic(w, '01-logic-top')
  const all = await page.evaluate(() => document.body.innerText.replace(/\s+/g, ' '))
  // open every fold
  await page.evaluate(() => document.querySelectorAll('#logic details, [id*=ogic] details').forEach(d => { d.open = true }))
  await sleep(500)
  const full = await page.evaluate(() => document.body.innerText.replace(/\s+/g, ' '))
  const hits = w2 => [...full.matchAll(new RegExp('.{0,70}' + w2 + '.{0,70}', 'gi'))].map(m => m[0])
  const clash = hits('clash'), conflict = hits('conflict'), wrong = hits('wrong seat'), illegal = hits('illegal seat')
  say('clash hits', JSON.stringify(clash)); say('conflict hits', JSON.stringify(conflict).slice(0, 1500)); say('wrong seat hits', JSON.stringify(wrong)); say('illegal seat hits', JSON.stringify(illegal))
  await pic(w, '02-logic-opened')
  row('S9 Logic', SZ, 'open Logic, open every fold, read the whole page for "clash" and "Wrong seat"', 'no "clash" and no "Wrong seat" anywhere; "conflict" used; "Illegal seat" where the seat check is named', `clash ${clash.length}; wrong seat ${wrong.length}; conflict ${conflict.length}; illegal seat ${illegal.length}`, !clash.length && !wrong.length && conflict.length ? 'PASS' : 'FAIL', `w1/${RUN}/02-logic-opened.png`)
  // search box
  const box = page.locator('#logic input[type=search], #logic input[type=text], input[placeholder*="earch"], input[placeholder*="ilter"]').first()
  say('search box', await box.count())
  for (const q of ['conflict', 'clash', 'Illegal seat']) {
    if (!(await box.count())) break
    await box.fill(q); await sleep(700)
    const txt = await page.evaluate(() => { const t = document.body.innerText.replace(/\s+/g, ' '); const i = t.indexOf('Warning'); return t.length + ' chars; ' + t.slice(Math.max(0, i - 200), i + 900) })
    say('search', q, txt)
    await pic(w, `03-search-${q.replace(/\s/g, '_')}`)
  }
  if (await box.count()) { await box.fill('') ; await sleep(400) }
})
await step('settings', async () => {
  say('settings inputs', await page.evaluate(() => [...document.querySelectorAll('select, input')].filter(e => e.offsetWidth).map(e => (e.id || e.name || e.dataset.set || e.className) + '=' + e.value + (e.tagName === 'SELECT' ? ' [' + [...e.options].map(o => o.text).join('|') + ']' : '')).join(' ;; ').slice(0, 2500)))
})
if (WHO === 'a') await step('sc main conflicts', async () => {
  await X.L.go(page, 'logic'); await sleep(1200)
  const pick = () => page.evaluate(() => [...document.querySelectorAll('*')].filter(e => e.children.length === 0 && /^a ground event$/.test(e.innerText?.trim())).map(e => { const r = e.closest('tr,div,li'); return r ? r.outerHTML.slice(0, 600) : '' })[0])
  say('ground event row html', await pick())
  const ctl = page.locator('text=/^a ground event$/').first()
  const rowEl = ctl.locator('xpath=ancestor::*[self::tr or self::div or self::li][1]')
  say('row text', await rowEl.innerText())
  await page.evaluate(() => window.scrollTo(0, 0))
  await rowEl.scrollIntoViewIfNeeded(); await pic(w, '04-scmain-before')
  const kinds = () => page.evaluate(() => [...document.querySelectorAll('.lgset-kinds .lgk')].map(e => e.innerText.replace(/\s+/g, ' ') + (e.className.includes('hard') ? '[red]' : '[amber]')).join(' | '))
  say('six choices before', await kinds())
  await page.locator('button:visible', { hasText: /^Edit$/ }).first().click(); await sleep(600)
  await pic(w, '05-edit-mode')
  const g = page.locator('.lgset-kinds .lgk', { hasText: 'a ground event' }).first()
  await g.scrollIntoViewIfNeeded(); await g.click(); await sleep(700)
  await pic(w, '06-ground-flipped'); say('after flip', await kinds())
  await X.L.go(page, 'editsched'); await sleep(800); await X.L.go(page, 'logic'); await sleep(1000)
  say('after leaving and returning', await kinds())
  await H.reload(X, w, WHO); await X.L.go(page, 'logic'); await sleep(1200)
  say('after reload', await kinds()); await pic(w, '07-after-reload')
  const rs = page.locator('button:visible', { hasText: /Reset/i }).first()
  say('reset button', await rs.count() ? await rs.innerText() : 'none')
  if (await rs.count()) { await rs.click(); await sleep(800); await pic(w, '08-after-reset'); say('after reset', await kinds()) }
})
await X.fin(w)
