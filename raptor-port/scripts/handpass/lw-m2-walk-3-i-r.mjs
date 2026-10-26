// Walker 3, scenario 66 (Undo / Redo / reload after each new kind of change) and the roll-call rows R9-R14 that my sections name.
// Real storage (plain address), admin on a desktop.   node scripts/handpass/lw-m2-walk-3-i.mjs [66|rc]
import * as L from './lw-m2-walk-3-lib-r.mjs'
import { writeFileSync } from 'node:fs'
const { T, tap, vis, txt, rec, shot, undo, redo } = L
const only = process.argv.slice(2)
const want = n => !only.length || only.includes(String(n))
const all = []
const PLAIN = `http://localhost:${L.PORT}/`
async function signInPlain(w, who, today) {
  const { page } = w
  await page.goto(PLAIN); await page.waitForSelector('#luser')
  const [u, p] = who === 'admin' ? ['ad', 'a'] : ['us', 'us']
  await page.fill('#luser', u); await page.fill('#lpass', p)
  await page.click('#loginForm button[type=submit]')
  await page.waitForSelector('#vWeek .day')
  if (today !== undefined) await page.evaluate(t => window.lwSetMemberToday(t), today)
  await page.evaluate(() => window.go('leavewar'))
  await page.waitForSelector(who === 'admin' ? T('row-stiff') : T('row-bane'))
  await page.waitForTimeout(900)
  await tap(w, T('month-JAN')); await page.waitForTimeout(900)
}
const manningOpen = w => w.page.evaluate(() => !!document.querySelector('[data-testid="fly-row-req-p"]'))
const availOf = async (w, iso) => +(await txt(w.page, T(`avail-p-${iso}`)))
const classOf = (w, id) => w.page.locator(T(id)).first().evaluate(e => e.className).catch(() => null)
const pad = async (w, id, n) => { await tap(w, T(id)); await w.page.waitForTimeout(400); if (await vis(w.page, T('fly-edit-input'))) { await w.page.fill(T('fly-edit-input'), String(n)); await w.page.keyboard.press('Enter'); await w.page.waitForTimeout(500); return } for (const d of String(n)) await tap(w, T(`fly-pad-${d}`)); await tap(w, T('fly-pad-done')); await w.page.waitForTimeout(400) }
const toastText = w => w.page.evaluate(() => [...document.querySelectorAll('.toast, #toast, [role="status"], .snack, .snackbar')].map(e => e.innerText.replace(/\s+/g, ' ').trim()).filter(Boolean).join(' | '))
const rows = w => w.page.evaluate(() => [...document.querySelectorAll('[data-testid^="row-"]')].slice(0, 6).map(e => e.dataset.testid.replace('row-', '')).join(','))

async function dragRow(w, fromId, toId) {
  const a = await L.boxOf(w.page, T(`drag-${fromId}`)); const b = await L.boxOf(w.page, T(`row-${toId}`))
  const sx = a.x + a.width / 2, sy = a.y + a.height / 2, ex = sx + 4, ey = b.y + b.height * 0.8
  await w.page.mouse.move(sx, sy); await w.page.mouse.down()
  for (let i = 1; i <= 10; i++) { await w.page.mouse.move(sx + (ex - sx) * i / 10, sy + (ey - sy) * i / 10); await w.page.waitForTimeout(30) }
  await w.page.waitForTimeout(150); await w.page.mouse.up(); await w.page.waitForTimeout(500)
}
async function makePeriod(w, name) {
  await w.page.selectOption(T('war-picker'), { label: '+ New period' }); await w.page.waitForSelector(T('war-name'))
  await w.page.fill(T('war-name'), name)
  const days = await w.page.evaluate(() => [...document.querySelectorAll('[data-testid^="war-day-"]')].map(e => e.dataset.testid))
  await tap(w, T(days[0])); await tap(w, T(days[2])); await w.page.waitForTimeout(200)
  await tap(w, T('war-create')); await w.page.waitForTimeout(900)
}
const periods = w => w.page.evaluate(() => [...document.querySelector('[data-testid="war-picker"]').options].map(o => o.textContent).join(' / ') + ' ; shown ' + document.querySelector('[data-testid="war-picker"]').selectedOptions[0].textContent)

const w = await L.newWorld('desk')
await signInPlain(w, 'admin')
const A = '2026-01-13', RED = '2026-01-14'
if (!(await manningOpen(w))) await tap(w, T('counts-toggle'))
const avA = await availOf(w, A); await pad(w, `req-p-${A}`, avA)      // amber point not set yet: no flag
const avR = await availOf(w, RED); await pad(w, `req-p-${RED}`, avR + 1) // under Required: red
console.log('setup', avA, avR)
await w.page.waitForTimeout(1500)

async function cycle(label, pic, doFn, readFn) {
  const s0 = await readFn(); await doFn(); await w.page.waitForTimeout(600)
  const s1 = await readFn(); await shot(w, `s66-${pic}-1-done`)
  const t0 = await toastText(w)
  await undo(w); const s2 = await readFn(); const t1 = await toastText(w); await shot(w, `s66-${pic}-2-undone`)
  await redo(w); const s3 = await readFn(); const t2 = await toastText(w); await shot(w, `s66-${pic}-3-redone`)
  await w.page.waitForTimeout(1800)
  await signInPlain(w, 'admin'); if (!(await manningOpen(w))) await tap(w, T('counts-toggle')); await w.page.waitForTimeout(400)
  const s4 = await readFn(); await shot(w, `s66-${pic}-4-reloaded`)
  const ok = s1 !== s0 && s2 === s0 && s3 === s1 && s4 === s1
  rec(66, 'desk1536 admin', ok ? 'PASS' : 'FAIL', `${label}: before "${s0}" -> done "${s1}" -> Undo "${s2}" -> Redo "${s3}" -> after reload "${s4}"; notes seen after the change / Undo / Redo: "${t0}" / "${t1}" / "${t2}"`, [`s66-${pic}-1-done.png`, `s66-${pic}-2-undone.png`, `s66-${pic}-3-redone.png`, `s66-${pic}-4-reloaded.png`])
}

if (want(66)) {
  await cycle('a points save (Available P amber +1)', 'points', async () => {
    await tap(w, T('fly-name-avail-p')); await w.page.waitForSelector(T('cform-amber-pt')); await w.page.fill(T('cform-amber-pt'), '+1'); await tap(w, T('cform-save'))
  }, async () => `${(await classOf(w, `avail-p-${A}`))?.includes('amb') ? 'amber' : 'plain'} on ${A}`)

  await cycle('a rename of Required P', 'rename', async () => {
    await tap(w, T('fly-name-req-p')); await w.page.waitForSelector(T('reqname-name')); await w.page.fill(T('reqname-name'), 'Pilots req'); await tap(w, T('reqname-save'))
  }, async () => `row name "${await txt(w.page, T('fly-name-req-p'))}"`)

  await cycle('an HO half pick (PM)', 'ho', async () => {
    await tap(w, T(L.cellId('stiff', '2026-01-21'))); await w.page.waitForSelector(T('bid-picker')); await tap(w, T('bid-oil')); await w.page.fill(T('oil-days'), '0.5')
    await tap(w, T('oil-half-pm')); await tap(w, T('oil-give')); await w.page.waitForTimeout(600)
    if (await vis(w.page, T('bid-picker'))) await tap(w, T('bid-cancel'))
  }, async () => w.page.evaluate(() => { const c = document.querySelector('[data-testid="cell-stiff-2026-01-21"]'); return c ? (c.querySelector('.c') ? c.querySelector('.c').className + ' / ' + c.innerText.trim() : 'empty') : 'no cell' }))

  await cycle('a Rearrange drop (Anvil below Snap)', 'rearrange', async () => {
    await tap(w, T('settings-open')); await w.page.waitForSelector(T('settings-rearrange')); await tap(w, T('settings-rearrange')); await w.page.waitForTimeout(600)
    await dragRow(w, 'shaft', 'snap'); await tap(w, T('roster-arrange')); await w.page.waitForTimeout(500)
  }, async () => `rows ${await rows(w)}`)

  await cycle('a new period', 'period', async () => { await makePeriod(w, 'WALK 28') }, async () => periods(w))
}

if (want('rc')) {
  // roll-call rows R9-R14 on what is on screen now (the Required figures above have made one red day)
  await signInPlain(w, 'admin'); if (!(await manningOpen(w))) await tap(w, T('counts-toggle'))
  await w.page.evaluate(() => window.scrollTo(0, 0))
  const bar = await w.page.evaluate(() => {
    const t = document.querySelector('[data-testid="counts-toggle"]'); const row = t.closest('div').parentElement
    return { txt: row.innerText.replace(/\s+/g, ' ').trim(), um: document.querySelector('[data-testid="undermanned"]')?.innerText.replace(/\s+/g, ' ').trim() ?? null, under: /Under-?manned/i.test(row.innerText), fig: !!document.querySelector('[data-testid="figdrawer"]') || /FIGURES/.test(document.querySelector('table.mx').innerText), gearOnBar: !!row.querySelector('[data-testid="settings-open"]'), oilOnBar: !!row.querySelector('[data-testid="oil-tracker"]'), rearOnBar: !!row.querySelector('[data-testid="roster-arrange"]'), lve: document.querySelectorAll('[data-testid^="bal-"]').length }
  })
  await shot(w, 'rc-r13-bar')
  let listLines = null
  if (bar.um) { await tap(w, T('undermanned')); await w.page.waitForTimeout(500); listLines = await txt(w.page, T('undermanned-list')); await shot(w, 'rc-r14-list')
    const first = await w.page.evaluate(() => document.querySelector('[data-testid^="undermanned-day-"]')?.dataset.testid)
    if (first) { await tap(w, T(first)); await w.page.waitForTimeout(800) } }
  rec('RC R13/R14', 'desk1536 admin', bar.um && /\d+ red/.test(bar.um) && !bar.under && !bar.fig && !bar.gearOnBar && !bar.oilOnBar && !bar.rearOnBar && bar.lve > 20 ? 'PASS' : 'FAIL', `grid bar reads "${bar.txt}"; red chip "${bar.um}"; "Under-manned" label=${bar.under}; Balances/FIGURES on grid=${bar.fig}; gear/OIL/Rearrange on the bar at rest=${bar.gearOnBar}/${bar.oilOnBar}/${bar.rearOnBar}; LVE figures beside names=${bar.lve}; red list "${listLines}"`, ['rc-r13-bar.png', 'rc-r14-list.png'])
}
w.errs.forEach(x => all.push('I: ' + x)); await w.ctx.close()

// R9 member: closed-day dim + lock, outline
if (want('rc')) {
  const m = await L.newWorld('phone'); await L.signIn(m, 'member', '2026-01-05')
  await tap(m, T('month-JAN')); await m.page.waitForTimeout(800)
  const info = await m.page.evaluate(() => { const c = iso => { const e = document.querySelector(`[data-testid="cell-bane-${iso}"]`); return e ? { cls: e.className, html: e.innerHTML.slice(0, 160) } : null }; return { closed: c('2026-01-02'), open: c('2026-01-07'), box: [...document.querySelectorAll('[data-testid="bid-box"]')].map(e => e.dataset.from), chip: document.querySelector('[data-testid="open-chip"]')?.innerText } })
  await shot(m, 'rc-r9-member-closed-dim')
  rec('RC R9', 'phone390 member', info.box.length ? 'PASS' : 'FAIL', `member with today pinned 5 Jan: chip "${info.chip}"; outline boxes from ${JSON.stringify(info.box)}; a closed day's cell ${JSON.stringify(info.closed)}; an open day's ${JSON.stringify(info.open)} (see the picture for the dim and lock)`, ['rc-r9-member-closed-dim.png'])
  m.errs.forEach(x => all.push('R9: ' + x)); await m.ctx.close()
}

writeFileSync('C:/Users/User/AppData/Local/Temp/claude/C--Users-User-projects-Raptor--claude-worktrees-leave-war-overhaul-e11c0a/41598151-b62f-4130-886a-f6dcd3903085/scratchpad/w3-i.out.json', JSON.stringify({ results: L.results, errs: all }, null, 1))
console.log('ERRORS', JSON.stringify(all))
await L.closeBrowser()
