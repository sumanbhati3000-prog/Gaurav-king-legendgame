import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import {
  GameStatus,
  Difficulty,
  Player,
  Enemy,
  Obstacle,
  Torch,
  Portal,
  GameStats,
  Bullet,
} from '../types/game';
import {
  ARENA_WIDTH,
  ARENA_HEIGHT,
  PLAYER_START_POS,
  PALACE_POS,
  generateArenaObstacles,
  generateTorches,
  createExitPortal,
} from '../game/arena';
import {
  distance,
  normalize,
  resolveCollisionsWithArena,
  checkCircleCollision,
} from '../game/physics';
import { initializePursuers, updatePursuers } from '../game/ai';
import { soundManager } from '../audio/soundManager';
import {
  setupThreeScene,
  toWorldX,
  toWorldZ,
  ThreeSceneContext,
  spawnParticles3D,
  updateParticles3D,
  WORLD_SCALE,
} from '../game/threeScene';
import {
  Volume2,
  VolumeX,
  Pause,
  Compass,
  Zap,
  ShieldAlert,
  Crown,
  Crosshair,
  RotateCcw,
} from 'lucide-react';

interface GameCanvas3DProps {
  difficulty: Difficulty;
  status: GameStatus;
  onGameOver: (stats: GameStats) => void;
  onVictory: (stats: GameStats) => void;
  onPause: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  virtualInput?: { x: number; y: number; dash: boolean };
  onMobileAttackRef?: React.MutableRefObject<(() => void) | null>;
}

export const GameCanvas3D: React.FC<GameCanvas3DProps> = ({
  difficulty,
  status,
  onGameOver,
  onVictory,
  onPause,
  isMuted,
  onToggleMute,
  virtualInput,
  onMobileAttackRef,
}) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const threeCtxRef = useRef<ThreeSceneContext | null>(null);

  // Gameplay state held in refs for 60fps loop with zero React re-render overhead
  const playerRef = useRef<Player>({
    id: 'player',
    name: 'Chutiya',
    x: PLAYER_START_POS.x,
    y: PLAYER_START_POS.y,
    vx: 0,
    vy: 0,
    radius: 17,
    speed: 235,
    angle: 0,
    dashCooldown: 0,
    dashDuration: 0,
    isDashing: false,
    stamina: 100,
    maxStamina: 100,
    staminaRechargeRate: 35,
    stepsCount: 0,
    gunCooldown: 0,
    gunAmmo: 12,
    maxAmmo: 12,
    isReloading: false,
    reloadTimer: 0,
  });

  const bulletsRef = useRef<Bullet[]>([]);
  const enemiesRef = useRef<Enemy[]>([]);
  const obstaclesRef = useRef<Obstacle[]>([]);
  const torchesRef = useRef<Torch[]>([]);
  const portalRef = useRef<Portal>(createExitPortal());

  // Input states & Aim coordinates
  const keysHeld = useRef<{ [key: string]: boolean }>({});
  const mouseArenaPos = useRef<{ x: number; y: number }>({ x: PLAYER_START_POS.x + 100, y: PLAYER_START_POS.y });
  const muzzleFlashTimerRef = useRef<number>(0);
  const gunRecoilRef = useRef<number>(0);

  // Camera Shake & Alert Banners
  const screenShakeRef = useRef<number>(0);
  const kingRoarBannerRef = useRef<{ text: string; timer: number } | null>(null);
  const palaceAlertBannerRef = useRef<{ text: string; timer: number } | null>(null);

  // Metrics
  const startTimeRef = useRef<number>(0);
  const distanceTraveledRef = useRef<number>(0);
  const dashesUsedRef = useRef<number>(0);
  const closestProximityRef = useRef<number>(9999);
  const enemiesKilledRef = useRef<number>(0);
  const totalEnemiesRef = useRef<number>(0);

  // HUD React state (throttled updates)
  const [hudData, setHudData] = useState({
    stamina: 100,
    ammo: 12,
    maxAmmo: 12,
    isReloading: false,
    reloadProgress: 0,
    portalDist: 1000,
    portalAngle: 0,
    closestEnemyDist: 1000,
    elapsedSec: 0,
    kingHp: 5,
    kingMaxHp: 5,
    kingBursting: false,
    kingDead: false,
    enemiesKilled: 0,
    totalEnemies: 0,
  });

  // Stable refs for callbacks and inputs to prevent loop recreation and hanging
  const onGameOverRef = useRef(onGameOver);
  const onVictoryRef = useRef(onVictory);
  const virtualInputRef = useRef(virtualInput);
  const matchEndedRef = useRef(false);

  useEffect(() => {
    onGameOverRef.current = onGameOver;
  }, [onGameOver]);

  useEffect(() => {
    onVictoryRef.current = onVictory;
  }, [onVictory]);

  useEffect(() => {
    virtualInputRef.current = virtualInput;
  }, [virtualInput]);

  // Execute Gun Reload
  const triggerReload = useCallback(() => {
    const player = playerRef.current;
    if (player.isReloading || player.gunAmmo === player.maxAmmo) return;
    player.isReloading = true;
    player.reloadTimer = 1.15;
    soundManager.playGunReload();
  }, []);

  // Execute Gun Fire attack
  const triggerGunFire = useCallback(() => {
    if (matchEndedRef.current) return;
    const player = playerRef.current;

    if (player.isReloading) return;

    if (player.gunAmmo <= 0) {
      triggerReload();
      return;
    }

    if (player.gunCooldown > 0) return;

    player.gunCooldown = 0.16;
    player.gunAmmo -= 1;
    soundManager.playGunShot();
    screenShakeRef.current = Math.max(screenShakeRef.current, 2.5);
    muzzleFlashTimerRef.current = 0.07;
    gunRecoilRef.current = 0.25;

    // Determine shot aim angle: towards mouse on arena floor if available, else player facing angle
    let aimAngle = player.angle;
    const dx = mouseArenaPos.current.x - player.x;
    const dy = mouseArenaPos.current.y - player.y;
    if (Math.hypot(dx, dy) > 20) {
      aimAngle = Math.atan2(dy, dx);
      player.angle = aimAngle;
    }

    const bulletSpeed = 780;
    const spawnDist = 24;
    const bx = player.x + Math.cos(aimAngle) * spawnDist;
    const by = player.y + Math.sin(aimAngle) * spawnDist;

    bulletsRef.current.push({
      id: `b_${Date.now()}_${Math.random()}`,
      x: bx,
      y: by,
      vx: Math.cos(aimAngle) * bulletSpeed,
      vy: Math.sin(aimAngle) * bulletSpeed,
      radius: 6,
      lifetime: 1.6,
      damage: 1,
    });

    const threeCtx = threeCtxRef.current;
    if (threeCtx) {
      spawnParticles3D(
        threeCtx.particles,
        { x: toWorldX(bx), y: 1.4, z: toWorldZ(by) },
        6,
        new THREE.Color(0xfef08a),
        7,
        0.3
      );
    }

    // Auto reload if empty
    if (player.gunAmmo <= 0) {
      triggerReload();
    }
  }, [triggerReload]);

  // Connect mobile attack ref to Gun Fire
  useEffect(() => {
    if (onMobileAttackRef) {
      onMobileAttackRef.current = triggerGunFire;
    }
  }, [onMobileAttackRef, triggerGunFire]);

  // Reset or initialize match
  const initGame = useCallback(() => {
    matchEndedRef.current = false;
    playerRef.current = {
      id: 'player',
      name: 'Chutiya',
      x: PLAYER_START_POS.x,
      y: PLAYER_START_POS.y,
      vx: 0,
      vy: 0,
      radius: 17,
      speed: 235,
      angle: 0,
      dashCooldown: 0,
      dashDuration: 0,
      isDashing: false,
      stamina: 100,
      maxStamina: 100,
      staminaRechargeRate: 35,
      stepsCount: 0,
      gunCooldown: 0,
      gunAmmo: 12,
      maxAmmo: 12,
      isReloading: false,
      reloadTimer: 0,
    };

    bulletsRef.current = [];
    enemiesRef.current = initializePursuers(difficulty);
    obstaclesRef.current = generateArenaObstacles();
    torchesRef.current = generateTorches();
    portalRef.current = createExitPortal();

    totalEnemiesRef.current = enemiesRef.current.length;
    enemiesKilledRef.current = 0;
    screenShakeRef.current = 0;
    kingRoarBannerRef.current = null;
    palaceAlertBannerRef.current = null;
    startTimeRef.current = performance.now();
    distanceTraveledRef.current = 0;
    dashesUsedRef.current = 0;
    closestProximityRef.current = 9999;
  }, [difficulty]);

  useEffect(() => {
    initGame();
  }, [initGame]);

  // Mount Three.js Scene
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }

    const enemies = enemiesRef.current;
    const obstacles = obstaclesRef.current;
    const torches = torchesRef.current;
    const portal = portalRef.current;

    const ctx3D = setupThreeScene(container, obstacles, torches, portal, enemies);
    threeCtxRef.current = ctx3D;

    const handleResize = () => {
      if (!ctx3D.renderer || !ctx3D.camera) return;
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || window.innerHeight;
      ctx3D.camera.aspect = w / h;
      ctx3D.camera.updateProjectionMatrix();
      ctx3D.renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      ctx3D.renderer.dispose();
      while (container.firstChild) {
        container.removeChild(container.firstChild);
      }
      threeCtxRef.current = null;
    };
  }, []);

  // Keyboard & Mouse Listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysHeld.current[e.key.toLowerCase()] = true;

      // Dash on Shift
      if (e.key === 'Shift' && status === 'PLAYING') {
        const player = playerRef.current;
        if (!player.isDashing && player.dashCooldown <= 0 && player.stamina >= 30) {
          player.isDashing = true;
          player.dashDuration = 0.22;
          player.dashCooldown = 0.9;
          player.stamina -= 32;
          dashesUsedRef.current++;
          screenShakeRef.current = 4.0;
          soundManager.playDash();

          const threeCtx = threeCtxRef.current;
          if (threeCtx) {
            spawnParticles3D(
              threeCtx.particles,
              { x: toWorldX(player.x), y: 1.2, z: toWorldZ(player.y) },
              18,
              new THREE.Color(0x38bdf8),
              10
            );
          }
        }
      }

      // Shoot Gun on Space, F, E, or J
      if ((e.code === 'Space' || e.key.toLowerCase() === 'f' || e.key.toLowerCase() === 'e' || e.key.toLowerCase() === 'j') && status === 'PLAYING') {
        triggerGunFire();
      }

      // Manual Reload on R key during gameplay
      if (e.key.toLowerCase() === 'r' && status === 'PLAYING') {
        triggerReload();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysHeld.current[e.key.toLowerCase()] = false;
    };

    const handleMouseDown = (e: MouseEvent) => {
      if (status === 'PLAYING' && e.button === 0) {
        triggerGunFire();
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      const threeCtx = threeCtxRef.current;
      if (!threeCtx) return;

      const ndcX = (e.clientX / window.innerWidth) * 2 - 1;
      const ndcY = -(e.clientY / window.innerHeight) * 2 + 1;

      // Raycast to Ground Plane y=0
      const ray = new THREE.Raycaster();
      ray.setFromCamera(new THREE.Vector2(ndcX, ndcY), threeCtx.camera);
      const groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
      const hitPoint = new THREE.Vector3();

      if (ray.ray.intersectPlane(groundPlane, hitPoint)) {
        // Convert 3D world to Arena Coordinates
        mouseArenaPos.current.x = hitPoint.x / WORLD_SCALE + ARENA_WIDTH / 2;
        mouseArenaPos.current.y = hitPoint.z / WORLD_SCALE + ARENA_HEIGHT / 2;
      }
    };

    const handleBlur = () => {
      keysHeld.current = {};
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('blur', handleBlur);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('blur', handleBlur);
    };
  }, [status, triggerGunFire, triggerReload]);

  // Main 60fps 3D Simulation Loop (Clean, decoupled, zero-hanging)
  useEffect(() => {
    if (status !== 'PLAYING') return;

    let animId: number;
    let lastTime = performance.now();
    let hudThrottleTime = 0;

    const loop = (currentTime: number) => {
      const rawDt = (currentTime - lastTime) / 1000;
      lastTime = currentTime;
      const dt = Math.min(rawDt, 0.05);

      const threeCtx = threeCtxRef.current;
      if (!threeCtx) {
        animId = requestAnimationFrame(loop);
        return;
      }

      const player = playerRef.current;
      const enemies = enemiesRef.current;
      const obstacles = obstaclesRef.current;
      const portal = portalRef.current;
      const bullets = bulletsRef.current;

      // 1. Process Movement Input
      let moveX = 0;
      let moveY = 0;

      if (keysHeld.current['w'] || keysHeld.current['arrowup']) moveY -= 1;
      if (keysHeld.current['s'] || keysHeld.current['arrowdown']) moveY += 1;
      if (keysHeld.current['a'] || keysHeld.current['arrowleft']) moveX -= 1;
      if (keysHeld.current['d'] || keysHeld.current['arrowright']) moveX += 1;

      const vInput = virtualInputRef.current;
      if (vInput) {
        if (Math.hypot(vInput.x, vInput.y) > 0.15) {
          moveX = vInput.x;
          moveY = vInput.y;
        }
        if (vInput.dash && !player.isDashing && player.dashCooldown <= 0 && player.stamina >= 30) {
          player.isDashing = true;
          player.dashDuration = 0.22;
          player.dashCooldown = 0.9;
          player.stamina -= 32;
          dashesUsedRef.current++;
          screenShakeRef.current = 4.0;
          soundManager.playDash();
        }
      }

      const inputDir = normalize({ x: moveX, y: moveY });

      // Dash timers
      if (player.dashCooldown > 0) player.dashCooldown -= dt;
      if (player.isDashing) {
        player.dashDuration -= dt;
        if (player.dashDuration <= 0) player.isDashing = false;
      } else {
        player.stamina = Math.min(player.maxStamina, player.stamina + player.staminaRechargeRate * dt);
      }

      // Gun Timers & Reloading
      if (player.gunCooldown > 0) player.gunCooldown -= dt;
      if (player.isReloading) {
        player.reloadTimer -= dt;
        if (player.reloadTimer <= 0) {
          player.isReloading = false;
          player.gunAmmo = player.maxAmmo;
        }
      }

      // Muzzle Flash animation
      if (muzzleFlashTimerRef.current > 0) {
        muzzleFlashTimerRef.current -= dt;
        (threeCtx.muzzleFlashMesh.material as THREE.MeshBasicMaterial).opacity = 0.9;
        threeCtx.muzzleFlashMesh.scale.set(1.4, 1.4, 1.4);
      } else {
        (threeCtx.muzzleFlashMesh.material as THREE.MeshBasicMaterial).opacity = 0;
        threeCtx.muzzleFlashMesh.scale.set(1, 1, 1);
      }

      // Gun recoil return
      if (gunRecoilRef.current > 0) {
        gunRecoilRef.current -= dt * 2.5;
        threeCtx.gunGroup.position.z = 0.85 - Math.max(0, gunRecoilRef.current) * 0.35;
      } else {
        threeCtx.gunGroup.position.z = 0.85;
      }

      // Player Movement physics
      const currentSpeed = player.isDashing ? player.speed * 2.1 : player.speed;
      const moveDistance = currentSpeed * dt;

      if (inputDir.x !== 0 || inputDir.y !== 0) {
        player.vx = inputDir.x * currentSpeed;
        player.vy = inputDir.y * currentSpeed;

        const nextX = player.x + inputDir.x * moveDistance;
        const nextY = player.y + inputDir.y * moveDistance;

        const resolved = resolveCollisionsWithArena({ x: nextX, y: nextY, radius: player.radius }, obstacles);
        const actualMove = Math.hypot(resolved.x - player.x, resolved.y - player.y);
        distanceTraveledRef.current += actualMove;

        player.x = resolved.x;
        player.y = resolved.y;

        player.stepsCount += actualMove;
        if (player.stepsCount > 38) {
          player.stepsCount = 0;
          soundManager.playFootstep();
          spawnParticles3D(
            threeCtx.particles,
            { x: toWorldX(player.x), y: 0.1, z: toWorldZ(player.y) },
            4,
            new THREE.Color(0xfca5a5),
            3
          );
        }
      } else {
        player.vx = 0;
        player.vy = 0;
      }

      // Smoothly orient player facing towards mouse cursor or movement direction
      const dxMouse = mouseArenaPos.current.x - player.x;
      const dyMouse = mouseArenaPos.current.y - player.y;
      if (Math.hypot(dxMouse, dyMouse) > 30) {
        player.angle = Math.atan2(dyMouse, dxMouse);
      } else if (inputDir.x !== 0 || inputDir.y !== 0) {
        player.angle = Math.atan2(inputDir.y, inputDir.x);
      }

      // Update Player 3D Mesh
      const playerWorldX = toWorldX(player.x);
      const playerWorldZ = toWorldZ(player.y);
      threeCtx.playerGroup.position.set(playerWorldX, 0, playerWorldZ);
      threeCtx.playerGroup.rotation.y = -player.angle + Math.PI / 2;

      // Cape billow
      threeCtx.capeMesh.rotation.x = 0.15 + (player.vx !== 0 || player.vy !== 0 ? 0.35 : 0);

      // 2. Update Bullets: Movement & Collision with obstacles / enemies
      for (let i = bullets.length - 1; i >= 0; i--) {
        const b = bullets[i];
        b.x += b.vx * dt;
        b.y += b.vy * dt;
        b.lifetime -= dt;

        let bulletDestroyed = false;

        // Check Wall / Obstacle Collision
        for (const obs of obstacles) {
          if (
            b.x >= obs.x &&
            b.x <= obs.x + obs.width &&
            b.y >= obs.y &&
            b.y <= obs.y + obs.height
          ) {
            bulletDestroyed = true;
            spawnParticles3D(
              threeCtx.particles,
              { x: toWorldX(b.x), y: 1.4, z: toWorldZ(b.y) },
              8,
              new THREE.Color(0xfef08a),
              8,
              0.35
            );
            break;
          }
        }

        // Check Enemy Collision
        if (!bulletDestroyed) {
          for (const enemy of enemies) {
            if (enemy.isDead) continue;

            const d = distance(b.x, b.y, enemy.x, enemy.y);
            if (d <= b.radius + enemy.radius) {
              bulletDestroyed = true;
              enemy.hp -= b.damage;
              enemy.hurtFlashTimer = 0.22;
              screenShakeRef.current = Math.max(screenShakeRef.current, 5.0);

              // Knockback enemy
              const knock = normalize({ x: b.vx, y: b.vy });
              enemy.x += knock.x * 35;
              enemy.y += knock.y * 35;

              soundManager.playGunHit();

              const eWorldX = toWorldX(enemy.x);
              const eWorldZ = toWorldZ(enemy.y);
              spawnParticles3D(
                threeCtx.particles,
                { x: eWorldX, y: 1.8, z: eWorldZ },
                18,
                new THREE.Color(0xfbbf24),
                12,
                0.5
              );

              // Enemy Death Check
              if (enemy.hp <= 0) {
                enemy.isDead = true;
                enemiesKilledRef.current++;

                if (enemy.type === 'king') {
                  // Slaying King Gaurav triggers Regicide Victory!
                  soundManager.playKingDefeated();
                  screenShakeRef.current = 16.0;

                  spawnParticles3D(
                    threeCtx.particles,
                    { x: eWorldX, y: 2.5, z: eWorldZ },
                    90,
                    new THREE.Color(0xdc2626),
                    18,
                    1.8
                  );

                  kingRoarBannerRef.current = {
                    text: 'CHUTIYA HAS SLAIN KING GAURAV! THE TYRANT IS DEAD!',
                    timer: 3.5,
                  };

                  matchEndedRef.current = true;
                  setTimeout(() => {
                    const elapsedSec = (performance.now() - startTimeRef.current) / 1000;
                    onVictoryRef.current({
                      elapsedTime: elapsedSec,
                      distanceTraveled: Math.round(distanceTraveledRef.current),
                      dashesUsed: dashesUsedRef.current,
                      closestProximity: Math.round(closestProximityRef.current),
                      score: 28000 + Math.round(6000 / (elapsedSec + 1)),
                      rank: 'S',
                      enemiesKilled: enemiesKilledRef.current,
                      totalEnemies: totalEnemiesRef.current,
                      kingKilled: true,
                      victoryType: 'regicide',
                    });
                  }, 1200);
                } else {
                  // Guards / Scouts / Brutes die and will RESPAWN in Gaurav's Palace!
                  soundManager.playEnemyDeath();
                  enemy.respawnTimer = enemy.maxRespawnTimer;

                  spawnParticles3D(
                    threeCtx.particles,
                    { x: eWorldX, y: 1.5, z: eWorldZ },
                    30,
                    new THREE.Color(0xf97316),
                    12,
                    0.8
                  );

                  palaceAlertBannerRef.current = {
                    text: `${enemy.name.toUpperCase()} DOWN! RESPAWNING IN GAURAV'S PALACE...`,
                    timer: 2.2,
                  };
                }
              }

              break;
            }
          }
        }

        if (bulletDestroyed || b.lifetime <= 0) {
          bullets.splice(i, 1);
        }
      }

      // Sync 3D Bullet meshes with zero memory allocation
      const pool = threeCtx.bulletPool;
      for (let i = 0; i < pool.length; i++) {
        if (i < bullets.length) {
          const b = bullets[i];
          pool[i].visible = true;
          pool[i].position.set(toWorldX(b.x), 1.4, toWorldZ(b.y));
        } else {
          pool[i].visible = false;
        }
      }

      // 3. Update Pursuers AI & Gaurav's Palace Respawns
      updatePursuers(
        enemies,
        player,
        obstacles,
        dt,
        () => {
          screenShakeRef.current = 7.0;
          soundManager.playKingRoar();
          kingRoarBannerRef.current = {
            text: 'KING GAURAV: "CHUTIYA, YOU SHALL NOT ESCAPE!"',
            timer: 2.2,
          };
        },
        (respawnedEnemy) => {
          // Palace respawn effect
          soundManager.playPalaceRespawn();
          palaceAlertBannerRef.current = {
            text: `PALACE ALARM: ${respawnedEnemy.name.toUpperCase()} RE-EMERGED FROM GAURAV'S PALACE!`,
            timer: 2.5,
          };

          const pWorldX = toWorldX(respawnedEnemy.x);
          const pWorldZ = toWorldZ(respawnedEnemy.y);
          spawnParticles3D(
            threeCtx.particles,
            { x: pWorldX, y: 1.8, z: pWorldZ },
            40,
            new THREE.Color(0xdc2626),
            14,
            1.2
          );
        }
      );

      // Alert banner timers
      if (kingRoarBannerRef.current) {
        kingRoarBannerRef.current.timer -= dt;
        if (kingRoarBannerRef.current.timer <= 0) kingRoarBannerRef.current = null;
      }
      if (palaceAlertBannerRef.current) {
        palaceAlertBannerRef.current.timer -= dt;
        if (palaceAlertBannerRef.current.timer <= 0) palaceAlertBannerRef.current = null;
      }

      // 4. Update 3D Enemy Meshes & Efficient Flash Transitions
      for (const enemy of enemies) {
        const meshData = threeCtx.enemyMeshes.get(enemy.id);
        if (!meshData) continue;

        if (enemy.isDead) {
          meshData.group.visible = false;
          continue;
        }

        meshData.group.visible = true;
        const eWorldX = toWorldX(enemy.x);
        const eWorldZ = toWorldZ(enemy.y);
        meshData.group.position.set(eWorldX, 0, eWorldZ);
        meshData.group.rotation.y = -enemy.angle + Math.PI / 2;

        // Flash material swap ONLY on state change (prevents WebGL GPU stalls & hanging!)
        const isHurtNow = enemy.hurtFlashTimer > 0;
        if (isHurtNow !== meshData.isFlashing) {
          meshData.isFlashing = isHurtNow;
          let matIdx = 0;
          meshData.group.traverse((child) => {
            if ((child as THREE.Mesh).isMesh) {
              if (isHurtNow) {
                (child as THREE.Mesh).material = threeCtx.materials.hurtFlashMat;
              } else if (meshData.originalMats[matIdx]) {
                (child as THREE.Mesh).material = meshData.originalMats[matIdx];
                matIdx++;
              }
            }
          });
        }

        // King Gaurav Aura light pulse
        if (enemy.type === 'king' && meshData.auraLight) {
          meshData.auraLight.intensity = enemy.isBursting ? 4.5 : 2.2 + Math.sin(currentTime * 0.008) * 0.6;
        }
      }

      // Exit Portal Swirling Animation
      portal.pulseTimer += dt * 3.5;
      portal.angle += dt * 1.8;
      threeCtx.portalMesh.ring1.rotation.z = portal.angle;
      threeCtx.portalMesh.ring2.rotation.z = -portal.angle * 1.4;
      threeCtx.portalMesh.light.intensity = 3.5 + Math.sin(portal.pulseTimer) * 1.2;

      // 5. Collision & Distance Checks
      let closestDist = 9999;
      let caughtEnemy: Enemy | null = null;

      for (const enemy of enemies) {
        if (enemy.isDead) continue;
        const d = distance(player.x, player.y, enemy.x, enemy.y);
        if (d < closestDist) closestDist = d;

        // 1-touch capture rule against living enemies
        if (checkCircleCollision(player, enemy)) {
          caughtEnemy = enemy;
          break;
        }
      }

      if (closestDist < closestProximityRef.current) {
        closestProximityRef.current = closestDist;
      }

      // Proximity heartbeat
      const heartbeatFactor = Math.max(0, 1 - closestDist / 500);
      soundManager.playHeartbeat(heartbeatFactor);

      // Check Exit Portal Victory
      const distToPortal = distance(player.x, player.y, portal.x, portal.y);
      if (distToPortal < player.radius + portal.radius * 0.75 && !matchEndedRef.current) {
        matchEndedRef.current = true;
        soundManager.playVictory();
        const elapsedSec = (currentTime - startTimeRef.current) / 1000;
        let rank: 'S' | 'A' | 'B' | 'C' = 'C';
        if (elapsedSec < 15) rank = 'S';
        else if (elapsedSec < 24) rank = 'A';
        else if (elapsedSec < 38) rank = 'B';

        const finalScore = Math.max(
          100,
          Math.round(20000 / (elapsedSec + 1) + (1000 - closestProximityRef.current) * 2 + enemiesKilledRef.current * 1500)
        );

        const king = enemies.find((e) => e.type === 'king');
        onVictoryRef.current({
          elapsedTime: elapsedSec,
          distanceTraveled: Math.round(distanceTraveledRef.current),
          dashesUsed: dashesUsedRef.current,
          closestProximity: Math.round(closestProximityRef.current),
          score: finalScore,
          rank,
          enemiesKilled: enemiesKilledRef.current,
          totalEnemies: totalEnemiesRef.current,
          kingKilled: king?.isDead || false,
          victoryType: 'portal_escape',
        });
        return;
      }

      // Check Capture Defeat
      if (caughtEnemy && !matchEndedRef.current) {
        matchEndedRef.current = true;
        soundManager.playCapture();
        screenShakeRef.current = 14;
        const elapsedSec = (currentTime - startTimeRef.current) / 1000;
        const king = enemies.find((e) => e.type === 'king');

        onGameOverRef.current({
          elapsedTime: elapsedSec,
          distanceTraveled: Math.round(distanceTraveledRef.current),
          dashesUsed: dashesUsedRef.current,
          closestProximity: Math.round(closestProximityRef.current),
          killerName: caughtEnemy.name,
          killerTitle: caughtEnemy.title,
          score: Math.round(distanceTraveledRef.current * 1.5 + elapsedSec * 10 + enemiesKilledRef.current * 500),
          rank: 'C',
          enemiesKilled: enemiesKilledRef.current,
          totalEnemies: totalEnemiesRef.current,
          kingKilled: king?.isDead || false,
        });
        return;
      }

      // 6. Update GPU Particles
      updateParticles3D(threeCtx.particles, dt);

      // 7. Camera Tracking Player with Isometric Action Offset
      let targetCamX = playerWorldX;
      let targetCamY = 32;
      let targetCamZ = playerWorldZ + 24;

      // Screen Shake
      if (screenShakeRef.current > 0.05) {
        targetCamX += (Math.random() - 0.5) * screenShakeRef.current * 0.2;
        targetCamY += (Math.random() - 0.5) * screenShakeRef.current * 0.2;
        screenShakeRef.current *= 0.88;
      }

      threeCtx.camera.position.x += (targetCamX - threeCtx.camera.position.x) * 0.12;
      threeCtx.camera.position.y += (targetCamY - threeCtx.camera.position.y) * 0.12;
      threeCtx.camera.position.z += (targetCamZ - threeCtx.camera.position.z) * 0.12;
      threeCtx.camera.lookAt(playerWorldX, 1.5, playerWorldZ);

      // 8. Render 3D Scene
      threeCtx.renderer.render(threeCtx.scene, threeCtx.camera);

      // 9. Throttled HUD update
      hudThrottleTime += dt;
      if (hudThrottleTime > 0.08) {
        hudThrottleTime = 0;
        const pAngle = Math.atan2(portal.y - player.y, portal.x - player.x);
        const king = enemies.find((e) => e.type === 'king');
        setHudData({
          stamina: Math.round(player.stamina),
          ammo: player.gunAmmo,
          maxAmmo: player.maxAmmo,
          isReloading: player.isReloading,
          reloadProgress: player.isReloading ? Math.round((1 - player.reloadTimer / 1.15) * 100) : 100,
          portalDist: Math.round(distToPortal),
          portalAngle: pAngle,
          closestEnemyDist: Math.round(closestDist),
          elapsedSec: Math.floor((currentTime - startTimeRef.current) / 1000),
          kingHp: king?.hp || 0,
          kingMaxHp: king?.maxHp || 5,
          kingBursting: king?.isBursting || false,
          kingDead: king?.isDead || false,
          enemiesKilled: enemiesKilledRef.current,
          totalEnemies: totalEnemiesRef.current,
        });
      }

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [status]);

  return (
    <div className="relative w-full h-full overflow-hidden select-none bg-stone-950">
      {/* 3D WebGL Canvas Container */}
      <div ref={mountRef} className="w-full h-full cursor-crosshair" />

      {/* KING GAURAV ROAR ALERT BANNER */}
      {kingRoarBannerRef.current && (
        <div className="pointer-events-none absolute top-20 left-1/2 -translate-x-1/2 px-6 py-2 bg-red-950/90 border border-red-600/70 rounded-md text-red-200 font-bold tracking-widest text-sm shadow-2xl animate-pulse z-40">
          {kingRoarBannerRef.current.text}
        </div>
      )}

      {/* PALACE REINFORCEMENTS BANNER */}
      {palaceAlertBannerRef.current && (
        <div className="pointer-events-none absolute top-32 left-1/2 -translate-x-1/2 px-5 py-1.5 bg-amber-950/90 border border-amber-500/70 rounded-md text-amber-200 font-bold tracking-widest text-xs shadow-2xl animate-bounce z-40">
          {palaceAlertBannerRef.current.text}
        </div>
      )}

      {/* KING GAURAV BOSS HEALTH BAR (TOP SCREEN) */}
      <div className="pointer-events-none absolute top-4 left-1/2 -translate-x-1/2 z-40 flex flex-col items-center">
        <div className="flex items-center gap-2 px-4 py-1.5 rounded-t-lg bg-stone-900/90 border-t border-x border-red-900/80 shadow-2xl">
          <Crown className="w-4 h-4 text-amber-400" />
          <span className="text-xs font-black tracking-widest text-red-400 uppercase">King Gaurav</span>
          <span className="text-[10px] font-mono text-stone-400">
            {hudData.kingDead ? 'SLAIN' : `${hudData.kingHp} / ${hudData.kingMaxHp} HP`}
          </span>
        </div>
        {/* Boss HP Gauge */}
        <div className="w-64 sm:w-80 h-3 bg-stone-950 rounded-b-lg border border-red-900/80 overflow-hidden p-0.5">
          <div
            className={`h-full transition-all duration-150 rounded-sm ${
              hudData.kingDead
                ? 'w-0 bg-stone-800'
                : hudData.kingHp <= 2
                ? 'bg-red-600 animate-pulse shadow-[0_0_12px_#ef4444]'
                : 'bg-red-500 shadow-[0_0_10px_#ef4444]'
            }`}
            style={{ width: `${(Math.max(0, hudData.kingHp) / hudData.kingMaxHp) * 100}%` }}
          />
        </div>
      </div>

      {/* WORLD-MATCHED LOW-OCCLUSION HUD OVERLAY */}
      <div className="pointer-events-none absolute inset-0 p-5 flex flex-col justify-between z-30">
        {/* Top Perimeter Status Cluster */}
        <div className="flex items-start justify-between w-full">
          {/* Top-Left: Player Chutiya Status, Gun & Dash */}
          <div className="flex flex-col gap-1.5 p-3 rounded-lg bg-stone-900/85 border border-stone-800 text-stone-200 backdrop-blur-sm pointer-events-auto shadow-2xl">
            {/* Player Name */}
            <div className="flex items-center justify-between pb-1 border-b border-stone-800">
              <span className="text-xs font-black tracking-widest text-cyan-400 uppercase">PLAYER: CHUTIYA</span>
              <span className="text-[10px] font-mono text-stone-400">FUGITIVE</span>
            </div>

            {/* Stamina */}
            <div className="flex items-center justify-between text-xs font-semibold tracking-wider text-stone-400 pt-1">
              <span className="flex items-center gap-1.5 text-cyan-400">
                <Zap className="w-3.5 h-3.5" />
                DASH STAMINA
              </span>
              <span className="tabular-nums font-mono">{hudData.stamina}%</span>
            </div>
            <div className="w-48 h-2 bg-stone-950 rounded-full overflow-hidden border border-stone-800">
              <div
                className={`h-full transition-all duration-75 ${
                  hudData.stamina >= 30 ? 'bg-cyan-400 shadow-[0_0_8px_#38bdf8]' : 'bg-amber-500'
                }`}
                style={{ width: `${hudData.stamina}%` }}
              />
            </div>

            {/* Gun Status */}
            <div className="flex items-center justify-between text-[11px] pt-1.5 border-t border-stone-800/80">
              <span className="flex items-center gap-1.5 text-amber-400 font-bold">
                <Crosshair className="w-3.5 h-3.5" />
                <span>COMBAT GUN</span>
              </span>
              <div className="flex items-center gap-2">
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                    hudData.isReloading
                      ? 'text-amber-400 bg-amber-950/80 animate-pulse'
                      : hudData.ammo <= 3
                      ? 'text-red-400 bg-red-950/80'
                      : 'text-amber-300 bg-amber-950/60'
                  }`}
                >
                  {hudData.isReloading ? `RELOADING ${hudData.reloadProgress}%` : `AMMO: ${hudData.ammo}/${hudData.maxAmmo}`}
                </span>
                <button
                  onClick={triggerReload}
                  disabled={hudData.isReloading || hudData.ammo === hudData.maxAmmo}
                  title="Reload Gun (R)"
                  className="p-1 rounded bg-stone-800 hover:bg-stone-700 text-stone-300 disabled:opacity-30 cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* Enemies Slain & Palace Respawn Notice */}
            <div className="flex items-center justify-between text-[10px] text-stone-400 font-mono pt-0.5">
              <span>SLAIN PURSUERS:</span>
              <span className="font-bold text-red-400 tabular-nums">
                {hudData.enemiesKilled} (Respawns at Palace)
              </span>
            </div>
          </div>

          {/* Top-Right: Survival Timer, Threat Meter & System Buttons */}
          <div className="flex items-center gap-3">
            {/* Exit Portal Compass */}
            <div className="hidden sm:flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-stone-900/85 border border-stone-800 text-stone-200">
              <div
                className="text-cyan-400 transition-transform duration-100"
                style={{ transform: `rotate(${hudData.portalAngle}rad)` }}
              >
                <Compass className="w-4 h-4 drop-shadow-[0_0_6px_#38bdf8]" />
              </div>
              <div className="text-[11px] font-mono">
                GATE: <strong className="tabular-nums text-cyan-300">{hudData.portalDist}m</strong>
              </div>
            </div>

            {/* Danger meter */}
            <div
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-mono transition-colors ${
                hudData.closestEnemyDist < 180
                  ? 'bg-red-950/80 border-red-600/80 text-red-300 animate-pulse'
                  : hudData.closestEnemyDist < 350
                  ? 'bg-amber-950/80 border-amber-600/60 text-amber-300'
                  : 'bg-stone-900/80 border-stone-800 text-stone-300'
              }`}
            >
              <ShieldAlert className="w-4 h-4 text-red-400" />
              <span>
                PROXIMITY: <strong className="tabular-nums">{hudData.closestEnemyDist}m</strong>
              </span>
            </div>

            {/* Timer readout */}
            <div className="px-3 py-1.5 rounded-lg bg-stone-900/80 border border-stone-800 text-stone-300 text-xs font-mono">
              TIME:{' '}
              <span className="tabular-nums font-semibold text-stone-100">
                {Math.floor(hudData.elapsedSec / 60)}:
                {(hudData.elapsedSec % 60).toString().padStart(2, '0')}
              </span>
            </div>

            {/* Mute button */}
            <button
              onClick={onToggleMute}
              title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
              className="p-2 rounded-lg bg-stone-900/80 hover:bg-stone-800 border border-stone-800 text-stone-300 hover:text-white transition-colors pointer-events-auto cursor-pointer"
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
            </button>

            {/* Pause button */}
            <button
              onClick={onPause}
              title="Pause Game (Esc)"
              className="p-2 rounded-lg bg-stone-900/80 hover:bg-stone-800 border border-stone-800 text-stone-300 hover:text-white transition-colors pointer-events-auto cursor-pointer"
            >
              <Pause className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Bottom Perimeter: Tactical Radar & Threat Warning */}
        <div className="flex items-end justify-between w-full">
          {/* Tactical Mini-Radar */}
          <div className="p-2.5 rounded-lg bg-stone-900/90 border border-stone-800 shadow-xl pointer-events-auto flex flex-col items-center gap-1.5">
            <div className="flex items-center justify-between w-full text-[10px] text-stone-400 uppercase tracking-widest px-1 font-semibold">
              <span>Castle Radar</span>
              <span className="text-red-400 font-bold">
                {hudData.kingDead ? 'KING DEAD' : hudData.kingBursting ? 'KING RAGING' : 'ENEMIES PATROL'}
              </span>
            </div>
            {/* Radar Viewport */}
            <div className="relative w-36 h-24 bg-stone-950 rounded border border-stone-800 overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(34,197,94,0.08)_0%,_transparent_70%)]" />

              {/* Palace Sanctum marker */}
              <div
                className="absolute w-3 h-3 -ml-1.5 -mt-1.5 border border-amber-600/60 bg-amber-900/40 rounded-sm z-5"
                style={{
                  left: `${(PALACE_POS.x / ARENA_WIDTH) * 100}%`,
                  top: `${(PALACE_POS.y / ARENA_HEIGHT) * 100}%`,
                }}
                title="Gaurav's Palace (Enemy Respawn Point)"
              />

              {/* Player Chutiya dot */}
              <div
                className="absolute w-2 h-2 -ml-1 -mt-1 rounded-full bg-cyan-400 shadow-[0_0_6px_#38bdf8] z-10"
                style={{
                  left: `${(playerRef.current.x / ARENA_WIDTH) * 100}%`,
                  top: `${(playerRef.current.y / ARENA_HEIGHT) * 100}%`,
                }}
              />

              {/* Portal marker */}
              <div
                className="absolute w-2.5 h-2.5 -ml-1.25 -mt-1.25 rotate-45 border border-cyan-300 bg-cyan-500/70 shadow-[0_0_8px_#38bdf8] z-10"
                style={{
                  left: `${(portalRef.current.x / ARENA_WIDTH) * 100}%`,
                  top: `${(portalRef.current.y / ARENA_HEIGHT) * 100}%`,
                }}
              />

              {/* Pursuers dots */}
              {enemiesRef.current.map((en) => {
                if (en.isDead) return null;
                const isKing = en.type === 'king';
                return (
                  <div
                    key={en.id}
                    className={`absolute -ml-1 -mt-1 rounded-full z-10 ${
                      isKing
                        ? 'w-2.5 h-2.5 bg-red-500 shadow-[0_0_8px_#ef4444] animate-ping'
                        : en.type === 'brute'
                        ? 'w-2 h-2 bg-purple-500'
                        : 'w-1.5 h-1.5 bg-amber-500'
                    }`}
                    style={{
                      left: `${(en.x / ARENA_WIDTH) * 100}%`,
                      top: `${(en.y / ARENA_HEIGHT) * 100}%`,
                    }}
                  />
                );
              })}
            </div>

            {/* Radar legend */}
            <div className="flex items-center gap-2 text-[9px] text-stone-400">
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" /> Chutiya
              </span>
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500" /> King
              </span>
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" /> Guards
              </span>
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rotate-45 bg-cyan-400" /> Portal
              </span>
            </div>
          </div>

          {/* Quick controls reminder */}
          <div className="text-[11px] text-stone-400 font-mono hidden sm:block bg-stone-900/80 px-3 py-1.5 rounded border border-stone-800">
            WASD: Move · Click / Space / F: Shoot Gun · R: Reload Gun · Shift: Dash · Esc: Pause
          </div>
        </div>
      </div>
    </div>
  );
};
