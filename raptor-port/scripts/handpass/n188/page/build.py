import re, io, sys
S = sys.argv[1]            # scratch folder
SRC = sys.argv[2]          # the live page.html
OUT = sys.argv[3]          # page-r6.html

def rd(p):
    with io.open(p, encoding='utf-8', newline='') as f:
        return f.read()

orig = rd(SRC).replace('\r\n', '\n').split('\n')
# group B, kept whole: its list rows (lines 132-143) and its sections (lines 438-614), 1-based
blist = '\n'.join(orig[131:143])
bsecs = '\n'.join(orig[437:614])
assert blist.lstrip().startswith('<li class="chg"><a href="#b1">') and blist.rstrip().endswith('</li>'), blist[:80]
assert bsecs.lstrip().startswith('<section id="b1">') and bsecs.rstrip().endswith('</section>'), bsecs[-80:]
assert bsecs.count('<section') == 12 and blist.count('<li') == 12

# D2159: the earlier review's marks are not new this round, so they take the normal colour (words kept whole)
blist = blist.replace('<li class="chg">', '<li>').replace(' <i class="tag">changed in review</i>', '')
n = bsecs.count('<p class="chg"><b>Changed in review.</b>')
assert n == 3, n
bsecs = bsecs.replace('<p class="chg"><b>Changed in review.</b>', '<p class="was"><b>Changed at the earlier review.</b>')

def cut(m):
    src, W, H, x0, y0, w, h, alt = [s.strip() for s in m.group(1).split('|')]
    W, H, x0, y0, w, h = [float(v) for v in (W, H, x0, y0, w, h)]
    assert x0 + w <= W + 0.5 and y0 + h <= H + 0.5, src
    st = 'width:%.2f%%;margin-left:-%.2f%%;margin-top:-%.2f%%' % (W / w * 100, x0 / w * 100, y0 / w * 100)
    return '<span class="cut" style="aspect-ratio:%g/%g"><img src="%s" alt="%s" style="%s"></span>' % (w, h, src, alt.replace('"', '&quot;'), st)

body = rd(S + '/top.html').replace('@@BLIST@@', blist) + rd(S + '/body-n.html') + rd(S + '/body-n2.html') + rd(S + '/body-e.html') + rd(S + '/body-d.html')
body += '\n  <details class="fold" id="gb">\n  <summary>Group B: 12 that wait until after the first build (Logout, Undo, the refresh card). Tap to open.</summary>\n\n' + bsecs + '\n\n  </details>\n</main>\n'
body = re.sub(r'\[\[cut ([^\]]+)\]\]', cut, body)
assert '[[' not in body and '@@' not in body
page = rd(S + '/head.html') + '\n' + body + rd(S + '/tail.html')
page = page.replace('\r\n', '\n')
with io.open(OUT, 'w', encoding='utf-8', newline='\n') as f:
    f.write(page)

# checks: every picture exists; every list link has its section; every Differently has a code
import os
base = os.path.dirname(OUT)
miss = []
for s in re.findall(r'(?:src|poster)="([^"]+)"', page):
    if s.startswith('http'): continue
    s = s.split('#')[0]
    p = s.replace('q2/', '../2026-11-25-msq-pick-guard-q2/', 1) if s.startswith('q2/') else s
    if not os.path.isfile(os.path.join(base, p)): miss.append(s)
ids = set(re.findall(r' id="([^"]+)"', page))
bad = [h for h in re.findall(r'href="#([^"]+)"', page) if h not in ids]
old = set(re.findall(r'(?:src)="([^"]+)"', rd(SRC)))
new = set(re.findall(r'(?:src|poster)="([^"]+)"', page))
print('bytes', len(page.encode('utf-8')), 'missing pictures', miss, 'dead links', bad)
print('pictures on the old page not on the new', sorted(old - new))
print('pictures added', sorted(new - old))
print('sections', len(re.findall(r'<section id=', page)), 'diff buttons', len(re.findall(r'class="diff"', page)))
