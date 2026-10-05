/* Walker F — P5-01 .. P5-04 : the failed-save band on the OIL tracker, the Tracker's Tools, the movable windows, and the
   three other full-screen covers. Frozen build; storage failure forced by the sn-cover recipe; every edit by a control. */
import * as F from './stk2-N-lib.mjs'
import * as LIB from './lib.mjs'
const { row, judge, sleep, pic } = F
const ERRS = []

/* a control, and what a finger lands on at its middle */
const own = (p, sel) => p.evaluate(sel => {
  const e = [...document.querySelectorAll(sel)].find(x => { const r = x.getBoundingClientRect(); return r.width > 0 && r.height > 0 })
  if (!e) return { found: false }
  const r = e.getBoundingClientRect(); const h = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2)
  return { found: true, own: !!h && (h === e || e.contains(h)), box: [Math.round(r.left), Math.round(r.top), Math.round(r.width), Math.round(r.height)], top: h ? (h.id || h.className || h.tagName).toString().slice(0, 30) : null }
}, sel)
const clickSel = async (c, sel) => { const l = c.p.locator(sel + ':visible').first(); const bb = await l.boundingBox(); if (!bb) return false; await c.press(bb.x + bb.width / 2, bb.y + bb.height / 2); return true }

const openChip = async (p, chip) => { await chip.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await sleep(300); const b = await chip.boundingBox(); await p.mouse.click(b.x + b.width / 2, b.y + b.height / 2) }
/* ---------------- P5-01 : the OIL tracker ---------------- */
async function p501(sizeKey) {
  const c = await F.open(sizeKey); const { p } = c
  const id = `P5-01 (${sizeKey})`
  try {
    const failed = await F.failNow(p)
    await F.go(p, 'leavewar'); await sleep(900)
    await p.locator('[data-testid="oil-tracker"]:visible').first().click(); await p.waitForSelector('[data-testid="oil-sheet"]'); await sleep(600)
    const checks = []
    checks.push(['the warning came up through an ordinary edit', failed])
    let lk = await F.look(p, '[data-testid="oil-sheet"] .saveband')
    const p1 = await F.pic(p, `oil-open-${sizeKey}`, { x: 0, y: 0, width: c.size.width, height: Math.min(c.size.height, 300) })
    checks.push(['one warning band is beneath the sheet’s own bar, seen whole and on top', lk.seen, lk.box])
    checks.push(['it covers no control', lk.covers.length === 0, lk.covers.join('·')])
    const heads = ['[data-testid="oil-close"]', '[data-testid="oil-range-first"]', '[data-testid="oil-range-pick"]', '[data-testid="oil-zoom-out"]', '[data-testid="oil-zoom-in"]', '[data-testid="oil-legend"]', '[data-testid="oil-settings"]']
    const headRes = {}
    for (const h of heads) headRes[h.replace(/.*="|"\]/g, '')] = await own(p, h)
    checks.push(['every head control is its own target (a finger lands on it)', Object.values(headRes).every(x => x.found && x.own), JSON.stringify(headRes).slice(0, 200)])
    const reach = await F.retries(p)
    const reachable = reach.filter(r => r.drawn && r.onTop && !r.inert)
    checks.push(['exactly one Retry is reachable', reachable.length === 1, reach.map(r => r.where + (r.onTop ? '' : '(under)') + (r.inert ? '(inert)' : '')).join(', ')])
    /* scroll */
    const sc = await p.evaluate(() => { const s = document.querySelector('[data-testid="oil-sheet"]'); const els = [s, ...s.querySelectorAll('*')].filter(e => e.scrollHeight > e.clientHeight + 20 && /auto|scroll/.test(getComputedStyle(e).overflowY)); const e = els[0]; if (!e) return null; e.scrollTop = 400; return { cls: String(e.className).slice(0, 30), top: e.scrollTop } })
    await sleep(300)
    lk = await F.look(p, '[data-testid="oil-sheet"] .saveband')
    checks.push(['after scrolling the sheet the warning is still seen and covers nothing', lk.seen && lk.covers.length === 0, JSON.stringify({ sc, box: lk.box })])
    /* range */
    const r1 = await clickSel(c, '[data-testid="oil-range-first"]')
    await sleep(500)
    lk = await F.look(p, '[data-testid="oil-sheet"] .saveband')
    const pickOpened = await clickSel(c, '[data-testid="oil-range-pick"]'); await sleep(500)
    const p2 = await F.pic(p, `oil-range-${sizeKey}`, { x: 0, y: 0, width: c.size.width, height: Math.min(c.size.height, 420) })
    const lk2 = await F.look(p, '[data-testid="oil-sheet"] .saveband')
    checks.push(['range controls worked (From first entry, Range pick pressed) with the warning still seen', r1 && pickOpened && lk.seen && lk2.seen, JSON.stringify({ r1, pickOpened, seen: [lk.seen, lk2.seen] })])
    await clickSel(c, '[data-testid="oil-range-pick"]'); await sleep(300)   // its own button shuts the picker (Escape would close the whole sheet)
    await clickSel(c, '[data-testid="oil-zoom-in"]'); await clickSel(c, '[data-testid="oil-zoom-out"]'); await sleep(300)
    const zo = await own(p, '[data-testid="oil-zoom-in"]')
    checks.push(['zoom in / out pressed; zoom still its own target', zo.found && zo.own, JSON.stringify(zo)])
    /* Retry while storage still refuses */
    const rr = await F.pressRetry(c, '[data-testid="oil-sheet"] .saveband button')
    await sleep(600)
    const stays = (await p.locator('[data-testid="oil-sheet"] .saveband').count()) === 1
    checks.push(['Retry pressed while storage still refuses: the warning stays (one band)', rr.pressed && stays, JSON.stringify(rr)])
    await F.fixOnRetryPress(p)
    await F.pressRetry(c, '[data-testid="oil-sheet"] .saveband button')
    const gone = await p.waitForFunction(() => !document.querySelector('.saveband') && !document.querySelector('.topbar > .savestat'), null, { timeout: 8000 }).then(() => true, () => false)
    const p3 = await F.pic(p, `oil-after-retry-${sizeKey}`, { x: 0, y: 0, width: c.size.width, height: Math.min(c.size.height, 300) })
    checks.push(['Retry with storage restored saves; every warning goes', gone])
    const closeOk = await clickSel(c, '[data-testid="oil-close"]'); await sleep(400)
    checks.push(['the sheet’s close cross still closes it', closeOk && (await p.locator('[data-testid="oil-sheet"]').count()) === 0])
    judge(id, `broke storage, ordinary edit on Edit Schedule, opened Leave War → OIL tracker; scrolled, From first entry, Range, zoom ± ; Retry failing, then restoring`, checks, [p1, p2, p3])
  } catch (e) { row(id, 'walk', 'ERROR ' + String(e.stack).split('\n').slice(0, 3).join(' <- '), 'NOT WALKED', []); await pic(p, `oil-error-${sizeKey}`) }
  ERRS.push(...c.errors); await c.browser.close()
}

/* ---------------- P5-02 : Tracker Tools ---------------- */
async function p502() {
  const c = await F.open('side'); const { p } = c
  const id = 'P5-02 (844x390)'
  try {
    const checks = []
    await F.go(p, 'tracker'); await sleep(900)
    const t = async sel => { const l = p.locator(sel + ':visible').first(); await l.click({ timeout: 4000 }); await sleep(300) }
    await t('#sylMenuBtn'); await t('#arrangeBtn')
    const tools = p.locator('#page-tracker button', { hasText: 'Tools ▾' }).first()
    const toolsOpen = () => p.evaluate(() => { const e = document.querySelector('#arrTools'); return !!e && e.offsetParent !== null && /\bopen\b/.test(e.className) })
    await tools.click(); await sleep(300)
    await p.locator('#arrTools button', { hasText: '+ Test' }).first().click(); await sleep(400)
    const afterChoice = await toolsOpen()
    await p.locator('#dlgInput').first().click(); await p.keyboard.type('F-WALK', { delay: 20 }); await t('#dlgOk'); await sleep(400)
    const editShown = await p.evaluate(() => [...document.querySelectorAll('#page-tracker header button')].some(b => /Save changes/.test(b.textContent || '') && b.getClientRects().length > 0))
    checks.push(['an ordinary chart edit made ("+ Test" named F-WALK); "✓ Save changes" is showing', editShown, 'Tools open straight after choosing + Test: ' + afterChoice])
    if (!(await toolsOpen())) { await tools.click(); await sleep(300) }
    const openBefore = await toolsOpen()
    const barBefore = await F.barInfo(p)
    const p1 = await F.pic(p, 'trk-tools-before')
    checks.push(['Tools is open before the failure', openBefore])
    await F.breakStorage(p)
    const saveBtn = p.locator('#saveChanges:visible, #page-tracker header button:visible', { hasText: 'Save changes' }).first()
    const saveBox = await saveBtn.boundingBox()
    let pressed = false
    /* the press itself is a tap outside the Tools panel, so it closes it by D373's own rule. The failure only surfaces
       after the postman's short merge wait, so Tools ▾ is tapped again at once: the band then comes up WITH Tools open */
    if (saveBox) { await p.touchscreen.tap(saveBox.x + saveBox.width / 2, saveBox.y + saveBox.height / 2); pressed = true }
    const closedByPress = !(await toolsOpen())
    await tools.tap()
    const noteAtReopen = await p.evaluate(() => { const n = document.querySelector('.topbar > .savestat'); return n ? n.className : 'none yet' })
    const openAtReopen = await toolsOpen()
    const failedUp = await p.waitForSelector('.topbar > .savestat.failed', { timeout: 9000 }).then(() => true, () => false)
    await sleep(600)
    checks.push(['the Save press (a tap outside Tools) closed Tools by D373’s rule, then Tools ▾ was tapped open again before the failure surfaced', closedByPress && openAtReopen, `closed by press: ${closedByPress}; open again: ${openAtReopen}; bar note at that moment: ${noteAtReopen}`])
    const openDuring = await toolsOpen()
    const barDuring = await F.barInfo(p)
    const p2 = await F.pic(p, 'trk-tools-after-fail')
    checks.push(['"✓ Save changes" pressed (a chart save made to fail)', pressed, JSON.stringify(saveBox && [Math.round(saveBox.x), Math.round(saveBox.y)])])
    checks.push(['the warning band came up (top bar one line taller)', failedUp && barDuring.barH > barBefore.barH, `bar ${barBefore.barH} → ${barDuring.barH}`])
    checks.push(['Tools STAYS open through the band appearing', openDuring, 'open after fail: ' + openDuring])
    const modeStill = await p.evaluate(() => { const d = document.querySelector('#arrangeBtn'); return !!document.querySelector('#fontIn') && document.querySelector('#fontIn').offsetParent !== null })
    checks.push(['the chart is still in Edit chart layout mode', modeStill])
    const toolsHits = await p.evaluate(() => [...document.querySelectorAll('#arrTools button')].filter(b => b.offsetParent !== null).map(b => { const r = b.getBoundingClientRect(); const h = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return (!!h && (h === b || b.contains(h))) ? 1 : 0 }))
    checks.push(['Tools buttons are still what a finger lands on (not under the band)', toolsHits.length > 0 && toolsHits.every(x => x === 1), `${toolsHits.filter(x => x).length}/${toolsHits.length}`])
    /* restore and Retry */
    /* storage is put back and nobody presses anything: the app's own retry lands the save and the band goes — Tools must
       not be closed by the bar shrinking (a press on Retry would itself be a tap outside Tools) */
    await F.fixStorage(p)
    const gone = await p.waitForFunction(() => !document.querySelector('.topbar > .savestat'), null, { timeout: 30000 }).then(() => true, () => false)
    await sleep(500)
    const openAfter = await toolsOpen()
    const barAfter = await F.barInfo(p)
    const p3 = await F.pic(p, 'trk-tools-after-autoretry')
    const rr = { pressed: true, box: null }
    checks.push(['storage put back, the app’s own retry saves; the warning goes (bar back to ' + barAfter.barH + 'px)', gone && barAfter.barH === barBefore.barH, `bar ${barBefore.barH} → ${barAfter.barH}`])
    checks.push(['Tools STAYS open through the band going away', openAfter, 'open after the band left: ' + openAfter])
    
    judge(id, 'Tracker → Edit chart layout, Tools ▾ open, + Test named, ✓ Save changes pressed with storage refusing, then Retry with storage restored', checks, [p1, p2, p3])
  } catch (e) { row(id, 'walk', 'ERROR ' + String(e.stack).split('\n').slice(0, 3).join(' <- '), 'NOT WALKED', []); await pic(p, 'trk-error') }
  ERRS.push(...c.errors); await c.browser.close()
}

/* ---------------- P5-03 : the two movable windows ---------------- */
async function p503() {
  const c = await F.open('desk'); const { p } = c
  const id = 'P5-03 (1440x900)'
  try {
    const checks = []
    /* an ALL AVAIL chip: a Saturday common-programme row for ALL AVAIL, through the board's own controls */
    await LIB.board(p, 5)
    await LIB.tap(p, '[data-padd="5"]')
    await LIB.type(p, '[data-bfld="ap:5.0.prog"]', 'FAMILY DAY'); await LIB.type(p, '[data-bfld="ap:5.0.str"]', '10:00'); await LIB.type(p, '[data-bfld="ap:5.0.end"]', '14:00')
    const put = await LIB.put(p, '[data-fill="a:5.0.+"]', ['allavail'])
    await F.H.W.boardOff(p)
    await F.go(p, 'editsched')
    const chip = p.locator('#eWeek [data-oilsent]').first()
    const haveChip = await chip.count()
    checks.push(['ALL AVAIL chip made through the board (put: ' + put + ')', haveChip > 0])
    const win = sel => p.evaluate(sel => { const e = document.querySelector(sel); if (!e || e.hidden) return null; const r = e.getBoundingClientRect(); if (!r.width) return null; return { x: Math.round(r.left), y: Math.round(r.top), w: Math.round(r.width), h: Math.round(r.height), placed: e.hasAttribute('data-placed'), bottom: Math.round(r.bottom) } }, sel)
    /* open both */
    await openChip(p, chip); await sleep(500)
    await p.locator('#histBtn').click(); await sleep(500)
    const A = '.availwin', C = '.chgwin:not([hidden])'
    const a0 = await win(A), c0 = await win(C)
    const p1 = await F.pic(p, 'win-both-open')
    checks.push(['both windows open at their default places', !!a0 && !!c0, JSON.stringify({ a0, c0 })])
    /* move and resize each: drag by its title bar, then its bottom-right corner */
    const dragBar = async sel => { const b = await p.locator(sel + ' .win-bar').first().boundingBox(); await p.mouse.move(b.x + 60, b.y + 12); await p.mouse.down(); await p.mouse.move(b.x + 20, b.y + 60, { steps: 8 }); await p.mouse.move(b.x - 300, b.y + 90, { steps: 8 }); await p.mouse.up(); await sleep(300) }
    const resize = async sel => { const w = await win(sel); await p.mouse.move(w.x + w.w - 4, w.y + w.h - 4); await p.mouse.down(); await p.mouse.move(w.x + w.w - 40, w.y + w.h - 30, { steps: 6 }); await p.mouse.move(w.x + w.w - 80, w.y + w.h - 90, { steps: 6 }); await p.mouse.up(); await sleep(400) }
    await dragBar(C); await resize(C)
    const c1 = await win(C)
    await dragBar(A); await resize(A)
    const a1 = await win(A)
    const p2 = await F.pic(p, 'win-both-placed')
    checks.push(['ALL AVAIL moved/resized by hand (placed mark on)', !!a1 && a1.placed && (a1.w !== a0.w || a1.h !== a0.h || a1.x !== a0.x), JSON.stringify({ a0, a1 })])
    checks.push(['Changes moved/resized by hand (placed mark on)', !!c1 && c1.placed && (c1.w !== c0.w || c1.h !== c0.h || c1.x !== c0.x), JSON.stringify({ c0, c1 })])
    /* fail, then Retry successfully */
    await F.breakStorage(p)
    /* an ordinary edit with the windows up: the callsign box on the week */
    const el = p.locator('#eWeek [data-txt="ff:0.0.0.cs"]:visible').first(); await el.scrollIntoViewIfNeeded()
    const elb = await el.boundingBox(); await p.mouse.click(elb.x + 10, elb.y + elb.height / 2); await p.keyboard.press('Control+A'); await p.keyboard.type('VLW', { delay: 10 }); await p.keyboard.press('Tab'); await sleep(300)
    const failedUp = await p.waitForSelector('.topbar > .savestat.failed', { timeout: 15000 }).then(() => true, () => false)
    await sleep(400)
    const a2 = await win(A), c2 = await win(C)
    const p3 = await F.pic(p, 'win-during-fail')
    checks.push(['the warning is up', failedUp])
    checks.push(['ALL AVAIL keeps the size/place chosen during the failure', !!a2 && Math.abs(a2.w - a1.w) <= 1 && Math.abs(a2.h - a1.h) <= 1 && Math.abs(a2.x - a1.x) <= 1 && Math.abs(a2.y - a1.y) <= 1, JSON.stringify({ a1, a2 })])
    checks.push(['Changes keeps the size/place chosen during the failure', !!c2 && Math.abs(c2.w - c1.w) <= 1 && Math.abs(c2.h - c1.h) <= 1 && Math.abs(c2.x - c1.x) <= 1 && Math.abs(c2.y - c1.y) <= 1, JSON.stringify({ c1, c2 })])
    await F.fixOnRetryPress(p)
    await F.pressRetry(c)
    const gone = await p.waitForFunction(() => !document.querySelector('.topbar > .savestat'), null, { timeout: 9000 }).then(() => true, () => false)
    await sleep(500)
    const a3 = await win(A), c3 = await win(C)
    checks.push(['Retry succeeded; both windows unchanged after the warning left', gone && !!a3 && !!c3 && Math.abs(a3.h - a1.h) <= 1 && Math.abs(c3.h - c1.h) <= 1 && Math.abs(a3.w - a1.w) <= 1 && Math.abs(c3.w - c1.w) <= 1, JSON.stringify({ a3, c3 })])
    /* close and reopen */
    await p.locator(A + ' .win-x').first().click(); await sleep(300); await p.locator('#histBtn').click(); await sleep(300); await p.locator('#histBtn').click(); await sleep(400)
    await openChip(p, chip); await sleep(500)
    const a4 = await win(A), c4 = await win(C)
    const p4 = await F.pic(p, 'win-reopened')
    checks.push(['reopened (closing forgets a placement, by design — view.ts): both windows come back at their default places and FULL default size — not left shortened or displaced by the failed-save band — on screen', !!a4 && !!c4 && a4.h === a0.h && a4.w === a0.w && c4.h === c0.h && c4.w === c0.w && a4.x === a0.x && c4.x === c0.x && a4.y === a0.y && c4.y === c0.y && a4.bottom <= 900 && c4.bottom <= 900, JSON.stringify({ a4, c4 })])
    /* default-position windows make room: a fresh page with unmoved windows, failure active */
    judge(id, 'ALL AVAIL (chip on Saturday) and Changes (clock) windows opened, each dragged and resized, then storage broken + ordinary edit, Retry, closed and reopened', checks, [p1, p2, p3, p4])
    ERRS.push(...c.errors); await c.browser.close()
    /* part 2: unmoved windows opened while the failure is up */
    const d = await F.open('desk'); const q = d.p
    await LIB.board(q, 5); await LIB.tap(q, '[data-padd="5"]'); await LIB.type(q, '[data-bfld="ap:5.0.prog"]', 'FAMILY DAY'); await LIB.type(q, '[data-bfld="ap:5.0.str"]', '10:00'); await LIB.type(q, '[data-bfld="ap:5.0.end"]', '14:00'); await LIB.put(q, '[data-fill="a:5.0.+"]', ['allavail']); await F.H.W.boardOff(q)
    await F.go(q, 'editsched'); await sleep(500)
    const ok2 = await F.failNow(q, 'VLY')
    const chip2 = q.locator('#eWeek [data-oilsent]').first(); await openChip(q, chip2); await sleep(500)
    await q.locator('#histBtn').click(); await sleep(600)
    const w2 = await q.evaluate(() => { const f = s => { const e = document.querySelector(s); if (!e || e.hidden) return null; const r = e.getBoundingClientRect(); return { x: Math.round(r.left), y: Math.round(r.top), w: Math.round(r.width), h: Math.round(r.height), bottom: Math.round(r.bottom), placed: e.hasAttribute('data-placed') } }; const bar = document.querySelector('.topbar').getBoundingClientRect(); const retry = document.querySelector('.topbar > .savestat button').getBoundingClientRect(); return { a: f('.availwin'), c: f('.chgwin:not([hidden])'), barBottom: Math.round(bar.bottom), retry: [Math.round(retry.left), Math.round(retry.top), Math.round(retry.right), Math.round(retry.bottom)] } })
    const p5 = await F.pic(q, 'win-default-during-fail')
    const clear = w => w && w.y >= w2.barBottom && w.bottom <= 900
    const overRetry = w => w && !(w.x + w.w < w2.retry[0] || w.x > w2.retry[2] || w.y + w.h < w2.retry[1] || w.y > w2.retry[3])
    judge('P5-03b (1440x900)', 'both windows opened at their default places WHILE the warning is up', [
      ['warning up', ok2], ['ALL AVAIL opens below the enlarged bar, on screen', !!clear(w2.a), JSON.stringify(w2.a) + ' bar ' + w2.barBottom],
      ['Changes opens below the enlarged bar, on screen', !!clear(w2.c), JSON.stringify(w2.c)],
      ['neither lies over Retry', !overRetry(w2.a) && !overRetry(w2.c), JSON.stringify(w2.retry)]], [p5])
    ERRS.push(...d.errors); await d.browser.close()
    return
  } catch (e) { row(id, 'walk', 'ERROR ' + String(e.stack).split('\n').slice(0, 3).join(' <- '), 'NOT WALKED', []); await pic(p, 'win-error') }
  ERRS.push(...c.errors); await c.browser.close()
}

/* ---------------- P5-04 : Board, Inputs calendar, Medical ---------------- */
async function p504(sizeKey) {
  const c = await F.open(sizeKey); const { p } = c
  const id = `P5-04 (${sizeKey})`
  const pcs = []
  try {
    const checks = []
    const failed = await F.failNow(p)
    checks.push(['warning up through an ordinary edit', failed])
    const reachable = async () => (await F.retries(p)).filter(r => r.drawn && r.onTop && !r.inert)
    /* the Board */
    await p.click('#eWeek [data-sbday="1"]:visible'); await p.waitForSelector('#schedBoard:not([hidden])'); await sleep(700)
    const lkB = await F.look(p, '#schedBoard .saveband')
    const pB = await F.pic(p, `board-${sizeKey}`, { x: 0, y: 0, width: c.size.width, height: Math.min(c.size.height, 300) }); pcs.push(pB)
    const rB = await reachable()
    const topInert = await p.evaluate(() => { const n = document.querySelector('.topbar > .savestat'); return n ? n.hasAttribute('inert') : null })
    checks.push(['Board: warning under the board’s own bar, seen, covering nothing', lkB.seen && lkB.covers.length === 0, JSON.stringify(lkB.box) + ' ' + lkB.covers.join('·')])
    checks.push(['Board: exactly one reachable Retry (the board’s); the top bar’s copy is inert', rB.length === 1 && rB[0].where === 'band:board' && topInert === true, rB.map(r => r.where).join(',') + ' topInert=' + topInert])
    /* keyboard reachability: Tab to Retry focusing the band's button, not the bar's */
    const kb = await p.evaluate(() => { const b = document.querySelector('#schedBoard .saveband button'); const t = document.querySelector('.topbar > .savestat button'); b.focus(); const a = document.activeElement === b; t.focus(); const t_ok = document.activeElement === t; return { bandFocus: a, topbarFocusable: t_ok } })
    checks.push(['Board: the band’s Retry takes keyboard focus; the bar’s copy cannot', kb.bandFocus && !kb.topbarFocusable, JSON.stringify(kb)])
    /* first control of the bar: press for real */
    const bar1 = await F.topmostControl(c, '#schedBoard .sb-top button:not(#sbDone), #schedBoard .sb-top select')
    let pr1 = null
    const ctrlList = await p.evaluate(() => [...document.querySelectorAll('#schedBoard .sb-top button, #schedBoard .sb-top select')].filter(e => e.getBoundingClientRect().width > 0).map(e => (e.id || e.getAttribute('aria-label') || e.textContent.trim().slice(0, 14))).slice(0, 14))
    const first = c.size.width > 820 ? '#sbInsights' : '#sbMore'
    const fb = await p.locator(first).boundingBox()
    if (fb) { pr1 = await F.realPress(c, { x: fb.x + fb.width / 2, y: fb.y + fb.height / 2 }) }
    await sleep(400)
    checks.push([`Board: first control (${first}) pressed for real — it took the press, not Retry`, !!pr1 && pr1.clickAt && pr1.clickAt !== 'RETRY', JSON.stringify(pr1) + ' bar: ' + ctrlList.join(' | ')])
    await p.keyboard.press('Escape'); await sleep(200)
    if (await p.locator('#insightClose:visible').count()) { await p.locator('#insightClose').click(); await sleep(300) }
    if (await p.locator('#sbMoreMenu:visible, #sbMoreInsights:visible').count()) { await p.keyboard.press('Escape'); await sleep(200) }
    /* Retry from the board while failing, then close the board: main warning restored */
    const rr = await F.pressRetry(c, '#schedBoard .saveband button'); await sleep(500)
    checks.push(['Board: Retry (storage still refusing) — warning stays', rr.pressed && (await p.locator('#schedBoard .saveband').count()) === 1])
    await p.locator('#sbDone').click(); await sleep(500)
    const rMain = await reachable()
    const lkTop = await F.look(p, '.topbar > .savestat')
    checks.push(['Board closed: the main warning is back, seen, one reachable Retry, no longer inert', rMain.length === 1 && rMain[0].where === 'topbar' && lkTop.seen, rMain.map(r => r.where).join(',') + ' ' + JSON.stringify(lkTop.box)])
    /* Inputs calendar and Medical view */
    await F.go(p, 'inputs'); await sleep(400)
    for (const [btn, root, name, back] of [['#inCalBtn', '#inpCal', 'inputs-calendar', '#inpCal .ic-head button[aria-label="Back to list"]'], ['#inMedBtn', '#medView', 'medical-view', '#medView .ic-head button[aria-label="Back to list"]']]) {
      await p.locator(btn).click(); await p.waitForSelector(root); await sleep(600)
      const lk = await F.look(p, root + ' .saveband')
      const pic1 = await F.pic(p, `${name}-${sizeKey}`, { x: 0, y: 0, width: c.size.width, height: Math.min(c.size.height, 300) }); pcs.push(pic1)
      const rr2 = await reachable()
      const fc = await F.topmostControl(c, root + ' .ic-head')
      let pr = null
      const hb = await p.locator(root + ' .ic-head button').first().boundingBox()
      if (hb) pr = await F.realPress(c, { x: hb.x + hb.width / 2, y: hb.y + hb.height / 2 })
      await sleep(300)
      const stillOpen = await p.locator(root).count()
      checks.push([`${name}: warning under its head, seen, covers no control`, lk.seen && lk.covers.length === 0, JSON.stringify(lk.box) + lk.covers.join('·')])
      checks.push([`${name}: exactly one reachable Retry (its own)`, rr2.length === 1 && /^band/.test(rr2[0].where), rr2.map(r => r.where).join(',')])
      checks.push([`${name}: its head’s first control pressed for real took the press (not Retry)`, !!pr && pr.clickAt && pr.clickAt !== 'RETRY', JSON.stringify(pr)])
      for (let k = 0; k < 3 && (await p.locator(root).count()); k++) { const bb = await p.locator(back).first().boundingBox({ timeout: 3000 }).catch(() => null); if (bb) await c.press(bb.x + bb.width / 2, bb.y + bb.height / 2); else await p.keyboard.press('Escape'); await sleep(350) }
    }
    const endInfo = await p.evaluate(() => ({ cur: window.CURPAGE, med: !!document.querySelector('#medView'), cal: !!document.querySelector('#inpCal'), note: (document.querySelector('.topbar > .savestat') || {}).className || null, bands: document.querySelectorAll('.saveband').length, bar: document.querySelector('.topbar').className }))
    const pEnd = await F.pic(p, 'cover-end-' + sizeKey, { x: 0, y: 0, width: c.size.width, height: Math.min(c.size.height, 260) }); pcs.push(pEnd)
    const rEnd = await reachable()
    const lkEnd = await F.look(p, '.topbar > .savestat')
    checks.push(['after both closed: the main warning is back and is the one reachable Retry', rEnd.length === 1 && rEnd[0].where === 'topbar' && lkEnd.seen, rEnd.map(r => r.where).join(',') + ' ' + JSON.stringify(endInfo)])
    judge(id, 'warning up (ordinary edit), then opened the Board (day 2), Inputs calendar and Medical view through their doors; first control pressed, Retry pressed, closed', checks, pcs)
  } catch (e) { row(id, 'walk', 'ERROR ' + String(e.stack).split('\n').slice(0, 3).join(' <- '), 'NOT WALKED', []); await pic(p, `cover-error-${sizeKey}`) }
  ERRS.push(...c.errors); await c.browser.close()
}

const only = (process.env.F_ONLY || '').split(',').filter(Boolean)
const want = k => !only.length || only.includes(k)
if (want('1')) { await p501('desk'); await p501('phone') }
if (want('2')) await p502()
if (want('3')) await p503()
if (want('4')) { await p504('desk'); await p504('phone') }
console.log('ERRORS', ERRS.length ? ERRS.join(' | ') : 'none')
F.savePart('p5a-' + (process.env.F_RUN || 'x'), { errors: ERRS, pics: F.pics })
