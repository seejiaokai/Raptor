// p3-menu - P3 case 2: on a phone, after a squadron is picked from the ☰ menu's squadron list (no window open), does the
// ☰ menu close? Saber (ad) on 142 presses ☰, the squadron line, then 149; the menu is read at once and a second later.
// No stand-ins: every step is a press.
//   node raptor-port/scripts/handpass/n175/p3-menu.mjs <p|ps|t>
// Picture (deciding): p3-menu-<size>-after-pick.png and -crop.png, the ☰ menu (or ☰ itself where closed) ringed.
import { mk, closeAll, FACT, signIn, barSq, pageOn, wait, decide, scratch, hit, vis, boxOf, covered } from './p3-lib.mjs'
const SZ = process.argv[2] || 'p'
const drawer = s => s.page.evaluate(() => { const d = document.querySelector('#drawer'); if (!d) return 'no menu element'; const r = d.getBoundingClientRect(); return { open: d.classList.contains('open'), onScreen: r.right > 2 && r.left < innerWidth - 2 && r.width > 2, box: { x: Math.round(r.left), w: Math.round(r.width) } } })
const k = `P3.menu.${SZ}`
const s = await mk(SZ)
try {
  console.log('p3-menu v1', SZ)
  await signIn(s, 'ad', 'a')
  FACT(`${k}.before`, { squadron: await barSq(s), page: await pageOn(s), burger: await covered(s, '#burger') })
  await hit(s, '#burger', 400)
  FACT(`${k}.menuAfterBurger`, await drawer(s))
  if (!(await s.page.locator('#drawerSqnList').count())) { FACT(`${k}.squadronLine`, (await vis(s, '#drawerSqnBtn').first().innerText().catch(() => null))?.replace(/\s+/g, ' ').trim() ?? 'no squadron line'); await hit(s, '#drawerSqnBtn', 400) }
  const rows = await s.page.evaluate(() => [...document.querySelectorAll('#drawerSqnList .sqm-row')].filter(e => e.getBoundingClientRect().width > 0).map(e => e.innerText.replace(/\s+/g, ' ').trim()))
  FACT(`${k}.listRows`, rows)
  await scratch(s, `menu-${SZ}-list-open`)
  const row = s.page.locator('#drawerSqnList .sqm-row', { has: s.page.locator('.sqm-num', { hasText: /^149$/ }) }).first()
  await row.evaluate(e => { const r = e.getBoundingClientRect(); if (r.bottom > innerHeight) e.scrollIntoView({ block: 'center' }) })
  const b = await row.boundingBox()
  await s.page.touchscreen.tap(b.x + b.width / 2, b.y + b.height / 2)
  await wait(s, 300)
  FACT(`${k}.menuJustAfterPick`, await drawer(s))
  await wait(s, 1200)
  const d = await drawer(s)
  FACT(`${k}.menuASecondAfterPick`, d)
  FACT(`${k}.after`, { squadron: await barSq(s), page: await pageOn(s) })
  await decide(s, `p3-menu-${SZ}-after-pick`, d.open ? ['#drawerSqnBtn', '#drawerLogout'] : '#burger', d.open ? ['#drawerSqnBtn', '#drawerRole', '#drawerLogout'] : ['#burger', '#sqnMenuBtn'])
} catch (e) { FACT(`${k}.error`, String(e).split('\n')[0].slice(0, 160)) } finally { await s.ctx.close().catch(() => {}); await closeAll() }
void boxOf
