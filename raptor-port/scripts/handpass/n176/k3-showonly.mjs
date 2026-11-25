// k3 - the six windows his D2596 and D2597 say close by themselves at a pick: as TODAY's app does it, with 150 picked
// while each is open. Three-squadron world (k0). Saber (master admin) on 142, a fresh browser each:
//   allavail  - ALL AVAIL (made by presses: Edit Schedule → the first "+ add" slot → ALL AVAIL placed → its count chip)
//   changes   - Changes (Edit Schedule → the clock), opened out; on a phone ALSO folded ("Hide ▾")
//   insights  - Insights (View-only Sched → Insights)
//   sansday   - a day opened on the SANS calendar (Inputs → SANS → a date)
//   lwday     - the Leave War's day panel (Leave War → December → 15 Dec's cell)
//   trkinfo   - a Tracker event's details (the ⓘ mode on, an event pressed)
// Each: open → picture → pick 150 (desktop: the Schedules menu; phone: ☰ → its squadron line) → picture → is it open?
// Then back: pick 142, the window's page again → is it there again (comes back later)?
//   node raptor-port/scripts/handpass/n176/k3-showonly.mjs <d|p>   (ONLY=allavail,changes,...; a phone runs changes)
import { mk, closeAll, FACT, note, signIn, go, wait, vis, hit, shot, scratch, barSq, pageOn, reachPick, windowsNow, overlaysNow, toastNow, world, tag } from './k-lib.mjs'
const SZ = process.argv[2] === 'p' ? 'p' : 'd'
const ONLY = (process.env.ONLY || '').split(',').filter(Boolean)
const tid = t => `[data-testid="${t}"]`
async function trk(s) { await go(s, 'tracker'); await s.page.waitForSelector('#flowSvg .ball', { timeout: 20000 }); await wait(s, 700) }
async function pressBall(s) {
  const id = await s.page.evaluate(() => { for (const g of document.querySelectorAll('#flowSvg .ball')) { const r = g.getBoundingClientRect(); if (r.width < 4) continue; const cx = r.left + r.width / 2, cy = r.top + r.height / 2; if (cx < 10 || cy < 160 || cx > innerWidth - 10 || cy > innerHeight - 120) continue; const at = document.elementFromPoint(cx, cy); if (at && g.contains(at)) return g.dataset.id } return null })
  const b = await s.page.locator(`#flowSvg .ball[data-id="${id}"]`).first().boundingBox()
  if (s.desk) await s.page.mouse.click(b.x + b.width / 2, b.y + b.height / 2); else await s.page.touchscreen.tap(b.x + b.width / 2, b.y + b.height / 2)
  await wait(s, 800); return id
}
const W = {
  allavail: { page: 'editsched', open: async s => {
    await go(s, 'editsched'); await wait(s, 700)
    await hit(s, vis(s, '.page.on [data-fill="a:0.0.+"]').first(), 700)
    let pal = vis(s, '[data-person]').filter({ hasText: /^ALL AVAIL$/ })
    if (!(await pal.count())) { const t = vis(s, '.ros-tab, [title="Aircrew palette"], .crewtab').first(); if (await t.count()) await hit(s, t, 700); pal = vis(s, '[data-person]').filter({ hasText: /^ALL AVAIL$/ }) }
    await hit(s, pal.first(), 900)
    await hit(s, vis(s, '.page.on [data-oilsent]').first(), 900)
  }, reopen: async s => { await go(s, 'editsched'); await wait(s, 700) } },
  changes: { page: 'editsched', open: async s => { await go(s, 'editsched'); await wait(s, 500); await hit(s, '#histBtn', 900) }, sel: '.chgwin', reopen: async s => { await go(s, 'editsched'); await wait(s, 700) } },
  changesFolded: { page: 'editsched', open: async s => { await go(s, 'editsched'); await wait(s, 500); await hit(s, '#histBtn', 900); await hit(s, vis(s, '.chgwin .win-hide').first(), 700) }, sel: '.chgwin', reopen: async s => { await go(s, 'editsched'); await wait(s, 700) } },
  insights: { page: 'viewsched', open: async s => { await go(s, 'viewsched'); await wait(s, 500); if (await vis(s, '#insightBtn').count()) await hit(s, '#insightBtn', 800); else { await hit(s, '#viewSchedMore', 400); await hit(s, vis(s, 'button, [role=menuitem]').filter({ hasText: /Insights/ }).first(), 800) } }, sel: '#insightModal', reopen: async s => { await go(s, 'viewsched'); await wait(s, 700) } },
  sansday: { page: 'inputs', open: async s => { await go(s, 'inputs'); await wait(s, 500); await hit(s, '#inSansMode', 900); const d = vis(s, `${tid('sc-grid')} [data-testid^="sc-"]`).nth(10); await hit(s, d, 900) }, sel: '.floatwin.sansday', reopen: async s => { await go(s, 'inputs'); await wait(s, 500); if (await vis(s, '#inSansMode').count()) await hit(s, '#inSansMode', 800) } },
  lwday: { page: 'leavewar', open: async s => {
    await go(s, 'leavewar'); await s.page.waitForSelector(tid('month-strip'), { timeout: 15000 }); await wait(s, 500)
    if (await vis(s, tid('month-DEC')).count()) await hit(s, tid('month-DEC'), 700)
    /* the date's heading (his D1143: a tap on a date's heading opens that day) */
    const h = s.page.locator('th.day[data-d="2026-12-15"]').first(); await h.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await wait(s, 250)
    const b = await h.boundingBox(); if (s.desk) await s.page.mouse.click(b.x + b.width / 2, b.y + b.height / 2); else await s.page.touchscreen.tap(b.x + b.width / 2, b.y + b.height / 2); await wait(s, 900)
  }, sel: '.lwday', reopen: async s => { await go(s, 'leavewar'); await wait(s, 900) } },
  trkinfo: { page: 'tracker', open: async s => { await trk(s); await hit(s, '#detailsBtn', 500); FACT(`k3.${tag(s)}.trkinfo.ball`, await pressBall(s)) }, sel: '#detailBubble', reopen: async s => { await trk(s) } },
}
/* what is open now: windows and floating panels, as words */
const openNow = async s => [...(await windowsNow(s)).map(w => `${w.what}: ${w.words.slice(0, 70)}`), ...(await overlaysNow(s)).map(o => 'float ' + o)]
const markNew = (s, before) => s.page.evaluate(before => {
  const vis = e => { const b = e.getBoundingClientRect(); const c = getComputedStyle(e); return b.width > 2 && b.height > 2 && c.visibility !== 'hidden' && c.display !== 'none' }
  for (const e of document.querySelectorAll('[role=dialog], .airpop, .floatwin, .lwday, #pop, .chgwin, [class*="pop"], [class*="bubble"], [class*="insight"], [class*="sansday"]')) {
    if (!vis(e) || e.closest('#drawer, .topbar')) continue
    const w = (e.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 40)
    if (before.some(b => b.includes(w)) && w) continue
    e.setAttribute('data-k3win', '1'); return { cls: String(e.className).slice(0, 60), words: w }
  }
  return null
}, before)
const stillThere = s => s.page.evaluate(() => { const e = document.querySelector('[data-k3win]'); if (!e || !e.isConnected) return false; const b = e.getBoundingClientRect(); return b.width > 2 && b.height > 2 })
async function one(key) {
  const r = W[key], K = `k3.${SZ}.${key}`, P = `k3-${SZ}-${key}`
  const s = await mk(SZ, { storageState: await world() })
  try {
    await signIn(s, 'ad', 'a')
    await go(s, r.page); await wait(s, 600)
    const before = await openNow(s)
    try { await r.open(s) } catch (e) { FACT(`${K}.opened`, 'could not open by presses: ' + String(e).split('\n')[0].slice(0, 160)); await scratch(s, `${P}-not-opened`); return }
    const newOnes = (await openNow(s)).filter(x => !before.includes(x))
    const marked = r.sel ? await s.page.evaluate(sel => { const e = [...document.querySelectorAll(sel)].find(x => x.getBoundingClientRect().width > 2); if (e) { e.setAttribute('data-k3win', '1'); return { cls: String(e.className).slice(0, 60), words: e.innerText.replace(/\s+/g, ' ').trim().slice(0, 60) } } return null }, r.sel) : await markNew(s, before)
    FACT(`${K}.1.open`, { squadron: await barSq(s), page: await pageOn(s), marked, newOnes })
    await shot(s, `${P}-1-open`, ['[data-k3win]', s.desk ? '#sqnMenuBtn' : '#burger'], null, 12)
    const words0 = await s.page.evaluate(() => document.querySelector('[data-k3win]')?.innerText.replace(/\s+/g, ' ').trim().slice(0, 260) ?? null)
    let p0 = await reachPick(s, 150, s.desk ? 'bar' : 'menu'); await wait(s, 900)
    if (!p0.pressed && /covered/.test(p0.covered || '')) {
      /* the control is under the window's shade: a press where the control is drawn, as a person makes it - what it does */
      const ctl = s.desk ? '#sqnMenuBtn' : '#burger'
      const { boxOf, tapAt } = await import('./k-lib.mjs')
      const b = await boxOf(s, ctl); await tapAt(s, b.x + b.w / 2, b.y + b.h / 2); await wait(s, 500)
      FACT(`${K}.2.pressOnShade`, { where: `the ${s.desk ? 'Schedules menu' : '☰'} as drawn under the shade`, stillOpen: await stillThere(s), listOpen: await s.page.evaluate(() => [...document.querySelectorAll('#sqnMenu .sqm-row')].some(e => e.getBoundingClientRect().width > 0)), openNow: await openNow(s) })
      await s.page.keyboard.press('Escape').catch(() => {}); await wait(s, 300)
      if (!(await stillThere(s))) { p0 = await reachPick(s, 150, s.desk ? 'bar' : 'menu'); p0.secondTry = true; await wait(s, 900) }
    }
    FACT(`${K}.2.pick150`, { reach: p0, squadron: await barSq(s), page: await pageOn(s), stillOpen: await stillThere(s), wordsBefore: words0, wordsAfter: await s.page.evaluate(() => document.querySelector('[data-k3win]')?.innerText.replace(/\s+/g, ' ').trim().slice(0, 260) ?? null), openNow: await openNow(s), toast: await toastNow(s) })
    await shot(s, `${P}-2-after-pick150`, (await stillThere(s)) ? ['[data-k3win]', '.topbar .mark'] : ['.topbar .mark', s.desk ? '#sqnMenuBtn' : '#burger'], null, 12)
    await reachPick(s, 142, s.desk ? 'bar' : 'menu'); await wait(s, 800)
    await r.reopen(s); await wait(s, 400)
    const back = (await openNow(s)).filter(x => newOnes.some(n => n.slice(0, 40) === x.slice(0, 40)))
    FACT(`${K}.3.back142`, { squadron: await barSq(s), page: await pageOn(s), cameBack: back.length > 0, back, openNow: await openNow(s) })
    await scratch(s, `${P}-3-back142`)
  } catch (e) { FACT(`${K}.error`, String(e).split('\n')[0].slice(0, 220)); await scratch(s, `${P}-error`).catch(() => {}) } finally { await s.ctx.close().catch(() => {}) }
}
try {
  console.log('k3-showonly v1', SZ)
  const keys = ONLY.length ? ONLY : (SZ === 'd' ? ['allavail', 'changes', 'insights', 'sansday', 'lwday', 'trkinfo'] : ['changes', 'changesFolded'])
  for (const k of keys) { note(`== ${k}`); await one(k) }
} catch (e) { console.error('FAILED', String(e).split('\n')[0]); process.exitCode = 1 } finally { await closeAll() }
