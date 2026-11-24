// Walker e — E1: a NAME dragged from the crew list onto the seat that man already holds (desktop; Edit Schedule, then
// the Scheduler Board); the control on the build before the fix; (a) a placeholder; (b) a name onto a different empty
// seat, then Undo; (c) a seat's own puck let go on its own seat; and whether a crew-list drag works on the phone.
// Run: node scripts/handpass/wr4-e-e1.mjs [fixed|before|phone]   (default: fixed,before,phone)
console.log('wr4-e-e1 v3')
const E = await (await import('./wr4-e-common.mjs')).setup('e1')
const { newPage, signIn, go, sleep, judge, save, note, noteGone, bundleOf, log, finish, shownToast, B } = E
const ONLY = (process.argv[2] || 'fixed,before,phone').split(',')
const OUT = process.env.WR4_OUT

const undoState = (page, sel) => page.evaluate(sel => { const b = document.querySelector(sel); return b ? { disabled: b.disabled || b.getAttribute('aria-disabled') === 'true', title: b.getAttribute('title') || '' } : null }, sel)
const histLen = page => page.evaluate(() => { try { return window.commandStreamLen ? window.commandStreamLen() : null } catch { return null } })
const seatPeople = (page, root, key) => page.evaluate(([root, key]) => [...document.querySelectorAll(`${root} [data-slot="${key}"]`)].filter(e => e.getBoundingClientRect().width > 3).flatMap(s => [...s.querySelectorAll('.puck[data-person]')].map(p => p.getAttribute('data-person'))), [root, key])
const seatBox = (page, root, key, attr = 'data-slot') => page.evaluate(([root, key, attr]) => { const s = [...document.querySelectorAll(`${root} [${attr}="${key}"]`)].find(e => e.getBoundingClientRect().width > 3); if (!s) return null; s.scrollIntoView({ block: 'center', inline: 'nearest' }); const r = s.getBoundingClientRect(); return { x: r.left + Math.min(r.width / 2, 40), y: r.top + r.height / 2, l: r.left, t: r.top, w: r.width, h: r.height } }, [root, key, attr])
const seatClass = (page, root, key, attr = 'data-slot') => page.evaluate(([root, key, attr]) => { const s = [...document.querySelectorAll(`${root} [${attr}="${key}"]`)].find(e => e.getBoundingClientRect().width > 3); return s ? String(s.className) : null }, [root, key, attr])

async function openRoster(w, roster) {
  if (roster === '#eRoster') {
    const vis = await w.page.evaluate(() => [...document.querySelectorAll('#eRoster .rpuck[data-person]')].some(e => e.getBoundingClientRect().width > 3 && e.getBoundingClientRect().left < innerWidth))
    if (!vis) { await w.page.locator('#rosTab').click(); await sleep(500) }
  }
}
async function openBoard(w) { await w.page.evaluate(() => window.openScheduler(0)); await w.page.waitForSelector('#schedBoard', { timeout: 8000 }); await sleep(900) }
async function closeBoard(w) { const off = w.page.locator('#sbDone:visible, #sbClose:visible').first(); if (await off.count()) { await off.click(); await sleep(600) } }

/* drag the name `person` from the crew list `roster` onto seat `key` under `root`, by a mouse; read everything */
async function rosterDrag(w, c, step, root, roster, key, person, undoSel, expect, attr = 'data-slot') {
  await openRoster(w, roster)
  const src = w.page.locator(`${roster} .rpuck[data-person="${person}"]`).filter({ visible: true }).first()
  if (!(await src.count())) { judge(c, step, 'NOT WALKED', `no ${person} on the crew list ${roster}`, expect); return null }
  await noteGone(w)
  const before = await seatPeople(w.page, root, key), uB = await undoState(w.page, undoSel), hB = await histLen(w.page)
  await src.scrollIntoViewIfNeeded(); await sleep(200)
  const a = await src.boundingBox(); const cx = a.x + Math.min(a.width / 2, 30), cy = a.y + a.height / 2
  await w.page.mouse.move(cx, cy); await w.page.mouse.down()
  await w.page.mouse.move(cx + 8, cy + 8, { steps: 3 }); await sleep(80)
  const t = await seatBox(w.page, root, key, attr)
  if (!t) { await w.page.mouse.up(); judge(c, step, 'NOT WALKED', 'seat not drawn ' + key, expect); return null }
  await w.page.mouse.move(t.x, t.y, { steps: 14 }); await sleep(250)
  const clip = { x: Math.max(0, t.l - 160), y: Math.max(0, t.t - 110), width: 520, height: 260 }
  await w.page.screenshot({ path: `${OUT}/${step}-carried.png`, clip })
  await w.page.mouse.up()
  const cls = await seatClass(w.page, root, key, attr)
  await w.page.screenshot({ path: `${OUT}/${step}-drop.png`, clip })
  const r = await note(w, c, `${step}-note`, /./, 3000)
  await sleep(400)
  const after = await seatPeople(w.page, root, key), uA = await undoState(w.page, undoSel), hA = await histLen(w.page)
  const got = { note: r.text || r.now || '', before, after, hist: [hB, hA], undo: [uB, uA], seatClassAtDrop: cls }
  log(c, `${step}: ${JSON.stringify(got)}`)
  return { ...got, pic: r.pic || `${step}-drop.png` }
}
/* a seat's own puck lifted, carried off, let go on its own seat (walker c's dragBack) */
async function seatBack(w, c, step, root, key, person, undoSel) {
  const cs = await w.page.evaluate(p => window.PEOPLE[p]?.cs || p, person), exp = `${cs} — already in that seat`
  const puck = w.page.locator(`${root} [data-slot="${key}"] .puck[data-person="${person}"]`).filter({ visible: true }).first()
  if (!(await puck.count())) { judge(c, step, 'NOT WALKED', 'no puck', exp); return }
  await puck.scrollIntoViewIfNeeded(); await sleep(250); await noteGone(w)
  const before = await seatPeople(w.page, root, key), hB = await histLen(w.page)
  const a = await puck.boundingBox(); const cx = a.x + a.width / 2, cy = a.y + a.height / 2
  await w.page.mouse.move(cx, cy); await w.page.mouse.down()
  await w.page.mouse.move(cx + 10, cy + 10, { steps: 3 }); await w.page.mouse.move(cx + 60, cy + 70, { steps: 8 }); await sleep(120)
  await w.page.screenshot({ path: `${OUT}/${step}-carried.png`, clip: { x: Math.max(0, cx - 220), y: Math.max(0, cy - 140), width: 520, height: 320 } })
  const t = await w.page.evaluate(([root, key]) => { const s = [...document.querySelectorAll(`${root} [data-slot="${key}"]`)].find(e => e.getBoundingClientRect().width > 3); const r = s.getBoundingClientRect(); return { x: r.left + Math.min(r.width / 2, 40), y: r.top + r.height / 2 } }, [root, key])
  await w.page.mouse.move(t.x, t.y, { steps: 10 }); await sleep(250); await w.page.mouse.up()
  const r = await note(w, c, `${step}-note`, /./, 3000); await sleep(300)
  const got = { note: r.text || r.now || '', before, after: await seatPeople(w.page, root, key), hist: [hB, await histLen(w.page)] }
  judge(c, step, got.note === exp && JSON.stringify(got.before) === JSON.stringify(got.after) && got.hist[0] === got.hist[1] ? 'PASS' : 'FAIL', got, exp, r.pic)
}
/* Monday's seats holding a real man, and empty seats */
const pickSeats = (w, root) => w.page.evaluate(root => {
  const vis = e => e.getBoundingClientRect().width > 3
  const real = p => p && window.PEOPLE[p] && !window.PEOPLE[p].special
  const held = re => { const s = [...document.querySelectorAll(root + ' .seat[data-slot]')].find(e => vis(e) && new RegExp(re).test(e.getAttribute('data-slot')) && e.querySelectorAll('.puck[data-person]').length === 1 && real(e.querySelector('.puck[data-person]').getAttribute('data-person'))); return s ? { key: s.getAttribute('data-slot'), who: s.querySelector('.puck[data-person]').getAttribute('data-person') } : null }
  const empty = re => { const s = [...document.querySelectorAll(root + ' .seat[data-slot]')].find(e => vis(e) && new RegExp(re).test(e.getAttribute('data-slot')) && !e.querySelector('.puck[data-person]')); return s ? s.getAttribute('data-slot') : null }
  return { fly: held('^0\\.\\d+\\.\\d+\\.\\d+\\.p$'), duty: held('^d:0\\.'), ground: held('^g:0\\.'), emptyFly: empty('^0\\.\\d+\\.\\d+\\.\\d+\\.p$'), emptyDuty: empty('^d:0\\.'), emptyAny: empty('^(0\\.|d:0\\.|s:0\\.)') }
}, root)
/* a free name on the crew list (not struck, not busy, a real man) */
const freeName = (w, roster, not = []) => w.page.evaluate(([roster, not]) => { const e = [...document.querySelectorAll(roster + ' .rpuck[data-person]')].find(x => x.getBoundingClientRect().width > 3 && !x.classList.contains('no') && !x.classList.contains('busy') && window.PEOPLE[x.getAttribute('data-person')] && !window.PEOPLE[x.getAttribute('data-person')].special && !not.includes(x.getAttribute('data-person'))); return e ? e.getAttribute('data-person') : null }, [roster, not])

let PH = null
const PLACES = [['week', '#eWeek', '#eRoster', '#undoBtn'], ['board', '#schedBoard', '#sbRoster', '#sbUndo']]

async function run(tag, dir) {
  const c = 'E1-' + tag
  const w = await newPage('desk', undefined, dir); await signIn(w, 'ad')
  log(c, `build ${dir} bundle ${await bundleOf(w.page)}`)
  PH = null
  if (tag === 'fixed') {
    await go(w.page, 'editsched'); await openBoard(w)
    PH = await w.page.evaluate(() => { const e = [...document.querySelectorAll('#schedBoard .sb-slot.empty[data-slot]')].find(x => x.getBoundingClientRect().width > 4); return e ? e.getAttribute('data-slot') : null })
    if (PH) {
      const s2 = `#schedBoard [data-slot="${PH}"]`
      await w.page.locator(s2).first().scrollIntoViewIfNeeded(); await w.page.locator(s2).first().click(); await sleep(350)
      await w.page.locator('#sbRoster .rpuck[data-person="allavail"]:visible').first().click(); await sleep(500)
      log(c, `placeholder put in ${PH}: ${JSON.stringify(await seatPeople(w.page, '#schedBoard', PH))}; note ${JSON.stringify(await shownToast(w.page))}`)
      await w.page.keyboard.press('Escape'); await sleep(300)
    }
    await closeBoard(w)
  }
  for (const [where, root, roster, undoSel] of PLACES) {
    try {
      await go(w.page, 'editsched'); await w.page.evaluate(() => scrollTo(0, 0))
      if (where === 'board') await openBoard(w)
      const seats = await pickSeats(w, root); log(c, `${where} seats ${JSON.stringify(seats)}`)
      for (const kind of tag === 'fixed' ? ['fly', 'duty', 'ground'] : ['fly', 'duty']) {
        const s = seats[kind]; if (!s) { judge(c, `${kind}-${where}`, 'NOT WALKED', 'no such seat holding one man', ''); continue }
        const cs = await w.page.evaluate(p => window.PEOPLE[p].cs, s.who), exp = `${cs} — already in that seat`
        const g = await rosterDrag(w, c, `e1-${tag}-${kind}-${where}`, root, roster, s.key, s.who, undoSel, exp)
        if (!g) continue
        const same = JSON.stringify(g.before) === JSON.stringify(g.after) && g.hist[0] === g.hist[1] && JSON.stringify(g.undo[0]) === JSON.stringify(g.undo[1])
        if (tag === 'fixed') judge(c, `${kind}-${where}`, g.note === exp && same && /lift-land/.test(g.seatClassAtDrop || '') ? 'PASS' : 'FAIL', g, exp + '; unchanged; seat lit (lift-land)', g.pic)
        else judge(c, `${kind}-${where} (before the fix)`, !g.note && same ? 'PASS' : 'FAIL', g, 'NO note; nothing changed', g.pic)
      }
      if (tag !== 'fixed') { if (where === 'board') await closeBoard(w); continue }
      /* (a) a placeholder: ALL AVAIL put in an empty seat by a tap on the seat and a tap on its name (walker c's recipe),
         then its name dragged from the crew list onto that seat */
      /* the week draws no empty seat on Monday (only "+" places), so the placeholder is put on the board's empty seat
         once, and that seat is used on the week too (walker c's recipe) */
      if (false) {
        PH = await w.page.evaluate(() => { const e = [...document.querySelectorAll('#schedBoard .sb-slot.empty[data-slot]')].find(x => x.getBoundingClientRect().width > 4); return e ? e.getAttribute('data-slot') : null })
        if (PH) {
          const s2 = `#schedBoard [data-slot="${PH}"]`
          await w.page.locator(s2).first().scrollIntoViewIfNeeded(); await w.page.locator(s2).first().click(); await sleep(350)
          await w.page.locator('#sbRoster .rpuck[data-person="allavail"]:visible').first().click(); await sleep(500)
          log(c, `placeholder put in ${PH}: ${JSON.stringify(await seatPeople(w.page, root, PH))}; note ${JSON.stringify(await shownToast(w.page))}`)
          await w.page.keyboard.press('Escape'); await sleep(300)
        }
      }
      const e2 = PH
      if (e2) {
        await openRoster(w, roster)
        const holds = await seatPeople(w.page, root, e2)
        if (holds.includes('allavail')) {
          const g = await rosterDrag(w, c, `e1-fixed-placeholder-${where}`, root, roster, e2, 'allavail', undoSel, 'ALL AVAIL — already in that seat')
          if (g) judge(c, `(a) placeholder ${where}`, g.note === 'ALL AVAIL — already in that seat' && JSON.stringify(g.before) === JSON.stringify(g.after) && g.hist[0] === g.hist[1] ? 'PASS' : 'FAIL', g, 'ALL AVAIL — already in that seat; unchanged', g.pic)
        } else judge(c, `(a) placeholder ${where}`, 'NOT WALKED', 'the placeholder did not land: ' + JSON.stringify(holds), '')
      } else judge(c, `(a) placeholder ${where}`, 'NOT WALKED', 'no empty seat', '')
      /* (b) a free name onto a different empty place, then Undo: on the board an empty seat, on the week (no empty seat
         drawn) a sim's "+" place */
      const e3 = where === 'board'
        ? await w.page.evaluate(ph => { const e = [...document.querySelectorAll('#schedBoard .sb-slot.empty[data-slot]')].find(x => x.getBoundingClientRect().width > 4 && x.getAttribute('data-slot') !== ph); return e ? e.getAttribute('data-slot') : null }, PH)
        : await w.page.evaluate(() => { const e = [...document.querySelectorAll('#eWeek [data-fill^="s:0."]')].find(x => x.getBoundingClientRect().width > 4); return e ? e.getAttribute('data-fill') : null })
      const attr = where === 'board' ? 'data-slot' : 'data-fill'
      const man = await (async () => { await openRoster(w, roster); return freeName(w, roster) })()
      const onDay = (m) => w.page.evaluate(([root, m]) => [...document.querySelectorAll(`${root} [data-slot^="s:0."] .puck[data-person="${m}"], ${root} [data-slot="${'x'}"]`)].filter(e => e.getBoundingClientRect().width > 3).map(e => e.closest('[data-slot]').getAttribute('data-slot')), [root, m])
      if (e3 && man) {
        const atB = await onDay(man)
        const g = await rosterDrag(w, c, `e1-fixed-other-${where}`, root, roster, e3, man, undoSel, '(RECORD)', attr)
        if (g) {
          const atA = await onDay(man)
          judge(c, `(b) name onto a different empty place ${where}`, atA.length > atB.length && g.hist[1] > g.hist[0] ? 'PASS' : 'FAIL', { ...g, place: e3, man, simSeatsHeld: [atB, atA] }, 'he is put there; a change for Undo; note RECORDED', g.pic)
          await w.page.locator(`${undoSel}:visible`).first().click(); await sleep(700)
          const u = { simSeatsHeld: await onDay(man), hist: await histLen(w.page), note: await shownToast(w.page) }
          await w.page.screenshot({ path: `${OUT}/e1-fixed-other-${where}-undone.png`, clip: { x: 0, y: 0, width: 1440, height: 900 } })
          judge(c, `(b) Undo takes it back ${where}`, u.simSeatsHeld.length === atB.length && /^Undid/.test(u.note) ? 'PASS' : 'FAIL', u, 'he is off that place again (the change count only grows: Undo is a change too)', `e1-fixed-other-${where}-undone.png`)
        }
      } else judge(c, `(b) ${where}`, 'NOT WALKED', { e3, man }, '')
      /* (c) a seat's own puck let go on its own seat */
      const s3 = (await pickSeats(w, root)).fly
      if (s3) await seatBack(w, c, `e1-fixed-seatpuck-${where}`, root, s3.key, s3.who, undoSel)
      if (where === 'board') await closeBoard(w)
    } catch (e) { console.log('ERR', where, e.message.split('\n')[0]); E.facts.errors.push(c + ' ' + where + ' ' + e.stack) }
  }
  await w.ctx.close()
}

/* the phone: open the crew list by its tab, one finger from his name onto his own seat (CDP touch, rested before the lift) */
async function phone() {
  const c = 'E1-phone'
  const p = await newPage('phone'); await signIn(p, 'ad')
  log(c, 'bundle ' + await bundleOf(p.page))
  for (const [where, root, roster] of [['week', '#eWeek', '#eRoster'], ['board', '#schedBoard', '#sbRoster']]) {
    try {
      await go(p.page, 'editsched'); await p.page.evaluate(() => scrollTo(0, 0))
      if (where === 'board') await openBoard(p)
      const s = (await pickSeats(p, root)).fly
      if (!s) { judge(c, where, 'NOT WALKED', 'no flying seat drawn', ''); continue }
      /* his seat brought into view first: the crew list covers the screen while open, and closes as a drag starts */
      await p.page.evaluate(([root, key]) => [...document.querySelectorAll(`${root} [data-slot="${key}"]`)].find(x => x.getBoundingClientRect().width > 3)?.scrollIntoView({ block: 'center', inline: 'center' }), [root, s.key]); await sleep(500)
      if (where === 'board' && !(await p.page.locator(`#sbRoster .rpuck[data-person="${s.who}"]`).filter({ visible: true }).count())) {
        const tab = p.page.locator('#schedBoard .ros-tab:visible, #sbRoster .ros-tab:visible').first(); if (await tab.count()) { await tab.tap(); await sleep(600) }
      }
      if (where === 'week') {
        const open = await p.page.evaluate(() => document.body.classList.contains('ros-open'))
        if (!open && await p.page.locator('#rosTab:visible').count()) { await p.page.locator('#rosTab').tap(); await sleep(600) }
      }
      const srcInfo = await p.page.evaluate(([roster, who]) => { const e = [...document.querySelectorAll(`${roster} .rpuck[data-person="${who}"]`)].find(x => { const r = x.getBoundingClientRect(); return r.width > 3 && r.left >= 0 && r.right <= innerWidth && r.top >= 0 && r.bottom <= innerHeight }); if (!e) { const any = document.querySelector(`${roster} .rpuck[data-person="${who}"]`); return { shown: false, any: !!any, box: any ? JSON.stringify(any.getBoundingClientRect()) : null } } const r = e.getBoundingClientRect(); return { shown: true, x: r.left + Math.min(r.width / 2, 30), y: r.top + r.height / 2 } }, [roster, s.who])
      await p.page.screenshot({ path: `${OUT}/e1-phone-${where}-list.png` })
      if (!srcInfo.shown) {
        /* his name may sit below the list's fold: bring it into view inside the list */
        await p.page.evaluate(([roster, who]) => document.querySelector(`${roster} .rpuck[data-person="${who}"]`)?.scrollIntoView({ block: 'center' }), [roster, s.who]); await sleep(400)
      }
      const src = await p.page.evaluate(([roster, who]) => { const e = [...document.querySelectorAll(`${roster} .rpuck[data-person="${who}"]`)].find(x => { const r = x.getBoundingClientRect(); return r.width > 3 && r.top >= 0 && r.bottom <= innerHeight && r.left >= 0 && r.right <= innerWidth }); if (!e) return null; const r = e.getBoundingClientRect(); return { x: r.left + Math.min(r.width / 2, 30), y: r.top + r.height / 2 } }, [roster, s.who])
      const tgt = await p.page.evaluate(([root, key]) => { const e = [...document.querySelectorAll(`${root} [data-slot="${key}"]`)].find(x => { const r = x.getBoundingClientRect(); return r.width > 3 && r.top >= 0 && r.bottom <= innerHeight && r.left >= 0 && r.right <= innerWidth }); if (!e) return null; const r = e.getBoundingClientRect(); return { x: r.left + Math.min(r.width / 2, 30), y: r.top + r.height / 2 } }, [root, s.key])
      if (!src || !tgt) {
        await p.page.screenshot({ path: `${OUT}/e1-phone-${where}-cannot.png` })
        judge(c, `crew-list drag ${where}`, 'RECORD', { his: s, nameOnScreen: !!src, seatOnScreen: !!tgt, first: srcInfo }, 'is a crew-list drag possible on the phone', `e1-phone-${where}-cannot.png`)
        if (where === 'board') await closeBoard(p)
        continue
      }
      const cdp = await p.ctx.newCDPSession(p.page)
      const T = (type, pts) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: pts.map(([x, y]) => ({ x, y })) })
      const before = await seatPeople(p.page, root, s.key), hB = await histLen(p.page)
      await noteGone(p, 5000)
      await T('touchStart', [[src.x, src.y]]); await sleep(450)
      const N = 14
      for (let i = 1; i <= N; i++) { await T('touchMove', [[src.x + (tgt.x - src.x) * i / N, src.y + (tgt.y - src.y) * i / N]]); await sleep(35) }
      await p.page.screenshot({ path: `${OUT}/e1-phone-${where}-carried.png` })
      /* the seat may have moved under the finger (the list closes while carrying): aim again */
      const tgt2 = await p.page.evaluate(([root, key]) => { const e = [...document.querySelectorAll(`${root} [data-slot="${key}"]`)].find(x => { const r = x.getBoundingClientRect(); return r.width > 3 && r.top >= 0 && r.bottom <= innerHeight }); if (!e) return null; const r = e.getBoundingClientRect(); return { x: r.left + Math.min(r.width / 2, 30), y: r.top + r.height / 2 } }, [root, s.key])
      if (tgt2) { await T('touchMove', [[tgt2.x, tgt2.y]]); await sleep(90) }
      await T('touchEnd', [])
      await sleep(60); await p.page.screenshot({ path: `${OUT}/e1-phone-${where}-drop-righttap.png` })
      const r = await note(p, c, `e1-phone-${where}-note`, /./, 3000)
      await p.page.screenshot({ path: `${OUT}/e1-phone-${where}-settled.png` })
      const got = { note: r.text || r.now || '', before, after: await seatPeople(p.page, root, s.key), hist: [hB, await histLen(p.page)], movedSeatAim: !!tgt2 && (Math.abs(tgt2.x - tgt.x) + Math.abs(tgt2.y - tgt.y)) > 2 }
      judge(c, `crew-list drag ${where}`, 'RECORD', got, 'is a crew-list drag possible; what it says', r.pic || `e1-phone-${where}-settled.png`)
      if (where === 'board') await closeBoard(p)
    } catch (e) { console.log('ERR phone', where, e.message.split('\n')[0]); E.facts.errors.push('phone ' + where + ' ' + e.stack) }
  }
  await p.ctx.close()
}

if (ONLY.includes('fixed')) { await run('fixed', B.fixed); save() }
if (ONLY.includes('before')) { await run('before', B.before); save() }
if (ONLY.includes('phone')) { await phone(); save() }
save(); await finish()
console.log('errors:', E.facts.errors.length, E.facts.errors.slice(0, 5).map(s => s.slice(0, 300)))
