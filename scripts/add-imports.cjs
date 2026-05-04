const {readFileSync, writeFileSync, readdirSync, statSync} = require('fs');
const {join} = require('path');
const root = 'C:/Users/ddonnell/OneDrive - Capgemini/source/now-sdk-ext-core';

function walk(dir, results=[]) {
  for (const e of readdirSync(dir)) {
    const f = join(dir, e);
    try {
      if (statSync(f).isDirectory()) {
        if (!['node_modules','dist','.git','scripts'].includes(e)) walk(f, results);
      } else if (f.endsWith('.ts') || f.endsWith('.mjs')) results.push(f);
    } catch {}
  }
  return results;
}

const exclude = join(root, 'src/sn/IServiceNowInstance.ts').replace(/\//g, require('path').sep);
let count = 0;
for (const file of walk(root)) {
  const filePath = file.replace(/\//g, require('path').sep);
  if (filePath === exclude) continue;
  const content = readFileSync(file, 'utf8');
  if (!content.includes('ServiceNowInstanceFactory.createInstance(')) continue;
  if (content.match(/^import.*ServiceNowInstanceFactory/m)) continue;
  // Need to add import
  const importRe = /import \{[^}]+\} from (['"])(.*?ServiceNowInstance\.js)\1;/;
  const m = importRe.exec(content);
  if (!m) { console.log('No import match for:', file); continue; }
  const quote = m[1];
  const iPath = m[2].replace('ServiceNowInstance.js', 'IServiceNowInstance.js');
  const importLine = `import { ServiceNowInstanceFactory } from ${quote}${iPath}${quote};`;
  const newContent = content.replace(m[0], m[0] + '\n' + importLine);
  writeFileSync(file, newContent, 'utf8');
  console.log('Fixed:', file.replace(root, ''));
  count++;
}
console.log('Fixed', count, 'files');
