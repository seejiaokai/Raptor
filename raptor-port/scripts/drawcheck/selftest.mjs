// The drawing check's self-test (D1494): each kind of difference M5a's walk found by eye, and each look that must NOT
// count as a difference, fed to the comparing as made-up measurements. Run after any change to the check:
//   cd raptor-port ; node scripts/drawcheck/selftest.mjs        (exits 1 on a miss)
// A check that stops catching one of these would pass every build in silence — this is what proves it still sees.
import { compare } from './compare.mjs'

console.log('[drawcheck selftest v1]')
const look = (o = {}) => ({ fill: 'rgba(0, 0, 0, 0)', image: '', edge: Array(4).fill('0px none rgb(0, 0, 0)'), corners: ['0px', '0px', '0px', '0px'], shadow: 'none',
  color: 'rgb(241, 244, 247)', align: 'start', justify: 'normal', font: '400 13px', spacing: 'normal', ...o })
const part = (box, o = {}) => ({ found: true, box: { x: 0, y: 0, w: 100, h: 20, ...box }, ink: o.ink === undefined ? { x: (box.x ?? 0) + 4, y: (box.y ?? 0) + 3, w: 40, h: 14 } : o.ink,
  text: o.text ?? 'Ranger', typed: !!o.typed, look: look(o.look) })
const cases = [
  // must differ — M5a's seven, by kind
  { name: 'A: the window 136px lower', want: ['place'], p: { check: ['place', 'width'] }, D: part({ x: 948, y: 64, w: 560 }), B: part({ x: 948, y: 200, w: 560 }) },
  { name: 'B: a flat row become a rounded card with a cyan left bar', want: ['edge', 'corners'], p: { check: ['edge', 'corners'] },
    D: part({}), B: part({}, { look: { edge: ['1px solid rgb(42, 49, 58)', '1px solid rgb(42, 49, 58)', '1px solid rgb(42, 49, 58)', '3px solid rgb(59, 198, 232)'], corners: ['12px', '12px', '12px', '12px'] } }) },
  { name: 'C: the switch 47px narrower, its fill gone', want: ['width', 'fill'], p: { check: ['size', 'fill'] },
    D: part({ w: 218, h: 36 }, { look: { fill: 'rgba(20, 24, 29, 0.5)' } }), B: part({ w: 171, h: 36 }) },
  { name: 'D: a name centred where it was set left', want: ['words-x'], p: { check: ['words-x'] },
    D: part({ x: 31, w: 74 }, { ink: { x: 36, y: 3, w: 30, h: 12 } }), B: part({ x: 31, w: 74 }, { ink: { x: 53, y: 3, w: 30, h: 12 }, look: { align: 'center' } }) },
  { name: 'E: an amber figure 2.6px below its row\'s line', want: ['words-y'], p: { check: ['words-y'], rel: 'fig' },
    D: part({}, { ink: { x: 0, y: 448, w: 14, h: 15 } }), B: part({}, { ink: { x: 0, y: 450.6, w: 14, h: 15 } }),
    Drel: part({}, { ink: { x: 0, y: 448, w: 8, h: 15 } }), Brel: part({}, { ink: { x: 0, y: 448, w: 8, h: 15 } }) },
  { name: 'F: a hyphen where the drawing has an en dash', want: ['text'], p: { check: ['text'] }, D: part({}, { text: 'JAN – DEC 26' }), B: part({}, { text: 'JAN - DEC 26' }) },
  { name: 'a read-only figure 10px further right in its row', want: ['words-place'], p: { check: ['words-place'], rel: 'row' },
    D: part({ x: 137, w: 54 }, { ink: { x: 165, y: 492, w: 16, h: 19 }, look: { align: 'right' } }), B: part({ x: 137, w: 54 }, { ink: { x: 175, y: 492, w: 16, h: 19 }, look: { align: 'right' } }),
    Drel: part({ x: 0, y: 477 }), Brel: part({ x: 0, y: 477 }) },
  // must NOT differ
  { name: 'G: the same window 2px off (within the tolerance)', want: [], p: { check: ['place', 'size'] }, D: part({ x: 830, y: 191, w: 470, h: 350 }), B: part({ x: 828, y: 191, w: 470, h: 350 }) },
  { name: 'two see-through fills of different colours', want: [], p: { check: ['fill'] }, D: part({}, { look: { fill: 'rgba(0, 0, 0, 0)' } }), B: part({}, { look: { fill: 'rgba(255, 255, 255, 0)' } }) },
  { name: 'a drawn "+36" set right by another rule, and a typed box set right — same place', want: [], p: { check: ['words-x'] },
    D: part({ x: 1127, w: 130 }, { ink: { x: 1225, y: 4, w: 24, h: 14 }, look: { align: 'start' } }), B: part({ x: 1127, w: 130 }, { typed: true, ink: { x: 1224.5, y: 4, w: 24, h: 14 }, look: { align: 'right' } }) },
  { name: 'an edge of no width in two colours', want: [], p: { check: ['edge'] }, D: part({}, { look: { edge: Array(4).fill('0px solid rgb(1, 2, 3)') } }), B: part({}) },
  { name: 'a whole row moved down the page, its parts judged inside it', want: [], p: { check: ['place'], rel: 'row' },
    D: part({ x: 20, y: 456 }), B: part({ x: 20, y: 462 }), Drel: part({ x: 0, y: 436 }), Brel: part({ x: 0, y: 442 }) },
]
let bad = 0
for (const c of cases) {
  const p = { name: 'p', ...c.p }
  const got = [...new Set(compare(p, c.D, c.B, c.Drel, c.Brel, 2).map(d => d.check))]
  const want = c.want
  const ok = want.length === got.length && want.every(w => got.includes(w))
  if (!ok) bad++
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${c.name} — wanted [${want.join(', ')}], got [${got.join(', ')}]`)
}
console.log(bad ? `${bad} FAILED` : `all ${cases.length} PASS`)
process.exit(bad ? 1 : 0)
