# By Myself 官网 · bymyself.eu.cc

纯静态网站（HTML + CSS + JS，无需构建）。设计系统来自 UI/UX Pro Max（按滚动讲故事的结构 + 柔和界面风格），配色与桌面端 `src/ui/tokens.css` 一致（过去 / 现在 / 未来三色）。

```
index.html      页面
styles.css      样式（浅色 / 深色，跟随系统，可手动切换）
script.js       深浅色切换、滚动出现、心情演示、封存信倒计时
assets/         图标（复制自 src-tauri/icons）
download/       v0.2.0 安装包与便携版（来自 F:\By Myself Demo v6）
```

本地预览：`python -m http.server 5181`，然后打开 http://127.0.0.1:5181/

## 托管：Cloudflare Pages

- 项目名 `bymyself`，地址 https://bymyself.pages.dev ，自定义域名 `bymyself.eu.cc` 和 `www.bymyself.eu.cc`。
- 选 Cloudflare 而不是 GitHub Pages：GitHub Pages 的 IP 在中国大陆会被重置连接，打不开。
- DNS：域名注册在 GNAME，DNS 服务器指向 Cloudflare（`marek.ns.cloudflare.com` / `zoe.ns.cloudflare.com`）。Cloudflare 里有两条 CNAME 记录：`@` 和 `www`，都指向 `bymyself.pages.dev`，并开启代理。

## 发布 / 更新

一条命令：

```powershell
pwsh -NoProfile -File "F:\By myself Website	ools\deploy.ps1"
```

脚本会做这几件事：
- 只把网站文件复制到 `.dist`，不会带上 `.git` 和 README；
- 给 `styles.css`、`script.js` 和字体的地址加上按文件内容算出的 `?v=` 版本号；
- 写入 `_headers`：HTML 每次都重新检查，带版本号的文件长期缓存；
- 部署到 Cloudflare Pages。

为什么要加版本号：Cloudflare 默认让浏览器把 CSS、JS 缓存 4 小时。不加版本号的话，改版后老访客会拿到"新 HTML + 旧 CSS"，页面会乱掉（2026-11-26 遇到过一次）。

注意：wrangler 4.168 的 `pages project create` 会把当前目录当成要部署的内容，并按目录名去注册 workers.dev 子域名。项目已经建好，不要再运行这个命令。

## 字体（全部放在本站，不用 Google Fonts，因为它在国内被墙）

- `fonts/Inter-Variable-latin.woff2`：西文正文，复制自应用。
- `fonts/serif-sc.woff2`：Noto Serif SC 600，只保留页面用到的字，约 110 KB。**改了页面文字后要重新生成**，否则新加的字会显示成系统宋体：
  `python -m pip install fonttools brotli`，下载 `NotoSerifSC[wght].ttf`（google/fonts 仓库 ofl/notoserifsc），再运行
  `python tools/subset-serif.py NotoSerifSC[wght].ttf index.html fonts/serif-sc.woff2`

发新版时，替换 `download/` 里的两个 exe，并修改 `index.html` 里的版本号和文件大小（搜索 `0.2.0`）。

GitHub 仓库 `hqiy0831/bymyself-site` 只用来备份代码，GitHub Pages 已关闭。

## 动效

GSAP 3.13（含 ScrollTrigger，免费标准授权）和 Lenis 1.3（MIT），放在 `vendor/`，由本站自己托管。系统开启“减少动态效果”或这两个库加载失败时，会自动退回到 CSS 实现的轻量动画。

## 应用界面截图（assets/app/）

官网“真实界面”区的 12 张图（6 个页面 × 浅色/深色），都是用应用的浏览器 mock 模式截的真实界面，内容是虚构的示例数据。应用界面更新后可以重拍：

1. 在 `F:\By myself Orca` 运行 `pnpm dev --port 5190 --strictPort`
2. 运行 `node tools/app-screenshots.cjs "F:/By myself Orca/node_modules/.pnpm/playwright@1.65.1/node_modules/playwright" assets/app tools/app-demo-seed.js`

`app-demo-seed.js` 会先清空 mock 数据，再写入示例数据。它只作用于 Playwright 开的临时浏览器，不会碰你真实的日记。
