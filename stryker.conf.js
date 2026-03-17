module.exports = {
    packageManager: 'npm',
    reporters: ['html', 'clear-text', 'progress'],
    testRunner: 'command',
    commandRunner: {
        command: 'npx vitest run tests/unit/config --no-coverage'
    },
    coverageAnalysis: 'all',
    mutate: [
        'src/config/**/*.js',
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
