import os
import re

directory = '/Users/ahmedsamir/Desktop/SaaS Admin Dashboard UI/src/app'

replacements = [
    (re.compile(r'\bbg-white\b'), 'bg-card'),
    (re.compile(r'\bbg-gray-50\b'), 'bg-muted'),
    (re.compile(r'\bborder-gray-[1-3]00\b'), 'border-border'),
    (re.compile(r'\btext-gray-900\b'), 'text-foreground'),
    (re.compile(r'\btext-gray-800\b'), 'text-foreground'),
    (re.compile(r'\btext-gray-600\b'), 'text-muted-foreground'),
    (re.compile(r'\btext-gray-500\b'), 'text-muted-foreground'),
    (re.compile(r'\btext-gray-400\b'), 'text-muted-foreground'),
    (re.compile(r'\btext-gray-300\b'), 'text-muted-foreground'),
    (re.compile(r'\bhover:bg-gray-50\b'), 'hover:bg-accent hover:text-accent-foreground'),
    (re.compile(r'\bhover:bg-gray-100\b'), 'hover:bg-accent hover:text-accent-foreground'),
    (re.compile(r'\bbg-gray-100\b'), 'bg-accent text-accent-foreground')
]

for root, _, files in os.walk(directory):
    for file in files:
        if file.endswith('.tsx') or file.endswith('.ts'):
            path = os.path.join(root, file)
            with open(path, 'r', encoding='utf-8') as f:
                content = f.read()
            original = content
            for regex, rep in replacements:
                content = regex.sub(rep, content)
            if content != original:
                with open(path, 'w', encoding='utf-8') as f:
                    f.write(content)
                print(f"Updated: {path}")

print("Done.")
