/* [LW-REARRANGE-EDGE-SCROLL] + [DRAG-EDGE-SCROLL-ELSEWHERE] (owner D892, D893, 15 Oct 26 — "when I drag the row of the
   puck down outside the screen, the screen doesn't pan"): a thing carried to the edge of what scrolls it scrolls it.
   By a REAL drag — a mouse on the desktop, touch events on a phone: press, carry to the edge, HOLD still, read.
     1. the Leave War, Rearrange on: a man's row carried to the screen's foot — the page runs down and the landing line
        follows the rows sliding under the still pointer (a row further down wears it);
     2. a day opened on the Inputs calendar holding many notes: a note carried to the list's foot — the list runs down;
     3. Quals, Edit quals on: a heading carried to the table's right edge — the table runs sideways.
   Each drag is then let go with NO drop (a touch-cancel on a phone; on a desktop, carried back to where it began).
   Assertions of the RIGHT behaviour (a PASS means correct), so a re-run is the re-walk.
   usage: DL_BASE=http://localhost:4173 DL_SHOTS=docs/img/handpass/2026-10-15-lw-landing-line/edge node scripts/handpass/edgescroll-walk.mjs */
import { mkdirSync } from 'node:fs'
import * as L from './dl-lib.mjs'

mkdirSync(L.SHOTS, { recursive: true })
const results = []
const ok = (size, step, pass, saw) => { results.push({ size, step, pass, saw }); console.log(`${pass ? 'PASS' : 'FAIL'} [${size}] ${step} — ${saw}`) }

/** Press at (gx, gy), carry to (tx, ty), hold `ms`; returns { read, release } — release carries back / cancels. */
let moveTo = async () => {}
async function carry(w, gx, gy, tx, ty, ms = 1500) {
  const p = w.page
  if (!w.phone) {
    moveTo = async (x, y) => { await p.mouse.move(x, y, { steps: 6 }); await L.sleep(400) }
    await p.mouse.move(gx, gy); await p.mouse.down(); await L.sleep(120)
    for (let i = 1; i <= 14; i++) { await p.mouse.move(gx + (tx - gx) * i / 14, gy + (ty - gy) * i / 14); await L.sleep(35) }
    await L.sleep(ms)
    return async () => {
      await p.evaluate(() => window.dispatchEvent(new PointerEvent('pointercancel', { bubbles: true })))
      await L.sleep(100); await p.mouse.up(); await L.sleep(400)
    }
  }
  const cdp = await w.ctx.newCDPSession(p)
  moveTo = async (x, y) => { for (let i = 1; i <= 6; i++) await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: tx + (x - tx) * i / 6, y: ty + (y - ty) * i / 6, id: 1 }] }); await L.sleep(400) }
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: gx, y: gy, id: 1 }] }); await L.sleep(150)
  for (let i = 1; i <= 14; i++) { await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: gx + (tx - gx) * i / 14, y: gy + (ty - gy) * i / 14, id: 1 }] }); await L.sleep(35) }
  await L.sleep(ms)
  return async () => { await cdp.send('Input.dispatchTouchEvent', { type: 'touchCancel', touchPoints: [] }); await L.sleep(400) }
}

/** the vertical scroller the page uses for an element (as the app finds it) and its scroll position */
const vpos = (page, sel) => page.evaluate(s => {
  const el = document.querySelector(s); if (!el) return null
  for (let n = el.parentElement; n && n !== document.body; n = n.parentElement) {
    const o = getComputedStyle(n).overflowY
    if ((o === 'auto' || o === 'scroll') && n.scrollHeight > n.clientHeight + 1) return { doc: false, top: n.scrollTop }
  }
  return { doc: true, top: (document.scrollingElement || document.documentElement).scrollTop }
}, sel)

for (const size of ['desk', 'phone']) {
  const w = await L.world(size)
  const H = w.S.h, W = w.S.w
  try {
    /* 1 — the Leave War's Rearrange */
    await L.go(w, 'leavewar'); await w.page.waitForSelector('#page-leavewar [data-testid^="row-"]', { timeout: 20000 }); await L.sleep(800)
    await w.press('[data-testid="roster-arrange"]'); await L.sleep(700)
    const g = await w.page.evaluate(() => {
      const grip = [...document.querySelectorAll('#page-leavewar .mx-wrap [data-testid^="drag-"]')].find(e => { const r = e.getBoundingClientRect(); return r.top > 120 && r.bottom < innerHeight - 120 })
      if (!grip) return null
      const r = grip.getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2, id: grip.getAttribute('data-testid') }
    })
    if (!g) ok(size, 'Rearrange: a grip in view', false, 'none')
    else {
      const before = await vpos(w.page, `[data-testid="${g.id}"]`)
      const markBefore = await w.page.evaluate(() => document.querySelector('#page-leavewar .mx-wrap tr.dragover')?.getAttribute('data-testid') ?? null)
      const release = await carry(w, g.x, g.y, g.x + 40, H - 20)
      const after = await vpos(w.page, `[data-testid="${g.id}"]`)
      const dbg = async label => console.log(`   (${size} ${label}: picked-up row ${await w.page.evaluate(() => !!document.querySelector('#page-leavewar tr.dragging'))}; under (${g.x + 40}, ${H - 140}): ${await w.page.evaluate(([x, y]) => { const e = document.elementFromPoint(x, y); return e ? (e.closest('tr')?.getAttribute('data-testid') || e.className || e.tagName) : null }, [g.x + 40, H - 140])})`)
      await dbg('held at the foot')
      // up off the band onto a MAN'S row near the foot (a group heading is not a place a man's row lands)
      const yUp = await w.page.evaluate(h => {
        const r = [...document.querySelectorAll('#page-leavewar .mx-wrap [data-testid^="row-"]')].map(e => e.getBoundingClientRect())
          .filter(b => b.top > h * 0.45 && b.bottom < h - 70).pop()
        return r ? r.top + r.height * 0.3 : h - 140
      }, H)
      await moveTo(g.x + 40, yUp)
      await dbg('moved up')
      const mark = await w.page.evaluate(() => { const t = document.querySelector('#page-leavewar .mx-wrap tr.dragover'); return t ? { id: t.getAttribute('data-testid'), y: Math.round(t.getBoundingClientRect().top) } : null })
      ok(size, 'Rearrange: a man\'s row held at the screen\'s foot scrolls the grid down', after && before && after.top > before.top + 100, `${before?.doc ? 'the page' : 'its box'} ${before?.top} → ${after?.top}`)
      ok(size, 'Rearrange: the landing line follows — a row near the foot wears it', !!mark && mark.y > H * 0.45, `marked ${JSON.stringify(mark)} (before: ${markBefore})`)
      await L.pic(w, `E1-rearrange-${size}`)
      const order0 = await w.page.evaluate(() => [...document.querySelectorAll('#page-leavewar .mx-wrap [data-testid^="row-"]')].map(r => r.getAttribute('data-testid')).join(','))
      await release()
      const order1 = await w.page.evaluate(() => [...document.querySelectorAll('#page-leavewar .mx-wrap [data-testid^="row-"]')].map(r => r.getAttribute('data-testid')).join(','))
      ok(size, 'Rearrange: let go with no drop — the order is unchanged', order0 === order1, order0 === order1 ? 'unchanged' : 'CHANGED')
    }
    await w.press('[data-testid="roster-arrange"]'); await L.sleep(400)

    /* 2 — a day opened on the Inputs calendar, many notes */
    await L.go(w, 'inputs'); await w.page.waitForSelector('#inpCal [data-icday]', { timeout: 20000 }); await L.sleep(500)
    const day = await w.page.evaluate(() => [...document.querySelectorAll('#inpCal [data-icday]')].map(e => e.getAttribute('data-icday'))[14])
    const cell = w.page.locator(`#inpCal [data-icday="${day}"]`)
    if (w.phone) await cell.tap({ position: { x: 10, y: 10 } }); else await cell.click({ position: { x: 10, y: 10 } })
    await w.page.locator('[data-testid="win-inputsday"]').waitFor(); await L.sleep(400)
    for (let i = 30; i >= 1; i--) {
      await w.press('#icAddPuck'); await L.sleep(120)
      await w.page.locator('.ic-newnote .ic-poppuck-edit').fill(`Edge note ${String(i).padStart(2, '0')}`)
      await w.page.locator('.ic-newnote .ic-poppuck-edit').press('Enter'); await L.sleep(160)
    }
    const n = await w.page.evaluate(() => {
      const win = document.querySelector('[data-testid="win-inputsday"]')
      const any = win.querySelector('.ic-secs [data-sechandle]')
      for (let e = any?.parentElement; e && e !== document.body; e = e.parentElement) { const o = getComputedStyle(e).overflowY; if ((o === 'auto' || o === 'scroll') && e.scrollHeight > e.clientHeight + 1) { e.scrollTop = 0; break } }
      const h = [...win.querySelectorAll('.ic-secs [data-sechandle]')].find(x => { const r = x.getBoundingClientRect(); return r.top > 40 && r.bottom < innerHeight - 120 }) || any
      // the box that scrolls the notes, and its visible foot
      let sc = null; for (let e = h?.parentElement; e && e !== document.body; e = e.parentElement) { const o = getComputedStyle(e).overflowY; if ((o === 'auto' || o === 'scroll') && e.scrollHeight > e.clientHeight + 1) { sc = e; break } }
      const sr = sc ? sc.getBoundingClientRect() : null, r = h.getBoundingClientRect()
      return { x: r.x + r.width / 2, y: r.y + r.height / 2, foot: sr ? sr.bottom : innerHeight, top0: sc ? sc.scrollTop : null }
    })
    await L.sleep(200)
    if (n.top0 == null) ok(size, "Inputs day: the notes' list scrolls (needs to, to test)", false, 'the list does not scroll with 30 notes')
    else {
      const release = await carry(w, n.x, n.y, n.x + 20, n.foot - 20)
      const top1 = await w.page.evaluate(() => {
        const h = document.querySelector('[data-testid="win-inputsday"] .ic-secs [data-sechandle]')
        for (let e = h?.parentElement; e && e !== document.body; e = e.parentElement) { const o = getComputedStyle(e).overflowY; if ((o === 'auto' || o === 'scroll') && e.scrollHeight > e.clientHeight + 1) return e.scrollTop }
        return null
      })
      ok(size, "Inputs day: a note held at the list's foot scrolls the list down", top1 != null && top1 > n.top0 + 60, `${n.top0} → ${top1}`)
      await L.pic(w, `E2-notes-${size}`)
      await release()
    }
    await w.page.keyboard.press('Escape'); await L.sleep(300)

    /* 3 — Quals, Edit quals: a heading carried to the table's right edge */
    if (!w.phone) { await w.page.setViewportSize({ width: 820, height: 900 }); await L.sleep(400) }
    await L.go(w, 'quals'); await w.page.waitForSelector('#qtbl td.qname', { timeout: 20000 })
    await w.press('#qEdit'); await L.sleep(200); await w.press('#qEditQuals'); await w.page.waitForSelector('#qtbl thead th[data-col]'); await L.sleep(300)
    const q = await w.page.evaluate(() => {
      const wrap = document.querySelector('#qtbl').parentElement, wr = wrap.getBoundingClientRect()
      // on a phone every movable heading starts past the right edge (the frozen columns fill the screen): bring the
      // first ones into view first, as a finger would, and measure from there
      const first = document.querySelector('#qtbl thead th[data-col]')
      if (first && first.getBoundingClientRect().left > wr.left + wr.width * 0.5) { wrap.scrollLeft = first.getBoundingClientRect().left - wr.left - 120 }
      const th = [...document.querySelectorAll('#qtbl thead th[data-col]')].find(t => { const r = t.getBoundingClientRect(); return r.left > wr.left + 20 && r.right < Math.min(wr.right, innerWidth) - 70 })
      if (!th) return null
      const r = th.getBoundingClientRect()
      return { x: r.x + r.width / 2, y: r.y + r.height / 2, right: Math.min(wr.right, innerWidth), left0: wrap.scrollLeft, more: wrap.scrollWidth > wrap.clientWidth + 1, col: th.dataset.col }
    })
    if (!q || !q.more) ok(size, 'Quals: the table runs sideways (needs to, to test)', false, JSON.stringify(q))
    else {
      const release = await carry(w, q.x, q.y, q.right - 12, q.y)
      const left1 = await w.page.evaluate(() => document.querySelector('#qtbl').parentElement.scrollLeft)
      const lit = await w.page.evaluate(() => document.querySelector('#qtbl th.qdrop')?.dataset.col ?? null)
      ok(size, "Quals: a heading held at the table's right edge scrolls the table sideways", left1 > q.left0 + 60, `${q.left0} → ${left1}`)
      ok(size, 'Quals: the heading under the still pointer is the one marked', !!lit && lit !== q.col, `marked ${lit}`)
      await L.pic(w, `E3-quals-${size}`)
      await release()
    }
    ok(size, 'no console or page errors', w.errors.length === 0, w.errors.length ? w.errors.join(' | ').slice(0, 300) : '0')
  } catch (e) { ok(size, 'the walk ran to its end', false, String(e).slice(0, 300)) } finally { await L.close(w) }
}
const fails = results.filter(r => !r.pass)
console.log(`\n${results.length - fails.length} / ${results.length} PASS`)
process.exit(fails.length ? 1 : 0)
