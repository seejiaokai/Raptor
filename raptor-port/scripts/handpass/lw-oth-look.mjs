// [LW-OTH-MANNING] (his D1335, D1336 — 24 Oct 26): the questions put to him before UNA is reworked into "Other" (OTH),
// drawn on the real app. Built on the branch head that still carries UNA; every drawn-in part is made of the app's own
// classes (the window's "all day" tick, its Duration buttons, its grey "till" words) and is named on the page.
// Run against a served build: LW_PORT=4180 node scripts/handpass/lw-oth-look.mjs
process.env.LW_OUT ||= '2026-10-24-lw-r2/oth-q'
const { newCtx, closeBrowser, OUT } = await import('./lw-r3-lib.mjs')
import path from 'node:path'

const PORT = process.env.LW_PORT || '4180'
const URL = `http://localhost:${PORT}/?fresh=1`
const DAY = '2026-07-15'   // Wednesday of the demo week: PIKE is on an overseas duty that day (Unavailable)
const MONTHS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec']

async function signIn(w, who) {
  const { page } = w
  const [u, p] = who === 'admin' ? ['ad', 'a'] : ['us', 'us']
  await page.goto(URL)
  await page.fill('#luser', u); await page.fill('#lpass', p)
  await page.click('#loginForm button[type=submit]')
  await page.waitForSelector('#vWeek .day')
}
async function month(page, y, m) {
  for (let i = 0; i < 60; i++) {
    const [name, year] = (await page.locator('#inpCal .ic-mon').innerText()).trim().toLowerCase().split(/\s+/)
    const d = y * 12 + (m - 1) - (+year * 12 + MONTHS.indexOf(name.slice(0, 3)))
    if (!d) return
    await page.locator(d > 0 ? '#icNext' : '#icPrev').click()
    await page.waitForTimeout(120)
  }
  throw new Error('month not reached')
}
const press = (w, sel) => w.phone ? w.page.locator(sel).first().tap() : w.page.locator(sel).first().click()

/* opens a NEW input on DAY from the Inputs calendar, its type picked */
async function newInput(w, type) {
  const { page } = w
  await page.evaluate(() => window.go('inputs'))
  await page.waitForSelector('#inpCal .ic-mon')
  await month(page, 2026, 7)
  const cell = page.locator(`#inpCal [data-icday="${DAY}"]`)
  if (w.phone) await cell.tap({ position: { x: 8, y: 8 } }); else await cell.click({ position: { x: 8, y: 8 } })
  await press(w, '#icPopAdd')
  await page.waitForSelector('[data-testid="win-inputedit"]')
  await page.selectOption('#inpEditType', type)
  await page.waitForTimeout(250)
}
const win = page => page.locator('[data-testid="win-inputedit"]')
async function winShot(w, name) {
  await w.page.waitForTimeout(200)
  await win(w.page).screenshot({ path: path.join(OUT, name + '.png'), scale: w.phone ? 'device' : 'css' })
  /* and the part the question is about (D1222): from the Type row to the Remarks row */
  const clip = await w.page.evaluate(() => {
    const rows = [...document.querySelectorAll('[data-testid="win-inputedit"] .inped-f')]
    const k = r => r.querySelector('.inped-k')?.textContent.trim()
    const a = rows.find(r => k(r) === 'Type'), b = rows.find(r => k(r) === 'Remarks')
    const wr = document.querySelector('[data-testid="win-inputedit"]').getBoundingClientRect()
    const ra = a.getBoundingClientRect(), rb = b.getBoundingClientRect()
    return { x: wr.x, y: ra.y - 8, width: wr.width, height: rb.bottom - ra.y + 16 }
  })
  await w.page.screenshot({ path: path.join(OUT, name + '-cut.png'), scale: w.phone ? 'device' : 'css', clip })
  console.log('  ', name)
}

/* the drawn-in row: after the window's Duration row, the app's own row shape (.inped-f, its .inped-k heading) */
async function addRow(page, html) {
  await page.evaluate(html => {
    document.querySelector('[data-oth-new]')?.remove()
    const rows = [...document.querySelectorAll('[data-testid="win-inputedit"] .inped-f')]
    const dur = rows.find(r => r.querySelector('.inped-k')?.textContent.trim() === 'Duration')
    const row = document.createElement('div')
    row.className = 'inped-f'; row.setAttribute('data-oth-new', '1')
    row.innerHTML = html
    // marked as drawn in: the app's own just-added ring colour, a dashed edge so it reads as a proposal
    row.style.outline = '2px dashed rgba(59,198,232,.85)'; row.style.outlineOffset = '3px'; row.style.borderRadius = '6px'
    dur.after(row)
  }, html)
  if (!(await page.locator('[data-oth-new]').count())) throw new Error('the drawn-in row is not there')
}
const TICK = (half) => `<span class="inped-k">Leave War</span><div class="inped-when" style="flex-direction:row;align-items:center;flex-wrap:nowrap"><label class="inped-ad">` +
  `<input type="checkbox" checked> Off the manning</label><span class="inped-till" style="margin-left:8px">${half}</span></div>`
const CHIPS = `<span class="inped-k">Leave War</span><div class="inped-when"><div class="spanpick" role="group">` +
  ['No', 'All day', 'AM', 'PM'].map(l => `<button type="button" class="spanbtn${l === 'All day' ? ' on' : ''}">${l}</button>`).join('') +
  `</div></div>`

async function q2(size, who) {
  const w = await newCtx(size)
  await signIn(w, who)
  const tag = `${size}`
  await newInput(w, 'Other')
  await winShot(w, `q2-0-today-${tag}`)
  await w.page.locator('#inpEditAllday').check()
  await addRow(w.page, TICK('all day'))
  await winShot(w, `q2-A1-tick-allday-${tag}`)
  // the same tick with times typed in the morning: its half follows the Duration above
  await w.page.locator('#inpEditAllday').uncheck()
  await w.page.locator('#inpEditStart').fill('08:00'); await w.page.locator('#inpEditEnd').fill('11:00')
  await addRow(w.page, TICK('AM'))
  await winShot(w, `q2-A2-tick-am-${tag}`)
  await w.page.locator('#inpEditAllday').check()
  await addRow(w.page, CHIPS)
  await winShot(w, `q2-B-chips-${tag}`)
  if (w.errs.length) console.log(w.errs.join('\n'))
  await w.ctx.close()
}

/* Q3 — OTH's colour: the war's box and its Legend line, the UNA box relabelled OTH (the colour as built) */
async function q3(size) {
  const w = await newCtx(size)
  const { page } = w
  await signIn(w, 'admin')
  await page.evaluate(() => window.go('leavewar'))
  await page.waitForSelector('[data-testid="row-stiff"]')
  await page.waitForTimeout(600)
  await press(w, '[data-testid^="month-JAN"]')
  await page.waitForSelector('.c.k-una', { timeout: 8000 })
  const box = page.locator('.c.k-una').first()
  await box.scrollIntoViewIfNeeded(); await page.waitForTimeout(300)
  await page.evaluate(() => document.querySelectorAll('.c.k-una').forEach(e => { if (e.firstChild) e.lastChild.textContent = 'OTH'; else e.textContent = 'OTH' }))
  const b = await box.boundingBox()
  const pad = w.phone ? 70 : 140
  await page.screenshot({ path: path.join(OUT, `q3-grid-${size}.png`), scale: w.phone ? 'device' : 'css',
    clip: { x: Math.max(0, b.x - pad * 2.2), y: Math.max(0, b.y - pad), width: pad * 4.4, height: pad * 2 } })
  console.log('   q3-grid-' + size)
  if (w.errs.length) console.log(w.errs.join('\n'))
  await w.ctx.close()
}

/* Q4 — where an "Other" stands on the schedule today: under Personal Inputs; an overseas duty (and UNA) under
   Unavailable. An "Other" is filed for real on DAY first, through the Inputs page, for SLAMMED. */
async function q4(size) {
  const w = await newCtx(size)
  const { page } = w
  await signIn(w, 'admin')
  await newInput(w, 'Other')
  const opts = await page.locator('#inpEditPerson option').allTextContents()
  const pick = opts.find(t => /slammed/i.test(t)) || opts.find(t => t && !/^(—|all|choose)/i.test(t))
  await page.selectOption('#inpEditPerson', { label: pick })
  await page.locator('#inpEditRmk').fill('Family matter')
  await press(w, '#inpEditSave')
  await page.waitForTimeout(500)
  // a document question may follow a save (D1150) — never a hard stop
  for (const id of ['doc-ask-no', 'inped-doc-no', 'docask-skip']) if (await page.locator(`[data-testid="${id}"]`).count()) await press(w, `[data-testid="${id}"]`)
  await page.waitForTimeout(400)
  console.log('   filed:', await page.evaluate(d => (window).INPUTS.filter(r => r.type === 'Other').map(r => r.date + ' ' + r.person + ' acc=' + r.acc).join(' | '), DAY))
  await page.evaluate(() => window.go('editsched'))
  await page.waitForTimeout(900)
  await page.locator('#eWeek [data-sbday="2"]').first().click()
  await page.waitForSelector('#schedBoard')
  await page.waitForTimeout(700)
  const secs = await page.evaluate(() => [...document.querySelectorAll('#schedBoard .sb-sec')].map((e, i) => i + ': ' + (e.querySelector('h3,h4,.sb-sech,.sb-h')?.textContent || e.textContent).trim().slice(0, 40)))
  console.log('   board sections:', secs.join(' || '))
  for (const [name, re] of [['personal', /personal inputs/i], ['unavail', /unavailable/i]]) {
    const sec = page.locator('#schedBoard .sb-sec').filter({ hasText: re }).first()
    if (!(await sec.count())) { console.log('   no section', name); continue }
    await sec.scrollIntoViewIfNeeded(); await page.waitForTimeout(250)
    await sec.screenshot({ path: path.join(OUT, `q4-${name}-${size}.png`), scale: 'css' })
    console.log('   q4-' + name + '-' + size)
  }
  if (w.errs.length) console.log(w.errs.join('\n'))
  await w.ctx.close()
}

const only = process.argv[2]
if (!only || only === 'q2') { await q2('phone', 'member'); await q2('desk', 'admin') }
if (!only || only === 'q3') { await q3('phone'); await q3('desk') }
if (!only || only === 'q4') { await q4('desk') }
await closeBrowser()

/* Q5 (his "Then they start planning a lot of things that is OTH on the leave war", 24 Oct 26): the suggestion drawn —
   not an input at all, but an admin's quiet mark on the war: "Leave out of manning" in the bid window's ⋯ menu (a clone
   of its "Post out" item), and the cell wearing a faint hatch only admins see. */
async function q5(size) {
  const w = await newCtx(size)
  const { page } = w
  await signIn(w, 'admin')
  await page.evaluate(() => window.go('leavewar'))
  await page.waitForSelector('[data-testid="row-stiff"]')
  await page.waitForTimeout(600)
  const cell = d => page.locator(`[data-testid="cell-slipway-${d}"]`)
  await press(w, '[data-testid^="month-FEB"]'); await page.waitForTimeout(500)
  await cell('2026-02-11').scrollIntoViewIfNeeded(); await press(w, '[data-testid="cell-slipway-2026-02-11"]')
  await page.waitForSelector('[data-testid="bid-picker"]')
  await press(w, '[data-testid="bid-more"]'); await page.waitForSelector('.bp-menu')
  await page.evaluate(() => {
    const po = document.querySelector('[data-testid="bid-postout"]')
    const b = po.cloneNode(true); b.removeAttribute('data-testid'); b.textContent = 'Leave out of manning'
    b.style.outline = '2px dashed rgba(59,198,232,.9)'; b.style.outlineOffset = '2px'
    po.before(b)
  })
  await page.waitForTimeout(200)
  await page.locator('[data-testid="bid-picker"]').screenshot({ path: path.join(OUT, `q5-menu-${size}.png`), scale: w.phone ? 'device' : 'css' })
  await page.keyboard.press('Escape'); await page.keyboard.press('Escape'); await page.waitForTimeout(300)
  // the mark: three days left out of manning, a faint grey hatch (drawn in), no code, no colour of a kind
  await page.evaluate(() => {
    for (const d of ['2026-02-16', '2026-02-17', '2026-02-18']) {
      const td = document.querySelector(`[data-testid="cell-slipway-${d}"]`)
      td.style.backgroundImage = 'repeating-linear-gradient(135deg, rgba(160,170,185,.30) 0 2px, transparent 2px 7px)'
    }
  })
  const b = await cell('2026-02-17').boundingBox()
  const pad = w.phone ? 60 : 110
  await page.screenshot({ path: path.join(OUT, `q5-cells-${size}.png`), scale: w.phone ? 'device' : 'css',
    clip: { x: Math.max(0, b.x - pad * 2.5), y: Math.max(0, b.y - pad), width: pad * 5, height: pad * 2 } })
  console.log('   q5-' + size)
  if (w.errs.length) console.log(w.errs.join('\n'))
  await w.ctx.close()
}
if (only === 'q5') { await q5('phone'); await closeBrowser() }
