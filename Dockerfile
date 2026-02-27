FROM nginx:alpine

# 安装 envsubst 工具 (已内置于 alpine nginx)
RUN apk add --no-cache bash

# 复制网页文件
COPY index.html /usr/share/nginx/html/index.html
COPY style.css /usr/share/nginx/html/style.css
COPY heroes.js /usr/share/nginx/html/heroes.js
COPY app.js /usr/share/nginx/html/app.js.template

# 复制 nginx 配置
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 复制启动脚本
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# 默认玩家ID
ENV PLAYER_ID=108067287

# 使用不常见端口 7963
EXPOSE 7963

ENTRYPOINT ["/entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]
