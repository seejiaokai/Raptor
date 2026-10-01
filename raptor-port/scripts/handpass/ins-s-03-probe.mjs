import * as S from './ins-s-lib.mjs'
import { handPut } from './seat-lib.mjs'
const { B, L, W } = S
const { browser, p, errors } = await B.world()
try {
  await B.toEdit(p)
  await S.board(p, 1)
  const src = p.locator(`#sbRoster .rpuck[data-person="shaft"]:visible`).first()
  console.log('crew list shaft', await src.count())
  const dst = p.locator(`#schedBoard [data-slot="1.1.1.0.p"]`).first()
  await W.drag(p, src, dst)
  console.log('holder after drag-replace', await S.seatHolder(p, '1.1.1.0.p'), JSON.stringify(await W.head(p, 1)))
  await S.setTime(p, 1, 'ff:1.0.0.to', '07:40'); console.log('to', await p.evaluate(() => window.DAYS[1].waves[0].formations[0].to))
  await B.pic(p, 'probe3-board')
  console.log(JSON.stringify(await W.head(p, 1)))
} catch (e) { console.log('ERR', e.stack) }
console.log('errors', errors)
await browser.close()
