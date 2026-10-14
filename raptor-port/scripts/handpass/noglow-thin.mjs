/* [GUIDE-NO-GLOW] the thin 1–2px see-through rings the whole-app roll-call reads as lines, not halos — drawn for his look
   (he asked "Pictures", 15 Oct 26). Each reached by its own press, then the same frame with only that thin ring taken off.
     T1 the colour swatch in the Leave War's ⚙ Settings groups list (`.bidsheet .set-swbtn`, a 1px pale white ring)
     T2 a picked preset in the Leave War's event sheet (`.bidsheet .evchip.on`, a 2px pale white ring)
     T3 the picked line of a day's issues list on the week (`.dwlist .witem.on`, a 1px faint cyan ring beside its edge)
     T4 the picked line of the Scheduler Board's checks list (`.sb-warn .wln.on`, the same 1px faint cyan ring)
   usage: DL_BASE=http://localhost:4173 DL_SHOTS=docs/mock/2026-10-15-noglow-places node scripts/handpass/noglow-thin.mjs [phone|desk] */
import * as L from './dl-lib.mjs'
import { board } from './ou-lib.mjs'
const SIZE = process.argv[2] === 'phone' ? 'phone' : 'desk', T = SIZE
const w = await L.world(SIZE), p = w.page
const PLAIN = {
  sw: '.bidsheet .set-swbtn{box-shadow:none !important}',
  ev: '.bidsheet .evchip.on{box-shadow:none !important}',
  wi: '.dwlist .witem.on{box-shadow:none !important}',
  wl: '.sb-warn .wln.on{box-shadow:none !important}',
}
const out = {}
const style = css => p.evaluate(c => { let s = document.getElementById('mk-plain'); if (!s) { s = document.createElement('style'); s.id = 'mk-plain'; document.head.appendChild(s) } s.textContent = c || '' }, css)
const marker = on => p.evaluate(on => {
  document.getElementById('mk-box')?.remove(); if (!on) return
  const r = document.querySelector('[data-mk]').getBoundingClientRect(), b = document.createElement('div'); b.id = 'mk-box'
  Object.assign(b.style, { position: 'fixed', left: (r.left - 8) + 'px', top: (r.top - 8) + 'px', width: (r.width + 16) + 'px', height: (r.height + 16) + 'px', border: '2px dashed #FFB020', borderRadius: '8px', zIndex: 99999, pointerEvents: 'none' })
  document.body.appendChild(b)
}, on)
const tag = sel => p.evaluate(sel => { document.querySelectorAll('[data-mk]').forEach(e => e.removeAttribute('data-mk')); const e = [...document.querySelectorAll(sel)].find(x => x.getBoundingClientRect().width > 0); if (!e) return false; e.setAttribute('data-mk', 'a'); e.scrollIntoView({ block: 'center' }); return true }, sel)
async function shots(name, css, pad) {
  await p.evaluate(() => { const t = document.getElementById('toastEl'); if (t) t.style.visibility = 'hidden' })
  await style(''); await L.sleep(150); await L.pic(w, `${name}-today-${T}`, { around: '[data-mk="a"]', pad })
  await style(css); await L.sleep(150); await L.pic(w, `${name}-noglow-${T}`, { around: '[data-mk="a"]', pad })
  await style(''); await marker(true); await L.pic(w, `${name}-where-${T}`); await marker(false)
}
async function place(k, fn) { try { out[k] = await fn() || 'drawn' } catch (e) { out[k] = 'NOT DRAWN — ' + String(e.message || e).slice(0, 200) } }
try {
  /* T3 — Edit Schedule's week: open a day's issues, press its first line */
  await place('T3', async () => {
    await L.go(w, 'editsched')
    const bar = p.locator('#eWeek .daywarn').first()
    if (await bar.count()) { await bar.scrollIntoViewIfNeeded(); await w.press(bar); await L.sleep(500) }
    const it = p.locator('#eWeek .dwlist .witem[data-wdi]').first()
    if (!await it.count()) throw new Error('no issues list opened')
    await w.press(it); await L.sleep(400)
    if (!await tag('.dwlist .witem.on')) throw new Error('no line picked')
    await shots('T3-issue-line', PLAIN.wi, 18)
  })
  /* T4 — the Scheduler Board's checks list */
  await place('T4', async () => {
    await board(w, 0); await L.sleep(400)
    /* the checks list may be folded (a phone): open it by its own header, then press a line's words */
    if (!await p.locator('#sbWarn .wln[data-wdi]').first().isVisible().catch(() => false)) {
      const hd = p.locator('#sbWarn .daywarn, #sbWarn [data-daywarn]').first()
      if (await hd.count()) { await w.press(hd); await L.sleep(400) }
    }
    const ln = p.locator('#sbWarn .wln[data-wdi] .wln-t').first()
    if (!await ln.count()) throw new Error('no checks line')
    await ln.scrollIntoViewIfNeeded(); await w.press(ln); await L.sleep(400)
    if (!await tag('.sb-warn .wln.on')) throw new Error('no line picked')
    await shots('T4-board-check-line', PLAIN.wl, 18)
    await p.keyboard.press('Escape'); await L.sleep(200)
  })
  /* T1 — the Leave War's ⚙ Settings, a group's colour swatch */
  await place('T1', async () => {
    await p.evaluate(() => window.go('leavewar')); await p.waitForSelector('#page-leavewar [data-testid^="row-"]', { timeout: 20000 }); await L.sleep(600)
    await w.press('[data-testid="settings-open"]'); await L.sleep(500)
    /* a swatch shows only for a qualification group: add one (this world is a throwaway — ?fresh=1), close its palette */
    const add = p.locator('[data-testid^="gadd-q"]').first()
    if (!await add.count()) throw new Error('no qualification group to add')
    await add.scrollIntoViewIfNeeded(); await w.press(add); await L.sleep(400)
    const on = p.locator('.bidsheet .set-swbtn.on').first()
    if (await on.count()) { await w.press(on); await L.sleep(300) }
    if (!await tag('.bidsheet .set-swbtn:not(.on)')) throw new Error('no colour swatch in the settings sheet')
    await shots('T1-colour-swatch', PLAIN.sw, 26)
    await p.keyboard.press('Escape'); await L.sleep(300)
  })
  /* T2 — the event sheet: press an Event row's cell, then a preset */
  await place('T2', async () => {
    const opened = await p.evaluate(() => {
      const row = [...document.querySelectorAll('#page-leavewar tr')].find(r => /^\s*EVENT 1/i.test(r.textContent || ''))
      const cells = row ? [...row.querySelectorAll('td')].filter(c => c.getBoundingClientRect().width > 0) : []
      const c = cells[4] || cells[cells.length - 1]; if (!c) return false
      c.scrollIntoView({ block: 'center', inline: 'center' }); c.setAttribute('data-mk', 'cell'); return true
    })
    if (!opened) throw new Error('no Event row')
    /* the cell sits under the frozen columns' edge for a pointer; its own click handler is the press */
    await p.evaluate(() => document.querySelector('[data-mk="cell"]').click()); await L.sleep(600)
    const chip = p.locator('.bidsheet .evchip').first()
    if (!await chip.count()) throw new Error('the event sheet did not open')
    await w.press(chip); await L.sleep(300)
    if (!await tag('.bidsheet .evchip.on')) throw new Error('no preset picked')
    await shots('T2-event-preset', PLAIN.ev, 20)
    await p.keyboard.press('Escape'); await L.sleep(300)
  })
  console.log(JSON.stringify(out, null, 1))
} finally { await L.close(w) }
