// p1-allavail - P1 case 6: the ALL AVAIL window. The first press could not open it (no count chip in the demo). Made here
// by presses on Monday of the week in view (Saber, master admin, 142): Edit Schedule → the empty "+ add" slot of the
// first programme item (SODB) pressed (armed) → the AIRCREW panel's "ALL AVAIL" placeholder pressed (placed) → the count
// chip that then draws beside it pressed → the ALL AVAIL window. Then the pick of 149 (top-bar picker; on a phone also
// ☰) or the member-view switch, each in a fresh browser.   node raptor-port/scripts/handpass/n175/p1-allavail.mjs <d|p>
// No stand-ins. Deciding pictures: p1-allavail-<size>-*.png
import { mk, closeAll, FACT, note, signIn, covered, boxOf, barSq, pageOn, go, windowsNow, roleNow, reachPick, reachView, wait, hit, vis, decide, scratch, notesNow, askNow, normSz } from './p1-lib.mjs'
const SZ = normSz(process.argv[2] || 'd'), T = SZ
const winNow = s => s.page.evaluate(() => { const e = [...document.querySelectorAll('.availwin, #availWin, [aria-label*="ALL AVAIL" i], .floatwin')].find(x => x.getBoundingClientRect().width > 2 && /AVAIL|available|earn/i.test(x.innerText)); if (!e) return null; e.setAttribute('data-p1win', '1'); return { what: (e.id ? '#' + e.id : '') + '.' + String(e.className).split(/\s+/).slice(0, 2).join('.'), words: e.innerText.replace(/\s+/g, ' ').trim().slice(0, 160), buttons: [...e.querySelectorAll('button')].filter(b => b.getBoundingClientRect().width > 0).map(b => (b.textContent.trim() || b.getAttribute('aria-label')).slice(0, 24)).slice(0, 8) } })
async function make(s, k) {
  await go(s, 'editsched'); await wait(s, 700)
  await hit(s, vis(s, '.page.on [data-fill="a:0.0.+"]').first(), 700)
  FACT(`${k}.armed`, await s.page.evaluate(() => document.body.classList.contains('arming')))
  let pal = vis(s, '[data-person]').filter({ hasText: /^ALL AVAIL$/ })
  if (!(await pal.count())) { const tab = vis(s, '.ros-tab, [title="Aircrew palette"], .crewtab').first(); if (await tab.count()) await hit(s, tab, 700); pal = vis(s, '[data-person]').filter({ hasText: /^ALL AVAIL$/ }) }
  if (!(await pal.count())) throw new Error('no ALL AVAIL placeholder drawn in the aircrew panel')
  await hit(s, pal.first(), 900)
  const chip = vis(s, '.page.on [data-oilsent]')
  FACT(`${k}.chipDrawn`, { count: await chip.count(), words: (await chip.count()) ? (await chip.first().textContent()).trim() : null, title: (await chip.count()) ? await chip.first().getAttribute('title') : null })
  if (!(await chip.count())) throw new Error('no count chip drawn after placing ALL AVAIL')
  await hit(s, chip.first(), 900)
}
async function one(action) {
  const k = `P1.allavail.${T}.${action}`, P = `p1-allavail-${T}`
  const s = await mk(SZ)
  try {
    await signIn(s, 'ad', 'a')
    try { await make(s, k) } catch (e) { FACT(`${k}.opened`, 'could not open by presses: ' + String(e).split('\n')[0].slice(0, 140)); await scratch(s, `${P}-${action}-not-opened`); return }
    const ctl = {}
    for (const sel of ['#sqnMenuBtn', '#burger', '#roleBadge', '#notifyBell']) ctl[sel] = (await boxOf(s, sel)) ? await covered(s, sel) : 'not drawn'
    FACT(`${k}.opened`, { window: await winNow(s), controls: ctl })
    if (action === 'pick') await decide(s, `${P}-1-open`, '[data-p1win]', null)
    const sq0 = await barSq(s), r0 = await roleNow(s)
    const did = action === 'pick' ? await reachPick(s, 149, 'bar') : action === 'pickmenu' ? await reachPick(s, 149, 'menu') : await reachView(s)
    FACT(`${k}.press`, did)
    if (!did.pressed) { if (action === 'pick') await decide(s, `${P}-2-bar-covered`, ['#sqnMenuBtn', '#burger'], null); return }
    await wait(s, 900)
    const r1 = await roleNow(s)
    FACT(`${k}.after`, { squadron: { before: sq0, after: await barSq(s) }, role: { before: r0.badge || r0.menuLine, after: r1.badge || r1.menuLine }, page: await pageOn(s), window: await winNow(s), windows: (await windowsNow(s)).map(w => w.what + ': ' + w.words.slice(0, 90)), notes: await notesNow(s), question: await askNow(s) })
    if (action === 'pick') await decide(s, `${P}-2-after-pick`, (await winNow(s)) ? '[data-p1win]' : ['#sqnMenuBtn', '.topbar .mark'], null)
    else await scratch(s, `${P}-${action}-after`)
  } catch (e) { FACT(`${k}.error`, String(e).split('\n')[0].slice(0, 180)) } finally { await s.ctx.close().catch(() => {}) }
}
try {
  console.log('p1-allavail v1', SZ)
  for (const a of (SZ === 'd' ? ['pick', 'view'] : ['pick', 'pickmenu', 'view'])) { note(`== ${a}`); await one(a) }
} catch (e) { console.error('FAILED', String(e).split('\n')[0]); process.exitCode = 1 } finally { await closeAll() }
