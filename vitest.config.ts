import { defineConfig } from 'vitest/config'
import path from 'node:path'

// Mirrors the path aliases in tsconfig.json (baseUrl ./src) so tests can
// import app code that uses them.
const src = path.resolve(__dirname, 'src')

export default defineConfig({
    resolve: {
        alias: [
            { find: /^@\/(.*)$/, replacement: `${src}/$1` },
            { find: /^@lib\/(.*)$/, replacement: `${src}/lib/$1` },
            { find: /^@components\/(.*)$/, replacement: `${src}/components/$1` },
            { find: /^@tailus-ui\/(.*)$/, replacement: `${src}/components/tailus-ui/$1` },
            { find: /^app\/(.*)$/, replacement: `${src}/app/$1` },
            { find: /^trigger\/(.*)$/, replacement: `${src}/trigger/$1` },
        ],
    },
    test: {
        exclude: ['**/node_modules/**', '**/.git/**', '**/.next/**', 'tests/**', 'playwright-report/**'],
    },
})
