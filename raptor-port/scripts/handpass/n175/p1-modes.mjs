// p1-modes - P1 case 5: editing modes that are not windows. Saber (master admin, home 142). Each in a fresh browser:
//  'oilearn'  Edit Schedule → a day's date (the Scheduler Board) → Saturday's chip → "OIL Earn" pressed (the mode on);
//  'slot'     Edit Schedule → an empty "+ add" slot of Monday's programme pressed (a slot armed, waiting for a person);
//  'logic'    Logic → Edit → "Crew rest" changed (typed), Done NOT pressed;
//  'quals'    Quals → Edit → one tick of the first row changed, Done NOT pressed.
// Then the pick of 149 (top-bar picker; on a phone also ☰) or the member-view switch: what the screen does, and what
// happened to the change - kept, lost, saved, and into which squadron's record (read on 149, then back on 142 / back in
// the admin view, by the same page). Not pressed here: an armed "Discard N edits & load" (needs an issued day; see the
// hand-back).   node raptor-port/scripts/handpass/n175/p1-modes.mjs <d|p>   (ONLY=oilearn,slot,logic,quals)
// No stand-ins. Deciding pictures: p1-modes-<case>-<size>-*.png
import { mk, closeAll, FACT, note, signIn, covered, boxOf, barSq, pageOn, go, windowsNow, roleNow, reachPick, reachView, wait, hit, vis, typeIn, valOf, decide, scratch, notesNow, askNow, normSz } from './p1-lib.mjs'
const SZ = normSz(process.argv[2] || 'd'), T = SZ
const ONLY = (process.env.ONLY || '').split(',').filter(Boolean)

const qualCell = s => s.page.evaluate(() => { const c = [...document.querySelectorAll('.page.on td.qcell[data-q]')].find(e => !e.classList.contains('na') && !e.classList.contains('qro') && e.getBoundingClientRect().width > 0); return c ? c.dataset.q : null })
const qualGlyph = (s, q) => s.page.evaluate(q => { const c = document.querySelector(`.page.on td.qcell[data-q="${q}"]`); return c ? (c.textContent.trim() || '(blank)') : 'row not drawn' }, q)
const lgVal = s => valOf(s, '.page.on input.lgin[data-lgset="crewRest"]')
const lgMode = s => s.page.evaluate(() => { const d = document.querySelector('#lgDone'); return d && d.getBoundingClientRect().width > 0 ? 'editing (Done drawn)' : 'not editing' })
const qMode = s => s.page.evaluate(() => { const d = document.querySelector('#qSave'); return d && !d.hidden && d.getBoundingClientRect().width > 0 ? 'editing (Done drawn)' : 'not editing' })
const armNow = s => s.page.evaluate(() => ({ arming: document.body.classList.contains('arming'), armed: [...document.querySelectorAll('.armed')].filter(e => e.getBoundingClientRect().width > 0).map(e => (e.dataset.fill || e.dataset.slot || e.className)).slice(0, 3), strip: [...document.querySelectorAll('.armstrip, .arm-strip, [data-armstrip]')].filter(e => e.getBoundingClientRect().width > 0).map(e => e.textContent.replace(/\s+/g, ' ').trim().slice(0, 100)) }))
const oilNow = s => s.page.evaluate(() => { const b = document.querySelector('#sbOil'); const bd = document.querySelector('#schedBoard'); return { board: !!bd && !bd.hidden && bd.getBoundingClientRect().width > 2, oilButton: b ? { pressed: b.getAttribute('aria-pressed'), shown: b.getBoundingClientRect().width > 0 } : 'not drawn', dayHead: [...document.querySelectorAll('#schedBoard .daybar-h')].map(e => e.textContent.trim()).slice(0, 2), title: document.querySelector('#schedBoard .sb-title')?.textContent.replace(/\s+/g, ' ').trim() } })

const C = {
  oilearn: {
    open: async (s, k) => { await go(s, 'editsched'); await wait(s, 500); await hit(s, vis(s, '.page.on .sb-open[data-sbday]').first(), 1100); if (await vis(s, '#schedBoard [data-sbtab="5"]').count()) await hit(s, '#schedBoard [data-sbtab="5"]', 900); else for (let i = 0; i < 6 && !/Sat/.test((await oilNow(s)).title || ''); i++) await hit(s, '#sbNextDay', 700);const o = vis(s, '#sbOil, #schedBoard [data-oilmode]'); FACT(`${k}.oilButtonDrawn`, await o.count()); await hit(s, o.first(), 800) },
    state: oilNow, ring: '#sbOil, #schedBoard .daybar-h.on',
  },
  slot: {
    open: async s => { await go(s, 'editsched'); await wait(s, 600); await hit(s, vis(s, '.page.on [data-fill="a:0.0.+"]').first(), 700) },
    state: armNow, ring: '.page.on .armed',
  },
  logic: {
    open: async (s, k) => { await go(s, 'logic'); await wait(s, 600); FACT(`${k}.valueBefore`, await valOf(s, '.page.on .lgval, .page.on input.lgin[data-lgset="crewRest"]')); await hit(s, '#lgEdit', 700); FACT(`${k}.crewRestBefore`, await lgVal(s)); const r = vis(s, '.page.on input.lgin[data-lgset="crewRest"]').first(); await r.scrollIntoViewIfNeeded(); if (s.desk) await r.click(); else await r.tap(); await s.page.keyboard.press(s.desk ? 'Control+a' : 'Meta+a'); if (!s.desk) await r.evaluate(e => e.select()); await s.page.keyboard.type('13h'); await wait(s, 300) },
    state: async s => ({ mode: await lgMode(s), crewRest: await lgVal(s), focus: await s.page.evaluate(() => document.activeElement?.dataset?.lgset || document.activeElement?.tagName) }), ring: '.page.on input.lgin[data-lgset="crewRest"]',
  },
  quals: {
    open: async (s, k) => { await go(s, 'quals'); await wait(s, 600); await hit(s, '#qEdit', 700); const q = await qualCell(s); s.q = q; FACT(`${k}.cell`, { cell: q, before: await qualGlyph(s, q) }); await hit(s, `.page.on td.qcell[data-q="${q}"]`, 600) },
    state: async s => ({ mode: await qMode(s), cell: s.q, glyph: s.q ? await qualGlyph(s, s.q) : null }), ring: null,
  },
}
async function readBack(s, key, k, where) {
  /* the same page, read: for logic and quals the page is opened again by its tab if another page is in front */
  if (key === 'logic') { if ((await pageOn(s)) !== 'page-logic') await go(s, 'logic'); await wait(s, 500); FACT(`${k}.${where}`, { squadron: await barSq(s), mode: await lgMode(s), crewRest: (await lgVal(s)) ?? (await s.page.evaluate(() => { const m = (document.querySelector('.page.on')?.innerText || '').match(/Crew rest[^\n]*(\n[^\n]*){0,2}/); return m ? m[0].replace(/\s+/g, ' ').slice(0, 80) : 'no Crew rest line' })) }) }
  if (key === 'quals') { if ((await pageOn(s)) !== 'page-quals') await go(s, 'quals'); await wait(s, 500); FACT(`${k}.${where}`, { squadron: await barSq(s), mode: await qMode(s), glyph: await qualGlyph(s, s.q) }) }
  if (key === 'slot') { if ((await pageOn(s)) !== 'page-editsched' && where !== 'inMemberView') await go(s, 'editsched'); await wait(s, 500); FACT(`${k}.${where}`, { squadron: await barSq(s), page: await pageOn(s), ...(await armNow(s)) }) }
  if (key === 'oilearn') FACT(`${k}.${where}`, { squadron: await barSq(s), page: await pageOn(s), ...(await oilNow(s)) })
}
async function one(key, action) {
  const c = C[key], k = `P1.modes.${T}.${key}.${action}`, P = `p1-modes-${key}-${T}`
  const s = await mk(SZ)
  try {
    await signIn(s, 'ad', 'a')
    try { await c.open(s, k) } catch (e) { FACT(`${k}.opened`, 'could not open by presses: ' + String(e).split('\n')[0].slice(0, 140)); return }
    const ctl = {}
    for (const sel of ['#sqnMenuBtn', '#burger', '#roleBadge', '#notifyBell']) ctl[sel] = (await boxOf(s, sel)) ? await covered(s, sel) : 'not drawn'
    FACT(`${k}.opened`, { state: await c.state(s), page: await pageOn(s), notes: await notesNow(s), controls: ctl })
    if (action === 'pick') await decide(s, `${P}-1-mode-on`, c.ring || (s.q ? `.page.on td.qcell[data-q="${s.q}"]` : null), null)
    const sq0 = await barSq(s), r0 = await roleNow(s)
    const did = action === 'pick' ? await reachPick(s, 149, 'bar') : action === 'pickmenu' ? await reachPick(s, 149, 'menu') : await reachView(s)
    FACT(`${k}.press`, did)
    if (!did.pressed) { if (action === 'pick') await decide(s, `${P}-2-bar-covered`, ['#sqnMenuBtn', '#burger'], null); return }
    await wait(s, 900)
    const r1 = await roleNow(s)
    FACT(`${k}.after`, { squadron: { before: sq0, after: await barSq(s) }, role: { before: r0.badge || r0.menuLine, after: r1.badge || r1.menuLine }, page: await pageOn(s), state: await c.state(s), windows: (await windowsNow(s)).map(w => w.what + ': ' + w.words.slice(0, 90)), notes: await notesNow(s), question: await askNow(s) })
    if (action === 'pick') await decide(s, `${P}-2-after-pick`, c.ring || (s.q ? `.page.on td.qcell[data-q="${s.q}"]` : ['.topbar .mark']), null)
    else if (action === 'view' && (key === 'quals' || key === 'logic')) await decide(s, `${P}-2-after-view`, key === 'quals' ? ['#qSave', `.page.on td.qcell[data-q="${s.q}"]`] : ['#lgEdit', '#lgDone', '#roleBadge'], null)
    else await scratch(s, `${P}-${action}-after`)
    if (await askNow(s)) return
    if (action === 'view') { await readBack(s, key, k, 'inMemberView'); const b = await reachView(s); FACT(`${k}.backToAdmin.press`, { pressed: !!b.pressed }); await wait(s, 700); await readBack(s, key, k, 'backInAdminView') }
    else { await readBack(s, key, k, 'on149'); const b = await reachPick(s, 142, action === 'pickmenu' ? 'menu' : 'bar'); FACT(`${k}.back142.press`, { pressed: !!b.pressed }); await wait(s, 800); await readBack(s, key, k, 'back142') }
    if (action === 'pick') await scratch(s, `${P}-3-back142`)
  } catch (e) { FACT(`${k}.error`, String(e).split('\n')[0].slice(0, 180)) } finally { await s.ctx.close().catch(() => {}) }
}
try {
  console.log('p1-modes v1', SZ)
  for (const key of (ONLY.length ? ONLY : Object.keys(C))) { note(`== ${key}`); for (const a of (SZ === 'd' ? ['pick', 'view'] : ['pick', 'pickmenu', 'view'])) await one(key, a) }
} catch (e) { console.error('FAILED', String(e).split('\n')[0]); process.exitCode = 1 } finally { await closeAll() }
