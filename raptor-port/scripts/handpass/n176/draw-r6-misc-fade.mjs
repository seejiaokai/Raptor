// draw-r6-misc-fade - round 6, D2 on a phone (his D2642): the squadron number's two fades WAIT until the ☰ menu has closed.
// A film of the REAL app on a phone (WebKit, 402×874, 2x): Saber on 142 taps ☰, taps the menu's TALON drop-down, taps 150
// (the list closes, the menu STAYS open - D2384 - its pages changed at once), then taps the shade beside the menu; the menu
// closes and only then - two frames later, the number in sight - the number at the top left dims to about a third and back,
// twice, about one second (round 5's fade, draw-e2's CSS). With less motion on (the browser's "reduce" setting): no fade,
// the number bright white about a second, then its own grey. The trigger runs inside the page, as the build would run it:
// the number turning to 150 while the menu is open marks the fade owed; the menu's closing plays it.
// What is new since round 5 - the fade's wait - is marked by the violet dashed ring (2px #8B5CF6, 4px clear) round the
// number from the moment the menu has closed. A white dot shows each tap for a quarter second (a film aid, not the app).
// Out: drawn/m6-p-fade-film.mp4 (H.264, plays on an iPhone), m6-p-fade-poster.png (the whole screen at the first dim),
//      m6-p-fade-NN.png (12 a second, the top-left corner of the screen, 402×320 at 2x); the same with -lm for less motion.
//   node raptor-port/scripts/handpass/n176/draw-r6-misc-fade.mjs        (ONLY=fade,lm)
import { execFileSync } from 'node:child_process'
import { mkdirSync, readdirSync, rmSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createRequire } from 'node:module'
import { FACT, note, signIn, wait, barSq, world, TMP, DRAWN, want, boxOf } from './draw-lib.mjs'
const HERE = dirname(fileURLToPath(import.meta.url))
const { webkit } = createRequire(resolve(HERE, '../../../package.json'))('playwright')
const NUM = '.topbar .mark .k'
const CSS = `
@keyframes m6fade { 0%,50%,100% { opacity: 1 } 25%,75% { opacity: .33 } }
html body .topbar .mark .k.m6fade { animation: m6fade 1s ease-in-out 1 !important }
html body .topbar .mark .k.m6white { color: #fff !important }
.m6tap { position: fixed; width: 34px; height: 34px; margin: -17px 0 0 -17px; border-radius: 50%; background: rgba(255,255,255,.55); box-shadow: 0 0 0 2px rgba(255,255,255,.35); z-index: 2147483647; pointer-events: none }
.m6ring { position: fixed; outline: 2px dashed #8B5CF6; z-index: 2147483646; pointer-events: none }`
const W = 402, H = 874
async function film(rm) {
  const key = rm ? 'm6-p-fade-lm' : 'm6-p-fade'
  const vdir = resolve(TMP, 'video-' + key); rmSync(vdir, { recursive: true, force: true }); mkdirSync(vdir, { recursive: true })
  const browser = await webkit.launch()
  const ctx = await browser.newContext({ storageState: await world(), viewport: { width: W, height: H }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, reducedMotion: rm ? 'reduce' : 'no-preference', recordVideo: { dir: vdir, size: { width: W * 2, height: H * 2 } } })
  const page = await ctx.newPage(); const t0 = Date.now()
  const s = { ctx, page, desk: false, W, H, sz: 'p' }
  const T = {}
  const tap = async (x, y, name) => {
    await page.evaluate(([x, y]) => { const d = document.createElement('div'); d.className = 'm6tap'; d.style.left = x + 'px'; d.style.top = y + 'px'; document.body.appendChild(d); setTimeout(() => d.remove(), 260) }, [x, y])
    await wait(s, 120); T[name] = (Date.now() - t0) / 1000
    await page.touchscreen.tap(x, y)
  }
  const mid = async sel => { const b = await boxOf(s, sel); if (!b) throw new Error('not drawn: ' + sel); return [b.x + b.w / 2, b.y + b.h / 2] }
  try {
    await signIn(s, 'ad', 'a'); await page.addStyleTag({ content: CSS }); await wait(s, 1200)
    FACT(`${key}.before`, { squadron: await barSq(s), reducedMotion: await page.evaluate(() => matchMedia('(prefers-reduced-motion: reduce)').matches), number: await page.evaluate(n => { const e = [...document.querySelectorAll(n)].find(x => x.getBoundingClientRect().width > 0); return { words: e.textContent, colour: getComputedStyle(e).color } }, NUM) })
    /* THE TRIGGER (D2642), inside the page: the number turning to 150 marks the fade owed; while the menu (#drawer.open) is
       up it waits; the frame the menu is gone, two frames later, it plays - and the ring is put round the number */
    await page.evaluate(([n, rm]) => {
      window.__m6 = { owed: false, t: 0, menuOpenAtChange: null, coveredAtChange: null }
      const num = () => [...document.querySelectorAll(n)].find(x => x.getBoundingClientRect().width > 0)
      const menuUp = () => !!document.querySelector('#drawer')?.classList.contains('open')
      const covered = e => { const r = e.getBoundingClientRect(); const h = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return !(h && (h === e || e.contains(h) || h.contains(e))) }
      const play = () => {
        const e = num(); window.__m6.t = Date.now(); window.__m6.coveredAtPlay = covered(e)
        const r = e.getBoundingClientRect(); const ring = document.createElement('div'); ring.className = 'm6ring'
        Object.assign(ring.style, { left: (r.left - 4) + 'px', top: (r.top - 4) + 'px', width: (r.width + 8) + 'px', height: (r.height + 8) + 'px' }); document.body.appendChild(ring)
        window.__m6.mid = new Promise(res => setTimeout(() => res({ opacity: getComputedStyle(e).opacity, colour: getComputedStyle(e).color }), rm ? 400 : 250))
        if (rm) { e.classList.add('m6white'); setTimeout(() => e.classList.remove('m6white'), 1000) } else { e.classList.remove('m6fade'); void e.offsetWidth; e.classList.add('m6fade') }
      }
      const check = () => {
        const e = num(); if (!e) return
        if (!window.__m6.owed && !window.__m6.t && e.textContent === '150') { window.__m6.owed = true; window.__m6.menuOpenAtChange = menuUp(); window.__m6.coveredAtChange = covered(e); window.__m6.changedAt = Date.now() }
        if (window.__m6.owed && !menuUp()) { window.__m6.owed = false; requestAnimationFrame(() => requestAnimationFrame(play)) }
      }
      new MutationObserver(check).observe(document.body, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ['class'] })
    }, [NUM, rm])
    T.start = (Date.now() - t0) / 1000
    await wait(s, 700)
    await tap(...(await mid('#burger')), 'menu'); await wait(s, 900)
    await tap(...(await mid('#drawerSqnBtn')), 'list'); await wait(s, 900)
    await page.evaluate(() => [...document.querySelectorAll('#drawerSqnList .sqm-row')].find(e => e.querySelector('.sqm-num')?.textContent.trim() === '150').setAttribute('data-m6', '1'))
    await tap(...(await mid('[data-m6]')), 'pick'); await wait(s, 1300)
    const afterPick = await page.evaluate(() => ({ menuOpen: document.querySelector('#drawer').classList.contains('open'), owed: window.__m6.owed, played: !!window.__m6.t, menuOpenAtChange: window.__m6.menuOpenAtChange, numberCoveredAtChange: window.__m6.coveredAtChange }))
    FACT(`${key}.afterPick`, { ...afterPick, squadron: await barSq(s) })
    await tap(380, 230, 'shade'); await wait(s, 2600)
    const m6 = await page.evaluate(async () => ({ playedMsAfterChange: window.__m6.t - window.__m6.changedAt, numberCoveredAtPlay: window.__m6.coveredAtPlay, at250or400ms: await window.__m6.mid, menuOpen: document.querySelector('#drawer').classList.contains('open') }))
    T.played = T.shade + 0.05
    const after = await page.evaluate(n => { const e = [...document.querySelectorAll(n)].find(x => x.getBoundingClientRect().width > 0); return { words: e.textContent, opacity: getComputedStyle(e).opacity, colour: getComputedStyle(e).color } }, NUM)
    FACT(`${key}.closed`, { ...m6, after, ring: await boxOf(s, '.m6ring'), numberBox: await boxOf(s, NUM) })
    T.end = (Date.now() - t0) / 1000
  } finally { await ctx.close(); await browser.close() }
  const webm = readdirSync(vdir).find(f => f.endsWith('.webm')); const src = resolve(vdir, webm)
  const start = Math.max(0, T.menu - 0.7), dur = Math.min(T.end - 0.2, T.shade + 2.4) - start
  const out = `${DRAWN}/${key}-film.mp4`
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-ss', start.toFixed(2), '-i', src, '-t', dur.toFixed(2), '-vf', 'scale=804:1748,format=yuv420p', '-c:v', 'libx264', '-profile:v', 'high', '-preset', 'slow', '-crf', '18', '-r', '30', '-movflags', '+faststart', '-an', out])
  const probe = execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'stream=codec_name,width,height,pix_fmt:format=duration', '-of', 'compact', out]).toString().trim().replace(/\r?\n/g, ' | ')
  FACT(`${key}.film`, { file: `${key}-film.mp4`, cutFrom: start.toFixed(2) + ' s', taps: Object.fromEntries(Object.entries(T).map(([k, v]) => [k, +(v - start).toFixed(2)])), probe })
  /* the stills: 12 a second, the top-left corner (402×320 at 2x) - where the ☰, the menu's mark and the number are */
  for (const f of readdirSync(DRAWN).filter(f => f.startsWith(key + '-') && /-\d\d\.png$/.test(f))) rmSync(resolve(DRAWN, f))
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', out, '-vf', 'fps=12,crop=804:640:0:0', resolve(DRAWN, `${key}-%02d.png`)])
  const stills = readdirSync(DRAWN).filter(f => f.startsWith(key + '-') && /-\d\d\.png$/.test(f)).sort()
  /* the poster: the whole screen just after the menu has closed - a third of a second in (the fade's first low point, or
     the white) */
  const posterAt = (T.shade - start) + (rm ? 0.45 : 0.42)
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-ss', posterAt.toFixed(2), '-i', out, '-frames:v', '1', `${DRAWN}/${key}-poster.png`])
  FACT(`${key}.stills`, { count: stills.length, first: stills[0], last: stills[stills.length - 1], shadeTapStill: Math.round((T.shade - start) * 12) + 1, poster: `${key}-poster.png at ${posterAt.toFixed(2)} s` })
  note('picture', `${key}-film.mp4, ${key}-poster.png, ${stills.length} stills`)
}
for (const [k, rm] of [['fade', false], ['lm', true]]) if (want(k)) {
  try { await film(rm) } catch (e) { FACT(`m6-p-fade${rm ? '-lm' : ''}.error`, String(e).split('\n')[0].slice(0, 300)); process.exitCode = 1 }
}
