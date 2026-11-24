// p2-probe - finding the controls only (not a case): Admin's sections, an opened Users row, the Archived fold, Squadrons,
// and the sign-in of a name on no list.   node raptor-port/scripts/handpass/n175/p2-probe.mjs <d|p>
import { mk, closeAll, signIn, go, wait, vis, hit, scratch } from './lib.mjs'
const SZ = process.argv[2] || 'd'
const ctl = (s, root) => s.page.evaluate(r => [...document.querySelectorAll(r + ' button, ' + r + ' input, ' + r + ' select, ' + r + ' textarea')].filter(e => e.getBoundingClientRect().width > 0).map(e => `${e.tagName.toLowerCase()}${e.id ? '#' + e.id : ''}${e.getAttribute('data-line') ? '[line=' + e.getAttribute('data-line') + ']' : ''}${e.getAttribute('aria-label') ? '"' + e.getAttribute('aria-label') + '"' : ''} ${(e.textContent || e.value || '').trim().slice(0, 30)}`), root)
const s = await mk(SZ)
try {
  await signIn(s, 'ad', 'a')
  await go(s, 'admin'); await wait(s, 800)
  if (await vis(s, '.adm-back').count()) await hit(s, '.adm-back')
  const t = vis(s, '#page-admin button.adm-cat').filter({ hasText: /^Users/ }); if (await t.count()) await hit(s, t.first(), 600)
  const txt = (await s.page.locator('#page-admin').innerText()).replace(/\s+/g, ' ')
  console.log('ARCHIVED?', txt.match(/Archived[^A-Z]{0,30}/g))
  await hit(s, s.page.locator('[data-person="prowler"] .acc-tap').first(), 800)
  console.log('ROWCTL', await ctl(s, '[data-person="prowler"]'))
  await scratch(s, 'p2', `probe-row-${SZ}`)
  console.log('ADDFORM', await ctl(s, '#page-admin [data-testid="acc-add"], #page-admin .acc-add, #page-admin form'))
  console.log('FOOTBTNS', await s.page.evaluate(() => [...document.querySelectorAll('#page-admin button')].filter(e => e.getBoundingClientRect().width > 0).map(e => (e.id ? '#' + e.id + ' ' : '') + e.textContent.trim().slice(0, 30)).slice(-12)))
  console.log('ADMINCATS', await s.page.evaluate(() => [...document.querySelectorAll('#page-admin .adm-cat')].map(e => e.textContent.trim() + ' w=' + Math.round(e.getBoundingClientRect().width))))
} finally { await closeAll() }
const s2 = await mk(SZ)
try {
  await s2.page.goto('http://localhost:4700/'); await s2.page.waitForSelector('#luser')
  await s2.page.fill('#luser', 'n175new'); await s2.page.fill('#lpass', 'x'); await s2.page.click('#loginForm button[type=submit]'); await wait(s2, 1500)
  console.log('UNKNOWN', (await s2.page.locator('body').innerText()).replace(/\s+/g, ' ').slice(0, 400))
} finally { await closeAll() }
