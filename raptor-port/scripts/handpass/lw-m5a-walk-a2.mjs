// walker A, script 2 — admin, desktop: scenario 6 (one box rewrites the row), ★17 (a typed figure saved to its own man when left by
// Days taken / Lock / Undo), Days taken (View period, cells), Find a person (scn 28). node scripts/handpass/lw-m5a-walk-a2.mjs
process.env.LW_OUT ||= '../../docs/img/handpass/2026-10-28-lw-m5a/a/a2'
process.env.LW_TODAY ||= '2026-01-25'
const A = await import('./lw-m5a-walk-a-lib.mjs')
const { L, T, rec, press, vis, txt, balRow, typeInBox, shotD } = A
console.log('[lw-m5a-walk-a2 v1]')
L.clearOut()
const S = 'desk'
const ok = c => (c ? 'PASS' : 'FAIL')
const w = await L.newCtx('desk'); const P = w.page
const undoTip = () => P.evaluate(() => document.querySelector('#undoBtn')?.getAttribute('title') || document.querySelector('#undoBtn')?.getAttribute('aria-label'))
const redoTip = () => P.evaluate(() => document.querySelector('#redoBtn')?.getAttribute('title') || document.querySelector('#redoBtn')?.getAttribute('aria-label'))
try {
  await L.signIn(w, 'admin'); await A.openBalances(w)
  /* scn 6: incl. only */
  await typeInBox(w, T('bal-cf-bane'), 3)
  let r = await balRow(P, 'bane'); const t6a = await undoTip()
  rec('A10 (scn 6) type incl. carried fwd 3 only', S, ok(r.app === '15' && r.cf === '3'), `row App ${r.app} incl. ${r.cf} War ${r.war}; Undo tip "${t6a}"`, [])
  await typeInBox(w, T('bal-LVE-bane'), 16)
  r = await balRow(P, 'bane'); const t6b = await undoTip()
  rec('A10b (scn 6) then App bal 16 only', S, ok(r.app === '16' && r.cf === '3'), `row App ${r.app} incl. ${r.cf} War ${r.war}; Undo tip "${t6b}"`, [])
  await L.undo(w); r = await balRow(P, 'bane')
  const un1 = r.app + '/' + r.cf
  await L.undo(w); r = await balRow(P, 'bane')
  rec('A10c (scn 6) two Undo steps back to 15 incl. 2', S, ok(un1 === '15/3' && r.app === '15' && r.cf === '2'), `after one Undo ${un1}; after two ${r.app}/${r.cf}`, [])

  /* ★17 — type, do not press Enter, then leave the box by Days taken */
  await press(w, T('bal-LVE-bane')); await P.waitForTimeout(200); await P.keyboard.press('Control+A'); await P.keyboard.type('16', { delay: 30 })
  const dirty = await P.locator(T('bal-LVE-bane')).getAttribute('data-dirty')
  await press(w, T('bal-view-taken')); await P.waitForTimeout(500)
  await shotD(w, '10-star17-taken')
  await press(w, T('bal-view-bal')); await P.waitForTimeout(500)
  r = await balRow(P, 'bane')
  rec('A11 ★17 typed 16, no Enter, then Days taken → saved to Ranger', S, ok(r.app === '16'), `box was dirty "${dirty}"; back on Balances: Ranger App ${r.app} War ${r.war}; Undo tip "${await undoTip()}"`, ['10-star17-taken'])
  await L.undo(w); r = await balRow(P, 'bane')
  rec('A11b its Undo', S, ok(r.app === '15'), `App ${r.app}`, [])
  // type then Lock
  await press(w, T('bal-LVE-bane')); await P.waitForTimeout(200); await P.keyboard.press('Control+A'); await P.keyboard.type('16', { delay: 30 })
  await press(w, T('bal-lock')); await P.waitForTimeout(600)
  r = await balRow(P, 'bane'); const lk = await P.locator(T('bal-lock')).getAttribute('aria-checked')
  await shotD(w, '11-star17-lock')
  rec('A12 ★17 typed 16, no Enter, then Lock', S, ok(r.app === '16' && lk === 'true'), `Ranger App ${r.app}; lock aria-checked ${lk}; Undo tip "${await undoTip()}"`, ['11-star17-lock'])
  // scn 47: lock is an Undo step? Undo should unlock
  await L.undo(w)
  const lk2 = await P.locator(T('bal-lock')).getAttribute('aria-checked'); r = await balRow(P, 'bane')
  rec('A12b (scn 47) Undo after Lock: unlocks (the lock is an Undo step?)', S, 'PASS', `READING: lock aria-checked after one Undo ${lk2}; Ranger App ${r.app}; Undo tip "${await undoTip()}"`, [])
  await L.undo(w); r = await balRow(P, 'bane'); const lk3 = await P.locator(T('bal-lock')).getAttribute('aria-checked')
  rec('A12c second Undo', S, 'PASS', `Ranger App ${r.app}; lock ${lk3}`, [])
  // make sure we are unlocked and at 15 for the next steps
  if ((await P.locator(T('bal-lock')).getAttribute('aria-checked')) === 'true') await press(w, T('bal-lock'))
  // type then the top bar's Undo
  await typeInBox(w, T('bal-CL-pump'), 2)         // one step to undo
  await press(w, T('bal-LVE-bane')); await P.waitForTimeout(200); await P.keyboard.press('Control+A'); await P.keyboard.type('16', { delay: 30 })
  await L.undo(w); r = await balRow(P, 'bane'); const piston = await balRow(P, 'pump')
  rec('A13 ★17 typed 16 in Ranger\'s box, no Enter, then the top bar\'s Undo', S, 'PASS', `READING (spec: the blur saves first, then the Undo takes it back): Ranger App ${r.app}; Piston CL ${piston.CL}; Undo tip "${await undoTip()}"; Redo tip "${await redoTip()}"`, [])
  await L.redo(w); r = await balRow(P, 'bane')
  rec('A13b Redo', S, 'PASS', `Ranger App ${r.app}; Piston CL ${(await balRow(P, 'pump')).CL}`, [])
  await L.undo(w); await L.undo(w)   // back to the seed

  /* Days taken: periods */
  await press(w, T('bal-view-taken')); await P.waitForTimeout(500)
  const opts = await P.locator(T('war-picker')).evaluate(s => [...s.options].map(o => o.textContent.trim() + (o.selected ? '*' : '')))
  const head0 = await txt(P, T('bal-taken-head'))
  const cell = async id => (await txt(P, T(id)))
  const taken = async pid => P.evaluate(pid => ['LL', 'OL', 'OIL', 'CCL', 'FCL', 'PL', 'EL', 'CL', 'MED', 'CSE', 'OD'].map(c => c + ' ' + (document.querySelector(`[data-testid="bal-taken-${c}-${pid}"]`)?.textContent.trim() ?? '?')).join(', '), pid)
  rec('A14 Days taken view, this period', S, ok(/DAYS TAKEN IN JAN . DEC 26/i.test(head0 || '')), `picker options ${JSON.stringify(opts)}; heading "${head0}"; Ranger ${await taken('bane')}; Reaper ${await taken('dice')}`, [])
  await shotD(w, '12-taken-26')
  // each other period in the picker
  for (const o of opts.map(x => x.replace('*', ''))) {
    if (/JAN . DEC 26/.test(o) || /New period/.test(o)) continue
    await P.locator('select[data-testid="war-picker"]').selectOption({ label: o }); await P.waitForTimeout(700)
    const h = await txt(P, T('bal-taken-head')); const viewOn = await P.locator(T('bal-view-taken')).getAttribute('aria-pressed')
    const all = await P.evaluate(() => [...document.querySelectorAll('[data-testid^="bal-taken-"]')].filter(e => !/head/.test(e.dataset.testid)).map(e => e.textContent.trim()))
    const nonDash = all.filter(t => t && t !== '–' && t !== '-')
    await shotD(w, '12-taken-' + o.replace(/\W+/g, '_'))
    rec(`A14 Days taken, View switched to "${o}"`, S, ok(h && viewOn === 'true'), `heading "${h}"; Days taken view still on: ${viewOn}; ${all.length} cells, ${nonDash.length} not a dash (${nonDash.slice(0, 12).join(',')}); Ranger ${await taken('bane')}`, ['12-taken-' + o.replace(/\W+/g, '_')])
  }
  /* a PAST period that is not a calendar year, made through + New period: Jul 24 - Jun 25 */
  await P.locator('select[data-testid="war-picker"]').selectOption({ label: '+ New period' }); await P.waitForTimeout(700)
  const goTo = async (title) => { const iso = title; for (let i = 0; i < 80; i++) { if (await P.locator(T('war-day-' + iso)).count()) return 'reached ' + iso; const m = await P.evaluate(() => [...document.querySelectorAll('[data-testid^="war-day-"]')].map(e => e.dataset.testid.slice(8)).sort()); const have = m[15] || ''; await press(w, T(have > iso ? 'war-prev' : 'war-next')); await P.waitForTimeout(150) } return 'NOT REACHED ' + iso }
  const goToOld = async (title) => { for (let i = 0; i < 60; i++) { const t = (await txt(P, T('war-title'))) || ''; if (t.toLowerCase().includes(title.toLowerCase())) return t; const cur = t; await press(w, T(cur && new Date(cur + ' 1') > new Date(title + ' 1') ? 'war-prev' : 'war-next')); await P.waitForTimeout(120) } return 'NOT REACHED ' + await txt(P, T('war-title')) }
  await P.fill(T('war-name'), 'Past 24-25')
  const g1 = await goTo('2024-07-01'); await press(w, T('war-day-2024-07-01')); await P.waitForTimeout(250)
  const g2 = await goTo('2025-06-30'); await press(w, T('war-day-2025-06-30')); await P.waitForTimeout(250)
  await shotD(w, '12-newperiod-picked')
  const sel = await txt(P, T('war-selection'))
  await press(w, T('war-create')); await P.waitForTimeout(900)
  const opts2 = await P.locator('select[data-testid="war-picker"]').evaluate(s => [...s.options].map(o => o.textContent.trim() + (o.selected ? '*' : '')))
  rec('A14c create a past non-calendar period through + New period', S, ok(opts2.length > opts.length), `calendar reached ${g1} / ${g2}; selection words "${sel}"; picker now ${JSON.stringify(opts2)}`, ['12-newperiod-picked'])
  const hp = await txt(P, T('bal-taken-head'))
  const taken2 = await P.evaluate(() => { const all = [...document.querySelectorAll('[data-testid^="bal-taken-"]')].filter(e => !/head/.test(e.dataset.testid)).map(e => e.textContent.trim()); return { n: all.length, nonDash: all.filter(t => t && t !== '–' && t !== '-').length } })
  await shotD(w, '12-taken-past')
  rec('A14d Days taken on that past, non-calendar period', S, ok(hp && /JUL 24/i.test(hp)), `heading "${hp}"; cells ${JSON.stringify(taken2)}; view on ${await P.locator(T('bal-view-taken')).getAttribute('aria-pressed')}`, ['12-taken-past'])
  await P.locator('select[data-testid="war-picker"]').selectOption({ label: opts.find(x => /JAN . DEC 26/.test(x)).replace('*', '') }); await P.waitForTimeout(700)
  await press(w, T('bal-view-bal')); await P.waitForTimeout(400)

  /* Find a person (scn 28) */
  await press(w, T('bal-search')); await P.keyboard.type('rec', { delay: 40 }); await P.waitForTimeout(700)
  const f = await P.evaluate(() => {
    const row = document.querySelector('[data-testid^="bal-row-"].found, [data-testid^="bal-row-"].hit, [data-testid^="bal-row-"][data-found]') || [...document.querySelectorAll('[data-testid^="bal-row-"]')].find(r => /Recon/.test(r.textContent))
    const sc = document.querySelector('[data-testid="bal-scroll"]'); const sb = sc.getBoundingClientRect()
    const rb = row.getBoundingClientRect(); const head = document.querySelector('.bp-table thead').getBoundingClientRect()
    const mid = document.elementFromPoint(rb.left + 300, rb.top + rb.height / 2)
    return { rowId: row.dataset.testid, cls: row.className, top: Math.round(rb.top), headBottom: Math.round(head.bottom), scBottom: Math.round(sb.bottom), underHead: rb.top < head.bottom, hitIsRow: row.contains(mid), scrollTop: Math.round(sc.scrollTop) }
  })
  await shotD(w, '13-find-rec')
  rec('A15 (scn 28) Find a person "rec" brings the row into sight, marked, not under the headings', S, ok(!f.underHead && f.hitIsRow), JSON.stringify(f), ['13-find-rec'])
  await P.keyboard.press('Control+A'); await P.keyboard.type('zzz', { delay: 40 }); await P.waitForTimeout(600)
  const nm = await P.evaluate(() => document.querySelector('[data-testid="balances-page"]').innerText.replace(/\s+/g, ' ').match(/no (one|person|match)[^.]*/i)?.[0] ?? null)
  await shotD(w, '14-find-none')
  rec('A15b Find a person, no match says so', S, ok(nm), `words found: "${nm}"; rows drawn ${await P.locator('[data-testid^="bal-row-"]').count()}`, ['14-find-none'])
  await P.keyboard.press('Control+A'); await P.keyboard.press('Backspace'); await P.waitForTimeout(400)
  // on Days taken
  await press(w, T('bal-view-taken')); await P.waitForTimeout(400)
  await press(w, T('bal-search')); await P.keyboard.type('rec', { delay: 40 }); await P.waitForTimeout(700)
  const f2 = await P.evaluate(() => { const row = [...document.querySelectorAll('[data-testid^="bal-row-"]')].find(r => /Recon/.test(r.textContent)); const rb = row.getBoundingClientRect(); const head = document.querySelector('.bp-table thead').getBoundingClientRect(); return { top: Math.round(rb.top), headBottom: Math.round(head.bottom), under: rb.top < head.bottom } })
  await shotD(w, '15-find-taken')
  rec('A15c Find a person on Days taken', S, ok(!f2.under), JSON.stringify(f2), ['15-find-taken'])
} catch (e) {
  rec('ERROR', S, 'FAIL', String(e).slice(0, 500), [])
  await L.shot(w, 'error').catch(() => {})
}
rec('errors', S, w.errs.length ? 'FAIL' : 'PASS', w.errs.length ? w.errs.join(' || ').slice(0, 900) : 'no console error, page error or 4xx')
L.writeResults('a2')
await w.ctx.close(); await L.closeBrowser()
console.log('DONE')
