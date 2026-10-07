const fs = require('fs')
const f = 'C:/Users/User/projects/Raptor/.claude/worktrees/rulings-slim-d391-078ad2/raptor-port/scripts/handpass/bta-B-s25c.mjs'
const lines = fs.readFileSync(f, 'utf8').split('\n')
const i = lines.findIndex(l => l.startsWith("T.done('bta-B-s25c')"))
fs.writeFileSync(f, lines.slice(0, i + 1).join('\n') + '\n')
console.log('kept', i + 1, 'lines')
