# 🎮 Dota2 Player Info - 战绩展示

一个酷炫的 Dota 2 个人最近比赛展示页面，使用 OpenDota API 动态获取数据。

![preview](https://img.shields.io/badge/Dota2-战绩展示-red?style=for-the-badge&logo=dota2)

## ✨ 功能特性

- 🎬 **英雄动态视频** - 使用 Dota2 官方英雄渲染视频作为背景
- 📊 **详细数据展示** - KDA、伤害、经济、参与度等全方位展示
- 🎆 **胜利烟花特效** - 赢了？那就放烟花庆祝！
- ⚔️ **失败刀劈特效** - 输了？也要输得帅气！
- 🌐 **全中文界面** - 英雄名、数据标签全部中文化
- 🕐 **北京时间** - 比赛时间自动转换为北京时间
- 🔄 **每次刷新自动更新** - 动态获取最新比赛数据
- 📱 **响应式布局** - 支持桌面和移动设备
- 🐳 **Docker 部署** - 一键 Docker 部署，支持环境变量配置

## 📸 页面布局

| 区域 | 内容 |
|------|------|
| 左半屏 | 英雄动态视频全屏展示 |
| 右半屏 | KDA、伤害、经济等核心数据 + 评价 |
| 下滑一屏 | 类似 Dotabuff 的完整比赛详情表 |

## 🐳 Docker 部署

### 快速启动

```bash
docker run -d \
  --name dota2-player-info \
  -p 7963:7963 \
  -e PLAYER_ID=108067287 \
  --restart unless-stopped \
  bbblq/dota2-player-info:latest
```

### Docker Compose

```yaml
services:
  dota2-player-info:
    image: bbblq/dota2-player-info:latest
    container_name: dota2-player-info
    restart: unless-stopped
    ports:
      - "7963:7963"
    environment:
      - PLAYER_ID=108067287   # 替换为你的 Steam32 ID
```

```bash
docker-compose up -d
```

### 环境变量

| 变量 | 默认值 | 说明 |
|------|--------|------|
| `PLAYER_ID` | `108067287` | 你的 Dota2 Steam32 ID |

### 如何获取你的 Steam32 ID

1. 打开 [OpenDota](https://www.opendota.com)
2. 搜索你的 Steam 用户名
3. URL 中的数字就是你的 Steam32 ID，例如: `https://www.opendota.com/players/108067287`

## 🔧 本地开发

```bash
# 克隆仓库
git clone https://github.com/bbblq/dota2info.git
cd dota2info

# 修改 app.js 中的 __PLAYER_ID__ 为你的ID (本地开发时)
# 然后用任意 HTTP 服务器打开
npx http-server . -p 8080

# 或者用 Docker 构建
docker build -t dota2-player-info .
docker run -d -p 7963:7963 -e PLAYER_ID=你的ID dota2-player-info
```

## 📁 项目结构

```
├── index.html          # 主页面
├── style.css           # 样式与动画
├── app.js              # 核心逻辑 (烟花/刀劈/API)
├── heroes.js           # 英雄数据映射 (中英文名)
├── Dockerfile          # Docker 构建文件
├── docker-compose.yml  # Docker Compose 配置
├── nginx.conf          # Nginx 配置
├── entrypoint.sh       # 容器启动脚本
└── README.md           # 说明文档
```

## 🛠️ 技术栈

- **前端**: 纯 HTML + CSS + JavaScript（无框架依赖）
- **API**: [OpenDota API](https://docs.opendota.com/)
- **部署**: Nginx + Docker
- **英雄资源**: Valve/Dota2 官方 CDN

## 📄 License

MIT License

## 🙏 致谢

- [OpenDota](https://www.opendota.com/) - 提供免费的 Dota2 数据 API
- [Valve/Dota2](https://www.dota2.com/) - 英雄视频和图片资源
