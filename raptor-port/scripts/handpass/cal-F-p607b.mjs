/* WALKER F — P6-07 on the List's own Add form (its own people picker). */
import * as L from './cal-F-lib3.mjs'
const PHONE = process.env.HP_PHONE === '1', TAG = PHONE ? 'ph' : 'dk'
const b = await L.launch()
const ctx = await L.newCtx(b, { phone: PHONE })
const p = await L.newPage(ctx)
await L.signIn(p, 'ad')
await L.go(p, 'inputs')
const P = L.press(p, PHONE)
const [ace, echo, basher] = await L.ids(p, ['Ace', 'Echo', 'Basher'])
const pic = n => L.pic(p, `${TAG}-p607b-${n}`)
await P(p.locator('#inListBtn')); await L.sleep(600)
await p.evaluate(() => scrollTo(0, 0))
await p.selectOption('#inType', 'Duty'); await L.sleep(250)
await p.selectOption('#inPerson', ace); await L.sleep(250)
const root = '[data-testid="pp"]:visible'
await P(p.locator(root + ' [data-testid="pp-several"]')); await L.sleep(300)
await pic('several-on')
const roster = await p.evaluate(() => Object.entries(window.PEOPLE).filter(([k, v]) => !v.special && !v.archived && !v.deleted).map(([k, v]) => ({ id: k, cs: v.cs, seat: v.seat, san: !!v.san, pers: !!v.pers })))
const csOf = id => roster.find(r => r.id === id).cs
const on = () => p.evaluate(r => [...document.querySelectorAll(r + ' [data-pp][aria-pressed="true"]')].map(e => e.dataset.pp), root.replace(':visible', ''))
const groups = await p.evaluate(() => { const pp = [...document.querySelectorAll('[data-testid="pp"]')].find(e => e.offsetParent !== null); return [...pp.querySelectorAll('[data-ppgroup]')].map(g => ({ g: g.dataset.ppgroup, ids: [...g.querySelectorAll('[data-pp]')].map(e => e.dataset.pp) })) })
const exp = { pilots: roster.filter(r => r.seat !== 'RCP' && !r.san && !r.pers && r.seat !== 'GND'), wsos: roster.filter(r => r.seat === 'RCP' && !r.san), sans: roster.filter(r => r.san), personnel: roster.filter(r => r.pers) }
const az = ids => { const c = ids.map(csOf); return JSON.stringify(c) === JSON.stringify([...c].sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }))) }
const info = Object.fromEntries(groups.map(g => [g.g, { n: g.ids.length, az: az(g.ids), same: JSON.stringify([...g.ids].sort()) === JSON.stringify(exp[g.g].map(r => r.id).sort()) }]))
const pressAll = async g => { const bt = p.locator(`${root} [data-testid="pp-all-${g}"]`); await bt.scrollIntoViewIfNeeded(); await P(bt); await L.sleep(150) }
for (const g of ['pilots', 'wsos', 'personnel']) await pressAll(g)
const allOn = await on()
const sansIn = allOn.filter(id => roster.find(r => r.id === id).san)
await pic('all-three')
for (const g of ['pilots', 'wsos', 'personnel']) await pressAll(g)
const afterClear = await on()
const cnt = await p.locator(root + ' [data-testid="pp-count"]').innerText()
await pic('after-clear')
/* return to one: the first picked is kept */
await P(p.locator(root + ' [data-testid="pp-several"]')); await L.sleep(300)
const back = await p.evaluate(() => { const e = [...document.querySelectorAll('#inPerson')].find(x => x.offsetParent !== null); return e ? e.options[e.selectedIndex].text : null })
console.log(JSON.stringify({ info, allOn: allOn.length, sansIn, afterClear: afterClear.map(csOf), cnt, back }))
L.judge('P6-07 (List Add form)', 'the List Add form’s own picker: Several people, each All, again, return to one', [
  ['all four groups drawn, each A to Z, each holding exactly its own men', ['pilots', 'wsos', 'sans', 'personnel'].every(g => info[g] && info[g].az && info[g].same), info],
  ['the three Alls select their groups and no SANS man', allOn.length === 50 && sansIn.length === 0, { n: allOn.length, sansIn }],
  ['pressing each All again clears the group but never the last man (one stays)', afterClear.length === 1, afterClear.map(csOf)],
  ['back to one person keeps a picked man', !!back && afterClear.map(csOf).includes(back), { back, cnt }],
], [])
console.log('errors', JSON.stringify(L.errors))
L.savePart('p607b-' + TAG)
await b.close()
