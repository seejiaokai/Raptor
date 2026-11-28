// shr-a-probe — walker A's look at the Board's Unavailable section's markup on the frozen build (no assertions).
//   WR4_OUT=<dir> WR4_NEW=<build> SZ=desk|phone ENG=chromium|webkit node scripts/handpass/shr-a-probe.mjs
import * as L from './wr4-lib.mjs'
import { writeFileSync } from 'node:fs'
const { newPage, signIn, go, sleep, bundleOf, finish } = L
const SZ = process.env.SZ || 'desk', ENG = process.env.ENG || 'chromium'
console.log('shr-a-probe v1', SZ, ENG)
const w = await newPage(SZ, undefined, L.NEW_DIR, ENG); await signIn(w, 'ad'); console.log('bundle', await bundleOf(w.page))
const p = w.page
const iid = await L.fileInput(w, 'probe', L.WED, { type: 'LL', people: [L.RANGER, L.HEX], from: '08:00', to: '10:00' })
console.log('iid', iid)
await go(p, 'editsched'); await p.evaluate(() => window.openScheduler(2)); await sleep(900)
const html = await p.evaluate(() => document.querySelector('#sbBoard > [data-secmove$=".unav"]')?.outerHTML || 'NO UNAV')
writeFileSync(`${process.env.WR4_OUT}/unav-${SZ}.html`, html)
const head = await p.evaluate(() => { const b = document.querySelector('#schedBoard'); return [...b.querySelectorAll('button,[role=button]')].slice(0, 60).map(e => `${e.id}|${e.className}|${(e.textContent||'').trim().slice(0,30)}|${[...e.attributes].filter(a=>a.name.startsWith('data-')).map(a=>a.name+'='+a.value).join(',')}`) })
writeFileSync(`${process.env.WR4_OUT}/buttons-${SZ}.txt`, head.join('\n'))
await p.screenshot({ path: `${process.env.WR4_OUT}/probe-${SZ}.png` })
await finish()
