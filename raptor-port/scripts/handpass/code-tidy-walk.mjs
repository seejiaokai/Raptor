// Walk of the 14 Nov 26 code tidy (job 2, chat 72): the same presses on `main` and on the tidy branch, a picture of
// each step with the same name in two folders, then a byte compare of each pair. Serve each build first
// (`npx vite preview --outDir <dir> --port <p> --strictPort`); BASE and TAG say which one this run drives.
// usage, from raptor-port/:  BASE=http://localhost:4313 TAG=main node scripts/handpass/code-tidy-walk.mjs [part]
// parts: rooms (steps 1-3) · keys (step 4) · round (step 5) — none = all.
import { chromium, devices } from '@playwright/test'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'

console.log('code-tidy-walk v1')
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const launchOptions = existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {}
const BASE = process.env.BASE
const TAG = process.env.TAG
if (!BASE || !TAG) throw new Error('set BASE and TAG')
const SHOTS = process.env.SHOTS || 'C:/Users/User/projects/Raptor/raptor-port/docs/img/handpass/2026-11-14-code-tidy'
const OUT = path.join(SHOTS, TAG)
mkdirSync(OUT, { recursive: true })
const TRAIL = !!process.env.TRAIL
const part = process.argv[2] || 'all'
const T0 = '2026-11-04T09:00:00+08:00'
const browser = await chromium.launch(launchOptions)
const notes = []
const note = s => { notes.push(s); console.log(s) }

const SIZES = {
  d1536: { viewport: { width: 1536, height: 864 } },
  d1340: { viewport: { width: 1340, height: 800 } },
  d1280: { viewport: { width: 1280, height: 800 } },
  d1229: { viewport: { width: 1229, height: 600 } },
  phone: { viewport: { width: 402, height: 874 }, hasTouch: true, isMobile: true, deviceScaleFactor: 2, userAgent: devices['iPhone 13'].userAgent },
}
async function world(size, pageName = 'inputs') {
  const ctx = await browser.newContext(SIZES[size])
  await ctx.clock.install({ time: new Date(T0) })
  const page = await ctx.newPage()
  page.setDefaultTimeout(15000)
  const errs = []
  page.on('pageerror', e => errs.push('pageerror: ' + String(e).slice(0, 200)))
  await page.goto(BASE + '/?fresh=1')
  await page.waitForSelector('#luser')
  await page.fill('#luser', 'ad'); await page.fill('#lpass', 'a')
  await page.click('#loginForm button[type=submit]')
  await page.waitForSelector('#vWeek .day', { state: 'attached' })
  await page.addStyleTag({ content: '#toastEl, .toast { visibility: hidden !important; }' })
  if (pageName) {
    await page.evaluate(p => window.go(p), pageName)
    await page.waitForFunction(p => window.CURPAGE === p, pageName)
  }
  await page.waitForTimeout(500)
  return { ctx, page, phone: size === 'phone', errs }
}
async function settle(w) { await w.page.clock.runFor(900); await w.page.waitForTimeout(300) }
async function press(w, sel) {
  const l = w.page.locator(sel).first()
  await l.scrollIntoViewIfNeeded().catch(() => {})
  if (w.phone) await l.tap(); else await l.click()
  await settle(w)
}
async function drag(w) {
  const t = await w.page.locator('[data-testid="win-inputedit"] .win-ttl').boundingBox()
  await w.page.mouse.move(t.x + 10, t.y + t.height / 2); await w.page.mouse.down()
  await w.page.mouse.move(t.x - 600, t.y + 120, { steps: 10 }); await w.page.mouse.up()
  await settle(w)
}
const shot = async (w, name) => { await w.page.screenshot({ path: path.join(OUT, name + '.png') }); }
/* what the list / cards measure while the window stands: the numbers that "narrowing" would change */
async function measure(w, name, sel) {
  const m = await w.page.evaluate(s => {
    const out = {}
    for (const e of document.querySelectorAll(s)) { const r = e.getBoundingClientRect(); out[(e.id || e.className || e.tagName).toString().slice(0, 40)] = Math.round(r.width) + 'x' + Math.round(r.height) + '@' + Math.round(r.left) + ',' + Math.round(r.top) }
    const win = document.querySelector('.floatwin.inpedwin'); if (win) { const r = win.getBoundingClientRect(); out.WINDOW = Math.round(r.width) + 'x' + Math.round(r.height) + '@' + Math.round(r.left) + ',' + Math.round(r.top) }
    return out
  }, sel)
  note(`MEASURE ${TAG} ${name} ${JSON.stringify(m)}`)
}

async function rooms() {
  /* steps 1 and 2: desktop */
  for (const size of ['d1536', 'd1340', 'd1280']) {
    const w = await world(size)
    await press(w, '#inListBtn'); await press(w, '#inRangeBtn'); await press(w, '#inRangeAll')
    await shot(w, `s1-${size}-1-list`)
    await measure(w, `s1-${size}-1-list`, '.inputs-workspace, #inBody')
    await press(w, '#inNew')
    await shot(w, `s1-${size}-2-new-at-rest`)
    await measure(w, `s1-${size}-2-new-at-rest`, '.inputs-workspace, #inBody')
    await drag(w)
    await shot(w, `s1-${size}-3-dragged`)
    await measure(w, `s1-${size}-3-dragged`, '.inputs-workspace, #inBody')
    await w.page.keyboard.press('Escape'); await settle(w)
    await shot(w, `s1-${size}-4-closed`)
    await press(w, '#inBody tr .in-open')
    await shot(w, `s1-${size}-5-reopened`)
    await measure(w, `s1-${size}-5-reopened`, '.inputs-workspace, #inBody')
    if (w.errs.length) note('ERRORS ' + w.errs.join(' | '))
    await w.ctx.close()
  }
  for (const size of ['d1536', 'd1229']) {
    const w = await world(size)
    await press(w, '#inMedBtn'); await w.page.waitForSelector('#medView .medcard')
    await shot(w, `s2-${size}-1-cards`)
    await measure(w, `s2-${size}-1-cards`, '#medView, .medcard')
    await press(w, '#medNew')
    await shot(w, `s2-${size}-2-new-at-rest`)
    await measure(w, `s2-${size}-2-new-at-rest`, '#medView, .medcard')
    await drag(w)
    await shot(w, `s2-${size}-3-dragged`)
    await measure(w, `s2-${size}-3-dragged`, '#medView, .medcard')
    await w.page.keyboard.press('Escape'); await settle(w)
    await press(w, '.medcard'); await press(w, '#docViewEdit')
    await shot(w, `s2-${size}-4-edit-opened`)
    await measure(w, `s2-${size}-4-edit-opened`, '#medView, .medcard')
    if (w.errs.length) note('ERRORS ' + w.errs.join(' | '))
    await w.ctx.close()
  }
  /* step 3: phone */
  let w = await world('phone')
  await press(w, '#inListBtn'); await press(w, '#inRangeBtn'); await press(w, '#inRangeAll')
  await press(w, '#inNew')
  await shot(w, 's3-phone-1-input-new')
  await measure(w, 's3-phone-1-input-new', '.inputs-workspace, #inBody')
  await w.ctx.close()
  w = await world('phone')
  await press(w, '#inMedBtn'); await w.page.waitForSelector('#medView .medcard')
  await press(w, '#medNew')
  await shot(w, 's3-phone-2-medical-new')
  await measure(w, 's3-phone-2-medical-new', '#medView, .medcard')
  await w.ctx.close()
}

if (part === 'all' || part === 'rooms') await rooms()
/* what has the keyboard ring right now, in words (and the item's own mark, so "the other input's button" is told apart) */
const ringOf = w => w.page.evaluate(() => {
  const e = document.activeElement
  if (!e || e === document.body) return 'BODY (nothing focused)'
  const day = e.closest('.day')?.getAttribute('data-day')
  const cs = getComputedStyle(e)
  return `${e.tagName.toLowerCase()}.${(e.className || '').toString().slice(0, 30)} "${(e.textContent || '').trim().slice(0, 20)}" day=${day} acc=${e.dataset.acc} acck=${e.dataset.acck} outline=${cs.outlineStyle}/${cs.outlineColor}`
})
const addInput = async (w, person, type, iso, remark) => {
  await press(w, '#inNew')
  await w.page.selectOption('#inpEditPerson', person)
  await w.page.selectOption('#inpEditType', type)
  await w.page.fill('#inpEditRmk', remark)
  await press(w, `[data-testid="inpEdCal-day-${iso}"]`)
  await press(w, '#inpEditSave')
}

async function keys() {
  const w = await world('d1536')
  /* a day with two inputs offering "→ Ground" / "→ Unavail": two Personal inputs of two men filed for Tue 14 Jul, the
     Edit Schedule week's own day (the demo week's first day, Mon 13 Jul, is "Today") */
  await press(w, '#inListBtn')
  await addInput(w, 'dj', 'Personal', '2026-07-14', 'walk-one')
  await addInput(w, 'shaft', 'Personal', '2026-07-14', 'walk-two')
  await w.page.evaluate(() => window.go('editsched')); await settle(w)
  /* the day's Personal Inputs fold is shut; open it, and Reject both (a rejected input offers → Ground / → Unavail) */
  const day = '#eWeek .day[data-day="1"]'
  await w.page.locator(`${day} [data-pitog]`).first().click(); await settle(w)
  for (let i = 0; i < 2; i++) { const rj = w.page.locator(`${day} button[data-acc="x"]`).first(); if (await rj.count()) { await rj.click(); await settle(w) } }
  await shot(w, 's4-0-setup-two-rejected')
  const sel = '#eWeek .day button[data-acc="g"]'
  const n = await w.page.locator(sel).count()
  note(`KEYS ${TAG}: ${n} "→ Ground" buttons in the week`)
  if (n < 2) { note('KEYS MISSING: fewer than two "→ Ground" buttons'); await shot(w, 's4-0-no-ground'); await w.ctx.close(); return }
  const first = w.page.locator(sel).nth(0), second = w.page.locator(sel).nth(1)
  const k1 = await first.getAttribute('data-acck'), k2 = await second.getAttribute('data-acck')
  note(`KEYS ${TAG}: first button input ${k1 === k2 ? 'SAME (bad)' : 'differs'} from second`)
  await first.scrollIntoViewIfNeeded()
  await shot(w, 's4-1-week-before')
  await first.focus()
  /* Tab to the second input's "→ Ground" (through the first's "→ Unavail") */
  /* Tab from the first button runs into the day's text cells, where it stops on a cell that holds it ("Medically down", measured on both builds); so the keyboard is put on the second "-> Ground" the way a Tab arrival would, and Enter is real */
  await w.page.keyboard.press("Tab"); note(`KEYS ${TAG}: one Tab from the first Ground lands on: ${(await ringOf(w)).slice(0, 60)}`)
  await second.focus()
  note(`KEYS ${TAG}: before Enter ring on: ${await ringOf(w)}`)
  await shot(w, 's4-2-ring-on-second-ground')
  await w.page.keyboard.press('Enter'); await settle(w)
  await shot(w, 's4-3-after-enter')
  const oilEls = await w.page.evaluate(() => [...document.querySelectorAll('.oilwait, .oilsheet, [data-testid*="oil"]')].map(e => (e.getAttribute('data-testid') || e.className) + (e.offsetParent ? '' : '(hidden)')).join(','))
  const oil = oilEls
  note(`KEYS ${TAG}: after Enter, OIL question elements: ${oil}; ring on: ${await ringOf(w)}`)
  /* answer a question if one opened */
  const yes = w.page.locator('button:has-text("Yes")').first()
  if (await yes.isVisible().catch(() => false)) { await yes.click(); await settle(w); const sv = w.page.locator('button:has-text("Save")').first(); if (await sv.isVisible().catch(() => false)) { await sv.click(); await settle(w) } }
  await shot(w, 's4-4-ring-afterwards')
  note(`KEYS ${TAG}: ring afterwards: ${await ringOf(w)}`)
  const stillG = await w.page.locator(sel).count()
  note(`KEYS ${TAG}: "→ Ground" buttons left in the week: ${stillG} (was ${n})`)
  /* the day's ⓘ: Enter opens, Escape closes, the ring comes back to it */
  const info = w.page.locator('#eWeek .dinfobtn').first()
  await info.scrollIntoViewIfNeeded(); await info.focus()
  await w.page.keyboard.press('Enter'); await settle(w)
  await shot(w, 's4-5-info-open')
  await w.page.keyboard.press('Escape'); await settle(w)
  await shot(w, 's4-6-info-closed')
  note(`KEYS ${TAG}: after info Escape, ring on: ${await ringOf(w)}`)
  /* the board: + Block, Templates, + Wave */
  await w.page.evaluate(() => window.openScheduler(0)); await settle(w)
  await w.page.waitForSelector('#schedBoard:not([hidden])', { state: 'visible' })
  for (const [i, label] of [[1, '+ Block'], [2, 'Templates'], [3, '+ Wave']]) {
    const b = w.page.locator(`#schedBoard button:has-text("${label}"):visible`).first()
    if (!(await b.count())) { note(`KEYS MISSING ${TAG}: board button ${label} not found`); continue }
    await b.focus()
    await shot(w, `s4-7${i}-board-${i}-focused`)
    await w.page.keyboard.press('Enter'); await settle(w)
    await shot(w, `s4-7${i}-board-${i}-open`)
    await w.page.keyboard.press('Escape'); await settle(w)
    await shot(w, `s4-7${i}-board-${i}-closed`)
    note(`KEYS ${TAG}: board ${label}: after Escape ring on: ${await ringOf(w)}`)
  }
  if (w.errs.length) note('ERRORS ' + w.errs.join(' | '))
  await w.ctx.close()
}

async function round() {
  /* the plain-user round: an input end to end on the Inputs page */
  let w = await world('d1536')
  await press(w, '#inListBtn')
  await press(w, '#inNew')
  await w.page.selectOption('#inpEditPerson', 'dj')
  await w.page.selectOption('#inpEditType', 'Training')
  await w.page.fill('#inpEditRmk', 'walk-round')
  await press(w, '[data-testid="inpEdCal-day-2026-07-16"]')
  await shot(w, 's5-1-input-filled')
  await press(w, '#inpEditSave')
  await shot(w, 's5-2-input-saved')
  const row = w.page.locator('#inBody tr:has-text("walk-round")').first()
  note(`ROUND ${TAG}: saved input row present: ${await row.count()}`)
  await row.locator('.in-open').click(); await settle(w)
  await shot(w, 's5-3-input-reopened')
  await w.page.locator('[data-testid="win-inputedit-x"]').click(); await settle(w)
  await shot(w, 's5-4-input-closed')
  /* the Medical tab */
  await press(w, '#inMedBtn'); await w.page.waitForSelector('#medView .medcard')
  const before = await w.page.locator('#medView .medcard').count()
  await press(w, '#medNew')
  await shot(w, 's5-5-medical-new')
  const med = await w.page.evaluate(() => [...document.querySelector('.floatwin.inpedwin').querySelectorAll('select,input')].map(e => e.tagName + '#' + e.id + '=' + (e.value || '')).join(' '))
  note(`ROUND ${TAG}: medical window fields: ${med}`)
  await w.page.selectOption('#inpEditPerson', 'dj')
  await w.page.fill('#inpEditRmk', 'walk-med')
  await press(w, '[data-testid="inpEdCal-day-2026-07-13"]')
  await shot(w, 's5-6-medical-filled')
  await press(w, '#inpEditSave')
  await shot(w, 's5-6b-medical-no-document-question')
  const nod = w.page.locator('button:has-text("No document")').first()
  if (await nod.isVisible().catch(() => false)) { await nod.click(); await settle(w) }
  await shot(w, 's5-7-medical-saved')
  const after = await w.page.locator('#medView .medcard').count()
  note(`ROUND ${TAG}: medical cards ${before} -> ${after}`)
  const card = w.page.locator('#medView .medcard:has-text("Ace")').first()
  await card.click(); await settle(w)
  await shot(w, 's5-8-medical-card-opened')
  await w.page.keyboard.press('Escape'); await settle(w)
  await shot(w, 's5-9-medical-card-closed')
  if (w.errs.length) note('ERRORS ' + w.errs.join(' | '))
  await w.ctx.close()
  /* the cut-off gear on the Inputs calendar, and on the SANS calendar */
  for (const [label, tab, prefix] of [['inputs', '#inCalBtn', 'iset'], ['sans', 'text=SANS', 'sset']]) {
    w = await world('d1536')
    if (label === 'inputs') { const b = w.page.locator('#inCalBtn'); if (await b.count()) await press(w, '#inCalBtn') } else await w.page.locator('button:visible:has-text("SANS")').first().click()
    await settle(w)
    await shot(w, `s5-${label}-1-calendar`)
    const gear = w.page.locator('button[aria-label*="ettings" i], button[title*="ettings" i], button[data-testid*="gear" i], button[data-testid*="settings" i]').first()
    if (!(await gear.count())) { note(`ROUND MISSING ${TAG}: no gear on ${label} calendar`); await w.ctx.close(); continue }
    await gear.click(); await settle(w)
    await shot(w, `s5-${label}-2-gear-open`)
    const md = w.page.locator(`[data-testid="${prefix}-mode-days"]`); if (await md.count()) { await md.click(); await settle(w) }
    const lead = w.page.locator(`[data-testid="${prefix}-lead"]`)
    if (await lead.count()) {
      await lead.fill('3'); await settle(w)
      await shot(w, `s5-${label}-3-typed-3`)
      note(`ROUND ${TAG}: ${label} gear: example line "${await w.page.locator(`[data-testid="${prefix}-example"]`).textContent().catch(() => 'none')}"`)
    } else note(`ROUND MISSING ${TAG}: ${label} gear has no days box`)
    await w.page.keyboard.press('Escape'); await settle(w)
    await shot(w, `s5-${label}-4-closed`)
    await w.ctx.close()
  }
}

if (part === 'all' || part === 'keys') await keys()
if (part === 'all' || part === 'round') await round()
writeFileSync(path.join(OUT, '..', `notes-${TAG}-${part}.txt`), notes.join('\n') + '\n')
await browser.close()
console.log('done', TAG, part)
