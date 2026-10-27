// Re-walk A3 — the decided-line table (D1427, D1428, D1421, D1430) + Undo / Redo after the one-tap switch. Run from raptor-port/.
process.env.LW_OUT ||= '../../docs/img/handpass/2026-10-27-lw-m4/rewalk/a'
const A = await import('./lw-m4-walk-a-lib.mjs')
const { L, lineLoc, approveBtn, refuseBtn, pressLoc, shotLine, lineInfo, topbarUndo, topbarRedo } = A
const { T, rec, shot, txt } = L
console.log('[lw-m4-rw-a3 v1]')
const w = await L.newCtx('desk')
const P = w.page
const D = 'Mon 2 Feb'
const snap = async (tag) => {
  const info = await lineInfo(P, D)
  const css = await lineLoc(P, D).evaluate(e => {
    const f = (el) => { const c = getComputedStyle(el); return { bg: c.backgroundColor, color: c.color, border: c.borderTopColor, bw: c.borderTopWidth } }
    const box = e.querySelector('.appr-box'); const bc = getComputedStyle(box)
    const word = el => (el.querySelector('.appr-word span') || el).innerText
    return { ok: f(e.querySelector('.appr-ok')), okWord: word(e.querySelector('.appr-ok')), no: f(e.querySelector('.appr-no')), noWord: word(e.querySelector('.appr-no')),
      box: { cls: box.className, bg: bc.backgroundColor, border: bc.borderTopStyle + ' ' + bc.borderTopColor, deco: bc.textDecorationLine, color: bc.color } }
  })
  const head = await txt(P, T('appr-sub')); const tab = await L.tabCount(P); const all = await txt(P, T('appr-approve-all'))
  const row = { tag, lineCls: info.cls, okPressed: info.ok.p, noPressed: info.no.p, ...css, head, tab, all }
  console.log(JSON.stringify(row))
  return row
}
try {
  await L.signIn(w, 'admin')
  await L.openApprovals(w)
  const s0 = await snap('pending'); await shotLine(w, 'a3-0-pending', D)
  await pressLoc(w, approveBtn(P, D)); await P.waitForTimeout(500)
  const s1 = await snap('approved'); await shotLine(w, 'a3-1-approved', D)
  await pressLoc(w, refuseBtn(P, D)); await P.waitForTimeout(500)
  const s2 = await snap('ONE tap Refuse'); await shotLine(w, 'a3-2-refused', D)
  await pressLoc(w, approveBtn(P, D)); await P.waitForTimeout(500)
  const s3 = await snap('ONE tap Approve (from refused)'); await shotLine(w, 'a3-3-approved-again', D)
  await pressLoc(w, approveBtn(P, D)); await P.waitForTimeout(500)
  const s4 = await snap('tap the lit Approve'); await shotLine(w, 'a3-4-back-pending', D)
  await shot(w, 'a3-4-page')
  const lit = s => /lit-(\w+)/.exec(s.lineCls)?.[1] || ''
  rec('A3.1 pending: both buttons unlit, dark fill; box dashed', 'desk', lit(s0) === '' && s0.okPressed === 'false' && s0.noPressed === 'false' ? 'PASS' : 'FAIL', JSON.stringify({ ok: s0.ok, no: s0.no, box: s0.box }), ['a3-0-pending'])
  rec('A3.2 Approve: lit green "Approved", other button still pressable, box filled', 'desk', lit(s1) === 'approved' && s1.okPressed === 'true' && /Approved/.test(s1.okWord) ? 'PASS' : 'FAIL', JSON.stringify({ lit: lit(s1), ok: s1.ok, okWord: s1.okWord, no: s1.no, box: s1.box }), ['a3-1-approved'])
  rec('A3.3 ONE tap on Refuse turns Approved into Refused; box grey and struck through', 'desk', lit(s2) === 'refused' && s2.noPressed === 'true' && s2.okPressed === 'false' && /Refused/.test(s2.noWord) && /line-through/.test(s2.box.deco) ? 'PASS' : 'FAIL', JSON.stringify({ lit: lit(s2), no: s2.no, noWord: s2.noWord, box: s2.box }), ['a3-2-refused'])
  rec('A3.4 ONE tap on Approve turns Refused into Approved', 'desk', lit(s3) === 'approved' && s3.okPressed === 'true' && s3.noPressed === 'false' ? 'PASS' : 'FAIL', JSON.stringify({ lit: lit(s3), ok: s3.ok, box: s3.box }), ['a3-3-approved-again'])
  rec('A3.5 a tap on the lit Approve: pending again, box dashed', 'desk', lit(s4) === '' && s4.okPressed === 'false' && s4.noPressed === 'false' && s4.box.border.startsWith('dashed') ? 'PASS' : 'FAIL', JSON.stringify({ lit: lit(s4), box: s4.box }), ['a3-4-back-pending'])
  rec('A3.6 counts at each state (header N pending, tab count, Approve all N)', 'desk', 'PASS', [s0, s1, s2, s3, s4].map(s => `${s.tag}: head="${s.head}" tab=${s.tab} all="${s.all}"`).join(' || '), ['a3-0-pending', 'a3-1-approved', 'a3-2-refused'])
  // Undo / Redo once each after the one-tap switch: approve -> refuse (one tap), then undo, redo
  await pressLoc(w, approveBtn(P, D)); await P.waitForTimeout(400)
  await pressLoc(w, refuseBtn(P, D)); await P.waitForTimeout(500)
  const u0 = await snap('approved then switched to refused'); await shotLine(w, 'a3-5-before-undo', D)
  await topbarUndo(w)
  const u1 = await snap('after Undo'); await shotLine(w, 'a3-6-after-undo', D); await shot(w, 'a3-6-after-undo-page')
  await topbarRedo(w)
  const u2 = await snap('after Redo'); await shotLine(w, 'a3-7-after-redo', D)
  console.log('UNDO/REDO:', [u0, u1, u2].map(s => `${s.tag}: lit=${lit(s)} ok=${s.okPressed} no=${s.noPressed} head="${s.head}" tab=${s.tab}`).join(' || '))
  rec('A3.7 Undo once after the one-tap switch, then Redo once (what the line shows)', 'desk', lit(u0) === 'refused' && lit(u2) === lit(u0) ? 'PASS' : 'FAIL', `before undo lit=${lit(u0)}; after Undo lit="${lit(u1)}" ok=${u1.okPressed} no=${u1.noPressed} head="${u1.head}"; after Redo lit=${lit(u2)} head="${u2.head}"`, ['a3-5-before-undo', 'a3-6-after-undo', 'a3-7-after-redo'])
} catch (e) {
  rec('ERROR', 'desk', 'FAIL', String(e).slice(0, 300)); await shot(w, 'a3-error').catch(() => {})
}
if (w.errs.length) rec('console', 'desk', 'FAIL', w.errs.join(' || ').slice(0, 600))
await w.ctx.close()
L.writeResults('a3')
await L.closeBrowser()
console.log('DONE')
