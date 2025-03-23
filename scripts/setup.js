const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m'
};

function log(message, type = 'info') {
  const color = type === 'success' ? colors.green 
              : type === 'warning' ? colors.yellow 
              : type === 'error' ? colors.red 
              : colors.cyan;
  
  console.log(`${color}${message}${colors.reset}`);
}

async function setup() {
  try {
    log('🚀 Starting project setup...', 'info');

    // Check if node_modules exists
    if (!fs.existsSync('node_modules')) {
      log('📦 Installing dependencies...', 'info');
      execSync('npm install', { stdio: 'inherit' });
    }

    // Check if server node_modules exists
    if (!fs.existsSync('server/node_modules')) {
      log('📦 Installing server dependencies...', 'info');
      execSync('cd server && npm install', { stdio: 'inherit' });
    }

    // Create necessary directories
    const dirs = [
      'public/models',
      'src/assets',
      'src/utils',
      'src/styles'
    ];

    dirs.forEach(dir => {
      const fullPath = path.join(process.cwd(), dir);
      if (!fs.existsSync(fullPath)) {
        fs.mkdirSync(fullPath, { recursive: true });
        log(`📁 Created directory: ${dir}`, 'success');
      }
    });

    // Download face-api.js models
    log('📥 Downloading face-api.js models...', 'info');
    execSync('npm run download-face-models', { stdio: 'inherit' });

    // Verify Firebase configuration
    if (!process.env.REACT_APP_FIREBASE_API_KEY) {
      log('⚠️ Firebase configuration not found in environment variables.', 'warning');
      log('Please ensure you have set up your .env file correctly.', 'warning');
    }

    // Initialize Git hooks
    log('🔧 Setting up Git hooks...', 'info');
    execSync('npx husky install', { stdio: 'inherit' });
    execSync('npx husky add .husky/pre-commit "npx lint-staged"', { stdio: 'inherit' });

    // Run linting
    log('🔍 Running linting...', 'info');
    execSync('npm run lint', { stdio: 'inherit' });

    // Success message
    log('\n✅ Project setup completed successfully!', 'success');
    log('\nNext steps:', 'info');
    log('1. Ensure your .env file is configured correctly', 'info');
    log('2. Start the development server: npm run dev', 'info');
    log('3. Open http://localhost:3000 in your browser', 'info');

  } catch (error) {
    log('\n❌ Setup failed:', 'error');
    log(error.message, 'error');
    process.exit(1);
  }
}

// Run setup
setup();