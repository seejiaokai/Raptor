process.env.BTA_X = 'bullet'; process.env.BTA_CS = 'Zulu'; process.env.BTA_SEAT = 'w'
const T = await import('./bta-B-lib.mjs')
const { K, B, C, D, L, W, W2, ID, CSN, TUE, sleep } = T
const { browser, p, errors } = await K.fresh()
try {
  const f = await T.file(p, { type: 'SANS Availability', di: 2, allday: true, sans: [0, 1, 2], remarks: 'offer' })
  console.log('filed', JSON.stringify(f), await T.rec(p, f.iid), await p.evaluate(i => JSON.stringify(window.INPUTS.find(x => x.iid === i)), f.iid))
  console.log('open edit', await W2.openEdit(p, f.iid))
  console.log(await p.evaluate(() => { const r = document.querySelector('#inBody tr.ined'); return r ? r.innerHTML.replace(/\s+/g, ' ').slice(0, 3500) : 'none' }))
  await T.pic(p, 'probe-sans-editor')
} catch (e) { console.log('ERR', e.stack) }
console.log(errors)
await browser.close()
