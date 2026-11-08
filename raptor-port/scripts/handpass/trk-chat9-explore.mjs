process.env.HP_URL = 'http://localhost:4297'
process.env.HP_SHOTS = 'C:/Users/User/AppData/Local/Temp/claude/e5a9e348dc0d9712/48941a58-617e-4217-acf5-4197f9f0a2b3/scratchpad/ex'
const L = await import('./trk1105-walk-lib.mjs')
for (const [name, size, touch] of [['phone', L.P, true], ['pc', L.D, false]]) {
  const { page, browser } = await L.open({ size, touch, dpr: 1 })
  console.log('==', name)
  console.log(await page.evaluate(() => [...document.querySelectorAll('#page-tracker [id], #page-tracker button, #page-tracker select')].filter(e => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 }).filter(e => !e.closest('#flowSvg')).map(e => e.tagName[0] + '#' + e.id + '.' + (e.className && e.className.baseVal === undefined ? e.className : '') + ':' + (e.getAttribute('aria-label') || e.textContent || '').trim().slice(0, 24) + '@' + Math.round(e.getBoundingClientRect().left) + ',' + Math.round(e.getBoundingClientRect().top)).slice(0, 80).join('\n')))
  console.log(await page.evaluate(() => [...document.querySelectorAll('.topbar [id], .topbar button')].map(e => e.id + ':' + (e.textContent || '').trim().slice(0, 20)).join(' | ')))
  await browser.close()
}
