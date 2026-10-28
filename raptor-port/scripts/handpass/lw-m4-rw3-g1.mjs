// Re-walk 3 G1 — phone by finger, "Pick dates…" open: held press, empty band, strip right of the calendar (440), Grid tab, Approve tap.
process.env.LW_OUT ||= '../../docs/img/handpass/2026-10-27-lw-m4/rewalk3'
const B = await import('./lw-m4-walk-b-lib.mjs')
const { L, T, shot, rec } = B
console.log('[lw-m4-rw3-g1 v1]')
const snapOf = P => P.evaluate(() => ({
  head: document.querySelector('[data-testid="appr-sub"]')?.innerText.replace(/\s+/g, ' ').trim(),
  all: document.querySelector('[data-testid="appr-approve-all"]')?.innerText.replace(/\s+/g, ' ').trim(),
  tab: document.querySelector('[data-testid="lw-approvals-count"]')?.innerText.trim(),
  open: !!document.querySelector('[data-testid="appr-range"]') && document.querySelector('[data-testid="appr-range"]').getBoundingClientRect().height > 0,
  page: !!document.querySelector('[data-testid="approvals-page"]') && document.querySelector('[data-testid="approvals-page"]').getBoundingClientRect().height > 0,
  lines: [...document.querySelectorAll('[data-testid="approvals-page"] .appr-line')].filter(e => e.getBoundingClientRect().height > 0).map(e => e.className.match(/lit-(\w+)/)?.[1] || '-').join(',')
}))
const same = (a, b) => a.head === b.head && a.all === b.all && a.tab === b.tab && a.lines === b.lines
async function hold(w, x, y, ms = 1000) {
  await w.cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] })
  await w.page.waitForTimeout(ms)
  await w.cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
}
async function openPick(w) {
  const P = w.page
  if ((await snapOf(P)).open) return
  await P.evaluate(() => window.scrollTo(0, 0)); await P.waitForTimeout(250)
  await B.press(w, T('appr-pick')); await P.waitForTimeout(700)
}
async function toApprovals(w) {
  const P = w.page
  if (!(await snapOf(P)).page) { await B.openApprovals(w) }
  await P.evaluate(() => window.scrollTo(0, 0)); await P.waitForTimeout(250)
}
const firstOk = P => P.evaluate(() => { const l = [...document.querySelectorAll('[data-testid="approvals-page"] .appr-line')].filter(e => e.getBoundingClientRect().height > 0)[0]; const b = l.querySelector('.appr-ok').getBoundingClientRect(), n = l.querySelector('.appr-no').getBoundingClientRect(); return { x: b.left + b.width / 2, y: b.top + b.height / 2, nx: (n.left + n.right) / 2, ny: (n.top + n.bottom) / 2, text: l.innerText.replace(/\s+/g, ' ').trim().slice(0, 40) } })

async function run(width) {
  const w = await B.newPhone(width, 874, 'chromium'); const P = w.page; const tag = `g1-${width}`
  try {
    await L.signIn(w, 'admin'); await B.openApprovals(w); await P.evaluate(() => window.scrollTo(0, 0)); await P.waitForTimeout(300)
    const s0 = await snapOf(P); console.log(width, 'start', JSON.stringify(s0))
    await shot(w, `${tag}-0-start`)
    if (width === 402) {
      // (a) held press one second on line 1's Approve
      await openPick(w); await shot(w, `${tag}-a-1-open`)
      const f = await firstOk(P); console.log('first Approve', JSON.stringify(f))
      const sa0 = await snapOf(P)
      await hold(w, f.x, f.y, 1000); await P.waitForTimeout(100); await shot(w, `${tag}-a-2-just-lifted`); await P.waitForTimeout(900); await shot(w, `${tag}-a-3-settled`)
      const sa = await snapOf(P); console.log('(a) after', JSON.stringify(sa))
      rec('G1a held 1 s on a line\'s Approve then lifted: nothing decided', 'phone402', same(s0, sa) && sa0.open ? 'PASS' : 'FAIL', `open ${sa0.open} -> ${sa.open}; before ${JSON.stringify(s0)}; after ${JSON.stringify(sa)}`, [`${tag}-a-1-open`, `${tag}-a-2-just-lifted`, `${tag}-a-3-settled`])
      // (b) empty band under the calendar at line 1's Approve x
      await toApprovals(w); await openPick(w)
      const g = await P.evaluate(() => { const c = document.querySelector('[data-testid="appr-range"]').parentElement.getBoundingClientRect(); const l = [...document.querySelectorAll('[data-testid="approvals-page"] .appr-line')].filter(e => e.getBoundingClientRect().height > 0)[0].getBoundingClientRect(); return { cb: c.bottom, lt: l.top } })
      const f2 = await firstOk(P)
      const by = (g.cb + g.lt) / 2
      const hit = await P.evaluate(({ x, y }) => { const h = document.elementFromPoint(x, y); return h ? h.tagName + '.' + String(h.className).slice(0, 40) : null }, { x: f2.x, y: by })
      console.log('(b) band', JSON.stringify(g), 'point', f2.x, by, 'hit', hit)
      await shot(w, `${tag}-b-1-open`)
      await B.tapAt(w, f2.x, by, `${tag}-b-2-q`); await P.waitForTimeout(900); await shot(w, `${tag}-b-3-settled`)
      const sb = await snapOf(P); console.log('(b) after', JSON.stringify(sb))
      rec('G1b tap on the empty band under the calendar at line 1 Approve x: nothing decided', 'phone402', same(s0, sb) ? 'PASS' : 'FAIL', `tap at (${Math.round(f2.x)},${Math.round(by)}) on ${hit}; open -> ${sb.open}; after ${JSON.stringify(sb)}`, [`${tag}-b-1-open`, `${tag}-b-2-q`, `${tag}-b-3-settled`])
    } else {
      // (c) at 440: strip right of the calendar where line 1's buttons will stand
      await openPick(w); await shot(w, `${tag}-c-1-open`)
      const rg = await P.evaluate(() => { const r = document.querySelector('[data-testid="appr-range"]').parentElement.getBoundingClientRect(); return { l: r.left, t: r.top, r: r.right, b: r.bottom } })
      await B.press(w, T('appr-pick')); await P.waitForTimeout(600)
      const fc = await firstOk(P) // where the buttons stand with the calendar closed
      await shot(w, `${tag}-c-2-closed`)
      await B.press(w, T('appr-pick')); await P.waitForTimeout(700)
      const x = Math.min(width - 6, (rg.r + width) / 2 + 10), y = fc.y
      const hit = await P.evaluate(({ x, y }) => { const h = document.elementFromPoint(x, y); return h ? h.tagName + '.' + String(h.className).slice(0, 40) : null }, { x, y })
      console.log('(c) calendar card', JSON.stringify(rg), 'buttons closed at', Math.round(fc.x), Math.round(fc.y), 'Refuse centre', Math.round(fc.nx), 'tap', Math.round(x), Math.round(y), 'hit', hit)
      const sc0 = await snapOf(P); await shot(w, `${tag}-c-3-open-again`)
      await B.tapAt(w, x, y, `${tag}-c-4-q`); await P.waitForTimeout(900); await shot(w, `${tag}-c-5-settled`)
      const sc = await snapOf(P); console.log('(c) after', JSON.stringify(sc))
      rec('G1c at 440, tap on the strip right of the calendar where line 1 buttons will stand: nothing decided', 'phone440', same(s0, sc) && sc0.open ? 'PASS' : 'FAIL', `strip x ${Math.round(x)}, card right ${Math.round(rg.r)}; tap on ${hit}; open ${sc0.open} -> ${sc.open}; after ${JSON.stringify(sc)}`, [`${tag}-c-1-open`, `${tag}-c-2-closed`, `${tag}-c-4-q`, `${tag}-c-5-settled`])
    }
    if (width === 402) {
      // (d) the Grid tab: calendar closes AND Grid opens in one tap
      await toApprovals(w); await openPick(w); await shot(w, `${tag}-d-1-open`)
      const sd0 = await snapOf(P)
      await B.tapAt(w, 59, 75, `${tag}-d-2-q`); await P.waitForTimeout(900); await shot(w, `${tag}-d-3-settled`)
      const sd = await snapOf(P)
      const gridOn = await P.evaluate(() => { const c = document.querySelector('[data-testid^="cell-"]'); return !!c && c.getBoundingClientRect().height > 0 })
      const gridTabNow = await P.evaluate(() => document.querySelector('[data-testid="lw-tab-grid"]')?.className + '|' + document.querySelector('[data-testid="lw-tab-grid"]')?.getAttribute('aria-selected'))
      console.log('(d) after', JSON.stringify(sd), 'grid cells visible', gridOn, gridTabNow)
      rec('G1d tap on the Grid tab with the calendar open: calendar closes AND Grid opens in that one tap', 'phone402', sd0.open && !sd.page && gridOn ? 'PASS' : 'FAIL', `before open ${sd0.open}; after approvals page showing ${sd.page}, calendar ${sd.open}, grid cells visible ${gridOn}, tab ${gridTabNow}`, [`${tag}-d-1-open`, `${tag}-d-2-q`, `${tag}-d-3-settled`])
      // (e) a tap on a line's Approve: calendar closes, nothing decided; the next tap decides that line only
      await B.openApprovals(w); await P.evaluate(() => window.scrollTo(0, 0)); await P.waitForTimeout(250)
      const se0 = await snapOf(P)
      await openPick(w); await shot(w, `${tag}-e-1-open`)
      const fe = await firstOk(P)
      await B.tapAt(w, fe.x, fe.y, `${tag}-e-2-q`); await P.waitForTimeout(900); await shot(w, `${tag}-e-3-after-first-tap`)
      const se1 = await snapOf(P); console.log('(e) after first tap', JSON.stringify(se1))
      rec('G1e first tap on a line\'s Approve with the calendar open: calendar closes, nothing decided', 'phone402', same(se0, se1) && !se1.open ? 'PASS' : 'FAIL', `open -> ${se1.open}; before ${JSON.stringify(se0)}; after ${JSON.stringify(se1)}`, [`${tag}-e-1-open`, `${tag}-e-2-q`, `${tag}-e-3-after-first-tap`])
      const fe2 = await firstOk(P)
      await B.tapAt(w, fe2.x, fe2.y, `${tag}-e-4-q`); await P.waitForTimeout(900); await shot(w, `${tag}-e-5-after-second-tap`)
      const se2 = await snapOf(P); console.log('(e) after second tap', JSON.stringify(se2), 'target', fe2.text)
      const lit = se2.lines.split(',').map((x, i) => x === 'approved' ? i : -1).filter(i => i >= 0)
      rec('G1e the next tap decides that line only', 'phone402', lit.length === 1 && lit[0] === 0 && se2.lines.split(',').filter(x => x !== '-').length === 1 ? 'PASS' : 'FAIL', `lines ${se2.lines} (target "${fe2.text}"); head ${se2.head}; Approve all "${se2.all}"; tab ${se2.tab}`, [`${tag}-e-4-q`, `${tag}-e-5-after-second-tap`])
    }
  } catch (e) { rec('ERROR ' + tag, 'phone' + width, 'FAIL', String(e).slice(0, 400)); await shot(w, tag + '-error').catch(() => {}) }
  if (w.errs.length) rec('console ' + tag, 'phone' + width, 'FAIL', w.errs.join(' || ').slice(0, 400))
  await w.ctx.close()
}
await run(402)
await run(440)
L.writeResults('g1'); await B.closeAll(); console.log('DONE')
