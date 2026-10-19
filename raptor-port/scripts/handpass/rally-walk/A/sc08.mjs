import { launch, ctxOpen, SIZES, sleep, shot, buildSat, rlBox, val, model, rec, errors, bType, bf, openBoard, itLines, addIt, bPublish, status } from './lib.mjs'
console.log('sc08 v1')
const b = await launch()
const R = rlBox(5, 0, 0)
const typeNoLeave = async (p, sel, v) => { const e = p.locator(sel + ':visible').first(); await e.evaluate(x => x.scrollIntoView({ block: 'center' })); await sleep(100); await e.click(); await e.fill(''); await p.keyboard.type(v) }
const nF = p => p.evaluate(() => window.DAYS[5].waves.map(w => w.formations.length))
const fresh = async (tag) => { const o = await ctxOpen(b, SIZES.desk, tag); await buildSat(o.p); return o }
const tb = (p, sel) => p.locator('#schedBoard ' + sel + ':visible').first()
/* + In-time */
{
  const { ctx, p } = await fresh('8a')
  const before = (await itLines(p)).length
  await typeNoLeave(p, R, '0830'); await tb(p, '[data-itadd="5|0"]').click(); await sleep(700)
  const after = (await itLines(p)).length; const m = await model(p, 5, 0, 0)
  rec('8', 'desk', 'type R 0830 (no leaving), then press "+ In-time" once', 'one in-time line added on the first press, R saved', { before, after, rl: m.rl }, after === before + 1 && m.rl === '08:30' ? 'PASS' : 'FAIL', await shot(p, 'A08-intime'))
  /* ✕ of the in-time line */
  await typeNoLeave(p, rlBox(5, 0, 0, 'br'), '0950'); await tb(p, '[data-itdel="5|0|0"]').click(); await sleep(700)
  const after2 = (await itLines(p)).length; const m2 = await model(p, 5, 0, 0)
  rec('8', 'desk', 'type B 0950, then press the in-time line X', 'line removed on the first press, B saved', { after2, br: m2.br }, after2 === 0 && m2.br === '09:50' ? 'PASS' : 'FAIL')
  /* Sort all */
  await typeNoLeave(p, rlBox(5, 0, 0, 'to'), '1230'); await tb(p, '#sbSortAll').click(); await sleep(800)
  const pop = await p.locator('#sortAllPop').isVisible().catch(() => false); const popBtns = await p.evaluate(() => { const bs = [...document.querySelectorAll('#sortAllPop button')]; const c = bs.find(x => /cancel|nob|close/i.test(x.innerText)); if (c) c.click(); return bs.map(x => x.innerText.trim()) }); console.log('sortAll popup buttons', JSON.stringify(popBtns)); await sleep(400)
  const m3 = await model(p, 5, 0, 0); const toast = await p.evaluate(() => [...document.querySelectorAll('.toast, #toast, [class*=toast]')].map(e => e.innerText).filter(Boolean).slice(0, 2))
  rec('8', 'desk', 'type TO 1230, then press Sort all', 'TO saved (12:30) and the Sort all menu opens on the first press', { to: m3.to, popupOpenedOnFirstPress: pop }, m3.to === '12:30' && pop ? 'PASS' : 'FAIL')
  /* Undo takes only the just-typed change */
  await typeNoLeave(p, R, '0745'); await tb(p, '#sbUndo').click(); await sleep(700)
  const m4 = await model(p, 5, 0, 0)
  rec('8', 'desk', 'type R 0745, then press Undo', 'Undo takes back only the R just typed (R back to its previous 08:30; TO stays 12:30)', m4, m4.rl === '08:30' && m4.to === '12:30' ? 'PASS' : 'FAIL')
  /* Redo */
  await p.locator(R + ':visible').first().click(); await sleep(150)
  await p.keyboard.press('Escape')
  await tb(p, '#sbRedo').click(); await sleep(700)
  const m5 = await model(p, 5, 0, 0)
  rec('8', 'desk', 'focus R unchanged, press Redo', 'R 07:45 comes back on the first press', m5, m5.rl === '07:45' ? 'PASS' : 'FAIL')
  await ctx.close()
}
/* + Line */
{
  const { ctx, p } = await fresh('8b')
  const before = await nF(p)
  await typeNoLeave(p, R, '0830'); await tb(p, '[data-gline="5.0"]').click(); await sleep(800)
  const after = await nF(p); const m = await model(p, 5, 0, 0)
  rec('8', 'desk', 'type R 0830 (no leaving), then press "+ Line"', '+ Line adds exactly one line, R saved', { before, after, rl: m.rl }, after[0] === before[0] + 1 && m.rl === '08:30' ? 'PASS' : 'FAIL')
  /* a focused box left unchanged, then a press */
  await p.locator(rlBox(5, 0, 0, 'to') + ':visible').first().click(); await sleep(150)
  await tb(p, '[data-gline="5.0"]').click(); await sleep(800)
  const after2 = await nF(p)
  rec('8', 'desk', 'focus TO without changing it, press "+ Line"', 'exactly one more line (no double add)', { before: after, after2 }, after2[0] === after[0] + 1 ? 'PASS' : 'FAIL')
  /* + Wave */
  await typeNoLeave(p, R, '0815')
  await tb(p, '[data-wvadd="5"]').click(); await sleep(600)
  const menu = await p.getByRole('button', { name: 'Flying wave' }).first().isVisible().catch(() => false)
  const m2 = await model(p, 5, 0, 0)
  rec('8', 'desk', 'type R 0815 (no leaving), then press "+ Wave"', 'the add menu opens on the first press; R saved', { menuOpen: menu, rl: m2.rl }, menu && m2.rl === '08:15' ? 'PASS' : 'FAIL', await shot(p, 'A08-wave-menu'))
  await p.getByRole('button', { name: 'Flying wave' }).first().click(); await sleep(700)
  const w = await nF(p)
  rec('8', 'desk', 'choose Flying wave', 'exactly one new wave', w, w.length === 2 ? 'PASS' : 'FAIL')
  await ctx.close()
}
/* publish right after a changed box */
{
  const { ctx, p } = await fresh('8c')
  const sels = p.locator('#schedBoard [data-signday="5"]:visible'); const n = await sels.count()
  for (let i = 0; i < n; i++) { const opts = await sels.nth(i).locator('option').evaluateAll(os => os.map(o => o.value).filter(v => v && !/^—/.test(v))); await sels.nth(i).selectOption(opts[i]); await sleep(150) }
  await typeNoLeave(p, R, '0830')
  await tb(p, '[data-beak="5"]').click(); await sleep(1200)
  const ok = p.getByRole('button', { name: /^(Publish|Yes|Confirm)/ }).first()
  if (await ok.count() && await ok.isVisible()) { await ok.click(); await sleep(900) }
  const st = await status(p); const m = await model(p, 5, 0, 0)
  const issued = await p.evaluate(() => { const d = window.DAYS[5]; return { pub: d.pub ?? d.published ?? null, keys: Object.keys(d).filter(k => /pub|ver|issued/i.test(k)) } })
  rec('8', 'desk', 'sign all, type R 0830 (no leaving), press "Publish day"', 'publishes on the first press, ORIG carries R 08:30', { st, rl: m.rl, issued }, st.chip === 'ORIG' && m.rl === '08:30' ? 'PASS' : 'FAIL', await shot(p, 'A08-publish'))
  const oil = await p.locator('#sbOil').click().then(() => sleep(700)).then(() => p.evaluate(() => [...document.querySelectorAll('#schedBoard [data-oilp]')].map(e => e.innerText.replace(/\s+/g, ' ').trim())))
  rec('8', 'desk', 'OIL Earn readout after that publish', 'full day (FO): the published version has R 08:30', oil, oil.some(x => /^Saber FO/.test(x)) ? 'PASS' : 'FAIL')
  await ctx.close()
}
console.log('errors', JSON.stringify(errors))
await b.close()
