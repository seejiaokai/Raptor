/* Colour arithmetic for the AL colours page: sRGB, WCAG contrast, CIEDE2000, OKLCH, and the Machado (2009) colour-blind
   simulation at full strength. No dependency. */
export const hex2rgb = h => { h = h.replace('#', ''); return [0, 2, 4].map(i => parseInt(h.slice(i, i + 2), 16)) }
export const rgb2hex = r => '#' + r.map(v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('').toUpperCase()
const lin = v => { v /= 255; return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4 }
const unlin = v => 255 * (v <= 0.0031308 ? 12.92 * v : 1.055 * Math.max(v, 0) ** (1 / 2.4) - 0.055)
export const lum = h => { const [r, g, b] = hex2rgb(h).map(lin); return 0.2126 * r + 0.7152 * g + 0.0722 * b }
export const contrast = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05) }
export function lab(h) {
  const [r, g, b] = hex2rgb(h).map(lin)
  let x = (0.4124564 * r + 0.3575761 * g + 0.1804375 * b) / 0.95047, y = 0.2126729 * r + 0.7151522 * g + 0.072175 * b, z = (0.0193339 * r + 0.119192 * g + 0.9503041 * b) / 1.08883
  const f = t => t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116
  x = f(x); y = f(y); z = f(z)
  return [116 * y - 16, 500 * (x - y), 200 * (y - z)]
}
export function de00(h1, h2) {
  const [L1, a1, b1] = lab(h1), [L2, a2, b2] = lab(h2), rad = Math.PI / 180
  const C1 = Math.hypot(a1, b1), C2 = Math.hypot(a2, b2), Cb = (C1 + C2) / 2
  const G = 0.5 * (1 - Math.sqrt(Cb ** 7 / (Cb ** 7 + 25 ** 7)))
  const a1p = (1 + G) * a1, a2p = (1 + G) * a2, C1p = Math.hypot(a1p, b1), C2p = Math.hypot(a2p, b2)
  const hp = (b, a) => { if (!a && !b) return 0; const h = Math.atan2(b, a) / rad; return h < 0 ? h + 360 : h }
  const h1p = hp(b1, a1p), h2p = hp(b2, a2p)
  const dL = L2 - L1, dC = C2p - C1p
  let dh = 0; if (C1p * C2p) { dh = h2p - h1p; if (dh > 180) dh -= 360; else if (dh < -180) dh += 360 }
  const dH = 2 * Math.sqrt(C1p * C2p) * Math.sin(dh / 2 * rad)
  const Lb = (L1 + L2) / 2, Cbp = (C1p + C2p) / 2
  let hb = h1p + h2p; if (C1p * C2p) { hb = Math.abs(h1p - h2p) <= 180 ? (h1p + h2p) / 2 : (h1p + h2p < 360 ? (h1p + h2p + 360) / 2 : (h1p + h2p - 360) / 2) }
  const T = 1 - 0.17 * Math.cos((hb - 30) * rad) + 0.24 * Math.cos(2 * hb * rad) + 0.32 * Math.cos((3 * hb + 6) * rad) - 0.2 * Math.cos((4 * hb - 63) * rad)
  const dth = 30 * Math.exp(-(((hb - 275) / 25) ** 2)), Rc = 2 * Math.sqrt(Cbp ** 7 / (Cbp ** 7 + 25 ** 7))
  const Sl = 1 + 0.015 * (Lb - 50) ** 2 / Math.sqrt(20 + (Lb - 50) ** 2), Sc = 1 + 0.045 * Cbp, Sh = 1 + 0.015 * Cbp * T
  const Rt = -Math.sin(2 * dth * rad) * Rc
  return Math.sqrt((dL / Sl) ** 2 + (dC / Sc) ** 2 + (dH / Sh) ** 2 + Rt * (dC / Sc) * (dH / Sh))
}
export const CVD = {
  protan: [[0.152286, 1.052583, -0.204868], [0.114503, 0.786281, -0.100784], [-0.003882, -0.048116, 1.051998]],
  deutan: [[0.367322, 0.860646, -0.227968], [0.280085, 0.672501, 0.047413], [-0.01182, 0.04294, 0.968881]],
}
export function sim(h, kind) {
  if (!kind || kind === 'normal') return h
  const m = CVD[kind], c = hex2rgb(h).map(lin)
  return rgb2hex(m.map(row => unlin(Math.max(0, Math.min(1, row[0] * c[0] + row[1] * c[1] + row[2] * c[2])))))
}
export function oklch2hex(L, C, h) {
  const a = C * Math.cos(h * Math.PI / 180), b = C * Math.sin(h * Math.PI / 180)
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3, m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3, s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3
  const rgb = [4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s, -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s, -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s]
  if (rgb.some(v => v < -0.0005 || v > 1.0005)) return null
  return rgb2hex(rgb.map(unlin))
}
/* the smallest difference between two colours across normal sight and both red-green simulations */
export const worst = (a, b) => Math.min(de00(a, b), de00(sim(a, 'deutan'), sim(b, 'deutan')), de00(sim(a, 'protan'), sim(b, 'protan')))
