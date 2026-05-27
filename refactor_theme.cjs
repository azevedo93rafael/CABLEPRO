const fs = require('fs');
const path = require('path');

const targetDir = 'c:/Users/Rafael Azevedo/.gemini/antigravity/scratch/CABLEPRO/src/modules/cmeGenerator';

const replacements = [
  { regex: /bg-\[#060A12\]/g, replacement: 'bg-gray-50 dark:bg-[#060A12]' },
  { regex: /bg-\[#080C14\]/g, replacement: 'bg-white dark:bg-[#080C14]' },
  { regex: /bg-\[#0A1628\]/g, replacement: 'bg-white dark:bg-[#0A1628]' },
  { regex: /text-white(?![\/\w])/g, replacement: 'text-gray-900 dark:text-white' },
  { regex: /text-white\/30/g, replacement: 'text-gray-400 dark:text-white/30' },
  { regex: /text-white\/40/g, replacement: 'text-gray-500 dark:text-white/40' },
  { regex: /text-white\/50/g, replacement: 'text-gray-500 dark:text-white/50' },
  { regex: /text-white\/60/g, replacement: 'text-gray-600 dark:text-white/60' },
  { regex: /text-white\/70/g, replacement: 'text-gray-700 dark:text-white/70' },
  { regex: /border-white\/5/g, replacement: 'border-gray-200 dark:border-white/5' },
  { regex: /border-white\/10/g, replacement: 'border-gray-300 dark:border-white/10' },
  { regex: /border-white\/20/g, replacement: 'border-gray-300 dark:border-white/20' },
  { regex: /bg-white\/5/g, replacement: 'bg-gray-100 dark:bg-white/5' },
  { regex: /bg-white\/10/g, replacement: 'bg-gray-200 dark:bg-white/10' },
  { regex: /bg-white\/20/g, replacement: 'bg-gray-300 dark:bg-white/20' },
  { regex: /bg-white\/\[0\.02\]/g, replacement: 'bg-gray-50 dark:bg-white/[0.02]' },
  { regex: /hover:bg-white\/5/g, replacement: 'hover:bg-gray-100 dark:hover:bg-white/5' },
  { regex: /hover:bg-white\/10/g, replacement: 'hover:bg-gray-200 dark:hover:bg-white/10' },
  { regex: /hover:text-white(?![\/\w])/g, replacement: 'hover:text-gray-900 dark:hover:text-white' },
  { regex: /hover:text-white\/60/g, replacement: 'hover:text-gray-700 dark:hover:text-white/60' },
  { regex: /hover:text-white\/70/g, replacement: 'hover:text-gray-700 dark:hover:text-white/70' },
  { regex: /hover:text-white\/80/g, replacement: 'hover:text-gray-800 dark:hover:text-white/80' },
];

function processDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDir(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let originalContent = content;
      for (const { regex, replacement } of replacements) {
        content = content.replace(regex, replacement);
      }
      if (content !== originalContent) {
        fs.writeFileSync(fullPath, content);
        console.log(`Updated ${fullPath}`);
      }
    }
  }
}

processDir(targetDir);
