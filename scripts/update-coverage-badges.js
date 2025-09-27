#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

/**
 * Script to update coverage badges in README.md
 * Usage: node scripts/update-coverage-badges.js
 */

function getBadgeColor(coverage) {
  const num = parseFloat(coverage.replace('%', ''));
  if (num >= 80) return 'brightgreen';
  if (num >= 60) return 'yellow';
  return 'red';
}

function getBackendCoverage() {
  try {
    // Run backend tests with coverage
    console.log('🧪 Running backend tests with coverage...');
    execSync('make test-coverage', { stdio: 'inherit' });

    // Extract coverage percentage
    const coverageOutput = execSync('go tool cover -func=coverage_filtered.out | grep total | awk \'{print $3}\'', { encoding: 'utf8' });
    return coverageOutput.trim();
  } catch (error) {
    console.error('❌ Failed to get backend coverage:', error.message);
    return '0%';
  }
}

function getFrontendCoverage() {
  try {
    // Run frontend tests with coverage
    console.log('🧪 Running frontend tests with coverage...');
    execSync('make test-frontend-coverage', { stdio: 'inherit' });

    // Read coverage summary
    const coverageSummaryPath = path.join(__dirname, '../frontend/coverage/coverage-summary.json');
    const coverageData = JSON.parse(fs.readFileSync(coverageSummaryPath, 'utf8'));
    return coverageData.total.lines.pct + '%';
  } catch (error) {
    console.error('❌ Failed to get frontend coverage:', error.message);
    return '0%';
  }
}

function updateReadme(backendCoverage, frontendCoverage) {
  const readmePath = path.join(__dirname, '../README.md');
  let readmeContent = fs.readFileSync(readmePath, 'utf8');

  const backendColor = getBadgeColor(backendCoverage);
  const frontendColor = getBadgeColor(frontendCoverage);

  // URL encode the percentages for shields.io
  const backendEncoded = encodeURIComponent(backendCoverage);
  const frontendEncoded = encodeURIComponent(frontendCoverage);

  // Update backend coverage badge
  readmeContent = readmeContent.replace(
    /Go%20Coverage-[^-]+-[^)]+/g,
    `Go%20Coverage-${backendEncoded}-${backendColor}`
  );

  // Update frontend coverage badge
  readmeContent = readmeContent.replace(
    /Frontend%20Coverage-[^-]+-[^)]+/g,
    `Frontend%20Coverage-${frontendEncoded}-${frontendColor}`
  );

  // Write back to file
  fs.writeFileSync(readmePath, readmeContent);

  console.log('✅ Updated README.md with:');
  console.log(`   📊 Backend Coverage: ${backendCoverage} (${backendColor})`);
  console.log(`   📊 Frontend Coverage: ${frontendCoverage} (${frontendColor})`);
}

function main() {
  console.log('🚀 Starting coverage badge update...\n');

  const backendCoverage = getBackendCoverage();
  const frontendCoverage = getFrontendCoverage();

  console.log('\n📈 Coverage Results:');
  console.log(`   Backend: ${backendCoverage}`);
  console.log(`   Frontend: ${frontendCoverage}\n`);

  updateReadme(backendCoverage, frontendCoverage);

  console.log('\n🎉 Coverage badge update completed!');
}

if (require.main === module) {
  main();
}

module.exports = {
  getBadgeColor,
  getBackendCoverage,
  getFrontendCoverage,
  updateReadme
};
