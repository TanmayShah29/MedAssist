import os

replacements = {
    '#FAFAF7': '#FDFDFB',
    '#F5F4EF': '#FFFFFF',
    '#EFEDE6': '#FAFAFA',
    '#E8E6DF': '#EBEAE4',
    '#D9D6CD': '#D1CFCD',
    '#1C1917': '#0F172A',
    '#57534E': '#475569',
    '#78716C': '#94A3B8',
    '#0EA5E9': '#0284C7',
    '#0284C7': '#0369A1',
    '#E0F2FE': '#F0F9FF',
    '#10B981': '#059669',
    
    '#fafaf7': '#FDFDFB',
    '#f5f4ef': '#FFFFFF',
    '#efede6': '#FAFAFA',
    '#e8e6df': '#EBEAE4',
    '#d9d6cd': '#D1CFCD',
    '#1c1917': '#0F172A',
    '#57534e': '#475569',
    '#78716c': '#94A3B8',
    '#0ea5e9': '#0284C7',
    '#0284c7': '#0369A1',
    '#e0f2fe': '#F0F9FF',
    '#10b981': '#059669',
}

def replace_in_file(filepath):
    try:
        with open(filepath, 'r') as f:
            content = f.read()
    except:
        return
    
    new_content = content
    for old, new in replacements.items():
        new_content = new_content.replace(old, new)
        
    if new_content != content:
        with open(filepath, 'w') as f:
            f.write(new_content)
        print(f"Updated {filepath}")

for root, _, files in os.walk('src'):
    for file in files:
        if file.endswith(('.tsx', '.ts', '.css')):
            replace_in_file(os.path.join(root, file))

replace_in_file('tailwind.config.ts')
