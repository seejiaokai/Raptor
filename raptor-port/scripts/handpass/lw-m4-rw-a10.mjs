// Re-walk A10 — lesson 9 (a name's side in EVERY kind of puck, by box), lesson 4 (a press behind "Pick dates…"), lesson 5 (the ringed cell at rest against frozen parts, the bar).
process.env.LW_OUT ||= '../../docs/img/handpass/2026-10-27-lw-m4/rewalk/a'
const A = await import('./lw-m4-walk-a-lib.mjs')
const { L, lineLoc, approveBtn, pressLoc, lineInfo, placeBid } = A
const { T, rec, shot, txt, press, vis } = L
console.log('[lw-m4-rw-a10 v1]')
const w = await L.newCtx('desk'); const P = w.page
const wait = ms => P.waitForTimeout(ms)
const MONS = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC']
const reach = async (who, iso) => { if (!(await P.locator(T(L.cellId(who, iso))).count())) { await P.getByRole('button', { name: MONS[Number(iso.slice(5, 7)) - 1], exact: true }).first().click(); await wait(700) } for (let i = 0; i < 16 && !(await P.locator(T(L.cellId(who, iso))).count()); i++) await wait(250) }
const centreCell = async (who, iso) => { await reach(who, iso); await P.evaluate(id => document.querySelector(`[data-testid="${id}"]`)?.scrollIntoView({ block: 'center', inline: 'center' }), L.cellId(who, iso)); await wait(350) }
const bid = async (who, iso) => { await centreCell(who, iso); await L.openCell(w, who, iso); await L.approveWhatIEnter(w, false); const ok = await L.placeLeave(w, 'LL'); if (!ok) await L.closeWin(w); return ok }
const toTop = async () => { await P.keyboard.press('Escape'); await P.evaluate(() => { window.scrollTo(0, 0) }); await wait(400) }
try {
  await L.signIn(w, 'admin')
  // pending bids for men of every CAT / seat the demo roster has (Approve what I enter OFF)
  const idOf = await P.evaluate(() => Object.fromEntries([...document.querySelectorAll('[data-testid^="row-"]')].map(r => [(r.querySelector('.cs')?.innerText || r.innerText).trim().split(/\s+/)[0], r.dataset.testid.slice(4)])))
  console.log('ids:', JSON.stringify(idOf))
  const men = [['Saint', '2026-01-20'], ['Diesel', '2026-01-21'], ['Nomad', '2026-01-22'], ['Ace', '2026-01-26'], ['Reaper', '2026-01-27'], ['Cinder', '2026-01-28'], ['Dash', '2026-01-29'], ['Scope', '2026-01-30'], ['Cutter', '2026-02-04'], ['Trident', '2026-02-05']].map(([n, d]) => [idOf[n], d]).filter(m => m[0])
  const landed = []
  for (const [who, iso] of men) landed.push(who + ':' + (await bid(who, iso)))
  console.log('placed', landed.join(' '))
  // one SANS man: Blade posted out as SANS from 15 Jan
  await centreCell('slash', '2026-01-15'); await L.openCell(w, 'slash', '2026-01-15')
  await press(w, T('bid-more')); await wait(400); await press(w, T('bid-postout')); await wait(700); await press(w, T('po-sans')); await wait(300); await press(w, T('po-confirm')); await wait(900)
  for (let i = 0; i < 3 && (await vis(P, T('bid-picker')) || await vis(P, T('po-confirm')) || await vis(P, T('sheet-scrim'))); i++) { await P.keyboard.press('Escape'); await wait(500) }
  await toTop(); await L.openApprovals(w)
  await shot(w, 'a10-1-approvals-all-pucks')
  const pucks = await P.evaluate(() => [...document.querySelectorAll('[data-testid^="appr-line-"]')].filter(l => l.getBoundingClientRect().height > 0).map(l => {
    const pk = l.querySelector('.puck'); const nm = pk.querySelector('.nm'); const role = pk.querySelector('.role')
    const pb = pk.getBoundingClientRect(); const rg = document.createRange(); rg.selectNodeContents(nm); const tb = rg.getBoundingClientRect(); const rb = role && role.getBoundingClientRect()
    return { who: l.dataset.testid.slice(10), name: nm.innerText, chip: role && role.innerText, cls: pk.className.replace(/\bsm\b/, '').trim(), title: pk.title, offset: Math.round((tb.left - pb.left) * 10) / 10, before: rb ? tb.right <= rb.left + 1 : null, atLeft: tb.left - pb.left <= 12 }
  }))
  for (const p of pucks) console.log('puck', JSON.stringify(p))
  const kinds = [...new Set(pucks.map(p => p.chip + '/' + p.cls))]
  const bad = pucks.filter(p => !(p.before && p.atLeft))
  rec('A10.1 a name at the LEFT of its puck in every kind present (by box)', 'desk', pucks.length >= 8 && bad.length === 0 ? 'PASS' : 'FAIL', `${pucks.length} pucks; kinds ${JSON.stringify(kinds)}; bad ${JSON.stringify(bad)}`, ['a10-1-approvals-all-pucks'])
  await P.evaluate(() => window.scrollTo(0, 0))
  // lesson 4: Pick dates… open, press a line's Approve behind it
  await press(w, T('appr-pick')); await wait(500)
  const first = (await P.locator('.appr-line .appr-dlink').first().innerText()).replace(' ›', '')
  await shot(w, 'a10-2-pick-open')
  const ap = lineLoc(P, first).locator('[data-testid="appr-approve"]')
  const bb = await ap.boundingBox()
  const covered = await P.evaluate(({ x, y }) => { const e = document.elementFromPoint(x, y); return e ? e.tagName + '.' + String(e.className).slice(0, 30) + '#' + (e.dataset.testid || '') : null }, { x: bb.x + bb.width / 2, y: bb.y + bb.height / 2 })
  console.log('with the picker open, at the first line\'s Approve:', covered, '| picker visible', await vis(P, T('appr-range-picker')))
  await P.mouse.click(bb.x + bb.width / 2, bb.y + bb.height / 2); await wait(600)
  const after = await lineInfo(P, first); const pickerNow = await vis(P, T('appr-range-picker'))
  await shot(w, 'a10-3-after-press-behind')
  console.log('after the press: line', after.cls, '| picker still open', pickerNow)
  rec('A10.2 a press on a line\'s Approve with "Pick dates…" open: what happens', 'desk', /lit-approved/.test(after.cls) ? 'PASS' : 'FAIL', `picker open before the press, line "${first}" ${after.cls}; picker open after: ${pickerNow}; at the button's point the element was ${covered}`, ['a10-2-pick-open', 'a10-3-after-press-behind'])
  // lesson 5: dates -> grid, ringed cell at rest against the frozen parts and the bar (a far month: Feb 4 Cutter's bid)
  await L.openGrid(w); await L.openApprovals(w)
  await pressLoc(w, lineLoc(P, 'Wed 4 Feb').locator('[data-testid="appr-dates"]')); await wait(7500)
  const geo = await P.evaluate(() => {
    const td = document.querySelector('td.lw-ring'); if (!td) return { ring: false, lingering: false }
    const r = td.getBoundingClientRect()
    const nm = document.querySelector('.mx-outer td.cs, .mx td.cs, td.cs'); const frozenRight = [...document.querySelectorAll('td.cs, th.cs, td.lve, th')].filter(e => e.getBoundingClientRect().left < 20 && e.getBoundingClientRect().width > 50).reduce((m, e) => Math.max(m, e.getBoundingClientRect().right), 0)
    const hdr = document.querySelector('[data-testid^="head-"]'); const hb = hdr && hdr.getBoundingClientRect()
    const slim = document.querySelector('[data-testid="appr-slim"]'); const sb = slim && slim.getBoundingClientRect()
    return { ring: true, cell: [Math.round(r.left), Math.round(r.top), Math.round(r.right), Math.round(r.bottom)], frozenRight: Math.round(frozenRight), headerBottom: hb && Math.round(hb.bottom), slimTop: sb && Math.round(sb.top), slimL: sb && Math.round(sb.left), slimR: sb && Math.round(sb.right) }
  })
  console.log('ring after 7.5 s:', JSON.stringify(geo))
  await shot(w, 'a10-4-ring-after-6s')
  await shot(w, 'a10-4b-slim-and-cell')
  const hasRing = await P.evaluate(() => !!document.querySelector('td.lw-ring'))
  rec('A10.3 (lesson 5) the dates tap brings a far cell (Wed 4 Feb) into sight, clear of the frozen columns, the date row and the bar', 'desk', geo.ring === undefined || geo.ring === false ? 'NOT WALKED' : (geo.cell[0] >= geo.frozenRight - 1 && geo.cell[3] <= geo.slimTop ? 'PASS' : 'FAIL'), `ring still there after 7.5 s: ${hasRing}; ${JSON.stringify(geo)}`, ['a10-4-ring-after-6s'])
} catch (e) { rec('ERROR', 'desk', 'FAIL', String(e).slice(0, 400)); await shot(w, 'a10-error').catch(() => {}) }
if (w.errs.length) rec('console', 'desk', 'FAIL', w.errs.join(' || ').slice(0, 400))
await w.ctx.close(); L.writeResults('a10'); await L.closeBrowser(); console.log('DONE')
