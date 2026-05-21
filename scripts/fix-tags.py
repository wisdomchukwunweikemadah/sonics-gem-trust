import pathlib

root = pathlib.Path(__file__).resolve().parent.parent
files = [
    root / 'frontend/pages/settings.html',
    root / 'frontend/pages/admin.html',
    root / 'frontend/assets/js/app.js',
]

for path in files:
    text = path.read_text(encoding='utf-8')
    text = text.replace('DIVTAG', 'div')
    text = text.replace("createElement('motion')", "createElement('div')")
    path.write_text(text, encoding='utf-8')
    print('fixed', path.name)
