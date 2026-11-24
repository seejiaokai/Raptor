// sah-r1-keep — copies re-walker r1's deciding pictures (at most 25) from D:\raptor-work\c152-walk\r1\<run>\ into
// docs/img/handpass/2026-11-23-sans-ahead/r1/, named <run>__<picture> ("taps/" becomes "taps-"). Run from raptor-port/.
import { copyFileSync, mkdirSync, existsSync } from 'node:fs'
import path from 'node:path'
console.log('sah-r1-keep v1')
const RUN = process.env.R1_RUN || 'run1'
const SRC = 'D:/raptor-work/c152-walk/r1/' + RUN
const DST = 'docs/img/handpass/2026-11-23-sans-ahead/r1'
mkdirSync(DST, { recursive: true })
const KEEP = [
  'taps/w81-w81-01-held-desktop.png', 'taps/w81-w81-01-released-desktop.png', 'w81-w81-01-settled-desktop.png',
  'taps/w81-w81-02-released-desktop.png', 'w81-w81-03-settled-desktop.png', 'w81-w81-04-settled-desktop.png',
  'taps/w81-w81-01-released-phone-chromium.png', 'w81-w81-02-settled-phone-chromium.png',
  'w81-w81-05-form-desktop.png', 'w81-w81-05-form-phone-chromium.png',
  'w82-w82-01-list-desktop.png', 'w82-w82-03-rings-desktop.png', 'w82-w82-04-rings-desktop.png',
  'w82-w82-01-list-phone.png', 'w82-w82-03-rings-phone.png',
  'w101-w101-06-clip-desktop.png', 'w101-w101-07-desktop.png', 'w101-w101-09-desktop.png',
  'w101-w101-06-clip-phone.png', 'w101-w101-07-phone.png', 'w101-w101-09-phone.png',
  'w81-pu-02-phone.png', 'w82-pu-bell-escape-bell-phone.png',
]
let n = 0
for (const f of KEEP) {
  const s = path.join(SRC, f)
  if (!existsSync(s)) { console.log('MISSING', f); continue }
  copyFileSync(s, path.join(DST, `${RUN}__${f.replace('/', '-')}`)); n++
}
console.log('kept', n)
