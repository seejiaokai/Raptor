// walker C, script 5 — desktop: the day panel's and the OIL tab's names, the tiles' alignment across kinds of men, a posted-out man, the window over a bid window and the manning bubble.
process.env.LW_OUT ||= '../../docs/img/handpass/2026-10-28-lw-m5a/c/c5'
const { L, T, pwRead, onScreen, closePw, openBalances, note, topAt, ids, rec, shot, press, vis, txt } = await import('./lw-m5a-walk-c-lib.mjs')
console.log('[lw-m5a-walk-c5-desk v1]')
L.clearOut()
const w = await L.newCtx('desk')
const P = w.page
const blk = async (name, fn) => { try { await fn() } catch (e) { rec(name + ' (script)', 'desk', 'NOT WALKED', 'the step threw: ' + String(e).slice(0, 300), [name]); await shot(w, name + '-err').catch(() => {}) } }
const nameBtn = pid => `[data-testid="row-${pid}"] .whoedit`
await L.signIn(w, 'admin')

/* ---- the day panel (tap a date heading): who is away; names tappable? ---- */
await blk('51', async () => {
  const hd = await P.evaluate(() => [...document.querySelectorAll('[data-testid^="dayhead-"], [data-testid^="date-"], th[data-iso], [data-testid^="hd-"]')].slice(0, 5).map(e => e.dataset.testid || e.dataset.iso))
  console.log('date heading candidates', hd)
  const cand = await P.evaluate(() => [...document.querySelectorAll('[data-testid]')].map(e => e.dataset.testid).filter(t => /day|head|dh-/i.test(t)).slice(0, 12))
  console.log('day-ish ids', cand)
  const sel = cand.find(t => /dayhead|day-head|dhead|dh-/.test(t))
  if (!sel) { rec('D1 the day panel\'s "who is away" names', 'desk', 'NOT WALKED', 'no date-heading test id found: ' + cand.join(','), []); return }
  await press(w, T(sel)); await P.waitForTimeout(800)
  await shot(w, '51a-daypanel')
  const names = await P.evaluate(() => [...document.querySelectorAll('[data-testid="day-panel"] button, .daypanel button, [data-testid^="dp-"]')].slice(0, 20).map(e => e.dataset.testid + ':' + e.innerText.slice(0, 20)))
  rec('D1 the day panel opens (names listed)', 'desk', 'PASS', `heading ${sel}; buttons: ${names.join(' | ')}`, ['51a-daypanel'])
})

/* ---- the OIL tab: a name tapped ---- */
await blk('52', async () => {
  await press(w, T('oil-tracker')); await P.waitForTimeout(1000)
  const before = await pwRead(P)
  const nm = P.locator('.oil-tracker, [data-testid^="oil-"]').first()
  const clickable = await P.evaluate(() => { const b = [...document.querySelectorAll('button')].filter(e => e.getBoundingClientRect().width > 0 && /Ranger|Reaper|Anvil/.test(e.innerText)); return b.slice(0, 3).map(e => e.dataset.testid || e.className.toString().slice(0, 30) + ':' + e.innerText.slice(0, 15)) })
  const rowsel = await P.evaluate(() => [...document.querySelectorAll('[data-testid]')].map(e => e.dataset.testid).filter(t => /^oil-(name|row)/.test(t)).slice(0, 5))
  console.log('oil name buttons', clickable, rowsel)
  const target = rowsel.find(t => /name/.test(t)) ? T(rowsel.find(t => /name/.test(t))) : null
  if (target) { await press(w, target); await P.waitForTimeout(800) }
  else { const nameEl = P.locator('text=Ranger').first(); await nameEl.click(); await P.waitForTimeout(800) }
  const pw = await pwRead(P)
  await shot(w, '52a-oil-name')
  rec('D2 a name on the OIL tab (reading: opens the person window, or does not)', 'desk', 'PASS', `window after a tap on a name: ${pw ? `"${pw.name}" top ${pw.box.top}` : 'none opened'}; OIL words read-only name buttons: ${JSON.stringify(clickable)}`, ['52a-oil-name'])
  await P.keyboard.press('Escape'); await P.waitForTimeout(500)
})

/* ---- tiles' alignment across kinds of men ---- */
await blk('53', async () => {
  await L.openGrid(w)
  const geo = []
  for (const [pid, kind] of [['bane', 'pilot'], ['glass', 'WSO'], ['spanner', 'ground'], ['prism', 'O'], ['slipway', 'pilot A']]) {
    await press(w, nameBtn(pid)); await P.waitForTimeout(550)
    const g = await P.evaluate(() => { const o = {}; const q = id => document.querySelector(`[data-testid="${id}"]`); const r = e => { if (!e) return null; const b = e.getBoundingClientRect(); return [Math.round(b.left), Math.round(b.top), Math.round(b.width), Math.round(b.height)].join(',') }; const pw = q('person-window'); const pr = pw.getBoundingClientRect(); const rel = id => { const b = q(id)?.getBoundingClientRect(); return b ? [Math.round(b.left - pr.left), Math.round(b.top - pr.top), Math.round(b.width), Math.round(b.height)].join(',') : null }; for (const id of ['pw-tile-LVE', 'pw-LVE', 'pw-LVE-cf', 'pw-tile-OIL', 'pw-tile-MED', 'pw-CCL', 'pw-FCL', 'pw-PL', 'pw-EL', 'pw-CL', 'pw-year', 'pw-list']) o[id] = rel(id); o.win = Math.round(pr.width) + 'x' + Math.round(pr.height); return o })
    geo.push({ kind, g })
  }
  const keys = Object.keys(geo[0].g).filter(k => k !== 'win')
  const diffs = keys.filter(k => new Set(geo.map(x => x.g[k] && x.g[k].split(',').slice(0, 3).join(','))).size > 1)
  rec('A1 (lesson 9, 25) the tiles stand in the same place in a pilot\'s, WSO\'s, ground, OCU and grade-A man\'s window (left, top, width of each tile relative to the window)', 'desk', diffs.length === 0 ? 'PASS' : 'FAIL', `differing parts: ${diffs.join(',') || 'none'}; ${geo.map(x => x.kind + ' LVE tile ' + x.g['pw-tile-LVE'] + ' / CL box ' + x.g['pw-CL'] + ' / window ' + x.g.win).join(' || ')}`, [])
  await shot(w, '53-last-kind')
  await closePw(w)
})

/* ---- a posted-out man: Cinder (LL 5 May AM pending) posts out on 1 Mar ---- */
await blk('54', async () => {
  await L.reachCell(w, 'ammo', '2026-02-12')
  await press(w, T('cell-ammo-2026-02-12')); await P.waitForTimeout(700)
  await press(w, T('bid-more')); await P.waitForTimeout(500)
  await shot(w, '54a-more')
  const items = await P.evaluate(() => [...document.querySelectorAll('[data-testid="bid-extra-row"] button, [data-testid="bid-picker"] button')].filter(e => e.getBoundingClientRect().width > 0).map(e => (e.dataset.testid || '') + ':' + e.innerText.trim()).filter(x => /post/i.test(x)))
  console.log('post buttons', items)
  const pb = P.locator('[data-testid="bid-picker"] button', { hasText: /Post out/i }).first()
  if (!(await pb.count())) { rec('PO1 a posted-out man', 'desk', 'NOT WALKED', 'no "Post out" button in the bid window\'s ⋯: ' + items.join(','), ['54a-more']); await L.closeWin(w); return }
  await pb.click(); await P.waitForTimeout(700)
  await shot(w, '54b-postout-sheet')
  const d = P.locator(T('postout-date')).first()
  console.log('postout date control', await d.count(), await d.evaluate(e => e.tagName + ' ' + (e.value || e.innerText)).catch(() => null))
  const sheetText = await P.evaluate(() => (document.querySelector('[data-testid="postout-line"]')?.closest('.sheet, [role="dialog"], .bidsheet') || document.body).innerText.replace(/\s+/g, ' ').slice(0, 300))
  rec('PO0 the post-out sheet opens', 'desk', 'PASS', sheetText, ['54b-postout-sheet'])
})

await w.ctx.close()
rec('errors', 'desk', w.errs.length ? 'FAIL' : 'PASS', w.errs.length ? w.errs.join(' || ').slice(0, 900) : 'no console error, page error or 4xx')
L.writeResults('c5')
await L.closeBrowser()
console.log('DONE')
