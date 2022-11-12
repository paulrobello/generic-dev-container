import type {Config} from 'jest';

const config: Config = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    // testMatch: ["tests/"],
    verbose: true,
};

export default config;
