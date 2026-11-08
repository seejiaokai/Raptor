// W1 part I: scenarios 8 (access screen) and a probe for 9 (guest switch). Version: nk28-w1i v2
console.log('nk28-w1i v2')
const H = await import('./nk28-w1-lib.mjs')
const { L, world, sleep, tab, shot, vis, ok, note, finish } = H
{
  const w = await world({}); const p = w.page
  await p.waitForSelector('#luser')
  await p.fill('#luser', 'zz'); await p.fill('#lpass', 'zz'); await p.click('#loginForm button[type=submit]'); await sleep(1500)
  const pre = await vis(p, '.saveband.is-screen')
  const prePic = await shot(p, '08-access-form')
  await p.fill('#accCs', 'Walker'); await p.fill('#accIni', 'WK')
  const sels = p.locator('select:visible'); const n = await sels.count()
  for (let i = 0; i < n; i++) await sels.nth(i).selectOption({ index: 1 }).catch(() => {})
  await p.click('#accSend'); await sleep(1500)
  const band = await vis(p, '.saveband.is-screen')
  const words = await p.evaluate(() => { const e = [...document.querySelectorAll('.saveband')].find(e => e.getBoundingClientRect().width > 0); return e ? [...e.querySelectorAll('b, .sv-rest')].map(k => k.textContent) : null })
  const text = await p.evaluate(() => document.body.innerText.replace(/\s+/g, ' ').slice(0, 400))
  const card = await p.evaluate(() => { const e = document.querySelector('#accOut'); const c = e && (e.closest('.card, .acc, .accwrap') || e.parentElement); const r = c && c.getBoundingClientRect(); return r && [Math.round(r.top), Math.round(r.bottom)] })
  const pic = await shot(p, '08-access-sent')
  ok('8 access screen after sending: band across the top, not "Not sent yet"', !!band && !!words && words.join('|') === 'Not kept|this browser loses your work on a reload' && !/Not sent yet/i.test(text) && /request is with the admins|Waiting for an admin/i.test(text), JSON.stringify({ bandT: band && band.t, bandB: band && band.b, bandW: band && Math.round(band.r - band.l), words, preBandB: pre && pre.b, text: text.slice(0, 260), accOutCardTopBottom: card }), pic)
  if (w.errors.length) note('8 page errors', w.errors.join(' | '))
  await w.ctx.close()
}
{
  const w = await world({}); const p = w.page
  await p.waitForSelector('#luser'); await L.login(p, 'a'); await tab(p, 'admin'); await sleep(900)
  console.log(await p.evaluate(() => [...document.querySelectorAll('#page-admin *')].filter(e => e.children.length === 0 && /guest/i.test(e.textContent) && e.getBoundingClientRect().width > 0).map(e => e.tagName + '.' + String(e.className).slice(0, 20) + ':' + e.textContent.trim().slice(0, 90)).join(' | ')))
  console.log(await p.evaluate(() => [...document.querySelectorAll('#page-admin button, #page-admin a')].filter(e => e.getBoundingClientRect().width > 0 && e.getBoundingClientRect().top < 400).map(e => '#' + e.id + ':' + e.textContent.trim().slice(0, 18)).join(' | ')))
  await w.ctx.close()
}
finish('results-i.json')
await L.closeAll()
