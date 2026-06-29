import re, os
pages = [
 'index.html','users.html','members.html','creative-arts.html','primaryschools.html',
 'highschools.html','higher-education.html','attendance.html','offerings.html',
 'transport.html','calendar.html','members-map.html','schools-map.html'
]
pattern = re.compile(r'id="([^"]+)"')
for page in pages:
    path = os.path.join(os.getcwd(), page)
    with open(path, 'r', encoding='utf-8', errors='ignore') as f:
        data = f.read()
    ids = pattern.findall(data)
    dup = {k: ids.count(k) for k in set(ids) if ids.count(k) > 1}
    print(page)
    print('  shared-nav:', 'js/shared-nav.js' in data)
    print('  mobile-top-bar:', 'id="mobile-top-bar"' in data)
    print('  sidebar-container:', 'id="sidebar-container"' in data)
    print('  sidebar-backdrop:', 'id="sidebar-backdrop"' in data)
    print('  sidebar-menu:', 'id="sidebar-menu"' in data)
    print('  dup ids:', dup if dup else 'none')
