// r4wf — N1(a), N3: the 60-letter note from the week's take-off box, measured; each line asserts the RIGHT behaviour.
// Run: WR4_OUT=docs/img/handpass/2026-11-25-r4-walk-faults/<run> WR4_NEW=<build> node scripts/handpass/r4wf-note.mjs
import * as L from './wr4-lib.mjs'
const { newPage, signIn, go, sleep, bundleOf, log, catchToast, releaseToast, finish, facts, SIZES } = L
const LONG = 'abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyz01234567'
SIZES.p320 = { viewport: { width: 320, height: 700 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true }
SIZES.w621 = { viewport: { width: 621, height: 900 }, deviceScaleFactor: 1 }
SIZES.w768 = { viewport: { width: 768, height: 1000 }, deviceScaleFactor: 1 }
SIZES.w900 = { viewport: { width: 900, height: 900 }, deviceScaleFactor: 1 }
SIZES.side = { viewport: { width: 874, height: 402 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true }
const inkOf = page => page.evaluate(() => {
  const t = document.getElementById('toastEl'); if (!t) return null
  const r = document.createRange(); r.selectNodeContents(t); const rs = [...r.getClientRects()].filter(x => x.width > 0)
  const box = t.getBoundingClientRect(); const cs = getComputedStyle(t)
  const inR = box.right - parseFloat(cs.paddingRight) - parseFloat(cs.borderRightWidth)
  const lines = new Set(rs.map(x => Math.round(x.top))).size
  return { box: { l: Math.round(box.left), r: Math.round(box.right), w: Math.round(box.width), h: Math.round(box.height), top: Math.round(box.top) }, innerR: Math.round(inR), inkR: Math.round(Math.max(...rs.map(x => x.right))), inkL: Math.round(Math.min(...rs.map(x => x.left))), lines, vw: innerWidth, vh: innerHeight, bg: cs.backgroundColor }
})
const res = []
async function one(size, engine) {
  const tag = `${size}-${engine}`
  let w
  try {
    w = await newPage(size, undefined, L.NEW_DIR, engine); await signIn(w, 'ad'); log(tag, 'bundle ' + await bundleOf(w.page))
    await go(w.page, 'editsched'); await w.page.evaluate(() => scrollTo(0, 0))
    const key = await w.page.evaluate(() => { const e = [...document.querySelectorAll('#eWeek [data-txt^="ff:"][data-txt$=".to"]')].find(x => x.getBoundingClientRect().width > 4); if (!e) return null; e.scrollIntoView({ block: 'center' }); return e.getAttribute('data-txt') })
    if (!key) { res.push([tag, 'NOT WALKED', 'no take-off box']); return }
    const el = w.page.locator(`#eWeek [data-txt="${key}"]`).first()
    const before = (await el.innerText().catch(() => '')) || await el.inputValue().catch(() => '')
    if (w.tap) await el.tap(); else await el.click(); await sleep(300)
    await w.page.keyboard.press('Control+A'); await w.page.keyboard.type(LONG); await w.page.keyboard.press('Tab')
    const t = await catchToast(w.page, /not a time/, 4000)
    const m = await inkOf(w.page)
    const after = (await el.innerText().catch(() => '')) || await el.inputValue().catch(() => '')
    await w.page.screenshot({ path: `${process.env.WR4_OUT}/n-${tag}.png` })
    await releaseToast(w.page)
    const inside = m && m.inkR <= m.innerR + 1 && m.inkL >= m.box.l && m.box.r <= m.vw && m.box.l >= 0
    res.push([tag, inside ? 'PASS' : 'FAIL', JSON.stringify({ text: (t || '').slice(0, 40), ...m, boxBefore: before.trim(), boxAfter: after.trim() }), `n-${tag}.png`])
  } catch (e) { res.push([tag, 'ERROR', e.message.split('\n')[0].slice(0, 160)]) }
  finally { if (w) await w.ctx.close() }
}
for (const [s, e] of [['phone', 'chromium'], ['phone', 'webkit'], ['p320', 'chromium'], ['p320', 'webkit'], ['w621', 'chromium'], ['w768', 'chromium'], ['w900', 'chromium'], ['side', 'webkit'], ['desk', 'chromium']]) await one(s, e)
for (const r of res) console.log('RESULT', r.join(' | '))
facts.results = res
await finish()
console.log('errors:', facts.errors.length, facts.errors.slice(0, 6))
