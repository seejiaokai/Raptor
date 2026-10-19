import { launch, ctxOpen, sleep, go, shot, openBoard, closeBoard, addStandby, seat, wave, bf, bType, errors, rec, waveShot, chips, summ, bPublish, pending, topShot, toTop, pressChip, reload, undo, redo, leaveBox } from './sf-A-lib.mjs'
console.log('sf-A-sbreak v1')
const b = await launch()
const lit = async (p, di, gi) => (await chips(p, di, gi, 0)).map(c => c.chips.length ? (c.chips.some(x => x.on) ? 'L' : 'd') : '-').join('')
const pend = async p => ((await pending(p)).join('|').match(/(\d+) pending/) || [, '0'])[1]
const tickModel = (p, di, gi) => p.evaluate(([d, g]) => { const f = window.DAYS[d].waves[g].formations[0]; return { rl: f.rl || '', ticks: f.aircraft.map(a => a.fly ? 1 : 0).join('') } }, [di, gi])

/* B3 — hammer the chip on Unpub Tuesday: double-click, triple-click, then count Undos */
{
  const DI = 1
  const { ctx, p } = await ctxOpen(b, 'b3u')
  const gi = await addStandby(p, DI, 'sc'); await seat(p, DI, gi, [[0, 0], [0, 1], [0, 2], [0, 3]])
  await openBoard(p, DI)
  const chip = p.locator(`#schedBoard [data-safly="${DI}.${gi}.0.2"]:visible`).first()
  await chip.evaluate(e => e.scrollIntoView({ block: 'center' })); await sleep(200)
  const bx = await chip.boundingBox()
  await p.mouse.dblclick(bx.x + bx.width / 2, bx.y + bx.height / 2); await sleep(700)
  const afterDbl = { lit: await lit(p, DI, gi), m: await tickModel(p, DI, gi) }
  /* triple click */
  const chip2 = p.locator(`#schedBoard [data-safly="${DI}.${gi}.0.2"]:visible`).first()
  const bx2 = await chip2.boundingBox()
  await p.mouse.click(bx2.x + bx2.width / 2, bx2.y + bx2.height / 2, { clickCount: 3, delay: 20 }); await sleep(700)
  const afterTriple = { lit: await lit(p, DI, gi), m: await tickModel(p, DI, gi) }
  const pic = await waveShot(p, DI, gi, 'A-B3-1-after-hammer')
  /* Undo once per press: 5 presses, 5 Undos, the state after each */
  const trail = []
  for (let n = 0; n < 5; n++) { await undo(p); const ok = await p.evaluate(([d, g]) => !!window.DAYS[d].waves[g], [DI, gi]); trail.push(ok ? await lit(p, DI, gi) : 'wave-gone') }
  const fin = trail[4]
  rec('B3', 'Unpub Tuesday: double-click the dashed chip, then triple-click it (5 presses in all), then Undo five times', 'a double-click ends clear (dashed); a triple-click ends lit; one Undo per press: states after Undo 1..5 = dddd, ddLd, dddd, ddLd, dddd', `after double: ${JSON.stringify(afterDbl)}; after triple: ${JSON.stringify(afterTriple)}; after each Undo: ${trail.join(' > ')}`, afterDbl.lit === 'dddd' && afterTriple.lit === 'ddLd' && trail.join('>') === 'dddd>ddLd>dddd>ddLd>dddd' ? 'PASS' : 'FAIL', pic)
  await ctx.close()
}
/* B3 — on Pub Sat: a press pair ends where it started: 0 pending */
{
  const DI = 5
  const { ctx, p } = await ctxOpen(b, 'b3p')
  const gi = await addStandby(p, DI, 'sc'); await seat(p, DI, gi, [[0, 0], [0, 1], [0, 2], [0, 3]])
  await openBoard(p, DI); await bPublish(p, DI)
  const chip = p.locator(`#schedBoard [data-safly="${DI}.${gi}.0.2"]:visible`).first()
  await chip.evaluate(e => e.scrollIntoView({ block: 'center' })); await sleep(200)
  const bx = await chip.boundingBox()
  await p.mouse.dblclick(bx.x + bx.width / 2, bx.y + bx.height / 2); await sleep(800)
  const s = { lit: await lit(p, DI, gi), pend: await pend(p), pending: (await pending(p)).join('|') }
  rec('B3', 'Pub Sat: double-click the dashed chip (a press pair)', 'ends dashed with 0 pending (no "Not yet signed")', JSON.stringify(s), s.lit === 'dddd' && s.pend === '0' && !/Not yet signed/.test(s.pending) ? 'PASS' : 'FAIL', await topShot(p, 'A-B3-2-pub-dbl'))
  await ctx.close()
}

/* B4 — focus R, type 06, then press the SPARE's chip without leaving the box */
{
  const DI = 1
  const { ctx, p } = await ctxOpen(b, 'b4')
  const gi = await addStandby(p, DI, 'sc'); await seat(p, DI, gi, [[0, 0], [0, 1], [0, 2], [0, 3]])
  await openBoard(p, DI)
  const R = p.locator(bf(DI, gi, 0, 'rl') + ':visible').first()
  await R.evaluate(e => e.scrollIntoView({ block: 'center' })); await sleep(150)
  await R.click(); await p.keyboard.type('06'); await sleep(200)
  const mid = await R.inputValue()
  await pressChip(p, `${DI}.${gi}.0.2`).catch(e => console.log('chip press failed:', e.message.slice(0, 80)))
  await sleep(500)
  const s1 = { boxNow: await p.locator(bf(DI, gi, 0, 'rl') + ':visible').first().inputValue(), lit: await lit(p, DI, gi), m: await tickModel(p, DI, gi), active: await p.evaluate(() => document.activeElement && (document.activeElement.getAttribute('data-bfld') || document.activeElement.tagName)) }
  const pic = await waveShot(p, DI, gi, 'A-B4-1-mid-edit')
  await leaveBox(p)
  const s2 = { lit: await lit(p, DI, gi), m: await tickModel(p, DI, gi), box: await p.locator(bf(DI, gi, 0, 'rl') + ':visible').first().inputValue() }
  rec('B4', 'focus the SC R box, type "06", then press the SPARE\'s chip without leaving the box', 'R saved or put back cleanly, the chip state follows the final R, no half state', `typed "${mid}"; right after the chip press: ${JSON.stringify(s1)}; after leaving the box: ${JSON.stringify(s2)}`, (s2.m.rl === '' && s2.m.ticks === '0010' && s2.lit === 'dddd'.replace('ddd', 'dd').replace('dd', 'dd') ) || (s2.m.rl !== '' && s2.lit === 'LLLL') || (s2.m.rl === '' && s2.m.ticks === '0010' && s2.lit === 'ddLd') ? 'PASS' : 'FAIL', pic)
  await waveShot(p, DI, gi, 'A-B4-2-after-leave')
  await ctx.close()
}

/* B5 — delete the wave with a ticked row, then Undo; delete one ticked line, then Undo; reload after each */
{
  const DI = 5
  const { ctx, p } = await ctxOpen(b, 'b5')
  const gi = await addStandby(p, DI, 'sc'); await seat(p, DI, gi, [[0, 0], [0, 1], [0, 2], [0, 3]])
  await openBoard(p, DI)
  await pressChip(p, `${DI}.${gi}.0.2`)
  const base = { lit: await lit(p, DI, gi), m: await tickModel(p, DI, gi) }
  /* delete one ticked line (the row's own x) */
  await p.locator(`#schedBoard [data-ldel="${DI}.${gi}.0.2"]:visible`).first().evaluate(e => e.scrollIntoView({ block: 'center' })); await sleep(150)
  await p.locator(`#schedBoard [data-ldel="${DI}.${gi}.0.2"]:visible`).first().click(); await sleep(700)
  const confirm1 = await p.evaluate(() => [...document.querySelectorAll('button')].filter(e => e.offsetParent && /^(Delete|Remove|Yes|OK|Confirm)/i.test(e.innerText.trim())).map(e => e.innerText.trim()))
  if (confirm1.length) { await p.locator('button', { hasText: new RegExp('^' + confirm1[0]) }).last().click(); await sleep(700) }
  const del = { lit: await lit(p, DI, gi), rows: (await wave(p, DI, gi)).f[0].ac.length, confirm: confirm1 }
  await undo(p)
  const und = { lit: await lit(p, DI, gi), m: await tickModel(p, DI, gi), rows: (await wave(p, DI, gi)).f[0].ac.length }
  await reload(p); await openBoard(p, DI)
  const rel = { lit: await lit(p, DI, gi), m: await tickModel(p, DI, gi) }
  rec('B5', 'tick a SPARE row, delete that line (its ✕), Undo, reload', 'the line is gone after the delete; Undo brings it back with the tick lit; reload keeps it', `before ${JSON.stringify(base)}; after delete ${JSON.stringify(del)}; after Undo ${JSON.stringify(und)}; after reload ${JSON.stringify(rel)}`, und.lit[2] === 'L' && rel.lit[2] === 'L' ? 'PASS' : 'FAIL', await waveShot(p, DI, gi, 'A-B5-1-line-undo'))
  /* delete the whole wave */
  await p.locator(`#schedBoard [data-wvdel="${DI}.${gi}"]:visible, #schedBoard button:visible`, { hasText: /^✕ Wave|✕ Wave$|× Wave/ }).first().evaluate(e => e.scrollIntoView({ block: 'center' })).catch(() => {})
  const wdel = p.locator('#schedBoard button:visible', { hasText: /Wave$/ }).filter({ hasText: /✕|×/ }).first()
  console.log('wave delete buttons', await p.evaluate(() => [...document.querySelectorAll('#schedBoard button')].filter(e => e.offsetParent && /Wave/.test(e.innerText)).map(e => e.innerText.trim() + '|' + [...e.attributes].filter(a => a.name.startsWith('data-')).map(a => a.name + '=' + a.value).join(','))))
  const before = await wave(p, DI, gi)
  await wdel.click(); await sleep(700)
  const confirm2 = await p.evaluate(() => [...document.querySelectorAll('button')].filter(e => e.offsetParent && /^(Delete|Remove|Yes|OK|Confirm)/i.test(e.innerText.trim())).map(e => e.innerText.trim()))
  if (confirm2.length) { await p.locator('button', { hasText: new RegExp('^' + confirm2[0]) }).last().click(); await sleep(800) }
  const kinds = await p.evaluate(di => window.DAYS[di].waves.map(w => w.kind), DI)
  await undo(p)
  const kinds2 = await p.evaluate(di => window.DAYS[di].waves.map(w => w.kind), DI)
  const gi2 = kinds2.lastIndexOf('sc')
  const und2 = { kinds: kinds2, lit: gi2 >= 0 ? await lit(p, DI, gi2) : 'none', m: gi2 >= 0 ? await tickModel(p, DI, gi2) : null }
  await reload(p); await openBoard(p, DI)
  const rel2 = { kinds: await p.evaluate(di => window.DAYS[di].waves.map(w => w.kind), DI), lit: gi2 >= 0 ? await lit(p, DI, gi2) : 'none' }
  rec('B5', 'delete the whole SC wave (a ticked row inside), Undo, reload', 'the wave is gone, Undo brings it back with the tick lit, reload keeps it', `kinds after delete ${JSON.stringify(kinds)} (confirm ${JSON.stringify(confirm2)}); after Undo ${JSON.stringify(und2)}; after reload ${JSON.stringify(rel2)}`, und2.lit[2] === 'L' && rel2.lit[2] === 'L' ? 'PASS' : 'FAIL', await waveShot(p, DI, gi2 >= 0 ? gi2 : gi, 'A-B5-2-wave-undo'))
  await ctx.close()
}
console.log('errors', JSON.stringify(errors))
await b.close()
