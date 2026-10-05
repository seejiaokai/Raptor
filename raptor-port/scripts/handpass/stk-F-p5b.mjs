/* Walker F — P5-05 .. P5-08 : the failed-save band on every main page, on a wrapped bar, on short visits, and the four
   states (saving, failed, repeated failure, success). Frozen build; forced storage failure; edits by controls. */
import * as F from './stk-F-lib.mjs'
const { row, judge, sleep, pic } = F
const ERRS = []
const PAGES = ['viewsched', 'editsched', 'inputs', 'quals', 'logic', 'leavewar', 'tracker', 'help', 'admin']
const errTxt = e => String(e.stack).split('\n').slice(0, 3).join(' <- ')

/* ---------------- P5-05 ---------------- */
async function p505(sizeKey) {
  const c = await F.open(sizeKey); const { p } = c
  const id = `P5-05 (${sizeKey})`
  const pcs = []
  try {
    const checks = []
    const failed = await F.failNow(p)
    checks.push(['warning up through an ordinary edit', failed])
    for (const pg of PAGES) {
      await F.go(p, pg); await sleep(pg === 'tracker' || pg === 'leavewar' ? 1000 : 400)
      for (const y of [0, 320]) {
        await p.evaluate(y => window.scrollTo(0, y), y); await sleep(250)
        const bar = await F.barInfo(p)
        const topPage = await p.evaluate(pg => { const e = document.querySelector('#page-' + pg) || document.querySelector('.page.on'); return e ? Math.round(e.getBoundingClientRect().top + window.scrollY) : null }, pg)
        const cc = await F.topmostControl(c, `#page-${pg}`)
        let pr = null
        if (cc) pr = await F.realPress(c, cc)
        const nz = x => String(x || '').replace(/[^a-z0-9]/gi, '').toLowerCase()
        const ok = !!cc && !!pr && !!pr.clickAt && pr.clickAt !== 'RETRY' && (nz(cc.sig).includes(nz(pr.clickAt)) || nz(pr.clickAt).includes(nz(cc.sig)) || nz(pr.focus) === nz(cc.sig) || ['input', 'select', 'textarea'].includes(cc.tag))
        const startsBelow = topPage == null || topPage >= bar.barBottom - 2 || y > 0
        const tag = `${pg}${y ? ' scrolled' : ''}`
        if (y === 0 && ['viewsched', 'inputs', 'logic', 'tracker'].includes(pg)) pcs.push(await F.pic(p, `page-${pg}-${sizeKey}`, { x: 0, y: 0, width: c.size.width, height: Math.min(c.size.height, 250) }))
        checks.push([`${tag}: bar ${bar.barH}px, note bottom ${bar.noteBottom}; first control [${cc ? cc.sig : 'none found'}] pressed for real → click went to [${pr && pr.clickAt}]`, ok && startsBelow, JSON.stringify({ page_top: topPage, box: cc && cc.box })])
        await p.keyboard.press('Escape'); await sleep(120); await p.keyboard.press('Escape'); await sleep(150)
        if (!ok) pcs.push(await F.pic(p, `p505-miss-${pg}-${y}-${sizeKey}`, { x: 0, y: 0, width: c.size.width, height: Math.min(c.size.height, 300) }))
        await p.mouse.click(2, c.size.height - 2); await sleep(150)   // a click on bare screen, as a person dismisses a pop-up
        /* a press may have opened something; get back to the page */
        if ((await p.evaluate(() => window.CURPAGE)) !== pg) await F.go(p, pg)
      }
    }
    judge(id, 'warning up (ordinary edit); every main page visited; at the top and scrolled 320px, the page’s topmost control pressed with a real mouse/touch press', checks, pcs)
  } catch (e) { row(id, 'walk', 'ERROR ' + errTxt(e), 'NOT WALKED', []); await pic(p, `p505-error-${sizeKey}`) }
  ERRS.push(...c.errors); await c.browser.close()
}

/* ---------------- P5-06 ---------------- */
async function p506(sizeKey) {
  const c = await F.open(sizeKey); const { p } = c
  const sz = sizeKey === 'd1366' ? '1366x800' : sizeKey === 'phone' ? '390x844' : '844x390'
  const id = `P5-06 (${sz})`
  const pcs = []
  try {
    const checks = []
    const failed = await F.failNow(p)
    checks.push(['warning up through an ordinary edit', failed])
    const rows = []
    for (const pg of PAGES) {
      await F.go(p, pg); await sleep(pg === 'tracker' || pg === 'leavewar' ? 1000 : 500)
      await p.evaluate(() => window.scrollTo(0, 0)); await sleep(200)
      const m = await p.evaluate(() => {
        const bar = document.querySelector('.topbar'); const br = bar.getBoundingClientRect()
        const n = document.querySelector('.topbar > .savestat'); const nr = n.getBoundingClientRect()
        const own = sel => { const e = [...document.querySelectorAll(sel)].find(x => { const r = x.getBoundingClientRect(); const cs = getComputedStyle(x); return r.width > 0 && r.height > 0 && r.left >= 0 && r.right <= innerWidth && cs.visibility !== 'hidden' && cs.display !== 'none' && +cs.opacity > 0.1 && !x.closest('[hidden]') && !(x.closest('.page') && !x.closest('.page.on') && x.closest('.page') !== null && getComputedStyle(x.closest('.page')).display === 'none') }); if (!e) return 'absent'; const r = e.getBoundingClientRect(); const h = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return !!h && (h === e || e.contains(h)) ? 'own' : 'COVERED by ' + (h ? (h.id || h.className || h.tagName) : 'nothing') }
        const rows = Math.round(br.height)
        return { barH: Math.round(br.height), barBottom: Math.round(br.bottom), noteTop: Math.round(nr.top), noteBottom: Math.round(nr.bottom), noteLeft: Math.round(nr.left), noteW: Math.round(nr.width), noteH: Math.round(nr.height), retry: own('.topbar > .savestat button'), account: own('#roleBadge, #acctBtn, .rolebadge'), logout: own('#logout'), undo: own('#undoBtn'), arrows: own('.week-nav'), crew: own('.ros-rail') }
      })
      rows.push({ pg, ...m })
      if (['viewsched', 'quals', 'leavewar', 'help'].includes(pg)) pcs.push(await F.pic(p, `bar-${pg}-${sz}`, { x: 0, y: 0, width: c.size.width, height: Math.min(c.size.height, 200) }))
    }
    for (const r of rows) {
      const aligned = Math.abs(r.noteBottom - r.barBottom) <= 2 && r.noteH >= 30 && r.noteLeft === 0 && r.noteW === c.size.width
      const hits = [r.retry, r.account, r.logout, r.undo, r.arrows, r.crew].every(x => x === 'own' || x === 'absent')
      checks.push([`${r.pg}: bar ${r.barH}px (bottom ${r.barBottom}); warning ${r.noteTop}→${r.noteBottom}, follows the bar's bottom`, aligned, JSON.stringify(r)])
      checks.push([`${r.pg}: Retry, account, Logout, Undo, arrows, CREW are their own targets`, hits, `retry ${r.retry}, acct ${r.account}, logout ${r.logout}, undo ${r.undo}, arrows ${r.arrows}, crew ${r.crew}`])
    }
    const barHs = [...new Set(rows.map(r => r.barH))]
    checks.push(['the bar differs in height between pages (so the follow was really exercised)', barHs.length > 1 || sizeKey !== 'd1366', 'bar heights seen: ' + barHs.join(', ')])
    if (c.size.touch) {
      /* the phone bar is a sideways scroll box: scroll it, the warning must not travel with it */
      await F.go(p, 'viewsched'); await sleep(400)
      const bb = await p.locator('.topbar').first().boundingBox()
      await p.mouse.move(bb.x + 300, bb.y + 20); await p.mouse.wheel(400, 0); await sleep(400)
      const sl = await p.evaluate(() => { const b = document.querySelector('.topbar'); const n = document.querySelector('.topbar > .savestat'); const r = n.getBoundingClientRect(); const bt = n.querySelector('button').getBoundingClientRect(); const h = document.elementFromPoint(bt.left + bt.width / 2, bt.top + bt.height / 2); return { scrollLeft: Math.round(b.scrollLeft), scrollW: b.scrollWidth, clientW: b.clientWidth, noteLeft: Math.round(r.left), noteW: Math.round(r.width), retryOwn: !!h && n.querySelector('button').contains(h) } })
      pcs.push(await F.pic(p, `bar-scrolled-${sz}`, { x: 0, y: 0, width: c.size.width, height: Math.min(c.size.height, 200) }))
      checks.push(['phone bar scrolled sideways: the warning stays put (left 0, full width) and Retry is its own target', sl.noteLeft === 0 && sl.noteW === c.size.width && sl.retryOwn, JSON.stringify(sl)])
      /* the account and Logout controls still reachable by scrolling back / are their own targets where they sit */
      const acc = await p.evaluate(() => ['#logout', '#roleBadge', '#undoBtn', '#burger'].map(s => { const e = document.querySelector(s); if (!e) return s + ':absent'; const r = e.getBoundingClientRect(); if (!(r.width > 0 && r.left >= 0 && r.right <= innerWidth)) return s + ':offscreen-in-scroll'; const h = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return s + ':' + (h && (h === e || e.contains(h)) ? 'own' : 'COVERED') }))
      checks.push(['controls on screen after the sideways scroll are their own targets (none covered)', !acc.some(x => /COVERED/.test(x)), acc.join(' ')])
    }
    judge(id, 'warning up; the nine pages visited in turn, the warning’s place read against the bar’s bottom each time' + (c.size.touch ? '; the bar scrolled sideways with a wheel gesture' : ''), checks, pcs)
  } catch (e) { row(id, 'walk', 'ERROR ' + errTxt(e), 'NOT WALKED', []); await pic(p, `p506-error-${sizeKey}`) }
  ERRS.push(...c.errors); await c.browser.close()
}

/* ---------------- P5-07 ---------------- */
async function p507(sizeKey) {
  const c = await F.open(sizeKey); const { p } = c
  const id = `P5-07 (${sizeKey})`
  const pcs = []
  try {
    const checks = []
    const failed = await F.failNow(p)
    checks.push(['warning up through an ordinary edit', failed])
    const drawnBands = () => p.evaluate(() => [...document.querySelectorAll('.saveband')].filter(b => { const r = b.getBoundingClientRect(); return r.width > 0 && r.height > 0 }).length)
    const topUp = async () => { const lk = await F.look(p, '.topbar > .savestat'); return !!lk.there }
    const stillFailed = () => p.evaluate(() => !!document.querySelector('.topbar > .savestat.failed'))
    const visit = async (name, open, operate, close) => {
      try {
        await open(); await sleep(500)
        const nb = await drawnBands()
        const retriesNow = (await F.retries(p)).filter(r => r.drawn && r.onTop && !r.inert)
        pcs.push(await F.pic(p, `short-${name}-${sizeKey}`, { x: 0, y: 0, width: c.size.width, height: Math.min(c.size.height, 360) }))
        if (operate) await operate()
        await close(); await sleep(500)
        const sf = await stillFailed()
        const back = await F.look(p, '.topbar > .savestat')
        checks.push([`${name}: no extra band inside it (drawn bands: ${nb}); reachable Retry buttons while open: ${retriesNow.length} (${retriesNow.map(r => r.where).join(',') || 'none: the bar’s copy is under the surface, as the bar is'}); after closing the failure is still there and its warning seen`, nb === 0 && sf && back.seen, JSON.stringify({ nb, sf, back: back.box })])
      } catch (e) { checks.push([`${name}: walked`, false, errTxt(e)]) ; await pic(p, `p507-${name}-err`) }
    }
    await F.go(p, 'viewsched'); await sleep(400)
    if (c.size.width > 820) await visit('insights-window', async () => { await p.locator('#insightBtn').click(); await p.waitForSelector('#insightClose') }, async () => { const sh = p.locator('[data-insights-all]'); if (await sh.count()) { await sh.click(); await sleep(300) } }, async () => { await p.locator('#insightClose').click() })
    else await visit('insights-window', async () => { await p.locator('#viewSchedMore').tap(); await p.locator('#viewSchedMoreInsights').tap(); await p.waitForSelector('#insightClose') }, null, async () => { await p.locator('#insightClose').tap() })
    if (c.size.touch) await visit('drawer', async () => { await p.locator('#burger').tap() }, async () => { await p.locator('#drawerAcct').first().isVisible().catch(() => {}) }, async () => { await p.touchscreen.tap(c.size.width - 12, c.size.height - 12) })
    /* an input sheet: the edit week's own input card */
    await F.go(p, 'editsched'); await sleep(500)
    const inpBtn = p.locator('#eWeek [data-inpedit]').first()
    if (await inpBtn.count()) {
      await visit('input-sheet', async () => { await inpBtn.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await sleep(250); const b = await inpBtn.boundingBox(); await c.press(b.x + b.width / 2, b.y + b.height / 2) }, null, async () => { await p.keyboard.press('Escape'); await sleep(200); if (await p.locator('.modal:visible, [role=dialog]:visible').count()) { const x = p.locator('.modal:visible .win-x, .modal:visible [aria-label=Close], .modal:visible button').first(); await x.click().catch(() => {}) } })
    } else checks.push(['input sheet: an input card to open on the edit week', false, 'no [data-inpedit] on the week in the fresh demo — NOT WALKED'])
    /* a floating window: Changes (desktop clock) */
    if (c.size.width > 620) await visit('changes-window', async () => { await p.locator('#histBtn').click() }, null, async () => { await p.locator('.chgwin .win-x').first().click() })
    judge(id, 'warning up; Insights window, ' + (c.size.touch ? 'drawer, ' : '') + 'input sheet and the Changes window opened and closed, their buttons pressed', checks, pcs)
  } catch (e) { row(id, 'walk', 'ERROR ' + errTxt(e), 'NOT WALKED', []); await pic(p, `p507-error-${sizeKey}`) }
  ERRS.push(...c.errors); await c.browser.close()
}

/* ---------------- P5-08 ---------------- */
async function p508(where) {
  const c = await F.open('desk'); const { p } = c
  const id = `P5-08 (${where}, 1440x900)`
  const pcs = []
  try {
    const checks = []
    /* a recorder of the note's states, from the first mutation */
    await p.evaluate(() => {
      window.__states = []
      const note = () => { const n = document.querySelector('.topbar > .savestat'); const b = document.querySelector('.saveband'); return n ? { cls: n.className, t: n.textContent.trim().slice(0, 40), top: Math.round(n.getBoundingClientRect().top), h: Math.round(n.getBoundingClientRect().height), bar: Math.round(document.querySelector('.topbar').getBoundingClientRect().height) } : null }
      let last = ''
      const rec = () => { const s = note(); const k = JSON.stringify(s); if (k !== last) { window.__states.push({ at: Math.round(performance.now()), s }); last = k } }
      new MutationObserver(rec).observe(document.body, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ['class'] })
      window.__rec = rec
    })
    const barH0 = (await F.barInfo(p)).barH
    await F.breakStorage(p)
    if (where === 'board') {
      await p.evaluate(() => window.go('editsched')); await F.go(p, 'editsched')
      await p.click('#eWeek [data-sbday="1"]:visible'); await p.waitForSelector('#schedBoard:not([hidden])'); await sleep(500)
      const el = p.locator('#schedBoard [data-bfld="ff:1.0.0.cs"]:visible').first(); await el.click(); await p.keyboard.press('Control+A'); await p.keyboard.type('VLB', { delay: 10 }); await p.keyboard.press('Tab')
    } else {
      await F.ordinaryEdit(p, 'VLM')
    }
    const failedUp = await p.waitForSelector('.topbar > .savestat.failed', { timeout: 15000 }).then(() => true, () => false)
    await sleep(500)
    const states = await p.evaluate(() => window.__states)
    const seq = states.map(s => s.s ? (s.s.cls.includes('failed') ? 'FAILED' : 'SAVING') : 'none').filter((x, i, a) => i === 0 || x !== a[i - 1])
    const saving = states.find(s => s.s && !s.s.cls.includes('failed'))
    checks.push(['order seen: Saving… first, then the failed warning (never the reverse)', seq.join('→').replace(/^none→?/, '').startsWith('SAVING→FAILED') || /SAVING.*FAILED/.test(seq.join('→')), seq.join(' → ')])
    checks.push(['Saving… keeps its floating look: a small note, not a full-width band (height ' + (saving && saving.s.h) + ', the bar unchanged at ' + (saving && saving.s.bar) + ')', !!saving && Math.abs(saving.s.bar - barH0) <= 1 && saving.s.h < 34 + 4, JSON.stringify(saving && saving.s)])
    const bi = await F.barInfo(p)
    const sel = where === 'board' ? '#schedBoard .saveband' : '.topbar > .savestat'
    const lk = await F.look(p, sel)
    pcs.push(await F.pic(p, `states-failed-${where}`, { x: 0, y: 0, width: 1440, height: 260 }))
    checks.push(['failed: one line added (top bar ' + barH0 + ' → ' + bi.barH + 'px, +' + (bi.barH - barH0) + ') and the warning is seen' + (where === 'board' ? ' under the board’s own bar' : ''), failedUp && bi.barH > barH0 && lk.seen, JSON.stringify({ bar: bi.barH, box: lk.box })])
    const nBands = async () => p.evaluate(() => ({ topNotes: document.querySelectorAll('.topbar > .savestat').length, drawnBands: [...document.querySelectorAll('.saveband')].filter(b => b.getBoundingClientRect().width > 0).length }))
    /* Retry while the failure persists, three times */
    const heights = []
    for (let i = 0; i < 3; i++) { await F.pressRetry(c, where === 'board' ? '#schedBoard .saveband button' : '.topbar > .savestat button'); await sleep(1500); heights.push((await F.barInfo(p)).barH) }
    const nb = await nBands()
    checks.push(['Retry pressed 3 times with the failure persisting: still one warning, the bar never grows past one added line', heights.every(h => h === bi.barH) && nb.topNotes === 1 && nb.drawnBands === (where === 'board' ? 1 : 0), JSON.stringify({ heights, ...nb })])
    pcs.push(await F.pic(p, `states-repeated-${where}`, { x: 0, y: 0, width: 1440, height: 260 }))
    /* the warning does not disappear on its own while unsaved: wait through a couple of the app's own retry rounds */
    await sleep(6000)
    const still = await p.evaluate(() => !!document.querySelector('.topbar > .savestat.failed'))
    checks.push(['the warning stays up through the app’s own retries while storage still refuses', still])
    /* success */
    await F.fixOnRetryPress(p)
    await F.pressRetry(c, where === 'board' ? '#schedBoard .saveband button' : '.topbar > .savestat button')
    const gone = await p.waitForFunction(() => !document.querySelector('.topbar > .savestat') && !document.querySelector('.saveband'), null, { timeout: 9000 }).then(() => true, () => false)
    await sleep(400)
    const bEnd = (await F.barInfo(p)).barH
    pcs.push(await F.pic(p, `states-saved-${where}`, { x: 0, y: 0, width: 1440, height: 260 }))
    checks.push(['confirmed success: warning gone everywhere, bar back to ' + barH0 + 'px', gone && Math.abs(bEnd - barH0) <= 1, `bar ${bEnd} (was ${barH0})`])
    /* and the edit is really saved: reload keeps it */
    await p.evaluate(() => window.__lsSetWas && (Storage.prototype.setItem = window.__lsSetWas))
    await sleep(700)
    const kept = await p.evaluate(w => { const raw = Object.keys(localStorage).map(k => localStorage.getItem(k)).join(''); return raw.includes(w) }, where === 'board' ? 'VLB' : 'VLM')
    checks.push(['the edit made while failing is in storage now', kept])
    judge(id, 'real edit with storage refusing: Saving… recorded, then the warning; Retry ×3 while failing; storage restored on the Retry press', checks, pcs)
  } catch (e) { row(id, 'walk', 'ERROR ' + errTxt(e), 'NOT WALKED', []); await pic(p, `p508-error-${where}`) }
  ERRS.push(...c.errors); await c.browser.close()
}

const only = (process.env.F_ONLY || '').split(',').filter(Boolean)
const want = k => !only.length || only.includes(k)
if (want('5')) { await p505('desk'); await p505('phone') }
if (want('6')) { await p506('d1366'); await p506('side') }
if (want('6p')) await p506('phone')
if (want('7')) { await p507('desk'); await p507('phone') }
if (want('8')) { await p508('main'); await p508('board') }
console.log('ERRORS', ERRS.length ? ERRS.join(' | ') : 'none')
F.savePart('p5b-' + (process.env.F_RUN || 'x'), { errors: ERRS, pics: F.pics })
