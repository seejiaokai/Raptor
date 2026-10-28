// Walker B, script 3: the admin on a phone (402 x 874, Chromium): padlock, boxes against the keys, typed figures, refusals,
// Days taken, Find a person, Grades. Every tap through the lib's finger (a picture ~100 ms after the lift, then the settled one).
process.env.LW_OUT ||= '../../docs/img/handpass/2026-10-28-lw-m5a/b'
const B = await import('./lw-m5a-walk-b-lib.mjs')
const { L, T, rec, shot, press, openBalances, balRow, where, swipe, box, typeInBox, vis } = B
console.log('[lw-m5a-walk-b3 v1]')
const w = await L.newCtx('phone')
const P = w.page
const S = async (name, fn) => { try { await fn() } catch (e) { rec(name, '402', 'NOT WALKED', 'script stopped: ' + String(e).slice(0, 250), []); await shot(w, 'err-' + name.replace(/\W+/g, '-')).catch(() => {}) } }
const geoBox = sel => P.evaluate(sel => {
  const e = document.querySelector(sel); if (!e) return null
  const r = e.getBoundingClientRect()
  const who = document.querySelector('.bp-row .bp-who')?.getBoundingClientRect()
  const cols = document.querySelector('.bp-cols')?.getBoundingClientRect()
  const hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2)
  const fs = getComputedStyle(e).fontSize
  return { l: Math.round(r.left), r: Math.round(r.right), t: Math.round(r.top), b: Math.round(r.bottom), whoR: Math.round(who?.right ?? 0), colsB: Math.round(cols?.bottom ?? 0), vh: innerHeight, vvh: Math.round(visualViewport.height), vw: innerWidth, hitIsBox: hit === e, fs, focused: document.activeElement === e }
}, sel)
await L.signIn(w, 'admin')
await openBalances(w)

await S('b3-padlock', async () => {
  const cls0 = await P.locator(T('bal-lock')).getAttribute('class'), lab0 = await P.locator(T('bal-lock')).getAttribute('aria-label')
  await shot(w, 'p1-lock-off')
  await P.screenshot({ path: `${L.OUT}/p1-lock-off-bar.png`, clip: { x: 0, y: 141, width: 402, height: 56 }, scale: 'css' })
  await press(w, T('bal-lock'), 'p1-lock-on-q'); await P.waitForTimeout(500)
  await shot(w, 'p1-lock-on')
  await P.screenshot({ path: `${L.OUT}/p1-lock-on-bar.png`, clip: { x: 0, y: 141, width: 402, height: 56 }, scale: 'css' })
  const on = await P.locator(T('bal-lock')).getAttribute('aria-checked'), lab1 = await P.locator(T('bal-lock')).getAttribute('aria-label'), cls1 = await P.locator(T('bal-lock')).getAttribute('class')
  const r1 = await balRow(P, 'bane')
  rec('F-lock phone padlock on (admin)', '402', on === 'true' ? 'PASS' : 'FAIL', `aria-checked ${on}; label "${lab0}" -> "${lab1}"; class "${cls0}" -> "${cls1}"; admin keeps his boxes: Ranger's row boxes ${r1?.boxes}`, ['p1-lock-on-q', 'p1-lock-on', 'p1-lock-on-bar'])
  await press(w, T('bal-lock'), 'p1-lock-off-q'); await P.waitForTimeout(500)
  const off = await P.locator(T('bal-lock')).getAttribute('aria-checked')
  await shot(w, 'p1-lock-off-again')
  rec('F-lock phone padlock off again', '402', off === 'false' ? 'PASS' : 'FAIL', `aria-checked ${off}; label "${await P.locator(T('bal-lock')).getAttribute('aria-label')}"`, ['p1-lock-off-q', 'p1-lock-off-again'])
})

await S('b6-boxes', async () => {
  /* every box of Ranger's row: tap it with the finger, then where it stands against the names column, the heading row, the edges */
  const ids = ['bal-LVE-bane', 'bal-cf-bane', 'bal-CCL-bane', 'bal-FCL-bane', 'bal-PL-bane', 'bal-EL-bane', 'bal-CL-bane']
  for (const id of ids) {
    await P.keyboard.press('Escape'); await P.waitForTimeout(200)
    await press(w, T(id), `p2-tap-${id}-q`)    // the lib scrolls it into view first (scrollIntoViewIfNeeded), then taps
    await P.waitForTimeout(700)
    const g = await geoBox(T(id)); const sc = await where(P)
    await shot(w, `p2-tap-${id}`)
    const okSide = g && g.l >= g.whoR - 1 && g.r <= g.vw + 0.5 && g.t >= g.colsB - 1 && g.b <= g.vh
    rec(`29 tap ${id}: the box in plain sight`, '402', g?.focused && g.hitIsBox && okSide ? 'PASS' : 'FAIL', `box x ${g?.l}-${g?.r}, y ${g?.t}-${g?.b}; names column ends ${g?.whoR}; heading row ends ${g?.colsB}; screen ${g?.vw}x${g?.vh}; focused ${g?.focused}; top element is the box ${g?.hitIsBox}; font ${g?.fs}; scroll ${JSON.stringify(sc)}`, [`p2-tap-${id}-q`, `p2-tap-${id}`])
  }
  /* the keyboard's next arrow: Tab through the row from App bal */
  await P.keyboard.press('Escape'); await P.waitForTimeout(200)
  await press(w, T('bal-LVE-bane')); await P.waitForTimeout(700)
  const seen = []
  for (let i = 0; i < 7; i++) {
    const id = await P.evaluate(() => document.activeElement?.dataset?.testid || document.activeElement?.tagName)
    await P.waitForTimeout(350)
    const g = await geoBox(`[data-testid="${id}"]`)
    seen.push(`${id}: x ${g?.l}-${g?.r} ${g && g.l >= g.whoR - 1 && g.r <= g.vw ? 'in sight' : 'NOT in sight'}`)
    if (i === 3 || i === 6) await shot(w, `p2-tab-${i}`)
    await P.keyboard.press('Tab')
  }
  rec('29 Tab through the row (the keyboard\'s next arrow)', '402', seen.every(s => /in sight/.test(s)) ? 'PASS' : 'FAIL', seen.join(' | '), ['p2-tab-3', 'p2-tab-6'])
  await P.keyboard.press('Escape')
})

await S('b6-keys-standin', async () => {
  /* a stand-in for the keys: the screen shortened to what is left above 300 px of keys (Chromium's measure — NOT his iPhone's) */
  await P.evaluate(() => { const s = document.querySelector('[data-testid="bal-scroll"]'); s.scrollTo(0, 0) }); await P.waitForTimeout(300)
  for (const id of ['bal-LVE-bane', 'bal-CL-bane']) {
    await P.setViewportSize({ width: 402, height: 874 }); await P.waitForTimeout(300)
    await press(w, T(id)); await P.waitForTimeout(700)
    await P.setViewportSize({ width: 402, height: 574 }); await P.waitForTimeout(900)
    const g = await geoBox(T(id)); await shot(w, `p3-keys-${id}`)
    const bars = await P.evaluate(() => [...document.querySelectorAll('.topbar, #topbar, header')].map(e => { const r = e.getBoundingClientRect(); return `${e.className || e.tagName} ${Math.round(r.top)}-${Math.round(r.bottom)}` }).slice(0, 3))
    rec(`5 box against the keys (stand-in 300 px): ${id}`, '402', g && g.t >= g.colsB - 1 && g.b <= 574 && g.l >= g.whoR - 1 ? 'PASS' : 'FAIL', `box y ${g?.t}-${g?.b} of a ${g?.vh}-high screen; heading row ends ${g?.colsB}; x ${g?.l}-${g?.r} (names end ${g?.whoR}); bars ${bars.join(', ')} — a Chromium stand-in only: his iPhone keeps the layout tall and pans the visible screen, so only his phone proves it`, [`p3-keys-${id}`])
    await P.keyboard.press('Escape')
  }
  /* the LAST row of the page, scrolled to the foot: a box low on the screen, then the keys */
  await P.setViewportSize({ width: 402, height: 874 }); await P.waitForTimeout(400)
  await P.evaluate(() => { const s = document.querySelector('[data-testid="bal-scroll"]'); s.scrollTo(0, s.scrollHeight) }); await P.waitForTimeout(500)
  const lastPid = await P.evaluate(() => { const rows = [...document.querySelectorAll('[data-testid^="bal-row-"]')]; return rows[rows.length - 1].dataset.testid.slice(8) })
  const lowId = 'bal-LVE-' + lastPid
  await shot(w, 'p3-low-row-before')
  const gl = await geoBox(T(lowId))
  await press(w, T(lowId)); await P.waitForTimeout(700)
  await P.setViewportSize({ width: 402, height: 574 }); await P.waitForTimeout(900)
  const g2 = await geoBox(T(lowId)); await shot(w, 'p3-low-row-keys')
  rec('5 a box low on the page with the keys up (stand-in)', '402', g2 && g2.t >= g2.colsB - 1 && g2.b <= 574 ? 'PASS' : 'FAIL', 'last row ' + lastPid + ': box y before the tap ' + gl?.t + '-' + gl?.b + '; with a 574-high screen ' + g2?.t + '-' + g2?.b + '; heading row ends ' + g2?.colsB + '; focused ' + g2?.focused + '; Chromium stand-in only (his iPhone pans the visible screen instead)', ['p3-low-row-before', 'p3-low-row-keys'])
  await P.keyboard.press('Escape')
  await P.setViewportSize({ width: 402, height: 874 }); await P.waitForTimeout(500)
  await P.evaluate(() => { document.querySelector('[data-testid="bal-scroll"]').scrollTo(0, 0) }); await P.waitForTimeout(300)
})

await S('b7-typing', async () => {
  const b0 = await balRow(P, 'bane'); const sc0 = await where(P)
  await typeInBox(w, T('bal-LVE-bane'), 16)
  const b1 = await balRow(P, 'bane'); await shot(w, 'p4-typed-16')
  rec('3 typed 16 + Enter: the figure and War bal', '402', b1.app === '16' && /13\.5/.test(b1.war) ? 'PASS' : 'FAIL', `App bal ${b0.app}->${b1.app}, War bal ${b0.war}->${b1.war}, carried ${b1.cf}, pending ${b1.pend}; focus ${await P.evaluate(() => document.activeElement?.dataset?.testid)}`, ['p4-typed-16'])
  /* a refused figure: 17.3 */
  await typeInBox(w, T('bal-LVE-bane'), '17.3')
  const err = await P.evaluate(() => { const e = document.querySelector('[data-testid="bal-LVE-bane-err"]'); if (!e) return null; const r = e.getBoundingClientRect(); return { text: e.textContent.trim(), l: Math.round(r.left), r: Math.round(r.right), t: Math.round(r.top), b: Math.round(r.bottom), w: Math.round(r.width), cut: e.scrollWidth > e.clientWidth, vw: innerWidth } })
  const b2 = await balRow(P, 'bane'); await shot(w, 'p4-refused-17.3')
  rec('19 a refused figure 17.3: words under the box, old figure back', '402', err && b2.app === '16' && err.l >= 0 && err.r <= err.vw ? 'PASS' : 'FAIL', `error words ${JSON.stringify(err)}; the box now reads ${b2.app}`, ['p4-refused-17.3'])
  await P.keyboard.press('Escape'); await P.waitForTimeout(400)
  await shot(w, 'p4-after-escape')
  rec('19 Escape after the refusal', '402', 'NOTE', `box ${(await balRow(P, 'bane')).app}; error still shown: ${await vis(P, T('bal-LVE-bane-err'))}`, ['p4-after-escape'])
  /* a carried forward over the figure */
  await typeInBox(w, T('bal-cf-bane'), '40')
  const b3 = await balRow(P, 'bane'); const err3 = await P.locator(T('bal-cf-bane-err')).count() ? await P.locator(T('bal-cf-bane-err')).innerText() : null
  await shot(w, 'p4-cf-40')
  rec('5d carried fwd 40 over App bal 16', '402', 'NOTE', `App bal ${b3.app}, carried ${b3.cf}; error words ${err3 ?? 'none'}`, ['p4-cf-40'])
  await L.undo(w)   // the two refused figures wrote nothing: one step (16) to take back
  rec('Undo once (back to the seed; the refused figures left no step)', '402', 'NOTE', `App bal ${(await balRow(P, 'bane')).app}, carried ${(await balRow(P, 'bane')).cf}; scroll ${JSON.stringify(await where(P))} (before ${JSON.stringify(sc0)})`, [])
  /* a figure off screen to the right: CL (lesson 3) */
  await P.evaluate(() => { const s = document.querySelector('[data-testid="bal-scroll"]'); s.scrollTo(0, 0) }); await P.waitForTimeout(300)
  await press(w, T('bal-CL-bane'), 'p5-CL-q'); await P.waitForTimeout(700)
  await P.keyboard.press('Control+A'); await P.keyboard.type('2', { delay: 30 }); await shot(w, 'p5-CL-typed-noenter')
  const gt = await geoBox(T('bal-CL-bane'))
  await P.keyboard.press('Enter'); await P.waitForTimeout(600)
  await shot(w, 'p5-CL-entered')
  const b4 = await balRow(P, 'bane'); const sc4 = await where(P)
  rec('3 a figure off screen to the right: CL typed 2', '402', /^2/.test(b4.CL) ? 'PASS' : 'FAIL', `CL read "${b4.CL}"; the box stood x ${gt?.l}-${gt?.r} when typed (screen ${gt?.vw}); scroll ${JSON.stringify(sc4)}; War bal ${b4.war}, App bal ${b4.app} (unchanged: it is another kind)`, ['p5-CL-q', 'p5-CL-typed-noenter', 'p5-CL-entered'])
  await L.undo(w)
  rec('Undo of CL', '402', 'NOTE', `CL ${(await balRow(P, 'bane')).CL}; scroll ${JSON.stringify(await where(P))}`, [])
  /* an unsent figure and a tap away: saved or put back? */
  await P.evaluate(() => { const s = document.querySelector('[data-testid="bal-scroll"]'); s.scrollTo(0, 0) }); await P.waitForTimeout(300)
  await typeInBox(w, T('bal-LVE-bane'), '19', false)
  const dirty = await P.locator(T('bal-LVE-bane')).getAttribute('data-dirty')
  await press(w, T('bal-view-taken')); await P.waitForTimeout(600)
  await press(w, T('bal-view-bal')); await P.waitForTimeout(600)
  const b5 = await balRow(P, 'bane'); await shot(w, 'p5-tapaway')
  rec('17 a typed figure, no Enter, then the view switch pressed', '402', 'NOTE', `data-dirty ${dirty}; afterwards App bal ${b5.app}, War bal ${b5.war} (saved to Ranger or put back: read the figure)`, ['p5-tapaway'])
  if (b5.app !== '15') await L.undo(w)
})

await S('b8-taken-search', async () => {
  await press(w, T('bal-view-taken'), 'p6-taken-q'); await P.waitForTimeout(600)
  await shot(w, 'p6-taken')
  const cols = await P.evaluate(() => [...document.querySelectorAll('.bp-cols > span')].filter(e => e.getBoundingClientRect().width > 0).map(e => e.textContent.trim()).filter(Boolean))
  rec('D-taken Days taken on a phone', '402', cols.length >= 11 ? 'PASS' : 'FAIL', `columns ${cols.join(' | ')}; no period heading drawn: ${!(await vis(P, T('bal-taken-head')))}; Ranger ${(await P.evaluate(() => [...document.querySelectorAll('[data-testid^="bal-taken-"][data-testid$="-bane"]')].map(e => e.dataset.testid.slice(10, -5) + ' ' + e.textContent.trim()).join(', ')))}`, ['p6-taken'])
  await swipe(w, 330, 500, 90, 500, { steps: 10, dwell: 16, rest: 100 }); await P.waitForTimeout(700)
  await shot(w, 'p6-taken-slid')
  rec('D-taken the kinds slide sideways too', '402', (await where(P)).left > 0 ? 'PASS' : 'FAIL', `scrollLeft ${(await where(P)).left}; names column left ${(await box(P, '.bp-row .bp-who'))?.l}`, ['p6-taken-slid'])
  await press(w, T('bal-view-bal')); await P.waitForTimeout(500)
  /* Find a person */
  await press(w, T('bal-search-open'), 'p7-search-open-q'); await P.waitForTimeout(600)
  await shot(w, 'p7-search-open')
  await P.keyboard.type('rec', { delay: 40 }); await P.waitForTimeout(900)
  const hit = await P.evaluate(() => { const rows = [...document.querySelectorAll('[data-testid^="bal-row-"]')]; const r = rows.find(e => /Recon/i.test(e.textContent)); const cols = document.querySelector('.bp-cols')?.getBoundingClientRect(); const bar = document.querySelector('.bp-bar')?.getBoundingClientRect(); if (!r) return { found: false, n: rows.length }; const b = r.getBoundingClientRect(); return { found: true, id: r.dataset.testid, t: Math.round(b.top), b: Math.round(b.bottom), colsB: Math.round(cols?.bottom ?? 0), barB: Math.round(bar?.bottom ?? 0), mark: r.className, rowsShown: rows.length } })
  await shot(w, 'p7-search-rec')
  rec('28 Find a person "rec"', '402', hit.found && hit.t >= hit.colsB - 1 ? 'PASS' : 'FAIL', JSON.stringify(hit), ['p7-search-open', 'p7-search-rec'])
  await P.keyboard.press('Escape'); await P.waitForTimeout(400)
  await shot(w, 'p7-search-esc')
})

await S('b9-grades', async () => {
  await press(w, T('bal-grades'), 'p8-grades-q'); await P.waitForTimeout(600)
  await shot(w, 'p8-grades')
  const m = await P.evaluate(() => {
    const sheet = document.querySelector('[data-testid="grades-sheet"]'); const sr = sheet.getBoundingClientRect()
    const hs = [...sheet.querySelectorAll('*')].filter(e => /AUTO\s*\+\s*LVE/i.test(e.textContent) && e.children.length === 0)
    return { sheet: { l: Math.round(sr.left), r: Math.round(sr.right), t: Math.round(sr.top), b: Math.round(sr.bottom) }, heads: hs.map(e => { const r = e.getBoundingClientRect(); return { text: e.textContent.trim(), l: Math.round(r.left), r: Math.round(r.right), sw: e.scrollWidth, cw: e.clientWidth, ov: getComputedStyle(e).overflow } }) }
  })
  rec('41 Grades window on a phone: the heading "AUTO + LVE ON 1 JAN"', '402', m.heads.every(h => h.r <= m.sheet.r - 2 && h.sw <= h.cw + 1) ? 'PASS' : 'FAIL', JSON.stringify(m), ['p8-grades'])
  await P.keyboard.press('Escape'); await P.waitForTimeout(400)
})
rec('errors', '402', w.errs.length ? 'FAIL' : 'PASS', B.errsOf(w), [])
L.writeResults('b3')
await w.ctx.close(); await L.closeBrowser()
