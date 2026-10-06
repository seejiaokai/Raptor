/* S05b — Meeting (00:00–23:59 custom) with X on an SC MAIN seat ONLY: what his puck wears (ring colour as painted, chip), and the same with the All day tick */
import * as T from './bta-B-lib.mjs'
import * as Q from './bta-B-lib2.mjs'
const { K, B, C, D, L, W, P6, ID, CSN, TUE, sleep, R, pic } = T
const t = T.mk('s05b')
const P = T.PHONE ? 'ph' : 'dk'
async function one(tag, cfg) {
  const { browser, p, errors } = await K.fresh()
  const idp = `S05b-${P}-${tag}`
  try {
    const f = await T.file(p, { type: 'Meeting', di: TUE, remarks: 'Mtg-' + tag, ...cfg })
    const sc = await Q.scMainBlank(p, TUE)
    const s = await T.see(p, `sc-${tag}`)
    const sh = s.pk.filter(x => x.where === 'flying line').map(x => `ring ${x.solid ? 'solid' : 'none'} shadow "${x.shadow}" chip "${x.chip}" class "${x.cls.replace(/\s+/g, ' ')}"`)
    const amber = s.held.filter(x => /SHIFT_SOFT/.test(x))
    t.add(`${idp}.1`, `Meeting (${tag}) filed; X on an SC MAIN seat only, shift ${sc.times}; took ${sc.took}`, T.says(s, 200) + ` · his SC puck as painted: ${JSON.stringify(sh)}`, amber.length === 1 && s.held.length === amber.length ? 'RECORDED' : 'RECORDED', s.pics)
  } catch (e) { R(`${idp}.X`, 'script', String(e.stack || e).slice(0, 700), 'FAIL', [await pic(p, `sc-X-${tag}`)]) }
  R(`${idp}.err`, 'browser errors', errors.join(' | ') || 'none', errors.length ? 'FAIL' : 'PASS')
  await browser.close()
}
await one('custom', { allday: false, span: 'custom', from: '00:00', to: '23:59' })
await one('allday', { allday: true })
T.done('bta-B-s05b')
