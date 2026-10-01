/* Scenario 18 — every ordinary page, width and eligible role opens the identical window. (Guest excluded.) */
import * as S from './ins-s-lib2.mjs'
const { B, L, W } = S
const { judge, row, pic, savePart, TUE } = B
B.prefix('s18-')
const { browser, p, errors } = await B.world()
const ph = !!process.env.HP_PHONE
const ALL = ['viewsched', 'editsched', 'inputs', 'quals', 'logic', 'leavewar', 'tracker', 'help', 'admin']
let expected = null
async function sweep(id, label, pages, picPages) {
  const checks = [], shots = []
  for (const pg of pages) {
    await L.go(p, pg).catch(e => null)
    const at = await p.evaluate(() => window.CURPAGE)
    if (at !== pg) { checks.push([`${pg}: page reached`, false, `landed on ${at}`]); continue }
    await S.sleep(500)
    const o = await S.openIns(p)
    const r = await S.readIns(p)
    if (r.none) { checks.push([`${pg}: window opened`, false, JSON.stringify(o)]); continue }
    const inView = r.box.top >= 0 && r.box.bottom <= r.vh + 1 && r.box.w <= r.vw
    const same = S.same(r, expected)
    const bad = []
    if (!same) bad.push('CONTENT DIFFERS: ' + S.delta(expected, r).slice(0, 250))
    if (!r.topmost) bad.push('NOT topmost at its centre')
    if (!inView) bad.push(`clipped box ${JSON.stringify(r.box)} in ${r.vw}x${r.vh}`)
    if (!r.scrolls) bad.push('does not scroll')
    checks.push([`${pg}: ${o.how}; title "${r.title}"; box ${r.box.w}x${r.box.h}; scrolls ${r.sh}/${r.ch}`, bad.length === 0, bad.join(' | ')])
    if (picPages.includes(pg)) shots.push(await pic(p, `s18-${id}-${pg}`))
    await S.closeIns(p)
  }
  judge(`18.${id}`, label, checks, shots)
}
try {
  await B.toEdit(p)
  await S.publish(p, TUE, 'orig')
  await S.takeOff(p, TUE, '1.1.1.0.p'); await B.toEdit(p)
  const d = await S.dayState(p, TUE, { view: false })
  const rE = await S.look(p, 's18-a-expected')
  expected = rE
  row('18.a', 'Tuesday published (Original), then a waiting change (Rebel off): the expected window text recorded on Edit Schedule', `Tuesday chip "${d.pending}" · ${S.brief(rE).slice(0, 200)} · opened by: ${rE.how}`, 'RECORDED', [rE.shot])
  /* ADMIN */
  await sweep('b', `as admin (Saber), every page (${ph ? '390×844' : '1440×900'})`, ALL, ph ? ['editsched', 'viewsched', 'inputs', 'leavewar', 'tracker', 'admin'] : ALL)
  /* the admin's switch to the member view */
  await L.go(p, 'viewsched')
  let sw
  if (ph) { await p.locator('#burger:visible').first().click(); await S.sleep(400); sw = await p.locator('#drawerRole:visible').first().click().then(() => 'drawer: Switch to the member view', () => 'no switch in the drawer') }
  else { sw = await p.locator('#roleBadge').first().click().then(() => 'role badge pressed', () => 'no role badge') }
  await S.sleep(700)
  const role = await p.evaluate(() => (document.querySelector('#roleBadge') || document.querySelector('#drawerAcct') || {}).innerText)
  const pgs = ['viewsched', 'inputs', 'quals', 'logic', 'leavewar', 'tracker', 'help']
  await sweep('c', `admin switched to the member view (${sw}; badge/acct reads "${String(role).replace(/\s+/g, ' ').slice(0, 60)}"), every page he now has`, pgs, ph ? ['viewsched', 'leavewar'] : ['viewsched', 'inputs', 'leavewar', 'help'])
  /* back, then a genuine member sign-in */
  if (ph) { await p.locator('#burger:visible').first().click(); await S.sleep(400); await p.locator('#drawerRole:visible').first().click().catch(() => {}) } else await p.locator('#roleBadge').first().click().catch(() => {})
  await S.sleep(500)
  await B.reloadAs(p, 'm'); await S.sleep(500)
  const who = await p.evaluate(() => (document.querySelector('#roleBadge') || document.querySelector('#drawerAcct') || {}).innerText)
  await sweep('d', `signed in as the member (Ranger; "${String(who).replace(/\s+/g, ' ').slice(0, 50)}"), every page`, pgs, ph ? ['viewsched', 'tracker', 'logic'] : ['viewsched', 'inputs', 'quals', 'logic', 'leavewar', 'tracker', 'help'])
} catch (e) { row('18.X', 'the script stopped', String(e && e.stack || e).slice(0, 1500), 'FAIL', [await pic(p, 's18-X-error')]) }
row('18.err', "the browser's error list", errors.length ? errors.join(' | ').slice(0, 800) : 'none', errors.length ? 'FAIL' : 'PASS')
savePart('s18', { errors })
await browser.close()
