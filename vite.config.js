var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill';
import { NodeModulesPolyfillPlugin } from '@esbuild-plugins/node-modules-polyfill';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
// https://vite.dev/config/
export default defineConfig({
    plugins: [
        react(),
        nodePolyfills({
            include: ['buffer', 'process', 'util', 'stream', 'crypto'],
            globals: {
                Buffer: true,
                global: true,
                process: true,
            },
            protocolImports: true,
        })
    ],
    define: {
        'process.env': __assign(__assign({}, process.env), { VITE_SOLANA_MAINNET_RPC_URL: process.env.VITE_SOLANA_MAINNET_RPC_URL })
    },
    resolve: {
        alias: {
            buffer: 'buffer',
            process: 'process/browser',
            stream: 'stream-browserify',
            util: 'util',
        }
    },
    optimizeDeps: {
        esbuildOptions: {
            define: {
                global: 'globalThis'
            },
            plugins: [
                NodeGlobalsPolyfillPlugin({
                    process: true,
                    buffer: true
                }),
                NodeModulesPolyfillPlugin()
            ]
        }
    }
});
