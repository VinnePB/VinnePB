// ---------------- CONFIGURAÇÕES ----------------
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const playerWidth = 50;
const playerHeight = 30;
const playerSpeed = 5;
const bulletSpeed = 5; // tiros mais lentos
const bulletCooldownMax = 15; // frames entre tiros
const enemyBulletSpeed = 3;
const enemyRows = 4;
const enemyCols = 8;
const enemyWidth = 40;
const enemyHeight = 30;
const enemyPadding = 20;
const enemyOffsetTop = 40;
const enemyOffsetLeft = 50;
let enemySpeed = 1;

let score = 0;
let highScore = localStorage.getItem("highScore") || 0;
let level = 1;
let lives = 3;
let gameOver = false;
let gameStarted = false;
let gamePaused = false;

// ---------------- ESTADO ----------------
let rightPressed = false;
let leftPressed = false;
let spacePressed = false;
let doubleShotActive = false;
let doubleShotTimer = 0;
let bulletCooldown = 0;

let invincible = false;
let invincibleTimer = 0;

let player = {
  x: canvas.width / 2 - playerWidth / 2,
  y: canvas.height - playerHeight - 10,
  width: playerWidth,
  height: playerHeight,
  sprite: new Image(),
  trail: []
};
player.sprite.src = "sprites/ship.png";

let bullets = [];
let enemies = [];
let enemyBullets = [];
let powerUps = [];
let explosions = [];

// ---------------- SPRITES ----------------
const powerUpSprites = {
  life: new Image(),
  double: new Image()
};
powerUpSprites.life.src = "sprites/life.png";
powerUpSprites.double.src = "sprites/double.png";

// ---------------- MENU ----------------
const menu = document.getElementById("menu");
const startButton = document.getElementById("startButton");
const aboutButton = document.getElementById("aboutButton");
const backButton = document.getElementById("backButton");
const info = document.getElementById("info");

window.addEventListener("DOMContentLoaded", () => {
  startButton.addEventListener("click", () => {
    menu.style.display = "none";
    canvas.style.display = "block";
    gameStarted = true;
    createEnemies();
    draw();
  });

  aboutButton.addEventListener("click", () => {
    menu.style.display = "none";
    info.style.display = "block";
  });

  backButton.addEventListener("click", () => {
    info.style.display = "none";
    menu.style.display = "block";
  });
});

// ---------------- TECLADO ----------------
document.addEventListener("keydown", keyDownHandler);
document.addEventListener("keyup", keyUpHandler);

function keyDownHandler(e) {
  if (e.key === "Right" || e.key === "ArrowRight") rightPressed = true;
  if (e.key === "Left" || e.key === "ArrowLeft") leftPressed = true;
  if (e.key === " " || e.code === "Space") spacePressed = true;
  if (e.key === "p" || e.key === "P") gamePaused = !gamePaused;
  if ((e.key === "r" || e.key === "R") && (gamePaused || gameOver)) restartGame();
}

function keyUpHandler(e) {
  if (e.key === "Right" || e.key === "ArrowRight") rightPressed = false;
  if (e.key === "Left" || e.key === "ArrowLeft") leftPressed = false;
  if (e.key === " " || e.code === "Space") spacePressed = false;
}

// ---------------- FUNÇÕES ----------------
function createEnemies() {
  enemies = [];
  for (let row = 0; row < enemyRows; row++) {
    for (let col = 0; col < enemyCols; col++) {
      let scale = Math.random() < 0.15 ? 1.5 : 1; 
      let enemyX = col * (enemyWidth + enemyPadding) + enemyOffsetLeft;
      let enemyY = row * (enemyHeight + enemyPadding) + enemyOffsetTop;
      enemies.push({
        x: enemyX,
        y: enemyY,
        width: enemyWidth * scale,
        height: enemyHeight * scale,
        alive: true,
        hp: scale > 1 ? 3 : 1, 
        sprite: new Image(),
        trail: [],
        scale: scale
      });
      enemies[enemies.length - 1].sprite.src = "sprites/enemy.png";
    }
  }
}

// ---------------- DESENHO ----------------
function drawPlayer() {
  const trailAlpha = 0.15;
  const trailSpeedY = 1.5;

  // afterimage oposta à nave
  player.trail.push({ x: player.x, y: player.y, alpha: trailAlpha });
  if (player.trail.length > 35) player.trail.shift(); 

  player.trail.forEach((t, index) => {
    ctx.globalAlpha = t.alpha * (1 - index / player.trail.length); 
    ctx.drawImage(player.sprite, t.x, t.y, player.width, player.height);
    t.y += trailSpeedY; 
  });
  ctx.globalAlpha = 1;

  if (!(invincible && Math.floor(invincibleTimer / 5) % 2 === 0)) {
    ctx.drawImage(player.sprite, player.x, player.y, player.width, player.height);
  }
}

function drawEnemies() {
  enemies.forEach(e => {
    if (e.alive) {
      e.trail.push({ x: e.x, y: e.y, alpha: 0.2 });
      if (e.trail.length > 5) e.trail.shift();
      e.trail.forEach(t => {
        ctx.globalAlpha = t.alpha;
        ctx.drawImage(e.sprite, t.x, t.y, e.width, e.height);
      });
      ctx.globalAlpha = 1;
      ctx.drawImage(e.sprite, e.x, e.y, e.width, e.height);
    }
  });
}

function drawBullets() {
  ctx.fillStyle = "cyan";
  bullets.forEach(b => ctx.fillRect(b.x, b.y, b.width*2, b.height*2)); // mais visíveis
}

function drawEnemyBullets() {
  ctx.fillStyle = "orange";
  enemyBullets.forEach(b => ctx.fillRect(b.x, b.y, b.width, b.height));
}

function drawPowerUps() {
  powerUps.forEach(p => {
    ctx.drawImage(powerUpSprites[p.type], p.x, p.y, p.size, p.size);
  });
}

// explosão pixelada vermelha/laranja
function drawExplosions() {
  explosions.forEach((exp, i) => {
    for (let j = 0; j < 5; j++) {
      ctx.fillStyle = `rgba(${Math.random()*255},${Math.random()*100},0,${exp.alpha})`;
      ctx.fillRect(exp.x + Math.random() * exp.radius - exp.radius / 2,
                   exp.y + Math.random() * exp.radius - exp.radius / 2, 2, 2);
    }
    exp.alpha -= 0.05;
    exp.radius += 1;
    if (exp.alpha <= 0) explosions.splice(i, 1);
  });
}

function drawHUD() {
  ctx.fillStyle = "lime";
  ctx.font = "16px Courier New";
  ctx.fillText("Score: " + score, 8, 20);
  ctx.fillText("High Score: " + highScore, 650, 20);
  ctx.fillText("Lives: " + lives, 8, 40);
  ctx.fillText("Level: " + level, 650, 40);
}

// ---------------- MOVIMENTO ----------------
function movePlayer() {
  if (rightPressed && player.x < canvas.width - player.width) player.x += playerSpeed;
  if (leftPressed && player.x > 0) player.x -= playerSpeed;
}

function shootBullet() {
  if (bulletCooldown <= 0 && spacePressed) {
    if (doubleShotActive) {
      bullets.push({ x: player.x + 5, y: player.y, width: 4, height: 10 });
      bullets.push({ x: player.x + player.width - 9, y: player.y, width: 4, height: 10 });
    } else {
      bullets.push({ x: player.x + player.width / 2 - 2, y: player.y, width: 4, height: 10 });
    }
    bulletCooldown = bulletCooldownMax;
  }
}

function moveBullets() {
  for (let i = bullets.length - 1; i >= 0; i--) {
    bullets[i].y -= bulletSpeed;
    if (bullets[i].y < 0) bullets.splice(i, 1);
  }
  if (bulletCooldown > 0) bulletCooldown--;
}

function moveEnemies() {
  let edge = false;
  enemies.forEach(e => {
    if (e.alive) {
      e.x += enemySpeed;
      if (e.x + e.width > canvas.width || e.x < 0) edge = true;
    }
  });
  if (edge) {
    enemySpeed = -enemySpeed;
    enemies.forEach(e => {
      e.y += 20;
      if (e.y + e.height > player.y && !invincible) {
        lives--;
        invincible = true;
        invincibleTimer = 60;
        if (lives <= 0) gameOver = true;
      }
    });
  }
}

// ---------------- INIMIGOS ATIRANDO ----------------
function enemiesShoot() {
  enemies.forEach(e => {
    if (e.alive && Math.random() < 0.01) { // cada inimigo decide sozinho
      let shots = e.scale > 1 ? 5 : 3; // mais balas para grandes
      for (let i = 0; i < shots; i++) {
        enemyBullets.push({
          x: e.x + e.width / 2 + i*6 - (shots-1)*3 + (Math.random()*4-2), // dispersão leve
          y: e.y,
          width: 4,
          height: 10
        });
      }
    }
  });
}

function moveEnemyBullets() {
  for (let i = enemyBullets.length - 1; i >= 0; i--) {
    enemyBullets[i].y += enemyBulletSpeed;
    if (enemyBullets[i].y > canvas.height) enemyBullets.splice(i, 1);
  }
}

function movePowerUps() {
  for (let i = powerUps.length - 1; i >= 0; i--) {
    powerUps[i].y += 2;
    if (powerUps[i].y > canvas.height) powerUps.splice(i, 1);
  }
}

// ---------------- COLISÕES ----------------
function checkCollisions() {
  for (let b = bullets.length - 1; b >= 0; b--) {
    for (let e = 0; e < enemies.length; e++) {
      if (enemies[e].alive &&
          bullets[b].x < enemies[e].x + enemies[e].width &&
          bullets[b].x + bullets[b].width > enemies[e].x &&
          bullets[b].y < enemies[e].y + enemies[e].height &&
          bullets[b].y + bullets[b].height > enemies[e].y) {

        enemies[e].hp--;
        bullets.splice(b, 1);

        if (enemies[e].hp <= 0) {
          enemies[e].alive = false;
          score += 10 * enemies[e].scale;
          explosions.push({ x: enemies[e].x + enemies[e].width / 2, y: enemies[e].y + enemies[e].height / 2, radius: 10 * enemies[e].scale, alpha: 1 });

          if (Math.random() < 0.1) {
            powerUps.push({
              x: enemies[e].x,
              y: enemies[e].y,
              size: 20,
              type: Math.random() < 0.5 ? "life" : "double"
            });
          }
        }

        if (score > highScore) {
          highScore = score;
          localStorage.setItem("highScore", highScore);
        }
        break;
      }
    }
  }

  for (let i = enemyBullets.length - 1; i >= 0; i--) {
    if (enemyBullets[i].x < player.x + player.width &&
        enemyBullets[i].x + enemyBullets[i].width > player.x &&
        enemyBullets[i].y < player.y + player.height &&
        enemyBullets[i].y + enemyBullets[i].height > player.y) {

      enemyBullets.splice(i, 1);
      if (!invincible) {
        lives--;
        invincible = true;
        invincibleTimer = 60;
        if (lives <= 0) gameOver = true;
      }
    }
  }

  for (let i = powerUps.length - 1; i >= 0; i--) {
    if (powerUps[i].x < player.x + player.width &&
        powerUps[i].x + powerUps[i].size > player.x &&
        powerUps[i].y < player.y + player.height &&
        powerUps[i].y + powerUps[i].size > player.y) {

      if (powerUps[i].type === "life") lives++;
      if (powerUps[i].type === "double") {
        doubleShotActive = true;
        doubleShotTimer = 600; 
      }
      powerUps.splice(i, 1);
    }
  }
}

// ---------------- OUTROS ----------------
function checkWin() {
  if (enemies.every(e => !e.alive)) {
    level++;
    enemySpeed *= 1.2;
    createEnemies();
  }
}

function restartGame() {
  score = 0;
  level = 1;
  lives = 3;
  enemySpeed = 1;
  bullets = [];
  enemyBullets = [];
  powerUps = [];
  explosions = [];
  gameOver = false;
  gamePaused = false;
  doubleShotActive = false;
  doubleShotTimer = 0;
  invincible = false;
  invincibleTimer = 0;
  bulletCooldown = 0;
  createEnemies();
  draw();
}

// ---------------- LOOP ----------------
function draw() {
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (let i = 0; i < canvas.height; i += 4) {
    ctx.fillStyle = "rgba(0,255,0,0.05)";
    ctx.fillRect(0, i, canvas.width, 2);
  }

  if (gameOver) {
    ctx.fillStyle = "lime";
    ctx.font = "40px Courier New";
    ctx.fillText("GAME OVER", canvas.width / 2 - 130, canvas.height / 2);
    ctx.font = "20px Courier New";
    ctx.fillText("Pressione R para Reiniciar", canvas.width / 2 - 130, canvas.height / 2 + 40);
    return;
  }

  drawPlayer();
  drawBullets();
  drawEnemies();
  drawEnemyBullets();
  drawPowerUps();
  drawExplosions();
  drawHUD();

  if (!gamePaused) {
    movePlayer();
    shootBullet();
    moveBullets();
    moveEnemies();
    enemiesShoot();
    moveEnemyBullets();
    movePowerUps();
    checkCollisions();
    checkWin();

    if (doubleShotActive) {
      doubleShotTimer--;
      if (doubleShotTimer <= 0) doubleShotActive = false;
    }
    if (invincible) {
      invincibleTimer--;
      if (invincibleTimer <= 0) invincible = false;
    }
  } else {
    ctx.fillStyle = "lime";
    ctx.font = "30px Courier New";
    ctx.fillText("PAUSADO", canvas.width / 2 - 70, canvas.height / 2);
  }

  if (gameStarted) requestAnimationFrame(draw);
}
