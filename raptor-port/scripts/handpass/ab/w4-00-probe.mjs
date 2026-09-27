/* W4 probe (26 Sep 26): what the war draws for the money walk — the manning rows, the figure column, the drawer,
   the stage control, who is a pilot / WSO / SANS, and which men are free in the clean week (20 Jul on). READ ONLY.
   Usage (from raptor-port/): node scripts/handpass/ab/w4-00-probe.mjs [desktop|phone] */
const W = process.argv[2] || 'desktop'
process.env.AB_WHO = 'w4'
const L = await import('./ab-lib.mjs')
const { openHi } = await import('../am/w2-lib.mjs')
const PHONE = W === 'phone'
const { browser, page, errors } = await openHi({ width: PHONE ? 390 : 1440, height: PHONE ? 844 : 900, who: 'a', dpr: 1 })
const out = {}
await L.lwOpen(page, '2026-07-22')
out.chrome = await page.evaluate(() => [...document.querySelectorAll('[data-testid]')].filter(e => (e.offsetWidth || e.offsetHeight) && !/^(cell|mark|person|bal|cat|row|head|count-[a-z0-9]+-\d|potag|polast|drag)-/.test(e.getAttribute('data-testid')))
  .map(e => e.getAttribute('data-testid') + ':' + (e.innerText || e.value || '').replace(/\s+/g, ' ').trim().slice(0, 40)).slice(0, 80))
out.countRows = await page.evaluate(() => [...document.querySelectorAll('[data-testid^="count-"]')].filter(e => /^count-[a-z0-9]+$/i.test(e.getAttribute('data-testid'))).map(e => e.getAttribute('data-testid') + ':' + (e.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 30)))
out.countOn22 = await page.evaluate(() => [...document.querySelectorAll('[data-testid$="-2026-07-22"][data-testid^="count-"]')].map(e => e.getAttribute('data-testid') + '=' + (e.innerText || '').trim()))
out.people = await page.evaluate(() => Object.entries(window.PEOPLE).filter(([k, p]) => !p.special).map(([k, p]) => `${k}:${p.cs}:${p.seat}${p.san ? ':SANS' : ''}${p.pers ? ':PERS' : ''}${p.archived ? ':ARCH' : ''}`))
out.rows = await page.evaluate(() => [...document.querySelectorAll('[data-testid^="row-"]')].map(e => e.getAttribute('data-testid').slice(4)))
out.drawer = await page.evaluate(() => { const d = document.querySelector('[data-testid="figdrawer"]'); return d ? { vis: !!(d.offsetWidth || d.offsetHeight), heads: [...d.querySelectorAll('th[data-fig]')].map(t => t.getAttribute('data-fig') + ':' + t.innerText.trim()), sample: [...d.querySelectorAll('[data-person="bane"]')].map(e => e.getAttribute('data-fig') + '=' + (e.innerText || '').trim()).slice(0, 12) } : 'NO DRAWER' })
out.bal = await L.lwBalCol(page, 'bane')
out.figs = await L.figures(page, 'bane')
out.freeJul20wk = await page.evaluate(() => {
  const busy = new Set(window.INPUTS.filter(x => /Jul (2[0-9]|3[01])/.test(`${x.date} ${x.endDate || ''}`)).map(x => x.person))
  return Object.entries(window.PEOPLE).filter(([k, p]) => !p.special && !p.pers && !p.san && !p.archived && !busy.has(k)).map(([k, p]) => `${k}:${p.seat}`)
})
out.inputsJul = await page.evaluate(() => window.INPUTS.filter(x => /Jul|Aug/.test(x.date)).map(x => `${x.person} ${x.type} ${x.date}${x.endDate ? '-' + x.endDate : ''}`).slice(0, 40))
await L.shot(page, `w4-00-probe-${W}`)
out.errors = errors.slice(0, 10)
console.log(JSON.stringify(out, null, 1))
await browser.close()
