from pathlib import Path
import base64
import json
from urllib.parse import quote
root = Path(__file__).resolve().parent
src = root / 'src'
levels = json.loads((src / 'levels.json').read_text())
engine = (src / 'engine.js').read_text().replace('export ', '')
motion = (src / 'motion.js').read_text().replace('export ', '')
layout = (src / 'layout.js').read_text().replace('export ', '')
app = (src / 'app.js').read_text()
game = 'const LEVEL_DATA=' + json.dumps(levels, separators=(',', ':')) + ';\n' + engine + '\n' + motion + '\n' + layout + '\n' + app
html = (src / 'template.html').read_text().replace('/* STYLES */', (src / 'style.css').read_text()).replace('/* GAME */', game).replace('TOTAL_LEVELS', str(len(levels)))
brand = root / 'brand'
svg = lambda name: (brand / name).read_text().strip().replace('<svg ', '<svg aria-hidden="true" focusable="false" ', 1)
html = html.replace('BRAND_MARK', svg('toad.svg')).replace('BRAND_WORDMARK', svg('wordmark.svg'))
html = html.replace('BRAND_FAVICON', 'data:image/svg+xml,' + quote((brand / 'app-icon.svg').read_text(), safe=''))
html = html.replace('BRAND_TOUCH_ICON', 'data:image/png;base64,' + base64.b64encode((brand / 'apple-touch-icon.png').read_bytes()).decode())
for directory in ('dist', 'docs'):
    (root / directory).mkdir(exist_ok=True)
    (root / directory / 'index.html').write_text(html)
(root / 'docs' / 'CNAME').write_text('squared.leolune.fun\n')
(root / 'docs' / '.nojekyll').touch()
print(f'Built standalone game: {len(html.encode()):,} bytes, {len(levels)} levels')
