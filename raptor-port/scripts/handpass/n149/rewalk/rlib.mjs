// Re-walk of the fixes (night of 22–23 Nov 26) — helpers shared by r1–r7, on top of the FULL walk's own (../walk/lib.mjs,
// ../walk/w1-view.mjs). Every step presses the app's own controls; the page is read for facts only.
// Run from raptor-port/ with the build in dist/: MQ_PORT=<a free port> MQ_OUT=<a folder outside the checkout> node <script>
import { note, facts, shot, signIn, vis, text } from '../walk/lib.mjs'

export async function step(name, fn) {
  try { await fn() } catch (e) { const m = String(e).split('\n')[0]; note(`STEP FAILED ${name}: ${m}`); facts[`fail:${name}`] = m }
}
export async function logout(s) {
  const { page } = s
  await page.keyboard.press('Escape').catch(() => {})
  if (await page.locator('#accOut:visible').count()) await page.click('#accOut')
  else if (await page.locator('#logout:visible').count()) await page.click('#logout')
  else { await page.click('#burger'); await page.waitForTimeout(300); await page.click('#drawerLogout') }
  await page.waitForSelector('#luser', { timeout: 20000 }); await page.waitForTimeout(500)
}
export async function as(s, user, pass) { await logout(s); await signIn(s, user, pass) }

/* a press as a person makes it: a finger on the phone (a picture ~60 ms after it when `quick` names one), a mouse on the
   desktop. Returns false when the control is not there. */
export async function press(s, sel, quick) {
  const l = s.page.locator(sel).first()
  if (!(await l.count())) { note(`[${s.sz}] no control ${sel}`); return false }
  if (s.desk) await l.click(); else await l.tap()
  if (!s.desk && quick) { await s.page.waitForTimeout(60); await s.page.screenshot({ path: `${process.env.MQ_OUT}/${quick}-justtapped.png` }) }
  await s.page.waitForTimeout(450)
  return true
}

/* the ☰ menu: open it by its button, read its page names, close it by a tap on the shade beside it */
export async function drawerOpen(s, quick) { return press(s, '#burger', quick) }
export const drawerItems = s => s.page.evaluate(() => [...document.querySelectorAll('#drawerNav a')].filter(a => a.getBoundingClientRect().height > 0).map(a => a.textContent.replace(/\d+$/, '').trim()))
export async function drawerCloseOutside(s) {
  const { page } = s
  const W = page.viewportSize().width
  if (s.desk) await page.mouse.click(W - 8, 500); else await page.touchscreen.tap(W - 8, 500)
  await page.waitForTimeout(400)
  return !(await vis(s, '#drawer.open'))
}
/* the top bar's page names on a desktop */
export const barTabs = s => s.page.evaluate(() => [...document.querySelectorAll('#topnav a, .topnav a, nav.tabs a, .tabs a, header a[data-page]')].filter(e => e.getBoundingClientRect().width > 0).map(e => e.textContent.replace(/\d+$/, '').trim()))
export const pageOn = s => s.page.evaluate(() => { const p = document.querySelector('.page.on'); return p ? p.id : null })
export const adminPanel = s => s.page.evaluate(() => { const c = document.querySelector('#page-admin .adm-cat.on .adm-cat-l'); return c ? c.textContent.replace(/\d+$/, '').trim() : null })
export const sqRows = s => s.page.evaluate(() => [...document.querySelectorAll('#sqList [data-unit]')].map(r => r.getAttribute('data-unit')))
export const bellChips = s => s.page.evaluate(() => [...document.querySelectorAll('[data-testid="bell-show"] .fchip')].map(c => c.textContent.trim() + ':' + c.getAttribute('aria-pressed')))
export { shot, vis, text }
