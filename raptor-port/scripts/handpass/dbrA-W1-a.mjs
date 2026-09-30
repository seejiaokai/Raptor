/* [DB-READINESS] group A FULL walk — W1 part A: the first boot, edits on Edit Schedule (1), the week's drag (2), the
   board's gestures (3), and edit → Undo back to pristine → reload (4). Desktop 1440×900, a fresh world.
   Usage (from raptor-port/scripts/handpass): node dbrA-W1-a.mjs */
import * as W from './dbrA-W1-lib.mjs'
const L = await W.boot('a')
const { WK, day, ELOG } = W
const browser = await L.launch()
const errors = []
const ctx = await L.context(browser)
const p = await L.page(ctx, errors, 'W1a')
const { T, S, pic, note } = W.table(L, '1440')

/* ---------- 0. the first boot ---------- */
await L.signIn(p, 'a')
await L.settle(p)
{
  const r = await L.rows(p)
  const byCol = {}
  for (const k of Object.keys(r)) { const c = k.split('/')[0]; byCol[c] = (byCol[c] || 0) + 1 }
  const bs = Object.keys(r).filter(k => k.startsWith('changes/')).map(k => JSON.parse(r[k]))
  const cur = { step: 'W1.0', width: '1440', did: 'fresh browser, signed in as Saber', pics: [], shown: '', rows: `rows by collection ${JSON.stringify(byCol)} · batches ${bs.map(b => b.type + '/' + b.items.length).join(' ')}`, batches: [], notes: [] }
  T.push(cur)
  const n0 = L.results.length
  L.check('W1.0 the first boot wrote ONE change-log batch, of type boot', bs.length === 1 && bs[0].type === 'boot', bs.map(b => b.type))
  L.check('W1.0 every row the boot wrote is named by that batch', (() => { const named = new Set(bs[0].items.map(i => i.key)); return Object.keys(r).filter(k => !k.startsWith('changes/') && k !== 'settings/schema' && !named.has(k)) })().length === 0,
    (() => { const named = new Set(bs[0].items.map(i => i.key)); return Object.keys(r).filter(k => !k.startsWith('changes/') && !named.has(k)).join(', ') || 'all named' })())
  L.check('W1.0 a pristine week is not stored (no weeks/ row)', !Object.keys(r).some(k => k.startsWith('weeks/')), Object.keys(r).filter(k => k.startsWith('weeks/')).join(','))
  await W.toEdit(L, p)
  await pic(p, 'W1.0-boot-editweek')
  cur.pass = L.results.slice(n0).every(x => x.ok)
  cur.shown = 'Edit Schedule, week of 13 Jul, every day a draft'
}
await W.toastSpy(p)

/* ---------- 1. edits on Edit Schedule ---------- */
await W.toEdit(L, p)
const noteOf = (k) => p.evaluate(k => window.txtGet(k), k)
await S(p, 'W1.1a', 'Monday: a day note typed on Edit Schedule (the week\'s first save)',
  () => W.weekText(p, 'dn:0.0', 'W1 MONDAY NOTE'),
  /* the week's first save: its week row and the day it changed ONLY (the group walk's fix H3 — before it, all seven) */
  { expect: { put: [new RegExp('^' + W.esc(WK) + '$'), day(WK, 0), ELOG], only: true },
    onScreen: () => W.showDay(p, 0), show: async () => `Monday's first note reads "${await noteOf('dn:0.0')}"` })
const monNote = await noteOf('dn:0.0')
L.check('W1.1a the note is on Monday after the reload', monNote === 'W1 MONDAY NOTE', monNote)

/* a crew puck on a flying line: a name dragged from the crew palette onto Monday's first line's WSO seat */
const seat = '0.0.0.0.w'
const was = await p.evaluate(s => { const [di, gi, li, ai] = s.split('.').map(Number); return window.DAYS[di].waves[gi].formations[li].aircraft[ai].w }, seat)
const cand = await p.evaluate(() => { const j = JSON.stringify(window.DAYS[0]); return [...document.querySelectorAll('#eRoster .rpuck[data-person]')].map(e => e.dataset.person).filter(k => k !== 'all' && k !== 'allavail' && !j.includes('"' + k + '"')) })
const newW = cand[0]
await S(p, 'W1.1b', `Monday: a crew puck dragged from the crew palette onto the first flying line's WSO seat (${was} → ${newW})`,
  async () => {
    await W.drag(p, p.locator(`#eRoster .rpuck[data-person="${newW}"]:visible`).first(), p.locator(`#eWeek [data-slot="${seat}"]:visible`).first())
  },
  { expect: { put: [day(WK, 0), ELOG], only: true }, onScreen: async () => { await W.showDay(p, 0); await W.focus(p, `#eWeek [data-slot="${seat}"]`) },
    show: async () => `Monday's first line's WSO seat holds ${await p.evaluate(() => { const id = window.DAYS[0].waves[0].formations[0].aircraft[0].w; return (window.PEOPLE[id] || {}).cs + ' (' + id + ')' })}` })
L.check('W1.1b the new WSO is on the seat after the reload', (await p.evaluate(() => window.DAYS[0].waves[0].formations[0].aircraft[0].w)) === newW)

await S(p, 'W1.1c', 'Wednesday: a day note typed on Edit Schedule',
  () => W.weekText(p, 'dn:2.0', 'W1 WEDNESDAY NOTE'),
  { expect: { put: [day(WK, 2), ELOG], only: true }, onScreen: () => W.showDay(p, 2), show: async () => `Wednesday's note reads "${await noteOf('dn:2.0')}"` })

/* ---------- 2. the week's drag: a puck from Monday to Tuesday ---------- */
/* Monday's second wave, first line's pilot, dragged onto Tuesday's ground programme's "+ add" cell */
{
  const src = await p.evaluate(() => ({ key: '0.1.0.1.w', who: window.DAYS[0].waves[1].formations[0].aircraft[1].w }))
  const tueFill = await p.evaluate(who => {
    const d1 = window.DAYS[1]
    /* a ground row he is not on (one man, once per row) */
    const gi = d1.ground.findIndex(g => g.who !== who && !(g.more || []).includes(who))
    return gi >= 0 ? `g:1.${gi}.+` : null
  }, src.who)
  const before = await p.evaluate(() => ({ mon: JSON.stringify(window.DAYS[0]), tue: JSON.stringify(window.DAYS[1]) }))
  await S(p, 'W1.2', `the week's drag: Monday's ${src.key} puck (${src.who}) dragged onto Tuesday's ground row (${tueFill})`,
    async () => {
      await W.showDay(p, 0)
      await W.drag(p, p.locator(`#eWeek [data-slot="${src.key}"] .puck:visible`).first(), p.locator(`#eWeek [data-fill="${tueFill}"]:visible`).first())
    },
    { expect: { put: [day(WK, 0), day(WK, 1), ELOG], only: true }, onScreen: async () => { await W.showDay(p, 0); await W.focus(p, `#eWeek [data-fill="${tueFill}"]`) },
      show: async () => p.evaluate(who => `Monday still names him: ${JSON.stringify(window.DAYS[0]).includes('"' + who + '"')} · Tuesday names him: ${JSON.stringify(window.DAYS[1]).includes('"' + who + '"')}`, src.who) })
  const after = await p.evaluate(() => ({ mon: JSON.stringify(window.DAYS[0]), tue: JSON.stringify(window.DAYS[1]) }))
  note(`W1.2 Monday changed: ${after.mon !== before.mon} · Tuesday changed: ${after.tue !== before.tue}`)
}

/* ---------- 3. the board, Monday ---------- */
await W.boardOn(p, 0)
/* (a) a crew seat filled from the palette: arm an empty sim seat, tap a name in the board's crew palette */
{
  const empty = await p.evaluate(() => [...document.querySelectorAll('#schedBoard [data-slot^="s:0."]')].filter(e => e.offsetParent && !e.querySelector('[data-person]')).map(e => e.dataset.slot)[0] || null)
  const free = await p.evaluate(() => { const j = JSON.stringify(window.DAYS[0]); return [...document.querySelectorAll('#sbRoster .rpuck[data-person]')].filter(e => e.offsetParent).map(e => e.dataset.person).filter(k => k !== 'all' && k !== 'allavail' && !j.includes('"' + k + '"')) })
  await S(p, 'W1.3a', `board (Mon): an empty crew seat (${empty}) armed and filled from the crew palette (${free[0]})`,
    async () => {
      const s = p.locator(`#schedBoard [data-slot="${empty}"]:visible`).first()
      await s.evaluate(e => e.scrollIntoView({ block: 'center' })); await s.click(); await p.waitForTimeout(300)
      const armed = await p.evaluate(() => window.ARM && window.ARM.key)
      const pk = p.locator(`#sbRoster .rpuck[data-person="${free[0]}"]:visible`).first()
      await pk.evaluate(e => e.scrollIntoView({ block: 'center' })); await pk.click(); await p.waitForTimeout(400)
      return { armed }
    },
    { expect: { put: [day(WK, 0), ELOG], only: true }, after: async (a) => note(`W1.3a armed ${JSON.stringify(a.ret)}`), onScreen: async () => { await W.boardOn(p, 0); await W.focus(p, `#schedBoard [data-slot="${empty}"]`) },
      show: async () => `the seat ${empty} holds ${await p.evaluate(k => { const e = document.querySelector('#schedBoard [data-slot="' + k + '"] [data-person]'); return e ? e.dataset.person : 'NOBODY' }, empty)} (the board reopened after the reload)` })
  await W.boardOn(p, 0)
}
/* (b) + Wave → a flying wave */
{
  const w0 = await p.evaluate(() => window.DAYS[0].waves.length)
  await S(p, 'W1.3b', 'board (Mon): + Wave → a flying wave added',
    async () => {
      const b = p.locator('#schedBoard [data-wvadd="0"]:visible').first()
      await b.evaluate(e => e.scrollIntoView({ block: 'center' })); await b.click(); await p.waitForTimeout(500)
      const k = p.locator('[data-wmkind=""]:visible').first()
      if (await k.count()) { await k.click(); await p.waitForTimeout(600) }
    },
    { expect: { put: [day(WK, 0), ELOG], only: true }, onScreen: async () => { await W.boardOn(p, 0); await W.focus(p, `#schedBoard [data-move="mv:w.0.${w0}"]`) },
      show: async () => `Monday has ${await p.evaluate(() => window.DAYS[0].waves.length)} waves (was ${w0})` })
  await W.boardOn(p, 0)
}
/* (c) a row deleted: the second Common Programme item's ✕ */
{
  const p0 = await p.evaluate(() => window.DAYS[0].allhands.map(a => a.prog))
  await S(p, 'W1.3c', `board (Mon): a Common Programme row deleted by its ✕ ("${p0[1]}")`,
    async () => {
      const x = p.locator('#schedBoard [data-pdel="0.1"]:visible').first()
      await x.evaluate(e => e.scrollIntoView({ block: 'center' })); await x.click(); await p.waitForTimeout(600)
      if ((await p.evaluate(() => window.DAYS[0].allhands.length)) === p0.length) { const again = p.locator('#schedBoard [data-pdel="0.1"]:visible').first(); if (await again.count()) { await again.click(); await p.waitForTimeout(600) } }
    },
    { expect: { put: [day(WK, 0), ELOG], only: true }, onScreen: () => W.boardOn(p, 0),
      show: async () => `Monday's Common Programme: ${JSON.stringify(await p.evaluate(() => window.DAYS[0].allhands.map(a => a.prog)))}` })
  await W.boardOn(p, 0)
}
/* (d) a section dragged: Overall Notes by its ⠿ below the section after next */
{
  const secs = () => p.evaluate(() => [...document.querySelectorAll('#schedBoard [data-secmove^="0."]')].filter(e => e.offsetParent !== null).map(e => e.dataset.secmove.split('.')[1]))
  const s0 = await secs()
  const target = s0[s0.indexOf('notes') + 2] || s0[s0.length - 1]
  const { dragTo } = await import('./am/w1-lib.mjs')
  await S(p, 'W1.3d', `board (Mon): the Overall Notes section dragged by its ⠿ onto "${target}"`,
    async () => {
      const how = await dragTo(p, p.locator('#schedBoard [data-secmove="0.notes"] .secgrip:visible').first(), p.locator(`#schedBoard [data-secmove="0.${target}"]:visible`).first())
      await p.waitForTimeout(400)
      /* the "Set default order?" offer that follows a section drag is left alone (it is its own choice) */
      return { how, s1: await secs() }
    },
    { expect: { put: [day(WK, 0)], also: [ELOG], only: true }, onScreen: () => W.boardOn(p, 0), after: async (a) => note(`W1.3d drag: ${JSON.stringify(a.ret)} (before ${JSON.stringify(s0)})`),
      show: async () => { await W.boardOn(p, 0); return `Monday's board sections: ${JSON.stringify(await secs())} (before the drag ${JSON.stringify(s0)})` } })
}
await W.boardOff(p)

/* ---------- 4. edit → Undo back to pristine → reload (its own fresh world: a reload between would end the undo list) ---------- */
{
  const ctx2 = await L.context(browser)
  const q = await L.page(ctx2, errors, 'W1a-pristine')
  await L.signIn(q, 'a')
  await W.toEdit(L, q)
  await W.toastSpy(q)
  const snap0 = await q.evaluate(() => window.histSnap())
  await S(q, 'W1.4a', 'fresh world: Monday note typed (no reload — the Undo comes next)',
    () => W.weekText(q, 'dn:0.0', 'W1 PRISTINE TEST'),
    { reload: false, expect: { put: [new RegExp('^' + W.esc(WK) + '$'), day(WK, 0), ELOG], also: [/^weeks\//], only: true }, onScreen: () => W.showDay(q, 0) })
  let u = null
  await S(q, 'W1.4b', 'the top bar\'s ↶ Undo — back to pristine; then reload',
    async () => { u = await W.door(q, 'top', 'undo'); return u },
    { onScreen: () => W.showDay(q, 0),
      after: async (a) => note(`W1.4b Undo: ${JSON.stringify(a.ret)}; the week equals the pristine snapshot before the reload: ${(await q.evaluate(() => window.histSnap())) === snap0}`),
      show: async () => {
        const r = await L.rows(q)
        const wk = Object.keys(r).filter(k => k.startsWith('weeks/'))
        return `after the reload Monday's note reads "${await q.evaluate(() => window.txtGet('dn:0.0'))}"; stored week rows: ${wk.length ? wk.join(', ') : 'none'}`
      } })
  const after = await q.evaluate(() => window.histSnap())
  /* a day with no stored row re-mints its hidden ids at every load (fix H3): set aside exactly those, on exactly such days */
  const stored4 = await L.rows(q)
  const wid4 = String(WK).replace(/\//g, '-')
  const lost4 = L.stateDiff(JSON.parse(snap0), JSON.parse(after)).filter(x => { const m = /^\.d\.(\d+)\..*\.rid: /.exec(x); return !(m && !(`weeks/${wid4}#${m[1]}` in stored4)) })
  L.check('W1.4 after the Undo and a reload the week reads exactly as it did before the edit', !lost4.length, lost4.length ? lost4.slice(0, 8).join(' || ') : 'identical (hidden ids of never-saved days set aside)')
  L.check('W1.4 the reload does NOT show the edit', (await q.evaluate(() => window.txtGet('dn:0.0'))) !== 'W1 PRISTINE TEST')
  await ctx2.close()
}

const fails = L.save({ table: T, errors })
console.log('errors:', JSON.stringify(errors, null, 1))
await browser.close()
process.exitCode = fails ? 1 : 0
