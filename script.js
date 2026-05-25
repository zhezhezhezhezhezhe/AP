const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const ui = {
  shell: document.querySelector(".shell"),
  level: document.getElementById("levelLabel"),
  wave: document.getElementById("waveLabel"),
  energy: document.getElementById("energyLabel"),
  core: document.getElementById("coreLabel"),
  corePercent: document.getElementById("corePercentLabel"),
  coreBar: document.getElementById("coreBarFill"),
  mode: document.getElementById("modeLabel"),
  howToScreen: document.getElementById("howToScreen"),
  continueToMenu: document.getElementById("continueToMenuButton"),
  startScreen: document.getElementById("startScreen"),
  buildMenu: document.getElementById("buildMenu"),
  selectedInfo: document.getElementById("selectedInfo"),
  towerDetails: document.getElementById("towerDetailsContent"),
  startWave: document.getElementById("startWaveButton"),
  upgrade: document.getElementById("upgradeButton"),
  sell: document.getElementById("sellButton"),
  restart: document.getElementById("restartButton"),
  menu: document.getElementById("menuButton"),
  overlay: document.getElementById("overlay"),
  overlayKicker: document.getElementById("overlayKicker"),
  overlayTitle: document.getElementById("overlayTitle"),
  overlayText: document.getElementById("overlayText"),
  overlayPrimary: document.getElementById("overlayPrimary"),
  overlaySecondary: document.getElementById("overlaySecondary")
};

const GRID_COLS = 12;
const GRID_ROWS = 8;
const CAMPAIGN_WAVES = 5;
const MAX_CORE = 20;
const MAX_TOWER_LEVEL = 4;

const difficultySettings = {
  easy: {
    label: "Easy",
    cols: 12,
    rows: 8,
    startCoins: 220,
    core: 28,
    hpScale: 0.78,
    speedScale: 0.88,
    rewardScale: 1.25,
    waveBonus: 44,
    levelScale: 0.11,
    endlessGrowth: 0.12
  },
  normal: {
    label: "Normal",
    cols: 14,
    rows: 9,
    startCoins: 150,
    core: 20,
    hpScale: 1,
    speedScale: 1,
    rewardScale: 1,
    waveBonus: 28,
    levelScale: 0.18,
    endlessGrowth: 0.18
  },
  hard: {
    label: "Hard",
    cols: 16,
    rows: 10,
    startCoins: 115,
    core: 14,
    hpScale: 1.42,
    speedScale: 1.18,
    rewardScale: 0.86,
    waveBonus: 18,
    levelScale: 0.28,
    endlessGrowth: 0.24
  }
};

const towerTypes = {
  pulse: {
    name: "Pulse Tower",
    key: "P",
    color: "#24d8ff",
    cost: 55,
    damage: 20,
    range: 178,
    fireRate: 0.62,
    bulletSpeed: 430,
    upgrades: [
      { cost: 65, damage: 1.35, range: 1.08, fireRate: 0.9, label: "Sharper pulse coils" },
      { cost: 105, damage: 1.85, range: 1.16, fireRate: 0.82, label: "Twin-shot capacitor" },
      { cost: 155, damage: 2.45, range: 1.24, fireRate: 0.74, label: "Overclocked pulse array" }
    ],
    description: "Balanced single-target fire."
  },
  laser: {
    name: "Laser Tower",
    key: "L",
    color: "#ffd166",
    cost: 85,
    damage: 54,
    range: 205,
    fireRate: 1.18,
    bulletSpeed: 620,
    upgrades: [
      { cost: 100, damage: 1.45, range: 1.1, fireRate: 0.94, label: "Focused beam lens" },
      { cost: 150, damage: 2.05, range: 1.2, fireRate: 0.88, label: "Piercing laser matrix" },
      { cost: 220, damage: 2.85, range: 1.3, fireRate: 0.82, label: "Orbital laser link" }
    ],
    description: "Heavy damage, slower reload."
  },
  frost: {
    name: "Frost Tower",
    key: "F",
    color: "#a98cff",
    cost: 70,
    damage: 9,
    range: 170,
    fireRate: 0.85,
    bulletSpeed: 380,
    slow: 0.45,
    slowTime: 1.5,
    upgrades: [
      { cost: 85, damage: 1.25, range: 1.1, fireRate: 0.94, slow: 0.38, slowTime: 1.9, label: "Deeper freeze field" },
      { cost: 125, damage: 1.55, range: 1.2, fireRate: 0.88, slow: 0.31, slowTime: 2.3, label: "Cryo web projector" },
      { cost: 180, damage: 1.9, range: 1.3, fireRate: 0.8, slow: 0.24, slowTime: 2.8, label: "Absolute-zero lattice" }
    ],
    description: "Slows enemies in range."
  },
  blast: {
    name: "Blast Tower",
    key: "B",
    color: "#ff8a4c",
    cost: 95,
    damage: 30,
    range: 165,
    fireRate: 1.28,
    bulletSpeed: 330,
    splashRadius: 58,
    upgrades: [
      { cost: 110, damage: 1.35, range: 1.08, fireRate: 0.93, splashRadius: 1.2, label: "Wider blast charge" },
      { cost: 165, damage: 1.85, range: 1.16, fireRate: 0.87, splashRadius: 1.42, label: "Cluster detonation" },
      { cost: 240, damage: 2.45, range: 1.25, fireRate: 0.8, splashRadius: 1.68, label: "Seismic burst core" }
    ],
    description: "Area damage on impact."
  }
};

const enemyTypes = {
  runner: { name: "Runner", color: "#5cff9a", hp: 48, speed: 92, reward: 12, coreDamage: 1, radius: 11 },
  tank: { name: "Tank", color: "#ff4f68", hp: 145, speed: 43, reward: 28, coreDamage: 3, radius: 15 },
  swarm: { name: "Swarm", color: "#24d8ff", hp: 31, speed: 66, reward: 8, coreDamage: 1, radius: 9 },
  shield: { name: "Shield", color: "#ffd166", hp: 92, speed: 54, reward: 18, coreDamage: 2, radius: 13, armor: 0.28 },
  regenerator: { name: "Regen", color: "#39f0c0", hp: 82, speed: 58, reward: 20, coreDamage: 2, radius: 12, regen: 4 },
  phantom: { name: "Phantom", color: "#d7a9ff", hp: 42, speed: 112, reward: 16, coreDamage: 1, radius: 10, slowResist: 0.55 },
  boss: { name: "Data Warden", color: "#ff2f6d", hp: 620, speed: 31, reward: 140, coreDamage: 8, radius: 24, armor: 0.18, regen: 2, boss: true }
};

const levels = [
  {
    name: "Sector One",
    paths: [
      [[0, 2], [2, 2], [2, 0], [5, 0], [5, 2], [8, 2], [11, 2]],
      [[0, 6], [3, 6], [3, 4], [7, 4], [7, 6], [10, 6], [10, 3], [11, 3], [11, 2]]
    ],
    buildSlots: [[1, 1], [3, 1], [4, 1], [6, 1], [8, 1], [1, 5], [4, 5], [6, 5], [8, 5], [9, 5]],
    waves: [
      [{ type: "runner", count: 8, gap: 0.62 }],
      [{ type: "runner", count: 10, gap: 0.52 }, { type: "swarm", count: 6, gap: 0.36 }],
      [{ type: "shield", count: 5, gap: 0.72 }, { type: "runner", count: 8, gap: 0.46 }],
      [{ type: "swarm", count: 16, gap: 0.28 }, { type: "tank", count: 3, gap: 0.9 }, { type: "phantom", count: 4, gap: 0.48 }],
      [{ type: "boss", count: 1, gap: 0.1 }, { type: "shield", count: 5, gap: 0.72 }, { type: "runner", count: 12, gap: 0.38 }]
    ]
  },
  {
    name: "Broken Relay",
    paths: [
      [[0, 1], [3, 1], [3, 3], [6, 3], [6, 1], [9, 1], [9, 5], [11, 5], [11, 6]],
      [[0, 6], [2, 6], [2, 4], [5, 4], [5, 7], [8, 7], [8, 6], [11, 6]]
    ],
    buildSlots: [[1, 0], [2, 2], [4, 2], [5, 2], [7, 2], [1, 5], [3, 5], [4, 5], [6, 6], [9, 7]],
    waves: [
      [{ type: "swarm", count: 14, gap: 0.34 }],
      [{ type: "runner", count: 12, gap: 0.42 }, { type: "shield", count: 5, gap: 0.82 }],
      [{ type: "swarm", count: 18, gap: 0.25 }, { type: "regenerator", count: 5, gap: 0.72 }],
      [{ type: "tank", count: 6, gap: 0.72 }, { type: "phantom", count: 8, gap: 0.38 }],
      [{ type: "boss", count: 1, gap: 0.1 }, { type: "regenerator", count: 6, gap: 0.7 }, { type: "swarm", count: 18, gap: 0.22 }]
    ]
  },
  {
    name: "Core Gate",
    paths: [
      [[0, 1], [2, 1], [2, 0], [5, 0], [5, 2], [8, 2], [8, 4], [10, 4], [10, 5], [11, 5]],
      [[0, 7], [2, 7], [2, 5], [5, 5], [5, 7], [8, 7], [8, 6], [10, 6], [10, 7], [11, 7], [11, 5]]
    ],
    buildSlots: [[1, 0], [3, 1], [4, 1], [6, 1], [7, 3], [9, 3], [1, 6], [3, 6], [4, 6], [6, 6], [9, 7], [10, 3]],
    waves: [
      [{ type: "runner", count: 16, gap: 0.36 }],
      [{ type: "swarm", count: 20, gap: 0.22 }, { type: "phantom", count: 6, gap: 0.34 }],
      [{ type: "tank", count: 7, gap: 0.66 }, { type: "shield", count: 8, gap: 0.5 }],
      [{ type: "swarm", count: 24, gap: 0.2 }, { type: "regenerator", count: 8, gap: 0.52 }, { type: "phantom", count: 8, gap: 0.32 }],
      [{ type: "boss", count: 2, gap: 1.6 }, { type: "tank", count: 8, gap: 0.52 }, { type: "shield", count: 10, gap: 0.42 }]
    ]
  }
];

let state;
let board;
let lastTime = performance.now();
let tileSize = 64;
let boardOffset = { x: 0, y: 0 };
let pointerTile = null;
let currentRun = { mode: "campaign", difficulty: "normal" };
let rngSeed = 1;

function createState(config = currentRun) {
  const difficulty = difficultySettings[config.difficulty] || difficultySettings.normal;
  return {
    levelIndex: 0,
    waveIndex: 0,
    endlessWave: 0,
    mode: config.mode,
    difficultyKey: config.difficulty,
    difficulty,
    started: false,
    cols: difficulty.cols,
    rows: difficulty.rows,
    energy: difficulty.startCoins,
    core: difficulty.core,
    maxCore: difficulty.core,
    selectedBuildSlot: null,
    selectedTowerId: null,
    towers: [],
    enemies: [],
    bullets: [],
    spawns: [],
    activeWave: false,
    gameOver: false,
    campaignWon: false,
    message: "Click a glowing build node to open tower choices.",
    nextTowerId: 1,
    shots: [],
    floaters: []
  };
}

function resizeCanvas() {
  const rect = canvas.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  canvas.width = Math.max(720, Math.floor(rect.width * dpr));
  canvas.height = Math.max(460, Math.floor(rect.height * dpr));
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  const grid = currentGridSize();
  const padding = Math.max(18, Math.min(rect.width, rect.height) * 0.045);
  const availableWidth = Math.max(1, rect.width - padding * 2);
  const availableHeight = Math.max(1, rect.height - padding * 2);
  tileSize = Math.min(availableWidth / grid.cols, availableHeight / grid.rows);
  const boardWidth = tileSize * grid.cols;
  const boardHeight = tileSize * grid.rows;
  boardOffset = {
    x: (rect.width - boardWidth) / 2,
    y: (rect.height - boardHeight) / 2
  };
}

function currentGridSize() {
  const difficulty = state?.difficulty || difficultySettings[currentRun.difficulty] || difficultySettings.normal;
  return { cols: difficulty.cols, rows: difficulty.rows };
}

function init() {
  state = createState(currentRun);
  hideOverlay();
  hideStartScreen();
  ui.howToScreen.classList.add("hidden");
  ui.shell.classList.remove("intro-active");
  resizeCanvas();
  if (currentRun.mode === "endless") {
    loadLevel(levels.length - 1);
    state.mode = "endless";
    state.message = "Endless Mode: build before launching the first breach.";
  } else {
    loadLevel(0);
  }
  state.started = true;
  updateUI();
}

function showMainMenu() {
  currentRun = { mode: "campaign", difficulty: "normal" };
  state = createState(currentRun);
  state.started = false;
  state.message = "Choose a mission to begin.";
  hideOverlay();
  hideBuildMenu();
  ui.howToScreen.classList.add("hidden");
  ui.startScreen.classList.remove("hidden");
  ui.shell.classList.add("intro-active");
  resizeCanvas();
  loadLevel(0);
  updateUI();
}

function showHowTo() {
  currentRun = { mode: "campaign", difficulty: "normal" };
  state = createState(currentRun);
  state.started = false;
  state.message = "Read the quick guide, then choose a mission.";
  hideOverlay();
  hideBuildMenu();
  ui.startScreen.classList.add("hidden");
  ui.howToScreen.classList.remove("hidden");
  ui.shell.classList.add("intro-active");
  resizeCanvas();
  loadLevel(0);
  updateUI();
}

function hideStartScreen() {
  ui.startScreen.classList.add("hidden");
}

function startRun(mode, difficulty) {
  currentRun = { mode, difficulty };
  init();
}

function loadLevel(levelIndex) {
  state.levelIndex = levelIndex;
  state.waveIndex = 0;
  state.towers = [];
  state.enemies = [];
  state.bullets = [];
  state.spawns = [];
  state.activeWave = false;
  state.selectedTowerId = null;
  state.selectedBuildSlot = null;
  rngSeed = seedForLevel(levelIndex);
  board = makeBoard(levels[levelIndex]);
  hideBuildMenu();
  state.message = `${levels[levelIndex].name}: click a build node to place defenses.`;
}

function seedForLevel(levelIndex) {
  const source = `${currentRun.mode}:${currentRun.difficulty}:${levelIndex}`;
  let hash = 2166136261;
  for (let i = 0; i < source.length; i++) {
    hash ^= source.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function makeBoard(level) {
  const cols = state.cols;
  const rows = state.rows;
  const pathTiles = new Set();
  const paths = level.paths || [level.path];
  const pathPixels = paths.map((pathPoints) => {
    const scaledPath = pathPoints.map(([x, y]) => scalePoint(x, y, cols, rows));
    for (let i = 0; i < scaledPath.length - 1; i++) {
      const [x1, y1] = scaledPath[i];
      const [x2, y2] = scaledPath[i + 1];
      const dx = Math.sign(x2 - x1);
      const dy = Math.sign(y2 - y1);
      let x = x1;
      let y = y1;
      pathTiles.add(`${x},${y}`);
      while (x !== x2 || y !== y2) {
        x += dx;
        y += dy;
        pathTiles.add(`${x},${y}`);
      }
    }
    return scaledPath.map(([x, y]) => tileCenter(x, y));
  });

  return {
    cols,
    rows,
    pathTiles,
    pathPixels,
    buildSlots: generateBuildSlots(level, paths, pathTiles, cols, rows)
      .map(([gridX, gridY]) => {
      const center = tileCenter(gridX, gridY);
      return { gridX, gridY, x: center.x, y: center.y };
    })
  };
}

function generateBuildSlots(level, paths, pathTiles, cols, rows) {
  const targetCount = Math.min(18, Math.max(10, Math.round(cols * rows * 0.09)));
  const scaledPathSets = paths.map((path) => {
    const set = new Set();
    const scaledPath = path.map(([x, y]) => scalePoint(x, y, cols, rows));
    for (let i = 0; i < scaledPath.length - 1; i++) {
      const [x1, y1] = scaledPath[i];
      const [x2, y2] = scaledPath[i + 1];
      const dx = Math.sign(x2 - x1);
      const dy = Math.sign(y2 - y1);
      let x = x1;
      let y = y1;
      set.add(`${x},${y}`);
      while (x !== x2 || y !== y2) {
        x += dx;
        y += dy;
        set.add(`${x},${y}`);
      }
    }
    return set;
  });
  const candidates = [];
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const key = `${x},${y}`;
      if (pathTiles.has(key)) continue;
      const adjacent = countAdjacentPathTiles(x, y, pathTiles, cols, rows);
      if (adjacent === 0) continue;
      const routesCovered = scaledPathSets.reduce((count, set) => count + (nearPathSet(x, y, set) ? 1 : 0), 0);
      const centerBonus = 1 - Math.abs(x / Math.max(1, cols - 1) - 0.58);
      const score = routesCovered * 120 + adjacent * 14 + centerBonus * 8 + seededRandom() * 12;
      candidates.push({ x, y, score, routesCovered });
    }
  }
  candidates.sort((a, b) => b.score - a.score);
  const chosen = [];
  const minimumDistance = cols >= 16 ? 2.15 : 1.85;
  for (const candidate of candidates) {
    if (chosen.length >= targetCount) break;
    if (chosen.every((slot) => Math.hypot(slot.x - candidate.x, slot.y - candidate.y) >= minimumDistance)) {
      chosen.push(candidate);
    }
  }
  return chosen.map((slot) => [slot.x, slot.y]);
}

function countAdjacentPathTiles(x, y, pathTiles, cols, rows) {
  let count = 0;
  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      if (dx === 0 && dy === 0) continue;
      const nx = x + dx;
      const ny = y + dy;
      if (nx >= 0 && nx < cols && ny >= 0 && ny < rows && pathTiles.has(`${nx},${ny}`)) count += 1;
    }
  }
  return count;
}

function nearPathSet(x, y, pathSet) {
  for (let dy = -2; dy <= 2; dy++) {
    for (let dx = -2; dx <= 2; dx++) {
      if (Math.abs(dx) + Math.abs(dy) > 3) continue;
      if (pathSet.has(`${x + dx},${y + dy}`)) return true;
    }
  }
  return false;
}

function seededRandom() {
  rngSeed = (rngSeed * 1664525 + 1013904223) >>> 0;
  return rngSeed / 4294967296;
}

function scalePoint(x, y, cols, rows) {
  return [
    Math.round((x / (GRID_COLS - 1)) * (cols - 1)),
    Math.round((y / (GRID_ROWS - 1)) * (rows - 1))
  ];
}

function resolveBuildSlot(gridX, gridY, pathTiles, cols, rows) {
  const candidates = [
    [0, 0], [0, -1], [0, 1], [-1, 0], [1, 0],
    [-1, -1], [1, -1], [-1, 1], [1, 1],
    [0, -2], [0, 2], [-2, 0], [2, 0]
  ];
  for (const [dx, dy] of candidates) {
    const x = gridX + dx;
    const y = gridY + dy;
    if (x >= 0 && x < cols && y >= 0 && y < rows && !pathTiles.has(`${x},${y}`)) {
      return [x, y];
    }
  }
  return null;
}

function tileCenter(x, y) {
  return {
    x: boardOffset.x + x * tileSize + tileSize / 2,
    y: boardOffset.y + y * tileSize + tileSize / 2
  };
}

function currentLevel() {
  return levels[state.levelIndex];
}

function updateUI() {
  const isEndless = state.mode === "endless";
  ui.level.textContent = isEndless ? "Endless" : `${state.levelIndex + 1} / ${levels.length}`;
  ui.wave.textContent = isEndless ? `${state.endlessWave}` : `${state.waveIndex} / ${CAMPAIGN_WAVES}`;
  ui.energy.textContent = Math.floor(state.energy);
  ui.core.textContent = state.core;
  ui.mode.textContent = `${state.difficulty.label} ${isEndless ? "Endless" : "Campaign"}`;
  const corePercent = Math.max(0, Math.min(100, Math.round((state.core / state.maxCore) * 100)));
  ui.corePercent.textContent = `${corePercent}%`;
  ui.coreBar.style.width = `${corePercent}%`;
  ui.coreBar.style.background = corePercent > 55
    ? "linear-gradient(90deg, var(--green), var(--cyan))"
    : corePercent > 25
      ? "linear-gradient(90deg, var(--yellow), var(--green))"
      : "linear-gradient(90deg, var(--red), var(--yellow))";
  ui.selectedInfo.textContent = state.message;
  ui.startWave.disabled = !state.started || state.activeWave || state.gameOver || state.campaignWon;
  ui.startWave.textContent = state.mode === "endless" ? "Start Endless Wave" : "Start Wave";

  const selectedTower = getSelectedTower();
  const nextUpgrade = selectedTower ? nextUpgradeFor(selectedTower) : null;
  ui.upgrade.disabled = !selectedTower || !nextUpgrade || state.energy < nextUpgrade.cost;
  ui.sell.disabled = !selectedTower;
  ui.upgrade.textContent = selectedTower
    ? nextUpgrade ? `Upgrade L${selectedTower.level + 1} (${nextUpgrade.cost})` : "Max Level"
    : "Upgrade";
  ui.sell.textContent = selectedTower ? `Sell (${sellValue(selectedTower)})` : "Sell";
  ui.towerDetails.innerHTML = selectedTower ? towerDetailsMarkup(selectedTower) : "Select a built tower to view upgrades.";

  updateBuildMenuState();
}

function getSelectedTower() {
  return state.towers.find((tower) => tower.id === state.selectedTowerId) || null;
}

function nextUpgradeFor(tower) {
  return towerTypes[tower.type].upgrades[tower.level - 1] || null;
}

function upgradeCost(tower) {
  const upgrade = nextUpgradeFor(tower);
  return upgrade ? upgrade.cost : Infinity;
}

function sellValue(tower) {
  const base = towerTypes[tower.type].cost;
  let spent = base;
  for (let level = 1; level < tower.level; level++) {
    spent += towerTypes[tower.type].upgrades[level - 1].cost;
  }
  return Math.round(spent * 0.62);
}

function towerDetailsMarkup(tower) {
  const type = towerTypes[tower.type];
  const stats = towerStats(tower);
  const upgrade = nextUpgradeFor(tower);
  const nextStats = upgrade ? towerStats({ ...tower, level: tower.level + 1 }) : null;
  const special = tower.type === "frost"
    ? `${Math.round((1 - stats.slow) * 100)}% slow`
    : tower.type === "blast"
      ? `${Math.round(stats.splashRadius)} splash`
      : `${Math.round(1 / stats.fireRate * 60)} rpm`;
  const preview = upgrade
    ? `${upgrade.label}: damage ${stats.damage} -> ${nextStats.damage}, range ${Math.round(stats.range)} -> ${Math.round(nextStats.range)}${tower.type === "frost" ? `, slow ${Math.round((1 - stats.slow) * 100)}% -> ${Math.round((1 - nextStats.slow) * 100)}%` : ""}${tower.type === "blast" ? `, splash ${Math.round(stats.splashRadius)} -> ${Math.round(nextStats.splashRadius)}` : ""}.`
    : "Maximum upgrade reached.";

  return `
    <div class="tower-detail-grid">
      <div class="detail-pill"><span>Tower</span><strong>${type.name}</strong></div>
      <div class="detail-pill"><span>Level</span><strong>${tower.level} / ${MAX_TOWER_LEVEL}</strong></div>
      <div class="detail-pill"><span>Damage</span><strong>${stats.damage}</strong></div>
      <div class="detail-pill"><span>Range</span><strong>${Math.round(stats.range)}</strong></div>
      <div class="detail-pill"><span>Reload</span><strong>${stats.fireRate.toFixed(2)}s</strong></div>
      <div class="detail-pill"><span>Special</span><strong>${special}</strong></div>
    </div>
    <div class="upgrade-preview">${preview}</div>
  `;
}

function startWave() {
  if (!state.started || state.activeWave || state.gameOver || state.campaignWon) return;
  state.selectedTowerId = null;
  state.selectedBuildSlot = null;
  hideBuildMenu();
  state.activeWave = true;
  state.spawns = state.mode === "endless" ? makeEndlessWave() : makeCampaignWave();
  if (state.mode === "endless") {
    state.endlessWave += 1;
  } else {
    state.waveIndex += 1;
  }
  state.message = "Wave in progress. Watch the path and upgrade between attacks.";
  updateUI();
}

function makeCampaignWave() {
  const wave = currentLevel().waves[state.waveIndex] || currentLevel().waves[currentLevel().waves.length - 1];
  return expandWave(wave, state.difficulty.hpScale * (1 + state.levelIndex * state.difficulty.levelScale));
}

function makeEndlessWave() {
  const scale = state.difficulty.hpScale * (1.12 + state.endlessWave * state.difficulty.endlessGrowth);
  const countBoost = Math.floor(state.endlessWave * 1.5);
  const wave = [
    { type: "runner", count: 8 + countBoost, gap: Math.max(0.2, 0.38 - state.endlessWave * 0.01) },
    { type: "swarm", count: 10 + countBoost, gap: Math.max(0.15, 0.24 - state.endlessWave * 0.008) },
    { type: state.endlessWave % 2 === 0 ? "shield" : "regenerator", count: 3 + Math.floor(state.endlessWave / 2), gap: 0.58 },
    { type: "phantom", count: 3 + Math.floor(state.endlessWave / 3), gap: 0.42 }
  ];
  if (state.endlessWave > 0 && state.endlessWave % 3 === 0) {
    wave.push({ type: "boss", count: 1 + Math.floor(state.endlessWave / 9), gap: 1.7 });
  }
  return expandWave(wave, scale);
}

function expandWave(groups, hpScale) {
  const queue = [];
  let time = 0;
  let spawnIndex = 0;
  groups.forEach((group) => {
    for (let i = 0; i < group.count; i++) {
      queue.push({ type: group.type, time, hpScale, pathIndex: spawnIndex % board.pathPixels.length });
      time += group.gap;
      spawnIndex += 1;
    }
    time += 0.8;
  });
  return queue;
}

function spawnEnemy(spawn) {
  const template = enemyTypes[spawn.type];
  const pathIndex = spawn.pathIndex % board.pathPixels.length;
  const path = board.pathPixels[pathIndex];
  const start = path[0];
  const maxHp = Math.round(template.hp * spawn.hpScale);
  state.enemies.push({
    type: spawn.type,
    x: start.x,
    y: start.y,
    pathIndex,
    waypoint: 1,
    hp: maxHp,
    maxHp,
    speed: template.speed * state.difficulty.speedScale * (1 + (state.mode === "endless" ? state.endlessWave * 0.018 : 0)),
    slowUntil: 0,
    slowFactor: 1,
    reward: Math.max(1, Math.round(template.reward * state.difficulty.rewardScale * Math.sqrt(spawn.hpScale))),
    coreDamage: template.coreDamage,
    radius: template.radius,
    armor: template.armor || 0,
    regen: template.regen || 0,
    slowResist: template.slowResist || 0,
    boss: Boolean(template.boss),
    progress: 0
  });
}

function update(dt) {
  if (!state.started || state.gameOver || state.campaignWon) return;

  for (let i = state.spawns.length - 1; i >= 0; i--) {
    state.spawns[i].time -= dt;
    if (state.spawns[i].time <= 0) {
      spawnEnemy(state.spawns[i]);
      state.spawns.splice(i, 1);
    }
  }

  updateEnemies(dt);
  updateTowers(dt);
  updateBullets(dt);
  state.shots = state.shots.filter((shot) => {
    shot.life -= dt;
    return shot.life > 0;
  });
  state.floaters = state.floaters.filter((floater) => {
    floater.life -= dt;
    floater.y -= 28 * dt;
    return floater.life > 0;
  });
  state.towers.forEach((tower) => {
    tower.upgradeFlash = Math.max(0, (tower.upgradeFlash || 0) - dt * 1.8);
  });

  if (state.activeWave && state.spawns.length === 0 && state.enemies.length === 0) {
    finishWave();
  }
}

function updateEnemies(dt) {
  for (let i = state.enemies.length - 1; i >= 0; i--) {
    const enemy = state.enemies[i];
    if (enemy.regen > 0 && enemy.hp < enemy.maxHp) {
      enemy.hp = Math.min(enemy.maxHp, enemy.hp + enemy.regen * dt);
    }
    const path = board.pathPixels[enemy.pathIndex] || board.pathPixels[0];
    const target = path[enemy.waypoint];
    if (!target) {
      state.core -= enemy.coreDamage;
      state.enemies.splice(i, 1);
      state.message = `${enemyTypes[enemy.type].name} breached the core.`;
      if (state.core <= 0) {
        loseGame();
      }
      continue;
    }

    const now = performance.now() / 1000;
    const slow = enemy.slowUntil > now ? enemy.slowFactor : 1;
    const speed = enemy.speed * slow;
    const dx = target.x - enemy.x;
    const dy = target.y - enemy.y;
    const distance = Math.hypot(dx, dy);
    const travel = speed * dt;
    if (distance <= travel) {
      enemy.x = target.x;
      enemy.y = target.y;
      enemy.waypoint += 1;
      enemy.progress += 1;
    } else {
      enemy.x += (dx / distance) * travel;
      enemy.y += (dy / distance) * travel;
      enemy.progress += travel / Math.max(tileSize, 1);
    }
  }
}

function updateTowers(dt) {
  state.towers.forEach((tower) => {
    tower.cooldown = Math.max(0, tower.cooldown - dt);
    if (tower.cooldown > 0) return;

    const stats = towerStats(tower);
    const target = findTarget(tower, stats.range);
    if (!target) return;

    tower.cooldown = stats.fireRate;
    if (tower.type === "laser") {
      damageEnemy(target, stats.damage, tower);
      state.shots.push({ x1: tower.x, y1: tower.y, x2: target.x, y2: target.y, color: stats.color, life: 0.13 });
    } else {
      state.bullets.push({
        x: tower.x,
        y: tower.y,
        target,
        damage: stats.damage,
        speed: stats.bulletSpeed,
        color: stats.color,
        towerType: tower.type,
        slow: stats.slow,
        slowTime: stats.slowTime,
        splashRadius: stats.splashRadius,
        radius: tower.type === "frost" ? 5 : tower.type === "blast" ? 7 : 4
      });
    }
  });
}

function towerStats(tower) {
  const base = towerTypes[tower.type];
  const upgrade = tower.level > 1 ? base.upgrades[tower.level - 2] : null;
  return {
    color: base.color,
    damage: Math.round(base.damage * (upgrade?.damage || 1)),
    range: base.range * (upgrade?.range || 1),
    fireRate: base.fireRate * (upgrade?.fireRate || 1),
    bulletSpeed: base.bulletSpeed,
    slow: base.slow ? upgrade?.slow || base.slow : 1,
    slowTime: base.slowTime ? upgrade?.slowTime || base.slowTime : 0,
    splashRadius: base.splashRadius ? base.splashRadius * (upgrade?.splashRadius || 1) : 0
  };
}

function findTarget(tower, range) {
  let best = null;
  let bestProgress = -Infinity;
  state.enemies.forEach((enemy) => {
    const distance = Math.hypot(enemy.x - tower.x, enemy.y - tower.y);
    if (distance <= range && enemy.progress > bestProgress) {
      best = enemy;
      bestProgress = enemy.progress;
    }
  });
  return best;
}

function updateBullets(dt) {
  for (let i = state.bullets.length - 1; i >= 0; i--) {
    const bullet = state.bullets[i];
    if (!state.enemies.includes(bullet.target)) {
      state.bullets.splice(i, 1);
      continue;
    }
    const dx = bullet.target.x - bullet.x;
    const dy = bullet.target.y - bullet.y;
    const distance = Math.hypot(dx, dy);
    const travel = bullet.speed * dt;
    if (distance <= travel) {
      if (bullet.splashRadius) {
        splashDamage(bullet.target.x, bullet.target.y, bullet);
        state.shots.push({ x1: bullet.target.x, y1: bullet.target.y, x2: bullet.target.x, y2: bullet.target.y, color: bullet.color, life: 0.18, radius: bullet.splashRadius });
      } else {
        damageEnemy(bullet.target, bullet.damage, bullet);
      }
      state.bullets.splice(i, 1);
    } else {
      bullet.x += (dx / distance) * travel;
      bullet.y += (dy / distance) * travel;
    }
  }
}

function splashDamage(x, y, source) {
  const targets = [...state.enemies];
  targets.forEach((enemy) => {
    const distance = Math.hypot(enemy.x - x, enemy.y - y);
    if (distance <= source.splashRadius) {
      const falloff = 1 - distance / source.splashRadius;
      const damage = source.damage * (0.45 + falloff * 0.55);
      damageEnemy(enemy, damage, source);
    }
  });
}

function damageEnemy(enemy, damage, source) {
  const armorPierce = source.towerType === "laser" || source.type === "laser" ? 0.5 : 0;
  const effectiveArmor = Math.max(0, enemy.armor - armorPierce);
  enemy.hp -= damage * (1 - effectiveArmor);
  if (source.towerType === "frost" || source.type === "frost") {
    enemy.slowFactor = 1 - ((1 - source.slow) * (1 - enemy.slowResist));
    enemy.slowUntil = performance.now() / 1000 + source.slowTime;
  }
  if (enemy.hp <= 0) {
    state.energy += enemy.reward;
    state.floaters.push({
      x: enemy.x,
      y: enemy.y - enemy.radius - 10,
      text: `+${enemy.reward}`,
      color: "#ffd166",
      life: 0.85
    });
    state.message = `${enemyTypes[enemy.type].name} destroyed. +${enemy.reward} coins.`;
    const index = state.enemies.indexOf(enemy);
    if (index >= 0) state.enemies.splice(index, 1);
    updateUI();
  }
}

function finishWave() {
  state.activeWave = false;
  state.energy += state.mode === "endless"
    ? Math.round(state.difficulty.waveBonus + state.endlessWave * 4)
    : Math.round(state.difficulty.waveBonus + state.levelIndex * 8);

  if (state.mode === "campaign" && state.waveIndex >= CAMPAIGN_WAVES) {
    if (state.levelIndex < levels.length - 1) {
      showOverlay("Sector Cleared", `Level ${state.levelIndex + 1} secure. Advance to ${levels[state.levelIndex + 1].name}.`, "Next Level", () => {
        hideOverlay();
        loadLevel(state.levelIndex + 1);
        updateUI();
      });
    } else {
      state.campaignWon = true;
      showOverlay("Campaign Complete", "You protected every data core. Endless Mode is now unlocked.", "Enter Endless", () => {
        hideOverlay();
        startEndless();
      });
    }
  } else {
    state.message = state.mode === "endless"
      ? `Endless wave ${state.endlessWave} cleared. The next breach will be stronger.`
      : `Wave ${state.waveIndex} cleared. Build, upgrade, then launch the next wave.`;
  }
  updateUI();
}

function startEndless() {
  state.mode = "endless";
  state.started = true;
  state.gameOver = false;
  state.campaignWon = false;
  state.levelIndex = 2;
  state.endlessWave = 0;
  state.energy += Math.round(state.difficulty.startCoins * 0.75);
  state.core = Math.max(state.core, Math.round(state.maxCore * 0.75));
  state.towers = [];
  state.enemies = [];
  state.bullets = [];
  state.spawns = [];
  state.activeWave = false;
  state.selectedTowerId = null;
  state.selectedBuildSlot = null;
  rngSeed = seedForLevel(2);
  board = makeBoard(levels[2]);
  hideBuildMenu();
  state.message = `${state.difficulty.label} Endless: survive as many waves as possible.`;
  updateUI();
}

function loseGame() {
  state.gameOver = true;
  state.activeWave = false;
  showOverlay("Core Offline", state.mode === "endless"
    ? `You survived ${state.endlessWave} endless waves.`
    : "The breach reached the core. Restart and rebuild the defense grid.",
  "Restart", () => {
    hideOverlay();
    init();
  });
  updateUI();
}

function showOverlay(title, text, primaryLabel, primaryAction) {
  ui.overlayKicker.textContent = "System Notice";
  ui.overlayTitle.textContent = title;
  ui.overlayText.textContent = text;
  ui.overlayPrimary.textContent = primaryLabel;
  ui.overlayPrimary.onclick = primaryAction;
  ui.overlaySecondary.textContent = "Menu";
  ui.overlaySecondary.onclick = () => {
    hideOverlay();
    showMainMenu();
  };
  ui.overlay.classList.remove("hidden");
}

function hideOverlay() {
  ui.overlay.classList.add("hidden");
}

function showBuildMenu(slot) {
  ui.buildMenu.innerHTML = "";
  Object.entries(towerTypes).forEach(([id, tower]) => {
    const button = document.createElement("button");
    button.className = "build-choice";
    button.type = "button";
    button.title = `${tower.name}: ${tower.cost} coins`;
    button.style.background = tower.color;
    button.disabled = state.energy < tower.cost;
    button.innerHTML = `${tower.key}<span>${tower.cost}</span>`;
    button.addEventListener("click", (event) => {
      event.stopPropagation();
      buildTower(id);
    });
    ui.buildMenu.appendChild(button);
  });
  positionBuildMenu(slot);
  ui.buildMenu.classList.remove("hidden");
}

function positionBuildMenu(slot) {
  const panelBox = canvas.getBoundingClientRect();
  const x = Math.min(Math.max(slot.x, 140), panelBox.width - 140);
  const y = Math.max(slot.y, 96);
  ui.buildMenu.style.left = `${x}px`;
  ui.buildMenu.style.top = `${y}px`;
}

function updateBuildMenuState() {
  ui.buildMenu.querySelectorAll(".build-choice").forEach((button, index) => {
    const id = Object.keys(towerTypes)[index];
    button.disabled = state.energy < towerTypes[id].cost;
  });
}

function hideBuildMenu() {
  ui.buildMenu.classList.add("hidden");
  ui.buildMenu.innerHTML = "";
}

function draw() {
  const rect = canvas.getBoundingClientRect();
  ctx.clearRect(0, 0, rect.width, rect.height);
  drawBackdrop(rect);
  drawGrid();
  drawBoardFrame();
  drawPath();
  drawCoreGate();
  drawBuildSlots();
  drawBuildPreview();
  drawTowers();
  drawEnemies();
  drawBullets();
  drawShots();
  drawFloaters();
}

function drawBackdrop(rect) {
  ctx.fillStyle = "#061014";
  ctx.fillRect(0, 0, rect.width, rect.height);
  const gradient = ctx.createRadialGradient(rect.width * 0.58, rect.height * 0.42, 0, rect.width * 0.58, rect.height * 0.42, Math.max(rect.width, rect.height) * 0.7);
  gradient.addColorStop(0, "rgba(36,216,255,0.08)");
  gradient.addColorStop(0.45, "rgba(92,255,154,0.025)");
  gradient.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, rect.width, rect.height);
  ctx.strokeStyle = "rgba(36,216,255,0.055)";
  ctx.lineWidth = 1;
  for (let x = 0; x < rect.width; x += 28) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, rect.height);
    ctx.stroke();
  }
  for (let y = 0; y < rect.height; y += 28) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(rect.width, y);
    ctx.stroke();
  }
}

function drawGrid() {
  for (let y = 0; y < board.rows; y++) {
    for (let x = 0; x < board.cols; x++) {
      const isPath = board.pathTiles.has(`${x},${y}`);
      ctx.fillStyle = isPath ? "rgba(33,55,45,0.94)" : "rgba(13,24,28,0.86)";
      ctx.strokeStyle = isPath ? "rgba(92,255,154,0.22)" : "rgba(126,238,255,0.16)";
      ctx.lineWidth = 1;
      ctx.fillRect(boardOffset.x + x * tileSize + 1, boardOffset.y + y * tileSize + 1, tileSize - 2, tileSize - 2);
      ctx.strokeRect(boardOffset.x + x * tileSize + 0.5, boardOffset.y + y * tileSize + 0.5, tileSize - 1, tileSize - 1);
      if (!isPath) {
        ctx.fillStyle = "rgba(255,255,255,0.018)";
        ctx.fillRect(boardOffset.x + x * tileSize + tileSize * 0.18, boardOffset.y + y * tileSize + tileSize * 0.18, tileSize * 0.12, tileSize * 0.12);
      }
    }
  }
}

function drawBoardFrame() {
  const width = tileSize * board.cols;
  const height = tileSize * board.rows;
  const x = boardOffset.x;
  const y = boardOffset.y;
  const corner = Math.min(tileSize * 0.72, 44);
  ctx.save();
  ctx.strokeStyle = "rgba(126,238,255,0.62)";
  ctx.lineWidth = 2;
  ctx.shadowColor = "rgba(36,216,255,0.36)";
  ctx.shadowBlur = 16;
  [
    [x, y, 1, 1],
    [x + width, y, -1, 1],
    [x, y + height, 1, -1],
    [x + width, y + height, -1, -1]
  ].forEach(([cx, cy, sx, sy]) => {
    ctx.beginPath();
    ctx.moveTo(cx, cy + sy * corner);
    ctx.lineTo(cx, cy);
    ctx.lineTo(cx + sx * corner, cy);
    ctx.stroke();
  });
  ctx.restore();
}

function drawPath() {
  ctx.save();
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  board.pathPixels.forEach((path, pathIndex) => {
    ctx.strokeStyle = "rgba(0,0,0,0.38)";
    ctx.lineWidth = Math.max(18, tileSize * 0.36);
    ctx.beginPath();
    path.forEach((point, index) => {
      if (index === 0) ctx.moveTo(point.x, point.y);
      else ctx.lineTo(point.x, point.y);
    });
    ctx.stroke();
    ctx.strokeStyle = pathIndex % 2 === 0 ? "rgba(92,255,154,0.42)" : "rgba(36,216,255,0.34)";
    ctx.lineWidth = Math.max(10, tileSize * 0.23);
    ctx.stroke();
    ctx.strokeStyle = "rgba(232,251,255,0.24)";
    ctx.lineWidth = Math.max(2, tileSize * 0.04);
    ctx.stroke();
    drawRouteFlow(path, pathIndex);
    drawRouteArrows(path, pathIndex);
    drawRouteStart(path, pathIndex);
  });
  ctx.restore();
}

function drawRouteFlow(path, pathIndex) {
  const color = pathIndex % 2 === 0 ? "rgba(92,255,154,0.9)" : "rgba(36,216,255,0.9)";
  const now = performance.now() / 1000;
  const distance = routeLength(path);
  if (distance <= 0) return;
  ctx.save();
  ctx.fillStyle = color;
  ctx.shadowColor = color;
  ctx.shadowBlur = 14;
  for (let i = 0; i < 2; i++) {
    const target = ((now * tileSize * 1.18 + i * distance * 0.5 + pathIndex * tileSize * 0.8) % distance);
    const point = pointAtRouteDistance(path, target);
    ctx.globalAlpha = i === 0 ? 0.72 : 0.42;
    ctx.beginPath();
    ctx.arc(point.x, point.y, Math.max(3, tileSize * 0.055), 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function routeLength(path) {
  let total = 0;
  for (let i = 0; i < path.length - 1; i++) {
    total += Math.hypot(path[i + 1].x - path[i].x, path[i + 1].y - path[i].y);
  }
  return total;
}

function pointAtRouteDistance(path, targetDistance) {
  let traveled = 0;
  for (let i = 0; i < path.length - 1; i++) {
    const a = path[i];
    const b = path[i + 1];
    const segment = Math.hypot(b.x - a.x, b.y - a.y);
    if (traveled + segment >= targetDistance) {
      const t = (targetDistance - traveled) / Math.max(1, segment);
      return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
    }
    traveled += segment;
  }
  return path[path.length - 1];
}

function drawRouteArrows(path, pathIndex) {
  const color = pathIndex % 2 === 0 ? "rgba(92,255,154,0.72)" : "rgba(36,216,255,0.72)";
  ctx.save();
  ctx.fillStyle = color;
  for (let i = 0; i < path.length - 1; i++) {
    const a = path[i];
    const b = path[i + 1];
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const length = Math.hypot(dx, dy);
    if (length < tileSize * 1.2) continue;
    const steps = Math.max(1, Math.floor(length / (tileSize * 2.1)));
    for (let step = 1; step <= steps; step++) {
      const t = step / (steps + 1);
      const x = a.x + dx * t;
      const y = a.y + dy * t;
      const angle = Math.atan2(dy, dx);
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle);
      ctx.beginPath();
      ctx.moveTo(tileSize * 0.14, 0);
      ctx.lineTo(-tileSize * 0.09, -tileSize * 0.09);
      ctx.lineTo(-tileSize * 0.04, 0);
      ctx.lineTo(-tileSize * 0.09, tileSize * 0.09);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }
  }
  ctx.restore();
}

function drawRouteStart(path, pathIndex) {
  const start = path[0];
  ctx.save();
  ctx.translate(start.x, start.y);
  ctx.fillStyle = pathIndex % 2 === 0 ? "rgba(92,255,154,0.18)" : "rgba(36,216,255,0.18)";
  ctx.strokeStyle = pathIndex % 2 === 0 ? "rgba(92,255,154,0.72)" : "rgba(36,216,255,0.72)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(0, 0, tileSize * 0.26, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = "#061013";
  ctx.font = `800 ${Math.max(10, tileSize * 0.18)}px Rajdhani`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("IN", 0, 0);
  ctx.restore();
}

function drawCoreGate() {
  const mainPath = board.pathPixels[0];
  const gate = mainPath[mainPath.length - 1];
  const pulse = 0.5 + Math.sin(performance.now() / 220) * 0.18;
  ctx.save();
  ctx.translate(gate.x, gate.y);
  ctx.fillStyle = `rgba(255,79,104,${0.18 + pulse * 0.12})`;
  ctx.strokeStyle = "rgba(255,209,102,0.9)";
  ctx.lineWidth = 3;
  ctx.shadowColor = "rgba(255,79,104,0.9)";
  ctx.shadowBlur = 22;
  ctx.beginPath();
  ctx.arc(0, 0, tileSize * 0.34, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.shadowBlur = 0;
  ctx.strokeStyle = "rgba(255,79,104,0.88)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-tileSize * 0.2, -tileSize * 0.2);
  ctx.lineTo(tileSize * 0.2, tileSize * 0.2);
  ctx.moveTo(tileSize * 0.2, -tileSize * 0.2);
  ctx.lineTo(-tileSize * 0.2, tileSize * 0.2);
  ctx.stroke();
  ctx.fillStyle = "#e8fbff";
  ctx.font = "700 10px Rajdhani";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("CORE", 0, tileSize * 0.48);
  ctx.restore();
}

function drawBuildSlots() {
  board.buildSlots.forEach((slot) => {
    const occupied = state.towers.some((tower) => tower.gridX === slot.gridX && tower.gridY === slot.gridY);
    if (occupied) return;
    const selected = state.selectedBuildSlot && state.selectedBuildSlot.gridX === slot.gridX && state.selectedBuildSlot.gridY === slot.gridY;
    const pulse = 0.5 + Math.sin(performance.now() / 260) * 0.12;
    ctx.fillStyle = "rgba(0,0,0,0.38)";
    ctx.beginPath();
    ctx.ellipse(slot.x, slot.y + tileSize * 0.16, tileSize * 0.32, tileSize * 0.12, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = selected ? "rgba(92,255,154,0.26)" : `rgba(36,216,255,${0.14 + pulse * 0.09})`;
    ctx.strokeStyle = selected ? "rgba(92,255,154,0.9)" : "rgba(126,238,255,0.72)";
    ctx.lineWidth = selected ? 3 : 2;
    ctx.shadowColor = selected ? "rgba(92,255,154,0.85)" : "rgba(36,216,255,0.55)";
    ctx.shadowBlur = selected ? 18 : 10;
    ctx.beginPath();
    ctx.arc(slot.x, slot.y, tileSize * 0.28, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.shadowBlur = 0;
    ctx.strokeStyle = "rgba(232,251,255,0.22)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(slot.x, slot.y, tileSize * 0.36, 0, Math.PI * 2);
    ctx.stroke();
    ctx.strokeStyle = selected ? "rgba(255,209,102,0.62)" : "rgba(92,255,154,0.24)";
    ctx.beginPath();
    ctx.arc(slot.x, slot.y, tileSize * 0.43, -Math.PI * 0.12, Math.PI * 0.78);
    ctx.stroke();
    ctx.fillStyle = "rgba(0,0,0,0.38)";
    ctx.beginPath();
    ctx.arc(slot.x, slot.y, tileSize * 0.14, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "rgba(232,251,255,0.4)";
    ctx.beginPath();
    ctx.moveTo(slot.x - tileSize * 0.14, slot.y);
    ctx.lineTo(slot.x + tileSize * 0.14, slot.y);
    ctx.moveTo(slot.x, slot.y - tileSize * 0.14);
    ctx.lineTo(slot.x, slot.y + tileSize * 0.14);
    ctx.stroke();
  });
}

function drawBuildPreview() {
  const selectedTower = getSelectedTower();
  if (selectedTower) {
    const stats = towerStats(selectedTower);
    drawRange(selectedTower.x, selectedTower.y, stats.range, "rgba(92,255,154,0.12)");
    if (stats.splashRadius) {
      drawRange(selectedTower.x, selectedTower.y, stats.splashRadius, "rgba(255,138,76,0.14)");
    }
    return;
  }
  if (state.selectedBuildSlot) {
    drawRange(state.selectedBuildSlot.x, state.selectedBuildSlot.y, towerTypes.blast.range, "rgba(36,216,255,0.08)");
  }
}

function drawRange(x, y, radius, color) {
  ctx.beginPath();
  ctx.fillStyle = color;
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();
}

function drawTowers() {
  state.towers.forEach((tower) => {
    const stats = towerStats(tower);
    const upgradeGlow = tower.upgradeFlash || 0;
    if (tower.id === state.selectedTowerId) {
      drawRange(tower.x, tower.y, stats.range, "rgba(92,255,154,0.13)");
    }
    ctx.save();
    ctx.translate(tower.x, tower.y);
    ctx.fillStyle = "rgba(0,0,0,0.32)";
    ctx.beginPath();
    ctx.ellipse(0, 13, 20, 7, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowColor = stats.color;
    ctx.shadowBlur = 18 + upgradeGlow * 30;
    drawTowerBody(tower, stats, upgradeGlow);
    ctx.shadowBlur = 0;
    drawTowerLevelPips(tower, stats);
    drawTowerLabel(tower, stats);
    if (tower.level === MAX_TOWER_LEVEL) {
      ctx.fillStyle = "#ffd166";
      ctx.font = "700 10px Rajdhani";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("MAX", 0, 36);
    }
    ctx.restore();
  });
}

function drawTowerLabel(tower, stats) {
  const keySize = Math.max(13, tileSize * 0.22);
  ctx.save();
  ctx.shadowColor = "rgba(0,0,0,0.72)";
  ctx.shadowBlur = 8;
  ctx.fillStyle = "rgba(3,10,13,0.92)";
  ctx.beginPath();
  ctx.arc(0, -1, Math.max(9, tileSize * 0.15), 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.strokeStyle = "rgba(232,251,255,0.78)";
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.fillStyle = "#f4feff";
  ctx.font = `900 ${keySize}px Rajdhani`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(towerTypes[tower.type].key, 0, -1);

  ctx.fillStyle = "rgba(3,10,13,0.86)";
  ctx.strokeStyle = stats.color;
  ctx.lineWidth = 1;
  roundRectPath(-14, 17, 28, 13, 4);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = "#e8fbff";
  ctx.font = "800 10px Rajdhani";
  ctx.fillText(`L${tower.level}`, 0, 23.5);
  ctx.restore();
}

function roundRectPath(x, y, width, height, radius) {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + width - r, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + r);
  ctx.lineTo(x + width, y + height - r);
  ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
  ctx.lineTo(x + r, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function drawTowerLevelPips(tower, stats) {
  const radius = 23;
  for (let i = 0; i < MAX_TOWER_LEVEL; i++) {
    const angle = -Math.PI * 0.86 + i * (Math.PI * 0.24);
    const active = i < tower.level;
    ctx.fillStyle = active ? stats.color : "rgba(232,251,255,0.22)";
    ctx.shadowColor = active ? stats.color : "transparent";
    ctx.shadowBlur = active ? 8 : 0;
    ctx.beginPath();
    ctx.arc(Math.cos(angle) * radius, Math.sin(angle) * radius, 2.8, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.shadowBlur = 0;
}

function drawTowerBody(tower, stats, upgradeGlow) {
  const r = 17 + upgradeGlow * 6;
  ctx.save();
  ctx.rotate((performance.now() / 1800) % (Math.PI * 2));
  ctx.strokeStyle = "rgba(232,251,255,0.22)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(0, 0, r + 5, 0, Math.PI * 1.35);
  ctx.stroke();
  ctx.restore();
  ctx.fillStyle = stats.color;
  ctx.strokeStyle = "rgba(232,251,255,0.72)";
  ctx.lineWidth = 1.5;
  if (tower.type === "pulse") {
    drawPolygon(0, 0, r, 6, -Math.PI / 6);
    ctx.fill();
    ctx.stroke();
    ctx.strokeStyle = "rgba(6,16,19,0.65)";
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.48, 0, Math.PI * 2);
    ctx.stroke();
  } else if (tower.type === "laser") {
    ctx.save();
    ctx.rotate(Math.PI / 4);
    ctx.fillRect(-r * 0.72, -r * 0.72, r * 1.44, r * 1.44);
    ctx.strokeRect(-r * 0.72, -r * 0.72, r * 1.44, r * 1.44);
    ctx.restore();
    ctx.fillStyle = "rgba(255,255,255,0.42)";
    ctx.fillRect(-r * 0.15, -r * 0.95, r * 0.3, r * 0.72);
  } else if (tower.type === "frost") {
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.strokeStyle = "rgba(6,16,19,0.72)";
    ctx.lineWidth = 2;
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI * 2 * i) / 6;
      ctx.beginPath();
      ctx.moveTo(Math.cos(angle) * r * 0.18, Math.sin(angle) * r * 0.18);
      ctx.lineTo(Math.cos(angle) * r * 0.82, Math.sin(angle) * r * 0.82);
      ctx.stroke();
    }
  } else {
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "rgba(6,16,19,0.75)";
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.52, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = stats.color;
    ctx.fillRect(r * 0.15, -r * 0.22, r * 0.82, r * 0.44);
  }
}

function drawPolygon(x, y, radius, sides, rotation = 0) {
  ctx.beginPath();
  for (let i = 0; i < sides; i++) {
    const angle = rotation + (Math.PI * 2 * i) / sides;
    const px = x + Math.cos(angle) * radius;
    const py = y + Math.sin(angle) * radius;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
}

function drawEnemies() {
  state.enemies.forEach((enemy) => {
    const template = enemyTypes[enemy.type];
    const slowed = enemy.slowUntil > performance.now() / 1000;
    ctx.save();
    ctx.translate(enemy.x, enemy.y);
    ctx.fillStyle = "rgba(0,0,0,0.3)";
    ctx.beginPath();
    ctx.ellipse(0, enemy.radius * 0.62, enemy.radius * 1.05, enemy.radius * 0.35, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = slowed ? "#a98cff" : template.color;
    ctx.shadowColor = ctx.fillStyle;
    ctx.shadowBlur = 14;
    ctx.beginPath();
    ctx.arc(0, 0, enemy.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.strokeStyle = enemy.boss ? "#ffd166" : "rgba(232,251,255,0.72)";
    ctx.lineWidth = enemy.boss ? 3 : 1.5;
    ctx.stroke();
    drawEnemyMarker(enemy);
    if (enemy.armor > 0) {
      ctx.strokeStyle = "rgba(255,209,102,0.85)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, enemy.radius + 5, -Math.PI * 0.2, Math.PI * 1.2);
      ctx.stroke();
    }
    if (enemy.regen > 0) {
      ctx.fillStyle = "rgba(92,255,154,0.95)";
      ctx.fillRect(-3, enemy.radius + 4, 6, 10);
      ctx.fillRect(-8, enemy.radius + 8, 16, 3);
    }
    ctx.fillStyle = "rgba(0,0,0,0.55)";
    const barWidth = enemy.boss ? 66 : 36;
    const barHeight = enemy.boss ? 8 : 5;
    ctx.fillRect(-barWidth / 2, -enemy.radius - 14, barWidth, barHeight);
    ctx.fillStyle = enemy.hp / enemy.maxHp > 0.45 ? "#5cff9a" : "#ff4f68";
    ctx.fillRect(-barWidth / 2, -enemy.radius - 14, barWidth * Math.max(0, enemy.hp / enemy.maxHp), barHeight);
    if (enemy.boss) {
      ctx.fillStyle = "#e8fbff";
      ctx.font = "700 10px Rajdhani";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("BOSS", 0, -enemy.radius - 22);
    }
    ctx.restore();
  });
}

function drawEnemyMarker(enemy) {
  const marker = {
    runner: ">",
    tank: "T",
    swarm: "x",
    shield: "S",
    regenerator: "+",
    phantom: "~",
    boss: "!"
  }[enemy.type] || "";
  ctx.fillStyle = enemy.boss ? "#ffd166" : "#061013";
  ctx.font = `800 ${enemy.boss ? 16 : 11}px Rajdhani`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(marker, 0, 0);
}

function drawBullets() {
  state.bullets.forEach((bullet) => {
    ctx.fillStyle = bullet.color;
    ctx.shadowColor = bullet.color;
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.arc(bullet.x, bullet.y, bullet.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  });
}

function drawShots() {
  state.shots.forEach((shot) => {
    ctx.globalAlpha = Math.max(0, shot.life / 0.13);
    if (shot.radius) {
      ctx.strokeStyle = shot.color;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(shot.x1, shot.y1, shot.radius * (1.15 - ctx.globalAlpha * 0.15), 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = shot.color;
      ctx.globalAlpha *= 0.1;
      ctx.beginPath();
      ctx.arc(shot.x1, shot.y1, shot.radius, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.strokeStyle = shot.color;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(shot.x1, shot.y1);
      ctx.lineTo(shot.x2, shot.y2);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  });
}

function drawFloaters() {
  state.floaters.forEach((floater) => {
    ctx.save();
    ctx.globalAlpha = Math.max(0, floater.life / 0.85);
    ctx.fillStyle = floater.color;
    ctx.shadowColor = floater.color;
    ctx.shadowBlur = 10;
    ctx.font = `700 ${Math.max(14, tileSize * 0.22)}px Rajdhani`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(floater.text, floater.x, floater.y);
    ctx.restore();
  });
}

function canvasToTile(event) {
  const rect = canvas.getBoundingClientRect();
  const x = Math.floor((event.clientX - rect.left - boardOffset.x) / tileSize);
  const y = Math.floor((event.clientY - rect.top - boardOffset.y) / tileSize);
  return { x, y };
}

function inBounds(x, y) {
  return x >= 0 && x < board.cols && y >= 0 && y < board.rows;
}

function isBlocked(x, y) {
  return board.pathTiles.has(`${x},${y}`) || state.towers.some((tower) => tower.gridX === x && tower.gridY === y);
}

function handleCanvasClick(event) {
  if (!state.started || state.gameOver || state.campaignWon) return;
  const tile = canvasToTile(event);
  if (!inBounds(tile.x, tile.y)) return;

  const tower = state.towers.find((item) => item.gridX === tile.x && item.gridY === tile.y);
  if (tower) {
    state.selectedTowerId = tower.id;
    state.selectedBuildSlot = null;
    hideBuildMenu();
    const stats = towerStats(tower);
    const upgrade = nextUpgradeFor(tower);
    state.message = upgrade
      ? `${towerTypes[tower.type].name} L${tower.level}: next upgrade ${upgrade.cost} coins.`
      : `${towerTypes[tower.type].name} is max level. Sell value ${sellValue(tower)}.`;
    updateUI();
    return;
  }

  const slot = board.buildSlots.find((item) => item.gridX === tile.x && item.gridY === tile.y);
  if (slot && !isBlocked(slot.gridX, slot.gridY)) {
    selectBuildSlot(slot);
    return;
  }

  state.selectedTowerId = null;
  state.selectedBuildSlot = null;
  hideBuildMenu();
  state.message = "Click a glowing build node to construct a tower.";
  updateUI();
}

function selectBuildSlot(slot) {
  state.selectedTowerId = null;
  state.selectedBuildSlot = slot;
  showBuildMenu(slot);
  state.message = "Build node selected. Choose Pulse, Laser, Frost, or Blast.";
  updateUI();
}

function buildTower(towerType) {
  const slot = state.selectedBuildSlot;
  if (!slot) {
    state.message = "Click a glowing build node first.";
    updateUI();
    return;
  }
  const type = towerTypes[towerType];
  if (isBlocked(slot.gridX, slot.gridY)) {
    state.message = "That build node is already occupied.";
    updateUI();
    return;
  }
  if (state.energy < type.cost) {
    state.message = `Not enough coins. ${type.name} costs ${type.cost}.`;
    updateUI();
    return;
  }
  state.energy -= type.cost;
  state.towers.push({
    id: state.nextTowerId++,
    type: towerType,
    gridX: slot.gridX,
    gridY: slot.gridY,
    x: slot.x,
    y: slot.y,
    level: 1,
    cooldown: 0,
    upgradeFlash: 0
  });
  state.selectedBuildSlot = null;
  hideBuildMenu();
  state.message = `${type.name} built. Press Start Wave when ready.`;
  updateUI();
}

function upgradeSelectedTower() {
  const tower = getSelectedTower();
  if (!tower || tower.level >= MAX_TOWER_LEVEL) return;
  const cost = upgradeCost(tower);
  if (state.energy < cost) {
    state.message = `Not enough coins. Upgrade costs ${cost}.`;
    updateUI();
    return;
  }
  const before = towerStats(tower);
  state.energy -= cost;
  tower.level += 1;
  tower.upgradeFlash = 1;
  const stats = towerStats(tower);
  state.floaters.push({
    x: tower.x,
    y: tower.y - 28,
    text: `L${tower.level}`,
    color: towerTypes[tower.type].color,
    life: 0.9
  });
  state.message = `${towerTypes[tower.type].name} upgraded: damage ${before.damage} -> ${stats.damage}, range ${Math.round(before.range)} -> ${Math.round(stats.range)}.`;
  updateUI();
}

function sellSelectedTower() {
  const tower = getSelectedTower();
  if (!tower) return;
  state.energy += sellValue(tower);
  state.towers = state.towers.filter((item) => item.id !== tower.id);
  state.selectedTowerId = null;
  state.message = "Tower sold. Rebuild the grid before the next wave.";
  updateUI();
}

function loop(now) {
  const dt = Math.min(0.05, (now - lastTime) / 1000);
  lastTime = now;
  update(dt);
  draw();
  requestAnimationFrame(loop);
}

canvas.addEventListener("click", handleCanvasClick);
canvas.addEventListener("mousemove", (event) => {
  pointerTile = canvasToTile(event);
});
canvas.addEventListener("mouseleave", () => {
  pointerTile = null;
});
ui.startWave.addEventListener("click", startWave);
ui.upgrade.addEventListener("click", upgradeSelectedTower);
ui.sell.addEventListener("click", sellSelectedTower);
ui.restart.addEventListener("click", init);
ui.menu.addEventListener("click", showMainMenu);
ui.continueToMenu.addEventListener("click", showMainMenu);
document.querySelectorAll("[data-start-mode]").forEach((button) => {
  button.addEventListener("click", () => {
    startRun(button.dataset.startMode, button.dataset.difficulty);
  });
});
window.addEventListener("resize", () => {
  resizeCanvas();
  rngSeed = seedForLevel(state.levelIndex);
  board = makeBoard(currentLevel());
  state.towers.forEach((tower) => {
    const center = tileCenter(tower.gridX, tower.gridY);
    tower.x = center.x;
    tower.y = center.y;
  });
  if (state.selectedBuildSlot) {
    state.selectedBuildSlot = board.buildSlots.find((slot) => slot.gridX === state.selectedBuildSlot.gridX && slot.gridY === state.selectedBuildSlot.gridY) || null;
    if (state.selectedBuildSlot) positionBuildMenu(state.selectedBuildSlot);
  }
});

resizeCanvas();
showHowTo();
requestAnimationFrame(loop);
