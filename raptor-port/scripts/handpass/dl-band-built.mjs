/* THE BAR THAT WAITS ON AN OIL ANSWER, WITH A FAILED SAVE ABOVE IT ([LOOK-13OCT-SMALL-FIXES] — owner D831, D840, D841).
   The drawing he approved is scripts/handpass/dl-band.mjs (it DRAWS the band into the old build); this checks the
   BUILT band in the one case dl-oil.mjs cannot make: both bars up at once. A save can only fail on REAL storage, so
   this world is a fresh browser context on the app's ordinary address (never "start fresh", which keeps nothing —
   docs/walk-scripts.md §3), with storage made to refuse a write exactly as e2e/save-note.spec.ts does.
   Every line is an assertion of the right behaviour (`works` / `FAIL — what was seen`), with a picture at each step.
     DL_SHOTS=docs/img/handpass/2026-10-14-three-builds node scripts/handpass/dl-band-built.mjs [phone|desk] */
import { chromium } from '@playwright/test'
import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import * as L from './dl-lib.mjs'
console.log('dl-band-built v3 →', L.SHOTS)
const K = process.argv[2] || 'phone'
const S = L.SIZES[K]
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const browser = await chromium.launch({ headless: true, ...(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {}) })
const ctx = await browser.newContext({ viewport: { width: S.w, height: S.h }, deviceScaleFactor: S.dpr, ...(S.phone ? { isMobile: true, hasTouch: true } : {}) })
const p = await ctx.newPage()
const errors = []
p.on('pageerror', e => errors.push(`PAGEERROR ${e.message}`))
const say = v => (typeof v === 'string' ? v : JSON.stringify(v))
const ok = (key, expected, saw, pass) => L.row(`Both bars [${K}]`, key, expected, say(saw), pass ? 'works' : `FAIL — ${say(saw).slice(0, 500)}`)
const pic = async name => { await p.screenshot({ path: resolve(L.SHOTS, `${name}.png`) }); console.log('   pic', name) }
const press = sel => (S.phone ? p.locator(sel).first().tap() : p.locator(sel).first().click())
const AMBER = 'rgba(229, 194, 74, 0.5)'
try {
  await p.goto(L.BASE + '/')
  await p.fill('#luser', 'ad'); await p.fill('#lpass', 'a')
  await p.click('#loginForm button[type=submit]')
  await p.waitForSelector('#vWeek .day', { state: 'attached', timeout: 20000 })
  await p.addStyleTag({ content: '*{scroll-behavior:auto !important} #toastEl{display:none !important}' })
  await p.evaluate(() => window.go('editsched')); await p.waitForFunction(() => window.CURPAGE === 'editsched'); await L.sleep(400)
  /* an OIL question left unanswered: a Training on Saturday 18 Jul filed through the bridge with no answer, a plain row
     beside it, and a real drag of one puck onto the other on the Scheduler Board */
  const SAT_DI = 5
  await p.locator(`#eWeek [data-sbday="${SAT_DI}"]`).first().evaluate(e => { e.scrollIntoView({ block: 'center', inline: 'center' }); e.click() })
  await p.waitForSelector('#sbBoard .sb-sec', { state: 'attached' })
  await p.evaluate(di => {
    const W = window
    W.DAYS[di].ground.push({ prog: 'Range brief', str: '09:00', end: '12:00', who: '', rmks: '' }); W.afterSchedMutate()
    W.fillSlot(`g:${di}.${W.DAYS[di].ground.length - 1}.+`, 'bane'); W.afterSchedMutate()
    W.DAYS[di].ground.push({ prog: 'Hangar open day', str: '13:00', end: '15:00', who: '', rmks: '' }); W.afterSchedMutate()
    W.fillSlot(`g:${di}.${W.DAYS[di].ground.length - 1}.+`, 'nick'); W.afterSchedMutate()
  }, SAT_DI)
  await L.sleep(500)
  /* the bar itself, raised the way the app raises it — its own state, through the bridge where there is one; else by
     the question's own door on an input's row. The premise is asserted before anything is judged. */
  const raised = await p.evaluate(() => {
    const W = window
    if (typeof W.oilBarRaise === 'function') { W.oilBarRaise('Not swapped — OIL not answered'); return 'bridge' }
    return 'none'
  })
  if (raised === 'none') {
    /* no bridge for the bar: make the real question. File the input through the Inputs calendar's own window, as
       dl-oil.mjs does, then drag on the board. */
    await p.evaluate(() => window.go('inputs')); await p.waitForFunction(() => window.CURPAGE === 'inputs'); await L.sleep(300)
    if (await p.locator('#inCalBtn').getAttribute('aria-pressed') !== 'true') await press('#inCalBtn')
    await p.waitForSelector('#inpCal')
    const MONTHS = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december']
    const SAT = '2026-07-18'
    for (let i = 0; i < 36 && !(await p.locator(`[data-icday="${SAT}"]`).count()); i++) {
      const [m, y] = (await p.locator('#inpCal .ic-mon').innerText()).trim().toLowerCase().split(/\s+/)
      const at = +y * 12 + MONTHS.findIndex(x => x.startsWith(m)), want = 2026 * 12 + 6
      await press(at < want ? '#icNext' : '#icPrev')
    }
    await p.locator(`[data-icday="${SAT}"]`).focus(); await p.keyboard.press('Enter')
    await p.waitForSelector('[data-testid="win-inputsday"]')
    await press('#icPopAdd')
    await p.waitForSelector('#inpEditPop #inpEditType')
    await p.selectOption('#inpEditPop #inpEditType', 'Training')
    await p.selectOption('#inpEditPop #inpEditPerson', 'stiff')
    const ad = p.locator('#inpEditPop #inpEditAllday')
    if (await ad.count() && await ad.isChecked()) await ad.click()
    await p.fill('#inpEditPop #inpEditStart', '16:00'); await p.fill('#inpEditPop #inpEditEnd', '17:00')
    await p.fill('#inpEditPop #inpEditOwnTitle', 'Night brief')
    await press('#inpEditSave')
    await p.waitForSelector('[data-testid="oilconf"]'); await L.sleep(300)
    await press('[data-testid="oil-yes"]'); await press('[data-testid="oilconf-save"]')
    await p.waitForSelector('#inpEditPop', { state: 'hidden' })
    await p.locator('[data-testid="win-inputsday-x"]').click()
    await p.evaluate(() => window.go('editsched')); await p.waitForFunction(() => window.CURPAGE === 'editsched'); await L.sleep(300)
    await p.locator(`#eWeek [data-sbday="${SAT_DI}"]`).first().evaluate(e => { e.scrollIntoView({ block: 'center', inline: 'center' }); e.click() })
    await p.waitForSelector('#sbBoard .sb-sec', { state: 'attached' }); await L.sleep(400)
    /* the input's own row is the one whose item reads NIGHT BRIEF; drag the plain row's man onto its man */
    const rows = await p.evaluate(di => window.DAYS[di].ground.map((g, i) => ({ i, prog: g.prog, who: g.who })), SAT_DI)
    const toRow = rows.find(r => /night brief/i.test(r.prog)), fromRow = rows.find(r => /hangar open day/i.test(r.prog))
    if (!toRow || !fromRow) throw new Error('the fixture is not what the script thinks: ' + JSON.stringify(rows))
    const from = `#sbBoard [data-slot="g:${SAT_DI}.${fromRow.i}"] .puck`, to = `#sbBoard [data-slot="g:${SAT_DI}.${toRow.i}"] .puck`
    await p.locator(to).evaluate(e => e.scrollIntoView({ block: 'center' })); await L.sleep(300)
    const fb = await p.locator(from).boundingBox(), tb = await p.locator(to).boundingBox()
    await p.mouse.move(fb.x + fb.width / 2, fb.y + fb.height / 2); await p.mouse.down()
    await p.mouse.move(fb.x + fb.width / 2 + 6, fb.y + fb.height / 2 + 6, { steps: 3 })
    await p.mouse.move(tb.x + tb.width / 2, tb.y + tb.height / 2, { steps: 14 })
    await p.mouse.move(tb.x + tb.width / 2 + 1, tb.y + tb.height / 2 + 1)
    await p.mouse.up()
    await p.waitForSelector('[data-testid="oilconf-lead"]'); await L.sleep(300)
    await press('[data-testid="oilconf-cancel"]')
  }
  await p.waitForSelector('[data-testid="oilbar"]'); await L.sleep(900)

  const facts = () => p.evaluate(() => {
    const b = document.querySelector('[data-testid="oilbar"]'), r = b.getBoundingClientRect(), under = b.closest('.sb-top') || b.closest('.topbar')
    /* the warning that shares the OIL bar's own bar — the board keeps one and the top bar another, and only that one is in front */
    const save = under ? under.querySelector(':scope > .saveband, :scope > .savestat.failed') : null, sr = save ? save.getBoundingClientRect() : null
    const kids = [...b.children].map(k => { const q = k.getBoundingClientRect(); return { mid: Math.round(q.top + q.height / 2), cut: k.scrollWidth > k.clientWidth + 0.5 } })
    const retry = save ? save.querySelector('button') : null
    return {
      where: under ? under.className.split(' ')[0] : 'NOWHERE', oil: `${Math.round(r.x)},${Math.round(r.y)} ${Math.round(r.width)}×${Math.round(r.height)}`, oilH: Math.round(r.height),
      save: sr ? `${Math.round(sr.x)},${Math.round(sr.y)} ${Math.round(sr.width)}×${Math.round(sr.height)}` : null, saveH: sr ? Math.round(sr.height) : null,
      saveAbove: !!sr && sr.bottom <= r.top + 1, touching: !!sr && Math.abs(sr.bottom - r.top) <= 1.5, sameWidth: !!sr && Math.round(sr.width) === Math.round(r.width),
      lastLine: !!under && Math.abs(under.getBoundingClientRect().bottom - r.bottom) <= 1.5, oneLine: new Set(kids.map(k => k.mid)).size === 1, nothingCut: kids.every(k => !k.cut) && b.scrollWidth <= b.clientWidth + 0.5,
      edge: under ? getComputedStyle(under).borderBottomColor : '', buttonsH: [...b.querySelectorAll('button')].map(x => Math.round(x.getBoundingClientRect().height)), retryH: retry ? Math.round(retry.getBoundingClientRect().height) : null,
      bars: document.querySelectorAll('[data-testid="oilbar"]').length,
    }
  })
  const good = f => f.saveAbove && f.touching && f.sameWidth && f.saveH === 36 && f.oilH === 36 && f.lastLine && f.oneLine && f.nothingCut && f.edge === AMBER && f.bars === 1 && f.buttonsH.every(h => h === f.retryH)

  /* storage refuses every write from here; one change, so there is something to save */
  await p.evaluate(() => {
    const W = window
    W.__lsSetWas = Storage.prototype.setItem
    Storage.prototype.setItem = function (...a) { if (W.__lsRefuse) throw new DOMException('The quota has been exceeded (walk: forced)', 'QuotaExceededError'); return W.__lsSetWas.apply(this, a) }
    W.__lsRefuse = true
    W.fillSlot('1.0.0.0.p', W.DAYS[1].waves[0].formations[0].aircraft[0].p === 'casper' ? 'bane' : 'casper'); W.afterSchedMutate()
  })
  await p.waitForSelector('.sb-top > .saveband', { timeout: 20000 }); await L.sleep(500)
  let f = await facts()
  ok('on the Scheduler Board', '"Not saved" is the line ABOVE the OIL bar; both 36 tall and one width, one under the other with no gap and no overlap; the OIL bar is the board bar\'s last line, one line, nothing cut; the line under them amber; their buttons one height', f, f.where === 'sb-top' && good(f))
  await pic(`band-${K}-b1-board-both-bars`)

  await p.evaluate(() => { const b = document.querySelector('#sbDone') || document.querySelector('#sbClose'); b.click() }); await L.sleep(800)
  await p.waitForSelector('#shell .topbar > .savestat.failed', { timeout: 15000 }); await L.sleep(400)
  f = await facts()
  ok('on Edit Schedule', 'the same two lines along the bottom of the top bar: "Not saved" above, the OIL bar the last line, the line under them amber — never Edit Schedule\'s cyan', f, f.where === 'topbar' && good(f))
  await pic(`band-${K}-b2-week-both-bars`)

  /* the OIL bar answered away: "Not saved" drops to the bar's last line, and its line is amber still */
  await press('[data-testid="oilbar-ok"]'); await L.sleep(500)
  const alone = await p.evaluate(() => { const tb = document.querySelector('#shell .topbar'), s = tb.querySelector('.savestat.failed').getBoundingClientRect(); return { bars: document.querySelectorAll('[data-testid="oilbar"]').length, saveLast: Math.abs(tb.getBoundingClientRect().bottom - s.bottom) <= 1.5, saveH: Math.round(s.height), edge: getComputedStyle(tb).borderBottomColor, cls: tb.className } })
  ok('OK on the OIL bar', '"Not saved" alone is now the top bar\'s last line, 36 tall, and the line under it is amber too', alone, alone.bars === 0 && alone.saveLast && alone.saveH === 36 && alone.edge === AMBER)
  await pic(`band-${K}-b3-week-not-saved-alone`)

  /* storage works again: Retry saves, the warning goes, the cyan edge is back */
  await p.evaluate(() => { window.__lsRefuse = false })
  await press('#shell .topbar > .savestat.failed button')
  await p.waitForSelector('#shell .topbar > .savestat.failed', { state: 'detached', timeout: 20000 }); await L.sleep(300)
  const none = await p.evaluate(() => { const tb = document.querySelector('#shell .topbar'); return { cls: tb.className, edge: getComputedStyle(tb).borderBottomColor } })
  ok('with no bar up', 'Edit Schedule\'s own cyan edge is back', none, !/oil-waiting|save-failed/.test(none.cls) && none.edge === 'rgba(59, 198, 232, 0.5)')
  await pic(`band-${K}-b4-week-no-bar`)
} finally {
  if (errors.length) console.log('errors:', errors.join(' | ').slice(0, 800))
  await ctx.close().catch(() => {}); await browser.close().catch(() => {})
}
