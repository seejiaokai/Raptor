// frf-w3-draw — the drawing check for the OIL list's held sign-off (look A, draw-f3.mjs round 6), done by measure: the
// formal part list (scripts/drawcheck/specs) was NOT made — see the report. Both sides are measured in ONE world, the
// drawing's own (its setup copied whole from draw-f3.mjs: the emptied Saturday, the Training, sign, publish, the Training
// off, the Original loaded back, Unpublish), on this build:
//   DRAWN  draw-f3's look A injected exactly as the drawing script injects it (its CSS, its clone of the real pill)
//   BUILT  the list closed, then CUR CK pressed on the board for real: the built held box
// Run from raptor-port/:  TS_URL=http://localhost:4313/ node scripts/handpass/frf-w3-draw.mjs
import { chromium, webkit } from '@playwright/test'
import { writeFileSync, mkdirSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
console.log('frf-w3-draw v1')
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
const OUT = path.join(ROOT, 'docs/img/handpass/2026-11-22-fable-read-faults/w3/draw')
mkdirSync(OUT, { recursive: true })
const URL_ = process.env.TS_URL || 'http://localhost:4313/'
const SIZES = {
  d: { name: 'desktop', eng: chromium, opts: { viewport: { width: 1536, height: 864 }, deviceScaleFactor: 2 } },
  p: { name: 'phone', eng: webkit, opts: { viewport: { width: 402, height: 874 }, isMobile: true, hasTouch: true, deviceScaleFactor: 3 } },
}
const W = { held: 'waiting for your answer', foot: 'Later: Ace signs, but nobody on it earns OIL.' }
/* draw-f3.mjs's CSS, copied whole */
const CSS = `
.mkq { outline: 2px solid #ff2d95 !important; outline-offset: 2px !important; }
.sgn.mk-held { border-style: dotted; border-color: var(--ink-3); cursor: default }
.sgn.mk-held::after { content: none }
.mk-heldrow { display: flex; align-items: center; gap: 10px; flex-wrap: wrap }
`
const SIGN = '#schedBoard .sb-sign'
const hideToast = p => p.evaluate(() => { const t = document.getElementById('toastEl'); if (t) { t.style.transition = 'none'; t.style.opacity = '0' } })
async function pick(p, role, nth) {
  const sel = p.locator(`${SIGN} select[data-sign="${role}"]:visible`).first()
  const v = await sel.locator('option').evaluateAll((os, n) => os.map(o => o.value).filter(Boolean)[n], nth)
  await sel.selectOption(v); await p.waitForTimeout(250)
}
/* draw-f3.mjs setup(), copied whole but for the foot overwrite (the drawing's own words are put on the DRAWN side only) */
async function setup(p) {
  await p.goto(URL_); await p.fill('#luser', 'ad'); await p.fill('#lpass', 'a'); await p.click('#loginForm button[type=submit]')
  await p.waitForSelector('#vWeek .day', { state: 'attached' }); await p.waitForTimeout(500); await p.addStyleTag({ content: CSS })
  await p.evaluate(() => { const w = window, d = w.DAYS[5]; d.waves = []; d.sims = {}; d.dutywaves = []; d.ground = []; d.notes = []; d.allhands = []
    w.INPUTS.unshift({ iid: 'mk-train', person: 'bane', type: 'Training', date: 'Jul 18', yr: 2026, allday: false, s: 480, e: 1020, remarks: '', mod: 'now', acc: 'g' }); w.afterSchedMutate() })
  await p.evaluate(t => window.go(t), 'editsched'); await p.waitForFunction(() => window.CURPAGE === 'editsched'); await p.waitForTimeout(400)
  await p.locator('#eWeek [data-sbday="5"]').first().evaluate(e => { e.scrollIntoView({ block: 'center', inline: 'center' }); e.click() })
  await p.locator('#schedBoard .sb-sec').first().waitFor({ state: 'attached' }); await p.waitForTimeout(500)
  /* on THIS build the first sign press itself asks (the feature): Later, so the door can go on as the drawing's did */
  await pick(p, 'cur', 0); if (await p.locator('[data-testid="odl-later"]').count()) { await p.locator('[data-testid="odl-later"]').click(); await p.waitForTimeout(250) }
  await pick(p, 'sked', 0); await pick(p, 'plan', 1); await pick(p, 'appr', 2)
  await p.locator('#schedBoard [data-beak="5"]:visible').first().click(); await p.waitForFunction(() => window.dayApproved(5)); await hideToast(p)
  const ri = await p.evaluate(() => window.DAYS[5].ground.findIndex(g => String(g.src) === 'mk-train'))
  await p.locator(`#schedBoard [data-grdel="5.${ri}"]:visible`).first().click()
  await p.waitForFunction(() => window.INPUTS.find(x => x.iid === 'mk-train').acc !== 'g')
  await p.locator('#schedBoard [data-planmenu="5"]:visible').first().click()
  const pv = p.locator('[data-planpv]:visible').first(), ver = await pv.getAttribute('data-planpv'); await pv.click()
  const load = p.locator(`#schedBoard button[data-restore="5"][data-rver="${ver}"]:visible`).first(); await load.click(); await p.waitForTimeout(200); if (await load.count()) await load.click()
  await p.locator('[data-testid="win-oilday"]').waitFor({ timeout: 8000 }); await hideToast(p)
  const un = p.locator('#schedBoard button[data-unpub="5"]:visible').first(); await un.click(); await p.waitForTimeout(250)
  if (await un.count() && await p.evaluate(() => window.dayApproved(5))) await un.click()
  await p.waitForFunction(() => !window.dayApproved(5)); await p.waitForTimeout(400); await hideToast(p)
  const back = await p.evaluate(() => ({ acc: window.INPUTS.find(x => x.iid === 'mk-train').acc, missing: window.signMissing(5).length, list: !!document.querySelector('[data-testid="win-oilday"]') }))
  if (back.acc !== 'g' || back.missing !== 4 || !back.list) throw new Error('premise ' + JSON.stringify(back))
}
/* THE ONE MEASURE, read the same way off both sides: `rowSel` the held row, `pillSel` the box in it, `saySel` its words */
const measure = (p, rowSel) => p.evaluate(rowSel => {
  const win = document.querySelector('[data-testid="win-oilday"]'), row = win.querySelector(rowSel), pill = row.querySelector('.sgn'), say = row.querySelector('.upconf-need')
  const count = win.querySelector('.odl-count'), h3 = count.querySelector('h3'), foot = win.querySelector('[data-testid="odl-left"]')
  const R = e => { const r = e.getBoundingClientRect(); return { x: +r.left.toFixed(2), y: +r.top.toFixed(2), w: +r.width.toFixed(2), h: +r.height.toFixed(2) } }
  const rg = document.createRange(); rg.selectNodeContents(h3); const countLeft = rg.getBoundingClientRect().left
  const baseOf = el => { const m = document.createElement('span'); m.style.cssText = 'display:inline-block;width:0;height:0'; el.appendChild(m); const y = m.getBoundingClientRect().bottom; m.remove(); return y }
  const sc = getComputedStyle(say), cv = document.createElement('canvas').getContext('2d'); cv.font = `${sc.fontWeight} ${sc.fontSize} ${sc.fontFamily}`
  const xh = cv.measureText('x').actualBoundingBoxAscent, pb = pill.getBoundingClientRect()
  const ps = getComputedStyle(pill), pa = getComputedStyle(pill, '::after'), v = getComputedStyle(pill.querySelector('.v')), k = getComputedStyle(pill.querySelector('.k'))
  const fs = getComputedStyle(foot)
  return {
    win: R(win), row: R(row), pill: R(pill), say: R(say), count: R(count), foot: R(foot),
    pillToCountLetter: +(pb.left - countLeft).toFixed(2), gapUnderRow: +(count.getBoundingClientRect().top - row.getBoundingClientRect().bottom).toFixed(2),
    gapAboveRow: +(row.getBoundingClientRect().top - win.querySelector('.win-body, .fw-body, .win-ttl')?.getBoundingClientRect().bottom).toFixed(2),
    xMidOffBoxMid: +((baseOf(say) - xh / 2) - (pb.top + pb.height / 2)).toFixed(2),
    pillBorder: `${ps.borderTopStyle} ${ps.borderTopWidth} ${ps.borderTopColor}`, pillBg: ps.backgroundColor, pillRadius: ps.borderTopLeftRadius, pillFont: `${ps.fontSize}/${ps.lineHeight}`,
    after: pa.content, kColor: k.color, kFont: `${k.fontWeight} ${k.fontSize}`, vColor: v.color, vFont: `${v.fontWeight} ${v.fontSize}`, vText: pill.querySelector('.v').textContent,
    sayColor: sc.color, sayFont: `${sc.fontStyle} ${sc.fontWeight} ${sc.fontSize}`, sayText: say.textContent, footText: foot.textContent, footColor: fs.color, footFont: `${fs.fontStyle} ${fs.fontWeight} ${fs.fontSize}`,
  }
}, rowSel)

async function side(sz, which) {
  const b = await sz.eng.launch(), ctx = await b.newContext(sz.opts), p = await ctx.newPage()
  const errs = []; p.on('pageerror', e => errs.push(e.message))
  /* the DRAWN side stands in the drawing's own world; the BUILT side in the same emptied Saturday and Training, the board
     opened and CUR CK pressed for real (the drawing's door pressed Later on its way, and Later rightly asks no more that
     day of that input, so the built hold cannot be raised at the end of the drawing's door) */
  if (which === 'drawn') await setup(p)
  else {
    await p.goto(URL_); await p.fill('#luser', 'ad'); await p.fill('#lpass', 'a'); await p.click('#loginForm button[type=submit]')
    await p.waitForSelector('#vWeek .day', { state: 'attached' }); await p.waitForTimeout(500)
    await p.evaluate(() => { const w = window, d = w.DAYS[5]; d.waves = []; d.sims = {}; d.dutywaves = []; d.ground = []; d.notes = []; d.allhands = []
      w.INPUTS.unshift({ iid: 'mk-train', person: 'bane', type: 'Training', date: 'Jul 18', yr: 2026, allday: false, s: 480, e: 1020, remarks: '', mod: 'now', acc: 'g' }); w.afterSchedMutate() })
    await p.evaluate(t => window.go(t), 'editsched'); await p.waitForFunction(() => window.CURPAGE === 'editsched'); await p.waitForTimeout(400)
    await p.locator('#eWeek [data-sbday="5"]').first().evaluate(e => { e.scrollIntoView({ block: 'center', inline: 'center' }); e.click() })
    await p.locator('#schedBoard .sb-sec').first().waitFor({ state: 'attached' }); await p.waitForTimeout(500)
  }
  let rowSel
  if (which === 'drawn') {
    /* draw-f3.mjs look A, copied whole (its measure lines left out: ours follows) */
    await p.evaluate(([W, SIGN]) => {
      const win = document.querySelector('[data-testid="win-oilday"]'), count = win.querySelector('.odl-count')
      const real = [...document.querySelectorAll(SIGN + ' label.sgn')].find(e => e.getBoundingClientRect().width > 0)
      const pill = real.cloneNode(true); pill.querySelector('select')?.remove(); pill.classList.remove('on'); pill.classList.add('mk-held')
      pill.querySelector('.v').textContent = 'Ace'; pill.removeAttribute('title')
      const rc = getComputedStyle(real); pill.style.fontSize = rc.fontSize; pill.style.lineHeight = rc.lineHeight; pill.style.height = rc.height
      const row = document.createElement('div'); row.className = 'mk-heldrow'; row.setAttribute('data-mknew', 'held')
      const say = document.createElement('span'); say.className = 'upconf-need'; say.textContent = W.held
      row.append(pill, say); count.parentNode.insertBefore(row, count)
      row.style.margin = getComputedStyle(count).marginTop + ' 0 10px'
      const baseOf = el => { const m = document.createElement('span'); m.style.cssText = 'display:inline-block;width:0;height:0'; el.appendChild(m); const y = m.getBoundingClientRect().bottom; m.remove(); return y }
      const cv = document.createElement('canvas').getContext('2d'); const sc = getComputedStyle(say)
      cv.font = `${sc.fontWeight} ${sc.fontSize} ${sc.fontFamily}`; const xh = cv.measureText('x').actualBoundingBoxAscent
      const pb = pill.getBoundingClientRect(), mid = pb.top + pb.height / 2
      const lift = (baseOf(say) - xh / 2) - mid
      say.style.position = 'relative'; say.style.top = (-lift).toFixed(2) + 'px'
      const l = win.querySelector('[data-testid="odl-left"]'); l.textContent = W.foot
    }, [W, SIGN])
    rowSel = '[data-mknew="held"]'
  } else {
    await pick(p, 'cur', 0); await p.locator('[data-testid="odl-held"]').waitFor()
    rowSel = '[data-testid="odl-held"]'
  }
  await p.waitForTimeout(300); await hideToast(p)
  /* the window is a FLOATING one: the BUILT one opened afresh, the DRAWN one stood where the load-back put it — so place is
     compared inside the window (rel), and the window's own place is listed apart */
  const m = await measure(p, rowSel)
  const wb = m.win, clip = { x: Math.max(0, wb.x - 8), y: Math.max(0, wb.y - 8), width: Math.min(sz.opts.viewport.width - Math.max(0, wb.x - 8), wb.w + 16), height: Math.min(sz.opts.viewport.height - Math.max(0, wb.y - 8), wb.h + 16) }
  const file = path.join(OUT, `${which}-${sz.name}.png`); await p.screenshot({ path: file, clip })
  await b.close()
  return { m, file, clip, errs }
}
const rel = (m, k) => ({ x: +(m[k].x - m.win.x).toFixed(2), y: +(m[k].y - m.win.y).toFixed(2), w: m[k].w, h: m[k].h })
const report = {}
for (const k of ['d', 'p']) {
  const sz = SIZES[k], D = await side(sz, 'drawn'), B = await side(sz, 'built')
  const diffs = []
  for (const part of ['row', 'pill', 'say', 'count', 'foot']) {
    const a = rel(D.m, part), c = rel(B.m, part)
    for (const q of ['x', 'y', 'w', 'h']) if (Math.abs(a[q] - c[q]) > 2) diffs.push({ part, q, drawn: a[q], built: c[q], off: +(c[q] - a[q]).toFixed(2) })
  }
  for (const q of ['pillToCountLetter', 'gapUnderRow', 'xMidOffBoxMid']) { const lim = q === 'xMidOffBoxMid' ? 0.5 : 2; if (Math.abs(D.m[q] - B.m[q]) > lim || (q === 'xMidOffBoxMid' && Math.abs(B.m[q]) > 0.5)) diffs.push({ part: q, drawn: D.m[q], built: B.m[q] }) }
  for (const q of ['pillBorder', 'pillBg', 'pillRadius', 'after', 'kColor', 'kFont', 'vColor', 'vFont', 'vText', 'sayColor', 'sayFont', 'sayText', 'footText', 'footColor', 'footFont']) if (String(D.m[q]) !== String(B.m[q])) diffs.push({ part: q, drawn: D.m[q], built: B.m[q] })
  const winW = { drawn: D.m.win.w, built: B.m.win.w, drawnH: D.m.win.h, builtH: B.m.win.h, drawnAt: [D.m.win.x, D.m.win.y], builtAt: [B.m.win.x, B.m.win.y] }
  report[sz.name] = { drawn: D.m, built: B.m, diffs, win: winW, errs: [...D.errs, ...B.errs] }
  console.log(sz.name, 'pill h drawn/built', D.m.pill.h, B.m.pill.h, '| left vs letter', D.m.pillToCountLetter, B.m.pillToCountLetter, '| x-mid', D.m.xMidOffBoxMid, B.m.xMidOffBoxMid, '| gap', D.m.gapUnderRow, B.m.gapUnderRow)
  console.log(sz.name, 'diffs', JSON.stringify(diffs))
  console.log(sz.name, 'window', JSON.stringify(winW))
  /* the side-by-side, each difference's part ringed on both pictures */
  const sb = await chromium.launch(), sp = await (await sb.newContext({ viewport: { width: 1200, height: 800 } })).newPage()
  const scale = 1, ring = (m, clip, parts) => parts.map(pt => { const r = m[pt]; if (!r || r.x == null) return ''; return `<div style="position:absolute;left:${(r.x - clip.x) * scale - 2}px;top:${(r.y - clip.y) * scale - 2}px;width:${r.w * scale + 4}px;height:${r.h * scale + 4}px;outline:2px solid #ff2d95"></div>` }).join('')
  const parts = [...new Set(diffs.map(d => d.part).map(x => ({ pillBorder: 'pill', pillBg: 'pill', pillRadius: 'pill', after: 'pill', kColor: 'pill', kFont: 'pill', vColor: 'pill', vFont: 'pill', vText: 'pill', sayColor: 'say', sayFont: 'say', sayText: 'say', footText: 'foot', footColor: 'foot', footFont: 'foot', pillToCountLetter: 'pill', gapUnderRow: 'row', xMidOffBoxMid: 'say' })[x] || x))]
  const img = (f, m, clip, lbl) => `<div style="display:inline-block;vertical-align:top;margin:8px"><div style="font:600 13px system-ui;color:#fff;margin-bottom:4px">${lbl}</div><div style="position:relative;width:${clip.width}px"><img src="data:image/png;base64,${readFileSync(f).toString('base64')}" style="width:${clip.width}px;display:block">${ring(m, clip, parts)}</div></div>`
  await sp.setContent(`<body style="background:#222;margin:0">${img(D.file, D.m, D.clip, 'DRAWN (draw-f3 look A)')}${img(B.file, B.m, B.clip, 'BUILT (CUR CK pressed)')}<div style="font:12px system-ui;color:#ddd;margin:8px;max-width:1150px">${diffs.map(d => JSON.stringify(d)).join('<br>') || 'no difference over 2px / 0.5px'}</div></body>`)
  await sp.waitForTimeout(300)
  await sp.screenshot({ path: path.join(OUT, `side-by-side-${sz.name}.png`), fullPage: true }); await sb.close()
}
writeFileSync(path.join(OUT, 'report.json'), JSON.stringify(report, null, 1))
console.log('done')
