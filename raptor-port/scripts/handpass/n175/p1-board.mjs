// p1-board - P1 case 3: the Scheduler Board (Edit Schedule → a day's date). Saber (master admin, home 142).
// Is it a page or a window over a page (does it cover the top bar's squadron picker, name badge / ☰, bell)? Three set-ups,
// each in a fresh browser: 'board' (the board open, nothing typed); 'cx' (a Common Programme item's CX pressed, a reason
// typed in the cancel-reason box, not confirmed); 'sortall' (the board's "Sort all" pressed - its question up). With each:
// the pick of 149 (the top-bar picker; on a phone also ☰), the member-view switch, and the board's own bell — each where it
// can be reached; what closes, whether the typed reason is kept, whether anything is asked.
//   node raptor-port/scripts/handpass/n175/p1-board.mjs <d|p>   (ONLY=board,cx,sortall)
// No stand-ins. Deciding pictures: p1-board-<setup>-<size>-*.png
import { mk, closeAll, FACT, note, signIn, covered, boxOf, barSq, pageOn, go, windowsNow, roleNow, reachPick, reachView, wait, hit, vis, typeIn, valOf, decide, scratch, notesNow, askNow, normSz } from './p1-lib.mjs'
const SZ = normSz(process.argv[2] || 'd'), T = SZ
const ONLY = (process.env.ONLY || '').split(',').filter(Boolean)
const REASON = 'P1 reason typed'
const boardNow = s => s.page.evaluate(() => { const e = document.querySelector('#schedBoard'); if (!e || e.hidden) return { open: false }; const b = e.getBoundingClientRect(); return { open: b.width > 2, box: { x: Math.round(b.left), y: Math.round(b.top), w: Math.round(b.width), h: Math.round(b.height) }, title: document.querySelector('#schedBoard .sb-title')?.textContent.replace(/\s+/g, ' ').trim() } })
const cxNow = s => s.page.evaluate(() => { const e = document.querySelector('#cxPop'); if (!e || e.hidden || !(e.getBoundingClientRect().width > 2)) return null; const r = document.querySelector('#cxReason'); return { title: document.querySelector('#cxTitle')?.textContent.trim(), reason: r ? r.value : null } })
const sortNow = s => s.page.evaluate(() => { const e = [...document.querySelectorAll('[role=dialog], [role=alertdialog], .airpop')].find(x => !x.hidden && x.getBoundingClientRect().width > 2 && /sort/i.test(x.innerText)); return e ? { words: e.innerText.replace(/\s+/g, ' ').trim().slice(0, 200), buttons: [...e.querySelectorAll('button')].filter(b => b.getBoundingClientRect().width > 0).map(b => b.textContent.trim()) } : null })
const bellOpen = s => s.page.evaluate(() => [...document.querySelectorAll('[data-testid="bell-list"], .bell-list')].some(e => e.getBoundingClientRect().width > 2))

async function setup(s, kind) {
  await go(s, 'editsched'); await wait(s, 600)
  await hit(s, vis(s, '.page.on .sb-open[data-sbday]').first(), 1200)
  if (kind === 'cx') {
    await hit(s, vis(s, '#schedBoard [data-pcx]').first(), 800)
    FACT(`P1.board.${T}.cx.typed`, await typeIn(s, '#cxReason', REASON))
  }
  if (kind === 'sortall') {
    const b = vis(s, '#sbSortAll')
    if (await b.count()) await hit(s, b.first(), 800)
    else { await hit(s, vis(s, '#sbMore, .sb-morewrap > button').first(), 500); await hit(s, '#sbMoreSort', 800) }
  }
}
async function one(kind, action) {
  const k = `P1.board.${T}.${kind}.${action}`, P = `p1-board-${kind}-${T}`
  const s = await mk(SZ)
  try {
    await signIn(s, 'ad', 'a')
    await setup(s, kind)
    const ctl = {}
    for (const sel of ['#sqnMenuBtn', '#burger', '#roleBadge', '#notifyBell', '#sbBell', '#sbDone']) ctl[sel] = (await boxOf(s, sel)) ? await covered(s, sel) : 'not drawn'
    FACT(`${k}.opened`, { board: await boardNow(s), cancelBox: await cxNow(s), sortAll: await sortNow(s), controls: ctl, viewport: { w: s.W, h: s.H } })
    if (action === 'pick') await decide(s, `${P}-1-open`, kind === 'cx' ? '#cxPop .airpop-box' : kind === 'sortall' ? ['[role=dialog]:not([hidden])'] : '#schedBoard .sb-top', null)
    const sq0 = await barSq(s), r0 = await roleNow(s)
    let did
    if (action === 'pick') did = await reachPick(s, 149, 'bar')
    else if (action === 'pickmenu') did = await reachPick(s, 149, 'menu')
    else if (action === 'view') did = await reachView(s)
    else {
      did = { control: "the board's own bell", covered: await covered(s, '#sbBell') }
      if (did.covered === 'free') { const b = await boxOf(s, '#sbBell'); if (s.desk) await s.page.mouse.click(b.x + b.w / 2, b.y + b.h / 2); else await s.page.touchscreen.tap(b.x + b.w / 2, b.y + b.h / 2); did.pressed = true; await wait(s, 700) }
    }
    FACT(`${k}.press`, did)
    if (!did.pressed) return
    await wait(s, 700)
    const r1 = await roleNow(s)
    FACT(`${k}.after`, { squadron: { before: sq0, after: await barSq(s) }, role: { before: r0.badge || r0.menuLine, after: r1.badge || r1.menuLine }, page: await pageOn(s), board: await boardNow(s), cancelBox: await cxNow(s), sortAll: await sortNow(s), bellListOpen: await bellOpen(s), notes: await notesNow(s), question: await askNow(s), windows: (await windowsNow(s)).map(w => w.what + ': ' + w.words.slice(0, 80)) })
    if (kind === 'cx') FACT(`${k}.after.reasonBox`, await valOf(s, '#cxReason'))
    if (action === 'pickmenu' || action === 'view') await scratch(s, `${P}-2-after-${action}`); else await decide(s, `${P}-2-after-${action}`, (await bellOpen(s)) ? '.bell-list' : (await cxNow(s)) ? '#cxPop .airpop-box' : ['#sqnMenuBtn', '.topbar .mark', '#schedBoard .sb-top'], null)
  } catch (e) { FACT(`${k}.error`, String(e).split('\n')[0].slice(0, 180)) } finally { await s.ctx.close().catch(() => {}) }
}
try {
  console.log('p1-board v1', SZ)
  for (const kind of (ONLY.length ? ONLY : ['board', 'cx', 'sortall'])) for (const a of (SZ === 'd' ? ['pick', 'view', 'sbbell'] : ['pick', 'pickmenu', 'view', 'sbbell'])) { note(`== ${kind} ${a}`); await one(kind, a) }
} catch (e) { console.error('FAILED', String(e).split('\n')[0]); process.exitCode = 1 } finally { await closeAll() }
