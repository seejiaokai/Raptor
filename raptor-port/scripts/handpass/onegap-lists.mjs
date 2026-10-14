/* [DRAG-ONE-LINE-ELSEWHERE] (owner D891, 15 Oct 26 — "Yes fix them too", after D890 on the Leave War grid): the three
   other drag lists draw ONE landing bar a gap. By a REAL drag — a mouse on the desktop, touch events on a phone — in
   each list: the Leave War's ⚙ Settings Groups list, its "Who wins" list, and a day opened on the Inputs calendar (three
   notes made there with its own "+ Note"). Each step holds the drag over the FIRST row's lower half and asserts the
   right result (a PASS means correct): the bar is on the SECOND row's top edge, never the first row's foot; then the
   drag is let go with no drop (a touch-cancel; on a desktop, back over the row it began on) and the order is unchanged.
   DL_BEFORE=1 pictures the build before the fix: the same hold with the bar put back on the hovered row's foot.
   usage: DL_BASE=http://localhost:4173 DL_SHOTS=docs/img/handpass/2026-10-15-lw-landing-line/lists node scripts/handpass/onegap-lists.mjs */
import { mkdirSync } from 'node:fs'
import * as L from './dl-lib.mjs'

mkdirSync(L.SHOTS, { recursive: true })
const results = []
const ok = (size, step, pass, saw) => { results.push({ size, step, pass, saw }); console.log(`${pass ? 'PASS' : 'FAIL'} [${size}] ${step} — ${saw}`) }

/** Hold a drag from `grip` to the lower part of `rowSel`'s first match; return a release that drops nothing. */
async function hold(w, gripSel, rowSel) {
  const p = w.page
  const pts = await p.evaluate(([g, r]) => {
    const grip = document.querySelector(g), row = document.querySelector(r)
    if (!grip || !row) return null
    row.scrollIntoView({ block: 'center' })
    const a = grip.getBoundingClientRect(), b = row.getBoundingClientRect()
    return { gx: a.x + a.width / 2, gy: a.y + a.height / 2, bx: b.x + Math.min(b.width / 2, 80), by: b.y + b.height * 0.78 }
  }, [gripSel, rowSel])
  if (!pts) return null
  if (!w.phone) {
    await p.mouse.move(pts.gx, pts.gy); await p.mouse.down(); await L.sleep(120)
    for (let i = 1; i <= 12; i++) { await p.mouse.move(pts.gx + (pts.bx - pts.gx) * i / 12, pts.gy + (pts.by - pts.gy) * i / 12); await L.sleep(40) }
    await L.sleep(400)
    return async () => { await p.mouse.move(pts.gx, pts.gy); await L.sleep(150); await p.mouse.up(); await L.sleep(500) }
  }
  const cdp = await w.ctx.newCDPSession(p)
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: pts.gx, y: pts.gy, id: 1 }] }); await L.sleep(150)
  for (let i = 1; i <= 12; i++) { await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: pts.gx + (pts.bx - pts.gx) * i / 12, y: pts.gy + (pts.by - pts.gy) * i / 12, id: 1 }] }); await L.sleep(40) }
  await L.sleep(400)
  return async () => { await cdp.send('Input.dispatchTouchEvent', { type: 'touchCancel', touchPoints: [] }); await L.sleep(400) }
}

/** One list: rows `rowsSel` (an attribute names each), drag the THIRD row's grip over the FIRST row's lower half. */
async function list(w, name, { rowsSel, attr, gripOf, around, pic }) {
  const ids = await w.page.evaluate(([s, a]) => [...document.querySelectorAll(s)].map(e => e.getAttribute(a)), [rowsSel, attr])
  if (ids.length < 3) { ok(w.key, `${name}: three rows to drag between`, false, `${ids.length} rows`); return }
  const [first, second, third] = ids
  const sel = id => `${rowsSel.split(' ').slice(0, -1).join(' ')} [${attr}="${id}"]`.trim()
  const release = await hold(w, gripOf(third), sel(first))
  if (!release) { ok(w.key, `${name}: the drag started`, false, 'no grip or row'); return }
  const st = await w.page.evaluate(([s, a]) => {
    const marked = [...document.querySelectorAll(s)].filter(e => e.classList.contains('dragover'))
    return marked.map(e => ({ id: e.getAttribute(a), after: e.classList.contains('after') }))
  }, [rowsSel, attr])
  ok(w.key, `${name}: one bar, on the second row's TOP edge — not the first row's foot`,
    st.length === 1 && st[0].id === second && !st[0].after, `hovered ${first}'s lower half; marked ${JSON.stringify(st)}`)
  if (process.env.DL_BEFORE) {
    await w.page.evaluate(([s, a, f]) => {
      document.querySelectorAll(s).forEach(e => e.classList.remove('dragover', 'after'))
      document.querySelector(`${s.split(' ').slice(0, -1).join(' ')} [${a}="${f}"]`.trim())?.classList.add('dragover', 'after')
    }, [rowsSel, attr, first])
  }
  await L.pic(w, (process.env.DL_BEFORE ? 'B-' : '') + `${pic}-${w.key}`, { around })
  await release()
  const after = await w.page.evaluate(([s, a]) => [...document.querySelectorAll(s)].map(e => e.getAttribute(a)), [rowsSel, attr])
  ok(w.key, `${name}: let go with no drop — the order is unchanged`, JSON.stringify(after) === JSON.stringify(ids), after.join(','))
}

for (const size of ['desk', 'phone']) {
  const w = await L.world(size)
  try {
    /* 1, 2 — the Leave War's ⚙ Settings: the Groups list, then the Who wins list */
    await L.go(w, 'leavewar'); await w.page.waitForSelector('#page-leavewar [data-testid^="row-"]', { timeout: 20000 }); await L.sleep(800)
    await w.press('[data-testid="settings-open"]'); await L.sleep(600)
    await list(w, 'the Groups list', { rowsSel: '[data-testid="group-chosen"] [data-grow]', attr: 'data-grow', gripOf: id => `[data-testid="gsdrag-${id}"]`, around: '[data-testid="group-chosen"]', pic: 'G1-groups' })
    await w.press('[data-testid="who-wins-toggle"]'); await L.sleep(500)
    await list(w, 'the Who wins list', { rowsSel: '[data-testid="group-priority"] [data-gprio]', attr: 'data-gprio', gripOf: id => `[data-testid="gpdrag-${id}"]`, around: '[data-testid="group-priority"]', pic: 'G2-whowins' })
    await w.page.keyboard.press('Escape'); await L.sleep(300)
    /* 3 — a day opened on the Inputs calendar: three notes made with its own "+ Note", then dragged */
    await L.go(w, 'inputs'); await w.page.waitForSelector('#inpCal [data-icday]', { timeout: 20000 }); await L.sleep(500)
    const day = await w.page.evaluate(() => [...document.querySelectorAll('#inpCal [data-icday]')].map(e => e.getAttribute('data-icday'))[12])
    const cell = w.page.locator(`#inpCal [data-icday="${day}"]`)
    if (w.phone) await cell.tap({ position: { x: 10, y: 10 } }); else await cell.click({ position: { x: 10, y: 10 } })
    await w.page.locator('[data-testid="win-inputsday"]').waitFor(); await L.sleep(400)
    for (const words of ['One-gap note C', 'One-gap note B', 'One-gap note A']) {
      await w.press('#icAddPuck'); await L.sleep(200)
      await w.page.locator('.ic-newnote .ic-poppuck-edit').fill(words)
      await w.page.locator('.ic-newnote .ic-poppuck-edit').press('Enter'); await L.sleep(300)
    }
    await list(w, "an Inputs calendar day's notes", { rowsSel: '[data-testid="win-inputsday"] .ic-secs [data-sec]', attr: 'data-sec', gripOf: id => `[data-sechandle="${id}"]`, around: '[data-testid="win-inputsday"] .ic-secs', pic: 'G3-notes' })
    ok(size, 'no console or page errors', w.errors.length === 0, w.errors.length ? w.errors.join(' | ').slice(0, 300) : '0')
  } catch (e) { ok(size, 'the walk ran to its end', false, String(e).slice(0, 300)) } finally { await L.close(w) }
}
const fails = results.filter(r => !r.pass)
console.log(`\n${results.length - fails.length} / ${results.length} PASS`)
process.exit(fails.length ? 1 : 0)
