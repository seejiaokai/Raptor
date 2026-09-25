/* [LEAVE-LATE-PUBLISHED]'s FULL check — the NEIGHBOUR walk (26 Sep 26; walker "neighbour", port 4176).
   D183 / D184 / D185: a crew-rest breach on a published day (red ring + CR flag), the tight-turn note (TT), and the
   dotted "breaks tomorrow's crew rest" mark on the day BEFORE stay LIVE on the published face — drawn from today's
   judgement at once — and NEVER make the published day pending or take its four sign-offs down.
   Written as assertions of the RIGHT behaviour — a PASS means correct; re-running it IS the re-walk.
   Each world is a fresh demo week (Mon 13 – Sun 19 Jul 26), made through the app's own controls: the board's sign-off
   selects and Publish / Publish AL, a crew-palette puck DRAGGED onto a duty desk or a cockpit seat (the drop replaces
   whoever sits there), the edit week's take-off / landing time cells. window.* is READ for the evidence only.
     N1  the draft day BEFORE: Tuesday published; Hex (rocky) put on Monday's evening SDO desk → Tuesday's face shows his
         breach at once, 0 pending, four stand; Monday shows the dotted mark; taken off again → gone, still 0
     N2  both published: the same change → Monday 1 pending; Tuesday's face does NOT show it (judged against Monday as
         issued), Edit Schedule's Tuesday does; Monday's AL1 → Tuesday's face shows it; Tuesday 0 pending throughout
     N3  clearing a breach: Tuesday published; Monday's RU 2nd-wave times moved earlier on the edit week → Outlaw
         (casper)'s breach becomes a tight turn, then clears, on Tuesday's face at once; put back → returns; 0 pending
     N4  the day AFTER (D183): Monday published; on draft Tuesday a Monday late flyer (Echo) put on Tuesday's early line
         → Monday's face shows the dotted mark on him at once; 0 pending; put back → gone
   Usage (from raptor-port/, the walker's preview on 4176): node scripts/handpass/am/late-pub-neighbour-walk.mjs [desktop|phone]
   HP_REWALK=<folder> sends the pictures to a re-walk folder, so the first walk's stay as evidence. */
const W = process.argv[2] || 'desktop'
const ONLY = (process.argv[3] || '').split(',').filter(Boolean)
process.env.HP_URL ||= 'http://localhost:4176'
process.env.HP_SHOTS = process.env.HP_REWALK
  ? `${process.env.HP_REWALK}/${W}`
  : `C:/Users/User/projects/Raptor/raptor-port/docs/img/handpass/2026-09-26-late-pub/neighbour/${W}`
const L = await import('./w2-lib.mjs')
const W1 = await import('./w1-lib.mjs')
const B2 = await import('./b2-lib.mjs')
const { openHi, editWeek, board, closeBoard, signDay, publishDay, head, go, check, note, summary, screen, editText } = L
const { toastSpy, toasts, shotUnion, norm } = W1
const PHONE = W === 'phone'
const SIZE = PHONE ? { width: 390, height: 844 } : { width: 1440, height: 900 }
const MON = 0, TUE = 1
const P = PHONE ? 'p-' : 'd-'
const num = s => { const m = /(\d+)/.exec(String(s || '')); return m ? +m[1] : 0 }
const ALL_ERRORS = []

async function world() {
  const w = await openHi({ ...SIZE, dpr: PHONE ? 3 : 2, state: null })
  await toastSpy(w.page)
  w.CS = await w.page.evaluate(() => Object.fromEntries(Object.entries(window.PEOPLE).map(([k, p]) => [k, p.cs])))
  w.ID = Object.fromEntries(Object.entries(w.CS).map(([k, v]) => [v, k]))
  return w
}
const signVals = (page, di) => page.evaluate(di => [...document.querySelectorAll(`#schedBoard select[data-signday="${di}"]`)].filter(s => s.offsetWidth || s.offsetHeight).map(s => (s.options[s.selectedIndex] || {}).text || ''), di)
/* publish day di through the board (sign the four, Publish), then sign the four AGAIN — "signed, nothing waiting", the
   state whose standing or falling each step reads */
async function publishAndSign(page, di) {
  await board(page, di)
  const sg = await signDay(page, di, 0)
  const p = await publishDay(page, di)
  const said = (await toasts(page)).join(' / ')
  const h = await head(page, di)
  await signDay(page, di, 0)
  const v0 = await signVals(page, di)
  await toasts(page)
  return { sg, p, h, v0, said }
}
/* every puck a person wears in one day of a surface (not the crew palette), as the screen draws it */
async function pucks(page, sel, id) {
  return page.evaluate(([s, id]) => {
    const d = document.querySelector(s); if (!d) return null
    return [...d.querySelectorAll(`.puck[data-person="${id}"]`)].filter(e => !e.closest('#sbRoster, #eRoster') && !e.classList.contains('rpuck')).map(e => {
      const ch = e.querySelector('.lchip'), seat = e.closest('[data-slot]')
      return { slot: seat ? seat.dataset.slot : '', red: e.classList.contains('boxred'), dash: e.classList.contains('boxdash'),
        dot: e.classList.contains('boxdot'), chip: ch ? ch.innerText.trim() : '', chipCls: ch ? ch.className : '',
        chipTitle: ch ? ch.getAttribute('title') || '' : '', title: e.getAttribute('title') || '', vis: !!(e.offsetWidth || e.offsetHeight) }
    })
  }, [sel, id])
}
const daySel = (where, di) => `${where === 'face' ? '#vWeek' : '#eWeek'} .day[data-day="${di}"]`
/* a day as the published face (View-only Sched) or the working copy (Edit Schedule) shows it: its warning bar, and the
   pucks of the named people */
async function daySnap(page, where, di, ids) {
  if (where === 'face') { await closeBoard(page); await go(page, 'viewsched') } else await editWeek(page)
  await page.waitForTimeout(350)
  const sel = daySel(where, di)
  const r = await page.evaluate(s => {
    const d = document.querySelector(s); if (!d) return { warn: '(no day)', head: '' }
    const dw = d.querySelector('.daywarn'), hd = d.querySelector('.day-head')
    return { warn: dw ? dw.innerText.replace(/\s+/g, ' ').trim() : '(no warning bar)', head: hd ? hd.innerText.replace(/\s+/g, ' ').trim() : '' }
  }, sel)
  const m = /⚠\s*(\d+)\s*issue/.exec(r.warn); r.issues = m ? +m[1] : 0
  r.pk = {}
  for (const id of ids) r.pk[id] = await pucks(page, sel, id)
  return r
}
const pkLine = (a) => !a ? '(no day)' : !a.length ? '(not on this day)' : a.map(x => `[${x.slot}${x.red ? ' RED' : ''}${x.dash ? ' DASH' : ''}${x.dot ? ' DOTTED' : ''}${x.chip ? ' flag "' + x.chip + '" (' + (x.chipCls.match(/l-[a-z]+/) || [''])[0] + ')' : ''}]`).join(' ')
/* the crew-rest flag prints "R" (the legend: R crew rest) with class l-cr; the tight turn "TT" with l-tt */
const isCR = x => /\bl-cr\b/.test(x.chipCls), isTT = x => /\bl-tt\b/.test(x.chipCls)
const anyRedCR = (a) => (a || []).some(x => x.red && isCR(x))
const anyTT = (a) => (a || []).some(isTT)
const anyDot = (a) => (a || []).some(x => x.dot)
const noMark = (a) => (a || []).every(x => !x.red && !x.dash && !x.dot && !isCR(x) && !isTT(x))
/* open a day's "⚠ N issues" bar, read the list, picture it, close it again */
async function warnList(page, where, di, shot) {
  const sel = daySel(where, di)
  const bar = page.locator(`${sel} .daywarn[data-daywarn="${di}"]:visible`).first()
  if (!(await bar.count())) return '(no warning bar)'
  await bar.evaluate(e => e.scrollIntoView({ block: 'start', inline: 'nearest' })); await page.waitForTimeout(150)
  await bar.click(); await page.waitForTimeout(450)
  const t = await page.evaluate(s => { const b = document.querySelector(s); return b ? b.innerText.replace(/\s+/g, ' ').trim() : '' }, `${sel} .dwbox`)
  if (shot) await shotUnion(page, shot, [`${sel} .dwbox`], { pad: 8 })
  const bar2 = page.locator(`${sel} .daywarn[data-daywarn="${di}"]:visible`).first()
  if (await bar2.count()) { await bar2.click(); await page.waitForTimeout(300) }
  return t
}
/* close-ups: the day's warning bar with the man's puck (if they share a screen), and the puck alone */
async function closeups(page, where, di, id, name, { dotted = false } = {}) {
  if (where === 'face') { await closeBoard(page); await go(page, 'viewsched') } else await editWeek(page)
  await page.waitForTimeout(300)
  const sel = daySel(where, di)
  const pkSel = `${sel} .puck${dotted ? '.boxdot' : ''}[data-person="${id}"]`
  const alt = `${sel} .puck[data-person="${id}"]`
  const use = (await page.locator(`${pkSel}:visible`).count()) ? pkSel : alt
  if (!(await page.locator(`${use}:visible`).count())) return null
  /* bring the puck to the middle of the screen first, the way a person scrolls to it: a puck left at the week's left
     edge sits under the desktop week's "‹" day arrow (a driver artefact, seen on the first walk) */
  await page.locator(`${use}:visible`).first().evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' }))
  await page.waitForTimeout(250)
  await shotUnion(page, name + '-puck', [use], { pad: 28 })
  const bar = `${sel} .daywarn`
  const both = await page.evaluate(([a, b]) => { const x = document.querySelector(a), y = document.querySelector(b); if (!x || !y) return false
    const r1 = x.getBoundingClientRect(), r2 = y.getBoundingClientRect(); return Math.abs(r2.bottom - r1.top) < innerHeight * 0.8 && Math.abs(r1.bottom - r2.top) < innerHeight * 0.8 }, [bar, use])
  if (both) await shotUnion(page, name + '-bar', [bar, use], { pad: 10 })
  else if (await page.locator(`${bar}:visible`).count()) await shotUnion(page, name + '-bar', [bar], { pad: 10 })
  return use
}
/* a whole-day picture of a surface, the day scrolled to the top of the screen */
async function dayPic(page, where, di, name) {
  if (where === 'face') { await closeBoard(page); await go(page, 'viewsched') } else await editWeek(page)
  const el = page.locator(daySel(where, di)).first()
  if (!(await el.count())) return
  await el.evaluate(e => e.scrollIntoView({ block: 'start', inline: 'start' })); await page.waitForTimeout(300)
  await screen(page, name)
}
/* what a published day reads: the week head, the board strip, the sign-off line and the four boxes */
async function dayState(page, di) {
  await editWeek(page)
  const hw = await head(page, di)
  /* the ⓘ day panel and (desktop) the Amendments panel — every other place a count is read */
  const iw = await W1.dayInfo(page, di, 'week'); await W1.closeDayInfo(page)
  const Pn = await W1.panel(page)
  const dow = ['Mon', 'Tue', 'Wed'][di]
  const pan = Pn.visible ? ((Pn.days.find(d => (d.text || '').startsWith(dow)) || {}).text || '(not listed)') : '(no panel at this width)'
  await board(page, di)
  const hb = await head(page, di)
  const v = await signVals(page, di)
  const info = iw.error ? 'NOT READ: ' + iw.error : (norm(iw.pend) || `(no pending line; it says "${norm(iw.stat).slice(0, 80)}")`)
  return { week: norm(hw.pending), board: norm(hb.pending), info, panel: pan, nys: hw.nys, sign: norm(hb.signState), v, tag: norm(hb.tag) }
}
function zeroAndFour(id, st, v0, what) {
  const pm = /· (\d+) change/.exec(st.panel || '')
  const ok = !num(st.week) && !num(st.board) && !/NOT READ|\d+ (pending|change)/.test(st.info) && !pm && v0.length === 4 && JSON.stringify(st.v) === JSON.stringify(v0) && !st.nys
  check(id, ok, `${what}: week head pending "${st.week || '(none)'}", board "${st.board || '(none)'}", ⓘ panel "${st.info}", Amendments panel "${st.panel}", sign line "${st.sign}", boxes ${JSON.stringify(st.v)} (signed: ${JSON.stringify(v0)}), Not-yet-signed mark ${st.nys ? 'SHOWN' : 'none'}, tag "${st.tag}"`)
}
/* the board's 👁 look at an issued version (the plans menu's issued row) — the published face's other surface */
async function boardLook(page, di, id, shot) {
  await board(page, di)
  const ok = await L.lookAt(page, di, /Orig|ORIG|AL\d/)
  if (!ok) return { opened: false }
  await page.waitForTimeout(400)
  const bar = await L.pvBar(page, di)
  const pk = await pucks(page, '#schedBoard', id)
  const outlaw = await pucks(page, '#schedBoard', 'casper')
  if (shot) {
    const first = page.locator(`#schedBoard .puck:not(.rpuck)[data-person="${id}"]:visible`).first()
    if (await first.count()) { await first.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await page.waitForTimeout(250)
      const b = await first.boundingBox(); if (b) await page.screenshot({ path: `${process.env.HP_SHOTS}/${shot}.png`, clip: { x: Math.max(0, b.x - 40), y: Math.max(0, b.y - 60), width: Math.min(360, page.viewportSize().width - Math.max(0, b.x - 40)), height: 130 } }) }
  }
  const back = await L.pvTap(page, di, 'data-golive')
  return { opened: true, bar: bar ? bar.text : '(no preview bar)', pk, outlaw, back }
}
/* drag a crew-palette puck onto a seat on the open board; on a phone the palette is a drawer, opened first */
async function dropOn(page, di, key, cs) {
  await board(page, di)
  if (!PHONE) {
    const r = await B2.dragOnto(page, key, cs)
    return { now: r, said: (await toasts(page)).join(' / ') }
  }
  /* THE PHONE: the crew palette is the AIRCREW drawer parked on the right edge. A person scrolls the board to the seat,
     taps the drawer's handle to open it, finds the man in it and drags him out; the drawer parks itself as the drag
     starts, so a seat it covered is uncovered by the time the finger reaches it (probed 26 Sep 26) */
  const id = await page.evaluate(c => Object.keys(window.PEOPLE).find(k => window.PEOPLE[k].cs === c), cs)
  const seat = page.locator(`#schedBoard .seat[data-slot="${key}"]:visible`).first()
  if (!(await seat.count())) return { now: 'NO SEAT ' + key, said: '' }
  await seat.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await page.waitForTimeout(300)
  if (!(await page.evaluate(() => document.body.classList.contains('ros-open')))) {
    const b = await page.locator('#schedBoard .sb-ros').first().boundingBox()
    await page.mouse.click(b.x + Math.min(12, b.width / 2), Math.min(b.y + b.height / 2, 420)); await page.waitForTimeout(600)
  }
  const src = page.locator(`#sbRoster .rpuck[data-person="${id}"]:visible`).first()
  if (!(await src.count())) return { now: 'NOT IN THE DRAWER ' + cs, said: '' }
  await src.evaluate(e => e.scrollIntoView({ block: 'center' })); await page.waitForTimeout(300)
  const a = await src.boundingBox()
  await page.mouse.move(a.x + a.width / 2, a.y + a.height / 2); await page.mouse.down()
  await page.mouse.move(a.x + a.width / 2 - 8, a.y + a.height / 2 + 6, { steps: 4 }); await page.waitForTimeout(200)
  const s = await seat.boundingBox()
  await page.mouse.move(s.x + s.width / 2, s.y + s.height / 2, { steps: 16 }); await page.waitForTimeout(150)
  await page.mouse.up(); await page.waitForTimeout(700)
  const now = await page.evaluate(k => { const v = window.slotVal(k); return v ? ((window.PEOPLE[v] || {}).cs || v) : '' }, key)
  return { now, said: (await toasts(page)).join(' / ') }
}
const wrap = (tag, fn) => async () => {
  if (ONLY.length && !ONLY.includes(tag)) return
  const w = await world()
  try { await fn(w) } catch (e) { check(`${tag} ran to the end`, false, 'THREW: ' + (e && e.stack || e).toString().slice(0, 600)); await screen(w.page, `${P}${tag}-threw`).catch(() => {}) }
  finally { ALL_ERRORS.push(...w.errors.map(e => tag + ' ' + e)); await w.browser.close() }
}

/* ============ N1 — the draft day before: Tuesday published, Hex onto Monday's evening SDO desk ============ */
const N1 = wrap('N1', async ({ page, CS }) => {
  const rk = 'rocky', hex = CS[rk]
  const pub = await publishAndSign(page, TUE)
  check('N1-0 Tuesday published', pub.p.pressed && /ORIG/.test(pub.h.tag) && pub.v0.length === 4, `tag "${norm(pub.h.tag)}", signed again ${JSON.stringify(pub.v0)}; said "${pub.said}"`)
  const f0 = await daySnap(page, 'face', TUE, [rk])
  note('N1-0 Tuesday face before', `bar "${f0.warn}" · ${hex}: ${pkLine(f0.pk[rk])}`)
  check('N1-0 Hex clean on Tuesday before', noMark(f0.pk[rk]) && (f0.pk[rk] || []).length > 0, pkLine(f0.pk[rk]))
  await dayPic(page, 'face', TUE, `${P}N1-0-tue-face-before`)
  const monSdo = await page.evaluate(() => window.slotVal('d:0.1.0'))
  const d = await dropOn(page, MON, 'd:0.1.0', hex)
  check('N1-1 Hex on Monday\'s evening SDO desk (dragged from the crew palette)', d.now === hex, `the seat now holds "${d.now}" (was ${CS[monSdo]}); said "${d.said}"`)
  await shotUnion(page, `${P}N1-1-mon-board-sdo`, ['#schedBoard [data-slot="d:0.1.0"]'], { pad: 40 })
  const f1 = await daySnap(page, 'face', TUE, [rk])
  check('N1-2 Tuesday\'s face shows his breach at once (red ring + CR)', anyRedCR(f1.pk[rk]), `${hex}: ${pkLine(f1.pk[rk])}; CR flag says "${(f1.pk[rk] || [])[0]?.chipTitle || ''}"`)
  check('N1-2 the day\'s issue count up by one', f1.issues === f0.issues + 1, `"${f0.warn}" → "${f1.warn}"`)
  const l1 = await warnList(page, 'face', TUE, `${P}N1-2-tue-face-list`)
  check('N1-2 the list names his breach', new RegExp(`Crew rest breach — Monday ended 21:30`).test(l1) && new RegExp(hex).test(l1), `"${l1.slice(0, 700)}"`)
  await closeups(page, 'face', TUE, rk, `${P}N1-2-tue-face`)
  const s1 = await dayState(page, TUE)
  zeroAndFour('N1-2 Tuesday 0 pending, the four stand', s1, pub.v0, 'after Monday\'s draft change')
  await shotUnion(page, `${P}N1-2-tue-board-signbar`, ['#sbSignBar'])
  const wk = await daySnap(page, 'week', TUE, [rk])
  check('N1-2 Edit Schedule\'s Tuesday shows it too', anyRedCR(wk.pk[rk]), `${pkLine(wk.pk[rk])}; bar "${wk.warn}"`)
  /* the board's 👁 look at an issued version draws NO warning at all — frozen or live — by its own (pre-existing,
     SchedBoard.tsx untouched by the branch) design: "a past version is never validated, so live warnings against it
     would be nonsense". So it is not where D183–D185's live warnings show: recorded, and the host told */
  const lk = await boardLook(page, TUE, rk, `${P}N1-2-tue-board-look-orig`)
  note('N1-2 the board\'s 👁 look at Tuesday\'s Original', `opened ${lk.opened}; bar "${lk.bar}"; Hex ${pkLine(lk.pk)}; Outlaw (frozen demo breach) ${pkLine(lk.outlaw)}; back to live ${lk.back}`)
  check('N1-2 the 👁 look draws no warning rings at all (Outlaw\'s frozen breach absent too) — its design, not a live miss', lk.opened && noMark(lk.pk) && noMark(lk.outlaw), `Hex ${pkLine(lk.pk)}; Outlaw ${pkLine(lk.outlaw)}`)
  const mw = await daySnap(page, 'week', MON, [rk])
  const mDot = (mw.pk[rk] || []).find(x => x.slot === 'd:0.1.0')
  check('N1-3 Monday (draft, Edit Schedule) wears the dotted "breaks tomorrow" mark', !!mDot && mDot.dot, `${pkLine(mw.pk[rk])}; title "${mDot ? mDot.title : ''}"; chip title "${mDot ? mDot.chipTitle : ''}"`)
  await closeups(page, 'week', MON, rk, `${P}N1-3-mon-week`, { dotted: true })
  const mf = await daySnap(page, 'face', MON, [rk])
  const mfDot = (mf.pk[rk] || []).find(x => x.slot === 'd:0.1.0')
  check('N1-3 Monday on View-only Sched (a draft day) wears it too', !!mfDot && mfDot.dot, `${pkLine(mf.pk[rk])}; title "${mfDot ? mfDot.title : ''}"`)
  await closeups(page, 'face', MON, rk, `${P}N1-3-mon-face`, { dotted: true })
  /* undo and redo through the board's own ↶ / ↷, then a reload — the other orders of the same change (§7.4) */
  await board(page, MON)
  await page.locator('#sbUndo:visible').first().click(); await page.waitForTimeout(800)
  const su = (await toasts(page)).join(' / '), afterU = CS[await page.evaluate(() => window.slotVal('d:0.1.0'))]
  const fu = await daySnap(page, 'face', TUE, [rk])
  check('N1-U Undo: the desk back to Forge, the breach gone from Tuesday\'s face', afterU === CS[monSdo] && noMark(fu.pk[rk]) && fu.issues === f0.issues, `desk "${afterU}", said "${su}"; ${pkLine(fu.pk[rk])}; bar "${fu.warn}"`)
  zeroAndFour('N1-U Tuesday 0 pending, the four stand', await dayState(page, TUE), pub.v0, 'after Undo')
  await board(page, MON)
  await page.locator('#sbRedo:visible').first().click(); await page.waitForTimeout(800)
  const sr = (await toasts(page)).join(' / '), afterR = CS[await page.evaluate(() => window.slotVal('d:0.1.0'))]
  const fr = await daySnap(page, 'face', TUE, [rk])
  check('N1-R Redo: Hex back on the desk, the breach back on Tuesday\'s face', afterR === hex && anyRedCR(fr.pk[rk]) && fr.issues === f0.issues + 1, `desk "${afterR}", said "${sr}"; ${pkLine(fr.pk[rk])}; bar "${fr.warn}"`)
  zeroAndFour('N1-R Tuesday 0 pending, the four stand', await dayState(page, TUE), pub.v0, 'after Redo')
  await closeBoard(page)
  await page.reload(); await page.addStyleTag({ content: '*{scroll-behavior:auto !important}' })
  let how = 'stayed signed in'
  if (await page.locator('#luser').isVisible().catch(() => false)) { await L.login(page, 'a'); how = 'signed in again (the app asked)' }
  else { await page.waitForSelector('#vWeek .day, #eWeek .day', { state: 'attached' }); await page.waitForTimeout(500) }
  await toastSpy(page)
  const fl = await daySnap(page, 'face', TUE, [rk])
  check('N1-L after a reload: the breach still on Tuesday\'s face', anyRedCR(fl.pk[rk]) && fl.issues === f0.issues + 1, `${how}; ${pkLine(fl.pk[rk])}; bar "${fl.warn}"`)
  await closeups(page, 'face', TUE, rk, `${P}N1-L-tue-face-after-reload`)
  zeroAndFour('N1-L Tuesday 0 pending, the four stand after the reload', await dayState(page, TUE), pub.v0, 'after a reload')
  const ml = await daySnap(page, 'week', MON, [rk])
  check('N1-L Monday\'s dotted mark still there after the reload', anyDot(ml.pk[rk]), pkLine(ml.pk[rk]))
  /* take him off again: the desk's first holder dragged back onto it */
  const b = await dropOn(page, MON, 'd:0.1.0', CS[monSdo])
  check('N1-4 the SDO desk back to its first holder', b.now === CS[monSdo], `the seat holds "${b.now}"; said "${b.said}"`)
  const f4 = await daySnap(page, 'face', TUE, [rk])
  check('N1-4 the breach is gone from Tuesday\'s face', noMark(f4.pk[rk]) && f4.issues === f0.issues, `${pkLine(f4.pk[rk])}; bar "${f4.warn}"`)
  await closeups(page, 'face', TUE, rk, `${P}N1-4-tue-face`)
  const s4 = await dayState(page, TUE)
  zeroAndFour('N1-4 Tuesday still 0 pending, the four stand', s4, pub.v0, 'after taking him off')
  const m4 = await daySnap(page, 'week', MON, [rk])
  check('N1-4 Monday\'s dotted mark gone too', !anyDot(m4.pk[rk]), pkLine(m4.pk[rk]))
})

/* ============ N2 — both published: Monday's change waits for Monday's AL1 before Tuesday's face shows it ============ */
const N2 = wrap('N2', async ({ page, CS }) => {
  const rk = 'rocky', hex = CS[rk]
  const pm = await publishAndSign(page, MON)
  const pt = await publishAndSign(page, TUE)
  check('N2-0 Monday and Tuesday published', pm.p.pressed && pt.p.pressed && /ORIG/.test(pm.h.tag) && /ORIG/.test(pt.h.tag), `Monday "${norm(pm.h.tag)}", Tuesday "${norm(pt.h.tag)}"`)
  const f0 = await daySnap(page, 'face', TUE, [rk])
  const monSdo = await page.evaluate(() => window.slotVal('d:0.1.0'))
  const d = await dropOn(page, MON, 'd:0.1.0', hex)
  check('N2-1 Hex on Monday\'s evening SDO desk', d.now === hex, `seat holds "${d.now}"; said "${d.said}"`)
  const sm = await dayState(page, MON)
  check('N2-1 Monday reads 1 pending (its own change), its four fall', num(sm.week) === 1 && num(sm.board) === 1 && sm.v.every(x => !x || /—|sign/i.test(x)), `week "${sm.week}", board "${sm.board}", sign line "${sm.sign}", boxes ${JSON.stringify(sm.v)}`)
  await shotUnion(page, `${P}N2-1-mon-board-signbar`, ['#sbSignBar'])
  const f1 = await daySnap(page, 'face', TUE, [rk])
  check('N2-2 Tuesday\'s face does NOT yet show it (judged against Monday as issued)', noMark(f1.pk[rk]) && f1.issues === f0.issues, `${pkLine(f1.pk[rk])}; bar "${f0.warn}" → "${f1.warn}"`)
  await closeups(page, 'face', TUE, rk, `${P}N2-2-tue-face`)
  const mf1 = await daySnap(page, 'face', MON, [rk])
  check('N2-2 Monday\'s published face (ORIG) keeps Forge on the desk and no dotted mark on Hex', !anyDot(mf1.pk[rk]) && (mf1.pk[rk] || []).length === 1, `Hex on Monday's face: ${pkLine(mf1.pk[rk])} (his sim-passenger seat only)`)
  const wk = await daySnap(page, 'week', TUE, [rk])
  check('N2-2 Edit Schedule\'s Tuesday does show it', anyRedCR(wk.pk[rk]), `${pkLine(wk.pk[rk])}; bar "${wk.warn}"`)
  await closeups(page, 'week', TUE, rk, `${P}N2-2-tue-week`)
  const lk = await boardLook(page, TUE, rk, `${P}N2-2-tue-board-look-orig`)
  note('N2-2 the board\'s 👁 look at Tuesday\'s Original (draws no warnings by design)', `opened ${lk.opened}; Hex ${pkLine(lk.pk)}; Outlaw ${pkLine(lk.outlaw)}; back to live ${lk.back}`)
  const s2 = await dayState(page, TUE)
  zeroAndFour('N2-2 Tuesday 0 pending, the four stand', s2, pt.v0, 'with Monday\'s change waiting')
  /* Monday's AL1: sign again on the board, Publish AL1 */
  await board(page, MON)
  await signDay(page, MON, 0)
  const al = await L.publishAL(page, MON)
  const said = (await toasts(page)).join(' / ')
  const hm = await head(page, MON)
  check('N2-3 Monday AL1 published', al.pressed && /AL1/.test(al.label || '') && /AL1/.test(hm.tag) && !num(hm.pending), `pressed "${al.label}", tag "${norm(hm.tag)}", pending "${norm(hm.pending)}"; said "${said}"`)
  const f3 = await daySnap(page, 'face', TUE, [rk])
  check('N2-4 now Tuesday\'s face shows the breach (red ring + CR)', anyRedCR(f3.pk[rk]) && f3.issues === f0.issues + 1, `${pkLine(f3.pk[rk])}; bar "${f3.warn}"`)
  await closeups(page, 'face', TUE, rk, `${P}N2-4-tue-face`)
  await warnList(page, 'face', TUE, `${P}N2-4-tue-face-list`)
  const lk4 = await boardLook(page, TUE, rk, `${P}N2-4-tue-board-look-orig`)
  note('N2-4 the board\'s 👁 look at Tuesday\'s Original (draws no warnings by design)', `Hex ${pkLine(lk4.pk)}; Outlaw ${pkLine(lk4.outlaw)}; back to live ${lk4.back}`)
  const s3 = await dayState(page, TUE)
  zeroAndFour('N2-4 Tuesday still 0 pending, the four stand', s3, pt.v0, 'after Monday\'s AL1')
  await shotUnion(page, `${P}N2-4-tue-board-signbar`, ['#sbSignBar'])
  /* a published face draws its seats without their slot keys, so the desk puck is found by its dotted ring, not its key */
  const mf = await daySnap(page, 'face', MON, [rk])
  const mfDot = (mf.pk[rk] || []).find(x => x.dot)
  check('N2-5 Monday\'s published face (AL1) wears the dotted mark on Hex', !!mfDot, `${pkLine(mf.pk[rk])}; title "${mfDot ? mfDot.title : ''}"`)
  await closeups(page, 'face', MON, rk, `${P}N2-5-mon-face`, { dotted: true })
  note('N2 Monday\'s first SDO', CS[monSdo])
})

/* ============ N3 — clearing a breach: Monday's RU 2nd-wave times moved earlier on the edit week ============ */
const N3 = wrap('N3', async ({ page, CS }) => {
  const cp = 'casper', out = CS[cp]
  const pt = await publishAndSign(page, TUE)
  check('N3-0 Tuesday published', pt.p.pressed && /ORIG/.test(pt.h.tag), `tag "${norm(pt.h.tag)}"`)
  const f0 = await daySnap(page, 'face', TUE, [cp])
  check('N3-0 Outlaw\'s demo breach on Tuesday\'s face', anyRedCR(f0.pk[cp]), `${pkLine(f0.pk[cp])}; CR flag says "${(f0.pk[cp] || [])[0]?.chipTitle || ''}"; bar "${f0.warn}"`)
  const l0 = await warnList(page, 'face', TUE, `${P}N3-0-tue-face-list`)
  note('N3-0 the breach\'s words', (/(Crew rest breach[^·]*?rest\.)/.exec(l0) || [])[1] || l0.slice(0, 400))
  await closeups(page, 'face', TUE, cp, `${P}N3-0-tue-face`)
  const m0 = await daySnap(page, 'week', MON, [cp])
  note('N3-0 Monday (draft) Outlaw', `${pkLine(m0.pk[cp])}; dotted title "${((m0.pk[cp] || []).find(x => x.dot) || {}).title || ''}"`)
  const times = async () => page.evaluate(() => { const f = window.DAYS[0].waves[1].formations[1]; return `${f.cs} ${f.to}–${f.ld}` })
  const t0 = await times()
  await editWeek(page)
  /* (a) take-off 15:40, land 17:00 — rest still short (clear 07:00 against a 06:00 report): the breach stays, its words follow */
  await editText(page, 'ff:0.1.1.to', '15:40'); await editText(page, 'ff:0.1.1.ld', '17:00'); await toasts(page)
  const ta = await times()
  const fa = await daySnap(page, 'face', TUE, [cp])
  const la = await warnList(page, 'face', TUE, `${P}N3-a-tue-face-list`)
  check('N3-a land 17:00: the breach stays on the face, its words follow today\'s times', anyRedCR(fa.pk[cp]) && /Monday landed 17:00/.test(la), `Monday RU line ${t0} → ${ta}; ${pkLine(fa.pk[cp])}; list "${(/(Crew rest breach[^·]*?rest\.)/.exec(la) || [])[1] || la.slice(0, 300)}"`)
  /* (b) take-off 14:20, land 15:50 — clear 05:50: inside the 06:00 report, but after the nominal 05:40 → a tight turn */
  await editWeek(page)
  await editText(page, 'ff:0.1.1.to', '14:20'); await editText(page, 'ff:0.1.1.ld', '15:50'); await toasts(page)
  const tb = await times()
  const fb = await daySnap(page, 'face', TUE, [cp])
  const lb = await warnList(page, 'face', TUE, `${P}N3-b-tue-face-list`)
  check('N3-b land 15:50: the breach turns into a tight-turn note (TT, no ring) on the face at once', !anyRedCR(fb.pk[cp]) && anyTT(fb.pk[cp]) && /Tight turning/.test(lb) && !/Crew rest breach — Monday/.test(lb), `line ${tb}; ${pkLine(fb.pk[cp])}; bar "${fb.warn}"; list "${lb.slice(0, 500)}"`)
  await closeups(page, 'face', TUE, cp, `${P}N3-b-tue-face`)
  const sb = await dayState(page, TUE)
  zeroAndFour('N3-b Tuesday 0 pending, the four stand', sb, pt.v0, 'breach → tight turn')
  /* (c) take-off 14:00, land 15:30 — clear 05:30, before every report: nothing */
  await editWeek(page)
  await editText(page, 'ff:0.1.1.to', '14:00'); await editText(page, 'ff:0.1.1.ld', '15:30'); await toasts(page)
  const tc = await times()
  const fc = await daySnap(page, 'face', TUE, [cp])
  check('N3-c land 15:30: Outlaw\'s ring and flag vanish from Tuesday\'s face', noMark(fc.pk[cp]) && fc.issues === f0.issues - 1, `line ${tc}; ${pkLine(fc.pk[cp])}; bar "${f0.warn}" → "${fc.warn}"`)
  await closeups(page, 'face', TUE, cp, `${P}N3-c-tue-face`)
  await dayPic(page, 'face', TUE, `${P}N3-c-tue-face-day`)
  const sc = await dayState(page, TUE)
  zeroAndFour('N3-c Tuesday 0 pending, the four stand', sc, pt.v0, 'breach cleared')
  await shotUnion(page, `${P}N3-c-tue-board-signbar`, ['#sbSignBar'])
  const mc = await daySnap(page, 'week', MON, [cp])
  check('N3-c Monday\'s dotted mark on Outlaw gone', !anyDot(mc.pk[cp]), pkLine(mc.pk[cp]))
  /* (d) put back 19:20 / 20:45 — the breach returns on the face */
  await editWeek(page)
  await editText(page, 'ff:0.1.1.to', '19:20'); await editText(page, 'ff:0.1.1.ld', '20:45'); await toasts(page)
  const td = await times()
  const fd = await daySnap(page, 'face', TUE, [cp])
  check('N3-d put back: the breach returns on Tuesday\'s face', anyRedCR(fd.pk[cp]) && fd.issues === f0.issues, `line ${td}; ${pkLine(fd.pk[cp])}; bar "${fd.warn}"`)
  const sd = await dayState(page, TUE)
  zeroAndFour('N3-d Tuesday 0 pending, the four stand', sd, pt.v0, 'times put back')
})

/* ============ N4 — the day AFTER: Monday published; a Monday late flyer onto Tuesday's early line ============ */
const N4 = wrap('N4', async ({ page, CS, ID }) => {
  const echo = ID['Echo'], rk = 'rocky', cp = 'casper'
  const pm = await publishAndSign(page, MON)
  check('N4-0 Monday published', pm.p.pressed && /ORIG/.test(pm.h.tag), `tag "${norm(pm.h.tag)}"`)
  const f0 = await daySnap(page, 'face', MON, [echo, cp])
  check('N4-0 Echo clean of the dotted mark on Monday\'s face before', !anyDot(f0.pk[echo]), `Echo: ${pkLine(f0.pk[echo])}; Outlaw (breaks Tuesday in the demo): ${pkLine(f0.pk[cp])}`)
  note('N4-0 Outlaw\'s dotted mark on Monday\'s face (demo)', `title "${((f0.pk[cp] || []).find(x => x.dot) || {}).title || '(none)'}"`)
  await closeups(page, 'face', MON, cp, `${P}N4-0-mon-face-outlaw`, { dotted: true })
  const d = await dropOn(page, TUE, '1.0.0.1.w', 'Echo')
  check('N4-1 Echo on Tuesday\'s 08:40 VL line (back seat, in Hex\'s place)', d.now === 'Echo', `seat holds "${d.now}"; said "${d.said}"`)
  const tw = await daySnap(page, 'week', TUE, [echo])
  note('N4-1 Tuesday (draft) Echo', `${pkLine(tw.pk[echo])}; bar "${tw.warn}"`)
  const f1 = await daySnap(page, 'face', MON, [echo])
  const dotted = (f1.pk[echo] || []).filter(x => x.dot)
  check('N4-2 Monday\'s published face shows the dotted "breaks tomorrow" mark on Echo at once', dotted.length > 0, `${pkLine(f1.pk[echo])}; title "${dotted[0] ? dotted[0].title : ''}"; chip title "${dotted[0] ? dotted[0].chipTitle : ''}"`)
  check('N4-2 the mark says Tuesday is broken and when he had to leave', dotted.some(x => /Crew rest — Tuesday is broken by this day: he had to leave by \d\d:\d\d/.test(x.title + ' ' + x.chipTitle)), dotted.map(x => x.title).join(' | '))
  check('N4-2 Monday\'s own warning count unchanged', f1.issues === f0.issues, `"${f0.warn}" → "${f1.warn}"`)
  await closeups(page, 'face', MON, echo, `${P}N4-2-mon-face`, { dotted: true })
  await dayPic(page, 'face', MON, `${P}N4-2-mon-face-day`)
  const s1 = await dayState(page, MON)
  zeroAndFour('N4-2 Monday 0 pending, the four stand', s1, pm.v0, 'after Tuesday\'s draft change')
  await shotUnion(page, `${P}N4-2-mon-board-signbar`, ['#sbSignBar'])
  const b = await dropOn(page, TUE, '1.0.0.1.w', CS[rk])
  check('N4-3 Hex back on Tuesday\'s line', b.now === CS[rk], `seat holds "${b.now}"; said "${b.said}"`)
  const f3 = await daySnap(page, 'face', MON, [echo])
  check('N4-3 the dotted mark on Echo gone from Monday\'s face', !anyDot(f3.pk[echo]), pkLine(f3.pk[echo]))
  const s3 = await dayState(page, MON)
  zeroAndFour('N4-3 Monday still 0 pending, the four stand', s3, pm.v0, 'Tuesday put back')
})

await N1(); await N2(); await N3(); await N4()
check('no console errors', !ALL_ERRORS.length, ALL_ERRORS.slice(0, 6).join(' | '))
process.exitCode = summary(`late-pub NEIGHBOUR walk (${W})`) ? 1 : 0
