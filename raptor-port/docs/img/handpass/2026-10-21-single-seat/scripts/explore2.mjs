const L = await import('file:///C:/Users/User/projects/Raptor/.claude/worktrees/overnight-backlog-review-92da33/raptor-port/scripts/handpass/lib.mjs')
console.log('explore2 v1')
const { browser, page, errors } = await L.open({ width: 1400, height: 900 })
await L.go(page, 'editsched')
// the formation grid of Tuesday (day 1)
const html = await page.evaluate(() => {
  const d = document.querySelector('#eWeek [data-slot="1.0.0.0.p"]')
  let e = d
  for (let i = 0; i < 4; i++) e = e.parentElement
  return e.outerHTML.slice(0, 6000)
})
console.log(html)
const btns = await page.evaluate(() => [...document.querySelectorAll('#eWeek [data-addac],#eWeek [data-addform],#eWeek [data-addf],#eWeek [data-add]')].slice(0,20).map(e => e.outerHTML.slice(0,200)))
console.log(btns.join('\n'))
console.log(errors)
await browser.close()
