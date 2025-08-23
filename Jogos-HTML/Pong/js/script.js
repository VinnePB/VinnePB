const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const GAME_VERSION = "7.5";

let gameState = "menu";
let mode = 0; // 0 = nenhum, 1 = IA, 2 = 2P

const paddleWidth = 10;
const paddleHeight = 100;
const paddleGlowLength = 10;

let paddle1Y, paddle2Y;
const paddleSpeed = 6;
const paddleBoostSpeed = 12;
let run1Active = false;
let run2Active = false;

let ballX, ballY, ballSize, ballSpeedX, ballSpeedY;
let ballSpeedMultiplier = 1.5;

let score1 = 0;
let score2 = 0;
const maxScore = 10;

let keysPressed = {};
let paused = false;

let rebateActive = false;
let hitboxActive1 = false;
let hitboxActive2 = false;
let hitboxTimer1 = 0;
let hitboxTimer2 = 0;

const menuOptions = [
    { label: "1 Jogador (vs. IA)", action: "start_ia" },
    { label: "2 Jogadores", action: "start_2p" },
    { label: "Controles", action: "controls" }
];
let menuIndex = 0;
let iaDifficulty = 1;
let showDifficulty = false;
let showControls = false;

let obstacles = [];
const obstacleWidth = 20;
const obstacleHeight = 80;

const rebateCooldownFrames = 180;
let rebateCooldown1 = 0;
let rebateCooldown2 = 0;

let feedbackMsg = "";
let feedbackAlpha = 0;
let feedbackScale = 1;
let feedbackType = "";
let feedbackTimer = 0;
let feedbackBlocking = false;

// === EFEITOS === //
let ballTrail = [];
const trailMaxLength = 10;
let impactEffects = [];
let confettis = [];
let paddleAfterimages1 = [];
let paddleAfterimages2 = [];

// === AUDIO === //
const sfx = {
    select: new Audio("sounds/select.ogg"),
    move: new Audio("sounds/move.wav"),
    gol: new Audio("sounds/goal.wav"),
    ballHit: new Audio("sounds/ball_hit.wav"),
    obstacleBreak: new Audio("sounds/obstacle_break.wav"),
    rebate: new Audio("sounds/rebate.wav")
};

const bgMusic = {
    menu: new Audio("sounds/menu_mus.ogg"),
    controls: new Audio("sounds/controles.mp3"),
    game: new Audio("sounds/gamebgm.mp3"),
    victory: new Audio("sounds/win.mp3"),
    defeat: new Audio("sounds/lose.mp3")
};

for (let key in bgMusic) bgMusic[key].loop = true;

// === IMAGENS === //
const tennaImg = new Image();
tennaImg.src = "vfx/Tenna.png";

// === EFEITOS DE BOLA E CONFETTI === //
function addImpact(x, y, color) {
    impactEffects.push({ x, y, radius: 0, maxRadius: 20, color });
}

function addConfetti(x, y) {
    for (let i = 0; i < 30; i++) {
        confettis.push({
            x: x,
            y: y,
            vx: (Math.random() - 0.5) * 5,
            vy: Math.random() * -5 - 2,
            color: `hsl(${Math.random() * 360}, 80%, 60%)`,
            life: 60 + Math.random() * 30
        });
    }
}

function drawConfetti() {
    for (let i = confettis.length - 1; i >= 0; i--) {
        let c = confettis[i];
        ctx.fillStyle = c.color;
        ctx.fillRect(c.x, c.y, 4, 4);
        c.x += c.vx;
        c.y += c.vy;
        c.vy += 0.2;
        c.life--;
        if (c.life <= 0) confettis.splice(i, 1);
    }
}

// === FEEDBACK === //
function showFeedback(msg, type = "normal") {
    feedbackMsg = msg;
    feedbackType = type;
    feedbackAlpha = 1;
    feedbackScale = 1.5;
    feedbackBlocking = true;
    feedbackTimer = 60;

    if (type === "gol") {
        addConfetti(canvas.width / 2, canvas.height / 2);
        sfx.gol.currentTime = 0;
        sfx.gol.play();
        paused = true; // pausa apenas para mostrar gol
        setTimeout(() => {
            resetBall();
            ballSpeedX = (Math.random() > 0.5 ? 5 : -5);
            ballSpeedY = (Math.random() > 0.5 ? 3 : -3);
            paused = false;
            feedbackBlocking = false;
        }, 1000);
    }
}

// === EVENTOS DE TECLADO === //
document.addEventListener("keydown", (e) => {
    if (gameState === "menu") {
        if (showDifficulty) {
            if (e.key === "ArrowLeft" || e.key.toLowerCase() === "a") { iaDifficulty = Math.max(1, iaDifficulty - 1); sfx.move.play(); }
            if (e.key === "ArrowRight" || e.key.toLowerCase() === "d") { iaDifficulty = Math.min(3, iaDifficulty + 1); sfx.move.play(); }
            if (e.key === "Enter") { startGame(1); showDifficulty = false; sfx.select.play(); }
            if (e.key === "Escape") showDifficulty = false;
            return;
        }
        if (showControls) {
            if (e.key === "Escape" || e.key === "Enter") {
                showControls = false;
                sfx.select.play();
                bgMusic.controls.pause();
                bgMusic.menu.currentTime = 0; bgMusic.menu.play();
            }
            return;
        }
        if (e.key === "ArrowUp" || e.key.toLowerCase() === "w") { menuIndex = (menuIndex - 1 + menuOptions.length) % menuOptions.length; sfx.move.play(); }
        if (e.key === "ArrowDown" || e.key.toLowerCase() === "s") { menuIndex = (menuIndex + 1) % menuOptions.length; sfx.move.play(); }
        if (e.key === "Enter") {
            const action = menuOptions[menuIndex].action;
            if (action === "start_ia") showDifficulty = true;
            else if (action === "start_2p") { startGame(2); }
            else if (action === "controls") { showControls = true; bgMusic.menu.pause(); bgMusic.controls.currentTime = 0; bgMusic.controls.play(); }
            sfx.select.play();
        }
    } else if (gameState === "gameover") {
        if (e.key === "Enter") {
            gameState = "menu";
            score1 = 0; score2 = 0; paused = false; feedbackBlocking = false;
            confettis = []; ballTrail = []; impactEffects = [];
            bgMusic.victory.pause(); bgMusic.defeat.pause();
            bgMusic.menu.currentTime = 0; bgMusic.menu.play();
            sfx.select.play();
        }
    } else {
        if (e.key.toLowerCase() === "p") paused = !paused;
        else if (e.key.toLowerCase() === "0") { gameState = "menu"; paused = false; score1 = 0; score2 = 0; startGame(0); }
        else if (e.key.toLowerCase() === "e" && rebateCooldown1 === 0) { hitboxActive1 = true; hitboxTimer1 = 10; rebateCooldown1 = rebateCooldownFrames; sfx.rebate.currentTime = 0; sfx.rebate.play(); }
        else if (e.key.toLowerCase() === "l" && mode === 2 && rebateCooldown2 === 0) { hitboxActive2 = true; hitboxTimer2 = 10; rebateCooldown2 = rebateCooldownFrames; sfx.rebate.currentTime = 0; sfx.rebate.play(); }
        else if (e.code === "ShiftLeft") run1Active = !run1Active;
        else if (e.code === "ShiftRight") run2Active = !run2Active;
        else keysPressed[e.key] = true;
    }
});
document.addEventListener("keyup", (e) => { keysPressed[e.key] = false; });

// === INICIALIZAÇÃO DE JOGO === //
function resetRound() {
    paddle1Y = canvas.height / 2 - paddleHeight / 2;
    paddle2Y = canvas.height / 2 - paddleHeight / 2;
    resetBall();
    obstacles = [];
    rebateActive = false;

    for (let i = 0; i < 5; i++) {
        obstacles.push({ 
            x: 150 + i * 100, 
            y: Math.random() * (canvas.height - obstacleHeight), 
            w: obstacleWidth, 
            h: obstacleHeight, 
            hp: 3 
        });
    }
}

function resetBall() {
    ballSize = 10;
    ballX = canvas.width / 2;
    ballY = canvas.height / 2;
    ballSpeedX = (Math.random() > 0.5 ? 5 : -5);
    ballSpeedY = (Math.random() > 0.5 ? 3 : -3);
}

// === UPDATE JOGO === //
function updateGame() {
    if (paused) return;

    if (keysPressed["w"]) paddle1Y -= run1Active ? paddleBoostSpeed : paddleSpeed;
    if (keysPressed["s"]) paddle1Y += run1Active ? paddleBoostSpeed : paddleSpeed;

    if (mode === 2) {
        if (keysPressed["ArrowUp"]) paddle2Y -= run2Active ? paddleBoostSpeed : paddleSpeed;
        if (keysPressed["ArrowDown"]) paddle2Y += run2Active ? paddleBoostSpeed : paddleSpeed;
    } else if (mode === 1) {
        const prediction = ballY + ballSize/2 - paddleHeight/2;
        const distance = prediction - paddle2Y;
        paddle2Y += distance * 0.015 * iaDifficulty; // IA suavizada e nerfada
    }

    paddle1Y = Math.max(0, Math.min(canvas.height - paddleHeight, paddle1Y));
    paddle2Y = Math.max(0, Math.min(canvas.height - paddleHeight, paddle2Y));

    ballX += ballSpeedX;
    ballY += ballSpeedY;

    if (ballY <= 0 || ballY + ballSize >= canvas.height) ballSpeedY *= -1;

    // colisão com raquetes
    if (ballX <= 20 + paddleWidth && ballY + ballSize >= paddle1Y && ballY <= paddle1Y + paddleHeight) ballSpeedX *= -1;
    if (ballX + ballSize >= canvas.width - 20 - paddleWidth && ballY + ballSize >= paddle2Y && ballY <= paddle2Y + paddleHeight) ballSpeedX *= -1;

    // gols
    if (ballX < 0) { score2++; showFeedback("Gol!", "gol"); if(score2>=maxScore) { gameState="gameover"; bgMusic.game.pause(); bgMusic.defeat.currentTime=0; bgMusic.defeat.play(); } }
    if (ballX + ballSize > canvas.width) { score1++; showFeedback("Gol!", "gol"); if(score1>=maxScore) { gameState="gameover"; bgMusic.game.pause(); bgMusic.victory.currentTime=0; bgMusic.victory.play(); } }

    ballTrail.push({ x: ballX, y: ballY });
    if (ballTrail.length > trailMaxLength) ballTrail.shift();

    // colisão com obstáculos
    for (let i = obstacles.length - 1; i >= 0; i--) {
        let obs = obstacles[i];
        if (ballX + ballSize >= obs.x && ballX <= obs.x + obs.w && ballY + ballSize >= obs.y && ballY <= obs.y + obs.h) {
            ballSpeedX *= -1;
            obs.hp--;
            sfx.obstacleBreak.currentTime = 0;
            sfx.obstacleBreak.play();
            if (obs.hp <= 0) obstacles.splice(i, 1);
        }
    }

    if (hitboxActive1) {
        hitboxTimer1--;
        if (hitboxTimer1 <= 0) hitboxActive1 = false;
        rebateCooldown1 = Math.max(0, rebateCooldown1 - 1);
    }
    if (hitboxActive2) {
        hitboxTimer2--;
        if (hitboxTimer2 <= 0) hitboxActive2 = false;
        rebateCooldown2 = Math.max(0, rebateCooldown2 - 1);
    }

    if (feedbackAlpha > 0) {
        feedbackAlpha -= 0.02;
        feedbackScale -= 0.02;
        feedbackTimer--;
        if (feedbackTimer <= 0) feedbackBlocking = false;
    }
}

// === DRAW FUNCS === //
function drawMenu() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "white"; ctx.font = "40px Undertale"; ctx.textAlign = "center";
    ctx.fillText("PONG", canvas.width / 2, 120);
    ctx.font = "16px Undertale"; ctx.fillStyle = "#aaa"; ctx.textAlign = "right";
    ctx.fillText(`v${GAME_VERSION}`, canvas.width - 20, canvas.height - 20);
    ctx.textAlign = "center";

    if (showDifficulty) {
        ctx.font = "28px Undertale"; ctx.fillStyle = "white";
        ctx.fillText("Escolha a dificuldade da IA", canvas.width / 2, 220);
        let diffText = iaDifficulty === 1 ? "Fácil" : iaDifficulty === 2 ? "Médio" : "Difícil";
        ctx.font = "32px Undertale"; ctx.fillStyle = "yellow";
        ctx.fillText(diffText, canvas.width / 2, 270);
        ctx.font = "20px Undertale"; ctx.fillStyle = "white";
        ctx.fillText("←/A Diminuir | →/D Aumentar", canvas.width / 2, 320);
        ctx.fillText("Enter para começar | Esc para voltar", canvas.width / 2, 360);
        return;
    }

    if (showControls) {
        ctx.font = "28px Undertale"; ctx.fillStyle = "white";
        ctx.fillText("Controles", canvas.width / 2, 200);
        ctx.font = "20px Undertale";
        ctx.fillText("Menu: ↑/↓ ou W/S navegar, Enter selecionar", canvas.width / 2, 240);
        ctx.fillText("Jogador 1: W/S mover, E Rebate, Shift Esquerdo toggle corrida", canvas.width / 2, 270);
        ctx.fillText("Jogador 2: ↑/↓ mover, L Rebate, Shift Direito toggle corrida", canvas.width / 2, 300);
        ctx.fillText("P para pausar", canvas.width / 2, 330);
        ctx.fillText("0 para voltar ao menu", canvas.width / 2, 360);

        const gifWidth = 150;
        const gifHeight = 100;
        ctx.drawImage(tennaImg, canvas.width / 2 - gifWidth / 2, 400, gifWidth, gifHeight);
        return;
    }

    ctx.font = "28px Undertale";
    menuOptions.forEach((opt, i) => {
        ctx.fillStyle = i === menuIndex ? "yellow" : "white";
        ctx.fillText((i === menuIndex ? ">" : "") + opt.label, canvas.width / 2, 220 + i * 40);
    });
    ctx.font = "20px Undertale"; ctx.fillStyle = "white";
    ctx.fillText("Pressione Enter para selecionar", canvas.width / 2, canvas.height - 40);
}

function drawGameOver() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "white"; ctx.font = "48px Undertale"; ctx.textAlign = "center";
    let msg = score1 >= maxScore ? "Vitória!" : "Derrota!";
    ctx.fillText(msg, canvas.width / 2, 200);
    ctx.font = "24px Undertale";
    ctx.fillText("Pressione Enter para voltar ao menu", canvas.width / 2, 280);
}

// === LOOP === //
function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (gameState === "menu") drawMenu();
    else if (gameState === "gameover") drawGameOver();
    else {
        updateGame();
        drawGame();
    }

    requestAnimationFrame(gameLoop);
}

// === START GAME === //
function startGame(selectedMode = 1) {
    mode = selectedMode;
    resetRound();
    gameState = "playing";
    paused = false;
    feedbackBlocking = false;
    confettis = [];
    ballTrail = [];
    impactEffects = [];

    bgMusic.menu.pause();
    bgMusic.game.currentTime = 0;
    bgMusic.game.play();
}

// === DRAW GAME === //
function drawGame() {
    ctx.fillStyle = "black"; ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Obstáculos
    ctx.fillStyle = "gray";
    obstacles.forEach(o => ctx.fillRect(o.x, o.y, o.w, o.h));

    // Paddle 1
    ctx.fillStyle = hitboxActive1 ? "cyan" : "white";
    ctx.fillRect(10, paddle1Y, paddleWidth, paddleHeight);

    // Paddle 2
    ctx.fillStyle = hitboxActive2 ? "magenta" : "white";
    ctx.fillRect(canvas.width - 10 - paddleWidth, paddle2Y, paddleWidth, paddleHeight);

    // Bola
    ctx.fillStyle = "white";
    ctx.fillRect(ballX, ballY, ballSize, ballSize);

    // Score
    ctx.font = "32px Undertale"; ctx.fillStyle = "white";
    ctx.fillText(score1, canvas.width/4, 50);
    ctx.fillText(score2, canvas.width*3/4, 50);

    // Feedback
    if (feedbackAlpha > 0) {
        ctx.save();
        ctx.globalAlpha = feedbackAlpha;
        ctx.font = `${32*feedbackScale}px Undertale`;
        ctx.fillStyle = feedbackType === "gol" ? "yellow" : "white";
        ctx.fillText(feedbackMsg, canvas.width/2, canvas.height/2);
        ctx.restore();
    }

    drawConfetti();

    if (paused && !feedbackBlocking) {
        ctx.fillStyle = "white"; ctx.font = "28px Undertale"; ctx.textAlign = "center";
        ctx.fillText("Jogo Pausado", canvas.width/2, canvas.height/2 - 20);
        ctx.font = "20px Undertale";
        ctx.fillText("Aperte P para resumir o jogo ou 0 para voltar ao menu", canvas.width/2, canvas.height/2 + 20);
    }
}

gameLoop();
bgMusic.menu.play();
