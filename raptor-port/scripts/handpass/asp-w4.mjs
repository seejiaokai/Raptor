// Walker w4 — round 4b: a SANS posting set ahead (his D2329), the restore repair and a delete before arrival,
// 22 Nov 26, chat 146. Brief: docs/superpowers/briefs/2026-11-22-allavail-sans-posted-walk-r4b-brief.md.
// Uses the first walk's w2 helpers (W2_URL / W2_OUT point them at this round's server and picture folder).
// Run from raptor-port/:
//   W2_URL=http://localhost:4393/ W2_OUT=docs/img/handpass/2026-11-22-allavail-sans-posted/w4/<run> ONLY=w1d,w1p,w2d,w3d,w4d node scripts/handpass/asp-w4.mjs
import * as L from './asp-w2-lib.mjs'
import path from 'node:path'
const { sleep, J, HEX, brief, agree } = L
const VERSION = 'asp-w4 v3'
const ONLY = (process.env.ONLY || 'w1d,w1p,w2d,w3d,w4d').split(',')
console.log(VERSION, L.URL_, L.OUT, ONLY.join(','))
const TUE = 1, THU = 3, SAT = 5

async function run(name, szKey, fn) {
  const sz = L.SIZES[szKey], W = L.mk(name, sz)
  const { b, ctx, p } = await L.world(sz, W)
  try {
    await L.signIn(p, 'ad', 'a')
    W.rec('today', "the app's today", null, await L.today(p))
    await fn(p, W, ctx)
  } catch (e) {
    W.rec('ERR', 'script stopped', false, String(e && e.message || e).slice(0, 400), await W.pic(p, 'ERR').catch(() => ''))
  }
  W.rec('errors', 'console / page errors / failed requests', W.errs.length === 0, W.errs.slice(0, 8).join(' || '))
  await b.close()
}
const who = rs => rs.map(r => r.win && r.win.has).join('/')
const counts = rs => rs.map(r => r.chip + '/' + (r.win && r.win.n)).join(' ; ')
function rec3(W, id, what, rs, want, nm = 'Hex') {
  rs.forEach((r, i) => W.rec(`${id}.${['off', 'on', 'off2'][i]}`, what + ` — "+ SANS" ${['off', 'on', 'off again'][i]}`,
    !!(r.win && typeof r.win === 'object' && r.win.has === want),
    (brief(r) || '').replace(/Hex/g, nm), r.pic))
  const same = agree(rs, want) && rs.every(r => r.chip === rs[0].chip && r.win.n === rs[0].win.n)
  W.rec(`${id}.agree`, 'the three readings agree (membership, the people, the count)', same, `in: ${who(rs)} · chip/window: ${counts(rs)}`)
  W.rec(`${id}.count`, 'the count, each way (RECORD)', 'REC', counts(rs))
  return rs
}

/* the Leave War row of Hex around 17 Jul: each cell's words and look, his name puck, a picture of the row */
async function lwRow(p, W, tag) {
  await L.lwCell(p, W, HEX, '2026-07-17')
  const info = await p.evaluate(id => {
    const out = {}
    for (const d of ['14', '15', '16', '17', '18', '19', '20']) {
      const c = document.querySelector(`[data-testid="cell-${id}-2026-07-${d}"]`)
      out[d] = c ? ((c.innerText || '').replace(/\s+/g, ' ').trim() || '·') + ' {' + c.className.replace(/\s+/g, ' ').trim() + '}' : 'none'
    }
    const c = document.querySelector(`[data-testid="cell-${id}-2026-07-15"]`)
    let name = ''
    if (c) {
      const r = c.getBoundingClientRect()
      const row = [...document.querySelectorAll('*')].filter(e => { const b = e.getBoundingClientRect(); return b.width > 20 && b.width < 200 && b.left < 220 && b.top <= r.top + 4 && b.bottom >= r.bottom - 4 && /Hex/.test(e.textContent || '') && e.children.length <= 3 })
      const e = row[row.length - 1]
      if (e) name = (e.textContent || '').trim() + ' {' + e.className + '}' + [...e.querySelectorAll('*')].map(k => ' [' + k.className + ']').join('')
    }
    return { cells: out, name }
  }, HEX)
  const box = await p.locator(`[data-testid="cell-${HEX}-2026-07-15"]`).first().boundingBox()
  const vw = p.viewportSize().width
  let pic = ''
  if (box) {
    const f = path.join(L.OUT, `${W.scn}-${tag}-lwrow-${W.sz.name}.png`)
    await p.screenshot({ path: f, clip: { x: 0, y: Math.max(0, box.y - 70), width: vw, height: box.height + 140 } })
    pic = path.basename(f)
  }
  const whole = await W.pic(p, tag + '-lw')
  return { ...info, pic: pic + ', ' + whole }
}

/* Hex's puck on a ground row (by its slot prefix), close up: its look and whether it wears the purple SANS line */
async function puckOnRow(p, W, di, ri, tag) {
  const pref = `g:${di}.${ri}`
  const info = await p.evaluate(([pref, id]) => {
    const vis = e => e.getBoundingClientRect().width > 0
    const all = [...document.querySelectorAll(`#schedBoard .puck[data-person="${id}"]`)].filter(vis)
    const on = all.filter(e => { const z = e.closest('[data-slot], [data-fill]'); return z && ((z.dataset.slot || '') + (z.dataset.fill || '')).startsWith(pref) })
    const e = on[0]
    if (!e) return { n: all.length, found: false, cands: all.map(x => { const z = x.closest('[data-slot], [data-fill]'); return z ? (z.dataset.slot || z.dataset.fill) : '?' }).join(',') }
    e.scrollIntoView({ block: 'center' })
    const r = e.getBoundingClientRect()
    const cs = getComputedStyle(e)
    return { n: all.length, found: true, cls: e.className, san: e.classList.contains('san'), txt: (e.innerText || '').replace(/\s+/g, ' ').trim(), bR: cs.borderRightColor + ' ' + cs.borderRightWidth, shadow: cs.boxShadow.slice(0, 80), r: { x: r.x, y: r.y, w: r.width, h: r.height } }
  }, [pref, HEX])
  let pic = ''
  if (info.found) {
    await sleep(300)
    const bb = await p.locator(`#schedBoard [data-slot^="${pref}"] .puck[data-person="${HEX}"], #schedBoard [data-fill^="${pref}"] .puck[data-person="${HEX}"]`).first().boundingBox().catch(() => null)
    const r = bb || { x: info.r.x, y: info.r.y, width: info.r.w, height: info.r.h }
    const vp = p.viewportSize()
    const x = Math.max(0, r.x - 120), y = Math.max(0, r.y - 30)
    const f = path.join(L.OUT, `${W.scn}-${tag}-puck-close-${W.sz.name}.png`)
    await p.screenshot({ path: f, clip: { x, y, width: Math.min(vp.width - x, r.width + 240), height: Math.min(vp.height - y, r.height + 60) } })
    pic = path.basename(f)
  }
  return { ...info, pic }
}

/* ---------- W1 (and PU, and on the desktop W1b) ---------- */
async function w1(p, W, ctx) {
  const po = await L.postOut(p, W, HEX, '2026-07-17', 'w1-01')
  const tag = (await L.usersOpen(p, W), await p.locator(`[data-testid="po-tag-${HEX}"]`).first().textContent().catch(() => null))
  const tagPic = await W.pic(p, 'w1-01-users-tag')
  const row0 = await lwRow(p, W, 'w1-01')
  const okPo = /17 Jul: becomes SANS/.test(po.line) && /posting out 17 Jul/i.test(tag || '') && /PO/.test(row0.cells['17'])
  W.rec('w1-01', 'Wed 15 Jul: Hex cell → ⋯ → Post out, date Fri 17 Jul, SANS, Post out (read back: the posting from Fri)', okPo, `sheet line "${po.line}" · chips ${po.chips1} · Admin → Users tag "${tag}" · record now ${J(po.after)} · war row ${J(row0.cells)} · name ${row0.name}`, po.pic + ', ' + tagPic + ', ' + row0.pic)
  if (!okPo) return

  /* Thu 16 Jul: the event alone, Hex not named */
  await L.openBoard(p, W, THU)
  const aT = await L.progRow(p, W, THU, 'SQN EVENT', '10:00', '17:00')
  const okT = !!(aT.row && J(aT.row.who || '').includes('allavail'))
  W.rec('w1-02', 'Thu 16 Jul: Common Programme SQN EVENT 10:00–17:00 for ALL AVAIL, Hex not named (read back)', okT, J(aT.row), await W.pic(p, 'w1-02-thu-fixture'))
  await L.closeBoard(p, W)
  if (okT) {
    const rT = rec3(W, 'W1-thu', 'Thu 16 Jul SQN EVENT window: Hex IN', await L.bothWays(p, W, THU, aT.row.rid, 'w1-03-thu'), true)
    if (!rT.every(r => r.win && r.win.has)) {
      /* the brief's premise is "assuming that he available": read (only) what Hex holds on Thu, and his crew-list reason */
      const mine = await p.evaluate(id => {
        const d = window.DAYS[3], out = []
        ;(d.waves || []).forEach((w, wi) => (w.formations || []).forEach((f, fi) => (f.aircraft || []).forEach((a, ai) => {
          if (a.p === id || a.w === id) out.push({ wave: wi, seat: a.p === id ? 'FCP' : 'RCP', formation: JSON.stringify(Object.fromEntries(Object.entries(f).filter(([k]) => k !== 'aircraft'))).slice(0, 220) })
        })))
        return out
      }, HEX)
      await L.openBoard(p, W, THU)
      const why = await p.evaluate(id => [...document.querySelectorAll(`#schedBoard .rpuck[data-person="${id}"]`)].filter(e => e.getBoundingClientRect().width > 0).map(e => e.className + ' title="' + (e.getAttribute('title') || '') + '"').join(' | '), HEX)
      W.rec('W1-thu-why', "Thu 16 Jul: what Hex already holds that day (read only) and his crew-list puck (RECORD)", 'REC', `${J(mine)} · crew list: ${why}`, await W.pic(p, 'w1-03x-thu-crew'))
      /* supplementary (not in the brief): an event at hours his flight leaves free */
      const aT2 = await L.progRow(p, W, THU, 'SQN EVENT 2', '08:00', '10:00')
      const okT2 = !!(aT2.row && J(aT2.row.who || '').includes('allavail'))
      W.rec('w1-03y', 'supplementary: Thu 16 Jul SQN EVENT 2 08:00–10:00 for ALL AVAIL, Hex not named (read back)', okT2, J(aT2.row), await W.pic(p, 'w1-03y-thu-fixture2'))
      await L.closeBoard(p, W)
      if (okT2) rec3(W, 'W1-thu-free', 'supplementary: Thu 16 Jul SQN EVENT 2 08:00–10:00 window (hours he is free): Hex IN', await L.bothWays(p, W, THU, aT2.row.rid, 'w1-03z-thu2'), true)
    }
  }

  /* Sat 18 Jul: the event alone, Hex not named */
  await L.openBoard(p, W, SAT)
  const aS = await L.progRow(p, W, SAT, 'SQN EVENT', '10:00', '17:00')
  const okS = !!(aS.row && J(aS.row.who || '').includes('allavail'))
  W.rec('w1-04', 'Sat 18 Jul: the same event, Hex not named (read back)', okS, J(aS.row), await W.pic(p, 'w1-04-sat-fixture'))
  await L.closeBoard(p, W)
  if (!okS) return
  rec3(W, 'W1-sat-notnamed', 'Sat 18 Jul SQN EVENT window, Hex not named: Hex NOT in', await L.bothWays(p, W, SAT, aS.row.rid, 'w1-05-sat'), false)

  /* Sat 18 Jul: a Ground Programme BRIEF 08:00–09:00 naming Hex */
  await L.openBoard(p, W, SAT)
  const off = await p.locator(`#schedBoard .rpuck[data-person="${HEX}"]:visible`).count()
  W.rec('w1-06a', `Sat 18 Jul board: Hex offered in the crew list (${off} copies)`, null, '', await W.pic(p, 'w1-06a-sat-crew'))
  const g = await L.groundRow(p, W, SAT, 'BRIEF', '08:00', '09:00', off ? HEX : null)
  const okG = !!(g.row && J(g.row.who || '').includes(HEX))
  W.rec('w1-06', 'Sat 18 Jul: Ground Programme BRIEF 08:00–09:00 naming Hex (read back)', okG, J(g.row), await W.pic(p, 'w1-06-sat-brief'))
  const pk = okG ? await puckOnRow(p, W, SAT, g.ri, 'w1-07') : null
  if (pk) W.rec('w1-07', "Hex's puck on Saturday's BRIEF, close up: does it wear the purple SANS line? (RECORD)", 'REC', J(pk), pk.pic + ', ' + await W.pic(p, 'w1-07-sat-brief-row'))
  await L.closeBoard(p, W)
  if (!okG) return
  const rsN = rec3(W, 'W1-sat-named', 'Sat 18 Jul SQN EVENT window, Hex named on the BRIEF: Hex IN', await L.bothWays(p, W, SAT, aS.row.rid, 'w1-08-sat'), true)
  W.rec('w1-08x', "Hex's puck in the window wears the purple SANS line? (RECORD)", 'REC', rsN.map(r => r.win && r.win.san).join('/'))

  await pu(p, W, aS.row.rid)
  if (!W.isPhone) await w1b(p, W, aS.row.rid)
}

/* ---------- PU: the plain-user round on W1's world ---------- */
async function pu(p, W, rid) {
  const snap = () => p.evaluate(id => JSON.stringify(window.PEOPLE[id]), HEX)
  const s0 = await snap()
  /* the ALL AVAIL window: open from the count, close by its ✕ */
  await L.openBoard(p, W, SAT)
  const pe0 = await L.pendingOf(p, SAT)
  const r = await L.readCount(p, W, rid)
  const picO = await W.pic(p, 'pu-01-win-open')
  await L.closeWin(p, W)
  const gone = await L.readWin(p)
  const picC = await W.pic(p, 'pu-02-win-closed')
  W.rec('PU-1', 'ALL AVAIL window opened from the count, closed by its ✕', !!(r.win && typeof r.win === 'object') && gone === 'no window', `opened: chip "${r.chip}", ${r.win && r.win.n} people, Hex ${r.win && r.win.has ? 'IN' : 'out'} · after ✕: ${J(gone)}`, picO + ', ' + picC)
  await L.closeBoard(p, W)
  /* Hex's Post out sheet again, closed by its ✕, nothing changed */
  const c = (await L.lwCell(p, W, HEX, '2026-07-17')).cell
  await W.press(p, c, 'cell-17')
  await sleep(400)
  let sheet = await p.locator('[data-testid="postout-sheet"]:visible').count() ? 'postout-sheet' : (await p.locator('[data-testid="bid-more"]:visible').count() ? 'bid window' : 'none')
  let picS = await W.pic(p, 'pu-03-cell17-opens')
  let route = sheet
  if (sheet === 'bid window') {
    await W.press(p, '[data-testid="bid-more"]:visible', 'more')
    await W.press(p, '[data-testid="bid-postout"]:visible', 'postout')
    picS += ', ' + await W.pic(p, 'pu-03b-postout-again')
    route = 'bid window → ⋯ → Post out'
  }
  const words = ((await p.locator('[data-testid="postout-sheet"]:visible, [data-testid="po-line"]:visible').first().innerText().catch(() => '')) || '').replace(/\s+/g, ' ').slice(0, 300)
  const xSel = (await p.locator('[data-testid="postout-cancel"]:visible').count()) ? '[data-testid="postout-cancel"]:visible' : '[data-testid="bid-cancel"]:visible'
  await W.press(p, xSel, 'sheet-x'); await sleep(400)
  const still = await p.locator('[data-testid="postout-sheet"]:visible, [data-testid="bid-more"]:visible, [data-testid="po-confirm"]:visible').count()
  const s1 = await snap()
  const picX = await W.pic(p, 'pu-04-sheet-closed')
  W.rec('PU-2', `Hex's Post out sheet opened again (${route}) and closed by its ✕ without a change`, still === 0 && s1 === s0, `opened: ${sheet} · words "${words}" · open after ✕: ${still} · his record unchanged: ${s1 === s0}`, picS + ', ' + picX)
  /* the grid's row for Hex around 17 Jul */
  const row = await lwRow(p, W, 'pu-05')
  W.rec('PU-3', 'Leave War grid: Hex\'s row around 17 Jul (RECORD what it draws from Fri 17 Jul)', 'REC', `${J(row.cells)} · name ${row.name}`, row.pic)
  await L.openBoard(p, W, SAT)
  const pe1 = await L.pendingOf(p, SAT)
  W.rec('PU-4', 'nothing changed by the round: Saturday pending the same, his record the same', pe1.pend === pe0.pend && (await snap()) === s0, `pending before ${pe0.pend}, after ${pe1.pend}`, await W.pic(p, 'pu-06-sat-after'))
  await L.closeBoard(p, W)
}

/* ---------- W1b (desktop): publish Saturday, then Friday arrives ---------- */
async function satRead(p, W, rid, tag) {
  await L.openBoard(p, W, SAT)
  const pe = await L.pendingOf(p, SAT)
  const r = await L.readCount(p, W, rid)
  const pic = await W.pic(p, tag + '-win')
  await L.closeWin(p, W)
  const picB = await W.pic(p, tag + '-board')
  await L.closeBoard(p, W)
  const lw = await L.lwCell(p, W, HEX, '2026-07-18')
  const picL = await W.pic(p, tag + '-lw-cell')
  return { pe, r, lw: lw.text, pic: pic + ', ' + picB + ', ' + picL }
}
async function w1b(p, W, rid) {
  await L.openBoard(p, W, SAT)
  const lab = await L.publish(p, W, SAT)
  await L.closeBoard(p, W)
  const a = await satRead(p, W, rid, 'w1b-01')
  W.rec('W1b-1', `Sat 18 Jul: four boxes signed, Publish (${lab}): 0 pending, "SIGNED ORIG", Hex in the window`, a.pe.pend === 0 && !a.pe.notSigned && /SIGNED ORIG/i.test(a.pe.signed) && a.r.win && a.r.win.has === true, `pending ${a.pe.pend} · not yet signed ${a.pe.notSigned} · signed "${a.pe.signed}" · chip "${a.r.chip}" window ${a.r.win && a.r.win.n} Hex ${a.r.win && a.r.win.has ? 'IN' : 'out'}`, a.pic)
  W.rec('W1b-1c', "Leave War: Hex's Sat 18 Jul cell after Publish (RECORD; expected FO*)", 'REC', `"${a.lw}"`)
  /* Friday arrives: the clock moved, the page reloaded, signed in again — the same browser storage */
  await p.clock.setSystemTime(new Date('2026-07-17T09:00:00'))
  await p.reload(); await sleep(1200)
  if (await p.locator('#luser:visible').count()) await L.signIn(p, 'ad', 'a')
  const t = await L.today(p)
  const rec = await p.evaluate(id => { const q = window.PEOPLE[id]; return { san: !!q.san, sanFrom: q.sanFrom || null } }, HEX)
  W.rec('W1b-2', "clock moved to Fri 17 Jul 09:00, page reloaded, signed in again (the app's today; Hex's record read)", /Fri Jul 17 2026/.test(t), `${t} · ${J(rec)}`)
  const b = await satRead(p, W, rid, 'w1b-03')
  W.rec('W1b-3', 'after Friday arrives: still 0 pending, the same signed line, Hex still in, the same cell', b.pe.pend === 0 && !b.pe.notSigned && b.pe.signed === a.pe.signed && b.r.win && b.r.win.has === true && b.lw === a.lw, `pending ${b.pe.pend} · not yet signed ${b.pe.notSigned} · signed "${b.pe.signed}" · chip "${b.r.chip}" window ${b.r.win && b.r.win.n} Hex ${b.r.win && b.r.win.has ? 'IN' : 'out'}${b.r.win && b.r.win.san ? ' (purple line)' : ''} · cell "${b.lw}"`, b.pic)
  const row = await lwRow(p, W, 'w1b-04')
  W.rec('W1b-4', 'the Leave War row after Friday arrives: does it show him SANS from Fri? (RECORD)', 'REC', `${J(row.cells)} · name ${row.name}`, row.pic)
  let k = 5
  for (const on of [true, false]) {
    const sg = await L.sansGroup(p, W, on, `w1b-0${k}`)
    let extra = ''
    if (on) {
      const lwp = await W.pic(p, `w1b-0${k}-lw-sans-on`)
      const inGrp = await p.evaluate(id => { const g = document.querySelector('[data-testid="grow-SANS"]'); return !!document.querySelector(`[data-testid="cell-${id}-2026-07-18"]`) }, HEX)
      const rowOn = await lwRow(p, W, `w1b-0${k}-sans-on`)
      extra = ` · his Sat cell drawn on the war: ${inGrp} · ${lwp} · his row with SANS on: ${J(rowOn.cells)} name ${rowOn.name} [${rowOn.pic}]`
    }
    await L.openBoard(p, W, SAT)
    const pe = await L.pendingOf(p, SAT)
    const pic = await W.pic(p, `w1b-0${k}-board`)
    await L.closeBoard(p, W)
    W.rec(`W1b-${k}`, `"+ SANS" ${on ? 'on' : 'off'} (group shown: ${sg.group}): Saturday 0 pending`, sg.group === on && pe.pend === 0 && !pe.notSigned && pe.signed === a.pe.signed, `pending ${pe.pend} · not yet signed ${pe.notSigned} · signed "${pe.signed}"${extra}`, sg.pic + ', ' + pic)
    k++
  }
}

/* ---------- W2: the BRIEF inside the event's hours ---------- */
async function w2(p, W) {
  const po = await L.postOut(p, W, HEX, '2026-07-17', 'w2-01')
  W.rec('w2-01', 'Hex posted out as SANS from Fri 17 Jul (read back)', /17 Jul: becomes SANS/.test(po.line), `line "${po.line}" · ${J(po.after)}`, po.pic)
  const f = await L.mainFixture(p, W, SAT, HEX, ['10:00', '11:00'])
  W.rec('w2-02', 'Sat 18 Jul: BRIEF 10:00–11:00 naming Hex, SQN EVENT 10:00–17:00 for ALL AVAIL (read back)', f.ok, J({ g: f.g.row, a: f.a.row }), await W.pic(p, 'w2-02-fixture'))
  await L.closeBoard(p, W)
  if (!f.ok) return
  rec3(W, 'W2', 'Sat 18 Jul SQN EVENT window, his BRIEF inside the event: Hex NOT in', await L.bothWays(p, W, SAT, f.a.row.rid, 'w2-03'), false)
}

/* ---------- W3: archived, then restored with a later post-in ---------- */
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
  const btn = ((await p.locator('#accArRestore').innerText().catch(() => '')) || '').trim()
  const pic1 = await W.pic(p, tag + '-restore-date')
  await W.press(p, '#accArRestore', 'restore'); await sleep(600)
  const said = await L.toastSaid(p)
  const st = await p.evaluate(id => { const q = window.PEOPLE[id]; return { archived: !!q.archived, san: !!q.san, sanFrom: q.sanFrom || null } }, id)
  const ptag = await p.locator(`[data-testid="po-tag-${id}"]`).first().textContent().catch(() => null)
  const pic2 = await W.pic(p, tag + '-restored')
  return { val, btn, said, st, ptag, pic: [pic0, pic1, pic2].join(', ') }
}
/* W3 as the brief has it (BRIEF 08:00–09:00, EVENT 10:00–17:00); w3x is a supplementary run at hours Hex's own Tue flight
   (VL 08:40–10:05) leaves free — the first walk's S13 times, BRIEF 11:00–11:30, EVENT 12:00–14:00 */
const w3 = (p, W) => w3run(p, W, ['08:00', '09:00'], ['10:00', '17:00'])
const w3x = (p, W) => w3run(p, W, ['11:00', '11:30'], ['12:00', '14:00'])
async function w3run(p, W, bt, et) {
  const po = await L.postOut(p, W, HEX, '2026-07-13', 'w3-01')
  W.rec('w3-01', 'Hex posted out as SANS from Mon 13 Jul (it runs at once; read back)', po.after.san === true, `line "${po.line}" · ${J(po.after)}`, po.pic)
  if (!po.after.san) return
  const f = await L.mainFixture(p, W, TUE, HEX, bt, et)
  const mine = await p.evaluate(id => { const out = []; (window.DAYS[1].waves || []).forEach(w => (w.formations || []).forEach(f => (f.aircraft || []).forEach(a => { if (a.p === id || a.w === id) out.push(f.cs + ' ' + f.msn + ' T/O ' + f.to + ' LD ' + f.ld) }))); return out.join('; ') }, HEX)
  W.rec('w3-02', `Tue 14 Jul: BRIEF ${bt.join('–')} naming Hex, SQN EVENT ${et.join('–')} for ALL AVAIL (read back; Hex's own Tue flight read: ${mine})`, f.ok, J({ g: f.g.row, a: f.a.row }), await W.pic(p, 'w3-02-fixture'))
  if (!f.ok) return
  const r0 = await L.readCount(p, W, f.a.row.rid)
  W.rec('W3-before', 'Tue 14 Jul before: Hex IN the window', !!(r0.win && r0.win.has === true), `chip "${r0.chip}" ${J(r0.win)}`, await W.pic(p, 'w3-03-before-win'))
  await L.closeWin(p, W)
  const lab = await L.publish(p, W, TUE)
  const pe = await L.pendingOf(p, TUE)
  W.rec('w3-04', `Tue 14 Jul: four boxes signed, Publish (${lab})`, pe.pend === 0 && !pe.notSigned, J(pe), await W.pic(p, 'w3-04-published'))
  await L.closeBoard(p, W)
  const ar = await L.archive(p, W, HEX, 'w3-05')
  W.rec('w3-05', 'Admin → Users: archive Hex (today, Wed)', ar.archived, `note "${ar.said}"`, ar.pic)
  if (!ar.archived) return
  const ra = rec3(W, 'W3-archived', "Tue 14 Jul's window after the archive: Hex still IN", await L.bothWays(p, W, TUE, f.a.row.rid, 'w3-06'), true)
  const rs = await restore(p, W, HEX, '2026-07-18', 'w3-07')
  W.rec('w3-07', 'Admin → Users: Restore Hex with Post in Sat 18 Jul (read back)', rs.st.archived === false && /18 Jul/.test(rs.val), `post-in box "${rs.val}" · button "${rs.btn}" · note "${rs.said}" · tag "${rs.ptag}" · record ${J(rs.st)}`, rs.pic)
  if (rs.st.archived !== false) return
  const rr = rec3(W, 'W3-restored', "Tue 14 Jul's window after the restore: Hex still IN", await L.bothWays(p, W, TUE, f.a.row.rid, 'w3-08'), true)
  W.rec('W3-unchanged', 'the count unchanged: before / after the archive / after the restore', [ra[0], rr[0]].every(r => r.chip === r0.chip && r.win.n === r0.win.n), `before "${r0.chip}"/${r0.win && r0.win.n} · archived ${counts(ra)} · restored ${counts(rr)}`)
  W.rec('W3-pendcount', "Tue 14 Jul's pending count on the board after the restore (RECORD)", 'REC', rr.map(r => r.pend.pend).join('/') + ' · signed "' + rr[0].pend.signed + '"')
  const pl = await L.pendingLines(p, W, TUE)
  W.rec('W3-pending', "Tue 14 Jul's pending lines (RECORD)", 'REC', pl.open ? pl.lines : 'no "N pending" drawn on Edit Schedule', pl.open ? await W.pic(p, 'w3-09-tue-pending') : await W.pic(p, 'w3-09-tue-nopending'))
  const bad = pl.open && /SQN EVENT|ALL AVAIL|OIL|crowd/i.test(pl.lines)
  W.rec('W3-pending-x', 'no pending line about who earns OIL or about the crowd', !bad, bad ? 'a line names the event / ALL AVAIL / OIL' : '')
  await p.keyboard.press('Escape'); await sleep(300)
}

/* ---------- W4: Kiwi, post-in Fri 17 Jul, deleted before he arrives ---------- */
async function w4(p, W) {
  let cs = 'Kiwi'
  if (await p.evaluate(c => Object.values(window.PEOPLE).some(q => (q.cs || '').toLowerCase() === c.toLowerCase()), cs)) cs = 'Wombat'
  const np = await L.newPerson(p, W, cs, cs.slice(0, 2).toUpperCase(), 'RCP', 'C', '2026-07-17', 'w4-01')
  const ok = !!np.id && np.rec && np.rec.seat === 'RCP' && /17 Jul/.test(np.piVal)
  W.rec('w4-01', `Admin → Users: New person ${cs} (WSO, CAT C), Post in Fri 17 Jul, Add (read back)`, ok, `id ${np.id} ${J(np.rec)} · post-in box "${np.piVal}" · note "${np.said}"`, np.pic)
  if (!ok) return
  const id = np.id
  await L.openBoard(p, W, TUE)
  const a = await L.progRow(p, W, TUE, 'SQN EVENT', '10:00', '17:00')
  const okA = !!(a.row && J(a.row.who || '').includes('allavail'))
  W.rec('w4-02', 'Tue 14 Jul: SQN EVENT 10:00–17:00 for ALL AVAIL (read back)', okA, J(a.row), await W.pic(p, 'w4-02-fixture'))
  await L.closeBoard(p, W)
  if (!okA) return
  const r1 = rec3(W, 'W4-before', `Tue 14 Jul window before the delete: ${cs} NOT in`, await L.bothWays(p, W, TUE, a.row.rid, 'w4-03', id), false, cs)
  /* delete: his row → Delete → Tap again */
  await L.usersOpen(p, W)
  await W.press(p, `#accList [data-person="${id}"] .acc-tap`, 'acc-row')
  const pic0 = await W.pic(p, 'w4-04-acc-open')
  await W.press(p, '#accEdDel:visible', 'del-1')
  const armed = ((await p.locator('#accEdDel').innerText().catch(() => '')) || '').trim()
  const note = ((await p.locator('#accEdDelNote').innerText().catch(() => '')) || '').replace(/\s+/g, ' ').trim()
  const pic1 = await W.pic(p, 'w4-04-del-armed')
  await W.press(p, '#accEdDel:visible', 'del-2'); await sleep(600)
  const said = await L.toastSaid(p)
  const st = await p.evaluate(id => { const q = window.PEOPLE[id]; return q ? { deleted: !!q.deleted, archived: !!q.archived } : 'no record' }, id)
  const inList = await p.locator(`#accList [data-person="${id}"]`).count()
  const pic2 = await W.pic(p, 'w4-04-deleted')
  const okD = /Tap again/i.test(armed) && inList === 0
  W.rec('w4-04', `Admin → Users: delete ${cs} (both presses; read back)`, okD, `first press: "${armed}" · note "${note}" · after: toast "${said}" · record ${J(st)} · rows on the list ${inList}`, [pic0, pic1, pic2].join(', '))
  if (!okD) return
  const r2 = rec3(W, 'W4-after', `Tue 14 Jul window after the delete: ${cs} NOT in`, await L.bothWays(p, W, TUE, a.row.rid, 'w4-05', id), false, cs)
  W.rec('W4-unchanged', 'the count unchanged by the delete', r2.every(r => r.chip === r1[0].chip && r.win.n === r1[0].win.n), `before ${counts(r1)} · after ${counts(r2)}`)
}

const FN = { w1, w2, w3, w3x, w4 }
for (const k of ONLY) { const name = k.slice(0, -1), sz = k.slice(-1); if (FN[name]) await run(name, sz, FN[name]) }
L.saveResults('w4-' + ONLY.join('_'))
console.log('done')
