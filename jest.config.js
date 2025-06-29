module.exports = {
  projects: [
    {
      displayName: 'Frontend',
      testMatch: ['<rootDir>/frontend/src/**/__tests__/**/*.(js|jsx|ts|tsx)', '<rootDir>/frontend/src/**/?(*.)(spec|test).(js|jsx|ts|tsx)'],
      testEnvironment: 'jsdom',
      setupFilesAfterEnv: ['<rootDir>/frontend/src/setupTests.js'],
      moduleNameMapping: {
        '^@/(.*)$': '<rootDir>/frontend/src/$1',
      },
      collectCoverageFrom: [
        'frontend/src/**/*.{js,jsx,ts,tsx}',
        '!frontend/src/**/*.d.ts',
        '!frontend/src/index.tsx',
        '!frontend/src/reportWebVitals.js',
      ],
      coverageDirectory: '<rootDir>/coverage/frontend',
      coverageReporters: ['text', 'lcov', 'html'],
      transform: {
        '^.+\\.(js|jsx|ts|tsx)$': ['babel-jest', { cwd: '<rootDir>/frontend' }],
      },
      transformIgnorePatterns: [
        '[/\\\\]node_modules[/\\\\].+\\.(js|jsx|ts|tsx)$',
        '^.+\\.module\\.(css|sass|scss)$',
      ],
    }
  ],
  collectCoverage: true,
  coverageDirectory: '<rootDir>/coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
};
