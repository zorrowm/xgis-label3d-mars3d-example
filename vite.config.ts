import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { mars3dPlugin } from 'vite-plugin-mars3d'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    mars3dPlugin({
      // Vite 8 使用静态资源加载，避免 Rolldown 预构建 Mars3D/Cesium 时挂起。
      useStatic: true,
      mars3dPluginsPackageName: [],
    }),
  ],
  server: {
    port: 8080
  }
})
