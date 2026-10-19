# iLink

基于 Vue3 写的自用导航（原「咕咕导航 gugu-portal」，现已更名 **iLink**），纯静态页面无后端，框架用了 [Arco Design](https://arco.design/vue/docs/start) 。

可以直接在线编辑导航内容，所有面板、分类、网址链接都可以随意新增、修改、删除、拖拽位置，数据以 JSON 形式的配置保存在浏览器 `localStorage` 的 `customBox` 中。

## 特性

- 纯静态、无后端、零成本部署（GitHub Pages / Vercel 均可）
- 面板 / 分类 / 链接三级结构，全部支持在线增删改与拖拽排序
- 可视化编辑 + JSON 直编双模式，实时双向同步
- 支持从浏览器导出的书签 HTML 文件导入，导入前可勾选面板
- **多设备云端同步**：基于 GitHub 私密 Gist 的配置快照同步，多台设备共享同一份导航配置
- favicon 自动获取，多服务降级兜底
- 本地配置损坏自动回退默认，支持一键导出 JSON 备份

在线示例： https://gugu.huiyadan.com/
备用： https://gugu-nav.vercel.app/

## 截图

![Screenshot](docs/screenshot.png)

## 云端同步（多设备共享同一份配置）

设置面板 →「云端同步」即可开启。配置以整体快照的形式存放在**你自己 GitHub 账号下的私密 Gist**（文件名 `ilink-config.json`）中，iLink 不经过任何第三方服务器。

### 开启步骤

1. 登录 GitHub 后进入 [Personal access tokens (fine-grained)](https://github.com/settings/personal-access-tokens/new) 新建令牌：
   - 仅勾选 **Account permissions → Gists: Read and write**（无需任何仓库权限，令牌泄露影响面最小）；
   - 也可用 classic token，但仅勾选 `gist` scope。
2. 打开 iLink 设置面板，点击「云端同步」，粘贴令牌；
3. 第一台设备 **Gist ID 留空**（自动创建私密 Gist 并上传当前配置）；其他设备填入同一个 Gist ID（连接成功后可在弹窗内点「打开 Gist 页面」从网址末尾复制）；
4. 给每台设备起不同的名字（如"公司电脑"），方便在冲突提示里区分修改来源。

### 同步规则

| 场景 | 行为 |
|------|------|
| 本机修改（自动同步开启） | 3 秒防抖后自动上传覆盖云端 |
| 打开页面时云端有新版本且本机无修改 | 静默拉取并应用 |
| 打开页面时云端与本机都有修改 | 弹窗选择「用云端 / 保留本机」，绝不静默丢数据 |
| 手动「立即上传 / 立即拉取」 | 均有确认提示，覆盖方向由按钮文案标明 |

### 安全说明

- 访问令牌仅明文保存在本机浏览器 `localStorage`（key：`ilink-sync`），请务必使用**只有 Gists 权限**的令牌；
- 私密（secret）Gist 并非加密存储，任何持有 Gist 链接的人都可以访问，请勿外传；
- 断开连接只清除本机连接信息，云端数据保留，可随时重新连接恢复。

> 扩展：同步适配层位于 `src/sync/gist.js`，如需接入 Supabase 等其他存储后端，实现同签名的 `createConfigGist / fetchConfig / updateConfig` 三个接口即可无缝替换。

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Compile and Minify for Production

```sh
npm run build
```
