# By Myself 官网 · bymyself.eu.cc

纯静态网站（HTML + CSS + JS，无需构建）。设计系统来自 UI/UX Pro Max（Scroll-Triggered Storytelling + Soft UI），配色与桌面端 `src/ui/tokens.css` 一致（过去 / 现在 / 未来三色）。

```
index.html      页面
styles.css      样式（浅色 / 深色，跟随系统，可手动切换）
script.js       深浅色切换、滚动出现、心情演示、封存信倒计时
assets/         图标（复制自 src-tauri/icons）
download/       v0.2.0 安装包与便携版（来自 F:\By Myself Demo v6）
CNAME           GitHub Pages 自定义域名
```

本地预览：`python -m http.server 5181`，然后打开 http://127.0.0.1:5181/

## 上线（二选一）

### A. GitHub Pages
1. 新建仓库（如 `bymyself-site`），推送本目录。
2. Settings → Pages → Source 选 `main` / root。Custom domain 填 `bymyself.eu.cc`，勾选 Enforce HTTPS。
3. 在域名 DNS 面板添加 4 条 A 记录（主机 `@`）：`185.199.108.153`、`185.199.109.153`、`185.199.110.153`、`185.199.111.153`；可选 `www` CNAME → `<你的用户名>.github.io`。

### B. Cloudflare Pages
1. 把域名的 NS 改到 Cloudflare（eu.cc 面板支持自定义 NS）。
2. Pages → 上传本目录（Direct Upload）或连接 Git 仓库，构建命令留空，输出目录 `/`。
3. Custom domains 添加 `bymyself.eu.cc`。单文件上限 25 MB，两个 exe 都在范围内。

## 发新版时
- 替换 `download/` 里的两个 exe，并修改 `index.html` 中的版本号与大小（搜索 `0.2.0`）。
