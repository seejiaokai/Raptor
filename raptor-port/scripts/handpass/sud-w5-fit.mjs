// sud-w5-fit — does the look-ahead reason, printed under Hex's struck name with a seat armed, fit the screen? Measured
// (not only looked at): the reason's box against the screen's right edge and against its own drawer, whether it wraps,
// whether the drawer scrolls sideways — on the board and on Edit Schedule's crew drawer, at both sizes.
// Run from raptor-port/:  RUN=final/fit ONLY=fd,fp node scripts/handpass/sud-w5-fit.mjs
import { L, S, run, NOTE17, clip, boardDrawer, disarm } from './sud-w5-lib.mjs'
const { J, HEX, sleep } = L
const VERSION = 'sud-w5-fit v2'
const ONLY = (process.env.ONLY || 'fd,fp').split(',')
console.log(VERSION, L.URL_, L.OUT, ONLY.join(','))
const FRI = 4
const measure = (p, root) => p.evaluate(([root, id]) => {
  const pk = [...document.querySelectorAll(`${root} .rpuck[data-person="${id}"]`)].find(e => e.getBoundingClientRect().width > 1)
  if (!pk) return 'no puck'
  const w = pk.querySelector('.rwhy')
  if (!w) return 'no printed reason'
  const r = w.getBoundingClientRect(), cs = getComputedStyle(w)
  const body = pk.closest('.ros-body') || pk.parentElement
  const br = body.getBoundingClientRect()
  const lh = parseFloat(cs.lineHeight) || parseFloat(cs.fontSize) * 1.2
  /* other printed reasons in the same list, for comparison (do they wrap?) */
  const others = [...body.querySelectorAll('.rwhy')].filter(e => e !== w && e.getBoundingClientRect().width > 1).slice(0, 3).map(e => { const q = e.getBoundingClientRect(); return { t: e.textContent.slice(0, 40), right: Math.round(q.right), lines: Math.round(q.height / (parseFloat(getComputedStyle(e).lineHeight) || 16)) } })
  return {
    text: w.textContent, left: Math.round(r.left), right: Math.round(r.right), width: Math.round(r.width), height: Math.round(r.height),
    lines: Math.round(r.height / lh), whiteSpace: cs.whiteSpace, overflow: cs.overflow, textOverflow: cs.textOverflow,
    screen: window.innerWidth, drawerRight: Math.round(br.right), drawerScrollW: body.scrollWidth, drawerClientW: body.clientWidth,
    page: document.documentElement.scrollWidth, others,
  }
}, [root, HEX])

async function f(p, W) {
  const po = await L.postOut(p, W, HEX, '2026-07-17', 'fit-01')
  W.rec('fit-01', 'Wed 15: Hex posted out as SANS from Fri 17 Jul (read back)', /17 Jul: becomes SANS/.test(po.line), `line "${po.line}"`, po.pic)
  /* the board, Fri 17: the EXT SQN OFT row's people box armed (a row the demo world already has) */
  await L.openBoard(p, W, FRI)
  const zone = p.locator(L.B(`[data-fill="s:${FRI}.oft.0.+"]`)).first()
  await zone.evaluate(e => e.scrollIntoView({ block: 'center' })); await sleep(250)
  if (W.isPhone) await zone.tap(); else await zone.click()
  await sleep(700)
  const armed = await p.evaluate(() => window.ARM && window.ARM.key)
  const m = await measure(p, '#schedBoard')
  const fits = m && typeof m === 'object' && m.text === NOTE17 && m.right <= m.screen && (m.drawerRight === 0 || m.right <= m.drawerRight + 1)
  const pc = await clip(p, W, `#schedBoard .rpuck[data-person="${HEX}"]:visible`, 'fit-02', 40)
  W.rec('fit-02', `board Fri 17, the EXT SQN OFT row armed (${armed}): Hex's printed look-ahead reason fits the screen (its right edge at or inside the screen and its drawer)`, fits, J(m), [pc, await W.pic(p, 'fit-02')].filter(Boolean).join(', '))
  await disarm(p, W)
  await L.closeBoard(p, W)
  /* Edit Schedule: the same row pressed on Friday's card (the phone's crew drawer closed first, opened after) */
  await L.go(p, 'editsched')
  await S.crewPanelClose(p, W)
  const card = p.locator(`#eWeek [data-fill="s:${FRI}.oft.0.+"]`).first()
  if (await card.count()) {
    await card.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await sleep(300)
    if (W.isPhone) await card.tap(); else await card.click()
    await sleep(700)
    if (W.isPhone) {
      const shown = await p.evaluate(() => { const b = document.querySelector('.ros-body'); if (!b) return false; const r = b.getBoundingClientRect(); return r.width > 40 && r.left < window.innerWidth - 40 })
      if (!shown) await W.press(p, '#rosTab', 'crew-tab')
    }
    const a2 = await p.evaluate(() => window.ARM && window.ARM.key)
    const m2 = await measure(p, '.eroster')
    const fits2 = m2 && typeof m2 === 'object' && m2.text === NOTE17 && m2.right <= m2.screen && m2.right <= m2.drawerRight + 1
    const pc2 = await clip(p, W, `.ros-body .rpuck[data-person="${HEX}"]`, 'fit-03', 40)
    W.rec('fit-03', `Edit Schedule, Friday's EXT SQN row pressed (${a2}): Hex's printed look-ahead reason fits the screen`, fits2, J(m2), [pc2, await W.pic(p, 'fit-03')].filter(Boolean).join(', '))
    await p.keyboard.press('Escape'); await sleep(300)
  } else W.rec('fit-03', 'Edit Schedule: Friday\'s EXT SQN row on the card', 'NW', 'not drawn on the card', await W.pic(p, 'fit-03-none'))
}

const FN = { f }
for (const k of ONLY) { const name = k.slice(0, -1), sz = k.slice(-1); if (FN[name]) await run('fit', sz, FN[name]) }
L.saveResults('fit-' + ONLY.join('_'))
console.log('done')
