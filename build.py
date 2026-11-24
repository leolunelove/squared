from pathlib import Path
import json
root = Path(__file__).resolve().parent
src = root / 'src'
levels = json.loads((src / 'levels.json').read_text())
engine = (src / 'engine.js').read_text().replace('export ', '')
motion = (src / 'motion.js').read_text().replace('export ', '')
app = (src / 'app.js').read_text()
game = 'const LEVEL_DATA=' + json.dumps(levels, separators=(',', ':')) + ';\n' + engine + '\n' + motion + '\n' + app
html = (src / 'template.html').read_text().replace('/* STYLES */', (src / 'style.css').read_text()).replace('/* GAME */', game).replace('TOTAL_LEVELS', str(len(levels)))
for directory in ('dist', 'docs'):
    (root / directory).mkdir(exist_ok=True)
    (root / directory / 'index.html').write_text(html)
(root / 'docs' / 'CNAME').write_text('squared.leolune.fun\n')
(root / 'docs' / '.nojekyll').touch()
print(f'Built standalone game: {len(html.encode()):,} bytes, {len(levels)} levels')
