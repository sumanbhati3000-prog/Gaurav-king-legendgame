import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import {
  Player,
  Enemy,
  Obstacle,
  Torch,
  Portal,
  Difficulty,
  Vector2D,
} from '../types/game';
import { ARENA_WIDTH, ARENA_HEIGHT, WALL_THICKNESS } from './arena';
import {
  createMaterialLibrary,
  MaterialLibrary,
  createPlayerMesh,
  createKingGauravMesh,
  createEnemyMesh,
  createPillarMesh,
  createThroneDaisMesh,
  createPortalMesh,
  createTorchMesh,
} from './threeModels';

export const WORLD_SCALE = 0.1; // 1800 x 1200 arena maps to 180 x 120 3D world

export function toWorldX(x: number): number {
  return (x - ARENA_WIDTH / 2) * WORLD_SCALE;
}

export function toWorldZ(y: number): number {
  return (y - ARENA_HEIGHT / 2) * WORLD_SCALE;
}

export interface ThreeSceneContext {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
  materials: MaterialLibrary;
  playerGroup: THREE.Group;
  gunGroup: THREE.Group;
  muzzleFlashMesh: THREE.Mesh;
  capeMesh: THREE.Mesh;
  enemyMeshes: Map<string, { group: THREE.Group; originalMats: THREE.Material[]; auraLight?: THREE.PointLight; isFlashing: boolean }>;
  portalMesh: { group: THREE.Group; ring1: THREE.Mesh; ring2: THREE.Mesh; light: THREE.PointLight };
  torchLights: THREE.PointLight[];
  bulletPool: THREE.Mesh[];
  particles: {
    points: THREE.Points;
    positions: Float32Array;
    velocities: Float32Array;
    lifetimes: Float32Array;
    colors: Float32Array;
    count: number;
  };
  cameraShake: number;
}

export function setupThreeScene(
  container: HTMLDivElement,
  obstacles: Obstacle[],
  torches: Torch[],
  portal: Portal,
  initialEnemies: Enemy[]
): ThreeSceneContext {
  // 1. Scene & Dark Royal Castle Atmosphere Fog
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x1a0606);
  scene.fog = new THREE.FogExp2(0x1a0606, 0.007);

  // 2. Camera: High-Angle Isometric Action View
  const width = container.clientWidth || window.innerWidth;
  const height = container.clientHeight || window.innerHeight;
  const camera = new THREE.PerspectiveCamera(46, width / height, 0.5, 300);
  camera.position.set(0, 32, 24);

  // 3. Renderer with PBR standards & optimized shadow maps
  const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  container.appendChild(renderer.domElement);

  // 4. Studio Environment Reflection (RoomEnvironment) with safe fallback
  try {
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    pmremGenerator.compileEquirectangularShader();
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();
  } catch {
    // Graceful fallback for headless or restricted WebGL drivers
  }

  // 5. Materials
  const materials = createMaterialLibrary();

  // 6. Lighting Rig
  // Ambient fill
  const hemiLight = new THREE.HemisphereLight(0xef4444, 0x260707, 0.55);
  scene.add(hemiLight);

  // Key Directional Light (Moonlight streaming through castle battlements)
  const dirLight = new THREE.DirectionalLight(0xffedd5, 1.3);
  dirLight.position.set(-30, 45, 20);
  dirLight.castShadow = true;
  dirLight.shadow.mapSize.width = 1024;
  dirLight.shadow.mapSize.height = 1024;
  dirLight.shadow.camera.near = 0.5;
  dirLight.shadow.camera.far = 120;
  const shadowBound = 55;
  dirLight.shadow.camera.left = -shadowBound;
  dirLight.shadow.camera.right = shadowBound;
  dirLight.shadow.camera.top = shadowBound;
  dirLight.shadow.camera.bottom = -shadowBound;
  dirLight.shadow.bias = -0.0005;
  dirLight.shadow.normalBias = 0.02;
  scene.add(dirLight);

  // 7. Ground / Red Castle Courtyard Floor (Prominent, unmistakable vibrant red courtyard)
  const arenaWorldW = ARENA_WIDTH * WORLD_SCALE;
  const arenaWorldH = ARENA_HEIGHT * WORLD_SCALE;
  const floorGeo = new THREE.PlaneGeometry(arenaWorldW, arenaWorldH);
  const floor = new THREE.Mesh(floorGeo, materials.stoneFloor);
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  scene.add(floor);

  // 8. Castle Obstacles & Walls
  obstacles.forEach((obs) => {
    const obsWorldX = toWorldX(obs.x + obs.width / 2);
    const obsWorldZ = toWorldZ(obs.y + obs.height / 2);
    const obsWorldW = obs.width * WORLD_SCALE;
    const obsWorldD = obs.height * WORLD_SCALE;

    if (obs.type === 'wall') {
      const wallH = 6.5;
      const wallGeo = new THREE.BoxGeometry(obsWorldW, wallH, obsWorldD);
      const wall = new THREE.Mesh(wallGeo, materials.castleWall);
      wall.position.set(obsWorldX, wallH / 2, obsWorldZ);
      wall.castShadow = true;
      wall.receiveShadow = true;
      scene.add(wall);

      // Crenelations on top of perimeter walls
      const crenelSize = 2.0;
      if (obsWorldW > obsWorldD) {
        // Horizontal wall crenels
        for (let cx = -obsWorldW / 2 + 1; cx < obsWorldW / 2; cx += crenelSize * 2) {
          const cGeo = new THREE.BoxGeometry(crenelSize, 1.2, obsWorldD);
          const crenel = new THREE.Mesh(cGeo, materials.castleWall);
          crenel.position.set(obsWorldX + cx, wallH + 0.6, obsWorldZ);
          crenel.castShadow = true;
          scene.add(crenel);
        }
      } else {
        // Vertical wall crenels
        for (let cz = -obsWorldD / 2 + 1; cz < obsWorldD / 2; cz += crenelSize * 2) {
          const cGeo = new THREE.BoxGeometry(obsWorldW, 1.2, crenelSize);
          const crenel = new THREE.Mesh(cGeo, materials.castleWall);
          crenel.position.set(obsWorldX, wallH + 0.6, obsWorldZ + cz);
          crenel.castShadow = true;
          scene.add(crenel);
        }
      }
    } else if (obs.type === 'pillar') {
      const pillarGroup = createPillarMesh(obsWorldW, obsWorldD, materials);
      pillarGroup.position.set(obsWorldX, 0, obsWorldZ);
      scene.add(pillarGroup);
    } else if (obs.type === 'throne') {
      const throneGroup = createThroneDaisMesh(materials);
      throneGroup.position.set(obsWorldX, 0, obsWorldZ);
      scene.add(throneGroup);
    }
  });

  // 9. Exit Portal 3D Vortex
  const portalMesh = createPortalMesh(materials);
  portalMesh.group.position.set(toWorldX(portal.x), 0, toWorldZ(portal.y));
  scene.add(portalMesh.group);

  // 10. Torches
  const torchLights: THREE.PointLight[] = [];
  torches.forEach((t) => {
    const torch3D = createTorchMesh(materials);
    torch3D.group.position.set(toWorldX(t.x), 0, toWorldZ(t.y));
    scene.add(torch3D.group);
    torchLights.push(torch3D.light);
  });

  // 11. Player 3D Character
  const playerBuild = createPlayerMesh(materials);
  const playerGroup = playerBuild.group;
  scene.add(playerGroup);

  // 12. 3D Bullets Pool
  const bulletPool: THREE.Mesh[] = [];
  const bulletGeo = new THREE.SphereGeometry(0.24, 8, 8);
  const bulletMat = new THREE.MeshBasicMaterial({ color: 0xfef08a }); // bright glowing bullet tracer
  const bulletGroup = new THREE.Group();
  scene.add(bulletGroup);

  for (let i = 0; i < 35; i++) {
    const bMesh = new THREE.Mesh(bulletGeo, bulletMat);
    bMesh.visible = false;
    bulletGroup.add(bMesh);
    bulletPool.push(bMesh);
  }

  // 13. Enemy 3D Characters
  const enemyMeshes = new Map<
    string,
    { group: THREE.Group; originalMats: THREE.Material[]; auraLight?: THREE.PointLight; isFlashing: boolean }
  >();

  initialEnemies.forEach((en) => {
    if (en.type === 'king') {
      const kingBuild = createKingGauravMesh(materials);
      kingBuild.group.position.set(toWorldX(en.x), 0, toWorldZ(en.y));
      scene.add(kingBuild.group);

      const origMats: THREE.Material[] = [];
      kingBuild.group.traverse((c) => {
        if ((c as THREE.Mesh).isMesh) {
          origMats.push(((c as THREE.Mesh).material as THREE.Material));
        }
      });
      enemyMeshes.set(en.id, {
        group: kingBuild.group,
        originalMats: origMats,
        auraLight: kingBuild.auraLight,
        isFlashing: false,
      });
    } else {
      const enemyBuild = createEnemyMesh(en, materials);
      enemyBuild.group.position.set(toWorldX(en.x), 0, toWorldZ(en.y));
      scene.add(enemyBuild.group);

      const origMats: THREE.Material[] = [];
      enemyBuild.group.traverse((c) => {
        if ((c as THREE.Mesh).isMesh) {
          origMats.push(((c as THREE.Mesh).material as THREE.Material));
        }
      });
      enemyMeshes.set(en.id, {
        group: enemyBuild.group,
        originalMats: origMats,
        isFlashing: false,
      });
    }
  });

  // 14. High-Performance GPU Particle System (Points)
  const particleCount = 450;
  const pGeo = new THREE.BufferGeometry();
  const positions = new Float32Array(particleCount * 3);
  const velocities = new Float32Array(particleCount * 3);
  const lifetimes = new Float32Array(particleCount);
  const colors = new Float32Array(particleCount * 3);

  // Init all offscreen
  for (let i = 0; i < particleCount; i++) {
    positions[i * 3 + 1] = -50;
    lifetimes[i] = 0;
  }

  pGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  pGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  const pMat = new THREE.PointsMaterial({
    size: 0.45,
    vertexColors: true,
    transparent: true,
    opacity: 0.9,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });

  const points = new THREE.Points(pGeo, pMat);
  scene.add(points);

  return {
    scene,
    camera,
    renderer,
    materials,
    playerGroup,
    gunGroup: playerBuild.gunGroup,
    muzzleFlashMesh: playerBuild.muzzleFlashMesh,
    capeMesh: playerBuild.capeMesh,
    enemyMeshes,
    portalMesh,
    torchLights,
    bulletPool,
    particles: {
      points,
      positions,
      velocities,
      lifetimes,
      colors,
      count: particleCount,
    },
    cameraShake: 0,
  };
}

// Spawn 3D Particles helper
export function spawnParticles3D(
  system: ThreeSceneContext['particles'],
  origin: { x: number; y: number; z: number },
  count: number,
  color: THREE.Color,
  speed: number,
  lifespan = 0.8
) {
  let spawned = 0;
  for (let i = 0; i < system.count && spawned < count; i++) {
    if (system.lifetimes[i] <= 0) {
      const idx = i * 3;
      system.positions[idx] = origin.x + (Math.random() - 0.5) * 0.4;
      system.positions[idx + 1] = origin.y + Math.random() * 0.3;
      system.positions[idx + 2] = origin.z + (Math.random() - 0.5) * 0.4;

      const phi = Math.random() * Math.PI * 2;
      const theta = Math.random() * Math.PI;
      const s = speed * (0.6 + Math.random() * 0.8);
      system.velocities[idx] = Math.sin(theta) * Math.cos(phi) * s;
      system.velocities[idx + 1] = Math.abs(Math.cos(theta)) * s * 1.2;
      system.velocities[idx + 2] = Math.sin(theta) * Math.sin(phi) * s;

      system.colors[idx] = color.r;
      system.colors[idx + 1] = color.g;
      system.colors[idx + 2] = color.b;

      system.lifetimes[i] = lifespan;
      spawned++;
    }
  }
}

// Update 3D Particles
export function updateParticles3D(system: ThreeSceneContext['particles'], dt: number) {
  let anyActive = false;
  for (let i = 0; i < system.count; i++) {
    if (system.lifetimes[i] > 0) {
      anyActive = true;
      system.lifetimes[i] -= dt;
      const idx = i * 3;
      system.positions[idx] += system.velocities[idx] * dt;
      system.positions[idx + 1] += system.velocities[idx + 1] * dt;
      system.positions[idx + 2] += system.velocities[idx + 2] * dt;
      // Gravity
      system.velocities[idx + 1] -= 9.8 * dt * 0.4;

      if (system.lifetimes[i] <= 0) {
        system.positions[idx + 1] = -50;
      }
    }
  }

  if (anyActive) {
    system.points.geometry.attributes.position.needsUpdate = true;
    system.points.geometry.attributes.color.needsUpdate = true;
  }
}
