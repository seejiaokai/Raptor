// S52b - a published flying day with a PENDING edit: do the exports carry the issued face or the working edit?
const C = await import('./aa-C-lib.mjs')
const { world, shot, sleep, go, pubSat, closeBoard, editWeek, face, fs, L } = C
const say = (k, v) => console.log(k, '::', typeof v === 'string' ? v : JSON.stringify(v))
const w = await world(); const { page } = w
await go(page, 'editsched'); say('1 publish Monday', await pubSat(page, 0)); await closeBoard(page)
await go(page, 'editsched'); await editWeek(page)
const before = await page.evaluate(() => (document.querySelector('#eWeek [data-txt="ff:0.0.0.msn"]') || {}).innerText)
await L.editText(page, 'ff:0.0.0.msn', 'ZZPEND')
const after = await page.evaluate(() => (document.querySelector('#eWeek [data-txt="ff:0.0.0.msn"]') || {}).innerText)
say('2 mission before/after', [before, after]); say('2 Monday face', fs(await face(page, 0)))
await shot(page, 'S52-03-monday-pending')
const dl = async (sel) => { const [d] = await Promise.all([page.waitForEvent('download', { timeout: 8000 }).catch(() => null), page.locator(sel).click()]); if (!d) return null
  const chunks = []; for await (const c of await d.createReadStream()) chunks.push(c); return { name: d.suggestedFilename(), text: Buffer.concat(chunks).toString('utf8') } }
await go(page, 'editsched'); await sleep(300)
const csv = await dl('#exportSched')
const mon = csv.text.split(/\r?\n/).filter(l => /Monday/.test(l)).slice(0, 3)
say('3 CSV Monday rows', mon); say('3 CSV contains ZZPEND', /ZZPEND/.test(csv.text)); say('3 CSV contains Monday original mission BFM', /"BFM"/.test(csv.text))
await page.locator('#exportPdf').click(); await sleep(1200)
const pr = await page.evaluate(() => { const f = [...document.querySelectorAll('iframe')].filter(x => x.contentDocument); const d = f.length ? f[f.length - 1].contentDocument : null
  return d ? { text: d.body.innerText.replace(/\s+/g, ' ') } : null })
say('4 print: contains ZZPEND', !!pr && /ZZPEND/.test(pr.text)); say('4 print head', pr && pr.text.slice(0, 260))
say('4 print: day stamps', pr && (pr.text.match(/(published schedule|WORKING DRAFT[^.]{0,30}|ORIG|AL\d)/g) || []).slice(0, 12))
say('errors', w.errors); await w.browser.close()
