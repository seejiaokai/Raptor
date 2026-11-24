/* The ?timing readout's walk, part 3 (chat 164) — W18, W19, W20, W21, W23, W26 of the evidence sheet's combined list:
   the window among the app's other windows, Escape, every door to a page, the plain-user round, and its own cost.
   node scripts/handpass/timing-walk-3.mjs   (from raptor-port/, on a build already made). ONLY=W19 runs one. */
import { serve, browserOf, fresh, DESK, PHONE, signIn, outsideTime, armOutside, openBy, readout, row, pageRows, waitRows, openWindow, topAt, pic, shotDir, judge, notWalked, saveResults, sleep } from './timing-walk-lib.mjs'

const ONLY = process.env.ONLY ? process.env.ONLY.split(',') : null
const on = id => !ONLY || ONLY.includes(id)
const srv = await serve()
const cr = await browserOf('chromium')
const B = srv.base
const secs = v => Number((/([\d.]+) s/.exec(v || '') || [])[1])
async function scen(id, size, opts, fn) {
  if (!on(id)) return
  const s = await fresh(cr, size, opts)
  const dir = shotDir(id)
  try { await fn({ ...s, dir }) } catch (e) { judge(id + '-ran', false, 'the step stopped: ' + String(e).slice(0, 240)) }
  if (s.errors.length) console.log(`  ${id} page errors: ${s.errors.join(' | ')}`)
  await s.ctx.close()
}
const weekUp = page => page.waitForSelector('#vWeek .day', { state: 'attached', timeout: 60000 })
const tOpen = async page => (await readout(page)).open
/** what is open of the app's own windows and lists (each by the element that draws it, shown) */
const shown = page => page.evaluate(() => {
  const vis = s => [...document.querySelectorAll(s)].some(e => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 && getComputedStyle(e).visibility !== 'hidden' })
  return { avail: vis('.availwin:not([hidden])'), changes: vis('.chgwin:not([hidden])'), bell: vis('.bell-list, #bellList, .belllist'), board: vis('#schedBoard.open, #schedBoard:not([hidden]) .sb-line'), drawer: vis('#drawer.open'), inputwin: vis('.floatwin[data-win="inputedit"], #inpEditPop'), dates: vis('[data-testid="open-dates"]'), timing: !!document.querySelector('#timingRoot .timingwin') }
})
const esc = async page => { await page.keyboard.press('Escape'); await sleep(450) }

/* W18 — does the window slow what it measures: Edit Schedule ↔ View-only Sched five times each way, 4× CPU */
await scen('W18', DESK, { cpu: 1 }, async () => {})
if (on('W18')) {
  const med = a => { const s = [...a].sort((x, y) => x - y); return s[Math.floor(s.length / 2)] }
  const res = {}
  for (const [k, q, fold] of [['no switch', '', false], ['open', '?timing', false], ['folded', '?timing', true]]) {
    const { ctx, page } = await fresh(cr, DESK, { cpu: 4 })
    await page.goto(B + '/' + q); await signIn(page); await outsideTime(page, 'viewsched')
    if (fold) { await page.waitForSelector('#timingRoot .timingwin'); await page.click('#timingRoot .timingwin .win-x') }
    const t = []
    for (let i = 0; i < 6; i++) for (const p of ['editsched', 'viewsched']) { await openBy(page, p); const ms = await outsideTime(page, p); if (i > 0) t.push([p, ms]) }
    res[k] = { edit: med(t.filter(x => x[0] === 'editsched').map(x => x[1])), view: med(t.filter(x => x[0] === 'viewsched').map(x => x[1])) }
    await ctx.close()
  }
  judge('W18', null, Object.entries(res).map(([k, v]) => `${k}: Edit Schedule ${v.edit} ms, View-only Sched ${v.view} ms (medians of 5)`).join(' · '))
}

/* W19 — Escape with the window open all session, against the same presses without the switch */
for (const q of ['?timing', '']) {
  const id = q ? 'W19' : 'W19-without'
  await scen(id, DESK, {}, async ({ page, dir }) => {
    const log = []
    const step = async (name, before, after) => { log.push(`${name}: ${before} → ${after}`); console.log(`  ${id} ${name}: ${before} → ${after}`) }
    const st = async () => { const s = await shown(page); return Object.entries(s).filter(([, v]) => v).map(([k]) => k).join('+') || 'nothing' }
    await page.goto(B + '/' + q); await signIn(page); await weekUp(page); await sleep(800)
    /* (a) nothing else open, the keys on the page */
    await page.mouse.click(700, 140); let a = await st(); await esc(page); await step('a nothing else open', a, await st())
    if (q) { await openWindow(page) }
    /* (b) typing in the week's search box */
    const sb = page.locator('#page-viewsched input[placeholder*="callsign"]').first()
    if (await sb.count()) { await sb.click(); await page.keyboard.type('ab'); a = await st(); await esc(page); await step('b typing in the search box (its value after: "' + (await sb.inputValue()) + '")', a, await st()) }
    if (q && !(await tOpen(page))) await openWindow(page)
    /* (c) ALL AVAIL opened after the Timing window, then Escape twice */
    await openBy(page, 'editsched'); await outsideTime(page, 'editsched'); await sleep(500)
    const osn = page.locator('#page-editsched [data-oilsent]').first()
    if (await osn.count()) {
      await osn.scrollIntoViewIfNeeded(); await osn.click(); await sleep(600)
      a = await st(); await pic(page, dir, 'avail-and-timing'); await esc(page); const b = await st(); await esc(page); await step('c ALL AVAIL opened after, Escape twice', a, b + ' → ' + await st())
    } else await step('c ALL AVAIL', 'no "who\'s available" line on the week', '—')
    if (q && !(await tOpen(page))) await openWindow(page)
    /* (c2) ALL AVAIL opened, then the Timing window pressed (brought in front), Escape */
    if (q && await osn.count()) {
      await osn.click(); await sleep(600)
      await page.click('#timingRoot .timingwin .win-bar', { position: { x: 60, y: 10 } }); await sleep(300)
      a = await st(); await esc(page); await step('c2 ALL AVAIL, then the Timing window pressed, Escape', a, await st())
      await esc(page); if (!(await tOpen(page))) await openWindow(page)
    }
    /* (d) the changes window */
    if (await page.locator('#histBtn').count()) { await page.click('#histBtn'); await sleep(600); a = await st(); await esc(page); await step('d the changes window', a, await st()) }
    if (q && !(await tOpen(page))) await openWindow(page)
    /* (e) the bell's list */
    if (await page.locator('#bell').count()) { await page.click('#bell'); await sleep(500); a = await st(); await pic(page, dir, 'bell'); await esc(page); await step('e the bell\'s list', a, await st()) }
    if (q && !(await tOpen(page))) await openWindow(page)
    /* (f) the Scheduler Board (opened by its probe: the board's door is not what this step is about) */
    await page.evaluate(() => window.openScheduler && window.openScheduler(0)); await sleep(800)
    a = await st(); await pic(page, dir, 'board-and-timing'); await esc(page); const fb = await st(); await esc(page)
    await step('f the board, Escape twice', a, fb + ' → ' + await st())
    if (await page.locator('#sbDone').isVisible().catch(() => false)) await page.click('#sbDone')
    if (q && !(await tOpen(page))) await openWindow(page)
    /* (g) an input's own window on the Inputs page */
    await openBy(page, 'inputs'); await outsideTime(page, 'inputs'); await sleep(500)
    const bar = page.locator('#page-inputs .ib-bar').first()
    if (await bar.count() && await bar.isVisible()) { await bar.click(); await sleep(700); a = await st(); await esc(page); await step('g an input\'s window', a, await st()) }
    else await step('g an input\'s window', 'no input bar in sight on the Inputs page', '—')
    if (q && !(await tOpen(page))) await openWindow(page)
    /* (h) the Leave War's "Open for bidding" sheet */
    await openBy(page, 'leavewar'); await outsideTime(page, 'leavewar'); await sleep(800)
    if (await page.locator('[data-testid="open-chip"]').count()) { await page.click('[data-testid="open-chip"]'); await sleep(600); a = await st(); await pic(page, dir, 'lw-sheet-and-timing'); await esc(page); await step('h the Leave War\'s Open for bidding sheet', a, await st()) }
    else await step('h the Leave War sheet', 'no Open for bidding chip', '—')
    judge(id, null, log.join(' | '))
  })
}

/* W20 — over and under the other layers, each press hit-tested */
for (const [id, size] of [['W20-desk', DESK], ['W20-phone', PHONE]]) {
  await scen(id, size, {}, async ({ page, dir }) => {
    const phone = size === PHONE
    await page.goto(B + '/?timing'); await signIn(page); await weekUp(page); await sleep(600)
    await openWindow(page)
    const xMid = async () => page.evaluate(() => { const x = document.querySelector('#timingRoot .timingwin .win-x'); if (!x) return null; const r = x.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2] })
    if (phone) {
      await page.click('#burger'); await sleep(500)
      const m = await xMid(); const top = m ? await topAt(page, m[0], m[1]) : 'no ✕'
      judge(id + '-drawer', !/timing|win-x/.test(top || ''), `the ☰ menu open — at the Timing window's ✕: ${top}`)
      await pic(page, dir, 'drawer-over')
      await page.mouse.click(380, 400); await sleep(400)
    }
    /* the board under the window */
    await openBy(page, 'editsched'); await outsideTime(page, 'editsched')
    await page.evaluate(() => window.openScheduler && window.openScheduler(0)); await sleep(900)
    if (!(await tOpen(page))) await openWindow(page)
    let m = await xMid()
    let top = m ? await topAt(page, m[0], m[1]) : null
    judge(id + '-board', /win-x/.test(top || ''), `the board open — at the Timing window's ✕: ${top}`)
    await pic(page, dir, 'over-the-board')
    /* fold it on the board: the corner button over the board, the board's own controls beside it pressable */
    await page.click('#timingRoot .timingwin .win-x'); await sleep(300)
    const pb = (await readout(page)).pillBox
    top = await topAt(page, pb.x + pb.w / 2, pb.y + pb.h / 2)
    const sbDone = await page.locator('#sbDone').boundingBox().catch(() => null)
    const doneTop = sbDone ? await topAt(page, sbDone.x + sbDone.width / 2, sbDone.y + sbDone.height / 2) : null
    judge(id + '-board-folded', /timing-pill/.test(top || '') && (!sbDone || /sbDone/.test(doneTop || '')), `the corner button on the board: ${top}; the board's Done: ${doneTop}`)
    await pic(page, dir, 'folded-on-the-board')
    if (sbDone) await page.click('#sbDone')
    await page.click('#timingRoot .timing-pill'); await sleep(300)
    /* ALL AVAIL and the Timing window: each brought in front by a press, both ✕ pressable */
    const osn = page.locator('#page-editsched [data-oilsent]').first()
    if (await osn.count()) {
      await osn.scrollIntoViewIfNeeded(); await osn.click(); await sleep(600)
      const ax = await page.evaluate(() => { const x = document.querySelector('.availwin:not([hidden]) .win-x'); if (!x) return null; const r = x.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2] })
      const aTop = ax ? await topAt(page, ax[0], ax[1]) : null
      m = await xMid(); const tTop = m ? await topAt(page, m[0], m[1]) : null
      judge(id + '-two-windows', /win-x/.test(aTop || '') && /win-x/.test(tTop || ''), `ALL AVAIL's ✕: ${aTop}; the Timing window's ✕: ${tTop}`)
      await pic(page, dir, 'avail-and-timing')
      await page.keyboard.press('Escape'); await sleep(300)
    } else notWalked(id + '-two-windows', 'no "who\'s available" line on Edit Schedule')
    /* the Leave War's blocking sheet over the window */
    await openBy(page, phone ? 'leavewar' : 'leavewar', phone ? 'drawer' : 'top'); await outsideTime(page, 'leavewar'); await sleep(700)
    if (!(await tOpen(page))) await openWindow(page)
    if (await page.locator('[data-testid="open-chip"]').count()) {
      await page.click('[data-testid="open-chip"]'); await sleep(600)
      m = await xMid(); top = m ? await topAt(page, m[0], m[1]) : null
      judge(id + '-sheet', null, `the "Open for bidding" sheet open — at the Timing window's ✕: ${top}`)
      await pic(page, dir, 'lw-sheet')
      /* W21: a month pressed inside the sheet, the window open */
      const month = page.locator('[data-testid="open-dates"] [data-month], [data-testid="open-dates"] button[data-key]').first()
      if (await month.count()) { const b = await month.boundingBox(); const mt = await topAt(page, b.x + b.width / 2, b.y + b.height / 2); judge(id + '-W21-month', !/timing/.test(mt || ''), `a month in the sheet, at its middle: ${mt}`) }
      await page.keyboard.press('Escape')
    }
  })
}

/* W23 — every door to a page makes one row, named as the app names it */
await scen('W23-admin', DESK, {}, async ({ page, dir }) => {
  await page.goto(B + '/?timing'); await signIn(page); await outsideTime(page, 'viewsched'); await sleep(500)
  const rowsN = async () => pageRows(await readout(page)).length
  const door = async (name, act, want) => {
    const n = await rowsN(); await act(); await sleep(2500)
    const r = pageRows(await readout(page)); const added = r.slice(0, r.length - n)
    judge('W23-' + name, added.length === 1 && added[0].label === want, `${added.length} row(s): ${added.map(x => x.label + ', ' + x.tag + ': ' + x.value).join(' | ') || 'none'} (want one "${want}")`)
  }
  await door('top-bar', async () => { await openBy(page, 'quals') }, 'Quals')
  await door('keyboard', async () => { await openBy(page, 'logic', 'key') }, 'Logic')
  await door('top-bar-admin', async () => { await openBy(page, 'admin') }, 'Admin')
  /* the member-view switch while on Edit Schedule sends him to View-only Sched */
  await openBy(page, 'editsched'); await outsideTime(page, 'editsched'); await sleep(400)
  await door('member-view-switch', async () => { await armOutside(page, 'viewsched'); await page.click('#roleBadge') }, 'View-only Sched')
  await page.click('#roleBadge'); await sleep(800)
  /* the bell: the first notice that opens a page */
  await page.click('#bell'); await sleep(600)
  const item = page.locator('.bell-list button, .belllist button, #bellList button, [data-testid^="bell-item"]').first()
  if (await item.count()) { const txt = (await item.textContent() || '').slice(0, 60); const cur = await page.evaluate(() => window.CURPAGE); const n = await rowsN(); await item.click(); await sleep(2500); const now = await page.evaluate(() => window.CURPAGE); const r = pageRows(await readout(page)); judge('W23-bell', now === cur ? r.length === n : r.length === n + 1, `notice "${txt}": page ${cur} → ${now}; rows ${n} → ${r.length}${r.length > n ? ' (' + r[0].label + ')' : ''}`) }
  else notWalked('W23-bell', 'no notice in the bell\'s list for the admin')
  await page.keyboard.press('Escape')
  /* the browser's Back */
  const before = page.url()
  await page.goBack().catch(() => {}); await sleep(2500)
  judge('W23-back', null, `Back from ${before.replace(B, '')}: now at ${page.url() === 'about:blank' ? 'about:blank (left the app)' : page.url().replace(B, '')}`)
})
await scen('W23-member-phone', PHONE, {}, async ({ page }) => {
  await page.goto(B + '/?timing'); await signIn(page, 'us'); await outsideTime(page, 'viewsched'); await sleep(500)
  const pages = await page.evaluate(() => [...document.querySelectorAll('#drawerNav a[data-page]')].map(a => a.dataset.page))
  const names = { viewsched: 'View-only Sched', editsched: 'Edit Schedule', inputs: 'Inputs', quals: 'Quals', logic: 'Logic', leavewar: 'Leave War', tracker: 'Tracker', help: 'Help', admin: 'Admin' }
  const got = []
  for (const p of pages.filter(p => p !== 'viewsched')) {
    const n = pageRows(await readout(page)).length
    await openBy(page, p, 'drawer'); await outsideTime(page, p); await sleep(800)
    const r = pageRows(await readout(page)); got.push(r.length === n + 1 && r[0].label === names[p] ? p : p + '(' + (r.length - n) + ' rows, ' + r[0]?.label + ')')
  }
  judge('W23-member-drawer', got.every(x => !x.includes('(')), `the member's ☰ pages: ${pages.join(', ')} → ${got.join(', ')}`)
})

/* W26 — the plain-user round with the window open: the week, a change and its Undo, windows opened and closed every way, sign out */
await scen('W26', DESK, {}, async ({ page, dir, errors }) => {
  await page.goto(B + '/?timing'); await signIn(page); await weekUp(page); await sleep(600)
  const log = []
  /* the week scrolls under the window */
  const sx0 = await page.evaluate(() => { const s = document.querySelector('#page-viewsched .wk-scroll, #vWeek'); return s ? s.scrollLeft : null })
  await page.mouse.move(400, 400); await page.mouse.wheel(0, 600); await sleep(500)
  const sy = await page.evaluate(() => scrollY + (document.querySelector('#page-viewsched') || {}).scrollTop)
  log.push(`the week under the window scrolled (page scroll ${sy})`)
  /* a change on the Inputs calendar and its Undo */
  await openBy(page, 'inputs'); await outsideTime(page, 'inputs'); await sleep(600)
  const bar = page.locator('#page-inputs .ib-bar').first()
  if (await bar.count() && await bar.isVisible()) {
    const bb = await bar.boundingBox(); const iid = await bar.getAttribute('data-iid')
    await page.mouse.move(bb.x + bb.width / 2, bb.y + bb.height / 2); await page.mouse.down(); await page.mouse.move(bb.x + bb.width / 2 + 120, bb.y + bb.height / 2 + 2, { steps: 8 }); await page.mouse.up(); await sleep(800)
    const moved = await page.locator(`#page-inputs .ib-bar[data-iid="${iid}"]`).first().boundingBox()
    await page.click('#undoBtn'); await sleep(800)
    const back = await page.locator(`#page-inputs .ib-bar[data-iid="${iid}"]`).first().boundingBox()
    log.push(`an input bar dragged ${Math.round(moved.x - bb.x)}px, Undo put it back to ${Math.round(back.x - bb.x)}px`)
    judge('W26-change-undo', Math.abs(moved.x - bb.x) > 20 && Math.abs(back.x - bb.x) < 3, log.at(-1))
    /* its window: opened, then closed by ✕, by Escape, by a press outside */
    for (const how of ['✕', 'Escape', 'a press outside']) {
      await bar.click(); await sleep(700)
      const w = page.locator('.floatwin:not(.timingwin)').first(); const up = await w.isVisible().catch(() => false)
      if (how === '✕') await w.locator('.win-x').click().catch(() => {}); else if (how === 'Escape') await page.keyboard.press('Escape'); else await page.mouse.click(30, 300)
      await sleep(500)
      const still = await page.locator('.floatwin:not(.timingwin)').first().isVisible().catch(() => false)
      judge('W26-inputwin-' + how, up && !still && await tOpen(page) !== null, `the input's window opened ${up}, closed by ${how}: ${!still}; the Timing window open ${await tOpen(page)}`)
    }
  } else notWalked('W26-change-undo', 'no input bar in sight on the Inputs page')
  /* the changes window on Edit Schedule: opened, closed by ✕ and by Escape */
  await openBy(page, 'editsched'); await outsideTime(page, 'editsched'); await sleep(500)
  for (const how of ['✕', 'Escape']) {
    await page.click('#histBtn'); await sleep(600)
    const up = await page.locator('.chgwin:not([hidden])').isVisible().catch(() => false)
    if (how === '✕') await page.locator('.chgwin .win-x').click(); else await page.keyboard.press('Escape')
    await sleep(500)
    const still = await page.locator('.chgwin:not([hidden])').isVisible().catch(() => false)
    judge('W26-changes-' + how, up && !still, `the changes window opened ${up}, closed by ${how}: ${!still}`)
  }
  await pic(page, dir, 'edit-schedule-with-window')
  /* the Tracker, then sign out */
  await openBy(page, 'tracker'); await outsideTime(page, 'tracker'); await sleep(800)
  await pic(page, dir, 'tracker-with-window')
  await page.click('#logout'); const out = await page.waitForSelector('#luser', { state: 'visible', timeout: 20000 }).then(() => true, () => false)
  judge('W26-signout', out, `signed out to the sign-in card: ${out}`)
  judge('W26-errors', errors.length === 0, errors.join(' | ') || 'none')
})

saveResults('walk-part3' + (ONLY ? '-' + ONLY.join('_') : ''))
await cr.close(); await srv.close()
