// ===== 配置 =====
// Docker 启动时 entrypoint.sh 会替换此默认值
const PLAYER_ID = 108067287;
const API_BASE = 'https://api.opendota.com/api';

// ===== 烟花系统 =====
class FireworksSystem {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.fireworks = [];
        this.particles = [];
        this.running = false;
        this.resize();
        window.addEventListener('resize', () => this.resize());
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    launch() {
        this.running = true;
        this.canvas.classList.add('active');

        // 初始密集发射
        for (let i = 0; i < 6; i++) {
            setTimeout(() => this.addFirework(), i * 200);
        }

        // 持续发射
        let count = 0;
        const interval = setInterval(() => {
            this.addFirework();
            if (Math.random() > 0.4) this.addFirework(); // 随机双发
            count++;
            if (count > 20) {
                clearInterval(interval);
                // 最后一波大烟花
                for (let i = 0; i < 8; i++) {
                    setTimeout(() => this.addFirework(true), i * 100);
                }
                // 淡出
                setTimeout(() => {
                    this.canvas.classList.add('fade-out');
                    setTimeout(() => {
                        this.running = false;
                        this.canvas.classList.remove('active', 'fade-out');
                    }, 1500);
                }, 2000);
            }
        }, 350);

        this.update();
    }

    addFirework(big = false) {
        const x = Math.random() * this.canvas.width * 0.8 + this.canvas.width * 0.1;
        const targetY = Math.random() * this.canvas.height * 0.5 + 50;

        this.fireworks.push({
            x: x,
            y: this.canvas.height,
            targetY: targetY,
            speed: 6 + Math.random() * 4,
            hue: Math.random() * 360,
            trail: [],
            big: big
        });
    }

    explode(fw) {
        const count = fw.big ? 100 : 50 + Math.floor(Math.random() * 30);
        const hue = fw.hue;

        for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 2 / count) * i + Math.random() * 0.3;
            const speed = (fw.big ? 6 : 3) + Math.random() * 4;

            this.particles.push({
                x: fw.x,
                y: fw.y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                hue: hue + Math.random() * 40 - 20,
                saturation: 70 + Math.random() * 30,
                lightness: 50 + Math.random() * 20,
                alpha: 1,
                decay: 0.012 + Math.random() * 0.008,
                size: fw.big ? 3 : 2,
                gravity: 0.05
            });
        }

        // 闪光环
        for (let i = 0; i < 8; i++) {
            const angle = (Math.PI * 2 / 8) * i;
            const speed = 8 + Math.random() * 3;
            this.particles.push({
                x: fw.x,
                y: fw.y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                hue: 50, // 金色
                saturation: 100,
                lightness: 80,
                alpha: 1,
                decay: 0.04,
                size: 4,
                gravity: 0.02
            });
        }
    }

    update() {
        if (!this.running) return;

        this.ctx.globalCompositeOperation = 'destination-out';
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.globalCompositeOperation = 'lighter';

        // 更新烟花弹
        for (let i = this.fireworks.length - 1; i >= 0; i--) {
            const fw = this.fireworks[i];
            fw.y -= fw.speed;

            // 拖尾
            fw.trail.push({ x: fw.x, y: fw.y });
            if (fw.trail.length > 8) fw.trail.shift();

            // 绘制拖尾
            fw.trail.forEach((t, idx) => {
                const alpha = idx / fw.trail.length * 0.6;
                this.ctx.beginPath();
                this.ctx.arc(t.x, t.y, 2, 0, Math.PI * 2);
                this.ctx.fillStyle = `hsla(${fw.hue}, 80%, 70%, ${alpha})`;
                this.ctx.fill();
            });

            // 绘制弹头
            this.ctx.beginPath();
            this.ctx.arc(fw.x, fw.y, 3, 0, Math.PI * 2);
            this.ctx.fillStyle = `hsla(${fw.hue}, 100%, 85%, 1)`;
            this.ctx.fill();

            // 到达目标高度 -> 爆炸
            if (fw.y <= fw.targetY) {
                this.explode(fw);
                this.fireworks.splice(i, 1);
            }
        }

        // 更新粒子
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.vy += p.gravity;
            p.vx *= 0.99;
            p.alpha -= p.decay;
            p.size *= 0.995;

            if (p.alpha <= 0) {
                this.particles.splice(i, 1);
                continue;
            }

            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            this.ctx.fillStyle = `hsla(${p.hue}, ${p.saturation}%, ${p.lightness}%, ${p.alpha})`;
            this.ctx.fill();

            // 发光
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.size * 2, 0, Math.PI * 2);
            this.ctx.fillStyle = `hsla(${p.hue}, ${p.saturation}%, ${p.lightness}%, ${p.alpha * 0.3})`;
            this.ctx.fill();
        }

        requestAnimationFrame(() => this.update());
    }
}

// ===== 粒子系统 =====
class ParticleSystem {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.particles = [];
        this.resize();
        window.addEventListener('resize', () => this.resize());
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    init(count = 80) {
        this.particles = [];
        for (let i = 0; i < count; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.3 - 0.2,
                size: Math.random() * 2 + 0.5,
                opacity: Math.random() * 0.5 + 0.1,
                hue: Math.random() * 60 + 10,
                pulse: Math.random() * Math.PI * 2
            });
        }
    }

    update() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.particles.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;
            p.pulse += 0.02;

            const pulsedOpacity = p.opacity * (0.5 + 0.5 * Math.sin(p.pulse));

            if (p.x < 0) p.x = this.canvas.width;
            if (p.x > this.canvas.width) p.x = 0;
            if (p.y < 0) p.y = this.canvas.height;
            if (p.y > this.canvas.height) p.y = 0;

            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            this.ctx.fillStyle = `hsla(${p.hue}, 80%, 60%, ${pulsedOpacity})`;
            this.ctx.fill();

            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.size * 3, 0, Math.PI * 2);
            this.ctx.fillStyle = `hsla(${p.hue}, 80%, 60%, ${pulsedOpacity * 0.15})`;
            this.ctx.fill();
        });

        for (let i = 0; i < this.particles.length; i++) {
            for (let j = i + 1; j < this.particles.length; j++) {
                const dx = this.particles[i].x - this.particles[j].x;
                const dy = this.particles[i].y - this.particles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 150) {
                    const opacity = (1 - dist / 150) * 0.1;
                    this.ctx.beginPath();
                    this.ctx.moveTo(this.particles[i].x, this.particles[i].y);
                    this.ctx.lineTo(this.particles[j].x, this.particles[j].y);
                    this.ctx.strokeStyle = `rgba(231, 76, 60, ${opacity})`;
                    this.ctx.lineWidth = 0.5;
                    this.ctx.stroke();
                }
            }
        }

        requestAnimationFrame(() => this.update());
    }

    start() {
        this.init();
        this.update();
    }
}

// ===== 数字动画 =====
function animateNumber(el, target, duration = 1500, suffix = '') {
    const start = 0;
    const startTime = performance.now();

    function tick(now) {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = Math.round(start + (target - start) * eased);
        el.textContent = current.toLocaleString() + suffix;
        if (progress < 1) requestAnimationFrame(tick);
    }

    requestAnimationFrame(tick);
}

// ===== 评价系统 =====
function getPerformanceRating(kills, deaths, assists, heroDamage, duration, isWin) {
    const kda = deaths === 0 ? (kills + assists) : (kills + assists) / deaths;
    const dpm = heroDamage / (duration / 60);

    let score = 0;

    if (kda >= 10) score += 40;
    else if (kda >= 6) score += 35;
    else if (kda >= 4) score += 30;
    else if (kda >= 3) score += 25;
    else if (kda >= 2) score += 20;
    else if (kda >= 1) score += 10;
    else score += 5;

    if (kills >= 15) score += 20;
    else if (kills >= 10) score += 15;
    else if (kills >= 5) score += 10;
    else score += 5;

    if (assists >= 20) score += 20;
    else if (assists >= 15) score += 18;
    else if (assists >= 10) score += 14;
    else if (assists >= 5) score += 8;
    else score += 4;

    if (dpm >= 800) score += 20;
    else if (dpm >= 500) score += 15;
    else if (dpm >= 300) score += 10;
    else score += 5;

    // 赢了就狠狠吹 🎉
    if (isWin) {
        if (score >= 85) return { grade: 'S+', desc: '👑 天神下凡！对面已卸载游戏', color: '#ffd700' };
        if (score >= 70) return { grade: 'S', desc: '🔥 杀穿对面！这把MVP没跑了', color: '#ff8c00' };
        if (score >= 60) return { grade: 'A+', desc: '💪 carry全场！队友直呼带爹', color: '#e74c3c' };
        if (score >= 50) return { grade: 'A', desc: '🎯 绝对核心！没你真赢不了', color: '#e74c3c' };
        if (score >= 40) return { grade: 'B+', desc: '⭐ 稳如老狗！团战定海神针', color: '#3498db' };
        if (score >= 30) return { grade: 'B', desc: '🛡️ 默默付出！赢了全靠你兜底', color: '#2ecc71' };
        if (score >= 20) return { grade: 'C', desc: '🤝 功不可没！队伍重要拼图', color: '#95a5a6' };
        return { grade: 'D', desc: '🍀 躺赢大师！这也是一种实力', color: '#95a5a6' };
    }

    // 输了就狠狠踩 💀
    if (score >= 85) return { grade: 'S+', desc: '😭 你尽力了 但队友不配拥有你', color: '#ffd700' };
    if (score >= 70) return { grade: 'S', desc: '💔 一人扛不住四个坑 太难了', color: '#ff8c00' };
    if (score >= 60) return { grade: 'A+', desc: '🤡 打得挺好 下次别打了', color: '#e74c3c' };
    if (score >= 50) return { grade: 'A', desc: '🪦 虽败犹荣？不，就是纯败', color: '#e74c3c' };
    if (score >= 40) return { grade: 'B+', desc: '🐌 不上不下 纯纯的酱油怪', color: '#3498db' };
    if (score >= 30) return { grade: 'B', desc: '💩 请问你这把进游戏了吗？', color: '#95a5a6' };
    if (score >= 20) return { grade: 'C', desc: '🗑️ 菜到抠脚 建议回去打人机', color: '#7f8c8d' };
    return { grade: 'F', desc: '☠️ 一坨！送到对面感恩戴德', color: '#555555' };
}

// ===== 时间格式化 =====
function formatBeijingTime(timestamp) {
    const date = new Date(timestamp * 1000);
    const options = {
        timeZone: 'Asia/Shanghai',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    };
    return date.toLocaleString('zh-CN', options);
}

function formatDuration(seconds) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
}

function formatTimeAgo(timestamp) {
    const now = Date.now() / 1000;
    const diff = now - timestamp;

    if (diff < 60) return '刚刚';
    if (diff < 3600) return `${Math.floor(diff / 60)} 分钟前`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} 小时前`;
    if (diff < 604800) return `${Math.floor(diff / 86400)} 天前`;
    return formatBeijingTime(timestamp);
}

// ===== 判断胜负 =====
function isPlayerWin(playerSlot, radiantWin) {
    const isRadiant = playerSlot < 128;
    return (isRadiant && radiantWin) || (!isRadiant && !radiantWin);
}

// ===== 触发胜利烟花 =====
function triggerVictoryFireworks() {
    const fwCanvas = document.getElementById('fireworksCanvas');
    const fireworks = new FireworksSystem(fwCanvas);
    fireworks.launch();

    // 添加金色光环
    setTimeout(() => {
        const glow = document.createElement('div');
        glow.className = 'victory-glow';
        document.body.appendChild(glow);
        setTimeout(() => glow.remove(), 3500);
    }, 500);
}

// ===== 触发失败刀劈 =====
function triggerDefeatSlash() {
    const overlay = document.getElementById('slashOverlay');
    overlay.classList.add('active');

    // 屏幕震动
    setTimeout(() => {
        document.body.classList.add('screen-shake');
        setTimeout(() => document.body.classList.remove('screen-shake'), 400);
    }, 300);

    // 第二刀震动
    setTimeout(() => {
        document.body.classList.add('screen-shake');
        setTimeout(() => document.body.classList.remove('screen-shake'), 400);
    }, 550);

    // 淡出
    setTimeout(() => {
        overlay.style.transition = 'opacity 1.5s ease';
        overlay.style.opacity = '0';
        setTimeout(() => {
            overlay.classList.remove('active');
            overlay.style.transition = '';
            overlay.style.opacity = '';
        }, 1500);
    }, 3500);
}

// ===== 主应用 =====
class DotaApp {
    constructor() {
        this.matchData = null;
        this.recentMatch = null;
        this.playerData = null;
        this.heroesMap = {};
    }

    async init() {
        // 启动粒子系统
        const canvas = document.getElementById('particleCanvas');
        const particles = new ParticleSystem(canvas);
        particles.start();

        try {
            // 获取最近比赛
            const recentRes = await fetch(`${API_BASE}/players/${PLAYER_ID}/recentMatches`);
            const recentMatches = await recentRes.json();

            if (!recentMatches || recentMatches.length === 0) {
                throw new Error('没有找到最近的比赛');
            }

            this.recentMatch = recentMatches[0];

            // 获取比赛详情
            const matchRes = await fetch(`${API_BASE}/matches/${this.recentMatch.match_id}`);
            this.matchData = await matchRes.json();

            // 找到玩家数据
            this.playerData = this.matchData.players.find(p => p.account_id === PLAYER_ID);

            // 设置页面标题为玩家昵称
            const playerName = this.playerData.personaname || '未知玩家';
            document.title = `${playerName} - DOTA 2 战绩`;

            // 渲染页面
            this.render();

            // 隐藏加载页
            setTimeout(() => {
                document.getElementById('loadingScreen').classList.add('hidden');

                // 加载完毕后触发胜败特效
                const isWin = this.playerData.win === 1;
                setTimeout(() => {
                    if (isWin) {
                        triggerVictoryFireworks();
                    } else {
                        triggerDefeatSlash();
                    }
                }, 600);
            }, 800);

            // 注册滚动观察
            this.setupScrollObserver();

        } catch (err) {
            console.error('加载失败:', err);
            document.querySelector('.loading-text').textContent = '加载失败，请刷新重试';
        }
    }

    render() {
        const hero = HERO_DATA[this.playerData.hero_id];
        if (!hero) {
            console.error('未知英雄:', this.playerData.hero_id);
            return;
        }

        const isWin = this.playerData.win === 1;
        const match = this.matchData;
        const player = this.playerData;

        // ===== 英雄展示 (手机用图片, 桌面用视频) =====
        const isMobile = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent) || window.innerWidth <= 900;
        const container = document.getElementById('heroVideoContainer');

        // 图片加载辅助函数，支持多源回退
        const loadHeroImage = (containerEl, heroName, heroCnName) => {
            // 主图片URL
            const primaryUrl = getHeroFullUrl(heroName);
            // 备用图片URL (英雄头像，通常更小但更可靠)
            const fallbackUrl = `https://cdn.akamai.steamstatic.com/apps/dota2/images/dota_react/heroes/${heroName}.png`;

            containerEl.innerHTML = `
                <img src="${primaryUrl}" 
                     crossorigin="anonymous" 
                     referrerpolicy="no-referrer"
                     style="width:100%;height:100%;object-fit:cover;object-position:center top;display:block;" 
                     alt="${heroCnName}"
                     id="heroImage">
                <div class="hero-video-overlay"></div>
            `;

            const img = containerEl.querySelector('#heroImage');
            img.onerror = () => {
                console.log('主图片加载失败，尝试备用URL:', fallbackUrl);
                img.onerror = () => {
                    console.log('备用图片也加载失败，使用纯色背景');
                    img.style.display = 'none';
                    containerEl.style.background = 'linear-gradient(135deg, #1a1a2e, #16213e, #0f3460)';
                };
                img.src = fallbackUrl;
            };
        };

        if (isMobile) {
            // 手机端: 直接用图片，带referrerpolicy和crossorigin属性
            loadHeroImage(container, hero.name, hero.cnName);
        } else {
            // 桌面端: 尝试视频, 失败则回退到图片
            const video = document.getElementById('heroVideo');
            video.src = getHeroVideoUrl(hero.name);

            const videoTimeout = setTimeout(() => {
                // 5秒还没加载出来就换图片
                loadHeroImage(container, hero.name, hero.cnName);
            }, 5000);

            video.onloadeddata = () => clearTimeout(videoTimeout);
            video.onerror = () => {
                clearTimeout(videoTimeout);
                loadHeroImage(container, hero.name, hero.cnName);
            };
        }

        // 英雄名称
        document.getElementById('heroNameCn').textContent = hero.cnName;
        document.getElementById('heroNameEn').textContent = hero.localizedName;

        // 英雄标签
        const roleTags = document.getElementById('heroRoleTags');
        const attackType = player.hero_damage > 20000 ? '高伤害' : '稳健输出';
        const tags = [hero.cnName, attackType];
        if (player.assists >= 15) tags.push('团战核心');
        if (player.hero_healing > 0) tags.push('治疗');
        if (player.tower_damage > 5000) tags.push('推进');

        roleTags.innerHTML = tags.map(t => `<span class="hero-role-tag">${t}</span>`).join('');

        // ===== 玩家昵称 =====
        const playerName = player.personaname || '未知玩家';
        const nicknameEl = document.getElementById('playerNickname');
        nicknameEl.textContent = playerName;

        // ===== 比赛结果 =====
        const resultText = document.getElementById('resultText');
        const resultGlow = document.getElementById('resultGlow');
        resultText.textContent = isWin ? '胜 利' : '败 北';
        resultText.className = `result-text ${isWin ? 'win' : 'lose'}`;
        resultGlow.className = `result-glow ${isWin ? 'win' : 'lose'}`;

        // 比赛元信息
        const duration = formatDuration(match.duration);
        const timeStr = formatBeijingTime(match.start_time);
        const timeAgo = formatTimeAgo(match.start_time);
        const gameMode = GAME_MODES[match.game_mode] || '未知模式';

        document.getElementById('matchMeta').innerHTML = `
            <span>🕐 ${duration}</span>
            <span>📅 ${timeStr}</span>
            <span>⏰ ${timeAgo}</span>
            <span>🎮 ${gameMode}</span>
        `;

        // ===== KDA =====
        setTimeout(() => {
            animateNumber(document.getElementById('killsValue'), player.kills);
            animateNumber(document.getElementById('deathsValue'), player.deaths);
            animateNumber(document.getElementById('assistsValue'), player.assists);
        }, 1000);

        const kda = player.deaths === 0 ? (player.kills + player.assists).toFixed(2) : ((player.kills + player.assists) / player.deaths).toFixed(2);
        setTimeout(() => {
            document.getElementById('kdaRatioValue').textContent = kda;
        }, 1200);

        // ===== 评价 =====
        const rating = getPerformanceRating(player.kills, player.deaths, player.assists, player.hero_damage, match.duration, isWin);
        document.getElementById('ratingGrade').textContent = rating.grade;
        document.getElementById('ratingDesc').textContent = rating.desc;
        document.getElementById('ratingBadge').style.background = `linear-gradient(135deg, ${rating.color}, ${rating.color}dd)`;

        // ===== 详细数据 =====
        setTimeout(() => {
            animateNumber(document.getElementById('heroDamage'), player.hero_damage);
            animateNumber(document.getElementById('towerDamage'), player.tower_damage);
            animateNumber(document.getElementById('gpm'), player.gold_per_min);
            animateNumber(document.getElementById('xpm'), player.xp_per_min);
            animateNumber(document.getElementById('lastHits'), player.last_hits);
            animateNumber(document.getElementById('heroLevel'), player.level);
            animateNumber(document.getElementById('netWorth'), player.net_worth);
            animateNumber(document.getElementById('heroHealing'), player.hero_healing);
        }, 1300);

        // 数据条动画
        const allPlayers = match.players;
        const maxDmg = Math.max(...allPlayers.map(p => p.hero_damage));
        const maxTower = Math.max(...allPlayers.map(p => p.tower_damage)) || 1;
        const maxGpm = Math.max(...allPlayers.map(p => p.gold_per_min));
        const maxXpm = Math.max(...allPlayers.map(p => p.xp_per_min));
        const maxLh = Math.max(...allPlayers.map(p => p.last_hits));
        const maxNw = Math.max(...allPlayers.map(p => p.net_worth));
        const maxHeal = Math.max(...allPlayers.map(p => p.hero_healing)) || 1;

        setTimeout(() => {
            document.getElementById('heroDamageBar').style.width = `${(player.hero_damage / maxDmg) * 100}%`;
            document.getElementById('towerDamageBar').style.width = `${(player.tower_damage / maxTower) * 100}%`;
            document.getElementById('gpmBar').style.width = `${(player.gold_per_min / maxGpm) * 100}%`;
            document.getElementById('xpmBar').style.width = `${(player.xp_per_min / maxXpm) * 100}%`;
            document.getElementById('lastHitsBar').style.width = `${(player.last_hits / maxLh) * 100}%`;
            document.getElementById('heroLevelBar').style.width = `${(player.level / 30) * 100}%`;
            document.getElementById('netWorthBar').style.width = `${(player.net_worth / maxNw) * 100}%`;
            document.getElementById('heroHealingBar').style.width = `${(player.hero_healing / maxHeal) * 100}%`;
        }, 1600);

        // ===== 参与度 =====
        const teamKills = match.players
            .filter(p => p.isRadiant === player.isRadiant)
            .reduce((sum, p) => sum + p.kills, 0);
        const participation = teamKills > 0 ? Math.round(((player.kills + player.assists) / teamKills) * 100) : 0;

        setTimeout(() => {
            const circle = document.getElementById('participationCircle');
            const offset = 339.292 * (1 - participation / 100);
            circle.style.strokeDashoffset = offset;
            document.getElementById('participationValue').textContent = participation + '%';
        }, 1800);

        // ===== 第二屏数据 =====
        this.renderMatchDetail(match, player);
    }

    renderMatchDetail(match, player) {
        // 比分
        document.getElementById('matchScoreSummary').innerHTML = `
            <span class="score-radiant">${match.radiant_score}</span>
            <span class="score-vs">VS</span>
            <span class="score-dire">${match.dire_score}</span>
        `;

        // 天辉/夜魇结果
        const radiantResult = document.getElementById('radiantResult');
        const direResult = document.getElementById('direResult');
        radiantResult.textContent = match.radiant_win ? '胜利' : '失败';
        radiantResult.className = `team-result ${match.radiant_win ? 'win' : 'lose'}`;
        direResult.textContent = match.radiant_win ? '失败' : '胜利';
        direResult.className = `team-result ${match.radiant_win ? 'lose' : 'win'}`;

        document.getElementById('radiantScore').textContent = match.radiant_score;
        document.getElementById('direScore').textContent = match.dire_score;

        // 玩家列表
        const radiantPlayers = match.players.filter(p => p.isRadiant);
        const direPlayers = match.players.filter(p => !p.isRadiant);

        document.getElementById('radiantPlayers').innerHTML = radiantPlayers.map(p => this.renderPlayerRow(p)).join('');
        document.getElementById('direPlayers').innerHTML = direPlayers.map(p => this.renderPlayerRow(p)).join('');

        // 比赛总览
        document.getElementById('matchDuration').textContent = formatDuration(match.duration);
        document.getElementById('gameMode').textContent = GAME_MODES[match.game_mode] || '未知';
        document.getElementById('lobbyType').textContent = LOBBY_TYPES[match.lobby_type] || '未知';
        document.getElementById('matchIdDisplay').textContent = match.match_id;
        document.getElementById('matchLink').href = `https://www.opendota.com/matches/${match.match_id}`;
    }

    renderPlayerRow(p) {
        const hero = HERO_DATA[p.hero_id];
        const isMe = p.account_id === PLAYER_ID;
        const heroIcon = hero ? getHeroIconUrl(hero.name) : '';
        const heroName = hero ? hero.cnName : `英雄#${p.hero_id}`;
        const playerName = p.personaname || '匿名玩家';

        return `
            <div class="player-row ${isMe ? 'is-me' : ''}">
                <img class="player-hero-icon" src="${heroIcon}" alt="${heroName}" crossorigin="anonymous" referrerpolicy="no-referrer" onerror="this.style.display='none'">
                <span class="player-name">
                    ${playerName}
                    <span class="hero-cn-name">${heroName}</span>
                </span>
                <span class="col-kda">
                    <span class="k">${p.kills}</span>/<span class="d">${p.deaths}</span>/<span class="a">${p.assists}</span>
                </span>
                <span>${p.last_hits}</span>
                <span>${p.gold_per_min}</span>
                <span>${p.xp_per_min}</span>
                <span class="col-dmg">${(p.hero_damage || 0).toLocaleString()}</span>
                <span class="col-tower">${(p.tower_damage || 0).toLocaleString()}</span>
                <span class="col-net">${(p.net_worth || 0).toLocaleString()}</span>
            </div>
        `;
    }

    setupScrollObserver() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        }, { threshold: 0.2 });

        document.querySelectorAll('.team-section').forEach(el => observer.observe(el));
        const summaryCards = document.querySelector('.match-summary-cards');
        if (summaryCards) observer.observe(summaryCards);
    }
}

// ===== 鼠标跟随闪光特效 =====
let sparkleTimeout;
document.addEventListener('mousemove', (e) => {
    if (sparkleTimeout) return;
    sparkleTimeout = setTimeout(() => { sparkleTimeout = null; }, 80);

    if (Math.random() > 0.4) return;

    const sparkle = document.createElement('div');
    sparkle.className = 'sparkle';
    sparkle.style.left = (e.clientX + (Math.random() - 0.5) * 20) + 'px';
    sparkle.style.top = (e.clientY + (Math.random() - 0.5) * 20) + 'px';
    sparkle.style.background = `hsl(${Math.random() * 60 + 10}, 80%, 60%)`;
    sparkle.style.width = (Math.random() * 4 + 2) + 'px';
    sparkle.style.height = sparkle.style.width;
    document.body.appendChild(sparkle);

    setTimeout(() => sparkle.remove(), 1000);
});

// ===== 启动 =====
document.addEventListener('DOMContentLoaded', () => {
    const app = new DotaApp();
    app.init();
});
