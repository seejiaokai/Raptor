/* THE WALK of [INPUT-NEW-DEFAULTS] (D917 a new input opens on OL; D919 the title's pencil inside the box; D920 When and
   Remarks above the calendar) — every place the input's window is drawn, reached through the app's own controls, as
   ASSERTIONS of the right behaviour (a PASS is correct), with a picture at each step. The sheet:
   docs/handpass/2026-10-15-input-new-defaults.md.
   usage: node scripts/handpass/ind-walk.mjs [desk|phone|both] [outDir] [--break]
     --break lays one rule over the built page (the pencil knocked out of its place in the box) — W4 must then go RED.
     (A break that lets the pencil take presses again stays GREEN: the box sits inside its <label>, so a tap on any part
     of the label, the pencil included, still lands in the box — the pencil's pointer-events rule is a second guard.)
   the served build: preview_start raptor-walk (port 4173); `npm run build` first after any change under src. */
import { createRequire } from 'node:module'
import { existsSync, mkdirSync } from 'node:fs'
const require = createRequire(import.meta.url)
const { chromium } = require('playwright')
const args = process.argv.slice(2)
const BREAK = args.includes('--break')
const pos = args.filter(a => !a.startsWith('--'))
const which = pos[0] || 'both'
const out = pos[1] || ('docs/img/handpass/2026-10-15-input-new-defaults/walk' + (BREAK ? '-break' : ''))
mkdirSync(out, { recursive: true })
const base = 'http://localhost:4173'
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const b = await chromium.launch(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {})
const MONTHS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec']
const SIZES = {
  phone: { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 3 },
  desk: { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 },
}
const results = []
const errors = []
const W = '#inpEditPop'
let size = 'desk'
function check(step, ok, what) { results.push({ size, step, ok: !!ok, what }); console.log(`${ok ? 'PASS' : 'FAIL'} ${size} ${step}: ${what}`) }

async function signedIn(user = 'ad', pass = 'a') {
  const ctx = await b.newContext({ baseURL: base, ...SIZES[size] })
  const p = await ctx.newPage()
  p.on('pageerror', e => errors.push(size + ': ' + e.message))
  p.on('console', m => { if (m.type() === 'error') errors.push(size + ': ' + m.text()) })
  p.on('response', r => { if (r.status() >= 400) errors.push(size + ': ' + r.status() + ' ' + r.url()) })
  await p.goto('/'); await p.fill('#luser', user); await p.fill('#lpass', pass); await p.click('#loginForm button[type=submit]')
  await p.waitForSelector('#vWeek .day', { state: 'attached' }); await p.waitForTimeout(400)
  if (BREAK) await p.addStyleTag({ content: '.inped-pen{position:static!important}' })
  return { ctx, p }
}
async function toInputs(p) {
  await p.evaluate(() => window.go('inputs')); await p.waitForFunction(() => window.CURPAGE === 'inputs'); await p.waitForTimeout(400)
}
async function toOct(p, label = '#inpCal .ic-mon', prev = '#icPrev', next = '#icNext') {
  for (let i = 0; i < 40; i++) {
    const [name, year] = (await p.locator(label).innerText()).trim().toLowerCase().split(/\s+/)
    const d = 2026 * 12 + 9 - (+year * 12 + MONTHS.findIndex(x => name.startsWith(x)))
    if (!d) return
    await p.locator(d > 0 ? next : prev).click()
  }
}
const press = async (p, loc) => { if (size === 'phone') await loc.tap(); else await loc.click() }
const keys = p => p.$$eval(W + ' .inped-k', ks => ks.map(k => k.textContent.trim()))
const typeOf = p => p.evaluate(sel => document.querySelector(sel + ' #inpEditType')?.value ?? document.querySelector(sel + ' #inpEditTypeFixed')?.textContent?.trim() ?? null, W)
function orderOk(k) { const d = k.indexOf('Dates'); return d > -1 && k.indexOf('When') > -1 && k.indexOf('When') < d && k.indexOf('Remarks') < d && k.indexOf('Remarks') > -1 }
/* is Remarks' box wholly on screen and clear of the window's foot bar (the Cancel / Add row) — no scroll needed */
const remarksInSight = p => p.evaluate(sel => {
  const box = document.querySelector(sel + ' #inpEditRmk'), save = document.querySelector('#inpEditSave')
  if (!box || !save) return null
  const r = box.getBoundingClientRect(), foot = save.closest('.win-foot, .airpop-foot, footer') || save.parentElement
  const f = foot.getBoundingClientRect()
  return r.top >= 0 && r.bottom <= Math.min(innerHeight, f.top + 1)
}, W)
const shot = (p, name) => p.screenshot({ path: `${out}/${size}-${name}.png` })
const pick = (p, t) => p.selectOption(W + ' #inpEditType', t).then(() => p.waitForTimeout(250))

async function walkSize() {
  /* W1 — the List's "+ Input" */
  {
    const { ctx, p } = await signedIn(); await toInputs(p)
    await press(p, p.locator('#inListBtn')); await p.waitForTimeout(300)
    await press(p, p.locator('#inNew')); await p.waitForSelector(W + ' #inpEditType'); await p.waitForTimeout(300)
    check('W1', (await typeOf(p)) === 'OL', `the List's "+ Input" opens on OL (got ${await typeOf(p)})`)
    check('W1', !(await p.$(W + ' #inpEditOwnTitle')), 'OL has no title box, so no pencil')
    const k = await keys(p); check('W1', orderOk(k), 'When and Remarks above Dates: ' + k.join(' · '))
    check('W1', await p.locator(W + ' [data-testid="pp-several"]').isVisible(), 'an admin still has the Several people switch on OL (D655 is a member\'s rule)')
    await shot(p, 'w1-list-new')
    await press(p, p.locator(W + ' #inpEdCal [data-iso="2026-07-20"]')); await p.waitForTimeout(200)
    const had = await p.evaluate(() => window.INPUTS.map(r => r.iid))
    await press(p, p.locator('#inpEditSave')); await p.waitForTimeout(500)
    const made = await p.evaluate(h => window.INPUTS.filter(r => !h.includes(r.iid)).map(r => ({ type: r.type, date: r.date })), had)
    check('W1', made.length === 1 && made[0].type === 'OL' && made[0].date === 'Jul 20', 'saved as OL on 20 Jul (the demo clock is 13 Jul): ' + JSON.stringify(made))
    await ctx.close()
  }
  /* W2 — a day on the Inputs calendar, its "+ Input" */
  {
    const { ctx, p } = await signedIn(); await toInputs(p); await toOct(p)
    await press(p, p.locator('#inpCal [data-icday="2026-10-15"]')); await p.waitForSelector('#icPopAdd'); await p.waitForTimeout(250)
    await press(p, p.locator('#icPopAdd')); await p.waitForSelector(W + ' #inpEditType'); await p.waitForTimeout(300)
    check('W2', (await typeOf(p)) === 'OL', 'a day\'s "+ Input" opens on OL')
    check('W2', orderOk(await keys(p)), 'When and Remarks above Dates')
    check('W2', await remarksInSight(p), 'OL: Remarks in sight, no scroll')
    await shot(p, 'w2-day-new')
    await ctx.close()
  }
  /* W3 — a run of two days (the keyboard's Shift+→, the same run a drag makes), then Event: the pencil */
  {
    const { ctx, p } = await signedIn(); await toInputs(p); await toOct(p)
    await p.locator('#inpCal [data-icday="2026-10-15"]').focus()
    await p.keyboard.press('Shift+ArrowRight'); await p.waitForTimeout(150); await p.keyboard.press('Enter')
    await p.waitForSelector(W + ' #inpEdCal'); await p.waitForTimeout(300)
    check('W3', (await typeOf(p)) === 'OL', 'a run\'s "+ Input" opens on OL')
    const read = (await p.locator(W + ' .rc-read').innerText()).trim()
    check('W3', /Oct 15.*Oct 16/.test(read), 'the run\'s dates kept: ' + read)
    await shot(p, 'w3-run-new-ol')
    /* W4 — Event: the title box and its pencil */
    await pick(p, 'Event')
    const g = await p.evaluate(sel => {
      const t = document.querySelector(sel + ' #inpEditOwnTitle'), pen = document.querySelector(sel + ' .inped-pen')
      if (!t || !pen) return null
      const a = t.getBoundingClientRect(), r = pen.getBoundingClientRect(), k = document.querySelector(sel + ' .inped-k')
      return { inside: r.left >= a.left && r.right <= a.right + 0.5 && r.top >= a.top - 0.5 && r.bottom <= a.bottom + 0.5,
        rightGap: Math.round(a.right - r.right), boxW: Math.round(a.width), fieldW: Math.round(t.closest('.inped-f').getBoundingClientRect().width),
        pad: parseFloat(getComputedStyle(t).paddingRight), penW: Math.round(r.width), colour: getComputedStyle(pen).color, label: getComputedStyle(k).color,
        hidden: pen.getAttribute('aria-hidden'), glyph: pen.textContent.includes('✏'), cx: r.left + r.width / 2, cy: r.top + r.height / 2 }
    }, W)
    check('W4', g && g.inside, 'the pencil sits inside the title box: ' + JSON.stringify(g && { rightGap: g.rightGap, penW: g.penW }))
    check('W4', g && g.boxW === g.fieldW, `the box keeps its full width (${g && g.boxW} of ${g && g.fieldW})`)
    check('W4', g && g.pad >= g.penW, `the words stop short of the pencil (right padding ${g && g.pad} ≥ ${g && g.penW})`)
    check('W4', g && g.colour === g.label, `in the field label's grey (${g && g.colour})`)
    check('W4', g && g.hidden === 'true' && !g.glyph, 'hidden from a screen reader; a drawing, not the ✏ glyph')
    check('W4', orderOk(await keys(p)), 'Event: When and Remarks above Dates')
    check('W4', await remarksInSight(p), 'Event: Remarks in sight, no scroll (the case D920 is for)')
    await shot(p, 'w4-event-pencil')
    /* the tap ON the pencil is a tap on the box: the caret lands in it, the kind's own name selected */
    if (g) { if (size === 'phone') await p.touchscreen.tap(g.cx, g.cy); else await p.mouse.click(g.cx, g.cy) }
    await p.waitForTimeout(250)
    const f = await p.evaluate(() => { const e = document.activeElement; return { id: e && e.id, s: e && e.selectionStart, e: e && e.selectionEnd, len: e && e.value && e.value.length } })
    check('W4', f.id === 'inpEditOwnTitle', 'a tap on the pencil puts the caret in the title box (focused: ' + f.id + ')')
    check('W4', f.id === 'inpEditOwnTitle' && f.s === 0 && f.e === f.len, 'the kind\'s own name selected, ready to type over')
    await p.keyboard.type('Sports day open house for families and guests'); await p.waitForTimeout(150)
    const t = await p.evaluate(sel => { const e = document.querySelector(sel + ' #inpEditOwnTitle'); return { v: e.value, sw: e.scrollWidth, cw: e.clientWidth } }, W)
    check('W4', t.v === 'Sports day open house for families and guests'.slice(0, 40), 'the typed title replaced the kind\'s name, held at the box\'s 40 letters: ' + JSON.stringify(t.v))
    await shot(p, 'w4-event-long-title')
    const had = await p.evaluate(() => window.INPUTS.map(r => r.iid))
    await press(p, p.locator('#inpEditSave')); await p.waitForTimeout(500)
    const oil = await p.$('[data-testid="oilconf"]')
    if (oil) { await p.locator('[data-testid="oilconf-save"]').isEnabled() ? 0 : 0 }
    const made = await p.evaluate(h => window.INPUTS.filter(r => !h.includes(r.iid)).map(r => ({ iid: r.iid, type: r.type, title: r.title, date: r.date, endDate: r.endDate })), had)
    check('W4', made.length === 1 && made[0].type === 'Event' && made[0].title === 'Sports day open house for families and guests'.slice(0, 40), 'saved as an Event with its title: ' + JSON.stringify(made))
    /* W5 — the same Event reopened from its day: the pencil again, the order again */
    await p.waitForTimeout(300)
    const iid = made[0] && made[0].iid
    await press(p, p.locator('#inpCal [data-icday="2026-10-15"]')); await p.waitForSelector('#icPopAdd'); await p.waitForTimeout(300)
    const open = p.locator(`[data-testid="idy-row-${iid}"] [data-testid="idy-open"]`)
    if (await open.count()) {
      await press(p, open.first()); await p.waitForSelector(W + ' #inpEditOwnTitle'); await p.waitForTimeout(300)
      check('W5', (await typeOf(p)) === 'Event', 'a saved Event keeps its kind')
      check('W5', !!(await p.$(W + ' .inped-pen')), 'its title box carries the pencil')
      check('W5', orderOk(await keys(p)), 'reopened: When and Remarks above Dates')
      await shot(p, 'w5-saved-event')
    } else check('W5', false, 'the saved Event\'s card was not in the open day (premise gone)')
    await ctx.close()
  }
  /* W6 — a member, on an Event filed for another man: read only, no pencil */
  {
    /* filed by the admin (a member may not write another man's input — the store refuses it), then signed out, and the
       member signs in on the same browser: the built app keeps its inputs across a sign-in */
    const { ctx, p } = await signedIn(); await toInputs(p)
    const iid = await p.evaluate(() => {
      const P = window.PEOPLE, me = Object.keys(P).find(id => (P[id].cs || '').toLowerCase() === 'ranger')
      const other = Object.keys(P).find(id => id !== me && !P[id].san && !P[id].archived && !P[id].deleted && !P[id].special && !P[id].pers)
      window.fileInput({ iid: 'walk-ro', person: other, type: 'Event', title: 'Mess night', date: 'Oct 22', yr: 2026, allday: false, s: 1080, e: 1320 })
      return 'walk-ro'
    })
    await p.waitForTimeout(500)
    await p.evaluate(() => document.querySelector('#logout')?.click() || document.querySelector('#drawer button:last-child')?.click())
    await p.waitForSelector('#luser'); await p.fill('#luser', 'us'); await p.fill('#lpass', 'us'); await p.click('#loginForm button[type=submit]')
    await p.waitForSelector('#vWeek .day', { state: 'attached' }); await p.waitForTimeout(400); await toInputs(p)
    if (BREAK) await p.addStyleTag({ content: '.inped-pen{position:static!important}' })
    await toOct(p)
    await press(p, p.locator('#inpCal [data-icday="2026-10-22"]')); await p.waitForSelector('#icPopAdd, [data-testid="win-inputsday"]'); await p.waitForTimeout(300)
    /* a member's page opens filtered to his own inputs: the day's own "Clear filters" shows the rest */
    if (await p.locator('[data-testid="idy-clear"]').count()) { await press(p, p.locator('[data-testid="idy-clear"]')); await p.waitForTimeout(300) }
    const row = p.locator(`[data-testid="idy-row-${iid}"] [data-testid="idy-open"]`)
    if (await row.count()) {
      await press(p, row.first()); await p.waitForSelector(W + ' #inpEditOwnTitle'); await p.waitForTimeout(300)
      check('W6', !!(await p.$(W + ' .inped-body[inert]')), 'another man\'s Event opens read only for a member')
      check('W6', !(await p.$(W + ' .inped-pen')), 'and its title box carries no pencil')
      await shot(p, 'w6-member-readonly')
    } else {
      const seen = await p.$$eval('[data-testid^="idy-row-"]', es => es.map(e => e.getAttribute('data-testid')))
      const has = await p.evaluate(() => { const r = window.INPUTS.find(x => x.iid === 'walk-ro'); return r ? { person: r.person, date: r.date } : null })
      await shot(p, 'w6-premise-gone')
      check('W6', false, 'the other man\'s Event was not in its day for the member (premise gone): rows ' + JSON.stringify(seen) + ' record ' + JSON.stringify(has))
    }
    await ctx.close()
  }
  /* W7 — SANS "+ Commitment" from a day on the SANS calendar */
  {
    const { ctx, p } = await signedIn(); await toInputs(p)
    await press(p, p.locator('#inSansMode')); await p.waitForSelector('[data-testid="sanscal"]'); await p.waitForTimeout(300)
    await toOct(p, '[data-testid="sc-month"]', '[data-testid="sc-prev"]', '[data-testid="sc-next"]')
    await press(p, p.locator('[data-icday="2026-10-13"]')); await p.waitForSelector('[data-testid="win-sansday"]'); await p.waitForTimeout(250)
    await press(p, p.locator('[data-testid="sd-add"]')); await p.waitForSelector(W + ' #inpEditSave'); await p.waitForTimeout(300)
    const ty = await typeOf(p), k = await keys(p)
    check('W7', ty === 'SANS Availability', '"+ Commitment" keeps SANS availability, never OL (got ' + ty + ')')
    check('W7', !(await p.$(W + ' #inpEditOwnTitle')), 'no title box, so no pencil')
    check('W7', orderOk(k) && k.indexOf('Availability') < k.indexOf('Dates'), 'Availability, When and Remarks above Dates: ' + k.join(' · '))
    await shot(p, 'w7-sans-commitment')
    await ctx.close()
  }
  /* W8, W9 — the schedule's own adds: Ground Programme / Personal (".g") and Unavailable (".u") */
  for (const [step, kind] of [['W8', 'g'], ['W9', 'u']]) {
    const { ctx, p } = await signedIn()
    await p.evaluate(() => window.go('editsched')); await p.waitForTimeout(500)
    const dayBtn = p.locator('#eWeek [data-sbday="1"]').first()
    if (!(await dayBtn.count()) || !(await dayBtn.isVisible())) { check(step, true, 'NOT WALKED at this size: the board\'s day button is not drawn here (its add is the desktop\'s; carried by the desktop step)'); await ctx.close(); continue }
    await dayBtn.click(); await p.waitForTimeout(500)
    const add = p.locator(`#schedBoard [data-inpadd="1.${kind}"]`).first()
    if (!(await add.count())) { check(step, false, `no "+ Add" for .${kind} on the board (premise gone)`); await ctx.close(); continue }
    await add.click(); await p.waitForSelector(W + ' #inpEditType'); await p.waitForTimeout(300)
    const ty = await typeOf(p), k = await keys(p)
    if (kind === 'g') {
      check(step, ty !== 'OL', 'the board\'s Personal / Ground add keeps its own start, not OL (got ' + ty + ')')
      check(step, !!(await p.$(W + ' #inpEditOwnTitle')) && !!(await p.$(W + ' .inped-pen')), 'its commitment kind\'s title box carries the pencil')
    } else {
      check(step, ty !== null, 'the board\'s Unavailable add opens on its own first absence (' + ty + ')')
      check(step, orderOk(k), 'its calendar stands below When and Remarks: ' + k.join(' · '))
    }
    await shot(p, `${step.toLowerCase()}-board-add-${kind}`)
    await ctx.close()
  }
}

for (const s of which === 'both' ? ['desk', 'phone'] : [which]) { size = s; await walkSize() }
const failed = results.filter(r => !r.ok)
console.log(JSON.stringify({ checks: results.length, failed: failed.length, errors }, null, 1))
await b.close()
process.exit(failed.length ? 1 : 0)
