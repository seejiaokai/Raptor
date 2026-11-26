// draw-s1-fade - section 1, ledger row 1.18: on a phone, a bell line that changes the squadron in view - the number's two
// fades wait while the number is covered and play once it is in sight (his D2642, D2652 N8 a: "the fade waits wherever the
// number is covered"). A film of the REAL app (WebKit, 402×874, 2x), as round 6's m6-p-fade (n176 draw-r6-misc-fade.mjs,
// whose CSS and film steps are copied here, read only): Hunter (142's admin, Plan of 149) has 149 picked; his bell holds a
// line about his own 142 input (Tue 8 Dec, filed for him by Saber - draw-s1-notes' bell state). He taps the bell, then
// the line: the app brings 142 into view and opens that input. WHAT COVERS THE NUMBER is read from the screen, not assumed
// (FACT coveredAtChange): the trigger, inside the page, marks the fade owed when the number turns to 142 while something
// lies over it, and plays it the moment nothing does - so the film shows the truth of where it waits.
// What is new - the fade's wait and play - is ringed teal (2px dashed #0D9488, 4px clear) from the moment it plays. A white
// dot shows each tap for a quarter second (a film aid, not the app).
// Out: drawn/s1-fade-p-film.mp4 (H.264), s1-fade-p-poster.png, s1-fade-p-NN.png (12 a second, the top 402×320 at 2x).
//   node raptor-port/scripts/handpass/n191/draw-s1-fade.mjs
import { execFileSync } from 'node:child_process'
import { mkdirSync, readdirSync, rmSync, existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createRequire } from 'node:module'
import { FACT, note, signIn, wait, barSq, DRAWN, boxOf, reachPick, TMP1, windowsNow } from './draw-s1-lib.mjs'
const HERE = dirname(fileURLToPath(import.meta.url))
const { webkit } = createRequire(resolve(HERE, '../../../package.json'))('playwright')
const STATE = resolve(TMP1, 'state-bell2.json')
if (!existsSync(STATE)) throw new Error('no bell state: run draw-s1-notes.mjs (bellline-p) first')
const NUM = '.topbar .mark .k'
const CSS = `
@keyframes s1fade { 0%,50%,100% { opacity: 1 } 25%,75% { opacity: .33 } }
html body .topbar .mark .k.s1fade { animation: s1fade 1s ease-in-out 1 !important }
.s1tap { position: fixed; width: 34px; height: 34px; margin: -17px 0 0 -17px; border-radius: 50%; background: rgba(255,255,255,.55); box-shadow: 0 0 0 2px rgba(255,255,255,.35); z-index: 2147483647; pointer-events: none }
.s1ring { position: fixed; outline: 2px dashed #0D9488; z-index: 2147483646; pointer-events: none }`
const W = 402, H = 874, key = 's1-fade-p'
const vdir = resolve(TMP1, 'video-' + key); rmSync(vdir, { recursive: true, force: true }); mkdirSync(vdir, { recursive: true })
const browser = await webkit.launch()
const ctx = await browser.newContext({ storageState: STATE, viewport: { width: W, height: H }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, recordVideo: { dir: vdir, size: { width: W * 2, height: H * 2 } } })
const page = await ctx.newPage(); const t0 = Date.now()
const s = { ctx, page, desk: false, W, H, sz: 'p' }
const T = {}
const tap = async (x, y, name) => {
  await page.evaluate(([x, y]) => { const d = document.createElement('div'); d.className = 's1tap'; d.style.left = x + 'px'; d.style.top = y + 'px'; document.body.appendChild(d); setTimeout(() => d.remove(), 260) }, [x, y])
  await wait(s, 120); T[name] = (Date.now() - t0) / 1000
  await page.touchscreen.tap(x, y)
}
const mid = async sel => { const b = await boxOf(s, sel); if (!b) throw new Error('not drawn: ' + sel); return [b.x + b.w / 2, b.y + b.h / 2] }
try {
  await signIn(s, 'ad2', 'a2'); await reachPick(s, 149, 'menu'); await wait(s, 900)
  await page.addStyleTag({ content: CSS }); await wait(s, 600)
  FACT(`${key}.before`, { squadron: await barSq(s) })
  await page.evaluate(n => {
    window.__s1 = { owed: false, t: 0 }
    const num = () => [...document.querySelectorAll(n)].find(x => x.getBoundingClientRect().width > 0)
    const covered = e => { const r = e.getBoundingClientRect(); const h = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return !(h && (h === e || e.contains(h) || h.contains(e))) ? (h ? (h.id ? '#' + h.id : h.tagName.toLowerCase()) + '.' + String(h.className).split(/\s+/).slice(0, 2).join('.') : 'nothing') : false }
    const play = () => {
      const e = num(); window.__s1.t = Date.now(); window.__s1.coveredAtPlay = covered(e)
      const r = e.getBoundingClientRect(); const ring = document.createElement('div'); ring.className = 's1ring'
      Object.assign(ring.style, { left: (r.left - 4) + 'px', top: (r.top - 4) + 'px', width: (r.width + 8) + 'px', height: (r.height + 8) + 'px' }); document.body.appendChild(ring)
      e.classList.remove('s1fade'); void e.offsetWidth; e.classList.add('s1fade')
    }
    const check = () => {
      const e = num(); if (!e) return
      if (!window.__s1.owed && !window.__s1.t && e.textContent === '142') { window.__s1.owed = true; window.__s1.coveredAtChange = covered(e); window.__s1.changedAt = Date.now() }
      if (window.__s1.owed && !covered(e)) { window.__s1.owed = false; window.__s1.t = -1; window.__s1.uncoveredAt = Date.now(); requestAnimationFrame(() => requestAnimationFrame(play)) }
    }
    new MutationObserver(check).observe(document.body, { subtree: true, childList: true, characterData: true, attributes: true })
    setInterval(check, 50)
  }, NUM)
  T.start = (Date.now() - t0) / 1000
  await wait(s, 700)
  await tap(...(await mid('#notifyBell, .bellbtn')), 'bell'); await wait(s, 1100)
  await page.evaluate(() => [...document.querySelectorAll('[data-testid="bell-list"] .bl-line')].find(e => /8 Dec/.test(e.textContent))?.setAttribute('data-s1l', '1'))
  await tap(...(await mid('[data-s1l]')), 'line'); await wait(s, 1600)
  const afterLine = await page.evaluate(() => ({ owed: window.__s1.owed, played: !!window.__s1.t, coveredAtChange: window.__s1.coveredAtChange, listOpen: !!document.querySelector('[data-testid="bell-list"]') }))
  FACT(`${key}.afterLine`, { ...afterLine, squadron: await barSq(s), windows: (await windowsNow(s)).map(w => w.what) })
  /* if something still lies over the number (a window the line opened), it is closed by its own ✕, as he would */
  if (afterLine.owed) {
    const x = await page.evaluate(() => { const b = [...document.querySelectorAll('.floatwin .win-x, .bidsheet .x, [aria-label="Close"]')].find(e => e.getBoundingClientRect().width > 0); if (b) { b.setAttribute('data-s1x', '1'); return true } return false })
    if (x) { await wait(s, 600); await tap(...(await mid('[data-s1x]')), 'close') }
    await wait(s, 2400)
  } else await wait(s, 1600)
  const r = await page.evaluate(() => ({ played: window.__s1.t > 0, playedMsAfterChange: window.__s1.t > 0 ? window.__s1.t - window.__s1.changedAt : null, playedMsAfterUncovered: window.__s1.t > 0 ? window.__s1.t - window.__s1.uncoveredAt : null, coveredAtPlay: window.__s1.coveredAtPlay, rings: document.querySelectorAll('.s1ring').length }))
  FACT(`${key}.played`, { ...r, squadron: await barSq(s), ring: await boxOf(s, '.s1ring'), windows: (await windowsNow(s)).map(w => w.what) })
  T.end = (Date.now() - t0) / 1000
} catch (e) { FACT(`${key}.error`, String(e).split('\n')[0].slice(0, 300)); process.exitCode = 1 } finally { await ctx.close(); await browser.close() }
const webm = readdirSync(vdir).find(f => f.endsWith('.webm')); const src = resolve(vdir, webm)
const start = Math.max(0, T.bell - 0.8), dur = (T.end - 0.1) - start
const out = `${DRAWN}/${key}-film.mp4`
execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-ss', start.toFixed(2), '-i', src, '-t', dur.toFixed(2), '-vf', 'scale=804:1748,format=yuv420p', '-c:v', 'libx264', '-profile:v', 'high', '-preset', 'slow', '-crf', '18', '-r', '30', '-movflags', '+faststart', '-an', out])
FACT(`${key}.film`, { file: `${key}-film.mp4`, taps: Object.fromEntries(Object.entries(T).map(([k, v]) => [k, +(v - start).toFixed(2)])) })
for (const f of readdirSync(DRAWN).filter(f => f.startsWith(key + '-') && /-\d\d\.png$/.test(f))) rmSync(resolve(DRAWN, f))
execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', out, '-vf', 'fps=12,crop=804:640:0:0', resolve(DRAWN, `${key}-%02d.png`)])
const stills = readdirSync(DRAWN).filter(f => f.startsWith(key + '-') && /-\d\d\.png$/.test(f)).sort()
const posterAt = ((T.close ?? T.line) - start) + 0.45
execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-ss', posterAt.toFixed(2), '-i', out, '-frames:v', '1', `${DRAWN}/${key}-poster.png`])
FACT(`${key}.stills`, { count: stills.length, poster: `${key}-poster.png at ${posterAt.toFixed(2)} s` })
note('picture', `${key}-film.mp4, ${key}-poster.png, ${stills.length} stills`)
