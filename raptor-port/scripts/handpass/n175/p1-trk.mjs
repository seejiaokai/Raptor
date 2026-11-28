// p1-trk - P1 case 4: the Tracker's less-used windows and modes. Saber (master admin, home 142). Each set-up opened by
// its own controls in a fresh browser: 'layout' (☰ syllabus menu → Edit chart layout, NOTHING moved); 'showall' (Show All);
// 'info' (the ⓘ info mode switched on, then an event pressed - its details); 'flex' (Flex settings); 'reorder' (the
// side panel's Reorder). With each: the pick of 149 (top-bar picker; on a phone also ☰) and the member-view switch — what
// closes, whether anything is asked, what is drawn after.
//   node raptor-port/scripts/handpass/n175/p1-trk.mjs <d|p>     (ONLY=layout,showall,info,flex,reorder)
// No stand-ins. Deciding pictures: p1-trk-<setup>-<size>-*.png
import { mk, closeAll, FACT, note, signIn, covered, boxOf, barSq, pageOn, go, windowsNow, overlaysNow, roleNow, reachPick, reachView, wait, hit, vis, decide, scratch, notesNow, askNow, normSz } from './p1-lib.mjs'
const SZ = normSz(process.argv[2] || 'd'), T = SZ
const ONLY = (process.env.ONLY || '').split(',').filter(Boolean)
async function trk(s) { await go(s, 'tracker'); await s.page.waitForSelector('#flowSvg .ball', { timeout: 20000 }); await wait(s, 700) }
async function pressBall(s) {
  const id = await s.page.evaluate(() => { for (const g of document.querySelectorAll('#flowSvg .ball')) { const r = g.getBoundingClientRect(); if (r.width < 4) continue; const cx = r.left + r.width / 2, cy = r.top + r.height / 2; if (cx < 10 || cy < 140 || cx > innerWidth - 10 || cy > innerHeight - 60) continue; const at = document.elementFromPoint(cx, cy); if (at && g.contains(at)) return g.dataset.id } return null })
  if (!id) throw new Error('no event ball free to press')
  const b = await s.page.locator(`#flowSvg .ball[data-id="${id}"]`).first().boundingBox()
  if (s.desk) await s.page.mouse.click(b.x + b.width / 2, b.y + b.height / 2); else await s.page.touchscreen.tap(b.x + b.width / 2, b.y + b.height / 2)
  await wait(s, 800); return id
}
const S = {
  layout: { what: 'Edit chart layout (the syllabus menu → Edit chart layout), nothing moved', open: async s => { await trk(s); await hit(s, '#sylMenuBtn', 400); await hit(s, '#arrangeBtn', 800) }, mark: '#arrTools' },
  showall: { what: 'Show All', open: async s => { await trk(s); await hit(s, '#showAllBtn', 900) } },
  info: { what: 'the ⓘ info mode on, an event pressed (its details)', open: async s => { await trk(s); await hit(s, '#detailsBtn', 500); FACT(`P1.trk.${T}.info.ballPressed`, await pressBall(s)) } },
  flex: { what: 'Flex settings', open: async s => { await trk(s); await hit(s, '#flexBtn', 800) } },
  reorder: { what: "Reorder (the side panel's)", open: async s => { await trk(s); await hit(s, '#ordCrew:not([disabled])', 800) } },
}
/* what the Tracker draws as open now: windows, menus, modes (pressed toggles), the layout toolbar */
const trkNow = s => s.page.evaluate(() => {
  const vis = e => { const b = e.getBoundingClientRect(); const c = getComputedStyle(e); return b.width > 2 && b.height > 2 && c.visibility !== 'hidden' && c.display !== 'none' }
  const out = {}
  out.pressed = [...document.querySelectorAll('#detailsBtn, #flexBtn, #ordCrew, #showAllBtn, #arrangeBtn')].filter(vis).map(b => `${b.id}:${b.getAttribute('aria-pressed') ?? ''}${b.classList.contains('primary') ? ' (lit)' : ''}`)
  out.layoutToolbar = [...document.querySelectorAll('#arrTools')].some(vis)
  out.reorderMode = [...document.querySelectorAll('.reordering, [data-reorder], .ordmode, #ordDone, button')].filter(vis).some(b => /^(Done|Done reordering|✓ Done)$/.test((b.textContent || '').trim()) && b.closest('.page.on, #trkSide, aside'))
  return out
})
async function one(key, action) {
  const r = S[key], k = `P1.trk.${T}.${key}.${action}`, P = `p1-trk-${key}-${T}`
  const s = await mk(SZ)
  try {
    await signIn(s, 'ad', 'a')
    const before = (await windowsNow(s)).map(w => w.what)
    try { await r.open(s) } catch (e) { FACT(`${k}.opened`, 'could not open by presses: ' + String(e).split('\n')[0].slice(0, 140)); return }
    const ws = (await windowsNow(s)).filter(w => !before.includes(w.what))
    const ctl = {}
    for (const sel of ['#sqnMenuBtn', '#burger', '#roleBadge', '#notifyBell']) ctl[sel] = (await boxOf(s, sel)) ? await covered(s, sel) : 'not drawn'
    FACT(`${k}.opened`, { windows: ws.map(w => ({ what: w.what, words: w.words.slice(0, 120), buttons: w.buttons.slice(0, 8) })), tracker: await trkNow(s), floating: ws.length ? undefined : await overlaysNow(s), controls: ctl })
    if (action === 'pick') {
      await s.page.evaluate(() => { const c = [...document.querySelectorAll('#arrTools, [role=dialog], .modal, .floatwin, .popover, .trk-pop, .evpop, .flexpop')].find(e => { const b = e.getBoundingClientRect(); return b.width > 2 && b.height > 2 && getComputedStyle(e).visibility !== 'hidden' }); if (c) c.setAttribute('data-p1win', '1') })
      await decide(s, `${P}-1-open`, '[data-p1win]', null)
    }
    const sq0 = await barSq(s), r0 = await roleNow(s)
    const did = action === 'pick' ? await reachPick(s, 149, 'bar') : action === 'pickmenu' ? await reachPick(s, 149, 'menu') : await reachView(s)
    FACT(`${k}.press`, did)
    if (!did.pressed) { if (action === 'pick') await decide(s, `${P}-2-bar-covered`, ['#sqnMenuBtn', '#burger'], null); return }
    await wait(s, 900)
    const r1 = await roleNow(s)
    FACT(`${k}.after`, { squadron: { before: sq0, after: await barSq(s) }, role: { before: r0.badge || r0.menuLine, after: r1.badge || r1.menuLine }, page: await pageOn(s), windows: (await windowsNow(s)).map(w => w.what + ': ' + w.words.slice(0, 100)), tracker: await trkNow(s), notes: await notesNow(s), question: await askNow(s) })
    if (action === 'pick') await decide(s, `${P}-2-after-pick`, (await askNow(s)) ? '#dlgMsg' : ['#sqnMenuBtn', '.topbar .mark'], null)
    else await scratch(s, `${P}-${action}-after`)
  } catch (e) { FACT(`${k}.error`, String(e).split('\n')[0].slice(0, 180)) } finally { await s.ctx.close().catch(() => {}) }
}
try {
  console.log('p1-trk v1', SZ)
  for (const key of (ONLY.length ? ONLY : Object.keys(S))) { note(`== ${key}`); FACT(`P1.trk.${T}.${key}.what`, S[key].what); for (const a of (SZ === 'd' ? ['pick', 'view'] : ['pick', 'pickmenu', 'view'])) await one(key, a) }
} catch (e) { console.error('FAILED', String(e).split('\n')[0]); process.exitCode = 1 } finally { await closeAll() }
