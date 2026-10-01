/* [DB-READINESS] group A FULL walk — W2 part G: two people, two DIFFERENT duty templates (a probe of the settings
   rows' grain, brief §W2 step 10 with the two-tab rule): the squadron's templates are ONE stored setting
   (`settings/dutytpl` — the plan's matrix keeps settings "as today"), so this records what happens when tab A renames
   the first template while tab B, not reloaded, renames the second.
   Run from raptor-port/scripts/handpass: node dbrA-W2-g.mjs            */
process.env.HP_URL ||= 'http://localhost:4202'
process.env.HP_SHOTS ||= 'C:/Users/User/projects/Raptor/raptor-port/docs/img/handpass/2026-09-30-dbrA/W2'
process.env.HP_OUT ||= 'C:/Users/User/projects/Raptor/raptor-port/docs/handpass/parts/dbrA-W2-g.json'
const H = await import('./dbrA-W2-lib.mjs')
const { L, sleep } = H

const browser = await L.launch()
const ctx = await L.context(browser)
const errors = []
const A = await L.page(ctx, errors, 'A')
await L.signIn(A, 'a'); await L.settle(A)
const B = await L.page(ctx, errors, 'B')
await L.signIn(B, 'a'); await L.settle(B)
const configPane = async pg => { await L.go(pg, 'admin'); const t = pg.locator('[data-admcat="config"]:visible, .adm-cat:has-text("Squadron"):visible').first(); if (await t.count()) { await t.click(); await sleep(400) } }
async function renameTpl(pg, idx, name) {
  await configPane(pg); await pg.click('#admDutyTpl'); await sleep(500)
  await pg.locator('#tplModal .tpl-tab:not(.new)').nth(idx).click(); await sleep(300)
  const was = await pg.locator('#tplModal .tpl-name').inputValue()
  await pg.locator('#tplModal .tpl-name').fill(name); await sleep(400)
  const tabs = await pg.evaluate(() => [...document.querySelectorAll('#tplModal .tpl-tab:not(.new)')].map(t => t.textContent.trim()))
  await H.pic(pg, `W2-10e-${name.replace(/\W+/g, '')}`)
  await pg.click('#tplClose'); await sleep(300)
  return { was, tabs }
}
const n0 = L.results.length
const aA = await L.step(A, 'W2-10e tab A: Duty templates → the FIRST template renamed "W2 A-DUTY"', () => renameTpl(A, 0, 'W2 A-DUTY'), { put: [/^settings\/dutytpl$/], only: true })
const aB = await L.step(B, 'W2-10e tab B (not reloaded): Duty templates → the SECOND template renamed "W2 B-DUTY"', () => renameTpl(B, 1, 'W2 B-DUTY'), { put: [/^settings\/dutytpl$/], only: true })
const said = []
for (const [pg, tag] of [[A, 'A'], [B, 'B']]) {
  await pg.reload(); await L.signIn(pg, 'a', { goto: false }); await L.settle(pg, 700)
  await configPane(pg); await pg.click('#admDutyTpl'); await sleep(500)
  const tabs = await pg.evaluate(() => [...document.querySelectorAll('#tplModal .tpl-tab:not(.new)')].map(t => t.textContent.trim()))
  await H.pic(pg, `W2-10e-b-tab${tag}`)
  await pg.click('#tplClose'); await sleep(300)
  const both = tabs.includes('W2 A-DUTY') && tabs.includes('W2 B-DUTY')
  L.check(`W2-10e — after tab ${tag}'s reload: both renames kept (two different templates)`, both, { tabs })
  said.push(`tab ${tag}: ${tabs.slice(0, 4).join(' | ')}`)
}
const rs = L.results.slice(n0)
H.TABLE.push({ step: 'W2-10e', width: 'desktop', what: 'two tabs, two DIFFERENT duty templates: A renames the first, B (not reloaded) the second', afterReload: said.join(' · '), rows: `A: ${H.auditText(aA)} ‖ B: ${H.auditText(aB)}`, pass: rs.every(r => r.ok), fails: rs.filter(r => !r.ok).map(r => `${r.name}: ${r.detail}`), pics: ['W2-10e-W2ADUTY.png', 'W2-10e-W2BDUTY.png', 'W2-10e-b-tabA.png', 'W2-10e-b-tabB.png'] })
console.log('\nerrors:', errors.length ? errors : 'none')
H.save({ errors })
await browser.close()
process.exit(0)
