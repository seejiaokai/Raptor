/* [DB-READINESS] phase 7 walk — walker C, C34 + C35: the PREVIEWS of a day that carries an ALL AVAIL row, and the same
   chip opened by the admin and the member, desktop and phone. The ALL AVAIL stands on an ORDINARY ground row here (walker
   A walks it on a Personal request row).
   C34a  Tuesday (a draft): ALL AVAIL under MEDICAL APPT; "+ Alt Plan" parks Plan A — Plan A previewed (View-only Sched's
         picker): the chip's title and the window's line both say "as things stand now", the same number; a tap writes nothing.
   C34b  Wednesday: ALL AVAIL under MAINT CONF, the four sign-offs, Publish day, then a leave for one crowd man (pending) —
         the Original previewed (edit week, board, View-only Sched): both say "when this day was issued", the number it went
         out with; a tap writes nothing.
   C35   admin and member, desktop and phone (the same stored world), open Wednesday's chip: the same list and flags; the
         member has no earn controls. */
import { boot, world, fileRange, TODAY } from './p6-lib.mjs'
import * as C from './p7-c-lib.mjs'
const { L, W } = await boot()
const W2 = await import('./dbrA-W2-lib.mjs')
const { browser, ctx, p, errors } = await world(L)
await C.toastSpy(p)
const TUE = 1, WED = 2
const pics = {}
const pic = async (id, n, pg = p) => { await L.shot(pg, n); (pics[id] ||= []).push(n + '.png') }
const dayJson = (pg, di) => pg.evaluate(d => JSON.stringify(window.DAYS[d]), di)
const menuOpen = async (scope, di) => { const pm = p.locator(`${scope} [data-planmenu="${di}"]:visible`).first(); if (!(await pm.count())) return false; await pm.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await pm.click(); await L.sleep(450); return true }
const menuItems = () => p.evaluate(() => [...document.querySelectorAll('.wavemenu .wm')].filter(e => e.offsetParent !== null).map(e => (e.innerText || '').replace(/\s+/g, ' ').trim() + ' [' + [...e.attributes].filter(a => a.name.startsWith('data-plan')).map(a => a.name).join(',') + ']'))
const menuPick = async sel => { const it = p.locator(`.wavemenu .wm${sel}:visible`).first(); if (!(await it.count())) return false; await it.click(); await L.sleep(750); return true }
const viewOpts = (pg, di) => pg.evaluate(d => { const s = document.querySelector(`#vWeek select[data-dver="${d}"], #vWeek select[data-vwork="${d}"]`); return s ? [...s.options].map(o => `${o.value}=${o.text}${o.selected ? ' *' : ''}`) : null }, di)
const viewPick = async (pg, di, value) => { const s = pg.locator(`#vWeek select[data-dver="${di}"]:visible, #vWeek select[data-vwork="${di}"]:visible`).first(); if (!(await s.count())) return false; await s.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await s.selectOption(value); await L.sleep(650); return true }
const showChip = async (pg, surf, di) => { await pg.evaluate(([s, d]) => { const day = document.querySelector(`${s} .day[data-day="${d}"]`); if (!day) return; const sc = day.closest('.week') || day.parentElement; if (sc && sc.scrollWidth > sc.clientWidth) sc.scrollLeft = day.offsetLeft - (sc.firstElementChild ? sc.firstElementChild.offsetLeft : 0); const c = day.querySelector('.oilcount'); if (c) c.scrollIntoView({ block: 'center', inline: 'nearest' }) }, [surf, di]); await L.sleep(350) }
/* a tap on the first man in the open window: nothing may be written */
async function tapWrites(pg, di, touch = false) {
  const before = await dayJson(pg, di); const r0 = JSON.stringify(await L.rows(pg))
  const m = pg.locator('.availwin:not([hidden]) [data-awp] .puck').first()
  if (touch) await m.tap({ timeout: 3000 }).catch(() => {}); else await m.click({ timeout: 3000 }).catch(() => {})
  await L.settle(pg, 600)
  const w = await C.win(pg)
  return { changedDay: before !== await dayJson(pg, di), changedRows: r0 !== JSON.stringify(await L.rows(pg)), foot: w.foot }
}
/* ALL AVAIL under a ground row (found by its item's words) on the open board, through the row's own "+ add" */
async function allAvailUnder(di, words) {
  const ri = await p.evaluate(([d, w]) => window.DAYS[d].ground.findIndex(r => (r.prog || '').includes(w)), [di, words])
  if (ri < 0) return { ri, took: false, why: 'no such row' }
  const add = p.locator(`#schedBoard [data-fill="g:${di}.${ri}.+"] .addz:visible`).first()
  await add.evaluate(e => e.scrollIntoView({ block: 'center' })); await L.sleep(200)
  /* a real press where "+ add" is drawn; when it has no box of its own, just right of the last puck in the zone */
  const pt = await p.evaluate(k => { const z = document.querySelector(`#schedBoard [data-fill="${k}"]`); const a = z.querySelector('.addz'); const zr = z.getBoundingClientRect(); const ar = a ? a.getBoundingClientRect() : null
    if (ar && ar.width > 4 && ar.height > 4) return { x: ar.left + ar.width / 2, y: ar.top + ar.height / 2 }
    const seats = [...z.querySelectorAll('.seat')]; const last = seats.length ? seats[seats.length - 1].getBoundingClientRect() : null
    return { x: Math.min(zr.right - 6, (last ? last.right : zr.left) + 18), y: last ? last.top + last.height / 2 : zr.top + zr.height / 2 } }, `g:${di}.${ri}.+`)
  await p.mouse.click(pt.x, pt.y); await L.sleep(300)
  const armed = await p.evaluate(() => window.armedKey())
  await p.locator('#sbRoster .rpuck[data-person="allavail"]:visible').first().click(); await L.sleep(500)
  await p.keyboard.press('Escape'); await L.sleep(200)
  const row = await p.evaluate(([d, r]) => JSON.parse(JSON.stringify(window.DAYS[d].ground[r])), [di, ri])
  return { ri, armed, took: (row.more || []).includes('allavail') || row.who === 'allavail', row }
}
const hasNow = t => /as things stand now/.test(t), hasIssued = t => /when this day was issued/.test(t)

/* ================= C34a — a saved plan previewed ================= */
try {
  await W.boardOn(p, TUE)
  const put = await allAvailUnder(TUE, 'MEDICAL APPT')
  const bc = await C.chips(p, '#schedBoard')
  await p.locator('#schedBoard .oilcount:visible').first().evaluate(e => e.scrollIntoView({ block: 'center' })).catch(() => {}); await L.sleep(250)
  await pic('C34a', 'C34a-01-tuesday-board-chip')
  await W.boardOff(p); await W.toEdit(L, p); await W.showDay(p, TUE)
  await menuOpen('#eWeek', TUE); const items0 = await menuItems()
  const dup = await menuPick('[data-plandup]')
  const dupToast = await C.toasts(p)
  await menuOpen('#eWeek', TUE); const items1 = await menuItems(); await pic('C34a', 'C34a-02-plans-menu-after-alt-plan'); await p.keyboard.press('Escape'); await L.sleep(250); await p.mouse.click(720, 40); await L.sleep(200)
  const liveChip = await C.chips(p, `#eWeek .day[data-day="${TUE}"]`)
  /* the parked plan, looked at through View-only Sched's own picker */
  await L.go(p, 'viewsched'); await showChip(p, '#vWeek', TUE)
  const opts = await viewOpts(p, TUE)
  const planOpt = (opts || []).map(o => o.split('=')[0]).find(v => v.startsWith('d:'))
  const liveV = await C.chips(p, `#vWeek .day[data-day="${TUE}"]`)
  let pc = [], pw = { open: false }, tp = null
  if (planOpt) {
    await viewPick(p, TUE, planOpt); await showChip(p, '#vWeek', TUE)
    pc = await C.chips(p, `#vWeek .day[data-day="${TUE}"]`)
    await pic('C34a', 'C34a-03-saved-plan-previewed-chip')
    pw = await C.openChip(p, `#vWeek .day[data-day="${TUE}"]`)
    tp = await tapWrites(p, TUE)
    await pic('C34a', 'C34a-04-saved-plan-previewed-window')
    await C.closeWin(p)
    await viewPick(p, TUE, 'live')
  }
  const ok = put.took && dup && !!planOpt && pc.length === 1 && hasNow(pc[0].title) && !/issued/.test(pc[0].title) && pw.open && hasNow(pw.from) && !/issued/.test(pw.from) && String(pw.n) === pc[0].txt && tp && !tp.changedDay && !tp.changedRows
  C.row('C34a', `Tuesday (a draft): board → MEDICAL APPT's "+ add" → ALL AVAIL; Edit Schedule → Tuesday's plans menu → "+ Alt Plan"; View-only Sched → Tuesday's picker → the parked plan; its chip; a tap on the chip; a tap on the first man`,
    `board chip after the placing: "${bc[0] && bc[0].txt}"; plans menu before: ${JSON.stringify(items0)}; "+ Alt Plan" pressed: ${dup}, the app said ${JSON.stringify(dupToast)}; menu after: ${JSON.stringify(items1)}; View-only Sched picker: ${JSON.stringify(opts)}; live plan chip there: "${liveV[0] && liveV[0].txt}" — "${liveV[0] && liveV[0].title}"; THE PARKED PLAN PREVIEWED — chip "${pc[0] && pc[0].txt}", its title "${pc[0] && pc[0].title}"; the window "${pw.title}" lists ${pw.n}, its line "${pw.from}"; after a tap on the first man its foot reads "${tp && tp.foot}"`,
    `the chip carries no issued-version stamp (${pc[0] ? (pc[0].ver || 'none') : '-'}); the tap changed the working day: ${tp && tp.changedDay}; rows written by the tap: ${tp && tp.changedRows}`, ok ? 'PASS' : 'FAIL', pics.C34a)
} catch (e) { await pic('C34a', 'C34a-X-error').catch(() => {}); C.row('C34a', 'a saved plan previewed', 'THE STEP DID NOT RUN: ' + String(e && e.stack || e).slice(0, 500), '', 'FAIL', pics.C34a) }

/* ================= C34b — an issued version previewed ================= */
let N = null, crowd = [], leaveWho = null
try {
  await W.boardOn(p, WED)
  const put = await allAvailUnder(WED, 'MAINT CONF')
  const w0 = await C.openChip(p, '#schedBoard'); await C.closeWin(p)
  N = String(w0.n); crowd = (w0.ids || []).slice()
  await W.boardOff(p); await W.toEdit(L, p); await W.showDay(p, WED)
  const signed = await W.signDay(p, WED); const pub = await W.publishDay(p, WED)
  const h = await W.head(p, WED)
  leaveWho = crowd.filter(id => id !== 'bane' && id !== 'stiff')[0]
  const lvCs = await p.evaluate(i => (window.PEOPLE[i] || {}).cs, leaveWho)
  const lv = await fileRange(L, p, { person: leaveWho, type: 'LL', fromIso: '2026-07-15', toIso: '2026-07-15', remarks: 'P7 C34 leave' })
  await W.toEdit(L, p); await W.showDay(p, WED)
  const h2 = await W.head(p, WED)
  const live = await C.chips(p, `#eWeek .day[data-day="${WED}"]`)
  /* (1) the edit week's look at the Original */
  await menuOpen('#eWeek', WED); const items = await menuItems(); const pv = await menuPick('[data-planpv]')
  await showChip(p, '#eWeek', WED)
  const ec = await C.chips(p, `#eWeek .day[data-day="${WED}"]`)
  await pic('C34b', 'C34b-01-editweek-original-previewed-chip')
  const ew = await C.openChip(p, `#eWeek .day[data-day="${WED}"]`)
  const et = await tapWrites(p, WED)
  await pic('C34b', 'C34b-02-editweek-original-previewed-window')
  await C.closeWin(p)
  const back = p.locator(`#eWeek .day[data-day="${WED}"] [data-golive="${WED}"]:visible`).first()
  const backThere = await back.count(); if (backThere) { await back.click(); await L.sleep(600) }
  const live2 = await C.chips(p, `#eWeek .day[data-day="${WED}"]`)
  /* (2) the board's look */
  await W.boardOn(p, WED)
  let bcx = [], bw = { open: false }, bt = null, oilBtn = null
  if (await menuOpen('#schedBoard', WED) && await menuPick('[data-planpv]')) {
    await p.locator('#schedBoard .oilcount:visible').first().evaluate(e => e.scrollIntoView({ block: 'center' })).catch(() => {}); await L.sleep(300)
    bcx = await C.chips(p, '#schedBoard')
    bw = await C.openChip(p, '#schedBoard')
    oilBtn = await p.evaluate(() => { const b = document.querySelector('#sbOil'); return b && b.offsetParent !== null ? { disabled: b.disabled, title: b.title } : 'no OIL Earn button drawn' })
    bt = await tapWrites(p, WED)
    await pic('C34b', 'C34b-03-board-original-previewed-window')
    await C.closeWin(p)
    await menuOpen('#schedBoard', WED); await menuPick('[data-plangolive]')
  }
  await W.boardOff(p)
  /* (3) View-only Sched: as issued, then the working draft */
  await L.go(p, 'viewsched'); await showChip(p, '#vWeek', WED)
  const vopts = await viewOpts(p, WED)
  const vi = await C.chips(p, `#vWeek .day[data-day="${WED}"]`)
  const viw = await C.openChip(p, `#vWeek .day[data-day="${WED}"]`); await pic('C34b', 'C34b-04-viewsched-as-issued-window'); await C.closeWin(p)
  await viewPick(p, WED, 'working'); await showChip(p, '#vWeek', WED)
  const vw = await C.chips(p, `#vWeek .day[data-day="${WED}"]`)
  const vww = await C.openChip(p, `#vWeek .day[data-day="${WED}"]`); await pic('C34b', 'C34b-05-viewsched-working-draft-window'); await C.closeWin(p)
  await viewPick(p, WED, 'issued')
  const ok = put.took && pub.pressed && pv && ec.length === 1 && ec[0].txt === N && hasIssued(ec[0].title) && ew.open && String(ew.n) === N && hasIssued(ew.from) && ew.ids.includes(leaveWho) && !et.changedDay && !et.changedRows
    && live[0] && live[0].txt === String(+N - 1) && live2[0] && live2[0].txt === String(+N - 1)
    && (!bw.open || (String(bw.n) === N && hasIssued(bw.from) && bcx[0] && bcx[0].txt === N && hasIssued(bcx[0].title) && !bt.changedDay && !bt.changedRows))
    && vi[0] && vi[0].txt === N && hasIssued(vi[0].title) && String(viw.n) === N && hasIssued(viw.from) && vw[0] && vw[0].txt === String(+N - 1) && hasNow(vw[0].title) && String(vww.n) === String(+N - 1) && hasNow(vww.from)
  C.row('C34b', `Wednesday: board → MAINT CONF's "+ add" → ALL AVAIL; the four sign-offs, Publish day; a Local leave filed for ${lvCs} (a crowd man) on the Inputs page; then the Original looked at from Edit Schedule's plans menu, from the board's, and on View-only Sched (as issued / working draft); in each: the chip, a tap on it, a tap on the first man`,
    `issued with ${N} behind the puck; published: tag "${h.tag}"; after the leave the day head reads "${h2.pending}" and the live chip "${live[0] && live[0].txt}" ("${live[0] && live[0].title}"). plans menu: ${JSON.stringify(items)}. EDIT WEEK, ORIGINAL PREVIEWED — chip "${ec[0] && ec[0].txt}", title "${ec[0] && ec[0].title}"; window lists ${ew.n}, its line "${ew.from}", ${lvCs} still listed: ${ew.ids && ew.ids.includes(leaveWho)}; foot after a tap "${et.foot}"; "Back to live copy" there: ${!!backThere}, live chip again "${live2[0] && live2[0].txt}". BOARD, ORIGINAL PREVIEWED — ${bw.open ? `chip "${bcx[0] && bcx[0].txt}", "${bcx[0] && bcx[0].title}"; window lists ${bw.n}, "${bw.from}"; OIL Earn button: ${JSON.stringify(oilBtn)}` : 'the board offered no Original to look at'}. VIEW-ONLY SCHED ${JSON.stringify(vopts)} — as issued: chip "${vi[0] && vi[0].txt}", "${vi[0] && vi[0].title}", window ${viw.n}, "${viw.from}"; working draft: chip "${vw[0] && vw[0].txt}", "${vw[0] && vw[0].title}", window ${vww.n}, "${vww.from}"`,
    `the previewed chip carries the issued version's stamp (${ec[0] && ec[0].ver}); a tap in the edit week's preview window changed the working day: ${et.changedDay}, wrote rows: ${et.changedRows}; in the board's: ${bt ? bt.changedDay + ' / ' + bt.changedRows : 'n/a'}`, ok ? 'PASS' : 'FAIL', pics.C34b)
} catch (e) { await pic('C34b', 'C34b-X-error').catch(() => {}); C.row('C34b', 'an issued version previewed', 'THE STEP DID NOT RUN: ' + String(e && e.stack || e).slice(0, 500), '', 'FAIL', pics.C34b) }

/* ================= C35 — admin and member, desktop and phone ================= */
try {
  const seen = {}
  const look = async (pg, who, width, touch) => {
    await L.go(pg, 'viewsched'); await showChip(pg, '#vWeek', WED)
    const c = await C.chips(pg, `#vWeek .day[data-day="${WED}"]`)
    let w = await C.openChip(pg, `#vWeek .day[data-day="${WED}"]`, { touch })
    let finger = touch ? (w.open ? 'a finger tap on the chip OPENED the window' : 'a finger tap on the chip did NOT open the window') : ''
    if (touch && !w.open) {
      /* look at what the finger did before calling it anything: the picture, and what is selected */
      const sel = await pg.evaluate(() => [...document.querySelectorAll('.puck.sel')].filter(e => e.offsetParent !== null).map(e => (e.innerText || '').replace(/\s+/g, ' ').trim()).slice(0, 3))
      await L.shot(pg, `C35-${who}-${width}-finger-tap`); (pics.C35 ||= []).push(`C35-${who}-${width}-finger-tap.png`)
      finger += ` (it selected ${JSON.stringify(sel)} instead); a mouse click at the same spot was used to read the list`
      await pg.keyboard.press('Escape'); await L.sleep(200)
      w = await C.openChip(pg, `#vWeek .day[data-day="${WED}"]`, { touch: false })
      touch = false
    }
    await L.shot(pg, `C35-${who}-${width}-window`); (pics.C35 ||= []).push(`C35-${who}-${width}-window.png`)
    const t = await tapWrites(pg, WED, touch)
    const oil = await pg.evaluate(() => [...document.querySelectorAll('#sbOil, [data-oilmode], .availwin .oilpk, .availwin [data-oilp]')].filter(e => e.offsetParent !== null).length)
    await C.closeWin(pg)
    seen[`${who} ${width}`] = { chip: c[0] ? `${c[0].txt} — "${c[0].title}"` : '(no chip painted)', n: w.n, ids: (w.ids || []).slice().sort().join(','), flags: (w.flagged || []).slice().sort().join(' | '), tabs: w.tabs, one: w.one, from: w.from, rect: w.rect, earn: (w.earnControls || 0) + oil, finger, tapWrote: t.changedDay || t.changedRows, whyHidden: (w.men || []).filter(m => m.why && m.whyOnScreen === false).length }
  }
  await look(p, 'admin', 'desktop', false)
  const state = await ctx.storageState()
  /* the member on the same browser */
  await W2.signOut(p); await L.signIn(p, 'm', { goto: false })
  await look(p, 'member', 'desktop', false)
  const memberPages = await p.evaluate(() => { try { window.go('editsched') } catch (e) { return 'threw' } return window.CURPAGE })
  /* the phone: the same stored world in a phone-sized browser */
  for (const who of ['admin', 'member']) {
    const pctx = await L.context(browser, { phone: true, storageState: state })
    await pctx.clock.setFixedTime(TODAY)
    const pp = await L.page(pctx, errors, 'phone-' + who)
    await L.signIn(pp, who === 'admin' ? 'a' : 'm')
    await look(pp, who, 'phone', true)
    await pctx.close()
  }
  const keys = Object.keys(seen)
  const base = seen['admin desktop']
  const sameList = keys.every(k => seen[k].ids === base.ids && seen[k].n === base.n)
  const sameFlags = keys.every(k => seen[k].flags === base.flags)
  const memberNoEarn = seen['member desktop'].earn === 0 && seen['member phone'].earn === 0 && !(seen['member desktop'].tabs || []).some(t => /earns OIL/.test(t)) && !(seen['member phone'].tabs || []).some(t => /earns OIL/.test(t))
  const phonePanel = ['admin phone', 'member phone'].every(k => seen[k].rect && seen[k].rect.width >= 350 && seen[k].rect.top > 200)
  C.row('C35', 'the published Wednesday (ALL AVAIL under MAINT CONF, one leave pending): View-only Sched → the chip tapped → a tap on the first man — as the admin and as the member (us), at 1440 px and at 390 px (the same stored world)',
    keys.map(k => `${k.toUpperCase()}: chip ${seen[k].chip}; window lists ${seen[k].n}, "${seen[k].from}"${seen[k].tabs && seen[k].tabs.length ? ', tabs ' + JSON.stringify(seen[k].tabs) : seen[k].one ? ', "' + seen[k].one + '"' : ''}; flagged: ${seen[k].flags || 'nobody'}; window box ${JSON.stringify(seen[k].rect)}; earn controls on screen: ${seen[k].earn}; reasons not drawn: ${seen[k].whyHidden}${seen[k].finger ? '; ' + seen[k].finger : ''}`).join(' ‖ '),
    `the four lists are the same men: ${sameList}; the same flags: ${sameFlags}; a tap wrote something anywhere: ${keys.filter(k => seen[k].tapWrote).join(', ') || 'no'}`,
    !(sameList && sameFlags && memberNoEarn && phonePanel && !keys.some(k => seen[k].tapWrote)) ? 'FAIL' : keys.some(k => /did NOT open/.test(seen[k].finger)) ? 'PASS for the list, the flags and the roles — FAIL for a finger tap on the chip at phone width (finding F1)' : 'PASS', pics.C35)
} catch (e) { C.row('C35', 'admin and member, desktop and phone', 'THE STEP DID NOT RUN: ' + String(e && e.stack || e).slice(0, 600), '', 'FAIL', pics.C35 || []) }

console.log('ERRORS', JSON.stringify(errors))
C.savePart('previews', { errors })
await browser.close()
