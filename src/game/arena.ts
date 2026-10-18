import { Obstacle, Torch, Portal, Vector2D } from '../types/game';

export const ARENA_WIDTH = 1800;
export const ARENA_HEIGHT = 1200;
export const WALL_THICKNESS = 40;

// Player starts at the western gate
export const PLAYER_START_POS: Vector2D = {
  x: 220,
  y: ARENA_HEIGHT / 2,
};

// Exit Portal is positioned on the far eastern sanctum
export const PORTAL_POS: Vector2D = {
  x: ARENA_WIDTH - 200,
  y: ARENA_HEIGHT / 2,
};

// King Gaurav and his royal palace dais center-east
export const KING_START_POS: Vector2D = {
  x: ARENA_WIDTH * 0.65,
  y: ARENA_HEIGHT / 2,
};

// Gaurav's Palace sanctum where all defeated enemies respawn
export const PALACE_POS: Vector2D = {
  x: ARENA_WIDTH * 0.62,
  y: ARENA_HEIGHT / 2,
};

// The Four Elite Guards start at the four corners of the arena
export const GUARDS_START_POS: { pos: Vector2D; name: string; title: string; corner: number }[] = [
  {
    pos: { x: 280, y: 220 },
    name: 'Aegis',
    title: 'North-West Sentinel',
    corner: 0,
  },
  {
    pos: { x: 280, y: ARENA_HEIGHT - 220 },
    name: 'Brutus',
    title: 'South-West Vanguard',
    corner: 1,
  },
  {
    pos: { x: ARENA_WIDTH - 280, y: 220 },
    name: 'Valerie',
    title: 'North-East Inquisitor',
    corner: 2,
  },
  {
    pos: { x: ARENA_WIDTH - 280, y: ARENA_HEIGHT - 220 },
    name: 'Gideon',
    title: 'South-East Enforcer',
    corner: 3,
  },
];

// Additional Royal Enemies (Scouts, Brutes, and Stalkers)
export const ADDITIONAL_ENEMIES_POS: { pos: Vector2D; name: string; title: string; type: 'scout' | 'brute'; hp: number; color: string; auraColor: string; speedOffset: number; radius: number }[] = [
  {
    pos: { x: 920, y: 200 },
    name: 'Zephyr',
    title: 'North Corridor Scout',
    type: 'scout',
    hp: 1,
    color: '#eab308',
    auraColor: 'rgba(234, 179, 8, 0.25)',
    speedOffset: 25,
    radius: 17,
  },
  {
    pos: { x: 920, y: ARENA_HEIGHT - 200 },
    name: 'Orion',
    title: 'South Corridor Scout',
    type: 'scout',
    hp: 1,
    color: '#eab308',
    auraColor: 'rgba(234, 179, 8, 0.25)',
    speedOffset: 25,
    radius: 17,
  },
  {
    pos: { x: 1150, y: ARENA_HEIGHT / 2 - 120 },
    name: 'Vane',
    title: 'Throne Iron Sentinel',
    type: 'brute',
    hp: 2,
    color: '#a855f7',
    auraColor: 'rgba(168, 85, 247, 0.35)',
    speedOffset: -20,
    radius: 23,
  },
  {
    pos: { x: 1150, y: ARENA_HEIGHT / 2 + 120 },
    name: 'Drake',
    title: 'Sanctuary Gate Brute',
    type: 'brute',
    hp: 2,
    color: '#a855f7',
    auraColor: 'rgba(168, 85, 247, 0.35)',
    speedOffset: -20,
    radius: 23,
  },
  {
    pos: { x: 640, y: 350 },
    name: 'Kael',
    title: 'Shadow Stalker',
    type: 'scout',
    hp: 1,
    color: '#ec4899',
    auraColor: 'rgba(236, 72, 153, 0.3)',
    speedOffset: 30,
    radius: 16,
  },
  {
    pos: { x: 640, y: ARENA_HEIGHT - 350 },
    name: 'Moros',
    title: 'Shadow Infiltrator',
    type: 'scout',
    hp: 1,
    color: '#ec4899',
    auraColor: 'rgba(236, 72, 153, 0.3)',
    speedOffset: 30,
    radius: 16,
  },
];

// Castle obstacles: outer boundary walls, grand stone pillars, royal dais, ornamental statues
export function generateArenaObstacles(): Obstacle[] {
  const obs: Obstacle[] = [
    // Outer perimeter walls
    { x: 0, y: 0, width: ARENA_WIDTH, height: WALL_THICKNESS, type: 'wall' }, // Top
    { x: 0, y: ARENA_HEIGHT - WALL_THICKNESS, width: ARENA_WIDTH, height: WALL_THICKNESS, type: 'wall' }, // Bottom
    { x: 0, y: 0, width: WALL_THICKNESS, height: ARENA_HEIGHT, type: 'wall' }, // Left
    { x: ARENA_WIDTH - WALL_THICKNESS, y: 0, width: WALL_THICKNESS, height: ARENA_HEIGHT, type: 'wall' }, // Right

    // Central Royal Throne Dais (grand hall center obstacle)
    { x: ARENA_WIDTH * 0.6 - 70, y: ARENA_HEIGHT / 2 - 90, width: 140, height: 180, type: 'throne' },

    // Stone Pillars in symmetrical tactical formation for cornering and cover
    // Column 1 (West flank)
    { x: 480, y: 300, width: 64, height: 64, type: 'pillar' },
    { x: 480, y: ARENA_HEIGHT - 364, width: 64, height: 64, type: 'pillar' },

    // Central colonnade
    { x: 780, y: 220, width: 70, height: 70, type: 'pillar' },
    { x: 780, y: 500, width: 70, height: 70, type: 'pillar' },
    { x: 780, y: 780, width: 70, height: 70, type: 'pillar' },
    { x: 780, y: 980, width: 70, height: 70, type: 'pillar' },

    // Middle tactical barriers (Ancient Royal Statues)
    { x: 1040, y: 360, width: 70, height: 70, type: 'pillar' },
    { x: 1040, y: ARENA_HEIGHT - 430, width: 70, height: 70, type: 'pillar' },

    // East Sanctuary Columns (guarding the approach to the portal)
    { x: 1320, y: 260, width: 65, height: 65, type: 'pillar' },
    { x: 1320, y: ARENA_HEIGHT - 325, width: 65, height: 65, type: 'pillar' },
    { x: 1440, y: ARENA_HEIGHT / 2 - 160, width: 55, height: 55, type: 'pillar' },
    { x: 1440, y: ARENA_HEIGHT / 2 + 105, width: 55, height: 55, type: 'pillar' },
  ];

  return obs;
}

// Braziers / Torches around the arena casting dynamic flickering light
export function generateTorches(): Torch[] {
  return [
    { x: 120, y: 120, radius: 190, flickerOffset: 0, color: '#f59e0b' },
    { x: 120, y: ARENA_HEIGHT - 120, radius: 190, flickerOffset: 1.2, color: '#f59e0b' },
    { x: 480, y: 120, radius: 170, flickerOffset: 2.1, color: '#f59e0b' },
    { x: 480, y: ARENA_HEIGHT - 120, radius: 170, flickerOffset: 0.8, color: '#f59e0b' },
    { x: 780, y: 120, radius: 180, flickerOffset: 3.4, color: '#f59e0b' },
    { x: 780, y: ARENA_HEIGHT - 120, radius: 180, flickerOffset: 1.9, color: '#f59e0b' },
    { x: 1100, y: 120, radius: 180, flickerOffset: 0.5, color: '#f59e0b' },
    { x: 1100, y: ARENA_HEIGHT - 120, radius: 180, flickerOffset: 2.7, color: '#f59e0b' },
    { x: ARENA_WIDTH - 120, y: 120, radius: 200, flickerOffset: 1.1, color: '#38bdf8' },
    { x: ARENA_WIDTH - 120, y: ARENA_HEIGHT - 120, radius: 200, flickerOffset: 2.4, color: '#38bdf8' },
    // Near throne
    { x: ARENA_WIDTH * 0.6 - 110, y: ARENA_HEIGHT / 2, radius: 190, flickerOffset: 0.3, color: '#ef4444' },
    { x: ARENA_WIDTH * 0.6 + 110, y: ARENA_HEIGHT / 2, radius: 190, flickerOffset: 1.7, color: '#ef4444' },
  ];
}

export function createExitPortal(): Portal {
  return {
    x: PORTAL_POS.x,
    y: PORTAL_POS.y,
    radius: 46,
    pulseTimer: 0,
    angle: 0,
  };
}
