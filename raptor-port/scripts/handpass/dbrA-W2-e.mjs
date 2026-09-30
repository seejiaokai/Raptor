/* [DB-READINESS] group A FULL walk — W2 part E: the change history and the squadron's settings (brief §W2 steps 9, 10;
   the independent designer's scenario 21): a MEMBER marks his new changes seen (a day's "N new" on View-only Sched) and
   signs out and in; the admin's clock (Edit Schedule) → Mark all as seen; three quick edits then an immediate reload;
   Admin → Data → Clear edit history… (a period with none, then today); the Logic page's rule; the stores list; the wave
   and duty templates. Tab A = Saber (admin), tab B = Ranger (member), one browser.
   Run from raptor-port/scripts/handpass: node dbrA-W2-e.mjs            */
process.env.HP_URL ||= 'http://localhost:4202'
process.env.HP_SHOTS ||= 'C:/Users/User/projects/Raptor/raptor-port/docs/img/handpass/2026-09-30-dbrA/W2'
process.env.HP_OUT ||= 'C:/Users/User/projects/Raptor/raptor-port/docs/handpass/parts/dbrA-W2-e.json'
const H = await import('./dbrA-W2-lib.mjs')
const { L, W, sleep, TODAY } = H

const browser = await L.launch()
const ctx = await L.context(browser)
const errors = []
const A = await L.page(ctx, errors, 'A')
await L.signIn(A, 'a'); await L.settle(A); await H.toastSpy(A)
const ELOG = /^settings\/elog:/
const elogN = pg => pg.evaluate(() => (window.ELOG && window.ELOG.rows || []).length)
const storedElog = async pg => Object.keys(await L.rows(pg)).filter(k => k.startsWith('settings/elog:')).length

/* ====== a member marks his changes seen ====== */
/* the fixture: Saber files a Training for Blade on Thu 16 Jul — it lands on Thursday, and its history line is new to
   Ranger (a seeded account reads every other person's line as new) */
await W(A, {
  id: 'W2-09a', what: 'fixture — Saber files a Training for Blade on Thu 16 Jul (it lands on Thursday; its history line)',
  fn: () => H.fileReq(A, { person: 'slash', type: 'Training', from: '2026-07-16', remarks: 'W2 history fixture' }),
  expect: { put: [/^inputs\//, ELOG], also: [/^weeks\//], only: true }, reload: false,
})
const B = await L.page(ctx, errors, 'B')
await L.signIn(B, 'm'); await L.settle(B); await H.toastSpy(B)
const dayNew = (pg, di) => pg.evaluate(i => { const b = document.querySelector(`#vWeek [data-chgday="${i}"][data-chgtab="new"]`); return b ? b.textContent.replace(/\s+/g, ' ').trim() : null }, di)
L.check('W2-09b — before: Ranger\'s View-only Sched shows Thursday "1 new"', !!(await dayNew(B, 3)), await dayNew(B, 3))
await W(B, {
  id: 'W2-09b', who: 'm', focus: '#vWeek .day[data-day="3"]', what: 'Ranger (member), View-only Sched: Thursday\'s "N new" → the changes window → ✓ Mark all as seen',
  fn: async () => {
    const b = B.locator('#vWeek [data-chgday="3"][data-chgtab="new"]:visible').first()
    await b.scrollIntoViewIfNeeded(); await b.click(); await sleep(600)
    await H.pic(B, 'W2-09b-window')
    await B.locator('.chgwin .cw-seen').click(); await sleep(500)
    const x = B.locator('.chgwin .win-x').first(); if (await x.count()) { await x.click(); await sleep(300) }
    return 'marked'
  },
  expect: { put: [/^settings\/seen:bane$/], only: true },
  check: async () => ({ what: 'Thursday no longer says "new" for him', ok: !(await dayNew(B, 3)), detail: await dayNew(B, 3) }),
  after: async () => { const n = await dayNew(B, 3); return { what: 'still seen after the reload', ok: !n, detail: n, said: `Thursday: ${n || 'nothing new'}` } },
})
{
  const n0 = L.results.length
  const r0 = await L.rows(B)
  await H.signOut(B); await L.signIn(B, 'm', { goto: false }); await L.settle(B)
  const d = L.diff(r0, await L.rows(B))
  L.check('W2-09c — signing out and in (Ranger) wrote nothing', !d.put.length && !d.del.length && !d.newBatches.length, d)
  const n = await dayNew(B, 3)
  L.check('W2-09c — after signing out and in, Thursday is still seen', !n, n)
  const pic = await H.pic(B, 'W2-09c-b')
  const rs = L.results.slice(n0)
  H.TABLE.push({ step: 'W2-09c', width: 'desktop', what: 'Ranger signs out (Logout) and in again', afterReload: `Thursday: ${n || 'nothing new'}`, rows: 'none', pass: rs.every(r => r.ok), fails: rs.filter(r => !r.ok).map(r => `${r.name}: ${r.detail}`), pics: [pic] })
}

/* ====== the admin's clock: a line by Ranger is new to Saber ====== */
await W(B, {
  id: 'W2-09d', who: 'm', what: 'fixture — Ranger (member) files an Appointment for himself on Tue 14 Jul (Inputs page)',
  fn: () => H.fileReq(B, { type: 'Appointment', from: '2026-07-14', remarks: 'W2 member line' }),
  expect: { put: [/^inputs\//, ELOG], also: [/^weeks\//], only: true }, reload: false,
})
await A.reload(); await L.signIn(A, 'a', { goto: false }); await L.settle(A); await H.toastSpy(A)
await L.go(A, 'editsched')
const clockN = () => A.evaluate(() => { const b = document.querySelector('#histBtn .chgnum'); return b ? b.textContent.trim() : null })
L.check('W2-09e — before: Saber\'s clock on Edit Schedule shows a number new to him', !!(await clockN()), await clockN())
await W(A, {
  id: 'W2-09e', what: 'Saber, Edit Schedule: the clock → the changes window (New to you) → ✓ Mark all as seen',
  fn: async () => {
    await A.click('#histBtn'); await sleep(600)
    await H.pic(A, 'W2-09e-window')
    await A.locator('.chgwin .cw-seen').click(); await sleep(500)
    const x = A.locator('.chgwin .win-x').first(); if (await x.count()) { await x.click(); await sleep(300) }
    return 'marked'
  },
  expect: { put: [/^settings\/seen:stiff$/], only: true },
  check: async () => ({ what: 'the clock carries no number', ok: !(await clockN()), detail: await clockN() }),
  pg: 'editsched',
  after: async () => { await L.go(A, 'editsched'); const n = await clockN(); return { what: 'no number after the reload', ok: !n, detail: n, said: `clock: ${n || 'no number'}` } },
})

/* ====== three quick edits, then an IMMEDIATE reload (no wait for the save) ====== */
{
  const id = 'W2-09f', n0 = L.results.length
  await L.go(A, 'quals'); await A.click('#qViewA').catch(() => {}); await sleep(200)
  if (await A.locator('#qEdit:visible').count()) { await A.click('#qEdit'); await sleep(300) }
  const PID = 'drill'
  /* three ordinary qualification cells of one man, each flipped (ticked or cleared) — whatever each held before */
  const keys = await A.evaluate(id => [...document.querySelectorAll(`#qtbl td[data-q^="${id}|"]`)].map(x => x.getAttribute('data-q').split('|')[1]).filter(k => !['san', 'sxo', 'sched'].includes(k) && !/^sc|aar/i.test(k)).slice(0, 3), PID)   // three that do not cascade into one another (SC DAY → SC NIGHT, DAAR → NAAR)
  const was = await A.evaluate(([id, ks]) => ks.map(k => !!window.PEOPLE[id].quals[k]), [PID, keys])
  const r0 = await L.rows(A), e0 = await elogN(A)
  for (const k of keys) { const c = A.locator(`#qtbl td[data-q="${PID}|${k}"]`).first(); await c.scrollIntoViewIfNeeded(); await c.click(); await sleep(120) }
  const held = await A.evaluate(([id, ks]) => ks.map(k => !!window.PEOPLE[id].quals[k]), [PID, keys])
  const pa = await H.pic(A, `${id}-a`)
  const rc = await L.reloadCompare(A, id, 'a')     // reads the app's state, then reloads AT ONCE — no settle before it
  const r1 = await L.rows(A), au = L.audit(r0, r1)
  L.check(`${id} — every row the three edits wrote is named by a change-log batch`, !au.bare.length && !au.wrongOp.length && !au.phantom.length, { bare: au.bare, batches: au.batches.map(b => `${b.type}/${b.n}`) })
  const after = await A.evaluate(([id, ks]) => ks.map(k => !!window.PEOPLE[id].quals[k]), [PID, keys])
  const e1 = await elogN(A)
  const flipped = xs => xs.every((v, i) => v === !was[i])
  L.check(`${id} — after the immediate reload all three changes are there, and their three history lines`, flipped(held) && flipped(after) && e1 - e0 === 3, { keys, was, held, after, lines: e1 - e0 })
  await L.go(A, 'quals'); await A.click('#qViewA').catch(() => {}); const el = A.locator(`#qtbl td.qname[data-person="${PID}"]`).first(); if (await el.count()) await el.evaluate(e => e.scrollIntoView({ block: 'center' }))
  const pb = await H.pic(A, `${id}-b`)
  const rs = L.results.slice(n0)
  H.TABLE.push({ step: id, width: 'desktop', what: `Quals: three of Ledger's qualification boxes flipped in under a second (${keys.join(', ')}), then an immediate reload`, afterReload: `before ${was.join(',')} → after the reload ${after.join(',')}; ${e1 - e0} new history lines`, rows: `put ${au.put.length} [${au.put.join(', ')}] · batches ${au.batches.map(b => `${b.type}/${b.n}`).join(' ')}`, pass: rs.every(r => r.ok), fails: rs.filter(r => !r.ok).map(r => `${r.name}: ${r.detail}`), pics: [pa, pb] })
}

/* ====== Admin → Data → Clear edit history… ====== */
async function dataPane() {
  await H.closeBoard(A); await L.go(A, 'admin')
  const t = A.locator('[data-admcat="data"]:visible, .adm-cat:has-text("Data"):visible').first()
  if (await t.count()) { await t.click(); await sleep(400) }
  await A.waitForSelector('#admLog', { state: 'attached', timeout: 8000 })
}
await W(A, {
  id: 'W2-09g', what: 'Admin → Data → Clear edit history…: a date range with no edits (Jan 2025) → "No edits on record in that period"',
  fn: async () => {
    await dataPane()
    await A.selectOption('#admLogMode', 'range'); await sleep(150)
    await A.fill('#admLogDate', '2025-01-01'); await A.fill('#admLogDate2', '2025-01-31'); await sleep(150)
    await A.click('#admLog'); await sleep(300)
    return { toasts: await H.toasts(A), toast: await A.evaluate(() => (document.getElementById('toastEl') || {}).textContent || ''), btn: (await A.locator('#admLog').innerText()).trim() }
  },
  expect: { none: true },
  check: async (a) => ({ what: 'it says there is nothing to clear (and, the step above, wrote nothing)', ok: (a.ret.toasts || []).some(t => /No edits on record/.test(t)) || /No edits on record/.test(a.ret.toast || ''), detail: a.ret }),
  reload: false,
})
let said = null, before = null
await W(A, {
  id: 'W2-09h', focus: '#admLog', what: 'Admin → Data → Clear edit history…: "A specific date" = today → "Tap again to clear N entries" → tap again',
  fn: async () => {
    await dataPane()
    await A.selectOption('#admLogMode', 'on'); await sleep(150)
    await A.fill('#admLogDate', TODAY); await sleep(150)
    before = { mem: await elogN(A), stored: await storedElog(A) }
    await A.click('#admLog'); await sleep(400)
    said = (await A.locator('#admLog').innerText()).trim()
    await H.pic(A, 'W2-09h-ask')
    await A.click('#admLog'); await sleep(700)
    return { said, toasts: await H.toasts(A) }
  },
  expect: { del: [ELOG], also: [ELOG], only: true },
  check: async (a) => {
    const n = Number((said.match(/clear (\d+)/) || [])[1])
    const delLines = a.del.filter(k => ELOG.test(k)).length, putLines = a.put.filter(k => ELOG.test(k)).length
    return { what: `it removed exactly the ${n} lines it said, in ONE batch (plus the sweep's own line, if any)`, ok: n > 0 && delLines === n && a.batches.length === 1 && putLines <= 1, detail: { said, n, delLines, putLines, batches: a.batches, before, after: { mem: await elogN(A), stored: await storedElog(A) } } }
  },
  after: async () => { const m = await elogN(A), s = await storedElog(A); return { what: 'the lines stay gone (none back after the reload)', ok: m <= 1 && s <= 1, detail: { mem: m, stored: s }, said: `${m} history line(s) loaded, ${s} stored` } },
})

/* ====== the squadron's settings: a rule, a store, the wave and duty templates ====== */
let rule = null
await W(A, {
  id: 'W2-10a', focus: () => rule ? `[data-lgset="${rule.k}"]` : null, what: 'the Logic page (Enable editing): the first number rule changed',
  fn: async () => {
    await H.closeBoard(A); await L.go(A, 'logic')
    if (await A.locator('#lgEdit:visible').count()) { await A.click('#lgEdit'); await sleep(300) }
    const i = A.locator('#lgBody input[data-lgset]').first()
    const k = await i.getAttribute('data-lgset'), v0 = await i.inputValue()
    const lo = await A.evaluate(k => window.RULE_SPEC[k], k)
    const v1 = await A.evaluate(([k, v]) => { const s = window.RULE_SPEC[k], cur = window.ruleParse(k, v); const step = cur + 1 <= s.hi ? cur + 1 : cur - 1; return window.ruleFmt(k, step) }, [k, v0])
    await i.scrollIntoViewIfNeeded(); await i.fill(v1); await i.press('Tab'); await sleep(500)
    rule = { k, v0, v1 }
    return { rule, toasts: await H.toasts(A) }
  },
  expect: { put: [/^settings\/rules$/], also: [ELOG], only: true },
  check: async () => ({ what: 'the rule reads its new value', ok: (await A.locator(`#lgBody input[data-lgset="${rule.k}"]`).first().inputValue()) === rule.v1, detail: rule }),
  after: async () => { await L.go(A, 'logic'); if (await A.locator('#lgEdit:visible').count()) { await A.click('#lgEdit'); await sleep(300) } const v = await A.locator(`#lgBody input[data-lgset="${rule.k}"]`).first().inputValue().catch(() => null); return { what: 'kept after the reload (read in the page\'s own editing view)', ok: v === rule.v1, detail: { v, rule }, said: `${rule.k}: ${v}` } },
})
let storeOk = null
const storeMenu = async () => {
  await H.closeBoard(A); await L.go(A, 'editsched')
  const b = A.locator('#eWeek [data-stcfg]:visible').first()
  await b.scrollIntoViewIfNeeded(); await b.click(); await sleep(400)
}
const storeNames = () => A.evaluate(() => [...document.querySelectorAll('.wavemenu .wm[data-cfg], .wavemenu .st-lab')].map(e => (e.value || e.textContent || '').trim()))
await W(A, {
  id: 'W2-10b', what: 'Edit Schedule: a jet\'s stores button → Stores configuration → ✎ → "W2POD" → Add',
  fn: async () => {
    await storeMenu()
    await A.click('.wavemenu .st-pen'); await sleep(300)
    await A.fill('.wavemenu .st-new', 'W2POD'); await A.click('.wavemenu .st-add'); await sleep(500)
    const n = await storeNames(); await H.pic(A, 'W2-10b-menu')
    await A.keyboard.press('Escape'); await A.mouse.click(5, 895); await sleep(300)
    return n
  },
  expect: { put: [/^settings\/stores$/], also: [ELOG], only: true },
  check: async (a) => ({ what: 'the list holds W2POD', ok: (a.ret || []).includes('W2POD'), detail: a.ret }),
  after: async () => { await storeMenu(); const n = await storeNames(); await H.pic(A, 'W2-10b-after-menu'); await A.keyboard.press('Escape'); await A.mouse.click(5, 895); await sleep(300); return { what: 'the list still holds W2POD after the reload', ok: n.includes('W2POD'), detail: n, said: `stores: ${n.join(', ')}` } },
})
const configPane = async () => { await H.closeBoard(A); await L.go(A, 'admin'); const t = A.locator('[data-admcat="config"]:visible, .adm-cat:has-text("Squadron"):visible').first(); if (await t.count()) { await t.click(); await sleep(400) } }
let eye = null
await W(A, {
  id: 'W2-10c', what: 'Admin → Squadron configuration → Wave templates… → the first built-in wave type\'s eye (Shown → Hidden)',
  fn: async () => {
    await configPane(); await A.click('#admWaveTpl'); await sleep(500)
    const e = A.locator('#waveTplModal [data-wveye]').first()
    eye = { key: await e.getAttribute('data-wveye'), was: await e.getAttribute('aria-pressed') }
    await e.click(); await sleep(400)
    eye.now = await A.locator(`#waveTplModal [data-wveye="${eye.key}"]`).first().getAttribute('aria-pressed')
    await H.pic(A, 'W2-10c-modal')
    await A.click('#waveTplClose'); await sleep(300)
    return eye
  },
  expect: { put: [/^settings\/wavehide$/], also: [ELOG, /^settings\/wavetpl$/], only: true },
  check: async () => ({ what: 'the type flipped', ok: eye.was !== eye.now, detail: eye }),
  after: async () => { await configPane(); await A.click('#admWaveTpl'); await sleep(500); const v = await A.locator(`#waveTplModal [data-wveye="${eye.key}"]`).first().getAttribute('aria-pressed'); await H.pic(A, 'W2-10c-after-modal'); await A.click('#waveTplClose'); await sleep(300); return { what: 'still flipped after the reload', ok: v === eye.now, detail: { v, eye }, said: `${eye.key} ${v === 'true' ? 'shown' : 'hidden'}` } },
})
let dt = null
await W(A, {
  id: 'W2-10d', what: 'Admin → Squadron configuration → Duty templates… → the first template renamed "W2 DUTY"',
  fn: async () => {
    await configPane(); await A.click('#admDutyTpl'); await sleep(500)
    const n = A.locator('#tplModal .tpl-name').first()
    dt = { was: await n.inputValue() }
    await n.fill('W2 DUTY'); await sleep(400)
    dt.now = await n.inputValue()
    await H.pic(A, 'W2-10d-modal')
    await A.click('#tplClose'); await sleep(300)
    return dt
  },
  expect: { put: [/^settings\/dutytpl$/], also: [ELOG], only: true },
  check: async () => ({ what: 'the template reads W2 DUTY', ok: dt.now === 'W2 DUTY', detail: dt }),
  after: async () => { await configPane(); await A.click('#admDutyTpl'); await sleep(500); const v = await A.locator('#tplModal .tpl-tab.on').first().innerText().catch(() => null); const n = await A.locator('#tplModal .tpl-name').first().inputValue(); await H.pic(A, 'W2-10d-after-modal'); await A.click('#tplClose'); await sleep(300); return { what: 'still "W2 DUTY" after the reload', ok: n === 'W2 DUTY', detail: { v, n }, said: `first duty template "${n}"` } },
})

let wt = null
await W(A, {
  id: 'W2-10f', what: 'Admin → Squadron configuration → Wave templates… → "+ New wave template", named "W2 WAVE"',
  fn: async () => {
    await configPane(); await A.click('#admWaveTpl'); await sleep(500)
    await A.locator('#waveTplModal .tpl-tab.new').first().click(); await sleep(400)
    const n = A.locator('#waveTplModal .tpl-name').first()
    await n.fill('W2 WAVE'); await sleep(400)
    wt = await A.evaluate(() => [...document.querySelectorAll('#waveTplModal .tpl-tab:not(.new)')].map(t => t.textContent.trim()))
    await H.pic(A, 'W2-10f-modal')
    await A.click('#waveTplClose'); await sleep(300)
    return wt
  },
  expect: { put: [/^settings\/wavetpl$/], also: [ELOG, /^settings\/wavehide$/], only: true },
  check: async () => ({ what: 'the template list holds "W2 WAVE"', ok: (wt || []).includes('W2 WAVE'), detail: wt }),
  after: async () => { await configPane(); await A.click('#admWaveTpl'); await sleep(500); const t = await A.evaluate(() => [...document.querySelectorAll('#waveTplModal .tpl-tab:not(.new)')].map(x => x.textContent.trim())); await H.pic(A, 'W2-10f-after-modal'); await A.click('#waveTplClose'); await sleep(300); return { what: 'still there after the reload', ok: t.includes('W2 WAVE'), detail: t, said: `wave templates: ${t.join(', ')}` } },
})

console.log('\nerrors:', errors.length ? errors : 'none')
H.save({ errors })
await browser.close()
process.exit(0)
