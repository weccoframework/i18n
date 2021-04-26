import typescript from "rollup-plugin-typescript2"
import commonjs from "rollup-plugin-commonjs"

export default {
    input: "./index.ts",

    output: [
        {
            file: `dist/wecco-i18n.umd.js`,
            name: "wecco",
            format: "umd",
            sourcemap: true
        },
        {
            file: `dist/wecco-i18n.es5.js`,
            format: "es",
            sourcemap: true
        },
    ],

    plugins: [
        typescript({
            tsconfigOverride: {
                compilerOptions: {
                    module: "ESNext",
                },
            },
        }),
        commonjs(),
    ]
}