import * as C from './rbl-C-lib.mjs'
const { B, L, W, K, ID, MON, TUE } = C
const WED = 2
const { browser, p, errors } = await K.fresh()
const dump = async (tag) => {
  const w = (await B.warnsOf(p, WED)).filter(x => x.who.includes(ID)).map(x => `${x.sev}/${x.code}${x.off ? '/OFF' : ''} key=${x.key}`)
  await B.toEdit(p); await W.showDay(p, WED)
  const l = await C.listFull(p, '#eWeek', WED)
  const bar = await B.readList(p, '#eWeek', WED)
  const pk = await C.painted(p, '#eWeek .day[data-day="2"]', ID)
  console.log(tag, 'WARN:', JSON.stringify(w), '| list lines:', JSON.stringify(l.filter(x => x.text.includes(C.CSN)).map(x => x.text.slice(0, 60))), '| bar', bar.bar, '| pucks', C.pk2(pk))
}
try {
  const a = await C.flyWave(p, TUE, { cs: 'ZV', msn: 'BFM', to: '20:00', ld: '22:30' })
  const b = await C.flyWave(p, WED, { cs: 'ZW', msn: 'BFM', br: '05:00', to: '07:00', ld: '08:00' })
  await dump('A plain (one early line Wed)')
  const x = await C.extraLine(p, WED, b.gi)
  await dump('B + blank line on Wed')
  await B.pic(p, 'p14-b')
  console.log('ERR', errors.join(' | '))
} catch (e) { console.log('ERR', e.stack) }
await browser.close()
