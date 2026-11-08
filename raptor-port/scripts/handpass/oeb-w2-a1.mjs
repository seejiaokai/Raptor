// A1: leave, medical, Personal filed through the Inputs page; tapped in OIL Earn and outside it. SIZE=phone|pc
import { newWorld, openBoard, oilOn, sleep, close, shot, fileInput, tapSpec, tag, selCount, press, VERSION } from './oeb-w2-lib.mjs'
import { writeFileSync, mkdirSync } from 'node:fs'
const size = process.env.SIZE || 'pc'
console.log(VERSION, 'a1', size)
const OUT = 'C:/Users/User/AppData/Local/Temp/claude/ba46d636af5eaefe/e324d8f6-0c85-4339-be37-1d188075a056/scratchpad/res'
mkdirSync(OUT, { recursive: true })
const w = await newWorld(size, 'sat')
const r = {}
const slim = x => x && x.missing ? { MISSING: x.n } : x && { note: x.note, sel: x.sel, selAfter: x.selAfter, fpSame: x.fpSame, hit: x.hit, wrap: x.tag && x.tag.wrap, title: x.tag && x.tag.title }
try {
  r.ll = await fileInput(w, { kind: 'LL', person: 'Ace', rmk: 'W2 LL' })
  r.oml = await fileInput(w, { kind: 'OML', person: 'Blade', rmk: 'W2 OML' })
  r.personal = await fileInput(w, { kind: 'Personal', person: 'Comet', rmk: 'W2 PERS', s: '10:00', e: '11:00' })
  console.log('filed', JSON.stringify(r))
  await openBoard(w)
  // where are they? every puck of these three on the board (not the roster)
  r.where = await w.page.evaluate(() => [...document.querySelectorAll('#sbBoard .puck')].filter(p => /^(Ace|Blade|Comet)/.test(p.textContent.trim()) && p.getBoundingClientRect().width > 2).map(p => { let e = p, k = ''; for (let i = 0; i < 8 && e; i++, e = e.parentElement) { const f = e.querySelector('[data-bfld]'); if (f) { k = f.dataset.bfld; break } } const wr = p.closest('.oilpk'); return p.textContent.trim() + ' | ' + k + ' | ' + (wr ? wr.className : '') + ' | ' + p.closest('.sb-panel')?.querySelector('h3,.sb-ph,.sbph')?.textContent.trim().slice(0, 30) }))
  console.log('where', JSON.stringify(r.where))
  await oilOn(w, true)
  for (const cs of ['Ace', 'Blade', 'Comet']) { r['in_' + cs] = slim(await tapSpec(w, { cs, key: 'dn:5.0' }, `a1-${cs}-oil-${size}`)); await sleep(2300) }
  r.in_Comet_ground = slim(await tapSpec(w, { cs: 'Comet', key: 'gr:5.5' }, `a1-Comet-ground-oil-${size}`)); await sleep(2300)
  r.in_Comet_copy2 = slim(await tapSpec(w, { cs: 'Comet', key: 'dn:5.0', nth: 1 }, `a1-Comet-copy2-oil-${size}`)); await sleep(2300)
  await oilOn(w, false)
  for (const cs of ['Ace', 'Blade', 'Comet']) { r['out_' + cs] = slim(await tapSpec(w, { cs, key: 'dn:5.0' }, `a1-${cs}-outside-${size}`)); await sleep(2300) }
  await shot(w, `a1-${size}-final`)
} catch (e) { r.error = e.message.slice(0, 300) }
console.log(JSON.stringify(r, null, 1).slice(0, 4000))
writeFileSync(`${OUT}/a1-${size}.json`, JSON.stringify(r, null, 1))
await close(w)
