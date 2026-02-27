#!/bin/bash

# 替换 app.js 中的玩家ID占位符
sed "s/__PLAYER_ID__/${PLAYER_ID:-108067287}/g" /usr/share/nginx/html/app.js.template > /usr/share/nginx/html/app.js

echo "=================================="
echo "  Dota2 Player Info - 战绩展示"
echo "  玩家ID: ${PLAYER_ID:-108067287}"
echo "  端口: 7963"
echo "=================================="

# 执行原始CMD
exec "$@"
