// Re-walk walker B, B8: the posting-out refusal (D1436) once on a phone. Trident's LL on 13-16 Apr 27 (2027 period); he is posted out
// from 1 Mar 27 (bid window's ... -> Post out; the outcome the sheet offers first, not SANS), through the app's own controls.
process.env.LW_OUT ||= '../../docs/img/handpass/2026-10-27-lw-m4/rewalk/b'
const B = await import('./lw-m4-walk-b-lib.mjs')
const { L, T, shot, rec } = B
console.log('[lw-m4-rw-b8 v2]')
const w = await B.newPhone(402, 874, 'chromium'); const P = w.page
const lineInfo = () => P.evaluate(() => {
  const l = document.querySelector('[data-testid="appr-line-harpoon"]'); if (!l) return null
  const ok = l.querySelector('.appr-ok'), no = l.querySelector('.appr-no')
  const st = b => ({ txt: b.innerText.trim(), cls: b.className, dis: b.disabled, p: b.getAttribute('aria-pressed') })
  return { text: l.innerText.replace(/\s+/g, ' ').trim(), cls: l.className, ok: st(ok), no: st(no), why: (l.querySelector('[data-testid="appr-why"]') || {}).innerText || null }
})
try {
  await B.signIn(w, 'admin')
  await B.openApprovals(w)
  await B.press(w, T('appr-elsewhere')); await B.sleep(w, 900)
  const before = await lineInfo()
  rec('B8 fixture: Trident\'s pending LL of 13-16 Apr 27 is in the 2027 list', 'phone', before ? 'PASS' : 'NOT WALKED', JSON.stringify(before), [])
  await B.openGrid(w); await B.sleep(w, 700)
  await L.openCell(w, 'harpoon', '2027-03-01')
  console.log('bid window up:', await B.vis(P, T('bid-picker')), (await B.txt(P, T('bid-picker')) || '').slice(0, 100))
  await B.press(w, T('bid-more')); await B.sleep(w, 500)
  await B.press(w, T('bid-postout')); await B.sleep(w, 800)
  console.log('sheet date', await B.txt(P, T('po-date')), '| line', await B.txt(P, T('po-line')))
  const sheet = await P.evaluate(() => { const e = document.querySelector('[data-testid="po-confirm"]'); let s = e; for (let i = 0; i < 6 && s && s.innerText.length < 60; i++) s = s.parentElement; return s ? s.innerText.replace(/\s+/g, ' ').slice(0, 300) : null })
  console.log('sheet:', sheet)
  await shot(w, 'b8-sheet')
  await B.press(w, T('po-confirm'), 'b8-confirm-q'); await B.sleep(w, 1000)
  for (let i = 0; i < 3 && ((await B.vis(P, T('bid-picker'))) || (await B.vis(P, T('po-confirm')))); i++) { await P.keyboard.press('Escape'); await B.sleep(w, 500) }
  await shot(w, 'b8-after-confirm')
  await P.evaluate(() => window.scrollTo(0, 0)); await B.sleep(w, 300)
  await B.openApprovals(w); await P.evaluate(() => window.scrollTo(0, 0)); await B.sleep(w, 300)
  console.log('view', await B.txt(P, T('period-label')))
  const pre = await lineInfo()
  await shot(w, 'b8-approvals-tagged')
  rec('B8 his line is tagged as posting out', 'phone', pre && /posting out|PO\b/i.test(pre.text) ? 'PASS' : 'FAIL', JSON.stringify(pre), ['b8-approvals-tagged.png'])
  /* Approve in Approvals: refused with its reason */
  await B.press(w, '[data-testid="appr-line-harpoon"] .appr-ok', 'b8-approve-q'); await B.sleep(w, 700); await shot(w, 'b8-approve')
  const a = await lineInfo()
  rec('B8 Approve in Approvals is refused with its reason (the button not lit)', 'phone', a && /posts? out|Posted out/i.test(a.text) && !/lit-/.test(a.cls) && !/Approved/.test(a.ok.txt) ? 'PASS' : 'FAIL', JSON.stringify(a), ['b8-approve-q.png', 'b8-approve.png'])
  /* the same leave in the bid window */
  await B.openGrid(w); await B.sleep(w, 700)
  await L.openCell(w, 'harpoon', '2027-04-14')
  await shot(w, 'b8-bidwin')
  const btns = await P.evaluate(() => [...document.querySelectorAll('.bidsheet button')].filter(b => b.getBoundingClientRect().height > 0).map(b => (b.dataset.testid || '') + ':' + (b.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 14)))
  console.log('bid window buttons:', btns.join(' | '))
  const apSel = await P.evaluate(() => { const b = [...document.querySelectorAll('.bidsheet button')].find(b => /^Approve/.test(b.innerText.trim()) && b.getBoundingClientRect().height > 0); if (!b) return null; b.setAttribute('data-walk', 'ap'); return '[data-walk="ap"]' })
  if (!apSel) rec('B8 bid window: Approve is refused the same way', 'phone', 'NOT WALKED', 'no Approve button found in the window: ' + btns.join(' | '), ['b8-bidwin.png'])
  else {
    await B.press(w, apSel, 'b8-bid-approve-q'); await B.sleep(w, 800); await shot(w, 'b8-bid-approve')
    const wt = await B.txt(P, '.bidsheet')
    const lit = await P.evaluate(() => { const b = [...document.querySelectorAll('.bidsheet button')].find(b => /Approve/.test(b.innerText.trim())); return b ? { txt: b.innerText.trim(), cls: b.className } : null })
    console.log('window text after Approve:', wt); console.log('Approve button now', JSON.stringify(lit))
    rec('B8 bid window: Approve is refused the same way (reason shown, not approved)', 'phone', wt && /posts? out|Posted out/i.test(wt) && lit && !/Approved/.test(lit.txt) ? 'PASS' : 'FAIL', `window text: "${(wt || '').slice(0, 260)}"; button ${JSON.stringify(lit)}`, ['b8-bid-approve-q.png', 'b8-bid-approve.png'])
  }
  await L.closeWin(w); await P.keyboard.press('Escape'); await B.sleep(w, 500)
  /* Refuse still works in Approvals */
  await B.openApprovals(w); await P.evaluate(() => window.scrollTo(0, 0)); await B.sleep(w, 300)
  await B.press(w, '[data-testid="appr-line-harpoon"] .appr-no', 'b8-refuse-q'); await B.sleep(w, 700); await shot(w, 'b8-refuse')
  const r = await lineInfo()
  rec('B8 Refuse still works on his line', 'phone', r && /lit-refused/.test(r.cls) && /Refused/.test(r.no.txt) ? 'PASS' : 'FAIL', JSON.stringify(r), ['b8-refuse-q.png', 'b8-refuse.png'])
  /* a leave of his BEFORE the date: not part of this phone run (A7 does the second and third cases) */
} catch (e) { rec('ERROR', 'phone', 'FAIL', String(e).slice(0, 400)); await shot(w, 'b8-error').catch(() => {}) }
if (w.errs.length) rec('console', 'phone', 'FAIL', w.errs.join(' || ').slice(0, 600))
await w.ctx.close()
B.writeResults('b8')
await B.closeAll()
console.log('DONE')
