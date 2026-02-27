#!/bin/bash

# 用环境变量中的玩家ID替换 app.js 中的默认值
sed "s/const PLAYER_ID = [0-9]*/const PLAYER_ID = ${PLAYER_ID:-108067287}/" /usr/share/nginx/html/app.js.template > /usr/share/nginx/html/app.js

echo "=================================="
echo "  Dota2 Player Info - 战绩展示"
echo "  玩家ID: ${PLAYER_ID:-108067287}"
echo "  端口: 7963"
echo "=================================="

# 执行原始CMD
exec "$@"
