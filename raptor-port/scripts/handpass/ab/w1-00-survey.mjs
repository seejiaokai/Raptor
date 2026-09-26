/* W1 survey (26 Sep 26): the Inputs calendar in July, fresh demo world, desktop and phone — what is drawn where,
   which days are crowded, who is free. Not an assertion script; it records the starting picture. */
process.env.AB_WHO = 'w1'
const L = await import('./w1-lib.mjs')
const S = await import('./ab-sched.mjs')
const { openHi } = await import('../am/w2-lib.mjs')
const W = process.argv[2] || 'desktop'
const PH = W === 'phone'
const { browser, page, errors } = await openHi({ width: PH ? 390 : 1440, height: PH ? 844 : 900, who: 'a', dpr: PH ? 3 : 1 })
console.log('month', await L.calOpen(page, '2026-07'))
await L.shot(page, `w1-00-survey-july-${W}`)
const days = await page.evaluate(() => [...document.querySelectorAll('#inpCal [data-icday]')].map(c => ({
  d: c.getAttribute('data-icday'), n: c.querySelectorAll('.ic-inrow [data-iid]').length, more: (c.querySelector('.ic-more')?.innerText || '').trim(),
  chips: [...c.querySelectorAll('.ic-inrow [data-iid]')].map(e => (e.innerText || '').trim()).join(' | ') })).filter(x => x.n))
console.log(JSON.stringify(days, null, 0))
const inp = await page.evaluate(() => window.INPUTS.filter(x => /Jul|Aug/.test(x.date + (x.endDate || ''))).map(x => `${x.iid} ${x.person} ${x.type} ${x.date}${x.endDate ? '-' + x.endDate : ''} ${x.allday ? 'all' : (x.s + '-' + x.e)} ${x.half || ''}`))
console.log(inp.length, inp.slice(0, 60).join('\n'))
console.log('free Mon-Fri demo week', JSON.stringify(await S.freeMen(page, [0, 1, 2, 3, 4, 5, 6])))
const cs = await page.evaluate(() => Object.fromEntries(Object.entries(window.PEOPLE).filter(([k, p]) => p.seat === 'FCP' || p.seat === 'RCP').map(([k, p]) => [k, p.cs])))
console.log(JSON.stringify(cs))
console.log('errors', errors)
await browser.close()
