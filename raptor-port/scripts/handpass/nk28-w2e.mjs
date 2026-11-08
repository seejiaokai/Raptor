// W2 part E: scenario 8 (sign out, unknown sign-in, request access) probe and run.
console.log('nk28-w2e v1')
const { world, L, vis, pic, sleep, closeAll, ok, note, firstTop, under, tapShot, nav } = await import('./nk28-w2lib.mjs')
process.env.W2_KEEP = '1'
const WIDE = process.env.WIDE === '1'
const sfx = WIDE ? '-wide' : ''
const list = async p => JSON.stringify(await p.evaluate(() => [...document.querySelectorAll('button, [role=button], select, input, textarea, a')].filter(e => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 && r.top >= 0 && r.top < 874 && r.left < 402 && r.right > 0 && e.checkVisibility({ opacityProperty: true, visibilityProperty: true }) }).slice(0, 40).map(e => (e.id || e.className.toString().split(' ')[0]) + '|' + (e.innerText || e.value || e.title || e.getAttribute('aria-label') || e.placeholder || '').trim().slice(0, 24).replace(/\n/g, ' ') + '|' + Math.round(e.getBoundingClientRect().left) + ',' + Math.round(e.getBoundingClientRect().top))))
const bandsAll = p => p.evaluate(() => [...document.querySelectorAll('.savestat, .saveband')].filter(e => e.checkVisibility({ opacityProperty: true, visibilityProperty: true })).map(e => { const r = e.getBoundingClientRect(); const b = e.querySelector('b'), rest = e.querySelector('.sv-rest'); return { cls: e.className, t: Math.round(r.top), b: Math.round(r.bottom), l: Math.round(r.left), r: Math.round(r.right), h: Math.round(r.height), bold: b && b.innerText, rest: rest && rest.innerText, cut: rest ? rest.scrollWidth > rest.clientWidth + 1 : null, text: e.innerText.replace(/\s+/g, ' ').trim().slice(0, 70) } }))
const w = await world({ wide: WIDE }); const p = w.page
try {
  await L.login(p, 'a'); await sleep(500)
  await p.tap('#burger'); await sleep(500)
  const f0 = await pic(p, 'S8-menu' + sfx)
  console.log('drawer', await list(p))
  await p.tap('#drawerLogout'); await sleep(1200)
  const f1 = await pic(p, 'S8-signedout' + sfx)
  const b1 = await bandsAll(p)
  ok('8', 'after sign out: sign-in screen with the band' + sfx, b1.some(x => x.bold === 'Not kept' && x.rest === 'this browser loses your work on a reload' && !x.cut), JSON.stringify(b1), f1)
  await p.fill('#luser', 'zz'); await p.fill('#lpass', 'zz')
  await p.tap('#loginForm button[type=submit], #go'); await sleep(1500)
  const f2 = await pic(p, 'S8-unknown' + sfx)
  const b2 = await bandsAll(p)
  note('8', 'unknown sign-in zz/zz' + sfx, `bands=${JSON.stringify(b2)}; controls: ${await list(p)}`, f2)
  const txt = await p.evaluate(() => document.body.innerText.replace(/\s+/g, ' ').slice(0, 400))
  note('8', 'text on the screen' + sfx, txt, f2)
} catch (e) { ok('E', 'script', null, 'stopped: ' + String(e.message).split('\n')[0]); console.log(e.stack.split('\n').slice(0, 4).join('\n')) }
if (w.errors.length) note('E', 'page errors', w.errors.slice(0, 10).join(' | '))
console.log('errors:', w.errors.length)
await w.ctx.close(); await closeAll()
