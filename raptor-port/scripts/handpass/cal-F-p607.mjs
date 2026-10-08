import * as L from './cal-F-lib3.mjs'
const PHONE = process.env.HP_PHONE === '1', TAG = PHONE ? 'ph' : 'dk'
const b = await L.launch()
const ctx = await L.newCtx(b, { phone: PHONE })
const p = await L.newPage(ctx)
await L.signIn(p, 'ad')
await L.go(p, 'inputs')
const P = L.press(p, PHONE)
const [ace, echo, saber] = await L.ids(p, ['Ace', 'Echo', 'Saber'])
const F_id = cs => L.pidOf(p, cs)
const pic = n => L.pic(p, `${TAG}-p607-${n}`)
const S = '#inpEditPop'
const on = () => p.evaluate(s => [...document.querySelectorAll(s + ' [data-pp][aria-pressed="true"]')].map(e => e.dataset.pp), S)
const names = ids => p.evaluate(i => i.map(x => window.PEOPLE[x].cs), ids)
const count = () => p.locator(S + ' [data-testid="pp-count"]').innerText().catch(() => null)
const sel = () => p.locator('#inpEditPerson').evaluate(e => ({ v: e.value, cs: e.options[e.selectedIndex].text, vis: e.offsetParent !== null })).catch(() => null)
const press1 = async id => { const b = p.locator(`${S} [data-pp="${id}"]`); await b.scrollIntoViewIfNeeded(); await P(b); await L.sleep(120) }
const pressAll = async g => { const b = p.locator(`${S} [data-testid="pp-all-${g}"]`); await b.scrollIntoViewIfNeeded(); await P(b); await L.sleep(150) }

await L.openNew(p, '2026-08-10', { phone: PHONE })
await p.selectOption('#inpEditPerson', ace)
const roster = await p.evaluate(() => Object.entries(window.PEOPLE).filter(([k, v]) => !v.special && !v.archived && !v.deleted).map(([k, v]) => ({ id: k, cs: v.cs, seat: v.seat, san: !!v.san, pers: !!v.pers })))
await P(p.locator(S + ' [data-testid="pp-several"]')); await L.sleep(300)
await pic('several-on')
const groups = await p.evaluate(s => [...document.querySelectorAll(s + ' [data-ppgroup]')].map(g => ({ g: g.dataset.ppgroup, ids: [...g.querySelectorAll('[data-pp]')].map(e => e.dataset.pp), all: !!g.querySelector('[data-testid^="pp-all-"]') || !!(g.previousElementSibling && g.previousElementSibling.querySelector && g.previousElementSibling.querySelector('[data-testid^="pp-all-"]')) })), S)
const csOf = id => roster.find(r => r.id === id).cs
const exp = {
  pilots: roster.filter(r => r.seat !== 'RCP' && !r.san && !r.pers && r.seat !== 'GND').map(r => r.id),
  wsos: roster.filter(r => r.seat === 'RCP' && !r.san).map(r => r.id),
  sans: roster.filter(r => r.san).map(r => r.id),
  personnel: roster.filter(r => r.pers).map(r => r.id),
}
const sortedAZ = ids => { const c = ids.map(csOf); return JSON.stringify(c) === JSON.stringify([...c].sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }))) }
const gInfo = Object.fromEntries(groups.map(g => [g.g, { n: g.ids.length, az: sortedAZ(g.ids), setOk: JSON.stringify([...g.ids].sort()) === JSON.stringify([...(exp[g.g] || [])].sort()) }]))
const allIds = groups.flatMap(g => g.ids)
const dupes = allIds.length - new Set(allIds).size
const firstOn = await on()
console.log('groups', JSON.stringify(gInfo), 'dupes', dupes, 'start on', await names(firstOn), 'count', await count())

/* each All */
const afterAll = {}
for (const g of ['pilots', 'wsos', 'personnel']) {
  await pressAll(g)
  const o = await on()
  afterAll[g] = { n: o.length, sansIn: (await names(o.filter(id => roster.find(r => r.id === id).san))).join(), count: await count(), hasExp: exp[g].every(id => o.includes(id)) }
}
await pic('after-all-three')
const allOn = await on()
const sansPicked = allOn.filter(id => roster.find(r => r.id === id).san)
console.log('after all', JSON.stringify(afterAll))
/* a second press on each All clears that group, never the last man */
for (const g of ['pilots', 'wsos', 'personnel']) await pressAll(g)
const afterClear = await on()
console.log('after second presses', JSON.stringify(await names(afterClear)), await count())
await pic('after-clear')
/* deselect everyone down to one, then try to deselect the last */
await press1(echo); await L.sleep(100)
let now = await on()
for (const id of now) { if ((await on()).length > 1) await press1(id) }
const one = await on()
await press1(one[0]); await L.sleep(200)
const stillOne = await on()
const sel1 = await sel()
const cnt1 = await count()
await pic('last-man')
/* order of pick: Ace is the first, Echo second, then deselect Ace; return keeps the first picked still on */
await press1(echo)
const before = await on()
await P(p.locator(S + ' [data-testid="pp-several"]')); await L.sleep(400)
const back = await sel()
const swOff = await p.locator(S + ' [data-testid="pp-several"]').getAttribute('aria-checked')
await pic('back-to-one')
console.log(JSON.stringify({ one: await names(one), stillOne: await names(stillOne), sel1, cnt1, before: await names(before), back, swOff }))

/* ORDER OF PICK: Ace first, then Echo, then Basher; back to one => Ace. Again: take Ace off => Echo is the one kept */
await P(p.locator('#inpEditCancel')); await L.sleep(300)
const basher = await F_id('Basher')
await L.openNew(p, '2026-08-11', { phone: PHONE })
await p.selectOption('#inpEditPerson', ace)
await P(p.locator(S + ' [data-testid="pp-several"]')); await L.sleep(250)
await press1(echo); await press1(basher)
const ord1 = await names(await on())
await P(p.locator(S + ' [data-testid="pp-several"]')); await L.sleep(300)
const back1 = await sel()
await P(p.locator('#inpEditCancel')); await L.sleep(300)
await L.openNew(p, '2026-08-12', { phone: PHONE })
await p.selectOption('#inpEditPerson', ace)
await P(p.locator(S + ' [data-testid="pp-several"]')); await L.sleep(250)
await press1(echo); await press1(basher)
await press1(ace); await L.sleep(150)
const ord2 = await names(await on())
const ordAgain = ord2
await P(p.locator(S + ' [data-testid="pp-several"]')); await L.sleep(300)
const back2 = await sel()
await pic('order-back')
console.log(JSON.stringify({ ord1, back1, ordAgain, ord2, back2 }))

L.judge('P6-07 (editor window, Saber)', 'switch to Several people, press each All, press them again, take the picks down to one, try to take the last off, return to one person', [
  ['groups drawn: pilots, wsos, sans, personnel (in the editor window)', ['pilots', 'wsos', 'sans', 'personnel'].every(g => gInfo[g]), Object.keys(gInfo)],
  ['each group A to Z by callsign', Object.values(gInfo).every(x => x.az), gInfo],
  ['each group holds exactly its own men (SANS only in SANS; Personnel = the ground crew)', Object.values(gInfo).every(x => x.setOk), gInfo],
  ['no man drawn twice', dupes === 0, dupes],
  ['All Pilots, All WSOs, All Personnel select their group in full', Object.values(afterAll).every(x => x.hasExp), afterAll],
  ['no All selects a SANS man', sansPicked.length === 0 && Object.values(afterAll).every(x => !x.sansIn), sansPicked.length],
  ['the second press on each All clears that group', afterClear.length >= 1 && afterClear.length < allOn.length, { before: allOn.length, after: afterClear.length }],
  ['the last man cannot be taken off (still one picked)', stillOne.length === 1, { n: stillOne.length, count: cnt1 }],
  ['returning to one person keeps a picked man', !!back && back.vis && (before.includes(back.v)), { back }],
  ['order of pick: Ace, Echo, Basher -> back to one is Ace; with Ace taken off, back to one is Echo', back1 && back1.cs === 'Ace' && back2 && back2.cs === 'Echo', { ord1, back1, ord2, back2 }],
], [])
console.log('errors', JSON.stringify(L.errors))
L.savePart('p607-' + TAG)
await b.close()
