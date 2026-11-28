import os, re, shutil, sys

SRC = os.path.expandvars(r'%TEMP%\bellpage.html')
REPO = r'C:\Users\User\projects\Raptor-words\raptor-port\docs'
PICS = os.path.join(REPO, 'img', 'handpass', '2026-11-24-words-r4')
OUT = os.path.join(REPO, 'mock', '2026-11-24-words-r4')
PUB = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'words-r4')

bell = open(SRC, encoding='utf-8').read()
style = re.search(r'<style>.*?</style>', bell, re.S).group(0)
style = style.replace('/* Layout: one reading column, the eight decisions first, then each with its real bell, then every line by area. The app\'s own dark. */',
                      '/* Layout: one reading column, the four decisions first, then each with its real screen, then what is fixed without a question. The app\'s own dark. */')
script = bell[bell.rfind('<script'):bell.rfind('</script>') + 9]


def fig(name, cap):
    return ('<figure><button type="button" class="zoom" data-src="img/%s" aria-label="Enlarge: %s">'
            '<img src="img/%s" alt="%s" loading="lazy"></button><figcaption>%s</figcaption></figure>') % (name, cap, name, cap, cap)


def pics(*pairs):
    return '<div class="pics">' + ''.join(fig(n, c) for n, c in pairs) + '</div>'


def row(cls, dt, dd):
    return '<div%s><dt>%s</dt><dd>%s</dd></div>' % (' class="%s"' % cls if cls else '', dt, dd)


html = []
html.append('<title>Words Round 4</title>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width,initial-scale=1">\n<meta name="claude:viewport-fit-sides" content="cover">\n')
html.append(style + '\n<main id="top">\n')
html.append('<h1>The words pass, round 4: the bell\'s everyday lines and two messages</h1>\n')
html.append('<p class="lead"><b>Nothing in the app has changed. These are drawings for you to approve.</b> '
            'Each "Today" picture is the real app. Each "New" picture is that same screen with only the words changed, and the new words are ringed in green. '
            'The bell pictures are at iPhone size. Tap any picture to enlarge it.</p>\n')

html.append('<div class="asks">\n<h2>What to look at now: four questions</h2>\n<ol>'
            '<li><a href="#q1"><b>1. When an input is changed to another kind, should the bell say what it changed to, where it says "Renamed" today?</b></a>'
            '<span class="rec">I recommend: Yes. "LL changed to OL" says what happened; nothing was renamed.</span></li>'
            '<li><a href="#q2"><b>2. When a leave is made a half day, should the bell say AM or PM, where it prints clock times today?</b></a>'
            '<span class="rec">I recommend: Yes. "Now LL (AM)", the way the rest of the app writes a half day.</span></li>'
            '<li><a href="#q3"><b>3. When more than two things change in one save, should the bell say that more changed?</b></a>'
            '<span class="rec">I recommend: A, add "and 1 more change". Today the third change is never mentioned.</span></li>'
            '<li><a href="#q4"><b>4. Two messages read differently depending on how you got to them. Should each be given one wording?</b></a>'
            '<span class="rec">I recommend: Yes to both. Same mistake, same words.</span></li>'
            '</ol>\n</div>\n')

html.append('<div class="gaps">\n<h2>Fixed with this round unless you object</h2>\n<ul>'
            '<li>Four small slips in wording, shown <a href="#slips" style="color:var(--cyan)">at the foot of this page</a>. They need no decision, but say so if you disagree with any.</li>'
            '</ul>\n</div>\n')

# Q1
html.append('<section id="q1">\n<h3><span class="qn">Question 1</span> When an input is changed to another kind, should the bell say what it changed to, where it says "Renamed" today?</h3>\n'
            '<p class="eg">Saber opens Ranger\'s LL on Wed 15 Jul on the Inputs page and changes it to OL. Ranger opens the bell.</p>\n<dl>'
            + row('', 'Today', 'Ranger\'s bell shows "OL · Wed 15 Jul", then "Renamed — was LL · Saber". Nothing was renamed: the kind of leave changed.')
            + row('new', 'New', 'It would show "LL changed to OL · Saber". The same for any kind, for example "Training changed to Meeting · Saber".')
            + row('rc', 'I recommend', '<b>Yes.</b> The Leave War\'s own bell line already says it this way: "LL bid changed to OL · Saber". '
                  '"Renamed" stays for a real rename, for example "Renamed — was Training". The new line is one word longer than today\'s (4 words for 3).')
            + '</dl>\n' + pics(('q1-phone-bell-today.png', 'Today, iPhone'), ('q1-phone-bell-after.png', 'New, iPhone')) + '\n</section>\n')

# Q2
html.append('<section id="q2">\n<h3><span class="qn">Question 2</span> When a leave is made a half day, should the bell say AM or PM, where it prints clock times today?</h3>\n'
            '<p class="eg">Saber changes Ranger\'s LL on Wed 15 Jul from the whole day to the morning only. Ranger opens the bell.</p>\n<dl>'
            + row('', 'Today', 'Ranger\'s bell shows "LL · Wed 15 Jul", then "Now 00:00–12:00 am · Saber". For the afternoon it shows "Now 12:01–23:59 pm · Saber".')
            + row('new', 'New', 'It would show "Now LL (AM) · Saber", or "Now LL (PM) · Saber" for the afternoon. If the day moves as well: "Now Thu 16 Jul (AM) · Saber". '
                  'For an input that has a title: "Now AM · Saber".')
            + row('rc', 'I recommend', '<b>Yes.</b> On 30 Oct you chose AM and PM after the code, "LL (AM)", wherever the Leave War writes a half day. '
                  'This carries the same form over to the bell line a change on the Inputs page makes, which that answer did not cover. '
                  'The clock times go: they only ever meant "the morning half". The new line is no longer than today\'s.')
            + '</dl>\n' + pics(('q2-phone-bell-today.png', 'Today, iPhone'), ('q2-phone-bell-after.png', 'New, iPhone')) + '\n</section>\n')

# Q3
html.append('<section id="q3">\n<h3><span class="qn">Question 3</span> When more than two things change in one save, should the bell say that more changed?</h3>\n'
            '<p class="eg">In one save Saber moves "Training" from Wed 15 to Thu 16 Jul, renames it "Range brief" and changes its remark. Ranger is in it and opens the bell.</p>\n<dl>'
            + row('', 'Today', 'Ranger\'s bell shows "Range brief · Thu 16 Jul", then "Now Thu 16 Jul, Renamed — was Training · Saber". '
                  'The changed remark is never mentioned, and nothing shows that more changed. The bell only ever says the first two changes. '
                  'That limit was my choice when the bell was built; you were not asked.')
            + row('new', 'A', '"Now Thu 16 Jul, renamed — was Training, and 1 more change · Saber" ("and 2 more changes" for two). '
                  'It takes two lines on an iPhone, where today\'s takes one.')
            + row('new', 'B', 'Say every change: "Now Thu 16 Jul, renamed — was Training, remark changed · Saber". Also two lines here, and longer with each further change.')
            + row('', 'C', 'Leave it as today.')
            + row('rc', 'I recommend', '<b>A.</b> The line stays short, Ranger is told that more changed, and a tap opens the input as it now stands. '
                  'With A or B, a word after a comma starts with a small letter ("renamed", "now") unless it is a name.')
            + '</dl>\n' + pics(('q3-phone-bell-today.png', 'Today, iPhone'), ('q3-phone-bell-after-a.png', 'A, iPhone'), ('q3-phone-bell-after-b.png', 'B, iPhone')) + '\n</section>\n')

# Q4
html.append('<section id="q4">\n<h3><span class="qn">Question 4</span> Two messages read differently depending on how you got to them. Should each be given one wording?</h3>\n'
            '<h4>A time the app cannot read</h4>\n'
            '<p class="eg">Saber types 2560 into a take-off box on Edit Schedule. Then Saber types 2560 into the start time on an input\'s row on the schedule.</p>\n<dl>'
            + row('', 'Today', 'The take-off box answers "2560 is not a time. Try 0900 or 09:00." The input\'s row answers "That is not a time — try 0900 or 09:00".')
            + row('new', 'New', 'Both answer "2560 is not a time. Try 0900 or 09:00." It names what was typed and has no dash.')
            + '</dl>\n' + pics(('q4a-1-schedule-time-today.png', 'Today, a take-off box'), ('q4a-2-input-time-today.png', 'Today, an input\'s row'), ('q4a-2-input-time-after.png', 'New, an input\'s row'))
            + '\n<h4>Someone put on the seat they already hold</h4>\n'
            '<p class="eg">Saber drags Ranger onto the seat Ranger already holds. Separately, Saber taps the ALL AVAIL placeholder onto a seat it already holds.</p>\n<dl>'
            + row('', 'Today', 'The drag answers "Already in that seat". The tap answers "ALL AVAIL — already in that seat". (A tap can only do this with a placeholder, never with a person.)')
            + row('new', 'New', 'Both name who it is: "Ranger — already in that seat".')
            + row('rc', 'I recommend', '<b>Yes to both.</b> The dash in the seat message stays for this round. It belongs to a family of seat messages that all read '
                  '"Ranger — reason", and they are better changed together when the dashes are looked at.')
            + '</dl>\n' + pics(('q4b-2-drag-today.png', 'Today, by a drag'), ('q4b-1-tap-today.png', 'Today, by a tap'), ('q4b-2-drag-after.png', 'New, by a drag')) + '\n</section>\n')

# slips
html.append('<h2 id="slips">Fixed with this round unless you object: four slips</h2>\n')
html.append('<section>\n<h3>A lost capital letter</h3>\n<p class="eg">Saber saves how far ahead the Inputs page opens for everyone.</p>\n<dl>'
            + row('', 'Today', '"Everyone now opens on next 4 weeks, to sunday"')
            + row('new', 'New', '"Everyone now opens on the next 4 weeks, to Sunday"')
            + '</dl>\n' + pics(('s1-lookahead-today.png', 'Today'), ('s1-lookahead-after.png', 'New')) + '\n</section>\n')
html.append('<section>\n<h3>One message, two wordings: no Leave War period</h3>\n'
            '<p class="eg">Saber publishes a Saturday in a year that has no Leave War period yet. (The demo has periods for 2026 and 2027, so the picture says 2028.)</p>\n<dl>'
            + row('', 'Today', 'After publishing: "Saturday published and approved · there is no leave war period for 2028, so no OIL can be earned for this day — create the period on the Leave War". '
                  'But when a man is put on that same Saturday, the app already says it better: "No Leave War period for 2028, so no OIL can be earned for this day. Create the period on the Leave War."')
            + row('new', 'New', 'After publishing it uses that same sentence: "Saturday published and approved. No Leave War period for 2028, so no OIL can be earned for this day. Create the period on the Leave War."')
            + '</dl>\n' + pics(('s2-no-period-today.png', 'Today, after publishing'), ('s2-0-plant-note-today.png', 'Today, the sentence the app already uses elsewhere')) + '\n</section>\n')
html.append('<section>\n<h3>Two more, with no picture</h3>\n<dl>'
            + row('', 'Capitals', '"leave war period" is written in small letters in three places. It becomes "Leave War period", the app\'s own name: '
                  '"Only a scheduler can create a Leave War period", "The 2026 Leave War period is created. Open its dates for bidding here.", and the hint on the "Create the 2026 period" button.')
            + row('', 'One odd refusal', '"Only a scheduler answers from this list" becomes "Only a scheduler can answer from this list", like its thirteen relatives ("Only a scheduler can accept inputs"). '
                  'Nobody can reach this message through the screen today, so there is no picture of it.')
            + '</dl>\n</section>\n')

html.append('<div class="gaps">\n<h2>Left for later rounds</h2>\n<ul>'
            '<li>One wording for a save that failed. There are seven today. The commonest is already in a question the two-squadron chat is putting to you, so this waits for your answer there.</li>'
            '<li>The dashes: 103 messages join two thoughts with a dash. They come area by area.</li>'
            '<li>Three more cases where the bell says "Renamed": an input given a title, a title removed, and an Attach whose "To" changed.</li>'
            '</ul>\n</div>\n')
html.append('</main>\n<div id="big" hidden tabindex="-1" role="dialog" aria-label="Enlarged picture"><img alt=""></div>\n' + script + '\n')

page = ''.join(html)
for d in (OUT, PUB):
    os.makedirs(os.path.join(d, 'img'), exist_ok=True)
    with open(os.path.join(d, 'index.html'), 'w', encoding='utf-8', newline='') as f:
        f.write(page)
    for n in sorted(set(re.findall(r'img/([\w.-]+\.png)', page))):
        shutil.copyfile(os.path.join(PICS, n), os.path.join(d, 'img', n))
print('ok', len(page), sorted(set(re.findall(r'img/([\w.-]+\.png)', page))))
m = re.search(r'<div id="big"[^>]*>.*?</div>', bell, re.S)
print('bell big:', m.group(0)[:200] if m else None)
