// Re-walk walker B, B2 (the press): Approve on a phone line, the pressed picture ~100 ms after the lift and the settled one;
// the button's edge while it lights; one tap on Refuse, one on Approve, a tap on the lit one; the kind box and the counts at each.
process.env.LW_OUT ||= '../../docs/img/handpass/2026-10-27-lw-m4/rewalk/b'
const B = await import('./lw-m4-walk-b-lib.mjs')
const { T, shot, rec } = B
console.log('[lw-m4-rw-b2 v1]')
for (const [W, H] of [[402, 874], [390, 844]]) {
  const w = await B.newPhone(W, H, 'chromium')
  const P = w.page
  try {
    await B.signIn(w, 'admin')
    await B.openApprovals(w)
    await P.evaluate(() => window.scrollTo(0, 0)); await B.sleep(w, 300)
    /* tag the 23 Jan AM line (Gambit) */
    await P.evaluate(() => { const ls = [...document.querySelectorAll('[data-testid^="appr-line-"]')]; ls.find(e => /23 Jan AM/.test(e.innerText)).setAttribute('data-walk', 'g') })
    const read = () => P.evaluate(() => {
      const l = document.querySelector('[data-walk="g"]')
      const r = e => { const b = e.getBoundingClientRect(); return { l: +b.left.toFixed(1), r: +b.right.toFixed(1), t: +b.top.toFixed(1), w: +b.width.toFixed(1), h: +b.height.toFixed(1) } }
      const cs = e => { const c = getComputedStyle(e); return { bg: c.backgroundColor, fg: c.color, bd: c.borderTopColor + ' ' + c.borderTopStyle } }
      const ok = l.querySelector('.appr-ok'), no = l.querySelector('.appr-no'), bx = l.querySelector('.appr-box')
      const bc = getComputedStyle(bx)
      return { cls: l.className, ok: { txt: ok.innerText.trim(), ...r(ok), ...cs(ok) }, no: { txt: no.innerText.trim(), ...r(no), ...cs(no) }, box: { cls: bx.className, bg: bc.backgroundColor, fg: bc.color, bd: bc.borderTopStyle + ' ' + bc.borderTopColor, td: bc.textDecorationLine, op: bc.opacity }, sub: document.getElementById('appr-sub') ? document.getElementById('appr-sub').innerText : document.querySelector('[data-testid="appr-sub"]').innerText.trim(), tab: document.querySelector('[data-testid="lw-approvals-count"]').textContent, all: document.querySelector('[data-testid="appr-approve-all"]').innerText.trim(), wide: document.documentElement.scrollWidth, btnsR: r(l.querySelector('.appr-btns')), l1R: r(l.querySelector('.appr-l1')) }
    })
    const tag = (s) => `b2-${W}-${s}`
    const states = []
    const tap = async (name, which) => {
      const sel = `[data-walk="g"] .${which}`
      const c = await B.centre(P, sel)
      await w.cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: c.x, y: c.y }] })
      await P.waitForTimeout(60)
      await w.cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
      await P.waitForTimeout(90)
      const q = await read()
      await shot(w, tag(name + '-pressed'))
      await P.waitForTimeout(600)
      const s = await read()
      await shot(w, tag(name + '-settled'))
      states.push({ name, q, s })
      console.log(`${name}: pressed ok ${q.ok.txt} L${q.ok.l} W${q.ok.w} | no ${q.no.txt} L${q.no.l} W${q.no.w} | settled ok ${s.ok.txt} L${s.ok.l} W${s.ok.w} bg ${s.ok.bg} fg ${s.ok.fg} | no ${s.no.txt} L${s.no.l} W${s.no.w} bg ${s.no.bg} fg ${s.no.fg} | line ${s.cls.replace(/appr-line\s*/, '')} | box ${JSON.stringify(s.box)} | ${s.sub} | tab ${s.tab} | all ${s.all} | wide ${s.wide}`)
      return { q, s }
    }
    const s0 = await read()
    await shot(w, tag('0-pending'))
    console.log(`pending: ok ${s0.ok.txt} L${s0.ok.l} W${s0.ok.w} bg ${s0.ok.bg} fg ${s0.ok.fg} bd ${s0.ok.bd} | no ${s0.no.txt} bg ${s0.no.bg} fg ${s0.no.fg} bd ${s0.no.bd} | box ${JSON.stringify(s0.box)} | ${s0.sub} | tab ${s0.tab} | all ${s0.all}`)
    const a = await tap('1-approve', 'appr-ok')
    const nOf = x => (x.sub.match(/(\d+) pending/) || [])[1]
    rec('B2 Approve lights it (pressed 100 ms picture)', W, /approved/i.test(a.q.ok.txt) || /lit-approved/.test(a.q.cls) ? 'PASS' : 'FAIL', `100 ms: ok "${a.q.ok.txt}" bg ${a.q.ok.bg} line ${a.q.cls}`, [tag('1-approve-pressed') + '.png'])
    rec('B2 settled: Approved lit, kind box filled, counts fall', W, /approved/i.test(a.s.ok.txt) && /lit-approved/.test(a.s.cls) && nOf(a.s) === String(+nOf(s0) - 1) && a.s.tab === String(+s0.tab - 1) ? 'PASS' : 'FAIL', `ok "${a.s.ok.txt}" line ${a.s.cls}; header "${a.s.sub}" tab ${a.s.tab} all "${a.s.all}"; box ${JSON.stringify(a.s.box)}`, [tag('1-approve-settled') + '.png'])
    const edgeMove = Math.max(Math.abs(a.q.ok.l - s0.ok.l), Math.abs(a.s.ok.l - s0.ok.l), Math.abs(a.q.no.l - s0.no.l), Math.abs(a.s.no.l - s0.no.l), Math.abs(a.s.ok.r - s0.ok.r), Math.abs(a.s.no.r - s0.no.r))
    rec('B2 the lit Approve does not move its edge (D1435)', W, edgeMove <= 0.6 ? 'PASS' : 'FAIL', `ok left ${s0.ok.l} -> ${a.q.ok.l} (100 ms) -> ${a.s.ok.l}; width ${s0.ok.w} -> ${a.s.ok.w}; refuse left ${s0.no.l} -> ${a.s.no.l}; max shift ${edgeMove}`, [tag('0-pending') + '.png', tag('1-approve-pressed') + '.png', tag('1-approve-settled') + '.png'])
    const r1 = await tap('2-refuse-once', 'appr-no')
    rec('B2 one tap on Refuse turns Approved into Refused (D1428)', W, /refused/i.test(r1.s.no.txt) && /lit-refused/.test(r1.s.cls) ? 'PASS' : 'FAIL', `refuse "${r1.s.no.txt}" approve "${r1.s.ok.txt}" line ${r1.s.cls}; header "${r1.s.sub}" tab ${r1.s.tab}; box ${JSON.stringify(r1.s.box)}`, [tag('2-refuse-once-pressed') + '.png', tag('2-refuse-once-settled') + '.png'])
    const a2 = await tap('3-approve-once', 'appr-ok')
    rec('B2 one tap on Approve turns Refused into Approved', W, /approved/i.test(a2.s.ok.txt) && /lit-approved/.test(a2.s.cls) ? 'PASS' : 'FAIL', `approve "${a2.s.ok.txt}" refuse "${a2.s.no.txt}" line ${a2.s.cls}; box ${JSON.stringify(a2.s.box)}`, [tag('3-approve-once-pressed') + '.png', tag('3-approve-once-settled') + '.png'])
    const a3 = await tap('4-approve-lit', 'appr-ok')
    rec('B2 a tap on the lit Approve sends it back to pending', W, !/lit-/.test(a3.s.cls) && nOf(a3.s) === nOf(s0) && a3.s.tab === s0.tab ? 'PASS' : 'FAIL', `line ${a3.s.cls}; ok "${a3.s.ok.txt}"; header "${a3.s.sub}" tab ${a3.s.tab}; box ${JSON.stringify(a3.s.box)}`, [tag('4-approve-lit-pressed') + '.png', tag('4-approve-lit-settled') + '.png'])
    const maxWide = Math.max(...states.map(s => s.s.wide))
    rec('B2 nothing scrolls sideways through the presses', W, maxWide <= W + 1 ? 'PASS' : 'FAIL', `scrollWidth max ${maxWide}`, [])
  } catch (e) { rec('ERROR', W, 'FAIL', String(e).slice(0, 400)); await shot(w, `b2-${W}-error`).catch(() => {}) }
  if (w.errs.length) rec('console', W, 'FAIL', w.errs.join(' || ').slice(0, 600))
  await w.ctx.close()
}
B.writeResults('b2')
await B.closeAll()
console.log('DONE')
