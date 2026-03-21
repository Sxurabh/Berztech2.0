module.exports = {
    packageManager: 'npm',
    reporters: ['html', 'clear-text', 'progress'],
    testRunner: 'command',
    commandRunner: {
        command: 'npx vitest run tests/unit --no-coverage'
    },
    coverageAnalysis: 'all',
    mutate: [
        'src/config/**/*.js',
        'src/app/api/**/*.js',
        'src/lib/data/**/*.js',
    ],
    ignoreMutations: [
        'src/**/*.d.ts',
    ],
    thresholds: {
        high: 80,
        low: 60,
        break: 50,
    },
};
