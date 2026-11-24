/* The ?timing readout's walk, part 2 (chat 164) — W3, W4, W6–W17, W22, W24, W25 of the evidence sheet's combined list.
   node scripts/handpass/timing-walk-2.mjs   (from raptor-port/, on a build already made). ONLY=W7,W12 runs those. */
import { PRESS, serve, browserOf, fresh, DESK, PHONE, signIn, outsideTime, armOutside, openBy, readout, row, pageRows, waitRows, openWindow, topAt, pic, shotDir, judge, notWalked, saveResults, sleep, chromium } from './timing-walk-lib.mjs'

const ONLY = process.env.ONLY ? process.env.ONLY.split(',') : null
const on = id => !ONLY || ONLY.includes(id)
const srv = await serve()
const cr = await browserOf('chromium')
const B = srv.base
const secs = v => Number((/([\d.]+) s/.exec(v || '') || [])[1])
const top1 = async page => pageRows(await readout(page))[0]
async function scen(id, size, opts, fn) {
  if (!on(id)) return
  const s = await fresh(cr, size, opts)
  const dir = shotDir(id)
  try { await fn({ ...s, dir }) } catch (e) { judge(id + '-ran', false, 'the step stopped: ' + String(e).slice(0, 200)) }
  if (s.errors.length) console.log(`  ${id} page errors: ${s.errors.join(' | ')}`)
  await s.ctx.close()
}
const weekUp = page => page.waitForSelector('#vWeek .day', { state: 'attached', timeout: 60000 })

/* W3 — nothing saved by the switch, nothing about a person in Copy all */
if (on('W3')) {
  const storeOf = async (q, who) => {
    const { ctx, page } = await fresh(cr, DESK)
    await ctx.grantPermissions(['clipboard-read', 'clipboard-write'], { origin: B })
    await page.goto(B + '/' + q); await signIn(page, who); await weekUp(page)
    for (const p of ['inputs', 'quals', 'leavewar']) { await openBy(page, p); await outsideTime(page, p) }
    let copied = ''
    if (q) {
      await openWindow(page)
      const bar = await page.locator('#timingRoot .timingwin .win-bar').first().boundingBox()
      if (bar) { await page.mouse.move(bar.x + 30, bar.y + 10); await page.mouse.down(); await page.mouse.move(bar.x - 400, bar.y - 200, { steps: 8 }); await page.mouse.up() }
      await page.click('#timingRoot .timingwin .win-x').catch(() => {})
      await openWindow(page)
      await page.click('#timingRoot .win-tools button')
      copied = await page.evaluate(() => navigator.clipboard.readText())
    }
    const cs = await page.evaluate(() => (document.querySelector('#drawerAcct b') || {}).textContent || (document.querySelector('.who, #whoBtn, .acct') || {}).textContent || '')
    const st = await page.evaluate(async () => ({
      local: Object.keys(localStorage).sort(), session: Object.keys(sessionStorage).sort(),
      idb: indexedDB.databases ? (await indexedDB.databases()).map(d => d.name).sort() : ['n/a'], cookie: document.cookie,
    }))
    await page.reload(); await page.waitForSelector('#luser, #vWeek .day', { state: 'attached', timeout: 60000 })
    await sleep(1500)
    const after = await readout(page)
    await ctx.close()
    return { st, copied, cs, after }
  }
  for (const who of ['ad', 'us']) {
    const a = await storeOf('', who), b = await storeOf('?timing', who)
    const diff = k => JSON.stringify(a.st[k]) === JSON.stringify(b.st[k])
    judge('W3-store-' + who, diff('local') && diff('session') && diff('idb') && diff('cookie'), `local ${b.st.local.length} keys (without ${a.st.local.length}), session ${b.st.session.length} (${a.st.session.length}), databases ${b.st.idb.join(',')} (${a.st.idb.join(',')}), cookie "${b.st.cookie}" ("${a.st.cookie}")`)
    const csWord = (b.cs || '').trim()
    const named = [csWord, who === 'ad' ? 'SABER' : '', 'Member', ' admin', who].filter(w => w && w.length > 1 && new RegExp('\\b' + w.trim() + '\\b', 'i').test(b.copied.replace(/Admin, (first time|opened before)/g, '')))
    judge('W3-copy-' + who, b.copied.length > 200 && named.length === 0, `copy ${b.copied.length} characters; signed in as "${csWord}"; personal words found: ${named.join(', ') || 'none'}`)
    judge('W3-reload-' + who, !b.after.open || (b.after.win && b.after.win.x > 900), `after a reload the window ${b.after.open ? 'open at x ' + b.after.win.x + ', y ' + b.after.win.y : 'folded'} (its place not kept)`)
    if (who === 'ad') console.log('  ---- Copy all, as pasted (admin) ----\n' + b.copied.split('\n').map(l => '  | ' + l).join('\n'))
  }
}

/* W4 — the window: its places, ✕, the corner button, drag, a long list, small screens */
for (const [id, size] of [['W4-desk', DESK], ['W4-phone', PHONE], ['W4-short', { viewport: { width: 1024, height: 600 } }], ['W4-small', { viewport: { width: 320, height: 568 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 }]]) {
  await scen(id, size, {}, async ({ page, dir }) => {
    const W = size.viewport.width, H = size.viewport.height
    await page.goto(B + '/?timing'); await page.waitForSelector('#timingRoot > *', { timeout: 60000 })
    let r = await readout(page)
    const phone = W <= 620
    if (phone) judge(id + '-start', !r.open && r.pill === 'Timing' && r.pillBox.x < 40 && r.pillBox.y + r.pillBox.h > H - 40, `folded "${r.pill}" at x ${r.pillBox?.x}, bottom ${r.pillBox && r.pillBox.y + r.pillBox.h} of ${H}`)
    else judge(id + '-start', r.open && r.win.x + r.win.w > W - 40 && r.win.y + r.win.h > H - 40, `open at x ${r.win?.x}–${r.win && r.win.x + r.win.w}, y ${r.win?.y}–${r.win && r.win.y + r.win.h} of ${W}×${H}`)
    await pic(page, dir, 'at-start')
    await signIn(page); await weekUp(page)
    if (W > 620) await sleep(300)
    await openBy(page, 'inputs', phone ? 'drawer' : 'top'); await outsideTime(page, 'inputs')
    await waitRows(page, 0)
    await openWindow(page)
    await pic(page, dir, 'open-after-a-page')
    /* the ✕, Copy all and the title's second line inside the screen, the line whole */
    const geo = await page.evaluate(() => {
      const w = document.querySelector('#timingRoot .timingwin'); const b = e => { const r = e.getBoundingClientRect(); return [Math.round(r.left), Math.round(r.top), Math.round(r.right), Math.round(r.bottom)] }
      const x = w.querySelector('.win-x'), c = [...w.querySelectorAll('.win-tools button')][0], sub = w.querySelector('.win-ttl small')
      const hitOk = e => { const r = e.getBoundingClientRect(); const h = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return !!h && (h === e || e.contains(h)) }
      return { win: b(w), x: x && b(x), copy: c && b(c), sub: sub && b(sub), subCut: sub ? (() => { const t = sub.closest('.win-ttl'), cs = getComputedStyle(t), wr = w.getBoundingClientRect(), sr = sub.getBoundingClientRect(); return (cs.overflow !== 'visible' && t.scrollWidth > t.clientWidth + 1) || cs.textOverflow === 'ellipsis' && t.scrollWidth > t.clientWidth + 1 || sr.right > wr.right || sr.left < wr.left })() : null, subText: sub && sub.textContent, xHit: x && hitOk(x), cHit: c && hitOk(c), vw: innerWidth, vh: innerHeight }
    })
    const inside = a => a && a[0] >= 0 && a[1] >= 0 && a[2] <= geo.vw && a[3] <= geo.vh
    judge(id + '-controls', inside(geo.x) && inside(geo.copy) && geo.xHit && geo.cHit, `✕ ${geo.x} pressable ${geo.xHit}; Copy all ${geo.copy} pressable ${geo.cHit}; window ${geo.win} in ${geo.vw}×${geo.vh}`)
    judge(id + '-subline', geo.subCut === false && geo.subText === 'This computer only. Shown because the address ends in ?timing', `"${geo.subText}" cut ${geo.subCut}, box ${geo.sub}`)
    /* ✕ folds to the corner button with the newest page's time; the button opens it again */
    const newest = (await top1(page))?.value
    await page.click('#timingRoot .timingwin .win-x')
    r = await readout(page)
    judge(id + '-fold', !r.open && r.pill === 'Timing ' + newest, `folded to "${r.pill}" (newest row ${newest})`)
    await pic(page, dir, 'folded')
    const pb = r.pillBox
    const under = await topAt(page, pb.x + pb.w / 2, pb.y + pb.h / 2)
    judge(id + '-pill-on-top', /timing-pill/.test(under || ''), `at the corner button's middle: ${under}`)
    await page.click('#timingRoot .timing-pill')
    r = await readout(page)
    judge(id + '-reopen', r.open, `reopened: ${r.open}`)
    /* drag by its bar */
    const bar = await page.evaluate(() => { const h = document.querySelector('#timingRoot .timingwin .win-bar'); const r = h.getBoundingClientRect(); return { x: r.left + 20, y: r.top + 8 } })
    await page.mouse.move(bar.x, bar.y); await page.mouse.down(); await page.mouse.move(bar.x - W * 0.4, bar.y - H * 0.3, { steps: 10 }); await page.mouse.up()
    const moved = await readout(page)
    judge(id + '-drag', moved.open && (Math.abs(moved.win.x - r.win.x) > 30 || Math.abs(moved.win.y - r.win.y) > 30), `window from ${r.win.x},${r.win.y} to ${moved.win.x},${moved.win.y}`)
    await pic(page, dir, 'dragged')
    if (id === 'W4-desk') {
      /* 32 more pages: the list keeps the newest 30 */
      for (let i = 0; i < 16; i++) for (const p of ['quals', 'logic']) { await openBy(page, p); await outsideTime(page, p) }
      await sleep(600)
      const rr = pageRows(await readout(page))
      judge(id + '-30', rr.length === 30 && rr[0].label === 'Logic', `rows kept ${rr.length}, newest "${rr[0]?.label}"`)
      const sc = await page.evaluate(() => { const b = document.querySelector('#timingRoot .timingwin .win-body, #timingRoot .timingwin .tm-body'); const s = b.closest('.win-body') || b; return { sh: s.scrollHeight, ch: s.clientHeight, ov: getComputedStyle(s).overflowY } })
      judge(id + '-scrolls', sc.sh > sc.ch && /auto|scroll/.test(sc.ov), `body ${sc.ch}px tall showing ${sc.sh}px, overflow ${sc.ov}`)
      await pic(page, dir, 'thirty-rows')
    }
  })
}

/* W6 — sign in, leave before the week is drawn, come back 30 s later */
await scen('W6', DESK, { cpu: 6 }, async ({ page, dir }) => {
  await page.goto(B + '/?timing'); await page.waitForSelector('#timingRoot > *', { timeout: 60000 })
  await page.fill('#luser', 'ad'); await page.fill('#lpass', 'a')
  /* the press and the tap on Inputs in one go, inside the page: the tap lands in the next task, before the week's
     second frame (the first run's script waited for the press to return, and the week was drawn by then) */
  const early = await page.evaluate(() => new Promise(res => {
    document.querySelector('#loginForm button[type=submit]').click()
    setTimeout(() => { const drawn = !!document.querySelector('#page-viewsched.on #vWeek .day'); document.querySelector('#topnav a[data-page="inputs"]').click(); res(drawn) }, 0)
  }))
  await sleep(30000)
  await openBy(page, 'viewsched'); await outsideTime(page, 'viewsched'); await sleep(800)
  const r = await readout(page)
  judge('W6', row(r, 'Sign in pressed → week shown').value === 'not yet', `the week's days in the page when Inputs was pressed (its two frames not yet run): ${early}; sign-in row "${row(r, 'Sign in pressed → week shown').value}"; pages ${pageRows(r).map(x => x.label + ' ' + x.value).join(', ')}`)
  await pic(page, dir, 'after-30s')
})

/* W7 — Retry's reopen lands on the Leave War */
await scen('W7', PHONE, {}, async ({ page, ctx, dir }) => {
  await page.route(/LeaveWarPage-[^/]*\.js/, r => r.abort('failed'))
  await page.goto(B + '/?timing'); await signIn(page); await weekUp(page)
  await page.click('#burger'); await page.click('#drawerNav a[data-page="leavewar"]')
  await page.waitForSelector('[data-testid="page-load-fail"]', { timeout: 30000 })
  await sleep(500)
  const atCard = pageRows(await readout(page))
  await pic(page, dir, 'the-card')
  await page.unroute(/LeaveWarPage-[^/]*\.js/)
  await page.click('[data-testid="page-load-retry"]')
  await page.waitForSelector('#luser', { state: 'visible', timeout: 30000 })
  const url = page.url()
  const h0 = srv.hits.length
  await signIn(page, 'ad', 'leavewar')
  const out = await outsideTime(page, 'leavewar')
  await sleep(800)
  await openWindow(page)   /* a phone: the window starts folded, and its rows are read open */
  let r = await readout(page)
  const lw = pageRows(r)[0]
  judge('W7-address', /\?timing/.test(url), `after Retry's reload: ${url.replace(B, '')}`)
  judge('W7-card-row', atCard.length === 0, `rows while the card showed: ${atCard.map(x => x.label + ' ' + x.value).join(', ') || 'none'}`)
  judge('W7-landing', lw && lw.label === 'Leave War' && Math.abs(secs(lw.value) * 1000 - out) <= Math.max(200, out * 0.15), `landing row "${lw ? lw.label + ', ' + lw.tag + ': ' + lw.value : 'none'}", outside ${out} ms; sign-in "${row(r, 'Sign in pressed → week shown').value}"`)
  /* chat 165, fault 4: the "downloaded" against what the SERVER sent whole for the Leave War's own files after the
     reload — none sent: no "downloaded" at all; some: about their size */
  const sent = srv.hits.slice(h0).filter(h => /LeaveWar[^/]*\.(js|css)$/.test(h.p) && h.st === 200).reduce((a, h) => a + h.n, 0)
  const dl = /downloaded (\d+) KB/.exec(lw ? lw.tag : '')
  judge('W7-downloaded', sent === 0 ? !dl : !!dl && Math.abs(Number(dl[1]) * 1024 - sent) <= Math.max(2048, sent * 0.1), `the server sent the Leave War's files whole: ${Math.round(sent / 1024)} KB; the row's tag "${lw ? lw.tag : 'none'}"`)
  await pic(page, dir, 'landed')
  await sleep(5000)
  await page.click('#burger'); await page.click('#drawerNav a[data-page="inputs"]'); await outsideTime(page, 'inputs')
  await page.click('#burger'); await page.click('#drawerNav a[data-page="leavewar"]'); await outsideTime(page, 'leavewar')
  await page.click('#burger'); await page.click('#drawerNav a[data-page="viewsched"]'); await outsideTime(page, 'viewsched')
  await sleep(800)
  r = await readout(page)
  const lw2 = pageRows(r).find((x, i) => x.label === 'Leave War' && i < 2)
  judge('W7-after', row(r, 'Sign in pressed → week shown').value === 'not yet' && lw2 && lw2.tag === 'opened before', `sign-in "${row(r, 'Sign in pressed → week shown').value}"; Leave War again "${lw2 ? lw2.tag : 'no row'}"`)
  await openWindow(page); await pic(page, dir, 'after')
})

/* W8 — the window's own file held 8 s; sign in and open two pages meanwhile; typing as it arrives */
await scen('W8', DESK, {}, async ({ page, dir }) => {
  let released = 0
  await page.route(/timingwindow-[^/]*\.(js|css)/, async r => { await sleep(8000); released = Date.now(); await r.continue() })
  const t0 = Date.now()
  await page.goto(B + '/?timing'); await signIn(page); const sOut = await outsideTime(page, 'viewsched')
  await openBy(page, 'editsched'); const eOut = await outsideTime(page, 'editsched')
  await openBy(page, 'inputs'); const iOut = await outsideTime(page, 'inputs')
  /* now type in a box as the window arrives: the Inputs page's search, or any text box on it */
  const box = await page.$('#page-inputs input[type="text"], #page-inputs input[type="search"], #page-inputs input:not([type])')
  if (box) await box.click()
  for (const ch of 'abcdefghij') { await page.keyboard.type(ch); await sleep(500) }
  await page.waitForSelector('#timingRoot .timingwin', { timeout: 30000 })
  for (const ch of 'klmno') { await page.keyboard.type(ch); await sleep(300) }
  const typed = box ? await box.inputValue() : null
  const r = await readout(page)
  const rows = pageRows(r)
  const ins = rows.find(x => x.label === 'Inputs'), ed = rows.find(x => x.label === 'Edit Schedule')
  const ok = n => Math.abs(n.r - n.o) <= Math.max(200, n.o * 0.15)
  judge('W8-figures', ins && ed && ok({ r: secs(ins.value) * 1000, o: iOut }) && ok({ r: secs(ed.value) * 1000, o: eOut }) && ok({ r: secs(row(r, 'Sign in pressed → week shown').value) * 1000, o: sOut }), `window file released ${((released - t0) / 1000).toFixed(1)} s after the start; sign-in ${row(r, 'Sign in pressed → week shown').value} (outside ${sOut}); Edit Schedule ${ed?.value} (${eOut}); Inputs ${ins?.value} (${iOut})`)
  judge('W8-caret', box ? typed === 'abcdefghijklmno' : null, box ? `typed into the Inputs page's box while the window arrived: "${typed}"` : 'no text box on the Inputs page to type in')
  await pic(page, dir, 'after')
})

/* W9 — typing at once on a computer, no click */
await scen('W9', DESK, {}, async ({ page }) => {
  await page.goto(B + '/?timing'); await page.waitForSelector('#timingRoot .timingwin', { timeout: 60000 })
  const caret = await page.evaluate(() => document.activeElement && document.activeElement.id)
  await page.keyboard.type('ad'); await page.keyboard.press('Tab'); await page.keyboard.type('a'); await page.keyboard.press('Enter')
  const inn = await page.waitForSelector('#vWeek .day', { state: 'attached', timeout: 20000 }).then(() => true, () => false)
  judge('W9', caret === 'luser' && inn, `caret at the start in #${caret}; signed in by keys alone: ${inn}`)
})

/* W10 — the Leave War fetched in the background, then Inputs first, then Leave War */
await scen('W10', DESK, {}, async ({ page, dir }) => {
  const asked = []
  page.on('request', q => { if (/LeaveWarPage/.test(q.url())) asked.push(Date.now()) })
  await page.goto(B + '/?timing'); await signIn(page); await outsideTime(page, 'viewsched')
  await sleep(4000)
  const pre = asked.length
  await openBy(page, 'inputs'); await outsideTime(page, 'inputs')
  await openBy(page, 'leavewar'); await outsideTime(page, 'leavewar')
  await sleep(600)
  const rows = pageRows(await readout(page))
  const ins = rows.find(x => x.label === 'Inputs'), lw = rows.find(x => x.label === 'Leave War')
  judge('W10-inputs', ins && ins.tag === 'first time', `the Leave War asked for in the background before Inputs: ${pre > 0}; Inputs "${ins?.tag}"`)
  judge('W10-leavewar', null, `Leave War after the background fetch: "${lw?.tag}: ${lw?.value}"`)
})

/* W11 — a page left before it is drawn; A→B→A at once; the page already open */
await scen('W11', PHONE, { cpu: 4 }, async ({ page, dir }) => {
  await page.goto(B + '/?timing'); await signIn(page); await outsideTime(page, 'viewsched')
  await openWindow(page)   /* a phone: the window starts folded, and its rows are read open */
  await page.route(/LeaveWarPage-[^/]*\.js/, async r => { await sleep(4000); await r.continue() })
  await page.click('#burger'); await page.click('#drawerNav a[data-page="leavewar"]')
  await page.waitForSelector('.pgclaw:not(.gone)', { timeout: 10000 }).catch(() => {})
  await pic(page, dir, 'claw-up')
  await openBy(page, 'quals', 'drawer'); const qOut = await outsideTime(page, 'quals')
  await sleep(6000)
  let rows = pageRows(await readout(page))
  judge('W11-left', rows.length === 1 && rows[0].label === 'Quals' && Math.abs(secs(rows[0].value) * 1000 - qOut) <= Math.max(200, qOut * 0.15), `rows: ${rows.map(x => x.label + ' ' + x.tag + ' ' + x.value).join(' | ')} (Quals outside ${qOut})`)
  await openBy(page, 'leavewar', 'drawer'); await outsideTime(page, 'leavewar'); await sleep(500)
  rows = pageRows(await readout(page))
  judge('W11-later', null, `the Leave War opened later: "${rows[0].label}, ${rows[0].tag}: ${rows[0].value}"`)
  const n = rows.length
  await page.click('#burger'); await page.click('#drawerNav a[data-page="inputs"]')
  await page.click('#burger'); await page.click('#drawerNav a[data-page="logic"]')
  await page.click('#burger'); await page.click('#drawerNav a[data-page="inputs"]')
  await armOutside(page, 'inputs'); await sleep(3000)
  rows = pageRows(await readout(page))
  judge('W11-abA', null, `A→B→A at once added ${rows.length - n} rows: ${rows.slice(0, rows.length - n).map(x => x.label + ' ' + x.tag + ' ' + x.value).join(' | ')}`)
  const m = rows.length
  await page.click('#burger'); await page.click('#drawerNav a[data-page="inputs"]'); await sleep(1500)
  rows = pageRows(await readout(page))
  judge('W11-same', rows.length === m, `the page already open, tapped: rows ${m} → ${rows.length}`)
})

/* W12 — a failed download: the card, Retry with the file still refused, the window over the card */
await scen('W12', DESK, {}, async ({ page, dir }) => {
  await page.route(/LeaveWarPage-[^/]*\.js/, r => r.abort('failed'))
  await page.goto(B + '/?timing'); await signIn(page); await outsideTime(page, 'viewsched')
  await page.click('#topnav a[data-page="leavewar"]')
  await page.waitForSelector('[data-testid="page-load-fail"]', { timeout: 30000 }); await sleep(800)
  const rows = pageRows(await readout(page))
  await pic(page, dir, 'card-with-window')
  const rb = await page.locator('[data-testid="page-load-retry"]').boundingBox()
  const under = await topAt(page, rb.x + rb.width / 2, rb.y + rb.height / 2)
  judge('W12-card', rows.length === 0, `rows for the card: ${rows.map(x => x.label + ' ' + x.value).join(', ') || 'none'}`)
  judge('W12-retry-free', /page-load-retry|pgfail-retry/.test(under || ''), `at Retry's middle: ${under}`)
  await page.click('[data-testid="page-load-retry"]')
  await page.waitForSelector('[data-testid="page-load-fail"]', { timeout: 40000 })
  await sleep(800)
  const r2 = await readout(page)
  judge('W12-retry-again', pageRows(r2).length === 0 && r2.open, `after Retry with the file still refused: rows ${pageRows(r2).length}, window open ${r2.open}`)
  await page.click('#timingRoot .timingwin .win-tools button')
  await pic(page, dir, 'card-again')
})

/* W13 — sign out with a save waiting, 30 s, sign in again */
await scen('W13', DESK, {}, async ({ page, dir }) => {
  await page.goto(B + '/?savefail&timing'); await signIn(page); await outsideTime(page, 'viewsched')
  await openBy(page, 'editsched'); await outsideTime(page, 'editsched')
  const band = await page.waitForSelector('.topbar > .savestat.failed, .saveband', { timeout: 10000 }).then(() => true, () => false)
  await openBy(page, 'inputs'); await outsideTime(page, 'inputs')
  await page.evaluate(() => { window.__sameDoc = true })   /* gone if the sign-out reloads the page */
  await page.click('#logout')
  await page.waitForSelector('#luser', { state: 'visible', timeout: 20000 })
  const reloaded = await page.evaluate(() => !window.__sameDoc)
  await pic(page, dir, 'signed-out-band-up')
  const bandBtn = await page.$('.saveband button, .savestat.failed button')
  let free = null
  if (bandBtn) { const b = await bandBtn.boundingBox(); free = await topAt(page, b.x + b.width / 2, b.y + b.height / 2) }
  await sleep(30000)
  const before = pageRows(await readout(page)).length
  await signIn(page); const sOut = await outsideTime(page, 'viewsched'); await sleep(800)
  const r = await readout(page)
  const added = pageRows(r).slice(0, pageRows(r).length - before)
  judge('W13', band && !reloaded && added.every(x => secs(x.value) < 20) && Math.abs(secs(row(r, 'Sign in pressed → week shown').value) * 1000 - sOut) <= Math.max(200, sOut * 0.15), `band up ${band}; page reloaded ${reloaded}; rows added by the sign-in: ${added.map(x => x.label + ' ' + x.value).join(', ') || 'none'}; sign-in ${row(r, 'Sign in pressed → week shown').value} (outside ${sOut})`)
  judge('W13-band-free', bandBtn ? /saveband|savestat|BUTTON/.test(free || '') && !/timing/.test(free || '') : null, `at the band's Retry: ${free}`)
  await pic(page, dir, 'signed-in-again')
})

/* W14 — kept files: a cleared first visit, a reload, a new tab */
await scen('W14', DESK, {}, async ({ page, ctx, dir }) => {
  const filesRow = async p => { const r = await readout(p); return [row(r, 'App files used').value, row(r, 'Kept from an earlier visit').value] }
  /* the judge (chat 165): the SERVER's own answers during that load — a file it sent whole (200) was downloaded; every
     other app file the page used was kept (told "unchanged" — 304 — or not asked at all). Chat 164's judge counted from
     the browser's list the old way, which is the very counting the fix changed. */
  const panel = async (p, h0) => {
    const n = await p.evaluate(() => performance.getEntriesByType('resource').filter(e => /\.(js|css)$/.test(new URL(e.name).pathname) && !/timingwindow|TimingReadout/i.test(e.name)).length)
    const sent = srv.hits.slice(h0).filter(h => /\.(js|css)$/.test(h.p) && !/timingwindow|TimingReadout/i.test(h.p) && h.st === 200).length
    return { n, kept: n - sent }
  }
  let h0 = srv.hits.length
  await page.goto(B + '/?timing'); await page.waitForSelector('#timingRoot .timingwin', { timeout: 60000 }); await sleep(1200)
  const a = await filesRow(page), ap = await panel(page, h0)
  h0 = srv.hits.length
  await page.reload(); await page.waitForSelector('#timingRoot .timingwin', { timeout: 60000 }); await sleep(1200)
  const b = await filesRow(page), bp = await panel(page, h0)
  h0 = srv.hits.length
  const p2 = await ctx.newPage(); await p2.goto(B + '/?timing'); await p2.waitForSelector('#timingRoot .timingwin', { timeout: 60000 }); await sleep(1200)
  const c = await filesRow(p2), cp = await panel(p2, h0)
  judge('W14-first', /^0 of /.test(a[1]) && a[1] === `${ap.kept} of ${ap.n}`, `cleared first visit: "${a[0]}", kept "${a[1]}" (the browser's own: ${ap.kept} of ${ap.n})`)
  judge('W14-reload', b[1] === `${bp.kept} of ${bp.n}`, `reload: "${b[0]}", kept "${b[1]}" (browser: ${bp.kept} of ${bp.n})`)
  judge('W14-newtab', c[1] === `${cp.kept} of ${cp.n}`, `new tab: "${c[0]}", kept "${c[1]}" (browser: ${cp.kept} of ${cp.n})`)
  await p2.close()
})

/* W15 — WebKit: every row and Copy all */
if (on('W15')) {
  const wk = await browserOf('webkit')
  const { ctx, page } = await fresh(wk, DESK)
  await page.goto(B + '/?timing'); await page.waitForSelector('#timingRoot .timingwin', { timeout: 60000 })
  await signIn(page); await page.waitForSelector('#vWeek .day', { state: 'attached', timeout: 60000 })
  await page.click('#topnav a[data-page="inputs"]'); await sleep(2000)
  const r = await readout(page)
  const bad = r.rows.filter(x => !x.value || /undefined|NaN|null|^0$|^0 KB| 0 KB/.test(x.value + ' ' + x.tag))
  judge('W15-rows', bad.length === 0, r.rows.map(x => `${x.label}${x.tag ? ' (' + x.tag + ')' : ''} = ${x.value}`).join(' · '))
  const dir = shotDir('W15'); await pic(page, dir, 'webkit')
  await ctx.close(); await wk.close()
}

/* W16 — his 125% display, and a phone: Copy all's display lines */
if (on('W16')) {
  /* a browser STARTED at 125% (the guide's §7), its window's size its own — a set viewport would put the scale back to 1 */
  for (const [id, launch, size] of [['W16-125', { args: ['--force-device-scale-factor=1.25', '--window-size=1536,860'] }, { viewport: null }], ['W16-phone', {}, PHONE]]) {
    const b = await chromium.launch({ headless: true, ...launch })
    const ctx = await b.newContext({ ...size }); const page = await ctx.newPage()
    await ctx.grantPermissions(['clipboard-read', 'clipboard-write'], { origin: B })
    await page.goto(B + '/?timing'); await page.waitForSelector('#timingRoot > *', { timeout: 60000 })
    await openWindow(page)
    await page.click('#timingRoot .timingwin .win-tools button'); await sleep(300)
    const t = await page.evaluate(() => navigator.clipboard.readText())
    const dpr = await page.evaluate(() => devicePixelRatio)
    const lines = t.split('\n').filter(l => /Display scale|Screen in its own|Screen · browser|Browser window|zoom/i.test(l))
    judge(id, !/zoom\b(?! together)/.test(lines.join(' ').replace(/the browser's zoom/g, '')) && lines.some(l => l.includes('Display scale: ' + Math.round(dpr * 100) + '%')), `devicePixelRatio ${dpr}: ${lines.map(l => l.trim()).join(' / ')}`)
    await b.close()
  }
}

/* W17 — a wrong password; the ask-for-access screen; then a good sign-in */
await scen('W17', DESK, {}, async ({ page, dir }) => {
  await page.goto(B + '/?timing'); await page.waitForSelector('#timingRoot .timingwin', { timeout: 60000 })
  await page.fill('#luser', 'ad'); await page.fill('#lpass', 'wrong'); await page.click('#loginForm button[type=submit]'); await sleep(1500)
  let r = await readout(page)
  judge('W17-bad', row(r, 'Sign in pressed → week shown').value === 'not yet' && pageRows(r).length === 0, `after a wrong password: sign-in "${row(r, 'Sign in pressed → week shown').value}", rows ${pageRows(r).length}`)
  await page.fill('#luser', 'kite'); await page.fill('#lpass', 'x'); await page.click('#loginForm button[type=submit]')
  await page.waitForSelector('#accCs, #accOut', { timeout: 10000 }); await sleep(2000)
  r = await readout(page)
  await pic(page, dir, 'access-screen')
  const ob = await page.locator('#accOut').boundingBox()
  const under = ob ? await topAt(page, ob.x + ob.width / 2, ob.y + ob.height / 2) : null
  judge('W17-access', row(r, 'Sign in pressed → week shown').value === 'not yet' && r.open, `on the ask-for-access screen: sign-in "${row(r, 'Sign in pressed → week shown').value}", window open ${r.open}; at Sign out's middle: ${under}`)
  await page.click('#accOut'); await page.waitForSelector('#luser', { state: 'visible', timeout: 20000 })
  await signIn(page); const out = await outsideTime(page, 'viewsched'); await sleep(800)
  r = await readout(page)
  judge('W17-good', Math.abs(secs(row(r, 'Sign in pressed → week shown').value) * 1000 - out) <= Math.max(200, out * 0.15), `the good sign-in: "${row(r, 'Sign in pressed → week shown').value}", outside ${out} ms`)
})

/* W22 — Copy all: pasted; refused; again after a new page */
await scen('W22', DESK, {}, async ({ page, ctx, dir }) => {
  await ctx.grantPermissions(['clipboard-read', 'clipboard-write'], { origin: B })
  await page.goto(B + '/?timing'); await signIn(page); await outsideTime(page, 'viewsched')
  await openBy(page, 'inputs'); await outsideTime(page, 'inputs'); await sleep(500)
  const btn = '#timingRoot .timingwin .win-tools button'
  await page.click(btn)
  /* chat 167: the copy answers a moment after the press — wait for the button's answer (up to 2 s, its own "Copied"
     span), never read it at once (a busy computer read "Copy all" before the copy came back) */
  await page.waitForFunction(b => /Copied/.test(document.querySelector(b)?.textContent || ''), btn, { timeout: 1900 }).catch(() => {})
  const label1 = await page.textContent(btn)
  const t1 = await page.evaluate(() => navigator.clipboard.readText())
  const r = await readout(page)
  const everyRow = r.rows.every(x => t1.includes(`  ${x.label}${x.tag ? ', ' + x.tag : ''}: ${x.value}`))
  judge('W22-paste', label1 === 'Copied' && everyRow && /TALON timing, \d+ \w{3} \d\d \d\d:\d\d, this computer's clock/.test(t1), `button "${label1}"; every row of the window in the paste: ${everyRow}; first line "${t1.split('\n')[0]}"`)
  await sleep(2300)
  const label2 = await page.textContent(btn)
  judge('W22-back', label2 === 'Copy all', `after two seconds: "${label2}"`)
  await openBy(page, 'quals'); await outsideTime(page, 'quals'); await sleep(500)
  await page.click(btn); await sleep(200)
  const t2 = await page.evaluate(() => navigator.clipboard.readText())
  judge('W22-fresh', /Quals, first time/.test(t2), `the second copy holds the new page: ${/Quals, first time/.test(t2)}`)
  /* refused both ways: the clipboard refused and the older way returning false */
  await page.evaluate(() => { navigator.clipboard.writeText = () => Promise.reject(new Error('refused')); document.execCommand = () => false })
  await page.evaluate(() => navigator.clipboard.writeText === undefined)
  await sleep(2300)
  const focusBefore = await page.evaluate(() => document.activeElement && (document.activeElement.id || document.activeElement.tagName))
  await page.click(btn); await sleep(400)
  const label3 = await page.textContent(btn)
  const focusAfter = await page.evaluate(() => document.activeElement && (document.activeElement.id || document.activeElement.className))
  judge('W22-refused', label3 === 'Copy all', `refused both ways: the button reads "${label3}" (keyboard before ${focusBefore}, after ${focusAfter})`)
  await pic(page, dir, 'refused')
  /* his look (D2485, option C, chat 167): the refused copy says so under the title, drawn in sight, until the next press */
  const said = await page.evaluate(() => { const e = document.querySelector('#timingRoot .win-ttl .tm-refused'); if (!e) return null; const r = e.getBoundingClientRect(); const at = document.elementFromPoint(r.left + 4, r.top + r.height / 2); return { text: e.textContent, seen: r.width > 0 && !!at && e.contains(at), color: getComputedStyle(e).color } })
  const wb = (await readout(page)).win
  await pic(page, dir, 'refused-line', { x: wb.x, y: wb.y, width: wb.w, height: 140 })
  await page.evaluate(() => { navigator.clipboard.writeText = () => Promise.resolve() })
  await page.click(btn); await sleep(400)
  const after = await page.evaluate(() => !!document.querySelector('#timingRoot .win-ttl .tm-refused'))
  judge('W22-refused-line', !!said && said.text === 'Not copied. Press again, or select the rows and copy them by hand.' && said.seen && !after && (await page.textContent(btn)) === 'Copied',
    `the line under the title: "${said?.text}", drawn in sight ${said?.seen}, colour ${said?.color}; after a good copy: line gone ${!after}, button "${await page.textContent(btn)}"`)
})

/* W24 — a hidden tab. Chat 164's run in the headless browser never hid the tab (it went "never hidden"); chat 165 walks
   it in a REAL browser window, placed off the screen, where a tab behind another is hidden as on his desktop.
   Chat 167: that never hid it either — Playwright keeps every page it drives "visible". W24 is walked by
   timing-walk-w24.mjs (a plainly started Chromium, driven only through its developer port); this step stays for the
   record and is not run. */
if (on('W24')) notWalked('W24', 'walked by timing-walk-w24.mjs — Playwright keeps every page visible (chat 167)')
if (false) {
  const b = await chromium.launch({ headless: false, args: ['--window-position=-3200,0', '--window-size=1366,850'] })
  const ctx = await b.newContext({ ...DESK }); await ctx.addInitScript(() => { window.__vis = []; document.addEventListener('visibilitychange', () => window.__vis.push(document.visibilityState)) })
  await ctx.addInitScript(PRESS)
  const page = await ctx.newPage(); const errs = []; page.on('pageerror', e => errs.push(String(e)))
  await page.goto(B + '/?timing'); await signIn(page)
  await page.waitForSelector('#vWeek .day', { state: 'attached', timeout: 60000 }); await sleep(800)
  const n = pageRows(await readout(page)).length
  await page.click('#topnav a[data-page="editsched"]')
  const other = await ctx.newPage(); await other.goto('about:blank'); await other.bringToFront()
  await sleep(30000)
  await page.bringToFront(); await sleep(2500)
  const vis = await page.evaluate(() => window.__vis)
  const rows = pageRows(await readout(page))
  const added = rows.slice(0, rows.length - n)
  judge('W24-hidden', vis.includes('hidden') ? added.every(x => secs(x.value) < 5) : null, `the tab went ${vis.join(' → ') || 'never hidden'}; rows added: ${added.map(x => x.label + ' ' + x.value).join(', ') || 'none'}`)
  /* ?timing loaded in a tab behind another */
  const bg = await ctx.newPage(); await page.bringToFront()
  await bg.goto(B + '/?timing'); await sleep(30000); await bg.bringToFront(); await sleep(3000)
  const rb = await readout(bg)
  /* chat 165, fault 6: loaded behind another tab, the app's load and the first screen give no figure — Fable's words */
  const bgVis = await bg.evaluate(() => window.__vis)
  judge('W24-background-load', row(rb, 'App loaded')?.value === 'not timed, tab not in front' && row(rb, 'Sign-in shown')?.value === 'not timed, tab not in front' && /^at /.test(row(rb, 'Site answered')?.value || ''), `the tab went ${bgVis.join(' → ') || '(no change seen)'}; loaded behind another tab: ${rb.rows.slice(0, 3).map(x => x.label + ' ' + x.value).join(' · ')}`)
  await pic(bg, shotDir('W24'), 'background-load')
  await b.close()
}

/* W25 — the figures follow without a page change */
await scen('W25', DESK, {}, async ({ page }) => {
  await page.goto(B + '/?timing'); await signIn(page); await outsideTime(page, 'viewsched'); await sleep(1500)
  const f0 = row(await readout(page), 'Brief freezes').value
  await page.evaluate(() => { const t = performance.now(); while (performance.now() - t < 300) {} })
  await sleep(1200)
  const f1 = row(await readout(page), 'Brief freezes').value
  judge('W25-freezes', f0 !== f1, `before a 0.3 s stall "${f0}", 1.2 s after it "${f1}"`)
  const a0 = row(await readout(page), 'App files used').value
  await page.evaluate(() => import(document.querySelector('script[type=module]').src + '?again=1').catch(() => {}))
  await sleep(1500)
  const a1 = row(await readout(page), 'App files used').value
  judge('W25-files', null, `a file arriving with no page change: "${a0}" → "${a1}"`)
})

saveResults('walk-part2' + (ONLY ? '-' + ONLY.join('_') : ''))
await cr.close(); await srv.close()
