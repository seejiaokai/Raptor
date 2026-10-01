import * as S from './ins-s-lib2.mjs'
const { B, L, W } = S
const { browser, p, errors } = await B.world()
try {
  await B.toEdit(p); await W.showDay(p, 1)
  const m = p.locator('#eWeek [data-planmenu="1"]:visible').first()
  await m.click(); await S.sleep(500)
  const dump = async () => p.evaluate(() => {
    const els = [...document.querySelectorAll('[data-planpv], [data-plansw], [data-plannew], [data-planalt], .planmenu button, .planmenu *[data-plan], [data-plansave], [data-planact]')].filter(e => e.offsetParent !== null)
    const menu = [...document.querySelectorAll('.planmenu, #planMenu, .plan-menu, [role=menu]')].filter(e => e.offsetParent !== null).map(e => e.innerText.replace(/\s+/g, ' ').slice(0, 400))
    return { menu, els: els.map(e => e.tagName + '|' + [...e.attributes].filter(a => a.name.startsWith('data-')).map(a => a.name + '=' + a.value).join(',') + '|' + e.innerText.replace(/\s+/g, ' ').trim().slice(0, 40)) }
  })
  console.log(JSON.stringify(await dump(), null, 1))
  await B.pic(p, 'probe5-menu')
} catch (e) { console.log('ERR', e.stack) }
await browser.close()
