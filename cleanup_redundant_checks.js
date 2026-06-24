const fs = require('fs');

function cleanupFile(path) {
  if (!fs.existsSync(path)) return;
  let c = fs.readFileSync(path, 'utf8');

  // Regex to remove redundant `theme === 'minimalist'` after `theme !== 'dark' ? ... :`
  // We match:
  // theme !== 'dark' ? X : theme === 'minimalist' ? Y : Z
  // and replace with:
  // theme !== 'dark' ? X : Z
  
  // Single-quoted version
  c = c.replace(/theme !== 'dark'\s*\?\s*'([^']*)'\s*:\s*theme === 'minimalist'\s*\?\s*'[^']*'\s*:\s*'([^']*)'/g, "theme !== 'dark' ? '$1' : '$2'");
  
  // Double-quoted version
  c = c.replace(/theme !== 'dark'\s*\?\s*"([^"]*)"\s*:\s*theme === 'minimalist'\s*\?\s*"[^"]*"\s*:\s*"([^"]*)"/g, "theme !== 'dark' ? \"$1\" : \"$2\"");
  
  // Backtick version
  c = c.replace(/theme !== 'dark'\s*\?\s*`([^`]*)`\s*:\s*theme === 'minimalist'\s*\?\s*`[^`]*`\s*:\s*`([^`]*)`/g, "theme !== 'dark' ? `$1` : `$2`");

  // Also match unquoted expressions (like classes or JSX children)
  // Let's do a generic one if it exists, or just handle line 1528 specifically first:
  // ${theme !== 'dark' ? 'bg-orange-50 text-orange-600' : theme === 'minimalist' ? 'bg-orange-50 text-orange-500' : 'bg-orange-500/10 text-orange-400'}
  // The single-quoted regex above should already match line 1528!
  // Let's test if it matches: theme !== 'dark' ? 'bg-orange-50 text-orange-600' : theme === 'minimalist' ? 'bg-orange-50 text-orange-500' : 'bg-orange-500/10 text-orange-400'
  // Yes! The groups are:
  // $1: bg-orange-50 text-orange-600
  // $2: bg-orange-500/10 text-orange-400
  // So it will correctly replace it with:
  // theme !== 'dark' ? 'bg-orange-50 text-orange-600' : 'bg-orange-500/10 text-orange-400'

  fs.writeFileSync(path, c);
  console.log(`Cleaned up redundant checks in ${path}`);
}

cleanupFile('src/components/sandbox/WorkerView.tsx');
cleanupFile('src/components/sandbox/WelcomeScreen.tsx');
cleanupFile('src/components/sandbox/EmployerView.tsx');
cleanupFile('OneClickSandbox.tsx');
