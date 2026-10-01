import * as S from './ins-s-lib.mjs'
const { B, L, W } = S
const { browser, p, errors } = await B.world()
try {
  await B.toEdit(p)
  await L.go(p, 'logic')
  await p.locator('#lgEdit').click(); await S.sleep(500)
  const info = await p.evaluate(() => {
    const out = []
    for (const e of document.querySelectorAll('#page-logic input, #page-logic select, #page-logic textarea')) {
      const lbl = (e.closest('tr, .lrow, .rrow, label, .lgrule, div') || e).innerText.replace(/\s+/g, ' ').trim().slice(0, 100)
      out.push(e.tagName + '#' + (e.id || '') + '[' + [...e.attributes].filter(a => /^(data-|type)/.test(a.name)).map(a => a.name + '=' + a.value).join(',') + '] val=' + (e.value || '') + ' vis=' + (e.offsetParent !== null) + ' :: ' + lbl)
    }
    return out.filter(x => /report|debrief|nominal|lead|pad/i.test(x)).slice(0, 30)
  })
  console.log(info.join('\n'))
  const btns = await p.evaluate(() => [...document.querySelectorAll('#page-logic button')].filter(e => e.offsetParent !== null).map(e => (e.id || '') + '|' + [...e.attributes].filter(a => /^data-/.test(a.name)).map(a => a.name + '=' + a.value).join(',') + '|' + e.innerText.trim().slice(0, 24)).slice(0, 30))
  console.log(btns.join('\n'))
  await B.pic(p, 'probe4-logic')
} catch (e) { console.log('ERR', e.stack) }
await browser.close()
