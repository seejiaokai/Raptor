// swl-w1B-probe5 — walker B (chat 203): a new line's box names (read only), the print / export controls on each page, the
// phone's route to Export as PDF. SWLB_RUN=probe5 SZ=d|p node scripts/handpass/swl-w1B-probe5.mjs
import './swl-w1B-env.mjs'
const B = await import('./swl-w1B-lib.mjs')
const { T, L, A, J, sleep } = B
const SZ = process.env.SZ || 'd'
console.log('VERSION swl-w1B-probe5 1 · size', SZ)
const ctrls = p => p.evaluate(() => [...document.querySelectorAll('button, a, [role="button"], [role="menuitem"]')].filter(e => { const r = e.getBoundingClientRect(); return r.width > 0 && /print|pdf|export/i.test((e.innerText || '') + ' ' + (e.id || '') + ' ' + (e.getAttribute('title') || '')) }).map(e => `${e.id || e.tagName}:"${(e.innerText || '').trim().slice(0, 40)}" title "${e.getAttribute('title') || ''}"`))
await T.run('probe5', SZ, async (p, W) => {
  const a = await A.addLine(p, W, 4, { cs: 'VL', to: '13:00', ld: '14:00' })
  const keys = await p.evaluate(wi => [...document.querySelectorAll(`#schedBoard [data-bfld^="ff:4.${wi}.0."]`)].map(e => e.dataset.bfld + '=' + (e.value || '')), a.wi)
  W.rec('keys', 'the new line\'s boxes', 'REC', keys.join(' , '))
  W.rec('board-ctrl', 'print / export controls on the board', 'REC', (await ctrls(p)).join(' | '))
  await L.closeBoard(p, W)
  for (const pg of ['editsched', 'viewsched']) {
    await L.go(p, pg)
    W.rec(pg, 'print / export controls on ' + pg, 'REC', (await ctrls(p)).join(' | ') || 'none drawn', await W.pic(p, pg))
    if (W.isPhone && await p.locator('#burger:visible').count()) {
      await W.press(p, '#burger:visible', 'burger'); await sleep(500)
      W.rec(pg + '-burger', 'in the ☰ drawer', 'REC', (await ctrls(p)).join(' | ') || 'none', await W.pic(p, pg + '-burger'))
      await p.keyboard.press('Escape'); await sleep(300)
      if (await p.locator('#drawerClose:visible, .drawer-x:visible').count()) await W.press(p, p.locator('#drawerClose:visible, .drawer-x:visible').first(), 'drawer-x')
    }
  }
})
