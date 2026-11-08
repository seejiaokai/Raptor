// React Doctor's last findings ([RD-LEFT-1108]) — Walker A's shared parts: a world on a built folder, the controls a
// person presses, and the fixtures (Astra's people) made through the app's own controls, the same on both builds.
// (Named -a- because walker B's own rdl1108-lib.mjs sits beside it.)
import { chromium, webkit, LAUNCH, serveDist } from '../drawcheck/lib.mjs'
export { chromium, webkit, LAUNCH }
export const NOW = new Date('2026-11-08T09:00:00+08:00')
export const QUIET = '*{scroll-behavior:auto !important} *,*::before,*::after{transition:none !important;animation:none !important;caret-color:transparent !important}'
export const QUIET_CARET = '*{scroll-behavior:auto !important} *,*::before,*::after{transition:none !important;animation:none !important}'
const NL = String.fromCharCode(10)
export const firstLine = e => String(e && e.message || e).split(NL)[0]
export const V = sel => `${sel} >> visible=true`
export const phoneOf = p => p.viewportSize().width < 600
export const press = async (p, sel, n = 0) => {
  const l = p.locator(V(sel)).nth(n)
  try { phoneOf(p) ? await l.tap({ timeout: 6000 }) : await l.click({ timeout: 6000 }) } catch (e) { throw new Error(`pressing ${sel}: ${firstLine(e)}`) }
  await p.clock.runFor(450)
}
export const pressText = async (p, sel, text) => {
  const l = p.locator(V(sel)).filter({ hasText: text }).first()
  try { phoneOf(p) ? await l.tap({ timeout: 6000 }) : await l.click({ timeout: 6000 }) } catch (e) { throw new Error(`pressing ${sel} "${text}": ${firstLine(e)}`) }
  await p.clock.runFor(450)
}
export async function tab(p, page) {
  if (phoneOf(p)) { await press(p, '#burger'); await press(p, `#drawerNav a[data-page="${page}"]`) }
  else await press(p, `#topnav a[data-page="${page}"]`)
  await p.clock.runFor(900)
}
export async function signIn(p, user = 'ad', pass = 'a') {
  await p.fill('#luser', user); await p.fill('#lpass', pass); await p.click('#loginForm button[type=submit]')
  await p.waitForSelector('#vWeek .day', { state: 'attached', timeout: 20000 }); await p.clock.runFor(1500)
  await p.addStyleTag({ content: QUIET }).catch(() => {})
}
export async function logout(p) {
  if (phoneOf(p)) { await press(p, '#burger'); await press(p, '#drawerLogout') } else await press(p, '#logout')
  await p.clock.runFor(700)
}
export async function world(br, dist, origin, { phone = false, q = '?fresh=1', user = 'ad', pass = 'a', quiet = QUIET, noSign = false } = {}) {
  const ctx = await br.newContext(phone ? { viewport: { width: 402, height: 874 }, deviceScaleFactor: 3, hasTouch: true } : { viewport: { width: 1536, height: 864 }, deviceScaleFactor: 1.25 })
  await serveDist(ctx, origin, dist)
  const p = await ctx.newPage()
  const errs = [], bad = []
  p.on('pageerror', e => errs.push(firstLine(e)))
  p.on('console', m => { if (m.type() === 'error') errs.push('console: ' + m.text().slice(0, 160)) })
  p.on('response', r => { if (r.status() >= 400) bad.push(r.status() + ' ' + r.url().slice(0, 100)) })
  await p.clock.install({ time: NOW }); await p.clock.pauseAt(new Date(NOW.getTime() + 5000))
  await p.goto(origin + '/' + q)
  await p.addStyleTag({ content: quiet }).catch(() => {})
  if (!noSign) await signIn(p, user, pass)
  return { ctx, p, errs, bad }
}
/* Admin → category. Desktop: the rail; phone: the category list then drilled in */
export async function adminCat(p, label) {
  await tab(p, 'admin')
  if (phoneOf(p) && await p.locator(V('.adm-back')).count()) await press(p, '.adm-back')
  await pressText(p, '.adm-cat', label)
  await p.clock.runFor(500)
}
/* make a person through Admin → Users → Add a person */
export async function addPerson(p, { cs, ini = 'RX', seat = 'FCP', cat = 'C', signin = '', role = 'main' }) {
  const f = async (sel, v) => { const l = p.locator(V(sel)).first(); await l.scrollIntoViewIfNeeded(); await l.fill(v) }
  await f('#accAddCs', cs); await f('#accAddIni', ini)
  await p.locator(V('#accAddSeat')).first().selectOption(seat)
  if (seat !== 'GND') await p.locator(V('#accAddCat')).first().selectOption(cat)
  if (signin) { await f('#accAddName', signin); await p.locator(V('#accAddRole')).first().selectOption(role) }
  await p.locator(V('#accAdd')).first().scrollIntoViewIfNeeded()
  await press(p, '#accAdd')
}
export const rowOf = (p, cs, arch = false) => p.locator(V(arch ? '.acc-row[data-archived="1"]' : '.acc-row[data-person]:not([data-archived])')).filter({ has: p.locator('.acc-name', { hasText: new RegExp('^' + cs + '$') }) }).first()
export async function openRow(p, cs, arch = false) { const r = rowOf(p, cs, arch); await r.scrollIntoViewIfNeeded(); await (phoneOf(p) ? r.locator('.acc-main').tap() : r.locator('.acc-main').click()); await p.clock.runFor(450) }
/* the toast now ('' when none) */
export const note = p => p.evaluate(() => { const t = document.getElementById('toastEl'); return t && +getComputedStyle(t).opacity > 0.5 ? (t.textContent || '').trim() : '' })
/* the people on the Users page, in order, with the dots/line each draws */
export const rowsText = p => p.evaluate(() => [...document.querySelectorAll('#accList .acc-row[data-person], #accArchList .acc-row[data-person]')].filter(r => r.getBoundingClientRect().height > 0).map(r => (r.querySelector('.acc-name')?.textContent || '') + ' | ' + (r.querySelector('.acc-sub')?.textContent || '') + ' | ' + (r.querySelector('.od-rc')?.textContent || '') + ' | dots:' + [...r.querySelectorAll('.od-c')].map(d => d.getAttribute('title') || d.getAttribute('aria-label')).join(',') + ' | ' + (r.querySelector('.acc-held,.od-po')?.textContent || '')))
/* the fixtures: Astra's people. Leaves the world signed in as the admin on the Users page. */
export async function fixtures(p) {
  await adminCat(p, 'Users')
  await addPerson(p, { cs: 'RDACTIVE', seat: 'FCP', cat: 'C', signin: 'rdactive@example.test' })
  await addPerson(p, { cs: 'RDWSO', seat: 'RCP', cat: 'B', signin: 'rdwso@example.test' })
  await addPerson(p, { cs: 'RDGROUND', seat: 'GND' })
  await addPerson(p, { cs: 'RDNOSIGN', seat: 'FCP', cat: 'C' })
  await addPerson(p, { cs: 'RDSUSP', seat: 'FCP', cat: 'C', signin: 'rdsusp@example.test' })
  await addPerson(p, { cs: 'RDADMIN2', seat: 'FCP', cat: 'C', signin: 'rdadmin2@example.test', role: 'admin' })
  await addPerson(p, { cs: 'RDARCH', seat: 'FCP', cat: 'C', signin: 'rdarch@example.test' })
  await addPerson(p, { cs: 'RDARCHN', seat: 'RCP', cat: 'B' })
  await addPerson(p, { cs: 'RDARCHF', seat: 'FCP', cat: 'C', signin: 'rdarchf@example.test' })
  await openRow(p, 'RDSUSP'); await press(p, '#accEdOnOff')
  for (const cs of ['RDARCH', 'RDARCHN', 'RDARCHF']) { await openRow(p, cs); await press(p, '#accEdArchive') }
  /* the archived callsign RDARCH taken by a different, active person */
  await addPerson(p, { cs: 'RDARCH', seat: 'RCP', cat: 'B', ini: 'RY' })
}
/* sign out, ask for access as a newcomer, then (unless keepOn) sign back in as the admin */
export async function request(p, { user = 'rdrequest@example.test', cs = 'RDREQUEST', ini = 'RQ', seat = 'FCP', cat = 'D', keepOn = false } = {}) {
  await logout(p)
  await p.fill('#luser', user); await p.fill('#lpass', 'x'); await p.click('#loginForm button[type=submit]'); await p.clock.runFor(900)
  await p.fill('#accCs', cs); await p.fill('#accIni', ini); await p.selectOption('#accSeat', seat)
  if (seat !== 'GND') await p.selectOption('#accCat', cat)
  await press(p, '#accSend'); await p.clock.runFor(900)
  if (keepOn) return
  await press(p, '#accOut'); await p.clock.runFor(700)
  await signIn(p)
}
