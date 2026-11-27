// sa208-wA-probe3 — walker A's third look: Mon's ground rows (which came from an input), the places a new AMT row and the
// standby lines draw, the SANS form's date calendar, what a plant on a weekend asks (the OIL question), and whether a
// mouse drag takes a man off his seat in the phone's WebKit. window.* only READ. Run: SZ=d|p node …/sa208-wA-probe3.mjs
import './sa208-wA-env.mjs'
import { writeFileSync } from 'node:fs'
const Y = await import('./swl-w1A-lib.mjs')
const B = await import('./scc-w1B-lib.mjs')
const { L, W5, Z, sleep, J, run, addLine, addSimRow, noteWatch, notesSeen, holdsAt } = Y
const SZ = process.env.SZ || 'd'
console.log('VERSION sa208-wA-probe3 1 ·', SZ, '·', process.env.W2_URL, '·', Y.OUT)
const zones = (p, di) => p.evaluate(i => [...document.querySelectorAll(`#schedBoard [data-slot], #schedBoard [data-fill]`)].filter(e => e.getBoundingClientRect().width > 0).map(e => (e.dataset.slot ? 'slot=' + e.dataset.slot : 'fill=' + e.dataset.fill) + (e.querySelector('.puck') ? '(' + [...e.querySelectorAll('.puck')].map(x => x.dataset.person).join(',') + ')' : '')).filter(s => s.includes(':' + i + '.') || s.startsWith('slot=' + i + '.') || s.startsWith('fill=' + i + '.')), di)
await run('probe3', SZ, async (p, W) => {
  const g = await p.evaluate(() => (window.DAYS[0].ground || []).map((r, i) => i + ':' + JSON.stringify(r).slice(0, 220)))
  W.rec('ground', 'Mon ground rows (as stored)', 'REC', g.join(' || '))
  const s = await addSimRow(p, W, 0, 'amt', 'BOX', '13:00', '14:00')
  const l = await addLine(p, W, 0, { kind: 'SC' })
  const a = await addLine(p, W, 0, { kind: 'AVALON' })
  const bb = await addLine(p, W, 0, { kind: 'BB' })
  W.rec('lines', 'new AMT row, SC, AVALON, BB on Mon', 'REC', J({ s, l, a, bb }))
  W.rec('zones', 'every place on the board of Mon', 'REC', (await zones(p, 0)).join(' '), await W.pic(p, 'zones'))
  const sb = await p.evaluate(() => [...document.querySelectorAll('#schedBoard .wave, #schedBoard [data-gline]')].filter(e => e.getBoundingClientRect().width > 0).map(e => (e.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 90)).slice(-6))
  W.rec('sbtext', 'the last lines drawn', 'REC', J(sb))
  /* the SANS form's date calendar */
  await L.closeBoard(p, W)
  await W5.sansDay(p, W, '2026-07-14')
  await W.press(p, '[data-testid="win-sansday"] [data-testid="sd-add"]', 'sd-add')
  await p.waitForSelector('#inpEditPop', { timeout: 5000 })
  const cal = await p.evaluate(() => [...document.querySelectorAll('#inpEditPop *')].filter(e => e.children.length === 0 && /^\d{1,2}$/.test((e.textContent || '').trim()) && e.getBoundingClientRect().width > 0).slice(0, 40).map(e => `${e.tagName}.${String(e.className).replace(/ /g, '.')}[${[...e.attributes].filter(a => a.name.startsWith('data')).map(a => a.name + '=' + a.value).join(',')}]${(e.textContent || '').trim()}`))
  W.rec('cal', 'the form\'s date calendar cells', 'REC', cal.join(' '), await W.pic(p, 'formcal'))
  await p.keyboard.press('Escape'); await sleep(400)
  const gg = p.locator('[data-testid="inped-escask-go"]:visible').first(); if (await gg.count()) await W.press(p, gg, 'discard')
  await W5.closeSansWin(p, W)
  /* a weekend plant: Sat, a new timed line, Jester on its front seat */
  const v = await addLine(p, W, 5, { cs: 'VW', to: '09:00', ld: '10:00' })
  const k = `5.${v.wi}.0.0.p`
  const ar = await B.arm(p, W, 'B', 5, `[data-slot="${k}"]`)
  await noteWatch(p)
  const pk = p.locator('#schedBoard .rpuck[data-person="ipman"]:visible').first()
  if (W.isPhone) await pk.tap(); else await pk.click()
  await sleep(900)
  const dlg = await p.evaluate(() => [...document.querySelectorAll('[role="dialog"], .modal, .pop, .sheet, [data-testid]')].filter(e => e.getBoundingClientRect().width > 0 && /OIL/i.test(e.textContent || '')).map(e => (e.getAttribute('data-testid') || e.className) + ': ' + (e.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 300)))
  W.rec('sat', `Sat 18: Jester tapped on VX front (armed ${ar.armed}): any OIL question, the notes`, 'REC', `holds ${await holdsAt(p, k)} · dialogs ${J(dlg)} · notes ${J(await notesSeen(p))}`, await W.pic(p, 'sat'))
  const btns = await p.evaluate(() => [...document.querySelectorAll('button')].filter(e => e.getBoundingClientRect().width > 0 && /OIL|Yes|No|Later|swap/i.test(e.textContent || '')).map(e => (e.textContent || '').trim() + '[' + [...e.attributes].filter(a => a.name.startsWith('data')).map(a => a.name + '=' + a.value).join(',') + ']').slice(0, 20))
  W.rec('satbtn', 'buttons with OIL / Yes / No / Later', 'REC', J(btns))
  /* a mouse drag of a seated man back to the crew list (does it take him off in this engine?) */
  await L.closeBoard(p, W)
  const ln = await addLine(p, W, 0, { cs: 'VX', to: '09:00', ld: '10:00' })
  const kk = `0.${ln.wi}.0.0.p`
  await B.arm(p, W, 'B', 0, `[data-slot="${kk}"]`)
  const pk2 = p.locator('#schedBoard .rpuck[data-person="ipman"]:visible').first(); if (W.isPhone) await pk2.tap(); else await pk2.click(); await sleep(700)
  await W5.boardDrawer(p, W, true)
  const src = p.locator(`#schedBoard [data-slot="${kk}"] .puck`).first(), dst = p.locator('#schedBoard .rpuck[data-person="cards"]:visible').first()
  const sa = await src.boundingBox().catch(() => null), db = await dst.boundingBox().catch(() => null)
  if (sa && db) { await p.mouse.move(sa.x + sa.width / 2, sa.y + sa.height / 2); await p.mouse.down(); await p.mouse.move(sa.x + sa.width / 2 + 8, sa.y + sa.height / 2 + 8, { steps: 3 }); await p.mouse.move(db.x + db.width / 2, db.y + db.height / 2, { steps: 14 }); await sleep(200); await p.mouse.up(); await sleep(700) }
  W.rec('off', 'Jester\'s seated puck dragged by a mouse onto the crew list: is he off?', 'REC', `boxes ${J({ sa, db })} · seat holds "${await holdsAt(p, kk)}"`, await W.pic(p, 'off'))
}, '2026-07-15T09:00:00')
writeFileSync('D:/raptor-work/c208/A/probe3-' + SZ + '.json', JSON.stringify(L.results, null, 1))
process.exit(0)
