// Walker b — B12 (the plain-user round, on the week): Ranger's row typed (0900, 1100, "own hours"); the leave's window
// opened from its name (LL) and closed by EACH of its ways (Cancel, ✕, Escape, a press outside); the top bar's Undo once;
// then the Inputs page's day, the Board, the admin's bell. RECORD what each shows; every way of closing closes that
// window and nothing else.
console.log('shr-b-b12 v1')
const SZ = process.env.SZ || 'desk', ENG = process.env.ENG || 'chromium', cfg = `${SZ} ${ENG}`
const B = await (await import('./shr-b-lib.mjs')).setup(`b12-${SZ}-${ENG}`)
const { start, fileInput, go, sleep, log, weekRows, weekCell, typeIn, pic, J, judge, showDay, store, boardRows, openDay, openBell, bellClip, shot, shownToast } = B
const c = 'B12', P = `b12-${SZ}-${ENG}`
let w
const out = { closes: [] }
const winOpen = () => w.page.evaluate(() => { const e = document.getElementById('inpEditPop'); return !!(e && !e.hidden && e.getBoundingClientRect().width > 2) })
const label = di => w.page.evaluate(di => { const p = [...document.querySelectorAll(`#eWeek .day[data-day="${di}"] .sec-unav .puck[data-person="bane"]`)].find(x => x.getBoundingClientRect().width > 1); const b = p && p.closest('.pl-row')?.querySelector('[data-inpedit]'); if (!b) return null; b.setAttribute('data-shrb12', '1'); return b.outerHTML.slice(0, 200) }, di)
try {
  w = await start(SZ, ENG)
  const iid = await fileInput(w, c, B.WED, { type: 'LL', people: [B.RANGER, B.HEX], from: '08:00', to: '10:00' })
  await go(w.page, 'editsched'); await sleep(600)
  const di = await w.page.evaluate(() => window.DAYS.findIndex(x => x.dt === 'Jul 15')); await showDay(w.page, di)
  for (const [f, v] of [['str', '0900'], ['end', '1100'], ['rmks', 'own hours']]) { await typeIn(w, await weekCell(w.page, di, 'bane', f), v); await w.page.keyboard.press('Tab'); await sleep(600) }
  await w.page.mouse.click(3, 120); await sleep(700)
  out.typed = { store: await store(w.page), rows: (await weekRows(w.page, di)).filter(r => /^(Ranger|Hex) /.test(r)) }
  log(c, 'typed ' + J(out.typed))
  const pics = [await pic(w, c, `${P}-0-typed`, [`#eWeek .day[data-day="${di}"] .sec-unav`], out.typed.rows)]
  for (const way of ['Cancel', 'X', 'Escape', 'outside']) {
    const lb = await label(di)
    const st0 = await store(w.page), pg0 = await w.page.evaluate(() => window.CURPAGE), y0 = await w.page.evaluate(() => scrollY)
    await w.page.locator('[data-shrb12="1"]').first().click(); await sleep(700)
    const opened = await winOpen()
    const title = opened ? await w.page.evaluate(() => (document.getElementById('inpEditTitle')?.textContent || '').trim()) : null
    const vals = opened ? await w.page.evaluate(() => ({ start: document.getElementById('inpEditStart')?.value, end: document.getElementById('inpEditEnd')?.value, rmk: document.getElementById('inpEditRmk')?.value })) : null
    if (opened) pics.push(await pic(w, c, `${P}-1-open-${way}`, ['#inpEditPop'], { title, vals }, { noScroll: true }))
    let pressed = way
    if (way === 'Cancel') await w.page.locator('#inpEditPop #inpEditCancel').click()
    else if (way === 'X') await w.page.locator('#inpEditPop #inpEditClose').click()
    else if (way === 'Escape') await w.page.keyboard.press('Escape')
    else {
      /* a press outside the window: a point on the page left of it, measured */
      const box = await w.page.locator('#inpEditPop').boundingBox()
      const x = box && box.x > 60 ? Math.round(box.x / 2) : 20, y = 450
      pressed = `outside at ${x},${y} on ${await w.page.evaluate(([x, y]) => { const e = document.elementFromPoint(x, y); return e ? e.tagName + '.' + String(e.className).slice(0, 40) : null }, [x, y])}`
      await w.page.mouse.click(x, y)
    }
    await sleep(600)
    const after = { closed: !(await winOpen()), escAsk: await w.page.locator('[data-testid="inped-escask"]:visible').count(), store: await store(w.page), page: await w.page.evaluate(() => window.CURPAGE), board: await w.page.locator('#schedBoard:visible').count(), otherWins: await w.page.evaluate(() => [...document.querySelectorAll('.floatwin, .chgwin, .availwin, [role="dialog"]')].filter(e => !e.hidden && e.getBoundingClientRect().width > 2).map(e => e.className.slice(0, 40))), note: await shownToast(w.page), scrollMoved: (await w.page.evaluate(() => scrollY)) !== y0 }
    out.closes.push({ way, pressed, label: lb, opened, title, vals, after, storeSame: J(st0) === J(after.store), pageSame: pg0 === after.page })
    pics.push(await pic(w, c, `${P}-2-closed-${way}`, [`#eWeek .day[data-day="${di}"] .sec-unav`], after, { noScroll: true }))
    log(c, `close by ${way}: ${J(out.closes.at(-1))}`)
    if (!after.closed) { await w.page.locator('#inpEditPop #inpEditCancel').click().catch(() => {}); await sleep(400) }
  }
  /* the top bar's Undo, once */
  const u = w.page.locator('#undoBtn:visible').first(); out.undoTitle = await u.getAttribute('title'); await u.click(); await sleep(800)
  out.afterUndo = { store: await store(w.page), rows: (await weekRows(w.page, di)).filter(r => /^(Ranger|Hex) /.test(r)), note: await shownToast(w.page) }
  pics.push(await pic(w, c, `${P}-3-after-undo`, [`#eWeek .day[data-day="${di}"] .sec-unav`], out.afterUndo))
  log(c, 'undo: ' + out.undoTitle + ' ' + J(out.afterUndo))
  /* the Inputs page's day */
  await openDay(w, B.WED)
  out.inputs = await w.page.evaluate(() => [...document.querySelectorAll('[data-testid="win-inputsday"] [data-iid], [data-testid="win-inputsday"] [data-popiid]')].filter(e => e.getBoundingClientRect().width > 2 && /Ranger|Hex/.test(e.textContent || '')).map(e => (e.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 140)))
  pics.push(await pic(w, c, `${P}-4-inputs-day`, ['[data-testid="win-inputsday"]'], out.inputs, { noScroll: true }))
  if (await w.page.locator('[data-testid="win-inputsday-x"]').count()) await w.page.locator('[data-testid="win-inputsday-x"]').click()
  /* the Board */
  await go(w.page, 'editsched'); await w.page.evaluate(i => window.openScheduler(i), di); await w.page.waitForSelector('#schedBoard'); await sleep(900)
  out.board = await boardRows(w.page)
  pics.push(await pic(w, c, `${P}-5-board`, ['#sbBoard > [data-secmove$=".unav"]'], out.board))
  await w.page.locator('#sbDone:visible, #sbClose:visible').first().click().catch(() => {}); await sleep(500)
  /* the admin's bell */
  const lines = await openBell(w)
  out.bell = lines.map(l => `${l.name} ${l.day} / ${l.what}`)
  await shot(w.page, c, `${P}-6-bell-admin`, await bellClip(w.page), out.bell, w.size); pics.push(`${P}-6-bell-admin.png`)
  log(c, 'inputs ' + J(out.inputs) + ' board ' + J(out.board) + ' bell ' + J(out.bell))
  const closesOk = out.closes.every(x => x.opened && x.after.closed && x.storeSame && x.pageSame && !x.after.board)
  judge(c + ' every way of closing', cfg, closesOk ? 'PASS' : 'FAIL', out.closes.map(x => ({ way: x.way, pressed: x.pressed, opened: x.opened, title: x.title, vals: x.vals, closed: x.after.closed, storeSame: x.storeSame, pageSame: x.pageSame, otherWins: x.after.otherWins, note: x.after.note, escAsk: x.after.escAsk })), pics.filter(p => /closed|open/.test(p)).join(', '))
  judge(c + ' what each shows', cfg, 'RECORD', { typed: out.typed, undo: { title: out.undoTitle, ...out.afterUndo }, inputs: out.inputs, board: out.board, bell: out.bell }, pics.join(', '))
} catch (e) { judge(c, cfg, 'NOT WALKED', 'error: ' + String(e.message || e).split('\n')[0].slice(0, 400) + ' :: ' + J(out).slice(0, 600)) }
try { await w?.ctx.close() } catch {}
await B.done()
