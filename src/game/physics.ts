import { Obstacle, Vector2D } from '../types/game';
import { ARENA_WIDTH, ARENA_HEIGHT, WALL_THICKNESS } from './arena';

export function distance(x1: number, y1: number, x2: number, y2: number): number {
  const dx = x2 - x1;
  const dy = y2 - y1;
  return Math.hypot(dx, dy);
}

export function normalize(v: Vector2D): Vector2D {
  const mag = Math.hypot(v.x, v.y);
  if (mag === 0) return { x: 0, y: 0 };
  return { x: v.x / mag, y: v.y / mag };
}

export function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

// Resolve circle collision against rectangular obstacles with smooth sliding
export function resolveCircleObstacleCollision(
  circle: { x: number; y: number; radius: number },
  obstacle: Obstacle
): { x: number; y: number; collided: boolean } {
  // Find closest point on rectangle to circle center
  const closestX = clamp(circle.x, obstacle.x, obstacle.x + obstacle.width);
  const closestY = clamp(circle.y, obstacle.y, obstacle.y + obstacle.height);

  const distX = circle.x - closestX;
  const distY = circle.y - closestY;
  const distSquared = distX * distX + distY * distY;

  if (distSquared < circle.radius * circle.radius) {
    const dist = Math.sqrt(distSquared);
    if (dist === 0) {
      // Degenerate case (center is inside rect) - push out towards closest edge
      const leftDist = circle.x - obstacle.x;
      const rightDist = obstacle.x + obstacle.width - circle.x;
      const topDist = circle.y - obstacle.y;
      const bottomDist = obstacle.y + obstacle.height - circle.y;
      const minEdge = Math.min(leftDist, rightDist, topDist, bottomDist);

      if (minEdge === leftDist) return { x: obstacle.x - circle.radius, y: circle.y, collided: true };
      if (minEdge === rightDist) return { x: obstacle.x + obstacle.width + circle.radius, y: circle.y, collided: true };
      if (minEdge === topDist) return { x: circle.x, y: obstacle.y - circle.radius, collided: true };
      return { x: circle.x, y: obstacle.y + obstacle.height + circle.radius, collided: true };
    }

    const overlap = circle.radius - dist;
    return {
      x: circle.x + (distX / dist) * overlap,
      y: circle.y + (distY / dist) * overlap,
      collided: true,
    };
  }

  return { x: circle.x, y: circle.y, collided: false };
}

// Collide against all obstacles in arena
export function resolveCollisionsWithArena(
  entity: { x: number; y: number; radius: number },
  obstacles: Obstacle[]
): { x: number; y: number; collided: boolean } {
  let currX = entity.x;
  let currY = entity.y;
  let anyCollision = false;

  for (const obs of obstacles) {
    const res = resolveCircleObstacleCollision({ x: currX, y: currY, radius: entity.radius }, obs);
    if (res.collided) {
      currX = res.x;
      currY = res.y;
      anyCollision = true;
    }
  }

  // Hard clamp inside arena bounds
  const minX = WALL_THICKNESS + entity.radius;
  const maxX = ARENA_WIDTH - WALL_THICKNESS - entity.radius;
  const minY = WALL_THICKNESS + entity.radius;
  const maxY = ARENA_HEIGHT - WALL_THICKNESS - entity.radius;

  currX = clamp(currX, minX, maxX);
  currY = clamp(currY, minY, maxY);

  return { x: currX, y: currY, collided: anyCollision };
}

// Check circle-to-circle collision (e.g. Player with Pursuer, or Player with Portal)
export function checkCircleCollision(
  c1: { x: number; y: number; radius: number },
  c2: { x: number; y: number; radius: number }
): boolean {
  const d = distance(c1.x, c1.y, c2.x, c2.y);
  return d < c1.radius + c2.radius;
}

// Fast Ray-Box Line-of-Sight intersection
export function hasLineOfSight(p1: Vector2D, p2: Vector2D, obstacles: Obstacle[]): boolean {
  for (const obs of obstacles) {
    if (obs.type === 'wall') continue; // Outer walls don't block internal line of sight
    if (lineIntersectsRect(p1.x, p1.y, p2.x, p2.y, obs.x, obs.y, obs.width, obs.height)) {
      return false;
    }
  }
  return true;
}

function lineIntersectsLine(
  x1: number, y1: number, x2: number, y2: number,
  x3: number, y3: number, x4: number, y4: number
): boolean {
  const denom = (y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1);
  if (denom === 0) return false;

  const ua = ((x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3)) / denom;
  const ub = ((x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3)) / denom;

  return ua >= 0 && ua <= 1 && ub >= 0 && ub <= 1;
}

function lineIntersectsRect(
  x1: number, y1: number, x2: number, y2: number,
  rx: number, ry: number, rw: number, rh: number
): boolean {
  // Check 4 segments of rectangle
  if (lineIntersectsLine(x1, y1, x2, y2, rx, ry, rx + rw, ry)) return true;
  if (lineIntersectsLine(x1, y1, x2, y2, rx + rw, ry, rx + rw, ry + rh)) return true;
  if (lineIntersectsLine(x1, y1, x2, y2, rx + rw, ry + rh, rx, ry + rh)) return true;
  if (lineIntersectsLine(x1, y1, x2, y2, rx, ry + rh, rx, ry)) return true;
  return false;
}
