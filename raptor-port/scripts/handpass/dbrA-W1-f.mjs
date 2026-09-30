/* [DB-READINESS] group A FULL walk — W1 part F: the scenario designer's 15 and 16 (folded in at the host's word).
   15  a published weekday: edits make it pending (the View-only face stays frozen), then "Discard N edits & load" on its
       Original — the working copy returns EXACTLY to the issued day; reload.
   16  two SAVED weeks, groups of edits with a week switch between each group: + Line (a formation), a puck taken off
       its seat (dragged back to the crew list), a line's remarks box, a line deleted, a drag across two days on each
       week, a duty row deleted — each exactly its own day rows; reload after each group; both weeks as left.
   Desktop 1440×900, fresh worlds. Usage (from raptor-port/scripts/handpass): node dbrA-W1-f.mjs */
import * as W from './dbrA-W1-lib.mjs'
const L = await W.boot('f')
const { WK, WK2, day, ELOG, esc } = W
const IS = new RegExp('^' + esc(WK) + ':is:')
const LW = /^leavewar\//
const WKROW = new RegExp('^' + esc(WK) + '$'), WK2ROW = new RegExp('^' + esc(WK2) + '$')
const browser = await L.launch()
const errors = []
const { T, S, pic, note } = W.table(L, '1440')
const txt = (p, k) => p.evaluate(k => window.txtGet(k), k)
const chip = (p, v) => p.locator(`[data-wk="${v}"]:visible`).first()
const toWeek = async (p, v) => { await W.boardOff(p); await chip(p, v).click(); await p.waitForTimeout(900) }
/* a day's content as the rules read it (the hidden row ids kept — a discard must give them back too) */
const dayJson = (p, di) => p.evaluate(i => JSON.stringify(window.DAYS[i]), di)

/* ======================= 15 ======================= */
{
  const ctx = await L.context(browser)
  const p = await L.page(ctx, errors, 'W1f-15')
  await L.signIn(p, 'a'); await W.toEdit(L, p); await W.toastSpy(p)
  const WED = 2
  const onWed = () => W.showDay(p, WED)
  await S(p, 'W1.F15a', 'Wednesday (a flying day): the four signed and Publish day',
    async () => { await W.signDay(p, WED, 0); return W.publishDay(p, WED) },
    { expect: { put: [IS, day(WK, WED)], also: [WKROW, /^weeks\/13-07-2026#\d$/, ELOG, LW], only: true }, onScreen: onWed,
      show: async () => { const h = await W.head(p, WED); return `tag "${h.tag}" · "${h.pending}"` } })
  const issued = await dayJson(p, WED)
  const note0 = await txt(p, 'dn:2.0')
  await S(p, 'W1.F15b', 'published Wednesday: its day note changed',
    () => W.weekText(p, 'dn:2.0', 'F15 AMENDED NOTE'),
    { expect: { put: [day(WK, WED)], also: [ELOG], only: true }, onScreen: onWed, show: async () => { const h = await W.head(p, WED); return `"${h.pending}" · signs [${h.signs.join(' | ')}]` } })
  const seat = await p.evaluate(() => { const a = window.DAYS[2].waves[0].formations[0].aircraft[0]; return { key: '2.0.0.0.w', was: a.w } })
  const cand = await p.evaluate(() => { const j = JSON.stringify(window.DAYS[2]); return [...document.querySelectorAll('#eRoster .rpuck[data-person]')].map(e => e.dataset.person).filter(k => k !== 'all' && k !== 'allavail' && !j.includes('"' + k + '"')) })
  await S(p, 'W1.F15c', `published Wednesday: a crew puck dragged from the crew list onto the first line's WSO seat (${seat.was} → ${cand[0]})`,
    () => W.drag(p, p.locator(`#eRoster .rpuck[data-person="${cand[0]}"]:visible`).first(), p.locator(`#eWeek [data-slot="${seat.key}"]:visible`).first()),
    { expect: { put: [day(WK, WED)], also: [ELOG], only: true }, onScreen: async () => { await onWed(); await W.focus(p, `#eWeek [data-slot="${seat.key}"]`) },
      show: async () => { const h = await W.head(p, WED); return `"${h.pending}" · the seat holds ${await p.evaluate(() => window.DAYS[2].waves[0].formations[0].aircraft[0].w)}` } })
  /* the issued face on View-only Sched stays as it went out */
  {
    await L.go(p, 'viewsched'); await W.showDay(p, WED, '#vWeek')
    const face = await p.evaluate(() => { const d = document.querySelector('#vWeek .day[data-day="2"]'); return d ? d.innerText.replace(/\s+/g, ' ') : '' })
    L.check('W1.F15c View-only Sched\'s issued face still shows the Original note, not the pending edit', face.includes(note0) && !face.includes('F15 AMENDED NOTE'), face.slice(0, 200))
    await pic(p, 'W1.F15c-3-viewonly-issued-face')
    await W.toEdit(L, p)
  }
  await S(p, 'W1.F15d', 'Wednesday: plans menu → the Original looked at → "Discard N edits & load" → confirm',
    async () => {
      const b = p.locator('#eWeek [data-planmenu="2"]:visible').first()
      await b.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await b.click(); await p.waitForTimeout(500)
      await p.locator('.wavemenu .wm[data-planpv]:visible').first().click(); await p.waitForTimeout(700)
      let lbl = ''
      for (let i = 0; i < 2; i++) { const d = p.locator('#eWeek [data-restore]:visible').first(); if (!(await d.count())) break; lbl += (lbl ? ' → ' : '') + (await d.innerText()).trim(); await d.click(); await p.waitForTimeout(800) }
      return { lbl, toasts: await W.toasts(p) }
    },
    { expect: { put: [day(WK, WED)], also: [ELOG], only: true }, onScreen: onWed,
      after: async (a) => note(`W1.F15d Discard: ${JSON.stringify(a.ret)}`),
      show: async () => { const h = await W.head(p, WED); return `tag "${h.tag}" · "${h.pending}" · note "${await txt(p, 'dn:2.0')}"` } })
  {
    const now = await dayJson(p, WED)
    const d = now === issued ? [] : L.stateDiff(JSON.parse(issued), JSON.parse(now))
    /* `today` is the calendar's "this is today" flag, worked out for the screen; the discard brings the issued copy's
       flag back as false where the live day had none — not something a person made, and not a difference anyone sees */
    const dd = d.filter(x => !/^\.today: undefined → false$/.test(x))
    if (d.length !== dd.length) note('W1.F15d the only field that differs from the issued day is the derived `today` flag (undefined → false)')
    L.check('W1.F15d after the reload Wednesday is EXACTLY the issued day again (content, crew, hidden row ids)', !dd.length, dd.slice(0, 10).join(' || ') || 'identical')
    L.check('W1.F15d …and nothing is pending', !/pending/.test((await W.head(p, WED)).pending))
  }
  await ctx.close()
}

/* ======================= 16 ======================= */
{
  const ctx = await L.context(browser)
  const p = await L.page(ctx, errors, 'W1f-16')
  await L.signIn(p, 'a'); await W.toEdit(L, p); await W.toastSpy(p)
  const snaps = {}
  const keep = async (wk) => { snaps[wk] = await p.evaluate(() => window.histSnap()) }
  /* setup: both weeks saved */
  await S(p, 'W1.F16a', 'setup: week of 13 Jul saved (Monday note)', () => W.weekText(p, 'dn:0.0', 'F16 WK13'),
    { expect: { put: [WKROW, day(WK, 0), ELOG], also: [/^weeks\/13-07-2026#\d$/], only: true }, onScreen: () => W.showDay(p, 0) })
  await S(p, 'W1.F16b', 'the week chip "Jul 20", then its Monday note (the week\'s first save)',
    async () => { await toWeek(p, '20/07/2026'); await W.weekText(p, 'dn:0.0', 'F16 WK20') },
    { expect: { put: [WK2ROW, day(WK2, 0), ELOG], also: [/^weeks\/20-07-2026#\d$/], only: true }, onScreen: () => W.showDay(p, 0) })
  await keep('20')
  await S(p, 'W1.F16c', 'the week chip "Jul 13" — back (a switch writes nothing)', () => toWeek(p, '13/07/2026'),
    { expect: { none: true }, onScreen: () => W.showDay(p, 0) })

  /* group 1 — week 13, the board on Tuesday */
  const TUE = 1
  await W.boardOn(p, TUE)
  const f0 = await p.evaluate(() => window.DAYS[1].waves[0].formations.length)
  await S(p, 'W1.F16d', 'week 13, board (Tue): "+ Line" on the first wave — a formation added',
    async () => { const b = p.locator('#schedBoard [data-gline="1.0"]:visible').first(); await b.evaluate(e => e.scrollIntoView({ block: 'center' })); await b.click(); await p.waitForTimeout(600) },
    { expect: { put: [day(WK, TUE)], also: [ELOG], only: true }, onScreen: async () => { await W.boardOn(p, TUE); await W.focus(p, '#schedBoard [data-gline="1.0"]') },
      show: async () => `Tuesday's first wave has ${await p.evaluate(() => window.DAYS[1].waves[0].formations.length)} formations (was ${f0})` })
  const off = await p.evaluate(() => { const a = window.DAYS[1].waves[0].formations[0].aircraft[0]; return { key: '1.0.0.0.w', who: a.w } })
  await S(p, 'W1.F16e', `week 13, board (Tue): a puck (${off.who}) dragged off its seat back onto the crew list`,
    async () => { await W.boardOn(p, TUE); await W.drag(p, p.locator(`#schedBoard [data-slot="${off.key}"] .puck:visible`).first(), p.locator('#sbRoster:visible').first()) },
    { expect: { put: [day(WK, TUE)], also: [ELOG], only: true }, onScreen: async () => { await W.boardOn(p, TUE); await W.focus(p, `#schedBoard [data-slot="${off.key}"]`) },
      show: async () => `the seat ${off.key} holds "${await p.evaluate(() => window.DAYS[1].waves[0].formations[0].aircraft[0].w)}" (was ${off.who})` })
  await keep('13')
  await S(p, 'W1.F16f', 'the week chip "Jul 20" (a switch writes nothing)', () => toWeek(p, '20/07/2026'), { expect: { none: true }, onScreen: () => W.showDay(p, 0) })
  L.check('W1.F16f week 20 reads exactly as it was left', (await p.evaluate(() => window.histSnap())) === snaps['20'])

  /* group 2 — week 20, the board on Wednesday */
  const WED = 2
  await W.boardOn(p, WED)
  const fr = await p.evaluate(() => { const e = [...document.querySelectorAll('#schedBoard [data-bfld^="fr:2."]')].find(x => x.offsetParent); return e ? e.dataset.bfld : null })
  await S(p, 'W1.F16g', `week 20, board (Wed): a line's remarks box (${fr}) typed`,
    () => W.boardText(p, fr, 'F16 REMARK'),
    { expect: { put: [day(WK2, WED)], also: [ELOG], only: true }, onScreen: async () => { await W.boardOn(p, WED); await W.focus(p, `#schedBoard [data-bfld="${fr}"]`) },
      show: async () => `remarks "${await txt(p, fr)}"` })
  const lineKey = await p.evaluate(() => { const e = [...document.querySelectorAll('#schedBoard [data-ldel]')].find(x => x.offsetParent); return e ? e.dataset.ldel : null })
  const nAc = await p.evaluate(k => { const [di, gi, li] = k.split('.').map(Number); return window.DAYS[di].waves[gi].formations[li].aircraft.length }, lineKey)
  await S(p, 'W1.F16h', `week 20, board (Wed): a line deleted by its ✕ (${lineKey})`,
    async () => { const b = p.locator(`#schedBoard [data-ldel="${lineKey}"]:visible`).first(); await b.evaluate(e => e.scrollIntoView({ block: 'center' })); await b.click(); await p.waitForTimeout(600)
      if (await b.count() && (await p.evaluate(k => { const [di, gi, li] = k.split('.').map(Number); const f = window.DAYS[di].waves[gi].formations[li]; return f ? f.aircraft.length : -1 }, lineKey)) === nAc) { await b.click().catch(() => {}); await p.waitForTimeout(600) } },
    { expect: { put: [day(WK2, WED)], also: [ELOG], only: true }, onScreen: async () => { await W.boardOn(p, WED); await W.focus(p, '#schedBoard [data-gline="2.0"]') },
      show: async () => `the formation now has ${await p.evaluate(k => { const [di, gi, li] = k.split('.').map(Number); const f = window.DAYS[di].waves[gi].formations[li]; return f ? f.aircraft.length : 'gone' }, lineKey)} line(s) (was ${nAc})` })
  await keep('20')
  await S(p, 'W1.F16i', 'the week chip "Jul 13" (a switch writes nothing)', () => toWeek(p, '13/07/2026'), { expect: { none: true }, onScreen: () => W.showDay(p, 0) })
  L.check('W1.F16i week 13 reads exactly as it was left', (await p.evaluate(() => window.histSnap())) === snaps['13'])

  /* group 3 — week 13: a drag across two days on the week, a duty row deleted on the board */
  {
    const src = await p.evaluate(() => { const d = window.DAYS[2]; const a = d.waves[0].formations[0].aircraft[0]; return { key: '2.0.0.0.p', who: a.p } })
    /* Thursday's first Common Programme row (near the top of the day, so both ends of the drag sit in one window) */
    const fill = await p.evaluate(who => { const a = window.DAYS[3].allhands.findIndex(r => !(Array.isArray(r.who) ? r.who : [r.who]).includes(who)); return a >= 0 ? `a:3.${a}.+` : null }, src.who)
    await S(p, 'W1.F16j', `week 13: Wednesday's ${src.key} puck (${src.who}) dragged onto Thursday's Common Programme row (${fill})`,
      async () => { await W.showDay(p, 2); await W.drag(p, p.locator(`#eWeek [data-slot="${src.key}"] .puck:visible`).first(), p.locator(`#eWeek [data-fill="${fill}"]:visible`).first()) },
      { expect: { put: [day(WK, 2), day(WK, 3), ELOG], only: true }, onScreen: async () => { await W.showDay(p, 2); await W.focus(p, `#eWeek [data-fill="${fill}"]`) },
        show: async () => p.evaluate(who => `Wednesday names him: ${JSON.stringify(window.DAYS[2]).includes('"' + who + '"')} · Thursday names him: ${JSON.stringify(window.DAYS[3]).includes('"' + who + '"')}`, src.who) })
  }
  await W.boardOn(p, 3)
  const drKey = await p.evaluate(() => { const e = [...document.querySelectorAll('#schedBoard [data-drdel]')].find(x => x.offsetParent); return e ? e.dataset.drdel : null })
  const nDr = await p.evaluate(k => { const [di, wi] = k.split('.').map(Number); return window.DAYS[di].dutywaves[wi].rows.length }, drKey)
  await S(p, 'W1.F16k', `week 13, board (Thu): a duty row deleted by its ✕ (${drKey})`,
    async () => { const b = p.locator(`#schedBoard [data-drdel="${drKey}"]:visible`).first(); await b.evaluate(e => e.scrollIntoView({ block: 'center' })); await b.click(); await p.waitForTimeout(600) },
    { expect: { put: [day(WK, 3)], also: [ELOG], only: true }, onScreen: async () => { await W.boardOn(p, 3); await W.focus(p, '#schedBoard [data-dwadd="3"]') },
      show: async () => `the duty block has ${await p.evaluate(k => { const [di, wi] = k.split('.').map(Number); return window.DAYS[di].dutywaves[wi].rows.length }, drKey)} rows (was ${nDr})` })
  await keep('13')
  await S(p, 'W1.F16l', 'the week chip "Jul 20" (a switch writes nothing)', () => toWeek(p, '20/07/2026'), { expect: { none: true }, onScreen: () => W.showDay(p, 0) })
  L.check('W1.F16l week 20 reads exactly as it was left', (await p.evaluate(() => window.histSnap())) === snaps['20'])

  /* group 4 — week 20: a drag across two days */
  {
    const src = await p.evaluate(() => { const d = window.DAYS[0]; const a = d.waves[0].formations[0].aircraft[0]; return { key: '0.0.0.0.w', who: a.w } })
    const fill = await p.evaluate(who => { const a = window.DAYS[1].allhands.findIndex(r => !(Array.isArray(r.who) ? r.who : [r.who]).includes(who)); return a >= 0 ? `a:1.${a}.+` : null }, src.who)
    await S(p, 'W1.F16m', `week 20: Monday's ${src.key} puck (${src.who}) dragged onto Tuesday (${fill})`,
      async () => { await W.showDay(p, 0); await W.drag(p, p.locator(`#eWeek [data-slot="${src.key}"] .puck:visible`).first(), p.locator(`#eWeek [data-fill="${fill}"]:visible`).first()) },
      { expect: { put: [day(WK2, 0), day(WK2, 1), ELOG], only: true }, onScreen: async () => { await W.showDay(p, 0); await W.focus(p, `#eWeek [data-fill="${fill}"]`) },
        show: async () => p.evaluate(who => `week ${window.CURWEEK}: Monday names him: ${JSON.stringify(window.DAYS[0]).includes('"' + who + '"')} · Tuesday names him: ${JSON.stringify(window.DAYS[1]).includes('"' + who + '"')}`, src.who) })
  }
  await keep('20')
  /* both weeks as left, after one more reload each */
  {
    await p.reload(); await L.signIn(p, 'a', { goto: false }); await W.toEdit(L, p)
    const w13 = await p.evaluate(() => window.histSnap())
    await toWeek(p, '20/07/2026')
    const w20 = await p.evaluate(() => window.histSnap())
    L.check('W1.F16 after a last reload week 13 reads exactly as left', w13 === snaps['13'], w13 === snaps['13'] ? 'identical' : L.stateDiff(JSON.parse(snaps['13']), JSON.parse(w13)).slice(0, 8).join(' || '))
    L.check('W1.F16 …and week 20 too', w20 === snaps['20'], w20 === snaps['20'] ? 'identical' : L.stateDiff(JSON.parse(snaps['20']), JSON.parse(w20)).slice(0, 8).join(' || '))
    await W.showDay(p, 0); await pic(p, 'W1.F16-3-week20-final')
  }
  await ctx.close()
}

const fails = L.save({ table: T, errors })
console.log('errors:', JSON.stringify(errors, null, 1))
await browser.close()
process.exitCode = fails ? 1 : 0
