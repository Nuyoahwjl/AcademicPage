# Jiale Wang 的单页学术主页

基于 Jekyll 的精简学术主页，布局参考 [AcadHomepage](https://github.com/RayeRen/acad-homepage.github.io) 和 [Yi Ren 的主页](https://rayeren.github.io/)。保留四个部分：About me、News、Publications、Honors and Awards。顶部导航只在当前页面内跳转。

## 填写内容

- `_data/homepage.yml`：个人介绍、新闻、论文和奖项。文件内已提供注释示例；把空数组 `[]` 替换为自己的列表即可。
- `_config.yml`：姓名、简介、头像、五个社交链接、正式网址和网站标题。
- `images/`：头像和论文配图。
- `files/`：论文 PDF 等附件，链接格式为 `/files/example.pdf`。
- `_data/navigation.yml`：四个页内导航的文字和锚点。

没有填写的栏目显示简短的 Coming soon，不会展示原模板作者的论文或荣誉。首页由 `index.html` 与 `_layouts/homepage.html` 渲染，无需为每篇论文建立单独页面。

## 本地预览

本机已安装共享 Ruby 环境 `C:\Ruby33-x64`。在项目根目录打开 PowerShell：

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\local\start-preview.ps1
```

打开 [http://localhost:4000](http://localhost:4000)。修改正式源码后，停止并重新启动，以同步预览副本：

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\local\stop-preview.ps1
powershell -NoProfile -ExecutionPolicy Bypass -File .\local\start-preview.ps1
```

需要安装或更新 Ruby 依赖时：

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\local\preview.ps1 -InstallOnly
```

预览源码副本、锁文件、包缓存、日志、分析与截图都在 `local/`，不会发布。当前项目不再需要 npm、JavaScript 压缩或 Sass 编译步骤。

## 文件结构

```text
_data/         四个栏目的内容与导航
_includes/     个人侧栏、五个 SVG 图标、访客地图
_layouts/      单页 HTML 布局
assets/        CSS、页内导航脚本、本地 Inter 字体及字体许可证
images/        个人照片与后续论文配图
files/         PDF 附件
index.html     四个栏目的渲染模板
_config.yml    网站与个人信息配置
local/         本地预览、旧模板备份及检查记录（不发布）
```

桌面端的访客地图在侧栏图标下方，手机端在整页正文之后；同一地图组件会随屏幕宽度移动。地图 ID 和样式来自此前提供的 whos.amung.us 嵌入代码。

## GitHub Pages 发布

将 `origin` 指向自己的仓库，并在 **Settings → Pages → Source** 中选择 **GitHub Actions**。工作流 `.github/workflows/jekyll.yml` 在 `main` 或 `master` 分支推送时构建和部署；本次未更改 Git 远程地址，也未提交、推送或发布。

## 备份与许可证

旧博客、报告、教学、作品集、样例论文、图片以及旧主题代码已从当前源码移出，备份路径记录在 `local/template-backup-path.txt`。

保留原项目 MIT 许可证 `LICENSE`。Inter 字体许可证在 `assets/fonts/OFL.txt`；图标的来源与许可证在 `_includes/icons/`。
