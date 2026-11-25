// Puts the round-5 redraws on the page (chat 187): new figures after named ones, first-way captions relabelled,
// the drawer's notes removed. Each anchor must match exactly once.
const fs = require('fs');
const dir = process.argv[2];
const fig = (src, alt, cap, tall) =>
  `\n      <figure${tall ? ' class="tall"' : ''}><img src="drawn/${src}" alt="${alt}"><figcaption>${cap}</figcaption></figure>`;
function after(s, anchor, add) {
  const n = s.split(anchor).length - 1;
  if (n !== 1) throw new Error('anchor x' + n + ': ' + anchor);
  const at = s.indexOf(anchor);
  const end = s.indexOf('</figure>', at) + '</figure>'.length;
  return s.slice(0, end) + add + s.slice(end);
}
function swap(s, a, b) {
  const n = s.split(a).length - 1;
  if (n !== 1) throw new Error('swap x' + n + ': ' + a);
  return s.replace(a, () => b);
}
const strip = s => s.replace(/\n[ \t]*<!-- DRAWER[\s\S]*?-->/g, '');

let e = fs.readFileSync(dir + '/body-e.html', 'utf8');
e = after(e, 'src="drawn/e3b2-d-bell-crop.png"',
  fig('e3b3-d-bell-crop.png', "Saber's bell, all three squadrons on: 149 first, then Hunter with 142",
    '<b>Drawn</b>: on a bell that shows several squadrons, the line wears two grey numbers: 149 first (whose line it is), and 142 after Hunter\'s name (where he is from).') +
  fig('e3b3-p-bell-crop.png', 'The same on a phone', '<b>Drawn, phone</b>.', true));
const eStripped = strip(e);
console.log('E notes removed', e.length - eStripped.length > 0);
fs.writeFileSync(dir + '/body-e.html', eStripped);

let d = fs.readFileSync(dir + '/body-d.html', 'utf8');
// D5: the recommended way
d = after(d, 'src="drawn/e4b-p-opened-crop.png"',
  fig('e4b-d-opened-r-crop.png', 'Short rows; Blade opened to the one 149 line with Save and Cancel; Bolt also views 149',
    '<b>Drawn, recommended</b>: short rows; Blade (a 142 admin) opened to his one 149 line, with Save and Cancel; Bolt\'s row says "also views 149".') +
  fig('e4b-p-opened-r-crop.png', 'The same on a phone', '<b>Drawn, recommended, phone</b>.', true) +
  fig('e4b2-d-opened-crop.png', 'Basher opened: No sign-in. Ask 142\'s admin to give him one first.',
    '<b>Drawn, recommended</b>: a man with no sign-in opened: "No sign-in. Ask 142\'s admin to give him one first." and Cancel.') +
  fig('e4b3-d-opened-crop.png', 'Ranger opened: Plan greyed, Plan is for admins only.',
    '<b>Drawn, recommended</b>: a 142 member opened: Plan greyed, "Plan is for admins only."'));
// D8: the recommended way beside the first
d = swap(d, '<figcaption><b>Drawn</b>: "142 has an archived Jester: Pilot, CAT B, archived 25 Nov 26. Is this him?"</figcaption>',
  '<figcaption><b>Drawn, the first way</b>: "142 has an archived Jester: Pilot, CAT B, archived 25 Nov 26. Is this him?"</figcaption>');
d = swap(d, 'alt="Phone"><figcaption><b>Drawn, phone</b>.</figcaption></figure>\n      <figure><img src="drawn/e6b-d-archived-many-crop.png"',
  'alt="Phone"><figcaption><b>Drawn, the first way, phone</b>.</figcaption></figure>\n      <figure><img src="drawn/e6b-d-archived-many-crop.png"');
d = after(d, 'src="drawn/e6a-p-archived-crop.png"',
  fig('e6a-d-archived-r-crop.png', 'Someone new; Add person greyed with Answer Is this him? first.',
    '<b>Drawn, recommended</b>: "Someone new" answers the question; "Add person" greyed, its reason under it: "Answer “Is this him?” first."') +
  fig('e6a-p-archived-r-crop.png', 'The same on a phone', '<b>Drawn, recommended, phone</b>.', true) +
  fig('e6a2-d-after-crop.png', 'After Someone new: A new Jester. 142\'s admins are told when you add him.',
    '<b>Drawn, recommended</b>: after "Someone new": "A new Jester. 142\'s admins are told when you add him." and "Add person" live.'));
d = after(d, 'src="drawn/e6b-d-archived-many-crop.png"',
  fig('e6b2-d-after-crop.png', 'Two archived Aces answered: 142\'s and 150\'s admins are told',
    '<b>Drawn</b>: two squadrons, after "Someone new": "A new Ace. 142\'s and 150\'s admins are told when you add him."'));
d = swap(d, '<figcaption><b>Drawn</b>: "Ranger is already taken on 142".</figcaption>',
  '<figcaption><b>Drawn, the first way</b>: "Ranger is already taken on 142" at the foot.</figcaption>');
d = after(d, 'src="drawn/e6d-d-taken-crop.png"',
  fig('e6d-d-taken-r-crop.png', 'Ranger is already taken on 142, under the callsign box',
    '<b>Drawn, recommended</b>: the same words under the callsign box, where the other note stands.'));
// D10
d = swap(d, '<figcaption><b>Drawn, phone</b>: "Signed in as Hunter · View only".</figcaption>',
  '<figcaption><b>Drawn, the first way, phone</b>: "Signed in as Hunter · View only", the switch still in the menu.</figcaption>');
d = after(d, 'src="drawn/e8-p-menu-crop.png"',
  fig('e8-d-badge-r-crop.png', 'Hunter · View only as plain words', '<b>Drawn, recommended</b>: on 150 the badge is plain words, not a button.') +
  fig('e8-p-menu-r-crop.png', 'Phone menu without Switch to the member view',
    '<b>Drawn, recommended, phone</b>: the menu\'s Account block with no "Switch to the member view" on 150.', true));
// D11, D12
d = after(d, 'src="drawn/e9-d-greyed-crop.png"',
  fig('e9-p-greyed-crop.png', 'The same on a phone', '<b>Drawn, phone</b>.', true));
d = after(d, 'src="drawn/e11-d-plannedby-crop.png"',
  fig('e11b-d-chosen-crop.png', 'The PLANNED BY box after choosing: Hunter · 142',
    '<b>Drawn</b>: after choosing, the box reads "Hunter · 142". Today a signed box shows the callsign alone, so "· 142" is new here.'));
const dStripped = strip(d);
console.log('D notes removed', d.length - dStripped.length > 0, (dStripped.match(/DRAWER/g) || []).length);
fs.writeFileSync(dir + '/body-d.html', dStripped);
console.log('ok');
