export default {
  preset: 'ts-jest',
  testEnvironment: "node",
  extensionsToTreatAsEsm: ['.ts'],
  transform: {
    "\\.js$":['ts-jest', { useESM: true } ],
    '^.+\\.tsx?$': [
      'ts-jest', { useESM: true },
    ]
  },
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1', // Corrects path issues with transpiled imports
  },


};
