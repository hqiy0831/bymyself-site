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

只上传网站文件。不要把整个仓库目录直接交给 wrangler：它会把 `.git` 和 README 一起传上去。

```powershell
$dist = "F:\By myself Website\.dist"
Remove-Item $dist -Recurse -Force -ErrorAction SilentlyContinue; New-Item -ItemType Directory $dist | Out-Null
Copy-Item index.html,styles.css,script.js $dist; Copy-Item assets,download,fonts,vendor $dist -Recurse
Set-Location $dist; npx wrangler@4 pages deploy . --project-name=bymyself --branch=main --commit-dirty=true
```

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
