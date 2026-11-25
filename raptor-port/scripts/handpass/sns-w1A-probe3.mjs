// sns-w1A-probe3 — doors not yet proved: the green rings after a man is tapped with nothing armed, the line's own
// "+" buttons, the wave label choices, the phone board's ⋯ menu, the crew search box. Run from raptor-port/:
//   SNSA_RUN=probe3-d SZ=d node scripts/handpass/sns-w1A-probe3.mjs
import './sns-w1A-env.mjs'
const A = await import('./sns-w1A-lib.mjs')
const { T, L, RANGER, IPMAN, D, post, sleep, J, addLine } = A
console.log('VERSION sns-w1A-probe3 1 · out', A.OUT)
const SZ = process.env.SZ || 'd'
const slotCls = (p, root) => p.evaluate(root => Object.fromEntries([...document.querySelectorAll(`${root} [data-slot], ${root} [data-fill]`)].filter(e => e.getBoundingClientRect().width > 0).map(e => [(e.dataset.slot || e.dataset.fill), String(e.className)])), root)
await T.run('probe3', SZ, async (p, W) => {
  // Mon 13: one blank line, one timed line
  const b = await addLine(p, W, 0, { cs: 'SNSB' })
  const t = await addLine(p, W, 0, { cs: 'SNST', to: '21:00', ld: '22:00' })
  W.rec('lines', 'Mon 13 blank + timed', 'REC', J({ b, t }))
  // the line's buttons on the board
  const btns = await p.evaluate(wi => [...document.querySelectorAll('#schedBoard button, #schedBoard select')].filter(e => e.getBoundingClientRect().width > 0 && e.closest('[data-secmove], .sb-wave, section, div') && JSON.stringify(Object.assign({}, e.dataset)).includes('0.' + wi)).map(e => e.tagName + ' ' + JSON.stringify(Object.assign({}, e.dataset)) + ' "' + (e.textContent || '').trim().slice(0, 20) + '" title="' + (e.title || '') + '"').slice(0, 40), b.wi)
  W.rec('btns', 'buttons of the blank line', 'REC', btns.join(' || '))
  const sel = await p.evaluate(() => [...document.querySelectorAll('#schedBoard select')].filter(e => e.getBoundingClientRect().width > 0).map(s => JSON.stringify(Object.assign({}, s.dataset)) + ':' + [...s.options].map(o => o.value + '=' + o.text).join('|')).slice(0, 6))
  W.rec('selects', 'board selects', 'REC', sel.join(' || '))
  const search = await p.evaluate(() => [...document.querySelectorAll('input')].filter(e => e.getBoundingClientRect().width > 0 && /search|callsign/i.test(e.placeholder || '')).map(e => (e.id || '') + ' ' + e.placeholder + ' in ' + (e.closest('#schedBoard') ? 'board' : 'page')))
  W.rec('search', 'search boxes', 'REC', search.join(' || '))
  if (W.isPhone) {
    const more = await p.evaluate(() => [...document.querySelectorAll('#schedBoard button')].filter(e => e.getBoundingClientRect().width > 0 && /⋯|…|more/i.test((e.textContent || '') + (e.title || '') + (e.getAttribute('aria-label') || ''))).map(e => (e.id || '') + ' ' + JSON.stringify(Object.assign({}, e.dataset)) + ' "' + (e.textContent || '').trim() + '"'))
    W.rec('more', 'phone board ⋯', 'REC', more.join(' || '), await W.pic(p, 'more'))
  }
  // rings: nothing armed, tap Jester in the board's crew list
  await A.W5.boardDrawer(p, W, true)
  const c0 = await slotCls(p, '#schedBoard')
  await W.press(p, `#schedBoard .rpuck[data-person="${IPMAN}"]:visible`, 'sel-jester'); await sleep(500)
  const c1 = await slotCls(p, '#schedBoard')
  const diff = Object.keys(c1).filter(k => c0[k] !== c1[k]).map(k => `${k}: "${c0[k]}" → "${c1[k]}"`)
  W.rec('rings.board', 'board: classes changed by tapping Jester (nothing armed)', 'REC', diff.slice(0, 40).join(' || ') + ` · ARM ${J(await p.evaluate(() => window.ARM))}`, await W.pic(p, 'rings-board'))
  await p.keyboard.press('Escape'); await sleep(300)
  await A.W5.boardDrawer(p, W, false)
  await L.closeBoard(p, W)
  // rings in the week
  await L.go(p, 'editsched')
  if (W.isPhone) { await W.press(p, '#rosTab', 'crew-tab'); await sleep(300) }
  await A.S.crewPanelTo(p, W, 'mon')
  const w0 = await slotCls(p, '#eWeek')
  await W.press(p, `.ros-body .rpuck[data-person="${IPMAN}"]:visible`, 'sel-jester-w'); await sleep(500)
  const w1 = await slotCls(p, '#eWeek')
  const wd = Object.keys(w1).filter(k => w0[k] !== w1[k]).map(k => `${k}: "${w0[k]}" → "${w1[k]}"`)
  W.rec('rings.week', 'week: classes changed by tapping Jester', 'REC', wd.slice(0, 40).join(' || '), await W.pic(p, 'rings-week'))
  // view-only page
  await p.keyboard.press('Escape'); await sleep(300)
  await L.go(p, 'viewsched')
  const vt = await p.evaluate(() => { const t = document.body.innerText; return { sans: (t.match(/no availability filed[^\n]*/g) || []).slice(0, 5), crew: !!document.querySelector('#page-viewsched .ros-body, #page-viewsched .rpuck') } })
  W.rec('view', 'view-only: SANS sentences on screen, any crew list', 'REC', J(vt), await W.pic(p, 'view'))
})
A.saveRaw('probe3-' + SZ)
process.exit(0)
