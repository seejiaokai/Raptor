/* rcsb-w2-n1 v1 — W2 N1 (On leave + planned) on the PC, then N3 (member's view) in the same browser.
   usage: node scripts/handpass/rcsb/w2/rcsb-w2-n1.mjs [pc|phone] */
const KIND = process.argv[2] || 'pc'
const C = await import('./rcsb-w2-common.mjs')
C.setShots(KIND === 'pc' ? 'N1' : 'N1-phone')
console.log('rcsb-w2-n1 v1', KIND, process.env.HP_SHOTS)
const { run, C: C2 } = await import('./rcsb-w2-warn.mjs')
const { w, Q, out } = await run({ kind: KIND, tag: 'N1', man: 'Vandal', di: 3, iso: '2026-07-16', type: 'LL', doPublish: KIND === 'pc' })
const { page } = w
const { R, X, L, sleep } = Q
if (KIND === 'pc') {
  // N3: sign out, sign in as the member in the same browser
  await page.locator('#logout:visible').first().click().catch(async () => { await page.locator('#burger').click(); await sleep(400); await page.locator('#drawerLogout').click() })
  await sleep(600)
  const conf = page.getByRole('button', { name: /^(Logout|Sign out|Yes|Confirm|OK)/ })
  if (!(await page.locator('#luser').isVisible().catch(() => false)) && await conf.count()) { await conf.first().click(); await sleep(500) }
  await page.fill('#luser', 'us'); await page.fill('#lpass', 'us'); await page.click('#loginForm button[type=submit]')
  await page.waitForSelector('#vWeek .day', { state: 'attached' }); await sleep(800)
  const me = await page.evaluate(() => (document.querySelector('#drawerAcct') || {}).innerText || '')
  console.log('signed in as', me)
  await L.go(page, 'viewsched'); await sleep(800)
  const vs = await X.stripItems(page, '#vWeek', 3)
  out.n3View = { head: vs.head, lines: vs.items.filter(t => t.includes('Vandal')) }
  await X.pic(page, 'd-N3-view-strip', '#vWeek [data-dwbox="3"]', { pad: 8 })
  console.log('N3 view', JSON.stringify(out.n3View))
  await L.go(page, 'logic'); await sleep(800)
  out.n3Logic = await page.evaluate(() => { const all = [...document.querySelectorAll('#page-logic *')].filter(e => e.offsetWidth); const pick = re => all.filter(e => re.test(e.innerText || '') && ![...e.children].some(c => re.test(c.innerText || ''))).map(e => e.innerText.replace(/[\s ]+/g, ' ').trim().slice(0, 80)); return { onleave: pick(/On leave \+ \w+/), downchit: pick(/Downchit \+ \w+/), flying: pick(/\+ flying/i) } })
  await page.evaluate(() => { const e = [...document.querySelectorAll('#page-logic *')].filter(x => x.offsetWidth && /On leave \+ \w+/.test(x.innerText || '') && ![...x.children].some(c => /On leave \+ \w+/.test(c.innerText || '')))[0]; if (e) e.scrollIntoView({ block: 'center' }) })
  await sleep(300)
  await R.shot(page, 'd-N3-logic')
  const sb = page.locator('#lgSearch'); out.n3Search = await sb.count()
  if (out.n3Search) { await sb.fill('planned'); await sleep(500); await R.shot(page, 'd-N3-logic-planned'); await sb.fill('') }
  out.n3Pages = await page.evaluate(() => [...document.querySelectorAll('#drawerNav a, nav a[data-page]')].map(a => a.innerText.trim()))
  console.log('N3 logic', JSON.stringify(out.n3Logic), 'search box', out.n3Search, 'pages', JSON.stringify(out.n3Pages))
  out.n3Errors = w.errors
}
const { writeFileSync } = await import('node:fs')
writeFileSync(process.env.HP_SHOTS + '/out.json', JSON.stringify(out, null, 1))
await w.browser.close()
