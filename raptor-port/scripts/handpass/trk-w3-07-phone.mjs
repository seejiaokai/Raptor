/* w3 item 7 — the phone layout (R101–R106), admin AND member, 390x844.
   R101 chart fits the width, zoom "reset" returns to that fit, room to scroll
   past the last event (clear of the zoom control), Crew leftmost, no sideways-
   scrolling bar. R102 the bar in TWO rows (count them). R103 Info tab: every
   statistic but Lull periods fits one screen at two students. R104 last row =
   Lull periods + Failures paired; Students card the same size as Overall.
   R105 Set pace + End date A + End date B on ONE row, no date box past its
   card. R106 the Info panel's zoom reads 100%. */
import { open, shot, save, log, PHONE } from './trk-lib.mjs'
import { sleep, box } from './trk-w3-lib.mjs'

const L = log()
const tapSel = async (page, sel) => { const b = await page.locator(sel).first().boundingBox(); await page.touchscreen.tap(b.x + b.width / 2, b.y + b.height / 2); await sleep(450) }
const barRows = page => page.evaluate(() => {
  const h = document.querySelector('#page-tracker header')
  const vis = el => { const r = el.getBoundingClientRect(); const cs = getComputedStyle(el); return r.width > 0 && r.height > 0 && cs.display !== 'none' && cs.visibility !== 'hidden' }
  const kids = [...h.querySelectorAll('.controls > *')].filter(vis).map(el => { const r = el.getBoundingClientRect(); return { t: (el.innerText || el.id || '').trim().replace(/\s+/g, ' ').slice(0, 14), cy: Math.round(r.top + r.height / 2), l: Math.round(r.left), r: Math.round(r.right) } })
  const rows = []; kids.forEach(k => { let row = rows.find(r => Math.abs(r.cy - k.cy) < 10); if (!row) rows.push(row = { cy: k.cy, items: [] }); row.items.push(k.t) })
  const c = h.querySelector('.controls')
  return { rows: rows.map(r => r.items.join(' | ')), headerH: Math.round(h.getBoundingClientRect().height), sideways: c.scrollWidth > c.clientWidth + 1 || h.scrollWidth > h.clientWidth + 1, crewLeft: Math.round(document.getElementById('activeSel').getBoundingClientRect().left), leftmost: Math.min(...kids.map(k => k.l)) }
})

for (const who of ['a', 'u']) {
  const tag = who === 'a' ? 'admin' : 'member'
  const { browser, page, errors } = await open({ size: PHONE, who, touch: true })
  const br = await barRows(page)
  L.ok(`${tag}: the phone bar is TWO rows (R102)`, br.rows.length === 2, `${br.rows.length} rows — ${br.rows.map((r, i) => `row ${i + 1}: ${r}`).join(' // ')}; bar ${br.headerH}px`)
  L.ok(`${tag}: Crew is the leftmost control; the bar does not scroll sideways`, br.crewLeft === br.leftmost && !br.sideways, JSON.stringify({ crewLeft: br.crewLeft, leftmost: br.leftmost, sideways: br.sideways }))
  await shot(page, `w3-07-${tag}-bar`, { el: '#page-tracker header' })
  if (who === 'u') { L.note('member errors', errors.join(' | ') || 'none'); await browser.close(); continue }

  /* the Crew box: can a person tell which student is picked? */
  const crew = await page.evaluate(() => { const s = document.getElementById('activeSel'); return { w: Math.round(s.getBoundingClientRect().width), picked: s.options[s.selectedIndex].textContent, need: (() => { const c = document.createElement('canvas').getContext('2d'); c.font = getComputedStyle(s).font; return Math.round(c.measureText(s.options[s.selectedIndex].textContent).width) })() } })
  L.note('admin: the Crew box on a phone', JSON.stringify(crew))
  await shot(page, 'w3-07-crew-box', { el: '#activeSel' })

  /* R101 — fits the width */
  const fit = await page.evaluate(() => { const b = document.getElementById('board'); return { zoom: document.getElementById('fzPct').textContent, sw: b.scrollWidth, cw: b.clientWidth } })
  L.ok('R101: the chart fits the width (no sideways wander)', fit.sw <= fit.cw + 1, JSON.stringify(fit))
  await tapSel(page, '#fzIn'); await tapSel(page, '#fzIn')
  const zin = await page.evaluate(() => { const b = document.getElementById('board'); return { zoom: document.getElementById('fzPct').textContent, sw: b.scrollWidth, cw: b.clientWidth } })
  await tapSel(page, '#fzReset')
  const zr = await page.evaluate(() => { const b = document.getElementById('board'); return { zoom: document.getElementById('fzPct').textContent, sw: b.scrollWidth, cw: b.clientWidth } })
  L.ok('R101: zoom + + then "reset" returns to the fit, not 100%', zr.zoom === fit.zoom && zr.sw <= zr.cw + 1, `fit ${fit.zoom} → ++ ${zin.zoom} (sideways ${zin.sw > zin.cw}) → reset ${zr.zoom}`)
  /* scroll to the very bottom: is there room past the last event, clear of the zoom control? */
  const bd = await box(page, '#board')
  for (let i = 0; i < 30; i++) { const cdp = null; await page.mouse.move(bd.x + bd.w / 2, bd.y + bd.h / 2); await page.mouse.wheel(0, 1500); await sleep(30) }
  await sleep(300)
  const bottom = await page.evaluate(() => {
    const b = document.getElementById('board'), br = b.getBoundingClientRect()
    const lows = [...document.querySelectorAll('#flowSvg .ball')].map(g => g.getBoundingClientRect()).sort((a, c) => c.bottom - a.bottom)
    const z = document.getElementById('flowZoomCtl').getBoundingClientRect()
    return { atEnd: Math.abs(b.scrollTop + b.clientHeight - b.scrollHeight) < 2, lastBallBottom: Math.round(lows[0].bottom), zoomCtlTop: Math.round(z.top), boardBottom: Math.round(br.bottom), gap: Math.round(z.top - lows[0].bottom) }
  })
  L.ok('R101: you can scroll well past the last event, clear of the zoom control', bottom.atEnd && bottom.gap > 100, JSON.stringify(bottom))
  await shot(page, 'w3-07-chart-bottom')

  /* the Info tab */
  await tapSel(page, '#viewtabs [data-view="info"]')
  const info = await page.evaluate(() => {
    const r = s => { const e = document.querySelector(s); if (!e) return null; const b = e.getBoundingClientRect(); return { x: Math.round(b.left), y: Math.round(b.top), w: Math.round(b.width), h: Math.round(b.height), r: Math.round(b.right), b: Math.round(b.bottom) } }
    const side = r('#side'), zc = r('#sideZoomCtl')
    const cards = [...document.querySelectorAll('#side .card')].map(c => ({ cls: c.className.replace('card', '').trim(), ...(() => { const b = c.getBoundingClientRect(); return { y: Math.round(b.top), b: Math.round(b.bottom), x: Math.round(b.left), r: Math.round(b.right), w: Math.round(b.width), h: Math.round(b.height) } })() }))
    const os = [...document.querySelectorAll('#side .c-pace .paceGrid > .o')].map(o => { const b = o.getBoundingClientRect(); const inp = o.querySelector('input'); const ib = inp.getBoundingClientRect(); return { t: o.querySelector('.t').textContent, top: Math.round(b.top), l: Math.round(b.left), r: Math.round(b.right), inR: Math.round(ib.right), inL: Math.round(ib.left) } })
    const pace = r('#side .c-pace')
    return { side, zc, cards, os, pace, zoom: document.getElementById('szPct').textContent, scrollH: document.getElementById('side').scrollHeight, clientH: document.getElementById('side').clientHeight }
  })
  L.note('Info tab cards', info.cards.map(c => `${c.cls}@${c.x},${c.y} ${c.w}x${c.h}`).join(' · '))
  const visibleBottom = Math.min(info.side.b, info.zc ? info.zc.y : 9999)
  const notLull = info.cards.filter(c => !/c-lull/.test(c.cls))
  const cut = notLull.filter(c => c.b > visibleBottom)
  L.ok('R103: every statistic but Lull periods fits one screen (two students), no scrolling', !cut.length, cut.length ? 'below the fold: ' + cut.map(c => c.cls + ' ends ' + c.b).join(', ') + ` (visible to ${visibleBottom})` : `all end above ${visibleBottom}; panel scroll ${info.scrollH} vs ${info.clientH}`)
  const lull = info.cards.find(c => /c-lull/.test(c.cls)), fails = info.cards.find(c => /c-fails/.test(c.cls))
  const lastTop = Math.max(...info.cards.map(c => c.y))
  L.ok('R104: the last row is Lull periods + Failures, side by side', lull && fails && lull.y === fails.y && lull.y === lastTop && Math.abs(lull.x - fails.x) > 50, JSON.stringify({ lull: lull && [lull.x, lull.y], fails: fails && [fails.x, fails.y], lastTop }))
  const stu = info.cards.find(c => /c-students/.test(c.cls)), ov = info.cards.find(c => /c-overall/.test(c.cls))
  L.ok('R104: the Students card is the same size as Overall beside it', stu && ov && stu.w === ov.w && stu.h === ov.h && stu.y === ov.y, JSON.stringify({ students: stu && [stu.w, stu.h, stu.y], overall: ov && [ov.w, ov.h, ov.y] }))
  const oneRow = info.os.length === 3 && new Set(info.os.map(o => o.top)).size === 1
  const spill = info.os.filter(o => o.inR > o.r || o.inL < o.l || o.r > info.pace.r)
  L.ok('R105: Set pace + End date A + End date B on ONE row, no date box past its box or the card', oneRow && !spill.length, JSON.stringify(info.os))
  L.ok('R106: the Info panel\'s zoom reads 100%', info.zoom === '100%', info.zoom)
  await shot(page, 'w3-07-info-tab')
  await shot(page, 'w3-07-pace-card', { el: '#side .c-pace' })
  L.note('admin errors', errors.join(' | ') || 'none')
  await browser.close()
}
save('w3-07-phone', { rows: L.rows })
