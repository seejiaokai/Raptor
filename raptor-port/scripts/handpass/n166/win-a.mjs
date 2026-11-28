// win-a - case A: every window or overlay the app has, opened by its own control as Saber (master admin, home 142), then
// with it open: is the squadron control (the top-bar picker; on a phone also ☰ → its squadron list) and the member-view
// switch (the name badge on a desktop, ☰ → its role line on a phone) REACHABLE at its middle (nothing drawn over it)?
// Where reachable it is pressed (149 picked / the member view) and what the screen shows after is read. Each press runs
// in a fresh browser of its own (fresh storage, a fresh sign-in), so one press never leaves the next a changed app.
//   node raptor-port/scripts/handpass/n166/win-a.mjs <d|402x874>       (ONLY=input,lw-day ... to run some)
// No stand-ins: every step is a press. Pictures: A-<d|p>-<window>-<action>-*.png
import { mk, closeAll, FACT, note, signIn, covered, boxOf, bands, barSq, pageOn, go, shut, pic, windowsNow, overlaysNow, roleNow, reachPick, reachView, wait, tapCentre, SZTAG } from './lib.mjs'
const SZ = process.argv[2] || 'd'
const T = SZTAG(SZ)
const ONLY = (process.env.ONLY || '').split(',').filter(Boolean)
const WORDS = 'N166 typed words'
const tid = t => `[data-testid="${t}"]`
const vis = (s, sel) => s.page.locator(sel).filter({ visible: true })
async function hit(s, sel, ms = 400) {
  const l = typeof sel === 'string' ? vis(s, sel).first() : sel
  if (!(await l.count())) throw new Error('no control ' + sel)
  await l.scrollIntoViewIfNeeded().catch(() => {})
  if (s.desk) await l.click({ timeout: 8000 }); else await l.tap({ timeout: 8000 })
  await wait(s, ms)
}
async function typeInto(s, sel) {
  const r = vis(s, sel).first()
  if (!(await r.count())) return false
  await r.scrollIntoViewIfNeeded().catch(() => {})
  await r.click({ timeout: 5000 }).catch(() => {})
  await s.page.keyboard.press('Control+a').catch(() => {}); await s.page.keyboard.type(WORDS); await wait(s, 250)
  if ((await r.inputValue().catch(() => '')) !== WORDS) await r.fill(WORDS).catch(() => {})
  return (await r.inputValue().catch(() => '')) === WORDS
}
async function inputsList(s) {
  const { page } = s
  await go(s, 'inputs'); await wait(s, 600)
  if (await vis(s, '#inListBtn[aria-pressed="false"]').count()) await hit(s, '#inListBtn')
  const rangeWords = async () => ((await page.locator('#inRangeBtn').first().textContent().catch(() => '')) || '').trim()
  if (!/All dates/.test(await rangeWords())) {
    if (!(await vis(s, '#inRangeAll').count())) await hit(s, '#inRangeBtn')
    if (await page.locator('#inRangeAll').count()) await hit(s, page.locator('#inRangeAll').first())
    if (await vis(s, '#inRangeAll').count()) await hit(s, '#inRangeBtn')
  }
}
async function lwDec(s) {
  const { page } = s
  await go(s, 'leavewar'); await page.waitForSelector(tid('month-strip'), { timeout: 15000 }); await wait(s, 500)
  const w = vis(s, tid('war-picker')); if (await w.count() && (await w.first().inputValue()) !== 'y2026') { await page.selectOption(tid('war-picker'), 'y2026'); await wait(s, 500) }
  if (await vis(s, tid('month-DEC')).count()) await hit(s, tid('month-DEC'), 600)
}
async function trk(s) { await go(s, 'tracker'); await s.page.waitForSelector('#flowSvg .ball', { timeout: 20000 }); await wait(s, 600) }

/* each window: page and presses that open it; `typed` - a box in it gets typed words (they are looked for after) */
const R = {
  'input': { what: 'Input window (Inputs → List → a row opened), words typed in Remarks', open: async s => { await inputsList(s); const row = vis(s, '#inBody tr[data-iid], #inList [data-iid]').first(); const o = row.locator(tid('in-open')); await hit(s, (await o.count()) ? o.first() : row, 700) }, typed: '#inpEditRmk' },
  'input-new': { what: 'Input window, a new input (Inputs → List → + New)', open: async s => { await inputsList(s); await hit(s, '#inNew', 700) }, typed: '#inpEditRmk' },
  'inputs-gear': { what: 'Inputs calendar settings (Inputs → gear)', open: async s => { await go(s, 'inputs'); await hit(s, '#inGear', 600) } },
  'days': { what: 'Calendar window (Inputs → gear → Calendar…)', open: async s => { await go(s, 'inputs'); await hit(s, '#inGear', 500); await hit(s, tid('iset-days'), 700) } },
  'holiday-add': { what: 'Calendar window, Holidays, + Add form, a name typed', open: async s => { await go(s, 'inputs'); await hit(s, '#inGear', 500); await hit(s, tid('iset-days'), 700); if (await vis(s, tid('days-tab-holidays')).count()) await hit(s, tid('days-tab-holidays')); await hit(s, tid('hol-add'), 500) }, typed: tid('hol-name') },
  'every-weekday': { what: '"Every <weekday>" window (Calendar → a weekday heading)', open: async s => { await go(s, 'inputs'); await hit(s, '#inGear', 500); await hit(s, tid('iset-days'), 700); await hit(s, vis(s, '[data-testid^="days-wd-"]').first(), 600) } },
  'sans-gear': { what: 'SANS calendar settings (Inputs → SANS → gear)', open: async s => { await go(s, 'inputs'); await hit(s, '#inSansMode', 800); await hit(s, tid('sc-gear'), 600) } },
  'sans-day': { what: 'a SANS day opened (Inputs → SANS → a date)', open: async s => { await go(s, 'inputs'); await hit(s, '#inSansMode', 800); const d = vis(s, `${tid('sc-grid')} [data-testid^="sc-"]`).nth(10); await hit(s, d, 700) } },
  'day-info': { what: 'Day details ⓘ (View-only Sched)', open: async s => { await go(s, 'viewsched'); await hit(s, '.page.on .dinfobtn', 600) } },
  'traffic': { what: 'Traffic window (Edit Schedule → a wave\'s Traffic)', open: async s => { await go(s, 'editsched'); await hit(s, vis(s, '.page.on .airbtn').filter({ hasText: /^Traffic$/ }).first(), 600) } },
  'insights': { what: 'Week insights (top bar Insights; phone ⋯)', open: async s => { await go(s, 'viewsched'); if (await vis(s, '#insightBtn').count()) await hit(s, '#insightBtn', 600); else { await hit(s, '#viewSchedMore', 400); await hit(s, vis(s, 'button, [role=menuitem]').filter({ hasText: /Insights/ }).first(), 600) } } },
  'week-cal': { what: 'Jump to a date (the week bar\'s calendar)', open: async s => { await go(s, 'viewsched'); await hit(s, vis(s, '.page.on .wk-cal, .page.on .filt-cal').first(), 600) } },
  'changes': { what: 'Changes window (Edit Schedule → the clock)', open: async s => { await go(s, 'editsched'); await hit(s, '#histBtn', 700) } },
  'templates': { what: 'Templates picker (Edit Schedule → a day\'s Templates)', open: async s => { await go(s, 'editsched'); await hit(s, '.page.on .dhbtn', 600) } },
  'plans': { what: 'Plans menu (Edit Schedule → Live working copy ▾)', open: async s => { await go(s, 'editsched'); await hit(s, '.page.on .planselbtn', 600) } },
  'allavail': { what: 'ALL AVAIL window (a count chip on Edit Schedule, else the week)', open: async s => { for (const p of ['editsched', 'viewsched']) { await go(s, p); await wait(s, 500); const c = vis(s, '.page.on [data-oilsent]'); if (await c.count()) { await hit(s, c.first(), 700); return } } throw new Error('no ALL AVAIL count chip drawn on Edit Schedule or the week') } },
  'lw-bidding': { what: 'Leave War: Open for bidding (December, the bidding chip)', open: async s => { await lwDec(s); await hit(s, tid('open-chip'), 600) } },
  'lw-day': { what: 'Leave War: a day window (a cell of 15 Dec pressed)', open: async s => { await lwDec(s); const c = s.page.locator('[data-testid^="cell-"][data-testid$="-2026-12-15"]').first(); await c.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await wait(s, 250); if (s.desk) await c.click(); else await c.tap(); await wait(s, 700) } },
  'lw-myleave': { what: 'Leave War: My leave (his own person window)', open: async s => { await go(s, 'leavewar'); await s.page.waitForSelector(tid('my-leave'), { timeout: 15000 }); await hit(s, tid('my-leave'), 700) } },
  'lw-settings': { what: 'Leave War: settings (the gear)', open: async s => { await go(s, 'leavewar'); await s.page.waitForSelector(tid('settings-open'), { timeout: 15000 }); await hit(s, tid('settings-open'), 700) } },
  'lw-legend': { what: 'Leave War: Legend', open: async s => { await go(s, 'leavewar'); await s.page.waitForSelector(tid('legend-open'), { timeout: 15000 }); await hit(s, tid('legend-open'), 600) } },
  'lw-oil': { what: 'Leave War: OIL (the OIL tab\'s list)', open: async s => { await go(s, 'leavewar'); await s.page.waitForSelector(tid('oil-tracker'), { timeout: 15000 }); await hit(s, tid('oil-tracker'), 700) } },
  'trk-mark': { what: 'Tracker: the marking window (an event pressed)', open: async s => { await trk(s); const id = await s.page.evaluate(() => { for (const g of document.querySelectorAll('#flowSvg .ball')) { const r = g.getBoundingClientRect(); if (r.width < 4) continue; const cx = r.left + r.width / 2, cy = r.top + r.height / 2; if (cx < 10 || cy < 140 || cx > innerWidth - 10 || cy > innerHeight - 60) continue; const at = document.elementFromPoint(cx, cy); if (at && g.contains(at)) return g.dataset.id } return null }); const b = await s.page.locator(`#flowSvg .ball[data-id="${id}"]`).first().boundingBox(); if (s.desk) await s.page.mouse.click(b.x + b.width / 2, b.y + b.height / 2); else await s.page.touchscreen.tap(b.x + b.width / 2, b.y + b.height / 2); await wait(s, 700) } },
  'trk-export': { what: 'Tracker: File → Export window', open: async s => { await trk(s); await hit(s, '#fileMenuBtn', 300); await hit(s, '#exportBtn', 600) } },
  'trk-filemenu': { what: 'Tracker: the File menu open', open: async s => { await trk(s); await hit(s, '#fileMenuBtn', 400) } },
  'trk-layout': { what: 'Tracker: Edit chart layout (the syllabus menu)', open: async s => { await trk(s); await hit(s, '#sylMenuBtn', 300); await hit(s, '#arrangeBtn', 600) } },
  'trk-addstu': { what: 'Tracker: + Add (a student) question', open: async s => { await trk(s); await hit(s, '#addStu', 600) }, typed: '#dlgInput' },
  'trk-legend': { what: 'Tracker: Legend', open: async s => { await trk(s); await hit(s, '#legendBtn', 600) } },
  'bell': { what: 'the bell\'s own list', open: async s => { await hit(s, vis(s, '#notifyBell').first(), 600) } },
}

const shortW = ws => ws.map(w => ({ what: w.what, words: w.words.slice(0, 110), buttons: w.buttons, inert: w.inert }))
const typedNow = (s, sel) => sel ? s.page.evaluate(sel => { const e = [...document.querySelectorAll(sel)].find(x => x.getBoundingClientRect().width > 0); return e ? e.value : null }, sel) : null

async function one(key, action) {
  const r = R[key], k = `A.${T}.${key}.${action}`, P = `A-${T}-${key}-${action}`
  const s = await mk(SZ)
  try {
    await signIn(s, 'ad', 'a')
    const before = (await windowsNow(s)).map(w => w.what)
    try { await r.open(s) } catch (e) { FACT(`${k}.opened`, 'could not open by presses: ' + String(e).split('\n')[0].slice(0, 120)); return }
    let typed = null
    if (r.typed) typed = await typeInto(s, r.typed)
    const ws = await windowsNow(s), fresh = ws.filter(w => !before.includes(w.what))
    FACT(`${k}.opened`, fresh.length ? shortW(fresh) : (ws.length ? 'no new window; drawn: ' + JSON.stringify(shortW(ws)) : 'nothing drawn; floating: ' + JSON.stringify(await overlaysNow(s))))
    if (r.typed) FACT(`${k}.typedInto`, typed ? r.typed : `no box ${r.typed} took the words`)
    const ctl = {}
    for (const sel of ['#sqnMenuBtn', '#burger', '#roleBadge', '#notifyBell']) ctl[sel] = (await boxOf(s, sel)) ? await covered(s, sel) : 'not drawn'
    FACT(`${k}.controlsWithWindowOpen`, ctl)
    if (action === 'pick') await pic(s, `${P}-1-open`)
    const sq0 = await barSq(s), role0 = await roleNow(s), page0 = await pageOn(s)
    let did
    if (action === 'pick') did = await reachPick(s, 149, 'bar')
    else if (action === 'pickmenu') did = await reachPick(s, 149, 'menu')
    else did = await reachView(s)
    FACT(`${k}.press`, did)
    if (!did.pressed) { if (action !== 'pick') await pic(s, `${P}-1-open`); return }
    await wait(s, 900)
    const ws2 = await windowsNow(s)
    FACT(`${k}.after.squadron`, { before: sq0, after: await barSq(s) })
    FACT(`${k}.after.role`, { before: role0.badge || role0.menuLine, after: (await roleNow(s)).badge || (await roleNow(s)).menuLine })
    FACT(`${k}.after.page`, { before: page0, after: await pageOn(s) })
    FACT(`${k}.after.windows`, shortW(ws2))
    FACT(`${k}.after.bands`, await bands(s))
    if (r.typed) FACT(`${k}.after.typedWords`, await typedNow(s, r.typed))
    const dlg = await s.page.evaluate(() => { const m = document.querySelector('#dlgMsg'); return m && m.getBoundingClientRect().width > 0 ? m.textContent.trim() : null })
    if (dlg) FACT(`${k}.after.question`, dlg)
    await pic(s, `${P}-2-after`)
  } catch (e) { FACT(`${k}.error`, String(e).split('\n')[0].slice(0, 160)) } finally { await s.ctx.close().catch(() => {}) }
}
try {
  console.log('win-a v1', SZ)
  const keys = ONLY.length ? ONLY : Object.keys(R)
  const actions = SZ === 'd' ? ['pick', 'view'] : ['pick', 'pickmenu', 'view']
  for (const key of keys) { note(`== ${key}: ${R[key].what}`); FACT(`A.${T}.${key}.window`, R[key].what); for (const a of (process.env.ACTIONS ? process.env.ACTIONS.split(',') : actions)) await one(key, a) }
} catch (e) { console.error('FAILED', String(e).split('\n')[0]); process.exitCode = 1 } finally { await closeAll() }
void shut; void tapCentre
