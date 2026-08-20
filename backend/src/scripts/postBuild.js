const fs = require('fs');
const { execSync } = require('child_process');
const path = require('path');

const MEDUSA_SERVER_PATH = path.join(process.cwd(), '.medusa', 'server');

// Check if .medusa/server exists - if not, build process failed
if (!fs.existsSync(MEDUSA_SERVER_PATH)) {
  throw new Error('.medusa/server directory not found. This indicates the Medusa build process failed. Please check for build errors.');
}

// Copy pnpm-lock.yaml
fs.copyFileSync(
  path.join(process.cwd(), 'pnpm-lock.yaml'),
  path.join(MEDUSA_SERVER_PATH, 'pnpm-lock.yaml')
);

// Copy .env if it exists
const envPath = path.join(process.cwd(), '.env');
if (fs.existsSync(envPath)) {
  fs.copyFileSync(
    envPath,
    path.join(MEDUSA_SERVER_PATH, '.env')
  );
}

// Install dependencies
console.log('Installing dependencies in .medusa/server...');
try {
  execSync('pnpm i --prod --frozen-lockfile', {
    cwd: MEDUSA_SERVER_PATH,
    stdio: 'inherit'
  });
} catch (err) {
  // Railway's cached pnpm content-addressable store can go stale/corrupt
  // (ERR_PNPM_ENOENT copyfile), so retry once forcing a re-fetch from the registry.
  console.warn('Initial pnpm install failed, retrying with --force (bypassing pnpm store cache)...');
  execSync('pnpm i --prod --frozen-lockfile --force', {
    cwd: MEDUSA_SERVER_PATH,
    stdio: 'inherit'
  });
}
