// D1873 re-walk of what round 2 and the host's follow-up touched (host, chat 16, 8 Nov 26).
// 1. at rest, before (b0968d50d) twice and after (dist): the Leave War's OIL tab and Balances, the sign-in screen and the
//    screen after asking for access — 1536 Chromium @1.25 and 402 WebKit @3, pixel for pixel (raw pictures to the
//    scratch folder given, the record and any difference's pictures to the evidence folder);
// 2. the "Not saved" band's FIRST frame: in the animation frame right after the bar takes its band (before the browser
//    paints it), is the space reserved above the page already the bar's new height? desktop and phone, the after build;
// 3. a phone on its side (874x402 WebKit): every page, scrolled, turned upright and back, page errors counted.
// Usage (under the checks lock, after npm run build): node scripts/handpass/topbar1108-r2-rewalk.mjs <scratchDir> [beforeDist]
// Never write a walk's scripts or evidence under test-results/: every Playwright run empties it.
import { open, tab, press, chromium, webkit, LAUNCH, serveDist, ORIGIN } from './topbar1108-lib.mjs'
import { pictureDiff } from '../drawcheck/lib.mjs'
import { mkdirSync, writeFileSync, copyFileSync } from 'node:fs'
const RAW = process.argv[2]; if (!RAW) throw new Error('give a scratch folder for the raw pictures')
const BEFORE = process.argv[3] || 'C:/Users/User/AppData/Local/Temp/raptor-topbar-r2-ffbf07/raptor-port/dist', AFTER = 'dist'
const out = 'docs/img/handpass/2026-11-08-lw-pin-last-frame/walk/topbar/R2'; mkdirSync(out, { recursive: true }); mkdirSync(RAW, { recursive: true })
const QUIET = '*{scroll-behavior:auto !important} *,*::before,*::after{transition:none !important;animation:none !important;caret-color:transparent !important}'
const SIZES = [['desk', 'chromium', 1536, 900, 1.25], ['phone', 'webkit', 402, 874, 3]]
const rec = { rest: {}, band: {}, sideways: {} }
const quiet = async p => { await p.addStyleTag({ content: QUIET }).catch(() => {}) }

const SCREENS = [
  ['lw-oil', { login: true }, async p => { await tab(p, 'leavewar', true); await press(p, '[data-testid="oil-tracker"]', true); await p.clock.runFor(700) }],
  ['lw-balances', { login: true }, async p => { await tab(p, 'leavewar', true); await press(p, '[data-testid="lw-tab-balances"]', true); await p.clock.runFor(700) }],
  ['signin', { login: false }, async p => { await p.waitForSelector('#loginForm'); await p.clock.runFor(1500) }],
  ['access', { login: false }, async p => {
    await p.waitForSelector('#loginForm'); await p.fill('#luser', 'newcomer1873'); await p.fill('#lpass', 'x'); await p.click('#loginForm button[type=submit]')
    await p.clock.runFor(2500)
  }],
]
// 1 — at rest
const cmp = await chromium.launch(LAUNCH)
try {
  for (const [size, engine, w, h, dsf] of SIZES) for (const [name, o, reach] of SCREENS) {
    const files = {}
    for (const tag of ['before', 'before-again', 'after']) {
      const { br, p, errs } = await open({ dist: tag === 'after' ? AFTER : BEFORE, engine, w, h, dsf, clock: true, login: o.login })
      try {
        await quiet(p); await reach(p); await p.clock.runFor(1500)
        files[tag] = `${RAW}/${tag}-${size}-${name}.png`; await p.screenshot({ path: files[tag] })
        const st = await p.evaluate(() => ({ text: document.body.innerText.slice(0, 80).replace(/\s+/g, ' '), bar: !!document.querySelector('#shell>.topbar, #guestApp>.topbar') }))
        ;(rec.rest[`${size}-${name}`] ||= {})[tag] = { st, errs: errs.slice(0, 3) }
      } finally { await br.close() }
    }
    const noise = await pictureDiff(cmp, files.before, files['before-again']), change = await pictureDiff(cmp, files.before, files.after)
    Object.assign(rec.rest[`${size}-${name}`], { noise, change })
    if (!change.same) { copyFileSync(files.before, `${out}/rest-before-${size}-${name}.png`); copyFileSync(files.after, `${out}/rest-after-${size}-${name}.png`) }
    console.log('REST', size, name, 'before~again', JSON.stringify(noise), 'before~after', JSON.stringify(change), 'screen:', rec.rest[`${size}-${name}`].after.st.text.slice(0, 50))
  }
} finally { await cmp.close() }

// 2 — the band's first frame. A watch is put on the page before it loads, so the band is caught the first time it shows,
// whether a sign-in save or the change below raises it: at each change of the bar's band, read now, in the next frame
// (before that frame is painted) and the frame after.
const WATCH = () => {
  window.__band = []; let last = null
  const read = (bar, when) => { const r = bar.getBoundingClientRect(); const sh = document.querySelector('#shell'); const sp = sh ? parseFloat(getComputedStyle(sh, '::before').height) : NaN; window.__band.push({ when, cls: bar.className.includes('save-failed'), barH: +r.height.toFixed(3), spacer: +sp.toFixed(3), v: document.documentElement.style.getPropertyValue('--topbar-h') }) }
  new MutationObserver(() => {
    const bar = document.querySelector('#shell>.topbar'); if (!bar) return
    const on = bar.className.includes('save-failed'); if (on === last) return; last = on
    read(bar, 'change'); requestAnimationFrame(() => read(bar, 'first-frame')); requestAnimationFrame(() => requestAnimationFrame(() => read(bar, 'second-frame')))
  }).observe(document, { subtree: true, childList: true, attributes: true, attributeFilter: ['class'] })
}
for (const [size, engine, w, h, dsf] of SIZES) {
  const br = engine === 'webkit' ? await webkit.launch() : await chromium.launch(LAUNCH)
  const errs = []
  try {
    const ctx = await br.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: dsf, hasTouch: w < 600 })
    await serveDist(ctx, ORIGIN, AFTER); await ctx.addInitScript(WATCH)
    const p = await ctx.newPage(); p.on('pageerror', e => errs.push('pageerror: ' + e.message))
    await p.goto(ORIGIN + '/?savefail')
    await p.fill('#luser', 'ad'); await p.fill('#lpass', 'a'); await p.click('#loginForm button[type=submit]')
    await p.waitForSelector('#vWeek .day', { state: 'attached', timeout: 20000 }); await p.waitForTimeout(800)
    await tab(p, 'editsched')
    const already = await p.evaluate(() => document.querySelector('#shell>.topbar').className.includes('save-failed'))
    // one change that saves (what the walk of 8 Nov used): duplicate the plan
    if (!already) { await press(p, '#eWeek [data-planmenu="0"]'); await press(p, '[data-plandup]'); await p.waitForTimeout(1500) }
    const frames = await p.evaluate(() => window.__band)
    const first = frames.find(f => f.cls && f.when === 'first-frame')
    // the bar with its band is 94 on the desktop, 85 on the phone (58 / 49 without): the band is up, and the space
    // reserved above the page already matches it in the first frame
    const ok = !!first && Math.abs(first.spacer - first.barH) < 0.01 && first.barH > (w < 600 ? 70 : 80)
    rec.band[size] = { ok, already, frames, errs: errs.slice(0, 3) }
    await p.screenshot({ path: `${out}/band-${size}.png`, clip: { x: 0, y: 0, width: w, height: 220 } })
    console.log('BAND', size, ok ? 'PASS' : 'FAIL', 'already up at open:', already, JSON.stringify(frames))
  } finally { await br.close() }
}

// 3 — a phone on its side, every page, scrolled, turned upright and back
{
  const { br, p, errs } = await open({ dist: AFTER, engine: 'webkit', w: 874, h: 402, dsf: 3, touch: true })
  try {
    const pages = await p.evaluate(() => [...new Set([...document.querySelectorAll('#drawerNav a[data-page], #topnav a[data-page]')].map(a => a.dataset.page))])
    for (const pg of pages) {
      try { await tab(p, pg) } catch (e) { rec.sideways[pg] = 'not reached: ' + e.message.split('\n')[0]; continue }
      await p.evaluate(() => window.scrollTo(0, 600)); await p.waitForTimeout(300)
      await p.setViewportSize({ width: 402, height: 874 }); await p.waitForTimeout(500)
      await p.setViewportSize({ width: 874, height: 402 }); await p.waitForTimeout(500)
      rec.sideways[pg] = await p.evaluate(() => { const b = document.querySelector('#shell>.topbar').getBoundingClientRect(); return { top: b.top, h: +b.height.toFixed(2), v: document.documentElement.style.getPropertyValue('--topbar-h') } })
    }
    rec.sideways.errors = errs.slice()
    await p.screenshot({ path: `${out}/sideways-last.png` })
    console.log('SIDEWAYS', JSON.stringify(rec.sideways))
  } finally { await br.close() }
}
writeFileSync(`${out}/rewalk.json`, JSON.stringify(rec, null, 2))
