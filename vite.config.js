import {defineConfig} from 'vite';
import vue from '@vitejs/plugin-vue';
import AutoImport from 'unplugin-auto-import/vite';
import Components from 'unplugin-vue-components/vite';
import {ElementPlusResolver} from 'unplugin-vue-components/resolvers';
import {resolve} from 'path';

// https://vitejs.dev/config/
export default defineConfig({
    // 新增 server 配置
    server: {
        port: 8081, // 改成你想要的端口号
        strictPort: true, // 新增这个配置防止端口被占用时自动切换
        host: '0.0.0.0', // 允许所有网络接口访问
        open: false  // 可选：自动打开浏览器
    },
    resolve: {
        alias: {
            // @ 替代为 src
            '@': resolve(__dirname, 'src'),
            // @component 替代为 src/component
        },
    },
    plugins: [
        vue(),
        AutoImport({
            resolvers: [ElementPlusResolver()],
            // 添加 Vue 相关的自动导入配置
            imports: [
                'vue',
                {
                    'vue': [
                        'reactive',
                        'ref',
                        'computed',
                        'watch',
                        'onMounted',
                        'onUnmounted'
                        // 根据需要添加更多 Vue Hook 或 API
                    ],
                },
                'vue-router',
                {'vue-router': ['createRouter', 'createWebHistory', 'useRouter', 'useRoute']},
                'vuex',
            ],
            dts: 'src/auto-imports.d.ts',
        }),
        Components({
            resolvers: [ElementPlusResolver()],
        }),
    ],
    css: {
        preprocessorOptions: {
            scss: {
                api: 'modern-compiler',
            }
        }
    }
});
