import esbuild from 'rollup-plugin-esbuild';
import pkg from '../package.json';

const compiled = (new Date()).toUTCString().replace(/GMT/g, 'UTC');
const banner = [
    `/*!`,
    ` * ${pkg.name} - v${pkg.version}`,
    ` * Compiled ${compiled}`,
    ` *`,
    ` * ${pkg.name} is licensed under the MIT License.`,
    ` * http://www.opensource.org/licenses/mit-license`,
    ` */`,
].join('\n');

const name = '_pixi_htmltext';

export default {
    input: 'src/index.ts',
    external: Object.keys(pkg.peerDependencies),
    plugins: [
        esbuild({
            target: 'es2017',
            minify: process.env.NODE_ENV === 'production',
        })
    ],
    output: [
        {
            file: pkg.module,
            format: 'es',
            sourcemap: true,
            banner,
        },
        {
            file: pkg.main,
            format: 'cjs',
            sourcemap: true,
            banner,
        },
        {
            file: pkg.bundle,
            format: 'iife',
            name,
            footer: `Object.assign(PIXI, ${name});`,
            sourcemap: true,
            banner,
            globals: {
                '@pixi/sprite': 'PIXI',
                '@pixi/core': 'PIXI',
                '@pixi/text': 'PIXI',
            }
        }
    ]
}
