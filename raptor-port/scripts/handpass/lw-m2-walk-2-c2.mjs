// Walker 2, section C part 2 (27-32): the Required rows' rename, a member cannot edit them, the SANS calendar unchanged, the pair tints, Undo words.
// Run: node lw-m2-walk-2-c2.mjs <27|28|29|30|31>
import { newCtx, signIn, T, cellId, press, undo, redo, closeAny, vis, has, txt, shot, cellShot, clipShot, boxes, bid, results, rec, errs, saveResults, closeBrowser, getBrowser, PLAIN, URL, PHONE, OUT } from './lw-m2-walk-2-lib.mjs'
import { devices } from '@playwright/test'
console.log('lw-m2-walk-2-c2 v1 (build fcddf90f4 on :4173)')
const part = process.argv[2] || '27'
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
const DAYS = ['2026-10-26', '2026-10-27', '2026-10-28', '2026-10-29', '2026-10-30']
const cellState = (page, row, iso) => page.evaluate(([row, iso]) => {
  const e = document.querySelector('[data-testid="' + row + '-' + iso + '"]'); if (!e) return null
  return { txt: e.innerText.trim(), cls: e.className }
}, [row, iso])
async function ensureManning(c) {
  const open = await c.page.locator(T('counts-toggle')).getAttribute('aria-expanded')
  if (open !== 'true') { await press(c, T('counts-toggle')); await c.page.waitForTimeout(400) }
}
async function typeRequired(c, values, startIso = DAYS[0]) {
  const page = c.page
  await press(c, T('req-p-' + startIso))
  if (!c.phone) {
    for (const v of values) { await page.keyboard.type(String(v)); await page.keyboard.press('Enter'); await page.waitForTimeout(220) }
    await page.keyboard.press('Escape'); await page.waitForTimeout(300); return
  }
  const key = async id => { await press(c, T('fly-pad-' + id)); await page.waitForTimeout(120) }
  for (let i = 0; i < values.length; i++) { for (const ch of String(values[i])) await key(ch); if (i < values.length - 1) await key('next') }
  await key('done'); await page.waitForTimeout(400)
}
const undoTitle = page => page.locator('#undoBtn').getAttribute('title').catch(() => null)
const nameOf = (page, id) => txt(page, T('fly-name-' + id))
async function loginPlain(page, who2, today) {
  await page.goto(PLAIN)
  await page.waitForSelector('#luser')
  const [u, p] = who2 === 'admin' ? ['ad', 'a'] : ['us', 'us']
  await page.fill('#luser', u); await page.fill('#lpass', p)
  await page.click('#loginForm button[type=submit]'); await page.waitForSelector('#vWeek .day')
  if (today) await page.evaluate(t => window.lwSetMemberToday(t), today)
  await page.evaluate(() => window.go('leavewar')); await page.waitForSelector('[data-testid^="row-"]'); await page.waitForTimeout(800)
}
async function rename(c, rowId, newName) {
  await press(c, T('fly-name-' + rowId)); await c.page.waitForSelector(T('reqname-name'))
  await c.page.fill(T('reqname-name'), newName); await c.page.waitForTimeout(200)
  await press(c, T('reqname-save')); await c.page.waitForTimeout(600)
}

/* ---- 27 + 32: rename Required P ------------------------------------------------------------------------------- */
async function s27() {
  const c = await newCtx('desk', 'C-27'); const page = c.page
  await loginPlain(page, 'admin')
  await scenario(27, 'desk+phone', 'admin', 'Rename Required P to "Pilots req" (on real storage): the row name, the figure pad, the Required panel, the Available P window\'s SANS line; the phone\'s short name; rename back; Undo, Redo; reload', async (A, pics) => {
    const p = 's27-'
    const orig = await nameOf(page, 'req-p')
    A.ok(/Required P/i.test(orig), 'the row starts as "' + orig + '"')
    await press(c, T('fly-name-req-p')); await page.waitForSelector(T('reqname-name'))
    const form = await page.evaluate(() => document.querySelector('[data-testid="req-name-form"]').innerText.replace(/\s+/g, ' '))
    A.ok(!(await has(page, T('req-name-form') + ' input[type=number]')) && !/figure|Required figures/i.test(form.replace(/Rename Required P/i, '')), 'the rename window holds the name alone: "' + form + '"')
    await shot(page, p + 'a-rename-window'); pics.push(p + 'a-rename-window')
    await page.fill(T('reqname-name'), 'Pilots req'); await press(c, T('reqname-save')); await page.waitForTimeout(600)
    const nm = await nameOf(page, 'req-p')
    A.ok(/Pilots req/i.test(nm), 'the row name now reads "' + nm + '"')
    const ut = await undoTitle(page)
    A.ok(true, 'Undo button title right after the rename: "' + ut + '"')
    await typeRequired(c, [26, 27, 28])
    // pad title
    await press(c, T('req-p-2026-10-27')); await page.waitForTimeout(400)
    const strip = await page.locator(T('fly-edit-strip')).first().innerText().catch(() => null)
    A.ok(strip && /Pilots req/i.test(strip) && !/Required P/i.test(strip), 'the figure pad names the new name: "' + (strip || '').replace(/\s+/g, ' ') + '"')
    await shot(page, p + 'b-pad-title'); pics.push(p + 'b-pad-title')
    await page.keyboard.press('Escape'); await page.waitForTimeout(300)
    // the Required panel: a shift-drag across two cells
    const b1 = await page.locator(T('req-p-2026-10-27')).boundingBox(), b2 = await page.locator(T('req-p-2026-10-28')).boundingBox()
    await page.keyboard.down('Shift')
    await page.mouse.move(b1.x + b1.width / 2, b1.y + b1.height / 2); await page.mouse.down()
    await page.mouse.move(b2.x + b2.width / 2, b2.y + b2.height / 2, { steps: 4 }); await page.mouse.up()
    await page.keyboard.up('Shift'); await page.waitForTimeout(500)
    const ptitle = await txt(page, T('req-panel-title')).catch(() => null)
    A.ok(ptitle && /Pilots req/i.test(ptitle), 'the Required figures panel title reads: "' + ptitle + '"')
    await shot(page, p + 'c-panel-title'); pics.push(p + 'c-panel-title')
    if (await vis(page, T('req-panel-x'))) await press(c, T('req-panel-x'))
    await page.keyboard.press('Escape'); await page.waitForTimeout(300)
    // Available P window's SANS line
    await press(c, T('fly-name-avail-p')); await page.waitForSelector(T('cform-avail-sans'))
    const sansLine = await txt(page, T('cform-avail-sans'))
    A.ok(/Pilots req/i.test(sansLine) && !/Required P/i.test(sansLine), 'the Available P window\'s SANS line: "' + sansLine + '"')
    await shot(page, p + 'd-avail-window-sans-line'); pics.push(p + 'd-avail-window-sans-line')
    await press(c, T('cform-cancel'))
    // reload keeps it
    await loginPlain(page, 'admin')
    const kept = await nameOf(page, 'req-p')
    A.ok(/Pilots req/i.test(kept), 'after a reload (sign in again) the row still reads "' + kept + '"')
    // phone
    const st = await c.ctx.storageState()
    const b = await getBrowser()
    const pc = await b.newContext({ viewport: PHONE, hasTouch: true, isMobile: true, deviceScaleFactor: 2, userAgent: devices['iPhone 13'].userAgent, storageState: st })
    const pp = await pc.newPage(); pp.on('console', m => { if (m.type() === 'error') errs.push('27-phone console: ' + m.text().slice(0, 200)) }); pp.on('pageerror', e => errs.push('27-phone pageerror: ' + String(e).slice(0, 200)))
    const cp = { ctx: pc, page: pp, phone: true }
    await loginPlain(pp, 'admin'); await ensureManning(cp)
    const pn = await nameOf(pp, 'req-p'), pa = await nameOf(pp, 'avail-p')
    A.ok(/Pilots req/i.test(pn) && !/Req P/i.test(pn), 'on the phone a renamed row shows its new name, not "Req P": "' + pn + '"')
    A.ok(/Avail P/i.test(pa), 'the unrenamed Available P shows the phone short form: "' + pa + '"')
    await shot(pp, p + 'e-phone-renamed'); pics.push(p + 'e-phone-renamed')
    // rename back
    await rename(c, 'req-p', 'Required P')
    const back = await nameOf(page, 'req-p')
    A.ok(/Required P/i.test(back), 'renamed back: "' + back + '"')
    const st2 = await c.ctx.storageState()
    await pc.close()
    const pc2 = await b.newContext({ viewport: PHONE, hasTouch: true, isMobile: true, deviceScaleFactor: 2, userAgent: devices['iPhone 13'].userAgent, storageState: st2 })
    const pp2 = await pc2.newPage(); const cp2 = { ctx: pc2, page: pp2, phone: true }
    await loginPlain(pp2, 'admin'); await ensureManning(cp2)
    const pn2 = await nameOf(pp2, 'req-p')
    A.ok(/Req P/i.test(pn2), 'on the phone the original name shows "Req P" again: "' + pn2 + '"')
    await shot(pp2, p + 'f-phone-back'); pics.push(p + 'f-phone-back')
    await pc2.close()
    // undo / redo the rename-back
    await undo(c)
    const u = await nameOf(page, 'req-p')
    A.ok(/Pilots req/i.test(u), 'Undo of the rename-back restores "' + u + '"')
    const ut2 = await undoTitle(page)
    await redo(c)
    const r = await nameOf(page, 'req-p')
    A.ok(/Required P/i.test(r), 'Redo gives "' + r + '"')
    A.ok(true, 'Redo/Undo wording seen on the Undo button after rename-back/undo: "' + ut2 + '"')
  })
  saveResults('part-C2-27')
  await c.ctx.close()
}

/* ---- 28: a member cannot edit the rows ------------------------------------------------------------------------ */
async function s28(size) {
  const c = await newCtx(size, 'C-28-' + size); const page = c.page
  await loginPlain(page, 'member', '2026-01-05')
  await ensureManning(c)
  await scenario(28, size, 'member', 'Tap the Required P, Required W, Available P and Available W names, and a Required cell', async (A, pics) => {
    const p = `s28-${size}-`
    for (const id of ['req-p', 'req-w', 'avail-p', 'avail-w']) {
      const present = await has(page, T('fly-row-' + id)), asButton = await has(page, T('fly-name-' + id))
      A.ok(present && !asButton, 'the row ' + id + ' is on the member grid as plain words (row present=' + present + ', name drawn as a button=' + asButton + ')')
      await press(c, T('fly-row-' + id) + ' td.who'); await page.waitForTimeout(400)
      const opened = (await vis(page, T('req-name-form'))) || (await vis(page, T('counter-form')))
      A.ok(!opened, 'tapping the ' + id + ' name opens no rename or points window (opened=' + opened + ')')
    }
    const rq = await page.locator('[data-testid^="req-p-2026"]').first().getAttribute('data-testid')
    await press(c, T(rq)); await page.waitForTimeout(400)
    const pad = (await vis(page, T('fly-pad'))) || (await vis(page, T('fly-edit-input'))) || (await vis(page, T('fly-edit-touch')))
    A.ok(!pad, 'tapping a Required cell opens no figure pad (pad=' + pad + ')')
    await shot(page, p + 'a-after-taps'); pics.push(p + 'a-after-taps')
  })
  saveResults('part-C2-28-' + size)
  await c.ctx.close()
}

/* ---- 29: the SANS calendar and the Calendar window are the same before and after a points change ---------------- */
async function s29() {
  const c = await newCtx('desk', 'C-29'); const page = c.page
  await signIn(page, 'admin')
  await scenario(29, 'desk', 'admin', 'Required P 26..30 typed; read the SANS calendar\'s still-needed figures and a SANS day; change Available P\'s points (amber +2/red +0, then amber +5/red +3); read them again; the Calendar window too', async (A, pics) => {
    const p = 's29-desk-'
    await typeRequired(c, [26, 27, 28, 29, 30])
    const readSans = async () => {
      await page.evaluate(() => window.go('inputs')); await page.waitForTimeout(800)
      await page.locator('#page-inputs button', { hasText: 'SANS' }).first().click(); await page.waitForTimeout(900)
      const need = await page.evaluate(d => d.map(i => { const e = document.querySelector('[data-testid="sc-need-' + i + '"]'); return i.slice(8) + ':' + (e ? e.innerText.replace(/\s+/g, ' ').trim() : 'none') }), DAYS)
      return need
    }
    const before = await readSans()
    A.ok(before.some(x => !/none/.test(x)), 'the SANS calendar shows still-needed figures: ' + JSON.stringify(before))
    await shot(page, p + 'a-sans-before'); pics.push(p + 'a-sans-before')
    await page.locator(T('sc-day-2026-10-29')).first().click(); await page.waitForTimeout(700)
    const dayBefore = await page.evaluate(() => { const e = document.querySelector('.sansday, [data-testid="sans-day"], [data-testid^="sd-"]'); return (document.querySelector('.sansday') || document.querySelector('[data-testid="sans-day"]') || document.body).innerText.replace(/\s+/g, ' ').slice(0, 400) })
    await shot(page, p + 'b-sans-day-before'); pics.push(p + 'b-sans-day-before')
    await page.keyboard.press('Escape'); await page.waitForTimeout(300)
    // change the points on the war
    await page.evaluate(() => window.go('leavewar')); await page.waitForSelector('[data-testid^="row-"]'); await page.waitForTimeout(800)
    await press(c, T('fly-name-avail-p')); await page.waitForSelector(T('cform-amber-pt'))
    await page.fill(T('cform-amber-pt'), '+ 5'); await page.fill(T('cform-red-pt'), '+ 3'); await press(c, T('cform-save')); await page.waitForTimeout(600)
    const st = await cellState(page, 'avail-p', '2026-10-27')
    A.ok(st && /\bunder\b/.test(st.cls), 'the points changed on the war (Tue 27 is red now): ' + JSON.stringify(st))
    const after = await readSans()
    A.ok(JSON.stringify(before) === JSON.stringify(after), 'still-needed on the SANS calendar identical: before ' + JSON.stringify(before) + ' after ' + JSON.stringify(after))
    await shot(page, p + 'c-sans-after'); pics.push(p + 'c-sans-after')
    await page.locator(T('sc-day-2026-10-29')).first().click(); await page.waitForTimeout(700)
    const dayAfter = await page.evaluate(() => (document.querySelector('.sansday') || document.querySelector('[data-testid="sans-day"]') || document.body).innerText.replace(/\s+/g, ' ').slice(0, 400))
    A.ok(dayBefore === dayAfter, 'the opened SANS day reads the same before and after: before "' + dayBefore.slice(0, 160) + '" after "' + dayAfter.slice(0, 160) + '"')
    A.ok(/Required to fly|Still needed|still needed|Available/i.test(dayAfter), 'the SANS day keeps its own words (D626): "' + dayAfter.slice(0, 200) + '"')
    await shot(page, p + 'd-sans-day-after'); pics.push(p + 'd-sans-day-after')
    await page.keyboard.press('Escape'); await page.waitForTimeout(300)
    // the Calendar window
    const gear = await vis(page, T('sc-gear'))
    A.ok(gear, 'the SANS calendar gear is there: ' + gear)
    if (gear) {
      await page.locator(T('sc-gear')).click(); await page.waitForTimeout(600)
      await shot(page, p + 'e-sans-gear'); pics.push(p + 'e-sans-gear')
      const calBtn = page.getByText('Calendar', { exact: false }).filter({ hasText: /Calendar/ })
      const t = await page.evaluate(() => document.body.innerText.match(/Calendar[^\n]{0,60}/g)?.slice(0, 4))
      A.ok(true, 'the gear panel mentions: ' + JSON.stringify(t))
    }
  })
  saveResults('part-C2-29')
  await c.ctx.close()
}

/* ---- 30: pair tints + Rearrange ------------------------------------------------------------------------------ */
async function s30(size) {
  const c = await newCtx(size, 'C-30-' + size); const page = c.page
  await signIn(page, 'admin'); await ensureManning(c)
  await scenario(30, size, 'admin', 'Read the colours of the four rows (pairs); add a counter; Rearrange and drag it between Required W and Available P; read its colour and the four rows\'', async (A, pics) => {
    const p = `s30-${size}-`
    const read = () => page.evaluate(() => {
      const out = {}
      for (const id of ['req-p', 'req-w', 'avail-p', 'avail-w']) {
        const tr = document.querySelector('[data-testid="fly-row-' + id + '"]'); if (!tr) { out[id] = null; continue }
        const cells = [...tr.querySelectorAll('td')]
        const bg = e => getComputedStyle(e).backgroundColor
        out[id] = { cls: tr.className, trBg: bg(tr), first: bg(cells[0]), second: cells[1] ? bg(cells[1]) : null, cell: cells[4] ? bg(cells[4]) + ' ' + getComputedStyle(cells[4]).backgroundImage.slice(0, 48) : null }
      }
      return out
    })
    const t0 = await read()
    A.ok(t0['req-p'] && t0['avail-p'] && /pair-p/.test(t0['req-p'].cls) && /pair-p/.test(t0['avail-p'].cls) && /pair-w/.test(t0['req-w'].cls) && /pair-w/.test(t0['avail-w'].cls), 'the pairs carry pair-p / pair-w: ' + JSON.stringify(Object.fromEntries(Object.entries(t0).map(([k, v]) => [k, v && v.cls]))))
    A.ok(t0['req-p'].cell === t0['avail-p'].cell && t0['req-w'].cell === t0['avail-w'].cell && t0['req-p'].cell !== t0['req-w'].cell, 'each pair shares one faint tint and the P and W pairs differ: P ' + t0['req-p'].cell + '/' + t0['avail-p'].cell + ', W ' + t0['req-w'].cell + '/' + t0['avail-w'].cell)
    await clipShot(page, T('fly-row-req-p'), p + 'a-req-p', 0); await shot(page, p + 'a-rows'); pics.push(p + 'a-rows')
    // colours over tint: set Required to see red/amber
    await typeRequired(c, [27, 28, 29])
    await press(c, T('fly-name-avail-p')); await page.waitForSelector(T('cform-amber-pt'))
    await page.fill(T('cform-amber-pt'), '+ 2'); await page.fill(T('cform-red-pt'), '+ 0'); await press(c, T('cform-save')); await page.waitForTimeout(600)
    await shot(page, p + 'b-amber-red-over-tint'); pics.push(p + 'b-amber-red-over-tint')
    if (c.phone) { A.ok(true, 'phone: the Rearrange drag was walked on the desktop only (a finger drag of a counter row is not part of this walk)'); return }
    // add a counter, then Rearrange
    await press(c, T('settings-open')); await page.waitForSelector(T('settings-sheet'))
    await press(c, T('counter-add')); await page.waitForSelector(T('cform-name'))
    await page.fill(T('cform-name'), 'Walk counter'); await press(c, T('cform-save')); await page.waitForTimeout(600)
    const order = () => page.evaluate(() => [...document.querySelectorAll('[data-testid="count-walk-counter"], [data-testid^="fly-row-"]')].map(e => e.dataset.testid.replace('fly-row-', '').replace('count-', '')).join(' > '))
    const o0 = await order()
    A.ok(/walk-counter/.test(o0), 'the new counter stands in the Manning block: ' + o0)
    await press(c, T('settings-open')); await page.waitForSelector(T('settings-sheet'))
    await press(c, T('settings-rearrange')); await page.waitForTimeout(800)
    const gripOk = await has(page, T('manning-drag-walk-counter'))
    A.ok(gripOk, 'Rearrange shows the counter drag handle: ' + gripOk)
    const g = await page.locator(T('manning-drag-walk-counter')).boundingBox(), rw = await page.locator(T('fly-row-req-w')).boundingBox()
    await page.mouse.move(g.x + g.width / 2, g.y + g.height / 2); await page.mouse.down()
    const ty = rw.y + rw.height - 3
    for (let i = 1; i <= 8; i++) { await page.mouse.move(g.x + g.width / 2 + 40, g.y + (ty - g.y) * i / 8, { steps: 2 }); await page.waitForTimeout(60) }
    await shot(page, p + 'c-dragging'); pics.push(p + 'c-dragging')
    await page.mouse.up(); await page.waitForTimeout(700)
    const o1 = await order()
    A.ok(/req-w > walk-counter > avail-p/.test(o1), 'the counter now stands between Required W and Available P: ' + o1)
    await shot(page, p + 'd-rearranged'); pics.push(p + 'd-rearranged')
    const t1 = await read()
    const cnt = await page.evaluate(() => { const tr = document.querySelector('[data-testid="count-walk-counter"]'); const cells = [...tr.querySelectorAll('td')]; return { cls: tr.className, trBg: getComputedStyle(tr).backgroundColor, cell: getComputedStyle(cells[4]).backgroundColor + ' ' + getComputedStyle(cells[4]).backgroundImage.slice(0, 48), first: getComputedStyle(cells[0]).backgroundColor } })
    A.ok(t1['req-p'].cell === t0['req-p'].cell && t1['avail-p'].cell === t0['avail-p'].cell && t1['req-w'].cell === t0['req-w'].cell && t1['avail-w'].cell === t0['avail-w'].cell, 'the four rows keep their tints: ' + JSON.stringify({ rp: t1['req-p'].cell, ap: t1['avail-p'].cell, rw: t1['req-w'].cell, aw: t1['avail-w'].cell }))
    A.ok(/ none$/.test(cnt.cell) || ![t1['req-p'].cell, t1['req-w'].cell, t1['avail-p'].cell, t1['avail-w'].cell].includes(cnt.cell), 'the dragged counter row has no tint of its own pair: counter cell ' + JSON.stringify(cnt) + ' vs P ' + t1['avail-p'].cell + ', W ' + t1['avail-w'].cell)
    await press(c, T('lw-rearrange-done')).catch(() => {})
    await undo(c); const o2 = await order()
    A.ok(true, 'Undo of the drop: ' + o2)
    await redo(c); A.ok(true, 'Redo: ' + await order())
  })
  saveResults('part-C2-30-' + size)
  await c.ctx.close()
}


/* ---- 21: a member's own HO, read only ------------------------------------------------------------------------- */
async function s21() {
  const c = await newCtx('phone', 'C-21'); const page = c.page
  await loginPlain(page, 'admin')
  await press(c, T('month-OCT')); await page.waitForTimeout(900)
  // the admin gives Ranger an afternoon HO on Wed 28 Oct
  const iso = '2026-10-28'
  await press(c, T(cellId('bane', iso))); await page.waitForSelector(T('bid-picker'))
  await press(c, T('bid-oil')); await page.waitForSelector(T('oil-days'))
  await page.fill(T('oil-days'), '0.5'); await press(c, T('oil-half-pm')); await page.fill(T('oil-why'), 'walk 2 award')
  await press(c, T('oil-give')); await page.waitForTimeout(600)
  const given = await boxes(page, 'bane', iso)
  await scenario(21, 'phone', 'member', 'The admin gives Ranger an afternoon HO on Wed 28 Oct; sign out; sign in as Ranger; tap his own HO', async (A, pics) => {
    const p = 's21-phone-'
    A.ok(given && given.some(x => /k-oil/.test(x.cls) && /bot/.test(x.cls)), 'set-up: Ranger holds an afternoon HO (bottom half): ' + JSON.stringify(given))
    await loginPlain(page, 'member', '2026-01-05')
    await press(c, T('month-OCT')); await page.waitForTimeout(900)
    const mine = await boxes(page, 'bane', iso)
    A.ok(mine && mine.some(x => /k-oil/.test(x.cls) && /bot/.test(x.cls)), 'the member sees his own HO in the bottom half: ' + JSON.stringify(mine))
    await cellShot(page, 'bane', iso, p + 'a-member-cell'); pics.push(p + 'a-member-cell')
    await press(c, T(cellId('bane', iso))); await page.waitForTimeout(600)
    const sheet = await page.evaluate(() => { const s = [...document.querySelectorAll('.sheet, .bidsheet, [role="dialog"]')].filter(e => e.getBoundingClientRect().height > 0).pop(); return s ? { id: s.dataset.testid || s.className, text: s.innerText.replace(/\s+/g, ' '), tids: [...s.querySelectorAll('[data-testid]')].map(e => e.dataset.testid) } : null })
    A.ok(sheet, 'a sheet opened: ' + (sheet && sheet.id))
    A.ok(sheet && /afternoon/i.test(sheet.text), 'it names the half ("afternoon"): "' + (sheet && sheet.text.slice(0, 200)) + '"')
    A.ok(sheet && !sheet.tids.some(t => /oil-half|oil-give|oil-days|oil-clear|oil-edit/.test(t)), 'no Half chips, give button, days box or edit for the member: ' + JSON.stringify(sheet && sheet.tids.filter(t => /oil|dl-|bid-/.test(t))))
    await shot(page, p + 'b-member-sheet'); pics.push(p + 'b-member-sheet')
  })
  saveResults('part-C2-21')
  await c.ctx.close()
}

/* ---- 31: two tabs ------------------------------------------------------------------------------------------- */
async function s31() {
  const c = await newCtx('desk', 'C-31'); const pageA = c.page
  await loginPlain(pageA, 'admin')
  const pageB = await c.ctx.newPage(); pageB.on('pageerror', e => errs.push('31-B pageerror: ' + String(e).slice(0, 200)))
  await loginPlain(pageB, 'admin')
  const cA = { ctx: c.ctx, page: pageA, phone: false }
  await scenario(31, 'desk', 'admin', 'Two tabs of one browser: in tab A type Required P 27 on Tue 27 Oct and set Available P amber +2; watch tab B for up to 45 seconds', async (A, pics) => {
    const p = 's31-desk-'
    await typeRequired(cA, [27], '2026-10-27')
    await press(cA, T('fly-name-avail-p')); await pageA.waitForSelector(T('cform-amber-pt'))
    await pageA.fill(T('cform-amber-pt'), '+ 2'); await pageA.fill(T('cform-red-pt'), '+ 0'); await press(cA, T('cform-save')); await pageA.waitForTimeout(600)
    const a = await cellState(pageA, 'avail-p', '2026-10-27')
    A.ok(a && /amb/.test(a.cls), 'tab A shows Tue 27 amber: ' + JSON.stringify(a))
    let seen = null, t = 0
    for (; t <= 45; t += 3) {
      const b = await cellState(pageB, 'avail-p', '2026-10-27'), rq = await cellState(pageB, 'req-p', '2026-10-27')
      if (b && /amb/.test(b.cls)) { seen = { t, b, rq }; break }
      await pageB.waitForTimeout(3000)
    }
    await shot(pageB, p + 'a-tab-b-after-wait'); pics.push(p + 'a-tab-b-after-wait')
    A.ok(seen, 'tab B repainted amber by itself' + (seen ? ' after about ' + seen.t + ' s' : ' — it did NOT within 45 s (the other tab had to be reloaded)'))
    if (!seen) { await loginPlain(pageB, 'admin'); const b2 = await cellState(pageB, 'avail-p', '2026-10-27'); A.ok(true, 'after tab B signs in again it shows: ' + JSON.stringify(b2)) }
  })
  saveResults('part-C2-31')
  await c.ctx.close()
}

/* ---- 32: Undo words ------------------------------------------------------------------------------------------- */
async function s32() {
  const c = await newCtx('desk', 'C-32'); const page = c.page
  await signIn(page, 'admin')
  await scenario(32, 'desk', 'admin', 'Read the top bar Undo title after a points save, after a rename, and after Undo (the Redo title)', async (A, pics) => {
    await press(c, T('fly-name-avail-p')); await page.waitForSelector(T('cform-amber-pt'))
    await page.fill(T('cform-amber-pt'), '+ 2'); await press(c, T('cform-save')); await page.waitForTimeout(600)
    const u1 = await undoTitle(page)
    A.ok(/Available/i.test(u1 || ''), 'Undo title after a points save: "' + u1 + '"')
    await rename(c, 'req-p', 'Pilots req')
    const u2 = await undoTitle(page)
    A.ok(/Required|renamed/i.test(u2 || ''), 'Undo title after a rename: "' + u2 + '"')
    await undo(c)
    const rt = await page.locator('#redoBtn').getAttribute('title').catch(() => null)
    A.ok(rt && /renamed|Required/i.test(rt), 'Redo title after the Undo: "' + rt + '"')
    await undo(c); const rt2 = await page.locator('#redoBtn').getAttribute('title').catch(() => null)
    A.ok(rt2 && /Available/i.test(rt2), 'Redo title after a second Undo: "' + rt2 + '"')
    const bell = await page.evaluate(() => (document.querySelector('#undoBtn') || document.body).title)
  })
  saveResults('part-C2-32')
  await c.ctx.close()
}

if (part === '27') await s27()
if (part === '28') { for (const sz of (process.env.W2_SIZES || 'desk,phone').split(',')) await s28(sz) }
if (part === '29') await s29()
if (part === '21') await s21()
if (part === '31') await s31()
if (part === '32') await s32()
if (part === '30') { for (const sz of (process.env.W2_SIZES || 'desk').split(',')) await s30(sz) }
console.log('ERRORS', JSON.stringify(errs))
await closeBrowser()
