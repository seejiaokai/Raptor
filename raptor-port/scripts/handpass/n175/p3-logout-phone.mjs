// p3-logout-phone - P3 case 6: Logout on a phone (p, WebKit 402x874 touch) with a window open. On a phone Logout lives in
// the ☰ menu. With each window open - the Input window (words typed), Leave War My leave, Inputs settings (the gear),
// Leave War Place a bid (15 Dec) - is ☰ reachable at its middle? Where it is, ☰ is pressed and the menu's Logout looked
// at (reachable or not) - Logout is NOT pressed. No stand-ins: every step is a press.
//   node raptor-port/scripts/handpass/n175/p3-logout-phone.mjs p     (ONLY=input,myleave,gear,bid)
// Pictures (deciding): p3-logout-phone-<case>-p.png and -crop.png, ☰ ringed (whole screen, for the drawing).
import { mk, closeAll, FACT, signIn, wait, windowsNow, decide, scratch, hit, boxOf, covered, openInput, openMyLeave, openInputsGear, openPlaceBid } from './p3-lib.mjs'
const SZ = process.argv[2] || 'p'
const ONLY = (process.env.ONLY || '').split(',').filter(Boolean)
const CASES = {
  input: { what: 'Input window, words typed in Remarks', open: async s => openInput(s, 'N175P3PH words') },
  myleave: { what: 'Leave War My leave', open: openMyLeave },
  gear: { what: 'Inputs settings (the gear)', open: openInputsGear },
  bid: { what: 'Leave War Place a bid (15 Dec)', open: openPlaceBid },
}
async function one(key) {
  const C = CASES[key], k = `P3.logoutPhone.${SZ}.${key}`, P = `p3-logout-phone-${key}-${SZ}`
  const s = await mk(SZ)
  try {
    await signIn(s, 'ad', 'a')
    FACT(`${k}.case`, C.what)
    try { await C.open(s) } catch (e) { FACT(`${k}.opened`, 'could not open by presses: ' + String(e).split('\n')[0].slice(0, 140)); return }
    await wait(s, 400)
    FACT(`${k}.windows`, (await windowsNow(s)).map(w => ({ what: w.what, words: w.words.slice(0, 80) })))
    const at = (await boxOf(s, '#burger')) ? await covered(s, '#burger') : 'not drawn'
    FACT(`${k}.burgerAt`, { box: await boxOf(s, '#burger'), at })
    FACT(`${k}.topBarLogout`, (await boxOf(s, '#logout')) ? await covered(s, '#logout') : 'not drawn at this size')
    await decide(s, P, ['#burger'], ['#burger', '.topbar'])
    if (at !== 'free') { FACT(`${k}.burgerPressed`, 'no - not reachable at its middle'); return }
    await hit(s, '#burger', 500)
    const open = await s.page.evaluate(() => !!document.querySelector('#drawer')?.classList.contains('open'))
    FACT(`${k}.afterBurger`, { menuOpen: open, logoutAt: (await boxOf(s, '#drawerLogout')) ? await covered(s, '#drawerLogout') : 'not drawn', windows: (await windowsNow(s)).map(w => w.what) })
    await scratch(s, `logout-phone-${key}-${SZ}-after-burger`)
  } catch (e) { FACT(`${k}.error`, String(e).split('\n')[0].slice(0, 160)) } finally { await s.ctx.close().catch(() => {}) }
}
try {
  console.log('p3-logout-phone v1', SZ)
  for (const key of (ONLY.length ? ONLY : Object.keys(CASES))) await one(key)
} catch (e) { console.error('FAILED', String(e).split('\n')[0]); process.exitCode = 1 } finally { await closeAll() }
