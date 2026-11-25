// k0-world - the three-squadron world of his D2630 ([MSQ-PICK-GUARD] third round, chat 176, 25 Nov 26), built by the
// app's own controls on a desktop browser, its saved data then copied into each fresh browser by k1-k8:
//   1. Saber (master admin) on 142: Admin → Squadrons → "+ New squadron": 150, Home base, first admin Kestrel · 149
//      (the form offers only Hunter · 142 and Kestrel · 149; Hunter is kept off it so his 150 line can be View) → Save.
//   2. Picks 150: Admin → Users → Add a person, home 150: "Zephyr" (Pilot, sign-in zephyr@mail) and "Vortex" (WSO, no
//      sign-in) → Add person, each (the next name of a short list if the app says a callsign is taken).
//   3. Zephyr's row → Role Admin → Save: 150 has an admin of its own. Then Kestrel's row → "Access to 150" None → Save
//      (Kestrel back to 149's admin alone, as the brief's cases want).
//   4. Hunter's row → "Access to 149" Plan, "Access to 150" View → Save.
//   node raptor-port/scripts/handpass/n176/k0-world.mjs
import { writeFileSync } from 'node:fs'
import { pathToFileURL } from 'node:url'
import { mk, closeAll, FACT, signIn, go, wait, vis, hit, barSq, toastNow, usersTab, reachPick, scratch, WORLD } from './k-lib.mjs'
const lineBtn = (num, v) => `[data-testid="acc-sq"] [aria-label="Access to ${num}"] button[data-line="${v}"]`
const pidOf = (s, cs) => s.page.evaluate(cs => { const e = [...document.querySelectorAll('#accList [data-person]')].find(x => new RegExp('^' + cs).test(x.innerText.trim())); return e ? e.getAttribute('data-person') : null }, cs)
async function find(s, cs) {
  const f = vis(s, '#accFind').first()
  if (await f.count()) { await f.click(); await s.page.keyboard.press('Control+a'); await s.page.keyboard.type(cs); await wait(s, 500) }
  return pidOf(s, cs)
}
async function clearFind(s) { const f = vis(s, '#accFind').first(); if (await f.count() && (await f.inputValue())) { await f.click(); await s.page.keyboard.press('Control+a'); await s.page.keyboard.press('Backspace'); await wait(s, 400) } }
async function openRow(s, pid) { const r = s.page.locator(`#accList [data-person="${pid}"] .acc-tap`).first(); await r.scrollIntoViewIfNeeded(); await r.click(); await wait(s, 500) }
async function lines(s, pid, want) {
  await usersTab(s); await clearFind(s)
  const p = pid.startsWith('cs:') ? await find(s, pid.slice(3)) : pid
  if (!p) return 'not found'
  await openRow(s, p)
  for (const [num, v] of Object.entries(want)) { const b = s.page.locator(lineBtn(num, v)); if (!(await b.count())) return `no ${num} ${v} button`; if ((await b.getAttribute('aria-pressed')) !== 'true') await b.click() }
  await s.page.locator('#accEdSave').click(); await wait(s, 800)
  return { pid: p, toast: await toastNow(s) }
}
async function addPerson(s, names, seat, mail) {
  const { page } = s
  const tried = []
  for (const [cs, ini] of names) {
    const r = await addOne(s, cs, ini, seat, mail ? cs.toLowerCase() + '@mail' : '')
    tried.push(`${cs}: ${r.toast}`)
    if (r.pid) return { ...r, cs, tried }
    await wait(s, 2500)
  }
  return { pid: null, tried }
}
async function addOne(s, cs, ini, seat, mail) {
  const { page } = s
  await usersTab(s)
  const homes = await page.locator('#accAddHome').evaluate(e => [...e.options].map(o => o.text))
  await page.selectOption('#accAddHome', { label: '150' })
  await page.fill('#accAddCs', cs); await page.fill('#accAddIni', ini)
  await page.selectOption('#accAddSeat', { label: seat })
  const cat = await page.locator('#accAddCat').evaluate(e => [...e.options].map(o => o.text).find(t => t !== 'Pick…'))
  if (cat) await page.selectOption('#accAddCat', { label: cat })
  if (mail) await page.fill('#accAddName', mail)
  await hit(s, '#accAdd', 900)
  return { homes, cat, toast: await toastNow(s), pid: await pidOf(s, cs) }
}
export async function buildWorld() {
  const s = await mk('d'); const { page } = s
  try {
    await signIn(s, 'ad', 'a')
    await go(s, 'admin'); await wait(s, 700)
    if (await vis(s, '.adm-back').count()) await hit(s, '.adm-back')
    await hit(s, vis(s, '#page-admin button.adm-cat').filter({ hasText: /^Squadrons/ }).first(), 700)
    await hit(s, '#sqNew', 500)
    await vis(s, '#sqNewNum').first().click(); await page.keyboard.type('150')
    await vis(s, '#sqNewAdmin').first().selectOption({ label: 'Kestrel · 149' })
    const noteW = await page.locator('#sqNewNote').first().textContent().catch(() => null)
    await hit(s, '#sqNewSave', 1200)
    FACT('k0.1.newSquadron150', { note: noteW, toast: await toastNow(s), list: (await page.locator('#sqList').first().innerText().catch(() => '')).replace(/\s+/g, ' ').slice(0, 160) })
    const p = await reachPick(s, 150, 'bar'); FACT('k0.2.pick150', { rows: p.listRows, squadron: await barSq(s) })
    const A = await addPerson(s, [['Zephyr', 'ZP'], ['Quasar', 'QS'], ['Nimbusx', 'NX']], 'Pilot', true); FACT('k0.2.addAdmin150', A)
    await wait(s, 2500)
    const B = await addPerson(s, [['Vortex', 'VX'], ['Tundra', 'TD'], ['Glacier', 'GL']], 'WSO', false); FACT('k0.2.addMember150', B)
    /* the first made 150's admin: his row → Role Admin → Save */
    await usersTab(s)
    const op = A.pid; await openRow(s, op)
    const roleOpts = await page.locator('#accEdRole').evaluate(e => [...e.options].map(o => o.text)).catch(() => null)
    await page.selectOption('#accEdRole', { label: 'Admin' }).catch(async () => page.selectOption('#accEdRole', 'admin'))
    await page.locator('#accEdSave').click(); await wait(s, 900)
    FACT('k0.3.admin150', { pid: op, roleOpts, toast: await toastNow(s), row: await page.evaluate(p => document.querySelector(`#accList [data-person="${p}"]`)?.innerText.replace(/\s+/g, ' ').trim().slice(0, 90), op) })
    await wait(s, 2000)
    FACT('k0.3.kestrel150None', await lines(s, 'cs:Kestrel', { 150: 'none' }))
    await reachPick(s, 142, 'bar'); await wait(s, 2000)
    FACT('k0.4.hunterPlan149View150', await lines(s, 'prowler', { 149: 'plan', 150: 'view' }))
    await usersTab(s)
    FACT('k0.5.hunterRow', await page.evaluate(() => document.querySelector('#accList [data-person="prowler"]')?.innerText.replace(/\s+/g, ' ').trim().slice(0, 120)))
    await scratch(s, 'k0-world-end')
    await wait(s, 600); writeFileSync(WORLD, JSON.stringify(await s.ctx.storageState()))
    FACT('k0.saved', WORLD)
  } finally { await s.ctx.close().catch(() => {}) }
  return WORLD
}
if (import.meta.url === pathToFileURL(process.argv[1]).href) { try { await buildWorld() } finally { await closeAll() } }
