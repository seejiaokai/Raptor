/* R-03 — a save that opens a window: where do the keys go? (a) week + Tab, (b) board + Tab, (c) week + click away.
   Each part in its own fresh world. Everything by the app's own controls; window.* only read. */
import * as K from './stk2-N-klib.mjs'
const { L, W, H } = K
const PARTS = (process.env.R_PARTS || 'a,b,c').split(',')

const focusD = p => p.evaluate(() => {
  const a = document.activeElement
  if (!a || a === document.body) return { txt: 'BODY (nothing focused)', inWin: false }
  const w = a.closest('[data-testid]')
  const r = a.getBoundingClientRect()
  return { txt: `${a.tagName.toLowerCase()} ${a.dataset.inp || a.dataset.ifld || a.dataset.txt || a.dataset.bfld || a.id || ''} "${(a.innerText || a.value || '').toString().replace(/\s+/g, ' ').trim().slice(0, 30)}"`, inWin: !!w, win: w ? w.dataset.testid : null, at: [Math.round(r.left), Math.round(r.top)] }
})
const snap = p => p.evaluate(() => ({ d: JSON.stringify(window.DAYS), i: JSON.stringify(window.INPUTS), elog: window.ELOG.rows.length, cmds: window.commandStreamLen() }))
async function clickBox(p, sel) {
  const el = p.locator(sel).first()
  await el.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await K.sleep(250)
  const b = await el.boundingBox()
  await p.mouse.click(b.x + b.width / 2, b.y + b.height / 2); await K.sleep(250)
}
async function clickEmpty(p) {
  const pt = await p.evaluate(() => {
    for (const [x, y] of [[8, 450], [1430, 450], [8, 300], [1430, 600], [700, 880]]) {
      const e = document.elementFromPoint(x, y)
      if (e && !e.closest('[contenteditable],input,select,button,a,[data-txt],[data-inp],textarea')) return [x, y]
    }
    return null
  })
  await p.mouse.click(pt[0], pt[1]); await K.sleep(500)
}
const winInfo = p => p.evaluate(() => {
  const w = [...document.querySelectorAll('[data-testid="oilconf"]')].find(e => e.getBoundingClientRect().width > 0)
  if (!w) return null
  return { head: (w.querySelector('.airpop-head') || w).innerText.replace(/\s+/g, ' ').trim().slice(0, 80), body: (w.querySelector('.airpop-body') || w).innerText.replace(/\s+/g, ' ').trim().slice(0, 200), buttons: [...w.querySelectorAll('button')].map(b => (b.innerText || b.getAttribute('aria-label') || '').trim().slice(0, 14)) }
})
const reqNow = (p, iid) => p.evaluate(i => { const x = window.INPUTS.find(r => r.iid === i); return x ? { s: x.s, e: x.e, rmks: x.remarks, oil: x.oil } : null }, iid)
const notTime = p => p.evaluate(() => /is not a time/i.test(document.body.innerText) || /not a time/i.test((document.getElementById('toastEl') || {}).innerText || ''))

for (const part of PARTS) {
  const { browser, p, errors } = await H.world({ who: 'a', phone: false })
  try {
    await W.toastSpy(p)
    const o = await K.fileOpen(p, { person: 'Ranger', type: 'Duty', iso: '2026-07-18', from: process.env.R_FROM || '08:00', to: process.env.R_TO || '12:00', remarks: 'R03 duty' })
    const asked0 = await K.answerAsks(p, { oil: process.env.R_OIL || 'Yes' })
    const iid = await K.newIid(p, o.before)
    await L.go(p, 'editsched'); await p.waitForSelector('#eWeek .day[data-day="5"]'); await L.sleep(700)
    let STR, boardUsed = false
    if (part === 'b') {
      await W.boardOn(p, 5); await L.sleep(800)
      const pt = p.locator('#schedBoard [data-pitog="5"]').first()
      if (!(await p.locator(`#schedBoard [data-ifld="${iid}.str"]`).count())) { await pt.evaluate(e => e.scrollIntoView({ block: 'center' })); await pt.click(); await K.sleep(500) }
      STR = `#schedBoard [data-ifld="${iid}.str"]`; boardUsed = true
    } else {
      const hd = p.locator('#eWeek .day[data-day="5"] [data-pitog="5"]').first()
      await hd.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' }))
      if (!(await p.locator(`#eWeek [data-inp="${iid}.str"]`).count())) { await hd.click(); await K.sleep(500) }
      STR = `#eWeek [data-inp="${iid}.str"]`
    }
    const r0 = await reqNow(p, iid)
    const s0 = await snap(p)
    const pc0 = await K.pic(p, `R03${part}${process.env.R_TAG || ""}-0-before`)
    await clickBox(p, STR)
    await p.keyboard.press('Control+A'); await p.keyboard.type(process.env.R_START || '0900', { delay: 20 })
    if (part === 'c') await clickEmpty(p); else await p.keyboard.press('Tab')
    await K.sleep(900)
    const w1 = await winInfo(p)
    const f1 = await focusD(p)
    const r1 = await reqNow(p, iid)
    const s1 = await snap(p)
    const pc1 = await K.pic(p, `R03${part}${process.env.R_TAG || ""}-1-window`)
    await p.keyboard.type('XYZ', { delay: 40 }); await K.sleep(400)
    const f2 = await focusD(p)
    const fT = []
    for (let i = 0; i < 2; i++) { await p.keyboard.press('Tab'); await K.sleep(300); fT.push(await focusD(p)) }
    const toastsNow = await W.toasts(p)
    const s2 = await snap(p)
    const r2 = await reqNow(p, iid)
    const nt = await notTime(p)
    const stillWin = await winInfo(p)
    const pc2 = await K.pic(p, `R03${part}${process.env.R_TAG || ""}-2-after-XYZ-and-tabs`)
    const diffs = []
    if (s2.d !== s1.d) diffs.push('schedule days changed after the window opened')
    if (s2.i !== s1.i) diffs.push('requests changed after the window opened')
    const stray = await p.evaluate(() => [...document.querySelectorAll('[data-txt],[data-inp],[data-bfld],[data-ifld]')].filter(e => /XYZ|X|Y|Z/.test((e.innerText || e.value || '')) && (e.innerText || e.value).trim().length < 14 && /^[XYZ]+$|XYZ/.test((e.innerText || e.value).trim())).map(e => (e.dataset.txt || e.dataset.inp || e.dataset.bfld || e.dataset.ifld) + '=' + (e.innerText || e.value).trim()).slice(0, 6))
    // close with the window's own ✕
    let closed = null
    const xb = p.locator('[data-testid="oilconf"]:visible button', { hasText: '✕' }).first()
    if (await xb.count()) { await xb.click(); await K.sleep(600); closed = !(await winInfo(p)) }
    const s3 = await snap(p), r3 = await reqNow(p, iid)
    const pc3 = await K.pic(p, `R03${part}${process.env.R_TAG || ""}-3-after-close`)
    const ok = !!w1 && w1 && f1.inWin && !stray.length && !diffs.length && !nt && r1.s !== r0.s && r3.s === r1.s && s3.d === s1.d
    K.note('R-03', part + (process.env.R_TAG || ''), `${part === 'a' ? 'Edit Schedule Sat, Personal Inputs, START box clicked, ' + (process.env.R_START || '0900') + ' typed, Tab' : part === 'b' ? 'Scheduler Board Sat, Personal Inputs, START box clicked, 0900 typed, Tab' : 'Edit Schedule Sat, START box typed 0900, CLICK on empty page'}; then typed XYZ, Tab, Tab; then the window's own ✕. Request: Ranger Duty Sat 18 Jul ${process.env.R_FROM || '08:00'}-${process.env.R_TO || '12:00'} (OIL asked ${JSON.stringify(asked0)})`,
      `request before s=${r0.s} e=${r0.e}; after the save: s=${r1.s} e=${r1.e}; OIL window ${w1 ? 'OPEN: ' + JSON.stringify(w1) : 'did not open'}; caret after ${part === 'c' ? 'the click' : 'the Tab'}: ${JSON.stringify(f1)}; after typing XYZ: ${JSON.stringify(f2)}; Tab -> ${JSON.stringify(fT[0])}; Tab -> ${JSON.stringify(fT[1])}; window still open after those: ${!!stillWin}; behind the window: ${diffs.join(', ') || 'days and requests unchanged since the window opened'}; boxes holding X/Y/Z: ${JSON.stringify(stray)}; "not a time" shown: ${nt}; toasts: ${JSON.stringify(toastsNow)}; request after the keys s=${r2.s} e=${r2.e}; after ✕: window ${closed === null ? 'no ✕ found' : closed ? 'closed' : 'still open'}, request s=${r3.s} e=${r3.e}, days equal to start: ${s3.d === s0.d}, requests changed vs start: ${s3.i !== s0.i}; edit-history rows ${s0.elog}->${s1.elog}->${s3.elog}`,
      !w1 ? 'NOT WALKED (window did not open)' : ok ? 'PASS' : 'FAIL', [pc0, pc1, pc2, pc3])
  } catch (e) { K.note('R-03', part + (process.env.R_TAG || ''), 'walk', 'ERROR ' + String(e.stack).split('\n').slice(0, 3).join(' <- '), 'NOT WALKED', []); await K.pic(p, `R03${part}${process.env.R_TAG || ""}-error`) }
  console.log('errors', part, K.errList(errors))
  await browser.close()
}
K.flush()
