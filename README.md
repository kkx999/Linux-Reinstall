# Linux Reinstall

一个纯前端的 VPS Linux 系统重装命令生成器，基于 [bin456789/reinstall](https://github.com/bin456789/reinstall) 的公开用法生成命令。

> 本项目不是 `bin456789/reinstall` 的官方项目，也不修改或托管上游重装脚本。

## 特性

- 两级系统选择：发行版 → 版本
- 覆盖上游当前 Linux 发行版/家族
- 随机 Root 密码 / 自定义密码
- 使用 `crypto.getRandomValues()` 生成随机密码
- Shell 参数安全转义
- 自定义 SSH 端口
- 海外 / 中国大陆脚本源切换
- 实时命令预览
- 一键复制密码、重装命令、取消命令
- 深色 / 浅色主题
- 手机端响应式布局
- 无后端、无数据库、无账号系统
- 密码不上传、不写入 LocalStorage

## 隐私

页面的命令生成逻辑全部在浏览器中执行。

会在 LocalStorage 中保存的仅有非敏感偏好，例如：发行版、版本、SSH 端口、网络区域、密码长度与主题。**Root 密码不会写入 LocalStorage，也不会发送到任何服务器。**

## 部署到 GitHub Pages

本项目为纯静态站点，可直接通过 GitHub Pages 部署。

仓库已包含 GitHub Pages workflow。进入仓库：

`Settings → Pages → Build and deployment → Source → GitHub Actions`

之后推送到 `main` 分支即可自动部署。

## 上游项目

- https://github.com/bin456789/reinstall

执行重装前，请自行阅读上游项目文档、系统要求和风险提示。重装操作会清除系统磁盘数据。

## License

MIT
