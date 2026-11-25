// Walker w7 — the D2338 walk (chat 147, 23 Nov 26): the re-walk of round 4b's fixes and the Fable fix (R1–R4), and the
// plain-user round (§7.0a), both sizes. Brief: docs/superpowers/briefs/2026-11-23-d2338-walk-brief.md.
// Run from raptor-port/:  RUN=<run> ONLY=r1d,r1p,... node scripts/handpass/sud-w7.mjs
// Uses chat 141/146's helpers (asp-w2-lib.mjs) and sfd-w1-lib.mjs's crew-panel readers. window.* is only READ.
import { DUMP } from './sud-w7-env.mjs'
import { writeFileSync, mkdirSync } from 'node:fs'
import path from 'node:path'
const L = await import('./asp-w2-lib.mjs')
const S = await import('./sfd-w1-lib.mjs')
const { sleep, J, HEX } = L
const VERSION = 'sud-w7 v7'
const ONLY = (process.env.ONLY || 'r1d,r1p,r2d,r2p,r3d,r3p,r3sd,r3sp,r4d,r4p,pud,pup').split(',')
console.log(VERSION, L.URL_, L.OUT, ONLY.join(','))
mkdirSync(DUMP, { recursive: true })
const MON = 0, TUE = 1, FRI = 4, SAT = 5
const VANDAL = 'split'     // R3/R4's man: no input filed, nothing on the schedule this week (probe, read only)
const BT = ['11:00', '11:30'], ET = ['12:00', '14:00']   // clear of Hex's own Tue flight (VL 08:40–10:05)

const shown = (p, sel) => p.evaluate(s => [...document.querySelectorAll(s)].some(e => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 }), sel)
const cs = (p, id) => p.evaluate(id => (window.PEOPLE[id] || {}).cs || id, id)
const recOf = (p, id) => p.evaluate(id => { const q = window.PEOPLE[id]; return q ? { san: !!q.san, sanFrom: q.sanFrom || null, archived: !!q.archived, archivedOn: q.archivedOn || null } : 'no record' }, id)

async function run(name, szKey, when, fn) {
  const sz = L.SIZES[szKey], W = L.mk(name, sz)
  const { b, ctx, p } = await L.world(sz, W, when)
  try {
    await L.signIn(p, 'ad', 'a')
    W.rec('today', "the app's today at the start", null, await L.today(p))
    await fn(p, W, ctx)
  } catch (e) {
    W.rec('ERR', 'script stopped', false, String(e && e.message || e).slice(0, 400), await W.pic(p, 'ERR').catch(() => ''))
  }
  W.rec('errors', 'console / page errors / failed requests', W.errs.length === 0, W.errs.slice(0, 10).join(' || '))
  await b.close()
}

/* the clock moved with the page's own clock (setSystemTime), the page reloaded in the same storage, signed in again */
async function moveTo(p, W, iso, user = 'ad', pass = 'a') {
  await p.clock.setSystemTime(new Date(iso))
  await p.reload(); await sleep(1500)
  if (await p.locator('#luser:visible').count()) await L.signIn(p, user, pass)
  else await p.waitForSelector('#vWeek .day', { state: 'attached' })
  return L.today(p)
}

/* the posting sheet (asp-w2-lib postOut), reporting a missing SANS chip instead of stopping */
async function postOut2(p, W, id, iso, tag) {
  const c = (await L.lwCell(p, W, id, iso)).cell
  if (!c) return { ok: false, why: 'no cell ' + iso }
  await W.press(p, c, 'cell-' + iso)
  await W.press(p, '[data-testid="bid-more"]:visible', 'more')
  await W.press(p, '[data-testid="bid-postout"]:visible', 'postout')
  const chips0 = await p.evaluate(() => [...document.querySelectorAll('[data-testid^="po-"]')].filter(e => e.getBoundingClientRect().width > 0).map(e => e.dataset.testid + (e.getAttribute('aria-pressed') === 'true' ? '[on]' : '')).join(' '))
  const pic0 = await W.pic(p, tag + '-postout-open')
  if (!(await p.locator('[data-testid="po-sans"]:visible').count())) {
    const x = (await p.locator('[data-testid="bid-cancel"]:visible').count()) ? '[data-testid="bid-cancel"]:visible' : '[data-testid="postout-cancel"]:visible'
    await W.press(p, x, 'sheet-x').catch(() => {})
    return { ok: false, why: 'no SANS chip drawn', chips0, pic: pic0 }
  }
  await W.press(p, '[data-testid="po-sans"]:visible', 'po-sans')
  const line = ((await p.locator('[data-testid="po-line"]').first().innerText().catch(() => '')) || '').replace(/\s+/g, ' ')
  const pic = await W.pic(p, tag + '-postout-sheet')
  await W.press(p, '[data-testid="po-confirm"]:visible', 'po-confirm'); await sleep(1000)
  return { ok: true, line, chips0, after: await recOf(p, id), pic: pic0 + ', ' + pic }
}

/* View-only Sched: the day's count chip for the row, opened (the published face) */
async function viewRead(p, W, di, rid, who, tag) {
  await L.go(p, 'viewsched')
  const vs = p.locator(`#vWeek section.day[data-day="${di}"]`).first()
  await vs.evaluate(e => e.scrollIntoView({ block: 'start', inline: 'center' })).catch(() => {}); await sleep(500)
  const r = await L.readCount(p, W, rid, '#vWeek', who)
  r.pic = await W.pic(p, tag)
  await L.closeWin(p, W)
  return r
}
/* "+ SANS" off, on, off: each way the board's count (the working copy) and View-only Sched's (the published face) */
async function both2(p, W, di, rid, tag, who) {
  const out = []
  for (const [i, on] of [[0, false], [1, true], [2, false]]) {
    const k = ['off', 'on', 'off2'][i]
    const sg = await L.sansGroup(p, W, on, i === 1 ? tag : '')
    await L.openBoard(p, W, di)
    const r = await L.readCount(p, W, rid, '#schedBoard', who)
    r.pic = await W.pic(p, `${tag}-${k}-board-win`)
    await L.closeWin(p, W)
    r.pend = await L.pendingOf(p, di)
    await L.closeBoard(p, W)
    const v = await viewRead(p, W, di, rid, who, `${tag}-${k}-view-win`)
    out.push({ on, group: sg.group, r, v })
  }
  return out
}
const say = x => x && x.win && typeof x.win === 'object' ? `chip "${x.chip}", window ${x.win.n}, ${x.win.has ? 'IN' : 'out'}${x.win.has && x.win.san ? ' (purple line)' : ''}` : `chip "${x && x.chip}", window ${J(x && x.win)}, at the chip "${x && x.topAt}"`
function rec2(W, id, what, rs, want, nm) {
  for (const [i, o] of rs.entries()) {
    const k = ['off', 'on', 'off again'][i]
    W.rec(`${id}.${i}w`, `${what} — working copy (the board), "+ SANS" ${k} (group shown: ${o.group})`, !!(o.r.win && typeof o.r.win === 'object' && o.r.win.has === want), `${nm}: ${say(o.r)} · pending ${o.r.pend && o.r.pend.pend}`, o.r.pic)
    W.rec(`${id}.${i}v`, `${what} — published face (View-only Sched), "+ SANS" ${k}`, !!(o.v.win && typeof o.v.win === 'object' && o.v.win.has === want), `${nm}: ${say(o.v)}`, o.v.pic)
  }
  const same = rs.every(o => o.r.win && o.r.win.who === rs[0].r.win.who && o.r.chip === rs[0].r.chip) && rs.every(o => o.v.win && o.v.win.who === rs[0].v.win.who && o.v.chip === rs[0].v.chip)
  W.rec(`${id}.agree`, 'the three readings agree, each face (the people, the count)', same, `board ${rs.map(o => o.r.chip + '/' + (o.r.win && o.r.win.n)).join(' ; ')} · view ${rs.map(o => o.v.chip + '/' + (o.v.win && o.v.win.n)).join(' ; ')}`)
}
async function pendCheck(p, W, id, di, tag) {
  const pl = await L.pendingLines(p, W, di)
  const pic = await W.pic(p, tag)
  const bad = pl.open && /SQN EVENT|ALL AVAIL|OIL|crowd/i.test(pl.lines)
  W.rec(id, "Tue's pending: nothing about the event's crowd or OIL (the lines, RECORDED in the note)", !bad, pl.open ? pl.lines : 'no "N pending" drawn on Edit Schedule', pic)
  await p.keyboard.press('Escape'); await sleep(300)
}
async function restore(p, W, id, iso, tag) {
  await L.usersOpen(p, W)
  if (!(await p.locator('#accArchList').count())) await W.press(p, '#accArchToggle', 'arch-toggle')
  await W.press(p, `#accArchList [data-person="${id}"] .acc-tap`, 'arch-row')
  const pic0 = await W.pic(p, tag + '-restore-open')
  await W.press(p, '#accArPostIn', 'postin-box')
  const day = p.locator(`[data-iso="${iso}"]:visible`).first()
  if (await day.count()) await W.press(p, day, 'postin-day')
  await sleep(300)
  const val = ((await p.locator('#accArPostIn').innerText().catch(() => '')) || '').replace(/\s+/g, ' ').trim()
  const pic1 = await W.pic(p, tag + '-restore-date')
  await W.press(p, '#accArRestore', 'restore'); await sleep(600)
  const said = await L.toastSaid(p)
  const pic2 = await W.pic(p, tag + '-restored')
  return { val, said, st: await recOf(p, id), pic: [pic0, pic1, pic2].join(', ') }
}
async function lwTue(p, W, id, tag) {
  const c = await L.lwCell(p, W, id, '2026-07-14')
  return { text: c.text, pic: await W.pic(p, tag) }
}

/* ---- R1 / R2: Hex posted out as SANS from Mon 13 (R2: ticked by hand first), Tue published, archived Fri, restored ---- */
async function rHex(p, W, ticked) {
  const sg0 = await L.sansGroup(p, W, false, 'a0')
  W.rec('a0', '"+ SANS" set OFF on the Leave War (read back)', sg0.group === false, `group shown: ${sg0.group}`, sg0.pic)
  if (ticked) {
    const q = await L.qualsTick(p, W, HEX, 'a1')
    W.rec('a1', 'Mon 13 Jul: Quals → WSOs → ✎ Edit → Hex\'s SANS cell → Done (read back)', q.st && q.st.san === true, J(q.st), q.pic)
  }
  if (ticked === 'via-on') {
    /* the door with "+ SANS" off: his row is gone from the grid once he is SANS (the final run's FAIL) — pictured — so
       the posting is made from the SANS group's row, "+ SANS" on, and the switch put back OFF before anything else */
    const c0 = await L.lwCell(p, W, HEX, '2026-07-13')
    W.rec('a1b', 'with "+ SANS" off, after the tick: Hex\'s Mon 13 Jul cell on the war (RECORD — the door the final run found missing)', 'REC', c0.cell ? `cell "${c0.text}"` : 'no cell drawn for him', await W.pic(p, 'a1b-war-sans-off'))
    const sgOn = await L.sansGroup(p, W, true, 'a1c')
    W.rec('a1c', '"+ SANS" ON to reach his row (read back)', sgOn.group === true, `group shown: ${sgOn.group}`, sgOn.pic)
  }
  const po = await postOut2(p, W, HEX, '2026-07-13', 'a2')
  if (ticked === 'via-on') {
    const sgOff = await L.sansGroup(p, W, false, 'a2x')
    W.rec('a2x', '"+ SANS" OFF again, before the rest (read back)', sgOff.group === false, `group shown: ${sgOff.group}`, sgOff.pic)
  }
  W.rec('a2', 'Leave War: Hex\'s Mon 13 Jul cell → ⋯ → Post out → SANS → Post out (read back)', po.ok && po.after && po.after.san === true, po.ok ? `line "${po.line}" · chips ${po.chips0} · ${J(po.after)}` : `${po.why} · chips ${po.chips0}`, po.pic)
  if (!po.ok && !ticked) return
  const f = await L.mainFixture(p, W, TUE, HEX, BT, ET)
  W.rec('a3', `Tue 14 Jul: Ground BRIEF ${BT.join('–')} naming Hex, Common SQN EVENT ${ET.join('–')} for ALL AVAIL (read back)`, f.ok, J({ g: f.g.row, a: f.a.row }), await W.pic(p, 'a3-fixture'))
  if (!f.ok) return
  const r0 = await L.readCount(p, W, f.a.row.rid)
  W.rec('a4', 'Tue before: Hex IN the event\'s window (working copy)', !!(r0.win && r0.win.has), say(r0), await W.pic(p, 'a4-before-win'))
  await L.closeWin(p, W)
  const lab = await L.publish(p, W, TUE)
  const pe = await L.pendingOf(p, TUE)
  W.rec('a5', `Tue: four boxes signed, Publish (${lab})`, pe.pend === 0 && !pe.notSigned, J(pe), await W.pic(p, 'a5-published'))
  await L.closeBoard(p, W)
  const v0 = await viewRead(p, W, TUE, f.a.row.rid, HEX, 'a5b-view-before')
  W.rec('a5b', 'Tue published face before the archive: Hex IN', !!(v0.win && v0.win.has), say(v0), v0.pic)
  const c0 = await lwTue(p, W, HEX, 'a5c-lw-tue')
  W.rec('a5c', 'Leave War: Hex\'s Tue 14 Jul cell before the archive (RECORD)', 'REC', `"${c0.text}"`, c0.pic)
  const t = await moveTo(p, W, '2026-07-17T09:00:00')
  W.rec('a6', 'clock → Fri 17 Jul 09:00 (setSystemTime), reloaded, signed in again', /Fri Jul 17 2026/.test(t), `${t} · Hex ${J(await recOf(p, HEX))}`)
  const ar = await L.archive(p, W, HEX, 'a7')
  W.rec('a7', 'Fri 17 Jul: Admin → Users → Hex → Archive (read back)', ar.archived, `note "${ar.said}" · ${J(await recOf(p, HEX))}`, ar.pic)
  if (!ar.archived) return
  rec2(W, 'A8', "Tue's SQN EVENT after the archive: Hex IN", await both2(p, W, TUE, f.a.row.rid, 'a8', HEX), true, 'Hex')
  await pendCheck(p, W, 'a9', TUE, 'a9-tue-pending')
  const c1 = await lwTue(p, W, HEX, 'a9b-lw-tue')
  W.rec('a9b', 'Leave War: Hex\'s Tue 14 Jul cell after the archive: as before', c1.text === c0.text, `before "${c0.text}" · after "${c1.text}"`, c1.pic)
  const rs = await restore(p, W, HEX, '2026-07-20', 'a10')
  W.rec('a10', 'Admin → Users → Archived → Hex: Post in Mon 20 Jul, Restore (read back)', rs.st.archived === false && /20 Jul/.test(rs.val), `post-in "${rs.val}" · note "${rs.said}" · ${J(rs.st)}`, rs.pic)
  if (rs.st.archived !== false) return
  rec2(W, 'A11', "Tue's SQN EVENT after the restore: Hex IN", await both2(p, W, TUE, f.a.row.rid, 'a11', HEX), true, 'Hex')
  await pendCheck(p, W, 'a12', TUE, 'a12-tue-pending')
  const c2 = await lwTue(p, W, HEX, 'a12b-lw-tue')
  W.rec('a12b', 'Leave War: Hex\'s Tue 14 Jul cell after the restore: as before', c2.text === c0.text, `before "${c0.text}" · after "${c2.text}"`, c2.pic)
}
const r1 = (p, W) => rHex(p, W, false)
const r2 = (p, W) => rHex(p, W, true)
const r2b = (p, W) => rHex(p, W, 'via-on')

/* ---- R3 / R4: Vandal ticked SANS by hand Mon 13, nothing filed, named on Tue, Tue published; archived Fri (R3) or Mon (R4) ---- */
async function rVandal(p, W, archiveFri, sansAtArchive) {
  const nm = await cs(p, VANDAL)
  const inp = await p.evaluate(id => (window.INPUTS || []).filter(i => JSON.stringify(i).includes('"' + id + '"')).length, VANDAL)
  const lw = await L.lwCell(p, W, VANDAL, '2026-07-14')
  const lwRow = await p.evaluate(id => ['13', '14', '15', '16', '17', '18', '19'].map(d => { const c = document.querySelector(`[data-testid="cell-${id}-2026-07-${d}"]`); return d + ':' + (c ? ((c.innerText || '').trim() || '·') : 'none') }).join(' '), VANDAL)
  W.rec('b0', `the man: ${nm} (id ${VANDAL}, pilot) — inputs naming him (read) and his Leave War row 13–19 Jul`, inp === 0, `inputs ${inp} · war ${lwRow}`, await W.pic(p, 'b0-lw-row'))
  const sg0 = await L.sansGroup(p, W, false, 'b1')
  W.rec('b1', '"+ SANS" set OFF (read back)', sg0.group === false, `group shown: ${sg0.group}`, sg0.pic)
  const q = await L.qualsTick(p, W, VANDAL, 'b2')
  W.rec('b2', `Mon 13 Jul: Quals → Pilots → ✎ Edit → ${nm}'s SANS cell → Done (read back)`, q.st && q.st.san === true, J(q.st), q.pic)
  const f = await L.mainFixture(p, W, TUE, VANDAL, BT, ET)
  W.rec('b3', `Tue 14 Jul: Ground BRIEF ${BT.join('–')} naming ${nm}, Common SQN EVENT ${ET.join('–')} for ALL AVAIL (read back)`, f.ok, J({ g: f.g.row, a: f.a.row }), await W.pic(p, 'b3-fixture'))
  if (!f.ok) return
  const r0 = await L.readCount(p, W, f.a.row.rid, '#schedBoard', VANDAL)
  W.rec('b4', `Tue before: ${nm} IN the event's window`, !!(r0.win && r0.win.has), say(r0), await W.pic(p, 'b4-before-win'))
  await L.closeWin(p, W)
  const lab = await L.publish(p, W, TUE)
  const pe = await L.pendingOf(p, TUE)
  W.rec('b5', `Tue: four boxes signed, Publish (${lab})`, pe.pend === 0 && !pe.notSigned, J(pe), await W.pic(p, 'b5-published'))
  await L.closeBoard(p, W)
  if (archiveFri) {
    const t = await moveTo(p, W, '2026-07-17T09:00:00')
    W.rec('b6', 'clock → Fri 17 Jul 09:00 (setSystemTime), reloaded, signed in again', /Fri Jul 17 2026/.test(t), `${t} · ${nm} ${J(await recOf(p, VANDAL))}`)
  }
  const sg1 = await L.sansGroup(p, W, sansAtArchive, 'b7')
  W.rec('b7', `"+ SANS" ${sansAtArchive ? 'ON' : 'OFF'} at the archive (read back)`, sg1.group === sansAtArchive, `group shown: ${sg1.group}`, sg1.pic)
  const ar = await L.archive(p, W, VANDAL, 'b8')
  W.rec('b8', `${archiveFri ? 'Fri 17' : 'Mon 13'} Jul: Admin → Users → ${nm} → Archive (read back)`, ar.archived, `note "${ar.said}" · ${J(await recOf(p, VANDAL))}`, ar.pic)
  if (!ar.archived) return
  if (archiveFri) {
    rec2(W, 'B9', `Tue's SQN EVENT after the archive on Fri: ${nm} IN`, await both2(p, W, TUE, f.a.row.rid, 'b9', VANDAL), true, nm)
    await pendCheck(p, W, 'b10', TUE, 'b10-tue-pending')
  } else {
    const rs = await both2(p, W, TUE, f.a.row.rid, 'b9', VANDAL)
    /* R4: EXPECTED out of every day from Mon — the working copy judged; the published face recorded (frozen at publication) */
    for (const [i, o] of rs.entries()) {
      const k = ['off', 'on', 'off again'][i]
      W.rec(`B9.${i}w`, `Tue's SQN EVENT after the archive on Mon: ${nm} OUT — working copy, "+ SANS" ${k}`, !!(o.r.win && typeof o.r.win === 'object' && o.r.win.has === false), `${say(o.r)} · pending ${o.r.pend && o.r.pend.pend}`, o.r.pic)
      W.rec(`B9.${i}v`, `Tue's published face after the archive on Mon, "+ SANS" ${k} (RECORD)`, 'REC', say(o.v), o.v.pic)
    }
    const pl = await L.pendingLines(p, W, TUE)
    W.rec('b10', "Tue's pending lines after the archive on Mon (RECORD)", 'REC', pl.open ? pl.lines : 'no "N pending" drawn', await W.pic(p, 'b10-tue-pending'))
    await p.keyboard.press('Escape'); await sleep(300)
    /* the other days from Mon: his place in the Mon and Wed crew lists (read only) */
    for (const di of [MON, 2]) {
      await L.openBoard(p, W, di)
      const rb = await S.readBoard(p, VANDAL)
      W.rec(`b11-${di}`, `${['Mon', 'Tue', 'Wed'][di]} board after the archive on Mon: ${nm} in the crew list? (expected: not there)`, rb.pucks.length === 0, J(rb.pucks), await W.pic(p, `b11-${di}-crew`))
      await L.closeBoard(p, W)
    }
  }
}
const r3 = (p, W) => rVandal(p, W, true, false)
const r3s = (p, W) => rVandal(p, W, true, true)
const r4 = (p, W) => rVandal(p, W, false, false)

/* ---------------- the plain-user round ---------------- */
/* his crew-list entries under `root`: the entry's hover title, its data-why, the words PRINTED under the name (the box
   wider than 1px — walk-scripts §4), whether struck (class "no"), and where it stands */
const crewOf = (p, root, id) => p.evaluate(([root, id]) => [...document.querySelectorAll(`${root} .rpuck[data-person="${id}"]`)].filter(e => e.getBoundingClientRect().width > 0).map(e => {
  const w = e.querySelector('.rwhy'), wr = w && w.getBoundingClientRect()
  return { where: e.closest('.rsans') ? 'SANS Avail' : e.closest('.rcol') ? ((e.closest('.rcol').querySelector('.rh') || {}).innerText || 'col').replace(/\s+/g, ' ') : '?', struck: e.classList.contains('no'), title: e.getAttribute('title') || '', why: e.getAttribute('data-why') || '', printed: w && wr.width > 1 ? w.textContent : '' }
}), [root, id])
/* a point on the page with nothing pressable under it, outside `avoid` boxes (selectors) */
const quietPoint = (p, avoid) => p.evaluate(avoid => {
  const boxes = avoid.flatMap(s => [...document.querySelectorAll(s)].map(e => e.getBoundingClientRect()).filter(r => r.width > 0))
  const W = innerWidth, H = innerHeight
  for (let y = H - 12; y > 70; y -= 23) for (let x = 12; x < W - 12; x += 29) {
    if (boxes.some(r => x >= r.left - 4 && x <= r.right + 4 && y >= r.top - 4 && y <= r.bottom + 4)) continue
    const e = document.elementFromPoint(x, y)
    if (!e || e.closest('button, a, input, select, textarea, label, [role=button], [role=menuitem], .puck, [data-slot], [data-fill], [data-icday], .floatwin, .bell-list, [data-testid^="cell-"]')) continue
    return { x, y, el: (e.className && String(e.className).slice(0, 40)) || e.tagName }
  }
  return null
}, avoid)
async function tapAt(p, W, pt, label) {
  if (W.isPhone) { await p.touchscreen.tap(pt.x, pt.y); await p.screenshot({ path: path.join(L.OUT, 'taps', `${W.scn}-${label}-now-phone.png`) }).catch(() => {}) }
  else await p.mouse.click(pt.x, pt.y)
  await sleep(500)
}
/* arm a fill zone by its own "+ add" box (walk-scripts §4: the zone's centre holds a puck once a row has people) */
async function armZone(p, W, root, key, label) {
  const zone = p.locator(`${root} [data-fill="${key}"]:visible`).first()
  if (!(await zone.count())) return { arm: null, why: 'no zone ' + key }
  await zone.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await sleep(400)
  const addz = zone.locator('.addz').first()
  const ab = (await addz.count()) ? await addz.boundingBox() : null
  const zb = await zone.boundingBox()
  const pt = ab ? { x: ab.x + ab.width / 2, y: ab.y + ab.height / 2 } : { x: zb.x + zb.width - 8, y: zb.y + zb.height - 6 }
  const top = await p.evaluate(([x, y]) => { const t = document.elementFromPoint(x, y); return t ? (t.className || t.tagName) + '' : 'nothing' }, [pt.x, pt.y])
  if (W.isPhone) { await p.touchscreen.tap(pt.x, pt.y); await p.screenshot({ path: path.join(L.OUT, 'taps', `${W.scn}-${label}-now-phone.png`) }).catch(() => {}) }
  else await p.mouse.click(pt.x, pt.y)
  await sleep(500)
  return { arm: await p.evaluate(() => window.ARM && window.ARM.key), at: `${Math.round(pt.x)},${Math.round(pt.y)} on ${top}${ab ? ' (the "+ add")' : ' (the zone\'s corner)'}` }
}
const bellLines = p => p.evaluate(() => [...document.querySelectorAll('[data-testid="bell-list"] .bl-line')].filter(b => b.getBoundingClientRect().width > 0).map(b => ({ id: b.dataset.testid.replace('bell-line-', ''), unread: b.classList.contains('unread'), name: ((b.querySelector('.bl-name') || {}).textContent || ''), bold: getComputedStyle(b.querySelector('.bl-name') || b).fontWeight, day: ((b.querySelector('.bl-day') || {}).textContent || ''), what: ((b.querySelector('.bl-what') || {}).textContent || '').replace(/\s+/g, ' '), h: Math.round(b.getBoundingClientRect().height) })))
async function bellOpen(p, W, label) {
  const bell = p.locator('button.bellbtn:visible').first()
  const lit = await bell.evaluate(e => e.classList.contains('on')).catch(() => null)
  await W.press(p, bell, label)
  await p.waitForSelector('[data-testid="bell-list"]', { timeout: 4000 }).catch(() => {})
  await sleep(300)
  return { lit, open: await shown(p, '[data-testid="bell-list"]'), lines: await bellLines(p) }
}
const sansLine = ls => ls.find(l => /^sansdue:/.test(l.id))
const lineSay = l => l ? `"${l.name}" (weight ${l.bold}) · "${l.day}" · "${l.what}" · ${l.unread ? 'unread' : 'read'} · ${l.h}px tall` : 'no "Your SANS availability" line'
const winDay = p => p.evaluate(() => { const w = [...document.querySelectorAll('[data-testid="win-sansday"]')].find(e => e.getBoundingClientRect().width > 0); if (!w) return null; const r = w.getBoundingClientRect(); return { ttl: ((w.querySelector('.win-ttl') || {}).textContent || '').replace(/\s+/g, ' ').trim(), tall: w.classList.contains('is-tall'), box: { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) }, add: !!w.querySelector('[data-testid="sd-add"]:not([disabled])') } })

async function pu(p, W) {
  /* 1. the Post out sheet: open, ✕, Escape, a press outside; post out; Undo post out; post out again */
  const sheetUp = () => shown(p, '[data-testid="po-confirm"], [data-testid="bid-cancel"]')
  const openPO = async tag => { const c = (await L.lwCell(p, W, HEX, '2026-07-17')).cell; await W.press(p, c, 'cell-17'); await W.press(p, '[data-testid="bid-more"]:visible', 'more'); await W.press(p, '[data-testid="bid-postout"]:visible', 'postout'); return W.pic(p, tag) }
  let pic = await openPO('p01a-postout-open')
  W.rec('p01a', "Leave War: Hex's Fri 17 Jul → ⋯ → Post out opens the posting part of the sheet", await shown(p, '[data-testid="po-confirm"]'), '', pic)
  await W.press(p, '[data-testid="bid-cancel"]:visible', 'sheet-x')
  W.rec('p01b', 'closed by its ✕', !(await sheetUp()), '', await W.pic(p, 'p01b-closed-x'))
  await openPO('p01c-reopen'); await p.keyboard.press('Escape'); await sleep(500)
  W.rec('p01c', 'closed by Escape', !(await sheetUp()), '', await W.pic(p, 'p01c-closed-esc'))
  if (await sheetUp()) await W.press(p, '[data-testid="bid-cancel"]:visible', 'sheet-x2')
  await openPO('p01d-reopen')
  const sb = await p.evaluate(() => { const e = [...document.querySelectorAll('[data-testid="po-confirm"]')].find(x => x.getBoundingClientRect().width > 0); const s = e && (e.closest('[role=dialog], .lw-sheet, .sheet, [class*="sheet"]') || e.parentElement); return s ? s.className : '' })
  /* the Leave War is presses wall to wall: where no quiet point is found, the grid's CS/Name corner (asp-w2-pu's) */
  /* the sheet's own box measured; the press goes to the screen's bottom-left corner when that is outside it, else its
     top-left, and what stands there is read first */
  const qp = await p.evaluate(() => {
    const c = [...document.querySelectorAll('[data-testid="po-confirm"]')].find(x => x.getBoundingClientRect().width > 0)
    let s = c; while (s && s.parentElement && s.parentElement.getBoundingClientRect().height < innerHeight * 0.95 && s.parentElement !== document.body) s = s.parentElement
    const r = s ? s.getBoundingClientRect() : null
    const cands = [{ x: 10, y: innerHeight - 10 }, { x: 10, y: 120 }, { x: innerWidth - 10, y: innerHeight - 10 }]
    const pt = cands.find(q => !r || q.x < r.left || q.x > r.right || q.y < r.top || q.y > r.bottom) || cands[0]
    const e = document.elementFromPoint(pt.x, pt.y)
    return { ...pt, el: e ? String(e.className || e.tagName).slice(0, 50) : 'nothing', sheet: r ? [Math.round(r.left), Math.round(r.top), Math.round(r.width), Math.round(r.height)].join(',') : '' }
  })
  if (qp) { await tapAt(p, W, qp, 'po-outside') }
  const still = await sheetUp()
  W.rec('p01d', `a ${W.isPhone ? 'tap' : 'click'} outside the sheet (at ${qp ? qp.x + ',' + qp.y + ' on ' + qp.el : 'no quiet point'}) — RECORD whether it closes`, 'REC', `${still ? 'stays open' : 'closed'} · sheet ${sb} box ${qp && qp.sheet}`, await W.pic(p, 'p01d-outside'))
  if (still) await W.press(p, '[data-testid="bid-cancel"]:visible', 'sheet-x3')
  const po = await postOut2(p, W, HEX, '2026-07-17', 'p02')
  W.rec('p02', 'post out as SANS from Fri 17 Jul (a date ahead)', po.ok && po.after.san === false, po.ok ? `line "${po.line}" · ${J(po.after)}` : po.why, po.pic)
  if (await sheetUp()) await W.press(p, '[data-testid="bid-cancel"]:visible', 'sheet-x4')
  const tagUsers = async () => { await L.usersOpen(p, W); return p.locator(`[data-testid="po-tag-${HEX}"]`).first().textContent().catch(() => null) }
  const t0 = await tagUsers()
  const lw = await L.lwCell(p, W, HEX, '2026-07-17')
  await W.press(p, lw.cell, 'cell-17b')
  if (await p.locator('[data-testid="bid-more"]:visible').count()) await W.press(p, '[data-testid="bid-more"]:visible', 'more2')
  if (await p.locator('[data-testid="bid-postout"]:visible').count()) await W.press(p, '[data-testid="bid-postout"]:visible', 'postout2')
  const u = p.locator('[data-testid="postout-undo"]:visible').first()
  const uPic = await W.pic(p, 'p03a-undo-shown')
  if (await u.count()) {
    await W.press(p, u, 'undo-postout'); await sleep(800)
    const t1 = await tagUsers()
    W.rec('p03', '"Undo post out" on the same sheet takes the posting back (Admin → Users tag before / after)', !t1, `tag before "${t0}" · after "${t1}" · ${J(await recOf(p, HEX))}`, uPic + ', ' + await W.pic(p, 'p03b-after-undo'))
  } else W.rec('p03', '"Undo post out"', 'NW', 'no Undo post out drawn', uPic)
  if (await sheetUp()) await W.press(p, '[data-testid="bid-cancel"]:visible, [data-testid="postout-cancel"]:visible', 'sheet-x5')
  const po2 = await postOut2(p, W, HEX, '2026-07-17', 'p04')
  W.rec('p04', 'post out as SANS from Fri 17 Jul again (for the rest of the round)', po2.ok, po2.ok ? `line "${po2.line}"` : po2.why, po2.pic)
  if (await sheetUp()) await W.press(p, '[data-testid="bid-cancel"]:visible', 'sheet-x6')

  /* 2. Sat 18: a BRIEF naming Hex (his planned day); the crew lists on the look-ahead days, unarmed and armed */
  await L.openBoard(p, W, SAT)
  const g = await L.groundRow(p, W, SAT, 'BRIEF', '08:00', '09:00', HEX)
  W.rec('p05', 'Sat 18 Jul: Ground BRIEF 08:00–09:00 naming Hex (read back)', !!(g.row && J(g.row.who || '').includes(HEX)), J(g.row), await W.pic(p, 'p05-sat-brief'))
  await L.closeBoard(p, W)
  for (const di of [FRI, SAT]) {
    await L.openBoard(p, W, di)
    const c = await crewOf(p, '#schedBoard', HEX)
    W.rec(`p06-${di}`, `Scheduler Board ${['', '', '', '', 'Fri 17', 'Sat 18'][di]} Jul (Wed 15), nothing armed: Hex's crew-list entry — its hover title carries the look-ahead words, nothing printed`, c.length > 0 && c.every(x => /SANS from Fri 17 Jul: no availability filed\. It can be filed from that day on the Inputs page's SANS tab\./.test(x.title) && !x.printed), J(c), await W.pic(p, `p06-${di}-board-crew`))
    await L.closeBoard(p, W)
  }
  await L.openBoard(p, W, FRI)
  const az = await armZone(p, W, '#schedBoard', 's:4.oft.1.+', 'arm-sim')
  if (az.arm) {
    const arm = az.arm + ' — pressed at ' + az.at
    const crew = await crewOf(p, '#schedBoard', HEX)
    W.rec('p07', `Scheduler Board Fri 17 (Wed 15): the sim EP-6's free seat armed (${arm}): the look-ahead words printed under Hex's struck name`, crew.length > 0 && crew.every(x => x.struck && /^SANS from Fri 17 Jul: no availability filed\. It can be filed from that day on the Inputs page's SANS tab\.$/.test(x.printed)), J(crew), await W.pic(p, 'p07-board-armed'))
    await p.keyboard.press('Escape'); await sleep(400)
    W.rec('p07b', 'Escape: the seat no longer armed', !(await p.evaluate(() => window.ARM && window.ARM.key)), String(await p.evaluate(() => window.ARM && window.ARM.key)), await W.pic(p, 'p07b-disarmed'))
  } else W.rec('p07', 'the sim EP-6 free seat on Fri 17', 'NW', `not armed: ${az.why || az.at}`, await W.pic(p, 'p07-notarmed'))
  await L.closeBoard(p, W)
  /* Edit Schedule's crew panel on Fri, unarmed, then the week's sim seat armed */
  await L.go(p, 'editsched')
  const day = await S.crewPanelTo(p, W, 'Fri')
  const cp0 = await crewOf(p, '.ros-body', HEX)
  W.rec('p08', `Edit Schedule crew panel on "${day}" (Wed 15), nothing armed: Hex's entry — the look-ahead words on its hover title, nothing printed`, cp0.length > 0 && cp0.every(x => /SANS from Fri 17 Jul: no availability filed/.test(x.title) && !x.printed), J(cp0), await W.pic(p, 'p08-es-crew'))
  /* on the phone the crew panel covers the week: closed first, the seat armed, the panel opened again */
  /* the phone's week draws EP-6 with no free seat (the final runs' picture: the press selected Wildcard), so there the
     seat armed is the Ground row AIRCREW ADMIN's "+ ADD" — said so in the line */
  await S.crewPanelClose(p, W)
  const wkey = W.isPhone ? 'g:4.1.+' : 's:4.oft.1.+'
  const wa = await armZone(p, W, '#eWeek', wkey, 'es-arm')
  if (wa.arm) {
    const arm = wa.arm + ' — pressed at ' + wa.at
    /* armed, the panel shows the armed seat's day with no ‹ › of its own: on the phone its tab is only opened */
    if (W.isPhone) {
      const open = await p.evaluate(() => { const b = document.querySelector('.ros-body'); if (!b) return false; const r = b.getBoundingClientRect(); return r.width > 40 && r.left < window.innerWidth - 40 })
      if (!open) await W.press(p, '#rosTab', 'crew-tab-armed')
    }
    const cp1 = await crewOf(p, '.ros-body', HEX)
    const okSim = cp1.length > 0 && cp1.every(x => x.struck && /^SANS from Fri 17 Jul: no availability filed\. It can be filed from that day on the Inputs page's SANS tab\.$/.test(x.printed))
    W.rec('p09', `Edit Schedule: the week's Fri ${W.isPhone ? 'Ground row AIRCREW ADMIN' : 'sim seat'} armed (${arm}): ${W.isPhone ? 'what Hex\'s crew-panel entry shows (RECORD — a ground row is not a flying or sim seat)' : 'the look-ahead words printed under Hex\'s struck name in the crew panel'}`, W.isPhone ? 'REC' : okSim, J(cp1), await W.pic(p, 'p09-es-armed'))
    await p.keyboard.press('Escape'); await sleep(400)
  } else W.rec('p09', "Edit Schedule: the week's Fri sim seat", 'NW', `not armed: ${wa.why || wa.at}`, await W.pic(p, 'p09-notarmed'))
  await S.crewPanelClose(p, W)

  /* 3. Hex's sign-in (Admin → Users): the demo already gives him one; given here only if he has none */
  await L.usersOpen(p, W)
  await W.press(p, `#accList [data-person="${HEX}"] .acc-tap`, 'acc-hex')
  let gave = '', user = ''
  if (await p.locator('#accGiveName:visible').count()) {
    await p.fill('#accGiveName', 'hex@mail'); user = 'hex@mail'
    await W.press(p, '#accGive:visible', 'give'); await sleep(500)
    gave = 'given: ' + await L.toastSaid(p)
  } else if (await p.locator('#accEdName:visible').count()) {
    user = await p.locator('#accEdName').inputValue(); gave = 'he already has one'
  }
  const p10 = await W.pic(p, 'p10-hex-signin')
  W.rec('p10', `Admin → Users → Hex: his sign-in ("${user}")`, !!user, gave, p10)
  if (await p.locator('#accEdCancel:visible').count()) await W.press(p, '#accEdCancel:visible', 'acc-cancel')

  /* 4. the posting's date arrives; Hex signs in; his bell */
  const t = await moveTo(p, W, '2026-07-17T09:00:00', user || 'hex', 'x')
  const who = await p.evaluate(() => { const b = [...document.querySelectorAll('.namebadge, [class*="badge"]')].find(e => e.getBoundingClientRect().width > 0 && /Hex/.test(e.textContent || '')); return b ? b.textContent.trim().slice(0, 30) : '' })
  W.rec('p11', 'clock → Fri 17 Jul 09:00, reloaded, signed in as Hex (hex@mail)', /Fri Jul 17 2026/.test(t), `${t} · badge "${who}" · Hex ${J(await recOf(p, HEX))}`, await W.pic(p, 'p11-hex-in'))
  const b1 = await bellOpen(p, W, 'bell-1')
  const l1 = sansLine(b1.lines)
  W.rec('p12', 'Hex\'s bell: lit, opened; "Your SANS availability" bold · Sat 18 Jul · Planned, no availability filed', b1.lit === true && b1.open && !!l1 && l1.name === 'Your SANS availability' && +l1.bold >= 600 && /Sat 18 Jul/.test(l1.day) && /^Planned, no availability filed/.test(l1.what), `lit ${b1.lit} · ${lineSay(l1)} · all: ${b1.lines.map(l => l.id).join(', ')}`, await W.pic(p, 'p12-bell-open'))
  await p.keyboard.press('Escape'); await sleep(400)
  W.rec('p13a', 'the bell list closed by Escape', !(await shown(p, '[data-testid="bell-list"]')), '', await W.pic(p, 'p13a-bell-esc'))
  await bellOpen(p, W, 'bell-2')
  const qp2 = await quietPoint(p, ['[data-testid="bell-list"]', '.bellbtn'])
  if (qp2) await tapAt(p, W, qp2, 'bell-outside')
  W.rec('p13b', `the bell list closed by a ${W.isPhone ? 'tap' : 'click'} outside it (${qp2 ? qp2.x + ',' + qp2.y + ' on ' + qp2.el : 'no quiet point'})`, !!qp2 && !(await shown(p, '[data-testid="bell-list"]')), '', await W.pic(p, 'p13b-bell-outside'))
  await bellOpen(p, W, 'bell-3')
  await W.press(p, p.locator('button.bellbtn:visible').first(), 'bell-again')
  W.rec('p13c', 'the bell list closed by pressing the bell again', !(await shown(p, '[data-testid="bell-list"]')), '', await W.pic(p, 'p13c-bell-again'))
  /* the tap on the line */
  const b4 = await bellOpen(p, W, 'bell-4')
  const l4 = sansLine(b4.lines)
  if (l4) {
    const ln = p.locator(`[data-testid="bell-line-${l4.id}"]`).first()
    await W.press(p, ln, 'bell-line'); await sleep(900)
    const pg = await p.evaluate(() => window.CURPAGE)
    const wd = await winDay(p)
    const month = await L.txtOf(p, '[data-testid="sc-month"]')
    const tab = await p.evaluate(() => !!document.querySelector('#sansCal, [data-testid="sanscal"]'))
    W.rec('p14', 'a tap on the line: the Inputs page\'s SANS tab at July, Sat 18 Jul\'s day window open', !!wd && /18/.test(wd.ttl) && /Jul/i.test(month) && tab, `page "${pg}" · SANS calendar drawn ${tab} · month "${month}" · window ${J(wd)} · bell list open ${await shown(p, '[data-testid="bell-list"]')}`, await W.pic(p, 'p14-tap-line'))
    /* 5. the day window: ✕, Escape, a press outside, the phone's pull-up bar */
    const dayCell = async () => { const c = p.locator('[data-testid="sc-day-2026-07-18"]').first(); await c.evaluate(e => e.scrollIntoView({ block: 'center' })); await sleep(300); await W.press(p, c, 'sc-day-18'); await sleep(500) }
    if (!(await winDay(p))) await dayCell()
    await W.press(p, '[data-testid="win-sansday-x"]:visible', 'day-x')
    W.rec('p15a', 'the day window closed by its ✕', !(await winDay(p)), '', await W.pic(p, 'p15a-day-x'))
    await dayCell()
    const wdo = await winDay(p)
    await p.keyboard.press('Escape'); await sleep(400)
    W.rec('p15b', 'reopened from the day; closed by Escape', !!wdo && !(await winDay(p)), `opened ${J(wdo)}`, await W.pic(p, 'p15b-day-esc'))
    await dayCell()
    const qp3 = await quietPoint(p, ['[data-testid="win-sansday"]'])
    if (qp3) await tapAt(p, W, qp3, 'day-outside')
    const after = await winDay(p)
    W.rec('p15c', `a ${W.isPhone ? 'tap' : 'click'} outside the day window (${qp3 ? qp3.x + ',' + qp3.y + ' on ' + qp3.el : 'none'}): it stays and the page behind works (D641 — the SANS calendar's windows)`, 'REC', after ? 'stays open ' + J(after) : 'closed', await W.pic(p, 'p15c-day-outside'))
    if (!after) await dayCell()
    if (W.isPhone) {
      const w0 = await winDay(p)
      await W.press(p, '[data-testid="win-sansday"] .win-ttl', 'day-bar')
      await sleep(500)
      const w1 = await winDay(p)
      const pic1 = await W.pic(p, 'p15d-bar-tap1')
      await W.press(p, '[data-testid="win-sansday"] .win-ttl', 'day-bar2')
      await sleep(500)
      const w2 = await winDay(p)
      W.rec('p15d', 'phone: a tap on the window\'s bar goes to the other height, a second tap back', !!w0 && !!w1 && !!w2 && w0.tall !== w1.tall && w2.tall === w0.tall, `tall ${w0 && w0.tall} → ${w1 && w1.tall} → ${w2 && w2.tall} · tops ${w0 && w0.box.y} → ${w1 && w1.box.y} → ${w2 && w2.box.y}`, pic1 + ', ' + await W.pic(p, 'p15d-bar-tap2'))
    }
    const wd2 = await winDay(p)
    const cell = await L.txtOf(p, '[data-testid="sc-day-2026-07-18"]')
    W.rec('p16', 'the SANS tab\'s month: Sat 18 Jul\'s day cell, and "+ Commitment" open to him in its window (RECORD)', 'REC', `cell "${cell}" · window ${J(wd2)}`, await W.pic(p, 'p16-sans-month'))
    if (wd2) { await W.press(p, '[data-testid="win-sansday-x"]:visible', 'day-x2') }
    /* the bell after the tap, read once the day window is shut (on the phone the tall day window covers the bar) */
    const b5 = await bellOpen(p, W, 'bell-5')
    W.rec('p14b', 'the bell after the tap: the line now read, the bell not lit (RECORD)', 'REC', `lit before opening ${b5.lit} · ${lineSay(sansLine(b5.lines))}`, await W.pic(p, 'p14b-bell-after'))
    await p.keyboard.press('Escape'); await sleep(300)
    if (await shown(p, '[data-testid="bell-list"]')) await W.press(p, p.locator('button.bellbtn:visible').first(), 'bell-shut')
  } else W.rec('p14', 'a tap on the line', 'NW', 'no "Your SANS availability" line to tap')
  /* 6. View-only Sched as the member (Hex): Sat 18 */
  await L.go(p, 'viewsched')
  await p.locator(`#vWeek section.day[data-day="${SAT}"]`).first().evaluate(e => e.scrollIntoView({ block: 'start', inline: 'center' })).catch(() => {}); await sleep(500)
  const vw = await S.readWeek(p, HEX, '#vWeek')
  W.rec('p17', 'View-only Sched as Hex (member): his puck on the week (RECORD)', 'REC', J(vw).slice(0, 500), await W.pic(p, 'p17-member-view'))
  /* 7. back as the admin: his bell carries no SANS line; the crew lists from the posting's date; the changes window */
  await L.signOut(p, W)
  await L.signIn(p, 'ad', 'a')
  const ba = await bellOpen(p, W, 'bell-admin')
  W.rec('p18', 'Saber\'s bell: no "Your SANS availability" line', !sansLine(ba.lines) && !ba.lines.some(l => /SANS availability/.test(l.name)), `lines: ${ba.lines.map(l => l.name + ' · ' + l.what).join(' | ').slice(0, 400)}`, await W.pic(p, 'p18-admin-bell'))
  await p.keyboard.press('Escape'); await sleep(300)
  for (const di of [FRI, SAT]) {
    await L.openBoard(p, W, di)
    const c = await crewOf(p, '#schedBoard', HEX)
    W.rec(`p19-${di}`, `Scheduler Board ${['', '', '', '', 'Fri 17', 'Sat 18'][di]} Jul on Fri 17 (the posting has run), nothing armed: the usual "SANS — no availability filed for today" on the hover title, no look-ahead words`, c.length > 0 && c.every(x => /SANS — no availability filed for today/.test(x.title) && !/SANS from/.test(x.title)), J(c), await W.pic(p, `p19-${di}-board-crew`))
    await L.closeBoard(p, W)
  }
  await L.openBoard(p, W, FRI)
  const z2 = await armZone(p, W, '#schedBoard', 's:4.oft.1.+', 'arm-sim2')
  if (!z2.arm) W.rec('p20', 'the sim seat on Fri 17 armed', 'NW', `not armed: ${z2.why || z2.at}`, await W.pic(p, 'p20-notarmed'))
  else {
    const c = await crewOf(p, '#schedBoard', HEX)
    W.rec('p20', 'Scheduler Board Fri 17 on Fri 17: the sim seat armed: "SANS — no availability filed for today" printed under Hex\'s struck name', c.length > 0 && c.every(x => x.struck && x.printed === 'SANS — no availability filed for today'), J(c), await W.pic(p, 'p20-board-armed'))
    await p.keyboard.press('Escape'); await sleep(400)
  }
  await L.closeBoard(p, W)
  await L.go(p, 'editsched')
  const hb = p.locator('#histBtn:visible').first()
  if (await hb.count()) {
    await W.press(p, hb, 'changes'); await sleep(700)
    const txt = await p.evaluate(() => [...document.querySelectorAll('.floatwin, .chgwin, [class*="chgwin"]')].filter(e => e.getBoundingClientRect().width > 0).map(e => e.innerText.replace(/\s+/g, ' ')).sort((a, b) => b.length - a.length)[0] || '')
    W.rec('p21', 'the changes window (the clock on Edit Schedule) (RECORD)', 'REC', txt.slice(0, 500), await W.pic(p, 'p21-changes'))
    await p.keyboard.press('Escape'); await sleep(300)
  } else W.rec('p21', 'the changes window', 'NW', 'no clock button on the bar', await W.pic(p, 'p21-nohist'))
}

const FN = { r1: [r1, '2026-07-15T09:00:00'], r2: [r2, '2026-07-13T09:00:00'], r2b: [r2b, '2026-07-13T09:00:00'],r3: [r3, '2026-07-13T09:00:00'], r3s: [r3s, '2026-07-13T09:00:00'], r4: [r4, '2026-07-13T09:00:00'], pu: [pu, '2026-07-15T09:00:00'] }
for (const k of ONLY) { const name = k.slice(0, -1), sz = k.slice(-1); if (FN[name]) await run(name, sz, FN[name][1], FN[name][0]) }
writeFileSync(path.join(DUMP, `results-${process.env.RUN || 'scratch'}-${ONLY.join('_')}.json`), JSON.stringify(L.results, null, 1))
console.log('done')
