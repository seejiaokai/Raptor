import { sleep, go, shot, rec, errors } from './lib.mjs'
import { chromium } from '@playwright/test'
console.log('sc15c v1')
const variants = [
  { name: 'headless-new flag + viewport null', launch: { args: ['--force-device-scale-factor=1.25', '--window-size=1440,900'] }, ctx: { viewport: null } },
  { name: 'headful off: chromium channel args high-dpi', launch: { args: ['--force-device-scale-factor=1.25', '--high-dpi-support=1', '--window-size=1800,1125'] }, ctx: { viewport: null } },
]
for (const v of variants) {
  const br = await chromium.launch(v.launch)
  const ctx = await br.newContext(v.ctx)
  const p = await ctx.newPage()
  await p.goto('http://localhost:4298/'); await sleep(500)
  const r = await p.evaluate(() => ({ dpr: devicePixelRatio, w: innerWidth, h: innerHeight }))
  console.log(v.name, JSON.stringify(r))
  await br.close()
}
