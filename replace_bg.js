const fs = require('fs');
const path = require('path');

function walk(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    const p = path.join(dir, f);
    if (fs.statSync(p).isDirectory()) walk(p, callback);
    else if (p.endsWith('.tsx')) callback(p);
  });
}

function updateFile(file) {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;

  // 1. Screens
  content = content.replace(/container:\s*\{\s*flex:\s*1,\s*backgroundColor:\s*Colors\.white\s*\}/g, 'container: { flex: 1, backgroundColor: Colors.cloud[50] }');
  content = content.replace(/safe:\s*\{\s*flex:\s*1,\s*backgroundColor:\s*Colors\.white\s*\}/g, 'safe: { flex: 1, backgroundColor: Colors.cloud[50] }');

  // 2. Insets
  content = content.replace(/backgroundColor:\s*Colors\.white\s*(?=\}\}\s*\/>)/g, 'backgroundColor: Colors.cloud[50] ');

  // 3. headers
  content = content.replace(/(header: \{[\s\S]*?)backgroundColor:\s*Colors\.white(,|\n)/g, '$1backgroundColor: Colors.cloud[50]$2');

  // 4. topBar in components
  if (file.includes('MediComponents.tsx')) {
    content = content.replace(/(topBar: \{[\s\S]*?)backgroundColor:\s*Colors\.white(,|\n)/g, '$1backgroundColor: Colors.cloud[50]$2');
    // 5. Card
    content = content.replace(/card:\s*\{\s*backgroundColor:\s*Colors\.cloud\[50\]/g, 'card: {\n    backgroundColor: Colors.white');
  }

  if (content !== original) {
    fs.writeFileSync(file, content);
    console.log('Updated', file);
  }
}

walk('./app', updateFile);
walk('./components', updateFile);
