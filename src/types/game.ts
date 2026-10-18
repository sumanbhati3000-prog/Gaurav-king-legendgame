export type GameStatus = 'TITLE' | 'PLAYING' | 'PAUSED' | 'GAME_OVER' | 'VICTORY';

export type Difficulty = 'training' | 'apprentice' | 'standard' | 'royal_fury';

export interface Vector2D {
  x: number;
  y: number;
}

export interface Entity {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  speed: number;
  angle: number;
}

export interface Player extends Entity {
  name: string; // "Chutiya"
  dashCooldown: number;
  dashDuration: number;
  isDashing: boolean;
  stamina: number;
  maxStamina: number;
  staminaRechargeRate: number;
  stepsCount: number;
  gunCooldown: number;
  gunAmmo: number;
  maxAmmo: number;
  isReloading: boolean;
  reloadTimer: number;
}

export interface Bullet {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  lifetime: number;
  damage: number;
}

export type EnemyType = 'king' | 'guard' | 'scout' | 'brute';

export interface Enemy extends Entity {
  type: EnemyType;
  name: string;
  title: string;
  color: string;
  auraColor: string;
  targetOffsetAngle: number;
  targetDistanceOffset: number;
  burstCooldown: number;
  isBursting: boolean;
  burstDuration: number;
  baseSpeed: number;
  cornerIndex?: number; // 0: Top-Left, 1: Bottom-Left, 2: Top-Right, 3: Bottom-Right
  lastSeenPlayerPos?: Vector2D;
  hp: number;
  maxHp: number;
  hurtFlashTimer: number;
  isDead: boolean;
  respawnTimer: number;
  maxRespawnTimer: number;
}

export interface Obstacle {
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'pillar' | 'wall' | 'throne' | 'fountain';
  color?: string;
}

export interface Torch {
  x: number;
  y: number;
  radius: number;
  flickerOffset: number;
  color: string;
}

export interface Portal {
  x: number;
  y: number;
  radius: number;
  pulseTimer: number;
  angle: number;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  decay: number;
  color: string;
  glow?: boolean;
}

export interface GameStats {
  elapsedTime: number;
  distanceTraveled: number;
  dashesUsed: number;
  closestProximity: number;
  killerName?: string;
  killerTitle?: string;
  score: number;
  rank: 'S' | 'A' | 'B' | 'C';
  enemiesKilled: number;
  totalEnemies: number;
  kingKilled: boolean;
  victoryType?: 'portal_escape' | 'regicide';
}

