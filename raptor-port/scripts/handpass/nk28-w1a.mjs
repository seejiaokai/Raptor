// W1 part A: scenarios 1 and 2 (sign-in, every page's bar). Version: nk28-w1a v1
console.log('nk28-w1a v2')
const H = await import('./nk28-w1-lib.mjs')
const { L, world, sleep, tab, shot, vis, ok, note, finish } = H
const DPR = Number(process.env.W1_DPR || 2)
const TAG = process.env.W1_TAG || ''
const PAGES = (process.env.W1_PAGES || 'editsched,viewsched,inputs,quals,logic,leavewar,tracker,help,admin').split(',')
const w = await world({ dpr: DPR }); const p = w.page
await p.waitForSelector('#luser'); await sleep(600)

// ---- 1 sign-in
if (!TAG) {
  const s = await vis(p, '.saveband.is-screen')
  const card = await p.evaluate(() => { const e = document.querySelector('#loginForm') ; const c = e && (e.closest('.card, .login, .lcard') || e); const r = c.getBoundingClientRect(); return { t: Math.round(r.top), b: Math.round(r.bottom), cls: c.className } })
  const pic = await shot(p, '01-signin')
  const vwords = await p.evaluate(() => { const e = [...document.querySelectorAll('.saveband.is-screen')].find(e => e.getBoundingClientRect().width > 0); if (!e) return null; return [...e.querySelectorAll('*')].filter(k => k.getBoundingClientRect().width > 1 && k.children.length === 0).map(k => k.textContent.trim()).filter(Boolean) })
  const sw = await p.evaluate(() => { const e = [...document.querySelectorAll('.saveband.is-screen')].find(e => e.getBoundingClientRect().width > 0); return e ? Math.round(e.getBoundingClientRect().width) : null })
  ok('1 sign-in band words/no button', !!s && vwords.join('|') === 'Not kept|this browser loses your work on a reload' && !s.btn, JSON.stringify({ vwords, btn: s && s.btn, h: s && s.h, w: sw, t: s && s.t }), pic)
  ok('1 card below band; one line', !!s && card.t >= s.b - 0.5 && s.h < 40, JSON.stringify({ bandT: s && s.t, bandB: s && s.b, h: s && s.h, cardT: card.t, cardCls: card.cls }), pic)
}

await L.login(p, 'a')

// ---- 2 every page
const FIRST = { editsched: '#vWeek', viewsched: '#vWeek', inputs: '#page-inputs', quals: '#page-quals', logic: '#page-logic', leavewar: '#page-leavewar', tracker: '#page-tracker', help: '#page-help', admin: '#page-admin' }
async function checkPage(name) {
  const reach = await tab(p, name)
  if (!reach) return ok(`2 ${name}`, null, 'tab not visible on screen')
  if (name === 'tracker') { await p.waitForSelector('#flowSvg .ball', { timeout: 30000 }); await sleep(900) }
  await p.evaluate(() => { window.scrollTo(0, 0); document.querySelectorAll('*').forEach(e => { if (e.scrollTop > 0 && e.clientHeight > 300) e.scrollTop = 0 }) }); await sleep(400)
  const band = await vis(p, '.topbar > .savestat.nokeep'), bar = await vis(p, '.topbar')
  let first = await p.evaluate(sel => {
    const root = document.querySelector(sel) || document.body
    let best = null
    for (const e of root.querySelectorAll('*')) {
      const r = e.getBoundingClientRect(); if (r.width < 4 || r.height < 4) continue
      const cs = getComputedStyle(e); if (cs.visibility === 'hidden' || cs.display === 'none' || +cs.opacity === 0) continue
      if (e.children.length > 0 && !e.textContent.trim()) continue
      if (r.bottom <= 0 || r.top > innerHeight) continue
      const txt = [...e.childNodes].some(n => n.nodeType === 3 && n.textContent.trim()) || /^(BUTTON|INPUT|SELECT|IMG|SVG)$/i.test(e.tagName)
      if (!txt) continue
      if (!best || r.top < best.t) best = { t: Math.round(r.top * 10) / 10, tag: e.tagName, cls: String(e.className).slice(0, 30), txt: e.textContent.trim().slice(0, 20) }
    }
    return best
  }, FIRST[name])
  if (name === 'editsched') { const wk = await vis(p, '.wk.wk-cal'); if (wk) first = { t: wk.t, tag: 'wk-cal (week bar first button)' } }
  const pic = await shot(p, `02-${TAG}${name}-top`, { clip: { x: 0, y: 0, width: 1536, height: 260 } })
  const full = await shot(p, `02-${TAG}${name}-full`)
  const lines = await p.evaluate(() => { const e = document.querySelector('.topbar > .savestat.nokeep'); const tops = new Set(); for (const k of e.querySelectorAll('b, .sv-rest')) for (const r of k.getClientRects()) tops.add(Math.round(r.top / 4)); const bc = getComputedStyle(e.querySelector('b')).color; const rc = getComputedStyle(e.querySelector('.sv-rest')).color; const bd = getComputedStyle(e).borderBottomColor; return { lines: tops.size, b: bc, rest: rc, edge: bd, words: [...e.querySelectorAll('b, .sv-rest')].map(k => k.textContent) } })
  const amber = /^rgba?\((2[0-5]\d), (1[5-9]\d|2\d\d), /.test(lines.b)
  ok(`2 ${TAG}${name} band`, !!band && !band.btn && Math.abs(band.b - bar.b) <= 2 && band.l <= 1 && band.r >= 1535 && lines.lines === 1 && lines.words.join('|') === 'Not kept|this browser loses your work on a reload' && amber && /229, 194, 74/.test(bar.bbc), JSON.stringify({ band: band && { t: band.t, b: band.b, l: band.l, r: band.r, h: band.h }, lines, bar: bar && { t: bar.t, b: bar.b, bbc: bar.bbc, bbw: bar.bbw } }), pic)
  ok(`2 ${TAG}${name} not covered`, !!band && !!first && first.t >= band.b - 0.5, JSON.stringify({ bandB: band && band.b, first }), pic)
  // scroll down
  const scrolled = await p.evaluate(() => { const c = [document.scrollingElement, ...document.querySelectorAll('*')].filter(e => e && e.scrollHeight > e.clientHeight + 200 && e.clientHeight > 300); const e = c.sort((a, b) => b.scrollHeight - a.scrollHeight)[0]; if (!e) return null; const b = e.scrollTop; e.scrollTop = Math.min(700, e.scrollHeight - e.clientHeight); return { el: e.tagName + '#' + e.id + '.' + String(e.className).slice(0, 20), from: b, to: e.scrollTop } })
  await sleep(500)
  const band2 = await vis(p, '.topbar > .savestat.nokeep')
  const thru = await p.evaluate(() => { const bar = document.querySelector('.topbar'); const b = document.querySelector('.topbar > .savestat.nokeep'); const r = b.getBoundingClientRect(); const bad = []; for (const [x, y] of [[2, r.top + 2], [2, r.bottom - 2], [r.right - 2, r.top + 2], [r.right - 2, r.bottom - 2], [r.width / 2, r.top + r.height / 2], [r.width / 3, r.bottom - 1], [r.right - 1, r.top + r.height / 2], [1, r.top + r.height / 2]]) { const e = document.elementFromPoint(x, y); if (!e || !(bar.contains(e))) bad.push(Math.round(x) + ',' + Math.round(y) + ':' + (e ? e.tagName + '.' + String(e.className).slice(0, 20) : 'none')) } return bad })
  const pic2 = await shot(p, `02-${TAG}${name}-scrolled`, { clip: { x: 0, y: 0, width: 1536, height: 260 } })
  if (scrolled && scrolled.to > scrolled.from) ok(`2 ${TAG}${name} scrolled: band stays, nothing shows through`, !!band2 && band2.t === band.t && band2.b === band.b && thru.length === 0, JSON.stringify({ scrolled, bandT: band2 && band2.t, bandB: band2 && band2.b, offenders: thru }), pic2)
  else note(`2 ${TAG}${name} scrolled`, 'page does not scroll: ' + JSON.stringify(scrolled) + ' band ' + JSON.stringify(band2 && [band2.t, band2.b]), pic2)
  await p.evaluate(() => { window.scrollTo(0, 0); document.querySelectorAll('*').forEach(e => { if (e.scrollTop > 0 && e.clientHeight > 300) e.scrollTop = 0 }) }); await sleep(300)
}
for (const n of PAGES) { try { await checkPage(n) } catch (e) { ok(`2 ${TAG}${n}`, null, 'stopped: ' + String(e.message).split('\n')[0]) } }
if (w.errors.length) note('2 page errors', w.errors.join(' | '))
finish(`results-a${TAG ? '-' + TAG : ''}.json`)
await L.closeAll()
