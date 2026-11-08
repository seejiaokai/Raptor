// W2 part I: scenario 9 whole (guest page under the band).
console.log('nk28-w2i v1')
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
  await p.evaluate(() => document.getElementById('admGuestView').scrollIntoView({ block: 'center' })); await sleep(400)
  const before = await p.evaluate(() => { const e = document.getElementById('admGuestView'); return { checked: e.checked, aria: e.getAttribute('aria-checked'), tag: e.tagName, text: e.innerText } })
  const bb = await p.locator('#admGuestView').boundingBox()
  await p.touchscreen.tap(bb.x + bb.width / 2, bb.y + bb.height / 2); await sleep(600)
  const after = await p.evaluate(() => { const e = document.getElementById('admGuestView'); return { checked: e.checked, aria: e.getAttribute('aria-checked'), text: e.innerText } })
  const f0 = await pic(p, 'S9-guest-switch')
  note('9', 'guest switch on Admin -> Users', `before ${JSON.stringify(before)} after ${JSON.stringify(after)}; Admin page band: ${JSON.stringify(await bandsAll(p))}`, f0)
  await p.tap('#burger'); await sleep(450); await p.tap('#drawerLogout'); await sleep(1200)
  await p.fill('#luser', 'zz'); await p.fill('#lpass', 'zz')
  await p.tap('#loginForm button[type=submit], #go'); await sleep(1500)
  await p.fill('#accCs', 'Walker'); await p.fill('#accIni', 'WK'); await p.selectOption('#accSeat', { index: 1 }); await p.selectOption('#accCat', { index: 1 })
  await p.tap('#accSend'); await sleep(1500)
  const f1 = await pic(p, 'S9-waiting')
  console.log('waiting controls', await list(p))
  const view = p.locator('button:visible', { hasText: 'View the schedule' }).first()
  if (!(await view.count())) { ok('9', 'View the schedule button on the waiting screen', null, 'NOTRUN: no "View the schedule" button after the guest switch', f1) }
  else {
    const bw = await bandsAll(p)
    ok('9', 'waiting screen with the guest switch on keeps the band', good(bw), JSON.stringify(bw), f1)
    const t = await tapShot(p, await view.boundingBox(), 'S9-view-tap', 900); await sleep(900)
    const f2 = await pic(p, 'S9-guest-page')
    const bg = await bandsAll(p)
    const ft = await firstTop(p)
    const cur = await p.evaluate(() => ({ page: window.CURPAGE, guestbar: !!document.querySelector('.guestbar, .topbar.guest, [class*=guest]') }))
    ok('9', 'guest page: band under the guest bar', good(bg), `bands=${JSON.stringify(bg)}; firstTop=${JSON.stringify(ft)}; cur=${JSON.stringify(cur)}; tap picture ${t.ms}ms after the tap start`, f2 + ' | ' + t.quick)
    note('9', 'guest page controls', await list(p), f2)
    const sc = await p.evaluate(() => { for (const e of [...document.querySelectorAll('*')]) { if (!e.checkVisibility() || e.closest('#drawer')) continue; const o = getComputedStyle(e).overflowY; if (/auto|scroll/.test(o) && e.scrollHeight - e.clientHeight > 80) { e.scrollTop = 300; return e.tagName + '.' + String(e.className).split(' ')[0] + ' top ' + e.scrollTop } } return null })
    await sleep(500); const f3 = await pic(p, 'S9-guest-scrolled')
    const bg2 = await bandsAll(p)
    note('9', 'guest page scrolled', `scroller ${sc}; bands ${JSON.stringify(bg2)}`, f3)
  }
} catch (e) { ok('I', 'script', null, 'stopped: ' + String(e.message).split('\n')[0]); console.log(e.stack.split('\n').slice(0, 4).join('\n')) }
if (w.errors.length) note('I', 'page errors', w.errors.slice(0, 10).join(' | '))
console.log('errors:', w.errors.length)
await w.ctx.close(); await closeAll()
