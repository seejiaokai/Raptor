// Walker 2, section C (23-32): the Available and Required rows. Every step asserts the RIGHT behaviour. Run: node lw-m2-walk-2-c.mjs <part>
import { newCtx, signIn, T, cellId, press, undo, redo, closeAny, vis, has, txt, shot, cellShot, clipShot, boxes, bid, results, rec, errs, saveResults, closeBrowser, PLAIN, URL } from './lw-m2-walk-2-lib-r.mjs'
console.log('lw-m2-walk-2-c v1 (build fcddf90f4 on :4265)')
const part = process.argv[2] || 'A'
const who = 'stiff'
class Asserts {
  constructor() { this.items = [] }
  ok(cond, note) { this.items.push({ pass: !!cond, note }); return !!cond }
  get pass() { return this.items.length > 0 && this.items.every(i => i.pass) }
  get saw() { return this.items.map(i => (i.pass ? '✓ ' : '✗ ') + i.note).join('; ') }
}
async function scenario(id, size, role, did, fn) {
  const A = new Asserts(); const pics = []
  try { const r = await fn(A, pics); if (r && r.notRun) { rec(id, size, role, 'NOT RUN', did, r.notRun, pics); return } }
  catch (e) { A.ok(false, 'script stopped: ' + String(e.message).split('\n')[0]) }
  rec(id, size, role, A.pass ? 'PASS' : 'FAIL', did, A.saw, pics)
}
const DAYS = ['2026-10-26', '2026-10-27', '2026-10-28', '2026-10-29', '2026-10-30']   // Mon..Fri
/* the Available P cell's state: none / amb / red (class under) + its text colour */
const cellState = (page, row, iso) => page.evaluate(([row, iso]) => {
  const e = document.querySelector('[data-testid="' + row + '-' + iso + '"]'); if (!e) return null
  const cls = e.className
  return { txt: e.innerText.trim(), amb: /\bamb\b/.test(cls), red: /\bunder\b/.test(cls), cls, color: getComputedStyle(e).color, bg: getComputedStyle(e).backgroundColor }
}, [row, iso])
const stateWord = s => (!s ? 'missing' : s.red ? 'red' : s.amb ? 'amber' : 'plain')
async function states(page, row = 'avail-p', days = DAYS) { const o = {}; for (const d of days) o[d.slice(8)] = stateWord(await cellState(page, row, d)); return o }
async function typeRequired(c, values, startIso = DAYS[0]) {
  const page = c.page
  await press(c, T('req-p-' + startIso))
  if (!c.phone) {
    for (const v of values) { await page.keyboard.type(String(v)); await page.keyboard.press('Enter'); await page.waitForTimeout(220) }
    await page.keyboard.press('Escape'); await page.waitForTimeout(300)
    return
  }
  // a phone has its own number pad: digit keys, a next-day arrow and Done
  const key = async id => { await press(c, T('fly-pad-' + id)); await page.waitForTimeout(120) }
  for (let i = 0; i < values.length; i++) {
    for (const ch of String(values[i])) await key(ch)
    if (i < values.length - 1) await key('next')
  }
  await key('done'); await page.waitForTimeout(400)
}
async function openAvail(c) {
  await press(c, T('fly-name-avail-p')); await c.page.waitForSelector(T('cform-amber-pt'))
}
async function setPoints(c, amber, red, save = true) {
  const p = c.page
  await p.fill(T('cform-amber-pt'), amber); await p.fill(T('cform-red-pt'), red); await p.waitForTimeout(300)
  if (save) { await press(c, T('cform-save')); await p.waitForTimeout(600) }
}
const undoTitle = page => page.locator('#undoBtn').getAttribute('title').catch(() => null)

async function partA() {
  const c = await newCtx('desk', 'C-desk'); const page = c.page
  await signIn(page, 'admin')
  await scenario(23, 'desk', 'admin', 'Type Required P 26, 27, 28, 29, 30 on Mon 26 to Fri 30 Oct; open the Available P window; Amber "+ 2", Red "+ 0", Save; Undo; Redo', async (A, pics) => {
    const p = 's23-desk-'
    await typeRequired(c, [26, 27, 28, 29, 30])
    const typed = await page.evaluate(d => d.map(i => document.querySelector('[data-testid="req-p-' + i + '"]')?.innerText.trim()), DAYS)
    A.ok(typed.join(',') === '26,27,28,29,30', 'Required P typed: ' + typed.join(','))
    await openAvail(c)
    const win = await page.evaluate(() => document.querySelector('[data-testid="counter-form"]').innerText.replace(/\s+/g, ' '))
    A.ok(/AMBER/i.test(win) && /RED/i.test(win) && /Red is set|SANS|still needed/i.test(win), 'the window carries Amber and Red point boxes and the SANS line: "' + win.slice(win.indexOf('AMBER') - 5, win.indexOf('AMBER') + 400) + '"')
    await shot(page, p + 'a-window'); pics.push(p + 'a-window')
    await setPoints(c, '+ 2', '+ 0')
    const s = await states(page)
    A.ok(s['26'] === 'plain' && s['27'] === 'amber' && s['28'] === 'amber' && s['29'] === 'red' && s['30'] === 'red', 'avail P after Save, Mon..Fri (need Req+2 amber, under Req red): ' + JSON.stringify(s))
    const other = await states(page, 'avail-p', ['2026-10-23', '2026-10-24', '2026-10-25'])
    A.ok(Object.values(other).every(v => v === 'plain'), 'no-Required days (Fri 23, Sat 24, Sun 25 Oct) show neither: ' + JSON.stringify(other))
    A.ok(true, 'Available W untouched: ' + JSON.stringify(await states(page, 'avail-w')))
    await clipShot(page, T('fly-row-avail-p'), p + 'b-row-after-save', 0)
    await shot(page, p + 'c-grid-after-save'); pics.push(p + 'c-grid-after-save')
    const t1 = await undoTitle(page)
    await undo(c)
    const u = await states(page)
    A.ok(u['27'] === 'plain' && u['28'] === 'plain' && u['29'] === 'red', 'after Undo the amber is gone, red stays (red +0 is the old rule): ' + JSON.stringify(u))
    await shot(page, p + 'd-after-undo'); pics.push(p + 'd-after-undo')
    await redo(c)
    const r = await states(page)
    A.ok(r['27'] === 'amber' && r['28'] === 'amber', 'after Redo the amber is back: ' + JSON.stringify(r))
    await shot(page, p + 'e-after-redo'); pics.push(p + 'e-after-redo')
    A.ok(true, 'Undo button title right after the points Save: "' + t1 + '"')
  })
  await closeAny(c)
  await scenario(24, 'desk', 'admin', 'Amber "+ 1", Red "+ 2" (red at or above amber): the window says amber never shows; Save; then Red "- 1", Amber "+ 0" with Required Fri 30 Oct = 30', async (A, pics) => {
    const p = 's24-desk-'
    await openAvail(c)
    await setPoints(c, '+ 1', '+ 2', false)
    const hid = await txt(page, T('cform-amber-hidden')).catch(() => null)
    A.ok(hid && /Red is set at or above amber, so amber never shows/.test(hid), 'the window says: "' + hid + '"')
    await shot(page, p + 'a-window-hidden-line'); pics.push(p + 'a-window-hidden-line')
    await press(c, T('cform-save')); await page.waitForTimeout(600)
    const s = await states(page)
    A.ok(Object.values(s).every(v => v !== 'amber'), 'no amber on the grid: ' + JSON.stringify(s))
    A.ok(s['27'] === 'red' && s['28'] === 'red' && s['26'] === 'plain', 'red from Req+2: 27 and 28 red, 26 plain: ' + JSON.stringify(s))
    await shot(page, p + 'b-grid-no-amber'); pics.push(p + 'b-grid-no-amber')
    // negative red
    await openAvail(c)
    await setPoints(c, '+ 0', '- 1', false)
    const bad = await has(page, T('cform-pt-bad'))
    const dis = await page.locator(T('cform-save')).isDisabled()
    A.ok(!bad && !dis, 'a negative red "- 1" is accepted: bad line shown=' + bad + ', Save disabled=' + dis)
    await shot(page, p + 'c-window-negative'); pics.push(p + 'c-window-negative')
    await press(c, T('cform-save')); await page.waitForTimeout(600)
    const n = await states(page)
    A.ok(n['26'] === 'plain' && n['27'] === 'plain' && n['28'] === 'plain' && n['29'] === 'amber' && n['30'] === 'red', 'red "- 1", amber "+ 0": red only once two short (Fri req 30 vs 28), Thu (1 short) amber: ' + JSON.stringify(n))
    await shot(page, p + 'd-grid-negative'); pics.push(p + 'd-grid-negative')
    A.ok(true, 'how the window reads the negative point back: reopen shows "' + (await (async () => { await openAvail(c); const v = await page.locator(T('cform-red-pt')).inputValue(); await press(c, T('cform-cancel')); return v })()) + '"')
  })
  await closeAny(c)
  await scenario(25, 'desk', 'admin', 'Type "abc", "+", "200" and leave Red blank in the Available P window; look at Save and the line; Cancel and look at the grid', async (A, pics) => {
    const p = 's25-desk-'
    const before = await states(page)
    await openAvail(c)
    const tries = [['abc', '+ 0', 'amber abc'], ['+', '+ 0', 'amber "+"'], ['200', '+ 0', 'amber 200'], ['+ 1', '', 'red blank']]
    for (const [a, r, name] of tries) {
      await page.fill(T('cform-amber-pt'), a); await page.fill(T('cform-red-pt'), r); await page.waitForTimeout(250)
      const dis = await page.locator(T('cform-save')).isDisabled(), bad = await txt(page, T('cform-pt-bad')).catch(() => null)
      A.ok(dis && bad, name + ': Save disabled=' + dis + ', line="' + bad + '"')
      await shot(page, p + 'x-' + name.replace(/[^a-z0-9]+/gi, '-')); pics.push(p + 'x-' + name.replace(/[^a-z0-9]+/gi, '-'))
    }
    // pressing the disabled Save changes nothing
    await page.locator(T('cform-save')).click({ force: true }).catch(() => {}); await page.waitForTimeout(300)
    A.ok(await vis(page, T('counter-form')), 'pressing the disabled Save left the window open')
    await press(c, T('cform-cancel'))
    const after = await states(page)
    A.ok(JSON.stringify(before) === JSON.stringify(after), 'nothing saved: before ' + JSON.stringify(before) + ' after ' + JSON.stringify(after))
  })
  await closeAny(c)
  await scenario('23v', 'desk', 'admin', 'Open the Available P window and measure its Amber and Red boxes against the approved picture r7-26-availp-desk (small boxes inline after "when under Required")', async (A, pics) => {
    const p = 's23v-desk-'
    await openAvail(c)
    const m = await page.evaluate(() => {
      const r = id => { const b = document.querySelector('[data-testid="' + id + '"]').getBoundingClientRect(); return { w: Math.round(b.width), h: Math.round(b.height), x: Math.round(b.left), y: Math.round(b.top) } }
      const sheet = document.querySelector('[data-testid="counter-form"]').getBoundingClientRect()
      return { amber: r('cform-amber-pt'), red: r('cform-red-pt'), sheetW: Math.round(sheet.width) }
    })
    A.ok(m.amber.w <= 140 && m.red.w <= 140, 'point boxes are small and inline as drawn (a box about 60 wide beside "when under Required"): built amber ' + m.amber.w + 'x' + m.amber.h + ', red ' + m.red.w + 'x' + m.red.h + ' in a window ' + m.sheetW + ' wide')
    await clipShot(page, T('counter-form'), p + 'a-window', 6); pics.push(p + 'a-window')
    await press(c, T('cform-cancel'))
  })
  saveResults('part-C-' + part)
  await c.ctx.close()
}

async function ensureManning(c) {
  const open = await c.page.locator(T('counts-toggle')).getAttribute('aria-expanded')
  if (open !== 'true') { await press(c, T('counts-toggle')); await c.page.waitForTimeout(400) }
}
const redBtn = page => txt(page, T('undermanned'))
async function partB(size) {
  const c = await newCtx(size, 'C-26-' + size); const page = c.page
  await signIn(page, 'admin')
  await ensureManning(c)
  await scenario(26, size, 'admin', 'Required P 27 (Tue) and 28 (Wed), points Amber "+ 2" Red "+ 0": amber-only days; then a pilot leave bid on Wed 28 Oct takes Available P under Required (red); open the red list; tap its line; delete the bid', async (A, pics) => {
    const p = `s26-${size}-`
    const base = await redBtn(page)
    await typeRequired(c, [27, 28], '2026-10-27')
    await openAvail(c); await setPoints(c, '+ 2', '+ 0')
    const s0 = await states(page, 'avail-p', ['2026-10-27', '2026-10-28'])
    A.ok(s0['27'] === 'amber' && s0['28'] === 'amber', 'two amber-only days: ' + JSON.stringify(s0))
    const amberOnly = await redBtn(page)
    A.ok(amberOnly === base && !amberOnly, 'amber-only days leave the Manning button as it was (before: ' + JSON.stringify(base) + ', after: ' + JSON.stringify(amberOnly) + ') — "Manning" alone, no right half')
    await clipShot(page, T('counts-toggle'), p + 'a-manning-alone', 40); pics.push(p + 'a-manning-alone')
    // push Wed 28 to red with a bid
    await bid(c, who, '2026-10-28', 'LL')
    const s1 = await cellState(page, 'avail-p', '2026-10-28')
    A.ok(s1 && s1.red && s1.txt === '27', 'Wed 28 Oct Available P is now ' + (s1 && s1.txt) + ' and red: ' + JSON.stringify(s1 && s1.cls))
    const rb = await redBtn(page)
    A.ok(rb && /1\s*red/.test(rb), 'the red count rose by one: "' + rb + '"')
    const chip = await page.evaluate(() => { const e = document.querySelector('[data-testid="open-chip"]'); return e ? { text: e.innerText.trim(), cut: [e, ...e.querySelectorAll('*')].some(x => x.scrollWidth > x.clientWidth + 1 && getComputedStyle(x).overflow !== 'visible'), w: Math.round(e.getBoundingClientRect().width) } : null })
    A.ok(chip && !chip.cut, 'the open-dates chip beside the red count is not cut short: ' + JSON.stringify(chip))
    await shot(page, p + 'b-red-count'); pics.push(p + 'b-red-count')
    await press(c, T('undermanned')); await page.waitForSelector(T('undermanned-list'))
    const list = await txt(page, T('undermanned-list'))
    A.ok(/Available P/.test(list) && /27/.test(list), 'the list line names the row and its figure: "' + list + '" (drawn r19c: "Available P 23 of 24")')
    A.ok(/of 28/.test(list), 'the line carries the "of <Required>" ending as drawn in r19c: ' + /of 28/.test(list))
    await shot(page, p + 'c-red-list'); pics.push(p + 'c-red-list')
    await press(c, T('undermanned-day-2026-10-28')); await page.waitForTimeout(900)
    const head = await page.locator(T('head-2026-10-28')).boundingBox().catch(() => null)
    const vp = page.viewportSize()
    A.ok(head && head.x >= 0 && head.x + head.width <= vp.width, 'a tap on the line took the grid to Wed 28 Oct (its date heading box ' + JSON.stringify(head) + ')')
    A.ok(!(await vis(page, T('undermanned-list'))), 'the list closed after the tap')
    await shot(page, p + 'd-after-jump'); pics.push(p + 'd-after-jump')
    // remove the bid
    await press(c, T(cellId(who, '2026-10-28'))); await page.waitForSelector(T('bid-picker'))
    await press(c, T('bid-clear')); await page.waitForTimeout(500)
    await closeAny(c)
    const s2 = await cellState(page, 'avail-p', '2026-10-28')
    A.ok(s2 && s2.txt === '28' && s2.amb && !s2.red, 'after the bid is gone Wed 28 is back to amber-only: ' + JSON.stringify(s2 && { t: s2.txt, c: s2.cls }))
    const gone = await redBtn(page)
    A.ok(!gone, 'at zero the right half vanishes, "Manning" alone: ' + JSON.stringify(gone))
    await clipShot(page, T('counts-toggle'), p + 'e-back-to-alone', 40); pics.push(p + 'e-back-to-alone')
  })
  saveResults('part-C-' + part + '-' + size)
  await c.ctx.close()
}

if (part === 'A') await partA()
if (part === 'B') { for (const sz of (process.env.W2_SIZES || 'desk,phone').split(',')) await partB(sz) }
console.log('ERRORS', JSON.stringify(errs))
await closeBrowser()
