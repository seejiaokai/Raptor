// [LW-BIDPICKER-CSS-INSIDE] (14 Nov 26) — the proof that moving bidpicker.css's 202 rules inside its `#page-leavewar { … }`
// wrapper changes nothing a person sees. Walk-scripts §8 ("when nothing on screen should change"): record the running
// build before the edit and after it, compare the records as text.
//
// It serves nothing: point it at a build already served (`npx vite preview --port 4291 --strictPort`, BASE below). For
// each STATE (every window the moved rules draw — the one-day bid window as admin and member, a whole day, a half, two
// entries, the drag window, the day's list, the counter's window, Open for bidding, Grades, the person window, Events,
// Settings, the day panel, the Required panel, …) at a desktop (1536 x 864) and his iPhone (402 x 874, touch), in a
// fresh world each, it saves:
//   - every element inside the open windows, its getComputedStyle (every property) and its ::before / ::after;
//   - a picture of the screen.
// With --sim (run on the BEFORE build) it also works out, on the same DOM, the cascade a second way: for every element a
// moved rule matches, which declaration wins each property with the moved rules at their old weight and at their new one
// (+1 id), in four worlds (the real hover / focus state or every :hover / :focus on; the media that apply now or every
// @media at once), and lists every element and property where the winner's VALUE would change — the competitors the
// move must not flip; plus which moved rules no captured state reached (judged by hand from the source).
//
// usage, from raptor-port/:  node scripts/handpass/lw-bidpicker-css-capture.mjs <before|after|...> [--sim] [--only s1,s2] [--size desk|phone]
// then:                      node scripts/handpass/lw-bidpicker-css-capture.mjs --diff <labelA> <labelB>
import { chromium, devices } from '@playwright/test'
import { existsSync, mkdirSync, writeFileSync, readFileSync, readdirSync, unlinkSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const here = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(here, '../../docs/img/handpass/2026-11-14-bidpicker-css')
const BASE = process.env.BASE || 'http://localhost:4291'
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const launchOptions = existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {}
const args = process.argv.slice(2)
const flag = (k) => { const i = args.indexOf(k); return i < 0 ? null : (args[i + 1] ?? '') }

/* a state's record kept small: each property's most common value across its elements is written once (`base`), and each
   element and pseudo-element carries only where it differs — unpack() gives back every property of every one */
function pack(els) {
  const cnt = {}
  for (const k in els) for (const part in els[k]) if (part !== 'cls') for (const [p, v] of Object.entries(els[k][part])) { const m = (cnt[p] ||= new Map()); m.set(v, (m.get(v) || 0) + 1) }
  const base = {}
  for (const p in cnt) base[p] = [...cnt[p]].sort((x, y) => y[1] - x[1])[0][0]
  const out = {}
  for (const k in els) { out[k] = { cls: els[k].cls }; for (const part in els[k]) if (part !== 'cls') { const d = {}; for (const p in base) if (els[k][part][p] !== base[p]) d[p] = els[k][part][p] ?? null; out[k][part] = d } }
  return { base, els: out }
}
function unpack(st) {
  const out = {}
  for (const k in st.els) { out[k] = { cls: st.els[k].cls }; for (const part in st.els[k]) if (part !== 'cls') out[k][part] = { ...st.base, ...st.els[k][part] } }
  return out
}

/* ------------------------------------------------------------------ the diff */
if (args[0] === '--diff') {
  const [a, b] = [args[1], args[2]]
  // A record's id is minted afresh on every run (`dl-r-rmw1etkhx15u7f`, `closed-bid-rmw1eti2m1se4u`), and the element keys
  // carry it through their test names — so it is written as ID before two runs are compared; the position stays in the key.
  const noId = k => k.replace(/-r[a-z0-9]{12,}\b/g, '-ID')
  const norm = els => { const o = {}; for (const k in els) o[noId(k)] = els[k]; return o }
  const read = l => { const j = JSON.parse(readFileSync(path.join(ROOT, l, 'styles.json'), 'utf8')); for (const s in j) if (j[s].els) j[s].els = norm(unpack(j[s])); return j }
  const A = read(a), B = read(b)
  const out = []
  const keys = new Set([...Object.keys(A), ...Object.keys(B)])
  for (const st of [...keys].sort()) {
    if (!A[st] || !B[st]) { out.push(`${st}: state only in ${A[st] ? a : b}`); continue }
    const ea = A[st].els, eb = B[st].els
    const ka = Object.keys(ea), kb = Object.keys(eb)
    if (ka.join('\n') !== kb.join('\n')) out.push(`${st}: element lists differ (${ka.length} vs ${kb.length}); first: ${ka.find(k => !(k in eb)) ?? kb.find(k => !(k in ea))}`)
    for (const k of ka) {
      if (!eb[k]) continue
      for (const part of Object.keys({ ...ea[k], ...eb[k] })) {
        const pa = ea[k][part] ?? {}, pb = eb[k][part] ?? {}
        for (const p of new Set([...Object.keys(pa), ...Object.keys(pb)])) {
          if (pa[p] !== pb[p]) out.push(`${st} | ${k} | ${part} | ${p}: ${JSON.stringify(pa[p])} -> ${JSON.stringify(pb[p])}`)
        }
      }
    }
  }
  const file = path.join(ROOT, `diff-${a}-vs-${b}.txt`)
  writeFileSync(file, out.length ? out.join('\n') + '\n' : 'EMPTY — no computed style differs\n')
  console.log(`${out.length} differences -> ${file}`)
  console.log(out.slice(0, 40).join('\n'))
  process.exit(0)
}

const LABEL = args[0]
if (!LABEL || LABEL.startsWith('--')) { console.log('usage: <label> [--sim] [--only a,b] [--size desk|phone]'); process.exit(1) }
const SIM = args.includes('--sim')
const ONLY = flag('--only')?.split(',') ?? null
const SIZES = flag('--size') ? [flag('--size')] : ['desk', 'phone']
const OUT = path.join(ROOT, LABEL)
mkdirSync(OUT, { recursive: true })
if (!ONLY) for (const f of readdirSync(OUT)) if (f.endsWith('.png')) unlinkSync(path.join(OUT, f))

const T = id => `[data-testid="${id}"]`
const T0 = '2026-11-04T09:00:00+08:00'   // a Wednesday; the war's period JAN – DEC 26, the grid landing in November
const browser = await chromium.launch(launchOptions)

async function world(size, who) {
  const phone = size === 'phone'
  const ctx = await browser.newContext(phone
    ? { viewport: { width: 402, height: 874 }, hasTouch: true, isMobile: true, deviceScaleFactor: 3, userAgent: devices['iPhone 13'].userAgent }
    : { viewport: { width: 1536, height: 864 }, deviceScaleFactor: 1.25 })
  await ctx.clock.install({ time: new Date(T0) })
  const page = await ctx.newPage()
  page.setDefaultTimeout(15000)
  const errs = []
  page.on('pageerror', e => errs.push('pageerror: ' + String(e).slice(0, 200)))
  page.on('console', m => { if (m.type() === 'error') errs.push('console: ' + m.text().slice(0, 200)) })
  await page.goto(BASE + '/?fresh=1')
  await signIn(page, who)
  return { ctx, page, phone, size, errs }
}
async function signIn(page, who) {
  const [u, p] = who === 'member' ? ['us', 'us'] : ['ad', 'a']
  await page.waitForSelector('#luser')
  await page.fill('#luser', u); await page.fill('#lpass', p)
  await page.click('#loginForm button[type=submit]')
  await page.waitForSelector('#vWeek .day', { state: 'attached' })
  /* passing notes hidden in both builds alike — they time out on their own clock and would make two runs differ */
  await page.addStyleTag({ content: '#toastEl, .toast { visibility: hidden !important; }' })
  await page.evaluate(() => window.go('leavewar'))
  await page.waitForSelector(T(who === 'member' ? 'row-bane' : 'row-stiff'), { state: 'attached' })
  await page.waitForTimeout(700)
}
async function signOut(w) { await w.page.evaluate(() => document.querySelector('#logout')?.click()); await w.page.waitForSelector('#luser') }

/* a press: a finger on the phone, a mouse on the desktop */
async function press(w, sel) {
  const l = w.page.locator(sel).first()
  await l.scrollIntoViewIfNeeded().catch(() => {})
  await w.page.waitForTimeout(100)
  if (w.phone) await l.tap(); else await l.click()
  await w.page.waitForTimeout(450)
}
async function cell(w, p, d, fy = 0.5) {
  const l = w.page.locator(T(`cell-${p}-${d}`)).first()
  await l.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' }))
  await w.page.waitForTimeout(300)
  const b = await l.boundingBox()
  if (w.phone) await w.page.touchscreen.tap(b.x + b.width / 2, b.y + b.height * fy)
  else await w.page.mouse.click(b.x + b.width / 2, b.y + b.height * fy)
  await w.page.waitForTimeout(600)
}
const setCell = (w, p, d, code) => w.page.evaluate(([p, d, c]) => window.lwSetCell(p, d, c), [p, d, code])
async function autoApprove(w, on) {
  const s = w.page.locator(T('bid-approve-tick')).first()
  if (!(await s.count())) return
  const now = (await s.getAttribute('aria-checked')) === 'true' || (await s.getAttribute('aria-pressed')) === 'true'
  if (now !== on) await press(w, T('bid-approve-tick'))
}
async function closeAll(w) {
  for (const id of ['bid-cancel', 'sel-cancel', 'daylist-close', 'closed-note-close']) if (await w.page.locator(T(id)).first().isVisible().catch(() => false)) await press(w, T(id))
  await w.page.keyboard.press('Escape').catch(() => {}); await w.page.waitForTimeout(300)
}
async function drag(w, [p1, a], [p2, z]) {
  const P = w.page
  await P.locator(T(`cell-${p1}-${a}`)).first().evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' }))
  await P.waitForTimeout(300)
  const bA = await P.locator(T(`cell-${p1}-${a}`)).first().boundingBox(), bZ = await P.locator(T(`cell-${p2}-${z}`)).first().boundingBox()
  const A = { x: bA.x + bA.width / 2, y: bA.y + bA.height / 2 }, Z = { x: bZ.x + bZ.width / 2, y: bZ.y + bZ.height / 2 }
  if (w.phone) {
    const cdp = await w.ctx.newCDPSession(P)
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [A] })
    await P.waitForTimeout(400)
    for (let i = 1; i <= 8; i++) { await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: A.x + (Z.x - A.x) * i / 8, y: A.y + (Z.y - A.y) * i / 8 }] }); await P.waitForTimeout(25) }
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
    await cdp.detach()
  } else {
    await P.mouse.move(A.x, A.y); await P.mouse.down(); await P.mouse.move(A.x + 8, A.y)
    await P.mouse.move(Z.x, Z.y, { steps: 10 }); await P.mouse.up()
  }
  await P.waitForTimeout(700)
}
async function openManning(w) {
  await w.page.evaluate(() => { try { for (const id of Object.keys(window.PEOPLE ?? {})) localStorage.setItem(`lw:manning:${id}`, 'open') } catch {} })
  const t = w.page.locator(T('counts-toggle'))
  if ((await t.getAttribute('aria-expanded')) !== 'true') await press(w, T('counts-toggle'))
}
/* bidding opened by the admin for November and December (a member's bids need it; the chip and the outline with it) */
async function openNovDec(w) {
  await press(w, T('open-chip'))
  for (const m of ['2026-11', '2026-12']) { const b = w.page.locator(T(`od-month-${m}`)).first(); if (await b.count()) { await b.click(); await w.page.waitForTimeout(250) } }
  if (await w.page.locator(T('od-apply')).first().isVisible().catch(() => false)) await press(w, T('od-apply'))
  if (await w.page.locator(T('open-dates-close')).first().isVisible().catch(() => false)) await press(w, T('open-dates-close'))
  await w.page.keyboard.press('Escape').catch(() => {}); await w.page.waitForTimeout(300)
}
async function placeHalf(w, p, d, half, code) {
  await cell(w, p, d)
  await autoApprove(w, false)
  await press(w, T(`portion-${half}`))
  await press(w, T(`bid-${code}`))
  if (await w.page.locator(T('bid-picker')).first().isVisible().catch(() => false)) await press(w, T(`bid-${code}`))
  await closeAll(w)
}

const D = { a: '2026-11-16', whole: '2026-11-17', half: '2026-11-18', two: '2026-11-19', range0: '2026-11-23', range1: '2026-11-26', pend: '2026-11-20', grant: '2026-11-24' }
/* every state: who signs in, how the window is reached, and what is open (the roots whose elements are recorded) */
const ROOTS = '.bidsheet, .lwday, .floatwin, [role="dialog"], .sheetscrim, .ll-row, .airpop, [data-testid="person-window"], [data-testid="win-lwday"]'
const STATES = [
  { name: 'bid-empty', go: async w => { await cell(w, 'stiff', D.a) } },
  { name: 'bid-whole', go: async w => { await setCell(w, 'stiff', D.whole, 'LL'); await cell(w, 'stiff', D.whole) } },
  { name: 'bid-half', go: async w => { await placeHalf(w, 'stiff', D.half, 'am', 'LL'); await cell(w, 'stiff', D.half, 0.85) } },
  { name: 'bid-pending-decide', go: async w => { await cell(w, 'slipway', D.pend); await autoApprove(w, false); await press(w, T('bid-OL')); await closeAll(w); await cell(w, 'slipway', D.pend) } },
  { name: 'daylist-two', go: async w => { await placeHalf(w, 'stiff', D.two, 'am', 'LL'); await placeHalf(w, 'stiff', D.two, 'pm', 'OL'); await cell(w, 'stiff', D.two) } },
  { name: 'bid-grant-oil', go: async w => { await cell(w, 'razer', D.grant); await press(w, T('bid-oil')) } },
  { name: 'bid-more', go: async w => { await cell(w, 'razer', D.grant); await press(w, T('bid-more')) } },
  { name: 'drag-window', go: async w => { await drag(w, ['glass', D.range0], ['glass', D.range1]) } },
  { name: 'drag-window-two', go: async w => {
    await setCell(w, 'glass', D.range0, 'LL'); await setCell(w, 'freak', D.range1, 'OL')
    await drag(w, ['glass', D.range0], ['freak', D.range1]) } },
  { name: 'counter-avail', go: async w => { await openManning(w); await press(w, T('fly-name-avail-p')) } },
  { name: 'counter-new-team', go: async w => {
    await press(w, T('settings-open')); await press(w, T('counter-add'))
    if (await w.page.locator(T('cform-mode-team')).count()) await press(w, T('cform-mode-team'))
    if (await w.page.locator(T('cform-slot-add')).count()) await press(w, T('cform-slot-add')) } },
  { name: 'open-dates', go: async w => { await press(w, T('open-chip')); const b = w.page.locator(T('od-month-2026-12')).first(); if (await b.count()) { await b.click(); await w.page.waitForTimeout(400) } } },
  { name: 'grades', go: async w => { await press(w, T('lw-tab-balances')); await press(w, T('bal-grades')) } },
  { name: 'person-window', go: async w => {
    await setCell(w, 'stiff', D.whole, 'LL'); await setCell(w, 'stiff', D.range0, 'OL')
    await press(w, T('lw-tab-balances')); await press(w, T('bal-name-stiff')) } },
  { name: 'events', go: async w => {
    await w.page.evaluate(() => { window.lwSetDayEvent('2026-11-10', 0, 'Ex Kite', 'work'); window.lwSetDayEvent('2026-12-25', 0, 'PH', 'off'); window.lwSetDayEvent('2026-11-20', 0, 'Dining-in', null) })
    await press(w, T('settings-open')); await press(w, T('settings-events')) } },
  { name: 'settings', go: async w => { await press(w, T('settings-open')) } },
  { name: 'settings-sans-palette', go: async w => {
    await press(w, T('settings-open')); await press(w, T('gadd-SANS'))
    await press(w, T('gpick-IP')) } },
  { name: 'settings-whowins', go: async w => { await press(w, T('settings-open')); await press(w, T('who-wins-toggle')) } },
  { name: 'day-panel', go: async w => {
    await setCell(w, 'stiff', D.a, 'LL'); await setCell(w, 'glass', D.a, 'OL')
    const th = w.page.locator(`th.day[data-d="${D.a}"]`).first()
    await th.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await w.page.waitForTimeout(200)
    if (w.phone) await th.tap(); else await th.click()
    await w.page.waitForTimeout(700) } },
  { name: 'req-panel', go: async w => { await openManning(w); await dragReq(w) } },
  { name: 'member-bid', who: 'member', pre: openNovDec, go: async w => { await cell(w, 'bane', D.a) } },
  { name: 'member-own-approved', who: 'member', pre: async w => { await openNovDec(w); await setCell(w, 'bane', D.whole, 'LL') }, go: async w => { await cell(w, 'bane', D.whole) } },
  { name: 'member-closed-day', who: 'member', pre: async w => { await setCell(w, 'bane', '2026-10-20', 'LL') }, go: async w => { await cell(w, 'bane', '2026-10-20') } },
  { name: 'new-period', go: async w => { await w.page.locator(T('war-picker')).selectOption({ label: '+ New period' }); await w.page.waitForTimeout(600) } },
  /* the states the first record did not reach (the cascade reading's list of moved rules no state matched) */
  { name: 'events-arm', go: async w => {
    await w.page.evaluate(() => { window.lwSetDayEvent('2026-11-10', 0, 'Ex Kite', 'work'); window.lwSetDayEvent('2026-12-25', 0, 'PH', 'off') })
    await press(w, T('settings-open')); await press(w, T('settings-events'))
    await press(w, '[data-testid^="evdel-"]') } },
  { name: 'settings-qual-palette', go: async w => {
    await press(w, T('settings-open')); await press(w, T('gadd-q:mgmt'))
    const p = w.page.locator('[data-testid^="gpick-q"]').first(); if (await p.count()) await press(w, '[data-testid^="gpick-q"]') } },
  { name: 'settings-palette', go: async w => {
    await press(w, T('settings-open')); await press(w, '[data-testid^="gadd-q:"]') } },   // adding a qualification group opens its colour palette
  { name: 'daylist-decided-armed', go: async w => {
    await cell(w, 'stiff', D.two); await autoApprove(w, true); await press(w, T('portion-am')); await press(w, T('bid-LL')); await closeAll(w)
    await placeHalf(w, 'stiff', D.two, 'pm', 'OL')
    await cell(w, 'stiff', D.two)
    const r = w.page.locator('[data-testid^="dl-refuse-"]').first(); if (await r.count()) { await press(w, '[data-testid^="dl-refuse-"]') }
    const del = w.page.locator('.daylist .dchip.del').first(); if (await del.count()) { await del.scrollIntoViewIfNeeded(); if (w.phone) await del.tap(); else await del.click(); await w.page.waitForTimeout(400) } } },
  { name: 'oil-award', go: async w => { await setCell(w, 'razer', D.grant, 'FO'); await cell(w, 'razer', D.grant) } },
  { name: 'daylist-oil', go: async w => { await setCell(w, 'razer', D.grant, 'FO'); await placeHalf(w, 'razer', D.grant, 'pm', 'LL'); await cell(w, 'razer', D.grant) } },
  { name: 'open-dates-none', go: async w => { await press(w, T('open-chip')) } },
  { name: 'open-dates-last', go: async w => {
    await press(w, T('open-chip')); const b = w.page.locator(T('od-month-2026-12')).first(); if (await b.count()) { await b.click(); await w.page.waitForTimeout(400) }
    const x = w.page.locator('[data-testid^="od-close-stretch"], [data-testid="od-close-stretch"]').first(); if (await x.count()) { await x.click(); await w.page.waitForTimeout(400) } } },
  { name: 'member-open-dates', who: 'member', pre: openNovDec, go: async w => { await press(w, T('open-chip')) } },
  { name: 'member-closed-empty', who: 'member', go: async w => { await cell(w, 'bane', '2026-10-21') } },
  { name: 'dayline-amber-red', go: async w => {
    await w.page.evaluate(d => window.setFlyDays([{ iso: d, p: 31, w: 40 }]), D.a)
    await cell(w, 'stiff', D.a) } },
  { name: 'day-panel-events-red', go: async w => {
    await w.page.evaluate(d => { window.setFlyDays([{ iso: d, p: 31, w: 40 }]); window.lwSetDayEvent(d, 0, 'Ex Kite', 'work') }, D.a)
    await setCell(w, 'stiff', D.a, 'LL')
    const th = w.page.locator(`th.day[data-d="${D.a}"]`).first()
    await th.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await w.page.waitForTimeout(200)
    if (w.phone) await th.tap(); else await th.click()
    await w.page.waitForTimeout(700) } },
  { name: 'bid-held-half', go: async w => {
    await w.page.evaluate(() => window.fileInput({ person: 'stiff', type: 'Other', date: 'Nov 25', yr: 2026, allday: false, s: 480, e: 720, acc: 'u', remarks: 'Dentist' }))
    await w.page.waitForTimeout(300); await cell(w, 'stiff', '2026-11-25') } },
  { name: 'drag-remarks', go: async w => {
    for (const [d, words, code] of [[D.range0, 'Family trip', 'LL'], ['2026-11-24', 'Wedding', 'OL']]) {
      await cell(w, 'glass', d); await autoApprove(w, false)
      await w.page.locator(T('bid-remarks')).first().click(); await w.page.keyboard.type(words)
      await press(w, T(`bid-${code}`)); if (await w.page.locator(T('bid-picker')).first().isVisible().catch(() => false)) await press(w, T(`bid-${code}`)); await closeAll(w)
    }
    await drag(w, ['glass', D.range0], ['glass', D.range1]) } },
  { name: 'req-panel-weekend', go: async w => { await openManning(w); await dragReq(w, '2026-11-20', '2026-11-23') } },
]
/* the Required rows are not people's cells: their own drag */
async function dragReq(w, from = D.range0, to = D.range1) {
  const P = w.page
  const c = (r, d) => P.locator(T(`${r}-${d}`)).first()
  await c('req-p', from).evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await P.waitForTimeout(300)
  const a = await c('req-p', from).boundingBox(), b = await c('req-w', to).boundingBox()
  const A = { x: a.x + a.width / 2, y: a.y + a.height / 2 }, Z = { x: b.x + b.width / 2, y: b.y + b.height / 2 }
  if (w.phone) {
    const cdp = await w.ctx.newCDPSession(P)
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [A] }); await P.waitForTimeout(260)
    for (let i = 1; i <= 6; i++) { await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: A.x + (Z.x - A.x) * i / 6, y: A.y + (Z.y - A.y) * i / 6 }] }); await P.waitForTimeout(20) }
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); await cdp.detach()
  } else { await P.mouse.move(A.x, A.y); await P.mouse.down(); await P.mouse.move(A.x + 8, A.y); await P.mouse.move(Z.x, Z.y, { steps: 6 }); await P.mouse.up() }
  await P.waitForTimeout(700)
}

/* settle: no finite animation or transition still running (both builds wait alike) */
async function settle(w) {
  await w.page.waitForFunction(() => document.getAnimations().every(a => a.playState !== 'running' || a.effect?.getComputedTiming().iterations === Infinity), null, { timeout: 5000 }).catch(() => {})
  await w.page.waitForTimeout(300)
}

/* in the page: every element under the open windows, keyed by its path, with its computed style and its ::before / ::after */
const DUMP = (roots) => {
  const els = new Set()
  for (const r of document.querySelectorAll(roots)) { els.add(r); for (const e of r.querySelectorAll('*')) els.add(e) }
  const keyOf = e => { const parts = []; for (let n = e; n && n !== document.documentElement; n = n.parentElement) {
    const i = n.parentElement ? [...n.parentElement.children].indexOf(n) + 1 : 1
    parts.push(`${n.tagName.toLowerCase()}${n.dataset?.testid ? `[${n.dataset.testid}]` : ''}:${i}`) } return parts.reverse().join('>') }
  const props = cs => { const o = {}; for (let i = 0; i < cs.length; i++) { const p = cs[i]; o[p] = cs.getPropertyValue(p) } return o }
  const out = {}
  for (const e of [...els].sort((a, b) => keyOf(a) < keyOf(b) ? -1 : 1)) {
    const rec = { el: props(getComputedStyle(e)), cls: { cls: String(e.className?.baseVal ?? e.className) } }
    for (const pe of ['::before', '::after']) { const cs = getComputedStyle(e, pe); if (cs.content && cs.content !== 'none' && cs.content !== 'normal') rec[pe] = props(cs) }
    out[keyOf(e)] = rec
  }
  return out
}

/* in the page (--sim, the BEFORE build): the cascade worked out twice — the moved rules at their old weight and at +1 id */
const SIMULATE = ({ roots, first }) => {
  const LW = s => (s.href || '').includes('LeaveWarPage')
  const splitTop = (s) => { const out = []; let d = 0, cur = '', q = null
    for (const ch of s) { if (q) { cur += ch; if (ch === q) q = null; continue } if (ch === '"' || ch === "'") { q = ch; cur += ch; continue }
      if (ch === '(' || ch === '[') d++; else if (ch === ')' || ch === ']') d--
      if (ch === ',' && d === 0) { out.push(cur.trim()); cur = '' } else cur += ch }
    if (cur.trim()) out.push(cur.trim()); return out }
  const resolve = (sel, parent) => splitTop(sel).map(s => parent == null ? s : s.includes('&') ? s.replaceAll('&', `:is(${parent})`) : `:is(${parent}) ${s}`).join(', ')
  /* specificity of one complex selector: [ids, classes, types] */
  const spec = (s) => { let a = 0, b = 0, c = 0, i = 0
    const args = (j) => { let d = 0, k = j; for (; k < s.length; k++) { if (s[k] === '(') d++; else if (s[k] === ')') { d--; if (d === 0) break } } return [s.slice(j + 1, k), k] }
    const maxOf = (list) => splitTop(list).map(spec).reduce((m, x) => cmp(x, m) > 0 ? x : m, [0, 0, 0])
    while (i < s.length) { const ch = s[i]
      if (ch === '#') { a++; i++; while (i < s.length && /[\w-]/.test(s[i])) i++ }
      else if (ch === '.') { b++; i++; while (i < s.length && /[\w-]/.test(s[i])) i++ }
      else if (ch === '[') { b++; while (i < s.length && s[i] !== ']') i++; i++ }
      else if (ch === ':') { const pe = s[i + 1] === ':'; i += pe ? 2 : 1; let n = ''; while (i < s.length && /[\w-]/.test(s[i])) n += s[i++]
        const legacy = /^(before|after|first-line|first-letter)$/.test(n)
        let inner = null; if (s[i] === '(') { const [x, k] = args(i); inner = x; i = k + 1 }
        if (pe || legacy) c++
        else if (/^(is|not|has|matches|-webkit-any)$/.test(n)) { const m = maxOf(inner); a += m[0]; b += m[1]; c += m[2] }
        else if (n === 'where') {}
        else if (/^nth-(last-)?child$/.test(n) && inner && / of /.test(inner)) { b++; const m = maxOf(inner.split(/ of /)[1]); a += m[0]; b += m[1]; c += m[2] }
        else b++ }
      else if (/[a-zA-Z]/.test(ch)) { c++; while (i < s.length && /[\w-]/.test(s[i])) i++ }
      else i++ }
    return [a, b, c] }
  const cmp = (x, y) => x[0] - y[0] || x[1] - y[1] || x[2] - y[2]
  /* the pseudo-element a selector draws (normalised), and the selector with it and the user-action states taken out */
  const peOf = (s) => { const m = s.match(/::?(before|after|placeholder|marker|selection|backdrop|first-line|first-letter|-webkit-[\w-]+)\s*$/); return m ? '::' + m[1] : '' }
  const topReplace = (s, re, by) => { let out = '', d = 0; for (let i = 0; i < s.length; i++) { const ch = s[i]; if (ch === '(') d++; else if (ch === ')') d--
      if (d === 0 && ch === ':') { const m = s.slice(i).match(re); if (m && m.index === 0) { out += by; i += m[0].length - 1; continue } } out += ch } return out }
  const ACT = /^:(hover|active|focus-visible|focus-within|focus)(?![\w-])/
  const PE = /^::?(before|after|placeholder|marker|selection|backdrop|first-line|first-letter|-webkit-[\w-]+)(?![\w-])/
  const fix = s => { s = s.trim(); return /[\s>+~]$/.test(s) || s === '' ? s + '*' : s }
  const stripPE = s => fix(topReplace(s, PE, ''))
  const stripAll = s => fix(topReplace(topReplace(s, PE, ''), ACT, ':is(*)'))
  /* a rule's declarations, one per longhand. A longhand set through a shorthand holding var() reads back EMPTY
     (`border: 1px solid var(--edge)` gives border-top-color ''), so two such rules compared equal and a changed winner went
     unseen (a disabled Reset order's hover edge, found by hand) — such a longhand takes the shorthand as written instead */
  const FAM = { gap: ['row-gap', 'column-gap'], inset: ['top', 'right', 'bottom', 'left'],
    'border-color': ['border-top-color', 'border-right-color', 'border-bottom-color', 'border-left-color'],
    'border-style': ['border-top-style', 'border-right-style', 'border-bottom-style', 'border-left-style'],
    'border-width': ['border-top-width', 'border-right-width', 'border-bottom-width', 'border-left-width'],
    'border-radius': ['border-top-left-radius', 'border-top-right-radius', 'border-bottom-right-radius', 'border-bottom-left-radius'] }
  const declOf = st => {
    const short = new Map(); let d = 0, cur = ''
    for (const ch of st.cssText + ';') { if (ch === '(') d++; else if (ch === ')') d--
      if (ch === ';' && d === 0) { const i = cur.indexOf(':'); if (i > 0) short.set(cur.slice(0, i).trim(), cur.slice(i + 1).trim()); cur = '' } else cur += ch }
    const out = {}
    for (let i = 0; i < st.length; i++) { const p = st[i]; let v = st.getPropertyValue(p)
      if (v === '') { const fam = [...short.keys()].filter(s => p.startsWith(s + '-') || FAM[s]?.includes(p)).sort((a, b) => b.length - a.length)[0]
        v = fam ? `(${fam}: ${short.get(fam)})` : `(unread, in: ${st.cssText})` }
      out[p] = { v, imp: st.getPropertyPriority(p) === 'important' } }
    return out
  }
  /* the rules, in document order, with their media chain */
  const rules = []
  let order = 0
  const walk = (list, parent, media, sheet, nested) => { for (const r of list) {
    if (r instanceof CSSStyleRule) {
      const full = resolve(r.selectorText, parent)
      const top = !nested
      const M = LW(sheet) && top && !/^(body|html|#page-)/.test(r.selectorText.trim())
      const decl = declOf(r.style)
      const parts = splitTop(full).map(s => ({ s, pe: peOf(s), spec: spec(s), m1: stripPE(s), m2: stripAll(s) }))
      rules.push({ o: order++, full, src: r.selectorText, M, decl, parts, media: media.slice(), sheet: (sheet.href || 'inline').split('/').pop() })
      if (r.cssRules?.length) walk(r.cssRules, full, media, sheet, true)
    } else if (typeof CSSNestedDeclarations !== 'undefined' && r instanceof CSSNestedDeclarations) {
      const decl = declOf(r.style)
      const parts = splitTop(parent).map(s => ({ s, pe: peOf(s), spec: spec(s), m1: stripPE(s), m2: stripAll(s) }))
      rules.push({ o: order++, full: parent, src: '(nested declarations)', M: false, decl, parts, media: media.slice(), sheet: (sheet.href || 'inline').split('/').pop() })
    } else if (r instanceof CSSMediaRule || r instanceof CSSSupportsRule || (typeof CSSContainerRule !== 'undefined' && r instanceof CSSContainerRule)) {
      walk(r.cssRules, parent, media.concat(r instanceof CSSMediaRule ? [r.conditionText] : [r.cssText.slice(0, r.cssText.indexOf('{')).trim()]), sheet, nested)
    } else if (typeof CSSLayerBlockRule !== 'undefined' && r instanceof CSSLayerBlockRule) {
      walk(r.cssRules, parent, media.concat(['@layer ' + r.name]), sheet, nested)
    } } }
  for (const sh of document.styleSheets) { try { walk(sh.cssRules, null, [], sh, false) } catch (e) { /* a sheet from another origin */ } }
  const mediaOn = rule => rule.media.every(m => m.startsWith('@') ? !m.startsWith('@layer') : matchMedia(m).matches)
  const els = new Set(); for (const r of document.querySelectorAll(roots)) { els.add(r); for (const e of r.querySelectorAll('*')) els.add(e) }
  const keyOf = e => { const parts = []; for (let n = e; n && n !== document.documentElement; n = n.parentElement) {
    const i = n.parentElement ? [...n.parentElement.children].indexOf(n) + 1 : 1
    parts.push(`${n.tagName.toLowerCase()}${n.dataset?.testid ? `[${n.dataset.testid}]` : ''}:${i}`) } return parts.reverse().join('>') }
  const safe = (e, s) => { try { return e.matches(s) } catch { return false } }
  const flips = [], hit = new Set()
  const Mrules = rules.filter(r => r.M)
  for (const e of els) {
    for (const [mode, field] of [['as is', 'm1'], ['hover/focus on', 'm2']]) {
      if (!Mrules.some(r => r.parts.some(p => safe(e, p[field])))) continue
      /* every rule this element matches, with the pseudo-element and the weight of its strongest matching selector */
      const got = []
      for (const r of rules) { const byPe = new Map()
        for (const p of r.parts) if (safe(e, p[field])) { const b = byPe.get(p.pe); if (!b || cmp(p.spec, b.spec) > 0) byPe.set(p.pe, { spec: p.spec, pe: p.pe, s: p.s }) }
        for (const b of byPe.values()) got.push({ r, ...b }) }
      for (const r of got) if (r.r.M) for (const p of r.r.parts) if (safe(e, p[field])) hit.add(r.r.src + ' ' + p.pe)
      for (const allMedia of [false, true]) {
        const live = got.filter(g => allMedia || mediaOn(g.r))
        const pes = new Set(live.filter(g => g.r.M).map(g => g.pe))
        for (const pe of pes) {
          const group = live.filter(g => g.pe === pe)
          const propsM = new Set(group.filter(g => g.r.M).flatMap(g => Object.keys(g.r.decl)))
          for (const P of propsM) {
            const setting = group.filter(g => P in g.r.decl)
            /* the cascade's order for one author origin with no layers: !important, then weight, then the later rule */
            const keyOf2 = (g, bump) => [g.r.decl[P].imp ? 1 : 0, ...(bump && g.r.M ? [g.spec[0] + 1, g.spec[1], g.spec[2]] : g.spec), g.r.o]
            const after = (k, kw) => { for (let i = 0; i < k.length; i++) if (k[i] !== kw[i]) return k[i] > kw[i]; return false }
            const win = (bump) => setting.reduce((w, g) => { const k = keyOf2(g, bump); return !w || after(k, w.k) ? { g, k } : w }, null)
            const b0 = win(false), b1 = win(true)
            if (b0.g.r.decl[P].v !== b1.g.r.decl[P].v) flips.push({ el: keyOf(e), cls: String(e.className?.baseVal ?? e.className), pe, prop: P, mode, media: allMedia ? 'every @media' : 'media now',
              before: { sel: b0.g.s, v: b0.g.r.decl[P].v, sheet: b0.g.r.sheet, media: b0.g.r.media }, after: { sel: b1.g.s, v: b1.g.r.decl[P].v, sheet: b1.g.r.sheet, media: b1.g.r.media } })
          }
        }
      }
    }
  }
  return { flips, hit: [...hit], moved: first ? Mrules.flatMap(r => r.parts.map(p => ({ src: r.src, pe: p.pe, s: p.s, spec: p.spec, media: r.media, decl: r.decl, o: r.o }))) : null,
    all: first ? rules.filter(r => !r.M).flatMap(r => r.parts.map(p => ({ s: p.s, pe: p.pe, spec: p.spec, media: r.media, props: Object.keys(r.decl), imp: Object.values(r.decl).some(d => d.imp), o: r.o, sheet: r.sheet }))) : null }
}

const styles = {}, sim = { flips: [], hit: new Set(), moved: null, all: null }
for (const size of SIZES) for (const st of STATES) {
  if (ONLY && !ONLY.includes(st.name)) continue
  const name = `${size}-${st.name}`
  let w
  try {
    w = await world(size, 'admin')
    if (st.who === 'member') { if (st.pre) await st.pre(w); await signOut(w); await signIn(w.page, 'member') }
    else if (st.pre) await st.pre(w)
    await st.go(w)
    await settle(w)
    const els = await w.page.evaluate(DUMP, ROOTS)
    const open = await w.page.evaluate(() => [...document.querySelectorAll('[data-testid]')].filter(e => /sheet|picker|window|form|dates|panel|daylist|win-|closed-note|events/.test(e.dataset.testid) && e.getBoundingClientRect().height > 0).map(e => e.dataset.testid).slice(0, 8))
    styles[name] = { open, n: Object.keys(els).length, ...pack(els) }
    await w.page.screenshot({ path: path.join(OUT, name + '.png'), scale: 'css' })
    if (SIM) {
      const r = await w.page.evaluate(SIMULATE, { roots: ROOTS, first: !sim.moved })
      sim.flips.push(...r.flips.map(f => ({ state: name, ...f })))
      r.hit.forEach(h => sim.hit.add(h))
      if (r.moved) { sim.moved = r.moved; sim.all = r.all }
    }
    console.log(`${name}: open=${open.join(',') || 'NOTHING'} elements=${Object.keys(els).length}${w.errs.length ? ' ERRS ' + w.errs.join(' | ') : ''}`)
  } catch (e) { console.log(`${name}: FAILED ${String(e).slice(0, 300)}`); styles[name] = { failed: String(e).slice(0, 300) } }
  finally { await w?.ctx.close() }
}
const prev = ONLY && existsSync(path.join(OUT, 'styles.json')) ? JSON.parse(readFileSync(path.join(OUT, 'styles.json'), 'utf8')) : {}
writeFileSync(path.join(OUT, 'styles.json'), JSON.stringify({ ...prev, ...styles }))
if (SIM) {
  const unreached = sim.moved.filter(m => !sim.hit.has(m.src + ' ' + m.pe))
  /* for a moved selector no state reached, a reading of the stylesheets alone: every other rule that sets one of its
     properties, on the same pseudo-element, that beat it at its old weight and would lose to it at the new one, and whose
     last compound could be the same element (a class in common, or no class at all and no clashing tag) — to be judged
     by hand from the source */
  const subject = s => {
    let t = s.replace(/::?(before|after|placeholder|marker|selection|backdrop|first-line|first-letter|-webkit-[\w-]+)\s*$/, '')
    let d = 0, cut = 0
    for (let i = 0; i < t.length; i++) { const ch = t[i]; if (ch === '(' || ch === '[') d++; else if (ch === ')' || ch === ']') d--; else if (d === 0 && /[\s>+~]/.test(ch)) cut = i + 1 }
    t = t.slice(cut)
    let flat = '', dd = 0; for (const ch of t) { if (ch === '(') dd++; else if (ch === ')') { dd--; continue } if (dd === 0) flat += ch }
    return { cls: (flat.match(/\.[\w-]+/g) || []).map(x => x.slice(1)), tag: (flat.match(/^[a-z][\w-]*/) || [null])[0] }
  }
  const cmp = (x, y) => x[0] - y[0] || x[1] - y[1] || x[2] - y[2]
  const statics = []
  for (const m of unreached) {
    const sm = subject(m.s), up = [m.spec[0] + 1, m.spec[1], m.spec[2]]
    for (const r of sim.all) {
      if (r.pe !== m.pe) continue
      const props = Object.keys(m.decl).filter(p => r.props.includes(p))
      if (!props.length) continue
      const beatBefore = cmp(r.spec, m.spec) > 0 || (cmp(r.spec, m.spec) === 0 && r.o > m.o)
      const loseAfter = cmp(up, r.spec) > 0 || (cmp(up, r.spec) === 0 && m.o > r.o)
      if (!beatBefore || !loseAfter) continue
      const sr = subject(r.s)
      const shareCls = sm.cls.some(c => sr.cls.includes(c))
      const tagOk = !sm.tag || !sr.tag || sm.tag === sr.tag
      if (!(shareCls || ((!sr.cls.length || !sm.cls.length) && tagOk))) continue
      statics.push({ moved: m.s, movedMedia: m.media, other: r.s, otherMedia: r.media, otherSheet: r.sheet, props, movedValues: Object.fromEntries(props.map(p => [p, m.decl[p].v])) })
    }
  }
  writeFileSync(path.join(OUT, 'cascade-sim.json'), JSON.stringify({ flips: sim.flips, unreached: unreached.map(m => ({ s: m.s, media: m.media })), statics, movedCount: sim.moved.length }, null, 1))
  console.log(`sim: ${sim.flips.length} element/property changes of winner; ${sim.moved.length} moved selectors, ${unreached.length} reached by no state; ${statics.length} rule pairs to judge by hand for those`)
}
await browser.close()
