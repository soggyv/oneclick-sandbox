const fs = require('fs');
const path = 'src/components/sandbox/WorkerView.tsx';
let c = fs.readFileSync(path, 'utf8');

// Replace all occurrences of: theme === 'light'
// with: (theme === 'light' || theme === 'minimalist')
// But wait, there might be places where we ALREADY have theme === 'light' || theme === 'minimalist'.
// Let's first normalize:
c = c.replace(/\(theme === 'light' \|\| theme === 'minimalist'\)/g, "theme === 'light'");
c = c.replace(/theme === 'light' \|\| theme === 'minimalist'/g, "theme === 'light'");

// Then we can safely replace all theme === 'light' with the combined condition.
c = c.replace(/theme === 'light'/g, "(theme === 'light' || theme === 'minimalist')");

// Save it back
fs.writeFileSync(path, c);
console.log('Replaced successfully');
