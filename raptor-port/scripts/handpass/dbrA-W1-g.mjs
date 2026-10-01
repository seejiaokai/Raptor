/* [DB-READINESS] group A FULL walk — W1 part G: the scenario designer's 17 (folded in at the host's word) — the
   templates and the defaults. Wave templates (made, renamed, hidden, deleted while hidden — its `wavetpl` and `wavehide`
   must go in ONE batch — placed on a day, cleared); duty templates (made, renamed, placed with "+ Block", reset to
   defaults); day templates (saved, renamed, deleted); the section default (the "Set as default" offer after a section
   drag, and Admin's "Reset to standard order"); the wave default (Admin's ▼, then "Turn off wave order").
   Each gesture: the rows it wrote, named by its batch; reload. Desktop 1440×900, a fresh world.
   Usage (from raptor-port/scripts/handpass): node dbrA-W1-g.mjs */
import * as W from './dbrA-W1-lib.mjs'
const L = await W.boot('g')
const { WK, day, ELOG } = W
const browser = await L.launch()
const errors = []
const ctx = await L.context(browser)
const p = await L.page(ctx, errors, 'W1g')
const { T, S, pic, note } = W.table(L, '1440')
await L.signIn(p, 'a'); await W.toEdit(L, p); await W.toastSpy(p)
const SET = k => new RegExp('^settings/' + k + '$')
const cfg = (k) => p.evaluate(k => localStorage.getItem('raptor:settings/' + k), k)
/* until G1f the week is PRISTINE (never saved — the settled rule), so each load mints its rows' hidden ids afresh and
   nothing refers to them; those steps' reload comparisons ignore exactly those ids, nothing else */
const RID = [/\.rid: "rm[0-9a-z]+" → "rm[0-9a-z]+"$/]
const oneBatch = (a, keys) => a.batches.length === 1 && keys.every(k => [...a.put, ...a.del].includes('settings/' + k))

/* the board's + Wave menu → ⚙ → the Flying waves sheet */
async function waveSheet() {
  await W.boardOn(p, 0)
  if (await p.locator('#waveTplModal:not([hidden]) .modal-head').count()) return
  const b = p.locator('#schedBoard [data-wvadd="0"]:visible').first()
  await b.evaluate(e => e.scrollIntoView({ block: 'center' })); await b.click(); await p.waitForTimeout(400)
  await p.locator('[data-wvedit]:visible').first().click(); await p.waitForTimeout(500)
}
const waveShown = () => p.evaluate(() => { const m = document.querySelector('#waveTplModal'); return m && !m.hidden ? m.innerText.replace(/\s+/g, ' ').slice(0, 220) : 'closed' })
let tplId = null
await S(p, 'W1.G1a', 'wave templates (board: + Wave → ⚙): "+ New" — a wave template made',
  async () => { await waveSheet(); await p.locator('#waveTplModal .tpl-tab.new:visible').first().click(); await p.waitForTimeout(500)
    tplId = await p.evaluate(() => { const v = JSON.parse(localStorage.getItem('raptor:settings/wavetpl') || '[]'); return v.length ? v[v.length - 1].id : null }) },
  { expect: { put: [SET('wavetpl')], only: true }, ignore: RID, onScreen: waveSheet, show: async () => `the sheet: ${await waveShown()}` })
await S(p, 'W1.G1b', 'the wave template renamed ("G1 PACKAGE")',
  async () => { await waveSheet(); await p.locator('#waveTplModal .tpl-name:visible').first().fill('G1 PACKAGE'); await p.waitForTimeout(500) },
  { expect: { put: [SET('wavetpl')], only: true }, ignore: RID, onScreen: waveSheet, show: async () => `stored title: ${JSON.stringify(JSON.parse(await cfg('wavetpl') || '[]').map(t => t.title))}` })
await S(p, 'W1.G1c', 'the template\'s eye tapped — hidden from + Wave',
  async () => { await waveSheet(); await p.locator(`#waveTplModal [data-wveye="${tplId}"]:visible`).first().click(); await p.waitForTimeout(500) },
  { expect: { put: [SET('wavehide')], also: [SET('wavetpl')], only: true }, ignore: RID, onScreen: waveSheet, show: async () => `wavehide ${await cfg('wavehide')}` })
{
  const a = await S(p, 'W1.G1d', '"Delete template" on the hidden template — the library and the hide list both emptied, in ONE saved action',
    async () => { await waveSheet(); await p.locator('#waveTplModal button', { hasText: 'Delete template' }).first().click(); await p.waitForTimeout(600) },
    { expect: { del: [SET('wavetpl'), SET('wavehide')], only: true }, ignore: RID, onScreen: waveSheet, show: async () => `wavetpl ${await cfg('wavetpl')} · wavehide ${await cfg('wavehide')}` })
  L.check('W1.G1d the paired write (wavetpl + wavehide) is ONE change-log batch', a && oneBatch(a, ['wavetpl', 'wavehide']), a ? JSON.stringify(a.batches) : 'no audit')
}
/* a template placed on a day with + Wave */
await S(p, 'W1.G1e', 'wave templates: "+ New" again (for placing)',
  async () => { await waveSheet(); await p.locator('#waveTplModal .tpl-tab.new:visible').first().click(); await p.waitForTimeout(500)
    tplId = await p.evaluate(() => { const v = JSON.parse(localStorage.getItem('raptor:settings/wavetpl') || '[]'); return v.length ? v[v.length - 1].id : null })
    await p.locator('#waveTplModal .tpl-name:visible').first().fill('G1 PLACE ME'); await p.waitForTimeout(400) },
  { expect: { put: [SET('wavetpl')], only: true }, ignore: RID, onScreen: waveSheet })
{
  const w0 = await p.evaluate(() => window.DAYS[0].waves.length)
  await S(p, 'W1.G1f', 'board (Mon): + Wave → "G1 PLACE ME" — the template placed as a wave',
    async () => { await W.boardOn(p, 0); const x = p.locator('#waveTplClose:visible'); if (await x.count()) { await x.click(); await p.waitForTimeout(300) }
      const b = p.locator('#schedBoard [data-wvadd="0"]:visible').first(); await b.evaluate(e => e.scrollIntoView({ block: 'center' })); await b.click(); await p.waitForTimeout(400)
      await p.locator(`[data-wmtpl="${tplId}"]:visible`).first().click(); await p.waitForTimeout(600) },
    { expect: { put: [day(WK, 0)], also: [new RegExp('^weeks/13-07-2026(#\\d)?$'), ELOG], only: true }, onScreen: async () => { await W.boardOn(p, 0); await W.focus(p, `#schedBoard [data-move="mv:w.0.${w0}"]`) },
      show: async () => `Monday has ${await p.evaluate(() => window.DAYS[0].waves.length)} waves (was ${w0})` })
}
{
  const a = await S(p, 'W1.G1g', 'wave templates: "Clear all"',
    async () => { await waveSheet(); await p.locator('#waveTplModal button', { hasText: 'Clear all' }).first().click(); await p.waitForTimeout(600) },
    { expect: { del: [SET('wavetpl')], also: [SET('wavehide')], only: true }, onScreen: waveSheet, show: async () => `wavetpl ${await cfg('wavetpl')} · wavehide ${await cfg('wavehide')} · Monday still has ${await p.evaluate(() => window.DAYS[0].waves.length)} waves` })
  L.check('W1.G1g one batch', a && a.batches.length === 1, a ? JSON.stringify(a.batches) : '')
}
{ const x = p.locator('#waveTplClose:visible'); if (await x.count()) { await x.click(); await p.waitForTimeout(300) } }

/* duty templates — + Block ✎ */
async function dutySheet() {
  await W.boardOn(p, 0)
  if (await p.locator('#tplModal:not([hidden]) .modal-head').count()) return
  const b = p.locator('#schedBoard [data-dwadd="0"]:visible').first()
  await b.evaluate(e => e.scrollIntoView({ block: 'center' })); await b.click(); await p.waitForTimeout(400)
  await p.locator('[data-blkedit]:visible').first().click(); await p.waitForTimeout(500)
}
let dId = null
await S(p, 'W1.G2a', 'duty templates (board: + Block → ✎): "+ New"',
  async () => { await dutySheet(); await p.locator('#tplModal .tpl-tab.new:visible').first().click(); await p.waitForTimeout(500)
    dId = await p.evaluate(() => { const v = JSON.parse(localStorage.getItem('raptor:settings/dutytpl') || '[]'); return v.length ? v[v.length - 1].id : null }) },
  { expect: { put: [SET('dutytpl')], only: true }, onScreen: dutySheet, show: async () => `stored duty templates: ${JSON.stringify(JSON.parse(await cfg('dutytpl') || '[]').map(t => t.title))}` })
await S(p, 'W1.G2b', 'the new duty template renamed ("G2 DESK")',
  /* after the reload the sheet opens on its FIRST template, so the new one's tab is picked first, as a person would */
  async () => { await dutySheet(); await p.locator('#tplModal .tpl-tab:not(.new)', { hasText: 'New template' }).last().click(); await p.waitForTimeout(300)
    await p.locator('#tplModal .tpl-name:visible').first().fill('G2 DESK'); await p.waitForTimeout(500) },
  { expect: { put: [SET('dutytpl')], only: true }, onScreen: dutySheet, show: async () => `stored duty templates: ${JSON.stringify(JSON.parse(await cfg('dutytpl') || '[]').map(t => t.title))}` })
{
  const n0 = await p.evaluate(() => window.DAYS[0].dutywaves.length)
  await S(p, 'W1.G2c', 'board (Mon): + Block → "G2 DESK" — a duty block placed from the template',
    async () => { const x = p.locator('#tplClose:visible'); if (await x.count()) { await x.click(); await p.waitForTimeout(300) }
      await W.boardOn(p, 0); const b = p.locator('#schedBoard [data-dwadd="0"]:visible').first(); await b.evaluate(e => e.scrollIntoView({ block: 'center' })); await b.click(); await p.waitForTimeout(400)
      await p.locator(`[data-blktpl="${dId}"]:visible`).first().click(); await p.waitForTimeout(600) },
    { expect: { put: [day(WK, 0)], also: [new RegExp('^weeks/13-07-2026(#\\d)?$'), ELOG], only: true }, onScreen: async () => { await W.boardOn(p, 0); await W.focus(p, '#schedBoard [data-dwadd="0"]') },
      show: async () => `Monday has ${await p.evaluate(() => window.DAYS[0].dutywaves.length)} duty blocks (was ${n0}), the last "${await p.evaluate(() => { const b = window.DAYS[0].dutywaves; return b[b.length - 1].label })}"` })
}
await S(p, 'W1.G2d', 'duty templates: "Reset to defaults"',
  async () => { await dutySheet(); await p.locator('#tplModal button', { hasText: 'Reset to defaults' }).first().click(); await p.waitForTimeout(600) },
  { expect: { del: [SET('dutytpl')], only: true }, onScreen: dutySheet, show: async () => `dutytpl ${await cfg('dutytpl')} · Monday's placed block still there: ${await p.evaluate(() => window.DAYS[0].dutywaves.some(b => /G2 DESK/.test(b.label || '')))} (${await p.evaluate(() => window.DAYS[0].dutywaves.length)} blocks)` })
{ const x = p.locator('#tplClose:visible'); if (await x.count()) { await x.click(); await p.waitForTimeout(300) } }

/* day templates — saved from Tuesday, renamed and deleted on Admin → Squadron config → Day templates… */
async function admConfig() {
  await W.boardOff(p)
  if ((await p.evaluate(() => window.CURPAGE)) !== 'admin') await L.go(p, 'admin')
  if (await p.locator('#admConfig.on').count()) return
  const c = p.locator('button.adm-cat', { hasText: 'Squadron config' }).first(); if (await c.count()) { await c.click(); await p.waitForTimeout(400) }
}
await S(p, 'W1.G3a', 'Tuesday: Templates → "+ Save this day as a template"',
  async () => { await W.toEdit(L, p); const b = p.locator('#eWeek .day[data-day="1"] [data-daytplopen="1"]:visible').first(); await b.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await b.click(); await p.waitForTimeout(400)
    await p.locator('.wavemenu [data-daytplsave]:visible').first().click(); await p.waitForTimeout(600) },
  { expect: { put: [SET('daytpl')], only: true }, onScreen: () => W.showDay(p, 1), show: async () => `stored day templates: ${JSON.stringify(JSON.parse(await cfg('daytpl') || '[]').map(t => t.title))}` })
await S(p, 'W1.G3b', 'Admin → Squadron config → Day templates…: renamed ("G3 TUESDAY")',
  async () => { const x = p.locator('#daytplClose:visible'); if (await x.count()) { await x.click(); await p.waitForTimeout(300) }
    await admConfig(); await p.click('#admDayTpl'); await p.waitForTimeout(500); await p.locator('#daytplModal .tpl-name:visible').first().fill('G3 TUESDAY'); await p.waitForTimeout(500) },
  { expect: { put: [SET('daytpl')], only: true }, page: 'admin', onScreen: async () => { await admConfig(); if (!(await p.locator('#daytplModal:not([hidden]) .modal-head').count())) { await p.click('#admDayTpl'); await p.waitForTimeout(500) } },
    show: async () => `stored day templates: ${JSON.stringify(JSON.parse(await cfg('daytpl') || '[]').map(t => t.title))}` })
await S(p, 'W1.G3c', 'Day templates: "Delete template"',
  async () => { if (!(await p.locator('#daytplModal:not([hidden]) .modal-head').count())) { await admConfig(); await p.click('#admDayTpl'); await p.waitForTimeout(500) }
    await p.locator('#daytplModal button', { hasText: 'Delete template' }).first().click(); await p.waitForTimeout(600) },
  { expect: { del: [SET('daytpl')], only: true }, page: 'admin', onScreen: admConfig, show: async () => `daytpl ${await cfg('daytpl')}` })
{ const x = p.locator('#daytplClose:visible'); if (await x.count()) { await x.click(); await p.waitForTimeout(300) } }

/* the section default: a section drag on the board, then the offer "Set as default" */
{
  await W.toEdit(L, p)
  await W.boardOn(p, 2)
  const secs = () => p.evaluate(() => [...document.querySelectorAll('#schedBoard [data-secmove^="2."]')].filter(e => e.offsetParent !== null).map(e => e.dataset.secmove.split('.')[1]))
  const s0 = await secs()
  const target = s0[s0.indexOf('notes') + 2] || s0[s0.length - 1]
  const { dragTo } = await import('./am/w1-lib.mjs')
  await S(p, 'W1.G4a', `board (Wed): Overall Notes dragged by its ⠿ onto "${target}"`,
    async () => ({ how: await dragTo(p, p.locator('#schedBoard [data-secmove="2.notes"] .secgrip:visible').first(), p.locator(`#schedBoard [data-secmove="2.${target}"]:visible`).first()), s1: await secs() }),
    { reload: false, expect: { put: [day(WK, 2)], also: [new RegExp('^weeks/13-07-2026(#\\d)?$'), ELOG], only: true }, after: async (a) => note(`W1.G4a ${JSON.stringify(a.ret)}`) })
  await S(p, 'W1.G4b', 'the offer under it: "Set as default"',
    /* the offer is drawn on the page BEHIND the board (seen: W1.G4-offer-hidden-behind-board.png), so a person closes the
       board (✓ Done) and presses it there */
    async () => { await W.boardOff(p); const y = p.locator('.secdef-btn.yes:visible').first(); const had = await y.count(); if (had) { await y.click(); await p.waitForTimeout(500) } return { offered: !!had } },
    { expect: { put: [SET('secdefault')], only: true }, page: 'editsched', onScreen: async () => { await W.boardOn(p, 0) },
      after: async (a) => note(`W1.G4b ${JSON.stringify(a.ret)}`), show: async () => `secdefault ${await cfg('secdefault')} · Monday's board sections ${JSON.stringify(await p.evaluate(() => [...document.querySelectorAll('#schedBoard [data-secmove^="0."]')].filter(e => e.offsetParent !== null).map(e => e.dataset.secmove.split('.')[1])))}` })
}
await S(p, 'W1.G4c', 'Admin → Squadron config → "Reset to standard order"',
  async () => { await admConfig(); await p.click('#admSecDefReset'); await p.waitForTimeout(500) },
  { expect: { del: [SET('secdefault')], only: true }, page: 'admin', onScreen: admConfig, show: async () => `secdefault ${await cfg('secdefault')}` })
await S(p, 'W1.G4d', 'Admin → Squadron config → Flying-wave order: the first kind moved down (▼)',
  async () => { await admConfig(); await p.locator('#admWaveDefault .tnudge:not([disabled])', { hasText: '▼' }).first().click(); await p.waitForTimeout(500) },
  { expect: { put: [SET('wavedefault')], only: true }, page: 'admin', onScreen: admConfig, show: async () => `wavedefault ${await cfg('wavedefault')} · the list ${await p.evaluate(() => [...document.querySelectorAll('#admWaveDefault .arrsec-name')].map(e => e.textContent).join(' / '))}` })
await S(p, 'W1.G4e', 'Admin: "Turn off wave order"',
  async () => { await admConfig(); await p.click('#admWaveDefOff'); await p.waitForTimeout(500) },
  { expect: { del: [SET('wavedefault')], only: true }, page: 'admin', onScreen: admConfig, show: async () => `wavedefault ${await cfg('wavedefault')}` })

const fails = L.save({ table: T, errors })
console.log('errors:', JSON.stringify(errors, null, 1))
await browser.close()
process.exitCode = fails ? 1 : 0
