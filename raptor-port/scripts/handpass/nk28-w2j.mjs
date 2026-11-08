// W2 part J: scenarios 10 (Tracker corner), 11 (?nostore forms), 12 (plain and ?fresh=1).
console.log('nk28-w2j v1')
const { world, L, vis, pic, sleep, closeAll, ok, note, firstTop, under, tapShot, nav } = await import('./nk28-w2lib.mjs')
process.env.W2_KEEP = '1'
const REST = 'this browser loses your work on a reload'
const list = async p => JSON.stringify(await p.evaluate(() => [...document.querySelectorAll('button, [role=button], select, input, textarea, a, label')].filter(e => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 && r.top >= 0 && r.top < 874 && r.left < 402 && r.right > 0 && e.checkVisibility({ opacityProperty: true, visibilityProperty: true }) && !e.closest('#drawer') }).slice(0, 40).map(e => (e.id || e.className.toString().split(' ')[0]) + '|' + (e.innerText || e.value || e.title || e.getAttribute('aria-label') || e.placeholder || '').trim().slice(0, 30).replace(/\n/g, ' ') + '|' + Math.round(e.getBoundingClientRect().left) + ',' + Math.round(e.getBoundingClientRect().top))))
const bandsAll = p => p.evaluate(() => [...document.querySelectorAll('.savestat, .saveband')].filter(e => e.checkVisibility({ opacityProperty: true, visibilityProperty: true })).map(e => { const r = e.getBoundingClientRect(); const b = e.querySelector('b'), rest = e.querySelector('.sv-rest'); return { cls: e.className, t: Math.round(r.top), b: Math.round(r.bottom), h: Math.round(r.height), bold: b && b.innerText, rest: rest && rest.innerText, text: e.innerText.replace(/\s+/g, ' ').trim().slice(0, 60) } }))
const hasBand = b => b.some(x => x.bold === 'Not kept' && x.rest === REST)
const corner = p => p.evaluate(() => { const s = document.getElementById('saveStat'); return s ? { vis: s.checkVisibility(), text: s.textContent.trim(), cls: s.className } : null })
const trackerFlow = async (p, sc, sfx) => {
  await nav(p, 'tracker'); await sleep(600)
  const f0 = await pic(p, `S${sc}-tracker-${sfx}`)
  const c0 = await corner(p)
  const ball = await p.locator('#flowSvg .ball').first().boundingBox()
  await p.touchscreen.tap(ball.x + ball.width / 2, ball.y + ball.height / 2); await sleep(900)
  const f1 = await pic(p, `S${sc}-tracker-${sfx}-ball`)
  console.log(sc, sfx, 'controls after ball tap', await list(p))
  return { f0, f1, c0 }
}
// ---- 10: Tracker corner empty after marking a ball (storage refused)
{
  const w = await world(); const p = w.page
  try {
    await L.login(p, 'a'); await sleep(500)
    const r = await trackerFlow(p, '10', 'refused')
    await sleep(600)
    const c1 = await corner(p)
    ok('10', 'Tracker corner empty before and after a ball is touched', (!r.c0 || !r.c0.vis || r.c0.text === '') && (!c1 || !c1.vis || c1.text === ''), `before ${JSON.stringify(r.c0)}; after ${JSON.stringify(c1)}`, r.f0 + ' | ' + r.f1)
  } catch (e) { ok('10', 'script', null, 'stopped: ' + String(e.message).split('\n')[0]); console.log(e.stack.split('\n').slice(0, 4).join('\n')) }
  if (w.errors.length) note('J', 'page errors 10', w.errors.slice(0, 10).join(' | '))
  await w.ctx.close()
}
// ---- 11: ?nostore forms in a browser that stores fine
for (const [i, u, want] of [['a', '/?nostore', true], ['b', '/?nostore=1', true], ['c', '/?a=1&nostore', true], ['d', '/?nostorex', false]]) {
  const w = await world({ locked: false, url: u }); const p = w.page
  try {
    await L.login(p, 'a'); await sleep(900)
    const f = await pic(p, `S11${i}-${u.replace(/\W+/g, '_')}`)
    const b = await bandsAll(p)
    ok('11', `${u} ${want ? 'shows the band' : 'shows none'}`, hasBand(b) === want, JSON.stringify(b), f)
    if (i === 'a') {
      await p.reload(); await sleep(1500)
      const a = await p.evaluate(() => !!document.getElementById('luser') && document.getElementById('luser').checkVisibility())
      if (a) await L.login(p, 'a')
      await sleep(900)
      const f2 = await pic(p, 'S11a-after-reload')
      const b2 = await bandsAll(p)
      ok('11', '/?nostore after a reload still shows the band', hasBand(b2), `signin screen after reload: ${a}; ${JSON.stringify(b2)}`, f2)
    }
  } catch (e) { ok('11', u, null, 'stopped: ' + String(e.message).split('\n')[0]) }
  if (w.errors.length) note('J', 'page errors 11' + i, w.errors.slice(0, 10).join(' | '))
  await w.ctx.close()
}
// ---- 12: plain / and /?fresh=1
for (const [i, u] of [['a', '/'], ['b', '/?fresh=1']]) {
  const w = await world({ locked: false, url: u }); const p = w.page
  try {
    await L.login(p, 'a'); await sleep(900)
    const f = await pic(p, `S12${i}-${u.replace(/\W+/g, '_')}`)
    const b = await bandsAll(p)
    ok('12', `${u} shows no Not kept band`, !hasBand(b), JSON.stringify(b), f)
    if (i === 'a') {
      const r = await trackerFlow(p, '12', 'plain')
      const c = await corner(p)
      ok('12', 'Tracker corner on plain / says saved', !!c && c.vis && /saved/i.test(c.text), JSON.stringify(c), r.f0 + ' | ' + r.f1)
    }
  } catch (e) { ok('12', u, null, 'stopped: ' + String(e.message).split('\n')[0]); console.log(e.stack.split('\n').slice(0, 4).join('\n')) }
  if (w.errors.length) note('J', 'page errors 12' + i, w.errors.slice(0, 10).join(' | '))
  await w.ctx.close()
}
await closeAll()
