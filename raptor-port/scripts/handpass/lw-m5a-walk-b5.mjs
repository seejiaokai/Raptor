// Walker B, script 5: the member on a phone — his own row, the lock (through the localhost bridge: the stand-in for the admin), his writes, Undo under the lock.
process.env.LW_OUT ||= '../../docs/img/handpass/2026-10-28-lw-m5a/b'
const B = await import('./lw-m5a-walk-b-lib.mjs')
const { L, T, rec, shot, press, openBalances, balRow, pwRead, closePw, vis, reloadAt, typeInBox, lockViaBridge, where, tabRow } = B
console.log('[lw-m5a-walk-b5 v1]')
const w = await L.newCtx('phone')
const P = w.page
const S = async (name, fn) => { try { await fn() } catch (e) { rec(name, '402', 'NOTE', 'STOPPED: ' + String(e).slice(0, 250), []); await shot(w, 'err-' + name.replace(/\W+/g, '-')).catch(() => {}) } }
const notes = () => P.evaluate(() => [...document.querySelectorAll('.toast, [role="status"], [role="alert"], .note')].filter(e => e.getBoundingClientRect().width > 0).map(e => e.textContent.replace(/\s+/g, ' ').trim()).filter(Boolean))
const bar = () => P.evaluate(() => { const r = document.querySelector('[data-testid="bal-locked"]')?.getBoundingClientRect(); const bb = document.querySelector('.bp-bar')?.getBoundingClientRect(); const c = document.querySelector('.bp-cols')?.getBoundingClientRect(); return { lockedLine: r ? { t: Math.round(r.top), b: Math.round(r.bottom) } : null, bar: bb ? { t: Math.round(bb.top), b: Math.round(bb.bottom) } : null, cols: c ? { t: Math.round(c.top) } : null } })
await L.signIn(w, 'member')
await S('m1-unlocked', async () => {
  await openBalances(w)
  await shot(w, 'r1-member-unlocked')
  const tr = await tabRow(P)
  const me = await balRow(P, 'bane'), other = await balRow(P, 'stiff')
  const ctl = { grades: await vis(P, T('bal-grades')), lock: await vis(P, T('bal-lock')), search: await vis(P, T('bal-search-open')) }
  rec('1/42 member, unlocked: his own row in boxes, others read only; no Grades, no lock', '402', me.boxes === 7 && other.boxes === 0 && !ctl.grades && !ctl.lock && tr.tabs.length === 3 && !tr.gear ? 'PASS' : 'FAIL', `his row boxes ${me.boxes}, Saber's row boxes ${other.boxes} (figures ${other.readOnly.join(' ')}); his grade "${me.grade}" (button? ${await P.locator(T('bal-grade-bane')).count()}); controls ${JSON.stringify(ctl)}; tabs ${tr.tabs.map(t => t.label + (t.icon ? '+icon' : '')).join(' · ')}, gear ${tr.gear ? 'SHOWN' : 'none'}`, ['r1-member-unlocked'])
  /* a tap on his grade words opens nothing */
  const gd = P.locator('[data-testid="bal-row-bane"] .bp-gd').first()
  await gd.scrollIntoViewIfNeeded(); const c = await gd.boundingBox()
  await L.finger(w, c.x + c.width / 2, c.y + c.height / 2, 'r1-grade-tap-q'); await P.waitForTimeout(500)
  await shot(w, 'r1-grade-tap')
  rec('42 a tap on his grade words opens no list', '402', !(await vis(P, T('bal-grade-list'))) ? 'PASS' : 'FAIL', `list shown: ${await vis(P, T('bal-grade-list'))}; person window opened: ${await vis(P, T('person-window'))}`, ['r1-grade-tap-q', 'r1-grade-tap'])
  if (await vis(P, T('person-window'))) await closePw(w)
})
await S('m4-write', async () => {
  /* 45: his own write: LVE 21 incl. 3 and CL 2, then reload and read as Saber */
  await typeInBox(w, T('bal-LVE-bane'), 21)
  await typeInBox(w, T('bal-cf-bane'), 3)
  await P.evaluate(() => { document.querySelector('[data-testid="bal-scroll"]').scrollTo(416, 0) }); await P.waitForTimeout(400)
  await typeInBox(w, T('bal-CL-bane'), 2)
  const r = await balRow(P, 'bane'); await shot(w, 'r2-member-wrote')
  rec('45 member types LVE 21, carried 3, CL 2', '402', r.app === '21' && r.cf === '3' && /^2/.test(r.CL) ? 'PASS' : 'FAIL', `${JSON.stringify(r)}; notes ${(await notes()).join(' | ')}`, ['r2-member-wrote'])
  const so = await reloadAt(w, process.env.LW_TODAY)
  await L.signIn(w, 'admin'); await openBalances(w)
  const ra = await balRow(P, 'bane'); await shot(w, 'r2-admin-reads')
  rec('45 after a reload, Saber reads Ranger\'s row', '402', ra.app === '21' && ra.cf === '3' && /^2/.test(ra.CL) ? 'PASS' : 'FAIL', `signed out by reload: ${so}; ${JSON.stringify(ra)}`, ['r2-admin-reads'])
  await L.switchTo(w, 'member'); await openBalances(w)
})
await S('m5-undo-under-lock', async () => {
  /* 46: his typing, Undo, Redo; then the lock; his Undo refused with its reason; unlock; the same Undo accepted */
  await typeInBox(w, T('bal-LVE-bane'), 22)
  const a = await balRow(P, 'bane')
  await L.undo(w); const b = await balRow(P, 'bane')
  await L.redo(w); const c = await balRow(P, 'bane')
  rec('46 member: type 22, Undo, Redo (unlocked)', '402', a.app === '22' && b.app === '21' && c.app === '22' ? 'PASS' : 'FAIL', `typed ${a.app}, Undo ${b.app}, Redo ${c.app}`, [])
  const lb = await lockViaBridge(w, true); await P.waitForTimeout(600)
  await L.undo(w)
  const d = await balRow(P, 'bane'); const nt = await notes(); await shot(w, 'r3-undo-while-locked')
  rec('46 his Undo while locked is refused, with its reason', '402', 'NOT WALKED', `SET-UP LIMIT: the bridge's lock is written as a step in HIS OWN undo list, so his Undo meets the lock step first and the app answers that; the real case (the lock in the admin's list, his earlier figure under it) cannot be built. bridge ${JSON.stringify(lb)}; read-only figures ${(await balRow(P, 'bane')).readOnly.join(' ')}; notes on screen: ${nt.join(' | ') || 'none'}; boxes ${d.boxes}`, ['r3-undo-while-locked'])
  await lockViaBridge(w, false); await P.waitForTimeout(600)
  await L.undo(w); const e = await balRow(P, 'bane'); await shot(w, 'r3-undo-after-unlock')
  rec('46 unlocked again: the same Undo is accepted', '402', 'NOT WALKED', `App bal ${e.app}; notes ${(await notes()).join(' | ')}`, ['r3-undo-after-unlock'])
})
await S('m2-locked', async () => {
  const lb = await lockViaBridge(w, true); await P.waitForTimeout(700)
  await shot(w, 'r4-member-locked')
  const me = await balRow(P, 'bane'); const words = await P.evaluate(() => document.querySelector('[data-testid="bal-locked"]')?.textContent.trim()); const bp = await bar()
  rec('1/5 member locked: all read only, "Locked by admin" on a slim line under the bar', '402', lb.ok && me.boxes === 0 && /Locked by admin/.test(words || '') && bp.lockedLine && bp.lockedLine.t >= bp.bar.b - 2 && bp.lockedLine.b <= bp.cols.t + 1 ? 'PASS' : 'FAIL', `words "${words}"; line y ${bp.lockedLine?.t}-${bp.lockedLine?.b}, page bar ends ${bp.bar?.b}, heading row starts ${bp.cols?.t}; his figures ${me.readOnly.join(' ')}`, ['r4-member-locked'])
  /* it appeared live, without reopening: also the boxes back live */
  await lockViaBridge(w, false); await P.waitForTimeout(600)
  const me2 = await balRow(P, 'bane')
  rec('44 unlock arrives live: his boxes come back without reopening the page', '402', me2.boxes === 7 && !(await vis(P, T('bal-locked'))) ? 'PASS' : 'FAIL', `boxes ${me2.boxes}; locked line shown ${await vis(P, T('bal-locked'))}`, [])
  /* 44: the lock lands under a typed figure with the keyboard up */
  await press(w, T('bal-LVE-bane')); await P.waitForTimeout(650); await P.keyboard.press('Control+A'); await P.keyboard.type('16', { delay: 30 })
  const dirty = await P.locator(T('bal-LVE-bane')).getAttribute('data-dirty')
  await lockViaBridge(w, true); await P.waitForTimeout(800)
  const nt = await notes(); const me3 = await balRow(P, 'bane'); await shot(w, 'r4-lock-under-box')
  const noteBox = await P.evaluate(() => { const e = [...document.querySelectorAll('.toast, [role="status"], [role="alert"]')].find(x => x.getBoundingClientRect().width > 0); if (!e) return null; const r = e.getBoundingClientRect(); return { t: Math.round(r.top), b: Math.round(r.bottom), l: Math.round(r.left), r: Math.round(r.right), vh: innerHeight } })
  rec('44 the lock lands under a typed figure (16, no Enter): refusal shown where he can read it, 16 not saved', '402', nt.some(x => /Locked by admin/.test(x)) && me3.boxes === 0 && me3.readOnly[0] === '22' ? 'PASS' : 'FAIL', `data-dirty was ${dirty}; boxes after ${me3.boxes}; read-only App bal ${me3.readOnly[0]}; notes ${nt.join(' | ') || 'none'}; note box ${JSON.stringify(noteBox)}; his real Enter has no box left to be pressed in (the box goes)`, ['r4-lock-under-box'])
  await lockViaBridge(w, false); await P.waitForTimeout(500)
})
await S('m6-line-bars', async () => {
  /* the leave lines of his own window: what marks each line (the cyan bar at the left on every line?) and where the window stands against the bar */
  await L.openGrid(w)
  await press(w, T('my-leave')); await P.waitForTimeout(700)
  const m = await P.evaluate(() => {
    const pw = document.querySelector('[data-testid="person-window"]'); const out = {}
    out.lines = [...pw.querySelectorAll('[data-testid^="pw-line-"]')].filter(e => !/-(dot|who)$/.test(e.dataset.testid)).map(e => { const cs = getComputedStyle(e); const go = e.querySelector('button.ll-go'); return { id: e.dataset.testid.slice(8), borderLeft: cs.borderLeftWidth + ' ' + cs.borderLeftColor, boxShadow: cs.boxShadow.slice(0, 60), cls: e.className, dot: !!e.querySelector('.m5-dot'), goBtn: !!go } })
    const r = pw.getBoundingClientRect(); const tb = document.querySelector('.topbar')?.getBoundingClientRect()
    out.win = { t: Math.round(r.top), b: Math.round(r.bottom) }; out.topbar = tb ? { t: Math.round(tb.top), b: Math.round(tb.bottom) } : null
    return out
  })
  await shot(w, 'r5-own-window')
  rec('14 own window: the marks on every leave line, and the window against the top bar', '402', 'NOTE', JSON.stringify(m), ['r5-own-window'])
  /* a tap on a line takes the grid there with the ring */
  const first = await P.evaluate(() => { const l = [...document.querySelectorAll('[data-testid="person-window"] button.ll-go')][0]; if (!l) return null; const r = l.getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2, text: l.textContent.trim() } })
  if (first) {
    await L.finger(w, first.x, first.y, 'r5-line-tap-q'); await P.waitForTimeout(900); await shot(w, 'r5-line-tap')
    rec('14 a tap on a leave line takes the grid there', '402', 'NOTE', `pressed "${first.text}"; window still open: ${await vis(P, T('person-window'))}; grid tab selected: ${await P.locator(T('lw-tab-grid')).getAttribute('aria-selected')}; ring on a day: ${await P.evaluate(() => !!document.querySelector('.just-added, .lw-ring, [class*="ring"]'))}`, ['r5-line-tap-q', 'r5-line-tap'])
  }
  await closePw(w).catch(() => {})
})
rec('errors', '402', w.errs.length ? 'FAIL' : 'PASS', B.errsOf(w), [])
L.writeResults('b5')
await w.ctx.close(); await L.closeBrowser()
