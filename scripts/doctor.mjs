import { existsSync } from 'fs';
import { execSync } from 'child_process';

let passed = 0;
let failed = 0;

function check(name, ok) {
  if (ok) {
    console.log(`  \u2713 ${name}`);
    passed++;
  } else {
    console.log(`  \u2717 ${name}`);
    failed++;
  }
}

console.log('\nPrompt Agent Portal — Health Check\n');

check('Node.js >= 18', process.version.slice(1).split('.')[0] >= 18);

check('node_modules exists', existsSync('node_modules'));

const requiredFiles = [
  'index.html',
  'vite.config.js',
  'tailwind.config.js',
  'postcss.config.js',
  'src/main.jsx',
  'src/App.jsx',
  '.prettierrc',
];
for (const f of requiredFiles) {
  check(`File ${f} exists`, existsSync(f));
}

const key = process.env.VITE_GROQ_API_KEY || '';
check('VITE_GROQ_API_KEY is set', !!key);
check('VITE_GROQ_API_KEY is not placeholder', key !== 'your_groq_api_key_here');

try {
  execSync('npm run format:check', { stdio: 'pipe', encoding: 'utf-8' });
  check('Formatting check', true);
} catch {
  check('Formatting check', false);
}

try {
  execSync('npm run build', { stdio: 'pipe', encoding: 'utf-8' });
  check('Build', true);
} catch {
  check('Build', false);
}

const total = passed + failed;
console.log(`\n\u2514\u2500\u2500 ${passed}/${total} checks passed${failed > 0 ? `, ${failed} failed` : ''}\n`);

process.exit(failed > 0 ? 1 : 0);
