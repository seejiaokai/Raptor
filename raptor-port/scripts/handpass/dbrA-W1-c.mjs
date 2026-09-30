/* [DB-READINESS] group A FULL walk — W1 part C: three quick edits then an IMMEDIATE reload (8), a week switch (9), a
   saved plan / a day template / Discard (10), OIL Earn on a published weekend day (11). Desktop 1440×900, a fresh world.
   Usage (from raptor-port/scripts/handpass): node dbrA-W1-c.mjs */
import * as W from './dbrA-W1-lib.mjs'
const L = await W.boot('c')
const { WK, WK2, day, ELOG, esc } = W
const IS = new RegExp('^' + esc(WK) + ':is:')
const WKROW = new RegExp('^' + esc(WK) + '$'), WK2ROW = new RegExp('^' + esc(WK2) + '$')
const LW = /^leavewar\//
const browser = await L.launch()
const errors = []
const ctx = await L.context(browser)
const p = await L.page(ctx, errors, 'W1c')
const { T, S, pic, note } = W.table(L, '1440')
await L.signIn(p, 'a')
await W.toEdit(L, p)
await W.toastSpy(p)
const txt = k => p.evaluate(k => window.txtGet(k), k)
const headTxt = async (di) => { const h = await W.head(p, di); return `tag "${h.tag}" · "${h.pending}" · signs [${h.signs.join(' | ')}]${h.nys ? ' · ' + h.nys : ''}` }

/* ---------- 8. three quick edits on three days, then an IMMEDIATE reload ---------- */
{
  const id = 'W1.8'
  const cur = { step: id, width: '1440', did: 'three day notes typed on Tue, Wed, Thu inside about a second, then the page reloaded at once (no wait for the save)', pics: [], shown: '', rows: '', batches: [], notes: [] }
  T.push(cur)
  const n0 = L.results.length
  const rows0 = await L.rows(p)
  await W.showDay(p, 1)
  /* each box: click, select all, type, leave — as fast as a person's hands allow */
  const quick = async (k, v) => { const el = p.locator(`#eWeek [data-txt="${k}"]:visible`).first(); await el.click(); await p.keyboard.press('Control+A'); await p.keyboard.type(v); await el.evaluate(e => e.blur()) }
  const t0 = Date.now()
  await quick('dn:1.0', 'Q1 TUE'); await quick('dn:2.0', 'Q2 WED'); await quick('dn:3.0', 'Q3 THU')
  const ms = Date.now() - t0
  const s1 = await L.state(p)
  await p.reload()
  await L.signIn(p, 'a', { goto: false })
  await W.toEdit(L, p)
  await L.settle(p, 700)
  const s2 = await L.state(p)
  const d = L.stateDiff(s1, s2)
  L.check(`${id} the three edits were made inside ${ms} ms`, ms < 1500, `${ms} ms`)
  L.check(`${id} after the immediate reload all three notes are there and nothing else differs`, !d.length, d.slice(0, 10).join(' || ') || 'identical')
  const got = [await txt('dn:1.0'), await txt('dn:2.0'), await txt('dn:3.0')]
  L.check(`${id} Tue / Wed / Thu read Q1 / Q2 / Q3`, got.join('|') === 'Q1 TUE|Q2 WED|Q3 THU', got.join(' | '))
  const rows1 = await L.rows(p)
  const a = L.audit(rows0, rows1)
  L.check(`${id} every row the three edits wrote (saved at the page's leaving) is named by a change-log batch`, !a.bare.length && !a.wrongOp.length && !a.phantom.length, { bare: a.bare, wrongOp: a.wrongOp, phantom: a.phantom })
  const allowed = [WKROW, day(WK, 0), day(WK, 1), day(WK, 2), day(WK, 3), day(WK, 4), day(WK, 5), day(WK, 6), ELOG]
  L.check(`${id} it wrote only the week's rows and three history lines`, [...a.put, ...a.del].every(k => allowed.some(re => re.test(k))) && a.put.filter(k => ELOG.test(k)).length === 3, [...a.put, ...a.del].join(', '))
  cur.rows = `put ${a.put.length}: ${a.put.join(', ')} · batches: ${a.batches.map(b => `${b.type}/${b.n} by ${b.actorId}`).join(' + ')}`
  cur.shown = `after the reload Tue "${got[0]}", Wed "${got[1]}", Thu "${got[2]}" (typed in ${ms} ms)`
  await W.showDay(p, 1)
  await pic(p, `${id}-2-reloaded`)
  /* and once settled, a second reload writes nothing and gives the same */
  await L.reloadCompare(p, `${id} (a second, ordinary reload)`, 'a', { page: 'editsched' })
  cur.pass = L.results.slice(n0).every(x => x.ok)
  cur.fails = L.results.slice(n0).filter(r => !r.ok).map(r => r.name + ' :: ' + r.detail)
}

/* ---------- 9. week switch ---------- */
const chip = (v) => p.locator(`#weekSeg [data-wk="${v}"]:visible, [data-wk="${v}"]:visible`).first()
await S(p, 'W1.9a', 'the week chip "Jul 20" pressed — the next week opens',
  async () => { await chip('20/07/2026').click(); await p.waitForTimeout(900) },
  /* the next week is PRISTINE (never saved — the settled rule: a pristine week is not stored), so every load of it mints
     its rows' hidden ids afresh; nothing refers to them (no issued version, no history line, no stored row). The reload
     comparison ignores exactly those ids for this step, and only this step — the week's content must still be equal. */
  { expect: { none: true }, ignore: [/\.rid: "rm[0-9a-z]+" → "rm[0-9a-z]+"$/], onScreen: () => W.showDay(p, 0), show: async () => `week ${await p.evaluate(() => window.CURWEEK)} · Monday is ${await p.evaluate(() => window.DATES && window.DATES[0])}` })
await S(p, 'W1.9b', 'next week: Tuesday\'s day note typed (the week\'s first save)',
  () => W.weekText(p, 'dn:1.0', 'W1 NEXT-WEEK TUESDAY'),
  { expect: { put: [WK2ROW, day(WK2, 1), ELOG], also: [/^weeks\/20-07-2026#\d$/], only: true }, onScreen: () => W.showDay(p, 1),
    show: async () => `week ${await p.evaluate(() => window.CURWEEK)} · Tuesday's note "${await txt('dn:1.0')}"` })
const wk2snap = await p.evaluate(() => window.histSnap())
await S(p, 'W1.9c', 'the week chip "Jul 13" pressed — back to the first week',
  async () => { await chip('13/07/2026').click(); await p.waitForTimeout(900) },
  { expect: { none: true }, onScreen: () => W.showDay(p, 1), show: async () => `week ${await p.evaluate(() => window.CURWEEK)} · Tuesday's note "${await txt('dn:1.0')}"` })
{
  await chip('20/07/2026').click(); await p.waitForTimeout(900)
  const again = await p.evaluate(() => window.histSnap())
  L.check('W1.9c after the reload the next week reads exactly as it was left', again === wk2snap, again === wk2snap ? 'identical' : L.stateDiff(JSON.parse(wk2snap), JSON.parse(again)).slice(0, 8).join(' || '))
  await W.showDay(p, 1); await pic(p, 'W1.9c-3-next-week-after-reload')
  T[T.length - 1].shown += ` · next week after the reload: Tuesday's note "${await txt('dn:1.0')}"`
  const r = await L.rows(p)
  note(`W1.9 stored week rows: ${Object.keys(r).filter(k => k.startsWith('weeks/')).sort().join(', ')}`)
  await chip('13/07/2026').click(); await p.waitForTimeout(900)
}

/* ---------- 10. a saved plan, a day template, Discard ---------- */
const THU = 3
async function planMenu(di) {
  const b = p.locator(`#eWeek [data-planmenu="${di}"]:visible`).first()
  await b.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await b.click(); await p.waitForTimeout(500)
  return p.evaluate(() => { const m = [...document.querySelectorAll('.wavemenu')].pop(); return m ? m.innerText.replace(/\s+/g, ' ').trim() : '' })
}
const plans = (di) => p.evaluate(i => ({ list: (window.SCHED.drafts[i] || []).map(x => x.name), live: window.SCHED.curDraft ? window.SCHED.curDraft[i] : null, names: (window.SCHED.drafts[i] || []).map(x => x.name + (window.SCHED.curDraft && window.SCHED.curDraft[i] === x.id ? ' ●' : '')) }), di)
await S(p, 'W1.10a', 'Thursday: the plans menu → "+ Alt Plan" (the working copy duplicated as a saved plan)',
  async () => { await planMenu(THU); await p.locator('.wavemenu .wm[data-plandup]:visible').first().click(); await p.waitForTimeout(700) },
  { expect: { put: [day(WK, THU)], also: [ELOG], only: true }, onScreen: () => W.showDay(p, THU),
    show: async () => `Thursday's plans ${JSON.stringify((await plans(THU)).names)}` })
await S(p, 'W1.10b', 'Thursday (live plan): its day note changed',
  () => W.weekText(p, 'dn:3.0', 'W1 PLAN B NOTE'),
  { expect: { put: [day(WK, THU)], also: [ELOG], only: true }, onScreen: () => W.showDay(p, THU),
    show: async () => `Thursday's note "${await txt('dn:3.0')}" · plans ${JSON.stringify((await plans(THU)).names)}` })
await S(p, 'W1.10c', 'Thursday: the plans menu → the saved plan tapped — brought out as the live day',
  async () => { const t = await planMenu(THU); await p.locator('.wavemenu .wm[data-plansel]:visible').first().click(); await p.waitForTimeout(800); return t },
  { expect: { put: [day(WK, THU)], also: [ELOG], only: true }, onScreen: () => W.showDay(p, THU),
    after: async (a) => note(`W1.10c the menu read: ${a.ret}`),
    show: async () => `Thursday's note "${await txt('dn:3.0')}" · plans ${JSON.stringify((await plans(THU)).names)}` })
L.check('W1.10c the brought-out plan\'s note (Q3 THU) is back after the reload', (await txt('dn:3.0')) === 'Q3 THU', await txt('dn:3.0'))

/* a day template: Tuesday saved as a template, then applied to Wednesday (unpublished) */
async function tplMenu(di) {
  const b = p.locator(`#eWeek .day[data-day="${di}"] [data-daytplopen="${di}"]:visible`).first()
  await b.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await b.click(); await p.waitForTimeout(500)
}
let tname = null
await S(p, 'W1.10d', 'Tuesday: Templates → "+ Save this day as a template"',
  async () => {
    await tplMenu(1); await p.locator('.wavemenu [data-daytplsave]:visible').first().click(); await p.waitForTimeout(700)
    const t = await W.toasts(p); tname = ((t.find(x => /Saved as/.test(x)) || '').match(/"(.+)"/) || [])[1] || null
    const x = p.locator('#daytplClose:visible'); if (await x.count()) { await x.click(); await p.waitForTimeout(400) }
    return { toasts: t, tname }
  },
  { expect: { put: [/^settings\//], only: true }, onScreen: () => W.showDay(p, 1),
    after: async (a) => note(`W1.10d saved: ${JSON.stringify(a.ret)}`),
    show: async () => { await tplMenu(1); const m = await p.evaluate(() => { const m = [...document.querySelectorAll('.wavemenu')].pop(); return m ? m.innerText.replace(/\s+/g, ' ').trim() : '' }); await pic(p, 'W1.10d-3-template-menu'); await p.keyboard.press('Escape'); await p.mouse.click(5, 895); await p.waitForTimeout(300); return `Tuesday's Templates menu after the reload: ${m}` } })
const wedBefore = await p.evaluate(() => JSON.stringify(window.DAYS[2]))
await S(p, 'W1.10e', `Wednesday (unpublished): Templates → "${tname}" picked (twice if the first pick only arms)`,
  async () => {
    const out = []
    for (let i = 0; i < 2; i++) {
      await tplMenu(2)
      await p.locator('.wavemenu [data-daytplpick]:visible').filter({ hasText: tname || 'Template' }).first().click(); await p.waitForTimeout(800)
      const t = await W.toasts(p); out.push(t)
      if (t.some(x => /Applied/.test(x)) || (await p.evaluate(() => JSON.stringify(window.DAYS[2]))) !== wedBefore) break
    }
    return out
  },
  { expect: { put: [day(WK, 2)], also: [ELOG], only: true }, onScreen: () => W.showDay(p, 2),
    after: async (a) => note(`W1.10e toasts: ${JSON.stringify(a.ret)}`),
    show: async () => `Wednesday's note "${await txt('dn:2.0')}" (Tuesday's is "${await txt('dn:1.0')}")` })

/* Discard: Friday published, edited (pending), then "Discard N edits & load" on its Original */
const FRI = 4
await S(p, 'W1.10f', 'Friday: the four signed and Publish day',
  async () => { await W.signDay(p, FRI, 0); return W.publishDay(p, FRI) },
  { expect: { put: [IS, day(WK, FRI)], also: [ELOG, LW], only: true }, onScreen: () => W.showDay(p, FRI), show: async () => headTxt(FRI) })
await S(p, 'W1.10g', 'published Friday: two day notes changed → "2 pending"',
  async () => { await W.weekText(p, 'dn:4.0', 'W1 FRI EDIT 1'); await W.weekText(p, 'dn:4.1', 'W1 FRI EDIT 2') },
  { expect: { put: [day(WK, FRI)], also: [ELOG], only: true }, onScreen: () => W.showDay(p, FRI), show: async () => headTxt(FRI) })
const friOrig = await p.evaluate(() => JSON.stringify(window.SCHED.orig && window.SCHED.orig[4] ? 1 : 0))
await S(p, 'W1.10h', 'Friday: the plans menu → the Original looked at → "Discard 2 edits & load" → confirm',
  async () => {
    await planMenu(FRI)
    await p.locator('.wavemenu .wm[data-planpv]:visible').first().click(); await p.waitForTimeout(700)
    let lbl = ''
    const d1 = p.locator('#eWeek [data-restore]:visible').first()
    if (await d1.count()) { lbl = (await d1.innerText()).trim(); await d1.click(); await p.waitForTimeout(600) }
    const d2 = p.locator('#eWeek [data-restore]:visible').first()
    if (await d2.count()) { lbl += ' → ' + (await d2.innerText()).trim(); await d2.click(); await p.waitForTimeout(800) }
    return { lbl, toasts: await W.toasts(p) }
  },
  { expect: { put: [day(WK, FRI)], also: [ELOG], only: true }, onScreen: () => W.showDay(p, FRI),
    after: async (a) => note(`W1.10h Discard: ${JSON.stringify(a.ret)}`),
    show: async () => `${await headTxt(FRI)} · notes "${await txt('dn:4.0')}" / "${await txt('dn:4.1')}"` })
L.check('W1.10h after the reload Friday reads nothing pending and its notes are the Original\'s', !/pending/.test((await W.head(p, FRI)).pending) && (await txt('dn:4.0')) !== 'W1 FRI EDIT 1', await headTxt(FRI))
/* "Discard marks" on the Amendments panel: the unpublished days' draft marks cleared (one command, several days) */
const pendByDay = () => p.evaluate(() => { const o = {}; for (const k of Object.keys(window.SCHED.pending || {})) { const m = /^(?:[a-z]+:)?(\d+)\./.exec(k); const d = m ? m[1] : '?'; o[d] = (o[d] || 0) + 1 } return o })
note(`W1.10i draft marks by day BEFORE Discard marks: ${JSON.stringify(await pendByDay())}`)
await S(p, 'W1.10i', 'the Amendments panel\'s "Discard marks" (the unpublished days\' draft marks)',
  async () => { const b = p.locator('#alDrop:visible').first(); const off = await b.isDisabled(); if (!off) { await b.click(); await p.waitForTimeout(700) } return { off } },
  { expect: { put: [/^weeks\/13-07-2026#\d$/], also: [ELOG], only: true }, onScreen: () => p.evaluate(() => window.scrollTo(0, 0)),
    after: async (a) => note(`W1.10i the button was ${a.ret.off ? 'OFF' : 'on'}; rows ${[...a.put, ...a.del].join(', ')}; draft marks by day AFTER: ${JSON.stringify(await pendByDay())}`),
    show: async () => `the panel reads "${await p.evaluate(() => (document.querySelector('#alPanel .al-pend') || document.querySelector('#alPanel') || {}).innerText?.replace(/\s+/g, ' ').slice(0, 160))}"` })

/* ---------- 11. OIL Earn on a published weekend day ---------- */
const SAT = 5
await S(p, 'W1.11a', 'Saturday: the four signed and Publish day',
  async () => { await W.signDay(p, SAT, 0); return W.publishDay(p, SAT) },
  { expect: { put: [IS, day(WK, SAT)], also: [ELOG, LW], only: true }, onScreen: () => W.showDay(p, SAT), show: async () => headTxt(SAT) })
const oilPucks = () => p.evaluate(() => [...document.querySelectorAll('#schedBoard [data-oilp]')].filter(e => e.offsetParent !== null).map(e => ({ who: e.dataset.oilp, item: e.dataset.oilitem, on: e.classList.contains('on') && !e.classList.contains('off') })))
const oilOn = async () => { const b = p.locator('#sbOil:visible').first(); const on = await p.evaluate(() => [...document.querySelectorAll('#schedBoard [data-oilitem]')].some(e => e.offsetParent !== null)); if (!on) { await b.click(); await p.waitForTimeout(800) } }
await W.boardOn(p, SAT)
await oilOn()
const ps0 = await oilPucks()
const target = ps0.find(x => x.on)
note(`W1.11 OIL Earn pucks on Saturday: ${JSON.stringify(ps0.slice(0, 12))}`)
await S(p, 'W1.11b', `published Saturday, OIL Earn on the board: ${target && target.who}'s earning switched off (${target && target.item})`,
  async () => {
    const e = p.locator(`#schedBoard [data-oilp="${target.who}"][data-oilitem="${target.item}"]:visible`).first()
    await e.evaluate(x => x.scrollIntoView({ block: 'center' })); await e.click(); await p.waitForTimeout(700)
  },
  { expect: { put: [day(WK, SAT)], also: [ELOG, LW], only: true },
    onScreen: async () => { await W.boardOn(p, SAT); await oilOn(); await W.focus(p, `#schedBoard [data-oilp="${target.who}"][data-oilitem="${target.item}"]`) },
    show: async () => { const ps = await oilPucks(); const t = ps.find(x => x.who === target.who && x.item === target.item); return `OIL Earn reopened after the reload: ${target.who} on ${target.item} is ${t ? (t.on ? 'EARNING' : 'off') : 'NOT DRAWN'} · ${await headTxt(SAT)}` } })
{
  const ps = await oilPucks(); const t = ps.find(x => x.who === target.who && x.item === target.item)
  L.check('W1.11b after the reload his earning is still off', !!t && !t.on, JSON.stringify(t))
}
await W.boardOff(p)

const fails = L.save({ table: T, errors })
console.log('errors:', JSON.stringify(errors, null, 1))
await browser.close()
process.exitCode = fails ? 1 : 0
