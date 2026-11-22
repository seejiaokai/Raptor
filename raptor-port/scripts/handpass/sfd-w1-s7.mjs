// sfd-w1 S7 — the plain-user round (§7.0a), clock Wed 15 Jul 26. Loaded by sfd-w1.mjs (ONLY=s7d|s7p).
import path from 'node:path'
import { SIZES, sleep, J, mk, world, signIn, signOut, go, today, B, openBoard, closeBoard, boardStep, readBoard, lwCell, qualsTick, OUT } from './sfd-w1-lib.mjs'

const HEX = 'rocky'
const txt = async (p, sel) => ((await p.locator(sel).first().innerText().catch(() => '')) || '').replace(/\s+/g, ' ').trim()
const hexState = p => p.evaluate(id => { const q = window.PEOPLE[id]; return { san: !!q.san, sanFrom: q.sanFrom || null, archived: !!q.archived, postOut: q.postOut || q.po || null } }, HEX)
const sheetUp = p => p.evaluate(() => [...document.querySelectorAll('[data-testid="po-sans"], [data-testid="po-confirm"], [data-testid="po-line"]')].some(e => e.getBoundingClientRect().width > 0))

/* the warnings on the open board that name a man */
const warnsFor = (p, cs) => p.evaluate(cs => {
  const vis = e => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 }
  const out = new Set()
  for (const e of document.querySelectorAll('#schedBoard *')) {
    if (!vis(e) || e.children.length > 3) continue
    const t = (e.innerText || '').replace(/\s+/g, ' ').trim()
    const head = t.split(' — ')[0]
    if (t.includes(' — ') && new RegExp('\\b' + cs + '\\b').test(head) && t.length < 300) out.add(t.slice(0, 220))
  }
  const head = [...document.querySelectorAll('#schedBoard *')].filter(e => vis(e) && /\d+ issues?/.test((e.innerText || '').trim()) && (e.innerText || '').length < 40).map(e => e.innerText.replace(/\s+/g, ' ').trim())[0] || ''
  return { head, lines: [...out] }
}, cs)

/* tap an empty RCP seat of a flying line on the open board, then his puck in the crew list */
async function seatRcp(p, W, di, id) {
  /* already in a flying RCP seat that day (the demo week's own seat)? then that seat stands, and it is said so */
  const held = await p.evaluate(([di, id]) => { const re = new RegExp('^' + di + '\\.\\d+\\.\\d+\\.\\d+\\.w$'); const e = [...document.querySelectorAll(`#schedBoard [data-slot] .puck[data-person="${id}"]`)].find(x => re.test(x.closest('[data-slot]').dataset.slot)); return e ? e.closest('[data-slot]').dataset.slot : null }, [di, id])
  if (held) return { slot: held, already: true, now: true }
  const findEmpty = () => p.evaluate(di => {
    const vis = e => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 }
    const re = new RegExp('^' + di + '\\.\\d+\\.\\d+\\.\\d+\\.w$')
    const e = [...document.querySelectorAll('#schedBoard .sb-slot.empty[data-slot]')].find(x => vis(x) && re.test(x.dataset.slot))
    return e ? e.dataset.slot : null
  }, di)
  let slot = await findEmpty(), added = false
  if (!slot) { await W.press(p, `#schedBoard [data-gline="${di}.0"]:visible`, 'plus-line'); await sleep(500); slot = await findEmpty(); added = true }
  if (!slot) return { slot: null, added }
  await W.press(p, `#schedBoard .sb-slot.empty[data-slot="${slot}"]:visible`, 'rcp-seat')
  const armed = await p.evaluate(() => window.ARM && window.ARM.key)
  await W.press(p, `#schedBoard .rpuck[data-person="${id}"]:visible`, 'crew-' + id); await sleep(500)
  const now = await p.evaluate(([slot, id]) => !!document.querySelector(`#schedBoard [data-slot="${slot}"] .puck[data-person="${id}"]`), [slot, id])
  return { slot, added, armed, now }
}

export async function s7(k) {
  const sz = SIZES[k], W = mk('s7', sz)
  const { b, p } = await world(sz, W, '2026-07-15T09:00:00')
  try {
    await signIn(p, 'ad', 'a')
    W.rec('premise', 'clock', null, await today(p))
    /* 1. Quals: ✎ Edit, tick and untick SANS for a man, a CAT change, Done */
    await go(p, 'quals')
    await W.press(p, '#qViewW', 'qview-w')
    await W.press(p, '#qEdit:visible', 'qedit')
    const other = await p.evaluate(hex => { const c = [...document.querySelectorAll('td[data-q$="|san"]')].map(e => e.dataset.q.split('|')[0]).find(id => id !== hex && window.PEOPLE[id] && !window.PEOPLE[id].san && !window.PEOPLE[id].archived); return c ? { id: c, cs: window.PEOPLE[c].cs, cat: window.PEOPLE[c].cat } : null }, HEX)
    const oc = p.locator(`td[data-q="${other.id}|san"]`).first()
    await oc.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' }))
    await W.press(p, oc, 'tick'); const s1 = await p.evaluate(id => ({ san: !!window.PEOPLE[id].san, sanFrom: window.PEOPLE[id].sanFrom || null }), other.id)
    const pt = await W.pic(p, '01-ticked')
    await W.press(p, oc, 'untick'); const s2 = await p.evaluate(id => ({ san: !!window.PEOPLE[id].san, sanFrom: window.PEOPLE[id].sanFrom || null }), other.id)
    W.rec('s7-01', `Quals ✎ Edit: ${other.cs}'s SANS ticked then unticked`, s1.san === true && s2.san === false, `${J(s1)} → ${J(s2)}`, pt + ', ' + await W.pic(p, '02-unticked'))
    /* a CAT change: his CAT cell */
    /* a CAT change: the row's CAT box (a select in edit mode) */
    const sel = p.locator(`select[data-lvl="${other.id}"]`).first()
    if (await sel.count()) {
      await sel.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' }))
      const was = await p.evaluate(id => window.PEOPLE[id].q, other.id)
      const opts = await sel.locator('option').evaluateAll(os => os.map(o => o.value))
      const v = opts.find(o => o && o !== String(was)); await sel.selectOption(v); await sleep(500)
      const after = await p.evaluate(id => window.PEOPLE[id].q, other.id)
      W.rec('s7-02', `Quals: ${other.cs}'s CAT box changed ${was} → ${v} (options ${opts.join('/')})`, after === v, `now ${after}`, await W.pic(p, '04-cat-changed'))
    } else W.rec('s7-02', 'Quals CAT change', null, 'NOT WALKED: no CAT box on his row')
    await W.press(p, '#qSave:visible', 'qdone')
    W.rec('s7-03', 'Quals Done closes edit', (await p.locator('#qSave:visible').count()) === 0, '', await W.pic(p, '05-done'))
    /* 2. the posting sheet opened and closed three ways, nothing saved */
    const before = await hexState(p)
    for (const how of ['x', 'escape', 'outside']) {
      const c = (await lwCell(p, W, HEX, '2026-07-20')).cell
      await W.press(p, c, 'cell'); await W.press(p, '[data-testid="bid-more"]:visible', 'more'); await W.press(p, '[data-testid="bid-postout"]:visible', 'postout')
      await W.press(p, '[data-testid="po-sans"]:visible', 'po-sans')
      const up = await sheetUp(p); const pUp = await W.pic(p, `06-sheet-${how}`)
      if (how === 'x') { const x = p.locator('.bidsheet-hd button.x:visible, [data-testid="bid-cancel"]:visible, [role="dialog"] button.x:visible').first(); if (await x.count()) await W.press(p, x, 'sheet-x') }
      else if (how === 'escape') await p.keyboard.press('Escape')
      else { if (W.isPhone) await p.touchscreen.tap(200, 30); else await p.mouse.click(30, 840) }
      await sleep(600)
      const gone = !(await sheetUp(p)), st = await hexState(p)
      W.rec(`s7-04-${how}`, `posting sheet (SANS picked) closed by ${how}: gone, nothing saved`, up && gone && J(st) === J(before), `up ${up} gone ${gone} · ${J(st)}`, pUp + ', ' + await W.pic(p, `07-closed-${how}`))
      if (!gone) { await p.keyboard.press('Escape'); await sleep(400) }
    }
    /* 3. Hex ticked SANS today, then seated in a flying RCP seat on Mon 13 and Thu 16 */
    const t = await qualsTick(p, W, HEX, '08')
    W.rec('s7-05', `Hex ticked SANS by hand today (${await today(p)})`, t.st.san === true, J(t.st), t.pic)
    await openBoard(p, W, 0)
    const m = await seatRcp(p, W, 0, HEX)
    const wm = await warnsFor(p, 'Hex'), rm = await readBoard(p, HEX)
    W.rec('s7-06', 'Mon 13: Hex seated in a flying line\'s RCP seat — no SANS warning for him', m.now === true && !wm.lines.some(l => /SANS/i.test(l)), `${J(m)} · warnings ${J(wm)} · pucks ${J(rm.pucks)}`, await W.pic(p, '09-mon-seated'))
    while ((await p.evaluate(() => window.SBDAY)) < 3) await boardStep(p, W, 1)
    const th = await seatRcp(p, W, 3, HEX)
    const wt = await warnsFor(p, 'Hex'), rt = await readBoard(p, HEX)
    W.rec('s7-07', 'Thu 16: Hex seated in a flying RCP seat — RECORD his warnings (amber "outside SANS availability" expected)', th.now === true ? null : false, `${J(th)} · warnings ${J(wt)} · pucks ${J(rt.pucks)}`, await W.pic(p, '10-thu-seated'))
    /* the bell (on the board's bar) */
    const bell = p.locator('#sbBell:visible').first()
    if (await bell.count()) {
      await W.press(p, bell, 'bell'); await sleep(500)
      W.rec('s7-08', 'the bell (record)', null, (await txt(p, '[data-testid="bell-list"]')).slice(0, 400), await W.pic(p, '11-bell'))
      await p.keyboard.press('Escape'); await sleep(400)
      if (await p.locator('[data-testid="bell-list"]:visible').count()) { await W.press(p, bell, 'bell-close') }
    }
    /* the change history: All changes */
    const hist = p.locator('#sbHist:visible').first()
    if (await hist.count()) {
      await W.press(p, hist, 'history'); await sleep(500)
      const all = p.locator('.win-tab:visible', { hasText: 'All changes' }).first()
      if (await all.count()) await W.press(p, all, 'all-changes')
      const wk = p.locator('button:visible', { hasText: /^Week$/ }).first()
      if (await wk.count()) await W.press(p, wk, 'hist-week')
      const lines = await p.evaluate(() => [...document.querySelectorAll('*')].filter(e => e.getBoundingClientRect().width > 0 && e.children.length < 4 && /SANS/.test(e.textContent || '') && /Hex/.test(e.textContent || '') && (e.textContent || '').length < 220).map(e => e.textContent.replace(/\s+/g, ' ').trim()).slice(0, 6))
      const tabTxt = await txt(p, '.win-tab.on')
      W.rec('s7-09', 'change history, All changes (Week): the line for Hex\'s SANS tick (record)', null, `tab "${tabTxt}" · lines ${J([...new Set(lines)])}`, await W.pic(p, '12-history'))
      await p.keyboard.press('Escape'); await sleep(400)
    }
    await closeBoard(p, W)
    /* the Inputs calendar's Thursday, the SANS calendar's Thursday */
    await go(p, 'inputs')
    if ((await p.locator('#inCalBtn').getAttribute('aria-pressed').catch(() => 'true')) !== 'true') await W.press(p, '#inCalBtn', 'cal')
    const d = p.locator('[data-icday="2026-07-16"]').first()
    await d.focus(); await p.keyboard.press('Enter'); await sleep(600)
    W.rec('s7-10', 'Inputs calendar, Thu 16 Jul opened (record; known: reads today\'s tick)', null, (await txt(p, '[data-testid="win-inputsday"]')).slice(0, 300), await W.pic(p, '13-inputs-thu'))
    await p.keyboard.press('Escape'); await sleep(400)
    await W.press(p, '#inSansMode:visible', 'sans-tab'); await sleep(600)
    const sd = p.locator('[data-testid="sc-day-2026-07-16"]').first()
    if (await sd.count()) {
      await W.press(p, sd, 'sans-thu'); await sleep(600)
      const hexThere = await p.evaluate(id => [...document.querySelectorAll(`.puck[data-person="${id}"]`)].filter(e => e.getBoundingClientRect().width > 0).map(e => ({ san: e.classList.contains('san'), title: e.title })), HEX)
      W.rec('s7-11', 'SANS calendar, Thu 16 Jul opened (record; known: reads today\'s tick)', null, `Hex pucks ${J(hexThere)}`, await W.pic(p, '14-sans-thu'))
      await p.keyboard.press('Escape'); await sleep(400)
    } else W.rec('s7-11', 'SANS calendar Thursday', null, 'NOT WALKED: no Thu 16 Jul cell', await W.pic(p, '14-sans-cal'))
    /* 4. the member Ranger ticks his own SANS (D149) */
    await signOut(p, W); await signIn(p, 'us', 'us')
    const me = await p.evaluate(() => { const id = Object.keys(window.PEOPLE).find(k => window.PEOPLE[k].cs === 'Ranger'); return { id, seat: window.PEOPLE[id].seat, san: !!window.PEOPLE[id].san } })
    await go(p, 'quals')
    await W.press(p, me.seat === 'FCP' ? '#qViewP' : '#qViewW', 'qview')
    const canEdit = await p.locator('#qEdit:visible').count()
    if (canEdit) await W.press(p, '#qEdit:visible', 'qedit')
    const mc = p.locator(`td[data-q="${me.id}|san"]`).first()
    await mc.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' }))
    await W.press(p, mc, 'own-san')
    const ms = await p.evaluate(id => ({ san: !!window.PEOPLE[id].san, sanFrom: window.PEOPLE[id].sanFrom || null }), me.id)
    W.rec('s7-12', `as Ranger: his own SANS tick on Quals (✎ Edit shown: ${!!canEdit})`, ms.san === true, J(ms), await W.pic(p, '15-member-tick'))
    if (await p.locator('#qSave:visible').count()) await W.press(p, '#qSave:visible', 'qdone')
    /* what his crew list shows after: the member reaches View-only Sched only; his own puck there today and on Mon 13 */
    await go(p, 'viewsched')
    const mine = await p.evaluate(id => [...document.querySelectorAll(`#vWeek .puck[data-person="${id}"]`)].map(e => ({ day: ((e.closest('section.day') || {}).querySelector ? e.closest('section.day').querySelector('.day-head').innerText.replace(/\s+/g, ' ').slice(0, 16) : '?'), san: e.classList.contains('san'), title: e.title })), me.id)
    await p.locator('#vWeek section.day[data-day="2"]').first().evaluate(e => e.scrollIntoView({ block: 'start', inline: 'center' })).catch(() => {}); await sleep(400)
    W.rec('s7-13', 'as Ranger after his own tick: his pucks on View-only Sched (record; Mon/Tue before today expected regular, Wed on SANS)', null, J(mine), await W.pic(p, '16-member-view'))
  } catch (e) {
    W.rec('s7-ERR', 'script stopped', false, String(e && e.message || e).slice(0, 400), await W.pic(p, 'ERR').catch(() => ''))
  }
  W.rec('errors', 'console / page errors / failed requests', W.errs.length === 0, W.errs.slice(0, 8).join(' || '))
  await b.close()
}
