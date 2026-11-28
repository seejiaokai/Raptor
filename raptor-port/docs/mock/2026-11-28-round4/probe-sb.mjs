// A probe (not a drawing): where the demo week's standby lines are, and who is on them (read from the app's own day data).
import * as K from './kit.mjs'
const { b, p } = await K.world('d')
await K.signIn(p, 'ad', 'a')
await K.weekDay(p, K.SIZES.d, 0)
const out = await p.evaluate(() => {
  const res = []
  window.DAYS.forEach((d, di) => {
    for (const k of ['dutywaves', 'waves', 'ground']) {
      const s = JSON.stringify(d[k] || '')
      const m = s.match(/.{0,120}(SC AM|SC PM|SPARE|AVALON|BB ).{0,160}/g)
      if (m) res.push(di + ' ' + d.dow + ' ' + k + ': ' + m.slice(0, 2).join(' || '))
    }
  })
  window.DAYS.forEach((d, di) => (d.waves || []).forEach(w => {
    const crew = JSON.stringify(w).match(/"[pw]":"[a-z]+"/g) || []
    res.push(di + ' ' + d.dow + ' wave "' + (w.label || w.name || '') + '" ' + Object.keys(w).join(',') + ' crew ' + crew.slice(0, 6).join(' '))
  }))
  return res.slice(0, 20)
})
K.log(out.join('\n'))
await b.close()
