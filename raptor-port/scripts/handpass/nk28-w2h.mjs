// W2 part H: scenario 9 whole. Guest view on (Admin -> Users), a newcomer waits, "View the schedule", the guest page.
console.log('nk28-w2h v1')
const { world, L, vis, pic, sleep, closeAll, ok, note, firstTop, under, tapShot, nav } = await import('./nk28-w2lib.mjs')
process.env.W2_KEEP = '1'
const REST = 'this browser loses your work on a reload'
const list = async p => JSON.stringify(await p.evaluate(() => [...document.querySelectorAll('button, [role=button], select, input, textarea, a, label')].filter(e => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 && r.top >= 0 && r.top < 874 && r.left < 402 && r.right > 0 && e.checkVisibility({ opacityProperty: true, visibilityProperty: true }) && !e.closest('#drawer') }).slice(0, 40).map(e => (e.id || e.className.toString().split(' ')[0]) + '|' + (e.innerText || e.value || e.title || e.getAttribute('aria-label') || e.placeholder || '').trim().slice(0, 30).replace(/\n/g, ' ') + '|' + Math.round(e.getBoundingClientRect().left) + ',' + Math.round(e.getBoundingClientRect().top))))
const bandsAll = p => p.evaluate(() => [...document.querySelectorAll('.savestat, .saveband')].filter(e => e.checkVisibility({ opacityProperty: true, visibilityProperty: true })).map(e => { const r = e.getBoundingClientRect(); const b = e.querySelector('b'), rest = e.querySelector('.sv-rest'); return { cls: e.className, par: e.parentElement.className.toString().split(' ')[0], t: Math.round(r.top), b: Math.round(r.bottom), l: Math.round(r.left), r: Math.round(r.right), h: Math.round(r.height), bold: b && b.innerText, rest: rest && rest.innerText, cut: rest ? rest.scrollWidth > rest.clientWidth + 1 : null, btn: !!e.querySelector('button') } }))
const good = b => b.some(x => x.bold === 'Not kept' && x.rest === REST && !x.cut && !x.btn && x.h <= 40 && x.l === 0 && x.r === 402)
const w = await world(); const p = w.page
try {
  await L.login(p, 'a'); await sleep(500)
  await nav(p, 'admin'); await sleep(500)
  await p.tap('.adm-cat >> nth=0'); await sleep(900)
  await p.evaluate(() => { const h = [...document.querySelectorAll('h4')].find(h => /GUEST VIEW/i.test(h.innerText)); h.scrollIntoView({ block: 'start' }); const sc = [...document.querySelectorAll('*')].find(e => /auto|scroll/.test(getComputedStyle(e).overflowY) && e.scrollHeight > e.clientHeight + 50 && e.contains(h)); if (sc) sc.scrollTop += 0 })
  await sleep(500)
  await pic(p, 'probe-guest-section')
  console.log('controls', await list(p))
  console.log('guest section html', await p.evaluate(() => { const h = [...document.querySelectorAll('h4')].find(h => /GUEST VIEW/i.test(h.innerText)); return h.parentElement.innerText.replace(/\s+/g, ' ').slice(0, 400) + ' || ' + h.parentElement.innerHTML.slice(0, 600) }))
} catch (e) { ok('H', 'script', null, 'stopped: ' + String(e.message).split('\n')[0]); console.log(e.stack.split('\n').slice(0, 4).join('\n')) }
console.log('errors:', w.errors.length)
await w.ctx.close(); await closeAll()
