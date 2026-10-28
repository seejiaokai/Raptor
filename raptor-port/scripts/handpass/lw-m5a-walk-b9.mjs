// Walker B, script 9: every heading against its figures on every line (lesson 9) at 402 and 375, both views, admin and member;
// and the person window for each kind of man (lesson 9: pilot, WSO, ground, OCU "O").
process.env.LW_OUT ||= '../../docs/img/handpass/2026-10-28-lw-m5a/b'
const B = await import('./lw-m5a-walk-b-lib.mjs')
const { L, T, rec, shot, press, openBalances, pwRead, closePw, vis } = B
console.log('[lw-m5a-walk-b9 v1]')
const w = await L.newCtx('phone'); const P = w.page
const S = async (name, fn) => { try { await fn() } catch (e) { rec(name, '402', 'NOT WALKED', 'STOPPED: ' + String(e).slice(0, 250), []); await shot(w, 'err-' + name.replace(/\W+/g, '-')).catch(() => {}) } }
/* the ink of an element: the box of its text (a Range), or the box of an input */
const align = () => P.evaluate(() => {
  const ink = e => { if (!e) return null; if (e.tagName === 'INPUT') { const r = e.getBoundingClientRect(); return { l: r.left, r: r.right, c: r.left + r.width / 2 } } const rg = document.createRange(); rg.selectNodeContents(e); const r = rg.getBoundingClientRect(); return r.width ? { l: r.left, r: r.right, c: r.left + r.width / 2 } : null }
  const heads = [...document.querySelectorAll('.bp-cols > span')].filter(e => e.getBoundingClientRect().width > 0 && e.textContent.trim())
  const s = document.querySelector('[data-testid="bal-scroll"]'); const sl = s.scrollLeft
  const rows = [...document.querySelectorAll('[data-testid^="bal-row-"]')]
  const kind = r => { const p = r.querySelector('.bp-puck .puck, .puck'); const cls = p ? p.className : ''; const chip = r.querySelector('.bp-puck .chip, .puck .chip, .puck [class*="cat"]')?.textContent.trim() || ''; return chip + '|' + cls.replace(/\s+/g, ' ').slice(0, 40) }
  const cols = [['APP BAL', 'bal-LVE-'], ['CARRIED', 'bal-cf-'], ['PENDING', 'bal-pend-'], ['WAR BAL', 'bal-war-'], ['OIL', 'bal-oil-'], ['CCL', 'bal-CCL-'], ['FCL', 'bal-FCL-'], ['PL', 'bal-PL-'], ['EL', 'bal-EL-'], ['CL', 'bal-CL-'], ['LL', 'bal-taken-LL-'], ['OL', 'bal-taken-OL-'], ['OIL', 'bal-taken-OIL-'], ['MED', 'bal-taken-MED-'], ['CSE', 'bal-taken-CSE-'], ['OD', 'bal-taken-OD-']]
  const out = []
  for (const h of heads) {
    const label = h.textContent.trim(); const hi = ink(h)
    for (const [name, pre] of cols) {
      if (name !== label) continue
      const ds = []
      for (const r of rows) { const pid = r.dataset.testid.slice(8); const e = r.querySelector(`[data-testid="${pre}${pid}"]`); const i = ink(e); if (i) ds.push({ pid, dc: Math.round((i.c - hi.c) * 10) / 10, dl: Math.round((i.l - hi.l) * 10) / 10, dr: Math.round((i.r - hi.r) * 10) / 10, kind: kind(r) }) }
      if (!ds.length) continue
      const cs = ds.map(d => d.dc)
      out.push({ col: label + '/' + pre, n: ds.length, head: { l: Math.round(hi.l), r: Math.round(hi.r), c: Math.round(hi.c) }, minC: Math.min(...cs), maxC: Math.max(...cs), spreadC: Math.round((Math.max(...cs) - Math.min(...cs)) * 10) / 10, minR: Math.min(...ds.map(d => d.dr)), maxR: Math.max(...ds.map(d => d.dr)), minL: Math.min(...ds.map(d => d.dl)), maxL: Math.max(...ds.map(d => d.dl)) })
    }
  }
  return { sl, out }
})
async function measure(tag, vw, who) {
  await P.setViewportSize({ width: vw, height: 874 }); await P.waitForTimeout(500)
  for (const view of ['bal', 'taken']) {
    await press(w, T(`bal-view-${view}`)); await P.waitForTimeout(600)
    /* slide through the page so every column is drawn at its place: three scroll positions */
    for (const left of [0, 225, 450]) {
      await P.evaluate(l => document.querySelector('[data-testid="bal-scroll"]').scrollTo(l, 0), left); await P.waitForTimeout(350)
      const a = await align()
      const lines = a.out.filter(o => o.head.l >= 120 && o.head.r <= vw + 2 && o.head.l > -2)   // only the columns whose heading is in the view
      console.log(`${tag} ${vw} ${view} scrollLeft ${a.sl}:`, lines.map(o => `${o.col} n${o.n} centre ${o.minC}..${o.maxC} (spread ${o.spreadC}) right ${o.minR}..${o.maxR} left ${o.minL}..${o.maxL}`).join(' | '))
      if (left === 0) await shot(w, `a-${tag}-${vw}-${view}`)
    }
  }
}
await L.signIn(w, 'admin'); await openBalances(w)
if (!process.env.ONLY) await S('align402', async () => { await measure('admin', 402, 'admin') })
if (!process.env.ONLY) await S('align375', async () => { await measure('admin', 375, 'admin') })
await P.setViewportSize({ width: 402, height: 874 }); await P.waitForTimeout(400)
await S('windows-kinds', async () => {
  await press(w, T('bal-view-bal')); await P.evaluate(() => document.querySelector('[data-testid="bal-scroll"]').scrollTo(0, 0)); await P.waitForTimeout(300)
  const kinds = await P.evaluate(() => [...document.querySelectorAll('[data-testid^="bal-row-"]')].map(r => ({ pid: r.dataset.testid.slice(8), name: r.querySelector('.bp-name')?.textContent.trim(), grp: r.previousElementSibling?.className || '' })))
  console.log('rows', kinds.length)
  const pick = [['pilot', 'bane'], ['WSO', null], ['OCU', 'prism'], ['ground', null]]
  const names = await P.evaluate(() => Object.fromEntries([...document.querySelectorAll('[data-testid^="bal-row-"]')].map(r => [r.querySelector('.bp-name')?.textContent.trim().replace(/\s*\w{1,3}$/, ''), r.dataset.testid.slice(8)])))
  console.log('names', JSON.stringify(Object.entries(names).slice(0, 14)))
  const find = n => Object.entries(names).find(([k]) => k.startsWith(n))?.[1]
  const list = [['pilot Ranger', 'bane'], ['WSO Basher', find('Bash')], ['OCU Recon', 'prism'], ['ground Cotter', find('Cot')], ['ops-A ground Widget', find('Wid')]]
  const tilesX = []
  for (const [label, pid] of list) {
    if (!pid) { rec(`25 window of ${label}`, '402', 'NOT WALKED', 'no row found for him', []); continue }
    await P.evaluate(p => document.querySelector(`[data-testid="bal-name-${p}"]`).scrollIntoView({ block: 'center' }), pid); await P.waitForTimeout(300)
    await press(w, T(`bal-name-${pid}`), `k-${pid}-q`); await P.waitForTimeout(700)
    await shot(w, `k-${pid}`)
    const m = await P.evaluate(() => {
      const pw = document.querySelector('[data-testid="person-window"]'); const q = id => pw.querySelector(`[data-testid="${id}"]`)
      const r = e => { if (!e) return null; const b = e.getBoundingClientRect(); return { l: Math.round(b.left), t: Math.round(b.top), r: Math.round(b.right), w: Math.round(b.width) } }
      const head = pw.querySelector('[data-testid="pw-name"]'); const hb = head.getBoundingClientRect()
      const puck = pw.querySelector('.puck'); const pr = puck ? puck.getBoundingClientRect() : null
      return { name: head.textContent.trim(), puckInHeading: !!puck, puck: pr && { l: Math.round(pr.left), w: Math.round(pr.width), cls: puck.className.slice(0, 50) }, tiles: ['LVE', 'OIL', 'MED', 'CCL', 'FCL', 'PL', 'EL', 'CL'].map(k => k + ' ' + (r(q(`pw-tile-${k}`)) ? r(q(`pw-tile-${k}`)).l + ',' + r(q(`pw-tile-${k}`)).t : 'none')).join(' | '), win: r(pw) }
    })
    rec(`25 window of ${label}`, '402', m.name ? 'PASS' : 'FAIL', JSON.stringify(m), [`k-${pid}-q`, `k-${pid}`])
    await closePw(w)
  }
})
rec('errors', '402', w.errs.length ? 'FAIL' : 'PASS', B.errsOf(w), [])
L.writeResults('b9')
await w.ctx.close(); await L.closeBrowser()
