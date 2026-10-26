// Walker 2 of the Leave War M2 bug check: section B (16-22, an HO's half) and section C (23-32, the Available / Required rows).
// Every step asserts the RIGHT behaviour: a PASS means the screen did the right thing. Run: node lw-m2-walk-2.mjs <B|C|all>
import { newCtx, signIn, T, cellId, press, undo, redo, closeAny, vis, has, txt, shot, cellShot, clipShot, boxes, bid, results, rec, errs, saveResults, closeBrowser, PLAIN, URL } from './lw-m2-walk-2-lib.mjs'
console.log('lw-m2-walk-2 v1 (build fcddf90f4 on :4173)')
const which = process.argv[2] || 'all'
const who = 'stiff' // Saber, the admin's own row
class Asserts {
  constructor() { this.items = [] }
  ok(cond, note) { this.items.push({ pass: !!cond, note }); return !!cond }
  get pass() { return this.items.length > 0 && this.items.every(i => i.pass) }
  get saw() { return this.items.map(i => (i.pass ? '✓ ' : '✗ ') + i.note).join('; ') }
}
async function scenario(id, size, role, did, fn) {
  const A = new Asserts(); const pics = []
  try { const r = await fn(A, pics); if (r && r.notRun) { rec(id, size, role, 'NOT RUN', did, r.notRun, pics); return } }
  catch (e) { A.ok(false, 'script stopped: ' + String(e.message).split('\n')[0]); try { await shot(globalThis.__page, 'fail-s' + id + '-' + size); pics.push('fail-s' + id + '-' + size) } catch {} }
  rec(id, size, role, A.pass ? 'PASS' : 'FAIL', did, A.saw, pics)
}
const classes = b => (b ? b.map(x => x.cls) : null)
const topOf = b => b.find(x => /\b(top|right-am)\b/.test(x.cls)), botOf = b => b.find(x => /\b(bot|right-pm)\b/.test(x.cls))
const isHO = x => /k-oil/.test(x.cls) && x.text === 'HO'
const hoOf = b => b.find(isHO)
const D = { d1: '2026-10-27', d2: '2026-10-28', d3: '2026-10-29', d4: '2026-10-26' }

/* ---- B. an HO's half (D1164) ---------------------------------------------------------------------------------- */
async function oilPanelOpen(c, person, iso) {
  await press(c, T(cellId(person, iso)))
  await c.page.waitForSelector(T('bid-picker'), { timeout: 4000 })
  await press(c, T('bid-oil'))
  await c.page.waitForSelector(T('oil-days'))
}
const halfState = page => page.evaluate(() => ({
  row: !!document.querySelector('[data-testid="oil-half-am"]'),
  am: document.querySelector('[data-testid="oil-half-am"]')?.classList.contains('on') ?? null,
  pm: document.querySelector('[data-testid="oil-half-pm"]')?.classList.contains('on') ?? null,
}))
async function sectionB(size) {
  const c = await newCtx(size, 'B-' + size)
  const page = c.page, pre = `s16-${size}-`; globalThis.__page = page
  await signIn(page, 'admin')
  // ---- 16
  await scenario(16, size, 'admin', `Saber: AM leave on Tue 27 Oct; +OIL 0.5 (Half row, PM lit) and Save; empty Wed 28 Oct +OIL 0.5 (AM lit) and Save; Thu 29 Oct +OIL 1 (no Half row) and Save`, async (A, pics) => {
    await bid(c, who, D.d1, 'LL', 'am')
    const b0 = await boxes(page, who, D.d1)
    A.ok(b0 && b0.length === 1 && topOf(b0), `AM leave placed on 27 Oct: ${JSON.stringify(classes(b0))}`)
    await oilPanelOpen(c, who, D.d1)
    const head = await page.evaluate(() => (document.querySelector('[data-testid="bid-picker"]')?.innerText || '').split('\n').slice(0, 3).join(' '))
    A.ok(true, 'NOTE (not in the scenario): the bid window for a half-day leave is headed "' + head + '" — the old arrow print "<LL" is still there')
    await page.fill(T('oil-days'), '0.5'); await page.waitForTimeout(250)
    let h = await halfState(page)
    A.ok(h.row && h.pm === true && h.am === false, `day with an AM leave, 0.5 typed: Half row shown=${h.row}, AM lit=${h.am}, PM lit=${h.pm} (want PM only)`)
    await shot(page, pre + 'a-half-row-pm-lit'); pics.push(pre + 'a-half-row-pm-lit')
    await press(c, T('oil-give')); await page.waitForTimeout(450)
    let b = await boxes(page, who, D.d1)
    const ho = b && hoOf(b)
    A.ok(ho && /\b(bot|right-pm)\b/.test(ho.cls) && ho.h < 0.7, `saved HO drawn bottom half: ${JSON.stringify(ho)}`)
    A.ok(b && b.some(x => /k-ll/.test(x.cls) && /\b(top|right-am)\b/.test(x.cls)), `the AM leave kept the top half`)
    await cellShot(page, who, D.d1, pre + 'b-ho-bottom-half'); pics.push(pre + 'b-ho-bottom-half')
    // empty day
    await oilPanelOpen(c, who, D.d2)
    await page.fill(T('oil-days'), '0.5'); await page.waitForTimeout(250)
    h = await halfState(page)
    A.ok(h.row && h.am === true && h.pm === false, `empty day, 0.5: AM lit=${h.am}, PM lit=${h.pm} (want AM only)`)
    await shot(page, pre + 'c-empty-day-am-lit'); pics.push(pre + 'c-empty-day-am-lit')
    await press(c, T('oil-give')); await page.waitForTimeout(450)
    b = await boxes(page, who, D.d2); const ho2 = b && hoOf(b)
    A.ok(ho2 && /\b(top|right-am)\b/.test(ho2.cls), `saved HO on the empty day drawn top half: ${JSON.stringify(ho2)}`)
    await cellShot(page, who, D.d2, pre + 'd-ho-top-half'); pics.push(pre + 'd-ho-top-half')
    // type 1
    await oilPanelOpen(c, who, D.d3)
    await page.fill(T('oil-days'), '0.5'); await page.waitForTimeout(150)
    const had = (await halfState(page)).row
    await page.fill(T('oil-days'), '1'); await page.waitForTimeout(250)
    h = await halfState(page)
    A.ok(had && !h.row, `typing 0.5 shows the Half row (${had}); typing 1 takes it away (row now ${h.row})`)
    A.ok(/Give FO/.test(await txt(page, T('oil-give'))), `the give button reads: ${await txt(page, T('oil-give'))}`)
    await shot(page, pre + 'e-one-day-no-half-row'); pics.push(pre + 'e-one-day-no-half-row')
    await press(c, T('oil-give')); await page.waitForTimeout(450)
    b = await boxes(page, who, D.d3); const fo = b && b.find(x => x.text === 'FO')
    A.ok(fo && !/\b(top|bot|right-am|right-pm)\b/.test(fo.cls) && fo.h >= 0.75, `FO drawn as a whole box: ${JSON.stringify(fo)}`)
    await cellShot(page, who, D.d3, pre + 'f-fo-whole-box'); pics.push(pre + 'f-fo-whole-box')
  })
  // ---- 19
  await scenario(19, size, 'admin', `Mon 26 Oct: whole-day leave plus an HO (morning); tap the day for its list; Edit…, AM to PM, Save; Undo; Redo; read the list line`, async (A, pics) => {
    const p = `s19-${size}-`
    await bid(c, who, D.d4, 'LL')
    await oilPanelOpen(c, who, D.d4)
    await page.fill(T('oil-days'), '0.5'); await press(c, T('oil-give')); await page.waitForTimeout(450)
    const b00 = await boxes(page, who, D.d4)
    A.ok(b00 && b00.length === 2, 'whole-day leave + HO on 26 Oct: ' + JSON.stringify(b00 && b00.map(x => x.cls + ' x' + x.x + ' y' + x.y + ' w' + x.w + ' h' + x.h)))
    await cellShot(page, who, D.d4, p + 'z-whole-plus-ho'); pics.push(p + 'z-whole-plus-ho')
    await press(c, T(cellId(who, D.d4))); await page.waitForTimeout(500)
    const dl = await vis(page, T('daylist'))
    A.ok(dl, "a tap on a day holding two records opens the day's list (daylist visible=" + dl + ", bid window visible=" + (await vis(page, T('bid-picker'))) + ")")
    if (!dl) return
    const line0 = await txt(page, T('daylist'))
    A.ok(/HO — OIL award, morning/.test(line0), `list line before: "${line0.slice(0, 110)}"`)
    const edit = await page.locator('[data-testid^="dl-oil-edit-"]').first().getAttribute('data-testid')
    const id = edit.replace('dl-oil-edit-', '')
    await press(c, T(edit)); await page.waitForTimeout(250)
    const am = await page.locator(T(`oil-edit-half-${id}-am`)).evaluate(e => e.classList.contains('on')).catch(() => null)
    A.ok(am === true, `the editor opens with the award's own half lit (AM lit=${am})`)
    await press(c, T(`oil-edit-half-${id}-pm`)); await page.waitForTimeout(200)
    await shot(page, p + 'a-editor-pm-picked'); pics.push(p + 'a-editor-pm-picked')
    await press(c, T(`oil-edit-save-${id}`)); await page.waitForTimeout(500)
    let b = await boxes(page, who, D.d4); let ho = b && hoOf(b)
    A.ok(ho && /\b(bot|right-pm)\b/.test(ho.cls), `after Save the box moved to the bottom half: ${JSON.stringify(ho)}`)
    const line1 = await txt(page, T('daylist')).catch(() => null)
    A.ok(line1 && /HO — OIL award, afternoon/.test(line1), `list line after: "${(line1 || '').slice(0, 110)}"`)
    await shot(page, p + 'b-after-save-list'); pics.push(p + 'b-after-save-list')
    await closeAny(c); await page.waitForTimeout(200)
    await undo(c); b = await boxes(page, who, D.d4); ho = b && hoOf(b)
    A.ok(ho && /\b(top|right-am)\b/.test(ho.cls), `Undo moved it back to the top half: ${JSON.stringify(ho)}`)
    await cellShot(page, who, D.d4, p + 'c-undo-top'); pics.push(p + 'c-undo-top')
    await redo(c); b = await boxes(page, who, D.d4); ho = b && hoOf(b)
    A.ok(ho && /\b(bot|right-pm)\b/.test(ho.cls), `Redo put it back in the bottom half: ${JSON.stringify(ho)}`)
    await cellShot(page, who, D.d4, p + 'd-redo-bottom'); pics.push(p + 'd-redo-bottom')
    const ub = await page.locator('#undoBtn').getAttribute('title').catch(() => null)
    A.ok(true, `Undo button's title after the half pick: "${ub}"`)
  })
  await closeAny(c)
  // ---- 17
  await scenario(17, size, 'admin', `OIL tab: select Ranger and Saber together (Saber holds an AM leave on today, Fri 23 Oct; Ranger nothing), 0.5: look at the Half chips; Save; then Drifter alone, 0.5, press PM, Save`, async (A, pics) => {
    const p = `s17-${size}-`
    const today = '2026-10-23'
    await bid(c, who, today, 'LL', 'am')
    await press(c, T('oil-tracker')); await page.waitForSelector(T('oil-sheet')); await page.waitForTimeout(500)
    const bn = await page.locator(T('oil-name-bane')).boundingBox(), st = await page.locator(T('oil-name-stiff')).boundingBox()
    if (c.phone) {
      // a finger held then dragged down the names
      const cdp = await c.ctx.newCDPSession(page)
      const x = bn.x + 30
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y: bn.y + bn.height / 2, id: 1 }] })
      await page.waitForTimeout(450)
      for (let i = 1; i <= 4; i++) { await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x, y: bn.y + bn.height / 2 + (st.y - bn.y) * i / 4, id: 1 }] }); await page.waitForTimeout(50) }
      await page.waitForTimeout(120)
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
      await page.waitForTimeout(400)
    } else {
      await page.mouse.move(bn.x + 30, bn.y + bn.height / 2); await page.mouse.down()
      for (let i = 1; i <= 5; i++) { await page.mouse.move(bn.x + 30, bn.y + bn.height / 2 + (st.y - bn.y) * i / 5); await page.waitForTimeout(40) }
      await page.mouse.up(); await page.waitForTimeout(400)
    }
    const who2 = await txt(page, T('oil-credit-who')).catch(() => null)
    A.ok(who2 && /2/.test(who2) || (who2 && /Ranger/.test(who2) && /Saber/.test(who2)), `the credit bar names the picked people: "${who2}"`)
    await page.fill(T('oil-reason'), 'walk 2'); await page.fill(T('oil-amt'), '0.5'); await page.waitForTimeout(250)
    let h = await halfState(page)
    A.ok(h.row && h.am === false && h.pm === false, `two people with different defaults, 0.5 typed: AM lit=${h.am}, PM lit=${h.pm} (want neither)`)
    await shot(page, p + 'a-two-people-neither-lit'); pics.push(p + 'a-two-people-neither-lit')
    await press(c, T('oil-credit-save')); await page.waitForTimeout(500)
    const err = await txt(page, T('oil-credit-err')).catch(() => null)
    A.ok(!err, `Save without picking raised no refusal (${err})`)
    await shot(page, p + 'b-after-save'); pics.push(p + 'b-after-save')
    await press(c, T('oil-close')); await page.waitForTimeout(400)
    let sb = await boxes(page, who, today), bb = await boxes(page, 'bane', today)
    A.ok(sb && hoOf(sb) && /\b(bot|right-pm)\b/.test(hoOf(sb).cls), `Saber (AM leave) took the PM: ${JSON.stringify(sb && hoOf(sb))}`)
    A.ok(bb && hoOf(bb) && /\b(top|right-am)\b/.test(hoOf(bb).cls), `Ranger (no leave) took the AM: ${JSON.stringify(bb && hoOf(bb))}`)
    await cellShot(page, who, today, p + 'c-saber-cell'); await cellShot(page, 'bane', today, p + 'd-ranger-cell'); pics.push(p + 'c-saber-cell', p + 'd-ranger-cell')
    // one person, PM
    await press(c, T('oil-tracker')); await page.waitForSelector(T('oil-sheet')); await page.waitForTimeout(400)
    await press(c, T('oil-name-slipway')); await page.waitForSelector(T('oil-amt'))
    await page.fill(T('oil-reason'), 'walk 2 single'); await page.fill(T('oil-amt'), '0.5'); await page.waitForTimeout(200)
    h = await halfState(page)
    A.ok(h.row && h.am === true && h.pm === false, `one person with no leave: the default AM is lit (AM=${h.am}, PM=${h.pm})`)
    await press(c, T('oil-half-pm')); await page.waitForTimeout(150)
    h = await halfState(page)
    A.ok(h.pm === true && h.am === false, `after pressing PM: AM lit=${h.am}, PM lit=${h.pm}`)
    await shot(page, p + 'e-single-pm-picked'); pics.push(p + 'e-single-pm-picked')
    await press(c, T('oil-credit-save')); await page.waitForTimeout(500)
    await press(c, T('oil-close')); await page.waitForTimeout(400)
    const sl = await boxes(page, 'slipway', today)
    A.ok(sl && hoOf(sl) && /\b(bot|right-pm)\b/.test(hoOf(sl).cls), `Drifter's HO saved in the PM, bottom half: ${JSON.stringify(sl && hoOf(sl))}`)
    await cellShot(page, 'slipway', today, p + 'f-drifter-cell'); pics.push(p + 'f-drifter-cell')
  })
  await closeAny(c)
  // ---- 18
  await scenario(18, size, 'admin', `OIL tracker editor on Thu 29 Oct's FO (Saber): amount to 0.5, half untouched, Save; then 0.5 back to 1`, async (A, pics) => {
    const p = `s18-${size}-`
    await press(c, T('oil-tracker')); await page.waitForSelector(T('oil-sheet')); await page.waitForTimeout(500)
    // the entry of Saber's FO of 29 Oct: Saber's row, the box whose date reads 29 Oct
    const entry = await page.evaluate(() => {
      const row = document.querySelector('[data-testid="oil-row-stiff"]'); if (!row) return null
      const es = [...row.querySelectorAll('[data-testid^="oil-entry-"]')]
      const hit = es.find(e => /29 Oct/.test(e.innerText)); return hit ? hit.dataset.testid : (es.map(e => e.dataset.testid + '|' + e.innerText.replace(/\s+/g, ' ')).join(' ## '))
    })
    A.ok(entry && entry.startsWith('oil-entry-'), `found Saber's 29 Oct entry in the tracker: ${entry}`)
    if (!entry || !entry.startsWith('oil-entry-')) return
    await press(c, T(entry)); await page.waitForSelector(T('oil-edit-amt')); await page.waitForTimeout(200)
    let halfRow = await has(page, T('oil-edit-half-am'))
    A.ok(!halfRow, `an FO's editor shows no Half chips (shown=${halfRow})`)
    await page.fill(T('oil-edit-amt'), '0.5'); await page.waitForTimeout(250)
    const st = await halfState(page).catch(() => null)
    const am = await page.locator(T('oil-edit-half-am')).evaluate(e => e.classList.contains('on')).catch(() => null)
    const pm = await page.locator(T('oil-edit-half-pm')).evaluate(e => e.classList.contains('on')).catch(() => null)
    A.ok(am !== null, `amount 0.5 shows the Half chips: AM lit=${am}, PM lit=${pm}`)
    await shot(page, p + 'a-editor-half-chips'); pics.push(p + 'a-editor-half-chips')
    await press(c, T('oil-edit-save')); await page.waitForTimeout(500)
    await press(c, T('oil-close')); await page.waitForTimeout(400)
    const b = await boxes(page, who, D.d3); const ho = b && hoOf(b)
    const want = pm ? '(bot|right-pm)' : '(top|right-am)'
    A.ok(ho && new RegExp('\\b' + want + '\\b').test(ho.cls), `the half saved equals the chip that was lit (${pm ? 'PM' : 'AM'}): ${JSON.stringify(ho)}`)
    await cellShot(page, who, D.d3, p + 'b-saved-half'); pics.push(p + 'b-saved-half')
    // 0.5 back to 1
    await press(c, T('oil-tracker')); await page.waitForSelector(T('oil-sheet')); await page.waitForTimeout(400)
    const entry2 = await page.evaluate(() => { const row = document.querySelector('[data-testid="oil-row-stiff"]'); const es = [...row.querySelectorAll('[data-testid^="oil-entry-"]')]; const hit = es.find(e => /29 Oct/.test(e.innerText)); return hit ? hit.dataset.testid : null })
    await press(c, T(entry2)); await page.waitForSelector(T('oil-edit-amt'))
    await page.fill(T('oil-edit-amt'), '1'); await page.waitForTimeout(250)
    A.ok(!(await has(page, T('oil-edit-half-am'))), `amount 1 takes the Half chips away`)
    await press(c, T('oil-edit-save')); await page.waitForTimeout(500)
    await press(c, T('oil-close')); await page.waitForTimeout(400)
    const b2 = await boxes(page, who, D.d3); const fo = b2 && b2.find(x => x.text === 'FO')
    A.ok(fo && !/\b(top|bot|right-am|right-pm)\b/.test(fo.cls) && fo.h >= 0.75, `0.5 back to 1 drops the half, a whole FO box: ${JSON.stringify(b2)}`)
    await cellShot(page, who, D.d3, p + 'c-back-to-whole'); pics.push(p + 'c-back-to-whole')
  })
  await closeAny(c)
  rec('18b', size, 'admin', 'NOT RUN', `the second half of scenario 18: change the award's date in the same edit to a day holding a PM leave`, `an award's date is shown, never changed, in the OIL tracker editor (a plain date reading, no picker) — the premise cannot be built through the app's own controls`, [])
  await c.ctx.close()
}


const sections = { B: [sectionB] }
if (which === 'B' || which === 'all') { for (const size of (process.env.W2_SIZES || 'desk,phone').split(',')) await sectionB(size === 'phone' ? 'phone' : 'desk') }
saveResults('part-' + which)
console.log('ERRORS', JSON.stringify(errs))
await closeBrowser()
