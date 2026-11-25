// Walker w2 — the plain-user round (bug-check order §7.0a) for the ALL AVAIL / SANS-posting fix, both sizes.
// Run from raptor-port/:  ONLY=pud,pup node scripts/handpass/asp-w2-pu.mjs
import * as L from './asp-w2-lib.mjs'
const { sleep, J, HEX } = L
const VERSION = 'asp-w2-pu v3'
const ONLY = (process.env.ONLY || 'pud,pup').split(',')
console.log(VERSION, L.URL_, ONLY.join(','))
const SAT = 5
const shown = (p, sel) => p.evaluate(s => [...document.querySelectorAll(s)].some(e => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 }), sel)
/* a tap or click on a point outside any sheet: the top-left corner of the Leave War grid (the year / CS-Name cell) */
async function tapOutside(p, W, x, y, label) {
  if (W.isPhone) await p.touchscreen.tap(x, y); else await p.mouse.click(x, y)
  await sleep(500)
  if (W.isPhone) await p.screenshot({ path: `${L.OUT}/taps/${W.scn}-outside-${label}-now-phone.png` }).catch(() => {})
}

async function pu(szKey) {
  const sz = L.SIZES[szKey], W = L.mk('pu', sz)
  const { b, p } = await L.world(sz, W)
  try {
    await L.signIn(p, 'ad', 'a')
    W.rec('today', "the app's today", null, await L.today(p))
    /* ---- 1. the one-day sheet → ⋯ → Post out: open, close three ways ---- */
    const openPO = async (tag) => {
      const c = (await L.lwCell(p, W, HEX, '2026-07-16')).cell
      await W.press(p, c, 'cell-16')
      await W.press(p, '[data-testid="bid-more"]:visible', 'more')
      await W.press(p, '[data-testid="bid-postout"]:visible', 'postout')
      return W.pic(p, tag)
    }
    const sheetUp = () => shown(p, '[data-testid="po-confirm"], [data-testid="bid-cancel"]')
    let pic = await openPO('01a-postout-open')
    W.rec('pu-01a', 'Leave War: Hex\'s Thu 16 Jul → ⋯ → Post out opens the posting part of the sheet', await shown(p, '[data-testid="po-confirm"]'), '', pic)
    await W.press(p, '[data-testid="bid-cancel"]:visible', 'sheet-x')
    W.rec('pu-01b', 'closed by its ✕', !(await sheetUp()), '', await W.pic(p, '01b-closed-x'))
    await openPO('01c-reopen')
    await p.keyboard.press('Escape'); await sleep(500)
    W.rec('pu-01c', 'closed by Escape', !(await sheetUp()), (await sheetUp()) ? 'still open after Escape' : '', await W.pic(p, '01c-closed-esc'))
    if (await sheetUp()) { await W.press(p, '[data-testid="bid-cancel"]:visible', 'sheet-x2') }
    await openPO('01d-reopen')
    /* outside: the grid's corner cell (the year and CS/Name heading) */
    const corner = await p.evaluate(() => { const e = [...document.querySelectorAll('*')].find(x => x.children.length === 0 && /^CS\/Name$/i.test((x.textContent || '').trim()) && x.getBoundingClientRect().width > 0); if (!e) return null; const r = e.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 } })
    const pt = corner || { x: 30, y: 80 }
    await tapOutside(p, W, pt.x, pt.y, 'po')
    const stillUp = await sheetUp()
    W.rec('pu-01d', `a ${W.isPhone ? 'tap' : 'click'} outside it (the grid's CS/Name corner at ${Math.round(pt.x)},${Math.round(pt.y)}) — RECORD whether it closes`, 'REC', stillUp ? 'stays open' : 'closed', await W.pic(p, '01d-outside'))
    if (stillUp) await W.press(p, '[data-testid="bid-cancel"]:visible', 'sheet-x3')
    /* post out as SANS from Thu 16 Jul, then Undo post out on the same sheet */
    const po = await L.postOut(p, W, HEX, '2026-07-16', 'pu-02')
    W.rec('pu-02', 'posted out as SANS from Thu 16 Jul (a future date)', null, `line "${po.line}" · ${J(po.after)}`, po.pic)
    if (await sheetUp()) await W.press(p, '[data-testid="bid-cancel"]:visible', 'sheet-x4')
    const lw = await L.lwCell(p, W, HEX, '2026-07-16')
    const lwPic = await W.pic(p, '02b-lw-after')
    await W.press(p, lw.cell, 'cell-16b')
    if (await p.locator('[data-testid="bid-more"]:visible').count()) await W.press(p, '[data-testid="bid-more"]:visible', 'more2')
    if (await p.locator('[data-testid="bid-postout"]:visible').count()) await W.press(p, '[data-testid="bid-postout"]:visible', 'postout2')
    const u = p.locator('[data-testid="postout-undo"]:visible').first()
    const uPic = await W.pic(p, '02c-undo-shown')
    if (await u.count()) {
      await W.press(p, u, 'undo-postout'); await sleep(800)
      const st = await p.evaluate(id => ({ san: !!window.PEOPLE[id].san, archived: !!window.PEOPLE[id].archived }), HEX)
      W.rec('pu-02c', '"Undo post out" on the same sheet takes the posting back', !st.san && !st.archived, `cell before "${lw.text}" · after ${J(st)} · note "${await L.toastSaid(p)}"`, lwPic + ', ' + uPic + ', ' + await W.pic(p, '02d-after-undo'))
    } else W.rec('pu-02c', '"Undo post out" on the same sheet', 'NW', 'no Undo post out drawn', uPic)
    if (await sheetUp()) await W.press(p, '[data-testid="bid-cancel"]:visible, [data-testid="postout-cancel"]:visible', 'sheet-x5')

    /* ---- 2. the war's ⚙ Settings: open, + SANS, the SANS group's ✕, close three ways ---- */
    await L.go(p, 'leavewar')
    const setUp = () => shown(p, '[data-testid="settings-sheet"]')
    await W.press(p, '[data-testid="settings-open"]:visible', 'settings-open'); await sleep(400)
    W.rec('pu-03a', '⚙ Settings opens', await setUp(), '', await W.pic(p, '03a-settings'))
    await W.press(p, '[data-testid="gadd-SANS"]:visible', 'gadd-SANS'); await sleep(400)
    const on = await p.locator('[data-testid="grow-SANS"]').count()
    W.rec('pu-03b', '"+ SANS" adds the SANS group', on === 1, await L.txtOf(p, '[data-testid="grow-SANS"]'), await W.pic(p, '03b-sans-on'))
    await W.press(p, '[data-testid="gdrop-SANS"]:visible', 'gdrop-SANS'); await sleep(400)
    W.rec('pu-03c', "the SANS group's ✕ takes it off", (await p.locator('[data-testid="grow-SANS"]').count()) === 0, '', await W.pic(p, '03c-sans-off'))
    await W.press(p, '[data-testid="settings-close"]:visible', 'settings-x'); await sleep(400)
    if (await setUp()) { await W.press(p, '[data-testid="settings-close"]:visible', 'settings-x2'); await sleep(400) }
    W.rec('pu-03d', 'closed by its ✕', !(await setUp()), '', await W.pic(p, '03d-closed-x'))
    await W.press(p, '[data-testid="settings-open"]:visible', 'settings-open2'); await sleep(400)
    await p.keyboard.press('Escape'); await sleep(500)
    W.rec('pu-03e', 'closed by Escape', !(await setUp()), '', await W.pic(p, '03e-closed-esc'))
    if (await setUp()) await W.press(p, '[data-testid="settings-close"]:visible', 'settings-x3')
    await W.press(p, '[data-testid="settings-open"]:visible', 'settings-open3'); await sleep(400)
    const sb = await p.locator('[data-testid="settings-sheet"]').boundingBox()
    const vp = p.viewportSize()
    /* a point outside the sheet: left of it if there is room, else above it */
    const op = sb && sb.x > 40 ? { x: sb.x / 2, y: sb.y + 60 } : sb && sb.y > 120 ? { x: vp.width / 2, y: sb.y - 30 } : { x: 8, y: vp.height - 8 }
    await tapOutside(p, W, op.x, op.y, 'settings')
    W.rec('pu-03f', `a ${W.isPhone ? 'tap' : 'click'} outside it (${Math.round(op.x)},${Math.round(op.y)}) closes it`, !(await setUp()), (await setUp()) ? 'still open' : '', await W.pic(p, '03f-outside'))
    if (await setUp()) await W.press(p, '[data-testid="settings-close"]:visible', 'settings-x4')

    /* ---- 3. the ALL AVAIL window: post out SANS from Wed 15, the main fixture, open, drag, ✕, Escape ---- */
    const po2 = await L.postOut(p, W, HEX, '2026-07-15', 'pu-04')
    W.rec('pu-04', 'Hex posted out as SANS from Wed 15 Jul', po2.after.san === true, `line "${po2.line}"`, po2.pic)
    if (await sheetUp()) await W.press(p, '[data-testid="bid-cancel"]:visible', 'sheet-x6')
    const f = await L.mainFixture(p, W, SAT)
    W.rec('pu-05', 'Saturday: BRIEF 08:00–09:00 naming Hex, SQN EVENT 10:00–17:00 for ALL AVAIL', f.ok, '', await W.pic(p, '05-fixture'))
    const r = await L.readCount(p, W, f.a.row.rid)
    const wb = await p.locator('.availwin:visible').first().boundingBox()
    W.rec('pu-06', `the count chip ("${r.chip}") opens the ALL AVAIL window; Hex in it with the purple SANS line`, r.win && r.win.has === true && r.win.san === true, `${J(r.win)} · window box ${J(wb)}${W.isPhone ? ` · screen ${vp.width}×${vp.height}` : ''}`, await W.pic(p, '06-win'))
    /* the window's drag: by its six-dot grip */
    const grip = p.locator('.availwin:visible .win-grip').first()
    if (await grip.count()) {
      const gb = await grip.boundingBox()
      if (!W.isPhone) {
        await p.mouse.move(gb.x + gb.width / 2, gb.y + gb.height / 2); await p.mouse.down()
        await p.mouse.move(gb.x - 300, gb.y + 120, { steps: 12 }); await p.mouse.up(); await sleep(400)
        const wb2 = await p.locator('.availwin:visible').first().boundingBox()
        W.rec('pu-06b', 'dragged by its grip 300 left and 120 down: the window follows', Math.abs((wb.x - wb2.x) - 300) < 12 && Math.abs((wb2.y - wb.y) - 120) < 12, `before ${J(wb)} after ${J(wb2)}`, await W.pic(p, '06b-dragged'))
      } else W.rec('pu-06b', 'the window dragged by its grip on the phone', 'NW', 'a WebKit touch drag cannot be made from the test runner (walk-scripts §4: touches made inside the page drive no pointer events); its grip is drawn: ' + J(gb), '')
    } else W.rec('pu-06b', 'the window\'s grip', false, 'no grip drawn')
    await L.closeWin(p, W)
    W.rec('pu-06c', 'closed by its ✕', !(await shown(p, '.availwin')), '', await W.pic(p, '06c-closed-x'))
    await L.readCount(p, W, f.a.row.rid)
    await p.keyboard.press('Escape'); await sleep(400)
    W.rec('pu-06d', 'reopened, closed by Escape', !(await shown(p, '.availwin')), '', await W.pic(p, '06d-closed-esc'))
    if (await shown(p, '.availwin')) await L.closeWin(p, W)
    /* ---- 4. OIL Earn on and off ---- */
    /* the desktop's bar button #sbOil; the phone's "THIS DAY" row button [data-oilmode] */
    const oil = p.locator('#sbOil:visible').first()
    const oilBtn = (await oil.count()) ? oil : p.locator(`#schedBoard [data-oilmode="${SAT}"]:visible`).first()
    const oilOk = await oilBtn.count()
    if (oilOk) {
      await W.press(p, oilBtn, 'oil-earn-on'); await sleep(600)
      const r2 = await L.readCount(p, W, f.a.row.rid)
      const sw = await p.evaluate(id => { const w = [...document.querySelectorAll('.availwin')].find(e => e.getBoundingClientRect().width > 0); const me = w && w.querySelector(`.rpuck[data-awp="${id}"]`); return { has: !!me, switch: !!(me && me.querySelector('[data-oilp]')), tabs: w ? [...w.querySelectorAll('.win-tab')].map(t => t.textContent.trim()) : [] } }, HEX)
      W.rec('pu-07', `OIL Earn on: the window ("${r2.chip}") still lists Hex — RECORD its earning half`, r2.win && r2.win.has === true, `${J(sw)} · ${J(r2.win)}`, await W.pic(p, '07-oil-earn-on'))
      await L.closeWin(p, W)
      await W.press(p, oilBtn, 'oil-earn-off'); await sleep(600)
      W.rec('pu-07b', 'OIL Earn off again', null, '', await W.pic(p, '07b-oil-earn-off'))
    } else W.rec('pu-07', 'OIL Earn', 'NW', 'no OIL Earn button found on the board')
    /* ---- 5. the other places: the board's crew list and chip, the bell, the changes window ---- */
    const crew = await p.evaluate(id => [...document.querySelectorAll(`#schedBoard .puck[data-person="${id}"]`)].filter(e => e.getBoundingClientRect().width > 0).map(e => ({ where: e.closest('.rsans') ? 'SANS Avail' : e.closest('.rcol') ? ((e.closest('.rcol').querySelector('.rh') || {}).innerText || 'col').replace(/\s+/g, ' ') : 'row', san: e.classList.contains('san') })), HEX)
    const chipNow = await L.txtOf(p, `#schedBoard [data-oilsent="r:${f.a.row.rid}"]`)
    W.rec('pu-08', `the board: Hex's copies (crew list and rows) and the count chip "${chipNow}" (RECORD)`, 'REC', J(crew), await W.pic(p, '08-board-crew'))
    const lab = await L.publish(p, W, SAT)
    W.rec('pu-08b', `Saturday signed and published (${lab})`, null, J(await L.pendingOf(p, SAT)), await W.pic(p, '08b-published'))
    await L.closeBoard(p, W)
    await L.go(p, 'editsched')
    const bell = p.locator('button.bellbtn:visible').first()
    if (await bell.count()) {
      await W.press(p, bell, 'bell'); await sleep(500)
      W.rec('pu-09', 'the bell (RECORD)', 'REC', await L.txtOf(p, '[data-testid="bell-list"]'), await W.pic(p, '09-bell'))
      await p.keyboard.press('Escape'); await sleep(300)
      if (await shown(p, '[data-testid="bell-list"]')) { await tapOutside(p, W, 5, 400, 'bell') }
    }
    const hb = p.locator('#histBtn:visible').first()
    if (await hb.count()) {
      await W.press(p, hb, 'changes'); await sleep(700)
      const txt = await p.evaluate(() => [...document.querySelectorAll('.floatwin, .chgwin, [class*="chgwin"]')].filter(e => e.getBoundingClientRect().width > 0).map(e => e.innerText.replace(/\s+/g, ' ')).sort((a, b) => b.length - a.length)[0] || '')
      W.rec('pu-10', 'the changes window (the clock on Edit Schedule) (RECORD)', 'REC', txt.slice(0, 500), await W.pic(p, '10-changes'))
      await p.keyboard.press('Escape'); await sleep(300)
    }
    /* the OIL tracker and Balances for Hex */
    await L.go(p, 'leavewar'); await sleep(600)
    const tab = async tid => { const t = p.locator(`[data-testid="${tid}"]:visible`).first(); if (await t.count()) { await W.press(p, t, tid); await sleep(700); return true } return false }
    if (await tab('oil-tracker')) {
      const c = p.locator(`[data-testid="oil-bal-${HEX}"]`).first(); if (await c.count()) await c.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' }))
      W.rec('pu-11', "the OIL tracker's figure for Hex (RECORD)", 'REC', await L.txtOf(p, `[data-testid="oil-bal-${HEX}"]`), await W.pic(p, '11-oil-tracker'))
      const ox = p.locator('[data-testid="oil-close"]:visible').first(); if (await ox.count()) await W.press(p, ox, 'oil-close')
    } else W.rec('pu-11', 'the OIL tracker', 'NW', 'no OIL tracker tab found')
    await L.go(p, 'leavewar'); await sleep(500)
    if (await tab('lw-tab-balances')) {
      const c = p.locator(`[data-testid="bal-oil-${HEX}"]`).first(); if (await c.count()) await c.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' }))
      W.rec('pu-12', "the Balances page's OIL for Hex (RECORD)", 'REC', await L.txtOf(p, `[data-testid="bal-oil-${HEX}"]`), await W.pic(p, '12-balances'))
      await tab('lw-tab-grid')
    } else W.rec('pu-12', 'the Balances page', 'NW', 'no Balances tab found')
    const cellSat = await L.lwCell(p, W, HEX, '2026-07-18')
    W.rec('pu-13', "Hex's Leave War cell for Sat 18 Jul after Publish", /^FO/.test(cellSat.text), `"${cellSat.text}"`, await W.pic(p, '13-lw-cell'))
    /* View-only Sched as the member */
    await L.signOut(p, W)
    await L.signIn(p, 'us', 'us')
    await L.go(p, 'viewsched')
    const vs = p.locator(`#vWeek section.day[data-day="${SAT}"]`).first()
    await vs.evaluate(e => e.scrollIntoView({ block: 'start', inline: 'center' })).catch(() => {}); await sleep(500)
    const vr = await L.readCount(p, W, f.a.row.rid, '#vWeek')
    W.rec('pu-14', `member (us): View-only Sched's Saturday count ("${vr.chip}") — Hex in the published crowd`, vr.win && vr.win.has === true, J(vr.win), await W.pic(p, '14-member-view'))
    await L.closeWin(p, W)
  } catch (e) {
    W.rec('ERR', 'script stopped', false, String(e && e.message || e).slice(0, 400), await W.pic(p, 'ERR').catch(() => ''))
  }
  W.rec('errors', 'console / page errors / failed requests', W.errs.length === 0, W.errs.slice(0, 8).join(' || '))
  await b.close()
}
for (const k of ONLY) await pu(k.slice(-1))
L.saveResults('pu-' + ONLY.join('_'))
console.log('done')
