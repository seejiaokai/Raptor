// W1 probe: Inputs medical, input window, access (read-only discovery). Version: nk28-w1-probe v10
console.log('nk28-w1-probe v10')
const H = await import('./nk28-w1-lib.mjs')
const { L, world, sleep, tab, shot, vis } = H
const w = await world({})
const p = w.page
await p.waitForSelector('#luser')
await L.login(p, 'a')
await tab(p, 'inputs')
await p.click('#inMedBtn'); await sleep(1000)
await shot(p, 'probe-med')
console.log(await p.evaluate(() => document.body.innerText.replace(/\s+/g, ' ').slice(400, 1800)))
console.log(await p.evaluate(() => [...document.querySelectorAll('button, [role=button], a')].filter(a => { const r = a.getBoundingClientRect(); return r.width > 0 && r.top > 100 && r.top < 860 }).map(a => (a.id ? '#' + a.id : '') + '.' + String(a.className).split(' ').slice(0, 2).join('.') + ':' + (a.textContent || a.title || a.getAttribute('aria-label') || '').trim().replace(/\s+/g, ' ').slice(0, 22)).join(' | ').slice(0, 2000)))
await L.closeAll()
