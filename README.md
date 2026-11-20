# 蔡士硕 · V15.2 Dreamlike Violet

基于 V15 Dreamlike Violet 的小版本修订，只调整第五页文案和联系方式；保留前四页、深紫星海、三种预览交互、全部原始项目素材。网站未公开发布。

## 本次修改
- 删除第五页大标题下的全部两段中文介绍。
- 删除底部“联系入口可在 contact-config.js 中填写真实地址”的开发提示。
- **EMAIL ME**：点击打开 `mailto:caishishuo0604@163.com`。
- **GitHub**：点击新标签页打开 `https://github.com/caishishuo86-ctrl`（noopener/noreferrer）。
- **Resume**：点击在新标签页打开网站内置 PDF `assets/Cai_Shishuo_Resume.pdf`，保留悬停/键盘聚焦的纸张预览动画。

## Windows 11 预览
1. 解压 ZIP，进入 `V15_2_Dreamlike_Violet_Resume` 文件夹。
2. 在文件夹地址栏输入 `powershell`，回车。
3. 执行 `py -m http.server 5173`（若无 py，改为 `python -m http.server 5173`）。
4. 在浏览器打开 `http://localhost:5173/#connect`。

## 简历文件
- 已放置 `assets/Cai_Shishuo_Resume.pdf`（用户上传的原始 PDF，未改写）。
- 该简历包含联系方式及个人信息；未来公开网站时，PDF 也会随网站对访客可见。

全部原有 MP4、海报及前四页代码均原样保留。


## V15.2.1 兼容性修复
- About 页面默认显示内容；仅在滚动观察能力正常时启用渐入动画。
- 浏览器不支持 IntersectionObserver 时，页面内容和第五页星空背景仍可正常显示。
- 视频自动播放被浏览器拦截或视频解码失败时，自动展开现有播放控制，保留海报作为静态兜底。
- 增加旧版媒体查询监听 API 的兼容处理。
- 原有页面文案、配色、排版、视频、海报、简历 PDF 与联系方式保持不变。
