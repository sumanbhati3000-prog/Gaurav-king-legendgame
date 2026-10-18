import { Enemy, Player, Obstacle, Vector2D, Difficulty } from '../types/game';
import { distance, normalize, resolveCollisionsWithArena } from './physics';
import { KING_START_POS, GUARDS_START_POS, PORTAL_POS, ADDITIONAL_ENEMIES_POS, PALACE_POS } from './arena';

export function initializePursuers(difficulty: Difficulty): Enemy[] {
  let speedMultiplier = 1.0;
  let kingHp = 5;
  let respawnSec = 5.0;
  if (difficulty === 'training') {
    speedMultiplier = 0.65;
    kingHp = 4;
    respawnSec = 7.0;
  } else if (difficulty === 'apprentice') {
    speedMultiplier = 0.88;
    kingHp = 4;
    respawnSec = 6.0;
  } else if (difficulty === 'royal_fury') {
    speedMultiplier = 1.15;
    kingHp = 6;
    respawnSec = 3.8;
  }

  const king: Enemy = {
    id: 'king-gaurav',
    type: 'king',
    name: 'King Gaurav',
    title: 'The Sovereign Tyrant',
    x: KING_START_POS.x,
    y: KING_START_POS.y,
    vx: 0,
    vy: 0,
    radius: 26,
    speed: 200 * speedMultiplier,
    baseSpeed: 200 * speedMultiplier,
    angle: Math.PI,
    color: '#ef4444',
    auraColor: 'rgba(239, 68, 68, 0.45)',
    targetOffsetAngle: 0,
    targetDistanceOffset: 0,
    burstCooldown: 5.0,
    isBursting: false,
    burstDuration: 0,
    hp: kingHp,
    maxHp: kingHp,
    hurtFlashTimer: 0,
    isDead: false,
    respawnTimer: 0,
    maxRespawnTimer: respawnSec,
  };

  const guards: Enemy[] = GUARDS_START_POS.map((g, idx) => {
    return {
      id: `guard-${idx}`,
      type: 'guard',
      name: g.name,
      title: g.title,
      cornerIndex: g.corner,
      x: g.pos.x,
      y: g.pos.y,
      vx: 0,
      vy: 0,
      radius: 20,
      speed: 165 * speedMultiplier,
      baseSpeed: 165 * speedMultiplier,
      angle: 0,
      color: '#f97316',
      auraColor: 'rgba(249, 115, 22, 0.35)',
      targetOffsetAngle: (idx * Math.PI) / 2,
      targetDistanceOffset: 60,
      burstCooldown: 0,
      isBursting: false,
      burstDuration: 0,
      hp: 2,
      maxHp: 2,
      hurtFlashTimer: 0,
      isDead: false,
      respawnTimer: 0,
      maxRespawnTimer: respawnSec,
    };
  });

  // Spawn additional enemies based on difficulty
  let extraCount = 0;
  if (difficulty === 'apprentice') extraCount = 2; // + 2 Scouts
  else if (difficulty === 'standard') extraCount = 4; // + 2 Scouts + 2 Brutes
  else if (difficulty === 'royal_fury') extraCount = 6; // + 2 Scouts + 2 Brutes + 2 Stalkers

  const extras: Enemy[] = ADDITIONAL_ENEMIES_POS.slice(0, extraCount).map((extra, idx) => {
    return {
      id: `extra-${extra.type}-${idx}`,
      type: extra.type,
      name: extra.name,
      title: extra.title,
      x: extra.pos.x,
      y: extra.pos.y,
      vx: 0,
      vy: 0,
      radius: extra.radius,
      speed: (160 + extra.speedOffset) * speedMultiplier,
      baseSpeed: (160 + extra.speedOffset) * speedMultiplier,
      angle: 0,
      color: extra.color,
      auraColor: extra.auraColor,
      targetOffsetAngle: idx * 0.8,
      targetDistanceOffset: 40,
      burstCooldown: 0,
      isBursting: false,
      burstDuration: 0,
      hp: extra.hp,
      maxHp: extra.hp,
      hurtFlashTimer: 0,
      isDead: false,
      respawnTimer: 0,
      maxRespawnTimer: respawnSec,
    };
  });

  return [king, ...guards, ...extras];
}


// Update all pursuers with coordinated pursuit, flanking, obstacle steering, mutual separation, and Palace respawning
export function updatePursuers(
  pursuers: Enemy[],
  player: Player,
  obstacles: Obstacle[],
  dt: number,
  onKingRoar?: () => void,
  onEnemyRespawn?: (enemy: Enemy) => void
): void {
  for (let i = 0; i < pursuers.length; i++) {
    const enemy = pursuers[i];
    if (enemy.isDead) {
      if (enemy.type !== 'king') {
        enemy.respawnTimer -= dt;
        if (enemy.respawnTimer <= 0) {
          enemy.isDead = false;
          enemy.hp = enemy.maxHp;
          enemy.x = PALACE_POS.x + (Math.random() - 0.5) * 90;
          enemy.y = PALACE_POS.y + (Math.random() - 0.5) * 90;
          enemy.hurtFlashTimer = 0;
          enemy.respawnTimer = 0;
          if (onEnemyRespawn) onEnemyRespawn(enemy);
        }
      }
      continue;
    }

    if (enemy.hurtFlashTimer > 0) {
      enemy.hurtFlashTimer -= dt;
    }

    // Special logic for King Gaurav: Royal Rage Burst
    if (enemy.type === 'king') {
      if (enemy.isBursting) {
        enemy.burstDuration -= dt;
        if (enemy.burstDuration <= 0) {
          enemy.isBursting = false;
          enemy.speed = enemy.baseSpeed;
          enemy.burstCooldown = 6.0 + Math.random() * 2.5;
        }
      } else {
        enemy.burstCooldown -= dt;
        if (enemy.burstCooldown <= 0) {
          enemy.isBursting = true;
          enemy.burstDuration = 1.35;
          enemy.speed = enemy.baseSpeed * 1.32;
          if (onKingRoar) onKingRoar();
        }
      }
    }

    // Determine target location for this pursuer
    let targetX = player.x;
    let targetY = player.y;

    if (enemy.type === 'king') {
      // King Gaurav relentlessly zeroes in directly on player coordinates
      targetX = player.x;
      targetY = player.y;
    } else if (enemy.type === 'scout') {
      // Scouts rush aggressively with slight flanking angle
      targetX = player.x + Math.sin(enemy.x * 0.01) * 30;
      targetY = player.y + Math.cos(enemy.y * 0.01) * 30;
    } else if (enemy.type === 'brute') {
      // Brutes position themselves between the player and the exit portal
      targetX = (player.x + PORTAL_POS.x) * 0.5;
      targetY = (player.y + PORTAL_POS.y) * 0.5;
    } else {
      // Four Elite Guards coordinate a pinch/flank maneuver around the player
      // They predict player trajectory and cut off escape angles toward the portal
      const toPortal = normalize({ x: PORTAL_POS.x - player.x, y: PORTAL_POS.y - player.y });

      switch (enemy.cornerIndex) {
        case 0: // Aegis (North-West) - flank top
          targetX = player.x - 70 + player.vx * 0.4;
          targetY = player.y - 120 + player.vy * 0.4;
          break;
        case 1: // Brutus (South-West) - flank bottom
          targetX = player.x - 70 + player.vx * 0.4;
          targetY = player.y + 120 + player.vy * 0.4;
          break;
        case 2: // Valerie (North-East) - cut off top portal approach
          targetX = player.x + toPortal.x * 130;
          targetY = player.y - 80 + toPortal.y * 60;
          break;
        case 3: // Gideon (South-East) - cut off bottom portal approach
          targetX = player.x + toPortal.x * 130;
          targetY = player.y + 80 + toPortal.y * 60;
          break;
        default:
          targetX = player.x;
          targetY = player.y;
      }
    }

    // Direct pursuit vector
    let dir = normalize({ x: targetX - enemy.x, y: targetY - enemy.y });

    // Obstacle avoidance force: sample a feeler ahead
    const feelerDist = enemy.radius * 2.2;
    const feelerX = enemy.x + dir.x * feelerDist;
    const feelerY = enemy.y + dir.y * feelerDist;

    for (const obs of obstacles) {
      if (
        feelerX >= obs.x &&
        feelerX <= obs.x + obs.width &&
        feelerY >= obs.y &&
        feelerY <= obs.y + obs.height
      ) {
        // Tangent deflection: turn perpendicular to slide around
        const tangentX = -dir.y;
        const tangentY = dir.x;
        // Pick the deflection that turns towards the player
        const dot = (player.x - enemy.x) * tangentX + (player.y - enemy.y) * tangentY;
        const sign = dot >= 0 ? 1 : -1;
        dir = normalize({
          x: dir.x * 0.5 + tangentX * 0.9 * sign,
          y: dir.y * 0.5 + tangentY * 0.9 * sign,
        });
        break;
      }
    }

    // Mutual separation force so enemies don't overlap into a single dot
    for (let j = 0; j < pursuers.length; j++) {
      if (i === j) continue;
      const other = pursuers[j];
      if (other.isDead) continue;
      const dist = distance(enemy.x, enemy.y, other.x, other.y);
      const minSpacing = enemy.radius + other.radius + 14;
      if (dist < minSpacing && dist > 0) {
        const pushAway = (minSpacing - dist) / minSpacing;
        const pushX = (enemy.x - other.x) / dist;
        const pushY = (enemy.y - other.y) / dist;
        dir.x += pushX * pushAway * 0.7;
        dir.y += pushY * pushAway * 0.7;
      }
    }

    dir = normalize(dir);

    // Apply movement
    const moveDist = enemy.speed * dt;
    enemy.vx = dir.x * enemy.speed;
    enemy.vy = dir.y * enemy.speed;

    const nextX = enemy.x + dir.x * moveDist;
    const nextY = enemy.y + dir.y * moveDist;

    // Collide with obstacles
    const resolved = resolveCollisionsWithArena({ x: nextX, y: nextY, radius: enemy.radius }, obstacles);
    enemy.x = resolved.x;
    enemy.y = resolved.y;

    // Face direction of movement
    enemy.angle = Math.atan2(dir.y, dir.x);
  }
}
