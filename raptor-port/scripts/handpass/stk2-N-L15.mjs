import * as K from './stk2-N-klib.mjs'
const { L, W, H } = K
const size = process.env.K_SIZE || 'desk', phone = size === 'phone'
const TYPING = '[data-txt],[data-bfld],[data-inp],[data-ifld],[data-itline],[data-bombs],[data-area],[data-atime]'
const { browser, p, errors } = await H.world({ who: 'a', phone })
await L.go(p, 'editsched'); await p.waitForSelector('#eWeek .day[data-day="0"]'); await L.sleep(800)
const vp = p.viewportSize()
const CS = 'ff:0.0.0.cs', RM = 'fr:0.0.0.0'
const LONGCS = 'VIPERLEADERWRAPTEST', LONGRM = '1B: BFM-6 with a very long remark so that it has to wrap over two lines on the week'
async function clickSel(sel) {
  const el = p.locator(sel).first()
  await el.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await K.sleep(250)
  const b = await el.boundingBox()
  await p.mouse.click(b.x + b.width / 2, b.y + b.height / 2); await K.sleep(250)
  return b
}
// type the long texts (a real click, select all, type, then Tab away — the way a person does)
for (const [k, v] of [[CS, LONGCS], [RM, LONGRM]]) {
  await clickSel(`#eWeek [data-txt="${k}"]`)
  await p.keyboard.press('Control+A'); await p.keyboard.type(v, { delay: 6 })
  await p.keyboard.press('Tab'); await K.sleep(500)
  await p.evaluate(() => document.activeElement && document.activeElement.blur()); await K.sleep(300)
}
const box = sel => p.evaluate(s => { const e = document.querySelector(s); if (!e) return null; const r = e.getBoundingClientRect(); const cs = getComputedStyle(e); const lh = parseFloat(cs.lineHeight) || parseFloat(cs.fontSize) * 1.2; return { text: e.innerText.trim(), x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height), lines: Math.round(r.height / lh * 10) / 10, wraps: r.height > lh * 1.5 } }, sel)
const scrolls = (sel) => p.evaluate(s => {
  const out = { page: [Math.round(scrollX), Math.round(scrollY)], anc: [] }
  for (let e = document.querySelector(s); e && e !== document.documentElement; e = e.parentElement) {
    const cs = getComputedStyle(e)
    if ((e.scrollWidth > e.clientWidth + 1 && /auto|scroll/.test(cs.overflowX)) || (e.scrollHeight > e.clientHeight + 1 && /auto|scroll/.test(cs.overflowY))) out.anc.push((e.id ? '#' + e.id : '') + '.' + String(e.className).split(' ')[0] + ' [' + Math.round(e.scrollLeft) + ',' + Math.round(e.scrollTop) + ']')
  }
  return out
}, sel)
const prevOf = async (key) => p.evaluate(([k, TY]) => {
  const day = document.querySelector('#eWeek .day[data-day="0"]')
  const l = [...day.querySelectorAll(TY)].filter(e => e.offsetParent !== null && ((e instanceof HTMLInputElement || e instanceof HTMLTextAreaElement) ? !e.disabled && !e.readOnly : e.getAttribute('contenteditable') === 'true'))
  const i = l.findIndex(e => e.dataset.txt === k)
  const pr = l[i - 1]
  document.querySelectorAll('[data-k15]').forEach(x => x.removeAttribute('data-k15'))
  pr.setAttribute('data-k15', '1')
  return pr.dataset.txt || pr.dataset.inp || pr.dataset.atime || pr.tagName
}, [key, TYPING])
for (const [label, key] of [['callsign', CS], ['remarks', RM]]) {
  const sel = `#eWeek [data-txt="${key}"]`
  const bx = await box(sel)
  const prevKey = await prevOf(key)
  // bring the box before it into plain view and press on it for real; the target box is then in view too
  await clickSel('[data-k15="1"]')
  const before = { sc: await scrolls(sel), prev: await box('[data-k15="1"]'), tgt: await box(sel) }
  const inView = before.tgt && before.tgt.y >= 0 && before.tgt.y + before.tgt.h <= vp.height && before.tgt.x >= 0 && before.tgt.x + before.tgt.w <= vp.width
  const pc0 = await K.pic(p, `L15-${size}-${label}-before`)
  await p.keyboard.press('Tab'); await K.sleep(500)
  const after = { sc: await scrolls(sel), tgt: await box(sel), focus: await p.evaluate(() => { const a = document.activeElement; return a ? (a.dataset.txt || a.tagName) : null }) }
  const pc1 = await K.pic(p, `L15-${size}-${label}-after`)
  const dpage = [after.sc.page[0] - before.sc.page[0], after.sc.page[1] - before.sc.page[1]]
  const dtgt = [after.tgt.x - before.tgt.x, after.tgt.y - before.tgt.y]
  K.note('L-15', `${label}-${size}`, `Edit Schedule Mon at ${vp.width}x${vp.height}: formation 0.0.0 ${label} typed long (${label === 'callsign' ? LONGCS : LONGRM.slice(0, 30) + '...'}); real click on the box before it (${prevKey}), then Tab into the ${label} box`,
    `target box: ${JSON.stringify(bx)} (wraps: ${bx && bx.wraps}, ${bx && bx.lines} lines); in plain view before Tab: ${inView}; before Tab: page scroll ${JSON.stringify(before.sc.page)}, scrolling parents ${JSON.stringify(before.sc.anc)}, target box at (${before.tgt.x},${before.tgt.y}) ${before.tgt.w}x${before.tgt.h}; after Tab: focus on ${after.focus}, page scroll ${JSON.stringify(after.sc.page)}, scrolling parents ${JSON.stringify(after.sc.anc)}, target box at (${after.tgt.x},${after.tgt.y}); page scroll moved by ${JSON.stringify(dpage)}, box moved on screen by ${JSON.stringify(dtgt)}`,
    'RECORD', [pc0, pc1])
}
console.log('errors', K.errList(errors))
K.flush()
await browser.close()
