// r4wf W1 (core, steps 1-4 and 6/10) — an input's Personal Inputs time typed on the Board, Tab: the Board's Ground
// Programme row must read the saved time AT ONCE, the caret still on the Board. Each check asserts the RIGHT behaviour.
import * as L from './wr4-lib.mjs'
const { newPage, signIn, go, sleep, bundleOf, log, finish, facts } = L
const res = []
const J = JSON.stringify
async function run(size, engine) {
  const tag = `${size}-${engine}`
  const w = await newPage(size, undefined, L.NEW_DIR, engine); await signIn(w, 'ad'); log(tag, 'bundle ' + await bundleOf(w.page))
  const p = w.page
  try {
    const iid = await L.fileInput(w, tag, L.WED, { type: 'Training', people: [L.RANGER], from: '08:00', to: '10:00', title: 'Range brief' })
    await go(p, 'editsched')
    await p.evaluate(() => window.openScheduler(2)); await sleep(800)   // Wed 15 Jul, reached by openScheduler(2)
    const pin = p.locator('#schedBoard .sb-panel.pinp')
    const ph = pin.locator('.sb-ph, h3, .sb-head').first()
    if (!(await p.locator(`#schedBoard [data-ifld="${iid}.str"]`).isVisible().catch(() => false)) && await ph.count()) { await (w.tap ? ph.tap() : ph.click()).catch(() => {}); await sleep(400) }
    const ground = () => p.evaluate(() => {
      const rows = [...document.querySelectorAll('#schedBoard .sb-panel:not(.pinp) .sb-arow, #schedBoard .sb-panel:not(.pinp) tr')].filter(r => /Range brief/i.test(r.textContent + [...r.querySelectorAll('input')].map(i => i.value).join(' ')) && r.getBoundingClientRect().height > 0 && !r.querySelector('.sb-arow, tr'))
      return rows.map(r => [...r.querySelectorAll('input')].map(i => i.value).join(' ') + ' | ' + r.textContent.replace(/\s+/g, ' ').trim().slice(0, 60))
    })
    const pinRow = () => p.evaluate(id => ['str', 'end', 'rmks'].map(f => document.querySelector(`#schedBoard [data-ifld="${id}.${f}"]`)?.value), iid)
    const focus = () => p.evaluate(() => { const a = document.activeElement; return (a?.getAttribute('data-ifld') || a?.getAttribute('data-txt') || a?.tagName) + ' onBoard=' + !!a?.closest('#schedBoard') })
    const steps = [['str', '0900', '09:00'], ['str', '0800', '08:00'], ['end', '1130', '11:30'], ['rmks', 'bring kit', 'bring kit']]
    let n = 0
    for (const [f, v, want] of steps) {
      n++
      const box = p.locator(`#schedBoard [data-ifld="${iid}.${f}"]`).first()
      await box.scrollIntoViewIfNeeded(); if (w.tap) await box.tap(); else await box.click(); await sleep(200)
      await p.keyboard.press('Control+A'); await p.keyboard.type(v); await p.keyboard.press('Tab'); await sleep(450)
      const g = await ground(), pr = await pinRow(), fo = await focus(), rec = await L.recOf(p, iid)
      await p.screenshot({ path: `${process.env.WR4_OUT}/w1-${tag}-step${n}.png` })
      const ok = g.length > 0 && g.every(s => s.includes(want)) && fo.includes('onBoard=true')
      res.push([`W1 ${tag} step${n} ${f}=${v}`, ok ? 'PASS' : 'FAIL', `ground ${J(g)}; pinp ${J(pr)}; focus ${fo}; stored s=${rec.s} e=${rec.e} rmk=${J(rec.remarks)}`, `w1-${tag}-step${n}.png`])
    }
    await p.mouse.click(5, 5); await sleep(400)
    res.push([`W1 ${tag} after caret leaves`, 'RECORD', `ground ${J(await ground())}; pinp ${J(await pinRow())}`, ''])
    await p.reload(); await p.waitForSelector('#vWeek .day, #luser', { state: 'attached' }); await sleep(800)
    const r2 = await L.recOf(p, iid).catch(() => null)
    res.push([`W1 ${tag} after reload stored`, r2 && r2.s === 480 && r2.e === 690 && r2.remarks === 'bring kit' ? 'PASS' : 'FAIL', J(r2), ''])
  } catch (e) { res.push([`W1 ${tag}`, 'ERROR', e.message.split('\n')[0].slice(0, 200)]) }
  await w.ctx.close()
}
await run('desk', 'chromium')
await run('phone', 'webkit')
for (const r of res) console.log('RESULT', r.join(' | '))
facts.results = res
await finish()
console.log('errors:', facts.errors.length, facts.errors.slice(0, 6))
