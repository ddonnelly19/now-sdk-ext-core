import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
    test: {
        globals: true,
        environment: 'node',
        include: ['**/*.test.ts'],
        testTimeout: 50000,
        coverage: {
            provider: 'v8',
            include: ['src/**/*.ts'],
            exclude: ['**/node_modules/**'],
            reporter: ['html', 'text', 'text-summary', 'cobertura'],
        },
    },
    resolve: {
        alias: {
            '@src': resolve(__dirname, 'src'),
            '@test': resolve(__dirname, 'test'),
        },
    },
});
