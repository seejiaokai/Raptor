// draw-s2-film - section 2, ledger row 2.3: THE FILM of a jump pressed on Admin → Users (D2652 N13 b - "the heading reached
// white about a second", a new mark, ruled; the film is named in D2652's "owed before the build"). Hunter on 142 (sixty
// people), round 6's page (./draw-s2-lib.mjs `build`, the jumps held in reach by `pin`); "Outgoing" is pressed.
// Drawn frame by frame on the REAL app at 4700 (30 a second), then joined by ffmpeg:
//   0.0 s  the page at its top, "People" lit            0.5 s  the press on "Outgoing" (a pale dot - the film's own mark
//   0.6 s  "Outgoing" lit; the page runs to the heading (0.6 s, easing out)      for the finger, not the app's)
//   1.2 s  the heading reached: its words stand white for 1 s, then go back to grey over 0.3 s
// The run's length (0.6 s) and the fade back (0.3 s) are the drawer's drafts - only "white about a second" is ruled.
//   s2-03-d-jump.mp4   s2-03-p-jump.mp4      (+ s2-03-{d,p}-jump-reached.png: the frame with the heading white)
//   node raptor-port/scripts/handpass/n191/draw-s2-film.mjs   (SZ=d,p)
import { mkdirSync, rmSync } from 'node:fs'
import { resolve } from 'node:path'
import { execFileSync } from 'node:child_process'
import { run, W6, WN, FACT, wait, box, closeAll, TMP, DRAWN, want, load, S, man, subOf, build, pin, pinnedFoot, start, sqFolds, J, R6 } from './draw-s2-lib.mjs'
const FPS = 30, T = { press: 15, lit: 18, runFrom: 20, runTo: 38, whiteTo: 68, fadeTo: 77, end: 96 }
const ease = t => 1 - Math.pow(1 - t, 3)
try {
  await load()
  for (const sz of ['d', 'p']) if (want('03', sz)) await run(`s2-03-${sz}-jump`, sz, async s => {
    const k = `s2-03-${sz}-jump`, dir = resolve(TMP, k); rmSync(dir, { recursive: true, force: true }); mkdirSync(dir, { recursive: true })
    FACT(`${k}.add`, await start(s, 'hunter'))
    const cinch = man('142', 'Cinch'), mako = man('150', 'Mako'), kestrel = man('149', 'Kestrel')
    const b = await build(s, { navName: WN.navName, tags: [[cinch.pid, W6.postingOutTo('14 Dec', '149')]], jumps: J('people')(['people', 'out', 'in', 'other'], [S.COUNT['142'], 1, 1, 1]),
      groups: [{ id: 'out', label: WN.open(W6.outgoing(1)), rows: [{ key: 'cinch', cs: 'Cinch', sub: cinch.seatCat, tag: W6.postingOutTo('14 Dec', '149') }] }, { id: 'in', label: WN.open(W6.incoming(1)), rows: [{ key: 'mako', cs: 'Mako', chip: '150', sub: mako.seatCat, tag: W6.postingIn('4 Jan') }] }, { id: 'other', label: WN.open(W6.fromOther(1)), rows: [{ key: 'kestrel', cs: 'Kestrel', chip: '149', sub: subOf(kestrel, '142') }] }],
      sqFolds: sqFolds(149, 150) })
    const rest = s.desk ? null : (await box(s, '#s2bar')).y   /* a phone: where the search row and jumps stand before the page moves */
    FACT(`${k}.pinned`, await pin(s))
    /* a phone: the pinned rows ride up with the page from where they stand until they meet the top bar, then stay */
    const stick = y => s.page.evaluate(([rest, y]) => { if (rest == null) return; const e = document.querySelector('#s2bar'), top = Math.round(document.querySelector('.topbar').getBoundingClientRect().bottom), at = Math.max(top, rest - 10 - y); e.style.top = at + 'px'; e.style.borderBottom = at === top ? '1px solid var(--edge)' : '1px solid transparent' }, [rest, y])
    await stick(0)
    const under = (await pinnedFoot(s)) + (s.desk ? 40 : 14)
    const plan = await s.page.evaluate(under => { const h = document.querySelector('#s2out-h'); const most = document.documentElement.scrollHeight - innerHeight; const to = Math.min(most, Math.round(h.getBoundingClientRect().top + scrollY - under)); const c = getComputedStyle(h).color.match(/[0-9.]+/g).map(Number); const probe = document.createElement('span'); probe.style.color = 'var(--ink)'; document.body.appendChild(probe); const w = getComputedStyle(probe).color.match(/[0-9.]+/g).map(Number); probe.remove(); return { to, grey: c.slice(0, 3), white: w.slice(0, 3) } }, under)
    const jb = await box(s, '#s2jump-out')
    FACT(`${k}.plan`, { jumps: b.jumps.map(j => j.words), runsTo: plan.to, headingGrey: plan.grey, headingWhite: plan.white, pressedAt: jb, frames: T.end, fps: FPS, seconds: T.end / FPS })
    /* the film's own marks: the dot of the press; the two looks of a jump (lit / plain) read off the built jumps */
    await s.page.evaluate(jb => { const d = document.createElement('div'); d.id = 's2dot'; Object.assign(d.style, { position: 'fixed', left: (jb.x + jb.w / 2 - 15) + 'px', top: (jb.y + jb.h / 2 - 15) + 'px', width: '30px', height: '30px', borderRadius: '50%', background: 'rgba(255,255,255,.34)', border: '1px solid rgba(255,255,255,.6)', zIndex: 2147483647, pointerEvents: 'none', display: 'none' }); document.body.appendChild(d)
      const lit = document.querySelector('#s2jump-people'), plain = document.querySelector('#s2jump-out'); window.__look = { lit: { css: lit.style.cssText, cls: lit.className, kid: lit.lastElementChild.style.cssText }, plain: { css: plain.style.cssText, cls: plain.className, kid: plain.lastElementChild.style.cssText } } }, jb)
    const frame = (i) => s.page.evaluate(({ i, T, plan, e }) => {
      const set = (id, look) => { const b = document.querySelector('#s2jump-' + id); b.style.cssText = window.__look[look].css; b.className = window.__look[look].cls; b.lastElementChild.style.cssText = window.__look[look].kid }
      document.querySelector('#s2dot').style.display = i >= T.press && i < T.runFrom ? 'block' : 'none'
      set('people', i >= T.lit ? 'plain' : 'lit'); set('out', i >= T.lit ? 'lit' : 'plain')
      scrollTo(0, i < T.runFrom ? 0 : i >= T.runTo ? plan.to : Math.round(plan.to * e))
      const h = document.querySelector('#s2out-h'); let k = i < T.runTo ? 0 : i <= T.whiteTo ? 1 : i >= T.fadeTo ? 0 : 1 - (i - T.whiteTo) / (T.fadeTo - T.whiteTo)
      h.style.color = `rgb(${plan.grey.map((g, n) => Math.round(g + (plan.white[n] - g) * k)).join(',')})`
    }, { i, T, plan, e: i > T.runFrom && i < T.runTo ? ease((i - T.runFrom) / (T.runTo - T.runFrom)) : 0 })
    if (s.desk) await s.page.mouse.move(1, 1).catch(() => {})
    for (let i = 0; i < T.end; i++) { await frame(i); await stick(await s.page.evaluate(() => scrollY)); await s.page.screenshot({ path: `${dir}/f${String(i).padStart(3, '0')}.png`, scale: 'css' }); if (i === T.runTo + 6) await s.page.screenshot({ path: `${DRAWN}/${k}-reached.png` }) }
    const out = `${DRAWN}/${k}.mp4`
    execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-framerate', String(FPS), '-i', `${dir}/f%03d.png`, '-vf', 'pad=ceil(iw/2)*2:ceil(ih/2)*2', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '18', '-movflags', '+faststart', out])
    FACT(`${k}.film`, { file: `${k}.mp4`, still: `${k}-reached.png`, frames: T.end, seconds: Math.round(T.end / FPS * 10) / 10, headingWhiteFor: `${(T.whiteTo - T.runTo) / FPS} s`, runTakes: `${(T.runTo - T.runFrom) / FPS} s` })
  }, { state: R6 })
} finally { await closeAll() }
