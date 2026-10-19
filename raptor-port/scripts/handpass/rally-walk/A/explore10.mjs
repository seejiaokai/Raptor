import { launch, ctxOpen, SIZES, sleep, go, shot, buildSat, bPublish, lwOil } from './lib.mjs'
console.log('explore10 v1')
const b = await launch()
const { ctx, p } = await ctxOpen(b, SIZES.desk, 'x')
await buildSat(p); await bPublish(p, 5)
console.log(JSON.stringify(await lwOil(p, ['stiff', 'freak', 'plasma'])))
await shot(p, 'explore-lw')
await b.close()
