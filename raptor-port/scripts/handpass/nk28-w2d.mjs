// W2 part D: scenario 7 (question box) and a look at scenario 8 (sign out, unknown sign-in, request access).
console.log('nk28-w2d v1')
const { world, L, vis, pic, sleep, closeAll, ok, note, firstTop, under, tapShot, nav } = await import('./nk28-w2lib.mjs')
process.env.W2_KEEP = '1'
const BAND = '.topbar > .savestat.nokeep'
const list = async p => JSON.stringify(await p.evaluate(() => [...document.querySelectorAll('button, [role=button], select, input, textarea, a')].filter(e => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 && r.top >= 0 && r.top < 874 && r.left < 402 && r.right > 0 && e.checkVisibility({ opacityProperty: true, visibilityProperty: true }) }).slice(0, 40).map(e => (e.id || e.className.toString().split(' ')[0]) + '|' + (e.innerText || e.value || e.title || e.getAttribute('aria-label') || '').trim().slice(0, 24).replace(/\n/g, ' ') + '|' + Math.round(e.getBoundingClientRect().left) + ',' + Math.round(e.getBoundingClientRect().top))))
const bandsAll = p => p.evaluate(() => [...document.querySelectorAll('.savestat, .saveband')].filter(e => e.checkVisibility({ opacityProperty: true, visibilityProperty: true })).map(e => { const r = e.getBoundingClientRect(); return { cls: e.className, t: Math.round(r.top), b: Math.round(r.bottom), l: Math.round(r.left), r: Math.round(r.right), text: e.innerText.replace(/\s+/g, ' ').trim().slice(0, 60) } }))
const w = await world(); const p = w.page
try {
  await L.login(p, 'a'); await sleep(400)
  await nav(p, 'inputs'); await p.tap('#inMedBtn'); await sleep(900)
  await p.tap('.medcard >> nth=3'); await sleep(1000)
  await p.tap('#docViewEdit'); await sleep(1200)
  // scenario 7: type, then press the window's cross
  await p.locator('#inpEditRmk').tap(); await sleep(200)
  await p.keyboard.type(' walk'); await sleep(300)
  const f0 = await pic(p, 'S7-typed')
  await p.tap('.win-x'); await sleep(900)
  const f1 = await pic(p, 'S7-question')
  const txt = await p.evaluate(() => document.body.innerText.includes('Close it and lose them'))
  const bs = await bandsAll(p)
  const ft = await firstTop(p, '#nothing')
  note('7', 'question box after the cross with typing', `question text on screen: ${txt}; bands visible: ${JSON.stringify(bs)}; topmost thing: ${JSON.stringify(ft)}; controls: ${await list(p)}`, f0 + ' | ' + f1)
  ok('7', 'question box raised', txt, `"Close it and lose them?" on screen = ${txt}`, f1)
  await p.keyboard.press('Escape'); await sleep(500)
  await pic(p, 'S7-after-escape')
  note('7', 'after pressing Escape on the question', `question still on screen: ${await p.evaluate(() => document.body.innerText.includes('Close it and lose them'))}; window still open: ${await p.evaluate(() => !!document.querySelector('.win-x') && document.querySelector('.win-x').checkVisibility())}`, 'w2/S7-after-escape.png')
} catch (e) { ok('D', 'script 7', null, 'stopped: ' + String(e.message).split('\n')[0]); console.log(e.stack.split('\n').slice(0, 4).join('\n')) }
try {
  // scenario 8 look: sign out
  await p.evaluate(() => { document.querySelectorAll('.win-x').forEach(e => e.click()) }); await sleep(300)
  await p.reload(); await sleep(1200)
  console.log('after reload', await list(p))
  await pic(p, 'probe8-reload')
} catch (e) { console.log('8 probe', e.message) }
if (w.errors.length) note('D', 'page errors', w.errors.slice(0, 10).join(' | '))
console.log('errors:', w.errors.length)
await w.ctx.close(); await closeAll()
