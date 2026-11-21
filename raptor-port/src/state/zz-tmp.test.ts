import { it } from 'vitest'
import { DAYS } from '../engine/data'
it('dump', () => {
  for (const di of [1, 3, 4]) { const d: any = DAYS[di]; console.log(di, Object.keys(d).map(k => `${k}:${Array.isArray(d[k]) ? d[k].length : typeof d[k]}`).join(' ')); console.log(JSON.stringify(d.allhands).slice(0, 700)); console.log(JSON.stringify(d.waves?.[0]).slice(0, 500)) }
})
