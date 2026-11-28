// p1-changes - P1 case 2: the Changes window (Edit Schedule → the clock), opened out and folded (its folded form: on a
// phone "Hide ▾" sends it to the slim bar "… · N changes · Show ▴"; a desktop draws no Hide). Saber. With each form:
// the pick of 149 (the top-bar picker; on a phone also ☰ → its squadron list) and the member-view switch. Fresh browser
// each.   node raptor-port/scripts/handpass/n175/p1-changes.mjs <d|p>
// No stand-ins. Deciding pictures: p1-changes-<form>-<size>-*.png
import { mk, closeAll, FACT, note, signIn, covered, boxOf, barSq, pageOn, go, windowsNow, roleNow, reachPick, reachView, wait, hit, vis, decide, scratch, notesNow, askNow, normSz } from './p1-lib.mjs'
const SZ = normSz(process.argv[2] || 'd'), T = SZ
const CHG = '.chgwin'
const chgNow = s => s.page.evaluate(sel => { const e = [...document.querySelectorAll(sel)].find(x => x.getBoundingClientRect().width > 2); if (!e) return null; const b = e.getBoundingClientRect(); return { folded: e.classList.contains('bar'), words: e.innerText.replace(/\s+/g, ' ').trim().slice(0, 140), box: { x: Math.round(b.left), y: Math.round(b.top), w: Math.round(b.width), h: Math.round(b.height) }, buttons: [...e.querySelectorAll('button')].filter(x => x.getBoundingClientRect().width > 0).map(x => (x.textContent.trim() || x.getAttribute('aria-label')).slice(0, 30)).slice(0, 8) } }, CHG)

async function one(form, action) {
  const k = `P1.changes.${T}.${form}.${action}`, P = `p1-changes-${form}-${T}`
  const s = await mk(SZ)
  try {
    await signIn(s, 'ad', 'a')
    await go(s, 'editsched'); await wait(s, 500)
    await hit(s, '#histBtn', 900)
    if (form === 'folded') {
      const hide = vis(s, `${CHG} .win-hide`)
      if (!(await hide.count())) { FACT(`${k}.opened`, { window: await chgNow(s), fold: 'no Hide ▾ drawn at this size - the window has no folded form here' }); return }
      await hit(s, hide.first(), 700)
    }
    const ctl = {}
    for (const sel of ['#sqnMenuBtn', '#burger', '#roleBadge', '#notifyBell']) ctl[sel] = (await boxOf(s, sel)) ? await covered(s, sel) : 'not drawn'
    FACT(`${k}.opened`, { window: await chgNow(s), controls: ctl, histMode: await s.page.evaluate(() => document.querySelector('#histBtn')?.getAttribute('aria-pressed')) })
    if (action === 'pick') await decide(s, `${P}-1-open`, CHG, null)
    const sq0 = await barSq(s), r0 = await roleNow(s)
    const did = action === 'pick' ? await reachPick(s, 149, 'bar') : action === 'pickmenu' ? await reachPick(s, 149, 'menu') : await reachView(s)
    FACT(`${k}.press`, did)
    if (!did.pressed) return
    await wait(s, 700)
    const r1 = await roleNow(s)
    FACT(`${k}.after`, { squadron: { before: sq0, after: await barSq(s) }, role: { before: r0.badge || r0.menuLine, after: r1.badge || r1.menuLine }, page: await pageOn(s), changesWindow: await chgNow(s), windows: (await windowsNow(s)).map(w => w.what + ': ' + w.words.slice(0, 80)), notes: await notesNow(s), question: await askNow(s) })
    if (action === 'pick') await decide(s, `${P}-2-after-pick`, (await chgNow(s)) ? CHG : ['#sqnMenuBtn', '.topbar .mark'], null)
    else await scratch(s, `${P}-${action}-after`)
  } catch (e) { FACT(`${k}.error`, String(e).split('\n')[0].slice(0, 180)) } finally { await s.ctx.close().catch(() => {}) }
}
try {
  console.log('p1-changes v1', SZ)
  for (const form of ['open', 'folded']) for (const a of (SZ === 'd' ? ['pick', 'view'] : ['pick', 'pickmenu', 'view'])) { note(`== ${form} ${a}`); await one(form, a) }
} catch (e) { console.error('FAILED', String(e).split('\n')[0]); process.exitCode = 1 } finally { await closeAll() }
