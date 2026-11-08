// W2 part F: scenario 8 whole (request access sent) and a probe of Admin for the guest switch (scenario 9).
console.log('nk28-w2f v1')
const { world, L, vis, pic, sleep, closeAll, ok, note, firstTop, under, tapShot, nav } = await import('./nk28-w2lib.mjs')
process.env.W2_KEEP = '1'
const WIDE = process.env.WIDE === '1'
const sfx = WIDE ? '-wide' : ''
const REST = 'this browser loses your work on a reload'
const list = async p => JSON.stringify(await p.evaluate(() => [...document.querySelectorAll('button, [role=button], select, input, textarea, a, label')].filter(e => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 && r.top >= 0 && r.top < 874 && r.left < 402 && r.right > 0 && e.checkVisibility({ opacityProperty: true, visibilityProperty: true }) }).slice(0, 50).map(e => (e.id || e.className.toString().split(' ')[0]) + '|' + (e.innerText || e.value || e.title || e.getAttribute('aria-label') || e.placeholder || '').trim().slice(0, 24).replace(/\n/g, ' ') + '|' + Math.round(e.getBoundingClientRect().left) + ',' + Math.round(e.getBoundingClientRect().top))))
const bandsAll = p => p.evaluate(() => [...document.querySelectorAll('.savestat, .saveband')].filter(e => e.checkVisibility({ opacityProperty: true, visibilityProperty: true })).map(e => { const r = e.getBoundingClientRect(); const b = e.querySelector('b'), rest = e.querySelector('.sv-rest'); return { cls: e.className, t: Math.round(r.top), b: Math.round(r.bottom), l: Math.round(r.left), r: Math.round(r.right), h: Math.round(r.height), bold: b && b.innerText, rest: rest && rest.innerText, cut: rest ? rest.scrollWidth > rest.clientWidth + 1 : null, text: e.innerText.replace(/\s+/g, ' ').trim().slice(0, 70) } }))
const good = b => b.some(x => x.bold === 'Not kept' && x.rest === REST && !x.cut && x.h <= 40 && x.l === 0 && x.r === 402)
const w = await world({ wide: WIDE }); const p = w.page
try {
  await L.login(p, 'a'); await sleep(500)
  if (!WIDE) {
    // probe Admin for a guest switch
    await nav(p, 'admin'); await sleep(600)
    await pic(p, 'probe-admin')
    console.log('admin', await list(p))
    console.log('admin text', await p.evaluate(() => document.body.innerText.replace(/\s+/g, ' ').slice(0, 900)))
  }
  await p.tap('#burger'); await sleep(450)
  await p.tap('#drawerLogout'); await sleep(1200)
  await p.fill('#luser', 'zz'); await p.fill('#lpass', 'zz')
  await p.tap('#loginForm button[type=submit], #go'); await sleep(1500)
  await p.fill('#accCs', 'Walker'); await p.fill('#accIni', 'WK')
  await p.selectOption('#accSeat', { index: 1 }); await sleep(300)
  console.log('cat options', await p.evaluate(() => [...document.querySelectorAll('#accCat option')].map(o => o.value + '|' + o.textContent)))
  await p.selectOption('#accCat', { index: 1 }).catch(() => {}); await sleep(300)
  const fa = await pic(p, 'S8-filled' + sfx)
  const bf = await bandsAll(p)
  ok('8', 'access form filled, band still whole' + sfx, good(bf), JSON.stringify(bf), fa)
  const t = await tapShot(p, '#accSend', 'S8-send-tap' + sfx, 900)
  await sleep(900)
  const fs = await pic(p, 'S8-sent' + sfx)
  const bs = await bandsAll(p)
  const text = await p.evaluate(() => document.body.innerText.replace(/\s+/g, ' ').slice(0, 600))
  const notSent = /Not sent yet/i.test(text), withAdmins = /with the admins/i.test(text)
  ok('8', 'Request access sent: band across the top, never "Not sent yet"' + sfx, good(bs) && !notSent, `bands=${JSON.stringify(bs)}; "Not sent yet" on screen=${notSent}; "with the admins" on screen=${withAdmins}; tap picture ${t && t.ms}ms after the tap start; text: ${text.slice(0, 300)}`, fs + ' | ' + (t && t.quick))
  note('8', 'waiting screen controls' + sfx, await list(p), fs)
  const ft = await firstTop(p)
  note('8', 'waiting screen first thing below the band' + sfx, JSON.stringify(ft), fs)
} catch (e) { ok('F', 'script', null, 'stopped: ' + String(e.message).split('\n')[0]); console.log(e.stack.split('\n').slice(0, 4).join('\n')) }
if (w.errors.length) note('F', 'page errors', w.errors.slice(0, 10).join(' | '))
console.log('errors:', w.errors.length)
await w.ctx.close(); await closeAll()
