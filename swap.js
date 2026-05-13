const fs = require('fs');
const path = require('path');

const appDir = path.join(__dirname, 'app');

function walk(directory) {
  const files = fs.readdirSync(directory);
  for (const file of files) {
    const fullPath = path.join(directory, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      walk(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      // We want to replace the primary hardcoded #9FCC3B with #E3F5C7
      // But keep #9FCC3B for highlighting...
      // Since it's hard to know which is which automatically,
      // I'll replace all #9FCC3B with #E3F5C7 for the primary aesthetic.
      // And I will manually add highlighting where appropriate later.
      if (content.includes('#9FCC3B')) {
        content = content.split('#9FCC3B').join('#E3F5C7');
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Updated ${fullPath}`);
      }
      if (content.includes('#AAD963')) {
        content = content.split('#AAD963').join('#D6EEA5');
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Updated ${fullPath}`);
      }
    }
  }
}

walk(appDir);
