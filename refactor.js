const fs = require('fs');
const path = require('path');

const directoryPath = path.join(__dirname, 'src', 'app');

function walk(dir, callback) {
    fs.readdirSync(dir).forEach(file => {
        let fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            walk(fullPath, callback);
        } else {
            callback(fullPath);
        }
    });
}

const replacements = [
    { match: /\bbg-white\b/g, replace: 'bg-card' },
    { match: /\bbg-gray-50\b/g, replace: 'bg-muted' },
    { match: /\bborder-gray-[1-3]00\b/g, replace: 'border-border' },
    { match: /\btext-gray-900\b/g, replace: 'text-foreground' },
    { match: /\btext-gray-800\b/g, replace: 'text-foreground' },
    { match: /\btext-gray-600\b/g, replace: 'text-muted-foreground' },
    { match: /\btext-gray-500\b/g, replace: 'text-muted-foreground' },
    { match: /\btext-gray-400\b/g, replace: 'text-muted-foreground' },
    { match: /\btext-gray-300\b/g, replace: 'text-muted-foreground' },
    { match: /\bhover:bg-gray-50\b/g, replace: 'hover:bg-accent hover:text-accent-foreground' },
    { match: /\bhover:bg-gray-100\b/g, replace: 'hover:bg-accent hover:text-accent-foreground' },
    { match: /\bbg-gray-100\b/g, replace: 'bg-accent text-accent-foreground' },
];

walk('/Users/ahmedsamir/Desktop/SaaS Admin Dashboard UI/src/app', (filePath) => {
    if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
        let content = fs.readFileSync(filePath, 'utf8');
        let original = content;

        replacements.forEach(r => {
            content = content.replace(r.match, r.replace);
        });

        if (content !== original) {
            fs.writeFileSync(filePath, content, 'utf8');
            console.log(`Updated: ${filePath}`);
        }
    }
});
