const fs = require('fs');

function fixFile(path) {
  if (!fs.existsSync(path)) return;
  let c = fs.readFileSync(path, 'utf8');
  
  // Replace combinations of (theme === 'light' || theme === 'minimalist') and theme === 'light' || theme === 'minimalist'
  c = c.replace(/\(theme === 'light' \|\| theme === 'minimalist'\)/g, "theme !== 'dark'");
  c = c.replace(/theme === 'light' \|\| theme === 'minimalist'/g, "theme !== 'dark'");
  c = c.replace(/theme === 'minimalist' \|\| theme === 'light'/g, "theme !== 'dark'");
  c = c.replace(/\(theme === 'minimalist' \|\| theme === 'light'\)/g, "theme !== 'dark'");

  // Let's also check for duplicates created by the previous regexes, like:
  // theme === 'minimalist' ? '...' : theme === 'minimalist' ? '...'
  // We can clean up the ternary duplicates.
  // Example: theme === 'minimalist' ? 'A' : theme === 'minimalist' ? 'B' : theme === 'light' ? 'C' : 'D'
  // The second `theme === 'minimalist' ? 'B'` is dead code, but let's make sure it doesn't break things.
  // Wait, if it's dead code, typescript might warn about it if it causes unreachable code?
  // Let's clean up any nested theme === 'minimalist' checks.
  
  fs.writeFileSync(path, c);
  console.log(`Updated theme conditionals in ${path}`);
}

fixFile('src/components/sandbox/WorkerView.tsx');
fixFile('src/components/sandbox/WelcomeScreen.tsx');
fixFile('src/components/sandbox/EmployerView.tsx');
fixFile('OneClickSandbox.tsx');
