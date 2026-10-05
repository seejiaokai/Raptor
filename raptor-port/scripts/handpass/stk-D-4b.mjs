import * as H from './stk-D-lib.mjs'
const { open, nav, sleep, pic, row, savePart } = H
for (const who of ['m', 'a']) {
  const { browser, page, errors } = await open({ width: 390, height: 844, who, fresh: false })
  await nav(page, 'viewsched')
  const info = await page.evaluate(() => {
    const e = document.querySelector('#editSchedMore'); const pg = document.querySelector('#page-editsched')
    const chain = []; let n = e; while (n && n !== document.body) { const cs = getComputedStyle(n); chain.push(n.id || n.className.toString().slice(0, 18) + ':' + cs.display + '/' + cs.visibility + '/' + cs.opacity + '/' + Math.round(n.getBoundingClientRect().width) + 'x' + Math.round(n.getBoundingClientRect().height)); n = n.parentElement }
    const r = e ? e.getBoundingClientRect() : null
    const hit = r ? document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2) : null
    return { exists: !!e, rect: r ? [Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height)] : null, hitIsIt: hit === e, hitId: hit ? (hit.id || hit.className.toString().slice(0, 20)) : null, chain: chain.slice(0, 8), pageClass: pg ? pg.className : null, curpage: window.CURPAGE }
  })
  console.log(who, JSON.stringify(info))
  row('P4d-05-recheck-' + who, `${who === 'm' ? 'member' : 'admin'} signed in fresh on a phone, on View-only Sched: is #editSchedMore drawn on screen?`, JSON.stringify(info), info.hitIsIt ? 'FAIL' : 'PASS', [await pic(page, 'P4d-05-recheck-' + who)])
  await browser.close()
}
savePart('world4b')
