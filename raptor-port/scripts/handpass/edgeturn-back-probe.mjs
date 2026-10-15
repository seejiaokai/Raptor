/* His find, 15 Oct 26 (morning, on the preview): on the Inputs month, a run held from 30 Dec carried to the right side turns
   to January; carried back from 1 Jan to the LEFT side, it does not turn back to December. A probe of that one gesture, as
   assertions, mouse and finger: one drag — forward turn, then back. usage: DL_BASE=http://localhost:4173 node scripts/handpass/edgeturn-back-probe.mjs */
import * as L from './dl-lib.mjs'

for (const size of ['desk', 'phone']) {
  const w = await L.world(size)
  const p = w.page
  try {
    await L.go(w, 'inputs'); await p.waitForSelector('#inpCal [data-icday]', { timeout: 20000 }); await L.sleep(400)
    for (let i = 0; i < 3; i++) { await w.press('#icNext'); await L.sleep(350) }          // October → January? stop on December
    for (let i = 0; i < 6 && !(await p.evaluate(() => /December 2026/.test(document.querySelector('#inpCal .ic-mon')?.getAttribute('aria-label') || ''))); i++) { await w.press('#icPrev'); await L.sleep(300) }
    const mon = () => p.evaluate(() => document.querySelector('#inpCal .ic-mon')?.getAttribute('aria-label'))
    const at = iso => p.evaluate(d => { const c = document.querySelector(`#inpCal [data-icday="${d}"]`); if (!c) return null; const r = c.getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.bottom - 5 } }, iso)
    const g = await p.evaluate(() => { const r = document.querySelector('#inpCal [data-testid="ib-grid"]').getBoundingClientRect(); return { l: r.left, r: r.right } })
    let down, to, up, cdp
    if (!w.phone) {
      let cur = { x: 0, y: 0 }
      down = async (x, y) => { await p.mouse.move(x, y); await p.mouse.down(); cur = { x, y } }
      to = async (x, y) => { for (let i = 1; i <= 12; i++) { await p.mouse.move(cur.x + (x - cur.x) * i / 12, cur.y + (y - cur.y) * i / 12); await L.sleep(25) } cur = { x, y } }
      up = async () => p.mouse.up()
    } else {
      cdp = await w.ctx.newCDPSession(p); let cur = { x: 0, y: 0 }
      const t = (type, x, y) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: type === 'touchEnd' ? [] : [{ x, y, id: 1 }] })
      down = async (x, y) => { await t('touchStart', x, y); cur = { x, y }; await L.sleep(520) }
      to = async (x, y) => { for (let i = 1; i <= 12; i++) { await t('touchMove', cur.x + (x - cur.x) * i / 12, cur.y + (y - cur.y) * i / 12); await L.sleep(25) } cur = { x, y } }
      up = async () => t('touchEnd')
    }
    const a = await at('2026-12-30')
    await down(a.x, a.y); await to(g.r - 4, a.y); await L.sleep(1000)
    const m1 = await mon()
    const j1 = await at('2027-01-01')
    await to(j1.x, j1.y); await L.sleep(300)
    await to(g.l + 3, j1.y); await L.sleep(1000)
    const m2 = await mon()
    const lit = await p.evaluate(() => [...document.querySelectorAll('#inpCal .ib-day.is-picked')].map(e => e.getAttribute('data-icday')))
    await L.pic(w, `back-probe-${size}`)
    const d = await at('2026-12-29'); if (d) { await to(d.x, d.y); await L.sleep(300) }
    await up(); await L.sleep(600)
    const ttl = await p.evaluate(() => document.querySelector('[data-testid="win-inputedit"] .win-ttl')?.textContent || '')
    console.log(`[${size}] forward: ${m1} · back at the left side: ${m2} · lit then: ${lit.join(',') || 'none'} · window: ${ttl || 'none'}`)
  } catch (e) { console.log(`[${size}] ERROR ${String(e).slice(0, 200)}`) } finally { await L.close(w) }
}
