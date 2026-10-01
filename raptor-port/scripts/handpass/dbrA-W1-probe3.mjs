/* W1 probe 3 — a driver check: where the "Set as default" offer sits after a section drag on the board, and on the week. */
process.env.HP_URL ||= 'http://localhost:4201'
process.env.HP_SHOTS ||= 'C:/Users/User/projects/Raptor/raptor-port/docs/img/handpass/2026-09-30-dbrA/W1'
process.env.HP_OUT ||= 'C:/Users/User/AppData/Local/Temp/claude/dbrA-W1-probe.json'
const L = await import('./dbrA-lib.mjs')
const W = await import('./dbrA-W1-lib.mjs')
const { dragTo } = await import('./am/w1-lib.mjs')
const browser = await L.launch()
const ctx = await L.context(browser)
const errors = []
const p = await L.page(ctx, errors, 'A')
await L.signIn(p, 'a'); await W.toEdit(L, p)
const where = () => p.evaluate(() => {
  const b = document.querySelector('.secdef-btn.yes'); if (!b) return 'none'
  const bar = b.closest('[class*=secdef]') || b.parentElement
  const r = b.getBoundingClientRect(), cs = getComputedStyle(bar)
  const at = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2)
  return { box: [r.left, r.top, r.width, r.height].map(Math.round), vw: innerWidth, vh: innerHeight, pos: cs.position, z: cs.zIndex, op: cs.opacity, vis: cs.visibility, disp: cs.display,
    barCls: bar.className, atTop: at ? (at.className || at.tagName) + ' in ' + ((at.closest('#schedBoard') && 'board') || 'page') : 'nothing', boardZ: getComputedStyle(document.querySelector('#schedBoard') || document.body).zIndex }
})
await W.boardOn(p, 2)
const s0 = await p.evaluate(() => [...document.querySelectorAll('#schedBoard [data-secmove^="2."]')].filter(e => e.offsetParent !== null).map(e => e.dataset.secmove.split('.')[1]))
console.log('board drag', await dragTo(p, p.locator('#schedBoard [data-secmove="2.notes"] .secgrip:visible').first(), p.locator(`#schedBoard [data-secmove="2.${s0[2]}"]:visible`).first()))
await L.sleep(500)
console.log('on the board:', JSON.stringify(await where()))
await L.shot(p, '_probe3-board')
await W.boardOff(p)
await L.sleep(500)
console.log('board closed:', JSON.stringify(await where()))
await L.shot(p, '_probe3-week')
console.log('errors', errors)
await browser.close()
