/* WALKER G — X-06 (and the base for X-08): a leave filed on the Leave War, and what the Inputs bar and its "placed by" line say */
import * as G from './cal-G-lib.mjs'
const { L, W, sleep } = G
G.setTag('x06')
const { browser, ctx, p, errors } = await G.world({ who: 'a' })
const tid = id => p.locator(`[data-testid="${id}"]`)
const P = 'dj'  // Ace
const cellOf = d => tid(`cell-${P}-${d}`)
const showMonth = async mon => { await L.go(p, 'leavewar'); await sleep(1200); await tid(`month-${mon}`).first().click(); await sleep(1300) }
const tapCell = async d => { await cellOf(d).scrollIntoViewIfNeeded(); await sleep(150); await cellOf(d).click(); await tid('sheet-scrim').waitFor({ timeout: 4000 }).catch(() => {}); await sleep(400) }
const recs = () => p.evaluate(id => window.INPUTS.filter(x => x.person === id && /^LL/.test(x.type) && /Aug/.test(x.date)).map(x => ({ iid: x.iid, type: x.type, date: x.date, end: x.endDate || '', by: x.by && window.PEOPLE[x.by] ? window.PEOPLE[x.by].cs : x.by, at: x.at, modBy: x.modBy && window.PEOPLE[x.modBy] ? window.PEOPLE[x.modBy].cs : x.modBy, modAt: x.modAt, lw: x.lw, allday: x.allday })), P)
const chipOf = async d => (await cellOf(d).count()) ? cellOf(d).evaluate(e => { const c = e.querySelector('.c'); return c ? { text: c.innerText.trim(), cls: c.className } : null }) : 'no cell'
const inputsSide = async (label, iso) => {
  await L.go(p, 'inputs'); if (await p.locator('#inMemberMode').count()) { await p.locator('#inMemberMode').click(); await sleep(300) }
  await G.toInputsCal(p); await G.monthTo(p, 2026, 7)
  const bars = await p.evaluate(() => [...document.querySelectorAll('#inpCal .ib-bar')].map(e => ({ t: e.innerText.replace(/\s+/g, ' ').trim(), title: e.getAttribute('title') || '', iid: e.dataset.testid })).filter(b => /Ace/.test(b.t)))
  const f1 = await G.shot(p, `${label}-inputs-month`)
  await G.openDay(p, iso)
  const lines = await p.locator('[data-testid="win-inputsday"] [data-testid^="idy-row-"]').allInnerTexts()
  const f2 = await G.shot(p, `${label}-inputs-day`)
  return { bars, lines: lines.map(t => t.replace(/\s+/g, ' ')).filter(t => /Ace/.test(t)), f1, f2 }
}
const say = (n, o) => console.log(n, JSON.stringify(o).slice(0, 1500))

/* ---- 1. create and approve a fresh leave through the Leave War ---- */
await showMonth('AUG')
await tapCell('2026-08-05')
console.log('sheet buttons', JSON.stringify(await p.evaluate(() => [...document.querySelectorAll('[data-testid^="bid-"]')].map(b => b.dataset.testid))))
await tid('bid-LL').click(); await sleep(700)
say('after bid', await chipOf('2026-08-05'))
await tapCell('2026-08-05'); const fSheet = await G.shot(p, 'lw-bid-sheet')
await tid('decide-approve').click(); await sleep(900)
const c1 = await chipOf('2026-08-05'); const fAppr = await G.shot(p, 'lw-approved')
const r1 = await recs(); say('APPROVED chip', c1); say('APPROVED recs', r1)
const I1 = await inputsSide('approved', '2026-08-05'); say('APPROVED inputs', I1)

/* ---- 2. extend by approving the next day (as another admin: Warden, in place) ---- */
await p.evaluate(() => { window.raptorMe('nact'); window.raptorRole('admin') }); await sleep(500)
await showMonth('AUG')
await tapCell('2026-08-06'); await tid('bid-LL').click(); await sleep(700)
await tapCell('2026-08-06'); await tid('decide-approve').click(); await sleep(900)
const fExt = await G.shot(p, 'lw-extended')
await p.evaluate(() => { window.raptorMe('stiff'); window.raptorRole('admin') }); await sleep(400)
const r2 = await recs(); say('EXTENDED recs', r2)
const I2 = await inputsSide('extended', '2026-08-06'); say('EXTENDED inputs', I2)

/* ---- 3. move the 6th to the 12th ---- */
await showMonth('AUG')
await tapCell('2026-08-06'); await tid('decide-shift').click(); await tid('move-banner').waitFor(); await sleep(500)
await tid(`cell-${P}-2026-08-12`).click(); await sleep(400)
if (await tid('move-confirm').count()) await tid('move-confirm').click()
await sleep(900)
const fMoved = await G.shot(p, 'lw-moved')
const r3 = await recs(); say('MOVED recs', r3)
const I3 = await inputsSide('moved', '2026-08-12'); say('MOVED inputs', I3)
const I3b = await inputsSide('moved-b', '2026-08-05'); say('MOVED inputs (5th)', I3b)

/* ---- 4. Undo (top bar), then reload ---- */
const un = await G.undo(p); say('UNDO', un)
const r4 = await recs(); say('UNDONE recs', r4)
const I4 = await inputsSide('undone', '2026-08-06'); say('UNDONE inputs', I4)
await G.reload(p)
await L.go(p, 'inputs'); await G.toInputsCal(p); await G.monthTo(p, 2026, 7)
const r5 = await recs(); say('RELOADED recs', r5)
const I5 = await inputsSide('reloaded', '2026-08-06'); say('RELOADED inputs', I5)
G.saveRows('x06-raw')
console.log('errors', JSON.stringify(errors))
await browser.close()
