// Re-walk walker B, B7: the changes window's bar on a phone (D1442) on Edit Schedule: History on -> "Hide ▾" -> the bar.
process.env.LW_OUT ||= '../../docs/img/handpass/2026-10-27-lw-m4/rewalk/b'
const B = await import('./lw-m4-walk-b-lib.mjs')
const { T, shot, rec } = B
console.log('[lw-m4-rw-b7 v3]')
const w = await B.newPhone(402, 874, 'chromium')
const P = w.page
const dump = () => P.evaluate(() => {
  const bar = document.querySelector('.chgwin.bar')
  if (!bar) return null
  const st = e => { const c = getComputedStyle(e); const r = e.getBoundingClientRect(); return { tag: e.tagName.toLowerCase() + '.' + String(e.className).slice(0, 30), txt: e.children.length ? '' : e.textContent.slice(0, 40), box: `${Math.round(r.left)},${Math.round(r.top)} ${Math.round(r.width)}x${Math.round(r.height)}`, bg: c.backgroundColor, bd: `${c.borderTopWidth} ${c.borderTopStyle} ${c.borderTopColor}`, fg: c.color, fs: c.fontSize, fw: c.fontWeight, shadow: c.boxShadow.slice(0, 30) } }
  /* the text nodes and the gap between "History on" and the dot */
  const tn = []
  const walk = n => { if (n.nodeType === 3 && n.textContent.length) { const rg = document.createRange(); rg.selectNodeContents(n); const r = rg.getBoundingClientRect(); tn.push({ s: JSON.stringify(n.textContent), l: +r.left.toFixed(1), r: +r.right.toFixed(1), w: +r.width.toFixed(1) }) } else n.childNodes.forEach(walk) }
  walk(bar)
  return { text: bar.innerText.replace(/\s+/g, ' ').trim(), raw: JSON.stringify(bar.textContent), parts: [bar, ...bar.querySelectorAll('*')].map(st), tn, rect: (() => { const r = bar.getBoundingClientRect(); return { l: Math.round(r.left), t: Math.round(r.top), r: Math.round(r.right), b: Math.round(r.bottom) } })(), vw: innerWidth, vh: innerHeight }
})
try {
  await B.signIn(w, 'admin')
  await P.evaluate(() => window.go('editsched'))
  await P.waitForSelector('#histBtn', { state: 'visible', timeout: 15000 })
  await B.sleep(w, 800)
  await shot(w, 'b7-editsched')
  await B.press(w, '#histBtn', 'b7-hist-q'); await B.sleep(w, 900)
  await shot(w, 'b7-history-open')
  const open = await P.evaluate(() => { const c = document.querySelector('.chgwin'); return c ? { cls: c.className, txt: c.innerText.replace(/\s+/g, ' ').slice(0, 160) } : null })
  console.log('window open:', JSON.stringify(open))
  const winSz = await P.evaluate(() => { const o = {}; for (const k of ['.win-x', '.win-hide']) { const e = document.querySelector('.chgwin ' + k); const r = e.getBoundingClientRect(); o[k] = Math.round(r.width) + 'x' + Math.round(r.height) }; return o })
  console.log('window-state sizes', JSON.stringify(winSz))
  await B.press(w, '.chgwin .win-hide', 'b7-hide-q'); await B.sleep(w, 800)
  await shot(w, 'b7-bar')
  const d = await dump()
  if (!d) throw new Error('no bar after Hide')
  console.log('BAR TEXT:', JSON.stringify(d.text), 'raw', d.raw); for (const p of d.parts) console.log('  ', JSON.stringify(p)); console.log('  text nodes', JSON.stringify(d.tn)); console.log('  bar rect', JSON.stringify(d.rect), 'vw', d.vw, 'vh', d.vh)
  await shot(w, 'b7-bar-zoom', { scale: 'device', clip: { x: 0, y: Math.max(0, d.rect.t - 30), width: 402, height: Math.min(874 - Math.max(0, d.rect.t - 30), d.rect.b - d.rect.t + 60) } })
  const m = d.text.match(/History on\s*·\s*(\d+) change/)
  /* the space before the dot, measured: the gap between the end of the text before the dot and the dot's own left edge */
  const dotNode = d.tn.find(t => /·/.test(t.s)); const idx = d.tn.indexOf(dotNode)
  const before = idx > 0 ? d.tn[idx - 1] : null
  const spaceBefore = /\s·|\s+$/.test(JSON.stringify(dotNode && dotNode.s)) || (before && /\s"$/.test(before.s)) || (dotNode && /^"\s/.test(dotNode.s))
  const gap = dotNode && before ? +(dotNode.l - before.r).toFixed(1) : null
  console.log('dot node', JSON.stringify(dotNode), 'before', JSON.stringify(before), 'gap px', gap)
  rec('B7 the bar reads "History on · N changes"', 'phone', m ? 'PASS' : 'FAIL', `bar text "${d.text}"; raw ${d.raw}`, ['b7-bar.png', 'b7-bar-zoom.png'])
  rec('B7 a space before the "·" (text and measured gap)', 'phone', /History on ·/.test(d.raw.replace(/\\u00a0/g, ' ').replace(/"/g, '')) && (gap === null || gap >= 1) ? 'PASS' : 'FAIL', `raw ${d.raw}; gap between "History on" and the dot ${gap}px; nodes ${JSON.stringify(d.tn)}`, ['b7-bar-zoom.png'])
  const show = d.parts.find(p => /Show/.test(p.txt)), x = d.parts.find(p => /win-x/.test(p.tag))
  rec('B7 "Show ▴" is plain cyan words (no box, no fill)', 'phone', show && show.bg === 'rgba(0, 0, 0, 0)' && show.bd.startsWith('0px') && /^rgb\(5\d, 1\d\d, 2\d\d\)$/.test(show.fg) ? 'PASS' : 'FAIL', JSON.stringify(show), ['b7-bar-zoom.png'])
  rec('B7 ✕ is a plain ✕ (no box, no fill)', 'phone', x && x.bg === 'rgba(0, 0, 0, 0)' && x.bd.startsWith('0px') ? 'PASS' : 'FAIL', JSON.stringify(x), ['b7-bar-zoom.png'])
  const targets = d.parts.filter(p => /cw-show|win-x|cw-barbtn/.test(p.tag)).map(p => ({ tag: p.tag, box: p.box }))
  console.log('tap targets', JSON.stringify(targets))
  const xs = (targets.find(t => /win-x/.test(t.tag)) || {}).box; const xbar = xs ? xs.split(' ')[1] : null; const bb = (targets.find(t => /cw-barbtn/.test(t.tag)) || {}).box
  const num = z => z.split('x').map(Number); const tapOk = !!xbar && num(xbar)[0] >= num(winSz['.win-x'])[0] && num(xbar)[1] >= num(winSz['.win-x'])[1]
  rec('B7 each keeps its full tap area (the bar X at least as big as the open window X; Show sits in a wide button)', 'phone', tapOk && bb ? 'PASS' : 'FAIL', 'bar targets ' + JSON.stringify(targets) + '; open-window sizes ' + JSON.stringify(winSz), ['b7-bar-zoom.png'])
  /* Show ▴ with a finger */
  await B.press(w, '.chgwin .cw-show', 'b7-show-q'); await B.sleep(w, 800); await shot(w, 'b7-show')
  const back = await P.evaluate(() => { const c = document.querySelector('.chgwin'); return c ? { bar: c.classList.contains('bar'), h: Math.round(c.getBoundingClientRect().height) } : null })
  rec('B7 Show ▴ brings the panel back', 'phone', back && !back.bar && back.h > 100 ? 'PASS' : 'FAIL', JSON.stringify(back), ['b7-show-q.png', 'b7-show.png'])
  /* hide again, then the X */
  await B.press(w, '.chgwin .win-hide', null); await B.sleep(w, 700)
  const sx = await dump()
  await B.press(w, '.chgwin.bar .win-x', 'b7-x-q'); await B.sleep(w, 800); await shot(w, 'b7-x')
  const gone = await P.evaluate(() => ({ chg: [...document.querySelectorAll('.chgwin')].some(e => e.getBoundingClientRect().height > 0), histOn: (document.querySelector('#histBtn') || {}).className }))
  rec('B7 ✕ closes it (History off)', 'phone', sx && !gone.chg ? 'PASS' : 'FAIL', `bar before ${!!sx}; window left ${gone.chg}; hist button class "${gone.histOn}"`, ['b7-x-q.png', 'b7-x.png'])
} catch (e) { rec('ERROR', 'phone', 'FAIL', String(e).slice(0, 400)); await shot(w, 'b7-error').catch(() => {}) }
if (w.errs.length) rec('console', 'phone', 'FAIL', w.errs.join(' || ').slice(0, 600))
await w.ctx.close()
B.writeResults('b7')
await B.closeAll()
console.log('DONE')
