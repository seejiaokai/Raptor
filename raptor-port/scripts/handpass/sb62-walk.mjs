// Chat 62: the walk of the three small schedule-and-board fixes. A PASS means the screen is right. Version: sb62-walk v1
// From raptor-port/:  WALK_DIR=dist SB61_OUT=docs/img/handpass/2026-11-10-sched-board-small/walk node scripts/handpass/sb62-walk.mjs
console.log('sb62-walk v1')
const { world, goPage, sleep, vis, shot, ok, note, openBoard, finish, PC, PHONE } = await import('./sb61-lib.mjs')
const ONLY = (process.env.ONLY || '').split(',').filter(Boolean)
const want = id => !ONLY.length || ONLY.includes(id)
const SIZES = [['pc', { size: PC }], ['phone', { size: PHONE, phone: true, dpr: 2 }]]
const clipOf = (b, pad, size) => ({ x: Math.max(0, b.l - pad), y: Math.max(0, b.t - pad), width: Math.min(size.width, b.r - b.l + 2 * pad), height: Math.min(size.height - Math.max(0, b.t - pad), b.b - b.t + 2 * pad) })
// every drawn issues bar's words inside `root`
const bars = (page, root) => page.evaluate(root => [...document.querySelectorAll(root + ' .daywarn')].filter(e => e.getBoundingClientRect().width > 0).map(e => e.textContent.replace(/[▲▼]/g, '').trim()), root)
// "N warning(s)" agrees with N on every bar that counts warnings
const plural = list => list.filter(t => /\d+ warning/.test(t)).every(t => { const m = t.match(/(\d+) (warnings?)(?![a-z])/); return m && (m[2] === 'warnings') === (+m[1] > 1) })

for (const [name, opts] of SIZES) {
  // W1 — the week's issues bar, on Edit Schedule and View-only Sched
  if (want('w1')) {
    const { ctx, page, errors } = await world(opts)
    const e = await bars(page, '#eWeek')
    ok(`W1 ${name} Edit Schedule: every issues bar's "warnings" agrees with its count`, e.some(t => /\d+ warning/.test(t)) && plural(e), JSON.stringify(e))
    const b = await vis(page, '#eWeek .daywarn')
    if (b) await shot(page, `w1-${name}-edit-bar`, { clip: clipOf(b, 40, opts.size) })
    await shot(page, `w1-${name}-edit-screen`)
    await goPage(page, 'viewsched')
    const v = await bars(page, '#vWeek')
    ok(`W1 ${name} View-only Sched: the same`, v.length ? plural(v) : null, JSON.stringify(v))
    if (v.length) await shot(page, `w1-${name}-view-screen`)
    ok(`W1 ${name} no page errors`, !errors.length, errors.join(' | ') || 'none')
    await ctx.close()
  }

  // W2 — the changes window's foot: nothing to tap, then a line that can be tapped
  if (want('w2')) {
    const { ctx, page, errors } = await world(opts)
    const foot = () => page.evaluate(() => { const w = document.querySelector('.chgwin:not([hidden])'); if (!w) return null; const f = w.querySelector('.cw-foot'); return { foot: f ? f.textContent.trim() : null, taps: w.querySelectorAll('button.cw-l').length, none: (w.querySelector('.cw-none') || {}).textContent || '', says: /Tap a change/.test(w.textContent) } })
    const hist = page.locator('#histBtn:visible').first()
    if (await hist.count()) {
      await hist.click(); await sleep(900)
      await page.locator('.chgwin .win-tab', { hasText: 'All changes' }).click(); await sleep(400)
      const f0 = await foot()
      ok(`W2 ${name} an untouched week: "No changes this week yet." with no "Tap a change" under it, and no empty band`, !!f0 && !f0.says && f0.foot === null && /No changes/.test(f0.none), JSON.stringify(f0))
      const w0 = await vis(page, '.chgwin:not([hidden])'); if (w0) await shot(page, `w2-${name}-empty`, { clip: clipOf(w0, 12, opts.size) })
      await page.locator('.chgwin .win-x').click(); await sleep(400)
    } else ok(`W2 ${name} the changes clock on Edit Schedule`, null, 'no #histBtn drawn at this size')
    // a real change on the board, then the window from the board's History
    await openBoard(page, 0)
    const box = page.locator('#sbBoard .sb-line .nts:visible').first()
    await box.click(); await page.keyboard.press('End'); await page.keyboard.type(' w2'); await page.keyboard.press('Enter'); await sleep(700)
    const hb = page.locator('#sbHist:visible').first()
    if (await hb.count()) {
      await hb.click(); await sleep(900)
      await page.locator('.chgwin .win-tab', { hasText: 'All changes' }).click(); await sleep(400)
      const f1 = await foot()
      ok(`W2 ${name} a change that can be tapped: the foot says "Tap a change to go to it — the window stays open."`, !!f1 && f1.taps > 0 && f1.foot === 'Tap a change to go to it — the window stays open.', JSON.stringify(f1))
      const w1 = await vis(page, '.chgwin:not([hidden])'); if (w1) await shot(page, `w2-${name}-with-line`, { clip: clipOf(w1, 12, opts.size) })
      // fold the group if there is one: the hint follows what is drawn
      const gh = page.locator('.chgwin .cw-gh[aria-expanded="true"]')
      if (await gh.count()) { await gh.first().click(); await sleep(300); const f2 = await foot(); ok(`W2 ${name} its group folded: the hint follows what is drawn`, f2.says === (f2.taps > 0), JSON.stringify(f2)) }
      // the tap still goes to the change and the window stays
      const line = page.locator('.chgwin button.cw-l').first()
      if (await line.count()) { await line.click(); await sleep(900); ok(`W2 ${name} a tap on the line: the window stays open`, !!(await vis(page, '.chgwin:not([hidden])')), 'window drawn after the tap') }
    } else ok(`W2 ${name} the board's History button`, null, 'no #sbHist drawn at this size')
    ok(`W2 ${name} no page errors`, !errors.length, errors.join(' | ') || 'none')
    await ctx.close()
  }

  // W3 — the board: Undo of a change scrolled out of view, the same day; then Redo in view
  if (want('w3')) {
    const { ctx, page, errors } = await world(opts)
    await openBoard(page, 0)
    await page.evaluate(() => { let s = [...document.querySelectorAll('#sbBoard .sb-line .nts')].find(e => e.getBoundingClientRect().width > 0).parentElement; while (s && !(s.scrollHeight > s.clientHeight + 4 && /auto|scroll/.test(getComputedStyle(s).overflowY))) s = s.parentElement; window.__sc = s || document.scrollingElement })
    const read = () => page.evaluate(() => { const el = [...document.querySelectorAll('#sbBoard .sb-line .nts')].find(e => e.getBoundingClientRect().width > 0); const r = el.getBoundingClientRect(); const sc = window.__sc; const v = sc === document.scrollingElement ? { top: 0, bottom: innerHeight } : sc.getBoundingClientRect(); const bar = document.querySelector('#schedBoard .sb-top').getBoundingClientRect(); const top = Math.max(v.top, bar.top <= 1 ? bar.bottom : 0), bottom = Math.min(v.bottom, innerHeight); const hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return { t: Math.round(r.top), b: Math.round(r.bottom), l: Math.round(r.left), r: Math.round(r.right), top: Math.round(top), bottom: Math.round(bottom), inView: r.top >= top - 0.5 && r.bottom <= bottom + 0.5, onTop: !!hit && (hit === el || el.contains(hit)), value: el.value, scroll: Math.round(sc.scrollTop) } })
    const box = page.locator('#sbBoard .sb-line .nts:visible').first()
    await box.click(); await page.keyboard.press('End'); await page.keyboard.type(' u1'); await page.keyboard.press('Enter'); await sleep(700)
    await page.evaluate(() => { window.__sc.scrollTop = window.__sc.scrollHeight }); await sleep(600)
    const out = await read()
    await shot(page, `w3-${name}-1-before-undo`)
    const undoSel = (await page.locator('#sbUndo:visible').count()) ? '#sbUndo:visible' : '#undoBtn:visible'
    await page.locator(undoSel).first().click()
    await page.screenshot({ path: (await import('node:path')).resolve((await import('./sb61-lib.mjs')).OUT, `w3-${name}-2-just-after-undo.png`) })
    await sleep(1400)
    const back = await read()
    ok(`W3 ${name} Undo of a remark scrolled out of view: it is brought just under the board's bar`, !out.inView && back.inView && back.onTop && !/u1/.test(back.value) && back.t - back.top < 40, `before: box ${out.t}–${out.b}, list ${out.top}–${out.bottom}, scrolled ${out.scroll}; after: box ${back.t}–${back.b}, scrolled ${back.scroll}, remark "${back.value}"`)
    await shot(page, `w3-${name}-3-after-undo`)
    const redoSel = undoSel.replace('Undo', 'Redo').replace('undo', 'redo')
    await page.locator(redoSel).first().click(); await sleep(1200)
    const re = await read()
    ok(`W3 ${name} Redo with the remark in view: the words are back and the board has not moved`, /u1/.test(re.value) && re.scroll === back.scroll, `scrolled ${back.scroll} then ${re.scroll}; remark "${re.value}"`)
    await shot(page, `w3-${name}-4-after-redo`)
    // another day's change: Undo from Tuesday's board goes to Monday and shows the box
    await page.evaluate(() => { window.__sc.scrollTop = window.__sc.scrollHeight }); await sleep(400)
    const tue = page.locator('#schedBoard [data-sbtab="1"]:visible, #schedBoard [data-sbday="1"]:visible').first()
    if (await tue.count()) {
      await tue.click(); await sleep(900)
      await page.locator(undoSel).first().click(); await sleep(1600)
      const b2 = await read()
      ok(`W3 ${name} Undo from Tuesday's board: Monday comes up with the changed remark in view`, b2.inView && !/u1/.test(b2.value), `box ${b2.t}–${b2.b}, list ${b2.top}–${b2.bottom}, remark "${b2.value}"`)
      await shot(page, `w3-${name}-5-undo-from-tuesday`)
    } else ok(`W3 ${name} Undo from another day's board`, null, 'no day tab found to press')
    ok(`W3 ${name} no page errors`, !errors.length, errors.join(' | ') || 'none')
    await ctx.close()
  }
}
finish('walk.json')
process.exit(0)
