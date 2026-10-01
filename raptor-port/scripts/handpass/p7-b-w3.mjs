/* [DB-READINESS] group A phase 7 — the FULL check's walk, WALKER B, part 3 (1 Oct 26): B36, ONE COMPOUND DAY
   (Astra's scenario 36). Saturday 18 Jul, built through the app's own controls: a new sim row with a man on its SECOND
   spare seat (the padded list), a second sim row with a man on its FIRST spare (the comparison), a member's Personal
   request row with ALL AVAIL in its extras, an OIL decision (OIL Earn, one man tapped off); then Publish, Unpublish,
   Publish again — a reload after each: the same seats, crowd, decisions and versions, on screen and in the stored rows;
   and what the Leave War grid says for the men (the second-spare man earns as the first-spare man does).
   Env: HP_URL, HP_SHOTS, HP_OUT, HP_TAG=p7. */
import { boot, fact, facts, fileTimed, oilButton, oilPucks, oilTap, oilIsOn } from './p6-lib.mjs'
import * as S from './seat-lib.mjs'
import * as A from './p7-a-lib.mjs'
import * as B from './p7-b-lib.mjs'
import { lwCell } from './lib.mjs'
const { L, W } = await boot()
const { browser, p, errors } = await B.world(L)
await W.toastSpy(p)
const SAT = 5, ISO = '2026-07-18'
const pics = []
const pic = async (name, o) => { await L.shot(p, name, o || {}); pics.push(name + '.png'); return name + '.png' }
const try_ = async (name, fn) => { try { return await fn() } catch (e) { L.check(`${name} — the step ran`, false, String(e && e.stack || e).slice(0, 900)); await pic(`${name}-X-error`).catch(() => {}); return null } }
const seats = async (key) => p.evaluate(k => {
  const z = document.querySelector(`#schedBoard [data-fill="${k}.+"]`); if (!z) return null
  return [...z.querySelectorAll('[data-slot]')].map(e => { const pk = e.querySelector('[data-person]'); return { slot: e.dataset.slot.slice(k.length + 1), who: pk ? pk.dataset.person : null, empty: e.classList.contains('empty') } })
}, key)
const Sx = ss => (ss || []).map(s => `${s.slot}:${s.who || (s.empty ? '+' : '?')}`).join(' ')
const focusRow = async (key) => { await p.evaluate(k => { const z = document.querySelector(`#schedBoard [data-fill="${k}.+"]`); if (z) z.scrollIntoView({ block: 'center' }) }, key); await B.sleep(250) }
const addOft = async (label, str, end) => {
  const add = p.locator(`#schedBoard [data-sradd="${SAT}.oft"]:visible`).first()
  await add.evaluate(e => e.scrollIntoView({ block: 'center' })); await add.click(); await B.sleep(500)
  const ri = (await B.simModel(p, SAT)).oft.length - 1
  await W.boardText(p, `sr:${SAT}.oft.${ri}.label`, label); await W.boardText(p, `sr:${SAT}.oft.${ri}.str`, str); await W.boardText(p, `sr:${SAT}.oft.${ri}.end`, end)
  return ri
}
/* everything B36 promises stays the same, read off the screen (the board open on Saturday) and the stored rows */
let iid = null
const snapshot = async (tag) => {
  await W.boardOn(p, SAT)
  const o = {}
  o.head = await W.head(p, SAT)
  o.ep9 = Sx(await seats(`s:${SAT}.oft.0`)); o.ep10 = Sx(await seats(`s:${SAT}.oft.1`))
  const ri = await A.rowIdx(p, SAT, iid)
  o.personalRow = await p.evaluate(([d, r]) => { const g = window.DAYS[d].ground[r]; return g ? { who: g.who, more: g.more || [], str: g.str, end: g.end } : null }, [SAT, ri])
  const ch = await A.chips(p, '#schedBoard', iid); o.chip = Array.isArray(ch) ? ch.map(c => c.txt).join(',') : String(ch)
  const w = await A.openChip(p, '#schedBoard', iid); o.crowd = w.open ? { n: w.n, from: w.from, ids: w.ids.slice().sort().join(',') } : w; await A.closeWin(p)
  /* the decisions as OIL Earn draws them */
  if (!(await oilIsOn(p))) await oilButton(L, p)
  o.oilPucks = (await oilPucks(p)).filter(x => /^r:/.test(x.item || '')).map(x => `${x.who}:${x.on ? 'on' : 'off'}`).sort().join(' ')
  await focusRow(`s:${SAT}.oft.0`).catch(() => {})
  await p.evaluate(() => { const e = [...document.querySelectorAll('#schedBoard .sb-panel.simr')].find(x => x.offsetParent !== null); if (e) e.scrollIntoView({ block: 'center' }) }); await B.sleep(250)
  await pic(`B36-${tag}-oil-earn-sims`)
  if (await oilIsOn(p)) await oilButton(L, p)
  o.oild = await p.evaluate(d => JSON.stringify(window.DAYS[d].oild || null), SAT)
  const t = await B.storedDay(p, SAT); const j = t ? JSON.parse(t) : null
  o.stored = j ? { more: j.d.sims.oft.map(r => `${r.label}:${JSON.stringify(r.more || null)}`).join(' '), oild: JSON.stringify(j.d.oild || null), nulls: B.nulls(j.d.sims).length, personal: JSON.stringify((j.d.ground || []).filter(g => g.src === iid).map(g => ({ who: g.who, more: g.more }))) } : null
  o.weekRows = Object.keys(await L.rows(p)).filter(k => k.startsWith('weeks/')).sort().join(' ')
  o.versions = await p.evaluate(d => { try { return JSON.stringify((window.SCHED.days || window.SCHED)[d] ? Object.keys((window.SCHED.days || window.SCHED)[d]) : Object.keys(window.SCHED)) } catch (e) { return 'n/a' } }, SAT)
  fact(`B36.${tag}`, o)
  return o
}
const same = (a, b, keys) => keys.filter(k => JSON.stringify(a[k]) !== JSON.stringify(b[k]))
const KEYS = ['head', 'ep9', 'ep10', 'personalRow', 'chip', 'crowd', 'oilPucks', 'oild', 'stored', 'weekRows']
const leaveWar = async (tag) => {
  const c = await lwCell(p, ['mamba', 'pump', 'drill', 'prowler', 'slash', 'glass', 'bane', 'shaft'], ISO)
  await pic(`B36-${tag}-leave-war`)
  fact(`B36.${tag}.leavewar`, c)
  await L.go(p, 'editsched')
  return c
}
const out = {}

await try_('B36-build', async () => {
  iid = await fileTimed(L, p, { person: 'bane', type: 'Personal', iso: ISO, from: '10:00', to: '11:00', remarks: 'P7 B36' })
  fact('B36.req', await A.reqOf(p, iid))
  await W.boardOn(p, SAT)
  const r0 = await addOft('EP-9', '09:00', '11:00'); const r1 = await addOft('EP-10', '13:00', '15:00')
  const K0 = `s:${SAT}.oft.${r0}`, K1 = `s:${SAT}.oft.${r1}`
  const puts = []
  for (const [k, who] of [[`${K0}.p`, 'prowler'], [`${K0}.w`, 'drill'], [`${K1}.p`, 'slash'], [`${K1}.w`, 'glass']]) puts.push({ k, who, ...(await S.handPut(p, k, who)) })
  const pair = await seats(K0)
  L.check('B36 the new sim row with both seats filled offers a spare pair', !!pair && pair.filter(s => s.empty).map(s => s.slot).join(',') === 'x0,x1', Sx(pair))
  puts.push({ k: `${K0}.x1`, who: 'mamba', ...(await S.handPut(p, `${K0}.x1`, 'mamba')) })   /* the SECOND spare */
  puts.push({ k: `${K1}.x0`, who: 'pump', ...(await S.handPut(p, `${K1}.x0`, 'pump')) })     /* the FIRST spare, for comparison */
  fact('B36.puts', puts.map(x => ({ k: x.k, who: x.who, took: x.took, msg: x.msg })))
  L.check('B36 every man was taken by his seat', puts.every(x => x.took), puts.filter(x => !x.took))
  const ri = await A.rowIdx(p, SAT, iid)
  const pl = await A.place(S, p, SAT, ri, 'extras', 'allavail'); fact('B36.placeholder', pl)
  L.check('B36 ALL AVAIL placed in the extras of the Personal row', pl.took, pl)
  const st = JSON.parse(await B.storedDay(p, SAT))
  out.more = st.d.sims.oft.map(r => `${r.label}: ${JSON.stringify(r.more)}`)
  L.check('B36 stored: EP-9 more = ["","mamba"], EP-10 more = ["pump"], no null in the sims', JSON.stringify(st.d.sims.oft[r0].more) === '["","mamba"]' && JSON.stringify(st.d.sims.oft[r1].more) === '["pump"]' && B.nulls(st.d.sims).length === 0, out.more)
  await focusRow(K0); await pic('B36-0-sat-board-built')
  /* the OIL decision: OIL Earn on, Ledger (EP-9, second seat) tapped off */
  fact('B36.oilButton', await oilButton(L, p))
  const pk = await oilPucks(p); fact('B36.oilPucks.before', pk)
  out.earnBefore = pk.filter(x => ['mamba', 'pump', 'drill', 'prowler', 'slash', 'glass', 'bane'].includes(x.who)).map(x => `${x.who}:${x.on ? 'on' : 'off'}@${x.item}`)
  const mine = pk.find(x => x.who === 'drill')
  L.check('B36 OIL Earn: Sidewinder (second spare) has an earning puck, on — as Piston (first spare) has', !!pk.find(x => x.who === 'mamba' && x.on) && !!pk.find(x => x.who === 'pump' && x.on), out.earnBefore)
  fact('B36.tapOff', mine ? await oilTap(L, p, 'drill', mine.item) : 'Ledger has no earning puck')
  const pk2 = await oilPucks(p)
  out.earnAfter = pk2.filter(x => ['mamba', 'pump', 'drill', 'prowler', 'slash', 'glass'].includes(x.who)).map(x => `${x.who}:${x.on ? 'on' : 'off'}`)
  L.check('B36 OIL Earn: Ledger reads off after the tap, the others still on', !!pk2.find(x => x.who === 'drill' && !x.on) && !!pk2.find(x => x.who === 'mamba' && x.on), out.earnAfter)
  out.oild = await p.evaluate(d => JSON.stringify(window.DAYS[d].oild || null), SAT)
  fact('B36.oild', out.oild); fact('B36.toasts', await W.toasts(p))
  await pic('B36-1-sat-oil-earn-ledger-off')
  await oilButton(L, p)
})

/* built → reload */
const s0 = await try_('B36-s0', () => snapshot('1-built'))
await try_('B36-r0', async () => { await W.boardOff(p); await L.reloadCompare(p, 'B36 reload (built, not published)', 'a', { page: 'editsched' }); await W.toastSpy(p) })
const s0r = await try_('B36-s0r', () => snapshot('2-built-reloaded'))
if (s0 && s0r) L.check('B36 built → reload: the same seats, crowd, decisions on screen and stored', same(s0, s0r, KEYS).length === 0, same(s0, s0r, KEYS).map(k => `${k}: ${JSON.stringify(s0[k])} → ${JSON.stringify(s0r[k])}`))

/* publish → reload */
await try_('B36-pub1', async () => { await W.boardOn(p, SAT); await p.evaluate(() => window.scrollTo(0, 0)); out.pub1 = { sign: await W.signDay(p, SAT), pub: await W.publishDay(p, SAT), toasts: await W.toasts(p) }; fact('B36.pub1', out.pub1); await L.settle(p); await pic('B36-3-sat-published') })
const s1 = await try_('B36-s1', () => snapshot('3-published'))
out.lw1 = await try_('B36-lw1', () => leaveWar('4-published'))
await try_('B36-r1', async () => { await W.boardOff(p); await L.reloadCompare(p, 'B36 reload (published)', 'a', { page: 'editsched' }); await W.toastSpy(p) })
const s1r = await try_('B36-s1r', () => snapshot('5-published-reloaded'))
if (s1 && s1r) L.check('B36 published → reload: the same seats, crowd, decisions, version on screen and stored', same(s1, s1r, KEYS).length === 0, same(s1, s1r, KEYS).map(k => `${k}: ${JSON.stringify(s1[k])} → ${JSON.stringify(s1r[k])}`))
if (s0 && s1) L.check('B36 publication changed no seat, crowd or decision', same(s0, s1, ['ep9', 'ep10', 'personalRow', 'chip', 'oilPucks', 'oild']).length === 0, same(s0, s1, ['ep9', 'ep10', 'personalRow', 'chip', 'oilPucks', 'oild']).map(k => `${k}: ${JSON.stringify(s0[k])} → ${JSON.stringify(s1[k])}`))
if (out.lw1) {
  const t = x => (x && x.text) || String(x)
  L.check('B36 Leave War after publication: Sidewinder (second spare) is credited as Piston (first spare) is; Ledger (tapped off) is not', t(out.lw1.Sidewinder) === t(out.lw1.Piston) && /[FH]O/.test(t(out.lw1.Sidewinder)) && !/[FH]O/.test(t(out.lw1.Ledger)), out.lw1)
}
/* the issued face */
await try_('B36-view', async () => {
  await W.boardOff(p); await L.go(p, 'viewsched'); await W.showDay(p, SAT, '#vWeek')
  out.view = await p.evaluate(d => { const day = document.querySelector(`#vWeek .day[data-day="${d}"]`); if (!day) return null
    const sel = day.querySelector('select'); const leaf = [...day.querySelectorAll('*')].find(e => e.children.length === 0 && (e.textContent || '').trim() === 'EP-9')
    let r = leaf; for (let i = 0; i < 6 && r && !r.querySelector('[data-person]'); i++) r = r.parentElement
    if (leaf) leaf.scrollIntoView({ block: 'center', inline: 'nearest' })
    return { tag: (day.querySelector('.verchip') || {}).innerText, versions: sel ? [...sel.options].map(o => o.text) : null, ep9: r ? [...r.querySelectorAll('[data-person]')].map(e => e.dataset.person).join(',') : null, chips: [...day.querySelectorAll('.oilcount')].map(c => c.innerText.trim() + ' | ' + (c.getAttribute('title') || '').slice(0, 90)) } }, SAT)
  fact('B36.view', out.view); await B.sleep(250); await pic('B36-6-viewsched-sat-issued')
  L.check('B36 View-only Sched (issued): EP-9 shows Hunter, Ledger and Sidewinder', !!out.view && out.view.ep9 === 'prowler,drill,mamba', out.view)
})

/* unpublish → reload */
await try_('B36-unpub', async () => { await W.boardOn(p, SAT); await p.evaluate(() => window.scrollTo(0, 0)); out.unpub = { did: await W.unpublish(p, SAT), toasts: await W.toasts(p) }; fact('B36.unpub', out.unpub); await L.settle(p); await pic('B36-7-sat-unpublished') })
const s2 = await try_('B36-s2', () => snapshot('8-unpublished'))
out.lw2 = await try_('B36-lw2', () => leaveWar('9-unpublished'))
await try_('B36-r2', async () => { await W.boardOff(p); await L.reloadCompare(p, 'B36 reload (unpublished)', 'a', { page: 'editsched' }); await W.toastSpy(p) })
const s2r = await try_('B36-s2r', () => snapshot('10-unpublished-reloaded'))
if (s2 && s2r) L.check('B36 unpublished → reload: the same on screen and stored', same(s2, s2r, KEYS).length === 0, same(s2, s2r, KEYS).map(k => `${k}: ${JSON.stringify(s2[k])} → ${JSON.stringify(s2r[k])}`))
if (s0 && s2) L.check('B36 Unpublish changed no seat, crowd or decision', same(s0, s2, ['ep9', 'ep10', 'personalRow', 'chip', 'oilPucks', 'oild']).length === 0, same(s0, s2, ['ep9', 'ep10', 'personalRow', 'chip', 'oilPucks', 'oild']).map(k => `${k}: ${JSON.stringify(s0[k])} → ${JSON.stringify(s2[k])}`))

/* publish again → reload */
await try_('B36-pub2', async () => {
  await W.boardOn(p, SAT); await p.evaluate(() => window.scrollTo(0, 0))
  const h = await W.head(p, SAT)
  out.pub2 = { headBefore: h, sign: await W.signDay(p, SAT) }
  let r = await W.publishDay(p, SAT); if (!r.pressed) r = await W.publishAL(p, SAT)
  out.pub2.pub = r; out.pub2.toasts = await W.toasts(p); fact('B36.pub2', out.pub2); await L.settle(p); await pic('B36-11-sat-published-again')
})
const s3 = await try_('B36-s3', () => snapshot('12-published-again'))
out.lw3 = await try_('B36-lw3', () => leaveWar('13-published-again'))
await try_('B36-r3', async () => { await W.boardOff(p); await L.reloadCompare(p, 'B36 reload (published again)', 'a', { page: 'editsched' }); await W.toastSpy(p) })
const s3r = await try_('B36-s3r', () => snapshot('14-published-again-reloaded'))
if (s3 && s3r) L.check('B36 published again → reload: the same on screen and stored', same(s3, s3r, KEYS).length === 0, same(s3, s3r, KEYS).map(k => `${k}: ${JSON.stringify(s3[k])} → ${JSON.stringify(s3r[k])}`))
if (s0 && s3) L.check('B36 the second publication changed no seat, crowd or decision', same(s0, s3, ['ep9', 'ep10', 'personalRow', 'chip', 'oilPucks', 'oild']).length === 0, same(s0, s3, ['ep9', 'ep10', 'personalRow', 'chip', 'oilPucks', 'oild']).map(k => `${k}: ${JSON.stringify(s0[k])} → ${JSON.stringify(s3[k])}`))
if (out.lw1 && out.lw3) L.check('B36 Leave War after the second publication reads as after the first', JSON.stringify(out.lw1) === JSON.stringify(out.lw3), { first: out.lw1, again: out.lw3 })
/* every stored list, working and issued */
await try_('B36-lists', async () => {
  const rows = await L.rows(p), bad = [], padded = []
  const walk = (v, path, key) => { if (Array.isArray(v)) { v.forEach((x, i) => walk(x, `${path}[${i}]`, key)); return }
    if (v && typeof v === 'object') for (const k of Object.keys(v)) { if ((k === 'more' || k === 'pax') && Array.isArray(v[k])) { if (!v[k].every(x => typeof x === 'string')) bad.push(`${key} ${path}.${k} = ${JSON.stringify(v[k])}`); if (v[k].includes('mamba')) padded.push(`${key} ${path}.${k} = ${JSON.stringify(v[k])}`) } walk(v[k], path ? `${path}.${k}` : k, key) } }
  for (const [k, t] of Object.entries(rows)) { if (!k.startsWith('weeks/')) continue; try { walk(JSON.parse(t), '', k) } catch (e) {} }
  out.padded = padded; out.bad = bad; fact('B36.lists', { padded, bad })
  L.check('B36 every stored `more` / `pax` list (the working day and each issued version) is text only; the padded one reads ["","mamba"] everywhere', bad.length === 0 && padded.length >= 2 && padded.every(x => x.endsWith('["","mamba"]')), { padded, bad })
})

const okAll = L.results.every(r => r.ok)
const table = [{ id: 'B36', did: 'Saturday 18 Jul. Inputs page: a timed Personal request for Ranger (10:00–11:00). Board: + Row twice in the OFT sims (EP-9 09:00–11:00 with Hunter / Ledger and Sidewinder on the SECOND spare; EP-10 13:00–15:00 with Blade / Basher and Piston on the FIRST spare); ALL AVAIL in the extras of the Personal row; OIL Earn on, Ledger tapped off, OIL Earn off. Then: reload; four boxes + Publish day; Leave War; reload; View-only Sched; Unpublish; Leave War; reload; four boxes + publish again; Leave War; reload',
  screen: `built: EP-9 ${s0 && s0.ep9} · EP-10 ${s0 && s0.ep10} · the Personal row's count ${s0 && s0.chip}, window lists ${s0 && s0.crowd && s0.crowd.n} · OIL Earn ${s0 && s0.oilPucks}. Heads: built ${s0 && s0.head && s0.head.tag}/${s0 && s0.head && s0.head.pending} → published ${s1 && s1.head && s1.head.tag}/${s1 && s1.head && s1.head.pending} → unpublished ${s2 && s2.head && s2.head.tag}/${s2 && s2.head && s2.head.pending} → again ${s3 && s3.head && s3.head.tag}/${s3 && s3.head && s3.head.pending}. Leave War 18 Jul: published ${JSON.stringify(out.lw1)}; unpublished ${JSON.stringify(out.lw2)}; again ${JSON.stringify(out.lw3)}. View-only Sched: ${JSON.stringify(out.view)}`,
  stored: `sims ${s0 && s0.stored && s0.stored.more}; decisions ${s0 && s0.stored && s0.stored.oild}; the Personal row ${s0 && s0.stored && s0.stored.personal}; week rows built: ${s0 && s0.weekRows}; published: ${s1 && s1.weekRows}; unpublished: ${s2 && s2.weekRows}; again: ${s3 && s3.weekRows}; padded lists: ${JSON.stringify(out.padded)}; not text: ${JSON.stringify(out.bad)}`,
  verdict: okAll ? 'PASS' : 'FAIL', pics }]
fact('errors', errors)
B.saveSection('w3-compound-saturday', { table, checks: L.results, facts, errors, pics, out })
console.log(`\n${L.results.filter(r => r.ok).length}/${L.results.length} checks passed; errors: ${errors.length}`, errors)
await browser.close()
