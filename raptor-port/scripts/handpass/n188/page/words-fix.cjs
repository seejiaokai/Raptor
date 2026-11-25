// Applies the second Fable's word review (chat 187) to the page's D part. Each replacement must match exactly once.
const fs = require('fs');
const p = process.argv[2];
let s = fs.readFileSync(p, 'utf8');
const subs = [
  ['("views 149", "also plans 149")', '("also views 149", "also plans 149")'],
  ['A man with no sign-in opens to the words "No sign-in" in place of the buttons, since access means nothing for him.',
   'A man with no sign-in opens to the words "No sign-in. Ask 142\'s admin to give him one first." in place of the buttons, since access means nothing for him until he has one.'],
  ['a View holder\'s row adds " · views 149" on its second line', 'a View holder\'s row adds " · also views 149" on its second line'],
  ['the words "No sign-in" where the buttons would be, and only "Cancel"', 'the words "No sign-in. Ask 142\'s admin to give him one first." where the buttons would be, and only "Cancel"'],
  ['"A new Jester. 142\'s admin is told when he is added."', '"A new Jester. 142\'s admins are told when you add him."'],
];
for (const [a, b] of subs) {
  const n = s.split(a).length - 1;
  if (n !== 1) { console.log('MATCHES', n, 'for:', a.slice(0, 70)); process.exit(1); }
  s = s.replace(a, () => b);
}
fs.writeFileSync(p, s);
console.log('ok', subs.length);
