// Walker B, step 1 follow-up: sharp (device-scale) clips of the tab row and the first lines at 360 / 390, Chromium; WebKit 402.
process.env.LW_OUT ||= '../../docs/img/handpass/2026-10-27-lw-m4/b'
const B = await import('./lw-m4-walk-b-lib.mjs')
const { shot } = B
console.log('[lw-m4-walk-b1b v1]')
for (const [engine, W, H] of [['chromium', 360, 740], ['chromium', 390, 844], ['webkit', 402, 874]]) {
  const w = await B.newPhone(W, H, engine)
  await B.signIn(w, 'admin')
  await B.openApprovals(w)
  await w.page.evaluate(() => window.scrollTo(0, 0)); await B.sleep(w, 300)
  const tag = `${engine}-${W}`
  await shot(w, `s1b-${tag}-tabrow-sharp`, { scale: 'device', clip: { x: 0, y: 50, width: W, height: 50 } })
  await shot(w, `s1b-${tag}-lines-sharp`, { scale: 'device', clip: { x: 0, y: 320, width: W, height: 260 } })
  const m = await w.page.evaluate(() => {
    const tab = document.querySelector('[data-testid="lw-tab-approvals"]'), cnt = document.querySelector('[data-testid="lw-approvals-count"]')
    const t = tab.getBoundingClientRect(), c = cnt.getBoundingClientRect()
    const dates = [...document.querySelectorAll('[data-testid="approvals-page"] [data-testid="appr-dates"]')].slice(0, 6).map(e => { const r = e.getBoundingClientRect(); return { text: e.innerText.replace(/\s+/g, ' '), w: Math.round(r.width), h: Math.round(r.height) } })
    return { tab: { l: Math.round(t.left), r: Math.round(t.right) }, cnt: { l: Math.round(c.left), r: Math.round(c.right), text: cnt.innerText }, dates }
  })
  console.log(tag, JSON.stringify(m))
  await w.ctx.close()
}
await B.closeAll()
console.log('DONE')
