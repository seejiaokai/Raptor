process.env.RCB2_DIST = 'C:/Users/User/AppData/Local/Temp/claude/37df10f156419f1e/6e376de7-ce28-4b0e-ad14-7848f71c5f9a/scratchpad/frozen-f01e1e416'
process.env.RCB2_BUNDLE = 'index-DDDelbBP.js'
process.env.RCB2_RUN = 'probe10'
const X = await import('./rcb2-w3-lib.mjs')
const { L, say, sleep } = X
const w = await X.open({ phone: true }); const { page } = w
await L.go(page, 'editsched'); await sleep(400)
await X.press(w, '.filt-cal'); await page.waitForSelector('#weekCal:not([hidden]) .airpop-box')
say('cal', await page.evaluate(() => [...document.querySelectorAll('#weekCal button, #weekCal [data-iso]')].filter(e => e.offsetWidth).map(e => (e.id || e.className) + '|' + (e.dataset.iso || e.getAttribute('aria-label') || e.innerText.trim())).slice(0, 60).join(' ; ')))
await X.fin(w)
