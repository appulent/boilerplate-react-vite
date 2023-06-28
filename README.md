# React Vite Boilerplate

A starting template for a React project using Vite.

## NodeJs Shims

Vite does not by default install the NodeJs shims. This is required for some packages to work correctly (aws sdk).
Add the following to the `vite.config.ts` file:

```ts
import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill'
import { NodeModulesPolyfillPlugin } from '@esbuild-plugins/node-modules-polyfill'
import rollupNodePolyFill from 'rollup-plugin-node-polyfills'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      './runtimeConfig': './runtimeConfig.browser',
      global: 'rollup-plugin-node-polyfills/polyfills/global',
      util: 'rollup-plugin-node-polyfills/polyfills/util',
      sys: 'util',
      events: 'rollup-plugin-node-polyfills/polyfills/events',
      stream: 'rollup-plugin-node-polyfills/polyfills/stream',
      path: 'rollup-plugin-node-polyfills/polyfills/path',
      querystring: 'rollup-plugin-node-polyfills/polyfills/qs',
      punycode: 'rollup-plugin-node-polyfills/polyfills/punycode',
      url: 'rollup-plugin-node-polyfills/polyfills/url',
      string_decoder: 'rollup-plugin-node-polyfills/polyfills/string-decoder',
      http: 'rollup-plugin-node-polyfills/polyfills/http',
      https: 'rollup-plugin-node-polyfills/polyfills/http',
      os: 'rollup-plugin-node-polyfills/polyfills/os',
      assert: 'rollup-plugin-node-polyfills/polyfills/assert',
      constants: 'rollup-plugin-node-polyfills/polyfills/constants',
      _stream_duplex: 'rollup-plugin-node-polyfills/polyfills/readable-stream/duplex',
      _stream_passthrough: 'rollup-plugin-node-polyfills/polyfills/readable-stream/passthrough',
      _stream_readable: 'rollup-plugin-node-polyfills/polyfills/readable-stream/readable',
      _stream_writable: 'rollup-plugin-node-polyfills/polyfills/readable-stream/writable',
      _stream_transform: 'rollup-plugin-node-polyfills/polyfills/readable-stream/transform',
      timers: 'rollup-plugin-node-polyfills/polyfills/timers',
      console: 'rollup-plugin-node-polyfills/polyfills/console',
      vm: 'rollup-plugin-node-polyfills/polyfills/vm',
      zlib: 'rollup-plugin-node-polyfills/polyfills/zlib',
      tty: 'rollup-plugin-node-polyfills/polyfills/tty',
      domain: 'rollup-plugin-node-polyfills/polyfills/domain',
    },
  },
  optimizeDeps: {
    esbuildOptions: {
      // Node.js global to browser globalThis
      define: {
        global: 'globalThis',
      },
      // Enable esbuild polyfill plugins
      plugins: [
        NodeGlobalsPolyfillPlugin({
          process: true,
          buffer: true,
        }),
        NodeModulesPolyfillPlugin(),
      ],
    },
  },
  build: {
    rollupOptions: {
      plugins: [rollupNodePolyFill()],
    },
  },
})
```

And install dependencies:

```bash
npm install --save-dev @esbuild-plugins/node-globals-polyfill \
  @esbuild-plugins/node-modules-polyfill \
  rollup-plugin-node-polyfills
```

## Jest Testing

Installation of Jest using Typescript and SWC.

Install dependencies:

```bash
npm install -D jest \
  jest-environment-jsdom \
  @swc/core \
  @swc/jest \
  @testing-library/jest-dom \
  @testing-library/react \
  @testing-library/user-event \
  @types/jest
```

Note: the `jest` dependencies introduces 26 moderate vaulnerabilities. To run the audit with only production dependencies, `npm audit --omit=dev`.

Jest does not know how to handle css, svg and other files. The following adds a simple stub transformer that converts these files to empty strings.

Create a `jest` folder in the root of the project. Create a `config` folder inside the `jest` folder.

Create a `stubTransformer.cjs` file inside the `config` folder. Add the following to the `stubTransformer.cjs` file:

```js
module.exports = {
  process: function () {
    return {
      code: 'module.exports = ""',
    }
  },
}
```

Create a `jestSetup.ts` file inside the `config` folder. Add the following to the `jestSetup.ts` file:

```ts
import '@testing-library/jest-dom'
```

This is need to be able to use the jest-dom matchers in the tests without having to include the import.

Add the following to the `package.json` file:

For jest config:

```json
"jest": {
  "testEnvironment": "jsdom",
  "transform": {
    "^.+\\.(t|j)sx?$": [
      "@swc/jest",
      {
        "jsc": {
          "transform": {
            "react": {
              "runtime": "automatic"
            }
          }
        }
      }
    ],
    ".+\\.(css|styl|less|sass|scss|png|jpg|ttf|woff|woff2|svg)$": "<rootDir>/jest/config/stubTransformer.cjs"
  },
  "extensionsToTreatAsEsm": [
    ".ts",
    ".tsx"
  ],
  "setupFilesAfterEnv": [
    "<rootDir>/jest/config/jestSetup.ts"
  ]
}
```

Script to run tests:

```json
"scripts": {
  "test": "jest"
}
```

We do not want the tests files to be included in the final build. To exclude them create a file named `tsconfig.build.json` and add the following to the file:

```json
{
  "extends": "./tsconfig.json",
  "exclude": ["./src/__tests__/**", "./src/__mocks__/**", "src/**/*.test.ts", "src/**/*.test.tsx"]
}
```

Change the build script in the `package.json` to use this file:

```json
"scripts": {
  "build": "tsc --project tsconfig.build.json && vite build"
}
```

Optional: Add coverage threshold to the `package.json` file:

```json
"jest": {
  "coverageThreshold": {
    "global": {
      "branches": 80,
      "functions": 80,
      "lines": 80,
      "statements": 80
    }
  }
}
```

## Handling CommonJS Modules

eslint will complain about CommonJS modules. To handle this, modify the env attribute in the `.eslintrc.cjs` file:

```js
// Add the node value
env: { browser: true, es2020: true, node: true },
```

## Prettier

The prettier project recommends NOT running the formatting as part of a linter. They provide a plugin that will override eslint formatters.

Install the dependencies:

```bash
npm install --save-dev eslint-config-prettier
```

Then add the following to the `.eslintrc.cjs` file, makong sure prettier is last so it can override the other configs:

```js
{
  extends: [
    "some-other-config-you-use",
    "prettier"
  ]
}
```

## lint-staged

Install lint-staged to run eslint and prettier on staged files.

```bash
npm install --save-dev lint-staged
```

Add the configuration to the `package.json` file:

```json
"lint-staged": {
  "*.{cjs,js,jsx,ts,tsx}": [
    "eslint --fix",
    "prettier --write"
  ],
  "*.{css,scss}": [
    "prettier --write"
  ],
  "*.{json,md}": [
    "prettier --write"
  ]
}
```

Install huskey to add a git hook to run lint-staged before a commit.

```bash
npm install --save-dev husky
```

Add a script to the `package.json` file to initialize husky:

```json
"scripts": {
  "prepare": "husky install"
}
```

And run it once:

```bash
npm run prepare
```
