const SAVE_KEY = "mosswing-relic-quest-save-v8";
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const heartsEl = document.getElementById("hearts");
const levelNameEl = document.getElementById("levelName");
const questTextEl = document.getElementById("questText");
const keysEl = document.getElementById("keys");
const keysRequiredEl = document.getElementById("keysRequired");
const enemiesEl = document.getElementById("enemies");
const bossStatusEl = document.getElementById("bossStatus");
const rupeesEl = document.getElementById("rupees");
const potionsEl = document.getElementById("potions");
const swordLevelEl = document.getElementById("swordLevel");
const weaponNameEl = document.getElementById("weaponName");
const minimapCanvas = document.getElementById("minimap");
const minimapCtx = minimapCanvas.getContext("2d");
const messageEl = document.getElementById("message");
const dialogBoxEl = document.getElementById("dialogBox");
const pauseOverlay = document.getElementById("pauseOverlay");
const gameOverOverlay = document.getElementById("gameOverOverlay");
const restartButton = document.getElementById("restartButton");
const startButton = document.getElementById("startButton");
const continueButton = document.getElementById("continueButton");
const clearSaveButton = document.getElementById("clearSaveButton");
const menuStartButton = document.getElementById("menuStartButton");
const menuContinueButton = document.getElementById("menuContinueButton");
const musicButton = document.getElementById("musicButton");
const menuOverlay = document.getElementById("menuOverlay");
const gameShellEl = document.querySelector(".game-shell");
const mobileControlsEl = document.getElementById("mobileControls");
const fullscreenButton = document.getElementById("fullscreenButton");
const mobileMusicButton = document.getElementById("mobileMusicButton");

const tileSize = 32;
const mapWidth = 20;
const mapHeight = 14;
const canvasAspect = canvas.width / canvas.height;
const maxHealth = 8;
const fairyHeal = 2;
const wallTiles = new Set(["#", "0", "o", "v", "G"]);
const hazardTiles = new Set(["^", "L"]);
const slowTiles = new Set(["~"]);
const input = { up: false, down: false, left: false, right: false, blocking: false };
const weaponLabels = { sword: "Schwert", lance: "Lanze", wand: "Wand" };
const assetAtlas = new Image();
assetAtlas.src = "assets/relic-ai-sheet.png";
let assetAtlasReady = false;
const complexAtlas = new Image();
complexAtlas.src = "assets/complex-ai-sheet.png";
let complexAtlasReady = false;
const playerAtlas = new Image();
playerAtlas.src = "assets/player-normalized-sheet.png";
let playerAtlasReady = false;
const complexCellW = 96;
const complexCellH = 128;
const playerCellSize = 64;

const atlasFrames = {
  heroDown: [20, 104, 130, 176],
  heroUp: [190, 104, 130, 176],
  heroLeft: [358, 104, 130, 176],
  heroRight: [526, 104, 130, 176],
  slime: [696, 126, 116, 132],
  bat: [860, 114, 126, 144],
  boss: [1026, 90, 202, 208],
  chestClosed: [24, 348, 126, 148],
  chestOpen: [190, 340, 130, 158],
  key: [374, 350, 86, 138],
  npc: [538, 336, 112, 168],
  fairy: [696, 352, 120, 130],
  altar: [864, 336, 126, 168],
  portal: [1030, 336, 190, 176],
  doorClosed: [22, 568, 132, 172],
  doorOpen: [188, 568, 132, 172],
  grass: [18, 790, 144, 164],
  hedge: [186, 790, 142, 164],
  stone: [354, 790, 140, 164],
  cryptWall: [522, 790, 136, 164],
  skyFloor: [690, 790, 136, 164],
  lavaFloor: [856, 790, 138, 164],
  lavaWall: [1024, 790, 202, 164],
  water: [18, 1000, 144, 166],
  crystalFloor: [186, 1000, 142, 166],
  moonFloor: [354, 1000, 140, 166],
  darkWall: [522, 1000, 136, 166]
};

const tileFrames = {
  forest: { floor: "grass", wall: "hedge" },
  crypt: { floor: "stone", wall: "cryptWall" },
  sky: { floor: "skyFloor", wall: "stone" },
  lava: { floor: "lavaFloor", wall: "lavaWall" },
  crystal: { floor: "crystalFloor", wall: "water" },
  moon: { floor: "moonFloor", wall: "darkWall" }
};

function cframe(col, row) {
  return [col * complexCellW, row * complexCellH, complexCellW, complexCellH];
}

function pframe(col, row) {
  return [col * playerCellSize, row * playerCellSize, playerCellSize, playerCellSize];
}

const complexFrames = {
  heroDownIdle: cframe(0, 0),
  heroDownWalk1: cframe(1, 0),
  heroDownWalk2: cframe(2, 0),
  heroDownWalk3: cframe(3, 0),
  heroDownAttack: cframe(6, 0),
  heroDownDash: cframe(7, 0),
  heroUpIdle: cframe(0, 1),
  heroUpWalk1: cframe(1, 1),
  heroUpWalk2: cframe(2, 1),
  heroUpWalk3: cframe(3, 1),
  heroUpAttack: cframe(6, 1),
  heroUpDash: cframe(7, 1),
  heroRightIdle: cframe(0, 2),
  heroRightWalk1: cframe(1, 2),
  heroRightWalk2: cframe(2, 2),
  heroRightWalk3: cframe(3, 2),
  heroRightAttack: cframe(6, 2),
  heroRightDash: cframe(7, 2),
  heroLeftIdle: cframe(0, 3),
  heroLeftWalk1: cframe(1, 3),
  heroLeftWalk2: cframe(2, 3),
  heroLeftWalk3: cframe(3, 3),
  heroLeftAttack: cframe(6, 3),
  heroLeftDash: cframe(7, 3),
  heroMagic1: cframe(2, 4),
  heroMagic2: cframe(5, 4),
  heroShield: cframe(2, 5),
  grassA: cframe(8, 0),
  grassB: cframe(9, 0),
  grassDirt: cframe(10, 0),
  grassFlowers: cframe(11, 0),
  hedgeA: cframe(14, 0),
  hedgeB: cframe(15, 0),
  hedgeCorner: cframe(8, 1),
  stoneA: cframe(8, 2),
  stoneCracked: cframe(9, 2),
  stoneMoss: cframe(10, 2),
  runeFloor: cframe(11, 2),
  crystalFloor2: cframe(12, 2),
  moonRune: cframe(14, 2),
  cryptWallA: cframe(8, 3),
  cryptWallB: cframe(9, 3),
  cryptWallCorner: cframe(10, 3),
  gateClosed: cframe(14, 3),
  gateOpen: cframe(15, 3),
  stairs: cframe(8, 4),
  abyss: cframe(9, 4),
  bridge: cframe(10, 4),
  water: cframe(11, 4),
  shallowWater: cframe(12, 4),
  lilyWater: cframe(13, 4),
  lava: cframe(8, 5),
  lavaAlt: cframe(9, 5),
  lavaBridge: cframe(10, 5),
  crystalCluster: cframe(12, 5),
  moonGarden: cframe(14, 5),
  spikes: cframe(8, 6),
  plate: cframe(9, 6),
  lockedGate: cframe(10, 6),
  torch: cframe(11, 6),
  pillar: cframe(12, 6),
  vines: cframe(15, 6),
  rubbleA: cframe(8, 7),
  rubbleB: cframe(9, 7),
  bones: cframe(11, 7),
  portalBlue: cframe(14, 7),
  portalDark: cframe(15, 7),
  slimeA: cframe(0, 6),
  slimeB: cframe(1, 6),
  batA: cframe(3, 6),
  batB: cframe(4, 6),
  guardA: cframe(6, 6),
  guardB: cframe(7, 6),
  mageA: cframe(4, 7),
  mageB: cframe(5, 7),
  bossFront: cframe(12, 7),
  bossBack: cframe(14, 7)
};

const playerFrames = {
  heroDownIdle: pframe(0, 0),
  heroDownWalk1: pframe(1, 0),
  heroDownWalk2: pframe(2, 0),
  heroDownWalk3: pframe(3, 0),
  heroDownAttack: pframe(4, 0),
  heroDownDash: pframe(5, 0),
  heroUpIdle: pframe(0, 1),
  heroUpWalk1: pframe(1, 1),
  heroUpWalk2: pframe(2, 1),
  heroUpWalk3: pframe(3, 1),
  heroUpAttack: pframe(4, 1),
  heroUpDash: pframe(5, 1),
  heroRightIdle: pframe(0, 3),
  heroRightWalk1: pframe(1, 3),
  heroRightWalk2: pframe(2, 3),
  heroRightWalk3: pframe(3, 3),
  heroRightAttack: pframe(4, 3),
  heroRightDash: pframe(5, 3),
  heroLeftIdle: pframe(0, 2),
  heroLeftWalk1: pframe(1, 2),
  heroLeftWalk2: pframe(2, 2),
  heroLeftWalk3: pframe(3, 2),
  heroLeftAttack: pframe(4, 2),
  heroLeftDash: pframe(5, 2),
  heroMagic1: pframe(0, 4),
  heroMagic2: pframe(1, 4),
  heroShield: pframe(2, 4)
};

const complexThemeTiles = {
  forest: { floor: "grassA", floorAlt: "grassB", detail: "grassFlowers", crack: "grassDirt", wall: "hedgeA", wallAlt: "hedgeB" },
  crypt: { floor: "stoneA", floorAlt: "stoneCracked", detail: "runeFloor", crack: "stoneCracked", wall: "cryptWallA", wallAlt: "cryptWallB" },
  sky: { floor: "stoneMoss", floorAlt: "stoneA", detail: "runeFloor", crack: "stoneCracked", wall: "cryptWallCorner", wallAlt: "cryptWallA" },
  lava: { floor: "stoneCracked", floorAlt: "lavaBridge", detail: "runeFloor", crack: "stoneCracked", wall: "cryptWallA", wallAlt: "cryptWallCorner" },
  crystal: { floor: "crystalFloor2", floorAlt: "shallowWater", detail: "crystalCluster", crack: "stoneMoss", wall: "cryptWallB", wallAlt: "moonRune" },
  moon: { floor: "moonGarden", floorAlt: "stoneMoss", detail: "moonRune", crack: "stoneCracked", wall: "cryptWallB", wallAlt: "vines" }
};

const symbolTileFrames = {
  ",": "floorAlt",
  ":": "crack",
  "R": "detail",
  "~": "water",
  "=": "bridge",
  "L": "lava",
  "^": "spikes",
  "p": "plate",
  "0": "pillar",
  "o": "rubbleA",
  "b": "bones",
  "v": "vines",
  "G": "lockedGate"
};

assetAtlas.onload = () => {
  assetAtlasReady = true;
  mapCacheDirty = true;
};

complexAtlas.onload = () => {
  complexAtlasReady = true;
  mapCacheDirty = true;
};

playerAtlas.onload = () => {
  playerAtlasReady = true;
};

const levels = [
  {
    name: "Mooslicht Overworld",
    theme: "forest",
    message: "Ein neuer Overworld-Pfad: Wiese, Bruecken, Wasser und ein kleiner Schrein.",
    rows: [
      "####################",
      "#N..,..K....,,...P.#",
      "#.##..###.###.##D#.#",
      "#..=~~....R....,...#",
      "#..=~~.##...##.....#",
      "#..K...#..E..#..C..#",
      "###.##.#.###.#.##..#",
      "#....R...A...#.....#",
      "#.##..~~~~==~~..#..#",
      "#S..:....#....E....#",
      "#.##.##..#..##.##..#",
      "#..K..T..#....C....#",
      "#....###...v..###..#",
      "####################"
    ],
    chests: ["rupees", "potion"],
    npcs: ["Der alte Pfad wurde neu gelegt. Folge den Bruecken und sammle die drei Schluessel."],
    relic: "glow"
  },
  {
    name: "Wurzelkrypta",
    theme: "crypt",
    message: "Ein neuer Krypta-Dungeon mit Seitengaengen, Knochenkammer und sicherer Rueckroute.",
    rows: [
      "####################",
      "#S..^....#....K..P.#",
      "#.####.#.#.####.#D.#",
      "#....#.#...#....#..#",
      "#.##.#.#####.##.#..#",
      "#K.#...C...#..E....#",
      "##.#####.###.####..#",
      "#..R..#...b...#....#",
      "#.###.#.#####.#.##.#",
      "#...#.#...T...#....#",
      "#.#.#.###.###.###..#",
      "#E#....K..A....C...#",
      "#..o....###....^...#",
      "####################"
    ],
    chests: ["potion", "rupees"],
    relic: "echo"
  },
  {
    name: "Windbruecken-Ruine",
    theme: "sky",
    message: "Luftige Bruecken, Wassergrenzen und klare Kampfarenen fuer die Lanze.",
    rows: [
      "####################",
      "#S....=....K....P..#",
      "#.####=#######.#D..#",
      "#....=..R....#.#...#",
      "#.##.#######.#.##..#",
      "#..#....E....#.....#",
      "##.#.~~==~~.###.##.#",
      "#..#..K..#....C....#",
      "#.###.##.#.######..#",
      "#.....##...R....#..#",
      "#.###.#####.##..#..#",
      "#...C....A..#..E...#",
      "#..0....###....v...#",
      "####################"
    ],
    chests: ["lance", "rupees"],
    relic: "wind"
  },
  {
    name: "Aschenofen",
    theme: "lava",
    message: "Ein komplett neuer Lava-Dungeon mit Hitzeadern, Bruecken und Bosskammer.",
    rows: [
      "####################",
      "#S..K..L....C...P..#",
      "#.####L####.###D#..#",
      "#....=L...#...#....#",
      "#.##.=.##.#.#.#.^..#",
      "#..#...##...#......#",
      "##.#.LL####L#.###..#",
      "#..#..K..L==L..B...#",
      "#.#######L#.###.#..#",
      "#...R...L#....#....#",
      "#.E...#.L#.##.^.#..#",
      "#....K#..#..A......#",
      "#..o..#....###.....#",
      "####################"
    ],
    chests: ["potion"],
    boss: { name: "Aschewyrm", health: 7 },
    relic: "ember"
  },
  {
    name: "Kristallquell",
    theme: "crystal",
    message: "Ein neuer See-Dungeon mit Inseln, Spiegelpfaden und der Wand in einer Truhe.",
    rows: [
      "####################",
      "#S..~~..K..R....P..#",
      "#.##==..#####..#D..#",
      "#..~~#......#......#",
      "#..==#..A...#..0...#",
      "#..##..#######..#..#",
      "#..##..R..K....~#..#",
      "#..#####==#..C..#..#",
      "#..E.....#..E...#..#",
      "#....:...#.......#.#",
      "#.####..#######.#..#",
      "#....K..~~..C......#",
      "#..v.....R....o....#",
      "####################"
    ],
    chests: ["wand", "potion"],
    relic: "prism"
  },
  {
    name: "Mondzitadelle",
    theme: "moon",
    message: "Die finale Map ist neu: Gartenring, Sternrunen und eine kompakte Bosskammer.",
    rows: [
      "####################",
      "#S.K..R.C.....#P...#",
      "#.####..#####.#D#..#",
      "#..b.#..^...#.#....#",
      "#....#..A...#.#.0..#",
      "#.###..####...#....#",
      "#..##...R..K..#....#",
      "#..#######.###.#...#",
      "#...E....#..E..#...#",
      "#....:...#.....#B..#",
      "#.####..#######....#",
      "#....K......C...o..#",
      "#..v....R.....^....#",
      "####################"
    ],
    chests: ["rupees"],
    boss: { name: "Nachtkoenig", health: 9 },
    relic: "star"
  }
];

let gameState;
let audioContext = null;
let musicEnabled = false;
let musicIntervalId = null;
let bgmAudio = null;
let activeTrackSrc = "";
let noteIndex = 0;
let nextNoteAt = 0;
let gameStarted = false;
let gamePaused = false;
let dialogTimeoutId = null;
let interactHintShown = false;
let particles = [];
let enemyProjectiles = [];
let backgroundSpecks = [];
let screenShake = 0;
let isMobileMode = false;

const musicTracks = [
  { id: "mosswing", title: "Mosswing Path", src: "assets/audio/mosswing-path.mp3", volume: 0.78 },
  { id: "marble", title: "Marble Marauders", src: "assets/audio/marble-marauders.mp3", volume: 0.74 },
  { id: "moonlit", title: "Moonlit Maple Trail", src: "assets/audio/moonlit-maple-trail.mp3", volume: 0.76 },
  { id: "marbleAlt", title: "Marble Marauders Alt", src: "assets/audio/marble-marauders-alt.mp3", volume: 0.78 },
  { id: "mosswingAlt", title: "Mosswing Path Alt", src: "assets/audio/mosswing-path-alt.mp3", volume: 0.74 },
  { id: "moonlitAlt", title: "Moonlit Maple Trail Alt", src: "assets/audio/moonlit-maple-trail-alt.mp3", volume: 0.76 }
];

const musicTrackByTheme = {
  forest: "mosswing",
  crypt: "marbleAlt",
  sky: "mosswingAlt",
  lava: "marble",
  crystal: "moonlitAlt",
  moon: "moonlit",
  boss: "marbleAlt"
};

const relicPowerText = {
  glow: "Glow-Relikt: +1 Herz und Altare heilen staerker.",
  echo: "Echo-Relikt: Der naechste Treffer wird automatisch pariert.",
  wind: "Wind-Relikt: Dash wird weiter und laedt schneller.",
  ember: "Ember-Relikt: Dash verbrennt nahe Gegner.",
  prism: "Prism-Relikt: Die Wand bekommt mehr Reichweite und Bossdruck.",
  star: "Star-Relikt: Boss-Treffer verursachen Bonus-Schaden."
};

function createQuestState() {
  return {
    talkedToNpc: false,
    openedChest: false,
    boughtFromShop: false,
    usedAltar: false,
    foundRelic: false,
    defeatedBoss: false
  };
}

function createInventory() {
  return {
    rupees: 0,
    potions: 0,
    swordLevel: 1,
    currentWeapon: "sword",
    unlockedWeapons: ["sword"],
    relics: []
  };
}

function hasRelic(kind, player = gameState?.player) {
  return Boolean(player && player.inventory && player.inventory.relics.includes(kind));
}

function playerMaxHealth(player = gameState?.player) {
  if (!player) return maxHealth;
  let total = maxHealth;
  if (hasRelic("glow", player)) total += 1;
  if (hasRelic("star", player)) total += 1;
  return total;
}

function healPlayer(amount) {
  if (!gameState) return;
  gameState.player.health = Math.min(playerMaxHealth(), gameState.player.health + amount);
}

function createPlayer() {
  return {
    x: 0,
    y: 0,
    size: 22,
    speed: 3.35,
    health: maxHealth,
    direction: "down",
    attackTimer: 0,
    hurtTimer: 0,
    invulnerable: 0,
    dashCooldown: 0,
    echoShieldCooldown: 0,
    attackFlash: 0,
    isBlocking: false,
    inventory: createInventory()
  };
}

function createEnemy(x, y, levelIndex) {
  const roleCycle = ["scout", "brute", "mage"];
  const role = roleCycle[(x + y + levelIndex) % roleCycle.length];
  const baseHealth = role === "brute" ? 2 + Math.floor(levelIndex / 2) : role === "mage" ? 1 + Math.floor(levelIndex / 3) : 1;
  const sprite = role === "mage" ? "mage" : role === "brute" ? "guard" : (["slime", "bat"][levelIndex % 2] || "slime");
  return {
    kind: "enemy",
    role,
    x: x * tileSize + tileSize / 2,
    y: y * tileSize + tileSize / 2,
    size: role === "brute" ? 24 : 20,
    health: baseHealth,
    maxHealth: baseHealth,
    speed: (role === "brute" ? 0.58 : role === "mage" ? 0.68 : 0.92) + Math.random() * 0.12 + levelIndex * 0.035,
    directionX: Math.random() > 0.5 ? 1 : -1,
    directionY: Math.random() > 0.5 ? 1 : -1,
    alive: true,
    changeTimer: 70 + Math.random() * 80,
    castTimer: 80 + Math.random() * 90,
    sprite,
    animOffset: Math.random() * 1000,
    color: role === "brute" ? "#ff9168" : role === "mage" ? "#d9a6ff" : (["#d55c4a", "#9f62ff", "#ff9168", "#ff8f54", "#7fdcff", "#d9a6ff"][levelIndex] || "#d55c4a")
  };
}

function createBoss(x, y, bossConfig, theme) {
  return {
    kind: "boss",
    name: bossConfig.name,
    x: x * tileSize + tileSize / 2,
    y: y * tileSize + tileSize / 2,
    size: 28,
    speed: 0.7,
    directionX: -1,
    directionY: 1,
    alive: true,
    changeTimer: 48,
    health: bossConfig.health,
    maxHealth: bossConfig.health,
    color: theme === "lava" ? "#ff6d4f" : "#e5558f",
    phase: 0
  };
}

function createChest(x, y, reward) {
  return { x: x * tileSize + tileSize / 2, y: y * tileSize + tileSize / 2, reward, open: false, sparkle: Math.random() * Math.PI * 2 };
}

function createNpc(x, y, text) {
  return { x: x * tileSize + tileSize / 2, y: y * tileSize + tileSize / 2, text, pulse: Math.random() * Math.PI * 2 };
}

function createShop(x, y) {
  return { x: x * tileSize + tileSize / 2, y: y * tileSize + tileSize / 2, soldSwordUpgrade: false, pulse: Math.random() * Math.PI * 2 };
}

function createAltar(x, y) {
  return { x: x * tileSize + tileSize / 2, y: y * tileSize + tileSize / 2, active: false, pulse: Math.random() * Math.PI * 2 };
}

function createRelic(x, y, kind) {
  return { x: x * tileSize + tileSize / 2, y: y * tileSize + tileSize / 2, collected: false, kind, pulse: Math.random() * Math.PI * 2 };
}

function createFairy(player) {
  return { x: player.x + 18, y: player.y - 18, pulse: Math.random() * Math.PI * 2 };
}

function initBackgroundSpecks() {
  backgroundSpecks = Array.from({ length: 42 }, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    size: 1 + Math.random() * 2,
    speed: 0.18 + Math.random() * 0.55,
    alpha: 0.06 + Math.random() * 0.18
  }));
}

function spawnParticles(x, y, color, count = 8, spread = 1.6, gravity = 0.02) {
  for (let i = 0; i < count; i += 1) {
    particles.push({
      x,
      y,
      dx: (Math.random() - 0.5) * spread * 2,
      dy: (Math.random() - 0.5) * spread * 2 - 0.5,
      life: 22 + Math.random() * 18,
      size: 2 + Math.random() * 2,
      color,
      gravity
    });
  }
}

function updateParticles() {
  for (const particle of particles) {
    particle.x += particle.dx;
    particle.y += particle.dy;
    particle.dy += particle.gravity;
    particle.life -= 1;
  }
  particles = particles.filter((particle) => particle.life > 0);

  for (const speck of backgroundSpecks) {
    speck.y += speck.speed * (gameState && gameState.levelIndex >= 3 ? 1.4 : 1);
    if (speck.y > canvas.height + 6) {
      speck.y = -6;
      speck.x = Math.random() * canvas.width;
    }
  }

  if (screenShake > 0) screenShake -= 1;
}

function detectMobileMode() {
  const coarsePointer = window.matchMedia && window.matchMedia("(pointer: coarse)").matches;
  const narrowScreen = window.innerWidth <= 820 || window.innerHeight <= 560;
  return coarsePointer || navigator.maxTouchPoints > 0 || narrowScreen;
}

function updateViewportVars() {
  const viewport = window.visualViewport;
  const width = Math.max(320, Math.round(viewport ? viewport.width : window.innerWidth));
  const height = Math.max(320, Math.round(viewport ? viewport.height : window.innerHeight));
  document.documentElement.style.setProperty("--app-width", `${width}px`);
  document.documentElement.style.setProperty("--app-height", `${height}px`);
}

function fitGameCanvas() {
  if (!gameShellEl) return;
  const rect = gameShellEl.getBoundingClientRect();
  const style = window.getComputedStyle(gameShellEl);
  const paddingX = parseFloat(style.paddingLeft) + parseFloat(style.paddingRight);
  const paddingY = parseFloat(style.paddingTop) + parseFloat(style.paddingBottom);
  const availableWidth = Math.max(160, rect.width - paddingX);
  const availableHeight = Math.max(112, rect.height - paddingY);
  let width = availableWidth;
  let height = width / canvasAspect;
  if (height > availableHeight) {
    height = availableHeight;
    width = height * canvasAspect;
  }
  document.documentElement.style.setProperty("--game-css-width", `${Math.floor(width)}px`);
  document.documentElement.style.setProperty("--game-css-height", `${Math.floor(height)}px`);
}

function syncMobileMode() {
  updateViewportVars();
  isMobileMode = detectMobileMode();
  document.body.classList.toggle("mobile-mode", isMobileMode);
  document.body.classList.toggle("desktop-mode", !isMobileMode);
  if (mobileControlsEl) mobileControlsEl.setAttribute("aria-hidden", isMobileMode ? "false" : "true");
  requestAnimationFrame(fitGameCanvas);
}

function startMobileMusicIfNeeded(forceRestart = false) {
  musicEnabled = true;
  startMusic(forceRestart);
  updateHud();
}

function setMessage(text) {
  messageEl.textContent = text;
}

function showDialog(text, duration = 2400) {
  dialogBoxEl.textContent = text;
  dialogBoxEl.classList.add("visible");
  clearTimeout(dialogTimeoutId);
  dialogTimeoutId = setTimeout(() => dialogBoxEl.classList.remove("visible"), duration);
}
function buildLevel(levelIndex, existingPlayer, saved) {
  const def = levels[levelIndex];
  const player = existingPlayer || createPlayer();
  const keys = [];
  const enemies = [];
  const chests = [];
  const npcs = [];
  const shops = [];
  const altars = [];
  const relics = [];
  let door = null;
  let portal = null;
  let boss = null;
  let keysRequired = 0;
  let chestIndex = 0;
  let npcIndex = 0;

  const map = def.rows.map((row, y) => row.split("").map((cell, x) => {
    if (cell === "S") { player.x = x * tileSize + tileSize / 2; player.y = y * tileSize + tileSize / 2; return "."; }
    if (cell === "K") { keys.push({ x: x * tileSize + tileSize / 2, y: y * tileSize + tileSize / 2, collected: false, bob: Math.random() * Math.PI * 2 }); keysRequired += 1; return "."; }
    if (cell === "E") { enemies.push(createEnemy(x, y, levelIndex)); return "."; }
    if (cell === "B") { boss = createBoss(x, y, def.boss, def.theme); return "."; }
    if (cell === "C") { chests.push(createChest(x, y, def.chests[chestIndex] || "rupees")); chestIndex += 1; return "."; }
    if (cell === "N") { npcs.push(createNpc(x, y, def.npcs[npcIndex] || "Bleib mutig.")); npcIndex += 1; return "."; }
    if (cell === "T") { shops.push(createShop(x, y)); return "."; }
    if (cell === "A") { altars.push(createAltar(x, y)); relics.push(createRelic(x, y, def.relic)); return "."; }
    if (cell === "D") { door = { x, y, open: false }; return "D"; }
    if (cell === "P") { portal = { x, y, pulse: 0 }; return "."; }
    return cell;
  }));

  mapCacheDirty = true;
  enemyProjectiles = [];
  const state = { map, player, keys, enemies, chests, npcs, shops, altars, relics, boss, door, portal, keysRequired, collectedKeys: 0, victory: false, gameOver: false, levelIndex, levelName: def.name, finishedGame: false, enemyClearRewarded: false, fairy: createFairy(player), quests: createQuestState(), lastAttackVisual: null };
  if (saved) hydrateLevelState(state, saved);
  return state;
}

function hydrateLevelState(state, saved) {
  const player = state.player;
  if (typeof saved.playerX === "number") player.x = saved.playerX;
  if (typeof saved.playerY === "number") player.y = saved.playerY;
  if (saved.playerDirection) player.direction = saved.playerDirection;
  if (saved.inventory) {
    player.inventory.rupees = saved.inventory.rupees || 0;
    player.inventory.potions = saved.inventory.potions || 0;
    player.inventory.swordLevel = saved.inventory.swordLevel || 1;
    player.inventory.currentWeapon = saved.inventory.currentWeapon || "sword";
    player.inventory.unlockedWeapons = Array.isArray(saved.inventory.unlockedWeapons) ? saved.inventory.unlockedWeapons : ["sword"];
    player.inventory.relics = Array.isArray(saved.inventory.relics) ? saved.inventory.relics : [];
  }
  player.health = typeof saved.playerHealth === "number" ? Math.max(1, Math.min(playerMaxHealth(player), saved.playerHealth)) : Math.min(player.health, playerMaxHealth(player));
  player.echoShieldCooldown = saved.playerEchoShieldCooldown || 0;
  if (saved.quests) state.quests = { ...state.quests, ...saved.quests };
  state.enemyClearRewarded = Boolean(saved.enemyClearRewarded);
  if (Array.isArray(saved.keysCollected)) saved.keysCollected.forEach((value, index) => { if (state.keys[index]) state.keys[index].collected = Boolean(value); });
  if (Array.isArray(saved.chestsOpen)) saved.chestsOpen.forEach((value, index) => { if (state.chests[index]) state.chests[index].open = Boolean(value); });
  if (Array.isArray(saved.shopStates)) saved.shopStates.forEach((value, index) => { if (state.shops[index]) state.shops[index].soldSwordUpgrade = Boolean(value); });
  if (Array.isArray(saved.altarStates)) saved.altarStates.forEach((value, index) => { if (state.altars[index]) state.altars[index].active = Boolean(value); });
  if (Array.isArray(saved.relicStates)) saved.relicStates.forEach((value, index) => { if (state.relics[index]) state.relics[index].collected = Boolean(value); });
  if (Array.isArray(saved.enemiesAlive)) saved.enemiesAlive.forEach((value, index) => { if (state.enemies[index]) state.enemies[index].alive = Boolean(value); });
  state.collectedKeys = state.keys.filter((key) => key.collected).length;
  if (state.boss && saved.boss) {
    state.boss.health = Math.max(0, Math.min(state.boss.maxHealth, saved.boss.health));
    state.boss.alive = state.boss.health > 0;
    if (typeof saved.boss.x === "number") state.boss.x = saved.boss.x;
    if (typeof saved.boss.y === "number") state.boss.y = saved.boss.y;
  }
  if (saved.finishedGame) { state.finishedGame = true; state.victory = true; }
  if (state.collectedKeys >= state.keysRequired && (!state.boss || !state.boss.alive)) state.door.open = true;
}

function saveGame() {
  if (!gameState) return;
  localStorage.setItem(SAVE_KEY, JSON.stringify({
    levelIndex: gameState.levelIndex,
    playerHealth: gameState.player.health,
    playerEchoShieldCooldown: gameState.player.echoShieldCooldown,
    playerX: gameState.player.x,
    playerY: gameState.player.y,
    playerDirection: gameState.player.direction,
    inventory: { ...gameState.player.inventory },
    quests: { ...gameState.quests },
    keysCollected: gameState.keys.map((key) => key.collected),
    chestsOpen: gameState.chests.map((chest) => chest.open),
    shopStates: gameState.shops.map((shop) => shop.soldSwordUpgrade),
    altarStates: gameState.altars.map((altar) => altar.active),
    relicStates: gameState.relics.map((relic) => relic.collected),
    enemiesAlive: gameState.enemies.map((enemy) => enemy.alive),
    enemyClearRewarded: gameState.enemyClearRewarded,
    boss: gameState.boss ? { health: gameState.boss.health, x: gameState.boss.x, y: gameState.boss.y } : null,
    finishedGame: gameState.finishedGame
  }));
}

function loadGame() {
  const raw = localStorage.getItem(SAVE_KEY);
  if (!raw) return false;
  try {
    const data = JSON.parse(raw);
    const levelIndex = Math.max(0, Math.min(levels.length - 1, data.levelIndex || 0));
    const player = createPlayer();
    gameState = buildLevel(levelIndex, player, data);
    gameStarted = true;
    gamePaused = false;
    pauseOverlay.classList.add("hidden");
    gameOverOverlay.classList.add("hidden");
    menuOverlay.classList.add("hidden");
    setMessage(`Fortgesetzt: ${gameState.levelName}.`);
    updateHud();
    startMobileMusicIfNeeded(true);
    return true;
  } catch {
    localStorage.removeItem(SAVE_KEY);
    return false;
  }
}

function clearSave() { localStorage.removeItem(SAVE_KEY); setMessage("Gespeicherter Fortschritt geloescht."); }

function resetGame() {
  gameState = buildLevel(0, createPlayer());
  gameStarted = false;
  gamePaused = false;
  pauseOverlay.classList.add("hidden");
  gameOverOverlay.classList.add("hidden");
  menuOverlay.classList.remove("hidden");
  stopMusic();
  musicEnabled = false;
  setMessage("Single-Screen-Modus aktiv. Starte oder setze deinen Save fort.");
  updateHud();
}

function startGame() {
  gameState = buildLevel(0, createPlayer());
  gameStarted = true;
  gamePaused = false;
  pauseOverlay.classList.add("hidden");
  gameOverOverlay.classList.add("hidden");
  menuOverlay.classList.add("hidden");
  setMessage(levels[0].message);
  updateHud();
  saveGame();
  startMobileMusicIfNeeded(true);
  playJingle([523.25, 659.25, 783.99], 0.06);
  showDialog("Die Reise beginnt. Sammle Schluessel, aktiviere Altare und halte nach Reliktsternen Ausschau.", 3200);
}

function currentQuestText() {
  if (!gameStarted) return "Abenteuer starten";
  if (gameState.finishedGame) return "Reich gerettet";
  if (!gameState.quests.talkedToNpc && gameState.npcs.length > 0) return "Mit einer Figur sprechen";
  if (!gameState.quests.openedChest && gameState.chests.length > 0) return "Eine Truhe finden";
  if (!gameState.quests.usedAltar && gameState.altars.length > 0) return "Runenaltar aktivieren";
  if (!gameState.quests.foundRelic && gameState.relics.length > 0) return "Reliktstern finden";
  if (!gameState.quests.boughtFromShop && gameState.shops.length > 0) return "Beim Kaufmann einkaufen";
  if (gameState.boss && gameState.boss.alive && gameState.collectedKeys >= gameState.keysRequired) return "Boss besiegen";
  if (gameState.collectedKeys < gameState.keysRequired) return "Schluessel sammeln";
  return "Portal erreichen";
}

function renderHearts() {
  heartsEl.innerHTML = "";
  const totalHearts = playerMaxHealth();
  for (let i = 0; i < totalHearts; i += 1) {
    const heart = document.createElement("span");
    heart.className = i < gameState.player.health ? "heart" : "heart empty";
    heartsEl.appendChild(heart);
  }
}

function updateHud() {
  renderHearts();
  levelNameEl.textContent = gameState.levelName;
  questTextEl.textContent = currentQuestText();
  keysEl.textContent = gameState.collectedKeys;
  keysRequiredEl.textContent = gameState.keysRequired;
  enemiesEl.textContent = gameState.enemies.filter((enemy) => enemy.alive).length;
  rupeesEl.textContent = gameState.player.inventory.rupees;
  potionsEl.textContent = gameState.player.inventory.potions;
  swordLevelEl.textContent = gameState.player.inventory.swordLevel;
  weaponNameEl.textContent = weaponLabels[gameState.player.inventory.currentWeapon] || "Schwert";
  bossStatusEl.textContent = gameState.boss && gameState.boss.alive ? `${gameState.boss.name}: ${gameState.boss.health}` : gameState.quests.defeatedBoss ? "Boss besiegt" : "Kein Boss";
  const track = currentMusicTrack();
  musicButton.textContent = musicEnabled ? `BGM: ${track.title}` : "BGM: Aus";
  musicButton.className = musicEnabled ? "secondary" : "";
  if (mobileMusicButton) {
    mobileMusicButton.textContent = musicEnabled ? "M+" : "M";
    mobileMusicButton.classList.toggle("active", musicEnabled);
  }
}

function togglePause() {
  if (!gameStarted || gameState.finishedGame || gameState.gameOver) return;
  gamePaused = !gamePaused;
  pauseOverlay.classList.toggle("hidden", !gamePaused);
  playJingle(gamePaused ? [392, 329.63] : [523.25, 659.25], 0.05, "triangle", 0.025);
  setMessage(gamePaused ? "Spiel pausiert." : "Weiter geht's.");
}

function unlockWeapon(name) {
  const inventory = gameState.player.inventory;
  if (!inventory.unlockedWeapons.includes(name)) {
    inventory.unlockedWeapons.push(name);
    inventory.currentWeapon = name;
    showDialog(`Neue Waffe freigeschaltet: ${weaponLabels[name]}.`, 2400);
    setMessage(`${weaponLabels[name]} freigeschaltet.`);
    playJingle([587.33, 783.99, 987.77], 0.05, "triangle", 0.03);
  }
}

function advanceLevel() {
  const nextIndex = gameState.levelIndex + 1;
  if (nextIndex >= levels.length) {
    gameState.finishedGame = true;
    gameState.victory = true;
    setMessage("Du hast alle sechs Gebiete geschafft und den Nachtkoenig besiegt.");
    stopMusic();
    musicEnabled = false;
    updateHud();
    saveGame();
    showDialog("Das Reich ist gerettet. Sterne, Tempel und Seen leuchten wieder.", 3400);
    return;
  }
  const player = gameState.player;
  healPlayer(fairyHeal);
  player.attackTimer = 0;
  player.hurtTimer = 0;
  player.invulnerable = 90;
  gameState = buildLevel(nextIndex, player);
  interactHintShown = false;
  if (nextIndex === 2) unlockWeapon("lance");
  if (nextIndex === 4) unlockWeapon("wand");
  setMessage(`${levels[nextIndex].message} Die Fee heilt ${fairyHeal} Herzen.`);
  updateHud();
  saveGame();
  if (musicEnabled) startMusic(true);
  playJingle([523.25, 659.25, 783.99, 1046.5], 0.09);
}

function distance(a, b) { return Math.hypot(a.x - b.x, a.y - b.y); }
function tileAtPixel(x, y) {
  const tx = Math.floor(x / tileSize);
  const ty = Math.floor(y / tileSize);
  if (tx < 0 || ty < 0 || tx >= mapWidth || ty >= mapHeight) return "#";
  return gameState.map[ty][tx];
}
function isBlockedPixel(x, y) {
  const tile = tileAtPixel(x, y);
  if (wallTiles.has(tile)) return true;
  return tile === "D" && !gameState.door.open;
}
function collides(x, y, size) {
  const half = size / 2;
  return isBlockedPixel(x - half, y - half) || isBlockedPixel(x + half, y - half) || isBlockedPixel(x - half, y + half) || isBlockedPixel(x + half, y + half);
}
function tryMoveEntity(entity, dx, dy, size) {
  const nextX = entity.x + dx;
  if (!collides(nextX, entity.y, size)) entity.x = nextX; else if (entity.directionX) entity.directionX *= -1;
  const nextY = entity.y + dy;
  if (!collides(entity.x, nextY, size)) entity.y = nextY; else if (entity.directionY) entity.directionY *= -1;
}
function movePlayer() {
  const player = gameState.player;
  const terrainFactor = slowTiles.has(tileAtPixel(player.x, player.y)) ? 0.68 : 1;
  const speed = player.speed * terrainFactor;
  let dx = 0;
  let dy = 0;
  if (input.up) { dy -= speed; player.direction = "up"; }
  if (input.down) { dy += speed; player.direction = "down"; }
  if (input.left) { dx -= speed; player.direction = "left"; }
  if (input.right) { dx += speed; player.direction = "right"; }
  if (dx !== 0 && dy !== 0) { dx *= 0.7071; dy *= 0.7071; }
  tryMoveEntity(player, dx, dy, player.size);
}
function updateFairy() {
  const { fairy, player } = gameState;
  fairy.pulse += 0.08;
  fairy.x += (player.x + 18 - fairy.x) * 0.12;
  fairy.y += (player.y - 18 + Math.sin(fairy.pulse) * 8 - fairy.y) * 0.12;
}

function sfxPickup() { playJingle([659.25, 880], 0.05, "square", 0.03); }
function sfxChest() { playJingle([523.25, 659.25, 880], 0.05, "triangle", 0.03); }
function sfxTalk() { playJingle([392, 493.88], 0.04, "triangle", 0.02); }
function sfxShop() { playJingle([587.33, 659.25], 0.05, "square", 0.03); }
function sfxRelic() { playJingle([783.99, 987.77, 1174.66], 0.05, "triangle", 0.03); }
function updateKeys() {
  for (const key of gameState.keys) {
    key.bob += 0.08;
    if (key.collected) continue;
    if (distance(gameState.player, key) < 24) {
      key.collected = true;
      gameState.collectedKeys += 1;
      gameState.player.inventory.rupees += 5;
      sfxPickup();
      if (gameState.collectedKeys >= gameState.keysRequired) {
        if (!gameState.boss || !gameState.boss.alive) gameState.door.open = true;
        setMessage(gameState.boss && gameState.boss.alive ? "Alle Schluessel gefunden. Jetzt den Boss besiegen." : "Das Tor ist offen. Die Fee zeigt dir das Portal.");
        syncMusicToState(true);
      } else {
        setMessage(`Schluessel gefunden. Noch ${gameState.keysRequired - gameState.collectedKeys}.`);
      }
      updateHud();
      saveGame();
    }
  }
}

function applyChestReward(reward) {
  const inventory = gameState.player.inventory;
  if (reward === "rupees") {
    inventory.rupees += 25;
    setMessage("Truhe geoeffnet. Du findest 25 Rupees.");
  } else if (reward === "potion") {
    inventory.potions += 1;
    setMessage("Truhe geoeffnet. Ein Heiltrank wandert ins Inventar.");
  } else if (reward === "sword") {
    inventory.swordLevel = Math.max(inventory.swordLevel, 2);
    setMessage("Truhe geoeffnet. Dein Schwert ist jetzt staerker.");
  } else if (reward === "lance") {
    unlockWeapon("lance");
  } else if (reward === "wand") {
    unlockWeapon("wand");
    inventory.potions += 1;
  }
  spawnParticles(gameState.player.x, gameState.player.y, "#f7d154", 14, 2.1);
  showDialog(messageEl.textContent, 2400);
  sfxChest();
  updateHud();
}

function updateChests() {
  for (const chest of gameState.chests) {
    chest.sparkle += 0.06;
    if (chest.open) continue;
    if (distance(gameState.player, chest) < 26) {
      chest.open = true;
      gameState.quests.openedChest = true;
      applyChestReward(chest.reward);
      saveGame();
    }
  }
}

function updateAltarsAndRelics() {
  for (let i = 0; i < gameState.altars.length; i += 1) {
    const altar = gameState.altars[i];
    const relic = gameState.relics[i];
    altar.pulse += 0.05;
    relic.pulse += 0.08;
    if (!altar.active && distance(gameState.player, altar) < 28) {
      altar.active = true;
      gameState.quests.usedAltar = true;
      healPlayer(hasRelic("glow") ? 3 : 2);
      gameState.player.inventory.rupees += 10;
      spawnParticles(altar.x, altar.y, "#8ef0bd", 16, 1.6);
      showDialog("Runenaltar aktiv. Die Fee heilt dich und der Raum leuchtet heller.", 2600);
      setMessage(hasRelic("glow") ? "Runenaltar aktiviert. Glow verstaerkt die Heilung." : "Runenaltar aktiviert. Zwei Herzen geheilt.");
      playJingle([523.25, 659.25, 783.99], 0.06, "triangle", 0.03);
      updateHud();
      saveGame();
    }
    if (altar.active && !relic.collected && distance(gameState.player, relic) < 22) {
      relic.collected = true;
      gameState.quests.foundRelic = true;
      if (!gameState.player.inventory.relics.includes(relic.kind)) gameState.player.inventory.relics.push(relic.kind);
      gameState.player.inventory.swordLevel = Math.min(4, gameState.player.inventory.swordLevel + 1);
      applyRelicPower(relic.kind);
      spawnParticles(relic.x, relic.y, "#8ccfff", 18, 1.8, 0.01);
      sfxRelic();
      setMessage(relicPowerText[relic.kind] || `Reliktstern gefunden: ${relic.kind}.`);
      showDialog(relicPowerText[relic.kind] || "Ein Reliktstern schwingt in deinem Inventar.", 3000);
      updateHud();
      saveGame();
    }
  }
}

function applyRelicPower(kind) {
  const player = gameState.player;
  if (kind === "glow") {
    healPlayer(2);
  } else if (kind === "echo") {
    player.echoShieldCooldown = 0;
  } else if (kind === "wind") {
    player.dashCooldown = Math.min(player.dashCooldown, 10);
  } else if (kind === "prism") {
    if (!player.inventory.unlockedWeapons.includes("wand")) unlockWeapon("wand");
  } else if (kind === "star") {
    healPlayer(playerMaxHealth());
  }
}

function updateInteractions() {
  const player = gameState.player;
  const nearNpc = gameState.npcs.find((npc) => distance(player, npc) < 34);
  const nearShop = gameState.shops.find((shop) => distance(player, shop) < 34);
  if ((nearNpc || nearShop) && !interactHintShown) {
    showDialog(nearShop ? "Druecke E, um beim Kaufmann einzukaufen." : "Druecke E, um mit der Figur zu sprechen.", 1800);
    interactHintShown = true;
  }
  if (!nearNpc && !nearShop) interactHintShown = false;
}

function interactNearest() {
  if (!gameStarted || gamePaused || gameState.gameOver || gameState.finishedGame) return;
  const player = gameState.player;
  const nearNpc = gameState.npcs.find((npc) => distance(player, npc) < 34);
  if (nearNpc) {
    gameState.quests.talkedToNpc = true;
    showDialog(nearNpc.text, 3200);
    setMessage("Du hast mit einer Figur gesprochen.");
    sfxTalk();
    updateHud();
    saveGame();
    return;
  }
  const nearShop = gameState.shops.find((shop) => distance(player, shop) < 34);
  if (nearShop) handleShopInteraction(nearShop);
}

function handleShopInteraction(shop) {
  const inventory = gameState.player.inventory;
  if (!shop.soldSwordUpgrade && inventory.swordLevel < 4 && inventory.rupees >= 40) {
    inventory.rupees -= 40;
    inventory.swordLevel += 1;
    shop.soldSwordUpgrade = true;
    gameState.quests.boughtFromShop = true;
    setMessage("Kaufmann: Schwert-Upgrade fuer 40 Rupees. Gute Wahl.");
    showDialog("Kaufmann: Mehr Glanz, mehr Druck, mehr Reichweite.", 2400);
  } else if (inventory.rupees >= 20) {
    inventory.rupees -= 20;
    inventory.potions += 1;
    gameState.quests.boughtFromShop = true;
    setMessage("Kaufmann: Ein Heiltrank fuer 20 Rupees.");
    showDialog("Kaufmann: Trink ihn nicht zu spaet.", 2200);
  } else {
    setMessage("Kaufmann: Fuer ein Upgrade brauchst du 40 Rupees, fuer einen Trank 20.");
    showDialog("Kaufmann: Sammle noch etwas und komm wieder.", 2400);
  }
  sfxShop();
  updateHud();
  saveGame();
}

function hitPlayer(message) {
  const player = gameState.player;
  if (input.blocking) {
    spawnParticles(player.x, player.y, "#ffffff", 5, 1.2);
    playJingle([440, 330], 0.05, "triangle", 0.02);
    setMessage("Geblockt! Die Fee laechelt.");
    return;
  }
  if (hasRelic("echo") && player.echoShieldCooldown <= 0) {
    player.echoShieldCooldown = 480;
    player.invulnerable = 70;
    spawnParticles(player.x, player.y, "#bba3ff", 16, 2.2, -0.01);
    screenShake = 4;
    setMessage("Echo-Relikt pariert den Treffer.");
    showDialog("Echo-Schild aktiv. Der naechste Schlag prallt ab.", 1600);
    playJingle([392, 523.25, 783.99], 0.05, "triangle", 0.03);
    updateHud();
    saveGame();
    return;
  }
  player.health -= 1;
  player.hurtTimer = 40;
  player.invulnerable = 120;
  spawnParticles(player.x, player.y, "#ff7b63", 10, 2.2);
  screenShake = 8;
  setMessage(message);
  showDialog(message, 1800);
  playJingle([180, 140], 0.07, "sawtooth", 0.02);
  updateHud();
  saveGame();
  if (player.health <= 0) {
    gameState.gameOver = true;
    gamePaused = false;
    pauseOverlay.classList.add("hidden");
    gameOverOverlay.classList.remove("hidden");
    setMessage("Game Over. Du kannst neu starten oder deinen Save fortsetzen.");
  }
}

function updateEnemies() {
  const player = gameState.player;
  for (const enemy of gameState.enemies) {
    if (!enemy.alive) continue;
    const playerDistance = distance(player, enemy);
    enemy.changeTimer -= 1;
    if (enemy.changeTimer <= 0) {
      enemy.changeTimer = 60 + Math.random() * 80;
      const nearby = playerDistance < (enemy.role === "mage" ? 180 : 130);
      const retreat = enemy.role === "mage" && playerDistance < 78;
      const aimX = Math.sign(player.x - enemy.x) || enemy.directionX;
      const aimY = Math.sign(player.y - enemy.y) || enemy.directionY;
      enemy.directionX = nearby ? (retreat ? -aimX : aimX) : (Math.random() > 0.5 ? 1 : -1);
      enemy.directionY = nearby ? (retreat ? -aimY : aimY) : (Math.random() > 0.5 ? 1 : -1);
    }
    const chaseBoost = playerDistance < 120 && enemy.role !== "mage" ? 1.14 : 1;
    tryMoveEntity(enemy, enemy.directionX * enemy.speed * chaseBoost, enemy.directionY * enemy.speed * chaseBoost, enemy.size);
    if (enemy.role === "mage") updateEnemyCaster(enemy, playerDistance);
    if (!gameState.gameOver && player.invulnerable <= 0 && distance(player, enemy) < (enemy.role === "brute" ? 25 : 21)) hitPlayer(enemy.role === "brute" ? "Brutaler Treffer. Abstand halten." : "Autsch. Die Fee schuetzt dich kurz.");
  }
}

function updateEnemyCaster(enemy, playerDistance) {
  enemy.castTimer -= 1;
  if (enemy.castTimer > 0 || playerDistance > 190) return;
  enemy.castTimer = 115 + Math.random() * 55;
  const angle = Math.atan2(gameState.player.y - enemy.y, gameState.player.x - enemy.x);
  enemyProjectiles.push({
    x: enemy.x,
    y: enemy.y,
    vx: Math.cos(angle) * 2.35,
    vy: Math.sin(angle) * 2.35,
    life: 150,
    color: "#d9a6ff"
  });
  spawnParticles(enemy.x, enemy.y, "#d9a6ff", 6, 1.2, 0);
}

function updateEnemyProjectiles() {
  const player = gameState.player;
  for (const shot of enemyProjectiles) {
    shot.x += shot.vx;
    shot.y += shot.vy;
    shot.life -= 1;
    if (isBlockedPixel(shot.x, shot.y)) shot.life = 0;
    if (!gameState.gameOver && player.invulnerable <= 0 && distance(player, shot) < 18) {
      shot.life = 0;
      hitPlayer("Magiekugel trifft. Beweg dich quer zum Schuss.");
    }
  }
  enemyProjectiles = enemyProjectiles.filter((shot) => shot.life > 0);
}

function checkEnemyClearReward() {
  if (gameState.enemyClearRewarded || gameState.enemies.length === 0) return false;
  if (gameState.enemies.some((enemy) => enemy.alive)) return false;
  const reward = 15 + gameState.levelIndex * 5;
  const player = gameState.player;
  gameState.enemyClearRewarded = true;
  player.inventory.rupees += reward;
  healPlayer(1);
  spawnParticles(player.x, player.y, "#ffe48b", 18, 2.4, -0.01);
  setMessage(`Gebiet gesichert. Bonus: ${reward} Rupees und Feenglanz.`);
  showDialog("Gebiet gesichert. Die Fee staerkt dich.", 1800);
  playJingle([659.25, 783.99, 987.77, 1174.66], 0.055, "triangle", 0.03);
  return true;
}

function defeatEnemy(enemy, color) {
  enemy.alive = false;
  gameState.player.inventory.rupees += enemy.role === "brute" ? 16 : enemy.role === "mage" ? 14 : 10;
  spawnParticles(enemy.x, enemy.y, color, enemy.role === "brute" ? 16 : 10, 2.2);
}

function updateBoss() {
  const { boss, player } = gameState;
  if (!boss || !boss.alive) return;
  boss.changeTimer -= 1;
  boss.phase += 0.05;
  if (boss.changeTimer <= 0) {
    boss.changeTimer = 42;
    boss.directionX = Math.sign(player.x - boss.x) || boss.directionX;
    boss.directionY = Math.sign(player.y - boss.y) || boss.directionY;
  }
  const dash = distance(player, boss) < 170 ? 1.25 : 1;
  tryMoveEntity(boss, boss.directionX * boss.speed * dash, boss.directionY * boss.speed * dash, boss.size);
  boss.x += Math.cos(boss.phase) * 0.6;
  boss.y += Math.sin(boss.phase) * 0.6;
  if (!gameState.gameOver && player.invulnerable <= 0 && distance(player, boss) < 28) hitPlayer(`${boss.name} trifft hart, aber der leichte Modus faengt dich ab.`);
}

function updateTerrainHazards() {
  const player = gameState.player;
  const tile = tileAtPixel(player.x, player.y);
  if (hazardTiles.has(tile) && player.invulnerable <= 0) {
    const message = tile === "L" ? "Heisser Boden. Schnell ueber die sichere Route." : "Stachelfalle! Augen auf im Dungeon.";
    hitPlayer(message);
  }
}

function usePotion() {
  const inventory = gameState.player.inventory;
  if (!gameStarted || gamePaused || gameState.gameOver || gameState.finishedGame) return;
  if (inventory.potions <= 0) { setMessage("Kein Heiltrank im Inventar."); return; }
  if (gameState.player.health >= playerMaxHealth()) { setMessage("Deine Herzen sind schon voll."); return; }
  inventory.potions -= 1;
  healPlayer(hasRelic("glow") ? 4 : 3);
  setMessage("Heiltrank genutzt. Drei Herzen wiederhergestellt.");
  playJingle([659.25, 783.99, 987.77], 0.05, "triangle", 0.025);
  updateHud();
  saveGame();
}

function cycleWeapon() {
  const inventory = gameState.player.inventory;
  if (!gameStarted || gamePaused || inventory.unlockedWeapons.length < 2) return;
  const currentIndex = inventory.unlockedWeapons.indexOf(inventory.currentWeapon);
  inventory.currentWeapon = inventory.unlockedWeapons[(currentIndex + 1) % inventory.unlockedWeapons.length];
  setMessage(`Waffe gewechselt: ${weaponLabels[inventory.currentWeapon]}.`);
  playJingle([523.25, 783.99], 0.04, "triangle", 0.025);
  updateHud();
  saveGame();
}

function dash() {
  const player = gameState.player;
  if (!gameStarted || gamePaused || gameState.gameOver || gameState.finishedGame || player.dashCooldown > 0) return;
  let dx = 0;
  let dy = 0;
  if (input.up) dy = -1;
  if (input.down) dy = 1;
  if (input.left) dx = -1;
  if (input.right) dx = 1;
  if (dx === 0 && dy === 0) {
    if (player.direction === "up") dy = -1; else if (player.direction === "down") dy = 1; else if (player.direction === "left") dx = -1; else dx = 1;
  }
  if (dx !== 0 && dy !== 0) { dx *= 0.7071; dy *= 0.7071; }
  const windDash = hasRelic("wind");
  tryMoveEntity(player, dx * (windDash ? 36 : 26), dy * (windDash ? 36 : 26), player.size);
  player.dashCooldown = windDash ? 34 : 52;
  spawnParticles(player.x, player.y, windDash ? "#c8f8ff" : "#8ccfff", windDash ? 14 : 8, 1.4, 0.01);
  if (hasRelic("ember")) burnNearbyEnemies(40);
  playJingle([783.99, 659.25], 0.035, "sawtooth", 0.025);
}

function burnNearbyEnemies(radius) {
  let burned = 0;
  for (const enemy of gameState.enemies) {
    if (!enemy.alive || distance(gameState.player, enemy) > radius) continue;
    enemy.health -= 2;
    if (enemy.health <= 0) {
      defeatEnemy(enemy, "#ff9f5c");
      burned += 1;
    } else {
      spawnParticles(enemy.x, enemy.y, "#ff9f5c", 10, 2.0, -0.01);
    }
  }
  if (gameState.boss && gameState.boss.alive && distance(gameState.player, gameState.boss) < radius + 12) {
    gameState.boss.health -= 1;
    burned += 1;
    spawnParticles(gameState.boss.x, gameState.boss.y, "#ff9f5c", 16, 2.8, -0.01);
    if (gameState.boss.health <= 0) {
      gameState.boss.alive = false;
      gameState.quests.defeatedBoss = true;
      gameState.player.inventory.rupees += 50;
      gameState.door.open = gameState.collectedKeys >= gameState.keysRequired;
      syncMusicToState(true);
    }
  }
  if (burned > 0) {
    const cleared = checkEnemyClearReward();
    if (!cleared) setMessage("Ember-Dash verbrennt nahe Gegner.");
    updateHud();
    saveGame();
  }
}

function performAttack() {
  const player = gameState.player;
  if (!gameStarted || gamePaused || player.attackTimer > 0 || gameState.gameOver || gameState.finishedGame) return;
  const weapon = player.inventory.currentWeapon;
  const weaponConfig = weapon === "sword"
    ? { reach: 34, enemyRange: 36, bossRange: 42, damage: player.inventory.swordLevel, color: player.inventory.swordLevel > 1 ? "#ffe48b" : "#f6f6f6", sound: [440], cooldown: 10 }
    : weapon === "lance"
      ? { reach: 52, enemyRange: 54, bossRange: 60, damage: 1 + player.inventory.swordLevel, color: "#9be7ff", sound: [523.25, 659.25], cooldown: 13 }
      : { reach: 78, enemyRange: 46, bossRange: 50, damage: 2 + Math.floor(player.inventory.swordLevel / 2), color: "#ff9f5c", sound: [659.25, 987.77], cooldown: 12 };
  if (weapon === "wand" && hasRelic("prism")) {
    weaponConfig.reach += 18;
    weaponConfig.enemyRange += 10;
    weaponConfig.bossRange += 14;
    weaponConfig.damage += 1;
    weaponConfig.color = "#d7fbff";
  }
  player.attackTimer = weaponConfig.cooldown;
  player.attackFlash = 8;
  playJingle(weaponConfig.sound, 0.04, "square", 0.03);
  const attackPoint = { x: player.x, y: player.y };
  if (player.direction === "up") attackPoint.y -= weaponConfig.reach;
  else if (player.direction === "down") attackPoint.y += weaponConfig.reach;
  else if (player.direction === "left") attackPoint.x -= weaponConfig.reach;
  else attackPoint.x += weaponConfig.reach;
  gameState.lastAttackVisual = { weapon, direction: player.direction, x: attackPoint.x, y: attackPoint.y, timer: 8, color: weaponConfig.color };
  let defeated = 0;
  let defeatedEnemies = 0;
  let bossDefeated = false;
  for (const enemy of gameState.enemies) {
    if (enemy.alive && distance(attackPoint, enemy) < weaponConfig.enemyRange) {
      enemy.health -= weaponConfig.damage;
      spawnParticles(enemy.x, enemy.y, weaponConfig.color, 7, 1.8);
      if (enemy.health <= 0) {
        defeatEnemy(enemy, weaponConfig.color);
        defeated += 1;
        defeatedEnemies += 1;
      } else {
        screenShake = Math.max(screenShake, 3);
      }
    }
  }
  if (gameState.boss && gameState.boss.alive && distance(attackPoint, gameState.boss) < weaponConfig.bossRange) {
    const bossDamage = weaponConfig.damage + (hasRelic("star") ? 1 : 0);
    gameState.boss.health -= bossDamage;
    screenShake = 10;
    setMessage(`Treffer auf ${gameState.boss.name}. Noch ${Math.max(0, gameState.boss.health)}.`);
    showDialog(messageEl.textContent, 1500);
    playJingle([523.25, 659.25], 0.05);
    if (gameState.boss.health <= 0) {
      gameState.boss.alive = false;
      bossDefeated = true;
      gameState.quests.defeatedBoss = true;
      gameState.player.inventory.rupees += 50;
      gameState.door.open = gameState.collectedKeys >= gameState.keysRequired;
      setMessage("Der Boss ist besiegt. Das Portal ist frei.");
      showDialog("Der Boss faellt. Der Weg ist offen.", 2600);
      playJingle([523.25, 659.25, 783.99, 1046.5], 0.08);
      syncMusicToState(true);
    }
    defeated += 1;
  }
  const clearedAllEnemies = defeatedEnemies > 0 && checkEnemyClearReward();
  if (defeated > 0) {
    updateHud();
    saveGame();
    if (!clearedAllEnemies && !bossDefeated && (!gameState.boss || !gameState.boss.alive)) setMessage(defeated === 1 ? "Gegner besiegt." : `${defeated} Gegner besiegt.`);
  }
}

function updatePortal() {
  if (!gameState.door.open) return;
  gameState.portal.pulse += 0.08;
  const center = { x: gameState.portal.x * tileSize + tileSize / 2, y: gameState.portal.y * tileSize + tileSize / 2 };
  if (distance(gameState.player, center) < 28) advanceLevel();
}

function tickTimers() {
  const player = gameState.player;
  if (player.attackTimer > 0) player.attackTimer -= 1;
  if (player.hurtTimer > 0) player.hurtTimer -= 1;
  if (player.invulnerable > 0) player.invulnerable -= 1;
  if (player.dashCooldown > 0) player.dashCooldown -= 1;
  if (player.echoShieldCooldown > 0) player.echoShieldCooldown -= 1;
  if (player.attackFlash > 0) player.attackFlash -= 1;
  if (gameState.lastAttackVisual && --gameState.lastAttackVisual.timer <= 0) gameState.lastAttackVisual = null;
}
function themePalette() {
  const theme = levels[gameState.levelIndex].theme;
  if (theme === "forest") return { floor: "#3f6b4b", floor2: "#4f8258", wall: "#294735", inner: "#1a2c21", glow: "rgba(179,255,202,0.06)", portal: "#7be7ff" };
  if (theme === "crypt") return { floor: "#40425f", floor2: "#545684", wall: "#25273b", inner: "#151726", glow: "rgba(215,191,255,0.05)", portal: "#d18bff" };
  if (theme === "sky") return { floor: "#47677f", floor2: "#658bb0", wall: "#274255", inner: "#17303e", glow: "rgba(173,231,255,0.06)", portal: "#9be7ff" };
  if (theme === "lava") return { floor: "#6c3d2e", floor2: "#91513d", wall: "#46221a", inner: "#2a130f", glow: "rgba(255,190,120,0.06)", portal: "#ffe27b" };
  if (theme === "crystal") return { floor: "#32586b", floor2: "#4d89a2", wall: "#1b3140", inner: "#10202a", glow: "rgba(140,207,255,0.08)", portal: "#82f4ff" };
  return { floor: "#2c3456", floor2: "#485891", wall: "#171d35", inner: "#0d1022", glow: "rgba(209,139,255,0.08)", portal: "#f2c7ff" };
}

function drawAtlasFrame(targetCtx, frameName, x, y, width, height) {
  if (!assetAtlasReady || !atlasFrames[frameName]) return false;
  const [sx, sy, sw, sh] = atlasFrames[frameName];
  targetCtx.imageSmoothingEnabled = false;
  targetCtx.drawImage(assetAtlas, sx, sy, sw, sh, Math.round(x), Math.round(y), Math.round(width), Math.round(height));
  return true;
}

function drawAtlasSprite(frameName, x, y, width, height, yOffset = 0) {
  return drawAtlasFrame(ctx, frameName, x - width / 2, y - height / 2 + yOffset, width, height);
}

function drawComplexFrame(targetCtx, frameName, x, y, width, height) {
  if (!complexAtlasReady || !complexFrames[frameName]) return false;
  const [sx, sy, sw, sh] = complexFrames[frameName];
  targetCtx.imageSmoothingEnabled = false;
  targetCtx.drawImage(complexAtlas, sx, sy, sw, sh, Math.round(x), Math.round(y), Math.round(width), Math.round(height));
  return true;
}

function drawComplexSprite(frameName, x, y, width, height, yOffset = 0) {
  return drawComplexFrame(ctx, frameName, x - width / 2, y - height / 2 + yOffset, width, height);
}

function drawPlayerFrame(targetCtx, frameName, x, y, width, height) {
  if (!playerAtlasReady || !playerFrames[frameName]) return false;
  const [sx, sy, sw, sh] = playerFrames[frameName];
  targetCtx.imageSmoothingEnabled = false;
  targetCtx.drawImage(playerAtlas, sx, sy, sw, sh, Math.round(x), Math.round(y), Math.round(width), Math.round(height));
  return true;
}

function drawPlayerSprite(frameName, x, y, width, height, yOffset = 0) {
  return drawPlayerFrame(ctx, frameName, x - width / 2, y - height / 2 + yOffset, width, height);
}

function complexTileFrameName(tile, theme, x, y) {
  const themed = complexThemeTiles[theme] || complexThemeTiles.forest;
  if (tile === "#") return (x + y) % 3 === 0 ? themed.wallAlt : themed.wall;
  if (tile === ".") return (x * 7 + y * 11) % 5 === 0 ? themed.floorAlt : themed.floor;
  const mapped = symbolTileFrames[tile];
  if (!mapped) return themed.floor;
  return themed[mapped] || mapped;
}

function baseTileFrameName(tile, theme, x, y) {
  const themedTiles = tileFrames[theme] || tileFrames.forest;
  if (wallTiles.has(tile)) return (x + y) % 3 === 0 ? (theme === "forest" ? "hedge" : themedTiles.wall) : themedTiles.wall;
  if (tile === "~") return theme === "crystal" ? "water" : "crystalFloor";
  if (tile === "L") return "lavaFloor";
  if (tile === "=") return theme === "lava" ? "lavaWall" : "stone";
  return themedTiles.floor;
}

function drawTileOverlay(targetCtx, tile, px, py, x, y, palette) {
  const cx = px + tileSize / 2;
  const cy = py + tileSize / 2;
  if (tile === "," || tile === ":") {
    targetCtx.fillStyle = tile === "," ? "rgba(255,255,255,0.08)" : "rgba(38,21,17,0.22)";
    targetCtx.fillRect(px + 7 + (x % 3), py + 8 + (y % 2), 6, 3);
    targetCtx.fillRect(px + 19, py + 20, 5, 3);
  } else if (tile === "R") {
    targetCtx.strokeStyle = palette.portal;
    targetCtx.lineWidth = 2;
    targetCtx.strokeRect(px + 8, py + 8, 16, 16);
    targetCtx.fillStyle = "rgba(255,255,255,0.55)";
    targetCtx.fillRect(cx - 2, cy - 2, 4, 4);
  } else if (tile === "~") {
    targetCtx.fillStyle = "rgba(140,207,255,0.28)";
    targetCtx.fillRect(px + 4, py + 10, 24, 3);
    targetCtx.fillRect(px + 2, py + 19, 24, 3);
  } else if (tile === "=") {
    targetCtx.fillStyle = "rgba(119,74,32,0.72)";
    targetCtx.fillRect(px + 2, py + 9, 28, 5);
    targetCtx.fillRect(px + 2, py + 19, 28, 5);
    targetCtx.fillStyle = "rgba(247,209,84,0.26)";
    targetCtx.fillRect(px + 6, py + 7, 2, 20);
    targetCtx.fillRect(px + 22, py + 7, 2, 20);
  } else if (tile === "^") {
    targetCtx.fillStyle = "#c9d0d7";
    for (let i = 0; i < 4; i += 1) {
      const sx = px + 5 + i * 6;
      targetCtx.beginPath();
      targetCtx.moveTo(sx, py + 24);
      targetCtx.lineTo(sx + 3, py + 9);
      targetCtx.lineTo(sx + 6, py + 24);
      targetCtx.fill();
    }
  } else if (tile === "L") {
    targetCtx.fillStyle = "rgba(255,96,38,0.48)";
    targetCtx.fillRect(px + 2, py + 6, 28, 20);
    targetCtx.fillStyle = "rgba(255,217,86,0.55)";
    targetCtx.fillRect(px + 6, py + 11, 8, 3);
    targetCtx.fillRect(px + 17, py + 19, 9, 3);
  } else if (tile === "p") {
    targetCtx.fillStyle = "rgba(247,209,84,0.3)";
    targetCtx.fillRect(px + 8, py + 8, 16, 16);
    targetCtx.strokeStyle = "rgba(247,209,84,0.75)";
    targetCtx.strokeRect(px + 8, py + 8, 16, 16);
  } else if (tile === "0") {
    targetCtx.fillStyle = "rgba(180,185,170,0.9)";
    targetCtx.fillRect(px + 10, py + 5, 12, 22);
    targetCtx.fillStyle = "rgba(70,70,78,0.42)";
    targetCtx.fillRect(px + 8, py + 4, 16, 4);
    targetCtx.fillRect(px + 7, py + 26, 18, 4);
  } else if (tile === "o") {
    targetCtx.fillStyle = "rgba(120,118,105,0.72)";
    targetCtx.fillRect(px + 7, py + 18, 8, 6);
    targetCtx.fillRect(px + 15, py + 12, 10, 8);
    targetCtx.fillRect(px + 20, py + 22, 6, 5);
  } else if (tile === "b") {
    targetCtx.strokeStyle = "rgba(235,225,205,0.75)";
    targetCtx.lineWidth = 2;
    targetCtx.beginPath();
    targetCtx.moveTo(px + 8, py + 12);
    targetCtx.lineTo(px + 24, py + 21);
    targetCtx.moveTo(px + 23, py + 11);
    targetCtx.lineTo(px + 9, py + 23);
    targetCtx.stroke();
  } else if (tile === "v") {
    targetCtx.strokeStyle = "rgba(92,180,95,0.85)";
    targetCtx.lineWidth = 2;
    targetCtx.beginPath();
    targetCtx.moveTo(px + 8, py + 2);
    targetCtx.lineTo(px + 11, py + 26);
    targetCtx.moveTo(px + 18, py + 2);
    targetCtx.lineTo(px + 17, py + 28);
    targetCtx.stroke();
  } else if (tile === "G") {
    targetCtx.fillStyle = "rgba(247,209,84,0.34)";
    targetCtx.fillRect(px + 5, py + 5, 22, 3);
    targetCtx.fillRect(px + 5, py + 24, 22, 3);
    targetCtx.fillStyle = "rgba(215,190,115,0.78)";
    for (let i = 0; i < 4; i += 1) targetCtx.fillRect(px + 7 + i * 5, py + 6, 2, 20);
  }
}

function playerFrameName(direction) {
  if (direction === "up") return "heroUp";
  if (direction === "left") return "heroLeft";
  if (direction === "right") return "heroRight";
  return "heroDown";
}

function isPlayerMoving() {
  return input.up || input.down || input.left || input.right;
}

function playerComplexFrameName(player) {
  const direction = player.direction.charAt(0).toUpperCase() + player.direction.slice(1);
  if (player.inventory.currentWeapon === "wand" && player.attackTimer > 0) {
    return Math.floor(player.attackTimer / 3) % 2 === 0 ? "heroMagic1" : "heroMagic2";
  }
  if (input.blocking) return "heroShield";
  if (player.dashCooldown > 42) return `hero${direction}Dash`;
  if (player.attackTimer > 0 || player.attackFlash > 0) return `hero${direction}Attack`;
  if (isPlayerMoving()) {
    const phase = Math.floor(performance.now() / 115) % 4;
    return `hero${direction}Walk${phase === 3 ? 2 : phase + 1}`;
  }
  return `hero${direction}Idle`;
}

function drawBackgroundAtmosphere() {
  if (backgroundSpecks.length === 0) initBackgroundSpecks();
  const theme = levels[gameState.levelIndex].theme;
  if (theme === "forest") {
    ctx.fillStyle = "rgba(100, 180, 120, 0.08)";
    for (let i = 0; i < 6; i += 1) ctx.fillRect(i * 120, canvas.height - 90 - (i % 2) * 18, 82, 88);
  } else if (theme === "crypt") {
    ctx.fillStyle = "rgba(160, 120, 220, 0.05)";
    for (let i = 0; i < 8; i += 1) ctx.fillRect(i * 90, 30 + (i % 3) * 24, 56, 120);
  } else if (theme === "sky") {
    ctx.fillStyle = "rgba(180, 240, 255, 0.05)";
    for (let i = 0; i < 5; i += 1) ctx.fillRect(50 + i * 120, 40 + (i % 2) * 18, 96, 44);
  } else if (theme === "lava") {
    ctx.fillStyle = "rgba(255, 120, 70, 0.08)";
    for (let i = 0; i < 6; i += 1) ctx.fillRect(i * 120, canvas.height - 80 - (i % 2) * 20, 90, 80);
  } else if (theme === "crystal") {
    ctx.fillStyle = "rgba(120, 210, 255, 0.07)";
    for (let i = 0; i < 7; i += 1) ctx.fillRect(i * 96, 28 + (i % 2) * 120, 24, 120);
  } else {
    ctx.fillStyle = "rgba(220, 220, 255, 0.05)";
    for (let i = 0; i < 10; i += 1) ctx.fillRect(40 + i * 58, 30 + (i % 2) * 12, 2, 2);
  }
  for (const speck of backgroundSpecks) {
    ctx.fillStyle = `rgba(255,255,255,${speck.alpha})`;
    ctx.fillRect(speck.x, speck.y, speck.size, speck.size);
  }
}

let mapCacheCanvas = null;
let mapCacheCtx = null;
let mapCacheDirty = true;

function updateMapCache() {
  if (!mapCacheCanvas) {
    mapCacheCanvas = document.createElement("canvas");
    mapCacheCanvas.width = mapWidth * tileSize;
    mapCacheCanvas.height = mapHeight * tileSize;
    mapCacheCtx = mapCacheCanvas.getContext("2d");
  }

  const palette = themePalette();
  const theme = levels[gameState.levelIndex].theme;
  mapCacheCtx.clearRect(0, 0, mapCacheCanvas.width, mapCacheCanvas.height);

  for (let y = 0; y < mapHeight; y += 1) {
    for (let x = 0; x < mapWidth; x += 1) {
      const tile = gameState.map[y][x];
      const px = x * tileSize;
      const py = y * tileSize;
      const isWall = wallTiles.has(tile);
      const frameName = baseTileFrameName(tile, theme, x, y);
      if (!drawAtlasFrame(mapCacheCtx, frameName, px, py, tileSize, tileSize)) {
        mapCacheCtx.fillStyle = isWall ? palette.wall : palette.floor;
        mapCacheCtx.fillRect(px, py, tileSize, tileSize);
        mapCacheCtx.fillStyle = isWall ? palette.inner : palette.floor2;
        mapCacheCtx.fillRect(px + 3, py + 3, tileSize - 6, tileSize - 6);
      }
      if (!isWall) {
        mapCacheCtx.fillStyle = palette.glow;
        mapCacheCtx.fillRect(px + 8 + (y % 2), py + 8 + (x % 2), 6, 6);
      }
      drawTileOverlay(mapCacheCtx, tile, px, py, x, y, palette);
    }
  }
  mapCacheDirty = false;
}

function drawMap() {
  if (mapCacheDirty) updateMapCache();
  ctx.drawImage(mapCacheCanvas, 0, 0);
}

function drawKeys() {
  for (const key of gameState.keys) {
    if (key.collected) continue;
    const bob = Math.sin(key.bob) * 3;
    if (drawAtlasSprite("key", key.x, key.y, 20, 28, bob)) continue;
    ctx.fillStyle = "#f2d35f";
    ctx.fillRect(key.x - 6, key.y - 6 + bob, 12, 12);
    ctx.fillStyle = "#fff0a8";
    ctx.fillRect(key.x + 4, key.y - 3 + bob, 8, 6);
  }
}

function drawChests() {
  for (const chest of gameState.chests) {
    const bob = Math.sin(chest.sparkle) * 1.5;
    if (drawAtlasSprite(chest.open ? "chestOpen" : "chestClosed", chest.x, chest.y, 28, 26, bob - 2)) continue;
    ctx.fillStyle = chest.open ? "#8f6b2b" : "#c78a2f";
    ctx.fillRect(chest.x - 12, chest.y - 8 + bob, 24, 16);
    ctx.fillStyle = chest.open ? "#6f4d1d" : "#784b16";
    ctx.fillRect(chest.x - 12, chest.y - 12 + bob, 24, 6);
    ctx.fillStyle = "#f4db74";
    ctx.fillRect(chest.x - 2, chest.y - 7 + bob, 4, 6);
  }
}

function drawAltars() {
  for (const altar of gameState.altars) {
    const pulse = Math.sin(altar.pulse) * 2;
    if (drawAtlasSprite("altar", altar.x, altar.y, 30, 32, -1)) {
      ctx.fillStyle = altar.active ? "rgba(142,240,189,0.28)" : "rgba(255,255,255,0.08)";
      ctx.fillRect(altar.x - 14, altar.y - 16 + pulse, 28, 4);
      continue;
    }
    ctx.fillStyle = altar.active ? "#8ef0bd" : "#69a989";
    ctx.fillRect(altar.x - 10, altar.y - 10, 20, 20);
    ctx.fillStyle = altar.active ? "rgba(142,240,189,0.28)" : "rgba(255,255,255,0.08)";
    ctx.fillRect(altar.x - 14, altar.y - 14 + pulse, 28, 4);
  }
}

function drawRelics() {
  for (const relic of gameState.relics) {
    if (relic.collected) continue;
    const pulse = Math.sin(relic.pulse) * 3;
    if (drawAtlasSprite("fairy", relic.x, relic.y, 20, 20, pulse)) continue;
    ctx.fillStyle = "#8ccfff";
    ctx.fillRect(relic.x - 3, relic.y - 10 + pulse, 6, 20);
    ctx.fillRect(relic.x - 10, relic.y - 3 + pulse, 20, 6);
    ctx.fillStyle = "rgba(255,255,255,0.8)";
    ctx.fillRect(relic.x - 2, relic.y - 2 + pulse, 4, 4);
  }
}

function drawDoorAndPortal() {
  const palette = themePalette();
  const doorX = gameState.door.x * tileSize;
  const doorY = gameState.door.y * tileSize;
  if (!drawComplexFrame(ctx, gameState.door.open ? "gateOpen" : "lockedGate", doorX, doorY - 4, tileSize, tileSize + 8) && !drawAtlasFrame(ctx, gameState.door.open ? "doorOpen" : "doorClosed", doorX + 2, doorY - 2, tileSize - 4, tileSize + 4)) {
    ctx.fillStyle = gameState.door.open ? "#87d96d" : "#804d2d";
    ctx.fillRect(doorX + 3, doorY + 3, tileSize - 6, tileSize - 6);
  }
  const portalX = gameState.portal.x * tileSize + tileSize / 2;
  const portalY = gameState.portal.y * tileSize + tileSize / 2;
  const pulse = gameState.door.open ? 10 + Math.sin(gameState.portal.pulse) * 3 : 10;
  if (gameState.door.open && (drawComplexSprite("portalBlue", portalX, portalY, 46 + pulse, 46 + pulse) || drawAtlasSprite("portal", portalX, portalY, 42 + pulse, 42 + pulse))) return;
  ctx.fillStyle = gameState.door.open ? palette.portal : "#517d83";
  ctx.beginPath();
  ctx.arc(portalX, portalY, pulse, 0, Math.PI * 2);
  ctx.fill();
}

function drawEnemies() {
  for (const enemy of gameState.enemies) {
    if (!enemy.alive) continue;
    const phase = Math.floor((performance.now() + enemy.animOffset) / 220) % 2;
    const frame = enemy.sprite === "bat"
      ? (phase ? "batB" : "batA")
      : enemy.sprite === "guard"
        ? (phase ? "guardB" : "guardA")
        : enemy.sprite === "mage"
          ? (phase ? "mageB" : "mageA")
          : (phase ? "slimeB" : "slimeA");
    const size = enemy.role === "brute" ? 38 : enemy.sprite === "mage" ? 34 : 26;
    const drewSprite = drawComplexSprite(frame, enemy.x, enemy.y, size, size + 4, -3) || drawAtlasSprite(gameState.levelIndex % 2 === 0 ? "slime" : "bat", enemy.x, enemy.y, 24, 24);
    if (!drewSprite) {
      ctx.fillStyle = enemy.color;
      ctx.fillRect(enemy.x - 10, enemy.y - 10, 20, 20);
      ctx.fillStyle = "#fff4d6";
      ctx.fillRect(enemy.x - 5, enemy.y - 2, 3, 3);
      ctx.fillRect(enemy.x + 2, enemy.y - 2, 3, 3);
    }
    if (enemy.maxHealth > 1) {
      ctx.fillStyle = "rgba(12, 20, 18, 0.85)";
      ctx.fillRect(enemy.x - 12, enemy.y - 22, 24, 4);
      ctx.fillStyle = enemy.role === "brute" ? "#ffcf5f" : "#d9a6ff";
      ctx.fillRect(enemy.x - 12, enemy.y - 22, 24 * Math.max(0, enemy.health) / enemy.maxHealth, 4);
    }
  }
}

function drawEnemyProjectiles() {
  for (const shot of enemyProjectiles) {
    ctx.fillStyle = shot.color;
    ctx.globalAlpha = Math.max(0.25, Math.min(1, shot.life / 30));
    ctx.beginPath();
    ctx.arc(shot.x, shot.y, 5 + Math.sin(shot.life * 0.25) * 1.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }
}

function drawNpcs() {
  for (const npc of gameState.npcs) {
    npc.pulse += 0.05;
    if (drawAtlasSprite("npc", npc.x, npc.y, 28, 34, -3)) {
      ctx.fillStyle = "rgba(255,255,255,0.8)";
      ctx.fillRect(npc.x - 2, npc.y - 22 + Math.sin(npc.pulse) * 2, 4, 4);
      continue;
    }
    ctx.fillStyle = "#ffc56b";
    ctx.fillRect(npc.x - 10, npc.y - 10, 20, 20);
    ctx.fillStyle = "#5a3242";
    ctx.fillRect(npc.x - 8, npc.y - 14, 16, 6);
    ctx.fillStyle = "rgba(255,255,255,0.8)";
    ctx.fillRect(npc.x - 2, npc.y - 20 + Math.sin(npc.pulse) * 2, 4, 4);
  }
}

function drawShops() {
  for (const shop of gameState.shops) {
    shop.pulse += 0.04;
    if (drawAtlasSprite("chestOpen", shop.x, shop.y, 30, 28, -1)) {
      ctx.fillStyle = "rgba(247,209,84,0.9)";
      ctx.fillRect(shop.x - 6, shop.y - 22 + Math.sin(shop.pulse) * 2, 12, 3);
      continue;
    }
    ctx.fillStyle = "#ffcf5f";
    ctx.fillRect(shop.x - 11, shop.y - 11, 22, 22);
    ctx.fillStyle = "#5d3e16";
    ctx.fillRect(shop.x - 11, shop.y - 15, 22, 6);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(shop.x - 5, shop.y - 3, 3, 3);
    ctx.fillRect(shop.x + 2, shop.y - 3, 3, 3);
    ctx.fillStyle = "rgba(247,209,84,0.9)";
    ctx.fillRect(shop.x - 6, shop.y - 22 + Math.sin(shop.pulse) * 2, 12, 3);
  }
}

function drawBoss() {
  const boss = gameState.boss;
  if (!boss || !boss.alive) return;
  if (drawComplexSprite("bossFront", boss.x, boss.y, 58, 58, -8) || drawAtlasSprite("boss", boss.x, boss.y, 48, 48, -5)) {
    ctx.fillStyle = "rgba(255,123,99,0.9)";
    ctx.fillRect(boss.x - 18, boss.y - 30, 36, 6);
    ctx.fillStyle = "#7af56e";
    ctx.fillRect(boss.x - 18, boss.y - 30, (36 * Math.max(0, boss.health)) / boss.maxHealth, 6);
    return;
  }
  ctx.fillStyle = boss.color;
  ctx.fillRect(boss.x - 16, boss.y - 16, 32, 32);
  ctx.fillStyle = "#2e1733";
  ctx.fillRect(boss.x - 10, boss.y - 12, 20, 8);
  ctx.fillStyle = "#ffe0ef";
  ctx.fillRect(boss.x - 8, boss.y - 6, 5, 5);
  ctx.fillRect(boss.x + 3, boss.y - 6, 5, 5);
  ctx.fillStyle = "rgba(255,123,99,0.9)";
  ctx.fillRect(boss.x - 18, boss.y - 26, 36, 6);
  ctx.fillStyle = "#7af56e";
  ctx.fillRect(boss.x - 18, boss.y - 26, (36 * Math.max(0, boss.health)) / boss.maxHealth, 6);
}

function drawFairy() {
  const fairy = gameState.fairy;
  if (drawAtlasSprite("fairy", fairy.x, fairy.y, 24, 24)) return;
  ctx.fillStyle = "rgba(153,255,220,0.35)";
  ctx.beginPath();
  ctx.arc(fairy.x, fairy.y, 10, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#aaffdd";
  ctx.beginPath();
  ctx.arc(fairy.x, fairy.y, 5, 0, Math.PI * 2);
  ctx.fill();
}

function drawPlayer() {
  const player = gameState.player;
  if (player.invulnerable > 0 && Math.floor(player.invulnerable / 4) % 2 === 0) ctx.globalAlpha = 0.45;
  const playerFrame = playerComplexFrameName(player);
  if (!drawPlayerSprite(playerFrame, player.x, player.y, 46, 50, -8) && !drawComplexSprite(playerFrame, player.x, player.y, 35, 43, -7) && !drawAtlasSprite(playerFrameName(player.direction), player.x, player.y, 28, 32, -4)) {
    ctx.fillStyle = player.attackFlash > 0 ? "#67d06e" : "#4aa64a";
    ctx.fillRect(player.x - 11, player.y - 11, 22, 22);
    ctx.fillStyle = "#2d7f2d";
    ctx.fillRect(player.x - 9, player.y - 15, 18, 6);
    ctx.fillStyle = "#f6e8bf";
    ctx.fillRect(player.x - 7, player.y - 7, 14, 10);
    ctx.fillStyle = "#d94e4e";
    ctx.fillRect(player.x - 11, player.y - 15, 6, 8);
    ctx.fillStyle = "#7299d8";
    ctx.fillRect(player.x + 5, player.y - 3, 5, 10);
  }
  ctx.globalAlpha = 1;
  if (hasRelic("echo") && player.echoShieldCooldown <= 0) {
    ctx.strokeStyle = "rgba(187, 163, 255, 0.72)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(player.x, player.y, 19 + Math.sin(Date.now() / 120) * 2, 0, Math.PI * 2);
    ctx.stroke();
  }
  if (gameState.lastAttackVisual) {
    const visual = gameState.lastAttackVisual;
    ctx.fillStyle = visual.color;
    if (visual.weapon === "sword") {
      if (visual.direction === "up") ctx.fillRect(player.x - 3, player.y - 34, 6, 24);
      else if (visual.direction === "down") ctx.fillRect(player.x - 3, player.y + 10, 6, 24);
      else if (visual.direction === "left") ctx.fillRect(player.x - 34, player.y - 3, 24, 6);
      else ctx.fillRect(player.x + 10, player.y - 3, 24, 6);
    } else if (visual.weapon === "lance") {
      if (visual.direction === "up") ctx.fillRect(player.x - 2, player.y - 50, 4, 40);
      else if (visual.direction === "down") ctx.fillRect(player.x - 2, player.y + 10, 4, 40);
      else if (visual.direction === "left") ctx.fillRect(player.x - 50, player.y - 2, 40, 4);
      else ctx.fillRect(player.x + 10, player.y - 2, 40, 4);
    } else {
      ctx.globalAlpha = 0.75;
      ctx.beginPath();
      ctx.arc(visual.x, visual.y, 12, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    }
  }
  ctx.globalAlpha = 1;
}

function drawParticles() {
  for (const particle of particles) {
    ctx.fillStyle = particle.color;
    ctx.globalAlpha = Math.max(0, particle.life / 36);
    ctx.fillRect(particle.x, particle.y, particle.size, particle.size);
  }
  ctx.globalAlpha = 1;
}

function drawMinimap() {
  const scaleX = minimapCanvas.width / (mapWidth * tileSize);
  const scaleY = minimapCanvas.height / (mapHeight * tileSize);
  minimapCtx.clearRect(0, 0, minimapCanvas.width, minimapCanvas.height);
  for (let y = 0; y < mapHeight; y += 1) {
    for (let x = 0; x < mapWidth; x += 1) {
      const tile = gameState.map[y][x];
      const palette = themePalette();
      minimapCtx.fillStyle = wallTiles.has(tile) ? palette.wall : hazardTiles.has(tile) ? "#ff7b63" : slowTiles.has(tile) ? "#4d89a2" : tile === "=" ? "#b78a55" : tile === "R" ? palette.portal : palette.floor;
      minimapCtx.fillRect(x * tileSize * scaleX, y * tileSize * scaleY, tileSize * scaleX, tileSize * scaleY);
    }
  }
  minimapCtx.fillStyle = gameState.door.open ? "#87d96d" : "#804d2d";
  minimapCtx.fillRect(gameState.door.x * tileSize * scaleX, gameState.door.y * tileSize * scaleY, tileSize * scaleX, tileSize * scaleY);
  minimapCtx.fillStyle = "#7be7ff";
  minimapCtx.fillRect(gameState.portal.x * tileSize * scaleX, gameState.portal.y * tileSize * scaleY, tileSize * scaleX, tileSize * scaleY);
  minimapCtx.fillStyle = "#f7d154";
  for (const key of gameState.keys) if (!key.collected) minimapCtx.fillRect((key.x - 4) * scaleX, (key.y - 4) * scaleY, 8 * scaleX, 8 * scaleY);
  minimapCtx.fillStyle = "#8ef0bd";
  for (const altar of gameState.altars) minimapCtx.fillRect((altar.x - 4) * scaleX, (altar.y - 4) * scaleY, 8 * scaleX, 8 * scaleY);
  minimapCtx.fillStyle = "#8ccfff";
  for (const relic of gameState.relics) if (!relic.collected) minimapCtx.fillRect((relic.x - 3) * scaleX, (relic.y - 3) * scaleY, 6 * scaleX, 6 * scaleY);
  minimapCtx.fillStyle = "#ff8a66";
  for (const enemy of gameState.enemies) if (enemy.alive) minimapCtx.fillRect((enemy.x - 4) * scaleX, (enemy.y - 4) * scaleY, 8 * scaleX, 8 * scaleY);
  if (gameState.boss && gameState.boss.alive) {
    minimapCtx.fillStyle = "#ff4fa0";
    minimapCtx.fillRect((gameState.boss.x - 6) * scaleX, (gameState.boss.y - 6) * scaleY, 12 * scaleX, 12 * scaleY);
  }
  minimapCtx.fillStyle = "#ffffff";
  minimapCtx.fillRect((gameState.player.x - 4) * scaleX, (gameState.player.y - 4) * scaleY, 8 * scaleX, 8 * scaleY);
}

function drawOverlay() {
  if (gameState.finishedGame) {
    ctx.fillStyle = "rgba(4,10,9,0.45)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#f7d154";
    ctx.font = "bold 28px Trebuchet MS";
    ctx.textAlign = "center";
    ctx.fillText("Sieg", canvas.width / 2, canvas.height / 2 - 10);
    ctx.fillStyle = "#f6f1da";
    ctx.font = "18px Trebuchet MS";
    ctx.fillText("Der Nachtkoenig ist gefallen", canvas.width / 2, canvas.height / 2 + 22);
  } else if (!gameStarted) {
    ctx.fillStyle = "rgba(4,10,9,0.18)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
}

function drawLighting() {
  const p = gameState.player;
  const lx = p.x - (Number.isFinite(gameState.cameraX) ? gameState.cameraX : 0);
  const ly = p.y - (Number.isFinite(gameState.cameraY) ? gameState.cameraY : 0);
  const radius = 250 + Math.sin(performance.now() * 0.005) * 12;
  const light = ctx.createRadialGradient(lx, ly, 18, lx, ly, radius);
  light.addColorStop(0, "rgba(255, 245, 190, 0.06)");
  light.addColorStop(0.5, "rgba(0, 0, 0, 0)");
  light.addColorStop(1, "rgba(0, 0, 0, 0.24)");
  ctx.save();
  ctx.fillStyle = light;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.restore();
}

function draw() {
  ctx.save();
  if (screenShake > 0) ctx.translate((Math.random() - 0.5) * screenShake, (Math.random() - 0.5) * screenShake);
  ctx.clearRect(-20, -20, canvas.width + 40, canvas.height + 40);
  drawBackgroundAtmosphere();
  drawMap();
  drawKeys();
  drawChests();
  drawAltars();
  drawRelics();
  drawDoorAndPortal();
  drawEnemies();
  drawEnemyProjectiles();
  drawNpcs();
  drawShops();
  drawBoss();
  drawFairy();
  drawPlayer();
  drawParticles();
  drawOverlay();
  ctx.restore();
  drawLighting();
  drawMinimap();
}

function gameLoop() {
  if (gameStarted && !gamePaused && !gameState.finishedGame && !gameState.gameOver) {
    movePlayer();
    updateFairy();
    updateKeys();
    updateChests();
    updateAltarsAndRelics();
    updateInteractions();
    updateEnemies();
    updateEnemyProjectiles();
    updateBoss();
    updateTerrainHazards();
    updatePortal();
    tickTimers();
  } else if (gameState) {
    updateFairy();
  }
  updateParticles();
  draw();
  requestAnimationFrame(gameLoop);
}
function ensureAudio() {
  if (!audioContext) {
    const AudioCtor = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtor) return null;
    audioContext = new AudioCtor();
  }
  if (audioContext.state === "suspended") audioContext.resume();
  return audioContext;
}

function playTone(freq, start, duration, type = "square", volume = 0.025) {
  const context = ensureAudio();
  if (!context) return;
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  oscillator.type = type;
  oscillator.frequency.setValueAtTime(freq, start);
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(volume, start + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  oscillator.connect(gain);
  gain.connect(context.destination);
  oscillator.start(start);
  oscillator.stop(start + duration + 0.02);
}

function playNoise(start, duration, volume = 0.008) {
  const context = ensureAudio();
  if (!context) return;
  const buffer = context.createBuffer(1, Math.floor(context.sampleRate * duration), context.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i += 1) data[i] = (Math.random() * 2 - 1) * 0.35;
  const source = context.createBufferSource();
  const filter = context.createBiquadFilter();
  const gain = context.createGain();
  source.buffer = buffer;
  filter.type = "highpass";
  filter.frequency.value = 800;
  gain.gain.setValueAtTime(volume, start);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  source.connect(filter);
  filter.connect(gain);
  gain.connect(context.destination);
  source.start(start);
  source.stop(start + duration);
}

function playJingle(notes, duration = 0.08, type = "square", volume = 0.03) {
  const context = ensureAudio();
  if (!context) return;
  let start = context.currentTime;
  for (const note of notes) {
    playTone(note, start, duration, type, volume);
    start += duration;
  }
}

function currentMusicTrack() {
  if (!gameState) return musicTracks[0];
  const theme = levels[gameState.levelIndex].theme;
  const isBossPhase = gameState.boss && gameState.boss.alive && gameState.collectedKeys >= gameState.keysRequired;
  const id = isBossPhase ? musicTrackByTheme.boss : musicTrackByTheme[theme];
  return musicTracks.find((track) => track.id === id) || musicTracks[0];
}

function syncMusicToState(forceRestart = false) {
  if (!musicEnabled) {
    updateHud();
    return;
  }
  const track = currentMusicTrack();
  if (forceRestart || activeTrackSrc !== track.src) startMusic(forceRestart);
  else updateHud();
}

function currentMelody() {
  if (!gameState) return { lead: [392, 440, 523.25, 587.33], bass: [196, 220, 261.63, 293.66], pulse: 0.24, leadType: "square", bassType: "triangle" };
  if (gameState.boss && gameState.boss.alive) return { lead: [196, 233.08, 277.18, 349.23, 277.18, 233.08], bass: [98, 116.54, 138.59, 146.83], pulse: 0.2, leadType: "sawtooth", bassType: "triangle" };
  switch (levels[gameState.levelIndex].theme) {
    case "forest": return { lead: [392, 440, 523.25, 440, 392, 329.63], bass: [196, 220, 261.63, 220], pulse: 0.24, leadType: "square", bassType: "triangle" };
    case "crypt": return { lead: [329.63, 392, 466.16, 392, 329.63, 293.66], bass: [164.81, 196, 233.08, 196], pulse: 0.24, leadType: "triangle", bassType: "triangle" };
    case "sky": return { lead: [523.25, 587.33, 659.25, 783.99, 659.25], bass: [261.63, 293.66, 329.63, 391.99], pulse: 0.22, leadType: "square", bassType: "sine" };
    case "lava": return { lead: [220, 261.63, 329.63, 349.23, 329.63, 261.63], bass: [110, 130.81, 164.81, 174.61], pulse: 0.2, leadType: "sawtooth", bassType: "triangle" };
    case "crystal": return { lead: [493.88, 587.33, 659.25, 783.99, 987.77], bass: [246.94, 293.66, 329.63, 392], pulse: 0.22, leadType: "triangle", bassType: "sine" };
    default: return { lead: [349.23, 415.3, 523.25, 698.46, 523.25], bass: [174.61, 207.65, 261.63, 349.23], pulse: 0.21, leadType: "triangle", bassType: "triangle" };
  }
}

function startMusic(forceRestart = false) {
  const track = currentMusicTrack();
  if (!bgmAudio) {
    bgmAudio = new Audio();
    bgmAudio.loop = true;
    bgmAudio.volume = 0.72;
    bgmAudio.muted = false;
    bgmAudio.playsInline = true;
    bgmAudio.preload = "auto";
  }
  if (forceRestart || activeTrackSrc !== track.src) {
    bgmAudio.pause();
    bgmAudio.src = track.src;
    bgmAudio.currentTime = 0;
    activeTrackSrc = track.src;
  }
  bgmAudio.volume = track.volume || 0.72;
  bgmAudio.muted = false;
  bgmAudio.play().then(() => {
    updateHud();
  }).catch(() => {
    musicEnabled = false;
    updateHud();
    setMessage("Musik konnte nicht gestartet werden. Bitte nochmal klicken.");
  });
}

function stopMusic() {
  if (musicIntervalId) {
    window.clearInterval(musicIntervalId);
    musicIntervalId = null;
  }
  if (bgmAudio) bgmAudio.pause();
}

function toggleMusic() {
  musicEnabled = !musicEnabled;
  if (musicEnabled) {
    startMusic();
    playJingle([523.25, 659.25, 783.99], 0.06);
  } else {
    stopMusic();
  }
  updateHud();
}

function requestMobileFullscreen() {
  const target = document.documentElement;
  const request = target.requestFullscreen || target.webkitRequestFullscreen || target.msRequestFullscreen;
  if (request) {
    const result = request.call(target, { navigationUI: "hide" });
    if (result && result.catch) result.catch(() => {});
  }
  if (screen.orientation && screen.orientation.lock) {
    screen.orientation.lock("landscape").catch(() => {});
  }
  setTimeout(syncMobileMode, 140);
  setTimeout(fitGameCanvas, 320);
}

function releaseTouchMovement() {
  input.up = false;
  input.down = false;
  input.left = false;
  input.right = false;
}

function runTouchAction(action) {
  ensureAudio();
  if (action === "attack") performAttack();
  if (action === "dash") dash();
  if (action === "interact") interactNearest();
  if (action === "potion") usePotion();
  if (action === "weapon") cycleWeapon();
}

function bindTouchControls() {
  if (!mobileControlsEl) return;
  for (const button of mobileControlsEl.querySelectorAll("[data-hold]")) {
    const key = button.dataset.hold;
    const start = (event) => {
      event.preventDefault();
      input[key] = true;
      button.setPointerCapture?.(event.pointerId);
    };
    const end = (event) => {
      event.preventDefault();
      input[key] = false;
      button.releasePointerCapture?.(event.pointerId);
    };
    button.addEventListener("pointerdown", start);
    button.addEventListener("pointerup", end);
    button.addEventListener("pointercancel", end);
    button.addEventListener("pointerleave", end);
  }
  for (const button of mobileControlsEl.querySelectorAll("[data-action]")) {
    button.addEventListener("pointerdown", (event) => {
      event.preventDefault();
      runTouchAction(button.dataset.action);
    });
  }
}

window.addEventListener("keydown", (event) => {
  const key = event.key.toLowerCase();
  const isArrow = event.key === "ArrowUp" || event.key === "ArrowDown" || event.key === "ArrowLeft" || event.key === "ArrowRight";
  if (isArrow || event.code === "Space") event.preventDefault();
  if (key === "w" || event.key === "ArrowUp") input.up = true;
  if (key === "s" || event.key === "ArrowDown") input.down = true;
  if (key === "a" || event.key === "ArrowLeft") input.left = true;
  if (key === "d" || event.key === "ArrowRight") input.right = true;
  if (event.code === "Space") performAttack();
  if (event.key === "Shift") { event.preventDefault(); dash(); }
  if (key === "h") usePotion();
  if (key === "e") interactNearest();
  if (key === "q") cycleWeapon();
  if (key === "m") toggleMusic();
  if (key === "p") togglePause();
});

window.addEventListener("keyup", (event) => {
  const key = event.key.toLowerCase();
  const isArrow = event.key === "ArrowUp" || event.key === "ArrowDown" || event.key === "ArrowLeft" || event.key === "ArrowRight";
  if (isArrow) event.preventDefault();
  if (key === "w" || event.key === "ArrowUp") input.up = false;
  if (key === "s" || event.key === "ArrowDown") input.down = false;
  if (key === "a" || event.key === "ArrowLeft") input.left = false;
  if (key === "d" || event.key === "ArrowRight") input.right = false;
});

restartButton.addEventListener("click", resetGame);
startButton.addEventListener("click", startGame);
menuStartButton.addEventListener("click", startGame);
continueButton.addEventListener("click", () => { if (!loadGame()) setMessage("Kein Save gefunden. Starte ein neues Spiel."); });
menuContinueButton.addEventListener("click", () => { if (!loadGame()) setMessage("Kein Save gefunden. Starte ein neues Spiel."); });
clearSaveButton.addEventListener("click", clearSave);
musicButton.addEventListener("click", toggleMusic);
fullscreenButton?.addEventListener("click", requestMobileFullscreen);
mobileMusicButton?.addEventListener("click", () => {
  musicEnabled = true;
  startMusic();
  playJingle([523.25, 659.25, 783.99], 0.06);
  updateHud();
});
mobileControlsEl?.addEventListener("contextmenu", (event) => event.preventDefault());
window.addEventListener("resize", syncMobileMode);
window.addEventListener("orientationchange", syncMobileMode);
window.visualViewport?.addEventListener("resize", syncMobileMode);
window.visualViewport?.addEventListener("scroll", syncMobileMode);
document.addEventListener("fullscreenchange", syncMobileMode);
window.addEventListener("blur", releaseTouchMovement);

syncMobileMode();
bindTouchControls();
initBackgroundSpecks();
resetGame();
gameLoop();

