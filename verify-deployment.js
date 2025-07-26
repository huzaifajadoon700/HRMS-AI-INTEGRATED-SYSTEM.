#!/usr/bin/env node

/**
 * HRMS Deployment Verification Script
 * Checks if the project is ready for Vercel deployment
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 HRMS Deployment Verification\n');

const checks = [];

// Check if required files exist
const requiredFiles = [
  'vercel.json',
  'package.json',
  'frontend/package.json',
  'backend/package.json',
  'backend/index.serverless.js',
  'frontend/src/config/api.js',
  'README.md',
  'DEPLOYMENT.md'
];

console.log('📁 Checking required files...');
requiredFiles.forEach(file => {
  const exists = fs.existsSync(file);
  console.log(`${exists ? '✅' : '❌'} ${file}`);
  checks.push({ name: `File: ${file}`, passed: exists });
});

// Check package.json scripts
console.log('\n📦 Checking package.json scripts...');
try {
  const rootPackage = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const hasVercelBuild = rootPackage.scripts && rootPackage.scripts['vercel-build'];
  console.log(`${hasVercelBuild ? '✅' : '❌'} Root vercel-build script`);
  checks.push({ name: 'Root vercel-build script', passed: hasVercelBuild });

  const frontendPackage = JSON.parse(fs.readFileSync('frontend/package.json', 'utf8'));
  const hasBuildScript = frontendPackage.scripts && frontendPackage.scripts.build;
  console.log(`${hasBuildScript ? '✅' : '❌'} Frontend build script`);
  checks.push({ name: 'Frontend build script', passed: hasBuildScript });
} catch (error) {
  console.log('❌ Error reading package.json files');
  checks.push({ name: 'Package.json validation', passed: false });
}

// Check environment files
console.log('\n🔧 Checking environment configuration...');
const envFiles = [
  'backend/.env.example',
  'frontend/.env.example',
  'frontend/.env.production'
];

envFiles.forEach(file => {
  const exists = fs.existsSync(file);
  console.log(`${exists ? '✅' : '❌'} ${file}`);
  checks.push({ name: `Env file: ${file}`, passed: exists });
});

// Check for hardcoded localhost URLs
console.log('\n🔍 Checking for hardcoded localhost URLs...');
const filesToCheck = [
  'frontend/src/config/api.js',
  'frontend/src/services/socketService.js',
  'frontend/src/utils/imageUtils.js'
];

let foundHardcodedUrls = false;
filesToCheck.forEach(file => {
  if (fs.existsSync(file)) {
    const content = fs.readFileSync(file, 'utf8');
    const hasLocalhost = content.includes('localhost:8080') && !content.includes('process.env');
    if (hasLocalhost) {
      console.log(`❌ Found hardcoded localhost in ${file}`);
      foundHardcodedUrls = true;
    }
  }
});

if (!foundHardcodedUrls) {
  console.log('✅ No hardcoded localhost URLs found in key files');
}
checks.push({ name: 'No hardcoded localhost URLs', passed: !foundHardcodedUrls });

// Check vercel.json configuration
console.log('\n⚙️ Checking Vercel configuration...');
try {
  const vercelConfig = JSON.parse(fs.readFileSync('vercel.json', 'utf8'));
  const hasBuilds = vercelConfig.builds && vercelConfig.builds.length > 0;
  const hasRoutes = vercelConfig.routes && vercelConfig.routes.length > 0;
  
  console.log(`${hasBuilds ? '✅' : '❌'} Vercel builds configuration`);
  console.log(`${hasRoutes ? '✅' : '❌'} Vercel routes configuration`);
  
  checks.push({ name: 'Vercel builds config', passed: hasBuilds });
  checks.push({ name: 'Vercel routes config', passed: hasRoutes });
} catch (error) {
  console.log('❌ Error reading vercel.json');
  checks.push({ name: 'Vercel config validation', passed: false });
}

// Summary
console.log('\n📊 Verification Summary');
console.log('========================');

const passed = checks.filter(check => check.passed).length;
const total = checks.length;
const percentage = Math.round((passed / total) * 100);

console.log(`✅ Passed: ${passed}/${total} (${percentage}%)`);

if (percentage === 100) {
  console.log('\n🎉 All checks passed! Your project is ready for Vercel deployment.');
  console.log('\n📋 Next steps:');
  console.log('1. Set up environment variables in Vercel dashboard');
  console.log('2. Update frontend/.env.production with your backend URL');
  console.log('3. Deploy using: vercel');
  console.log('4. Test the deployed application');
} else {
  console.log('\n⚠️ Some checks failed. Please fix the issues above before deploying.');
  console.log('\nFailed checks:');
  checks.filter(check => !check.passed).forEach(check => {
    console.log(`❌ ${check.name}`);
  });
}

console.log('\n📖 For detailed deployment instructions, see DEPLOYMENT.md');

process.exit(percentage === 100 ? 0 : 1);
