// OIL F2, round 4 (his "/impeccable can u design 1 nicer", 22 Nov 26, after D2296's "be concise"): two looks for the top of
// the day's OIL list when a sign-off press opens it, drawn on the REAL app (mockups-on-the-real-app.md), the same Saturday
// and the same door as draw-f2.mjs (published, Training off, the Original loaded back, Unpublish — every step pressed).
//   A  the held signature shown as itself: a copy of the board's own CUR CK pill (its markup, class .sgn) reading "Ace",
//      its edge dotted — the app's mark for "waiting to go in" (a pending row's dotted underline, the hollow ALn tag) —
//      and no ▾, beside "signs on Save or Later" in the foot's own quiet class (.upconf-need). No paragraph above the list.
//   B  no new block at all: the window's own subtitle slot (where a holiday's name stands, FloatWin `sub`) reads
//      "Before Ace signs CUR CK".
// Both keep round 3's foot line beside Later. Pictures: img/f3-*.png; measures: img/manifest-f3.json.
// Run from raptor-port/ against a built preview:  TS_URL=http://localhost:4187/ node docs/mock/2026-11-22-oil-unanswered-publish/draw-f3.mjs
import { chromium, webkit } from '@playwright/test'
import { mkdirSync, writeFileSync } from 'node:fs'

const URL_ = process.env.TS_URL || 'http://localhost:4187/'
const OUT = 'docs/mock/2026-11-22-oil-unanswered-publish/img'
mkdirSync(OUT, { recursive: true })
const SIZES = {
  d: { name: 'desktop', eng: chromium, opts: { viewport: { width: 1536, height: 864 }, deviceScaleFactor: 2 } },
  p: { name: 'phone', eng: webkit, opts: { viewport: { width: 402, height: 874 }, isMobile: true, hasTouch: true, deviceScaleFactor: 3 } },
}
/* round 5 (his D2297: A chosen, "what does signs on save or later mean"): round 4's "signs on Save or Later" and
   "Later: nobody on it earns OIL." reworded so each says what happens */
const W = { held: 'waiting for your answer', sub: 'Before Ace signs CUR CK', foot: 'Later: Ace signs, but nobody on it earns OIL.' }
const CSS = `
.mkq { outline: 2px solid #ff2d95 !important; outline-offset: 2px !important; }
.mkq-tag { position: fixed; z-index: 2147483647; background: #ff2d95; color: #fff; font: 700 10px/14px system-ui, 'Segoe UI', sans-serif;
  padding: 0 4px; border-radius: 7px; pointer-events: none; white-space: nowrap; }
/* A's one new style: the held pill's dotted edge, no ▾ (it opens nothing) */
.sgn.mk-held { border-style: dotted; border-color: var(--ink-3); cursor: default }
.sgn.mk-held::after { content: none }
.mk-heldrow { display: flex; align-items: center; gap: 10px; flex-wrap: wrap }
`
const manifest = { drawn: new Date().toISOString(), url: URL_, words: W, frames: [], checks: {} }
const log = (...a) => console.log(...a)
const SIGN = '#schedBoard .sb-sign'

async function box(p, sel) { return p.evaluate(sel => { const e = [...document.querySelectorAll(sel)].find(x => x.getBoundingClientRect().width > 0); if (!e) return null; const r = e.getBoundingClientRect(); return { x: r.left, y: r.top, w: r.width, h: r.height } }, sel) }
async function shot(p, sz, name, sel, pad = 8) {
  const b = await box(p, sel); if (!b) throw new Error(name + ': nothing for ' + sel)
  const vw = sz.opts.viewport.width, vh = sz.opts.viewport.height, x = Math.max(0, b.x - pad), y = Math.max(0, b.y - pad)
  const clip = { x, y, width: Math.min(vw - x, b.w + 2 * pad), height: Math.min(vh - y, b.h + 2 * pad) }
  const file = `${OUT}/${name}-${sz.name}.png`; await p.screenshot({ path: file, clip }); manifest.frames.push({ name, size: sz.name, clip }); log('shot', file)
}
async function full(p, sz, name) { const file = `${OUT}/${name}-${sz.name}.png`; await p.screenshot({ path: file }); manifest.frames.push({ name, size: sz.name, clip: 'viewport' }); log('shot', file) }
async function tag(p, sel, label) {
  await p.evaluate(([sel, label]) => {
    const el = [...document.querySelectorAll(sel)].find(e => e.getBoundingClientRect().width > 0); if (!el) throw new Error('tag: no ' + sel)
    el.classList.add('mkq'); const b = el.getBoundingClientRect(), t = document.createElement('span')
    t.className = 'mkq-tag'; t.textContent = label; t.setAttribute('data-mine', '1'); document.body.appendChild(t)
    t.style.left = (b.right - t.offsetWidth - 2) + 'px'; t.style.top = Math.max(0, b.top - t.offsetHeight - 3) + 'px'
  }, [sel, label])
}
const untag = p => p.evaluate(() => { document.querySelectorAll('[data-mine]').forEach(e => e.remove()); document.querySelectorAll('.mkq').forEach(e => e.classList.remove('mkq')) })
const hideToast = p => p.evaluate(() => { const t = document.getElementById('toastEl'); if (t) { t.style.transition = 'none'; t.style.opacity = '0' } })
async function pick(p, role, nth) {
  const sel = p.locator(`${SIGN} select[data-sign="${role}"]:visible`).first()
  const v = await sel.locator('option').evaluateAll((os, n) => os.map(o => o.value).filter(Boolean)[n], nth)
  await sel.selectOption(v); await p.waitForTimeout(250)
}
async function setup(p) {
  await p.goto(URL_); await p.fill('#luser', 'ad'); await p.fill('#lpass', 'a'); await p.click('#loginForm button[type=submit]')
  await p.waitForSelector('#vWeek .day', { state: 'attached' }); await p.waitForTimeout(500); await p.addStyleTag({ content: CSS })
  await p.evaluate(() => { const w = window, d = w.DAYS[5]; d.waves = []; d.sims = {}; d.dutywaves = []; d.ground = []; d.notes = []; d.allhands = []
    w.INPUTS.unshift({ iid: 'mk-train', person: 'bane', type: 'Training', date: 'Jul 18', yr: 2026, allday: false, s: 480, e: 1020, remarks: '', mod: 'now', acc: 'g' }); w.afterSchedMutate() })
  await p.evaluate(t => window.go(t), 'editsched'); await p.waitForFunction(() => window.CURPAGE === 'editsched'); await p.waitForTimeout(400)
  await p.locator('#eWeek [data-sbday="5"]').first().evaluate(e => { e.scrollIntoView({ block: 'center', inline: 'center' }); e.click() })
  await p.locator('#schedBoard .sb-sec').first().waitFor({ state: 'attached' }); await p.waitForTimeout(500)
  /* the door (as draw-f2.mjs): sign, publish, Training off, the Original back (the list opens), Unpublish */
  await pick(p, 'cur', 0); await pick(p, 'sked', 0); await pick(p, 'plan', 1); await pick(p, 'appr', 2)
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
  /* the foot, as round 3 */
  await p.evaluate(W => { const l = document.querySelector('[data-testid="win-oilday"] [data-testid="odl-left"]'); l.textContent = W.foot }, W)
}

async function run(key) {
  const sz = SIZES[key], b = await sz.eng.launch()
  for (const look of ['a', 'b']) {
    const ctx = await b.newContext(sz.opts), p = await ctx.newPage()
    p.on('pageerror', e => log('PAGE ERROR', e.message))
    await setup(p)
    if (look === 'a') {
      const m = await p.evaluate(([W, SIGN]) => {
        const win = document.querySelector('[data-testid="win-oilday"]'), count = win.querySelector('.odl-count')
        const real = [...document.querySelectorAll(SIGN + ' label.sgn')].find(e => e.getBoundingClientRect().width > 0)
        const pill = real.cloneNode(true); pill.querySelector('select')?.remove(); pill.classList.remove('on'); pill.classList.add('mk-held')
        pill.querySelector('.v').textContent = 'Ace'; pill.removeAttribute('title')
        /* the window sets a bigger text size than the board: the pill keeps the board's, measured off the real one */
        const rc = getComputedStyle(real); pill.style.fontSize = rc.fontSize; pill.style.lineHeight = rc.lineHeight; pill.style.height = rc.height
        const row = document.createElement('div'); row.className = 'mk-heldrow'; row.setAttribute('data-mknew', 'held')
        const say = document.createElement('span'); say.className = 'upconf-need'; say.textContent = W.held
        row.append(pill, say); count.parentNode.insertBefore(row, count)
        row.style.margin = getComputedStyle(count).marginTop + ' 0 10px'
        /* measured: the pill's height against the real box's, and the row's left edge against the count's first letter */
        const r = document.createRange(); r.selectNodeContents(count.querySelector('h3')); const cl = r.getBoundingClientRect().left
        /* round 6 (his "/impeccable … waiting for your answer and the CUR CK Ace doesn't seem vertically aligned"): the
           words beside the box sit on the same baseline as "Ace" inside it. Measured by a zero-height mark at the end
           of each text (its bottom is the line's baseline); centring the two boxes left them apart, the pill's letters
           not being centred in its own box. The fix is the row's own rule: align-items: baseline. */
        const baseOf = el => { const m = document.createElement('span'); m.style.cssText = 'display:inline-block;width:0;height:0'; el.appendChild(m); const y = m.getBoundingClientRect().bottom; m.remove(); return y }
        const before = baseOf(pill.querySelector('.v')) - baseOf(say)
        /* the baselines were already level (measured 0), so the miss is optical: "waiting for your answer" is lower
           case, its letters' middle (x-height) sits below the box's middle, where the capitals "CUR CK" are centred.
           So the words' x-height middle is put on the box's middle line: raised by the measured difference. */
        const cv = document.createElement('canvas').getContext('2d'); const sc = getComputedStyle(say)
        cv.font = `${sc.fontWeight} ${sc.fontSize} ${sc.fontFamily}`; const xh = cv.measureText('x').actualBoundingBoxAscent
        const pb = pill.getBoundingClientRect(), mid = pb.top + pb.height / 2
        const lift = (baseOf(say) - xh / 2) - mid
        say.style.position = 'relative'; say.style.top = (-lift).toFixed(2) + 'px'
        const after = (baseOf(say) - xh / 2) - mid
        return { pillH: pill.getBoundingClientRect().height, realH: real.getBoundingClientRect().height, rowLeft: pill.getBoundingClientRect().left, countLeft: cl, baselineGapCentred: before, xHeight: xh, lift, baselineGapNow: after }
      }, [W, SIGN])
      log('A', JSON.stringify(m)); manifest.checks[sz.name + '-A'] = m
      if (Math.abs(m.pillH - m.realH) > 0.5 || Math.abs(m.rowLeft - m.countLeft) > 0.5) log('A: an edge is off — see the measure')
      if (Math.abs(m.baselineGapNow) > 0.5) throw new Error('A: the words beside the box are not on its baseline ' + m.baselineGapNow)
      await tag(p, '[data-mknew="held"]', 'New')
    } else {
      await p.evaluate(W => {
        const ttl = document.querySelector('[data-testid="win-oilday"] .win-ttl')
        /* the app's own subtitle element; the mark goes on a span round its words (the <small> itself draws as a thin line) */
        const s = document.createElement('small'); const t = document.createElement('span'); t.textContent = W.sub; t.setAttribute('data-mknew', 'sub'); t.style.display = 'inline-block'
        s.appendChild(t); ttl.appendChild(s)
      }, W)
      /* the title clips anything outside it, so the mark sits inside the words' box and the tag to their right */
      await p.evaluate(() => {
        const el = document.querySelector('[data-mknew="sub"]'); el.style.boxShadow = 'inset 0 0 0 2px #ff2d95'
        const b = el.getBoundingClientRect(), t = document.createElement('span')
        t.className = 'mkq-tag'; t.textContent = 'New'; t.setAttribute('data-mine', '1'); document.body.appendChild(t)
        t.style.left = (b.right + 6) + 'px'; t.style.top = (b.top + (b.height - t.offsetHeight) / 2) + 'px'
      })
    }
    await shot(p, sz, `f3-${look}-list`, '[data-testid="win-oilday"]')
    if (key === 'p') { await untag(p); await full(p, sz, `f3-${look}-screen`) }
    await ctx.close()
  }
  await b.close()
}
for (const k of ['d', 'p']) await run(k)
writeFileSync(`${OUT}/manifest-f3.json`, JSON.stringify(manifest, null, 2))
log('done')
