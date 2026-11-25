// draw-e2 - the squadron number's two fades (his D2620, D2628 C10). A short film of the REAL app: Saber, on 142, picks
// 150 (the desktop's top-bar list; on a phone ☰ → the squadron list); once 150's page has drawn, the number at the top
// left (the mark's own number, `.mark .k`) dims to about a third and back, twice, about one second in all - a CSS
// animation injected on that number alone (no ring, glow, size or colour change). With less motion on (the browser's
// "reduce" setting): no fade - the number bright white about a second, then back to its own grey.
// Recorded by Playwright's video, cut by ffmpeg to an H.264 mp4 (plays on an iPhone), about 4 s from just before the
// press: `e2-d.mp4` (cropped to the top bar's left half), `e2-p.mp4`, `e2-d-rm.mp4`, `e2-p-rm.mp4`; and three stills of the
// desktop film: `e2-d-1-before.png`, `e2-d-2-mid-dim.png` (the fade held at its first low point), `e2-d-3-after.png`.
//   node raptor-port/scripts/handpass/n176/draw-e2.mjs        (ONLY=d,p,d-rm,p-rm)
import { execFileSync } from 'node:child_process'
import { mkdirSync, readdirSync, rmSync, renameSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createRequire } from 'node:module'
import { FACT, note, signIn, wait, reachPick, barSq, pageOn, world, TMP, DRAWN, want } from './draw-lib.mjs'
const HERE = dirname(fileURLToPath(import.meta.url))
const { chromium, webkit } = createRequire(resolve(HERE, '../../../package.json'))('playwright')
const SZ = { d: { w: 1536, h: 864, desk: true }, p: { w: 402, h: 874, desk: false } }
const NUM = '.topbar .mark .k'
const CSS = `
@keyframes n176fade { 0%,50%,100% { opacity: 1 } 25%,75% { opacity: .33 } }
html body .topbar .mark .k.n176fade { animation: n176fade 1s ease-in-out 1 !important }
html body .topbar .mark .k.n176white { color: #fff !important }`
async function film(sz, rm) {
  const S = SZ[sz], key = `e2-${sz}${rm ? '-rm' : ''}`
  const vdir = resolve(TMP, 'video-' + key); rmSync(vdir, { recursive: true, force: true }); mkdirSync(vdir, { recursive: true })
  const browser = await (S.desk ? chromium : webkit).launch()
  const ctx = await browser.newContext({ storageState: await world(), viewport: { width: S.w, height: S.h }, deviceScaleFactor: 2, ...(S.desk ? {} : { isMobile: true, hasTouch: true }), reducedMotion: rm ? 'reduce' : 'no-preference', recordVideo: { dir: vdir, size: { width: S.w * 2, height: S.h * 2 } } })
  const page = await ctx.newPage(); const t0 = Date.now()
  const s = { ctx, page, desk: S.desk, W: S.w, H: S.h, sz }
  let tPress = 0, tDrawn = 0
  try {
    await signIn(s, 'ad', 'a'); await page.addStyleTag({ content: CSS }); await wait(s, 1500)
    FACT(`${key}.before`, { squadron: await barSq(s), page: await pageOn(s), number: await page.evaluate(n => { const e = [...document.querySelectorAll(n)].find(x => x.getBoundingClientRect().width > 0); return { words: e.textContent, colour: getComputedStyle(e).color } }, NUM), reducedMotion: await page.evaluate(() => matchMedia('(prefers-reduced-motion: reduce)').matches) })
    if (sz === 'd' && !rm) await page.screenshot({ path: `${DRAWN}/e2-d-1-before.png`, clip: { x: 0, y: 0, width: 768, height: 64 } })
    /* THE TRIGGER, inside the page: the moment the number reads 150, two frames later (the new page drawn), the fade (or,
       with less motion, the white) starts on the number - as the build would start it, not when the script looks */
    await page.evaluate(([n, rm]) => {
      const go = () => {
        const e = [...document.querySelectorAll(n)].find(x => x.getBoundingClientRect().width > 0)
        if (!e || e.textContent !== '150' || window.__n176t) return
        window.__n176t = -1
        requestAnimationFrame(() => requestAnimationFrame(() => {
          window.__n176t = Date.now()
          window.__n176mid = new Promise(res => setTimeout(() => res({ opacity: getComputedStyle(e).opacity, colour: getComputedStyle(e).color }), rm ? 400 : 250))
          if (rm) { e.classList.add('n176white'); setTimeout(() => e.classList.remove('n176white'), 1000) } else { e.classList.remove('n176fade'); void e.offsetWidth; e.classList.add('n176fade') }
        }))
      }
      new MutationObserver(go).observe(document.body, { subtree: true, childList: true, characterData: true })
    }, [NUM, rm])
    tPress = Date.now()
    const r = await reachPick(s, 150, S.desk ? 'bar' : 'menu')
    for (let i = 0; i < 60 && !((await page.evaluate(() => window.__n176t)) > 0); i++) await wait(s, 50)
    tDrawn = await page.evaluate(() => window.__n176t)
    const mid = await page.evaluate(() => window.__n176mid)
    await wait(s, 2400)
    const after = await page.evaluate(n => { const e = [...document.querySelectorAll(n)].find(x => x.getBoundingClientRect().width > 0); return { words: e.textContent, opacity: getComputedStyle(e).opacity, colour: getComputedStyle(e).color } }, NUM)
    FACT(`${key}.pick`, { pressedVia: r.control, pressed: r.pressed, squadronNow: await barSq(s), drawnAfterMs: tDrawn - tPress, at250or400ms: mid, after })
    if (sz === 'd' && !rm) {
      await page.screenshot({ path: `${DRAWN}/e2-d-3-after.png`, clip: { x: 0, y: 0, width: 768, height: 64 } })
      /* the mid-dim still: the same animation held at its first low point (a quarter of the way) */
      await page.evaluate(n => { const e = [...document.querySelectorAll(n)].find(x => x.getBoundingClientRect().width > 0); e.classList.remove('n176fade'); void e.offsetWidth; e.style.setProperty('animation', 'n176fade 1s ease-in-out -0.25s 1 paused', 'important') }, NUM)
      await wait(s, 200)
      FACT('e2-d-2-mid-dim', await page.evaluate(n => getComputedStyle([...document.querySelectorAll(n)].find(x => x.getBoundingClientRect().width > 0)).opacity, NUM))
      await page.screenshot({ path: `${DRAWN}/e2-d-2-mid-dim.png`, clip: { x: 0, y: 0, width: 768, height: 64 } })
      await page.evaluate(n => [...document.querySelectorAll(n)].forEach(e => e.style.removeProperty('animation')), NUM)
      note('picture', 'e2-d-1-before.png, e2-d-2-mid-dim.png, e2-d-3-after.png')
    }
  } finally { await ctx.close(); await browser.close() }
  const webm = readdirSync(vdir).find(f => f.endsWith('.webm')); const src = resolve(vdir, webm)
  /* 2 s before 150's page has drawn - the row's own tap in sight (the script's presses take longer than a person's) - so
     the fade lands at about 2 s and the film runs on a second after it */
  const start = Math.max(0, (tDrawn - t0) / 1000 - 2.0)
  const crop = S.desk ? ['-vf', 'crop=1536:128:0:0,format=yuv420p'] : ['-vf', 'scale=804:1748,format=yuv420p']
  const out = `${DRAWN}/${key}.mp4`
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-ss', start.toFixed(2), '-i', src, '-t', '4', ...crop, '-c:v', 'libx264', '-profile:v', 'high', '-preset', 'slow', '-crf', '18', '-r', '30', '-movflags', '+faststart', '-an', out])
  const probe = execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'stream=codec_name,width,height,pix_fmt:format=duration', '-of', 'compact', out]).toString().trim().replace(/\r?\n/g, ' | ')
  FACT(`${key}.film`, { file: `${key}.mp4`, cutFrom: start.toFixed(2) + ' s', probe })
  /* a frame each 0.25 s, for the drawer's own look (not in the repo) */
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', out, '-vf', 'fps=4', resolve(vdir, 'f%02d.png')])
}
for (const k of ['d', 'p', 'd-rm', 'p-rm']) if (want(k)) {
  try { await film(k[0], k.endsWith('-rm')) } catch (e) { FACT(`e2-${k}.error`, String(e).split('\n')[0].slice(0, 300)); process.exitCode = 1 }
}
