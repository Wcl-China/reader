const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const gridSize = 20;
const tileCount = canvas.width / gridSize;

let snake = [
    { x: 10, y: 10 }
];
let food = {
    x: Math.floor(Math.random() * tileCount),
    y: Math.floor(Math.random() * tileCount)
};
let dx = 0;
let dy = 0;
let score = 0;
let gameSpeed = 100;
let gameLoop;
let isGameRunning = false;
let isPaused = false;
let level = 1;
let baseSpeed = 150; // 初始速度更慢
let speedIncrement = 10; // 每关速度增加量

// 添加排行榜相关变量
let leaderboard = [];
const MAX_LEADERBOARD_SIZE = 10;

document.addEventListener('keydown', changeDirection);

// 添加按钮控制
const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');
const endBtn = document.getElementById('endBtn');

startBtn.addEventListener('click', startGame);
pauseBtn.addEventListener('click', togglePause);
endBtn.addEventListener('click', endGame);

function changeDirection(event) {
    const LEFT_KEY = 37;
    const RIGHT_KEY = 39;
    const UP_KEY = 38;
    const DOWN_KEY = 40;

    const keyPressed = event.keyCode;
    const goingUp = dy === -1;
    const goingDown = dy === 1;
    const goingRight = dx === 1;
    const goingLeft = dx === -1;

    if (keyPressed === LEFT_KEY && !goingRight) {
        dx = -1;
        dy = 0;
    }
    if (keyPressed === UP_KEY && !goingDown) {
        dx = 0;
        dy = -1;
    }
    if (keyPressed === RIGHT_KEY && !goingLeft) {
        dx = 1;
        dy = 0;
    }
    if (keyPressed === DOWN_KEY && !goingUp) {
        dx = 0;
        dy = 1;
    }
}

function drawGame() {
    // 清空画布
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 移动蛇
    const head = { x: snake[0].x + dx, y: snake[0].y + dy };
    snake.unshift(head);

    // 检查是否吃到食物
    if (head.x === food.x && head.y === food.y) {
        score += 10;
        document.getElementById('score').innerHTML = `分数：${score}`;
        
        // 检查是否需要升级
        if (score % 100 === 0) {
            level++;
            document.getElementById('level').innerHTML = `第${level}关`;
            
            // 提升速度
            gameSpeed = Math.max(baseSpeed - (level - 1) * speedIncrement, 50); // 设置最小速度限制
            
            // 重新设置游戏循环
            clearInterval(gameLoop);
            gameLoop = setInterval(drawGame, gameSpeed);
            
            // 显示升级提示
            const levelUpText = document.createElement('div');
            levelUpText.className = 'level-up';
            levelUpText.textContent = `升级到第${level}关！`;
            document.querySelector('.game-container').appendChild(levelUpText);
            
            // 2秒后移除提示
            setTimeout(() => {
                levelUpText.remove();
            }, 2000);
        }
        
        generateFood();
    } else {
        snake.pop();
    }

    // 检查游戏结束
    if (checkCollision()) {
        gameOver();
        return;
    }

    // 绘制食物
    ctx.fillStyle = 'red';
    ctx.fillRect(food.x * gridSize, food.y * gridSize, gridSize - 2, gridSize - 2);

    // 绘制蛇
    ctx.fillStyle = 'green';
    snake.forEach(segment => {
        ctx.fillRect(segment.x * gridSize, segment.y * gridSize, gridSize - 2, gridSize - 2);
    });
}

function generateFood() {
    food.x = Math.floor(Math.random() * tileCount);
    food.y = Math.floor(Math.random() * tileCount);
}

function checkCollision() {
    // 撞墙
    if (snake[0].x < 0 || snake[0].x >= tileCount || 
        snake[0].y < 0 || snake[0].y >= tileCount) {
        return true;
    }
    
    // 撞到自己
    for (let i = 1; i < snake.length; i++) {
        if (snake[i].x === snake[0].x && snake[i].y === snake[0].y) {
            return true;
        }
    }
    return false;
}

function resetGame() {
    snake = [{ x: 10, y: 10 }];
    food = {
        x: Math.floor(Math.random() * tileCount),
        y: Math.floor(Math.random() * tileCount)
    };
    dx = 0;
    dy = 0;
    score = 0;
    level = 1;
    gameSpeed = baseSpeed;
    document.getElementById('score').innerHTML = `分数：${score}`;
    document.getElementById('level').innerHTML = `第${level}关`;
    
    // 清除之前的游戏循环
    if (gameLoop) {
        clearInterval(gameLoop);
    }
    
    gameLoop = setInterval(drawGame, gameSpeed);
}

function startGame() {
    if (!isGameRunning) {
        resetGame();
        isGameRunning = true;
        isPaused = false;
        startBtn.disabled = true;
        pauseBtn.disabled = false;
        endBtn.disabled = false;
    }
}

function togglePause() {
    if (isGameRunning) {
        if (isPaused) {
            // 恢复游戏
            gameLoop = setInterval(drawGame, gameSpeed);
            pauseBtn.textContent = '暂停游戏';
            isPaused = false;
        } else {
            // 暂停游戏
            clearInterval(gameLoop);
            pauseBtn.textContent = '恢复游戏';
            isPaused = true;
        }
    }
}

function endGame() {
    if (isGameRunning) {
        clearInterval(gameLoop);
        
        if (confirm('确认要结束游戏吗？')) {
            // 确认结束游戏
            isGameRunning = false;
            isPaused = false;
            startBtn.disabled = false;
            pauseBtn.disabled = true;
            endBtn.disabled = true;
            pauseBtn.textContent = '暂停游戏';
            
            // 重置蛇的位置和方向
            snake = [{ x: 10, y: 10 }];
            dx = 0;
            dy = 0;
            
            // 重置食物位置
            food = {
                x: Math.floor(Math.random() * tileCount),
                y: Math.floor(Math.random() * tileCount)
            };
            
            // 清空画布
            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // 重置分数
            score = 0;
            document.getElementById('score').innerHTML = `分数：${score}`;
            
            // 重置关卡
            level = 1;
            gameSpeed = baseSpeed;
            document.getElementById('level').innerHTML = `第${level}关`;
        } else {
            // 取消结束游戏，保持暂停状态
            isPaused = true;
            pauseBtn.textContent = '恢复游戏';
        }
    }
}

function gameOver() {
    if (isGameRunning) {
        clearInterval(gameLoop);
        alert(`游戏结束！\n最终关卡：第${level}关\n最终得分：${score}`);
        checkHighScore();
        isGameRunning = false;
        startBtn.disabled = false;
        pauseBtn.disabled = true;
        endBtn.disabled = true;
        pauseBtn.textContent = '暂停游戏';
    }
}

// 在文件开头添加，加载保存的排行榜数据
function loadLeaderboard() {
    const savedLeaderboard = localStorage.getItem('snakeGameLeaderboard');
    if (savedLeaderboard) {
        leaderboard = JSON.parse(savedLeaderboard);
    }
    updateLeaderboardDisplay();
}

// 保存排行榜到本地存储
function saveLeaderboard() {
    localStorage.setItem('snakeGameLeaderboard', JSON.stringify(leaderboard));
}

// 更新排行榜显示
function updateLeaderboardDisplay() {
    const leaderboardElement = document.getElementById('leaderboard');
    leaderboardElement.innerHTML = '';
    
    leaderboard.forEach((entry, index) => {
        const li = document.createElement('li');
        li.className = 'leaderboard-item';
        li.innerHTML = `
            <span class="rank">#${index + 1}</span>
            <span class="name">${entry.name}</span>
            <span class="score">${entry.score}分 (${entry.level}关)</span>
        `;
        leaderboardElement.appendChild(li);
    });
}

// 检查是否是新的高分
function checkHighScore() {
    if (leaderboard.length < MAX_LEADERBOARD_SIZE || score > leaderboard[leaderboard.length - 1].score) {
        const playerName = prompt('恭喜！你获得了排行榜位置！\n请输入你的名字：');
        if (playerName) {
            const newEntry = {
                name: playerName,
                score: score,
                level: level,
                date: new Date().toISOString()
            };
            
            // 插入新记录并保持排序
            leaderboard.push(newEntry);
            leaderboard.sort((a, b) => b.score - a.score);
            
            // 保持最大长度为10
            if (leaderboard.length > MAX_LEADERBOARD_SIZE) {
                leaderboard = leaderboard.slice(0, MAX_LEADERBOARD_SIZE);
            }
            
            // 保存并更新显示
            saveLeaderboard();
            updateLeaderboardDisplay();
        }
    }
}

// 在游戏初始化时加载排行榜
document.addEventListener('DOMContentLoaded', () => {
    loadLeaderboard();
});

// 删除原来的自动开始游戏
// resetGame(); 