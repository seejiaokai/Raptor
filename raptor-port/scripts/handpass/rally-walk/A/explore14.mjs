import { launch, ctxOpen, SIZES, sleep, buildSat, hours, bType, bf } from './lib.mjs'
console.log('explore14 v3')
const b = await launch()
const { ctx, p } = await ctxOpen(b, SIZES.desk, 'x')
await buildSat(p)
console.log(JSON.stringify(await hours(p, ['Saber', 'Echo', 'Ace'])))
await bType(p, bf(5,0,0,'rl'), '07:00')
console.log(JSON.stringify(await hours(p, ['Saber', 'Echo', 'Ace'])))
await b.close()
