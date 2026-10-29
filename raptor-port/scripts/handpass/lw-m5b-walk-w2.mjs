// M5b FULL check — walker W2 (the Events list and holidays by file). Scenarios W2-01 … W2-21 of
// docs/superpowers/plans/2026-10-29-lw-m5b-scenarios.md. Run from raptor-port:  node scripts/handpass/lw-m5b-walk-w2.mjs
// ONLY=ev  runs the Events group, ONLY=hol the holidays group (default both). Pictures: docs/img/handpass/2026-10-29-lw-m5b/w2/
// Press real controls (D608); the only bridge used is lwSetDayEvent to stage a starting world where a scenario says so.
console.log('[lw-m5b-walk-w2 v1]')
import { chromium, serveDist } from '../drawcheck/lib.mjs'
import { existsSync, mkdirSync, readdirSync, rmSync, readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const HERE = dirname(fileURLToPath(import.meta.url))
const OUT = process.env.W2_OUT || join(HERE, '../../docs/img/handpass/2026-10-29-lw-m5b/w2')
const ONLY = process.env.ONLY || ''
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const ORIGIN = 'http://localhost:4197', DIST = process.env.WALK_DIST || 'C:/dcm5bdraw/walkdist'
const q = t => `[data-testid="${t}"]`
mkdirSync(OUT, { recursive: true })
const on = g => !ONLY || ONLY.split(',').includes(g)
if (!ONLY) for (const f of readdirSync(OUT)) rmSync(join(OUT, f), { force: true })

const browser = await chromium.launch(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {})
const RESULTS = []
const log = (...a) => console.log(...a)

// ------------------------------------------------------------------ world
async function world({ phone = false, role = 'admin' } = {}) {
  const ctx = await browser.newContext(phone
    ? { viewport: { width: 402, height: 874 }, deviceScaleFactor: 3, hasTouch: true, isMobile: true, timezoneId: 'Asia/Singapore', acceptDownloads: true }
    : { viewport: { width: 1536, height: 864 }, deviceScaleFactor: 1.25, timezoneId: 'Asia/Singapore', acceptDownloads: true })
  await serveDist(ctx, ORIGIN, DIST)
  const page = await ctx.newPage()
  page.errors = []
  page.on('pageerror', e => page.errors.push('pageerror: ' + e.message))
  page.on('console', m => { if (m.type() === 'error') page.errors.push('console: ' + m.text().slice(0, 160)) })
  await page.clock.setFixedTime(new Date('2026-01-08T09:00:00+08:00'))
  await page.goto(ORIGIN + '/')
  const [u, p] = role === 'admin' ? ['ad', 'a'] : ['us', 'us']
  await page.fill('#luser', u); await page.fill('#lpass', p)
  await page.click('#loginForm button[type=submit]'); await page.waitForSelector('#vWeek .day')
  await page.evaluate(() => window.go('leavewar')); await page.waitForSelector(q('row-slipway')); await page.waitForTimeout(800)
  page.phone = phone
  page.ctx = ctx
  return page
}
async function shot(page, name) { const f = `${name}.png`; await page.screenshot({ path: join(OUT, f) }); return f }
const stage = (page, d, line, t) => page.evaluate(([d, line, t]) => window.lwSetDayEvent(d, line, t), [d, line, t])
const vis = (page, sel) => page.evaluate(sel => [...document.querySelectorAll(sel)].some(e => { const r = e.getBoundingClientRect(); const s = getComputedStyle(e); return r.width > 0 && r.height > 0 && s.visibility !== 'hidden' && s.display !== 'none' }), sel)
const rect = (page, sel, nth = 0) => page.evaluate(([sel, nth]) => { const e = [...document.querySelectorAll(sel)].filter(e => e.getBoundingClientRect().width > 0)[nth]; if (!e) return null; const r = e.getBoundingClientRect(); return { x: r.left, y: r.top, w: r.width, h: r.height, r: r.right, b: r.bottom } }, [sel, nth])
const text = (page, sel) => page.evaluate(sel => [...document.querySelectorAll(sel)].filter(e => e.getBoundingClientRect().width > 0).map(e => e.textContent.trim().replace(/\s+/g, ' ')).join(' | '), sel)
const lines = page => page.evaluate(() => [...document.querySelectorAll('[data-testid^="evline-"]')].filter(e => e.getBoundingClientRect().width > 0).map(e => ({ id: e.dataset.testid, when: e.querySelector('.hol-when')?.textContent, name: e.querySelector('.hol-name')?.textContent, kind: e.querySelector('.evpeek-kind')?.textContent || '', past: e.classList.contains('is-past') })))
// a real mouse press at the middle of the element, after proving the element is what lies there (some controls never settle for Playwright's own stability wait)
async function press(page, sel) {
  const r = await page.evaluate(sel => { const e = document.querySelector(sel); if (!e) return null; e.scrollIntoView({ block: 'nearest' }); const b = e.getBoundingClientRect(); const x = b.left + b.width / 2, y = b.top + b.height / 2; const h = document.elementFromPoint(x, y); return { x, y, hit: !!h && (h === e || e.contains(h) || h.contains(e)), what: h ? h.tagName + '.' + h.className : null } }, sel)
  if (!r) throw new Error('press: nothing for ' + sel)
  if (!r.hit) throw new Error('press: ' + sel + ' is covered by ' + r.what)
  await page.mouse.click(r.x, r.y)
}
async function openEvents(page) {
  await page.click(q('settings-open')); await page.waitForSelector(q('settings-sheet')); await page.waitForTimeout(300)
  await page.click(q('settings-events')); await page.waitForSelector(q('events-sheet')); await page.waitForTimeout(400)
}
async function closeAll(page) {
  for (let i = 0; i < 4; i++) {
    if (await vis(page, q('event-sheet'))) { await page.click(q('event-cancel')).catch(() => {}); await page.waitForTimeout(250) }
    else if (await vis(page, q('events-sheet'))) { await page.click(q('events-close')).catch(() => {}); await page.waitForTimeout(250) }
    else if (await vis(page, q('settings-sheet'))) { await page.keyboard.press('Escape'); await page.waitForTimeout(250) }
    else break
  }
}
// pick days in the Event window's calendar by pressing them; goes to the month by the › arrow
async function goMonth(page, iso) {
  const want = iso.slice(0, 7)
  for (let i = 0; i < 14; i++) {
    if (await page.locator(q(`event-day-${iso}`)).count()) return
    await page.click(q('event-next')); await page.waitForTimeout(120)
  }
  throw new Error('month not reached ' + want)
}
async function pickDays(page, from, to) {
  await goMonth(page, from); await page.click(q(`event-day-${from}`)); await page.waitForTimeout(150)
  if (to && to !== from) { await goMonth(page, to); await page.click(q(`event-day-${to}`)); await page.waitForTimeout(150) }
}
async function addEvent(page, { name, from, to, repeat = false, preset = null }) {
  await page.click(q('events-add')); await page.waitForSelector(q('event-sheet')); await page.waitForTimeout(250)
  if (preset !== null) await page.click(q(`event-quick-${preset}`))
  if (name) await page.fill(q('event-text'), name)
  if (repeat) await page.click(q('event-mode-repeat'))
  await pickDays(page, from, to)
  await page.click(q('event-apply')); await page.waitForTimeout(500)
}

async function S(id, fn) {
  if (process.env.SCEN && !process.env.SCEN.split(',').includes(id)) return
  const t0 = Date.now(); let r
  const fails = [], notes = [], pics = []
  const c = { partial: m => notes.push('PARTIAL: ' + m), ok: (cond, msg) => { if (!cond) fails.push(msg); else notes.push('ok: ' + msg); return cond }, note: m => notes.push(m), pic: f => pics.push(f), fail: m => fails.push(m) }
  try { r = await fn(c) } catch (e) { fails.push('SCRIPT: ' + e.message.split('\n').slice(0, 6).join(' / ').slice(0, 700)) }
  const status = r === 'NOTRUN' ? 'NOT RUN' : fails.length ? 'FAIL' : notes.some(n => n.startsWith('PARTIAL')) ? 'PASS (partial)' : 'PASS'
  RESULTS.push({ id, status, fails, notes, pics })
  log(`${id} ${status} (${((Date.now() - t0) / 1000).toFixed(0)}s)\n   ${fails.map(f => 'FAIL: ' + f).join('\n   ')}${fails.length ? '\n   ' : ''}${notes.join('\n   ')}\n   pics: ${pics.join(' ')}`)
}

// =================================================================== the Events list
if (on('ev')) {
  // ---------------- W2-01 (desktop) + W2-02 states
  let page = await world()
  await S('W2-01-D', async c => {
    await page.click(q('settings-open')); await page.waitForSelector(q('settings-sheet')); await page.waitForTimeout(300)
    c.pic(await shot(page, 'w2-01-D-settings'))
    await page.click(q('settings-events')); await page.waitForSelector(q('events-sheet')); await page.waitForTimeout(500)
    c.ok(!(await vis(page, q('settings-sheet'))), 'Settings closed when Events… opened')
    c.ok((await text(page, `${q('events-sheet')} .bidsheet-hd .who`)) === 'EVENTS', 'title reads EVENTS: ' + await text(page, `${q('events-sheet')} .bidsheet-hd .who`))
    c.note('period: ' + await text(page, q('events-period')))
    const sh = await rect(page, q('events-sheet')), ad = await rect(page, q('events-add')), pr = await rect(page, q('events-presets'))
    c.ok(ad.x - sh.x < 40 && pr.r > sh.r - 40 && ad.x < pr.x, `＋ Event at left (x ${ad.x - sh.x | 0} from window edge), Edit presets at right (${(sh.r - pr.r) | 0} from right edge)`)
    const L = await page.evaluate(() => [...document.querySelectorAll('[data-testid^="evline-"]')].slice(0, 4).map(e => { const g = s => e.querySelector(s)?.getBoundingClientRect(); const w = g('.hol-when'), n = g('.hol-name'), k = g('.evpeek-kind'); return { w: w && [w.left, w.right], n: n && [n.left, n.right], k: k && [k.left, k.right], row: [e.getBoundingClientRect().left, e.getBoundingClientRect().right] } }))
    c.note('column boxes (when / name / kind left-right): ' + JSON.stringify(L.map(l => ({ w: l.w?.map(Math.round), n: l.n?.map(Math.round), k: l.k?.map(Math.round) }))))
    c.ok(L.length >= 3 && L.every(l => Math.abs(l.w[0] - L[0].w[0]) < 1 && Math.abs(l.n[0] - L[0].n[0]) < 1 && l.k && Math.abs(l.k[1] - L[0].k[1]) < 1), 'when / name left edges and kind right edge line up across ' + L.length + ' lines')
    c.pic(await shot(page, 'w2-01-D-events'))
  })
  // stage the nine states
  await closeAll(page)
  await stage(page, '2026-01-06', 1, 'OVER TODAY'); await stage(page, '2026-01-07', 1, 'OVER TODAY'); await stage(page, '2026-01-08', 1, 'OVER TODAY'); await stage(page, '2026-01-09', 1, 'OVER TODAY')
  await stage(page, '2026-01-23', 0, 'Off day')
  for (const d of ['09', '10', '11', '12', '13']) await stage(page, `2026-02-${d}`, 0, 'EX SHIELD')
  for (const d of ['02', '03', '04', '05', '06']) await stage(page, `2026-03-${d}`, 1, 'No Leave')
  await stage(page, '2026-03-16', 0, 'SC')
  await page.waitForTimeout(600)
  await S('W2-02-D', async c => {
    await openEvents(page)
    const L = await lines(page)
    c.note('lines: ' + L.map(l => `${l.when}|${l.name}|${l.kind || '—'}${l.past ? '|PAST' : ''}`).join(' ;; '))
    const f = (n) => L.find(l => l.name === n)
    c.ok(f('PH') && f('PH').kind === 'Public holiday', 'a one-day PH has the Public holiday mark: ' + JSON.stringify(f('PH')))
    c.ok(L.some(l => l.name === 'PH' && /–/.test(l.when) && l.kind === 'Public holiday'), 'a PH run shows as one band line (Tue 17 – Wed 18 Feb)')
    c.ok(f('Off day') && f('Off day').kind === 'Off day', 'Off day line has the Off day mark')
    c.ok(f('No Leave') && /No leave/i.test(f('No Leave').kind), 'No Leave line with its mark: ' + f('No Leave')?.kind)
    c.ok(f('SC') && /Working event/i.test(f('SC').kind), 'SC working event has its mark: ' + f('SC')?.kind)
    c.ok(f('EX SHIELD') && f('EX SHIELD').kind === '', 'untagged exercise has no mark')
    c.ok(L.find(l => l.when.startsWith('Thu 1 Jan'))?.past === true, 'the 1 Jan PH is greyed (past)')
    c.ok(f('OVER TODAY') && f('OVER TODAY').past === false, 'an event running over today is not greyed: ' + JSON.stringify(f('OVER TODAY')))
    c.ok(L.filter(l => !l.past).length > 0 && L.filter(l => l.past).length === 1, 'exactly one past line')
    const greyed = await page.evaluate(() => { const g = s => { const e = document.querySelector(s); const st = getComputedStyle(e), n = getComputedStyle(e.querySelector('.hol-name')); return { op: st.opacity, c: n.color } }; const past = [...document.querySelectorAll('[data-testid^="evline-"]')].find(e => e.classList.contains('is-past')), fut = [...document.querySelectorAll('[data-testid^="evline-"]')].find(e => !e.classList.contains('is-past')); const cc = e => ({ op: getComputedStyle(e).opacity, name: getComputedStyle(e.querySelector('.hol-name')).color }); return { past: cc(past), fut: cc(fut) } })
    c.note('past vs future computed look: ' + JSON.stringify(greyed))
    c.ok(greyed.past.op !== greyed.fut.op || greyed.past.name !== greyed.fut.name, 'past line drawn differently from a future one')
    c.pic(await shot(page, 'w2-02-D-eight-states'))
    // empty period
    await page.click(q('events-close')); await page.waitForTimeout(250)
    await page.selectOption(q('war-picker'), { label: 'JAN - DEC 27' }).catch(async () => { await page.selectOption(q('war-picker'), { index: 1 }) })
    await page.waitForTimeout(800)
    await openEvents(page)
    const empty = await text(page, q('events-empty'))
    const L2 = await lines(page)
    c.note('2027 period: empty text=' + JSON.stringify(empty) + ' lines=' + L2.length)
    c.ok(/^No events in /.test(empty) || L2.length > 0, 'an empty period says "No events in …" (or has lines): ' + empty)
    c.pic(await shot(page, 'w2-02-D-empty-period'))
    await closeAll(page)
    await page.selectOption(q('war-picker'), { index: 0 }); await page.waitForTimeout(800)
  })
  await page.ctx.close()

  // ---------------- phone: W2-01-P, W2-02-P (+ the Events list on the phone)
  page = await world({ phone: true })
  await stage(page, '2026-01-23', 0, 'Off day'); for (const d of ['09', '10', '11', '12', '13']) await stage(page, `2026-02-${d}`, 0, 'EX SHIELD')
  for (const d of ['02', '03', '04', '05', '06']) await stage(page, `2026-03-${d}`, 1, 'No Leave'); await stage(page, '2026-03-16', 0, 'SC')
  await page.waitForTimeout(500)
  await S('W2-01-P', async c => {
    await page.locator(q('settings-open')).tap(); await page.waitForSelector(q('settings-sheet')); await page.waitForTimeout(400)
    await page.locator(q('settings-events')).tap(); const t100 = await shot(page, 'w2-01-P-tap-events'); c.pic(t100)
    await page.waitForSelector(q('events-sheet')); await page.waitForTimeout(500)
    c.ok(!(await vis(page, q('settings-sheet'))), 'Settings closed')
    c.ok((await text(page, `${q('events-sheet')} .bidsheet-hd .who`)) === 'EVENTS', 'title EVENTS')
    const vw = page.viewportSize().width
    const sh = await rect(page, q('events-sheet')), ad = await rect(page, q('events-add')), pr = await rect(page, q('events-presets'))
    c.ok(sh.x >= 0 && sh.r <= vw + 0.5, `window inside the screen (${sh.x | 0}..${sh.r | 0} of ${vw})`)
    c.ok(ad.x < pr.x && pr.r <= sh.r, '＋ Event left of Edit presets, both inside')
    const L = await page.evaluate(() => [...document.querySelectorAll('[data-testid^="evline-"]')].slice(0, 4).map(e => { const g = s => e.querySelector(s)?.getBoundingClientRect(); const w = g('.hol-when'), n = g('.hol-name'), k = g('.evpeek-kind'); return { w: w && [w.left, w.right], n: n && [n.left, n.right], k: k && [k.left, k.right] } }))
    c.note('column boxes ' + JSON.stringify(L.map(l => ({ w: l.w?.map(Math.round), n: l.n?.map(Math.round), k: l.k?.map(Math.round) }))))
    c.ok(L.length >= 3 && L.every(l => Math.abs(l.w[0] - L[0].w[0]) < 1 && Math.abs(l.n[0] - L[0].n[0]) < 1), 'columns line up')
    const over = await page.evaluate(() => { const s = document.querySelector('[data-testid="events-sheet"]'); return { sw: s.scrollWidth, cw: s.clientWidth, doc: document.documentElement.scrollWidth } })
    c.ok(over.sw <= over.cw + 1, 'no sideways scroll inside window ' + JSON.stringify(over))
    c.note('window top/bottom: ' + sh.y + '/' + sh.b + ' of ' + page.viewportSize().height + ' (D997: middle of the screen)')
    c.pic(await shot(page, 'w2-01-P-events'))
    const L2 = await lines(page); c.note('P lines: ' + L2.map(l => `${l.when}|${l.name}|${l.kind || '—'}${l.past ? '|PAST' : ''}`).join(' ;; '))
  })
  await closeAll(page)
  await page.ctx.close()
}

// =================================================================== Events: tap, edit, add, presets, behind
if (on('ev2')) {
  let page = await world()
  const gridCells = (pg, from, to, line) => pg.evaluate(([f, t, l]) => { const out = []; for (let d = new Date(f + 'T00:00:00Z'); d <= new Date(t + 'T00:00:00Z'); d.setUTCDate(d.getUTCDate() + 1)) { const iso = d.toISOString().slice(0, 10); const e = document.querySelector(`[data-testid="event-${l}-${iso}"]`); out.push(iso.slice(8) + ':' + (e ? e.textContent.trim() || '+' : 'x')) } return out.join(' ') }, [from, to, line])
  const bands = pg => pg.evaluate(() => [...document.querySelectorAll('[data-testid^="event-band-"]')].map(e => e.dataset.testid.replace('event-band-', '') + '=' + e.textContent.trim()).join(' ; '))
  await S('W2-03-D', async c => {
    await openEvents(page)
    await addEvent(page, { name: 'REPEAT5', from: '2026-02-02', to: '2026-02-06', repeat: true })
    c.ok(await vis(page, q('events-sheet')), 'after Save the Events list is back')
    let L = (await lines(page)).filter(l => l.name === 'REPEAT5')
    c.note('lines after save: ' + JSON.stringify(L))
    c.ok(L.length === 1 && /Mon 2 – Fri 6 Feb/.test(L[0].when), 'the repeat saved as ONE line "Mon 2 – Fri 6 Feb"')
    c.note('grid event cells 2–6 Feb row0: ' + await gridCells(page, '2026-02-02', '2026-02-06', 0) + ' | bands: ' + await bands(page))
    c.pic(await shot(page, 'w2-03-D-list-after-repeat'))
    await page.click(q(L[0].id)); await page.waitForSelector(q('event-sheet')); await page.waitForTimeout(400)
    c.note('window title: ' + await text(page, `${q('event-sheet')} .bidsheet-hd .who`) + ' | name box: ' + await page.inputValue(q('event-text')) + ' | selection: ' + await text(page, q('event-selection')) + ' | foot: ' + await text(page, q('event-foot')))
    c.note('mode buttons: ' + await page.evaluate(() => ['event-mode-merge', 'event-mode-repeat'].map(t => { const e = document.querySelector(`[data-testid="${t}"]`); return t + '=' + (e ? (e.getAttribute('aria-pressed') || e.className) : 'absent') }).join(', ')))
    c.pic(await shot(page, 'w2-03-D-window-of-repeat'))
    const picked = await page.evaluate(() => [...document.querySelectorAll('[data-testid^="event-day-"]')].filter(e => /sel|on|picked|range|active/.test(e.className) || e.getAttribute('aria-pressed') === 'true').map(e => e.dataset.testid.slice(-5)))
    c.note('days marked in the window calendar: ' + JSON.stringify(picked))
    await page.fill(q('event-text'), 'RENAMED5'); await page.click(q('event-apply')); await page.waitForTimeout(500)
    L = await lines(page)
    c.note('lines after rename: ' + JSON.stringify(L.filter(l => /REPEAT5|RENAMED5/.test(l.name))))
    c.note('grid row0 2–6 Feb after rename: ' + await gridCells(page, '2026-02-02', '2026-02-06', 0))
    const ren = L.filter(l => l.name === 'RENAMED5'), old = L.filter(l => l.name === 'REPEAT5')
    c.ok(old.length === 0 && ren.length === 1 && /Mon 2 – Fri 6 Feb/.test(ren[0].when), 'a rename changes all five days (one RENAMED5 line Mon 2 – Fri 6 Feb, no REPEAT5 left)')
    c.pic(await shot(page, 'w2-03-D-list-after-rename'))
    const t = (await lines(page)).find(l => /RENAMED5|REPEAT5/.test(l.name)); await page.click(q(t.id)); await page.waitForSelector(q('event-sheet')); await page.waitForTimeout(300)
    await page.click(q('event-delete')); await page.waitForTimeout(500)
    L = await lines(page)
    c.note('lines after Delete: ' + JSON.stringify(L.filter(l => /REPEAT5|RENAMED5/.test(l.name))))
    c.note('grid row0 2–6 Feb after delete: ' + await gridCells(page, '2026-02-02', '2026-02-06', 0))
    c.ok(!L.some(l => /REPEAT5|RENAMED5/.test(l.name)), 'Delete takes away all five days (no line left of the run)')
    c.pic(await shot(page, 'w2-03-D-list-after-delete'))
  })
  await closeAll(page)
  await S('W2-04-D', async c => {
    await openEvents(page)
    await addEvent(page, { name: 'ONEDAY', from: '2026-04-20' })
    let L = await lines(page); const l0 = L.find(l => l.name === 'ONEDAY')
    c.ok(!!l0, 'the new line is on the list')
    await page.click(q(l0.id)); await page.waitForSelector(q('event-sheet')); await page.waitForTimeout(300)
    await page.fill(q('event-text'), 'ONEDAY EDITED'); await page.click(q('event-apply')); await page.waitForTimeout(500)
    L = await lines(page)
    c.ok(await vis(page, q('events-sheet')) && L.some(l => l.name === 'ONEDAY EDITED') && !L.some(l => l.name === 'ONEDAY'), 'tap, edit, Save: the list comes back with the edited name')
    c.pic(await shot(page, 'w2-04-D-after-edit-save'))
    const l1 = L.find(l => l.name === 'ONEDAY EDITED'); await page.click(q(l1.id)); await page.waitForSelector(q('event-sheet')); await page.waitForTimeout(300)
    await page.fill(q('event-text'), 'NOT SAVED'); await page.click(q('event-cancel')); await page.waitForTimeout(400)
    L = await lines(page)
    c.ok(await vis(page, q('events-sheet')) && L.some(l => l.name === 'ONEDAY EDITED') && !L.some(l => l.name === 'NOT SAVED'), 'the ✕ goes back to the list and keeps the old name')
    await page.click(q(l1.id)); await page.waitForSelector(q('event-sheet')); await page.waitForTimeout(300)
    await page.click(q('event-delete')); await page.waitForTimeout(500)
    L = await lines(page)
    c.ok(await vis(page, q('events-sheet')) && !L.some(l => /ONEDAY/.test(l.name)), 'Delete: the list comes back without the event')
    c.pic(await shot(page, 'w2-04-D-after-delete'))
    const ub = await rect(page, '#undoBtn')
    c.note('undo enabled: ' + await page.evaluate(() => { const b = document.getElementById('undoBtn'); return b && !b.disabled }) + '; what lies on the Undo button: ' + await page.evaluate(([x, y]) => { const h = document.elementFromPoint(x, y); return h.tagName + '.' + h.className }, [ub.x + ub.w / 2, ub.y + ub.h / 2]))
    await page.mouse.click(ub.x + ub.w / 2, ub.y + ub.h / 2); await page.waitForTimeout(600)
    L = await lines(page)
    c.note('after a mouse press on the Undo arrow with the list open: list visible=' + await vis(page, q('events-sheet')) + ', ONEDAY back=' + L.some(l => /ONEDAY/.test(l.name)))
    c.pic(await shot(page, 'w2-04-D-after-undo-press'))
    if (!(await vis(page, q('events-sheet')))) { await openEvents(page) }
    c.note('list reopened; ONEDAY on it: ' + (await lines(page)).some(l => /ONEDAY/.test(l.name)))
    // the keyboard way, list open
    await page.keyboard.press('Control+z'); await page.waitForTimeout(700)
    const viaKey = (await lines(page)).some(l => l.name === 'ONEDAY EDITED')
    c.note('Ctrl+Z with the list open: list visible=' + await vis(page, q('events-sheet')) + ', event back=' + viaKey)
    c.pic(await shot(page, 'w2-04-D-after-ctrlz'))
    if (!viaKey) {
      // the mouse way: close the list, press the real Undo arrow, reopen
      await page.click(q('events-close')); await page.waitForTimeout(400)
      await page.mouse.click(ub.x + ub.w / 2, ub.y + ub.h / 2); await page.waitForTimeout(600)
      await openEvents(page)
      const back = (await lines(page)).some(l => l.name === 'ONEDAY EDITED')
      c.note('Undo arrow pressed with the list closed, list reopened: event back=' + back)
      c.ok(back, 'Undo (arrow, list closed) takes the delete back')
      c.pic(await shot(page, 'w2-04-D-after-undo'))
      c.fail('Undo cannot be done with the list open: a press on the Undo arrow lands on the dimming layer and closes the list; Ctrl+Z with the list open does nothing')
    } else { c.ok(true, 'Ctrl+Z with the list open repaints it'); c.pic(await shot(page, 'w2-04-D-after-undo')) }
    await page.keyboard.press('Control+y'); await page.waitForTimeout(600)
    c.note('after Ctrl+Y: list visible=' + await vis(page, q('events-sheet')) + ', ONEDAY lines=' + (await lines(page).catch(() => [])).filter(l => /ONEDAY/.test(l.name)).length)
  })
  await closeAll(page)
  await S('W2-05-D', async c => {
    await openEvents(page)
    await page.click(q('events-add')); await page.waitForSelector(q('event-sheet')); await page.waitForTimeout(300)
    c.ok((await text(page, `${q('event-sheet')} .bidsheet-hd .who`)) === 'NEW EVENT', 'title NEW EVENT: ' + await text(page, `${q('event-sheet')} .bidsheet-hd .who`))
    await page.fill(q('event-text'), 'NODAY'); await page.click(q('event-apply')); await page.waitForTimeout(300)
    const pr = await text(page, q('event-problem'))
    c.ok(/Pick its day/i.test(pr) && await vis(page, q('event-sheet')), 'Save with no day: ' + JSON.stringify(pr))
    c.pic(await shot(page, 'w2-05-D-no-day'))
    await page.click(q('event-cancel')); await page.waitForTimeout(300)
    await addEvent(page, { name: 'ONE', from: '2026-05-04' })
    await addEvent(page, { name: 'MERGED', from: '2026-06-02', to: '2026-06-04' })
    await addEvent(page, { name: 'REPEATED', from: '2026-07-06', to: '2026-07-08', repeat: true })
    let L = await lines(page)
    c.note('lines: ' + JSON.stringify(L.filter(l => /^(ONE|MERGED|REPEATED)$/.test(l.name)).map(l => l.when + '|' + l.name)))
    c.ok(['ONE', 'MERGED', 'REPEATED'].every(n => L.some(l => l.name === n)), 'one day, merged run and repeated run all on the list')
    c.pic(await shot(page, 'w2-05-D-three-kinds'))
    await addEvent(page, { name: 'ROW1', from: '2026-09-07', to: '2026-09-09' })
    await addEvent(page, { name: 'ROW2', from: '2026-09-07', to: '2026-09-09' })
    L = await lines(page); c.note('after two on the same dates: ' + JSON.stringify(L.filter(l => /ROW/.test(l.name)).map(l => l.id + '|' + l.name)))
    await page.click(q('events-add')); await page.waitForSelector(q('event-sheet')); await page.waitForTimeout(250)
    await page.fill(q('event-text'), 'ROW3'); await pickDays(page, '2026-09-07', '2026-09-09'); await page.click(q('event-apply')); await page.waitForTimeout(400)
    const pr3 = await text(page, q('event-problem'))
    c.ok(pr3 && await vis(page, q('event-sheet')), 'a third on the same dates refused with a reason: ' + JSON.stringify(pr3))
    c.pic(await shot(page, 'w2-05-D-rows-full'))
    await page.click(q('event-cancel')); await page.waitForTimeout(300)
    L = await lines(page); c.ok(!L.some(l => l.name === 'ROW3'), 'ROW3 was not added')
    await page.click(q('events-add')); await page.waitForSelector(q('event-sheet')); await page.waitForTimeout(250)
    await page.fill(q('event-text'), 'ACROSS'); await goMonth(page, '2026-12-29'); await page.click(q('event-day-2026-12-29')); await page.waitForTimeout(150); await page.click(q('event-next')); await page.waitForTimeout(250)
    const out = await page.evaluate(() => [...document.querySelectorAll('[data-testid^="event-day-2027"]')].map(e => e.dataset.testid.slice(-5) + (e.disabled ? ':disabled' : ':ENABLED')).join(' '))
    c.note('January 2027 days in the Event window: ' + out)
    c.ok(out.length > 0 && !/ENABLED/.test(out), 'dates past the period end cannot be picked (all disabled)')
    c.pic(await shot(page, 'w2-05-D-past-period-end-days'))
    await page.click(q('event-apply')); await page.waitForTimeout(500)
    const prx = await text(page, q('event-problem')); const sel = await text(page, q('event-selection'))
    c.note('across the period end: sheet still open=' + await vis(page, q('event-sheet')) + ' problem=' + JSON.stringify(prx) + ' selection=' + JSON.stringify(sel))
    c.pic(await shot(page, 'w2-05-D-across-period-end'))
    if (await vis(page, q('event-sheet'))) { await page.click(q('event-cancel')); await page.waitForTimeout(300) }
    L = await lines(page); c.note('ACROSS on list: ' + JSON.stringify(L.filter(l => l.name === 'ACROSS')))
  })
  await closeAll(page)
  await page.ctx.close()
  page = await world({ phone: true })
  await S('W2-05-P', async c => {
    for (let i = 0; i < 12; i++) await stage(page, `2026-0${(i % 9) + 1}-1${i % 8}`, 0, 'LONG ' + i)
    await page.waitForTimeout(500)
    await page.locator(q('settings-open')).tap(); await page.waitForSelector(q('settings-sheet')); await page.waitForTimeout(300)
    await page.locator(q('settings-events')).tap(); await page.waitForSelector(q('events-sheet')); await page.waitForTimeout(500)
    c.note('lines before: ' + (await lines(page)).length)
    await page.locator(q('events-add')).tap(); await page.waitForSelector(q('event-sheet')); await page.waitForTimeout(400)
    c.note('Event window rect: ' + JSON.stringify(await rect(page, q('event-sheet'))))
    await page.fill(q('event-text'), 'LASTONE')
    await goMonth(page, '2026-12-28'); await page.locator(q('event-day-2026-12-28')).tap(); await page.waitForTimeout(200)
    await page.locator(q('event-apply')).tap(); c.pic(await shot(page, 'w2-05-P-save-tap'))
    await page.waitForTimeout(500)
    const info = await page.evaluate(() => { const e = document.querySelector('[data-testid="evline-0-2026-12-28"]'); const sc = document.querySelector('[data-testid="events-list"]'); if (!e) return { found: false }; const r = e.getBoundingClientRect(), sr = sc.closest('[data-testid="events-sheet"]').getBoundingClientRect(); const st = getComputedStyle(e); return { found: true, cls: e.className, shadow: st.boxShadow, outline: st.outlineStyle + ' ' + st.outlineColor, top: r.top, bottom: r.bottom, sheetTop: sr.top, sheetBottom: sr.bottom, vh: innerHeight, listScroll: sc.scrollTop } })
    c.note('new line: ' + JSON.stringify(info))
    c.ok(info.found && info.top >= info.sheetTop && info.bottom <= info.sheetBottom + 1 && info.bottom <= info.vh, 'the new line is inside the window and on screen')
    c.ok(info.found && (info.shadow !== 'none' || info.outline.startsWith('solid') || /added|new|just/i.test(info.cls)), 'the new line is marked (ring): ' + info.shadow + ' / ' + info.outline + ' / ' + info.cls)
    c.pic(await shot(page, 'w2-05-P-new-line'))
    await page.waitForTimeout(6500)
    c.pic(await shot(page, 'w2-05-P-new-line-after-7s'))
  })
  await closeAll(page)
  await page.ctx.close()
  page = await world()
  await S('W2-06-D', async c => {
    await openEvents(page)
    await page.click(q('events-presets')); await page.waitForTimeout(500)
    c.note('presets view: events-sheet visible=' + await vis(page, q('events-sheet')) + ' event-sheet visible=' + await vis(page, q('event-sheet')) + ' types-back=' + await vis(page, q('types-back')) + ' types-done=' + await vis(page, q('types-done')))
    c.pic(await shot(page, 'w2-06-D-presets'))
    await page.click(q('types-back')); await page.waitForTimeout(500)
    c.ok(await vis(page, q('events-sheet')) && !(await vis(page, q('event-sheet'))), 'the back arrow returns to the Events list')
    c.pic(await shot(page, 'w2-06-D-after-back'))
    await page.click(q('events-presets')); await page.waitForTimeout(400)
    await page.click(q('types-done')); await page.waitForTimeout(500)
    c.ok(await vis(page, q('events-sheet')) && !(await vis(page, q('event-sheet'))), 'Done returns to the Events list')
    c.pic(await shot(page, 'w2-06-D-after-done'))
  })
  await closeAll(page)
  await S('W2-07-D', async c => {
    await openEvents(page)
    const p0 = await text(page, q('events-period')); const n0 = (await lines(page)).length
    await page.selectOption(q('war-picker'), { label: 'JAN - DEC 27' }); await page.waitForTimeout(800)
    const p1 = await text(page, q('events-period')); const L1 = await lines(page)
    c.ok(await vis(page, q('events-sheet')) && p1 !== p0, `list open, View changed behind it: ${p0} -> ${p1}, lines ${n0} -> ${L1.length}; empty says "${await text(page, q('events-empty'))}"`)
    c.pic(await shot(page, 'w2-07-D-view-changed'))
    await page.selectOption(q('war-picker'), { index: 0 }); await page.waitForTimeout(800)
    c.ok((await lines(page)).length === n0, 'back to 2026 the list is as it was')
    const cell = q('event-1-2026-01-12')
    c.note('cell box ' + JSON.stringify(await rect(page, cell)) + ' sheet box ' + JSON.stringify(await rect(page, q('events-sheet'))))
    const cr = await rect(page, cell)
    c.note('what lies on the cell: ' + await page.evaluate(([x, y]) => { const h = document.elementFromPoint(x, y); return h.tagName + '.' + h.className }, [cr.x + cr.w / 2, cr.y + cr.h / 2]))
    await page.mouse.click(cr.x + cr.w / 2, cr.y + cr.h / 2); await page.waitForTimeout(700)
    c.note('after a mouse press on the Event cell behind the list: Event window=' + await vis(page, q('event-sheet')) + ', list=' + await vis(page, q('events-sheet')))
    c.pic(await shot(page, 'w2-07-D-cell-press'))
    if (await vis(page, q('event-sheet'))) {
      c.ok(!(await vis(page, q('events-sheet'))), 'the Event window opened and the list hid')
      await page.click(q('event-cancel')); await page.waitForTimeout(500)
      c.ok(await vis(page, q('events-sheet')), 'closing it returns the list')
      c.pic(await shot(page, 'w2-07-D-list-back'))
    } else c.fail('a press on an Event cell behind the open list does not open the Event window (the press lands on the window dimming layer; list ' + (await vis(page, q('events-sheet')) ? 'stays open' : 'closed') + ')')
  })
  await closeAll(page)
  await page.ctx.close()
  page = await world({ phone: true })
  await S('W2-07-P', async c => {
    await page.locator(q('settings-open')).tap(); await page.waitForSelector(q('settings-sheet')); await page.waitForTimeout(300)
    await page.locator(q('settings-events')).tap(); await page.waitForSelector(q('events-sheet')); await page.waitForTimeout(400)
    const cell = page.locator(q('event-1-2026-01-12'))
    c.note('cell box ' + JSON.stringify(await cell.boundingBox()) + ' (events window top ' + (await rect(page, q('events-sheet'))).y + ')')
    await cell.tap(); c.pic(await shot(page, 'w2-07-P-cell-tap'))
    await page.waitForTimeout(500)
    const es = await rect(page, q('event-sheet')); const vh = page.viewportSize().height
    if (!es) { c.fail('a tap on an Event cell behind the open list does not open the Event window: the list simply closes (list visible after the tap: ' + await vis(page, q('events-sheet')) + ')'); c.pic(await shot(page, 'w2-07-P-after-tap-settled')); return }
    c.ok(!!es && await vis(page, q('event-sheet')), 'the Event window opened from the cell: ' + JSON.stringify(es))
    if (es) { const mid = (es.y + es.b) / 2; c.ok(Math.abs(mid - vh / 2) < vh * 0.15 && es.y >= 0 && es.b <= vh, `Event window stands in the middle (centre ${mid | 0} of ${vh}, top ${es.y | 0}, bottom ${es.b | 0})`) }
    c.ok(!(await vis(page, q('events-sheet'))), 'the list is hidden while it is open')
    c.pic(await shot(page, 'w2-07-P-event-window'))
    await page.locator(q('event-cancel')).tap(); await page.waitForTimeout(500)
    c.ok(await vis(page, q('events-sheet')), 'the list returns after it closes')
    c.pic(await shot(page, 'w2-07-P-list-back'))
  })
  await closeAll(page)
  await page.ctx.close()
}
// =================================================================== holidays by file
const bom = Buffer.from([0xEF, 0xBB, 0xBF])
const csv = (rows, { eol = '\r\n', withBom = true, sep = ',' } = {}) => Buffer.concat([withBom ? bom : Buffer.alloc(0), Buffer.from(rows.map(r => Array.isArray(r) ? r.join(sep) : r).join(eol) + eol, 'utf8')])
const HEAD = 'From,To,Name,Kind,On grid'
async function openHolidays(page) {
  await page.click(q('settings-open')); await page.waitForSelector(q('settings-sheet')); await page.waitForTimeout(300)
  const tap = page.phone ? s => page.locator(s).tap() : s => page.click(s)
  await tap(q('settings-days')); await page.waitForTimeout(900)
  if (page.phone) {
    const tab = page.locator('[role=tab], button').filter({ hasText: /^Holidays$/ }).first()
    if (!(await tab.count())) throw new Error('no Holidays tab on the phone')
    await tab.tap(); await page.waitForTimeout(500)
  }
  await page.waitForSelector(q('days-part-holidays'))
  await page.evaluate(() => document.querySelector('[data-testid="days-part-holidays"]')?.scrollIntoView({ block: 'start' }))
  await page.waitForTimeout(200)
}
async function closeCalendar(page) {
  // the Calendar window's own close cross
  const ok = await page.evaluate(() => { const h = document.querySelector('[data-testid="days-part-holidays"]'); const w = h && (h.closest('[role=dialog]') || h.closest('.dayswin') || h.closest('[class*=win]') || h.parentElement); const x = w && [...w.querySelectorAll('button')].find(b => /^(✕|×|✖)$/.test(b.textContent.trim()) || /close/i.test(b.getAttribute('aria-label') || '')); if (x) { x.click(); return true } return false })
  if (!ok) await page.keyboard.press('Escape')
  await page.waitForTimeout(500)
}
async function importFile(page, name, buf) {
  await page.setInputFiles(q('hol-import-file'), { name, mimeType: 'text/csv', buffer: buf })
  await page.waitForTimeout(500)
  return readPreview(page)
}
async function readPreview(page) {
  if (!(await vis(page, q('hol-preview')))) return { open: false, err: await text(page, q('hol-why')) || await text(page, q('hol-err')) }
  return page.evaluate(() => {
    const t = s => [...document.querySelectorAll(s)].filter(e => e.getBoundingClientRect().width > 0).map(e => e.textContent.trim().replace(/\s+/g, ' '))
    const add = document.querySelector('[data-testid="hol-pv-add"]')
    return { open: true, file: t('[data-testid="hol-pv-file"]')[0], counts: t('[data-testid="hol-pv-counts"]')[0], err: t('[data-testid="hol-pv-err"]')[0] || '', addLabel: add?.textContent.trim(), addDisabled: !!add?.disabled,
      lines: [...document.querySelectorAll('[data-testid="hol-pv-list"] > *')].map(e => ({ cls: e.className, text: e.textContent.trim().replace(/\s+/g, ' ') })) }
  })
}
const holLines = page => page.evaluate(() => [...document.querySelectorAll('[data-testid="hol-list"] > *')].filter(e => e.getBoundingClientRect().width > 0).map(e => e.textContent.trim().replace(/\s+/g, ' ')))
const undoTitle = page => page.evaluate(() => document.getElementById('undoBtn')?.title)
const dayFacts = (page, iso) => page.evaluate(d => JSON.stringify(window.lwDayFacts(d)), iso)

if (on('hol')) {
  let page = await world()
  await S('W2-08-D', async c => {
    await openHolidays(page)
    const fr = await rect(page, q('hol-filerow')), li = await rect(page, q('hol-list')), ex = await rect(page, q('hol-export')), im = await rect(page, q('hol-import'))
    c.note(`list ${JSON.stringify(li)} filerow ${JSON.stringify(fr)} export ${JSON.stringify(ex)} import ${JSON.stringify(im)}`)
    c.ok(fr.y >= li.b - 1 && ex && im, 'Export / Import sheet sit under the list')
    c.note('button words: ' + await text(page, q('hol-export')) + ' | ' + await text(page, q('hol-import')))
    c.pic(await shot(page, 'w2-08-D-buttons-2026'))
    await page.click(q('hol-next')); await page.waitForTimeout(400)
    c.note('year now: ' + await text(page, q('hol-year')) + '; list lines: ' + (await holLines(page)).length + '; empty: ' + await text(page, q('hol-empty')) + '; nocover: ' + await text(page, q('hol-nocover')))
    const ex2 = await vis(page, q('hol-export')), im2 = await vis(page, q('hol-import'))
    c.ok(ex2 && im2, 'Export / Import still shown on the year with no holidays (' + await text(page, q('hol-year')) + ')')
    c.pic(await shot(page, 'w2-08-D-buttons-empty-year'))
    await page.click(q('hol-next')); await page.waitForTimeout(400)
    const covered = await text(page, q('hol-year'))
    c.ok(await vis(page, q('hol-export')) && await vis(page, q('hol-import')), 'and on ' + covered + ' (no leave period covers it): nocover="' + await text(page, q('hol-nocover')) + '"')
    c.pic(await shot(page, 'w2-08-D-buttons-uncovered-year'))
  })
  await page.ctx.close()
  page = await world({ phone: true })
  await S('W2-08-P', async c => {
    await openHolidays(page)
    c.pic(await shot(page, 'w2-08-P-holidays-part'))
    const fr = await rect(page, q('hol-filerow')), li = await rect(page, q('hol-list')), ex = await rect(page, q('hol-export')), im = await rect(page, q('hol-import'))
    const vw = page.viewportSize().width
    c.note(`list ${JSON.stringify(li)} filerow ${JSON.stringify(fr)} export ${JSON.stringify(ex)} import ${JSON.stringify(im)}`)
    c.ok(!!fr && fr.y >= li.b - 1 && ex.r <= vw && im.r <= vw && ex.x >= 0, 'phone: Export / Import under the list, inside the screen')
    await page.locator(q('hol-export')).tap(); const t = await shot(page, 'w2-08-P-tap-export'); c.pic(t)
    await page.waitForTimeout(500)
    await page.locator(q('hol-next')).tap(); await page.waitForTimeout(500)
    c.ok(await vis(page, q('hol-export')) && await vis(page, q('hol-import')), 'phone: still there on ' + await text(page, q('hol-year')))
    c.pic(await shot(page, 'w2-08-P-buttons-empty-year'))
  })
  await page.ctx.close()
  // --- W2-09 export
  page = await world()
  await S('W2-09-D', async c => {
    await openHolidays(page)
    const [dl] = await Promise.all([page.waitForEvent('download', { timeout: 8000 }), page.click(q('hol-export'))])
    const f = join(OUT, '_export-2026.csv'); await dl.saveAs(f)
    const buf = readFileSync(f)
    c.note('download name: ' + dl.suggestedFilename() + '; bytes ' + buf.length + '; first bytes ' + [...buf.slice(0, 4)].map(b => b.toString(16)).join(' '))
    c.ok(dl.suggestedFilename() === 'holidays-2026.csv', 'file named holidays-2026.csv')
    c.ok(buf[0] === 0xEF && buf[1] === 0xBB && buf[2] === 0xBF, 'starts with the byte-order mark')
    const txt = buf.toString('utf8').replace(/^﻿/, '')
    c.note('file text: ' + JSON.stringify(txt))
    const rows = txt.split(/\r?\n/).filter(Boolean).map(r => r.replace(/"/g, ''))
    c.ok(/^From,To,Name,Kind/i.test(rows[0]), 'header row: ' + rows[0])
    c.ok(rows.some(r => r.includes('2026-08-09')), 'dates written 2026-08-09')
    c.ok(rows.some(r => r.startsWith('2026-02-17,2026-02-18')), 'the Chinese New Year run is one line')
    c.ok(/\r\n/.test(buf.toString('utf8')), 'Windows line endings')
    // re-import the exact file
    const pv = await importFile(page, 'holidays-2026.csv', buf)
    c.note('re-import preview: ' + JSON.stringify({ counts: pv.counts, add: pv.addLabel, dis: pv.addDisabled, classes: pv.lines?.map(l => l.cls.replace('hol-line', '').trim()) }))
    c.ok(pv.open && /^0 to add/.test(pv.counts) && pv.addDisabled, 'every line "already here", nothing to add, Add greyed: ' + pv.counts + ' / ' + pv.addLabel)
    c.pic(await shot(page, 'w2-09-D-reimport'))
  })
  await closeCalendar(page)
  await page.ctx.close()
}
if (on('hol2')) {
  const page = await world()
  const brief = pv => pv.open ? `${pv.counts} | ${pv.addLabel}${pv.addDisabled ? ' (greyed)' : ''}${pv.err ? ' | err: ' + pv.err : ''} || ` + pv.lines.map(l => `[${l.cls.replace('hol-line', '').replace('is-past', '').trim()}] ${l.text}`).join(' ;; ') : 'PREVIEW NOT OPEN: ' + pv.err
  const cancel = async () => { if (await vis(page, q('hol-pv-cancel'))) { await page.click(q('hol-pv-cancel')); await page.waitForTimeout(300) } }
  await openHolidays(page)
  await S('W2-10-D', async c => {
    const rowsA = [HEAD, '9/10/2026,,Test Nine Oct,PH,', '13/10/2026,13/10/2026,Test Thirteen,PH,', '14/10/26,,Test Fourteen,PH,', '15-Oct-26,,Test Fifteen,PH,', '16/10/2026,,"Hari Raya, Day 2",PH,', '17/10/2026,,Test Seventeen,PH,,,,', ',,,,,,,', ',,,,']
    const want = ['Fri 9 Oct', 'Tue 13 Oct', 'Wed 14 Oct', 'Thu 15 Oct', 'Fri 16 Oct', 'Sat 17 Oct']
    for (const [label, buf] of [['comma, BOM, CRLF', csv(rowsA)], ['semicolons', csv(rowsA.map(r => r.startsWith('16/') ? '16/10/2026;;Hari Raya, Day 2;PH;' : r.replace(/,/g, ';')), { sep: ';' })]]) {
      const pv = await importFile(page, 'holidays-2026.csv', buf)
      c.note(label + ': ' + brief(pv))
      c.ok(pv.open && /^6 to add · 0 already here · 0 not read/.test(pv.counts), label + ' counts 6 to add / 0 not read: ' + pv.counts)
      const whens = pv.open ? pv.lines.map(l => l.text) : []
      c.ok(want.every(w => whens.some(t => t.includes(w))), label + ': every date read day-first (' + want.join(', ') + ')')
      c.ok(whens.some(t => t.includes('Hari Raya, Day 2')), label + ': quoted name "Hari Raya, Day 2" kept whole')
      c.pic(await shot(page, 'w2-10-D-' + (label.startsWith('comma') ? 'comma' : 'semicolon')))
      await cancel()
    }
  })
  await S('W2-11-D', async c => {
    const long = 'N'.repeat(90)
    const rows = [HEAD, '8/11,,Deepavali,PH,', '2026-10-01,,Bad kind row,XYZ,', '2026-10-02,,Empty kind row,,', '2026-10-05,,' + long + ',PH,', '2026-10-06,,Bad on grid,PH,TOOLONG', '2026-10-09,2026-10-07,To before from,PH,', '2026-10-12,,Good one,PH,', '2026-10-12,,Good one,PH,', '2030-03-03,,No period,PH,', '2026-12-30,2027-01-03,Past end,PH,', '2026-10-20,,Fine new,Off day,']
    const pv = await importFile(page, 'holidays-2026.csv', csv(rows))
    c.note(brief(pv))
    c.pic(await shot(page, 'w2-11-D-preview-top'))
    const bad = pv.lines.filter(l => /pv-bad/.test(l.cls)), nw = pv.lines.filter(l => /pv-new/.test(l.cls))
    c.note('not read ' + bad.length + ': ' + bad.map(l => l.text).join(' ;; '))
    const names = ['8/11', 'XYZ', 'Empty kind', 'NNNN', 'TOOLONG', 'To before', 'Good one', 'No period', 'Past end']
    for (const n of names) { const l = pv.lines.find(l => l.text.includes(n)); c.note(`row "${n}": ${l ? l.cls.replace('hol-line', '').trim() + ' -> ' + l.text.slice(0, 200) : 'NOT LISTED'}`) }
    c.ok(bad.every(l => l.text.length > 25), 'every red line carries a reason')
    c.ok(pv.lines.some(l => /same .*as row/i.test(l.text)), 'duplicate says "same as row N"')
    const nNew = nw.length
    c.ok(new RegExp('^' + nNew + ' to add').test(pv.counts) && pv.addLabel === `Add ${nNew} holiday${nNew === 1 ? '' : 's'}`, `Add counts only the new (${nNew}): ${pv.counts} / ${pv.addLabel}`)
    await page.evaluate(() => document.querySelector('[data-testid="hol-preview"]').scrollIntoView({ block: 'end' })); await page.waitForTimeout(200)
    c.pic(await shot(page, 'w2-11-D-preview-foot'))
    await cancel()
  })
  await S('W2-12-D', async c => {
    const tests = [
      ['no header', csv(['2026-10-26,,No header A,PH,', '2026-10-27,,No header B,PH,'])],
      ['blank line before header', csv(['', HEAD, '2026-10-26,,After blank,PH,'])],
      ['blank commas row before header', csv([',,,,', HEAD, '2026-10-26,,After commas,PH,'])],
      ['columns reordered', csv(['Name,Kind,To,From,On grid', 'Reordered,PH,,2026-10-26,'])],
      ['quoted name with a line break', csv([HEAD, '2026-10-26,,"Line one\nLine two",PH,'])],
      ['UTF-8 no BOM, non-English', csv([HEAD, '2026-10-26,,Deepavali தீபாவளி 元旦,PH,'], { withBom: false })],
      ['Windows-1252 (Excel plain CSV)', Buffer.concat([Buffer.from(HEAD + '\r\n2026-10-26,,Caf', 'latin1'), Buffer.from([0xE9]), Buffer.from(' No', 'latin1'), Buffer.from([0xEB]), Buffer.from('l,PH,\r\n', 'latin1')])],
    ]
    for (const [label, buf] of tests) {
      const pv = await importFile(page, 'x.csv', buf)
      c.note(label + ' => ' + brief(pv))
      await cancel()
    }
    const pvs = []
    for (const [label, buf] of tests) { const pv = await importFile(page, 'x.csv', buf); pvs.push([label, pv]); if (label === 'blank line before header') c.pic(await shot(page, 'w2-12-D-blank-before-header')); await cancel() }
    const g = l => pvs.find(p => p[0] === l)[1]
    c.ok(g('blank line before header').open && /^1 to add/.test(g('blank line before header').counts), 'a blank line above the header is read: ' + g('blank line before header').counts)
    c.ok(g('blank commas row before header').open && /^1 to add/.test(g('blank commas row before header').counts), 'a ",,,," row above the header is read: ' + g('blank commas row before header').counts)
    c.ok(g('columns reordered').open && /^1 to add/.test(g('columns reordered').counts) && g('columns reordered').lines.some(l => l.text.includes('Reordered') && l.text.includes('26 Oct')), 'reordered columns are read by their headings: ' + g('columns reordered').counts)
    c.ok(g('quoted name with a line break').open && /^1 to add/.test(g('quoted name with a line break').counts), 'a quoted name with a line break stays one row: ' + g('quoted name with a line break').counts)
    c.ok(g('UTF-8 no BOM, non-English').open && g('UTF-8 no BOM, non-English').lines.some(l => l.text.includes('தீபாவளி') && l.text.includes('元旦')), 'non-English name kept (UTF-8): ' + g('UTF-8 no BOM, non-English').lines.map(l => l.text).join(';'))
    const w = g('Windows-1252 (Excel plain CSV)')
    c.ok(w.open && w.lines.some(l => l.text.includes('Café Noël')), 'Excel plain-CSV (Windows-1252) accents read right: ' + w.lines.map(l => l.text).join(';'))
    c.note('no header: ' + brief(g('no header')))
  })
  await closeCalendar(page)
  await page.ctx.close()
}
const gridText = (page, t) => page.evaluate(t => { const e = document.querySelector(`[data-testid="${t}"]`); return e ? (e.textContent.trim() || '+') : null }, t)
const reqRows = (page, iso) => page.evaluate(iso => { const h = document.querySelector(`[data-testid="head-${iso}"]`); if (!h) return null; const x = h.getBoundingClientRect(), cx = x.left + x.width / 2; const out = {}; for (const tr of document.querySelectorAll('tr')) { const lab = (tr.firstElementChild?.textContent || '').trim().replace(/^[•·\s]+/, ''); if (/^(REQUIRED|AVAILABLE) [PW]$/i.test(lab)) { const td = [...tr.children].find(td => { const r = td.getBoundingClientRect(); return r.left <= cx && r.right >= cx }); out[lab] = td ? td.textContent.trim() : '?' } } return out }, iso)
const ringOf = (page, name) => page.evaluate(name => { const e = [...document.querySelectorAll('[data-testid="hol-list"] > *')].find(e => e.textContent.includes(name)); if (!e) return null; const s = getComputedStyle(e); return { cls: e.className, shadow: s.boxShadow, outline: s.outlineStyle + ' ' + s.outlineWidth + ' ' + s.outlineColor, border: s.borderTopColor } }, name)
async function signBackIn(page) {
  await page.waitForSelector('#luser', { timeout: 6000 }).catch(() => {})
  if (await page.locator('#luser').count()) { await page.fill('#luser', 'ad'); await page.fill('#lpass', 'a'); await page.click('#loginForm button[type=submit]'); await page.waitForSelector('#vWeek .day') }
  await page.evaluate(() => window.go('leavewar')); await page.waitForSelector(q('row-slipway')); await page.waitForTimeout(800)
}
if (on('hol3')) {
  let page = await world()
  const D3 = ['2026-10-09', '2026-10-13', '2026-10-14']
  const sheet3 = csv([HEAD, '2026-10-09,,Test Nine,PH,', '2026-10-13,,Test Thirteen,PH,', '2026-10-14,,Test Fourteen,PH,'])
  await S('W2-13-D', async c => {
    await page.click(q('month-OCT')); await page.waitForTimeout(900)
    const before = {}; for (const d of D3) before[d] = { ev0: await gridText(page, `event-0-${d}`), ev1: await gridText(page, `event-1-${d}`), rows: await reqRows(page, d), facts: await dayFacts(page, d) }
    c.note('BEFORE ' + JSON.stringify(before))
    await openHolidays(page)
    c.note('undo title before: ' + await undoTitle(page))
    const pv = await importFile(page, 'holidays-2026.csv', sheet3)
    c.ok(pv.open && /^3 to add/.test(pv.counts), 'preview 3 to add: ' + pv.counts + ' / ' + pv.addLabel)
    await page.click(q('hol-pv-add')); await page.waitForTimeout(450)
    const saved = await text(page, q('hol-saved'))
    c.note('after Add: preview open=' + await vis(page, q('hol-preview')) + ', saved note=' + JSON.stringify(saved) + ', year=' + await text(page, q('hol-year')))
    c.note('undo title after: ' + await undoTitle(page))
    c.ok(/adding 3 holidays/i.test(await undoTitle(page) || ''), 'one Undo step, "adding 3 holidays": ' + await undoTitle(page))
    const r1 = await ringOf(page, 'Test Nine'); c.note('ring at 0.5 s: ' + JSON.stringify(r1))
    await page.evaluate(() => document.querySelector('[data-testid="hol-list"] > *')?.scrollIntoView({ block: 'nearest' }))
    c.pic(await shot(page, 'w2-13-D-after-add-ring'))
    await page.waitForTimeout(3000); const r2 = await ringOf(page, 'Test Nine'); c.note('ring at 3.5 s: ' + JSON.stringify(r2))
    await page.waitForTimeout(4000); const r3 = await ringOf(page, 'Test Nine'); c.note('ring at 7.5 s: ' + JSON.stringify(r3))
    c.ok(r1 && r1.shadow !== 'none' && r1.shadow !== (r3 && r3.shadow), 'the new lines wear a ring after Add that has gone by 7.5 s: ' + (r1 && r1.shadow) + ' -> ' + (r3 && r3.shadow))
    c.pic(await shot(page, 'w2-13-D-after-7s'))
    await closeCalendar(page)
    await page.click(q('month-OCT')); await page.waitForTimeout(900)
    const after = {}; for (const d of D3) after[d] = { ev0: await gridText(page, `event-0-${d}`), rows: await reqRows(page, d), facts: await dayFacts(page, d) }
    c.note('AFTER ' + JSON.stringify(after))
    c.ok(['TN', 'TT', 'TF'].every((t, i) => after[D3[i]].ev0 === t), 'the grid Event row shows each holiday short form (TN TT TF) on its date: ' + D3.map(d => after[d].ev0).join(','))
    c.ok(D3.every(d => /"isPublicHoliday":true|"kind":"PH"|PH/i.test(after[d].facts)), 'the day facts (what the calendars tag) say public holiday: ' + after[D3[0]].facts)
    await page.evaluate(() => document.querySelector('[data-testid="event-0-2026-10-13"]')?.scrollIntoView({ block: 'center', inline: 'center' })); await page.waitForTimeout(300)
    c.pic(await shot(page, 'w2-13-D-grid-event-rows-required'))
    // undo
    const ub = await rect(page, '#undoBtn'); await page.mouse.click(ub.x + ub.w / 2, ub.y + ub.h / 2); await page.waitForTimeout(700)
    const un = {}; for (const d of D3) un[d] = await gridText(page, `event-0-${d}`)
    c.ok(D3.every(d => /^[+＋]$/.test(un[d])), 'ONE Undo takes all three back: ' + JSON.stringify(un) + '; redo title: ' + await page.evaluate(() => document.getElementById('redoBtn')?.title))
    c.pic(await shot(page, 'w2-13-D-after-undo'))
    const rb = await rect(page, '#redoBtn'); await page.mouse.click(rb.x + rb.w / 2, rb.y + rb.h / 2); await page.waitForTimeout(700)
    const rd = {}; for (const d of D3) rd[d] = await gridText(page, `event-0-${d}`)
    c.ok(['TN', 'TT', 'TF'].every((t, i) => rd[D3[i]] === t), 'Redo puts all three back: ' + JSON.stringify(rd))
    // reload
    await page.reload(); await signBackIn(page); await page.click(q('month-OCT')); await page.waitForTimeout(900)
    const rl = {}; for (const d of D3) rl[d] = await gridText(page, `event-0-${d}`)
    c.ok(['TN', 'TT', 'TF'].every((t, i) => rl[D3[i]] === t), 'after a reload they are kept: ' + JSON.stringify(rl))
    c.pic(await shot(page, 'w2-13-D-after-reload'))
    page.pageErrors = page.errors
    c.note('page errors: ' + JSON.stringify(page.errors))
  })
  await page.ctx.close()
  // ---- W2-14 two years
  page = await world()
  await S('W2-14-D', async c => {
    await openHolidays(page)
    const sheet = csv([HEAD, '2026-10-13,,Y26 Test,PH,', '2027-01-04,,Y27 Test,PH,', '2027-02-03,,Y27 Test B,Off day,'])
    const pv = await importFile(page, 'holidays-both.csv', sheet)
    c.note('preview: ' + JSON.stringify({ c: pv.counts, a: pv.addLabel, lines: pv.lines?.map(l => l.text) }))
    c.ok(pv.open && /^3 to add/.test(pv.counts), 'a sheet across 2026 and 2027 reads: ' + pv.counts)
    c.pic(await shot(page, 'w2-14-D-preview'))
    await page.click(q('hol-pv-add')); await page.waitForTimeout(500)
    { const sv = await text(page, q('hol-saved')); const yr = await text(page, q('hol-year')); if (!sv) c.fail('after Add of a sheet with 2 of 3 rows in 2027 the screen stays on ' + yr + ', shows only that year one new line ringed, and says nothing about the two holidays added to 2027 out of view (D850)') }
    c.note('after Add: year shown ' + await text(page, q('hol-year')) + ', saved note ' + JSON.stringify(await text(page, q('hol-saved'))) + ', undo: ' + await undoTitle(page))
    const l26 = await holLines(page); c.note('2026 list: ' + l26.join(' ;; '))
    c.pic(await shot(page, 'w2-14-D-after-add-2026'))
    await page.click(q('hol-next')); await page.waitForTimeout(400)
    const l27 = await holLines(page); c.ok(l27.some(t => t.includes('Y27 Test')) && l27.some(t => t.includes('Y27 Test B')), '2027 list shows both: ' + l27.join(' ;; '))
    c.pic(await shot(page, 'w2-14-D-2027-list'))
    await closeCalendar(page)
    await page.reload(); await signBackIn(page)
    await openHolidays(page)
    const k26 = (await holLines(page)).some(t => t.includes('Y26 Test'))
    await page.click(q('hol-next')); await page.waitForTimeout(400)
    const k27 = (await holLines(page)).filter(t => t.includes('Y27 Test')).length
    c.ok(k26 && k27 === 2, `after a reload both years kept (2026 Y26: ${k26}; 2027 lines: ${k27})`)
    await closeCalendar(page)
    const ub = await rect(page, '#undoBtn'); await page.mouse.click(ub.x + ub.w / 2, ub.y + ub.h / 2); await page.waitForTimeout(700)
    await openHolidays(page)
    const u27 = (await holLines(page)).filter(t => t.includes('Y27 Test')).length
    await page.click(q('hol-prev')); await page.waitForTimeout(300)
    const u26 = (await holLines(page)).some(t => t.includes('Y26 Test'))
    c.ok(u27 === 0 && !u26, `one Undo took both years back (2027 lines ${u27}, 2026 Y26 ${u26})`)
    c.pic(await shot(page, 'w2-14-D-after-undo'))
  })
  await closeCalendar(page)
  await page.ctx.close()
  // ---- W2-15 event rows nearly full
  page = await world()
  await S('W2-15-D', async c => {
    await stage(page, '2026-10-20', 0, 'BUSY ROW 0')
    await page.waitForTimeout(400)
    await openHolidays(page)
    const sheet = csv([HEAD, '2026-10-20,,Alpha PH,PH,', '2026-10-20,,Beta Off,Off day,'])
    const pv = await importFile(page, 'two.csv', sheet)
    c.note('preview: ' + brief2(pv))
    c.ok(pv.open && /^2 to add/.test(pv.counts), 'both rows show as new: ' + pv.counts)
    await page.click(q('hol-pv-add')); await page.waitForTimeout(500)
    const err = await text(page, q('hol-pv-err'))
    c.note('after Add: err=' + JSON.stringify(err) + ' preview open=' + await vis(page, q('hol-preview')))
    c.ok(/row/i.test(err), 'Add names the row it cannot place: ' + err)
    c.pic(await shot(page, 'w2-15-D-refused'))
    const f = await dayFacts(page, '2026-10-20'); c.note('day facts 20 Oct after refusal: ' + f)
    c.ok(!/Alpha|Beta/.test(f), 'nothing was added')
    await closeCalendar(page)
    await page.click(q('settings-open')); await page.waitForSelector(q('settings-sheet')); await page.waitForTimeout(300)
    const btn = page.locator(`${q('settings-sheet')} button`).filter({ hasText: /Event row/ })
    c.note('Settings buttons with "Event row": ' + await btn.allTextContents())
    await btn.first().click(); await page.waitForTimeout(500)
    await closeAll(page)
    await openHolidays(page)
    const pv2 = await importFile(page, 'two.csv', sheet)
    c.note('second preview: ' + brief2(pv2))
    await page.click(q('hol-pv-add')); await page.waitForTimeout(600)
    const err2 = await text(page, q('hol-pv-err')); const saved2 = await text(page, q('hol-saved'))
    c.note('after Add (3 event rows): err=' + JSON.stringify(err2) + ' saved=' + JSON.stringify(saved2))
    const f2 = await dayFacts(page, '2026-10-20'); c.note('day facts 20 Oct: ' + f2)
    c.ok(!err2 && /Alpha|PH|Off/.test(f2 + (await holLines(page)).join()), 'with a third Event row, Add works')
    c.pic(await shot(page, 'w2-15-D-added'))
  })
  await closeCalendar(page)
  await page.ctx.close()
}
function brief2(pv) { return pv.open ? `${pv.counts} | ${pv.addLabel}${pv.addDisabled ? ' (greyed)' : ''}${pv.err ? ' | err: ' + pv.err : ''} || ` + pv.lines.map(l => `[${l.cls.replace('hol-line', '').trim()}] ${l.text}`).join(' ;; ') : 'PREVIEW NOT OPEN: ' + pv.err }
const bellLines = async page => { await page.click('#bell'); await page.waitForTimeout(500); const t = await page.evaluate(() => [...document.querySelectorAll('[data-testid="bell-list"] > *, [data-testid="bell-list"] li, [data-testid="bell-list"] button')].filter(e => e.getBoundingClientRect().width > 0).map(e => e.textContent.trim().replace(/\s+/g, ' ')).filter(Boolean)); return t }
const barCount = page => page.evaluate(() => (document.getElementById('bell')?.textContent || '').trim() + '|' + (document.getElementById('bell')?.getAttribute('aria-label') || ''))
if (on('hol4')) {
  let page = await world()
  await S('W2-16-D', async c => {
    c.note('bell before: ' + await barCount(page))
    await openHolidays(page)
    const sheet = csv([HEAD, '2026-07-14,,Oil Test Tue,PH,', '2026-07-16,,Oil Test Thu,PH,', '2026-07-18,,Oil Test Sat,PH,'])
    const pv = await importFile(page, 'oil.csv', sheet); c.note('preview ' + brief2(pv))
    await page.click(q('hol-pv-add')); await page.waitForTimeout(1200)
    const seen = await page.evaluate(() => [...document.querySelectorAll('[data-testid]')].filter(e => /oil/i.test(e.dataset.testid) && e.getBoundingClientRect().width > 0).map(e => e.dataset.testid + ':' + e.textContent.trim().slice(0, 80)))
    c.note('OIL surfaces visible after Add: ' + JSON.stringify(seen) + '; page now: ' + await page.evaluate(() => window.CURPAGE))
    c.pic(await shot(page, 'w2-16-D-after-add'))
    await closeCalendar(page)
    await page.waitForTimeout(500)
    c.note('page after closing the Calendar: ' + await page.evaluate(() => window.CURPAGE) + '; bell: ' + await barCount(page))
    c.pic(await shot(page, 'w2-16-D-after-close'))
    const bellBtn = { x: 1190, y: 18, w: 38, h: 28 }
    c.note('bell button box: ' + JSON.stringify(bellBtn))
    await page.mouse.click(bellBtn.x + bellBtn.w / 2, bellBtn.y + bellBtn.h / 2); await page.waitForTimeout(700)
    const L = await page.evaluate(() => [...document.querySelectorAll('[data-testid="bell-list"] > *, [data-testid="bell-list"] li, [data-testid="bell-list"] button')].filter(e => e.getBoundingClientRect().width > 0).map(e => e.textContent.trim().replace(/\s+/g, ' ')).filter(Boolean))
    c.note('bell lines (' + L.length + '): ' + JSON.stringify(L))
    c.pic(await shot(page, 'w2-16-D-bell'))
    c.ok(L.some(t => /Oil Test Tue/.test(t) && /OIL/.test(t)) && L.some(t => /Oil Test Thu/.test(t)), 'the bell has one line a holiday that needs OIL answers: ' + L.join(' ;; '))
    const holLinesInBell = L.filter(t => /holiday/i.test(t)).length
    c.note('holiday lines in the bell: ' + holLinesInBell + ' for 3 holidays imported')
    await page.keyboard.press('Escape'); await page.waitForTimeout(300)
    c.partial('the demo week (13 to 19 Jul) has no published day and Mon to Thu carry hard conflicts so a publish is refused; this run is the unpublished working copy with an accepted appointment on Tue 14 Jul. NOT walked: a published worked weekday waiting for republishing (D2), and the control (a PH on an already-worked Saturday)')
    // Undo takes the bell lines back
    await page.mouse.click(bellBtn.x + bellBtn.w / 2, bellBtn.y + bellBtn.h / 2).catch(() => {})
    await page.waitForTimeout(300)
    for (let i = 0; i < 3; i++) { if (await vis(page, '[data-testid="bell-list"]')) { await page.keyboard.press('Escape'); await page.waitForTimeout(200) } }
    const ub = await rect(page, '#undoBtn'); await page.mouse.click(ub.x + ub.w / 2, ub.y + ub.h / 2); await page.waitForTimeout(800)
    c.note('OIL windows still open after Undo: ' + await page.evaluate(() => [...document.querySelectorAll('[data-testid^="win-oilday"]')].filter(e => e.getBoundingClientRect().width > 0).length) + '; bell badge: ' + await barCount(page))
    await page.mouse.click(bellBtn.x + bellBtn.w / 2, bellBtn.y + bellBtn.h / 2); await page.waitForTimeout(700)
    const L2 = await page.evaluate(() => [...document.querySelectorAll('[data-testid="bell-list"] > *, [data-testid="bell-list"] li, [data-testid="bell-list"] button')].filter(e => e.getBoundingClientRect().width > 0).map(e => e.textContent.trim().replace(/\s+/g, ' ')).filter(Boolean))
    c.note('bell lines after Undo: ' + JSON.stringify(L2) + ' empty text: ' + await text(page, '[data-testid="bell-empty"]'))
    c.ok(!L2.some(t => /Oil Test/.test(t)), 'Undo took the holiday lines out of the bell')
    c.pic(await shot(page, 'w2-16-D-bell-after-undo'))
  })
  await page.ctx.close()
  // ---- W2-17 leave recount
  page = await world()
  // Ranger's row (id bane): the smallest visible boxes whose own text names him, read on every page that shows his figures
  const rowsNamed = () => page.evaluate(() => {
    const out = []
    for (const e of document.querySelectorAll('tr, li, [data-testid], [role=row]')) {
      const t = e.textContent.trim().replace(/\s+/g, ' ')
      if (!/Ranger/.test(t) || t.length > 330 || e.getBoundingClientRect().width <= 0) continue
      if ([...e.querySelectorAll('tr, li, [data-testid]')].some(k => /Ranger/.test(k.textContent) && k.textContent.trim().length < t.length && k.getBoundingClientRect().width > 0 && k.tagName === e.tagName)) continue
      out.push(t)
    }
    return [...new Set(out)].slice(0, 8)
  })
  const personSnap = async () => {
    const s = {}
    s.grid = (await rowsNamed()).filter(t => /^Ranger/.test(t)).slice(0, 1)
    await page.click(q('lw-tab-approvals')); await page.waitForTimeout(800)
    s.approvals = await rowsNamed(); await shot(page, 'w2-17-approvals-' + page.__phase)
    await page.click(q('lw-tab-balances')); await page.waitForTimeout(800)
    s.balances = await rowsNamed(); await shot(page, 'w2-17-balances-' + page.__phase)
    const dt = page.locator('button').filter({ hasText: /^Days taken$/ }).first()
    if (await dt.count()) { await dt.click(); await page.waitForTimeout(700); s.daysTaken = await rowsNamed(); await shot(page, 'w2-17-daystaken-' + page.__phase) }
    await page.click(q('lw-tab-grid')); await page.waitForTimeout(800)
    // his person window: a press on his name on the grid
    const nm = await rect(page, '[data-testid="row-bane"] td:first-child, [data-testid="row-bane"] th:first-child')
    if (nm) { await page.mouse.click(nm.x + nm.w / 2, nm.y + nm.h / 2); await page.waitForTimeout(800)
      s.personWindow = await page.evaluate(() => { const w = [...document.querySelectorAll('[data-testid]')].filter(e => /person|tiles/i.test(e.dataset.testid) && e.getBoundingClientRect().width > 0 && /LVE|balance/i.test(e.textContent)); const e = w.sort((a, b) => a.textContent.length - b.textContent.length).pop(); return e ? e.dataset.testid + ': ' + e.textContent.trim().replace(/\s+/g, ' ').slice(0, 500) : null })
      await shot(page, 'w2-17-person-' + page.__phase)
      await page.keyboard.press('Escape'); await page.waitForTimeout(400) }
    return s
  }
  await S('W2-17-D', async c => {
    page.__phase = 'before'
    const before = await personSnap()
    c.note('BEFORE ' + JSON.stringify(before))
    await openHolidays(page)
    const sheet = csv([HEAD, '2026-01-20,,Leave Test Approved,PH,', '2026-02-12,,Leave Test Pending,PH,'])
    const pv = await importFile(page, 'll.csv', sheet); c.note(brief2(pv))
    await page.click(q('hol-pv-add')); await page.waitForTimeout(900)
    await closeCalendar(page)
    page.__phase = 'after'
    const after = await personSnap()
    c.note('AFTER ' + JSON.stringify(after))
    const same = JSON.stringify(before) === JSON.stringify(after)
    c.ok(!same, 'something recounted after the two weekdays became public holidays')
    for (const k of Object.keys(before)) c.note(`${k} changed: ${JSON.stringify(before[k]) !== JSON.stringify(after[k])}`)
    c.pic(await shot(page, 'w2-17-D-grid-after'))
  })
  await page.ctx.close()
  // ---- W2-18 preview open, same PH added elsewhere
  page = await world()
  await S('W2-18-D', async c => {
    await openHolidays(page)
    const sheet = csv([HEAD, '2026-01-12,,Behind Test,PH,', '2026-01-13,,Behind Test 2,PH,'])
    let pv = await importFile(page, 'b.csv', sheet); c.note(brief2(pv))
    const cell = q('event-0-2026-01-12'); const cr = await rect(page, cell)
    c.note('the grid Event cell (12 Jan) box ' + JSON.stringify(cr) + '; what lies on it: ' + await page.evaluate(([x, y]) => { const h = document.elementFromPoint(x, y); return h.tagName + '.' + String(h.className).slice(0, 40) }, [cr.x + cr.w / 2, cr.y + cr.h / 2]))
    await page.mouse.click(cr.x + cr.w / 2, cr.y + cr.h / 2); await page.waitForTimeout(700)
    c.note('after pressing the cell behind: Event window=' + await vis(page, q('event-sheet')) + ', preview still=' + await vis(page, q('hol-preview')) + ', Calendar window=' + await vis(page, q('days-part-holidays')))
    c.pic(await shot(page, 'w2-18-D-cell-behind'))
    if (await vis(page, q('event-sheet'))) {
      await page.click(q('event-quick-0')); await page.click(q('event-apply')); await page.waitForTimeout(500)
    }
    // Cancel and the year arrows put the list back
    if (!(await vis(page, q('hol-preview')))) { await openHolidays(page).catch(() => {}); pv = await importFile(page, 'b.csv', sheet) }
    pv = await readPreview(page)
    c.note('preview now: ' + brief2(pv))
    await page.click(q('hol-pv-add')); await page.waitForTimeout(800)
    const f = await dayFacts(page, '2026-01-12'); const lns = await holLines(page)
    { const n12 = lns.filter(t => t.startsWith('Mon 12 Jan')).length; if (n12 >= 2) c.fail('the preview was not re-checked at Add: after a PH was added on the grid behind it (12 Jan), Add still read "2 to add" and put a second PH on 12 Jan (' + n12 + ' lines for that date)') }
    c.note('after Add: 12 Jan facts ' + f + '; lines ' + lns.join(' ;; '))
    c.note('error: ' + await text(page, q('hol-pv-err')) + ' | ' + await text(page, q('hol-err')))
    c.pic(await shot(page, 'w2-18-D-after-add'))
    // same file twice
    pv = await importFile(page, 'b.csv', sheet); c.note('same file imported again: ' + brief2(pv))
    c.ok(pv.open && /^0 to add/.test(pv.counts) && pv.addDisabled, 'importing the same file twice: everything already here, Add greyed: ' + pv.counts)
    c.pic(await shot(page, 'w2-18-D-same-file-twice'))
    // cancel / year arrows
    await page.click(q('hol-pv-cancel')); await page.waitForTimeout(300)
    const afterCancel = await holLines(page)
    c.ok(!(await vis(page, q('hol-preview'))) && afterCancel.length >= 5, 'Cancel puts the list back (' + afterCancel.length + ' lines)')
    pv = await importFile(page, 'b.csv', csv([HEAD, '2026-11-05,,Arrow Test,PH,']))
    await page.click(q('hol-next')); await page.waitForTimeout(400)
    c.note('year arrow with preview open: preview=' + await vis(page, q('hol-preview')) + ' year=' + await text(page, q('hol-year')) + ' lines=' + (await holLines(page)).length)
    c.pic(await shot(page, 'w2-18-D-year-arrow-with-preview'))
    await page.click(q('hol-prev')); await page.waitForTimeout(400)
    c.note('back: preview=' + await vis(page, q('hol-preview')) + ' year=' + await text(page, q('hol-year')) + ' lines=' + (await holLines(page)).length)
  })
  await closeCalendar(page)
  await page.ctx.close()
  // ---- W2-19 long preview + refusal
  for (const phone of [false, true]) {
    page = await world({ phone })
    const tag = phone ? 'P' : 'D'
    await S('W2-19-' + tag, async c => {
      await openHolidays(page)
      const rows = [HEAD]; const days = []
      for (let m = 3; m <= 11; m++) for (const d of ['02', '09', '16', '23']) days.push(`2026-${String(m).padStart(2, '0')}-${d}`)
      days.slice(0, 30).forEach((d, i) => rows.push(`${d},,Long Row ${i + 1},PH,`))
      rows.push('2026-12-07,,Refuse A,PH,', '2026-12-07,,Refuse B,Off day,', '2026-12-07,,Refuse C,PH,')
      await stage(page, '2026-12-07', 0, 'BUSY'); await page.waitForTimeout(300)
      const pv = await importFile(page, 'long.csv', csv(rows)); c.note(`preview ${pv.counts} ${pv.addLabel}`)
      c.pic(await shot(page, `w2-19-${tag}-preview-top`))
      const ar = await page.evaluate(() => { const b = document.querySelector('[data-testid="hol-pv-add"]'); const r = b.getBoundingClientRect(); return { top: r.top, bottom: r.bottom, vh: innerHeight, inview: r.top >= 0 && r.bottom <= innerHeight } })
      c.note('Add button before scrolling: ' + JSON.stringify(ar))
      c.note('Add is below the fold of a 31-row preview (' + JSON.stringify(ar) + '); reached by scrolling the part')
      if (phone) await page.locator(q('hol-pv-add')).scrollIntoViewIfNeeded()
      await page.evaluate(() => document.querySelector('[data-testid="hol-pv-add"]').scrollIntoView({ block: 'nearest' })); await page.waitForTimeout(200)
      if (phone) { await page.locator(q('hol-pv-add')).tap(); c.pic(await shot(page, `w2-19-${tag}-tap-add`)) } else await page.click(q('hol-pv-add'))
      await page.waitForTimeout(700)
      const er = await page.evaluate(() => { const e = document.querySelector('[data-testid="hol-pv-err"]'); if (!e) return null; const r = e.getBoundingClientRect(); const cx = r.left + r.width / 2, cy = r.top + Math.min(r.height / 2, 10); const h = document.elementFromPoint(cx, cy); const a = document.querySelector('[data-testid="hol-pv-add"]').getBoundingClientRect(); return { text: e.textContent.trim().slice(0, 140), top: r.top, bottom: r.bottom, vh: innerHeight, onScreen: r.top >= 0 && r.bottom <= innerHeight, hit: h === e || e.contains(h), covers: h ? h.tagName + '.' + String(h.className).slice(0, 30) : null, addTop: a.top } })
      c.note('refusal line: ' + JSON.stringify(er))
      c.ok(er && er.onScreen && er.hit, 'the refusal line is on screen and not covered: ' + JSON.stringify(er))
      c.pic(await shot(page, `w2-19-${tag}-refusal`))
      c.note('(iPhone Files picker offering .csv and Export saving it: his look, not walkable here)')
    })
    await closeCalendar(page)
    await page.ctx.close()
  }
  // ---- W2-20 member
  page = await world({ role: 'member' })
  await S('W2-20-D', async c => {
    c.ok(!(await vis(page, q('settings-open'))), 'a member has no ⚙ on the Leave War')
    c.ok(!(await page.locator(q('settings-days')).count()) && !(await page.locator(q('settings-events')).count()) && !(await page.locator(q('events-sheet')).count()), 'no Calendar… / Events… / Events list anywhere in the page')
    c.ok(!(await page.locator(q('days-part-holidays')).count()), 'no Holidays part drawn')
    c.note('top row controls: ' + await page.evaluate(() => [...document.querySelectorAll('[data-testid^="lw-tab"], [data-testid="settings-open"], [data-testid="my-leave"]')].map(e => e.dataset.testid + ':' + (e.getBoundingClientRect().width > 0)).join(' ')))
    c.pic(await shot(page, 'w2-20-D-member'))
    await page.setViewportSize({ width: 402, height: 874 }); await page.waitForTimeout(500)
    c.ok(!(await vis(page, q('settings-open'))), 'and none at phone width either')
    c.pic(await shot(page, 'w2-20-P-width-member'))
  })
  await page.ctx.close()
  // ---- W2-21 PH and Off day on one date
  page = await world()
  await S('W2-21-D', async c => {
    await openHolidays(page)
    const pv = await importFile(page, 'two.csv', csv([HEAD, '2026-10-21,,Clash PH,PH,', '2026-10-21,,Clash Off,Off day,'])); c.note(brief2(pv))
    c.ok(pv.open && /^2 to add/.test(pv.counts), 'both read as new: ' + pv.counts)
    await page.click(q('hol-pv-add')); await page.waitForTimeout(800)
    c.note('err: ' + await text(page, q('hol-pv-err')) + '; 21 Oct facts: ' + await dayFacts(page, '2026-10-21'))
    const lns = await holLines(page); c.note('list lines: ' + lns.join(' ;; '))
    c.ok(lns.some(t => t.includes('Clash PH')) && lns.some(t => t.includes('Clash Off')), 'both on the list')
    await closeCalendar(page)
    await page.click(q('month-OCT')); await page.waitForTimeout(900)
    c.note('grid Event rows 21 Oct: row0=' + await gridText(page, 'event-0-2026-10-21') + ' row1=' + await gridText(page, 'event-1-2026-10-21'))
    await page.evaluate(() => document.querySelector('[data-testid="event-0-2026-10-21"]')?.scrollIntoView({ block: 'center', inline: 'center' })); await page.waitForTimeout(300)
    c.pic(await shot(page, 'w2-21-D-grid'))
    await page.evaluate(() => window.go('inputs')); await page.waitForTimeout(1200)
    c.pic(await shot(page, 'w2-21-D-inputs-page'))
  })
  await page.ctx.close()
}
//__MORE__
writeFileSync(join(OUT, ONLY ? `_results-${ONLY}.json` : '_results.json'), JSON.stringify(RESULTS, null, 1))
await browser.close()
log('\nSUMMARY'); for (const r of RESULTS) log(r.id.padEnd(10), r.status)
