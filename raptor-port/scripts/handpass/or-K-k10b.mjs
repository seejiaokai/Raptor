// K10b - the "+ add" of the LOWER row armed, then the row ABOVE it taken off the programme (indexes shift). A later tap on Tally.
import * as K from './or-K-lib.mjs'
const { fileInput, goBoard, shot, saveRes, errs, toastMark, toastsSince } = K
const out = {}
const { ctx, page: p } = await K.openWorld({ fresh: false })
await K.hideToast(p)
const WED = 2
const fm = await fileInput(p, { type: 'Meeting', people: ['Drifter', 'Hunter', 'Ranger'], from: '2026-07-15', to: '2026-07-15', timed: ['14:00', '15:00'], title: 'Range brief' })
const ft = await fileInput(p, { type: 'Training', person: 'Anvil', from: '2026-07-15', to: '2026-07-15', timed: ['09:00', '10:00'], title: 'Early drill' })
const idM = fm[0].iid, idT = ft[0].iid
const dump = () => p.evaluate(() => ({ inputs: window.INPUTS.map(r => `${r.title || r.type}@${r.date}:${(r.people || []).map(e => window.PEOPLE[e.p]?.cs).join('+')}`).filter(s => /Range brief|Early drill/.test(s)), ground: (window.DAYS[2].ground || []).map(g => `${(g.prog || '').slice(0, 14)}[${g.who || ''}${g.more ? '+' + g.more.length : ''}]${g.src ? '*' : ''}`), arm: window.ARM && window.ARM.key }))
const ri = id => p.evaluate(id => (window.DAYS[2].ground || []).findIndex(g => g.src === id), id)
await goBoard(p, WED)
console.log('start', JSON.stringify(await dump()))
const rm = await ri(idM), rt = await ri(idT)
console.log('Meeting row', rm, 'Early drill row', rt)
// arm the LOWER row (whichever of the two is lower)
const lower = rt > rm ? rt : rm, upper = rt > rm ? rm : rt, lowerName = rt > rm ? 'Early drill' : 'Range brief'
await p.locator(`#schedBoard [data-fill="g:${WED}.${lower}.+"]`).first().click(); await p.waitForTimeout(400)
out.armed = await dump(); console.log('armed', out.armed.arm, 'on', lowerName)
await K.hideToast(p); await shot(p, 'k10b-1-armed-lower')
// take the row ABOVE it off the programme with its X
await p.locator(`#schedBoard [data-grdel="${WED}.${upper}"]`).first().click(); await p.waitForTimeout(800)
out.afterX = await dump(); console.log('after X of the upper row: arm =', out.afterX.arm, '\n ground', JSON.stringify(out.afterX.ground))
await K.hideToast(p); await shot(p, 'k10b-2-after-x-above')
const before = await dump(); const mk = await toastMark(p)
await p.locator(`#sbRoster .rpuck[data-person="${await K.csId(p, 'Tally')}"]`).first().click(); await p.waitForTimeout(700)
const after = await dump()
out.tap = { toast: await toastsSince(p, mk), before, after, same: JSON.stringify(before) === JSON.stringify(after) }
console.log('tap Tally: toast=', out.tap.toast, '| unchanged:', out.tap.same, '\n inputs', JSON.stringify(after.inputs), '\n ground', JSON.stringify(after.ground), '\n arm', after.arm)
await K.hideToast(p); await shot(p, 'k10b-3-after-tap')
out.errs = errs.slice(); saveRes('k10b', out); console.log('ERRS', JSON.stringify(errs))
await ctx.close(); await K.browser.close()
