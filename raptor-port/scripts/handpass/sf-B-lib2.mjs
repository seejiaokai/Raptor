/* WALKER B — more shared helpers for the standby-flies phone walk */
import { addWaveAndSeat, tapEl } from './sf-B-lib.mjs'

/** the scenario-9 Saturday (set-up by fillSlot, not under test): SC (AM four rows, PM one SPARE row), AVALON two rows, BB two rows */
export async function buildSat(p) {
  const sc = await addWaveAndSeat(p, 5, 'sc', [[0, 0], [0, 1], [0, 2], [0, 3], [1, 2]])
  const av = await addWaveAndSeat(p, 5, 'avalon', [[0, 0], [0, 1]])
  const bb = await addWaveAndSeat(p, 5, 'bb', [[0, 0], [0, 1]])
  return { sc, av, bb }
}

/** every Flies chip on screen (lit or dashed) with its wave container, whether it is a button, its size */
export const flyChips = (p, root) => p.evaluate(root => [...document.querySelectorAll(`${root} .saflies`)].filter(e => e.offsetParent && e.getBoundingClientRect().width > 1).map(e => ({ tag: e.tagName, lit: e.classList.contains('on'), ro: e.classList.contains('ro'), key: e.getAttribute('data-safly') || '', txt: e.innerText.trim(), title: e.title, inWave: !!e.closest('.go, .sb-go'), inDuty: !!e.closest('.sb-panel.duty, .dsec.duty, .duties'), w: Math.round(e.getBoundingClientRect().width), h: Math.round(e.getBoundingClientRect().height) })), root)

export async function logoutLogin(p, who) {
  await tapEl(p, p.locator('#burger'), { label: 'burger' })
  await tapEl(p, p.locator('button:visible').filter({ hasText: /^Logout$/ }), { label: 'logout' })
  await p.waitForSelector('#luser'); await p.waitForTimeout(500)
  await p.fill('#luser', who === 'a' ? 'ad' : 'us'); await p.fill('#lpass', who === 'a' ? 'a' : 'us')
  await tapEl(p, p.locator('#loginForm button[type=submit]'), { label: 'sign in' })
  await p.waitForSelector('#vWeek .day', { state: 'attached', timeout: 20000 }); await p.waitForTimeout(800)
}
