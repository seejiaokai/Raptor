/* Survey (26 Sep 26): what the demo world gives the absence-record walk on a fresh start — the wars, the stage, the
   July week's absences on the war and on the Inputs page, the doors a tap opens — admin and member, desktop. Read only. */
process.env.AB_WHO = 'survey'
const L = await import('./ab-lib.mjs')
const { open, go, lwOpen, lwTap, lwCloseSheet, shot, norm } = L
const out = {}
const { browser, page, errors } = await open({ width: 1440, height: 900, who: 'a', fresh: false })
await lwOpen(page, '2026-07-15')
out.adminWar = await page.evaluate(() => ({
  label: (document.querySelector('[data-testid="period-label"]') || {}).innerText,
  picker: [...document.querySelectorAll('[data-testid="war-picker"] option, [data-testid="war-picker"] button')].map(e => e.innerText.trim()).slice(0, 8),
  stage: (document.querySelector('[data-testid="stage-now"]') || {}).innerText,
  rows: document.querySelectorAll('[data-testid^="row-"]').length,
  viewer: (document.querySelector('[data-testid="lw-viewing"]') || {}).innerText,
}))
out.julyCells = await page.evaluate(() => {
  const days = ['2026-07-13', '2026-07-14', '2026-07-15', '2026-07-16', '2026-07-17', '2026-07-18', '2026-07-19']
  const o = {}
  for (const r of document.querySelectorAll('[data-testid^="row-"]')) {
    const id = r.getAttribute('data-testid').slice(4)
    const cells = days.map(d => { const c = document.querySelector(`[data-testid="cell-${id}-${d}"]`); const m = document.querySelector(`[data-testid="mark-${id}-${d}"]`); return c ? ((c.innerText || '').replace(/\s+/g, ' ').trim() + (m ? '[' + m.innerText.trim() + ']' : '')) : '·' })
    if (cells.some(x => x && x !== '·')) o[id] = cells.join(' | ')
  }
  return o
})
await shot(page, 'survey-war-july-admin')
out.tapTaipan = await lwTap(page, 'taipan', '2026-07-15'); await shot(page, 'survey-tap-taipan'); await lwCloseSheet(page)
out.tapSufa = await lwTap(page, 'sufa', '2026-07-14'); await shot(page, 'survey-tap-sufa'); await lwCloseSheet(page)
await go(page, 'inputs'); await page.waitForTimeout(600)
out.inputsPage = await page.evaluate(() => ({
  buttons: [...document.querySelectorAll('#page-inputs button, [id^="in"] button')].filter(b => b.offsetWidth).map(b => (b.id || '') + ':' + b.innerText.replace(/\s+/g, ' ').trim().slice(0, 30)).slice(0, 60),
  ids: [...document.querySelectorAll('[id^="in"]')].map(e => e.id).slice(0, 80),
  rows: document.querySelectorAll('#inTable tr, .in-row, table tr').length,
}))
await shot(page, 'survey-inputs-admin')
out.counts = await page.evaluate(() => ({ inputs: window.INPUTS.length, people: Object.keys(window.PEOPLE).length }))
out.errors = errors.slice()
await browser.close()
console.log(JSON.stringify(out, null, 1))
