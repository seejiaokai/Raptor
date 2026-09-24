/* w4 probe — WHO makes Saturday's Unpublish warn "bid against" on the untouched everything week?
   Reads every man's Saturday box and his OIL balance off the OIL tracker (the Leave War's own screen). */
process.env.HP_SHOTS = 'C:/Users/User/projects/Raptor/raptor-port/docs/img/handpass/2026-09-24-amendment/w4/probe'
const L = await import('./w4-lib.mjs')
const { open, STATE, DESK, lwOpen, shot } = L
const { browser, page, errors } = await open({ ...DESK, state: STATE })
await lwOpen(page)
const ISO = process.env.W4_ISO || '2026-07-18'
const sat = await page.evaluate((iso) => {
  const o = {}
  for (const r of document.querySelectorAll('[data-testid^="row-"]')) {
    const id = r.getAttribute('data-testid').slice(4)
    const c = document.querySelector(`[data-testid="cell-${id}-${iso}"]`)
    o[id] = c ? (c.innerText || '').replace(/\s+/g, ' ').trim() : 'NO CELL'
  }
  return o
}, ISO)
await page.click('[data-testid="oil-tracker"]')
await page.waitForTimeout(1500)
await shot(page, 'p-oiltracker')
const bal = await page.evaluate(() => {
  const o = {}
  for (const r of document.querySelectorAll('[data-testid^="oil-row-"]')) {
    const id = r.getAttribute('data-oilrow')
    const b = r.querySelector(`[data-testid="oil-bal-${id}"]`)
    const nm = r.querySelector(`[data-testid="oil-name-${id}"]`)
    o[id] = { cs: (nm ? nm.innerText : '').replace(/\s+/g, ' ').trim().slice(0, 14), bal: b ? b.textContent.trim() : null,
      entries: [...r.querySelectorAll('[data-testid^="oil-entry-"]')].map(e => e.innerText.replace(/\s+/g, ' ').trim()).slice(0, 8) }
  }
  return o
})
for (const [id, box] of Object.entries(sat)) {
  if (!/FO|HO/.test(box)) continue
  const b = bal[id] || {}
  const worth = /FO/.test(box) ? 1 : 0.5
  const v = Number(String(b.bal).replace('−', '-'))
  const flag = v - worth < 0 ? '  <-- would go below zero without Saturday' : ''
  console.log(id.padEnd(10), (b.cs || '').padEnd(12), 'Sat', box.padEnd(6), 'OIL bal', String(b.bal).padEnd(6), flag, flag ? '| ' + (b.entries || []).join(' ;; ') : '')
}
console.log('errors', errors)
await browser.close()
