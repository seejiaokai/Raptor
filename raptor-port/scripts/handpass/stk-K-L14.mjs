import * as K from './stk-K-lib.mjs'
const { L, W, H } = K
async function clickBox(p, sel) {
  const el = p.locator(sel).first()
  await el.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await K.sleep(250)
  const b = await el.boundingBox()
  await p.mouse.click(b.x + b.width / 2, b.y + b.height / 2); await K.sleep(250)
  return b
}
const focusD = p => p.evaluate(() => { const a = document.activeElement; if (!a || a === document.body) return 'BODY (nothing focused)'; const w = a.closest('[data-testid]'); return `${a.tagName.toLowerCase()} ${a.dataset.inp || a.dataset.txt || a.id || ''} "${(a.innerText || a.value || '').toString().replace(/\s+/g, ' ').trim().slice(0, 30)}"${w ? ' INSIDE window ' + w.dataset.testid : ' (in the page, behind any window)'}` })
const snapAll = p => p.evaluate(() => ({ d: JSON.stringify(window.DAYS), i: JSON.stringify(window.INPUTS), elog: window.ELOG.rows.length, cmds: window.commandStreamLen() }))
const { browser, p, errors } = await H.world({ who: 'a', phone: false })
await W.toastSpy(p)
// file a duty on Saturday 18 Jul through the Inputs form, answer the OIL ask Yes
const o = await K.fileOpen(p, { person: 'Ace', type: 'Duty', iso: '2026-07-18', from: '08:00', to: '16:00', remarks: 'L14 duty' })
const asked0 = await K.answerAsks(p)
const iid = await K.newIid(p, o.before)
console.log('filed', iid, 'asks answered:', asked0)
const inp = await p.evaluate(i => { const x = window.INPUTS.find(r => r.iid === i); return x && JSON.stringify({ type: x.type, date: x.date, str: x.str, end: x.end, acc: x.acc, oil: x.oil }) }, iid)
console.log('request', inp)
await L.go(p, 'editsched'); await p.waitForSelector('#eWeek .day[data-day="5"]'); await L.sleep(700)
const hd = p.locator('#eWeek .day[data-day="5"] [data-pitog="5"]').first()
await hd.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' }))
if (!(await p.locator(`#eWeek [data-inp="${iid}.str"]`).count())) { await hd.click(); await K.sleep(500) }
const STR = `#eWeek [data-inp="${iid}.str"]`
const strBefore = await p.evaluate(s => document.querySelector(s) && document.querySelector(s).innerText, STR)
const s0 = await snapAll(p)
await clickBox(p, STR)
await p.keyboard.press('Control+A'); await p.keyboard.type(process.env.K_START || '0900', { delay: 20 })
await p.keyboard.press('Tab')
const tl = []
for (let t = 0; t < 14; t++) { await K.sleep(150); tl.push((t + 1) * 150 + 'ms: oil=' + (await K.winOpen(p, 'oilconf')) + ' editor=' + (await p.locator('.airpop:visible').count()) + ' focus=' + (await focusD(p))) }
console.log(tl.join(' | '))
globalThis.TL = tl
const win = await p.evaluate(() => { const w = document.querySelector('[data-testid="oilconf"]'); return w && w.getBoundingClientRect().width > 0 ? w.querySelector('.airpop-head').innerText.replace(/\s+/g, ' ').trim() + ' | ' + w.querySelector('.airpop-body').innerText.replace(/\s+/g, ' ').slice(0, 220) : null })
const f1 = await focusD(p)
const pc1 = await K.pic(p, 'L14-' + (process.env.K_START || '0900') + '-after-tab')
const s1 = await snapAll(p)
await p.keyboard.type(process.env.K_TYPE || 'X', { delay: 30 }); await K.sleep(300)
const f2 = await focusD(p)
await p.keyboard.press('Tab'); await K.sleep(300)
const fT1 = await focusD(p)
await p.keyboard.press('Tab'); await K.sleep(300)
const fT2 = await focusD(p)
const pc2 = await K.pic(p, 'L14-' + (process.env.K_START || '0900') + '-after-X-and-two-tabs')
const s2 = await snapAll(p)
const stillWin = await K.winOpen(p, 'oilconf')
const diffs = []
if (s2.d !== s1.d) diffs.push('the schedule days changed')
if (s2.i !== s1.i) diffs.push('requests changed')
const strNow = await p.evaluate(s => document.querySelector(s) && document.querySelector(s).innerText, STR)
const inpNow = await p.evaluate(i => { const x = window.INPUTS.find(r => r.iid === i); return x && JSON.stringify({ str: x.str, end: x.end, rmks: x.remarks }) }, iid)
// stray X anywhere in the page text boxes?
const reqNow = await p.evaluate(i => JSON.stringify(window.INPUTS.find(r => r.iid === i)), iid)
const endBox = await p.evaluate(i => { const e = document.querySelector('[data-inp="' + i + '.end"]'); return e && e.innerText }, iid)
const strayX = await p.evaluate(() => [...document.querySelectorAll('[data-txt],[data-inp],[data-bfld]')].filter(e => /X$/.test((e.innerText || e.value || '').trim()) && (e.innerText || e.value).trim().length < 12).map(e => (e.dataset.txt || e.dataset.inp || e.dataset.bfld) + '=' + (e.innerText || e.value).trim()).slice(0, 6))
K.note('L-14', 'tab-start-' + (process.env.K_START || '0900') + '-type-' + (process.env.K_TYPE || 'X'), `Duty (Ace, Sat 18 Jul, was ${inp}) filed through Inputs, OIL asked Yes; Edit Schedule Sat, Personal Inputs: start-time box (was ${strBefore}) clicked, typed ${process.env.K_START || '0900'}, Tab; then typed ${process.env.K_TYPE || 'X'}, Tab, Tab`,
  `after the first Tab: OIL window ${win ? 'OPEN: ' + win : 'did not open'}; focus: ${f1}; after typing X: focus ${f2}; Tab -> ${fT1}; Tab -> ${fT2}; window still open: ${stillWin}; behind the window: ${diffs.length ? diffs.join(', ') : 'schedule days and requests unchanged since the first Tab'}; start-time box now "${strNow}", stored ${inpNow}; the request afterwards: ${reqNow}; the end-time box now reads "${endBox}"; edit-history rows ${s0.elog}->${s1.elog}->${s2.elog}; boxes ending in X on the page: ${JSON.stringify(strayX)}`,
  win ? ((process.env.K_TYPE ? (/15:00|1500/.test(f2)) : /X/.test(f2)) ? 'FAIL' : 'PASS') : 'NOT WALKED (window did not open)', [pc1, pc2])
console.log('errors', K.errList(errors))
K.flush()
await browser.close()
