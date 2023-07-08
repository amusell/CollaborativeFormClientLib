import pkg from "./package.json";
import tsconfig from "./tsconfig.json";
import rollupPluginTs from "rollup-plugin-ts";
import { terser } from "rollup-plugin-terser";
import builtins from "rollup-plugin-node-builtins";

const baseConf = {
    external: [
        ...Object.keys(pkg.dependencies || {}),
    ],
    input: "src/index.ts",
    output: {
        exports: "named",
        name: "CollaborativeFormPlugin",
        sourcemap: true,
    },
    plugins: [
       
    ],
};

const rollupCjsConf = rollupPluginTs({
    tsconfig: {
        ...tsconfig.compilerOptions,
    },
    hook: {
		declarationStats: declarationStats => console.log(declarationStats)
	}
});
const rollupModuleConf = rollupPluginTs({
    tsconfig: {
        ...tsconfig.compilerOptions,
        module: "ESNext",
        target: "ESNext",
    },
});
const rollupBrowserConf = rollupPluginTs({
    tsconfig: {
        ...tsconfig.compilerOptions,
        module: "es2015",
        target: "ES2015",
    },
});

export default [
    {
        ...baseConf,
        output: {
            ...baseConf.output,
            file: pkg.main,
            format: "cjs",
            sourcemap: false,
        },
        plugins: [
            builtins(),
            rollupCjsConf,
            ...baseConf.plugins,
        ],
    },
    {
        ...baseConf,
        output: {
            ...baseConf.output,
            file: pkg.module,
            format: "esm",
        },
        plugins: [
            builtins({
                sourcemap: true
            }),
            rollupModuleConf,
            terser({
                // sourcemap: true
            }),
            ...baseConf.plugins,
        ],
    },
    {
        ...baseConf,
        output: {
            ...baseConf.output,
            file: "dist/collaborative-form-plugin.bundle.min.js",
            format: "iife",
        },
        plugins: [
            builtins({
                sourcemap: true
            }),
            rollupBrowserConf,
            terser({
                // sourcemap: true
            }),
            ...baseConf.plugins,
        ],
    },
];