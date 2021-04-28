import typescript from "rollup-plugin-typescript2"
import commonjs from "rollup-plugin-commonjs"

import { compilerOptions } from "./tsconfig.json"
// tsconfig.json sets the module to "CommonJS" which is required for ts-node/register
// to work. However, bundling UMD and ES5 requires the option to be set to "ESNext".
compilerOptions.module = "ESNext"

export default {
    input: "./index.ts",

    output: [
        {
            file: `dist/weccoframework-i18n.umd.js`,
            name: "@weccoframework/i18n",
            format: "umd",
            sourcemap: true
        },
        {
            file: `dist/weccoframework-i18n.es5.js`,
            format: "es",
            sourcemap: true
        },
    ],

    plugins: [
        typescript({
            tsconfigOverride: {
                compilerOptions: compilerOptions,
                include: [
                    "src/**/*.ts",
                    "index.ts",
                ],
            },
        }),
        commonjs(),
    ]
}