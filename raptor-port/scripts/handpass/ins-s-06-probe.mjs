import * as S from './ins-s-lib2.mjs'
const { B, L, W } = S
const { browser, p, errors } = await B.world()
try {
  await B.toEdit(p)
  await S.board(p, 1)
  await p.locator('#schedBoard [data-dradd="1.0"]').first().click(); await S.sleep(600)
  const out = await p.evaluate(() => { const rows = [...document.querySelectorAll('#schedBoard [data-dr], #schedBoard .sb-arow')].filter(e => /WALK|^\s*$/.test(e.innerText) || true); const el = [...document.querySelectorAll('#schedBoard .ppl')].filter(e => e.offsetParent !== null); return el.slice(0, 40).map(e => e.outerHTML.slice(0, 220)) })
  console.log(out.slice(-8).join('\n\n'))
  const last = await p.evaluate(() => { const els = [...document.querySelectorAll('#schedBoard [data-slot],[data-fill],[data-pfill]')]; return els.length })
  console.log(last)
  const ground = await p.locator('#schedBoard [data-gradd="1"]').first().click(); await S.sleep(500)
  const out2 = await p.evaluate(() => [...document.querySelectorAll('#schedBoard .ppl')].filter(e => e.offsetParent !== null).slice(-4).map(e => e.outerHTML.slice(0, 260)))
  console.log('GROUND\n' + out2.join('\n\n'))
} catch (e) { console.log('ERR', e.stack) }
await browser.close()
