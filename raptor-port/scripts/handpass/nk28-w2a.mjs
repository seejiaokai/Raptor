// W2 part A: scenarios 1, 2 and the side menu on his iPhone (402x874 WebKit, touch), storage refused.
console.log('nk28-w2a v1')
const { world, L, vis, pic, sleep, closeAll, ok, note, firstTop, under, tapShot } = await import('./nk28-w2lib.mjs')
const W = process.env.WIDE === '1'
const sfx = W ? '-wide' : ''
const BAND = '.topbar > .savestat.nokeep'
const REST = 'this browser loses your work on a reload'

export async function bandOn(p, sc, step, pics, { scroll = true, sel = BAND, barSel = '.topbar' } = {}) {
  const band = await vis(p, sel), bar = await vis(p, barSel)
  if (!band) { ok(sc, step, false, 'no band visible', pics); return null }
  const one = band.h <= 40 && band.restH < 24 && band.boldH < 24
  const words = band.bold === 'Not kept' && band.rest === REST
  const full = band.l === 0 && band.r === 402
  const atBottom = bar ? Math.abs(band.b - bar.b) <= 2 : null
  const ft = await firstTop(p)
  const notCov = ft ? ft.t >= band.b - 0.5 : null
  ok(sc, step, words && one && !band.btn && !band.restCut && full && atBottom && band.svg && (notCov !== false), `words=${JSON.stringify([band.bold, band.rest])} h=${band.h} box=${band.l}..${band.r} bandBottom=${band.b} barBottom=${bar && bar.b} cut=${band.restCut} btn=${band.btn} sign=${band.sign} line=${band.border} firstTop=${JSON.stringify(ft)}`, pics)
  if (scroll) {
    const sc0 = await p.evaluate(() => { let best = null; for (const e of [document.scrollingElement, ...document.querySelectorAll('*')]) { if (!e) continue; const o = getComputedStyle(e).overflowY; if (e !== document.scrollingElement && !/auto|scroll/.test(o)) continue; if (e.checkVisibility && !e.checkVisibility({ opacityProperty: true, visibilityProperty: true })) continue; if (e.closest('.topbar,#drawer')) continue; const room = e.scrollHeight - e.clientHeight; if (room > 80 && (!best || room > best.room)) best = { e, room } } if (!best) return null; best.e.scrollTop = Math.min(500, best.room); window.__scr = best.e; return { moved: Math.round(best.e.scrollTop), room: best.room, who: best.e === document.scrollingElement ? 'page' : best.e.tagName.toLowerCase() + (best.e.id ? '#' + best.e.id : '.' + String(best.e.className).split(' ')[0]) } })
    await sleep(500)
    const f = await pic(p, `${sc}-${step.replace(/\W+/g, '_')}-scrolled${sfx}`)
    const b2 = await vis(p, sel)
    const u = await under(p, [[2, band.t + 2], [200, band.t + 2], [400, band.t + 2], [2, band.b - 2], [400, band.b - 2], [200, band.b + 0.5]])
    if (sc0 === null) note(sc, step + ' scroll', 'nothing on this page scrolls (no scroller with room)', f)
    else ok(sc, step + ' scroll', sc0.moved > 0 && b2 && b2.t === band.t && u.slice(0, 5).every(x => x === 'band' || x === 'bar'), `scrolled ${sc0.who} to ${sc0.moved} of ${sc0.room}; band top ${band.t}->${b2 && b2.t}; under band points: ${u.join(',')}`, f)
    await p.evaluate(() => { if (window.__scr) window.__scr.scrollTop = 0 }); await sleep(200)
  }
  return band
}

const w = await world({ wide: W }); const p = w.page
try {
  await p.waitForSelector('#luser'); await sleep(700)
  // scenario 1
  const f1 = await pic(p, 'S1-signin' + sfx)
  const band = await vis(p, '.saveband.is-screen'); const ft = await firstTop(p)
  const card = await vis(p, '#loginForm')
  const words = band && band.bold === 'Not kept' && band.rest === REST
  ok('1', 'sign-in band' + sfx, !!band && words && !band.btn && band.h <= 40 && !band.restCut && band.l === 0 && band.r === 402 && ft.t >= band.b - 0.5, `words=${JSON.stringify([band && band.bold, band && band.rest])} h=${band && band.h} box=${band && band.l}..${band && band.r} cut=${band && band.restCut} btn=${band && band.btn} firstTop=${JSON.stringify(ft)} formTop=${card && card.t}`, f1)
  if (W) { await L.login(p, 'a') } else await L.login(p, 'a')
  await sleep(500)
  // scenario 2: each page through the side menu, tap picture beside the settled one
  const pages = [['editsched', 'Edit Schedule'], ['viewsched', 'View-only Sched'], ['inputs', 'Inputs'], ['quals', 'Quals'], ['logic', 'Logic'], ['leavewar', 'Leave War'], ['tracker', 'Tracker'], ['help', 'Help'], ['admin', 'Admin']]
  const only = (process.env.PAGES || '').split(',').filter(Boolean)
  for (const [id, label] of pages) {
    if (only.length && !only.includes(id)) continue
    if (W && !['editsched', 'tracker'].includes(id)) continue
    try {
      await p.tap('#burger'); await sleep(450)
      if (id === 'editsched' && !W) { const f = await pic(p, 'S2-menu-open'); const dr = await vis(p, '#drawer'); note('menu', 'side menu with band up', `drawer box ${dr && dr.l}..${dr && dr.r} x ${dr && dr.t}..${dr && dr.b}; band behind it: ${JSON.stringify(await vis(p, BAND))}; under points: ${(await under(p, [[20, 60], [200, 60], [360, 60], [390, 60], [390, 20]])).join(',')}`, f) }
      const t = await tapShot(p, `#drawer a[data-page="${id}"]`, `S2-${id}-tap${sfx}`)
      if (id === 'tracker') await p.waitForSelector('#flowSvg .ball', { timeout: 30000 })
      await sleep(900)
      const cur = await p.evaluate(() => window.CURPAGE)
      const f = await pic(p, `S2-${id}${sfx}`)
      note('2', label + ' tap pictures' + sfx, `tapped ${label}; picture ${t && t.ms}ms after the tap start; CURPAGE=${cur}`, t ? t.quick + ' | ' + t.settled : '')
      const b = await bandOn(p, '2', label + sfx, f, { scroll: !W })
      if (id === 'tracker') {
        const corner = await p.evaluate(() => { const s = document.getElementById('saveStat'); return s ? { hidden: s.hidden || getComputedStyle(s).display === 'none', text: s.textContent.trim() } : null })
        ok('2', 'Tracker corner empty' + sfx, !corner || corner.hidden || corner.text === '', JSON.stringify(corner), f)
      }
      if (id === 'leavewar' && !W) {
        const dr = await p.evaluate(() => [...document.querySelectorAll('[class*=pin],[class*=sticky],[class*=dates],.lw-weekbar,[class*=arrow]')].filter(e => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 && r.top < 200 }).slice(0, 8).map(e => e.tagName.toLowerCase() + '.' + String(e.className).split(' ')[0] + ' t=' + Math.round(e.getBoundingClientRect().top)))
        note('2', 'Leave War pinned row / arrows near top', JSON.stringify(dr) + ' band bottom ' + (b && b.b), f)
      }
    } catch (e) { ok('2', label + sfx, null, 'NOTRUN: ' + String(e.message).split('\n')[0]) }
  }
} catch (e) { ok('A', 'script', null, 'stopped: ' + String(e.message).split('\n')[0]) }
if (w.errors.length) note('A', 'page errors', w.errors.slice(0, 10).join(' | '))
console.log('errors:', w.errors.length)
await w.ctx.close(); await closeAll()
