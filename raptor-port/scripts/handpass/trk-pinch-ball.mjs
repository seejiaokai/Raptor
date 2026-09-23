/* [TRK-PINCH-DRAGS-BALL] walk — 23 Sep 26. Two faults on one seam, both in how
   Edit chart layout meets a pinch:

   1. The filed one (F-B of docs/handpass/2026-09-23-tracker-pinch.md): a pinch
      starts with ONE finger, and on the editing canvas one finger acts the
      moment it lands — picks a ball (or a selected group) up, starts a box or a
      line, finishes a half-drawn line, and with Delete removes a drawn line on
      the spot. So a pinch that began on a ball dragged it, added an undo step
      and saved the move.
   2. The owner's report the same night, from his phone: "the left side of the
      tracker chart is cut off". Leaving Edit chart layout left the editing
      canvas's pan and zoom behind; the next pinch on the ordinary chart painted
      them onto it, so the chart shrank and slid under its left edge. Going in
      and out also ignored the slack round the chart, so the chart jumped.

   The roll-call rows (every way a first finger starts something in Edit chart
   layout, and the mode switch) are walked here with two real fingers through
   Chromium's own touch input (CDP), on the production bundle. The touch helpers
   are trk-pinch.mjs's own.

     HP_URL    the preview (http://localhost:4180 — this chat's port, D86/D153)
     WALK_TAG  'before' or 'after' — names the pictures and the results file
*/
import { open, shot, save, PHONE } from './trk-lib.mjs'
import { touchCdp, pinch, mark, unmark, chartAt, emptySpot } from './trk-pinch.mjs'

const TAG = process.env.WALK_TAG || 'run'
const rows = []
const note = (name, pass, detail = '', extra = {}) => { rows.push({ name, pass, detail, ...extra }); console.log(`${pass ? 'PASS' : 'FAIL'}  ${name}  ${detail}`) }

/* the first finger lands on (x,y); after `lead` px of its own movement a second
   lands `gap` px to its right (or at `second`); then the two spread apart */
async function pinchFrom(page, cdp, { x, y, lead = 0, gap = 70, second = null, spread = 5, steps = 12, dir = 'out', onSecond = null }) {
  if (dir === 'in') { gap = 130; spread = -4 }   /* fingers apart, closing — so the canvas stays aimable */
  /* the second finger goes on whichever side of the first has room on the chart:
     a finger placed off the screen never touches down, and one finger is a drag */
  const edge = await page.evaluate(() => { const r = document.getElementById('board').getBoundingClientRect(); return { l: Math.max(r.left, 0), r: Math.min(r.right, innerWidth) } })
  const reach = gap + Math.max(0, spread) * steps
  const side = (second || x + reach < edge.r - 4 || x - lead - reach < edge.l + 4) ? 1 : -1
  const t = (type, touchPoints) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints })
  await t('touchStart', [{ x, y, id: 1 }]); await page.waitForTimeout(40)
  for (let i = 1; i <= 3 && lead; i++) { await t('touchMove', [{ x: x - lead * i / 3, y, id: 1 }]); await page.waitForTimeout(16) }
  const x1 = x - lead, p2 = second || { x: x1 + side * gap, y }
  const dx = second ? Math.sign(p2.x - x1) || 1 : side
  await t('touchStart', [{ x: x1, y, id: 1 }, { x: p2.x, y: p2.y, id: 2 }]); await page.waitForTimeout(30)
  if (onSecond) await onSecond()
  for (let i = 1; i <= steps; i++) { await t('touchMove', [{ x: x1 - dx * spread * i, y, id: 1 }, { x: p2.x + dx * spread * i, y: p2.y, id: 2 }]); await page.waitForTimeout(16) }
  await t('touchEnd', []); await page.waitForTimeout(400)
  return { x: (x1 + p2.x) / 2, y: (y + p2.y) / 2 }
}

/* Everything a pinch in Edit chart layout must leave alone, and the zoom it must
   change. The stored layout is read from browser storage itself. */
const look = page => page.evaluate(() => {
  const lay = {}
  for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (/:lay:/.test(k)) lay[k] = localStorage.getItem(k) }
  const u = window.__undoForTests()
  const hint = document.getElementById('arrhint'), stat = document.getElementById('saveStat')
  return {
    balls: [...document.querySelectorAll('#flowSvg .ball')].map(g => g.dataset.id + '@' + g.getAttribute('transform')).join('|'),
    nBalls: document.querySelectorAll('#flowSvg .ball').length,
    lines: [...document.querySelectorAll('#flowSvg .linehit')].map(h => h.getAttribute('d')).join('|'),
    nLines: document.querySelectorAll('#flowSvg .linehit').length,
    undo: u.undo, redo: u.redo,
    save: !!document.getElementById('saveChanges'),
    lay: JSON.stringify(lay),
    sel: document.querySelectorAll('#flowSvg circle[stroke-dasharray="3 2"]').length,
    band: (document.getElementById('bandLayer') || {}).innerHTML || '',
    overlay: (document.getElementById('overlayLayer') || {}).innerHTML || '',
    view: (document.getElementById('viewport') || {}).getAttribute?.('transform') || '',
    hint: hint ? hint.textContent : '',
    /* the command stream: a cancelled first finger must leave no envelope behind
       (Astra's final read #1) — and the save indicator must not report a save */
    cmd: typeof window.commandStreamLen === 'function' ? window.commandStreamLen() : -1,
    /* where the canvas sits on screen: the take-back must not make it hop */
    canvas: (() => { const r = document.getElementById('flowSvg').getBoundingClientRect(); return Math.round(r.left) + ',' + Math.round(r.top) })(),
    stat: stat ? stat.textContent.replace('saving…', 'saved') : '',
  }
})
const KEEP = ['balls', 'lines', 'undo', 'redo', 'save', 'lay', 'sel', 'band', 'overlay', 'cmd', 'stat']
const diff = (a, z, keys = KEEP) => keys.filter(k => a[k] !== z[k])

const ballNearMiddle = (page, avoid = []) => page.evaluate(avoid => {
  const bd = document.getElementById('board').getBoundingClientRect(), bot = Math.min(bd.bottom, innerHeight), rt = Math.min(bd.right, innerWidth)
  const mx = (bd.left + rt) / 2, my = (bd.top + bot) / 2; let best = null
  for (const g of document.querySelectorAll('#flowSvg .ball')) {
    if (avoid.includes(g.dataset.id)) continue
    const r = g.getBoundingClientRect(); if (!r.width) continue
    const x = r.left + r.width / 2, y = r.top + r.height / 2
    if (x < bd.left + 60 || x > rt - 140 || y < bd.top + 40 || y > bot - 40) continue
    const d = Math.hypot(x - mx, y - my); if (!best || d < best.d) best = { id: g.dataset.id, x, y, d }
  }
  return best
}, avoid)
/* another ball on screen besides `id` — near the middle if there is one, else any
   (a zoomed canvas may hold only one ball clear of the edges) */
const otherBall = async (page, id) => (await ballNearMiddle(page, [id])) || page.evaluate(id => {
  const bd = document.getElementById('board').getBoundingClientRect(), rt = Math.min(bd.right, innerWidth), bot = Math.min(bd.bottom, innerHeight)
  for (const g of document.querySelectorAll('#flowSvg .ball')) {
    if (g.dataset.id === id) continue
    const r = g.getBoundingClientRect(), x = r.left + r.width / 2, y = r.top + r.height / 2
    if (x > bd.left + 20 && x < rt - 20 && y > bd.top + 20 && y < bot - 20 && document.elementFromPoint(x, y)?.closest?.('.ball') === g) return { id: g.dataset.id, x, y }
  }
  return null
}, id)
/* a spot of bare canvas with `room` px clear to its right (for the second finger) */
const bareAt = (page, room = 130) => page.evaluate(room => {
  const s0 = document.getElementById('flowSvg').getBoundingClientRect(), b0 = document.getElementById('board').getBoundingClientRect()
  const s = { l: Math.max(s0.left, b0.left), t: Math.max(s0.top, b0.top), r: Math.min(s0.right, b0.right, innerWidth), b: Math.min(s0.bottom, b0.bottom, innerHeight) }
  const busy = (x, y) => { const e = document.elementFromPoint(x, y); return !e || !!(e.closest('.ball') || e.closest('.linehit') || e.closest('.edgehit') || e.closest('.lvert') || e.closest('.lend')) }
  const cx = (s.l + s.r) / 2, cy = (s.t + s.b) / 2; let best = null
  for (let y = s.t + 50; y < s.b - 50; y += 9) for (let x = s.l + 30; x < s.r - room - 10; x += 9) {
    let clear = true; for (let d = 0; d <= room && clear; d += 10) if (busy(x + d, y) || busy(x + d, y - 12) || busy(x + d, y + 12)) clear = false
    if (clear) { const dd = Math.hypot(x - cx, y - cy); if (!best || dd < best.d) best = { x, y, d: dd } }
  }
  return best
}, room)
const ballAt = (page, id) => page.evaluate(id => {
  const g = document.querySelector(`#flowSvg .ball[data-id="${CSS.escape(id)}"]`); if (!g) return null
  const r = g.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2, w: r.width }
}, id)
const tool = async (page, label) => { await page.locator('#arrTools button', { hasText: label }).first().click(); await page.waitForTimeout(150) }
async function editOn(page) { await page.tap('#sylMenuBtn'); await page.waitForTimeout(200); await page.tap('#arrangeBtn'); await page.waitForTimeout(600) }
async function editOff(page) {
  for (let i = 0; i < 2 && !(await page.locator('#arrangeBtn').isVisible()); i++) { await page.tap('#sylMenuBtn'); await page.waitForTimeout(250) }
  await page.tap('#arrangeBtn'); await page.waitForTimeout(600)
}
/* where a ball sits from the middle of the chart area, and its drawn size — the
   board moves at the switch (the tool strip lands above it), so the promise is
   that the point in the MIDDLE stays in the middle */
const fromMid = (page, id) => page.evaluate(id => {
  const b = document.getElementById('board'), r = b.getBoundingClientRect(), g = document.querySelector(`#flowSvg .ball[data-id="${CSS.escape(id)}"]`).getBoundingClientRect()
  return { x: g.left + g.width / 2 - (r.left + b.clientLeft + b.clientWidth / 2), y: g.top + g.height / 2 - (r.top + b.clientTop + b.clientHeight / 2), w: g.width }
}, id)
const held = (a, z) => Math.round(Math.hypot(z.x - a.x * z.w / a.w, z.y - a.y * z.w / a.w))
const inEdit = page => page.evaluate(() => document.getElementById('flowSvg').classList.contains('arrange'))

/* where a drawn line is on screen now: the point `t` of the way along it */
const lineAt = (page, lid, t = 0.5) => page.evaluate(({ lid, t }) => {
  const h = document.querySelector(`#flowSvg .linehit[data-lid="${CSS.escape(lid)}"]`); if (!h) return null
  const q = h.getPointAtLength(h.getTotalLength() * t), m = h.getScreenCTM()
  return { x: q.x * m.a + q.y * m.c + m.e, y: q.x * m.b + q.y * m.d + m.f }
}, { lid, t })
const lineIds = page => page.evaluate(() => [...document.querySelectorAll('#flowSvg .linehit')].map(h => h.dataset.lid))
/* draw a line through the app's own Line tool: tap its start, tap its end */
async function drawLine(page, a, b) {
  const before = await lineIds(page)
  await tool(page, 'Line')
  await page.mouse.click(a.x, a.y); await page.waitForTimeout(200); await page.mouse.click(b.x, b.y); await page.waitForTimeout(300)
  /* a new line is left SELECTED, and 🗑 Delete pressed with a line selected deletes
     it on the spot: Move lets go of it */
  await tool(page, 'Move')
  return (await lineIds(page)).find(id => !before.includes(id)) || null
}
/* the editing canvas's zoom now */
const scaleNow = async page => +(((await look(page)).view.match(/scale\(([\d.]+)\)/) || [0, 1])[1])
/* pinches zoom the canvas, so before each case make sure there is a ball to aim
   at: if not, back to the chart's opening zoom through the app's own controls —
   "✓ Done editing chart", reset, "✎ Edit chart layout" (the middle is held) */
async function ensureView(page) {
  const b = await ballNearMiddle(page)
  if (b && await otherBall(page, b.id)) return
  await editOff(page); await page.click('#fzReset'); await page.waitForTimeout(250); await editOn(page)
}

/* one Edit-layout pinch case: set up, pinch, compare */
async function editCase(page, cdp, label, name, { setup = null, at, lead = 0, second = null, keys = KEEP, picture = null, check = null, keepView = false, atLimit = false, dir = null, hintAtSecond = false }) {
  if (!keepView) await ensureView(page)
  if (setup) await setup()
  const p = await at()
  if (!p) { note(`${label}: ${name}`, false, 'nothing on screen to start on'); return null }
  const a = await look(page)
  if (picture) { await mark(page, p); await shot(page, `${TAG}-${label}-${picture}-1-before`); await unmark(page) }
  let hint2 = null, canvas2 = null
  const end = await pinchFrom(page, cdp, { x: p.x, y: p.y, lead, second, dir: dir || ((await scaleNow(page)) > 1.2 ? 'in' : 'out'),
    onSecond: async () => { await page.waitForTimeout(20); const l = await look(page); hint2 = l.hint; canvas2 = l.canvas } })
  const z = await look(page)
  if (hintAtSecond && hint2 !== a.hint) keys = [...keys, 'hint2'], z.hint2 = hint2, a.hint2 = a.hint
  /* the moment the second finger lands the chart must not move (the zoom starts from there) */
  if (canvas2 !== a.canvas) keys = [...keys, 'hop'], z.hop = canvas2, a.hop = a.canvas
  if (picture) { await mark(page, end); await shot(page, `${TAG}-${label}-${picture}-2-after`); await unmark(page) }
  const d = diff(a, z, keys), zoomed = a.view !== z.view
  const extra = check ? await check(a, z) : { ok: true, detail: '' }
  note(`${label}: ${name}`, !d.length && (zoomed || atLimit) && extra.ok,
    (d.length ? `changed: ${d.join(', ')} (undo ${a.undo}→${z.undo}, lines ${a.nLines}→${z.nLines}, balls ${a.nBalls}→${z.nBalls}, Save ${a.save}→${z.save}) ` : '') +
    (zoomed ? '' : 'the pinch did not zoom ') + (extra.detail || ''), { changed: d })
  return { a, z }
}

async function walk(size, label, { edit = true } = {}) {
  const { browser, page, errors } = await open({ size, touch: true })
  const cdp = await touchCdp(page)
  await page.waitForTimeout(400)

  /* ---- the normal chart: a finger on a ball opens nothing, marks nothing (Astra 14) ---- */
  const popUp = () => page.evaluate(() => { const p = document.getElementById('pop'); const d = document.getElementById('detailBubble'); return { pop: !!(p && p.offsetParent), bubble: !!(d && d.style.display === 'block') } })
  for (const details of [false, true]) {
    if (details) { await page.tap('#detailsBtn'); await page.waitForTimeout(200) }
    await page.click('#fzReset'); await page.waitForTimeout(250)   /* each case from the chart's opening zoom */
    const s = await ballNearMiddle(page), a = await look(page)
    const s2 = s && await ballNearMiddle(page, [s.id])
    if (!s || (details && !s2)) { note(`${label}: N1 the ordinary chart${details ? ' (Details mode)' : ''}`, true, 'not walked — no ball (or pair of balls) clear of the edges in this chart area', { skipped: true }); if (details) { await page.tap('#detailsBtn'); await page.waitForTimeout(200) } continue }
    await pinchFrom(page, cdp, { x: s.x, y: s.y, second: details ? s2 : null })
    const u = await popUp(), z = await look(page)
    note(`${label}: N1 the ordinary chart${details ? ' in ⓘ Details mode, the second finger on another ball' : ''} — a pinch starting on a ball opens ${details ? 'no details bubble' : 'no grading pop-up'} and marks nothing`,
      !u.pop && !u.bubble && a.undo === z.undo, `pop-up ${u.pop}; bubble ${u.bubble}; undo ${a.undo}→${z.undo}`)
    if (details) { await page.tap('#detailsBtn'); await page.waitForTimeout(200) }
  }

  /* ---- M1: opening Edit chart layout keeps the chart still ---- */
  await page.click('#fzReset'); await page.waitForTimeout(250)
  const keep = (await ballNearMiddle(page)) || (await page.evaluate(() => {
    const bd = document.getElementById('board').getBoundingClientRect()
    for (const g of document.querySelectorAll('#flowSvg .ball')) { const r = g.getBoundingClientRect(), y = r.top + r.height / 2, x = r.left + r.width / 2
      if (x > bd.left && x < Math.min(bd.right, innerWidth) && y > bd.top && y < Math.min(bd.bottom, innerHeight)) return { id: g.dataset.id } }
    return null
  }))
  if (!keep) { note(`${label}: the mode switch`, false, 'no ball on screen at all'); await browser.close(); return }
  const k0 = await fromMid(page, keep.id)
  await shot(page, `${TAG}-${label}-M1-1-normal`)
  await editOn(page)
  const k1 = await fromMid(page, keep.id)
  await shot(page, `${TAG}-${label}-M1-2-edit`)
  note(`${label}: M1 opening Edit chart layout keeps the middle of the chart in the middle`, held(k0, k1) <= 2, `${keep.id} ${held(k0, k1)}px from where holding the middle puts it`)

  const room = await page.evaluate(() => { const r = document.getElementById('board').getBoundingClientRect(); return Math.max(0, Math.round(Math.min(r.bottom, innerHeight) - r.top)) })
  if (!edit || room < 150) {
    note(`${label}: Edit chart layout cases`, true, `not walked — ${room}px of chart on screen ([TRK-EDIT-SIDEWAYS], filed)`, { skipped: true })
  } else {
    const B = () => ballNearMiddle(page)
    await editCase(page, cdp, label, 'E1 Move — the first finger on a ball: the pinch moves nothing', { at: B, picture: 'E1-move' })
    await editCase(page, cdp, label, 'E2 Move — the first finger has already moved the ball 15px when the second lands', { at: B, lead: 15 })
    {
      const s1 = await B(), s2 = s1 && await ballNearMiddle(page, [s1.id])
      await editCase(page, cdp, label, 'E3 Move — both fingers on balls', { at: async () => s1, second: s2 })
    }
    await editCase(page, cdp, label, 'E4 Select (nothing selected) — the first finger on a ball', { setup: () => tool(page, 'Select'), at: B })
    await editCase(page, cdp, label, 'E5 Select all, then a finger on one of them — the whole chart stays', {
      setup: async () => { await tool(page, 'Move'); await page.locator('#selectAllBtn').click(); await page.waitForTimeout(150); await tool(page, 'Select') },
      at: B, picture: 'E5-selectall',
    })
    await editCase(page, cdp, label, 'E6 Select, everything selected — the first finger on bare canvas: no box, the selection kept', {
      setup: async () => { await tool(page, 'Move'); await page.locator('#selectAllBtn').click(); await page.waitForTimeout(150); await tool(page, 'Select') },
      at: () => bareAt(page), check: async a => ({ ok: a.sel > 0, detail: a.sel > 0 ? '' : 'premise: nothing selected' }),
    })
    await editCase(page, cdp, label, 'E7 Line — a pinch on bare canvas draws no line', { setup: () => tool(page, 'Line'), at: () => bareAt(page) })
    /* E8: a line half-drawn by one tap; a pinch must not finish it — and the next
       tap still does, where it lands (Astra 1) */
    {
      await tool(page, 'Line')
      const p = await bareAt(page, 120)
      if (!p) note(`${label}: E8 Line — half-drawn line`, false, 'no bare canvas')
      else {
        await page.mouse.click(p.x, p.y); await page.waitForTimeout(250)
        const half = await look(page)
        await editCase(page, cdp, label, 'E8 Line — a line half-drawn by one tap: a pinch leaves it half-drawn, its instruction too', {
          keepView: true, hintAtSecond: true, at: async () => ({ x: p.x + 40, y: p.y + 60 }), keys: KEEP.filter(k => k !== 'overlay'), picture: 'E8-halfline',
        })
        const z0 = await look(page), q = await bareAt(page, 60)
        if (q) { await page.mouse.click(q.x, q.y); await page.waitForTimeout(300) }
        const z1 = await look(page)
        note(`${label}: E8b the half-drawn line still ends with the next tap`, z1.nLines === half.nLines + 1 && z0.nLines === half.nLines, `lines ${half.nLines} → after the pinch ${z0.nLines} → after the tap ${z1.nLines}`)
      }
    }
    /* a line of our own to work on, drawn through the Line tool */
    const p0 = await bareAt(page, 120)
    const L1 = p0 && await drawLine(page, p0, { x: p0.x + 110, y: p0.y + 50 })
    if (!L1) note(`${label}: E9–E13 line cases`, false, 'could not draw a line to work on')
    else {
      await editCase(page, cdp, label, 'E9 Delete — the first finger on a drawn line: the line stays', {
        setup: () => tool(page, 'Delete'), at: () => lineAt(page, L1), picture: 'E9-deleteline',
      })
      await editCase(page, cdp, label, 'E10 Delete — the first finger on a ball: the ball stays', { at: B })
      await editCase(page, cdp, label, 'E11 Connect — the first finger on a ball starts no link', { setup: () => tool(page, 'Connect'), at: B })
      await editCase(page, cdp, label, 'E11b Text — the first finger on a ball opens no editor', {
        setup: () => tool(page, 'Text'), at: B,
        check: async () => { const open = await page.evaluate(() => !!document.getElementById('editModal')); return { ok: !open, detail: open ? 'the ball editor opened' : '' } },
      })
      /* E12: Edit lines — select the line with a tap, then pinch from each of its squares */
      await tool(page, 'Edit lines')
      for (const kind of ['lend', 'lvert']) {
        await ensureView(page); await tool(page, 'Edit lines')
      const m = await lineAt(page, L1); if (m) { await page.mouse.click(m.x, m.y); await page.waitForTimeout(250) }
        const sq = await page.evaluate(k => { const h = document.querySelector(`#flowSvg .${k}`); if (!h) return null; const r = h.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 } }, kind)
        if (!sq) { note(`${label}: E12 Edit lines — a selected line's ${kind === 'lend' ? 'end' : 'corner'} square`, kind === 'lvert', kind === 'lvert' ? 'a straight line has no corner square — none to start on' : 'no end square shown', { skipped: kind === 'lvert' }); continue }
        await editCase(page, cdp, label, `E12 Edit lines — the first finger on a selected line's ${kind === 'lend' ? 'end' : 'corner'} square: nothing moves`, { keepView: true, at: async () => sq, picture: `E12-${kind}` })
      }
      await editCase(page, cdp, label, 'E13 Merge — the first finger on a drawn line picks nothing', { setup: () => tool(page, 'Merge'), at: () => lineAt(page, L1) })
      /* E13b–d (Astra 2): a second line crossing the first; Merge with a finger on
         each; then line one armed by a tap and a finger on line two */
      await ensureView(page)
      const m1 = await lineAt(page, L1)
      const L2 = m1 && await drawLine(page, { x: m1.x, y: m1.y - 70 }, { x: m1.x, y: m1.y + 70 })
      if (L2) {
        await tool(page, 'Merge')
        await editCase(page, cdp, label, 'E13b Merge — one finger on each of two crossing lines: no merge', {
          keepView: true, at: () => lineAt(page, L1, 0.2), second: await lineAt(page, L2, 0.2),
        })
        const one = await lineAt(page, L1, 0.2)
        await page.mouse.click(one.x, one.y); await page.waitForTimeout(250)   /* arms line one */
        await editCase(page, cdp, label, 'E13c Merge — line one armed by a tap, the first finger on line two: no merge, the instruction kept', { keepView: true, hintAtSecond: true, at: () => lineAt(page, L2, 0.2) })
        const u0 = (await look(page)).undo, two = await lineAt(page, L2, 0.2)
        await page.mouse.click(two.x, two.y); await page.waitForTimeout(300)
        const u1 = (await look(page)).undo
        note(`${label}: E13d the armed merge still completes with the next tap (line one stayed armed)`, u1 === u0 + 1, `undo ${u0}→${u1}`)
      } else note(`${label}: E13b–d Merge on crossing lines`, false, 'could not draw the crossing line')
      /* E12c: Edit lines on a PREREQUISITE ARROW — tap it, then pinch from its
         blue bend square and from each orange end */
      /* from the chart's opening view (the cases above zoom it about) */
      await editOff(page); await page.click('#fzReset'); await page.waitForTimeout(250); await editOn(page); await tool(page, 'Edit lines')
      const arrow = await page.evaluate(() => {
        const b = document.getElementById('board').getBoundingClientRect(), bot = Math.min(b.bottom, innerHeight), rt = Math.min(b.right, innerWidth)
        for (const h of document.querySelectorAll('#flowSvg .edgehit')) {
          const L = h.getTotalLength(); if (L < 40) continue
          for (const t of [0.5, 0.35, 0.65, 0.2, 0.8]) {
            const q = h.getPointAtLength(L * t), m = h.getScreenCTM(), x = q.x * m.a + q.y * m.c + m.e, y = q.x * m.b + q.y * m.d + m.f
            const hit = document.elementFromPoint(x, y)
            if (x > b.left + 30 && x < rt - 30 && y > b.top + 40 && y < bot - 40 && hit && hit.closest && hit.closest('.edgehit') === h) return { x, y }
          }
        }
        return null
      })
      if (!arrow) note(`${label}: E12c Edit lines — a prerequisite arrow's squares`, false, 'no prerequisite arrow clear on screen')
      else {
        for (const [kind, sel] of [['bend', '.linehandle'], ['end', '.endhandle']]) {
          await page.mouse.click(arrow.x, arrow.y); await page.waitForTimeout(250)
          const sq = await page.evaluate(sel => { const h = document.querySelector(`#flowSvg ${sel}`); if (!h) return null; const r = h.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 } }, sel)
          if (!sq) { note(`${label}: E12c Edit lines — a prerequisite arrow's ${kind} square`, false, 'the square did not show after tapping the arrow'); continue }
          await editCase(page, cdp, label, `E12c Edit lines — the first finger on a prerequisite arrow's ${kind} square: nothing moves`, { keepView: true, at: async () => sq, picture: `E12c-${kind}` })
        }
      }
    }
    /* E13e (Astra 10): an unsaved structure edit is waiting (the lines above lit
       ✓ Save changes) — a pinch on a ball keeps it lit and adds nothing */
    await tool(page, 'Move')
    await editCase(page, cdp, label, 'E13e Move — with an unsaved edit waiting, a pinch on a ball keeps ✓ Save changes and adds nothing', {
      at: B, check: async a => ({ ok: a.save, detail: a.save ? '' : 'premise: Save changes was not lit' }),
    })
    /* E14 (Astra 9): a pinch straight after an undo keeps ↷ */
    {
      await ensureView(page); await tool(page, 'Move')
      const s = await B()
      if (s) { await page.mouse.move(s.x, s.y); await page.mouse.down(); await page.mouse.move(s.x + 20, s.y + 10, { steps: 4 }); await page.mouse.up(); await page.waitForTimeout(300) }
      await page.click('#trUndoBtn'); await page.waitForTimeout(300)
      await editCase(page, cdp, label, 'E14 after an undo — a pinch on a ball keeps ↷ (redo) and ↶ as they were', {
        at: B, check: async a => ({ ok: a.redo > 0, detail: a.redo > 0 ? '' : 'premise: nothing to redo' }),
      })
    }
    /* E20 (Astra's final read #2): with a finger held on a ball, Ctrl+Z undoes the
       last chart edit; a second finger then lands and pinches — the undo must stay
       done (the take-back is for what the FIRST FINGER did, nothing else) */
    {
      await ensureView(page); await tool(page, 'Move')
      const s = await B(), t = (type, pts) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: pts })
      const o = s && await otherBall(page, s.id)
      if (!s || !o) note(`${label}: E20 Ctrl+Z with a finger down`, false, 'no two balls in view')
      else {
        /* an edit to take back: a mouse drag of ball o */
        await page.mouse.move(o.x, o.y); await page.mouse.down(); await page.mouse.move(o.x + 25, o.y + 12, { steps: 4 }); await page.mouse.up(); await page.waitForTimeout(300)
        const moved = await look(page)
        await t('touchStart', [{ x: s.x, y: s.y, id: 1 }]); await page.waitForTimeout(40)
        await page.keyboard.press('Control+z'); await page.waitForTimeout(900)   /* the undo's own save lands */
        const undone = await look(page)
        await t('touchStart', [{ x: s.x, y: s.y, id: 1 }, { x: s.x + (s.x > 200 ? -70 : 70), y: s.y, id: 2 }]); await page.waitForTimeout(30)
        for (let i = 1; i <= 8; i++) { await t('touchMove', [{ x: s.x - 3 * i, y: s.y, id: 1 }, { x: s.x + (s.x > 200 ? -70 - 3 * i : 70 + 3 * i), y: s.y, id: 2 }]); await page.waitForTimeout(16) }
        await t('touchEnd', []); await page.waitForTimeout(400)
        const z = await look(page)
        note(`${label}: E20 Ctrl+Z with a finger held, then a pinch — the undo stays done`,
          undone.undo === moved.undo - 1 && z.balls === undone.balls && z.undo === undone.undo && z.redo === undone.redo && z.lay === undone.lay,
          `undo ${moved.undo}→${undone.undo}→${z.undo}; redo ${moved.redo}→${undone.redo}→${z.redo}; balls ${z.balls === undone.balls ? 'as undone' : z.balls === moved.balls ? 'BACK to before the undo' : 'changed'}`)
      }
    }
    /* E20b: the same with a click on ↶ on the bar (a mouse, on a touchscreen laptop) */
    {
      await ensureView(page); await tool(page, 'Move')
      const s = await B(), t = (type, pts) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: pts })
      const o = s && await otherBall(page, s.id)
      if (!s || !o) note(`${label}: E20b ↶ with a finger down`, false, 'no two balls in view')
      else {
        await page.mouse.move(o.x, o.y); await page.mouse.down(); await page.mouse.move(o.x + 25, o.y + 12, { steps: 4 }); await page.mouse.up(); await page.waitForTimeout(300)
        const moved = await look(page)
        await t('touchStart', [{ x: s.x, y: s.y, id: 1 }]); await page.waitForTimeout(40)
        await page.click('#trUndoBtn'); await page.waitForTimeout(900)   /* the undo's own save lands */
        const undone = await look(page)
        const g = s.x > 200 ? -70 : 70
        await t('touchStart', [{ x: s.x, y: s.y, id: 1 }, { x: s.x + g, y: s.y, id: 2 }]); await page.waitForTimeout(30)
        for (let i = 1; i <= 8; i++) { await t('touchMove', [{ x: s.x - Math.sign(g) * 3 * i, y: s.y, id: 1 }, { x: s.x + g + Math.sign(g) * 3 * i, y: s.y, id: 2 }]); await page.waitForTimeout(16) }
        await t('touchEnd', []); await page.waitForTimeout(400)
        const z = await look(page)
        note(`${label}: E20b a click on ↶ with a finger held, then a pinch — the undo stays done`,
          undone.undo === moved.undo - 1 && z.balls === undone.balls && z.undo === undone.undo && z.redo === undone.redo && z.lay === undone.lay,
          `undo ${moved.undo}→${undone.undo}→${z.undo}; redo ${moved.redo}→${undone.redo}→${z.redo}; balls ${z.balls === undone.balls ? 'as undone' : z.balls === moved.balls ? 'BACK to before the undo' : 'changed'}`)
      }
    }
    /* E20c (Fable's final read F3): an unsaved edit waiting, a finger held on a
       ball, ✓ Save changes pressed (a mouse), then a pinch — the save stands */
    {
      await ensureView(page); await tool(page, 'Move')
      const s = await B(), t = (type, pts) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: pts })
      const a = await look(page)
      if (!s || !a.save) note(`${label}: E20c ✓ Save changes with a finger held`, false, !s ? 'no ball in view' : 'premise: no unsaved edit waiting')
      else {
        await t('touchStart', [{ x: s.x, y: s.y, id: 1 }]); await page.waitForTimeout(40)
        await page.click('#saveChanges'); await page.waitForTimeout(500)
        const saved = await look(page)
        const g = s.x > 200 ? -70 : 70
        await t('touchStart', [{ x: s.x, y: s.y, id: 1 }, { x: s.x + g, y: s.y, id: 2 }]); await page.waitForTimeout(30)
        for (let i = 1; i <= 8; i++) { await t('touchMove', [{ x: s.x - Math.sign(g) * 3 * i, y: s.y, id: 1 }, { x: s.x + g + Math.sign(g) * 3 * i, y: s.y, id: 2 }]); await page.waitForTimeout(16) }
        await t('touchEnd', []); await page.waitForTimeout(400)
        const z = await look(page)
        note(`${label}: E20c ✓ Save changes with a finger held, then a pinch — the save stands`,
          !saved.save && !z.save && z.undo === saved.undo && z.redo === saved.redo && z.balls === saved.balls,
          `Save changes ${a.save}→${saved.save}→${z.save}; undo ${a.undo}→${saved.undo}→${z.undo}`)
      }
    }
    /* E21 (Fable F1, the heal): two touches whose lifts never arrived (as Safari can
       lose them when the chart is redrawn under a finger) — the next real finger is
       a NEW first touch and must drag a ball, not be read as a pinch */
    {
      await ensureView(page); await tool(page, 'Move')
      const s = await B(), o = s && await otherBall(page, s.id)
      if (!s || !o) note(`${label}: E21 a lost lift`, false, 'no two balls in view')
      else {
        await page.evaluate(({ o }) => {
          const g = document.elementFromPoint(o.x, o.y), svg = document.getElementById('flowSvg')
          const pe = (type, id, prim, el, x, y) => el.dispatchEvent(new PointerEvent(type, { pointerId: id, pointerType: 'touch', isPrimary: prim, bubbles: true, cancelable: true, clientX: x, clientY: y }))
          pe('pointerdown', 901, true, g, o.x, o.y); pe('pointerdown', 902, false, svg, o.x + 60, o.y)
        }, { o })
        await page.waitForTimeout(100)
        const a = await look(page), t = (type, pts) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: pts })
        const s2 = await B()
        await t('touchStart', [{ x: s2.x, y: s2.y, id: 3 }])
        for (let i = 1; i <= 8; i++) { await t('touchMove', [{ x: s2.x + 5 * i, y: s2.y + 3 * i, id: 3 }]); await page.waitForTimeout(16) }
        await t('touchEnd', []); await page.waitForTimeout(500)
        const z = await look(page)
        note(`${label}: E21 two lifts lost — the next finger is a new touch and still drags a ball`, z.balls !== a.balls && z.undo === a.undo + 1, `undo ${a.undo}→${z.undo}; ball ${z.balls !== a.balls ? 'moved' : 'did not move'}`)
      }
    }
    /* E22 (Fable F1, the routing): Delete, one finger tapping a drawn line — its
       landing redraws the chart, and its lift arrives at the element it landed on,
       now gone from the page (Safari's way). The delete must be stored at the lift,
       and the next finger must still drag a ball */
    {
      await ensureView(page)
      const q = await bareAt(page, 120), lid = q && await drawLine(page, q, { x: q.x + 110, y: q.y })
      const m = lid && await lineAt(page, lid)
      if (!m) note(`${label}: E22 a lift on a removed element`, false, 'could not draw a line to tap')
      else {
        await tool(page, 'Delete')
        const a = await look(page)
        const r = await page.evaluate(({ m, lid }) => {
          const h = document.querySelector(`#flowSvg .linehit[data-lid="${lid}"]`)
          const pe = (type, el) => el.dispatchEvent(new PointerEvent(type, { pointerId: 905, pointerType: 'touch', isPrimary: true, bubbles: true, cancelable: true, clientX: m.x, clientY: m.y }))
          pe('pointerdown', h)
          const gone = !h.isConnected
          pe('pointerup', h)
          return { gone }
        }, { m, lid })
        await page.waitForTimeout(300)
        const z = await look(page)
        await tool(page, 'Move')
        const s = await B(), t = (type, pts) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: pts })
        const b0 = await look(page)
        if (s) { await t('touchStart', [{ x: s.x, y: s.y, id: 4 }]); for (let i = 1; i <= 8; i++) { await t('touchMove', [{ x: s.x + 5 * i, y: s.y + 3 * i, id: 4 }]); await page.waitForTimeout(16) } await t('touchEnd', []); await page.waitForTimeout(500) }
        const b1 = await look(page)
        note(`${label}: E22 a Delete tap whose lift lands on the removed line — stored at the lift, and the next finger still drags`,
          r.gone && z.nLines === a.nLines - 1 && z.lay !== a.lay && z.cmd === a.cmd + 1 && b1.balls !== b0.balls,
          `line ${r.gone ? 'redrawn away under the finger' : 'NOT redrawn (premise)'}; stored ${z.lay !== a.lay ? 'changed' : 'unchanged'}; commands ${a.cmd}→${z.cmd}; next drag ${b1.balls !== b0.balls ? 'moved the ball' : 'did not move the ball'}`)
      }
    }
    /* E23 (Fable F4): a MOUSE drag of a ball in progress, and two fingers pinch —
       the mouse drag is not the fingers' to stop: it finishes and saves */
    {
      await ensureView(page); await tool(page, 'Move')
      const o = await B(), q = await emptySpot(page)
      if (!o || !q) note(`${label}: E23 a mouse drag under a pinch`, false, 'no ball or bare canvas in view')
      else {
        const a = await look(page)
        await page.mouse.move(o.x, o.y); await page.mouse.down(); await page.mouse.move(o.x + 30, o.y + 15, { steps: 4 })
        await pinch(page, cdp, { cx: q.x, cy: q.y, d0: 80, d1: 120 })
        await page.mouse.move(o.x + 40, o.y + 20, { steps: 2 }); await page.mouse.up(); await page.waitForTimeout(500)
        const z = await look(page)
        note(`${label}: E23 a mouse drag with a pinch in the middle of it still finishes and saves`, z.lay !== a.lay && z.undo === a.undo + 1, `stored ${z.lay !== a.lay ? 'changed' : 'unchanged'}; undo ${a.undo}→${z.undo}`)
      }
    }
    /* E15: pinch, lift one finger, carry on with the other */
    {
      await ensureView(page)
      const s = await B(), a = await look(page), t = (type, pts) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: pts })
      if (!s) throw new Error('no ball in view')
      await t('touchStart', [{ x: s.x, y: s.y, id: 1 }]); await page.waitForTimeout(40)
      await t('touchStart', [{ x: s.x, y: s.y, id: 1 }, { x: s.x + 70, y: s.y, id: 2 }])
      for (let i = 1; i <= 6; i++) { await t('touchMove', [{ x: s.x - 4 * i, y: s.y, id: 1 }, { x: s.x + 70 + 4 * i, y: s.y, id: 2 }]); await page.waitForTimeout(16) }
      await t('touchEnd', [{ x: s.x - 24, y: s.y, id: 1 }]); await page.waitForTimeout(30)   /* finger 2 lifts */
      for (let i = 1; i <= 8; i++) { await t('touchMove', [{ x: s.x - 24 - 8 * i, y: s.y + 6 * i, id: 1 }]); await page.waitForTimeout(16) }
      await t('touchEnd', []); await page.waitForTimeout(400)
      const z = await look(page), d = diff(a, z)
      note(`${label}: E15 pinch, lift one finger, carry on with the other — nothing moves`, !d.length, d.length ? 'changed: ' + d.join(', ') : '')
    }
    /* E15b: the other lift order — the FIRST finger (the one on the ball) lifts, the second carries on */
    {
      await ensureView(page)
      const s = await B(), a = await look(page), t = (type, pts) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: pts })
      if (!s) throw new Error('no ball in view')
      await t('touchStart', [{ x: s.x, y: s.y, id: 1 }]); await page.waitForTimeout(40)
      await t('touchStart', [{ x: s.x, y: s.y, id: 1 }, { x: s.x + 70, y: s.y, id: 2 }])
      for (let i = 1; i <= 6; i++) { await t('touchMove', [{ x: s.x - 4 * i, y: s.y, id: 1 }, { x: s.x + 70 + 4 * i, y: s.y, id: 2 }]); await page.waitForTimeout(16) }
      await t('touchEnd', [{ x: s.x + 94, y: s.y, id: 2 }]); await page.waitForTimeout(30)   /* finger 1 lifts */
      for (let i = 1; i <= 8; i++) { await t('touchMove', [{ x: s.x + 94 + 8 * i, y: s.y + 6 * i, id: 2 }]); await page.waitForTimeout(16) }
      await t('touchEnd', []); await page.waitForTimeout(400)
      const z = await look(page), d = diff(a, z)
      note(`${label}: E15b pinch, lift the FIRST finger, carry on with the second — nothing moves`, !d.length, d.length ? 'changed: ' + d.join(', ') : '')
    }
    /* E18: a pinch that began on a ball (so the take-back redrew the board under
       the first finger), both fingers sliding up off the chart and lifting over
       the bar — the next single finger must still drag a ball, not count as the
       second finger of a pinch that never ended */
    {
      await ensureView(page); await tool(page, 'Move')
      const s = await B(), t = (type, pts) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: pts })
      const top = await page.evaluate(() => Math.round(document.getElementById('board').getBoundingClientRect().top))
      if (!s) note(`${label}: E18 fingers lifted off the chart`, false, 'no ball in view')
      else {
        await t('touchStart', [{ x: s.x, y: s.y, id: 1 }]); await page.waitForTimeout(40)
        await t('touchStart', [{ x: s.x, y: s.y, id: 1 }, { x: s.x + 70, y: s.y, id: 2 }])
        const steps = 12, up = s.y - top + 60
        for (let i = 1; i <= steps; i++) { await t('touchMove', [{ x: s.x - 2 * i, y: s.y - up * i / steps, id: 1 }, { x: s.x + 70 + 2 * i, y: s.y - up * i / steps, id: 2 }]); await page.waitForTimeout(16) }
        await t('touchEnd', []); await page.waitForTimeout(400)
        await ensureView(page)
        const s2 = await B(), a = await look(page)
        await t('touchStart', [{ x: s2.x, y: s2.y, id: 3 }])
        for (let i = 1; i <= 8; i++) { await t('touchMove', [{ x: s2.x + 5 * i, y: s2.y + 3 * i, id: 3 }]); await page.waitForTimeout(16) }
        await t('touchEnd', []); await page.waitForTimeout(500)
        const z = await look(page)
        note(`${label}: E18 fingers slid off the chart and lifted over the bar — the next single finger still drags a ball`, z.balls !== a.balls && z.undo === a.undo + 1, `undo ${a.undo}→${z.undo}; ball ${z.balls !== a.balls ? 'moved' : 'did not move'}`)
      }
    }
    /* E19 (Astra 16): at the 400% ceiling a pinch cannot zoom — a pinch that
       starts on a ball there must still move nothing */
    {
      await ensureView(page); await tool(page, 'Move')
      /* zoom in about a ball, the fingers either side of it (on its edge or off it), so a ball is on screen at 400% */
      for (let i = 0; i < 6 && (await scaleNow(page)) < 3.99; i++) {
        const c = await B(); if (!c) break
        const r = await ballAt(page, c.id), d0 = Math.max(50, r.w + 24)
        await pinch(page, cdp, { cx: c.x, cy: c.y, d0, d1: Math.min(d0 * 2.2, 300) })
      }
      const k = await scaleNow(page)
      if (k < 3.99) note(`${label}: E19 at the zoom ceiling`, false, `could not reach 400% (${Math.round(k * 100)}%)`)
      else await editCase(page, cdp, label, 'E19 at the 400% ceiling — a pinch starting on a ball moves nothing', {
        keepView: true, atLimit: true, dir: 'out',
        at: async () => (await ballNearMiddle(page)) || await page.evaluate(() => {
          const bd = document.getElementById('board').getBoundingClientRect(), rt = Math.min(bd.right, innerWidth), bot = Math.min(bd.bottom, innerHeight)
          for (let y = bd.top + 40; y < bot - 40; y += 12) for (let x = bd.left + 40; x < rt - 110; x += 12) { const e = document.elementFromPoint(x, y); if (e && e.closest && e.closest('.ball')) return { x, y } }
          return null
        }),
      })
      await editOff(page); await page.click('#fzReset'); await page.waitForTimeout(250); await editOn(page)
    }
    /* E16: the pinch on bare canvas still keeps the chart under the fingers */
    {
      const p = await emptySpot(page)
      if (p) {
        const c0 = await chartAt(page, p), end = await pinch(page, cdp, { cx: p.x, cy: p.y, d0: 70, d1: 160, dx: 20, dy: -30 }), c1 = await chartAt(page, end)
        const k = +((await look(page)).view.match(/scale\(([\d.]+)\)/) || [0, 1])[1], off = Math.round(Math.hypot(c1.x - c0.x, c1.y - c0.y) * k * 10) / 10
        note(`${label}: E16 a pinch on bare canvas keeps the chart under the fingers`, off <= 6, `${off}px`)
      } else note(`${label}: E16 a pinch on bare canvas keeps the chart under the fingers`, false, 'no bare canvas')
    }
    /* E17: one finger still drags a ball — one undo step, and the move saves itself */
    {
      await ensureView(page)
      const s = await B(), a = await look(page), t = (type, pts) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: pts })
      if (!s) throw new Error('no ball in view')
      await t('touchStart', [{ x: s.x, y: s.y, id: 1 }])
      for (let i = 1; i <= 8; i++) { await t('touchMove', [{ x: s.x + 5 * i, y: s.y + 3 * i, id: 1 }]); await page.waitForTimeout(16) }
      await t('touchEnd', []); await page.waitForTimeout(500)
      const z = await look(page)
      note(`${label}: E17 one finger still drags a ball — it moves, one undo step, saved, Save changes not lit`,
        z.balls !== a.balls && z.undo === a.undo + 1 && z.lay !== a.lay && z.save === a.save, `undo ${a.undo}→${z.undo}; stored ${z.lay !== a.lay ? 'changed' : 'unchanged'}; Save ${a.save}→${z.save}`)
    }
    await tool(page, 'Move')
  }

  /* ---- M2: "✓ Done editing chart" keeps the chart still ---- */
  const k2 = await fromMid(page, keep.id)
  await shot(page, `${TAG}-${label}-M2-1-edit`)
  await editOff(page)
  const k3 = await fromMid(page, keep.id)
  await shot(page, `${TAG}-${label}-M2-2-normal`)
  note(`${label}: M2 "✓ Done editing chart" keeps the middle of the chart in the middle`, !(await inEdit(page)) && held(k2, k3) <= 2, `${keep.id} ${held(k2, k3)}px from where holding the middle puts it`)

  /* ---- M3: the owner's case — after Edit chart layout, a pinch on the chart ---- */
  {
    const s = (await ballNearMiddle(page)) || (await page.evaluate(() => {
      const bd = document.getElementById('board').getBoundingClientRect()
      for (const g of document.querySelectorAll('#flowSvg .ball')) { const r = g.getBoundingClientRect(), x = r.left + r.width / 2, y = r.top + r.height / 2
        if (x > bd.left + 20 && x < Math.min(bd.right, innerWidth) - 100 && y > bd.top + 20 && y < Math.min(bd.bottom, innerHeight) - 20) return { id: g.dataset.id, x, y } }
      return { id: null, x: bd.left + bd.width / 3, y: bd.top + 200 }
    }))
    const pct0 = await page.evaluate(() => document.getElementById('fzPct')?.textContent)
    await mark(page, s); await shot(page, `${TAG}-${label}-M3-1-before`); await unmark(page)
    const end = await pinchFrom(page, cdp, { x: s.x, y: s.y, spread: 3 })
    const vp = await page.evaluate(() => document.getElementById('viewport').getAttribute('transform'))
    const b1 = (s.id && await ballAt(page, s.id)) || end
    const shown = await page.evaluate(() => ({ pct: parseInt(document.getElementById('fzPct').textContent, 10) / 100, zoom: +getComputedStyle(document.querySelector('#board .flowwrap')).zoom }))
    await mark(page, end); await shot(page, `${TAG}-${label}-M3-2-after`); await unmark(page)
    const clean = /^translate\(0(\.0)?,0(\.0)?\) scale\(1(\.000)?\)$/.test(vp)
    note(`${label}: M3 after Edit chart layout, a pinch zooms the chart it shows — nothing shrinks or slides off the left`, clean && Math.abs(shown.pct - shown.zoom) < 0.011,
      `the chart's own transform ${vp}; shows ${pct0} → ${Math.round(shown.pct * 100)}%, drawn at ${Math.round(shown.zoom * 100)}%; ${s.id} ${Math.round(Math.hypot(b1.x - end.x, b1.y - end.y))}px from the fingers`)
  }
  /* ---- M4: a canvas zoomed past the chart's 300% ceiling comes back clamped, the middle held ---- */
  if (edit && room >= 150) {
    await editOn(page)
    const p = await emptySpot(page)
    if (p) { for (let i = 0; i < 3; i++) await pinch(page, cdp, { cx: p.x, cy: p.y, d0: 50, d1: 220 }) }
    /* the ball nearest the middle, measured from the middle before and after:
       holding the middle while 400% becomes 300% puts it at 3/4 of its offset */
    const near = await page.evaluate(() => {
      const b = document.getElementById('board'), r = b.getBoundingClientRect(), mx = r.left + b.clientLeft + b.clientWidth / 2, my = r.top + b.clientTop + b.clientHeight / 2
      let best = null; for (const g of document.querySelectorAll('#flowSvg .ball')) { const q = g.getBoundingClientRect(); const d = Math.hypot(q.left + q.width / 2 - mx, q.top + q.height / 2 - my); if (!best || d < best.d) best = { id: g.dataset.id, d } }
      return best && best.id
    })
    const k = await scaleNow(page), f0 = await fromMid(page, near)
    await editOff(page)
    const z = await page.evaluate(() => +getComputedStyle(document.querySelector('#board .flowwrap')).zoom), f1 = await fromMid(page, near)
    await shot(page, `${TAG}-${label}-M4-normal-300`)
    note(`${label}: M4 an editing canvas zoomed to ${Math.round(k * 100)}% comes back at ${Math.round(z * 100)}% with the middle held`, z <= 3 && held(f0, f1) <= 3, `${near} ${held(f0, f1)}px from where holding the middle puts it`)
  }

  /* ---- M5 (phone): a zoom chosen in Edit chart layout is the user's own — the
     Info tab and back does not snap it back to fit ---- */
  if (label === 'phone') {
    await page.click('#fzReset'); await page.waitForTimeout(250)
    await editOn(page)
    const q = await emptySpot(page); if (q) await pinch(page, cdp, { cx: q.x, cy: q.y, d0: 70, d1: 150 })
    await editOff(page)
    const z0 = await page.evaluate(() => document.getElementById('fzPct').textContent)
    await page.tap('#page-tracker button[data-view="info"]'); await page.waitForTimeout(300)
    await page.tap('#page-tracker button[data-view="flow"]'); await page.waitForTimeout(500)
    const z1 = await page.evaluate(() => document.getElementById('fzPct').textContent)
    note(`${label}: M5 a zoom chosen in Edit chart layout stays after the Info tab and back`, z0 === z1, `${z0} → ${z1}`)
    /* ---- M6 (phone): logging out from inside Edit chart layout leaves nothing of
       its view behind for the next person ---- */
    await editOn(page)
    const q2 = await emptySpot(page); if (q2) await pinch(page, cdp, { cx: q2.x, cy: q2.y, d0: 60, d1: 160, dx: 40, dy: -40 })
    const { logout, login, toTracker } = await import('./trk-lib.mjs')
    const out = logout(page)
    /* the unsaved chart edits of this walk: Logout asks (D129) — discard them */
    try { await page.waitForSelector('#dlgModal', { state: 'visible', timeout: 3000 }); await page.locator('#dlgModal button', { hasText: /Discard/ }).first().click() } catch (_) {}
    await out
    await login(page, 'u'); await toTracker(page)
    const s = await ballNearMiddle(page)
    if (s) await pinchFrom(page, cdp, { x: s.x, y: s.y })
    const vp = await page.evaluate(() => document.getElementById('viewport').getAttribute('transform'))
    note(`${label}: M6 logged out from Edit chart layout — the next login's pinch zooms a clean chart`, /^translate\(0(\.0)?,0(\.0)?\) scale\(1(\.000)?\)$/.test(vp), vp)
  }

  note(`${label}: no console or page errors`, errors.length === 0, errors.slice(0, 3).join(' | '))
  await browser.close()
}

/* WALK_ONLY=phone runs one size — the break tests use it */
const only = process.env.WALK_ONLY
if (!only || only === 'phone') await walk(PHONE, 'phone')
if (!only || only === 'phone-sideways') await walk({ width: 844, height: 390 }, 'phone-sideways')
if (!only || only === 'tablet') await walk({ width: 1366, height: 1024 }, 'tablet')

const failed = rows.filter(r => !r.pass)
console.log(`\n${rows.filter(r => r.pass).length}/${rows.length} passed`)
save(`pinch-ball-${TAG}`, { rows })
