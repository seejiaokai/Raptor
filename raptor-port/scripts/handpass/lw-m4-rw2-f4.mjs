// Re-walk 2 F4 — "Pick dates…" open, a press on a line's Approve (M4): the calendar closes, NOTHING is decided; press again: that line only. Phone by finger, desktop by mouse.
process.env.LW_OUT ||= '../../docs/img/handpass/2026-10-27-lw-m4/rewalk2'
const B = await import('./lw-m4-walk-b-lib.mjs')
const { L, T, shot, rec } = B
console.log('[lw-m4-rw2-f4 v1]')
async function run(kind) {
  const w = kind === 'phone' ? await B.newPhone(402, 874, 'chromium') : await L.newCtx('desk')
  const P = w.page, tag = 'f4' + (kind === 'phone' ? 'p' : 'd')
  const snap = () => P.evaluate(() => ({
    head: document.querySelector('[data-testid="appr-sub"]')?.innerText.replace(/\s+/g, ' ').trim(),
    all: document.querySelector('[data-testid="appr-approve-all"]')?.innerText.replace(/\s+/g, ' ').trim(),
    tab: document.querySelector('[data-testid="lw-approvals-count"]')?.innerText.trim(),
    lines: [...document.querySelectorAll('[data-testid="approvals-page"] .appr-line')].filter(e => e.getBoundingClientRect().height > 0).map(e => e.className.match(/lit-(\w+)/)?.[1] || '-').join(',')
  }))
  try {
    await L.signIn(w, 'admin'); await L.openApprovals(w); await P.evaluate(() => window.scrollTo(0, 0)); await P.waitForTimeout(300)
    const s0 = await snap(); console.log(kind, 'start', JSON.stringify(s0))
    await L.press(w, T('appr-pick'), kind === 'phone' ? tag + '-pick-q' : null); await P.waitForTimeout(700); await shot(w, `${tag}-1-pick-open`)
    const open0 = await L.vis(P, T('appr-range'))
    // choose the line whose Approve is under the picker (else the first)
    const info = await P.evaluate(() => {
      const rg = document.querySelector('[data-testid="appr-range"]').getBoundingClientRect()
      const ls = [...document.querySelectorAll('[data-testid="approvals-page"] .appr-line')].filter(e => e.getBoundingClientRect().height > 0)
      let pick = 0
      ls.forEach((l, i) => { const r = l.querySelector('.appr-ok').getBoundingClientRect(); const cx = r.left + r.width / 2, cy = r.top + r.height / 2; if (pick === 0 && cx > rg.left && cx < rg.right && cy > rg.top && cy < rg.bottom) pick = i })
      ls[pick].setAttribute('data-walk', 'tgt')
      const b = ls[pick].querySelector('.appr-ok'), r = b.getBoundingClientRect(); const h = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2)
      return { idx: pick, n: ls.length, text: ls[pick].innerText.replace(/\s+/g, ' ').trim(), covered: !(b === h || b.contains(h)), over: h ? h.tagName + '.' + String(h.className).slice(0, 30) : null, rg: [rg.left, rg.top, rg.right, rg.bottom].map(Math.round) }
    })
    console.log(kind, 'target', JSON.stringify(info))
    const c = await L.centre(P, '[data-walk="tgt"] .appr-ok')
    await L.finger(w, c.x, c.y, kind === 'phone' ? tag + '-2-press-behind-q' : null); await P.waitForTimeout(800); await shot(w, `${tag}-2-after-first-press`)
    const open1 = await L.vis(P, T('appr-range')); const s1 = await snap()
    console.log(kind, 'after first press', open1, JSON.stringify(s1))
    rec(`F4${kind[0]}.1 ${kind}: Pick dates open, press a line's Approve: calendar closes, nothing decided`, kind, open0 && !open1 && s1.lines === s0.lines && s1.head === s0.head && s1.all === s0.all && s1.tab === s0.tab && !/lit/.test(s1.lines.replace(/-/g, '')) ? 'PASS' : (open0 ? 'FAIL' : 'NOT WALKED'),
      `picker open ${open0} -> ${open1}; target line under picker: ${info.covered} (${info.over}); before ${JSON.stringify(s0)} after ${JSON.stringify(s1)}`, kind === 'phone' ? [`${tag}-1-pick-open`, `${tag}-2-press-behind-q`, `${tag}-2-after-first-press`] : [`${tag}-1-pick-open`, `${tag}-2-after-first-press`])
    // press again
    const c2 = await L.centre(P, '[data-walk="tgt"] .appr-ok')
    await L.finger(w, c2.x, c2.y, kind === 'phone' ? tag + '-3-press-again-q' : null); await P.waitForTimeout(700); await shot(w, `${tag}-3-after-second-press`)
    const s2 = await snap(); console.log(kind, 'after second press', JSON.stringify(s2))
    const litIdx = s2.lines.split(',').map((x, i) => x === 'approved' ? i : -1).filter(i => i >= 0)
    rec(`F4${kind[0]}.2 ${kind}: press again: that line, and only it, is approved`, kind, litIdx.length === 1 && litIdx[0] === info.idx && s2.lines.split(',').filter(x => x !== '-').length === 1 ? 'PASS' : 'FAIL',
      `lit lines ${s2.lines} (target index ${info.idx}); head ${s0.head} -> ${s2.head}; Approve all "${s2.all}"`, kind === 'phone' ? [`${tag}-3-press-again-q`, `${tag}-3-after-second-press`] : [`${tag}-3-after-second-press`])
  } catch (e) { rec('ERROR ' + kind, kind, 'FAIL', String(e).slice(0, 400)); await shot(w, tag + '-error').catch(() => {}) }
  if (w.errs.length) rec('console ' + kind, kind, 'FAIL', w.errs.join(' || ').slice(0, 400))
  await w.ctx.close()
}
await run('phone')
await run('desk')
L.writeResults('f4'); await B.closeAll(); console.log('DONE')
