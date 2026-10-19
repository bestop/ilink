# iLink

基于 Vue3 写的自用导航（原「咕咕导航 gugu-portal」，现已更名 **iLink**），纯静态页面无后端，框架用了 [Arco Design](https://arco.design/vue/docs/start) 。

可以直接在线编辑导航内容，所有面板、分类、网址链接都可以随意新增、修改、删除、拖拽位置，数据以 JSON 形式的配置保存在浏览器 `localStorage` 的 `customBox` 中。

## 特性

- 纯静态、无后端、零成本部署（GitHub Pages / Vercel 均可）
- 面板 / 分类 / 链接三级结构，全部支持在线增删改与拖拽排序
- 可视化编辑 + JSON 直编双模式，实时双向同步
- 支持从浏览器导出的书签 HTML 文件导入，导入前可勾选面板
- favicon 自动获取，多服务降级兜底
- 本地配置损坏自动回退默认，支持一键导出 JSON 备份

在线示例： https://gugu.huiyadan.com/
备用： https://gugu-nav.vercel.app/

## 截图

![Screenshot](docs/screenshot.png)

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
