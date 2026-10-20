import {fileURLToPath, URL} from 'node:url'

import {defineConfig} from 'vite'
import vue from '@vitejs/plugin-vue'

import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite';
import {ArcoResolver} from 'unplugin-vue-components/resolvers';

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        vue(),
        AutoImport({
            resolvers: [ArcoResolver()],
        }),
        Components({
            resolvers: [
                ArcoResolver({
                    sideEffect: true
                })
            ]
        })
    ],
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url))
        }
    },
    build: {
        rollupOptions: {
            output: {
                // 拆分缓存友好的 chunk：三方库变化少，应用逻辑迭代时用户无需重新下载。
                // 注意：vue 运行时与 arco 必须同 chunk，拆开会产生循环依赖 TDZ 崩溃（Cannot access before initialization）
                manualChunks(id) {
                    if (!id.includes('node_modules')) {
                        if (id.includes('defaultBox.json') || id.includes('defaultSearchToolbox.json')) {
                            return 'ilink-data';
                        }
                        return undefined;
                    }
                    return 'vendor';
                }
            }
        }
    },
    base: './'
})
