/* [DB-READINESS] phase 7 walk — walker C, C33: THE NAME BOX OF ANOTHER MAN'S REQUEST ROW — a picture for the owner,
   not a pass/fail. Ranger files Training on Sat 18 Jul 08:00–16:00, answers YES to the OIL question; it lands on the
   Ground Programme with Ranger in the row's name box. Three worlds, each fresh:
     N1  a DIFFERENT man (Blade) dragged from the crew list onto the name box;
     N2  the name box emptied (right-click on Ranger's puck), then "+ add" armed and Blade tapped in the crew list;
     X1  Blade added to the EXTRAS under the row, Ranger left in the name box (D18: the second man earns).
   In each: who shows on the row, what the Inputs page says, OIL Earn (each man's puck and its words), then the four
   sign-offs, Publish day, and each man's Leave War box for 18 Jul. Pictures at 2x so the owner can read them. */
import { boot, fileTimed, oilButton, TODAY } from './p6-lib.mjs'
import * as C from './p7-c-lib.mjs'
const { L, W } = await boot()
const W2 = await import('./dbrA-W2-lib.mjs')
const SAT = 5, ISO = '2026-07-18', RANGER = 'bane'
const VARIANT = process.env.P7_VARIANT || 'N1'
const browser = await L.launch()
const ctx = await browser.newContext({ viewport: L.DESK, deviceScaleFactor: 2 })
await ctx.clock.setFixedTime(TODAY)
const errors = []
const p = await L.page(ctx, errors)
await L.signIn(p, 'a')
await C.toastSpy(p)
const BLADE = await p.evaluate(() => Object.keys(window.PEOPLE).find(k => window.PEOPLE[k].cs === 'Blade'))
const cs = id => p.evaluate(i => (window.PEOPLE[i] && window.PEOPLE[i].cs) || i || '(nobody)', id)
const T = `C33-${VARIANT}`
const pics = []
const pic = async (n, opts = {}) => { await L.shot(p, n, opts); pics.push(n + '.png'); return n + '.png' }
const facts = {}
const fact = (k, v) => { facts[k] = v; console.log(`FACT ${k} = ${JSON.stringify(v).slice(0, 700)}`) }

/* the Ground Programme and Personal Inputs cards of the open board, as one cropped picture */
const CARDS = `(() => {
  const vis = e => !!e && e.getClientRects().length > 0
  const row = [...document.querySelectorAll('#schedBoard .sb-arow.gr-frominput')].find(vis)
  const inp = [...document.querySelectorAll('#schedBoard .sb-arow.inprow')].find(vis)
  const card = e => e ? (e.closest('.sb-sec') || e.parentElement.parentElement) : null
  const heads = [...document.querySelectorAll('#schedBoard .sb-sec')].filter(vis)
  const pi = card(inp) || heads.find(s => /^\W*personal inputs/i.test(s.textContent || ''))
  return { row, inp, g: card(row), pi }
})()`
async function cropRow(name) {
  await p.evaluate(C => { const { g } = eval(C); if (g) { g.scrollIntoView({ block: 'start' }); const sc = [...document.querySelectorAll('#schedBoard *')].find(e => e.scrollTop > 0 && e.contains(g)); if (sc) sc.scrollTop -= 150; else window.scrollBy(0, -150) } }, CARDS)
  await L.sleep(400)
  const r = await p.evaluate(C => {
    const { g, pi } = eval(C); if (!g) return null
    const a = g.getBoundingClientRect(), b = pi ? pi.getBoundingClientRect() : a
    const top = Math.max(0, Math.min(a.top, b.top) - 8), bottom = Math.min(innerHeight, Math.max(a.bottom, b.bottom) + 8)
    return { x: Math.max(0, a.left - 8), y: top, width: a.width + 16, height: bottom - top }
  }, CARDS)
  if (!r) { await L.shot(p, name); pics.push(name + '.png'); return 'no ground row found — whole window' }
  await L.shot(p, name, { clip: r }); pics.push(name + '.png')
  return r
}
/* every puck drawn on the request's Ground Programme row and on its Personal Inputs card on the open board */
const rowPucks = () => p.evaluate(C => {
  const { row, inp } = eval(C)
  const out = []
  for (const [where, r] of [['Ground Programme row', row], ['Personal Inputs card', inp]]) {
    if (!r) continue
    for (const pk of r.querySelectorAll('.puck[data-person]')) {
      const host = pk.closest('[data-oilp]') || pk.closest('.seat') || pk
      out.push({ where, who: (window.PEOPLE[pk.dataset.person] || {}).cs || pk.dataset.person,
        words: (host.innerText || '').replace(/s+/g, ' ').trim(), title: host.getAttribute('title') || pk.getAttribute('title') || '', puckTitle: pk.getAttribute('title') || '',
        cls: (host === pk ? '' : host.className + ' | ') + pk.className, opacity: getComputedStyle(pk).opacity, filter: getComputedStyle(pk).filter,
        earnsSwitch: host.dataset.oilp ? (host.classList.contains('on') ? 'on' : 'off') : 'none (no OIL switch on this puck)' })
    }
    const item = r.querySelector('.oilitem'); if (item) out.push({ where, who: '(the row itself)', words: (item.innerText || '').trim(), title: item.getAttribute('title') || '', cls: item.className })
  }
  return out
}, CARDS)
const groundRow = iid => p.evaluate(i => { const r = (window.DAYS[5].ground || []).find(x => x.src === i); return r ? { prog: r.prog, who: r.who, more: r.more || [], str: r.str, end: r.end, src: r.src } : null }, iid)

/* ---------- 1. the request, through the Inputs page's own form ---------- */
const iid = await fileTimed(L, p, { person: RANGER, type: 'Training', iso: ISO, from: '08:00', to: '16:00', remarks: 'P7 NAME BOX' })
await L.settle(p)
const req0 = await p.evaluate(i => { const x = window.INPUTS.find(r => r.iid === i); return x ? { person: x.person, type: x.type, date: x.date, oil: x.oil, acc: x.acc } : null }, iid)
fact('filed', req0)
await W2.inputsAll(p)
fact('inputs.row.before', await W2.rowText(p, iid))
await p.locator(`#inBody tr[data-iid="${iid}"]`).first().evaluate(e => e.scrollIntoView({ block: 'center' })).catch(() => {})
await pic(`${T}-01-inputs-filed`)
await W.boardOn(p, SAT)
const ri = await p.evaluate(i => window.DAYS[5].ground.findIndex(r => r.src === i), iid)
fact('row.before', await groundRow(iid))
fact('pucks.before', await rowPucks())
await cropRow(`${T}-02-row-as-filed`)

/* ---------- 2. the scheduler's gesture ---------- */
let did = ''
if (VARIANT === 'N1') {
  /* (a) the tap-arm way first: a tap on the name box, then a tap on Blade in the crew list */
  const seat = p.locator(`#schedBoard [data-slot="g:5.${ri}"]:visible`).first()
  await seat.evaluate(e => e.scrollIntoView({ block: 'center' })); await L.sleep(200)
  await seat.click(); await L.sleep(300)
  const armed = await p.evaluate(() => window.armedKey())
  await p.locator(`#sbRoster .rpuck[data-person="${BLADE}"]:visible`).first().click(); await L.sleep(500)
  fact('tapArm', { armedAfterTapOnNameBox: armed || '(nothing armed — the tap selected Ranger\'s puck)', rowAfterTappingBlade: await groundRow(iid), toasts: await C.toasts(p) })
  await pic(`${T}-03-tap-name-box-then-blade`)
  await p.keyboard.press('Escape'); await L.sleep(200)
  /* clear the highlight the two taps left (a tap on a puck selects it; the same tap again lets go) */
  for (let i = 0; i < 2; i++) { const sel = p.locator('#schedBoard .puck.sel:visible').first(); if (await sel.count()) { await sel.click(); await L.sleep(250) } }
  /* (b) the drag */
  await C.toastGone(p); await C.toasts(p)
  await W.drag(p, p.locator(`#sbRoster .rpuck[data-person="${BLADE}"]:visible`).first(), p.locator(`#schedBoard [data-slot="g:5.${ri}"]:visible`).first())
  did = 'Blade dragged from the crew list onto the row\'s name box (it held Ranger)'
} else if (VARIANT === 'N2') {
  const pk = p.locator(`#schedBoard [data-slot="g:5.${ri}"] .puck:visible`).first()
  await pk.evaluate(e => e.scrollIntoView({ block: 'center' })); await L.sleep(200)
  await pk.click({ button: 'right' }); await L.sleep(600)
  fact('afterRemove', { row: await groundRow(iid), toasts: await C.toasts(p), request: await p.evaluate(i => { const x = window.INPUTS.find(r => r.iid === i); return x ? { person: x.person, acc: x.acc } : '(gone)' }, iid) })
  await cropRow(`${T}-03-ranger-taken-off`)
  const z = p.locator(`#schedBoard [data-fill="g:5.${ri}.+"]:visible`).first()
  if (await z.count()) { await z.click(); await L.sleep(300); fact('armed', await p.evaluate(() => window.armedKey()))
    await p.locator(`#sbRoster .rpuck[data-person="${BLADE}"]:visible`).first().click(); await L.sleep(500); await p.keyboard.press('Escape'); await L.sleep(200) }
  else fact('armed', 'NO + add ON THE ROW (the row went with its man?)')
  did = 'Ranger taken off the name box (right-click on his puck), the row\'s "+ add" tapped, Blade tapped in the crew list'
} else {
  const z = p.locator(`#schedBoard [data-fill="g:5.${ri}.+"]:visible`).first()
  await z.evaluate(e => e.scrollIntoView({ block: 'center' })); await L.sleep(200)
  await z.locator('.addz').first().click().catch(async () => { await z.click() }); await L.sleep(300)
  fact('armed', await p.evaluate(() => window.armedKey()))
  await p.locator(`#sbRoster .rpuck[data-person="${BLADE}"]:visible`).first().click(); await L.sleep(500); await p.keyboard.press('Escape'); await L.sleep(200)
  did = 'the row\'s "+ add" tapped, Blade tapped in the crew list (Ranger stays in the name box, Blade in the extras)'
}
await L.settle(p)
const ts = await C.toasts(p)
const row1 = await groundRow(iid)
fact('gesture.toasts', ts)
fact('row.after', row1)
fact('row.after.names', row1 ? { nameBox: await cs(row1.who), extras: await Promise.all((row1.more || []).map(cs)) } : null)
fact('pucks.after', await rowPucks())
await cropRow(`${T}-04-row-after`)
const req1 = await p.evaluate(i => { const x = window.INPUTS.find(r => r.iid === i); return x ? { person: x.person, type: x.type, date: x.date, oil: x.oil, acc: x.acc } : '(gone)' }, iid)
fact('request.after', req1)

/* ---------- 3. the Inputs page ---------- */
await W.boardOff(p)
await W2.inputsAll(p)
fact('inputs.row.after', await W2.rowText(p, iid))
await p.locator(`#inBody tr[data-iid="${iid}"]`).first().evaluate(e => e.scrollIntoView({ block: 'center' })).catch(() => {})
await pic(`${T}-05-inputs-after`)

/* ---------- 4. OIL Earn on the Saturday board ---------- */
await W.boardOn(p, SAT)
fact('oil.button', await oilButton(L, p))
await C.toastGone(p)
const oil = await rowPucks()
fact('oil.pucks', oil)
fact('oil.switches', await p.evaluate(() => [...document.querySelectorAll('#schedBoard [data-oilitem]')].filter(e => e.offsetParent !== null).map(e => ({ who: e.dataset.oilp ? (window.PEOPLE[e.dataset.oilp] || {}).cs : '(the item)', words: (e.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 40), title: e.title, on: e.classList.contains('on') }))))
await cropRow(`${T}-06-OIL-EARN-the-row`)
await pic(`${T}-07-OIL-EARN-whole-board`)
fact('oil.off', await oilButton(L, p))

/* ---------- 5. the four sign-offs, Publish day ---------- */
await p.evaluate(() => { const b = document.querySelector('#schedBoard'); const s = b && b.querySelector('select[data-sign]'); if (s) s.scrollIntoView({ block: 'center' }) }); await L.sleep(300)
fact('sign', await W.signDay(p, SAT)); fact('publish', await W.publishDay(p, SAT))
await L.settle(p)
fact('head', await W.head(p, SAT)); fact('publish.toasts', await C.toasts(p))
await pic(`${T}-08-saturday-published`)
fact('stored.day', await p.evaluate(() => { const v = localStorage.getItem('raptor:weeks/13-07-2026#5'); if (v == null) return 'no stored row for Saturday'; let d; try { d = JSON.parse(v) } catch (e) { return String(v).slice(0, 200) }
  const find = o => { if (!o || typeof o !== 'object') return null; if (Array.isArray(o.ground)) return o.ground; for (const k of Object.keys(o)) { const r = find(o[k]); if (r) return r } return null }
  const g = find(d); return g ? g.map(r => ({ prog: r.prog, who: (window.PEOPLE[r.who] || {}).cs || r.who, more: (r.more || []).map(x => (window.PEOPLE[x] || {}).cs || x), from: r.src ? 'the request' : '' })) : 'keys: ' + Object.keys(d).join(',') }))
fact('stored.issued', await p.evaluate(() => Object.keys(localStorage).filter(k => k.startsWith('raptor:weeks/13-07-2026') && (k.includes(':is:') || k.includes('#5'))).map(k => { let d; try { d = JSON.parse(localStorage.getItem(k)) } catch (e) { return k }
  const find = o => { if (!o || typeof o !== 'object') return null; if (Array.isArray(o.ground)) return o.ground; for (const kk of Object.keys(o)) { const r = find(o[kk]); if (r) return r } return null }
  const g = find(d); return k.slice(7) + ' → ' + (g ? g.map(r => r.prog + ':' + ((window.PEOPLE[r.who] || {}).cs || r.who) + (r.more && r.more.length ? '+' + r.more.map(x => (window.PEOPLE[x] || {}).cs || x).join('+') : '')).join(' | ') : '(no ground list)') })))
await W.boardOff(p)

/* ---------- 6. the Leave War: each man's box for Sat 18 Jul ---------- */
await L.go(p, 'leavewar'); await p.waitForSelector('[data-testid^="row-"]', { timeout: 15000 }); await L.sleep(900)
const mon = p.locator('[data-testid="month-JUL"]:visible').first(); if (await mon.count()) { await mon.click().catch(() => {}); await L.sleep(900) }
const cells = async () => p.evaluate(([ids, d]) => { const o = {}; for (const id of ids) { const c = document.querySelector(`[data-testid="cell-${id}-${d}"]`); o[(window.PEOPLE[id] || {}).cs || id] = c ? { text: (c.innerText || '').replace(/\s+/g, ' ').trim() || '(blank)', cls: String(c.className).trim(), title: c.getAttribute('title') || c.getAttribute('aria-label') || '' } : 'NO BOX DRAWN' } return o }, [[RANGER, BLADE], ISO])
const lw = await cells()
fact('leavewar', lw)
for (const [who, id] of [['ranger', RANGER], ['blade', BLADE]]) {
  const c = p.locator(`[data-testid="cell-${id}-${ISO}"]`).first()
  if (!(await c.count())) continue
  await c.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await L.sleep(400)
  await pic(`${T}-09-leavewar-${who}`)
  /* a tap on the box: what the war says about it */
  await c.click().catch(() => {}); await L.sleep(600)
  const sheet = await p.evaluate(() => { const d = [...document.querySelectorAll('.bidsheet[role="dialog"]')].filter(e => e.offsetWidth); const s = d[d.length - 1]; return s ? (s.getAttribute('data-testid') || '') + ': ' + (s.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 500) : 'nothing opened' })
  fact(`leavewar.tap.${who}`, sheet)
  if (sheet !== 'nothing opened') await pic(`${T}-10-leavewar-${who}-tapped`)
  for (let i = 0; i < 3; i++) { const x = p.locator('.bidsheet[role="dialog"] button.x:visible').last(); if (await x.count()) { await x.click().catch(() => {}); await L.sleep(300) } else { await p.keyboard.press('Escape'); await L.sleep(200); break } }
}

/* ---------- 7. a reload ---------- */
await L.reloadCompare(p, `${T} reload`, 'a', { page: 'leavewar' })
await p.waitForSelector('[data-testid^="row-"]', { timeout: 15000 }); await L.sleep(900)
if (await mon.count()) { await p.locator('[data-testid="month-JUL"]:visible').first().click().catch(() => {}); await L.sleep(900) }
const lw2 = await cells()
fact('leavewar.afterReload', lw2)
const rr = L.results.filter(r => r.name.startsWith(`${T} reload`))

const f = v => typeof v === 'string' ? v : JSON.stringify(v)
const oilLine = oil.map(o => `${o.who} on the ${o.where}: "${o.words}" — ${o.title || o.puckTitle}`).join(' ‖ ')
C.row(T, `Ranger's Training request (Sat 18 Jul 08:00–16:00, OIL question: Yes) landed on the Ground Programme; then: ${did}; OIL Earn on; four sign-offs, Publish day; Leave War`,
  `gesture toast: ${ts.map(t => '"' + t + '"').join(' · ') || '(none)'}; the row now: name box ${facts['row.after.names'] ? facts['row.after.names'].nameBox : '(no row)'}, extras [${facts['row.after.names'] ? facts['row.after.names'].extras.join(', ') : ''}]; Inputs page row: "${facts['inputs.row.after']}"; OIL Earn: ${oilLine}`,
  `request's person stored: ${await cs(req1.person)} (acc ${req1.acc}); stored Saturday row: ${f(facts['stored.day'])}; day head after publishing: ${f(facts.head && facts.head.tag)}; LEAVE WAR 18 Jul — ${Object.entries(lw).map(([k, v]) => `${k}: ${typeof v === 'string' ? v : '"' + v.text + '"'}`).join(', ')}; after a reload the same: ${JSON.stringify(lw) === JSON.stringify(lw2)}; reload: ${rr.map(r => (r.ok ? 'ok' : 'FAIL ' + r.detail)).join(' / ')}`,
  'RECORDED (a picture for the owner — not judged)', pics)
console.log('ERRORS', JSON.stringify(errors))
C.savePart(`namebox-${VARIANT}`, { errors, facts })
await browser.close()
