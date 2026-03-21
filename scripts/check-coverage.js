const fs = require('fs');
const path = require('path');

const COVERAGE_THRESHOLD = parseFloat(process.env.COVERAGE_THRESHOLD || '89.05');
const coveragePath = path.join(__dirname, '..', 'coverage', 'coverage-summary.json');

if (!fs.existsSync(coveragePath)) {
  console.error('Coverage report not found. Run `npm run test:ci` first.');
  process.exit(1);
}

const coverage = JSON.parse(fs.readFileSync(coveragePath, 'utf8'));
const lineCoverage = coverage.total?.lines?.pct ?? 0;

console.log(`Line coverage: ${lineCoverage}%`);
console.log(`Threshold: ${COVERAGE_THRESHOLD}%`);

if (lineCoverage < COVERAGE_THRESHOLD) {
  console.error(`FAIL: Line coverage (${lineCoverage}%) is below threshold (${COVERAGE_THRESHOLD}%)`);
  process.exit(1);
} else {
  console.log('PASS: Coverage meets threshold.');
  process.exit(0);
}
