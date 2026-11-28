// r4wf W4 / W5(a) / W7 — with the caret in a Board box, press a control; every section must appear exactly once.
import * as L from './wr4-lib.mjs'
const { newPage, signIn, go, sleep, bundleOf, log, finish, facts } = L
const res = []; const J = JSON.stringify
const secs = p => p.evaluate(() => {
  const s = [...document.querySelectorAll('#schedBoard .sb-panel, #schedBoard .sb-sec')].filter(e => !e.parentElement.closest('.sb-panel, .sb-sec') && e.getBoundingClientRect().height > 0).map(e => (e.innerText || '').trim().split('\n')[0].trim().toUpperCase().slice(0, 24))
  const c = {}; s.forEach(k => c[k] = (c[k] || 0) + 1)
  return { order: s, doubled: Object.keys(c).filter(k => c[k] > 1), title: (document.querySelector('#schedBoard h1, #schedBoard .sb-title, #schedBoard [class*=title]')?.textContent || '').replace(/\s+/g, ' ').slice(0, 40), act: (document.activeElement?.getAttribute('data-ifld') || document.activeElement?.tagName) }
})
async function snap(w, tag, name) { const f = `${tag}-${name}.png`; await w.page.screenshot({ path: `${process.env.WR4_OUT}/${f}` }); return f }
async function caretIn(w, iid) {
  if (!(await w.page.locator(`#schedBoard [data-ifld="${iid}.str"]`).first().isVisible().catch(() => false))) { const h = w.page.locator('#schedBoard .pinp').getByText(/Personal Inputs/i).first(); if (w.tap) await h.tap(); else await h.click(); await sleep(500) }
  const b = w.page.locator(`#schedBoard [data-ifld="${iid}.str"]`).first(); await b.scrollIntoViewIfNeeded(); if (w.tap) await b.tap(); else await b.click(); await sleep(250) }
async function tapCtl(w, loc) { const l = loc.first(); if (w.tap) await l.tap({ timeout: 4000 }); else await l.click({ timeout: 4000 }) }
async function run(size, engine) {
  const tag = `${size}-${engine}`
  const w = await newPage(size, undefined, L.NEW_DIR, engine); await signIn(w, 'ad'); log(tag, 'bundle ' + await bundleOf(w.page))
  const p = w.page
  const base = async (di, iso) => { await go(p, 'editsched'); await p.evaluate(d => window.openScheduler(d), di); await sleep(800) }
  const full = []
  try {
    // ---- W4: Saturday 18 Jul, OIL Earn with the caret in the input's start box
    const sat = await L.fileInput(w, tag, '2026-07-18', { type: 'Training', people: [L.RANGER], from: '08:00', to: '10:00', title: 'Sat brief' })
    await base(5)
    const s0 = await secs(p)
    const waves = await p.evaluate(() => document.querySelectorAll('#sbBoard [data-secmove*="wave"], #sbBoard .sb-wave').length)
    const oil = p.getByRole('button', { name: /OIL Earn/i })
    if (!(await oil.count())) res.push([`W4 ${tag}`, 'NOT WALKED', `no "OIL Earn" button on Sat 18 Jul (wave sections seen ${waves}); sections ${J(s0.order)}`])
    else {
      await caretIn(w, sat)
      await tapCtl(w, oil); const fA = await snap(w, tag, 'w4-lift'); const a = await secs(p)
      await sleep(600); const fB = await snap(w, tag, 'w4-settled'); const b = await secs(p)
      await p.mouse.click(3, 3); await sleep(500); const fC = await snap(w, tag, 'w4-caret-left'); const c = await secs(p)
      const ok = [a, b, c].every(x => !x.doubled.length)
      res.push([`W4 ${tag} OIL Earn, caret in input start (waves ${waves})`, ok ? 'PASS' : 'FAIL', `right after ${J(a)}; settled ${J(b)}; caret left ${J(c)}`, `${fA}, ${fB}, ${fC}`])
      await tapCtl(w, oil).catch(() => {}); await sleep(500)
    }
  } catch (e) { res.push([`W4 ${tag}`, 'ERROR', e.message.split('\n')[0].slice(0, 120) + ' pinp=' + J(await p.evaluate(() => document.querySelector('#schedBoard .pinp')?.textContent.replace(/\s+/g, ' ').slice(0, 200)))]) }
  try {
    // ---- W5(a): Undo / Redo with the caret in a box, nothing typed
    const wed = await L.fileInput(w, tag, L.WED, { type: 'Training', people: [L.RANGER], from: '08:00', to: '10:00', title: 'Range brief' })
    await base(2)
    await caretIn(w, wed); const f0 = await snap(w, tag, 'w5a-caret')
    const undo = p.locator('button[title*="Undo" i]:visible, [aria-label*="Undo" i]:visible')
    const redo = p.locator('button[title*="Redo" i]:visible, [aria-label*="Redo" i]:visible')
    if (!(await undo.count())) res.push([`W5a ${tag}`, 'NOT WALKED', 'no Undo button found on the Board'])
    else {
      await tapCtl(w, undo); await sleep(500); const f1 = await snap(w, tag, 'w5a-undo'); const u = await secs(p)
      await tapCtl(w, redo); await sleep(500); const f2 = await snap(w, tag, 'w5a-redo'); const r = await secs(p)
      await p.mouse.click(3, 3); await sleep(500); const f3 = await snap(w, tag, 'w5a-left'); const l = await secs(p)
      res.push([`W5a ${tag} Undo/Redo, caret in box (no drag done)`, [u, r, l].every(x => !x.doubled.length) ? 'PASS' : 'FAIL', `undo ${J(u)}; redo ${J(r)}; left ${J(l)}`, `${f0}, ${f1}, ${f2}, ${f3}`])
    }
    // ---- W7: the › day arrow with the caret in a box, then caret leaves
    await base(2)
    await caretIn(w, wed)
    await p.keyboard.press('Control+A'); await p.keyboard.type('0715')
    const next = p.getByRole('button', { name: /Thu 16/ })
    await tapCtl(w, next); const g1 = await snap(w, tag, 'w7-lift'); const a7 = await secs(p)
    await sleep(600); const g2 = await snap(w, tag, 'w7-settled'); const b7 = await secs(p)
    await p.mouse.click(3, 3); await sleep(500); const g3 = await snap(w, tag, 'w7-left'); const c7 = await secs(p)
    const rec = await L.recOf(p, wed)
    res.push([`W7 ${tag} change day (Thu 16 tab) with "0715" typed in Wed input start`, [a7, b7, c7].every(x => !x.doubled.length) ? 'PASS' : 'FAIL', `after ${J(a7)}; settled ${J(b7)}; left ${J(c7)}; Wed input stored s=${rec?.s} (0715=435)`, `${g1}, ${g2}, ${g3}`])
    res.push([`${tag} full Board sections at open`, 'RECORD', J(full), ''])
  } catch (e) { res.push([`${tag}`, 'ERROR', e.message.split('\n')[0].slice(0, 200)]) }
  await w.ctx.close()
}
await run('desk', 'chromium')
await run('phone', 'webkit')
for (const r of res) console.log('RESULT', r.join(' | '))
facts.results = res
await finish()
console.log('errors:', facts.errors.length, J(facts.errors.slice(0, 6)))
