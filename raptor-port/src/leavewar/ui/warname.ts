/* THE NEW LEAVE WAR'S NAME FROM ITS DATES (his D2158, 17 Nov 26 — [LW-WAR-AUTONAME]). The "New leave war" window's Name
   fills itself in the form the periods already carry (the seed's "JAN - DEC 26"): the start and end months in capitals, a
   spaced hyphen, the two-digit year — "JAN - MAR 27"; one month alone "JAN 27"; across a year's end each month with its
   year, "DEC 26 - FEB 27". Days inside a month play no part: 15 Jan to 10 Mar is still "JAN - MAR". */

const MON = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']

/** "YYYY-MM-DD" → its month's three letters and the two-digit year; null for anything else */
function monthYear(iso: string): { m: string; y: string } | null {
  const hit = /^(\d{4})-(\d{2})-\d{2}$/.exec(iso)
  if (!hit) return null
  const m = MON[Number(hit[2]) - 1]
  return m ? { m, y: hit[1]!.slice(2) } : null
}

/** the name a war over these dates is given by itself — '' until both dates are picked */
export function warAutoName(from: string, to: string): string {
  const a = monthYear(from), b = monthYear(to)
  if (!a || !b) return ''
  if (a.y !== b.y) return `${a.m} ${a.y} - ${b.m} ${b.y}`
  if (a.m === b.m) return `${a.m} ${a.y}`
  return `${a.m} - ${b.m} ${b.y}`
}
