import { launch, ctxOpen, sleep, go, shot, openBoard, addStandby, seat, wave, bf, bType, status, warns, errors, closeBoard, chips, summ, dayBadge, pressChip, undo, redo, rec, waveShot, bPublish, reload } from './sf-A-lib.mjs'
console.log('sf-A-s03 v2')
const b = await launch()

const lit = async (p, di, gi) => (await chips(p, di, gi, 0)).map(c => c.chips.some(x => x.on) ? 1 : 0).join('')
const head = p => p.evaluate(() => { const s = document.querySelector('#schedBoard .sb-sign'); const h = s ? s.parentElement : null; return h ? h.innerText.replace(/\s+/g, ' ').slice(0, 400) : null })
const rlv = (p, di, gi) => p.evaluate(([d, g]) => window.DAYS[d].waves[g].formations[0].rl || '', [di, gi])

/* (a)+(b)+(c) Unpub Tuesday */
{
  const { ctx, p } = await ctxOpen(b, 's03u')
  const DI = 1
  const gi = await addStandby(p, DI, 'sc')
  await seat(p, DI, gi, [[0, 0], [0, 1], [0, 2], [0, 3]])
  await openBoard(p, DI)
  const trail = [await lit(p, DI, gi)]
  await pressChip(p, `${DI}.${gi}.0.2`)
  const s1 = await lit(p, DI, gi); trail.push(s1)
  let pic = await waveShot(p, DI, gi, 'A-3a-1-ticked-spare')
  rec('3a', 'press the SPARE row (0.2) dashed chip, nothing typed', 'only that row lit; other three dashed', `lit=${s1}`, s1 === '0010' ? 'PASS' : 'FAIL', pic)
  await bType(p, bf(DI, gi, 0, 'rl'), '0630')
  const s2 = await lit(p, DI, gi); trail.push(s2)
  const c2 = (await chips(p, DI, gi, 0))[2]
  pic = await waveShot(p, DI, gi, 'A-3a-2-R-typed')
  rec('3a', 'type R 06:30 on the board, leave the box', 'all four lit; the ticked row\'s chip is no longer pressable, its title says to CX the row', `lit=${s2}; 0.2 chip=${JSON.stringify(c2.chips)}`, s2 === '1111' && /CX/i.test(c2.chips.map(x => x.title).join(' ')) && c2.chips.every(x => x.tag !== 'BUTTON' || x.dis) ? 'PASS' : 'FAIL', pic)
  await bType(p, bf(DI, gi, 0, 'rl'), '')
  const s3 = await lit(p, DI, gi); trail.push(s3)
  const c3 = (await chips(p, DI, gi, 0))[2]
  pic = await waveShot(p, DI, gi, 'A-3a-3-R-cleared')
  rec('3a', 'clear R again', 'RECORD: the ticked row stays lit and is a button again; the other three dashed', `lit=${s3}; 0.2 chip=${JSON.stringify(c3.chips)}`, s3 === '0010' ? 'PASS' : 'FAIL', pic)
  /* (c) undo one step at a time */
  const und = []
  for (let i = 0; i < 3; i++) { await undo(p); und.push(await lit(p, DI, gi) + '|R=' + await rlv(p, DI, gi)) }
  rec('3c', 'Undo x3 from the end (clear R, type R, tick)', `one Undo per action: after 1st lit=1111 R=06:30; after 2nd lit=0010 R=''; after 3rd lit=0000 R=''`, und.join(' ; '), und[0] === '1111|R=06:30' && und[1] === '0010|R=' && und[2] === '0000|R=' ? 'PASS' : 'FAIL', await waveShot(p, DI, gi, 'A-3c-undo-all'))
  const red = []
  for (let i = 0; i < 3; i++) { await redo(p); red.push(await lit(p, DI, gi) + '|R=' + await rlv(p, DI, gi)) }
  rec('3c', 'Redo x3', 'same states forwards: 0010; 1111|06:30; 0010|empty', red.join(' ; '), red[0] === '0010|R=' && red[1] === '1111|R=06:30' && red[2] === '0010|R=' ? 'PASS' : 'FAIL')
  /* (b) reverse: untick, type R first, then try the chip */
  await pressChip(p, `${DI}.${gi}.0.2`)   // untick
  const u0 = await lit(p, DI, gi)
  await bType(p, bf(DI, gi, 0, 'rl'), '0630')
  const rb = await chips(p, DI, gi, 0)
  let pressed = 'no button'
  const btn = p.locator(`#schedBoard [data-safly="${DI}.${gi}.0.2"]:visible`)
  if (await btn.count()) { await btn.first().click({ force: true }).catch(e => pressed = 'click error ' + e.message.slice(0, 60)); await sleep(400); pressed = 'a press was possible (data-safly element present)' }
  const afterPress = await lit(p, DI, gi)
  const m = await p.evaluate(([d, g]) => JSON.stringify(window.DAYS[d].waves[g].formations[0].aircraft.map(a => a.fly || false)), [DI, gi])
  await bType(p, bf(DI, gi, 0, 'rl'), '')
  const s5 = await lit(p, DI, gi)
  pic = await waveShot(p, DI, gi, 'A-3b-R-first-then-cleared')
  rec('3b', 'untick, type R first, try the SPARE chip, then clear R', 'after R: lit=1111 and the chip not pressable; after clearing R: all dashed (no tick stored)', `untick lit=${u0}; after R lit=${(await Promise.resolve(rb)).map(c => c.chips.some(x => x.on) ? 1 : 0).join('')}, chip ${JSON.stringify(rb[2].chips.map(x => x.tag + (x.dis ? '(dis)' : '')))}; press: ${pressed}; lit after press ${afterPress}; stored ticks ${m}; after clear lit=${s5}`, s5 === '0000' && afterPress === '1111' && m === '[false,false,false,false]' ? 'PASS' : 'FAIL', pic)
  await ctx.close()
}

/* (d) Pub Sat: pending counts */
{
  const { ctx, p } = await ctxOpen(b, 's03p')
  const DI = 5
  const gi = await addStandby(p, DI, 'sc')
  await seat(p, DI, gi, [[0, 0], [0, 1], [0, 2], [0, 3]])
  await openBoard(p, DI)
  const pub = await bPublish(p, DI)
  console.log('publish', JSON.stringify(pub))
  console.log('head after publish', await head(p), JSON.stringify(await status(p)))
  await pressChip(p, `${DI}.${gi}.0.2`)
  console.log('head after tick', await head(p), JSON.stringify(await status(p)))
  await waveShot(p, DI, gi, 'x3d-1')
  await shot(p, 'x3d-1-full')
  await ctx.close()
}
console.log('errors', JSON.stringify(errors))
await b.close()
