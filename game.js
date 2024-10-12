const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game settings
const gravity = 0.6;
const friction = 0.8;
const platformWidth = 100;
const platformHeight = 20;

// Player settings
const player = {
    x: 50,
    y: canvas.height - 60,
    width: 40,
    height: 40,
    dx: 0,
    dy: 0,
    speed: 4,
    jumpPower: -10,
    isJumping: false,
    grounded: false,
    bullets: [],
    shootCooldown: 0
};

// Enemies
const enemies = [];
function spawnEnemy() {
    return {
        x: Math.random() * (canvas.width - 50),
        y: Math.random() * (canvas.height / 2),
        width: 40,
        height: 40,
        bullets: [],
        shootCooldown: Math.floor(Math.random() * 100) + 50
    };
}

// Random platform generator
const platforms = [];
for (let i = 0; i < 5; i++) {
    platforms.push({
        x: Math.random() * (canvas.width - platformWidth),
        y: Math.random() * (canvas.height - platformHeight),
        width: platformWidth,
        height: platformHeight
    });
}
platforms.push({x: 0, y: canvas.height - 20, width: canvas.width, height: 20}); // Ground platform

// Controls
const keys = {
    right: false,
    left: false,
    up: false
};

document.addEventListener('keydown', function(e) {
    if (e.code === 'ArrowRight') keys.right = true;
    if (e.code === 'ArrowLeft') keys.left = true;
    if (e.code === 'ArrowUp' && player.grounded) {
        player.isJumping = true;
        player.dy = player.jumpPower;
        player.grounded = false;
    }
    if (e.code === 'Space') shootBullet();
});

document.addEventListener('keyup', function(e) {
    if (e.code === 'ArrowRight') keys.right = false;
    if (e.code === 'ArrowLeft') keys.left = false;
});

// Mobile controls
document.getElementById('left').addEventListener('touchstart', () => keys.left = true);
document.getElementById('left').addEventListener('touchend', () => keys.left = false);
document.getElementById('right').addEventListener('touchstart', () => keys.right = true);
document.getElementById('right').addEventListener('touchend', () => keys.right = false);
document.getElementById('jump').addEventListener('touchstart', () => {
    if (player.grounded) {
        player.isJumping = true;
        player.dy = player.jumpPower;
        player.grounded = false;
    }
});
document.getElementById('shoot').addEventListener('touchstart', shootBullet);

function shootBullet() {
    if (player.shootCooldown <= 0) {
        player.bullets.push({x: player.x + player.width / 2, y: player.y + player.height / 2, dx: 5});
        player.shootCooldown = 20;
    }
}

// Game loop
function gameLoop() {
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Player movement
    if (keys.right) player.dx = player.speed;
    else if (keys.left) player.dx = -player.speed;
    else player.dx *= friction;

    player.dy += gravity;
    player.x += player.dx;
    player.y += player.dy;

    // Collision with platforms
    player.grounded = false;
    for (let i = 0; i < platforms.length; i++) {
        const p = platforms[i];
        if (player.x < p.x + p.width &&
            player.x + player.width > p.x &&
            player.y < p.y + p.height &&
            player.y + player.height > p.y) {
            player.grounded = true;
            player.dy = 0;
            player.y = p.y - player.height;
        }
    }

    // Prevent player from falling off the screen
    if (player.y + player.height >= canvas.height) {
        player.grounded = true;
        player.dy = 0;
        player.y = canvas.height - player.height;
    }

    // Render platforms
    ctx.fillStyle = 'black';
    for (let i = 0; i < platforms.length; i++) {
        const p = platforms[i];
        ctx.fillRect(p.x, p.y, p.width, p.height);
    }

    // Render player
    ctx.fillStyle = 'blue';
    ctx.fillRect(player.x, player.y, player.width, player.height);

    // Player shooting
    player.bullets.forEach((bullet, index) => {
        bullet.x += bullet.dx;
        ctx.fillRect(bullet.x, bullet.y, 5, 5);
        if (bullet.x > canvas.width) player.bullets.splice(index, 1);
    });
    if (player.shootCooldown > 0) player.shootCooldown--;

    // Spawn enemies
    if (enemies.length < 3) enemies.push(spawnEnemy());

    // Render enemies and enemy bullets
    enemies.forEach((enemy, index) => {
        enemy.shootCooldown--;
        if (enemy.shootCooldown <= 0) {
            enemy.bullets.push({x: enemy.x + enemy.width / 2, y: enemy.y + enemy.height / 2, dx: -3});
            enemy.shootCooldown = Math.floor(Math.random() * 100) + 50;
        }

        ctx.fillStyle = 'red';
        ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);

        // Enemy bullets
        enemy.bullets.forEach((bullet, bulletIndex) => {
            bullet.x += bullet.dx;
            ctx.fillRect(bullet.x, bullet.y, 5, 5);
            if (bullet.x < 0) enemy.bullets.splice(bulletIndex, 1);
        });
    });

    // Loop
    requestAnimationFrame(gameLoop);
}

// Start the game
gameLoop();
