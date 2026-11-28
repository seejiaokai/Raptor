// p5-n6 - P5 case N6 (the build plan's §8.3): a window held since midnight, then his own pick.
// A man moves 142 → 149 from 16 Jul 2026. Before midnight he opens an Input window on Inputs (List → the first row) and
// types words in its Remarks; the page clock runs past midnight (his move lands: the window is held, as n166 mid-e1 found);
// then he presses the squadron picker (top bar; ☰ → its squadron list on a phone) and picks the other squadron.
//   hunter - Hunter (ad2, 142's admin, no rights elsewhere): the brief's case
//   saber  - Saber (ad, the master admin, who sees every squadron): the same move, so a picker is there to press
// Read: what the picker offers, what happens to the held window and its typed words.
// STAND-INS (p4-card / n166 mid-e1's, named in the FACT lines): the move written as a home row at the sign-in card (no screen
// saves a move); the page clock installed at 15 Jul 23:58:30 (Singapore) and run to 16 Jul 00:00:30.
//   node raptor-port/scripts/handpass/n175/p5-n6.mjs <d|p>     (ONLY=hunter,saber)
// Pictures: p5-n6-<who>-<d|p>-1-held, p5-n6-<who>-<d|p>-2-after-pick
import { FACT, barSq, pageOn, go, reachPick, wait, vis, hit, windowsNow, roleNow, bands, sayNow, clockWorld, clockTo, covered } from './p4-lib.mjs'
import { shot, scratch } from './lib.mjs'
const SZ = process.argv[2] || 'd'; const SEC = 'p5'
const ONLY = (process.env.ONLY || '').split(',').filter(Boolean)
const WORDS = 'N175 N6 words'
const via = s => (s.desk ? 'bar' : 'menu')
const role = async s => { const r = await roleNow(s); return r.badge || r.menuLine }
const typed = s => s.page.evaluate(w => [...document.querySelectorAll('textarea, input')].filter(e => e.value === w).map(e => e.id + (e.getBoundingClientRect().width > 0 ? ' (in sight)' : ' (not in sight)') + (e.readOnly || e.disabled || e.closest('[inert]') ? ' [read-only]' : '')), WORDS)
const screen = async s => ({ squadron: await barSq(s), role: await role(s), page: await pageOn(s), bands: await bands(s), windows: (await windowsNow(s)).map(w => `${w.what}${w.inert ? ' [inert]' : ''}: ${w.words.slice(0, 160)} | buttons: ${w.buttons.join(', ')}`), typed: await typed(s) })
const WHO = { hunter: { pid: 'prowler', user: 'ad2', pass: 'a2' }, saber: { pid: 'stiff', user: 'ad', pass: 'a' } }
async function run(who) {
  const W = WHO[who]; const k = `p5.n6.${who}.${SZ}`, P = `p5-n6-${who}-${SZ}`
  const s = await clockWorld(SZ, { now: '2026-07-15T23:58:30', homes: [{ pid: W.pid, from: 'u142', to: 'u149', day: '2026-07-16' }], user: W.user, pass: W.pass })
  try {
    FACT(`${k}.standIn`, `${who}'s move 142->149 from 16 Jul written as a home row at the sign-in card; page clock 15 Jul 23:58:30 run to 16 Jul 00:00:30 (Singapore)`)
    await go(s, 'inputs'); await wait(s, 700)
    if (await vis(s, '#inListBtn[aria-pressed="false"]').count()) await hit(s, '#inListBtn')
    if (!(await vis(s, '#inBody tr[data-iid], #inList [data-iid]').count())) { await hit(s, '#inRangeBtn'); if (await s.page.locator('#inRangeAll').count()) await hit(s, s.page.locator('#inRangeAll').first()); if (await vis(s, '#inRangeAll').count()) await hit(s, '#inRangeBtn') }
    const row = vis(s, '#inBody tr[data-iid], #inList [data-iid]').first()
    FACT(`${k}.input`, (await row.innerText()).replace(/\s+/g, ' ').slice(0, 50))
    const o = row.locator('[data-testid="in-open"]'); await hit(s, (await o.count()) ? o.first() : row, 800)
    const r = vis(s, '#inpEditRmk').first()
    if (s.desk) { await r.click(); await s.page.keyboard.press('Control+a'); await s.page.keyboard.type(WORDS) } else await r.evaluate((e, w) => { const set = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(e), 'value').set; set.call(e, w); e.dispatchEvent(new Event('input', { bubbles: true })) }, WORDS)
    await wait(s, 300)
    FACT(`${k}.1.beforeMidnight`, await screen(s))
    await clockTo(s, '2026-07-16T00:00:30'); await wait(s, 1000)
    FACT(`${k}.2.afterMidnight`, { ...(await screen(s)), said: await sayNow(s) })
    await shot(s, `${P}-1-held`, ['.inpedwin', s.desk ? '#sqnMenuBtn' : '.topbar .mark'], null, 20)
    const now = (await barSq(s)) || ''
    const other = /149/.test(now) ? 142 : 149
    FACT(`${k}.3.pickerCovered`, s.desk ? { topBarPicker: await covered(s, '#sqnMenuBtn') } : { menuButton: await covered(s, '#burger') })
    const p = await reachPick(s, other, via(s))
    let rows = p.listRows
    if (!s.desk && !rows) rows = await s.page.evaluate(() => [...document.querySelectorAll('#drawerSqnList .sqm-row')].map(e => e.innerText.replace(/\s+/g, ' ').trim()))
    FACT(`${k}.3.pick`, { picked: other, control: p.control, covered: p.covered, lineCovered: p.lineCovered, rowCovered: p.rowCovered, menuOpen: p.menuOpen, listOpen: p.listOpen, rows, pressed: !!p.pressed, why: p.why })
    await wait(s, 800)
    FACT(`${k}.4.afterPick`, await screen(s))
    await shot(s, `${P}-2-after-pick`, ['.inpedwin', s.desk ? '#sqnMenuBtn' : '.topbar .mark'], null, 20)
    if (p.pressed) {
      const p2 = await reachPick(s, /149/.test(now) ? 149 : 142, via(s)); await wait(s, 800)
      FACT(`${k}.5.backPick`, { pressed: !!p2.pressed, ...(await screen(s)) })
      await scratch(s, SEC, `${P}-3-back`)
    }
  } catch (e) { FACT(`${k}.error`, String(e).split('\n')[0].slice(0, 200)); await scratch(s, SEC, P + '-error').catch(() => {}) } finally { await s.browser.close().catch(() => {}) }
}
console.log('p5-n6 v2', SZ)
for (const who of (ONLY.length ? ONLY : Object.keys(WHO))) await run(who)
