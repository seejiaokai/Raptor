const M = await import('./lw-m3b-w1-lib.mjs')
const { L, T } = M
const w = await M.start('desk')
const P = w.page
await L.press(w, 'button:has-text("Legend")'); await P.waitForTimeout(700)
const info = await P.evaluate(() => {
  const el = [...document.querySelectorAll('*')].filter(e => /WHAT THE GRID IS TELLING YOU/i.test(e.innerText || '') && e.children.length > 3).sort((a, b) => (a.innerText.length - b.innerText.length))[0]
  if (!el) return null
  const r = el.getBoundingClientRect()
  return { tid: el.dataset.testid || null, cls: el.className.toString().slice(0, 60), rect: [Math.round(r.left), Math.round(r.top), Math.round(r.width), Math.round(r.height)], scrollH: el.scrollHeight, clientH: el.clientHeight, text: el.innerText.replace(/\s+/g, ' ') }
})
console.log(JSON.stringify(info, null, 1))
await w.ctx.close(); await M.closeBrowser()
