# Linux Reinstall

一个纯前端的 VPS Linux / Windows 系统重装命令生成器，基于 [bin456789/reinstall](https://github.com/bin456789/reinstall) 的公开用法生成命令。

[![立即使用](https://img.shields.io/badge/立即使用-打开在线工具-1689c7?style=for-the-badge&logo=linux&logoColor=white)](https://kkx999.github.io/Linux-Reinstall/)

> 本项目不是 `bin456789/reinstall` 的官方项目，也不修改或托管上游重装脚本、Linux 镜像或 Windows ISO。

## 特性

- 两级系统选择：系统 → 版本
- 覆盖上游当前主要 Linux 发行版/家族
- Windows / Windows Server ISO 重装命令生成
- Windows 自动查找官方 ISO / 自定义 ISO
- Windows 系统语言、RDP 端口、安装日志 SSH 端口设置
- 随机 Root / Administrator 密码与自定义密码
- 使用 `crypto.getRandomValues()` 生成随机密码
- Shell 参数安全转义
- 自定义 SSH 端口
- 海外 / 中国大陆脚本源切换
- 根据目标系统动态显示最低内存与磁盘要求
- 实时命令预览
- 一键复制密码、重装命令、取消命令
- 深色 / 浅色主题
- 手机端响应式布局
- 无后端、无数据库、无账号系统
- 密码不上传、不写入 LocalStorage

## Windows 说明

Windows ISO 模式使用上游脚本支持的官方原版 ISO 流程。自动模式会让上游脚本查找对应 ISO；自定义模式仅把用户填写的 ISO 地址加入命令，本项目不代理、下载或保存 ISO。

Windows 目标系统默认使用 `administrator` 用户，并支持设置 RDP 端口。页面中的“安装日志 SSH 端口”仅用于安装阶段观察日志，不代表 Windows 安装完成后的远程登录方式。

## 隐私

页面的命令生成逻辑全部在浏览器中执行。

会在 LocalStorage 中保存的仅有非敏感偏好，例如：系统、版本、SSH 端口、网络区域、密码长度、主题、Windows 语言与 RDP 端口。**Root / Administrator 密码不会写入 LocalStorage，也不会发送到任何服务器。** 自定义 ISO 地址也不会写入 LocalStorage。

## 部署到 GitHub Pages

本项目为纯静态站点，可直接通过 GitHub Pages 部署。

仓库已包含 GitHub Pages workflow。进入仓库：

`Settings → Pages → Build and deployment → Source → GitHub Actions`

之后推送到 `main` 分支即可自动部署。workflow 会先执行 JavaScript 语法检查，通过后才部署。

## 上游项目

- https://github.com/bin456789/reinstall

执行重装前，请自行阅读上游项目文档、系统要求和风险提示。重装操作会清除系统磁盘数据。

## License

MIT