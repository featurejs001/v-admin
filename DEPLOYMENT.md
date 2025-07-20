# 部署指南

## 问题描述
您遇到的404错误是因为项目还没有部署到GitHub Pages。网站 `featurejs001.github.io/v-admin/` 目前不存在。

## 解决方案

### ✅ 当前状态
- ✅ 项目构建成功
- ✅ 本地预览服务器运行正常：`http://localhost:4173/v-admin/`
- ✅ GitHub Actions自动构建工作流已配置
- ✅ 手动触发工作流已配置

### 🚀 自动部署配置

#### 1. 工作流配置
- **触发分支**: `master-githb`
- **自动构建**: 每次推送到 `master-githb` 分支时自动触发
- **部署目标**: GitHub Pages
- **备用方案**: 手动触发工作流

#### 2. 启用GitHub Pages
1. 访问您的GitHub仓库：`https://github.com/featurejs001/v-admin`
2. 点击 **Settings** 标签
3. 在左侧菜单中找到 **Pages**
4. 在 **Source** 部分选择 **GitHub Actions**
5. 保存设置

#### 3. 推送代码触发部署
```bash
# 确保在master-githb分支上
git checkout master-githb

# 添加文件
git add .

# 提交更改
git commit -m "更新配置"

# 推送到GitHub（这会触发自动构建）
git push origin master-githb
```

### 🔧 手动触发部署（如果自动触发不工作）

如果自动部署没有触发，您可以手动触发：

1. 访问您的GitHub仓库：`https://github.com/featurejs001/v-admin`
2. 点击 **Actions** 标签
3. 在左侧找到 **Manual Deploy to GitHub Pages**
4. 点击 **Run workflow**
5. 选择环境（production）
6. 点击 **Run workflow**

### 📋 部署流程

1. **代码推送** → 触发GitHub Actions
2. **自动构建** → 运行 `npm run build:pro`
3. **自动部署** → 部署到GitHub Pages
4. **网站可用** → 访问 `https://featurejs001.github.io/v-admin/`

### 🔍 监控部署状态

1. 在GitHub仓库页面点击 **Actions** 标签
2. 查看最新的工作流运行状态
3. 绿色勾表示部署成功
4. 红色叉表示部署失败，点击查看错误详情

### 🌐 访问网站

部署成功后，您的Vue管理后台将在以下地址可用：
- **生产环境**: `https://featurejs001.github.io/v-admin/`
- **本地测试**: `http://localhost:4173/v-admin/`

### 🛠️ 项目技术栈

- **前端框架**: Vue 3 + Vite
- **UI组件库**: Ant Design Vue
- **路由管理**: Vue Router
- **状态管理**: Pinia
- **图表库**: ECharts
- **构建工具**: Vite
- **部署平台**: GitHub Pages

### ❗ 故障排除

#### 自动部署不工作？
1. **检查分支名称**: 确保使用 `master-githb` 分支
2. **检查工作流文件**: 确保 `.github/workflows/deploy.yml` 存在
3. **手动触发**: 使用手动触发工作流作为备用方案
4. **检查权限**: 确保仓库有GitHub Pages权限

#### 常见问题
- **404错误**: 确保GitHub Pages已启用且部署成功
- **资源加载失败**: 检查base路径 `/v-admin/` 配置
- **构建失败**: 查看Actions日志，确保依赖安装正确
- **部署失败**: 检查仓库权限和GitHub Pages设置

### 📞 支持

如果遇到问题，请检查：
1. GitHub Actions日志
2. 仓库设置中的Pages配置
3. 分支名称是否正确（master-githb）
4. 尝试手动触发工作流 