import * as B from './cal-B-lib.mjs'
const size = process.argv[2] || 'desk'
const w = await B.world(size)
const p = w.page
const pics = []
const S = w.key
const formInfo = () => p.evaluate(() => {
  const f = document.querySelector('[data-testid="counter-form"]'); if (!f) return null
  const r = f.getBoundingClientRect()
  return { text: f.innerText.replace(/\s+/g, ' ').trim(), ids: [...f.querySelectorAll('[data-testid]')].map(e => e.getAttribute('data-testid')),
    buttons: [...f.querySelectorAll('button')].map(b => b.innerText.trim()).filter(Boolean), box: { x: Math.round(r.x), y: Math.round(r.y), r: Math.round(r.right), b: Math.round(r.bottom) } }
})
const avail = async iso => B.txt(B.cell(w, 'avail-p', iso))
const firstDay = '2026-01-01'
const before = await avail(firstDay)
const name0 = await B.txt(B.tid(w, 'fly-name-avail-p'))
await B.press(w, B.tid(w, 'fly-name-avail-p'))
await p.waitForSelector('[data-testid="counter-form"]')
await B.sleep(300)
pics.push(await B.pic(p, `P2-01-${S}-1-form-opened`))
const f1 = await formInfo()
console.log('FORM1', JSON.stringify(f1))
const forbiddenIds = ['cform-amber', 'cform-red', 'cform-mode-team', 'cform-mode-people', 'cform-delete', 'cform-slot-add', 'cform-show-teams']
const present = forbiddenIds.filter(i => f1.ids.includes(i))
const prev1 = await B.txt(B.tid(w, 'cform-preview'))
const nameVal1 = await B.tid(w, 'cform-name').inputValue()
/* rename and change filters: CAT is not OCU; also a qualification chip */
await B.tid(w, 'cform-name').fill('AV P test')
await B.press(w, B.tid(w, 'cf-catmode'))
await B.press(w, B.tid(w, 'cf-cat-OCU'))
const prev2 = await B.txt(B.tid(w, 'cform-preview'))
const f2 = await formInfo()
pics.push(await B.pic(p, `P2-01-${S}-2-ocu-left-out`))
/* a qualification chip, if one is offered */
const qualIds = f2.ids.filter(i => /^cf-qual-/.test(i))
let prev3 = null, qpicked = null
if (qualIds.length) { qpicked = qualIds[0]; await B.press(w, B.tid(w, qpicked)); prev3 = await B.txt(B.tid(w, 'cform-preview')); pics.push(await B.pic(p, `P2-01-${S}-3-qual`)) }
const f3 = await formInfo()
await B.press(w, B.tid(w, 'cform-save'))
await B.sleep(500)
const sheetGone = (await B.tid(w, 'counter-form').count()) === 0
const nameAfter = await B.txt(B.tid(w, 'fly-name-avail-p'))
const afterFig = await avail(firstDay)
pics.push(await B.pic(p, `P2-01-${S}-4-saved`))
/* the preview's "counts N" vs the cell */
const num = s => { const m = /counts\s+([\d.]+)/.exec(s || ''); return m ? Number(m[1]) : null }
/* reopen: the saved row's own form */
await B.press(w, B.tid(w, 'fly-name-avail-p'))
await p.waitForSelector('[data-testid="counter-form"]'); await B.sleep(300)
const prev4 = await B.txt(B.tid(w, 'cform-preview'))
const f4 = await formInfo()
const nameVal4 = await B.tid(w, 'cform-name').inputValue()
pics.push(await B.pic(p, `P2-01-${S}-5-reopened`))
await B.press(w, B.tid(w, 'cform-cancel'))
await B.sleep(300)
/* Required names open nothing */
const reqNameBtn = await B.tid(w, 'fly-name-req-p').count()
await B.press(w, p.locator('[data-testid="fly-row-req-p"] .who'))
await B.sleep(300)
const reqOpened = (await B.tid(w, 'counter-form').count()) + (await B.tid(w, 'sheet').count())
const reqText = await B.txt(p.locator('[data-testid="fly-row-req-p"] .who'))
pics.push(await B.pic(p, `P2-01-${S}-6-required-name`))
const checks = [
  ['name field starts "Available P"', nameVal1 === 'Available P', nameVal1],
  ['forbidden controls absent (amber/red/teams/people-mode/delete/slots)', present.length === 0, present],
  ['no SANS chip / reset / default words', !/SANS inclu|reset|default/i.test(f1.text.replace(/SANS people are never counted here\. The SANS calendar reads this row, so it cannot be deleted\./, '')), f1.text.slice(0, 400)],
  ['the sample before change = first day figure', num(prev1) === Number(before), { prev1, before }],
  ['sample after OCU out matches the saved row (cell on first day)', num(prev2) === Number(afterFig) || (prev3 && num(prev3) === Number(afterFig)), { prev2, prev3, afterFig }],
  ['row renamed', /AV P test/i.test(nameAfter), nameAfter],
  ['Required name opens nothing', !reqNameBtn && !reqOpened, { reqNameBtn, reqOpened, reqText }],
]
const bad = checks.filter(c => !c[1])
B.row('P2-01', S, 'Opened Available P by its name; read every control/preview; renamed, left OCU out (is not OCU), picked a qualification chip; saved; reopened; tapped Required P name',
  checks.map(c => `${c[1] ? 'ok' : 'XX'} ${c[0]} [${JSON.stringify(c[2]).slice(0, 220)}]`).join(' | ') + ` || buttons: ${f1.buttons.join(' / ')} || previews: 1="${prev1}" 2="${prev2}" 3="${prev3}" 4(reopen)="${prev4}"; cells first day before=${before} after=${afterFig}; form box ${JSON.stringify(f1.box)}; qual chip ${qpicked}`,
  bad.length ? 'FAIL' : 'PASS', pics)
B.noteErrors('p201-' + S, w.errors)
await B.close(w)
