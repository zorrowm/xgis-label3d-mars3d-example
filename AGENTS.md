# 项目协作规范

## 项目概览

- 技术栈：Vue 3、TypeScript、Vite 8、Mars3D、Cesium、xgis-label3d。
- 入口：`src/main.ts`；地图页面：`src/App.vue`；构建配置：`vite.config.ts`。
- Mars3D 使用 `vite-plugin-mars3d` 的静态资源模式，保持 `useStatic: true`，避免 Vite 8/Rolldown 预构建卡住。
- 使用 pnpm 管理依赖并同步更新 `pnpm-lock.yaml`；当前 TypeScript 使用 `~6.0.3`，升级时必须验证 `vue-tsc` 兼容性。

## 开发约定

- 优先使用 Vue 3 Composition API 与 `<script setup lang="ts">`。
- 组件卸载前先通过 `LabelLayerManager.removeLabelLayer` 移除自己创建的图层，再销毁地图，让图层释放事件、定时器和 Worker 数据。不要直接终止 `xgis-label3d` 导出的共享 Worker。
- 不要把 Mars3D/Cesium 实例放入 Vue 的响应式状态；使用普通变量保存实例。
- 优先使用 Mars3D API 和已有类型声明，避免新增 `any`。确有第三方类型缺失时，将类型断言限制在边界处。
- 注记资源使用 `public/` 下的绝对路径（例如 `/poi/...`、`/img/...`）。
- 保持现有数据字段和演示行为；无关功能不要顺手重构。

## 验证命令

```powershell
pnpm dev
pnpm exec vite build
pnpm build
```

`pnpm build` 包含 `vue-tsc -b`，若依赖版本导致类型检查失败，需要在结果中明确记录原因；不能用跳过类型检查掩盖错误。

## 修改要求

- 修改前先检查 `git status`，保留用户已有改动。
- 每次修改应说明原因，并运行与改动相关的最小验证。
- 不要提交 `node_modules/`、`.pnpm-store/`、`dist/` 或本地缓存文件。
