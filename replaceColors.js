const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'app');

const colorMap = {
  '#0a7aff': '#9FCC3B',
  '#3a9bff': '#AAD963',
  '#7bbcff': '#C0E285',
  '#f0f6ff': '#F5F8F4',
  '#c8deff': '#D6EEA5',
  '#f6f9ff': '#F5F8F4',
};

function walk(directory) {
  const files = fs.readdirSync(directory);
  for (const file of files) {
    const fullPath = path.join(directory, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      walk(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let changed = false;
      for (const [oldColor, newColor] of Object.entries(colorMap)) {
        if (content.includes(oldColor)) {
          content = content.split(oldColor).join(newColor);
          changed = true;
        }
      }
      if (changed) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Updated ${fullPath}`);
      }
    }
  }
}

walk(dir);
