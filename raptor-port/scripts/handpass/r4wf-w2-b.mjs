// r4wf second walk, task B (25 Nov 26) — Astra's finding 2: with the caret in a box of the Board BELOW the flying
// section, and a Blue/Red question open in the flying section, a save that rewrites the flying section takes the
// question away and puts it back; is the caret's box moved on screen? Each line asserts the RIGHT behaviour (the box
// holds within 1px, keeps the caret, the question still open). Run on main, on the first cut without the guard
// (build-fix2) and on the fix (build-fix3):
//   WR4_OUT=<dir> WR4_NEW=<build> SZ=desk|phone ENG=chromium|webkit node scripts/handpass/r4wf-w2-b.mjs
import * as L from './wr4-lib.mjs'
const { newPage, signIn, go, sleep, bundleOf, log, finish, facts } = L
const J = JSON.stringify
const SZ = process.env.SZ || 'desk', ENG = process.env.ENG || 'chromium', tag = `${SZ}-${ENG}`
const res = []
const add = (id, verdict, what, pic = '') => { res.push([id, verdict, what, pic]); console.log('RESULT', id, '|', verdict, '|', what, '|', pic) }
const pic = async (p, name) => { const f = `b-${tag}-${name}.png`; await p.screenshot({ path: `${process.env.WR4_OUT}/${f}` }); return f }
const w = await newPage(SZ, undefined, L.NEW_DIR, ENG); await signIn(w, 'ad')
const p = w.page
log(tag, 'bundle ' + await bundleOf(p))
if (process.env.ANCHOR === 'off') await p.addStyleTag({ content: '*{overflow-anchor:none !important}' })
const ONLYB = (process.env.ONLYB || '').split(',').filter(Boolean)
const tapOrClick = async loc => { const l = loc.first(); await l.scrollIntoViewIfNeeded(); if (w.tap) await l.tap(); else await l.click(); await sleep(250) }
/* where the box stands on screen, who has the focus, the question, the scroll of the Board's own list */
const measure = (sel) => p.evaluate(sel => {
  const box = document.querySelector(sel), a = document.activeElement, q = document.querySelector('.mission-role-question')
  let sc = box?.parentElement; while (sc && !(sc.scrollHeight > sc.clientHeight && /auto|scroll/.test(getComputedStyle(sc).overflowY))) sc = sc.parentElement
  const waves = document.querySelector('#sbBoard > [data-secmove$=".waves"]')
  return {
    boxTop: box ? Math.round(box.getBoundingClientRect().top * 10) / 10 : null,
    focusIsBox: a === box, focus: a?.getAttribute('data-ifld') || a?.getAttribute('data-bfld') || a?.tagName,
    caretPos: a && 'selectionStart' in a ? [a.selectionStart, a.selectionEnd] : null, value: box?.value,
    question: q ? { top: Math.round(q.getBoundingClientRect().top), h: Math.round(q.getBoundingClientRect().height), connected: q.isConnected, n: document.querySelectorAll('.mission-role-question').length } : null,
    scroller: sc ? (sc.id || sc.className.split(' ')[0]) : 'page', scrollTop: sc ? Math.round(sc.scrollTop) : Math.round(scrollY), scrollY: Math.round(scrollY),
    wavesMarked: waves ? waves.hasAttribute('data-w2mark') : null, groundRow: null,
  }
}, sel)
const markWaves = () => p.evaluate(() => document.querySelector('#sbBoard > [data-secmove$=".waves"]')?.setAttribute('data-w2mark', '1'))
const bset = async (k, v) => { const b = p.locator(`#schedBoard [data-bfld="${k}"]:visible`).first(); await b.scrollIntoViewIfNeeded(); if (w.tap) await b.tap(); else await b.click(); await b.fill(v); await b.press('Tab'); await sleep(450) }
async function raise() {
  await bset('ff:0.0.0.msn', 'ACM'); await bset('fr:0.0.0.0', 'DS FOR RU')
  return p.evaluate(() => document.querySelectorAll('.mission-role-question').length)
}
try {
  /* the set-up through the app's own controls: Blue/Red tracking on (the Logic page's switch); Ranger's Training input
     on Monday 13 Jul, 05:00–06:00 (clear of his flight); the Board on Monday; the question raised by a cue in Remarks */
  await go(p, 'logic'); const e = p.locator('#lgEdit:visible'); if (await e.count()) { await e.click(); await sleep(300) }
  const sw = p.locator('#lgMissionMix'); if (!(await sw.isChecked())) { await sw.setChecked(true); await sleep(400) }
  const iid = await L.fileInput(w, tag, '2026-07-13', { type: 'Training', people: [L.RANGER], from: '05:00', to: '06:00', title: 'Early brief' })
  await go(p, 'editsched'); await p.evaluate(() => window.openScheduler(0)); await sleep(900)
  if (!(await p.locator(`#schedBoard [data-ifld="${iid}.str"]`).first().isVisible().catch(() => false))) { const ph = p.locator('#schedBoard [data-pitog]').first(); if (await ph.count()) { await tapOrClick(ph); await sleep(300) } }
  const to = await p.evaluate(() => document.querySelector('#schedBoard [data-bfld="ff:0.0.0.to"]')?.value)
  log(tag, `Ranger flies Monday wave 1, formation 1, line 2; take-off ${to}; input ${iid}`)
  let n = await raise()
  add(`B0 ${tag} the question raised by "DS FOR RU" in the first formation's Remarks`, n === 1 ? 'PASS' : 'FAIL', J({ questions: n }), await pic(p, 'b0-question'))

  /* B1 — a person's path, the keyboard: the caret in Ranger's input START under Personal Inputs (below the flying
     section), a time typed that overlaps his flight, Tab — the caret goes on to END; the save may redraw the flying
     section (his line now clashes). Measured: END's place on screen before the Tab and after, the focus, the scroll. */
  for (const [k, typed] of [['B1', '1300'], ['B1b', '0600'], ['B1c', '1300'], ['B1d', '0600']].filter(() => !ONLYB.length || ONLYB.includes('B1'))) {
    /* the END typed so the input runs into his 12:40 flight (1300) and back clear of it (0600); the caret goes on to
       REMARKS, the box measured */
    const S = `#schedBoard [data-ifld="${iid}.end"]`, E = `#schedBoard [data-ifld="${iid}.rmks"]`
    if (!(await p.evaluate(() => document.querySelectorAll('.mission-role-question').length))) { n = await raise(); log(tag, `${k}: the question raised again (${n})`) }
    const s = p.locator(S).first()
    await s.evaluate(el => el.scrollIntoView({ block: 'center' })); await sleep(200)
    if (w.tap) await s.tap(); else await s.click(); await sleep(250)
    await p.keyboard.press('Control+A'); await p.keyboard.type(typed)
    await markWaves()
    const before = await measure(E)
    const fb = await pic(p, `${k}-before-tab`)
    await p.keyboard.press('Tab')
    const lift = await measure(E)
    await sleep(700)
    const after = await measure(E)
    const fa = await pic(p, `${k}-after-tab`)
    const moved = after.boxTop != null && before.boxTop != null ? Math.round((after.boxTop - before.boxTop) * 10) / 10 : null
    const rewrote = after.wavesMarked === false
    const ok = after.focusIsBox && Math.abs(moved) <= 1 && after.question && after.question.n === 1
    add(`${k} ${tag} "${typed}" typed in Ranger's input END, Tab: REMARKS holds its place, keeps the caret, the question stays`, ok ? 'PASS' : 'FAIL', J({ flyingSectionRewritten: rewrote, endMovedBy: moved, before, rightAfterTab: lift, settled: after }), `${fb}, ${fa}`)
    await p.mouse.click(3, 3).catch(() => {}); await sleep(500)
  }

  /* B3 — the flying section certainly rewritten while the caret is below it and the question open: a callsign typed in
     the SECOND wave (Tab — the flying section now owed, the caret still in it), the page scrolled so Ranger's END sits
     mid-screen, END clicked (the fix paints the section left at once — Fable's B3), then 1300 typed in END and Tab (the
     first cut paints it here). END's place measured across the click, REMARKS' across the Tab. With ANCHOR=off the
     browser's own scroll anchoring is switched off by a style (overflow-anchor:none), to see the app's guard alone. */
  for (const k of ['B3', 'B3b'].filter(() => !ONLYB.length || ONLYB.includes('B3'))) {
    if (!(await p.evaluate(() => document.querySelectorAll('.mission-role-question').length))) { n = await raise(); log(tag, `${k}: the question raised again (${n})`) }
    const E = `#schedBoard [data-ifld="${iid}.end"]`, R = `#schedBoard [data-ifld="${iid}.rmks"]`
    const cs = p.locator('#schedBoard [data-bfld="ff:0.1.0.cs"]').first(); await cs.scrollIntoViewIfNeeded()
    if (w.tap) await cs.tap(); else await cs.click(); await sleep(200)
    await p.keyboard.press('Control+A'); await p.keyboard.type(k === 'B3' ? 'VIPER' : 'COBRA'); await p.keyboard.press('Tab'); await sleep(500)
    const inWaves = await p.evaluate(() => !!document.activeElement?.closest('#sbBoard > [data-secmove$=".waves"]'))
    await p.evaluate(s => document.querySelector(s)?.scrollIntoView({ block: 'center' }), E); await sleep(300)
    await markWaves()
    const e0 = await measure(E)
    const end = p.locator(E).first(); if (w.tap) await end.tap(); else await end.click(); await sleep(600)
    const e1 = await measure(E)
    const byClick = { rewritten: e1.wavesMarked === false, moved: Math.round((e1.boxTop - e0.boxTop) * 10) / 10, scroll: [e0.scrollTop, e1.scrollTop], q: [e0.question?.top, e1.question?.top], focusIsBox: e1.focusIsBox }
    const fc = await pic(p, `${k}-after-click`)
    await markWaves()
    await p.keyboard.press('Control+A'); await p.keyboard.type(k === 'B3' ? '1300' : '0600')
    const r0 = await measure(R)
    await p.keyboard.press('Tab'); await sleep(700)
    const r1 = await measure(R)
    const byTab = { rewritten: r1.wavesMarked === false, moved: Math.round((r1.boxTop - r0.boxTop) * 10) / 10, scroll: [r0.scrollTop, r1.scrollTop], q: [r0.question?.top, r1.question?.top, r1.question?.n], focusIsBox: r1.focusIsBox }
    const ok = inWaves && Math.abs(byClick.moved) <= 1 && byClick.focusIsBox && Math.abs(byTab.moved) <= 1 && byTab.focusIsBox && r1.question
    add(`${k} ${tag} anchoring ${process.env.ANCHOR === 'off' ? 'OFF' : 'on'}: a callsign typed in wave 2 (caret left in the flying section: ${inWaves}), Ranger's END clicked, then a time and Tab — END and REMARKS hold`, ok ? 'PASS' : 'FAIL', J({ byClick, byTab }), `${fc}, ${await pic(p, `${k}-after-tab`)}`)
    await p.mouse.click(3, 3).catch(() => {}); await sleep(500)
  }

  /* B2 — Astra's own steps: the caret in a Ground Programme box below the flying section, then "+ Line" pressed in
     the second wave. Does the box keep the caret through the press at all? (a click or a tap on a button) */
  if (!ONLYB.length || ONLYB.includes('B2')) {
    if (!(await p.evaluate(() => document.querySelectorAll('.mission-role-question').length))) { n = await raise(); log(tag, `B2: the question raised again (${n})`) }
    const G = '#schedBoard [data-bfld="gr:0.0.rmks"]'
    const g = p.locator(G).first(); await g.evaluate(el => el.scrollIntoView({ block: 'center' })); await sleep(200)
    if (w.tap) await g.tap(); else await g.click(); await sleep(250)
    await p.keyboard.type('xyz')
    await markWaves()
    const before = await measure(G)
    const fb = await pic(p, 'B2-before-line')
    const gl = p.locator('#schedBoard [data-gline="0.1"]').first()
    const glTop = await gl.evaluate(el => el.getBoundingClientRect().top)
    if (w.tap) await gl.tap(); else await gl.click()
    const lift = await measure(G)
    await sleep(700)
    const after = await measure(G)
    const fa = await pic(p, 'B2-after-line')
    const moved = after.boxTop != null && before.boxTop != null ? Math.round((after.boxTop - before.boxTop) * 10) / 10 : null
    const kept = after.focusIsBox
    add(`B2 ${tag} "+ Line" pressed with the caret in a Ground Programme box (Astra's steps)`, !kept ? 'COULD NOT BE MADE' : (Math.abs(moved) <= 1 && after.question ? 'PASS' : 'FAIL'), J({ plusLineOnScreenAt: Math.round(glTop), flyingSectionRewritten: after.wavesMarked === false, boxMovedBy: moved, before, rightAfterPress: lift, settled: after }), `${fb}, ${fa}`)
    /* the same press from the keyboard: the caret in the box, Shift+Tab / Tab cannot reach "+ Line" without leaving
       the box; record where the focus goes on the first Tab from the box */
  }
} catch (e) { add(`B ${tag}`, 'ERROR', e.message.split('\n')[0].slice(0, 300)); await pic(p, 'error').catch(() => {}) }
facts.results = res
await finish()
console.log('errors:', facts.errors.length, J(facts.errors.slice(0, 6)))
