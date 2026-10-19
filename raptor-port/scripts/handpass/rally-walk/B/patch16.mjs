import { readFileSync, writeFileSync } from 'node:fs'
let s = readFileSync('s16.mjs', 'utf8')
const rep = (a, b) => { if (!s.includes(a)) throw new Error('missing: ' + a.slice(0, 40)); s = s.replace(a, () => b) }
rep(`view[1].rBefore === 'none' || view[1].rBefore === 'normal' || view[1].rBefore === '""')`, `['none', 'normal', '""', '" "'].includes(view[1].rBefore))`)
rep(`({ rl: window.DAYS[3].waves[0].formations[1].rl, hist: (window.HIST || window.history_ || []).length })`, `({ rl: window.DAYS[3].waves[0].formations[1].rl || '', undoDisabled: document.getElementById('undoBtn')?.disabled })`)
rep(`({ rl: window.DAYS[3].waves[0].formations[1].rl, active:`, `({ rl: window.DAYS[3].waves[0].formations[1].rl || '', undoDisabled: document.getElementById('undoBtn')?.disabled, shownR: [...document.querySelectorAll('#vWeek .day[data-day="3"] .go:not(.sa) .form')][1]?.querySelector('.bto .rl')?.textContent, active:`)
rep(`!after.rl && after.toast.length === 0 && after.text === ''`, `!after.rl && after.toast.length === 0 && after.shownR === '' && after.undoDisabled === before.undoDisabled`)
writeFileSync('s16.mjs', s)
