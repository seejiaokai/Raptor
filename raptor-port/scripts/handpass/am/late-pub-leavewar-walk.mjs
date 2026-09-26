/* [LEAVE-LATE-PUBLISHED]'s FULL check — walker "leavewar" (26 Sep 26). A LEAVE WAR change that lands on a PUBLISHED
   schedule day. Written as assertions of the RIGHT behaviour — a PASS means correct, and re-running it IS the re-walk.
   Every world is a fresh demo, made through the app's own controls only: the board's sign-off selects and Publish, the
   Leave War's event row and its sheet, its day boxes, the bid sheet (a leave, Approve / Ack / Clear), the stage strip,
   the published-stage remarks sheet; read back on the edit week, the board, both ⓘ panels, the Amendments panel, the
   pending list and View-only Sched (the published face).
     LW1  D2 / Fable F3 — a holiday declared on the war after Tuesday was published: EXACTLY 1 pending (what the day
          earns), the advisory live on the face at once, the four fall; the holiday taken off → 0, advisory gone, four stand
     LW2  D177 — a leave bid and approved on the war onto a published Monday: 1 "filed", face without it, working copy
          with it; back to a bid (Ack) → 0; approved again → 1; cleared on the war → 0
     LW3  Fable F1 — a Mon–Tue leave approved on the war, Mon/Tue/Wed published, the leave extended on the war to Wed:
          Mon 0, Tue 0 (their faces did not move), Wed 1 "filed"
     LW4  the war's PUBLISHED-stage remarks sheet on an approved leave on a published Monday: 1 pending with the new
          words in the list; View-only Sched keeps the old words
   Usage (from raptor-port/, the build served on 4177): node scripts/handpass/am/late-pub-leavewar-walk.mjs [desktop|phone] [LW1|LW2|LW3|LW4] */
const W = process.argv[2] || 'desktop'
const ONLY = (process.argv[3] || '').toUpperCase()
process.env.HP_URL = 'http://localhost:4177'
process.env.HP_SHOTS = `C:/Users/User/projects/Raptor/raptor-port/docs/img/handpass/2026-09-26-late-pub/leavewar/${W}`
const L = await import('./w2-lib.mjs')
const W1 = await import('./w1-lib.mjs')
const W4 = await import('./w4-lib.mjs')
const { openHi, editWeek, board, signDay, publishDay, head, go, check, note, summary, screen } = L
const { toastSpy, toasts, panel, shotUnion, norm } = W1
const PHONE = W === 'phone'
const SIZE = PHONE ? { width: 390, height: 844 } : { width: 1440, height: 900 }
const MON = 0, TUE = 1, WED = 2
const ISO = ['2026-07-13', '2026-07-14', '2026-07-15']
const num = s => { const m = /(\d+)/.exec(String(s || '')); return m ? +m[1] : 0 }
const ALL_ERRORS = []
const tag = s => `${W}-${s}`

async function world() {
  const w = await openHi({ ...SIZE, dpr: PHONE ? 3 : 1, state: null })
  await toastSpy(w.page)
  w.CS = await w.page.evaluate(() => Object.fromEntries(Object.entries(window.PEOPLE).map(([k, p]) => [k, p.cs])))
  return w
}
/* aircrew with nothing on Mon–Wed: not on any seat, desk, sim, ground or programme row those days, no input covering
   them, a row drawn on the war (READ only — for choosing whom to walk with) */
async function freeMen(page) {
  await W4.lwOpen(page, ISO[0])
  return page.evaluate(() => {
    const busy = new Set()
    for (let di = 0; di < 3; di++) {
      const d = window.DAYS[di]
      d.waves.forEach(w => w.formations.forEach(f => f.aircraft.forEach(a => { if (a.p) busy.add(a.p); if (a.w) busy.add(a.w) })))
      ;(d.dutywaves || []).forEach(b => b.rows.forEach(r => { if (r.id) busy.add(r.id); (r.more || []).forEach(m => m && busy.add(m)) }))
      ;['oft', 'amt'].forEach(k => (d.sims[k] || []).forEach(x => { if (x.p) busy.add(x.p); if (x.w) busy.add(x.w); (x.pax || []).forEach(p => busy.add(p)) }))
      ;(d.ground || []).forEach(g => g.who && busy.add(g.who))
      ;(d.allhands || []).forEach(a => (Array.isArray(a.who) ? a.who : [a.who]).forEach(v => v && busy.add(v)))
    }
    for (const x of window.INPUTS) if (/Jul 1[3-5]/.test(`${x.date} ${x.endDate || ''}`) || /Jul 1[0-2]/.test(x.date) && x.endDate) busy.add(x.person)
    return Object.entries(window.PEOPLE)
      .filter(([k, p]) => (p.seat === 'FCP' || p.seat === 'RCP') && !p.sans && k !== 'allavail' && k !== 'all' && !busy.has(k))
      .map(([k]) => k)
      .filter(k => document.querySelector(`[data-testid="row-${k}"]`))
  })
}
async function pubOnBoard(page, di) {
  await board(page, di)
  const sg = await signDay(page, di, 0)
  const p = await publishDay(page, di)
  await toasts(page)
  return { sg, p, h: await head(page, di) }
}
/* publish, then sign the four again (nothing waiting) — the signed state a late change must take down */
async function pubAndSign(page, di) {
  const pub = await pubOnBoard(page, di)
  await signDay(page, di, 0)
  return { pub, v: await signVals(page, di) }
}
/* every count a person can read for day di: the week head, the board strip, both ⓘ panels, the Amendments panel */
async function counts(page, di) {
  const c = {}
  await editWeek(page)
  const hw = await head(page, di); c.week = norm(hw.pending); c.weekNys = hw.nys
  const iw = await W1.dayInfo(page, di, 'week'); c.infoWeek = iw.pend || '(none)'; await W1.closeDayInfo(page)
  const P = await panel(page)
  const dow = ['Mon', 'Tue', 'Wed'][di]
  c.panel = P.visible ? ((P.days.find(d => (d.text || '').startsWith(dow)) || {}).text || '(not listed)') : '(no panel at this width)'
  await board(page, di)
  const hb = await head(page, di); c.board = norm(hb.pending); c.boardNys = hb.nys; c.signLine = norm(hb.signState)
  const ib = await W1.dayInfo(page, di, 'board'); c.infoBoard = ib.pend || '(none)'; await W1.closeDayInfo(page)
  return c
}
function agree(id, c, want, what) {
  const n = { week: num(c.week), board: num(c.board), infoWeek: num(c.infoWeek), infoBoard: num(c.infoBoard) }
  const pm = /· (\d+) change/.exec(c.panel || ''); if (!/no panel/.test(c.panel)) n.panel = pm ? +pm[1] : 0
  const bad = Object.entries(n).filter(([, v]) => v !== want)
  check(id, !bad.length, `${what}: every count reads ${want}` + (bad.length ? ` — DISAGREE: ${bad.map(([k, v]) => k + '=' + v).join(', ')}` : '') + ` · ${JSON.stringify(c)}`)
}
const signVals = (page, di) => page.evaluate(di => [...document.querySelectorAll(`#schedBoard select[data-signday="${di}"]`)].filter(s => s.offsetWidth || s.offsetHeight).map(s => (s.options[s.selectedIndex] || {}).text || ''), di)
async function fourFell(page, di) { await board(page, di); const v = await signVals(page, di); const h = await head(page, di); return { v, fell: v.every(x => !x || /—|sign/i.test(x)), line: norm(h.signState) } }
/* the pending list, opened from the edit week's day head, read (its lines), pictured, closed */
async function pendList(page, di, shot) {
  await editWeek(page)
  const b = page.locator(`#eWeek .day[data-day="${di}"] [data-pendlist="${di}"]:visible`).first()
  if (!(await b.count())) return { text: '(no pending button)', n: 0, lines: [] }
  await b.evaluate(e => e.scrollIntoView({ block: 'center' })); await b.click(); await page.waitForTimeout(400)
  const r = await page.evaluate(() => {
    const p = document.querySelector('#pendList')
    if (!p) return { text: '(closed)', n: 0, lines: [] }
    const items = [...p.querySelectorAll('.pl-item')]
    return { text: p.innerText.replace(/\s+/g, ' ').trim(), n: items.length, lines: items.map(e => e.innerText.replace(/\s+/g, ' ').trim()) }
  })
  if (shot) await shotUnion(page, shot, ['#pendList'])
  await page.keyboard.press('Escape'); await page.waitForTimeout(200)
  return r
}
/* a day's text as View-only Sched's published face shows it, and its picture (+ the Unavailable close-up) */
async function faceText(page, di, shot) {
  await go(page, 'viewsched'); await page.waitForTimeout(400)
  const sel = `#vWeek .day[data-day="${di}"]`
  /* the text WITHOUT the day's warning strip: the strip is the one place a live advisory may show (LIVE_ON_FACE), and
     whether it is folded is the reader's own view state — both are read and pictured separately (strip()) */
  const t = await page.evaluate(s => { const d = document.querySelector(s); if (!d) return '(no day)'
    const c = d.cloneNode(true); c.querySelectorAll('.dwbox').forEach(x => x.remove())
    const host = document.createElement('div'); host.style.cssText = 'position:absolute;left:-99999px;top:0;width:' + d.offsetWidth + 'px'
    host.appendChild(c); document.body.appendChild(host); const txt = c.innerText.replace(/\s+/g, ' '); host.remove(); return txt }, sel)
  if (shot) {
    await W4.frame(page, sel); await screen(page, shot)
    if (await page.locator(`${sel} .sec-unav`).count()) await shotUnion(page, shot + '-unavail', [`${sel} .sec-unav`])
  }
  return t
}
/* the day's Unavailable block on the published face / the working copy, as its rows */
async function unavOn(page, where, di) {
  if (where === 'face') { await go(page, 'viewsched'); await page.waitForTimeout(300) } else await editWeek(page)
  return W4.readUnav(page, `${where === 'face' ? '#vWeek' : '#eWeek'} .day[data-day="${di}"]`)
}
/* one man's row in the day's Unavailable block (its words, remarks included) on the face or the working copy, pictured */
async function unavRow(page, where, di, id, shot) {
  if (where === 'face') { await go(page, 'viewsched'); await page.waitForTimeout(300) } else await editWeek(page)
  const sel = `${where === 'face' ? '#vWeek' : '#eWeek'} .day[data-day="${di}"] .sec-unav .pl-row:has([data-person="${id}"])`
  const t = await page.evaluate(s => { const r = document.querySelector(s); if (!r) return '(no row)'
    const vals = [...r.querySelectorAll('input, textarea')].map(e => e.value).filter(Boolean)
    return (r.innerText.replace(/\s+/g, ' ').trim() + (vals.length ? ' [' + vals.join(' | ') + ']' : '')) }, sel)
  if (shot && t !== '(no row)') await shotUnion(page, shot, [sel], { pad: 10 })
  return t
}
/* the day's warning strip on a surface ('#vWeek' — View-only Sched, or '#eWeek'), opened, read, pictured */
async function strip(page, root, di, shot) {
  if (root === '#vWeek') { await go(page, 'viewsched'); await page.waitForTimeout(300) } else await editWeek(page)
  const s = page.locator(`${root} [data-daywarn="${di}"]:visible`).first()
  if (!(await s.count())) { if (shot) { await W4.frame(page, `${root} .day[data-day="${di}"]`); await screen(page, shot) } return { head: 'NO STRIP', items: [] } }
  const headTxt = norm(await s.innerText())
  const open = await page.locator(`${root} [data-dwbox="${di}"].open`).count()
  if (!open) { await s.evaluate(e => e.scrollIntoView({ block: 'center' })); await s.click(); await page.waitForTimeout(400) }
  const items = await page.evaluate(([q, i]) => [...document.querySelectorAll(`${q} [data-dwbox="${i}"] .witem`)].map(e => e.innerText.replace(/\s+/g, ' ').trim()), [root, di])
  if (shot) await shotUnion(page, shot, [`${root} [data-dwbox="${di}"]`])
  /* fold it back the way it was found, so the reader's view state does not leak into the next read */
  if (!open) { const s2 = page.locator(`${root} [data-daywarn="${di}"]:visible`).first(); if (await s2.count()) { await s2.click(); await page.waitForTimeout(300) } }
  return { head: headTxt, items }
}
const ADVISE = /started earning OIL after it was published/i

/* ------------------------------------------------------------------ the Leave War's own controls */
async function click(page, loc) {
  await loc.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })).catch(() => {})
  await page.waitForTimeout(150)
  try { await loc.click({ timeout: 4000 }) } catch { await loc.click({ force: true, timeout: 4000 }) }
  await page.waitForTimeout(600)
}
/* the event row's cell for a date → its sheet → type a word and Save (or Delete when text is null) */
async function lwEvent(page, iso, text, shot) {
  await W4.lwOpen(page, iso)
  const ev = page.locator(`[data-testid="event-0-${iso}"]`).first()
  if (!(await ev.count())) return { ok: false, why: 'no event cell drawn for ' + iso }
  await click(page, ev)
  if (!(await page.locator('[data-testid="event-apply"]:visible').count())) return { ok: false, why: 'the event sheet did not open' }
  if (text === null) {
    if (shot) await screen(page, shot)
    const del = page.locator('[data-testid="event-delete"]:visible').first()
    if (!(await del.count())) { await click(page, page.locator('[data-testid="event-cancel"]').first()); return { ok: false, why: 'no Delete on the sheet' } }
    await click(page, del)
  } else {
    await page.locator('[data-testid="event-text"]').first().fill(text); await page.waitForTimeout(200)
    const cur = norm(await page.locator('[data-testid="event-tag-current"]').first().innerText().catch(() => ''))
    if (shot) await screen(page, shot)
    await click(page, page.locator('[data-testid="event-apply"]').first())
    return { ok: true, tagShown: cur }
  }
  return { ok: true }
}
async function lwHead(page, iso) {
  return page.evaluate(d => { const h = document.querySelector(`[data-testid="head-${d}"]`); const e = document.querySelector(`[data-testid="event-0-${d}"]`)
    return { head: h ? h.className + ' | ' + h.innerText.replace(/\s+/g, ' ') : 'NO HEAD', event: e ? e.innerText.replace(/\s+/g, ' ').trim() : 'NO EVENT CELL' } }, iso)
}
/* the war stays mounted (hidden) behind the other pages, so its cells exist in the page while another page is up —
   come back to it through its own tab and month strip before any read or tap */
async function onWar(page, iso) { if (await page.evaluate(() => window.CURPAGE) !== 'leavewar') await W4.lwOpen(page, iso) }
const lwCell = async (page, id, iso) => { await onWar(page, iso); return W4.lwCell(page, id, iso) }
const lwShot = async (page, name, id, iso) => { await onWar(page, iso); return W4.lwShot(page, name, id, iso) }
const lwBid = async (page, id, iso, code) => { await onWar(page, iso); return W4.lwBid(page, id, iso, code) }
/* tap a man's box and press Approve — on the bid sheet's decision row, or on the tap list */
async function lwDecide(page, id, iso, which = 'approve') {
  await onWar(page, iso)
  const t = await W4.lwTap(page, id, iso)
  let b
  if (t.opened === 'bid-picker') b = page.locator(`[data-testid="decide-${which}"]:visible`).first()
  else if (t.opened === 'daylist') b = page.locator(`[data-testid^="dl-${which === 'approve' ? 'approve' : which === 'ack' ? 'ack' : 'refuse'}-"]:visible`).first()
  if (!b || !(await b.count())) { await W4.lwCloseSheet(page); return { done: false, opened: t.opened, why: `no ${which} control`, tap: t } }
  await click(page, b)
  const still = await page.locator('[data-testid="bid-picker"], [data-testid="daylist-sheet"]').count()
  const msg = still ? norm(await page.locator('[data-testid="shift-problem"], [data-testid="daylist-msg"], [data-testid="span-note"]').allInnerTexts().then(a => a.join(' '))) : ''
  if (still) await W4.lwCloseSheet(page)
  return { done: !still, opened: t.opened, msg }
}
/* the bid sheet's Clear on a man's box (the door that reaches a war-approved leave) */
async function lwClear(page, id, iso) {
  await onWar(page, iso)
  const t = await W4.lwTap(page, id, iso)
  if (t.opened !== 'bid-picker') { await W4.lwCloseSheet(page); return { done: false, opened: t.opened } }
  await click(page, page.locator('[data-testid="bid-clear"]:visible').first())
  const still = await page.locator('[data-testid="bid-picker"]').count()
  const msg = still ? norm((await page.locator('[data-testid="span-note"]').allInnerTexts()).join(' ')) : ''
  if (still) await W4.lwCloseSheet(page)
  return { done: !still, msg }
}
/* the war's stage strip: press "→ next" until the war reads `want` (the admin's own control) */
async function lwStageTo(page, want) {
  const seen = []
  for (let i = 0; i < 4; i++) {
    const now = norm(await page.locator('[data-testid="stage-now"]:visible').first().innerText().catch(() => 'NO STAGE CHIP'))
    seen.push(now)
    if (now === want) return { ok: true, seen }
    const adv = page.locator('[data-testid="stage-advance"]:visible').first()
    if (!(await adv.count())) return { ok: false, seen, why: 'no stage-advance control on screen at this width' }
    await click(page, adv)
    const ok = page.getByRole('button', { name: /^(Yes|OK|Confirm|Publish)/ }).first()
    if (await ok.count() && await ok.isVisible().catch(() => false)) { await ok.click(); await page.waitForTimeout(500) }
  }
  return { ok: false, seen }
}
const inputsOf = (page, id) => page.evaluate(p => window.INPUTS.filter(x => x.person === p && /Jul 1[3-5]/.test(`${x.date} ${x.endDate || ''}`)).map(x => ({ iid: x.iid, type: x.type, date: x.date, endDate: x.endDate || '', remarks: x.remarks, lw: x.lw || '', acc: x.acc || '' })), id)

/* ================= LW1 — a holiday declared on the war after Tuesday went out (D2, Fable F3) ================= */
async function worldLW1() {
  const { browser, page, errors, CS } = await world()
  try {
    const crew = await page.evaluate(() => { const s = new Set(); const d = window.DAYS[1]; d.waves.forEach(w => w.formations.forEach(f => f.aircraft.forEach(a => { if (a.p) s.add(a.p); if (a.w) s.add(a.w) }))); return [...s] })
    const { pub, v: v0 } = await pubAndSign(page, TUE)
    check('LW1.0 publish Tuesday', pub.p.pressed && /ORIG/.test(pub.h.tag) && !num(pub.h.pending), `tag "${pub.h.tag}", pending "${norm(pub.h.pending)}", signed again ${JSON.stringify(v0)}`)
    const f0 = await faceText(page, TUE, tag('LW1-0-face-before'))
    const s0 = await strip(page, '#vWeek', TUE)
    note('LW1.0 the face\'s warnings before', `${s0.head} :: ${JSON.stringify(s0.items)}`)
    await W4.lwOpen(page, ISO[TUE])
    const box0 = await lwCell(page, crew[0], ISO[TUE])
    const e = await lwEvent(page, ISO[TUE], 'PH', tag('LW1-1-event-sheet'))
    await toasts(page)
    const h1 = await lwHead(page, ISO[TUE])
    check('LW1.1 the war\'s event row takes the holiday', e.ok && /PH/.test(h1.event), `sheet ${JSON.stringify(e)}; 14 Jul head "${h1.head}", event cell "${h1.event}"`)
    await lwShot(page, tag('LW1-1-war-ph'), crew[0], ISO[TUE])
    const box1 = await lwCell(page, crew[0], ISO[TUE])
    check('LW1.1 nobody is credited before a republication (D2)', !/FO|HO/.test(box1.box) || box1.box === box0.box, `${CS[crew[0]]} (flies Tuesday) box "${box0.box}" → "${box1.box}"`)
    /* at once — no reload, no other page first: View-only Sched straight after the war */
    const sv = await strip(page, '#vWeek', TUE, tag('LW1-2-face-warnings'))
    check('LW1.2 the face shows the advisory at once (D2, LIVE_ON_FACE)', sv.items.some(x => ADVISE.test(x)), `View-only Sched Tuesday strip "${sv.head}" :: ${JSON.stringify(sv.items)}`)
    const f1 = await faceText(page, TUE, tag('LW1-2-face-after'))
    const c1 = await counts(page, TUE)
    agree('LW1.3 holiday declared → EXACTLY 1 everywhere (F3: not 2)', c1, 1, 'Tuesday made a PH on the war after it was published')
    const fl = await fourFell(page, TUE)
    check('LW1.3 the four fall (D103)', fl.fell && /to sign/.test(fl.line), `boxes ${JSON.stringify(fl.v)}, sign line "${fl.line}"`)
    await shotUnion(page, tag('LW1-3-board-signbar'), ['#sbSignBar'])
    const pl = await pendList(page, TUE, tag('LW1-3-pending-list'))
    check('LW1.3 the list holds ONE line — what the day earns — and no warnings line (F3)', pl.n === 1 && /earns/i.test(pl.text) && !/warning/i.test(pl.text), `${pl.n} line(s): ${JSON.stringify(pl.lines)} · "${pl.text}"`)
    if (!PHONE) { const P = await panel(page); note('LW1.3 the Amendments panel', JSON.stringify(P.days)) }
    const sw = await strip(page, '#eWeek', TUE, tag('LW1-3-week-warnings'))
    note('LW1.3 the working copy\'s strip', `${sw.head} :: ${JSON.stringify(sw.items)}`)
    await editWeek(page); await W4.frame(page, `#eWeek .day[data-day="${TUE}"]`); await screen(page, tag('LW1-3-week-head'))
    /* ---- take the holiday off again ---- */
    const d = await lwEvent(page, ISO[TUE], null, tag('LW1-4-event-sheet-delete'))
    await toasts(page)
    const h2 = await lwHead(page, ISO[TUE])
    check('LW1.4 the holiday comes off the war', d.ok && !/PH/.test(h2.event), `sheet ${JSON.stringify(d)}; event cell "${h2.event}"`)
    const c2 = await counts(page, TUE)
    agree('LW1.4 holiday taken off → 0 everywhere', c2, 0, 'the PH deleted again')
    const sv2 = await strip(page, '#vWeek', TUE, tag('LW1-4-face-warnings'))
    check('LW1.4 the advisory is gone from the face', !sv2.items.some(x => ADVISE.test(x)), `${sv2.head} :: ${JSON.stringify(sv2.items)}`)
    await board(page, TUE)
    const v2 = await signVals(page, TUE)
    check('LW1.4 the four stand again', v0.length === 4 && JSON.stringify(v2) === JSON.stringify(v0), `boxes ${JSON.stringify(v2)} (signed: ${JSON.stringify(v0)})`)
    await shotUnion(page, tag('LW1-4-board-signbar'), ['#sbSignBar'])
    const f2 = await faceText(page, TUE, tag('LW1-4-face-after'))
    check('LW1 the face (warning strip aside) is the issued one throughout', f1 === f0 && f2 === f0, `while the holiday stood: ${f1 === f0 ? 'byte-for-byte' : 'DIFFERS'}; after: ${f2 === f0 ? 'byte-for-byte' : 'DIFFERS'}` + (f1 !== f0 ? ` · before "${f0.slice(0, 300)}" / during "${f1.slice(0, 300)}"` : ''))
  } finally { ALL_ERRORS.push(...errors.map(e => 'LW1 ' + e)); await browser.close() }
}

/* ================= LW1b — the other order: a holiday that went out, REVOKED on the war after publishing (D2, F3) ======= */
const REVOKE = /stopped being a holiday after it was published/i
async function worldLW1b() {
  const { browser, page, errors, CS } = await world()
  try {
    const crew = await page.evaluate(() => { const s = new Set(); const d = window.DAYS[1]; d.waves.forEach(w => w.formations.forEach(f => f.aircraft.forEach(a => { if (a.p) s.add(a.p); if (a.w) s.add(a.w) }))); return [...s] })
    const e = await lwEvent(page, ISO[TUE], 'PH')
    await toasts(page)
    note('LW1b.0 Tuesday made a PH on the war BEFORE publishing', JSON.stringify(e))
    const { pub, v: v0 } = await pubAndSign(page, TUE)
    check('LW1b.0 publish the holiday Tuesday', pub.p.pressed && /ORIG/.test(pub.h.tag) && !num(pub.h.pending), `tag "${pub.h.tag}", pending "${norm(pub.h.pending)}", signed again ${JSON.stringify(v0)}`)
    const box0 = await lwCell(page, crew[0], ISO[TUE])
    await lwShot(page, tag('LW1b-0-war-credited'), crew[0], ISO[TUE])
    note('LW1b.0 the war after publishing the holiday', `${CS[crew[0]]}'s 14 Jul box "${box0.box}" (${box0.cls})`)
    const f0 = await faceText(page, TUE, null)
    const d = await lwEvent(page, ISO[TUE], null, tag('LW1b-1-event-sheet-delete'))
    const said = await toasts(page)
    const h1 = await lwHead(page, ISO[TUE])
    const box1 = await lwCell(page, crew[0], ISO[TUE])
    check('LW1b.1 the holiday comes off the war; the credit waits for a republication (D2)', d.ok && !/PH/.test(h1.event) && box1.box === box0.box, `sheet ${JSON.stringify(d)}, said ${JSON.stringify(said)}; event cell "${h1.event}"; ${CS[crew[0]]}'s box "${box0.box}" → "${box1.box}"`)
    const sv = await strip(page, '#vWeek', TUE, tag('LW1b-1-face-warnings'))
    check('LW1b.1 the face says so at once (LIVE_ON_FACE)', sv.items.some(x => REVOKE.test(x)), `${sv.head} :: ${JSON.stringify(sv.items)}`)
    const c1 = await counts(page, TUE)
    agree('LW1b.2 holiday revoked → EXACTLY 1 everywhere (F3: not 2)', c1, 1, 'the PH taken off after the holiday went out')
    const fl = await fourFell(page, TUE)
    check('LW1b.2 the four fall', fl.fell && /to sign/.test(fl.line), `boxes ${JSON.stringify(fl.v)}, sign line "${fl.line}"`)
    const pl = await pendList(page, TUE, tag('LW1b-2-pending-list'))
    check('LW1b.2 ONE line — what the day earns — no warnings line', pl.n === 1 && /earns/i.test(pl.text) && !/warning/i.test(pl.text), `${pl.n}: ${JSON.stringify(pl.lines)}`)
    const f1 = await faceText(page, TUE, tag('LW1b-2-face'))
    check('LW1b.2 the face (strip aside) is the issued one', f1 === f0, f1 === f0 ? 'byte-for-byte' : 'DIFFERS')
    /* ---- and back: the holiday put on again → nothing waiting ---- */
    await lwEvent(page, ISO[TUE], 'PH'); await toasts(page)
    const c2 = await counts(page, TUE)
    agree('LW1b.3 holiday put back → 0 everywhere', c2, 0, 'the PH declared again')
    const sv2 = await strip(page, '#vWeek', TUE)
    check('LW1b.3 the advisory is gone', !sv2.items.some(x => REVOKE.test(x) || ADVISE.test(x)), `${sv2.head} :: ${JSON.stringify(sv2.items)}`)
    await board(page, TUE)
    const v2 = await signVals(page, TUE)
    check('LW1b.3 the four stand again', JSON.stringify(v2) === JSON.stringify(v0), `boxes ${JSON.stringify(v2)} (signed: ${JSON.stringify(v0)})`)
  } finally { ALL_ERRORS.push(...errors.map(e => 'LW1b ' + e)); await browser.close() }
}

/* ================= LW2 — a leave bid and approved on the war onto a published Monday (D177) ================= */
async function worldLW2() {
  const { browser, page, errors, CS } = await world()
  try {
    const free = await freeMen(page)
    const who = free[0]
    note('LW2 whom', `${CS[who]} (${who}) — nothing on Mon–Wed; free men: ${free.map(k => CS[k]).join(', ')}`)
    const { pub, v: v0 } = await pubAndSign(page, MON)
    check('LW2.0 publish Monday', pub.p.pressed && /ORIG/.test(pub.h.tag), `tag "${pub.h.tag}", signed again ${JSON.stringify(v0)}`)
    const f0 = await faceText(page, MON, tag('LW2-0-face-before'))
    await W4.lwOpen(page, ISO[MON])
    const bid = await lwBid(page, who, ISO[MON], 'LL')
    await toasts(page)
    const cb = await lwCell(page, who, ISO[MON])
    note('LW2.1 the bid', `${JSON.stringify({ placed: bid.placed, why: bid.why, asked: bid.askedFirst })} → box "${cb.box}" (${cb.cls})`)
    const cB = await counts(page, MON)
    agree('LW2.1 a bid alone is not an input → 0', cB, 0, `${CS[who]}'s LL bid, not decided`)
    const ap = await lwDecide(page, who, ISO[MON], 'approve')
    await toasts(page)
    const ca = await lwCell(page, who, ISO[MON])
    await lwShot(page, tag('LW2-2-war-approved'), who, ISO[MON])
    check('LW2.2 Approve on the war', ap.done && /LL/.test(ca.box), `${JSON.stringify(ap)}; box "${ca.box}" (${ca.cls}); inputs ${JSON.stringify(await inputsOf(page, who))}`)
    const c1 = await counts(page, MON)
    agree('LW2.2 approved → 1 everywhere (D177)', c1, 1, `${CS[who]}'s leave approved on the war after Monday was published`)
    const fl = await fourFell(page, MON)
    check('LW2.2 the four fall (D103)', fl.fell && /to sign/.test(fl.line), `boxes ${JSON.stringify(fl.v)}, sign line "${fl.line}"`)
    const pl = await pendList(page, MON, tag('LW2-2-pending-list'))
    check('LW2.2 the list names it: filed', pl.n === 1 && /filed/i.test(pl.text) && new RegExp(CS[who], 'i').test(pl.text), `${pl.n} line(s): "${pl.text}"`)
    const uw = await unavOn(page, 'week', MON)
    check('LW2.2 the working copy\'s Unavailable shows it', Array.isArray(uw) && uw.some(r => r.endsWith(':' + who)), JSON.stringify(uw))
    await shotUnion(page, tag('LW2-2-week-unavail'), [`#eWeek .day[data-day="${MON}"] .sec-unav`])
    const uf = await unavOn(page, 'face', MON)
    const f1 = await faceText(page, MON, tag('LW2-2-face-after'))
    check('LW2.2 the published face does NOT show it (D177)', !(Array.isArray(uf) && uf.some(r => r.endsWith(':' + who))) && f1 === f0, `face Unavailable ${JSON.stringify(uf)}; text ${f1 === f0 ? 'byte-for-byte as before' : 'DIFFERS'}`)
    /* ---- back to a bid through the same sheet (Ack) ---- */
    const ak = await lwDecide(page, who, ISO[MON], 'ack')
    await toasts(page)
    const ck = await lwCell(page, who, ISO[MON])
    note('LW2.3 Ack on the approved leave', `${JSON.stringify(ak)}; box "${ck.box}" (${ck.cls}); inputs ${JSON.stringify(await inputsOf(page, who))}`)
    await lwShot(page, tag('LW2-3-war-acked'), who, ISO[MON])
    const c2 = await counts(page, MON)
    agree('LW2.3 back to a bid → 0 everywhere', c2, 0, 'the approval taken back (Ack)')
    await board(page, MON)
    const v2 = await signVals(page, MON)
    check('LW2.3 the four stand again', JSON.stringify(v2) === JSON.stringify(v0), `boxes ${JSON.stringify(v2)} (signed: ${JSON.stringify(v0)})`)
    /* ---- approved again, then Cleared on the war ---- */
    const ap2 = await lwDecide(page, who, ISO[MON], 'approve')
    await toasts(page)
    const c3 = await counts(page, MON)
    agree('LW2.4 approved again → 1', c3, 1, `re-approved (${JSON.stringify(ap2)})`)
    const cl = await lwClear(page, who, ISO[MON])
    await toasts(page)
    const cc = await lwCell(page, who, ISO[MON])
    await lwShot(page, tag('LW2-5-war-cleared'), who, ISO[MON])
    check('LW2.5 Clear on the war removes the approved leave', cl.done && !/LL/.test(cc.box), `${JSON.stringify(cl)}; box "${cc.box}"; inputs ${JSON.stringify(await inputsOf(page, who))}`)
    const c4 = await counts(page, MON)
    agree('LW2.5 cleared → 0 everywhere', c4, 0, 'the leave removed on the war')
    await board(page, MON)
    const v4 = await signVals(page, MON)
    check('LW2.5 the four stand again', JSON.stringify(v4) === JSON.stringify(v0), `boxes ${JSON.stringify(v4)} (signed: ${JSON.stringify(v0)})`)
    await shotUnion(page, tag('LW2-5-board-signbar'), ['#sbSignBar'])
  } finally { ALL_ERRORS.push(...errors.map(e => 'LW2 ' + e)); await browser.close() }
}

/* ================= LW2b — the same door onto a man FLYING the published Monday: the working copy rings him, the face
   keeps what it went out with (D177 + D179: a leave's clash is not one of the live warnings) ================= */
async function worldLW2b() {
  const { browser, page, errors, CS } = await world()
  try {
    const { pub, v: v0 } = await pubAndSign(page, MON)
    /* a man flying Monday whose puck wears NO ring on the published face — so a ring that appears is the leave's */
    await go(page, 'viewsched'); await page.waitForTimeout(300)
    const who = await page.evaluate(() => {
      const fliers = []; (window.DAYS[0].waves || []).forEach(w => w.formations.forEach(f => f.aircraft.forEach(a => { if (a.p) fliers.push(a.p); if (a.w) fliers.push(a.w) })))
      const clean = id => [...document.querySelectorAll(`#vWeek .day[data-day="0"] .puck[data-person="${id}"]`)].every(p => !/boxred|boxdash|boxdot/.test(p.className))
      const busyInp = new Set(window.INPUTS.filter(x => /Jul 13/.test(x.date)).map(x => x.person))
      return fliers.find(id => clean(id) && !busyInp.has(id)) || fliers[0]
    })
    note('LW2b whom', `${CS[who]} (${who}) — flies Monday, no ring on the published face`)
    check('LW2b.0 publish Monday', pub.p.pressed && /ORIG/.test(pub.h.tag), `tag "${pub.h.tag}"`)
    const ring = (root) => page.evaluate(([s, id]) => [...document.querySelectorAll(`${s} .puck[data-person="${id}"]`)].map(p => p.className.replace(/\s+/g, ' ')).join(' || ') || '(no puck)', [`${root} .day[data-day="0"]`, who])
    await go(page, 'viewsched'); await page.waitForTimeout(300)
    const r0 = await ring('#vWeek')
    const f0 = await faceText(page, MON, null)
    const sf0 = await strip(page, '#vWeek', MON)
    const b = await lwBid(page, who, ISO[MON], 'LL'); await toasts(page)
    const a = await lwDecide(page, who, ISO[MON], 'approve'); await toasts(page)
    const inp = await inputsOf(page, who)
    check('LW2b.1 approved on the war over his published flight', a.done && inp.some(x => x.type === 'LL'), `${JSON.stringify({ placed: b.placed, why: b.why })} / ${JSON.stringify(a)} → ${JSON.stringify(inp)}`)
    const c1 = await counts(page, MON)
    agree('LW2b.1 → 1 everywhere', c1, 1, `${CS[who]}'s leave over his Monday flight`)
    const pl = await pendList(page, MON, tag('LW2b-1-pending-list'))
    check('LW2b.1 the list: one line, filed', pl.n === 1 && /filed/i.test(pl.text), `${pl.n}: ${JSON.stringify(pl.lines)}`)
    await editWeek(page)
    const rw = await ring('#eWeek')
    check('LW2b.2 the working copy rings him', /boxred|hard|warn|ring/.test(rw), `edit week puck(s): "${rw}"`)
    await shotUnion(page, tag('LW2b-2-week-puck'), [`#eWeek .day[data-day="0"] .puck[data-person="${who}"]`], { pad: 60 })
    const sw = await strip(page, '#eWeek', MON, tag('LW2b-2-week-warnings'))
    note('LW2b.2 the working copy\'s strip', `${sw.head} :: ${JSON.stringify(sw.items.filter(x => new RegExp(CS[who]).test(x)))}`)
    await go(page, 'viewsched'); await page.waitForTimeout(300)
    const rv = await ring('#vWeek')
    await shotUnion(page, tag('LW2b-3-face-puck'), [`#vWeek .day[data-day="0"] .puck[data-person="${who}"]`], { pad: 60 })
    const f1 = await faceText(page, MON, tag('LW2b-3-face'))
    const sf1 = await strip(page, '#vWeek', MON, tag('LW2b-3-face-warnings'))
    check('LW2b.3 the published face: no row, no new ring, the same warnings', rv === r0 && f1 === f0 && sf1.head === sf0.head && JSON.stringify(sf1.items) === JSON.stringify(sf0.items),
      `face puck "${rv}" (before "${r0}"); text ${f1 === f0 ? 'byte-for-byte' : 'DIFFERS'}; strip "${sf0.head}" → "${sf1.head}"`)
    /* and off again on the war */
    const cl = await lwClear(page, who, ISO[MON]); await toasts(page)
    const c2 = await counts(page, MON)
    agree('LW2b.4 cleared on the war → 0', c2, 0, `the leave removed (${JSON.stringify(cl)})`)
    await board(page, MON)
    const v2 = await signVals(page, MON)
    check('LW2b.4 the four stand again', JSON.stringify(v2) === JSON.stringify(v0), `boxes ${JSON.stringify(v2)} (signed: ${JSON.stringify(v0)})`)
  } finally { ALL_ERRORS.push(...errors.map(e => 'LW2b ' + e)); await browser.close() }
}

/* ================= LW3 — a leave stretched on the war over published days (Fable F1) ================= */
async function worldLW3() {
  const { browser, page, errors, CS } = await world()
  try {
    const free = await freeMen(page)
    const who = free[1] || free[0]
    note('LW3 whom', `${CS[who]} (${who})`)
    /* the two-day leave first, through the war: a bid on each day, each approved (the second extends the first) */
    await W4.lwOpen(page, ISO[MON])
    for (const iso of [ISO[MON], ISO[TUE]]) {
      const b = await lwBid(page, who, iso, 'LL'); await toasts(page)
      const a = await lwDecide(page, who, iso, 'approve'); await toasts(page)
      note(`LW3.0 ${iso} bid + approve`, `${JSON.stringify({ placed: b.placed, why: b.why })} / ${JSON.stringify(a)}`)
    }
    const in0 = await inputsOf(page, who)
    check('LW3.0 one approved input Mon–Tue', in0.length === 1 && /Jul 13/.test(in0[0].date) && /Jul 14/.test(in0[0].endDate), JSON.stringify(in0))
    await lwShot(page, tag('LW3-0-war-montue'), who, ISO[MON])
    const signed = {}
    for (const di of [MON, TUE, WED]) {
      const { pub, v } = await pubAndSign(page, di); signed[di] = v
      check(`LW3.0 publish ${['Mon', 'Tue', 'Wed'][di]}`, pub.p.pressed && /ORIG/.test(pub.h.tag), `tag "${pub.h.tag}"`)
    }
    const faces0 = {}
    for (const di of [MON, TUE, WED]) faces0[di] = await faceText(page, di, di === MON ? tag('LW3-0-face-mon-before') : null)
    /* ---- stretch it to Wednesday on the war ---- */
    await W4.lwOpen(page, ISO[WED])
    const b = await lwBid(page, who, ISO[WED], 'LL'); await toasts(page)
    const a = await lwDecide(page, who, ISO[WED], 'approve'); await toasts(page)
    const in1 = await inputsOf(page, who)
    await lwShot(page, tag('LW3-1-war-montuewed'), who, ISO[TUE])
    check('LW3.1 the war extends the one input to Wednesday', a.done && in1.length === 1 && /Jul 15/.test(in1[0].endDate), `${JSON.stringify({ placed: b.placed })} / ${JSON.stringify(a)} → ${JSON.stringify(in1)}`)
    for (const di of [MON, TUE]) {
      const c = await counts(page, di)
      agree(`LW3.2 ${['Mon', 'Tue'][di]} → 0 (its face did not move — F1)`, c, 0, `${['Monday', 'Tuesday'][di]}, already covered, the leave stretched past it`)
      const pl = await pendList(page, di, tag(`LW3-2-pending-${['mon', 'tue'][di]}`))
      if (pl.n) note(`LW3.2 ${['Mon', 'Tue'][di]}'s pending list`, `${pl.n}: ${JSON.stringify(pl.lines)}`)
      await board(page, di)
      const v = await signVals(page, di)
      check(`LW3.2 ${['Mon', 'Tue'][di]}'s four stand`, JSON.stringify(v) === JSON.stringify(signed[di]), `boxes ${JSON.stringify(v)} (signed: ${JSON.stringify(signed[di])})`)
      const f = await faceText(page, di, null)
      check(`LW3.2 ${['Mon', 'Tue'][di]}'s published face unchanged`, f === faces0[di], f === faces0[di] ? 'byte-for-byte' : 'DIFFERS')
      /* what moved on this day, if anything: his Unavailable row on each surface, words and close-up */
      const d3 = ['mon', 'tue'][di]
      const rf = await unavRow(page, 'face', di, who, tag(`LW3-2-${d3}-face-row`))
      const rw = await unavRow(page, 'week', di, who, tag(`LW3-2-${d3}-week-row`))
      note(`LW3.2 ${['Mon', 'Tue'][di]}: ${CS[who]}'s Unavailable row`, `published face "${rf}" · working copy "${rw}"`)
    }
    const cw = await counts(page, WED)
    agree('LW3.3 Wed → 1 (newly covered)', cw, 1, 'Wednesday, now covered by the stretched leave')
    const pw = await pendList(page, WED, tag('LW3-3-pending-wed'))
    check('LW3.3 Wednesday\'s list: filed', pw.n === 1 && /filed/i.test(pw.text) && new RegExp(CS[who], 'i').test(pw.text), `${pw.n}: "${pw.text}"`)
    const fw = await faceText(page, WED, tag('LW3-3-face-wed'))
    check('LW3.3 Wednesday\'s published face does not show it', fw === faces0[WED], fw === faces0[WED] ? 'byte-for-byte as before' : 'DIFFERS')
  } finally { ALL_ERRORS.push(...errors.map(e => 'LW3 ' + e)); await browser.close() }
}

/* ================= LW4 — the war's published-stage remarks sheet on a published day ================= */
async function worldLW4() {
  const { browser, page, errors, CS } = await world()
  try {
    const free = await freeMen(page)
    const who = free[2] || free[0]
    note('LW4 whom', `${CS[who]} (${who})`)
    await W4.lwOpen(page, ISO[MON])
    const b = await lwBid(page, who, ISO[MON], 'LL'); await toasts(page)
    const a = await lwDecide(page, who, ISO[MON], 'approve'); await toasts(page)
    const in0 = await inputsOf(page, who)
    check('LW4.0 a leave approved on the war (open stage)', a.done && in0.length === 1, `${JSON.stringify({ placed: b.placed })} / ${JSON.stringify(a)} → ${JSON.stringify(in0)}`)
    const old = in0[0] ? in0[0].remarks : ''
    const { pub, v: v0 } = await pubAndSign(page, MON)
    check('LW4.0 publish Monday (the leave on it)', pub.p.pressed && /ORIG/.test(pub.h.tag) && !num(pub.h.pending), `tag "${pub.h.tag}", pending "${norm(pub.h.pending)}"`)
    const f0 = await faceText(page, MON, tag('LW4-0-face-before'))
    const uf0 = await unavOn(page, 'face', MON)
    check('LW4.0 the face shows the leave', Array.isArray(uf0) && uf0.some(r => r.endsWith(':' + who)), JSON.stringify(uf0))
    await W4.lwOpen(page, ISO[MON])
    const st = await lwStageTo(page, 'PUBLISHED')
    await toasts(page)
    await screen(page, tag('LW4-1-war-published-stage'))
    check('LW4.1 the war moved to PUBLISHED (admin\'s stage strip)', st.ok, JSON.stringify(st))
    const t = await W4.lwTap(page, who, ISO[MON])
    const sheet = await page.locator('[data-testid="remarks-sheet"]:visible').count()
    await screen(page, tag('LW4-2-remarks-sheet'))
    check('LW4.2 tapping the approved leave opens the remarks sheet', !!sheet, `opened ${t.opened}${sheet ? ' + remarks-sheet' : ''}; lines ${JSON.stringify(t.lines)}`)
    if (sheet) {
      const was = await page.locator('[data-testid="remarks-field"]').first().inputValue()
      await page.locator('[data-testid="remarks-field"]').first().fill('REMARKS EDITED ON THE WAR WALK')
      await click(page, page.locator('[data-testid="remarks-save"]').first())
      await toasts(page)
      note('LW4.2 saved', `field was "${was}"; sheet ${await page.locator('[data-testid="remarks-sheet"]:visible').count() ? 'STILL OPEN' : 'closed'}; inputs ${JSON.stringify(await inputsOf(page, who))}`)
    }
    const c1 = await counts(page, MON)
    agree('LW4.3 remarks edited on the war → 1 everywhere (D178)', c1, 1, `${CS[who]}'s approved leave, remarks edited at the war's published stage`)
    const fl = await fourFell(page, MON)
    check('LW4.3 the four fall', fl.fell && /to sign/.test(fl.line), `boxes ${JSON.stringify(fl.v)}, sign line "${fl.line}"`)
    const pl = await pendList(page, MON, tag('LW4-3-pending-list'))
    check('LW4.3 the list carries the new words', pl.n === 1 && /REMARKS EDITED ON THE WAR WALK/.test(pl.text), `${pl.n}: "${pl.text}"`)
    const f1 = await faceText(page, MON, tag('LW4-3-face-after'))
    check('LW4.3 View-only Sched keeps the old words', !/REMARKS EDITED ON THE WAR WALK/.test(f1) && (!old || f1.includes(old)) && f1 === f0, `old "${old}"; face ${f1 === f0 ? 'byte-for-byte as before' : 'DIFFERS'}`)
    const uw = await unavOn(page, 'week', MON)
    await shotUnion(page, tag('LW4-3-week-unavail'), [`#eWeek .day[data-day="${MON}"] .sec-unav`])
    const wk = await page.evaluate(i => { const d = document.querySelector(`#eWeek .day[data-day="${i}"] .sec-unav`); return d ? d.innerText.replace(/\s+/g, ' ') : '' }, MON)
    check('LW4.3 the working copy shows the new words', /REMARKS EDITED ON THE WAR WALK/.test(wk), `Unavailable ${JSON.stringify(uw)} · "${wk.slice(0, 200)}"`)
  } finally { ALL_ERRORS.push(...errors.map(e => 'LW4 ' + e)); await browser.close() }
}

for (const [k, fn] of [['LW1', worldLW1], ['LW1B', worldLW1b], ['LW2', worldLW2], ['LW2B', worldLW2b], ['LW3', worldLW3], ['LW4', worldLW4]]) {
  if (ONLY && ONLY !== k) continue
  try { await fn() } catch (e) { check(`${k} ran to the end`, false, 'THREW: ' + String(e && e.stack || e).slice(0, 600)) }
}
check('no console errors', !ALL_ERRORS.length, ALL_ERRORS.slice(0, 6).join(' | '))
process.exitCode = summary(`late-pub leavewar walk (${W}${ONLY ? ' ' + ONLY : ''})`) ? 1 : 0
