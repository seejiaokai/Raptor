/* R-04 — the day keeps up while he tabs. (a) desktop week, (b) Escape + Undo, (c) the Scheduler Board, (d) phone week,
   (e) a published day. Each part in a fresh world. Everything by the app's own controls; window.* only read. */
import * as K from './stk2-N-klib.mjs'
const { L, W, H } = K
const PARTS = (process.env.R_PARTS || 'a,c,d,e').split(',')
const TY = '[data-txt],[data-bfld],[data-inp],[data-ifld],[data-itline],[data-bombs],[data-area],[data-atime]'
const focusD = p => p.evaluate(() => {
  const a = document.activeElement
  if (!a || a === document.body) return { id: 'BODY', top: null, text: '' }
  const r = a.getBoundingClientRect()
  return { id: a.dataset.itline ? 'itline ' + a.dataset.itline : (a.dataset.txt || a.dataset.bfld || a.dataset.inp || a.dataset.ifld || a.dataset.atime || a.dataset.area || a.dataset.bombs || a.tagName), top: Math.round(r.top * 10) / 10, left: Math.round(r.left), text: (a.innerText || a.value || '').replace(/\s+/g, ' ').trim().slice(0, 60), sy: Math.round(scrollY) }
})
async function clickBox(p, sel) {
  const el = p.locator(sel).first()
  await el.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await K.sleep(250)
  const b = await el.boundingBox()
  await p.mouse.click(b.x + 12, b.y + Math.min(b.height / 2, 10)); await K.sleep(250)
}
const listWeek = async (p, di, surf = '#eWeek') => { const l = await H.readList(p, surf, di); return { bar: l.bar, lines: (l.lines || []).map(x => x.sev + ': ' + x.text) } }
const listBoard = async p => { const b = await H.readBoard(p); return { bar: b.head, lines: (b.lines || []).map(x => x.text) } }
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b)
const mentionsIT = l => l.lines.filter(x => /in-time|brief|later/i.test(x))

async function runEdit(partName, phone, where) {
  const { browser, p, errors } = await H.world({ who: 'a', phone })
  try {
    await W.toastSpy(p)
    await L.go(p, 'editsched'); await p.waitForSelector('#eWeek .day[data-day="0"]'); await L.sleep(800)
    const f = await p.evaluate(() => { const f0 = window.DAYS[0].waves[0].formations[0]; return { to: f0.to, cs: f0.cs } })
    const text = `${f.to}H: ${f.cs} IN TIME`
    let readList, ITSEL
    if (where === 'board') {
      await W.boardOn(p, 0); await L.sleep(800)
      await H.boardOpenFold(p)
      readList = () => listBoard(p)
      ITSEL = await p.evaluate(() => { const e = document.querySelector('#schedBoard [data-itline], #schedBoard [data-bfld^="it:"]'); return e ? (e.dataset.itline ? `#schedBoard [data-itline="${e.dataset.itline}"]` : `#schedBoard [data-bfld="${e.dataset.bfld}"]`) : null })
    } else {
      await H.openList(p, '#eWeek', 0)
      readList = () => listWeek(p, 0)
      ITSEL = '#eWeek [data-itline="0|0|0"]'
    }
    if (!ITSEL) throw new Error('no in-time line found on the ' + where)
    const start = await readList()
    const pc0 = await K.pic(p, `R04${partName}-0-start`)
    await clickBox(p, ITSEL)
    await p.keyboard.press('Control+A'); await p.keyboard.type(text, { delay: 12 })
    const itTop0 = await p.evaluate(s => { const e = document.querySelector(s); return e ? Math.round(e.getBoundingClientRect().top * 10) / 10 : null }, ITSEL)
    await p.keyboard.press('Tab'); await K.sleep(350)
    const itTop1 = await p.evaluate(s => { const e = document.querySelector(s); return e ? Math.round(e.getBoundingClientRect().top * 10) / 10 : null }, ITSEL)
    const aft1 = await readList(), f1 = await focusD(p)
    const pc1 = await K.pic(p, `R04${partName}-1-after-one-tab`)
    // three more Tabs, nothing changed; the box just left must not move, the list must not change again
    const more = []; let prev = f1, maxMove = 0, listsSame = true
    for (let i = 0; i < 3; i++) {
      await p.evaluate(() => { document.querySelectorAll('[data-r04prev]').forEach(x => x.removeAttribute('data-r04prev')); if (document.activeElement && document.activeElement !== document.body) document.activeElement.setAttribute('data-r04prev', '1') })
      const t0 = await p.evaluate(() => { const e = document.querySelector('[data-r04prev]'); return e ? e.getBoundingClientRect().top : null })
      await p.keyboard.press('Tab'); await K.sleep(300)
      const t1 = await p.evaluate(() => { const e = document.querySelector('[data-r04prev]'); return e ? e.getBoundingClientRect().top : null })
      const now = await focusD(p), l = await readList()
      if (t0 != null && t1 != null) maxMove = Math.max(maxMove, Math.abs(t1 - t0))
      more.push({ id: now.id, top: now.top, sy: now.sy })
      if (!same(l, aft1)) listsSame = false
      prev = now
    }
    // measure movement properly: re-focus-free comparison of page scroll between the stops
    const sys = [f1.sy, ...more.map(m => m.sy)]
    const dsy = Math.max(...sys) - Math.min(...sys)
    // type Q into the box that has the caret
    const fq0 = await focusD(p)
    await p.keyboard.type('Q', { delay: 30 }); await K.sleep(200)
    const fq1 = await focusD(p)
    const readback = await p.evaluate(() => { const a = document.activeElement; return a ? (a.innerText || a.value || '') : '' })
    const pc2 = await K.pic(p, `R04${partName}-2-after-Q`)
    // (b) Escape, then Undo from the top bar until the bar and list are as at the start (max 4 presses)
    await p.keyboard.press('Escape'); await K.sleep(400)
    const afterEsc = await readList()
    let presses = 0, back = null
    for (; presses < 4; presses++) {
      back = await readList()
      if (same(back, start)) break
      await W.door(p, where === 'board' ? 'board' : 'top', 'undo'); await K.sleep(500)
    }
    back = await readList()
    const pc3 = await K.pic(p, `R04${partName}-3-after-undo`)
    const newLine = mentionsIT(aft1).filter(x => !start.lines.includes(x))
    const barRose = aft1.bar !== start.bar
    const ok1 = barRose && newLine.length > 0
    const okQ = /Q/.test(readback)
    const okJ = dsy <= 2 && maxMove <= 2 && Math.abs((itTop1 ?? 0) - (itTop0 ?? 0)) <= 2 && listsSame
    const okU = same(back, start)
    K.note('R-04', partName, `${where === 'board' ? 'Scheduler Board' : (phone ? 'phone week (390)' : 'Edit Schedule week')}, Monday, issues list open: clicked the first In-time / Rally line, replaced with "${text}", Tab ONCE, read the list at once; then Tab x3 changing nothing; typed Q; Escape; Undo from the ${where === 'board' ? "board's door" : 'top bar'}`,
      `start: bar "${start.bar}" (${start.lines.length} lines); straight after the one Tab (caret ${f1.id} "${f1.text}" at top ${f1.top}): bar "${aft1.bar}" (${aft1.lines.length} lines), new in-time/brief lines: ${JSON.stringify(newLine)}; next three Tabs reached ${more.map(m => m.id + '@' + m.top).join(', ')}, page scroll ${sys.join('/')} (range ${dsy}px), the box left moved at most ${Math.round(maxMove * 10) / 10}px on the next three Tabs, the typed in-time line's top ${itTop0}->${itTop1} on the first Tab, list unchanged by them: ${listsSame}; typed Q into ${fq0.id}: read back "${readback.slice(0, 60)}" (caret still on ${fq1.id}); after Escape: bar "${afterEsc.bar}"; after ${presses} Undo press(es): bar "${back.bar}", list equal to the start: ${okU}`,
      ok1 && okQ && okJ && okU ? 'PASS' : 'FAIL', [pc0, pc1, pc2, pc3])
  } catch (e) { K.note('R-04', partName, 'walk', 'ERROR ' + String(e.stack).split('\n').slice(0, 3).join(' <- '), 'NOT WALKED', []); await K.pic(p, `R04${partName}-error`) }
  console.log('errors', partName, K.errList(errors)); await browser.close()
}

for (const part of PARTS) {
  if (part === 'a') await runEdit('a-week-desktop', false, 'week')
  if (part === 'c') await runEdit('c-board-desktop', false, 'board')
  if (part === 'd') await runEdit('d-week-phone', true, 'week')
  if (part === 'e') {
    const { browser, p, errors } = await H.world({ who: 'a', phone: false })
    try {
      await W.toastSpy(p)
      await L.go(p, 'editsched'); await p.waitForSelector('#eWeek .day[data-day="1"]'); await L.sleep(800)
      const signs = await W.signDay(p, 1); const pub = await W.publishDay(p, 1); await L.sleep(900)
      const h0 = await W.head(p, 1)
      const pc0 = await K.pic(p, 'R04e-0-published')
      const RM = '#eWeek [data-txt="fr:1.0.0.0"]'
      const old = await p.evaluate(s => { const e = document.querySelector(s); return e ? e.innerText : null }, RM)
      await clickBox(p, RM)
      await p.keyboard.press('End'); await p.keyboard.type(' walkword', { delay: 15 })
      await p.keyboard.press('Tab'); await K.sleep(400)
      const f = await focusD(p)
      const h1 = await W.head(p, 1)
      const pc1 = await K.pic(p, 'R04e-1-after-one-tab')
      const inText = f.id !== 'BODY'
      const pend = /^1 pending/.test(h1.pending), nys = /not yet signed/i.test(h1.nys || '') || /not yet signed/i.test(h1.signed || '')
      const empties = (h1.signs || []).length === 4 && h1.signs.every(s => /name/i.test(s))
      K.note('R-04', 'e-published', `Edit Schedule, Tuesday: signed four names, Publish day; then clicked Remarks of the first flying line ("${old}"), typed " walkword", Tab once; read the day's heading without leaving the text boxes`,
        `after publish: ${JSON.stringify({ tag: h0.tag, pending: h0.pending, signed: h0.signed })}; straight after the Tab (caret ${f.id}): pending "${h1.pending}", Not-yet-signed "${h1.nys}", sign line "${h1.signed}", sign selects ${JSON.stringify(h1.signs)}, Publish AL button "${h1.alpub}"`,
        inText && pend && nys && empties ? 'PASS' : 'FAIL', [pc0, pc1])
    } catch (e) { K.note('R-04', 'e-published', 'walk', 'ERROR ' + String(e.stack).split('\n').slice(0, 3).join(' <- '), 'NOT WALKED', []) }
    console.log('errors e', K.errList(errors)); await browser.close()
  }
}
K.flush()
