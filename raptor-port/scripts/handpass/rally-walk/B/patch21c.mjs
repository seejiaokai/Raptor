import { readFileSync, writeFileSync } from 'node:fs'
let s = readFileSync('s21c.mjs', 'utf8')
s = s.replace("console.log('B s21 v1", "console.log('B s21c v1 CONTROL (typed TO and MSN, not R/B)").replace("const rd = async p => { const m = await model(p, 3, 0, 0); return { rl: m.rl || '', br: m.br || '' } }", "const rd = async p => ({ to31: await p.evaluate(() => window.DAYS[3].waves[0].formations[1].to), msn30: await p.evaluate(() => window.DAYS[3].waves[0].formations[0].msn) })").replace("rec('S21'", "rec('S21-control'").replace("finish('s21')", "finish('s21c')").replace("B21-tabB", "B21c-tabB")
writeFileSync('s21c.mjs', s)
