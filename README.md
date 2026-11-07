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

项目目录为 `C:\Users\chiale\Desktop\academicpage`。本机已安装共享 Ruby 环境 `C:\Ruby33-x64`。预览脚本根据自身位置定位项目，重命名项目文件夹无需修改脚本中的路径。在 PowerShell 执行：

```powershell
cd C:\Users\chiale\Desktop\academicpage
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

桌面端的访客地图在侧栏图标下方，手机端在整页正文之后；同一地图组件会随屏幕宽度移动。地图 ID 和样式来自此前提供的 whos.amung.us 嵌入代码。`assets/js/visitor-map.js` 先定位组件并注册参数，再加载地图脚本，避免缓存加载顺序造成空白；外部服务加载失败时会显示提示及重新加载按钮。

## GitHub Pages 发布

目标仓库为 `Nuyoahwjl/academicpage`，本地 `origin` 已设为 `https://github.com/Nuyoahwjl/academicpage.git`。正式网址为 `https://wangjiale.xyz`；`_config.yml` 已配置 `url`、空的 `baseurl` 和 `repository`。自定义域名从网站根目录提供页面，因此不要把 `baseurl` 改为 `/academicpage`。工作流会读取 GitHub Pages 的实际访问路径。

本轮仅准备本地配置，未创建远程仓库、提交、推送、开启 Pages 或修改 DNS。以后准备发布时：

1. 在自己的 GitHub 账号下创建仓库 `academicpage`。当前本地分支为 `master`；工作流同时支持 `master` 和 `main`。
2. 在仓库 **Settings → Pages → Source** 中选择 **GitHub Actions**，在 **Custom domain** 填写 `wangjiale.xyz`。建议先在个人账号 **Settings → Pages** 验证域名归属，再配置 DNS。
3. 在域名的 DNS 控制台设置以下记录。若根域名已有其他网站的记录，应在正式切换时调整，当前无需改动：

   | 类型 | 主机记录 | 记录值 |
   | --- | --- | --- |
   | A | `@` | `185.199.108.153` |
   | A | `@` | `185.199.109.153` |
   | A | `@` | `185.199.110.153` |
   | A | `@` | `185.199.111.153` |
   | CNAME（可选） | `www` | `nuyoahwjl.github.io` |

   如果 DNS 服务商支持根域名 ALIAS、ANAME 或 CNAME flattening，也可用它将 `@` 指向 `nuyoahwjl.github.io`，替代上述四条 A 记录。DNS 记录值不带 `https://`，也不带 `/academicpage`。
4. 提交并推送需要发布的源码。当前工作流在 `master` 或 `main` 分支推送时构建并部署。域名和证书就绪后，在 Pages 设置中启用 **Enforce HTTPS**。

根目录 `CNAME` 保存目标域名 `wangjiale.xyz`。**GitHub Actions 自定义工作流不会用这个文件设置域名**，必须完成上面的 Pages 设置；该文件在本项目中用于记录域名，并兼容以后从分支发布的方式。

DNS 与自定义域名配置依据 [GitHub 官方文档](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site)。

## 备份与许可证

旧博客、报告、教学、作品集、样例论文、图片以及旧主题代码已从当前源码移出，备份路径记录在 `local/template-backup-path.txt`。

保留原项目 MIT 许可证 `LICENSE`。Inter 字体许可证在 `assets/fonts/OFL.txt`；图标的来源与许可证在 `_includes/icons/`。

## 外观与资料补充

桌面端导航相对整页居中，默认不选中栏目；悬停或聚焦时显示强调色下划线。右上角按钮切换明暗模式，并在当前浏览器保存偏好。使用固定的默认配色：浅色模式下为白色背景、蓝色链接和深橙色研究兴趣。侧栏加宽至 320px，地图详情允许超出地图边界显示。

研究兴趣使用常规字重。默认明暗配色变量集中在 `assets/css/main.css`。About 中的学院链接为 https://cs.hust.edu.cn/，浙大链接为中文官网 https://www.zju.edu.cn/。院徽源图和导师头像保存在 `images/icons/`。院徽源图保留完整，以 CSS 只显示左侧图案；导师头像来自其个人主页使用的 `images/profile.jpg`。

Codex 透明背景 SVG 来自 Devicon，许可证见 `images/icons/LICENSE-devicon.txt`。手机端布局本轮暂不继续调整。
