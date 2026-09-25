/* Walker B1 (amendment batch, 25 Sep 26) — DESKTOP: the one count (D109), the pending list (D99, D100, D104),
   the jump (D107), the signatures (D103) and the marker (D97), on a fresh world (the seed week, nothing
   published), Monday published through the app's own controls.
   Every check is an assertion of the RIGHT behaviour: PASS = correct. Pictures: docs/img/handpass/
   2026-09-25-amendment-batch/b1/. Reads of window.* are for the evidence only; nothing is written through window.
   Run from raptor-port/: node scripts/handpass/am/b1-01-count-desktop.mjs */
process.env.HP_SHOTS = process.env.HP_REWALK || 'C:/Users/User/projects/Raptor/raptor-port/docs/img/handpass/2026-09-25-amendment-batch/b1'   // HP_REWALK: the re-walk's own folder, so the first walk's pictures stay
const L = await import('./w2-lib.mjs')
const W = await import('./w1-lib.mjs')
const { openHi, editWeek, board, closeBoard, signDay, publishDay, publishAL, head, go, lookAt, pvBar, pvTap, put,
  check, note, summary, screen, menuLive, switchTo, altPlan, viewPick, login } = L
const { toastSpy, toasts, panel, shotBox, shotUnion, boardType, dragTo, norm } = W
const SH = process.env.HP_SHOTS
const MON = 0, TUE = 1, WED = 2
const num = s => { const m = /(\d+)/.exec(String(s || '')); return m ? +m[1] : 0 }

const { browser, page, errors } = await openHi({ width: 1440, height: 900, dpr: 1, state: null })
await toastSpy(page)
const ids = await page.evaluate(() => Object.fromEntries(Object.entries(window.PEOPLE).map(([k, p]) => [p.cs, k])))
const idOf = cs => ids[cs]
const FREE = await page.evaluate(() => { const j = JSON.stringify(window.DAYS[0]); return Object.keys(window.PEOPLE).filter(k => !j.includes('"' + k + '"') && !/^(ALL|ALLAVAIL)/i.test(k)) })
const CS = await page.evaluate(() => Object.fromEntries(Object.entries(window.PEOPLE).map(([k, p]) => [k, p.cs])))

/* ---- gestures, all through the app's own controls ------------------------------------------------------- */
/** drag a seated puck (board) onto another seat or a fill cell, with a real mouse */
async function dragPuck(fromSlot, toSel, { low = false } = {}) {
  const src = page.locator(`#schedBoard [data-slot="${fromSlot}"] .puck:visible`).first()
  const dst = page.locator(`#schedBoard ${toSel}:visible`).first()
  if (!(await src.count()) || !(await dst.count())) return 'missing ' + (await src.count() ? toSel : fromSlot)
  await src.evaluate(e => e.scrollIntoView({ block: 'center' }))
  await page.waitForTimeout(250)
  const a = await src.boundingBox(), b = await dst.boundingBox()
  await page.mouse.move(a.x + a.width / 2, a.y + a.height / 2)
  await page.mouse.down()
  await page.mouse.move(a.x + a.width / 2 + 6, a.y + a.height / 2 + 6, { steps: 3 })
  /* low: let go in the cell's lower-right corner, BELOW its puck (drag.ts: landed below a puck = add, not swap) */
  const tx = low ? b.x + b.width - 8 : b.x + Math.min(b.width / 2, 30), ty = low ? b.y + b.height - 3 : b.y + Math.min(b.height / 2, 10)
  await page.mouse.move(tx, ty, { steps: 12 })
  await page.waitForTimeout(120)
  await page.mouse.up()
  await page.waitForTimeout(800)
  return 'dropped'
}
/** right-click a filled seat: the app takes the man off it */
async function takeOff(slot) {
  const s = page.locator(`#schedBoard [data-slot="${slot}"] .puck:visible`).first()
  if (!(await s.count())) return 'no puck at ' + slot
  await s.evaluate(e => e.scrollIntoView({ block: 'center' }))
  await s.click({ button: 'right' }); await page.waitForTimeout(700)
  return (await toasts(page)).join(' / ')
}
async function dayVal(fn) { return page.evaluate(fn) }

/* ---- every count a person can read for Monday --------------------------------------------------------- */
async function counts(tag, { sign = true, discard = false } = {}) {
  const c = {}
  await editWeek(page)
  c.week = norm((await head(page, MON)).pending)
  c.weekBtn = await page.locator(`#eWeek .day[data-day="${MON}"] [data-pendlist="${MON}"]`).count()
  const iw = await W.dayInfo(page, MON, 'week'); c.infoWeek = iw.pend || '(none)'; await W.closeDayInfo(page)
  const P = await panel(page); c.panel = (P.days.find(d => (d.text || '').startsWith('Mon')) || {}).text || '(not listed)'
  await board(page, MON)
  const hb = await head(page, MON)
  c.board = norm(hb.pending)
  const ib = await W.dayInfo(page, MON, 'board'); c.infoBoard = ib.pend || '(none)'; await W.closeDayInfo(page)
  c.nysBefore = await page.evaluate(() => (document.querySelector('#schedBoard .nysmark') || {}).innerText || '')
  c.signsBefore = (await head(page, MON)).signs.join('|')
  if (sign) {
    await signDay(page, MON, 0)
    const h2 = await head(page, MON)
    c.signLine = norm(h2.signState)
    c.nysAfter = await page.evaluate(() => (document.querySelector('#schedBoard .nysmark') || {}).innerText || '')
  }
  if (discard) {
    const ok = await lookAt(page, MON, /Original/)
    c.pvOpen = ok
    if (ok) {
      c.pvBtnInPreview = await page.locator(`#schedBoard [data-pendlist]:visible`).count()
      await pvTap(page, MON, 'data-restore')
      const b = await pvBar(page, MON); c.discard = b ? b.load : '(no bar)'
      await shotUnion(page, `b1-d-${tag}-discard`, ['#schedBoard .dprev-bar'])
      await pvTap(page, MON, 'data-restcancel')
      await pvTap(page, MON, 'data-golive')
    }
  }
  return c
}
function agreeAll(id, c, want, what) {
  const n = { week: num(c.week), board: num(c.board), infoWeek: num(c.infoWeek), infoBoard: num(c.infoBoard),
    panel: /Mon · (\d+) change/.test(c.panel) ? +/Mon · (\d+) change/.exec(c.panel)[1] : 0 }
  if (c.signLine != null) n.signLine = /(\d+) changes? to publish/.test(c.signLine) ? +/(\d+) changes? to publish/.exec(c.signLine)[1] : 0
  if (c.discard != null) n.discard = /Discard (\d+) edit/.test(c.discard) ? +/Discard (\d+) edit/.exec(c.discard)[1] : 0
  const bad = Object.entries(n).filter(([, v]) => v !== want)
  check(id, !bad.length, `${what}: every count reads ${want}` + (bad.length ? ` — DISAGREE: ${bad.map(([k, v]) => k + '=' + v).join(', ')}` : ''), )
  console.log('      counts', JSON.stringify(c))
  return n
}

try {
  /* ================= FIXTURE: a crowd on FLIGHT SAFETY, then Monday signed and published ================= */
  await editWeek(page)
  await board(page, MON)
  const allIds = Object.values(ids)
  note('FIX-free', `men not on Monday at all: ${FREE.map(x => CS[x]).join(', ')}`)
  const disarm = async () => { await page.keyboard.press('Escape'); await page.waitForTimeout(200); if (await page.evaluate(() => !!(window.ARM && window.ARM.key))) { await page.keyboard.press('Escape'); await page.waitForTimeout(200) } }
  const p1 = await put(page, `[data-fill="a:${MON}.2.+"]`, FREE.slice(0, 6))
  await disarm()
  let p2 = await put(page, `[data-fill="a:${MON}.2.+"]`, FREE.slice(1, 8).filter(x => x !== p1))
  if (/FAILED/.test(p2)) { await disarm(); p2 = await put(page, `[data-fill="a:${MON}.2.+"]`, FREE.slice(2, 10).filter(x => x !== p1)) }
  await disarm()
  const crowd = await dayVal(() => window.DAYS[0].allhands[2].who)
  note('FIX-crowd', `FLIGHT SAFETY STAND-DOWN crowd before publishing: ${JSON.stringify((Array.isArray(crowd) ? crowd : [crowd]).map(x => CS[x] || x))} (added ${CS[p1] || p1}, ${CS[p2] || p2})`)
  await toasts(page)
  const sg = await signDay(page, MON, 0)
  const pub = await publishDay(page, MON)
  const h0 = await head(page, MON)
  check('FIX-publish', pub.pressed && /ORIG/i.test(h0.tag) && !h0.pending, `Monday published through Publish day: tag "${h0.tag}", pending "${norm(h0.pending)}"`, )
  note('FIX-signers', JSON.stringify(sg))
  check('M-1 gone after publishing', !(await page.locator('#schedBoard .nysmark:visible').count()), 'no "Not yet signed/published" marker on a freshly published day with nothing waiting')
  await shotUnion(page, 'b1-d-00-published', ['#sbSignBar'])

  /* ================= 1. ONE COUNT (D109) ================= */
  // A — Warden MET + NOTAM BRIEF → the empty SODB (his own case)
  const warden = idOf('Warden')
  const r1 = await dragPuck(`a:${MON}.1.0`, `[data-fill="a:${MON}.0.+"]`)
  const afterA = await dayVal(() => ({ sodb: window.DAYS[0].allhands[0].who, met: window.DAYS[0].allhands[1].who }))
  note('C-A gesture', `${r1}; SODB now ${JSON.stringify(afterA.sodb)}, MET + NOTAM now ${JSON.stringify(afterA.met)}; toasts ${JSON.stringify(await toasts(page))}`)
  check('S-1 wiped by the change', (await head(page, MON)).signs.every(s => !s || /name/.test(s)), 'D103: the first change on the published day leaves the four sign-off boxes blank')
  check('M-2 not yet signed', /Not yet signed/.test(await page.evaluate(() => (document.querySelector('#schedBoard .nysmark') || {}).innerText || '')), 'D97: marker reads "Not yet signed" while unsigned (board)')
  await shotUnion(page, 'b1-d-01-A-board-strip', ['#sbSignBar'])
  let exp = 0
  const tookA = afterA.sodb === warden || (Array.isArray(afterA.sodb) && afterA.sodb.includes(warden)); exp += tookA ? 1 : 0
  let c = await counts('A', { discard: true })
  agreeAll('C-1 move = 1', c, exp, 'Warden MET + NOTAM BRIEF → SODB')
  check('M-3 not yet published', c.nysAfter === 'Not yet published', `D97: once all four are signed the marker reads "Not yet published" (got "${c.nysAfter}")`)
  check('C-1b week chip is a button', c.weekBtn === 1, 'the week head "1 pending" is a button (data-pendlist)')
  check('C-1c no button under a preview', c.pvBtnInPreview === 0, 'while the Original is previewed on the board, the strip carries no pending button')
  await editWeek(page)
  await shotBox(page, 'b1-d-02-A-week-head', `#eWeek .day[data-day="${MON}"] .day-head`)

  // B — another man into the row Warden left
  await board(page, MON)
  const s0 = (await head(page, MON)).signs.join('|')
  const reaper = await put(page, `[data-fill="a:${MON}.1.+"]`, FREE.slice(8, 16).filter(x => x !== p1 && x !== p2))
  await disarm()
  const sB = (await head(page, MON)).signs
  check('S-2 wiped again', sB.every(s => !s || /name/.test(s)), `D103: signed before (${s0}); a further change blanks all four (now ${sB.join('|')})`)
  note('C-B gesture', `put ${CS[reaper] || reaper} into MET + NOTAM BRIEF; ${JSON.stringify(await toasts(page))}`)
  exp += /FAILED/.test(reaper) ? 0 : 1
  c = await counts('B', { discard: true })
  agreeAll('C-2 then another man in = 2', c, exp, `${CS[reaper] || reaper} into the row Warden left`)

  // C — a swap of two pilots (Saber FCP of VL ac1 with Ranger FCP of VL ac2)
  const before = await dayVal(() => window.DAYS[0].waves[0].formations[0].aircraft.map(a => a.p))
  const r3 = await dragPuck(`${MON}.0.0.0.p`, `[data-slot="${MON}.0.0.1.p"]`)
  const after = await dayVal(() => window.DAYS[0].waves[0].formations[0].aircraft.map(a => a.p))
  note('C-C gesture', `${r3}; VL front seats ${before.map(x => CS[x]).join('/')} → ${after.map(x => CS[x]).join('/')}; ${JSON.stringify(await toasts(page))}`)
  exp += (after[0] === before[1] && after[1] === before[0]) ? 2 : 0
  c = await counts('C')
  agreeAll('C-3 swap = 2 more', c, exp, 'a swap of two pilots adds two')

  // D — a desk holder moved onto his own desk's extras line
  const r4 = await dragPuck(`d:${MON}.0.0`, `[data-fill="d:${MON}.0.0.+"]`, { low: true })
  const sdo = await dayVal(() => { const r = window.DAYS[0].dutywaves[0].rows[0]; return { id: r.id, more: r.more } })
  note('C-D gesture', `${r4}; SDO row now holder=${CS[sdo.id] || sdo.id || '(empty)'} extras=${JSON.stringify((sdo.more || []).map(x => CS[x] || x))}; ${JSON.stringify(await toasts(page))}`)
  exp += (sdo.more || []).includes(idOf('Sidewinder')) ? 1 : 0
  c = await counts('D')
  agreeAll('C-4 holder → extras = 1 more', c, exp, 'Sidewinder from the SDO desk to its own extras line')

  // E — two men taken off the crowd
  const t1 = await takeOff(`a:${MON}.2.2`)
  const t2 = await takeOff(`a:${MON}.2.1`)
  note('C-E gesture', `right-click ×2: ${t1} | ${t2}; crowd now ${JSON.stringify(await dayVal(() => window.DAYS[0].allhands[2].who))}`)
  exp += [t1, t2].filter(t => /removed/.test(t)).length
  c = await counts('E')
  agreeAll('C-5 two off a crowd = 2 more', c, exp, 'the two added men taken off FLIGHT SAFETY STAND-DOWN')

  // F — a time change
  await boardType(page, `ap:${MON}.3.str`, '1140')
  exp += 1
  c = await counts('F')
  agreeAll('C-6 time = 1 more', c, exp, 'WPNS & TACTICS SYNC start 11:30 → 11:40')
  // G — a remark
  await boardType(page, `ap:${MON}.4.rmks`, 'B1 remark')
  exp += 1
  c = await counts('G')
  agreeAll('C-7 remark = 1 more', c, exp, 'a remark on STANDARDISATION MEETING')

  // H — a row removed (the ground row FLY WITH)
  const gdel = await page.evaluate(() => [...document.querySelectorAll('#schedBoard [data-grdel]')].filter(e => e.offsetWidth).map(e => e.dataset.grdel + '|' + (e.closest('.sb-arow') || {}).innerText?.replace(/\s+/g, ' ').slice(0, 40)))
  note('C-H buttons', JSON.stringify(gdel))
  const nG0 = await dayVal(() => window.DAYS[0].ground.length)
  const gb = page.locator(`#schedBoard [data-grdel="${MON}.6"]:visible`).first()
  if (await gb.count()) { await gb.evaluate(e => e.scrollIntoView({ block: 'center' })); await gb.click(); await page.waitForTimeout(600)
    if ((await dayVal(() => window.DAYS[0].ground.length)) === nG0 && await gb.count()) { await gb.click(); await page.waitForTimeout(600) } }
  note('C-H gesture', `ground rows ${nG0} → ${await dayVal(() => window.DAYS[0].ground.length)}; ${JSON.stringify(await toasts(page))}`)
  exp += (await dayVal(() => window.DAYS[0].ground.length)) < nG0 ? 1 : 0
  c = await counts('H')
  agreeAll('C-8 row removed = 1 more', c, exp, 'the ground row FLY WITH removed')

  // I — a reorder (Wave 1 dragged below Wave 2)
  const grip = page.locator(`#schedBoard .sb-go[data-move="mv:w.${MON}.0"] .wvgrip:visible`).first()
  const tgt = page.locator(`#schedBoard .sb-go[data-move="mv:w.${MON}.1"] .sb-go-h:visible`).first()
  const r9 = (await grip.count()) && (await tgt.count()) ? await dragTo(page, grip, tgt, { dy: 8 }) : 'no wave grip'
  note('C-I gesture', `${r9}; waves now ${JSON.stringify(await dayVal(() => window.DAYS[0].waves.map(w => w.label)))}`)
  exp += (await dayVal(() => window.DAYS[0].waves[0].label)) === 'WAVE 2' ? 1 : 0
  c = await counts('I', { discard: true })
  agreeAll('C-9 reorder = 1 more', c, exp, 'Wave 1 dragged below Wave 2')

  /* ================= 2. THE PENDING LIST ================= */
  // make it long: five more remarks
  await board(page, MON)
  for (const r of [5, 6, 7, 8, 9]) await boardType(page, `ap:${MON}.${r}.rmks`, `note ${r}`)
  c = await counts('long', { sign: false })
  const N = num(c.week)
  note('L-long', `after five more remarks the week head reads "${c.week}"`)
  await editWeek(page)
  const openList = async (scope) => {
    const b = page.locator(`${scope} [data-pendlist="${MON}"]:visible`).first()
    if (!(await b.count())) return null
    await b.evaluate(e => e.scrollIntoView({ block: 'center' })); await page.waitForTimeout(150)
    await b.click(); await page.waitForTimeout(500)
    return page.evaluate(() => {
      const p = document.querySelector('#pendList'); if (!p) return { open: false }
      const r = p.getBoundingClientRect(), L = p.querySelector('.pl-list')
      return { open: true, head: p.querySelector('.pl-head')?.innerText.replace(/\s+/g, ' ').trim(),
        rows: [...p.querySelectorAll('.pl-item')].map(e => ({ btn: e.tagName === 'BUTTON', where: e.querySelector('.pl-where')?.innerText, chg: e.querySelector('.pl-chg')?.innerText.replace(/\s+/g, ' '), who: e.querySelector('.pl-who')?.innerText.replace(/\s+/g, ' ') })),
        text: p.innerText, box: { top: Math.round(r.top), bottom: Math.round(r.bottom), vh: innerHeight, left: Math.round(r.left), right: Math.round(r.right), vw: innerWidth },
        scroll: { box: [p.scrollHeight, p.clientHeight], list: L ? [L.scrollHeight, L.clientHeight] : null } }
    })
  }
  const listChecks = async (tag, o) => {
    check(`L-${tag}-open`, o && o.open, `${tag}: "N pending ▾" opens the list`)
    if (!o || !o.open) return
    check(`L-${tag}-head`, o.head === `Waiting to go out as AL1 · ${N} changes`, `${tag}: head reads "${o.head}" (want "Waiting to go out as AL1 · ${N} changes")`)
    check(`L-${tag}-rows`, o.rows.length === N, `${tag}: one row per change — ${o.rows.length} rows for ${N}`)
    const mv = o.rows.find(r => /Warden/.test(r.where || ''))
    check(`L-${tag}-move`, mv && /MET \+ NOTAM BRIEF\s*→\s*SODB/.test(mv.chg || ''), `${tag}: the move reads "Warden: MET + NOTAM BRIEF → SODB" — got ${JSON.stringify(mv)}`)
    const rawIds = Object.keys(CS).filter(k => k !== CS[k] && new RegExp(`\\b${k}\\b`).test(o.text))
    check(`L-${tag}-no-ids`, !rawIds.length, `${tag}: callsigns, never ids${rawIds.length ? ' — raw ids seen: ' + rawIds.join(',') : ''}`)
    check(`L-${tag}-no-raw`, !/␟|[{}]|\[\s*"|"\s*\]/.test(o.text), `${tag}: no raw "␟" or JSON on screen`)
    const who = o.rows.filter(r => r.who && /Admin/.test(r.who)).length
    check(`L-${tag}-who`, who >= 1 && o.rows.filter(r => /[0-9]{2}:[0-9]{2}/.test(r.who || '')).length >= 1, `${tag}: who/when for this sitting's changes — ${who} rows say Admin with a time`)
    check(`L-${tag}-scroll`, (o.scroll.box[0] > o.scroll.box[1] + 2 || (o.scroll.list && o.scroll.list[0] > o.scroll.list[1] + 2)) && o.box.bottom <= o.box.vh, `${tag}: ${N} rows scroll INSIDE the window, the window ends on screen (${JSON.stringify(o.scroll)}, box ${JSON.stringify(o.box)})`)
    console.log('      rows', JSON.stringify(o.rows))
  }
  let o = await openList(`#eWeek .day[data-day="${MON}"]`)
  await listChecks('week', o)
  await screen(page, 'b1-d-03-list-week')
  // does its own list scroll with the wheel?
  const pl = page.locator('#pendList .pl-list').first()
  if (await pl.count()) { const bb = await pl.boundingBox(); await page.mouse.move(bb.x + 40, bb.y + 40); await page.mouse.wheel(0, 400); await page.waitForTimeout(300)
    const st = await page.evaluate(() => { const l = document.querySelector('#pendList .pl-list'), p = document.querySelector('#pendList'); return { list: l.scrollTop, box: p.scrollTop, win: scrollY } })
    check('L-week-wheel', (st.list > 0 || st.box > 0), `the wheel scrolls the list inside the window (${JSON.stringify(st)})`)
    await screen(page, 'b1-d-04-list-week-scrolled') }
  await page.keyboard.press('Escape'); await page.waitForTimeout(300)
  check('L-week-esc', !(await page.locator('#pendList').count()), 'Escape closes the list')
  o = await openList(`#eWeek .day[data-day="${MON}"]`)
  await page.mouse.click(700, 880); await page.waitForTimeout(300)
  check('L-week-outside', !(await page.locator('#pendList').count()), 'a tap outside closes the list')
  // the board strip's list
  await board(page, MON)
  o = await openList('#schedBoard')
  await listChecks('board', o)
  await screen(page, 'b1-d-05-list-board')
  await page.keyboard.press('Escape'); await page.waitForTimeout(300)

  /* ================= 3. THE JUMP ================= */
  // from the week's list: tap the Warden move → stays on Edit Schedule, the cell marked, in view
  await editWeek(page)
  await page.evaluate(() => window.scrollTo(0, 0))
  o = await openList(`#eWeek .day[data-day="${MON}"]`)
  const ix = o && o.rows.findIndex(r => /Warden/.test(r.where || ''))
  const jumpFlash = async () => page.evaluate(() => {
    const f = [...document.querySelectorAll('.chgflash')].map(e => { const r = e.getBoundingClientRect(); return { key: e.dataset.slot || e.dataset.fill || e.dataset.bfld || e.dataset.txt || e.className.slice(0, 30), inView: r.top >= 0 && r.bottom <= innerHeight && r.left >= 0 && r.right <= innerWidth, where: e.closest('#schedBoard') ? 'board' : e.closest('#eWeek') ? 'week' : 'other' } })
    return { board: !!(document.querySelector('#schedBoard') && document.querySelector('#schedBoard').offsetWidth), page: window.CURPAGE, flash: f, bub: !!document.querySelector('.histbub.pinned, #histBub.pinned, .hbub.pin') }
  })
  if (ix >= 0) {
    await page.locator(`#pendList [data-plix="${ix}"]`).click(); await page.waitForTimeout(250)
    const j = await jumpFlash()
    await screen(page, 'b1-d-06-jump-week-from-list')
    check('J-1 list → week', !j.board && j.page === 'editsched' && j.flash.some(f => f.where === 'week' && f.inView), `D107: from the week's pending list the view stays on Edit Schedule, the board does NOT open, the change is marked in view — ${JSON.stringify(j)}`)
  } else check('J-1 list → week', false, 'no Warden row to tap')
  await page.waitForTimeout(1600)
  // a removed row in the list is not a button and says so
  o = await openList(`#eWeek .day[data-day="${MON}"]`)
  const still = o ? o.rows.filter(r => !r.btn).map(r => r.where + ' ' + r.chg) : []
  check('J-2 removed row', still.some(s => /removed/.test(s)), `the removed row is listed but not tappable: ${JSON.stringify(still)}`)
  await page.keyboard.press('Escape'); await page.waitForTimeout(200)
  // Edit history (the top bar's, on Edit Schedule): tap the time change
  await page.evaluate(() => window.scrollTo(0, 0))
  await toasts(page)
  await page.locator('#histBtn:visible').first().click(); await page.waitForTimeout(500)
  const hrows = await page.evaluate(() => [...document.querySelectorAll('#histBody .hit')].map((e, i) => ({ i, key: e.dataset.hkey, di: e.dataset.hdi, t: e.innerText.replace(/\s+/g, ' ').slice(0, 70) })))
  note('J-hist rows', JSON.stringify(hrows.slice(0, 30)))
  await screen(page, 'b1-d-07-edit-history')
  const hTime = hrows.find(r => /^ap:0\.3\.str/.test(r.key || '')) || hrows.find(r => /11:40|1140/.test(r.t))
  if (hTime) {
    await page.locator('#histBody .hit').nth(hTime.i).click(); await page.waitForTimeout(250)
    const j = await jumpFlash()
    await screen(page, 'b1-d-08-jump-week-from-history')
    check('J-3 history → week', !j.board && j.page === 'editsched' && j.flash.some(f => f.where === 'week' && f.inView), `D107: a tap in Edit history on Edit Schedule stays on the week and marks the change — ${JSON.stringify(j)}`)
  } else check('J-3 history → week', false, 'no time-change row in Edit history')
  await page.waitForTimeout(1600)
  // Edit history: the removed ground row
  await page.locator('#histBtn:visible').first().click(); await page.waitForTimeout(500)
  const hrows2 = await page.evaluate(() => [...document.querySelectorAll('#histBody .hl-row, #histBody button, #histBody [data-hkey]')].map((e, i) => ({ tag: e.tagName, hit: e.classList.contains('hit'), key: e.dataset.hkey, t: e.innerText.replace(/\s+/g, ' ').slice(0, 80) })))
  const delRow = hrows2.find(r => /FLY WITH|removed|Remove/i.test(r.t))
  note('J-4 removed row in history', JSON.stringify(delRow || 'not listed'))
  if (delRow && delRow.hit) {
    await page.locator(`#histBody [data-hkey="${delRow.key}"]`).first().click(); await page.waitForTimeout(400)
    const tt = await toasts(page)
    check('J-4 removed row says so', tt.some(t => /no longer on this day/.test(t)), `tapping the removed row's history entry says so: ${JSON.stringify(tt)}`)
  } else {
    check('J-4 removed row says so', !!delRow, `the removed row's entry is listed and not a jump button (${delRow ? 'not a button' : 'NOT LISTED'})`)
    if (await page.locator('#histModal:visible').count()) { await page.locator('#histClose').click(); await page.waitForTimeout(300) }
  }
  // the board's own list and History: the board jump (bubble pinned)
  await board(page, MON)
  o = await openList('#schedBoard')
  const ixb = o && o.rows.findIndex(r => /Warden/.test(r.where || ''))
  if (ixb >= 0) {
    await page.locator(`#pendList [data-plix="${ixb}"]`).click(); await page.waitForTimeout(700)
    const j = await jumpFlash()
    const bub = await page.evaluate(() => { const b = [...document.querySelectorAll('[class*=histbub], #histBub, .hbub')].find(e => e.offsetWidth); return b ? { cls: b.className, text: b.innerText.replace(/\s+/g, ' ').slice(0, 120) } : null })
    await screen(page, 'b1-d-09-jump-board-from-list')
    check('J-5 board list → board', j.board && j.flash.some(f => f.where === 'board') && !!bub, `from the board's pending list: stays on the board, marks the cell, the History bubble pinned — ${JSON.stringify({ j, bub })}`)
  } else check('J-5 board list → board', false, 'no Warden row on the board list')
  await page.keyboard.press('Escape'); await page.mouse.click(5, 5); await page.waitForTimeout(400)

  /* ================= 2b. where the list must NOT be a button ================= */
  await go(page, 'viewsched')
  const vBtn = await page.locator('#vWeek [data-pendlist]').count()
  await viewPick(page, MON, 'working')
  const vBtnW = await page.locator('#vWeek [data-pendlist]').count()
  const vNysW = await page.evaluate(() => (document.querySelector('#vWeek .day[data-day="0"] .nysmark') || {}).innerText || '')
  await shotBox(page, 'b1-d-10-view-working-peek', '#vWeek .day[data-day="0"] .day-head')
  await viewPick(page, MON, 'issued')
  const vNysI = await page.evaluate(() => (document.querySelector('#vWeek .day[data-day="0"] .nysmark') || {}).innerText || '')
  await shotBox(page, 'b1-d-11-view-issued', '#vWeek .day[data-day="0"] .day-head')
  check('L-not-view', vBtn === 0 && vBtnW === 0, `View-only Sched: no pending button, issued face (${vBtn}) or working-draft peek (${vBtnW})`)
  check('M-4 issued face', vNysI === '', `the issued face on View-only Sched carries no marker (got "${vNysI}")`)
  check('M-5 working-draft peek', /Not yet (signed|published)/.test(vNysW), `the working-draft peek shows the marker (got "${vNysW}")`)
  // a DRAFT day: a change on Tuesday (never published) shows a count that is NOT a button
  await editWeek(page)
  await board(page, TUE)
  const tueRm = await page.evaluate(() => [...document.querySelectorAll('#schedBoard [data-bfld^="ap:1."][data-bfld$=".rmks"]')].filter(e => e.offsetWidth).map(e => e.dataset.bfld)[0])
  if (tueRm) await boardType(page, tueRm, 'draft edit')
  const tueHead = await head(page, TUE)
  const tueBtn = await page.locator(`#schedBoard [data-pendlist="${TUE}"]`).count()
  await editWeek(page)
  const tueWkBtn = await page.locator(`#eWeek [data-pendlist="${TUE}"]`).count()
  check('L-not-draft', tueBtn === 0 && tueWkBtn === 0, `a DRAFT day (Tuesday, "${norm(tueHead.pending)}"): the count is not a button on the board (${tueBtn}) or the week (${tueWkBtn})`)
  // under a preview on the week
  await lookAt(page, MON, /Original/)
  const pvWk = await page.locator(`#eWeek .day[data-day="${MON}"] [data-pendlist]`).count()
  await shotBox(page, 'b1-d-12-week-preview-head', `#eWeek .day[data-day="${MON}"] .day-head`)
  check('L-not-preview', pvWk === 0, `under a preview of the Original on the week, no pending button (${pvWk})`)
  await pvTap(page, MON, 'data-golive')

  /* ================= 4. SIGNATURES (D103): sign, change, put it back ================= */
  await board(page, MON)
  await signDay(page, MON, 1)
  const sA = (await head(page, MON)).signs.join('|')
  await boardType(page, `ap:${MON}.0.rmks`, 'temp')
  const sBl = (await head(page, MON)).signs.join('|')
  await boardType(page, `ap:${MON}.0.rmks`, '')
  const sBack = (await head(page, MON)).signs.join('|')
  await shotUnion(page, 'b1-d-13-signs-back', ['#sbSignBar'])
  check('S-3 blank then back', /—/.test(sBl) || sBl.split('|').every(s => /name/.test(s)), `signed (${sA}); a further change → the four blank (${sBl})`)
  check('S-4 put back restores', sBack === sA, `putting the change back returns the four (${sBack} vs ${sA})`)

  /* ================= 2c. "earlier" after a reload ================= */
  await closeBoard(page)
  await page.reload(); await page.waitForTimeout(1200)
  if (await page.locator('#luser:visible').count()) { note('R-login', 'the reload asked for the sign-in again'); await login(page, 'a') }
  await page.addStyleTag({ content: '*{scroll-behavior:auto !important}' })
  await toastSpy(page)
  await editWeek(page)
  o = await openList(`#eWeek .day[data-day="${MON}"]`)
  const earlier = o ? o.rows.filter(r => /earlier/.test(r.who || '')).length : 0
  const named = o ? o.rows.filter(r => /Admin/.test(r.who || '')).length : 0
  await screen(page, 'b1-d-14-list-after-reload')
  check('L-earlier', o && earlier > 0 && named === 0, `after a reload the changes read "earlier" (${earlier} earlier, ${named} named)`)
  console.log('      rows', JSON.stringify(o && o.rows))
  await page.keyboard.press('Escape')

  /* ================= 1b. Publish AL: the toast, the history, the ⓘ ================= */
  await board(page, MON)
  const cF = await counts('final', { sign: true })
  const nF = num(cF.week)
  agreeAll('C-10 all agree before AL', cF, nF, 'everything before Publish AL')
  await board(page, MON)
  await toasts(page)
  const pa = await publishAL(page, MON)
  const tt = await toasts(page)
  const iF = await W.dayInfo(page, MON, 'board'); await W.closeDayInfo(page)
  const hF = await head(page, MON)
  await shotUnion(page, 'b1-d-15-after-AL', ['#sbSignBar'])
  await editWeek(page)
  const PF = await panel(page)
  await shotBox(page, 'b1-d-16-panel-after-AL', '#alPanel')
  check('C-11 toast', tt.some(t => new RegExp(`Published AL1 · ${nF} items`).test(t)), `the toast reads "Published AL1 · ${nF} items…" — got ${JSON.stringify(tt)}`)
  check('C-12 history', PF.tags.some(t => new RegExp(`AL1 Mon · ${nF} items`).test(t)), `the Amendments history reads "AL1 Mon · ${nF} items" — got ${JSON.stringify(PF.tags)}`)
  check('C-13 ⓘ items', iF.als.some(a => new RegExp(`AL1 ?${nF} items`).test(a)), `the ⓘ panel reads "AL1 ${nF} items" — got ${JSON.stringify(iF.als)}`)
  check('M-6 gone after AL', !hF.nys && !hF.pending, `after Publish AL the marker and the count are gone (nys=${hF.nys}, pending="${norm(hF.pending)}")`)
  note('C-AL', JSON.stringify({ pa, tag: hF.tag }))
} catch (e) {
  check('RUN', false, 'the script stopped: ' + e.message.split('\n')[0])
  await screen(page, 'b1-d-ZZ-stopped')
}
check('ERR', !errors.length, `browser error list ${errors.length ? JSON.stringify(errors.slice(0, 6)) : 'empty'}`)
summary('B1 desktop')
await browser.close()
