// THE PHONE CARRIES THE WINDOW ([KBS-PHONE-SLIDE], owner D1412, 27 Oct 26 — his four recordings: "all the text areas I click
// screen jerks or bounce a little when the keyboard opens … Why can't the text box I click on, auto scroll proportionately
// with the keyboard that appears and the window doesn't shrink awhile"). After six rounds that moved, held and glided a
// window against a model of his iPhone's slide, the app now leaves a window to the phone: Safari pans the visible screen
// to show the box and the window rides up with the page, in one motion. This walk plays his measured slides (kbs-slide-walk
// .mjs, 25 Oct 26 — up: cubic-bezier(.42,0,.58,1) over 250ms, told ~30ms in; down: cubic-bezier(.3,.58,.2,1) over 330ms)
// on a stand-in visible screen measuring as his phone does, and records the window's OWN place in the layout at every
// frame: it must not change by a point, up or down (the app touched nothing), and nothing may be shifted or held after.
// His screen is drawn frame by frame as before — the layout shifted up by the slide so far, the keys rising over it — so
// the pictures show the window carried with the page and the box arriving above the keys.
// Cases: A the input window from an Inputs calendar day (OL), A2 the same as "Other", B from a SANS calendar day, C the
// Tracker's All events → Edit → Name, E Admin → Duty templates (a window on a backdrop), F the sign-in page's username
// (his recordings of 25 Oct 26 20:43 and 27 Oct 26 08:20: a box above the keys, the phone panning 19), G its password (75).
// Usage (from raptor-port/, a build served): node scripts/handpass/kbs-carried-walk.mjs [PORT=4180] [OUT=<folder>] [ONLY=A,A2,B,C,E,F,G]
import { chromium } from 'playwright'
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
const PORT = process.env.PORT || '4180', ONLY = (process.env.ONLY || 'A,A2,B,C,E,F,G').split(',')
const OUT = process.env.OUT || 'docs/img/handpass/2026-10-27-kbs-carried'
mkdirSync(OUT, { recursive: true })
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const LAY = 684, W = 402, GAP = 8
const UP = { c: [0.42, 0, 0.58, 1], ms: 250 }, DOWN = { c: [0.3, 0.58, 0.2, 1], ms: 330 }
/* his numbers, case by case, off his readouts (pan, visible height; split: the pan told 15ms after the keys) */
const CASES = {
  A: { pan: 184, vh: 393, split: false, win: '[data-testid="win-inputedit"]', what: 'Inputs calendar day → + Input (OL) → Remarks' },
  A2: { pan: 272, vh: 390, split: true, win: '[data-testid="win-inputedit"]', what: 'Inputs calendar day → + Input → Other → Remarks' },
  B: { pan: 164, vh: 390, split: false, win: '[data-testid="win-inputedit"]', what: 'SANS calendar day → + → Remarks' },
  C: { pan: 294, vh: 390, split: true, win: '#showAllPanel', what: "Tracker → All events → ST-05's Edit → Name" },
  E: { pan: 200, vh: 393, split: false, win: '#tplModal .modal-box', what: 'Admin → Duty templates → the last time box' },
  F: { pan: 19, vh: 363, split: true, win: '.login-card', what: 'the sign-in page → Username (a box above the keys)', login: false },
  G: { pan: 75, vh: 363, split: true, win: '.login-card', what: 'the sign-in page → Password', login: false },
}
const bez = (p, [x1, y1, x2, y2]) => {
  if (p <= 0) return 0
  if (p >= 1) return 1
  let lo = 0, hi = 1, u = p
  for (let i = 0; i < 30; i++) { u = (lo + hi) / 2; const x = 3 * u * (1 - u) * (1 - u) * x1 + 3 * u * u * (1 - u) * x2 + u * u * u; if (x < p) lo = u; else hi = u }
  return 3 * u * (1 - u) * (1 - u) * y1 + 3 * u * u * (1 - u) * y2 + u * u * u
}
const b = await chromium.launch(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {})
const report = []
let bad = 0
for (const k of ONLY) {
  const C = CASES[k]
  const ctx = await b.newContext({ viewport: { width: W, height: LAY }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 })
  const page = await ctx.newPage()
  const errs = []
  page.on('pageerror', e => errs.push(String(e)))
  page.on('console', m => { if (m.type() === 'error') errs.push(m.text()) })
  await page.addInitScript(() => {
    class FakeVV extends EventTarget { width = innerWidth; height = innerHeight; offsetTop = 0; offsetLeft = 0; pageTop = 0; pageLeft = 0; scale = 1 }
    const f = new FakeVV()
    Object.defineProperty(window, 'visualViewport', { configurable: true, get: () => f })
    window.__vv = f
    /* his phone's measure: every box from the visible top once panned; the layout's height less the pan */
    const real = Element.prototype.getBoundingClientRect
    window.__realRect = real; window.__his = { pan: 0 }
    Element.prototype.getBoundingClientRect = function () { const r = real.call(this); return new DOMRect(r.x, r.y - window.__his.pan, r.width, r.height) }
    const d = Object.getOwnPropertyDescriptor(window, 'innerHeight') || Object.getOwnPropertyDescriptor(Window.prototype, 'innerHeight')
    Object.defineProperty(window, 'innerHeight', { configurable: true, get: () => d.get.call(window) - window.__his.pan })
    /* each frame carries the moment it was drawn at: a 6px square at the bottom right, its colour that frame's own time
       (the time its animations are drawn at), read back off the picture — the screencast's own stamp lags the frame */
    addEventListener('DOMContentLoaded', () => {
      const st = document.createElement('div')
      Object.assign(st.style, { position: 'fixed', right: '0', bottom: '0', width: '6px', height: '6px', zIndex: '2147483647', pointerEvents: 'none' })
      document.body.appendChild(st)
      const paint = ts => { const t = Math.round(ts) & 0xffffff; st.style.background = `rgb(${t >> 16},${(t >> 8) & 255},${t & 255})`; requestAnimationFrame(paint) }
      requestAnimationFrame(paint)
      /* and the time the window's own glide is drawn at: Chromium's compositor draws a moving window between the page's
         own frames, a frame ahead of the colour above — a 4px mark sweeping the foot of the screen, 400ms a sweep, on
         the same clock as the glide; where it stands says the moment within the sweep, the colour says which sweep */
      const mk = document.createElement('div')
      Object.assign(mk.style, { position: 'fixed', left: '0', bottom: '0', width: '4px', height: '4px', background: '#ff00ff', zIndex: '2147483647', pointerEvents: 'none' })
      document.body.appendChild(mk)
      const a = mk.animate([{ transform: 'translateX(0px)' }, { transform: `translateX(${innerWidth - 10}px)` }], { duration: 400, iterations: Infinity, easing: 'linear' })
      a.startTime = 0
    })
  })
  await page.goto(`http://localhost:${PORT}/`)
  if (C.login !== false) {
    await page.fill('#luser', 'ad'); await page.fill('#lpass', 'a')
    await page.click('#loginForm button[type=submit]')
    await page.waitForSelector('#vWeek .day', { state: 'attached' })
  }
  await page.evaluate(() => { const v = window.__vv; v.height = innerHeight; v.width = innerWidth; v.dispatchEvent(new Event('resize')) })
  const tapAt = async sel => { const l = page.locator(sel).first(); await l.scrollIntoViewIfNeeded(); const q = await l.boundingBox(); await page.touchscreen.tap(q.x + q.width / 2, q.y + Math.min(q.height / 2, 8)) }
  let box
  if (k === 'A' || k === 'A2') {
    await page.evaluate(() => window.go('inputs')); await page.waitForTimeout(600)
    await page.click('#inCalBtn'); await page.waitForTimeout(300)
    await tapAt('[data-icday] >> nth=10'); await page.locator('[data-testid="win-inputsday"]').waitFor(); await page.locator('#icPopAdd').click()
    if (k === 'A2') await page.selectOption('#inpEditType', 'Other')
    box = '#inpEditRmk'
  } else if (k === 'B') {
    await page.evaluate(() => window.go('inputs')); await page.waitForTimeout(600)
    await page.click('#inSansMode'); await page.waitForTimeout(300)
    await tapAt('[data-icday] >> nth=10'); await page.locator('[data-testid="sd-add"]').click()
    box = '#inpEditRmk'
  } else if (k === 'C') {
    await page.evaluate(() => window.go('tracker')); await page.waitForTimeout(1500)
    await page.locator('#showAllTab:visible, #showAllBtn:visible').first().click()
    await page.locator('#showAllPanel.on').waitFor()
    const row = page.locator('#showAllPanel .sarow', { hasText: 'ST-05' }).first()
    await row.scrollIntoViewIfNeeded(); await row.locator('.sedit').click()
    box = '#showAllPanel .saedit input'
  } else if (k === 'F' || k === 'G') {
    box = k === 'F' ? '#luser' : '#lpass'
  } else {
    await page.evaluate(() => window.go('admin')); await page.waitForTimeout(600)
    await page.evaluate(() => document.getElementById('admDutyTpl').click())
    box = '#tplModal input.tm:visible'
  }
  await page.waitForTimeout(700)
  const boxL = k === 'E' ? page.locator(box).last() : page.locator(box).first()
  { const q = await boxL.boundingBox(); await page.touchscreen.tap(q.x + q.width / 2, q.y + Math.min(q.height / 2, 8)) }
  await page.waitForTimeout(300)
  const focused = await boxL.evaluate(e => e === document.activeElement)
  const rest = await page.evaluate(sel => Math.round(window.__realRect.call(document.querySelector(sel)).top), C.win)
  /* Chromium's own frames, as it draws them, each with the moment it was drawn */
  const cdp = await ctx.newCDPSession(page)
  const origin = await page.evaluate(() => performance.timeOrigin)
  const play = async (dir) => {
    const frames = []
    const onFrame = async f => { frames.push({ t: f.metadata.timestamp * 1000 - origin, data: f.data }); try { await cdp.send('Page.screencastFrameAck', { sessionId: f.sessionId }) } catch { } }
    cdp.on('Page.screencastFrame', onFrame)
    await cdp.send('Page.startScreencast', { format: 'png', everyNthFrame: 1 })
    await page.waitForTimeout(250)
    const res = await page.evaluate(([dir, P, VH, split, UP, DOWN, win]) => new Promise(ok => {
      const w = window, el = document.querySelector(win), v = w.__vv, real = w.__realRect
      const bez = (p, [x1, y1, x2, y2]) => { if (p <= 0) return 0; if (p >= 1) return 1; let lo = 0, hi = 1, u = p; for (let i = 0; i < 30; i++) { u = (lo + hi) / 2; const x = 3 * u * (1 - u) * (1 - u) * x1 + 3 * u * u * (1 - u) * x2 + u * u * u; if (x < p) lo = u; else hi = u } return 3 * u * (1 - u) * (1 - u) * y1 + 3 * u * u * (1 - u) * y2 + u * u * u }
      const full = innerHeight + w.__his.pan, out = []
      let s0 = Infinity
      const pan = p => { w.__his.pan = p; v.offsetTop = p; v.pageTop = p }
      if (dir > 0) {
        if (split) { v.height = VH; v.dispatchEvent(new Event('resize')); setTimeout(() => { pan(P); s0 = performance.now() - 30; v.dispatchEvent(new Event('scroll')) }, 15) }
        else { v.height = VH; pan(P); s0 = performance.now() - 30; v.dispatchEvent(new Event('resize')); v.dispatchEvent(new Event('scroll')) }
      } else {
        s0 = performance.now() - 30; document.activeElement.blur()
        setTimeout(() => { pan(0); v.height = full; v.dispatchEvent(new Event('resize')); v.dispatchEvent(new Event('scroll')) }, 40)
      }
      const end = performance.now() + 600
      const tick = () => setTimeout(() => {
        const ts = Number(document.timeline.currentTime)
        const slid = dir > 0 ? P * bez((ts - s0) / UP.ms, UP.c) : P * (1 - bez((ts - s0) / DOWN.ms, DOWN.c))
        void slid
        const sc = el.querySelector('.win-body, .sa-list, .modal-body') || el
        out.push([Math.round(ts - s0), Math.round(real.call(el).top), sc.scrollTop])
        if (ts < end) requestAnimationFrame(tick); else ok({ out, s0 })
      }, 0)
      requestAnimationFrame(tick)
    }), [dir, C.pan, C.vh, C.split, UP, DOWN, C.win])
    await page.waitForTimeout(150)
    await cdp.send('Page.stopScreencast')
    cdp.off('Page.screencastFrame', onFrame)
    return { ...res, frames: frames.filter(f => f.t >= res.s0 - 100 && f.t <= res.s0 + 600) }
  }
  const up = await play(1)
  /* with the keys up: the box in his measure (from the visible top) — in sight above the keys, and above the window's own
     pinned Cancel / Add where it has one (the fresh read's F2: the rule used to check only that nothing moved) */
  const boxAt = await page.evaluate(([sel, last, win]) => {
    /* the walk's box selectors carry Playwright's :visible, which the page's own querySelectorAll does not know */
    const l = [...document.querySelectorAll(sel.replace(':visible', ''))].filter(e => e.offsetParent !== null || getComputedStyle(e).position === 'fixed'); const e = last ? l[l.length - 1] : l[0]; const r = e.getBoundingClientRect()
    const foot = document.querySelector(win)?.querySelector('.airpop-foot'); const fr = foot ? foot.getBoundingClientRect() : null
    return { top: Math.round(r.top), bottom: Math.round(r.bottom), foot: fr ? Math.round(fr.top) : null }
  }, [box, k === 'E', C.win])
  const boxOk = boxAt.top >= 0 && boxAt.bottom <= C.vh && (boxAt.foot == null || boxAt.bottom <= boxAt.foot + 0.5)
  await page.waitForTimeout(400)
  const down = await play(-1)
  /* the app never moves the window: its own place is the same at every frame, up and down, and nothing is shifted or held */
  const off = o => o.out.filter(([, y]) => Math.abs(y - rest) > 1)
  const upBad = off(up), downBad = off(down)
  const worst = o => Math.max(0, ...o.out.map(([, y]) => Math.abs(y - rest)))
  /* what the window's own body scrolled through the slide: its largest change frame to frame (a jump inside the window) */
  const bodyJump = o => Math.max(0, ...o.out.slice(1).map(([, , st], i) => Math.abs(st - o.out[i][2])))
  const touched = await page.evaluate(sel => { const e = document.querySelector(sel); return [e.style.translate, e.dataset.kblift, e.dataset.kbcap, e.style.getPropertyValue('--kbcap')].filter(Boolean) }, C.win)
  const okCase = focused && !upBad.length && !downBad.length && !touched.length && boxOk && !errs.length
  if (!okCase) bad++
  report.push({ k, what: C.what, focused, rest, upWorst: worst(up), downWorst: worst(down), touched, boxWithKeysUp: boxAt, boxOk, bodyJumpUp: bodyJump(up), bodyJumpDown: bodyJump(down), up: up.out.map(x => x[1]).join(' '), down: down.out.map(x => x[1]).join(' '), errs, ok: okCase })
  console.log(`${okCase ? 'PASS' : 'FAIL'} ${k} ${C.what}: the window's own top at rest ${rest}; furthest it moved — up ${worst(up)}, down ${worst(down)}; shifted or held after: ${touched.length ? touched.join(' ') : 'nothing'}; the box with the keys up ${boxAt.top}–${boxAt.bottom} of ${C.vh}${boxAt.foot != null ? ` (Cancel / Add at ${boxAt.foot})` : ''} ${boxOk ? 'in sight' : 'NOT IN SIGHT'}; the body's largest scroll step up ${bodyJump(up)}, down ${bodyJump(down)}${focused ? '' : ' (THE BOX NEVER TOOK THE FOCUS)'}${errs.length ? ' ERRORS ' + errs.join(' | ') : ''}`)
  console.log(`   up   ${up.out.map(x => x[1]).join(' ')}`)
  console.log(`   down ${down.out.map(x => x[1]).join(' ')}`)
  /* his screen, frame by frame: Chromium's frame shifted up by the slide so far, the keys rising over it, a dashed line
     where the window stood before the keys */
  const strip = async (o, dir, name) => {
    const pg = await ctx.newPage()
    await pg.setViewportSize({ width: 10, height: 10 })
    /* each frame's own time, off its stamp (the low 24 bits of the timeline's milliseconds) */
    const stamps = await pg.evaluate(async ([fr, W, LAY]) => {
      const out = []
      for (const d of fr) {
        const img = new Image(); img.src = 'data:image/png;base64,' + d; await img.decode()
        const c = document.createElement('canvas'); c.width = img.width; c.height = img.height
        const g = c.getContext('2d'); g.drawImage(img, 0, 0)
        const k = img.width / W, px = g.getImageData(Math.round((W - 3) * k), Math.round((LAY - 3) * k), 1, 1).data
        /* the sweeping mark: its left edge in the foot row */
        const row = g.getImageData(0, Math.round((LAY - 2) * k), Math.round((W - 8) * k), 1).data
        let mx = -1
        for (let x = 0; x < row.length / 4; x++) { const i = x * 4; if (row[i] > 200 && row[i + 1] < 80 && row[i + 2] > 200) { mx = x / k; break } }
        out.push([(px[0] << 16) | (px[1] << 8) | px[2], mx])
      }
      return out
    }, [o.frames.map(f => f.data), W, LAY])
    const base = Math.round(o.s0) & 0xffffff
    const pick = [], seen = new Set()
    const sweep = (W - 10) / 400, s0 = o.s0
    o.frames.forEach((f, i) => {
      const [st, mx] = stamps[i]
      let T = st - base; if (T < -0x800000) T += 0x1000000
      /* the frame's own moment: the sweep's moment nearest the page's stamp (never more than two frames off it) */
      if (mx >= 0) { const tc = mx / sweep, abs = T + s0, k = Math.round((abs - tc) / 400); T = tc + 400 * k - s0 }
      const slot = Math.round(T / 33); if (T >= 0 && T <= 400 && !seen.has(slot)) { seen.add(slot); pick.push({ ...f, T }) }
    })
    const png = await pg.evaluate(async ([pick, dir, P, VH, LAY, W, UP, DOWN, mark, name, bezSrc]) => {
      const bez = new Function('return ' + bezSrc)()
      const S = 0.5, cw = Math.round(W * S), ch = Math.round(LAY * S), pad = 6, head = 22
      const c = document.createElement('canvas'); c.width = (cw + pad) * pick.length + pad; c.height = ch + head + pad * 2
      const g = c.getContext('2d'); g.fillStyle = '#fff'; g.fillRect(0, 0, c.width, c.height)
      g.fillStyle = '#111'; g.font = 'bold 13px sans-serif'; g.fillText(name, pad, 15)
      for (let i = 0; i < pick.length; i++) {
        const f = pick[i], x0 = pad + i * (cw + pad), y0 = head + pad
        const img = new Image(); img.src = 'data:image/png;base64,' + f.data; await img.decode()
        const slid = dir > 0 ? P * bez(f.T / UP.ms, UP.c) : P * (1 - bez(f.T / DOWN.ms, DOWN.c))
        const kb = dir > 0 ? LAY - (LAY - VH) * bez(f.T / UP.ms, UP.c) : VH + (LAY - VH) * bez(f.T / DOWN.ms, DOWN.c)
        g.save(); g.beginPath(); g.rect(x0, y0, cw, ch); g.clip()
        g.fillStyle = '#000'; g.fillRect(x0, y0, cw, ch)
        g.drawImage(img, x0, y0 - slid * S, cw, img.height * cw / img.width)
        g.fillStyle = '#3a3d42'; g.fillRect(x0, y0 + kb * S, cw, ch)
        g.fillStyle = '#9aa'; g.font = '10px sans-serif'; g.fillText('keys', x0 + cw / 2 - 10, y0 + kb * S + 14)
        g.setLineDash([4, 3]); g.strokeStyle = '#00e5ff'; g.lineWidth = 1.5; g.beginPath(); g.moveTo(x0, y0 + mark * S); g.lineTo(x0 + cw, y0 + mark * S); g.stroke()
        g.restore()
        g.strokeStyle = '#999'; g.setLineDash([]); g.lineWidth = 1; g.strokeRect(x0 + 0.5, y0 + 0.5, cw - 1, ch - 1)
        g.fillStyle = '#111'; g.font = '11px sans-serif'; g.fillText(`${Math.round(f.T)} ms`, x0 + 2, y0 + ch + 0 - 3 + pad)
      }
      return c.toDataURL('image/png')
    }, [pick.map(f => ({ data: f.data, T: f.T })), dir, C.pan, C.vh, LAY, W, UP, DOWN, rest, name, bez.toString()])
    writeFileSync(`${OUT}/${k}-${dir > 0 ? 'up' : 'down'}.png`, Buffer.from(png.split(',')[1], 'base64'))
    /* FRAMES=1: each frame of his screen alone, full size, for a look card (frames/<case>-<up|down>-<ms>.png) */
    if (process.env.FRAMES) {
      mkdirSync(`${OUT}/frames`, { recursive: true })
      const one = await pg.evaluate(async ([pick, dir, P, VH, LAY, W, UP, DOWN, bezSrc]) => {
        const bez = new Function('return ' + bezSrc)(), out = []
        for (const f of pick) {
          const c = document.createElement('canvas'); c.width = W * 2; c.height = LAY * 2
          const g = c.getContext('2d'), img = new Image(); img.src = 'data:image/png;base64,' + f.data; await img.decode()
          const slid = dir > 0 ? P * bez(f.T / UP.ms, UP.c) : P * (1 - bez(f.T / DOWN.ms, DOWN.c))
          const kb = dir > 0 ? LAY - (LAY - VH) * bez(f.T / UP.ms, UP.c) : VH + (LAY - VH) * bez(f.T / DOWN.ms, DOWN.c)
          g.fillStyle = '#000'; g.fillRect(0, 0, c.width, c.height)
          g.drawImage(img, 0, -slid * 2, W * 2, img.height * W * 2 / img.width)
          g.fillStyle = '#3a3d42'; g.fillRect(0, kb * 2, c.width, c.height)
          out.push([Math.round(f.T), c.toDataURL('image/png')])
        }
        return out
      }, [pick.map(f => ({ data: f.data, T: f.T })), dir, C.pan, C.vh, LAY, W, UP, DOWN, bez.toString()])
      for (const [T, d] of one) writeFileSync(`${OUT}/frames/${k}-${dir > 0 ? 'up' : 'down'}-${String(T).padStart(3, '0')}.png`, Buffer.from(d.split(',')[1], 'base64'))
    }
    await pg.close()
  }
  await strip(up, 1, `${k} keys up — ${C.what} (dashed: the window's own place; it rides up with the page)`)
  await strip(down, -1, `${k} keys down (dashed: the window's own place; it rides back down with the page)`)
  await ctx.close()
}
writeFileSync(`${OUT}/report.json`, JSON.stringify(report, null, 1))
await b.close()
console.log(bad ? `${bad} case(s) FAIL` : 'all cases PASS')
process.exit(bad ? 1 : 0)
