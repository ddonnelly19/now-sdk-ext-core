import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join, resolve } from 'path';

const root = resolve('C:/Users/ddonnell/OneDrive - Capgemini/source/now-sdk-ext-core');
const exclude = join(root, 'src', 'sn', 'IServiceNowInstance.ts');

function walk(dir, exts, results = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    try {
      const stat = statSync(full);
      if (stat.isDirectory()) {
        if (!['node_modules', 'dist', '.git'].includes(entry)) walk(full, exts, results);
      } else if (exts.some(e => full.endsWith(e))) {
        results.push(full);
      }
    } catch {}
  }
  return results;
}

const files = walk(root, ['.ts', '.mjs']);
let updated = 0;

for (const file of files) {
  if (file === exclude) continue;
  const content = readFileSync(file, 'utf8');
  if (!content.includes('ServiceNowInstanceFactory.createInstance(')) continue;

  // Replace constructor calls
  let newContent = content.replaceAll('ServiceNowInstanceFactory.createInstance(', 'ServiceNowInstanceFactory.createInstance(');

  // Add import if not already present
  if (!newContent.includes('ServiceNowInstanceFactory')) {
    const importRe = /import \{[^}]+\} from (['"])(.*?ServiceNowInstance\.js)\1;/;
    const m = importRe.exec(newContent);
    if (m) {
      const quote = m[1];
      const iPath = m[2].replace('ServiceNowInstance.js', 'IServiceNowInstance.js');
      const importLine = `import { ServiceNowInstanceFactory } from ${quote}${iPath}${quote};`;
      newContent = newContent.replace(m[0], `${m[0]}\n${importLine}`);
    }
  }

  writeFileSync(file, newContent, 'utf8');
  console.log('Updated:', file.replace(root, '').replace(/\\/g, '/'));
  updated++;
}

console.log(`\nDone. ${updated} files updated.`);
