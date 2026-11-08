console.log('nk28-w2probe v6')
const { world, L, vis, pic, sleep, closeAll, nav } = await import('./nk28-w2lib.mjs')
const w = await world(); const p = w.page
await L.login(p, 'a')
const list = async label => console.log(label, JSON.stringify(await p.evaluate(() => [...document.querySelectorAll('button, [role=button], a, select, input, textarea, img, canvas, iframe')].filter(e => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 && r.top >= 0 && r.top < 874 && r.left < 402 && r.right > 0 && !e.closest('#drawer') && e.checkVisibility({ opacityProperty: true, visibilityProperty: true }) }).slice(0, 40).map(e => e.tagName.toLowerCase() + (e.id ? '#' + e.id : '.' + e.className.toString().split(' ')[0]) + '|' + (e.innerText || e.title || e.getAttribute('aria-label') || '').trim().slice(0, 22).replace(/\n/g, ' ') + '|' + Math.round(e.getBoundingClientRect().left) + ',' + Math.round(e.getBoundingClientRect().top)))))
await nav(p, 'inputs'); await p.tap('#inMedBtn'); await sleep(900)
await p.tap('.medcard >> nth=3'); await sleep(1200); await pic(p, 'probe-zenith'); await list('ZEN')
console.log(w.errors.join('\n'))
await closeAll()
