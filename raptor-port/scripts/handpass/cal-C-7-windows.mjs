// P3-08 / H-02 — one table: a row per window, phone and desktop. SZ=desk|phone. Saber. Each window in its own fresh world.
// For each: elementFromPoint at the window's centre and at each visible button's centre; a real drag by the title bar
// (mouse on desktop, a finger over CDP on the phone); a control BEHIND pressed while it is up; Escape; the cross.
import { writeFileSync, readFileSync, existsSync } from 'node:fs'
import { world, toLeaveWar, toInputs, tid, press, pic, sleep, closeAll, rec, recErrors, big, active, openWins, touchDrag, ROOT } from './cal-C-lib.mjs'
const SIZE = process.env.SZ || 'desk'
const ONLY = (process.env.ONLY || '').split(',').filter(Boolean)
const OUTJ = ROOT + '/docs/handpass/parts/cal-C-windows.json'
const MONTHS = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december']
const save = (name, row) => { let all = {}; if (existsSync(OUTJ)) { try { all = JSON.parse(readFileSync(OUTJ, 'utf8')) } catch {} } all[`${name}|${SIZE}`] = row; writeFileSync(OUTJ, JSON.stringify(all, null, 1)) }

/* ---------- measuring ---------- */
async function hits(page, win) {
  return win.evaluate(el => {
    const inside = h => !!h && (h === el || el.contains(h))
    const r = el.getBoundingClientRect()
    const c = [Math.round(r.x + r.width / 2), Math.round(r.y + r.height / 2)]
    const cx = Math.min(Math.max(c[0], 1), innerWidth - 1), cy = Math.min(Math.max(c[1], 1), innerHeight - 1)
    const h0 = document.elementFromPoint(cx, cy)
    const out = { rect: { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) }, centre: [cx, cy], centreInside: inside(h0), centreEl: h0 ? (h0.tagName + '.' + String(h0.className).split(' ')[0]) : null, buttons: 0, buttonsCovered: [], offscreen: 0 }
    for (const b of el.querySelectorAll('button, select, input')) {
      const br = b.getBoundingClientRect()
      if (!(br.width > 0 && br.height > 0)) continue
      if (br.bottom <= 0 || br.right <= 0 || br.top >= innerHeight || br.left >= innerWidth) { out.offscreen++; continue }
      // the part of the window's scrolling body that is clipped is not "covered"
      const bodyEl = b.closest('.win-body, .sheet, .panel, [data-testid]') || el
      const bx = Math.min(Math.max(br.x + br.width / 2, 1), innerWidth - 1), by = Math.min(Math.max(br.y + br.height / 2, 1), innerHeight - 1)
      const body = el.querySelector('.win-body') || el
      const bb = body.getBoundingClientRect()
      if (br.bottom > bb.bottom + 1 || br.top < bb.top - 1) { out.offscreen++; continue }
      out.buttons++
      const h = document.elementFromPoint(bx, by)
      if (!inside(h)) out.buttonsCovered.push((b.getAttribute('data-testid') || b.id || b.textContent.trim().slice(0, 12)) + ' <- ' + (h ? h.tagName + '.' + String(h.className).split(' ')[0] + (h.closest('.floatwin') ? ' in ' + (h.closest('.floatwin').getAttribute('data-testid')) : '') : 'null'))
    }
    return out
  })
}
async function dragTitle(page, win, handleSel = '.win-bar') {
  const bar = win.locator(handleSel).first()
  const b0 = await win.boundingBox(); const bb = await bar.boundingBox()
  if (!b0 || !bb) return { error: 'no window or bar' }
  const sy0 = await page.evaluate(() => window.scrollY), sx0 = await page.evaluate(() => window.scrollX)
  const sx = bb.x + Math.min(70, bb.width / 3), sy = bb.y + bb.height / 2
  let dx = big(SIZE) ? (bb.x < 300 ? 120 : -150) : 0, dy = big(SIZE) ? 70 : -140
  if (big(SIZE)) { await page.mouse.move(sx, sy); await page.mouse.down(); await page.mouse.move(sx + dx / 2, sy + dy / 2, { steps: 6 }); await page.mouse.move(sx + dx, sy + dy, { steps: 6 }); await page.mouse.up() }
  else await touchDrag(page, { x: sx, y: sy }, { x: sx + dx, y: sy + dy }, 8)
  await sleep(400)
  const b1 = await win.boundingBox()
  const sy1 = await page.evaluate(() => window.scrollY), sx1 = await page.evaluate(() => window.scrollX)
  const mv = b1 ? { dx: Math.round(b1.x - b0.x), dy: Math.round(b1.y - b0.y), dh: Math.round(b1.height - b0.height) } : null
  return { asked: { dx, dy }, moved: mv, followed: !!mv && (big(SIZE) ? Math.abs(mv.dx - dx) <= 8 && Math.abs(mv.dy - dy) <= 8 : (mv.dy !== 0 || mv.dh !== 0)), pageScrolled: sy1 !== sy0 || sx1 !== sx0 }
}
async function closeTest(page, win, testid, handle = '.win-bar') {
  const res = {}
  res.focusBeforeEscape = await active(page)
  await page.keyboard.press('Escape'); await sleep(400)
  res.escapeWithFocusOnPage = (await win.count()) === 0 ? 'closed' : 'stayed'
  if ((await win.count()) > 0) {
    const bar = handle ? await win.locator(handle).first().boundingBox() : null
    if (bar) { await page.mouse.click(bar.x + 60, bar.y + bar.height / 2); await sleep(250) }
    res.focusAfterTitlePress = await active(page)
    await page.keyboard.press('Escape'); await sleep(400)
    res.escapeWithFocusInWindow = (await win.count()) === 0 ? 'closed' : 'stayed'
  }
  if ((await win.count()) > 0) {
    await win.evaluate(el => el.focus()).catch(() => {}); await sleep(150)
    res.focusPutInWindow = await active(page)
    await page.keyboard.press('Escape'); await sleep(400)
    res.escapeAfterFocusingTheWindow = (await win.count()) === 0 ? 'closed' : 'stayed'
  }
  if ((await win.count()) > 0 && testid && (await tid(page, pr_cross(testid)).count())) { await press(SIZE, tid(page, pr_cross(testid))); await sleep(300); res.cross = (await win.count()) === 0 ? 'closed' : 'stayed' }
  return res
}
const pr_cross = t => (/-x$|^req-panel-x$|^sel-cancel$/.test(t) ? t : t + '-x')
async function bgPress(page, spec) {
  // spec: { sel (locator), what, effect: async () => value }
  const loc = spec.loc
  if (!(await loc.count())) return { what: spec.what, found: false }
  const b = await loc.first().boundingBox()
  if (!b) return { what: spec.what, found: true, hidden: true }
  const x = b.x + b.width / 2, y = b.y + b.height / 2
  const h = await page.evaluate(([x, y]) => { const e = document.elementFromPoint(x, y); return e ? { t: e.tagName + '.' + String(e.className).split(' ')[0], win: e.closest('.floatwin') ? e.closest('.floatwin').getAttribute('data-testid') : null } : null }, [x, y])
  const before = await spec.effect()
  const reach = !h || !h.win
  let after = before
  if (reach) { if (big(SIZE)) await page.mouse.click(x, y); else await loc.first().tap().catch(() => {}); await sleep(450); after = await spec.effect() }
  return { what: spec.what, reachable: reach, hit: h, changed: String(before) !== String(after), before: String(before).slice(0, 40), after: String(after).slice(0, 40) }
}

/* ---------- the worlds ---------- */
async function inputsWorld(sans = false) {
  const w = await world(SIZE); const page = w.page
  await toInputs(page)
  if (sans) { await press(SIZE, page.locator('#inSansMode')); await tid(page, 'sanscal').waitFor() }
  const pre = sans ? 'sc' : 'ic'
  const monthOf = async () => { const t = (await (sans ? tid(page, 'sc-month') : page.locator('#inpCal .ic-mon')).textContent()).trim().toLowerCase(); const [m, y] = t.split(/\s+/); return +y * 12 + MONTHS.findIndex(x => x.startsWith(m)) }
  for (let d = 2026 * 12 + 6 - await monthOf(); d !== 0; d += d > 0 ? -1 : 1) await press(SIZE, sans ? tid(page, d > 0 ? 'sc-next' : 'sc-prev') : page.locator(d > 0 ? '#icNext' : '#icPrev'))
  await sleep(300)
  w.month = async () => (await (sans ? tid(page, 'sc-month') : page.locator('#inpCal .ic-mon')).textContent()).trim()
  w.bg = () => ({ loc: sans ? tid(page, 'sc-next') : page.locator('#icNext'), what: sans ? 'SANS month arrow ›' : 'Inputs month arrow ›', effect: w.month })
  return w
}
async function lwWorld() {
  const w = await world(SIZE); await toLeaveWar(w.page)
  const page = w.page
  w.bg = () => ({ loc: big(SIZE) ? page.locator('button:text-is("NOV")').first() : page.locator('#bellBtn, .bell, [aria-label*="otification"]').first(), what: big(SIZE) ? 'Leave War month button NOV' : 'top-bar bell', effect: async () => big(SIZE) ? (await page.locator('button:text-is("NOV")').first().getAttribute('class')) : (await page.locator('.popup, .bellmenu, #bellPop, [data-testid*="bell"]').count()) })
  return w
}

/* ---------- the probes ---------- */
const PROBES = []
const P = (name, testid, mk, opts = {}) => PROBES.push({ name, testid, mk, opts })
const lwDragCells = async (page, from, to) => {
  const a = await tid(page, from).boundingBox(), b = await tid(page, to).boundingBox()
  const A = { x: a.x + a.width / 2, y: a.y + a.height / 2 }, B = { x: b.x + b.width / 2, y: b.y + b.height / 2 }
  if (big(SIZE)) { await page.mouse.move(A.x, A.y); await page.mouse.down(); await page.mouse.move(A.x + 8, A.y); await page.mouse.move(B.x, B.y, { steps: 6 }); await page.mouse.up() }
  else { const c = await page.context().newCDPSession(page); await c.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [A] }); await sleep(300); for (let i = 1; i <= 6; i++) { await c.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: A.x + (B.x - A.x) * i / 6, y: A.y + (B.y - A.y) * i / 6 }] }); await sleep(20) } await c.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); await c.detach() }
  await sleep(500)
}
const dayCorner = (page, iso) => press(SIZE, page.locator(`[data-icday="${iso}"]`), { position: { x: 8, y: 8 } })
/* Inputs page */
P('Inputs day', 'win-inputsday', async () => { const w = await inputsWorld(); await dayCorner(w.page, '2026-07-15'); await tid(w.page, 'win-inputsday').waitFor(); return w })
P('Inputs settings (gear)', 'win-inputsset', async () => { const w = await inputsWorld(); await press(SIZE, tid(w.page, 'in-gear')); await tid(w.page, 'win-inputsset').waitFor(); return w })
P('Inputs settings (Logic row)', 'win-inputsset', async () => { const w = await world(SIZE); await w.page.evaluate(() => window.go('logic')); await sleep(600); const b = w.page.locator('[data-lgopen="inputs"]').first(); await b.scrollIntoViewIfNeeded(); await press(SIZE, b); await tid(w.page, 'win-inputsset').waitFor(); w.bg = () => ({ loc: w.page.locator('#lgSearch, input[type=search]').first(), what: 'Logic page search box', effect: async () => '' }); return w })
P('Calendar (Inputs gear)', 'win-days', async () => { const w = await inputsWorld(); await press(SIZE, tid(w.page, 'in-gear')); await tid(w.page, 'iset-days').waitFor(); await press(SIZE, tid(w.page, 'iset-days')); await tid(w.page, 'win-days').waitFor(); return w })
P('Input editor over the opened day', 'win-inputedit', async () => { const w = await inputsWorld(); await dayCorner(w.page, '2026-07-15'); await tid(w.page, 'win-inputsday').waitFor(); await press(SIZE, w.page.locator('#icPopAdd')); await tid(w.page, 'win-inputedit').waitFor(); return w })
P('Input editor over the month (picked run)', 'win-inputedit', async () => {
  const w = await inputsWorld(); const p = w.page
  const a = await p.locator('[data-icday="2026-07-21"]').boundingBox(), b = await p.locator('[data-icday="2026-07-23"]').boundingBox()
  if (big(SIZE)) { await p.mouse.move(a.x + 8, a.y + 8); await p.mouse.down(); await p.mouse.move(b.x + 8, b.y + 8, { steps: 8 }); await p.mouse.up() }
  else { const c = await p.context().newCDPSession(p); await c.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: a.x + 8, y: a.y + 8 }] }); await sleep(520); for (let i = 1; i <= 6; i++) { await c.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: a.x + 8 + (b.x - a.x) * i / 6, y: a.y + 8 + (b.y - a.y) * i / 6 }] }); await sleep(20) } await c.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); await c.detach() }
  await sleep(500)
  console.log('picked-run wins', await openWins(p), await p.evaluate(() => [...document.querySelectorAll('button')].filter(b => b.offsetParent && /Input/.test(b.textContent)).map(b => b.id + ':' + b.textContent.trim()).slice(0, 8)))
  const add = p.locator('#icRunAdd, [data-testid="ic-runadd"], button:has-text("+ Input")').first()
  await add.click({ timeout: 4000 }).catch(e => console.log('no + Input for a picked run', String(e).slice(0, 80)))
  await tid(p, 'win-inputedit').waitFor({ timeout: 5000 })
  return w
})
P('Input editor over the List', 'win-inputedit', async () => {
  /* a shared input is filed first through the editor (Oct 12, inside the List's own three weeks), then its row's pencil opens the editor on the List */
  const w = await world(SIZE); const p = w.page; await toInputs(p)
  await dayCorner(p, '2026-10-12'); await tid(p, 'win-inputsday').waitFor()
  await press(SIZE, p.locator('#icPopAdd')); await tid(p, 'win-inputedit').waitFor(); await sleep(300)
  await press(SIZE, p.locator('[data-testid="win-inputedit"] [data-testid="pp-several"]')); await sleep(300)
  const pp = p.locator('#inpEditPop [data-pp]'); await press(SIZE, pp.nth(0)); await press(SIZE, pp.nth(1)); await sleep(200)
  await press(SIZE, p.locator('#inpEditSave')); await sleep(900)
  for (const id of ['win-inputedit', 'win-inputsday']) if (await tid(p, id).count()) { await press(SIZE, tid(p, id + '-x')); await sleep(250) }
  await press(SIZE, p.locator('#inListBtn')); await sleep(700)
  await press(SIZE, p.locator('#page-inputs .inact').first().locator('span').first()); await tid(p, 'win-inputedit').waitFor({ timeout: 5000 })
  w.bg = () => ({ loc: p.locator('#inCalBtn'), what: 'Calendar | List switch (Calendar)', effect: async () => (await p.locator('#inListBtn').getAttribute('class')) })
  return w
})
/* SANS */
P('SANS day', 'win-sansday', async () => { const w = await inputsWorld(true); await press(SIZE, tid(w.page, 'sc-day-2026-07-15')); await tid(w.page, 'win-sansday').waitFor(); return w })
P('SANS settings (gear)', 'win-sansset', async () => { const w = await inputsWorld(true); await press(SIZE, tid(w.page, 'sc-gear')); await tid(w.page, 'win-sansset').waitFor(); return w })
P('SANS settings (Logic row)', 'win-sansset', async () => { const w = await world(SIZE); await w.page.evaluate(() => window.go('logic')); await sleep(600); const b = w.page.locator('[data-lgopen="sans"]').first(); await b.scrollIntoViewIfNeeded(); await press(SIZE, b); await tid(w.page, 'win-sansset').waitFor(); w.bg = () => ({ loc: w.page.locator('#lgSearch, input[type=search]').first(), what: 'Logic page search box', effect: async () => '' }); return w })
P('Calendar (SANS gear)', 'win-days', async () => { const w = await inputsWorld(true); await press(SIZE, tid(w.page, 'sc-gear')); await tid(w.page, 'sset-days').waitFor(); await press(SIZE, tid(w.page, 'sset-days')); await tid(w.page, 'win-days').waitFor(); return w })
P('Calendar (SANS day)', 'win-days', async () => { const w = await inputsWorld(true); await press(SIZE, tid(w.page, 'sc-day-2026-07-15')); await tid(w.page, 'win-sansday').waitFor(); await press(SIZE, tid(w.page, 'sd-days')); await tid(w.page, 'win-days').waitFor(); return w })
/* Leave War */
P('Calendar (Leave War gear)', 'win-days', async () => { const w = await lwWorld(); await press(SIZE, tid(w.page, 'settings-open')); await press(SIZE, tid(w.page, 'settings-days')); await tid(w.page, 'win-days').waitFor(); return w })
P('Every Thursday', 'win-every', async () => { const w = await lwWorld(); await press(SIZE, tid(w.page, 'settings-open')); await press(SIZE, tid(w.page, 'settings-days')); await tid(w.page, 'win-days').waitFor(); await press(SIZE, tid(w.page, 'days-wd-3')); await tid(w.page, 'win-every').waitFor(); return w })
P('Holiday form', 'win-holiday', async () => { const w = await lwWorld(); await press(SIZE, tid(w.page, 'settings-open')); await press(SIZE, tid(w.page, 'settings-days')); await tid(w.page, 'win-days').waitFor(); if (await tid(w.page, 'days-tabs').count()) await press(SIZE, tid(w.page, 'days-tab-holidays')); await press(SIZE, tid(w.page, 'hol-add')); await tid(w.page, 'win-holiday').waitFor(); return w })

/* the Leave War's own panels (not the windows shell: the title bar may be absent — said so in the row) */
P('LW typing box / number pad', 'fly-edit-strip', async () => { const w = await lwWorld(); await press(SIZE, tid(w.page, SIZE === 'phone' ? 'req-p-2026-01-08' : 'req-p-2026-01-15')); await tid(w.page, 'fly-edit-strip').waitFor(); return w }, { handle: '', cross: '' })
P('LW working box', 'fly-working', async () => { const w = await lwWorld(); await press(SIZE, tid(w.page, 'avail-p-2026-01-15')); await tid(w.page, 'fly-working').waitFor(); return w }, { handle: '', cross: '' })
P('LW Required panel (picked cells)', 'req-panel', async () => { const w = await lwWorld(); await lwDragCells(w.page, 'req-p-2026-01-12', 'req-p-2026-01-16'); await tid(w.page, 'req-panel').waitFor(); return w }, { handle: '[data-testid="req-panel-title"]', cross: 'req-panel-x' })
P('LW people days panel (picked cells)', 'select-sheet', async () => { const w = await lwWorld(); const p = w.page; await lwDragCells(p, 'cell-dice-2026-01-12', 'cell-dice-2026-01-14'); await tid(p, 'select-sheet').waitFor(); return w }, { handle: '.bidsheet-hd', cross: 'sel-cancel' })
P('Calendar with OIL tracker open (Leave War)', 'win-days', async () => { const w = await lwWorld(); await press(SIZE, tid(w.page, 'settings-open')); await press(SIZE, tid(w.page, 'settings-days')); await tid(w.page, 'win-days').waitFor(); await sleep(300); if (big(SIZE)) { await press(SIZE, tid(w.page, 'oil-tracker')); await sleep(900) } else console.log('phone: the OIL tracker button is not reachable behind the Calendar window — probed as a hit test below'); return w }, {})

const doProbe = async pr => {
  let w
  const row = { window: pr.name, size: SIZE }
  try {
    w = await pr.mk(); const page = w.page
    await sleep(500)
    const win = tid(page, pr.testid).last(); const handle = pr.opts.handle === undefined ? '.win-bar' : pr.opts.handle
    row.activeAtOpen = await active(page)
    row.hit = await hits(page, win)
    row.pic1 = await pic(page, `${SIZE}-w-${pr.name.replace(/[^a-z0-9]+/gi, '_')}-1-open`)
    if (w.bg) row.bg = await bgPress(page, w.bg())
    row.drag = handle ? await dragTitle(page, win, handle) : { na: 'no title bar — not a movable window' }
    row.pic2 = await pic(page, `${SIZE}-w-${pr.name.replace(/[^a-z0-9]+/gi, '_')}-2-dragged`)
    row.hitAfterDrag = (await win.count()) ? (await hits(page, win)).centreInside : 'window gone'
    row.stayedAfterBg = (await win.count()) > 0
    row.active = await active(page)
    row.close = await closeTest(page, win, pr.opts.cross === undefined ? pr.testid : pr.opts.cross, handle)
    row.errors = w.errors.slice(0, 5)
  } catch (e) { row.error = String(e).split('\n')[0].slice(0, 200) }
  save(pr.name, row)
  console.log(JSON.stringify(row).slice(0, 1400))
  if (w) await w.ctx.close().catch(() => {})
}
for (const pr of PROBES) { if (ONLY.length && !ONLY.some(o => pr.name.includes(o))) continue; await doProbe(pr) }
await closeAll()
