import os
import re

PAGES_DIR = os.path.join(os.path.dirname(__file__), '..', 'frontend', 'pages')
API_META = '  <meta name="sgt-api-base" content="https://dole-embolism-trustless.ngrok-free.dev/api" />'
ENHANCE_CSS = '  <link rel="stylesheet" href="../assets/css/enhancements.css" />'

RUNTIME_SCRIPTS = [
    '../assets/js/runtime-config.js?v=3',
    '../assets/js/env.generated.js?v=3',
    '../assets/js/config.js?v=3',
]

DASHBOARD_PAGES = {
    'dashboard.html', 'transactions.html', 'settings.html', 'admin.html',
    'market.html', 'about.html',
}


def patch_file(path):
    with open(path, encoding='utf-8') as f:
        content = f.read()

    name = os.path.basename(path)

    if 'sgt-api-base' not in content:
        content = re.sub(
            r'(<meta name="viewport"[^>]*>)',
            r'\1\n' + API_META,
            content,
            count=1,
        )

    if name in DASHBOARD_PAGES and 'enhancements.css' not in content:
        content = content.replace(
            '<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/toastify-js',
            ENHANCE_CSS + '\n  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/toastify-js',
        )

    for script in RUNTIME_SCRIPTS:
        if script.split('?')[0] not in content:
            content = content.replace(
                '<script src="https://cdn.jsdelivr.net/npm/toastify-js"></script>',
                '<script src="https://cdn.jsdelivr.net/npm/toastify-js"></script>\n'
                + '\n'.join(f'  <script src="../assets/js/{s.split("/")[-1]}"></script>' for s in RUNTIME_SCRIPTS),
                1,
            )
            break

    for old in ['env.generated.js', 'config.js']:
        content = re.sub(
            rf'\s*<script src="\.\./assets/js/{old}[^"]*"></script>\n?',
            '',
            content,
        )

    content = re.sub(r'\?v=3', '?v=3', content)
    for script in ['notifications.js', 'theme.js', 'app.js']:
        content = re.sub(
            rf'<script src="\.\./assets/js/{script}"></script>',
            f'<script src="../assets/js/{script}?v=3"></script>',
            content,
        )

    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)
    print('Patched', name)


for fname in os.listdir(PAGES_DIR):
    if fname.endswith('.html'):
        patch_file(os.path.join(PAGES_DIR, fname))
