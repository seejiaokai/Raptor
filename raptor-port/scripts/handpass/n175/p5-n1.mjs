// p5-n1 - P5 case N1 (the build plan's §8.3): a window left open on a page he is no longer looking at.
// Saber (master admin, home 142). Each variant in a fresh browser, every step a press:
//   myleave   Leave War → My leave opened; the Inputs tab pressed (the window out of sight); 149 picked (top-bar picker on a
//             desktop, ☰ → its squadron list on a phone); the Leave War pressed on 149; then 142 picked, the Leave War again.
//   trkmark   Tracker → an event pressed (the marking window); Inputs; pick 149; Tracker on 149; pick 142; Tracker.
//   trklayout Tracker → ☰ syllabus → Edit chart layout; Inputs; pick 149; Tracker on 149; pick 142; Tracker.
// What is read at each step: the windows drawn (and any window kept in the page but not drawn), the bar's squadron, the page.
//   node raptor-port/scripts/handpass/n175/p5-n1.mjs <d|p>      (ONLY=myleave,trkmark,trklayout)
// Pictures: p5-n1-<variant>-<d|p>-1-inputs-at-pick, -2-back-on-149, (scratch: -3-back-on-142)
import { mk, closeAll, FACT, signIn, go, wait, vis, hit, shot, scratch, reachPick, barSq, pageOn, windowsNow, bands, toastNow } from './lib.mjs'
const SZ = process.argv[2] || 'd'; const SEC = 'p5'
const ONLY = (process.env.ONLY || '').split(',').filter(Boolean)
const via = s => (s.desk ? 'bar' : 'menu')
const tid = t => `[data-testid="${t}"]`
async function trk(s) { await go(s, 'tracker'); await s.page.waitForSelector('#flowSvg .ball', { timeout: 20000 }); await wait(s, 600) }
/* every window-like thing in the page, drawn or not (a window kept on a page out of sight is not drawn) */
/* (a window on a page not in view still has a box but no words: "in sight" = its words are drawn, innerText not empty) */
const kept = s => s.page.evaluate(() => [...document.querySelectorAll('.floatwin, .bidsheet, [role=dialog], #pop, #arrTools.on, .airpop')].filter(e => { const b = e.getBoundingClientRect(); return b.width > 2 && b.height > 2 }).map(e => {
  const pg = e.closest('.page')?.id || '(outside the pages)'; const seen = (e.innerText || '').trim().length > 0
  return `${(e.id ? '#' + e.id : '') + '.' + String(e.className).split(/\s+/).slice(0, 2).join('.')} [${pg}] ${seen ? 'IN SIGHT' : 'kept, out of sight'}: ${(e.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 90)}`
}).slice(0, 6))
const winWords = async s => (await windowsNow(s)).map(w => `${w.what}${w.inert ? ' [inert]' : ''}: ${w.words.slice(0, 150)} | buttons: ${w.buttons.join(', ')}`)
const state = async s => ({ squadron: await barSq(s), page: await pageOn(s), toast: await toastNow(s), bands: await bands(s) })
const V = {
  myleave: { open: async s => { await go(s, 'leavewar'); await s.page.waitForSelector(tid('my-leave'), { timeout: 15000 }); await hit(s, tid('my-leave'), 800) }, home: s => go(s, 'leavewar'), homeWait: s => s.page.waitForSelector(tid('my-leave'), { timeout: 15000 }).catch(() => {}), ring: '.floatwin, [role=dialog]' },
  trkmark: { open: async s => { await trk(s); const id = await s.page.evaluate(() => { for (const g of document.querySelectorAll('#flowSvg .ball')) { const r = g.getBoundingClientRect(); if (r.width < 4) continue; const cx = r.left + r.width / 2, cy = r.top + r.height / 2; if (cx < 10 || cy < 140 || cx > innerWidth - 10 || cy > innerHeight - 60) continue; const at = document.elementFromPoint(cx, cy); if (at && g.contains(at)) return g.dataset.id } return null }); const b = await s.page.locator(`#flowSvg .ball[data-id="${id}"]`).first().boundingBox(); if (s.desk) await s.page.mouse.click(b.x + b.width / 2, b.y + b.height / 2); else await s.page.touchscreen.tap(b.x + b.width / 2, b.y + b.height / 2); await wait(s, 800) }, home: s => go(s, 'tracker'), homeWait: s => s.page.waitForSelector('#flowSvg .ball', { timeout: 20000 }).catch(() => {}), ring: '#pop' },
  trklayout: { open: async s => { await trk(s); await hit(s, '#sylMenuBtn', 400); await hit(s, '#arrangeBtn', 800) }, home: s => go(s, 'tracker'), homeWait: s => s.page.waitForSelector('#flowSvg .ball', { timeout: 20000 }).catch(() => {}), ring: '#arrTools' },
}
async function run(name) {
  const v = V[name]; const k = `p5.n1.${name}.${SZ}`, P = `p5-n1-${name}-${SZ}`
  const s = await mk(SZ)
  try {
    await signIn(s, 'ad', 'a')
    await v.open(s)
    FACT(`${k}.1.opened`, { ...(await state(s)), windows: await winWords(s) })
    await scratch(s, SEC, `${P}-0-open`)
    await go(s, 'inputs'); await wait(s, 600)
    FACT(`${k}.2.onInputs`, { ...(await state(s)), windowsDrawn: await winWords(s), windowsInPage: await kept(s) })
    const p = await reachPick(s, 149, via(s))
    FACT(`${k}.3.pick149`, { control: p.control, covered: p.covered, pressed: !!p.pressed })
    FACT(`${k}.3.afterPick`, { ...(await state(s)), windowsDrawn: await winWords(s), windowsInPage: await kept(s) })
    await shot(s, `${P}-1-inputs-at-pick`, [s.desk ? '#sqnMenuBtn' : '.topbar .mark'], null, 40)
    await v.home(s); await v.homeWait(s); await wait(s, 700)
    FACT(`${k}.4.backOn149`, { ...(await state(s)), windowsDrawn: await winWords(s), windowsInPage: await kept(s) })
    const drawn = (await windowsNow(s)).length
    await shot(s, `${P}-2-back-on-149`, [s.desk ? '#sqnMenuBtn' : '.topbar .mark', ...(drawn ? [v.ring] : [])], null, 30)
    const p2 = await reachPick(s, 142, via(s))
    FACT(`${k}.5.pick142`, { covered: p2.covered, pressed: !!p2.pressed })
    await v.home(s); await v.homeWait(s); await wait(s, 700)
    FACT(`${k}.6.backOn142`, { ...(await state(s)), windowsDrawn: await winWords(s), windowsInPage: await kept(s) })
    await scratch(s, SEC, `${P}-3-back-on-142`)
  } catch (e) { FACT(`${k}.error`, String(e).split('\n')[0].slice(0, 200)); await scratch(s, SEC, P + '-error').catch(() => {}) } finally { await s.ctx.close().catch(() => {}) }
}
try {
  console.log('p5-n1 v1', SZ)
  for (const n of (ONLY.length ? ONLY : Object.keys(V))) await run(n)
} catch (e) { console.error('FAILED', String(e).split('\n')[0]); process.exitCode = 1 } finally { await closeAll() }
