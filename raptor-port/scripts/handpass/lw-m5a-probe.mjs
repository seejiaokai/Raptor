// M5a host probe — the route every walker's scenario starts from, driven by the host first (walk-scripts §1, §2).
// Run: node scripts/handpass/lw-m5a-probe.mjs   (from raptor-port/; the frozen build served on 4173)
// Optional: SIZES=desk or SIZES=phone to run one size.
process.env.LW_OUT ||= '../../docs/img/handpass/2026-10-28-lw-m5a/probe'
process.env.LW_TODAY ||= '2026-01-25'
const L = await import('./lw-m4-lib.mjs')
const { T, rec, shot, press, step, vis, txt } = L
console.log('[lw-m5a-probe v2]')
L.clearOut()

/* ---------------------------------------------------------------- helpers the walkers may copy */

/* the tab row as drawn: each tab's label (only the parts with a width — walk-scripts §4), its count, then the gear */
const tabRow = page => page.evaluate(() => {
  const tabs = [...document.querySelectorAll('.lw-tabs [role="tab"]')].filter(e => e.getBoundingClientRect().width > 0)
  const out = tabs.map(t => {
    const lab = t.querySelector('.intab-t'), n = t.querySelector('.appr-tabn')
    const labW = lab ? lab.getBoundingClientRect().width : 0
    return { id: t.dataset.testid, label: labW > 1 ? lab.textContent.trim() : '(icon only)', n: n ? n.textContent.trim() : '', right: Math.round(t.getBoundingClientRect().right), sel: t.getAttribute('aria-selected') }
  })
  const g = document.querySelector('[data-testid="settings-open"]')
  const gr = g ? g.getBoundingClientRect() : null
  return { tabs: out, gear: gr && gr.width > 0 ? { left: Math.round(gr.left), right: Math.round(gr.right) } : null }
})
/* one person's row on the Balances page: boxes read by value, read-only figures by their drawn text */
const balRow = (page, pid) => page.evaluate(pid => {
  const row = document.querySelector(`[data-testid="bal-row-${pid}"]`)
  if (!row) return null
  const val = id => { const e = document.querySelector(`[data-testid="${id}"]`); return e ? (e.tagName === 'INPUT' ? e.value : e.textContent.replace(/\s+/g, ' ').trim()) : null }
  const r = { app: val(`bal-LVE-${pid}`), cf: val(`bal-cf-${pid}`), pend: val(`bal-pend-${pid}`), war: val(`bal-war-${pid}`), oil: val(`bal-oil-${pid}`), grade: (row.querySelector(`[data-testid="bal-grade-${pid}"]`) || row.querySelector('.bp-rogd,.bp-gd'))?.textContent.replace(/\s+/g, ' ').trim() ?? null }
  for (const k of ['CCL', 'FCL', 'PL', 'EL', 'CL']) r[k] = val(`bal-${k}-${pid}`) + (val(`bal-opd-${k}-${pid}`) ? ' ' + val(`bal-opd-${k}-${pid}`) : '')
  r.boxes = row.querySelectorAll('input').length
  r.readOnly = [...row.querySelectorAll('.bp-ro')].map(e => e.textContent.trim())
  return r
}, pid)
/* the person window: name, tiles, the year picker and the leave lines */
const pwRead = page => page.evaluate(() => {
  const pw = document.querySelector('[data-testid="person-window"]')
  if (!pw || !pw.getBoundingClientRect().width) return null
  const q = id => pw.querySelector(`[data-testid="${id}"]`)
  const v = id => { const e = q(id); return e ? (e.tagName === 'INPUT' ? e.value : e.textContent.replace(/\s+/g, ' ').trim()) : null }
  const r = pw.getBoundingClientRect()
  const yr = q('pw-year')
  return {
    name: v('pw-name'), taken: v('pw-taken'), lve: v('pw-tile-LVE'), pend: v('pw-LVE-pend'), war: v('pw-LVE-war'), cf: v('pw-LVE-cf'),
    oil: v('pw-oil'), med: v('pw-med'), lock: v('pw-lock'),
    other: Object.fromEntries(['CCL', 'FCL', 'PL', 'EL', 'CL'].map(k => [k, v(`pw-${k}`)])),
    boxes: pw.querySelectorAll('input').length,
    year: yr ? { value: yr.value, options: [...yr.options].map(o => o.textContent) } : null,
    lines: [...pw.querySelectorAll('[data-testid^="pw-line-"]')].filter(e => !/-(dot|who)$/.test(e.dataset.testid)).map(e => ({ id: e.dataset.testid, text: e.innerText.replace(/\s+/g, ' ').trim(), dot: !!e.querySelector('.m5-dot') })),
    box: { left: Math.round(r.left), right: Math.round(r.right), top: Math.round(r.top), bottom: Math.round(r.bottom), width: Math.round(r.width) },
    vh: innerHeight, closeY: Math.round(q('pw-close')?.getBoundingClientRect().top ?? -1), styleTop: pw.style.top,
  }
})
/* the window is ON the screen: its top above the screen's foot and its ✕ inside the screen */
const onScreen = pw => !!pw && pw.box.top < pw.vh - 40 && pw.box.bottom > 0 && pw.closeY > 0 && pw.closeY < pw.vh
/* close the window: ✕ where it is on the screen, else Escape (Sheet.tsx closes on Escape) — says which */
async function closePw(w) {
  const pw = await pwRead(w.page)
  if (onScreen(pw)) { await press(w, T('pw-close')); await w.page.waitForTimeout(400); return '✕' }
  await w.page.keyboard.press('Escape'); await w.page.waitForTimeout(400); return 'Escape (✕ off the screen)'
}
async function openBalances(w) {
  await press(w, T('lw-tab-balances'))
  await w.page.waitForSelector(T('balances-page'), { state: 'visible', timeout: 10000 })
  await w.page.waitForTimeout(500)
}
/* type a figure in a box as a person does: press it, select what is there, type, Enter (the app commits on Enter) */
async function typeInBox(w, sel, figure, enter = true) {
  await press(w, sel)
  await w.page.waitForTimeout(w.phone ? 650 : 150)   // walk-scripts §4: a second tap within ~0.5 s is a double tap
  await w.page.keyboard.press('Control+A')
  await w.page.keyboard.type(String(figure), { delay: 30 })
  if (enter) await w.page.keyboard.press('Enter')
  await w.page.waitForTimeout(500)
}
/* the scroll the Balances page stands at, and the window's — what Undo must leave where it was (D672) */
const where = page => page.evaluate(() => { const s = document.querySelector('[data-testid="bal-scroll"]'); return { top: s ? Math.round(s.scrollTop) : null, left: s ? Math.round(s.scrollLeft) : null, win: Math.round(window.scrollY) } })

/* THE ADMIN'S LOCK FLIPPED WHILE THE MEMBER IS SIGNED IN — the walk's stand-in for the other person (the spec §7, "How the
   lock is walked"). The localhost bridge (src/probe-bridge.ts) has NO function for the lock. This stand-in uses what the
   bridge does have — the two role switches, `lwSetRole` and the localhost-only `raptorRole`, as `lwSaveManningRule` does —
   around the store's OWN lock writer ("Lock for members"), reached in the served build's store module (the same module
   instance the page runs: the same URL). All in one synchronous call, so the screen draws only the end state: the member,
   the lock flipped. The change history names the person signed in (Ranger), not Saber — a stand-in's limit. */
async function lockViaBridge(w, on) {
  return w.page.evaluate(async on => {
    const url = performance.getEntriesByType('resource').map(e => e.name).find(n => /\/assets\/store-[^/]+\.js$/.test(n))
      || [...document.querySelectorAll('link[rel="modulepreload"]')].map(l => l.href).find(n => /\/assets\/store-[^/]+\.js$/.test(n))
    if (!url) return { ok: false, why: 'no store module among the loaded scripts' }
    const m = await import(url)
    const fns = Object.values(m).filter(f => typeof f === 'function')
    const setLock = fns.find(f => String(f).includes('lw.balLock'))
    if (!setLock) return { ok: false, why: 'no lock writer in ' + url }
    if (typeof window.lwSetRole !== 'function' || typeof window.raptorRole !== 'function') return { ok: false, why: 'the bridge role switches are missing (not localhost?)' }
    window.raptorRole('admin'); window.lwSetRole('admin')
    let res
    try { res = setLock(on) } finally { window.lwSetRole('member'); window.raptorRole('member') }
    return { ok: true, wrote: res, url: url.replace(location.origin, '') }
  }, on)
}
/* reload the page and pin the war's today again — a reload DROPS the pinned today (it lives in memory only) */
async function reloadAt(w, iso) {
  await w.page.reload()
  await w.page.waitForSelector('#luser, #vWeek .day', { state: 'attached', timeout: 15000 })
  const signedOut = await w.page.locator('#luser').isVisible().catch(() => false)
  await w.page.evaluate(t => window.lwSetMemberToday(t), iso)
  return signedOut
}

/* ---------------------------------------------------------------- the probe */
const sizes = (process.env.SIZES || 'desk,phone').split(',')
for (const size of sizes) {
  const w = await L.newCtx(size)
  const P = w.page
  const S = n => `${size}-${n}`
  try {
    /* 1 — Saber signs in: the tab row */
    await L.signIn(w, 'admin')
    const tr = await tabRow(P)
    const labels = tr.tabs.map(t => t.label + (t.n ? ' ' + t.n : '')).join(' · ')
    const gearLast = !!tr.gear && tr.tabs.every(t => t.right <= tr.gear.left)
    rec('1 tab row (admin)', size, tr.tabs.length === 4 && /Grid/.test(tr.tabs[0].label + tr.tabs[0].id) && tr.tabs[2].id === 'lw-tab-balances' && gearLast ? 'PASS' : 'FAIL',
      `${labels} · gear ${tr.gear ? `at x ${tr.gear.left}` : 'MISSING'}; ids ${tr.tabs.map(t => t.id).join(',')}`, [S('01-tabrow')])
    await shot(w, S('01-tabrow'))

    /* 2 — Balances: the page in the grid card's place; Ranger's row */
    await openBalances(w)
    const gridShown = await P.evaluate(() => { const g = document.querySelector('#page-leavewar .mx-outer'); return !!g && g.getBoundingClientRect().height > 0 && getComputedStyle(g).visibility !== 'hidden' })
    const r0 = await balRow(P, 'bane')
    rec('2 Balances page, Ranger\'s row', size, r0 && r0.app === '15' && r0.cf === '2' && /2\.5|2½/.test(r0.pend) && /12\.5|12½/.test(r0.war) ? 'PASS' : 'FAIL',
      `grid behind drawn: ${gridShown}; Ranger ${JSON.stringify(r0)}`, [S('02-balances')])
    await shot(w, S('02-balances'))

    /* 3 — type App bal 16, Enter; Undo; Redo */
    const before = await where(P)
    await typeInBox(w, T('bal-LVE-bane'), 16)
    const r1 = await balRow(P, 'bane')
    const err1 = await txt(P, T('bal-LVE-bane-err'))
    rec('3a typed 16 + Enter', size, r1 && r1.app === '16' && /13\.5|13½/.test(r1.war) ? 'PASS' : 'FAIL', `App bal ${r1?.app}, cf ${r1?.cf}, pend ${r1?.pend}, War bal ${r1?.war}; error words: ${err1 ?? 'none'}; focus on ${await P.evaluate(() => document.activeElement?.dataset?.testid || document.activeElement?.tagName)}`, [S('03a-typed')])
    await shot(w, S('03a-typed'))
    const mid = await where(P)
    await L.undo(w)
    const r2 = await balRow(P, 'bane'), after = await where(P)
    rec('3b Undo puts it back, the screen where it was', size, r2?.app === '15' && JSON.stringify(mid) === JSON.stringify(after) ? 'PASS' : 'FAIL', `App bal ${r2?.app}, War bal ${r2?.war}; scroll before typing ${JSON.stringify(before)}, before Undo ${JSON.stringify(mid)}, after ${JSON.stringify(after)}`, [S('03b-undo')])
    await shot(w, S('03b-undo'))
    await L.redo(w)
    const r3 = await balRow(P, 'bane')
    rec('3c Redo', size, r3?.app === '16' ? 'PASS' : 'FAIL', `App bal ${r3?.app}, War bal ${r3?.war}`, [S('03c-redo')])
    await shot(w, S('03c-redo'))
    await L.undo(w)   // back to the seed's figure for the steps after
    rec('3d Undo again (back to the seed)', size, (await balRow(P, 'bane'))?.app === '15' ? 'PASS' : 'FAIL', `App bal ${(await balRow(P, 'bane'))?.app}`)

    /* 4 — Days taken, then back */
    await press(w, T('bal-view-taken')); await P.waitForTimeout(500)
    const head = await txt(P, T('bal-taken-head'))
    const takenCells = await P.evaluate(() => [...document.querySelectorAll('[data-testid^="bal-taken-"][data-testid$="-bane"]')].map(e => `${e.dataset.testid.slice(10, -5)} ${e.textContent.trim()}`))
    const colHeads = await P.evaluate(() => [...document.querySelectorAll('.bp-table thead tr.h2 th, .bp-cols > span')].filter(e => e.getBoundingClientRect().width > 0).map(e => e.textContent.trim()).filter(Boolean))
    rec('4a Days taken view', size, takenCells.length > 0 ? 'PASS' : 'FAIL', `heading "${head ?? '(none drawn on a phone)'}"; columns ${colHeads.join(' | ')}; Ranger ${takenCells.join(', ')}`, [S('04-taken')])
    await shot(w, S('04-taken'))
    await press(w, T('bal-view-bal')); await P.waitForTimeout(500)
    rec('4b back to Balances', size, (await P.locator(T('bal-LVE-bane')).count()) === 1 ? 'PASS' : 'FAIL', `App bal box back: ${(await balRow(P, 'bane'))?.app}`)

    /* 5 — Grades… opens; Escape closes */
    await step(w, S('05a-grades'), T('bal-grades'))
    const gRows = await P.evaluate(() => [...document.querySelectorAll('[data-testid^="grade-row-"]')].map(e => e.innerText.replace(/\s+/g, ' ').trim()))
    rec('5a Grades… opens', size, (await vis(P, T('grades-sheet'))) && gRows.length > 0 ? 'PASS' : 'FAIL', `${gRows.length} grades: ${gRows.join(' / ')}`, [S('05a-grades')])
    await P.keyboard.press('Escape'); await P.waitForTimeout(500)
    rec('5b Escape closes it', size, !(await vis(P, T('grades-sheet'))) ? 'PASS' : 'FAIL', `sheet visible after Escape: ${await vis(P, T('grades-sheet'))}; focus ${await P.evaluate(() => document.activeElement?.dataset?.testid || document.activeElement?.tagName)}`, [S('05b-closed')])
    await shot(w, S('05b-closed'))

    /* 6 — Ranger's name → his person window */
    await step(w, S('06-person'), T('bal-name-bane'))
    const pw = await pwRead(P)
    const pageBox = await P.evaluate(() => { const r = document.getElementById('page-leavewar')?.getBoundingClientRect(); const b = document.querySelector('[data-testid="balances-page"]')?.getBoundingClientRect(); return { pageRight: r ? Math.round(r.right) : null, balRight: b ? Math.round(b.right) : null, vw: innerWidth } })
    const placed = !pw ? 'no window' : w.phone
      ? `left margin ${pw.box.left}, right margin ${pageBox.vw - pw.box.right}`
      : `right edge ${pw.box.right} vs Leave War page right ${pageBox.pageRight} (Balances card right ${pageBox.balRight}), top ${pw.box.top} of a ${pw.vh} screen (style top "${pw.styleTop}"), width ${pw.box.width}`
    rec('6 person window from the Balances name, on the screen', size, pw && /Ranger/.test(pw.name) && onScreen(pw) ? 'PASS' : 'FAIL', `${placed}; ${JSON.stringify(pw && { ...pw, box: undefined })}`, [S('06-person')])
    const how6 = await closePw(w)
    rec('6b the window closes', size, !(await vis(P, T('person-window'))) ? 'PASS' : 'FAIL', `closed by ${how6}`)

    /* 7 — the lock: on as Saber; Ranger reads all read only; off again */
    await step(w, S('07a-lock-on'), T('bal-lock'))
    const lockOn = await P.locator(T('bal-lock')).getAttribute('aria-checked')
    rec('7a Lock for members on', size, lockOn === 'true' ? 'PASS' : 'FAIL', `switch aria-checked ${lockOn}; label "${await P.locator(T('bal-lock')).getAttribute('aria-label') ?? await txt(P, T('bal-lock'))}"`, [S('07a-lock-on')])
    await L.switchTo(w, 'member')
    const trm = await tabRow(P)
    rec('7b tab row (member)', size, trm.tabs.length === 3 && !trm.tabs.some(t => t.id === 'lw-tab-approvals') && !trm.gear ? 'PASS' : 'FAIL', `${trm.tabs.map(t => t.label).join(' · ')}; gear ${trm.gear ? 'SHOWN' : 'none'}`, [S('07b-member-tabs')])
    await shot(w, S('07b-member-tabs'))
    await openBalances(w)
    const rm = await balRow(P, 'bane'), lockedW = await txt(P, T('bal-locked'))
    rec('7c member, locked: his row read only, "Locked by admin"', size, rm && rm.boxes === 0 && /Locked by admin/.test(lockedW || '') ? 'PASS' : 'FAIL', `words "${lockedW}"; Ranger's row: boxes ${rm?.boxes}, read-only figures ${rm?.readOnly?.join(' ')}`, [S('07c-member-locked')])
    await shot(w, S('07c-member-locked'))
    await L.switchTo(w, 'admin')
    await openBalances(w)
    await step(w, S('07d-lock-off'), T('bal-lock'))
    const lockOff = await P.locator(T('bal-lock')).getAttribute('aria-checked')
    rec('7d Lock off again', size, lockOff === 'false' ? 'PASS' : 'FAIL', `switch aria-checked ${lockOff}`, [S('07d-lock-off')])

    /* 8 — lockViaBridge, as the member */
    await L.switchTo(w, 'member')
    await openBalances(w)
    const pre = await balRow(P, 'bane')
    const lb1 = await lockViaBridge(w, true); await P.waitForTimeout(500)
    const onR = await balRow(P, 'bane'), onW = await txt(P, T('bal-locked'))
    rec('8a lockViaBridge(on) under the member', size, lb1.ok && pre?.boxes > 0 && onR?.boxes === 0 && /Locked by admin/.test(onW || '') ? 'PASS' : 'FAIL', `helper ${JSON.stringify(lb1)}; boxes before ${pre?.boxes}, after ${onR?.boxes}; words "${onW}"`, [S('08a-bridge-on')])
    await shot(w, S('08a-bridge-on'))
    const lb2 = await lockViaBridge(w, false); await P.waitForTimeout(500)
    const offR = await balRow(P, 'bane')
    rec('8b lockViaBridge(off)', size, lb2.ok && offR?.boxes > 0 && !(await vis(P, T('bal-locked'))) ? 'PASS' : 'FAIL', `helper ${JSON.stringify(lb2)}; boxes ${offR?.boxes}`)
    /* under an open box: he types 14, no Enter; the lock lands */
    await typeInBox(w, T('bal-LVE-bane'), 14, false)
    const typing = await P.locator(T('bal-LVE-bane')).inputValue().catch(() => null)
    const lb3 = await lockViaBridge(w, true); await P.waitForTimeout(700)
    const toast = await P.evaluate(() => [...document.querySelectorAll('.toast, [role="status"], [role="alert"]')].filter(e => e.getBoundingClientRect().width > 0).map(e => e.textContent.replace(/\s+/g, ' ').trim()).filter(Boolean))
    const r8 = await balRow(P, 'bane')
    rec('8c the lock lands under his open box', size, lb3.ok && r8?.boxes === 0 ? 'PASS' : 'FAIL', `box read "${typing}" before; after: boxes ${r8?.boxes}, figures ${r8?.readOnly?.join(' ')}; notes on screen: ${toast.join(' | ') || 'none'}`, [S('08c-lock-under-box')])
    await shot(w, S('08c-lock-under-box'))
    await lockViaBridge(w, false); await P.waitForTimeout(400)
    rec('8d after: App bal unchanged (the typed 14 refused)', size, (await balRow(P, 'bane'))?.app === '15' ? 'PASS' : 'FAIL', `App bal ${(await balRow(P, 'bane'))?.app}`)

    /* 9 — the clock to 1 Jan 2027, through a reload; back to 25 Jan 2026 */
    const signedOut = await reloadAt(w, '2027-01-01')
    if (signedOut) { await L.signIn(w, 'member'); await P.evaluate(() => window.lwSetMemberToday('2027-01-01')) }
    else { await L.openWar(w, 'member'); await P.evaluate(() => window.lwSetMemberToday('2027-01-01')) }
    await openBalances(w)
    const r9 = await balRow(P, 'bane')
    const period9 = await P.locator(T('war-picker')).evaluate(s => s.options[s.selectedIndex]?.textContent).catch(() => null)
    rec('9a today 1 Jan 2027 (after a reload)', size, r9 && r9.app !== '15' ? 'PASS' : 'FAIL', `reload signed him out: ${signedOut}; period on screen "${period9}"; Ranger ${JSON.stringify(r9)}`, [S('09a-2027')])
    await shot(w, S('09a-2027'))
    await P.evaluate(() => window.lwSetMemberToday('2026-01-25'))
    await L.openGrid(w); await openBalances(w)
    const r9b = await balRow(P, 'bane')
    rec('9b back to 25 Jan 2026', size, r9b?.app === '15' ? 'PASS' : 'FAIL', `Ranger ${JSON.stringify(r9b)}`, [S('09b-back')])
    await shot(w, S('09b-back'))

    /* 10 — My leave (Ranger): his own window; ✕ */
    await L.openGrid(w)
    const mlVis = await vis(P, T('my-leave'))
    const ml = await txt(P, T('my-leave'))
    if (!mlVis) rec('10 My leave', size, 'NOT WALKED', `My leave not visible on the grid (text "${ml}")`, [S('10-myleave')])
    else {
      await step(w, S('10-myleave'), T('my-leave'))
      const own = await pwRead(P)
      rec('10a My leave opens his own window, on the screen', size, own && /Ranger/.test(own.name) && onScreen(own) ? 'PASS' : 'FAIL', `My leave read "${ml}"; window top ${own?.box.top} of a ${own?.vh} screen, left ${own?.box.left}, right ${own?.box.right}; ${JSON.stringify(own && { ...own, box: undefined, lines: own.lines.length + ' lines' })}`, [S('10-myleave')])
      const how10 = await closePw(w)
      rec('10b the window closes', size, !(await vis(P, T('person-window'))) ? 'PASS' : 'FAIL', `closed by ${how10}`, [S('10b-closed')])
      await shot(w, S('10b-closed'))
    }
  } catch (e) {
    rec('ERROR', size, 'FAIL', String(e).slice(0, 400), [S('error')])
    await shot(w, S('error')).catch(() => {})
  }
  rec('errors', size, w.errs.length ? 'FAIL' : 'PASS', w.errs.length ? w.errs.join(' || ').slice(0, 900) : 'no console error, page error or 4xx')
  await w.ctx.close()
}
L.writeResults('probe')
await L.closeBrowser()
console.log('DONE')
