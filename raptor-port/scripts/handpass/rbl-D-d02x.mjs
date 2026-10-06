/* D-02 extra — what the crew list says about X on a line that carries Brief 05:00 and has NOBODY on it yet, then once another man sits on it. Desktop. RECORDED. */
import * as K from './rbl-D-lib.mjs'
const { B, R, X, MON, TUE } = K
const ID = 'D-02x'
const { browser, p, errors } = await K.fresh()
const rd = () => p.evaluate(x => { const e = [...document.querySelectorAll(`#sbRoster .rpuck[data-person="${x}"]`)].find(q => q.offsetParent !== null); if (!e) return null; e.scrollIntoView({ block: 'center' }); return { struck: e.classList.contains('no'), cls: e.className.replace(/\s+/g, ' '), text: e.innerText.replace(/\s+/g, ' ').trim(), title: e.title + ' | ' + ((e.querySelector('.puck') || {}).title || '') } }, X)
async function arm(key) {
  const el = p.locator(`#schedBoard [data-slot="${key}"]:visible, #schedBoard [data-fill="${key}"]:visible`).first()
  await el.evaluate(e => e.scrollIntoView({ block: 'center' })); await K.sleep(150); await el.click(); await K.sleep(900)
  return p.evaluate(() => (window.ARM && window.ARM.key) || null)
}
try {
  const cs = await B.csOf(p, X)
  await K.wave(p, MON, 'ZM', 'BFM', '20:00', '22:30', X)
  const t = await K.addFlyWave(p, TUE)
  await K.ff(p, TUE, t.gi, 0, 'br', '05:00')
  await K.boardTo(p, TUE)
  const a1 = await arm(`${TUE}.${t.gi}.0.0.p`)
  const r1 = await rd(); await K.sleep(250)
  const p1 = await B.pic(p, 'empty-line-armed')
  await p.keyboard.press('Escape'); await K.sleep(300)
  R(`${ID}.1`, `${cs}: Monday ZM 20:00–22:30; Tuesday + Wave, its one line blank except a typed Brief 05:00, NOBODY on it; arm its front seat (arm ${a1}) and read ${cs}'s name in the crew list`,
    `struck ${r1 && r1.struck ? 'YES' : 'no'} · class "${r1 && r1.cls}" · text "${r1 && r1.text}" · tooltip "${r1 && r1.title}"`, 'RECORDED', [p1])
  const o = await K.seat(p, TUE, t.gi, 0, 0, 'p', 'pike')
  await K.addLine(p, TUE, t.gi)   // a second, empty line (nobody on it) after Nomad took the first line's front seat
  const a2 = await arm(`${TUE}.${t.gi}.0.0.w`)
  const r2 = await rd(); await K.sleep(250)
  const p2 = await B.pic(p, 'crewed-line-armed')
  await p.keyboard.press('Escape'); await K.sleep(300)
  R(`${ID}.2`, `the same Brief line, now with Nomad in its front seat (took ${o.took}); arm its back seat (arm ${a2}) and read ${cs}'s name`,
    `struck ${r2 && r2.struck ? 'YES' : 'no'} · class "${r2 && r2.cls}" · text "${r2 && r2.text}" · tooltip "${r2 && r2.title}"`, 'RECORDED', [p2])
} catch (e) { R(`${ID}.script`, 'script', String(e.stack || e).slice(0, 700), 'FAIL', [await B.pic(p, `${ID}-X`)]) }
await K.wrap('d02x', browser, errors, ID)
