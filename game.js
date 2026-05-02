const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

const GRAVITY = 0.6;
const GROUND = 340;

const state = {
  keys: {},
  score: 0,
  gameOver: false,
};

const player = {
  x: 50,
  y: 280,
  w: 30,
  h: 40,
  vx: 0,
  vy: 0,
  speed: 4,
  jump: -12,
  onGround: false,
};

const platforms = [
  { x: 0, y: GROUND, w: 800, h: 60 },
  { x: 180, y: 280, w: 130, h: 20 },
  { x: 380, y: 240, w: 120, h: 20 },
  { x: 580, y: 200, w: 140, h: 20 },
];

const coins = [
  { x: 230, y: 240, r: 10, taken: false },
  { x: 440, y: 200, r: 10, taken: false },
  { x: 640, y: 160, r: 10, taken: false },
  { x: 730, y: 300, r: 10, taken: false },
];

const enemies = [
  { x: 300, y: 312, w: 28, h: 28, dir: 1, min: 260, max: 360, alive: true },
  { x: 520, y: 212, w: 28, h: 28, dir: 1, min: 400, max: 560, alive: true },
];

function reset() {
  player.x = 50;
  player.y = 280;
  player.vx = 0;
  player.vy = 0;
  state.score = 0;
  state.gameOver = false;
  coins.forEach(c => c.taken = false);
  enemies.forEach(e => e.alive = true);
}

addEventListener('keydown', e => {
  state.keys[e.code] = true;
  if (e.code === 'KeyR' && state.gameOver) reset();
});
addEventListener('keyup', e => state.keys[e.code] = false);

function aabb(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

function updatePlayer() {
  player.vx = 0;
  if (state.keys['ArrowLeft']) player.vx = -player.speed;
  if (state.keys['ArrowRight']) player.vx = player.speed;
  if (state.keys['Space'] && player.onGround) {
    player.vy = player.jump;
    player.onGround = false;
  }

  player.vy += GRAVITY;
  player.x += player.vx;
  player.y += player.vy;

  player.onGround = false;
  for (const p of platforms) {
    if (
      player.x + player.w > p.x &&
      player.x < p.x + p.w &&
      player.y + player.h >= p.y &&
      player.y + player.h <= p.y + 18 &&
      player.vy >= 0
    ) {
      player.y = p.y - player.h;
      player.vy = 0;
      player.onGround = true;
    }
  }

  if (player.x < 0) player.x = 0;
  if (player.x + player.w > canvas.width) player.x = canvas.width - player.w;
  if (player.y > canvas.height) {
    state.gameOver = true;
  }
}

function updateEnemies() {
  for (const e of enemies) {
    if (!e.alive) continue;
    e.x += 1.4 * e.dir;
    if (e.x < e.min || e.x > e.max) e.dir *= -1;

    if (aabb(player, e)) {
      const stomp = player.vy > 2 && player.y + player.h - e.y < 16;
      if (stomp) {
        e.alive = false;
        player.vy = -8;
        state.score += 30;
      } else {
        state.gameOver = true;
      }
    }
  }
}

function updateCoins() {
  for (const c of coins) {
    if (c.taken) continue;
    const box = { x: c.x - c.r, y: c.y - c.r, w: c.r * 2, h: c.r * 2 };
    if (aabb(player, box)) {
      c.taken = true;
      state.score += 10;
    }
  }
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = '#5ac85a';
  platforms.forEach(p => ctx.fillRect(p.x, p.y, p.w, p.h));

  for (const c of coins) {
    if (c.taken) continue;
    ctx.beginPath();
    ctx.fillStyle = '#ffd700';
    ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.fillStyle = '#c0392b';
  enemies.forEach(e => { if (e.alive) ctx.fillRect(e.x, e.y, e.w, e.h); });

  ctx.fillStyle = '#2c3e50';
  ctx.fillRect(player.x, player.y, player.w, player.h);

  ctx.fillStyle = '#111';
  ctx.font = '20px sans-serif';
  ctx.fillText(`分數: ${state.score}`, 16, 28);

  if (coins.every(c => c.taken)) {
    ctx.fillStyle = '#0a7a0a';
    ctx.font = '36px sans-serif';
    ctx.fillText('你贏了！按 R 重玩', 260, 140);
    state.gameOver = true;
  }

  if (state.gameOver && !coins.every(c => c.taken)) {
    ctx.fillStyle = '#8b0000';
    ctx.font = '36px sans-serif';
    ctx.fillText('Game Over！按 R 重來', 250, 140);
  }
}

function loop() {
  if (!state.gameOver) {
    updatePlayer();
    updateEnemies();
    updateCoins();
  }
  draw();
  requestAnimationFrame(loop);
}

reset();
loop();
