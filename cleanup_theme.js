const fs = require('fs');

function cleanupFile(path) {
  if (!fs.existsSync(path)) return;
  let c = fs.readFileSync(path, 'utf8');

  // Regex to match and replace duplicated minimalist checks:
  // theme === 'minimalist' ? '...' : theme === 'minimalist' ? '...' :
  // or with template literals / spaces
  const regex = /theme === 'minimalist'\s*\?\s*'([^']*)'\s*:\s*theme === 'minimalist'\s*\?\s*'[^']*'\s*:\s*/g;
  c = c.replace(regex, "theme === 'minimalist' ? '$1' : ");

  // Let's also do a second pass in case there are double-quotes or backticks
  const regex2 = /theme === 'minimalist'\s*\?\s*`([^`]*)`\s*:\s*theme === 'minimalist'\s*\?\s*`[^`]*`\s*:\s*/g;
  c = c.replace(regex2, "theme === 'minimalist' ? `$1` : ");

  fs.writeFileSync(path, c);
  console.log(`Cleaned up duplicates in ${path}`);
}

cleanupFile('src/components/sandbox/WorkerView.tsx');
cleanupFile('src/components/sandbox/WelcomeScreen.tsx');
cleanupFile('src/components/sandbox/EmployerView.tsx');
cleanupFile('OneClickSandbox.tsx');
