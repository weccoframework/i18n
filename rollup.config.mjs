import typescript from "@rollup/plugin-typescript"
import commonjs from "@rollup/plugin-commonjs"
import terser from "@rollup/plugin-terser"

import { readFileSync } from "fs"
const { version } = JSON.parse(readFileSync("./package.json"))


export default [
    {
        input: "./index.ts",

        output: [
            {
                file: `dist/index.mjs`,
                name: "@weccoframework/core",
                format: "es",
                sourcemap: true
            },

            {
                file: `dist/index.js`,
                format: "cjs",
                sourcemap: true
            },
        ],

        plugins: [
            typescript({
                compilerOptions: {
                    module: "ESNext",
                },
            }),
            commonjs(),
        ]
    },

    {
        input: "./index.ts",

        output: [
            {
                file: "dist/weccoframework-i18n.min.js",
                format: "umd",
                name: "i18n",
                sourcemap: true,
            },

            {
                file: "dist/weccoframework-i18n.min.mjs",
                name: "@weccoframework/i18n",
                format: "es",
                sourcemap: true,
            },
        ],

        plugins: [
            typescript({
                compilerOptions: {
                    module: "ESNext",
                },
            }),
            commonjs(),
            terser({
                format: {
                    preamble: `/* @weccoframework/i18n v${version}; Copyright 2021 - 2024 Alexander Metzner. Published under the terms of the Apache License V2. */`,
                },
            }),

        ]
    },

]