"""Arma index.html: sitio público (build/sitio_base.html) + portal admin v3."""
import glob, re, pathlib
R = pathlib.Path(__file__).parent
base = (R/'build/sitio_base.html').read_text(encoding='utf-8')
js = ''.join(p.read_text(encoding='utf-8') for p in sorted(R.glob('src/*.js')))
(R/'admin/admin.js').write_text(js, encoding='utf-8')
html = (R/'admin/admin.html').read_text(encoding='utf-8')
css_v3 = (R/'admin/admin_v3.css').read_text(encoding='utf-8')

# 1) HTML del admin
a = base.find('<!-- ================= PORTAL ADMINISTRATIVO')
b = base.find('<script>\n  var PAGES', a)
assert a > 0 and b > a
base = base[:a] + html + base[b:]
# 2) JS del admin
s = base.find('/* ================= PORTAL ADMINISTRATIVO v2 ================= */')
e = base.find('</script>', s)
assert s > 0 and e > s
base = base[:s] + js.replace('</script', '<\\/script') + base[e:]
# 3) CSS v3 (se agrega después del CSS v2 del admin)
c = base.find('/* =====================================================================\n   PORTAL ADMINISTRATIVO v2')
d = base.find('</style>', c)
assert c > 0 and d > c
base = base[:d] + css_v3 + base[d:]
(R/'index.html').write_text(base, encoding='utf-8')
print('index.html', round(len(base)/1e6, 2), 'MB · admin.js', round(len(js)/1e3), 'KB')
