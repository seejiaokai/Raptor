// lw-declutter-mock — the round 3 window transform (his D1311), shared by the drawing scripts: lw-declutter-look.mjs
// draws round 3 with it; lw-q7-sideways.mjs draws his D1313 on top of it.
/* the transform, run in the page on the window in view */
export const CSS = `
.bidsheet .bidsheet-row > .lab { display: none !important; }
.bidsheet .bidsheet-dayline { border: 0 !important; background: none !important; padding: 0 2px !important; margin: 0 0 4px !important; }
.bidsheet .bp-rmk input[type='text'] { background: var(--bg) !important; border-color: var(--edge-2) !important; }
.bidsheet .bp-rmk input[type='text']::placeholder { color: var(--ink-3); font-weight: 500; }
.bidsheet .lv-grid { flex: 1 1 100% !important; }
.bidsheet .mock-lit { outline: 2px solid var(--accent); outline-offset: 2px; }
.bidsheet .mock-rangechip { margin-left: auto; }
.bidsheet-hd .mock-sw { margin-left: auto; min-height: 0; border: 0; background: none; padding: 0; gap: 5px; font-size: 11px; color: var(--ink-2); align-self: center; }
.bidsheet-hd .dt { white-space: nowrap; }
.bidsheet-hd [data-testid='sel-span'] { white-space: normal; min-width: 0; flex: 0 1 auto; }
.bidsheet-hd .mock-more { font-size: 18px; letter-spacing: 1px; }
.mock-menu { position: fixed; z-index: 99998; display: grid; gap: 6px; padding: 8px; background: var(--panel); border: 1px solid var(--edge-2); border-radius: 10px; }
.mock-menu .dchip { justify-content: flex-start; text-align: left; }
`
export const transform = (P, opt) => P.evaluate(({ css, opt }) => {
  const s = document.querySelector('.bidsheet'); if (!s) return 'no window'
  let st = document.getElementById('mock-declutter'); if (!st) { st = document.createElement('style'); st.id = 'mock-declutter'; document.head.appendChild(st) } st.textContent = css
  const tid = t => s.querySelector(`[data-testid="${t}"]`)
  const rowOf = e => e && e.closest('.bidsheet-row')
  const P = opt.p // test prefix: bid / sel
  /* 8: the title — "now LL" out, the switch, the ⋯ */
  s.querySelector('.bidsheet-hd .cur')?.remove()
  const tick = s.querySelector('.bidsheet-hd .bp-approve')
  if (tick) {
    const sw = document.createElement('button'); sw.type = 'button'; sw.className = 'pp-sw on mock-sw mock-new'
    sw.innerHTML = '<span class="pp-sw-dot" aria-hidden="true"></span>Approve what I enter'
    tick.replaceWith(sw)
  }
  const also = s.querySelector('.bidsheet-row.postout')
  if (also && opt.admin && !s.querySelector('.mock-more')) {
    const x = s.querySelector('.bidsheet-hd .x')
    const more = x.cloneNode(true); more.removeAttribute('data-testid'); more.textContent = '⋯'; more.classList.add('mock-more', 'mock-new'); more.setAttribute('aria-label', 'More')
    x.before(more)
  }
  if (also) also.remove()
  /* 3: one row of actions */
  const dec = rowOf(tid(P === 'bid' ? 'decide-approve' : 'sel-approve'))
  const selRow = rowOf(tid(P === 'bid' ? 'decide-shift' : 'sel-move')) || rowOf(tid(P === 'bid' ? 'bid-clear' : 'sel-delete'))
  tid('decide-note')?.remove()
  if (opt.noDecide && dec) dec.remove()
  let actions = opt.noDecide ? null : dec
  if (selRow) {
    if (actions) { for (const b of [...selRow.querySelectorAll('button')]) actions.appendChild(b); selRow.remove() }
    else actions = selRow
  }
  /* 4: Remarks + Document on one row */
  let docRow = tid(P + '-doc-row'), rmkRow = tid(P + '-rmk-row')
  if (!docRow && opt.wordsHTML) {
    const t = document.createElement('div'); t.innerHTML = opt.wordsHTML
    docRow = t.children[0]; rmkRow = t.children[1]
    for (const e of [docRow, rmkRow]) e.classList.add('mock-new')
  }
  let words = null
  if (docRow && rmkRow) {
    const field = docRow.querySelector('.docfield') || docRow.lastElementChild
    rmkRow.appendChild(field); docRow.remove(); words = rmkRow
    const inp = rmkRow.querySelector('input[type="text"]'); if (inp) inp.placeholder = 'Remarks'
  }
  /* 5: Date row out, "Pick a range" to the end of Duration */
  const dur = rowOf((tid('portion-full') || tid('sel-portion-full')))
  const range = tid('span-range')
  if (range && dur) { range.classList.add('mock-rangechip'); dur.appendChild(range); rowOf(tid('span-one'))?.remove() }
  /* order: day line, actions, words, duration, leave */
  const leave = rowOf(tid(P + '-LL'))
  const after = s.querySelector('.bidsheet-dayline') || s.querySelector('.bidsheet-hd')
  let at = after
  for (const r of [actions, words, dur, leave]) if (r) { at.after(r); at = r }
  /* 7: the day's leave lit */
  if (opt.lit) tid(`${P}-${opt.lit}`)?.classList.add('mock-lit')
  return 'ok'
}, { css: CSS, opt })
export const reorder = (P, p) => P.evaluate(p => {
  const s = document.querySelector('.bidsheet'); const tid = t => s.querySelector(`[data-testid="${t}"]`); const rowOf = e => e && e.closest('.bidsheet-row')
  const actions = rowOf(tid(p === 'bid' ? 'decide-approve' : 'sel-approve')) || rowOf(tid(p === 'bid' ? 'decide-shift' : 'sel-move')) || rowOf(tid(p === 'bid' ? 'bid-clear' : 'sel-delete'))
  const words = s.querySelector('.bp-rmk')?.closest('.bidsheet-row'), dur = rowOf((tid('portion-full') || tid('sel-portion-full'))), leave = rowOf(tid(p + '-LL'))
  let at = s.querySelector('.bidsheet-dayline') || s.querySelector('.bidsheet-hd')
  for (const r of [actions, words, dur, leave]) if (r) { at.after(r); at = r }
}, p)
