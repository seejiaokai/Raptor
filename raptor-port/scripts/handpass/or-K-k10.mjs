// K10 - the Scheduler Board: an input row's "+ add" armed; (V1) the day changed by the week strip and back; (V2) another input
// accepted on the same day, above it. A later tap on a crew-list man must not add him to some other row.
import * as K from './or-K-lib.mjs'
const { fileInput, goWeek, goBoard, shot, shotEl, readRows, inputsOf, reload, saveRes, errs, toast, toastMark, toastsSince } = K
const out = {}
const { ctx, page: p } = await K.openWorld({ fresh: false })
await K.hideToast(p)
const WED = 2
const fm = await fileInput(p, { type: 'Meeting', people: ['Drifter', 'Hunter', 'Ranger'], from: '2026-07-15', to: '2026-07-15', timed: ['14:00', '15:00'], title: 'Range brief' })
const ft = await fileInput(p, { type: 'Training', person: 'Anvil', from: '2026-07-15', to: '2026-07-15', timed: ['09:00', '10:00'], title: 'Early drill' })
console.log('filed', JSON.stringify(fm), JSON.stringify(ft))
const idM = fm[0].iid, idT = ft[0].iid
const dump = () => p.evaluate(() => ({ inputs: window.INPUTS.map(r => `${r.title || r.type}@${r.date}:${(r.people || []).map(e => window.PEOPLE[e.p]?.cs).join('+')}${r.rm ? ' RM' : ''}`).filter(s => /Range brief|Early drill/.test(s)), ground: [2, 3].map(di => (window.DAYS[di].ground || []).map(g => `${(g.prog || '').slice(0, 14)}[${g.who || ''}${g.more ? '+' + g.more.length : ''}]${g.src ? '*' : ''}`)), arm: window.ARM && (window.ARM.key || JSON.stringify(window.ARM)) }))
const ri = id => p.evaluate(id => (window.DAYS[2].ground || []).findIndex(g => g.src === id), id)
await goBoard(p, WED); await K.openFold(p, 'board', WED)
// take Early drill off the programme with the row's X, so its Personal Inputs line offers Accept
let rt = await ri(idT)
console.log('Early drill row', rt)
await p.locator(`#schedBoard [data-grdel="${WED}.${rt}"]`).first().click(); await p.waitForTimeout(700)
out.afterX = await dump(); console.log('after X', JSON.stringify(out.afterX))
await K.openFold(p, 'board', WED)
const accept = p.locator('#schedBoard .pinp .sb-arow', { hasText: /Early drill/i }).getByText(/^accept$/i)
console.log('Accept control count', await accept.count())
const rm = await ri(idM)
console.log('Meeting row index', rm)
// ---------- V1: arm "+ add" on the Meeting's row, change the day by the strip and back, tap Tally
const addz = p.locator(`#schedBoard [data-fill="g:${WED}.${rm}.+"]`).first()
console.log('+add count', await p.locator(`#schedBoard [data-fill="g:${WED}.${rm}.+"]`).count())
await addz.scrollIntoViewIfNeeded(); await addz.click(); await p.waitForTimeout(400)
out.v1armed = await dump(); console.log('V1 armed', out.v1armed.arm)
await K.hideToast(p); await shot(p, 'k10-1-v1-armed')
// the day strip: Thursday, then Wednesday again
await p.locator('#schedBoard').getByText(/^Thu 16$/).first().click().catch(async () => { await p.locator('button', { hasText: /^Thu 16$/ }).first().click() }); await p.waitForTimeout(800)
out.v1onThu = await dump(); console.log('V1 on Thursday: arm =', out.v1onThu.arm, '| SBDAY', await p.evaluate(() => window.SBDAY))
await shot(p, 'k10-2-v1-thursday')
await p.locator('#schedBoard').getByText(/^Wed 15$/).first().click(); await p.waitForTimeout(800)
out.v1backWed = await dump(); console.log('V1 back on Wednesday: arm =', out.v1backWed.arm, '| SBDAY', await p.evaluate(() => window.SBDAY))
await shot(p, 'k10-3-v1-back-wednesday')
const before1 = await dump()
const mk1 = await toastMark(p)
await p.locator(`#sbRoster .rpuck[data-person="${await K.csId(p, 'Tally')}"]`).first().click(); await p.waitForTimeout(700)
const after1 = await dump()
out.v1tap = { toast: await toastsSince(p, mk1), before: before1, after: after1, same: JSON.stringify(before1.inputs) === JSON.stringify(after1.inputs) && JSON.stringify(before1.ground) === JSON.stringify(after1.ground) }
console.log('V1 tap Tally: toast=', out.v1tap.toast, '| unchanged:', out.v1tap.same, '\n  inputs', JSON.stringify(after1.inputs), '\n  ground', JSON.stringify(after1.ground), '\n arm', after1.arm)
await shot(p, 'k10-4-v1-after-tap')
// ---------- V2: arm again, accept Early drill on the same day, tap Tally
await K.openFold(p, 'board', WED)
const rm2 = await ri(idM)
await p.locator(`#schedBoard [data-fill="g:${WED}.${rm2}.+"]`).first().click(); await p.waitForTimeout(400)
const armedV2 = await dump(); out.v2armed = armedV2; console.log('V2 armed', armedV2.arm, 'meeting row', rm2)
await K.hideToast(p); await shot(p, 'k10-5-v2-armed')
await K.openFold(p, 'board', WED)
await p.locator('#schedBoard .pinp .sb-arow', { hasText: /Early drill/i }).getByText(/^accept$/i).first().click(); await p.waitForTimeout(800)
out.v2accepted = await dump(); console.log('V2 after Accept: arm =', out.v2accepted.arm, '\n  ground', JSON.stringify(out.v2accepted.ground))
console.log('Meeting row index now', await ri(idM), ' Early drill row', await ri(idT))
await K.hideToast(p); await shot(p, 'k10-6-v2-after-accept')
const before2 = await dump()
const mk2 = await toastMark(p)
await p.locator(`#sbRoster .rpuck[data-person="${await K.csId(p, 'Tally')}"]`).first().click(); await p.waitForTimeout(700)
const after2 = await dump()
out.v2tap = { toast: await toastsSince(p, mk2), before: before2, after: after2, same: JSON.stringify(before2.inputs) === JSON.stringify(after2.inputs) && JSON.stringify(before2.ground) === JSON.stringify(after2.ground) }
console.log('V2 tap Tally: toast=', out.v2tap.toast, '| unchanged:', out.v2tap.same, '\n  inputs', JSON.stringify(after2.inputs), '\n  ground', JSON.stringify(after2.ground), '\n arm', after2.arm)
await K.hideToast(p); await shot(p, 'k10-7-v2-after-tap')
out.errs = errs.slice(); saveRes('k10', out); console.log('ERRS', JSON.stringify(errs))
await ctx.close(); await K.browser.close()
