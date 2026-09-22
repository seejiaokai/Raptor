import { open, go } from './lib.mjs'
const { browser, page } = await open({ state: 'C:/Users/User/projects/Raptor/raptor-port/docs/handpass/state-sat.json' })
await go(page, 'inputs')
console.log(JSON.stringify(await page.evaluate(() => ({
  form: [...document.querySelectorAll('#inPerson,#inType,#inStartT,#inEndT,[id^=in]')]
    .filter(e => e.offsetParent && /INPUT|SELECT|BUTTON/.test(e.tagName))
    .map(e => ({ id: e.id, tag: e.tagName, type: e.type, v: e.value, opts: e.tagName==='SELECT'? e.options.length : undefined })),
  calDays: [...document.querySelectorAll('#inCal [data-cal]')].slice(0, 10)
    .map(e => ({ cal: e.getAttribute('data-cal'), txt: (e.innerText||'').trim() })),
  calCount: document.querySelectorAll('#inCal [data-cal]').length,
  calHead: (document.querySelector('#inCal') || {}).innerText?.replace(/\s+/g,' ').slice(0, 120),
})), null, 1))
await browser.close()
