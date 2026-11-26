/* The try-out's own script: it only shows one captured surface at a time and sets the look's classes and colours on it
   (src/looks.js). No app script runs on this page. */
(() => {
  const A = window.ALX, $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)]
  const stage = $('#ttStage'), strip = $('.tt-strip'), note = $('#ttNote'), cands = $('#ttCands')
  /* the short list a tapped swatch may be given: the proposed seven, today's seven, and three more near-misses */
  const CANDS = [...A.NEW.slice(1), ...A.TODAY.slice(1), '#8FA6FF', '#4FEBC8', '#FF9548', '#19AFFE', '#E6A3A7']
  const START = { surf: 'edit', look: 'a', puck: 'chip', pal: 'today', cb: 'off', st: 'waiting', miss: 'red' }
  const PRESET = { a: { puck: 'chip', pal: 'today' }, b: { puck: 'name', pal: 'today' }, c: { puck: 'tab', pal: 'new' } }
  let S = { ...START }, custom = null, picking = 0

  const list = () => custom || (S.pal === 'new' ? A.NEW : A.TODAY)
  function paint() {
    $$('.tt-surf').forEach(e => e.classList.toggle('on', e.dataset.surf === S.surf && e.dataset.st === S.st))
    const on = $('.tt-surf.on')
    A.palette(list())
    A.look(stage, { look: S.look, puck: S.puck })
    $$('.tt-surf .alx-key').forEach(k => k.remove())
    if (S.look === 'c' && on) A.key(on)
    stage.classList.toggle('cb', S.cb === 'on')
    /* the missing-time outline: every empty time box of a duty desk on the captured day (the 1st wave's SXO END, emptied on
       the published day and still waiting) is given the end-time rule's class; classes only, never a style from script */
    stage.classList.toggle('et-off', S.miss === 'off')
    $$('.tt-surf:not([data-surf="view"]) :is([data-txt^="dr:"],[data-bfld^="dr:"])').forEach(e => { const k = e.getAttribute('data-txt') || e.getAttribute('data-bfld'), empty = (e.tagName === 'INPUT' ? e.value : e.textContent).trim() === ''
      const is = /\.(str|end)$/.test(k) && empty; e.classList.toggle('et-miss', is); e.classList.toggle('et-red', is && S.miss === 'red') })
    $$('[data-set]').forEach(b => { const v = b.dataset.set === 'pal' ? (custom ? '' : S.pal) : S[b.dataset.set]; const is = v === b.dataset.val; b.classList.toggle('on', is); b.setAttribute('aria-checked', is ? 'true' : 'false') })
    $$('.tt-sw').forEach(b => { const n = +b.dataset.n; b.style.background = list()[n]; b.setAttribute('aria-pressed', picking === n ? 'true' : 'false'); b.title = 'AL' + n + (n === 7 ? ' and later' : '') + ': ' + (A.NAMES[list()[n]] || list()[n]) + '. Tap to try another colour.' })
    cands.classList.toggle('on', !!picking)
    if (picking) $('#ttCandLbl').textContent = 'AL' + picking + (picking === 7 ? '+' : '') + ' becomes'
    note.textContent = S.surf === 'view' && S.st === 'waiting' ? 'View-only Sched never shows a change that is still waiting, so AL4 is not on it yet. Choose "All four out" to see it there.' : ''
    /* the board's own height figures were measured on the screen it was captured from: give it this window's */
    const b = on && on.querySelector('.schedboard')
    if (b) on.style.height = Math.max(420, Math.min(900, innerHeight - strip.offsetHeight - 10)) + 'px'
    document.documentElement.style.setProperty('--tt-strip-h', strip.offsetHeight + 'px')
    if (b) { const top = b.querySelector('.sb-top'); b.style.setProperty('--sb-boardH', on.clientHeight + 'px'); if (top) b.style.setProperty('--sb-topH', top.offsetHeight + 'px') }
  }
  strip.addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return
    if (b.dataset.set) {
      S[b.dataset.set] = b.dataset.val
      if (b.dataset.set === 'look') { Object.assign(S, PRESET[b.dataset.val]); custom = null; picking = 0 }
      if (b.dataset.set === 'pal') { custom = null; picking = 0 }
    } else if (b.classList.contains('tt-sw')) { picking = picking === +b.dataset.n ? 0 : +b.dataset.n }
    else if (b.classList.contains('tt-cand')) { custom = [...list()]; custom[picking] = b.dataset.c; picking = 0 }
    else if (b.id === 'ttMore') { const o = strip.classList.toggle('open'); b.textContent = o ? 'Fewer' : 'More'; b.setAttribute('aria-expanded', o ? 'true' : 'false') }
    else if (b.id === 'ttReset') { S = { ...START }; custom = null; picking = 0 }
    paint()
  })
  /* each choice's colour is set on the button itself after it is made (a style written into the markup by a script may be
     blocked where the page is published) */
  for (const c of CANDS) { const b = document.createElement('button'); b.type = 'button'; b.className = 'tt-cand'; b.dataset.c = c; b.title = A.NAMES[c] || c; b.setAttribute('aria-label', A.NAMES[c] || c); b.style.setProperty('background', c); cands.appendChild(b) }
  window.addEventListener('resize', paint)
  paint()
})()
